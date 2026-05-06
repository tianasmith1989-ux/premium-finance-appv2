/**
 * FinancialSnapshot Component
 * Displays the user's primary financial metric based on their user type
 * 
 * Usage:
 * <FinancialSnapshot 
 *   userType="homebuyer"
 *   userData={userData}
 *   goals={goals}
 * />
 */

import React from 'react'

interface FinancialSnapshotProps {
  userType: 'homebuyer' | 'wealth_builder' | 'debt_fighter' | 'income_maximizer' | null
  userData: {
    monthlyIncome?: number
    monthlyExpenses?: number
    currentAge?: number
    totalDebt?: number
    totalAssets?: number
    savings?: number
  }
  goals?: any[]
  trends?: {
    monthlyGrowth?: number
    yearlyGrowth?: number
  }
}

export default function FinancialSnapshot({
  userType,
  userData,
  goals = [],
  trends = {}
}: FinancialSnapshotProps) {
  
  // Calculate metrics
  const monthlyIncome = userData.monthlyIncome || 0
  const monthlyExpenses = userData.monthlyExpenses || 0
  const monthlySurplus = monthlyIncome - monthlyExpenses
  const totalAssets = userData.totalAssets || 0
  const totalDebt = userData.totalDebt || 0
  const netWorth = totalAssets - totalDebt
  const savingsRate = monthlyIncome > 0 ? ((monthlySurplus / monthlyIncome) * 100).toFixed(1) : '0'
  const monthlyTrend = trends.monthlyGrowth || 0
  
  // Get primary goal for homebuyer
  const depositGoal = goals.find((g: any) => g.name?.toLowerCase().includes('deposit') || g.name?.toLowerCase().includes('home'))
  const debtGoal = goals.find((g: any) => g.name?.toLowerCase().includes('debt') || g.name?.toLowerCase().includes('payoff'))
  
  // Render based on user type
  const renderSnapshot = () => {
    switch (userType) {
      case 'homebuyer':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Deposit Progress</p>
              <p className="text-4xl font-bold text-white mb-2">
                ${depositGoal?.current ? depositGoal.current.toLocaleString() : '0'}
              </p>
              <p className="text-sm text-gray-300">
                of ${depositGoal?.target ? depositGoal.target.toLocaleString() : '0'} target
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${depositGoal ? Math.min((depositGoal.current / depositGoal.target) * 100, 100) : 0}%`
                }}
              />
            </div>
            
            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Monthly Savings</p>
                <p className="text-xl font-bold text-green-400">${monthlySurplus.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Savings Rate</p>
                <p className="text-xl font-bold text-blue-400">{savingsRate}%</p>
              </div>
            </div>
            
            {/* Timeline */}
            {depositGoal && (
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-300">
                  At current savings: <span className="font-semibold text-green-400">
                    {monthlySurplus > 0 
                      ? `${Math.ceil((depositGoal.target - (depositGoal.current || 0)) / monthlySurplus) / 12} years`
                      : 'N/A'
                    }
                  </span>
                </p>
              </div>
            )}
          </div>
        )
      
      case 'wealth_builder':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Net Worth</p>
              <p className="text-4xl font-bold text-white mb-2">
                ${netWorth.toLocaleString()}
              </p>
              <p className={`text-sm ${monthlyTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {monthlyTrend >= 0 ? '↑' : '↓'} ${Math.abs(monthlyTrend).toLocaleString()} this month
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full"
                style={{ width: '65%' }}
              />
            </div>
            
            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Total Assets</p>
                <p className="text-xl font-bold text-purple-400">${totalAssets.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Total Debt</p>
                <p className="text-xl font-bold text-red-400">${totalDebt.toLocaleString()}</p>
              </div>
            </div>
            
            {/* Growth Rate */}
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-300">
                Annual growth: <span className="font-semibold text-green-400">
                  {((monthlyTrend * 12 / Math.max(netWorth, 1)) * 100).toFixed(1)}%
                </span>
              </p>
            </div>
          </div>
        )
      
      case 'debt_fighter':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Debt Remaining</p>
              <p className="text-4xl font-bold text-white mb-2">
                ${totalDebt.toLocaleString()}
              </p>
              <p className="text-sm text-gray-300">
                {debtGoal?.deadline ? `Debt-free by ${new Date(debtGoal.deadline).toLocaleDateString()}` : 'Set a goal to see timeline'}
              </p>
            </div>
            
            {/* Progress Bar (Inverse - showing paid off) */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                style={{
                  width: `${debtGoal ? Math.min(((debtGoal.target - (debtGoal.current || 0)) / debtGoal.target) * 100, 100) : 0}%`
                }}
              />
            </div>
            
            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Monthly Payment</p>
                <p className="text-xl font-bold text-green-400">${(monthlySurplus).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Interest Saved</p>
                <p className="text-xl font-bold text-emerald-400">$12,400</p>
              </div>
            </div>
            
            {/* Payoff Timeline */}
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-300">
                Payoff timeline: <span className="font-semibold text-green-400">
                  {monthlySurplus > 0 
                    ? `${Math.ceil(totalDebt / monthlySurplus)} months`
                    : 'Increase monthly payment'
                  }
                </span>
              </p>
            </div>
          </div>
        )
      
      case 'income_maximizer':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Annual Income</p>
              <p className="text-4xl font-bold text-white mb-2">
                ${(monthlyIncome * 12).toLocaleString()}
              </p>
              <p className={`text-sm ${monthlyTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {monthlyTrend >= 0 ? '↑' : '↓'} ${Math.abs(monthlyTrend * 12).toLocaleString()} YoY
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                style={{ width: '55%' }}
              />
            </div>
            
            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Monthly Income</p>
                <p className="text-xl font-bold text-yellow-400">${monthlyIncome.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Growth Rate</p>
                <p className="text-xl font-bold text-orange-400">
                  {((monthlyTrend * 12 / Math.max(monthlyIncome * 12, 1)) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            
            {/* Income Goal */}
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-300">
                Goal: <span className="font-semibold text-green-400">$250,000/year</span>
              </p>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="space-y-4">
            <p className="text-gray-400">Complete onboarding to see your financial snapshot</p>
          </div>
        )
    }
  }
  
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Your Financial Snapshot</h3>
        <div className="text-2xl">
          {userType === 'homebuyer' && '🏠'}
          {userType === 'wealth_builder' && '💰'}
          {userType === 'debt_fighter' && '💳'}
          {userType === 'income_maximizer' && '📈'}
        </div>
      </div>
      
      {renderSnapshot()}
    </div>
  )
}
