'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Shield, 
  Eye, 
  Brain,
  Cloud, 
  AlertTriangle,
  BarChart3,
  Database,
  Zap,
  Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Import all dashboard components
import { RealTimeMetrics } from './RealTimeMetrics'
import { PredictiveAlerts } from './PredictiveAlerts'
import { DataSourcesOverview } from './DataSourcesOverview'
import { RealTimeComparison } from './RealTimeComparison'
import { SecurityGuardian } from './SecurityGuardian'
import { AutoOptimizationEngine } from './AutoOptimizationEngine'
import { LiveInfrastructureOptimizer } from './LiveInfrastructureOptimizer'
import { CloudProviderOverview } from './CloudProviderOverview'

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Activity className="h-4 w-4" />,
      description: 'Real-time metrics and alerts'
    },
    {
      id: 'datasources',
      label: 'Data Sources',
      icon: <Database className="h-4 w-4" />,
      description: 'Real-time data comparison for judges'
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield className="h-4 w-4" />,
      description: 'Security monitoring and threats'
    },
    {
      id: 'auto-optimizer',
      label: 'Auto-Optimizer',
      icon: <Target className="h-4 w-4" />,
      description: 'ML-powered auto-optimization with instant cutoffs'
    },
    {
      id: 'ai-optimizer',
      label: 'AI Optimizer',
      icon: <Brain className="h-4 w-4" />,
      description: 'AI-powered infrastructure optimization'
    },
    {
      id: 'cloud',
      label: 'Multi-Cloud',
      icon: <Cloud className="h-4 w-4" />,
      description: 'Cloud provider overview'
    },
  ]

  return (
    <div className="w-full space-y-6">
      {/* Tab Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span>CloudGuard AI - Complete Dashboard</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Navigate through all available sections and components
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-muted">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center space-y-1 p-3 h-auto data-[state=active]:bg-background"
                >
                  {tab.icon}
                  <span className="text-xs font-medium">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Content */}
            <div className="mt-6">
              {/* Overview Tab - Real-time Metrics & Alerts */}
              <TabsContent value="overview" className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold">Real-Time Overview</h2>
                  <p className="text-sm text-muted-foreground">Live metrics and predictive alerts</p>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <RealTimeMetrics />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <PredictiveAlerts />
                  </motion.div>
                </div>
              </TabsContent>

              {/* Data Sources Tab */}
              <TabsContent value="datasources" className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold">Real-Time Data Sources</h2>
                  <p className="text-sm text-muted-foreground">Live data comparison and sources overview</p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <RealTimeComparison />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <DataSourcesOverview />
                </motion.div>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold">Security Guardian</h2>
                  <p className="text-sm text-muted-foreground">AI-powered security monitoring and threat detection</p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <SecurityGuardian />
                </motion.div>
              </TabsContent>

              {/* Auto-Optimization Engine Tab */}
              <TabsContent value="auto-optimizer" className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold">Auto-Optimization Engine</h2>
                  <p className="text-sm text-muted-foreground">ML-powered real-time optimization with Lambda functions and auto-cutoffs</p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <AutoOptimizationEngine />
                </motion.div>
              </TabsContent>

              {/* AI Infrastructure Optimizer Tab */}
              <TabsContent value="ai-optimizer" className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold">AI Infrastructure Optimizer</h2>
                  <p className="text-sm text-muted-foreground">AI-powered performance monitoring and cost optimization</p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <LiveInfrastructureOptimizer />
                </motion.div>
              </TabsContent>

              {/* Multi-Cloud Tab */}
              <TabsContent value="cloud" className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold">Multi-Cloud Management</h2>
                  <p className="text-sm text-muted-foreground">Unified cloud provider overview and management</p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <CloudProviderOverview />
                </motion.div>
              </TabsContent>


            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
