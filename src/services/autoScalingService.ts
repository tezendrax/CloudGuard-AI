// Auto-Scaling and Self-Healing Service
import { cloudAdapterManager } from './cloudAdapters'
import { monitoringService } from './monitoringService'
import { digitalTwinEngine } from './digitalTwinEngine'
import { performanceMonitor } from '@/lib/performance'
import { cache } from '@/lib/cache'
import type { CloudResource, Alert } from '@/types'

export interface ScalingPolicy {
  id: string
  resourceId: string
  name: string
  type: 'horizontal' | 'vertical'
  triggers: ScalingTrigger[]
  actions: ScalingAction[]
  cooldownPeriod: number // seconds
  enabled: boolean
}

export interface ScalingTrigger {
  metric: string
  operator: 'gt' | 'lt' | 'gte' | 'lte'
  threshold: number
  duration: number // seconds
  evaluationPeriods: number
}

export interface ScalingAction {
  type: 'scale_up' | 'scale_down' | 'restart' | 'migrate'
  parameters: {
    instances?: number
    percentage?: number
    targetInstanceType?: string
    maxInstances?: number
    minInstances?: number
  }
}

export interface SelfHealingRule {
  id: string
  name: string
  condition: string
  action: 'restart' | 'scale' | 'migrate' | 'circuit_breaker' | 'cleanup'
  threshold: number
  cooldown: number
  maxAttempts: number
  enabled: boolean
}

export class AutoScalingService {
  private scalingPolicies: Map<string, ScalingPolicy> = new Map()
  private healingRules: Map<string, SelfHealingRule> = new Map()
  private scalingHistory: Map<string, Date> = new Map()
  private healingAttempts: Map<string, number> = new Map()
  private isRunning: boolean = false

  constructor() {
    this.initializeDefaultPolicies()
    this.initializeDefaultHealingRules()
  }

  public startAutoScaling(): void {
    if (this.isRunning) return

    this.isRunning = true
    console.log('🚀 Auto-scaling service started')

    // Run scaling evaluation every 30 seconds
    setInterval(() => {
      this.evaluateScalingPolicies()
    }, 30000)

    // Run self-healing checks every 60 seconds
    setInterval(() => {
      this.evaluateHealingRules()
    }, 60000)

    // Predictive scaling every 5 minutes using AI
    setInterval(() => {
      this.runPredictiveScaling()
    }, 300000)
  }

  public stopAutoScaling(): void {
    this.isRunning = false
    console.log('🛑 Auto-scaling service stopped')
  }

  private initializeDefaultPolicies(): void {
    const defaultPolicies: ScalingPolicy[] = [
      {
        id: 'cpu-horizontal-scale',
        resourceId: '*',
        name: 'CPU-based Horizontal Scaling',
        type: 'horizontal',
        triggers: [
          {
            metric: 'cpu',
            operator: 'gt',
            threshold: 80,
            duration: 300, // 5 minutes
            evaluationPeriods: 3
          }
        ],
        actions: [
          {
            type: 'scale_up',
            parameters: {
              percentage: 50,
              maxInstances: 20
            }
          }
        ],
        cooldownPeriod: 600, // 10 minutes
        enabled: true
      },
      {
        id: 'memory-vertical-scale',
        resourceId: '*',
        name: 'Memory-based Vertical Scaling',
        type: 'vertical',
        triggers: [
          {
            metric: 'memory',
            operator: 'gt',
            threshold: 90,
            duration: 180, // 3 minutes
            evaluationPeriods: 2
          }
        ],
        actions: [
          {
            type: 'scale_up',
            parameters: {
              targetInstanceType: 'larger',
              percentage: 100
            }
          }
        ],
        cooldownPeriod: 900, // 15 minutes
        enabled: true
      },
      {
        id: 'traffic-based-scale',
        resourceId: '*',
        name: 'Traffic-based Auto Scaling',
        type: 'horizontal',
        triggers: [
          {
            metric: 'requests_per_second',
            operator: 'gt',
            threshold: 1000,
            duration: 120, // 2 minutes
            evaluationPeriods: 2
          }
        ],
        actions: [
          {
            type: 'scale_up',
            parameters: {
              instances: 3,
              maxInstances: 15
            }
          }
        ],
        cooldownPeriod: 300, // 5 minutes
        enabled: true
      }
    ]

    defaultPolicies.forEach(policy => {
      this.scalingPolicies.set(policy.id, policy)
    })
  }

  private initializeDefaultHealingRules(): void {
    const defaultRules: SelfHealingRule[] = [
      {
        id: 'health-check-failure',
        name: 'Health Check Failure Recovery',
        condition: 'health_check_failed',
        action: 'restart',
        threshold: 3,
        cooldown: 300, // 5 minutes
        maxAttempts: 5,
        enabled: true
      },
      {
        id: 'high-error-rate',
        name: 'High Error Rate Mitigation',
        condition: 'error_rate > 10%',
        action: 'circuit_breaker',
        threshold: 10,
        cooldown: 600, // 10 minutes
        maxAttempts: 3,
        enabled: true
      },
      {
        id: 'memory-leak-detection',
        name: 'Memory Leak Auto-Recovery',
        condition: 'memory_growth_rate > 5MB/min',
        action: 'restart',
        threshold: 5,
        cooldown: 1800, // 30 minutes
        maxAttempts: 3,
        enabled: true
      },
      {
        id: 'disk-space-cleanup',
        name: 'Automatic Disk Cleanup',
        condition: 'disk_usage > 85%',
        action: 'cleanup',
        threshold: 85,
        cooldown: 3600, // 1 hour
        maxAttempts: 1,
        enabled: true
      }
    ]

    defaultRules.forEach(rule => {
      this.healingRules.set(rule.id, rule)
    })
  }

  private async evaluateScalingPolicies(): Promise<void> {
    console.log('🔍 Evaluating scaling policies...')

    try {
      const resources = await cloudAdapterManager.listAllResources()
      
      for (const resource of resources) {
        await this.evaluateResourceScaling(resource)
      }
    } catch (error) {
      console.error('Error evaluating scaling policies:', error)
    }
  }

  private async evaluateResourceScaling(resource: CloudResource): Promise<void> {
    for (const [policyId, policy] of this.scalingPolicies.entries()) {
      if (!policy.enabled) continue
      if (policy.resourceId !== '*' && policy.resourceId !== resource.id) continue

      // Check cooldown period
      const lastScaling = this.scalingHistory.get(`${policyId}-${resource.id}`)
      if (lastScaling && Date.now() - lastScaling.getTime() < policy.cooldownPeriod * 1000) {
        continue
      }

      // Evaluate triggers
      const shouldScale = await this.evaluateTriggers(resource, policy.triggers)
      
      if (shouldScale) {
        await this.executeScalingAction(resource, policy)
        this.scalingHistory.set(`${policyId}-${resource.id}`, new Date())
      }
    }
  }

  private async evaluateTriggers(resource: CloudResource, triggers: ScalingTrigger[]): Promise<boolean> {
    for (const trigger of triggers) {
      const metricValue = await this.getResourceMetric(resource.id, trigger.metric)
      if (metricValue === null) continue

      const conditionMet = this.evaluateCondition(metricValue, trigger.operator, trigger.threshold)
      
      if (!conditionMet) {
        return false // All triggers must be met
      }

      // Check duration and evaluation periods
      const historicalData = await this.getMetricHistory(resource.id, trigger.metric, trigger.duration)
      const meetingCondition = historicalData.filter(value => 
        this.evaluateCondition(value, trigger.operator, trigger.threshold)
      ).length

      if (meetingCondition < trigger.evaluationPeriods) {
        return false
      }
    }

    return true
  }

  private async executeScalingAction(resource: CloudResource, policy: ScalingPolicy): Promise<void> {
    console.log(`⚡ Executing scaling action for resource ${resource.id}`)

    for (const action of policy.actions) {
      try {
        await this.performScalingAction(resource, action, policy.type)
        
        // Record performance metrics
        performanceMonitor.recordMetric({
          name: 'autoscaling.action_executed',
          value: 1,
          unit: 'count',
          timestamp: new Date(),
          tags: {
            resourceId: resource.id,
            action: action.type,
            policy: policy.name
          }
        })
      } catch (error) {
        console.error(`Failed to execute scaling action:`, error)
      }
    }
  }

  private async performScalingAction(
    resource: CloudResource, 
    action: ScalingAction, 
    scalingType: 'horizontal' | 'vertical'
  ): Promise<void> {
    const adapter = cloudAdapterManager.getAdapter(resource.cloudAccountId)
    if (!adapter) {
      throw new Error(`No adapter found for account ${resource.cloudAccountId}`)
    }

    switch (action.type) {
      case 'scale_up':
        if (scalingType === 'horizontal') {
          const currentInstances = resource.configuration?.instances || 1
          const newInstances = action.parameters.instances || 
            Math.ceil(currentInstances * (1 + (action.parameters.percentage || 50) / 100))
          
          const maxInstances = action.parameters.maxInstances || 20
          const targetInstances = Math.min(newInstances, maxInstances)

          await adapter.scaleResource(resource.id, {
            desiredInstances: targetInstances,
            autoScaling: true
          })

          console.log(`📈 Scaled up ${resource.name}: ${currentInstances} → ${targetInstances} instances`)
        } else {
          // Vertical scaling
          await adapter.scaleResource(resource.id, {
            instanceType: action.parameters.targetInstanceType,
            autoScaling: true
          })

          console.log(`📈 Scaled up ${resource.name} to ${action.parameters.targetInstanceType}`)
        }
        break

      case 'scale_down':
        if (scalingType === 'horizontal') {
          const currentInstances = resource.configuration?.instances || 1
          const minInstances = action.parameters.minInstances || 1
          const newInstances = Math.max(
            Math.ceil(currentInstances * (1 - (action.parameters.percentage || 25) / 100)),
            minInstances
          )

          await adapter.scaleResource(resource.id, {
            desiredInstances: newInstances,
            autoScaling: true
          })

          console.log(`📉 Scaled down ${resource.name}: ${currentInstances} → ${newInstances} instances`)
        }
        break

      case 'restart':
        await adapter.startResource(resource.id)
        console.log(`🔄 Restarted resource ${resource.name}`)
        break
    }
  }

  private async evaluateHealingRules(): Promise<void> {
    console.log('🩺 Evaluating self-healing rules...')

    try {
      for (const [ruleId, rule] of this.healingRules.entries()) {
        if (!rule.enabled) continue

        const shouldHeal = await this.evaluateHealingCondition(rule)
        
        if (shouldHeal) {
          await this.executeHealingAction(rule)
        }
      }
    } catch (error) {
      console.error('Error evaluating healing rules:', error)
    }
  }

  private async evaluateHealingCondition(rule: SelfHealingRule): Promise<boolean> {
    // Check cooldown
    const lastAttempt = this.scalingHistory.get(rule.id)
    if (lastAttempt && Date.now() - lastAttempt.getTime() < rule.cooldown * 1000) {
      return false
    }

    // Check max attempts
    const attempts = this.healingAttempts.get(rule.id) || 0
    if (attempts >= rule.maxAttempts) {
      return false
    }

    // Evaluate condition based on rule type
    switch (rule.condition) {
      case 'health_check_failed':
        return await this.checkHealthFailures(rule.threshold)
      
      case 'error_rate > 10%':
        return await this.checkErrorRate(10)
      
      case 'memory_growth_rate > 5MB/min':
        return await this.checkMemoryGrowthRate(5)
      
      case 'disk_usage > 85%':
        return await this.checkDiskUsage(85)
      
      default:
        return false
    }
  }

  private async executeHealingAction(rule: SelfHealingRule): Promise<void> {
    console.log(`🚑 Executing healing action: ${rule.name}`)

    try {
      switch (rule.action) {
        case 'restart':
          await this.performRestartHealing()
          break
        
        case 'circuit_breaker':
          await this.activateCircuitBreaker()
          break
        
        case 'cleanup':
          await this.performCleanupHealing()
          break
        
        case 'scale':
          await this.performEmergencyScaling()
          break
      }

      // Update attempt counter
      const attempts = this.healingAttempts.get(rule.id) || 0
      this.healingAttempts.set(rule.id, attempts + 1)
      this.scalingHistory.set(rule.id, new Date())

      // Record healing action
      performanceMonitor.recordMetric({
        name: 'selfhealing.action_executed',
        value: 1,
        unit: 'count',
        timestamp: new Date(),
        tags: {
          rule: rule.name,
          action: rule.action
        }
      })

    } catch (error) {
      console.error(`Failed to execute healing action for rule ${rule.name}:`, error)
    }
  }

  private async runPredictiveScaling(): Promise<void> {
    console.log('🔮 Running predictive scaling analysis...')

    try {
      const resources = await cloudAdapterManager.listAllResources()
      
      for (const resource of resources) {
        // Get digital twin predictions
        const twin = digitalTwinEngine.getTwinsByOrganization('demo-org')
          .find(t => t.cloudResourceId === resource.id)
        
        if (!twin) continue

        const predictions = digitalTwinEngine.getPredictions(twin.id)
        const scalingPrediction = predictions.find(p => p.type === 'SCALING')
        
        if (scalingPrediction && scalingPrediction.prediction.recommendedAction === 'scale_up') {
          console.log(`🔮 Predictive scaling recommended for ${resource.name}`)
          
          // Execute predictive scaling with lower aggression
          await this.performPredictiveScaling(resource, scalingPrediction.prediction)
        }
      }
    } catch (error) {
      console.error('Error in predictive scaling:', error)
    }
  }

  private async performPredictiveScaling(resource: CloudResource, prediction: any): Promise<void> {
    const adapter = cloudAdapterManager.getAdapter(resource.cloudAccountId)
    if (!adapter) return

    const currentInstances = resource.configuration?.instances || 1
    const recommendedInstances = prediction.optimalInstances || currentInstances + 1

    // Conservative predictive scaling (max 25% increase)
    const maxIncrease = Math.ceil(currentInstances * 1.25)
    const targetInstances = Math.min(recommendedInstances, maxIncrease)

    if (targetInstances > currentInstances) {
      await adapter.scaleResource(resource.id, {
        desiredInstances: targetInstances,
        autoScaling: true
      })

      console.log(`🔮 Predictive scaling: ${resource.name} ${currentInstances} → ${targetInstances} instances`)
    }
  }

  // Helper methods for condition evaluation
  private async getResourceMetric(resourceId: string, metricName: string): Promise<number | null> {
    const cached = await cache.get(`metric:${resourceId}:${metricName}`)
    if (cached && typeof cached === 'number') return cached

    // Simulate metric retrieval - in production, get from monitoring system
    const mockMetrics = {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      requests_per_second: Math.random() * 2000,
      error_rate: Math.random() * 20
    }

    const value = mockMetrics[metricName as keyof typeof mockMetrics] || null
    if (value !== null) {
      await cache.set(`metric:${resourceId}:${metricName}`, value, { ttl: 30 })
    }

    return value
  }

  private async getMetricHistory(resourceId: string, metricName: string, duration: number): Promise<number[]> {
    // Simulate historical data - in production, query time-series database
    const points = Math.ceil(duration / 30) // 30-second intervals
    return Array.from({ length: points }, () => Math.random() * 100)
  }

  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'gt': return value > threshold
      case 'gte': return value >= threshold
      case 'lt': return value < threshold
      case 'lte': return value <= threshold
      default: return false
    }
  }

  private async checkHealthFailures(threshold: number): Promise<boolean> {
    // Check application health endpoints
    return Math.random() > 0.9 // 10% chance of health failure
  }

  private async checkErrorRate(threshold: number): Promise<boolean> {
    const errorRate = await this.getResourceMetric('app', 'error_rate') || 0
    return errorRate > threshold
  }

  private async checkMemoryGrowthRate(threshold: number): Promise<boolean> {
    // Simulate memory growth rate check
    return Math.random() > 0.95 // 5% chance of memory leak
  }

  private async checkDiskUsage(threshold: number): Promise<boolean> {
    const diskUsage = await this.getResourceMetric('app', 'disk') || 0
    return diskUsage > threshold
  }

  private async performRestartHealing(): Promise<void> {
    console.log('🔄 Performing restart healing...')
    // Restart unhealthy pods/containers
  }

  private async activateCircuitBreaker(): Promise<void> {
    console.log('🔌 Activating circuit breaker...')
    // Enable circuit breaker pattern
  }

  private async performCleanupHealing(): Promise<void> {
    console.log('🧹 Performing cleanup healing...')
    // Clean up logs, temporary files, etc.
  }

  private async performEmergencyScaling(): Promise<void> {
    console.log('🚨 Performing emergency scaling...')
    // Emergency scaling for critical situations
  }

  // Public API methods
  public addScalingPolicy(policy: ScalingPolicy): void {
    this.scalingPolicies.set(policy.id, policy)
  }

  public removeScalingPolicy(policyId: string): void {
    this.scalingPolicies.delete(policyId)
  }

  public addHealingRule(rule: SelfHealingRule): void {
    this.healingRules.set(rule.id, rule)
  }

  public removeHealingRule(ruleId: string): void {
    this.healingRules.delete(ruleId)
  }

  public getScalingPolicies(): ScalingPolicy[] {
    return Array.from(this.scalingPolicies.values())
  }

  public getHealingRules(): SelfHealingRule[] {
    return Array.from(this.healingRules.values())
  }

  public getScalingHistory(): Map<string, Date> {
    return new Map(this.scalingHistory)
  }
}

export const autoScalingService = new AutoScalingService()
