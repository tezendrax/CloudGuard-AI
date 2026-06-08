'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, 
  Activity, 
  Zap, 
  Brain, 
  Server, 
  Database, 
  Cloud,
  Cpu,
  HardDrive,
  Network,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface DigitalTwinNode {
  id: string
  name: string
  type: 'compute' | 'database' | 'storage' | 'network'
  status: 'active' | 'inactive' | 'syncing' | 'predicting'
  accuracy: number
  predictions: number
  position: { x: number; y: number }
  connections: string[]
}

export function DigitalTwinVisualization() {
  const [twins, setTwins] = useState<DigitalTwinNode[]>([
    {
      id: 'twin-1',
      name: 'Web Server Cluster',
      type: 'compute',
      status: 'active',
      accuracy: 94.2,
      predictions: 12,
      position: { x: 100, y: 150 },
      connections: ['twin-2', 'twin-4']
    },
    {
      id: 'twin-2',
      name: 'Production Database',
      type: 'database',
      status: 'predicting',
      accuracy: 91.8,
      predictions: 8,
      position: { x: 300, y: 100 },
      connections: ['twin-1', 'twin-3']
    },
    {
      id: 'twin-3',
      name: 'Storage Array',
      type: 'storage',
      status: 'active',
      accuracy: 96.5,
      predictions: 5,
      position: { x: 500, y: 150 },
      connections: ['twin-2', 'twin-4']
    },
    {
      id: 'twin-4',
      name: 'Load Balancer',
      type: 'network',
      status: 'syncing',
      accuracy: 89.3,
      predictions: 15,
      position: { x: 300, y: 250 },
      connections: ['twin-1', 'twin-3']
    }
  ])

  const [isPlaying, setIsPlaying] = useState(true)
  const [isResetting, setIsResetting] = useState(false)
  const [selectedTwin, setSelectedTwin] = useState<string | null>(null)

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setTwins(prev => prev.map(twin => ({
        ...twin,
        status: Math.random() > 0.7 ? 
          (['active', 'predicting', 'syncing'][Math.floor(Math.random() * 3)] as any) : 
          twin.status,
        accuracy: Math.max(85, Math.min(99, twin.accuracy + (Math.random() - 0.5) * 2)),
        predictions: Math.max(0, twin.predictions + Math.floor((Math.random() - 0.5) * 3))
      })))
    }, 2000)

    return () => clearInterval(interval)
  }, [isPlaying])

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'compute': return <Server className="w-6 h-6" />
      case 'database': return <Database className="w-6 h-6" />
      case 'storage': return <HardDrive className="w-6 h-6" />
      case 'network': return <Network className="w-6 h-6" />
      default: return <Cpu className="w-6 h-6" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 border-green-500'
      case 'predicting': return 'text-blue-500 border-blue-500'
      case 'syncing': return 'text-yellow-500 border-yellow-500'
      case 'inactive': return 'text-gray-500 border-gray-500'
      default: return 'text-gray-500 border-gray-500'
    }
  }

  const getStatusAnimation = (status: string) => {
    switch (status) {
      case 'active': return 'animate-pulse'
      case 'predicting': return 'animate-bounce'
      case 'syncing': return 'animate-spin'
      default: return ''
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-digital-twin" />
            <CardTitle>Digital Twin Ecosystem</CardTitle>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Brain className="w-4 h-4" />
              <span>Real-time Synchronization</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={isPlaying ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsPlaying(!isPlaying)
                toast.success(isPlaying ? 'Digital Twin synchronization paused' : 'Digital Twin synchronization resumed')
              }}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isResetting}
              onClick={async () => {
                setIsResetting(true)
                toast.info('Resetting Digital Twin ecosystem...')
                
                // Reset simulation with animation
                setTwins(prev => prev.map(twin => ({
                  ...twin,
                  status: 'syncing' as const,
                  accuracy: 0,
                  predictions: 0
                })))

                // Simulate reset process
                setTimeout(() => {
                  setTwins(prev => prev.map(twin => ({
                    ...twin,
                    status: 'active' as const,
                    accuracy: 85 + Math.random() * 15,
                    predictions: Math.floor(Math.random() * 20) + 5
                  })))
                  setIsResetting(false)
                  toast.success('Digital Twin ecosystem reset successfully!')
                }, 2000)
              }}
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              {isResetting ? 'Resetting...' : 'Reset'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-96 bg-gradient-to-br from-background to-muted/20 rounded-lg border overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Connections */}
          <svg className="absolute inset-0 w-full h-full">
            {twins.map(twin => 
              twin.connections.map(connectionId => {
                const connectedTwin = twins.find(t => t.id === connectionId)
                if (!connectedTwin) return null
                
                return (
                  <motion.line
                    key={`${twin.id}-${connectionId}`}
                    x1={twin.position.x + 40}
                    y1={twin.position.y + 40}
                    x2={connectedTwin.position.x + 40}
                    y2={connectedTwin.position.y + 40}
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted-foreground/30"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: Math.random() * 0.5 }}
                  />
                )
              })
            )}
          </svg>

          {/* Digital Twin Nodes */}
          <AnimatePresence>
            {twins.map((twin, index) => (
              <motion.div
                key={twin.id}
                className={`absolute cursor-pointer ${selectedTwin === twin.id ? 'z-10' : 'z-0'}`}
                style={{ 
                  left: twin.position.x, 
                  top: twin.position.y 
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedTwin(selectedTwin === twin.id ? null : twin.id)
                  toast.info(`${selectedTwin === twin.id ? 'Deselected' : 'Selected'} ${twin.name} - Accuracy: ${twin.accuracy.toFixed(1)}%`)
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Node Circle */}
                <div className={`
                  relative w-20 h-20 rounded-full border-2 bg-background/90 backdrop-blur-sm
                  flex items-center justify-center transition-all duration-300
                  ${getStatusColor(twin.status)}
                  ${selectedTwin === twin.id ? 'ring-2 ring-digital-twin' : ''}
                `}>
                  <div className={getStatusAnimation(twin.status)}>
                    {getNodeIcon(twin.type)}
                  </div>
                  
                  {/* Status Indicator */}
                  <div className={`
                    absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background
                    ${twin.status === 'active' ? 'bg-green-500' : 
                      twin.status === 'predicting' ? 'bg-blue-500' :
                      twin.status === 'syncing' ? 'bg-yellow-500' : 'bg-gray-500'}
                  `} />

                  {/* Accuracy Badge */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 
                                bg-background border rounded px-1 text-xs font-mono">
                    {twin.accuracy.toFixed(1)}%
                  </div>
                </div>

                {/* Node Label */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 
                              text-center text-xs font-medium whitespace-nowrap">
                  {twin.name}
                </div>

                {/* Predictions Count */}
                <motion.div
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 
                           bg-digital-twin text-white text-xs px-2 py-1 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {twin.predictions} predictions
                </motion.div>

                {/* Detailed Info Panel */}
                <AnimatePresence>
                  {selectedTwin === twin.id && (
                    <motion.div
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-8 
                               bg-background border rounded-lg p-4 shadow-lg z-10 w-64"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <h4 className="font-semibold mb-2">{twin.name}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="capitalize">{twin.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className={`capitalize ${getStatusColor(twin.status)}`}>
                            {twin.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Accuracy:</span>
                          <span className="font-mono">{twin.accuracy.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Predictions:</span>
                          <span className="font-mono">{twin.predictions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Connections:</span>
                          <span className="font-mono">{twin.connections.length}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Data Flow Animation */}
          {isPlaying && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-digital-twin rounded-full opacity-60"
                  animate={{
                    x: [0, 600, 0],
                    y: [100, 200, 100],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.8,
                    ease: "linear"
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Predicting</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Syncing</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Inactive</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
