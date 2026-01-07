'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  const [mainTab, setMainTab] = useState("finance")
  const [financeTab, setFinanceTab] = useState("dashboard")
  const [tradingTab, setTradingTab] = useState("trading-goals")
  
  const [goals, setGoals] = useState<any[]>([])
  const [newGoal, setNewGoal] = useState({
    name: '', target: '', saved: '', deadline: ''
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
  
  // DEBT PAYOFF STATE
  const [debts, setDebts] = useState<any[]>([])
  const [newDebt, setNewDebt] = useState({
    name: '', balance: '', interestRate: '', minPayment: '', type: 'credit_card'
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
  
  // CALCULATIONS
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
  
  const monthlySurplus = totalIncome - totalExpenses
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
    setNewGoal({ name: '', target: '', saved: '', deadline: '' })
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
    setDebts([...debts, { ...newDebt, id: Date.now() }])
    setNewDebt({ name: '', balance: '', interestRate: '', minPayment: '', type: 'credit_card' })
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
    // Also remove from calendar
    setCalendarItems(calendarItems.filter(item => !(item.sourceId === id && item.type === 'goal')))
  }
  
  const deleteTransaction = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id))
    // Also remove from calendar
    setCalendarItems(calendarItems.filter(item => !(item.sourceId === id && (item.type === 'income' || item.type === 'expense'))))
  }
  
  const deleteBill = (id: number) => {
    setCalendarItems(calendarItems.filter(b => b.id !== id))
  }
  
  const deleteDebt = (id: number) => {
    setDebts(debts.filter(d => d.id !== id))
    // Also remove from calendar
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
  
  const toggleBillPaid = (id: number) => {
    setCalendarItems(calendarItems.map(b => b.id === id ? { ...b, isPaid: !b.isPaid } : b))
  }
  
  // ADD TO CALENDAR FUNCTIONS (WITH DATE PICKER)
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
    setCalendarItems([...calendarItems, {
      id: Date.now(),
      sourceId: goal.id,
      name: `🎯 ${goal.name} Deadline`,
      amount: goal.target,
      dueDate: goal.deadline,
      frequency: 'once',
      isPaid: false,
      type: 'goal'
    }].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()))
    alert('✅ Goal deadline added to calendar!')
  }
  
  const addTransactionToCalendar = (transaction: any) => {
    const exists = calendarItems.find(item => item.sourceId === transaction.id && item.type === transaction.type)
    if (exists) {
      alert('⚠️ Transaction already on calendar')
      return
    }
    
    // Prompt user for date
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
    
    // Prompt user for date
    const userDate = prompt(`📅 When is "${debt.name}" payment due?\n\nEnter date (YYYY-MM-DD):`, new Date().toISOString().split('T')[0])
    if (!userDate) return
    
    setCalendarItems([...calendarItems, {
      id: Date.now(),
      sourceId: debt.id,
      name: `💳 ${debt.name} Payment`,
      amount: debt.minPayment,
      dueDate: userDate,
      frequency: 'monthly',
      isPaid: false,
      type: 'debt'
    }].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()))
    alert('✅ Debt payment added to calendar!')
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
    return calendarItems.filter(item => {
      const itemDate = new Date(item.dueDate)
      return itemDate.getDate() === day && itemDate.getMonth() === month && itemDate.getFullYear() === year
    })
  }
  
  const convertToMonthly = (amount: number, frequency: string) => {
    const multiplier = frequency === 'weekly' ? 52/12 : frequency === 'fortnightly' ? 26/12 : frequency === 'yearly' ? 1/12 : 1
    return amount * multiplier
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eef2ff, #fce7f3)' }}>
   <div style={{ background: 'linear-gradient(to right, #4f46e5, #7c3aed)', color: 'white', padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>✨ Premium Finance Pro</h1>
          <p style={{ opacity: '0.9', margin: '0 0 24px 0' }}>
            Welcome, {user?.firstName || 'User'}! {mainTab === 'finance' ? "Let's achieve your goals." : "Let's master trading!"}
          </p>
          
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
                <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>📊 Current Position</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '12px', border: '2px solid #10b981' }}>
                      <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>💰 Monthly Income</h3>
                      <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>${totalIncome.toFixed(2)}</p>
                    </div>
                    <div style={{ padding: '20px', background: '#fef2f2', borderRadius: '12px', border: '2px solid #ef4444' }}>
                      <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>💸 Monthly Expenses</h3>
                      <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444', margin: 0 }}>${totalExpenses.toFixed(2)}</p>
                    </div>
                    <div style={{ padding: '20px', background: '#f0f9ff', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                      <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>📈 Monthly Surplus</h3>
                      <p style={{ fontSize: '28px', fontWeight: 'bold', color: monthlySurplus >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>${monthlySurplus.toFixed(2)}</p>
                    </div>
                    <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '12px', border: '2px solid #f59e0b' }}>
                      <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>💎 Net Worth</h3>
                      <p style={{ fontSize: '28px', fontWeight: 'bold', color: netWorth >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>${netWorth.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                {/* 2. CALENDAR WITH MONTH NAVIGATION */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '28px', margin: 0 }}>📅 Calendar & Reminders</h2>
                    {!notificationsEnabled && (
                      <button onClick={enableNotifications} style={{ padding: '10px 20px', background: 'linear-gradient(to right, #7c3aed, #6d28d9)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                        🔔 Enable Notifications
                      </button>
                    )}
                  </div>
                  
                  {/* Add New Bill */}
                  <div style={{ marginBottom: '24px', padding: '20px', background: '#fef3c7', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: '600' }}>Add Bill/Reminder</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                      <input type="text" placeholder="Name" value={newBill.name} onChange={(e) => setNewBill({...newBill, name: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <input type="number" placeholder="Amount" value={newBill.amount} onChange={(e) => setNewBill({...newBill, amount: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <input type="date" value={newBill.dueDate} onChange={(e) => setNewBill({...newBill, dueDate: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <select value={newBill.frequency} onChange={(e) => setNewBill({...newBill, frequency: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                        <option value="yearly">Yearly</option>
                        <option value="once">One-time</option>
                      </select>
                      <button onClick={addBill} style={{ padding: '10px 20px', background: 'linear-gradient(to right, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Add Bill</button>
                    </div>
                  </div>
                  
                  {/* Upcoming Items */}
                  {calendarItems.filter(item => !item.isPaid && new Date(item.dueDate) >= new Date()).length > 0 && (
                    <div style={{ marginBottom: '24px', padding: '20px', background: '#fef2f2', borderRadius: '12px' }}>
                      <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: '600' }}>🔔 Upcoming (Next 30 Days)</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {calendarItems.filter(item => !item.isPaid && new Date(item.dueDate) >= new Date()).slice(0, 5).map(item => {
                          const daysUntil = Math.ceil((new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                          return (
                            <div key={item.id} style={{ padding: '12px', background: 'white', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600', fontSize: '15px' }}>{item.name}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                  Due {new Date(item.dueDate).toLocaleDateString()} ({daysUntil} days)
                                </div>
                              </div>
                              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>
                                ${parseFloat(item.amount).toFixed(2)}
                              </div>
                              <button onClick={() => toggleBillPaid(item.id)} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
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
                  )}
                  
                  {/* Calendar Grid with Month Navigation */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <button onClick={prevMonth} style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>← Prev</button>
                      <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                        📆 {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <button onClick={nextMonth} style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Next →</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '6px' }}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => 
                        <div key={d} style={{ padding: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', color: '#64748b' }}>{d}</div>
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
                              border: '1px solid #e2e8f0', 
                              borderRadius: '6px', 
                              background: hasUnpaid ? '#fef2f2' : 'white',
                              minHeight: '70px',
                              fontSize: '13px'
                            }}>
                              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{d}</div>
                              {dayItems.map(item => (
                                <div key={item.id} style={{ 
                                  fontSize: '10px', 
                                  color: item.isPaid ? '#10b981' : item.type === 'goal' ? '#7c3aed' : item.type === 'income' ? '#10b981' : item.type === 'expense' ? '#ef4444' : '#f59e0b',
                                  fontWeight: '600',
                                  marginBottom: '2px',
                                  textDecoration: item.isPaid ? 'line-through' : 'none'
                                }}>
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
                <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>💰 Income & Expenses</h2>
                  <div style={{ marginBottom: '24px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                      <input type="text" placeholder="Name" value={newTransaction.name} onChange={(e) => setNewTransaction({...newTransaction, name: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <input type="number" placeholder="Amount" value={newTransaction.amount} onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <select value={newTransaction.frequency} onChange={(e) => setNewTransaction({...newTransaction, frequency: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
                        <option value="weekly">Weekly</option>
                        <option value="fortnightly">Fortnightly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                      <select value={newTransaction.type} onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                      <button onClick={addTransaction} style={{ padding: '10px 20px', background: 'linear-gradient(to right, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Add</button>
                    </div>
                  </div>
                  {transactions.length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>No transactions yet</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {transactions.map(t => {
                        const amount = parseFloat(t.amount)
                        const monthlyAmount = convertToMonthly(amount, t.frequency || 'monthly')
                        const onCalendar = calendarItems.some(item => item.sourceId === t.id && item.type === t.type)
                        return (
                          <div key={t.id} style={{ padding: '16px', background: t.type === 'income' ? '#f0fdf4' : '#fef2f2', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                              <div style={{ fontWeight: '600', fontSize: '16px' }}>{t.name}</div>
                              <div style={{ fontSize: '13px', color: '#64748b' }}>
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
                {/* 4. DEBT PAYOFF CALCULATOR */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>💳 Debt Payoff Calculator</h2>
                  <div style={{ marginBottom: '24px', padding: '20px', background: '#fef2f2', borderRadius: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                      <input type="text" placeholder="Debt name" value={newDebt.name} onChange={(e) => setNewDebt({...newDebt, name: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <input type="number" placeholder="Balance" value={newDebt.balance} onChange={(e) => setNewDebt({...newDebt, balance: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <input type="number" placeholder="Interest %" value={newDebt.interestRate} onChange={(e) => setNewDebt({...newDebt, interestRate: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <input type="number" placeholder="Min Payment" value={newDebt.minPayment} onChange={(e) => setNewDebt({...newDebt, minPayment: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <button onClick={addDebt} style={{ padding: '10px 20px', background: 'linear-gradient(to right, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Add Debt</button>
                    </div>
                  </div>
                  
                  {debts.length > 0 && (
                    <>
                      <div style={{ marginBottom: '24px', padding: '20px', background: '#f0f9ff', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: '600' }}>⚡ Accelerate Payoff</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Extra Monthly Payment</label>
                            <input 
                              type="number" 
                              placeholder="0.00" 
                              value={extraPayment} 
                              onChange={(e) => setExtraPayment(e.target.value)} 
                              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', fontSize: '14px' }} 
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Method</label>
                            <select value={payoffMethod} onChange={(e) => setPayoffMethod(e.target.value as 'snowball' | 'avalanche')} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', fontSize: '14px' }}>
                              <option value="avalanche">Avalanche (High Interest)</option>
                              <option value="snowball">Snowball (Low Balance)</option>
                            </select>
                          </div>
                        </div>
                        
                        {parseFloat(extraPayment || '0') > 0 && (() => {
                          const result = calculateDebtPayoff()
                          return (
                            <div style={{ marginTop: '16px', padding: '16px', background: 'white', borderRadius: '8px', border: '2px solid #10b981' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                                <div>
                                  <div style={{ fontSize: '12px', color: '#64748b' }}>Debt-Free In</div>
                                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{result.monthsToPayoff} months</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '12px', color: '#64748b' }}>Total Interest</div>
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
                          return (
                            <div key={debt.id} style={{ padding: '16px', background: '#fef2f2', borderRadius: '12px', border: '2px solid #ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                              <div style={{ flex: 1, minWidth: '200px' }}>
                                <h4 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{debt.name}</h4>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                                  {debt.interestRate}% APR • Min: ${parseFloat(debt.minPayment).toFixed(2)}/mo
                                </p>
                              </div>
                              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                                ${parseFloat(debt.balance).toFixed(2)}
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
                          )
                        })}
                      </div>
                    </>
                  )}
                  
                  {debts.length === 0 && (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>No debts tracked</p>
                  )}
                </div>
                
                {/* 5. FINANCIAL GOALS */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>🎯 Financial Goals</h2>
                  <div style={{ marginBottom: '24px', padding: '20px', background: '#f0f9ff', borderRadius: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      <input type="text" placeholder="Goal name" value={newGoal.name} onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <input type="number" placeholder="Target $" value={newGoal.target} onChange={(e) => setNewGoal({...newGoal, target: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <input type="number" placeholder="Saved $" value={newGoal.saved} onChange={(e) => setNewGoal({...newGoal, saved: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <input type="date" placeholder="Deadline" value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <button onClick={addGoal} style={{ padding: '10px 20px', background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Add Goal</button>
                    </div>
                  </div>
                  {goals.length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>No goals yet. Add one above!</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {goals.map(goal => {
                        const target = parseFloat(goal.target || 0)
                        const saved = parseFloat(goal.saved || 0)
                        const progress = target > 0 ? (saved / target) * 100 : 0
                        const onCalendar = calendarItems.some(item => item.sourceId === goal.id && item.type === 'goal')
                        return (
                          <div key={goal.id} style={{ padding: '20px', background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                              <div style={{ flex: 1, minWidth: '200px' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{goal.name}</h3>
                                <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
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
                            <div style={{ width: '100%', height: '20px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
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
                  <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>💵 Automatic Savings Plans</h2>
                    <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '16px' }}>
                      See exactly how much to save per paycheck to hit your goals on time!
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {goals.map(goal => {
                        const plan = calculateSavingsPlan(goal)
                        if (!plan) return null
                        
                        return (
                          <div key={goal.id} style={{ padding: '24px', background: 'linear-gradient(to right, #ecfdf5, #d1fae5)', borderRadius: '12px', border: '2px solid #10b981' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#065f46', marginBottom: '16px' }}>{goal.name}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                              <div style={{ padding: '16px', background: 'white', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>💰 Per Paycheck</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>${plan.perPaycheck.toFixed(2)}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>Every {plan.frequency}</div>
                              </div>
                              <div style={{ padding: '16px', background: 'white', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>📅 Per Month</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>${plan.monthlyNeeded.toFixed(2)}</div>
                              </div>
                              <div style={{ padding: '16px', background: 'white', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>⏰ Months Left</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{plan.monthsRemaining}</div>
                              </div>
                            </div>
                            {monthlySurplus >= plan.monthlyNeeded ? (
                              <div style={{ padding: '12px', background: '#f0fdf4', border: '2px solid #10b981', borderRadius: '8px', fontSize: '14px', color: '#065f46', fontWeight: '600' }}>
                                ✅ Affordable! Your surplus (${monthlySurplus.toFixed(2)}/mo) covers this.
                              </div>
                            ) : (
                              <div style={{ padding: '12px', background: '#fef2f2', border: '2px solid #ef4444', borderRadius: '8px', fontSize: '14px', color: '#991b1b', fontWeight: '600' }}>
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
            {/* 4. DEBT PAYOFF CALCULATOR */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>💳 Debt Payoff Calculator</h2>
                  <div style={{ marginBottom: '24px', padding: '20px', background: '#fef2f2', borderRadius: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                      <input type="text" placeholder="Debt name" value={newDebt.name} onChange={(e) => setNewDebt({...newDebt, name: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <input type="number" placeholder="Balance" value={newDebt.balance} onChange={(e) => setNewDebt({...newDebt, balance: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <input type="number" placeholder="Interest %" value={newDebt.interestRate} onChange={(e) => setNewDebt({...newDebt, interestRate: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <input type="number" placeholder="Min Payment" value={newDebt.minPayment} onChange={(e) => setNewDebt({...newDebt, minPayment: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <button onClick={addDebt} style={{ padding: '10px 20px', background: 'linear-gradient(to right, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Add Debt</button>
                    </div>
                  </div>
                  
                  {debts.length > 0 && (
                    <>
                      <div style={{ marginBottom: '24px', padding: '20px', background: '#f0f9ff', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: '600' }}>⚡ Accelerate Payoff</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Extra Monthly Payment</label>
                            <input 
                              type="number" 
                              placeholder="0.00" 
                              value={extraPayment} 
                              onChange={(e) => setExtraPayment(e.target.value)} 
                              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', fontSize: '14px' }} 
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Method</label>
                            <select value={payoffMethod} onChange={(e) => setPayoffMethod(e.target.value as 'snowball' | 'avalanche')} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', fontSize: '14px' }}>
                              <option value="avalanche">Avalanche (High Interest)</option>
                              <option value="snowball">Snowball (Low Balance)</option>
                            </select>
                          </div>
                        </div>
                        
                        {parseFloat(extraPayment || '0') > 0 && (() => {
                          const result = calculateDebtPayoff()
                          return (
                            <div style={{ marginTop: '16px', padding: '16px', background: 'white', borderRadius: '8px', border: '2px solid #10b981' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                                <div>
                                  <div style={{ fontSize: '12px', color: '#64748b' }}>Debt-Free In</div>
                                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{result.monthsToPayoff} months</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '12px', color: '#64748b' }}>Total Interest</div>
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
                          return (
                            <div key={debt.id} style={{ padding: '16px', background: '#fef2f2', borderRadius: '12px', border: '2px solid #ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                              <div style={{ flex: 1, minWidth: '200px' }}>
                                <h4 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{debt.name}</h4>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                                  {debt.interestRate}% APR • Min: ${parseFloat(debt.minPayment).toFixed(2)}/mo
                                </p>
                              </div>
                              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                                ${parseFloat(debt.balance).toFixed(2)}
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
                          )
                        })}
                      </div>
                    </>
                  )}
                  
                  {debts.length === 0 && (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>No debts tracked</p>
                  )}
                </div>
                
                {/* 5. FINANCIAL GOALS */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>🎯 Financial Goals</h2>
                  <div style={{ marginBottom: '24px', padding: '20px', background: '#f0f9ff', borderRadius: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      <input type="text" placeholder="Goal name" value={newGoal.name} onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <input type="number" placeholder="Target $" value={newGoal.target} onChange={(e) => setNewGoal({...newGoal, target: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <input type="number" placeholder="Saved $" value={newGoal.saved} onChange={(e) => setNewGoal({...newGoal, saved: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <input type="date" placeholder="Deadline" value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                      <button onClick={addGoal} style={{ padding: '10px 20px', background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Add Goal</button>
                    </div>
                  </div>
                  {goals.length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>No goals yet. Add one above!</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {goals.map(goal => {
                        const target = parseFloat(goal.target || 0)
                        const saved = parseFloat(goal.saved || 0)
                        const progress = target > 0 ? (saved / target) * 100 : 0
                        const onCalendar = calendarItems.some(item => item.sourceId === goal.id && item.type === 'goal')
                        return (
                          <div key={goal.id} style={{ padding: '20px', background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                              <div style={{ flex: 1, minWidth: '200px' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{goal.name}</h3>
                                <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
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
                            <div style={{ width: '100%', height: '20px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
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
                  <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>💵 Automatic Savings Plans</h2>
                    <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '16px' }}>
                      See exactly how much to save per paycheck to hit your goals on time!
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {goals.map(goal => {
                        const plan = calculateSavingsPlan(goal)
                        if (!plan) return null
                        
                        return (
                          <div key={goal.id} style={{ padding: '24px', background: 'linear-gradient(to right, #ecfdf5, #d1fae5)', borderRadius: '12px', border: '2px solid #10b981' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#065f46', marginBottom: '16px' }}>{goal.name}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                              <div style={{ padding: '16px', background: 'white', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>💰 Per Paycheck</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>${plan.perPaycheck.toFixed(2)}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>Every {plan.frequency}</div>
                              </div>
                              <div style={{ padding: '16px', background: 'white', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>📅 Per Month</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>${plan.monthlyNeeded.toFixed(2)}</div>
                              </div>
                              <div style={{ padding: '16px', background: 'white', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>⏰ Months Left</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{plan.monthsRemaining}</div>
                              </div>
                            </div>
                            {monthlySurplus >= plan.monthlyNeeded ? (
                              <div style={{ padding: '12px', background: '#f0fdf4', border: '2px solid #10b981', borderRadius: '8px', fontSize: '14px', color: '#065f46', fontWeight: '600' }}>
                                ✅ Affordable! Your surplus (${monthlySurplus.toFixed(2)}/mo) covers this.
                              </div>
                            ) : (
                              <div style={{ padding: '12px', background: '#fef2f2', border: '2px solid #ef4444', borderRadius: '8px', fontSize: '14px', color: '#991b1b', fontWeight: '600' }}>
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
