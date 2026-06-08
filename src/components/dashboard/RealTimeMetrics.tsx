'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, TrendingUp, TrendingDown, Zap, Cpu, HardDrive, Network, MemoryStick, 
  Clock, Users, AlertTriangle, Database, Cloud, Server, Globe, Container,
  ChevronDown, RefreshCw, Play, Pause, Monitor, Wifi, Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

interface MetricData {
  timestamp: string
  cpu: number
  memory: number
  disk: number
  network: number
  load?: number
  processes?: number
  uptime?: number
}

interface DataSource {
  id: string
  name: string
  type: 'system' | 'docker' | 'api' | 'cloud'
  enabled: boolean
  status: 'connected' | 'disconnected' | 'error'
  lastUpdate?: string
  icon: React.ReactNode
  description: string
}

interface SystemHealth {
  status: 'optimal' | 'warning' | 'critical'
  responseTime: number
  throughput: number
  errorRate: number
  activeConnections: number
  queueLength: number
}


export function RealTimeMetrics() {
  const [activeDataSource, setActiveDataSource] = useState('system')
  const [metrics, setMetrics] = useState<MetricData[]>([])
  const [currentMetrics, setCurrentMetrics] = useState<MetricData>({
    timestamp: '',
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    load: 0,
    processes: 0,
    uptime: 0
  })
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'optimal',
    responseTime: 127,
    throughput: 2847,
    errorRate: 0.02,
    activeConnections: 1234,
    queueLength: 12
  })
  const [isLive, setIsLive] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const dataSources: DataSource[] = [
    {
      id: 'system',
      name: 'Local System',
      type: 'system',
      enabled: true,
      status: 'connected',
      icon: <Monitor className="w-4 h-4" />,
      description: 'Real-time system metrics from host machine'
    },
    {
      id: 'docker',
      name: 'Docker Containers',
      type: 'docker',
      enabled: true,
      status: 'connected',
      icon: <Container className="w-4 h-4" />,
      description: 'Live container resource usage and statistics'
    },
    {
      id: 'apis',
      name: 'External APIs',
      type: 'api',
      enabled: true,
      status: 'connected',
      icon: <Globe className="w-4 h-4" />,
      description: 'Weather, GitHub, crypto market data'
    },
    {
      id: 'cloud',
      name: 'Cloud Resources',
      type: 'cloud',
      enabled: false,
      status: 'disconnected',
      icon: <Cloud className="w-4 h-4" />,
      description: 'DigitalOcean, Linode, AWS resources'
    }
  ]


  // Generate realistic metrics based on data source
  const generateMetricsForSource = (sourceId: string): MetricData => {
    const now = new Date()
    const baseMetrics = {
      timestamp: now.toISOString(),
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0,
      load: 0,
      processes: 0,
      uptime: 0
    }

    switch (sourceId) {
      case 'system':
        return {
          ...baseMetrics,
          cpu: 35 + Math.sin(Date.now() / 10000) * 15 + Math.random() * 10,
          memory: 60 + Math.cos(Date.now() / 8000) * 20 + Math.random() * 15,
          disk: 20 + Math.sin(Date.now() / 15000) * 10 + Math.random() * 8,
          network: 30 + Math.random() * 40,
          load: 1.2 + Math.random() * 0.8,
          processes: 180 + Math.floor(Math.random() * 40),
          uptime: 87321 // seconds
        }
      case 'docker':
        return {
          ...baseMetrics,
          cpu: 25 + Math.sin(Date.now() / 12000) * 20 + Math.random() * 15,
          memory: 45 + Math.cos(Date.now() / 9000) * 25 + Math.random() * 10,
          disk: 15 + Math.sin(Date.now() / 18000) * 8 + Math.random() * 6,
          network: 20 + Math.random() * 30,
          load: 0.8 + Math.random() * 0.6,
          processes: 12 + Math.floor(Math.random() * 8), // containers
          uptime: 43200
        }
      case 'apis':
        return {
          ...baseMetrics,
          cpu: 5 + Math.random() * 10, // Low usage for API calls
          memory: 15 + Math.random() * 10,
          disk: 5 + Math.random() * 5,
          network: 50 + Math.random() * 30, // Higher network for API calls
          load: 0.2 + Math.random() * 0.3,
          processes: 4, // API processes
          uptime: 21600
        }
      case 'cloud':
        return {
          ...baseMetrics,
          cpu: 40 + Math.sin(Date.now() / 11000) * 25 + Math.random() * 20,
          memory: 70 + Math.cos(Date.now() / 7000) * 15 + Math.random() * 12,
          disk: 35 + Math.sin(Date.now() / 14000) * 15 + Math.random() * 10,
          network: 45 + Math.random() * 35,
          load: 1.8 + Math.random() * 1.2,
          processes: 250 + Math.floor(Math.random() * 50),
          uptime: 259200
        }
      default:
        return baseMetrics
    }
  }

  // Simulate real-time data updates
  useEffect(() => {
    // Initial data
    const initialData = Array.from({ length: 20 }, () => generateMetricsForSource(activeDataSource))
    setMetrics(initialData)
    setCurrentMetrics(initialData[initialData.length - 1])
    setIsLoading(false)

    // Update every 3 seconds if live
    let interval: NodeJS.Timeout
    if (isLive) {
      interval = setInterval(() => {
        const newMetric = generateMetricsForSource(activeDataSource)
        setMetrics(prev => [...prev.slice(-19), newMetric])
        setCurrentMetrics(newMetric)
        
        // Update system health
        setSystemHealth(prev => ({
          ...prev,
          responseTime: 100 + Math.random() * 50,
          throughput: 2500 + Math.random() * 700,
          errorRate: Math.random() * 0.1,
          activeConnections: 1000 + Math.floor(Math.random() * 500),
          queueLength: Math.floor(Math.random() * 20)
        }))
      }, 3000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeDataSource, isLive])

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const getMetricColor = (value: number) => {
    if (value > 80) return 'text-red-500'
    if (value > 60) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'cpu': return <Cpu className="w-4 h-4" />
      case 'memory': return <MemoryStick className="w-4 h-4" />
      case 'disk': return <HardDrive className="w-4 h-4" />
      case 'network': return <Network className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'performance': return '📈'
      case 'cost': return '💰'
      case 'security': return '🔒'
      case 'capacity': return '📊'
      case 'failure': return '❌'
      case 'compliance': return '📋'
      default: return '⚠️'
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-500/5'
      case 'high': return 'border-orange-500 bg-orange-500/5'
      case 'medium': return 'border-yellow-500 bg-yellow-500/5'
      case 'low': return 'border-blue-500 bg-blue-500/5'
      default: return 'border-black/20 bg-black/5 dark:border-white/20 dark:bg-white/5'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500'
      case 'disconnected': return 'text-black/50 dark:text-white/50'
      case 'error': return 'text-red-500'
      default: return 'text-black/50 dark:text-white/50'
    }
  }


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <span>Real-Time Overview</span>
            <Badge variant="outline" className="animate-pulse">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Data Source Switcher */}
      <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span>Real-Time Overview</span>
              <Badge variant="secondary" className="animate-pulse bg-green-500/10 text-green-500">
                Live metrics and predictive alerts
              </Badge>
            </CardTitle>
          <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLive(!isLive)}
                className="flex items-center space-x-1"
              >
                {isLive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isLive ? 'Pause' : 'Start'}</span>
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-3 h-3" />
              </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {dataSources.map((source) => (
              <motion.button
                key={source.id}
                onClick={() => setActiveDataSource(source.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  activeDataSource === source.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {source.icon}
                    <span className="font-medium text-sm">{source.name}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(source.status)}`} />
                </div>
                <p className="text-xs text-muted-foreground">{source.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-xs">{source.type.toUpperCase()}</Badge>
                  <Switch checked={source.enabled} />
              </div>
              </motion.button>
            ))}
              </div>
        </CardContent>
      </Card>

      {/* Real-time System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>Real-time {dataSources.find(s => s.id === activeDataSource)?.name} Metrics</span>
              <Badge variant="secondary" className="animate-pulse bg-green-500/10 text-green-500">Live</Badge>
              </div>
            <div className="text-xs text-muted-foreground">
              {formatTime(currentMetrics.timestamp)}
              </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'cpu', label: 'CPU Usage', value: currentMetrics.cpu, unit: '%' },
              { key: 'memory', label: 'Memory', value: currentMetrics.memory, unit: '%' },
              { key: 'disk', label: 'Disk I/O', value: currentMetrics.disk, unit: '%' },
              { key: 'network', label: 'Network', value: currentMetrics.network, unit: '%' }
            ].map((metric) => (
            <motion.div
                key={metric.key}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className="bg-muted/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getMetricIcon(metric.key)}
                    <span className="text-sm font-medium">{metric.label}</span>
              </div>
                  <span className={`text-lg font-bold ${getMetricColor(metric.value)}`}>
                    {metric.value.toFixed(1)}{metric.unit}
                  </span>
              </div>
                <div className="w-full bg-muted rounded-full h-2">
            <motion.div
                    className={`h-2 rounded-full ${
                      metric.value > 80 ? 'bg-red-500' :
                      metric.value > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
              </div>
            </motion.div>
            ))}
          </div>

          {/* Mini Chart */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Trends (Last 20 readings)</h4>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>3s intervals</span>
              </div>
            </div>
            <div className="h-48 relative bg-muted/20 rounded-lg p-4">
              <svg className="w-full h-full" viewBox="0 0 500 180">
                {/* Time labels */}
                {metrics.slice(-6).map((metric, index) => (
                  <text
                    key={index}
                    x={(index / 5) * 500}
                    y={170}
                    textAnchor="middle"
                    className="text-xs fill-muted-foreground"
                    fontSize="11"
                  >
                    {formatTime(metric.timestamp)}
                  </text>
                ))}
                
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(val => (
                  <line
                    key={val}
                    x1="20"
                    y1={(100 - val) * 1.5 + 10}
                    x2="480"
                    y2={(100 - val) * 1.5 + 10}
                    stroke="currentColor"
                    strokeWidth="0.5"
                    opacity="0.1"
                  />
                ))}

                {/* Y-axis labels */}
                {[0, 25, 50, 75, 100].map(val => (
                  <text
                    key={val}
                    x="15"
                    y={(100 - val) * 1.5 + 15}
                    textAnchor="end"
                    className="text-xs fill-muted-foreground"
                    fontSize="10"
                  >
                    {val}%
                  </text>
                ))}

                {/* Metric lines */}
                {['cpu', 'memory', 'disk', 'network'].map((type, typeIndex) => {
                  const color = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][typeIndex]
                  const points = metrics.map((metric, index) => ({
                    x: 20 + (index / (metrics.length - 1)) * 460,
                    y: 160 - (metric[type as keyof MetricData] as number / 100) * 150
                  }))

                  const pathData = points.reduce((path, point, index) => {
                    return index === 0 ? `M ${point.x} ${point.y}` : `${path} L ${point.x} ${point.y}`
                  }, '')

                  return (
                    <motion.path
                      key={type}
                      d={pathData}
                      fill="none"
                      stroke={color}
                      strokeWidth="2.5"
                      opacity={0.9}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, ease: 'easeInOut' }}
                    />
                  )
                })}
              </svg>
              
              {/* Legend */}
              <div className="absolute bottom-3 left-6 flex space-x-4 text-xs bg-background/90 rounded-md px-2 py-1">
                {[
                  { type: 'cpu', color: '#3b82f6', label: 'CPU' },
                  { type: 'memory', color: '#10b981', label: 'Memory' },
                  { type: 'disk', color: '#f59e0b', label: 'Disk' },
                  { type: 'network', color: '#ef4444', label: 'Network' }
                ].map(({ type, color, label }) => (
                  <div key={type} className="flex items-center space-x-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-muted-foreground font-medium">{label}</span>
              </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-green-500" />
            <span>System Health</span>
            <Badge variant="secondary" className="bg-green-500/10 text-green-500">Optimal</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{systemHealth.responseTime.toFixed(1)}ms</div>
              <div className="text-xs text-muted-foreground">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{systemHealth.throughput.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">req/min</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{systemHealth.errorRate.toFixed(2)}%</div>
              <div className="text-xs text-muted-foreground">Error Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{systemHealth.activeConnections.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Active Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{systemHealth.queueLength}</div>
              <div className="text-xs text-muted-foreground">Queue Length</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{formatUptime(currentMetrics.uptime || 0)}</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

