'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string
  icon: React.ReactNode
  trend?: string
  type: 'success' | 'warning' | 'error' | 'info'
  className?: string
  onClick?: () => void
  description?: string
}

export function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  type,
  className,
  description
}: MetricCardProps) {
  const isPositiveTrend = trend?.startsWith('+')
  const isNegativeTrend = trend?.startsWith('-')

  const typeStyles = {
    success: 'border-green-500/20 bg-green-500/5',
    warning: 'border-yellow-500/20 bg-yellow-500/5',
    error: 'border-red-500/20 bg-red-500/5',
    info: 'border-blue-500/20 bg-blue-500/5',
  }

  const iconStyles = {
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    info: 'text-blue-500',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        'relative overflow-hidden transition-all duration-300 hover:shadow-lg',
        typeStyles[type],
        className
      )}>
        <CardContent className="p-3 sm:p-4">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
            <div className="w-full h-full transform rotate-12 scale-150">
              {icon}
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className={cn('p-2 rounded-lg', `bg-${type === 'success' ? 'green' : type === 'warning' ? 'yellow' : type === 'error' ? 'red' : 'blue'}-500/10`)}>
                <div className={iconStyles[type]}>
                  {icon}
                </div>
              </div>
              {trend && (
                <div className={cn(
                  'flex items-center text-xs font-medium px-2 py-1 rounded-full',
                  isPositiveTrend ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20' :
                  isNegativeTrend ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20' :
                  'text-black/70 bg-black/10 dark:text-white/70 dark:bg-white/10'
                )}>
                  {isPositiveTrend ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : isNegativeTrend ? (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  ) : null}
                  {trend}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xl sm:text-2xl font-bold tracking-tight">{value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
              {description && (
                <p className="text-xs text-muted-foreground/70 mt-1 hidden sm:block">{description}</p>
              )}
            </div>
          </div>

          {/* Animated Border */}
          <div className={cn(
            'absolute top-0 left-0 w-full h-1 opacity-50',
            type === 'success' && 'bg-green-500',
            type === 'warning' && 'bg-yellow-500',
            type === 'error' && 'bg-red-500',
            type === 'info' && 'bg-blue-500'
          )}>
            <motion.div
              className="h-full bg-white/30"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
