// Digital Twin Simulation API
import { NextRequest, NextResponse } from 'next/server'
import { digitalTwinEngine } from '@/services/digitalTwinEngine'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const twinId = params.id
    const body = await request.json()
    const { scenario, parameters } = body

    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario is required' },
        { status: 400 }
      )
    }

    const simulation = await digitalTwinEngine.runSimulation(
      twinId,
      scenario,
      parameters || {}
    )

    return NextResponse.json({
      success: true,
      data: simulation,
      message: 'Simulation completed successfully'
    })
  } catch (error) {
    console.error('Simulation API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to run simulation' },
      { status: 500 }
    )
  }
}
