import { jest } from '@jest/globals'
import { AuthService } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Mock bcryptjs first
const mockBcrypt = {
  hash: jest.fn(),
  compare: jest.fn(),
}

jest.mock('bcryptjs', () => mockBcrypt)

// Mock Prisma with proper types
const mockPrismaUser = {
  findUnique: jest.fn() as jest.MockedFunction<any>,
  create: jest.fn() as jest.MockedFunction<any>,
}

jest.mock('@/lib/db', () => ({
  prisma: {
    user: mockPrismaUser,
  },
}))

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Setup default mock return values
    mockBcrypt.hash.mockResolvedValue('hashed-password' as never)
    mockBcrypt.compare.mockResolvedValue(true as never)
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
        role: 'USER' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaUser.findUnique.mockResolvedValue(null)
      mockPrismaUser.create.mockResolvedValue(mockUser)

      const result = await AuthService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      })

      expect(result.user.email).toBe('test@example.com')
      expect(result.user.name).toBe('Test User')
      expect(result.token).toBeDefined()
    })

    it('should throw error if user already exists', async () => {
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Existing User',
        password: 'hashed-password',
        role: 'USER' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaUser.findUnique.mockResolvedValue(existingUser)

      await expect(
        AuthService.register({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('User already exists with this email')
    })
  })

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
        role: 'USER' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaUser.findUnique.mockResolvedValue(mockUser)

      const result = await AuthService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.user.email).toBe('test@example.com')
      expect(result.token).toBeDefined()
    })

    it('should throw error for invalid credentials', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null)

      await expect(
        AuthService.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials')
    })
  })

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER' as any,
      }

      const token = AuthService.generateToken(user)
      const verified = AuthService.verifyToken(token)

      expect(verified).toEqual(user)
    })

    it('should return null for invalid token', () => {
      const verified = AuthService.verifyToken('invalid-token')
      expect(verified).toBeNull()
    })
  })
})
