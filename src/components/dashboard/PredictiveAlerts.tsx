'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, 
  Brain, 
  Clock, 
  CheckCircle, 
  XCircle,
  Zap,
  Shield,
  DollarSign,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Eye,
  Filter,
  RefreshCw,
  Loader2,
  BarChart3,
  Users,
  Server,
  Activity,
  Target,
  Lightbulb,
  History,
  AlertOctagon,
  TrendingDown,
  Minus,
  ExternalLink,
  FileText,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePredictiveAlerts } from '@/hooks/usePredictiveAlerts'

export function PredictiveAlerts() {
  const {
    alerts,
    summary,
    selectedAlert,
    showDetails,
    filters,
    isLoading,
    error,
    isUpdating,
    acknowledgeAlert,
    resolveAlert,
    investigateAlert,
    escalateAlert,
    openAlertDetails,
    closeAlertDetails,
    refetch,
    updateFilters,
    clearFilters,
    criticalAlerts,
    highPriorityAlerts,
    avgConfidence,
    getSeverityColor,
    getTypeIcon,
    getStatusColor
  } = usePredictiveAlerts()

  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const toggleExpanded = (alertId: string) => {
    setExpandedAlert(expandedAlert === alertId ? null : alertId)
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'performance': return <TrendingUp className="w-4 h-4" />
      case 'cost': return <DollarSign className="w-4 h-4" />
      case 'security': return <Shield className="w-4 h-4" />
      case 'failure': return <XCircle className="w-4 h-4" />
      case 'capacity': return <BarChart3 className="w-4 h-4" />
      case 'compliance': return <FileText className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'acknowledged': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'investigating': return <Eye className="w-4 h-4 text-blue-500" />
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-3 h-3 text-red-500" />
      case 'decreasing': return <TrendingDown className="w-3 h-3 text-green-500" />
      case 'stable': return <Minus className="w-3 h-3 text-gray-500" />
      default: return <Activity className="w-3 h-3" />
    }
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Loading predictive alerts...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-digital-twin animate-pulse" />
            <CardTitle>AI Predictive Alerts</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-muted-foreground">
              {summary?.byStatus?.active || 0} active • {avgConfidence?.toFixed(1) || '0.0'}% avg confidence
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Severity</label>
                <select 
                  className="w-full p-2 text-sm border rounded"
                  value={filters.severity}
                  onChange={(e) => updateFilters({ severity: e.target.value })}
                >
                  <option value="">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select 
                  className="w-full p-2 text-sm border rounded"
                  value={filters.status}
                  onChange={(e) => updateFilters({ status: e.target.value })}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select 
                  className="w-full p-2 text-sm border rounded"
                  value={filters.type}
                  onChange={(e) => updateFilters({ type: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="performance">Performance</option>
                  <option value="cost">Cost</option>
                  <option value="security">Security</option>
                  <option value="failure">Failure</option>
                  <option value="capacity">Capacity</option>
                  <option value="compliance">Compliance</option>
                </select>
              </div>
            </div>
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
          <AnimatePresence>
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-lg border ${getSeverityColor(alert.severity)} ${
                  alert.status === 'resolved' ? 'opacity-60' : ''
                }`}
              >
                {/* Alert Header */}
                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTypeIcon(alert.type)}</span>
                      {getAlertIcon(alert.type)}
                      <h4 className="font-semibold text-sm">{alert.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(alert.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(alert.id)}
                      >
                        {expandedAlert === alert.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {alert.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-3 text-xs">
                    <div className="flex items-center space-x-1">
                      <Brain className="w-3 h-3" />
                      <span>Confidence: {alert.confidence.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>ETA: {alert.timeToImpact}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span>Impact: {alert.impact.severity}</span>
                    </div>
                  </div>

                  {alert.autoAction && (
                    <div className="flex items-center space-x-1 mb-3 text-xs text-green-600">
                      <Zap className="w-3 h-3" />
                      <span>{alert.autoAction}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Predicted {Math.floor((Date.now() - new Date(alert.predictedAt).getTime()) / 60000)}m ago
                    </span>
                    
                    {alert.status === 'active' && (
                      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                          disabled={isUpdating}
                          className="text-xs w-full sm:w-auto"
                        >
                          {isUpdating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                          Acknowledge
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => investigateAlert(alert.id)}
                          disabled={isUpdating}
                          className="text-xs w-full sm:w-auto"
                        >
                          {isUpdating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                          Investigate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveAlert(alert.id)}
                          disabled={isUpdating}
                          className="text-xs w-full sm:w-auto"
                        >
                          {isUpdating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                          Resolve
                        </Button>
                      </div>
                    )}
                    
                    {alert.status !== 'active' && (
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                        {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedAlert === alert.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t bg-gray-50/50"
                    >
                      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                        {/* Root Cause Analysis */}
                        <div>
                          <h5 className="font-medium text-sm mb-2 flex items-center space-x-1">
                            <AlertOctagon className="w-4 h-4" />
                            <span>Root Cause Analysis</span>
                          </h5>
                          <div className="bg-white p-3 rounded border">
                            <p className="text-sm font-medium text-red-600 mb-2">
                              Primary: {alert.rootCause.primary}
                            </p>
                            <div className="space-y-1">
                              <p className="text-xs font-medium">Contributing Factors:</p>
                              <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                                {alert.rootCause.contributing.map((factor, idx) => (
                                  <li key={idx}>{factor}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Data Points */}
                        <div>
                          <h5 className="font-medium text-sm mb-2 flex items-center space-x-1">
                            <BarChart3 className="w-4 h-4" />
                            <span>Key Metrics</span>
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {alert.rootCause.dataPoints.map((dp, idx) => (
                              <div key={idx} className="bg-white p-3 rounded border">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium">{dp.metric}</span>
                                  {getTrendIcon(dp.trend)}
                                </div>
                                <div className="text-sm">
                                  <span className={`font-bold ${
                                    dp.current > dp.threshold ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {dp.current.toFixed(1)}{dp.unit}
                                  </span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    (threshold: {dp.threshold}{dp.unit})
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Impact Analysis */}
                        <div>
                          <h5 className="font-medium text-sm mb-2 flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>Impact Analysis</span>
                          </h5>
                          <div className="bg-white p-3 rounded border space-y-2">
                            <div>
                              <span className="text-xs font-medium">Affected Systems:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {alert.impact.affectedSystems.map((system, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                    {system}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-medium">Business Impact:</span>
                              <p className="text-xs text-muted-foreground mt-1">{alert.impact.businessImpact}</p>
                            </div>
                            {alert.impact.estimatedCost && (
                              <div>
                                <span className="text-xs font-medium">Estimated Cost:</span>
                                <span className="text-sm font-bold text-red-600 ml-2">
                                  ${alert.impact.estimatedCost.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div>
                          <h5 className="font-medium text-sm mb-2 flex items-center space-x-1">
                            <Lightbulb className="w-4 h-4" />
                            <span>AI Recommendations</span>
                          </h5>
                          <div className="space-y-2">
                            {alert.recommendations.map((rec, idx) => (
                              <div key={idx} className="bg-white p-3 rounded border">
                                <div className="flex items-start justify-between mb-2">
                                  <h6 className="text-sm font-medium">{rec.action}</h6>
                                  <div className="flex space-x-1">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      rec.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                      rec.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}>
                                      {rec.priority.toUpperCase()}
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                      {rec.effort}
                                    </span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                  <div>
                                    <span className="font-medium">Timeframe:</span>
                                    <span className="ml-1">{rec.timeframe}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Risk Level:</span>
                                    <span className={`ml-1 ${
                                      rec.riskLevel === 'high' ? 'text-red-600' :
                                      rec.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                                    }`}>
                                      {rec.riskLevel}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-xs text-green-600 mt-2">
                                  <strong>Expected Outcome:</strong> {rec.expectedOutcome}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Historical Context */}
                        <div>
                          <h5 className="font-medium text-sm mb-2 flex items-center space-x-1">
                            <History className="w-4 h-4" />
                            <span>Historical Context</span>
                          </h5>
                          <div className="bg-white p-3 rounded border">
                            <div className="grid grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="font-medium">Similar Incidents:</span>
                                <span className="ml-1">{alert.history.similarIncidents}</span>
                              </div>
                              <div>
                                <span className="font-medium">Avg Resolution:</span>
                                <span className="ml-1">{alert.history.averageResolutionTime}</span>
                              </div>
                              <div>
                                <span className="font-medium">Success Rate:</span>
                                <span className="ml-1 text-green-600">{alert.history.successRate}%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-2 pt-2 border-t">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-1" />
                            Generate Report
                          </Button>
                          {alert.status === 'active' && (
                            <Button size="sm" onClick={() => escalateAlert(alert.id)}>
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Escalate
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {alerts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No predictive alerts match your current filters</p>
              <p className="text-sm">AI is continuously monitoring for potential issues</p>
            </div>
          )}
        </div>

        {/* Enhanced Summary Stats */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-4 gap-4 text-center text-sm mb-4">
            <div>
              <div className="text-lg font-bold text-red-500">
                {summary?.bySeverity?.critical || 0}
              </div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-500">
                {summary?.bySeverity?.high || 0}
              </div>
              <div className="text-xs text-muted-foreground">High</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-500">
                {summary?.bySeverity?.medium || 0}
              </div>
              <div className="text-xs text-muted-foreground">Medium</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-500">
                {summary?.byStatus?.resolved || 0}
              </div>
              <div className="text-xs text-muted-foreground">Resolved</div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex justify-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => updateFilters({ status: 'active' })}>
              <AlertTriangle className="w-4 h-4 mr-1" />
              View Active ({summary?.byStatus?.active || 0})
            </Button>
            <Button variant="outline" size="sm" onClick={() => updateFilters({ severity: 'critical' })}>
              <AlertOctagon className="w-4 h-4 mr-1" />
              Critical Only ({summary?.bySeverity?.critical || 0})
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
