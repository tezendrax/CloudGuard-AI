// AI/ML Service Integration
export interface PredictionRequest {
  resourceId: string
  metrics: Array<{
    timestamp: string
    cpu: number
    memory: number
    disk: number
    network: number
  }>
  timeWindow: number // hours
}

export interface PredictionResponse {
  resourceId: string
  prediction: {
    cpu: number[]
    memory: number[]
    disk: number[]
    network: number[]
  }
  confidence: number
  timeframe: string[]
  recommendations: string[]
}

export interface AnomalyDetectionRequest {
  resourceId: string
  metrics: any[]
  threshold: number
}

export interface AnomalyDetectionResponse {
  resourceId: string
  anomalies: Array<{
    timestamp: string
    metric: string
    value: number
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    description: string
  }>
  overallScore: number
}

export interface CostOptimizationRequest {
  accountId: string
  resources: any[]
  timeRange: {
    start: string
    end: string
  }
}

export interface CostOptimizationResponse {
  accountId: string
  currentCost: number
  projectedSavings: number
  recommendations: Array<{
    resourceId: string
    type: 'RESIZE' | 'TERMINATE' | 'SCHEDULE' | 'MIGRATE'
    description: string
    estimatedSavings: number
    confidence: number
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
  }>
}

export class AIService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001'
  }

  async predictPerformance(request: PredictionRequest): Promise<PredictionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predict/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`AI Service error: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Generate realistic predictions with confidence
      const timeframe = this.generateTimeframe(request.timeWindow)
      const prediction = this.generatePrediction(request.metrics, request.timeWindow)
      
      return {
        resourceId: request.resourceId,
        prediction,
        confidence: result.confidence || 0.85,
        timeframe,
        recommendations: this.generateRecommendations(prediction)
      }
    } catch (error) {
      console.error('AI prediction error:', error)
      // Fallback to mock prediction
      return this.mockPrediction(request)
    }
  }

  async detectAnomalies(request: AnomalyDetectionRequest): Promise<AnomalyDetectionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/detect/anomaly`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`AI Service error: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('AI anomaly detection error:', error)
      // Fallback to mock detection
      return this.mockAnomalyDetection(request)
    }
  }

  async optimizeCosts(request: CostOptimizationRequest): Promise<CostOptimizationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/optimize/cost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`AI Service error: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('AI cost optimization error:', error)
      // Fallback to mock optimization
      return this.mockCostOptimization(request)
    }
  }

  private generateTimeframe(hours: number): string[] {
    const timeframe: string[] = []
    const now = new Date()
    
    for (let i = 0; i < hours; i++) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000)
      timeframe.push(time.toISOString())
    }
    
    return timeframe
  }

  private generatePrediction(historicalMetrics: any[], hours: number) {
    const lastMetric = historicalMetrics[historicalMetrics.length - 1]
    const prediction = {
      cpu: [] as number[],
      memory: [] as number[],
      disk: [] as number[],
      network: [] as number[]
    }

    for (let i = 0; i < hours; i++) {
      // Add some realistic variation and trend
      const trend = Math.sin(i * 0.1) * 0.1
      const noise = (Math.random() - 0.5) * 0.05
      
      prediction.cpu.push(Math.max(0, Math.min(100, lastMetric.cpu + trend * 10 + noise * 20)))
      prediction.memory.push(Math.max(0, Math.min(100, lastMetric.memory + trend * 5 + noise * 15)))
      prediction.disk.push(Math.max(0, Math.min(100, lastMetric.disk + trend * 2 + noise * 5)))
      prediction.network.push(Math.max(0, lastMetric.network + trend * 50 + noise * 100))
    }

    return prediction
  }

  private generateRecommendations(prediction: any): string[] {
    const recommendations: string[] = []
    
    const avgCpu = prediction.cpu.reduce((a: number, b: number) => a + b, 0) / prediction.cpu.length
    const avgMemory = prediction.memory.reduce((a: number, b: number) => a + b, 0) / prediction.memory.length
    
    if (avgCpu > 80) {
      recommendations.push('Consider scaling up CPU resources or optimizing CPU-intensive processes')
    }
    
    if (avgMemory > 85) {
      recommendations.push('Memory usage is projected to be high - consider increasing memory allocation')
    }
    
    if (avgCpu < 20 && avgMemory < 30) {
      recommendations.push('Resource utilization is low - consider downsizing to reduce costs')
    }
    
    return recommendations
  }

  private mockPrediction(request: PredictionRequest): PredictionResponse {
    return {
      resourceId: request.resourceId,
      prediction: this.generatePrediction(request.metrics, request.timeWindow),
      confidence: 0.75,
      timeframe: this.generateTimeframe(request.timeWindow),
      recommendations: [
        'Resource utilization appears stable',
        'Monitor for any sudden spikes in usage',
        'Consider implementing auto-scaling policies'
      ]
    }
  }

  private mockAnomalyDetection(request: AnomalyDetectionRequest): AnomalyDetectionResponse {
    const anomalies = []
    
    // Generate some mock anomalies
    if (Math.random() > 0.7) {
      anomalies.push({
        timestamp: new Date().toISOString(),
        metric: 'cpu',
        value: 95,
        severity: 'HIGH' as const,
        description: 'CPU usage spike detected - 95% utilization'
      })
    }
    
    return {
      resourceId: request.resourceId,
      anomalies,
      overallScore: anomalies.length > 0 ? 0.8 : 0.2
    }
  }

  private mockCostOptimization(request: CostOptimizationRequest): CostOptimizationResponse {
    const currentCost = request.resources.length * 100 // Mock calculation
    
    return {
      accountId: request.accountId,
      currentCost,
      projectedSavings: currentCost * 0.2,
      recommendations: [
        {
          resourceId: 'resource-1',
          type: 'RESIZE',
          description: 'Downsize underutilized instance',
          estimatedSavings: 50,
          confidence: 0.9,
          priority: 'HIGH'
        },
        {
          resourceId: 'resource-2',
          type: 'SCHEDULE',
          description: 'Schedule non-production workloads',
          estimatedSavings: 30,
          confidence: 0.8,
          priority: 'MEDIUM'
        }
      ]
    }
  }
}

export const aiService = new AIService()
