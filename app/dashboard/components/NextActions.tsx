/**
 * NextActions Component
 * Displays contextual next actions based on user type and data completeness
 * 
 * Usage:
 * <NextActions 
 *   userType="homebuyer"
 *   userData={userData}
 *   goals={goals}
 *   onActionClick={(action) => handleActionClick(action)}
 * />
 */

import React, { useMemo } from 'react'

interface Action {
  id: string
  title: string
  description: string
  timeEstimate: string
  icon: string
  priority: 'high' | 'medium' | 'low'
  actionType: string
  lastCompleted?: string
}

interface NextActionsProps {
  userType: 'homebuyer' | 'wealth_builder' | 'debt_fighter' | 'income_maximizer' | null
  userData?: {
    monthlyIncome?: number
    monthlyExpenses?: number
    totalDebt?: number
    incomeStreams?: any[]
    expenses?: any[]
  }
  goals?: any[]
  lastActions?: Record<string, string>
  onActionClick?: (action: Action) => void
}

export default function NextActions({
  userType,
  userData = {},
  goals = [],
  lastActions = {},
  onActionClick
}: NextActionsProps) {
  
  const daysSince = (dateString?: string) => {
    if (!dateString) return Infinity
    const date = new Date(dateString)
    const now = new Date()
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  }
  
  const calculateActions = useMemo(() => {
    const actions: Action[] = []
    
    // Priority 1: Critical data gaps
    if (!userData.monthlyIncome || userData.monthlyIncome === 0) {
      actions.push({
        id: 'add-income',
        title: '💰 Add Your Income',
        description: 'Let\'s start with your income so we can calculate your savings potential',
        timeEstimate: '5 min',
        icon: '💰',
        priority: 'high',
        actionType: 'add_income',
        lastCompleted: lastActions.addIncome
      })
    }
    
    if (!userData.expenses || userData.expenses.length === 0) {
      actions.push({
        id: 'add-expenses',
        title: '📊 Add Your Expenses',
        description: 'Track your monthly spending to see where your money goes',
        timeEstimate: '10 min',
        icon: '📊',
        priority: 'high',
        actionType: 'add_expenses',
        lastCompleted: lastActions.addExpenses
      })
    }
    
    // Priority 2: Time-based actions
    const daysSinceUpdate = daysSince(lastActions.budgetUpdate)
    if (daysSinceUpdate > 14 || daysSinceUpdate === Infinity) {
      actions.push({
        id: 'update-budget',
        title: '⏱️ Update Your Budget',
        description: daysSinceUpdate === Infinity 
          ? 'Set up your budget to track progress'
          : `Last updated ${daysSinceUpdate} days ago`,
        timeEstimate: '5 min',
        icon: '⏱️',
        priority: 'high',
        actionType: 'update_budget',
        lastCompleted: lastActions.budgetUpdate
      })
    }
    
    // Priority 3: Goal-based actions
    if (goals.length === 0) {
      actions.push({
        id: 'create-goal',
        title: '🎯 Create Your First Goal',
        description: userType === 'homebuyer' 
          ? 'Set your home deposit target and timeline'
          : userType === 'wealth_builder'
          ? 'Set your net worth or passive income goal'
          : userType === 'debt_fighter'
          ? 'Set your debt-free date'
          : 'Set your income growth target',
        timeEstimate: '3 min',
        icon: '🎯',
        priority: 'high',
        actionType: 'create_goal',
        lastCompleted: lastActions.createGoal
      })
    }
    
    // Priority 4: Opportunity-based actions
    switch (userType) {
      case 'homebuyer':
        if (daysSince(lastActions.reviewSavings) > 30) {
          actions.push({
            id: 'review-savings',
            title: '🏦 Review Savings Strategy',
            description: 'Find the best high-interest savings account for your deposit',
            timeEstimate: '10 min',
            icon: '🏦',
            priority: 'medium',
            actionType: 'review_savings',
            lastCompleted: lastActions.reviewSavings
          })
        }
        break
      
      case 'wealth_builder':
        if (daysSince(lastActions.startQuest) > 30) {
          actions.push({
            id: 'start-quest',
            title: '📈 Start Passive Income Quest',
            description: 'Earn $50-200/quarter from dividend ETFs',
            timeEstimate: '1 hour',
            icon: '📈',
            priority: 'medium',
            actionType: 'start_quest',
            lastCompleted: lastActions.startQuest
          })
        }
        break
      
      case 'debt_fighter':
        if (daysSince(lastActions.reviewPayoff) > 30) {
          actions.push({
            id: 'review-payoff',
            title: '💳 Review Payoff Strategy',
            description: 'Optimize your debt payoff plan to save on interest',
            timeEstimate: '5 min',
            icon: '💳',
            priority: 'medium',
            actionType: 'review_payoff',
            lastCompleted: lastActions.reviewPayoff
          })
        }
        break
      
      case 'income_maximizer':
        if (daysSince(lastActions.reviewIncome) > 30) {
          actions.push({
            id: 'review-income',
            title: '📈 Review Income Streams',
            description: 'Explore side hustles and passive income opportunities',
            timeEstimate: '15 min',
            icon: '📈',
            priority: 'medium',
            actionType: 'review_income',
            lastCompleted: lastActions.reviewIncome
          })
        }
        break
    }
    
    // Priority 5: Regular check-in
    const daysSinceCheckIn = daysSince(lastActions.checkIn)
    if (daysSinceCheckIn > 7 || daysSinceCheckIn === Infinity) {
      actions.push({
        id: 'check-in',
        title: '✨ Daily Check-in',
        description: 'How are you feeling about your finances today?',
        timeEstimate: '2 min',
        icon: '✨',
        priority: 'medium',
        actionType: 'check_in',
        lastCompleted: lastActions.checkIn
      })
    }
    
    return actions.slice(0, 3) // Return top 3 actions
  }, [userType, userData, goals, lastActions])
  
  if (calculateActions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Next Actions</h3>
          <span className="text-2xl">✅</span>
        </div>
        
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">You're all caught up! 🎉</p>
          <p className="text-sm text-gray-500">Keep monitoring your progress and check in regularly</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Next 3 Actions</h3>
        <span className="text-2xl">✅</span>
      </div>
      
      <div className="space-y-3">
        {calculateActions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => onActionClick?.(action)}
            className="w-full text-left group p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all duration-200 border border-slate-600 hover:border-slate-500"
          >
            {/* Action Number & Priority */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full">
                  {index + 1}
                </span>
                <span className="text-xl">{action.icon}</span>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                action.priority === 'high'
                  ? 'bg-red-900 text-red-200'
                  : action.priority === 'medium'
                  ? 'bg-yellow-900 text-yellow-200'
                  : 'bg-slate-600 text-gray-200'
              }`}>
                {action.priority.toUpperCase()}
              </span>
            </div>
            
            {/* Title & Description */}
            <p className="font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">
              {action.title}
            </p>
            <p className="text-sm text-gray-400 mb-3">{action.description}</p>
            
            {/* Time Estimate & CTA */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">⏱️ {action.timeEstimate}</span>
              <span className="text-sm text-blue-400 group-hover:text-blue-300 font-medium">
                Start →
              </span>
            </div>
          </button>
        ))}
      </div>
      
      {/* View All Actions Link */}
      <button className="w-full mt-4 pt-4 border-t border-slate-600 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
        View All Actions
      </button>
    </div>
  )
}

