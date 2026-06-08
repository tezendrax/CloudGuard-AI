// Infrastructure Manager API - Real-time Monitoring endpoint
import { NextRequest, NextResponse } from 'next/server'

interface MonitoringData {
  timestamp: string
  assets: AssetMonitoringData[]
  systemWide: SystemWideMetrics
  alerts: RealTimeAlert[]
  anomalies: AnomalyDetection[]
}

interface AssetMonitoringData {
  id: string
  name: string
  type: string
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  realTimeMetrics: {
    cpu: number
    memory: number
    disk: number
    network: {
      incoming: number
      outgoing: number
    }
    responseTime: number
    throughput: number
    errorRate: number
    availability: number
  }
  healthIndicators: {
    overall: number
    performance: number
    reliability: number
    efficiency: number
  }
  lastUpdated: string
}

interface SystemWideMetrics {
  totalAssets: number
  healthyAssets: number
  averageHealthScore: number
  totalThroughput: number
  averageResponseTime: number
  systemErrorRate: number
  totalCpuUtilization: number
  totalMemoryUtilization: number
  networkTraffic: {
    totalIncoming: number
    totalOutgoing: number
  }
  costMetrics: {
    currentHourCost: number
    projectedDailyCost: number
    projectedMonthlyCost: number
  }
}

interface RealTimeAlert {
  id: string
  timestamp: string
  type: 'performance' | 'availability' | 'capacity' | 'anomaly' | 'cost'
  severity: 'info' | 'warning' | 'critical'
  assetId: string
  assetName: string
  title: string
  description: string
  metric: string
  currentValue: number
  threshold: number
  impact: string
  autoResolution: boolean
  estimatedDuration: string
}

interface AnomalyDetection {
  id: string
  timestamp: string
  assetId: string
  assetName: string
  metric: string
  anomalyType: 'spike' | 'drop' | 'pattern_change' | 'threshold_breach'
  severity: 'low' | 'medium' | 'high'
  description: string
  currentValue: number
  expectedValue: number
  deviation: number
  confidence: number
  potentialCauses: string[]
  recommendedActions: string[]
}

function generateRealTimeMonitoringData(): MonitoringData {
  const now = new Date()
  
  const assets: AssetMonitoringData[] = [
    {
      id: 'asset-1',
      name: 'Production Web Server',
      type: 'server',
      status: 'healthy',
      realTimeMetrics: {
        cpu: 45 + Math.random() * 20,
        memory: 60 + Math.random() * 15,
        disk: 30 + Math.random() * 10,
        network: {
          incoming: 150 + Math.random() * 50,
          outgoing: 120 + Math.random() * 40
        },
        responseTime: 120 + Math.random() * 30,
        throughput: 1200 + Math.random() * 300,
        errorRate: Math.random() * 0.5,
        availability: 99.8 + Math.random() * 0.2
      },
      healthIndicators: {
        overall: 85 + Math.random() * 10,
        performance: 82 + Math.random() * 12,
        reliability: 95 + Math.random() * 4,
        efficiency: 78 + Math.random() * 15
      },
      lastUpdated: now.toISOString()
    },
    {
      id: 'asset-2',
      name: 'Primary Database',
      type: 'database',
      status: 'warning',
      realTimeMetrics: {
        cpu: 70 + Math.random() * 20,
        memory: 80 + Math.random() * 15,
        disk: 55 + Math.random() * 20,
        network: {
          incoming: 80 + Math.random() * 30,
          outgoing: 75 + Math.random() * 25
        },
        responseTime: 45 + Math.random() * 25,
        throughput: 800 + Math.random() * 200,
        errorRate: Math.random() * 1.2,
        availability: 99.9 + Math.random() * 0.1
      },
      healthIndicators: {
        overall: 75 + Math.random() * 15,
        performance: 68 + Math.random() * 20,
        reliability: 92 + Math.random() * 6,
        efficiency: 65 + Math.random() * 18
      },
      lastUpdated: now.toISOString()
    },
    {
      id: 'asset-3',
      name: 'Cache Cluster',
      type: 'database',
      status: 'healthy',
      realTimeMetrics: {
        cpu: 35 + Math.random() * 15,
        memory: 90 + Math.random() * 8,
        disk: 20 + Math.random() * 10,
        network: {
          incoming: 200 + Math.random() * 80,
          outgoing: 180 + Math.random() * 70
        },
        responseTime: 8 + Math.random() * 5,
        throughput: 2500 + Math.random() * 500,
        errorRate: Math.random() * 0.2,
        availability: 99.95 + Math.random() * 0.04
      },
      healthIndicators: {
        overall: 92 + Math.random() * 6,
        performance: 95 + Math.random() * 4,
        reliability: 98 + Math.random() * 2,
        efficiency: 88 + Math.random() * 8
      },
      lastUpdated: now.toISOString()
    },
    {
      id: 'asset-4',
      name: 'File Storage System',
      type: 'storage',
      status: 'healthy',
      realTimeMetrics: {
        cpu: 20 + Math.random() * 10,
        memory: 40 + Math.random() * 15,
        disk: 75 + Math.random() * 15,
        network: {
          incoming: 300 + Math.random() * 100,
          outgoing: 250 + Math.random() * 80
        },
        responseTime: 200 + Math.random() * 50,
        throughput: 600 + Math.random() * 150,
        errorRate: Math.random() * 0.3,
        availability: 99.7 + Math.random() * 0.25
      },
      healthIndicators: {
        overall: 88 + Math.random() * 8,
        performance: 82 + Math.random() * 12,
        reliability: 96 + Math.random() * 3,
        efficiency: 85 + Math.random() * 10
      },
      lastUpdated: now.toISOString()
    }
  ]

  const systemWide: SystemWideMetrics = {
    totalAssets: assets.length,
    healthyAssets: assets.filter(a => a.status === 'healthy').length,
    averageHealthScore: assets.reduce((sum, a) => sum + a.healthIndicators.overall, 0) / assets.length,
    totalThroughput: assets.reduce((sum, a) => sum + a.realTimeMetrics.throughput, 0),
    averageResponseTime: assets.reduce((sum, a) => sum + a.realTimeMetrics.responseTime, 0) / assets.length,
    systemErrorRate: assets.reduce((sum, a) => sum + a.realTimeMetrics.errorRate, 0) / assets.length,
    totalCpuUtilization: assets.reduce((sum, a) => sum + a.realTimeMetrics.cpu, 0) / assets.length,
    totalMemoryUtilization: assets.reduce((sum, a) => sum + a.realTimeMetrics.memory, 0) / assets.length,
    networkTraffic: {
      totalIncoming: assets.reduce((sum, a) => sum + a.realTimeMetrics.network.incoming, 0),
      totalOutgoing: assets.reduce((sum, a) => sum + a.realTimeMetrics.network.outgoing, 0)
    },
    costMetrics: {
      currentHourCost: 12.45 + Math.random() * 3,
      projectedDailyCost: 298.80 + Math.random() * 72,
      projectedMonthlyCost: 8964.00 + Math.random() * 2160
    }
  }

  const alerts: RealTimeAlert[] = [
    {
      id: 'alert-rt-001',
      timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
      type: 'performance',
      severity: 'warning',
      assetId: 'asset-2',
      assetName: 'Primary Database',
      title: 'High CPU Utilization',
      description: 'CPU utilization has exceeded 85% for the past 5 minutes',
      metric: 'cpu',
      currentValue: 87.3,
      threshold: 85,
      impact: 'Query response times may be affected',
      autoResolution: false,
      estimatedDuration: '10-15 minutes'
    },
    {
      id: 'alert-rt-002',
      timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      type: 'capacity',
      severity: 'info',
      assetId: 'asset-4',
      assetName: 'File Storage System',
      title: 'Storage Usage Increasing',
      description: 'Disk usage increased by 5% in the last hour',
      metric: 'disk',
      currentValue: 78.2,
      threshold: 80,
      impact: 'Approaching capacity threshold',
      autoResolution: false,
      estimatedDuration: '24-48 hours to threshold'
    }
  ]

  const anomalies: AnomalyDetection[] = [
    {
      id: 'anomaly-001',
      timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      assetId: 'asset-1',
      assetName: 'Production Web Server',
      metric: 'response_time',
      anomalyType: 'spike',
      severity: 'medium',
      description: 'Response time spike detected - 40% higher than normal pattern',
      currentValue: 168,
      expectedValue: 120,
      deviation: 40,
      confidence: 92,
      potentialCauses: [
        'Increased traffic load',
        'Database query performance degradation',
        'Network latency issues',
        'Resource contention'
      ],
      recommendedActions: [
        'Check current traffic patterns',
        'Review recent database queries',
        'Monitor network connectivity',
        'Consider scaling resources if pattern continues'
      ]
    },
    {
      id: 'anomaly-002',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      assetId: 'asset-3',
      assetName: 'Cache Cluster',
      metric: 'memory',
      anomalyType: 'pattern_change',
      severity: 'low',
      description: 'Memory usage pattern has changed - lower than expected for this time period',
      currentValue: 85,
      expectedValue: 95,
      deviation: -10.5,
      confidence: 78,
      potentialCauses: [
        'Reduced application load',
        'Cache eviction policy changes',
        'Application deployment changes',
        'Data access pattern shifts'
      ],
      recommendedActions: [
        'Verify cache hit rates',
        'Check application logs for changes',
        'Review recent deployments',
        'Monitor cache performance metrics'
      ]
    }
  ]

  return {
    timestamp: now.toISOString(),
    assets,
    systemWide,
    alerts,
    anomalies
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    const includeAlerts = searchParams.get('includeAlerts') !== 'false'
    const includeAnomalies = searchParams.get('includeAnomalies') !== 'false'
    const detailed = searchParams.get('detailed') === 'true'

    const monitoringData = generateRealTimeMonitoringData()

    if (assetId) {
      // Return specific asset monitoring data
      const asset = monitoringData.assets.find(a => a.id === assetId)
      if (!asset) {
        return NextResponse.json(
          { error: 'Asset not found' },
          { status: 404 }
        )
      }

      const response: any = {
        asset,
        timestamp: monitoringData.timestamp
      }

      if (includeAlerts) {
        response.alerts = monitoringData.alerts.filter(alert => alert.assetId === assetId)
      }

      if (includeAnomalies) {
        response.anomalies = monitoringData.anomalies.filter(anomaly => anomaly.assetId === assetId)
      }

      return NextResponse.json(response)
    }

    // Return all monitoring data
    const response: any = {
      timestamp: monitoringData.timestamp,
      systemWide: monitoringData.systemWide,
      assets: detailed ? monitoringData.assets : monitoringData.assets.map(asset => ({
        id: asset.id,
        name: asset.name,
        type: asset.type,
        status: asset.status,
        healthScore: asset.healthIndicators.overall,
        cpu: asset.realTimeMetrics.cpu,
        memory: asset.realTimeMetrics.memory,
        responseTime: asset.realTimeMetrics.responseTime,
        availability: asset.realTimeMetrics.availability
      }))
    }

    if (includeAlerts) {
      response.alerts = monitoringData.alerts
    }

    if (includeAnomalies) {
      response.anomalies = monitoringData.anomalies
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Monitoring API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch real-time monitoring data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, assetId, parameters } = body

    if (!action) {
      return NextResponse.json(
        { error: 'action is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'acknowledge_alert':
        if (!parameters?.alertId) {
          return NextResponse.json(
            { error: 'alertId is required for this action' },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Alert acknowledged successfully',
          alertId: parameters.alertId,
          acknowledgedBy: 'system',
          acknowledgedAt: new Date().toISOString()
        })

      case 'resolve_alert':
        if (!parameters?.alertId) {
          return NextResponse.json(
            { error: 'alertId is required for this action' },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Alert resolved successfully',
          alertId: parameters.alertId,
          resolvedBy: 'system',
          resolvedAt: new Date().toISOString(),
          resolution: parameters.resolution || 'Manual resolution'
        })

      case 'set_monitoring_interval':
        if (!assetId || !parameters?.interval) {
          return NextResponse.json(
            { error: 'assetId and interval are required for this action' },
            { status: 400 }
          )
        }

        const validIntervals = [30, 60, 300, 600, 1800, 3600] // seconds
        if (!validIntervals.includes(parameters.interval)) {
          return NextResponse.json(
            { error: `Invalid interval. Must be one of: ${validIntervals.join(', ')} seconds` },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Monitoring interval updated successfully',
          assetId,
          newInterval: parameters.interval,
          updatedAt: new Date().toISOString()
        })

      case 'configure_threshold':
        if (!assetId || !parameters?.metric || !parameters?.threshold) {
          return NextResponse.json(
            { error: 'assetId, metric, and threshold are required for this action' },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Threshold configured successfully',
          assetId,
          metric: parameters.metric,
          threshold: parameters.threshold,
          severity: parameters.severity || 'warning',
          updatedAt: new Date().toISOString()
        })

      case 'start_monitoring':
        if (!assetId) {
          return NextResponse.json(
            { error: 'assetId is required for this action' },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Monitoring started successfully',
          assetId,
          interval: 30, // seconds
          metrics: ['cpu', 'memory', 'disk', 'network', 'response_time'],
          startedAt: new Date().toISOString()
        })

      case 'stop_monitoring':
        if (!assetId) {
          return NextResponse.json(
            { error: 'assetId is required for this action' },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Monitoring stopped successfully',
          assetId,
          stoppedAt: new Date().toISOString()
        })

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Monitoring POST Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process monitoring request' },
      { status: 500 }
    )
  }
}
