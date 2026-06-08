// Digital Twin Predictions API
import { NextRequest, NextResponse } from 'next/server'
import { digitalTwinEngine } from '@/services/digitalTwinEngine'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const twinId = params.id
    const predictions = digitalTwinEngine.getPredictions(twinId)

    return NextResponse.json({
      success: true,
      data: predictions,
      count: predictions.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Predictions API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch predictions' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const twinId = params.id
    const predictions = await digitalTwinEngine.generatePredictions(twinId)

    return NextResponse.json({
      success: true,
      data: predictions,
      message: 'New predictions generated successfully'
    })
  } catch (error) {
    console.error('Generate Predictions Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate predictions' },
      { status: 500 }
    )
  }
}
