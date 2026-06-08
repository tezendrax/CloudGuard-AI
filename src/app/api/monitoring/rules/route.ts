import { NextRequest, NextResponse } from 'next/server'
import { monitoringService, type MonitoringRule } from '@/services/monitoringService'
import { z } from 'zod'

const ruleSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  resourceId: z.string().optional(),
  metric: z.string(),
  operator: z.enum(['gt', 'lt', 'eq', 'gte', 'lte']),
  threshold: z.number(),
  duration: z.number(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  enabled: z.boolean(),
  actions: z.array(z.string())
})

export async function GET(request: NextRequest) {
  try {
    const rules = monitoringService.getRules()
    
    return NextResponse.json({
      success: true,
      rules,
      count: rules.length
    })
  } catch (error: any) {
    console.error('Get monitoring rules error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get monitoring rules'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsedRule = ruleSchema.parse(body)
    
    // Generate ID if not provided and ensure all required fields
    const ruleWithId = {
      ...parsedRule,
      id: parsedRule.id || `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    
    // Type assertion since we know all required fields are present after parsing
    monitoringService.addRule(ruleWithId as MonitoringRule)
    
    return NextResponse.json({
      success: true,
      rule: ruleWithId,
      message: 'Monitoring rule added successfully'
    })
  } catch (error: any) {
    console.error('Add monitoring rule error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to add monitoring rule'
    }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ruleId = searchParams.get('id')
    
    if (!ruleId) {
      return NextResponse.json({
        success: false,
        error: 'Rule ID is required'
      }, { status: 400 })
    }
    
    monitoringService.removeRule(ruleId)
    
    return NextResponse.json({
      success: true,
      message: 'Monitoring rule removed successfully'
    })
  } catch (error: any) {
    console.error('Remove monitoring rule error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to remove monitoring rule'
    }, { status: 500 })
  }
}
