'use client'

import React from 'react'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect, useMemo } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  // App Mode & Navigation
  const [appMode, setAppMode] = useState<'budget' | 'trading' | null>(null)
  const [showModeSelector, setShowModeSelector] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'path' | 'trading'>('dashboard')
  const [darkMode, setDarkMode] = useState(true)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  
  // Budgeting State
  const [incomeStreams, setIncomeStreams] = useState<any[]>([])
  const [newIncome, setNewIncome] = useState({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0] })
  const [expenses, setExpenses] = useState<any[]>([])
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', frequency: 'monthly', dueDate: new Date().toISOString().split('T')[0] })
  const [debts, setDebts] = useState<any[]>([])
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: new Date().toISOString().split('T')[0] })
  const [payoffMethod, setPayoffMethod] = useState<'snowball' | 'avalanche'>('avalanche')
  const [goals, setGoals] = useState<any[]>([])
  const [newGoal, setNewGoal] = useState({ name: '', target: '', saved: '0', deadline: '', savingsFrequency: 'monthly', startDate: new Date().toISOString().split('T')[0], paymentAmount: '' })
  const [assets, setAssets] = useState<any[]>([])
  const [newAsset, setNewAsset] = useState({ name: '', value: '', type: 'savings' })
  const [liabilities, setLiabilities] = useState<any[]>([])
  const [newLiability, setNewLiability] = useState({ name: '', value: '', type: 'loan' })
  const [paidOccurrences, setPaidOccurrences] = useState<Set<string>>(new Set())
  const [debtExtraPayment, setDebtExtraPayment] = useState<{[key: number]: {amount: string, frequency: string}}>({})
  const [showExtraInput, setShowExtraInput] = useState<number | null>(null)

  // Trading State
  const [trades, setTrades] = useState<any[]>([])
  const [newTrade, setNewTrade] = useState({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' })
  const [expandedDay, setExpandedDay] = useState<{day: number, items: any[]} | null>(null)

  // Forex Prop Calculator state
  const [forexProp, setForexProp] = useState({
    phase: 'phase1', accountSize: '100000', phase1DailyDD: '5', phase1MaxDD: '10', phase1Target: '10',
    phase1MinDays: '4', phase1MaxDays: '30', currentBalance: '100000', tradingDays: '0',
    riskPerTrade: '1', tradesPerDay: '2', winRate: '55', avgRR: '1.5', profitSplit: '80'
  })

  // Futures Prop Calculator state
  const [futuresProp, setFuturesProp] = useState({
    phase: 'evaluation', accountSize: '50000', evalTrailingDD: '2500', evalProfitTarget: '3000',
    evalMinDays: '7', currentBalance: '50000', highWaterMark: '50000', tradingDays: '0',
    contractLimit: '10', riskPerTrade: '200', tradesPerDay: '3', winRate: '50', avgWin: '300', avgLoss: '200'
  })

  // Trading Compounding state
  const [tradingCalculator, setTradingCalculator] = useState({ 
    startingCapital: '10000', monthlyContribution: '500', returnRate: '1', returnPeriod: 'daily',
    years: '1', months: '0', days: '0', includeDays: ['M', 'T', 'W', 'T', 'F'], reinvestRate: '100'
  })

  // Theme
  const theme = {
    bg: darkMode ? '#0f172a' : '#f8fafc',
    cardBg: darkMode ? '#1e293b' : 'white',
    text: darkMode ? '#f1f5f9' : '#1e293b',
    textMuted: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#e2e8f0',
    input: darkMode ? '#0f172a' : '#ffffff',
    inputBorder: darkMode ? '#475569' : '#e2e8f0',
    accent: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6'
  }

  // --- Core Calculations ---
  const convertToMonthly = (amount: number, frequency: string) => {
    const val = amount || 0
    if (frequency === 'weekly') return val * (52 / 12)
    if (frequency === 'fortnightly') return val * (26 / 12)
    if (frequency === 'yearly') return val / 12
    return val
  }

  const totals = useMemo(() => {
    const inc = incomeStreams.reduce((sum, item) => sum + convertToMonthly(parseFloat(item.amount), item.frequency), 0)
    const activeInc = incomeStreams.filter(i => i.type === 'active').reduce((sum, i) => sum + convertToMonthly(parseFloat(i.amount), i.frequency), 0)
    const passiveInc = incomeStreams.filter(i => i.type === 'passive').reduce((sum, i) => sum + convertToMonthly(parseFloat(i.amount), i.frequency), 0)
    const exp = expenses.reduce((sum, item) => sum + convertToMonthly(parseFloat(item.amount), item.frequency), 0)
    const debtPay = debts.reduce((sum, item) => sum + convertToMonthly(parseFloat(item.minPayment), item.frequency), 0)
    const totalDebt = debts.reduce((sum, item) => sum + parseFloat(item.balance || 0), 0)
    const totalAssets = assets.reduce((sum, a) => sum + parseFloat(a.value || 0), 0)
    const totalLiabilities = liabilities.reduce((sum, l) => sum + parseFloat(l.value || 0), 0)
    return { inc, activeInc, passiveInc, exp, debtPay, surplus: inc - exp - debtPay, totalDebt, netWorth: totalAssets - totalLiabilities - totalDebt }
  }, [incomeStreams, expenses, debts, assets, liabilities])

  const fiPath = useMemo(() => {
    const monthlyNeed = totals.exp + totals.debtPay
    const fireNumber = (monthlyNeed * 12) * 25
    const currentInvestments = assets.filter(a => a.type === 'investment').reduce((sum, a) => sum + parseFloat(a.value || 0), 0)
    const yearsToFI = totals.surplus > 0 ? (fireNumber - currentInvestments) / (totals.surplus * 12) : 999
    return { monthlyNeed, fireNumber, currentInvestments, yearsToFI, coverage: totals.passiveInc > 0 ? (totals.passiveInc / monthlyNeed) * 100 : 0 }
  }, [totals, assets])

  // --- Calendar Logic ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear(); const month = date.getMonth()
    return { firstDay: new Date(year, month, 1).getDay(), daysInMonth: new Date(year, month + 1, 0).getDate(), month, year }
  }

  const getDayItems = (day: number) => {
    const { month, year } = getDaysInMonth(calendarMonth)
    const items: any[] = []
    const checkDate = new Date(year, month, day)
    
    const all = [
      ...incomeStreams.map(i => ({ ...i, type: 'income', icon: '💰' })),
      ...expenses.map(e => ({ ...e, type: 'expense', icon: '💸' })),
      ...debts.map(d => ({ ...d, name: d.name, amount: d.minPayment, dueDate: d.paymentDate, type: 'debt', icon: '💳' }))
    ]

    all.forEach(item => {
      const start = new Date(item.startDate || item.dueDate)
      if (item.frequency === 'monthly' && start.getDate() === day) items.push(item)
      if (item.frequency === 'weekly' && checkDate.getDay() === start.getDay() && checkDate >= start) items.push(item)
    })
    return items
  }

  // --- UI Components ---
  const cardStyle: React.CSSProperties = { padding: '24px', background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }
  const inputStyle: React.CSSProperties = { padding: '10px 14px', border: `2px solid ${theme.inputBorder}`, borderRadius: '8px', fontSize: '14px', background: theme.input, color: theme.text, outline: 'none' }
  const btnPrimary: React.CSSProperties = { padding: '10px 20px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }

  if (showModeSelector) {
    return (
      <div style={{ minHeight: '100vh', background: darkMode ? '#0f172a' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '900px', width: '100%', textAlign: 'center' }}>
          <h1 style={{ color: theme.text, fontSize: '40px', marginBottom: '10px' }}>Premium Finance Dashboard</h1>
          <p style={{ color: theme.textMuted, fontSize: '18px', marginBottom: '48px' }}>Select your focus area to begin</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <button onClick={() => { setAppMode('budget'); setShowModeSelector(false); setActiveTab('dashboard') }} style={{ ...cardStyle, cursor: 'pointer', transition: 'transform 0.2s' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏦</div>
              <h2 style={{ color: theme.text, fontSize: '24px' }}>Budget & Net Worth</h2>
              <p style={{ color: theme.textMuted }}>Income, expenses, debt payoff paths, and FI tracking.</p>
            </button>
            <button onClick={() => { setAppMode('trading'); setShowModeSelector(false); setActiveTab('trading') }} style={{ ...cardStyle, cursor: 'pointer' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
              <h2 style={{ color: theme.text, fontSize: '24px' }}>Trading Journal & Props</h2>
              <p style={{ color: theme.textMuted }}>Prop challenge calculators, compounding, and trade logs.</p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header style={{ padding: '16px 24px', background: theme.cardBg, borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: '22px', color: theme.accent, letterSpacing: '-1px' }}>PREMIUM FINANCE</div>
          <nav style={{ display: 'flex', gap: '4px' }}>
            {appMode === 'budget' ? (
              ['dashboard', 'overview', 'path'].map(t => (
                <button key={t} onClick={() => setActiveTab(t as any)} style={{ padding: '8px 16px', background: activeTab === t ? theme.accent : 'transparent', color: activeTab === t ? 'white' : theme.text, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}>{t}</button>
              ))
            ) : (
              <button onClick={() => setActiveTab('trading')} style={{ padding: '8px 16px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600 }}>Trading Console</button>
            )}
          </nav>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={() => setShowModeSelector(true)} style={{ background: 'none', border: `1px solid ${theme.border}`, color: theme.textMuted, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Switch Mode</button>
          <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>{darkMode ? '☀️' : '🌙'}</button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Stats Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div style={cardStyle}><div style={{ color: theme.textMuted, fontSize: '13px' }}>Monthly Income</div><div style={{ fontSize: '24px', fontWeight: 800, color: theme.success }}>${totals.inc.toFixed(2)}</div></div>
                <div style={cardStyle}><div style={{ color: theme.textMuted, fontSize: '13px' }}>Total Outgoing</div><div style={{ fontSize: '24px', fontWeight: 800, color: theme.danger }}>${(totals.exp + totals.debtPay).toFixed(2)}</div></div>
                <div style={cardStyle}><div style={{ color: theme.textMuted, fontSize: '13px' }}>Monthly Surplus</div><div style={{ fontSize: '24px', fontWeight: 800, color: theme.accent }}>${totals.surplus.toFixed(2)}</div></div>
                <div style={cardStyle}><div style={{ color: theme.textMuted, fontSize: '13px' }}>Net Worth</div><div style={{ fontSize: '24px', fontWeight: 800, color: theme.purple }}>${totals.netWorth.toFixed(2)}</div></div>
              </div>

              {/* Calendar Section */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Financial Calendar</h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ background: 'none', border: `1px solid ${theme.border}`, color: theme.text, padding: '4px 12px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}>←</button>
                    <span style={{ fontWeight: 600, minWidth: '120px', textAlign: 'center' }}>{calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <button style={{ background: 'none', border: `1px solid ${theme.border}`, color: theme.text, padding: '4px 12px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}>→</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: theme.textMuted }}>{d}</div>)}
                  {/* Calendar Days would be rendered here with getDayItems(day) */}
                </div>
              </div>
            </div>

            {/* Sidebar Quick Add */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={cardStyle}>
                <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Quick Add Income</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input style={inputStyle} placeholder="Name" value={newIncome.name} onChange={e => setNewIncome({...newIncome, name: e.target.value})} />
                  <input style={inputStyle} type="number" placeholder="Amount" value={newIncome.amount} onChange={e => setNewIncome({...newIncome, amount: e.target.value})} />
                  <button style={{ ...btnPrimary, background: theme.success }} onClick={() => {
                    setIncomeStreams([...incomeStreams, { ...newIncome, id: Date.now() }])
                    setNewIncome({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0] })
                  }}>Add Income</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'path' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
              <div style={cardStyle}>
                <h2 style={{ marginBottom: '24px' }}>Debt Payoff Strategy ({payoffMethod})</h2>
                {/* Debt rendering logic here */}
                {debts.length === 0 && <p style={{ color: theme.textMuted }}>No debts listed. You're debt free!</p>}
              </div>
              <div style={{ ...cardStyle, background: `linear-gradient(135deg, ${theme.purple}, ${theme.accent})`, color: 'white', border: 'none' }}>
                <h3 style={{ marginBottom: '16px' }}>FI / FIRE Path</h3>
                <div style={{ fontSize: '32px', fontWeight: 800 }}>${fiPath.fireNumber.toLocaleString()}</div>
                <p style={{ opacity: 0.8, fontSize: '14px' }}>Your target net worth for financial independence.</p>
                <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                   <div style={{ fontSize: '14px' }}>Years to FI: <span style={{ fontWeight: 700 }}>{fiPath.yearsToFI.toFixed(1)} years</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div style={cardStyle}>
                   <h3 style={{ marginBottom: '16px' }}>Forex Prop Planner</h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label style={{ fontSize: '12px', color: theme.textMuted }}>Account Size</label>
                      <input style={inputStyle} type="number" value={forexProp.accountSize} onChange={e => setForexProp({...forexProp, accountSize: e.target.value})} />
                      {/* Detailed Forex Prop logic results would go here */}
                   </div>
                </div>
                <div style={cardStyle}>
                   <h3 style={{ marginBottom: '16px' }}>Compounding Calculator</h3>
                   <input style={inputStyle} placeholder="Starting Capital" value={tradingCalculator.startingCapital} onChange={e => setTradingCalculator({...tradingCalculator, startingCapital: e.target.value})} />
                </div>
                <div style={cardStyle}>
                   <h3 style={{ marginBottom: '16px' }}>Log Trade</h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input style={inputStyle} placeholder="Instrument" value={newTrade.instrument} onChange={e => setNewTrade({...newTrade, instrument: e.target.value})} />
                      <input style={inputStyle} type="number" placeholder="Profit/Loss" value={newTrade.profitLoss} onChange={e => setNewTrade({...newTrade, profitLoss: e.target.value})} />
                      <button style={{ ...btnPrimary, background: theme.warning }} onClick={() => {
                         setTrades([...trades, { ...newTrade, id: Date.now() }])
                         setNewTrade({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' })
                      }}>Save Trade</button>
                   </div>
                </div>
             </div>
             
             {/* Trading Journal Table */}
             <div style={cardStyle}>
                <h3>Trade History</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                   <thead>
                      <tr style={{ borderBottom: `1px solid ${theme.border}`, textAlign: 'left' }}>
                         <th style={{ padding: '12px' }}>Date</th>
                         <th style={{ padding: '12px' }}>Instrument</th>
                         <th style={{ padding: '12px' }}>P&L</th>
                      </tr>
                   </thead>
                   <tbody>
                      {trades.map(t => (
                         <tr key={t.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                            <td style={{ padding: '12px' }}>{t.date}</td>
                            <td style={{ padding: '12px', fontWeight: 600 }}>{t.instrument}</td>
                            <td style={{ padding: '12px', color: parseFloat(t.profitLoss) >= 0 ? theme.success : theme.danger, fontWeight: 700 }}>${parseFloat(t.profitLoss || 0).toFixed(2)}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}
      </main>
    </div>
  )
}
