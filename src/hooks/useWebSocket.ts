import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface UseWebSocketOptions {
  autoConnect?: boolean
  token?: string
}

interface WebSocketState {
  connected: boolean
  connecting: boolean
  error: string | null
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { autoConnect = true, token } = options
  const socketRef = useRef<Socket | null>(null)
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    connecting: false,
    error: null
  })

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return

    setState(prev => ({ ...prev, connecting: true, error: null }))

    const socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
      console.log('🔌 WebSocket connected')
      setState({ connected: true, connecting: false, error: null })
    })

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected')
      setState(prev => ({ ...prev, connected: false, connecting: false }))
    })

    socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error)
      setState({ connected: false, connecting: false, error: error.message })
    })

    socketRef.current = socket
  }, [token])

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setState({ connected: false, connecting: false, error: null })
  }

  const emit = (event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    }
  }

  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
  }

  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback)
    }
  }

  useEffect(() => {
    if (autoConnect && token) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, token, connect])

  return {
    ...state,
    connect,
    disconnect,
    emit,
    on,
    off,
    socket: socketRef.current
  }
}
