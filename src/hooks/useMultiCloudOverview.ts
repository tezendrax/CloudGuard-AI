'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'

export interface CloudProvider {
  id: string
  name: string
  logo: string
  status: 'connected' | 'disconnected' | 'error' | 'connecting'
  region: string
  resources: {
    total: number
    compute: number
    storage: number
    database: number
    network: number
    security: number
  }
  cost: {
    current: number
    projected: number
    lastMonth: number
    trend: string
    breakdown: {
      compute: number
      storage: number
      database: number
      network: number
      other: number
    }
  }
  alerts: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
  }
  performance: {
    uptime: number
    responseTime: number
    availability: number
    incidents: number
  }
  growth: string
  color: string
  lastSync: Date
}

export interface CloudResource {
  id: string
  cloudAccountId: string
  externalId: string
  name: string
  type: 'COMPUTE' | 'STORAGE' | 'DATABASE' | 'NETWORK' | 'SECURITY' | 'ANALYTICS' | 'CONTAINER' | 'SERVERLESS' | 'OTHER'
  status: 'RUNNING' | 'STOPPED' | 'PENDING' | 'TERMINATED' | 'ERROR' | 'UNKNOWN'
  region: string
  provider: 'AWS' | 'AZURE' | 'GCP' | 'MULTI_CLOUD'
  tags: Record<string, string>
  configuration: Record<string, any>
  cost: number
  utilization: Record<string, number>
  lastSyncAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface CrossCloudAnalytics {
  totalResources: number
  totalCost: number
  averageUtilization: number
  costEfficiency: number
  redundancy: number
  complianceScore: number
  securityScore: number
  recommendations: Array<{
    type: 'cost' | 'performance' | 'security' | 'compliance'
    priority: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    impact: string
    effort: 'low' | 'medium' | 'high'
    savings?: number
  }>
}

export function useMultiCloudOverview() {
  const queryClient = useQueryClient()
  const [selectedProvider, setSelectedProvider] = useState<string>('aws')
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds

  // Fetch cloud providers overview
  const { data: providersData, isLoading: providersLoading, error: providersError } = useQuery({
    queryKey: ['cloud-providers-overview'],
    queryFn: async (): Promise<{ providers: CloudProvider[], analytics: CrossCloudAnalytics }> => {
      const response = await fetch('/api/cloud/providers/overview')
      if (!response.ok) {
        throw new Error('Failed to fetch cloud providers overview')
      }
      return response.json()
    },
    refetchInterval: refreshInterval,
    staleTime: 15000, // Consider data stale after 15 seconds
  })

  // Fetch detailed resources for selected provider
  const { data: resourcesData, isLoading: resourcesLoading } = useQuery({
    queryKey: ['cloud-resources', selectedProvider],
    queryFn: async (): Promise<{ data: CloudResource[], count: number }> => {
      const response = await fetch(`/api/cloud/resources?provider=${selectedProvider.toUpperCase()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch cloud resources')
      }
      return response.json()
    },
    enabled: !!selectedProvider,
    refetchInterval: refreshInterval,
  })

  // Resource action mutation
  const resourceAction = useMutation({
    mutationFn: async ({ action, resourceId, parameters }: { 
      action: string, 
      resourceId: string, 
      parameters?: any 
    }) => {
      const response = await fetch('/api/cloud/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, resourceId, parameters }),
      })
      if (!response.ok) {
        throw new Error('Failed to execute resource action')
      }
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cloud-resources'] })
      queryClient.invalidateQueries({ queryKey: ['cloud-providers-overview'] })
      toast({
        title: 'Action Completed',
        description: data.details || 'Resource action completed successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Action Failed',
        description: 'Failed to execute resource action. Please try again.',
        variant: 'destructive',
      })
    },
  })

  // Provider sync mutation
  const syncProvider = useMutation({
    mutationFn: async (providerId: string) => {
      const response = await fetch(`/api/cloud/providers/${providerId}/sync`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to sync provider')
      }
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cloud-providers-overview'] })
      toast({
        title: 'Sync Completed',
        description: `${data.provider} has been synchronized successfully.`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync cloud provider. Please check your credentials.',
        variant: 'destructive',
      })
    },
  })

  // Cross-cloud migration simulation
  const simulateMigration = async (sourceProvider: string, targetProvider: string, resourceIds: string[]) => {
    try {
      const response = await fetch('/api/cloud/migration/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceProvider, targetProvider, resourceIds }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to simulate migration')
      }
      
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Migration simulation error:', error)
      throw error
    }
  }

  // Cost comparison across providers
  const compareCosts = (providers: CloudProvider[]) => {
    if (!providers || providers.length === 0) return null

    const comparison = providers.map(provider => ({
      provider: provider.name,
      id: provider.id,
      totalCost: provider.cost.current,
      costPerResource: provider.cost.current / provider.resources.total,
      efficiency: provider.resources.total / provider.cost.current,
      trend: provider.cost.trend,
      savings: provider.cost.lastMonth - provider.cost.current
    }))

    return comparison.sort((a, b) => a.costPerResource - b.costPerResource)
  }

  // Performance comparison
  const comparePerformance = (providers: CloudProvider[]) => {
    if (!providers || providers.length === 0) return null

    return providers.map(provider => ({
      provider: provider.name,
      id: provider.id,
      uptime: provider.performance.uptime,
      responseTime: provider.performance.responseTime,
      availability: provider.performance.availability,
      score: (provider.performance.uptime + provider.performance.availability) / 2
    })).sort((a, b) => b.score - a.score)
  }

  // Generate unified recommendations
  const getUnifiedRecommendations = (analytics: CrossCloudAnalytics, providers: CloudProvider[]) => {
    const recommendations = []

    // Cost optimization recommendations
    const highCostProviders = providers.filter(p => p.cost.current > 2000)
    if (highCostProviders.length > 0) {
      recommendations.push({
        type: 'cost' as const,
        priority: 'high' as const,
        title: 'High Cost Providers Detected',
        description: `${highCostProviders.map(p => p.name).join(', ')} have high monthly costs`,
        impact: `Potential savings of $${highCostProviders.reduce((sum, p) => sum + p.cost.current * 0.2, 0).toFixed(0)}/month`,
        effort: 'medium' as const,
        savings: highCostProviders.reduce((sum, p) => sum + p.cost.current * 0.2, 0)
      })
    }

    // Multi-cloud redundancy
    const criticalResources = providers.reduce((sum, p) => sum + p.alerts.critical, 0)
    if (criticalResources > 0) {
      recommendations.push({
        type: 'performance' as const,
        priority: 'critical' as const,
        title: 'Critical Alerts Across Providers',
        description: `${criticalResources} critical alerts need immediate attention`,
        impact: 'Service availability at risk',
        effort: 'high' as const
      })
    }

    // Security recommendations
    if (analytics.securityScore < 80) {
      recommendations.push({
        type: 'security' as const,
        priority: 'high' as const,
        title: 'Improve Multi-Cloud Security',
        description: 'Security score below recommended threshold',
        impact: 'Enhanced security posture across all clouds',
        effort: 'medium' as const
      })
    }

    return recommendations
  }

  const providers = providersData?.providers || []
  const analytics = providersData?.analytics || null
  const resources = resourcesData?.data || []
  const selectedProviderData = providers.find(p => p.id === selectedProvider)

  return {
    // Data
    providers,
    analytics,
    resources,
    selectedProvider,
    selectedProviderData,
    
    // Loading states
    isLoading: providersLoading || resourcesLoading,
    error: providersError,
    
    // Actions
    setSelectedProvider,
    executeResourceAction: resourceAction.mutate,
    syncProvider: syncProvider.mutate,
    simulateMigration,
    
    // Action states
    isExecutingAction: resourceAction.isPending,
    isSyncing: syncProvider.isPending,
    
    // Analytics
    costComparison: compareCosts(providers),
    performanceComparison: comparePerformance(providers),
    unifiedRecommendations: getUnifiedRecommendations(analytics || {} as CrossCloudAnalytics, providers),
    
    // Settings
    refreshInterval,
    setRefreshInterval,
  }
}
