/**
 * GoalProgress Component
 * Displays all user goals with progress bars and timelines
 * 
 * Usage:
 * <GoalProgress 
 *   goals={goals}
 *   onGoalClick={(goal) => handleGoalClick(goal)}
 * />
 */

import React from 'react'

interface Goal {
  id: string
  name: string
  emoji?: string
  current: number
  target: number
  deadline?: string
  category?: string
  description?: string
}

interface GoalProgressProps {
  goals: Goal[]
  onGoalClick?: (goal: Goal) => void
  onAddGoal?: () => void
}

export default function GoalProgress({
  goals = [],
  onGoalClick,
  onAddGoal
}: GoalProgressProps) {
  
  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }
  
  const getTimeRemaining = (deadline: string | undefined) => {
    if (!deadline) return null
    
    const now = new Date()
    const end = new Date(deadline)
    const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysRemaining < 0) return 'Overdue'
    if (daysRemaining === 0) return 'Due today'
    if (daysRemaining === 1) return '1 day left'
    if (daysRemaining < 30) return `${daysRemaining} days`
    if (daysRemaining < 365) return `${Math.floor(daysRemaining / 30)} months`
    return `${Math.floor(daysRemaining / 365)} years`
  }
  
  const getGoalColor = (category?: string) => {
    switch (category) {
      case 'savings':
        return 'from-green-400 to-emerald-500'
      case 'debt':
        return 'from-red-400 to-rose-500'
      case 'investment':
        return 'from-purple-400 to-pink-500'
      case 'income':
        return 'from-yellow-400 to-orange-500'
      default:
        return 'from-blue-400 to-cyan-500'
    }
  }
  
  const getGoalEmoji = (name: string, emoji?: string) => {
    if (emoji) return emoji
    if (name.toLowerCase().includes('home') || name.toLowerCase().includes('deposit')) return '🏠'
    if (name.toLowerCase().includes('debt') || name.toLowerCase().includes('payoff')) return '💳'
    if (name.toLowerCase().includes('passive') || name.toLowerCase().includes('income')) return '💰'
    if (name.toLowerCase().includes('retirement') || name.toLowerCase().includes('super')) return '🏖️'
    if (name.toLowerCase().includes('car') || name.toLowerCase().includes('vehicle')) return '🚗'
    if (name.toLowerCase().includes('vacation') || name.toLowerCase().includes('travel')) return '✈️'
    return '🎯'
  }
  
  if (goals.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Your Goals</h3>
          <span className="text-2xl">🎯</span>
        </div>
        
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">No goals yet. Create your first goal to get started!</p>
          <button
            onClick={onAddGoal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            + Add Your First Goal
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Your Goals</h3>
        <span className="text-2xl">🎯</span>
      </div>
      
      <div className="space-y-4">
        {goals.slice(0, 3).map((goal) => {
          const progress = getProgressPercentage(goal.current, goal.target)
          const timeRemaining = getTimeRemaining(goal.deadline)
          const colorClass = getGoalColor(goal.category)
          const emoji = getGoalEmoji(goal.name, goal.emoji)
          
          return (
            <div
              key={goal.id}
              onClick={() => onGoalClick?.(goal)}
              className="cursor-pointer group p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all duration-200"
            >
              {/* Goal Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {goal.name}
                    </p>
                    {goal.description && (
                      <p className="text-xs text-gray-400 mt-1">{goal.description}</p>
                    )}
                  </div>
                </div>
                {timeRemaining && (
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    timeRemaining.includes('Overdue') 
                      ? 'bg-red-900 text-red-200'
                      : 'bg-slate-600 text-gray-200'
                  }`}>
                    {timeRemaining}
                  </span>
                )}
              </div>
              
              {/* Progress Info */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-white">${goal.current.toLocaleString()}</span>
                    <span className="text-gray-400"> / ${goal.target.toLocaleString()}</span>
                  </p>
                </div>
                <p className="text-sm font-semibold text-white ml-4">{progress.toFixed(0)}%</p>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-300 rounded-full`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      
      {/* View All & Add Buttons */}
      <div className="flex gap-2 mt-6 pt-4 border-t border-slate-600">
        {goals.length > 3 && (
          <button className="flex-1 px-3 py-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
            View All Goals ({goals.length})
          </button>
        )}
        <button
          onClick={onAddGoal}
          className="flex-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          + Add Goal
        </button>
      </div>
    </div>
  )
}

