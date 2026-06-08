import { NextRequest, NextResponse } from 'next/server'
import { enhancedDigitalTwinEngine, DigitalTwinState } from '@/services/enhancedDigitalTwinEngine'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const twinId = searchParams.get('twinId')
    const includeMetrics = searchParams.get('includeMetrics') === 'true'
    const includePredictions = searchParams.get('includePredictions') === 'true'

    if (twinId) {
      // Get specific Digital Twin
      const twin = enhancedDigitalTwinEngine.getTwin(twinId)
      if (!twin) {
        return NextResponse.json(
          { error: 'Digital Twin not found' },
          { status: 404 }
        )
      }

      const response: any = {
        id: twin.id,
        name: twin.name,
        type: twin.type,
        status: twin.isActive ? 'active' : 'inactive',
        healthScore: twin.healthScore,
        accuracy: twin.accuracy,
        lastSync: twin.lastSyncTime
      }

      if (includeMetrics) {
        response.realTimeMetrics = twin.realTimeMetrics
        response.state = twin.state
      }

      if (includePredictions) {
        response.predictions = twin.predictiveModel.predictions
        response.recommendations = twin.predictiveModel.recommendations
        response.anomalies = twin.realTimeMetrics.anomalies
      }

      return NextResponse.json(response)
    } else {
      // Get all Digital Twins
      const twins = enhancedDigitalTwinEngine.getAllTwins()
      
      const response = twins.map(twin => ({
        id: twin.id,
        name: twin.name,
        type: twin.type,
        status: twin.isActive ? 'active' : 'inactive',
        healthScore: twin.healthScore,
        accuracy: twin.accuracy,
        predictions: twin.realTimeMetrics.predictions,
        lastSync: twin.lastSyncTime,
        ...(includeMetrics && {
          realTimeMetrics: twin.realTimeMetrics,
          state: twin.state
        }),
        ...(includePredictions && {
          predictions: twin.predictiveModel.predictions,
          recommendations: twin.predictiveModel.recommendations,
          anomalies: twin.realTimeMetrics.anomalies
        })
      }))

      return NextResponse.json({
        twins: response,
        totalCount: twins.length,
        activeCount: twins.filter(t => t.isActive).length,
        averageHealth: twins.reduce((sum, t) => sum + t.healthScore, 0) / twins.length || 0,
        totalPredictions: twins.reduce((sum, t) => sum + t.realTimeMetrics.predictions, 0)
      })
    }
  } catch (error) {
    console.error('Digital Twins API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cloudResourceId, initialState, options } = body

    if (!cloudResourceId || !initialState) {
      return NextResponse.json(
        { error: 'cloudResourceId and initialState are required' },
        { status: 400 }
      )
    }

    // Validate initialState structure
    const requiredFields = ['cpu', 'memory', 'disk', 'network', 'requests', 'latency', 'errors', 'uptime']
    const missingFields = requiredFields.filter(field => !(field in initialState))
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields in initialState: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    const twin = await enhancedDigitalTwinEngine.createEnhancedTwin(
      cloudResourceId,
      initialState as DigitalTwinState,
      options
    )

    return NextResponse.json({
      id: twin.id,
      name: twin.name,
      type: twin.type,
      status: twin.isActive ? 'active' : 'inactive',
      healthScore: twin.healthScore,
      accuracy: twin.accuracy,
      createdAt: twin.createdAt,
      message: 'Digital Twin created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Digital Twin creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Digital Twin' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { twinId, action, parameters } = body

    if (!twinId || !action) {
      return NextResponse.json(
        { error: 'twinId and action are required' },
        { status: 400 }
      )
    }

    const twin = enhancedDigitalTwinEngine.getTwin(twinId)
    if (!twin) {
      return NextResponse.json(
        { error: 'Digital Twin not found' },
        { status: 404 }
      )
    }

    switch (action) {
      case 'start_monitoring':
        await enhancedDigitalTwinEngine.startRealTimeMonitoring(twinId)
        break
      
      case 'stop_monitoring':
        // In a real implementation, we'd have a stop method
        twin.isActive = false
        break
      
      case 'run_simulation':
        if (!parameters || !parameters.scenario) {
          return NextResponse.json(
            { error: 'scenario parameters required for simulation' },
            { status: 400 }
          )
        }
        
        const result = await enhancedDigitalTwinEngine.runSimulation(twinId, parameters.scenario)
        return NextResponse.json({
          twinId,
          simulationResult: result,
          message: 'Simulation completed successfully'
        })
      
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    const updatedTwin = enhancedDigitalTwinEngine.getTwin(twinId)
    return NextResponse.json({
      id: updatedTwin!.id,
      name: updatedTwin!.name,
      status: updatedTwin!.isActive ? 'active' : 'inactive',
      message: `Action ${action} completed successfully`
    })
  } catch (error) {
    console.error('Digital Twin update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update Digital Twin' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const twinId = searchParams.get('twinId')

    if (!twinId) {
      return NextResponse.json(
        { error: 'twinId is required' },
        { status: 400 }
      )
    }

    const twin = enhancedDigitalTwinEngine.getTwin(twinId)
    if (!twin) {
      return NextResponse.json(
        { error: 'Digital Twin not found' },
        { status: 404 }
      )
    }

    // In a real implementation, we'd have a deleteTwin method
    // For now, just mark as inactive
    twin.isActive = false

    return NextResponse.json({
      message: 'Digital Twin deactivated successfully',
      twinId
    })
  } catch (error) {
    console.error('Digital Twin deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete Digital Twin' },
      { status: 500 }
    )
  }
}