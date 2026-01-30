'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

// ... (all your existing interfaces remain the same)

export default function Dashboard() {
  // ... (all your existing state and hooks remain the same)
  
  // Add these new states for the goal calculator
  const [goalCalculator, setGoalCalculator] = useState({
    targetAmount: '',
    currentAmount: '',
    monthlyContribution: '',
    interestRate: '',
    years: ''
  })
  const [calculatorResult, setCalculatorResult] = useState<{
    months: number;
    totalMonths: number;
    futureValue: number;
    totalContributed: number;
    interestEarned: number;
  } | null>(null)
  const [calculating, setCalculating] = useState(false)

  // ... (all your existing code remains the same until the askBudgetCoach function)

  // Add this new function for the goal calculator
  const calculateGoal = () => {
    setCalculating(true)
    
    // Parse inputs with defaults
    const target = parseFloat(goalCalculator.targetAmount || '0')
    const current = parseFloat(goalCalculator.currentAmount || '0')
    const monthly = parseFloat(goalCalculator.monthlyContribution || '0')
    const rate = parseFloat(goalCalculator.interestRate || '0') / 100 / 12 // Monthly rate
    const years = parseFloat(goalCalculator.years || '0')
    
    if (target <= 0 || monthly <= 0) {
      setCalculatorResult(null)
      setCalculating(false)
      alert('Please enter target amount and monthly contribution')
      return
    }
    
    // Calculate months needed to reach target
    let monthsNeeded = 0
    let futureValue = current
    let totalContributed = current
    
    // If no interest, simple calculation
    if (rate <= 0) {
      monthsNeeded = Math.ceil((target - current) / monthly)
      futureValue = current + (monthsNeeded * monthly)
      totalContributed = current + (monthsNeeded * monthly)
    } else {
      // With compound interest
      let months = 0
      let fv = current
      while (fv < target && months < 1200) { // Cap at 100 years
        months++
        fv = (fv + monthly) * (1 + rate)
      }
      monthsNeeded = months
      futureValue = fv
      
      // Calculate total contributed and interest earned
      totalContributed = current + (monthsNeeded * monthly)
    }
    
    // Calculate with time constraint if years provided
    let totalMonths = monthsNeeded
    if (years > 0) {
      totalMonths = years * 12
      // Calculate future value with given time
      let fv = current
      for (let i = 0; i < totalMonths; i++) {
        fv = (fv + monthly) * (1 + rate)
      }
      futureValue = fv
      totalContributed = current + (totalMonths * monthly)
      interestEarned = futureValue - totalContributed
    }
    
    const interestEarned = futureValue - totalContributed
    
    setCalculatorResult({
      months: monthsNeeded,
      totalMonths: years > 0 ? years * 12 : monthsNeeded,
      futureValue,
      totalContributed,
      interestEarned
    })
    
    setCalculating(false)
  }

  // Add a function to calculate months to goal for existing goals
  const calculateMonthsToGoal = (goal: Goal) => {
    const target = parseFloat(goal.target || '0')
    const saved = parseFloat(goal.saved || '0')
    const payment = goal.paymentAmount ? parseFloat(goal.paymentAmount) : calculateGoalPayment(goal)
    
    if (target <= 0 || payment <= 0 || saved >= target) return 0
    
    const remaining = target - saved
    return Math.ceil(remaining / payment)
  }

  // ... (rest of your existing functions remain the same)

  // In your JSX, add the goal calculator section to the Goals card
  // Here's what to add to your existing Goals section:

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      {/* ... (all your existing JSX remains the same until the Goals section) */}
      
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* ... (all your existing dashboard content remains the same until the Goals card) */}
          
          <div style={cardStyle}>
            <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>🎯 Savings Goals</h2>
            
            {/* ADD THIS NEW CALCULATOR SECTION */}
            <div style={{ marginBottom: '30px', padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', border: '2px solid ' + theme.purple }}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.purple, fontSize: '18px' }}>📊 Goal Calculator</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Target Amount ($)</label>
                  <input 
                    type="number" 
                    placeholder="5000" 
                    value={goalCalculator.targetAmount}
                    onChange={(e) => setGoalCalculator({...goalCalculator, targetAmount: e.target.value})}
                    style={{ ...inputStyle, width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Already Saved ($)</label>
                  <input 
                    type="number" 
                    placeholder="1000" 
                    value={goalCalculator.currentAmount}
                    onChange={(e) => setGoalCalculator({...goalCalculator, currentAmount: e.target.value})}
                    style={{ ...inputStyle, width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Monthly Contribution ($)</label>
                  <input 
                    type="number" 
                    placeholder="200" 
                    value={goalCalculator.monthlyContribution}
                    onChange={(e) => setGoalCalculator({...goalCalculator, monthlyContribution: e.target.value})}
                    style={{ ...inputStyle, width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Annual Interest Rate (%)</label>
                  <input 
                    type="number" 
                    placeholder="5" 
                    step="0.1"
                    value={goalCalculator.interestRate}
                    onChange={(e) => setGoalCalculator({...goalCalculator, interestRate: e.target.value})}
                    style={{ ...inputStyle, width: '100%' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Timeframe (Years, optional)</label>
                  <input 
                    type="number" 
                    placeholder="Leave blank to calculate months needed" 
                    value={goalCalculator.years}
                    onChange={(e) => setGoalCalculator({...goalCalculator, years: e.target.value})}
                    style={{ ...inputStyle, width: '100%' }}
                  />
                </div>
              </div>
              <button 
                onClick={calculateGoal} 
                disabled={calculating}
                style={{ ...btnPurple, padding: '12px 24px', fontSize: '14px', width: '100%' }}
              >
                {calculating ? 'Calculating...' : 'Calculate Goal'}
              </button>
              
              {calculatorResult && (
                <div style={{ marginTop: '20px', padding: '16px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '10px' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: theme.success, fontSize: '16px' }}>Calculation Results</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    <div>
                      <div style={{ color: theme.textMuted, fontSize: '11px' }}>Months to Goal</div>
                      <div style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold' }}>
                        {calculatorResult.months} months
                      </div>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '2px' }}>
                        ({Math.floor(calculatorResult.months / 12)} years {calculatorResult.months % 12} months)
                      </div>
                    </div>
                    <div>
                      <div style={{ color: theme.textMuted, fontSize: '11px' }}>Future Value</div>
                      <div style={{ color: theme.success, fontSize: '18px', fontWeight: 'bold' }}>
                        ${calculatorResult.futureValue.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: theme.textMuted, fontSize: '11px' }}>Total Contributed</div>
                      <div style={{ color: theme.text, fontSize: '14px', fontWeight: 600 }}>
                        ${calculatorResult.totalContributed.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: theme.textMuted, fontSize: '11px' }}>Interest Earned</div>
                      <div style={{ color: theme.purple, fontSize: '14px', fontWeight: 600 }}>
                        ${calculatorResult.interestEarned.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  {goalCalculator.years && parseFloat(goalCalculator.years) > 0 && (
                    <div style={{ marginTop: '12px', padding: '10px', background: darkMode ? '#334155' : '#fff', borderRadius: '8px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '11px' }}>With {goalCalculator.years} years timeframe:</div>
                      <div style={{ color: theme.text, fontSize: '12px' }}>
                        You'll have <strong>${calculatorResult.futureValue.toFixed(2)}</strong> after {calculatorResult.totalMonths} months
                        {calculatorResult.futureValue >= parseFloat(goalCalculator.targetAmount || '0') ? 
                          <span style={{ color: theme.success }}> ✓ Goal Achieved!</span> : 
                          <span style={{ color: theme.warning }}> ✗ ${(parseFloat(goalCalculator.targetAmount || '0') - calculatorResult.futureValue).toFixed(2)} short</span>
                        }
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* END OF CALCULATOR SECTION */}
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
              {/* ... (your existing goal input fields remain the same) */}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {goals.length === 0 ? <div style={{ color: theme.textMuted, textAlign: 'center', padding: '20px' }}>No goals added</div> : goals.map(goal => {
                const progress = (parseFloat(goal.saved || '0') / parseFloat(goal.target || '1')) * 100
                const payment = goal.paymentAmount ? parseFloat(goal.paymentAmount) : calculateGoalPayment(goal)
                const isComplete = progress >= 100
                const monthsToGoal = calculateMonthsToGoal(goal)
                const deadlineDate = goal.deadline ? new Date(goal.deadline) : null
                const today = new Date()
                const monthsUntilDeadline = deadlineDate ? 
                  Math.max(0, Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44))) : 
                  null
                
                return (
                  <div key={goal.id} style={{ padding: '16px', background: isComplete ? (darkMode ? '#1e3a32' : '#f0fdf4') : (darkMode ? '#334155' : '#faf5ff'), borderRadius: '12px', border: isComplete ? '2px solid ' + theme.success : '1px solid ' + theme.border }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <div style={{ color: theme.text, fontWeight: 600, fontSize: '16px' }}>{isComplete ? '✅ ' : '🎯 '}{goal.name}</div>
                        <div style={{ color: theme.textMuted, fontSize: '13px' }}>${parseFloat(goal.saved || '0').toFixed(2)} / ${parseFloat(goal.target || '0').toFixed(2)}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {/* ... (your existing buttons remain the same) */}
                      </div>
                    </div>
                    
                    <div style={{ width: '100%', height: '10px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '5px', overflow: 'hidden', marginBottom: '8px' }}>
                      <div style={{ width: Math.min(progress, 100) + '%', height: '100%', background: isComplete ? theme.success : 'linear-gradient(to right, ' + theme.purple + ', #7c3aed)' }} />
                    </div>
                    
                    {/* ADD MONTH COUNTDOWN SECTION */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: isComplete ? theme.success : theme.textMuted, fontSize: '12px', fontWeight: 600 }}>
                          {isComplete ? '🎉 Goal Complete!' : progress.toFixed(1) + '%'}
                        </span>
                        
                        {!isComplete && payment > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: theme.purple, fontSize: '11px' }}>📅 ${payment.toFixed(2)}/{goal.savingsFrequency}</span>
                            <div style={{ padding: '2px 6px', background: theme.purple + '20', borderRadius: '4px', fontSize: '10px', color: theme.purple, fontWeight: 600 }}>
                              {monthsToGoal} {monthsToGoal === 1 ? 'month' : 'months'} to go
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {goal.deadline && !isComplete && (
                        <div style={{ padding: '4px 8px', background: monthsUntilDeadline && monthsUntilDeadline <= 3 ? theme.warning + '20' : theme.accent + '20', borderRadius: '4px' }}>
                          <div style={{ fontSize: '10px', color: theme.textMuted }}>Deadline</div>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: monthsUntilDeadline && monthsUntilDeadline <= 3 ? theme.warning : theme.accent }}>
                            {deadlineDate?.toLocaleDateString()} 
                            {monthsUntilDeadline && monthsUntilDeadline > 0 && (
                              <span style={{ marginLeft: '4px' }}>
                                ({monthsUntilDeadline} {monthsUntilDeadline === 1 ? 'month' : 'months'} left)
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* ADD PROGRESS DETAILS */}
                    {!isComplete && (
                      <div style={{ marginTop: '8px', padding: '8px', background: darkMode ? '#2d3748' : '#f1f5f9', borderRadius: '6px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '10px' }}>
                          <div>
                            <div style={{ color: theme.textMuted }}>Remaining</div>
                            <div style={{ color: theme.text, fontWeight: 600 }}>
                              ${(parseFloat(goal.target || '0') - parseFloat(goal.saved || '0')).toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: theme.textMuted }}>Monthly Needed</div>
                            <div style={{ color: theme.purple, fontWeight: 600 }}>
                              ${payment.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: theme.textMuted }}>Est. Completion</div>
                            <div style={{ color: theme.success, fontWeight: 600 }}>
                              {monthsToGoal > 0 ? 
                                `${Math.floor(monthsToGoal / 12)}y ${monthsToGoal % 12}m` : 
                                'Increase payments'
                              }
                            </div>
                          </div>
                        </div>
                        
                        {goal.deadline && monthsUntilDeadline && monthsToGoal > monthsUntilDeadline && (
                          <div style={{ marginTop: '6px', padding: '4px 6px', background: theme.warning + '20', borderRadius: '4px', fontSize: '10px', color: theme.warning }}>
                            ⚠️ You're ${((payment * monthsToGoal) - (payment * monthsUntilDeadline)).toFixed(2)} short of deadline.
                            Need ${((parseFloat(goal.target || '0') - parseFloat(goal.saved || '0')) / monthsUntilDeadline).toFixed(2)}/month to hit target.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* ... (rest of your dashboard content remains the same) */}
        </div>
      )}
      
      {/* ... (rest of your tabs remain the same) */}
    </div>
  )
}
