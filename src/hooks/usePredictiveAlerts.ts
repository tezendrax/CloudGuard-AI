'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'

export interface DetailedAlert {
  id: string
  type: 'performance' | 'cost' | 'security' | 'failure' | 'capacity' | 'compliance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  confidence: number
  timeToImpact: string
  predictedAt: Date
  status: 'active' | 'acknowledged' | 'resolved' | 'investigating'
  autoAction?: string
  
  rootCause: {
    primary: string
    contributing: string[]
    dataPoints: Array<{
      metric: string
      current: number
      threshold: number
      trend: 'increasing' | 'decreasing' | 'stable'
      unit: string
    }>
  }
  
  impact: {
    severity: 'minimal' | 'moderate' | 'significant' | 'severe'
    affectedSystems: string[]
    businessImpact: string
    technicalImpact: string
    estimatedCost?: number
    userImpact?: string
  }
  
  recommendations: Array<{
    action: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    effort: 'minimal' | 'moderate' | 'significant'
    timeframe: string
    expectedOutcome: string
    riskLevel: 'low' | 'medium' | 'high'
  }>
  
  history: {
    similarIncidents: number
    lastOccurrence?: Date
    averageResolutionTime: string
    successRate: number
  }
  
  monitoring: {
    alertSource: string[]
    detectionMethod: string
    correlatedEvents: Array<{
      timestamp: Date
      event: string
      severity: string
    }>
  }
}

export interface AlertSummary {
  total: number
  bySeverity: {
    critical: number
    high: number
    medium: number
    low: number
  }
  byStatus: {
    active: number
    acknowledged: number
    investigating: number
    resolved: number
  }
  byType: {
    performance: number
    cost: number
    security: number
    failure: number
    capacity: number
    compliance: number
  }
}

export function usePredictiveAlerts() {
  const queryClient = useQueryClient()
  const [selectedAlert, setSelectedAlert] = useState<DetailedAlert | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    type: '',
    limit: 10
  })

  // Fetch predictive alerts
  const { data: alertsData, isLoading, error, refetch } = useQuery({
    queryKey: ['predictive-alerts', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.severity) params.append('severity', filters.severity)
      if (filters.status) params.append('status', filters.status)
      if (filters.type) params.append('type', filters.type)
      params.append('limit', filters.limit.toString())
      
      const response = await fetch(`/api/monitoring/alerts/predictive?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch predictive alerts')
      }
      return response.json()
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider stale after 15 seconds
  })

  // Alert action mutation
  const alertAction = useMutation({
    mutationFn: async ({ alertId, action, notes }: { 
      alertId: string, 
      action: string, 
      notes?: string 
    }) => {
      const response = await fetch('/api/monitoring/alerts/predictive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action, notes }),
      })
      if (!response.ok) {
        throw new Error('Failed to update alert status')
      }
      return response.json()
    },
    onMutate: async ({ alertId, action }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['predictive-alerts'] })

      // Snapshot the previous value
      const previousAlerts = queryClient.getQueryData(['predictive-alerts', filters])

      // Optimistically update to the new value
      queryClient.setQueryData(['predictive-alerts', filters], (old: any) => {
        if (!old) return old
        
        const newStatus = action === 'acknowledge' ? 'acknowledged' : 
                         action === 'resolve' ? 'resolved' : 
                         action === 'investigate' ? 'investigating' : 'escalated'
        
        const updatedAlerts = old.data.map((alert: DetailedAlert) => 
          alert.id === alertId ? { ...alert, status: newStatus } : alert
        )
        
        // Update summary counts
        const updatedSummary = { ...old.summary }
        const oldAlert = old.data.find((alert: DetailedAlert) => alert.id === alertId)
        if (oldAlert) {
          // Decrease old status count
          if (updatedSummary.byStatus[oldAlert.status as keyof typeof updatedSummary.byStatus] > 0) {
            updatedSummary.byStatus[oldAlert.status as keyof typeof updatedSummary.byStatus]--
          }
          // Increase new status count
          updatedSummary.byStatus[newStatus as keyof typeof updatedSummary.byStatus]++
        }
        
        return {
          ...old,
          data: updatedAlerts,
          summary: updatedSummary
        }
      })

      // Return a context object with the snapshotted value
      return { previousAlerts }
    },
    onError: (err, newAlert, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['predictive-alerts', filters], context?.previousAlerts)
      toast({
        title: 'Update Failed',
        description: 'Failed to update alert status. Please try again.',
        variant: 'destructive',
      })
    },
    onSuccess: (data) => {
      toast({
        title: 'Alert Updated',
        description: data.message || 'Alert status updated successfully.',
      })
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['predictive-alerts'] })
    },
  })

  const alerts: DetailedAlert[] = alertsData?.data || []
  const summary: AlertSummary = alertsData?.summary || {
    total: 0,
    bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    byStatus: { active: 0, acknowledged: 0, investigating: 0, resolved: 0 },
    byType: { performance: 0, cost: 0, security: 0, failure: 0, capacity: 0, compliance: 0 }
  }

  // Helper functions
  const acknowledgeAlert = (alertId: string, notes?: string) => {
    alertAction.mutate({ alertId, action: 'acknowledge', notes })
  }

  const resolveAlert = (alertId: string, notes?: string) => {
    alertAction.mutate({ alertId, action: 'resolve', notes })
  }

  const investigateAlert = (alertId: string, notes?: string) => {
    alertAction.mutate({ alertId, action: 'investigate', notes })
  }

  const escalateAlert = (alertId: string, notes?: string) => {
    alertAction.mutate({ alertId, action: 'escalate', notes })
  }

  const openAlertDetails = (alert: DetailedAlert) => {
    setSelectedAlert(alert)
    setShowDetails(true)
  }

  const closeAlertDetails = () => {
    setSelectedAlert(null)
    setShowDetails(false)
  }

  // Filter functions
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({
      severity: '',
      status: '',
      type: '',
      limit: 10
    })
  }

  // Alert categorization
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'active')
  const highPriorityAlerts = alerts.filter(a => ['critical', 'high'].includes(a.severity) && a.status === 'active')
  const securityAlerts = alerts.filter(a => a.type === 'security' && a.status === 'active')
  const performanceAlerts = alerts.filter(a => a.type === 'performance' && a.status === 'active')

  // Analytics
  const avgConfidence = alerts.length > 0 
    ? alerts.reduce((sum, a) => sum + a.confidence, 0) / alerts.length 
    : 0

  const alertTrends = {
    increasing: alerts.filter(a => 
      a.rootCause.dataPoints.some(dp => dp.trend === 'increasing')
    ).length,
    decreasing: alerts.filter(a => 
      a.rootCause.dataPoints.some(dp => dp.trend === 'decreasing')
    ).length,
    stable: alerts.filter(a => 
      a.rootCause.dataPoints.every(dp => dp.trend === 'stable')
    ).length
  }

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates by refetching data
      if (alerts.length > 0 && Math.random() > 0.8) {
        refetch()
      }
    }, 15000) // Check every 15 seconds

    return () => clearInterval(interval)
  }, [alerts.length, refetch])

  return {
    // Data
    alerts,
    summary,
    selectedAlert,
    showDetails,
    filters,
    
    // Loading states
    isLoading,
    error,
    isUpdating: alertAction.isPending,
    
    // Actions
    acknowledgeAlert,
    resolveAlert,
    investigateAlert,
    escalateAlert,
    openAlertDetails,
    closeAlertDetails,
    refetch,
    
    // Filtering
    updateFilters,
    clearFilters,
    
    // Categorized alerts
    criticalAlerts,
    highPriorityAlerts,
    securityAlerts,
    performanceAlerts,
    
    // Analytics
    avgConfidence,
    alertTrends,
    metadata: alertsData?.metadata,
    
    // Utilities
    getSeverityColor: (severity: string) => {
      switch (severity) {
        case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
        case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
        case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
        case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20'
        default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
      }
    },
    
    getTypeIcon: (type: string) => {
      switch (type) {
        case 'performance': return '📈'
        case 'cost': return '💰'
        case 'security': return '🔒'
        case 'failure': return '❌'
        case 'capacity': return '📊'
        case 'compliance': return '📋'
        default: return '⚠️'
      }
    },
    
    getStatusColor: (status: string) => {
      switch (status) {
        case 'active': return 'text-red-600 bg-red-100'
        case 'acknowledged': return 'text-yellow-600 bg-yellow-100'
        case 'investigating': return 'text-blue-600 bg-blue-100'
        case 'resolved': return 'text-green-600 bg-green-100'
        default: return 'text-gray-600 bg-gray-100'
      }
    }
  }
}
