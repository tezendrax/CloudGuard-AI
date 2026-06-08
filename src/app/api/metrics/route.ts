// Metrics API - Real-time system metrics
import { NextRequest, NextResponse } from 'next/server'

// Generate realistic time-series metrics
function generateMetrics(metricName: string, count: number = 30) {
  const metrics = []
  const now = Date.now()
  
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * 2 * 60 * 1000) // 2-minute intervals
    let value = 0
    
    switch (metricName) {
      case 'cpu':
        value = 30 + Math.sin(i * 0.1) * 20 + Math.random() * 15
        break
      case 'memory':
        value = 50 + Math.cos(i * 0.15) * 15 + Math.random() * 10
        break
      case 'disk':
        value = 20 + Math.sin(i * 0.05) * 10 + Math.random() * 8
        break
      case 'network':
        value = 25 + Math.sin(i * 0.2) * 25 + Math.random() * 15
        break
      case 'requests':
        value = 1000 + Math.sin(i * 0.1) * 500 + Math.random() * 200
        break
      case 'errors':
        value = Math.max(0, 5 + Math.sin(i * 0.3) * 3 + Math.random() * 2)
        break
      case 'latency':
        value = 150 + Math.sin(i * 0.1) * 50 + Math.random() * 30
        break
      default:
        value = Math.random() * 100
    }
    
    metrics.push({
      timestamp: timestamp.toISOString(),
      value: Math.max(0, Math.min(100, value)),
      metric: metricName
    })
  }
  
  return metrics
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get('resourceId') || 'demo-resource-1'
    const metric = searchParams.get('metric')
    const timeRange = searchParams.get('timeRange') || '1h'
    
    // Generate metrics based on request
    const metrics: any = {}
    
    if (metric) {
      metrics[metric] = generateMetrics(metric)
    } else {
      // Generate all common metrics
      const commonMetrics = ['cpu', 'memory', 'disk', 'network', 'requests', 'errors', 'latency']
      commonMetrics.forEach(m => {
        metrics[m] = generateMetrics(m)
      })
    }

    // Current values for real-time display
    const currentValues = Object.keys(metrics).reduce((acc: any, key) => {
      const metricData = metrics[key]
      acc[key] = metricData[metricData.length - 1]?.value || 0
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      resourceId,
      timeRange,
      data: metrics,
      current: currentValues,
      timestamp: new Date().toISOString(),
      count: Object.keys(metrics).reduce((sum, key) => sum + metrics[key].length, 0)
    })
  } catch (error) {
    console.error('Metrics API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { resourceId, metrics } = body

    if (!resourceId || !metrics) {
      return NextResponse.json(
        { error: 'Resource ID and metrics data are required' },
        { status: 400 }
      )
    }

    // In a real implementation, this would store metrics in InfluxDB
    // For demo, we'll just acknowledge the data
    return NextResponse.json({
      success: true,
      message: 'Metrics stored successfully',
      resourceId,
      count: Array.isArray(metrics) ? metrics.length : Object.keys(metrics).length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Store Metrics Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to store metrics' },
      { status: 500 }
    )
  }
}
