import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function formatDuration(seconds: number): string {
  const units = [
    { name: 'year', seconds: 31536000 },
    { name: 'month', seconds: 2592000 },
    { name: 'week', seconds: 604800 },
    { name: 'day', seconds: 86400 },
    { name: 'hour', seconds: 3600 },
    { name: 'minute', seconds: 60 },
    { name: 'second', seconds: 1 },
  ]

  for (const unit of units) {
    const count = Math.floor(seconds / unit.seconds)
    if (count >= 1) {
      return `${count} ${unit.name}${count !== 1 ? 's' : ''}`
    }
  }

  return '0 seconds'
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'RUNNING': 'text-green-500',
    'STOPPED': 'text-red-500',
    'PENDING': 'text-yellow-500',
    'TERMINATED': 'text-gray-500',
    'ERROR': 'text-red-500',
    'UNKNOWN': 'text-gray-400',
    'ACTIVE': 'text-green-500',
    'INACTIVE': 'text-red-500',
    'OPEN': 'text-red-500',
    'ACKNOWLEDGED': 'text-yellow-500',
    'RESOLVED': 'text-green-500',
    'SUPPRESSED': 'text-gray-500',
  }
  
  return statusColors[status.toUpperCase()] || 'text-gray-400'
}

export function getAlertSeverityColor(severity: string): string {
  const severityColors: Record<string, string> = {
    'LOW': 'text-blue-500 bg-blue-500/10',
    'MEDIUM': 'text-yellow-500 bg-yellow-500/10',
    'HIGH': 'text-orange-500 bg-orange-500/10',
    'CRITICAL': 'text-red-500 bg-red-500/10',
  }
  
  return severityColors[severity.toUpperCase()] || 'text-gray-400 bg-gray-400/10'
}

export function getCloudProviderColor(provider: string): string {
  const providerColors: Record<string, string> = {
    'AWS': 'text-orange-500 bg-orange-500/10',
    'AZURE': 'text-blue-500 bg-blue-500/10',
    'GCP': 'text-green-500 bg-green-500/10',
    'MULTI_CLOUD': 'text-purple-500 bg-purple-500/10',
  }
  
  return providerColors[provider.toUpperCase()] || 'text-gray-400 bg-gray-400/10'
}

export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 9)
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

export function generateGradient(color1: string, color2: string): string {
  return `linear-gradient(135deg, ${color1}, ${color2})`
}

export function hexToRgba(hex: string, alpha: number = 1): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return hex
  
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
