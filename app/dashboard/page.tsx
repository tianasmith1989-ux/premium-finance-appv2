'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useRef } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  const [appMode, setAppMode] = useState<'budget' | 'trading' | null>(null)
  const [showModeSelector, setShowModeSelector] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trading'>('dashboard')
  const [darkMode, setDarkMode] = useState(true)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  
  const [incomeStreams, setIncomeStreams] = useState<any[]>([])
  const [newIncome, setNewIncome] = useState({ name: '', amount: '', frequency: 'monthly', startDate: new Date().toISOString().split('T')[0] })
  const [expenses, setExpenses] = useState<any[]>([])
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', frequency: 'monthly', dueDate: new Date().toISOString().split('T')[0] })
  const [debts, setDebts] = useState<any[]>([])
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', interestRate: '', minPayment: '', paymentDate: new Date().toISOString().split('T')[0] })
  const [goals, setGoals] = useState<any[]>([])
  const [newGoal, setNewGoal] = useState({ name: '', target: '', saved: '0', paymentAmount: '', startDate: new Date().toISOString().split('T')[0], savingsFrequency: 'monthly' })
  const [trades, setTrades] = useState<any[]>([])
  const [newTrade, setNewTrade] = useState({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', profitLoss: '' })
  const [expandedDay, setExpandedDay] = useState<{day: number, items: any[]} | null>(null)
  const [paidOccurrences, setPaidOccurrences] = useState<Set<string>>(new Set())
  
  const [showPresets, setShowPresets] = useState(false)
  const [showCsvImport, setShowCsvImport] = useState(false)
  const [csvTransactions, setCsvTransactions] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  const btnStyle: React.CSSProperties = { padding: '10px 20px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }
  const cardStyle: React.CSSProperties = { padding: '24px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }

  const presetBills = [
    { name: 'Rent', amount: '', frequency: 'monthly' },
    { name: 'Electricity', amount: '', frequency: 'monthly' },
    { name: 'Internet', amount: '', frequency: 'monthly' },
    { name: 'Netflix', amount: '15.99', frequency: 'monthly' },
    { name: 'Groceries', amount: '', frequency: 'weekly' },
  ]

  const getOccurrencesInMonth = (startDate: string, frequency: string, month: number, year: number) => {
    if (!startDate) return 0
    const start = new Date(startDate)
    const monthEnd = new Date(year, month + 1, 0)
    if (start > monthEnd) return 0
    if (frequency === 'monthly') return 1
    if (frequency === 'weekly') {
      let count = 0
      const current = new Date(start)
      const monthStart = new Date(year, month, 1)
      while (current < monthStart) current.setDate(current.getDate() + 7)
      while (current <= monthEnd) { count++; current.setDate(current.getDate() + 7) }
      return count
    }
    if (frequency === 'fortnightly') {
      let count = 0
      const current = new Date(start)
      const monthStart = new Date(year, month, 1)
      while (current < monthStart) current.setDate(current.getDate() + 14)
      while (current <= monthEnd) { count++; current.setDate(current.getDate() + 14) }
      return count
    }
    return 1
  }

  const month = calendarMonth.getMonth()
  const year = calendarMonth.getFullYear()
  const thisMonthIncome = incomeStreams.reduce((s, i) => s + parseFloat(i.amount || '0') * getOccurrencesInMonth(i.startDate, i.frequency, month, year), 0)
  const thisMonthExpenses = expenses.reduce((s, e) => s + parseFloat(e.amount || '0') * getOccurrencesInMonth(e.dueDate, e.frequency, month, year), 0)
  const thisMonthDebt = debts.reduce((s, d) => s + parseFloat(d.minPayment || '0') * getOccurrencesInMonth(d.paymentDate, 'monthly', month, year), 0)
  const thisMonthNet = thisMonthIncome - thisMonthExpenses - thisMonthDebt
  const totalDebt = debts.reduce((s, d) => s + parseFloat(d.balance || '0'), 0)
  const totalPL = trades.reduce((s, t) => s + parseFloat(t.profitLoss || '0'), 0)

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const getCalendarItems = (day: number) => {
    const items: any[] = []
    const checkDate = new Date(year, month, day)
    
    const addItem = (item: any, type: string) => {
      if (!item.startDate && !item.dueDate && !item.paymentDate) return
      const startDate = new Date(item.startDate || item.dueDate || item.paymentDate)
      if (startDate > checkDate) return
      const freq = item.frequency || item.savingsFrequency || 'monthly'
      let match = false
      if (freq === 'monthly' && startDate.getDate() === day) match = true
      else if (freq === 'weekly') {
        const diff = Math.floor((checkDate.getTime() - startDate.getTime()) / 86400000)
        match = diff >= 0 && diff % 7 === 0
      } else if (freq === 'fortnightly') {
        const diff = Math.floor((checkDate.getTime() - startDate.getTime()) / 86400000)
        match = diff >= 0 && diff % 14 === 0
      }
      if (match) {
        const id = type + '-' + item.id + '-' + year + '-' + month + '-' + day
        items.push({ ...item, itemType: type, uniqueId: id, isPaid: paidOccurrences.has(id) })
      }
    }
    
    incomeStreams.forEach(i => addItem(i, 'income'))
    expenses.forEach(e => addItem(e, 'expense'))
    debts.forEach(d => addItem({ ...d, dueDate: d.paymentDate }, 'debt'))
    goals.filter(g => g.paymentAmount && g.startDate).forEach(g => addItem(g, 'goal'))
    return items
  }

  const togglePaid = (id: string) => {
    const newSet = new Set(paidOccurrences)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setPaidOccurrences(newSet)
  }

  const addPreset = (p: any) => {
    const amt = prompt('Amount for ' + p.name + ':', p.amount || '')
    if (amt) setExpenses([...expenses, { id: Date.now(), name: p.name, amount: amt, frequency: p.frequency, dueDate: new Date().toISOString().split('T')[0] }])
  }

  const handleCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const lines = (ev.target?.result as string).split('\n').slice(1).filter(l => l.trim())
      const txns = lines.map((line, i) => {
        const parts = line.split(',').map(p => p.replace(/"/g, '').trim())
        const amt = parseFloat(parts.find(p => !isNaN(parseFloat(p.replace(/[$,]/g, ''))))?.replace(/[$,]/g, '') || '0')
        const desc = parts.find(p => isNaN(parseFloat(p.replace(/[$,]/g, ''))) && p.length > 2) || 'Transaction'
        return { id: Date.now() + i, desc, amount: Math.abs(amt), isExpense: amt < 0, selected: amt < 0, category: 'other' }
      }).filter(t => t.amount > 0)
      setCsvTransactions(txns)
      setShowCsvImport(true)
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const importCsv = () => {
    csvTransactions.filter(t => t.selected).forEach(t => {
      if (t.isExpense) setExpenses(prev => [...prev, { id: Date.now() + Math.random(), name: t.desc, amount: t.amount.toString(), frequency: 'once', dueDate: new Date().toISOString().split('T')[0] }])
      else setIncomeStreams(prev => [...prev, { id: Date.now() + Math.random(), name: t.desc, amount: t.amount.toString(), frequency: 'once', startDate: new Date().toISOString().split('T')[0] }])
    })
    setShowCsvImport(false)
    setCsvTransactions([])
  }

  const addGoalToCalendar = (g: any) => {
    if (!g.paymentAmount) { alert('Set payment amount first'); return }
    alert(g.name + ' is on calendar!')
  }

  if (showModeSelector) {
    return (
      <div style={{ minHeight: '100vh', background: darkMode ? '#0f172a' : '#f0f9ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <h1 style={{ fontSize: '36px', color: theme.text, marginBottom: '8px' }}>Welcome{user?.firstName ? ', ' + user.firstName : ''}!</h1>
        <p style={{ color: theme.textMuted, marginBottom: '40px' }}>Choose your mode</p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => { setAppMode('budget'); setShowModeSelector(false) }} style={{ padding: '30px 40px', background: theme.success, color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '18px', fontWeight: 600 }}>💰 Budget Mode</button>
          <button onClick={() => { setAppMode('trading'); setShowModeSelector(false); setActiveTab('trading') }} style={{ padding: '30px 40px', background: theme.warning, color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '18px', fontWeight: 600 }}>📈 Trading Mode</button>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} style={{ marginTop: '30px', padding: '10px 20px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.textMuted, cursor: 'pointer' }}>{darkMode ? '☀️' : '🌙'}</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      {expandedDay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setExpandedDay(null)}>
          <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: theme.text, margin: '0 0 16px 0' }}>{calendarMonth.toLocaleDateString('en-US', { month: 'long' })} {expandedDay.day}</h3>
            {expandedDay.items.map(item => (
              <div key={item.uniqueId} style={{ padding: '12px', marginBottom: '8px', background: item.isPaid ? theme.border : (item.itemType === 'income' ? '#d1fae5' : '#fee2e2'), borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontWeight: 600, color: '#1e293b' }}>{item.name}</div><div style={{ fontSize: '12px', color: '#64748b' }}>${item.amount || item.minPayment || item.paymentAmount}</div></div>
                <button onClick={() => togglePaid(item.uniqueId)} style={{ padding: '6px 12px', background: item.isPaid ? '#6b7280' : theme.success, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{item.isPaid ? '✓' : 'Pay'}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCsvImport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowCsvImport(false)}>
          <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '95%', maxHeight: '70vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: theme.text, margin: '0 0 16px 0' }}>Import Transactions</h3>
            {csvTransactions.map(t => (
              <div key={t.id} style={{ padding: '10px', marginBottom: '8px', background: t.selected ? (darkMode ? '#1e3a5f' : '#eff6ff') : 'transparent', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" checked={t.selected} onChange={() => setCsvTransactions(csvTransactions.map(x => x.id === t.id ? { ...x, selected: !x.selected } : x))} />
                <div style={{ flex: 1, color: theme.text, fontSize: '13px' }}>{t.desc}</div>
                <div style={{ color: t.isExpense ? theme.danger : theme.success, fontWeight: 600 }}>{t.isExpense ? '-' : '+'}${t.amount.toFixed(2)}</div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => setShowCsvImport(false)} style={{ ...btnStyle, background: theme.textMuted }}>Cancel</button>
              <button onClick={importCsv} style={{ ...btnStyle, background: theme.success }}>Import ({csvTransactions.filter(t => t.selected).length})</button>
            </div>
          </div>
        </div>
      )}

      <header style={{ padding: '16px 24px', background: theme.cardBg, borderBottom: '1px solid ' + theme.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setShowModeSelector(true)} style={{ padding: '8px 16px', background: appMode === 'budget' ? theme.success : theme.warning, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{appMode === 'budget' ? '💰' : '📈'} {appMode}</button>
          <h1 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>Premium Finance</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setActiveTab('dashboard')} style={{ ...btnStyle, background: activeTab === 'dashboard' ? theme.accent : 'transparent', border: '1px solid ' + theme.border }}>Dashboard</button>
          <button onClick={() => setActiveTab('trading')} style={{ ...btnStyle, background: activeTab === 'trading' ? theme.warning : 'transparent', border: '1px solid ' + theme.border }}>Trading</button>
          <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text }}>{darkMode ? '☀️' : '🌙'}</button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ padding: '20px', background: theme.accent + '20', borderRadius: '16px', border: '2px solid ' + theme.accent }}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>{calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div><div style={{ color: theme.textMuted, fontSize: '12px' }}>Income</div><div style={{ color: theme.success, fontSize: '24px', fontWeight: 700 }}>${thisMonthIncome.toFixed(0)}</div></div>
                <div><div style={{ color: theme.textMuted, fontSize: '12px' }}>Expenses</div><div style={{ color: theme.danger, fontSize: '24px', fontWeight: 700 }}>${thisMonthExpenses.toFixed(0)}</div></div>
                <div><div style={{ color: theme.textMuted, fontSize: '12px' }}>Debt Payments</div><div style={{ color: theme.warning, fontSize: '24px', fontWeight: 700 }}>${thisMonthDebt.toFixed(0)}</div></div>
                <div><div style={{ color: theme.textMuted, fontSize: '12px' }}>Net</div><div style={{ color: thisMonthNet >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>${thisMonthNet.toFixed(0)}</div></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', color: theme.success }}>💰 Income</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <input placeholder="Name" value={newIncome.name} onChange={e => setNewIncome({ ...newIncome, name: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                  <input type="number" placeholder="$" value={newIncome.amount} onChange={e => setNewIncome({ ...newIncome, amount: e.target.value })} style={{ ...inputStyle, width: '80px' }} />
                  <select value={newIncome.frequency} onChange={e => setNewIncome({ ...newIncome, frequency: e.target.value })} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                  <button onClick={() => { if (newIncome.name && newIncome.amount) { setIncomeStreams([...incomeStreams, { ...newIncome, id: Date.now() }]); setNewIncome({ name: '', amount: '', frequency: 'monthly', startDate: new Date().toISOString().split('T')[0] }) }}} style={{ ...btnStyle, background: theme.success }}>Add</button>
                </div>
                {incomeStreams.map(i => (<div key={i.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}><div><div style={{ color: theme.text, fontWeight: 600 }}>{i.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>${i.amount}/{i.frequency}</div></div><button onClick={() => setIncomeStreams(incomeStreams.filter(x => x.id !== i.id))} style={{ background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>×</button></div>))}
              </div>

              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: theme.danger }}>💸 Expenses</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setShowPresets(!showPresets)} style={{ ...btnStyle, padding: '6px 12px', fontSize: '12px', background: theme.purple }}>Presets</button>
                    <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCsv} style={{ display: 'none' }} />
                    <button onClick={() => fileInputRef.current?.click()} style={{ ...btnStyle, padding: '6px 12px', fontSize: '12px' }}>CSV</button>
                  </div>
                </div>
                {showPresets && (<div style={{ marginBottom: '16px', padding: '12px', background: darkMode ? '#334155' : '#f1f5f9', borderRadius: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{presetBills.map((p, i) => <button key={i} onClick={() => addPreset(p)} style={{ padding: '6px 12px', background: darkMode ? '#475569' : '#e2e8f0', color: theme.text, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>{p.name}</button>)}</div>)}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <input placeholder="Name" value={newExpense.name} onChange={e => setNewExpense({ ...newExpense, name: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                  <input type="number" placeholder="$" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} style={{ ...inputStyle, width: '80px' }} />
                  <select value={newExpense.frequency} onChange={e => setNewExpense({ ...newExpense, frequency: e.target.value })} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                  <button onClick={() => { if (newExpense.name && newExpense.amount) { setExpenses([...expenses, { ...newExpense, id: Date.now() }]); setNewExpense({ name: '', amount: '', frequency: 'monthly', dueDate: new Date().toISOString().split('T')[0] }) }}} style={{ ...btnStyle, background: theme.danger }}>Add</button>
                </div>
                {expenses.map(e => (<div key={e.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}><div><div style={{ color: theme.text, fontWeight: 600 }}>{e.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>${e.amount}/{e.frequency}</div></div><button onClick={() => setExpenses(expenses.filter(x => x.id !== e.id))} style={{ background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>×</button></div>))}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={() => setCalendarMonth(new Date(year, month - 1, 1))} style={btnStyle}>← Prev</button>
                <h2 style={{ margin: 0, color: theme.text }}>{calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                <button onClick={() => setCalendarMonth(new Date(year, month + 1, 1))} style={btnStyle}>Next →</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} style={{ padding: '8px', textAlign: 'center' as const, color: theme.textMuted, fontWeight: 600, fontSize: '12px' }}>{d}</div>)}
                {Array.from({ length: getDaysInMonth().firstDay }).map((_, i) => <div key={'e' + i} />)}
                {Array.from({ length: getDaysInMonth().daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const items = getCalendarItems(day)
                  const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year
                  return (
                    <div key={day} onClick={() => items.length > 0 && setExpandedDay({ day, items })} style={{ minHeight: '70px', padding: '6px', background: isToday ? theme.accent + '20' : (darkMode ? '#1e293b' : '#fafafa'), borderRadius: '8px', border: isToday ? '2px solid ' + theme.accent : '1px solid ' + theme.border, cursor: items.length > 0 ? 'pointer' : 'default' }}>
                      <div style={{ fontWeight: isToday ? 700 : 500, color: isToday ? theme.accent : theme.text, fontSize: '13px' }}>{day}</div>
                      {items.slice(0, 2).map(item => (<div key={item.uniqueId} style={{ fontSize: '9px', padding: '2px 4px', marginTop: '2px', background: item.isPaid ? theme.border : (item.itemType === 'income' ? '#d1fae5' : '#fee2e2'), borderRadius: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, color: '#1e293b' }}>{item.name}</div>))}
                      {items.length > 2 && <div style={{ fontSize: '9px', color: theme.accent }}>+{items.length - 2}</div>}
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.danger }}>💳 Debts (${totalDebt.toFixed(0)})</h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input placeholder="Name" value={newDebt.name} onChange={e => setNewDebt({ ...newDebt, name: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                <input type="number" placeholder="Balance" value={newDebt.balance} onChange={e => setNewDebt({ ...newDebt, balance: e.target.value })} style={{ ...inputStyle, width: '100px' }} />
                <input type="number" placeholder="%" value={newDebt.interestRate} onChange={e => setNewDebt({ ...newDebt, interestRate: e.target.value })} style={{ ...inputStyle, width: '60px' }} />
                <input type="number" placeholder="Min $" value={newDebt.minPayment} onChange={e => setNewDebt({ ...newDebt, minPayment: e.target.value })} style={{ ...inputStyle, width: '80px' }} />
                <button onClick={() => { if (newDebt.name && newDebt.balance) { setDebts([...debts, { ...newDebt, id: Date.now() }]); setNewDebt({ name: '', balance: '', interestRate: '', minPayment: '', paymentDate: new Date().toISOString().split('T')[0] }) }}} style={{ ...btnStyle, background: theme.danger }}>Add</button>
              </div>
              {debts.map(d => (<div key={d.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#334155' : '#fef2f2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}><div><div style={{ color: theme.text, fontWeight: 600 }}>{d.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>${d.balance} @ {d.interestRate}% • Min: ${d.minPayment}/mo</div></div><button onClick={() => setDebts(debts.filter(x => x.id !== d.id))} style={{ background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>×</button></div>))}
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.purple }}>🎯 Goals</h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input placeholder="Name" value={newGoal.name} onChange={e => setNewGoal({ ...newGoal, name: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                <input type="number" placeholder="Target" value={newGoal.target} onChange={e => setNewGoal({ ...newGoal, target: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
                <input type="number" placeholder="Saved" value={newGoal.saved} onChange={e => setNewGoal({ ...newGoal, saved: e.target.value })} style={{ ...inputStyle, width: '80px' }} />
                <input type="number" placeholder="Payment" value={newGoal.paymentAmount} onChange={e => setNewGoal({ ...newGoal, paymentAmount: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
                <button onClick={() => { if (newGoal.name && newGoal.target) { setGoals([...goals, { ...newGoal, id: Date.now() }]); setNewGoal({ name: '', target: '', saved: '0', paymentAmount: '', startDate: new Date().toISOString().split('T')[0], savingsFrequency: 'monthly' }) }}} style={{ ...btnStyle, background: theme.purple }}>Add</button>
              </div>
              {goals.map(g => {
                const pct = (parseFloat(g.saved || '0') / parseFloat(g.target || '1')) * 100
                return (<div key={g.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#334155' : '#faf5ff', borderRadius: '8px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><div style={{ color: theme.text, fontWeight: 600 }}>{g.name}</div><div style={{ display: 'flex', gap: '8px' }}><button onClick={() => addGoalToCalendar(g)} style={{ ...btnStyle, padding: '4px 10px', fontSize: '11px', background: theme.success }}>📅</button><button onClick={() => setGoals(goals.filter(x => x.id !== g.id))} style={{ background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>×</button></div></div><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '6px' }}>${g.saved} / ${g.target}</div><div style={{ height: '6px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: Math.min(pct, 100) + '%', height: '100%', background: theme.purple }} /></div></div>)
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
              <h3 style={{ margin: '0 0 16px 0', color: theme.warning }}>Add Trade</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input type="date" value={newTrade.date} onChange={e => setNewTrade({ ...newTrade, date: e.target.value })} style={inputStyle} />
                <input placeholder="Instrument" value={newTrade.instrument} onChange={e => setNewTrade({ ...newTrade, instrument: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                <select value={newTrade.direction} onChange={e => setNewTrade({ ...newTrade, direction: e.target.value })} style={inputStyle}><option value="long">Long</option><option value="short">Short</option></select>
                <input type="number" placeholder="P&L" value={newTrade.profitLoss} onChange={e => setNewTrade({ ...newTrade, profitLoss: e.target.value })} style={{ ...inputStyle, width: '100px' }} />
                <button onClick={() => { if (newTrade.instrument) { setTrades([...trades, { ...newTrade, id: Date.now() }]); setNewTrade({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', profitLoss: '' }) }}} style={{ ...btnStyle, background: theme.warning }}>Add</button>
              </div>
            </div>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>Trade History</h3>
              {trades.length === 0 ? <div style={{ color: theme.textMuted, textAlign: 'center' as const, padding: '40px' }}>No trades yet</div> : trades.map(t => (<div key={t.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}><div><div style={{ color: theme.text, fontWeight: 600 }}>{t.instrument}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{t.date} • {t.direction}</div></div><div style={{ color: parseFloat(t.profitLoss) >= 0 ? theme.success : theme.danger, fontSize: '18px', fontWeight: 700 }}>${parseFloat(t.profitLoss).toFixed(2)}</div></div>))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
