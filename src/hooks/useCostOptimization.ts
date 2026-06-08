'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'

export interface CostOptimization {
  id: string
  type: 'rightsizing' | 'reserved' | 'spot' | 'storage' | 'network'
  title: string
  description: string
  currentCost: number
  optimizedCost: number
  savings: number
  confidence: number
  status: 'available' | 'applied' | 'scheduled' | 'in_progress'
  impact: 'low' | 'medium' | 'high'
  timeframe?: string
  effort?: string
  details?: any
}

export interface CostSummary {
  totalRecommendations: number
  totalPotentialSavings: number
  availableOptimizations: number
  appliedOptimizations: number
  averageConfidence: number
}

export function useCostOptimization() {
  const queryClient = useQueryClient()
  const [isAutoOptimizing, setIsAutoOptimizing] = useState(false)

  // Fetch cost optimizations
  const { data: costData, isLoading, error } = useQuery(
    ['cost-optimizations'],
    async () => {
      console.log('Fetching cost optimizations...')
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
      
      // Create the fetch promise
      const fetchPromise = fetch('/api/cost/optimization').then(async (response) => {
        if (!response.ok) {
          console.error('Failed to fetch cost optimizations:', response.status, response.statusText)
          throw new Error(`Failed to fetch cost optimizations: ${response.status}`)
        }
        const data = await response.json()
        console.log('Cost optimizations fetched:', data)
        return data
      })
      
      // Race between fetch and timeout
      return Promise.race([fetchPromise, timeoutPromise])
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      retry: 1, // Only retry once
      staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
      cacheTime: 10 * 60 * 1000, // Cache for 10 minutes (gcTime in v5)
    }
  )

  // Apply optimization mutation
  const applyOptimization = useMutation(
    async ({ optimizationId, action }: { optimizationId: string, action: string }) => {
      const response = await fetch('/api/cost/optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optimizationId, action }),
      })
      if (!response.ok) {
        throw new Error('Failed to apply optimization')
      }
      return response.json()
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['cost-optimizations'])
        toast({
          title: 'Optimization Applied',
          description: data.details || 'Cost optimization has been applied successfully.',
        })
      },
      onError: (error) => {
        toast({
          title: 'Optimization Failed',
          description: 'Failed to apply cost optimization. Please try again.',
          variant: 'destructive',
        })
      },
    }
  )

  // Auto-optimization function
  const runAutoOptimization = async () => {
    if (isAutoOptimizing) return
    
    setIsAutoOptimizing(true)
    const availableOptimizations = costData?.data?.filter((opt: CostOptimization) => 
      opt.status === 'available' && opt.confidence > 90
    ) || []

    toast({
      title: 'Auto-Optimization Started',
      description: `Applying ${availableOptimizations.length} high-confidence optimizations...`,
    })

    try {
      for (const optimization of availableOptimizations) {
        await applyOptimization.mutateAsync({
          optimizationId: optimization.id,
          action: 'apply'
        })
        // Add small delay between optimizations
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      toast({
        title: 'Auto-Optimization Complete',
        description: `Successfully applied ${availableOptimizations.length} optimizations.`,
      })
    } catch (error) {
      toast({
        title: 'Auto-Optimization Failed',
        description: 'Some optimizations could not be applied automatically.',
        variant: 'destructive',
      })
    } finally {
      setIsAutoOptimizing(false)
    }
  }

  // Generate cost report
  const generateCostReport = async () => {
    try {
      const response = await fetch('/api/cost/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          includeOptimizations: true,
          timeRange: '30d',
          format: 'detailed'
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate cost report')
      }
      
      const reportData = await response.json()
      
      // Create and download the report
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cost-report-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: 'Cost Report Generated',
        description: 'Your cost report has been downloaded successfully.',
      })
    } catch (error) {
      toast({
        title: 'Report Generation Failed',
        description: 'Failed to generate cost report. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Log error for debugging
  if (error) {
    console.error('Cost optimization hook error:', error)
  }

  const optimizations: CostOptimization[] = costData?.data || []
  const summary: CostSummary = costData?.summary || {
    totalRecommendations: 0,
    totalPotentialSavings: 0,
    availableOptimizations: 0,
    appliedOptimizations: 0,
    averageConfidence: 0
  }

  return {
    optimizations,
    summary,
    isLoading,
    error,
    applyOptimization: applyOptimization.mutate,
    isApplying: applyOptimization.isPending,
    runAutoOptimization,
    isAutoOptimizing,
    generateCostReport,
  }
}
