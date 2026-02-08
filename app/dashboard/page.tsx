'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useRef, useEffect } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  const [appMode, setAppMode] = useState<'budget' | 'trading' | null>(null)
  const [showModeSelector, setShowModeSelector] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'path' | 'trading' | 'guide'>('dashboard')
  const [darkMode, setDarkMode] = useState(true)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [tradingCalendarMonth, setTradingCalendarMonth] = useState(new Date())
  
  const [incomeStreams, setIncomeStreams] = useState<any[]>([])
  const [newIncome, setNewIncome] = useState({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0] })
  
  const [expenses, setExpenses] = useState<any[]>([])
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', frequency: 'monthly', category: 'other', dueDate: new Date().toISOString().split('T')[0] })
  
  const [debts, setDebts] = useState<any[]>([])
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: new Date().toISOString().split('T')[0] })
  const [payoffMethod, setPayoffMethod] = useState<'snowball' | 'avalanche'>('avalanche')
  
  const [goals, setGoals] = useState<any[]>([])
  const [newGoal, setNewGoal] = useState({ name: '', target: '', saved: '0', deadline: '', savingsFrequency: 'monthly', startDate: new Date().toISOString().split('T')[0], paymentAmount: '' })
  const [extraGoalPayment, setExtraGoalPayment] = useState('')
  const [selectedGoalForExtra, setSelectedGoalForExtra] = useState<number | null>(null)
  
  const [paidOccurrences, setPaidOccurrences] = useState<Set<string>>(new Set())
  
  const [assets, setAssets] = useState<any[]>([])
  const [newAsset, setNewAsset] = useState({ name: '', value: '', type: 'savings' })
  const [liabilities, setLiabilities] = useState<any[]>([])
  const [newLiability, setNewLiability] = useState({ name: '', value: '', type: 'loan' })
  
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [chatInput, setChatInput] = useState('')
  const [isAskingCoach, setIsAskingCoach] = useState(false)
  
  const [trades, setTrades] = useState<any[]>([])
  const [newTrade, setNewTrade] = useState({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' })

  const [expandedDay, setExpandedDay] = useState<{day: number, items: any[]} | null>(null)
  
  const [debtExtraPayment, setDebtExtraPayment] = useState<{[key: number]: {amount: string, frequency: string}}>({})
  const [showExtraInput, setShowExtraInput] = useState<number | null>(null)

  const [showPresets, setShowPresets] = useState(false)
  const [presetFrequencyOverrides, setPresetFrequencyOverrides] = useState<{[key: string]: string}>({})
  const presetBills = [
    { name: 'Rent/Mortgage', amount: '', category: 'housing', frequency: 'monthly' },
    { name: 'Electricity', amount: '', category: 'utilities', frequency: 'monthly' },
    { name: 'Gas', amount: '', category: 'utilities', frequency: 'monthly' },
    { name: 'Water', amount: '', category: 'utilities', frequency: 'quarterly' },
    { name: 'Internet', amount: '', category: 'utilities', frequency: 'monthly' },
    { name: 'Phone', amount: '', category: 'utilities', frequency: 'monthly' },
    { name: 'Car Insurance', amount: '', category: 'transport', frequency: 'monthly' },
    { name: 'Health Insurance', amount: '', category: 'health', frequency: 'monthly' },
    { name: 'Home Insurance', amount: '', category: 'housing', frequency: 'yearly' },
    { name: 'Netflix', amount: '15.99', category: 'subscriptions', frequency: 'monthly' },
    { name: 'Spotify', amount: '11.99', category: 'subscriptions', frequency: 'monthly' },
    { name: 'Disney+', amount: '13.99', category: 'subscriptions', frequency: 'monthly' },
    { name: 'Amazon Prime', amount: '14.99', category: 'subscriptions', frequency: 'monthly' },
    { name: 'YouTube Premium', amount: '13.99', category: 'subscriptions', frequency: 'monthly' },
    { name: 'Gym Membership', amount: '', category: 'health', frequency: 'monthly' },
    { name: 'Groceries', amount: '', category: 'food', frequency: 'weekly' },
    { name: 'Petrol/Fuel', amount: '', category: 'transport', frequency: 'weekly' },
    { name: 'Public Transport', amount: '', category: 'transport', frequency: 'weekly' },
    { name: 'Council Rates', amount: '', category: 'housing', frequency: 'quarterly' },
  ]
  const [customPresets, setCustomPresets] = useState<any[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [csvTransactions, setCsvTransactions] = useState<any[]>([])
  const [showCsvImport, setShowCsvImport] = useState(false)

  const expenseCategories = ['housing', 'utilities', 'food', 'transport', 'entertainment', 'shopping', 'health', 'subscriptions', 'income', 'transfer', 'other']
  
  const categoryKeywords: {[key: string]: string[]} = {
    housing: ['rent', 'mortgage', 'strata', 'body corp', 'council', 'rates'],
    utilities: ['electricity', 'electric', 'power', 'gas', 'water', 'internet', 'phone', 'telstra', 'optus', 'vodafone', 'nbn'],
    food: ['woolworths', 'coles', 'aldi', 'iga', 'grocery', 'groceries', 'uber eats', 'doordash', 'menulog', 'mcdonald', 'kfc', 'hungry jack', 'subway', 'restaurant', 'cafe', 'coffee'],
    transport: ['fuel', 'petrol', 'shell', 'bp', 'caltex', 'ampol', '7-eleven', 'uber', 'didi', 'ola', 'taxi', 'parking', 'toll', 'rego', 'registration', 'car insurance'],
    entertainment: ['netflix', 'spotify', 'disney', 'stan', 'binge', 'amazon prime', 'youtube', 'apple music', 'cinema', 'movie', 'ticketek', 'ticketmaster', 'gaming', 'steam', 'playstation', 'xbox'],
    shopping: ['amazon', 'ebay', 'kmart', 'target', 'big w', 'jb hi-fi', 'officeworks', 'bunnings', 'ikea', 'clothing', 'fashion'],
    health: ['pharmacy', 'chemist', 'doctor', 'medical', 'dentist', 'hospital', 'health insurance', 'medibank', 'bupa', 'hcf', 'gym', 'fitness'],
    subscriptions: ['subscription', 'membership', 'monthly fee', 'annual fee'],
    income: ['salary', 'wage', 'pay', 'deposit', 'transfer from', 'refund', 'cashback'],
    transfer: ['transfer', 'tfr', 'internal']
  }

  const autoCategorize = (description: string): string => {
    const lowerDesc = description.toLowerCase()
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => lowerDesc.includes(kw))) return category
    }
    return 'other'
  }

  const [goalCalculator, setGoalCalculator] = useState({ targetAmount: '', currentAmount: '', monthlyContribution: '', interestRate: '', years: '' })
  const [calculatorResult, setCalculatorResult] = useState<any>(null)
  const [calculating, setCalculating] = useState(false)

  const [forexProp, setForexProp] = useState({
    phase: 'phase1', accountSize: '100000',
    phase1DailyDD: '5', phase1MaxDD: '10', phase1Target: '10', phase1MinDays: '4', phase1MaxDays: '30',
    phase2DailyDD: '5', phase2MaxDD: '10', phase2Target: '5', phase2MinDays: '4', phase2MaxDays: '60',
    fundedDailyDD: '5', fundedMaxDD: '10',
    currentBalance: '100000', tradingDays: '0',
    riskPerTrade: '1', tradesPerDay: '2', winRate: '55', avgRR: '1.5', profitSplit: '80'
  })
  const [forexPropResults, setForexPropResults] = useState<any>(null)

  const [futuresProp, setFuturesProp] = useState({
    phase: 'evaluation', accountSize: '50000',
    evalTrailingDD: '2500', evalProfitTarget: '3000', evalMinDays: '7', evalDrawdownType: 'trailing',
    paTrailingDD: '2500', paProfitTarget: '3000', paMinDays: '7', paDrawdownType: 'eod',
    fundedTrailingDD: '2500', fundedDrawdownType: 'eod',
    currentBalance: '50000', highWaterMark: '50000', tradingDays: '0', contractLimit: '10',
    riskPerTrade: '200', tradesPerDay: '3', winRate: '50', avgWin: '300', avgLoss: '200', profitSplit: '90'
  })
  const [futuresPropResults, setFuturesPropResults] = useState<any>(null)

  const [tradingCalculator, setTradingCalculator] = useState({ 
    startingCapital: '10000', monthlyContribution: '500', returnRate: '1', returnPeriod: 'daily',
    years: '0', months: '0', days: '0',
    includeDays: ['M', 'T', 'W', 'T2', 'F'],
    reinvestRate: '100', riskPerTrade: '2', winRate: '55', riskReward: '1.5'
  })
  const [tradingResults, setTradingResults] = useState<any>(null)
  const [calculatingTrading, setCalculatingTrading] = useState(false)

  // Gamification state
  const [xpPoints, setXpPoints] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [lastLevelShown, setLastLevelShown] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [achievements, setAchievements] = useState<string[]>([])
  const [newAchievement, setNewAchievement] = useState<string | null>(null)

  // What-If Scenario state
  const [showWhatIf, setShowWhatIf] = useState(false)
  const [whatIfExtra, setWhatIfExtra] = useState('500')
  const [whatIfReturn, setWhatIfReturn] = useState('7')
  const [whatIfYears, setWhatIfYears] = useState('10')

  // Quest Board state
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null)

  // Guide tab state
  const [expandedGuideSection, setExpandedGuideSection] = useState<string | null>(null)
  const [expandedGuideItem, setExpandedGuideItem] = useState<string | null>(null)
  // ===== GAMIFICATION SYSTEM =====
  const getLevel = (xp: number) => {
    if (xp >= 5000) return { level: 10, title: '🏆 Financial Legend', color: '#fbbf24', next: 99999 }
    if (xp >= 3500) return { level: 9, title: '💎 Diamond Hands', color: '#60a5fa', next: 5000 }
    if (xp >= 2500) return { level: 8, title: '🔥 On Fire', color: '#f97316', next: 3500 }
    if (xp >= 1800) return { level: 7, title: '⚡ Power Saver', color: '#a78bfa', next: 2500 }
    if (xp >= 1200) return { level: 6, title: '🌟 Rising Star', color: '#34d399', next: 1800 }
    if (xp >= 800) return { level: 5, title: '🎯 Goal Crusher', color: '#f472b6', next: 1200 }
    if (xp >= 500) return { level: 4, title: '💪 Getting Strong', color: '#818cf8', next: 800 }
    if (xp >= 250) return { level: 3, title: '📈 On Track', color: '#2dd4bf', next: 500 }
    if (xp >= 100) return { level: 2, title: '🌱 Seedling', color: '#86efac', next: 250 }
    return { level: 1, title: '🐣 Just Started', color: '#94a3b8', next: 100 }
  }
  const currentLevel = getLevel(xpPoints)
  const prevLevelXP = [0,0,100,250,500,800,1200,1800,2500,3500,5000][currentLevel.level] || 0
  const xpProgress = currentLevel.next < 99999 ? ((xpPoints - prevLevelXP) / (currentLevel.next - prevLevelXP)) * 100 : 100

  const awardXP = (amount: number) => {
    setXpPoints(prev => {
      const newXP = prev + amount
      const oldLevel = getLevel(prev).level
      const newLevel = getLevel(newXP).level
      if (newLevel > oldLevel && newLevel > lastLevelShown) {
        setShowLevelUp(true)
        setLastLevelShown(newLevel)
        setTimeout(() => setShowLevelUp(false), 3000)
      }
      return newXP
    })
  }
  const triggerConfetti = () => { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 2500) }
  const unlockAchievement = (id: string, name: string) => {
    if (!achievements.includes(id)) {
      setAchievements(prev => [...prev, id]); setNewAchievement(name); awardXP(50); triggerConfetti()
      setTimeout(() => setNewAchievement(null), 3500)
    }
  }
  useEffect(() => {
    if (goals.length >= 1) unlockAchievement('first_goal', '🎯 First Goal Set!')
    if (goals.length >= 5) unlockAchievement('five_goals', '🏅 Goal Machine!')
    if (debts.length >= 1) unlockAchievement('debt_tracked', '💳 Debt Awareness')
    if (goals.some(g => parseFloat(g.saved||'0') >= parseFloat(g.target||'1'))) unlockAchievement('goal_complete', '✅ Goal Achieved!')
    if (debts.some(d => parseFloat(d.balance||'0') <= 0)) unlockAchievement('debt_cleared', '🎉 Debt Destroyed!')
    if (paidOccurrences.size >= 5) unlockAchievement('five_payments', '💸 Payment Pro!')
    if (paidOccurrences.size >= 20) unlockAchievement('twenty_payments', '⚡ Payment Master!')
    if (incomeStreams.length >= 3) unlockAchievement('income_diversified', '💰 Income Diversified')
  }, [goals, debts, paidOccurrences, incomeStreams])

  const getGoalRank = (progress: number) => {
    if (progress >= 100) return { emoji: '👑', label: 'COMPLETE', color: '#fbbf24' }
    if (progress >= 75) return { emoji: '🔥', label: 'Almost There!', color: '#f97316' }
    if (progress >= 50) return { emoji: '⚡', label: 'Halfway Hero', color: '#a78bfa' }
    if (progress >= 25) return { emoji: '🌟', label: 'Making Progress', color: '#34d399' }
    return { emoji: '🚀', label: 'Just Started', color: '#60a5fa' }
  }
  const getDebtBoss = (balance: number, originalBalance: number) => {
    const hp = originalBalance > 0 ? (balance / originalBalance) * 100 : 100
    if (hp <= 0) return { emoji: '💀', label: 'DEFEATED', color: '#10b981' }
    if (hp <= 25) return { emoji: '😵', label: 'Nearly Dead', color: '#34d399' }
    if (hp <= 50) return { emoji: '😰', label: 'Weakening', color: '#fbbf24' }
    if (hp <= 75) return { emoji: '😤', label: 'Hurt', color: '#f97316' }
    return { emoji: '👹', label: 'Full HP', color: '#ef4444' }
  }

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

  const getOccurrencesInMonth = (startDate: string, frequency: string, targetMonth: number, targetYear: number): number => {
    const start = new Date(startDate); start.setHours(0, 0, 0, 0)
    const monthStart = new Date(targetYear, targetMonth, 1)
    const monthEnd = new Date(targetYear, targetMonth + 1, 0)
    if (start > monthEnd) return 0
    if (frequency === 'monthly') return 1
    if (frequency === 'yearly') return start.getMonth() === targetMonth ? 1 : 0
    if (frequency === 'quarterly') { const monthsDiff = (targetYear - start.getFullYear()) * 12 + (targetMonth - start.getMonth()); return monthsDiff >= 0 && monthsDiff % 3 === 0 ? 1 : 0 }
    if (frequency === 'once') return start.getMonth() === targetMonth && start.getFullYear() === targetYear ? 1 : 0
    const intervalDays = frequency === 'weekly' ? 7 : 14
    let count = 0; let currentDate = new Date(start)
    while (currentDate < monthStart) currentDate.setDate(currentDate.getDate() + intervalDays)
    while (currentDate <= monthEnd) { count++; currentDate.setDate(currentDate.getDate() + intervalDays) }
    return count
  }

  const calculateMonthlyTotals = (month: number, year: number) => {
    const incomeTotal = incomeStreams.reduce((sum, inc) => sum + (parseFloat(inc.amount || '0') * getOccurrencesInMonth(inc.startDate, inc.frequency, month, year)), 0)
    const expenseTotal = expenses.filter(e => !e.targetDebtId && !e.targetGoalId).reduce((sum, exp) => sum + (parseFloat(exp.amount || '0') * getOccurrencesInMonth(exp.dueDate, exp.frequency, month, year)), 0)
    const debtTotal = debts.reduce((sum, debt) => sum + (parseFloat(debt.minPayment || '0') * getOccurrencesInMonth(debt.paymentDate, debt.frequency, month, year)), 0)
    return { incomeTotal, expenseTotal, debtTotal, total: incomeTotal - expenseTotal - debtTotal }
  }
  const currentMonthTotals = calculateMonthlyTotals(calendarMonth.getMonth(), calendarMonth.getFullYear())

  const convertToMonthly = (amount: number, frequency: string) => {
    if (frequency === 'weekly') return amount * (52 / 12)
    if (frequency === 'fortnightly') return amount * (26 / 12)
    if (frequency === 'yearly') return amount / 12
    if (frequency === 'quarterly') return amount / 3
    if (frequency === 'once') return 0
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
  const totalPL = trades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)
  const winRate = trades.length > 0 ? (trades.filter(t => parseFloat(t.profitLoss || '0') > 0).length / trades.length) * 100 : 0

  const getAlerts = () => {
    const alertsList: any[] = []
    const today = new Date(); today.setHours(0, 0, 0, 0)
    expenses.forEach(exp => {
      if (exp.targetDebtId || exp.targetGoalId) return
      const dueDate = new Date(exp.dueDate); dueDate.setHours(0, 0, 0, 0)
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntilDue < 0) alertsList.push({ severity: 'danger', message: exp.name + ' is ' + Math.abs(daysUntilDue) + ' days overdue', amount: exp.amount })
      else if (daysUntilDue <= 3) alertsList.push({ severity: 'warning', message: exp.name + ' due in ' + daysUntilDue + ' days', amount: exp.amount })
    })
    return alertsList.sort((a, b) => (a.severity === 'danger' ? -1 : 1))
  }
  const alerts = getAlerts()

  const getDaysInMonth = () => {
    const year = calendarMonth.getFullYear(); const month = calendarMonth.getMonth()
    return { firstDay: new Date(year, month, 1).getDay(), daysInMonth: new Date(year, month + 1, 0).getDate(), month, year }
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
        id: 'expense-' + exp.id, sourceId: exp.id, 
        sourceType: exp.targetDebtId ? 'extraDebt' : exp.targetGoalId ? 'extraGoal' : 'expense',
        targetDebtId: exp.targetDebtId, targetGoalId: exp.targetGoalId,
        name: '💸 ' + exp.name, amount: exp.amount, dueDate: exp.dueDate, frequency: exp.frequency, type: 'expense' 
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
      const itemDay = itemDate.getDate(); const itemMonth = itemDate.getMonth(); const itemYear = itemDate.getFullYear()
      const currentDate = new Date(year, month, day)
      const startDate = new Date(item.dueDate); startDate.setHours(0,0,0,0); currentDate.setHours(0,0,0,0)
      
      let shouldShow = false
      if (itemDay === day && itemMonth === month && itemYear === year) { shouldShow = true }
      else if (item.frequency && item.frequency !== 'once' && currentDate >= startDate) {
        if (item.frequency === 'weekly') { const daysDiff = Math.round((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)); shouldShow = daysDiff >= 0 && daysDiff % 7 === 0 }
        else if (item.frequency === 'fortnightly') { const daysDiff = Math.round((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)); shouldShow = daysDiff >= 0 && daysDiff % 14 === 0 }
        else if (item.frequency === 'monthly') { const daysInCurrentMonth = new Date(year, month + 1, 0).getDate(); shouldShow = itemDay > daysInCurrentMonth ? day === daysInCurrentMonth : day === itemDay }
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
      if (sourceType === 'goal' && sourceId) setGoals(prev => prev.map(g => g.id === sourceId ? { ...g, saved: Math.max(0, parseFloat(g.saved || '0') - paymentAmount).toFixed(2) } : g))
      else if (sourceType === 'debt' && sourceId) setDebts(prev => prev.map(d => d.id === sourceId ? { ...d, balance: (parseFloat(d.balance || '0') + paymentAmount).toFixed(2) } : d))
      else if (sourceType === 'extraDebt' && targetDebtId) setDebts(prev => prev.map(d => d.id === targetDebtId ? { ...d, balance: (parseFloat(d.balance || '0') + paymentAmount).toFixed(2) } : d))
      else if (sourceType === 'extraGoal' && targetGoalId) setGoals(prev => prev.map(g => g.id === targetGoalId ? { ...g, saved: Math.max(0, parseFloat(g.saved || '0') - paymentAmount).toFixed(2) } : g))
    } else {
      newPaid.add(itemId)
      awardXP(10)
      if (sourceType === 'goal' && sourceId) setGoals(prev => prev.map(g => g.id === sourceId ? { ...g, saved: (parseFloat(g.saved || '0') + paymentAmount).toFixed(2) } : g))
      else if (sourceType === 'debt' && sourceId) setDebts(prev => prev.map(d => d.id === sourceId ? { ...d, balance: Math.max(0, parseFloat(d.balance || '0') - paymentAmount).toFixed(2) } : d))
      else if (sourceType === 'extraDebt' && targetDebtId) setDebts(prev => prev.map(d => d.id === targetDebtId ? { ...d, balance: Math.max(0, parseFloat(d.balance || '0') - paymentAmount).toFixed(2) } : d))
      else if (sourceType === 'extraGoal' && targetGoalId) setGoals(prev => prev.map(g => g.id === targetGoalId ? { ...g, saved: (parseFloat(g.saved || '0') + paymentAmount).toFixed(2) } : g))
    }
    setPaidOccurrences(newPaid)
  }

  const addIncome = () => { if (!newIncome.name || !newIncome.amount) return; setIncomeStreams([...incomeStreams, { ...newIncome, id: Date.now() }]); setNewIncome({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0] }); awardXP(15) }
  const deleteIncome = (id: number) => setIncomeStreams(incomeStreams.filter(i => i.id !== id))
  const addExpense = () => { if (!newExpense.name || !newExpense.amount) return; setExpenses([...expenses, { ...newExpense, id: Date.now() }]); setNewExpense({ name: '', amount: '', frequency: 'monthly', category: 'other', dueDate: new Date().toISOString().split('T')[0] }); awardXP(10) }
  const deleteExpense = (id: number) => setExpenses(expenses.filter(e => e.id !== id))
  const addDebt = () => { if (!newDebt.name || !newDebt.balance) return; setDebts([...debts, { ...newDebt, id: Date.now(), originalBalance: newDebt.balance }]); setNewDebt({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: new Date().toISOString().split('T')[0] }); awardXP(20) }
  const deleteDebt = (id: number) => setDebts(debts.filter(d => d.id !== id))
  const addGoal = () => { if (!newGoal.name || !newGoal.target) return; setGoals([...goals, { ...newGoal, saved: newGoal.saved || '0', paymentAmount: newGoal.paymentAmount || '', id: Date.now() }]); setNewGoal({ name: '', target: '', saved: '0', deadline: '', savingsFrequency: 'monthly', startDate: new Date().toISOString().split('T')[0], paymentAmount: '' }); awardXP(25) }
  const deleteGoal = (id: number) => setGoals(goals.filter(g => g.id !== id))
  const addAsset = () => { if (!newAsset.name || !newAsset.value) return; setAssets([...assets, { ...newAsset, id: Date.now() }]); setNewAsset({ name: '', value: '', type: 'savings' }) }
  const deleteAsset = (id: number) => setAssets(assets.filter(a => a.id !== id))
  const addLiability = () => { if (!newLiability.name || !newLiability.value) return; setLiabilities([...liabilities, { ...newLiability, id: Date.now() }]); setNewLiability({ name: '', value: '', type: 'loan' }) }
  const deleteLiability = (id: number) => setLiabilities(liabilities.filter(l => l.id !== id))
  const addTrade = () => { if (!newTrade.instrument) return; setTrades([...trades, { ...newTrade, id: Date.now() }].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())); setNewTrade({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' }) }

  const addPresetBill = (preset: any) => {
    const frequency = presetFrequencyOverrides[preset.name] || preset.frequency
    const amount = prompt(`Enter amount for ${preset.name} (${frequency}):`, preset.amount || '')
    if (!amount) return
    const dueDate = prompt('When is this due? (YYYY-MM-DD):', new Date().toISOString().split('T')[0])
    if (!dueDate) return
    setExpenses([...expenses, { id: Date.now(), name: preset.name, amount, frequency, category: preset.category, dueDate }])
    awardXP(10)
  }

  const addCustomPreset = () => {
    const name = prompt('Preset name:'); if (!name) return
    const category = prompt('Category (housing, utilities, food, transport, entertainment, shopping, health, subscriptions, other):', 'other')
    const frequency = prompt('Frequency (weekly, fortnightly, monthly, quarterly, yearly):', 'monthly')
    setCustomPresets([...customPresets, { name, amount: '', category: category || 'other', frequency: frequency || 'monthly' }])
  }
  const deleteCustomPreset = (index: number) => setCustomPresets(customPresets.filter((_, i) => i !== index))

  const addGoalAndPlanToCalendar = (goal: any) => {
    let paymentAmount = goal.paymentAmount ? parseFloat(goal.paymentAmount) : 0
    let startDate = goal.startDate || new Date().toISOString().split('T')[0]
    const frequency = goal.savingsFrequency || 'monthly'
    if (paymentAmount <= 0) {
      const calcPayment = calculateGoalPayment(goal)
      const amountInput = prompt(`How much to save per ${frequency} for "${goal.name}"?`, calcPayment > 0 ? calcPayment.toFixed(2) : '')
      if (!amountInput || parseFloat(amountInput) <= 0) return
      paymentAmount = parseFloat(amountInput)
    }
    const dateInput = prompt('When should payments start? (YYYY-MM-DD):', startDate)
    if (!dateInput) return
    startDate = dateInput
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, paymentAmount: paymentAmount.toFixed(2), startDate, savingsFrequency: frequency } : g))
    awardXP(20); triggerConfetti()
    alert(`${goal.name} is now on your calendar!\n\n$${paymentAmount.toFixed(2)} per ${frequency}\nStarting ${startDate}\n\nMark payments as done on the calendar!`)
  }

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      if (lines.length < 2) { alert('CSV file appears empty'); return }
      const header = lines[0].toLowerCase()
      const hasHeader = header.includes('date') || header.includes('description') || header.includes('amount')
      const dataLines = hasHeader ? lines.slice(1) : lines
      const transactions: any[] = []
      dataLines.forEach((line, idx) => {
        const parts: string[] = []; let current = ''; let inQuotes = false
        for (const char of line) { if (char === '"') inQuotes = !inQuotes; else if (char === ',' && !inQuotes) { parts.push(current.trim()); current = '' } else current += char }
        parts.push(current.trim())
        if (parts.length >= 2) {
          let date = '', description = '', amount = 0
          const datePatterns = [/\d{4}-\d{2}-\d{2}/, /\d{2}\/\d{2}\/\d{4}/, /\d{1,2}\/\d{1,2}\/\d{2,4}/]
          for (let i = 0; i < parts.length; i++) { for (const pattern of datePatterns) { if (pattern.test(parts[i])) { date = parts[i]; break } } if (date) break }
          for (let i = parts.length - 1; i >= 0; i--) { const cleaned = parts[i].replace(/[$,]/g, '').trim(); const num = parseFloat(cleaned); if (!isNaN(num) && num !== 0) { amount = num; break } }
          let longestText = ''
          for (const part of parts) { const cleaned = part.replace(/["']/g, '').trim(); if (cleaned.length > longestText.length && !datePatterns.some(p => p.test(cleaned)) && isNaN(parseFloat(cleaned.replace(/[$,]/g, '')))) longestText = cleaned }
          description = longestText || `Transaction ${idx + 1}`
          if (date || amount !== 0) { transactions.push({ id: Date.now() + idx, date: date || new Date().toISOString().split('T')[0], description, amount: Math.abs(amount), category: autoCategorize(description), isExpense: amount < 0, selected: amount < 0 }) }
        }
      })
      if (transactions.length === 0) { alert('Could not parse any transactions'); return }
      setCsvTransactions(transactions); setShowCsvImport(true)
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const importSelectedTransactions = () => {
    const selExp = csvTransactions.filter(t => t.selected && t.isExpense)
    const selInc = csvTransactions.filter(t => t.selected && !t.isExpense)
    if (selExp.length > 0) setExpenses(prev => [...prev, ...selExp.map(t => ({ id: Date.now() + Math.random(), name: t.description, amount: t.amount.toString(), frequency: 'once', category: t.category, dueDate: t.date }))])
    if (selInc.length > 0) setIncomeStreams(prev => [...prev, ...selInc.map(t => ({ id: Date.now() + Math.random(), name: t.description, amount: t.amount.toString(), frequency: 'once', type: 'active', startDate: t.date }))])
    alert(`Imported ${selExp.length} expenses and ${selInc.length} income items`)
    setShowCsvImport(false); setCsvTransactions([])
  }
  const updateCsvTransaction = (id: number, field: string, value: any) => setCsvTransactions(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))

  const addExtraPaymentToDebt = (debtId: number) => {
    const extra = debtExtraPayment[debtId]
    if (!extra || !extra.amount || parseFloat(extra.amount) <= 0) { alert('Please enter an extra payment amount'); return }
    const debt = debts.find(d => d.id === debtId); if (!debt) return
    const paymentDate = prompt('When should extra payment start? (YYYY-MM-DD):', new Date().toISOString().split('T')[0]); if (!paymentDate) return
    setExpenses([...expenses, { id: Date.now(), name: 'Extra → ' + debt.name, amount: extra.amount, frequency: extra.frequency, dueDate: paymentDate, targetDebtId: debt.id }])
    awardXP(30)
    alert('Power-up added! $' + extra.amount + '/' + extra.frequency + ' → ' + debt.name)
    setDebtExtraPayment(prev => ({ ...prev, [debtId]: { amount: '', frequency: 'monthly' } })); setShowExtraInput(null)
  }

  const addExtraGoalPayment = (goalId: number) => {
    if (!extraGoalPayment || parseFloat(extraGoalPayment) <= 0) { alert('Please enter an extra payment amount'); return }
    const goal = goals.find(g => g.id === goalId); if (!goal) return
    const paymentDate = prompt('When should extra goal payment start? (YYYY-MM-DD):', new Date().toISOString().split('T')[0]); if (!paymentDate) return
    setExpenses([...expenses, { id: Date.now(), name: 'Extra → ' + goal.name, amount: extraGoalPayment, frequency: 'monthly', dueDate: paymentDate, targetGoalId: goalId }])
    awardXP(25)
    alert('Boost added! $' + extraGoalPayment + '/month → ' + goal.name)
    setExtraGoalPayment(''); setSelectedGoalForExtra(null)
  }

  const calculateSingleDebtPayoff = (debt: any, includeExtras: boolean = true) => {
    const balance = parseFloat(debt.balance || '0')
    const interestRate = parseFloat(debt.interestRate || '0')
    const minPayment = convertToMonthly(parseFloat(debt.minPayment || '0'), debt.frequency || 'monthly')
    const debtExtras = includeExtras ? expenses.filter(exp => exp.targetDebtId === debt.id).reduce((sum, exp) => sum + convertToMonthly(parseFloat(exp.amount || '0'), exp.frequency), 0) : 0
    const totalPayment = minPayment + debtExtras
    const monthlyInterest = (balance * interestRate / 100) / 12
    if (totalPayment <= 0 || totalPayment < monthlyInterest * 0.99) return { monthsToPayoff: -1, totalInterestPaid: 0, error: true, extraPayments: debtExtras }
    let remainingBalance = balance, totalInterestPaid = 0, monthsToPayoff = 0
    while (remainingBalance > 0 && monthsToPayoff < 600) { monthsToPayoff++; const interest = (remainingBalance * interestRate / 100) / 12; totalInterestPaid += interest; remainingBalance = Math.max(0, remainingBalance + interest - totalPayment) }
    return { monthsToPayoff, totalInterestPaid, error: false, extraPayments: debtExtras }
  }

  const calculateTotalDebtPayoff = () => {
    let maxMonths = 0, totalInterest = 0, hasError = false
    debts.forEach(debt => { const result = calculateSingleDebtPayoff(debt, true); if (result.error) hasError = true; else { maxMonths = Math.max(maxMonths, result.monthsToPayoff); totalInterest += result.totalInterestPaid } })
    return { maxMonths, totalInterest, hasError }
  }

  const calculateGoal = () => {
    setCalculating(true)
    const target = parseFloat(goalCalculator.targetAmount || '0'); const current = parseFloat(goalCalculator.currentAmount || '0')
    const monthly = parseFloat(goalCalculator.monthlyContribution || '0'); const rate = parseFloat(goalCalculator.interestRate || '0') / 100 / 12
    const years = parseFloat(goalCalculator.years || '0')
    let months = 0, balance = current
    if (years > 0) { months = years * 12; for (let i = 0; i < months; i++) balance = balance * (1 + rate) + monthly }
    else if (monthly > 0) { while (balance < target && months < 600) { balance = balance * (1 + rate) + monthly; months++ } }
    const totalContributed = current + (monthly * months)
    setCalculatorResult({ months, futureValue: balance, totalContributed, interestEarned: balance - totalContributed, totalMonths: months })
    setCalculating(false)
  }
  const calculateForexProp = () => {
    const phase = forexProp.phase; const accountSize = parseFloat(forexProp.accountSize || '0')
    let dailyDD: number, maxDD: number, profitTarget: number, minDays: number, maxDays: number
    if (phase === 'phase1') { dailyDD = parseFloat(forexProp.phase1DailyDD || '0') / 100; maxDD = parseFloat(forexProp.phase1MaxDD || '0') / 100; profitTarget = parseFloat(forexProp.phase1Target || '0') / 100; minDays = parseInt(forexProp.phase1MinDays || '0'); maxDays = parseInt(forexProp.phase1MaxDays || '30') }
    else if (phase === 'phase2') { dailyDD = parseFloat(forexProp.phase2DailyDD || '0') / 100; maxDD = parseFloat(forexProp.phase2MaxDD || '0') / 100; profitTarget = parseFloat(forexProp.phase2Target || '0') / 100; minDays = parseInt(forexProp.phase2MinDays || '0'); maxDays = parseInt(forexProp.phase2MaxDays || '60') }
    else { dailyDD = parseFloat(forexProp.fundedDailyDD || '0') / 100; maxDD = parseFloat(forexProp.fundedMaxDD || '0') / 100; profitTarget = 0; minDays = 0; maxDays = 999 }
    const currentBalance = parseFloat(forexProp.currentBalance || '0'); const tradingDays = parseInt(forexProp.tradingDays || '0')
    const riskPerTrade = parseFloat(forexProp.riskPerTrade || '0') / 100; const tradesPerDay = parseInt(forexProp.tradesPerDay || '0')
    const winRateVal = parseFloat(forexProp.winRate || '0') / 100; const avgRR = parseFloat(forexProp.avgRR || '0'); const profitSplit = parseFloat(forexProp.profitSplit || '0') / 100
    const dailyDrawdownAmount = accountSize * dailyDD; const maxDrawdownAmount = accountSize * maxDD; const profitTargetAmount = accountSize * profitTarget
    const currentProfit = currentBalance - accountSize; const profitRemaining = phase === 'funded' ? 0 : profitTargetAmount - currentProfit
    const daysRemaining = phase === 'funded' ? 999 : maxDays - tradingDays
    const drawdownUsed = Math.max(0, accountSize - currentBalance); const drawdownRemaining = maxDrawdownAmount - drawdownUsed
    const dailyProfitNeeded = (daysRemaining > 0 && phase !== 'funded') ? profitRemaining / daysRemaining : 0
    const dailyProfitPercent = currentBalance > 0 ? (dailyProfitNeeded / currentBalance) * 100 : 0
    const maxLossesToday = dailyDrawdownAmount / (accountSize * riskPerTrade); const maxLossesTotal = drawdownRemaining / (accountSize * riskPerTrade)
    const riskPerTradeAmount = accountSize * riskPerTrade; const expectedWin = riskPerTradeAmount * avgRR
    const expectancy = (winRateVal * expectedWin) - ((1 - winRateVal) * riskPerTradeAmount)
    const dailyExpectedPL = expectancy * tradesPerDay
    const daysToTarget = (dailyExpectedPL > 0 && phase !== 'funded') ? profitRemaining / dailyExpectedPL : 0
    const profitProgress = phase === 'funded' ? 100 : profitTargetAmount > 0 ? (currentProfit / profitTargetAmount) * 100 : 0
    const dayProgress = minDays > 0 ? (tradingDays / minDays) * 100 : 100
    const onTrack = phase === 'funded' || dailyExpectedPL >= dailyProfitNeeded
    const potentialPayout = phase === 'funded' ? currentProfit * profitSplit : profitTargetAmount * profitSplit
    setForexPropResults({ phase, accountSize, dailyDrawdownAmount, maxDrawdownAmount, profitTargetAmount, currentProfit, profitRemaining, daysRemaining, drawdownUsed, drawdownRemaining, dailyProfitNeeded, dailyProfitPercent, maxLossesToday, maxLossesTotal, riskPerTradeAmount, expectancy, dailyExpectedPL, daysToTarget: Math.ceil(daysToTarget), profitProgress, dayProgress, onTrack, potentialPayout, minDaysComplete: tradingDays >= minDays, minDays, maxDays })
  }

  const calculateFuturesProp = () => {
    const phase = futuresProp.phase; const accountSize = parseFloat(futuresProp.accountSize || '0')
    let trailingDD: number, profitTarget: number, minDays: number, drawdownType: string
    if (phase === 'evaluation') { trailingDD = parseFloat(futuresProp.evalTrailingDD || '0'); profitTarget = parseFloat(futuresProp.evalProfitTarget || '0'); minDays = parseInt(futuresProp.evalMinDays || '0'); drawdownType = futuresProp.evalDrawdownType }
    else if (phase === 'pa') { trailingDD = parseFloat(futuresProp.paTrailingDD || '0'); profitTarget = parseFloat(futuresProp.paProfitTarget || '0'); minDays = parseInt(futuresProp.paMinDays || '0'); drawdownType = futuresProp.paDrawdownType }
    else { trailingDD = parseFloat(futuresProp.fundedTrailingDD || '0'); profitTarget = 0; minDays = 0; drawdownType = futuresProp.fundedDrawdownType }
    const currentBalance = parseFloat(futuresProp.currentBalance || '0'); const highWaterMark = parseFloat(futuresProp.highWaterMark || '0')
    const tradingDays = parseInt(futuresProp.tradingDays || '0'); const contractLimit = parseInt(futuresProp.contractLimit || '0')
    const riskPerTrade = parseFloat(futuresProp.riskPerTrade || '0'); const tradesPerDay = parseInt(futuresProp.tradesPerDay || '0')
    const winRateVal = parseFloat(futuresProp.winRate || '0') / 100; const avgWin = parseFloat(futuresProp.avgWin || '0'); const avgLoss = parseFloat(futuresProp.avgLoss || '0'); const profitSplit = parseFloat(futuresProp.profitSplit || '0') / 100
    const currentProfit = currentBalance - accountSize; const profitRemaining = phase === 'funded' ? 0 : profitTarget - currentProfit
    let drawdownThreshold: number, drawdownRemaining: number
    if (drawdownType === 'trailing') {
      const maxBalance = Math.max(highWaterMark, currentBalance); drawdownThreshold = maxBalance - trailingDD
      drawdownThreshold = Math.max(drawdownThreshold, accountSize - trailingDD)
      if (highWaterMark >= accountSize + trailingDD) drawdownThreshold = accountSize
      drawdownRemaining = currentBalance - drawdownThreshold
    } else { drawdownThreshold = accountSize - trailingDD; drawdownRemaining = currentBalance - drawdownThreshold }
    const maxLossesBeforeBlow = Math.floor(drawdownRemaining / riskPerTrade)
    const expectancy = (winRateVal * avgWin) - ((1 - winRateVal) * avgLoss); const dailyExpectedPL = expectancy * tradesPerDay
    const daysToTarget = (dailyExpectedPL > 0 && phase !== 'funded') ? profitRemaining / dailyExpectedPL : 0
    const profitProgress = phase === 'funded' ? 100 : profitTarget > 0 ? (currentProfit / profitTarget) * 100 : 0
    const potentialPayout = phase === 'funded' ? currentProfit * profitSplit : profitTarget * profitSplit
    const lockedAtBreakeven = highWaterMark >= accountSize + trailingDD
    const safetyMargin = riskPerTrade > 0 ? (drawdownRemaining / riskPerTrade).toFixed(1) : '0'
    setFuturesPropResults({ phase, accountSize, trailingDD, profitTarget, currentBalance, currentProfit, profitRemaining, drawdownThreshold, drawdownRemaining, maxLossesBeforeBlow, expectancy, dailyExpectedPL, daysToTarget: Math.ceil(daysToTarget), profitProgress, dayProgress: minDays > 0 ? (tradingDays / minDays) * 100 : 100, potentialPayout, lockedAtBreakeven, safetyMargin, minDaysComplete: tradingDays >= minDays, minDays, contractLimit, drawdownType, riskPerTrade })
  }

  const calculateTradingCompounding = () => {
    setCalculatingTrading(true)
    const startCap = parseFloat(tradingCalculator.startingCapital || '0'); const monthlyAdd = parseFloat(tradingCalculator.monthlyContribution || '0')
    const returnRate = parseFloat(tradingCalculator.returnRate || '0') / 100; const returnPeriod = tradingCalculator.returnPeriod
    const reinvestRate = parseFloat(tradingCalculator.reinvestRate || '100') / 100
    const yrs = parseInt(tradingCalculator.years || '0'); const mos = parseInt(tradingCalculator.months || '0'); const dys = parseInt(tradingCalculator.days || '0')
    const riskPct = parseFloat(tradingCalculator.riskPerTrade || '0'); const winRt = parseFloat(tradingCalculator.winRate || '0') / 100; const rr = parseFloat(tradingCalculator.riskReward || '0')
    const includeDays = tradingCalculator.includeDays
    const totalCalendarDays = (yrs * 365) + (mos * 30) + dys
    const tradingDaysPerWeek = includeDays.length; const tradingDaysRatio = tradingDaysPerWeek / 7
    const totalTradingDays = Math.round(totalCalendarDays * tradingDaysRatio)
    const tradingDaysPerYear = Math.round(365 * tradingDaysRatio)
    let ratePerTradingDay: number
    if (returnPeriod === 'daily') ratePerTradingDay = returnRate
    else if (returnPeriod === 'weekly') ratePerTradingDay = returnRate / tradingDaysPerWeek
    else if (returnPeriod === 'monthly') ratePerTradingDay = returnRate / Math.round(30 * tradingDaysRatio)
    else ratePerTradingDay = returnRate / tradingDaysPerYear
    const effectiveRate = ratePerTradingDay * reinvestRate
    const tradingDaysPerMonth = Math.round(30 * tradingDaysRatio)
    const contributionPerTradingDay = tradingDaysPerMonth > 0 ? monthlyAdd / tradingDaysPerMonth : 0
    let balance = startCap; const yearlyProgress: any[] = []; let currentYear = 0; let daysInCurrentYear = 0
    for (let day = 1; day <= totalTradingDays; day++) {
      balance = balance * (1 + effectiveRate) + contributionPerTradingDay; daysInCurrentYear++
      if (daysInCurrentYear >= tradingDaysPerYear || day === totalTradingDays) {
        currentYear++; const totalMonths = currentYear * 12
        const contributed = startCap + (monthlyAdd * Math.min(totalMonths, yrs * 12 + mos))
        yearlyProgress.push({ year: currentYear, value: balance, contributed, profit: balance - contributed }); daysInCurrentYear = 0
      }
    }
    const totalMonths = yrs * 12 + mos; const totalContributed = startCap + (monthlyAdd * totalMonths)
    const expectancy = (winRt * rr * riskPct) - ((1 - winRt) * riskPct)
    setTradingResults({ futureValue: balance, totalContributed, profit: balance - totalContributed, yearlyProgress, totalCalendarDays, totalTradingDays, tradingDaysPerYear, tradeStats: { expectedWinRate: winRt * 100, avgWin: rr * riskPct, avgLoss: riskPct, expectancy, tradesPerYear: 100 } })
    setCalculatingTrading(false)
  }

  const fiPath = (() => {
    const monthlyNeed = totalOutgoing; const passiveGap = monthlyNeed - passiveIncome
    const passiveCoverage = monthlyNeed > 0 ? (passiveIncome / monthlyNeed) * 100 : 0
    const fireNumber = (monthlyNeed * 12) * 25
    const currentInvestments = assets.filter(a => a.type === 'investment').reduce((sum, a) => sum + parseFloat(a.value || '0'), 0)
    const yearsToFI = monthlySurplus > 0 ? Math.ceil((fireNumber - currentInvestments) / (monthlySurplus * 6 * 12)) : 999
    return { monthlyNeed, passiveGap, passiveCoverage, fireNumber, currentInvestments, yearsToFI }
  })()

  const askBudgetCoach = async () => {
    if (!chatInput.trim()) return
    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]); setChatInput(''); setIsAskingCoach(true)
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
        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, textDecoration: item.isPaid ? 'line-through' : 'none' }}>{item.name}</div>
        <div style={{ fontSize: compact ? '9px' : '11px', color: '#666' }}>${parseFloat(item.amount || '0').toFixed(0)}</div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); togglePaid(item.id, item.sourceType, item.sourceId, parseFloat(item.amount || '0'), item.targetDebtId, item.targetGoalId) }} style={{ padding: compact ? '4px 8px' : '6px 12px', background: item.isPaid ? '#6b7280' : (item.sourceType === 'extraDebt' || item.sourceType === 'extraGoal' || item.sourceType === 'goal') ? '#8b5cf6' : '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: compact ? '10px' : '12px', fontWeight: 700, flexShrink: 0 }}>{item.isPaid ? '✓' : 'PAY'}</button>
    </div>
  )
  if (showModeSelector) {
    return (
      <div style={{ minHeight: '100vh', background: darkMode ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        {xpPoints > 0 && (
          <div style={{ position: 'fixed' as const, top: '20px', right: '20px', padding: '12px 20px', background: theme.cardBg, borderRadius: '12px', border: '2px solid ' + currentLevel.color, zIndex: 50 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><span style={{ fontSize: '16px' }}>{currentLevel.title}</span><span style={{ color: currentLevel.color, fontWeight: 700, fontSize: '14px' }}>Lv.{currentLevel.level}</span></div>
            <div style={{ width: '120px', height: '6px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: Math.min(xpProgress, 100) + '%', height: '100%', background: currentLevel.color, borderRadius: '3px' }} /></div>
            <div style={{ fontSize: '10px', color: theme.textMuted, marginTop: '2px' }}>{xpPoints} XP</div>
          </div>
        )}
        <div style={{ textAlign: 'center' as const, marginBottom: '48px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: 800, color: theme.text, margin: '0 0 16px 0' }}>Welcome{user?.firstName ? `, ${user.firstName}` : ''}! 👋</h1>
          <p style={{ fontSize: '20px', color: theme.textMuted, margin: 0 }}>What are we working on today?</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', maxWidth: '800px', width: '100%' }}>
          <button onClick={() => { setAppMode('budget'); setShowModeSelector(false); setActiveTab('dashboard') }} style={{ padding: '40px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '24px', border: 'none', cursor: 'pointer', textAlign: 'left' as const, boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
            <h2 style={{ color: 'white', fontSize: '28px', fontWeight: 700, margin: '0 0 12px 0' }}>Budget Mode</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', margin: 0, lineHeight: 1.5 }}>Track spending, crush debt, build savings, and feel calm about your money</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>{['Income', 'Expenses', 'Debts', 'Goals', 'Calendar'].map(t => <span key={t} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', color: 'white' }}>{t}</span>)}</div>
          </button>
          <button onClick={() => { setAppMode('trading'); setShowModeSelector(false); setActiveTab('trading') }} style={{ padding: '40px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '24px', border: 'none', cursor: 'pointer', textAlign: 'left' as const, boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
            <h2 style={{ color: 'white', fontSize: '28px', fontWeight: 700, margin: '0 0 12px 0' }}>Trading Mode</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', margin: 0, lineHeight: 1.5 }}>Plan prop challenges, track performance, and execute your trading strategy</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>{['Forex Props', 'Futures Props', 'Journal', 'Calculator'].map(t => <span key={t} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', color: 'white' }}>{t}</span>)}</div>
          </button>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} style={{ marginTop: '32px', padding: '12px 24px', background: 'transparent', border: '2px solid ' + theme.border, borderRadius: '12px', color: theme.textMuted, cursor: 'pointer', fontSize: '14px' }}>{darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      {showConfetti && (<div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' as const, zIndex: 9999 }}>{Array.from({ length: 50 }).map((_, i) => (<div key={i} style={{ position: 'absolute' as const, left: Math.random()*100+'%', top: '-10px', width: Math.random()*10+5+'px', height: Math.random()*10+5+'px', background: ['#f59e0b','#10b981','#8b5cf6','#ef4444','#3b82f6','#f472b6'][Math.floor(Math.random()*6)], borderRadius: Math.random()>0.5?'50%':'2px', animation: `confettiFall ${Math.random()*2+1.5}s ease-in forwards`, animationDelay: Math.random()*0.5+'s' }} />))}<style>{`@keyframes confettiFall { 0%{transform:translateY(-10px) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }`}</style></div>)}
      {showLevelUp && (<div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998, pointerEvents: 'none' as const }}><div style={{ padding: '32px 48px', background: 'linear-gradient(135deg, '+currentLevel.color+', '+theme.purple+')', borderRadius: '24px', textAlign: 'center' as const, animation: 'levelUp 3s ease forwards', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}><div style={{ fontSize: '64px', marginBottom: '12px' }}>🎉</div><div style={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>LEVEL UP!</div><div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '22px', fontWeight: 600, marginTop: '8px' }}>{currentLevel.title}</div></div><style>{`@keyframes levelUp { 0%{transform:scale(.5);opacity:0} 20%{transform:scale(1.1);opacity:1} 80%{transform:scale(1);opacity:1} 100%{transform:scale(.8);opacity:0} }`}</style></div>)}
      {newAchievement && (<div style={{ position: 'fixed' as const, top: '80px', right: '20px', zIndex: 9997, padding: '16px 24px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', animation: 'slideIn 0.3s ease' }}><div style={{ color: '#1e293b', fontWeight: 700, fontSize: '14px' }}>🏆 Achievement Unlocked!</div><div style={{ color: '#1e293b', fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>{newAchievement}</div><div style={{ color: '#92400e', fontSize: '11px', marginTop: '2px' }}>+50 XP</div><style>{`@keyframes slideIn { 0%{transform:translateX(100px);opacity:0} 100%{transform:translateX(0);opacity:1} }`}</style></div>)}

      {expandedDay && (<div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setExpandedDay(null)}><div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>📅 {calendarMonth.toLocaleDateString('en-US', { month: 'long' })} {expandedDay.day}</h3><button onClick={() => setExpandedDay(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.textMuted }}>×</button></div><div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>{expandedDay.items.length === 0 ? <div style={{ color: theme.textMuted, textAlign: 'center' as const, padding: '20px' }}>No items</div> : expandedDay.items.map(item => renderCalendarItem(item, false))}</div></div></div>)}

      {showCsvImport && (<div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowCsvImport(false)}><div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '800px', width: '95%', maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}><h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>📤 Import Bank Transactions</h3><button onClick={() => setShowCsvImport(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.textMuted }}>×</button></div><div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}><button onClick={() => setCsvTransactions(prev => prev.map(t => ({ ...t, selected: t.isExpense })))} style={{ ...btnPrimary, padding: '8px 16px', fontSize: '12px' }}>Select Expenses</button><button onClick={() => setCsvTransactions(prev => prev.map(t => ({ ...t, selected: true })))} style={{ ...btnPrimary, padding: '8px 16px', fontSize: '12px', background: theme.purple }}>Select All</button><button onClick={() => setCsvTransactions(prev => prev.map(t => ({ ...t, selected: false })))} style={{ ...btnPrimary, padding: '8px 16px', fontSize: '12px', background: theme.textMuted }}>Select None</button></div><div style={{ maxHeight: '400px', overflowY: 'auto' as const, marginBottom: '20px' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ borderBottom: '2px solid ' + theme.border }}>{['✓','Date','Description','Amount','Category','Type'].map(h => <th key={h} style={{ padding: '8px', textAlign: 'left' as const, color: theme.textMuted, fontSize: '12px' }}>{h}</th>)}</tr></thead><tbody>{csvTransactions.map(t => (<tr key={t.id} style={{ borderBottom: '1px solid ' + theme.border, background: t.selected ? (darkMode ? '#1e3a5f' : '#eff6ff') : 'transparent' }}><td style={{ padding: '8px' }}><input type="checkbox" checked={t.selected} onChange={(e) => updateCsvTransaction(t.id, 'selected', e.target.checked)} /></td><td style={{ padding: '8px', color: theme.text, fontSize: '12px' }}>{t.date}</td><td style={{ padding: '8px', color: theme.text, fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{t.description}</td><td style={{ padding: '8px', color: t.isExpense ? theme.danger : theme.success, fontSize: '12px', fontWeight: 600 }}>{t.isExpense ? '-' : '+'}${t.amount.toFixed(2)}</td><td style={{ padding: '8px' }}><select value={t.category} onChange={(e) => updateCsvTransaction(t.id, 'category', e.target.value)} style={{ ...inputStyle, padding: '4px 8px', fontSize: '11px' }}>{expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></td><td style={{ padding: '8px' }}><button onClick={() => updateCsvTransaction(t.id, 'isExpense', !t.isExpense)} style={{ padding: '4px 8px', background: t.isExpense ? theme.danger : theme.success, color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>{t.isExpense ? 'Expense' : 'Income'}</button></td></tr>))}</tbody></table></div><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: theme.textMuted, fontSize: '13px' }}>{csvTransactions.filter(t => t.selected).length} of {csvTransactions.length} selected</span><div style={{ display: 'flex', gap: '8px' }}><button onClick={() => setShowCsvImport(false)} style={{ ...btnPrimary, background: theme.textMuted }}>Cancel</button><button onClick={importSelectedTransactions} style={btnSuccess}>Import Selected</button></div></div></div></div>)}

      <header style={{ padding: '16px 24px', background: theme.cardBg, borderBottom: '1px solid ' + theme.border, position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setShowModeSelector(true)} style={{ padding: '10px 16px', background: appMode === 'budget' ? theme.success : theme.warning, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>{appMode === 'budget' ? '💰' : '📈'} {appMode === 'budget' ? 'Budget' : 'Trading'} ▼</button>
            <h1 style={{ margin: 0, color: theme.text, fontSize: '24px', fontWeight: 'bold' }}>Premium Finance</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: darkMode ? '#334155' : '#f1f5f9', borderRadius: '10px', border: '2px solid ' + currentLevel.color }}>
            <span style={{ fontSize: '13px' }}>{currentLevel.title}</span>
            <div style={{ width: '60px', height: '6px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: Math.min(xpProgress, 100) + '%', height: '100%', background: currentLevel.color, borderRadius: '3px' }} /></div>
            <span style={{ color: currentLevel.color, fontSize: '11px', fontWeight: 700 }}>{xpPoints}XP</span>
          </div>
          <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
            {[{ id: 'dashboard', label: '📊 Dashboard', color: theme.accent }, { id: 'overview', label: '💎 Overview', color: theme.purple }, { id: 'path', label: '🎯 Path', color: theme.success }, { id: 'trading', label: '📈 Trading', color: theme.warning }, { id: 'guide', label: '📖 Guide', color: '#f472b6' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{ padding: '8px 16px', background: activeTab === tab.id ? tab.color : 'transparent', color: activeTab === tab.id ? 'white' : theme.textMuted, border: activeTab === tab.id ? 'none' : '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>{tab.label}</button>
            ))}
          </nav>
          <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '8px 14px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.textMuted, fontSize: '14px' }}>{darkMode ? '☀️' : '🌙'}</button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            {/* This Month Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ padding: '20px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '16px' }}><div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Income This Month</div><div style={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>${currentMonthTotals.incomeTotal.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '16px' }}><div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Expenses This Month</div><div style={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>${currentMonthTotals.expenseTotal.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: '16px' }}><div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Debt Payments</div><div style={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>${currentMonthTotals.debtTotal.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: currentMonthTotals.total >= 0 ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'linear-gradient(135deg, #ef4444, #b91c1c)', borderRadius: '16px' }}><div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Net This Month</div><div style={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>${currentMonthTotals.total.toFixed(0)}</div></div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {[{ label: 'Avg Monthly In', value: '$' + monthlyIncome.toFixed(0), color: theme.success }, { label: 'Avg Monthly Out', value: '$' + totalOutgoing.toFixed(0), color: theme.danger }, { label: 'Avg Surplus', value: '$' + monthlySurplus.toFixed(0), color: monthlySurplus >= 0 ? theme.success : theme.danger }, { label: 'Total Debt', value: '$' + totalDebtBalance.toFixed(0), color: theme.danger }].map((s, i) => (
                <div key={i} style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border, textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>{s.label}</div><div style={{ color: s.color, fontSize: '22px', fontWeight: 700 }}>{s.value}</div></div>
              ))}
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 12px 0', color: theme.warning, fontSize: '16px' }}>⚠️ Alerts</h3>
                {alerts.map((a, i) => (<div key={i} style={{ padding: '10px 14px', background: a.severity === 'danger' ? theme.danger + '15' : theme.warning + '15', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: theme.text, fontSize: '14px' }}>{a.severity === 'danger' ? '🔴' : '🟡'} {a.message}</span><span style={{ color: a.severity === 'danger' ? theme.danger : theme.warning, fontWeight: 700 }}>${a.amount}</span></div>))}
              </div>
            )}

            {/* Income */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.success, fontSize: '18px' }}>💰 Income Streams</h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' as const }}>
                <input type="text" placeholder="Name" value={newIncome.name} onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 100px' }} />
                <input type="number" placeholder="Amount $" value={newIncome.amount} onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
                <select value={newIncome.frequency} onChange={(e) => setNewIncome({ ...newIncome, frequency: e.target.value })} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                <select value={newIncome.type} onChange={(e) => setNewIncome({ ...newIncome, type: e.target.value })} style={inputStyle}><option value="active">🏃 Active</option><option value="passive">🌴 Passive</option></select>
                <input type="date" value={newIncome.startDate} onChange={(e) => setNewIncome({ ...newIncome, startDate: e.target.value })} style={inputStyle} />
                <button onClick={addIncome} style={btnSuccess}>Add</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                {incomeStreams.map(inc => (<div key={inc.id} style={{ padding: '12px 14px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><span style={{ color: theme.text, fontWeight: 600 }}>{inc.type === 'passive' ? '🌴' : '🏃'} {inc.name}</span><span style={{ color: theme.textMuted, marginLeft: '8px', fontSize: '12px' }}>${inc.amount}/{inc.frequency} → ${convertToMonthly(parseFloat(inc.amount), inc.frequency).toFixed(0)}/mo</span></div><button onClick={() => deleteIncome(inc.id)} style={{ padding: '6px 12px', background: theme.danger, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Delete</button></div>))}
              </div>
            </div>

            {/* Expenses */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: theme.accent, fontSize: '18px' }}>💸 Expenses & Bills</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setShowPresets(!showPresets)} style={{ padding: '6px 14px', background: showPresets ? theme.purple : 'transparent', color: showPresets ? 'white' : theme.textMuted, border: '1px solid ' + theme.border, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>📋 Presets</button>
                  <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCsvUpload} style={{ display: 'none' }} />
                  <button onClick={() => fileInputRef.current?.click()} style={{ padding: '6px 14px', background: 'transparent', color: theme.textMuted, border: '1px solid ' + theme.border, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>📤 CSV</button>
                </div>
              </div>
              {showPresets && (
                <div style={{ padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><span style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>Quick Add Presets</span><button onClick={addCustomPreset} style={{ padding: '4px 10px', background: theme.purple, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>+ Custom</button></div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px', maxHeight: '300px', overflowY: 'auto' as const }}>
                    {[...presetBills, ...customPresets].map((preset, idx) => {
                      const isCustom = idx >= presetBills.length
                      const freq = presetFrequencyOverrides[preset.name] || preset.frequency
                      return (
                        <div key={preset.name + idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button onClick={() => addPresetBill({ ...preset, frequency: freq })} style={{ flex: 1, padding: '8px 12px', background: darkMode ? '#1e293b' : 'white', border: '1px solid ' + theme.border, borderRadius: '6px', cursor: 'pointer', textAlign: 'left' as const, color: theme.text, fontSize: '13px' }}>{preset.name}{preset.amount ? ` ($${preset.amount})` : ''}</button>
                          <select value={freq} onChange={(e) => setPresetFrequencyOverrides(prev => ({ ...prev, [preset.name]: e.target.value }))} style={{ padding: '6px', background: theme.input, color: theme.text, border: '1px solid ' + theme.inputBorder, borderRadius: '4px', fontSize: '11px', width: '55px' }}><option value="weekly">W</option><option value="fortnightly">FN</option><option value="monthly">M</option><option value="quarterly">Q</option><option value="yearly">Y</option></select>
                          {isCustom && <button onClick={() => deleteCustomPreset(idx - presetBills.length)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>✕</button>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' as const }}>
                <input type="text" placeholder="Expense name" value={newExpense.name} onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 100px' }} />
                <input type="number" placeholder="Amount $" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
                <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} style={inputStyle}>{expenseCategories.filter(c => c !== 'income' && c !== 'transfer').map(c => <option key={c} value={c}>{c}</option>)}</select>
                <select value={newExpense.frequency} onChange={(e) => setNewExpense({ ...newExpense, frequency: e.target.value })} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select>
                <input type="date" value={newExpense.dueDate} onChange={(e) => setNewExpense({ ...newExpense, dueDate: e.target.value })} style={inputStyle} />
                <button onClick={addExpense} style={btnPrimary}>Add</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                {expenses.filter(e => !e.targetDebtId && !e.targetGoalId).map(exp => (<div key={exp.id} style={{ padding: '12px 14px', background: darkMode ? '#1e293b' : '#eff6ff', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><span style={{ color: theme.text, fontWeight: 600 }}>{exp.name}</span><span style={{ color: theme.textMuted, marginLeft: '8px', fontSize: '12px' }}>${exp.amount}/{exp.frequency} • {exp.category}</span></div><button onClick={() => deleteExpense(exp.id)} style={{ padding: '6px 12px', background: theme.danger, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Delete</button></div>))}
              </div>
            </div>

            {/* Calendar */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <button onClick={prevMonth} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text }}>← Prev</button>
                <h3 style={{ margin: 0, color: theme.text, fontSize: '18px' }}>{calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={nextMonth} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text }}>Next →</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} style={{ padding: '8px', textAlign: 'center' as const, color: theme.textMuted, fontWeight: 600, fontSize: '12px' }}>{d}</div>)}
                {(() => {
                  const { firstDay, daysInMonth, month, year } = getDaysInMonth()
                  const today = new Date(); const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year
                  const cells: any[] = []
                  for (let i = 0; i < firstDay; i++) cells.push(<div key={'empty-' + i} />)
                  for (let day = 1; day <= daysInMonth; day++) {
                    const items = getCalendarItemsForDay(day)
                    const unpaidCount = items.filter(i => !i.isPaid).length
                    const isToday = isCurrentMonth && today.getDate() === day
                    cells.push(
                      <div key={day} onClick={() => setExpandedDay({ day, items })} style={{ padding: '6px', minHeight: '80px', background: isToday ? (darkMode ? '#1e3a5f' : '#eff6ff') : (darkMode ? '#1e293b' : '#fafafa'), borderRadius: '8px', cursor: 'pointer', border: isToday ? '2px solid ' + theme.accent : '1px solid ' + theme.border, position: 'relative' as const, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ color: isToday ? theme.accent : theme.text, fontWeight: isToday ? 700 : 500, fontSize: '13px' }}>{day}</span>
                          {unpaidCount > 0 && <span style={{ background: theme.success, color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>{unpaidCount}</span>}
                        </div>
                        {items.slice(0, 2).map(item => renderCalendarItem(item, true))}
                        {items.length > 2 && <div style={{ fontSize: '10px', color: theme.textMuted, textAlign: 'center' as const }}>+{items.length - 2} more</div>}
                      </div>
                    )
                  }
                  return cells
                })()}
              </div>
            </div>
            {/* ===== DEBT BOSS BATTLES ===== */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>⚔️ Debt Boss Battles</h2>
                {debts.length > 0 && (<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: theme.textMuted, fontSize: '12px' }}>Strategy:</span><button onClick={() => setPayoffMethod('avalanche')} style={{ padding: '4px 10px', background: payoffMethod === 'avalanche' ? theme.danger : 'transparent', color: payoffMethod === 'avalanche' ? 'white' : theme.text, border: '1px solid '+theme.border, borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>🏔️ Avalanche</button><button onClick={() => setPayoffMethod('snowball')} style={{ padding: '4px 10px', background: payoffMethod === 'snowball' ? theme.accent : 'transparent', color: payoffMethod === 'snowball' ? 'white' : theme.text, border: '1px solid '+theme.border, borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>⛄ Snowball</button></div>)}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' as const, padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
                <input type="text" placeholder="Boss name" value={newDebt.name} onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 100px' }} />
                <input type="number" placeholder="HP $" value={newDebt.balance} onChange={(e) => setNewDebt({ ...newDebt, balance: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
                <input type="number" placeholder="%" value={newDebt.interestRate} onChange={(e) => setNewDebt({ ...newDebt, interestRate: e.target.value })} style={{ ...inputStyle, width: '60px' }} />
                <input type="number" placeholder="Min hit" value={newDebt.minPayment} onChange={(e) => setNewDebt({ ...newDebt, minPayment: e.target.value })} style={{ ...inputStyle, width: '70px' }} />
                <input type="date" value={newDebt.paymentDate} onChange={(e) => setNewDebt({ ...newDebt, paymentDate: e.target.value })} style={inputStyle} />
                <select value={newDebt.frequency} onChange={(e) => setNewDebt({ ...newDebt, frequency: e.target.value })} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                <button onClick={addDebt} style={btnDanger}>⚔️ Add Boss</button>
              </div>
              {debts.map(debt => {
                const originalBal = parseFloat(debt.originalBalance || debt.balance || '0'); const currentBal = parseFloat(debt.balance || '0')
                const boss = getDebtBoss(currentBal, originalBal); const healthPct = originalBal > 0 ? (currentBal / originalBal) * 100 : 100; const damageDone = 100 - healthPct; const isDefeated = currentBal <= 0
                const payoffWith = calculateSingleDebtPayoff(debt, true); const payoffWithout = calculateSingleDebtPayoff(debt, false)
                const debtExtras = expenses.filter(exp => exp.targetDebtId === debt.id); const currentExtra = debtExtraPayment[debt.id] || { amount: '', frequency: 'monthly' }
                return (<div key={debt.id} style={{ padding: '20px', background: isDefeated ? 'linear-gradient(135deg, '+theme.success+'20, '+theme.success+'10)' : (darkMode ? 'linear-gradient(135deg, #3a1e1e, #2d1e1e)' : 'linear-gradient(135deg, #fef2f2, #fff1f2)'), borderRadius: '16px', border: isDefeated ? '2px solid '+theme.success : '2px solid '+boss.color+'40', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ fontSize: '36px', filter: isDefeated ? 'grayscale(1)' : 'none' }}>{boss.emoji}</div><div><div style={{ color: theme.text, fontWeight: 700, fontSize: '18px', textDecoration: isDefeated ? 'line-through' : 'none' }}>{debt.name}</div><div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}><span style={{ padding: '2px 8px', background: boss.color+'30', color: boss.color, borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>{boss.label}</span><span style={{ color: theme.textMuted, fontSize: '12px' }}>{debt.interestRate}% APR • ${debt.minPayment}/{debt.frequency}</span></div></div></div>
                    <div style={{ textAlign: 'right' as const }}><div style={{ color: isDefeated ? theme.success : theme.danger, fontSize: '24px', fontWeight: 800 }}>${currentBal.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>of ${originalBal.toFixed(0)} HP</div></div>
                  </div>
                  <div style={{ marginBottom: '16px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: theme.textMuted, fontSize: '11px' }}>❤️ BOSS HP</span><span style={{ color: theme.success, fontSize: '11px', fontWeight: 600 }}>🗡️ {damageDone.toFixed(1)}% damage</span></div><div style={{ width: '100%', height: '14px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '7px', overflow: 'hidden' }}><div style={{ width: healthPct + '%', height: '100%', background: `linear-gradient(to right, ${boss.color}, ${healthPct > 50 ? '#ef4444' : '#f59e0b'})`, borderRadius: '7px', transition: 'width 0.5s ease' }} /></div></div>
                  <div style={{ display: 'grid', gridTemplateColumns: debtExtras.length > 0 ? '1fr 1fr' : '1fr', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ padding: '10px', background: darkMode ? '#1e293b' : '#fff', borderRadius: '8px', fontSize: '12px' }}><div style={{ color: theme.textMuted, marginBottom: '4px' }}>⏱️ Without power-ups:</div>{payoffWithout.error ? <div style={{ color: theme.danger }}>⚠️ Attack too weak!</div> : <div style={{ color: theme.text }}><span style={{ fontWeight: 600 }}>{Math.floor(payoffWithout.monthsToPayoff / 12)}y {payoffWithout.monthsToPayoff % 12}m</span><span style={{ color: theme.danger, marginLeft: '8px' }}>${payoffWithout.totalInterestPaid.toFixed(0)} shield</span></div>}</div>
                    {debtExtras.length > 0 && <div style={{ padding: '10px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '8px', fontSize: '12px' }}><div style={{ color: theme.success, marginBottom: '4px' }}>⚡ With power-ups:</div>{payoffWith.error ? <div style={{ color: theme.warning }}>Still not enough!</div> : <div style={{ color: theme.text }}><span style={{ fontWeight: 600 }}>{Math.floor(payoffWith.monthsToPayoff / 12)}y {payoffWith.monthsToPayoff % 12}m</span><span style={{ color: theme.success, marginLeft: '8px' }}>${payoffWith.totalInterestPaid.toFixed(0)} shield</span></div>}</div>}
                  </div>
                  {debtExtras.length > 0 && <div style={{ marginBottom: '12px' }}><div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px' }}>⚡ Power-ups:</div>{debtExtras.map(exp => (<div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: theme.purple+'20', borderRadius: '4px', fontSize: '11px', marginBottom: '2px' }}><span style={{ color: theme.purple }}>⚡ ${exp.amount}/{exp.frequency}</span><button onClick={() => deleteExpense(exp.id)} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '10px' }}>✕</button></div>))}</div>}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {showExtraInput === debt.id ? (<><input type="number" placeholder="Power $" value={currentExtra.amount} onChange={(e) => setDebtExtraPayment(prev => ({ ...prev, [debt.id]: { ...currentExtra, amount: e.target.value } }))} style={{ ...inputStyle, width: '70px', padding: '6px 10px', fontSize: '12px' }} /><select value={currentExtra.frequency} onChange={(e) => setDebtExtraPayment(prev => ({ ...prev, [debt.id]: { ...currentExtra, frequency: e.target.value } }))} style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }}><option value="weekly">Weekly</option><option value="fortnightly">FN</option><option value="monthly">Monthly</option></select><button onClick={() => addExtraPaymentToDebt(debt.id)} style={{ ...btnPurple, padding: '6px 10px', fontSize: '11px' }}>⚡ Add</button><button onClick={() => setShowExtraInput(null)} style={{ ...btnDanger, padding: '6px 10px', fontSize: '11px' }}>✕</button></>) : (<><button onClick={() => { setShowExtraInput(debt.id); setDebtExtraPayment(prev => ({ ...prev, [debt.id]: { amount: '', frequency: 'monthly' } })) }} style={{ ...btnPurple, padding: '8px 14px', fontSize: '12px', flex: 1 }}>⚡ Add Power-Up</button><button onClick={() => deleteDebt(debt.id)} style={{ ...btnDanger, padding: '8px 14px', fontSize: '12px' }}>🗑️</button></>)}
                  </div>
                </div>)
              })}
              {debts.length > 0 && (() => { const payoff = calculateTotalDebtPayoff(); return (<div style={{ padding: '16px', background: 'linear-gradient(135deg, '+theme.purple+'20, '+theme.accent+'20)', borderRadius: '12px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '16px' }}><div style={{ textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Total Bosses</div><div style={{ color: theme.text, fontSize: '20px', fontWeight: 700 }}>{debts.length}</div></div><div style={{ textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>All Defeated In</div><div style={{ color: payoff.hasError ? theme.danger : theme.success, fontSize: '20px', fontWeight: 700 }}>{payoff.hasError ? '⚠️' : Math.floor(payoff.maxMonths/12)+'y '+payoff.maxMonths%12+'m'}</div></div><div style={{ textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Total Shield</div><div style={{ color: theme.danger, fontSize: '20px', fontWeight: 700 }}>${payoff.totalInterest.toFixed(0)}</div></div></div>) })()}
            </div>

            {/* ===== GOALS QUESTS ===== */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>🎯 Savings Quests</h2>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' as const, padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
                <input type="text" placeholder="Quest name" value={newGoal.name} onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 100px' }} />
                <input type="number" placeholder="Target $" value={newGoal.target} onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
                <input type="number" placeholder="Saved $" value={newGoal.saved} onChange={(e) => setNewGoal({ ...newGoal, saved: e.target.value })} style={{ ...inputStyle, width: '80px' }} />
                <input type="number" placeholder="Per payment $" value={newGoal.paymentAmount} onChange={(e) => setNewGoal({ ...newGoal, paymentAmount: e.target.value })} style={{ ...inputStyle, width: '100px' }} />
                <select value={newGoal.savingsFrequency} onChange={(e) => setNewGoal({ ...newGoal, savingsFrequency: e.target.value })} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                <input type="date" placeholder="Deadline" value={newGoal.deadline} onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} style={inputStyle} />
                <input type="date" value={newGoal.startDate} onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })} style={inputStyle} />
                <button onClick={addGoal} style={btnPurple}>🎯 Add Quest</button>
              </div>
              {goals.length === 0 ? <div style={{ color: theme.textMuted, textAlign: 'center' as const, padding: '40px' }}>No quests yet!</div> : goals.map(goal => {
                const progress = (parseFloat(goal.saved || '0') / parseFloat(goal.target || '1')) * 100; const isComplete = progress >= 100
                const payment = goal.paymentAmount ? parseFloat(goal.paymentAmount) : calculateGoalPayment(goal)
                const monthsToGoal = calculateMonthsToGoal(goal); const rank = getGoalRank(progress)
                const isOnCalendar = goal.startDate && (goal.paymentAmount || goal.deadline)
                const goalExtras = expenses.filter(exp => exp.targetGoalId === goal.id)
                return (<div key={goal.id} style={{ padding: '20px', background: isComplete ? 'linear-gradient(135deg, '+theme.success+'20, #fbbf2420)' : (darkMode ? '#334155' : '#faf5ff'), borderRadius: '16px', border: isComplete ? '2px solid #fbbf24' : '2px solid '+rank.color+'40', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ fontSize: '32px' }}>{rank.emoji}</div><div><div style={{ color: theme.text, fontWeight: 700, fontSize: '18px' }}>{goal.name}</div><div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}><span style={{ padding: '2px 8px', background: rank.color+'30', color: rank.color, borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>{rank.label}</span>{isOnCalendar && <span style={{ padding: '2px 8px', background: theme.success+'30', color: theme.success, borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>📅 On Calendar</span>}</div></div></div>
                    <div style={{ textAlign: 'right' as const }}><div style={{ color: isComplete ? '#fbbf24' : theme.text, fontSize: '22px', fontWeight: 800 }}>${parseFloat(goal.saved||'0').toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>of ${parseFloat(goal.target||'0').toFixed(0)}</div></div>
                  </div>
                  <div style={{ marginBottom: '16px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: rank.color, fontSize: '12px', fontWeight: 700 }}>{Math.min(progress, 100).toFixed(1)}%</span>{!isComplete && payment > 0 && <span style={{ color: theme.textMuted, fontSize: '11px' }}>${payment.toFixed(2)}/{goal.savingsFrequency} • {monthsToGoal}mo left</span>}</div><div style={{ width: '100%', height: '14px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '7px', overflow: 'hidden' }}><div style={{ width: Math.min(progress, 100) + '%', height: '100%', background: isComplete ? 'linear-gradient(to right, #fbbf24, #f59e0b)' : `linear-gradient(to right, ${rank.color}, ${rank.color}dd)`, borderRadius: '7px', transition: 'width 0.5s ease' }} /></div>{isComplete && <div style={{ textAlign: 'center' as const, marginTop: '8px', color: '#fbbf24', fontSize: '14px', fontWeight: 700 }}>🎉 QUEST COMPLETE! 🎉</div>}</div>
                  {goalExtras.length > 0 && <div style={{ marginBottom: '12px' }}><div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px' }}>⚡ Boosts:</div>{goalExtras.map(exp => (<div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: theme.purple+'20', borderRadius: '4px', fontSize: '11px', marginBottom: '2px' }}><span style={{ color: theme.purple }}>⚡ ${exp.amount}/{exp.frequency}</span><button onClick={() => deleteExpense(exp.id)} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '10px' }}>✕</button></div>))}</div>}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                    {!isComplete && selectedGoalForExtra === goal.id ? (<><input type="number" placeholder="Extra $" value={extraGoalPayment} onChange={(e) => setExtraGoalPayment(e.target.value)} style={{ ...inputStyle, width: '80px', padding: '6px 10px' }} /><button onClick={() => addExtraGoalPayment(goal.id)} style={{ ...btnPurple, padding: '6px 12px', fontSize: '11px' }}>⚡ Boost</button><button onClick={() => setSelectedGoalForExtra(null)} style={{ ...btnDanger, padding: '6px 10px', fontSize: '11px' }}>✕</button></>) : (<>{!isComplete && <button onClick={() => addGoalAndPlanToCalendar(goal)} style={{ padding: '8px 14px', background: isOnCalendar ? theme.textMuted : 'linear-gradient(135deg, '+theme.success+', #059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>{isOnCalendar ? '✅ On Calendar' : '📅 Add to Calendar'}</button>}{!isComplete && <button onClick={() => setSelectedGoalForExtra(goal.id)} style={{ ...btnPurple, padding: '8px 14px', fontSize: '12px' }}>⚡ Power-Up</button>}<button onClick={() => deleteGoal(goal.id)} style={{ padding: '8px 14px', background: 'transparent', color: theme.textMuted, border: '1px solid '+theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button></>)}
                  </div>
                </div>)
              })}
            </div>

            {/* Budget Coach */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>🤖 Budget Coach</h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' as const, marginBottom: '12px', display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                {chatMessages.length === 0 && <div style={{ color: theme.textMuted, textAlign: 'center' as const, padding: '20px' }}>Ask me anything about your finances!</div>}
                {chatMessages.map((msg, i) => (<div key={i} style={{ padding: '12px', background: msg.role === 'user' ? theme.accent + '20' : (darkMode ? '#334155' : '#f0fdf4'), borderRadius: '10px', maxWidth: '85%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' } as any}><div style={{ color: theme.text, fontSize: '14px', whiteSpace: 'pre-wrap' as const }}>{msg.content}</div></div>))}
                {isAskingCoach && <div style={{ color: theme.textMuted, padding: '12px' }}>Thinking...</div>}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}><input type="text" placeholder="Ask about your finances..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && askBudgetCoach()} style={{ ...inputStyle, flex: 1 }} /><button onClick={askBudgetCoach} disabled={isAskingCoach} style={btnPrimary}>Send</button></div>
            </div>
          </div>
        )}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            {/* RAT RACE ESCAPE TRACKER */}
            {(() => {
              const totalMonthlyExpenses = monthlyExpenses + monthlyDebtPayments
              const escapePercent = totalMonthlyExpenses > 0 ? Math.min((passiveIncome / totalMonthlyExpenses) * 100, 100) : 0
              const passiveHourly = passiveIncome / 720
              const isEscaped = escapePercent >= 100
              const milestones = [{ pct: 25, label: '🌱 Seed Planted' }, { pct: 50, label: '🔥 Halfway Free' }, { pct: 75, label: '⚡ Almost There' }, { pct: 100, label: '🏆 ESCAPED' }]
              const currentMilestone = milestones.filter(m => escapePercent >= m.pct).pop()
              const nextMilestone = milestones.find(m => escapePercent < m.pct)
              return (
                <div style={{ padding: '32px', background: isEscaped ? 'linear-gradient(135deg, #fbbf2415, #10b98115)' : (darkMode ? 'linear-gradient(135deg, #1e293b, #0f172a, #1e1b4b)' : 'linear-gradient(135deg, #faf5ff, #f0f9ff, #f0fdf4)'), borderRadius: '24px', border: isEscaped ? '2px solid #fbbf24' : '2px solid ' + theme.border, position: 'relative' as const, overflow: 'hidden' }}>
                  <div style={{ position: 'relative' as const, zIndex: 1 }}>
                    <div style={{ textAlign: 'center' as const, marginBottom: '28px' }}>
                      <div style={{ fontSize: '14px', color: theme.textMuted, letterSpacing: '3px', textTransform: 'uppercase' as const, marginBottom: '8px', fontWeight: 600 }}>RAT RACE ESCAPE TRACKER</div>
                      <div style={{ fontSize: '56px', fontWeight: 900, color: isEscaped ? '#fbbf24' : theme.text, lineHeight: 1 }}>{escapePercent.toFixed(1)}%</div>
                      <div style={{ fontSize: '16px', color: isEscaped ? '#fbbf24' : theme.purple, fontWeight: 700, marginTop: '8px' }}>{isEscaped ? '🏆 YOU HAVE ESCAPED THE RAT RACE! 🏆' : currentMilestone ? currentMilestone.label : '🐀 Still in the Rat Race'}</div>
                    </div>
                    <div style={{ position: 'relative' as const, marginBottom: '32px', padding: '0 4px' }}>
                      <div style={{ position: 'relative' as const, height: '20px', marginBottom: '8px' }}>{milestones.map(m => (<div key={m.pct} style={{ position: 'absolute' as const, left: m.pct + '%', transform: 'translateX(-50%)' }}><span style={{ fontSize: '14px', opacity: escapePercent >= m.pct ? 1 : 0.3 }}>{m.pct === 100 ? '🏁' : m.pct === 75 ? '⚡' : m.pct === 50 ? '🔥' : '🌱'}</span></div>))}</div>
                      <div style={{ width: '100%', height: '28px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '14px', overflow: 'hidden', position: 'relative' as const, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
                        <div style={{ width: escapePercent + '%', height: '100%', background: isEscaped ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : escapePercent > 50 ? 'linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981)' : 'linear-gradient(90deg, #8b5cf6, #3b82f6)', borderRadius: '14px', transition: 'width 1s ease', boxShadow: isEscaped ? '0 0 20px #fbbf2460' : 'none' }} />
                        {[25, 50, 75].map(pct => (<div key={pct} style={{ position: 'absolute' as const, left: pct + '%', top: 0, bottom: 0, width: '2px', background: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }} />))}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                      <div style={{ padding: '16px', background: darkMode ? '#334155' : 'white', borderRadius: '16px', textAlign: 'center' as const, border: '1px solid ' + theme.border }}><div style={{ color: theme.textMuted, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Passive Income</div><div style={{ color: theme.success, fontSize: '26px', fontWeight: 800 }}>${passiveIncome.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>/month</div></div>
                      <div style={{ padding: '16px', background: darkMode ? '#334155' : 'white', borderRadius: '16px', textAlign: 'center' as const, border: '1px solid ' + theme.border }}><div style={{ color: theme.textMuted, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Total Outgoing</div><div style={{ color: theme.danger, fontSize: '26px', fontWeight: 800 }}>${totalMonthlyExpenses.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>/month</div></div>
                      <div style={{ padding: '16px', background: darkMode ? '#334155' : 'white', borderRadius: '16px', textAlign: 'center' as const, border: '1px solid ' + theme.border }}><div style={{ color: theme.textMuted, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Money Works 24/7</div><div style={{ color: theme.purple, fontSize: '26px', fontWeight: 800 }}>${passiveHourly.toFixed(2)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>/hour while you sleep</div></div>
                      <div style={{ padding: '16px', background: darkMode ? '#334155' : 'white', borderRadius: '16px', textAlign: 'center' as const, border: '1px solid ' + theme.border }}><div style={{ color: theme.textMuted, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Gap to Freedom</div><div style={{ color: (totalMonthlyExpenses - passiveIncome) <= 0 ? theme.success : theme.warning, fontSize: '26px', fontWeight: 800 }}>${Math.max(0, totalMonthlyExpenses - passiveIncome).toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>{(totalMonthlyExpenses - passiveIncome) <= 0 ? 'COVERED! 🎉' : 'passive income needed'}</div></div>
                    </div>
                    {nextMilestone && (<div style={{ marginTop: '16px', padding: '12px 20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const, border: '1px dashed ' + theme.border }}><span style={{ color: theme.textMuted, fontSize: '13px' }}>Next: </span><span style={{ color: theme.purple, fontSize: '13px', fontWeight: 700 }}>{nextMilestone.label}</span><span style={{ color: theme.textMuted, fontSize: '13px' }}> — need ${(totalMonthlyExpenses * nextMilestone.pct / 100 - passiveIncome).toFixed(0)} more passive income</span></div>)}
                  </div>
                </div>
              )
            })()}

            {/* CASH FLOW QUADRANT */}
            {(() => {
              const employeeIncome = incomeStreams.filter(i => i.type === 'active' && !i.name.toLowerCase().match(/freelance|contract|consult|side/)).reduce((sum, i) => sum + convertToMonthly(parseFloat(i.amount || '0'), i.frequency), 0)
              const selfEmployedIncome = incomeStreams.filter(i => i.type === 'active' && i.name.toLowerCase().match(/freelance|contract|consult|side/)).reduce((sum, i) => sum + convertToMonthly(parseFloat(i.amount || '0'), i.frequency), 0)
              const businessIncome = incomeStreams.filter(i => i.type === 'passive' && i.name.toLowerCase().match(/business|royalt|license/)).reduce((sum, i) => sum + convertToMonthly(parseFloat(i.amount || '0'), i.frequency), 0)
              const investorIncome = incomeStreams.filter(i => i.type === 'passive' && i.name.toLowerCase().match(/dividend|interest|rental|invest|stock|etf|crypto/)).reduce((sum, i) => sum + convertToMonthly(parseFloat(i.amount || '0'), i.frequency), 0)
              const otherPassive = passiveIncome - businessIncome - investorIncome
              const totalAll = employeeIncome + selfEmployedIncome + businessIncome + investorIncome + otherPassive
              const leftSide = employeeIncome + selfEmployedIncome; const rightSide = businessIncome + investorIncome + otherPassive
              const quadrants = [{ key: 'E', label: 'Employee', desc: 'You work for money', amount: employeeIncome, color: '#ef4444', icon: '👔' }, { key: 'S', label: 'Self-Employed', desc: 'You own a job', amount: selfEmployedIncome, color: '#f59e0b', icon: '🔧' }, { key: 'B', label: 'Business Owner', desc: 'Systems work for you', amount: businessIncome + otherPassive, color: '#10b981', icon: '🏢' }, { key: 'I', label: 'Investor', desc: 'Money works for you', amount: investorIncome, color: '#8b5cf6', icon: '📈' }]
              return (
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}><div><h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>💡 Cash Flow Quadrant</h2><p style={{ margin: '4px 0 0', color: theme.textMuted, fontSize: '13px' }}>Move income from left → right to build freedom</p></div><div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><div style={{ textAlign: 'center' as const }}><div style={{ fontSize: '10px', color: theme.danger }}>⬅️ You work</div><div style={{ color: theme.danger, fontWeight: 800, fontSize: '18px' }}>${leftSide.toFixed(0)}</div></div><div style={{ width: '2px', height: '30px', background: theme.border }} /><div style={{ textAlign: 'center' as const }}><div style={{ fontSize: '10px', color: theme.success }}>Money works ➡️</div><div style={{ color: theme.success, fontWeight: 800, fontSize: '18px' }}>${rightSide.toFixed(0)}</div></div></div></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', background: theme.border, borderRadius: '20px', overflow: 'hidden' }}>
                    {quadrants.map(q => { const pct = totalAll > 0 ? (q.amount / totalAll) * 100 : 0; const isActive = q.amount > 0; return (
                      <div key={q.key} style={{ padding: '24px', background: isActive ? (darkMode ? '#1e293b' : 'white') : (darkMode ? '#151e2d' : '#f8fafc'), position: 'relative' as const, overflow: 'hidden' }}>
                        {isActive && <div style={{ position: 'absolute' as const, top: '-20px', right: '-20px', width: '100px', height: '100px', background: q.color + '15', borderRadius: '50%' }} />}
                        <div style={{ position: 'relative' as const, zIndex: 1 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><div><div style={{ fontSize: '28px', marginBottom: '4px' }}>{q.icon}</div><div style={{ fontSize: '32px', fontWeight: 900, color: isActive ? q.color : theme.textMuted + '40' }}>{q.key}</div></div><div style={{ textAlign: 'right' as const }}><div style={{ color: isActive ? theme.text : theme.textMuted, fontSize: '24px', fontWeight: 800 }}>${q.amount.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{pct.toFixed(0)}%</div></div></div><div style={{ color: isActive ? theme.text : theme.textMuted, fontWeight: 600, fontSize: '15px' }}>{q.label}</div><div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '2px' }}>{q.desc}</div><div style={{ width: '100%', height: '6px', background: darkMode ? '#0f172a' : '#e2e8f0', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}><div style={{ width: pct + '%', height: '100%', background: q.color, borderRadius: '3px' }} /></div></div>
                      </div>
                    )})}
                  </div>
                  <div style={{ marginTop: '16px', padding: '12px 20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const }}>{rightSide > leftSide ? <span style={{ color: theme.success, fontWeight: 700, fontSize: '14px' }}>🎯 Cash Flow Positive — Your money earns more than your time!</span> : rightSide > 0 ? <span style={{ color: theme.warning, fontWeight: 700, fontSize: '14px' }}>📈 Building momentum — {((rightSide / Math.max(totalAll, 1)) * 100).toFixed(0)}% from the right side</span> : <span style={{ color: theme.textMuted, fontWeight: 600, fontSize: '14px' }}>💡 Add passive income streams to light up the right side</span>}</div>
                </div>
              )
            })()}

            {/* PASSIVE INCOME PIPELINE */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '22px' }}>🔄 Passive Income Pipeline</h2>
              <p style={{ margin: '0 0 24px 0', color: theme.textMuted, fontSize: '13px' }}>Money flowing in vs flowing out</p>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'stretch' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ textAlign: 'center' as const, marginBottom: '16px' }}><div style={{ fontSize: '12px', color: theme.success, letterSpacing: '2px', textTransform: 'uppercase' as const, fontWeight: 700 }}>💰 Flowing In</div><div style={{ fontSize: '32px', fontWeight: 900, color: theme.success }}>${passiveIncome.toFixed(0)}<span style={{ fontSize: '14px', fontWeight: 400, color: theme.textMuted }}>/mo</span></div></div>
                  {incomeStreams.filter(i => i.type === 'passive').length === 0 ? <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const, border: '2px dashed ' + theme.border }}><div style={{ fontSize: '24px', marginBottom: '8px' }}>🌱</div><div style={{ color: theme.textMuted, fontSize: '13px' }}>No passive income yet — add on Dashboard</div></div> : incomeStreams.filter(i => i.type === 'passive').map(inc => { const monthly = convertToMonthly(parseFloat(inc.amount || '0'), inc.frequency); const pctOfExp = totalOutgoing > 0 ? (monthly / totalOutgoing) * 100 : 0; return (<div key={inc.id} style={{ padding: '14px 16px', background: darkMode ? 'linear-gradient(135deg, #1e3a32, #1e293b)' : 'linear-gradient(135deg, #f0fdf4, #faf5ff)', borderRadius: '12px', border: '1px solid ' + theme.success + '30', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>🌴 {inc.name}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>Covers {pctOfExp.toFixed(1)}% of expenses</div></div><div style={{ color: theme.success, fontWeight: 800, fontSize: '18px' }}>+${monthly.toFixed(0)}</div></div>) })}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0 8px' }}>
                  <div style={{ width: '3px', flex: 1, background: `linear-gradient(to bottom, ${theme.success}, ${theme.border}, ${theme.danger})`, borderRadius: '2px' }} />
                  <div style={{ padding: '12px', background: darkMode ? '#334155' : '#f1f5f9', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ fontSize: '10px', color: theme.textMuted, marginBottom: '4px' }}>CASH FLOW</div><div style={{ fontSize: '18px', fontWeight: 800, color: (passiveIncome - totalOutgoing) >= 0 ? theme.success : theme.danger }}>{(passiveIncome - totalOutgoing) >= 0 ? '+' : ''}${(passiveIncome - totalOutgoing).toFixed(0)}</div></div>
                  <div style={{ width: '3px', flex: 1, background: `linear-gradient(to bottom, ${theme.border}, ${theme.danger})`, borderRadius: '2px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ textAlign: 'center' as const, marginBottom: '16px' }}><div style={{ fontSize: '12px', color: theme.danger, letterSpacing: '2px', textTransform: 'uppercase' as const, fontWeight: 700 }}>💸 Flowing Out</div><div style={{ fontSize: '32px', fontWeight: 900, color: theme.danger }}>${totalOutgoing.toFixed(0)}<span style={{ fontSize: '14px', fontWeight: 400, color: theme.textMuted }}>/mo</span></div></div>
                  {(() => { const cats: {[k:string]:number} = {}; expenses.filter(e => !e.targetDebtId && !e.targetGoalId).forEach(exp => { const c = exp.category||'other'; cats[c] = (cats[c]||0) + convertToMonthly(parseFloat(exp.amount||'0'), exp.frequency) }); if (monthlyDebtPayments > 0) cats['debt payments'] = monthlyDebtPayments; const cc: {[k:string]:string} = { housing:'#8b5cf6', utilities:'#3b82f6', food:'#f59e0b', transport:'#10b981', entertainment:'#f472b6', shopping:'#ef4444', health:'#14b8a6', subscriptions:'#6366f1', 'debt payments':'#dc2626', other:'#94a3b8' }; return Object.entries(cats).sort((a,b) => b[1]-a[1]).slice(0,6).map(([cat, amt]) => (<div key={cat} style={{ padding: '10px 14px', background: darkMode ? 'linear-gradient(135deg, #2d1e1e, #1e293b)' : '#fef2f2', borderRadius: '10px', border: '1px solid '+(cc[cat]||'#94a3b8')+'30', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cc[cat]||'#94a3b8' }} /><span style={{ color: theme.text, fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' as const }}>{cat}</span></div><span style={{ color: theme.danger, fontWeight: 700, fontSize: '14px' }}>-${amt.toFixed(0)}</span></div>)) })()}
                </div>
              </div>
            </div>

            {/* PASSIVE INCOME QUEST BOARD */}
            {(() => {
              const passiveNames = incomeStreams.filter(i => i.type === 'passive').map(i => i.name.toLowerCase())
              const hasPassive = (kws: string[]) => passiveNames.some(name => kws.some(kw => name.includes(kw)))
              const quests = [
                { id:'dividends',icon:'📊',title:'Dividend Investing',subtitle:'Companies pay YOU',difficulty:1,capital:'$100+',time:'1-3mo',target:'$1M invested @ 6% yield',color:'#10b981',keywords:['dividend','etf','vas','vhy','schd','vanguard','stock'],steps:['Open brokerage account','Buy dividend ETFs (VAS, VHY, SCHD)','Enable dividend reinvestment','Add consistently every week/month','Target 4-6% yield with growth'],tip:'The boring path that actually works. Time in market beats timing the market.' },
                { id:'rental',icon:'🏠',title:'Rental Property',subtitle:'Leverage is the cheat code',difficulty:3,capital:'$30-80K deposit',time:'3-6mo',target:'5-10 properties @ $500-1K each',color:'#8b5cf6',keywords:['rental','rent','property','tenant','real estate'],steps:['Save 10-20% deposit + costs','Research high-yield areas','Get pre-approved for loan','Buy below market value','Use property manager'],tip:"Kiyosaki's favourite. Use the bank's money to buy assets." },
                { id:'reits',icon:'🏢',title:'REITs',subtitle:'Real estate without tenants',difficulty:1,capital:'$50+',time:'Immediate',target:'$850K invested @ 7%',color:'#3b82f6',keywords:['reit','property fund','vanguard property'],steps:['Buy REIT ETFs (VAP in AU, VNQ in US)','Diversify across sectors','Reinvest distributions','Higher yields than growth stocks'],tip:'All property benefits, none of the headaches.' },
                { id:'digital',icon:'💻',title:'Digital Products',subtitle:'Create once, sell forever',difficulty:2,capital:'$0-500',time:'1-6mo',target:'500 sales/mo @ $10 each',color:'#f59e0b',keywords:['digital','ebook','course','template','notion','canva','gumroad'],steps:['Pick what you know - any skill works','Start: Notion templates, Canva designs','Sell on Gumroad, Etsy, or own site','Build email list (the real asset)','Create flagship course once validated'],tip:'Zero inventory, infinite copies. Knowledge = asset.' },
                { id:'content',icon:'🎬',title:'Content / YouTube',subtitle:'Build audience, earn sleeping',difficulty:3,capital:'$0-2K',time:'6-24mo',target:'500K-1M views/mo + affiliates',color:'#ef4444',keywords:['youtube','content','creator','adsense','podcast','blog'],steps:['Pick a niche for 3+ years','Start with phone - gear later','Post 2-4x/week consistently','Monetize: ads, affiliates, sponsors','Old videos keep earning forever'],tip:'Slow start, exponential growth. Your library is the asset.' },
                { id:'affiliate',icon:'🔗',title:'Affiliate Marketing',subtitle:'Recommend products, earn commissions',difficulty:2,capital:'$0-500',time:'3-12mo',target:'High-ticket items or volume',color:'#f472b6',keywords:['affiliate','commission','referral'],steps:['Join programs (Amazon, ShareASale)','Build review site or YouTube','Focus on products you actually use','Write honest detailed reviews','SEO + email list = conversions'],tip:'Bridge between content and commerce. No inventory needed.' },
                { id:'savings',icon:'🏦',title:'High-Yield Savings',subtitle:'Boring but bulletproof',difficulty:0,capital:'$1+',time:'Immediate',target:'$1.2M @ 5% = $5K/mo',color:'#6366f1',keywords:['savings','interest','term deposit','hisa','high yield','bank'],steps:['Open high-yield account (ING, UBank)','Park emergency fund here','Compare rates monthly','Consider term deposits','Foundation, not final destination'],tip:'Risk-free income. Perfect parking spot while building other streams.' },
                { id:'p2p',icon:'🤝',title:'Peer-to-Peer Lending',subtitle:'Be the bank',difficulty:2,capital:'$500+',time:'1-3mo',target:'$600K @ 10% return',color:'#14b8a6',keywords:['p2p','lending','peer','plenti'],steps:['Research platforms (Plenti AU)','Start small to understand risk','Diversify across many loans','Reinvest returns','Keep as 5-15% of portfolio'],tip:'Higher risk, 8-12% returns possible. Diversification is key.' },
                { id:'royalties',icon:'🎵',title:'Royalties & IP',subtitle:'IP that pays forever',difficulty:3,capital:'$0-2K',time:'3-12mo',target:'Multiple successful products',color:'#a78bfa',keywords:['royalt','book','music','license','publish','stock photo'],steps:['Write: Self-publish on Amazon KDP','Design: Stock photos on Shutterstock','Music: Distribute via DistroKid','Software: Build micro-tools','Volume matters - 1 product rarely enough'],tip:'The original passive income. Create in 2024, earn in 2034.' },
                { id:'automation',icon:'🤖',title:'Automated Business',subtitle:'Systems run without you',difficulty:4,capital:'$500-10K',time:'3-12mo',target:'1-2 automated businesses',color:'#dc2626',keywords:['business','dropship','print on demand','saas','automated','ecommerce'],steps:['Print-on-demand via Printful/Redbubble','Dropshipping via Shopify','SaaS: Build simple tool people need','Physical: Vending, car wash, laundromat','Key: Build systems, not jobs'],tip:'Hardest to set up, highest potential. Would it run without you for a month?' },
              ]
              return (
                <div style={cardStyle}>
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div><h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>🗺️ Passive Income Quest Board</h2><p style={{ margin: '4px 0 0', color: theme.textMuted, fontSize: '13px' }}>10 paths to $5K/month — unlock by adding income streams</p></div>
                      <div style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', borderRadius: '10px', textAlign: 'center' as const }}><div style={{ color: '#1e293b', fontSize: '20px', fontWeight: 900 }}>{quests.filter(q => hasPassive(q.keywords)).length}/10</div><div style={{ color: '#92400e', fontSize: '10px', fontWeight: 600 }}>UNLOCKED</div></div>
                    </div>
                    <div style={{ marginTop: '16px' }}><div style={{ width: '100%', height: '10px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}><div style={{ width: (quests.filter(q => hasPassive(q.keywords)).length / 10) * 100 + '%', height: '100%', background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', borderRadius: '5px' }} /></div></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {quests.map(quest => {
                      const isUnlocked = hasPassive(quest.keywords)
                      const isExpanded = expandedQuestId === quest.id
                      const matchStreams = incomeStreams.filter(i => i.type === 'passive' && quest.keywords.some(kw => i.name.toLowerCase().includes(kw)))
                      const earned = matchStreams.reduce((s, i) => s + convertToMonthly(parseFloat(i.amount || '0'), i.frequency), 0)
                      return (
                        <div key={quest.id} onClick={() => setExpandedQuestId(isExpanded ? null : quest.id)} style={{ padding: '20px', background: isUnlocked ? (darkMode ? `linear-gradient(135deg, ${quest.color}15, ${quest.color}08)` : `linear-gradient(135deg, ${quest.color}10, white)`) : (darkMode ? '#151e2d' : '#f8fafc'), borderRadius: '16px', border: isUnlocked ? `2px solid ${quest.color}50` : `2px solid ${theme.border}`, cursor: 'pointer', gridColumn: isExpanded ? '1 / -1' : undefined, opacity: isUnlocked ? 1 : 0.7 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ fontSize: '32px', filter: isUnlocked ? 'none' : 'grayscale(0.8)' }}>{quest.icon}</div><div><div style={{ color: theme.text, fontWeight: 700, fontSize: '16px' }}>{quest.title}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{quest.subtitle}</div></div></div>
                            <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: '4px' }}>{isUnlocked ? <span style={{ padding: '3px 10px', background: quest.color + '25', color: quest.color, borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>✅ UNLOCKED</span> : <span style={{ padding: '3px 10px', background: darkMode ? '#334155' : '#e2e8f0', color: theme.textMuted, borderRadius: '6px', fontSize: '11px' }}>🔒 LOCKED</span>}<span style={{ fontSize: '11px', color: theme.textMuted }}>{'⭐'.repeat(quest.difficulty + 1)}</span></div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}><span style={{ padding: '3px 8px', background: darkMode ? '#1e293b' : '#f1f5f9', borderRadius: '4px', fontSize: '10px', color: theme.textMuted }}>💰 {quest.capital}</span><span style={{ padding: '3px 8px', background: darkMode ? '#1e293b' : '#f1f5f9', borderRadius: '4px', fontSize: '10px', color: theme.textMuted }}>⏱️ {quest.time}</span>{isUnlocked && earned > 0 && <span style={{ padding: '3px 8px', background: quest.color + '20', borderRadius: '4px', fontSize: '10px', color: quest.color, fontWeight: 700 }}>🔥 ${earned.toFixed(0)}/mo</span>}</div>
                          {isExpanded && (
                            <div style={{ marginTop: '16px', borderTop: '1px solid ' + theme.border, paddingTop: '16px' }}>
                              <div style={{ padding: '12px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '10px', marginBottom: '16px' }}><div style={{ color: theme.textMuted, fontSize: '11px' }}>🎯 $5K/month target:</div><div style={{ color: quest.color, fontWeight: 700, fontSize: '14px' }}>{quest.target}</div></div>
                              <div style={{ marginBottom: '16px' }}><div style={{ color: theme.text, fontWeight: 700, fontSize: '14px', marginBottom: '10px' }}>🚀 How to Start:</div>{quest.steps.map((step, i) => (<div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}><div style={{ width: '24px', height: '24px', borderRadius: '50%', background: quest.color + '20', color: quest.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>{i+1}</div><div style={{ color: theme.text, fontSize: '13px', lineHeight: 1.5 }}>{step}</div></div>))}</div>
                              <div style={{ padding: '14px', background: quest.color + '10', borderRadius: '10px', borderLeft: '4px solid ' + quest.color }}><div style={{ color: quest.color, fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>💡 Pro Tip</div><div style={{ color: theme.text, fontSize: '13px', lineHeight: 1.5 }}>{quest.tip}</div></div>
                              {!isUnlocked && <div style={{ marginTop: '16px', padding: '12px', background: quest.color + '10', borderRadius: '10px', textAlign: 'center' as const }}><div style={{ color: quest.color, fontWeight: 700, fontSize: '13px' }}>🔓 Add a passive income with: {quest.keywords.slice(0,3).map(k => '"'+k+'"').join(', ')}</div></div>}
                            </div>
                          )}
                          <div style={{ textAlign: 'center' as const, marginTop: '8px' }}><span style={{ color: theme.textMuted, fontSize: '10px' }}>{isExpanded ? '▲ Collapse' : '▼ Expand guide'}</span></div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ marginTop: '20px', padding: '16px', background: 'linear-gradient(135deg, #fbbf2410, #f59e0b10)', borderRadius: '12px', textAlign: 'center' as const, border: '1px dashed #fbbf2440' }}><div style={{ color: theme.text, fontWeight: 700, fontSize: '15px' }}>{quests.filter(q => hasPassive(q.keywords)).length === 0 ? '🌱 Every empire starts with a single dollar working for you' : quests.filter(q => hasPassive(q.keywords)).length < 3 ? '🔥 Great start! Diversify into more streams' : quests.filter(q => hasPassive(q.keywords)).length < 7 ? '⚡ Impressive income machine!' : '🏆 Passive Income Master!'}</div><div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>"Don't work for money. Make money work for you." — Robert Kiyosaki</div></div>
                </div>
              )
            })()}

            {/* ASSET vs LIABILITY SCORECARD */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '22px' }}>⚖️ Asset vs Liability Scorecard</h2>
              <p style={{ margin: '0 0 20px 0', color: theme.textMuted, fontSize: '13px' }}>Assets put money IN your pocket. Liabilities take money OUT.</p>
              {(() => {
                const assetCF = incomeStreams.filter(i => i.type === 'passive').reduce((s, i) => s + convertToMonthly(parseFloat(i.amount || '0'), i.frequency), 0)
                const liabCF = monthlyDebtPayments
                const totalCF = assetCF + liabCF; const assetPct = totalCF > 0 ? (assetCF / totalCF) * 100 : 50
                return (<>
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: theme.success, fontWeight: 700 }}>💪 Assets: +${assetCF.toFixed(0)}/mo</span><span style={{ color: theme.danger, fontWeight: 700 }}>-${liabCF.toFixed(0)}/mo 🏋️</span></div>
                    <div style={{ width: '100%', height: '20px', background: theme.danger + '40', borderRadius: '10px', overflow: 'hidden', position: 'relative' as const }}><div style={{ width: assetPct + '%', height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '10px' }} /><div style={{ position: 'absolute' as const, left: '50%', top: '-4px', bottom: '-4px', width: '3px', background: theme.text, transform: 'translateX(-50%)', borderRadius: '2px' }} /></div>
                    <div style={{ textAlign: 'center' as const, marginTop: '8px' }}><span style={{ padding: '4px 12px', background: assetCF > liabCF ? theme.success + '20' : theme.danger + '20', color: assetCF > liabCF ? theme.success : theme.danger, borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>{assetCF > liabCF ? '✅ Cash Flow Positive!' : '⚠️ Build more assets!'}</span></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 12px 0', color: theme.success }}>✅ Real Assets</h3>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' as const }}><input type="text" placeholder="Asset" value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 80px', padding: '8px 12px', fontSize: '13px' }} /><input type="number" placeholder="$" value={newAsset.value} onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })} style={{ ...inputStyle, width: '80px', padding: '8px 12px', fontSize: '13px' }} /><select value={newAsset.type} onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })} style={{ ...inputStyle, padding: '8px', fontSize: '13px' }}><option value="savings">💵 Savings</option><option value="investment">📈 Investment</option><option value="property">🏠 Property</option><option value="business">🏢 Business</option><option value="crypto">🪙 Crypto</option><option value="other">📦 Other</option></select><button onClick={addAsset} style={{ ...btnSuccess, padding: '8px 14px', fontSize: '12px' }}>+</button></div>
                      {assets.map(a => (<div key={a.id} style={{ padding: '10px 14px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', border: '1px solid ' + theme.success + '20' }}><span style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>{a.name}</span><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span style={{ color: theme.success, fontWeight: 700 }}>${parseFloat(a.value).toFixed(0)}</span><button onClick={() => deleteAsset(a.id)} style={{ padding: '4px 8px', background: theme.danger + '20', color: theme.danger, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕</button></div></div>))}
                      {assets.length > 0 && <div style={{ marginTop: '8px', padding: '8px', background: theme.success + '10', borderRadius: '8px', textAlign: 'center' as const }}><span style={{ color: theme.success, fontWeight: 700 }}>Total: ${totalAssets.toFixed(0)}</span></div>}
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 12px 0', color: theme.danger }}>❌ Liabilities</h3>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' as const }}><input type="text" placeholder="Liability" value={newLiability.name} onChange={(e) => setNewLiability({ ...newLiability, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 80px', padding: '8px 12px', fontSize: '13px' }} /><input type="number" placeholder="$" value={newLiability.value} onChange={(e) => setNewLiability({ ...newLiability, value: e.target.value })} style={{ ...inputStyle, width: '80px', padding: '8px 12px', fontSize: '13px' }} /><select value={newLiability.type} onChange={(e) => setNewLiability({ ...newLiability, type: e.target.value })} style={{ ...inputStyle, padding: '8px', fontSize: '13px' }}><option value="loan">🏦 Loan</option><option value="credit">💳 Credit</option><option value="mortgage">🏠 Mortgage</option><option value="other">📋 Other</option></select><button onClick={addLiability} style={{ ...btnDanger, padding: '8px 14px', fontSize: '12px' }}>+</button></div>
                      {debts.map(d => (<div key={'dl-'+d.id} style={{ padding: '10px 14px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', border: '1px solid ' + theme.danger + '20' }}><span style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>💳 {d.name}</span><span style={{ color: theme.danger, fontWeight: 700 }}>${parseFloat(d.balance).toFixed(0)}</span></div>))}
                      {liabilities.map(l => (<div key={l.id} style={{ padding: '10px 14px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', border: '1px solid ' + theme.danger + '20' }}><span style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>{l.name}</span><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span style={{ color: theme.danger, fontWeight: 700 }}>${parseFloat(l.value).toFixed(0)}</span><button onClick={() => deleteLiability(l.id)} style={{ padding: '4px 8px', background: theme.danger + '20', color: theme.danger, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕</button></div></div>))}
                      {(totalLiabilities + totalDebtBalance) > 0 && <div style={{ marginTop: '8px', padding: '8px', background: theme.danger + '10', borderRadius: '8px', textAlign: 'center' as const }}><span style={{ color: theme.danger, fontWeight: 700 }}>Total: ${(totalLiabilities + totalDebtBalance).toFixed(0)}</span></div>}
                    </div>
                  </div>
                </>)
              })()}
            </div>

            {/* WHAT-IF SCENARIOS */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowWhatIf(!showWhatIf)}><div><h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>🔮 What-If Scenarios</h2><p style={{ margin: '4px 0 0', color: theme.textMuted, fontSize: '13px' }}>See how investing accelerates your freedom date</p></div><div style={{ fontSize: '24px', color: theme.textMuted, transition: 'transform 0.3s', transform: showWhatIf ? 'rotate(180deg)' : 'rotate(0)' }}>▼</div></div>
              {showWhatIf && (() => {
                const extra = parseFloat(whatIfExtra || '0'); const ret = parseFloat(whatIfReturn || '0') / 100; const yrs = parseInt(whatIfYears || '0')
                const monthlyRet = ret / 12; const curInv = assets.filter(a => a.type === 'investment' || a.type === 'crypto').reduce((s, a) => s + parseFloat(a.value || '0'), 0)
                let fv = curInv; for (let m = 0; m < yrs * 12; m++) fv = fv * (1 + monthlyRet) + extra
                const projPassive = passiveIncome + ((fv * 0.04) / 12); const projEscape = totalOutgoing > 0 ? Math.min((projPassive / totalOutgoing) * 100, 100) : 0
                let mte = 0; if (passiveIncome < totalOutgoing) { let b = curInv; while (mte < 600) { b = b * (1 + monthlyRet) + extra; if (passiveIncome + ((b * 0.04) / 12) >= totalOutgoing) break; mte++ } }
                return (<div style={{ marginTop: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
                    <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '8px' }}>💰 Monthly Investment</label><input type="range" min="0" max="5000" step="50" value={whatIfExtra} onChange={(e) => setWhatIfExtra(e.target.value)} style={{ width: '100%', accentColor: theme.purple }} /><div style={{ textAlign: 'center' as const, marginTop: '4px' }}><span style={{ color: theme.purple, fontWeight: 800, fontSize: '22px' }}>${whatIfExtra}</span><span style={{ color: theme.textMuted, fontSize: '12px' }}>/mo</span></div></div>
                    <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '8px' }}>📈 Annual Return</label><input type="range" min="1" max="20" step="0.5" value={whatIfReturn} onChange={(e) => setWhatIfReturn(e.target.value)} style={{ width: '100%', accentColor: theme.success }} /><div style={{ textAlign: 'center' as const, marginTop: '4px' }}><span style={{ color: theme.success, fontWeight: 800, fontSize: '22px' }}>{whatIfReturn}%</span></div></div>
                    <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '8px' }}>⏰ Years</label><input type="range" min="1" max="30" step="1" value={whatIfYears} onChange={(e) => setWhatIfYears(e.target.value)} style={{ width: '100%', accentColor: theme.accent }} /><div style={{ textAlign: 'center' as const, marginTop: '4px' }}><span style={{ color: theme.accent, fontWeight: 800, fontSize: '22px' }}>{whatIfYears}</span><span style={{ color: theme.textMuted, fontSize: '12px' }}> years</span></div></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    <div style={{ padding: '20px', background: theme.success + '15', borderRadius: '16px', textAlign: 'center' as const, border: '1px solid ' + theme.success + '30' }}><div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Portfolio</div><div style={{ color: theme.success, fontSize: '28px', fontWeight: 900 }}>${fv >= 1e6 ? (fv/1e6).toFixed(1)+'M' : fv.toFixed(0)}</div></div>
                    <div style={{ padding: '20px', background: theme.purple + '15', borderRadius: '16px', textAlign: 'center' as const, border: '1px solid ' + theme.purple + '30' }}><div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Passive Income</div><div style={{ color: theme.purple, fontSize: '28px', fontWeight: 900 }}>${projPassive.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>/month</div></div>
                    <div style={{ padding: '20px', background: theme.accent + '15', borderRadius: '16px', textAlign: 'center' as const, border: '1px solid ' + theme.accent + '30' }}><div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Escape %</div><div style={{ color: projEscape >= 100 ? '#fbbf24' : theme.accent, fontSize: '28px', fontWeight: 900 }}>{projEscape.toFixed(0)}%</div></div>
                    <div style={{ padding: '20px', background: (mte < 600 ? '#fbbf24' : theme.danger) + '15', borderRadius: '16px', textAlign: 'center' as const, border: '1px solid ' + (mte < 600 ? '#fbbf24' : theme.danger) + '30' }}><div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Freedom Date</div><div style={{ color: mte < 600 ? '#fbbf24' : theme.danger, fontSize: '28px', fontWeight: 900 }}>{mte === 0 ? 'NOW!' : mte < 600 ? Math.floor(mte/12)+'y '+mte%12+'m' : '∞'}</div></div>
                  </div>
                </div>)
              })()}
            </div>

            {/* GOAL CALCULATOR */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.purple, fontSize: '18px' }}>🧮 Goal Calculator</h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' as const }}>
                <input type="number" placeholder="Target $" value={goalCalculator.targetAmount} onChange={(e) => setGoalCalculator({ ...goalCalculator, targetAmount: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                <input type="number" placeholder="Current $" value={goalCalculator.currentAmount} onChange={(e) => setGoalCalculator({ ...goalCalculator, currentAmount: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                <input type="number" placeholder="Monthly $" value={goalCalculator.monthlyContribution} onChange={(e) => setGoalCalculator({ ...goalCalculator, monthlyContribution: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                <input type="number" placeholder="Interest %" value={goalCalculator.interestRate} onChange={(e) => setGoalCalculator({ ...goalCalculator, interestRate: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                <input type="number" placeholder="Years" value={goalCalculator.years} onChange={(e) => setGoalCalculator({ ...goalCalculator, years: e.target.value })} style={{ ...inputStyle, width: '80px' }} />
                <button onClick={calculateGoal} disabled={calculating} style={btnPurple}>{calculating ? '...' : 'Calculate'}</button>
              </div>
              {calculatorResult && (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}><div style={{ textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Time</div><div style={{ color: theme.text, fontSize: '20px', fontWeight: 700 }}>{Math.floor(calculatorResult.totalMonths/12)}y {calculatorResult.totalMonths%12}m</div></div><div style={{ textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Future Value</div><div style={{ color: theme.success, fontSize: '20px', fontWeight: 700 }}>${calculatorResult.futureValue.toFixed(0)}</div></div><div style={{ textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Contributed</div><div style={{ color: theme.text, fontSize: '20px', fontWeight: 700 }}>${calculatorResult.totalContributed.toFixed(0)}</div></div><div style={{ textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Interest</div><div style={{ color: theme.purple, fontSize: '20px', fontWeight: 700 }}>${calculatorResult.interestEarned.toFixed(0)}</div></div></div>)}
            </div>
          </div>
        )}

        {activeTab === 'path' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            <div style={{ padding: '32px', background: 'linear-gradient(135deg, '+theme.success+'20, '+theme.purple+'20)', borderRadius: '24px', border: '2px solid '+theme.success }}>
              <h2 style={{ margin: '0 0 24px 0', color: theme.text, fontSize: '28px' }}>🎯 Financial Independence Path</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
                <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px' }}><div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>FIRE Number</div><div style={{ color: theme.success, fontSize: '32px', fontWeight: 800 }}>${fiPath.fireNumber.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>25x annual expenses</div></div>
                <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px' }}><div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>Years to FI</div><div style={{ color: theme.purple, fontSize: '32px', fontWeight: 800 }}>{fiPath.yearsToFI > 100 ? '∞' : fiPath.yearsToFI}</div></div>
                <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px' }}><div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>Passive Coverage</div><div style={{ color: fiPath.passiveCoverage >= 100 ? theme.success : theme.warning, fontSize: '32px', fontWeight: 800 }}>{fiPath.passiveCoverage.toFixed(0)}%</div><div style={{ width: '100%', height: '8px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}><div style={{ width: Math.min(fiPath.passiveCoverage, 100) + '%', height: '100%', background: fiPath.passiveCoverage >= 100 ? theme.success : theme.warning, borderRadius: '4px' }} /></div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[{l:'Monthly Need',v:'$'+fiPath.monthlyNeed.toFixed(0),c:theme.text},{l:'Passive Income',v:'$'+passiveIncome.toFixed(0),c:theme.success},{l:'Gap',v:'$'+fiPath.passiveGap.toFixed(0),c:theme.danger},{l:'Surplus',v:'$'+monthlySurplus.toFixed(0),c:monthlySurplus>=0?theme.success:theme.danger}].map((s,i) => (<div key={i} style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>{s.l}</div><div style={{ color: s.c, fontSize: '20px', fontWeight: 700 }}>{s.v}</div></div>))}
              </div>
            </div>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '20px' }}>💰 Income Breakdown</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ padding: '20px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>🏃 Active Income</div><div style={{ color: theme.success, fontSize: '28px', fontWeight: 700 }}>${activeIncome.toFixed(0)}/mo</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{(100-passiveIncomePercentage).toFixed(0)}%</div></div>
                <div style={{ padding: '20px', background: darkMode ? '#2d1e3a' : '#faf5ff', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>🌴 Passive Income</div><div style={{ color: theme.purple, fontSize: '28px', fontWeight: 700 }}>${passiveIncome.toFixed(0)}/mo</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{passiveIncomePercentage.toFixed(0)}%</div></div>
              </div>
            </div>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '20px' }}>📊 Spending Breakdown</h3>
              {(() => { const cats:{[k:string]:number}={}; expenses.filter(e=>!e.targetDebtId&&!e.targetGoalId).forEach(exp=>{const c=exp.category||'other';cats[c]=(cats[c]||0)+convertToMonthly(parseFloat(exp.amount||'0'),exp.frequency)}); const sorted=Object.entries(cats).sort((a,b)=>b[1]-a[1]); const total=sorted.reduce((s,[,v])=>s+v,0); const cc:{[k:string]:string}={housing:'#8b5cf6',utilities:'#3b82f6',food:'#f59e0b',transport:'#10b981',entertainment:'#f472b6',shopping:'#ef4444',health:'#14b8a6',subscriptions:'#6366f1',other:'#94a3b8'}; return sorted.map(([cat,amt]) => (<div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}><span style={{ width: '100px', color: theme.text, fontWeight: 600, fontSize: '13px', textTransform: 'capitalize' as const }}>{cat}</span><div style={{ flex: 1, height: '24px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '12px', overflow: 'hidden' }}><div style={{ width: (total>0?(amt/total)*100:0)+'%', height: '100%', background: cc[cat]||'#94a3b8', borderRadius: '12px' }} /></div><span style={{ color: theme.text, fontWeight: 700, fontSize: '13px', width: '70px', textAlign: 'right' as const }}>${amt.toFixed(0)}</span></div>)) })()}
            </div>
          </div>
        )}

        {activeTab === 'trading' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.warning, fontSize: '18px' }}>📓 Trade Journal</h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' as const }}><input type="date" value={newTrade.date} onChange={(e) => setNewTrade({ ...newTrade, date: e.target.value })} style={inputStyle} /><input type="text" placeholder="Instrument" value={newTrade.instrument} onChange={(e) => setNewTrade({ ...newTrade, instrument: e.target.value })} style={{ ...inputStyle, flex: 1 }} /><select value={newTrade.direction} onChange={(e) => setNewTrade({ ...newTrade, direction: e.target.value })} style={inputStyle}><option value="long">Long</option><option value="short">Short</option></select><input type="number" placeholder="P/L $" value={newTrade.profitLoss} onChange={(e) => setNewTrade({ ...newTrade, profitLoss: e.target.value })} style={{ ...inputStyle, width: '80px' }} /><input type="text" placeholder="Notes" value={newTrade.notes} onChange={(e) => setNewTrade({ ...newTrade, notes: e.target.value })} style={{ ...inputStyle, flex: 1 }} /><button onClick={addTrade} style={btnWarning}>Add Trade</button></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}><div style={{ padding: '12px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '10px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Total P/L</div><div style={{ color: totalPL >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>${totalPL.toFixed(2)}</div></div><div style={{ padding: '12px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '10px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Win Rate</div><div style={{ color: winRate >= 50 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>{winRate.toFixed(0)}%</div></div><div style={{ padding: '12px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '10px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Trades</div><div style={{ color: theme.text, fontSize: '24px', fontWeight: 700 }}>{trades.length}</div></div></div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' as const }}>{trades.map(t => (<div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid ' + theme.border }}><div><span style={{ color: theme.text, fontWeight: 600 }}>{t.instrument}</span><span style={{ color: theme.textMuted, marginLeft: '8px', fontSize: '12px' }}>{t.date} • {t.direction}</span>{t.notes && <span style={{ color: theme.textMuted, marginLeft: '8px', fontSize: '11px' }}>• {t.notes}</span>}</div><span style={{ color: parseFloat(t.profitLoss) >= 0 ? theme.success : theme.danger, fontWeight: 700 }}>{parseFloat(t.profitLoss) >= 0 ? '+' : ''}${parseFloat(t.profitLoss).toFixed(2)}</span></div>))}</div>
            </div>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.accent, fontSize: '18px' }}>📊 Forex Prop Calculator</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>{[{l:'Phase',el:<select value={forexProp.phase} onChange={(e) => setForexProp({...forexProp, phase: e.target.value})} style={{...inputStyle,width:'100%'}}><option value="phase1">Phase 1</option><option value="phase2">Phase 2</option><option value="funded">Funded</option></select>},{l:'Account',el:<input type="number" value={forexProp.accountSize} onChange={(e) => setForexProp({...forexProp, accountSize: e.target.value})} style={{...inputStyle,width:'100%'}} />},{l:'Balance',el:<input type="number" value={forexProp.currentBalance} onChange={(e) => setForexProp({...forexProp, currentBalance: e.target.value})} style={{...inputStyle,width:'100%'}} />},{l:'Risk %',el:<input type="number" value={forexProp.riskPerTrade} onChange={(e) => setForexProp({...forexProp, riskPerTrade: e.target.value})} style={{...inputStyle,width:'100%'}} />},{l:'Trades/Day',el:<input type="number" value={forexProp.tradesPerDay} onChange={(e) => setForexProp({...forexProp, tradesPerDay: e.target.value})} style={{...inputStyle,width:'100%'}} />},{l:'Win %',el:<input type="number" value={forexProp.winRate} onChange={(e) => setForexProp({...forexProp, winRate: e.target.value})} style={{...inputStyle,width:'100%'}} />},{l:'Avg RR',el:<input type="number" value={forexProp.avgRR} onChange={(e) => setForexProp({...forexProp, avgRR: e.target.value})} style={{...inputStyle,width:'100%'}} />},{l:'Days',el:<input type="number" value={forexProp.tradingDays} onChange={(e) => setForexProp({...forexProp, tradingDays: e.target.value})} style={{...inputStyle,width:'100%'}} />}].map((f,i) => (<div key={i}><label style={{color:theme.textMuted,fontSize:'11px',display:'block',marginBottom:'4px'}}>{f.l}</label>{f.el}</div>))}</div>
              <button onClick={calculateForexProp} style={{...btnPrimary,width:'100%',marginBottom:'16px'}}>Calculate</button>
              {forexPropResults && (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>{[{l:'Profit Progress',v:forexPropResults.profitProgress.toFixed(1)+'%',c:theme.success},{l:'DD Remaining',v:'$'+forexPropResults.drawdownRemaining.toFixed(0),c:forexPropResults.drawdownRemaining>forexPropResults.dailyDrawdownAmount?theme.success:theme.danger},{l:'Days to Target',v:forexPropResults.daysToTarget>0?forexPropResults.daysToTarget:'N/A',c:theme.accent},{l:'Daily Expectancy',v:'$'+forexPropResults.dailyExpectedPL.toFixed(2),c:forexPropResults.dailyExpectedPL>=0?theme.success:theme.danger},{l:'Max Losses Today',v:forexPropResults.maxLossesToday.toFixed(1),c:theme.warning},{l:'Status',v:forexPropResults.onTrack?'✅ On Track':'⚠️ Behind',c:forexPropResults.onTrack?theme.success:theme.danger}].map((s,i) => (<div key={i} style={{padding:'12px',background:darkMode?'#334155':'#f8fafc',borderRadius:'10px',textAlign:'center' as const}}><div style={{color:theme.textMuted,fontSize:'11px'}}>{s.l}</div><div style={{color:s.c,fontSize:'18px',fontWeight:700}}>{s.v}</div></div>))}</div>)}
            </div>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.success, fontSize: '18px' }}>📈 Compounding Calculator</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>{[{l:'Starting $',v:tradingCalculator.startingCapital,k:'startingCapital'},{l:'Monthly Add',v:tradingCalculator.monthlyContribution,k:'monthlyContribution'},{l:'Return %',v:tradingCalculator.returnRate,k:'returnRate'},{l:'Years',v:tradingCalculator.years,k:'years'},{l:'Months',v:tradingCalculator.months,k:'months'},{l:'Days',v:tradingCalculator.days,k:'days'},{l:'Reinvest %',v:tradingCalculator.reinvestRate,k:'reinvestRate'}].map((f,i) => (<div key={i}><label style={{color:theme.textMuted,fontSize:'11px',display:'block',marginBottom:'4px'}}>{f.l}</label><input type="number" value={f.v} onChange={(e) => setTradingCalculator({...tradingCalculator, [f.k]: e.target.value})} style={{...inputStyle,width:'100%'}} /></div>))}<div><label style={{color:theme.textMuted,fontSize:'11px',display:'block',marginBottom:'4px'}}>Period</label><select value={tradingCalculator.returnPeriod} onChange={(e) => setTradingCalculator({...tradingCalculator, returnPeriod: e.target.value})} style={{...inputStyle,width:'100%'}}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></div></div>
              <button onClick={calculateTradingCompounding} disabled={calculatingTrading} style={{...btnSuccess,width:'100%',marginBottom:'16px'}}>{calculatingTrading ? 'Calculating...' : 'Calculate'}</button>
              {tradingResults && (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}><div style={{padding:'16px',background:'linear-gradient(135deg,#10b981,#059669)',borderRadius:'12px',textAlign:'center' as const}}><div style={{color:'rgba(255,255,255,0.8)',fontSize:'12px'}}>Future Value</div><div style={{color:'white',fontSize:'24px',fontWeight:800}}>${tradingResults.futureValue.toFixed(0)}</div></div><div style={{padding:'16px',background:'linear-gradient(135deg,#8b5cf6,#7c3aed)',borderRadius:'12px',textAlign:'center' as const}}><div style={{color:'rgba(255,255,255,0.8)',fontSize:'12px'}}>Profit</div><div style={{color:'white',fontSize:'24px',fontWeight:800}}>${tradingResults.profit.toFixed(0)}</div></div><div style={{padding:'16px',background:'linear-gradient(135deg,#3b82f6,#2563eb)',borderRadius:'12px',textAlign:'center' as const}}><div style={{color:'rgba(255,255,255,0.8)',fontSize:'12px'}}>Trading Days</div><div style={{color:'white',fontSize:'24px',fontWeight:800}}>{tradingResults.totalTradingDays}</div></div></div>)}
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            <div style={{ padding: '32px', background: darkMode ? 'linear-gradient(135deg, #1e293b, #1e1b4b)' : 'linear-gradient(135deg, #f0f9ff, #faf5ff)', borderRadius: '24px', border: '2px solid ' + theme.border, textAlign: 'center' as const }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📖</div>
              <h1 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '32px', fontWeight: 900 }}>App Guide</h1>
              <p style={{ margin: 0, color: theme.textMuted, fontSize: '16px' }}>Everything you need to know. Click any section to expand.</p>
            </div>
            {[
              { id:'quickstart',icon:'🚀',title:'Quick Start',color:'#fbbf24',items:[{q:'How do I get started?',a:'Choose Budget Mode or Trading Mode from the mode selector. Budget Mode tracks finances, Trading Mode has prop calculators and journals.'},{q:'What should I set up first?',a:'1. Add income streams (salary, side hustles)\n2. Add expenses (use Presets for quick setup!)\n3. Add debts\n4. Set savings goals\n5. Check your calendar'},{q:'What are the tabs?',a:'📊 Dashboard — Income, expenses, debts, goals, calendar\n💎 Overview — Rat Race tracker, Cash Flow Quadrant, Quest Board\n🎯 Path — FIRE number, income breakdown, spending\n📈 Trading — Journal, prop calculators\n📖 Guide — You are here!'}]},
              { id:'income',icon:'💰',title:'Income Streams',color:'#10b981',items:[{q:'Active vs Passive income?',a:'Active (🏃) = You trade time for money (salary, freelancing)\nPassive (🌴) = Money works without you (dividends, rental, royalties)\n\nThe Overview tab tracks your shift from active to passive.'},{q:'How does naming affect the quadrant?',a:'The Cash Flow Quadrant auto-categorizes by keywords:\n• "dividend", "ETF" → Investor quadrant\n• "rental" → Investor\n• "freelance" → Self-Employed\n• "business" → Business Owner\nName your streams clearly!'}]},
              { id:'expenses',icon:'💸',title:'Expenses & Bills',color:'#ef4444',items:[{q:'What are Presets?',a:'Quick-add common bills. Click 📋 Presets to see the list. Each has a frequency dropdown (W/FN/M/Q/Y) you can change before adding.'},{q:'How does CSV import work?',a:'Click 📤 CSV, select a bank statement. The app auto-detects dates/amounts, categorizes transactions, and lets you review before importing.'},{q:'Expense categories?',a:'🏠 Housing, ⚡ Utilities, 🍔 Food, 🚗 Transport, 🎬 Entertainment, 🛍️ Shopping, ❤️ Health, 📱 Subscriptions, 📦 Other'}]},
              { id:'debts',icon:'⚔️',title:'Debt Boss Battles',color:'#dc2626',items:[{q:'How do boss states work?',a:'👹 Full HP → 😤 Hurt (25%) → 😰 Weakening (50%) → 😵 Nearly Dead (75%) → 💀 DEFEATED (100%)\nThe HP bar shows your progress visually.'},{q:'What are Power-Ups?',a:'Extra payments beyond your minimum. Click ⚡ Add Power-Up, set amount and frequency. Creates calendar entries that reduce debt when marked paid.'},{q:'Avalanche vs Snowball?',a:'🏔️ Avalanche — Target highest interest first. Saves most money.\n⛄ Snowball — Target smallest balance first. Faster wins.\nBoth work! Pick what motivates you.'}]},
              { id:'goals',icon:'🎯',title:'Savings Quests',color:'#8b5cf6',items:[{q:'What does Add to Calendar do?',a:'Creates recurring payments on your calendar. When you mark them "PAY", the amount is added to your saved total automatically.'},{q:'What are goal ranks?',a:'🚀 Just Started (0-25%) → 🌟 Making Progress (25-50%) → ⚡ Halfway Hero (50-75%) → 🔥 Almost There (75-99%) → 👑 COMPLETE!'}]},
              { id:'calendar',icon:'📅',title:'Calendar',color:'#3b82f6',items:[{q:'What does PAY do?',a:'Marks an item as paid. For debts: reduces balance. For goals: increases saved amount. For power-ups: applies to linked debt/goal. Click ✓ to undo.'},{q:'Color coding?',a:'💰 Green = Income\n💸 Blue = Expenses\n💳 Red = Debt payments\n🎯 Purple = Goal savings\n⚡ Light purple = Power-ups'}]},
              { id:'overview',icon:'💎',title:'Overview Tab',color:'#a78bfa',items:[{q:'What is the Rat Race Escape Tracker?',a:'Shows what % of your expenses are covered by passive income. 100% = escaped! Milestones at 25%, 50%, 75%, 100%.'},{q:'Cash Flow Quadrant?',a:'Kiyosaki\'s E/S/B/I framework:\n👔 Employee → 🔧 Self-Employed → 🏢 Business Owner → 📈 Investor\nGoal: Move income from left (you work) to right (money works).'},{q:'What is the 4% rule?',a:'Withdraw 4% of investments per year without running out. $1M = $40K/year = $3,333/month passive income.'}]},
              { id:'xp',icon:'🎮',title:'XP & Gamification',color:'#f472b6',items:[{q:'How do I earn XP?',a:'+10 Marking paid | +10 Add expense | +15 Add income | +20 Add debt | +25 Add goal | +30 Debt power-up | +50 Achievement'},{q:'What are the levels?',a:'🐣 Lv1 (0) → 🌱 Lv2 (100) → 📈 Lv3 (250) → 💪 Lv4 (500) → 🎯 Lv5 (800) → 🌟 Lv6 (1200) → ⚡ Lv7 (1800) → 🔥 Lv8 (2500) → 💎 Lv9 (3500) → 🏆 Lv10 (5000)'},{q:'Achievements?',a:'🎯 First Goal | 🏅 5 Goals | 💳 Debt Tracked | ✅ Goal Complete | 🎉 Debt Destroyed | 💸 5 Payments | ⚡ 20 Payments | 💰 3+ Income Streams'}]},
              { id:'tips',icon:'💡',title:'Tips & Best Practices',color:'#fbbf24',items:[{q:'Best workflow?',a:'1. Set up income & expenses\n2. Add debts with power-ups\n3. Create goals, add to calendar\n4. Every payday: open calendar, mark items paid\n5. Check Overview weekly\n6. Review spending monthly\n7. Use What-If scenarios for motivation'},{q:'Is data saved?',a:'Currently data resets on page refresh. Persistent storage is a planned feature. Screenshot your progress regularly!'}]}
            ].map(section => (
              <div key={section.id} style={cardStyle}>
                <div onClick={() => setExpandedGuideSection(expandedGuideSection === section.id ? null : section.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><div style={{ width: '48px', height: '48px', borderRadius: '14px', background: section.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{section.icon}</div><div><h3 style={{ margin: 0, color: theme.text, fontSize: '18px' }}>{section.title}</h3><span style={{ color: theme.textMuted, fontSize: '12px' }}>{section.items.length} topics</span></div></div>
                  <div style={{ fontSize: '20px', color: theme.textMuted, transition: 'transform 0.3s', transform: expandedGuideSection === section.id ? 'rotate(180deg)' : 'rotate(0)' }}>▼</div>
                </div>
                {expandedGuideSection === section.id && (<div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>{section.items.map((item, idx) => (<div key={idx} onClick={(e) => { e.stopPropagation(); setExpandedGuideItem(expandedGuideItem === section.id+'-'+idx ? null : section.id+'-'+idx) }} style={{ padding: '16px', background: expandedGuideItem === section.id+'-'+idx ? (darkMode ? '#334155' : '#f8fafc') : (darkMode ? '#1e293b' : '#fafafa'), borderRadius: '12px', border: '1px solid ' + (expandedGuideItem === section.id+'-'+idx ? section.color + '40' : theme.border), cursor: 'pointer' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '24px', height: '24px', borderRadius: '50%', background: section.color + '20', color: section.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>{idx+1}</div><span style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>{item.q}</span></div><span style={{ color: theme.textMuted, fontSize: '14px' }}>›</span></div>{expandedGuideItem === section.id+'-'+idx && <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid ' + theme.border }}><div style={{ color: theme.text, fontSize: '13px', lineHeight: 1.8, whiteSpace: 'pre-line' as const }}>{item.a}</div></div>}</div>))}</div>)}
              </div>
            ))}
            <div style={{ padding: '24px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '16px', textAlign: 'center' as const, border: '1px solid ' + theme.border }}><div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div><div style={{ color: theme.text, fontWeight: 700, fontSize: '16px' }}>Still have questions?</div><div style={{ color: theme.textMuted, fontSize: '13px' }}>Use the 🤖 Budget Coach on the Dashboard!</div></div>
          </div>
        )}

      </main>
    </div>
  )
}
