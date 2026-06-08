import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { z } from 'zod'

// Force dynamic rendering to prevent build-time database connection
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const { email, password, name } = registerSchema.parse(body)

    // Attempt registration
    const { user, token } = await AuthService.register({ email, password, name })

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user,
      message: 'Registration successful'
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error: any) {
    console.error('Registration error:', error)

    return NextResponse.json({
      success: false,
      error: error.message || 'Registration failed'
    }, { status: 400 })
  }
}
