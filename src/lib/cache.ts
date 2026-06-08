import Redis from 'redis'

interface CacheOptions {
  ttl?: number // Time to live in seconds
  prefix?: string
}

class CacheService {
  private redis: any
  private isConnected: boolean = false
  private fallbackCache: Map<string, { data: any; expires: number }> = new Map()

  constructor() {
    this.initializeRedis()
  }

  private async initializeRedis() {
    try {
      this.redis = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.warn('Redis server is not available, using fallback cache')
              return false
            }
            return Math.min(retries * 100, 3000)
          }
        }
      })

      this.redis.on('connect', () => {
        console.log('✅ Redis connected')
        this.isConnected = true
      })

      this.redis.on('error', (err: any) => {
        console.warn('⚠️ Redis error, using fallback cache:', err.message)
        this.isConnected = false
      })

      await this.redis.connect()
    } catch (error) {
      console.warn('⚠️ Redis initialization failed, using fallback cache:', error)
      this.isConnected = false
    }
  }

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const fullKey = this.getFullKey(key, options.prefix)

    if (this.isConnected && this.redis) {
      try {
        const result = await this.redis.get(fullKey)
        return result ? JSON.parse(result) : null
      } catch (error) {
        console.warn('Redis get error, using fallback:', error)
      }
    }

    // Fallback to in-memory cache
    const cached = this.fallbackCache.get(fullKey)
    if (cached && cached.expires > Date.now()) {
      return cached.data
    }

    if (cached) {
      this.fallbackCache.delete(fullKey)
    }

    return null
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const fullKey = this.getFullKey(key, options.prefix)
    const ttl = options.ttl || 300 // Default 5 minutes

    if (this.isConnected && this.redis) {
      try {
        await this.redis.setEx(fullKey, ttl, JSON.stringify(value))
        return
      } catch (error) {
        console.warn('Redis set error, using fallback:', error)
      }
    }

    // Fallback to in-memory cache
    this.fallbackCache.set(fullKey, {
      data: value,
      expires: Date.now() + (ttl * 1000)
    })
  }

  async del(key: string, options: CacheOptions = {}): Promise<void> {
    const fullKey = this.getFullKey(key, options.prefix)

    if (this.isConnected && this.redis) {
      try {
        await this.redis.del(fullKey)
        return
      } catch (error) {
        console.warn('Redis del error, using fallback:', error)
      }
    }

    // Fallback to in-memory cache
    this.fallbackCache.delete(fullKey)
  }

  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    const fullKey = this.getFullKey(key, options.prefix)

    if (this.isConnected && this.redis) {
      try {
        const result = await this.redis.exists(fullKey)
        return result === 1
      } catch (error) {
        console.warn('Redis exists error, using fallback:', error)
      }
    }

    // Fallback to in-memory cache
    const cached = this.fallbackCache.get(fullKey)
    return cached !== undefined && cached.expires > Date.now()
  }

  async flush(prefix?: string): Promise<void> {
    if (this.isConnected && this.redis) {
      try {
        if (prefix) {
          const keys = await this.redis.keys(`${prefix}:*`)
          if (keys.length > 0) {
            await this.redis.del(keys)
          }
        } else {
          await this.redis.flushAll()
        }
        return
      } catch (error) {
        console.warn('Redis flush error, using fallback:', error)
      }
    }

    // Fallback to in-memory cache
    if (prefix) {
      const prefixKey = `${prefix}:`
      for (const key of this.fallbackCache.keys()) {
        if (key.startsWith(prefixKey)) {
          this.fallbackCache.delete(key)
        }
      }
    } else {
      this.fallbackCache.clear()
    }
  }

  private getFullKey(key: string, prefix?: string): string {
    const basePrefix = 'cloudguard'
    return prefix ? `${basePrefix}:${prefix}:${key}` : `${basePrefix}:${key}`
  }

  // Cleanup expired entries from fallback cache
  private cleanupFallbackCache() {
    const now = Date.now()
    for (const [key, value] of this.fallbackCache.entries()) {
      if (value.expires <= now) {
        this.fallbackCache.delete(key)
      }
    }
  }

  // Start periodic cleanup
  startCleanup() {
    setInterval(() => {
      this.cleanupFallbackCache()
    }, 60000) // Clean every minute
  }
}

export const cache = new CacheService()

// Start cleanup on initialization
cache.startCleanup()

// Cache decorators and utilities
export function cached<T extends (...args: any[]) => Promise<any>>(
  ttl: number = 300,
  keyGenerator?: (...args: Parameters<T>) => string
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: Parameters<T>) {
      const cacheKey = keyGenerator 
        ? keyGenerator(...args)
        : `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`

      // Try to get from cache
      const cached = await cache.get(cacheKey)
      if (cached !== null) {
        return cached
      }

      // Execute method and cache result
      const result = await method.apply(this, args)
      await cache.set(cacheKey, result, { ttl })

      return result
    }
  }
}
