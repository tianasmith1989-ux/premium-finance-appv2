/**
 * RecentWins Component
 * Displays recent financial wins and achievements to motivate users
 * 
 * Usage:
 * <RecentWins 
 *   wins={wins}
 *   onWinClick={(win) => handleWinClick(win)}
 * />
 */

import React from 'react'

interface Win {
  id: string
  title: string
  emoji: string
  description?: string
  date: string
  impact?: string
  category?: 'savings' | 'debt' | 'investment' | 'milestone' | 'streak'
}

interface RecentWinsProps {
  wins?: Win[]
  onWinClick?: (win: Win) => void
  onAddWin?: () => void
}

export default function RecentWins({
  wins = [],
  onWinClick,
  onAddWin
}: RecentWinsProps) {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysAgo === 0) return 'Today'
    if (daysAgo === 1) return 'Yesterday'
    if (daysAgo < 7) return `${daysAgo} days ago`
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`
    if (daysAgo < 365) return `${Math.floor(daysAgo / 30)} months ago`
    return `${Math.floor(daysAgo / 365)} years ago`
  }
  
  const getImpactColor = (category?: string) => {
    switch (category) {
      case 'savings':
        return 'text-green-400'
      case 'debt':
        return 'text-emerald-400'
      case 'investment':
        return 'text-purple-400'
      case 'milestone':
        return 'text-blue-400'
      case 'streak':
        return 'text-orange-400'
      default:
        return 'text-gray-400'
    }
  }
  
  // Default wins if none provided
  const defaultWins: Win[] = [
    {
      id: '1',
      title: 'Saved $500 extra this month',
      emoji: '💰',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      impact: '+$500',
      category: 'savings'
    },
    {
      id: '2',
      title: 'Paid off credit card',
      emoji: '🎉',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      impact: '$0 balance',
      category: 'debt'
    },
    {
      id: '3',
      title: 'Opened high-interest savings account',
      emoji: '🏦',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      impact: '5.5% APY',
      category: 'investment'
    }
  ]
  
  const displayWins = wins.length > 0 ? wins : defaultWins
  
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Wins</h3>
        <span className="text-2xl">🏆</span>
      </div>
      
      <div className="space-y-3">
        {displayWins.slice(0, 3).map((win) => (
          <button
            key={win.id}
            onClick={() => onWinClick?.(win)}
            className="w-full text-left group p-4 bg-gradient-to-r from-slate-700/50 to-slate-700/30 hover:from-slate-700 hover:to-slate-700/50 rounded-lg transition-all duration-200 border border-slate-600 hover:border-slate-500"
          >
            {/* Win Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{win.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {win.title}
                  </p>
                  {win.description && (
                    <p className="text-xs text-gray-400 mt-1">{win.description}</p>
                  )}
                </div>
              </div>
              
              {/* Impact Badge */}
              {win.impact && (
                <span className={`text-sm font-bold whitespace-nowrap ml-2 ${getImpactColor(win.category)}`}>
                  {win.impact}
                </span>
              )}
            </div>
            
            {/* Date */}
            <div className="flex items-center justify-between pl-11">
              <span className="text-xs text-gray-500">{formatDate(win.date)}</span>
              <span className="text-xs text-blue-400 group-hover:text-blue-300 font-medium">
                View →
              </span>
            </div>
          </button>
        ))}
      </div>
      
      {/* View All & Add Buttons */}
      <div className="flex gap-2 mt-6 pt-4 border-t border-slate-600">
        {displayWins.length > 3 && (
          <button className="flex-1 px-3 py-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
            View All Wins ({displayWins.length})
          </button>
        )}
        <button
          onClick={onAddWin}
          className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-colors"
        >
          + Log Win
        </button>
      </div>
      
      {/* Motivational Message */}
      <div className="mt-4 p-3 bg-blue-900/30 border border-blue-800 rounded-lg">
        <p className="text-sm text-blue-300">
          💡 <span className="font-semibold">Keep it up!</span> You're making great progress. Every small win adds up!
        </p>
      </div>
    </div>
  )
}

