'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, Activity, Zap, Brain, Server, Database, Cloud, Cpu, HardDrive, Network,
  Play, Pause, RotateCcw, Settings, TrendingUp, AlertCircle, CheckCircle2,
  BarChart3, LineChart, Gauge, Wifi, Globe, Shield, Timer, Layers,
  RefreshCw, Download, Upload, Monitor, Users, Lock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

// Enhanced Digital Twin Interfaces
interface DigitalTwinNode {
  id: string
  name: string
  type: 'compute' | 'database' | 'storage' | 'network' | 'container' | 'serverless'
  status: 'active' | 'inactive' | 'syncing' | 'predicting' | 'maintenance' | 'error'
  accuracy: number
  predictions: number
  position: { x: number; y: number }
  connections: string[]
  realTimeMetrics: RealTimeMetrics
  healthScore: number
  lastSync: Date
  predictiveModel: PredictiveModel
}

interface RealTimeMetrics {
  cpu: number
  memory: number
  disk: number
  network: {
    incoming: number
    outgoing: number
  }
  requests: number
  latency: number
  errors: number
  uptime: number
}

interface PredictiveModel {
  nextHourPrediction: {
    cpu: number
    memory: number
    load: number
    confidence: number
  }
  anomalyDetection: {
    isAnomalous: boolean
    confidence: number
    type?: string
  }
  recommendations: string[]
  riskScore: number
}

interface SystemAlert {
  id: string
  twinId: string
  type: 'warning' | 'error' | 'info' | 'success'
  message: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export function EnhancedDigitalTwin() {
  const [twins, setTwins] = useState<DigitalTwinNode[]>([])
  const [isPlaying, setIsPlaying] = useState(true)
  const [isResetting, setIsResetting] = useState(false)
  const [selectedTwin, setSelectedTwin] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced')
  const [totalPredictions, setTotalPredictions] = useState(0)

  // Initialize enhanced digital twins with real-time capabilities
  const initializeDigitalTwins = useCallback(() => {
    const initialTwins: DigitalTwinNode[] = [
      {
        id: 'twin-web-cluster',
        name: 'Web Server Cluster',
        type: 'compute',
        status: 'active',
        accuracy: 94.2,
        predictions: 12,
        position: { x: 120, y: 100 },
        connections: ['twin-database', 'twin-load-balancer', 'twin-cache'],
        healthScore: 92,
        lastSync: new Date(),
        realTimeMetrics: {
          cpu: 45.2,
          memory: 68.5,
          disk: 34.8,
          network: { incoming: 125.4, outgoing: 89.2 },
          requests: 1250,
          latency: 45,
          errors: 2,
          uptime: 99.8
        },
        predictiveModel: {
          nextHourPrediction: {
            cpu: 52.1,
            memory: 71.3,
            load: 1.8,
            confidence: 89.5
          },
          anomalyDetection: {
            isAnomalous: false,
            confidence: 95.2
          },
          recommendations: ['Scale horizontally', 'Optimize queries'],
          riskScore: 15
        }
      },
      {
        id: 'twin-database',
        name: 'Production Database',
        type: 'database',
        status: 'predicting',
        accuracy: 91.8,
        predictions: 8,
        position: { x: 400, y: 80 },
        connections: ['twin-web-cluster', 'twin-storage', 'twin-backup'],
        healthScore: 88,
        lastSync: new Date(Date.now() - 30000),
        realTimeMetrics: {
          cpu: 62.8,
          memory: 78.2,
          disk: 45.6,
          network: { incoming: 89.3, outgoing: 156.7 },
          requests: 890,
          latency: 12,
          errors: 0,
          uptime: 99.9
        },
        predictiveModel: {
          nextHourPrediction: {
            cpu: 68.4,
            memory: 82.1,
            load: 2.1,
            confidence: 92.8
          },
          anomalyDetection: {
            isAnomalous: true,
            confidence: 87.3,
            type: 'High memory usage pattern'
          },
          recommendations: ['Add read replica', 'Implement query caching'],
          riskScore: 35
        }
      },
      {
        id: 'twin-storage',
        name: 'Storage Array',
        type: 'storage',
        status: 'active',
        accuracy: 96.5,
        predictions: 5,
        position: { x: 650, y: 150 },
        connections: ['twin-database', 'twin-backup'],
        healthScore: 95,
        lastSync: new Date(Date.now() - 15000),
        realTimeMetrics: {
          cpu: 15.3,
          memory: 25.6,
          disk: 67.2,
          network: { incoming: 45.2, outgoing: 123.8 },
          requests: 234,
          latency: 8,
          errors: 0,
          uptime: 99.9
        },
        predictiveModel: {
          nextHourPrediction: {
            cpu: 18.1,
            memory: 28.3,
            load: 0.8,
            confidence: 94.7
          },
          anomalyDetection: {
            isAnomalous: false,
            confidence: 98.1
          },
          recommendations: ['Consider compression', 'Archive old data'],
          riskScore: 8
        }
      },
      {
        id: 'twin-load-balancer',
        name: 'Load Balancer',
        type: 'network',
        status: 'syncing',
        accuracy: 89.3,
        predictions: 15,
        position: { x: 120, y: 280 },
        connections: ['twin-web-cluster', 'twin-api-gateway'],
        healthScore: 91,
        lastSync: new Date(Date.now() - 45000),
        realTimeMetrics: {
          cpu: 28.7,
          memory: 45.2,
          disk: 12.8,
          network: { incoming: 234.5, outgoing: 198.3 },
          requests: 2100,
          latency: 3,
          errors: 1,
          uptime: 99.7
        },
        predictiveModel: {
          nextHourPrediction: {
            cpu: 32.4,
            memory: 48.9,
            load: 1.2,
            confidence: 88.2
          },
          anomalyDetection: {
            isAnomalous: false,
            confidence: 91.8
          },
          recommendations: ['Add health checks', 'Configure auto-scaling'],
          riskScore: 12
        }
      },
      {
        id: 'twin-api-gateway',
        name: 'API Gateway',
        type: 'network',
        status: 'active',
        accuracy: 93.7,
        predictions: 18,
        position: { x: 400, y: 280 },
        connections: ['twin-load-balancer', 'twin-microservices'],
        healthScore: 94,
        lastSync: new Date(Date.now() - 10000),
        realTimeMetrics: {
          cpu: 38.4,
          memory: 52.1,
          disk: 18.9,
          network: { incoming: 345.2, outgoing: 289.6 },
          requests: 3200,
          latency: 25,
          errors: 5,
          uptime: 99.6
        },
        predictiveModel: {
          nextHourPrediction: {
            cpu: 42.1,
            memory: 55.8,
            load: 1.5,
            confidence: 90.3
          },
          anomalyDetection: {
            isAnomalous: false,
            confidence: 93.5
          },
          recommendations: ['Rate limiting', 'API versioning'],
          riskScore: 18
        }
      },
      {
        id: 'twin-microservices',
        name: 'Microservices Cluster',
        type: 'container',
        status: 'active',
        accuracy: 87.9,
        predictions: 25,
        position: { x: 650, y: 280 },
        connections: ['twin-api-gateway', 'twin-cache'],
        healthScore: 89,
        lastSync: new Date(Date.now() - 20000),
        realTimeMetrics: {
          cpu: 56.8,
          memory: 71.4,
          disk: 28.3,
          network: { incoming: 189.7, outgoing: 234.1 },
          requests: 1890,
          latency: 35,
          errors: 8,
          uptime: 99.4
        },
        predictiveModel: {
          nextHourPrediction: {
            cpu: 61.2,
            memory: 75.9,
            load: 2.3,
            confidence: 86.7
          },
          anomalyDetection: {
            isAnomalous: true,
            confidence: 82.4,
            type: 'Memory leak detected'
          },
          recommendations: ['Restart containers', 'Memory optimization'],
          riskScore: 42
        }
      }
    ]
    
    setTwins(initialTwins)
    setTotalPredictions(initialTwins.reduce((sum, twin) => sum + twin.predictions, 0))
  }, [])

  // Real-time metrics update simulation
  const updateRealTimeMetrics = useCallback(() => {
    if (!isPlaying) return

    setSyncStatus('syncing')
    
    setTwins(prev => prev.map(twin => {
      const now = Date.now()
      const timeVariation = Math.sin(now / 20000) * 10
      const randomFactor = (Math.random() - 0.5) * 5
      
      // Simulate realistic metric variations
      const updatedMetrics: RealTimeMetrics = {
        cpu: Math.max(5, Math.min(95, twin.realTimeMetrics.cpu + timeVariation + randomFactor)),
        memory: Math.max(10, Math.min(90, twin.realTimeMetrics.memory + timeVariation * 0.8 + randomFactor * 0.6)),
        disk: Math.max(5, Math.min(85, twin.realTimeMetrics.disk + (Math.random() - 0.5) * 0.5)),
        network: {
          incoming: Math.max(0, twin.realTimeMetrics.network.incoming + (Math.random() - 0.5) * 50),
          outgoing: Math.max(0, twin.realTimeMetrics.network.outgoing + (Math.random() - 0.5) * 40)
        },
        requests: Math.max(0, twin.realTimeMetrics.requests + Math.floor((Math.random() - 0.5) * 200)),
        latency: Math.max(1, Math.min(200, twin.realTimeMetrics.latency + (Math.random() - 0.5) * 10)),
        errors: Math.max(0, twin.realTimeMetrics.errors + Math.floor((Math.random() - 0.8) * 3)),
        uptime: Math.max(95, Math.min(100, twin.realTimeMetrics.uptime + (Math.random() - 0.5) * 0.1))
      }

      // Update predictive model
      const updatedPredictive: PredictiveModel = {
        nextHourPrediction: {
          cpu: Math.max(0, Math.min(100, updatedMetrics.cpu + Math.random() * 20 - 10)),
          memory: Math.max(0, Math.min(100, updatedMetrics.memory + Math.random() * 15 - 7.5)),
          load: Math.max(0.1, Math.min(5, 1 + Math.random() * 2)),
          confidence: Math.max(70, Math.min(99, 85 + Math.random() * 14))
        },
        anomalyDetection: {
          isAnomalous: Math.random() > 0.85,
          confidence: Math.max(70, Math.min(99, 80 + Math.random() * 19)),
          type: Math.random() > 0.5 ? 'Resource spike detected' : 'Unusual pattern detected'
        },
        recommendations: [
          'Optimize resource allocation',
          'Consider auto-scaling',
          'Review performance metrics',
          'Update configuration'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        riskScore: Math.floor(Math.random() * 50)
      }

      // Calculate health score based on metrics
      const healthScore = Math.round(
        (100 - updatedMetrics.cpu * 0.3) * 0.3 +
        (100 - updatedMetrics.memory * 0.4) * 0.3 +
        updatedMetrics.uptime * 0.2 +
        (100 - updatedMetrics.errors * 5) * 0.2
      )

      // Update status based on health and metrics
      let newStatus = twin.status
      if (updatedMetrics.cpu > 90 || updatedMetrics.memory > 90) {
        newStatus = 'error'
      } else if (updatedPredictive.anomalyDetection.isAnomalous) {
        newStatus = 'predicting'
      } else if (healthScore > 85) {
        newStatus = 'active'
      } else if (healthScore < 70) {
        newStatus = 'maintenance'
      }

      // Generate alerts for critical conditions
      if (updatedMetrics.cpu > 85 && Math.random() > 0.7) {
        const alert: SystemAlert = {
          id: `alert-${Date.now()}-${twin.id}`,
          twinId: twin.id,
          type: 'warning',
          message: `High CPU usage detected: ${updatedMetrics.cpu.toFixed(1)}%`,
          timestamp: new Date(),
          severity: updatedMetrics.cpu > 90 ? 'high' : 'medium'
        }
        setSystemAlerts(prev => [alert, ...prev].slice(0, 10))
      }

      return {
        ...twin,
        realTimeMetrics: updatedMetrics,
        predictiveModel: updatedPredictive,
        healthScore,
        status: newStatus,
        lastSync: new Date(),
        accuracy: Math.max(70, Math.min(99, twin.accuracy + (Math.random() - 0.5) * 2)),
        predictions: Math.max(0, twin.predictions + Math.floor((Math.random() - 0.6) * 5))
      }
    }))

    // Update total predictions
    setTotalPredictions(prev => Math.max(0, prev + Math.floor((Math.random() - 0.5) * 10)))
    setLastUpdate(new Date())
    
    setTimeout(() => setSyncStatus('synced'), 500)
  }, [isPlaying])

  // Initialize twins on component mount
  useEffect(() => {
    initializeDigitalTwins()
  }, [initializeDigitalTwins])

  // Real-time updates
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(updateRealTimeMetrics, 3000) // Update every 3 seconds
    return () => clearInterval(interval)
  }, [isPlaying, updateRealTimeMetrics])

  // Memoized calculations for performance
  const systemStats = useMemo(() => {
    const totalTwins = twins.length
    const activeTwins = twins.filter(t => t.status === 'active').length
    const averageAccuracy = twins.reduce((sum, t) => sum + t.accuracy, 0) / totalTwins || 0
    const averageHealth = twins.reduce((sum, t) => sum + t.healthScore, 0) / totalTwins || 0
    const criticalAlerts = systemAlerts.filter(a => a.severity === 'high' || a.severity === 'critical').length

    return {
      totalTwins,
      activeTwins,
      averageAccuracy,
      averageHealth,
      criticalAlerts,
      syncStatus: syncStatus
    }
  }, [twins, systemAlerts, syncStatus])

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'compute': return <Server className="w-6 h-6" />
      case 'database': return <Database className="w-6 h-6" />
      case 'storage': return <HardDrive className="w-6 h-6" />
      case 'network': return <Network className="w-6 h-6" />
      case 'container': return <Layers className="w-6 h-6" />
      case 'serverless': return <Zap className="w-6 h-6" />
      default: return <Cpu className="w-6 h-6" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 border-green-500 shadow-green-500/20'
      case 'predicting': return 'text-blue-500 border-blue-500 shadow-blue-500/20'
      case 'syncing': return 'text-yellow-500 border-yellow-500 shadow-yellow-500/20'
      case 'maintenance': return 'text-orange-500 border-orange-500 shadow-orange-500/20'
      case 'error': return 'text-red-500 border-red-500 shadow-red-500/20'
      case 'inactive': return 'text-gray-500 border-gray-500 shadow-gray-500/20'
      default: return 'text-gray-500 border-gray-500 shadow-gray-500/20'
    }
  }

  const getStatusAnimation = (status: string) => {
    switch (status) {
      case 'active': return 'animate-pulse'
      case 'predicting': return 'animate-bounce'
      case 'syncing': return 'animate-spin'
      case 'error': return 'animate-ping'
      default: return ''
    }
  }

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-600'
    if (health >= 75) return 'text-yellow-600'
    if (health >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const resetSystem = async () => {
    setIsResetting(true)
    toast.info('Resetting Digital Twin ecosystem...')
    
    setSyncStatus('syncing')
    setSystemAlerts([])
    
    // Reset all twins to syncing state
    setTwins(prev => prev.map(twin => ({
      ...twin,
      status: 'syncing' as const,
      accuracy: 0,
      predictions: 0,
      healthScore: 0
    })))

    // Simulate reset process
    setTimeout(() => {
      initializeDigitalTwins()
      setSyncStatus('synced')
      setIsResetting(false)
      toast.success('Digital Twin ecosystem reset successfully!')
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {/* System Overview Dashboard */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-xl">Digital Twin Infrastructure</CardTitle>
              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                Virtual replicas of your cloud infrastructure
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 text-sm ${
                syncStatus === 'synced' ? 'text-green-600' : 
                syncStatus === 'syncing' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  syncStatus === 'synced' ? 'bg-green-500' : 
                  syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className="capitalize">{syncStatus}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Last update: {lastUpdate.toLocaleTimeString()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <motion.div 
              className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
              whileHover={{ scale: 1.02 }}
            >
              <Server className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-blue-600">{systemStats.totalTwins}</div>
              <div className="text-xs text-slate-600">Total Twins</div>
            </motion.div>

            <motion.div 
              className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20"
              whileHover={{ scale: 1.02 }}
            >
              <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-green-600">{systemStats.activeTwins}</div>
              <div className="text-xs text-slate-600">Active</div>
            </motion.div>

            <motion.div 
              className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20"
              whileHover={{ scale: 1.02 }}
            >
              <Brain className="w-5 h-5 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-purple-600">{systemStats.averageAccuracy.toFixed(1)}%</div>
              <div className="text-xs text-slate-600">Avg Accuracy</div>
            </motion.div>

            <motion.div 
              className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
              whileHover={{ scale: 1.02 }}
            >
              <Gauge className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
              <div className={`text-lg font-bold ${getHealthColor(systemStats.averageHealth)}`}>
                {systemStats.averageHealth.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-600">Health Score</div>
            </motion.div>

            <motion.div 
              className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20"
              whileHover={{ scale: 1.02 }}
            >
              <TrendingUp className="w-5 h-5 text-orange-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-orange-600">{totalPredictions}</div>
              <div className="text-xs text-slate-600">Predictions</div>
            </motion.div>

            <motion.div 
              className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20"
              whileHover={{ scale: 1.02 }}
            >
              <AlertCircle className="w-5 h-5 text-red-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-red-600">{systemStats.criticalAlerts}</div>
              <div className="text-xs text-slate-600">Alerts</div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Main Digital Twin Visualization */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-digital-twin" />
              <CardTitle>Digital Twin Ecosystem</CardTitle>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Wifi className="w-4 h-4" />
                <span>Real-time Synchronization</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={isPlaying ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setIsPlaying(!isPlaying)
                  toast.success(isPlaying ? 'Real-time updates paused' : 'Real-time updates resumed')
                }}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isResetting}
                onClick={resetSystem}
              >
                <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
                {isResetting ? 'Resetting...' : 'Reset'}
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
                Configure
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[500px] bg-gradient-to-br from-background to-muted/20 rounded-lg border overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                    <path d="M 25 0 L 0 0 0 25" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full">
              {twins.map(twin => 
                twin.connections.map(connectionId => {
                  const connectedTwin = twins.find(t => t.id === connectionId)
                  if (!connectedTwin) return null
                  
                  return (
                    <motion.line
                      key={`${twin.id}-${connectionId}`}
                      x1={twin.position.x + 50}
                      y1={twin.position.y + 50}
                      x2={connectedTwin.position.x + 50}
                      y2={connectedTwin.position.y + 50}
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-muted-foreground/30"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: Math.random() * 0.5 }}
                    />
                  )
                })
              )}
            </svg>

            {/* Digital Twin Nodes */}
            <AnimatePresence>
              {twins.map((twin, index) => (
                <motion.div
                  key={twin.id}
                  className={`absolute cursor-pointer ${selectedTwin === twin.id ? 'z-20' : 'z-10'}`}
                  style={{ 
                    left: twin.position.x, 
                    top: twin.position.y 
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedTwin(selectedTwin === twin.id ? null : twin.id)
                    toast.info(`${selectedTwin === twin.id ? 'Deselected' : 'Selected'} ${twin.name}`)
                  }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Node Circle */}
                  <div className={`
                    relative w-24 h-24 rounded-full border-2 bg-background/95 backdrop-blur-sm
                    flex items-center justify-center transition-all duration-300 shadow-lg
                    ${getStatusColor(twin.status)}
                    ${selectedTwin === twin.id ? 'ring-4 ring-blue-500/50 scale-110' : ''}
                  `}>
                    <div className={getStatusAnimation(twin.status)}>
                      {getNodeIcon(twin.type)}
                    </div>
                    
                    {/* Status Indicator */}
                    <div className={`
                      absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-background
                      ${twin.status === 'active' ? 'bg-green-500' : 
                        twin.status === 'predicting' ? 'bg-blue-500' :
                        twin.status === 'syncing' ? 'bg-yellow-500' : 
                        twin.status === 'error' ? 'bg-red-500' : 'bg-gray-500'}
                    `} />

                    {/* Health Score */}
                    <div className={`
                      absolute -bottom-1 left-1/2 transform -translate-x-1/2 
                      bg-background border rounded-full px-2 py-1 text-xs font-mono
                      ${getHealthColor(twin.healthScore)}
                    `}>
                      {twin.healthScore}%
                    </div>
                  </div>

                  {/* Node Label */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 
                                text-center text-xs font-medium whitespace-nowrap max-w-32">
                    {twin.name}
                  </div>

                  {/* Accuracy Badge */}
                  <motion.div
                    className="absolute -top-10 left-1/2 transform -translate-x-1/2 
                             bg-digital-twin text-white text-xs px-2 py-1 rounded-full"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {twin.accuracy.toFixed(1)}%
                  </motion.div>

                  {/* Predictions Counter */}
                  {twin.predictions > 0 && (
                    <motion.div
                      className="absolute -top-6 -right-6 bg-orange-500 text-white text-xs 
                               w-6 h-6 rounded-full flex items-center justify-center font-bold"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {twin.predictions}
                    </motion.div>
                  )}

                  {/* Real-time Metrics Mini Display */}
                  <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 
                                bg-background/90 border rounded p-1 text-xs space-y-1 min-w-16">
                    <div className="flex justify-between">
                      <span>CPU:</span>
                      <span className="font-mono">{twin.realTimeMetrics.cpu.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MEM:</span>
                      <span className="font-mono">{twin.realTimeMetrics.memory.toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Detailed Info Panel */}
                  <AnimatePresence>
                    {selectedTwin === twin.id && (
                      <motion.div
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-12 
                                 bg-background border rounded-lg p-4 shadow-xl z-30 w-80 max-h-96 overflow-y-auto"
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      >
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="border-b pb-3">
                            <h4 className="font-semibold text-lg flex items-center">
                              {getNodeIcon(twin.type)}
                              <span className="ml-2">{twin.name}</span>
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`capitalize ${getStatusColor(twin.status)}`}>
                                {twin.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Last sync: {twin.lastSync.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>

                          {/* Real-time Metrics */}
                          <div>
                            <h5 className="font-medium mb-2 flex items-center">
                              <BarChart3 className="w-4 h-4 mr-1" />
                              Real-time Metrics
                            </h5>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span>CPU:</span>
                                  <span className="font-mono">{twin.realTimeMetrics.cpu.toFixed(1)}%</span>
                                </div>
                                <Progress value={twin.realTimeMetrics.cpu} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span>Memory:</span>
                                  <span className="font-mono">{twin.realTimeMetrics.memory.toFixed(1)}%</span>
                                </div>
                                <Progress value={twin.realTimeMetrics.memory} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span>Disk:</span>
                                  <span className="font-mono">{twin.realTimeMetrics.disk.toFixed(1)}%</span>
                                </div>
                                <Progress value={twin.realTimeMetrics.disk} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span>Uptime:</span>
                                  <span className="font-mono">{twin.realTimeMetrics.uptime.toFixed(2)}%</span>
                                </div>
                                <Progress value={twin.realTimeMetrics.uptime} className="h-2" />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                              <div className="flex justify-between">
                                <span>Requests/sec:</span>
                                <span className="font-mono">{twin.realTimeMetrics.requests}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Latency:</span>
                                <span className="font-mono">{twin.realTimeMetrics.latency}ms</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Network In:</span>
                                <span className="font-mono">{twin.realTimeMetrics.network.incoming.toFixed(1)} MB/s</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Network Out:</span>
                                <span className="font-mono">{twin.realTimeMetrics.network.outgoing.toFixed(1)} MB/s</span>
                              </div>
                            </div>
                          </div>

                          {/* Predictive Analytics */}
                          <div>
                            <h5 className="font-medium mb-2 flex items-center">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              Next Hour Prediction
                            </h5>
                            <div className="bg-muted/50 rounded p-3 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>CPU:</span>
                                <span className="font-mono">{twin.predictiveModel.nextHourPrediction.cpu.toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Memory:</span>
                                <span className="font-mono">{twin.predictiveModel.nextHourPrediction.memory.toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Load:</span>
                                <span className="font-mono">{twin.predictiveModel.nextHourPrediction.load.toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Confidence:</span>
                                <span className="font-mono text-green-600">
                                  {twin.predictiveModel.nextHourPrediction.confidence.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Anomaly Detection */}
                          {twin.predictiveModel.anomalyDetection.isAnomalous && (
                            <div>
                              <h5 className="font-medium mb-2 flex items-center text-orange-600">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Anomaly Detected
                              </h5>
                              <div className="bg-orange-50 border border-orange-200 rounded p-3 text-sm">
                                <div className="flex justify-between mb-2">
                                  <span>Type:</span>
                                  <span className="font-medium">{twin.predictiveModel.anomalyDetection.type}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Confidence:</span>
                                  <span className="font-mono">{twin.predictiveModel.anomalyDetection.confidence.toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Recommendations */}
                          <div>
                            <h5 className="font-medium mb-2 flex items-center">
                              <Brain className="w-4 h-4 mr-1" />
                              AI Recommendations
                            </h5>
                            <div className="space-y-1">
                              {twin.predictiveModel.recommendations.map((rec, idx) => (
                                <div key={idx} className="text-sm bg-blue-50 border border-blue-200 rounded px-2 py-1">
                                  • {rec}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Risk Assessment */}
                          <div>
                            <h5 className="font-medium mb-2 flex items-center">
                              <Shield className="w-4 h-4 mr-1" />
                              Risk Assessment
                            </h5>
                            <div className="flex items-center space-x-2">
                              <Progress 
                                value={twin.predictiveModel.riskScore} 
                                className="flex-1 h-3"
                              />
                              <span className={`font-mono text-sm ${
                                twin.predictiveModel.riskScore < 20 ? 'text-green-600' :
                                twin.predictiveModel.riskScore < 50 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {twin.predictiveModel.riskScore}/100
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Data Flow Animation */}
            {isPlaying && (
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-digital-twin rounded-full opacity-70"
                    animate={{
                      x: [0, 700, 0],
                      y: [120, 300, 120],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      delay: i * 0.8,
                      ease: "linear"
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Legend and Status */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Predicting</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Syncing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Maintenance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Error</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span>Inactive</span>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Click on any twin for detailed analytics
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Alerts Panel */}
      {systemAlerts.length > 0 && (
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span>System Alerts</span>
              <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                {systemAlerts.length} Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {systemAlerts.slice(0, 5).map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-2 rounded border text-sm ${
                    alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                    alert.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                    alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle className={`w-4 h-4 ${
                      alert.severity === 'critical' ? 'text-red-600' :
                      alert.severity === 'high' ? 'text-orange-600' :
                      alert.severity === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                    <span>{alert.message}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
