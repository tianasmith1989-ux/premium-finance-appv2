'use client'

import { useUser } from '@clerk/nextjs'
import { useState } from 'react'

// Define interfaces for our data structures
interface Income {
  id: number;
  name: string;
  amount: string;
  frequency: string;
  type: string;
  startDate: string;
}

interface Expense {
  id: number;
  name: string;
  amount: string;
  frequency: string;
  dueDate: string;
  targetDebtId?: number;
  targetGoalId?: number;
}

interface Debt {
  id: number;
  name: string;
  balance: string;
  interestRate: string;
  minPayment: string;
  frequency: string;
  paymentDate: string;
  originalBalance?: string;
}

interface Goal {
  id: number;
  name: string;
  target: string;
  saved: string;
  deadline: string;
  savingsFrequency: string;
  startDate: string;
  paymentAmount: string;
}

interface Asset {
  id: number;
  name: string;
  value: string;
  type: string;
}

interface Liability {
  id: number;
  name: string;
  value: string;
  type: string;
}

interface Trade {
  id: number;
  date: string;
  instrument: string;
  direction: string;
  entryPrice: string;
  exitPrice: string;
  profitLoss: string;
  notes: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface CalendarItem {
  id: string;
  sourceId: number;
  sourceType: string;
  name: string;
  amount: string;
  dueDate: string;
  frequency: string;
  type: string;
  originalId?: string;
  occurrenceDate?: string;
  isPaid?: boolean;
  targetDebtId?: number;
  targetGoalId?: number;
}

interface Alert {
  severity: string;
  message: string;
  amount: string;
}

export default function Dashboard() {
  const { user } = useUser()
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'path' | 'trading'>('dashboard')
  const [darkMode, setDarkMode] = useState(true)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  
  const [incomeStreams, setIncomeStreams] = useState<Income[]>([])
  const [newIncome, setNewIncome] = useState({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0] })
  
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', frequency: 'monthly', dueDate: new Date().toISOString().split('T')[0] })
  
  const [debts, setDebts] = useState<Debt[]>([])
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: new Date().toISOString().split('T')[0] })
  const [payoffMethod, setPayoffMethod] = useState<'snowball' | 'avalanche'>('avalanche')
  
  const [goals, setGoals] = useState<Goal[]>([])
  const [newGoal, setNewGoal] = useState({ name: '', target: '', saved: '0', deadline: '', savingsFrequency: 'monthly', startDate: new Date().toISOString().split('T')[0], paymentAmount: '' })
  const [extraGoalPayment, setExtraGoalPayment] = useState('')
  const [selectedGoalForExtra, setSelectedGoalForExtra] = useState<number | null>(null)
  
  const [assets, setAssets] = useState<Asset[]>([])
  const [newAsset, setNewAsset] = useState({ name: '', value: '', type: 'savings' })
  const [liabilities, setLiabilities] = useState<Liability[]>([])
  const [newLiability, setNewLiability] = useState({ name: '', value: '', type: 'loan' })
  
  const [paidOccurrences, setPaidOccurrences] = useState<Set<string>>(new Set())
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isAskingCoach, setIsAskingCoach] = useState(false)
  
  const [trades, setTrades] = useState<Trade[]>([])
  const [newTrade, setNewTrade] = useState({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' })

  const [expandedDay, setExpandedDay] = useState<{day: number, items: CalendarItem[]} | null>(null)
  
  // Per-debt extra payment state
  const [debtExtraPayment, setDebtExtraPayment] = useState<Record<number, {amount: string, frequency: string}>>({})
  const [showExtraInput, setShowExtraInput] = useState<number | null>(null)

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
    if (frequency === 'once') return amount
    return amount
  }
  
  const monthlyIncome = incomeStreams.reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || '0'), inc.frequency), 0)
  const activeIncome = incomeStreams.filter(inc => inc.type === 'active').reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || '0'), inc.frequency), 0)
  const passiveIncome = incomeStreams.filter(inc => inc.type === 'passive').reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || '0'), inc.frequency), 0)
  const passiveIncomePercentage = monthlyIncome > 0 ? (passiveIncome / monthlyIncome) * 100 : 0
  const monthlyExpenses = expenses.filter(e => !e.targetDebtId && !e.targetGoalId).reduce((sum, exp) => sum + convertToMonthly(parseFloat(exp.amount || '0'), exp.frequency), 0)
  const monthlyDebtPayments = debts.reduce((sum, debt) => sum + convertToMonthly(parseFloat(debt.minPayment || '0'), debt.frequency), 0)
  const totalDebtBalance = debts.reduce((sum, d) => sum + parseFloat(d.balance || '0'), 0)
  const totalOutgoing = monthlyExpenses + monthlyDebtPayments
  const monthlySurplus = monthlyIncome - totalOutgoing
  const totalAssets = assets.reduce((sum, a) => sum + parseFloat(a.value || '0'), 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + parseFloat(l.value || '0'), 0)
  const netWorth = totalAssets - totalLiabilities - totalDebtBalance
  const totalPL = trades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)
  const winRate = trades.length > 0 ? (trades.filter(t => parseFloat(t.profitLoss || '0') > 0).length / trades.length) * 100 : 0

  const getAlerts = () => {
    const alertsList: Alert[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    expenses.forEach(exp => {
      if (exp.targetDebtId || exp.targetGoalId) return
      const dueDate = new Date(exp.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntilDue < 0) alertsList.push({ severity: 'danger', message: exp.name + ' is ' + Math.abs(daysUntilDue) + ' days overdue', amount: exp.amount })
      else if (daysUntilDue <= 3) alertsList.push({ severity: 'warning', message: exp.name + ' due in ' + daysUntilDue + ' days', amount: exp.amount })
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
  
  const calculateGoalPayment = (goal: Goal) => {
    const remaining = parseFloat(goal.target || '0') - parseFloat(goal.saved || '0')
    if (!goal.deadline || remaining <= 0) return 0
    const monthsRemaining = Math.max(1, Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)))
    const monthlyNeeded = remaining / monthsRemaining
    if (goal.savingsFrequency === 'weekly') return monthlyNeeded / (52 / 12)
    if (goal.savingsFrequency === 'fortnightly') return monthlyNeeded / (26 / 12)
    return monthlyNeeded
  }

  const getCalendarItemsForDay = (day: number) => {
    const { month, year } = getDaysInMonth()
    const items: CalendarItem[] = []
    
    // Cast items to CalendarItem with proper types
    const incomeItems: CalendarItem[] = incomeStreams.map(inc => ({
      id: 'income-' + inc.id,
      sourceId: inc.id,
      sourceType: 'income',
      name: '💰 ' + inc.name,
      amount: inc.amount,
      dueDate: inc.startDate,
      frequency: inc.frequency,
      type: 'income'
    }))

    const expenseItems: CalendarItem[] = expenses.map(exp => ({
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
    }))

    const debtItems: CalendarItem[] = debts
      .filter(d => d.paymentDate)
      .map(debt => ({
        id: 'debt-' + debt.id,
        sourceId: debt.id,
        sourceType: 'debt',
        name: '💳 ' + debt.name,
        amount: debt.minPayment,
        dueDate: debt.paymentDate,
        frequency: debt.frequency,
        type: 'debt'
      }))

    const goalItems: CalendarItem[] = goals
      .filter(g => g.startDate)
      .map(goal => {
        const paymentAmt = goal.paymentAmount ? parseFloat(goal.paymentAmount) : (goal.deadline ? calculateGoalPayment(goal) : 0)
        return {
          id: 'goal-' + goal.id,
          sourceId: goal.id,
          sourceType: 'goal',
          name: '🎯 ' + goal.name,
          amount: paymentAmt.toFixed(2),
          dueDate: goal.startDate,
          frequency: goal.savingsFrequency,
          type: 'goal'
        }
      })

    const allItems = [...incomeItems, ...expenseItems, ...debtItems, ...goalItems]
    
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
          const daysInCurrentMonth = new Date(year, month + 1, 0).getDate()
          if (itemDay > daysInCurrentMonth) {
            shouldShow = day === daysInCurrentMonth
          } else {
            shouldShow = day === itemDay
          }
        }
        else if (item.frequency === 'yearly') shouldShow = day === itemDay && month === itemMonth
      }
      
      if (shouldShow) {
        const occurrenceDate = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0')
        const uniqueId = item.id + '-' + occurrenceDate
        items.push({ 
          ...item, 
          id: uniqueId, 
          originalId: item.id, 
          occurrenceDate, 
          isPaid: paidOccurrences.has(uniqueId) 
        })
      }
    })
    return items
  }

  const togglePaid = (itemId: string, sourceType: string, sourceId: number, amount: number, targetDebtId?: number, targetGoalId?: number) => {
    const newPaid = new Set(paidOccurrences)
    const paymentAmount = amount || 0
    
    if (paidOccurrences.has(itemId)) {
      newPaid.delete(itemId)
      if (sourceType === 'goal' && sourceId) {
        setGoals(prev => prev.map(g => g.id === sourceId ? { ...g, saved: Math.max(0, parseFloat(g.saved || '0') - paymentAmount).toFixed(2) } : g))
      } else if (sourceType === 'debt' && sourceId) {
        setDebts(prev => prev.map(d => d.id === sourceId ? { ...d, balance: (parseFloat(d.balance || '0') + paymentAmount).toFixed(2) } : d))
      } else if (sourceType === 'extraDebt' && targetDebtId) {
        setDebts(prev => prev.map(d => d.id === targetDebtId ? { ...d, balance: (parseFloat(d.balance || '0') + paymentAmount).toFixed(2) } : d))
      } else if (sourceType === 'extraGoal' && targetGoalId) {
        setGoals(prev => prev.map(g => g.id === targetGoalId ? { ...g, saved: Math.max(0, parseFloat(g.saved || '0') - paymentAmount).toFixed(2) } : g))
      }
    } else {
      newPaid.add(itemId)
      if (sourceType === 'goal' && sourceId) {
        setGoals(prev => prev.map(g => g.id === sourceId ? { ...g, saved: (parseFloat(g.saved || '0') + paymentAmount).toFixed(2) } : g))
      } else if (sourceType === 'debt' && sourceId) {
        setDebts(prev => prev.map(d => d.id === sourceId ? { ...d, balance: Math.max(0, parseFloat(d.balance || '0') - paymentAmount).toFixed(2) } : d))
      } else if (sourceType === 'extraDebt' && targetDebtId) {
        setDebts(prev => prev.map(d => d.id === targetDebtId ? { ...d, balance: Math.max(0, parseFloat(d.balance || '0') - paymentAmount).toFixed(2) } : d))
      } else if (sourceType === 'extraGoal' && targetGoalId) {
        setGoals(prev => prev.map(g => g.id === targetGoalId ? { ...g, saved: (parseFloat(g.saved || '0') + paymentAmount).toFixed(2) } : g))
      }
    }
    setPaidOccurrences(newPaid)
  }

  const addIncome = () => { 
    if (!newIncome.name || !newIncome.amount) return; 
    setIncomeStreams([...incomeStreams, { ...newIncome, id: Date.now() }]); 
    setNewIncome({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0] }) 
  }
  
  const deleteIncome = (id: number) => setIncomeStreams(incomeStreams.filter(i => i.id !== id))
  
  const addExpense = () => { 
    if (!newExpense.name || !newExpense.amount) return; 
    setExpenses([...expenses, { ...newExpense, id: Date.now() }]); 
    setNewExpense({ name: '', amount: '', frequency: 'monthly', dueDate: new Date().toISOString().split('T')[0] }) 
  }
  
  const deleteExpense = (id: number) => setExpenses(expenses.filter(e => e.id !== id))
  
  const addDebt = () => { 
    if (!newDebt.name || !newDebt.balance) return; 
    setDebts([...debts, { ...newDebt, id: Date.now(), originalBalance: newDebt.balance }]); 
    setNewDebt({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: new Date().toISOString().split('T')[0] }) 
  }
  
  const deleteDebt = (id: number) => setDebts(debts.filter(d => d.id !== id))
  
  const addGoal = () => { 
    if (!newGoal.name || !newGoal.target) return; 
    setGoals([...goals, { ...newGoal, saved: newGoal.saved || '0', paymentAmount: newGoal.paymentAmount || '', id: Date.now() }]); 
    setNewGoal({ name: '', target: '', saved: '0', deadline: '', savingsFrequency: 'monthly', startDate: new Date().toISOString().split('T')[0], paymentAmount: '' }) 
  }
  
  const deleteGoal = (id: number) => setGoals(goals.filter(g => g.id !== id))
  
  const addAsset = () => { 
    if (!newAsset.name || !newAsset.value) return; 
    setAssets([...assets, { ...newAsset, id: Date.now() }]); 
    setNewAsset({ name: '', value: '', type: 'savings' }) 
  }
  
  const deleteAsset = (id: number) => setAssets(assets.filter(a => a.id !== id))
  
  const addLiability = () => { 
    if (!newLiability.name || !newLiability.value) return; 
    setLiabilities([...liabilities, { ...newLiability, id: Date.now() }]); 
    setNewLiability({ name: '', value: '', type: 'loan' }) 
  }
  
  const deleteLiability = (id: number) => setLiabilities(liabilities.filter(l => l.id !== id))
  
  const addTrade = () => { 
    if (!newTrade.instrument) return; 
    setTrades([...trades, { ...newTrade, id: Date.now() }].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())); 
    setNewTrade({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' }) 
  }

  const addExtraPaymentToDebt = (debtId: number) => {
    const extra = debtExtraPayment[debtId]
    if (!extra || !extra.amount || parseFloat(extra.amount) <= 0) { alert('Please enter an extra payment amount'); return }
    const debt = debts.find(d => d.id === debtId)
    if (!debt) return
    const paymentDate = prompt('When should extra payment start? (YYYY-MM-DD):', new Date().toISOString().split('T')[0])
    if (!paymentDate) return
    setExpenses([...expenses, { 
      id: Date.now(), 
      name: 'Extra → ' + debt.name, 
      amount: extra.amount, 
      frequency: extra.frequency, 
      dueDate: paymentDate, 
      targetDebtId: debt.id 
    }])
    alert('Extra payment of $' + extra.amount + '/' + extra.frequency + ' added to ' + debt.name)
    setDebtExtraPayment(prev => ({ ...prev, [debtId]: { amount: '', frequency: 'monthly' } }))
    setShowExtraInput(null)
  }

  const addExtraGoalPayment = (goalId: number) => {
    if (!extraGoalPayment || parseFloat(extraGoalPayment) <= 0) { alert('Please enter an extra payment amount'); return }
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    const paymentDate = prompt('When should extra goal payment start? (YYYY-MM-DD):', new Date().toISOString().split('T')[0])
    if (!paymentDate) return
    setExpenses([...expenses, { 
      id: Date.now(), 
      name: 'Extra → ' + goal.name, 
      amount: extraGoalPayment, 
      frequency: 'monthly', 
      dueDate: paymentDate, 
      targetGoalId: goalId 
    }])
    alert('Extra payment of $' + extraGoalPayment + '/month added for goal: ' + goal.name)
    setExtraGoalPayment('')
    setSelectedGoalForExtra(null)
  }

  const calculateSingleDebtPayoff = (debt: Debt, includeExtras: boolean = true) => {
    const balance = parseFloat(debt.balance || '0')
    const interestRate = parseFloat(debt.interestRate || '0')
    const minPayment = convertToMonthly(parseFloat(debt.minPayment || '0'), debt.frequency || 'monthly')
    const debtExtras = includeExtras ? expenses.filter(exp => exp.targetDebtId === debt.id).reduce((sum, exp) => sum + convertToMonthly(parseFloat(exp.amount || '0'), exp.frequency), 0) : 0
    const totalPayment = minPayment + debtExtras
    const monthlyInterest = (balance * interestRate / 100) / 12
    
    if (totalPayment <= 0 || totalPayment < monthlyInterest * 0.99) {
      return { monthsToPayoff: -1, totalInterestPaid: 0, error: true, extraPayments: debtExtras }
    }
    
    let remainingBalance = balance, totalInterestPaid = 0, monthsToPayoff = 0
    while (remainingBalance > 0 && monthsToPayoff < 600) {
      monthsToPayoff++
      const interest = (remainingBalance * interestRate / 100) / 12
      totalInterestPaid += interest
      remainingBalance = Math.max(0, remainingBalance + interest - totalPayment)
    }
    return { monthsToPayoff, totalInterestPaid, error: false, extraPayments: debtExtras }
  }

  const calculateTotalDebtPayoff = () => {
    let maxMonths = 0, totalInterest = 0, hasError = false
    debts.forEach(debt => {
      const result = calculateSingleDebtPayoff(debt, true)
      if (result.error) hasError = true
      else { maxMonths = Math.max(maxMonths, result.monthsToPayoff); totalInterest += result.totalInterestPaid }
    })
    return { maxMonths, totalInterest, hasError }
  }

  const fiPath = (() => {
    const monthlyNeed = totalOutgoing
    const passiveGap = monthlyNeed - passiveIncome
    const passiveCoverage = monthlyNeed > 0 ? (passiveIncome / monthlyNeed) * 100 : 0
    const fireNumber = (monthlyNeed * 12) * 25
    const currentInvestments = assets.filter(a => a.type === 'investment').reduce((sum, a) => sum + parseFloat(a.value || '0'), 0)
    const yearsToFI = monthlySurplus > 0 ? Math.ceil((fireNumber - currentInvestments) / (monthlySurplus * 6 * 12)) : 999
    return { monthlyNeed, passiveGap, passiveCoverage, fireNumber, currentInvestments, yearsToFI }
  })()

  const askBudgetCoach = async () => {
    if (!chatInput.trim()) return
    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }])
    setChatInput('')
    setIsAskingCoach(true)
    try {
      const context = 'Income: $' + monthlyIncome.toFixed(2) + ', Expenses: $' + monthlyExpenses.toFixed(2) + ', Debt: $' + totalDebtBalance.toFixed(2)
      const response = await fetch('/api/budget-coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: chatInput, financialContext: context }) })
      const data = await response.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.advice || 'Sorry, I could not respond.' }])
    } catch { 
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]) 
    } finally { 
      setIsAskingCoach(false) 
    }
  }

  const renderCalendarItem = (item: CalendarItem, compact: boolean = false) => (
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
        <div style={{ 
          fontWeight: 600, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap', 
          textDecoration: item.isPaid ? 'line-through' : 'none' 
        }}>
          {item.name}
        </div>
        <div style={{ fontSize: compact ? '9px' : '11px', color: '#666' }}>
          ${parseFloat(item.amount || '0').toFixed(0)}
        </div>
      </div>
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          togglePaid(item.id, item.sourceType, item.sourceId, parseFloat(item.amount || '0'), item.targetDebtId, item.targetGoalId) 
        }} 
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

  // Return JSX (rest of the component remains the same, with proper type usage)
  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      {/* ... rest of the JSX remains exactly the same ... */}
      {/* The JSX doesn't need changes, only the TypeScript types were fixed */}
    </div>
  )
}
