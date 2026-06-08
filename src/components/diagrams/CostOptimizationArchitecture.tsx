'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  Database, 
  Cpu, 
  Network, 
  Cloud, 
  Zap, 
  TrendingDown, 
  BarChart3,
  Layers,
  GitBranch,
  Target,
  Shield
} from 'lucide-react'

export function CostOptimizationArchitecture() {
  const [activeLayer, setActiveLayer] = useState<string>('ml')

  const architectureLayers = {
    ml: {
      title: 'AI/ML Layer',
      color: 'from-purple-500 to-pink-500',
      components: [
        { name: 'TensorFlow Models', icon: Brain, description: 'Cost prediction, anomaly detection' },
        { name: 'Feature Engineering', icon: GitBranch, description: 'Temporal, lag, rolling features' },
        { name: 'Model Training', icon: Target, description: 'Continuous learning pipeline' },
        { name: 'Inference Engine', icon: Zap, description: 'Real-time predictions' }
      ]
    },
    data: {
      title: 'Data Layer',
      color: 'from-blue-500 to-cyan-500',
      components: [
        { name: 'InfluxDB', icon: Database, description: 'Time-series metrics storage' },
        { name: 'PostgreSQL', icon: Database, description: 'Structured data & recommendations' },
        { name: 'Redis Cache', icon: Zap, description: 'Sub-millisecond data access' },
        { name: 'Data Pipeline', icon: Network, description: 'ETL & preprocessing' }
      ]
    },
    compute: {
      title: 'Compute Layer',
      color: 'from-green-500 to-emerald-500',
      components: [
        { name: 'Kubernetes', icon: Layers, description: 'Container orchestration' },
        { name: 'Auto-scaling', icon: TrendingDown, description: 'HPA & VPA optimization' },
        { name: 'Load Balancing', icon: Network, description: 'Traffic distribution' },
        { name: 'Service Mesh', icon: Shield, description: 'Security & observability' }
      ]
    },
    cloud: {
      title: 'Multi-Cloud Layer',
      color: 'from-orange-500 to-red-500',
      components: [
        { name: 'AWS Adapters', icon: Cloud, description: 'EC2, S3, RDS optimization' },
        { name: 'Azure Adapters', icon: Cloud, description: 'VM, Storage optimization' },
        { name: 'GCP Adapters', icon: Cloud, description: 'Compute Engine optimization' },
        { name: 'Cost APIs', icon: BarChart3, description: 'Billing & usage analytics' }
      ]
    }
  }

  const optimizationAlgorithms = [
    {
      name: 'Right-sizing Algorithm',
      formula: 'C(t) = α×U_cpu + β×U_memory + γ×U_storage + ε',
      description: 'Neural network model for optimal instance sizing',
      accuracy: '94%',
      savings: '40%'
    },
    {
      name: 'Reserved Instance Optimizer',
      formula: 'DP[i][j] = min(OnDemand[i], Reserved[i])',
      description: 'Dynamic programming for RI allocation',
      accuracy: '96%',
      savings: '30%'
    },
    {
      name: 'Spot Instance Predictor',
      formula: 'Maximize: Σ(Savings[i] × Reliability[i])',
      description: 'Stochastic optimization for spot allocation',
      accuracy: '88%',
      savings: '70%'
    },
    {
      name: 'Anomaly Detector',
      formula: 'Score = ||Input - Reconstruction||²',
      description: 'Autoencoder for cost anomaly detection',
      accuracy: '92%',
      savings: '15%'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cpu className="w-5 h-5" />
            <span>Cost Optimization Technical Architecture</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Layer Selection */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(architectureLayers).map(([key, layer]) => (
              <Button
                key={key}
                variant={activeLayer === key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveLayer(key)}
                className="transition-all duration-200"
              >
                {layer.title}
              </Button>
            ))}
          </div>

          {/* Active Layer Visualization */}
          <motion.div
            key={activeLayer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-6 rounded-lg bg-gradient-to-br ${architectureLayers[activeLayer].color} bg-opacity-10 border`}
          >
            <h3 className="text-lg font-semibold mb-4 text-center">
              {architectureLayers[activeLayer].title}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {architectureLayers[activeLayer].components.map((component, index) => (
                <motion.div
                  key={component.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-background/80 p-4 rounded-lg border"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <component.icon className="w-5 h-5 text-primary" />
                    <h4 className="font-medium">{component.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{component.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Data Flow Visualization */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-center">Data Flow Pipeline</h3>
            <div className="flex items-center justify-center space-x-4 overflow-x-auto pb-4">
              {[
                { name: 'Cloud APIs', icon: Cloud, time: '30s' },
                { name: 'Data Ingestion', icon: Network, time: '5s' },
                { name: 'Feature Engineering', icon: GitBranch, time: '10s' },
                { name: 'ML Inference', icon: Brain, time: '200ms' },
                { name: 'Optimization', icon: Target, time: '50ms' },
                { name: 'Action', icon: Zap, time: '1s' }
              ].map((step, index) => (
                <div key={step.name} className="flex items-center space-x-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.2 }}
                    className="flex flex-col items-center space-y-2 min-w-[80px]"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-xs text-center">
                      <div className="font-medium">{step.name}</div>
                      <div className="text-muted-foreground">{step.time}</div>
                    </div>
                  </motion.div>
                  {index < 5 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '2rem' }}
                      transition={{ delay: index * 0.2 + 0.1 }}
                      className="h-0.5 bg-primary/30"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Algorithms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>AI Optimization Algorithms</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optimizationAlgorithms.map((algorithm, index) => (
              <motion.div
                key={algorithm.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border bg-card/50"
              >
                <h4 className="font-semibold mb-2">{algorithm.name}</h4>
                <div className="space-y-2">
                  <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                    {algorithm.formula}
                  </div>
                  <p className="text-sm text-muted-foreground">{algorithm.description}</p>
                  <div className="flex justify-between text-xs">
                    <span>Accuracy: <span className="font-bold text-green-500">{algorithm.accuracy}</span></span>
                    <span>Savings: <span className="font-bold text-blue-500">{algorithm.savings}</span></span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Layers className="w-5 h-5" />
            <span>Technology Stack</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Frontend Stack */}
            <div className="space-y-3">
              <h4 className="font-semibold text-center text-blue-500">Frontend</h4>
              <div className="space-y-2">
                {[
                  'Next.js 14',
                  'TypeScript',
                  'TailwindCSS',
                  'Framer Motion',
                  'React Query',
                  'WebSocket Client'
                ].map((tech) => (
                  <div key={tech} className="p-2 bg-blue-500/10 rounded text-center text-sm">
                    {tech}
                  </div>
                ))}
              </div>
            </div>

            {/* Backend Stack */}
            <div className="space-y-3">
              <h4 className="font-semibold text-center text-green-500">Backend</h4>
              <div className="space-y-2">
                {[
                  'FastAPI (Python)',
                  'TensorFlow 2.x',
                  'NumPy/Pandas',
                  'scikit-learn',
                  'Prisma ORM',
                  'WebSocket Server'
                ].map((tech) => (
                  <div key={tech} className="p-2 bg-green-500/10 rounded text-center text-sm">
                    {tech}
                  </div>
                ))}
              </div>
            </div>

            {/* Infrastructure Stack */}
            <div className="space-y-3">
              <h4 className="font-semibold text-center text-purple-500">Infrastructure</h4>
              <div className="space-y-2">
                {[
                  'Kubernetes',
                  'Docker',
                  'PostgreSQL',
                  'InfluxDB',
                  'Redis',
                  'Prometheus'
                ].map((tech) => (
                  <div key={tech} className="p-2 bg-purple-500/10 rounded text-center text-sm">
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Performance Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { metric: 'Prediction Accuracy', value: '92%', color: 'text-green-500' },
              { metric: 'Response Time', value: '<200ms', color: 'text-blue-500' },
              { metric: 'Cost Savings', value: '25-45%', color: 'text-purple-500' },
              { metric: 'Uptime', value: '99.9%', color: 'text-orange-500' }
            ].map((item) => (
              <div key={item.metric} className="text-center p-4 bg-muted/50 rounded-lg">
                <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.metric}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
