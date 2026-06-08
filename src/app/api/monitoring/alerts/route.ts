import { NextRequest, NextResponse } from 'next/server'
import { monitoringService } from '@/services/monitoringService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'history'
    const limit = parseInt(searchParams.get('limit') || '100')
    
    let alerts
    
    if (type === 'active') {
      alerts = monitoringService.getActiveAlerts()
    } else {
      alerts = monitoringService.getAlertHistory(limit)
    }
    
    return NextResponse.json({
      success: true,
      alerts,
      count: alerts.length,
      type
    })
  } catch (error: any) {
    console.error('Get alerts error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get alerts'
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { alertId, action } = body
    
    if (!alertId || !action) {
      return NextResponse.json({
        success: false,
        error: 'Alert ID and action are required'
      }, { status: 400 })
    }
    
    if (action === 'acknowledge') {
      monitoringService.acknowledgeAlert(alertId)
    }
    
    return NextResponse.json({
      success: true,
      message: `Alert ${action}d successfully`
    })
  } catch (error: any) {
    console.error('Update alert error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update alert'
    }, { status: 500 })
  }
}
