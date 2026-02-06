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
  const [newTrade, setNewTrade] = useState({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' })

  const [expandedDay, setExpandedDay] = useState<{day: number, items: any[]} | null>(null)
  
  // Per-debt extra payment state
  const [debtExtraPayment, setDebtExtraPayment] = useState<{[key: number]: {amount: string, frequency: string}}>({})
  const [showExtraInput, setShowExtraInput] = useState<number | null>(null)

  // Trading Calculator & Prop States
  const [forexProp, setForexProp] = useState({
    phase: 'phase1', accountSize: '100000', phase1DailyDD: '5', phase1MaxDD: '10', phase1Target: '10',
    phase1MinDays: '4', currentBalance: '100000', tradingDays: '0', riskPerTrade: '1', tradesPerDay: '2',
    winRate: '55', avgRR: '1.5', profitSplit: '80'
  })
  const [futuresProp, setFuturesProp] = useState({
    phase: 'evaluation', accountSize: '50000', evalTrailingDD: '2500', evalProfitTarget: '3000',
    evalMinDays: '7', currentBalance: '50000', highWaterMark: '50000', tradingDays: '0', riskPerTrade: '200',
    tradesPerDay: '3', winRate: '50', avgWin: '300', avgLoss: '200', profitSplit: '90'
  })
  const [tradingCalculator, setTradingCalculator] = useState({ 
    startingCapital: '10000', monthlyContribution: '500', returnRate: '1', returnPeriod: 'daily',
    years: '1', months: '0', days: '0', includeDays: ['M', 'T', 'W', 'T2', 'F'], reinvestRate: '100'
  })

  // Theme & Styles
  const theme = {
    bg: darkMode ? '#0f172a' : '#f8fafc',
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
  
  const inputStyle: React.CSSProperties = { padding: '10px 14px', border: '2px solid ' + theme.inputBorder, borderRadius: '8px', fontSize: '14px', background: theme.input, color: theme.text }
  const btnPrimary: React.CSSProperties = { padding: '10px 20px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }
  const cardStyle: React.CSSProperties = { padding: '24px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }

  // Logic Helpers
  const convertToMonthly = (amount: number, frequency: string) => {
    if (frequency === 'weekly') return amount * (52 / 12)
    if (frequency === 'fortnightly') return amount * (26 / 12)
    if (frequency === 'yearly') return amount / 12
    return amount
  }

  const monthlyIncome = incomeStreams.reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || '0'), inc.frequency), 0)
  const monthlyExpenses = expenses.filter(e => !e.targetDebtId && !e.targetGoalId).reduce((sum, exp) => sum + convertToMonthly(parseFloat(exp.amount || '0'), exp.frequency), 0)
  const totalDebtBalance = debts.reduce((sum, d) => sum + parseFloat(d.balance || '0'), 0)
  const monthlyDebtPayments = debts.reduce((sum, debt) => sum + convertToMonthly(parseFloat(debt.minPayment || '0'), debt.frequency), 0)
  const totalOutgoing = monthlyExpenses + monthlyDebtPayments
  const monthlySurplus = monthlyIncome - totalOutgoing
  const netWorth = assets.reduce((sum, a) => sum + parseFloat(a.value || '0'), 0) - totalDebtBalance - liabilities.reduce((sum, l) => sum + parseFloat(l.value || '0'), 0)

  // Actions
  const addIncome = () => { if (!newIncome.name || !newIncome.amount) return; setIncomeStreams([...incomeStreams, { ...newIncome, id: Date.now() }]); setNewIncome({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0] }) }
  const addExpense = () => { if (!newExpense.name || !newExpense.amount) return; setExpenses([...expenses, { ...newExpense, id: Date.now() }]); setNewExpense({ name: '', amount: '', frequency: 'monthly', dueDate: new Date().toISOString().split('T')[0] }) }
  const addTrade = () => { if (!newTrade.instrument) return; setTrades([{ ...newTrade, id: Date.now() }, ...trades]); setNewTrade({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' }) }

  // Render Calendar logic
  const getDaysInMonth = () => {
    const year = calendarMonth.getFullYear(); const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth, month, year }
  }

  const togglePaid = (id: string) => {
    const newPaid = new Set(paidOccurrences); 
    if (newPaid.has(id)) newPaid.delete(id); else newPaid.add(id);
    setPaidOccurrences(newPaid);
  }

  // Mode Selection Screen
  if (showModeSelector) {
    return (
      <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <h1 style={{ color: theme.text, fontSize: '32px', marginBottom: '40px' }}>Select Dashboard Mode</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '800px', width: '100%' }}>
          <button onClick={() => { setAppMode('budget'); setShowModeSelector(false); setActiveTab('dashboard') }} style={{ ...cardStyle, cursor: 'pointer', border: '2px solid ' + theme.success }}>
            <h2 style={{ color: theme.success }}>💰 Budget Mode</h2>
            <p style={{ color: theme.textMuted }}>Manage income, expenses, and debt.</p>
          </button>
          <button onClick={() => { setAppMode('trading'); setShowModeSelector(false); setActiveTab('trading') }} style={{ ...cardStyle, cursor: 'pointer', border: '2px solid ' + theme.warning }}>
            <h2 style={{ color: theme.warning }}>📈 Trading Mode</h2>
            <p style={{ color: theme.textMuted }}>Prop firm calculators and trade journal.</p>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => setShowModeSelector(true)} style={btnPrimary}>◀ Back</button>
          <h1 style={{ fontSize: '24px' }}>Premium Finance</h1>
        </div>
        <nav style={{ display: 'flex', gap: '10px' }}>
          {['dashboard', 'overview', 'path', 'trading'].map(t => (
            <button key={t} onClick={() => setActiveTab(t as any)} style={{ ...btnPrimary, background: activeTab === t ? theme.accent : 'transparent', border: '1px solid ' + theme.border, color: activeTab === t ? 'white' : theme.text }}>
              {t.toUpperCase()}
            </button>
          ))}
          <button onClick={() => setDarkMode(!darkMode)} style={{ ...btnPrimary, background: 'none', border: '1px solid ' + theme.border }}>{darkMode ? '☀️' : '🌙'}</button>
        </nav>
      </header>

      <main>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Stats */}
            <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
              <div style={cardStyle}><p>Income</p><h3>${monthlyIncome.toFixed(2)}</h3></div>
              <div style={cardStyle}><p>Expenses</p><h3>${totalOutgoing.toFixed(2)}</h3></div>
              <div style={cardStyle}><p>Surplus</p><h3 style={{ color: monthlySurplus >= 0 ? theme.success : theme.danger }}>${monthlySurplus.toFixed(2)}</h3></div>
              <div style={cardStyle}><p>Net Worth</p><h3>${netWorth.toFixed(2)}</h3></div>
            </div>

            {/* Income Inputs */}
            <div style={cardStyle}>
              <h3>Income Streams</h3>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <input style={inputStyle} placeholder="Name" value={newIncome.name} onChange={e => setNewIncome({...newIncome, name: e.target.value})} />
                <input style={inputStyle} type="number" placeholder="$" value={newIncome.amount} onChange={e => setNewIncome({...newIncome, amount: e.target.value})} />
                <button style={{...btnPrimary, background: theme.success}} onClick={addIncome}>Add</button>
              </div>
              <div style={{marginTop: '15px'}}>
                {incomeStreams.map(inc => (
                  <div key={inc.id} style={{display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid ' + theme.border}}>
                    <span>{inc.name}</span>
                    <span style={{color: theme.success}}>${inc.amount}/{inc.frequency}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Inputs */}
            <div style={cardStyle}>
              <h3>Expenses</h3>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <input style={inputStyle} placeholder="Bill Name" value={newExpense.name} onChange={e => setNewExpense({...newExpense, name: e.target.value})} />
                <input style={inputStyle} type="number" placeholder="$" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
                <button style={{...btnPrimary, background: theme.danger}} onClick={addExpense}>Add</button>
              </div>
              <div style={{marginTop: '15px'}}>
                {expenses.map(exp => (
                  <div key={exp.id} style={{display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid ' + theme.border}}>
                    <span>{exp.name}</span>
                    <span style={{color: theme.danger}}>${exp.amount}/{exp.frequency}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={cardStyle}>
              <h2>Trading Journal</h2>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input style={inputStyle} placeholder="Pair" value={newTrade.instrument} onChange={e => setNewTrade({...newTrade, instrument: e.target.value})} />
                <input style={inputStyle} type="number" placeholder="Profit/Loss" value={newTrade.profitLoss} onChange={e => setNewTrade({...newTrade, profitLoss: e.target.value})} />
                <select style={inputStyle} value={newTrade.direction} onChange={e => setNewTrade({...newTrade, direction: e.target.value as any})}><option value="long">Long</option><option value="short">Short</option></select>
                <button style={btnPrimary} onClick={addTrade}>Log Trade</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid ' + theme.border, textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>Instrument</th>
                    <th style={{ padding: '12px' }}>Direction</th>
                    <th style={{ padding: '12px' }}>P&L</th>
                    <th style={{ padding: '12px' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map(trade => (
                    <tr key={trade.id} style={{ borderBottom: '1px solid ' + theme.border }}>
                      <td style={{ padding: '12px' }}>{trade.date}</td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{trade.instrument}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', background: trade.direction === 'long' ? theme.success + '20' : theme.danger + '20', color: trade.direction === 'long' ? theme.success : theme.danger }}>
                          {trade.direction.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600, color: parseFloat(trade.profitLoss) >= 0 ? theme.success : theme.danger }}>
                        ${parseFloat(trade.profitLoss || '0').toFixed(2)}
                      </td>
                      <td style={{ padding: '12px', color: theme.textMuted }}>{trade.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'path' && (
          <div style={cardStyle}>
            <h2>Financial Independence Path</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '20px' }}>
              <div style={{ padding: '15px', background: theme.bg, borderRadius: '10px' }}>
                <p>FIRE Number (25x)</p>
                <h3>${(monthlyExpenses * 12 * 25).toLocaleString()}</h3>
              </div>
              <div style={{ padding: '15px', background: theme.bg, borderRadius: '10px' }}>
                <p>Monthly Gap</p>
                <h3 style={{ color: theme.danger }}>${(monthlyExpenses - (incomeStreams.filter(i => i.type === 'passive').reduce((s, i) => s + convertToMonthly(parseFloat(i.amount), i.frequency), 0))).toFixed(2)}</h3>
              </div>
              <div style={{ padding: '15px', background: theme.bg, borderRadius: '10px' }}>
                <p>Years to Freedom</p>
                <h3>{monthlySurplus > 0 ? Math.ceil(((monthlyExpenses * 12 * 25) - netWorth) / (monthlySurplus * 12)) : '∞'}</h3>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
