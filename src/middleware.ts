import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Security headers
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' ws: wss:;"
}

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
}

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT.windowMs

  // Clean up old entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }

  const current = rateLimitStore.get(ip) || { count: 0, resetTime: now + RATE_LIMIT.windowMs }
  
  if (current.resetTime < now) {
    current.count = 1
    current.resetTime = now + RATE_LIMIT.windowMs
  } else {
    current.count++
  }

  rateLimitStore.set(ip, current)
  return current.count <= RATE_LIMIT.max
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Get client IP
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'

  // Apply rate limiting
  if (!rateLimit(ip)) {
    return new NextResponse('Too Many Requests', { 
      status: 429,
      headers: {
        'Retry-After': '900', // 15 minutes
        ...securityHeaders
      }
    })
  }

  // API route protection
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Skip auth for public endpoints and demo endpoints
    const publicEndpoints = [
      '/api/health', 
      '/api/auth/login', 
      '/api/auth/register',
      // Demo endpoints for development
      '/api/metrics',
      '/api/cloud/resources',
      '/api/cloud/providers',
      '/api/cloud/migration',
      '/api/cloud/connect',
      '/api/digital-twins',
      '/api/monitoring',
      '/api/cost',
      '/api/performance',
      '/api/security',
      '/api/websocket',
      '/api/socket'
    ]
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      request.nextUrl.pathname.startsWith(endpoint)
    )

    if (!isPublicEndpoint) {
      const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                   request.cookies.get('auth-token')?.value

      if (!token) {
        return new NextResponse('Unauthorized', { 
          status: 401,
          headers: securityHeaders
        })
      }

      try {
        verify(token, process.env.JWT_SECRET || 'fallback-secret')
      } catch (error) {
        return new NextResponse('Invalid Token', { 
          status: 401,
          headers: securityHeaders
        })
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
