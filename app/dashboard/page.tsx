'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useRef } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  // Mode Selection
  const [appMode, setAppMode] = useState<'budget' | 'trading' | null>(null)
  const [showModeSelector, setShowModeSelector] = useState(true)
  
  // Core State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'path' | 'trading'>('dashboard')
  const [darkMode, setDarkMode] = useState(true)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  
  // Budget State
  const [incomeStreams, setIncomeStreams] = useState<any[]>([])
  const [newIncome, setNewIncome] = useState({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0] })
  const [expenses, setExpenses] = useState<any[]>([])
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', frequency: 'monthly', category: 'other', dueDate: new Date().toISOString().split('T')[0] })
  const [debts, setDebts] = useState<any[]>([])
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: new Date().toISOString().split('T')[0] })
  const [payoffMethod, setPayoffMethod] = useState<'snowball' | 'avalanche'>('avalanche')
  const [goals, setGoals] = useState<any[]>([])
  const [newGoal, setNewGoal] = useState({ name: '', target: '', saved: '0', deadline: '', savingsFrequency: 'monthly', startDate: new Date().toISOString().split('T')[0], paymentAmount: '' })
  const [paidOccurrences, setPaidOccurrences] = useState<Set<string>>(new Set())
  const [expandedDay, setExpandedDay] = useState<{day: number, items: any[]} | null>(null)
  
  // Presets
  const [showPresets, setShowPresets] = useState(false)
  const presetBills = [
    { name: 'Rent/Mortgage', amount: '', category: 'housing', frequency: 'monthly' },
    { name: 'Electricity', amount: '', category: 'utilities', frequency: 'monthly' },
    { name: 'Internet', amount: '', category: 'utilities', frequency: 'monthly' },
    { name: 'Phone', amount: '', category: 'utilities', frequency: 'monthly' },
    { name: 'Netflix', amount: '15.99', category: 'subscriptions', frequency: 'monthly' },
    { name: 'Spotify', amount: '11.99', category: 'subscriptions', frequency: 'monthly' },
    { name: 'Groceries', amount: '', category: 'food', frequency: 'weekly' },
  ]
  
  // CSV Import
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [csvTransactions, setCsvTransactions] = useState<any[]>([])
  const [showCsvImport, setShowCsvImport] = useState(false)
  const expenseCategories = ['housing', 'utilities', 'food', 'transport', 'entertainment', 'shopping', 'health', 'subscriptions', 'other']
  
  // Trading State
  const [trades, setTrades] = useState<any[]>([])
  const [newTrade, setNewTrade] = useState({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' })

  // Theme
  const theme = {
    bg: darkMode ? '#0f172a' : '#f8fafc',
    cardBg: darkMode ? '#1e293b' : 'white',
    text: darkMode ? '#f1f5f9' : '#1e293b',
    textMuted: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#e2e8f0',
    input: darkMode ? '#334155' : '#ffffff',
    inputBorder: darkMode ? '#475569' : '#cbd5e1',
    accent: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6'
  }
  
  const inputStyle: React.CSSProperties = { padding: '10px 14px', border: '2px solid ' + theme.inputBorder, borderRadius: '8px', fontSize: '14px', background: theme.input, color: theme.text }
  const btnPrimary: React.CSSProperties = { padding: '10px 20px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }
  const btnSuccess: React.CSSProperties = { ...btnPrimary, background: theme.success }
  const btnDanger: React.CSSProperties = { ...btnPrimary, background: theme.danger }
  const btnWarning: React.CSSProperties = { ...btnPrimary, background: theme.warning }
  const cardStyle: React.CSSProperties = { padding: '24px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }

  // Calculations
  const getOccurrencesInMonth = (startDate: string, frequency: string, targetMonth: number, targetYear: number): number => {
    if (!startDate) return 0
    const start = new Date(startDate)
    const monthStart = new Date(targetYear, targetMonth, 1)
    const monthEnd = new Date(targetYear, targetMonth + 1, 0)
    if (start > monthEnd) return 0
    if (frequency === 'monthly') return 1
    if (frequency === 'yearly') return start.getMonth() === targetMonth ? 1 : 0
    if (frequency === 'once') return start.getMonth() === targetMonth && start.getFullYear() === targetYear ? 1 : 0
    const intervalDays = frequency === 'weekly' ? 7 : 14
    let count = 0
    let currentDate = new Date(start)
    while (currentDate < monthStart) currentDate.setDate(currentDate.getDate() + intervalDays)
    while (currentDate <= monthEnd) { count++; currentDate.setDate(currentDate.getDate() + intervalDays) }
    return count
  }

  const calculateMonthlyTotals = (month: number, year: number) => {
    const incomeTotal = incomeStreams.reduce((sum, inc) => sum + (parseFloat(inc.amount || '0') * getOccurrencesInMonth(inc.startDate, inc.frequency, month, year)), 0)
    const expenseTotal = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount || '0') * getOccurrencesInMonth(exp.dueDate, exp.frequency, month, year)), 0)
    const debtTotal = debts.reduce((sum, debt) => sum + (parseFloat(debt.minPayment || '0') * getOccurrencesInMonth(debt.paymentDate, debt.frequency, month, year)), 0)
    return { incomeTotal, expenseTotal, debtTotal, total: incomeTotal - expenseTotal - debtTotal }
  }

  const currentMonthTotals = calculateMonthlyTotals(calendarMonth.getMonth(), calendarMonth.getFullYear())
  const convertToMonthly = (amount: number, frequency: string) => {
    if (frequency === 'weekly') return amount * (52 / 12)
    if (frequency === 'fortnightly') return amount * (26 / 12)
    if (frequency === 'yearly') return amount / 12
    return amount
  }
  
  const monthlyIncome = incomeStreams.reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || '0'), inc.frequency), 0)
  const monthlyExpenses = expenses.reduce((sum, exp) => sum + convertToMonthly(parseFloat(exp.amount || '0'), exp.frequency), 0)
  const monthlyDebtPayments = debts.reduce((sum, debt) => sum + convertToMonthly(parseFloat(debt.minPayment || '0'), debt.frequency), 0)
  const totalDebtBalance = debts.reduce((sum, d) => sum + parseFloat(d.balance || '0'), 0)
  const totalOutgoing = monthlyExpenses + monthlyDebtPayments
  const monthlySurplus = monthlyIncome - totalOutgoing
  const totalPL = trades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)

  // Calendar
  const getDaysInMonth = () => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    return { firstDay: new Date(year, month, 1).getDay(), daysInMonth: new Date(year, month + 1, 0).getDate(), month, year }
  }

  const getCalendarItemsForDay = (day: number) => {
    const { month, year } = getDaysInMonth()
    const items: any[] = []
    const allItems = [
      ...incomeStreams.map(inc => ({ id: 'inc-' + inc.id, name: '💰 ' + inc.name, amount: inc.amount, dueDate: inc.startDate, frequency: inc.frequency, type: 'income' })),
      ...expenses.map(exp => ({ id: 'exp-' + exp.id, name: '💸 ' + exp.name, amount: exp.amount, dueDate: exp.dueDate, frequency: exp.frequency, type: 'expense' })),
      ...debts.map(debt => ({ id: 'debt-' + debt.id, name: '💳 ' + debt.name, amount: debt.minPayment, dueDate: debt.paymentDate, frequency: debt.frequency, type: 'debt' })),
      ...goals.filter(g => g.startDate && g.paymentAmount).map(goal => ({ id: 'goal-' + goal.id, name: '🎯 ' + goal.name, amount: goal.paymentAmount, dueDate: goal.startDate, frequency: goal.savingsFrequency, type: 'goal' }))
    ]
    allItems.forEach(item => {
      if (!item.dueDate) return
      const itemDate = new Date(item.dueDate)
      const currentDate = new Date(year, month, day)
      let shouldShow = false
      if (itemDate.getDate() === day && itemDate.getMonth() === month && itemDate.getFullYear() === year) shouldShow = true
      else if (item.frequency && currentDate >= itemDate) {
        if (item.frequency === 'weekly') { const diff = Math.round((currentDate.getTime() - itemDate.getTime()) / 86400000); shouldShow = diff % 7 === 0 }
        else if (item.frequency === 'fortnightly') { const diff = Math.round((currentDate.getTime() - itemDate.getTime()) / 86400000); shouldShow = diff % 14 === 0 }
        else if (item.frequency === 'monthly') shouldShow = day === itemDate.getDate()
      }
      if (shouldShow) {
        const occId = item.id + '-' + year + '-' + month + '-' + day
        items.push({ ...item, id: occId, isPaid: paidOccurrences.has(occId) })
      }
    })
    return items
  }

  const togglePaid = (id: string) => {
    const newPaid = new Set(paidOccurrences)
    if (paidOccurrences.has(id)) newPaid.delete(id)
    else newPaid.add(id)
    setPaidOccurrences(newPaid)
  }

  // CRUD
  const addIncome = () => { if (!newIncome.name || !newIncome.amount) return; setIncomeStreams([...incomeStreams, { ...newIncome, id: Date.now() }]); setNewIncome({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0] }) }
  const addExpense = () => { if (!newExpense.name || !newExpense.amount) return; setExpenses([...expenses, { ...newExpense, id: Date.now() }]); setNewExpense({ name: '', amount: '', frequency: 'monthly', category: 'other', dueDate: new Date().toISOString().split('T')[0] }) }
  const addDebt = () => { if (!newDebt.name || !newDebt.balance) return; setDebts([...debts, { ...newDebt, id: Date.now() }]); setNewDebt({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: new Date().toISOString().split('T')[0] }) }
  const addGoal = () => { if (!newGoal.name || !newGoal.target) return; setGoals([...goals, { ...newGoal, id: Date.now() }]); setNewGoal({ name: '', target: '', saved: '0', deadline: '', savingsFrequency: 'monthly', startDate: new Date().toISOString().split('T')[0], paymentAmount: '' }) }
  const addTrade = () => { if (!newTrade.instrument) return; setTrades([...trades, { ...newTrade, id: Date.now() }]); setNewTrade({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' }) }

  const addPresetBill = (preset: any) => {
    const amount = prompt('Enter amount for ' + preset.name + ':', preset.amount || '')
    if (!amount) return
    setExpenses([...expenses, { id: Date.now(), name: preset.name, amount, frequency: preset.frequency, category: preset.category, dueDate: new Date().toISOString().split('T')[0] }])
  }

  const addGoalToCalendar = (goal: any) => {
    if (!goal.paymentAmount) { alert('Set a payment amount first'); return }
    setGoals(goals.map(g => g.id === goal.id ? { ...g, startDate: g.startDate || new Date().toISOString().split('T')[0] } : g))
    alert(goal.name + ' added to calendar!')
  }

  // CSV Import
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split('\n').filter(l => l.trim())
      const transactions: any[] = []
      lines.slice(1).forEach((line, idx) => {
        const parts = line.split(',').map(p => p.replace(/"/g, '').trim())
        if (parts.length >= 3) {
          const amount = parseFloat(parts.find(p => !isNaN(parseFloat(p.replace(/[$,]/g, ''))))?.replace(/[$,]/g, '') || '0')
          const desc = parts.find(p => isNaN(parseFloat(p.replace(/[$,]/g, ''))) && p.length > 3) || 'Transaction'
          transactions.push({ id: Date.now() + idx, description: desc, amount: Math.abs(amount), isExpense: amount < 0, category: 'other', selected: amount < 0 })
        }
      })
      setCsvTransactions(transactions)
      setShowCsvImport(true)
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const importCsvTransactions = () => {
    const selected = csvTransactions.filter(t => t.selected)
    selected.filter(t => t.isExpense).forEach(t => {
      setExpenses(prev => [...prev, { id: Date.now() + Math.random(), name: t.description, amount: t.amount.toString(), frequency: 'once', category: t.category, dueDate: new Date().toISOString().split('T')[0] }])
    })
    selected.filter(t => !t.isExpense).forEach(t => {
      setIncomeStreams(prev => [...prev, { id: Date.now() + Math.random(), name: t.description, amount: t.amount.toString(), frequency: 'once', type: 'active', startDate: new Date().toISOString().split('T')[0] }])
    })
    alert('Imported ' + selected.length + ' transactions')
    setShowCsvImport(false)
    setCsvTransactions([])
  }

  // Mode Selection Screen
  if (showModeSelector) {
    return (
      <div style={{ minHeight: '100vh', background: darkMode ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 800, color: theme.text, marginBottom: '8px' }}>Welcome{user?.firstName ? ', ' + user.firstName : ''}! 👋</h1>
        <p style={{ fontSize: '20px', color: theme.textMuted, marginBottom: '48px' }}>What are we working on today?</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '700px', width: '100%' }}>
          <button onClick={() => { setAppMode('budget'); setShowModeSelector(false) }} style={{ padding: '32px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '20px', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💰</div>
            <h2 style={{ color: 'white', fontSize: '24px', margin: '0 0 8px 0' }}>Budget Mode</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '14px' }}>Track income, expenses, debts & goals</p>
          </button>
          <button onClick={() => { setAppMode('trading'); setShowModeSelector(false); setActiveTab('trading') }} style={{ padding: '32px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '20px', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📈</div>
            <h2 style={{ color: 'white', fontSize: '24px', margin: '0 0 8px 0' }}>Trading Mode</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '14px' }}>Prop firm calculators & trade journal</p>
          </button>
        </div>
        
        <button onClick={() => setDarkMode(!darkMode)} style={{ marginTop: '32px', padding: '10px 20px', background: 'transparent', border: '2px solid ' + theme.border, borderRadius: '10px', color: theme.textMuted, cursor: 'pointer' }}>
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      {/* Modals */}
      {expandedDay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setExpandedDay(null)}>
          <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>📅 {calendarMonth.toLocaleDateString('en-US', { month: 'long' })} {expandedDay.day}</h3>
            {expandedDay.items.map(item => (
              <div key={item.id} style={{ padding: '10px', marginBottom: '8px', background: item.isPaid ? theme.border : (item.type === 'income' ? '#d1fae5' : '#fee2e2'), borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontWeight: 600, color: '#1e293b' }}>{item.name}</div><div style={{ fontSize: '12px', color: '#64748b' }}>${item.amount}</div></div>
                <button onClick={() => togglePaid(item.id)} style={{ padding: '6px 12px', background: item.isPaid ? '#6b7280' : theme.success, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{item.isPaid ? '✓' : 'Pay'}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCsvImport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowCsvImport(false)}>
          <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '600px', width: '95%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>📤 Import Transactions</h3>
            {csvTransactions.map(t => (
              <div key={t.id} style={{ padding: '10px', marginBottom: '8px', background: t.selected ? (darkMode ? '#1e3a5f' : '#eff6ff') : 'transparent', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" checked={t.selected} onChange={() => setCsvTransactions(csvTransactions.map(x => x.id === t.id ? { ...x, selected: !x.selected } : x))} />
                <div style={{ flex: 1 }}><div style={{ color: theme.text, fontSize: '13px' }}>{t.description}</div></div>
                <div style={{ color: t.isExpense ? theme.danger : theme.success, fontWeight: 600 }}>{t.isExpense ? '-' : '+'}${t.amount.toFixed(2)}</div>
                <select value={t.category} onChange={e => setCsvTransactions(csvTransactions.map(x => x.id === t.id ? { ...x, category: e.target.value } : x))} style={{ ...inputStyle, padding: '4px 8px', fontSize: '11px' }}>
                  {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => setShowCsvImport(false)} style={{ ...btnPrimary, background: theme.textMuted }}>Cancel</button>
              <button onClick={importCsvTransactions} style={btnSuccess}>Import ({csvTransactions.filter(t => t.selected).length})</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ padding: '16px 24px', background: theme.cardBg, borderBottom: '1px solid ' + theme.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setShowModeSelector(true)} style={{ padding: '8px 16px', background: appMode === 'budget' ? theme.success : theme.warning, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            {appMode === 'budget' ? '💰 Budget' : '📈 Trading'} ▼
          </button>
          <h1 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>Premium Finance</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['dashboard', 'overview', 'path', 'trading'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} style={{ padding: '8px 16px', background: activeTab === tab ? theme.accent : 'transparent', color: activeTab === tab ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
              {tab === 'dashboard' ? '📊' : tab === 'overview' ? '💎' : tab === 'path' ? '🎯' : '📈'} {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer' }}>{darkMode ? '☀️' : '🌙'}</button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* This Month Summary */}
            <div style={{ padding: '20px', background: 'linear-gradient(135deg, ' + theme.accent + '20, ' + theme.purple + '20)', borderRadius: '16px', border: '2px solid ' + theme.accent }}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>📅 {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div><div style={{ color: theme.textMuted, fontSize: '12px' }}>Income</div><div style={{ color: theme.success, fontSize: '24px', fontWeight: 700 }}>${currentMonthTotals.incomeTotal.toFixed(0)}</div></div>
                <div><div style={{ color: theme.textMuted, fontSize: '12px' }}>Expenses</div><div style={{ color: theme.danger, fontSize: '24px', fontWeight: 700 }}>${currentMonthTotals.expenseTotal.toFixed(0)}</div></div>
                <div><div style={{ color: theme.textMuted, fontSize: '12px' }}>Debt Payments</div><div style={{ color: theme.warning, fontSize: '24px', fontWeight: 700 }}>${currentMonthTotals.debtTotal.toFixed(0)}</div></div>
                <div><div style={{ color: theme.textMuted, fontSize: '12px' }}>Net</div><div style={{ color: currentMonthTotals.total >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>${currentMonthTotals.total.toFixed(0)}</div></div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={cardStyle}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Avg Monthly Income</div><div style={{ color: theme.success, fontSize: '24px', fontWeight: 700 }}>${monthlyIncome.toFixed(0)}</div></div>
              <div style={cardStyle}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Avg Monthly Out</div><div style={{ color: theme.danger, fontSize: '24px', fontWeight: 700 }}>${totalOutgoing.toFixed(0)}</div></div>
              <div style={cardStyle}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Avg Surplus</div><div style={{ color: monthlySurplus >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>${monthlySurplus.toFixed(0)}</div></div>
              <div style={cardStyle}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Total Debt</div><div style={{ color: theme.danger, fontSize: '24px', fontWeight: 700 }}>${totalDebtBalance.toFixed(0)}</div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Income */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', color: theme.success }}>💰 Income</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <input placeholder="Name" value={newIncome.name} onChange={e => setNewIncome({ ...newIncome, name: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                  <input type="number" placeholder="$" value={newIncome.amount} onChange={e => setNewIncome({ ...newIncome, amount: e.target.value })} style={{ ...inputStyle, width: '80px' }} />
                  <select value={newIncome.frequency} onChange={e => setNewIncome({ ...newIncome, frequency: e.target.value })} style={inputStyle}>
                    <option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option>
                  </select>
                  <button onClick={addIncome} style={btnSuccess}>Add</button>
                </div>
                {incomeStreams.map(inc => (
                  <div key={inc.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <div><div style={{ color: theme.text, fontWeight: 600 }}>{inc.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>${inc.amount}/{inc.frequency}</div></div>
                    <button onClick={() => setIncomeStreams(incomeStreams.filter(i => i.id !== inc.id))} style={{ background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>×</button>
                  </div>
                ))}
              </div>

              {/* Expenses */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: theme.danger }}>💸 Expenses</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setShowPresets(!showPresets)} style={{ ...btnPrimary, padding: '6px 12px', fontSize: '12px', background: theme.purple }}>📋 Presets</button>
                    <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCsvUpload} style={{ display: 'none' }} />
                    <button onClick={() => fileInputRef.current?.click()} style={{ ...btnPrimary, padding: '6px 12px', fontSize: '12px' }}>📤 CSV</button>
                  </div>
                </div>
                {showPresets && (
                  <div style={{ marginBottom: '16px', padding: '12px', background: darkMode ? '#334155' : '#f1f5f9', borderRadius: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {presetBills.map((p, i) => <button key={i} onClick={() => addPresetBill(p)} style={{ padding: '6px 12px', background: darkMode ? '#475569' : '#e2e8f0', color: theme.text, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>{p.name}</button>)}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <input placeholder="Name" value={newExpense.name} onChange={e => setNewExpense({ ...newExpense, name: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                  <input type="number" placeholder="$" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} style={{ ...inputStyle, width: '80px' }} />
                  <select value={newExpense.frequency} onChange={e => setNewExpense({ ...newExpense, frequency: e.target.value })} style={inputStyle}>
                    <option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option>
                  </select>
                  <button onClick={addExpense} style={btnDanger}>Add</button>
                </div>
                {expenses.map(exp => (
                  <div key={exp.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <div><div style={{ color: theme.text, fontWeight: 600 }}>{exp.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>${exp.amount}/{exp.frequency}</div></div>
                    <button onClick={() => setExpenses(expenses.filter(e => e.id !== exp.id))} style={{ background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} style={btnPrimary}>← Prev</button>
                <h2 style={{ margin: 0, color: theme.text }}>{calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} style={btnPrimary}>Next →</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} style={{ padding: '8px', textAlign: 'center' as const, color: theme.textMuted, fontWeight: 600, fontSize: '12px' }}>{d}</div>)}
                {Array.from({ length: getDaysInMonth().firstDay }).map((_, i) => <div key={'e' + i} />)}
                {Array.from({ length: getDaysInMonth().daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const items = getCalendarItemsForDay(day)
                  const isToday = new Date().getDate() === day && new Date().getMonth() === calendarMonth.getMonth()
                  return (
                    <div key={day} onClick={() => items.length > 0 && setExpandedDay({ day, items })} style={{ minHeight: '80px', padding: '6px', background: isToday ? theme.accent + '20' : (darkMode ? '#1e293b' : '#fafafa'), borderRadius: '8px', border: isToday ? '2px solid ' + theme.accent : '1px solid ' + theme.border, cursor: items.length > 0 ? 'pointer' : 'default' }}>
                      <div style={{ fontWeight: isToday ? 700 : 500, color: isToday ? theme.accent : theme.text, fontSize: '13px' }}>{day}</div>
                      {items.slice(0, 2).map(item => (
                        <div key={item.id} style={{ fontSize: '10px', padding: '2px 4px', marginTop: '2px', background: item.isPaid ? theme.border : (item.type === 'income' ? '#d1fae5' : '#fee2e2'), borderRadius: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, color: '#1e293b' }}>{item.name}</div>
                      ))}
                      {items.length > 2 && <div style={{ fontSize: '9px', color: theme.accent, marginTop: '2px' }}>+{items.length - 2} more</div>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Debts */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.danger }}>💳 Debts</h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input placeholder="Name" value={newDebt.name} onChange={e => setNewDebt({ ...newDebt, name: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                <input type="number" placeholder="Balance" value={newDebt.balance} onChange={e => setNewDebt({ ...newDebt, balance: e.target.value })} style={{ ...inputStyle, width: '100px' }} />
                <input type="number" placeholder="%" value={newDebt.interestRate} onChange={e => setNewDebt({ ...newDebt, interestRate: e.target.value })} style={{ ...inputStyle, width: '60px' }} />
                <input type="number" placeholder="Min $" value={newDebt.minPayment} onChange={e => setNewDebt({ ...newDebt, minPayment: e.target.value })} style={{ ...inputStyle, width: '80px' }} />
                <button onClick={addDebt} style={btnDanger}>Add</button>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button onClick={() => setPayoffMethod('avalanche')} style={{ ...btnPrimary, background: payoffMethod === 'avalanche' ? theme.success : theme.border }}>Avalanche</button>
                <button onClick={() => setPayoffMethod('snowball')} style={{ ...btnPrimary, background: payoffMethod === 'snowball' ? theme.success : theme.border }}>Snowball</button>
              </div>
              {debts.sort((a, b) => payoffMethod === 'avalanche' ? parseFloat(b.interestRate) - parseFloat(a.interestRate) : parseFloat(a.balance) - parseFloat(b.balance)).map((debt, idx) => (
                <div key={debt.id} style={{ padding: '16px', marginBottom: '12px', background: darkMode ? '#334155' : '#fef2f2', borderRadius: '12px', border: idx === 0 ? '2px solid ' + theme.success : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: theme.text, fontWeight: 600 }}>{debt.name}</span>
                      {idx === 0 && <span style={{ marginLeft: '8px', padding: '2px 8px', background: theme.success, color: 'white', borderRadius: '10px', fontSize: '10px' }}>FOCUS</span>}
                      <div style={{ color: theme.textMuted, fontSize: '12px' }}>${debt.balance} @ {debt.interestRate}% • Min: ${debt.minPayment}/mo</div>
                    </div>
                    <button onClick={() => setDebts(debts.filter(d => d.id !== debt.id))} style={{ background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>×</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Goals */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.purple }}>🎯 Goals</h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input placeholder="Name" value={newGoal.name} onChange={e => setNewGoal({ ...newGoal, name: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                <input type="number" placeholder="Target $" value={newGoal.target} onChange={e => setNewGoal({ ...newGoal, target: e.target.value })} style={{ ...inputStyle, width: '100px' }} />
                <input type="number" placeholder="Saved $" value={newGoal.saved} onChange={e => setNewGoal({ ...newGoal, saved: e.target.value })} style={{ ...inputStyle, width: '80px' }} />
                <input type="number" placeholder="Payment $" value={newGoal.paymentAmount} onChange={e => setNewGoal({ ...newGoal, paymentAmount: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
                <button onClick={addGoal} style={{ ...btnPrimary, background: theme.purple }}>Add</button>
              </div>
              {goals.map(goal => {
                const progress = (parseFloat(goal.saved || '0') / parseFloat(goal.target || '1')) * 100
                return (
                  <div key={goal.id} style={{ padding: '16px', marginBottom: '12px', background: darkMode ? '#334155' : '#faf5ff', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ color: theme.text, fontWeight: 600 }}>{goal.name}</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => addGoalToCalendar(goal)} style={{ ...btnSuccess, padding: '4px 10px', fontSize: '11px' }}>📅 Calendar</button>
                        <button onClick={() => setGoals(goals.filter(g => g.id !== goal.id))} style={{ background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>×</button>
                      </div>
                    </div>
                    <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>${goal.saved} / ${goal.target}</div>
                    <div style={{ height: '8px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: Math.min(progress, 100) + '%', height: '100%', background: theme.purple }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'trading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={cardStyle}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Total P&L</div><div style={{ color: totalPL >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 700 }}>${totalPL.toFixed(2)}</div></div>
              <div style={cardStyle}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Trades</div><div style={{ color: theme.text, fontSize: '28px', fontWeight: 700 }}>{trades.length}</div></div>
              <div style={cardStyle}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Win Rate</div><div style={{ color: theme.success, fontSize: '28px', fontWeight: 700 }}>{trades.length > 0 ? ((trades.filter(t => parseFloat(t.profitLoss) > 0).length / trades.length) * 100).toFixed(0) : 0}%</div></div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.warning }}>📝 Add Trade</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input type="date" value={newTrade.date} onChange={e => setNewTrade({ ...newTrade, date: e.target.value })} style={inputStyle} />
                <input placeholder="Instrument" value={newTrade.instrument} onChange={e => setNewTrade({ ...newTrade, instrument: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                <select value={newTrade.direction} onChange={e => setNewTrade({ ...newTrade, direction: e.target.value })} style={inputStyle}>
                  <option value="long">Long</option><option value="short">Short</option>
                </select>
                <input type="number" placeholder="P&L $" value={newTrade.profitLoss} onChange={e => setNewTrade({ ...newTrade, profitLoss: e.target.value })} style={{ ...inputStyle, width: '100px' }} />
                <button onClick={addTrade} style={btnWarning}>Add</button>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>📋 Trade History</h3>
              {trades.length === 0 ? (
                <div style={{ color: theme.textMuted, textAlign: 'center' as const, padding: '40px' }}>No trades yet</div>
              ) : (
                trades.map(trade => (
                  <div key={trade.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: theme.text, fontWeight: 600 }}>{trade.instrument}</div>
                      <div style={{ color: theme.textMuted, fontSize: '12px' }}>{trade.date} • {trade.direction.toUpperCase()}</div>
                    </div>
                    <div style={{ color: parseFloat(trade.profitLoss) >= 0 ? theme.success : theme.danger, fontSize: '18px', fontWeight: 700 }}>${parseFloat(trade.profitLoss).toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div style={{ ...cardStyle, textAlign: 'center' as const }}>
            <h2 style={{ color: theme.text }}>📊 Overview</h2>
            <p style={{ color: theme.textMuted }}>Coming soon - detailed analytics and insights</p>
          </div>
        )}

        {activeTab === 'path' && (
          <div style={{ ...cardStyle, textAlign: 'center' as const }}>
            <h2 style={{ color: theme.text }}>🎯 Financial Path</h2>
            <p style={{ color: theme.textMuted }}>Coming soon - your path to financial freedom</p>
          </div>
        )}
      </main>
    </div>
  )
}
