// Custom hook for cloud resources data
'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface CloudResource {
  id: string
  cloudAccountId: string
  externalId: string
  name: string
  type: string
  status: string
  region: string
  provider: string
  tags: Record<string, any>
  configuration: Record<string, any>
  cost: number
  utilization: Record<string, number>
  lastSyncAt: Date
  createdAt: Date
  updatedAt: Date
}

interface UseCloudResourcesOptions {
  provider?: string
  type?: string
  status?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useCloudResources(options: UseCloudResourcesOptions = {}) {
  const { provider, type, status, autoRefresh = true, refreshInterval = 30000 } = options
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['cloud-resources', { provider, type, status }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (provider) params.append('provider', provider)
      if (type) params.append('type', type)
      if (status) params.append('status', status)

      const response = await fetch(`/api/cloud/resources?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch cloud resources')
      }
      return response.json()
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 10000, // 10 seconds
  })

  const resourceAction = useMutation({
    mutationFn: async ({ resourceId, action, parameters }: { 
      resourceId: string
      action: string
      parameters?: any 
    }) => {
      const response = await fetch('/api/cloud/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId, action, parameters })
      })
      if (!response.ok) {
        throw new Error('Failed to execute resource action')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch resources after action
      queryClient.invalidateQueries({ queryKey: ['cloud-resources'] })
    }
  })

  return {
    resources: query.data?.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    executeAction: resourceAction.mutate,
    isExecutingAction: resourceAction.isPending
  }
}
