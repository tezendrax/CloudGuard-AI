import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'CloudGuard AI - Revolutionary Digital Twin Cloud Management',
  description: 'The world\'s first Digital Twin ecosystem for multi-cloud management, featuring AI-powered predictive analytics, autonomous policy evolution, and cross-cloud intelligence.',
  keywords: ['cloud management', 'digital twin', 'AI', 'multi-cloud', 'predictive analytics', 'automation'],
  authors: [{ name: 'CloudGuard AI Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'CloudGuard AI - Revolutionary Digital Twin Cloud Management',
    description: 'AI-powered multi-cloud management with Digital Twin technology',
    type: 'website',
    url: 'https://cloudguard-ai.com',
    siteName: 'CloudGuard AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CloudGuard AI',
    description: 'Revolutionary Digital Twin Cloud Management',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          <div className="relative min-h-screen bg-background">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/20 pointer-events-none" />
            <div className="fixed inset-0 bg-cloud-mesh opacity-5 pointer-events-none" />
            
            {/* Main Content */}
            <main className="relative z-10">
              {children}
            </main>
            
            {/* Toast Notifications */}
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  )
}
