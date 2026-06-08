'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  DollarSign, 
  Server, 
  Cloud, 
  Database, 
  Wifi, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Pause,
  BarChart3,
  TrendingUp,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface DataSource {
  id: string
  name: string
  type: 'system' | 'api' | 'cloud' | 'container'
  cost: 'free' | 'low' | 'medium'
  enabled: boolean
}

interface CostBreakdown {
  source: string
  cost: string
  description: string
}

interface SystemStatus {
  isRunning: boolean
  enabledSources: number
  totalSources: number
  lastUpdate: string
}

export function DataSourcesOverview() {
  const [sources, setSources] = useState<DataSource[]>([])
  const [costs, setCosts] = useState<CostBreakdown[]>([])
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [totalCost, setTotalCost] = useState(0)
  const [freeSourcesCount, setFreeSourcesCount] = useState(0)

  useEffect(() => {
    fetchDataSources()
    fetchCostBreakdown()
    fetchSystemStatus()
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSystemStatus()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchDataSources = async () => {
    try {
      const response = await fetch('/api/data-sources?action=sources')
      const data = await response.json()
      if (data.success) {
        setSources(data.sources)
      }
    } catch (error) {
      console.error('Failed to fetch data sources:', error)
    }
  }

  const fetchCostBreakdown = async () => {
    try {
      const response = await fetch('/api/data-sources?action=costs')
      const data = await response.json()
      if (data.success) {
        setCosts(data.costs)
        setTotalCost(data.totalMonthlyCost)
        setFreeSourcesCount(data.freeSourcesCount)
      }
    } catch (error) {
      console.error('Failed to fetch cost breakdown:', error)
    }
  }

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/data-sources?action=status')
      const data = await response.json()
      if (data.success) {
        setStatus(data.status)
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch system status:', error)
      setIsLoading(false)
    }
  }

  const toggleSource = async (sourceId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/data-sources', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId, enabled })
      })

      if (response.ok) {
        setSources(prev => 
          prev.map(source => 
            source.id === sourceId ? { ...source, enabled } : source
          )
        )
        fetchSystemStatus() // Refresh status
      }
    } catch (error) {
      console.error('Failed to toggle source:', error)
    }
  }

  const controlDataCollection = async (action: 'start' | 'stop' | 'restart') => {
    try {
      const response = await fetch('/api/data-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, interval: 3000 })
      })

      if (response.ok) {
        fetchSystemStatus()
      }
    } catch (error) {
      console.error(`Failed to ${action} data collection:`, error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system': return <Server className="h-4 w-4" />
      case 'cloud': return <Cloud className="h-4 w-4" />
      case 'container': return <Database className="h-4 w-4" />
      case 'api': return <Wifi className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getCostColor = (cost: string) => {
    if (cost === 'free') return 'bg-green-100 text-green-800 border-green-200'
    if (cost === 'low') return 'bg-blue-100 text-blue-800 border-blue-200'
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }

  if (isLoading) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading data sources...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Total Monthly Cost</p>
                <p className="text-2xl font-bold text-green-600">${totalCost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">90% cheaper than AWS</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Free Sources</p>
                <p className="text-2xl font-bold text-blue-600">{freeSourcesCount}</p>
                <p className="text-xs text-muted-foreground">Zero cost monitoring</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Active Sources</p>
                <p className="text-2xl font-bold text-orange-600">
                  {status?.enabledSources || 0}/{status?.totalSources || 0}
                </p>
                <p className="text-xs text-muted-foreground">Real-time data streams</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {status?.isRunning ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="text-sm font-medium">System Status</p>
                <p className={`text-sm font-bold ${status?.isRunning ? 'text-green-600' : 'text-red-600'}`}>
                  {status?.isRunning ? 'Running' : 'Stopped'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {status?.lastUpdate ? new Date(status.lastUpdate).toLocaleTimeString() : 'Unknown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="sources" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
            <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
            <TabsTrigger value="comparison">vs AWS Comparison</TabsTrigger>
          </TabsList>

          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => controlDataCollection('restart')}
              className="flex items-center space-x-2"
            >
              <Activity className="h-4 w-4" />
              <span>Restart</span>
            </Button>
            <Button
              size="sm"
              variant={status?.isRunning ? "destructive" : "default"}
              onClick={() => controlDataCollection(status?.isRunning ? 'stop' : 'start')}
              className="flex items-center space-x-2"
            >
              {status?.isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{status?.isRunning ? 'Stop' : 'Start'}</span>
            </Button>
          </div>
        </div>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Real-Time Data Sources</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sources.map((source) => (
                  <motion.div
                    key={source.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(source.type)}
                      <div>
                        <h3 className="font-medium">{source.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {source.type} monitoring
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge className={getCostColor(source.cost)}>
                        {source.cost === 'free' ? 'FREE' : source.cost.toUpperCase()}
                      </Badge>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">
                          {source.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <Switch
                          checked={source.enabled}
                          onCheckedChange={(enabled) => toggleSource(source.id, enabled)}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Cost Breakdown Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {costs.map((cost, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{cost.source}</h3>
                      <p className="text-sm text-muted-foreground">{cost.description}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${cost.cost === 'FREE' ? 'text-green-600' : 'text-blue-600'}`}>
                        {cost.cost}
                      </p>
                    </div>
                  </motion.div>
                ))}

                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-green-800">Total Monthly Cost</h3>
                      <p className="text-sm text-green-600">
                        {freeSourcesCount} free sources + low-cost alternatives
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-green-800">${totalCost.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Cost Comparison: CloudGuard AI vs Major Cloud Providers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-600">CloudGuard AI (Our Solution)</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>System Monitoring</span>
                        <span className="font-bold text-green-600">FREE</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Docker Container Stats</span>
                        <span className="font-bold text-green-600">FREE</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Public APIs Integration</span>
                        <span className="font-bold text-green-600">FREE</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DigitalOcean Droplet</span>
                        <span className="font-bold text-blue-600">$5/month</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span className="text-green-600">${totalCost.toFixed(2)}/month</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-red-600">Traditional Cloud Solutions</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>AWS CloudWatch + EC2</span>
                        <span className="font-bold text-red-600">$50-200/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Azure Monitor + VM</span>
                        <span className="font-bold text-red-600">$45-180/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Google Cloud Monitoring</span>
                        <span className="font-bold text-red-600">$40-150/month</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span>Average</span>
                          <span className="text-red-600">$100-200/month</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border rounded-lg">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-green-700 mb-2">90-95% Cost Savings</h3>
                    <p className="text-green-600 mb-4">
                      CloudGuard AI delivers enterprise-grade monitoring at a fraction of the cost
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-3xl font-bold text-blue-600">{freeSourcesCount}</p>
                        <p className="text-sm">Free Sources</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-green-600">90%</p>
                        <p className="text-sm">Cost Savings</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-orange-600">Real-time</p>
                        <p className="text-sm">Data Streams</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
