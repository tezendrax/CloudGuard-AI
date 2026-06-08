import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  enhancedDigitalTwinEngine,
  EnhancedDigitalTwin,
  DigitalTwinState,
  PredictiveModel,
  AnomalyDetection,
  Recommendation,
  SimulationScenario
} from '@/services/enhancedDigitalTwinEngine'

interface UseEnhancedDigitalTwinReturn {
  twins: EnhancedDigitalTwin[]
  isLoading: boolean
  error: string | null
  systemStats: {
    totalTwins: number
    activeTwins: number
    averageAccuracy: number
    averageHealth: number
    totalPredictions: number
    criticalAlerts: number
  }
  alerts: Alert[]
  createTwin: (cloudResourceId: string, initialState: DigitalTwinState) => Promise<EnhancedDigitalTwin>
  startMonitoring: (twinId: string) => Promise<void>
  stopMonitoring: (twinId: string) => Promise<void>
  runSimulation: (twinId: string, scenario: SimulationScenario) => Promise<DigitalTwinState>
  clearAlerts: () => void
  refreshTwins: () => Promise<void>
}

interface Alert {
  id: string
  type: 'warning' | 'critical' | 'info'
  twinId: string
  message: string
  timestamp: Date
  metric?: string
  value?: number
}

export function useEnhancedDigitalTwin(): UseEnhancedDigitalTwinReturn {
  const [twins, setTwins] = useState<EnhancedDigitalTwin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const engineInitialized = useRef(false)

  // Initialize the Digital Twin Engine
  useEffect(() => {
    const initializeEngine = async () => {
      if (engineInitialized.current) return

      try {
        setIsLoading(true)
        await enhancedDigitalTwinEngine.initialize()
        
        // Create initial Digital Twins for demo
        await createInitialTwins()
        
        engineInitialized.current = true
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize Digital Twin Engine')
        console.error('Digital Twin Engine initialization failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initializeEngine()

    return () => {
      if (engineInitialized.current) {
        enhancedDigitalTwinEngine.shutdown()
        engineInitialized.current = false
      }
    }
  }, [])

  // Set up event listeners for real-time updates
  useEffect(() => {
    const handleMetricsUpdate = (data: { twinId: string; metrics: DigitalTwinState }) => {
      setTwins(prev => prev.map(twin => 
        twin.id === data.twinId 
          ? { ...twin, state: data.metrics, lastSyncTime: new Date() }
          : twin
      ))
    }

    const handlePredictionsGenerated = (data: { twinId: string; predictions: any }) => {
      setTwins(prev => prev.map(twin => 
        twin.id === data.twinId 
          ? { 
              ...twin, 
              predictiveModel: { ...twin.predictiveModel, predictions: data.predictions },
              realTimeMetrics: { ...twin.realTimeMetrics, predictions: twin.realTimeMetrics.predictions + 1 }
            }
          : twin
      ))
    }

    const handleAlert = (alertData: any) => {
      const newAlert: Alert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: alertData.type || (alertData.value >= alertData.threshold ? 'critical' : 'warning'),
        twinId: alertData.twinId,
        message: alertData.message,
        timestamp: new Date(),
        metric: alertData.metric,
        value: alertData.value
      }
      
      setAlerts(prev => [newAlert, ...prev].slice(0, 50)) // Keep last 50 alerts
    }

    const handleEngineStarted = () => {
      console.log('✅ Digital Twin Engine started successfully')
    }

    const handleEngineError = (error: any) => {
      console.error('❌ Digital Twin Engine error:', error)
      setError(`Engine error: ${error.message || error}`)
    }

    // Subscribe to events
    enhancedDigitalTwinEngine.on('metrics:updated', handleMetricsUpdate)
    enhancedDigitalTwinEngine.on('predictions:generated', handlePredictionsGenerated)
    enhancedDigitalTwinEngine.on('alert:warning', handleAlert)
    enhancedDigitalTwinEngine.on('alert:critical', handleAlert)
    enhancedDigitalTwinEngine.on('engine:started', handleEngineStarted)
    enhancedDigitalTwinEngine.on('engine:error', handleEngineError)

    return () => {
      enhancedDigitalTwinEngine.removeListener('metrics:updated', handleMetricsUpdate)
      enhancedDigitalTwinEngine.removeListener('predictions:generated', handlePredictionsGenerated)
      enhancedDigitalTwinEngine.removeListener('alert:warning', handleAlert)
      enhancedDigitalTwinEngine.removeListener('alert:critical', handleAlert)
      enhancedDigitalTwinEngine.removeListener('engine:started', handleEngineStarted)
      enhancedDigitalTwinEngine.removeListener('engine:error', handleEngineError)
    }
  }, [])

  // Create initial Digital Twins for demonstration
  const createInitialTwins = async () => {
    try {
      const initialTwinsData = [
        {
          cloudResourceId: 'web-server-cluster-01',
          initialState: {
            cpu: 45.2,
            memory: 68.5,
            disk: 34.8,
            network: { incoming: 125.4, outgoing: 89.2 },
            requests: 1250,
            latency: 45,
            errors: 2,
            uptime: 99.8,
            customMetrics: {}
          }
        },
        {
          cloudResourceId: 'production-database-01',
          initialState: {
            cpu: 62.8,
            memory: 78.2,
            disk: 45.6,
            network: { incoming: 89.3, outgoing: 156.7 },
            requests: 890,
            latency: 12,
            errors: 0,
            uptime: 99.9,
            customMetrics: {}
          }
        },
        {
          cloudResourceId: 'storage-array-01',
          initialState: {
            cpu: 15.3,
            memory: 25.6,
            disk: 67.2,
            network: { incoming: 45.2, outgoing: 123.8 },
            requests: 234,
            latency: 8,
            errors: 0,
            uptime: 99.9,
            customMetrics: {}
          }
        },
        {
          cloudResourceId: 'load-balancer-01',
          initialState: {
            cpu: 28.7,
            memory: 45.2,
            disk: 12.8,
            network: { incoming: 234.5, outgoing: 198.3 },
            requests: 2100,
            latency: 3,
            errors: 1,
            uptime: 99.7,
            customMetrics: {}
          }
        },
        {
          cloudResourceId: 'api-gateway-01',
          initialState: {
            cpu: 38.4,
            memory: 52.1,
            disk: 18.9,
            network: { incoming: 345.2, outgoing: 289.6 },
            requests: 3200,
            latency: 25,
            errors: 5,
            uptime: 99.6,
            customMetrics: {}
          }
        },
        {
          cloudResourceId: 'microservices-cluster-01',
          initialState: {
            cpu: 56.8,
            memory: 71.4,
            disk: 28.3,
            network: { incoming: 189.7, outgoing: 234.1 },
            requests: 1890,
            latency: 35,
            errors: 8,
            uptime: 99.4,
            customMetrics: {}
          }
        }
      ]

      const createdTwins = await Promise.all(
        initialTwinsData.map(data => 
          enhancedDigitalTwinEngine.createEnhancedTwin(data.cloudResourceId, data.initialState, {
            enableRealTime: true,
            enablePredictions: true,
            enableAnomalyDetection: true
          })
        )
      )

      setTwins(createdTwins)
    } catch (err) {
      console.error('Failed to create initial twins:', err)
      setError('Failed to create initial Digital Twins')
    }
  }

  // Create a new Digital Twin
  const createTwin = useCallback(async (
    cloudResourceId: string, 
    initialState: DigitalTwinState
  ): Promise<EnhancedDigitalTwin> => {
    try {
      const twin = await enhancedDigitalTwinEngine.createEnhancedTwin(cloudResourceId, initialState)
      setTwins(prev => [...prev, twin])
      return twin
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create Digital Twin'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // Start monitoring for a specific twin
  const startMonitoring = useCallback(async (twinId: string): Promise<void> => {
    try {
      await enhancedDigitalTwinEngine.startRealTimeMonitoring(twinId)
      setTwins(prev => prev.map(twin => 
        twin.id === twinId ? { ...twin, isActive: true } : twin
      ))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start monitoring'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // Stop monitoring for a specific twin
  const stopMonitoring = useCallback(async (twinId: string): Promise<void> => {
    try {
      // In a real implementation, we'd have a stopRealTimeMonitoring method
      setTwins(prev => prev.map(twin => 
        twin.id === twinId ? { ...twin, isActive: false } : twin
      ))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop monitoring'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // Run simulation scenario
  const runSimulation = useCallback(async (
    twinId: string, 
    scenario: SimulationScenario
  ): Promise<DigitalTwinState> => {
    try {
      const result = await enhancedDigitalTwinEngine.runSimulation(twinId, scenario)
      
      // Add info alert about simulation
      const simulationAlert: Alert = {
        id: `sim-${Date.now()}`,
        type: 'info',
        twinId,
        message: `Simulation "${scenario.name}" completed successfully`,
        timestamp: new Date()
      }
      setAlerts(prev => [simulationAlert, ...prev])
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Simulation failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // Clear all alerts
  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  // Refresh twins data
  const refreshTwins = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      const allTwins = enhancedDigitalTwinEngine.getAllTwins()
      setTwins(allTwins)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh twins'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Calculate system statistics
  const systemStats = {
    totalTwins: twins.length,
    activeTwins: twins.filter(twin => twin.isActive).length,
    averageAccuracy: twins.length > 0 
      ? twins.reduce((sum, twin) => sum + twin.accuracy, 0) / twins.length 
      : 0,
    averageHealth: twins.length > 0 
      ? twins.reduce((sum, twin) => sum + twin.healthScore, 0) / twins.length 
      : 0,
    totalPredictions: twins.reduce((sum, twin) => sum + twin.realTimeMetrics.predictions, 0),
    criticalAlerts: alerts.filter(alert => alert.type === 'critical').length
  }

  return {
    twins,
    isLoading,
    error,
    systemStats,
    alerts,
    createTwin,
    startMonitoring,
    stopMonitoring,
    runSimulation,
    clearAlerts,
    refreshTwins
  }
}

export default useEnhancedDigitalTwin
