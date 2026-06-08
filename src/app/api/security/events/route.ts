// Security Events API - Threat detection and response
import { NextRequest, NextResponse } from 'next/server'

// Mock security events for realistic demo
const mockSecurityEvents = [
  {
    id: 'sec-001',
    type: 'ANOMALY',
    severity: 'HIGH',
    source: '192.168.1.45',
    description: 'Unusual access pattern detected from internal IP',
    status: 'RESOLVED',
    detectedAt: new Date(Date.now() - 10 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 5 * 60 * 1000),
    metadata: {
      attempts: 15,
      timeWindow: '5 minutes',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      geolocation: 'Internal Network',
      riskScore: 85
    },
    autoActions: [
      'Temporary access restriction applied',
      'Security team notified',
      'Additional monitoring enabled'
    ]
  },
  {
    id: 'sec-002',
    type: 'VULNERABILITY',
    severity: 'MEDIUM',
    source: 'web-server-01',
    description: 'Outdated SSL certificate detected',
    status: 'ACKNOWLEDGED',
    detectedAt: new Date(Date.now() - 25 * 60 * 1000),
    metadata: {
      certificate: 'wildcard.example.com',
      expiryDate: '2024-01-15',
      daysUntilExpiry: 45,
      riskScore: 65
    },
    autoActions: [
      'Certificate renewal reminder sent',
      'Monitoring increased for affected services'
    ]
  },
  {
    id: 'sec-003',
    type: 'INTRUSION',
    severity: 'CRITICAL',
    source: '203.45.67.89',
    description: 'Multiple failed login attempts from external IP',
    status: 'RESOLVED',
    detectedAt: new Date(Date.now() - 5 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 2 * 60 * 1000),
    metadata: {
      attempts: 50,
      timeWindow: '2 minutes',
      targetAccounts: ['admin', 'root', 'administrator'],
      geolocation: 'Unknown (Tor Exit Node)',
      riskScore: 95
    },
    autoActions: [
      'IP address blocked immediately',
      'All admin accounts locked temporarily',
      'Incident response team notified',
      'Forensic logging enabled'
    ]
  },
  {
    id: 'sec-004',
    type: 'POLICY_VIOLATION',
    severity: 'LOW',
    source: 'app-server-02',
    description: 'Unauthorized software installation detected',
    status: 'OPEN',
    detectedAt: new Date(Date.now() - 45 * 60 * 1000),
    metadata: {
      software: 'unauthorized-tool-v1.2.3',
      user: 'developer@company.com',
      approvalStatus: 'pending',
      riskScore: 35
    },
    autoActions: [
      'Software execution blocked',
      'Manager notification sent',
      'Compliance review initiated'
    ]
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    let events = [...mockSecurityEvents]
    
    // Apply filters
    if (severity) {
      events = events.filter(e => e.severity === severity.toUpperCase())
    }
    if (status) {
      events = events.filter(e => e.status === status.toUpperCase())
    }
    
    // Sort by detection time (newest first)
    events.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())
    
    // Apply limit
    events = events.slice(0, limit)
    
    // Add some real-time variation
    if (Math.random() > 0.7) {
      // Occasionally add a new event
      const newEvent = {
        id: `sec-${Date.now()}`,
        type: 'ANOMALY',
        severity: 'MEDIUM',
        source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        description: 'New security event detected by AI guardian',
        status: 'OPEN',
        detectedAt: new Date(),
        metadata: {
          attempts: 5,
          timeWindow: '1 minute',
          userAgent: 'AI-Generated',
          geolocation: 'Unknown',
          riskScore: Math.floor(Math.random() * 100)
        },
        autoActions: ['AI analysis in progress', 'Monitoring increased']
      }
      events.unshift(newEvent as any)
    }

    // Calculate summary stats
    const summary = {
      total: events.length,
      open: events.filter(e => e.status === 'OPEN').length,
      resolved: events.filter(e => e.status === 'RESOLVED').length,
      critical: events.filter(e => e.severity === 'CRITICAL').length,
      high: events.filter(e => e.severity === 'HIGH').length,
      avgRiskScore: events.reduce((sum, e) => sum + (e.metadata?.riskScore || 0), 0) / events.length
    }

    return NextResponse.json({
      success: true,
      data: events,
      summary,
      filters: { severity, status, limit },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Security Events API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch security events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, action } = body

    if (!eventId || !action) {
      return NextResponse.json(
        { error: 'Event ID and action are required' },
        { status: 400 }
      )
    }

    // Simulate security event actions
    const result = {
      success: true,
      eventId,
      action,
      status: 'completed',
      timestamp: new Date().toISOString(),
      details: ''
    }

    switch (action) {
      case 'acknowledge':
        result.details = `Security event ${eventId} acknowledged by security team`
        break
      case 'resolve':
        result.details = `Security event ${eventId} marked as resolved`
        break
      case 'escalate':
        result.details = `Security event ${eventId} escalated to incident response team`
        break
      case 'block_source':
        result.details = `Source IP blocked for security event ${eventId}`
        break
      default:
        result.details = `Unknown action ${action} for event ${eventId}`
        result.status = 'failed'
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Security Action Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to execute security action' },
      { status: 500 }
    )
  }
}
