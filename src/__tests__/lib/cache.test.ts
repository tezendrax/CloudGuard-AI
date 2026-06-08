import { cache } from '@/lib/cache'

// Mock Redis
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    keys: jest.fn(),
    flushAll: jest.fn(),
    on: jest.fn(),
  })),
}))

describe('CacheService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('get and set', () => {
    it('should store and retrieve values', async () => {
      const testKey = 'test-key'
      const testValue = { message: 'Hello World' }

      await cache.set(testKey, testValue)
      const result = await cache.get(testKey)

      expect(result).toEqual(testValue)
    })

    it('should return null for non-existent keys', async () => {
      const result = await cache.get('non-existent-key')
      expect(result).toBeNull()
    })

    it('should handle TTL correctly', async () => {
      const testKey = 'ttl-test'
      const testValue = 'test-value'

      await cache.set(testKey, testValue, { ttl: 1 })
      
      // Should exist immediately
      let result = await cache.get(testKey)
      expect(result).toBe(testValue)

      // Wait for expiration (using fallback cache)
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      result = await cache.get(testKey)
      expect(result).toBeNull()
    })
  })

  describe('exists and delete', () => {
    it('should check existence correctly', async () => {
      const testKey = 'exists-test'
      
      let exists = await cache.exists(testKey)
      expect(exists).toBe(false)

      await cache.set(testKey, 'value')
      
      exists = await cache.exists(testKey)
      expect(exists).toBe(true)
    })

    it('should delete values correctly', async () => {
      const testKey = 'delete-test'
      
      await cache.set(testKey, 'value')
      await cache.del(testKey)
      
      const result = await cache.get(testKey)
      expect(result).toBeNull()
    })
  })

  describe('flush', () => {
    it('should clear all cache', async () => {
      await cache.set('key1', 'value1')
      await cache.set('key2', 'value2')
      
      await cache.flush()
      
      const result1 = await cache.get('key1')
      const result2 = await cache.get('key2')
      
      expect(result1).toBeNull()
      expect(result2).toBeNull()
    })

    it('should clear cache by prefix', async () => {
      await cache.set('prefix1', 'value1', { prefix: 'test' })
      await cache.set('prefix2', 'value2', { prefix: 'test' })
      await cache.set('other', 'value3', { prefix: 'other' })
      
      await cache.flush('test')
      
      const result1 = await cache.get('prefix1', { prefix: 'test' })
      const result2 = await cache.get('prefix2', { prefix: 'test' })
      const result3 = await cache.get('other', { prefix: 'other' })
      
      expect(result1).toBeNull()
      expect(result2).toBeNull()
      expect(result3).toBe('value3')
    })
  })
})
