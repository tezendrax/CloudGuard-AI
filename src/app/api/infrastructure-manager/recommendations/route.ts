// Infrastructure Manager API - AI Recommendations endpoint
import { NextRequest, NextResponse } from 'next/server'

interface OptimizationRecommendation {
  id: string
  assetId: string
  assetName: string
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
  category: string
  tags: string[]
  createdAt: string
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected'
}

function generateRecommendations(): OptimizationRecommendation[] {
  const recommendations = [
    {
      id: 'rec-001',
      assetId: 'asset-1',
      assetName: 'Production Web Server',
      type: 'cost' as const,
      priority: 'high' as const,
      title: 'Right-size EC2 Instances',
      description: 'Current t3.large instances are only utilizing 45% CPU on average. Downsize to t3.medium for significant cost savings.',
      impact: 'Reduce monthly costs by $1,200 (35% savings)',
      effort: 'low' as const,
      savings: 1200,
      confidence: 94,
      implementationSteps: [
        'Verify consistent low CPU usage over 30-day period',
        'Create AMI backup of current instance',
        'Launch new t3.medium instance during maintenance window',
        'Update load balancer to point to new instance',
        'Monitor performance for 48 hours',
        'Terminate old instance if performance is stable'
      ],
      estimatedTime: '2-3 hours',
      category: 'Resource Optimization',
      tags: ['cost-reduction', 'right-sizing', 'ec2'],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'pending' as const
    },
    {
      id: 'rec-002',
      assetId: 'asset-2',
      assetName: 'Primary Database',
      type: 'performance' as const,
      priority: 'critical' as const,
      title: 'Optimize Database Queries',
      description: 'Slow queries detected consuming 70% of database resources. Multiple missing indexes identified.',
      impact: 'Improve query performance by 60%, reduce response time from 45ms to 18ms',
      effort: 'high' as const,
      savings: 0,
      confidence: 88,
      implementationSteps: [
        'Run slow query log analysis',
        'Identify top 10 slowest queries',
        'Create missing indexes for frequent WHERE clauses',
        'Optimize JOIN operations in complex queries',
        'Implement query result caching for frequently accessed data',
        'Monitor query performance improvements'
      ],
      estimatedTime: '8-12 hours',
      category: 'Performance Optimization',
      tags: ['database', 'performance', 'indexing'],
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'approved' as const
    },
    {
      id: 'rec-003',
      assetId: 'asset-4',
      assetName: 'File Storage System',
      type: 'cost' as const,
      priority: 'medium' as const,
      title: 'Implement Storage Lifecycle Policies',
      description: 'Analysis shows 60% of stored data hasn\'t been accessed in 90+ days. Move to cheaper storage tiers.',
      impact: 'Reduce storage costs by $800/month (45% savings)',
      effort: 'medium' as const,
      savings: 800,
      confidence: 91,
      implementationSteps: [
        'Analyze file access patterns over last 6 months',
        'Create lifecycle policy to move files to IA after 30 days',
        'Move files older than 90 days to Glacier',
        'Set up automated lifecycle transitions',
        'Implement monitoring for storage cost tracking',
        'Review and adjust policies monthly'
      ],
      estimatedTime: '4-6 hours',
      category: 'Storage Optimization',
      tags: ['storage', 'lifecycle', 'cost-reduction'],
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: 'in_progress' as const
    },
    {
      id: 'rec-004',
      assetId: 'asset-5',
      assetName: 'Load Balancer',
      type: 'reliability' as const,
      priority: 'medium' as const,
      title: 'Configure Health Check Optimization',
      description: 'Current health checks are too frequent and causing unnecessary load. Optimize intervals and thresholds.',
      impact: 'Reduce false positives by 80%, improve reliability score',
      effort: 'minimal' as const,
      savings: 150,
      confidence: 96,
      implementationSteps: [
        'Review current health check configuration',
        'Increase health check interval from 10s to 30s',
        'Adjust healthy/unhealthy thresholds based on application behavior',
        'Configure more intelligent health check endpoints',
        'Test failover scenarios with new configuration',
        'Monitor false positive rates'
      ],
      estimatedTime: '1-2 hours',
      category: 'Reliability Enhancement',
      tags: ['load-balancer', 'health-checks', 'reliability'],
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      status: 'pending' as const
    },
    {
      id: 'rec-005',
      assetId: 'asset-7',
      assetName: 'Microservice Cluster',
      type: 'capacity' as const,
      priority: 'high' as const,
      title: 'Implement Horizontal Pod Autoscaling',
      description: 'Container CPU usage spikes to 95% during peak hours. Enable HPA to automatically scale pods.',
      impact: 'Prevent performance degradation during traffic spikes',
      effort: 'low' as const,
      savings: 0,
      confidence: 92,
      implementationSteps: [
        'Install and configure metrics-server if not present',
        'Define HPA policy targeting 70% CPU utilization',
        'Set minimum 3 and maximum 15 pod replicas',
        'Configure scale-up and scale-down policies',
        'Test autoscaling with simulated load',
        'Monitor scaling events and adjust thresholds'
      ],
      estimatedTime: '3-4 hours',
      category: 'Capacity Management',
      tags: ['kubernetes', 'autoscaling', 'containers'],
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      status: 'approved' as const
    },
    {
      id: 'rec-006',
      assetId: 'asset-3',
      assetName: 'Cache Cluster',
      type: 'performance' as const,
      priority: 'low' as const,
      title: 'Optimize Cache Key Distribution',
      description: 'Cache hit rate is only 76%. Improve key distribution and implement cache warming strategies.',
      impact: 'Increase cache hit rate to 90%+, reduce database load by 25%',
      effort: 'medium' as const,
      savings: 300,
      confidence: 85,
      implementationSteps: [
        'Analyze current cache key patterns and hit rates',
        'Implement consistent hashing for better key distribution',
        'Create cache warming scripts for frequently accessed data',
        'Adjust TTL values based on data access patterns',
        'Implement cache monitoring and alerting',
        'Fine-tune eviction policies'
      ],
      estimatedTime: '6-8 hours',
      category: 'Cache Optimization',
      tags: ['cache', 'performance', 'redis'],
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      status: 'pending' as const
    }
  ]

  return recommendations
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let recommendations = generateRecommendations()

    // Apply filters
    if (assetId) {
      recommendations = recommendations.filter(rec => rec.assetId === assetId)
    }

    if (type) {
      recommendations = recommendations.filter(rec => rec.type === type)
    }

    if (priority) {
      recommendations = recommendations.filter(rec => rec.priority === priority)
    }

    if (status) {
      recommendations = recommendations.filter(rec => rec.status === status)
    }

    // Sort by priority and creation date
    const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 }
    recommendations.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // Apply pagination
    const total = recommendations.length
    const paginatedRecommendations = recommendations.slice(offset, offset + limit)

    // Calculate summary statistics
    const totalSavings = recommendations.reduce((sum, rec) => sum + rec.savings, 0)
    const averageConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length || 0
    const statusCounts = recommendations.reduce((counts, rec) => {
      counts[rec.status] = (counts[rec.status] || 0) + 1
      return counts
    }, {} as Record<string, number>)

    return NextResponse.json({
      recommendations: paginatedRecommendations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      summary: {
        totalRecommendations: total,
        totalPotentialSavings: totalSavings,
        averageConfidence: Math.round(averageConfidence),
        byStatus: statusCounts,
        byPriority: recommendations.reduce((counts, rec) => {
          counts[rec.priority] = (counts[rec.priority] || 0) + 1
          return counts
        }, {} as Record<string, number>),
        byType: recommendations.reduce((counts, rec) => {
          counts[rec.type] = (counts[rec.type] || 0) + 1
          return counts
        }, {} as Record<string, number>)
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Recommendations API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch recommendations',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recommendationId, action, notes } = body

    if (!recommendationId || !action) {
      return NextResponse.json(
        { error: 'recommendationId and action are required' },
        { status: 400 }
      )
    }

    const validActions = ['approve', 'reject', 'start_implementation', 'complete', 'snooze']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      )
    }

    const recommendations = generateRecommendations()
    const recommendation = recommendations.find(rec => rec.id === recommendationId)

    if (!recommendation) {
      return NextResponse.json(
        { error: 'Recommendation not found' },
        { status: 404 }
      )
    }

    let newStatus = recommendation.status
    let message = ''

    switch (action) {
      case 'approve':
        newStatus = 'approved'
        message = 'Recommendation approved for implementation'
        break
      case 'reject':
        newStatus = 'rejected'
        message = 'Recommendation rejected'
        break
      case 'start_implementation':
        newStatus = 'in_progress'
        message = 'Implementation started'
        break
      case 'complete':
        newStatus = 'completed'
        message = 'Recommendation implementation completed'
        break
      case 'snooze':
        message = 'Recommendation snoozed for 7 days'
        break
    }

    return NextResponse.json({
      success: true,
      recommendationId,
      action,
      previousStatus: recommendation.status,
      newStatus,
      message,
      notes: notes || '',
      updatedAt: new Date().toISOString(),
      estimatedSavings: recommendation.savings
    })
  } catch (error) {
    console.error('Recommendations POST Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process recommendation action' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { recommendationId, updates } = body

    if (!recommendationId || !updates) {
      return NextResponse.json(
        { error: 'recommendationId and updates are required' },
        { status: 400 }
      )
    }

    const recommendations = generateRecommendations()
    const recommendation = recommendations.find(rec => rec.id === recommendationId)

    if (!recommendation) {
      return NextResponse.json(
        { error: 'Recommendation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      recommendationId,
      updatedFields: Object.keys(updates),
      message: 'Recommendation updated successfully',
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Recommendations PUT Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update recommendation' },
      { status: 500 }
    )
  }
}
