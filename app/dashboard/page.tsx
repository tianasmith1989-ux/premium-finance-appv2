'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect, useRef } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  // ==================== APP MODE & NAVIGATION ====================
  const [appMode, setAppMode] = useState<'budget' | 'trading' | null>(null)
  const [showModeSelector, setShowModeSelector] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'path' | 'trading'>('dashboard')
  const [darkMode, setDarkMode] = useState(true)
  
  // ==================== BUDGET STATE ====================
  const [incomeStreams, setIncomeStreams] = useState<any[]>([])
  const [newIncome, setNewIncome] = useState({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0] })
  
  const [expenses, setExpenses] = useState<any[]>([])
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', frequency: 'monthly', category: 'other', dueDate: new Date().toISOString().split('T')[0] })
  
  const [debts, setDebts] = useState<any[]>([])
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: new Date().toISOString().split('T')[0] })
  const [payoffMethod, setPayoffMethod] = useState<'snowball' | 'avalanche'>('avalanche')
  const [debtExtraPayment, setDebtExtraPayment] = useState<{[key: number]: {amount: string, frequency: string}}>({})
  const [showExtraInput, setShowExtraInput] = useState<number | null>(null)
  
  const [goals, setGoals] = useState<any[]>([])
  const [newGoal, setNewGoal] = useState({ name: '', target: '', saved: '0', deadline: '', savingsFrequency: 'monthly', startDate: new Date().toISOString().split('T')[0], paymentAmount: '' })
  
  const [assets, setAssets] = useState<any[]>([])
  const [newAsset, setNewAsset] = useState({ name: '', value: '', type: 'savings' })
  
  const [liabilities, setLiabilities] = useState<any[]>([])
  const [newLiability, setNewLiability] = useState({ name: '', value: '', type: 'loan' })
  
  // Calendar State
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [paidOccurrences, setPaidOccurrences] = useState<Set<string>>(new Set())
  const [expandedDay, setExpandedDay] = useState<{day: number, items: any[]} | null>(null)
  
  // Edit State - for inline editing
  const [editingItem, setEditingItem] = useState<{type: string, id: number, data: any} | null>(null)
  
  // Presets & CSV
  const [showPresets, setShowPresets] = useState(false)
  const [showCsvImport, setShowCsvImport] = useState(false)
  const [csvTransactions, setCsvTransactions] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // ==================== TRADING STATE ====================
  const [trades, setTrades] = useState<any[]>([])
  const [newTrade, setNewTrade] = useState({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' })
  const [tradingCalendarMonth, setTradingCalendarMonth] = useState(new Date())
  
  // Forex Prop Calculator
  const [forexPropPhase, setForexPropPhase] = useState<'phase1' | 'phase2' | 'funded'>('phase1')
  const [forexProp, setForexProp] = useState({
    accountSize: '100000',
    profitTarget: '10',
    maxDrawdown: '10',
    dailyDrawdown: '5',
    currentBalance: '100000',
    daysInChallenge: '30',
    minTradingDays: '4',
    profitSplit: '80'
  })
  
  // Futures Prop Calculator
  const [futuresPropPhase, setFuturesPropPhase] = useState<'evaluation' | 'funded'>('evaluation')
  const [futuresProp, setFuturesProp] = useState({
    accountSize: '50000',
    profitTarget: '3000',
    maxDrawdown: '2500',
    dailyLossLimit: '1000',
    currentBalance: '50000',
    contractSize: '1',
    tickValue: '12.50',
    riskPerTrade: '200',
    tradesPerDay: '3',
    winRate: '50',
    avgWin: '300',
    avgLoss: '200',
    profitSplit: '90'
  })
  
  // Trading Calculator
  const [tradingCalculator, setTradingCalculator] = useState({
    startingCapital: '10000',
    monthlyContribution: '500',
    returnRate: '1',
    returnPeriod: 'daily',
    years: '0',
    months: '3',
    days: '0',
    includeDays: ['M', 'T', 'W', 'T2', 'F'],
    reinvestRate: '100'
  })
  
  // ==================== AI AGENT STATE ====================
  const [budgetMemory, setBudgetMemory] = useState<any>({
    name: '',
    onboardingComplete: false,
    lifeEvents: [],
    patterns: [],
    preferences: { communicationStyle: 'direct', checkInFrequency: 'when-needed', motivators: [] },
    currentStep: 'Baby Step 1',
    notes: []
  })
  
  const [tradingMemory, setTradingMemory] = useState<any>({
    name: '',
    onboardingComplete: false,
    tradingRules: [],
    patterns: [],
    psychology: { strengths: [], weaknesses: [], triggers: [] },
    preferences: { tradingStyle: '', favoriteInstruments: [], riskPerTrade: 1 },
    propFirmGoals: { targetFirm: '', accountSizeGoal: 0 }
  })
  
  const [budgetOnboarding, setBudgetOnboarding] = useState({ isActive: false, step: 'greeting' })
  const [tradingOnboarding, setTradingOnboarding] = useState({ isActive: false, step: 'greeting' })
  
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [proactiveInsight, setProactiveInsight] = useState<any>(null)
  
  const chatEndRef = useRef<HTMLDivElement>(null)

  // ==================== THEME ====================
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

  // ==================== STYLES ====================
  const inputStyle: React.CSSProperties = { padding: '10px 14px', border: '2px solid ' + theme.inputBorder, borderRadius: '8px', fontSize: '14px', background: theme.input, color: theme.text }
  const btnPrimary: React.CSSProperties = { padding: '10px 20px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }
  const btnSuccess: React.CSSProperties = { ...btnPrimary, background: theme.success }
  const btnDanger: React.CSSProperties = { ...btnPrimary, background: theme.danger }
  const btnWarning: React.CSSProperties = { ...btnPrimary, background: theme.warning }
  const btnPurple: React.CSSProperties = { ...btnPrimary, background: theme.purple }
  const cardStyle: React.CSSProperties = { padding: '24px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }

  // ==================== PRESET BILLS ====================
  const presetBills = [
    { name: 'Rent/Mortgage', category: 'housing', frequency: 'monthly' },
    { name: 'Electricity', category: 'utilities', frequency: 'monthly' },
    { name: 'Gas', category: 'utilities', frequency: 'monthly' },
    { name: 'Water', category: 'utilities', frequency: 'quarterly' },
    { name: 'Internet', category: 'utilities', frequency: 'monthly' },
    { name: 'Phone', category: 'utilities', frequency: 'monthly' },
    { name: 'Car Insurance', category: 'transport', frequency: 'monthly' },
    { name: 'Health Insurance', category: 'health', frequency: 'monthly' },
    { name: 'Netflix', amount: '15.99', category: 'subscriptions', frequency: 'monthly' },
    { name: 'Spotify', amount: '11.99', category: 'subscriptions', frequency: 'monthly' },
    { name: 'Groceries', category: 'food', frequency: 'weekly' },
    { name: 'Petrol', category: 'transport', frequency: 'weekly' },
  ]

  // ==================== LOAD/SAVE FROM LOCALSTORAGE ====================
  useEffect(() => {
    const saved = localStorage.getItem('aureus_data')
    if (saved) {
      const data = JSON.parse(saved)
      if (data.incomeStreams) setIncomeStreams(data.incomeStreams)
      if (data.expenses) setExpenses(data.expenses)
      if (data.debts) setDebts(data.debts)
      if (data.goals) setGoals(data.goals)
      if (data.assets) setAssets(data.assets)
      if (data.liabilities) setLiabilities(data.liabilities)
      if (data.trades) setTrades(data.trades)
      if (data.budgetMemory) setBudgetMemory(data.budgetMemory)
      if (data.tradingMemory) setTradingMemory(data.tradingMemory)
      if (data.paidOccurrences) setPaidOccurrences(new Set(data.paidOccurrences))
    }
  }, [])

  useEffect(() => {
    const data = {
      incomeStreams, expenses, debts, goals, assets, liabilities, trades,
      budgetMemory, tradingMemory,
      paidOccurrences: Array.from(paidOccurrences)
    }
    localStorage.setItem('aureus_data', JSON.stringify(data))
  }, [incomeStreams, expenses, debts, goals, assets, liabilities, trades, budgetMemory, tradingMemory, paidOccurrences])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // ==================== CALCULATIONS ====================
  const convertToMonthly = (amount: number, frequency: string) => {
    if (frequency === 'weekly') return amount * 4.33
    if (frequency === 'fortnightly') return amount * 2.17
    if (frequency === 'quarterly') return amount / 3
    if (frequency === 'yearly') return amount / 12
    return amount
  }

  const getOccurrencesInMonth = (startDate: string, frequency: string, month: number, year: number): number => {
    if (!startDate) return frequency === 'monthly' ? 1 : 0
    const start = new Date(startDate)
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)
    if (start > monthEnd) return 0
    if (frequency === 'once') return start.getMonth() === month && start.getFullYear() === year ? 1 : 0
    if (frequency === 'monthly') return 1
    if (frequency === 'quarterly') return (month - start.getMonth() + 12) % 3 === 0 ? 1 : 0
    if (frequency === 'yearly') return start.getMonth() === month ? 1 : 0
    if (frequency === 'weekly' || frequency === 'fortnightly') {
      const interval = frequency === 'weekly' ? 7 : 14
      let count = 0
      const current = new Date(start)
      while (current < monthStart) current.setDate(current.getDate() + interval)
      while (current <= monthEnd) { count++; current.setDate(current.getDate() + interval) }
      return count
    }
    return 1
  }

  const monthlyIncome = incomeStreams.reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || '0'), inc.frequency), 0)
  const passiveIncome = incomeStreams.filter(i => i.type === 'passive').reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || '0'), inc.frequency), 0)
  const activeIncome = monthlyIncome - passiveIncome
  const monthlyExpenses = expenses.filter(e => !e.targetDebtId && !e.targetGoalId).reduce((sum, exp) => sum + convertToMonthly(parseFloat(exp.amount || '0'), exp.frequency), 0)
  const monthlyDebtPayments = debts.reduce((sum, debt) => sum + convertToMonthly(parseFloat(debt.minPayment || '0'), debt.frequency || 'monthly'), 0)
  const totalDebtBalance = debts.reduce((sum, d) => sum + parseFloat(d.balance || '0'), 0)
  const totalOutgoing = monthlyExpenses + monthlyDebtPayments
  const monthlySurplus = monthlyIncome - totalOutgoing
  const totalAssets = assets.reduce((sum, a) => sum + parseFloat(a.value || '0'), 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + parseFloat(l.value || '0'), 0)
  const netWorth = totalAssets - totalLiabilities - totalDebtBalance
  const savingsRate = monthlyIncome > 0 ? (monthlySurplus / monthlyIncome * 100) : 0
  const passiveCoverage = monthlyExpenses > 0 ? (passiveIncome / monthlyExpenses * 100) : 0

  // This month specific calculations
  const currentMonthTotals = (() => {
    const month = calendarMonth.getMonth()
    const year = calendarMonth.getFullYear()
    const incomeTotal = incomeStreams.reduce((sum, inc) => sum + parseFloat(inc.amount || '0') * getOccurrencesInMonth(inc.startDate, inc.frequency, month, year), 0)
    const expenseTotal = expenses.filter(e => !e.targetDebtId && !e.targetGoalId).reduce((sum, exp) => sum + parseFloat(exp.amount || '0') * getOccurrencesInMonth(exp.dueDate, exp.frequency, month, year), 0)
    const debtTotal = debts.reduce((sum, debt) => sum + parseFloat(debt.minPayment || '0') * getOccurrencesInMonth(debt.paymentDate, debt.frequency || 'monthly', month, year), 0)
    return { incomeTotal, expenseTotal, debtTotal, total: incomeTotal - expenseTotal - debtTotal }
  })()

  // Trading calculations
  const totalPL = trades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)
  const winningTrades = trades.filter(t => parseFloat(t.profitLoss || '0') > 0)
  const losingTrades = trades.filter(t => parseFloat(t.profitLoss || '0') < 0)
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length * 100) : 0
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0) / winningTrades.length : 0
  const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0) / losingTrades.length) : 0

  // FIRE calculations
  const fiPath = {
    monthlyNeed: totalOutgoing,
    passiveGap: totalOutgoing - passiveIncome,
    passiveCoverage: passiveCoverage,
    fireNumber: (totalOutgoing * 12) * 25,
    currentInvestments: assets.filter(a => a.type === 'investment').reduce((sum, a) => sum + parseFloat(a.value || '0'), 0),
    yearsToFI: monthlySurplus > 0 ? Math.ceil(((totalOutgoing * 12) * 25) / (monthlySurplus * 12)) : 999
  }

  // Baby Steps calculation
  const getBabyStep = () => {
    const emergencyFund = assets.filter(a => a.type === 'savings').reduce((s, a) => s + parseFloat(a.value || '0'), 0)
    const highInterestDebt = debts.filter(d => parseFloat(d.interestRate || '0') > 7)
    if (emergencyFund < 1000) return { step: 1, title: 'Baby Step 1', desc: 'Save $1,000 Emergency Fund', progress: (emergencyFund / 1000) * 100 }
    if (highInterestDebt.length > 0) return { step: 2, title: 'Baby Step 2', desc: 'Pay off high-interest debt', progress: 0 }
    if (emergencyFund < monthlyExpenses * 3) return { step: 3, title: 'Baby Step 3', desc: '3-6 months expenses saved', progress: (emergencyFund / (monthlyExpenses * 3)) * 100 }
    if (totalDebtBalance > 0) return { step: 4, title: 'Baby Step 4', desc: 'Pay off all debt', progress: 0 }
    return { step: 5, title: 'Baby Step 5+', desc: 'Build wealth!', progress: 100 }
  }
  const currentBabyStep = getBabyStep()

  // ==================== CRUD FUNCTIONS ====================
  const addIncome = () => {
    if (!newIncome.name || !newIncome.amount) return
    setIncomeStreams([...incomeStreams, { ...newIncome, id: Date.now() }])
    setNewIncome({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0] })
  }
  const deleteIncome = (id: number) => setIncomeStreams(incomeStreams.filter(i => i.id !== id))

  const addExpense = () => {
    if (!newExpense.name || !newExpense.amount) return
    setExpenses([...expenses, { ...newExpense, id: Date.now() }])
    setNewExpense({ name: '', amount: '', frequency: 'monthly', category: 'other', dueDate: new Date().toISOString().split('T')[0] })
  }
  const deleteExpense = (id: number) => setExpenses(expenses.filter(e => e.id !== id))

  const addDebt = () => {
    if (!newDebt.name || !newDebt.balance) return
    setDebts([...debts, { ...newDebt, id: Date.now(), originalBalance: newDebt.balance }])
    setNewDebt({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: new Date().toISOString().split('T')[0] })
  }
  const deleteDebt = (id: number) => setDebts(debts.filter(d => d.id !== id))

  const addGoal = () => {
    if (!newGoal.name || !newGoal.target) return
    setGoals([...goals, { ...newGoal, id: Date.now() }])
    setNewGoal({ name: '', target: '', saved: '0', deadline: '', savingsFrequency: 'monthly', startDate: new Date().toISOString().split('T')[0], paymentAmount: '' })
  }
  const deleteGoal = (id: number) => setGoals(goals.filter(g => g.id !== id))

  const addAsset = () => {
    if (!newAsset.name || !newAsset.value) return
    setAssets([...assets, { ...newAsset, id: Date.now() }])
    setNewAsset({ name: '', value: '', type: 'savings' })
  }
  const deleteAsset = (id: number) => setAssets(assets.filter(a => a.id !== id))

  const addLiability = () => {
    if (!newLiability.name || !newLiability.value) return
    setLiabilities([...liabilities, { ...newLiability, id: Date.now() }])
    setNewLiability({ name: '', value: '', type: 'loan' })
  }
  const deleteLiability = (id: number) => setLiabilities(liabilities.filter(l => l.id !== id))

  const addTrade = () => {
    if (!newTrade.instrument) return
    setTrades([...trades, { ...newTrade, id: Date.now() }].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    setNewTrade({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' })
  }
  const deleteTrade = (id: number) => setTrades(trades.filter(t => t.id !== id))

  const addPresetBill = (preset: any) => {
    const amount = prompt(`Enter amount for ${preset.name}:`, preset.amount || '')
    if (!amount) return
    setExpenses([...expenses, { id: Date.now(), name: preset.name, amount, frequency: preset.frequency, category: preset.category, dueDate: new Date().toISOString().split('T')[0] }])
  }

  const addGoalToCalendar = (goal: any) => {
    if (!goal.paymentAmount) { alert('Set a payment amount first'); return }
    setGoals(goals.map(g => g.id === goal.id ? { ...g, startDate: g.startDate || new Date().toISOString().split('T')[0] } : g))
    alert(`${goal.name} added to calendar!`)
  }

  // Debt payoff calculator - calculates months to payoff
  const calculateSingleDebtPayoff = (debt: any) => {
    const balance = parseFloat(debt.balance || '0')
    const interestRate = parseFloat(debt.interestRate || '0') / 100 / 12 // Monthly rate
    const minPayment = convertToMonthly(parseFloat(debt.minPayment || '0'), debt.frequency || 'monthly')
    
    // Get any extra payments targeting this debt
    const extraPayments = expenses.filter(e => e.targetDebtId === debt.id)
      .reduce((sum, e) => sum + convertToMonthly(parseFloat(e.amount || '0'), e.frequency), 0)
    
    const totalPayment = minPayment + extraPayments
    
    if (balance <= 0) return { months: 0, totalInterest: 0, payoffDate: 'Paid off!' }
    if (totalPayment <= 0) return { months: 999, totalInterest: 0, payoffDate: 'No payment set' }
    
    // Check if payment covers interest
    const monthlyInterest = balance * interestRate
    if (totalPayment <= monthlyInterest) {
      return { months: 999, totalInterest: 0, payoffDate: 'Payment too low!' }
    }
    
    // Calculate payoff
    let remaining = balance
    let months = 0
    let totalInterest = 0
    
    while (remaining > 0 && months < 600) {
      const interest = remaining * interestRate
      totalInterest += interest
      remaining = remaining + interest - totalPayment
      months++
    }
    
    const payoffDate = new Date()
    payoffDate.setMonth(payoffDate.getMonth() + months)
    
    return {
      months,
      totalInterest,
      payoffDate: months < 600 ? payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Never',
      extraPayments,
      totalPayment
    }
  }

  // Add extra payment to a specific debt
  const addExtraPaymentToDebt = (debtId: number) => {
    const extra = debtExtraPayment[debtId]
    if (!extra || !extra.amount || parseFloat(extra.amount) <= 0) { 
      alert('Please enter an extra payment amount')
      return 
    }
    const debt = debts.find(d => d.id === debtId)
    if (!debt) return
    
    setExpenses([...expenses, { 
      id: Date.now(), 
      name: `Extra → ${debt.name}`, 
      amount: extra.amount, 
      frequency: extra.frequency, 
      category: 'debt',
      dueDate: new Date().toISOString().split('T')[0], 
      targetDebtId: debt.id 
    }])
    
    alert(`Extra payment of $${extra.amount}/${extra.frequency} added to ${debt.name}`)
    setDebtExtraPayment(prev => ({ ...prev, [debtId]: { amount: '', frequency: 'monthly' } }))
    setShowExtraInput(null)
  }

  // ==================== CSV IMPORT ====================
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const lines = (ev.target?.result as string).split('\n').slice(1).filter(l => l.trim())
      const txns = lines.map((line, i) => {
        const parts = line.split(',').map(p => p.replace(/"/g, '').trim())
        const amt = parseFloat(parts.find(p => /^-?\$?[\d,.]+$/.test(p.replace(/[$,]/g, '')))?.replace(/[$,]/g, '') || '0')
        const desc = parts.find(p => p.length > 3 && !/^-?\$?[\d,.]+$/.test(p.replace(/[$,]/g, ''))) || 'Transaction'
        return { id: Date.now() + i, description: desc, amount: Math.abs(amt), isExpense: amt < 0, selected: amt < 0, category: 'other' }
      }).filter(t => t.amount > 0)
      setCsvTransactions(txns)
      setShowCsvImport(true)
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const importCsvTransactions = () => {
    csvTransactions.filter(t => t.selected).forEach(t => {
      if (t.isExpense) {
        setExpenses(prev => [...prev, { id: Date.now() + Math.random(), name: t.description, amount: t.amount.toString(), frequency: 'once', category: t.category, dueDate: new Date().toISOString().split('T')[0] }])
      } else {
        setIncomeStreams(prev => [...prev, { id: Date.now() + Math.random(), name: t.description, amount: t.amount.toString(), frequency: 'once', type: 'active', startDate: new Date().toISOString().split('T')[0] }])
      }
    })
    alert(`Imported ${csvTransactions.filter(t => t.selected).length} transactions`)
    setShowCsvImport(false)
    setCsvTransactions([])
  }

  // ==================== EDIT FUNCTIONS ====================
  const startEdit = (type: string, item: any) => {
    setEditingItem({ type, id: item.id, data: { ...item } })
  }

  const cancelEdit = () => {
    setEditingItem(null)
  }

  const saveEdit = () => {
    if (!editingItem) return
    const { type, id, data } = editingItem

    switch (type) {
      case 'income':
        setIncomeStreams(prev => prev.map(item => item.id === id ? { ...item, ...data } : item))
        break
      case 'expense':
        setExpenses(prev => prev.map(item => item.id === id ? { ...item, ...data } : item))
        break
      case 'debt':
        setDebts(prev => prev.map(item => item.id === id ? { ...item, ...data } : item))
        break
      case 'goal':
        setGoals(prev => prev.map(item => item.id === id ? { ...item, ...data } : item))
        break
      case 'asset':
        setAssets(prev => prev.map(item => item.id === id ? { ...item, ...data } : item))
        break
      case 'liability':
        setLiabilities(prev => prev.map(item => item.id === id ? { ...item, ...data } : item))
        break
    }
    setEditingItem(null)
  }

  const updateEditField = (field: string, value: string) => {
    if (!editingItem) return
    setEditingItem({ ...editingItem, data: { ...editingItem.data, [field]: value } })
  }

  // ==================== CALENDAR FUNCTIONS ====================
  const getDaysInMonth = () => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    return { firstDay: new Date(year, month, 1).getDay(), daysInMonth: new Date(year, month + 1, 0).getDate(), month, year }
  }

  const getCalendarItemsForDay = (day: number) => {
    const { month, year } = getDaysInMonth()
    const items: any[] = []
    const checkDate = new Date(year, month, day)
    
    const shouldShowItem = (startDate: string, frequency: string) => {
      if (!startDate) return frequency === 'monthly' && day === 1
      const start = new Date(startDate)
      if (start > checkDate) return false
      if (frequency === 'once') return start.getDate() === day && start.getMonth() === month && start.getFullYear() === year
      if (frequency === 'monthly') return start.getDate() === day
      if (frequency === 'weekly') return Math.floor((checkDate.getTime() - start.getTime()) / 86400000) % 7 === 0
      if (frequency === 'fortnightly') return Math.floor((checkDate.getTime() - start.getTime()) / 86400000) % 14 === 0
      if (frequency === 'quarterly') return start.getDate() === day && (month - start.getMonth() + 12) % 3 === 0
      if (frequency === 'yearly') return start.getDate() === day && start.getMonth() === month
      return false
    }

    incomeStreams.forEach(inc => {
      if (shouldShowItem(inc.startDate, inc.frequency)) {
        const id = `inc-${inc.id}-${year}-${month}-${day}`
        items.push({ ...inc, itemId: id, itemType: 'income', isPaid: paidOccurrences.has(id) })
      }
    })

    expenses.filter(e => !e.targetDebtId && !e.targetGoalId).forEach(exp => {
      if (shouldShowItem(exp.dueDate, exp.frequency)) {
        const id = `exp-${exp.id}-${year}-${month}-${day}`
        items.push({ ...exp, itemId: id, itemType: 'expense', isPaid: paidOccurrences.has(id) })
      }
    })

    debts.forEach(debt => {
      if (shouldShowItem(debt.paymentDate, debt.frequency || 'monthly')) {
        const id = `debt-${debt.id}-${year}-${month}-${day}`
        items.push({ ...debt, amount: debt.minPayment, itemId: id, itemType: 'debt', isPaid: paidOccurrences.has(id) })
      }
    })

    goals.filter(g => g.paymentAmount && g.startDate).forEach(goal => {
      if (shouldShowItem(goal.startDate, goal.savingsFrequency)) {
        const id = `goal-${goal.id}-${year}-${month}-${day}`
        items.push({ ...goal, amount: goal.paymentAmount, itemId: id, itemType: 'goal', isPaid: paidOccurrences.has(id) })
      }
    })

    return items
  }

  const togglePaid = (itemId: string) => {
    const newPaid = new Set(paidOccurrences)
    if (newPaid.has(itemId)) newPaid.delete(itemId)
    else newPaid.add(itemId)
    setPaidOccurrences(newPaid)
  }

  // ==================== AI AGENT FUNCTIONS ====================
  const fetchProactiveInsight = async (mode: 'budget' | 'trading') => {
    setIsLoading(true)
    try {
      const endpoint = mode === 'budget' ? '/api/budget-coach' : '/api/trading-coach'
      const body = mode === 'budget'
        ? { mode: 'proactive', financialData: { income: incomeStreams, expenses, debts, goals, assets, liabilities }, memory: budgetMemory }
        : { mode: 'proactive', tradingData: { trades }, memory: tradingMemory }
      
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await response.json()
      setProactiveInsight(data)
    } catch (error) {
      console.error('Failed to fetch insight:', error)
      setProactiveInsight({ greeting: `Hey${budgetMemory.name ? ' ' + budgetMemory.name : ''}!`, insight: 'Ready to help you with your finances today.', mood: 'neutral' })
    }
    setIsLoading(false)
  }

  const handleOnboardingResponse = async (response: string, mode: 'budget' | 'trading') => {
    setIsLoading(true)
    setChatMessages(prev => [...prev, { role: 'user', content: response }])
    setChatInput('')
    
    try {
      const endpoint = mode === 'budget' ? '/api/budget-coach' : '/api/trading-coach'
      const currentStep = mode === 'budget' ? budgetOnboarding.step : tradingOnboarding.step
      const memory = mode === 'budget' ? budgetMemory : tradingMemory
      
      const apiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: 'onboarding', 
          onboardingStep: currentStep, 
          userResponse: response, 
          memory,
          financialData: { income: incomeStreams, expenses, debts, goals, assets, liabilities }
        })
      })
      
      const data = await apiResponse.json()
      
      // Execute any actions returned by the AI FIRST
      let addedSummary = ''
      if (data.actions && Array.isArray(data.actions) && data.actions.length > 0) {
        executeAIActions(data.actions)
        
        // Build summary of what was added
        const incomeAdded = data.actions.filter((a: any) => a.type === 'addIncome')
        const expenseAdded = data.actions.filter((a: any) => a.type === 'addExpense')
        const debtAdded = data.actions.filter((a: any) => a.type === 'addDebt')
        const goalAdded = data.actions.filter((a: any) => a.type === 'addGoal')
        
        const parts = []
        if (incomeAdded.length > 0) parts.push(`${incomeAdded.length} income`)
        if (expenseAdded.length > 0) parts.push(`${expenseAdded.length} expense${expenseAdded.length > 1 ? 's' : ''}`)
        if (debtAdded.length > 0) parts.push(`${debtAdded.length} debt${debtAdded.length > 1 ? 's' : ''}`)
        if (goalAdded.length > 0) parts.push(`${goalAdded.length} goal${goalAdded.length > 1 ? 's' : ''}`)
        
        if (parts.length > 0) {
          addedSummary = `\n\n✅ Added: ${parts.join(', ')}`
        }
      }
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: (data.message || data.raw || "Let's continue...") + addedSummary }])
      
      // Legacy support for extractedData
      if (data.extractedData) {
        if (mode === 'budget') setBudgetMemory((prev: any) => ({ ...prev, ...data.extractedData }))
        else setTradingMemory((prev: any) => ({ ...prev, ...data.extractedData }))
      }
      
      if (data.isComplete) {
        if (mode === 'budget') {
          setBudgetOnboarding({ isActive: false, step: 'complete' })
          setBudgetMemory((prev: any) => ({ ...prev, onboardingComplete: true }))
        } else {
          setTradingOnboarding({ isActive: false, step: 'complete' })
          setTradingMemory((prev: any) => ({ ...prev, onboardingComplete: true }))
        }
        setTimeout(() => fetchProactiveInsight(mode), 500)
      } else if (data.nextStep) {
        if (mode === 'budget') setBudgetOnboarding(prev => ({ ...prev, step: data.nextStep }))
        else setTradingOnboarding(prev => ({ ...prev, step: data.nextStep }))
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble with that. Let's try again!" }])
    }
    setIsLoading(false)
  }

  // Execute actions returned by AI
  const executeAIActions = (actions: any[]) => {
    // Helper to validate and use date from AI, or default to today
    const getValidDate = (dateStr?: string): string => {
      if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr
      }
      return new Date().toISOString().split('T')[0]
    }
    
    actions.forEach(action => {
      const { type, data } = action
      
      switch (type) {
        // ===== ADD ACTIONS =====
        case 'addIncome':
          if (data.name && data.amount) {
            setIncomeStreams(prev => [...prev, {
              id: Date.now() + Math.random(),
              name: data.name,
              amount: data.amount.toString().replace(/[$,]/g, ''),
              frequency: data.frequency || 'monthly',
              type: data.type || 'active',
              startDate: getValidDate(data.startDate)
            }])
          }
          break
          
        case 'addExpense':
          if (data.name && data.amount) {
            setExpenses(prev => [...prev, {
              id: Date.now() + Math.random(),
              name: data.name,
              amount: data.amount.toString().replace(/[$,]/g, ''),
              frequency: data.frequency || 'monthly',
              category: data.category || 'other',
              dueDate: getValidDate(data.dueDate)
            }])
          }
          break
          
        case 'addDebt':
          if (data.name && data.balance) {
            setDebts(prev => [...prev, {
              id: Date.now() + Math.random(),
              name: data.name,
              balance: data.balance.toString().replace(/[$,]/g, ''),
              interestRate: data.interestRate || '0',
              minPayment: data.minPayment || '0',
              frequency: 'monthly',
              paymentDate: getValidDate(data.paymentDate),
              originalBalance: data.balance.toString().replace(/[$,]/g, '')
            }])
          }
          break
          
        case 'addGoal':
          if (data.name && data.target) {
            setGoals(prev => [...prev, {
              id: Date.now() + Math.random(),
              name: data.name,
              target: data.target.toString().replace(/[$,]/g, ''),
              saved: data.saved || '0',
              deadline: data.deadline || '',
              savingsFrequency: data.savingsFrequency || 'monthly',
              startDate: getValidDate(data.startDate),
              paymentAmount: data.paymentAmount || ''
            }])
          }
          break
          
        case 'addAsset':
          if (data.name && data.value) {
            setAssets(prev => [...prev, {
              id: Date.now() + Math.random(),
              name: data.name,
              value: data.value.toString().replace(/[$,]/g, ''),
              type: data.type || 'savings'
            }])
          }
          break
        
        case 'addTrade':
          if (data.instrument && data.profitLoss) {
            setTrades(prev => [...prev, {
              id: Date.now() + Math.random(),
              date: getValidDate(data.date),
              instrument: data.instrument,
              direction: data.direction || 'long',
              entryPrice: data.entryPrice || '',
              exitPrice: data.exitPrice || '',
              profitLoss: data.profitLoss.toString().replace(/[$,]/g, ''),
              notes: data.notes || ''
            }])
          }
          break

        // ===== UPDATE ACTIONS =====
        case 'updateIncome':
          if (data.id) {
            setIncomeStreams(prev => prev.map(item => {
              if (item.id === data.id || Math.floor(item.id) === Math.floor(data.id)) {
                return {
                  ...item,
                  ...(data.name && { name: data.name }),
                  ...(data.amount && { amount: data.amount.toString().replace(/[$,]/g, '') }),
                  ...(data.frequency && { frequency: data.frequency }),
                  ...(data.type && { type: data.type }),
                  ...(data.startDate && { startDate: data.startDate })
                }
              }
              return item
            }))
          }
          break
          
        case 'updateExpense':
          if (data.id) {
            setExpenses(prev => prev.map(item => {
              if (item.id === data.id || Math.floor(item.id) === Math.floor(data.id)) {
                return {
                  ...item,
                  ...(data.name && { name: data.name }),
                  ...(data.amount && { amount: data.amount.toString().replace(/[$,]/g, '') }),
                  ...(data.frequency && { frequency: data.frequency }),
                  ...(data.category && { category: data.category }),
                  ...(data.dueDate && { dueDate: data.dueDate })
                }
              }
              return item
            }))
          }
          break
          
        case 'updateDebt':
          if (data.id) {
            setDebts(prev => prev.map(item => {
              if (item.id === data.id || Math.floor(item.id) === Math.floor(data.id)) {
                return {
                  ...item,
                  ...(data.name && { name: data.name }),
                  ...(data.balance && { balance: data.balance.toString().replace(/[$,]/g, '') }),
                  ...(data.interestRate && { interestRate: data.interestRate }),
                  ...(data.minPayment && { minPayment: data.minPayment.toString().replace(/[$,]/g, '') }),
                  ...(data.paymentDate && { paymentDate: data.paymentDate })
                }
              }
              return item
            }))
          }
          break
          
        case 'updateGoal':
          if (data.id) {
            setGoals(prev => prev.map(item => {
              if (item.id === data.id || Math.floor(item.id) === Math.floor(data.id)) {
                return {
                  ...item,
                  ...(data.name && { name: data.name }),
                  ...(data.target && { target: data.target.toString().replace(/[$,]/g, '') }),
                  ...(data.saved && { saved: data.saved.toString().replace(/[$,]/g, '') }),
                  ...(data.deadline && { deadline: data.deadline }),
                  ...(data.savingsFrequency && { savingsFrequency: data.savingsFrequency }),
                  ...(data.paymentAmount && { paymentAmount: data.paymentAmount.toString().replace(/[$,]/g, '') })
                }
              }
              return item
            }))
          }
          break

        // ===== DELETE ACTIONS =====
        case 'deleteIncome':
          if (data.id) {
            setIncomeStreams(prev => prev.filter(item => item.id !== data.id && Math.floor(item.id) !== Math.floor(data.id)))
          }
          break
          
        case 'deleteExpense':
          if (data.id) {
            setExpenses(prev => prev.filter(item => item.id !== data.id && Math.floor(item.id) !== Math.floor(data.id)))
          }
          break
          
        case 'deleteDebt':
          if (data.id) {
            setDebts(prev => prev.filter(item => item.id !== data.id && Math.floor(item.id) !== Math.floor(data.id)))
          }
          break
          
        case 'deleteGoal':
          if (data.id) {
            setGoals(prev => prev.filter(item => item.id !== data.id && Math.floor(item.id) !== Math.floor(data.id)))
          }
          break

        // ===== MEMORY ACTIONS =====
        case 'setMemory':
          setBudgetMemory((prev: any) => {
            const updated = { ...prev }
            if (data.name) updated.name = data.name
            if (data.payDay) updated.payDay = data.payDay
            if (data.lifeEvents) updated.lifeEvents = data.lifeEvents
            if (data.currentStep) updated.currentStep = data.currentStep
            if (data.preferences) updated.preferences = { ...prev.preferences, ...data.preferences }
            if (data.patterns) updated.patterns = [...(prev.patterns || []), ...data.patterns]
            if (data.notes) updated.notes = [...(prev.notes || []), ...data.notes]
            return updated
          })
          break
      }
    })
  }

  const handleChatMessage = async () => {
    if (!chatInput.trim() || isLoading) return
    const message = chatInput.trim()
    
    if ((appMode === 'budget' && budgetOnboarding.isActive) || (appMode === 'trading' && tradingOnboarding.isActive)) {
      await handleOnboardingResponse(message, appMode!)
      return
    }
    
    setChatMessages(prev => [...prev, { role: 'user', content: message }])
    setChatInput('')
    setIsLoading(true)
    
    try {
      const endpoint = appMode === 'budget' ? '/api/budget-coach' : '/api/trading-coach'
      const body = appMode === 'budget'
        ? { mode: 'question', question: message, financialData: { income: incomeStreams, expenses, debts, goals, assets, liabilities }, memory: budgetMemory }
        : { mode: 'question', question: message, tradingData: { trades }, memory: tradingMemory }
      
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await response.json()
      
      // Execute any actions
      if (data.actions && Array.isArray(data.actions)) {
        executeAIActions(data.actions)
        // Add confirmation of what was added
        const addedItems = data.actions.filter((a: any) => a.type.startsWith('add'))
        if (addedItems.length > 0) {
          const summary = addedItems.map((a: any) => `${a.type.replace('add', '')}: ${a.data.name}`).join(', ')
          setChatMessages(prev => [...prev, { role: 'assistant', content: data.message || data.advice || data.raw || "Done!" }])
          // Show what was added in a subtle way
          if (!data.message?.toLowerCase().includes('added')) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: `✅ Added: ${summary}` }])
          }
        } else {
          setChatMessages(prev => [...prev, { role: 'assistant', content: data.message || data.advice || data.raw || "I'm here to help!" }])
        }
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.message || data.advice || data.raw || "I'm here to help!" }])
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong. Please try again." }])
    }
    setIsLoading(false)
  }

  const startOnboarding = (mode: 'budget' | 'trading') => {
    setChatMessages([])
    if (mode === 'budget') {
      setBudgetOnboarding({ isActive: true, step: 'greeting' })
      setChatMessages([{ role: 'assistant', content: "Hey! 👋 I'm Aureus, your financial companion. I'm here to help you take control of your money - whether that's crushing debt, building savings, or escaping the rat race.\n\nLet's get to know each other. What should I call you?" }])
    } else {
      setTradingOnboarding({ isActive: true, step: 'greeting' })
      setChatMessages([{ role: 'assistant', content: "Hey trader! 📈 I'm Aureus, your trading mentor. I'll help you stay disciplined, track your performance, and crush those prop firm challenges.\n\nWhat's your name, and how long have you been trading?" }])
    }
  }

  const handleModeSelect = (mode: 'budget' | 'trading') => {
    setAppMode(mode)
    setShowModeSelector(false)
    setActiveTab(mode === 'budget' ? 'dashboard' : 'trading')
    setChatMessages([])
    setProactiveInsight(null)
    
    const memory = mode === 'budget' ? budgetMemory : tradingMemory
    if (!memory.onboardingComplete) {
      startOnboarding(mode)
    } else {
      fetchProactiveInsight(mode)
    }
  }

  // ==================== PROP FIRM CALCULATIONS ====================
  const calculateForexProp = () => {
    const size = parseFloat(forexProp.accountSize) || 0
    const target = parseFloat(forexProp.profitTarget) / 100
    const maxDD = parseFloat(forexProp.maxDrawdown) / 100
    const dailyDD = parseFloat(forexProp.dailyDrawdown) / 100
    const current = parseFloat(forexProp.currentBalance) || size
    const days = parseInt(forexProp.daysInChallenge) || 30
    const split = parseFloat(forexProp.profitSplit) / 100

    const profitTargetAmount = size * target
    const maxDrawdownAmount = size * maxDD
    const dailyDrawdownAmount = current * dailyDD
    const profitMade = current - size
    const progressPercent = profitTargetAmount > 0 ? (profitMade / profitTargetAmount) * 100 : 0
    const remainingProfit = profitTargetAmount - profitMade
    const dailyTargetToPass = days > 0 ? remainingProfit / days : 0
    const drawdownRemaining = current - (size - maxDrawdownAmount)

    return { profitTargetAmount, maxDrawdownAmount, dailyDrawdownAmount, profitMade, progressPercent, remainingProfit, dailyTargetToPass, drawdownRemaining, split }
  }

  const calculateFuturesProp = () => {
    const size = parseFloat(futuresProp.accountSize) || 0
    const target = parseFloat(futuresProp.profitTarget) || 0
    const maxDD = parseFloat(futuresProp.maxDrawdown) || 0
    const dailyLimit = parseFloat(futuresProp.dailyLossLimit) || 0
    const current = parseFloat(futuresProp.currentBalance) || size
    const split = parseFloat(futuresProp.profitSplit) / 100

    const profitMade = current - size
    const progressPercent = target > 0 ? (profitMade / target) * 100 : 0
    const remainingProfit = target - profitMade
    const drawdownThreshold = size - maxDD
    const drawdownUsed = size - current
    const drawdownRemaining = maxDD - drawdownUsed

    return { target, profitMade, progressPercent, remainingProfit, drawdownThreshold, drawdownUsed, drawdownRemaining, dailyLimit, split, accountSize: size, currentBalance: current }
  }

  const calculateTradingCompound = () => {
    const capital = parseFloat(tradingCalculator.startingCapital) || 0
    const monthly = parseFloat(tradingCalculator.monthlyContribution) || 0
    const rate = parseFloat(tradingCalculator.returnRate) / 100 || 0
    const reinvest = parseFloat(tradingCalculator.reinvestRate) / 100 || 1
    const years = parseInt(tradingCalculator.years) || 0
    const months = parseInt(tradingCalculator.months) || 0
    const days = parseInt(tradingCalculator.days) || 0
    
    const totalCalendarDays = years * 365 + months * 30 + days
    const tradingDaysPerWeek = tradingCalculator.includeDays.length
    const totalTradingDays = Math.floor(totalCalendarDays * (tradingDaysPerWeek / 7))
    
    let balance = capital
    let totalContributed = capital
    
    for (let d = 0; d < totalTradingDays; d++) {
      const profit = balance * rate
      balance += profit * reinvest
      if (d > 0 && d % 20 === 0) {
        balance += monthly
        totalContributed += monthly
      }
    }
    
    return { futureValue: balance, totalContributed, profit: balance - totalContributed, totalCalendarDays, totalTradingDays }
  }

  const forexPropResults = calculateForexProp()
  const futuresPropResults = calculateFuturesProp()
  const tradingResults = calculateTradingCompound()

  // ==================== RENDER: MODE SELECTOR ====================
  if (showModeSelector) {
    return (
      <div style={{ minHeight: '100vh', background: darkMode ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' as const, marginBottom: '48px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✨</div>
          <h1 style={{ fontSize: '42px', fontWeight: 800, color: theme.text, margin: '0 0 12px 0' }}>Welcome to Aureus</h1>
          <p style={{ fontSize: '18px', color: theme.textMuted, margin: 0 }}>Your AI-powered financial companion</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '700px', width: '100%' }}>
          <button onClick={() => handleModeSelect('budget')} style={{ padding: '32px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '24px', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
            <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>Budget Mode</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0 0 16px 0', fontSize: '14px' }}>{budgetMemory.onboardingComplete ? `Welcome back${budgetMemory.name ? ', ' + budgetMemory.name : ''}!` : 'Get set up in 5 minutes'}</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
              {['Baby Steps', 'FIRE Path', 'Calendar', 'Goals'].map(tag => <span key={tag} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '11px', color: 'white' }}>{tag}</span>)}
            </div>
          </button>
          
          <button onClick={() => handleModeSelect('trading')} style={{ padding: '32px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '24px', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📈</div>
            <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>Trading Mode</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0 0 16px 0', fontSize: '14px' }}>{tradingMemory.onboardingComplete ? `Welcome back${tradingMemory.name ? ', ' + tradingMemory.name : ''}!` : 'Get set up in 5 minutes'}</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
              {['Prop Firms', 'Journal', 'Calculator'].map(tag => <span key={tag} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '11px', color: 'white' }}>{tag}</span>)}
            </div>
          </button>
        </div>
        
        {totalPL !== 0 && <div style={{ marginTop: '24px', padding: '16px 24px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border }}><p style={{ color: theme.textMuted, margin: 0, fontSize: '14px' }}>💡 Trading P&L (${totalPL.toFixed(0)}) flows into Budget Mode</p></div>}
        
        <button onClick={() => setDarkMode(!darkMode)} style={{ marginTop: '32px', padding: '12px 24px', background: 'transparent', border: '2px solid ' + theme.border, borderRadius: '12px', color: theme.textMuted, cursor: 'pointer' }}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
      </div>
    )
  }

  // Continued in render return...

  // ==================== RENDER: MAIN APP ====================
  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      {/* Modals */}
      {expandedDay && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setExpandedDay(null)}>
          <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' as const }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>{calendarMonth.toLocaleDateString('en-US', { month: 'long' })} {expandedDay.day}</h3>
            {expandedDay.items.length === 0 ? <p style={{ color: theme.textMuted }}>No items scheduled</p> : expandedDay.items.map(item => (
              <div key={item.itemId} style={{ padding: '12px', marginBottom: '8px', background: item.itemType === 'income' ? '#d1fae5' : item.itemType === 'expense' ? '#dbeafe' : item.itemType === 'debt' ? '#fee2e2' : '#ede9fe', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: item.isPaid ? 0.6 : 1 }}>
                <div><div style={{ fontWeight: 600, color: '#1e293b', textDecoration: item.isPaid ? 'line-through' : 'none' }}>{item.name}</div><div style={{ fontSize: '12px', color: '#64748b' }}>${item.amount} • {item.itemType}</div></div>
                <button onClick={() => togglePaid(item.itemId)} style={{ padding: '8px 16px', background: item.isPaid ? '#6b7280' : theme.success, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>{item.isPaid ? '✓ Paid' : 'Pay'}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCsvImport && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowCsvImport(false)}>
          <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '700px', width: '95%', maxHeight: '85vh', overflowY: 'auto' as const }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>Import Transactions ({csvTransactions.length})</h3>
            <div style={{ marginBottom: '16px' }}><button onClick={() => setCsvTransactions(csvTransactions.map(t => ({ ...t, selected: true })))} style={{ ...btnPrimary, marginRight: '8px', padding: '8px 16px' }}>Select All</button><button onClick={() => setCsvTransactions(csvTransactions.map(t => ({ ...t, selected: false })))} style={{ ...btnPrimary, background: theme.textMuted, padding: '8px 16px' }}>Deselect All</button></div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' as const }}>
              {csvTransactions.map(t => (
                <div key={t.id} onClick={() => setCsvTransactions(csvTransactions.map(x => x.id === t.id ? { ...x, selected: !x.selected } : x))} style={{ padding: '12px', marginBottom: '8px', background: t.selected ? (t.isExpense ? '#fee2e2' : '#d1fae5') : (darkMode ? '#334155' : '#f1f5f9'), borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><input type="checkbox" checked={t.selected} onChange={() => {}} style={{ marginRight: '12px' }} /><span style={{ color: theme.text }}>{t.description}</span></div>
                  <span style={{ color: t.isExpense ? theme.danger : theme.success, fontWeight: 600 }}>{t.isExpense ? '-' : '+'}${t.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={importCsvTransactions} style={btnSuccess}>Import {csvTransactions.filter(t => t.selected).length} Selected</button>
              <button onClick={() => setShowCsvImport(false)} style={{ ...btnPrimary, background: theme.textMuted }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ padding: '12px 24px', background: theme.cardBg, borderBottom: '1px solid ' + theme.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setShowModeSelector(true)} style={{ padding: '8px 16px', background: appMode === 'budget' ? theme.success : theme.warning, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
            {appMode === 'budget' ? '💰 Budget' : '📈 Trading'} ▼
          </button>
          <span style={{ color: theme.text, fontWeight: 700, fontSize: '20px' }}>Aureus</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {appMode === 'budget' && ['dashboard', 'overview', 'path'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} style={{ padding: '8px 16px', background: activeTab === tab ? theme.accent : 'transparent', color: activeTab === tab ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, textTransform: 'capitalize' as const }}>{tab}</button>
          ))}
          <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text }}>{darkMode ? '☀️' : '🌙'}</button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* AI AGENT CARD */}
        <div style={{ background: `linear-gradient(135deg, ${appMode === 'budget' ? theme.success : theme.warning}15, ${theme.purple}15)`, border: `2px solid ${appMode === 'budget' ? theme.success : theme.warning}`, borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
          {proactiveInsight && !budgetOnboarding.isActive && !tradingOnboarding.isActive && (
            <div style={{ marginBottom: chatMessages.length > 0 ? '16px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: appMode === 'budget' ? theme.success : theme.warning, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{appMode === 'budget' ? '💰' : '📈'}</div>
                <div>
                  <div style={{ color: theme.text, fontWeight: 700, fontSize: '18px' }}>{proactiveInsight.greeting || `Hey${budgetMemory.name ? ' ' + budgetMemory.name : ''}!`}</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>Aureus • {appMode === 'budget' ? (currentBabyStep.title) : `${winRate.toFixed(0)}% win rate`}</div>
                </div>
              </div>
              <p style={{ color: theme.text, fontSize: '15px', lineHeight: 1.6, margin: '0 0 8px 0' }}>{proactiveInsight.insight || proactiveInsight.message || "Ready to help you today!"}</p>
              {proactiveInsight.suggestion && <p style={{ color: theme.purple, fontSize: '14px', margin: 0 }}>💡 {proactiveInsight.suggestion}</p>}
            </div>
          )}
          
          {chatMessages.length > 0 && (
            <div style={{ maxHeight: '250px', overflowY: 'auto' as const, marginBottom: '16px', padding: '16px', background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', borderRadius: '12px' }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: '12px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '80%', padding: '12px 16px', borderRadius: '16px', background: msg.role === 'user' ? theme.accent : theme.cardBg, color: msg.role === 'user' ? 'white' : theme.text, fontSize: '14px', lineHeight: 1.5, whiteSpace: 'pre-wrap' as const }}>{msg.content}</div>
                </div>
              ))}
              {isLoading && <div style={{ display: 'flex', gap: '4px', padding: '12px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite' }} /><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.2s' }} /><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.4s' }} /></div>}
              <div ref={chatEndRef} />
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChatMessage()} placeholder={budgetOnboarding.isActive || tradingOnboarding.isActive ? "Type your response..." : "Ask Aureus anything..."} style={{ ...inputStyle, flex: 1 }} disabled={isLoading} />
            <button onClick={handleChatMessage} disabled={isLoading || !chatInput.trim()} style={{ ...btnPrimary, background: appMode === 'budget' ? theme.success : theme.warning, opacity: isLoading || !chatInput.trim() ? 0.5 : 1 }}>{isLoading ? '...' : 'Send'}</button>
          </div>
        </div>

        {/* BUDGET DASHBOARD TAB */}
        {appMode === 'budget' && activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            {/* This Month Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Income This Month</div><div style={{ color: theme.success, fontSize: '28px', fontWeight: 700 }}>${currentMonthTotals.incomeTotal.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Expenses This Month</div><div style={{ color: theme.danger, fontSize: '28px', fontWeight: 700 }}>${currentMonthTotals.expenseTotal.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Debt Payments</div><div style={{ color: theme.warning, fontSize: '28px', fontWeight: 700 }}>${currentMonthTotals.debtTotal.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Net This Month</div><div style={{ color: currentMonthTotals.total >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 700 }}>${currentMonthTotals.total.toFixed(0)}</div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Income */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: theme.success, fontSize: '18px' }}>💰 Income</h3>
                  <span style={{ color: theme.success, fontWeight: 700 }}>${monthlyIncome.toFixed(0)}/mo</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                  <input placeholder="Source" value={newIncome.name} onChange={e => setNewIncome({...newIncome, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '120px'}} />
                  <input placeholder="Amount" type="number" value={newIncome.amount} onChange={e => setNewIncome({...newIncome, amount: e.target.value})} style={{...inputStyle, width: '100px'}} />
                  <select value={newIncome.frequency} onChange={e => setNewIncome({...newIncome, frequency: e.target.value})} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
                  <select value={newIncome.type} onChange={e => setNewIncome({...newIncome, type: e.target.value})} style={inputStyle}><option value="active">Active</option><option value="passive">Passive</option></select>
                  <input type="date" value={newIncome.startDate} onChange={e => setNewIncome({...newIncome, startDate: e.target.value})} style={{...inputStyle, width: '130px'}} />
                  <button onClick={addIncome} style={btnSuccess}>+</button>
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' as const }}>
                  {incomeStreams.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No income yet</p> : incomeStreams.map(inc => (
                    editingItem?.type === 'income' && editingItem.id === inc.id ? (
                      <div key={inc.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, marginBottom: '8px' }}>
                          <input value={editingItem.data.name} onChange={e => updateEditField('name', e.target.value)} style={{...inputStyle, flex: 1, minWidth: '100px'}} />
                          <input type="number" value={editingItem.data.amount} onChange={e => updateEditField('amount', e.target.value)} style={{...inputStyle, width: '80px'}} />
                          <select value={editingItem.data.frequency} onChange={e => updateEditField('frequency', e.target.value)} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                          <input type="date" value={editingItem.data.startDate} onChange={e => updateEditField('startDate', e.target.value)} style={{...inputStyle, width: '130px'}} />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={saveEdit} style={{...btnSuccess, padding: '6px 12px', fontSize: '12px'}}>Save</button>
                          <button onClick={cancelEdit} style={{...btnDanger, padding: '6px 12px', fontSize: '12px'}}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div key={inc.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div><div style={{ color: theme.text, fontWeight: 600 }}>{inc.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{inc.frequency} • {inc.type} • {inc.startDate}</div></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: theme.success, fontWeight: 700 }}>${inc.amount}</span>
                          <button onClick={() => startEdit('income', inc)} style={{ padding: '4px 8px', background: theme.accent, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                          <button onClick={() => deleteIncome(inc.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>×</button>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Expenses */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: theme.danger, fontSize: '18px' }}>💸 Expenses</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setShowPresets(!showPresets)} style={{ padding: '4px 12px', background: theme.purple, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>+ Presets</button>
                    <input type="file" ref={fileInputRef} accept=".csv" onChange={handleCsvUpload} style={{ display: 'none' }} />
                    <button onClick={() => fileInputRef.current?.click()} style={{ padding: '4px 12px', background: theme.accent, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>CSV</button>
                    <span style={{ color: theme.danger, fontWeight: 700 }}>${monthlyExpenses.toFixed(0)}/mo</span>
                  </div>
                </div>
                {showPresets && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '12px', padding: '12px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '8px' }}>
                    {presetBills.map(p => <button key={p.name} onClick={() => addPresetBill(p)} style={{ padding: '4px 10px', background: theme.purple + '30', color: theme.purple, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{p.name}</button>)}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                  <input placeholder="Expense" value={newExpense.name} onChange={e => setNewExpense({...newExpense, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '120px'}} />
                  <input placeholder="Amount" type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} style={{...inputStyle, width: '100px'}} />
                  <select value={newExpense.frequency} onChange={e => setNewExpense({...newExpense, frequency: e.target.value})} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select>
                  <input type="date" value={newExpense.dueDate} onChange={e => setNewExpense({...newExpense, dueDate: e.target.value})} style={{...inputStyle, width: '130px'}} />
                  <button onClick={addExpense} style={btnDanger}>+</button>
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' as const }}>
                  {expenses.filter(e => !e.targetDebtId && !e.targetGoalId).length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No expenses yet</p> : expenses.filter(e => !e.targetDebtId && !e.targetGoalId).map(exp => (
                    editingItem?.type === 'expense' && editingItem.id === exp.id ? (
                      <div key={exp.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, marginBottom: '8px' }}>
                          <input value={editingItem.data.name} onChange={e => updateEditField('name', e.target.value)} style={{...inputStyle, flex: 1, minWidth: '100px'}} />
                          <input type="number" value={editingItem.data.amount} onChange={e => updateEditField('amount', e.target.value)} style={{...inputStyle, width: '80px'}} />
                          <select value={editingItem.data.frequency} onChange={e => updateEditField('frequency', e.target.value)} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option></select>
                          <input type="date" value={editingItem.data.dueDate} onChange={e => updateEditField('dueDate', e.target.value)} style={{...inputStyle, width: '130px'}} />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={saveEdit} style={{...btnSuccess, padding: '6px 12px', fontSize: '12px'}}>Save</button>
                          <button onClick={cancelEdit} style={{...btnDanger, padding: '6px 12px', fontSize: '12px'}}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div key={exp.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div><div style={{ color: theme.text, fontWeight: 600 }}>{exp.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{exp.frequency} • due {exp.dueDate}</div></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: theme.danger, fontWeight: 700 }}>${exp.amount}</span>
                          <button onClick={() => startEdit('expense', exp)} style={{ padding: '4px 8px', background: theme.accent, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                          <button onClick={() => deleteExpense(exp.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>×</button>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))} style={{ ...btnPrimary, padding: '8px 16px' }}>←</button>
                <h3 style={{ margin: 0, color: theme.text }}>{calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))} style={{ ...btnPrimary, padding: '8px 16px' }}>→</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} style={{ textAlign: 'center' as const, fontWeight: 600, color: theme.textMuted, padding: '8px', fontSize: '12px' }}>{d}</div>)}
                {Array(getDaysInMonth().firstDay).fill(null).map((_, i) => <div key={'e' + i} />)}
                {Array(getDaysInMonth().daysInMonth).fill(null).map((_, i) => {
                  const day = i + 1
                  const items = getCalendarItemsForDay(day)
                  const isToday = day === new Date().getDate() && calendarMonth.getMonth() === new Date().getMonth() && calendarMonth.getFullYear() === new Date().getFullYear()
                  return (
                    <div key={day} onClick={() => items.length > 0 && setExpandedDay({ day, items })} style={{ minHeight: '80px', padding: '4px', background: isToday ? theme.accent + '20' : (darkMode ? '#1e293b' : '#f8fafc'), borderRadius: '8px', border: isToday ? '2px solid ' + theme.accent : '1px solid ' + theme.border, cursor: items.length > 0 ? 'pointer' : 'default' }}>
                      <div style={{ fontWeight: 600, color: theme.text, marginBottom: '4px', fontSize: '13px' }}>{day}</div>
                      {items.slice(0, 2).map(item => (
                        <div key={item.itemId} style={{ fontSize: '10px', padding: '2px 4px', marginBottom: '2px', background: item.itemType === 'income' ? '#d1fae5' : item.itemType === 'expense' ? '#dbeafe' : item.itemType === 'debt' ? '#fee2e2' : '#ede9fe', color: '#1e293b', borderRadius: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, opacity: item.isPaid ? 0.5 : 1 }}>{item.name}</div>
                      ))}
                      {items.length > 2 && <div style={{ fontSize: '10px', color: theme.accent, fontWeight: 600 }}>+{items.length - 2}</div>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Debts & Goals */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Debts with Payoff Calculator */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: theme.warning, fontSize: '18px' }}>💳 Debts</h3>
                  <span style={{ color: theme.warning, fontWeight: 700 }}>${totalDebtBalance.toFixed(0)}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                  <input placeholder="Debt name" value={newDebt.name} onChange={e => setNewDebt({...newDebt, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '100px'}} />
                  <input placeholder="Balance" type="number" value={newDebt.balance} onChange={e => setNewDebt({...newDebt, balance: e.target.value})} style={{...inputStyle, width: '90px'}} />
                  <input placeholder="APR %" type="number" value={newDebt.interestRate} onChange={e => setNewDebt({...newDebt, interestRate: e.target.value})} style={{...inputStyle, width: '70px'}} />
                  <input placeholder="Min payment" type="number" value={newDebt.minPayment} onChange={e => setNewDebt({...newDebt, minPayment: e.target.value})} style={{...inputStyle, width: '90px'}} />
                  <button onClick={addDebt} style={btnWarning}>+</button>
                </div>
                <div style={{ maxHeight: '350px', overflowY: 'auto' as const }}>
                  {debts.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No debts - debt free! 🎉</p> : debts.map(debt => {
                    const payoff = calculateSingleDebtPayoff(debt)
                    const progress = debt.originalBalance ? ((parseFloat(debt.originalBalance) - parseFloat(debt.balance)) / parseFloat(debt.originalBalance)) * 100 : 0
                    const extraPaymentData = debtExtraPayment[debt.id] || { amount: '', frequency: 'monthly' }
                    
                    return (
                      <div key={debt.id} style={{ padding: '16px', marginBottom: '12px', background: darkMode ? '#3a2e1e' : '#fefce8', borderRadius: '12px', border: '1px solid ' + theme.border }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div>
                            <div style={{ color: theme.text, fontWeight: 600, fontSize: '16px' }}>{debt.name}</div>
                            <div style={{ color: theme.textMuted, fontSize: '12px' }}>
                              {debt.interestRate}% APR • ${debt.minPayment}/{debt.frequency || 'mo'}
                              {payoff.extraPayments > 0 && <span style={{ color: theme.success }}> + ${payoff.extraPayments.toFixed(0)} extra</span>}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' as const }}>
                            <div style={{ color: theme.warning, fontWeight: 700, fontSize: '18px' }}>${parseFloat(debt.balance).toFixed(0)}</div>
                            <button onClick={() => deleteDebt(debt.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', marginTop: '4px' }}>Delete</button>
                          </div>
                        </div>
                        
                        {/* Progress bar */}
                        {debt.originalBalance && (
                          <div style={{ height: '8px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                            <div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: `linear-gradient(90deg, ${theme.success}, #059669)`, borderRadius: '4px' }} />
                          </div>
                        )}
                        
                        {/* Payoff info */}
                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', marginBottom: '12px' }}>
                          <div><span style={{ color: theme.textMuted }}>Payoff: </span><span style={{ color: theme.text, fontWeight: 600 }}>{payoff.payoffDate}</span></div>
                          <div><span style={{ color: theme.textMuted }}>Months: </span><span style={{ color: theme.text, fontWeight: 600 }}>{payoff.months < 600 ? payoff.months : '∞'}</span></div>
                          <div><span style={{ color: theme.textMuted }}>Interest: </span><span style={{ color: theme.danger, fontWeight: 600 }}>${payoff.totalInterest.toFixed(0)}</span></div>
                        </div>
                        
                        {/* Extra payment input */}
                        {showExtraInput === debt.id ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input type="number" placeholder="Extra $" value={extraPaymentData.amount} onChange={e => setDebtExtraPayment({...debtExtraPayment, [debt.id]: {...extraPaymentData, amount: e.target.value}})} style={{...inputStyle, width: '80px', padding: '6px 10px'}} />
                            <select value={extraPaymentData.frequency} onChange={e => setDebtExtraPayment({...debtExtraPayment, [debt.id]: {...extraPaymentData, frequency: e.target.value}})} style={{...inputStyle, padding: '6px 10px'}}>
                              <option value="weekly">Weekly</option>
                              <option value="fortnightly">Fortnightly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                            <button onClick={() => addExtraPaymentToDebt(debt.id)} style={{...btnSuccess, padding: '6px 12px', fontSize: '12px'}}>Add</button>
                            <button onClick={() => setShowExtraInput(null)} style={{...btnDanger, padding: '6px 12px', fontSize: '12px'}}>×</button>
                          </div>
                        ) : (
                          <button onClick={() => setShowExtraInput(debt.id)} style={{ padding: '6px 12px', background: theme.purple + '30', color: theme.purple, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>+ Add Extra Payment</button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Goals */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', color: theme.purple, fontSize: '18px' }}>🎯 Goals</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                  <input placeholder="Goal name" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '100px'}} />
                  <input placeholder="Target $" type="number" value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: e.target.value})} style={{...inputStyle, width: '90px'}} />
                  <input placeholder="Already saved" type="number" value={newGoal.saved} onChange={e => setNewGoal({...newGoal, saved: e.target.value})} style={{...inputStyle, width: '90px'}} />
                  <input type="date" placeholder="Deadline" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} style={{...inputStyle, width: '130px'}} title="Deadline" />
                  <select value={newGoal.savingsFrequency} onChange={e => setNewGoal({...newGoal, savingsFrequency: e.target.value})} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                  <button onClick={addGoal} style={btnPurple}>+</button>
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto' as const }}>
                  {goals.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No goals yet</p> : goals.map(goal => {
                    const progress = (parseFloat(goal.saved || '0') / parseFloat(goal.target || '1')) * 100
                    const remaining = parseFloat(goal.target || '0') - parseFloat(goal.saved || '0')
                    // Calculate payment needed
                    const deadline = goal.deadline ? new Date(goal.deadline) : null
                    const now = new Date()
                    const monthsLeft = deadline ? Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30))) : 0
                    const weeksLeft = deadline ? Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7))) : 0
                    const fortnightsLeft = deadline ? Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 14))) : 0
                    let paymentNeeded = 0
                    if (deadline && remaining > 0) {
                      if (goal.savingsFrequency === 'weekly') paymentNeeded = remaining / weeksLeft
                      else if (goal.savingsFrequency === 'fortnightly') paymentNeeded = remaining / fortnightsLeft
                      else paymentNeeded = remaining / monthsLeft
                    }
                    
                    return editingItem?.type === 'goal' && editingItem.id === goal.id ? (
                      <div key={goal.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#2e1e3a' : '#faf5ff', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, marginBottom: '8px' }}>
                          <input value={editingItem.data.name} onChange={e => updateEditField('name', e.target.value)} placeholder="Name" style={{...inputStyle, flex: 1, minWidth: '100px'}} />
                          <input type="number" value={editingItem.data.target} onChange={e => updateEditField('target', e.target.value)} placeholder="Target" style={{...inputStyle, width: '80px'}} />
                          <input type="number" value={editingItem.data.saved} onChange={e => updateEditField('saved', e.target.value)} placeholder="Saved" style={{...inputStyle, width: '80px'}} />
                          <input type="date" value={editingItem.data.deadline} onChange={e => updateEditField('deadline', e.target.value)} style={{...inputStyle, width: '130px'}} />
                          <select value={editingItem.data.savingsFrequency} onChange={e => updateEditField('savingsFrequency', e.target.value)} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={saveEdit} style={{...btnSuccess, padding: '6px 12px', fontSize: '12px'}}>Save</button>
                          <button onClick={cancelEdit} style={{...btnDanger, padding: '6px 12px', fontSize: '12px'}}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div key={goal.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#2e1e3a' : '#faf5ff', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div>
                            <div style={{ color: theme.text, fontWeight: 600 }}>{goal.name}</div>
                            <div style={{ color: theme.textMuted, fontSize: '12px' }}>
                              ${parseFloat(goal.saved || '0').toFixed(0)} / ${parseFloat(goal.target || '0').toFixed(0)}
                              {goal.deadline && ` • by ${goal.deadline}`}
                            </div>
                            {paymentNeeded > 0 && (
                              <div style={{ color: theme.purple, fontSize: '12px', fontWeight: 600 }}>
                                Save ${paymentNeeded.toFixed(0)}/{goal.savingsFrequency} to reach goal
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: theme.purple, fontWeight: 700 }}>{progress.toFixed(0)}%</span>
                            <button onClick={() => startEdit('goal', goal)} style={{ padding: '4px 8px', background: theme.accent, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                            <button onClick={() => addGoalToCalendar(goal)} style={{ padding: '4px 8px', background: theme.purple, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>📅</button>
                            <button onClick={() => deleteGoal(goal.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>×</button>
                          </div>
                        </div>
                        <div style={{ height: '8px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: theme.purple, borderRadius: '4px' }} /></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {appMode === 'budget' && activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Monthly Income</div><div style={{ color: theme.success, fontSize: '24px', fontWeight: 700 }}>${monthlyIncome.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>Active: ${activeIncome.toFixed(0)} | Passive: ${passiveIncome.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Monthly Outgoing</div><div style={{ color: theme.danger, fontSize: '24px', fontWeight: 700 }}>${totalOutgoing.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Monthly Surplus</div><div style={{ color: monthlySurplus >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>${monthlySurplus.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>{savingsRate.toFixed(0)}% savings rate</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Net Worth</div><div style={{ color: netWorth >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>${netWorth.toFixed(0)}</div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><h3 style={{ margin: 0, color: theme.success }}>📈 Assets</h3><span style={{ color: theme.success, fontWeight: 700 }}>${totalAssets.toFixed(0)}</span></div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input placeholder="Asset name" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} style={{...inputStyle, flex: 1}} />
                  <input placeholder="Value" type="number" value={newAsset.value} onChange={e => setNewAsset({...newAsset, value: e.target.value})} style={{...inputStyle, width: '100px'}} />
                  <select value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} style={inputStyle}><option value="savings">Savings</option><option value="investment">Investment</option><option value="property">Property</option><option value="other">Other</option></select>
                  <button onClick={addAsset} style={btnSuccess}>+</button>
                </div>
                {assets.map(a => (
                  <div key={a.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ color: theme.text, fontWeight: 600 }}>{a.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{a.type}</div></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: theme.success, fontWeight: 700 }}>${parseFloat(a.value).toFixed(0)}</span><button onClick={() => deleteAsset(a.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>×</button></div>
                  </div>
                ))}
              </div>

              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><h3 style={{ margin: 0, color: theme.danger }}>📉 Liabilities</h3><span style={{ color: theme.danger, fontWeight: 700 }}>${(totalLiabilities + totalDebtBalance).toFixed(0)}</span></div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input placeholder="Liability" value={newLiability.name} onChange={e => setNewLiability({...newLiability, name: e.target.value})} style={{...inputStyle, flex: 1}} />
                  <input placeholder="Value" type="number" value={newLiability.value} onChange={e => setNewLiability({...newLiability, value: e.target.value})} style={{...inputStyle, width: '100px'}} />
                  <button onClick={addLiability} style={btnDanger}>+</button>
                </div>
                {debts.map(d => <div key={'d' + d.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text }}>💳 {d.name}</span><span style={{ color: theme.danger, fontWeight: 700 }}>${parseFloat(d.balance).toFixed(0)}</span></div>)}
                {liabilities.map(l => (
                  <div key={l.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.text }}>{l.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: theme.danger, fontWeight: 700 }}>${parseFloat(l.value).toFixed(0)}</span><button onClick={() => deleteLiability(l.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>×</button></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PATH TAB */}
        {appMode === 'budget' && activeTab === 'path' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>📍 Where You Are Now</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>💎 Net Worth</div><div style={{ color: netWorth >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 'bold' }}>${netWorth.toFixed(0)}</div></div>
                <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>📈 Surplus</div><div style={{ color: monthlySurplus >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 'bold' }}>${monthlySurplus.toFixed(0)}</div></div>
                <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>💳 Total Debt</div><div style={{ color: theme.danger, fontSize: '28px', fontWeight: 'bold' }}>${totalDebtBalance.toFixed(0)}</div></div>
                <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '8px' }}>🌴 Passive Income</div><div style={{ color: theme.success, fontSize: '28px', fontWeight: 'bold' }}>${passiveIncome.toFixed(0)}/mo</div></div>
              </div>
            </div>

            <div style={{ padding: '24px', background: 'linear-gradient(135deg, ' + theme.purple + '15, ' + theme.success + '15)', borderRadius: '16px', border: '2px solid ' + theme.purple }}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>🔥 Escape the Rat Race</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ ...cardStyle, padding: '20px' }}>
                  <h3 style={{ margin: '0 0 12px 0', color: theme.purple, fontSize: '18px' }}>🌴 Freedom Target</h3>
                  <div style={{ color: theme.text, fontSize: '14px', lineHeight: 2 }}>
                    <div>Monthly need: <strong>${fiPath.monthlyNeed.toFixed(0)}</strong></div>
                    <div>Passive income: <strong style={{ color: theme.success }}>${passiveIncome.toFixed(0)}</strong></div>
                    <div>Gap to fill: <strong style={{ color: theme.danger }}>${Math.max(0, fiPath.passiveGap).toFixed(0)}</strong></div>
                    <div>Coverage: <strong style={{ color: theme.purple }}>{fiPath.passiveCoverage.toFixed(1)}%</strong></div>
                  </div>
                  <div style={{ marginTop: '16px', height: '12px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: Math.min(fiPath.passiveCoverage, 100) + '%', height: '100%', background: 'linear-gradient(90deg, ' + theme.purple + ', ' + theme.success + ')', borderRadius: '6px' }} />
                  </div>
                </div>
                <div style={{ ...cardStyle, padding: '20px' }}>
                  <h3 style={{ margin: '0 0 12px 0', color: theme.success, fontSize: '18px' }}>🔥 FIRE Number</h3>
                  <div style={{ color: theme.text, fontSize: '14px', lineHeight: 2 }}>
                    <div>Target: <strong>${fiPath.fireNumber.toLocaleString()}</strong></div>
                    <div>Investments: <strong style={{ color: theme.success }}>${fiPath.currentInvestments.toLocaleString()}</strong></div>
                    <div>Years to FI: <strong style={{ color: theme.purple }}>{fiPath.yearsToFI >= 999 ? '∞' : fiPath.yearsToFI}</strong></div>
                  </div>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>👶 The Baby Steps</h2>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                {[
                  { step: 1, title: '$1,000 Emergency Fund', desc: 'Starter emergency fund', check: () => assets.filter(a => a.type === 'savings').reduce((s, a) => s + parseFloat(a.value || '0'), 0) >= 1000 },
                  { step: 2, title: 'Pay Off High-Interest Debt', desc: 'Debt snowball/avalanche', check: () => debts.filter(d => parseFloat(d.interestRate || '0') > 7).length === 0 },
                  { step: 3, title: '3-6 Months Emergency Fund', desc: 'Full emergency fund', check: () => assets.filter(a => a.type === 'savings').reduce((s, a) => s + parseFloat(a.value || '0'), 0) >= monthlyExpenses * 3 },
                  { step: 4, title: 'Invest 15% for Retirement', desc: 'Build wealth', check: () => false },
                  { step: 5, title: "Save for Kids' College", desc: 'Education fund', check: () => false },
                  { step: 6, title: 'Pay Off Home Early', desc: 'Mortgage freedom', check: () => false },
                  { step: 7, title: 'Build Wealth & Give', desc: 'Live generously', check: () => fiPath.passiveCoverage >= 100 }
                ].map((item) => {
                  const done = item.check()
                  const isCurrent = item.step === currentBabyStep.step
                  return (
                    <div key={item.step} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', background: done ? (darkMode ? '#1e3a32' : '#f0fdf4') : isCurrent ? (darkMode ? '#2e2a1e' : '#fefce8') : (darkMode ? '#334155' : '#f8fafc'), borderRadius: '12px', border: done ? '2px solid ' + theme.success : isCurrent ? '2px solid ' + theme.warning : '1px solid ' + theme.border }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: done ? theme.success : isCurrent ? theme.warning : theme.purple, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>{done ? '✓' : item.step}</div>
                      <div style={{ flex: 1 }}><div style={{ color: theme.text, fontWeight: 600, fontSize: '16px' }}>{item.title}</div><div style={{ color: theme.textMuted, fontSize: '13px' }}>{item.desc}</div></div>
                      <div style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: done ? theme.success : isCurrent ? theme.warning : theme.border, color: done || isCurrent ? 'white' : theme.textMuted }}>{done ? '✓ Complete' : isCurrent ? '→ Current' : 'Pending'}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* TRADING TAB */}
        {appMode === 'trading' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Total P&L</div><div style={{ color: totalPL >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 700 }}>${totalPL.toFixed(2)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Win Rate</div><div style={{ color: winRate >= 50 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 700 }}>{winRate.toFixed(1)}%</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Avg Win</div><div style={{ color: theme.success, fontSize: '28px', fontWeight: 700 }}>${avgWin.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Avg Loss</div><div style={{ color: theme.danger, fontSize: '28px', fontWeight: 700 }}>${avgLoss.toFixed(0)}</div></div>
            </div>

            {/* Forex Prop Calculator */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 16px 0', color: theme.accent, fontSize: '20px' }}>💱 Forex/CFD Prop Calculator</h2>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[{ id: 'phase1', label: 'Phase 1', color: theme.warning }, { id: 'phase2', label: 'Phase 2', color: theme.purple }, { id: 'funded', label: 'Funded', color: theme.success }].map(p => (
                  <button key={p.id} onClick={() => setForexPropPhase(p.id as any)} style={{ padding: '8px 16px', background: forexPropPhase === p.id ? p.color : 'transparent', color: forexPropPhase === p.id ? 'white' : theme.text, border: '1px solid ' + p.color, borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{p.label}</button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Account Size</label><input type="number" value={forexProp.accountSize} onChange={e => setForexProp({...forexProp, accountSize: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Profit Target %</label><input type="number" value={forexProp.profitTarget} onChange={e => setForexProp({...forexProp, profitTarget: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Max Drawdown %</label><input type="number" value={forexProp.maxDrawdown} onChange={e => setForexProp({...forexProp, maxDrawdown: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Current Balance</label><input type="number" value={forexProp.currentBalance} onChange={e => setForexProp({...forexProp, currentBalance: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ padding: '16px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Progress</div><div style={{ color: theme.success, fontSize: '24px', fontWeight: 700 }}>{forexPropResults.progressPercent.toFixed(1)}%</div></div>
                <div style={{ padding: '16px', background: darkMode ? '#2e2a1e' : '#fefce8', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Remaining</div><div style={{ color: theme.warning, fontSize: '24px', fontWeight: 700 }}>${forexPropResults.remainingProfit.toFixed(0)}</div></div>
                <div style={{ padding: '16px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Drawdown Left</div><div style={{ color: theme.danger, fontSize: '24px', fontWeight: 700 }}>${forexPropResults.drawdownRemaining.toFixed(0)}</div></div>
              </div>
            </div>

            {/* Futures Prop Calculator */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 16px 0', color: theme.warning, fontSize: '20px' }}>📊 Futures Prop Calculator</h2>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[{ id: 'evaluation', label: 'Evaluation', color: theme.warning }, { id: 'funded', label: 'Funded', color: theme.success }].map(p => (
                  <button key={p.id} onClick={() => setFuturesPropPhase(p.id as any)} style={{ padding: '8px 16px', background: futuresPropPhase === p.id ? p.color : 'transparent', color: futuresPropPhase === p.id ? 'white' : theme.text, border: '1px solid ' + p.color, borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{p.label}</button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Account Size</label><input type="number" value={futuresProp.accountSize} onChange={e => setFuturesProp({...futuresProp, accountSize: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Profit Target $</label><input type="number" value={futuresProp.profitTarget} onChange={e => setFuturesProp({...futuresProp, profitTarget: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Max Drawdown $</label><input type="number" value={futuresProp.maxDrawdown} onChange={e => setFuturesProp({...futuresProp, maxDrawdown: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Current Balance</label><input type="number" value={futuresProp.currentBalance} onChange={e => setFuturesProp({...futuresProp, currentBalance: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ padding: '16px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Progress</div><div style={{ color: theme.success, fontSize: '24px', fontWeight: 700 }}>{futuresPropResults.progressPercent.toFixed(1)}%</div></div>
                <div style={{ padding: '16px', background: darkMode ? '#2e2a1e' : '#fefce8', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Remaining</div><div style={{ color: theme.warning, fontSize: '24px', fontWeight: 700 }}>${futuresPropResults.remainingProfit.toFixed(0)}</div></div>
                <div style={{ padding: '16px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Drawdown Left</div><div style={{ color: theme.danger, fontSize: '24px', fontWeight: 700 }}>${futuresPropResults.drawdownRemaining.toFixed(0)}</div></div>
              </div>
            </div>

            {/* Compound Calculator */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 16px 0', color: theme.purple, fontSize: '20px' }}>📈 Compound Calculator</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Starting Capital</label><input type="number" value={tradingCalculator.startingCapital} onChange={e => setTradingCalculator({...tradingCalculator, startingCapital: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Monthly Add</label><input type="number" value={tradingCalculator.monthlyContribution} onChange={e => setTradingCalculator({...tradingCalculator, monthlyContribution: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Return % (Daily)</label><input type="number" value={tradingCalculator.returnRate} onChange={e => setTradingCalculator({...tradingCalculator, returnRate: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Months</label><input type="number" value={tradingCalculator.months} onChange={e => setTradingCalculator({...tradingCalculator, months: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Reinvest %</label><input type="number" value={tradingCalculator.reinvestRate} onChange={e => setTradingCalculator({...tradingCalculator, reinvestRate: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ padding: '20px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Future Value</div><div style={{ color: theme.success, fontSize: '28px', fontWeight: 700 }}>${tradingResults.futureValue.toFixed(2)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>{tradingResults.totalCalendarDays} / {tradingResults.totalTradingDays} days</div></div>
                <div style={{ padding: '20px', background: darkMode ? '#2e1e3a' : '#faf5ff', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Total Contributed</div><div style={{ color: theme.purple, fontSize: '28px', fontWeight: 700 }}>${tradingResults.totalContributed.toFixed(0)}</div></div>
                <div style={{ padding: '20px', background: darkMode ? '#2e2a1e' : '#fefce8', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Profit</div><div style={{ color: theme.warning, fontSize: '28px', fontWeight: 700 }}>${tradingResults.profit.toFixed(2)}</div></div>
              </div>
            </div>

            {/* Trade Journal */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '20px' }}>📓 Trade Journal</h2>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' as const }}>
                <input type="date" value={newTrade.date} onChange={e => setNewTrade({...newTrade, date: e.target.value})} style={inputStyle} />
                <input placeholder="Instrument" value={newTrade.instrument} onChange={e => setNewTrade({...newTrade, instrument: e.target.value})} style={{...inputStyle, width: '120px'}} />
                <select value={newTrade.direction} onChange={e => setNewTrade({...newTrade, direction: e.target.value})} style={inputStyle}><option value="long">Long</option><option value="short">Short</option></select>
                <input placeholder="Entry" type="number" value={newTrade.entryPrice} onChange={e => setNewTrade({...newTrade, entryPrice: e.target.value})} style={{...inputStyle, width: '90px'}} />
                <input placeholder="Exit" type="number" value={newTrade.exitPrice} onChange={e => setNewTrade({...newTrade, exitPrice: e.target.value})} style={{...inputStyle, width: '90px'}} />
                <input placeholder="P&L" type="number" value={newTrade.profitLoss} onChange={e => setNewTrade({...newTrade, profitLoss: e.target.value})} style={{...inputStyle, width: '90px'}} />
                <input placeholder="Notes" value={newTrade.notes} onChange={e => setNewTrade({...newTrade, notes: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '150px'}} />
                <button onClick={addTrade} style={btnPrimary}>+ Add</button>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' as const }}>
                {trades.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const, padding: '40px' }}>No trades yet. Start journaling!</p> : trades.map(trade => (
                  <div key={trade.id} style={{ padding: '12px', marginBottom: '8px', background: parseFloat(trade.profitLoss || '0') >= 0 ? (darkMode ? '#1e3a32' : '#f0fdf4') : (darkMode ? '#3a1e1e' : '#fef2f2'), borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <span style={{ color: theme.textMuted, fontSize: '13px' }}>{trade.date}</span>
                      <span style={{ color: theme.text, fontWeight: 600 }}>{trade.instrument}</span>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: trade.direction === 'long' ? theme.success + '20' : theme.danger + '20', color: trade.direction === 'long' ? theme.success : theme.danger }}>{trade.direction.toUpperCase()}</span>
                      {trade.notes && <span style={{ color: theme.textMuted, fontSize: '12px' }}>"{trade.notes}"</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: parseFloat(trade.profitLoss || '0') >= 0 ? theme.success : theme.danger, fontSize: '18px', fontWeight: 700 }}>{parseFloat(trade.profitLoss || '0') >= 0 ? '+' : ''}${parseFloat(trade.profitLoss || '0').toFixed(2)}</span>
                      <button onClick={() => deleteTrade(trade.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
