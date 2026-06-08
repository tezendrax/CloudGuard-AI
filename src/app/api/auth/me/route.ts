import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

// Force dynamic rendering to prevent build-time database connection
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'No token provided'
      }, { status: 401 })
    }

    const user = await AuthService.getCurrentUser(token)

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token'
      }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error: any) {
    console.error('Get current user error:', error)

    return NextResponse.json({
      success: false,
      error: 'Failed to get user info'
    }, { status: 500 })
  }
}
