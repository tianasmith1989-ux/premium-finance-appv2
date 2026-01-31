'use client'

import { useUser } from '@clerk/nextjs'
import { useState } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'path' | 'trading'>('dashboard')
  const [darkMode, setDarkMode] = useState(true)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [tradingCalendarMonth, setTradingCalendarMonth] = useState(new Date())
  const [forexPropCalendarMonth, setForexPropCalendarMonth] = useState(new Date())
  const [futuresPropCalendarMonth, setFuturesPropCalendarMonth] = useState(new Date())
  
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

  // Goal Calculator state
  const [goalCalculator, setGoalCalculator] = useState({ targetAmount: '', currentAmount: '', monthlyContribution: '', interestRate: '', years: '' })
  const [calculatorResult, setCalculatorResult] = useState<any>(null)
  const [calculating, setCalculating] = useState(false)

  // Forex/CFD Prop Calculator state
  const [forexProp, setForexProp] = useState({
    phase: 'phase1',
    accountSize: '100000',
    // Phase 1 rules
    phase1DailyDD: '5',
    phase1MaxDD: '10',
    phase1Target: '10',
    phase1MinDays: '4',
    phase1MaxDays: '30',
    // Phase 2 rules
    phase2DailyDD: '5',
    phase2MaxDD: '10',
    phase2Target: '5',
    phase2MinDays: '4',
    phase2MaxDays: '60',
    // Funded rules
    fundedDailyDD: '5',
    fundedMaxDD: '10',
    // Current progress
    currentBalance: '100000',
    tradingDays: '0',
    // Trading plan
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
    // Evaluation rules
    evalTrailingDD: '2500',
    evalProfitTarget: '3000',
    evalMinDays: '7',
    evalDrawdownType: 'trailing',
    // PA (Performance) rules - some props have this
    paTrailingDD: '2500',
    paProfitTarget: '3000',
    paMinDays: '7',
    paDrawdownType: 'eod',
    // Funded rules
    fundedTrailingDD: '2500',
    fundedDrawdownType: 'eod',
    // Current progress
    currentBalance: '50000',
    highWaterMark: '50000',
    tradingDays: '0',
    contractLimit: '10',
    // Trading plan
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
    includeDays: ['M', 'T', 'W', 'T2', 'F'], // Weekdays by default (trading days)
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
    const alertsList: any[] = []
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
  
  const calculateGoalPayment = (goal: any) => {
    const remaining = parseFloat(goal.target || '0') - parseFloat(goal.saved || '0')
    if (!goal.deadline || remaining <= 0) return 0
    const monthsRemaining = Math.max(1, Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)))
    const monthlyNeeded = remaining / monthsRemaining
    if (goal.savingsFrequency === 'weekly') return monthlyNeeded / (52 / 12)
    if (goal.savingsFrequency === 'fortnightly') return monthlyNeeded / (26 / 12)
    return monthlyNeeded
  }

  const calculateMonthsToGoal = (goal: any) => {
    const remaining = parseFloat(goal.target || '0') - parseFloat(goal.saved || '0')
    if (remaining <= 0) return 0
    const payment = goal.paymentAmount ? parseFloat(goal.paymentAmount) : calculateGoalPayment(goal)
    const monthlyPayment = convertToMonthly(payment, goal.savingsFrequency || 'monthly')
    if (monthlyPayment <= 0) return 999
    return Math.ceil(remaining / monthlyPayment)
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
        items.push({ ...item, id: uniqueId, originalId: item.id, occurrenceDate, isPaid: paidOccurrences.has(uniqueId) })
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

  const addExtraPaymentToDebt = (debtId: number) => {
    const extra = debtExtraPayment[debtId]
    if (!extra || !extra.amount || parseFloat(extra.amount) <= 0) { alert('Please enter an extra payment amount'); return }
    const debt = debts.find(d => d.id === debtId)
    if (!debt) return
    const paymentDate = prompt('When should extra payment start? (YYYY-MM-DD):', new Date().toISOString().split('T')[0])
    if (!paymentDate) return
    setExpenses([...expenses, { id: Date.now(), name: 'Extra → ' + debt.name, amount: extra.amount, frequency: extra.frequency, dueDate: paymentDate, targetDebtId: debt.id }])
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
    setExpenses([...expenses, { id: Date.now(), name: 'Extra → ' + goal.name, amount: extraGoalPayment, frequency: 'monthly', dueDate: paymentDate, targetGoalId: goalId }])
    alert('Extra payment of $' + extraGoalPayment + '/month added for goal: ' + goal.name)
    setExtraGoalPayment('')
    setSelectedGoalForExtra(null)
  }

  const calculateSingleDebtPayoff = (debt: any, includeExtras: boolean = true) => {
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

  const calculateGoal = () => {
    setCalculating(true)
    const target = parseFloat(goalCalculator.targetAmount || '0')
    const current = parseFloat(goalCalculator.currentAmount || '0')
    const monthly = parseFloat(goalCalculator.monthlyContribution || '0')
    const rate = parseFloat(goalCalculator.interestRate || '0') / 100 / 12
    const years = parseFloat(goalCalculator.years || '0')
    
    let months = 0
    let balance = current
    const remaining = target - current
    
    if (years > 0) {
      months = years * 12
      for (let i = 0; i < months; i++) {
        balance = balance * (1 + rate) + monthly
      }
    } else if (monthly > 0) {
      while (balance < target && months < 600) {
        balance = balance * (1 + rate) + monthly
        months++
      }
    }
    
    const totalContributed = current + (monthly * months)
    const interestEarned = balance - totalContributed
    
    setCalculatorResult({
      months,
      futureValue: balance,
      totalContributed,
      interestEarned,
      totalMonths: months
    })
    setCalculating(false)
  }

  // Forex/CFD Prop Calculator
  const calculateForexProp = () => {
    const phase = forexProp.phase
    const accountSize = parseFloat(forexProp.accountSize || '0')
    
    // Get rules based on current phase
    let dailyDD: number, maxDD: number, profitTarget: number, minDays: number, maxDays: number
    
    if (phase === 'phase1') {
      dailyDD = parseFloat(forexProp.phase1DailyDD || '0') / 100
      maxDD = parseFloat(forexProp.phase1MaxDD || '0') / 100
      profitTarget = parseFloat(forexProp.phase1Target || '0') / 100
      minDays = parseInt(forexProp.phase1MinDays || '0')
      maxDays = parseInt(forexProp.phase1MaxDays || '30')
    } else if (phase === 'phase2') {
      dailyDD = parseFloat(forexProp.phase2DailyDD || '0') / 100
      maxDD = parseFloat(forexProp.phase2MaxDD || '0') / 100
      profitTarget = parseFloat(forexProp.phase2Target || '0') / 100
      minDays = parseInt(forexProp.phase2MinDays || '0')
      maxDays = parseInt(forexProp.phase2MaxDays || '60')
    } else {
      // Funded - no profit target or max days
      dailyDD = parseFloat(forexProp.fundedDailyDD || '0') / 100
      maxDD = parseFloat(forexProp.fundedMaxDD || '0') / 100
      profitTarget = 0
      minDays = 0
      maxDays = 999
    }
    
    const currentBalance = parseFloat(forexProp.currentBalance || '0')
    const tradingDays = parseInt(forexProp.tradingDays || '0')
    const riskPerTrade = parseFloat(forexProp.riskPerTrade || '0') / 100
    const tradesPerDay = parseInt(forexProp.tradesPerDay || '0')
    const winRate = parseFloat(forexProp.winRate || '0') / 100
    const avgRR = parseFloat(forexProp.avgRR || '0')
    const profitSplit = parseFloat(forexProp.profitSplit || '0') / 100

    // Key calculations
    const dailyDrawdownAmount = accountSize * dailyDD
    const maxDrawdownAmount = accountSize * maxDD
    const profitTargetAmount = accountSize * profitTarget
    const currentProfit = currentBalance - accountSize
    const profitRemaining = phase === 'funded' ? 0 : profitTargetAmount - currentProfit
    const daysRemaining = phase === 'funded' ? 999 : maxDays - tradingDays
    const drawdownUsed = Math.max(0, accountSize - currentBalance)
    const drawdownRemaining = maxDrawdownAmount - drawdownUsed
    
    // Daily targets
    const dailyProfitNeeded = (daysRemaining > 0 && phase !== 'funded') ? profitRemaining / daysRemaining : 0
    const dailyProfitPercent = currentBalance > 0 ? (dailyProfitNeeded / currentBalance) * 100 : 0
    
    // Risk analysis
    const maxLossesToday = dailyDrawdownAmount / (accountSize * riskPerTrade)
    const maxLossesTotal = drawdownRemaining / (accountSize * riskPerTrade)
    const riskPerTradeAmount = accountSize * riskPerTrade
    
    // Expected value per trade
    const expectedWin = riskPerTradeAmount * avgRR
    const expectancy = (winRate * expectedWin) - ((1 - winRate) * riskPerTradeAmount)
    const dailyExpectedPL = expectancy * tradesPerDay
    const daysToTarget = (dailyExpectedPL > 0 && phase !== 'funded') ? profitRemaining / dailyExpectedPL : 0
    
    // Progress
    const profitProgress = phase === 'funded' ? 100 : profitTargetAmount > 0 ? (currentProfit / profitTargetAmount) * 100 : 0
    const dayProgress = minDays > 0 ? (tradingDays / minDays) * 100 : 100
    const onTrack = phase === 'funded' || dailyExpectedPL >= dailyProfitNeeded
    
    // Payout calculation
    const potentialPayout = phase === 'funded' ? currentProfit * profitSplit : profitTargetAmount * profitSplit
    
    // Worst case scenarios
    const consecutiveLossesToBlow = Math.floor(maxDrawdownAmount / riskPerTradeAmount)
    const consecutiveLossesTodayLimit = Math.floor(dailyDrawdownAmount / riskPerTradeAmount)

    setForexPropResults({
      phase,
      accountSize,
      dailyDrawdownAmount,
      maxDrawdownAmount,
      profitTargetAmount,
      currentProfit,
      profitRemaining,
      daysRemaining,
      drawdownUsed,
      drawdownRemaining,
      dailyProfitNeeded,
      dailyProfitPercent,
      maxLossesToday,
      maxLossesTotal,
      riskPerTradeAmount,
      expectancy,
      dailyExpectedPL,
      daysToTarget: Math.ceil(daysToTarget),
      profitProgress,
      dayProgress,
      onTrack,
      potentialPayout,
      consecutiveLossesToBlow,
      consecutiveLossesTodayLimit,
      minDaysComplete: tradingDays >= minDays,
      minDays,
      maxDays
    })
  }

  // Futures Prop Calculator
  const calculateFuturesProp = () => {
    const phase = futuresProp.phase
    const accountSize = parseFloat(futuresProp.accountSize || '0')
    
    // Get rules based on current phase
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
      // Funded
      trailingDD = parseFloat(futuresProp.fundedTrailingDD || '0')
      profitTarget = 0
      minDays = 0
      drawdownType = futuresProp.fundedDrawdownType
    }
    
    const currentBalance = parseFloat(futuresProp.currentBalance || '0')
    const highWaterMark = parseFloat(futuresProp.highWaterMark || '0')
    const tradingDays = parseInt(futuresProp.tradingDays || '0')
    const contractLimit = parseInt(futuresProp.contractLimit || '0')
    const riskPerTrade = parseFloat(futuresProp.riskPerTrade || '0')
    const tradesPerDay = parseInt(futuresProp.tradesPerDay || '0')
    const winRate = parseFloat(futuresProp.winRate || '0') / 100
    const avgWin = parseFloat(futuresProp.avgWin || '0')
    const avgLoss = parseFloat(futuresProp.avgLoss || '0')
    const profitSplit = parseFloat(futuresProp.profitSplit || '0') / 100

    // Current profit calculations
    const currentProfit = currentBalance - accountSize
    const profitRemaining = phase === 'funded' ? 0 : profitTarget - currentProfit
    
    // Trailing drawdown calculations
    let drawdownThreshold: number
    let drawdownRemaining: number
    
    if (drawdownType === 'trailing') {
      const maxBalance = Math.max(highWaterMark, currentBalance)
      drawdownThreshold = maxBalance - trailingDD
      const minThreshold = accountSize - trailingDD
      drawdownThreshold = Math.max(drawdownThreshold, minThreshold)
      if (highWaterMark >= accountSize + trailingDD) {
        drawdownThreshold = accountSize
      }
      drawdownRemaining = currentBalance - drawdownThreshold
    } else {
      drawdownThreshold = accountSize - trailingDD
      drawdownRemaining = currentBalance - drawdownThreshold
    }
    
    // Risk analysis
    const maxLossesBeforeBlow = Math.floor(drawdownRemaining / riskPerTrade)
    
    // Expected value
    const expectancy = (winRate * avgWin) - ((1 - winRate) * avgLoss)
    const dailyExpectedPL = expectancy * tradesPerDay
    const daysToTarget = (dailyExpectedPL > 0 && phase !== 'funded') ? profitRemaining / dailyExpectedPL : 0
    
    // Progress
    const profitProgress = phase === 'funded' ? 100 : profitTarget > 0 ? (currentProfit / profitTarget) * 100 : 0
    const dayProgress = minDays > 0 ? (tradingDays / minDays) * 100 : 100
    
    // Payout
    const potentialPayout = phase === 'funded' ? currentProfit * profitSplit : profitTarget * profitSplit
    
    // Check if trailing has locked to break-even
    const lockedAtBreakeven = highWaterMark >= accountSize + trailingDD
    
    // Safety margin
    const safetyMargin = riskPerTrade > 0 ? (drawdownRemaining / riskPerTrade).toFixed(1) : '0'

    setFuturesPropResults({
      phase,
      accountSize,
      trailingDD,
      profitTarget,
      currentBalance,
      currentProfit,
      profitRemaining,
      drawdownThreshold,
      drawdownRemaining,
      maxLossesBeforeBlow,
      expectancy,
      dailyExpectedPL,
      daysToTarget: Math.ceil(daysToTarget),
      profitProgress,
      dayProgress,
      potentialPayout,
      lockedAtBreakeven,
      safetyMargin,
      minDaysComplete: tradingDays >= minDays,
      minDays,
      contractLimit,
      drawdownType,
      riskPerTrade
    })
  }

  const calculateTradingCompounding = () => {
    setCalculatingTrading(true)
    const startCap = parseFloat(tradingCalculator.startingCapital || '0')
    const monthlyAdd = parseFloat(tradingCalculator.monthlyContribution || '0')
    const returnRate = parseFloat(tradingCalculator.returnRate || '0') / 100
    const returnPeriod = tradingCalculator.returnPeriod
    const reinvestRate = parseFloat(tradingCalculator.reinvestRate || '100') / 100
    const yrs = parseInt(tradingCalculator.years || '0')
    const mos = parseInt(tradingCalculator.months || '0')
    const dys = parseInt(tradingCalculator.days || '0')
    const riskPct = parseFloat(tradingCalculator.riskPerTrade || '0')
    const winRt = parseFloat(tradingCalculator.winRate || '0') / 100
    const rr = parseFloat(tradingCalculator.riskReward || '0')
    const includeDays = tradingCalculator.includeDays
    
    // Calculate total calendar days first
    const totalCalendarDays = (yrs * 365) + (mos * 30) + dys
    
    // Calculate trading days based on selected days (ratio of week)
    const tradingDaysPerWeek = includeDays.length
    const tradingDaysRatio = tradingDaysPerWeek / 7
    const totalTradingDays = Math.round(totalCalendarDays * tradingDaysRatio)
    
    // For display purposes
    const tradingDaysPerYear = Math.round(365 * tradingDaysRatio)
    
    // The daily rate IS the rate if period is daily
    // Otherwise convert to per-trading-day rate
    let ratePerTradingDay: number
    if (returnPeriod === 'daily') {
      ratePerTradingDay = returnRate
    } else if (returnPeriod === 'weekly') {
      ratePerTradingDay = returnRate / tradingDaysPerWeek
    } else if (returnPeriod === 'monthly') {
      const tradingDaysPerMonth = Math.round(30 * tradingDaysRatio)
      ratePerTradingDay = returnRate / tradingDaysPerMonth
    } else {
      ratePerTradingDay = returnRate / tradingDaysPerYear
    }
    
    // Apply reinvest rate
    const effectiveRate = ratePerTradingDay * reinvestRate
    
    // Monthly contribution spread across trading days in month
    const tradingDaysPerMonth = Math.round(30 * tradingDaysRatio)
    const contributionPerTradingDay = tradingDaysPerMonth > 0 ? monthlyAdd / tradingDaysPerMonth : 0
    
    let balance = startCap
    const yearlyProgress: any[] = []
    let currentYear = 0
    let daysInCurrentYear = 0
    
    for (let day = 1; day <= totalTradingDays; day++) {
      // Apply daily compound return
      balance = balance * (1 + effectiveRate) + contributionPerTradingDay
      daysInCurrentYear++
      
      // Track yearly progress
      if (daysInCurrentYear >= tradingDaysPerYear || day === totalTradingDays) {
        currentYear++
        const totalMonths = currentYear * 12
        const contributed = startCap + (monthlyAdd * Math.min(totalMonths, yrs * 12 + mos))
        yearlyProgress.push({
          year: currentYear,
          value: balance,
          contributed,
          profit: balance - contributed
        })
        daysInCurrentYear = 0
      }
    }
    
    const totalMonths = yrs * 12 + mos
    const totalContributed = startCap + (monthlyAdd * totalMonths)
    const expectancy = (winRt * rr * riskPct) - ((1 - winRt) * riskPct)
    
    // Calculate effective annual return
    const effectiveAnnualReturn = totalTradingDays > 0 ? 
      (Math.pow(balance / (startCap + totalContributed - startCap), 365 / totalTradingDays) - 1) * 100 : 0
    
    setTradingResults({
      futureValue: balance,
      totalContributed,
      profit: balance - totalContributed,
      yearlyProgress,
      totalCalendarDays,
      totalTradingDays,
      tradingDaysPerYear,
      effectiveAnnualReturn,
      tradeStats: {
        expectedWinRate: winRt * 100,
        avgWin: rr * riskPct,
        avgLoss: riskPct,
        expectancy,
        tradesPerYear: 100
      }
    })
    setCalculatingTrading(false)
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
    } catch { setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]) }
    finally { setIsAskingCoach(false) }
  }

  const renderCalendarItem = (item: any, compact: boolean = false) => (
    <div key={item.id} style={{ fontSize: compact ? '11px' : '13px', padding: compact ? '4px 6px' : '8px 10px', marginBottom: '4px', background: item.isPaid ? (darkMode ? '#334155' : '#d1d5db') : item.type === 'goal' ? '#ede9fe' : item.type === 'debt' ? '#fee2e2' : item.type === 'income' ? '#d1fae5' : (item.sourceType === 'extraDebt' || item.sourceType === 'extraGoal') ? '#f3e8ff' : '#dbeafe', color: item.isPaid ? theme.textMuted : '#1e293b', borderRadius: '6px', opacity: item.isPaid ? 0.7 : 1, border: '1px solid rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: item.isPaid ? 'line-through' : 'none' }}>{item.name}</div>
        <div style={{ fontSize: compact ? '9px' : '11px', color: '#666' }}>${parseFloat(item.amount || '0').toFixed(0)}</div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); togglePaid(item.id, item.sourceType, item.sourceId, parseFloat(item.amount || '0'), item.targetDebtId, item.targetGoalId) }} style={{ padding: compact ? '4px 8px' : '6px 12px', background: item.isPaid ? '#6b7280' : (item.sourceType === 'extraDebt' || item.sourceType === 'extraGoal' || item.sourceType === 'goal') ? '#8b5cf6' : '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: compact ? '10px' : '12px', fontWeight: 700, flexShrink: 0 }}>{item.isPaid ? '✓' : 'PAY'}</button>
    </div>
  )


  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      {expandedDay && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setExpandedDay(null)}>
          <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>📅 {calendarMonth.toLocaleDateString('en-US', { month: 'long' })} {expandedDay.day}</h3>
              <button onClick={() => setExpandedDay(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.textMuted }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {expandedDay.items.length === 0 ? <div style={{ color: theme.textMuted, textAlign: 'center', padding: '20px' }}>No items scheduled</div> : expandedDay.items.map(item => renderCalendarItem(item, false))}
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
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>💵 Incoming</div><div style={{ color: theme.success, fontSize: '28px', fontWeight: 'bold' }}>${monthlyIncome.toFixed(2)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>💸 Outgoing</div><div style={{ color: theme.danger, fontSize: '28px', fontWeight: 'bold' }}>${totalOutgoing.toFixed(2)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>📈 Surplus</div><div style={{ color: monthlySurplus >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 'bold' }}>${monthlySurplus.toFixed(2)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>💳 Debt</div><div style={{ color: theme.danger, fontSize: '28px', fontWeight: 'bold' }}>${totalDebtBalance.toFixed(2)}</div></div>
              <div style={{ padding: '20px', background: 'linear-gradient(135deg, ' + theme.accent + ', ' + theme.purple + ')', borderRadius: '16px', color: 'white' }}><div style={{ fontSize: '13px', marginBottom: '8px', opacity: 0.9 }}>💎 Net Worth</div><div style={{ fontSize: '28px', fontWeight: 'bold' }}>${netWorth.toFixed(2)}</div></div>
            </div>

            {alerts.length > 0 && (
              <div style={{ ...cardStyle, border: '2px solid ' + theme.warning }}>
                <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>🔔 Alerts ({alerts.length})</h3>
                {alerts.slice(0, 5).map((alert, idx) => (
                  <div key={idx} style={{ padding: '12px 16px', marginBottom: '8px', background: alert.severity === 'danger' ? (darkMode ? '#3a1e1e' : '#fef2f2') : (darkMode ? '#3a2e1e' : '#fffbeb'), borderRadius: '10px', borderLeft: '4px solid ' + (alert.severity === 'danger' ? theme.danger : theme.warning), display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: theme.text }}>{alert.severity === 'danger' ? '🚨' : '⚠️'} {alert.message}</span>
                    <span style={{ color: alert.severity === 'danger' ? theme.danger : theme.warning, fontWeight: 600 }}>${alert.amount}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', color: theme.success, fontSize: '18px' }}>💰 Income Streams</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Name" value={newIncome.name} onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 80px' }} />
                  <input type="number" placeholder="$" value={newIncome.amount} onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })} style={{ ...inputStyle, width: '70px' }} />
                  <select value={newIncome.frequency} onChange={(e) => setNewIncome({ ...newIncome, frequency: e.target.value })} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                  <select value={newIncome.type} onChange={(e) => setNewIncome({ ...newIncome, type: e.target.value })} style={inputStyle}><option value="active">🏃 Active</option><option value="passive">🌴 Passive</option></select>
                  <input type="date" value={newIncome.startDate} onChange={(e) => setNewIncome({ ...newIncome, startDate: e.target.value })} style={inputStyle} />
                  <button onClick={addIncome} style={btnSuccess}>Add</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {incomeStreams.length === 0 ? <div style={{ color: theme.textMuted, textAlign: 'center', padding: '20px' }}>No income added</div> : incomeStreams.map(inc => (
                    <div key={inc.id} style={{ padding: '12px', background: inc.type === 'passive' ? (darkMode ? '#1e3a32' : '#f0fdf4') : (darkMode ? '#3a2e1e' : '#fffbeb'), borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><div style={{ color: theme.text, fontWeight: 600 }}>{inc.type === 'passive' ? '🌴' : '🏃'} {inc.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>${inc.amount}/{inc.frequency}</div></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: theme.success, fontWeight: 700 }}>${convertToMonthly(parseFloat(inc.amount || '0'), inc.frequency).toFixed(2)}/mo</span><button onClick={() => deleteIncome(inc.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕</button></div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', color: theme.danger, fontSize: '18px' }}>💸 Expenses & Bills</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Name" value={newExpense.name} onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 80px' }} />
                  <input type="number" placeholder="$" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} style={{ ...inputStyle, width: '70px' }} />
                  <select value={newExpense.frequency} onChange={(e) => setNewExpense({ ...newExpense, frequency: e.target.value })} style={inputStyle}><option value="once">One-time</option><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                  <input type="date" value={newExpense.dueDate} onChange={(e) => setNewExpense({ ...newExpense, dueDate: e.target.value })} style={inputStyle} />
                  <button onClick={addExpense} style={btnDanger}>Add</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {expenses.filter(e => !e.targetDebtId && !e.targetGoalId).length === 0 ? <div style={{ color: theme.textMuted, textAlign: 'center', padding: '20px' }}>No expenses added</div> : expenses.filter(e => !e.targetDebtId && !e.targetGoalId).map(exp => (
                    <div key={exp.id} style={{ padding: '12px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><div style={{ color: theme.text, fontWeight: 600 }}>{exp.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>${exp.amount}/{exp.frequency}</div></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: theme.danger, fontWeight: 700 }}>${convertToMonthly(parseFloat(exp.amount || '0'), exp.frequency).toFixed(2)}/mo</span><button onClick={() => deleteExpense(exp.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕</button></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={prevMonth} style={btnPrimary}>← Prev</button>
                <h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>📅 {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                <button onClick={nextMonth} style={btnPrimary}>Next →</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (<div key={day} style={{ textAlign: 'center', fontWeight: 600, color: theme.textMuted, padding: '10px', fontSize: '13px' }}>{day}</div>))}
                {Array.from({ length: getDaysInMonth().firstDay }).map((_, i) => (<div key={'empty-' + i} style={{ minHeight: '100px' }} />))}
                {Array.from({ length: getDaysInMonth().daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayItems = getCalendarItemsForDay(day)
                  const isToday = new Date().getDate() === day && new Date().getMonth() === calendarMonth.getMonth() && new Date().getFullYear() === calendarMonth.getFullYear()
                  return (
                    <div key={day} onClick={() => dayItems.length > 0 && setExpandedDay({ day, items: dayItems })} style={{ minHeight: '100px', padding: '6px', background: isToday ? (darkMode ? '#1e3a5f' : '#eff6ff') : (darkMode ? '#1e293b' : '#fafafa'), borderRadius: '8px', border: isToday ? '2px solid ' + theme.accent : '1px solid ' + theme.border, cursor: dayItems.length > 0 ? 'pointer' : 'default' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: isToday ? 700 : 600, color: isToday ? theme.accent : theme.text, fontSize: '14px' }}>{day}</span>
                        {dayItems.length > 0 && <span style={{ background: theme.success, color: 'white', fontSize: '9px', padding: '1px 4px', borderRadius: '4px' }}>{dayItems.filter(it => !it.isPaid).length}</span>}
                      </div>
                      {dayItems.slice(0, 2).map(item => renderCalendarItem(item, true))}
                      {dayItems.length > 2 && <div style={{ fontSize: '10px', color: theme.accent, textAlign: 'center', fontWeight: 600 }}>+{dayItems.length - 2} more</div>}
                    </div>
                  )
                })}
              </div>
            </div>

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
                    {debts.map(debt => {
                      const progress = debt.originalBalance ? ((parseFloat(debt.originalBalance || '0') - parseFloat(debt.balance || '0')) / parseFloat(debt.originalBalance || '1')) * 100 : 0
                      const payoffWithExtras = calculateSingleDebtPayoff(debt, true)
                      const payoffWithoutExtras = calculateSingleDebtPayoff(debt, false)
                      const debtExtras = expenses.filter(exp => exp.targetDebtId === debt.id)
                      const currentExtra = debtExtraPayment[debt.id] || { amount: '', frequency: 'monthly' }
                      
                      return (
                        <div key={debt.id} style={{ padding: '16px', background: darkMode ? '#334155' : '#fef2f2', borderRadius: '12px', border: '1px solid ' + theme.border }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div>
                              <div style={{ color: theme.text, fontWeight: 600, fontSize: '16px' }}>{debt.name}</div>
                              <div style={{ color: theme.textMuted, fontSize: '13px' }}>${parseFloat(debt.balance || '0').toFixed(2)} @ {debt.interestRate}%{debt.minPayment && ` • Min: $${debt.minPayment}/${debt.frequency}`}</div>
                            </div>
                            <button onClick={() => deleteDebt(debt.id)} style={{ ...btnDanger, padding: '6px 12px', fontSize: '12px' }}>Delete</button>
                          </div>
                          
                          <div style={{ width: '100%', height: '8px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                            <div style={{ width: Math.max(0, progress) + '%', height: '100%', background: 'linear-gradient(to right, ' + theme.success + ', #059669)' }} />
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: debtExtras.length > 0 ? '1fr 1fr' : '1fr', gap: '8px', marginBottom: '12px' }}>
                            <div style={{ padding: '10px', background: darkMode ? '#1e293b' : '#fff', borderRadius: '8px', fontSize: '12px' }}>
                              <div style={{ color: theme.textMuted, marginBottom: '4px' }}>Without extras:</div>
                              {payoffWithoutExtras.error ? <div style={{ color: theme.danger }}>⚠️ Payment too low</div> : <div style={{ color: theme.text }}><span style={{ fontWeight: 600 }}>{Math.floor(payoffWithoutExtras.monthsToPayoff / 12)}y {payoffWithoutExtras.monthsToPayoff % 12}m</span><span style={{ color: theme.danger, marginLeft: '8px' }}>${payoffWithoutExtras.totalInterestPaid.toFixed(0)} int</span></div>}
                            </div>
                            {debtExtras.length > 0 && (
                              <div style={{ padding: '10px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '8px', fontSize: '12px' }}>
                                <div style={{ color: theme.success, marginBottom: '4px' }}>With extras (+${payoffWithExtras.extraPayments?.toFixed(0)}/mo):</div>
                                {payoffWithExtras.error ? <div style={{ color: theme.warning }}>⚠️ Still not enough</div> : <div style={{ color: theme.text }}><span style={{ fontWeight: 600 }}>{Math.floor(payoffWithExtras.monthsToPayoff / 12)}y {payoffWithExtras.monthsToPayoff % 12}m</span><span style={{ color: theme.success, marginLeft: '8px' }}>${payoffWithExtras.totalInterestPaid.toFixed(0)} int</span></div>}
                            </div>
                            )}
                          </div>
                          
                          {debtExtras.length > 0 && (
                            <div style={{ marginBottom: '12px' }}>
                              <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px' }}>Extra payments:</div>
                              {debtExtras.map(exp => (
                                <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: theme.purple + '20', borderRadius: '4px', fontSize: '11px', marginBottom: '2px' }}>
                                  <span style={{ color: theme.purple }}>⚡ ${exp.amount}/{exp.frequency}</span>
                                  <button onClick={() => deleteExpense(exp.id)} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '10px' }}>✕</button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {showExtraInput === debt.id ? (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                              <input type="number" placeholder="Amount" value={currentExtra.amount} onChange={(e) => setDebtExtraPayment(prev => ({ ...prev, [debt.id]: { ...currentExtra, amount: e.target.value } }))} style={{ ...inputStyle, width: '70px', padding: '6px 10px', fontSize: '12px' }} />
                              <select value={currentExtra.frequency} onChange={(e) => setDebtExtraPayment(prev => ({ ...prev, [debt.id]: { ...currentExtra, frequency: e.target.value } }))} style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="once">One-time</option></select>
                              <button onClick={() => addExtraPaymentToDebt(debt.id)} style={{ ...btnPurple, padding: '6px 10px', fontSize: '11px' }}>Add</button>
                              <button onClick={() => setShowExtraInput(null)} style={{ ...btnDanger, padding: '6px 10px', fontSize: '11px' }}>✕</button>
                            </div>
                          ) : (
                            <button onClick={() => { setShowExtraInput(debt.id); setDebtExtraPayment(prev => ({ ...prev, [debt.id]: { amount: '', frequency: 'monthly' } })) }} style={{ ...btnPurple, padding: '6px 12px', fontSize: '11px', width: '100%' }}>+ Add Extra Payment</button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  <div style={{ padding: '20px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '16px' }}>📊 Total Debt Summary</h3>
                    {(() => {
                      const totals = calculateTotalDebtPayoff()
                      const totalBalance = debts.reduce((sum, d) => sum + parseFloat(d.balance || '0'), 0)
                      const totalExtras = expenses.filter(exp => exp.targetDebtId).reduce((sum, exp) => sum + convertToMonthly(parseFloat(exp.amount || '0'), exp.frequency), 0)
                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                          <div style={{ padding: '12px', background: darkMode ? '#334155' : '#fff', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Total Debt</div>
                            <div style={{ color: theme.danger, fontSize: '20px', fontWeight: 'bold' }}>${totalBalance.toFixed(0)}</div>
                          </div>
                          <div style={{ padding: '12px', background: darkMode ? '#334155' : '#fff', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Debt-Free In</div>
                            <div style={{ color: totals.hasError ? theme.warning : theme.success, fontSize: '20px', fontWeight: 'bold' }}>{totals.hasError ? '⚠️' : `${Math.floor(totals.maxMonths / 12)}y ${totals.maxMonths % 12}m`}</div>
                          </div>
                          <div style={{ padding: '12px', background: darkMode ? '#334155' : '#fff', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Total Interest</div>
                            <div style={{ color: theme.warning, fontSize: '20px', fontWeight: 'bold' }}>${totals.totalInterest.toFixed(0)}</div>
                          </div>
                          {totalExtras > 0 && <div style={{ gridColumn: '1 / -1', padding: '12px', background: theme.purple + '20', borderRadius: '8px', textAlign: 'center' }}><div style={{ color: theme.purple, fontSize: '14px', fontWeight: 600 }}>⚡ Total extra payments: ${totalExtras.toFixed(0)}/month</div></div>}
                        </div>
                      )
                    })()}
                  </div>
                </>
              )}
            </div>

            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>🎯 Savings Goals</h2>
              
              <div style={{ marginBottom: '30px', padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', border: '2px solid ' + theme.purple }}>
                <h3 style={{ margin: '0 0 16px 0', color: theme.purple, fontSize: '18px' }}>📊 Goal Calculator</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Target Amount ($)</label>
                    <input type="number" placeholder="5000" value={goalCalculator.targetAmount} onChange={(e) => setGoalCalculator({...goalCalculator, targetAmount: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Already Saved ($)</label>
                    <input type="number" placeholder="1000" value={goalCalculator.currentAmount} onChange={(e) => setGoalCalculator({...goalCalculator, currentAmount: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Monthly Contribution ($)</label>
                    <input type="number" placeholder="200" value={goalCalculator.monthlyContribution} onChange={(e) => setGoalCalculator({...goalCalculator, monthlyContribution: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Annual Interest Rate (%)</label>
                    <input type="number" placeholder="5" step="0.1" value={goalCalculator.interestRate} onChange={(e) => setGoalCalculator({...goalCalculator, interestRate: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Timeframe (Years, optional)</label>
                    <input type="number" placeholder="Leave blank to calculate months needed" value={goalCalculator.years} onChange={(e) => setGoalCalculator({...goalCalculator, years: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                </div>
                <button onClick={calculateGoal} disabled={calculating} style={{ ...btnPurple, padding: '12px 24px', fontSize: '14px', width: '100%' }}>{calculating ? 'Calculating...' : 'Calculate Goal'}</button>
                
                {calculatorResult && (
                  <div style={{ marginTop: '20px', padding: '16px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '10px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: theme.success, fontSize: '16px' }}>Calculation Results</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      <div>
                        <div style={{ color: theme.textMuted, fontSize: '11px' }}>Months to Goal</div>
                        <div style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold' }}>{calculatorResult.months} months</div>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '2px' }}>({Math.floor(calculatorResult.months / 12)} years {calculatorResult.months % 12} months)</div>
                      </div>
                      <div>
                        <div style={{ color: theme.textMuted, fontSize: '11px' }}>Future Value</div>
                        <div style={{ color: theme.success, fontSize: '18px', fontWeight: 'bold' }}>${calculatorResult.futureValue.toFixed(2)}</div>
                      </div>
                      <div>
                        <div style={{ color: theme.textMuted, fontSize: '11px' }}>Total Contributed</div>
                        <div style={{ color: theme.text, fontSize: '14px', fontWeight: 600 }}>${calculatorResult.totalContributed.toFixed(2)}</div>
                      </div>
                      <div>
                        <div style={{ color: theme.textMuted, fontSize: '11px' }}>Interest Earned</div>
                        <div style={{ color: theme.purple, fontSize: '14px', fontWeight: 600 }}>${calculatorResult.interestEarned.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
                <input type="text" placeholder="Goal name" value={newGoal.name} onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 100px' }} />
                <input type="number" placeholder="Target $" value={newGoal.target} onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })} style={{ ...inputStyle, width: '80px' }} />
                <input type="number" placeholder="Saved $" value={newGoal.saved} onChange={(e) => setNewGoal({ ...newGoal, saved: e.target.value })} style={{ ...inputStyle, width: '70px' }} />
                <input type="number" placeholder="Payment $" value={newGoal.paymentAmount} onChange={(e) => setNewGoal({ ...newGoal, paymentAmount: e.target.value })} style={{ ...inputStyle, width: '80px' }} />
                <input type="date" value={newGoal.startDate} onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })} style={inputStyle} />
                <select value={newGoal.savingsFrequency} onChange={(e) => setNewGoal({ ...newGoal, savingsFrequency: e.target.value })} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                <button onClick={addGoal} style={btnPurple}>Add</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {goals.length === 0 ? <div style={{ color: theme.textMuted, textAlign: 'center', padding: '20px' }}>No goals added</div> : goals.map(goal => {
                  const progress = (parseFloat(goal.saved || '0') / parseFloat(goal.target || '1')) * 100
                  const payment = goal.paymentAmount ? parseFloat(goal.paymentAmount) : calculateGoalPayment(goal)
                  const isComplete = progress >= 100
                  const monthsToGoal = calculateMonthsToGoal(goal)
                  
                  return (
                    <div key={goal.id} style={{ padding: '16px', background: isComplete ? (darkMode ? '#1e3a32' : '#f0fdf4') : (darkMode ? '#334155' : '#faf5ff'), borderRadius: '12px', border: isComplete ? '2px solid ' + theme.success : '1px solid ' + theme.border }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <div style={{ color: theme.text, fontWeight: 600, fontSize: '16px' }}>{isComplete ? '✅ ' : '🎯 '}{goal.name}</div>
                          <div style={{ color: theme.textMuted, fontSize: '13px' }}>${parseFloat(goal.saved || '0').toFixed(2)} / ${parseFloat(goal.target || '0').toFixed(2)}</div>
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
                      
                      <div style={{ width: '100%', height: '10px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '5px', overflow: 'hidden', marginBottom: '8px' }}>
                        <div style={{ width: Math.min(progress, 100) + '%', height: '100%', background: isComplete ? theme.success : 'linear-gradient(to right, ' + theme.purple + ', #7c3aed)' }} />
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: isComplete ? theme.success : theme.textMuted, fontSize: '12px', fontWeight: 600 }}>
                          {isComplete ? '🎉 Goal Complete!' : progress.toFixed(1) + '%'}
                        </span>
                        {!isComplete && payment > 0 && (
                          <span style={{ color: theme.purple, fontSize: '11px' }}>📅 ${payment.toFixed(2)}/{goal.savingsFrequency} • {monthsToGoal}mo to go</span>
                        )}
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
                  <select value={newAsset.type} onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })} style={inputStyle}><option value="savings">💰 Savings</option><option value="investment">📈 Investment</option><option value="property">🏠 Property</option></select>
                  <button onClick={addAsset} style={btnSuccess}>Add</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                  {assets.map(a => (<div key={a.id} style={{ padding: '12px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ color: theme.text, fontWeight: 600 }}>{a.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{a.type}</div></div><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: theme.success, fontWeight: 700 }}>${parseFloat(a.value || '0').toFixed(2)}</span><button onClick={() => deleteAsset(a.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕</button></div></div>))}
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
                  {debts.map(d => (<div key={'d-' + d.id} style={{ padding: '12px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ color: theme.text, fontWeight: 600 }}>💳 {d.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{d.interestRate}% APR</div></div><span style={{ color: theme.danger, fontWeight: 700 }}>${parseFloat(d.balance || '0').toFixed(2)}</span></div>))}
                  {liabilities.map(l => (<div key={l.id} style={{ padding: '12px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ color: theme.text, fontWeight: 600 }}>{l.name}</div><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: theme.danger, fontWeight: 700 }}>${parseFloat(l.value || '0').toFixed(2)}</span><button onClick={() => deleteLiability(l.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕</button></div></div>))}
                </div>
              </div>
            </div>
            <div style={{ padding: '32px', background: 'linear-gradient(135deg, ' + theme.accent + ', ' + theme.purple + ')', borderRadius: '16px', color: 'white', textAlign: 'center' }}><div style={{ fontSize: '16px', marginBottom: '8px', opacity: 0.9 }}>💎 Net Worth</div><div style={{ fontSize: '56px', fontWeight: 'bold' }}>${netWorth.toFixed(2)}</div></div>
            
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
                {[{ step: 1, title: 'Emergency Fund', desc: '3-6 months expenses', done: assets.filter(a => a.type === 'savings').reduce((s, a) => s + parseFloat(a.value || '0'), 0) >= monthlyExpenses * 3 }, { step: 2, title: 'High-Interest Debt', desc: '>7% APR', done: debts.filter(d => parseFloat(d.interestRate || '0') > 7).length === 0 }, { step: 3, title: 'Employer Match', desc: 'Free money', done: false }, { step: 4, title: 'All Debt', desc: 'Debt-free', done: totalDebtBalance === 0 }, { step: 5, title: 'Passive Income', desc: 'Replace active', done: passiveIncome >= totalOutgoing }, { step: 6, title: 'Freedom! 🎉', desc: 'Optional work', done: fiPath.passiveCoverage >= 100 }].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', background: item.done ? (darkMode ? '#1e3a32' : '#f0fdf4') : (darkMode ? '#334155' : '#f8fafc'), borderRadius: '12px', border: item.done ? '2px solid ' + theme.success : '1px solid ' + theme.border }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: item.done ? theme.success : theme.purple, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{item.done ? '✓' : item.step}</div>
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
            
            {/* Forex/CFD Prop Calculator */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.accent, fontSize: '22px' }}>💱 Forex/CFD Prop Firm Calculator</h2>
              <p style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '20px' }}>For FTMO, MyForexFunds, The5ers, and similar prop firms</p>
              
              {/* Phase Selection */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[
                  { id: 'phase1', label: '🎯 Phase 1', color: theme.warning },
                  { id: 'phase2', label: '✅ Phase 2', color: theme.purple },
                  { id: 'funded', label: '💰 Funded', color: theme.success }
                ].map(phase => (
                  <button key={phase.id} onClick={() => setForexProp({...forexProp, phase: phase.id})} style={{ flex: 1, padding: '12px 16px', background: forexProp.phase === phase.id ? phase.color : (darkMode ? '#334155' : '#f1f5f9'), color: forexProp.phase === phase.id ? 'white' : theme.text, border: '2px solid ' + (forexProp.phase === phase.id ? phase.color : theme.border), borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>{phase.label}</button>
                ))}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
                {/* Rules */}
                <div>
                  <h3 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>📋 {forexProp.phase === 'phase1' ? 'Phase 1' : forexProp.phase === 'phase2' ? 'Phase 2' : 'Funded'} Rules</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input type="number" placeholder="Account Size ($)" value={forexProp.accountSize} onChange={(e) => setForexProp({...forexProp, accountSize: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                    {forexProp.phase !== 'funded' && (
                      <input type="number" placeholder="Profit Target (%)" value={forexProp.phase === 'phase1' ? forexProp.phase1Target : forexProp.phase2Target} onChange={(e) => setForexProp({...forexProp, [forexProp.phase === 'phase1' ? 'phase1Target' : 'phase2Target']: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input type="number" placeholder="Daily DD %" value={forexProp.phase === 'phase1' ? forexProp.phase1DailyDD : forexProp.phase === 'phase2' ? forexProp.phase2DailyDD : forexProp.fundedDailyDD} onChange={(e) => setForexProp({...forexProp, [forexProp.phase === 'phase1' ? 'phase1DailyDD' : forexProp.phase === 'phase2' ? 'phase2DailyDD' : 'fundedDailyDD']: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                      <input type="number" placeholder="Max DD %" value={forexProp.phase === 'phase1' ? forexProp.phase1MaxDD : forexProp.phase === 'phase2' ? forexProp.phase2MaxDD : forexProp.fundedMaxDD} onChange={(e) => setForexProp({...forexProp, [forexProp.phase === 'phase1' ? 'phase1MaxDD' : forexProp.phase === 'phase2' ? 'phase2MaxDD' : 'fundedMaxDD']: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                    </div>
                    {forexProp.phase !== 'funded' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <input type="number" placeholder="Min Days" value={forexProp.phase === 'phase1' ? forexProp.phase1MinDays : forexProp.phase2MinDays} onChange={(e) => setForexProp({...forexProp, [forexProp.phase === 'phase1' ? 'phase1MinDays' : 'phase2MinDays']: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                        <input type="number" placeholder="Max Days" value={forexProp.phase === 'phase1' ? forexProp.phase1MaxDays : forexProp.phase2MaxDays} onChange={(e) => setForexProp({...forexProp, [forexProp.phase === 'phase1' ? 'phase1MaxDays' : 'phase2MaxDays']: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                      </div>
                    )}
                    <input type="number" placeholder="Profit Split %" value={forexProp.profitSplit} onChange={(e) => setForexProp({...forexProp, profitSplit: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                  </div>
                </div>
                
                {/* Progress */}
                <div>
                  <h3 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>📊 Current Progress</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input type="number" placeholder="Current Balance ($)" value={forexProp.currentBalance} onChange={(e) => setForexProp({...forexProp, currentBalance: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                    <input type="number" placeholder="Trading Days Done" value={forexProp.tradingDays} onChange={(e) => setForexProp({...forexProp, tradingDays: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                  </div>
                </div>
                
                {/* Trading Plan */}
                <div>
                  <h3 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>🎯 Your Stats</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input type="number" placeholder="Risk Per Trade %" value={forexProp.riskPerTrade} onChange={(e) => setForexProp({...forexProp, riskPerTrade: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                    <input type="number" placeholder="Trades Per Day" value={forexProp.tradesPerDay} onChange={(e) => setForexProp({...forexProp, tradesPerDay: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input type="number" placeholder="Win Rate %" value={forexProp.winRate} onChange={(e) => setForexProp({...forexProp, winRate: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                      <input type="number" placeholder="Avg R:R" value={forexProp.avgRR} onChange={(e) => setForexProp({...forexProp, avgRR: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                    </div>
                  </div>
                </div>
              </div>
              
              <button onClick={calculateForexProp} style={{ ...btnPrimary, padding: '12px 24px', fontSize: '14px', width: '100%', marginBottom: '20px' }}>Calculate Plan</button>
              
              {forexPropResults && (
                <div>
                  {/* Status Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ padding: '16px', background: forexPropResults.profitProgress >= 100 ? theme.success + '20' : (darkMode ? '#1e293b' : '#f8fafc'), borderRadius: '10px', textAlign: 'center', border: forexPropResults.profitProgress >= 100 ? '2px solid ' + theme.success : '1px solid ' + theme.border }}>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Profit Progress</div>
                      <div style={{ color: forexPropResults.currentProfit >= 0 ? theme.success : theme.danger, fontSize: '20px', fontWeight: 'bold' }}>{forexPropResults.phase === 'funded' ? '$' + forexPropResults.currentProfit.toFixed(0) : forexPropResults.profitProgress.toFixed(1) + '%'}</div>
                    </div>
                    <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>DD Remaining</div>
                      <div style={{ color: forexPropResults.drawdownRemaining > forexPropResults.maxDrawdownAmount * 0.5 ? theme.success : theme.danger, fontSize: '20px', fontWeight: 'bold' }}>${forexPropResults.drawdownRemaining.toFixed(0)}</div>
                    </div>
                    <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Days Left</div>
                      <div style={{ color: forexPropResults.daysRemaining > 10 ? theme.text : theme.warning, fontSize: '20px', fontWeight: 'bold' }}>{forexPropResults.phase === 'funded' ? '∞' : forexPropResults.daysRemaining}</div>
                    </div>
                    <div style={{ padding: '16px', background: darkMode ? '#2d1e3a' : '#faf5ff', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Payout</div>
                      <div style={{ color: theme.purple, fontSize: '20px', fontWeight: 'bold' }}>${forexPropResults.potentialPayout.toFixed(0)}</div>
                    </div>
                  </div>
                  
                  {/* Challenge Calendar */}
                  <div style={{ marginTop: '20px', padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <button onClick={() => setForexPropCalendarMonth(new Date(forexPropCalendarMonth.getFullYear(), forexPropCalendarMonth.getMonth() - 1, 1))} style={{ ...btnPrimary, padding: '6px 12px', fontSize: '12px' }}>←</button>
                      <h3 style={{ margin: 0, color: theme.text, fontSize: '16px' }}>📅 Challenge Plan - {forexPropCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                      <button onClick={() => setForexPropCalendarMonth(new Date(forexPropCalendarMonth.getFullYear(), forexPropCalendarMonth.getMonth() + 1, 1))} style={{ ...btnPrimary, padding: '6px 12px', fontSize: '12px' }}>→</button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '12px' }}>
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} style={{ textAlign: 'center', fontWeight: 600, color: theme.textMuted, padding: '8px', fontSize: '11px' }}>{d}</div>
                      ))}
                      
                      {Array.from({ length: new Date(forexPropCalendarMonth.getFullYear(), forexPropCalendarMonth.getMonth(), 1).getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} style={{ minHeight: '60px' }} />
                      ))}
                      
                      {Array.from({ length: new Date(forexPropCalendarMonth.getFullYear(), forexPropCalendarMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                        const day = i + 1
                        const date = new Date(forexPropCalendarMonth.getFullYear(), forexPropCalendarMonth.getMonth(), day)
                        const dayOfWeek = date.getDay()
                        const isWeekday = dayOfWeek !== 0 && dayOfWeek !== 6
                        const isToday = date.toDateString() === new Date().toDateString()
                        const dailyTarget = forexPropResults.dailyProfitNeeded
                        const isPast = date < new Date(new Date().setHours(0,0,0,0))
                        
                        return (
                          <div key={day} style={{ 
                            minHeight: '60px', 
                            padding: '4px', 
                            background: isToday ? theme.accent + '30' : isPast ? (darkMode ? '#334155' : '#e2e8f0') : isWeekday ? (darkMode ? '#1e293b' : '#fff') : (darkMode ? '#0f172a' : '#f1f5f9'),
                            borderRadius: '6px', 
                            border: isToday ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
                            opacity: isWeekday ? 1 : 0.5
                          }}>
                            <div style={{ fontSize: '11px', fontWeight: isToday ? 700 : 500, color: isToday ? theme.accent : theme.text }}>{day}</div>
                            {isWeekday && forexPropResults.phase !== 'funded' && (
                              <div style={{ fontSize: '9px', color: theme.success, marginTop: '2px' }}>+${dailyTarget.toFixed(0)}</div>
                            )}
                            {isWeekday && (
                              <div style={{ fontSize: '8px', color: theme.textMuted, marginTop: '1px' }}>Trade</div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '12px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '8px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '10px' }}>Daily Target</div>
                        <div style={{ color: theme.success, fontSize: '14px', fontWeight: 600 }}>${forexPropResults.dailyProfitNeeded.toFixed(2)}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '10px' }}>Est. Days to Pass</div>
                        <div style={{ color: theme.text, fontSize: '14px', fontWeight: 600 }}>{forexPropResults.daysToTarget > 500 ? '∞' : forexPropResults.daysToTarget}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '10px' }}>Max Losses/Day</div>
                        <div style={{ color: theme.danger, fontSize: '14px', fontWeight: 600 }}>{Math.floor(forexPropResults.maxLossesToday)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Futures Prop Calculator */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.success, fontSize: '22px' }}>📊 Futures Prop Firm Calculator</h2>
              <p style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '20px' }}>For Apex, Topstep, Earn2Trade, and similar futures prop firms</p>
              
              {/* Phase Selection */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[
                  { id: 'evaluation', label: '🎯 Evaluation', color: theme.warning },
                  { id: 'pa', label: '✅ PA Account', color: theme.purple },
                  { id: 'funded', label: '💰 Funded', color: theme.success }
                ].map(phase => (
                  <button key={phase.id} onClick={() => setFuturesProp({...futuresProp, phase: phase.id})} style={{ flex: 1, padding: '12px 16px', background: futuresProp.phase === phase.id ? phase.color : (darkMode ? '#334155' : '#f1f5f9'), color: futuresProp.phase === phase.id ? 'white' : theme.text, border: '2px solid ' + (futuresProp.phase === phase.id ? phase.color : theme.border), borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>{phase.label}</button>
                ))}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
                {/* Rules */}
                <div>
                  <h3 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>📋 {futuresProp.phase === 'evaluation' ? 'Evaluation' : futuresProp.phase === 'pa' ? 'PA' : 'Funded'} Rules</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input type="number" placeholder="Account Size ($)" value={futuresProp.accountSize} onChange={(e) => setFuturesProp({...futuresProp, accountSize: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                    <input type="number" placeholder="Trailing Drawdown ($)" value={futuresProp.phase === 'evaluation' ? futuresProp.evalTrailingDD : futuresProp.phase === 'pa' ? futuresProp.paTrailingDD : futuresProp.fundedTrailingDD} onChange={(e) => setFuturesProp({...futuresProp, [futuresProp.phase === 'evaluation' ? 'evalTrailingDD' : futuresProp.phase === 'pa' ? 'paTrailingDD' : 'fundedTrailingDD']: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                    <select value={futuresProp.phase === 'evaluation' ? futuresProp.evalDrawdownType : futuresProp.phase === 'pa' ? futuresProp.paDrawdownType : futuresProp.fundedDrawdownType} onChange={(e) => setFuturesProp({...futuresProp, [futuresProp.phase === 'evaluation' ? 'evalDrawdownType' : futuresProp.phase === 'pa' ? 'paDrawdownType' : 'fundedDrawdownType']: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }}>
                      <option value="trailing">Trailing (Real-time)</option>
                      <option value="eod">End of Day (EOD)</option>
                    </select>
                    {futuresProp.phase !== 'funded' && (
                      <>
                        <input type="number" placeholder="Profit Target ($)" value={futuresProp.phase === 'evaluation' ? futuresProp.evalProfitTarget : futuresProp.paProfitTarget} onChange={(e) => setFuturesProp({...futuresProp, [futuresProp.phase === 'evaluation' ? 'evalProfitTarget' : 'paProfitTarget']: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                        <input type="number" placeholder="Min Trading Days" value={futuresProp.phase === 'evaluation' ? futuresProp.evalMinDays : futuresProp.paMinDays} onChange={(e) => setFuturesProp({...futuresProp, [futuresProp.phase === 'evaluation' ? 'evalMinDays' : 'paMinDays']: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                      </>
                    )}
                    <input type="number" placeholder="Profit Split %" value={futuresProp.profitSplit} onChange={(e) => setFuturesProp({...futuresProp, profitSplit: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                  </div>
                </div>
                
                {/* Progress */}
                <div>
                  <h3 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>📊 Current Progress</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input type="number" placeholder="Current Balance ($)" value={futuresProp.currentBalance} onChange={(e) => setFuturesProp({...futuresProp, currentBalance: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                    <input type="number" placeholder="High Water Mark ($)" value={futuresProp.highWaterMark} onChange={(e) => setFuturesProp({...futuresProp, highWaterMark: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                    <input type="number" placeholder="Trading Days Done" value={futuresProp.tradingDays} onChange={(e) => setFuturesProp({...futuresProp, tradingDays: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                  </div>
                </div>
                
                {/* Trading Plan */}
                <div>
                  <h3 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>🎯 Your Stats</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input type="number" placeholder="Risk Per Trade ($)" value={futuresProp.riskPerTrade} onChange={(e) => setFuturesProp({...futuresProp, riskPerTrade: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                    <input type="number" placeholder="Trades Per Day" value={futuresProp.tradesPerDay} onChange={(e) => setFuturesProp({...futuresProp, tradesPerDay: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input type="number" placeholder="Win %" value={futuresProp.winRate} onChange={(e) => setFuturesProp({...futuresProp, winRate: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                      <input type="number" placeholder="Avg Win $" value={futuresProp.avgWin} onChange={(e) => setFuturesProp({...futuresProp, avgWin: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                    </div>
                    <input type="number" placeholder="Avg Loss ($)" value={futuresProp.avgLoss} onChange={(e) => setFuturesProp({...futuresProp, avgLoss: e.target.value})} style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                  </div>
                </div>
              </div>
              
              <button onClick={calculateFuturesProp} style={{ ...btnSuccess, padding: '12px 24px', fontSize: '14px', width: '100%', marginBottom: '20px' }}>Calculate Plan</button>
              
              {futuresPropResults && (
                <div>
                  {/* Status Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ padding: '16px', background: futuresPropResults.profitProgress >= 100 ? theme.success + '20' : (darkMode ? '#1e293b' : '#f8fafc'), borderRadius: '10px', textAlign: 'center', border: futuresPropResults.profitProgress >= 100 ? '2px solid ' + theme.success : '1px solid ' + theme.border }}>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Profit Progress</div>
                      <div style={{ color: futuresPropResults.currentProfit >= 0 ? theme.success : theme.danger, fontSize: '20px', fontWeight: 'bold' }}>{futuresPropResults.phase === 'funded' ? '$' + futuresPropResults.currentProfit.toFixed(0) : futuresPropResults.profitProgress.toFixed(1) + '%'}</div>
                    </div>
                    <div style={{ padding: '16px', background: futuresPropResults.lockedAtBreakeven ? theme.success + '20' : (darkMode ? '#1e293b' : '#f8fafc'), borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>DD Buffer</div>
                      <div style={{ color: futuresPropResults.drawdownRemaining > futuresPropResults.trailingDD * 0.5 ? theme.success : theme.danger, fontSize: '20px', fontWeight: 'bold' }}>${futuresPropResults.drawdownRemaining.toFixed(0)}</div>
                      {futuresPropResults.lockedAtBreakeven && <div style={{ fontSize: '9px', color: theme.success }}>🔒 Locked!</div>}
                    </div>
                    <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Trading Days</div>
                      <div style={{ color: theme.text, fontSize: '20px', fontWeight: 'bold' }}>{futuresProp.tradingDays}</div>
                      <div style={{ fontSize: '9px', color: futuresPropResults.minDaysComplete ? theme.success : theme.warning }}>{futuresPropResults.minDaysComplete ? '✓ Min met' : `Need ${futuresPropResults.minDays - parseInt(futuresProp.tradingDays)}`}</div>
                    </div>
                    <div style={{ padding: '16px', background: darkMode ? '#2d1e3a' : '#faf5ff', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Payout</div>
                      <div style={{ color: theme.purple, fontSize: '20px', fontWeight: 'bold' }}>${futuresPropResults.potentialPayout.toFixed(0)}</div>
                    </div>
                  </div>
                  
                  {/* Trailing DD Visual */}
                  <div style={{ marginBottom: '20px', padding: '12px', background: darkMode ? '#3a2e1e' : '#fffbeb', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px' }}>
                      <span style={{ color: theme.danger }}>Threshold: ${futuresPropResults.drawdownThreshold.toFixed(0)}</span>
                      <span style={{ color: theme.text }}>Balance: ${futuresPropResults.currentBalance.toFixed(0)}</span>
                      <span style={{ color: theme.success }}>Target: ${(futuresPropResults.accountSize + futuresPropResults.profitTarget).toFixed(0)}</span>
                    </div>
                    <div style={{ width: '100%', height: '12px', background: theme.danger + '30', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ width: Math.max(0, Math.min(100, ((futuresPropResults.currentBalance - futuresPropResults.drawdownThreshold) / (futuresPropResults.accountSize + futuresPropResults.profitTarget - futuresPropResults.drawdownThreshold)) * 100)) + '%', height: '100%', background: `linear-gradient(to right, ${theme.warning}, ${theme.success})`, borderRadius: '6px' }} />
                    </div>
                  </div>
                  
                  {/* Challenge Calendar */}
                  <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <button onClick={() => setFuturesPropCalendarMonth(new Date(futuresPropCalendarMonth.getFullYear(), futuresPropCalendarMonth.getMonth() - 1, 1))} style={{ ...btnSuccess, padding: '6px 12px', fontSize: '12px' }}>←</button>
                      <h3 style={{ margin: 0, color: theme.text, fontSize: '16px' }}>📅 Evaluation Plan - {futuresPropCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                      <button onClick={() => setFuturesPropCalendarMonth(new Date(futuresPropCalendarMonth.getFullYear(), futuresPropCalendarMonth.getMonth() + 1, 1))} style={{ ...btnSuccess, padding: '6px 12px', fontSize: '12px' }}>→</button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '12px' }}>
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} style={{ textAlign: 'center', fontWeight: 600, color: theme.textMuted, padding: '8px', fontSize: '11px' }}>{d}</div>
                      ))}
                      
                      {Array.from({ length: new Date(futuresPropCalendarMonth.getFullYear(), futuresPropCalendarMonth.getMonth(), 1).getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} style={{ minHeight: '60px' }} />
                      ))}
                      
                      {Array.from({ length: new Date(futuresPropCalendarMonth.getFullYear(), futuresPropCalendarMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                        const day = i + 1
                        const date = new Date(futuresPropCalendarMonth.getFullYear(), futuresPropCalendarMonth.getMonth(), day)
                        const dayOfWeek = date.getDay()
                        const isWeekday = dayOfWeek !== 0 && dayOfWeek !== 6
                        const isToday = date.toDateString() === new Date().toDateString()
                        const dailyTarget = futuresPropResults.profitRemaining / Math.max(1, 20 - parseInt(futuresProp.tradingDays || '0'))
                        const isPast = date < new Date(new Date().setHours(0,0,0,0))
                        
                        return (
                          <div key={day} style={{ 
                            minHeight: '60px', 
                            padding: '4px', 
                            background: isToday ? theme.success + '30' : isPast ? (darkMode ? '#334155' : '#e2e8f0') : isWeekday ? (darkMode ? '#1e293b' : '#fff') : (darkMode ? '#0f172a' : '#f1f5f9'),
                            borderRadius: '6px', 
                            border: isToday ? `2px solid ${theme.success}` : `1px solid ${theme.border}`,
                            opacity: isWeekday ? 1 : 0.5
                          }}>
                            <div style={{ fontSize: '11px', fontWeight: isToday ? 700 : 500, color: isToday ? theme.success : theme.text }}>{day}</div>
                            {isWeekday && futuresPropResults.phase !== 'funded' && dailyTarget > 0 && (
                              <div style={{ fontSize: '9px', color: theme.success, marginTop: '2px' }}>+${dailyTarget.toFixed(0)}</div>
                            )}
                            {isWeekday && (
                              <div style={{ fontSize: '8px', color: theme.textMuted, marginTop: '1px' }}>Trade</div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '12px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '8px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '10px' }}>Daily Target</div>
                        <div style={{ color: theme.success, fontSize: '14px', fontWeight: 600 }}>${futuresPropResults.dailyExpectedPL > 0 ? futuresPropResults.dailyExpectedPL.toFixed(0) : '0'}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '10px' }}>Est. Days to Pass</div>
                        <div style={{ color: theme.text, fontSize: '14px', fontWeight: 600 }}>{futuresPropResults.daysToTarget > 500 ? '∞' : futuresPropResults.daysToTarget}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '10px' }}>Max Losses</div>
                        <div style={{ color: theme.danger, fontSize: '14px', fontWeight: 600 }}>{futuresPropResults.maxLossesBeforeBlow}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Trading Compounding Calculator */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.warning, fontSize: '22px' }}>📈 Trading Compounding Calculator</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>💰 Capital & Returns</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Starting Capital ($)</label>
                      <input type="number" value={tradingCalculator.startingCapital} onChange={(e) => setTradingCalculator({...tradingCalculator, startingCapital: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Interest/Return Rate</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="number" step="0.1" placeholder="%" value={tradingCalculator.returnRate} onChange={(e) => setTradingCalculator({...tradingCalculator, returnRate: e.target.value})} style={{ ...inputStyle, width: '80px' }} />
                        <select value={tradingCalculator.returnPeriod} onChange={(e) => setTradingCalculator({...tradingCalculator, returnPeriod: e.target.value})} style={{ ...inputStyle, flex: 1 }}>
                          <option value="daily">% Daily</option>
                          <option value="weekly">% Weekly</option>
                          <option value="monthly">% Monthly</option>
                          <option value="yearly">% Yearly</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Time Period</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <input type="number" placeholder="Years" value={tradingCalculator.years} onChange={(e) => setTradingCalculator({...tradingCalculator, years: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                          <div style={{ fontSize: '10px', color: theme.textMuted, textAlign: 'center' }}>Years</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <input type="number" placeholder="Months" value={tradingCalculator.months} onChange={(e) => setTradingCalculator({...tradingCalculator, months: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                          <div style={{ fontSize: '10px', color: theme.textMuted, textAlign: 'center' }}>Months</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <input type="number" placeholder="Days" value={tradingCalculator.days} onChange={(e) => setTradingCalculator({...tradingCalculator, days: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                          <div style={{ fontSize: '10px', color: theme.textMuted, textAlign: 'center' }}>Days</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Reinvest Rate (%)</label>
                      <input type="number" step="1" value={tradingCalculator.reinvestRate} onChange={(e) => setTradingCalculator({...tradingCalculator, reinvestRate: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                      <div style={{ fontSize: '10px', color: theme.textMuted, marginTop: '4px' }}>100% = reinvest all profits, 50% = reinvest half</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>📅 Trading Schedule</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Days to Include</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[{key: 'M', label: 'M'}, {key: 'T', label: 'T'}, {key: 'W', label: 'W'}, {key: 'T2', label: 'T'}, {key: 'F', label: 'F'}, {key: 'S', label: 'S'}, {key: 'S2', label: 'S'}].map(day => (
                          <button key={day.key} onClick={() => {
                            const newDays = tradingCalculator.includeDays.includes(day.key) 
                              ? tradingCalculator.includeDays.filter(d => d !== day.key)
                              : [...tradingCalculator.includeDays, day.key]
                            setTradingCalculator({...tradingCalculator, includeDays: newDays})
                          }} style={{ 
                            padding: '8px 12px', 
                            background: tradingCalculator.includeDays.includes(day.key) ? theme.warning : (darkMode ? '#334155' : '#e2e8f0'),
                            color: tradingCalculator.includeDays.includes(day.key) ? 'white' : theme.text,
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '13px'
                          }}>{day.label}</button>
                        ))}
                      </div>
                      <div style={{ fontSize: '10px', color: theme.textMuted, marginTop: '4px' }}>{tradingCalculator.includeDays.length} trading days/week ({tradingCalculator.includeDays.length * 52}/year)</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Monthly Contribution ($)</label>
                      <input type="number" value={tradingCalculator.monthlyContribution} onChange={(e) => setTradingCalculator({...tradingCalculator, monthlyContribution: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                    <div style={{ padding: '12px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '8px', marginTop: '8px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '8px', fontWeight: 600 }}>⚡ Quick Stats (for reference)</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                        <div>
                          <label style={{ color: theme.textMuted }}>Risk/Trade (%)</label>
                          <input type="number" step="0.1" value={tradingCalculator.riskPerTrade} onChange={(e) => setTradingCalculator({...tradingCalculator, riskPerTrade: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted }}>Win Rate (%)</label>
                          <input type="number" step="0.1" value={tradingCalculator.winRate} onChange={(e) => setTradingCalculator({...tradingCalculator, winRate: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted }}>Risk:Reward</label>
                          <input type="number" step="0.1" value={tradingCalculator.riskReward} onChange={(e) => setTradingCalculator({...tradingCalculator, riskReward: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted }}>Your Win Rate</label>
                          <div style={{ padding: '6px 10px', background: darkMode ? '#1e293b' : '#fff', borderRadius: '6px', fontWeight: 600, color: winRate >= 50 ? theme.success : theme.danger }}>{winRate.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button onClick={calculateTradingCompounding} disabled={calculatingTrading} style={{ ...btnWarning, padding: '12px 24px', fontSize: '16px', width: '100%', marginBottom: '20px' }}>{calculatingTrading ? 'Calculating...' : 'Calculate Compounding Growth'}</button>
              
              {tradingResults && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '20px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Investment Value</div>
                      <div style={{ color: theme.success, fontSize: '24px', fontWeight: 'bold' }}>${tradingResults.futureValue.toFixed(2)}</div>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>Total / Business: {tradingResults.totalCalendarDays} / {tradingResults.totalTradingDays}</div>
                    </div>
                    <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Total Contributed</div>
                      <div style={{ color: theme.text, fontSize: '20px', fontWeight: 'bold' }}>${tradingResults.totalContributed.toFixed(2)}</div>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>Capital + Contributions</div>
                    </div>
                    <div style={{ padding: '20px', background: darkMode ? '#3a2e1e' : '#fffbeb', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Total Profit</div>
                      <div style={{ color: theme.warning, fontSize: '24px', fontWeight: 'bold' }}>${tradingResults.profit.toFixed(2)}</div>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>{((tradingResults.profit / tradingResults.totalContributed) * 100).toFixed(1)}% ROI</div>
                    </div>
                    <div style={{ padding: '20px', background: darkMode ? '#2d1e3a' : '#faf5ff', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Trading Days/Year</div>
                      <div style={{ color: theme.purple, fontSize: '24px', fontWeight: 'bold' }}>{tradingResults.tradingDaysPerYear}</div>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>{tradingCalculator.includeDays.length} days/week</div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '16px' }}>📊 Yearly Progress</h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid ' + theme.border }}>
                            <th style={{ textAlign: 'left', padding: '8px', color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>Year</th>
                            <th style={{ textAlign: 'left', padding: '8px', color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>Portfolio Value</th>
                            <th style={{ textAlign: 'left', padding: '8px', color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>Total Contributed</th>
                            <th style={{ textAlign: 'left', padding: '8px', color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>Profit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tradingResults.yearlyProgress.map((yearData: any) => (
                            <tr key={yearData.year} style={{ borderBottom: '1px solid ' + theme.border }}>
                              <td style={{ padding: '8px', color: theme.text, fontSize: '12px', fontWeight: 600 }}>Year {yearData.year}</td>
                              <td style={{ padding: '8px', color: theme.success, fontSize: '12px', fontWeight: 600 }}>${yearData.value.toFixed(2)}</td>
                              <td style={{ padding: '8px', color: theme.text, fontSize: '12px' }}>${yearData.contributed.toFixed(2)}</td>
                              <td style={{ padding: '8px', color: theme.warning, fontSize: '12px', fontWeight: 600 }}>${yearData.profit.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '16px' }}>🎯 Trading Statistics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      <div>
                        <div style={{ color: theme.textMuted, fontSize: '11px' }}>Expected Win Rate</div>
                        <div style={{ color: tradingResults.tradeStats.expectedWinRate >= 50 ? theme.success : theme.danger, fontSize: '16px', fontWeight: 'bold' }}>{tradingResults.tradeStats.expectedWinRate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div style={{ color: theme.textMuted, fontSize: '11px' }}>Average Win</div>
                        <div style={{ color: theme.success, fontSize: '16px', fontWeight: 'bold' }}>{tradingResults.tradeStats.avgWin.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div style={{ color: theme.textMuted, fontSize: '11px' }}>Average Loss</div>
                        <div style={{ color: theme.danger, fontSize: '16px', fontWeight: 'bold' }}>{tradingResults.tradeStats.avgLoss.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div style={{ color: theme.textMuted, fontSize: '11px' }}>Trade Expectancy</div>
                        <div style={{ color: tradingResults.tradeStats.expectancy >= 0 ? theme.success : theme.danger, fontSize: '16px', fontWeight: 'bold' }}>{tradingResults.tradeStats.expectancy.toFixed(2)}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Trading Calendar */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={() => setTradingCalendarMonth(new Date(tradingCalendarMonth.getFullYear(), tradingCalendarMonth.getMonth() - 1, 1))} style={btnPrimary}>← Prev</button>
                <h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>
                  📅 Trading Calendar - {tradingCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={() => setTradingCalendarMonth(new Date(tradingCalendarMonth.getFullYear(), tradingCalendarMonth.getMonth() + 1, 1))} style={btnPrimary}>Next →</button>
              </div>
              
              {tradingResults && (
                <>
                  {/* Month Summary */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px', padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Projected Monthly Profit</div>
                      <div style={{ color: theme.warning, fontSize: '20px', fontWeight: 'bold' }}>${(tradingResults.profit / Math.max(1, parseInt(tradingCalculator.years || '0') * 12 + parseInt(tradingCalculator.months || '1'))).toFixed(2)}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Trading Days/Month</div>
                      <div style={{ color: theme.text, fontSize: '20px', fontWeight: 'bold' }}>{Math.round(tradingResults.tradingDaysPerYear / 12)}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Daily Target</div>
                      <div style={{ color: theme.success, fontSize: '20px', fontWeight: 'bold' }}>${tradingResults.totalTradingDays > 0 ? (tradingResults.profit / tradingResults.totalTradingDays).toFixed(2) : '0.00'}</div>
                    </div>
                  </div>
                  
                  {/* Calendar Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} style={{ textAlign: 'center', fontWeight: 600, color: theme.textMuted, padding: '10px', fontSize: '13px' }}>{day}</div>
                    ))}
                    
                    {Array.from({ length: new Date(tradingCalendarMonth.getFullYear(), tradingCalendarMonth.getMonth(), 1).getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} style={{ minHeight: '80px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '8px' }} />
                    ))}
                    
                    {Array.from({ length: new Date(tradingCalendarMonth.getFullYear(), tradingCalendarMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                      const day = i + 1
                      const date = new Date(tradingCalendarMonth.getFullYear(), tradingCalendarMonth.getMonth(), day)
                      const dayOfWeek = date.getDay()
                      const isTradingDay = (
                        (dayOfWeek === 1 && tradingCalculator.includeDays.includes('M')) ||
                        (dayOfWeek === 2 && tradingCalculator.includeDays.includes('T')) ||
                        (dayOfWeek === 3 && tradingCalculator.includeDays.includes('W')) ||
                        (dayOfWeek === 4 && tradingCalculator.includeDays.includes('T2')) ||
                        (dayOfWeek === 5 && tradingCalculator.includeDays.includes('F')) ||
                        (dayOfWeek === 6 && tradingCalculator.includeDays.includes('S')) ||
                        (dayOfWeek === 0 && tradingCalculator.includeDays.includes('S2'))
                      )
                      const isToday = date.toDateString() === new Date().toDateString()
                      const dailyProfit = tradingResults.totalTradingDays > 0 ? tradingResults.profit / tradingResults.totalTradingDays : 0
                      
                      return (
                        <div key={day} style={{ 
                          minHeight: '80px', 
                          padding: '8px', 
                          background: isToday ? (darkMode ? '#1e3a5f' : '#eff6ff') : 
                                   !isTradingDay ? (darkMode ? '#1e293b' : '#f8fafc') : 
                                   (darkMode ? '#1e293b' : '#ffffff'),
                          borderRadius: '8px', 
                          border: isToday ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
                          opacity: isTradingDay ? 1 : 0.6
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: isToday ? 700 : 600, color: isToday ? theme.accent : !isTradingDay ? theme.textMuted : theme.text, fontSize: '14px' }}>{day}</span>
                            {isTradingDay && <span style={{ fontSize: '10px', padding: '2px 4px', borderRadius: '4px', background: theme.warning, color: 'white' }}>Trade</span>}
                          </div>
                          {isTradingDay && (
                            <div style={{ fontSize: '11px', padding: '4px', background: darkMode ? '#3a2e1e' : '#fffbeb', borderRadius: '4px', color: theme.warning, textAlign: 'center' }}>
                              Target: <strong>${dailyProfit.toFixed(2)}</strong>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
              
              {!tradingResults && (
                <div style={{ textAlign: 'center', padding: '40px', color: theme.textMuted }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                  <div>Run the Compounding Calculator above to see your trading calendar projections</div>
                </div>
              )}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={cardStyle}>
                <h2 style={{ margin: '0 0 20px 0', color: theme.warning, fontSize: '20px' }}>📊 Trading Stats</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Total P&L</div>
                    <div style={{ color: totalPL >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 'bold' }}>${totalPL.toFixed(2)}</div>
                  </div>
                  <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Win Rate</div>
                    <div style={{ color: winRate >= 50 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 'bold' }}>{winRate.toFixed(1)}%</div>
                  </div>
                  <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Total Trades</div>
                    <div style={{ color: theme.text, fontSize: '24px', fontWeight: 'bold' }}>{trades.length}</div>
                  </div>
                  <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Avg Win</div>
                    <div style={{ color: theme.success, fontSize: '24px', fontWeight: 'bold' }}>${trades.filter(t => parseFloat(t.profitLoss || '0') > 0).length > 0 ? (trades.filter(t => parseFloat(t.profitLoss || '0') > 0).reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0) / trades.filter(t => parseFloat(t.profitLoss || '0') > 0).length).toFixed(2) : '0.00'}</div>
                  </div>
                </div>
              </div>
              
              <div style={cardStyle}>
                <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>📝 Add Trade</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input type="date" value={newTrade.date} onChange={(e) => setNewTrade({ ...newTrade, date: e.target.value })} style={inputStyle} />
                    <input type="text" placeholder="Instrument" value={newTrade.instrument} onChange={(e) => setNewTrade({ ...newTrade, instrument: e.target.value })} style={inputStyle} />
                    <select value={newTrade.direction} onChange={(e) => setNewTrade({ ...newTrade, direction: e.target.value })} style={inputStyle}><option value="long">Long</option><option value="short">Short</option></select>
                    <input type="number" placeholder="Entry Price" value={newTrade.entryPrice} onChange={(e) => setNewTrade({ ...newTrade, entryPrice: e.target.value })} style={inputStyle} />
                    <input type="number" placeholder="Exit Price" value={newTrade.exitPrice} onChange={(e) => setNewTrade({ ...newTrade, exitPrice: e.target.value })} style={inputStyle} />
                    <input type="number" placeholder="P&L" value={newTrade.profitLoss} onChange={(e) => setNewTrade({ ...newTrade, profitLoss: e.target.value })} style={inputStyle} />
                  </div>
                  <input type="text" placeholder="Notes" value={newTrade.notes} onChange={(e) => setNewTrade({ ...newTrade, notes: e.target.value })} style={inputStyle} />
                  <button onClick={addTrade} style={btnWarning}>Add Trade</button>
                </div>
              </div>
            </div>
            
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>📋 Trade History</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid ' + theme.border }}>
                      <th style={{ textAlign: 'left', padding: '12px', color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>Date</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>Instrument</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>Direction</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>Entry</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>Exit</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>P&L</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: theme.textMuted }}>No trades recorded yet</td></tr>
                    ) : (
                      trades.map(trade => (
                        <tr key={trade.id} style={{ borderBottom: '1px solid ' + theme.border }}>
                          <td style={{ padding: '12px', color: theme.text, fontSize: '13px' }}>{trade.date}</td>
                          <td style={{ padding: '12px', color: theme.text, fontSize: '13px', fontWeight: 600 }}>{trade.instrument}</td>
                          <td style={{ padding: '12px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: trade.direction === 'long' ? theme.success + '20' : theme.danger + '20', color: trade.direction === 'long' ? theme.success : theme.danger }}>{trade.direction === 'long' ? 'LONG' : 'SHORT'}</span></td>
                          <td style={{ padding: '12px', color: theme.text, fontSize: '13px' }}>${trade.entryPrice}</td>
                          <td style={{ padding: '12px', color: theme.text, fontSize: '13px' }}>${trade.exitPrice}</td>
                          <td style={{ padding: '12px', fontSize: '13px', fontWeight: 600, color: parseFloat(trade.profitLoss || '0') >= 0 ? theme.success : theme.danger }}>${parseFloat(trade.profitLoss || '0').toFixed(2)}</td>
                          <td style={{ padding: '12px', color: theme.textMuted, fontSize: '13px' }}>{trade.notes}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
