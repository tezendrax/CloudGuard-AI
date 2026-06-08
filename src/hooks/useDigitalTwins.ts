// Custom hook for Digital Twins data
'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wsClient } from '@/lib/websocket'

export interface DigitalTwin {
  id: string
  organizationId: string
  cloudAccountId: string
  cloudResourceId?: string
  name: string
  type: string
  state: Record<string, any>
  predictedState?: Record<string, any>
  lastSimulation?: Date
  accuracy?: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export function useDigitalTwins(organizationId: string) {
  const queryClient = useQueryClient()
  const [realTimeUpdates, setRealTimeUpdates] = useState<any[]>([])

  const query = useQuery({
    queryKey: ['digital-twins', organizationId],
    queryFn: async () => {
      const response = await fetch(`/api/digital-twins?organizationId=${organizationId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch digital twins')
      }
      return response.json()
    },
    refetchInterval: 10000, // 10 seconds
    enabled: !!organizationId
  })

  const createTwin = useMutation({
    mutationFn: async ({ resourceId }: { resourceId: string }) => {
      const response = await fetch('/api/digital-twins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId, organizationId })
      })
      if (!response.ok) {
        throw new Error('Failed to create digital twin')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-twins'] })
    }
  })

  const runSimulation = useMutation({
    mutationFn: async ({ 
      twinId, 
      scenario, 
      parameters 
    }: { 
      twinId: string
      scenario: string
      parameters?: any 
    }) => {
      const response = await fetch(`/api/digital-twins/${twinId}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, parameters })
      })
      if (!response.ok) {
        throw new Error('Failed to run simulation')
      }
      return response.json()
    }
  })

  // Set up real-time updates
  useEffect(() => {
    const handleTwinUpdate = (data: any) => {
      setRealTimeUpdates(prev => [data, ...prev.slice(0, 99)]) // Keep last 100 updates
      
      // Update query cache with real-time data
      queryClient.setQueryData(['digital-twins', organizationId], (oldData: any) => {
        if (!oldData) return oldData
        
        return {
          ...oldData,
          data: oldData.data.map((twin: DigitalTwin) => 
            twin.id === data.data.twinId 
              ? { ...twin, ...data.data, updatedAt: new Date(data.timestamp) }
              : twin
          )
        }
      })
    }

    wsClient.on('twin_update', handleTwinUpdate)

    return () => {
      wsClient.off('twin_update', handleTwinUpdate)
    }
  }, [organizationId, queryClient])

  return {
    twins: query.data?.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createTwin: createTwin.mutate,
    isCreatingTwin: createTwin.isPending,
    runSimulation: runSimulation.mutate,
    isRunningSimulation: runSimulation.isPending,
    realTimeUpdates
  }
}
