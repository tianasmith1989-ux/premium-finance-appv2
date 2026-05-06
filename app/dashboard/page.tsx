/**
 * Updated Dashboard Page Component
 * 
 * COPY-PASTE THIS INTO: app/dashboard/page.tsx
 * 
 * This replaces your existing dashboard page with:
 * - Simplified 6-tab navigation (instead of 13)
 * - HOME as default tab (instead of Chat)
 * - All new components integrated
 */

'use client'

import React, { useState, useEffect } from 'react'
import NavigationTabs from '@/app/dashboard/components/NavigationTabs'
import HomeTab from '@/app/dashboard/components/HomeTab'
// Import other tab components as needed
// import BudgetTab from '@/app/dashboard/components/BudgetTab'
// import GoalsTab from '@/app/dashboard/components/GoalsTab'
// import InsightsTab from '@/app/dashboard/components/InsightsTab'
// import CheckInsTab from '@/app/dashboard/components/CheckInsTab'
// import SettingsTab from '@/app/dashboard/components/SettingsTab'

interface UserData {
  id: string
  name: string
  email: string
  userType: 'homebuyer' | 'wealth_builder' | 'debt_fighter' | 'income_maximizer' | null
  monthlyIncome: number
  monthlyExpenses: number
  totalDebt: number
  totalAssets: number
  savings: number
  incomeStreams: any[]
  expenses: any[]
  createdAt: string
}

interface Goal {
  id: string
  name: string
  emoji: string
  current: number
  target: number
  deadline: string
  category: string
  description: string
}

interface Win {
  id: string
  title: string
  emoji: string
  description: string
  date: string
  impact: string
  category: string
}

export default function DashboardPage() {
  // ==================== STATE ====================
  const [activeTab, setActiveTab] = useState<string>('home') // ✅ DEFAULT TO HOME
  const [userData, setUserData] = useState<UserData | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [wins, setWins] = useState<Win[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkInStreak, setCheckInStreak] = useState(0)
  
  // Track last actions for NextActions component
  const [lastActions, setLastActions] = useState<Record<string, string>>({})
  
  // ==================== EFFECTS ====================
  
  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        
        // TODO: Replace with your actual API call
        // Example: const response = await fetch('/api/user/profile')
        // const data = await response.json()
        
        // Mock data for now
        const mockData: UserData = {
          id: '1',
          name: 'Tiana',
          email: 'tianasmith1989@gmail.com',
          userType: 'homebuyer',
          monthlyIncome: 5000,
          monthlyExpenses: 3500,
          totalDebt: 80000,
          totalAssets: 150000,
          savings: 42500,
          incomeStreams: [],
          expenses: [],
          createdAt: new Date().toISOString()
        }
        
        setUserData(mockData)
        
        // Fetch goals
        const mockGoals: Goal[] = [
          {
            id: '1',
            name: 'Home Deposit',
            emoji: '🏠',
            current: 42500,
            target: 100000,
            deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'savings',
            description: 'Save for my first home deposit'
          },
          {
            id: '2',
            name: 'Passive Income',
            emoji: '💰',
            current: 200,
            target: 1000,
            deadline: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'investment',
            description: 'Build passive income streams'
          }
        ]
        setGoals(mockGoals)
        
        // Fetch wins
        const mockWins: Win[] = [
          {
            id: '1',
            title: 'Saved $500 extra this month',
            emoji: '💰',
            description: 'Exceeded savings goal',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            impact: '+$500',
            category: 'savings'
          },
          {
            id: '2',
            title: 'Paid off credit card',
            emoji: '🎉',
            description: 'Credit card balance now $0',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            impact: '$0 balance',
            category: 'debt'
          }
        ]
        setWins(mockWins)
        
        setCheckInStreak(7)
        setError(null)
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [])
  
  // ==================== HANDLERS ====================
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    
    // Track tab navigation
    console.log(`Navigated to ${tab} tab`)
  }
  
  const handleAddGoal = () => {
    // TODO: Open goal creation modal
    console.log('Open goal creation modal')
    // Example: setShowGoalModal(true)
  }
  
  const handleStartAction = (action: any) => {
    // TODO: Handle action based on actionType
    console.log('Start action:', action)
    
    // Update last action timestamp
    setLastActions(prev => ({
      ...prev,
      [action.actionType]: new Date().toISOString()
    }))
  }
  
  const handleNavigate = (tab: string) => {
    setActiveTab(tab)
  }
  
  // ==================== RENDER ====================
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-blue-600 rounded-full animate-pulse">
            <span className="text-2xl">🅰️</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading your dashboard...</h2>
          <p className="text-gray-400">Preparing your financial snapshot</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        checkInStreak={checkInStreak}
      />
      
      {/* Tab Content */}
      <div className="pb-20 md:pb-0">
        {/* HOME Tab (Default) */}
        {activeTab === 'home' && (
          <HomeTab
            userData={userData || undefined}
            goals={goals}
            wins={wins}
            trends={{
              monthlyGrowth: 5000 - 3500,
              yearlyGrowth: (5000 - 3500) * 12
            }}
            lastActions={lastActions}
            onNavigate={handleNavigate}
            onAddGoal={handleAddGoal}
            onStartAction={handleStartAction}
          />
        )}
        
        {/* BUDGET Tab */}
        {activeTab === 'budget' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="bg-slate-800 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">💰 Budget & Money</h2>
              <p className="text-gray-400">Budget component coming soon</p>
              <p className="text-sm text-gray-500 mt-4">
                Import the BudgetTab component here
              </p>
            </div>
          </div>
        )}
        
        {/* GOALS Tab */}
        {activeTab === 'goals' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="bg-slate-800 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">🎯 Goals & Roadmap</h2>
              <p className="text-gray-400">Goals component coming soon</p>
              <p className="text-sm text-gray-500 mt-4">
                Import the GoalsTab component here
              </p>
            </div>
          </div>
        )}
        
        {/* INSIGHTS Tab */}
        {activeTab === 'insights' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="bg-slate-800 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">📊 Insights & Coaching</h2>
              <p className="text-gray-400">Insights component coming soon</p>
              <p className="text-sm text-gray-500 mt-4">
                Import the InsightsTab component here
              </p>
            </div>
          </div>
        )}
        
        {/* CHECK-INS Tab */}
        {activeTab === 'checkins' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="bg-slate-800 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">✅ Check-ins & Tracking</h2>
              <p className="text-gray-400">Check-ins component coming soon</p>
              <p className="text-sm text-gray-500 mt-4">
                Import the CheckInsTab component here
              </p>
            </div>
          </div>
        )}
        
        {/* SETTINGS Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="bg-slate-800 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">⚙️ Settings & Learning</h2>
              <p className="text-gray-400">Settings component coming soon</p>
              <p className="text-sm text-gray-500 mt-4">
                Import the SettingsTab component here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
