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
      originalBalance: newDebt.balance
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
  
  const toggleBillPaid = (itemId: string | number) => {
    if (typeof itemId === 'string' && itemId.includes('-')) {
      const parts = itemId.split('-')
      const baseId = parseInt(parts[0])
      const occurrenceDate = `${parts[1]}-${parts[2]}-${parts[3]}`
      
      const originalItem = calendarItems.find(item => item.id === baseId && !item.isOverride)
      
      if (originalItem) {
        // Don't create override - just do nothing for recurring items!
        // This way they keep showing up every month
        return
      }
    } else {
      setCalendarItems(calendarItems.map(b => b.id === itemId ? { ...b, isPaid: !b.isPaid } : b))
    }
  }
  
  const markGoalPaymentPaid = (itemId: string | number, goalId: number, amount: number) => {
    // Don't call toggleBillPaid - just update the goal directly
    setGoals(goals.map(g => {
      if (g.id === goalId) {
        const currentSaved = parseFloat(g.saved || 0)
        const newSaved = currentSaved + amount
        return { ...g, saved: newSaved.toFixed(2) }
      }
      return g
    }))
  }
  
  const markDebtPaymentPaid = (itemId: string | number, debtId: number | string, amount: number) => {
    // Handle "extra-debt" special case
    if (debtId === 'extra-debt') {
      // Get the target debt based on current payoff method
      const sortedDebts = [...debts].sort((a, b) => {
        if (payoffMethod === 'snowball') {
          return parseFloat(a.balance) - parseFloat(b.balance)
        } else {
          return parseFloat(b.interestRate) - parseFloat(a.interestRate)
        }
      })
      
      if (sortedDebts.length > 0) {
        debtId = sortedDebts[0].id // Target the first debt in the payoff order
      } else {
        return // No debts to pay
      }
    }
    
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
    
    const plan = calculateSavingsPlan(goal)
    if (!plan) {
      alert('⚠️ Could not calculate savings plan for this goal')
      return
    }
    
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
  
  // 🔥 FIX: Link extra payment to target debt based on payoff method
  const addExtraDebtPaymentToCalendar = () => {
    if (!extraPayment || parseFloat(extraPayment) <= 0) {
      alert('⚠️ Please enter an extra payment amount first')
      return
    }
    
    if (debts.length === 0) {
      alert('⚠️ No debts to apply extra payment to')
      return
    }
    
    // Sort debts based on current payoff method
    const sortedDebts = [...debts].sort((a, b) => {
      if (payoffMethod === 'snowball') {
        return parseFloat(a.balance) - parseFloat(b.balance)
      } else {
        return parseFloat(b.interestRate) - parseFloat(a.interestRate)
      }
    })
    
    const targetDebt = sortedDebts[0]
    
    const userDate = prompt(`📅 When should your extra debt payment of $${extraPayment} start?\n\nThis will be applied to: ${targetDebt.name}\n\nEnter date (YYYY-MM-DD):`, new Date().toISOString().split('T')[0])
    if (!userDate) return
    
    setCalendarItems([...calendarItems, {
      id: Date.now(),
      sourceId: targetDebt.id, // 🔥 FIX: Link to actual debt ID, not 'extra-debt'
      name: `💳 Extra Payment → ${targetDebt.name}`,
      amount: extraPayment,
      dueDate: userDate,
      frequency: 'monthly',
      isPaid: false,
      type: 'debt'
    }].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()))
    alert(`✅ Extra debt payment added to calendar!\nWill reduce balance of: ${targetDebt.name}`)
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
  
  // ✅ SIMPLE FIX: Just show ALL recurring items every month!
  const getCalendarItemsForDay = (day: number) => {
    const { month, year } = getDaysInMonth()
    const items: any[] = []
    
    calendarItems.forEach(item => {
      if (item.isOverride) return
      
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
            const occurrenceKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            items.push({
              ...item,
              id: `${item.id}-${occurrenceKey}`,
              isRecurrence: true,
              occurrenceDate: occurrenceKey
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
    {/* HEADER */}
      <div style={{ padding: '20px', borderBottom: `1px solid ${theme.border}`, background: theme.cardBg }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, color: theme.text, fontSize: '28px', fontWeight: 'bold' }}>
            💰 Premium Finance App
          </h1>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ color: theme.text, fontSize: '16px' }}>👤 {user?.firstName || 'User'}</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                padding: '8px 16px',
                background: darkMode ? '#fbbf24' : '#1e293b',
                color: darkMode ? '#1e293b' : '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            {!notificationsEnabled && (
              <button
                onClick={enableNotifications}
                style={{
                  padding: '8px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                🔔 Enable Notifications
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN TABS */}
      <div style={{ maxWidth: '1400px', margin: '20px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setMainTab("finance")}
            style={{
              padding: '12px 24px',
              background: mainTab === "finance" ? '#3b82f6' : theme.cardBg,
              color: mainTab === "finance" ? 'white' : theme.text,
              border: `2px solid ${mainTab === "finance" ? '#3b82f6' : theme.border}`,
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            💼 Finance
          </button>
          <button
            onClick={() => setMainTab("trading")}
            style={{
              padding: '12px 24px',
              background: mainTab === "trading" ? '#3b82f6' : theme.cardBg,
              color: mainTab === "trading" ? 'white' : theme.text,
              border: `2px solid ${mainTab === "trading" ? '#3b82f6' : theme.border}`,
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            📈 Trading
          </button>
        </div>

        {mainTab === "finance" && (
          <>
            {/* FINANCE SUB-TABS */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {['dashboard', 'calendar', 'goals', 'debt', 'networth'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFinanceTab(tab)}
                  style={{
                    padding: '10px 20px',
                    background: financeTab === tab ? '#10b981' : theme.cardBg,
                    color: financeTab === tab ? 'white' : theme.text,
                    border: `2px solid ${financeTab === tab ? '#10b981' : theme.border}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  {tab === 'dashboard' && '📊 Dashboard'}
                  {tab === 'calendar' && '📅 Calendar'}
                  {tab === 'goals' && '🎯 Goals'}
                  {tab === 'debt' && '💳 Debt Payoff'}
                  {tab === 'networth' && '💎 Net Worth'}
                </button>
              ))}
            </div>

            {financeTab === 'dashboard' && (
              <>
                {/* CURRENT POSITION - CORRECTED */}
                <div style={{ 
                  background: theme.cardBg, 
                  padding: '25px', 
                  borderRadius: '16px', 
                  marginBottom: '25px',
                  border: `1px solid ${theme.border}`
                }}>
                  <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>💰 Current Position</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div style={{ padding: '15px', background: darkMode ? '#334155' : '#f0f9ff', borderRadius: '12px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>Monthly Income</div>
                      <div style={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}>${totalIncome.toFixed(2)}</div>
                    </div>
                    <div style={{ padding: '15px', background: darkMode ? '#334155' : '#fef3f2', borderRadius: '12px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>Monthly Expenses</div>
                      <div style={{ color: '#ef4444', fontSize: '24px', fontWeight: 'bold' }}>${totalExpenses.toFixed(2)}</div>
                    </div>
                    <div style={{ padding: '15px', background: darkMode ? '#334155' : '#fef3f2', borderRadius: '12px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>Calendar Commitments</div>
                      <div style={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}>${committedCalendarPayments.toFixed(2)}</div>
                    </div>
                    <div style={{ padding: '15px', background: darkMode ? '#334155' : '#f0fdf4', borderRadius: '12px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>This Month Projected</div>
                      <div style={{ 
                        color: monthlySurplus >= 0 ? '#10b981' : '#ef4444', 
                        fontSize: '24px', 
                        fontWeight: 'bold' 
                      }}>
                        ${monthlySurplus.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* INCOME & EXPENSES */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                  {/* INCOME */}
                  <div style={{ background: theme.cardBg, padding: '25px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>💰 Income</h3>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                      <input
                        type="text"
                        placeholder="Name"
                        value={newTransaction.type === 'income' ? newTransaction.name : ''}
                        onChange={(e) => setNewTransaction({ ...newTransaction, name: e.target.value, type: 'income' })}
                        style={{
                          flex: 1,
                          padding: '10px',
                          border: `2px solid ${theme.inputBorder}`,
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: theme.input,
                          color: theme.text
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={newTransaction.type === 'income' ? newTransaction.amount : ''}
                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value, type: 'income' })}
                        style={{
                          width: '100px',
                          padding: '10px',
                          border: `2px solid ${theme.inputBorder}`,
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: theme.input,
                          color: theme.text
                        }}
                      />
                      <select
                        value={newTransaction.type === 'income' ? newTransaction.frequency : 'monthly'}
                        onChange={(e) => setNewTransaction({ ...newTransaction, frequency: e.target.value, type: 'income' })}
                        style={{
                          padding: '10px',
                          border: `2px solid ${theme.inputBorder}`,
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: theme.input,
                          color: theme.text
                        }}
                      >
                        <option value="weekly">Weekly</option>
                        <option value="fortnightly">Fortnightly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                      <button
                        onClick={() => {
                          setNewTransaction({ ...newTransaction, type: 'income' })
                          addTransaction()
                        }}
                        style={{
                          padding: '10px 20px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        Add
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {transactions.filter(t => t.type === 'income').map(t => (
                        <div key={t.id} style={{ 
                          padding: '12px', 
                          background: darkMode ? '#334155' : '#f0fdf4', 
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ color: theme.text, fontWeight: '600' }}>{t.name}</div>
                            <div style={{ color: theme.textMuted, fontSize: '13px' }}>
                              ${t.amount}/{t.frequency || 'monthly'} (${convertToMonthly(parseFloat(t.amount), t.frequency).toFixed(2)}/mo)
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => addTransactionToCalendar(t)}
                              style={{
                                padding: '6px 12px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              📅 Add to Calendar
                            </button>
                            <button
                              onClick={() => deleteTransaction(t.id)}
                              style={{
                                padding: '6px 12px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* EXPENSES */}
                  <div style={{ background: theme.cardBg, padding: '25px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>💸 Expenses</h3>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                      <input
                        type="text"
                        placeholder="Name"
                        value={newTransaction.type === 'expense' ? newTransaction.name : ''}
                        onChange={(e) => setNewTransaction({ ...newTransaction, name: e.target.value, type: 'expense' })}
                        style={{
                          flex: 1,
                          padding: '10px',
                          border: `2px solid ${theme.inputBorder}`,
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: theme.input,
                          color: theme.text
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={newTransaction.type === 'expense' ? newTransaction.amount : ''}
                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value, type: 'expense' })}
                        style={{
                          width: '100px',
                          padding: '10px',
                          border: `2px solid ${theme.inputBorder}`,
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: theme.input,
                          color: theme.text
                        }}
                      />
                      <select
                        value={newTransaction.type === 'expense' ? newTransaction.frequency : 'monthly'}
                        onChange={(e) => setNewTransaction({ ...newTransaction, frequency: e.target.value, type: 'expense' })}
                        style={{
                          padding: '10px',
                          border: `2px solid ${theme.inputBorder}`,
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: theme.input,
                          color: theme.text
                        }}
                      >
                        <option value="weekly">Weekly</option>
                        <option value="fortnightly">Fortnightly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                      <button
                        onClick={() => {
                          setNewTransaction({ ...newTransaction, type: 'expense' })
                          addTransaction()
                        }}
                        style={{
                          padding: '10px 20px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        Add
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {transactions.filter(t => t.type === 'expense').map(t => (
                        <div key={t.id} style={{ 
                          padding: '12px', 
                          background: darkMode ? '#334155' : '#fef3f2', 
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ color: theme.text, fontWeight: '600' }}>{t.name}</div>
                            <div style={{ color: theme.textMuted, fontSize: '13px' }}>
                              ${t.amount}/{t.frequency || 'monthly'} (${convertToMonthly(parseFloat(t.amount), t.frequency).toFixed(2)}/mo)
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => addTransactionToCalendar(t)}
                              style={{
                                padding: '6px 12px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              📅 Add to Calendar
                            </button>
                            <button
                              onClick={() => deleteTransaction(t.id)}
                              style={{
                                padding: '6px 12px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI BUDGET COACH */}
                <div style={{ 
                  background: theme.cardBg, 
                  padding: '25px', 
                  borderRadius: '16px', 
                  marginBottom: '25px',
                  border: `1px solid ${theme.border}`
                }}>
                  <h3 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>🤖 AI Budget Coach</h3>
                  
                  <div style={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto', 
                    marginBottom: '15px',
                    padding: '15px',
                    background: darkMode ? '#0f172a' : '#f8fafc',
                    borderRadius: '8px'
                  }}>
                    {chatMessages.length === 0 ? (
                      <div style={{ color: theme.textMuted, textAlign: 'center', padding: '20px' }}>
                        Ask me anything about your budget, savings, or financial goals!
                      </div>
                    ) : (
                      chatMessages.map((msg, idx) => (
                        <div key={idx} style={{ 
                          marginBottom: '12px',
                          padding: '12px',
                          background: msg.role === 'user' ? '#3b82f6' : (darkMode ? '#334155' : 'white'),
                          color: msg.role === 'user' ? 'white' : theme.text,
                          borderRadius: '8px',
                          marginLeft: msg.role === 'user' ? '20%' : '0',
                          marginRight: msg.role === 'user' ? '0' : '20%'
                        }}>
                          <div style={{ fontSize: '12px', marginBottom: '4px', opacity: 0.7 }}>
                            {msg.role === 'user' ? '👤 You' : '🤖 Coach'}
                          </div>
                          {msg.content}
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Ask about your budget, goals, or get advice..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !isAskingCoach && askBudgetCoach()}
                      disabled={isAskingCoach}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <button
                      onClick={() => askBudgetCoach()}
                      disabled={isAskingCoach}
                      style={{
                        padding: '12px 24px',
                        background: isAskingCoach ? '#94a3b8' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isAskingCoach ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      {isAskingCoach ? '⏳ Thinking...' : '💬 Ask'}
                    </button>
                  </div>
                </div>
              </>
            )}
            {financeTab === 'calendar' && (
              <div style={{ background: theme.cardBg, padding: '25px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>📅 Payment Calendar</h2>

                {/* ADD BILL */}
                <div style={{ marginBottom: '25px', padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>➕ Add Calendar Item</h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Name"
                      value={newBill.name}
                      onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                      style={{
                        flex: '1 1 200px',
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={newBill.amount}
                      onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                      style={{
                        width: '120px',
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <input
                      type="date"
                      value={newBill.dueDate}
                      onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                      style={{
                        width: '150px',
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <select
                      value={newBill.frequency}
                      onChange={(e) => setNewBill({ ...newBill, frequency: e.target.value })}
                      style={{
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    >
                      <option value="once">One-time</option>
                      <option value="weekly">Weekly</option>
                      <option value="fortnightly">Fortnightly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <button
                      onClick={addBill}
                      style={{
                        padding: '10px 24px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      Add to Calendar
                    </button>
                  </div>
                </div>

                {/* UPCOMING - NO FILTERING BY PAID STATUS */}
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>📋 Upcoming (Next 30 Days)</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {calendarItems
                      .filter(item => {
                        if (item.isOverride) return false
                        const dueDate = new Date(item.dueDate)
                        const today = new Date()
                        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
                        return dueDate >= today && dueDate <= thirtyDaysFromNow
                      })
                      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                      .map(item => (
                        <div key={item.id} style={{
                          padding: '15px',
                          background: darkMode ? '#334155' : '#f8fafc',
                          borderRadius: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderLeft: `4px solid ${
                            item.type === 'income' ? '#10b981' :
                            item.type === 'goal' ? '#8b5cf6' :
                            item.type === 'debt' ? '#ef4444' :
                            '#3b82f6'
                          }`
                        }}>
                          <div>
                            <div style={{ color: theme.text, fontWeight: '600', marginBottom: '4px' }}>
                              {item.name}
                            </div>
                            <div style={{ color: theme.textMuted, fontSize: '13px' }}>
                              Due: {new Date(item.dueDate).toLocaleDateString()} • ${item.amount}
                              {item.frequency && item.frequency !== 'once' && ` • ${item.frequency}`}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {item.type === 'goal' && item.sourceId && (
                              <button
                                onClick={() => markGoalPaymentPaid(item.id, item.sourceId, parseFloat(item.amount))}
                                style={{
                                  padding: '8px 16px',
                                  background: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '600'
                                }}
                              >
                                ✓ Mark Paid
                              </button>
                            )}
                            {item.type === 'debt' && item.sourceId && (
                              <button
                                onClick={() => markDebtPaymentPaid(item.id, item.sourceId, parseFloat(item.amount))}
                                style={{
                                  padding: '8px 16px',
                                  background: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '600'
                                }}
                              >
                                ✓ Mark Paid
                              </button>
                            )}
                            {(!item.type || item.type === 'bill') && (
                              <button
                                onClick={() => toggleBillPaid(item.id)}
                                style={{
                                  padding: '8px 16px',
                                  background: item.isPaid ? '#94a3b8' : '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '600'
                                }}
                              >
                                {item.isPaid ? '✓ Paid' : 'Mark Paid'}
                              </button>
                            )}
                            <button
                              onClick={() => deleteBill(item.id)}
                              style={{
                                padding: '8px 16px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* CALENDAR GRID */}
                <div style={{ marginTop: '25px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button
                      onClick={prevMonth}
                      style={{
                        padding: '10px 20px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      ← Previous
                    </button>
                    <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>
                      {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button
                      onClick={nextMonth}
                      style={{
                        padding: '10px 20px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      Next →
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} style={{ 
                        textAlign: 'center', 
                        fontWeight: 'bold', 
                        color: theme.text,
                        padding: '10px',
                        background: darkMode ? '#334155' : '#f8fafc',
                        borderRadius: '8px'
                      }}>
                        {day}
                      </div>
                    ))}

                    {Array.from({ length: getDaysInMonth().firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} style={{ minHeight: '120px' }} />
                    ))}

                    {Array.from({ length: getDaysInMonth().daysInMonth }).map((_, i) => {
                      const day = i + 1
                      const dayItems = getCalendarItemsForDay(day)
                      const dayTrades = getTradesForDay(day)

                      return (
                        <div
                          key={day}
                          style={{
                            minHeight: '120px',
                            padding: '10px',
                            background: darkMode ? '#1e293b' : 'white',
                            borderRadius: '8px',
                            border: `2px solid ${theme.border}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#3b82f6'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = theme.border
                            e.currentTarget.style.transform = 'translateY(0)'
                          }}
                        >
                          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: theme.text }}>
                            {day}
                          </div>

                          {dayItems.map(item => (
                            <div
                              key={item.id}
                              style={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                marginBottom: '4px',
                                background: item.type === 'income' ? '#d1fae5' :
                                           item.type === 'goal' ? '#ede9fe' :
                                           item.type === 'debt' ? '#fee2e2' :
                                           '#dbeafe',
                                color: '#1e293b',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={`${item.name} - $${item.amount}`}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.name}
                                </span>
                                {item.type === 'goal' && item.sourceId && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      markGoalPaymentPaid(item.id, item.sourceId, parseFloat(item.amount))
                                    }}
                                    style={{
                                      padding: '2px 6px',
                                      background: '#10b981',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '3px',
                                      cursor: 'pointer',
                                      fontSize: '10px',
                                      flexShrink: 0
                                    }}
                                  >
                                    ✓
                                  </button>
                                )}
                                {item.type === 'debt' && item.sourceId && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      markDebtPaymentPaid(item.id, item.sourceId, parseFloat(item.amount))
                                    }}
                                    style={{
                                      padding: '2px 6px',
                                      background: '#10b981',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '3px',
                                      cursor: 'pointer',
                                      fontSize: '10px',
                                      flexShrink: 0
                                    }}
                                  >
                                    ✓
                                  </button>
                                )}
                                {(!item.type || item.type === 'bill') && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleBillPaid(item.id)
                                    }}
                                    style={{
                                      padding: '2px 6px',
                                      background: item.isPaid ? '#94a3b8' : '#10b981',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '3px',
                                      cursor: 'pointer',
                                      fontSize: '10px',
                                      flexShrink: 0
                                    }}
                                  >
                                    {item.isPaid ? '✓' : '○'}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}

                          {dayTrades.map(trade => (
                            <div
                              key={trade.id}
                              style={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                marginBottom: '4px',
                                background: parseFloat(trade.profitLoss) >= 0 ? '#d1fae5' : '#fee2e2',
                                color: '#1e293b',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={`${trade.instrument}: ${trade.profitLoss >= 0 ? '+' : ''}$${trade.profitLoss}`}
                            >
                              📈 {trade.instrument} ${trade.profitLoss}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
            {financeTab === 'debt' && (
              <div style={{ background: theme.cardBg, padding: '25px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>💳 Debt Payoff Calculator</h2>

                {/* ADD DEBT */}
                <div style={{ marginBottom: '25px', padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>➕ Add Debt</h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Debt Name"
                      value={newDebt.name}
                      onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                      style={{
                        flex: '1 1 150px',
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Balance"
                      value={newDebt.balance}
                      onChange={(e) => setNewDebt({ ...newDebt, balance: e.target.value })}
                      style={{
                        width: '120px',
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Interest %"
                      value={newDebt.interestRate}
                      onChange={(e) => setNewDebt({ ...newDebt, interestRate: e.target.value })}
                      style={{
                        width: '100px',
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Min Payment"
                      value={newDebt.minPayment}
                      onChange={(e) => setNewDebt({ ...newDebt, minPayment: e.target.value })}
                      style={{
                        width: '120px',
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <select
                      value={newDebt.frequency}
                      onChange={(e) => setNewDebt({ ...newDebt, frequency: e.target.value })}
                      style={{
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="fortnightly">Fortnightly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <button
                      onClick={addDebt}
                      style={{
                        padding: '10px 24px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      Add Debt
                    </button>
                  </div>
                </div>

                {/* DEBT LIST */}
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>📋 Your Debts</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {debts.map(debt => {
                      const progress = debt.originalBalance ? 
                        ((parseFloat(debt.originalBalance) - parseFloat(debt.balance)) / parseFloat(debt.originalBalance)) * 100 : 0
                      
                      return (
                        <div key={debt.id} style={{
                          padding: '15px',
                          background: darkMode ? '#334155' : '#fef3f2',
                          borderRadius: '10px',
                          border: `2px solid ${theme.border}`
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div>
                              <div style={{ color: theme.text, fontWeight: '600', fontSize: '16px' }}>
                                {debt.name}
                              </div>
                              <div style={{ color: theme.textMuted, fontSize: '13px', marginTop: '4px' }}>
                                Balance: ${parseFloat(debt.balance).toFixed(2)} • Interest: {debt.interestRate}% • Min Payment: ${debt.minPayment}/{debt.frequency}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => addDebtToCalendar(debt)}
                                style={{
                                  padding: '8px 16px',
                                  background: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '600'
                                }}
                              >
                                📅 Add to Calendar
                              </button>
                              <button
                                onClick={() => deleteDebt(debt.id)}
                                style={{
                                  padding: '8px 16px',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px'
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div style={{ marginTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: theme.textMuted, marginBottom: '4px' }}>
                              <span>Progress: {progress.toFixed(1)}% paid off</span>
                              <span>${(parseFloat(debt.originalBalance || debt.balance) - parseFloat(debt.balance)).toFixed(2)} / ${parseFloat(debt.originalBalance || debt.balance).toFixed(2)}</span>
                            </div>
                            <div style={{ 
                              width: '100%', 
                              height: '8px', 
                              background: darkMode ? '#1e293b' : '#e2e8f0', 
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{ 
                                width: `${progress}%`, 
                                height: '100%', 
                                background: 'linear-gradient(to right, #10b981, #059669)',
                                transition: 'width 0.3s'
                              }} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* ACCELERATE PAYOFF */}
                <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f0fdf4', borderRadius: '12px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>🚀 Accelerate Payoff</h3>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', color: theme.text, marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                      Payoff Method:
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => setPayoffMethod('snowball')}
                        style={{
                          padding: '10px 20px',
                          background: payoffMethod === 'snowball' ? '#10b981' : theme.cardBg,
                          color: payoffMethod === 'snowball' ? 'white' : theme.text,
                          border: `2px solid ${payoffMethod === 'snowball' ? '#10b981' : theme.border}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        ❄️ Snowball (Lowest Balance First)
                      </button>
                      <button
                        onClick={() => setPayoffMethod('avalanche')}
                        style={{
                          padding: '10px 20px',
                          background: payoffMethod === 'avalanche' ? '#10b981' : theme.cardBg,
                          color: payoffMethod === 'avalanche' ? 'white' : theme.text,
                          border: `2px solid ${payoffMethod === 'avalanche' ? '#10b981' : theme.border}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        🏔️ Avalanche (Highest Interest First)
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', color: theme.text, marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                      Extra Monthly Payment:
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="number"
                        placeholder="Extra payment amount"
                        value={extraPayment}
                        onChange={(e) => setExtraPayment(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          border: `2px solid ${theme.inputBorder}`,
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: theme.input,
                          color: theme.text
                        }}
                      />
                      <button
                        onClick={addExtraDebtPaymentToCalendar}
                        style={{
                          padding: '10px 20px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        📅 Add to Calendar
                      </button>
                    </div>
                  </div>

                  {debts.length > 0 && (() => {
                    const payoff = calculateDebtPayoff()
                    return (
                      <div style={{ 
                        padding: '15px', 
                        background: theme.cardBg, 
                        borderRadius: '8px',
                        border: `2px solid ${theme.border}`
                      }}>
                        <h4 style={{ margin: '0 0 10px 0', color: theme.text, fontSize: '16px' }}>📊 Payoff Summary</h4>
                        <div style={{ color: theme.text, fontSize: '14px', lineHeight: '1.8' }}>
                          <div>⏱️ Time to payoff: <strong>{Math.floor(payoff.monthsToPayoff / 12)} years, {payoff.monthsToPayoff % 12} months</strong></div>
                          <div>💸 Total interest paid: <strong>${payoff.totalInterestPaid.toFixed(2)}</strong></div>
                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${theme.border}` }}>
                            <strong>Payoff Order ({payoffMethod}):</strong>
                            <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                              {payoff.payoffOrder.map((debt, idx) => (
                                <li key={debt.id} style={{ marginBottom: '4px' }}>
                                  {debt.name} - ${debt.balance} @ {debt.interestRate}%
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}

            {financeTab === 'goals' && (
              <div style={{ background: theme.cardBg, padding: '25px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>🎯 Savings Goals</h2>

                {/* ADD GOAL */}
                <div style={{ marginBottom: '25px', padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>➕ Add Goal</h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Goal Name"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                      style={{
                        flex: '1 1 200px',
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Target Amount"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                      style={{
                        width: '140px',
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Already Saved"
                      value={newGoal.saved}
                      onChange={(e) => setNewGoal({ ...newGoal, saved: e.target.value })}
                      style={{
                        width: '140px',
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <input
                      type="date"
                      placeholder="Deadline"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      style={{
                        width: '150px',
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <button
                      onClick={addGoal}
                      style={{
                        padding: '10px 24px',
                        background: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      Add Goal
                    </button>
                  </div>
                </div>

                {/* GOALS LIST */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {goals.map(goal => {
                    const progress = (parseFloat(goal.saved || 0) / parseFloat(goal.target || 1)) * 100
                    const plan = calculateSavingsPlan(goal)
                    
                    return (
                      <div key={goal.id} style={{
                        padding: '20px',
                        background: darkMode ? '#334155' : '#faf5ff',
                        borderRadius: '12px',
                        border: `2px solid ${theme.border}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                          <div>
                            <div style={{ color: theme.text, fontWeight: '600', fontSize: '18px', marginBottom: '4px' }}>
                              {goal.name}
                            </div>
                            <div style={{ color: theme.textMuted, fontSize: '14px' }}>
                              ${parseFloat(goal.saved || 0).toFixed(2)} / ${parseFloat(goal.target).toFixed(2)}
                              {goal.deadline && ` • Deadline: ${new Date(goal.deadline).toLocaleDateString()}`}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => addGoalToCalendar(goal)}
                              style={{
                                padding: '8px 16px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600'
                              }}
                            >
                              📅 Add to Calendar
                            </button>
                            <button
                              onClick={() => deleteGoal(goal.id)}
                              style={{
                                padding: '8px 16px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ marginBottom: '15px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: theme.textMuted, marginBottom: '6px' }}>
                            <span>{progress.toFixed(1)}% complete</span>
                            <span>${(parseFloat(goal.target) - parseFloat(goal.saved || 0)).toFixed(2)} remaining</span>
                          </div>
                          <div style={{ 
                            width: '100%', 
                            height: '10px', 
                            background: darkMode ? '#1e293b' : '#e2e8f0', 
                            borderRadius: '5px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${Math.min(progress, 100)}%`, 
                              height: '100%', 
                              background: 'linear-gradient(to right, #8b5cf6, #7c3aed)',
                              transition: 'width 0.3s'
                            }} />
                          </div>
                        </div>

                        {/* Savings Plan */}
                        {plan && (
                          <div style={{ 
                            padding: '12px', 
                            background: theme.cardBg, 
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: theme.text
                          }}>
                            <div style={{ fontWeight: '600', marginBottom: '6px' }}>💡 Savings Plan:</div>
                            <div>Save <strong>${plan.monthlyNeeded.toFixed(2)}/month</strong> for {plan.monthsRemaining} months</div>
                            <div style={{ color: theme.textMuted, marginTop: '4px' }}>
                              (${plan.perPaycheck.toFixed(2)} per {plan.frequency} paycheck)
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {financeTab === 'networth' && (
              <div style={{ background: theme.cardBg, padding: '25px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>💎 Net Worth Tracker</h2>

                <div style={{ 
                  padding: '20px', 
                  background: darkMode ? '#334155' : '#f0fdf4', 
                  borderRadius: '12px',
                  marginBottom: '25px'
                }}>
                  <div style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '8px' }}>Current Net Worth</div>
                  <div style={{ 
                    fontSize: '36px', 
                    fontWeight: 'bold', 
                    color: netWorth >= 0 ? '#10b981' : '#ef4444' 
                  }}>
                    ${netWorth.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '14px', color: theme.textMuted, marginTop: '8px' }}>
                    Assets: ${totalAssets.toFixed(2)} • Liabilities: ${totalLiabilities.toFixed(2)}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* ASSETS */}
                  <div>
                    <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>➕ Assets</h3>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Name"
                        value={newAsset.name}
                        onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                        style={{
                          flex: '1 1 120px',
                          padding: '8px',
                          border: `2px solid ${theme.inputBorder}`,
                          borderRadius: '6px',
                          fontSize: '13px',
                          background: theme.input,
                          color: theme.text
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Value"
                        value={newAsset.value}
                        onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
                        style={{
                          width: '100px',
                          padding: '8px',
                          border: `2px solid ${theme.inputBorder}`,
                          borderRadius: '6px',
                          fontSize: '13px',
                          background: theme.input,
                          color: theme.text
                        }}
                      />
                      <button
                        onClick={addAsset}
                        style={{
                          padding: '8px 16px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        Add
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {assets.map(asset => (
                        <div key={asset.id} style={{
                          padding: '12px',
                          background: darkMode ? '#334155' : '#f0fdf4',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ color: theme.text, fontWeight: '600' }}>{asset.name}</div>
                            <div style={{ color: theme.textMuted, fontSize: '12px' }}>${parseFloat(asset.value).toFixed(2)}</div>
                          </div>
                          <button
                            onClick={() => deleteAsset(asset.id)}
                            style={{
                              padding: '6px 12px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* LIABILITIES */}
                  <div>
                    <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>➖ Liabilities</h3>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Name"
                        value={newLiability.name}
                        onChange={(e) => setNewLiability({ ...newLiability, name: e.target.value })}
                        style={{
                          flex: '1 1 120px',
                          padding: '8px',
                          border: `2px solid ${theme.inputBorder}`,
                          borderRadius: '6px',
                          fontSize: '13px',
                          background: theme.input,
                          color: theme.text
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Value"
                        value={newLiability.value}
                        onChange={(e) => setNewLiability({ ...newLiability, value: e.target.value })}
                        style={{
                          width: '100px',
                          padding: '8px',
                          border: `2px solid ${theme.inputBorder}`,
                          borderRadius: '6px',
                          fontSize: '13px',
                          background: theme.input,
                          color: theme.text
                        }}
                      />
                      <button
                        onClick={addLiability}
                        style={{
                          padding: '8px 16px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        Add
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {liabilities.map(liability => (
                        <div key={liability.id} style={{
                          padding: '12px',
                          background: darkMode ? '#334155' : '#fef3f2',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ color: theme.text, fontWeight: '600' }}>{liability.name}</div>
                            <div style={{ color: theme.textMuted, fontSize: '12px' }}>${parseFloat(liability.value).toFixed(2)}</div>
                          </div>
                          <button
                            onClick={() => deleteLiability(liability.id)}
                            style={{
                              padding: '6px 12px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {financeTab === 'debt' && (
              <div style={{ background: theme.cardBg, padding: '25px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>💳 Debt Payoff Calculator</h2>

                {/* ADD DEBT */}
                <div style={{ marginBottom: '25px', padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>➕ Add Debt</h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Debt Name"
                      value={newDebt.name}
                      onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                      style={{
                        flex: '1 1 150px',
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Balance"
                      value={newDebt.balance}
                      onChange={(e) => setNewDebt({ ...newDebt, balance: e.target.value })}
                      style={{
                        width: '120px',
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Interest %"
                      value={newDebt.interestRate}
                      onChange={(e) => setNewDebt({ ...newDebt, interestRate: e.target.value })}
                      style={{
                        width: '100px',
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Min Payment"
                      value={newDebt.minPayment}
                      onChange={(e) => setNewDebt({ ...newDebt, minPayment: e.target.value })}
                      style={{
                        width: '120px',
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <select
                      value={newDebt.frequency}
                      onChange={(e) => setNewDebt({ ...newDebt, frequency: e.target.value })}
                      style={{
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="fortnightly">Fortnightly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <button
                      onClick={addDebt}
                      style={{
                        padding: '10px 24px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      Add Debt
                    </button>
                  </div>
                </div>

                {/* DEBT LIST */}
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>📋 Your Debts</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {debts.map(debt => {
                      const progress = debt.originalBalance ? 
                        ((parseFloat(debt.originalBalance) - parseFloat(debt.balance)) / parseFloat(debt.originalBalance)) * 100 : 0
                      
                      return (
                        <div key={debt.id} style={{
                          padding: '15px',
                          background: darkMode ? '#334155' : '#fef3f2',
                          borderRadius: '10px',
                          border: `2px solid ${theme.border}`
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div>
                              <div style={{ color: theme.text, fontWeight: '600', fontSize: '16px' }}>
                                {debt.name}
                              </div>
                              <div style={{ color: theme.textMuted, fontSize: '13px', marginTop: '4px' }}>
                                Balance: ${parseFloat(debt.balance).toFixed(2)} • Interest: {debt.interestRate}% • Min Payment: ${debt.minPayment}/{debt.frequency}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => addDebtToCalendar(debt)}
                                style={{
                                  padding: '8px 16px',
                                  background: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '600'
                                }}
                              >
                                📅 Add to Calendar
                              </button>
                              <button
                                onClick={() => deleteDebt(debt.id)}
                                style={{
                                  padding: '8px 16px',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px'
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div style={{ marginTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: theme.textMuted, marginBottom: '4px' }}>
                              <span>Progress: {progress.toFixed(1)}% paid off</span>
                              <span>${(parseFloat(debt.originalBalance || debt.balance) - parseFloat(debt.balance)).toFixed(2)} / ${parseFloat(debt.originalBalance || debt.balance).toFixed(2)}</span>
                            </div>
                            <div style={{ 
                              width: '100%', 
                              height: '8px', 
                              background: darkMode ? '#1e293b' : '#e2e8f0', 
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{ 
                                width: `${progress}%`, 
                                height: '100%', 
                                background: 'linear-gradient(to right, #10b981, #059669)',
                                transition: 'width 0.3s'
                              }} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* ACCELERATE PAYOFF */}
                <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f0fdf4', borderRadius: '12px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>🚀 Accelerate Payoff</h3>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', color: theme.text, marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                      Payoff Method:
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => setPayoffMethod('snowball')}
                        style={{
                          padding: '10px 20px',
                          background: payoffMethod === 'snowball' ? '#10b981' : theme.cardBg,
                          color: payoffMethod === 'snowball' ? 'white' : theme.text,
                          border: `2px solid ${payoffMethod === 'snowball' ? '#10b981' : theme.border}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        ❄️ Snowball (Lowest Balance First)
                      </button>
                      <button
                        onClick={() => setPayoffMethod('avalanche')}
                        style={{
                          padding: '10px 20px',
                          background: payoffMethod === 'avalanche' ? '#10b981' : theme.cardBg,
                          color: payoffMethod === 'avalanche' ? 'white' : theme.text,
                          border: `2px solid ${payoffMethod === 'avalanche' ? '#10b981' : theme.border}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        🏔️ Avalanche (Highest Interest First)
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', color: theme.text, marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                      Extra Monthly Payment:
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="number"
                        placeholder="Extra payment amount"
                        value={extraPayment}
                        onChange={(e) => setExtraPayment(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          border: `2px solid ${theme.inputBorder}`,
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: theme.input,
                          color: theme.text
                        }}
                      />
                      <button
                        onClick={addExtraDebtPaymentToCalendar}
                        style={{
                          padding: '10px 20px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        📅 Add to Calendar
                      </button>
                    </div>
                  </div>

                  {debts.length > 0 && (() => {
                    const payoff = calculateDebtPayoff()
                    return (
                      <div style={{ 
                        padding: '15px', 
                        background: theme.cardBg, 
                        borderRadius: '8px',
                        border: `2px solid ${theme.border}`
                      }}>
                        <h4 style={{ margin: '0 0 10px 0', color: theme.text, fontSize: '16px' }}>📊 Payoff Summary</h4>
                        <div style={{ color: theme.text, fontSize: '14px', lineHeight: '1.8' }}>
                          <div>⏱️ Time to payoff: <strong>{Math.floor(payoff.monthsToPayoff / 12)} years, {payoff.monthsToPayoff % 12} months</strong></div>
                          <div>💸 Total interest paid: <strong>${payoff.totalInterestPaid.toFixed(2)}</strong></div>
                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${theme.border}` }}>
                            <strong>Payoff Order ({payoffMethod}):</strong>
                            <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                              {payoff.payoffOrder.map((debt, idx) => (
                                <li key={debt.id} style={{ marginBottom: '4px' }}>
                                  {debt.name} - ${debt.balance} @ {debt.interestRate}%
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}

            {financeTab === 'goals' && (
              <div style={{ background: theme.cardBg, padding: '25px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>🎯 Savings Goals</h2>

                {/* ADD GOAL */}
                <div style={{ marginBottom: '25px', padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>➕ Add Goal</h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Goal Name"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                      style={{
                        flex: '1 1 200px',
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Target Amount"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                      style={{
                        width: '140px',
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Already Saved"
                      value={newGoal.saved}
                      onChange={(e) => setNewGoal({ ...newGoal, saved: e.target.value })}
                      style={{
                        width: '140px',
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <input
                      type="date"
                      placeholder="Deadline"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      style={{
                        width: '150px',
                        padding: '10px',
                        border: `2px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: theme.input,
                        color: theme.text
                      }}
                    />
                    <button
                      onClick={addGoal}
                      style={{
                        padding: '10px 24px',
                        background: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      Add Goal
                    </button>
                  </div>
                </div>

                {/* GOALS LIST */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {goals.map(goal => {
                    const progress = (parseFloat(goal.saved || 0) / parseFloat(goal.target || 1)) * 100
                    const plan = calculateSavingsPlan(goal)
                    
                    return (
                      <div key={goal.id} style={{
                        padding: '20px',
                        background: darkMode ? '#334155' : '#faf5ff',
                        borderRadius: '12px',
                        border: `2px solid ${theme.border}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                          <div>
                            <div style={{ color: theme.text, fontWeight: '600', fontSize: '18px', marginBottom: '4px' }}>
                              {goal.name}
                            </div>
                            <div style={{ color: theme.textMuted, fontSize: '14px' }}>
                              ${parseFloat(goal.saved || 0).toFixed(2)} / ${parseFloat(goal.target).toFixed(2)}
                              {goal.deadline && ` • Deadline: ${new Date(goal.deadline).toLocaleDateString()}`}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => addGoalToCalendar(goal)}
                              style={{
                                padding: '8px 16px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600'
                              }}
                            >
                              📅 Add to Calendar
                            </button>
                            <button
                              onClick={() => deleteGoal(goal.id)}
                              style={{
                                padding: '8px 16px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ marginBottom: '15px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: theme.textMuted, marginBottom: '6px' }}>
                            <span>{progress.toFixed(1)}% complete</span>
                            <span>${(parseFloat(goal.target) - parseFloat(goal.saved || 0)).toFixed(2)} remaining</span>
                          </div>
                          <div style={{ 
                            width: '100%', 
                            height: '10px', 
                            background: darkMode ? '#1e293b' : '#e2e8f0', 
                            borderRadius: '5px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${Math.min(progress, 100)}%`, 
                              height: '100%', 
                              background: 'linear-gradient(to right, #8b5cf6, #7c3aed)',
                              transition: 'width 0.3s'
                            }} />
                          </div>
                        </div>

                        {/* Savings Plan */}
                        {plan && (
                          <div style={{ 
                            padding: '12px', 
                            background: theme.cardBg, 
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: theme.text
                          }}>
                            <div style={{ fontWeight: '600', marginBottom: '6px' }}>💡 Savings Plan:</div>
                            <div>Save <strong>${plan.monthlyNeeded.toFixed(2)}/month</strong> for {plan.monthsRemaining} months</div>
                            <div style={{ color: theme.textMuted, marginTop: '4px' }}>
                              (${plan.perPaycheck.toFixed(2)} per {plan.frequency} paycheck)
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {financeTab === 'networth' && (
              <div style={{ background: theme.cardBg, padding: '25px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>💎 Net Worth Tracker</h2>

                <div style={{ 
                  padding: '20px', 
                  background: darkMode ? '#334155' : '#f0fdf4', 
                  borderRadius: '12px',
                  marginBottom: '25px'
                }}>
                  <div style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '8px' }}>Current Net Worth</div>
                  <div style={{ 
                    fontSize: '36px', 
                    fontWeight: 'bold', 
                    color: netWorth >= 0 ? '#10b981' : '#ef4444' 
                  }}>
                    ${netWorth.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '14px', color: theme.textMuted, marginTop: '8px' }}>
                    Assets: ${totalAssets.toFixed(2)} • Liabilities: ${totalLiabilities.toFixed(2)}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* ASSETS */}
                  <div>
                    <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>➕ Assets</h3>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Name"
                        value={newAsset.name}
                        onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                        style={{
                          flex: '1 1 120px',
                          padding: '8px',
                          border: `2px solid ${theme.inputBorder}`,
                          borderRadius: '6px',
                          fontSize: '13px',
                          background: theme.input,
                          color: theme.text
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Value"
                        value={newAsset.value}
                        onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
                        style={{
                          width: '100px',
                          padding: '8px',
                          border: `2px solid ${theme.inputBorder}`,
                          borderRadius: '6px',
                          fontSize: '13px',
                          background: theme.input,
                          color: theme.text
                        }}
                      />
                      <button
                        onClick={addAsset}
                        style={{
                          padding: '8px 16px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        Add
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {assets.map(asset => (
                        <div key={asset.id} style={{
                          padding: '12px',
                          background: darkMode ? '#334155' : '#f0fdf4',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ color: theme.text, fontWeight: '600' }}>{asset.name}</div>
                            <div style={{ color: theme.textMuted, fontSize: '12px' }}>${parseFloat(asset.value).toFixed(2)}</div>
                          </div>
                          <button
                            onClick={() => deleteAsset(asset.id)}
                            style={{
                              padding: '6px 12px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* LIABILITIES */}
                  <div>
                    <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>➖ Liabilities</h3>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Name"
                        value={newLiability.name}
                        onChange={(e) => setNewLiability({ ...newLiability, name: e.target.value })}
                        style={{
                          flex: '1 1 120px',
                          padding: '8px',
                          border: `2px solid ${theme.inputBorder}`,
                          borderRadius: '6px',
                          fontSize: '13px',
                          background: theme.input,
                          color: theme.text
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Value"
                        value={newLiability.value}
                        onChange={(e) => setNewLiability({ ...newLiability, value: e.target.value })}
                        style={{
                          width: '100px',
                          padding: '8px',
                          border: `2px solid ${theme.inputBorder}`,
                          borderRadius: '6px',
                          fontSize: '13px',
                          background: theme.input,
                          color: theme.text
                        }}
                      />
                      <button
                        onClick={addLiability}
                        style={{
                          padding: '8px 16px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        Add
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {liabilities.map(liability => (
                        <div key={liability.id} style={{
                          padding: '12px',
                          background: darkMode ? '#334155' : '#fef3f2',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ color: theme.text, fontWeight: '600' }}>{liability.name}</div>
                            <div style={{ color: theme.textMuted, fontSize: '12px' }}>${parseFloat(liability.value).toFixed(2)}</div>
                          </div>
                          <button
                            onClick={() => deleteLiability(liability.id)}
                            style={{
                              padding: '6px 12px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
