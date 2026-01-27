'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  // MAIN NAVIGATION
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'path' | 'trading'>('dashboard')
  const [darkMode, setDarkMode] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  
  // ============== INCOME STATE ==============
  const [incomeStreams, setIncomeStreams] = useState<any[]>([])
  const [newIncome, setNewIncome] = useState({ 
    name: '', 
    amount: '', 
    frequency: 'monthly', 
    type: 'active', // 'active' or 'passive'
    startDate: new Date().toISOString().split('T')[0]
  })
  
  // ============== EXPENSES STATE ==============
  const [expenses, setExpenses] = useState<any[]>([])
  const [newExpense, setNewExpense] = useState({ 
    name: '', 
    amount: '', 
    frequency: 'monthly', 
    category: 'bills',
    dueDate: new Date().toISOString().split('T')[0]
  })
  
  // ============== DEBTS STATE ==============
  const [debts, setDebts] = useState<any[]>([])
  const [newDebt, setNewDebt] = useState({ 
    name: '', 
    balance: '', 
    interestRate: '', 
    minPayment: '', 
    frequency: 'monthly',
    paymentDate: new Date().toISOString().split('T')[0]
  })
  const [extraPayment, setExtraPayment] = useState('')
  const [payoffMethod, setPayoffMethod] = useState<'snowball' | 'avalanche'>('avalanche')
  
  // ============== GOALS STATE ==============
  const [goals, setGoals] = useState<any[]>([])
  const [newGoal, setNewGoal] = useState({ 
    name: '', 
    target: '', 
    saved: '', 
    deadline: '', 
    savingsFrequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0]
  })
  
  // ============== ASSETS & LIABILITIES ==============
  const [assets, setAssets] = useState<any[]>([])
  const [newAsset, setNewAsset] = useState({ name: '', value: '', type: 'savings' })
  const [liabilities, setLiabilities] = useState<any[]>([])
  const [newLiability, setNewLiability] = useState({ name: '', value: '', type: 'loan' })
  
  // ============== CALENDAR & PAID TRACKING ==============
  const [paidOccurrences, setPaidOccurrences] = useState<Set<string>>(new Set())
  
  // ============== AI CHAT ==============
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [chatInput, setChatInput] = useState('')
  const [isAskingCoach, setIsAskingCoach] = useState(false)
  
  // ============== TRADING ==============
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
  
  // ============== THEME ==============
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
  
  // Reusable styles
  const inputStyle = { 
    padding: '10px 14px', 
    border: `2px solid ${theme.inputBorder}`, 
    borderRadius: '8px', 
    fontSize: '14px', 
    background: theme.input, 
    color: theme.text 
  }
  const btnPrimary = { padding: '10px 20px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' as const }
  const btnSuccess = { ...btnPrimary, background: theme.success }
  const btnDanger = { ...btnPrimary, background: theme.danger }
  const btnPurple = { ...btnPrimary, background: theme.purple }
  const btnWarning = { ...btnPrimary, background: theme.warning }
  const cardStyle = { padding: '24px', background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}` }
  // ============== CALCULATIONS ==============
  
  const convertToMonthly = (amount: number, frequency: string) => {
    if (frequency === 'weekly') return amount * (52 / 12)
    if (frequency === 'fortnightly') return amount * (26 / 12)
    if (frequency === 'yearly') return amount / 12
    return amount
  }
  
  // Income calculations
  const monthlyIncome = incomeStreams.reduce((sum, inc) => 
    sum + convertToMonthly(parseFloat(inc.amount || 0), inc.frequency), 0)
  
  const activeIncome = incomeStreams
    .filter(inc => inc.type === 'active')
    .reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || 0), inc.frequency), 0)
  
  const passiveIncome = incomeStreams
    .filter(inc => inc.type === 'passive')
    .reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || 0), inc.frequency), 0)
  
  const passiveIncomePercentage = monthlyIncome > 0 ? (passiveIncome / monthlyIncome) * 100 : 0
  
  // Expense calculations
  const monthlyExpenses = expenses.reduce((sum, exp) => 
    sum + convertToMonthly(parseFloat(exp.amount || 0), exp.frequency), 0)
  
  // Debt calculations
  const monthlyDebtPayments = debts.reduce((sum, debt) => 
    sum + convertToMonthly(parseFloat(debt.minPayment || 0), debt.frequency), 0)
  
  const totalDebtBalance = debts.reduce((sum, d) => sum + parseFloat(d.balance || 0), 0)
  
  // Totals
  const totalOutgoing = monthlyExpenses + monthlyDebtPayments
  const monthlySurplus = monthlyIncome - totalOutgoing
  
  // Net Worth
  const totalAssets = assets.reduce((sum, a) => sum + parseFloat(a.value || 0), 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + parseFloat(l.value || 0), 0)
  const netWorth = totalAssets - totalLiabilities - totalDebtBalance
  
  // Goals
  const totalGoalsTarget = goals.reduce((sum, g) => sum + parseFloat(g.target || 0), 0)
  const totalGoalsSaved = goals.reduce((sum, g) => sum + parseFloat(g.saved || 0), 0)
  
  // Previous month (simplified - in production, store historical data)
  const previousMonthSurplus = monthlySurplus
  
  // Trading stats
  const totalPL = trades.reduce((sum, t) => sum + parseFloat(t.profitLoss || 0), 0)
  const winRate = trades.length > 0 
    ? (trades.filter(t => parseFloat(t.profitLoss || 0) > 0).length / trades.length) * 100 
    : 0
  // ============== ALERTS ==============
  
  const getAlerts = () => {
    const alerts: any[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Check expenses
    expenses.forEach(exp => {
      const dueDate = new Date(exp.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilDue < 0) {
        alerts.push({ severity: 'danger', message: `${exp.name} is ${Math.abs(daysUntilDue)} days overdue`, amount: exp.amount })
      } else if (daysUntilDue <= 3) {
        alerts.push({ severity: 'warning', message: `${exp.name} due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`, amount: exp.amount })
      }
    })
    
    // Check debts
    debts.forEach(debt => {
      if (!debt.paymentDate) return
      const dueDate = new Date(debt.paymentDate)
      dueDate.setHours(0, 0, 0, 0)
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilDue < 0) {
        alerts.push({ severity: 'danger', message: `${debt.name} payment is ${Math.abs(daysUntilDue)} days overdue`, amount: debt.minPayment })
      } else if (daysUntilDue <= 3) {
        alerts.push({ severity: 'warning', message: `${debt.name} payment due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`, amount: debt.minPayment })
      }
    })
    
    return alerts.sort((a, b) => (a.severity === 'danger' ? -1 : 1))
  }
  
  const alerts = getAlerts()

  // ============== CALENDAR FUNCTIONS ==============
  
  const getDaysInMonth = () => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth, month, year }
  }
  
  const prevMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
  const nextMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))
  
  // Calculate goal payment amount
  const calculateGoalPayment = (goal: any) => {
    const remaining = parseFloat(goal.target || 0) - parseFloat(goal.saved || 0)
    if (!goal.deadline || remaining <= 0) return 0
    const monthsRemaining = Math.max(1, Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)))
    const monthlyNeeded = remaining / monthsRemaining
    if (goal.savingsFrequency === 'weekly') return monthlyNeeded / (52 / 12)
    if (goal.savingsFrequency === 'fortnightly') return monthlyNeeded / (26 / 12)
    return monthlyNeeded
  }
  
  // Get all items for a calendar day (handles recurring)
  const getCalendarItemsForDay = (day: number) => {
    const { month, year } = getDaysInMonth()
    const items: any[] = []
    
    // Combine all sources
    const allItems = [
      // Income
      ...incomeStreams.map(inc => ({
        ...inc,
        id: `income-${inc.id}`,
        sourceId: inc.id,
        sourceType: 'income',
        name: `💰 ${inc.name}`,
        dueDate: inc.startDate,
        type: 'income'
      })),
      // Expenses
      ...expenses.map(exp => ({
        ...exp,
        id: `expense-${exp.id}`,
        sourceId: exp.id,
        sourceType: 'expense',
        name: `💸 ${exp.name}`,
        type: 'expense'
      })),
      // Debts
      ...debts.map(debt => ({
        id: `debt-${debt.id}`,
        sourceId: debt.id,
        sourceType: 'debt',
        name: `💳 ${debt.name}`,
        amount: debt.minPayment,
        dueDate: debt.paymentDate,
        frequency: debt.frequency,
        type: 'debt'
      })),
      // Goals
      ...goals.filter(g => g.deadline && g.startDate).map(goal => ({
        id: `goal-${goal.id}`,
        sourceId: goal.id,
        sourceType: 'goal',
        name: `🎯 ${goal.name}`,
        amount: calculateGoalPayment(goal).toFixed(2),
        dueDate: goal.startDate,
        frequency: goal.savingsFrequency,
        type: 'goal'
      }))
    ]
    
    allItems.forEach(item => {
      if (!item.dueDate) return
      
      const itemDate = new Date(item.dueDate)
      const itemDay = itemDate.getDate()
      const itemMonth = itemDate.getMonth()
      const itemYear = itemDate.getFullYear()
      
      const currentDate = new Date(year, month, day)
      const startDate = new Date(item.dueDate)
      let shouldShow = false
      
      // Original date
      if (itemDay === day && itemMonth === month && itemYear === year) {
        shouldShow = true
      }
      // Recurring
      else if (item.frequency && item.frequency !== 'once' && currentDate >= startDate) {
        if (item.frequency === 'weekly') {
          const daysDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
          shouldShow = daysDiff % 7 === 0
        } else if (item.frequency === 'fortnightly') {
          const daysDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
          shouldShow = daysDiff % 14 === 0
        } else if (item.frequency === 'monthly') {
          shouldShow = day === itemDay
        } else if (item.frequency === 'yearly') {
          shouldShow = day === itemDay && month === itemMonth
        }
      }
      
      if (shouldShow) {
        const occurrenceKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const uniqueId = `${item.id}-${occurrenceKey}`
        items.push({
          ...item,
          id: uniqueId,
          originalId: item.id,
          occurrenceDate: occurrenceKey,
          isPaid: paidOccurrences.has(uniqueId)
        })
      }
    })
    
    return items
  }
  // ============== TOGGLE PAID (updates balances!) ==============
  
  const togglePaid = (itemId: string, sourceType?: string, sourceId?: number, amount?: number) => {
    const newPaid = new Set(paidOccurrences)
    const paymentAmount = parseFloat(String(amount || 0))
    
    if (paidOccurrences.has(itemId)) {
      // UNPAY - reverse the changes
      newPaid.delete(itemId)
      
      if (sourceType === 'goal' && sourceId) {
        setGoals(goals.map(g => {
          if (g.id === sourceId) {
            const newSaved = Math.max(0, parseFloat(g.saved || 0) - paymentAmount)
            return { ...g, saved: newSaved.toFixed(2) }
          }
          return g
        }))
      } else if (sourceType === 'debt' && sourceId) {
        setDebts(debts.map(d => {
          if (d.id === sourceId) {
            const newBalance = parseFloat(d.balance || 0) + paymentAmount
            return { ...d, balance: newBalance.toFixed(2) }
          }
          return d
        }))
      }
    } else {
      // PAY - apply the changes
      newPaid.add(itemId)
      
      if (sourceType === 'goal' && sourceId) {
        setGoals(goals.map(g => {
          if (g.id === sourceId) {
            const newSaved = parseFloat(g.saved || 0) + paymentAmount
            return { ...g, saved: newSaved.toFixed(2) }
          }
          return g
        }))
      } else if (sourceType === 'debt' && sourceId) {
        setDebts(debts.map(d => {
          if (d.id === sourceId) {
            const newBalance = Math.max(0, parseFloat(d.balance || 0) - paymentAmount)
            return { ...d, balance: newBalance.toFixed(2) }
          }
          return d
        }))
      }
    }
    
    setPaidOccurrences(newPaid)
  }

  // ============== CRUD FUNCTIONS ==============
  
  // Income
  const addIncome = () => {
    if (!newIncome.name || !newIncome.amount) return
    setIncomeStreams([...incomeStreams, { ...newIncome, id: Date.now() }])
    setNewIncome({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0] })
  }
  const deleteIncome = (id: number) => setIncomeStreams(incomeStreams.filter(i => i.id !== id))
  
  // Expenses
  const addExpense = () => {
    if (!newExpense.name || !newExpense.amount) return
    setExpenses([...expenses, { ...newExpense, id: Date.now() }])
    setNewExpense({ name: '', amount: '', frequency: 'monthly', category: 'bills', dueDate: new Date().toISOString().split('T')[0] })
  }
  const deleteExpense = (id: number) => setExpenses(expenses.filter(e => e.id !== id))
  
  // Debts
  const addDebt = () => {
    if (!newDebt.name || !newDebt.balance) return
    setDebts([...debts, { ...newDebt, id: Date.now(), originalBalance: newDebt.balance }])
    setNewDebt({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: new Date().toISOString().split('T')[0] })
  }
  const deleteDebt = (id: number) => setDebts(debts.filter(d => d.id !== id))
  
  // Add Extra Debt Payment to target debt
  const addExtraPaymentToCalendar = () => {
    if (!extraPayment || parseFloat(extraPayment) <= 0) {
      alert('Please enter an extra payment amount')
      return
    }
    if (debts.length === 0) {
      alert('No debts to apply extra payment to')
      return
    }
    
    // Get target debt based on payoff method
    const sortedDebts = [...debts].sort((a, b) => {
      if (payoffMethod === 'snowball') return parseFloat(a.balance) - parseFloat(b.balance)
      return parseFloat(b.interestRate) - parseFloat(a.interestRate)
    })
    const targetDebt = sortedDebts[0]
    
    const paymentDate = prompt(
      `When should your extra payment of $${extraPayment} to ${targetDebt.name} start?\n\nEnter date (YYYY-MM-DD):`,
      new Date().toISOString().split('T')[0]
    )
    if (!paymentDate) return
    
    // Add as a new debt payment entry
    setDebts(debts.map(d => {
      if (d.id === targetDebt.id) {
        return {
          ...d,
          extraPayment: extraPayment,
          extraPaymentDate: paymentDate
        }
      }
      return d
    }))
    
    alert(`✅ Extra payment of $${extraPayment}/month added to ${targetDebt.name}`)
  }
  
  // Goals
  const addGoal = () => {
    if (!newGoal.name || !newGoal.target) return
    setGoals([...goals, { ...newGoal, id: Date.now() }])
    setNewGoal({ name: '', target: '', saved: '', deadline: '', savingsFrequency: 'monthly', startDate: new Date().toISOString().split('T')[0] })
  }
  const deleteGoal = (id: number) => setGoals(goals.filter(g => g.id !== id))
  
  // Assets
  const addAsset = () => {
    if (!newAsset.name || !newAsset.value) return
    setAssets([...assets, { ...newAsset, id: Date.now() }])
    setNewAsset({ name: '', value: '', type: 'savings' })
  }
  const deleteAsset = (id: number) => setAssets(assets.filter(a => a.id !== id))
  
  // Liabilities
  const addLiability = () => {
    if (!newLiability.name || !newLiability.value) return
    setLiabilities([...liabilities, { ...newLiability, id: Date.now() }])
    setNewLiability({ name: '', value: '', type: 'loan' })
  }
  const deleteLiability = (id: number) => setLiabilities(liabilities.filter(l => l.id !== id))
  
  // Trades
  const addTrade = () => {
    if (!newTrade.instrument) return
    setTrades([...trades, { ...newTrade, id: Date.now() }].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    setNewTrade({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' })
  }
  // ============== DEBT PAYOFF CALCULATOR ==============
  
  const calculateDebtPayoff = () => {
    const extra = parseFloat(extraPayment || '0')
    const sortedDebts = [...debts].sort((a, b) => {
      if (payoffMethod === 'snowball') return parseFloat(a.balance) - parseFloat(b.balance)
      return parseFloat(b.interestRate) - parseFloat(a.interestRate)
    })
    
    let remainingDebts = sortedDebts.map(d => ({ ...d, remainingBalance: parseFloat(d.balance) }))
    let totalInterestPaid = 0
    let monthsToPayoff = 0
    let availableExtra = extra
    
    while (remainingDebts.some(d => d.remainingBalance > 0) && monthsToPayoff < 600) {
      monthsToPayoff++
      remainingDebts.forEach((debt, idx) => {
        if (debt.remainingBalance <= 0) return
        const monthlyInterest = (debt.remainingBalance * parseFloat(debt.interestRate) / 100) / 12
        totalInterestPaid += monthlyInterest
        const minPayment = convertToMonthly(parseFloat(debt.minPayment), debt.frequency)
        const totalPayment = minPayment + (idx === 0 ? availableExtra : 0)
        debt.remainingBalance = Math.max(0, debt.remainingBalance + monthlyInterest - totalPayment)
        if (debt.remainingBalance === 0) availableExtra += minPayment
      })
    }
    
    return { monthsToPayoff, totalInterestPaid, payoffOrder: sortedDebts }
  }

  // ============== PATH TO GOALS CALCULATIONS ==============
  
  const calculateFinancialPath = () => {
    const monthlyNeed = totalOutgoing
    const passiveGap = monthlyNeed - passiveIncome
    const passiveCoverage = monthlyNeed > 0 ? (passiveIncome / monthlyNeed) * 100 : 0
    const fireNumber = (monthlyNeed * 12) * 25
    const currentInvestments = assets.filter(a => a.type === 'investment').reduce((sum, a) => sum + parseFloat(a.value || 0), 0)
    const monthlyInvestment = monthlySurplus > 0 ? monthlySurplus * 0.5 : 0
    const yearsToFI = monthlyInvestment > 0 ? Math.ceil((fireNumber - currentInvestments) / (monthlyInvestment * 12)) : 999
    return { monthlyNeed, passiveGap, passiveCoverage, fireNumber, currentInvestments, yearsToFI }
  }
  
  const fiPath = calculateFinancialPath()

  // ============== AI BUDGET COACH ==============
  
  const askBudgetCoach = async () => {
    if (!chatInput.trim()) return
    const newUserMessage = { role: 'user' as const, content: chatInput }
    setChatMessages([...chatMessages, newUserMessage])
    setChatInput('')
    setIsAskingCoach(true)
    
    try {
      const context = `
Monthly Income: $${monthlyIncome.toFixed(2)} (Active: $${activeIncome.toFixed(2)}, Passive: $${passiveIncome.toFixed(2)})
Passive Income %: ${passiveIncomePercentage.toFixed(1)}%
Monthly Expenses: $${monthlyExpenses.toFixed(2)}
Monthly Debt Payments: $${monthlyDebtPayments.toFixed(2)}
Monthly Surplus: $${monthlySurplus.toFixed(2)}
Total Debt: $${totalDebtBalance.toFixed(2)}
Net Worth: $${netWorth.toFixed(2)}
Goals: ${goals.map(g => `${g.name}: $${g.saved || 0}/$${g.target}`).join(', ') || 'None'}
Debts: ${debts.map(d => `${d.name}: $${d.balance} @ ${d.interestRate}%`).join(', ') || 'None'}`

      const response = await fetch('/api/budget-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: chatInput, financialContext: context })
      })
      const data = await response.json()
      setChatMessages([...chatMessages, newUserMessage, { role: 'assistant', content: data.advice || 'Sorry, I could not respond.' }])
    } catch {
      setChatMessages([...chatMessages, newUserMessage, { role: 'assistant', content: 'Sorry, something went wrong.' }])
    } finally {
      setIsAskingCoach(false)
    }
  }
  // ============== RENDER ==============
  
  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      {/* HEADER */}
      <header style={{ 
        padding: '16px 24px', 
        background: theme.cardBg, 
        borderBottom: `1px solid ${theme.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, color: theme.text, fontSize: '24px', fontWeight: 'bold' }}>
            💰 Premium Finance
          </h1>
          
          {/* MAIN TABS */}
          <nav style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'dashboard', label: '📊 Dashboard', color: theme.accent },
              { id: 'overview', label: '💎 Overview', color: theme.purple },
              { id: 'path', label: '🎯 Path to Goals', color: theme.success },
              { id: 'trading', label: '📈 Trading', color: theme.warning }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '10px 20px',
                  background: activeTab === tab.id ? tab.color : 'transparent',
                  color: activeTab === tab.id ? 'white' : theme.text,
                  border: `2px solid ${activeTab === tab.id ? tab.color : theme.border}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ color: theme.textMuted, fontSize: '14px' }}>👤 {user?.firstName || 'User'}</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                padding: '8px 16px',
                background: darkMode ? '#fbbf24' : '#1e293b',
                color: darkMode ? '#1e293b' : '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      {/* ==================== TAB 1: DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* SUMMARY CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>💵 Incoming</div>
                <div style={{ color: theme.success, fontSize: '28px', fontWeight: 'bold' }}>${monthlyIncome.toFixed(2)}</div>
                <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>per month</div>
              </div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>💸 Outgoing</div>
                <div style={{ color: theme.danger, fontSize: '28px', fontWeight: 'bold' }}>${totalOutgoing.toFixed(2)}</div>
                <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>per month</div>
              </div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>📈 Monthly Surplus</div>
                <div style={{ color: monthlySurplus >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 'bold' }}>${monthlySurplus.toFixed(2)}</div>
                <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>available</div>
              </div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>📅 Previous Month</div>
                <div style={{ color: previousMonthSurplus >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 'bold' }}>${previousMonthSurplus.toFixed(2)}</div>
                <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>surplus</div>
              </div>
              <div style={{ padding: '20px', background: `linear-gradient(135deg, ${theme.accent}, ${theme.purple})`, borderRadius: '16px', color: 'white' }}>
                <div style={{ fontSize: '13px', marginBottom: '8px', opacity: 0.9 }}>💎 Net Worth</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>${netWorth.toFixed(2)}</div>
                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>total</div>
              </div>
            </div>
            
            {/* ALERTS */}
            {alerts.length > 0 && (
              <div style={{ ...cardStyle, borderColor: theme.warning, borderWidth: '2px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>🔔 Alerts ({alerts.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {alerts.slice(0, 5).map((alert, idx) => (
                    <div key={idx} style={{
                      padding: '12px 16px',
                      background: alert.severity === 'danger' ? (darkMode ? '#3a1e1e' : '#fef2f2') : (darkMode ? '#3a2e1e' : '#fffbeb'),
                      borderRadius: '10px',
                      borderLeft: `4px solid ${alert.severity === 'danger' ? theme.danger : theme.warning}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: theme.text, fontSize: '14px' }}>
                        {alert.severity === 'danger' ? '🚨' : '⚠️'} {alert.message}
                      </span>
                      <span style={{ color: alert.severity === 'danger' ? theme.danger : theme.warning, fontWeight: '600', fontSize: '14px' }}>
                        ${alert.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* INCOME & EXPENSES SECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              {/* INCOME STREAMS */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', color: theme.success, fontSize: '18px' }}>💰 Income Streams</h3>
                
                {/* Add Income Form */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Income name"
                    value={newIncome.name}
                    onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })}
                    style={{ ...inputStyle, flex: '1 1 120px' }}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                    style={{ ...inputStyle, width: '90px' }}
                  />
                  <select
                    value={newIncome.frequency}
                    onChange={(e) => setNewIncome({ ...newIncome, frequency: e.target.value })}
                    style={{ ...inputStyle, width: '110px' }}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="fortnightly">Fortnightly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <select
                    value={newIncome.type}
                    onChange={(e) => setNewIncome({ ...newIncome, type: e.target.value })}
                    style={{ ...inputStyle, width: '100px' }}
                  >
                    <option value="active">🏃 Active</option>
                    <option value="passive">🌴 Passive</option>
                  </select>
                  <input
                    type="date"
                    value={newIncome.startDate}
                    onChange={(e) => setNewIncome({ ...newIncome, startDate: e.target.value })}
                    style={{ ...inputStyle, width: '130px' }}
                  />
                  <button onClick={addIncome} style={btnSuccess}>Add</button>
                </div>
                
                {/* Income List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {incomeStreams.length === 0 ? (
                    <div style={{ color: theme.textMuted, textAlign: 'center', padding: '20px' }}>No income added yet</div>
                  ) : incomeStreams.map(inc => (
                    <div key={inc.id} style={{
                      padding: '12px',
                      background: inc.type === 'passive' ? (darkMode ? '#1e3a32' : '#f0fdf4') : (darkMode ? '#3a2e1e' : '#fffbeb'),
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ color: theme.text, fontWeight: '600', fontSize: '14px' }}>
                          {inc.type === 'passive' ? '🌴' : '🏃'} {inc.name}
                        </div>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>
                          ${inc.amount}/{inc.frequency} • Starts {new Date(inc.startDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: theme.success, fontWeight: '700' }}>${convertToMonthly(parseFloat(inc.amount), inc.frequency).toFixed(2)}/mo</span>
                        <button onClick={() => deleteIncome(inc.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* EXPENSES */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', color: theme.danger, fontSize: '18px' }}>💸 Expenses & Bills</h3>
                
                {/* Add Expense Form */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Expense name"
                    value={newExpense.name}
                    onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                    style={{ ...inputStyle, flex: '1 1 120px' }}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    style={{ ...inputStyle, width: '90px' }}
                  />
                  <select
                    value={newExpense.frequency}
                    onChange={(e) => setNewExpense({ ...newExpense, frequency: e.target.value })}
                    style={{ ...inputStyle, width: '110px' }}
                  >
                    <option value="once">One-time</option>
                    <option value="weekly">Weekly</option>
                    <option value="fortnightly">Fortnightly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <input
                    type="date"
                    value={newExpense.dueDate}
                    onChange={(e) => setNewExpense({ ...newExpense, dueDate: e.target.value })}
                    style={{ ...inputStyle, width: '130px' }}
                  />
                  <button onClick={addExpense} style={btnDanger}>Add</button>
                </div>
                
                {/* Expense List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {expenses.length === 0 ? (
                    <div style={{ color: theme.textMuted, textAlign: 'center', padding: '20px' }}>No expenses added yet</div>
                  ) : expenses.map(exp => (
                    <div key={exp.id} style={{
                      padding: '12px',
                      background: darkMode ? '#3a1e1e' : '#fef2f2',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ color: theme.text, fontWeight: '600', fontSize: '14px' }}>{exp.name}</div>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>
                          ${exp.amount}/{exp.frequency} • Due {new Date(exp.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: theme.danger, fontWeight: '700' }}>${convertToMonthly(parseFloat(exp.amount), exp.frequency).toFixed(2)}/mo</span>
                        <button onClick={() => deleteExpense(exp.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* CALENDAR */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={prevMonth} style={btnPrimary}>← Prev</button>
                <h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>
                  📅 {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={nextMonth} style={btnPrimary}>Next →</button>
              </div>
              
              {/* Calendar Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} style={{ textAlign: 'center', fontWeight: '600', color: theme.textMuted, padding: '12px', fontSize: '13px' }}>
                    {day}
                  </div>
                ))}
                
                {/* Empty cells before first day */}
                {Array.from({ length: getDaysInMonth().firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ minHeight: '100px' }} />
                ))}
                
                {/* Day cells */}
                {Array.from({ length: getDaysInMonth().daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayItems = getCalendarItemsForDay(day)
                  const isToday = new Date().getDate() === day && 
                                  new Date().getMonth() === calendarMonth.getMonth() && 
                                  new Date().getFullYear() === calendarMonth.getFullYear()
                  
                  return (
                    <div
                      key={day}
                      style={{
                        minHeight: '100px',
                        padding: '8px',
                        background: isToday ? (darkMode ? '#1e3a5f' : '#eff6ff') : (darkMode ? '#1e293b' : '#fafafa'),
                        borderRadius: '10px',
                        border: isToday ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{ 
                        fontWeight: isToday ? '700' : '600', 
                        marginBottom: '6px', 
                        color: isToday ? theme.accent : theme.text, 
                        fontSize: '14px' 
                      }}>
                        {day}
                      </div>
                      
                      {/* Calendar Items */}
                      {dayItems.slice(0, 3).map(item => (
                        <div
                          key={item.id}
                          style={{
                            fontSize: '10px',
                            padding: '4px 6px',
                            marginBottom: '4px',
                            background: item.isPaid 
                              ? (darkMode ? '#334155' : '#e2e8f0')
                              : item.type === 'goal' ? '#ede9fe'
                              : item.type === 'debt' ? '#fee2e2'
                              : item.type === 'income' ? '#d1fae5'
                              : '#dbeafe',
                            color: item.isPaid ? theme.textMuted : '#1e293b',
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '4px',
                            textDecoration: item.isPaid ? 'line-through' : 'none',
                            opacity: item.isPaid ? 0.7 : 1
                          }}
                        >
                          <span style={{ 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap', 
                            flex: 1 
                          }}>
                            {item.name}
                          </span>
                          <span style={{ fontSize: '9px', color: '#666', marginRight: '4px' }}>
                            ${parseFloat(item.amount || 0).toFixed(0)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              togglePaid(item.id, item.sourceType, item.sourceId, parseFloat(item.amount || 0))
                            }}
                            style={{
                              padding: '2px 6px',
                              background: item.isPaid ? '#94a3b8' : theme.success,
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '9px',
                              fontWeight: '600',
                              flexShrink: 0
                            }}
                          >
                            {item.isPaid ? '✓' : '○'}
                          </button>
                        </div>
                      ))}
                      
                      {dayItems.length > 3 && (
                        <div style={{ fontSize: '10px', color: theme.textMuted, textAlign: 'center' }}>
                          +{dayItems.length - 3} more
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
           {/* DEBT CALCULATOR */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>💳 Debt Payoff Calculator</h2>
              
              {/* Add Debt Form */}
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '20px', 
                flexWrap: 'wrap', 
                padding: '16px', 
                background: darkMode ? '#334155' : '#f8fafc', 
                borderRadius: '12px' 
              }}>
                <input type="text" placeholder="Debt name" value={newDebt.name} onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 120px' }} />
                <input type="number" placeholder="Balance" value={newDebt.balance} onChange={(e) => setNewDebt({ ...newDebt, balance: e.target.value })} style={{ ...inputStyle, width: '100px' }} />
                <input type="number" placeholder="Interest %" value={newDebt.interestRate} onChange={(e) => setNewDebt({ ...newDebt, interestRate: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
                <input type="number" placeholder="Min Payment" value={newDebt.minPayment} onChange={(e) => setNewDebt({ ...newDebt, minPayment: e.target.value })} style={{ ...inputStyle, width: '100px' }} />
                <input type="date" value={newDebt.paymentDate} onChange={(e) => setNewDebt({ ...newDebt, paymentDate: e.target.value })} style={{ ...inputStyle, width: '130px' }} />
                <select value={newDebt.frequency} onChange={(e) => setNewDebt({ ...newDebt, frequency: e.target.value })} style={inputStyle}>
                  <option value="weekly">Weekly</option>
                  <option value="fortnightly">Fortnightly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <button onClick={addDebt} style={btnDanger}>Add Debt</button>
              </div>
              
              {/* Debt List */}
              {debts.length > 0 && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    {debts.map(debt => {
                      const progress = debt.originalBalance 
                        ? ((parseFloat(debt.originalBalance) - parseFloat(debt.balance)) / parseFloat(debt.originalBalance)) * 100 
                        : 0
                      return (
                        <div key={debt.id} style={{ 
                          padding: '16px', 
                          background: darkMode ? '#334155' : '#fef2f2', 
                          borderRadius: '12px', 
                          border: `1px solid ${theme.border}` 
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div>
                              <div style={{ color: theme.text, fontWeight: '600', fontSize: '16px' }}>{debt.name}</div>
                              <div style={{ color: theme.textMuted, fontSize: '13px' }}>
                                ${parseFloat(debt.balance).toFixed(2)} @ {debt.interestRate}% • Min: ${debt.minPayment}/{debt.frequency}
                                {debt.paymentDate && ` • Due: ${new Date(debt.paymentDate).getDate()}th`}
                              </div>
                            </div>
                            <button onClick={() => deleteDebt(debt.id)} style={{ ...btnDanger, padding: '6px 12px', fontSize: '12px' }}>Delete</button>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(to right, ${theme.success}, #059669)`, transition: 'width 0.3s' }} />
                          </div>
                          <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '6px' }}>{progress.toFixed(1)}% paid off</div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Payoff Strategy */}
                  <div style={{ padding: '20px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button 
                        onClick={() => setPayoffMethod('avalanche')} 
                        style={{ 
                          ...btnPrimary, 
                          background: payoffMethod === 'avalanche' ? theme.success : theme.cardBg, 
                          color: payoffMethod === 'avalanche' ? 'white' : theme.text, 
                          border: `2px solid ${payoffMethod === 'avalanche' ? theme.success : theme.border}` 
                        }}
                      >
                        🏔️ Avalanche
                      </button>
                      <button 
                        onClick={() => setPayoffMethod('snowball')} 
                        style={{ 
                          ...btnPrimary, 
                          background: payoffMethod === 'snowball' ? theme.success : theme.cardBg, 
                          color: payoffMethod === 'snowball' ? 'white' : theme.text, 
                          border: `2px solid ${payoffMethod === 'snowball' ? theme.success : theme.border}` 
                        }}
                      >
                        ❄️ Snowball
                      </button>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input 
                          type="number" 
                          placeholder="Extra payment" 
                          value={extraPayment} 
                          onChange={(e) => setExtraPayment(e.target.value)} 
                          style={{ ...inputStyle, width: '120px' }} 
                        />
                        <button onClick={addExtraPaymentToCalendar} style={btnPrimary}>
                          📅 Add to Calendar
                        </button>
                      </div>
                    </div>
                    
                    {(() => {
                      const p = calculateDebtPayoff()
                      const targetDebt = [...debts].sort((a, b) => 
                        payoffMethod === 'snowball' 
                          ? parseFloat(a.balance) - parseFloat(b.balance) 
                          : parseFloat(b.interestRate) - parseFloat(a.interestRate)
                      )[0]
                      return (
                        <div style={{ color: theme.text, fontSize: '14px', lineHeight: '1.8' }}>
                          <div>⏱️ <strong>Time to debt-free:</strong> {Math.floor(p.monthsToPayoff / 12)} years, {p.monthsToPayoff % 12} months</div>
                          <div>💸 <strong>Total interest:</strong> ${p.totalInterestPaid.toFixed(2)}</div>
                          {targetDebt && extraPayment && (
                            <div style={{ marginTop: '8px', padding: '10px', background: theme.cardBg, borderRadius: '8px' }}>
                              🎯 <strong>Target Debt ({payoffMethod}):</strong> {targetDebt.name} - Extra ${extraPayment}/mo will be applied here
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </>
              )}
            </div>
            
            {/* GOALS */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>🎯 Savings Goals</h2>
              
              {/* Add Goal Form */}
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '20px', 
                flexWrap: 'wrap', 
                padding: '16px', 
                background: darkMode ? '#334155' : '#f8fafc', 
                borderRadius: '12px' 
              }}>
                <input type="text" placeholder="Goal name" value={newGoal.name} onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 120px' }} />
                <input type="number" placeholder="Target $" value={newGoal.target} onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })} style={{ ...inputStyle, width: '100px' }} />
                <input type="number" placeholder="Saved $" value={newGoal.saved} onChange={(e) => setNewGoal({ ...newGoal, saved: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
                <input type="date" placeholder="Deadline" value={newGoal.deadline} onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} style={inputStyle} />
                <input type="date" placeholder="Start saving" value={newGoal.startDate} onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })} style={inputStyle} />
                <select value={newGoal.savingsFrequency} onChange={(e) => setNewGoal({ ...newGoal, savingsFrequency: e.target.value })} style={inputStyle}>
                  <option value="weekly">Weekly</option>
                  <option value="fortnightly">Fortnightly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <button onClick={addGoal} style={btnPurple}>Add Goal</button>
              </div>
              
              {/* Goals List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {goals.length === 0 ? (
                  <div style={{ color: theme.textMuted, textAlign: 'center', padding: '20px' }}>No goals added yet</div>
                ) : goals.map(goal => {
                  const progress = (parseFloat(goal.saved || 0) / parseFloat(goal.target || 1)) * 100
                  const payment = calculateGoalPayment(goal)
                  return (
                    <div key={goal.id} style={{ 
                      padding: '16px', 
                      background: darkMode ? '#334155' : '#faf5ff', 
                      borderRadius: '12px', 
                      border: `1px solid ${theme.border}` 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <div style={{ color: theme.text, fontWeight: '600', fontSize: '16px' }}>{goal.name}</div>
                          <div style={{ color: theme.textMuted, fontSize: '13px' }}>
                            ${parseFloat(goal.saved || 0).toFixed(2)} / ${parseFloat(goal.target).toFixed(2)}
                            {goal.deadline && ` • Due: ${new Date(goal.deadline).toLocaleDateString()}`}
                          </div>
                        </div>
                        <button onClick={() => deleteGoal(goal.id)} style={{ ...btnDanger, padding: '6px 12px', fontSize: '12px' }}>Delete</button>
                      </div>
                      <div style={{ width: '100%', height: '10px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: `linear-gradient(to right, ${theme.purple}, #7c3aed)`, transition: 'width 0.3s' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                        <span style={{ color: theme.textMuted, fontSize: '12px' }}>{progress.toFixed(1)}% complete</span>
                        {payment > 0 && (
                          <span style={{ color: theme.purple, fontSize: '12px', fontWeight: '600' }}>
                            Save ${payment.toFixed(2)}/{goal.savingsFrequency} • Starts {new Date(goal.startDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
          </div>
        )}
        {/* ==================== TAB 2: FINANCIAL OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* ASSETS VS LIABILITIES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              {/* ASSETS */}
              <div style={cardStyle}>
                <h2 style={{ margin: '0 0 20px 0', color: theme.success, fontSize: '20px' }}>
                  📈 Assets (${totalAssets.toFixed(2)})
                </h2>
                
                {/* Add Asset Form */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Asset name"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <input
                    type="number"
                    placeholder="Value"
                    value={newAsset.value}
                    onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
                    style={{ ...inputStyle, width: '110px' }}
                  />
                  <select
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="savings">💰 Savings</option>
                    <option value="investment">📈 Investment</option>
                    <option value="property">🏠 Property</option>
                    <option value="vehicle">🚗 Vehicle</option>
                    <option value="other">📦 Other</option>
                  </select>
                  <button onClick={addAsset} style={btnSuccess}>Add</button>
                </div>
                
                {/* Assets List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                  {assets.length === 0 ? (
                    <div style={{ color: theme.textMuted, textAlign: 'center', padding: '30px' }}>No assets added yet</div>
                  ) : assets.map(asset => (
                    <div key={asset.id} style={{
                      padding: '14px',
                      background: darkMode ? '#1e3a32' : '#f0fdf4',
                      borderRadius: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ color: theme.text, fontWeight: '600' }}>{asset.name}</div>
                        <div style={{ color: theme.textMuted, fontSize: '12px', textTransform: 'capitalize' }}>
                          {asset.type === 'savings' && '💰'} 
                          {asset.type === 'investment' && '📈'} 
                          {asset.type === 'property' && '🏠'} 
                          {asset.type === 'vehicle' && '🚗'} 
                          {asset.type === 'other' && '📦'} {asset.type}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: theme.success, fontWeight: '700', fontSize: '16px' }}>
                          ${parseFloat(asset.value).toFixed(2)}
                        </span>
                        <button 
                          onClick={() => deleteAsset(asset.id)} 
                          style={{ padding: '4px 10px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* LIABILITIES */}
              <div style={cardStyle}>
                <h2 style={{ margin: '0 0 20px 0', color: theme.danger, fontSize: '20px' }}>
                  📉 Liabilities (${(totalLiabilities + totalDebtBalance).toFixed(2)})
                </h2>
                
                {/* Add Liability Form */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Liability name"
                    value={newLiability.name}
                    onChange={(e) => setNewLiability({ ...newLiability, name: e.target.value })}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <input
                    type="number"
                    placeholder="Value"
                    value={newLiability.value}
                    onChange={(e) => setNewLiability({ ...newLiability, value: e.target.value })}
                    style={{ ...inputStyle, width: '110px' }}
                  />
                  <select
                    value={newLiability.type}
                    onChange={(e) => setNewLiability({ ...newLiability, type: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="loan">🏦 Loan</option>
                    <option value="mortgage">🏠 Mortgage</option>
                    <option value="other">📦 Other</option>
                  </select>
                  <button onClick={addLiability} style={btnDanger}>Add</button>
                </div>
                
                {/* Liabilities List (includes debts from debt calculator) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                  {/* Show debts from debt calculator */}
                  {debts.map(debt => (
                    <div key={`debt-${debt.id}`} style={{
                      padding: '14px',
                      background: darkMode ? '#3a1e1e' : '#fef2f2',
                      borderRadius: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ color: theme.text, fontWeight: '600' }}>💳 {debt.name}</div>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>Debt @ {debt.interestRate}% APR</div>
                      </div>
                      <span style={{ color: theme.danger, fontWeight: '700', fontSize: '16px' }}>
                        ${parseFloat(debt.balance).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  
                  {/* Show other liabilities */}
                  {liabilities.map(liability => (
                    <div key={liability.id} style={{
                      padding: '14px',
                      background: darkMode ? '#3a1e1e' : '#fef2f2',
                      borderRadius: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ color: theme.text, fontWeight: '600' }}>{liability.name}</div>
                        <div style={{ color: theme.textMuted, fontSize: '12px', textTransform: 'capitalize' }}>
                          {liability.type === 'loan' && '🏦'} 
                          {liability.type === 'mortgage' && '🏠'} 
                          {liability.type === 'other' && '📦'} {liability.type}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: theme.danger, fontWeight: '700', fontSize: '16px' }}>
                          ${parseFloat(liability.value).toFixed(2)}
                        </span>
                        <button 
                          onClick={() => deleteLiability(liability.id)} 
                          style={{ padding: '4px 10px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {debts.length === 0 && liabilities.length === 0 && (
                    <div style={{ color: theme.textMuted, textAlign: 'center', padding: '30px' }}>No liabilities - great job! 🎉</div>
                  )}
                </div>
              </div>
            </div>
            
            {/* NET WORTH BANNER */}
            <div style={{ 
              padding: '32px', 
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.purple})`, 
              borderRadius: '16px', 
              color: 'white', 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '16px', marginBottom: '8px', opacity: 0.9 }}>💎 Total Net Worth</div>
              <div style={{ fontSize: '56px', fontWeight: 'bold', marginBottom: '8px' }}>
                ${netWorth.toFixed(2)}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Assets: ${totalAssets.toFixed(2)} − Liabilities: ${(totalLiabilities + totalDebtBalance).toFixed(2)}
              </div>
            </div>
            {/* PASSIVE VS ACTIVE INCOME */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>💰 Income Analysis</h2>
              
              {/* Income Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ 
                  padding: '20px', 
                  background: darkMode ? '#3a2e1e' : '#fffbeb', 
                  borderRadius: '12px', 
                  textAlign: 'center',
                  border: `2px solid ${theme.warning}`
                }}>
                  <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>🏃 Active Income</div>
                  <div style={{ color: theme.warning, fontSize: '32px', fontWeight: 'bold' }}>${activeIncome.toFixed(2)}</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>per month</div>
                </div>
                <div style={{ 
                  padding: '20px', 
                  background: darkMode ? '#1e3a32' : '#f0fdf4', 
                  borderRadius: '12px', 
                  textAlign: 'center',
                  border: `2px solid ${theme.success}`
                }}>
                  <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>🌴 Passive Income</div>
                  <div style={{ color: theme.success, fontSize: '32px', fontWeight: 'bold' }}>${passiveIncome.toFixed(2)}</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>per month</div>
                </div>
                <div style={{ 
                  padding: '20px', 
                  background: `linear-gradient(135deg, ${theme.success}20, ${theme.purple}20)`, 
                  borderRadius: '12px', 
                  textAlign: 'center',
                  border: `2px solid ${theme.purple}`
                }}>
                  <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>🎯 Passive Ratio</div>
                  <div style={{ color: theme.purple, fontSize: '32px', fontWeight: 'bold' }}>{passiveIncomePercentage.toFixed(1)}%</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>of total income</div>
                </div>
              </div>
              
              {/* Journey Progress Bar */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: theme.text, fontSize: '14px', fontWeight: '600' }}>
                    🚀 Journey to Financial Freedom
                  </span>
                  <span style={{ color: theme.success, fontSize: '14px', fontWeight: '600' }}>
                    {passiveIncomePercentage.toFixed(1)}% → 100%
                  </span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '24px', 
                  background: darkMode ? '#334155' : '#e2e8f0', 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{ 
                    width: `${Math.min(passiveIncomePercentage, 100)}%`, 
                    height: '100%', 
                    background: `linear-gradient(to right, ${theme.warning}, ${theme.success})`,
                    transition: 'width 0.5s ease-out',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: passiveIncomePercentage > 15 ? '10px' : '0'
                  }}>
                    {passiveIncomePercentage > 15 && (
                      <span style={{ color: 'white', fontSize: '12px', fontWeight: '700' }}>
                        {passiveIncomePercentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginTop: '8px', 
                  fontSize: '12px', 
                  color: theme.textMuted 
                }}>
                  <span>🏃 Trading Time for Money</span>
                  <span>🌴 Money Works for You</span>
                </div>
              </div>
              
              {/* Income Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Active Income List */}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', color: theme.warning, fontSize: '16px' }}>🏃 Active Income Sources</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {incomeStreams.filter(inc => inc.type === 'active').length === 0 ? (
                      <div style={{ color: theme.textMuted, fontSize: '13px', padding: '20px', textAlign: 'center' }}>
                        No active income sources
                      </div>
                    ) : incomeStreams.filter(inc => inc.type === 'active').map(inc => (
                      <div key={inc.id} style={{
                        padding: '12px',
                        background: darkMode ? '#3a2e1e' : '#fffbeb',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ color: theme.text, fontWeight: '600', fontSize: '14px' }}>{inc.name}</div>
                          <div style={{ color: theme.textMuted, fontSize: '12px' }}>${inc.amount}/{inc.frequency}</div>
                        </div>
                        <span style={{ color: theme.warning, fontWeight: '700' }}>
                          ${convertToMonthly(parseFloat(inc.amount), inc.frequency).toFixed(2)}/mo
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Passive Income List */}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', color: theme.success, fontSize: '16px' }}>🌴 Passive Income Sources</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {incomeStreams.filter(inc => inc.type === 'passive').length === 0 ? (
                      <div style={{ 
                        color: theme.textMuted, 
                        fontSize: '13px', 
                        padding: '20px', 
                        textAlign: 'center',
                        background: darkMode ? '#1e3a32' : '#f0fdf4',
                        borderRadius: '8px',
                        border: `2px dashed ${theme.success}`
                      }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
                        <div>No passive income yet</div>
                        <div style={{ fontSize: '11px', marginTop: '4px' }}>This is your goal! Build streams that work while you sleep.</div>
                      </div>
                    ) : incomeStreams.filter(inc => inc.type === 'passive').map(inc => (
                      <div key={inc.id} style={{
                        padding: '12px',
                        background: darkMode ? '#1e3a32' : '#f0fdf4',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ color: theme.text, fontWeight: '600', fontSize: '14px' }}>{inc.name}</div>
                          <div style={{ color: theme.textMuted, fontSize: '12px' }}>${inc.amount}/{inc.frequency}</div>
                        </div>
                        <span style={{ color: theme.success, fontWeight: '700' }}>
                          ${convertToMonthly(parseFloat(inc.amount), inc.frequency).toFixed(2)}/mo
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI BUDGET COACH */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>🤖 AI Budget Coach</h2>
              
              {/* Chat Messages */}
              <div style={{ 
                maxHeight: '350px', 
                overflowY: 'auto', 
                marginBottom: '16px', 
                padding: '16px', 
                background: darkMode ? '#0f172a' : '#f8fafc', 
                borderRadius: '12px' 
              }}>
                {chatMessages.length === 0 ? (
                  <div style={{ color: theme.textMuted, textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                    <div style={{ fontSize: '16px', marginBottom: '8px' }}>Ask me anything about your finances!</div>
                    <div style={{ fontSize: '13px', color: theme.textMuted }}>
                      Try: "How can I increase my passive income?" or "Should I pay off debt or invest?"
                    </div>
                  </div>
                ) : chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ 
                    marginBottom: '12px', 
                    padding: '14px', 
                    background: msg.role === 'user' ? theme.accent : (darkMode ? '#334155' : 'white'), 
                    color: msg.role === 'user' ? 'white' : theme.text, 
                    borderRadius: '12px', 
                    marginLeft: msg.role === 'user' ? '20%' : '0', 
                    marginRight: msg.role === 'user' ? '0' : '20%',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ fontSize: '11px', marginBottom: '6px', opacity: 0.7 }}>
                      {msg.role === 'user' ? '👤 You' : '🤖 Budget Coach'}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{msg.content}</div>
                  </div>
                ))}
              </div>
              
              {/* Chat Input */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Ask about budgeting, investing, debt strategies, passive income..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isAskingCoach && askBudgetCoach()}
                  disabled={isAskingCoach}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button 
                  onClick={askBudgetCoach} 
                  disabled={isAskingCoach} 
                  style={{ 
                    ...btnPrimary, 
                    background: isAskingCoach ? '#94a3b8' : theme.accent,
                    minWidth: '100px'
                  }}
                >
                  {isAskingCoach ? '⏳ Thinking...' : '💬 Ask'}
                </button>
              </div>
            </div>
            
          </div>
        )}
       {/* ==================== TAB 3: PATH TO GOALS ==================== */}
        {activeTab === 'path' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* WHERE YOU ARE NOW */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>📍 Where You Are Now</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>💎 Net Worth</div>
                  <div style={{ color: netWorth >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 'bold' }}>
                    ${netWorth.toFixed(0)}
                  </div>
                </div>
                <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>📈 Monthly Surplus</div>
                  <div style={{ color: monthlySurplus >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 'bold' }}>
                    ${monthlySurplus.toFixed(0)}
                  </div>
                </div>
                <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>💳 Total Debt</div>
                  <div style={{ color: theme.danger, fontSize: '28px', fontWeight: 'bold' }}>
                    ${totalDebtBalance.toFixed(0)}
                  </div>
                </div>
                <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>🌴 Passive Income</div>
                  <div style={{ color: theme.success, fontSize: '28px', fontWeight: 'bold' }}>
                    ${passiveIncome.toFixed(0)}<span style={{ fontSize: '14px' }}>/mo</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* WHERE YOU WANT TO GO */}
            <div style={{ 
              padding: '24px', 
              background: `linear-gradient(135deg, ${theme.purple}15, ${theme.success}15)`, 
              borderRadius: '16px', 
              border: `2px solid ${theme.purple}` 
            }}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>🎯 Where You Want to Go</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Financial Freedom */}
                <div style={{ ...cardStyle, padding: '20px' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: theme.purple, fontSize: '18px' }}>🌴 Financial Freedom</h3>
                  <div style={{ color: theme.text, fontSize: '14px', lineHeight: '2' }}>
                    <div>Monthly expenses to cover: <strong>${fiPath.monthlyNeed.toFixed(0)}</strong></div>
                    <div>Current passive income: <strong style={{ color: theme.success }}>${passiveIncome.toFixed(0)}</strong></div>
                    <div>Gap to cover: <strong style={{ color: passiveIncome >= fiPath.monthlyNeed ? theme.success : theme.danger }}>
                      ${Math.max(0, fiPath.passiveGap).toFixed(0)}
                    </strong></div>
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ marginBottom: '4px' }}>Coverage: <strong style={{ color: theme.purple }}>{fiPath.passiveCoverage.toFixed(1)}%</strong></div>
                      <div style={{ width: '100%', height: '8px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(fiPath.passiveCoverage, 100)}%`, height: '100%', background: theme.purple }} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* FIRE Number */}
                <div style={{ ...cardStyle, padding: '20px' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: theme.success, fontSize: '18px' }}>🔥 FIRE Number</h3>
                  <div style={{ color: theme.text, fontSize: '14px', lineHeight: '2' }}>
                    <div>Target net worth (25x expenses): <strong>${fiPath.fireNumber.toFixed(0)}</strong></div>
                    <div>Current investments: <strong style={{ color: theme.success }}>${fiPath.currentInvestments.toFixed(0)}</strong></div>
                    <div>Estimated years to FI: <strong style={{ color: theme.purple }}>
                      {fiPath.yearsToFI >= 999 ? '∞ (need surplus)' : `${fiPath.yearsToFI} years`}
                    </strong></div>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: theme.textMuted }}>
                      Based on investing 50% of your surplus at 7% annual returns
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* THE PATH - ROADMAP */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>🛤️ The Path to Financial Freedom</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { 
                    step: 1, 
                    title: 'Build Emergency Fund', 
                    description: 'Save 3-6 months of expenses for unexpected situations',
                    target: monthlyExpenses * 3,
                    current: assets.filter(a => a.type === 'savings').reduce((s, a) => s + parseFloat(a.value || 0), 0),
                    status: assets.filter(a => a.type === 'savings').reduce((s, a) => s + parseFloat(a.value || 0), 0) >= monthlyExpenses * 3 ? 'complete' : 'in-progress'
                  },
                  { 
                    step: 2, 
                    title: 'Pay Off High-Interest Debt', 
                    description: 'Eliminate debt with interest rates above 7%',
                    target: debts.filter(d => parseFloat(d.interestRate) > 7).reduce((s, d) => s + parseFloat(d.balance), 0),
                    current: 0,
                    status: debts.filter(d => parseFloat(d.interestRate) > 7).length === 0 ? 'complete' : 'in-progress'
                  },
                  { 
                    step: 3, 
                    title: 'Maximize Employer Match', 
                    description: 'Get all free money from employer retirement matching',
                    target: 0,
                    current: 0,
                    status: 'in-progress'
                  },
                  { 
                    step: 4, 
                    title: 'Pay Off All Debt', 
                    description: 'Become completely debt-free',
                    target: totalDebtBalance,
                    current: 0,
                    status: totalDebtBalance === 0 ? 'complete' : 'in-progress'
                  },
                  { 
                    step: 5, 
                    title: 'Build Passive Income Streams', 
                    description: 'Create income that works while you sleep',
                    target: totalOutgoing,
                    current: passiveIncome,
                    status: passiveIncome >= totalOutgoing ? 'complete' : 'in-progress'
                  },
                  { 
                    step: 6, 
                    title: '🎉 Financial Freedom!', 
                    description: 'Passive income covers all expenses - work becomes optional',
                    target: 100,
                    current: fiPath.passiveCoverage,
                    status: fiPath.passiveCoverage >= 100 ? 'complete' : 'locked'
                  }
                ].map((item, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    alignItems: 'flex-start', 
                    padding: '20px', 
                    background: item.status === 'complete' 
                      ? (darkMode ? '#1e3a32' : '#f0fdf4') 
                      : item.status === 'locked'
                      ? (darkMode ? '#1e1e2e' : '#f8fafc')
                      : (darkMode ? '#334155' : '#ffffff'),
                    borderRadius: '12px', 
                    border: item.status === 'complete' 
                      ? `2px solid ${theme.success}` 
                      : `1px solid ${theme.border}`,
                    opacity: item.status === 'locked' ? 0.6 : 1
                  }}>
                    {/* Step Number */}
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '50%', 
                      background: item.status === 'complete' ? theme.success : item.status === 'locked' ? theme.border : theme.purple, 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 'bold',
                      fontSize: '18px',
                      flexShrink: 0 
                    }}>
                      {item.status === 'complete' ? '✓' : item.step}
                    </div>
                    
                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ color: theme.text, fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                        {item.title}
                      </div>
                      <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>
                        {item.description}
                      </div>
                      
                      {/* Progress for applicable steps */}
                      {item.target > 0 && item.status !== 'complete' && item.status !== 'locked' && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: theme.textMuted, marginBottom: '4px' }}>
                            <span>Progress</span>
                            <span>${item.current.toFixed(0)} / ${item.target.toFixed(0)}</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ 
                              width: `${Math.min((item.current / item.target) * 100, 100)}%`, 
                              height: '100%', 
                              background: theme.purple,
                              transition: 'width 0.3s'
                            }} />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Status Badge */}
                    <div style={{ 
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: item.status === 'complete' ? theme.success : item.status === 'locked' ? theme.border : theme.warning,
                      color: 'white'
                    }}>
                      {item.status === 'complete' ? '✓ Complete' : item.status === 'locked' ? '🔒 Locked' : '○ In Progress'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* GOALS CHECKLIST */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>📋 Your Savings Goals</h2>
              
              {goals.length === 0 ? (
                <div style={{ color: theme.textMuted, textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                  <div>No goals set yet</div>
                  <div style={{ fontSize: '13px', marginTop: '8px' }}>Add some goals in the Dashboard tab to track your progress!</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {goals.map(goal => {
                    const progress = (parseFloat(goal.saved || 0) / parseFloat(goal.target || 1)) * 100
                    const isComplete = progress >= 100
                    return (
                      <div key={goal.id} style={{ 
                        padding: '16px', 
                        background: isComplete ? (darkMode ? '#1e3a32' : '#f0fdf4') : (darkMode ? '#334155' : '#faf5ff'), 
                        borderRadius: '12px', 
                        border: isComplete ? `2px solid ${theme.success}` : `1px solid ${theme.border}` 
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '50%', 
                              background: isComplete ? theme.success : theme.border, 
                              color: 'white', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: '14px' 
                            }}>
                              {isComplete ? '✓' : '○'}
                            </div>
                            <div>
                              <div style={{ color: theme.text, fontWeight: '600', fontSize: '16px' }}>{goal.name}</div>
                              {goal.deadline && (
                                <div style={{ color: theme.textMuted, fontSize: '12px' }}>
                                  Due: {new Date(goal.deadline).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ color: isComplete ? theme.success : theme.purple, fontWeight: '700', fontSize: '18px' }}>
                            ${parseFloat(goal.saved || 0).toFixed(0)} / ${parseFloat(goal.target).toFixed(0)}
                          </div>
                        </div>
                        <div style={{ width: '100%', height: '10px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${Math.min(progress, 100)}%`, 
                            height: '100%', 
                            background: isComplete ? theme.success : `linear-gradient(to right, ${theme.purple}, #7c3aed)`,
                            transition: 'width 0.3s'
                          }} />
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '12px', color: theme.textMuted, marginTop: '6px' }}>
                          {progress.toFixed(1)}% complete
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            
          </div>
        )}
        {/* ==================== TAB 4: TRADING ==================== */}
        {activeTab === 'trading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* TRADING STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
                <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>💰 Total P/L</div>
                <div style={{ color: totalPL >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 'bold' }}>
                  {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
                </div>
              </div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
                <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>📊 Win Rate</div>
                <div style={{ color: winRate >= 50 ? theme.success : theme.warning, fontSize: '28px', fontWeight: 'bold' }}>
                  {winRate.toFixed(1)}%
                </div>
              </div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
                <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>📈 Total Trades</div>
                <div style={{ color: theme.text, fontSize: '28px', fontWeight: 'bold' }}>
                  {trades.length}
                </div>
              </div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
                <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>✅ Winners</div>
                <div style={{ color: theme.success, fontSize: '28px', fontWeight: 'bold' }}>
                  {trades.filter(t => parseFloat(t.profitLoss || 0) > 0).length}
                </div>
              </div>
            </div>
            
            {/* LOG TRADE */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>📝 Log New Trade</h2>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <input
                  type="date"
                  value={newTrade.date}
                  onChange={(e) => setNewTrade({ ...newTrade, date: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Instrument (e.g., EURUSD, AAPL)"
                  value={newTrade.instrument}
                  onChange={(e) => setNewTrade({ ...newTrade, instrument: e.target.value })}
                  style={{ ...inputStyle, flex: '1 1 150px' }}
                />
                <select
                  value={newTrade.direction}
                  onChange={(e) => setNewTrade({ ...newTrade, direction: e.target.value })}
                  style={inputStyle}
                >
                  <option value="long">📈 Long</option>
                  <option value="short">📉 Short</option>
                </select>
                <input
                  type="number"
                  placeholder="Entry Price"
                  value={newTrade.entryPrice}
                  onChange={(e) => setNewTrade({ ...newTrade, entryPrice: e.target.value })}
                  style={{ ...inputStyle, width: '100px' }}
                />
                <input
                  type="number"
                  placeholder="Exit Price"
                  value={newTrade.exitPrice}
                  onChange={(e) => setNewTrade({ ...newTrade, exitPrice: e.target.value })}
                  style={{ ...inputStyle, width: '100px' }}
                />
                <input
                  type="number"
                  placeholder="P/L ($)"
                  value={newTrade.profitLoss}
                  onChange={(e) => setNewTrade({ ...newTrade, profitLoss: e.target.value })}
                  style={{ ...inputStyle, width: '100px' }}
                />
                <button onClick={addTrade} style={btnWarning}>Log Trade</button>
              </div>
              
              <textarea
                placeholder="Trade notes (strategy, lessons learned, emotions...)"
                value={newTrade.notes}
                onChange={(e) => setNewTrade({ ...newTrade, notes: e.target.value })}
                style={{ ...inputStyle, width: '100%', minHeight: '80px', resize: 'vertical' }}
              />
            </div>
            
            {/* TRADE HISTORY */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>📔 Trade History</h2>
              
              {trades.length === 0 ? (
                <div style={{ color: theme.textMuted, textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
                  <div>No trades logged yet</div>
                  <div style={{ fontSize: '13px', marginTop: '8px' }}>Start logging your trades above to track your performance!</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {trades.map(trade => {
                    const pl = parseFloat(trade.profitLoss || 0)
                    const isWin = pl >= 0
                    return (
                      <div key={trade.id} style={{ 
                        padding: '16px', 
                        background: isWin ? (darkMode ? '#1e3a32' : '#f0fdf4') : (darkMode ? '#3a1e1e' : '#fef2f2'), 
                        borderRadius: '12px', 
                        border: `2px solid ${isWin ? theme.success : theme.danger}` 
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div>
                            <div style={{ color: theme.text, fontWeight: '600', fontSize: '16px' }}>
                              {trade.instrument} • {trade.direction === 'long' ? '📈' : '📉'} {trade.direction.toUpperCase()}
                            </div>
                            <div style={{ color: theme.textMuted, fontSize: '13px' }}>
                              {new Date(trade.date).toLocaleDateString()} • Entry: {trade.entryPrice} → Exit: {trade.exitPrice}
                            </div>
                          </div>
                          <div style={{ 
                            fontSize: '24px', 
                            fontWeight: 'bold', 
                            color: isWin ? theme.success : theme.danger 
                          }}>
                            {isWin ? '+' : ''}${pl.toFixed(2)}
                          </div>
                        </div>
                        {trade.notes && (
                          <div style={{ 
                            color: theme.textMuted, 
                            fontSize: '13px', 
                            fontStyle: 'italic',
                            padding: '10px',
                            background: darkMode ? '#1e293b' : '#f8fafc',
                            borderRadius: '6px',
                            marginTop: '8px'
                          }}>
                            "{trade.notes}"
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            
          </div>
        )}
        
      </main>
    </div>
  )
}
