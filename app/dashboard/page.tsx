'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  const [mainTab, setMainTab] = useState("finance")
  const [financeTab, setFinanceTab] = useState("dashboard")
  const [tradingTab, setTradingTab] = useState("trading-goals")
  
  // DARK MODE
  const [darkMode, setDarkMode] = useState(false)
  
  const [goals, setGoals] = useState<any[]>([])
  const [newGoal, setNewGoal] = useState({
    name: '', target: '', saved: '', deadline: '', frequency: 'monthly'
  })
  
  const [transactions, setTransactions] = useState<any[]>([])
  const [newTransaction, setNewTransaction] = useState({
    name: '', amount: '', type: 'expense', date: new Date().toISOString().split('T')[0], frequency: 'monthly'
  })
  
  // CALENDAR ITEMS (bills, goal deadlines, transaction reminders, debt payments)
  const [calendarItems, setCalendarItems] = useState<any[]>([])
  const [newBill, setNewBill] = useState({
    name: '', amount: '', dueDate: '', frequency: 'monthly', isPaid: false, type: 'bill'
  })
  
  // CALENDAR MONTH NAVIGATION
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  
  // DEBT PAYOFF STATE (with frequency)
  const [debts, setDebts] = useState<any[]>([])
  const [newDebt, setNewDebt] = useState({
    name: '', balance: '', interestRate: '', minPayment: '', type: 'credit_card', frequency: 'monthly'
  })
  const [extraPayment, setExtraPayment] = useState('')
  const [payoffMethod, setPayoffMethod] = useState<'snowball' | 'avalanche'>('avalanche')
  
  // NET WORTH STATE
  const [assets, setAssets] = useState<any[]>([])
  const [newAsset, setNewAsset] = useState({
    name: '', value: '', type: 'savings', date: new Date().toISOString().split('T')[0]
  })
  const [liabilities, setLiabilities] = useState<any[]>([])
  const [newLiability, setNewLiability] = useState({
    name: '', value: '', type: 'loan', date: new Date().toISOString().split('T')[0]
  })
  const [netWorthHistory, setNetWorthHistory] = useState<any[]>([])
  
  const [tradingGoals, setTradingGoals] = useState<any[]>([])
  const [newTradingGoal, setNewTradingGoal] = useState({
    name: '', target: '', current: '', deadline: '', type: 'profit'
  })
  
  const [trades, setTrades] = useState<any[]>([])
  const [newTrade, setNewTrade] = useState({
    date: new Date().toISOString().split('T')[0],
    instrument: '', direction: 'long', entryPrice: '', exitPrice: '', size: '',
    profitLoss: '', fees: '', notes: '', strategy: '', setup: '', timeframe: '1H',
    emotionalState: 'neutral', screenshot: null as string | null, aiAnalysis: null as string | null
  })
  
  const [tradingCosts, setTradingCosts] = useState({
    monthlyBrokerFees: 0, subscriptions: [] as any[], challenges: [] as any[], dataSoftware: [] as any[]
  })
  
  const [newCost, setNewCost] = useState({
    name: '', cost: '', frequency: 'monthly', type: 'subscription'
  })
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string>('')
  
  const [tradeFinderScreenshots, setTradeFinderScreenshots] = useState({
    oneHour: null as string | null,
    fifteenMin: null as string | null,
    fiveMin: null as string | null
  })
  const [isAnalyzingTrade, setIsAnalyzingTrade] = useState(false)
  const [tradeRecommendation, setTradeRecommendation] = useState<any>(null)
  
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [chatInput, setChatInput] = useState('')
  const [isAskingCoach, setIsAskingCoach] = useState(false)
  
  // PUSH NOTIFICATIONS
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true)
    }
  }, [])
  
  const enableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        new Notification('✅ Notifications Enabled!', {
          body: "You'll get reminders for upcoming bills and payments",
          icon: '/icon.png'
        })
      }
    }
  }
  
  // Check for upcoming calendar items and send notifications
  useEffect(() => {
    if (!notificationsEnabled) return
    
    const checkCalendar = () => {
      const today = new Date()
      const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
      
      calendarItems.forEach(item => {
        if (item.isPaid) return
        const dueDate = new Date(item.dueDate)
        if (dueDate >= today && dueDate <= threeDaysFromNow) {
          new Notification(`💰 Upcoming: ${item.name}`, {
            body: `$${item.amount} due on ${dueDate.toLocaleDateString()}`,
            icon: '/icon.png'
          })
        }
      })
    }
    
    checkCalendar()
    const interval = setInterval(checkCalendar, 24 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [calendarItems, notificationsEnabled])
  
  // CALCULATIONS WITH CALENDAR DEDUCTIONS
  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => {
    const amount = parseFloat(t.amount || 0)
    const multiplier = t.frequency === 'weekly' ? 52/12 : t.frequency === 'fortnightly' ? 26/12 : t.frequency === 'yearly' ? 1/12 : 1
    return sum + (amount * multiplier)
  }, 0)
  
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => {
    const amount = parseFloat(t.amount || 0)
    const multiplier = t.frequency === 'weekly' ? 52/12 : t.frequency === 'fortnightly' ? 26/12 : t.frequency === 'yearly' ? 1/12 : 1
    return sum + (amount * multiplier)
  }, 0)
  
  // Calculate committed calendar payments (recurring items only, not one-time, EXCLUDE income)
  // Count original recurring items even if some individual occurrences are marked paid
  const committedCalendarPayments = calendarItems
    .filter(item => 
      item.frequency && 
      item.frequency !== 'once' && 
      !item.isOverride &&  // Exclude the "paid" override entries
      item.type !== 'income'  // Income adds to surplus, doesn't reduce it
    )
    .reduce((sum, item) => {
      const amount = parseFloat(item.amount || 0)
      if (item.frequency === 'weekly') return sum + (amount * 52 / 12)
      if (item.frequency === 'fortnightly') return sum + (amount * 26 / 12)
      if (item.frequency === 'monthly') return sum + amount
      if (item.frequency === 'yearly') return sum + (amount / 12)
      return sum
    }, 0)
  
  const monthlySurplus = totalIncome - totalExpenses - committedCalendarPayments
  const totalGoalsTarget = goals.reduce((sum, g) => sum + parseFloat(g.target || 0), 0)
  const totalGoalsSaved = goals.reduce((sum, g) => sum + parseFloat(g.saved || 0), 0)
  const totalGoalsRemaining = totalGoalsTarget - totalGoalsSaved
  
  const totalDebt = debts.reduce((sum, d) => sum + parseFloat(d.balance || 0), 0)
  const totalMinPayments = debts.reduce((sum, d) => sum + parseFloat(d.minPayment || 0), 0)
  
  const totalAssets = assets.reduce((sum, a) => sum + parseFloat(a.value || 0), 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + parseFloat(l.value || 0), 0)
  const netWorth = totalAssets - totalLiabilities
  
  const totalPL = trades.reduce((sum, t) => sum + parseFloat(t.profitLoss || 0), 0)
  const winners = trades.filter(t => parseFloat(t.profitLoss || 0) > 0)
  const losers = trades.filter(t => parseFloat(t.profitLoss || 0) < 0)
  const winRate = trades.length > 0 ? (winners.length / trades.length) * 100 : 0
  const avgWin = winners.length > 0 ? winners.reduce((sum, t) => sum + parseFloat(t.profitLoss), 0) / winners.length : 0
  const avgLoss = losers.length > 0 ? Math.abs(losers.reduce((sum, t) => sum + parseFloat(t.profitLoss), 0) / losers.length) : 0
  const profitFactor = avgLoss > 0 ? (avgWin * winners.length) / (avgLoss * losers.length) : 0
  
  const monthlyCosts = tradingCosts.monthlyBrokerFees + 
    [...tradingCosts.subscriptions, ...tradingCosts.challenges, ...tradingCosts.dataSoftware]
    .reduce((sum, item) => {
      const multiplier = item.frequency === 'yearly' ? 1/12 : 1
      return sum + (parseFloat(item.cost || 0) * multiplier)
    }, 0)
  
  const netPL = totalPL - monthlyCosts
  
  // THEME COLORS
  const theme = {
    bg: darkMode ? '#0f172a' : 'linear-gradient(to bottom right, #eef2ff, #fce7f3)',
    cardBg: darkMode ? '#1e293b' : 'white',
    text: darkMode ? '#f1f5f9' : '#1e293b',
    textMuted: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#e2e8f0',
    input: darkMode ? '#334155' : '#ffffff',
    inputBorder: darkMode ? '#475569' : '#e2e8f0'
  }
  // CALENDAR NAVIGATION
  const prevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
  }
  
  const nextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))
  }
  
  const getDaysInMonth = () => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth, month, year }
  }
  
  // ADD FUNCTIONS
  const addGoal = () => {
    if (!newGoal.name || !newGoal.target) return
    setGoals([...goals, { ...newGoal, id: Date.now() }])
    setNewGoal({ name: '', target: '', saved: '', deadline: '', frequency: 'monthly' })
  }
  
  const addTransaction = () => {
    if (!newTransaction.name || !newTransaction.amount) return
    setTransactions([...transactions, { ...newTransaction, id: Date.now() }])
    setNewTransaction({ name: '', amount: '', type: 'expense', date: new Date().toISOString().split('T')[0], frequency: 'monthly' })
  }
  
  const addBill = () => {
    if (!newBill.name || !newBill.amount || !newBill.dueDate) return
    setCalendarItems([...calendarItems, { ...newBill, id: Date.now() }].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()))
    setNewBill({ name: '', amount: '', dueDate: '', frequency: 'monthly', isPaid: false, type: 'bill' })
  }
  
  const addDebt = () => {
    if (!newDebt.name || !newDebt.balance) return
    setDebts([...debts, { 
      ...newDebt, 
      id: Date.now(),
      originalBalance: newDebt.balance // Store original for progress tracking
    }])
    setNewDebt({ name: '', balance: '', interestRate: '', minPayment: '', type: 'credit_card', frequency: 'monthly' })
  }
  
  const addAsset = () => {
    if (!newAsset.name || !newAsset.value) return
    setAssets([...assets, { ...newAsset, id: Date.now() }])
    setNewAsset({ name: '', value: '', type: 'savings', date: new Date().toISOString().split('T')[0] })
    updateNetWorthHistory()
  }
  
  const addLiability = () => {
    if (!newLiability.name || !newLiability.value) return
    setLiabilities([...liabilities, { ...newLiability, id: Date.now() }])
    setNewLiability({ name: '', value: '', type: 'loan', date: new Date().toISOString().split('T')[0] })
    updateNetWorthHistory()
  }
  
  const addTradingGoal = () => {
    if (!newTradingGoal.name || !newTradingGoal.target) return
    setTradingGoals([...tradingGoals, { ...newTradingGoal, id: Date.now() }])
    setNewTradingGoal({ name: '', target: '', current: '', deadline: '', type: 'profit' })
  }
  
  const addTrade = () => {
    if (!newTrade.instrument) return
    setTrades([...trades, { 
      ...newTrade, 
      id: Date.now(),
      screenshot: newTrade.screenshot,
      aiAnalysis: analysisResult || null
    }].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    setNewTrade({
      date: new Date().toISOString().split('T')[0],
      instrument: '', direction: 'long', entryPrice: '', exitPrice: '', size: '',
      profitLoss: '', fees: '', notes: '', strategy: '', setup: '', timeframe: '1H',
      emotionalState: 'neutral', screenshot: null, aiAnalysis: null
    })
    setAnalysisResult('')
  }
  
  const addCost = () => {
    if (!newCost.name || !newCost.cost) return
    const list = newCost.type === 'subscription' ? 'subscriptions' : newCost.type === 'challenge' ? 'challenges' : 'dataSoftware'
    setTradingCosts({
      ...tradingCosts,
      [list]: [...tradingCosts[list], { ...newCost, id: Date.now() }]
    })
    setNewCost({ name: '', cost: '', frequency: 'monthly', type: 'subscription' })
  }
  
  // DELETE FUNCTIONS
  const deleteGoal = (id: number) => {
    setGoals(goals.filter(g => g.id !== id))
    setCalendarItems(calendarItems.filter(item => !(item.sourceId === id && item.type === 'goal')))
  }
  
  const deleteTransaction = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id))
    setCalendarItems(calendarItems.filter(item => !(item.sourceId === id && (item.type === 'income' || item.type === 'expense'))))
  }
  
  const deleteBill = (id: number) => {
    setCalendarItems(calendarItems.filter(b => b.id !== id))
  }
  
  const deleteDebt = (id: number) => {
    setDebts(debts.filter(d => d.id !== id))
    setCalendarItems(calendarItems.filter(item => !(item.sourceId === id && item.type === 'debt')))
  }
  
  const deleteAsset = (id: number) => {
    setAssets(assets.filter(a => a.id !== id))
    updateNetWorthHistory()
  }
  
  const deleteLiability = (id: number) => {
    setLiabilities(liabilities.filter(l => l.id !== id))
    updateNetWorthHistory()
  }
  
  // FIXED: toggleBillPaid - stores sourceId so we can match specific dates
  const toggleBillPaid = (itemId: string | number) => {
    if (typeof itemId === 'string' && itemId.includes('-')) {
      const [originalId, ...dateParts] = itemId.split('-')
      const occurrenceDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`
      
      const originalItem = calendarItems.find(item => item.id.toString() === originalId)
      if (originalItem) {
        setCalendarItems([...calendarItems, {
          ...originalItem,
          id: Date.now(),
          sourceId: originalItem.id, // CRITICAL: Store the original item ID here
          dueDate: occurrenceDate,
          frequency: 'once',
          isPaid: true,
          isOverride: true
        }])
      }
    } else {
      setCalendarItems(calendarItems.map(b => b.id === itemId ? { ...b, isPaid: !b.isPaid } : b))
    }
  }
  
  // MARK GOAL PAYMENT AS PAID (updates saved amount + progress bar)
  const markGoalPaymentPaid = (itemId: string | number, goalId: number, amount: number) => {
    // Mark the calendar item as paid
    toggleBillPaid(itemId)
    
    // Update the goal's saved amount
    setGoals(goals.map(g => {
      if (g.id === goalId) {
        const currentSaved = parseFloat(g.saved || 0)
        const newSaved = currentSaved + amount
        return { ...g, saved: newSaved.toFixed(2) }
      }
      return g
    }))
  }
  
  // MARK DEBT PAYMENT AS PAID (updates balance + progress bar)
  const markDebtPaymentPaid = (itemId: string | number, debtId: number, amount: number) => {
    // Mark the calendar item as paid
    toggleBillPaid(itemId)
    
    // Update the debt's balance
    setDebts(debts.map(d => {
      if (d.id === debtId) {
        const currentBalance = parseFloat(d.balance || 0)
        const newBalance = Math.max(0, currentBalance - amount)
        return { ...d, balance: newBalance.toFixed(2) }
      }
      return d
    }))
  }
  
  // ADD TO CALENDAR FUNCTIONS
  const addGoalToCalendar = (goal: any) => {
    if (!goal.deadline) {
      alert('⚠️ Goal needs a deadline to add to calendar')
      return
    }
    
    const exists = calendarItems.find(item => item.sourceId === goal.id && item.type === 'goal')
    if (exists) {
      alert('⚠️ Goal already on calendar')
      return
    }
    
    // Calculate savings plan first
    const plan = calculateSavingsPlan(goal)
    if (!plan) {
      alert('⚠️ Could not calculate savings plan for this goal')
      return
    }
    
    // Prompt for frequency
    const freqChoice = prompt(`How often do you want to save for "${goal.name}"?\n\n1 = Weekly ($${(plan.monthlyNeeded / (52/12)).toFixed(2)}/week)\n2 = Fortnightly ($${(plan.monthlyNeeded / (26/12)).toFixed(2)}/fortnight)\n3 = Monthly ($${plan.monthlyNeeded.toFixed(2)}/month)\n\nEnter 1, 2, or 3:`, '3')
    
    let freq = 'monthly'
    let amount = plan.monthlyNeeded
    
    if (freqChoice === '1') {
      freq = 'weekly'
      amount = plan.monthlyNeeded / (52/12)
    } else if (freqChoice === '2') {
      freq = 'fortnightly'
      amount = plan.monthlyNeeded / (26/12)
    }
    
    const userDate = prompt(`📅 When should the first "${goal.name}" payment of $${amount.toFixed(2)} start?\n\nEnter date (YYYY-MM-DD):`, new Date().toISOString().split('T')[0])
    if (!userDate) return
    
    setCalendarItems([...calendarItems, {
      id: Date.now(),
      sourceId: goal.id,
      name: `🎯 ${goal.name} Savings`,
      amount: amount.toFixed(2),
      dueDate: userDate,
      frequency: freq,
      isPaid: false,
      type: 'goal'
    }].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()))
    alert(`✅ Goal savings ($${amount.toFixed(2)}/${freq}) added to calendar!`)
  }
  
  const addTransactionToCalendar = (transaction: any) => {
    const exists = calendarItems.find(item => item.sourceId === transaction.id && item.type === transaction.type)
    if (exists) {
      alert('⚠️ Transaction already on calendar')
      return
    }
    
    const userDate = prompt(`📅 When should "${transaction.name}" appear on the calendar?\n\nEnter date (YYYY-MM-DD):`, new Date().toISOString().split('T')[0])
    if (!userDate) return
    
    setCalendarItems([...calendarItems, {
      id: Date.now(),
      sourceId: transaction.id,
      name: transaction.type === 'income' ? `💰 ${transaction.name}` : `💸 ${transaction.name}`,
      amount: transaction.amount,
      dueDate: userDate,
      frequency: transaction.frequency,
      isPaid: false,
      type: transaction.type
    }].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()))
    alert('✅ Transaction added to calendar!')
  }
  
  const addDebtToCalendar = (debt: any) => {
    const exists = calendarItems.find(item => item.sourceId === debt.id && item.type === 'debt')
    if (exists) {
      alert('⚠️ Debt payment already on calendar')
      return
    }
    
    const userDate = prompt(`📅 When is "${debt.name}" payment due?\n\nEnter date (YYYY-MM-DD):`, new Date().toISOString().split('T')[0])
    if (!userDate) return
    
    // Calculate payment amount based on frequency
    const minPayment = parseFloat(debt.minPayment)
    let amount = minPayment
    if (debt.frequency === 'weekly') amount = minPayment / (52/12)
    else if (debt.frequency === 'fortnightly') amount = minPayment / (26/12)
    
    setCalendarItems([...calendarItems, {
      id: Date.now(),
      sourceId: debt.id,
      name: `💳 ${debt.name} Payment`,
      amount: amount.toFixed(2),
      dueDate: userDate,
      frequency: debt.frequency,
      isPaid: false,
      type: 'debt'
    }].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()))
    alert('✅ Debt payment added to calendar!')
  }
  
  const addExtraDebtPaymentToCalendar = () => {
    if (!extraPayment || parseFloat(extraPayment) <= 0) {
      alert('⚠️ Please enter an extra payment amount first')
      return
    }
    
    const userDate = prompt(`📅 When should your extra debt payment of $${extraPayment} start?\n\nEnter date (YYYY-MM-DD):`, new Date().toISOString().split('T')[0])
    if (!userDate) return
    
    setCalendarItems([...calendarItems, {
      id: Date.now(),
      sourceId: 'extra-debt',
      name: `💳 Extra Debt Payment`,
      amount: extraPayment,
      dueDate: userDate,
      frequency: 'monthly',
      isPaid: false,
      type: 'debt'
    }].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()))
    alert('✅ Extra debt payment added to calendar!')
  }
  
  const updateNetWorthHistory = () => {
    const today = new Date().toISOString().split('T')[0]
    const currentAssets = assets.reduce((sum, a) => sum + parseFloat(a.value || 0), 0)
    const currentLiabilities = liabilities.reduce((sum, l) => sum + parseFloat(l.value || 0), 0)
    const currentNetWorth = currentAssets - currentLiabilities
    
    const existingEntry = netWorthHistory.find(h => h.date === today)
    if (existingEntry) {
      setNetWorthHistory(netWorthHistory.map(h => 
        h.date === today ? { ...h, value: currentNetWorth } : h
      ))
    } else {
      setNetWorthHistory([...netWorthHistory, { date: today, value: currentNetWorth }].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ))
    }
  }
  
  const calculateSavingsPlan = (goal: any) => {
    const target = parseFloat(goal.target || 0)
    const saved = parseFloat(goal.saved || 0)
    const remaining = target - saved
    
    if (!goal.deadline || remaining <= 0) return null
    
    const today = new Date()
    const deadline = new Date(goal.deadline)
    const monthsRemaining = Math.max(1, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)))
    
    const monthlyNeeded = remaining / monthsRemaining
    
    const incomeTransactions = transactions.filter(t => t.type === 'income')
    const primaryIncome = incomeTransactions[0]
    const frequency = primaryIncome?.frequency || 'monthly'
    
    let paymentsPerMonth = 1
    if (frequency === 'weekly') paymentsPerMonth = 52/12
    if (frequency === 'fortnightly') paymentsPerMonth = 26/12
    
    const perPaycheck = monthlyNeeded / paymentsPerMonth
    
    return {
      monthlyNeeded,
      perPaycheck,
      paymentsPerMonth,
      frequency,
      monthsRemaining,
      remaining
    }
  }
  
  const calculateDebtPayoff = () => {
    const extra = parseFloat(extraPayment || '0')
    const sortedDebts = [...debts].sort((a, b) => {
      if (payoffMethod === 'snowball') {
        return parseFloat(a.balance) - parseFloat(b.balance)
      } else {
        return parseFloat(b.interestRate) - parseFloat(a.interestRate)
      }
    })
    
    let remainingDebts = sortedDebts.map(d => ({
      ...d,
      remainingBalance: parseFloat(d.balance),
      monthsPaid: 0
    }))
    
    let totalInterestPaid = 0
    let monthsToPayoff = 0
    let availableExtra = extra
    
    while (remainingDebts.some(d => d.remainingBalance > 0)) {
      monthsToPayoff++
      if (monthsToPayoff > 600) break
      
      remainingDebts.forEach((debt, idx) => {
        if (debt.remainingBalance <= 0) return
        
        const monthlyInterest = (debt.remainingBalance * parseFloat(debt.interestRate) / 100) / 12
        totalInterestPaid += monthlyInterest
        
        const minPayment = parseFloat(debt.minPayment)
        const extraForThis = idx === 0 ? availableExtra : 0
        const totalPayment = minPayment + extraForThis
        
        debt.remainingBalance = Math.max(0, debt.remainingBalance + monthlyInterest - totalPayment)
        
        if (debt.remainingBalance === 0) {
          availableExtra += minPayment
        }
      })
    }
    
    return { monthsToPayoff, totalInterestPaid, payoffOrder: sortedDebts }
  }
  
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setNewTrade({ ...newTrade, screenshot: reader.result as string })
    }
    reader.readAsDataURL(file)
  }
  
  const analyzeScreenshot = async () => {
    if (!newTrade.screenshot) {
      alert('Please upload a screenshot first!')
      return
    }
    
    setIsAnalyzing(true)
    setAnalysisResult('')
    
    try {
      const response = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: newTrade.screenshot })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setAnalysisResult(`Error: ${data.error || 'Analysis failed'}`)
        return
      }
      
      const analysis = data.analysis
      setAnalysisResult(analysis)
      
      const analysisLower = analysis.toLowerCase()
      
      if (analysisLower.includes('long') || analysisLower.includes('buy')) {
        setNewTrade(prev => ({ ...prev, direction: 'long' }))
      } else if (analysisLower.includes('short') || analysisLower.includes('sell')) {
        setNewTrade(prev => ({ ...prev, direction: 'short' }))
      }
      
      if (analysisLower.includes('1h') || analysisLower.includes('1 hour')) {
        setNewTrade(prev => ({ ...prev, timeframe: '1H' }))
      } else if (analysisLower.includes('15m')) {
        setNewTrade(prev => ({ ...prev, timeframe: '15M' }))
      } else if (analysisLower.includes('4h')) {
        setNewTrade(prev => ({ ...prev, timeframe: '4H' }))
      } else if (analysisLower.includes('daily')) {
        setNewTrade(prev => ({ ...prev, timeframe: 'D' }))
      }
      
    } catch (error) {
      setAnalysisResult('Error analyzing screenshot')
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  const handleTradeFinderUpload = (timeframe: 'oneHour' | 'fifteenMin' | 'fiveMin', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setTradeFinderScreenshots({
        ...tradeFinderScreenshots,
        [timeframe]: reader.result as string
      })
    }
    reader.readAsDataURL(file)
  }
  
  const analyzeTradeSetup = async () => {
    if (!tradeFinderScreenshots.oneHour || !tradeFinderScreenshots.fifteenMin || !tradeFinderScreenshots.fiveMin) {
      alert('Please upload all 3 screenshots (1H, 15M, 5M)')
      return
    }
    
    setIsAnalyzingTrade(true)
    setTradeRecommendation(null)
    
    try {
      const analyses = await Promise.all([
        fetch('/api/analyze-screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: tradeFinderScreenshots.oneHour })
        }).then(r => r.json()),
        fetch('/api/analyze-screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: tradeFinderScreenshots.fifteenMin })
        }).then(r => r.json()),
        fetch('/api/analyze-screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: tradeFinderScreenshots.fiveMin })
        }).then(r => r.json())
      ])
      
      const finalResponse = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          analyses: analyses.map(a => a.analysis || a.error || 'Analysis failed')
        })
      })
      
      const finalData = await finalResponse.json()
      
      if (!finalResponse.ok) {
        setTradeRecommendation({ error: finalData.error || 'Analysis failed' })
        return
      }
      
      const recommendation = parseTradeRecommendation(finalData.recommendation || finalData.error || 'Analysis failed')
      setTradeRecommendation(recommendation)
      
    } catch (error) {
      console.error('Trade analysis error:', error)
      setTradeRecommendation({ error: 'Error analyzing trade setup. Please try again.' })
    } finally {
      setIsAnalyzingTrade(false)
    }
  }
  
  const parseTradeRecommendation = (text: string) => {
    const rec: any = { raw: text }
    const lines = text.split('\n')
    
    lines.forEach((line, idx) => {
      const cleanLine = line.trim()
      if (cleanLine.startsWith('TRADE:')) rec.shouldTrade = cleanLine.includes('YES')
      if (cleanLine.startsWith('PAIR:')) rec.pair = cleanLine.split(':')[1]?.trim()
      if (cleanLine.startsWith('DIRECTION:')) rec.direction = cleanLine.split(':')[1]?.trim()
      if (cleanLine.startsWith('ENTRY:')) rec.entry = cleanLine.split(':')[1]?.trim()
      if (cleanLine.startsWith('STOP_LOSS:')) rec.stopLoss = cleanLine.split(':')[1]?.trim()
      if (cleanLine.startsWith('TAKE_PROFIT:')) rec.takeProfit = cleanLine.split(':')[1]?.trim()
      if (cleanLine.startsWith('RISK_PIPS:')) rec.riskPips = cleanLine.split(':')[1]?.trim()
      if (cleanLine.startsWith('REWARD_PIPS:')) rec.rewardPips = cleanLine.split(':')[1]?.trim()
      if (cleanLine.startsWith('RISK_REWARD:')) rec.riskReward = cleanLine.split(':')[1]?.trim()
      if (cleanLine.startsWith('CONFIDENCE:')) rec.confidence = cleanLine.split(':')[1]?.trim()
      if (cleanLine.startsWith('REASONING:')) {
        rec.reasoning = lines.slice(idx + 1).filter(l => l.trim()).join('\n')
      }
    })
    
    return rec
  }
  
  const askBudgetCoach = async (question?: string) => {
    const userQuestion = question || chatInput
    if (!userQuestion.trim()) return
    
    const newUserMessage = { role: 'user' as const, content: userQuestion }
    setChatMessages([...chatMessages, newUserMessage])
    setChatInput('')
    setIsAskingCoach(true)
    
    try {
      const financialContext = `
USER FINANCIAL DATA:
- Monthly Income: $${totalIncome.toFixed(2)}
- Monthly Expenses: $${totalExpenses.toFixed(2)}
- Committed Calendar Payments: $${committedCalendarPayments.toFixed(2)}
- Monthly Surplus: $${monthlySurplus.toFixed(2)}
- Total Goals Target: $${totalGoalsTarget.toFixed(2)}
- Total Saved Towards Goals: $${totalGoalsSaved.toFixed(2)}
- Remaining to Save: $${totalGoalsRemaining.toFixed(2)}
- Total Debt: $${totalDebt.toFixed(2)}
- Net Worth: $${netWorth.toFixed(2)}

GOALS:
${goals.map(g => `- ${g.name}: $${g.saved || 0} / $${g.target} (${g.deadline ? 'deadline: ' + g.deadline : 'no deadline'})`).join('\n') || 'No goals set yet'}

DEBTS:
${debts.map(d => `- ${d.name}: $${d.balance} @ ${d.interestRate}% APR (min payment: $${d.minPayment})`).join('\n') || 'No debts tracked'}

INCOME SOURCES:
${transactions.filter(t => t.type === 'income').map(t => `- ${t.name}: $${t.amount}/${t.frequency || 'monthly'}`).join('\n') || 'No income tracked yet'}

EXPENSES:
${transactions.filter(t => t.type === 'expense').map(t => `- ${t.name}: $${t.amount}/${t.frequency || 'monthly'}`).join('\n') || 'No expenses tracked yet'}`

      const response = await fetch('/api/budget-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: userQuestion,
          financialContext
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setChatMessages([...chatMessages, newUserMessage, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.' 
        }])
        return
      }
      
      const aiResponse = data.advice || 'I apologize, but I could not generate a response.'
      setChatMessages([...chatMessages, newUserMessage, { role: 'assistant', content: aiResponse }])
      
    } catch (error) {
      setChatMessages([...chatMessages, newUserMessage, { 
        role: 'assistant', 
        content: 'Sorry, something went wrong. Please try again.' 
      }])
    } finally {
      setIsAskingCoach(false)
    }
  }
  
  const getTradesForDay = (day: number) => {
    const { month, year } = getDaysInMonth()
    return trades.filter(t => {
      const tDate = new Date(t.date)
      return tDate.getDate() === day && tDate.getMonth() === month && tDate.getFullYear() === year
    })
  }
  
  const getCalendarItemsForDay = (day: number) => {
    const { month, year } = getDaysInMonth()
    const items: any[] = []
    
    calendarItems.forEach(item => {
      const itemDate = new Date(item.dueDate)
      const itemDay = itemDate.getDate()
      const itemMonth = itemDate.getMonth()
      const itemYear = itemDate.getFullYear()
      
      if (itemDay === day && itemMonth === month && itemYear === year) {
        items.push(item)
        return
      }
      
      if (item.frequency && item.frequency !== 'once') {
        const currentDate = new Date(year, month, day)
        const startDate = new Date(item.dueDate)
        
        if (currentDate >= startDate) {
          let shouldShow = false
          
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
          
          if (shouldShow) {
            items.push({
              ...item,
              id: `${item.id}-${year}-${month}-${day}`,
              isRecurrence: true,
              occurrenceDate: currentDate.toISOString().split('T')[0]
            })
          }
        }
      }
    })
    
    return items
  }
  
  const convertToMonthly = (amount: number, frequency: string) => {
    const multiplier = frequency === 'weekly' ? 52/12 : frequency === 'fortnightly' ? 26/12 : frequency === 'yearly' ? 1/12 : 1
    return amount * multiplier
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
   <div style={{ background: 'linear-gradient(to right, #4f46e5, #7c3aed)', color: 'white', padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>✨ Premium Finance Pro</h1>
              <p style={{ opacity: '0.9', margin: 0 }}>
                Welcome, {user?.firstName || 'User'}! {mainTab === 'finance' ? "Let's achieve your goals." : "Let's master trading!"}
              </p>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              style={{ 
                padding: '10px 20px', 
                background: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                border: '2px solid white', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <button onClick={() => setMainTab("finance")} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', background: mainTab === "finance" ? "white" : "rgba(255,255,255,0.2)", color: mainTab === "finance" ? "#4f46e5" : "white" }}>💰 Personal Finance</button>
            <button onClick={() => setMainTab("trading")} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', background: mainTab === "trading" ? "white" : "rgba(255,255,255,0.2)", color: mainTab === "trading" ? "#4f46e5" : "white" }}>📈 Trading</button>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {mainTab === 'finance' ? (
              <>
                {[
                  { id: "dashboard", label: "📊 Dashboard" }, 
                  { id: "coach", label: "💬 AI Coach" }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setFinanceTab(tab.id)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500', background: financeTab === tab.id ? "white" : "rgba(255,255,255,0.1)", color: financeTab === tab.id ? "#4f46e5" : "white" }}>{tab.label}</button>
                ))}
              </>
            ) : (
              <>
                {[{ id: "trading-goals", label: "🎯 Goals" }, { id: "performance", label: "📊 Performance" }, { id: "trading-path", label: "🗺️ Path" }, { id: "finder", label: "🔮 Trade Finder" }, { id: "journal", label: "📈 Journal" }, { id: "costs", label: "💸 Costs" }].map(tab => (
                  <button key={tab.id} onClick={() => setTradingTab(tab.id)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500', background: tradingTab === tab.id ? "white" : "rgba(255,255,255,0.1)", color: tradingTab === tab.id ? "#4f46e5" : "white" }}>{tab.label}</button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {mainTab === 'finance' && (
          <>
            {financeTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 1. CURRENT POSITION */}
                <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: darkMode ? '1px solid #334155' : 'none' }}>
                  <h2 style={{ fontSize: '28px', marginBottom: '24px', color: theme.text }}>📊 Current Position</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ padding: '20px', background: darkMode ? '#064e3b' : '#f0fdf4', borderRadius: '12px', border: '2px solid #10b981' }}>
                      <h3 style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '8px' }}>💰 Monthly Income</h3>
                      <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>${totalIncome.toFixed(2)}</p>
                    </div>
                    <div style={{ padding: '20px', background: darkMode ? '#7f1d1d' : '#fef2f2', borderRadius: '12px', border: '2px solid #ef4444' }}>
                      <h3 style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '8px' }}>💸 Monthly Expenses</h3>
                      <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444', margin: 0 }}>${totalExpenses.toFixed(2)}</p>
                    </div>
                    <div style={{ padding: '20px', background: darkMode ? '#1e3a8a' : '#f0f9ff', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                      <h3 style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '8px' }}>📅 Calendar Commitments</h3>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>${committedCalendarPayments.toFixed(2)}</p>
                    </div>
                    <div style={{ padding: '20px', background: darkMode ? (monthlySurplus >= 0 ? '#064e3b' : '#7f1d1d') : (monthlySurplus >= 0 ? '#f0fdf4' : '#fef2f2'), borderRadius: '12px', border: `2px solid ${monthlySurplus >= 0 ? '#10b981' : '#ef4444'}` }}>
                      <h3 style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '8px' }}>📈 Available Surplus</h3>
                      <p style={{ fontSize: '28px', fontWeight: 'bold', color: monthlySurplus >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>${monthlySurplus.toFixed(2)}</p>
                      <p style={{ fontSize: '11px', color: theme.textMuted, margin: '4px 0 0 0' }}>After all commitments</p>
                    </div>
                    <div style={{ padding: '20px', background: darkMode ? '#713f12' : '#fef3c7', borderRadius: '12px', border: '2px solid #f59e0b' }}>
                      <h3 style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '8px' }}>💎 Net Worth</h3>
                      <p style={{ fontSize: '28px', fontWeight: 'bold', color: netWorth >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>${netWorth.toFixed(2)}</p>
                    </div>
                    <div style={{ padding: '20px', background: darkMode ? '#1e3a8a' : '#f0f9ff', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                      <h3 style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '8px' }}>📊 This Month Projected</h3>
                      <p style={{ fontSize: '28px', fontWeight: 'bold', color: monthlySurplus >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>
                        ${monthlySurplus.toFixed(2)}
                      </p>
                      <p style={{ fontSize: '11px', color: theme.textMuted, margin: '4px 0 0 0' }}>Income - Expenses - Commitments</p>
                    </div>
                  </div>
                </div>
                {/* 2. CALENDAR WITH UPCOMING PAYMENTS */}
                <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: darkMode ? '1px solid #334155' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                    <h2 style={{ fontSize: '28px', margin: 0, color: theme.text }}>📅 Calendar & Reminders</h2>
                    {!notificationsEnabled && (
                      <button onClick={enableNotifications} style={{ padding: '10px 20px', background: 'linear-gradient(to right, #7c3aed, #6d28d9)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                        🔔 Enable Notifications
                      </button>
                    )}
                  </div>
                  
                  <div style={{ marginBottom: '24px', padding: '20px', background: darkMode ? '#713f12' : '#fef3c7', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: '600', color: theme.text }}>Add Bill/Reminder</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                      <input type="text" placeholder="Name" value={newBill.name} onChange={(e) => setNewBill({...newBill, name: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', background: theme.input, color: theme.text }} />
                      <input type="number" placeholder="Amount" value={newBill.amount} onChange={(e) => setNewBill({...newBill, amount: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', background: theme.input, color: theme.text }} />
                      <input type="date" value={newBill.dueDate} onChange={(e) => setNewBill({...newBill, dueDate: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', background: theme.input, color: theme.text }} />
                      <select value={newBill.frequency} onChange={(e) => setNewBill({...newBill, frequency: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', background: theme.input, color: theme.text }}>
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                        <option value="fortnightly">Fortnightly</option>
                        <option value="yearly">Yearly</option>
                        <option value="once">One-time</option>
                      </select>
                      <button onClick={addBill} style={{ padding: '10px 20px', background: 'linear-gradient(to right, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Add Bill</button>
                    </div>
                  </div>
                  
                  {/* UPCOMING SECTION - Shows ALL recurring items for next 30 days with FIXED wasPaid check */}
                  {(() => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
                    
                    const upcomingItems: any[] = []
                    
                    calendarItems.forEach(item => {
                      if (item.isOverride) return // Skip override entries
                      
                      const itemDate = new Date(item.dueDate)
                      itemDate.setHours(0, 0, 0, 0)
                      
                      // For one-time items
                      if (item.frequency === 'once') {
                        if (!item.isPaid && itemDate >= today && itemDate <= thirtyDaysFromNow) {
                          upcomingItems.push({
                            ...item,
                            displayDate: itemDate,
                            occurrenceId: item.id
                          })
                        }
                        return
                      }
                      
                      // For recurring items, calculate all occurrences in next 30 days
                      let currentDate = new Date(itemDate)
                      
                      while (currentDate <= thirtyDaysFromNow) {
                        if (currentDate >= today) {
                          const occurrenceKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
                          
                          // FIXED: Check if this EXACT date was marked paid (match against recurring item's ID)
                          const wasPaid = calendarItems.some(i => 
                            i.isOverride && 
                            i.sourceId === item.id && // Match against the recurring item's ID
                            i.dueDate === occurrenceKey &&
                            i.isPaid
                          )
                          
                          if (!wasPaid) {
                            upcomingItems.push({
                              ...item,
                              displayDate: new Date(currentDate),
                              occurrenceId: `${item.id}-${occurrenceKey}`,
                              actualDueDate: occurrenceKey
                            })
                          }
                        }
                        
                        // Move to next occurrence
                        if (item.frequency === 'weekly') {
                          currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
                        } else if (item.frequency === 'fortnightly') {
                          currentDate = new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000)
                        } else if (item.frequency === 'monthly') {
                          currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate())
                        } else if (item.frequency === 'yearly') {
                          currentDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate())
                        } else {
                          break
                        }
                      }
                    })
                    
                    // Sort by date
                    upcomingItems.sort((a, b) => a.displayDate.getTime() - b.displayDate.getTime())
                    
                    return upcomingItems.length > 0 ? (
                      <div style={{ marginBottom: '24px', padding: '20px', background: darkMode ? '#7f1d1d' : '#fef2f2', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: '600', color: theme.text }}>🔔 Upcoming (Next 30 Days)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {upcomingItems.slice(0, 15).map((item, idx) => {
                            const daysUntil = Math.ceil((item.displayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                            const amount = parseFloat(item.amount)
                            
                            return (
                              <div key={`${item.occurrenceId}-${idx}`} style={{ padding: '12px', background: theme.cardBg, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', border: `1px solid ${theme.border}` }}>
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                  <div style={{ fontWeight: '600', fontSize: '15px', color: theme.text }}>{item.name}</div>
                                  <div style={{ fontSize: '12px', color: theme.textMuted }}>
                                    Due {item.displayDate.toLocaleDateString()} ({daysUntil} days) • {item.frequency}
                                  </div>
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: item.type === 'income' ? '#10b981' : '#ef4444' }}>
                                  {item.type === 'income' ? '+' : ''}${amount.toFixed(2)}
                                </div>
                                <button 
                                  onClick={() => {
                                    const dateToUse = item.actualDueDate || item.dueDate
                                    if (item.type === 'goal' && item.sourceId) {
                                      markGoalPaymentPaid(item.occurrenceId, item.sourceId, amount)
                                    } else if (item.type === 'debt' && item.sourceId) {
                                      markDebtPaymentPaid(item.occurrenceId, item.sourceId, amount)
                                    } else {
                                      toggleBillPaid(item.occurrenceId)
                                    }
                                  }} 
                                  style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}
                                >
                                  Mark Paid
                                </button>
                                <button onClick={() => deleteBill(item.id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                                  Delete
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : null
                  })()}
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                      <button onClick={prevMonth} style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>← Prev</button>
                      <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: theme.text }}>
                        📆 {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <button onClick={nextMonth} style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Next →</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '6px' }}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => 
                        <div key={d} style={{ padding: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', color: theme.textMuted }}>{d}</div>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                      {(() => {
                        const { firstDay, daysInMonth } = getDaysInMonth()
                        const cells = []
                        for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />)
                        for (let d = 1; d <= daysInMonth; d++) {
                          const dayItems = getCalendarItemsForDay(d)
                          const hasUnpaid = dayItems.some(item => !item.isPaid)
                          cells.push(
                            <div key={d} style={{ 
                              padding: '8px 4px', 
                              border: `1px solid ${theme.border}`, 
                              borderRadius: '6px', 
                              background: hasUnpaid ? (darkMode ? '#7f1d1d' : '#fef2f2') : theme.cardBg,
                              minHeight: '70px',
                              fontSize: '13px'
                            }}>
                              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: theme.text }}>{d}</div>
                              {dayItems.map(item => (
                                <div 
                                  key={item.id} 
                                  onClick={() => {
                                    if (item.isPaid) return // Already paid
                                    
                                    const amount = parseFloat(item.amount)
                                    
                                    // For recurring items
                                    if (item.isRecurrence) {
                                      const occurrenceId = item.id
                                      if (item.type === 'goal' && item.sourceId) {
                                        markGoalPaymentPaid(occurrenceId, item.sourceId, amount)
                                      } else if (item.type === 'debt' && item.sourceId) {
                                        markDebtPaymentPaid(occurrenceId, item.sourceId, amount)
                                      } else {
                                        toggleBillPaid(occurrenceId)
                                      }
                                    } else {
                                      // For one-time items
                                      if (item.type === 'goal' && item.sourceId) {
                                        markGoalPaymentPaid(item.id, item.sourceId, amount)
                                      } else if (item.type === 'debt' && item.sourceId) {
                                        markDebtPaymentPaid(item.id, item.sourceId, amount)
                                      } else {
                                        toggleBillPaid(item.id)
                                      }
                                    }
                                  }}
                                  style={{ 
                                    fontSize: '10px', 
                                    color: item.isPaid ? '#10b981' : item.type === 'goal' ? '#7c3aed' : item.type === 'income' ? '#10b981' : item.type === 'expense' ? '#ef4444' : item.type === 'debt' ? '#ef4444' : '#f59e0b',
                                    fontWeight: '600',
                                    marginBottom: '2px',
                                    textDecoration: item.isPaid ? 'line-through' : 'none',
                                    cursor: item.isPaid ? 'default' : 'pointer',
                                    padding: '2px',
                                    borderRadius: '3px',
                                    transition: 'background 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!item.isPaid) {
                                      e.currentTarget.style.background = darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent'
                                  }}
                                  title={item.isPaid ? 'Already paid' : `Click to mark as paid: ${item.name}`}
                                >
                                  {item.isPaid ? '✓' : item.type === 'goal' ? '🎯' : item.type === 'income' ? '💰' : item.type === 'expense' ? '💸' : item.type === 'debt' ? '💳' : '💰'} ${parseFloat(item.amount).toFixed(0)}
                                </div>
                              ))}
                            </div>
                          )
                        }
                        return cells
                      })()}
                    </div>
                  </div>
                </div>
                
                {/* 3. INCOME & EXPENSES */}
                <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: darkMode ? '1px solid #334155' : 'none' }}>
                  <h2 style={{ fontSize: '28px', marginBottom: '24px', color: theme.text }}>💰 Income & Expenses</h2>
                  <div style={{ marginBottom: '24px', padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                      <input type="text" placeholder="Name" value={newTransaction.name} onChange={(e) => setNewTransaction({...newTransaction, name: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', background: theme.input, color: theme.text }} />
                      <input type="number" placeholder="Amount" value={newTransaction.amount} onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', background: theme.input, color: theme.text }} />
                      <select value={newTransaction.frequency} onChange={(e) => setNewTransaction({...newTransaction, frequency: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', background: theme.input, color: theme.text }}>
                        <option value="weekly">Weekly</option>
                        <option value="fortnightly">Fortnightly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                      <select value={newTransaction.type} onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', background: theme.input, color: theme.text }}>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                      <button onClick={addTransaction} style={{ padding: '10px 20px', background: 'linear-gradient(to right, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Add</button>
                    </div>
                  </div>
                  {transactions.length === 0 ? (
                    <p style={{ color: theme.textMuted, textAlign: 'center', padding: '24px' }}>No transactions yet</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {transactions.map(t => {
                        const amount = parseFloat(t.amount)
                        const monthlyAmount = convertToMonthly(amount, t.frequency || 'monthly')
                        const onCalendar = calendarItems.some(item => item.sourceId === t.id && item.type === t.type)
                        return (
                          <div key={t.id} style={{ padding: '16px', background: darkMode ? (t.type === 'income' ? '#064e3b' : '#7f1d1d') : (t.type === 'income' ? '#f0fdf4' : '#fef2f2'), borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', border: `1px solid ${theme.border}` }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                              <div style={{ fontWeight: '600', fontSize: '16px', color: theme.text }}>{t.name}</div>
                              <div style={{ fontSize: '13px', color: theme.textMuted }}>
                                ${amount.toFixed(2)}/{t.frequency || 'monthly'} ≈ ${monthlyAmount.toFixed(2)}/month
                              </div>
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: t.type === 'income' ? '#10b981' : '#ef4444' }}>
                              {t.type === 'income' ? '+' : '-'}${amount.toFixed(2)}
                            </div>
                            <button 
                              onClick={() => addTransactionToCalendar(t)} 
                              disabled={onCalendar}
                              style={{ 
                                background: onCalendar ? '#94a3b8' : '#7c3aed', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '6px', 
                                padding: '6px 12px', 
                                cursor: onCalendar ? 'not-allowed' : 'pointer', 
                                fontSize: '12px', 
                                fontWeight: '600',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {onCalendar ? '✓ On Calendar' : '📅 Add to Calendar'}
                            </button>
                            <button onClick={() => deleteTransaction(t.id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Delete</button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
               {/* 4. DEBT PAYOFF WITH PROGRESS BARS */}
                <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: darkMode ? '1px solid #334155' : 'none' }}>
                  <h2 style={{ fontSize: '28px', marginBottom: '24px', color: theme.text }}>💳 Debt Payoff Calculator</h2>
                  <div style={{ marginBottom: '24px', padding: '20px', background: darkMode ? '#7f1d1d' : '#fef2f2', borderRadius: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                      <input type="text" placeholder="Debt name" value={newDebt.name} onChange={(e) => setNewDebt({...newDebt, name: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', background: theme.input, color: theme.text }} />
                      <input type="number" placeholder="Balance" value={newDebt.balance} onChange={(e) => setNewDebt({...newDebt, balance: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', background: theme.input, color: theme.text }} />
                      <input type="number" placeholder="Interest %" value={newDebt.interestRate} onChange={(e) => setNewDebt({...newDebt, interestRate: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', background: theme.input, color: theme.text }} />
                      <input type="number" placeholder="Min Payment" value={newDebt.minPayment} onChange={(e) => setNewDebt({...newDebt, minPayment: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', background: theme.input, color: theme.text }} />
                      <select value={newDebt.frequency} onChange={(e) => setNewDebt({...newDebt, frequency: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', background: theme.input, color: theme.text }}>
                        <option value="weekly">Weekly</option>
                        <option value="fortnightly">Fortnightly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      <button onClick={addDebt} style={{ padding: '10px 20px', background: 'linear-gradient(to right, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Add Debt</button>
                    </div>
                  </div>
                  
                  {debts.length > 0 && (
                    <>
                      <div style={{ marginBottom: '24px', padding: '20px', background: darkMode ? '#1e3a8a' : '#f0f9ff', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: '600', color: theme.text }}>⚡ Accelerate Payoff</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: theme.text }}>Extra Monthly Payment</label>
                            <input 
                              type="number" 
                              placeholder="0.00" 
                              value={extraPayment} 
                              onChange={(e) => setExtraPayment(e.target.value)} 
                              style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, width: '100%', fontSize: '14px', background: theme.input, color: theme.text }} 
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: theme.text }}>Method</label>
                            <select value={payoffMethod} onChange={(e) => setPayoffMethod(e.target.value as 'snowball' | 'avalanche')} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, width: '100%', fontSize: '14px', background: theme.input, color: theme.text }}>
                              <option value="avalanche">Avalanche (High Interest)</option>
                              <option value="snowball">Snowball (Low Balance)</option>
                            </select>
                          </div>
                        </div>
                        
                        <button onClick={addExtraDebtPaymentToCalendar} style={{ padding: '10px 20px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', marginBottom: '16px' }}>
                          📅 Add Extra Payment to Calendar
                        </button>
                        
                        {parseFloat(extraPayment || '0') > 0 && (() => {
                          const result = calculateDebtPayoff()
                          return (
                            <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '8px', border: '2px solid #10b981' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                                <div>
                                  <div style={{ fontSize: '12px', color: theme.textMuted }}>Debt-Free In</div>
                                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{result.monthsToPayoff} months</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '12px', color: theme.textMuted }}>Total Interest</div>
                                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>${result.totalInterestPaid.toFixed(2)}</div>
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {debts.map(debt => {
                          const onCalendar = calendarItems.some(item => item.sourceId === debt.id && item.type === 'debt')
                          
                          // Calculate progress
                          const originalBalance = debt.originalBalance ? parseFloat(debt.originalBalance) : parseFloat(debt.balance)
                          const currentBalance = parseFloat(debt.balance)
                          const paidOff = originalBalance - currentBalance
                          const progress = originalBalance > 0 ? (paidOff / originalBalance) * 100 : 0
                          
                          return (
                            <div key={debt.id} style={{ padding: '20px', background: darkMode ? '#7f1d1d' : '#fef2f2', borderRadius: '12px', border: '2px solid #ef4444' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                  <h4 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0', color: theme.text }}>{debt.name}</h4>
                                  <p style={{ fontSize: '13px', color: theme.textMuted, margin: 0 }}>
                                    {debt.interestRate}% APR • ${parseFloat(debt.minPayment).toFixed(2)}/{debt.frequency}
                                  </p>
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                                  ${currentBalance.toFixed(2)}
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                                  {progress.toFixed(0)}% paid
                                </div>
                                <button 
                                  onClick={() => addDebtToCalendar(debt)} 
                                  disabled={onCalendar}
                                  style={{ 
                                    background: onCalendar ? '#94a3b8' : '#7c3aed', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '6px', 
                                    padding: '6px 12px', 
                                    cursor: onCalendar ? 'not-allowed' : 'pointer', 
                                    fontSize: '12px', 
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {onCalendar ? '✓ On Calendar' : '📅 Add to Calendar'}
                                </button>
                                <button onClick={() => deleteDebt(debt.id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Delete</button>
                              </div>
                              
                              {/* PROGRESS BAR */}
                              <div style={{ width: '100%', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: theme.textMuted, marginBottom: '4px' }}>
                                  <span>Paid: ${paidOff.toFixed(2)}</span>
                                  <span>Remaining: ${currentBalance.toFixed(2)}</span>
                                </div>
                                <div style={{ width: '100%', height: '20px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                  <div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: 'linear-gradient(to right, #10b981, #059669)', transition: 'width 0.3s' }} />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                  
                  {debts.length === 0 && (
                    <p style={{ color: theme.textMuted, textAlign: 'center', padding: '24px' }}>No debts tracked</p>
                  )}
                </div>
                
                {/* 5. FINANCIAL GOALS */}
                <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: darkMode ? '1px solid #334155' : 'none' }}>
                  <h2 style={{ fontSize: '28px', marginBottom: '24px', color: theme.text }}>🎯 Financial Goals</h2>
                  <div style={{ marginBottom: '24px', padding: '20px', background: darkMode ? '#1e3a8a' : '#f0f9ff', borderRadius: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      <input type="text" placeholder="Goal name" value={newGoal.name} onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', background: theme.input, color: theme.text }} />
                      <input type="number" placeholder="Target $" value={newGoal.target} onChange={(e) => setNewGoal({...newGoal, target: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', background: theme.input, color: theme.text }} />
                      <input type="number" placeholder="Saved $" value={newGoal.saved} onChange={(e) => setNewGoal({...newGoal, saved: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', background: theme.input, color: theme.text }} />
                      <input type="date" placeholder="Deadline" value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', background: theme.input, color: theme.text }} />
                      <button onClick={addGoal} style={{ padding: '10px 20px', background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Add Goal</button>
                    </div>
                  </div>
                  {goals.length === 0 ? (
                    <p style={{ color: theme.textMuted, textAlign: 'center', padding: '24px' }}>No goals yet. Add one above!</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {goals.map(goal => {
                        const target = parseFloat(goal.target || 0)
                        const saved = parseFloat(goal.saved || 0)
                        const progress = target > 0 ? (saved / target) * 100 : 0
                        const onCalendar = calendarItems.some(item => item.sourceId === goal.id && item.type === 'goal')
                        return (
                          <div key={goal.id} style={{ padding: '20px', background: darkMode ? '#1e3a8a' : 'linear-gradient(to right, #f0f9ff, #e0f2fe)', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                              <div style={{ flex: 1, minWidth: '200px' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0', color: theme.text }}>{goal.name}</h3>
                                <p style={{ color: theme.textMuted, margin: 0, fontSize: '14px' }}>
                                  ${saved.toLocaleString()} of ${target.toLocaleString()} {goal.deadline && `• Due ${new Date(goal.deadline).toLocaleDateString()}`}
                                </p>
                              </div>
                              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>{progress.toFixed(0)}%</div>
                              <button 
                                onClick={() => addGoalToCalendar(goal)} 
                                disabled={!goal.deadline || onCalendar}
                                style={{ 
                                  background: onCalendar ? '#94a3b8' : !goal.deadline ? '#94a3b8' : '#7c3aed', 
                                  color: 'white', 
                                  border: 'none', 
                                  borderRadius: '6px', 
                                  padding: '6px 12px', 
                                  cursor: onCalendar || !goal.deadline ? 'not-allowed' : 'pointer', 
                                  fontSize: '12px', 
                                  fontWeight: '600',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {onCalendar ? '✓ On Calendar' : '📅 Add to Calendar'}
                              </button>
                              <button onClick={() => deleteGoal(goal.id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Delete</button>
                            </div>
                            <div style={{ width: '100%', height: '20px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: 'linear-gradient(to right, #3b82f6, #2563eb)', transition: 'width 0.3s' }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                
                {/* 6. SAVINGS PLANS */}
                {goals.length > 0 && (
                  <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: darkMode ? '1px solid #334155' : 'none' }}>
                    <h2 style={{ fontSize: '28px', marginBottom: '24px', color: theme.text }}>💵 Automatic Savings Plans</h2>
                    <p style={{ color: theme.textMuted, marginBottom: '20px', fontSize: '16px' }}>
                      See exactly how much to save per paycheck to hit your goals on time!
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {goals.map(goal => {
                        const plan = calculateSavingsPlan(goal)
                        if (!plan) return null
                        
                        return (
                          <div key={goal.id} style={{ padding: '24px', background: darkMode ? '#064e3b' : 'linear-gradient(to right, #ecfdf5, #d1fae5)', borderRadius: '12px', border: '2px solid #10b981' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: darkMode ? '#6ee7b7' : '#065f46', marginBottom: '16px' }}>{goal.name}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                              <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                                <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '4px' }}>💰 Per Paycheck</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>${plan.perPaycheck.toFixed(2)}</div>
                                <div style={{ fontSize: '11px', color: theme.textMuted }}>Every {plan.frequency}</div>
                              </div>
                              <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                                <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '4px' }}>📅 Per Month</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>${plan.monthlyNeeded.toFixed(2)}</div>
                              </div>
                              <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                                <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '4px' }}>⏰ Months Left</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{plan.monthsRemaining}</div>
                              </div>
                            </div>
                            {monthlySurplus >= plan.monthlyNeeded ? (
                              <div style={{ padding: '12px', background: darkMode ? '#064e3b' : '#f0fdf4', border: '2px solid #10b981', borderRadius: '8px', fontSize: '14px', color: darkMode ? '#6ee7b7' : '#065f46', fontWeight: '600' }}>
                                ✅ Affordable! Your available surplus (${monthlySurplus.toFixed(2)}/mo) covers this.
                              </div>
                            ) : (
                              <div style={{ padding: '12px', background: darkMode ? '#7f1d1d' : '#fef2f2', border: '2px solid #ef4444', borderRadius: '8px', fontSize: '14px', color: darkMode ? '#fca5a5' : '#991b1b', fontWeight: '600' }}>
                                ⚠️ Need ${(plan.monthlyNeeded - monthlySurplus).toFixed(2)}/month more
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                
              </div>
            )}
            
            {financeTab === 'coach' && (
              <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', minHeight: '600px', display: 'flex', flexDirection: 'column', border: darkMode ? '1px solid #334155' : 'none' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '16px', color: theme.text }}>💬 AI Budget Coach</h2>
                <p style={{ color: theme.textMuted, marginBottom: '24px' }}>Ask me anything about your finances! I have access to all your data and can give personalized advice.</p>
                
                {chatMessages.length === 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '16px', color: theme.textMuted }}>💡 Try asking:</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                      {[
                        "How can I save $500 more per month?",
                        "Should I pay off debt or save first?",
                        "What expenses should I cut first?",
                        "How long until I reach my goals?",
                        "Am I spending too much on anything?",
                        "Give me a personalized savings plan"
                      ].map(q => (
                        <button
                          key={q}
                          onClick={() => askBudgetCoach(q)}
                          style={{
                            padding: '16px',
                            background: darkMode ? '#1e3a8a' : 'linear-gradient(to right, #f0f9ff, #e0f2fe)',
                            border: '2px solid #3b82f6',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: darkMode ? '#93c5fd' : '#1e40af'
                          }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px', padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', minHeight: '300px' }}>
                  {chatMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: theme.textMuted }}>
                      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🤖</div>
                      <p style={{ fontSize: '18px' }}>Ready to help you achieve your financial goals!</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                          <div style={{
                            maxWidth: '80%',
                            padding: '16px',
                            borderRadius: '12px',
                            background: msg.role === 'user' ? 'linear-gradient(to right, #4f46e5, #7c3aed)' : (darkMode ? '#334155' : 'white'),
                            color: msg.role === 'user' ? 'white' : theme.text,
                            border: msg.role === 'assistant' ? `2px solid ${theme.border}` : 'none'
                          }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.7 }}>
                              {msg.role === 'user' ? 'You' : '🤖 AI Coach'}
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{msg.content}</div>
                          </div>
                        </div>
                      ))}
                      {isAskingCoach && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                          <div style={{ padding: '16px', borderRadius: '12px', background: darkMode ? '#334155' : 'white', border: `2px solid ${theme.border}` }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.7, color: theme.text }}>🤖 AI Coach</div>
                            <div style={{ color: theme.text }}>Thinking...</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isAskingCoach && askBudgetCoach()}
                    placeholder="Ask about your finances..."
                    disabled={isAskingCoach}
                    style={{
                      flex: 1,
                      padding: '16px',
                      borderRadius: '12px',
                      border: `2px solid ${theme.border}`,
                      fontSize: '16px',
                      background: theme.input,
                      color: theme.text
                    }}
                  />
                  <button
                    onClick={() => askBudgetCoach()}
                    disabled={!chatInput.trim() || isAskingCoach}
                    style={{
                      padding: '16px 32px',
                      background: !chatInput.trim() || isAskingCoach ? '#94a3b8' : 'linear-gradient(to right, #4f46e5, #7c3aed)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: !chatInput.trim() || isAskingCoach ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '16px'
                    }}
                  >
                    {isAskingCoach ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            )}
          </>
        )} 
        {mainTab === 'trading' && (
          <>
            {tradingTab === 'trading-goals' && (
              <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: darkMode ? '1px solid #334155' : 'none' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '16px', color: theme.text }}>🎯 Trading Goals</h2>
                <div style={{ marginBottom: '32px', padding: '24px', background: darkMode ? '#713f12' : '#fef3c7', borderRadius: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <input type="text" placeholder="Goal" value={newTradingGoal.name} onChange={(e) => setNewTradingGoal({...newTradingGoal, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, background: theme.input, color: theme.text }} />
                    <input type="number" placeholder="Target" value={newTradingGoal.target} onChange={(e) => setNewTradingGoal({...newTradingGoal, target: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, background: theme.input, color: theme.text }} />
                    <input type="number" placeholder="Current" value={newTradingGoal.current} onChange={(e) => setNewTradingGoal({...newTradingGoal, current: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, background: theme.input, color: theme.text }} />
                    <input type="date" value={newTradingGoal.deadline} onChange={(e) => setNewTradingGoal({...newTradingGoal, deadline: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, background: theme.input, color: theme.text }} />
                    <button onClick={addTradingGoal} style={{ padding: '12px 24px', background: 'linear-gradient(to right, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Add</button>
                  </div>
                </div>
                {tradingGoals.length === 0 ? <div style={{ textAlign: 'center', padding: '60px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px' }}><div style={{ fontSize: '64px' }}>🎯</div><h3 style={{ color: theme.text }}>No goals yet</h3></div> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {tradingGoals.map(g => { const progress = parseFloat(g.target) > 0 ? (parseFloat(g.current) / parseFloat(g.target)) * 100 : 0; return (
                      <div key={g.id} style={{ padding: '24px', background: darkMode ? '#713f12' : 'linear-gradient(to right, #fef3c7, #fde68a)', borderRadius: '12px', border: '2px solid #f59e0b' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><div><h3 style={{ fontSize: '24px', fontWeight: 'bold', color: theme.text }}>{g.name}</h3></div><div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{progress.toFixed(0)}%</div></div>
                        <div style={{ width: '100%', height: '24px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '12px', overflow: 'hidden' }}><div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: 'linear-gradient(to right, #f59e0b, #d97706)' }} /></div>
                      </div>
                    )})}
                  </div>
                )}
              </div>
            )}
            
            {tradingTab === 'performance' && (
              <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: darkMode ? '1px solid #334155' : 'none' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '32px', color: theme.text }}>📊 Performance</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                  <div style={{ padding: '24px', background: totalPL >= 0 ? (darkMode ? '#064e3b' : '#f0fdf4') : (darkMode ? '#7f1d1d' : '#fef2f2'), borderRadius: '12px', border: `2px solid ${totalPL >= 0 ? '#10b981' : '#ef4444'}` }}><h3 style={{ color: theme.text }}>Total P&L</h3><p style={{ fontSize: '32px', fontWeight: 'bold', color: totalPL >= 0 ? '#10b981' : '#ef4444' }}>${totalPL.toFixed(2)}</p></div>
                  <div style={{ padding: '24px', background: darkMode ? '#1e3a8a' : '#f0f9ff', borderRadius: '12px', border: '2px solid #3b82f6' }}><h3 style={{ color: theme.text }}>Win Rate</h3><p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>{winRate.toFixed(1)}%</p></div>
                  <div style={{ padding: '24px', background: darkMode ? '#713f12' : '#fef3c7', borderRadius: '12px', border: '2px solid #f59e0b' }}><h3 style={{ color: theme.text }}>Profit Factor</h3><p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{profitFactor.toFixed(2)}</p></div>
                  <div style={{ padding: '24px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', border: `2px solid ${theme.border}` }}><h3 style={{ color: theme.text }}>Trades</h3><p style={{ fontSize: '32px', fontWeight: 'bold', color: theme.text }}>{trades.length}</p></div>
                </div>
                <h3 style={{ fontSize: '24px', marginBottom: '16px', color: theme.text }}>📅 Calendar</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: theme.textMuted }}>{d}</div>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                  {(() => { const { firstDay, daysInMonth } = getDaysInMonth(); const cells = []; for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />); for (let d = 1; d <= daysInMonth; d++) { const dayPL = getTradesForDay(d).reduce((s, t) => s + parseFloat(t.profitLoss || 0), 0); cells.push(<div key={d} style={{ padding: '12px 8px', border: `1px solid ${theme.border}`, borderRadius: '8px', background: dayPL > 0 ? (darkMode ? '#064e3b' : '#f0fdf4') : dayPL < 0 ? (darkMode ? '#7f1d1d' : '#fef2f2') : theme.cardBg, minHeight: '80px' }}><div style={{ fontWeight: 'bold', color: theme.text }}>{d}</div>{dayPL !== 0 && <div style={{ fontSize: '14px', fontWeight: 'bold', color: dayPL > 0 ? '#10b981' : '#ef4444' }}>{dayPL > 0 ? '+' : ''}${dayPL.toFixed(2)}</div>}</div>)} return cells })()}
                </div>
              </div>
            )}
            
            {tradingTab === 'trading-path' && (
              <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: darkMode ? '1px solid #334155' : 'none' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '16px', color: theme.text }}>🗺️ Path to Profitability</h2>
                {trades.length < 10 ? <div style={{ padding: '32px', background: darkMode ? '#713f12' : '#fef3c7', borderRadius: '12px' }}><p style={{ color: theme.text }}>Log 10+ trades for insights. Current: {trades.length}</p></div> : (
                  <div style={{ padding: '32px', background: darkMode ? '#064e3b' : '#f0fdf4', borderRadius: '12px' }}><h3 style={{ color: theme.text }}>✅ Recommendations</h3><ol style={{ marginLeft: '20px', lineHeight: '2', color: theme.text }}>{winRate < 50 && <li>Improve win rate</li>}{profitFactor < 1.5 && <li>Improve profit factor</li>}{netPL < 0 && <li style={{ color: '#ef4444', fontWeight: 'bold' }}>Review strategy</li>}</ol></div>
                )}
              </div>
            )}
            
            {tradingTab === 'finder' && (
              <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: darkMode ? '1px solid #334155' : 'none' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '16px', color: theme.text }}>🔮 Trade Finder</h2>
                <p style={{ color: theme.textMuted, marginBottom: '32px' }}>Upload 3 screenshots for multi-timeframe analysis. Minimum 1:2 R:R required.</p>
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    <div style={{ padding: '24px', background: darkMode ? '#713f12' : '#fef3c7', borderRadius: '12px', border: '2px solid #f59e0b' }}>
                      <h3 style={{ fontSize: '20px', marginBottom: '12px', color: theme.text }}>📊 1H Chart</h3>
                      <input type="file" accept="image/*" onChange={(e) => handleTradeFinderUpload('oneHour', e)} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, width: '100%', marginBottom: '12px', background: theme.input, color: theme.text }} />
                      {tradeFinderScreenshots.oneHour && <img src={tradeFinderScreenshots.oneHour} alt="1H" style={{ width: '100%', borderRadius: '8px' }} />}
                    </div>
                    <div style={{ padding: '24px', background: darkMode ? '#1e3a8a' : '#dbeafe', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                      <h3 style={{ fontSize: '20px', marginBottom: '12px', color: theme.text }}>📊 15M Chart</h3>
                      <input type="file" accept="image/*" onChange={(e) => handleTradeFinderUpload('fifteenMin', e)} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, width: '100%', marginBottom: '12px', background: theme.input, color: theme.text }} />
                      {tradeFinderScreenshots.fifteenMin && <img src={tradeFinderScreenshots.fifteenMin} alt="15M" style={{ width: '100%', borderRadius: '8px' }} />}
                    </div>
                    <div style={{ padding: '24px', background: darkMode ? '#064e3b' : '#f0fdf4', borderRadius: '12px', border: '2px solid #10b981' }}>
                      <h3 style={{ fontSize: '20px', marginBottom: '12px', color: theme.text }}>📊 5M Chart</h3>
                      <input type="file" accept="image/*" onChange={(e) => handleTradeFinderUpload('fiveMin', e)} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, width: '100%', marginBottom: '12px', background: theme.input, color: theme.text }} />
                      {tradeFinderScreenshots.fiveMin && <img src={tradeFinderScreenshots.fiveMin} alt="5M" style={{ width: '100%', borderRadius: '8px' }} />}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <button onClick={analyzeTradeSetup} disabled={!tradeFinderScreenshots.oneHour || !tradeFinderScreenshots.fifteenMin || !tradeFinderScreenshots.fiveMin || isAnalyzingTrade} style={{ padding: '16px 48px', background: (!tradeFinderScreenshots.oneHour || !tradeFinderScreenshots.fifteenMin || !tradeFinderScreenshots.fiveMin || isAnalyzingTrade) ? '#94a3b8' : 'linear-gradient(to right, #7c3aed, #6d28d9)', color: 'white', border: 'none', borderRadius: '12px', cursor: (!tradeFinderScreenshots.oneHour || !tradeFinderScreenshots.fifteenMin || !tradeFinderScreenshots.fiveMin || isAnalyzingTrade) ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '20px' }}>
                    {isAnalyzingTrade ? '🔄 Analyzing...' : '🔮 Analyze Trade'}
                  </button>
                </div>
                {tradeRecommendation && (
                  <div style={{ marginTop: '32px', padding: '32px', background: tradeRecommendation.shouldTrade ? (darkMode ? '#064e3b' : '#f0fdf4') : (darkMode ? '#7f1d1d' : '#fef2f2'), borderRadius: '16px', border: `3px solid ${tradeRecommendation.shouldTrade ? '#10b981' : '#ef4444'}` }}>
                    <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px', color: theme.text }}>
                      {tradeRecommendation.shouldTrade ? '✅ TRADE RECOMMENDATION' : '❌ NO TRADE'}
                    </h3>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px', color: theme.text }}>{tradeRecommendation.raw}</pre>
                  </div>
                )}
              </div>
            )}
            
            {tradingTab === 'journal' && (
              <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: darkMode ? '1px solid #334155' : 'none' }}>
                <h2 style={{ fontSize: '28px', marginBottom: '24px', color: theme.text }}>📈 Trade Journal</h2>
                <div style={{ marginBottom: '32px', padding: '24px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <input type="file" accept="image/*" onChange={handleScreenshotUpload} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, background: theme.input, color: theme.text }} />
                    <button onClick={analyzeScreenshot} disabled={!newTrade.screenshot || isAnalyzing} style={{ padding: '12px 24px', background: !newTrade.screenshot || isAnalyzing ? '#94a3b8' : '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: !newTrade.screenshot || isAnalyzing ? 'not-allowed' : 'pointer', fontWeight: '600', marginLeft: '12px' }}>{isAnalyzing ? '🔄 Analyzing...' : '🤖 Analyze'}</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <input type="date" value={newTrade.date} onChange={(e) => setNewTrade({...newTrade, date: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, background: theme.input, color: theme.text }} />
                    <input type="text" placeholder="Instrument" value={newTrade.instrument} onChange={(e) => setNewTrade({...newTrade, instrument: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, background: theme.input, color: theme.text }} />
                    <select value={newTrade.direction} onChange={(e) => setNewTrade({...newTrade, direction: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, background: theme.input, color: theme.text }}><option value="long">Long</option><option value="short">Short</option></select>
                    <input type="number" step="0.01" placeholder="P&L" value={newTrade.profitLoss} onChange={(e) => setNewTrade({...newTrade, profitLoss: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, background: theme.input, color: theme.text }} />
                  </div>
                  <button onClick={addTrade} style={{ padding: '12px 24px', background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Log Trade</button>
                </div>
                {trades.length === 0 ? <p style={{ textAlign: 'center', padding: '32px', color: theme.textMuted }}>No trades yet</p> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {trades.map(t => (
                      <div key={t.id} style={{ padding: '20px', background: parseFloat(t.profitLoss) >= 0 ? (darkMode ? '#064e3b' : '#f0fdf4') : (darkMode ? '#7f1d1d' : '#fef2f2'), borderRadius: '12px', border: `2px solid ${parseFloat(t.profitLoss) >= 0 ? '#10b981' : '#ef4444'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div><div style={{ fontSize: '20px', fontWeight: 'bold', color: theme.text }}>{t.instrument}</div><div style={{ fontSize: '14px', color: theme.textMuted }}>{new Date(t.date).toLocaleDateString()}</div></div>
                          <div style={{ fontSize: '28px', fontWeight: 'bold', color: parseFloat(t.profitLoss) >= 0 ? '#10b981' : '#ef4444' }}>{parseFloat(t.profitLoss) >= 0 ? '+' : ''}${parseFloat(t.profitLoss).toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {tradingTab === 'costs' && (
              <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: darkMode ? '1px solid #334155' : 'none' }}>
                <h2 style={{ fontSize: '28px', marginBottom: '24px', color: theme.text }}>💸 Trading Costs</h2>
                <div style={{ marginBottom: '32px', padding: '32px', background: darkMode ? '#7f1d1d' : '#fef2f2', borderRadius: '12px', border: '2px solid #ef4444' }}><h3 style={{ color: theme.text }}>Total Monthly Costs</h3><p style={{ fontSize: '48px', fontWeight: 'bold', color: '#ef4444' }}>${monthlyCosts.toFixed(2)}</p><p style={{ color: theme.text }}>Net P&L: <span style={{ fontWeight: 'bold', color: netPL >= 0 ? '#10b981' : '#ef4444' }}>${netPL.toFixed(2)}</span></p></div>
                <div style={{ marginBottom: '32px', padding: '24px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <input type="text" placeholder="Name" value={newCost.name} onChange={(e) => setNewCost({...newCost, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, background: theme.input, color: theme.text }} />
                    <input type="number" placeholder="Cost" value={newCost.cost} onChange={(e) => setNewCost({...newCost, cost: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, background: theme.input, color: theme.text }} />
                    <button onClick={addCost} style={{ padding: '12px 24px', background: 'linear-gradient(to right, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Add</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
