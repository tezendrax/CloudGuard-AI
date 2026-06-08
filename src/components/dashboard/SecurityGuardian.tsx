'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, AlertTriangle, Eye, Lock, Users, Activity, 
  RefreshCw, Server, Network, Globe, Database,
  CheckCircle2, XCircle, Clock, Zap, TrendingUp,
  Bell, Settings, BarChart3, Wifi, Bug, 
  FileText, Search, Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface SecurityThreat {
  id: string
  type: 'malware' | 'intrusion' | 'anomaly' | 'vulnerability' | 'ddos' | 'phishing' | 'bruteforce'
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
  targetAsset: string
  description: string
  status: 'detected' | 'mitigated' | 'investigating' | 'blocked'
  detectedAt: Date
  resolvedAt?: Date
  autoAction?: string
  confidence: number
  riskScore: number
  attackVector: string
  countryOrigin?: string
}

interface SecurityMetrics {
  overallScore: number
  threatsBlocked: number
  activeScans: number
  protectedAssets: number
  responseTime: number
  uptime: number
  lastScanTime: Date
  networkTraffic: number
  suspiciousConnections: number
  vulnerabilitiesPatched: number
}

interface NetworkActivity {
  timestamp: Date
  sourceIP: string
  destinationIP: string
  port: number
  protocol: string
  status: 'allowed' | 'blocked' | 'suspicious'
  country: string
  riskLevel: number
}

export function SecurityGuardian() {
  const [threats, setThreats] = useState<SecurityThreat[]>([])
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    overallScore: 94.2,
    threatsBlocked: 247,
    activeScans: 3,
    protectedAssets: 847,
    responseTime: 0.3,
    uptime: 99.8,
    lastScanTime: new Date(),
    networkTraffic: 0,
    suspiciousConnections: 0,
    vulnerabilitiesPatched: 12
  })
  const [networkActivity, setNetworkActivity] = useState<NetworkActivity[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [updateCount, setUpdateCount] = useState(0)

  // Initialize with realistic security data
  useEffect(() => {
    generateInitialSecurityData()
    
    // Real-time security monitoring updates every 2 seconds
    const interval = setInterval(() => {
      updateSecurityMetrics()
      updateNetworkActivity()
      
      // Occasionally generate new threats
      if (Math.random() > 0.95) {
        generateNewThreat()
      }
      
      setLastUpdate(new Date().toLocaleTimeString())
      setUpdateCount(prev => prev + 1)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const generateInitialSecurityData = () => {
    const initialThreats: SecurityThreat[] = [
      {
        id: 'threat-001',
        type: 'ddos',
        severity: 'high',
        source: '203.45.67.89',
        targetAsset: 'web-server-01',
        description: 'DDoS attack attempt detected - 15,000 requests/minute',
        status: 'blocked',
        detectedAt: new Date(Date.now() - 8 * 60 * 1000),
        autoAction: 'Auto-blocked malicious IPs, activated DDoS protection',
        confidence: 98.5,
        riskScore: 85,
        attackVector: 'HTTP flood',
        countryOrigin: 'Unknown'
      },
      {
        id: 'threat-002',
        type: 'bruteforce',
        severity: 'critical',
        source: '185.220.101.42',
        targetAsset: 'ssh-server',
        description: 'SSH brute force attack - 847 failed login attempts',
        status: 'mitigated',
        detectedAt: new Date(Date.now() - 15 * 60 * 1000),
        autoAction: 'IP banned, fail2ban activated, admin notified',
        confidence: 99.2,
        riskScore: 92,
        attackVector: 'SSH protocol',
        countryOrigin: 'RU'
      },
      {
        id: 'threat-003',
        type: 'vulnerability',
        severity: 'medium',
        source: 'internal-scan',
        targetAsset: 'nginx-proxy',
        description: 'Outdated SSL/TLS configuration detected',
        status: 'investigating',
        detectedAt: new Date(Date.now() - 45 * 60 * 1000),
        confidence: 87.3,
        riskScore: 65,
        attackVector: 'Configuration weakness',
        countryOrigin: 'N/A'
      }
    ]
    
    setThreats(initialThreats)
    setLastUpdate(new Date().toLocaleTimeString())
    setUpdateCount(1)
  }

  const updateSecurityMetrics = () => {
    const now = Date.now()
    const timeVariation = Math.sin(now / 15000) * 2  // 15-second cycle
    const randomFactor = (Math.random() - 0.5) * 1.5
    
    setSecurityMetrics(prev => ({
      ...prev,
      overallScore: Math.max(85, Math.min(99.5, prev.overallScore + timeVariation * 0.5 + randomFactor * 0.3)),
      networkTraffic: Math.max(0, Math.min(100, 45 + timeVariation * 15 + randomFactor * 10)),
      suspiciousConnections: Math.max(0, Math.floor(prev.suspiciousConnections + (Math.random() - 0.7) * 2)),
      responseTime: Math.max(0.1, Math.min(2.0, prev.responseTime + (Math.random() - 0.5) * 0.2)),
      threatsBlocked: prev.threatsBlocked + Math.floor(Math.random() * 3),
      lastScanTime: new Date()
    }))
  }

  const updateNetworkActivity = () => {
    const countries = ['US', 'CN', 'RU', 'DE', 'BR', 'IN', 'UK', 'FR']
    const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'SSH', 'FTP']
    const statuses: ('allowed' | 'blocked' | 'suspicious')[] = ['allowed', 'blocked', 'suspicious']
    
    const newActivity: NetworkActivity = {
      timestamp: new Date(),
      sourceIP: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      destinationIP: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      port: [80, 443, 22, 21, 8080, 3306, 5432][Math.floor(Math.random() * 7)],
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      riskLevel: Math.floor(Math.random() * 100)
    }
    
    setNetworkActivity(prev => [newActivity, ...prev].slice(0, 10))
  }

  const generateNewThreat = () => {
    const threatTypes: SecurityThreat['type'][] = ['malware', 'intrusion', 'anomaly', 'vulnerability', 'ddos', 'phishing', 'bruteforce']
    const severities: SecurityThreat['severity'][] = ['low', 'medium', 'high', 'critical']
    const assets = ['web-server-01', 'database-01', 'api-gateway', 'load-balancer', 'nginx-proxy', 'redis-cache']
    
    const newThreat: SecurityThreat = {
      id: `threat-${Date.now()}`,
      type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      targetAsset: assets[Math.floor(Math.random() * assets.length)],
      description: 'AI-powered threat detection system identified suspicious activity',
      status: Math.random() > 0.7 ? 'detected' : 'blocked',
      detectedAt: new Date(),
      confidence: 80 + Math.random() * 18,
      riskScore: 30 + Math.random() * 60,
      attackVector: 'Network-based attack',
      countryOrigin: ['US', 'CN', 'RU', 'Unknown'][Math.floor(Math.random() * 4)]
    }
    
    setThreats(prev => [newThreat, ...prev].slice(0, 8))
  }

  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'malware': return <Bug className="w-4 h-4" />
      case 'intrusion': return <AlertTriangle className="w-4 h-4" />
      case 'ddos': return <Zap className="w-4 h-4" />
      case 'bruteforce': return <Lock className="w-4 h-4" />
      case 'phishing': return <Wifi className="w-4 h-4" />
      case 'anomaly': return <Eye className="w-4 h-4" />
      case 'vulnerability': return <Shield className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  const getThreatTypeLabel = (type: string) => {
    switch (type) {
      case 'malware': return 'Malware'
      case 'intrusion': return 'Intrusion'
      case 'ddos': return 'DDoS Attack'
      case 'bruteforce': return 'Brute Force'
      case 'phishing': return 'Phishing'
      case 'anomaly': return 'Anomaly'
      case 'vulnerability': return 'Vulnerability'
      default: return 'Security Event'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
      case 'critical': return 'bg-red-500/10 text-red-600 border-red-500/20'
      default: return 'bg-black/10 text-black border-black/20 dark:bg-white/10 dark:text-white dark:border-white/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'detected': return 'text-red-500 bg-red-500/10'
      case 'investigating': return 'text-yellow-500 bg-yellow-500/10'
      case 'mitigated': return 'text-green-500 bg-green-500/10'
      case 'blocked': return 'text-blue-500 bg-blue-500/10'
      default: return 'text-black bg-black/10 dark:text-white dark:bg-white/10'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-500'
    if (score >= 85) return 'text-yellow-500'
    if (score >= 75) return 'text-orange-500'
    return 'text-red-500'
  }

  const getNetworkStatusColor = (status: string) => {
    switch (status) {
      case 'allowed': return 'text-green-500'
      case 'blocked': return 'text-red-500'
      case 'suspicious': return 'text-orange-500'
      default: return 'text-black dark:text-white'
    }
  }

  const getRiskLevelColor = (riskLevel: number) => {
    if (riskLevel >= 80) return 'text-red-500'
    if (riskLevel >= 60) return 'text-orange-500'
    if (riskLevel >= 40) return 'text-yellow-500'
    return 'text-green-500'
  }

  const runSecurityScan = useCallback(() => {
    setIsScanning(true)
    // Simulate scan process
    setTimeout(() => {
      setIsScanning(false)
      setSecurityMetrics(prev => ({
        ...prev,
        lastScanTime: new Date(),
        vulnerabilitiesPatched: prev.vulnerabilitiesPatched + Math.floor(Math.random() * 3)
      }))
    }, 3000)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header with Real-Time Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <CardTitle>AI Security Guardian</CardTitle>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Active Protection
              </Badge>
              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                Updates: {updateCount}
              </Badge>
              <Badge className="bg-black/10 text-black border-black/20 dark:bg-white/10 dark:text-white dark:border-white/20">
                Last: {lastUpdate}
              </Badge>
              <Button 
                onClick={() => updateSecurityMetrics()} 
                size="sm" 
                variant="outline"
                className="text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Security Overview */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Security Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Security Score */}
              <div className="text-center p-4 bg-white rounded-lg border dark:bg-black/20">
                <div className={`text-3xl font-bold ${getScoreColor(securityMetrics.overallScore)}`}>
                  {securityMetrics.overallScore.toFixed(1)}
                </div>
                <div className="text-sm text-black/70 mb-2 dark:text-white/70">Security Score</div>
                <Progress value={securityMetrics.overallScore} className="w-full" />
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <Shield className="w-5 h-5 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-600">
                    {securityMetrics.threatsBlocked.toLocaleString()}
                  </div>
                  <div className="text-xs text-black/70 dark:text-white/70">Threats Blocked</div>
                </motion.div>

                <motion.div
                  className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <AlertTriangle className="w-5 h-5 text-red-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-red-600">
                    {threats.filter(t => t.status === 'detected').length}
                  </div>
                  <div className="text-xs text-black/70 dark:text-white/70">Active Threats</div>
                </motion.div>

                <motion.div
                  className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <Eye className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-blue-600">{securityMetrics.activeScans}</div>
                  <div className="text-xs text-black/70 dark:text-white/70">Active Scans</div>
                </motion.div>

                <motion.div
                  className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <Lock className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-purple-600">
                    {securityMetrics.protectedAssets.toLocaleString()}
                  </div>
                  <div className="text-xs text-black/70 dark:text-white/70">Protected Assets</div>
                </motion.div>
              </div>

              {/* Additional Metrics */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-black/70 dark:text-white/70">Response Time:</span>
                  <span className="font-mono text-black dark:text-white">{securityMetrics.responseTime.toFixed(2)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/70 dark:text-white/70">System Uptime:</span>
                  <span className="font-mono text-green-600">{securityMetrics.uptime.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/70 dark:text-white/70">Network Traffic:</span>
                  <span className="font-mono text-black dark:text-white">{securityMetrics.networkTraffic.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/70 dark:text-white/70">Suspicious Connections:</span>
                  <span className="font-mono text-orange-600">{securityMetrics.suspiciousConnections}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Security Events */}
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Activity className="w-5 h-5 text-red-600" />
              <span>Security Events</span>
              <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">
                Live Monitoring
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {threats.length === 0 ? (
                <div className="text-center py-8 text-black/50 dark:text-white/50">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active security threats</p>
                  <p className="text-sm">All systems secure</p>
                </div>
              ) : (
                threats.map((threat, index) => (
                  <motion.div
                    key={threat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg border bg-white/50 hover:bg-white/80 transition-colors text-black"
                  >
                      <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="text-black">
                          {getThreatIcon(threat.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-black mb-1">
                            {getThreatTypeLabel(threat.type)}
                          </div>
                          <div className="text-sm text-black mb-2">
                            {threat.description}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="text-black">Source: {threat.source}</span>
                            <span className="text-black">Target: {threat.targetAsset}</span>
                            {threat.countryOrigin && threat.countryOrigin !== 'N/A' && (
                              <span className="text-black">Origin: {threat.countryOrigin}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge className={getSeverityColor(threat.severity)} variant="outline">
                          {threat.severity.toUpperCase()}
                        </Badge>
                        <div className={`text-xs px-2 py-1 rounded ${getStatusColor(threat.status)}`}>
                          {threat.status.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                      <div>
                        <span className="text-black">Confidence:</span>
                        <span className="ml-1 font-mono text-black">{threat.confidence?.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-black">Risk Score:</span>
                        <span className={`ml-1 font-mono ${getRiskLevelColor(threat.riskScore)}`}>
                          {threat.riskScore?.toFixed(0)}/100
                        </span>
                      </div>
                    </div>

                    {threat.autoAction && (
                      <div className="text-xs text-green-600 bg-green-500/10 p-2 rounded mb-3 border border-green-500/20">
                        <Zap className="w-3 h-3 inline mr-1" />
                        Auto-Action: {threat.autoAction}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-black">
                        {Math.floor((Date.now() - threat.detectedAt.getTime()) / 60000)}m ago
                      </span>
                      <div className="flex space-x-1">
                        {threat.status === 'detected' && (
                          <>
                            <Button size="sm" variant="outline" className="text-xs h-6">
                              Block
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs h-6">
                              Investigate
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Activity and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Network Activity Monitor */}
        <Card className="lg:col-span-2 border-green-500/20 bg-green-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Network className="w-5 h-5 text-green-600" />
              <span>Network Activity Monitor</span>
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                Real-time
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {networkActivity.map((activity, index) => (
                <motion.div
                  key={`${activity.sourceIP}-${activity.timestamp.getTime()}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex items-center justify-between p-2 bg-white/50 rounded text-xs hover:bg-white/80 transition-colors text-black"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'allowed' ? 'bg-green-500' :
                      activity.status === 'blocked' ? 'bg-red-500' : 'bg-orange-500'
                    }`}></div>
                    <span className="font-mono text-xs text-black">{activity.sourceIP}</span>
                    <span className="text-black">→</span>
                    <span className="font-mono text-xs text-black">{activity.destinationIP}:{activity.port}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">{activity.protocol}</Badge>
                    <span className={`text-xs font-medium ${getNetworkStatusColor(activity.status)}`}>
                      {activity.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-black">{activity.country}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Controls */}
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-purple-600" />
              <span>Security Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={runSecurityScan}
                disabled={isScanning}
                className="w-full text-sm"
                variant="outline"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Run Full Scan
                  </>
                )}
              </Button>

              <Button variant="outline" className="w-full text-sm">
                <Eye className="w-4 h-4 mr-2" />
                View Threats
              </Button>

              <Button variant="outline" className="w-full text-sm">
                <FileText className="w-4 h-4 mr-2" />
                Security Report
              </Button>

              <Button variant="outline" className="w-full text-sm">
                <Bell className="w-4 h-4 mr-2" />
                Alert Settings
              </Button>

              {/* AI Status */}
              <div className="mt-6 p-3 bg-white rounded-lg border dark:bg-black/20">
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-black dark:text-white">AI Guardian</span>
                  </div>
                  <span className="text-green-600 font-semibold">Active</span>
                </div>
                <div className="text-xs text-black/70 dark:text-white/70 space-y-1">
                  <div>Monitoring {securityMetrics.protectedAssets.toLocaleString()} assets</div>
                  <div>Last scan: {securityMetrics.lastScanTime.toLocaleTimeString()}</div>
                  <div>Vulnerabilities patched: {securityMetrics.vulnerabilitiesPatched}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
