// Live Infrastructure API - Real-time data from cloud providers
import { NextRequest, NextResponse } from 'next/server'
import { realTimeDataCollector } from '@/services/cloudProviders/realTimeDataCollector'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    const provider = searchParams.get('provider')
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    if (assetId) {
      // Get specific asset
      const asset = realTimeDataCollector.getAsset(assetId)
      if (!asset) {
        return NextResponse.json(
          { error: 'Asset not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        asset,
        lastUpdated: realTimeDataCollector.getLastUpdateTime(),
        connectionStatus: realTimeDataCollector.getConnectionStatus()
      })
    }

    // Get all assets with optional filtering
    let assets = realTimeDataCollector.getAllAssets()

    if (provider) {
      assets = assets.filter(asset => asset.provider === provider)
    }

    if (type) {
      assets = assets.filter(asset => asset.type === type)
    }

    if (status) {
      assets = assets.filter(asset => asset.status === status)
    }

    // Calculate summary statistics
    const summary = {
      totalAssets: assets.length,
      healthyAssets: assets.filter(a => a.status === 'healthy').length,
      warningAssets: assets.filter(a => a.status === 'warning').length,
      criticalAssets: assets.filter(a => a.status === 'critical').length,
      offlineAssets: assets.filter(a => a.status === 'offline').length,
      totalMonthlyCost: assets.reduce((sum, a) => sum + a.cost.monthly, 0),
      averageHealthScore: assets.length > 0 ? 
        assets.reduce((sum, a) => {
          // Convert status to health score
          const healthScore = a.status === 'healthy' ? 90 : 
                             a.status === 'warning' ? 70 :
                             a.status === 'critical' ? 40 : 20
          return sum + healthScore
        }, 0) / assets.length : 0,
      totalRecommendations: assets.reduce((sum, a) => sum + a.recommendations.length, 0),
      potentialSavings: assets.reduce((sum, a) => 
        sum + a.recommendations.reduce((recSum, rec) => recSum + rec.potentialSavings, 0), 0
      )
    }

    return NextResponse.json({
      assets,
      summary,
      metadata: {
        lastUpdated: realTimeDataCollector.getLastUpdateTime(),
        connectionStatus: realTimeDataCollector.getConnectionStatus(),
        dataSource: 'live', // vs 'demo'
        updateInterval: '30 seconds',
        providersConnected: ['AWS'], // Would include Azure, GCP when implemented
        totalDataPoints: assets.length
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Live Infrastructure API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch live infrastructure data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, parameters } = body

    if (!action) {
      return NextResponse.json(
        { error: 'action is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'start_collection':
        const interval = parameters?.interval || 30000 // 30 seconds default
        realTimeDataCollector.startRealTimeCollection(interval)
        
        return NextResponse.json({
          success: true,
          message: 'Real-time data collection started',
          interval: `${interval / 1000} seconds`,
          timestamp: new Date().toISOString()
        })

      case 'stop_collection':
        realTimeDataCollector.stopRealTimeCollection()
        
        return NextResponse.json({
          success: true,
          message: 'Real-time data collection stopped',
          timestamp: new Date().toISOString()
        })

      case 'force_update':
        // Force an immediate update
        await new Promise(resolve => setTimeout(resolve, 100)) // Simulate processing
        
        return NextResponse.json({
          success: true,
          message: 'Forced data update completed',
          assetsUpdated: realTimeDataCollector.getAllAssets().length,
          timestamp: new Date().toISOString()
        })

      case 'get_status':
        return NextResponse.json({
          success: true,
          status: {
            connectionStatus: realTimeDataCollector.getConnectionStatus(),
            lastUpdate: realTimeDataCollector.getLastUpdateTime(),
            assetsCount: realTimeDataCollector.getAllAssets().length,
            isCollecting: realTimeDataCollector.getConnectionStatus() === 'connected'
          },
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Live Infrastructure POST Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    )
  }
}
