'use client'

import { useUser } from '@clerk/nextjs'
import { useState } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'path' | 'trading'>('dashboard')
  const [darkMode, setDarkMode] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  
  const [incomeStreams, setIncomeStreams] = useState<any[]>([])
  const [newIncome, setNewIncome] = useState({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0] })
  
  const [expenses, setExpenses] = useState<any[]>([])
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', frequency: 'monthly', dueDate: new Date().toISOString().split('T')[0] })
  
  const [debts, setDebts] = useState<any[]>([])
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: new Date().toISOString().split('T')[0] })
  const [extraPayment, setExtraPayment] = useState('')
  const [payoffMethod, setPayoffMethod] = useState<'snowball' | 'avalanche'>('avalanche')
  
  const [goals, setGoals] = useState<any[]>([])
  const [newGoal, setNewGoal] = useState({ name: '', target: '', saved: '0', deadline: '', savingsFrequency: 'monthly', startDate: new Date().toISOString().split('T')[0], paymentAmount: '' })
  const [extraGoalPayment, setExtraGoalPayment] = useState('')
  const [selectedGoalForExtra, setSelectedGoalForExtra] = useState<number | null>(null)
  
  const [assets, setAssets] = useState<any[]>([])
  const [newAsset, setNewAsset] = useState({ name: '', value: '', type: 'savings' })
  const [liabilities, setLiabilities] = useState<any[]>([])
  const [newLiability, setNewLiability] = useState({ name: '', value: '', type: 'loan' })
  
  // Store paid occurrences with full date string as key
  const [paidOccurrences, setPaidOccurrences] = useState<Set<string>>(new Set())
  
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [chatInput, setChatInput] = useState('')
  const [isAskingCoach, setIsAskingCoach] = useState(false)
  
  const [trades, setTrades] = useState<any[]>([])
  const [newTrade, setNewTrade] = useState({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' })

  // Expanded day modal
  const [expandedDay, setExpandedDay] = useState<{day: number, items: any[]} | null>(null)

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
  
  const inputStyle: React.CSSProperties = { padding: '10px 14px', border: '2px solid ' + theme.inputBorder, borderRadius: '8px', fontSize: '14px', background: theme.input, color: theme.text }
  const btnPrimary: React.CSSProperties = { padding: '10px 20px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }
  const btnSuccess: React.CSSProperties = { ...btnPrimary, background: theme.success }
  const btnDanger: React.CSSProperties = { ...btnPrimary, background: theme.danger }
  const btnPurple: React.CSSProperties = { ...btnPrimary, background: theme.purple }
  const btnWarning: React.CSSProperties = { ...btnPrimary, background: theme.warning }
  const cardStyle: React.CSSProperties = { padding: '24px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }

  const convertToMonthly = (amount: number, frequency: string) => {
    if (frequency === 'weekly') return amount * (52 / 12)
    if (frequency === 'fortnightly') return amount * (26 / 12)
    if (frequency === 'yearly') return amount / 12
    return amount
  }
  
  const monthlyIncome = incomeStreams.reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || 0), inc.frequency), 0)
  const activeIncome = incomeStreams.filter(inc => inc.type === 'active').reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || 0), inc.frequency), 0)
  const passiveIncome = incomeStreams.filter(inc => inc.type === 'passive').reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || 0), inc.frequency), 0)
  const passiveIncomePercentage = monthlyIncome > 0 ? (passiveIncome / monthlyIncome) * 100 : 0
  const monthlyExpenses = expenses.reduce((sum, exp) => sum + convertToMonthly(parseFloat(exp.amount || 0), exp.frequency), 0)
  const monthlyDebtPayments = debts.reduce((sum, debt) => sum + convertToMonthly(parseFloat(debt.minPayment || 0), debt.frequency), 0)
  const totalDebtBalance = debts.reduce((sum, d) => sum + parseFloat(d.balance || 0), 0)
  const totalOutgoing = monthlyExpenses + monthlyDebtPayments
  const monthlySurplus = monthlyIncome - totalOutgoing
  const totalAssets = assets.reduce((sum, a) => sum + parseFloat(a.value || 0), 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + parseFloat(l.value || 0), 0)
  const netWorth = totalAssets - totalLiabilities - totalDebtBalance
  const totalPL = trades.reduce((sum, t) => sum + parseFloat(t.profitLoss || 0), 0)
  const winRate = trades.length > 0 ? (trades.filter(t => parseFloat(t.profitLoss || 0) > 0).length / trades.length) * 100 : 0

  const getAlerts = () => {
    const alertsList: any[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    expenses.forEach(exp => {
      const dueDate = new Date(exp.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntilDue < 0) alertsList.push({ severity: 'danger', message: exp.name + ' is ' + Math.abs(daysUntilDue) + ' days overdue', amount: exp.amount })
      else if (daysUntilDue <= 3) alertsList.push({ severity: 'warning', message: exp.name + ' due in ' + daysUntilDue + ' days', amount: exp.amount })
    })
    debts.forEach(debt => {
      if (!debt.paymentDate) return
      const dueDate = new Date(debt.paymentDate)
      dueDate.setHours(0, 0, 0, 0)
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntilDue < 0) alertsList.push({ severity: 'danger', message: debt.name + ' payment is ' + Math.abs(daysUntilDue) + ' days overdue', amount: debt.minPayment })
      else if (daysUntilDue <= 3) alertsList.push({ severity: 'warning', message: debt.name + ' payment due in ' + daysUntilDue + ' days', amount: debt.minPayment })
    })
    return alertsList.sort((a, b) => (a.severity === 'danger' ? -1 : 1))
  }
  const alerts = getAlerts()

  const getDaysInMonth = () => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth, month, year }
  }
  const prevMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
  const nextMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))
  
  const calculateGoalPayment = (goal: any) => {
    const remaining = parseFloat(goal.target || 0) - parseFloat(goal.saved || 0)
    if (!goal.deadline || remaining <= 0) return 0
    const monthsRemaining = Math.max(1, Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)))
    const monthlyNeeded = remaining / monthsRemaining
    if (goal.savingsFrequency === 'weekly') return monthlyNeeded / (52 / 12)
    if (goal.savingsFrequency === 'fortnightly') return monthlyNeeded / (26 / 12)
    return monthlyNeeded
  }

  const getCalendarItemsForDay = (day: number) => {
    const { month, year } = getDaysInMonth()
    const items: any[] = []
    const allItems = [
      ...incomeStreams.map(inc => ({ id: 'income-' + inc.id, sourceId: inc.id, sourceType: 'income', name: '💰 ' + inc.name, amount: inc.amount, dueDate: inc.startDate, frequency: inc.frequency, type: 'income' })),
      ...expenses.map(exp => ({ 
        id: 'expense-' + exp.id, 
        sourceId: exp.id, 
        sourceType: exp.targetDebtId ? 'extraDebt' : exp.targetGoalId ? 'extraGoal' : 'expense',
        targetDebtId: exp.targetDebtId,
        targetGoalId: exp.targetGoalId,
        name: '💸 ' + exp.name, 
        amount: exp.amount, 
        dueDate: exp.dueDate, 
        frequency: exp.frequency, 
        type: 'expense' 
      })),
      ...debts.filter(d => d.paymentDate).map(debt => ({ id: 'debt-' + debt.id, sourceId: debt.id, sourceType: 'debt', name: '💳 ' + debt.name, amount: debt.minPayment, dueDate: debt.paymentDate, frequency: debt.frequency, type: 'debt' })),
      ...goals.filter(g => g.startDate).map(goal => {
        // Use manual payment amount if set, otherwise calculate from deadline
        const paymentAmt = goal.paymentAmount ? parseFloat(goal.paymentAmount) : (goal.deadline ? calculateGoalPayment(goal) : 0)
        return { id: 'goal-' + goal.id, sourceId: goal.id, sourceType: 'goal', name: '🎯 ' + goal.name, amount: paymentAmt.toFixed(2), dueDate: goal.startDate, frequency: goal.savingsFrequency, type: 'goal' }
      })
    ]
    
    allItems.forEach(item => {
      if (!item.dueDate) return
      const itemDate = new Date(item.dueDate)
      const itemDay = itemDate.getDate()
      const itemMonth = itemDate.getMonth()
      const itemYear = itemDate.getFullYear()
      const currentDate = new Date(year, month, day)
      const startDate = new Date(item.dueDate)
      startDate.setHours(0,0,0,0)
      currentDate.setHours(0,0,0,0)
      
      let shouldShow = false
      if (itemDay === day && itemMonth === month && itemYear === year) {
        shouldShow = true
      } else if (item.frequency && item.frequency !== 'once' && currentDate >= startDate) {
        if (item.frequency === 'weekly') { 
          const daysDiff = Math.round((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
          shouldShow = daysDiff >= 0 && daysDiff % 7 === 0 
        }
        else if (item.frequency === 'fortnightly') { 
          const daysDiff = Math.round((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
          shouldShow = daysDiff >= 0 && daysDiff % 14 === 0 
        }
        else if (item.frequency === 'monthly') {
          // Handle end-of-month dates (29, 30, 31) for shorter months
          const daysInCurrentMonth = new Date(year, month + 1, 0).getDate()
          if (itemDay > daysInCurrentMonth) {
            // If original day doesn't exist in this month, show on last day
            shouldShow = day === daysInCurrentMonth
          } else {
            shouldShow = day === itemDay
          }
        }
        else if (item.frequency === 'yearly') shouldShow = day === itemDay && month === itemMonth
      }
      
      if (shouldShow) {
        // Create unique ID for this specific occurrence
        const occurrenceDate = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0')
        const uniqueId = item.id + '-' + occurrenceDate
        items.push({ 
          ...item, 
          id: uniqueId, 
          originalId: item.id, 
          occurrenceDate: occurrenceDate, 
          isPaid: paidOccurrences.has(uniqueId) 
        })
      }
    })
    return items
  }

  // Toggle paid - each occurrence is independent
  const togglePaid = (itemId: string, sourceType: string, sourceId: number, amount: number, targetDebtId?: number, targetGoalId?: number) => {
    const newPaid = new Set(paidOccurrences)
    const paymentAmount = amount || 0
    
    if (paidOccurrences.has(itemId)) {
      // UNPAYING - remove from paid set
      newPaid.delete(itemId)
      
      // Reverse the balance changes
      if (sourceType === 'goal' && sourceId) {
        setGoals(prev => prev.map(g => g.id === sourceId ? { ...g, saved: Math.max(0, parseFloat(g.saved || 0) - paymentAmount).toFixed(2) } : g))
      } else if (sourceType === 'debt' && sourceId) {
        setDebts(prev => prev.map(d => d.id === sourceId ? { ...d, balance: (parseFloat(d.balance || 0) + paymentAmount).toFixed(2) } : d))
      } else if (sourceType === 'extraDebt' && targetDebtId) {
        setDebts(prev => prev.map(d => d.id === targetDebtId ? { ...d, balance: (parseFloat(d.balance || 0) + paymentAmount).toFixed(2) } : d))
      } else if (sourceType === 'extraGoal' && targetGoalId) {
        setGoals(prev => prev.map(g => g.id === targetGoalId ? { ...g, saved: Math.max(0, parseFloat(g.saved || 0) - paymentAmount).toFixed(2) } : g))
      }
    } else {
      // PAYING - add to paid set
      newPaid.add(itemId)
      
      // Apply the balance changes
      if (sourceType === 'goal' && sourceId) {
        setGoals(prev => prev.map(g => g.id === sourceId ? { ...g, saved: (parseFloat(g.saved || 0) + paymentAmount).toFixed(2) } : g))
      } else if (sourceType === 'debt' && sourceId) {
        setDebts(prev => prev.map(d => d.id === sourceId ? { ...d, balance: Math.max(0, parseFloat(d.balance || 0) - paymentAmount).toFixed(2) } : d))
      } else if (sourceType === 'extraDebt' && targetDebtId) {
        setDebts(prev => prev.map(d => d.id === targetDebtId ? { ...d, balance: Math.max(0, parseFloat(d.balance || 0) - paymentAmount).toFixed(2) } : d))
      } else if (sourceType === 'extraGoal' && targetGoalId) {
        setGoals(prev => prev.map(g => g.id === targetGoalId ? { ...g, saved: (parseFloat(g.saved || 0) + paymentAmount).toFixed(2) } : g))
      }
    }
    
    setPaidOccurrences(newPaid)
  }

  const addIncome = () => { if (!newIncome.name || !newIncome.amount) return; setIncomeStreams([...incomeStreams, { ...newIncome, id: Date.now() }]); setNewIncome({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0] }) }
  const deleteIncome = (id: number) => setIncomeStreams(incomeStreams.filter(i => i.id !== id))
  const addExpense = () => { if (!newExpense.name || !newExpense.amount) return; setExpenses([...expenses, { ...newExpense, id: Date.now() }]); setNewExpense({ name: '', amount: '', frequency: 'monthly', dueDate: new Date().toISOString().split('T')[0] }) }
  const deleteExpense = (id: number) => setExpenses(expenses.filter(e => e.id !== id))
  const addDebt = () => { if (!newDebt.name || !newDebt.balance) return; setDebts([...debts, { ...newDebt, id: Date.now(), originalBalance: newDebt.balance }]); setNewDebt({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: new Date().toISOString().split('T')[0] }) }
  const deleteDebt = (id: number) => setDebts(debts.filter(d => d.id !== id))
  const addGoal = () => { if (!newGoal.name || !newGoal.target) return; setGoals([...goals, { ...newGoal, saved: newGoal.saved || '0', paymentAmount: newGoal.paymentAmount || '', id: Date.now() }]); setNewGoal({ name: '', target: '', saved: '0', deadline: '', savingsFrequency: 'monthly', startDate: new Date().toISOString().split('T')[0], paymentAmount: '' }) }
  const deleteGoal = (id: number) => setGoals(goals.filter(g => g.id !== id))
  const addAsset = () => { if (!newAsset.name || !newAsset.value) return; setAssets([...assets, { ...newAsset, id: Date.now() }]); setNewAsset({ name: '', value: '', type: 'savings' }) }
  const deleteAsset = (id: number) => setAssets(assets.filter(a => a.id !== id))
  const addLiability = () => { if (!newLiability.name || !newLiability.value) return; setLiabilities([...liabilities, { ...newLiability, id: Date.now() }]); setNewLiability({ name: '', value: '', type: 'loan' }) }
  const deleteLiability = (id: number) => setLiabilities(liabilities.filter(l => l.id !== id))
  const addTrade = () => { if (!newTrade.instrument) return; setTrades([...trades, { ...newTrade, id: Date.now() }].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())); setNewTrade({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' }) }

  const addExtraPaymentToCalendar = () => {
    if (!extraPayment || parseFloat(extraPayment) <= 0) { alert('Please enter an extra payment amount'); return }
    if (debts.length === 0) { alert('No debts to apply extra payment to'); return }
    
    // Sort debts based on payoff method
    const sortedDebts = [...debts].sort((a, b) => {
      if (payoffMethod === 'snowball') {
        // Snowball: lowest balance first
        return parseFloat(a.balance) - parseFloat(b.balance)
      } else {
        // Avalanche: highest interest rate first
        return parseFloat(b.interestRate) - parseFloat(a.interestRate)
      }
    })
    
    const targetDebt = sortedDebts[0]
    
    // Show which debt will be targeted and why
    const methodExplanation = payoffMethod === 'avalanche' 
      ? `(highest interest: ${targetDebt.interestRate}%)`
      : `(lowest balance: $${parseFloat(targetDebt.balance).toFixed(2)})`
    
    const confirmMsg = `Add $${extraPayment}/month extra payment to "${targetDebt.name}" ${methodExplanation}?`
    if (!confirm(confirmMsg)) return
    
    const paymentDate = prompt('When should extra payment start? (YYYY-MM-DD):', new Date().toISOString().split('T')[0])
    if (!paymentDate) return
    
    setExpenses([...expenses, { 
      id: Date.now(), 
      name: 'Extra → ' + targetDebt.name, 
      amount: extraPayment, 
      frequency: 'monthly', 
      dueDate: paymentDate, 
      targetDebtId: targetDebt.id 
    }])
    
    alert(`✅ Extra payment of $${extraPayment}/month added!\n\nTarget: ${targetDebt.name}\nMethod: ${payoffMethod === 'avalanche' ? '🏔️ Avalanche' : '❄️ Snowball'}\nReason: ${methodExplanation}`)
    setExtraPayment('')
  }

  const addExtraGoalPayment = (goalId: number) => {
    if (!extraGoalPayment || parseFloat(extraGoalPayment) <= 0) { alert('Please enter an extra payment amount'); return }
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    const paymentDate = prompt('When should extra goal payment start? (YYYY-MM-DD):', new Date().toISOString().split('T')[0])
    if (!paymentDate) return
    // Add as an income (negative expense) that goes to the goal
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        // Create a new goal entry for the extra payment schedule
        return g
      }
      return g
    }))
    // Add extra goal payment as a special expense type that adds to goal when paid
    setExpenses([...expenses, { id: Date.now(), name: 'Extra → ' + goal.name, amount: extraGoalPayment, frequency: 'monthly', dueDate: paymentDate, targetGoalId: goalId }])
    alert('Extra payment of $' + extraGoalPayment + '/month added for goal: ' + goal.name)
    setExtraGoalPayment('')
    setSelectedGoalForExtra(null)
  }

  const calculateDebtPayoff = (includeExtras: boolean = true) => {
    const extra = includeExtras ? parseFloat(extraPayment || '0') : 0
    
    // Also include any existing extra payments from expenses
    const scheduledExtraPayments = includeExtras ? expenses
      .filter(exp => exp.targetDebtId)
      .reduce((sum, exp) => sum + convertToMonthly(parseFloat(exp.amount || 0), exp.frequency), 0) : 0
    
    const totalExtra = extra + scheduledExtraPayments
    
    const sortedDebts = [...debts].sort((a, b) => payoffMethod === 'snowball' ? parseFloat(a.balance) - parseFloat(b.balance) : parseFloat(b.interestRate) - parseFloat(a.interestRate))
    const remainingDebts = sortedDebts.map(d => ({ ...d, remainingBalance: parseFloat(d.balance) }))
    let totalInterestPaid = 0, monthsToPayoff = 0, availableExtra = totalExtra
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
    return { monthsToPayoff, totalInterestPaid, scheduledExtra: scheduledExtraPayments, totalExtra }
  }

  const fiPath = (() => {
    const monthlyNeed = totalOutgoing
    const passiveGap = monthlyNeed - passiveIncome
    const passiveCoverage = monthlyNeed > 0 ? (passiveIncome / monthlyNeed) * 100 : 0
    const fireNumber = (monthlyNeed * 12) * 25
    const currentInvestments = assets.filter(a => a.type === 'investment').reduce((sum, a) => sum + parseFloat(a.value || 0), 0)
    const monthlyInvestment = monthlySurplus > 0 ? monthlySurplus * 0.5 : 0
    const yearsToFI = monthlyInvestment > 0 ? Math.ceil((fireNumber - currentInvestments) / (monthlyInvestment * 12)) : 999
    return { monthlyNeed, passiveGap, passiveCoverage, fireNumber, currentInvestments, yearsToFI }
  })()

  const askBudgetCoach = async () => {
    if (!chatInput.trim()) return
    const userMsg = { role: 'user' as const, content: chatInput }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setIsAskingCoach(true)
    try {
      const context = 'Income: $' + monthlyIncome.toFixed(2) + ', Expenses: $' + monthlyExpenses.toFixed(2) + ', Debt: $' + totalDebtBalance.toFixed(2) + ', Net Worth: $' + netWorth.toFixed(2)
      const response = await fetch('/api/budget-coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: chatInput, financialContext: context }) })
      const data = await response.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.advice || 'Sorry, I could not respond.' }])
    } catch { setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]) }
    finally { setIsAskingCoach(false) }
  }

  // Render calendar item (reusable)
  const renderCalendarItem = (item: any, compact: boolean = false) => (
    <div key={item.id} style={{ 
      fontSize: compact ? '11px' : '13px', 
      padding: compact ? '4px 6px' : '8px 10px', 
      marginBottom: '4px', 
      background: item.isPaid ? (darkMode ? '#334155' : '#d1d5db') : item.type === 'goal' ? '#ede9fe' : item.type === 'debt' ? '#fee2e2' : item.type === 'income' ? '#d1fae5' : (item.sourceType === 'extraDebt' || item.sourceType === 'extraGoal') ? '#f3e8ff' : '#dbeafe', 
      color: item.isPaid ? theme.textMuted : '#1e293b', 
      borderRadius: '6px', 
      opacity: item.isPaid ? 0.7 : 1, 
      border: '1px solid rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '8px'
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: item.isPaid ? 'line-through' : 'none' }}>{item.name}</div>
        <div style={{ fontSize: compact ? '9px' : '11px', color: '#666' }}>${parseFloat(item.amount || 0).toFixed(0)}</div>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); togglePaid(item.id, item.sourceType, item.sourceId, parseFloat(item.amount || 0), item.targetDebtId, item.targetGoalId) }} 
        style={{ 
          padding: compact ? '4px 8px' : '6px 12px', 
          background: item.isPaid ? '#6b7280' : (item.sourceType === 'extraDebt' || item.sourceType === 'extraGoal' || item.sourceType === 'goal') ? '#8b5cf6' : '#10b981', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer', 
          fontSize: compact ? '10px' : '12px', 
          fontWeight: 700,
          flexShrink: 0
        }}
      >
        {item.isPaid ? '✓' : 'PAY'}
      </button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      {/* EXPANDED DAY MODAL */}
      {expandedDay && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setExpandedDay(null)}>
          <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>📅 {calendarMonth.toLocaleDateString('en-US', { month: 'long' })} {expandedDay.day}</h3>
              <button onClick={() => setExpandedDay(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.textMuted }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {expandedDay.items.length === 0 ? (
                <div style={{ color: theme.textMuted, textAlign: 'center', padding: '20px' }}>No items scheduled</div>
              ) : expandedDay.items.map(item => renderCalendarItem(item, false))}
            </div>
          </div>
        </div>
      )}

      <header style={{ padding: '16px 24px', background: theme.cardBg, borderBottom: '1px solid ' + theme.border, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, color: theme.text, fontSize: '24px', fontWeight: 'bold' }}>💰 Premium Finance</h1>
          <nav style={{ display: 'flex', gap: '8px' }}>
            {[{ id: 'dashboard', label: '📊 Dashboard', color: theme.accent }, { id: 'overview', label: '💎 Overview', color: theme.purple }, { id: 'path', label: '🎯 Path', color: theme.success }, { id: 'trading', label: '📈 Trading', color: theme.warning }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{ padding: '10px 20px', background: activeTab === tab.id ? tab.color : 'transparent', color: activeTab === tab.id ? 'white' : theme.text, border: '2px solid ' + (activeTab === tab.id ? tab.color : theme.border), borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>{tab.label}</button>
            ))}
          </nav>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ color: theme.textMuted, fontSize: '14px' }}>👤 {user?.firstName || 'User'}</span>
            <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '8px 16px', background: darkMode ? '#fbbf24' : '#1e293b', color: darkMode ? '#1e293b' : '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>{darkMode ? '☀️' : '🌙'}</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>💵 Incoming</div><div style={{ color: theme.success, fontSize: '28px', fontWeight: 'bold' }}>${monthlyIncome.toFixed(2)}</div><div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>per month</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>💸 Outgoing</div><div style={{ color: theme.danger, fontSize: '28px', fontWeight: 'bold' }}>${totalOutgoing.toFixed(2)}</div><div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>per month</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>📈 Surplus</div><div style={{ color: monthlySurplus >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 'bold' }}>${monthlySurplus.toFixed(2)}</div><div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>available</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>💳 Debt</div><div style={{ color: theme.danger, fontSize: '28px', fontWeight: 'bold' }}>${totalDebtBalance.toFixed(2)}</div><div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>total</div></div>
              <div style={{ padding: '20px', background: 'linear-gradient(135deg, ' + theme.accent + ', ' + theme.purple + ')', borderRadius: '16px', color: 'white' }}><div style={{ fontSize: '13px', marginBottom: '8px', opacity: 0.9 }}>💎 Net Worth</div><div style={{ fontSize: '28px', fontWeight: 'bold' }}>${netWorth.toFixed(2)}</div><div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>total</div></div>
            </div>

            {alerts.length > 0 && (
              <div style={{ ...cardStyle, border: '2px solid ' + theme.warning }}>
                <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>🔔 Alerts ({alerts.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {alerts.slice(0, 5).map((alert, idx) => (
                    <div key={idx} style={{ padding: '12px 16px', background: alert.severity === 'danger' ? (darkMode ? '#3a1e1e' : '#fef2f2') : (darkMode ? '#3a2e1e' : '#fffbeb'), borderRadius: '10px', borderLeft: '4px solid ' + (alert.severity === 'danger' ? theme.danger : theme.warning), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: theme.text, fontSize: '14px' }}>{alert.severity === 'danger' ? '🚨' : '⚠️'} {alert.message}</span>
                      <span style={{ color: alert.severity === 'danger' ? theme.danger : theme.warning, fontWeight: 600, fontSize: '14px' }}>${alert.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', color: theme.success, fontSize: '18px' }}>💰 Income Streams</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Name" value={newIncome.name} onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 80px' }} />
                  <input type="number" placeholder="$" value={newIncome.amount} onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })} style={{ ...inputStyle, width: '70px' }} />
                  <select value={newIncome.frequency} onChange={(e) => setNewIncome({ ...newIncome, frequency: e.target.value })} style={{ ...inputStyle, width: '100px' }}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
                  <select value={newIncome.type} onChange={(e) => setNewIncome({ ...newIncome, type: e.target.value })} style={{ ...inputStyle, width: '90px' }}><option value="active">🏃 Active</option><option value="passive">🌴 Passive</option></select>
                  <input type="date" value={newIncome.startDate} onChange={(e) => setNewIncome({ ...newIncome, startDate: e.target.value })} style={inputStyle} />
                  <button onClick={addIncome} style={btnSuccess}>Add</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {incomeStreams.length === 0 ? <div style={{ color: theme.textMuted, textAlign: 'center', padding: '20px' }}>No income added</div> : incomeStreams.map(inc => (
                    <div key={inc.id} style={{ padding: '12px', background: inc.type === 'passive' ? (darkMode ? '#1e3a32' : '#f0fdf4') : (darkMode ? '#3a2e1e' : '#fffbeb'), borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>{inc.type === 'passive' ? '🌴' : '🏃'} {inc.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>${inc.amount}/{inc.frequency}</div></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: theme.success, fontWeight: 700 }}>${convertToMonthly(parseFloat(inc.amount), inc.frequency).toFixed(2)}/mo</span><button onClick={() => deleteIncome(inc.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕</button></div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', color: theme.danger, fontSize: '18px' }}>💸 Expenses & Bills</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Name" value={newExpense.name} onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 80px' }} />
                  <input type="number" placeholder="$" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} style={{ ...inputStyle, width: '70px' }} />
                  <select value={newExpense.frequency} onChange={(e) => setNewExpense({ ...newExpense, frequency: e.target.value })} style={{ ...inputStyle, width: '100px' }}><option value="once">One-time</option><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
                  <input type="date" value={newExpense.dueDate} onChange={(e) => setNewExpense({ ...newExpense, dueDate: e.target.value })} style={inputStyle} />
                  <button onClick={addExpense} style={btnDanger}>Add</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {expenses.length === 0 ? <div style={{ color: theme.textMuted, textAlign: 'center', padding: '20px' }}>No expenses added</div> : expenses.map(exp => (
                    <div key={exp.id} style={{ padding: '12px', background: exp.targetDebtId ? (darkMode ? '#2d1f3d' : '#faf5ff') : (darkMode ? '#3a1e1e' : '#fef2f2'), borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>{exp.targetDebtId ? '⚡' : ''}{exp.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>${exp.amount}/{exp.frequency}</div></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: exp.targetDebtId ? theme.purple : theme.danger, fontWeight: 700 }}>${convertToMonthly(parseFloat(exp.amount), exp.frequency).toFixed(2)}/mo</span><button onClick={() => deleteExpense(exp.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕</button></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CALENDAR - with clickable days */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={prevMonth} style={btnPrimary}>← Prev</button>
                <h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>📅 {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                <button onClick={nextMonth} style={btnPrimary}>Next →</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (<div key={day} style={{ textAlign: 'center', fontWeight: 600, color: theme.textMuted, padding: '10px', fontSize: '13px' }}>{day}</div>))}
                {Array.from({ length: getDaysInMonth().firstDay }).map((_, i) => (<div key={'empty-' + i} style={{ minHeight: '110px' }} />))}
                {Array.from({ length: getDaysInMonth().daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayItems = getCalendarItemsForDay(day)
                  const isToday = new Date().getDate() === day && new Date().getMonth() === calendarMonth.getMonth() && new Date().getFullYear() === calendarMonth.getFullYear()
                  const paidCount = dayItems.filter(it => it.isPaid).length
                  const unpaidCount = dayItems.filter(it => !it.isPaid).length
                  
                  return (
                    <div 
                      key={day} 
                      onClick={() => dayItems.length > 0 && setExpandedDay({ day, items: dayItems })}
                      style={{ 
                        minHeight: '110px', 
                        padding: '6px', 
                        background: isToday ? (darkMode ? '#1e3a5f' : '#eff6ff') : (darkMode ? '#1e293b' : '#fafafa'), 
                        borderRadius: '8px', 
                        border: isToday ? '2px solid ' + theme.accent : '1px solid ' + theme.border, 
                        overflow: 'hidden',
                        cursor: dayItems.length > 0 ? 'pointer' : 'default'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: isToday ? 700 : 600, color: isToday ? theme.accent : theme.text, fontSize: '14px' }}>{day}</span>
                        {dayItems.length > 0 && (
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {unpaidCount > 0 && <span style={{ background: theme.success, color: 'white', fontSize: '9px', padding: '1px 4px', borderRadius: '4px', fontWeight: 700 }}>{unpaidCount}</span>}
                            {paidCount > 0 && <span style={{ background: '#6b7280', color: 'white', fontSize: '9px', padding: '1px 4px', borderRadius: '4px', fontWeight: 700 }}>✓{paidCount}</span>}
                          </div>
                        )}
                      </div>
                      {dayItems.slice(0, 2).map(item => renderCalendarItem(item, true))}
                      {dayItems.length > 2 && (
                        <div style={{ fontSize: '10px', color: theme.accent, textAlign: 'center', marginTop: '2px', fontWeight: 600 }}>
                          +{dayItems.length - 2} more (click to view)
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
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
                <input type="text" placeholder="Debt name" value={newDebt.name} onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 100px' }} />
                <input type="number" placeholder="Balance" value={newDebt.balance} onChange={(e) => setNewDebt({ ...newDebt, balance: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
                <input type="number" placeholder="%" value={newDebt.interestRate} onChange={(e) => setNewDebt({ ...newDebt, interestRate: e.target.value })} style={{ ...inputStyle, width: '60px' }} />
                <input type="number" placeholder="Min" value={newDebt.minPayment} onChange={(e) => setNewDebt({ ...newDebt, minPayment: e.target.value })} style={{ ...inputStyle, width: '70px' }} />
                <input type="date" value={newDebt.paymentDate} onChange={(e) => setNewDebt({ ...newDebt, paymentDate: e.target.value })} style={inputStyle} />
                <select value={newDebt.frequency} onChange={(e) => setNewDebt({ ...newDebt, frequency: e.target.value })} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                <button onClick={addDebt} style={btnDanger}>Add</button>
              </div>
              {debts.length > 0 && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    {(() => {
                      // Sort to find the target debt
                      const sortedDebts = [...debts].sort((a, b) => {
                        if (payoffMethod === 'snowball') {
                          return parseFloat(a.balance) - parseFloat(b.balance)
                        } else {
                          return parseFloat(b.interestRate) - parseFloat(a.interestRate)
                        }
                      })
                      const targetDebtId = sortedDebts.length > 0 ? sortedDebts[0].id : null
                      
                      return debts.map(debt => {
                        const progress = debt.originalBalance ? ((parseFloat(debt.originalBalance) - parseFloat(debt.balance)) / parseFloat(debt.originalBalance)) * 100 : 0
                        const isTarget = debt.id === targetDebtId
                        
                        return (
                          <div key={debt.id} style={{ padding: '16px', background: isTarget ? (darkMode ? '#1e3a32' : '#f0fdf4') : (darkMode ? '#334155' : '#fef2f2'), borderRadius: '12px', border: isTarget ? '2px solid ' + theme.success : '1px solid ' + theme.border }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <div>
                                <div style={{ color: theme.text, fontWeight: 600, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {debt.name}
                                  {isTarget && <span style={{ background: theme.success, color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>🎯 TARGET</span>}
                                </div>
                                <div style={{ color: theme.textMuted, fontSize: '13px' }}>
                                  ${parseFloat(debt.balance).toFixed(2)} @ {debt.interestRate}%
                                  {isTarget && <span style={{ color: theme.success, marginLeft: '8px' }}>← {payoffMethod === 'avalanche' ? 'highest rate' : 'lowest balance'}</span>}
                                </div>
                              </div>
                              <button onClick={() => deleteDebt(debt.id)} style={{ ...btnDanger, padding: '6px 12px', fontSize: '12px' }}>Delete</button>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: Math.max(0, progress) + '%', height: '100%', background: isTarget ? 'linear-gradient(to right, ' + theme.success + ', #059669)' : 'linear-gradient(to right, ' + theme.warning + ', ' + theme.danger + ')' }} /></div>
                            <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '6px' }}>{progress.toFixed(1)}% paid off</div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                  <div style={{ padding: '20px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button onClick={() => setPayoffMethod('avalanche')} style={{ ...btnPrimary, background: payoffMethod === 'avalanche' ? theme.success : theme.cardBg, color: payoffMethod === 'avalanche' ? 'white' : theme.text, border: '2px solid ' + (payoffMethod === 'avalanche' ? theme.success : theme.border) }}>🏔️ Avalanche</button>
                      <button onClick={() => setPayoffMethod('snowball')} style={{ ...btnPrimary, background: payoffMethod === 'snowball' ? theme.success : theme.cardBg, color: payoffMethod === 'snowball' ? 'white' : theme.text, border: '2px solid ' + (payoffMethod === 'snowball' ? theme.success : theme.border) }}>❄️ Snowball</button>
                      <input type="number" placeholder="Extra $" value={extraPayment} onChange={(e) => setExtraPayment(e.target.value)} style={{ ...inputStyle, width: '90px' }} />
                      <button onClick={addExtraPaymentToCalendar} style={btnPurple}>📅 Add Extra</button>
                    </div>
                    
                    {/* Side-by-side comparison */}
                    {(() => { 
                      const withoutExtras = calculateDebtPayoff(false)
                      const withExtras = calculateDebtPayoff(true)
                      const timeSaved = withoutExtras.monthsToPayoff - withExtras.monthsToPayoff
                      const interestSaved = withoutExtras.totalInterestPaid - withExtras.totalInterestPaid
                      const hasExtras = withExtras.totalExtra > 0
                      
                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: hasExtras ? '1fr 1fr' : '1fr', gap: '16px' }}>
                          {/* Without Extras */}
                          <div style={{ padding: '16px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '12px', border: '2px solid ' + theme.danger }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: theme.danger, marginBottom: '12px' }}>😰 Minimum Payments Only</div>
                            <div style={{ color: theme.text, fontSize: '14px', lineHeight: 2 }}>
                              <div>⏱️ Time: <strong>{Math.floor(withoutExtras.monthsToPayoff / 12)}y {withoutExtras.monthsToPayoff % 12}m</strong></div>
                              <div>💸 Interest: <strong style={{ color: theme.danger }}>${withoutExtras.totalInterestPaid.toFixed(2)}</strong></div>
                            </div>
                          </div>
                          
                          {/* With Extras */}
                          {hasExtras && (
                            <div style={{ padding: '16px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '12px', border: '2px solid ' + theme.success }}>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: theme.success, marginBottom: '12px' }}>🚀 With Extra Payments (+${withExtras.totalExtra.toFixed(0)}/mo)</div>
                              <div style={{ color: theme.text, fontSize: '14px', lineHeight: 2 }}>
                                <div>⏱️ Time: <strong>{Math.floor(withExtras.monthsToPayoff / 12)}y {withExtras.monthsToPayoff % 12}m</strong></div>
                                <div>💸 Interest: <strong style={{ color: theme.success }}>${withExtras.totalInterestPaid.toFixed(2)}</strong></div>
                              </div>
                            </div>
                          )}
                          
                          {/* Savings Summary */}
                          {hasExtras && timeSaved > 0 && (
                            <div style={{ gridColumn: '1 / -1', padding: '16px', background: 'linear-gradient(135deg, ' + theme.success + '20, ' + theme.purple + '20)', borderRadius: '12px', border: '2px solid ' + theme.purple, textAlign: 'center' }}>
                              <div style={{ fontSize: '16px', fontWeight: 700, color: theme.purple, marginBottom: '8px' }}>🎉 You Save</div>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
                                <div>
                                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: theme.success }}>{Math.floor(timeSaved / 12)}y {timeSaved % 12}m</div>
                                  <div style={{ fontSize: '12px', color: theme.textMuted }}>faster payoff</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: theme.success }}>${interestSaved.toFixed(0)}</div>
                                  <div style={{ fontSize: '12px', color: theme.textMuted }}>less interest</div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {!hasExtras && (
                            <div style={{ padding: '12px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                              <div style={{ color: theme.textMuted, fontSize: '13px' }}>💡 Enter an extra payment amount above to see how much faster you can be debt-free!</div>
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
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
                <input type="text" placeholder="Goal name" value={newGoal.name} onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 100px' }} />
                <input type="number" placeholder="Target $" value={newGoal.target} onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })} style={{ ...inputStyle, width: '80px' }} />
                <input type="number" placeholder="Saved $" value={newGoal.saved} onChange={(e) => setNewGoal({ ...newGoal, saved: e.target.value })} style={{ ...inputStyle, width: '70px' }} />
                <input type="number" placeholder="Payment $" value={newGoal.paymentAmount} onChange={(e) => setNewGoal({ ...newGoal, paymentAmount: e.target.value })} title="Amount to save each period" style={{ ...inputStyle, width: '80px' }} />
                <input type="date" value={newGoal.startDate} onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })} title="Start saving date" style={inputStyle} />
                <select value={newGoal.savingsFrequency} onChange={(e) => setNewGoal({ ...newGoal, savingsFrequency: e.target.value })} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                <button onClick={addGoal} style={btnPurple}>Add</button>
              </div>
              <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '16px', padding: '0 16px' }}>
                💡 Set a "Payment $" amount to add recurring savings to your calendar. Leave blank and set a deadline to auto-calculate.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {goals.length === 0 ? <div style={{ color: theme.textMuted, textAlign: 'center', padding: '20px' }}>No goals added</div> : goals.map(goal => {
                  const progress = (parseFloat(goal.saved || 0) / parseFloat(goal.target || 1)) * 100
                  const payment = goal.paymentAmount ? parseFloat(goal.paymentAmount) : calculateGoalPayment(goal)
                  const isComplete = progress >= 100
                  return (
                    <div key={goal.id} style={{ padding: '16px', background: isComplete ? (darkMode ? '#1e3a32' : '#f0fdf4') : (darkMode ? '#334155' : '#faf5ff'), borderRadius: '12px', border: isComplete ? '2px solid ' + theme.success : '1px solid ' + theme.border }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <div style={{ color: theme.text, fontWeight: 600, fontSize: '16px' }}>{isComplete ? '✅ ' : '🎯 '}{goal.name}</div>
                          <div style={{ color: theme.textMuted, fontSize: '13px' }}>${parseFloat(goal.saved || 0).toFixed(2)} / ${parseFloat(goal.target).toFixed(2)}{goal.deadline ? ' • Due: ' + new Date(goal.deadline).toLocaleDateString() : ''}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {!isComplete && selectedGoalForExtra === goal.id ? (
                            <>
                              <input type="number" placeholder="Extra $" value={extraGoalPayment} onChange={(e) => setExtraGoalPayment(e.target.value)} style={{ ...inputStyle, width: '70px', padding: '6px 10px' }} />
                              <button onClick={() => addExtraGoalPayment(goal.id)} style={{ ...btnPurple, padding: '6px 10px', fontSize: '11px' }}>Add</button>
                              <button onClick={() => setSelectedGoalForExtra(null)} style={{ ...btnDanger, padding: '6px 10px', fontSize: '11px' }}>✕</button>
                            </>
                          ) : (
                            <>
                              {!isComplete && <button onClick={() => setSelectedGoalForExtra(goal.id)} style={{ ...btnPurple, padding: '6px 10px', fontSize: '11px' }}>+ Extra</button>}
                              <button onClick={() => deleteGoal(goal.id)} style={{ ...btnDanger, padding: '6px 10px', fontSize: '11px' }}>Delete</button>
                            </>
                          )}
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '10px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}><div style={{ width: Math.min(progress, 100) + '%', height: '100%', background: isComplete ? theme.success : 'linear-gradient(to right, ' + theme.purple + ', #7c3aed)' }} /></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                        <span style={{ color: isComplete ? theme.success : theme.textMuted, fontSize: '12px', fontWeight: isComplete ? 600 : 400 }}>{isComplete ? '🎉 Goal Complete!' : progress.toFixed(1) + '%'}</span>
                        {payment > 0 && !isComplete && <span style={{ color: theme.purple, fontSize: '12px', fontWeight: 600 }}>📅 ${payment.toFixed(2)}/{goal.savingsFrequency}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={cardStyle}>
                <h2 style={{ margin: '0 0 20px 0', color: theme.success, fontSize: '20px' }}>📈 Assets (${totalAssets.toFixed(2)})</h2>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Name" value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                  <input type="number" placeholder="Value" value={newAsset.value} onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })} style={{ ...inputStyle, width: '100px' }} />
                  <select value={newAsset.type} onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })} style={inputStyle}><option value="savings">💰 Savings</option><option value="investment">📈 Investment</option><option value="property">🏠 Property</option><option value="vehicle">🚗 Vehicle</option></select>
                  <button onClick={addAsset} style={btnSuccess}>Add</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                  {assets.map(a => (<div key={a.id} style={{ padding: '12px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ color: theme.text, fontWeight: 600 }}>{a.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{a.type}</div></div><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: theme.success, fontWeight: 700 }}>${parseFloat(a.value).toFixed(2)}</span><button onClick={() => deleteAsset(a.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕</button></div></div>))}
                </div>
              </div>
              <div style={cardStyle}>
                <h2 style={{ margin: '0 0 20px 0', color: theme.danger, fontSize: '20px' }}>📉 Liabilities (${(totalLiabilities + totalDebtBalance).toFixed(2)})</h2>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Name" value={newLiability.name} onChange={(e) => setNewLiability({ ...newLiability, name: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                  <input type="number" placeholder="Value" value={newLiability.value} onChange={(e) => setNewLiability({ ...newLiability, value: e.target.value })} style={{ ...inputStyle, width: '100px' }} />
                  <button onClick={addLiability} style={btnDanger}>Add</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                  {debts.map(d => (<div key={'d-' + d.id} style={{ padding: '12px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ color: theme.text, fontWeight: 600 }}>💳 {d.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{d.interestRate}% APR</div></div><span style={{ color: theme.danger, fontWeight: 700 }}>${parseFloat(d.balance).toFixed(2)}</span></div>))}
                  {liabilities.map(l => (<div key={l.id} style={{ padding: '12px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ color: theme.text, fontWeight: 600 }}>{l.name}</div><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: theme.danger, fontWeight: 700 }}>${parseFloat(l.value).toFixed(2)}</span><button onClick={() => deleteLiability(l.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕</button></div></div>))}
                </div>
              </div>
            </div>
            <div style={{ padding: '32px', background: 'linear-gradient(135deg, ' + theme.accent + ', ' + theme.purple + ')', borderRadius: '16px', color: 'white', textAlign: 'center' }}><div style={{ fontSize: '16px', marginBottom: '8px', opacity: 0.9 }}>💎 Net Worth</div><div style={{ fontSize: '56px', fontWeight: 'bold' }}>${netWorth.toFixed(2)}</div></div>
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>💰 Income Analysis</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '20px', background: darkMode ? '#3a2e1e' : '#fffbeb', borderRadius: '12px', textAlign: 'center', border: '2px solid ' + theme.warning }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>🏃 Active</div><div style={{ color: theme.warning, fontSize: '32px', fontWeight: 'bold' }}>${activeIncome.toFixed(2)}</div></div>
                <div style={{ padding: '20px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '12px', textAlign: 'center', border: '2px solid ' + theme.success }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>🌴 Passive</div><div style={{ color: theme.success, fontSize: '32px', fontWeight: 'bold' }}>${passiveIncome.toFixed(2)}</div></div>
                <div style={{ padding: '20px', background: 'linear-gradient(135deg, ' + theme.success + '20, ' + theme.purple + '20)', borderRadius: '12px', textAlign: 'center', border: '2px solid ' + theme.purple }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>🎯 Passive %</div><div style={{ color: theme.purple, fontSize: '32px', fontWeight: 'bold' }}>{passiveIncomePercentage.toFixed(1)}%</div></div>
              </div>
              <div style={{ marginBottom: '20px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: theme.text, fontSize: '14px', fontWeight: 600 }}>🚀 Journey to Freedom</span><span style={{ color: theme.success, fontSize: '14px', fontWeight: 600 }}>{passiveIncomePercentage.toFixed(1)}% → 100%</span></div><div style={{ width: '100%', height: '24px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '12px', overflow: 'hidden' }}><div style={{ width: Math.min(passiveIncomePercentage, 100) + '%', height: '100%', background: 'linear-gradient(to right, ' + theme.warning + ', ' + theme.success + ')' }} /></div></div>
            </div>
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>🤖 AI Budget Coach</h2>
              <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '16px', padding: '16px', background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '12px' }}>
                {chatMessages.length === 0 ? <div style={{ color: theme.textMuted, textAlign: 'center', padding: '30px' }}>💬 Ask me anything!</div> : chatMessages.map((msg, idx) => (<div key={idx} style={{ marginBottom: '12px', padding: '12px', background: msg.role === 'user' ? theme.accent : (darkMode ? '#334155' : 'white'), color: msg.role === 'user' ? 'white' : theme.text, borderRadius: '10px', marginLeft: msg.role === 'user' ? '20%' : '0', marginRight: msg.role === 'user' ? '0' : '20%' }}><div style={{ fontSize: '11px', marginBottom: '4px', opacity: 0.7 }}>{msg.role === 'user' ? '👤 You' : '🤖 Coach'}</div><div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div></div>))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}><input type="text" placeholder="Ask about budgeting..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !isAskingCoach && askBudgetCoach()} disabled={isAskingCoach} style={{ ...inputStyle, flex: 1 }} /><button onClick={askBudgetCoach} disabled={isAskingCoach} style={{ ...btnPrimary, background: isAskingCoach ? '#94a3b8' : theme.accent }}>{isAskingCoach ? '⏳' : '💬'}</button></div>
            </div>
          </div>
        )}

        {activeTab === 'path' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>📍 Where You Are Now</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>💎 Net Worth</div><div style={{ color: netWorth >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 'bold' }}>${netWorth.toFixed(0)}</div></div>
                <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>📈 Surplus</div><div style={{ color: monthlySurplus >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 'bold' }}>${monthlySurplus.toFixed(0)}</div></div>
                <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>💳 Debt</div><div style={{ color: theme.danger, fontSize: '28px', fontWeight: 'bold' }}>${totalDebtBalance.toFixed(0)}</div></div>
                <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>🌴 Passive</div><div style={{ color: theme.success, fontSize: '28px', fontWeight: 'bold' }}>${passiveIncome.toFixed(0)}/mo</div></div>
              </div>
            </div>
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, ' + theme.purple + '15, ' + theme.success + '15)', borderRadius: '16px', border: '2px solid ' + theme.purple }}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>🎯 Financial Freedom</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ ...cardStyle, padding: '20px' }}><h3 style={{ margin: '0 0 12px 0', color: theme.purple, fontSize: '18px' }}>🌴 Freedom Target</h3><div style={{ color: theme.text, fontSize: '14px', lineHeight: 2 }}><div>Monthly need: <strong>${fiPath.monthlyNeed.toFixed(0)}</strong></div><div>Passive income: <strong style={{ color: theme.success }}>${passiveIncome.toFixed(0)}</strong></div><div>Gap: <strong style={{ color: theme.danger }}>${Math.max(0, fiPath.passiveGap).toFixed(0)}</strong></div><div>Coverage: <strong style={{ color: theme.purple }}>{fiPath.passiveCoverage.toFixed(1)}%</strong></div></div></div>
                <div style={{ ...cardStyle, padding: '20px' }}><h3 style={{ margin: '0 0 12px 0', color: theme.success, fontSize: '18px' }}>🔥 FIRE Number</h3><div style={{ color: theme.text, fontSize: '14px', lineHeight: 2 }}><div>Target: <strong>${fiPath.fireNumber.toFixed(0)}</strong></div><div>Investments: <strong style={{ color: theme.success }}>${fiPath.currentInvestments.toFixed(0)}</strong></div><div>Years to FI: <strong style={{ color: theme.purple }}>{fiPath.yearsToFI >= 999 ? '∞' : fiPath.yearsToFI}</strong></div></div></div>
              </div>
            </div>
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>🛤️ The Path</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[{ step: 1, title: 'Emergency Fund', desc: '3-6 months', done: assets.filter(a => a.type === 'savings').reduce((s, a) => s + parseFloat(a.value || 0), 0) >= monthlyExpenses * 3 }, { step: 2, title: 'High-Interest Debt', desc: '>7% APR', done: debts.filter(d => parseFloat(d.interestRate) > 7).length === 0 }, { step: 3, title: 'Employer Match', desc: 'Free money', done: false }, { step: 4, title: 'All Debt', desc: 'Debt-free', done: totalDebtBalance === 0 }, { step: 5, title: 'Passive Income', desc: 'Replace active', done: passiveIncome >= totalOutgoing }, { step: 6, title: 'Freedom! 🎉', desc: 'Optional work', done: fiPath.passiveCoverage >= 100 }].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', background: item.done ? (darkMode ? '#1e3a32' : '#f0fdf4') : (darkMode ? '#334155' : '#f8fafc'), borderRadius: '12px', border: item.done ? '2px solid ' + theme.success : '1px solid ' + theme.border }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: item.done ? theme.success : theme.purple, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>{item.done ? '✓' : item.step}</div>
                    <div style={{ flex: 1 }}><div style={{ color: theme.text, fontWeight: 600 }}>{item.title}</div><div style={{ color: theme.textMuted, fontSize: '13px' }}>{item.desc}</div></div>
                    <div style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: item.done ? theme.success : theme.warning, color: 'white' }}>{item.done ? '✓ Done' : 'In Progress'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border, textAlign: 'center' }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>💰 Total P/L</div><div style={{ color: totalPL >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 'bold' }}>{totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border, textAlign: 'center' }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>📊 Win Rate</div><div style={{ color: winRate >= 50 ? theme.success : theme.warning, fontSize: '28px', fontWeight: 'bold' }}>{winRate.toFixed(1)}%</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border, textAlign: 'center' }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>📈 Trades</div><div style={{ color: theme.text, fontSize: '28px', fontWeight: 'bold' }}>{trades.length}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border, textAlign: 'center' }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>✅ Winners</div><div style={{ color: theme.success, fontSize: '28px', fontWeight: 'bold' }}>{trades.filter(t => parseFloat(t.profitLoss || 0) > 0).length}</div></div>
            </div>
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>📝 Log Trade</h2>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <input type="date" value={newTrade.date} onChange={(e) => setNewTrade({ ...newTrade, date: e.target.value })} style={inputStyle} />
                <input type="text" placeholder="Instrument" value={newTrade.instrument} onChange={(e) => setNewTrade({ ...newTrade, instrument: e.target.value })} style={{ ...inputStyle, flex: '1 1 100px' }} />
                <select value={newTrade.direction} onChange={(e) => setNewTrade({ ...newTrade, direction: e.target.value })} style={inputStyle}><option value="long">📈 Long</option><option value="short">📉 Short</option></select>
                <input type="number" placeholder="Entry" value={newTrade.entryPrice} onChange={(e) => setNewTrade({ ...newTrade, entryPrice: e.target.value })} style={{ ...inputStyle, width: '80px' }} />
                <input type="number" placeholder="Exit" value={newTrade.exitPrice} onChange={(e) => setNewTrade({ ...newTrade, exitPrice: e.target.value })} style={{ ...inputStyle, width: '80px' }} />
                <input type="number" placeholder="P/L" value={newTrade.profitLoss} onChange={(e) => setNewTrade({ ...newTrade, profitLoss: e.target.value })} style={{ ...inputStyle, width: '80px' }} />
                <button onClick={addTrade} style={btnWarning}>Log</button>
              </div>
              <textarea placeholder="Notes..." value={newTrade.notes} onChange={(e) => setNewTrade({ ...newTrade, notes: e.target.value })} style={{ ...inputStyle, width: '100%', minHeight: '60px', resize: 'vertical' }} />
            </div>
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>📔 History</h2>
              {trades.length === 0 ? <div style={{ color: theme.textMuted, textAlign: 'center', padding: '40px' }}>📈 No trades yet</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {trades.map(trade => { const pl = parseFloat(trade.profitLoss || 0); const isWin = pl >= 0; return (
                    <div key={trade.id} style={{ padding: '16px', background: isWin ? (darkMode ? '#1e3a32' : '#f0fdf4') : (darkMode ? '#3a1e1e' : '#fef2f2'), borderRadius: '12px', border: '2px solid ' + (isWin ? theme.success : theme.danger) }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div><div style={{ color: theme.text, fontWeight: 600, fontSize: '16px' }}>{trade.instrument} • {trade.direction === 'long' ? '📈' : '📉'} {trade.direction.toUpperCase()}</div><div style={{ color: theme.textMuted, fontSize: '13px' }}>{new Date(trade.date).toLocaleDateString()} • {trade.entryPrice} → {trade.exitPrice}</div></div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: isWin ? theme.success : theme.danger }}>{isWin ? '+' : ''}${pl.toFixed(2)}</div>
                      </div>
                      {trade.notes && <div style={{ color: theme.textMuted, fontSize: '13px', fontStyle: 'italic', marginTop: '8px', padding: '8px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '6px' }}>"{trade.notes}"</div>}
                    </div>
                  )})}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
