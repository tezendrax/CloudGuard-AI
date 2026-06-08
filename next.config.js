/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    // Server components
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
    // Optimize for production
    optimizeCss: true,
  },

  // Performance optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // Rewrites for API proxying
  async rewrites() {
    return [
      {
        source: '/ai-api/:path*',
        destination: `${process.env.AI_SERVICE_URL || 'http://localhost:8001'}/:path*`,
      },
    ]
  },

  // Environment variables to expose to the client
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.APP_NAME || 'CloudGuard AI',
    NEXT_PUBLIC_APP_VERSION: process.env.APP_VERSION || '1.0.0',
    NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add custom webpack configurations
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    // Optimize bundle size - removed preact aliases that cause React resolution issues

    return config
  },

  // TypeScript configuration
  typescript: {

    // Skip type checking during build (handled by CI/CD)
    ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === 'true',
  },

  // ESLint configuration
  eslint: {
    // Skip linting during build (handled by CI/CD)
    ignoreDuringBuilds: process.env.SKIP_LINT === 'true',
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // Compression
  compress: true,

  // Power by header
  poweredByHeader: false,

  // Trailing slash
  trailingSlash: false,

  // Generate build ID
  generateBuildId: async () => {
    return process.env.BUILD_ID || `build-${Date.now()}`
  },
}

module.exports = nextConfig