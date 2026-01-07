'use client'

import { useUser } from '@clerk/nextjs'
import { useState } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  const [mainTab, setMainTab] = useState("finance")
  const [financeTab, setFinanceTab] = useState("goals")
  const [tradingTab, setTradingTab] = useState("trading-goals")
  
  const [goals, setGoals] = useState<any[]>([])
  const [newGoal, setNewGoal] = useState({
    name: '', target: '', saved: '', deadline: ''
  })
  
  const [transactions, setTransactions] = useState<any[]>([])
  const [newTransaction, setNewTransaction] = useState({
    name: '', amount: '', type: 'expense', date: new Date().toISOString().split('T')[0], frequency: 'monthly'
  })
  
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
  
  // DEBT CALCULATIONS
  const totalDebt = debts.reduce((sum, d) => sum + parseFloat(d.balance || 0), 0)
  const totalMinPayments = debts.reduce((sum, d) => sum + parseFloat(d.minPayment || 0), 0)
  
  // NET WORTH CALCULATIONS
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
  // BASIC FUNCTIONS
  const addGoal = () => {
    if (!newGoal.name || !newGoal.target) return
    setGoals([...goals, { ...newGoal, id: Date.now() }])
    setNewGoal({ name: '', target: '', saved: '', deadline: '' })
  }
  
  const addTradingGoal = () => {
    if (!newTradingGoal.name || !newTradingGoal.target) return
    setTradingGoals([...tradingGoals, { ...newTradingGoal, id: Date.now() }])
    setNewTradingGoal({ name: '', target: '', current: '', deadline: '', type: 'profit' })
  }
  
  const addTransaction = () => {
    if (!newTransaction.name || !newTransaction.amount) return
    setTransactions([...transactions, { ...newTransaction, id: Date.now() }])
    setNewTransaction({ name: '', amount: '', type: 'expense', date: new Date().toISOString().split('T')[0], frequency: 'monthly' })
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
  
  // DEBT FUNCTIONS
  const addDebt = () => {
    if (!newDebt.name || !newDebt.balance) return
    setDebts([...debts, { ...newDebt, id: Date.now() }])
    setNewDebt({ name: '', balance: '', interestRate: '', minPayment: '', type: 'credit_card' })
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
      if (monthsToPayoff > 600) break // Safety limit
      
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
  
  // NET WORTH FUNCTIONS
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
  
  // SAVINGS PLAN CALCULATOR
  const calculateSavingsPlan = (goal: any) => {
    const target = parseFloat(goal.target || 0)
    const saved = parseFloat(goal.saved || 0)
    const remaining = target - saved
    
    if (!goal.deadline || remaining <= 0) return null
    
    const today = new Date()
    const deadline = new Date(goal.deadline)
    const monthsRemaining = Math.max(1, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)))
    
    const monthlyNeeded = remaining / monthsRemaining
    
    // Calculate based on pay frequency
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
  
  const getDaysInMonth = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth, month, year }
  }
  
  const getTradesForDay = (day: number) => {
    const { month, year } = getDaysInMonth()
    return trades.filter(t => {
      const tDate = new Date(t.date)
      return tDate.getDate() === day && tDate.getMonth() === month && tDate.getFullYear() === year
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
                  { id: "goals", label: "🎯 Goals" }, 
                  { id: "position", label: "📊 Position" }, 
                  { id: "path", label: "🗺️ Path" }, 
                  { id: "savings", label: "💵 Savings Plans" }, 
                  { id: "debt", label: "💳 Debt Payoff" }, 
                  { id: "networth", label: "📈 Net Worth" }, 
                  { id: "coach", label: "💬 AI Coach" }, 
                  { id: "transactions", label: "💰 Transactions" }
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
            {financeTab === 'goals' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>🎯 Your Financial Goals</h2>
                <div style={{ marginBottom: '32px', padding: '24px', background: '#f0f9ff', borderRadius: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <input type="text" placeholder="Goal name" value={newGoal.name} onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="number" placeholder="Target" value={newGoal.target} onChange={(e) => setNewGoal({...newGoal, target: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="number" placeholder="Saved" value={newGoal.saved} onChange={(e) => setNewGoal({...newGoal, saved: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <button onClick={addGoal} style={{ padding: '12px 24px', background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Add Goal</button>
                  </div>
                </div>
                {goals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎯</div>
                    <h3 style={{ fontSize: '24px' }}>No goals yet!</h3>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {goals.map(goal => {
                      const target = parseFloat(goal.target || 0)
                      const saved = parseFloat(goal.saved || 0)
                      const progress = target > 0 ? (saved / target) * 100 : 0
                      return (
                        <div key={goal.id} style={{ padding: '24px', background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div><h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{goal.name}</h3><p style={{ color: '#64748b' }}>${saved.toLocaleString()} of ${target.toLocaleString()}</p></div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>{progress.toFixed(0)}%</div>
                          </div>
                          <div style={{ width: '100%', height: '24px', background: '#e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: 'linear-gradient(to right, #3b82f6, #2563eb)' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
            
            {financeTab === 'position' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '32px' }}>📊 Current Position</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '24px', background: '#f0fdf4', borderRadius: '12px', border: '2px solid #10b981' }}>
                    <h3 style={{ fontSize: '16px', color: '#64748b' }}>💰 Monthly Income</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>${totalIncome.toFixed(2)}</p>
                  </div>
                  <div style={{ padding: '24px', background: '#fef2f2', borderRadius: '12px', border: '2px solid #ef4444' }}>
                    <h3 style={{ fontSize: '16px', color: '#64748b' }}>💸 Monthly Expenses</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>${totalExpenses.toFixed(2)}</p>
                  </div>
                  <div style={{ padding: '24px', background: '#f0f9ff', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                    <h3 style={{ fontSize: '16px', color: '#64748b' }}>📈 Monthly Surplus</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: monthlySurplus >= 0 ? '#10b981' : '#ef4444' }}>${monthlySurplus.toFixed(2)}</p>
                  </div>
                  <div style={{ padding: '24px', background: '#fef3c7', borderRadius: '12px', border: '2px solid #f59e0b' }}>
                    <h3 style={{ fontSize: '16px', color: '#64748b' }}>💎 Net Worth</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: netWorth >= 0 ? '#10b981' : '#ef4444' }}>${netWorth.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
            
            {financeTab === 'path' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>🗺️ Path to Goals</h2>
                {goals.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '32px' }}>Set goals first!</p>
                ) : monthlySurplus > 0 ? (
                  <div style={{ padding: '32px', background: '#f0fdf4', borderRadius: '12px' }}>
                    <p style={{ fontSize: '18px' }}>With ${monthlySurplus.toFixed(2)}/month, reach goals in <strong>{Math.ceil(totalGoalsRemaining / monthlySurplus)} months</strong></p>
                  </div>
                ) : (
                  <div style={{ padding: '32px', background: '#fef2f2', borderRadius: '12px' }}>
                    <p style={{ color: '#ef4444' }}>Increase income or reduce expenses</p>
                  </div>
                )}
              </div>
            )}
            {financeTab === 'savings' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>💵 Automatic Savings Plans</h2>
                <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '18px' }}>
                  See exactly how much to save per paycheck to hit your goals on time!
                </p>
                
                {goals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>💵</div>
                    <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>No goals yet!</h3>
                    <p style={{ color: '#64748b' }}>Add goals in the "Goals" tab to see your savings plan</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {goals.map(goal => {
                      const plan = calculateSavingsPlan(goal)
                      if (!plan) return null
                      
                      return (
                        <div key={goal.id} style={{ padding: '32px', background: 'linear-gradient(to right, #ecfdf5, #d1fae5)', borderRadius: '16px', border: '3px solid #10b981' }}>
                          <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#065f46', marginBottom: '8px' }}>{goal.name}</h3>
                            <p style={{ fontSize: '18px', color: '#64748b' }}>
                              ${parseFloat(goal.saved || 0).toLocaleString()} / ${parseFloat(goal.target).toLocaleString()} saved
                            </p>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ padding: '20px', background: 'white', borderRadius: '12px' }}>
                              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>💰 Per Paycheck</div>
                              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>${plan.perPaycheck.toFixed(2)}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>Every {plan.frequency}</div>
                            </div>
                            
                            <div style={{ padding: '20px', background: 'white', borderRadius: '12px' }}>
                              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>📅 Per Month</div>
                              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>${plan.monthlyNeeded.toFixed(2)}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>{plan.paymentsPerMonth.toFixed(1)} payments/month</div>
                            </div>
                            
                            <div style={{ padding: '20px', background: 'white', borderRadius: '12px' }}>
                              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>⏰ Time Left</div>
                              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{plan.monthsRemaining}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>months until deadline</div>
                            </div>
                            
                            <div style={{ padding: '20px', background: 'white', borderRadius: '12px' }}>
                              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>🎯 Remaining</div>
                              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7c3aed' }}>${plan.remaining.toFixed(2)}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>left to save</div>
                            </div>
                          </div>
                          
                          {monthlySurplus >= plan.monthlyNeeded ? (
                            <div style={{ padding: '16px', background: '#f0fdf4', border: '2px solid #10b981', borderRadius: '12px' }}>
                              <p style={{ color: '#065f46', fontWeight: '600', fontSize: '16px' }}>
                                ✅ You can afford this! Your surplus (${monthlySurplus.toFixed(2)}/month) covers the required ${plan.monthlyNeeded.toFixed(2)}/month
                              </p>
                            </div>
                          ) : (
                            <div style={{ padding: '16px', background: '#fef2f2', border: '2px solid #ef4444', borderRadius: '12px' }}>
                              <p style={{ color: '#991b1b', fontWeight: '600', fontSize: '16px' }}>
                                ⚠️ You need ${(plan.monthlyNeeded - monthlySurplus).toFixed(2)}/month more to reach this goal on time
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
            
            {financeTab === 'debt' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>💳 Debt Payoff Calculator</h2>
                <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '18px' }}>
                  Create a strategic plan to eliminate your debt faster and save on interest!
                </p>
                
                <div style={{ marginBottom: '32px', padding: '24px', background: '#fef2f2', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Add a Debt</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <input type="text" placeholder="Debt name" value={newDebt.name} onChange={(e) => setNewDebt({...newDebt, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="number" placeholder="Balance" value={newDebt.balance} onChange={(e) => setNewDebt({...newDebt, balance: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="number" placeholder="Interest Rate %" value={newDebt.interestRate} onChange={(e) => setNewDebt({...newDebt, interestRate: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="number" placeholder="Min Payment" value={newDebt.minPayment} onChange={(e) => setNewDebt({...newDebt, minPayment: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <select value={newDebt.type} onChange={(e) => setNewDebt({...newDebt, type: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <option value="credit_card">Credit Card</option>
                      <option value="personal_loan">Personal Loan</option>
                      <option value="student_loan">Student Loan</option>
                      <option value="car_loan">Car Loan</option>
                      <option value="other">Other</option>
                    </select>
                    <button onClick={addDebt} style={{ padding: '12px 24px', background: 'linear-gradient(to right, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Add Debt</button>
                  </div>
                </div>
                
                {debts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>💳</div>
                    <h3 style={{ fontSize: '24px' }}>No debts tracked</h3>
                    <p style={{ color: '#64748b' }}>Add your debts above to see your payoff plan</p>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '32px', padding: '32px', background: 'linear-gradient(to right, #fef2f2, #fee2e2)', borderRadius: '12px', border: '3px solid #ef4444' }}>
                      <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>📊 Debt Summary</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                          <div style={{ fontSize: '14px', color: '#64748b' }}>Total Debt</div>
                          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>${totalDebt.toFixed(2)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', color: '#64748b' }}>Total Min Payments</div>
                          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>${totalMinPayments.toFixed(2)}/mo</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', color: '#64748b' }}>Number of Debts</div>
                          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>{debts.length}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '32px', padding: '24px', background: '#f0f9ff', borderRadius: '12px' }}>
                      <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>⚡ Accelerate Payoff</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Extra Monthly Payment</label>
                          <input 
                            type="number" 
                            placeholder="0.00" 
                            value={extraPayment} 
                            onChange={(e) => setExtraPayment(e.target.value)} 
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }} 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Payoff Method</label>
                          <select value={payoffMethod} onChange={(e) => setPayoffMethod(e.target.value as 'snowball' | 'avalanche')} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}>
                            <option value="avalanche">Avalanche (Highest Interest First)</option>
                            <option value="snowball">Snowball (Smallest Balance First)</option>
                          </select>
                        </div>
                      </div>
                      
                      {parseFloat(extraPayment || '0') > 0 && (() => {
                        const result = calculateDebtPayoff()
                        return (
                          <div style={{ marginTop: '24px', padding: '20px', background: 'white', borderRadius: '12px', border: '2px solid #10b981' }}>
                            <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#065f46' }}>✅ Payoff Plan Results</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                              <div>
                                <div style={{ fontSize: '14px', color: '#64748b' }}>Debt-Free In</div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{result.monthsToPayoff} months</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '14px', color: '#64748b' }}>Total Interest Paid</div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>${result.totalInterestPaid.toFixed(2)}</div>
                              </div>
                            </div>
                            <div style={{ marginTop: '16px' }}>
                              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Payoff Order ({payoffMethod === 'avalanche' ? 'Highest Interest First' : 'Smallest Balance First'}):</div>
                              <ol style={{ marginLeft: '20px', lineHeight: '2' }}>
                                {result.payoffOrder.map((d: any, idx: number) => (
                                  <li key={idx}>{d.name} - ${d.balance} @ {d.interestRate}%</li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Your Debts</h3>
                      {debts.map(debt => (
                        <div key={debt.id} style={{ padding: '20px', background: '#fef2f2', borderRadius: '12px', border: '2px solid #ef4444' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                              <h4 style={{ fontSize: '20px', fontWeight: 'bold' }}>{debt.name}</h4>
                              <p style={{ fontSize: '14px', color: '#64748b' }}>{debt.type.replace('_', ' ')}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>${parseFloat(debt.balance).toFixed(2)}</div>
                              <div style={{ fontSize: '14px', color: '#64748b' }}>{debt.interestRate}% APR</div>
                            </div>
                          </div>
                          <div style={{ fontSize: '14px', color: '#64748b' }}>
                            Min Payment: <span style={{ fontWeight: '600', color: '#1e293b' }}>${parseFloat(debt.minPayment).toFixed(2)}/month</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            
            {financeTab === 'networth' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>📈 Net Worth Tracker</h2>
                <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '18px' }}>
                  Track your total assets minus liabilities to see your true financial position.
                </p>
                
                <div style={{ marginBottom: '32px', padding: '32px', background: netWorth >= 0 ? 'linear-gradient(to right, #f0fdf4, #dcfce7)' : 'linear-gradient(to right, #fef2f2, #fee2e2)', borderRadius: '16px', border: `3px solid ${netWorth >= 0 ? '#10b981' : '#ef4444'}` }}>
                  <h3 style={{ fontSize: '20px', color: '#64748b', marginBottom: '8px' }}>Your Net Worth</h3>
                  <div style={{ fontSize: '56px', fontWeight: 'bold', color: netWorth >= 0 ? '#10b981' : '#ef4444', marginBottom: '16px' }}>
                    ${netWorth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>Total Assets</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>${totalAssets.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>Total Liabilities</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>${totalLiabilities.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  <div style={{ padding: '24px', background: '#f0fdf4', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#065f46' }}>➕ Add Asset</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input type="text" placeholder="Asset name" value={newAsset.name} onChange={(e) => setNewAsset({...newAsset, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <input type="number" placeholder="Value" value={newAsset.value} onChange={(e) => setNewAsset({...newAsset, value: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <select value={newAsset.type} onChange={(e) => setNewAsset({...newAsset, type: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <option value="savings">Savings Account</option>
                        <option value="checking">Checking Account</option>
                        <option value="investment">Investment</option>
                        <option value="property">Property</option>
                        <option value="vehicle">Vehicle</option>
                        <option value="other">Other</option>
                      </select>
                      <button onClick={addAsset} style={{ padding: '12px 24px', background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Add Asset</button>
                    </div>
                  </div>
                  
                  <div style={{ padding: '24px', background: '#fef2f2', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#991b1b' }}>➖ Add Liability</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input type="text" placeholder="Liability name" value={newLiability.name} onChange={(e) => setNewLiability({...newLiability, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <input type="number" placeholder="Amount owed" value={newLiability.value} onChange={(e) => setNewLiability({...newLiability, value: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <select value={newLiability.type} onChange={(e) => setNewLiability({...newLiability, type: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <option value="loan">Loan</option>
                        <option value="mortgage">Mortgage</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="student_loan">Student Loan</option>
                        <option value="other">Other</option>
                      </select>
                      <button onClick={addLiability} style={{ padding: '12px 24px', background: 'linear-gradient(to right, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Add Liability</button>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>💰 Assets</h3>
                    {assets.length === 0 ? (
                      <p style={{ color: '#64748b', padding: '32px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px' }}>No assets tracked</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {assets.map(asset => (
                          <div key={asset.id} style={{ padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '2px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '16px' }}>{asset.name}</div>
                              <div style={{ fontSize: '14px', color: '#64748b' }}>{asset.type.replace('_', ' ')}</div>
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>${parseFloat(asset.value).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>💳 Liabilities</h3>
                    {liabilities.length === 0 ? (
                      <p style={{ color: '#64748b', padding: '32px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px' }}>No liabilities tracked</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {liabilities.map(liability => (
                          <div key={liability.id} style={{ padding: '16px', background: '#fef2f2', borderRadius: '12px', border: '2px solid #ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '16px' }}>{liability.name}</div>
                              <div style={{ fontSize: '14px', color: '#64748b' }}>{liability.type.replace('_', ' ')}</div>
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>${parseFloat(liability.value).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {financeTab === 'coach' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>💬 AI Budget Coach</h2>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>Ask me anything about your finances! I have access to all your data and can give personalized advice.</p>
                
                {chatMessages.length === 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#64748b' }}>💡 Try asking:</h3>
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
                            background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)',
                            border: '2px solid #3b82f6',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#1e40af'
                          }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px', padding: '20px', background: '#f8fafc', borderRadius: '12px', minHeight: '300px' }}>
                  {chatMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
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
                            background: msg.role === 'user' ? 'linear-gradient(to right, #4f46e5, #7c3aed)' : 'white',
                            color: msg.role === 'user' ? 'white' : '#1e293b',
                            border: msg.role === 'assistant' ? '2px solid #e2e8f0' : 'none'
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
                          <div style={{ padding: '16px', borderRadius: '12px', background: 'white', border: '2px solid #e2e8f0' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.7 }}>🤖 AI Coach</div>
                            <div>Thinking...</div>
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
                      border: '2px solid #e2e8f0',
                      fontSize: '16px'
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
            
            {financeTab === 'transactions' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>💰 Transactions</h2>
                <div style={{ marginBottom: '32px', padding: '24px', background: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <input type="text" placeholder="Name" value={newTransaction.name} onChange={(e) => setNewTransaction({...newTransaction, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="number" placeholder="Amount" value={newTransaction.amount} onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <select value={newTransaction.frequency} onChange={(e) => setNewTransaction({...newTransaction, frequency: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <option value="weekly">Weekly</option>
                      <option value="fortnightly">Fortnightly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <select value={newTransaction.type} onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                    <input type="date" value={newTransaction.date} onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <button onClick={addTransaction} style={{ padding: '12px 24px', background: 'linear-gradient(to right, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Add</button>
                  </div>
                </div>
                {transactions.length === 0 ? <p style={{ color: '#64748b', textAlign: 'center', padding: '32px' }}>No transactions yet</p> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {transactions.map(t => {
                      const amount = parseFloat(t.amount)
                      const monthlyAmount = convertToMonthly(amount, t.frequency || 'monthly')
                      return (
                        <div key={t.id} style={{ padding: '16px', background: t.type === 'income' ? '#f0fdf4' : '#fef2f2', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '18px' }}>{t.name}</div>
                            <div style={{ fontSize: '14px', color: '#64748b' }}>
                              ${amount.toFixed(2)}/{t.frequency || 'monthly'} • {new Date(t.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: t.type === 'income' ? '#10b981' : '#ef4444' }}>
                              {t.type === 'income' ? '+' : '-'}${amount.toFixed(2)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              ≈ ${monthlyAmount.toFixed(2)}/month
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {mainTab === 'trading' && (
          <>
            {tradingTab === 'trading-goals' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>🎯 Trading Goals</h2>
                <div style={{ marginBottom: '32px', padding: '24px', background: '#fef3c7', borderRadius: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <input type="text" placeholder="Goal" value={newTradingGoal.name} onChange={(e) => setNewTradingGoal({...newTradingGoal, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="number" placeholder="Target" value={newTradingGoal.target} onChange={(e) => setNewTradingGoal({...newTradingGoal, target: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="number" placeholder="Current" value={newTradingGoal.current} onChange={(e) => setNewTradingGoal({...newTradingGoal, current: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="date" value={newTradingGoal.deadline} onChange={(e) => setNewTradingGoal({...newTradingGoal, deadline: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <button onClick={addTradingGoal} style={{ padding: '12px 24px', background: 'linear-gradient(to right, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Add</button>
                  </div>
                </div>
                {tradingGoals.length === 0 ? <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '12px' }}><div style={{ fontSize: '64px' }}>🎯</div><h3>No goals yet</h3></div> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {tradingGoals.map(g => { const progress = parseFloat(g.target) > 0 ? (parseFloat(g.current) / parseFloat(g.target)) * 100 : 0; return (
                      <div key={g.id} style={{ padding: '24px', background: 'linear-gradient(to right, #fef3c7, #fde68a)', borderRadius: '12px', border: '2px solid #f59e0b' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><div><h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{g.name}</h3></div><div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{progress.toFixed(0)}%</div></div>
                        <div style={{ width: '100%', height: '24px', background: '#e2e8f0', borderRadius: '12px', overflow: 'hidden' }}><div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: 'linear-gradient(to right, #f59e0b, #d97706)' }} /></div>
                      </div>
                    )})}
                  </div>
                )}
              </div>
            )}
            
            {tradingTab === 'performance' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '32px' }}>📊 Performance</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                  <div style={{ padding: '24px', background: totalPL >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: '12px', border: `2px solid ${totalPL >= 0 ? '#10b981' : '#ef4444'}` }}><h3>Total P&L</h3><p style={{ fontSize: '32px', fontWeight: 'bold', color: totalPL >= 0 ? '#10b981' : '#ef4444' }}>${totalPL.toFixed(2)}</p></div>
                  <div style={{ padding: '24px', background: '#f0f9ff', borderRadius: '12px', border: '2px solid #3b82f6' }}><h3>Win Rate</h3><p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>{winRate.toFixed(1)}%</p></div>
                  <div style={{ padding: '24px', background: '#fef3c7', borderRadius: '12px', border: '2px solid #f59e0b' }}><h3>Profit Factor</h3><p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{profitFactor.toFixed(2)}</p></div>
                  <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '2px solid #64748b' }}><h3>Trades</h3><p style={{ fontSize: '32px', fontWeight: 'bold' }}>{trades.length}</p></div>
                </div>
                <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>📅 Calendar</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: '#64748b' }}>{d}</div>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                  {(() => { const { firstDay, daysInMonth } = getDaysInMonth(); const cells = []; for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />); for (let d = 1; d <= daysInMonth; d++) { const dayPL = getTradesForDay(d).reduce((s, t) => s + parseFloat(t.profitLoss || 0), 0); cells.push(<div key={d} style={{ padding: '12px 8px', border: '1px solid #e2e8f0', borderRadius: '8px', background: dayPL > 0 ? '#f0fdf4' : dayPL < 0 ? '#fef2f2' : 'white', minHeight: '80px' }}><div style={{ fontWeight: 'bold' }}>{d}</div>{dayPL !== 0 && <div style={{ fontSize: '14px', fontWeight: 'bold', color: dayPL > 0 ? '#10b981' : '#ef4444' }}>{dayPL > 0 ? '+' : ''}${dayPL.toFixed(2)}</div>}</div>)} return cells })()}
                </div>
              </div>
            )}
            
            {tradingTab === 'trading-path' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>🗺️ Path to Profitability</h2>
                {trades.length < 10 ? <div style={{ padding: '32px', background: '#fef3c7', borderRadius: '12px' }}><p>Log 10+ trades for insights. Current: {trades.length}</p></div> : (
                  <div style={{ padding: '32px', background: '#f0fdf4', borderRadius: '12px' }}><h3>✅ Recommendations</h3><ol style={{ marginLeft: '20px', lineHeight: '2' }}>{winRate < 50 && <li>Improve win rate</li>}{profitFactor < 1.5 && <li>Improve profit factor</li>}{netPL < 0 && <li style={{ color: '#ef4444', fontWeight: 'bold' }}>Review strategy</li>}</ol></div>
                )}
              </div>
            )}
            
            {tradingTab === 'finder' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>🔮 Trade Finder (Multi-Timeframe Analysis)</h2>
                <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '18px' }}>
                  Upload 3 screenshots for confluence analysis. Minimum 1:2 risk:reward ratio required.
                </p>
                
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    <div style={{ padding: '24px', background: '#fef3c7', borderRadius: '12px', border: '2px solid #f59e0b' }}>
                      <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#92400e' }}>📊 1H Chart (Trend)</h3>
                      <input type="file" accept="image/*" onChange={(e) => handleTradeFinderUpload('oneHour', e)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', marginBottom: '12px' }} />
                      {tradeFinderScreenshots.oneHour && <img src={tradeFinderScreenshots.oneHour} alt="1H" style={{ width: '100%', borderRadius: '8px', border: '2px solid #f59e0b' }} />}
                    </div>
                    
                    <div style={{ padding: '24px', background: '#dbeafe', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                      <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#1e40af' }}>📊 15M Chart (Setup)</h3>
                      <input type="file" accept="image/*" onChange={(e) => handleTradeFinderUpload('fifteenMin', e)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', marginBottom: '12px' }} />
                      {tradeFinderScreenshots.fifteenMin && <img src={tradeFinderScreenshots.fifteenMin} alt="15M" style={{ width: '100%', borderRadius: '8px', border: '2px solid #3b82f6' }} />}
                    </div>
                    
                    <div style={{ padding: '24px', background: '#f0fdf4', borderRadius: '12px', border: '2px solid #10b981' }}>
                      <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#065f46' }}>📊 5M Chart (Confirmation)</h3>
                      <input type="file" accept="image/*" onChange={(e) => handleTradeFinderUpload('fiveMin', e)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', marginBottom: '12px' }} />
                      {tradeFinderScreenshots.fiveMin && <img src={tradeFinderScreenshots.fiveMin} alt="5M" style={{ width: '100%', borderRadius: '8px', border: '2px solid #10b981' }} />}
                    </div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <button
                    onClick={analyzeTradeSetup}
                    disabled={!tradeFinderScreenshots.oneHour || !tradeFinderScreenshots.fifteenMin || !tradeFinderScreenshots.fiveMin || isAnalyzingTrade}
                    style={{
                      padding: '16px 48px',
                      background: (!tradeFinderScreenshots.oneHour || !tradeFinderScreenshots.fifteenMin || !tradeFinderScreenshots.fiveMin || isAnalyzingTrade) ? '#94a3b8' : 'linear-gradient(to right, #7c3aed, #6d28d9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: (!tradeFinderScreenshots.oneHour || !tradeFinderScreenshots.fifteenMin || !tradeFinderScreenshots.fiveMin || isAnalyzingTrade) ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '20px'
                    }}
                  >
                    {isAnalyzingTrade ? '🔄 Analyzing All Timeframes...' : '🔮 Analyze Trade Setup'}
                  </button>
                </div>
                
                {tradeRecommendation && (
                  <div style={{ padding: '32px', background: tradeRecommendation.shouldTrade ? 'linear-gradient(to right, #f0fdf4, #dcfce7)' : 'linear-gradient(to right, #fef2f2, #fee2e2)', borderRadius: '16px', border: `3px solid ${tradeRecommendation.shouldTrade ? '#10b981' : '#ef4444'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                      <div style={{ fontSize: '64px' }}>{tradeRecommendation.shouldTrade ? '✅' : '❌'}</div>
                      <div>
                        <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: tradeRecommendation.shouldTrade ? '#065f46' : '#991b1b', margin: 0 }}>
                          {tradeRecommendation.shouldTrade ? 'TRADE RECOMMENDATION' : 'NO TRADE'}
                        </h3>
                        {tradeRecommendation.confidence && (
                          <p style={{ fontSize: '18px', color: '#64748b', margin: '4px 0 0 0' }}>
                            Confidence: <strong>{tradeRecommendation.confidence}</strong>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {tradeRecommendation.shouldTrade ? (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                          {tradeRecommendation.pair && <div style={{ padding: '16px', background: 'white', borderRadius: '8px' }}><div style={{ fontSize: '14px', color: '#64748b' }}>Pair</div><div style={{ fontSize: '24px', fontWeight: 'bold' }}>{tradeRecommendation.pair}</div></div>}
                          {tradeRecommendation.direction && <div style={{ padding: '16px', background: 'white', borderRadius: '8px' }}><div style={{ fontSize: '14px', color: '#64748b' }}>Direction</div><div style={{ fontSize: '24px', fontWeight: 'bold', color: tradeRecommendation.direction === 'LONG' ? '#10b981' : '#ef4444' }}>{tradeRecommendation.direction}</div></div>}
                          {tradeRecommendation.entry && <div style={{ padding: '16px', background: 'white', borderRadius: '8px' }}><div style={{ fontSize: '14px', color: '#64748b' }}>Entry</div><div style={{ fontSize: '24px', fontWeight: 'bold' }}>{tradeRecommendation.entry}</div></div>}
                          {tradeRecommendation.stopLoss && <div style={{ padding: '16px', background: 'white', borderRadius: '8px' }}><div style={{ fontSize: '14px', color: '#64748b' }}>Stop Loss</div><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{tradeRecommendation.stopLoss}</div></div>}
                          {tradeRecommendation.takeProfit && <div style={{ padding: '16px', background: 'white', borderRadius: '8px' }}><div style={{ fontSize: '14px', color: '#64748b' }}>Take Profit</div><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{tradeRecommendation.takeProfit}</div></div>}
                          {tradeRecommendation.riskReward && <div style={{ padding: '16px', background: 'white', borderRadius: '8px' }}><div style={{ fontSize: '14px', color: '#64748b' }}>Risk:Reward</div><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed' }}>1:{tradeRecommendation.riskReward}</div></div>}
                        </div>
                        
                        {tradeRecommendation.reasoning && (
                          <div style={{ padding: '20px', background: 'white', borderRadius: '12px' }}>
                            <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>📋 Analysis:</h4>
                            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.8', margin: 0, fontFamily: 'inherit' }}>{tradeRecommendation.reasoning}</pre>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ padding: '20px', background: 'white', borderRadius: '12px' }}>
                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '16px', lineHeight: '1.8' }}>{tradeRecommendation.raw || tradeRecommendation.error || 'Risk:Reward ratio does not meet 1:2 minimum requirement.'}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {tradingTab === 'journal' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>📈 Trade Journal with AI</h2>
                <div style={{ marginBottom: '32px', padding: '24px', background: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ marginBottom: '24px', padding: '20px', background: '#f0f9ff', borderRadius: '12px', border: '2px dashed #3b82f6' }}>
                    <h4 style={{ fontSize: '18px', marginBottom: '12px', color: '#3b82f6' }}>🤖 AI Screenshot Analysis</h4>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <input type="file" accept="image/*" onChange={handleScreenshotUpload} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1, minWidth: '200px' }} />
                      <button onClick={analyzeScreenshot} disabled={!newTrade.screenshot || isAnalyzing} style={{ padding: '12px 24px', background: !newTrade.screenshot || isAnalyzing ? '#94a3b8' : 'linear-gradient(to right, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '8px', cursor: !newTrade.screenshot || isAnalyzing ? 'not-allowed' : 'pointer', fontWeight: '600' }}>{isAnalyzing ? '🔄 Analyzing...' : '🤖 Analyze'}</button>
                    </div>
                    {newTrade.screenshot && <div style={{ marginTop: '16px' }}><img src={newTrade.screenshot} alt="Chart" style={{ maxWidth: '300px', borderRadius: '8px', border: '2px solid #e2e8f0' }} /></div>}
                    {analysisResult && <div style={{ marginTop: '16px', padding: '16px', background: 'white', borderRadius: '8px', border: '2px solid #10b981' }}><h5 style={{ color: '#10b981', marginBottom: '8px' }}>✅ AI Analysis:</h5><pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>{analysisResult}</pre></div>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <input type="date" value={newTrade.date} onChange={(e) => setNewTrade({...newTrade, date: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="text" placeholder="Instrument" value={newTrade.instrument} onChange={(e) => setNewTrade({...newTrade, instrument: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <select value={newTrade.direction} onChange={(e) => setNewTrade({...newTrade, direction: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}><option value="long">Long</option><option value="short">Short</option></select>
                    <input type="number" step="0.01" placeholder="P&L" value={newTrade.profitLoss} onChange={(e) => setNewTrade({...newTrade, profitLoss: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <input type="text" placeholder="Strategy" value={newTrade.strategy} onChange={(e) => setNewTrade({...newTrade, strategy: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <select value={newTrade.timeframe} onChange={(e) => setNewTrade({...newTrade, timeframe: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}><option value="1M">1M</option><option value="5M">5M</option><option value="15M">15M</option><option value="1H">1H</option><option value="4H">4H</option><option value="D">Daily</option></select>
                  </div>
                  <textarea placeholder="Notes" value={newTrade.notes} onChange={(e) => setNewTrade({...newTrade, notes: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', minHeight: '80px' }} />
                  <button onClick={addTrade} style={{ padding: '12px 24px', background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Log Trade</button>
                </div>
                {trades.length === 0 ? <p style={{ color: '#64748b', textAlign: 'center', padding: '32px' }}>No trades yet</p> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {trades.map(t => (
                      <div key={t.id} style={{ padding: '20px', background: parseFloat(t.profitLoss) >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: '12px', border: `2px solid ${parseFloat(t.profitLoss) >= 0 ? '#10b981' : '#ef4444'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div><div style={{ fontSize: '20px', fontWeight: 'bold' }}>{t.instrument} • {t.direction.toUpperCase()}</div><div style={{ fontSize: '14px', color: '#64748b' }}>{new Date(t.date).toLocaleDateString()}</div></div>
                          <div style={{ fontSize: '28px', fontWeight: 'bold', color: parseFloat(t.profitLoss) >= 0 ? '#10b981' : '#ef4444' }}>{parseFloat(t.profitLoss) >= 0 ? '+' : ''}${parseFloat(t.profitLoss).toFixed(2)}</div>
                        </div>
                        {t.notes && <div style={{ fontSize: '14px', color: '#64748b', fontStyle: 'italic', marginBottom: '8px' }}>"{t.notes}"</div>}
                        {t.screenshot && <div style={{ marginTop: '12px' }}><img src={t.screenshot} alt="Trade" style={{ maxWidth: '200px', borderRadius: '8px' }} /></div>}
                        {t.aiAnalysis && <div style={{ marginTop: '12px', padding: '12px', background: 'white', borderRadius: '8px' }}><div style={{ fontSize: '12px', fontWeight: 'bold', color: '#3b82f6' }}>🤖 AI:</div><div style={{ fontSize: '13px', color: '#64748b' }}>{t.aiAnalysis}</div></div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {tradingTab === 'costs' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>💸 Trading Costs</h2>
                <div style={{ marginBottom: '32px', padding: '32px', background: '#fef2f2', borderRadius: '12px', border: '2px solid #ef4444' }}><h3>Total Monthly Costs</h3><p style={{ fontSize: '48px', fontWeight: 'bold', color: '#ef4444' }}>${monthlyCosts.toFixed(2)}</p><p>Net P&L: <span style={{ fontWeight: 'bold', color: netPL >= 0 ? '#10b981' : '#ef4444' }}>${netPL.toFixed(2)}</span></p></div>
                <div style={{ marginBottom: '32px', padding: '24px', background: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <input type="text" placeholder="Name" value={newCost.name} onChange={(e) => setNewCost({...newCost, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="number" placeholder="Cost" value={newCost.cost} onChange={(e) => setNewCost({...newCost, cost: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <select value={newCost.type} onChange={(e) => setNewCost({...newCost, type: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}><option value="subscription">Subscription</option><option value="challenge">Challenge</option><option value="software">Software</option></select>
                    <select value={newCost.frequency} onChange={(e) => setNewCost({...newCost, frequency: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
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
