'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  // App Mode Selection
  const [appMode, setAppMode] = useState<'budget' | 'trading' | null>(null)
  const [showModeSelector, setShowModeSelector] = useState(true)
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'path' | 'trading'>('dashboard')
  const [darkMode, setDarkMode] = useState(true)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [tradingCalendarMonth, setTradingCalendarMonth] = useState(new Date())
  
  const [incomeStreams, setIncomeStreams] = useState<any[]>([])
  const [newIncome, setNewIncome] = useState({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0] })
  
  const [expenses, setExpenses] = useState<any[]>([])
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', frequency: 'monthly', dueDate: new Date().toISOString().split('T')[0] })
  
  const [debts, setDebts] = useState<any[]>([])
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: new Date().toISOString().split('T')[0] })
  const [payoffMethod, setPayoffMethod] = useState<'snowball' | 'avalanche'>('avalanche')
  
  const [goals, setGoals] = useState<any[]>([])
  const [newGoal, setNewGoal] = useState({ name: '', target: '', saved: '0', deadline: '', savingsFrequency: 'monthly', startDate: new Date().toISOString().split('T')[0], paymentAmount: '' })
  const [extraGoalPayment, setExtraGoalPayment] = useState('')
  const [selectedGoalForExtra, setSelectedGoalForExtra] = useState<number | null>(null)
  
  const [assets, setAssets] = useState<any[]>([])
  const [newAsset, setNewAsset] = useState({ name: '', value: '', type: 'savings' })
  const [liabilities, setLiabilities] = useState<any[]>([])
  const [newLiability, setNewLiability] = useState({ name: '', value: '', type: 'loan' })
  
  const [paidOccurrences, setPaidOccurrences] = useState<Set<string>>(new Set())
  
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [chatInput, setChatInput] = useState('')
  const [isAskingCoach, setIsAskingCoach] = useState(false)
  
  const [trades, setTrades] = useState<any[]>([])
  const [newTrade, setNewTrade] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    instrument: '', 
    direction: 'long', 
    entryPrice: '', 
    exitPrice: '', 
    profitLoss: '', 
    notes: '' 
  })

  const [expandedDay, setExpandedDay] = useState<{day: number, items: any[]} | null>(null)
  const [debtExtraPayment, setDebtExtraPayment] = useState<{[key: number]: {amount: string, frequency: string}}>({})
  const [showExtraInput, setShowExtraInput] = useState<number | null>(null)

  // Goal Calculator state
  const [goalCalculator, setGoalCalculator] = useState({ targetAmount: '', currentAmount: '', monthlyContribution: '', interestRate: '', years: '' })
  const [calculatorResult, setCalculatorResult] = useState<any>(null)
  const [calculating, setCalculating] = useState(false)

  // Forex/CFD Prop Calculator state
  const [forexProp, setForexProp] = useState({
    phase: 'phase1',
    accountSize: '100000',
    phase1DailyDD: '5',
    phase1MaxDD: '10',
    phase1Target: '10',
    phase1MinDays: '4',
    phase1MaxDays: '30',
    phase2DailyDD: '5',
    phase2MaxDD: '10',
    phase2Target: '5',
    phase2MinDays: '4',
    phase2MaxDays: '60',
    fundedDailyDD: '5',
    fundedMaxDD: '10',
    currentBalance: '100000',
    tradingDays: '0',
    riskPerTrade: '1',
    tradesPerDay: '2',
    winRate: '55',
    avgRR: '1.5',
    profitSplit: '80'
  })
  const [forexPropResults, setForexPropResults] = useState<any>(null)

  // Futures Prop Calculator state
  const [futuresProp, setFuturesProp] = useState({
    phase: 'evaluation',
    accountSize: '50000',
    evalTrailingDD: '2500',
    evalProfitTarget: '3000',
    evalMinDays: '7',
    evalDrawdownType: 'trailing',
    paTrailingDD: '2500',
    paProfitTarget: '3000',
    paMinDays: '7',
    paDrawdownType: 'eod',
    fundedTrailingDD: '2500',
    fundedDrawdownType: 'eod',
    currentBalance: '50000',
    highWaterMark: '50000',
    tradingDays: '0',
    contractLimit: '10',
    riskPerTrade: '200',
    tradesPerDay: '3',
    winRate: '50',
    avgWin: '300',
    avgLoss: '200',
    profitSplit: '90'
  })
  const [futuresPropResults, setFuturesPropResults] = useState<any>(null)

  // Trading Calculator state
  const [tradingCalculator, setTradingCalculator] = useState({ 
    startingCapital: '10000', 
    monthlyContribution: '500', 
    returnRate: '1', 
    returnPeriod: 'daily',
    years: '0',
    months: '0',
    days: '0',
    includeDays: ['M', 'T', 'W', 'T2', 'F'], 
    reinvestRate: '100',
    riskPerTrade: '2', 
    winRate: '55', 
    riskReward: '1.5'
  })
  const [tradingResults, setTradingResults] = useState<any>(null)
  const [calculatingTrading, setCalculatingTrading] = useState(false)

  const theme = {
    bg: darkMode ? '#0f172a' : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)',
    cardBg: darkMode ? '#1e293b' : 'white',
    text: darkMode ? '#f1f5f9' : '#1e293b',
    textMuted: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#e2e8f0',
    input: darkMode ? '#334155' : '#ffffff',
    inputBorder: darkMode ? '#475569' : '#e2e8f0',
    accent: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6'
  }

  // --- Utility Functions ---
  const convertToMonthly = (amount: number, frequency: string) => {
    const a = amount || 0
    if (frequency === 'weekly') return a * (52 / 12)
    if (frequency === 'fortnightly') return a * (26 / 12)
    if (frequency === 'yearly') return a / 12
    return a
  }

  const calculateFuturesProp = () => {
    const phase = futuresProp.phase
    const accountSize = parseFloat(futuresProp.accountSize || '0')
    let trailingDD: number, profitTarget: number, minDays: number, drawdownType: string
    
    if (phase === 'evaluation') {
      trailingDD = parseFloat(futuresProp.evalTrailingDD || '0')
      profitTarget = parseFloat(futuresProp.evalProfitTarget || '0')
      minDays = parseInt(futuresProp.evalMinDays || '0')
      drawdownType = futuresProp.evalDrawdownType
    } else if (phase === 'pa') {
      trailingDD = parseFloat(futuresProp.paTrailingDD || '0')
      profitTarget = parseFloat(futuresProp.paProfitTarget || '0')
      minDays = parseInt(futuresProp.paMinDays || '0')
      drawdownType = futuresProp.paDrawdownType
    } else {
      trailingDD = parseFloat(futuresProp.fundedTrailingDD || '0')
      profitTarget = 0
      minDays = 0
      drawdownType = futuresProp.fundedDrawdownType
    }
    
    const currentBalance = parseFloat(futuresProp.currentBalance || '0')
    const highWaterMark = parseFloat(futuresProp.highWaterMark || '0')
    const tradingDays = parseInt(futuresProp.tradingDays || '0')
    const riskPerTrade = parseFloat(futuresProp.riskPerTrade || '0')
    const winRate = parseFloat(futuresProp.winRate || '0') / 100
    const avgWin = parseFloat(futuresProp.avgWin || '0')
    const avgLoss = parseFloat(futuresProp.avgLoss || '0')

    const currentProfit = currentBalance - accountSize
    const profitRemaining = phase === 'funded' ? 0 : profitTarget - currentProfit

    let drawdownThreshold: number
    if (drawdownType === 'trailing') {
      const maxBalance = Math.max(highWaterMark, currentBalance)
      drawdownThreshold = maxBalance - trailingDD
      drawdownThreshold = Math.max(drawdownThreshold, accountSize - trailingDD)
      if (highWaterMark >= accountSize + trailingDD) drawdownThreshold = accountSize
    } else {
      drawdownThreshold = accountSize - trailingDD
    }

    const drawdownRemaining = currentBalance - drawdownThreshold
    const expectancy = (winRate * avgWin) - ((1 - winRate) * avgLoss)

    setFuturesPropResults({
      phase, accountSize, trailingDD, profitTarget, currentBalance, currentProfit,
      profitRemaining, drawdownThreshold, drawdownRemaining, expectancy,
      profitProgress: phase === 'funded' ? 100 : (currentProfit / profitTarget) * 100,
      dayProgress: (tradingDays / minDays) * 100,
      safetyMargin: (drawdownRemaining / riskPerTrade).toFixed(1)
    })
  }

  // --- Financial Aggregates ---
  const monthlyIncome = incomeStreams.reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || '0'), inc.frequency), 0)
  const monthlyExpenses = expenses.reduce((sum, exp) => sum + convertToMonthly(parseFloat(exp.amount || '0'), exp.frequency), 0)
  const monthlyDebt = debts.reduce((sum, debt) => sum + convertToMonthly(parseFloat(debt.minPayment || '0'), debt.frequency), 0)
  const surplus = monthlyIncome - monthlyExpenses - monthlyDebt
  const fireNumber = (monthlyExpenses + monthlyDebt) * 12 * 25
  {payoffWithoutExtras.totalInterestPaid.toFixed(2)} interest</span></div>
                    }
                  </div>
                  {debtExtras.length > 0 && (
                    <div style={{ padding: '10px', background: darkMode ? '#1e293b' : '#f0fdf4', borderRadius: '8px', fontSize: '12px' }}>
                      <div style={{ color: theme.textMuted, marginBottom: '4px' }}>With current extras:</div>
                      {payoffWithExtras.error ? (
                        <div style={{ color: theme.danger }}>⚠️ Payment too low</div>
                      ) : (
                        <div style={{ color: theme.text }}>
                          <span style={{ fontWeight: 600, color: theme.success }}>{Math.floor(payoffWithExtras.monthsToPayoff / 12)}y {payoffWithExtras.monthsToPayoff % 12}m</span>
                          <span style={{ color: theme.danger, marginLeft: '8px' }}>${payoffWithExtras.totalInterestPaid.toFixed(2)} interest</span>
                          <div style={{ fontSize: '10px', color: theme.success, marginTop: '2px' }}>
                            Saves {(payoffWithoutExtras.monthsToPayoff - payoffWithExtras.monthsToPayoff)} months & ${(payoffWithoutExtras.totalInterestPaid - payoffWithExtras.totalInterestPaid).toFixed(0)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '12px' }}>
                  {showExtraInput === debt.id ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: darkMode ? '#1e293b' : '#f1f5f9', padding: '12px', borderRadius: '8px' }}>
                      <input 
                        type="number" 
                        placeholder="Extra $" 
                        value={currentExtra.amount} 
                        onChange={(e) => setDebtExtraPayment({...debtExtraPayment, [debt.id]: {...currentExtra, amount: e.target.value}})}
                        style={{ ...inputStyle, width: '90px' }}
                      />
                      <select 
                        value={currentExtra.frequency} 
                        onChange={(e) => setDebtExtraPayment({...debtExtraPayment, [debt.id]: {...currentExtra, frequency: e.target.value}})}
                        style={inputStyle}
                      >
                        <option value="weekly">Weekly</option>
                        <option value="fortnightly">Fortnightly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      <button onClick={() => addExtraPaymentToDebt(debt.id)} style={btnSuccess}>Save</button>
                      <button onClick={() => setShowExtraInput(null)} style={{ ...btnPrimary, background: 'transparent', color: theme.textMuted }}>Cancel</button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowExtraInput(debt.id)} 
                      style={{ background: 'transparent', border: '1px dashed ' + theme.accent, color: theme.accent, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', width: '100%', fontWeight: 600 }}
                    >
                      + Add Extra Payment to Crush This Debt Faster
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          
          <div style={{ marginTop: '16px', padding: '16px', background: 'linear-gradient(135deg, ' + theme.danger + '20, ' + theme.purple + '20)', borderRadius: '12px', border: '1px solid ' + theme.danger + '40' }}>
            <h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '16px' }}>Total Debt Summary</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: theme.textMuted }}>Total Remaining</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: theme.danger }}>${totalDebtBalance.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: theme.textMuted }}>Time to Debt Free</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: theme.text }}>
                  {calculateTotalDebtPayoff().hasError ? '---' : `${Math.floor(calculateTotalDebtPayoff().maxMonths / 12)}y ${calculateTotalDebtPayoff().maxMonths % 12}m`}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: theme.textMuted }}>Total Interest Cost</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: theme.danger }}>${calculateTotalDebtPayoff().totalInterest.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  </div>
)}

{activeTab === 'overview' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 20px 0', color: theme.accent, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>🏛️ Assets</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input type="text" placeholder="Asset Name" value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
          <input type="number" placeholder="Value" value={newAsset.value} onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })} style={{ ...inputStyle, width: '120px' }} />
          <select value={newAsset.type} onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })} style={inputStyle}>
            <option value="savings">💰 Savings</option>
            <option value="investment">📈 Investment</option>
            <option value="property">🏠 Property</option>
            <option value="other">📦 Other</option>
          </select>
          <button onClick={addAsset} style={btnPrimary}>Add</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {assets.map(asset => (
            <div key={asset.id} style={{ padding: '12px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ color: theme.text, fontWeight: 600 }}>{asset.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{asset.type}</div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: theme.success, fontWeight: 700 }}>${parseFloat(asset.value).toFixed(2)}</span><button onClick={() => deleteAsset(asset.id)} style={{ padding: '4px 8px', background: 'none', border: 'none', color: theme.danger, cursor: 'pointer' }}>✕</button></div>
            </div>
          ))}
          <div style={{ padding: '12px', marginTop: '8px', borderTop: '2px solid ' + theme.border, display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <span style={{ color: theme.text }}>Total Assets</span>
            <span style={{ color: theme.success }}>${totalAssets.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 20px 0', color: theme.danger, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>⚖️ Liabilities</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input type="text" placeholder="Liability Name" value={newLiability.name} onChange={(e) => setNewLiability({ ...newLiability, name: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
          <input type="number" placeholder="Value" value={newLiability.value} onChange={(e) => setNewLiability({ ...newLiability, value: e.target.value })} style={{ ...inputStyle, width: '120px' }} />
          <select value={newLiability.type} onChange={(e) => setNewLiability({ ...newLiability, type: e.target.value })} style={inputStyle}>
            <option value="loan">🚗 Loan</option>
            <option value="mortgage">🏠 Mortgage</option>
            <option value="other">📉 Other</option>
          </select>
          <button onClick={addLiability} style={btnDanger}>Add</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {liabilities.map(l => (
            <div key={l.id} style={{ padding: '12px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ color: theme.text, fontWeight: 600 }}>{l.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{l.type}</div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: theme.danger, fontWeight: 700 }}>${parseFloat(l.value).toFixed(2)}</span><button onClick={() => deleteLiability(l.id)} style={{ padding: '4px 8px', background: 'none', border: 'none', color: theme.danger, cursor: 'pointer' }}>✕</button></div>
            </div>
          ))}
          {debts.map(d => (
            <div key={'debt-' + d.id} style={{ padding: '12px', background: darkMode ? '#334155' : '#fef2f2', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid ' + theme.danger }}>
              <div><div style={{ color: theme.text, fontWeight: 600 }}>{d.name} (from Debt List)</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>Credit/Loan</div></div>
              <span style={{ color: theme.danger, fontWeight: 700 }}>${parseFloat(d.balance).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ padding: '12px', marginTop: '8px', borderTop: '2px solid ' + theme.border, display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <span style={{ color: theme.text }}>Total Liabilities</span>
            <span style={{ color: theme.danger }}>${(totalLiabilities + totalDebtBalance).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white' }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '24px' }}>🏁 Net Worth Strategy</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>Total Net Worth</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: netWorth >= 0 ? theme.success : theme.danger }}>${netWorth.toFixed(2)}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>Asset/Debt Ratio</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{(totalLiabilities + totalDebtBalance) > 0 ? (totalAssets / (totalLiabilities + totalDebtBalance)).toFixed(2) : '∞'}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>Passive Income %</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: theme.purple }}>{passiveIncomePercentage.toFixed(1)}%</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>Monthly Surplus</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: theme.success }}>${monthlySurplus.toFixed(2)}</div>
        </div>
      </div>
    </div>
  </div>
)}

{activeTab === 'path' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 20px 0', color: theme.success, fontSize: '20px' }}>🎯 Savings & Goals</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', padding: '16px', background: darkMode ? '#334155' : '#f0fdf4', borderRadius: '12px' }}>
          <input type="text" placeholder="Goal name" value={newGoal.name} onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 120px' }} />
          <input type="number" placeholder="Target $" value={newGoal.target} onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })} style={{ ...inputStyle, width: '100px' }} />
          <input type="number" placeholder="Saved $" value={newGoal.saved} onChange={(e) => setNewGoal({ ...newGoal, saved: e.target.value })} style={{ ...inputStyle, width: '100px' }} />
          <input type="date" title="Target Deadline" value={newGoal.deadline} onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} style={inputStyle} />
          <select value={newGoal.savingsFrequency} onChange={(e) => setNewGoal({ ...newGoal, savingsFrequency: e.target.value })} style={inputStyle}>
            <option value="weekly">Weekly</option>
            <option value="fortnightly">Fortnightly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button onClick={addGoal} style={btnSuccess}>Add</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {goals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: theme.textMuted }}>No goals set yet. What are you saving for?</div>
          ) : (
            goals.map(goal => {
              const progress = (parseFloat(goal.saved || '0') / parseFloat(goal.target || '1')) * 100
              const monthsToGoal = calculateMonthsToGoal(goal)
              const monthlyPayment = goal.paymentAmount ? parseFloat(goal.paymentAmount) : calculateGoalPayment(goal)
              const extraPayments = expenses.filter(exp => exp.targetGoalId === goal.id).reduce((sum, exp) => sum + convertToMonthly(parseFloat(exp.amount || '0'), exp.frequency), 0)
              
              return (
                <div key={goal.id} style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '16px', border: '1px solid ' + theme.border }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: theme.text, fontSize: '18px' }}>{goal.name}</h4>
                      <div style={{ color: theme.textMuted, fontSize: '13px' }}>
                        ${parseFloat(goal.saved).toFixed(2)} of ${parseFloat(goal.target).toFixed(2)} target
                      </div>
                    </div>
                    <button onClick={() => deleteGoal(goal.id)} style={{ padding: '4px 8px', background: 'none', border: 'none', color: theme.danger, cursor: 'pointer' }}>✕</button>
                  </div>
                  
                  <div style={{ width: '100%', height: '12px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ width: Math.min(100, progress) + '%', height: '100%', background: 'linear-gradient(to right, ' + theme.accent + ', ' + theme.purple + ')' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ padding: '10px', background: darkMode ? '#1e293b' : 'white', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px' }}>Progress</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: theme.accent }}>{progress.toFixed(1)}%</div>
                    </div>
                    <div style={{ padding: '10px', background: darkMode ? '#1e293b' : 'white', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px' }}>Monthly Aim</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: theme.text }}>${convertToMonthly(monthlyPayment, goal.savingsFrequency).toFixed(0)}</div>
                    </div>
                    <div style={{ padding: '10px', background: darkMode ? '#1e293b' : 'white', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px' }}>Estimated Time</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: theme.text }}>{monthsToGoal === 999 ? '---' : `${Math.floor(monthsToGoal / 12)}y ${monthsToGoal % 12}m`}</div>
                    </div>
                  </div>

                  {extraPayments > 0 && (
                    <div style={{ marginBottom: '12px', padding: '8px 12px', background: theme.purple + '15', borderRadius: '8px', borderLeft: '3px solid ' + theme.purple, fontSize: '13px', color: theme.text }}>
                      🚀 You're contributing an extra <strong>${extraPayments.toFixed(2)}/mo</strong> to this goal!
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {selectedGoalForExtra === goal.id ? (
                      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <input 
                          type="number" 
                          placeholder="Monthly Extra $" 
                          value={extraGoalPayment} 
                          onChange={(e) => setExtraGoalPayment(e.target.value)} 
                          style={{ ...inputStyle, flex: 1 }}
                        />
                        <button onClick={() => addExtraGoalPayment(goal.id)} style={btnPurple}>Save</button>
                        <button onClick={() => setSelectedGoalForExtra(null)} style={{ ...btnPrimary, background: 'transparent', color: theme.textMuted }}>✕</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setSelectedGoalForExtra(goal.id)} 
                        style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid ' + theme.purple, color: theme.purple, borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                      >
                        ⚡ Accelerate with Monthly Extra
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
      {activeTab === 'trading' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Forex/CFD Prop Calculator */}
              <div style={cardStyle}>
                <h2 style={{ margin: '0 0 20px 0', color: theme.accent, fontSize: '22px' }}>💱 Forex/CFD Prop Firm Calculator</h2>
                <p style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '20px' }}>For FTMO, The5ers, and similar firms with percentage-based drawdown rules.</p>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                  {[
                    { id: 'phase1', label: '🎯 Phase 1', color: theme.warning },
                    { id: 'phase2', label: '✅ Phase 2', color: theme.purple },
                    { id: 'funded', label: '💰 Funded', color: theme.success }
                  ].map(p => (
                    <button key={p.id} onClick={() => setForexProp({...forexProp, phase: p.id})} style={{ flex: 1, padding: '12px', background: forexProp.phase === p.id ? p.color : (darkMode ? '#334155' : '#f1f5f9'), color: forexProp.phase === p.id ? 'white' : theme.text, border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>{p.label}</button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>Current Stats</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input type="number" placeholder="Current Balance" value={forexProp.currentBalance} onChange={(e) => setForexProp({...forexProp, currentBalance: e.target.value})} style={inputStyle} />
                      <input type="number" placeholder="Days Traded" value={forexProp.tradingDays} onChange={(e) => setForexProp({...forexProp, tradingDays: e.target.value})} style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>Trading Plan</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input type="number" placeholder="Risk % per Trade" value={forexProp.riskPerTrade} onChange={(e) => setForexProp({...forexProp, riskPerTrade: e.target.value})} style={inputStyle} />
                      <input type="number" placeholder="Win Rate %" value={forexProp.winRate} onChange={(e) => setForexProp({...forexProp, winRate: e.target.value})} style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button onClick={calculateForexProp} style={{ ...btnPrimary, width: '100%', height: '45px' }}>Analyze Challenge</button>
                  </div>
                </div>

                {forexPropResults && (
                  <div style={{ marginTop: '24px', padding: '20px', background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '12px', border: '1px solid ' + theme.border }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: theme.textMuted }}>Profit to Target</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: theme.success }}>${forexPropResults.profitRemaining.toFixed(2)}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: theme.textMuted }}>Drawdown Buffer</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: theme.danger }}>${forexPropResults.drawdownRemaining.toFixed(2)}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: theme.textMuted }}>Est. Days to Finish</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{forexPropResults.daysToTarget}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: theme.textMuted }}>Losses to Blow</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: theme.danger }}>{forexPropResults.consecutiveLossesToBlow}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Trading Journal Section */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 20px 0', color: theme.accent, fontSize: '20px' }}>📝 Trading Journal</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <input type="date" value={newTrade.date} onChange={(e) => setNewTrade({ ...newTrade, date: e.target.value })} style={inputStyle} />
                  <input type="text" placeholder="Instrument (e.g. NAS100)" value={newTrade.instrument} onChange={(e) => setNewTrade({ ...newTrade, instrument: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                  <select value={newTrade.direction} onChange={(e) => setNewTrade({ ...newTrade, direction: e.target.value })} style={inputStyle}>
                    <option value="long">🟢 LONG</option>
                    <option value="short">🔴 SHORT</option>
                  </select>
                  <input type="number" placeholder="Profit/Loss $" value={newTrade.profitLoss} onChange={(e) => setNewTrade({ ...newTrade, profitLoss: e.target.value })} style={{ ...inputStyle, width: '120px' }} />
                  <button onClick={addTrade} style={btnPrimary}>Log Trade</button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid ' + theme.border }}>
                        <th style={{ padding: '12px', color: theme.textMuted, fontSize: '13px' }}>Date</th>
                        <th style={{ padding: '12px', color: theme.textMuted, fontSize: '13px' }}>Pair</th>
                        <th style={{ padding: '12px', color: theme.textMuted, fontSize: '13px' }}>Side</th>
                        <th style={{ padding: '12px', color: theme.textMuted, fontSize: '13px' }}>Result</th>
                        <th style={{ padding: '12px', color: theme.textMuted, fontSize: '13px' }}>P/L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map(trade => (
                        <tr key={trade.id} style={{ borderBottom: '1px solid ' + theme.border }}>
                          <td style={{ padding: '12px', color: theme.text, fontSize: '13px' }}>{trade.date}</td>
                          <td style={{ padding: '12px', color: theme.text, fontSize: '13px', fontWeight: 600 }}>{trade.instrument}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: trade.direction === 'long' ? theme.success + '20' : theme.danger + '20', color: trade.direction === 'long' ? theme.success : theme.danger }}>
                              {trade.direction.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            {parseFloat(trade.profitLoss) >= 0 ? '✅ Win' : '❌ Loss'}
                          </td>
                          <td style={{ padding: '12px', fontWeight: 700, color: parseFloat(trade.profitLoss) >= 0 ? theme.success : theme.danger }}>
                            ${parseFloat(trade.profitLoss).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {trades.length === 0 && <div style={{ textAlign: 'center', padding: '30px', color: theme.textMuted }}>No trades logged yet.</div>}
                </div>
              </div>

              {/* AI COACH INTEGRATION */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 20px 0', color: theme.purple, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>🤖 AI Financial Coach</h3>
                <div style={{ height: '300px', overflowY: 'auto', background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {chatMessages.length === 0 ? (
                    <div style={{ margin: 'auto', textAlign: 'center', color: theme.textMuted }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>💡</div>
                      <div>"Should I prioritize my credit card or my savings goal?"</div>
                    </div>
                  ) : (
                    chatMessages.map((msg, i) => (
                      <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', padding: '12px', borderRadius: '12px', background: msg.role === 'user' ? theme.accent : (darkMode ? '#334155' : 'white'), color: msg.role === 'user' ? 'white' : theme.text, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '4px' }}>{msg.role === 'user' ? 'You' : 'Coach'}</div>
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>{msg.content}</div>
                      </div>
                    ))
                  )}
                  {isAskingCoach && <div style={{ color: theme.textMuted, fontSize: '13px' }}>Coach is thinking...</div>}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Ask a question about your finances..." 
                    value={chatInput} 
                    onChange={(e) => setChatInput(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && askBudgetCoach()}
                    style={{ ...inputStyle, flex: 1 }} 
                  />
                  <button onClick={askBudgetCoach} style={btnPurple} disabled={isAskingCoach}>Send</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
// --- AI Coach Logic ---
  const askBudgetCoach = async () => {
    if (!chatInput.trim()) return
    const userMsg = { role: 'user' as const, content: chatInput }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setIsAskingCoach(true)

    try {
      // Data snapshot for AI context
      const context = {
        surplus: surplus.toFixed(2),
        totalDebt: totalDebtBalance.toFixed(2),
        fireProgress: ((totalAssets / fireNumber) * 100).toFixed(1),
        recentTrades: trades.slice(0, 3)
      }

      // Placeholder for your existing API hook connection
      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        body: JSON.stringify({ message: chatInput, context })
      })
      const data = await response.json()
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now, but looking at your surplus of $" + surplus.toFixed(0) + ", you're in a strong position to increase your debt payments." }])
    } finally {
      setIsAskingCoach(false)
    }
  }

  // --- Prop Firm Calculation Engines ---
  const calculateForexProp = () => {
    const size = parseFloat(forexProp.accountSize)
    const bal = parseFloat(forexProp.currentBalance)
    const targetPct = forexProp.phase === 'phase1' ? parseFloat(forexProp.phase1Target) : parseFloat(forexProp.phase2Target)
    const targetVal = size * (targetPct / 100)
    const currentProfit = bal - size
    
    const dailyDD = size * (parseFloat(forexProp.phase1DailyDD) / 100)
    const maxDD = size * (parseFloat(forexProp.phase1MaxDD) / 100)
    
    const riskAmt = bal * (parseFloat(forexProp.riskPerTrade) / 100)
    const winRate = parseFloat(forexProp.winRate) / 100
    const rr = parseFloat(forexProp.avgRR)
    const expectancy = (winRate * (riskAmt * rr)) - ((1 - winRate) * riskAmt)

    setForexPropResults({
      profitRemaining: Math.max(0, targetVal - currentProfit),
      drawdownRemaining: bal - (size - maxDD),
      daysToTarget: expectancy > 0 ? Math.ceil((targetVal - currentProfit) / (expectancy * 2)) : '∞',
      consecutiveLossesToBlow: Math.floor((bal - (size - maxDD)) / riskAmt)
    })
  }

  // --- Calendar Generator ---
  const renderTradingCalendar = () => {
    const { firstDay, daysInMonth, month, year } = {
      firstDay: new Date(tradingCalendarMonth.getFullYear(), tradingCalendarMonth.getMonth(), 1).getDay(),
      daysInMonth: new Date(tradingCalendarMonth.getFullYear(), tradingCalendarMonth.getMonth() + 1, 0).getDate(),
      month: tradingCalendarMonth.getMonth(),
      year: tradingCalendarMonth.getFullYear()
    }

    const days = []
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />)
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dayTrades = trades.filter(t => t.date === dateStr)
      const dayPL = dayTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)

      days.push(
        <div key={d} style={{ 
          minHeight: '70px', border: `1px solid ${theme.border}`, padding: '6px', borderRadius: '8px',
          background: dayTrades.length > 0 ? (dayPL >= 0 ? theme.success + '15' : theme.danger + '15') : 'transparent'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: theme.textMuted }}>{d}</div>
          {dayTrades.length > 0 && (
            <div style={{ fontSize: '12px', fontWeight: 800, color: dayPL >= 0 ? theme.success : theme.danger, marginTop: '4px' }}>
              {dayPL >= 0 ? '+' : ''}${dayPL.toFixed(0)}
            </div>
          )}
        </div>
      )
    }
    return days
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, transition: 'all 0.3s ease' }}>
      {/* Your logic for the mode selector and main layout renders here */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* The activeTab conditional rendering follows the structures provided in Parts 1-3 */}
        {/* ... (Close main fragments) ... */}
      </div>
    </div>
  )
}
