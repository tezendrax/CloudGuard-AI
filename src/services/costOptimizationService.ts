// Comprehensive Cost Optimization Service
import { cloudAdapterManager } from './cloudAdapters'
import { digitalTwinEngine } from './digitalTwinEngine'
import { performanceMonitor } from '@/lib/performance'
import { cache } from '@/lib/cache'
import type { CloudResource } from '@/types'

export interface CostOptimizationRecommendation {
  id: string
  type: 'rightsizing' | 'reserved_instances' | 'spot_instances' | 'storage_optimization' | 'network_optimization' | 'scheduling' | 'modernization'
  resourceId: string
  resourceName: string
  title: string
  description: string
  currentCost: number
  optimizedCost: number
  savings: number
  savingsPercentage: number
  confidence: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  effort: 'LOW' | 'MEDIUM' | 'HIGH'
  timeframe: string
  status: 'AVAILABLE' | 'APPLIED' | 'SCHEDULED' | 'IN_PROGRESS' | 'FAILED'
  impact: CostOptimizationImpact
  implementation: ImplementationDetails
  riskAssessment: RiskAssessment
  createdAt: Date
  validUntil: Date
}

export interface CostOptimizationImpact {
  monthlySavings: number
  annualSavings: number
  performanceImpact: 'NONE' | 'MINIMAL' | 'MODERATE' | 'SIGNIFICANT'
  availabilityImpact: 'NONE' | 'MINIMAL' | 'MODERATE' | 'SIGNIFICANT'
  operationalComplexity: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface ImplementationDetails {
  steps: string[]
  automationAvailable: boolean
  rollbackPlan: string[]
  testingRequired: boolean
  maintenanceWindow: boolean
  dependencies: string[]
}

export interface RiskAssessment {
  level: 'LOW' | 'MEDIUM' | 'HIGH'
  factors: string[]
  mitigation: string[]
  successProbability: number
}

export interface CostAnalytics {
  totalSpend: number
  forecastedSpend: number
  budgetUtilization: number
  trendDirection: 'INCREASING' | 'DECREASING' | 'STABLE'
  wasteDetection: {
    unusedResources: number
    underutilizedResources: number
    oversizedResources: number
    totalWaste: number
  }
  optimization: {
    totalRecommendations: number
    availableOptimizations: number
    potentialSavings: number
    appliedOptimizations: number
    actualSavings: number
  }
}

export class CostOptimizationService {
  private recommendations: Map<string, CostOptimizationRecommendation> = new Map()
  private costHistory: Map<string, number[]> = new Map()
  private optimizationHistory: Map<string, any> = new Map()

  constructor() {
    this.startCostAnalysis()
  }

  private startCostAnalysis(): void {
    // Run cost analysis every hour
    setInterval(() => {
      this.analyzeCosts()
    }, 3600000)

    // Generate recommendations every 4 hours
    setInterval(() => {
      this.generateRecommendations()
    }, 14400000)

    // Update cost forecasts every 6 hours
    setInterval(() => {
      this.updateCostForecasts()
    }, 21600000)
  }

  public async generateRecommendations(): Promise<CostOptimizationRecommendation[]> {
    console.log('🔍 Generating cost optimization recommendations...')

    try {
      const resources = await cloudAdapterManager.listAllResources()
      const newRecommendations: CostOptimizationRecommendation[] = []

      for (const resource of resources) {
        const recommendations = await this.analyzeResourceCost(resource)
        newRecommendations.push(...recommendations)
      }

      // Store recommendations
      newRecommendations.forEach(rec => {
        this.recommendations.set(rec.id, rec)
      })

      // Cache for quick access
      await cache.set('cost_recommendations', newRecommendations, { ttl: 3600 })

      console.log(`💡 Generated ${newRecommendations.length} cost optimization recommendations`)
      return newRecommendations
    } catch (error) {
      console.error('Error generating cost recommendations:', error)
      return []
    }
  }

  private async analyzeResourceCost(resource: CloudResource): Promise<CostOptimizationRecommendation[]> {
    const recommendations: CostOptimizationRecommendation[] = []
    const utilization = resource.configuration?.utilization || { cpu: 50, memory: 60, network: 30 }
    const cost = resource.cost || 0

    // 1. Right-sizing Analysis
    if (utilization.cpu < 30 && utilization.memory < 40) {
      recommendations.push(await this.createRightsizingRecommendation(resource, utilization))
    }

    // 2. Reserved Instance Analysis
    if (await this.isGoodCandidateForReservedInstances(resource)) {
      recommendations.push(await this.createReservedInstanceRecommendation(resource))
    }

    // 3. Spot Instance Analysis
    if (await this.isGoodCandidateForSpotInstances(resource)) {
      recommendations.push(await this.createSpotInstanceRecommendation(resource))
    }

    // 4. Storage Optimization
    if (resource.type === 'STORAGE') {
      const storageRec = await this.analyzeStorageOptimization(resource)
      if (storageRec) recommendations.push(storageRec)
    }

    // 5. Scheduling Analysis
    if (await this.canBeScheduled(resource)) {
      recommendations.push(await this.createSchedulingRecommendation(resource))
    }

    // 6. Modernization Opportunities
    const modernizationRec = await this.analyzeMmodernizationOpportunities(resource)
    if (modernizationRec) recommendations.push(modernizationRec)

    return recommendations
  }

  private async createRightsizingRecommendation(
    resource: CloudResource, 
    utilization: Record<string, number>
  ): Promise<CostOptimizationRecommendation> {
    const currentCost = resource.cost || 100
    const savings = currentCost * 0.4 // 40% savings from rightsizing
    const optimizedCost = currentCost - savings

    return {
      id: `rightsize-${resource.id}-${Date.now()}`,
      type: 'rightsizing',
      resourceId: resource.id,
      resourceName: resource.name,
      title: 'Right-size Instance',
      description: `Downsize ${resource.name} based on low utilization (CPU: ${utilization.cpu?.toFixed(1)}%, Memory: ${utilization.memory?.toFixed(1)}%)`,
      currentCost,
      optimizedCost,
      savings,
      savingsPercentage: (savings / currentCost) * 100,
      confidence: this.calculateConfidence(utilization, 'rightsizing'),
      priority: savings > 100 ? 'HIGH' : 'MEDIUM',
      effort: 'LOW',
      timeframe: '1-2 hours',
      status: 'AVAILABLE',
      impact: {
        monthlySavings: savings * 30,
        annualSavings: savings * 365,
        performanceImpact: 'MINIMAL',
        availabilityImpact: 'MINIMAL',
        operationalComplexity: 'LOW'
      },
      implementation: {
        steps: [
          'Create AMI/snapshot of current instance',
          'Launch smaller instance with same configuration',
          'Update load balancer/DNS to point to new instance',
          'Monitor performance for 24 hours',
          'Terminate old instance'
        ],
        automationAvailable: true,
        rollbackPlan: [
          'Launch original instance size from AMI',
          'Update load balancer/DNS',
          'Verify functionality'
        ],
        testingRequired: true,
        maintenanceWindow: false,
        dependencies: ['Load balancer configuration', 'DNS records']
      },
      riskAssessment: {
        level: 'LOW',
        factors: ['Performance degradation risk', 'Application compatibility'],
        mitigation: ['Gradual migration', 'Performance monitoring', 'Automated rollback'],
        successProbability: 0.95
      },
      createdAt: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Valid for 7 days
    }
  }

  private async createReservedInstanceRecommendation(resource: CloudResource): Promise<CostOptimizationRecommendation> {
    const currentCost = resource.cost || 100
    const savings = currentCost * 0.3 // 30% savings with 1-year reserved
    const optimizedCost = currentCost - savings

    return {
      id: `reserved-${resource.id}-${Date.now()}`,
      type: 'reserved_instances',
      resourceId: resource.id,
      resourceName: resource.name,
      title: 'Purchase Reserved Instance',
      description: `Convert ${resource.name} to 1-year reserved instance for consistent workloads`,
      currentCost,
      optimizedCost,
      savings,
      savingsPercentage: (savings / currentCost) * 100,
      confidence: 0.92,
      priority: 'HIGH',
      effort: 'LOW',
      timeframe: '15 minutes',
      status: 'AVAILABLE',
      impact: {
        monthlySavings: savings * 30,
        annualSavings: savings * 365,
        performanceImpact: 'NONE',
        availabilityImpact: 'NONE',
        operationalComplexity: 'LOW'
      },
      implementation: {
        steps: [
          'Purchase reserved instance capacity',
          'Apply reservation to existing instance',
          'Verify billing changes in next cycle'
        ],
        automationAvailable: true,
        rollbackPlan: ['Sell reserved instance on marketplace'],
        testingRequired: false,
        maintenanceWindow: false,
        dependencies: []
      },
      riskAssessment: {
        level: 'LOW',
        factors: ['Long-term commitment', 'Instance type changes'],
        mitigation: ['Convertible reserved instances', 'Capacity planning'],
        successProbability: 0.98
      },
      createdAt: new Date(),
      validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Valid for 3 days
    }
  }

  private async createSpotInstanceRecommendation(resource: CloudResource): Promise<CostOptimizationRecommendation> {
    const currentCost = resource.cost || 100
    const savings = currentCost * 0.7 // 70% savings with spot instances
    const optimizedCost = currentCost - savings

    return {
      id: `spot-${resource.id}-${Date.now()}`,
      type: 'spot_instances',
      resourceId: resource.id,
      resourceName: resource.name,
      title: 'Use Spot Instances',
      description: `Convert ${resource.name} to spot instances for fault-tolerant workloads`,
      currentCost,
      optimizedCost,
      savings,
      savingsPercentage: (savings / currentCost) * 100,
      confidence: 0.85,
      priority: 'MEDIUM',
      effort: 'MEDIUM',
      timeframe: '2-4 hours',
      status: 'AVAILABLE',
      impact: {
        monthlySavings: savings * 30,
        annualSavings: savings * 365,
        performanceImpact: 'NONE',
        availabilityImpact: 'MODERATE',
        operationalComplexity: 'MEDIUM'
      },
      implementation: {
        steps: [
          'Implement spot instance interruption handling',
          'Setup auto-scaling with mixed instance types',
          'Configure spot fleet with fallback to on-demand',
          'Test interruption scenarios',
          'Gradually migrate workloads'
        ],
        automationAvailable: true,
        rollbackPlan: [
          'Switch back to on-demand instances',
          'Update auto-scaling configuration'
        ],
        testingRequired: true,
        maintenanceWindow: true,
        dependencies: ['Application fault tolerance', 'Auto-scaling configuration']
      },
      riskAssessment: {
        level: 'MEDIUM',
        factors: ['Instance interruption', 'Availability impact', 'Application complexity'],
        mitigation: ['Mixed instance types', 'Diversified AZs', 'Interruption handling'],
        successProbability: 0.88
      },
      createdAt: new Date(),
      validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // Valid for 5 days
    }
  }

  private async analyzeStorageOptimization(resource: CloudResource): Promise<CostOptimizationRecommendation | null> {
    if (resource.type !== 'STORAGE') return null

    const currentCost = resource.cost || 50
    const savings = currentCost * 0.6 // 60% savings from storage optimization
    const optimizedCost = currentCost - savings

    return {
      id: `storage-${resource.id}-${Date.now()}`,
      type: 'storage_optimization',
      resourceId: resource.id,
      resourceName: resource.name,
      title: 'Optimize Storage Tiers',
      description: `Move infrequently accessed data in ${resource.name} to cheaper storage classes`,
      currentCost,
      optimizedCost,
      savings,
      savingsPercentage: (savings / currentCost) * 100,
      confidence: 0.89,
      priority: 'MEDIUM',
      effort: 'LOW',
      timeframe: '1-2 days',
      status: 'AVAILABLE',
      impact: {
        monthlySavings: savings * 30,
        annualSavings: savings * 365,
        performanceImpact: 'MINIMAL',
        availabilityImpact: 'NONE',
        operationalComplexity: 'LOW'
      },
      implementation: {
        steps: [
          'Analyze access patterns for last 90 days',
          'Configure lifecycle policies',
          'Setup automated tiering',
          'Monitor retrieval costs',
          'Adjust policies based on usage'
        ],
        automationAvailable: true,
        rollbackPlan: ['Revert lifecycle policies', 'Move data back to standard tier'],
        testingRequired: false,
        maintenanceWindow: false,
        dependencies: ['Data access pattern analysis']
      },
      riskAssessment: {
        level: 'LOW',
        factors: ['Data retrieval latency', 'Retrieval costs'],
        mitigation: ['Intelligent tiering', 'Access pattern monitoring'],
        successProbability: 0.93
      },
      createdAt: new Date(),
      validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // Valid for 10 days
    }
  }

  private async createSchedulingRecommendation(resource: CloudResource): Promise<CostOptimizationRecommendation> {
    const currentCost = resource.cost || 100
    const savings = currentCost * 0.5 // 50% savings from scheduling
    const optimizedCost = currentCost - savings

    return {
      id: `schedule-${resource.id}-${Date.now()}`,
      type: 'scheduling',
      resourceId: resource.id,
      resourceName: resource.name,
      title: 'Implement Resource Scheduling',
      description: `Schedule ${resource.name} to run only during business hours (16 hours/day savings)`,
      currentCost,
      optimizedCost,
      savings,
      savingsPercentage: (savings / currentCost) * 100,
      confidence: 0.95,
      priority: 'HIGH',
      effort: 'LOW',
      timeframe: '30 minutes',
      status: 'AVAILABLE',
      impact: {
        monthlySavings: savings * 30,
        annualSavings: savings * 365,
        performanceImpact: 'NONE',
        availabilityImpact: 'MINIMAL',
        operationalComplexity: 'LOW'
      },
      implementation: {
        steps: [
          'Setup automated start/stop schedules',
          'Configure Lambda functions for scheduling',
          'Test schedule automation',
          'Monitor for any issues',
          'Adjust schedule as needed'
        ],
        automationAvailable: true,
        rollbackPlan: ['Disable scheduling', 'Keep instances running 24/7'],
        testingRequired: true,
        maintenanceWindow: false,
        dependencies: ['Business hour requirements', 'Application startup time']
      },
      riskAssessment: {
        level: 'LOW',
        factors: ['Schedule conflicts', 'Startup time'],
        mitigation: ['Flexible scheduling', 'Quick startup optimization'],
        successProbability: 0.97
      },
      createdAt: new Date(),
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Valid for 14 days
    }
  }

  private async analyzeMmodernizationOpportunities(resource: CloudResource): Promise<CostOptimizationRecommendation | null> {
    // Analyze if resource can be modernized (e.g., containers, serverless)
    if (resource.type !== 'COMPUTE') return null

    const currentCost = resource.cost || 100
    const savings = currentCost * 0.25 // 25% savings from modernization
    const optimizedCost = currentCost - savings

    return {
      id: `modernize-${resource.id}-${Date.now()}`,
      type: 'modernization',
      resourceId: resource.id,
      resourceName: resource.name,
      title: 'Modernize to Containers',
      description: `Containerize ${resource.name} and move to managed container service`,
      currentCost,
      optimizedCost,
      savings,
      savingsPercentage: (savings / currentCost) * 100,
      confidence: 0.75,
      priority: 'MEDIUM',
      effort: 'HIGH',
      timeframe: '2-4 weeks',
      status: 'AVAILABLE',
      impact: {
        monthlySavings: savings * 30,
        annualSavings: savings * 365,
        performanceImpact: 'MODERATE',
        availabilityImpact: 'MINIMAL',
        operationalComplexity: 'HIGH'
      },
      implementation: {
        steps: [
          'Containerize application',
          'Setup container orchestration',
          'Migrate data and configurations',
          'Implement CI/CD pipeline',
          'Gradual traffic migration',
          'Decommission old infrastructure'
        ],
        automationAvailable: false,
        rollbackPlan: [
          'Keep old infrastructure during migration',
          'Quick traffic rollback capability'
        ],
        testingRequired: true,
        maintenanceWindow: true,
        dependencies: ['Application containerization', 'Team training']
      },
      riskAssessment: {
        level: 'HIGH',
        factors: ['Application compatibility', 'Team expertise', 'Migration complexity'],
        mitigation: ['Phased migration', 'Training program', 'Expert consultation'],
        successProbability: 0.75
      },
      createdAt: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Valid for 30 days
    }
  }

  public async analyzeCosts(): Promise<CostAnalytics> {
    console.log('📊 Analyzing cost patterns...')

    try {
      const resources = await cloudAdapterManager.listAllResources()
      const totalSpend = resources.reduce((sum, r) => sum + (r.cost || 0), 0)
      
      // Generate cost analytics
      const analytics: CostAnalytics = {
        totalSpend,
        forecastedSpend: totalSpend * 1.05, // 5% growth forecast
        budgetUtilization: (totalSpend / 10000) * 100, // Assuming $10k budget
        trendDirection: 'INCREASING',
        wasteDetection: await this.detectWaste(resources),
        optimization: await this.getOptimizationMetrics()
      }

      // Cache analytics
      await cache.set('cost_analytics', analytics, { ttl: 1800 })

      return analytics
    } catch (error) {
      console.error('Error analyzing costs:', error)
      throw error
    }
  }

  private async detectWaste(resources: CloudResource[]): Promise<any> {
    let unusedResources = 0
    let underutilizedResources = 0
    let oversizedResources = 0
    let totalWaste = 0

    for (const resource of resources) {
      const utilization = resource.configuration?.utilization || { cpu: 50, memory: 60, network: 30 }
      
      // Detect unused resources (0% utilization)
      if (utilization.cpu === 0 && utilization.memory === 0) {
        unusedResources++
        totalWaste += resource.cost || 0
      }
      // Detect underutilized resources (<30% utilization)
      else if ((utilization.cpu || 0) < 30 && (utilization.memory || 0) < 30) {
        underutilizedResources++
        totalWaste += (resource.cost || 0) * 0.4 // 40% waste
      }
      // Detect oversized resources (consistently low utilization)
      else if ((utilization.cpu || 0) < 50 && (utilization.memory || 0) < 50) {
        oversizedResources++
        totalWaste += (resource.cost || 0) * 0.2 // 20% waste
      }
    }

    return {
      unusedResources,
      underutilizedResources,
      oversizedResources,
      totalWaste
    }
  }

  private async getOptimizationMetrics(): Promise<any> {
    const recommendations = Array.from(this.recommendations.values())
    
    return {
      totalRecommendations: recommendations.length,
      availableOptimizations: recommendations.filter(r => r.status === 'AVAILABLE').length,
      potentialSavings: recommendations.reduce((sum, r) => sum + r.savings, 0),
      appliedOptimizations: recommendations.filter(r => r.status === 'APPLIED').length,
      actualSavings: recommendations
        .filter(r => r.status === 'APPLIED')
        .reduce((sum, r) => sum + r.savings, 0)
    }
  }

  // Helper methods
  private calculateConfidence(utilization: Record<string, number>, type: string): number {
    const avgUtilization = Object.values(utilization).reduce((sum, val) => sum + val, 0) / Object.values(utilization).length
    
    switch (type) {
      case 'rightsizing':
        return avgUtilization < 30 ? 0.95 : avgUtilization < 50 ? 0.85 : 0.70
      default:
        return 0.80
    }
  }

  private async isGoodCandidateForReservedInstances(resource: CloudResource): Promise<boolean> {
    // Check if resource runs consistently for >6 months
    return resource.type === 'COMPUTE' && Math.random() > 0.7 // Simulate 30% are good candidates
  }

  private async isGoodCandidateForSpotInstances(resource: CloudResource): Promise<boolean> {
    // Check if workload is fault-tolerant
    return resource.type === 'COMPUTE' && resource.tags?.Environment !== 'production'
  }

  private async canBeScheduled(resource: CloudResource): Promise<boolean> {
    // Check if resource can be scheduled (dev/test environments)
    return resource.tags?.Environment === 'development' || resource.tags?.Environment === 'test'
  }

  private async updateCostForecasts(): Promise<void> {
    console.log('📈 Updating cost forecasts...')
    
    try {
      const resources = await cloudAdapterManager.listAllResources()
      const currentSpend = resources.reduce((sum, r) => sum + (r.cost || 0), 0)
      
      // Update cost history
      const historyKey = new Date().toISOString().slice(0, 7) // YYYY-MM
      const history = this.costHistory.get(historyKey) || []
      history.push(currentSpend)
      this.costHistory.set(historyKey, history.slice(-30)) // Keep last 30 days
      
      // Generate AI-powered forecasts using digital twins
      for (const resource of resources) {
        const twin = digitalTwinEngine.getTwinsByOrganization('demo-org')
          .find(t => t.cloudResourceId === resource.id)
        
        if (twin) {
          const costPrediction = digitalTwinEngine.getPredictions(twin.id)
            .find(p => p.type === 'COST')
          
          if (costPrediction) {
            console.log(`💰 Cost forecast for ${resource.name}: ${JSON.stringify(costPrediction.prediction)}`)
          }
        }
      }
    } catch (error) {
      console.error('Error updating cost forecasts:', error)
    }
  }

  // Public API methods
  public getRecommendations(): CostOptimizationRecommendation[] {
    return Array.from(this.recommendations.values())
  }

  public async applyRecommendation(recommendationId: string): Promise<boolean> {
    const recommendation = this.recommendations.get(recommendationId)
    if (!recommendation) return false

    try {
      recommendation.status = 'IN_PROGRESS'
      
      // Simulate applying the recommendation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      recommendation.status = 'APPLIED'
      
      // Record successful optimization
      performanceMonitor.recordMetric({
        name: 'cost_optimization.applied',
        value: recommendation.savings,
        unit: 'USD',
        timestamp: new Date(),
        tags: {
          type: recommendation.type,
          resourceId: recommendation.resourceId,
          confidence: recommendation.confidence.toString()
        }
      })

      console.log(`✅ Applied cost optimization: ${recommendation.title} - Saved $${recommendation.savings}`)
      return true
    } catch (error) {
      recommendation.status = 'FAILED'
      console.error(`❌ Failed to apply cost optimization: ${recommendation.title}`, error)
      return false
    }
  }
}

export const costOptimizationService = new CostOptimizationService()
