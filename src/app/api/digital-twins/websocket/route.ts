import { NextRequest, NextResponse } from 'next/server'
import { enhancedDigitalTwinEngine } from '@/services/enhancedDigitalTwinEngine'

// WebSocket connection handler for real-time Digital Twin updates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const twinId = searchParams.get('twinId')
    
    // Check if this is a WebSocket upgrade request
    const upgrade = request.headers.get('upgrade')
    if (upgrade !== 'websocket') {
      return NextResponse.json(
        { 
          error: 'WebSocket upgrade required',
          endpoint: '/api/digital-twins/websocket',
          usage: 'Connect with WebSocket to receive real-time updates'
        },
        { status: 426 }
      )
    }

    // In a real implementation, we would handle WebSocket upgrades here
    // For demonstration, we'll return connection info
    return NextResponse.json({
      message: 'WebSocket endpoint for real-time Digital Twin updates',
      supportedEvents: [
        'metrics:updated',
        'predictions:generated',
        'alert:warning',
        'alert:critical',
        'twin:created',
        'twin:updated',
        'simulation:completed'
      ],
      usage: {
        connect: 'ws://localhost:3000/api/digital-twins/websocket',
        subscribe: 'Send {"action": "subscribe", "twinId": "twin_id"} to subscribe to specific twin',
        unsubscribe: 'Send {"action": "unsubscribe", "twinId": "twin_id"} to unsubscribe'
      }
    })
  } catch (error) {
    console.error('WebSocket endpoint error:', error)
    return NextResponse.json(
      { error: 'WebSocket setup failed' },
      { status: 500 }
    )
  }
}

// SSE (Server-Sent Events) endpoint for real-time updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, twinId } = body

    if (action === 'stream') {
      // Set up SSE stream
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder()

          // Send initial connection message
          const initialData = `data: ${JSON.stringify({
            type: 'connection',
            message: 'Connected to Digital Twin real-time stream',
            timestamp: new Date().toISOString()
          })}\n\n`
          controller.enqueue(encoder.encode(initialData))

          // Set up event listeners for Digital Twin updates
          const handleMetricsUpdate = (data: any) => {
            if (!twinId || data.twinId === twinId) {
              const eventData = `data: ${JSON.stringify({
                type: 'metrics:updated',
                twinId: data.twinId,
                metrics: data.metrics,
                timestamp: new Date().toISOString()
              })}\n\n`
              controller.enqueue(encoder.encode(eventData))
            }
          }

          const handlePredictionsGenerated = (data: any) => {
            if (!twinId || data.twinId === twinId) {
              const eventData = `data: ${JSON.stringify({
                type: 'predictions:generated',
                twinId: data.twinId,
                predictions: data.predictions,
                timestamp: new Date().toISOString()
              })}\n\n`
              controller.enqueue(encoder.encode(eventData))
            }
          }

          const handleAlert = (data: any) => {
            if (!twinId || data.twinId === twinId) {
              const eventData = `data: ${JSON.stringify({
                type: 'alert',
                twinId: data.twinId,
                alert: data,
                timestamp: new Date().toISOString()
              })}\n\n`
              controller.enqueue(encoder.encode(eventData))
            }
          }

          // Subscribe to events
          enhancedDigitalTwinEngine.on('metrics:updated', handleMetricsUpdate)
          enhancedDigitalTwinEngine.on('predictions:generated', handlePredictionsGenerated)
          enhancedDigitalTwinEngine.on('alert:warning', handleAlert)
          enhancedDigitalTwinEngine.on('alert:critical', handleAlert)

          // Send periodic heartbeat
          const heartbeatInterval = setInterval(() => {
            const heartbeat = `data: ${JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date().toISOString()
            })}\n\n`
            controller.enqueue(encoder.encode(heartbeat))
          }, 30000) // Every 30 seconds

          // Cleanup function
          const cleanup = () => {
            clearInterval(heartbeatInterval)
            enhancedDigitalTwinEngine.removeListener('metrics:updated', handleMetricsUpdate)
            enhancedDigitalTwinEngine.removeListener('predictions:generated', handlePredictionsGenerated)
            enhancedDigitalTwinEngine.removeListener('alert:warning', handleAlert)
            enhancedDigitalTwinEngine.removeListener('alert:critical', handleAlert)
          }

          // Handle stream cancellation
          return cleanup
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "stream" to start SSE connection.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('SSE endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to establish SSE connection' },
      { status: 500 }
    )
  }
}
