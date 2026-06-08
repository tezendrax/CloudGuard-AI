import { NextRequest, NextResponse } from 'next/server'
import { performanceMonitor, getMemoryUsage, getCPUUsage } from '@/lib/performance'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metricName = searchParams.get('name')
    const timeWindow = searchParams.get('timeWindow') 
      ? parseInt(searchParams.get('timeWindow')!) 
      : undefined

    if (metricName) {
      // Get specific metric
      const metrics = performanceMonitor.getMetrics(metricName)
      const summary = performanceMonitor.getMetricSummary(metricName, timeWindow)
      
      return NextResponse.json({
        success: true,
        metric: {
          name: metricName,
          data: metrics,
          summary
        }
      })
    } else {
      // Get all metrics overview
      const metricNames = performanceMonitor.getMetricNames()
      const overview = metricNames.map(name => ({
        name,
        summary: performanceMonitor.getMetricSummary(name, timeWindow)
      }))

      // Add system metrics
      const memoryUsage = getMemoryUsage()
      const cpuUsage = getCPUUsage()

      return NextResponse.json({
        success: true,
        overview,
        system: {
          memory: memoryUsage,
          cpu: cpuUsage,
          uptime: typeof process !== 'undefined' ? process.uptime() : null,
          timestamp: new Date().toISOString()
        }
      })
    }
  } catch (error: any) {
    console.error('Get performance metrics error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get performance metrics'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metricName = searchParams.get('name')
    
    performanceMonitor.clearMetrics(metricName || undefined)
    
    return NextResponse.json({
      success: true,
      message: metricName 
        ? `Cleared metrics for ${metricName}` 
        : 'Cleared all metrics'
    })
  } catch (error: any) {
    console.error('Clear performance metrics error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to clear performance metrics'
    }, { status: 500 })
  }
}
