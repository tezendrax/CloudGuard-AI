import { jest } from '@jest/globals'
import { aiService } from '@/services/aiService'
import type { PredictionRequest, AnomalyDetectionRequest, CostOptimizationRequest } from '@/services/aiService'

// Mock fetch
global.fetch = jest.fn() as any

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('predictPerformance', () => {
    it('should return prediction from AI service', async () => {
      const mockResponse = {
        prediction: [75, 80, 85],
        confidence: 0.9,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const request: PredictionRequest = {
        resourceId: 'test-resource',
        metrics: [
          {
            timestamp: '2024-01-01T00:00:00Z',
            cpu: 70,
            memory: 60,
            disk: 50,
            network: 100,
          },
        ],
        timeWindow: 24,
      }

      const result = await aiService.predictPerformance(request)

      expect(result.resourceId).toBe('test-resource')
      expect(result.confidence).toBe(0.9)
      expect(result.prediction).toBeDefined()
      expect(result.timeframe).toHaveLength(24)
      expect(result.recommendations).toBeDefined()
    })

    it('should fallback to mock prediction on service error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Service unavailable'))

      const request: PredictionRequest = {
        resourceId: 'test-resource',
        metrics: [
          {
            timestamp: '2024-01-01T00:00:00Z',
            cpu: 70,
            memory: 60,
            disk: 50,
            network: 100,
          },
        ],
        timeWindow: 12,
      }

      const result = await aiService.predictPerformance(request)

      expect(result.resourceId).toBe('test-resource')
      expect(result.confidence).toBe(0.75)
      expect(result.prediction.cpu).toHaveLength(12)
      expect(result.recommendations).toContain('Resource utilization appears stable')
    })
  })

  describe('detectAnomalies', () => {
    it('should detect anomalies from AI service', async () => {
      const mockResponse = {
        resourceId: 'test-resource',
        anomalies: [
          {
            timestamp: '2024-01-01T00:00:00Z',
            metric: 'cpu',
            value: 95,
            severity: 'HIGH',
            description: 'CPU spike detected',
          },
        ],
        overallScore: 0.8,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const request: AnomalyDetectionRequest = {
        resourceId: 'test-resource',
        metrics: [],
        threshold: 0.8,
      }

      const result = await aiService.detectAnomalies(request)

      expect(result.resourceId).toBe('test-resource')
      expect(result.anomalies).toHaveLength(1)
      expect(result.overallScore).toBe(0.8)
    })
  })

  describe('optimizeCosts', () => {
    it('should return cost optimization recommendations', async () => {
      const mockResponse = {
        accountId: 'test-account',
        currentCost: 1000,
        projectedSavings: 200,
        recommendations: [
          {
            resourceId: 'resource-1',
            type: 'RESIZE',
            description: 'Downsize instance',
            estimatedSavings: 100,
            confidence: 0.9,
            priority: 'HIGH',
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const request: CostOptimizationRequest = {
        accountId: 'test-account',
        resources: [{ id: 'resource-1' }],
        timeRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-31T23:59:59Z',
        },
      }

      const result = await aiService.optimizeCosts(request)

      expect(result.accountId).toBe('test-account')
      expect(result.currentCost).toBe(1000)
      expect(result.projectedSavings).toBe(200)
      expect(result.recommendations).toHaveLength(1)
    })
  })
})
