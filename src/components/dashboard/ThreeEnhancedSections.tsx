'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, Eye, Brain } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Import the three enhanced sections
import { EnhancedMultiCloudOverview } from './EnhancedMultiCloudOverview'
type SectionType = 'multicloud'

interface SectionInfo {
  id: SectionType
  title: string
  description: string
  icon: React.ReactNode
  color: string
  features: string[]
}

const sections: SectionInfo[] = [
  {
    id: 'multicloud',
    title: 'Multi-Cloud Management',
    description: 'Unified cloud provider overview and management with real-time monitoring across AWS, Azure, and GCP',
    icon: <Cloud className="w-6 h-6" />,
    color: 'blue',
    features: [
      'Real-time provider metrics',
      'Cross-cloud resource monitoring',
      'Performance analytics',
      'Cost breakdown by provider',
      'Health status tracking',
      'Auto-sync capabilities'
    ]
  },
]

export function ThreeEnhancedSections() {
  const [activeSection, setActiveSection] = useState<SectionType>('multicloud')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleSectionChange = async (sectionId: SectionType) => {
    if (sectionId === activeSection) return
    
    setIsTransitioning(true)
    await new Promise(resolve => setTimeout(resolve, 150))
    setActiveSection(sectionId)
    setIsTransitioning(false)
  }

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: {
        button: isActive ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
        border: 'border-blue-500/20',
        bg: 'bg-blue-500/5',
        text: 'text-blue-600'
      },
      green: {
        button: isActive ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200',
        border: 'border-green-500/20',
        bg: 'bg-green-500/5',
        text: 'text-green-600'
      },
      orange: {
        button: isActive ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200',
        border: 'border-orange-500/20',
        bg: 'bg-orange-500/5',
        text: 'text-orange-600'
      }
    }
    return colors[color as keyof typeof colors]
  }

  const renderActiveSection = () => {
    return <EnhancedMultiCloudOverview />
  }

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-slate-600" />
              <CardTitle>Multi-Cloud Management</CardTitle>
              <Badge variant="outline" className="text-xs">
                Complete Real-Time System
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <Eye className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                <Brain className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sections.map((section) => {
              const isActive = activeSection === section.id
              const colors = getColorClasses(section.color, isActive)
              
              return (
                <motion.div
                  key={section.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => handleSectionChange(section.id)}
                    className={`w-full h-auto p-4 ${colors.button} transition-all duration-200`}
                    variant="outline"
                  >
                    <div className="text-left space-y-2">
                      <div className="flex items-center space-x-2">
                        {section.icon}
                        <span className="font-semibold">{section.title}</span>
                      </div>
                      <p className="text-sm opacity-90 line-clamp-2">
                        {section.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {section.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-white/20 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                        {section.features.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-white/20 rounded-full">
                            +{section.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isTransitioning ? 0.5 : 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderActiveSection()}
        </motion.div>
      </AnimatePresence>

      {/* Section Features Overview */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Current Section Features</span>
            <Badge className={getColorClasses(sections.find(s => s.id === activeSection)?.color || 'blue', true).button}>
              {sections.find(s => s.id === activeSection)?.title}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {sections.find(s => s.id === activeSection)?.features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center space-x-2 p-2 border rounded-lg bg-muted/30"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">{feature}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ThreeEnhancedSections
