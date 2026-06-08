'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, Activity, Zap, TrendingUp, Target, Gauge, BarChart3, 
  Server, Database, Cloud, Settings, Play, Pause, RotateCcw, 
  CheckCircle2, AlertCircle, RefreshCw, DollarSign, Cpu,
  Monitor, Shield, Timer, Users, Network, HardDrive
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

// Intelligent Infrastructure Management System
interface InfrastructureAsset {
  id: string
  name: string
  type: 'server' | 'database' | 'storage' | 'network' | 'application' | 'container'
  provider: 'AWS' | 'Azure' | 'GCP' | 'On-Premise'
  status: 'healthy' | 'warning' | 'critical' | 'optimizing' | 'offline'
  location: string
  
  // Real-time Performance Data
  performance: {
    cpu: number
    memory: number
    disk: number
    network: number
    response_time: number
    uptime: number
  }
  
  // Cost Information
  cost: {
    hourly: number
    monthly: number
    yearly: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }
  
  // AI Insights
  aiInsights: {
    healthScore: number
    optimizationScore: number
    riskLevel: 'low' | 'medium' | 'high'
    recommendations: AIRecommendation[]
    predictions: {
      nextHourUtilization: number
      dailyPeakTime: string
      weeklyTrend: 'up' | 'down' | 'stable'
    }
  }
  
  // Monitoring
  monitoring: {
    alertsCount: number
    lastAlert: Date | null
    uptimePercentage: number
    avgResponseTime: number
  }
}

interface AIRecommendation {
  id: string
  type: 'cost' | 'performance' | 'security' | 'reliability' | 'capacity'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: string
  effort: 'minimal' | 'low' | 'medium' | 'high'
  savings: number
  confidence: number
  implementationSteps: string[]
  estimatedTime: string
}

export function IntelligentInfrastructureManager() {
  const [assets, setAssets] = useState<InfrastructureAsset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'analytics'>('grid')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Generate realistic infrastructure data
  const generateInfrastructureAssets = useCallback((): InfrastructureAsset[] => {
    const assetTemplates = [
      {
        name: 'Production Web Server',
        type: 'server' as const,
        provider: 'AWS' as const,
        location: 'us-east-1',
        basePerformance: { cpu: 45, memory: 60, disk: 30, network: 40, response_time: 120, uptime: 99.8 }
      },
      {
        name: 'Primary Database',
        type: 'database' as const,
        provider: 'AWS' as const,
        location: 'us-east-1',
        basePerformance: { cpu: 70, memory: 80, disk: 55, network: 25, response_time: 45, uptime: 99.9 }
      },
      {
        name: 'Cache Cluster',
        type: 'database' as const,
        provider: 'AWS' as const,
        location: 'us-east-1',
        basePerformance: { cpu: 35, memory: 90, disk: 20, network: 60, response_time: 8, uptime: 99.95 }
      },
      {
        name: 'File Storage System',
        type: 'storage' as const,
        provider: 'Azure' as const,
        location: 'eastus',
        basePerformance: { cpu: 20, memory: 40, disk: 75, network: 50, response_time: 200, uptime: 99.7 }
      },
      {
        name: 'Load Balancer',
        type: 'network' as const,
        provider: 'GCP' as const,
        location: 'us-central1',
        basePerformance: { cpu: 25, memory: 35, disk: 15, network: 85, response_time: 15, uptime: 99.99 }
      },
      {
        name: 'API Gateway',
        type: 'application' as const,
        provider: 'AWS' as const,
        location: 'us-west-2',
        basePerformance: { cpu: 50, memory: 45, disk: 25, network: 70, response_time: 35, uptime: 99.8 }
      },
      {
        name: 'Microservice Cluster',
        type: 'container' as const,
        provider: 'GCP' as const,
        location: 'us-central1',
        basePerformance: { cpu: 60, memory: 70, disk: 40, network: 55, response_time: 80, uptime: 99.6 }
      },
      {
        name: 'Analytics Database',
        type: 'database' as const,
        provider: 'Azure' as const,
        location: 'westus2',
        basePerformance: { cpu: 85, memory: 75, disk: 60, network: 30, response_time: 150, uptime: 99.5 }
      }
    ]

    return assetTemplates.map((template, index) => {
      const performance = {
        cpu: Math.max(0, Math.min(100, template.basePerformance.cpu + (Math.random() - 0.5) * 20)),
        memory: Math.max(0, Math.min(100, template.basePerformance.memory + (Math.random() - 0.5) * 15)),
        disk: Math.max(0, Math.min(100, template.basePerformance.disk + (Math.random() - 0.5) * 25)),
        network: Math.max(0, Math.min(100, template.basePerformance.network + (Math.random() - 0.5) * 30)),
        response_time: Math.max(1, template.basePerformance.response_time + (Math.random() - 0.5) * 50),
        uptime: Math.max(95, Math.min(100, template.basePerformance.uptime + (Math.random() - 0.5) * 2))
      }

      const healthScore = (
        (100 - performance.cpu) * 0.25 +
        (100 - performance.memory) * 0.25 +
        (100 - performance.disk) * 0.2 +
        performance.uptime * 0.3
      )

      const optimizationScore = Math.max(0, 100 - (performance.cpu + performance.memory + performance.disk) / 3)

      const hourlyCost = 0.5 + Math.random() * 5 + (performance.cpu + performance.memory) / 100 * 2

      return {
        id: `asset-${index + 1}`,
        name: template.name,
        type: template.type,
        provider: template.provider,
        location: template.location,
        status: healthScore > 80 ? 'healthy' : healthScore > 60 ? 'warning' : 'critical',
        performance,
        cost: {
          hourly: hourlyCost,
          monthly: hourlyCost * 24 * 30,
          yearly: hourlyCost * 24 * 365,
          trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any
        },
        aiInsights: {
          healthScore: healthScore,
          optimizationScore: optimizationScore,
          riskLevel: healthScore > 80 ? 'low' : healthScore > 60 ? 'medium' : 'high',
          recommendations: generateRecommendations(template.type, performance, healthScore),
          predictions: {
            nextHourUtilization: Math.max(0, Math.min(100, performance.cpu + (Math.random() - 0.5) * 15)),
            dailyPeakTime: ['09:00', '14:00', '18:00', '21:00'][Math.floor(Math.random() * 4)],
            weeklyTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any
          }
        },
        monitoring: {
          alertsCount: Math.floor(Math.random() * 5),
          lastAlert: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : null,
          uptimePercentage: performance.uptime,
          avgResponseTime: performance.response_time
        }
      }
    })
  }, [])

  const generateRecommendations = (
    type: string, 
    performance: any, 
    healthScore: number
  ): AIRecommendation[] => {
    const recommendations: AIRecommendation[] = []

    // CPU optimization
    if (performance.cpu > 80) {
      recommendations.push({
        id: 'cpu-scale',
        type: 'performance',
        priority: 'high',
        title: 'Scale CPU Resources',
        description: 'CPU utilization is consistently high. Consider scaling up or out.',
        impact: 'Improve response times by 40-60%',
        effort: 'low',
        savings: 0,
        confidence: 92,
        implementationSteps: [
          'Analyze CPU usage patterns over the last 7 days',
          'Consider vertical scaling (larger instance) or horizontal scaling (more instances)',
          'Implement auto-scaling policies',
          'Monitor performance improvements'
        ],
        estimatedTime: '2-4 hours'
      })
    } else if (performance.cpu < 30) {
      recommendations.push({
        id: 'cpu-downsize',
        type: 'cost',
        priority: 'medium',
        title: 'Right-size CPU Resources',
        description: 'CPU is underutilized. Consider downsizing to reduce costs.',
        impact: 'Reduce costs by 30-50%',
        effort: 'low',
        savings: 200 + Math.random() * 500,
        confidence: 85,
        implementationSteps: [
          'Verify low CPU usage is consistent over time',
          'Test with smaller instance size in staging',
          'Schedule downtime for instance resize',
          'Monitor performance after change'
        ],
        estimatedTime: '1-2 hours'
      })
    }

    // Memory optimization
    if (performance.memory > 85) {
      recommendations.push({
        id: 'memory-optimize',
        type: 'performance',
        priority: 'high',
        title: 'Optimize Memory Usage',
        description: 'Memory usage is critically high. Risk of performance degradation.',
        impact: 'Prevent system crashes and improve stability',
        effort: 'medium',
        savings: 0,
        confidence: 88,
        implementationSteps: [
          'Analyze memory usage patterns and identify leaks',
          'Optimize application memory management',
          'Consider adding more memory or optimizing code',
          'Implement memory monitoring alerts'
        ],
        estimatedTime: '4-8 hours'
      })
    }

    // Storage optimization
    if (performance.disk > 80) {
      recommendations.push({
        id: 'storage-cleanup',
        type: 'reliability',
        priority: 'medium',
        title: 'Storage Cleanup & Optimization',
        description: 'Disk usage is high. Risk of running out of space.',
        impact: 'Prevent service interruptions',
        effort: 'low',
        savings: 100 + Math.random() * 300,
        confidence: 90,
        implementationSteps: [
          'Identify and remove old logs and temporary files',
          'Implement log rotation policies',
          'Consider archiving old data to cheaper storage tiers',
          'Set up disk space monitoring alerts'
        ],
        estimatedTime: '2-3 hours'
      })
    }

    // Database specific recommendations
    if (type === 'database' && performance.response_time > 100) {
      recommendations.push({
        id: 'db-optimize',
        type: 'performance',
        priority: 'high',
        title: 'Database Query Optimization',
        description: 'Database response times are slower than optimal.',
        impact: 'Improve query performance by 50-70%',
        effort: 'high',
        savings: 0,
        confidence: 82,
        implementationSteps: [
          'Analyze slow query logs',
          'Add missing database indexes',
          'Optimize frequently used queries',
          'Consider database connection pooling',
          'Monitor query performance improvements'
        ],
        estimatedTime: '8-16 hours'
      })
    }

    return recommendations
  }

  // Real-time updates
  useEffect(() => {
    if (!isMonitoring) return

    const updateAssets = () => {
      setAssets(prev => prev.map(asset => ({
        ...asset,
        performance: {
          ...asset.performance,
          cpu: Math.max(0, Math.min(100, asset.performance.cpu + (Math.random() - 0.5) * 5)),
          memory: Math.max(0, Math.min(100, asset.performance.memory + (Math.random() - 0.5) * 3)),
          network: Math.max(0, Math.min(100, asset.performance.network + (Math.random() - 0.5) * 8)),
          response_time: Math.max(1, asset.performance.response_time + (Math.random() - 0.5) * 10)
        }
      })))
    }

    const interval = setInterval(updateAssets, 3000)
    return () => clearInterval(interval)
  }, [isMonitoring])

  // Initialize assets
  useEffect(() => {
    setAssets(generateInfrastructureAssets())
  }, [generateInfrastructureAssets])

  // Filter assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const typeMatch = filterType === 'all' || asset.type === filterType
      const statusMatch = filterStatus === 'all' || asset.status === filterStatus
      return typeMatch && statusMatch
    })
  }, [assets, filterType, filterStatus])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalAssets = assets.length
    const healthyAssets = assets.filter(a => a.status === 'healthy').length
    const totalCost = assets.reduce((sum, a) => sum + a.cost.monthly, 0)
    const avgHealth = assets.reduce((sum, a) => sum + a.aiInsights.healthScore, 0) / totalAssets
    const totalRecommendations = assets.reduce((sum, a) => sum + a.aiInsights.recommendations.length, 0)
    const potentialSavings = assets.reduce((sum, a) => 
      sum + a.aiInsights.recommendations.reduce((recSum, rec) => recSum + rec.savings, 0), 0
    )

    return {
      totalAssets,
      healthyAssets,
      totalCost,
      avgHealth,
      totalRecommendations,
      potentialSavings
    }
  }, [assets])

  const getStatusColor = (status: string) => {
    const colors = {
      healthy: 'bg-green-500',
      warning: 'bg-yellow-500',
      critical: 'bg-red-500',
      optimizing: 'bg-blue-500',
      offline: 'bg-gray-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      server: <Server className="h-5 w-5" />,
      database: <Database className="h-5 w-5" />,
      storage: <HardDrive className="h-5 w-5" />,
      network: <Network className="h-5 w-5" />,
      application: <Monitor className="h-5 w-5" />,
      container: <Cloud className="h-5 w-5" />
    }
    return icons[type as keyof typeof icons] || <Activity className="h-5 w-5" />
  }

  const selectedAssetData = selectedAsset ? assets.find(a => a.id === selectedAsset) : null

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Brain className="h-6 w-6 text-blue-500" />
                Intelligent Infrastructure Manager
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                AI-powered monitoring, optimization, and management of your entire infrastructure
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={isMonitoring ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Monitoring
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Monitoring
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Refresh All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summaryStats.totalAssets}</div>
              <div className="text-sm text-muted-foreground">Total Assets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summaryStats.healthyAssets}</div>
              <div className="text-sm text-muted-foreground">Healthy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">${summaryStats.totalCost.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Monthly Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{summaryStats.avgHealth.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Avg Health</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">{summaryStats.totalRecommendations}</div>
              <div className="text-sm text-muted-foreground">AI Recommendations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">${summaryStats.potentialSavings.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Potential Savings</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Types</option>
              <option value="server">Servers</option>
              <option value="database">Databases</option>
              <option value="storage">Storage</option>
              <option value="network">Network</option>
              <option value="application">Applications</option>
              <option value="container">Containers</option>
            </select>
            
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="healthy">Healthy</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
              <option value="optimizing">Optimizing</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAssets.map((asset) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedAsset === asset.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedAsset(asset.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(asset.type)}
                    <div>
                      <div className="font-medium text-sm">{asset.name}</div>
                      <div className="text-xs text-muted-foreground">{asset.provider} • {asset.location}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className={`${getStatusColor(asset.status)} text-white border-0`}>
                    {asset.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Health Score</span>
                      <span className="font-medium">{asset.aiInsights.healthScore.toFixed(1)}%</span>
                    </div>
                    <Progress value={asset.aiInsights.healthScore} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">CPU</div>
                      <div className="font-medium">{asset.performance.cpu.toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Memory</div>
                      <div className="font-medium">{asset.performance.memory.toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Response</div>
                      <div className="font-medium">{asset.performance.response_time.toFixed(0)}ms</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Uptime</div>
                      <div className="font-medium">{asset.performance.uptime.toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Monthly Cost</span>
                      <span className="font-medium">${asset.cost.monthly.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-600">AI Recommendations</span>
                      <span className="font-medium text-blue-600">{asset.aiInsights.recommendations.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed Asset View */}
      <AnimatePresence>
        {selectedAssetData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedAssetData.type)}
                  {selectedAssetData.name} - Detailed Analytics
                  <Badge variant="outline" className={`ml-2 ${getStatusColor(selectedAssetData.status)} text-white border-0`}>
                    {selectedAssetData.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Performance Metrics */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      Real-time Performance
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(selectedAssetData.performance).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{key.replace('_', ' ')}</span>
                            <span className="font-medium">
                              {key === 'response_time' ? `${value.toFixed(0)}ms` : 
                               key === 'uptime' ? `${value.toFixed(2)}%` : 
                               `${value.toFixed(1)}%`}
                            </span>
                          </div>
                          <Progress 
                            value={key === 'response_time' ? Math.min(100, value / 5) : 
                                   key === 'uptime' ? value : value} 
                            className="h-2" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      AI Insights & Predictions
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm font-medium mb-2">Health Analysis</div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Overall Score: {selectedAssetData.aiInsights.healthScore.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Optimization Score: {selectedAssetData.aiInsights.optimizationScore.toFixed(1)}%
                        </div>
                        <div className="text-xs">
                          Risk Level: <span className={`font-medium ${
                            selectedAssetData.aiInsights.riskLevel === 'high' ? 'text-red-600' :
                            selectedAssetData.aiInsights.riskLevel === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {selectedAssetData.aiInsights.riskLevel.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm font-medium mb-2">Predictions</div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Next Hour CPU: {selectedAssetData.aiInsights.predictions.nextHourUtilization.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Daily Peak: {selectedAssetData.aiInsights.predictions.dailyPeakTime}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Weekly Trend: {selectedAssetData.aiInsights.predictions.weeklyTrend.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      AI Recommendations
                    </h3>
                    <div className="space-y-3">
                      {selectedAssetData.aiInsights.recommendations.map((rec, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-sm">{rec.title}</div>
                            <Badge variant={
                              rec.priority === 'critical' ? 'destructive' : 
                              rec.priority === 'high' ? 'destructive' :
                              rec.priority === 'medium' ? 'default' : 'secondary'
                            }>
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                          <div className="text-xs mb-2">
                            <span className="font-medium">Impact:</span> {rec.impact}
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Effort: {rec.effort}</span>
                            <span>Confidence: {rec.confidence}%</span>
                          </div>
                          {rec.savings > 0 && (
                            <div className="text-xs text-green-600 mt-1">
                              Potential Savings: ${rec.savings.toFixed(0)}/month
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default IntelligentInfrastructureManager
