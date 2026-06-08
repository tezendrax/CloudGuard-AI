// Performance monitoring and optimization utilities

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: Date
  tags?: Record<string, string>
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private timers: Map<string, number> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Start timing an operation
  startTimer(name: string): void {
    this.timers.set(name, performance.now())
  }

  // End timing and record metric
  endTimer(name: string, tags?: Record<string, string>): number {
    const startTime = this.timers.get(name)
    if (!startTime) {
      console.warn(`Timer ${name} was not started`)
      return 0
    }

    const duration = performance.now() - startTime
    this.timers.delete(name)

    this.recordMetric({
      name,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      tags
    })

    return duration
  }

  // Record a custom metric
  recordMetric(metric: PerformanceMetric): void {
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, [])
    }

    const metrics = this.metrics.get(metric.name)!
    metrics.push(metric)

    // Keep only last 1000 metrics per name
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000)
    }
  }

  // Get metrics for a specific name
  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.get(name) || []
  }

  // Get all metric names
  getMetricNames(): string[] {
    return Array.from(this.metrics.keys())
  }

  // Get summary statistics for a metric
  getMetricSummary(name: string, timeWindow?: number): {
    count: number
    avg: number
    min: number
    max: number
    p95: number
    p99: number
  } {
    const metrics = this.getMetrics(name)
    
    if (metrics.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, p95: 0, p99: 0 }
    }

    // Filter by time window if specified
    const filteredMetrics = timeWindow
      ? metrics.filter(m => Date.now() - m.timestamp.getTime() <= timeWindow)
      : metrics

    if (filteredMetrics.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, p95: 0, p99: 0 }
    }

    const values = filteredMetrics.map(m => m.value).sort((a, b) => a - b)
    const count = values.length
    const sum = values.reduce((a, b) => a + b, 0)
    
    return {
      count,
      avg: sum / count,
      min: values[0],
      max: values[count - 1],
      p95: values[Math.floor(count * 0.95)],
      p99: values[Math.floor(count * 0.99)]
    }
  }

  // Clear metrics
  clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name)
    } else {
      this.metrics.clear()
    }
  }
}

// Singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

// Performance decorator
export function measurePerformance(metricName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    const name = metricName || `${target.constructor.name}.${propertyName}`

    descriptor.value = async function (...args: any[]) {
      performanceMonitor.startTimer(name)
      try {
        const result = await method.apply(this, args)
        performanceMonitor.endTimer(name, { status: 'success' })
        return result
      } catch (error) {
        performanceMonitor.endTimer(name, { status: 'error' })
        throw error
      }
    }
  }
}

// Database connection pool optimization
export class DatabasePool {
  private static pools: Map<string, any> = new Map()

  static getPool(connectionString: string, options: any = {}) {
    if (!this.pools.has(connectionString)) {
      // In production, use proper connection pooling
      console.log('Creating database pool for:', connectionString.replace(/\/\/.*@/, '//***@'))
      this.pools.set(connectionString, {
        query: async (sql: string, params?: any[]) => {
          // Mock implementation - replace with actual pool
          performanceMonitor.recordMetric({
            name: 'db.query',
            value: Math.random() * 50,
            unit: 'ms',
            timestamp: new Date(),
            tags: { operation: 'query' }
          })
        }
      })
    }
    return this.pools.get(connectionString)
  }
}

// Memory usage monitoring
export function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage()
    return {
      rss: usage.rss / 1024 / 1024, // MB
      heapTotal: usage.heapTotal / 1024 / 1024, // MB
      heapUsed: usage.heapUsed / 1024 / 1024, // MB
      external: usage.external / 1024 / 1024, // MB
    }
  }
  return null
}

// CPU usage monitoring (Node.js only)
export function getCPUUsage() {
  if (typeof process !== 'undefined' && process.cpuUsage) {
    const usage = process.cpuUsage()
    return {
      user: usage.user / 1000, // ms
      system: usage.system / 1000, // ms
    }
  }
  return null
}

// Response time middleware
export function responseTimeMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = performance.now()
    
    res.on('finish', () => {
      const duration = performance.now() - startTime
      performanceMonitor.recordMetric({
        name: 'http.response_time',
        value: duration,
        unit: 'ms',
        timestamp: new Date(),
        tags: {
          method: req.method,
          status: res.statusCode.toString(),
          route: req.route?.path || req.path
        }
      })
    })
    
    next()
  }
}

// Batch operations utility
export class BatchProcessor<T> {
  private batch: T[] = []
  private batchSize: number
  private flushInterval: number
  private processor: (items: T[]) => Promise<void>
  private timer: NodeJS.Timeout | null = null

  constructor(
    processor: (items: T[]) => Promise<void>,
    batchSize: number = 100,
    flushInterval: number = 5000
  ) {
    this.processor = processor
    this.batchSize = batchSize
    this.flushInterval = flushInterval
    this.startTimer()
  }

  add(item: T): void {
    this.batch.push(item)
    
    if (this.batch.length >= this.batchSize) {
      this.flush()
    }
  }

  async flush(): Promise<void> {
    if (this.batch.length === 0) return

    const items = [...this.batch]
    this.batch = []

    try {
      await this.processor(items)
    } catch (error) {
      console.error('Batch processing error:', error)
      // Optionally re-add failed items to batch
    }
  }

  private startTimer(): void {
    if (this.timer) {
      clearInterval(this.timer)
    }

    this.timer = setInterval(() => {
      this.flush()
    }, this.flushInterval)
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.flush() // Flush remaining items
  }
}
