import { sign, verify, type SignOptions } from 'jsonwebtoken'
import { hash, compare } from 'bcryptjs'
import { prisma } from './db'
import type { User } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only'
const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '7d'

export interface AuthUser {
  id: string
  email: string
  name?: string
  role: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name?: string
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return await hash(password, 12)
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await compare(password, hashedPassword)
  }

  static generateToken(user: AuthUser): string {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
    
    const options: SignOptions = {
      expiresIn: '7d'
    }
    
    return sign(payload, JWT_SECRET, options)
  }

  static verifyToken(token: string): AuthUser | null {
    try {
      const decoded = verify(token, JWT_SECRET) as any
      return {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      }
    } catch (error) {
      return null
    }
  }

  static async register(credentials: RegisterCredentials): Promise<{ user: AuthUser; token: string }> {
    // Check if user already exists
    // Mock implementation - replace with real database logic
    // const existingUser = await prisma.user.findUnique({
    //   where: { email: credentials.email }
    // })

    // Hash password
    const hashedPassword = await this.hashPassword(credentials.password)

    // Mock user creation
    const user = {
      id: 'mock-user-' + Date.now(),
      email: credentials.email,
      name: credentials.name,
      password: hashedPassword,
      role: 'USER'
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }

    const token = this.generateToken(authUser)

    return { user: authUser, token }
  }

  static async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    const isValidPassword = await this.comparePassword(credentials.password, user.password)

    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }

    const token = this.generateToken(authUser)

    return { user: authUser, token }
  }

  static async getCurrentUser(token: string): Promise<AuthUser | null> {
    const decoded = this.verifyToken(token)
    if (!decoded) return null

    // Optionally fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  }

  static async refreshToken(oldToken: string): Promise<string | null> {
    const user = this.verifyToken(oldToken)
    if (!user) return null

    return this.generateToken(user)
  }
}
