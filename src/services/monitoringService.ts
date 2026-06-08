import { WebSocketService } from '@/lib/websocket'
import { aiService } from './aiService'
import type { CloudResource, Alert, Metric } from '@/types'

export interface MonitoringRule {
  id: string
  name: string
  resourceId?: string
  metric: string
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
  threshold: number
  duration: number // minutes
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  enabled: boolean
  actions: string[]
}

export interface AlertHistory {
  id: string
  ruleId: string
  resourceId: string
  metric: string
  value: number
  threshold: number
  severity: string
  triggeredAt: Date
  resolvedAt?: Date
  status: 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED'
  message: string
}

export class MonitoringService {
  private rules: Map<string, MonitoringRule> = new Map()
  private alertHistory: Map<string, AlertHistory> = new Map()
  private activeAlerts: Map<string, AlertHistory> = new Map()
  private metricBuffer: Map<string, Metric[]> = new Map()

  constructor() {
    this.initializeDefaultRules()
    this.startMonitoring()
  }

  private initializeDefaultRules() {
    const defaultRules: MonitoringRule[] = [
      {
        id: 'cpu-high',
        name: 'High CPU Usage',
        metric: 'cpu',
        operator: 'gt',
        threshold: 80,
        duration: 5,
        severity: 'HIGH' as any,
        enabled: true,
        actions: ['email', 'webhook', 'auto-scale']
      },
      {
        id: 'memory-critical',
        name: 'Critical Memory Usage',
        metric: 'memory',
        operator: 'gt',
        threshold: 90,
        duration: 2,
        severity: 'CRITICAL' as any,
        enabled: true,
        actions: ['email', 'webhook', 'sms', 'auto-scale']
      },
      {
        id: 'disk-full',
        name: 'Disk Space Critical',
        metric: 'disk',
        operator: 'gt',
        threshold: 95,
        duration: 1,
        severity: 'CRITICAL' as any,
        enabled: true,
        actions: ['email', 'webhook', 'sms']
      },
      {
        id: 'network-spike',
        name: 'Network Traffic Spike',
        metric: 'network',
        operator: 'gt',
        threshold: 1000,
        duration: 3,
        severity: 'MEDIUM' as any,
        enabled: true,
        actions: ['email', 'webhook']
      }
    ]

    defaultRules.forEach(rule => this.rules.set(rule.id, rule))
  }

  private startMonitoring() {
    // Run monitoring checks every 30 seconds
    setInterval(() => {
      this.runMonitoringCycle()
    }, 30000)

    // Run anomaly detection every 5 minutes
    setInterval(() => {
      this.runAnomalyDetection()
    }, 300000)

    // Clean up old metrics every hour
    setInterval(() => {
      this.cleanupOldMetrics()
    }, 3600000)
  }

  addMetric(resourceId: string, metric: Metric) {
    if (!this.metricBuffer.has(resourceId)) {
      this.metricBuffer.set(resourceId, [])
    }

    const metrics = this.metricBuffer.get(resourceId)!
    metrics.push(metric)

    // Keep only last 1000 metrics per resource
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000)
    }

    // Check rules for this metric
    this.checkRules(resourceId, metric)
  }

  private checkRules(resourceId: string, metric: Metric) {
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue
      if (rule.resourceId && rule.resourceId !== resourceId) continue

      const metricValue = this.getMetricValue(metric, rule.metric)
      if (metricValue === undefined) continue

      const isTriggered = this.evaluateRule(rule, metricValue)

      if (isTriggered) {
        this.handleRuleTriggered(rule, resourceId, metricValue)
      }
    }
  }

  private getMetricValue(metric: Metric, metricName: string): number | undefined {
    switch (metricName) {
      case 'cpu':
        return metric.value
      case 'memory':
        return metric.value
      case 'disk':
        return metric.value
      case 'network':
        return metric.value
      default:
        return undefined
    }
  }

  private evaluateRule(rule: MonitoringRule, value: number): boolean {
    switch (rule.operator) {
      case 'gt':
        return value > rule.threshold
      case 'gte':
        return value >= rule.threshold
      case 'lt':
        return value < rule.threshold
      case 'lte':
        return value <= rule.threshold
      case 'eq':
        return value === rule.threshold
      default:
        return false
    }
  }

  private handleRuleTriggered(rule: MonitoringRule, resourceId: string, value: number) {
    const alertKey = `${rule.id}-${resourceId}`
    
    // Check if alert is already active
    if (this.activeAlerts.has(alertKey)) {
      return
    }

    // Create new alert
    const alert: AlertHistory = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      resourceId,
      metric: rule.metric,
      value,
      threshold: rule.threshold,
      severity: rule.severity,
      triggeredAt: new Date(),
      status: 'ACTIVE' as any as any,
      message: `${rule.name}: ${rule.metric} is ${value}${rule.metric === 'network' ? 'MB/s' : '%'} (threshold: ${rule.threshold}${rule.metric === 'network' ? 'MB/s' : '%'})`
    }

    this.activeAlerts.set(alertKey, alert)
    this.alertHistory.set(alert.id, alert)

    // Execute alert actions
    this.executeAlertActions(rule, alert)

    // Broadcast alert via WebSocket
    WebSocketService.broadcastAlert(alert)

    console.log(`🚨 Alert triggered: ${alert.message}`)
  }

  private executeAlertActions(rule: MonitoringRule, alert: AlertHistory) {
    rule.actions.forEach(action => {
      switch (action) {
        case 'email':
          this.sendEmailAlert(alert)
          break
        case 'webhook':
          this.sendWebhookAlert(alert)
          break
        case 'sms':
          this.sendSMSAlert(alert)
          break
        case 'auto-scale':
          this.triggerAutoScale(alert)
          break
      }
    })
  }

  private sendEmailAlert(alert: AlertHistory) {
    // In production, integrate with email service (SendGrid, SES, etc.)
    console.log(`📧 Email alert sent for: ${alert.message}`)
  }

  private sendWebhookAlert(alert: AlertHistory) {
    // In production, send to configured webhook URLs
    console.log(`🪝 Webhook alert sent for: ${alert.message}`)
  }

  private sendSMSAlert(alert: AlertHistory) {
    // In production, integrate with SMS service (Twilio, etc.)
    console.log(`📱 SMS alert sent for: ${alert.message}`)
  }

  private triggerAutoScale(alert: AlertHistory) {
    // Trigger auto-scaling via AutoScalingService
    console.log(`⚡ Auto-scaling triggered for: ${alert.resourceId}`)
    
    try {
      // Import dynamically to avoid circular dependencies
      import('./autoScalingService').then(({ autoScalingService }) => {
        // Trigger immediate scaling evaluation for this resource
        autoScalingService.addScalingPolicy({
          id: `emergency-${alert.id}`,
          resourceId: alert.resourceId,
          name: `Emergency scaling for ${alert.metric} threshold breach`,
          type: 'horizontal',
          triggers: [{
            metric: alert.metric,
            operator: 'gt',
            threshold: alert.threshold,
            duration: 60,
            evaluationPeriods: 1
          }],
          actions: [{
            type: 'scale_up',
            parameters: {
              percentage: 50,
              maxInstances: 10
            }
          }],
          cooldownPeriod: 300,
          enabled: true
        })
      })
    } catch (error) {
      console.error('Failed to trigger auto-scaling:', error)
    }
  }

  private async runMonitoringCycle() {
    // Check for alerts that should be resolved
    for (const [alertKey, alert] of this.activeAlerts.entries()) {
      const shouldResolve = await this.shouldResolveAlert(alert)
      if (shouldResolve) {
        this.resolveAlert(alertKey, alert)
      }
    }
  }

  private async shouldResolveAlert(alert: AlertHistory): Promise<boolean> {
    const metrics = this.metricBuffer.get(alert.resourceId)
    if (!metrics || metrics.length === 0) return false

    // Check last 3 metrics to see if condition is no longer met
    const recentMetrics = metrics.slice(-3)
    const rule = this.rules.get(alert.ruleId)
    if (!rule) return true

    return recentMetrics.every(metric => {
      const value = this.getMetricValue(metric, alert.metric)
      return value !== undefined && !this.evaluateRule(rule, value)
    })
  }

  private resolveAlert(alertKey: string, alert: AlertHistory) {
    alert.status = 'RESOLVED'
    alert.resolvedAt = new Date()

    this.activeAlerts.delete(alertKey)
    this.alertHistory.set(alert.id, alert)

    // Broadcast resolution via WebSocket
    WebSocketService.broadcastAlert(alert)

    console.log(`✅ Alert resolved: ${alert.message}`)
  }

  private async runAnomalyDetection() {
    for (const [resourceId, metrics] of this.metricBuffer.entries()) {
      if (metrics.length < 10) continue // Need minimum data points

      try {
        const anomalyResult = await aiService.detectAnomalies({
          resourceId,
          metrics: metrics.slice(-100), // Last 100 metrics
          threshold: 0.8
        })

        if (anomalyResult.anomalies.length > 0) {
          console.log(`🔍 Anomalies detected for ${resourceId}:`, anomalyResult.anomalies)
          
          // Create anomaly alerts
          anomalyResult.anomalies.forEach(anomaly => {
            const alert: AlertHistory = {
              id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              ruleId: 'anomaly-detection',
              resourceId,
              metric: anomaly.metric,
              value: anomaly.value,
              threshold: 0,
              severity: anomaly.severity,
              triggeredAt: new Date(anomaly.timestamp),
              status: 'ACTIVE' as any as any,
              message: `Anomaly detected: ${anomaly.description}`
            }

            this.alertHistory.set(alert.id, alert)
            WebSocketService.broadcastAlert(alert)
          })
        }
      } catch (error) {
        console.error(`Failed to run anomaly detection for ${resourceId}:`, error)
      }
    }
  }

  private cleanupOldMetrics() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago

    for (const [resourceId, metrics] of this.metricBuffer.entries()) {
      const filteredMetrics = metrics.filter(metric => 
        new Date(metric.timestamp) > cutoff
      )
      this.metricBuffer.set(resourceId, filteredMetrics)
    }

    console.log('🧹 Old metrics cleaned up')
  }

  // Public API methods
  addRule(rule: MonitoringRule) {
    this.rules.set(rule.id, rule)
  }

  removeRule(ruleId: string) {
    this.rules.delete(ruleId)
  }

  getRules(): MonitoringRule[] {
    return Array.from(this.rules.values())
  }

  getActiveAlerts(): AlertHistory[] {
    return Array.from(this.activeAlerts.values())
  }

  getAlertHistory(limit: number = 100): AlertHistory[] {
    return Array.from(this.alertHistory.values())
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
      .slice(0, limit)
  }

  acknowledgeAlert(alertId: string) {
    const alert = this.alertHistory.get(alertId)
    if (alert && alert.status === 'ACTIVE') {
      alert.status = 'ACKNOWLEDGED'
      this.alertHistory.set(alertId, alert)
      WebSocketService.broadcastAlert(alert)
    }
  }
}

export const monitoringService = new MonitoringService()
