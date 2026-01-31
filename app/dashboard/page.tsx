'use client'

import { useUser } from '@clerk/nextjs'
import { useState } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'path' | 'trading'>('dashboard')
  const [darkMode, setDarkMode] = useState(true)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [tradingCalendarMonth, setTradingCalendarMonth] = useState(new Date())
  
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
    accountName: 'My Forex Account',
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
  const [forexAccounts, setForexAccounts] = useState<any[]>([{...forexProp, id: 1}])
  const [selectedForexAccount, setSelectedForexAccount] = useState(1)

  // Futures Prop Calculator state
  const [futuresProp, setFuturesProp] = useState({
    accountName: 'My Futures Account',
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
  const [futuresAccounts, setFuturesAccounts] = useState<any[]>([{...futuresProp, id: 1}])
  const [selectedFuturesAccount, setSelectedFuturesAccount] = useState(1)

  // Prop firm presets
  const forexPresets = {
    'FTMO 100k': {
      accountSize: '100000',
      phase1DailyDD: '5',
      phase1MaxDD: '10',
      phase1Target: '10',
      phase1MinDays: '4',
      phase1MaxDays: '30',
      phase2DailyDD: '5',
      phase2MaxDD: '10',
      phase2Target: '5',
      phase2MinDays: '4',
      phase2MaxDays: '60',
      fundedDailyDD: '5',
      fundedMaxDD: '10',
      profitSplit: '80'
    },
    'MFF 100k': {
      accountSize: '100000',
      phase1DailyDD: '5',
      phase1MaxDD: '12',
      phase1Target: '8',
      phase1MinDays: '5',
      phase1MaxDays: '30',
      phase2DailyDD: '5',
      phase2MaxDD: '12',
      phase2Target: '5',
      phase2MinDays: '5',
      phase2MaxDays: '60',
      fundedDailyDD: '5',
      fundedMaxDD: '12',
      profitSplit: '80'
    },
    'The Funded Trader 100k': {
      accountSize: '100000',
      phase1DailyDD: '5',
      phase1MaxDD: '6',
      phase1Target: '10',
      phase1MinDays: '5',
      phase1MaxDays: '30',
      phase2DailyDD: '5',
      phase2MaxDD: '6',
      phase2Target: '5',
      phase2MinDays: '5',
      phase2MaxDays: '60',
      fundedDailyDD: '5',
      fundedMaxDD: '6',
      profitSplit: '90'
    }
  }

  const futuresPresets = {
    'Apex 50k': {
      accountSize: '50000',
      evalTrailingDD: '2500',
      evalProfitTarget: '3000',
      evalMinDays: '7',
      evalDrawdownType: 'trailing',
      paTrailingDD: '2500',
      paProfitTarget: '3000',
      paMinDays: '7',
      paDrawdownType: 'eod',
      fundedTrailingDD: '2500',
      fundedDrawdownType: 'eod',
      contractLimit: '10',
      profitSplit: '90'
    },
    'Topstep 50k': {
      accountSize: '50000',
      evalTrailingDD: '2000',
      evalProfitTarget: '3000',
      evalMinDays: '10',
      evalDrawdownType: 'trailing',
      fundedTrailingDD: '2000',
      fundedDrawdownType: 'eod',
      contractLimit: '15',
      profitSplit: '80'
    },
    'Earn2Trade 50k': {
      accountSize: '50000',
      evalTrailingDD: '3000',
      evalProfitTarget: '2500',
      evalMinDays: '15',
      evalDrawdownType: 'trailing',
      fundedTrailingDD: '3000',
      fundedDrawdownType: 'eod',
      contractLimit: '8',
      profitSplit: '80'
    }
  }

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

  // ... (all the existing helper functions remain the same until forexProp calculation)

  const calculateForexProp = () => {
    const selectedAccount = forexAccounts.find(acc => acc.id === selectedForexAccount) || forexProp
    const phase = selectedAccount.phase
    const accountSize = parseFloat(selectedAccount.accountSize || '0')
    
    // Get rules based on current phase
    let dailyDD: number, maxDD: number, profitTarget: number, minDays: number, maxDays: number
    
    if (phase === 'phase1') {
      dailyDD = parseFloat(selectedAccount.phase1DailyDD || '0') / 100
      maxDD = parseFloat(selectedAccount.phase1MaxDD || '0') / 100
      profitTarget = parseFloat(selectedAccount.phase1Target || '0') / 100
      minDays = parseInt(selectedAccount.phase1MinDays || '0')
      maxDays = parseInt(selectedAccount.phase1MaxDays || '30')
    } else if (phase === 'phase2') {
      dailyDD = parseFloat(selectedAccount.phase2DailyDD || '0') / 100
      maxDD = parseFloat(selectedAccount.phase2MaxDD || '0') / 100
      profitTarget = parseFloat(selectedAccount.phase2Target || '0') / 100
      minDays = parseInt(selectedAccount.phase2MinDays || '0')
      maxDays = parseInt(selectedAccount.phase2MaxDays || '60')
    } else {
      // Funded - no profit target or max days
      dailyDD = parseFloat(selectedAccount.fundedDailyDD || '0') / 100
      maxDD = parseFloat(selectedAccount.fundedMaxDD || '0') / 100
      profitTarget = 0
      minDays = 0
      maxDays = 999
    }
    
    const currentBalance = parseFloat(selectedAccount.currentBalance || '0')
    const tradingDays = parseInt(selectedAccount.tradingDays || '0')
    const riskPerTrade = parseFloat(selectedAccount.riskPerTrade || '0') / 100
    const tradesPerDay = parseInt(selectedAccount.tradesPerDay || '0')
    const winRate = parseFloat(selectedAccount.winRate || '0') / 100
    const avgRR = parseFloat(selectedAccount.avgRR || '0')
    const profitSplit = parseFloat(selectedAccount.profitSplit || '0') / 100

    // Key calculations
    const dailyDrawdownAmount = accountSize * dailyDD
    const maxDrawdownAmount = accountSize * maxDD
    const profitTargetAmount = accountSize * profitTarget
    const currentProfit = currentBalance - accountSize
    const profitRemaining = phase === 'funded' ? 0 : Math.max(0, profitTargetAmount - currentProfit)
    const daysRemaining = phase === 'funded' ? 999 : Math.max(0, maxDays - tradingDays)
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
    const profitProgress = phase === 'funded' ? 100 : profitTargetAmount > 0 ? Math.min(100, (currentProfit / profitTargetAmount) * 100) : 0
    const dayProgress = minDays > 0 ? Math.min(100, (tradingDays / minDays) * 100) : 100
    const onTrack = phase === 'funded' || dailyExpectedPL >= dailyProfitNeeded
    
    // Payout calculation
    const potentialPayout = phase === 'funded' ? Math.max(0, currentProfit) * profitSplit : profitTargetAmount * profitSplit
    
    // Worst case scenarios
    const consecutiveLossesToBlow = Math.floor(maxDrawdownAmount / riskPerTradeAmount)
    const consecutiveLossesTodayLimit = Math.floor(dailyDrawdownAmount / riskPerTradeAmount)

    setForexPropResults({
      accountName: selectedAccount.accountName,
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
      maxDays,
      tradingDays,
      riskPerTrade: riskPerTrade * 100,
      winRate: winRate * 100,
      avgRR,
      profitSplit: profitSplit * 100
    })
  }

  const calculateFuturesProp = () => {
    const selectedAccount = futuresAccounts.find(acc => acc.id === selectedFuturesAccount) || futuresProp
    const phase = selectedAccount.phase
    const accountSize = parseFloat(selectedAccount.accountSize || '0')
    
    // Get rules based on current phase
    let trailingDD: number, profitTarget: number, minDays: number, drawdownType: string
    
    if (phase === 'evaluation') {
      trailingDD = parseFloat(selectedAccount.evalTrailingDD || '0')
      profitTarget = parseFloat(selectedAccount.evalProfitTarget || '0')
      minDays = parseInt(selectedAccount.evalMinDays || '0')
      drawdownType = selectedAccount.evalDrawdownType
    } else if (phase === 'pa') {
      trailingDD = parseFloat(selectedAccount.paTrailingDD || '0')
      profitTarget = parseFloat(selectedAccount.paProfitTarget || '0')
      minDays = parseInt(selectedAccount.paMinDays || '0')
      drawdownType = selectedAccount.paDrawdownType
    } else {
      // Funded
      trailingDD = parseFloat(selectedAccount.fundedTrailingDD || '0')
      profitTarget = 0
      minDays = 0
      drawdownType = selectedAccount.fundedDrawdownType
    }
    
    const currentBalance = parseFloat(selectedAccount.currentBalance || '0')
    const highWaterMark = parseFloat(selectedAccount.highWaterMark || '0')
    const tradingDays = parseInt(selectedAccount.tradingDays || '0')
    const contractLimit = parseInt(selectedAccount.contractLimit || '0')
    const riskPerTrade = parseFloat(selectedAccount.riskPerTrade || '0')
    const tradesPerDay = parseInt(selectedAccount.tradesPerDay || '0')
    const winRate = parseFloat(selectedAccount.winRate || '0') / 100
    const avgWin = parseFloat(selectedAccount.avgWin || '0')
    const avgLoss = parseFloat(selectedAccount.avgLoss || '0')
    const profitSplit = parseFloat(selectedAccount.profitSplit || '0') / 100

    // Current profit calculations
    const currentProfit = currentBalance - accountSize
    const profitRemaining = phase === 'funded' ? 0 : Math.max(0, profitTarget - currentProfit)
    
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
      // EOD drawdown
      drawdownThreshold = accountSize - trailingDD
      drawdownRemaining = currentBalance - drawdownThreshold
    }
    
    // Risk analysis
    const maxLossesBeforeBlow = riskPerTrade > 0 ? Math.floor(drawdownRemaining / riskPerTrade) : 0
    
    // Expected value
    const expectancy = (winRate * avgWin) - ((1 - winRate) * avgLoss)
    const dailyExpectedPL = expectancy * tradesPerDay
    const daysToTarget = (dailyExpectedPL > 0 && phase !== 'funded') ? profitRemaining / dailyExpectedPL : 0
    
    // Progress
    const profitProgress = phase === 'funded' ? 100 : profitTarget > 0 ? Math.min(100, (currentProfit / profitTarget) * 100) : 0
    const dayProgress = minDays > 0 ? Math.min(100, (tradingDays / minDays) * 100) : 100
    
    // Payout
    const potentialPayout = phase === 'funded' ? Math.max(0, currentProfit) * profitSplit : profitTarget * profitSplit
    
    // Check if trailing has locked to break-even
    const lockedAtBreakeven = highWaterMark >= accountSize + trailingDD
    
    // Safety margin
    const safetyMargin = riskPerTrade > 0 ? (drawdownRemaining / riskPerTrade).toFixed(1) : '0'

    setFuturesPropResults({
      accountName: selectedAccount.accountName,
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
      riskPerTrade,
      highWaterMark,
      tradingDays
    })
  }

  // Save/Load forex accounts
  const saveForexAccount = () => {
    const newAccount = {
      ...forexProp,
      id: Date.now(),
      accountName: forexProp.accountName || `Forex Account ${forexAccounts.length + 1}`
    }
    setForexAccounts([...forexAccounts, newAccount])
    setSelectedForexAccount(newAccount.id)
  }

  const deleteForexAccount = (id: number) => {
    const newAccounts = forexAccounts.filter(acc => acc.id !== id)
    setForexAccounts(newAccounts)
    if (selectedForexAccount === id && newAccounts.length > 0) {
      setSelectedForexAccount(newAccounts[0].id)
    }
  }

  const loadForexAccount = (account: any) => {
    setForexProp(account)
    setSelectedForexAccount(account.id)
  }

  const applyForexPreset = (presetName: string) => {
    const preset = forexPresets[presetName as keyof typeof forexPresets]
    setForexProp({
      ...forexProp,
      ...preset,
      accountName: presetName
    })
  }

  // Save/Load futures accounts
  const saveFuturesAccount = () => {
    const newAccount = {
      ...futuresProp,
      id: Date.now(),
      accountName: futuresProp.accountName || `Futures Account ${futuresAccounts.length + 1}`
    }
    setFuturesAccounts([...futuresAccounts, newAccount])
    setSelectedFuturesAccount(newAccount.id)
  }

  const deleteFuturesAccount = (id: number) => {
    const newAccounts = futuresAccounts.filter(acc => acc.id !== id)
    setFuturesAccounts(newAccounts)
    if (selectedFuturesAccount === id && newAccounts.length > 0) {
      setSelectedFuturesAccount(newAccounts[0].id)
    }
  }

  const loadFuturesAccount = (account: any) => {
    setFuturesProp(account)
    setSelectedFuturesAccount(account.id)
  }

  const applyFuturesPreset = (presetName: string) => {
    const preset = futuresPresets[presetName as keyof typeof futuresPresets]
    setFuturesProp({
      ...futuresProp,
      ...preset,
      accountName: presetName
    })
  }

  // ... (rest of the existing code remains the same)

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
            {/* ... dashboard content remains the same ... */}
          </div>
        )}

        {activeTab === 'trading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Forex/CFD Prop Calculator */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.accent, fontSize: '22px' }}>💱 Forex/CFD Prop Firm Calculator</h2>
              
              <div style={{ marginBottom: '20px', padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: theme.text, fontSize: '18px' }}>Account Management</h3>
                  <button onClick={saveForexAccount} style={{ ...btnPrimary, padding: '8px 16px', fontSize: '13px' }}>+ Save Account</button>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {forexAccounts.map(account => (
                    <button
                      key={account.id}
                      onClick={() => loadForexAccount(account)}
                      style={{
                        padding: '8px 16px',
                        background: selectedForexAccount === account.id ? theme.accent : (darkMode ? '#334155' : '#e2e8f0'),
                        color: selectedForexAccount === account.id ? 'white' : theme.text,
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {account.accountName}
                      {forexAccounts.length > 1 && (
                        <span 
                          onClick={(e) => { e.stopPropagation(); deleteForexAccount(account.id); }}
                          style={{ marginLeft: '4px', color: selectedForexAccount === account.id ? '#fff' : theme.danger }}
                        >
                          ✕
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: theme.textMuted, fontSize: '14px' }}>Quick Presets</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Object.keys(forexPresets).map(preset => (
                      <button
                        key={preset}
                        onClick={() => applyForexPreset(preset)}
                        style={{
                          padding: '6px 12px',
                          background: darkMode ? '#334155' : '#e2e8f0',
                          color: theme.text,
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>Account Details</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Account Name</label>
                      <input type="text" value={forexProp.accountName} onChange={(e) => setForexProp({...forexProp, accountName: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Account Size ($)</label>
                      <input type="number" value={forexProp.accountSize} onChange={(e) => setForexProp({...forexProp, accountSize: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Current Phase</label>
                      <select value={forexProp.phase} onChange={(e) => setForexProp({...forexProp, phase: e.target.value})} style={{ ...inputStyle, width: '100%' }}>
                        <option value="phase1">Phase 1</option>
                        <option value="phase2">Phase 2</option>
                        <option value="funded">Funded</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Current Balance ($)</label>
                      <input type="number" value={forexProp.currentBalance} onChange={(e) => setForexProp({...forexProp, currentBalance: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Trading Days</label>
                      <input type="number" value={forexProp.tradingDays} onChange={(e) => setForexProp({...forexProp, tradingDays: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>Phase Rules</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ padding: '12px', background: forexProp.phase === 'phase1' ? (darkMode ? '#1e3a5f' : '#eff6ff') : (darkMode ? '#334155' : '#f8fafc'), borderRadius: '8px' }}>
                      <div style={{ color: theme.accent, fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Phase 1 Rules</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                        <div>
                          <label style={{ color: theme.textMuted }}>Daily DD (%)</label>
                          <input type="number" step="0.1" value={forexProp.phase1DailyDD} onChange={(e) => setForexProp({...forexProp, phase1DailyDD: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted }}>Max DD (%)</label>
                          <input type="number" step="0.1" value={forexProp.phase1MaxDD} onChange={(e) => setForexProp({...forexProp, phase1MaxDD: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted }}>Target (%)</label>
                          <input type="number" step="0.1" value={forexProp.phase1Target} onChange={(e) => setForexProp({...forexProp, phase1Target: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted }}>Min Days</label>
                          <input type="number" value={forexProp.phase1MinDays} onChange={(e) => setForexProp({...forexProp, phase1MinDays: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '12px', background: forexProp.phase === 'phase2' ? (darkMode ? '#1e3a5f' : '#eff6ff') : (darkMode ? '#334155' : '#f8fafc'), borderRadius: '8px' }}>
                      <div style={{ color: theme.purple, fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Phase 2 Rules</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                        <div>
                          <label style={{ color: theme.textMuted }}>Daily DD (%)</label>
                          <input type="number" step="0.1" value={forexProp.phase2DailyDD} onChange={(e) => setForexProp({...forexProp, phase2DailyDD: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted }}>Max DD (%)</label>
                          <input type="number" step="0.1" value={forexProp.phase2MaxDD} onChange={(e) => setForexProp({...forexProp, phase2MaxDD: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted }}>Target (%)</label>
                          <input type="number" step="0.1" value={forexProp.phase2Target} onChange={(e) => setForexProp({...forexProp, phase2Target: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted }}>Min Days</label>
                          <input type="number" value={forexProp.phase2MinDays} onChange={(e) => setForexProp({...forexProp, phase2MinDays: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '12px', background: forexProp.phase === 'funded' ? (darkMode ? '#1e3a5f' : '#eff6ff') : (darkMode ? '#334155' : '#f8fafc'), borderRadius: '8px' }}>
                      <div style={{ color: theme.success, fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Funded Rules</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                        <div>
                          <label style={{ color: theme.textMuted }}>Daily DD (%)</label>
                          <input type="number" step="0.1" value={forexProp.fundedDailyDD} onChange={(e) => setForexProp({...forexProp, fundedDailyDD: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted }}>Max DD (%)</label>
                          <input type="number" step="0.1" value={forexProp.fundedMaxDD} onChange={(e) => setForexProp({...forexProp, fundedMaxDD: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ color: theme.textMuted }}>Profit Split (%)</label>
                          <input type="number" value={forexProp.profitSplit} onChange={(e) => setForexProp({...forexProp, profitSplit: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>Trading Plan</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Risk Per Trade (%)</label>
                      <input type="number" step="0.1" value={forexProp.riskPerTrade} onChange={(e) => setForexProp({...forexProp, riskPerTrade: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Trades Per Day</label>
                      <input type="number" value={forexProp.tradesPerDay} onChange={(e) => setForexProp({...forexProp, tradesPerDay: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Win Rate (%)</label>
                      <input type="number" step="0.1" value={forexProp.winRate} onChange={(e) => setForexProp({...forexProp, winRate: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Average R:R</label>
                      <input type="number" step="0.1" value={forexProp.avgRR} onChange={(e) => setForexProp({...forexProp, avgRR: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>
              
              <button onClick={calculateForexProp} style={{ ...btnPrimary, padding: '12px 24px', fontSize: '16px', width: '100%', marginBottom: '20px' }}>Calculate Forex Prop</button>
              
              {forexPropResults && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '20px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Profit Progress</div>
                      <div style={{ color: theme.success, fontSize: '24px', fontWeight: 'bold' }}>{forexPropResults.profitProgress.toFixed(1)}%</div>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>${forexPropResults.currentProfit.toFixed(0)} / ${forexPropResults.profitTargetAmount.toFixed(0)}</div>
                    </div>
                    <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Drawdown Remaining</div>
                      <div style={{ color: theme.danger, fontSize: '24px', fontWeight: 'bold' }}>${forexPropResults.drawdownRemaining.toFixed(0)}</div>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>{((forexPropResults.drawdownRemaining / forexPropResults.maxDrawdownAmount) * 100).toFixed(1)}% left</div>
                    </div>
                    <div style={{ padding: '20px', background: darkMode ? '#3a2e1e' : '#fffbeb', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Days Remaining</div>
                      <div style={{ color: theme.warning, fontSize: '24px', fontWeight: 'bold' }}>{forexPropResults.daysRemaining}</div>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>Day {forexPropResults.tradingDays} of {forexPropResults.maxDays}</div>
                    </div>
                    <div style={{ padding: '20px', background: darkMode ? '#2d1e3a' : '#faf5ff', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Potential Payout</div>
                      <div style={{ color: theme.purple, fontSize: '24px', fontWeight: 'bold' }}>${forexPropResults.potentialPayout.toFixed(0)}</div>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>{forexPropResults.profitSplit}% split</div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '16px' }}>📊 Daily Targets & Risk Analysis</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      <div style={{ padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
                        <div style={{ color: theme.accent, fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Daily Targets</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                          <div>
                            <div style={{ color: theme.textMuted }}>Needed Daily</div>
                            <div style={{ color: theme.warning, fontWeight: 600 }}>${forexPropResults.dailyProfitNeeded.toFixed(2)}</div>
                            <div style={{ color: theme.textMuted, fontSize: '10px' }}>{forexPropResults.dailyProfitPercent.toFixed(2)}%</div>
                          </div>
                          <div>
                            <div style={{ color: theme.textMuted }}>Expected Daily</div>
                            <div style={{ color: forexPropResults.dailyExpectedPL >= forexPropResults.dailyProfitNeeded ? theme.success : theme.danger, fontWeight: 600 }}>${forexPropResults.dailyExpectedPL.toFixed(2)}</div>
                            <div style={{ color: theme.textMuted, fontSize: '10px' }}>{forexPropResults.onTrack ? 'On Track ✓' : 'Behind Schedule'}</div>
                          </div>
                          <div>
                            <div style={{ color: theme.textMuted }}>Days to Target</div>
                            <div style={{ color: theme.text, fontWeight: 600 }}>{forexPropResults.daysToTarget} days</div>
                          </div>
                          <div>
                            <div style={{ color: theme.textMuted }}>Risk Per Trade</div>
                            <div style={{ color: theme.danger, fontWeight: 600 }}>${forexPropResults.riskPerTradeAmount.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
                        <div style={{ color: theme.danger, fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Risk Limits</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                          <div>
                            <div style={{ color: theme.textMuted }}>Max Losses Today</div>
                            <div style={{ color: theme.danger, fontWeight: 600 }}>{forexPropResults.consecutiveLossesTodayLimit}</div>
                            <div style={{ color: theme.textMuted, fontSize: '10px' }}>before daily DD</div>
                          </div>
                          <div>
                            <div style={{ color: theme.textMuted }}>Max Losses Total</div>
                            <div style={{ color: theme.danger, fontWeight: 600 }}>{forexPropResults.consecutiveLossesToBlow}</div>
                            <div style={{ color: theme.textMuted, fontSize: '10px' }}>before blowing</div>
                          </div>
                          <div>
                            <div style={{ color: theme.textMuted }}>Max DD Today</div>
                            <div style={{ color: theme.danger, fontWeight: 600 }}>${forexPropResults.dailyDrawdownAmount.toFixed(0)}</div>
                          </div>
                          <div>
                            <div style={{ color: theme.textMuted }}>Max DD Total</div>
                            <div style={{ color: theme.danger, fontWeight: 600 }}>${forexPropResults.maxDrawdownAmount.toFixed(0)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '16px' }}>🎯 Progress Bars</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ color: theme.textMuted, fontSize: '12px' }}>Profit Target</span>
                          <span style={{ color: theme.success, fontSize: '12px', fontWeight: 600 }}>{forexPropResults.profitProgress.toFixed(1)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '10px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                          <div style={{ width: `${forexPropResults.profitProgress}%`, height: '100%', background: 'linear-gradient(to right, #10b981, #059669)' }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ color: theme.textMuted, fontSize: '12px' }}>Minimum Days</span>
                          <span style={{ color: theme.warning, fontSize: '12px', fontWeight: 600 }}>{forexPropResults.dayProgress.toFixed(1)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '10px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                          <div style={{ width: `${forexPropResults.dayProgress}%`, height: '100%', background: 'linear-gradient(to right, #f59e0b, #d97706)' }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ color: theme.textMuted, fontSize: '12px' }}>Drawdown Used</span>
                          <span style={{ color: theme.danger, fontSize: '12px', fontWeight: 600 }}>${forexPropResults.drawdownUsed.toFixed(0)} / ${forexPropResults.maxDrawdownAmount.toFixed(0)}</span>
                        </div>
                        <div style={{ width: '100%', height: '10px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                          <div style={{ width: `${(forexPropResults.drawdownUsed / forexPropResults.maxDrawdownAmount) * 100}%`, height: '100%', background: 'linear-gradient(to right, #ef4444, #dc2626)' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Futures Prop Calculator */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.success, fontSize: '22px' }}>📊 Futures Prop Firm Calculator</h2>
              
              <div style={{ marginBottom: '20px', padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: theme.text, fontSize: '18px' }}>Account Management</h3>
                  <button onClick={saveFuturesAccount} style={{ ...btnSuccess, padding: '8px 16px', fontSize: '13px' }}>+ Save Account</button>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {futuresAccounts.map(account => (
                    <button
                      key={account.id}
                      onClick={() => loadFuturesAccount(account)}
                      style={{
                        padding: '8px 16px',
                        background: selectedFuturesAccount === account.id ? theme.success : (darkMode ? '#334155' : '#e2e8f0'),
                        color: selectedFuturesAccount === account.id ? 'white' : theme.text,
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {account.accountName}
                      {futuresAccounts.length > 1 && (
                        <span 
                          onClick={(e) => { e.stopPropagation(); deleteFuturesAccount(account.id); }}
                          style={{ marginLeft: '4px', color: selectedFuturesAccount === account.id ? '#fff' : theme.danger }}
                        >
                          ✕
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: theme.textMuted, fontSize: '14px' }}>Quick Presets</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Object.keys(futuresPresets).map(preset => (
                      <button
                        key={preset}
                        onClick={() => applyFuturesPreset(preset)}
                        style={{
                          padding: '6px 12px',
                          background: darkMode ? '#334155' : '#e2e8f0',
                          color: theme.text,
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>Account Details</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Account Name</label>
                      <input type="text" value={futuresProp.accountName} onChange={(e) => setFuturesProp({...futuresProp, accountName: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Account Size ($)</label>
                      <input type="number" value={futuresProp.accountSize} onChange={(e) => setFuturesProp({...futuresProp, accountSize: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Current Phase</label>
                      <select value={futuresProp.phase} onChange={(e) => setFuturesProp({...futuresProp, phase: e.target.value})} style={{ ...inputStyle, width: '100%' }}>
                        <option value="evaluation">Evaluation</option>
                        <option value="pa">PA (Performance)</option>
                        <option value="funded">Funded</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Current Balance ($)</label>
                      <input type="number" value={futuresProp.currentBalance} onChange={(e) => setFuturesProp({...futuresProp, currentBalance: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>High Water Mark ($)</label>
                      <input type="number" value={futuresProp.highWaterMark} onChange={(e) => setFuturesProp({...futuresProp, highWaterMark: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Trading Days</label>
                      <input type="number" value={futuresProp.tradingDays} onChange={(e) => setFuturesProp({...futuresProp, tradingDays: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>Phase Rules</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ padding: '12px', background: futuresProp.phase === 'evaluation' ? (darkMode ? '#1e3a5f' : '#eff6ff') : (darkMode ? '#334155' : '#f8fafc'), borderRadius: '8px' }}>
                      <div style={{ color: theme.accent, fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Evaluation Rules</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                        <div>
                          <label style={{ color: theme.textMuted }}>Trailing DD ($)</label>
                          <input type="number" value={futuresProp.evalTrailingDD} onChange={(e) => setFuturesProp({...futuresProp, evalTrailingDD: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted }}>Profit Target ($)</label>
                          <input type="number" value={futuresProp.evalProfitTarget} onChange={(e) => setFuturesProp({...futuresProp, evalProfitTarget: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted }}>Min Days</label>
                          <input type="number" value={futuresProp.evalMinDays} onChange={(e) => setFuturesProp({...futuresProp, evalMinDays: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted }}>Drawdown Type</label>
                          <select value={futuresProp.evalDrawdownType} onChange={(e) => setFuturesProp({...futuresProp, evalDrawdownType: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }}>
                            <option value="trailing">Trailing</option>
                            <option value="eod">EOD</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '12px', background: futuresProp.phase === 'pa' ? (darkMode ? '#1e3a5f' : '#eff6ff') : (darkMode ? '#334155' : '#f8fafc'), borderRadius: '8px' }}>
                      <div style={{ color: theme.purple, fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>PA (Performance) Rules</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                        <div>
                          <label style={{ color: theme.textMuted }}>Trailing DD ($)</label>
                          <input type="number" value={futuresProp.paTrailingDD} onChange={(e) => setFuturesProp({...futuresProp, paTrailingDD: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted }}>Profit Target ($)</label>
                          <input type="number" value={futuresProp.paProfitTarget} onChange={(e) => setFuturesProp({...futuresProp, paProfitTarget: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted }}>Min Days</label>
                          <input type="number" value={futuresProp.paMinDays} onChange={(e) => setFuturesProp({...futuresProp, paMinDays: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted }}>Drawdown Type</label>
                          <select value={futuresProp.paDrawdownType} onChange={(e) => setFuturesProp({...futuresProp, paDrawdownType: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }}>
                            <option value="trailing">Trailing</option>
                            <option value="eod">EOD</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '12px', background: futuresProp.phase === 'funded' ? (darkMode ? '#1e3a5f' : '#eff6ff') : (darkMode ? '#334155' : '#f8fafc'), borderRadius: '8px' }}>
                      <div style={{ color: theme.success, fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Funded Rules</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                        <div>
                          <label style={{ color: theme.textMuted }}>Trailing DD ($)</label>
                          <input type="number" value={futuresProp.fundedTrailingDD} onChange={(e) => setFuturesProp({...futuresProp, fundedTrailingDD: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted }}>Drawdown Type</label>
                          <select value={futuresProp.fundedDrawdownType} onChange={(e) => setFuturesProp({...futuresProp, fundedDrawdownType: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }}>
                            <option value="trailing">Trailing</option>
                            <option value="eod">EOD</option>
                          </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ color: theme.textMuted }}>Profit Split (%)</label>
                          <input type="number" value={futuresProp.profitSplit} onChange={(e) => setFuturesProp({...futuresProp, profitSplit: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ color: theme.textMuted }}>Contract Limit</label>
                          <input type="number" value={futuresProp.contractLimit} onChange={(e) => setFuturesProp({...futuresProp, contractLimit: e.target.value})} style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>Trading Plan</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Risk Per Trade ($)</label>
                      <input type="number" value={futuresProp.riskPerTrade} onChange={(e) => setFuturesProp({...futuresProp, riskPerTrade: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Trades Per Day</label>
                      <input type="number" value={futuresProp.tradesPerDay} onChange={(e) => setFuturesProp({...futuresProp, tradesPerDay: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Win Rate (%)</label>
                      <input type="number" step="0.1" value={futuresProp.winRate} onChange={(e) => setFuturesProp({...futuresProp, winRate: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Avg Win ($)</label>
                      <input type="number" value={futuresProp.avgWin} onChange={(e) => setFuturesProp({...futuresProp, avgWin: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Avg Loss ($)</label>
                      <input type="number" value={futuresProp.avgLoss} onChange={(e) => setFuturesProp({...futuresProp, avgLoss: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>
              
              <button onClick={calculateFuturesProp} style={{ ...btnSuccess, padding: '12px 24px', fontSize: '16px', width: '100%', marginBottom: '20px' }}>Calculate Futures Prop</button>
              
              {futuresPropResults && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '20px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Profit Progress</div>
                      <div style={{ color: theme.success, fontSize: '24px', fontWeight: 'bold' }}>{futuresPropResults.profitProgress.toFixed(1)}%</div>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>${futuresPropResults.currentProfit.toFixed(0)} / ${futuresPropResults.profitTarget.toFixed(0)}</div>
                    </div>
                    <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Drawdown Remaining</div>
                      <div style={{ color: theme.danger, fontSize: '24px', fontWeight: 'bold' }}>${futuresPropResults.drawdownRemaining.toFixed(0)}</div>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>Threshold: ${futuresPropResults.drawdownThreshold.toFixed(0)}</div>
                    </div>
                    <div style={{ padding: '20px', background: darkMode ? '#3a2e1e' : '#fffbeb', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Safety Margin</div>
                      <div style={{ color: theme.warning, fontSize: '24px', fontWeight: 'bold' }}>{futuresPropResults.safetyMargin}R</div>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>{futuresPropResults.maxLossesBeforeBlow} trades</div>
                    </div>
                    <div style={{ padding: '20px', background: darkMode ? '#2d1e3a' : '#faf5ff', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Potential Payout</div>
                      <div style={{ color: theme.purple, fontSize: '24px', fontWeight: 'bold' }}>${futuresPropResults.potentialPayout.toFixed(0)}</div>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>{futuresPropResults.profitSplit}% split</div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '16px' }}>📊 Drawdown Visualization</h3>
                    <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>Starting Balance</div>
                          <div style={{ color: theme.text, fontSize: '14px', fontWeight: 600 }}>${futuresPropResults.accountSize.toFixed(0)}</div>
                        </div>
                        <div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>Current Balance</div>
                          <div style={{ color: theme.success, fontSize: '14px', fontWeight: 600 }}>${futuresPropResults.currentBalance.toFixed(0)}</div>
                        </div>
                        <div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>High Water Mark</div>
                          <div style={{ color: theme.accent, fontSize: '14px', fontWeight: 600 }}>${futuresPropResults.highWaterMark.toFixed(0)}</div>
                        </div>
                        {futuresPropResults.phase !== 'funded' && (
                          <div>
                            <div style={{ color: theme.textMuted, fontSize: '11px' }}>Profit Target</div>
                            <div style={{ color: theme.warning, fontSize: '14px', fontWeight: 600 }}>${futuresPropResults.profitTarget.toFixed(0)}</div>
                          </div>
                        )}
                      </div>
                      
                      {/* Drawdown bar visualization */}
                      <div style={{ position: 'relative', height: '40px', marginBottom: '20px' }}>
                        {/* Background line */}
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '4px', background: darkMode ? '#475569' : '#cbd5e1', transform: 'translateY(-50%)', borderRadius: '2px' }} />
                        
                        {/* Account size marker */}
                        <div style={{ position: 'absolute', left: '0%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: theme.text, marginBottom: '4px' }} />
                          <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: theme.textMuted, whiteSpace: 'nowrap' }}>Start</div>
                        </div>
                        
                        {/* Drawdown threshold */}
                        <div style={{ position: 'absolute', left: `${(futuresPropResults.drawdownThreshold / futuresPropResults.accountSize) * 100}%`, top: '50%', transform: 'translate(-50%, -50%)' }}>
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: theme.danger }} />
                          <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: theme.danger, whiteSpace: 'nowrap' }}>Threshold</div>
                        </div>
                        
                        {/* Current balance marker */}
                        <div style={{ position: 'absolute', left: `${(futuresPropResults.currentBalance / futuresPropResults.accountSize) * 100}%`, top: '50%', transform: 'translate(-50%, -50%)' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: theme.success, border: '2px solid ' + theme.cardBg }} />
                          <div style={{ position: 'absolute', top: '25px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: theme.success, whiteSpace: 'nowrap', fontWeight: 600 }}>Current</div>
                        </div>
                        
                        {/* High water mark */}
                        <div style={{ position: 'absolute', left: `${(futuresPropResults.highWaterMark / futuresPropResults.accountSize) * 100}%`, top: '50%', transform: 'translate(-50%, -50%)' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: theme.accent }} />
                          <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: theme.accent, whiteSpace: 'nowrap' }}>High</div>
                        </div>
                        
                        {/* Profit target (if applicable) */}
                        {futuresPropResults.phase !== 'funded' && (
                          <div style={{ position: 'absolute', left: `${((futuresPropResults.accountSize + futuresPropResults.profitTarget) / futuresPropResults.accountSize) * 100}%`, top: '50%', transform: 'translate(-50%, -50%)' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: theme.warning }} />
                            <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: theme.warning, whiteSpace: 'nowrap' }}>Target</div>
                          </div>
                        )}
                      </div>
                      
                      {futuresPropResults.lockedAtBreakeven && (
                        <div style={{ padding: '8px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '6px', textAlign: 'center', marginBottom: '12px' }}>
                          <div style={{ color: theme.success, fontSize: '12px', fontWeight: 600 }}>✅ Drawdown locked at break-even!</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
                      <div style={{ color: theme.accent, fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Daily Targets</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                        <div>
                          <div style={{ color: theme.textMuted }}>Profit Remaining</div>
                          <div style={{ color: theme.warning, fontWeight: 600 }}>${futuresPropResults.profitRemaining.toFixed(2)}</div>
                        </div>
                        <div>
                          <div style={{ color: theme.textMuted }}>Expected Daily P&L</div>
                          <div style={{ color: theme.success, fontWeight: 600 }}>${futuresPropResults.dailyExpectedPL.toFixed(2)}</div>
                        </div>
                        <div>
                          <div style={{ color: theme.textMuted }}>Days to Target</div>
                          <div style={{ color: theme.text, fontWeight: 600 }}>{futuresPropResults.daysToTarget} days</div>
                        </div>
                        <div>
                          <div style={{ color: theme.textMuted }}>Trades to Blow</div>
                          <div style={{ color: theme.danger, fontWeight: 600 }}>{futuresPropResults.maxLossesBeforeBlow}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
                      <div style={{ color: theme.purple, fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Progress</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                        <div>
                          <div style={{ color: theme.textMuted }}>Minimum Days</div>
                          <div style={{ color: futuresPropResults.minDaysComplete ? theme.success : theme.warning, fontWeight: 600 }}>{futuresPropResults.tradingDays}/{futuresPropResults.minDays}</div>
                          <div style={{ color: theme.textMuted, fontSize: '10px' }}>{futuresPropResults.minDaysComplete ? 'Complete ✓' : 'In Progress'}</div>
                        </div>
                        <div>
                          <div style={{ color: theme.textMuted }}>Contract Limit</div>
                          <div style={{ color: theme.text, fontWeight: 600 }}>{futuresPropResults.contractLimit}</div>
                        </div>
                        <div>
                          <div style={{ color: theme.textMuted }}>Drawdown Type</div>
                          <div style={{ color: theme.text, fontWeight: 600, textTransform: 'capitalize' }}>{futuresPropResults.drawdownType}</div>
                        </div>
                        <div>
                          <div style={{ color: theme.textMuted }}>Trade Expectancy</div>
                          <div style={{ color: futuresPropResults.expectancy >= 0 ? theme.success : theme.danger, fontWeight: 600 }}>${futuresPropResults.expectancy.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* ... rest of the trading tab content (Trading Compounding Calculator, Trading Calendar, etc.) remains the same ... */}
          </div>
        )}
      </main>
    </div>
  )
}
