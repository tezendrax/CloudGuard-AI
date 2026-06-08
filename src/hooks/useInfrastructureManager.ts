'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Infrastructure Asset Data Models
interface InfrastructureAsset {
  id: string
  name: string
  type: 'server' | 'database' | 'storage' | 'network' | 'application' | 'container'
  provider: 'AWS' | 'Azure' | 'GCP' | 'On-Premise'
  status: 'healthy' | 'warning' | 'critical' | 'optimizing' | 'offline'
  location: string
  performance: {
    cpu: number
    memory: number
    disk: number
    network: number
    response_time: number
    uptime: number
  }
  cost: {
    hourly: number
    monthly: number
    yearly: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }
  aiInsights: {
    healthScore: number
    optimizationScore: number
    riskLevel: 'low' | 'medium' | 'high'
    recommendations: AIRecommendation[]
    predictions: {
      nextHourUtilization: number
      dailyPeakTime: string
      weeklyTrend: 'up' | 'down' | 'stable'
    }
  }
  monitoring: {
    alertsCount: number
    lastAlert: Date | null
    uptimePercentage: number
    avgResponseTime: number
  }
}

interface AIRecommendation {
  id: string
  type: 'cost' | 'performance' | 'security' | 'reliability' | 'capacity'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: string
  effort: 'minimal' | 'low' | 'medium' | 'high'
  savings: number
  confidence: number
  implementationSteps: string[]
  estimatedTime: string
}

interface InfrastructureManagerResponse {
  assets: InfrastructureAsset[]
  summary: {
    totalAssets: number
    healthyAssets: number
    averageHealth: number
    totalMonthlyCost: number
    totalRecommendations: number
    potentialMonthlySavings: number
    optimizationOpportunities: number
  }
  timestamp: string
}

interface MonitoringData {
  timestamp: string
  systemWide: {
    totalAssets: number
    healthyAssets: number
    averageHealthScore: number
    totalThroughput: number
    averageResponseTime: number
    systemErrorRate: number
    totalCpuUtilization: number
    totalMemoryUtilization: number
    networkTraffic: {
      totalIncoming: number
      totalOutgoing: number
    }
    costMetrics: {
      currentHourCost: number
      projectedDailyCost: number
      projectedMonthlyCost: number
    }
  }
  assets: any[]
  alerts: any[]
  anomalies: any[]
}

interface RecommendationsResponse {
  recommendations: AIRecommendation[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  summary: {
    totalRecommendations: number
    totalPotentialSavings: number
    averageConfidence: number
    byStatus: Record<string, number>
    byPriority: Record<string, number>
    byType: Record<string, number>
  }
  timestamp: string
}

export function useInfrastructureManager() {
  const queryClient = useQueryClient()
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)

  // Fetch all infrastructure assets
  const {
    data: infrastructureData,
    isLoading: isLoadingAssets,
    error: assetsError,
    refetch: refetchAssets
  } = useQuery(
    ['infrastructure-assets'],
    async (): Promise<InfrastructureManagerResponse> => {
      const response = await fetch('/api/infrastructure-manager?includeRecommendations=true', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response.json()
    },
    {
      refetchInterval: isMonitoring ? 30000 : false, // Refetch every 30 seconds when monitoring
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  )

  // Fetch real-time monitoring data
  const {
    data: monitoringData,
    isLoading: isLoadingMonitoring,
    error: monitoringError
  } = useQuery(
    ['infrastructure-monitoring'],
    async (): Promise<MonitoringData> => {
      const response = await fetch('/api/infrastructure-manager/monitoring?detailed=true', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response.json()
    },
    {
      refetchInterval: isMonitoring ? 5000 : false, // Refetch every 5 seconds when monitoring
      retry: 2,
      staleTime: 30 * 1000, // 30 seconds
      enabled: isMonitoring,
    }
  )

  // Fetch recommendations
  const {
    data: recommendationsData,
    isLoading: isLoadingRecommendations,
    error: recommendationsError
  } = useQuery(
    ['infrastructure-recommendations'],
    async (): Promise<RecommendationsResponse> => {
      const response = await fetch('/api/infrastructure-manager/recommendations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response.json()
    },
    {
      refetchInterval: 60000, // Refetch every minute
      retry: 1,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  )

  // Apply recommendation mutation
  const applyRecommendation = useMutation(
    async ({ recommendationId, action }: { recommendationId: string, action: string }) => {
      const response = await fetch('/api/infrastructure-manager/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recommendationId,
          action,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} recommendation`)
      }

      return response.json()
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['infrastructure-recommendations'])
        queryClient.invalidateQueries(['infrastructure-assets'])
        
        // Show success notification
        console.log(`Recommendation ${data.action} successfully`)
      },
      onError: (error) => {
        console.error('Failed to apply recommendation:', error)
      },
    }
  )

  // Start/stop monitoring mutation
  const toggleMonitoring = useMutation(
    async ({ assetId, action }: { assetId: string, action: 'start_monitoring' | 'stop_monitoring' }) => {
      const response = await fetch('/api/infrastructure-manager/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          assetId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action}`)
      }

      return response.json()
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['infrastructure-monitoring'])
        console.log(`Monitoring ${data.action} successfully`)
      },
      onError: (error) => {
        console.error('Failed to toggle monitoring:', error)
      },
    }
  )

  // Acknowledge alert mutation
  const acknowledgeAlert = useMutation(
    async ({ alertId }: { alertId: string }) => {
      const response = await fetch('/api/infrastructure-manager/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'acknowledge_alert',
          parameters: { alertId },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to acknowledge alert')
      }

      return response.json()
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['infrastructure-monitoring'])
        console.log('Alert acknowledged successfully')
      },
      onError: (error) => {
        console.error('Failed to acknowledge alert:', error)
      },
    }
  )

  // Helper functions
  const getAssetById = useCallback((assetId: string) => {
    return infrastructureData?.assets.find(asset => asset.id === assetId)
  }, [infrastructureData])

  const getAssetsByType = useCallback((type: string) => {
    return infrastructureData?.assets.filter(asset => asset.type === type) || []
  }, [infrastructureData])

  const getAssetsByStatus = useCallback((status: string) => {
    return infrastructureData?.assets.filter(asset => asset.status === status) || []
  }, [infrastructureData])

  const getHighPriorityRecommendations = useCallback(() => {
    return recommendationsData?.recommendations.filter(
      rec => rec.priority === 'high' || rec.priority === 'critical'
    ) || []
  }, [recommendationsData])

  const getTotalPotentialSavings = useCallback(() => {
    return recommendationsData?.summary.totalPotentialSavings || 0
  }, [recommendationsData])

  const getSystemHealthScore = useCallback(() => {
    return infrastructureData?.summary.averageHealth || 0
  }, [infrastructureData])

  const getActiveAlerts = useCallback(() => {
    return monitoringData?.alerts || []
  }, [monitoringData])

  const getAnomalies = useCallback(() => {
    return monitoringData?.anomalies || []
  }, [monitoringData])

  // Toggle monitoring state
  const handleToggleMonitoring = useCallback(() => {
    setIsMonitoring(prev => !prev)
  }, [])

  // Computed values
  const isLoading = isLoadingAssets || isLoadingMonitoring || isLoadingRecommendations
  const hasError = assetsError || monitoringError || recommendationsError
  const assets = infrastructureData?.assets || []
  const summary = infrastructureData?.summary
  const recommendations = recommendationsData?.recommendations || []
  const systemWideMetrics = monitoringData?.systemWide
  const activeAlerts = getActiveAlerts()
  const anomalies = getAnomalies()

  return {
    // Data
    assets,
    summary,
    recommendations,
    systemWideMetrics,
    monitoringData,
    selectedAsset,
    activeAlerts,
    anomalies,

    // State
    isLoading,
    isMonitoring,
    hasError,
    error: hasError ? (assetsError || monitoringError || recommendationsError) : null,

    // Actions
    setSelectedAsset,
    refetchAssets,
    applyRecommendation: applyRecommendation.mutate,
    toggleMonitoring: toggleMonitoring.mutate,
    acknowledgeAlert: acknowledgeAlert.mutate,
    handleToggleMonitoring,

    // Helper functions
    getAssetById,
    getAssetsByType,
    getAssetsByStatus,
    getHighPriorityRecommendations,
    getTotalPotentialSavings,
    getSystemHealthScore,

    // Mutation states
    isApplyingRecommendation: applyRecommendation.isLoading,
    isTogglingMonitoring: toggleMonitoring.isLoading,
    isAcknowledgingAlert: acknowledgeAlert.isLoading,
  }
}

export default useInfrastructureManager
