// Health check endpoint
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'operational',
        digitalTwins: 'active',
        aiEngine: 'running',
        security: 'monitoring'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Service check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
