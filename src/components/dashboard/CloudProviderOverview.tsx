'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Cloud, 
  Server, 
  Database, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  Zap, 
  RefreshCw, 
  BarChart3, 
  ArrowUpDown,
  Shield,
  Activity,
  Loader2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMultiCloudOverview } from '@/hooks/useMultiCloudOverview'
import { toast } from '@/hooks/use-toast'

export function CloudProviderOverview() {
  const {
    providers,
    analytics,
    resources,
    selectedProvider,
    selectedProviderData,
    isLoading,
    error,
    setSelectedProvider,
    executeResourceAction,
    syncProvider,
    simulateMigration,
    isExecutingAction,
    isSyncing,
    costComparison,
    performanceComparison,
    unifiedRecommendations,
  } = useMultiCloudOverview()

  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'analytics' | 'migration'>('overview')
  const [migrationSource, setMigrationSource] = useState<string>('')
  const [migrationTarget, setMigrationTarget] = useState<string>('')
  const [migrationResult, setMigrationResult] = useState<any>(null)
  const [isMigrationLoading, setIsMigrationLoading] = useState(false)

  const handleSync = (providerId: string) => {
    syncProvider(providerId)
  }

  const handleResourceAction = (resourceId: string, action: string) => {
    executeResourceAction({ action, resourceId })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'connecting': return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  if (isLoading && providers.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Loading multi-cloud overview...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-cloud-blue" />
            <CardTitle>Multi-Cloud Overview</CardTitle>
          </div>
          <div className="flex items-center space-x-4">
            {analytics && (
              <div className="text-sm text-muted-foreground">
                {analytics.totalResources} resources • ${analytics.totalCost.toFixed(0)} total cost
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSync('all')}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Sync All
            </Button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4">
          {[
            { id: 'overview', label: 'Overview', icon: Cloud },
            { id: 'resources', label: 'Resources', icon: Server },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'migration', label: 'Migration', icon: ArrowUpDown },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center space-x-1"
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Provider Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              {providers.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedProvider === provider.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <Card className={`h-full ${
                    provider.color === 'orange' ? 'border-orange-500/20 bg-orange-500/5' :
                    provider.color === 'blue' ? 'border-blue-500/20 bg-blue-500/5' :
                    'border-green-500/20 bg-green-500/5'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{provider.logo}</div>
                          <div>
                            <h3 className="font-semibold text-sm">{provider.name}</h3>
                            <p className="text-xs text-muted-foreground">{provider.region}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(provider.status)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSync(provider.id)
                            }}
                            disabled={isSyncing}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <Server className="w-3 h-3" />
                            <span>Resources</span>
                          </div>
                          <span className="font-mono font-semibold">{provider.resources.total}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3" />
                            <span>Monthly Cost</span>
                          </div>
                          <span className="font-mono font-semibold">${provider.cost.current.toFixed(0)}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Active Alerts</span>
                          </div>
                          <span className={`font-mono font-semibold ${
                            provider.alerts.total === 0 ? 'text-green-500' :
                            provider.alerts.total <= 2 ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {provider.alerts.total}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <Activity className="w-3 h-3" />
                            <span>Uptime</span>
                          </div>
                          <span className="font-mono font-semibold text-green-500">
                            {provider.performance.uptime.toFixed(2)}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span>Growth</span>
                          </div>
                          <span className="font-mono font-semibold text-green-500">
                            {provider.growth}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Detailed View */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <span>{selectedProviderData?.logo}</span>
                    <span>{selectedProviderData?.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedProviderData && (
                    <div className="space-y-4">
                      {/* Resource Breakdown */}
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Resource Distribution</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Compute</span>
                            <span className="font-mono">{selectedProviderData.resources.compute}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Storage</span>
                            <span className="font-mono">{selectedProviderData.resources.storage}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Database</span>
                            <span className="font-mono">{selectedProviderData.resources.database}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Network</span>
                            <span className="font-mono">{selectedProviderData.resources.network}</span>
                          </div>
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Cost Analysis</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Compute</span>
                            <span className="font-mono">${selectedProviderData.cost.breakdown.compute.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Storage</span>
                            <span className="font-mono">${selectedProviderData.cost.breakdown.storage.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Database</span>
                            <span className="font-mono">${selectedProviderData.cost.breakdown.database.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Network</span>
                            <span className="font-mono">${selectedProviderData.cost.breakdown.network.toFixed(0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Performance</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Response Time</span>
                            <span className="font-mono">{selectedProviderData.performance.responseTime.toFixed(0)}ms</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Availability</span>
                            <span className="font-mono">{selectedProviderData.performance.availability.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Incidents</span>
                            <span className="font-mono">{selectedProviderData.performance.incidents}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-4 border-t space-y-2">
                        <Button variant="outline" size="sm" className="w-full">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Detailed Analytics
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          <Shield className="w-4 h-4 mr-2" />
                          Security Report
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Cloud Resources</h3>
              <div className="text-sm text-muted-foreground">
                {resources.length} resources found
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.slice(0, 6).map((resource) => (
                <Card key={resource.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{resource.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      resource.status === 'RUNNING' ? 'bg-green-100 text-green-700' :
                      resource.status === 'STOPPED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {resource.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{resource.provider} • {resource.region}</p>
                    <p>{resource.type} • ${resource.cost}/month</p>
                  </div>
                  <div className="flex space-x-1 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleResourceAction(resource.id, 'start')}
                      disabled={isExecutingAction || resource.status === 'RUNNING'}
                    >
                      Start
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleResourceAction(resource.id, 'stop')}
                      disabled={isExecutingAction || resource.status === 'STOPPED'}
                    >
                      Stop
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Cost Comparison */}
            {costComparison && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Cost Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {costComparison.map((item, index) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{item.provider}</h4>
                        <span className={`text-sm ${index === 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                          {index === 0 ? '🏆 Most Efficient' : `#${index + 1}`}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>Total Cost: <span className="font-mono">${item.totalCost.toFixed(0)}</span></p>
                        <p>Cost/Resource: <span className="font-mono">${item.costPerResource.toFixed(0)}</span></p>
                        <p>Efficiency: <span className="font-mono">{item.efficiency.toFixed(2)}</span></p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Comparison */}
            {performanceComparison && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Performance Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {performanceComparison.map((item, index) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{item.provider}</h4>
                        <span className={`text-sm ${index === 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                          {index === 0 ? '🏆 Best Performance' : `#${index + 1}`}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>Uptime: <span className="font-mono">{item.uptime.toFixed(2)}%</span></p>
                        <p>Response Time: <span className="font-mono">{item.responseTime.toFixed(0)}ms</span></p>
                        <p>Availability: <span className="font-mono">{item.availability.toFixed(2)}%</span></p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
              <div className="space-y-3">
                {unifiedRecommendations.slice(0, 3).map((rec, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        rec.priority === 'critical' ? 'bg-red-500' :
                        rec.priority === 'high' ? 'bg-orange-500' :
                        rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                        <p className="text-sm text-green-600 mt-2">{rec.impact}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        rec.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        rec.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Migration Tab */}
        {activeTab === 'migration' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Cross-Cloud Migration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Simulate and plan migrations between cloud providers
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Source Provider</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={migrationSource}
                    onChange={(e) => setMigrationSource(e.target.value)}
                  >
                    <option value="">Select source...</option>
                    {providers.map(p => (
                      <option key={p.id} value={p.id.toUpperCase()}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Target Provider</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={migrationTarget}
                    onChange={(e) => setMigrationTarget(e.target.value)}
                  >
                    <option value="">Select target...</option>
                    {providers.filter(p => p.id.toUpperCase() !== migrationSource).map(p => (
                      <option key={p.id} value={p.id.toUpperCase()}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  className="flex-1"
                  disabled={!migrationSource || !migrationTarget || isMigrationLoading}
                  onClick={async () => {
                    if (migrationSource && migrationTarget) {
                      setIsMigrationLoading(true)
                      setMigrationResult(null)
                      try {
                        const result = await simulateMigration(migrationSource, migrationTarget, ['resource-1', 'resource-2'])
                        setMigrationResult(result)
                        toast({
                          title: 'Migration Simulation Complete',
                          description: `Successfully simulated migration from ${migrationSource} to ${migrationTarget}`,
                        })
                      } catch (error) {
                        console.error('Migration simulation failed:', error)
                        setMigrationResult({ error: 'Failed to simulate migration. Please try again.' })
                        toast({
                          title: 'Migration Simulation Failed',
                          description: 'Unable to simulate the migration. Please check your connection and try again.',
                          variant: 'destructive',
                        })
                      } finally {
                        setIsMigrationLoading(false)
                      }
                    }
                  }}
                >
                  {isMigrationLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                  )}
                  {isMigrationLoading ? 'Simulating...' : 'Simulate Migration'}
                </Button>
                
                {migrationResult && (
                  <Button 
                    variant="outline"
                    onClick={() => setMigrationResult(null)}
                    disabled={isMigrationLoading}
                  >
                    Clear Results
                  </Button>
                )}
              </div>
            </div>

            {/* Migration Results */}
            {migrationResult && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Migration Simulation Results</h3>
                {migrationResult.error ? (
                  <Card className="p-4 border-red-200 bg-red-50">
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <p className="text-red-700">{migrationResult.error}</p>
                    </div>
                  </Card>
                ) : migrationResult.simulation ? (
                  <div className="space-y-4">
                    {/* Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="p-4">
                        <h4 className="font-medium text-sm mb-2">Estimated Cost</h4>
                        <p className="text-2xl font-bold text-blue-600">${migrationResult.simulation.estimatedCost}</p>
                      </Card>
                      <Card className="p-4">
                        <h4 className="font-medium text-sm mb-2">Timeline</h4>
                        <p className="text-2xl font-bold text-green-600">{migrationResult.simulation.estimatedTime}</p>
                      </Card>
                      <Card className="p-4">
                        <h4 className="font-medium text-sm mb-2">Complexity</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          migrationResult.simulation.complexity === 'low' ? 'bg-green-100 text-green-700' :
                          migrationResult.simulation.complexity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {migrationResult.simulation.complexity.toUpperCase()}
                        </span>
                      </Card>
                      <Card className="p-4">
                        <h4 className="font-medium text-sm mb-2">Compatibility</h4>
                        <p className="text-2xl font-bold text-purple-600">{migrationResult.simulation.compatibilityScore}%</p>
                      </Card>
                    </div>

                    {/* Benefits */}
                    <div>
                      <h4 className="font-medium mb-3">Expected Benefits</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {migrationResult.simulation.benefits.map((benefit: any, index: number) => (
                          <Card key={index} className="p-3">
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm capitalize">{benefit.type.replace('_', ' ')}</p>
                                <p className="text-sm text-muted-foreground">{benefit.impact}</p>
                                {benefit.value && (
                                  <p className="text-sm font-medium text-green-600">${benefit.value.toFixed(0)} annual savings</p>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Risks */}
                    <div>
                      <h4 className="font-medium mb-3">Potential Risks</h4>
                      <div className="space-y-3">
                        {migrationResult.simulation.risks.map((risk: any, index: number) => (
                          <Card key={index} className="p-3">
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                risk.severity === 'critical' ? 'bg-red-500' :
                                risk.severity === 'high' ? 'bg-orange-500' :
                                risk.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                              }`} />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h5 className="font-medium text-sm capitalize">{risk.type.replace('_', ' ')}</h5>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    risk.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                    risk.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                    risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    {risk.severity.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{risk.description}</p>
                                <p className="text-sm text-green-600">
                                  <strong>Mitigation:</strong> {risk.mitigation}
                                </p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h4 className="font-medium mb-3">Migration Timeline</h4>
                      <div className="space-y-3">
                        {migrationResult.simulation.timeline.map((phase: any, index: number) => (
                          <Card key={index} className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium">{phase.phase}</h5>
                                  <span className="text-sm text-muted-foreground">{phase.duration}</span>
                                </div>
                                <div className="mb-3">
                                  <p className="text-sm font-medium mb-1">Tasks:</p>
                                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                                    {phase.tasks.map((task: string, taskIndex: number) => (
                                      <li key={taskIndex}>{task}</li>
                                    ))}
                                  </ul>
                                </div>
                                {phase.dependencies.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium mb-1">Dependencies:</p>
                                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                                      {phase.dependencies.map((dep: string, depIndex: number) => (
                                        <li key={depIndex}>{dep}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Migration Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Cost Optimization</h4>
                <p className="text-sm text-muted-foreground">
                  Potential savings through provider optimization and resource rightsizing.
                </p>
              </Card>
              <Card className="p-4">
                <h4 className="font-medium mb-2">Performance Gains</h4>
                <p className="text-sm text-muted-foreground">
                  Improved latency and throughput with provider-specific optimizations.
                </p>
              </Card>
              <Card className="p-4">
                <h4 className="font-medium mb-2">Feature Access</h4>
                <p className="text-sm text-muted-foreground">
                  Access to unique services and capabilities of different providers.
                </p>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
