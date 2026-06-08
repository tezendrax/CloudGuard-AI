// Custom hook for real-time metrics
'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { wsClient, mockDataGenerator } from '@/lib/websocket'

export interface MetricData {
  timestamp: string
  value: number
  metric: string
}

export interface CurrentMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
  requests?: number
  errors?: number
  latency?: number
}

export function useRealTimeMetrics(resourceId: string = 'demo-resource-1') {
  const [currentMetrics, setCurrentMetrics] = useState<CurrentMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0
  })
  const [metricsHistory, setMetricsHistory] = useState<Record<string, MetricData[]>>({})
  const [isConnected, setIsConnected] = useState(false)
  const initialized = useRef(false)

  // Fetch historical metrics
  const { data: historicalData } = useQuery({
    queryKey: ['metrics', resourceId],
    queryFn: async () => {
      const response = await fetch(`/api/metrics?resourceId=${resourceId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch metrics')
      }
      return response.json()
    },
    refetchInterval: 30000, // 30 seconds for historical data
  })

  // Initialize WebSocket connection and real-time data sources
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Connect WebSocket (will use real data sources)
    wsClient.connect()
    
    // Initialize real-time data collection
    initializeRealTimeDataSources()
    
    // Fallback to mock data if needed
    if (process.env.NODE_ENV === 'development') {
      mockDataGenerator.start()
    }

    const handleConnection = (data: any) => {
      setIsConnected(data.status === 'connected')
    }

    // Check initial connection state
    setIsConnected(wsClient.isConnected())

    const handleMetrics = (data: any) => {
      if (data.resourceId === resourceId || !data.resourceId) {
        setCurrentMetrics(data.data)
        
        // Add to history
        const timestamp = data.timestamp
        setMetricsHistory(prev => {
          const newHistory = { ...prev }
          Object.keys(data.data).forEach(metric => {
            if (!newHistory[metric]) newHistory[metric] = []
            newHistory[metric] = [
              ...newHistory[metric].slice(-29), // Keep last 29 points
              {
                timestamp,
                value: data.data[metric],
                metric
              }
            ]
          })
          return newHistory
        })
      }
    }

    wsClient.on('connection', handleConnection)
    wsClient.on('metrics', handleMetrics)

    return () => {
      wsClient.off('connection', handleConnection)
      wsClient.off('metrics', handleMetrics)
      if (process.env.NODE_ENV === 'development') {
        mockDataGenerator.stop()
      }
      // Real-time data sources are managed globally, no need to stop here
    }
  }, [resourceId])

  // Initialize real-time data sources
  const initializeRealTimeDataSources = async () => {
    try {
      // Start the real-time data collection
      const response = await fetch('/api/data-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', interval: 3000 })
      })
      
      if (response.ok) {
        console.log('✅ Real-time data sources initialized')
      }
    } catch (error) {
      console.error('Failed to initialize real-time data sources:', error)
    }
  }

  // Initialize with historical data
  useEffect(() => {
    if (historicalData?.data) {
      setMetricsHistory(historicalData.data)
      if (historicalData.current) {
        setCurrentMetrics(historicalData.current)
      }
    }
  }, [historicalData])

  // Generate combined time series data
  const getTimeSeriesData = (metric: string): MetricData[] => {
    const historical = historicalData?.data?.[metric] || []
    const realTime = metricsHistory[metric] || []
    
    // Combine and deduplicate
    const combined = [...historical, ...realTime]
    const uniqueData = combined.reduce((acc: MetricData[], current) => {
      const existing = acc.find(item => item.timestamp === current.timestamp)
      if (!existing) {
        acc.push(current)
      }
      return acc
    }, [])
    
    return uniqueData.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ).slice(-30) // Keep last 30 points
  }

  const getAllMetrics = () => {
    const metrics = ['cpu', 'memory', 'disk', 'network', 'requests', 'errors', 'latency']
    return metrics.reduce((acc, metric) => {
      acc[metric] = getTimeSeriesData(metric)
      return acc
    }, {} as Record<string, MetricData[]>)
  }

  return {
    currentMetrics,
    metricsHistory: getAllMetrics(),
    isConnected,
    isLoading: !historicalData && Object.keys(metricsHistory).length === 0,
    getMetricData: getTimeSeriesData,
    resourceId
  }
}
