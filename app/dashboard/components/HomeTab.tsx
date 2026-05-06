/**
 * HomeTab Component
 * Main dashboard component that combines all sub-components
 * This is the default landing page after login
 * 
 * Usage:
 * <HomeTab 
 *   userData={userData}
 *   goals={goals}
 *   wins={wins}
 *   onNavigate={(tab) => setActiveTab(tab)}
 * />
 */

import React, { useState } from 'react'
import FinancialSnapshot from './FinancialSnapshot'
import GoalProgress from './GoalProgress'
import NextActions from './NextActions'
import RecentWins from './RecentWins'

interface HomeTabProps {
  userData?: {
    name?: string
    userType?: 'homebuyer' | 'wealth_builder' | 'debt_fighter' | 'income_maximizer' | null
    monthlyIncome?: number
    monthlyExpenses?: number
    totalDebt?: number
    totalAssets?: number
    savings?: number
    incomeStreams?: any[]
    expenses?: any[]
  }
  goals?: any[]
  wins?: any[]
  trends?: {
    monthlyGrowth?: number
    yearlyGrowth?: number
  }
  lastActions?: Record<string, string>
  onNavigate?: (tab: string) => void
  onAddGoal?: () => void
  onStartAction?: (action: any) => void
}

export default function HomeTab({
  userData = {},
  goals = [],
  wins = [],
  trends = {},
  lastActions = {},
  onNavigate,
  onAddGoal,
  onStartAction
}: HomeTabProps) {
  
  const [showWelcome, setShowWelcome] = useState(true)
  
  const userName = userData.name || 'there'
  const userType = userData.userType
  
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '🌅 Good morning'
    if (hour < 18) return '☀️ Good afternoon'
    return '🌙 Good evening'
  }
  
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'update_budget':
        onNavigate?.('budget')
        break
      case 'add_goal':
        onAddGoal?.()
        break
      case 'check_in':
        onNavigate?.('checkins')
        break
      case 'chat':
        onNavigate?.('chat')
        break
      default:
        break
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Welcome Banner (Optional) */}
      {showWelcome && userType && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 mb-6 rounded-lg mx-4 mt-4 flex items-start justify-between">
          <div className="flex-1">
            <p className="font-semibold mb-1">Welcome to Aureus! 🎉</p>
            <p className="text-sm text-blue-100">
              {userType === 'homebuyer' && 'Let\'s help you save for your dream home faster.'}
              {userType === 'wealth_builder' && 'Let\'s build your wealth and passive income streams.'}
              {userType === 'debt_fighter' && 'Let\'s get you debt-free as quickly as possible.'}
              {userType === 'income_maximizer' && 'Let\'s maximize your income and financial growth.'}
            </p>
          </div>
          <button
            onClick={() => setShowWelcome(false)}
            className="text-blue-200 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {getGreeting()}, {userName}! 👋
            </h1>
            <p className="text-gray-400">Here's your financial snapshot</p>
          </div>
          
          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-4">
            {userType && (
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Your Profile</p>
                <p className="text-lg font-semibold text-white capitalize">
                  {userType.replace('_', ' ')}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Financial Snapshot & Goal Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Snapshot */}
            <FinancialSnapshot
              userType={userType || null}
              userData={userData}
              goals={goals}
              trends={trends}
            />
            
            {/* Goal Progress */}
            <GoalProgress
              goals={goals}
              onGoalClick={(goal) => onNavigate?.('goals')}
              onAddGoal={onAddGoal}
            />
          </div>
          
          {/* Right Column: Next Actions & Quick Actions */}
          <div className="space-y-6">
            {/* Next Actions */}
            <NextActions
              userType={userType || null}
              userData={userData}
              goals={goals}
              lastActions={lastActions}
              onActionClick={(action) => onStartAction?.(action)}
            />
            
            {/* Quick Action Buttons */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleQuickAction('update_budget')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>💰</span> Update Budget
                </button>
                
                <button
                  onClick={() => handleQuickAction('add_goal')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>🎯</span> Add Goal
                </button>
                
                <button
                  onClick={() => handleQuickAction('check_in')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>✨</span> Check In
                </button>
                
                <button
                  onClick={() => handleQuickAction('chat')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>💬</span> Chat with Aureus
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section: Recent Wins */}
        <div className="grid grid-cols-1 gap-6">
          <RecentWins
            wins={wins}
            onWinClick={(win) => onNavigate?.('wins')}
            onAddWin={() => onNavigate?.('wins')}
          />
        </div>
        
        {/* Motivational Section */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-6 text-center">
          <p className="text-lg text-white mb-2">
            💡 <span className="font-semibold">Pro Tip:</span>
          </p>
          <p className="text-gray-300 mb-4">
            {userType === 'homebuyer' && 'Increase your monthly savings by just 10% and you\'ll reach your home deposit goal 1 year faster!'}
            {userType === 'wealth_builder' && 'Start with one passive income stream this month. Compound growth does the heavy lifting from there.'}
            {userType === 'debt_fighter' && 'Every extra payment you make saves you thousands in interest. You\'re closer than you think!'}
            {userType === 'income_maximizer' && 'Your income growth compounds. A 5% annual increase becomes 28% over 5 years!'}
          </p>
          <button
            onClick={() => onNavigate?.('chat')}
            className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
          >
            Ask Aureus →
          </button>
        </div>
      </div>
    </div>
  )
}
