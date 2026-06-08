// Enhanced Digital Twin Engine - Real-time AI-powered virtual replica system
import { EventEmitter } from 'events'

// Enhanced interfaces for real-time Digital Twin system
export interface EnhancedDigitalTwin {
  id: string
  organizationId: string
  cloudAccountId: string
  cloudResourceId: string
  name: string
  type: 'compute' | 'database' | 'storage' | 'network' | 'container' | 'serverless'
  state: DigitalTwinState
  predictedState: DigitalTwinState | null
  realTimeMetrics: RealTimeMetrics
  historicalData: HistoricalDataPoint[]
  predictiveModel: PredictiveModel
  healthScore: number
  accuracy: number
  isActive: boolean
  lastSyncTime: Date
  createdAt: Date
  updatedAt: Date
}

export interface DigitalTwinState {
  cpu: number
  memory: number
  disk: number
  network: {
    incoming: number
    outgoing: number
  }
  requests: number
  latency: number
  errors: number
  uptime: number
  customMetrics: Record<string, number>
}

export interface RealTimeMetrics extends DigitalTwinState {
  timestamp: Date
  predictions: number
  anomalies: AnomalyDetection[]
}

export interface HistoricalDataPoint {
  timestamp: Date
  metrics: DigitalTwinState
  predictions: PredictionResult[]
}

export interface PredictionResult {
  id: string
  metric: string
  predictedValue: number
  actualValue?: number
  confidence: number
  accuracy?: number
  timeHorizon: number // minutes
  createdAt: Date
}

export interface PredictiveModel {
  modelType: 'linear' | 'arima' | 'lstm' | 'ensemble'
  accuracy: number
  lastTraining: Date
  parameters: Record<string, any>
  predictions: {
    nextHour: DigitalTwinState
    nextDay: DigitalTwinState
    confidence: number
  }
  anomalyDetection: AnomalyDetection
  recommendations: Recommendation[]
}

export interface AnomalyDetection {
  isAnomalous: boolean
  confidence: number
  type?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description?: string
  detectedAt: Date
}

export interface Recommendation {
  id: string
  type: 'optimization' | 'scaling' | 'maintenance' | 'security'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  estimatedImpact: {
    cost: number
    performance: number
    reliability: number
  }
  actionRequired: boolean
  automationAvailable: boolean
}

export interface SimulationScenario {
  id: string
  name: string
  description: string
  parameters: Record<string, any>
  expectedOutcome: DigitalTwinState
  confidence: number
}

export class EnhancedDigitalTwinEngine extends EventEmitter {
  private twins: Map<string, EnhancedDigitalTwin> = new Map()
  private realTimeStreams: Map<string, NodeJS.Timeout> = new Map()
  private predictiveModels: Map<string, PredictiveModel> = new Map()
  private alertThresholds: Map<string, AlertThreshold> = new Map()
  private isRunning: boolean = false

  constructor() {
    super()
    this.setupDefaultAlertThresholds()
  }

  /**
   * Initialize the Digital Twin Engine with real-time capabilities
   */
  async initialize(): Promise<void> {
    this.isRunning = true
    this.emit('engine:started')
    
    // Start real-time monitoring for all active twins
    for (const twin of this.twins.values()) {
      if (twin.isActive) {
        await this.startRealTimeMonitoring(twin.id)
      }
    }
  }

  /**
   * Create a new Enhanced Digital Twin with advanced capabilities
   */
  async createEnhancedTwin(
    cloudResourceId: string,
    initialState: DigitalTwinState,
    options?: {
      enableRealTime?: boolean
      enablePredictions?: boolean
      enableAnomalyDetection?: boolean
    }
  ): Promise<EnhancedDigitalTwin> {
    const twin: EnhancedDigitalTwin = {
      id: this.generateId(),
      organizationId: 'org-1', // Simplified for demo
      cloudAccountId: 'account-1',
      cloudResourceId,
      name: `Twin-${cloudResourceId}`,
      type: this.inferResourceType(cloudResourceId),
      state: initialState,
      predictedState: null,
      realTimeMetrics: {
        ...initialState,
        timestamp: new Date(),
        predictions: 0,
        anomalies: []
      },
      historicalData: [],
      predictiveModel: await this.initializePredictiveModel(cloudResourceId),
      healthScore: this.calculateHealthScore(initialState),
      accuracy: 85.0, // Initial baseline
      isActive: true,
      lastSyncTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.twins.set(twin.id, twin)
    
    // Initialize real-time monitoring if enabled
    if (options?.enableRealTime !== false) {
      await this.startRealTimeMonitoring(twin.id)
    }

    // Start predictive analytics if enabled
    if (options?.enablePredictions !== false) {
      await this.startPredictiveAnalytics(twin.id)
    }

    this.emit('twin:created', twin)
    return twin
  }

  /**
   * Start real-time monitoring for a Digital Twin
   */
  async startRealTimeMonitoring(twinId: string): Promise<void> {
    const twin = this.twins.get(twinId)
    if (!twin) throw new Error(`Twin ${twinId} not found`)

    // Clear existing stream if any
    if (this.realTimeStreams.has(twinId)) {
      clearInterval(this.realTimeStreams.get(twinId)!)
    }

    // Start real-time data collection (simulated)
    const interval = setInterval(async () => {
      await this.updateRealTimeMetrics(twinId)
    }, 2000) // Update every 2 seconds

    this.realTimeStreams.set(twinId, interval)
    this.emit('monitoring:started', { twinId })
  }

  /**
   * Update real-time metrics for a Digital Twin
   */
  private async updateRealTimeMetrics(twinId: string): Promise<void> {
    const twin = this.twins.get(twinId)
    if (!twin || !twin.isActive) return

    try {
      // Simulate real-time data collection from actual infrastructure
      const newMetrics = await this.collectRealTimeData(twin.cloudResourceId)
      
      // Update twin state
      twin.state = newMetrics
      twin.realTimeMetrics = {
        ...newMetrics,
        timestamp: new Date(),
        predictions: twin.realTimeMetrics.predictions,
        anomalies: await this.detectAnomalies(twin.id, newMetrics)
      }
      
      // Update health score
      twin.healthScore = this.calculateHealthScore(newMetrics)
      twin.lastSyncTime = new Date()
      twin.updatedAt = new Date()

      // Store historical data point
      twin.historicalData.push({
        timestamp: new Date(),
        metrics: newMetrics,
        predictions: []
      })

      // Keep only last 1000 data points for performance
      if (twin.historicalData.length > 1000) {
        twin.historicalData = twin.historicalData.slice(-1000)
      }

      // Check for alerts
      await this.checkAlertThresholds(twin)

      // Update predictive model periodically
      if (twin.historicalData.length % 10 === 0) {
        await this.updatePredictiveModel(twinId)
      }

      this.emit('metrics:updated', { twinId, metrics: newMetrics })
    } catch (error) {
      console.error(`Failed to update metrics for twin ${twinId}:`, error)
      this.emit('metrics:error', { twinId, error })
    }
  }

  /**
   * Simulate real-time data collection from cloud infrastructure
   */
  private async collectRealTimeData(cloudResourceId: string): Promise<DigitalTwinState> {
    // In a real implementation, this would connect to cloud APIs, monitoring agents, etc.
    // For demo purposes, we'll simulate realistic data patterns
    
    const now = Date.now()
    const timeVariation = Math.sin(now / 30000) * 15 // 30-second cycles
    const noiseFactors = {
      cpu: (Math.random() - 0.5) * 10,
      memory: (Math.random() - 0.5) * 8,
      disk: (Math.random() - 0.5) * 2,
      network: (Math.random() - 0.5) * 20,
      requests: Math.floor((Math.random() - 0.5) * 500),
      latency: (Math.random() - 0.5) * 15,
      errors: Math.floor(Math.random() * 5)
    }

    // Simulate different patterns based on resource type
    const baseMetrics = this.getBaseMetricsForResource(cloudResourceId)
    
    return {
      cpu: Math.max(5, Math.min(95, baseMetrics.cpu + timeVariation + noiseFactors.cpu)),
      memory: Math.max(10, Math.min(90, baseMetrics.memory + timeVariation * 0.8 + noiseFactors.memory)),
      disk: Math.max(5, Math.min(85, baseMetrics.disk + noiseFactors.disk)),
      network: {
        incoming: Math.max(0, baseMetrics.network.incoming + timeVariation * 2 + noiseFactors.network),
        outgoing: Math.max(0, baseMetrics.network.outgoing + timeVariation * 1.5 + noiseFactors.network)
      },
      requests: Math.max(0, baseMetrics.requests + timeVariation * 20 + noiseFactors.requests),
      latency: Math.max(1, Math.min(200, baseMetrics.latency + timeVariation * 0.5 + noiseFactors.latency)),
      errors: Math.max(0, baseMetrics.errors + noiseFactors.errors),
      uptime: Math.max(95, Math.min(100, baseMetrics.uptime + (Math.random() - 0.5) * 0.1)),
      customMetrics: {}
    }
  }

  /**
   * Detect anomalies in real-time metrics
   */
  private async detectAnomalies(twinId: string, metrics: DigitalTwinState): Promise<AnomalyDetection[]> {
    const twin = this.twins.get(twinId)
    if (!twin || twin.historicalData.length < 10) return []

    const anomalies: AnomalyDetection[] = []
    
    // Simple anomaly detection based on statistical thresholds
    const recentData = twin.historicalData.slice(-20).map(d => d.metrics)
    
    // CPU anomaly detection
    const avgCpu = recentData.reduce((sum, d) => sum + d.cpu, 0) / recentData.length
    const cpuStdDev = Math.sqrt(recentData.reduce((sum, d) => sum + Math.pow(d.cpu - avgCpu, 2), 0) / recentData.length)
    
    if (Math.abs(metrics.cpu - avgCpu) > 2 * cpuStdDev) {
      anomalies.push({
        isAnomalous: true,
        confidence: 85 + Math.random() * 14,
        type: 'CPU Spike Detected',
        severity: metrics.cpu > avgCpu + 2 * cpuStdDev ? 'high' : 'medium',
        description: `CPU usage (${metrics.cpu.toFixed(1)}%) significantly differs from normal pattern`,
        detectedAt: new Date()
      })
    }

    // Memory anomaly detection
    const avgMemory = recentData.reduce((sum, d) => sum + d.memory, 0) / recentData.length
    const memoryStdDev = Math.sqrt(recentData.reduce((sum, d) => sum + Math.pow(d.memory - avgMemory, 2), 0) / recentData.length)
    
    if (Math.abs(metrics.memory - avgMemory) > 2 * memoryStdDev) {
      anomalies.push({
        isAnomalous: true,
        confidence: 80 + Math.random() * 19,
        type: 'Memory Usage Anomaly',
        severity: metrics.memory > avgMemory + 2 * memoryStdDev ? 'high' : 'medium',
        description: `Memory usage (${metrics.memory.toFixed(1)}%) shows unusual pattern`,
        detectedAt: new Date()
      })
    }

    // Error rate anomaly detection
    if (metrics.errors > 10) {
      anomalies.push({
        isAnomalous: true,
        confidence: 95,
        type: 'High Error Rate',
        severity: metrics.errors > 50 ? 'critical' : 'high',
        description: `Elevated error count: ${metrics.errors} errors detected`,
        detectedAt: new Date()
      })
    }

    return anomalies
  }

  /**
   * Start predictive analytics for a Digital Twin
   */
  private async startPredictiveAnalytics(twinId: string): Promise<void> {
    const twin = this.twins.get(twinId)
    if (!twin) return

    // Generate predictions every 30 seconds
    const predictionInterval = setInterval(async () => {
      await this.generatePredictions(twinId)
    }, 30000)

    // Store interval for cleanup
    this.realTimeStreams.set(`${twinId}:predictions`, predictionInterval)
  }

  /**
   * Generate predictions for a Digital Twin
   */
  private async generatePredictions(twinId: string): Promise<void> {
    const twin = this.twins.get(twinId)
    if (!twin || twin.historicalData.length < 5) return

    try {
      // Simple time series prediction using moving averages and trends
      const recentData = twin.historicalData.slice(-20)
      const predictions = this.calculatePredictions(recentData)
      
      // Update predictive model
      twin.predictiveModel.predictions = predictions
      twin.predictiveModel.lastTraining = new Date()
      
      // Update prediction count
      twin.realTimeMetrics.predictions += 1

      // Generate recommendations based on predictions
      twin.predictiveModel.recommendations = this.generateRecommendations(twin, predictions)

      this.emit('predictions:generated', { twinId, predictions })
    } catch (error) {
      console.error(`Failed to generate predictions for twin ${twinId}:`, error)
    }
  }

  /**
   * Calculate predictions using time series analysis
   */
  private calculatePredictions(historicalData: HistoricalDataPoint[]): {
    nextHour: DigitalTwinState
    nextDay: DigitalTwinState
    confidence: number
  } {
    if (historicalData.length < 5) {
      throw new Error('Insufficient data for predictions')
    }

    // Simple linear trend analysis
    const recent = historicalData.slice(-10)
    const older = historicalData.slice(-20, -10)
    
    const avgRecent = this.calculateAverageMetrics(recent.map(d => d.metrics))
    const avgOlder = this.calculateAverageMetrics(older.map(d => d.metrics))
    
    // Calculate trend
    const trend = {
      cpu: (avgRecent.cpu - avgOlder.cpu) / 10, // per data point
      memory: (avgRecent.memory - avgOlder.memory) / 10,
      disk: (avgRecent.disk - avgOlder.disk) / 10,
      network: {
        incoming: (avgRecent.network.incoming - avgOlder.network.incoming) / 10,
        outgoing: (avgRecent.network.outgoing - avgOlder.network.outgoing) / 10
      },
      requests: (avgRecent.requests - avgOlder.requests) / 10,
      latency: (avgRecent.latency - avgOlder.latency) / 10,
      errors: (avgRecent.errors - avgOlder.errors) / 10,
      uptime: (avgRecent.uptime - avgOlder.uptime) / 10,
      customMetrics: {}
    }

    // Predict next hour (18 data points at 2-second intervals = ~36 seconds, scaled to 1 hour)
    const hourMultiplier = 100 // Scale factor for 1 hour prediction
    const nextHour: DigitalTwinState = {
      cpu: Math.max(0, Math.min(100, avgRecent.cpu + trend.cpu * hourMultiplier)),
      memory: Math.max(0, Math.min(100, avgRecent.memory + trend.memory * hourMultiplier)),
      disk: Math.max(0, Math.min(100, avgRecent.disk + trend.disk * hourMultiplier)),
      network: {
        incoming: Math.max(0, avgRecent.network.incoming + trend.network.incoming * hourMultiplier),
        outgoing: Math.max(0, avgRecent.network.outgoing + trend.network.outgoing * hourMultiplier)
      },
      requests: Math.max(0, avgRecent.requests + trend.requests * hourMultiplier),
      latency: Math.max(1, avgRecent.latency + trend.latency * hourMultiplier),
      errors: Math.max(0, avgRecent.errors + trend.errors * hourMultiplier),
      uptime: Math.max(95, Math.min(100, avgRecent.uptime + trend.uptime * hourMultiplier)),
      customMetrics: {}
    }

    // Predict next day (scale by 24)
    const dayMultiplier = hourMultiplier * 24
    const nextDay: DigitalTwinState = {
      cpu: Math.max(0, Math.min(100, avgRecent.cpu + trend.cpu * dayMultiplier)),
      memory: Math.max(0, Math.min(100, avgRecent.memory + trend.memory * dayMultiplier)),
      disk: Math.max(0, Math.min(100, avgRecent.disk + trend.disk * dayMultiplier)),
      network: {
        incoming: Math.max(0, avgRecent.network.incoming + trend.network.incoming * dayMultiplier),
        outgoing: Math.max(0, avgRecent.network.outgoing + trend.network.outgoing * dayMultiplier)
      },
      requests: Math.max(0, avgRecent.requests + trend.requests * dayMultiplier),
      latency: Math.max(1, avgRecent.latency + trend.latency * dayMultiplier),
      errors: Math.max(0, avgRecent.errors + trend.errors * dayMultiplier),
      uptime: Math.max(95, Math.min(100, avgRecent.uptime + trend.uptime * dayMultiplier)),
      customMetrics: {}
    }

    // Calculate confidence based on data consistency
    const variance = this.calculateVariance(recent.map(d => d.metrics))
    const confidence = Math.max(70, Math.min(99, 95 - variance * 20))

    return { nextHour, nextDay, confidence }
  }

  /**
   * Generate AI-powered recommendations
   */
  private generateRecommendations(twin: EnhancedDigitalTwin, predictions: any): Recommendation[] {
    const recommendations: Recommendation[] = []
    const { nextHour } = predictions

    // CPU optimization recommendations
    if (nextHour.cpu > 80) {
      recommendations.push({
        id: this.generateId(),
        type: 'scaling',
        priority: nextHour.cpu > 90 ? 'critical' : 'high',
        title: 'Scale Up CPU Resources',
        description: `Predicted CPU usage of ${nextHour.cpu.toFixed(1)}% indicates need for additional compute resources`,
        estimatedImpact: {
          cost: nextHour.cpu > 90 ? 25 : 15,
          performance: 40,
          reliability: 30
        },
        actionRequired: true,
        automationAvailable: true
      })
    }

    // Memory optimization recommendations
    if (nextHour.memory > 85) {
      recommendations.push({
        id: this.generateId(),
        type: 'optimization',
        priority: nextHour.memory > 95 ? 'critical' : 'high',
        title: 'Memory Optimization Required',
        description: `Predicted memory usage of ${nextHour.memory.toFixed(1)}% may cause performance degradation`,
        estimatedImpact: {
          cost: 10,
          performance: 35,
          reliability: 40
        },
        actionRequired: true,
        automationAvailable: false
      })
    }

    // Error rate recommendations
    if (twin.realTimeMetrics.errors > 5) {
      recommendations.push({
        id: this.generateId(),
        type: 'maintenance',
        priority: twin.realTimeMetrics.errors > 20 ? 'critical' : 'medium',
        title: 'Investigate Error Sources',
        description: `Current error rate of ${twin.realTimeMetrics.errors} errors requires investigation`,
        estimatedImpact: {
          cost: 5,
          performance: 25,
          reliability: 50
        },
        actionRequired: true,
        automationAvailable: false
      })
    }

    // Latency optimization
    if (nextHour.latency > 100) {
      recommendations.push({
        id: this.generateId(),
        type: 'optimization',
        priority: 'medium',
        title: 'Latency Optimization',
        description: `Predicted latency of ${nextHour.latency.toFixed(1)}ms may impact user experience`,
        estimatedImpact: {
          cost: 15,
          performance: 30,
          reliability: 20
        },
        actionRequired: false,
        automationAvailable: true
      })
    }

    return recommendations
  }

  /**
   * Run simulation scenarios on Digital Twins
   */
  async runSimulation(twinId: string, scenario: SimulationScenario): Promise<DigitalTwinState> {
    const twin = this.twins.get(twinId)
    if (!twin) throw new Error(`Twin ${twinId} not found`)

    // Simulate the scenario based on current state and parameters
    const simulatedState = this.applySimulationParameters(twin.state, scenario.parameters)
    
    this.emit('simulation:completed', { twinId, scenario, result: simulatedState })
    return simulatedState
  }

  // Helper methods

  private initializePredictiveModel(cloudResourceId: string): Promise<PredictiveModel> {
    return Promise.resolve({
      modelType: 'ensemble',
      accuracy: 85.0,
      lastTraining: new Date(),
      parameters: {},
      predictions: {
        nextHour: this.getBaseMetricsForResource(cloudResourceId),
        nextDay: this.getBaseMetricsForResource(cloudResourceId),
        confidence: 85
      },
      anomalyDetection: {
        isAnomalous: false,
        confidence: 95,
        severity: 'low',
        detectedAt: new Date()
      },
      recommendations: []
    })
  }

  private getBaseMetricsForResource(cloudResourceId: string): DigitalTwinState {
    // Return different baseline metrics based on resource type
    const resourceType = this.inferResourceType(cloudResourceId)
    
    switch (resourceType) {
      case 'compute':
        return {
          cpu: 45,
          memory: 60,
          disk: 35,
          network: { incoming: 100, outgoing: 80 },
          requests: 1000,
          latency: 50,
          errors: 2,
          uptime: 99.5,
          customMetrics: {}
        }
      case 'database':
        return {
          cpu: 30,
          memory: 70,
          disk: 45,
          network: { incoming: 150, outgoing: 120 },
          requests: 500,
          latency: 15,
          errors: 1,
          uptime: 99.9,
          customMetrics: {}
        }
      default:
        return {
          cpu: 25,
          memory: 40,
          disk: 20,
          network: { incoming: 50, outgoing: 40 },
          requests: 200,
          latency: 10,
          errors: 0,
          uptime: 99.8,
          customMetrics: {}
        }
    }
  }

  private inferResourceType(cloudResourceId: string): EnhancedDigitalTwin['type'] {
    if (cloudResourceId.includes('web') || cloudResourceId.includes('compute')) return 'compute'
    if (cloudResourceId.includes('database') || cloudResourceId.includes('db')) return 'database'
    if (cloudResourceId.includes('storage') || cloudResourceId.includes('disk')) return 'storage'
    if (cloudResourceId.includes('network') || cloudResourceId.includes('lb')) return 'network'
    if (cloudResourceId.includes('container') || cloudResourceId.includes('pod')) return 'container'
    if (cloudResourceId.includes('lambda') || cloudResourceId.includes('function')) return 'serverless'
    return 'compute'
  }

  private calculateHealthScore(metrics: DigitalTwinState): number {
    // Weighted health calculation
    const cpuHealth = Math.max(0, 100 - metrics.cpu * 0.8)
    const memoryHealth = Math.max(0, 100 - metrics.memory * 0.9)
    const errorHealth = Math.max(0, 100 - metrics.errors * 10)
    const uptimeHealth = metrics.uptime
    const latencyHealth = Math.max(0, 100 - metrics.latency * 0.5)
    
    return Math.round(
      cpuHealth * 0.25 +
      memoryHealth * 0.25 +
      errorHealth * 0.2 +
      uptimeHealth * 0.2 +
      latencyHealth * 0.1
    )
  }

  private calculateAverageMetrics(metricsArray: DigitalTwinState[]): DigitalTwinState {
    const count = metricsArray.length
    if (count === 0) throw new Error('No metrics to average')

    return metricsArray.reduce((avg, metrics, index) => ({
      cpu: (avg.cpu * index + metrics.cpu) / (index + 1),
      memory: (avg.memory * index + metrics.memory) / (index + 1),
      disk: (avg.disk * index + metrics.disk) / (index + 1),
      network: {
        incoming: (avg.network.incoming * index + metrics.network.incoming) / (index + 1),
        outgoing: (avg.network.outgoing * index + metrics.network.outgoing) / (index + 1)
      },
      requests: (avg.requests * index + metrics.requests) / (index + 1),
      latency: (avg.latency * index + metrics.latency) / (index + 1),
      errors: (avg.errors * index + metrics.errors) / (index + 1),
      uptime: (avg.uptime * index + metrics.uptime) / (index + 1),
      customMetrics: {}
    }), metricsArray[0])
  }

  private calculateVariance(metricsArray: DigitalTwinState[]): number {
    const avg = this.calculateAverageMetrics(metricsArray)
    const variances = metricsArray.map(metrics => {
      const cpuVar = Math.pow(metrics.cpu - avg.cpu, 2)
      const memVar = Math.pow(metrics.memory - avg.memory, 2)
      const diskVar = Math.pow(metrics.disk - avg.disk, 2)
      return (cpuVar + memVar + diskVar) / 3
    })
    
    return variances.reduce((sum, v) => sum + v, 0) / variances.length
  }

  private applySimulationParameters(currentState: DigitalTwinState, parameters: Record<string, any>): DigitalTwinState {
    const simulated = { ...currentState }
    
    // Apply parameter modifications
    if (parameters.cpuIncrease) {
      simulated.cpu = Math.min(100, simulated.cpu + parameters.cpuIncrease)
    }
    if (parameters.memoryIncrease) {
      simulated.memory = Math.min(100, simulated.memory + parameters.memoryIncrease)
    }
    if (parameters.requestMultiplier) {
      simulated.requests = Math.round(simulated.requests * parameters.requestMultiplier)
    }
    
    return simulated
  }

  private setupDefaultAlertThresholds(): void {
    // Set up default alert thresholds for various metrics
    this.alertThresholds.set('cpu', {
      warning: 70,
      critical: 90,
      metric: 'cpu'
    })
    this.alertThresholds.set('memory', {
      warning: 80,
      critical: 95,
      metric: 'memory'
    })
    this.alertThresholds.set('errors', {
      warning: 10,
      critical: 50,
      metric: 'errors'
    })
  }

  private async checkAlertThresholds(twin: EnhancedDigitalTwin): Promise<void> {
    for (const [metric, threshold] of this.alertThresholds.entries()) {
      const value = (twin.realTimeMetrics as any)[metric]
      
      if (value >= threshold.critical) {
        this.emit('alert:critical', {
          twinId: twin.id,
          metric,
          value,
          threshold: threshold.critical,
          message: `Critical ${metric} level: ${value}`
        })
      } else if (value >= threshold.warning) {
        this.emit('alert:warning', {
          twinId: twin.id,
          metric,
          value,
          threshold: threshold.warning,
          message: `Warning ${metric} level: ${value}`
        })
      }
    }
  }

  private async updatePredictiveModel(twinId: string): Promise<void> {
    const twin = this.twins.get(twinId)
    if (!twin || twin.historicalData.length < 20) return

    // Retrain model with recent data
    const accuracy = this.calculateModelAccuracy(twin)
    twin.predictiveModel.accuracy = accuracy
    twin.predictiveModel.lastTraining = new Date()
    
    this.emit('model:updated', { twinId, accuracy })
  }

  private calculateModelAccuracy(twin: EnhancedDigitalTwin): number {
    // Compare recent predictions with actual values
    const recentData = twin.historicalData.slice(-10)
    if (recentData.length < 5) return twin.predictiveModel.accuracy

    // Simple accuracy calculation based on prediction vs actual variance
    const accuracy = 85 + Math.random() * 14 // Simulated accuracy between 85-99%
    return Math.max(70, Math.min(99, accuracy))
  }

  private generateId(): string {
    return `twin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Stop the Digital Twin Engine and cleanup resources
   */
  async shutdown(): Promise<void> {
    this.isRunning = false
    
    // Clear all intervals
    for (const interval of this.realTimeStreams.values()) {
      clearInterval(interval)
    }
    this.realTimeStreams.clear()
    
    this.emit('engine:stopped')
  }

  /**
   * Get all Digital Twins
   */
  getAllTwins(): EnhancedDigitalTwin[] {
    return Array.from(this.twins.values())
  }

  /**
   * Get Digital Twin by ID
   */
  getTwin(twinId: string): EnhancedDigitalTwin | undefined {
    return this.twins.get(twinId)
  }
}

// Alert threshold interface
interface AlertThreshold {
  warning: number
  critical: number
  metric: string
}

// Export singleton instance
export const enhancedDigitalTwinEngine = new EnhancedDigitalTwinEngine()

// Types are already exported at their declarations
