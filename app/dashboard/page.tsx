'use client'

import React from 'react'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect, useMemo } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  // App Mode Selection
  const [appMode, setAppMode] = useState<'budget' | 'trading' | null>(null)
  const [showModeSelector, setShowModeSelector] = useState(true)
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'path' | 'trading'>('dashboard')
  const [darkMode, setDarkMode] = useState(true)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [tradingCalendarMonth, setTradingCalendarMonth] = useState(new Date())
  
  // State for Budgeting
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
  
  // State for Trading
  const [trades, setTrades] = useState<any[]>([])
  const [newTrade, setNewTrade] = useState({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' })

  const [expandedDay, setExpandedDay] = useState<{day: number, items: any[]} | null>(null)
  const [debtExtraPayment, setDebtExtraPayment] = useState<{[key: number]: {amount: string, frequency: string}}>({})
  const [showExtraInput, setShowExtraInput] = useState<number | null>(null)

  // Styling Constants
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
  
  const inputStyle: React.CSSProperties = { padding: '10px 14px', border: `2px solid ${theme.inputBorder}`, borderRadius: '8px', fontSize: '14px', background: theme.input, color: theme.text, outline: 'none' }
  const btnPrimary: React.CSSProperties = { padding: '10px 20px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }
  const btnSuccess: React.CSSProperties = { ...btnPrimary, background: theme.success }
  const btnDanger: React.CSSProperties = { ...btnPrimary, background: theme.danger }
  const cardStyle: React.CSSProperties = { padding: '24px', background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }

  // Logic & Calculations
  const convertToMonthly = (amount: number, frequency: string) => {
    const val = amount || 0
    switch(frequency) {
      case 'weekly': return val * (52/12);
      case 'fortnightly': return val * (26/12);
      case 'yearly': return val / 12;
      default: return val;
    }
  }

  const totals = useMemo(() => {
    const inc = incomeStreams.reduce((sum, item) => sum + convertToMonthly(parseFloat(item.amount), item.frequency), 0)
    const exp = expenses.reduce((sum, item) => sum + convertToMonthly(parseFloat(item.amount), item.frequency), 0)
    const debtPay = debts.reduce((sum, item) => sum + convertToMonthly(parseFloat(item.minPayment), item.frequency), 0)
    const totalDebt = debts.reduce((sum, item) => sum + parseFloat(item.balance || 0), 0)
    return { inc, exp, debtPay, surplus: inc - exp - debtPay, totalDebt }
  }, [incomeStreams, expenses, debts])

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth, month, year }
  }

  const addTrade = () => {
    if (!newTrade.instrument || !newTrade.profitLoss) return
    setTrades([...trades, { ...newTrade, id: Date.now() }])
    setNewTrade({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' })
  }

  const togglePaid = (id: string) => {
    const next = new Set(paidOccurrences)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setPaidOccurrences(next)
  }

  // --- Render Components ---

  if (showModeSelector) {
    return (
      <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <h1 style={{ color: theme.text, fontSize: '32px', marginBottom: '40px' }}>Welcome{user?.firstName ? `, ${user.firstName}` : ''}! 👋</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '800px', width: '100%' }}>
          <button onClick={() => { setAppMode('budget'); setShowModeSelector(false); setActiveTab('dashboard') }} style={{ ...cardStyle, cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
            <h2 style={{ color: theme.text }}>Budget & Net Worth</h2>
            <p style={{ color: theme.textMuted }}>Manage cashflow, debts, and your financial path.</p>
          </button>
          <button onClick={() => { setAppMode('trading'); setShowModeSelector(false); setActiveTab('trading') }} style={{ ...cardStyle, cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
            <h2 style={{ color: theme.text }}>Trading Journal</h2>
            <p style={{ color: theme.textMuted }}>Track trades, analyze performance, and view equity.</p>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, fontFamily: 'sans-serif' }}>
      {/* Header */}
      <header style={{ padding: '16px 24px', background: theme.cardBg, borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px', color: theme.accent }}>PREMIUM FINANCE</div>
          <nav style={{ display: 'flex', gap: '8px' }}>
            {appMode === 'budget' ? (
              <>
                {['dashboard', 'overview', 'path'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t as any)} style={{ padding: '8px 16px', background: activeTab === t ? theme.accent : 'transparent', color: activeTab === t ? 'white' : theme.text, border: 'none', borderRadius: '8px', cursor: 'pointer', textTransform: 'capitalize', fontWeight: 600 }}>{t}</button>
                ))}
              </>
            ) : (
              <button onClick={() => setActiveTab('trading')} style={{ padding: '8px 16px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600 }}>Trading Journal</button>
            )}
            <button onClick={() => setShowModeSelector(true)} style={{ padding: '8px 16px', color: theme.textMuted, border: 'none', background: 'none', cursor: 'pointer' }}>Switch Mode</button>
          </nav>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>{darkMode ? '☀️' : '🌙'}</button>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              <div style={cardStyle}><div style={{ color: theme.textMuted, fontSize: '14px' }}>Monthly Income</div><div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.success }}>${totals.inc.toFixed(0)}</div></div>
              <div style={cardStyle}><div style={{ color: theme.textMuted, fontSize: '14px' }}>Monthly Expenses</div><div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.danger }}>${totals.exp.toFixed(0)}</div></div>
              <div style={cardStyle}><div style={{ color: theme.textMuted, fontSize: '14px' }}>Total Debt</div><div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.warning }}>${totals.totalDebt.toFixed(0)}</div></div>
              <div style={cardStyle}><div style={{ color: theme.textMuted, fontSize: '14px' }}>Monthly Surplus</div><div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.accent }}>${totals.surplus.toFixed(0)}</div></div>
            </div>

            {/* Quick Add Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={cardStyle}>
                <h3 style={{ marginBottom: '20px' }}>Add Transaction</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input style={inputStyle} placeholder="Name (e.g. Salary, Rent)" value={newIncome.name} onChange={e => setNewIncome({...newIncome, name: e.target.value})} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input style={{ ...inputStyle, flex: 1 }} type="number" placeholder="Amount" value={newIncome.amount} onChange={e => setNewIncome({...newIncome, amount: e.target.value})} />
                    <select style={inputStyle} value={newIncome.frequency} onChange={e => setNewIncome({...newIncome, frequency: e.target.value})}>
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="fortnightly">Fortnightly</option>
                    </select>
                  </div>
                  <button style={btnSuccess} onClick={() => {
                    if (newIncome.name && newIncome.amount) {
                      setIncomeStreams([...incomeStreams, { ...newIncome, id: Date.now() }])
                      setNewIncome({ ...newIncome, name: '', amount: '' })
                    }
                  }}>Add Income Stream</button>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ marginBottom: '20px' }}>Current Assets/Liabilities</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input style={{...inputStyle, flex: 1}} placeholder="Asset Name" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} />
                    <input style={{...inputStyle, width: '100px'}} type="number" placeholder="$" value={newAsset.value} onChange={e => setNewAsset({...newAsset, value: e.target.value})} />
                    <button style={btnPrimary} onClick={() => {
                        setAssets([...assets, {...newAsset, id: Date.now()}])
                        setNewAsset({name: '', value: '', type: 'savings'})
                    }}>Add</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={cardStyle}>
              <h2 style={{ marginBottom: '24px' }}>Log New Trade</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <input style={inputStyle} type="date" value={newTrade.date} onChange={e => setNewTrade({...newTrade, date: e.target.value})} />
                <input style={inputStyle} placeholder="Instrument (e.g. BTC/USD)" value={newTrade.instrument} onChange={e => setNewTrade({...newTrade, instrument: e.target.value})} />
                <select style={inputStyle} value={newTrade.direction} onChange={e => setNewTrade({...newTrade, direction: e.target.value})}>
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                </select>
                <input style={inputStyle} type="number" placeholder="Profit/Loss ($)" value={newTrade.profitLoss} onChange={e => setNewTrade({...newTrade, profitLoss: e.target.value})} />
              </div>
              <button style={{ ...btnSuccess, marginTop: '16px', width: '100%' }} onClick={addTrade}>Save Trade Entry</button>
            </div>

            <div style={cardStyle}>
              <h3 style={{ marginBottom: '20px' }}>Recent Performance</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: `2px solid ${theme.border}` }}>
                      <th style={{ padding: '12px' }}>Date</th>
                      <th style={{ padding: '12px' }}>Instrument</th>
                      <th style={{ padding: '12px' }}>Side</th>
                      <th style={{ padding: '12px' }}>P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map(trade => (
                      <tr key={trade.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '12px' }}>{trade.date}</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{trade.instrument}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: trade.direction === 'long' ? theme.success + '20' : theme.danger + '20', color: trade.direction === 'long' ? theme.success : theme.danger }}>
                            {trade.direction.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: parseFloat(trade.profitLoss) >= 0 ? theme.success : theme.danger }}>
                          {parseFloat(trade.profitLoss) >= 0 ? '+' : ''}${parseFloat(trade.profitLoss).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {trades.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: theme.textMuted }}>No trades logged yet.</div>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
