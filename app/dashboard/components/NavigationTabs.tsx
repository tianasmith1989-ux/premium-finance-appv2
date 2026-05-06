/**
 * NavigationTabs Component
 * Simplified navigation with 6 main tabs instead of 13
 * 
 * Usage:
 * <NavigationTabs 
 *   activeTab={activeTab}
 *   onTabChange={(tab) => setActiveTab(tab)}
 *   notificationCount={notificationCount}
 * />
 */

import React from 'react'

interface NavigationTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  notificationCount?: number
  checkInStreak?: number
}

interface TabConfig {
  id: string
  label: string
  icon: string
  description: string
  badge?: number | string
}

export default function NavigationTabs({
  activeTab,
  onTabChange,
  notificationCount = 0,
  checkInStreak = 0
}: NavigationTabsProps) {
  
  const tabs: TabConfig[] = [
    {
      id: 'home',
      label: 'Home',
      icon: '🏠',
      description: 'Your financial snapshot & next actions'
    },
    {
      id: 'budget',
      label: 'Budget',
      icon: '💰',
      description: 'Income, expenses, and cash flow'
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: '🎯',
      description: 'Track your financial goals'
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: '📊',
      description: 'AI-powered recommendations'
    },
    {
      id: 'checkins',
      label: 'Check-ins',
      icon: '✅',
      description: 'Daily check-ins & tracking',
      badge: checkInStreak > 0 ? `${checkInStreak}🔥` : undefined
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      description: 'Profile & preferences'
    }
  ]
  
  // Mobile: Show tabs as horizontal scroll
  return (
    <>
      {/* Desktop Navigation - Horizontal Tabs */}
      <div className="hidden md:block bg-slate-900 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-slate-800/50'
                }`}
                title={tab.description}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-1 px-2 py-0.5 bg-orange-600 text-white text-xs rounded-full font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation - Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-40">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 py-3 px-2 flex-1 transition-all duration-200 relative ${
                activeTab === tab.id
                  ? 'text-blue-400'
                  : 'text-gray-400'
              }`}
              title={tab.description}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
              
              {/* Badge */}
              {tab.badge && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-orange-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {typeof tab.badge === 'string' ? tab.badge.charAt(0) : tab.badge}
                </span>
              )}
              
              {/* Active indicator */}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Mobile Content Padding */}
      <div className="md:hidden h-20" />
    </>
  )
}

/**
 * Alternative: Sidebar Navigation for Desktop
 * Use this version if you prefer a sidebar layout
 */
export function NavigationSidebar({
  activeTab,
  onTabChange,
  checkInStreak = 0
}: NavigationTabsProps) {
  
  const tabs: TabConfig[] = [
    {
      id: 'home',
      label: 'Home',
      icon: '🏠',
      description: 'Your financial snapshot & next actions'
    },
    {
      id: 'budget',
      label: 'Budget',
      icon: '💰',
      description: 'Income, expenses, and cash flow'
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: '🎯',
      description: 'Track your financial goals'
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: '📊',
      description: 'AI-powered recommendations'
    },
    {
      id: 'checkins',
      label: 'Check-ins',
      icon: '✅',
      description: 'Daily check-ins & tracking',
      badge: checkInStreak > 0 ? `${checkInStreak}🔥` : undefined
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      description: 'Profile & preferences'
    }
  ]
  
  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🅰️</span>
          <div>
            <h2 className="text-xl font-bold text-white">Aureus</h2>
            <p className="text-xs text-gray-400">Financial Coach</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 group flex items-center justify-between ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-slate-800 hover:text-gray-300'
            }`}
            title={tab.description}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{tab.icon}</span>
              <div>
                <p className="font-medium">{tab.label}</p>
                <p className="text-xs opacity-75">{tab.description}</p>
              </div>
            </div>
            
            {tab.badge && (
              <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full font-bold whitespace-nowrap ml-2">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
      
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-950">
        <p className="text-xs text-gray-500 text-center">
          💡 Tip: Check in daily for best results
        </p>
      </div>
    </div>
  )
}
