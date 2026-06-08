// Auto-scaling Management API
import { NextRequest, NextResponse } from 'next/server'
import { autoScalingService } from '@/services/autoScalingService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'policies' | 'rules' | 'history' | 'status'

    switch (type) {
      case 'policies':
        return NextResponse.json({
          success: true,
          data: autoScalingService.getScalingPolicies(),
          timestamp: new Date().toISOString()
        })

      case 'rules':
        return NextResponse.json({
          success: true,
          data: autoScalingService.getHealingRules(),
          timestamp: new Date().toISOString()
        })

      case 'history':
        const history = Array.from(autoScalingService.getScalingHistory().entries()).map(([key, date]) => ({
          key,
          timestamp: date.toISOString()
        }))
        
        return NextResponse.json({
          success: true,
          data: history,
          timestamp: new Date().toISOString()
        })

      case 'status':
        return NextResponse.json({
          success: true,
          data: {
            isRunning: true,
            activePolicies: autoScalingService.getScalingPolicies().filter(p => p.enabled).length,
            activeRules: autoScalingService.getHealingRules().filter(r => r.enabled).length,
            lastEvaluation: new Date().toISOString(),
            uptime: '24h 15m 32s'
          },
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: true,
          data: {
            policies: autoScalingService.getScalingPolicies(),
            rules: autoScalingService.getHealingRules(),
            status: 'running'
          },
          timestamp: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('Auto-scaling API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch auto-scaling data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, type, data } = body

    switch (action) {
      case 'create_policy':
        autoScalingService.addScalingPolicy(data)
        return NextResponse.json({
          success: true,
          message: 'Scaling policy created successfully',
          data: data
        })

      case 'create_rule':
        autoScalingService.addHealingRule(data)
        return NextResponse.json({
          success: true,
          message: 'Healing rule created successfully',
          data: data
        })

      case 'start_service':
        autoScalingService.startAutoScaling()
        return NextResponse.json({
          success: true,
          message: 'Auto-scaling service started'
        })

      case 'stop_service':
        autoScalingService.stopAutoScaling()
        return NextResponse.json({
          success: true,
          message: 'Auto-scaling service stopped'
        })

      case 'emergency_scale':
        // Trigger emergency scaling for specific resource
        const { resourceId, scaleType, percentage } = data
        autoScalingService.addScalingPolicy({
          id: `emergency-${Date.now()}`,
          resourceId,
          name: 'Emergency Scaling',
          type: scaleType || 'horizontal',
          triggers: [],
          actions: [{
            type: 'scale_up',
            parameters: {
              percentage: percentage || 100,
              maxInstances: 20
            }
          }],
          cooldownPeriod: 0,
          enabled: true
        })

        return NextResponse.json({
          success: true,
          message: `Emergency scaling triggered for resource ${resourceId}`
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Auto-scaling Action Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to execute auto-scaling action' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, type, data } = body

    if (type === 'policy') {
      autoScalingService.addScalingPolicy({ ...data, id })
      return NextResponse.json({
        success: true,
        message: 'Scaling policy updated successfully'
      })
    } else if (type === 'rule') {
      autoScalingService.addHealingRule({ ...data, id })
      return NextResponse.json({
        success: true,
        message: 'Healing rule updated successfully'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Auto-scaling Update Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update auto-scaling configuration' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type') // 'policy' | 'rule'

    if (!id || !type) {
      return NextResponse.json(
        { success: false, error: 'ID and type are required' },
        { status: 400 }
      )
    }

    if (type === 'policy') {
      autoScalingService.removeScalingPolicy(id)
      return NextResponse.json({
        success: true,
        message: 'Scaling policy deleted successfully'
      })
    } else if (type === 'rule') {
      autoScalingService.removeHealingRule(id)
      return NextResponse.json({
        success: true,
        message: 'Healing rule deleted successfully'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Auto-scaling Delete Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete auto-scaling configuration' },
      { status: 500 }
    )
  }
}
