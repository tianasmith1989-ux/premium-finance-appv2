'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect, useCallback, useMemo } from 'react'

// Interfaces for type safety
interface CalendarItem {
  type: 'trade' | 'milestone' | 'warning' | 'success';
  title: string;
  profitLoss?: number;
  trades?: number;
  balance?: number;
  description?: string;
}

interface DailyEntry {
  date: string;
  balance: number;
  profitLoss: number;
  trades: number;
  notes: string;
  highWaterMark: number;
  drawdownUsed: number;
}

interface ForexAccount {
  id: number;
  accountName: string;
  phase: 'phase1' | 'phase2' | 'funded';
  accountSize: string;
  phase1DailyDD: string;
  phase1MaxDD: string;
  phase1Target: string;
  phase1MinDays: string;
  phase1MaxDays: string;
  phase2DailyDD: string;
  phase2MaxDD: string;
  phase2Target: string;
  phase2MinDays: string;
  phase2MaxDays: string;
  fundedDailyDD: string;
  fundedMaxDD: string;
  currentBalance: string;
  tradingDays: string;
  startDate: string;
  riskPerTrade: string;
  tradesPerDay: string;
  winRate: string;
  avgRR: string;
  profitSplit: string;
}

interface FuturesAccount {
  id: number;
  accountName: string;
  phase: 'evaluation' | 'pa' | 'funded';
  accountSize: string;
  evalTrailingDD: string;
  evalProfitTarget: string;
  evalMinDays: string;
  evalDrawdownType: 'trailing' | 'eod';
  paTrailingDD: string;
  paProfitTarget: string;
  paMinDays: string;
  paDrawdownType: 'trailing' | 'eod';
  fundedTrailingDD: string;
  fundedDrawdownType: 'trailing' | 'eod';
  currentBalance: string;
  highWaterMark: string;
  tradingDays: string;
  startDate: string;
  contractLimit: string;
  riskPerTrade: string;
  tradesPerDay: string;
  winRate: string;
  avgWin: string;
  avgLoss: string;
  profitSplit: string;
}

// Helper functions
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const validateDate = (dateStr: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr).getTime());
};

export default function Dashboard() {
  const { user } = useUser()
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'path' | 'trading'>('dashboard')
  const [darkMode, setDarkMode] = useState(true)
  
  // Trading related state
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD')
  const [marketStatus, setMarketStatus] = useState({
    forex: 'OPEN',
    futures: 'OPEN',
    crypto: '24/7'
  })
  
  // Trading journal entries
  const [journalEntries, setJournalEntries] = useState<any[]>([
    {
      id: 1,
      date: '2024-01-15',
      symbol: 'EURUSD',
      direction: 'BUY',
      entry: 1.0950,
      exit: 1.0985,
      pips: 35,
      profit: 350,
      notes: 'Strong bullish trend continuation'
    },
    {
      id: 2,
      date: '2024-01-16',
      symbol: 'GBPUSD',
      direction: 'SELL',
      entry: 1.2750,
      exit: 1.2720,
      pips: 30,
      profit: 300,
      notes: 'Resistance hold play'
    }
  ])
  
  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalTrades: 150,
    winRate: 62,
    avgWin: 450,
    avgLoss: -280,
    profitFactor: 2.1,
    totalProfit: 15250,
    maxDrawdown: -1250,
    riskRewardRatio: 1.8
  })
  
  // Trading goals
  const [tradingGoals, setTradingGoals] = useState([
    { id: 1, goal: 'Reach $25k profit', target: 25000, current: 15250, deadline: '2024-06-30' },
    { id: 2, goal: 'Achieve 65% win rate', target: 65, current: 62, deadline: '2024-03-31' },
    { id: 3, goal: 'Complete prop firm challenge', target: 100, current: 45, deadline: '2024-02-28' }
  ])
  
  // Watchlist
  const [watchlist, setWatchlist] = useState([
    { symbol: 'EURUSD', price: 1.0950, change: 0.25, trend: 'up' },
    { symbol: 'GBPUSD', price: 1.2720, change: -0.15, trend: 'down' },
    { symbol: 'XAUUSD', price: 2025.50, change: 8.75, trend: 'up' },
    { symbol: 'BTCUSD', price: 42500, change: 1250, trend: 'up' },
    { symbol: 'ES', price: 4850.25, change: 12.50, trend: 'up' }
  ])

  // Theme configuration
  const theme = useMemo(() => ({
    bg: darkMode ? '#0f172a' : '#ffffff',
    text: darkMode ? '#f8fafc' : '#0f172a',
    textMuted: darkMode ? '#94a3b8' : '#64748b',
    accent: darkMode ? '#3b82f6' : '#1d4ed8',
    success: darkMode ? '#10b981' : '#059669',
    danger: darkMode ? '#ef4444' : '#dc2626',
    warning: darkMode ? '#f59e0b' : '#d97706',
    border: darkMode ? '#334155' : '#e2e8f0',
    cardBg: darkMode ? '#1e293b' : '#f8fafc',
    weekendBg: darkMode ? '#2d3748' : '#f1f5f9',
    todayBg: darkMode ? '#1e3a5f' : '#eff6ff'
  }), [darkMode])

  // Component styles
  const cardStyle: React.CSSProperties = useMemo(() => ({
    background: theme.cardBg,
    borderRadius: '16px',
    padding: '24px',
    border: `1px solid ${theme.border}`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  }), [theme])

  const btnPrimary: React.CSSProperties = useMemo(() => ({
    background: theme.accent,
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s ease'
  }), [theme])

  const btnSuccess: React.CSSProperties = useMemo(() => ({
    background: theme.success,
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s ease'
  }), [theme])

  const btnSecondary: React.CSSProperties = useMemo(() => ({
    background: 'transparent',
    color: theme.text,
    border: `1px solid ${theme.border}`,
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s ease'
  }), [theme, darkMode])

  // Forex/CFD Prop Calculator state
  const [forexProp, setForexProp] = useState<ForexAccount>({
    id: 1,
    accountName: 'My Forex Account',
    phase: 'phase1',
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
    currentBalance: '100000',
    tradingDays: '0',
    startDate: formatDate(new Date()),
    riskPerTrade: '1',
    tradesPerDay: '2',
    winRate: '55',
    avgRR: '1.5',
    profitSplit: '80'
  })
  const [forexPropResults, setForexPropResults] = useState<any>(null)
  const [forexAccounts, setForexAccounts] = useState<ForexAccount[]>([{...forexProp, id: 1}])
  const [selectedForexAccount, setSelectedForexAccount] = useState(1)
  const [forexCalendarMonth, setForexCalendarMonth] = useState(new Date())
  const [forexDailyEntries, setForexDailyEntries] = useState<DailyEntry[]>([])

  // Futures Prop Calculator state
  const [futuresProp, setFuturesProp] = useState<FuturesAccount>({
    id: 1,
    accountName: 'My Futures Account',
    phase: 'evaluation',
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
    currentBalance: '50000',
    highWaterMark: '50000',
    tradingDays: '0',
    startDate: formatDate(new Date()),
    contractLimit: '10',
    riskPerTrade: '200',
    tradesPerDay: '3',
    winRate: '50',
    avgWin: '300',
    avgLoss: '200',
    profitSplit: '90'
  })
  const [futuresPropResults, setFuturesPropResults] = useState<any>(null)
  const [futuresAccounts, setFuturesAccounts] = useState<FuturesAccount[]>([{...futuresProp, id: 1}])
  const [selectedFuturesAccount, setSelectedFuturesAccount] = useState(1)
  const [futuresCalendarMonth, setFuturesCalendarMonth] = useState(new Date())
  const [futuresDailyEntries, setFuturesDailyEntries] = useState<DailyEntry[]>([])

  // Other trading calculators state
  const [riskCalculator, setRiskCalculator] = useState({
    accountSize: '10000',
    riskPercent: '1',
    stopLossPips: '20',
    positionSize: '0.50',
    pipValue: '10',
    riskAmount: '100'
  })

  const [tradePlanner, setTradePlanner] = useState({
    entryPrice: '1.0950',
    stopLoss: '1.0930',
    takeProfit1: '1.0970',
    takeProfit2: '1.0990',
    positionSize: '0.50',
    riskAmount: '100',
    potentialProfit: '200'
  })

  const [economicCalendar, setEconomicCalendar] = useState([
    { id: 1, date: '2024-01-15', time: '13:30', country: 'US', event: 'CPI Data', impact: 'high' },
    { id: 2, date: '2024-01-16', time: '09:00', country: 'UK', event: 'Employment Data', impact: 'medium' },
    { id: 3, date: '2024-01-17', time: '15:00', country: 'EU', event: 'ECB Statement', impact: 'high' }
  ])

  // Trading psychology state
  const [tradingPsychology, setTradingPsychology] = useState({
    emotionalState: 'calm',
    disciplineScore: 85,
    confidenceLevel: 75,
    recentMistakes: ['Overtrading', 'Moving stop loss'],
    dailyAffirmations: ['I am a disciplined trader', 'I follow my trading plan']
  })

  // Initial calculations
  useEffect(() => {
    calculateForexProp()
    calculateFuturesProp()
    calculateRisk()
    calculateTradePlan()
    updateMarketStatus()
    
    // Update market status every minute
    const interval = setInterval(updateMarketStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  // Update market status function
  const updateMarketStatus = () => {
    const now = new Date()
    const hours = now.getHours()
    const day = now.getDay()
    
    // Forex market hours (Sunday 5 PM ET - Friday 5 PM ET)
    const isForexOpen = !(day === 6 || (day === 5 && hours >= 17) || (day === 0 && hours < 17))
    
    // Futures market hours (Sunday 6 PM ET - Friday 5 PM ET with breaks)
    const isFuturesOpen = !(day === 6 || (day === 5 && hours >= 17) || (day === 0 && hours < 18))
    
    setMarketStatus({
      forex: isForexOpen ? 'OPEN' : 'CLOSED',
      futures: isFuturesOpen ? 'OPEN' : 'CLOSED',
      crypto: '24/7'
    })
  }

  // Forex/CFD Prop Calculator
  const calculateForexProp = useCallback(() => {
    const selectedAccount = forexAccounts.find(acc => acc.id === selectedForexAccount) || forexProp
    const phase = selectedAccount.phase
    const accountSize = parseFloat(selectedAccount.accountSize || '0')
    const currentBalance = parseFloat(selectedAccount.currentBalance || '0')
    const startDate = new Date(selectedAccount.startDate)
    const today = new Date()
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    let dailyDD, maxDD, target, minDays, maxDays, profitTarget, progress
    
    switch (phase) {
      case 'phase1':
        dailyDD = parseFloat(selectedAccount.phase1DailyDD || '0')
        maxDD = parseFloat(selectedAccount.phase1MaxDD || '0')
        target = parseFloat(selectedAccount.phase1Target || '0')
        minDays = parseInt(selectedAccount.phase1MinDays || '0')
        maxDays = parseInt(selectedAccount.phase1MaxDays || '0')
        break
      case 'phase2':
        dailyDD = parseFloat(selectedAccount.phase2DailyDD || '0')
        maxDD = parseFloat(selectedAccount.phase2MaxDD || '0')
        target = parseFloat(selectedAccount.phase2Target || '0')
        minDays = parseInt(selectedAccount.phase2MinDays || '0')
        maxDays = parseInt(selectedAccount.phase2MaxDays || '0')
        break
      case 'funded':
        dailyDD = parseFloat(selectedAccount.fundedDailyDD || '0')
        maxDD = parseFloat(selectedAccount.fundedMaxDD || '0')
        target = 0
        minDays = 0
        maxDays = 0
        break
      default:
        dailyDD = 0
        maxDD = 0
        target = 0
        minDays = 0
        maxDays = 0
    }
    
    profitTarget = accountSize * (target / 100)
    progress = currentBalance - accountSize
    
    // Calculate high water mark from daily entries
    const highWaterMark = forexDailyEntries.length > 0 
      ? Math.max(...forexDailyEntries.map(e => e.balance))
      : currentBalance
    
    // Calculate current drawdown
    const currentDrawdown = highWaterMark > 0 ? ((highWaterMark - currentBalance) / highWaterMark) * 100 : 0
    
    const results = {
      phase,
      accountSize,
      currentBalance,
      highWaterMark,
      currentDrawdown: currentDrawdown.toFixed(2),
      dailyDD,
      maxDD,
      profitTarget,
      progress,
      progressPercent: profitTarget > 0 ? ((progress / profitTarget) * 100).toFixed(2) : '0.00',
      minDays,
      maxDays,
      daysSinceStart,
      daysRemaining: Math.max(0, maxDays - daysSinceStart),
      dailyDDLimit: accountSize * (dailyDD / 100),
      maxDDLimit: accountSize * (maxDD / 100),
      isDailyDDViolated: currentDrawdown > dailyDD,
      isMaxDDViolated: currentDrawdown > maxDD,
      isTargetMet: progress >= profitTarget,
      isMinDaysMet: daysSinceStart >= minDays,
      isMaxDaysViolated: daysSinceStart > maxDays,
      canWithdraw: phase === 'funded' && currentBalance > accountSize,
      withdrawableAmount: phase === 'funded' ? (currentBalance - accountSize) * (parseInt(selectedAccount.profitSplit) / 100) : 0
    }
    
    setForexPropResults(results)
    
    // Add initial daily entry if none exists
    const todayStr = formatDate(new Date())
    const hasTodayEntry = forexDailyEntries.some(entry => entry.date === todayStr)
    
    if (!hasTodayEntry && forexDailyEntries.length === 0) {
      setForexDailyEntries([{
        date: todayStr,
        balance: currentBalance,
        profitLoss: 0,
        trades: 0,
        notes: 'Initial balance',
        highWaterMark: currentBalance,
        drawdownUsed: 0
      }])
    }
  }, [forexAccounts, selectedForexAccount, forexProp, forexDailyEntries])

  // Futures Prop Calculator
  const calculateFuturesProp = useCallback(() => {
    const selectedAccount = futuresAccounts.find(acc => acc.id === selectedFuturesAccount) || futuresProp
    const phase = selectedAccount.phase
    const accountSize = parseFloat(selectedAccount.accountSize || '0')
    const currentBalance = parseFloat(selectedAccount.currentBalance || '0')
    const highWaterMark = parseFloat(selectedAccount.highWaterMark || '0')
    const startDate = new Date(selectedAccount.startDate)
    const today = new Date()
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    let trailingDD, profitTarget, minDays, drawdownType
    
    switch (phase) {
      case 'evaluation':
        trailingDD = parseFloat(selectedAccount.evalTrailingDD || '0')
        profitTarget = parseFloat(selectedAccount.evalProfitTarget || '0')
        minDays = parseInt(selectedAccount.evalMinDays || '0')
        drawdownType = selectedAccount.evalDrawdownType
        break
      case 'pa':
        trailingDD = parseFloat(selectedAccount.paTrailingDD || '0')
        profitTarget = parseFloat(selectedAccount.paProfitTarget || '0')
        minDays = parseInt(selectedAccount.paMinDays || '0')
        drawdownType = selectedAccount.paDrawdownType
        break
      case 'funded':
        trailingDD = parseFloat(selectedAccount.fundedTrailingDD || '0')
        profitTarget = 0
        minDays = 0
        drawdownType = selectedAccount.fundedDrawdownType
        break
      default:
        trailingDD = 0
        profitTarget = 0
        minDays = 0
        drawdownType = 'eod'
    }
    
    // Calculate from daily entries if available
    const entriesHighWaterMark = futuresDailyEntries.length > 0 
      ? Math.max(...futuresDailyEntries.map(e => e.highWaterMark))
      : highWaterMark
    
    const currentTrailingThreshold = entriesHighWaterMark - trailingDD
    const currentDDUsed = Math.max(0, entriesHighWaterMark - currentBalance)
    const isDDViolated = currentBalance < currentTrailingThreshold
    
    const progress = currentBalance - accountSize
    const isTargetMet = progress >= profitTarget
    const isMinDaysMet = daysSinceStart >= minDays
    
    const results = {
      phase,
      accountSize,
      currentBalance,
      highWaterMark: entriesHighWaterMark,
      currentTrailingThreshold,
      currentDDUsed,
      isDDViolated,
      profitTarget,
      progress,
      minDays,
      daysSinceStart,
      drawdownType,
      isTargetMet,
      isMinDaysMet,
      canWithdraw: phase === 'funded' && currentBalance > accountSize,
      withdrawableAmount: phase === 'funded' ? (currentBalance - accountSize) * (parseInt(selectedAccount.profitSplit) / 100) : 0
    }
    
    setFuturesPropResults(results)
    
    // Add initial daily entry if none exists
    const todayStr = formatDate(new Date())
    const hasTodayEntry = futuresDailyEntries.some(entry => entry.date === todayStr)
    
    if (!hasTodayEntry && futuresDailyEntries.length === 0) {
      setFuturesDailyEntries([{
        date: todayStr,
        balance: currentBalance,
        profitLoss: 0,
        trades: 0,
        notes: 'Initial balance',
        highWaterMark: currentBalance,
        drawdownUsed: 0
      }])
    }
  }, [futuresAccounts, selectedFuturesAccount, futuresProp, futuresDailyEntries])

  // Risk Calculator
  const calculateRisk = useCallback(() => {
    const accountSize = parseFloat(riskCalculator.accountSize) || 0
    const riskPercent = parseFloat(riskCalculator.riskPercent) || 0
    const stopLossPips = parseFloat(riskCalculator.stopLossPips) || 1
    
    const riskAmount = accountSize * (riskPercent / 100)
    const pipValue = riskAmount / stopLossPips
    
    // For forex, standard lot size calculation
    const positionSize = (pipValue / 10).toFixed(2) // Assuming $10 per pip per standard lot
    
    setRiskCalculator(prev => ({
      ...prev,
      riskAmount: riskAmount.toFixed(2),
      pipValue: pipValue.toFixed(2),
      positionSize
    }))
  }, [riskCalculator.accountSize, riskCalculator.riskPercent, riskCalculator.stopLossPips])

  // Trade Planner
  const calculateTradePlan = useCallback(() => {
    const entry = parseFloat(tradePlanner.entryPrice) || 0
    const stopLoss = parseFloat(tradePlanner.stopLoss) || 0
    const positionSize = parseFloat(tradePlanner.positionSize) || 0
    
    const riskPerPip = positionSize * 10 // $10 per pip per standard lot
    const pipsToStop = Math.abs(entry - stopLoss) || 1
    const riskAmount = riskPerPip * pipsToStop
    
    const takeProfit1 = parseFloat(tradePlanner.takeProfit1) || 0
    const takeProfit2 = parseFloat(tradePlanner.takeProfit2) || 0
    
    const profit1 = Math.abs(takeProfit1 - entry) * riskPerPip
    const profit2 = Math.abs(takeProfit2 - entry) * riskPerPip
    const potentialProfit = profit1 + profit2
    
    setTradePlanner(prev => ({
      ...prev,
      riskAmount: riskAmount.toFixed(2),
      potentialProfit: potentialProfit.toFixed(2)
    }))
  }, [tradePlanner.entryPrice, tradePlanner.stopLoss, tradePlanner.positionSize, tradePlanner.takeProfit1, tradePlanner.takeProfit2])

  // Forex Daily Entry Function
  const addForexDailyEntry = useCallback((prefilledDate?: string) => {
    const entryDate = prefilledDate || prompt('Enter date (YYYY-MM-DD):', formatDate(new Date()))
    if (!entryDate) return
    
    // Validate date
    if (!validateDate(entryDate)) {
      alert('Invalid date format. Please use YYYY-MM-DD')
      return
    }
    
    // Check if date is in future
    if (new Date(entryDate) > new Date()) {
      alert('Cannot add entries for future dates')
      return
    }
    
    const profitLoss = prompt('Enter daily P&L ($):', '0')
    const trades = prompt('Number of trades today:', '0')
    const notes = prompt('Notes for today:', '')
    
    // Validate numeric inputs
    const profitLossNum = parseFloat(profitLoss || '0')
    const tradesNum = parseInt(trades || '0')
    
    if (isNaN(profitLossNum) || isNaN(tradesNum)) {
      alert('Please enter valid numbers for P&L and trades')
      return
    }
    
    // Get current state
    const currentBalance = forexPropResults?.currentBalance || parseFloat(forexProp.currentBalance)
    const newBalance = currentBalance + profitLossNum
    
    // Calculate high water mark
    const allBalances = [...forexDailyEntries.map(e => e.balance), newBalance]
    const newHighWaterMark = Math.max(...allBalances)
    
    // Calculate drawdown used
    const accountSize = forexPropResults?.accountSize || parseFloat(forexProp.accountSize)
    const drawdownUsed = Math.max(0, accountSize - newBalance)
    
    const newEntry: DailyEntry = {
      date: entryDate,
      balance: newBalance,
      profitLoss: profitLossNum,
      trades: tradesNum,
      notes: notes || '',
      highWaterMark: newHighWaterMark,
      drawdownUsed
    }
    
    // Update entries (replace if date already exists)
    setForexDailyEntries(prev => [...prev.filter(e => e.date !== entryDate), newEntry].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ))
    
    // Update the forex prop state
    setForexProp(prev => ({
      ...prev,
      currentBalance: newBalance.toString(),
      tradingDays: (parseInt(prev.tradingDays) + 1).toString()
    }))
    
    alert(`Daily entry added!\nBalance: $${newBalance.toFixed(2)}\nHigh Water Mark: $${newHighWaterMark.toFixed(2)}`)
  }, [forexProp, forexPropResults, forexDailyEntries])

  // Futures Daily Entry Function
  const addFuturesDailyEntry = useCallback((prefilledDate?: string) => {
    const entryDate = prefilledDate || prompt('Enter date (YYYY-MM-DD):', formatDate(new Date()))
    if (!entryDate) return
    
    // Validate date
    if (!validateDate(entryDate)) {
      alert('Invalid date format. Please use YYYY-MM-DD')
      return
    }
    
    // Check if date is in future
    if (new Date(entryDate) > new Date()) {
      alert('Cannot add entries for future dates')
      return
    }
    
    const profitLoss = prompt('Enter daily P&L ($):', '0')
    const trades = prompt('Number of trades today:', '0')
    const notes = prompt('Notes for today:', '')
    
    // Validate numeric inputs
    const profitLossNum = parseFloat(profitLoss || '0')
    const tradesNum = parseInt(trades || '0')
    
    if (isNaN(profitLossNum) || isNaN(tradesNum)) {
      alert('Please enter valid numbers for P&L and trades')
      return
    }
    
    // Get current state
    const currentBalance = futuresPropResults?.currentBalance || parseFloat(futuresProp.currentBalance)
    const newBalance = currentBalance + profitLossNum
    
    // Calculate high water mark
    const allBalances = [...futuresDailyEntries.map(e => e.highWaterMark), newBalance]
    const newHighWaterMark = Math.max(...allBalances)
    
    // Calculate drawdown used
    const drawdownUsed = Math.max(0, newHighWaterMark - newBalance)
    
    const newEntry: DailyEntry = {
      date: entryDate,
      balance: newBalance,
      profitLoss: profitLossNum,
      trades: tradesNum,
      notes: notes || '',
      highWaterMark: newHighWaterMark,
      drawdownUsed
    }
    
    // Update entries (replace if date already exists)
    setFuturesDailyEntries(prev => [...prev.filter(e => e.date !== entryDate), newEntry].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ))
    
    // Update the futures prop state
    setFuturesProp(prev => ({
      ...prev,
      currentBalance: newBalance.toString(),
      highWaterMark: newHighWaterMark.toString(),
      tradingDays: (parseInt(prev.tradingDays) + 1).toString()
    }))
    
    alert(`Daily entry added!\nBalance: $${newBalance.toFixed(2)}\nHigh Water Mark: $${newHighWaterMark.toFixed(2)}`)
  }, [futuresProp, futuresPropResults, futuresDailyEntries])

  // Get Forex Calendar Items for Day
  const getForexCalendarItemsForDay = useCallback((day: number, month: Date): CalendarItem[] => {
    const year = month.getFullYear()
    const monthNum = month.getMonth()
    const dateStr = `${year}-${String(monthNum + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    const items: CalendarItem[] = []
    const entry = forexDailyEntries.find(e => e.date === dateStr)
    
    if (entry) {
      items.push({
        type: 'trade',
        title: '📊 Trading Day',
        profitLoss: entry.profitLoss,
        trades: entry.trades,
        balance: entry.balance
      })
      
      // Check if it's a milestone day
      const startDate = new Date(forexProp.startDate)
      const currentDate = new Date(dateStr)
      const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (forexPropResults) {
        const minDays = forexPropResults.minDays || 0
        const maxDays = forexPropResults.maxDays || 0
        const phase = forexPropResults.phase || 'phase1'
        
        if (daysSinceStart === minDays) {
          items.push({
            type: 'milestone',
            title: '🎯 Min Days Reached',
            description: `Minimum trading days completed`
          })
        }
        if (daysSinceStart === maxDays && phase !== 'funded') {
          items.push({
            type: 'warning',
            title: '⚠️ Deadline Today',
            description: `Maximum days reached - account expires`
          })
        }
        if (entry.balance >= (forexPropResults.profitTarget || 0) + (forexPropResults.accountSize || 0)) {
          items.push({
            type: 'success',
            title: '✅ Profit Target Hit!',
            description: `Target achieved!`
          })
        }
      }
    }
    
    return items
  }, [forexDailyEntries, forexProp, forexPropResults])

  // Get Futures Calendar Items for Day
  const getFuturesCalendarItemsForDay = useCallback((day: number, month: Date): CalendarItem[] => {
    const year = month.getFullYear()
    const monthNum = month.getMonth()
    const dateStr = `${year}-${String(monthNum + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    const items: CalendarItem[] = []
    const entry = futuresDailyEntries.find(e => e.date === dateStr)
    
    if (entry) {
      items.push({
        type: 'trade',
        title: '📊 Trading Day',
        profitLoss: entry.profitLoss,
        trades: entry.trades,
        balance: entry.balance
      })
      
      // Check if it's a milestone day
      const startDate = new Date(futuresProp.startDate)
      const currentDate = new Date(dateStr)
      const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (futuresPropResults) {
        const minDays = futuresPropResults.minDays || 0
        const phase = futuresPropResults.phase || 'evaluation'
        
        if (daysSinceStart === minDays) {
          items.push({
            type: 'milestone',
            title: '🎯 Min Days Reached',
            description: `Minimum trading days completed`
          })
        }
        if (phase === 'evaluation' && entry.balance >= parseFloat(futuresProp.accountSize) + parseFloat(futuresProp.evalProfitTarget)) {
          items.push({
            type: 'success',
            title: '✅ Profit Target Hit!',
            description: `Evaluation target achieved!`
          })
        }
      }
    }
    
    return items
  }, [futuresDailyEntries, futuresProp, futuresPropResults])

  // Render Calendar Item
  const renderCalendarItem = useCallback((item: CalendarItem, isForex: boolean = true) => {
    const color = item.type === 'trade' 
      ? (item.profitLoss! >= 0 ? theme.success : theme.danger)
      : item.type === 'success' ? theme.success
      : item.type === 'warning' ? theme.warning
      : item.type === 'milestone' ? theme.accent
      : theme.text
    
    return (
      <div style={{
        padding: '6px',
        marginBottom: '4px',
        background: darkMode ? '#334155' : '#f8fafc',
        borderRadius: '6px',
        fontSize: '11px',
        borderLeft: `3px solid ${color}`
      }}>
        <div style={{ fontWeight: 600, color: theme.text }}>{item.title}</div>
        {item.profitLoss !== undefined && (
          <div style={{ color, fontSize: '10px' }}>
            P&L: ${item.profitLoss.toFixed(2)} • Trades: {item.trades}
          </div>
        )}
        {item.description && (
          <div style={{ color: theme.textMuted, fontSize: '9px' }}>{item.description}</div>
        )}
      </div>
    )
  }, [theme, darkMode])

  // Export functionality
  const exportForexData = useCallback(() => {
    const selectedAccount = forexAccounts.find(acc => acc.id === selectedForexAccount)
    const data = {
      account: selectedAccount,
      entries: forexDailyEntries,
      results: forexPropResults,
      exportDate: formatDate(new Date()),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `forex-trading-data-${selectedAccount?.accountName.replace(/\s+/g, '-').toLowerCase()}-${formatDate(new Date())}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [forexAccounts, selectedForexAccount, forexDailyEntries, forexPropResults])

  const exportFuturesData = useCallback(() => {
    const selectedAccount = futuresAccounts.find(acc => acc.id === selectedFuturesAccount)
    const data = {
      account: selectedAccount,
      entries: futuresDailyEntries,
      results: futuresPropResults,
      exportDate: formatDate(new Date()),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `futures-trading-data-${selectedAccount?.accountName.replace(/\s+/g, '-').toLowerCase()}-${formatDate(new Date())}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [futuresAccounts, selectedFuturesAccount, futuresDailyEntries, futuresPropResults])

  // Memoized calendar days
  const getCalendarDays = useCallback((month: Date) => {
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => i + 1)
  }, [])

  const forexCalendarDays = useMemo(() => getCalendarDays(forexCalendarMonth), [forexCalendarMonth, getCalendarDays])
  const futuresCalendarDays = useMemo(() => getCalendarDays(futuresCalendarMonth), [futuresCalendarMonth, getCalendarDays])

  // Add new journal entry
  const addJournalEntry = () => {
    const newEntry = {
      id: journalEntries.length + 1,
      date: formatDate(new Date()),
      symbol: selectedSymbol,
      direction: Math.random() > 0.5 ? 'BUY' : 'SELL',
      entry: 1.0950 + (Math.random() * 0.005 - 0.0025),
      exit: 1.0950 + (Math.random() * 0.01 - 0.005),
      pips: Math.floor(Math.random() * 50) + 10,
      profit: Math.floor(Math.random() * 500) + 100,
      notes: 'New trade executed'
    }
    
    setJournalEntries(prev => [newEntry, ...prev])
  }

  // Add new account
  const addForexAccount = () => {
    const newId = forexAccounts.length + 1
    const newAccount: ForexAccount = {
      id: newId,
      accountName: `Forex Account ${newId}`,
      phase: 'phase1',
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
      currentBalance: '100000',
      tradingDays: '0',
      startDate: formatDate(new Date()),
      riskPerTrade: '1',
      tradesPerDay: '2',
      winRate: '55',
      avgRR: '1.5',
      profitSplit: '80'
    }
    
    setForexAccounts(prev => [...prev, newAccount])
    setSelectedForexAccount(newId)
  }

  const addFuturesAccount = () => {
    const newId = futuresAccounts.length + 1
    const newAccount: FuturesAccount = {
      id: newId,
      accountName: `Futures Account ${newId}`,
      phase: 'evaluation',
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
      currentBalance: '50000',
      highWaterMark: '50000',
      tradingDays: '0',
      startDate: formatDate(new Date()),
      contractLimit: '10',
      riskPerTrade: '200',
      tradesPerDay: '3',
      winRate: '50',
      avgWin: '300',
      avgLoss: '200',
      profitSplit: '90'
    }
    
    setFuturesAccounts(prev => [...prev, newAccount])
    setSelectedFuturesAccount(newId)
  }

  // Header component
  const Header = () => (
    <header style={{
      background: darkMode ? '#1e293b' : '#ffffff',
      borderBottom: `1px solid ${theme.border}`,
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <h1 style={{ margin: 0, color: theme.text, fontSize: '24px', fontWeight: 'bold' }}>Trading Dashboard</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['dashboard', 'overview', 'path', 'trading'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? theme.accent : 'transparent',
                color: activeTab === tab ? 'white' : theme.textMuted,
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            background: 'transparent',
            border: `1px solid ${theme.border}`,
            color: theme.text,
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ color: theme.text, fontSize: '14px' }}>{user.fullName}</div>
          </div>
        )}
      </div>
    </header>
  )

  // Render different tabs
  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Section */}
      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '24px' }}>
          Welcome back, {user?.firstName || 'Trader'}! 👋
        </h2>
        <p style={{ color: theme.textMuted, margin: '0 0 20px 0', fontSize: '16px' }}>
          Your trading dashboard is ready. Monitor your progress, analyze performance, and plan your next moves.
        </p>
        
        {/* Market Status */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ 
            padding: '16px', 
            background: darkMode ? '#2d3748' : '#f1f5f9', 
            borderRadius: '12px',
            flex: 1
          }}>
            <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '4px' }}>Forex Market</div>
            <div style={{ 
              color: marketStatus.forex === 'OPEN' ? theme.success : theme.danger, 
              fontSize: '20px', 
              fontWeight: 'bold' 
            }}>
              {marketStatus.forex}
            </div>
          </div>
          <div style={{ 
            padding: '16px', 
            background: darkMode ? '#2d3748' : '#f1f5f9', 
            borderRadius: '12px',
            flex: 1
          }}>
            <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '4px' }}>Futures Market</div>
            <div style={{ 
              color: marketStatus.futures === 'OPEN' ? theme.success : theme.danger, 
              fontSize: '20px', 
              fontWeight: 'bold' 
            }}>
              {marketStatus.futures}
            </div>
          </div>
          <div style={{ 
            padding: '16px', 
            background: darkMode ? '#2d3748' : '#f1f5f9', 
            borderRadius: '12px',
            flex: 1
          }}>
            <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '4px' }}>Crypto Market</div>
            <div style={{ 
              color: theme.success, 
              fontSize: '20px', 
              fontWeight: 'bold' 
            }}>
              {marketStatus.crypto}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        {/* Performance Overview */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>📈 Performance Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div>
              <div style={{ color: theme.textMuted, fontSize: '12px' }}>Win Rate</div>
              <div style={{ color: performanceMetrics.winRate >= 50 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 'bold' }}>
                {performanceMetrics.winRate}%
              </div>
            </div>
            <div>
              <div style={{ color: theme.textMuted, fontSize: '12px' }}>Total Profit</div>
              <div style={{ color: theme.success, fontSize: '24px', fontWeight: 'bold' }}>
                ${performanceMetrics.totalProfit.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ color: theme.textMuted, fontSize: '12px' }}>Profit Factor</div>
              <div style={{ color: performanceMetrics.profitFactor >= 1.5 ? theme.success : theme.warning, fontSize: '24px', fontWeight: 'bold' }}>
                {performanceMetrics.profitFactor}
              </div>
            </div>
            <div>
              <div style={{ color: theme.textMuted, fontSize: '12px' }}>Total Trades</div>
              <div style={{ color: theme.text, fontSize: '24px', fontWeight: 'bold' }}>
                {performanceMetrics.totalTrades}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trades */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: theme.text, fontSize: '18px' }}>📋 Recent Trades</h3>
            <button onClick={addJournalEntry} style={{ ...btnPrimary, padding: '6px 12px', fontSize: '12px' }}>+ Add Trade</button>
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {journalEntries.slice(0, 3).map((entry, idx) => (
              <div key={idx} style={{ 
                padding: '12px', 
                borderBottom: idx < 2 ? `1px solid ${theme.border}` : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>
                    {entry.symbol} • {entry.direction}
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>{entry.date}</div>
                </div>
                <div style={{ 
                  color: entry.profit >= 0 ? theme.success : theme.danger, 
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  ${entry.profit}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trading Goals */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>🎯 Trading Goals</h3>
          {tradingGoals.map((goal, idx) => (
            <div key={idx} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ color: theme.text, fontSize: '14px' }}>{goal.goal}</div>
                <div style={{ color: theme.textMuted, fontSize: '12px' }}>{goal.deadline}</div>
              </div>
              <div style={{ 
                height: '8px', 
                background: darkMode ? '#334155' : '#e2e8f0', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  height: '100%', 
                  width: `${(goal.current / goal.target) * 100}%`, 
                  background: (goal.current / goal.target) >= 0.75 ? theme.success : 
                            (goal.current / goal.target) >= 0.5 ? theme.warning : theme.accent,
                  borderRadius: '4px'
                }} />
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '4px',
                fontSize: '12px',
                color: theme.textMuted
              }}>
                <span>{goal.current} / {goal.target}</span>
                <span>{Math.round((goal.current / goal.target) * 100)}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Watchlist */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>📊 Watchlist</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {watchlist.map((item, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                background: darkMode ? '#2d3748' : '#f1f5f9',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>{item.symbol}</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>
                    {typeof item.price === 'number' ? item.price.toLocaleString() : item.price}
                  </div>
                </div>
                <div style={{ 
                  color: item.change >= 0 ? theme.success : theme.danger,
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {item.change >= 0 ? '+' : ''}{item.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderOverview = () => (
    <div style={cardStyle}>
      <h2 style={{ margin: '0 0 24px 0', color: theme.text, fontSize: '24px' }}>Trading Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {/* Risk Calculator */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>⚖️ Risk Calculator</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: theme.text, fontSize: '14px' }}>Account Size ($)</label>
              <input
                type="number"
                value={riskCalculator.accountSize}
                onChange={(e) => setRiskCalculator(prev => ({ ...prev, accountSize: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1px solid ${theme.border}`,
                  background: theme.bg,
                  color: theme.text
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: theme.text, fontSize: '14px' }}>Risk Percent (%)</label>
              <input
                type="number"
                value={riskCalculator.riskPercent}
                onChange={(e) => setRiskCalculator(prev => ({ ...prev, riskPercent: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1px solid ${theme.border}`,
                  background: theme.bg,
                  color: theme.text
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: theme.text, fontSize: '14px' }}>Stop Loss (Pips)</label>
              <input
                type="number"
                value={riskCalculator.stopLossPips}
                onChange={(e) => setRiskCalculator(prev => ({ ...prev, stopLossPips: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1px solid ${theme.border}`,
                  background: theme.bg,
                  color: theme.text
                }}
              />
            </div>
            <button onClick={calculateRisk} style={btnPrimary}>Calculate Risk</button>
            
            {riskCalculator.riskAmount !== '0' && (
              <div style={{ marginTop: '12px', padding: '12px', background: darkMode ? '#2d3748' : '#f1f5f9', borderRadius: '8px' }}>
                <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Results:</div>
                <div style={{ color: theme.textMuted, fontSize: '12px' }}>Risk Amount: ${riskCalculator.riskAmount}</div>
                <div style={{ color: theme.textMuted, fontSize: '12px' }}>Position Size: {riskCalculator.positionSize} lots</div>
                <div style={{ color: theme.textMuted, fontSize: '12px' }}>Pip Value: ${riskCalculator.pipValue}</div>
              </div>
            )}
          </div>
        </div>

        {/* Trade Planner */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>📝 Trade Planner</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: theme.text, fontSize: '14px' }}>Entry Price</label>
              <input
                type="number"
                step="0.0001"
                value={tradePlanner.entryPrice}
                onChange={(e) => setTradePlanner(prev => ({ ...prev, entryPrice: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1px solid ${theme.border}`,
                  background: theme.bg,
                  color: theme.text
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: theme.text, fontSize: '14px' }}>Stop Loss</label>
              <input
                type="number"
                step="0.0001"
                value={tradePlanner.stopLoss}
                onChange={(e) => setTradePlanner(prev => ({ ...prev, stopLoss: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1px solid ${theme.border}`,
                  background: theme.bg,
                  color: theme.text
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: theme.text, fontSize: '14px' }}>Position Size (lots)</label>
              <input
                type="number"
                step="0.01"
                value={tradePlanner.positionSize}
                onChange={(e) => setTradePlanner(prev => ({ ...prev, positionSize: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1px solid ${theme.border}`,
                  background: theme.bg,
                  color: theme.text
                }}
              />
            </div>
            <button onClick={calculateTradePlan} style={btnPrimary}>Calculate Plan</button>
            
            {tradePlanner.riskAmount !== '0' && (
              <div style={{ marginTop: '12px', padding: '12px', background: darkMode ? '#2d3748' : '#f1f5f9', borderRadius: '8px' }}>
                <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Trade Plan:</div>
                <div style={{ color: theme.textMuted, fontSize: '12px' }}>Risk: ${tradePlanner.riskAmount}</div>
                <div style={{ color: theme.textMuted, fontSize: '12px' }}>Potential Profit: ${tradePlanner.potentialProfit}</div>
                <div style={{ color: theme.textMuted, fontSize: '12px' }}>R:R Ratio: {(parseFloat(tradePlanner.potentialProfit) / parseFloat(tradePlanner.riskAmount)).toFixed(2)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Trading Psychology */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>🧠 Trading Psychology</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: darkMode ? '#2d3748' : '#f1f5f9', borderRadius: '8px' }}>
              <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Current State</div>
              <div style={{ color: theme.textMuted, fontSize: '12px' }}>Emotional State: {tradingPsychology.emotionalState}</div>
              <div style={{ color: theme.textMuted, fontSize: '12px' }}>Discipline Score: {tradingPsychology.disciplineScore}/100</div>
              <div style={{ color: theme.textMuted, fontSize: '12px' }}>Confidence Level: {tradingPsychology.confidenceLevel}/100</div>
            </div>
            
            <div style={{ padding: '12px', background: darkMode ? '#2d3748' : '#f1f5f9', borderRadius: '8px' }}>
              <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Recent Mistakes</div>
              <ul style={{ margin: 0, paddingLeft: '16px', color: theme.textMuted, fontSize: '12px' }}>
                {tradingPsychology.recentMistakes.map((mistake, idx) => (
                  <li key={idx}>{mistake}</li>
                ))}
              </ul>
            </div>
            
            <div style={{ padding: '12px', background: darkMode ? '#2d3748' : '#f1f5f9', borderRadius: '8px' }}>
              <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Daily Affirmations</div>
              <ul style={{ margin: 0, paddingLeft: '16px', color: theme.textMuted, fontSize: '12px' }}>
                {tradingPsychology.dailyAffirmations.map((affirmation, idx) => (
                  <li key={idx}>{affirmation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPath = () => (
    <div style={cardStyle}>
      <h2 style={{ margin: '0 0 24px 0', color: theme.text, fontSize: '24px' }}>Trading Path & Education</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        {/* Learning Path */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>📚 Learning Path</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { level: 'Beginner', topics: ['Basic terminology', 'Market structure', 'Risk management basics'], completed: 100 },
              { level: 'Intermediate', topics: ['Technical analysis', 'Trading strategies', 'Psychology'], completed: 75 },
              { level: 'Advanced', topics: ['Advanced strategies', 'Prop firm challenges', 'Portfolio management'], completed: 25 }
            ].map((level, idx) => (
              <div key={idx} style={{ 
                padding: '16px', 
                background: darkMode ? '#2d3748' : '#f1f5f9', 
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ color: theme.text, fontWeight: 600, fontSize: '16px' }}>{level.level}</div>
                  <div style={{ 
                    color: level.completed === 100 ? theme.success : theme.accent, 
                    fontSize: '14px', 
                    fontWeight: 600 
                  }}>
                    {level.completed}%
                  </div>
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', color: theme.textMuted, fontSize: '14px' }}>
                  {level.topics.map((topic, topicIdx) => (
                    <li key={topicIdx}>{topic}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Economic Calendar */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>📅 Economic Calendar</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {economicCalendar.map((event, idx) => (
              <div key={idx} style={{ 
                padding: '12px', 
                background: darkMode ? '#2d3748' : '#f1f5f9', 
                borderRadius: '8px',
                borderLeft: `4px solid ${event.impact === 'high' ? theme.danger : event.impact === 'medium' ? theme.warning : theme.success}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>{event.event}</div>
                  <div style={{ 
                    padding: '2px 8px', 
                    background: event.impact === 'high' ? theme.danger : event.impact === 'medium' ? theme.warning : theme.success,
                    color: 'white',
                    fontSize: '10px',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>
                    {event.impact.toUpperCase()}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>{event.country} • {event.date} {event.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div style={{ gridColumn: 'span 2' }}>
          <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>📖 Recommended Resources</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { title: 'Babypips School', type: 'Course', difficulty: 'Beginner', duration: '2-3 months' },
              { title: 'TradingView', type: 'Tool', difficulty: 'All', duration: 'Ongoing' },
              { title: 'Market Wizards', type: 'Book', difficulty: 'All', duration: 'Read' },
              { title: 'Forex Factory', type: 'Forum', difficulty: 'Intermediate', duration: 'Ongoing' },
              { title: 'Investopedia', type: 'Reference', difficulty: 'All', duration: 'Ongoing' },
              { title: 'Prop Firm Reviews', type: 'Research', difficulty: 'Advanced', duration: 'Weekly' }
            ].map((resource, idx) => (
              <div key={idx} style={{ 
                padding: '16px', 
                background: darkMode ? '#2d3748' : '#f1f5f9', 
                borderRadius: '12px'
              }}>
                <div style={{ color: theme.text, fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>{resource.title}</div>
                <div style={{ color: theme.textMuted, fontSize: '12px' }}>Type: {resource.type}</div>
                <div style={{ color: theme.textMuted, fontSize: '12px' }}>Difficulty: {resource.difficulty}</div>
                <div style={{ color: theme.textMuted, fontSize: '12px' }}>Duration: {resource.duration}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Calendar Day Component
  const CalendarDay = ({ 
    day, 
    month, 
    isForex = true,
    getCalendarItems,
    addDailyEntry 
  }: { 
    day: number; 
    month: Date; 
    isForex: boolean;
    getCalendarItems: (day: number, month: Date) => CalendarItem[];
    addDailyEntry: (date?: string) => void;
  }) => {
    const date = new Date(month.getFullYear(), month.getMonth(), day)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isToday = date.toDateString() === new Date().toDateString()
    const calendarItems = getCalendarItems(day, month)
    const hasEntry = calendarItems.length > 0
    const dateStr = formatDate(date)
    const isPast = date < new Date() && !isToday
    const isFuture = date > new Date()
    
    return (
      <div 
        style={{ 
          minHeight: '120px', 
          padding: '8px', 
          background: isToday ? theme.todayBg : 
                   isWeekend ? theme.weekendBg : theme.cardBg,
          borderRadius: '8px', 
          border: isToday ? `2px solid ${isForex ? theme.accent : theme.success}` : `1px solid ${theme.border}`,
          opacity: isWeekend || isFuture ? 0.7 : 1,
          cursor: !hasEntry && !isWeekend && !isFuture ? 'pointer' : 'default'
        }}
        onClick={() => !hasEntry && !isWeekend && !isFuture && addDailyEntry(dateStr)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ 
            fontWeight: isToday ? 700 : 600, 
            color: isToday ? (isForex ? theme.accent : theme.success) : theme.text, 
            fontSize: '14px' 
          }}>
            {day}
          </span>
          {hasEntry && (
            <span style={{ 
              background: isForex ? theme.accent : theme.success, 
              color: 'white', 
              fontSize: '9px', 
              padding: '1px 4px', 
              borderRadius: '4px' 
            }}>
              {calendarItems.length}
            </span>
          )}
        </div>
        
        {calendarItems.map((item, idx) => (
          <div key={idx}>
            {renderCalendarItem(item, isForex)}
          </div>
        ))}
        
        {!hasEntry && !isWeekend && (
          <div style={{ 
            fontSize: '10px', 
            color: isPast ? theme.warning : theme.textMuted, 
            textAlign: 'center', 
            padding: '8px' 
          }}>
            {isPast ? 'Click to add entry' : 'No trading'}
          </div>
        )}
        
        {isWeekend && (
          <div style={{ 
            fontSize: '10px', 
            color: theme.textMuted, 
            textAlign: 'center', 
            padding: '8px' 
          }}>
            Weekend
          </div>
        )}
      </div>
    )
  }

  // Trading Calendar Component
  const TradingCalendar = ({ 
    title, 
    calendarMonth, 
    setCalendarMonth, 
    isForex = true,
    getCalendarItems,
    addDailyEntry,
    dailyEntries,
    prop,
    propResults
  }: { 
    title: string; 
    calendarMonth: Date; 
    setCalendarMonth: (date: Date) => void; 
    isForex: boolean;
    getCalendarItems: (day: number, month: Date) => CalendarItem[];
    addDailyEntry: (date?: string) => void;
    dailyEntries: DailyEntry[];
    prop: ForexAccount | FuturesAccount;
    propResults: any;
  }) => {
    const calendarDays = useMemo(() => getCalendarDays(calendarMonth), [calendarMonth, getCalendarDays])
    
    return (
      <div style={{ marginTop: '32px', padding: '24px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, color: theme.text, fontSize: '20px', marginBottom: '4px' }}>{title}</h3>
            <div style={{ color: theme.textMuted, fontSize: '14px' }}>
              {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} 
              style={btnPrimary}
            >
              ← Prev
            </button>
            <button 
              onClick={() => setCalendarMonth(new Date())} 
              style={btnPrimary}
            >
              Today
            </button>
            <button 
              onClick={() => addDailyEntry()} 
              style={{ ...btnSuccess, padding: '8px 16px', fontSize: '13px' }}
            >
              + Add Daily Entry
            </button>
            <button 
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} 
              style={btnPrimary}
            >
              Next →
            </button>
          </div>
        </div>
        
        {/* Calendar Legend */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', fontSize: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', background: theme.success, borderRadius: '2px' }}></div>
            <span style={{ color: theme.textMuted }}>Profitable Day</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', background: theme.danger, borderRadius: '2px' }}></div>
            <span style={{ color: theme.textMuted }}>Losing Day</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', background: theme.warning, borderRadius: '2px' }}></div>
            <span style={{ color: theme.textMuted }}>Milestone</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', background: theme.accent, borderRadius: '2px' }}></div>
            <span style={{ color: theme.textMuted }}>Success</span>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '20px' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ textAlign: 'center', fontWeight: 600, color: theme.textMuted, padding: '10px', fontSize: '13px' }}>{day}</div>
          ))}
          
          {Array.from({ length: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} style={{ minHeight: '120px', background: theme.bg, borderRadius: '8px' }} />
          ))}
          
          {calendarDays.map(day => (
            <CalendarDay
              key={day}
              day={day}
              month={calendarMonth}
              isForex={isForex}
              getCalendarItems={getCalendarItems}
              addDailyEntry={addDailyEntry}
            />
          ))}
        </div>
        
        {/* Daily Summary */}
        <div style={{ padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '16px' }}>📊 Daily Summary</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: theme.textMuted, fontSize: '11px' }}>Trading Days</div>
              <div style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold' }}>{prop.tradingDays}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: theme.textMuted, fontSize: '11px' }}>Days Remaining</div>
              <div style={{ 
                color: isForex ? 
                  (propResults?.daysRemaining > 10 ? theme.success : theme.warning) :
                  (Math.max(0, (propResults?.minDays || 0) - parseInt(prop.tradingDays)) > 0 ? theme.warning : theme.success), 
                fontSize: '18px', 
                fontWeight: 'bold' 
              }}>
                {isForex ? 
                  (propResults?.daysRemaining || 0) :
                  Math.max(0, (propResults?.minDays || 0) - parseInt(prop.tradingDays))
                }
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: theme.textMuted, fontSize: '11px' }}>Avg Daily P&L</div>
              <div style={{ 
                color: dailyEntries.length > 0 ? 
                  (dailyEntries.reduce((sum, e) => sum + e.profitLoss, 0) / dailyEntries.length >= 0 ? theme.success : theme.danger) : 
                  theme.text, 
                fontSize: '18px', 
                fontWeight: 'bold' 
              }}>
                ${dailyEntries.length > 0 ? (dailyEntries.reduce((sum, e) => sum + e.profitLoss, 0) / dailyEntries.length).toFixed(2) : '0.00'}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: theme.textMuted, fontSize: '11px' }}>Total Trades</div>
              <div style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold' }}>
                {dailyEntries.reduce((sum, e) => sum + e.trades, 0)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Entries Table */}
        {dailyEntries.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '16px' }}>📋 Recent Trading Days</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid ' + theme.border }}>
                    <th style={{ textAlign: 'left', padding: '8px', color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '8px', color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>P&L</th>
                    <th style={{ textAlign: 'left', padding: '8px', color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>Balance</th>
                    <th style={{ textAlign: 'left', padding: '8px', color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>High Water Mark</th>
                    <th style={{ textAlign: 'left', padding: '8px', color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>Trades</th>
                    <th style={{ textAlign: 'left', padding: '8px', color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyEntries.slice(-5).reverse().map((entry, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid ' + theme.border }}>
                      <td style={{ padding: '8px', color: theme.text, fontSize: '12px' }}>{entry.date}</td>
                      <td style={{ padding: '8px', fontSize: '12px', fontWeight: 600, color: entry.profitLoss >= 0 ? theme.success : theme.danger }}>
                        ${entry.profitLoss.toFixed(2)}
                      </td>
                      <td style={{ padding: '8px', color: theme.text, fontSize: '12px' }}>${entry.balance.toFixed(2)}</td>
                      <td style={{ padding: '8px', color: theme.accent, fontSize: '12px', fontWeight: 600 }}>${entry.highWaterMark.toFixed(2)}</td>
                      <td style={{ padding: '8px', color: theme.text, fontSize: '12px' }}>{entry.trades}</td>
                      <td style={{ padding: '8px', color: theme.textMuted, fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      <Header />
      
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'path' && renderPath()}
        {activeTab === 'trading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Forex/CFD Prop Calculator */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: theme.accent, fontSize: '22px' }}>💱 Forex/CFD Prop Firm Calculator</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={exportForexData} style={{ ...btnPrimary, fontSize: '13px' }}>📥 Export Data</button>
                  <button onClick={addForexAccount} style={{ ...btnSuccess, fontSize: '13px' }}>+ New Account</button>
                </div>
              </div>
              
              {/* Forex Account Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: theme.text, fontWeight: 600 }}>Select Account:</label>
                <select
                  value={selectedForexAccount}
                  onChange={(e) => setSelectedForexAccount(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`,
                    background: theme.bg,
                    color: theme.text,
                    fontSize: '14px'
                  }}
                >
                  {forexAccounts.map(account => (
                    <option key={account.id} value={account.id}>{account.accountName}</option>
                  ))}
                </select>
              </div>
              
              {/* Forex Input Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: theme.text, fontSize: '14px' }}>Account Name</label>
                  <input
                    type="text"
                    value={forexProp.accountName}
                    onChange={(e) => setForexProp(prev => ({ ...prev, accountName: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      background: theme.bg,
                      color: theme.text,
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: theme.text, fontSize: '14px' }}>Phase</label>
                  <select
                    value={forexProp.phase}
                    onChange={(e) => setForexProp(prev => ({ ...prev, phase: e.target.value as 'phase1' | 'phase2' | 'funded' }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      background: theme.bg,
                      color: theme.text,
                      fontSize: '14px'
                    }}
                  >
                    <option value="phase1">Phase 1</option>
                    <option value="phase2">Phase 2</option>
                    <option value="funded">Funded</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: theme.text, fontSize: '14px' }}>Account Size ($)</label>
                  <input
                    type="number"
                    value={forexProp.accountSize}
                    onChange={(e) => setForexProp(prev => ({ ...prev, accountSize: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      background: theme.bg,
                      color: theme.text,
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: theme.text, fontSize: '14px' }}>Current Balance ($)</label>
                  <input
                    type="number"
                    value={forexProp.currentBalance}
                    onChange={(e) => setForexProp(prev => ({ ...prev, currentBalance: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      background: theme.bg,
                      color: theme.text,
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              
              <button onClick={calculateForexProp} style={{ ...btnPrimary, padding: '12px 24px', fontSize: '16px', width: '100%', marginBottom: '20px' }}>Calculate Forex Prop</button>
              
              {forexPropResults && (
                <div>
                  {/* Results Display */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '16px', background: darkMode ? '#2d3748' : '#f1f5f9', borderRadius: '8px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Current Balance</div>
                      <div style={{ color: theme.text, fontSize: '20px', fontWeight: 'bold' }}>${forexPropResults.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div style={{ padding: '16px', background: darkMode ? '#2d3748' : '#f1f5f9', borderRadius: '8px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Progress to Target</div>
                      <div style={{ color: parseFloat(forexPropResults.progressPercent) >= 100 ? theme.success : theme.accent, fontSize: '20px', fontWeight: 'bold' }}>
                        {forexPropResults.progressPercent}%
                      </div>
                    </div>
                    <div style={{ padding: '16px', background: darkMode ? '#2d3748' : '#f1f5f9', borderRadius: '8px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Days Remaining</div>
                      <div style={{ 
                        color: forexPropResults.daysRemaining > 10 ? theme.success : 
                               forexPropResults.daysRemaining > 5 ? theme.warning : theme.danger, 
                        fontSize: '20px', fontWeight: 'bold' 
                      }}>
                        {forexPropResults.daysRemaining}
                      </div>
                    </div>
                    <div style={{ padding: '16px', background: darkMode ? '#2d3748' : '#f1f5f9', borderRadius: '8px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Current Drawdown</div>
                      <div style={{ 
                        color: parseFloat(forexPropResults.currentDrawdown) > forexPropResults.maxDD ? theme.danger :
                               parseFloat(forexPropResults.currentDrawdown) > forexPropResults.dailyDD ? theme.warning : theme.success, 
                        fontSize: '20px', fontWeight: 'bold' 
                      }}>
                        {forexPropResults.currentDrawdown}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Indicators */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ 
                      padding: '12px', 
                      background: forexPropResults.isDailyDDViolated ? theme.danger : theme.success, 
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>Daily DD</div>
                      <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                        {forexPropResults.isDailyDDViolated ? 'VIOLATED' : 'OK'}
                      </div>
                    </div>
                    <div style={{ 
                      padding: '12px', 
                      background: forexPropResults.isMaxDDViolated ? theme.danger : theme.success, 
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>Max DD</div>
                      <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                        {forexPropResults.isMaxDDViolated ? 'VIOLATED' : 'OK'}
                      </div>
                    </div>
                    <div style={{ 
                      padding: '12px', 
                      background: forexPropResults.isTargetMet ? theme.success : theme.accent, 
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>Target</div>
                      <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                        {forexPropResults.isTargetMet ? 'ACHIEVED' : 'IN PROGRESS'}
                      </div>
                    </div>
                    <div style={{ 
                      padding: '12px', 
                      background: forexPropResults.isMinDaysMet ? theme.success : theme.warning, 
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>Min Days</div>
                      <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                        {forexPropResults.isMinDaysMet ? 'COMPLETE' : 'PENDING'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Forex Trading Calendar */}
                  <TradingCalendar
                    title="📅 Forex Trading Calendar"
                    calendarMonth={forexCalendarMonth}
                    setCalendarMonth={setForexCalendarMonth}
                    isForex={true}
                    getCalendarItems={getForexCalendarItemsForDay}
                    addDailyEntry={addForexDailyEntry}
                    dailyEntries={forexDailyEntries}
                    prop={forexProp}
                    propResults={forexPropResults}
                  />
                </div>
              )}
            </div>

            {/* Futures Prop Calculator */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: theme.success, fontSize: '22px' }}>📊 Futures Prop Firm Calculator</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={exportFuturesData} style={{ ...btnPrimary, fontSize: '13px' }}>📥 Export Data</button>
                  <button onClick={addFuturesAccount} style={{ ...btnSuccess, fontSize: '13px' }}>+ New Account</button>
                </div>
              </div>
              
              {/* Futures Account Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: theme.text, fontWeight: 600 }}>Select Account:</label>
                <select
                  value={selectedFuturesAccount}
                  onChange={(e) => setSelectedFuturesAccount(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`,
                    background: theme.bg,
                    color: theme.text,
                    fontSize: '14px'
                  }}
                >
                  {futuresAccounts.map(account => (
                    <option key={account.id} value={account.id}>{account.accountName}</option>
                  ))}
                </select>
              </div>
              
              {/* Futures Input Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: theme.text, fontSize: '14px' }}>Account Name</label>
                  <input
                    type="text"
                    value={futuresProp.accountName}
                    onChange={(e) => setFuturesProp(prev => ({ ...prev, accountName: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      background: theme.bg,
                      color: theme.text,
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: theme.text, fontSize: '14px' }}>Phase</label>
                  <select
                    value={futuresProp.phase}
                    onChange={(e) => setFuturesProp(prev => ({ ...prev, phase: e.target.value as 'evaluation' | 'pa' | 'funded' }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      background: theme.bg,
                      color: theme.text,
                      fontSize: '14px'
                    }}
                  >
                    <option value="evaluation">Evaluation</option>
                    <option value="pa">PA (Performance)</option>
                    <option value="funded">Funded</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: theme.text, fontSize: '14px' }}>Account Size ($)</label>
                  <input
                    type="number"
                    value={futuresProp.accountSize}
                    onChange={(e) => setFuturesProp(prev => ({ ...prev, accountSize: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      background: theme.bg,
                      color: theme.text,
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: theme.text, fontSize: '14px' }}>Current Balance ($)</label>
                  <input
                    type="number"
                    value={futuresProp.currentBalance}
                    onChange={(e) => setFuturesProp(prev => ({ ...prev, currentBalance: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      background: theme.bg,
                      color: theme.text,
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              
              <button onClick={calculateFuturesProp} style={{ ...btnSuccess, padding: '12px 24px', fontSize: '16px', width: '100%', marginBottom: '20px' }}>Calculate Futures Prop</button>
              
              {futuresPropResults && (
                <div>
                  {/* Results Display */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '16px', background: darkMode ? '#2d3748' : '#f1f5f9', borderRadius: '8px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Current Balance</div>
                      <div style={{ color: theme.text, fontSize: '20px', fontWeight: 'bold' }}>${futuresPropResults.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div style={{ padding: '16px', background: darkMode ? '#2d3748' : '#f1f5f9', borderRadius: '8px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>High Water Mark</div>
                      <div style={{ color: theme.success, fontSize: '20px', fontWeight: 'bold' }}>${futuresPropResults.highWaterMark.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div style={{ padding: '16px', background: darkMode ? '#2d3748' : '#f1f5f9', borderRadius: '8px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Drawdown Used</div>
                      <div style={{ 
                        color: futuresPropResults.currentDDUsed === 0 ? theme.success : 
                               futuresPropResults.currentDDUsed < futuresPropResults.profitTarget * 0.5 ? theme.warning : theme.danger, 
                        fontSize: '20px', fontWeight: 'bold' 
                      }}>
                        ${futuresPropResults.currentDDUsed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div style={{ padding: '16px', background: darkMode ? '#2d3748' : '#f1f5f9', borderRadius: '8px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Progress to Target</div>
                      <div style={{ 
                        color: futuresPropResults.progress >= futuresPropResults.profitTarget ? theme.success : theme.accent, 
                        fontSize: '20px', fontWeight: 'bold' 
                      }}>
                        ${Math.max(0, futuresPropResults.progress).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Indicators */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ 
                      padding: '12px', 
                      background: futuresPropResults.isDDViolated ? theme.danger : theme.success, 
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>Drawdown</div>
                      <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                        {futuresPropResults.isDDViolated ? 'VIOLATED' : 'OK'}
                      </div>
                    </div>
                    <div style={{ 
                      padding: '12px', 
                      background: futuresPropResults.isTargetMet ? theme.success : theme.accent, 
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>Profit Target</div>
                      <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                        {futuresPropResults.isTargetMet ? 'ACHIEVED' : 'IN PROGRESS'}
                      </div>
                    </div>
                    <div style={{ 
                      padding: '12px', 
                      background: futuresPropResults.isMinDaysMet ? theme.success : theme.warning, 
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>Min Days</div>
                      <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                        {futuresPropResults.isMinDaysMet ? 'COMPLETE' : 'PENDING'}
                      </div>
                    </div>
                    <div style={{ 
                      padding: '12px', 
                      background: futuresPropResults.phase === 'funded' ? theme.success : theme.accent, 
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>Phase</div>
                      <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                        {futuresPropResults.phase.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Futures Trading Calendar */}
                  <TradingCalendar
                    title="📅 Futures Trading Calendar"
                    calendarMonth={futuresCalendarMonth}
                    setCalendarMonth={setFuturesCalendarMonth}
                    isForex={false}
                    getCalendarItems={getFuturesCalendarItemsForDay}
                    addDailyEntry={addFuturesDailyEntry}
                    dailyEntries={futuresDailyEntries}
                    prop={futuresProp}
                    propResults={futuresPropResults}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
