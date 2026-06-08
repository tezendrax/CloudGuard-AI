// Database connection and Prisma client setup
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }

  return client
}

// Use a getter to lazily initialize Prisma Client
// This prevents connection attempts during module evaluation (build time)
let _prisma: PrismaClient | undefined

// Create a mock Prisma client for build time that satisfies TypeScript
function createMockPrismaClient(): any {
  return new Proxy({}, {
    get() {
      // Return a mock delegate that has the same methods as Prisma models
      return new Proxy({}, {
        get() {
          // Return async functions that throw if called during build
          return async () => {
            throw new Error('Prisma Client not initialized. This should not be called during build.')
          }
        }
      })
    }
  })
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    // Only initialize if we have a DATABASE_URL (not during build)
    if (!_prisma) {
      if (process.env.DATABASE_URL) {
        _prisma = createPrismaClient()
      } else {
        // During build, return a mock that satisfies TypeScript
        return createMockPrismaClient()[prop] || createMockPrismaClient()
      }
    }
    
    return (_prisma as any)[prop]
  },
}) as PrismaClient
