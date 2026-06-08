import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { AuthService } from './auth'
import type { Socket } from 'socket.io'

export interface AuthenticatedSocket extends Socket {
  userId?: string
  userRole?: string
}

let io: SocketIOServer | null = null

export function initializeWebSocket(httpServer: HTTPServer) {
  if (io) return io

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXTAUTH_URL 
        : "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  })

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return next(new Error('Authentication token required'))
      }

      const user = AuthService.verifyToken(token)
      if (!user) {
        return next(new Error('Invalid token'))
      }

      socket.userId = user.id
      socket.userRole = user.role
      next()
    } catch (error) {
      next(new Error('Authentication failed'))
    }
  })

  // Connection handling
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`🔌 User ${socket.userId} connected via WebSocket`)

    // Join user-specific room
    socket.join(`user:${socket.userId}`)

    // Join role-based rooms
    if (socket.userRole === 'ADMIN') {
      socket.join('admins')
    }

    // Handle real-time metric subscriptions
    socket.on('subscribe:metrics', (resourceId: string) => {
      socket.join(`metrics:${resourceId}`)
      console.log(`📊 User ${socket.userId} subscribed to metrics for ${resourceId}`)
    })

    socket.on('unsubscribe:metrics', (resourceId: string) => {
      socket.leave(`metrics:${resourceId}`)
      console.log(`📊 User ${socket.userId} unsubscribed from metrics for ${resourceId}`)
    })

    // Handle alert subscriptions
    socket.on('subscribe:alerts', () => {
      socket.join('alerts')
      console.log(`🚨 User ${socket.userId} subscribed to alerts`)
    })

    socket.on('unsubscribe:alerts', () => {
      socket.leave('alerts')
      console.log(`🚨 User ${socket.userId} unsubscribed from alerts`)
    })

    // Handle cloud resource subscriptions
    socket.on('subscribe:resources', (accountId?: string) => {
      const room = accountId ? `resources:${accountId}` : 'resources'
      socket.join(room)
      console.log(`☁️ User ${socket.userId} subscribed to resources: ${room}`)
    })

    socket.on('disconnect', () => {
      console.log(`🔌 User ${socket.userId} disconnected from WebSocket`)
    })
  })

  return io
}

export function getWebSocketServer(): SocketIOServer | null {
  return io
}

// Utility functions for broadcasting
// Client-side WebSocket client (mock for development)
export class WSClient {
  private listeners: Record<string, Function[]> = {}
  private connected = false

  connect() {
    this.connected = true
    // Use setTimeout to ensure listeners are set up first
    setTimeout(() => {
      this.emit('connection', { status: 'connected' })
    }, 100)
  }

  disconnect() {
    this.connected = false
    this.emit('connection', { status: 'disconnected' })
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
    }
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data))
    }
  }

  isConnected() {
    return this.connected
  }

  // Mock method to simulate receiving metrics
  simulateMetrics(data: any) {
    this.emit('metrics', data)
  }
}

export const wsClient = new WSClient()

// Mock data generator for development
export class MockDataGenerator {
  private interval: NodeJS.Timeout | null = null
  private isRunning = false

  start() {
    if (this.isRunning) return
    this.isRunning = true

    this.interval = setInterval(() => {
      const mockData = {
        resourceId: 'demo-resource-1',
        timestamp: new Date().toISOString(),
        data: {
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          disk: Math.random() * 100,
          network: Math.random() * 1000,
          requests: Math.floor(Math.random() * 1000),
          errors: Math.floor(Math.random() * 10),
          latency: Math.random() * 500
        }
      }
      wsClient.simulateMetrics(mockData)
    }, 2000) // Update every 2 seconds
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    this.isRunning = false
  }
}

export const mockDataGenerator = new MockDataGenerator()

export class WebSocketService {
  static broadcastMetrics(resourceId: string, metrics: any) {
    if (!io) return
    io.to(`metrics:${resourceId}`).emit('metrics:update', {
      resourceId,
      metrics,
      timestamp: new Date().toISOString()
    })
  }

  static broadcastAlert(alert: any) {
    if (!io) return
    io.to('alerts').emit('alert:new', {
      ...alert,
      timestamp: new Date().toISOString()
    })
  }

  static broadcastResourceUpdate(accountId: string, resource: any) {
    if (!io) return
    io.to(`resources:${accountId}`).emit('resource:update', {
      accountId,
      resource,
      timestamp: new Date().toISOString()
    })
  }

  static broadcastToUser(userId: string, event: string, data: any) {
    if (!io) return
    io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    })
  }

  static broadcastToAdmins(event: string, data: any) {
    if (!io) return
    io.to('admins').emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    })
  }
}