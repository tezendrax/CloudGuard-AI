'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Settings, 
  User, 
  Search, 
  Menu,
  Brain,
  Zap,
  Shield,
  Activity,
  X,
  ChevronDown,
  LogOut,
  UserCircle,
  Palette,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

export function DashboardHeader() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const [notifications] = useState([
    { id: 1, title: 'Cost optimization opportunity detected', type: 'info', time: '2m ago', description: 'Potential savings of $234/month identified' },
    { id: 2, title: 'Security threat mitigated automatically', type: 'success', time: '5m ago', description: 'Suspicious activity blocked from 192.168.1.100' },
    { id: 3, title: 'Predictive scaling activated', type: 'warning', time: '10m ago', description: 'Auto-scaled web servers based on traffic prediction' },
  ])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      toast.success(`Searching for: ${searchQuery}`)
      // Implement search functionality here
    }
    setShowSearch(!showSearch)
  }

  const handleNotificationClick = (notification) => {
    toast.info(`${notification.title}`)
    // Mark as read or navigate to detailed view
  }

  const handleSettingsClick = () => {
    toast.info('Opening settings...')
    // Navigate to settings page
  }

  const handleUserMenuClick = (action) => {
    switch(action) {
      case 'profile':
        toast.info('Opening user profile...')
        break
      case 'settings':
        toast.info('Opening user settings...')
        break
      case 'logout':
        toast.success('Logging out...')
        // Implement logout logic
        break
      default:
        break
    }
    setShowUserMenu(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-fluid">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-2"
            >
              <div className="relative">
                <Brain className="w-8 h-8 text-digital-twin" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold ai-gradient-text">CloudGuard AI</h1>
                <p className="text-xs text-muted-foreground">Digital Twin Ecosystem</p>
              </div>
            </motion.div>
          </div>

          {/* Status Indicators - Hidden on mobile, shown on larger screens */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-2 text-sm"
            >
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">AI Engine</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-2 text-sm"
            >
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-muted-foreground">12 Twins Active</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-2 text-sm"
            >
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-muted-foreground">Secure</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center space-x-2 text-sm"
            >
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-muted-foreground">Auto-Optimizing</span>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Search - Hidden on mobile */}
            <Button variant="ghost" size="icon" className="hidden sm:flex" onClick={() => setShowSearch(!showSearch)}>
              <Search className="w-4 h-4" />
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>
              
              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-popover border rounded-lg shadow-lg z-50"
                  >
                    <div className="p-4">
                      <h3 className="font-semibold mb-3">Notifications</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{notification.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                              </div>
                              <span className="text-xs text-muted-foreground ml-2">{notification.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Settings - Hidden on mobile */}
            <Button variant="ghost" size="icon" className="hidden sm:flex" onClick={handleSettingsClick}>
              <Settings className="w-4 h-4" />
            </Button>

            {/* User Menu */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="hidden sm:flex"
              >
                <User className="w-4 h-4" />
              </Button>
              
              {/* User Menu Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-popover border rounded-lg shadow-lg z-50"
                  >
                    <div className="p-2">
                      <button
                        className="mobile-nav-item w-full text-left"
                        onClick={() => handleUserMenuClick('profile')}
                      >
                        <UserCircle className="w-4 h-4" />
                        Profile
                      </button>
                      <button
                        className="mobile-nav-item w-full text-left"
                        onClick={() => handleUserMenuClick('settings')}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <button
                        className="mobile-nav-item w-full text-left"
                        onClick={() => handleUserMenuClick('logout')}
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="sm:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden border-t bg-background/95 backdrop-blur-sm"
            >
              <div className="container-fluid py-4">
                <div className="space-y-4">
                  {/* Mobile Search */}
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="flex-1 bg-transparent border-none outline-none text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* Mobile Status Indicators */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-muted-foreground">AI Engine</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className="text-muted-foreground">12 Twins Active</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">Secure</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-muted-foreground">Auto-Optimizing</span>
                    </div>
                  </div>
                  
                  {/* Mobile Actions */}
                  <div className="space-y-2 pt-2 border-t">
                    <button
                      className="mobile-nav-item w-full text-left"
                      onClick={() => handleUserMenuClick('profile')}
                    >
                      <UserCircle className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      className="mobile-nav-item w-full text-left"
                      onClick={handleSettingsClick}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      className="mobile-nav-item w-full text-left"
                      onClick={() => handleUserMenuClick('logout')}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Status Bar - Responsive */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.5 }}
          className="pb-3"
        >
          <Card className="p-3">
            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4 lg:space-x-6">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-digital-twin" />
                  <span className="font-medium">AI Predictions:</span>
                  <span className="text-green-500">94.2% Accuracy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">Auto-Actions:</span>
                  <span className="text-blue-500">23 Today</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Threats Blocked:</span>
                  <span className="text-green-500">7 This Hour</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Cost Saved Today:</span>
                <span className="font-bold text-green-500">$1,247</span>
              </div>
            </div>
            
            {/* Mobile Layout */}
            <div className="md:hidden">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-digital-twin" />
                  <div>
                    <div className="font-medium text-xs">AI Predictions</div>
                    <div className="text-green-500 font-bold">94.2%</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <div>
                    <div className="font-medium text-xs">Auto-Actions</div>
                    <div className="text-blue-500 font-bold">23</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="font-medium text-xs">Threats Blocked</div>
                    <div className="text-green-500 font-bold">7</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="font-medium text-xs">Cost Saved</div>
                    <div className="text-green-500 font-bold">$1,247</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </header>
  )
}
