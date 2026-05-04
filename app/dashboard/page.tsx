'use client'

import { useUser } from '@clerk/nextjs'
import React, { useState, useEffect, useRef } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  // ==================== APP MODE & NAVIGATION ====================
  const [appMode, setAppMode] = useState<'budget' | 'trading' | null>(null)
  const [showModeSelector, setShowModeSelector] = useState(true)
  const [activeTab, setActiveTab] = useState<'chat' | 'quickview' | 'dashboard' | 'overview' | 'path' | 'trading' | 'today' | 'journal' | 'analytics' | 'accounts'>('chat')
  const [darkMode, setDarkMode] = useState(true)
  
  // ==================== TOUR STATE ====================
  const [showTour, setShowTour] = useState(false)
  const [tourStep, setTourStep] = useState(0)
  const [budgetTourCompleted, setBudgetTourCompleted] = useState(false)
  const [tradingTourCompleted, setTradingTourCompleted] = useState(false)
  
  // ==================== UPLOAD STATE ====================
  const [showPayslipUpload, setShowPayslipUpload] = useState(false)
  const [payslipProcessing, setPayslipProcessing] = useState(false)
  const [extractedPayslip, setExtractedPayslip] = useState<any>(null)
  const payslipInputRef = useRef<HTMLInputElement>(null)
  
  // Trading chart upload
  const [chartProcessing, setChartProcessing] = useState(false)
  const [pendingChartImage, setPendingChartImage] = useState<string | null>(null)
  const chartInputRef = useRef<HTMLInputElement>(null)
  
  // ==================== AUTOMATION STATE ====================
  const [showAutomation, setShowAutomation] = useState(false)
  const [automationSetup, setAutomationSetup] = useState<{
    billsAccount: boolean
    savingsAccount: boolean
    autoTransferBills: boolean
    autoTransferSavings: boolean
    directDebits: string[]
  }>({
    billsAccount: false,
    savingsAccount: false,
    autoTransferBills: false,
    autoTransferSavings: false,
    directDebits: []
  })
  
  // ==================== SUBSCRIPTION STATE ====================
  const [userSubscription, setUserSubscription] = useState<{
    plan: 'free' | 'pro' | 'annual',
    status: 'active' | 'cancelled' | 'past_due' | 'none',
    aiChatsUsed: number,
    aiChatsLimit: number,
    expiresAt: string | null,
    customerId: string | null
  }>({
    plan: 'free',
    status: 'none',
    aiChatsUsed: 0,
    aiChatsLimit: 5,
    expiresAt: null,
    customerId: null
  })
  
  const [showPricingModal, setShowPricingModal] = useState(false)
  
  // ==================== BUDGET STATE (minimal) ====================
  const [incomeStreams, setIncomeStreams] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [debts, setDebts] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [liabilities, setLiabilities] = useState<any[]>([])
  const [roadmapMilestones, setRoadmapMilestones] = useState<any[]>([])
  
  // ==================== PAYOUT TRACKING ====================
  const [payouts, setPayouts] = useState<any[]>([])
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [newPayout, setNewPayout] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    accountId: 0,
    accountName: '',
    propFirm: '',
    notes: '',
    addToIncome: true
  })
  
  // ==================== TRADING STATE ====================
  const [trades, setTrades] = useState<any[]>([])
  const [newTrade, setNewTrade] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    time: new Date().toTimeString().slice(0,5),
    instrument: '', 
    direction: 'long', 
    entryPrice: '', 
    exitPrice: '', 
    profitLoss: '', 
    riskAmount: '',
    rMultiple: '',
    accountId: 0,
    setupType: '',
    setupGrade: 'A',
    emotionBefore: 'neutral',
    emotionAfter: 'neutral',
    followedPlan: true,
    notes: '',
    screenshot: '',
    tags: [] as string[],
    session: 'london',
    holdingTime: '',
    mistakes: [] as string[]
  })
  const [tradingCalendarMonth, setTradingCalendarMonth] = useState(new Date())
  
  // ==================== TRADING SUB-TABS ====================
  const [tradingSubTab, setTradingSubTab] = useState<'today' | 'journal' | 'analytics' | 'accounts'>('today')
  const [showQuickTradeModal, setShowQuickTradeModal] = useState(false)
  const [quickTradeType, setQuickTradeType] = useState<'win' | 'loss' | null>(null)
  
  // ==================== PRE-SESSION ROUTINE ====================
  const [preSessionChecklist, setPreSessionChecklist] = useState([
    { id: 1, task: 'Review yesterday\'s trades', completed: false },
    { id: 2, task: 'Mark key support/resistance levels', completed: false },
    { id: 3, task: 'Check economic calendar', completed: false },
    { id: 4, task: 'Set daily profit/loss limits', completed: false },
    { id: 5, task: 'Mental state check - am I ready?', completed: false }
  ])
  const [dailyMentalState, setDailyMentalState] = useState<'great' | 'good' | 'okay' | 'tired' | 'stressed' | null>(null)
  
  // ==================== TRADING ROADMAP ====================
  const [tradingRoadmapGoal, setTradingRoadmapGoal] = useState({
    title: '',
    targetDate: '',
    type: 'prop_funded'
  })
  const [tradingRoadmapPhases, setTradingRoadmapPhases] = useState<any[]>([])
  const [roadmapProgress, setRoadmapProgress] = useState<{[key: string]: number}>({})
  
  // ==================== TRADE SETUPS/TAGS ====================
  const [tradeSetups, setTradeSetups] = useState<string[]>([
    'Trend Pullback', 'Breakout', 'Support/Resistance', 'Fibonacci',
    'Moving Average', 'Range Trade', 'News Trade', 'Reversal'
  ])
  const [tradeTags, setTradeTags] = useState<string[]>([
    'A+ Setup', 'Revenge Trade', 'FOMO Entry', 'Early Exit', 'Moved Stop', 'Perfect Execution'
  ])
  const [tradeMistakes, setTradeMistakes] = useState<string[]>([
    'Entered too early', 'Entered too late', 'Cut winner short', 'Let loser run',
    'Moved stop loss', 'No stop loss', 'Oversized position', 'Revenge trade', 'FOMO entry'
  ])
  const [showSetupManager, setShowSetupManager] = useState(false)
  const [newSetupName, setNewSetupName] = useState('')
  
  // ==================== TRADING ANALYTICS STATE ====================
  const [analyticsTab, setAnalyticsTab] = useState<'overview' | 'setups' | 'time' | 'psychology' | 'calendar'>('overview')
  const [analyticsDateRange, setAnalyticsDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [selectedAnalyticsAccount, setSelectedAnalyticsAccount] = useState<number | 'all'>('all')
  
  // ==================== CSV IMPORT FOR TRADES ====================
  const [showTradeImport, setShowTradeImport] = useState(false)
  const [importPlatform, setImportPlatform] = useState<'metatrader' | 'tradingview' | 'manual' | 'generic'>('generic')
  const [importedTrades, setImportedTrades] = useState<any[]>([])
  const tradeFileInputRef = useRef<HTMLInputElement>(null)
  
  // ==================== PROP FIRM PROFILES ====================
  const propFirmProfiles: {[key: string]: any} = {
    'FTMO': {
      name: 'FTMO',
      phases: {
        challenge: { profitTarget: 10, maxDrawdown: 10, dailyDrawdown: 5, minDays: 4, maxDays: 30 },
        verification: { profitTarget: 5, maxDrawdown: 10, dailyDrawdown: 5, minDays: 4, maxDays: 60 },
        funded: { maxDrawdown: 10, dailyDrawdown: 5, profitSplit: 80 }
      },
      rules: ['No trading during high-impact news', 'No holding trades over weekend', 'Stop loss required on all trades'],
      accountSizes: [10000, 25000, 50000, 100000, 200000]
    },
    'MyFundedFX': {
      name: 'MyFundedFX',
      phases: {
        evaluation: { profitTarget: 8, maxDrawdown: 8, dailyDrawdown: 5, minDays: 5, maxDays: null },
        funded: { maxDrawdown: 8, dailyDrawdown: 5, profitSplit: 80 }
      },
      rules: ['No news trading restrictions', 'Can hold over weekend', 'Scaling plan available'],
      accountSizes: [5000, 10000, 25000, 50000, 100000, 200000]
    },
    'Funded Next': {
      name: 'Funded Next',
      phases: {
        challenge: { profitTarget: 10, maxDrawdown: 10, dailyDrawdown: 5, minDays: null, maxDays: null },
        verification: { profitTarget: 5, maxDrawdown: 10, dailyDrawdown: 5, minDays: null, maxDays: null },
        funded: { maxDrawdown: 10, dailyDrawdown: 5, profitSplit: 90 }
      },
      rules: ['90% profit split', 'No time limits', 'News trading allowed', '15% consistency rule'],
      accountSizes: [6000, 15000, 25000, 50000, 100000, 200000]
    },
    'Personal': {
      name: 'Personal Account',
      phases: { active: { profitTarget: null, maxDrawdown: null, dailyDrawdown: null } },
      rules: ['Your money, your rules!', 'Risk 1-2% per trade recommended'],
      accountSizes: []
    },
    'TopStep': {
      name: 'TopStep',
      phases: {
        combine: { profitTarget: 6, maxDrawdown: 4, dailyDrawdown: 2, minDays: 0, maxDays: null },
        funded: { maxDrawdown: 4, dailyDrawdown: 2, profitSplit: 90 }
      },
      rules: ['Consistency rule applies', 'Must close by 3:10 PM CT', '90% profit split'],
      accountSizes: [50000, 100000, 150000]
    },
    'Custom': {
      name: 'Custom Prop Firm',
      phases: {
        challenge: { profitTarget: 10, maxDrawdown: 10, dailyDrawdown: 5, minDays: 0, maxDays: null },
        verification: { profitTarget: 5, maxDrawdown: 10, dailyDrawdown: 5, minDays: 0, maxDays: null },
        funded: { maxDrawdown: 10, dailyDrawdown: 5, profitSplit: 80 }
      },
      rules: ['Add your custom rules below'],
      accountSizes: [5000, 10000, 25000, 50000, 100000, 200000]
    }
  }
  
  // ==================== TRADING ACCOUNTS ====================
  const [tradingAccounts, setTradingAccounts] = useState<any[]>([])
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'personal',
    propFirm: '',
    phase: '',
    startingBalance: '',
    currentBalance: '',
    maxDrawdown: '',
    dailyDrawdown: '',
    profitTarget: '',
    riskPerTrade: '1',
    isActive: true,
    customRules: [] as string[],
    minTradingDays: '',
    maxTradingDays: '',
    consistencyRule: '',
    newsRestriction: false,
    weekendHolding: true,
    scalingPlan: false,
    profitSplit: ''
  })
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)
  const [showAddAccount, setShowAddAccount] = useState(false)
  
  // ==================== TRADING RULES ====================
  const [tradingRules, setTradingRules] = useState<any[]>([
    { id: 1, rule: 'Max 3 trades per day', enabled: true, category: 'risk' },
    { id: 2, rule: 'No trading after a loss', enabled: false, category: 'psychology' },
    { id: 3, rule: 'No trading in first 15 mins', enabled: true, category: 'timing' },
    { id: 4, rule: 'Stop loss on every trade', enabled: true, category: 'risk' },
    { id: 5, rule: 'No trading during news', enabled: true, category: 'timing' },
    { id: 6, rule: 'Max 1% risk per trade', enabled: true, category: 'risk' },
    { id: 7, rule: 'No revenge trading', enabled: true, category: 'psychology' },
    { id: 8, rule: 'Journal every trade', enabled: true, category: 'discipline' }
  ])
  
  // ==================== TRADING ROADMAP ====================
  const [tradingRoadmap, setTradingRoadmap] = useState<any[]>([])
  const [showAddTradingMilestone, setShowAddTradingMilestone] = useState(false)
  const [newTradingMilestone, setNewTradingMilestone] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    category: 'prop',
    icon: '🎯',
    notes: '',
    currentAmount: 0
  })
  
  // ==================== TRADE IDEA SETTINGS ====================
  const [tradeIdeaSettings, setTradeIdeaSettings] = useState({
    minRR: '3',
    maxRiskPercent: '1',
    preferredInstruments: [] as string[],
    tradingStyle: 'day'
  })
  
  // ==================== AI AGENT STATE ====================
  const [budgetMemory, setBudgetMemory] = useState<any>({
    name: '',
    onboardingComplete: false,
    currentStep: 'Baby Step 1'
  })
  
  const [tradingMemory, setTradingMemory] = useState<any>({
    name: '',
    onboardingComplete: false,
    tradingStyle: '',
    experience: '',
    instruments: [],
    psychology: { strengths: [], weaknesses: [], triggers: [] },
    preferences: { riskPerTrade: 1, maxTradesPerDay: 3 }
  })
  
  const [budgetOnboarding, setBudgetOnboarding] = useState({ isActive: false, step: 'greeting' })
  const [tradingOnboarding, setTradingOnboarding] = useState({ isActive: false, step: 'greeting' })
  
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string, image?: string}>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [proactiveInsight, setProactiveInsight] = useState<any>(null)
  
  // ==================== SHOW STATE ====================
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general'>('general')
  const [feedbackSent, setFeedbackSent] = useState(false)
  
  // ==================== COMPOUNDING CALCULATOR STATE ====================
  const [tradingCalculator, setTradingCalculator] = useState({
    currency: '$',
    startingCapital: '10000',
    returnRate: '0.5',
    returnPeriod: 'daily',
    years: '1',
    months: '0',
    days: '0',
    includeWeekends: false,
    includeDays: ['M', 'T', 'W', 'T2', 'F'],
    reinvestRate: '100',
    additionalContributions: 'none',
    depositAmount: '0',
    depositFrequency: 'monthly',
    withdrawAmount: '0',
    withdrawFrequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0]
  })
  const [compoundView, setCompoundView] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily')
  
  // ==================== COUNTRY SETTINGS ====================
  const [userCountry, setUserCountry] = useState<'AU' | 'US' | 'UK' | 'NZ' | 'CA'>('AU')
  
  const countryConfig: {[key: string]: any } = {
    AU: { name: 'Australia', flag: '🇦🇺', currency: 'AUD', currencySymbol: '$', retirement: 'Superannuation' },
    US: { name: 'United States', flag: '🇺🇸', currency: 'USD', currencySymbol: '$', retirement: '401(k), IRA' },
    UK: { name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', currencySymbol: '£', retirement: 'Workplace Pension' },
    NZ: { name: 'New Zealand', flag: '🇳🇿', currency: 'NZD', currencySymbol: '$', retirement: 'KiwiSaver' },
    CA: { name: 'Canada', flag: '🇨🇦', currency: 'CAD', currencySymbol: '$', retirement: 'RRSP, TFSA' }
  }
  
  const currentCountryConfig = countryConfig[userCountry]
  
  // ==================== HELPER FUNCTIONS ====================
  const todayStr = new Date().toISOString().split('T')[0]
  const totalPayouts = payouts.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0)
  
  const getBabyStep = () => ({ step: 1, title: 'Starter Emergency Fund', progress: 0, icon: '🛡️' })
  const currentBabyStep = getBabyStep()
  
  const totalPL = trades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)
  const winningTrades = trades.filter(t => parseFloat(t.profitLoss || '0') > 0)
  const losingTrades = trades.filter(t => parseFloat(t.profitLoss || '0') < 0)
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length * 100) : 0
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0) / winningTrades.length : 0
  const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0) / losingTrades.length) : 0
  
  const calculateTradingAnalytics = (accountFilter: number | 'all' = 'all', dateRange: string = '30d') => {
    let filteredTrades = [...trades]
    if (accountFilter !== 'all') {
      filteredTrades = filteredTrades.filter(t => t.accountId === accountFilter)
    }
    const daysMap: {[key: string]: number} = { '7d': 7, '30d': 30, '90d': 90, 'all': 9999 }
    const days = daysMap[dateRange] || 30
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    filteredTrades = filteredTrades.filter(t => new Date(t.date) >= cutoff)
    
    const emptyByDay: any = {}
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    dayNames.forEach(d => emptyByDay[d] = { trades: 0, wins: 0, pnl: 0 })
    
    if (filteredTrades.length === 0) {
      return { totalTrades: 0, winners: 0, losers: 0, winRate: 0, totalPnL: 0, avgWin: 0, avgLoss: 0, profitFactor: 0, bySetup: {}, byDay: emptyByDay, byHour: {}, bySession: {}, streaks: { currentStreak: 0 }, calendarData: {} }
    }
    
    const winners = filteredTrades.filter(t => parseFloat(t.profitLoss || '0') > 0)
    const losers = filteredTrades.filter(t => parseFloat(t.profitLoss || '0') < 0)
    const totalPnL = filteredTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)
    const totalWins = winners.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)
    const totalLosses = Math.abs(losers.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0))
    const winRate = filteredTrades.length > 0 ? (winners.length / filteredTrades.length) * 100 : 0
    
    const bySetup: any = {}
    filteredTrades.forEach(t => {
      const setup = t.setupType || 'Untagged'
      if (!bySetup[setup]) bySetup[setup] = { trades: 0, wins: 0, pnl: 0 }
      bySetup[setup].trades++
      if (parseFloat(t.profitLoss || '0') > 0) bySetup[setup].wins++
      bySetup[setup].pnl += parseFloat(t.profitLoss || '0')
    })
    
    const byDay: any = { ...emptyByDay }
    filteredTrades.forEach(t => {
      const day = dayNames[new Date(t.date).getDay()]
      byDay[day].trades++
      if (parseFloat(t.profitLoss || '0') > 0) byDay[day].wins++
      byDay[day].pnl += parseFloat(t.profitLoss || '0')
    })
    
    let currentStreak = 0
    const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    let tempWinStreak = 0, tempLoseStreak = 0
    sortedTrades.forEach(t => {
      const pnl = parseFloat(t.profitLoss || '0')
      if (pnl > 0) { tempWinStreak++; tempLoseStreak = 0 }
      else if (pnl < 0) { tempLoseStreak++; tempWinStreak = 0 }
    })
    if (sortedTrades.length > 0) {
      const lastPnL = parseFloat(sortedTrades[sortedTrades.length - 1].profitLoss || '0')
      currentStreak = lastPnL > 0 ? tempWinStreak : lastPnL < 0 ? -tempLoseStreak : 0
    }
    
    return { totalTrades: filteredTrades.length, winners: winners.length, losers: losers.length, winRate, totalPnL, avgWin: totalWins / (winners.length || 1), avgLoss: totalLosses / (losers.length || 1), profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0, bySetup, byDay, byHour: {}, bySession: {}, streaks: { currentStreak }, calendarData: {} }
  }
  
  const generateDailyInsight = () => {
    const analytics = calculateTradingAnalytics('all', '30d')
    const insights: string[] = []
    const setupStats = Object.entries(analytics.bySetup).sort((a, b) => (b[1].wins / b[1].trades) - (a[1].wins / a[1].trades))
    if (setupStats.length > 0 && setupStats[0][1].trades >= 3) {
      insights.push(`Your best setup is **${setupStats[0][0]}** with ${((setupStats[0][1].wins / setupStats[0][1].trades) * 100).toFixed(0)}% win rate.`)
    }
    if (analytics.streaks.currentStreak > 0) {
      insights.push(`You're on a **${analytics.streaks.currentStreak} win streak** 🔥`)
    } else if (analytics.streaks.currentStreak < -2) {
      insights.push(`You've had ${Math.abs(analytics.streaks.currentStreak)} losses in a row. Consider taking a break.`)
    }
    return insights.length > 0 ? insights : ['Log some trades to get personalized insights!']
  }
  
  const detectTilt = () => {
    const today = new Date().toISOString().split('T')[0]
    const todaysTrades = trades.filter(t => t.date === today)
    const recentLosses = todaysTrades.filter(t => parseFloat(t.profitLoss || '0') < 0)
    let tiltScore = 0
    if (recentLosses.length >= 2) tiltScore += 30
    if (todaysTrades.length > 5) tiltScore += 25
    return { tiltScore: Math.min(tiltScore, 100), todaysTrades: todaysTrades.length, todaysLosses: recentLosses.length }
  }
  
  const generateWeeklyReport = () => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekTrades = trades.filter(t => new Date(t.date) >= weekAgo)
    const weekPnL = weekTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)
    const weekWins = weekTrades.filter(t => parseFloat(t.profitLoss || '0') > 0)
    const weekWinRate = weekTrades.length > 0 ? (weekWins.length / weekTrades.length) * 100 : 0
    return { totalTrades: weekTrades.length, pnl: weekPnL, winRate: weekWinRate, wins: weekWins.length, losses: weekTrades.length - weekWins.length, rulesFollowed: 0 }
  }
  
  const addPayout = () => {
    if (!newPayout.amount) return
    setPayouts(prev => [...prev, { ...newPayout, id: Date.now(), amount: parseFloat(newPayout.amount) }])
    if (newPayout.addToIncome) {
      setIncomeStreams(prev => [...prev, { id: Date.now(), name: 'Trading Payout', amount: newPayout.amount, frequency: 'once', type: 'trading', startDate: newPayout.date }])
    }
    setNewPayout({ date: new Date().toISOString().split('T')[0], amount: '', accountId: 0, accountName: '', propFirm: '', notes: '', addToIncome: true })
    setShowPayoutModal(false)
  }
  
  const deletePayout = (id: number) => setPayouts(prev => prev.filter(p => p.id !== id))
  
  const addTrade = () => {
    if (!newTrade.instrument) return
    const tradeWithId = { ...newTrade, id: Date.now() }
    setTrades(prev => [...prev, tradeWithId])
    if (newTrade.accountId && newTrade.accountId > 0) {
      const pnl = parseFloat(newTrade.profitLoss) || 0
      setTradingAccounts(prev => prev.map(acc => acc.id === newTrade.accountId ? { ...acc, currentBalance: (parseFloat(acc.currentBalance || '0') + pnl).toString() } : acc))
    }
    setNewTrade({ date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().slice(0,5), instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', riskAmount: '', rMultiple: '', accountId: newTrade.accountId, setupType: '', setupGrade: 'A', emotionBefore: 'neutral', emotionAfter: 'neutral', followedPlan: true, notes: '', screenshot: '', tags: [], session: 'london', holdingTime: '', mistakes: [] })
  }
  
  const deleteTrade = (id: number) => {
    const trade = trades.find(t => t.id === id)
    if (trade && trade.accountId && trade.accountId > 0) {
      const pnl = parseFloat(trade.profitLoss) || 0
      setTradingAccounts(prev => prev.map(acc => acc.id === trade.accountId ? { ...acc, currentBalance: (parseFloat(acc.currentBalance || '0') - pnl).toString() } : acc))
    }
    setTrades(trades.filter(t => t.id !== id))
  }
  
  const addToRoadmap = (name: string, category: string, targetAmount: string | number, icon: string, notes?: string, currentAmount?: number, linkedGoalId?: number) => {
    if (roadmapMilestones.some(m => m.name.toLowerCase() === name.toLowerCase())) {
      alert(`"${name}" is already in your roadmap!`)
      return
    }
    setRoadmapMilestones(prev => [...prev, { id: Date.now(), name, category, icon, targetAmount: typeof targetAmount === 'number' ? targetAmount.toString() : targetAmount, currentAmount: currentAmount || 0, targetDate: '', notes: notes || '', completed: false, createdAt: new Date().toISOString(), linkedGoalId: linkedGoalId || null }])
    alert(`✅ Added "${name}" to your roadmap!`)
  }
  
  const parseTradeCSV = (csvText: string, platform: string) => {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
    const trades: any[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const row: {[key: string]: string} = {}
      headers.forEach((h, idx) => row[h] = values[idx] || '')
      let trade: any = { id: Date.now() + i, date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', profitLoss: '', riskAmount: '', setupType: '', notes: 'Imported', selected: true }
      trade.date = row['date'] || row['time'] || row['datetime'] || ''
      trade.instrument = row['symbol'] || row['instrument'] || row['ticker'] || row['pair'] || ''
      trade.direction = (row['direction'] || row['side'] || row['type'] || '').toLowerCase().includes('sell') ? 'short' : 'long'
      trade.profitLoss = row['pnl'] || row['profit'] || row['profit/loss'] || ''
      if (trade.instrument || trade.profitLoss) trades.push(trade)
    }
    return trades
  }
  
  const handleTradeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setImportedTrades(parseTradeCSV(text, importPlatform))
    }
    reader.readAsText(file)
  }
  
  const confirmTradeImport = () => {
    const selected = importedTrades.filter(t => t.selected)
    setTrades(prev => [...prev, ...selected.map(t => ({ ...t, id: Date.now() + Math.random(), selected: undefined }))])
    setImportedTrades([])
    setShowTradeImport(false)
  }
  
  const calculateTradingCompound = () => {
    const capital = parseFloat(tradingCalculator.startingCapital) || 0
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
    const startDate = new Date(tradingCalculator.startDate || Date.now())
    let currentDate = new Date(startDate)
    
    for (let d = 0; d < totalCalendarDays; d++) {
      const dayOfWeek = currentDate.getDay()
      const dayMap: {[key: string]: number} = { 'M': 1, 'T': 2, 'W': 3, 'T2': 4, 'F': 5, 'S': 6, 'S2': 0 }
      const isActiveDay = tradingCalculator.includeDays.some(d => dayMap[d] === dayOfWeek) || (tradingCalculator.includeWeekends && (dayOfWeek === 0 || dayOfWeek === 6))
      if (isActiveDay) {
        balance += balance * rate * reinvest
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + totalCalendarDays)
    return { futureValue: balance, totalContributed, profit: balance - totalContributed, totalCalendarDays, totalTradingDays, endDate, breakdown: [] }
  }
  
  const tradingResults = calculateTradingCompound()
  
  const forexPropResults = { progressPercent: 0, remainingProfit: 0, drawdownRemaining: 0 }
  const futuresPropResults = { progressPercent: 0, remainingProfit: 0, drawdownRemaining: 0 }
  
  // ==================== AI FUNCTIONS ====================
  const sendQuickMessage = async (message: string) => {
    if (!message.trim() || isLoading) return
    setChatMessages(prev => [...prev, { role: 'user', content: message }])
    setChatInput('')
    setIsLoading(true)
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "I'm here to help with your trading journey! What would you like to know?" }])
      setIsLoading(false)
    }, 500)
  }
  
  const handleChatMessage = async () => {
    if ((!chatInput.trim() && !pendingChartImage) || isLoading) return
    const message = chatInput.trim()
    if (tradingOnboarding.isActive) {
      setChatMessages(prev => [...prev, { role: 'user', content: message }])
      setChatInput('')
      setIsLoading(true)
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: 'assistant', content: "Great! Let's continue setting up your trading profile. What's your trading experience level? (beginner/intermediate/advanced)" }])
        setIsLoading(false)
      }, 500)
      return
    }
    setChatMessages(prev => [...prev, { role: 'user', content: pendingChartImage ? `${message}\n[📊 Chart image attached]` : message, image: pendingChartImage || undefined }])
    setPendingChartImage(null)
    setChatInput('')
    setIsLoading(true)
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Thanks for your message! I'm analyzing your trading data. Based on your history, focus on maintaining discipline and sticking to your rules. Want me to analyze a specific aspect of your trading?" }])
      setIsLoading(false)
    }, 800)
  }
  
  const handleChartUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })
    setPendingChartImage(base64)
  }
  
  const handleModeSelect = (mode: 'budget' | 'trading') => {
    setAppMode(mode)
    setShowModeSelector(false)
    setActiveTab('trading')
    if (mode === 'trading' && !tradingMemory.onboardingComplete && !tradingTourCompleted) {
      setShowTour(true)
    } else if (mode === 'trading' && !tradingMemory.onboardingComplete) {
      setTradingOnboarding({ isActive: true, step: 'greeting' })
      setChatMessages([{ role: 'assistant', content: "Hey! 📈 I'm Aureus, your trading operations coach.\n\nI'll help you optimize capital deployment, maintain psychological discipline, and systematically scale your accounts.\n\nWhat's your name?" }])
    }
  }
  
  const FEEDBACK_EMAIL = 'your-email@example.com'
  const LEMONSQUEEZY_URLS = { pro_monthly: '#', pro_annual: '#', customer_portal: '#' }
  
  const canUseAI = () => ({ allowed: true, remaining: Infinity })
  const trackAIUsage = () => {}
  
  // ==================== THEME ====================
  const theme = {
    bg: darkMode ? '#0f172a' : '#f8fafc',
    cardBg: darkMode ? '#1e293b' : 'white',
    text: darkMode ? '#f1f5f9' : '#1e293b',
    textMuted: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#e2e8f0',
    input: darkMode ? '#334155' : '#ffffff',
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
  const btnWarning: React.CSSProperties = { ...btnPrimary, background: theme.warning }
  const cardStyle: React.CSSProperties = { padding: '24px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }
  
  const inputStyleWithBorder = { ...inputStyle, border: `2px solid ${theme.inputBorder}` } as React.CSSProperties
  
  // ==================== TOUR STEPS ====================
  const tradingTourSteps = [
    { title: "Welcome, Trader! 📈", content: "I'm Aureus, your AI trading mentor. I'll help you stay disciplined, track your psychology, manage prop firm challenges, and compound your personal account.", icon: "✨" },
    { title: "Prop Firm Mastery 🏆", content: "I know the rules for FTMO, MyFundedFX, Funded Next, and more. I'll track your progress, warn you about drawdown limits, and keep you compliant.", icon: "🏆" },
    { title: "Psychology & Tilt Detection 🧠", content: "Trading is 80% psychology. I monitor for revenge trading, overtrading, and emotional decisions.", icon: "🧠" },
    { title: "Let's Build Your Edge! 🚀", content: "I'll learn your trading style, experience level, and psychological weaknesses. Then I'll be your accountability partner every trading day.", icon: "💬" }
  ]
  
  const tourSteps = tradingTourSteps
  
  // ==================== LOAD/SAVE ====================
  useEffect(() => {
    const saved = localStorage.getItem('aureus_trading_data')
    if (saved) {
      const data = JSON.parse(saved)
      if (data.trades) setTrades(data.trades)
      if (data.tradingAccounts) setTradingAccounts(data.tradingAccounts)
      if (data.tradingRules) setTradingRules(data.tradingRules)
      if (data.tradingMemory) setTradingMemory(data.tradingMemory)
      if (data.payouts) setPayouts(data.payouts)
      if (data.tradingRoadmap) setTradingRoadmap(data.tradingRoadmap)
      if (data.tradeSetups) setTradeSetups(data.tradeSetups)
      if (data.tradeTags) setTradeTags(data.tradeTags)
      if (data.tradeMistakes) setTradeMistakes(data.tradeMistakes)
    }
  }, [])
  
  useEffect(() => {
    localStorage.setItem('aureus_trading_data', JSON.stringify({
      trades, tradingAccounts, tradingRules, tradingMemory, payouts, tradingRoadmap,
      tradeSetups, tradeTags, tradeMistakes
    }))
  }, [trades, tradingAccounts, tradingRules, tradingMemory, payouts, tradingRoadmap, tradeSetups, tradeTags, tradeMistakes])
  
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])
  
  // ==================== RENDER: TOUR ====================
  if (showTour) {
    const currentTourStep = tourSteps[tourStep]
    return (
      <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '600px', width: '100%', background: theme.cardBg, borderRadius: '24px', padding: '48px', textAlign: 'center' as React.CSSProperties }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
            {tourSteps.map((_, i) => (
              <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i === tourStep ? theme.warning : theme.border }} />
            ))}
          </div>
          <div style={{ fontSize: '72px', marginBottom: '24px' }}>{currentTourStep.icon}</div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: theme.text, margin: '0 0 16px 0' }}>{currentTourStep.title}</h1>
          <p style={{ fontSize: '16px', color: theme.textMuted, lineHeight: 1.7, margin: '0 0 32px 0' }}>{currentTourStep.content}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {tourStep > 0 && <button onClick={() => setTourStep(tourStep - 1)} style={{ padding: '14px 28px', background: 'transparent', border: '2px solid ' + theme.border, borderRadius: '12px', color: theme.textMuted, cursor: 'pointer', fontWeight: 600 }}>← Back</button>}
            {tourStep < tourSteps.length - 1 ? (
              <button onClick={() => setTourStep(tourStep + 1)} style={{ padding: '14px 28px', background: theme.warning, border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Next →</button>
            ) : (
              <button onClick={() => { setShowTour(false); setTradingTourCompleted(true); setTradingOnboarding({ isActive: true, step: 'greeting' }); setChatMessages([{ role: 'assistant', content: "Hey! 📈 I'm Aureus, your trading operations coach.\n\nI'll help you optimize capital deployment, maintain psychological discipline, and systematically scale your accounts.\n\nWhat's your name?" }]) }} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '16px' }}>Let's Go! 🚀</button>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  // ==================== RENDER: MODE SELECTOR ====================
  if (showModeSelector) {
    return (
      <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
            <span style={{ color: '#78350f', fontWeight: 800, fontSize: '40px' }}>A</span>
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: 800, color: theme.text, margin: '0 0 12px 0' }}>Welcome to Aureus</h1>
          <p style={{ fontSize: '18px', color: theme.textMuted }}>Optimize the tool we call money</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '700px', width: '100%' }}>
          <button onClick={() => handleModeSelect('budget')} style={{ padding: '32px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '24px', border: 'none', cursor: 'pointer', textAlign: 'left' as React.CSSProperties }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
            <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>Budget Mode</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Optimize your financial operations</p>
          </button>
          <button onClick={() => handleModeSelect('trading')} style={{ padding: '32px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '24px', border: 'none', cursor: 'pointer', textAlign: 'left' as React.CSSProperties }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📈</div>
            <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>Trading Mode</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Master your trading operations</p>
          </button>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} style={{ marginTop: '32px', padding: '12px 24px', background: 'transparent', border: '2px solid ' + theme.border, borderRadius: '12px', color: theme.textMuted, cursor: 'pointer' }}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
      </div>
    )
  }
  
  // ==================== RENDER: MAIN APP ====================
  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      {/* Header */}
      <header style={{ padding: '12px 24px', background: theme.cardBg, borderBottom: '1px solid ' + theme.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky' as React.CSSProperties, top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fcd34d' }}>
            <span style={{ color: '#78350f', fontWeight: 800, fontSize: '18px' }}>A</span>
          </div>
          <span style={{ color: theme.text, fontWeight: 700, fontSize: '20px' }}>Aureus</span>
          <button onClick={() => setShowModeSelector(true)} style={{ padding: '6px 12px', background: theme.warning + '20', color: theme.warning, border: '1px solid ' + theme.warning, borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>📈 Trading ▼</button>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => { setActiveTab('trading'); setTradingSubTab('today') }} style={{ padding: '8px 14px', background: activeTab === 'trading' && tradingSubTab === 'today' ? theme.warning : 'transparent', color: activeTab === 'trading' && tradingSubTab === 'today' ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>🏠 Today</button>
          <button onClick={() => { setActiveTab('trading'); setTradingSubTab('journal') }} style={{ padding: '8px 14px', background: activeTab === 'trading' && tradingSubTab === 'journal' ? theme.warning : 'transparent', color: activeTab === 'trading' && tradingSubTab === 'journal' ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>📓 Journal</button>
          <button onClick={() => { setActiveTab('trading'); setTradingSubTab('analytics') }} style={{ padding: '8px 14px', background: activeTab === 'trading' && tradingSubTab === 'analytics' ? theme.warning : 'transparent', color: activeTab === 'trading' && tradingSubTab === 'analytics' ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>📊 Analytics</button>
          <button onClick={() => { setActiveTab('trading'); setTradingSubTab('accounts') }} style={{ padding: '8px 14px', background: activeTab === 'trading' && tradingSubTab === 'accounts' ? theme.warning : 'transparent', color: activeTab === 'trading' && tradingSubTab === 'accounts' ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>💼 Accounts</button>
          <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text }}>{darkMode ? '☀️' : '🌙'}</button>
          <select value={userCountry} onChange={e => setUserCountry(e.target.value as any)} style={{ padding: '6px 10px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text, fontSize: '14px' }}>
            <option value="AU">🇦🇺 AU</option>
            <option value="US">🇺🇸 US</option>
            <option value="UK">🇬🇧 UK</option>
            <option value="NZ">🇳🇿 NZ</option>
            <option value="CA">🇨🇦 CA</option>
          </select>
          <button onClick={() => setShowPricingModal(true)} style={{ padding: '6px 14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>⚡ Upgrade</button>
        </div>
      </header>
      
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        
        {/* TRADING TAB */}
        {appMode === 'trading' && activeTab === 'trading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* TODAY TAB */}
            {tradingSubTab === 'today' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '24px', background: `linear-gradient(135deg, ${theme.warning}20, ${theme.purple}20)`, borderRadius: '16px', border: '2px solid ' + theme.warning }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h2 style={{ margin: '0 0 4px 0', color: theme.text, fontSize: '24px' }}>{new Date().getHours() < 12 ? '☀️ Good morning!' : new Date().getHours() < 17 ? '🌤️ Good afternoon!' : '🌙 Good evening!'}</h2>
                      <div style={{ color: theme.textMuted, fontSize: '14px' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                    <button onClick={() => setShowQuickTradeModal(true)} style={{ padding: '14px 24px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '15px' }}>+ Log Trade</button>
                  </div>
                  <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', borderLeft: '4px solid ' + theme.warning }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#78350f' }}>A</div>
                      <span style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>Aureus Daily Insight</span>
                    </div>
                    <div style={{ color: theme.text, fontSize: '14px', lineHeight: 1.6 }}>
                      {generateDailyInsight().map((insight, i) => <p key={i} style={{ margin: i === 0 ? 0 : '8px 0 0 0' }}>{insight}</p>)}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {(() => {
                    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
                    const weekTrades = trades.filter(t => new Date(t.date) >= weekAgo)
                    const weekPnL = weekTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)
                    const weekWins = weekTrades.filter(t => parseFloat(t.profitLoss || '0') > 0).length
                    const todayTrades = trades.filter(t => t.date === todayStr)
                    const todayPnL = todayTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)
                    const analytics = calculateTradingAnalytics('all', '30d')
                    return (
                      <>
                        <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as React.CSSProperties }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>TODAY</div>
                          <div style={{ color: todayPnL >= 0 ? theme.success : theme.danger, fontSize: '22px', fontWeight: 700 }}>{todayPnL >= 0 ? '+' : ''}${todayPnL.toFixed(0)}</div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>{todayTrades.length} trades</div>
                        </div>
                        <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as React.CSSProperties }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>THIS WEEK</div>
                          <div style={{ color: weekPnL >= 0 ? theme.success : theme.danger, fontSize: '22px', fontWeight: 700 }}>{weekPnL >= 0 ? '+' : ''}${weekPnL.toFixed(0)}</div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>{weekWins}W / {weekTrades.length - weekWins}L</div>
                        </div>
                        <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as React.CSSProperties }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>WIN RATE</div>
                          <div style={{ color: winRate >= 50 ? theme.success : theme.danger, fontSize: '22px', fontWeight: 700 }}>{winRate.toFixed(0)}%</div>
                        </div>
                        <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as React.CSSProperties }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>STREAK</div>
                          <div style={{ color: analytics.streaks.currentStreak >= 0 ? theme.success : theme.danger, fontSize: '22px', fontWeight: 700 }}>{analytics.streaks.currentStreak > 0 ? '+' : ''}{analytics.streaks.currentStreak}</div>
                        </div>
                      </>
                    )
                  })()}
                </div>
                
                {(() => {
                  const tilt = detectTilt()
                  return (
                    <div style={{ padding: '16px 20px', background: tilt.tiltScore > 50 ? theme.danger + '20' : theme.success + '20', borderRadius: '12px', border: '2px solid ' + (tilt.tiltScore > 50 ? theme.danger : theme.success), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '28px' }}>{tilt.tiltScore > 70 ? '🚨' : tilt.tiltScore > 40 ? '⚠️' : '✅'}</div>
                        <div><div style={{ color: theme.text, fontWeight: 600 }}>{tilt.tiltScore > 70 ? 'HIGH TILT - Step Away!' : tilt.tiltScore > 40 ? 'Caution' : 'Clear to Trade'}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{tilt.todaysTrades} trades today • {tilt.todaysLosses} losses</div></div>
                      </div>
                      <div style={{ color: tilt.tiltScore > 50 ? theme.danger : theme.success, fontSize: '24px', fontWeight: 700 }}>{tilt.tiltScore}%</div>
                    </div>
                  )
                })()}
                
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, color: theme.text, fontSize: '16px' }}>📋 Pre-Session Checklist</h3>
                    <div style={{ color: theme.textMuted, fontSize: '12px' }}>{preSessionChecklist.filter(i => i.completed).length}/{preSessionChecklist.length} complete</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {preSessionChecklist.map(item => (
                      <div key={item.id} onClick={() => setPreSessionChecklist(preSessionChecklist.map(i => i.id === item.id ? { ...i, completed: !i.completed } : i))} style={{ padding: '12px 16px', background: item.completed ? theme.success + '20' : (darkMode ? '#1e293b' : '#f8fafc'), borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: item.completed ? theme.success : theme.border, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>{item.completed ? '✓' : ''}</div>
                        <span style={{ color: theme.text, fontSize: '14px', textDecoration: item.completed ? 'line-through' : 'none' }}>{item.task}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '16px', padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ color: theme.text, fontWeight: 600, fontSize: '13px', marginBottom: '12px' }}>How are you feeling?</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as React.CSSProperties }}>
                      {[{ key: 'great', emoji: '😎', label: 'Great' }, { key: 'good', emoji: '🙂', label: 'Good' }, { key: 'okay', emoji: '😐', label: 'Okay' }, { key: 'tired', emoji: '😴', label: 'Tired' }, { key: 'stressed', emoji: '😰', label: 'Stressed' }].map(mood => (
                        <button key={mood.key} onClick={() => setDailyMentalState(mood.key as any)} style={{ padding: '8px 16px', background: dailyMentalState === mood.key ? theme.warning + '30' : theme.cardBg, border: `2px solid ${dailyMentalState === mood.key ? theme.warning : theme.border}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '18px' }}>{mood.emoji}</span><span style={{ color: theme.text, fontSize: '13px' }}>{mood.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div style={{ padding: '20px', background: `linear-gradient(135deg, ${theme.purple}20, ${theme.accent}20)`, borderRadius: '16px', border: '2px solid ' + theme.purple }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '24px' }}>📈</span><div><div style={{ color: theme.text, fontWeight: 600 }}>Weekly Report</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>Last 7 days performance</div></div></div>
                    <button onClick={() => { const report = generateWeeklyReport(); sendQuickMessage(`Give me my weekly trading report. My stats: ${report.pnl >= 0 ? '+' : ''}$${report.pnl.toFixed(0)} P&L, ${report.winRate.toFixed(0)}% win rate`) }} style={{ padding: '10px 20px', background: theme.purple, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>🤖 Get AI Report</button>
                  </div>
                  {(() => {
                    const report = generateWeeklyReport()
                    return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                      <div style={{ padding: '12px', background: theme.cardBg, borderRadius: '8px', textAlign: 'center' as React.CSSProperties }}><div style={{ color: theme.textMuted, fontSize: '11px' }}>P&L</div><div style={{ color: report.pnl >= 0 ? theme.success : theme.danger, fontSize: '18px', fontWeight: 700 }}>{report.pnl >= 0 ? '+' : ''}${report.pnl.toFixed(0)}</div></div>
                      <div style={{ padding: '12px', background: theme.cardBg, borderRadius: '8px', textAlign: 'center' as React.CSSProperties }}><div style={{ color: theme.textMuted, fontSize: '11px' }}>Win Rate</div><div style={{ color: report.winRate >= 50 ? theme.success : theme.warning, fontSize: '18px', fontWeight: 700 }}>{report.winRate.toFixed(0)}%</div></div>
                      <div style={{ padding: '12px', background: theme.cardBg, borderRadius: '8px', textAlign: 'center' as React.CSSProperties }}><div style={{ color: theme.textMuted, fontSize: '11px' }}>Trades</div><div style={{ color: theme.text, fontSize: '18px', fontWeight: 700 }}>{report.wins}W / {report.losses}L</div></div>
                      <div style={{ padding: '12px', background: theme.cardBg, borderRadius: '8px', textAlign: 'center' as React.CSSProperties }}><div style={{ color: theme.textMuted, fontSize: '11px' }}>Rules Followed</div><div style={{ color: report.rulesFollowed >= 80 ? theme.success : report.rulesFollowed >= 50 ? theme.warning : theme.danger, fontSize: '18px', fontWeight: 700 }}>{report.rulesFollowed.toFixed(0)}%</div></div>
                    </div>
                  })()}
                </div>
                
                <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}><div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: '#78350f' }}>A</div><div style={{ color: theme.text, fontWeight: 600 }}>Ask Aureus</div></div>
                  {pendingChartImage && <div style={{ marginBottom: '12px', padding: '8px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}><img src={pendingChartImage} alt="Chart" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /><span style={{ color: theme.text, fontSize: '12px', flex: 1 }}>📊 Chart attached</span><button onClick={() => setPendingChartImage(null)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>×</button></div>}
                  {chatMessages.length > 0 && <div ref={chatContainerRef} style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px', padding: '8px', background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                    {chatMessages.map((msg, idx) => <div key={idx} style={{ marginBottom: '10px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}><div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: msg.role === 'user' ? theme.warning : (darkMode ? '#1e293b' : '#f8fafc'), color: msg.role === 'user' ? 'white' : theme.text, fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-wrap' as React.CSSProperties }}>{msg.content}</div></div>)}
                    {isLoading && <div style={{ display: 'flex', gap: '4px', padding: '10px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite' }} /><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.2s' }} /><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.4s' }} /></div>}
                  </div>}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="file" ref={chartInputRef} accept="image/*" onChange={handleChartUpload} style={{ display: 'none' }} />
                    <button onClick={() => chartInputRef.current?.click()} style={{ padding: '10px 12px', background: darkMode ? '#1e293b' : '#f8fafc', color: theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }} title="Upload chart">📷</button>
                    <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChatMessage()} placeholder={pendingChartImage ? "What should I analyze?" : "Ask about your trading, analyze a chart..."} style={{ ...inputStyle, flex: 1, padding: '10px 14px', fontSize: '13px' }} disabled={isLoading} />
                    <button onClick={handleChatMessage} disabled={isLoading || (!chatInput.trim() && !pendingChartImage)} style={{ padding: '10px 16px', background: theme.warning, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', opacity: isLoading || (!chatInput.trim() && !pendingChartImage) ? 0.5 : 1 }}>{isLoading ? '...' : 'Send'}</button>
                  </div>
                </div>
                
                {(() => {
                  const todayTrades = trades.filter(t => t.date === todayStr)
                  if (todayTrades.length === 0) return null
                  return <div style={cardStyle}><h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '16px' }}>📈 Today's Trades</h3><div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{todayTrades.map(trade => <div key={trade.id} style={{ padding: '12px 16px', background: parseFloat(trade.profitLoss) >= 0 ? theme.success + '15' : theme.danger + '15', borderRadius: '8px', borderLeft: `4px solid ${parseFloat(trade.profitLoss) >= 0 ? theme.success : theme.danger}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: parseFloat(trade.profitLoss) >= 0 ? theme.success : theme.danger, fontWeight: 700 }}>{parseFloat(trade.profitLoss) >= 0 ? '🟢' : '🔴'} {trade.instrument}</span><span style={{ color: theme.textMuted, fontSize: '12px' }}>{trade.time}</span></div><div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>{trade.setupType || 'No setup'} • {trade.direction}</div></div><div style={{ textAlign: 'right' as React.CSSProperties }}><div style={{ color: parseFloat(trade.profitLoss) >= 0 ? theme.success : theme.danger, fontWeight: 700, fontSize: '18px' }}>{parseFloat(trade.profitLoss) >= 0 ? '+' : ''}${parseFloat(trade.profitLoss).toFixed(0)}</div>{trade.rMultiple && <div style={{ color: theme.textMuted, fontSize: '11px' }}>{trade.rMultiple}R</div>}</div></div>)}</div></div>
                })()}
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <button onClick={() => setTradingSubTab('journal')} style={{ padding: '16px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as React.CSSProperties }}><div style={{ fontSize: '24px', marginBottom: '8px' }}>📓</div><div style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>Journal</div></button>
                  <button onClick={() => setTradingSubTab('analytics')} style={{ padding: '16px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as React.CSSProperties }}><div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div><div style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>Analytics</div></button>
                  <button onClick={() => setShowTradeImport(true)} style={{ padding: '16px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as React.CSSProperties }}><div style={{ fontSize: '24px', marginBottom: '8px' }}>📥</div><div style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>Import</div></button>
                  <button onClick={() => setShowPayoutModal(true)} style={{ padding: '16px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as React.CSSProperties }}><div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div><div style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>Payout</div></button>
                </div>
              </div>
            )}
            
            {/* JOURNAL TAB */}
            {tradingSubTab === 'journal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => { setQuickTradeType('win'); setShowQuickTradeModal(true) }} style={{ flex: 1, padding: '20px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}><span style={{ fontSize: '28px' }}>🟢</span><span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>Log Win</span></button>
                  <button onClick={() => { setQuickTradeType('loss'); setShowQuickTradeModal(true) }} style={{ flex: 1, padding: '20px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}><span style={{ fontSize: '28px' }}>🔴</span><span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>Log Loss</span></button>
                </div>
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, color: theme.text }}>📓 Trade Journal</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select value={analyticsDateRange} onChange={e => setAnalyticsDateRange(e.target.value as any)} style={{ ...inputStyle, padding: '6px 12px', fontSize: '12px' }}><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option><option value="all">All time</option></select>
                      <button onClick={() => setShowTradeImport(true)} style={{ padding: '6px 12px', background: theme.accent, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>📥 Import</button>
                    </div>
                  </div>
                  {trades.length === 0 ? <div style={{ padding: '60px 20px', textAlign: 'center' as React.CSSProperties }}><div style={{ fontSize: '48px', marginBottom: '16px' }}>📓</div><h3 style={{ color: theme.text, margin: '0 0 8px 0' }}>No Trades Yet</h3><p style={{ color: theme.textMuted, margin: '0 0 20px 0' }}>Start logging your trades to track your performance.</p><button onClick={() => setShowQuickTradeModal(true)} style={{ padding: '12px 24px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Log Your First Trade</button></div> : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' as React.CSSProperties }}>{trades.filter(t => { const d = new Date(t.date); const cutoff = new Date(Date.now() - ({ '7d': 7, '30d': 30, '90d': 90 }[analyticsDateRange] || 30) * 24 * 60 * 60 * 1000); return d >= cutoff }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(trade => <div key={trade.id} style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', borderLeft: `4px solid ${parseFloat(trade.profitLoss) >= 0 ? theme.success : theme.danger}` }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><div><div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><span style={{ color: parseFloat(trade.profitLoss) >= 0 ? theme.success : theme.danger, fontWeight: 700, fontSize: '16px' }}>{parseFloat(trade.profitLoss) >= 0 ? '🟢' : '🔴'} {trade.instrument || 'Unknown'}</span><span style={{ color: theme.textMuted, fontSize: '12px' }}>{trade.direction}</span>{trade.setupType && <span style={{ padding: '2px 8px', background: theme.accent + '20', color: theme.accent, borderRadius: '4px', fontSize: '11px' }}>{trade.setupType}</span>}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{trade.date} {trade.time && `• ${trade.time}`} • Grade: {trade.setupGrade}{trade.emotionBefore && trade.emotionBefore !== 'neutral' && ` • Felt: ${trade.emotionBefore}`}</div>{trade.notes && <div style={{ color: theme.text, fontSize: '13px', marginTop: '8px', fontStyle: 'italic' }}>"{trade.notes}"</div>}</div><div style={{ textAlign: 'right' as React.CSSProperties }}><div style={{ color: parseFloat(trade.profitLoss) >= 0 ? theme.success : theme.danger, fontWeight: 700, fontSize: '20px' }}>{parseFloat(trade.profitLoss) >= 0 ? '+' : ''}${parseFloat(trade.profitLoss).toFixed(2)}</div>{trade.rMultiple && <div style={{ color: theme.textMuted, fontSize: '12px' }}>{trade.rMultiple}R</div>}<button onClick={() => deleteTrade(trade.id)} style={{ marginTop: '8px', padding: '4px 8px', background: theme.danger + '20', color: theme.danger, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button></div></div></div>)}</div>}
                </div>
              </div>
            )}
            
            {/* ANALYTICS TAB */}
            {tradingSubTab === 'analytics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as React.CSSProperties }}>
                      {[{ key: 'overview', label: '📊 Overview' }, { key: 'calendar', label: '📅 Calendar' }, { key: 'setups', label: '🎯 Setups' }, { key: 'time', label: '⏰ Time' }, { key: 'psychology', label: '🧠 Psychology' }].map(tab => <button key={tab.key} onClick={() => setAnalyticsTab(tab.key as any)} style={{ padding: '8px 16px', background: analyticsTab === tab.key ? theme.warning : (darkMode ? '#1e293b' : '#f8fafc'), color: analyticsTab === tab.key ? 'white' : theme.text, border: '1px solid ' + (analyticsTab === tab.key ? theme.warning : theme.border), borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>{tab.label}</button>)}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select value={analyticsDateRange} onChange={e => setAnalyticsDateRange(e.target.value as any)} style={{ ...inputStyle, padding: '6px 12px', fontSize: '12px' }}><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option><option value="all">All time</option></select>
                      {tradingAccounts.length > 0 && <select value={selectedAnalyticsAccount === 'all' ? 'all' : selectedAnalyticsAccount} onChange={e => setSelectedAnalyticsAccount(e.target.value === 'all' ? 'all' : parseInt(e.target.value))} style={{ ...inputStyle, padding: '6px 12px', fontSize: '12px' }}><option value="all">All Accounts</option>{tradingAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}</select>}
                    </div>
                  </div>
                </div>
                
                {analyticsTab === 'overview' && (() => {
                  const analytics = calculateTradingAnalytics(selectedAnalyticsAccount, analyticsDateRange)
                  return <div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as React.CSSProperties }}><div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Total P&L</div><div style={{ color: analytics.totalPnL >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>${analytics.totalPnL.toFixed(0)}</div></div>
                    <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as React.CSSProperties }}><div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Win Rate</div><div style={{ color: analytics.winRate >= 50 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>{analytics.winRate.toFixed(1)}%</div></div>
                    <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as React.CSSProperties }}><div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Profit Factor</div><div style={{ color: analytics.profitFactor >= 1 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>{analytics.profitFactor === Infinity ? '∞' : analytics.profitFactor.toFixed(2)}</div></div>
                    <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as React.CSSProperties }}><div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Expectancy</div><div style={{ color: analytics.expectancy >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>${analytics.expectancy.toFixed(0)}</div></div>
                    <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as React.CSSProperties }}><div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Avg R-Multiple</div><div style={{ color: analytics.avgRMultiple >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>{analytics.avgRMultiple.toFixed(2)}R</div></div>
                    <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as React.CSSProperties }}><div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Streak</div><div style={{ color: analytics.streaks.currentStreak >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>{analytics.streaks.currentStreak > 0 ? '+' : ''}{analytics.streaks.currentStreak}</div></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ padding: '12px', background: theme.success + '20', borderRadius: '8px' }}><div style={{ color: theme.success, fontSize: '12px' }}>Winners</div><div style={{ color: theme.text, fontSize: '20px', fontWeight: 700 }}>{analytics.winners} <span style={{ fontSize: '12px', color: theme.textMuted }}>trades</span></div><div style={{ color: theme.success, fontSize: '13px' }}>Avg: ${analytics.avgWin.toFixed(0)}</div></div>
                    <div style={{ padding: '12px', background: theme.danger + '20', borderRadius: '8px' }}><div style={{ color: theme.danger, fontSize: '12px' }}>Losers</div><div style={{ color: theme.text, fontSize: '20px', fontWeight: 700 }}>{analytics.losers} <span style={{ fontSize: '12px', color: theme.textMuted }}>trades</span></div><div style={{ color: theme.danger, fontSize: '13px' }}>Avg: ${analytics.avgLoss.toFixed(0)}</div></div>
                    <div style={{ padding: '12px', background: theme.purple + '20', borderRadius: '8px' }}><div style={{ color: theme.purple, fontSize: '12px' }}>Total Trades</div><div style={{ color: theme.text, fontSize: '20px', fontWeight: 700 }}>{analytics.totalTrades}</div><div style={{ color: theme.textMuted, fontSize: '13px' }}>BE: {analytics.breakeven}</div></div>
                    <div style={{ padding: '12px', background: theme.warning + '20', borderRadius: '8px' }}><div style={{ color: theme.warning, fontSize: '12px' }}>Best Streak</div><div style={{ color: theme.text, fontSize: '20px', fontWeight: 700 }}>+{analytics.streaks.longestWinStreak}</div><div style={{ color: theme.textMuted, fontSize: '13px' }}>Worst: -{analytics.streaks.longestLoseStreak}</div></div>
                  </div></div>
                })()}
              </div>
            )}
            
            {/* ACCOUNTS TAB */}
            {tradingSubTab === 'accounts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {tradingAccounts.length > 0 && <div style={{ padding: '20px', background: `linear-gradient(135deg, ${theme.accent}20, ${theme.purple}20)`, borderRadius: '16px', border: '2px solid ' + theme.accent }}><h3 style={{ margin: '0 0 16px 0', color: theme.text }}>💼 Portfolio Overview</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}><div style={{ textAlign: 'center' as React.CSSProperties }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Total Balance</div><div style={{ color: theme.text, fontSize: '28px', fontWeight: 700 }}>${tradingAccounts.reduce((sum, acc) => sum + parseFloat(acc.currentBalance || acc.startingBalance || '0'), 0).toLocaleString()}</div></div><div style={{ textAlign: 'center' as React.CSSProperties }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Total P&L</div><div style={{ color: tradingAccounts.reduce((sum, acc) => sum + (parseFloat(acc.currentBalance || '0') - parseFloat(acc.startingBalance || '0')), 0) >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 700 }}>{tradingAccounts.reduce((sum, acc) => sum + (parseFloat(acc.currentBalance || '0') - parseFloat(acc.startingBalance || '0')), 0) >= 0 ? '+' : ''}${tradingAccounts.reduce((sum, acc) => sum + (parseFloat(acc.currentBalance || '0') - parseFloat(acc.startingBalance || '0')), 0).toLocaleString()}</div></div><div style={{ textAlign: 'center' as React.CSSProperties }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Active Accounts</div><div style={{ color: theme.text, fontSize: '28px', fontWeight: 700 }}>{tradingAccounts.filter(a => a.isActive).length}</div></div></div></div>}
                
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}><h2 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>💼 Trading Accounts</h2><button onClick={() => setShowAddAccount(!showAddAccount)} style={{ padding: '8px 16px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Add Account</button></div>
                  {showAddAccount && <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', marginBottom: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
                      <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Account Name *</label><input value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} placeholder="My FTMO 100k" style={{ ...inputStyle, width: '100%' }} /></div>
                      <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Type</label><select value={newAccount.type} onChange={e => setNewAccount({...newAccount, type: e.target.value})} style={{ ...inputStyle, width: '100%' }}><option value="personal">💼 Personal Account</option><option value="prop_challenge">🎯 Prop Challenge</option><option value="prop_funded">🏆 Prop Funded</option></select></div>
                      <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Prop Firm</label><select value={newAccount.propFirm} onChange={e => { const firm = e.target.value; if (firm === 'Custom') setNewAccount({ ...newAccount, propFirm: 'Custom', maxDrawdown: '', dailyDrawdown: '', profitTarget: '' }); else { const f = propFirmProfiles[firm]; setNewAccount({ ...newAccount, propFirm: firm, maxDrawdown: f?.phases?.challenge?.maxDrawdown?.toString() || '', dailyDrawdown: f?.phases?.challenge?.dailyDrawdown?.toString() || '', profitTarget: f?.phases?.challenge?.profitTarget?.toString() || '' }); } }} style={{ ...inputStyle, width: '100%' }}><option value="">Select or Custom...</option>{Object.keys(propFirmProfiles).map(f => <option key={f} value={f}>{f}</option>)}<option value="Custom">✏️ Custom</option></select></div>
                      <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Starting Balance *</label><input type="number" value={newAccount.startingBalance} onChange={e => setNewAccount({...newAccount, startingBalance: e.target.value, currentBalance: e.target.value})} placeholder="100000" style={{ ...inputStyle, width: '100%' }} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
                      <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Max Drawdown %</label><input type="number" value={newAccount.maxDrawdown} onChange={e => setNewAccount({...newAccount, maxDrawdown: e.target.value})} placeholder="10" style={{ ...inputStyle, width: '100%' }} /></div>
                      <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Daily Drawdown %</label><input type="number" value={newAccount.dailyDrawdown} onChange={e => setNewAccount({...newAccount, dailyDrawdown: e.target.value})} placeholder="5" style={{ ...inputStyle, width: '100%' }} /></div>
                      <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Profit Target %</label><input type="number" value={newAccount.profitTarget} onChange={e => setNewAccount({...newAccount, profitTarget: e.target.value})} placeholder="10" style={{ ...inputStyle, width: '100%' }} /></div>
                      <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Risk Per Trade %</label><input type="number" value={newAccount.riskPerTrade} onChange={e => setNewAccount({...newAccount, riskPerTrade: e.target.value})} placeholder="1" style={{ ...inputStyle, width: '100%' }} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}><button onClick={() => { if (newAccount.name && newAccount.startingBalance) { setTradingAccounts([...tradingAccounts, { ...newAccount, id: Date.now(), currentBalance: newAccount.startingBalance }]); setNewAccount({ name: '', type: 'personal', propFirm: '', phase: '', startingBalance: '', currentBalance: '', maxDrawdown: '', dailyDrawdown: '', profitTarget: '', riskPerTrade: '1', isActive: true, customRules: [], minTradingDays: '', maxTradingDays: '', consistencyRule: '', newsRestriction: false, weekendHolding: true, scalingPlan: false, profitSplit: '' }); setShowAddAccount(false); } }} style={{ ...btnSuccess, opacity: (!newAccount.name || !newAccount.startingBalance) ? 0.5 : 1 }} disabled={!newAccount.name || !newAccount.startingBalance}>Add Account</button><button onClick={() => setShowAddAccount(false)} style={{ ...btnPrimary, background: theme.textMuted }}>Cancel</button></div>
                  </div>}
                  {tradingAccounts.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: theme.textMuted }}><div style={{ fontSize: '48px', marginBottom: '12px' }}>💼</div><p>No accounts yet. Add your first trading account to get started!</p></div> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>{tradingAccounts.map(account => { const startBal = parseFloat(account.startingBalance || '0'); const currBal = parseFloat(account.currentBalance || '0'); const pnl = currBal - startBal; const pnlPercent = startBal > 0 ? (pnl / startBal) * 100 : 0; const maxDD = parseFloat(account.maxDrawdown || '0'); const progressToTarget = account.profitTarget ? Math.min((pnlPercent / parseFloat(account.profitTarget)) * 100, 100) : 0; const hitTarget = progressToTarget >= 100; const accountTrades = trades.filter(t => t.accountId === account.id); const accountWinRate = accountTrades.length > 0 ? (accountTrades.filter(t => parseFloat(t.profitLoss || '0') > 0).length / accountTrades.length) * 100 : 0; return <div key={account.id} style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', border: '2px solid ' + (hitTarget ? theme.success : account.type === 'personal' ? theme.purple : account.type === 'prop_funded' ? theme.success : theme.warning) }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}><div><div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><span style={{ fontSize: '20px' }}>{hitTarget ? '🏆' : account.type === 'personal' ? '👤' : account.type === 'prop_funded' ? '💰' : '🎯'}</span><span style={{ fontWeight: 700, color: theme.text, fontSize: '16px' }}>{account.name}</span></div><div style={{ fontSize: '12px', color: theme.textMuted }}>{account.propFirm || 'Personal Account'} {account.type === 'prop_challenge' ? '• Challenge' : account.type === 'prop_funded' ? '• Funded' : ''}</div></div><div style={{ display: 'flex', flexDirection: 'column' as React.CSSProperties, alignItems: 'flex-end', gap: '4px' }}><div style={{ padding: '4px 10px', background: pnl >= 0 ? theme.success + '20' : theme.danger + '20', color: pnl >= 0 ? theme.success : theme.danger, borderRadius: '4px', fontSize: '14px', fontWeight: 700 }}>{pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%</div><button onClick={() => { if (confirm('Delete this account?')) setTradingAccounts(prev => prev.filter(a => a.id !== account.id)) }} style={{ padding: '2px 6px', background: 'transparent', color: theme.textMuted, border: 'none', cursor: 'pointer', fontSize: '11px' }}>🗑️ Delete</button></div></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}><div style={{ background: theme.cardBg, padding: '12px', borderRadius: '8px', textAlign: 'center' as React.CSSProperties }}><div style={{ color: theme.textMuted, fontSize: '10px', marginBottom: '2px' }}>Balance</div><div style={{ color: theme.text, fontSize: '18px', fontWeight: 700 }}>${currBal.toLocaleString()}</div></div><div style={{ background: theme.cardBg, padding: '12px', borderRadius: '8px', textAlign: 'center' as React.CSSProperties }}><div style={{ color: theme.textMuted, fontSize: '10px', marginBottom: '2px' }}>Total P&L</div><div style={{ color: pnl >= 0 ? theme.success : theme.danger, fontSize: '18px', fontWeight: 700 }}>${pnl.toFixed(0)}</div></div><div style={{ background: theme.cardBg, padding: '12px', borderRadius: '8px', textAlign: 'center' as React.CSSProperties }}><div style={{ color: theme.textMuted, fontSize: '10px', marginBottom: '2px' }}>Win Rate</div><div style={{ color: accountWinRate >= 50 ? theme.success : theme.warning, fontSize: '18px', fontWeight: 700 }}>{accountWinRate.toFixed(0)}%</div><div style={{ color: theme.textMuted, fontSize: '10px' }}>{accountTrades.length} trades</div></div></div>{account.type !== 'personal' && account.profitTarget && <div style={{ marginBottom: '12px' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}><span style={{ color: theme.textMuted }}>🎯 Target: {account.profitTarget}%</span><span style={{ color: hitTarget ? theme.success : theme.warning, fontWeight: 600 }}>{hitTarget ? '✅ TARGET HIT!' : `${pnlPercent.toFixed(2)}% / ${account.profitTarget}%`}</span></div><div style={{ height: '8px', background: theme.border, borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: Math.min(progressToTarget, 100) + '%', height: '100%', background: hitTarget ? theme.success : 'linear-gradient(90deg, ' + theme.warning + ', ' + theme.success + ')' }} /></div></div>}{account.type === 'personal' && <div style={{ padding: '10px', background: theme.purple + '20', borderRadius: '8px', textAlign: 'center' as React.CSSProperties }}><span style={{ color: theme.purple, fontSize: '12px' }}>💡 Focus on consistent growth.</span></div>}</div>})}</div>}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      <footer style={{ padding: '16px 24px', background: theme.cardBg, borderTop: '1px solid ' + theme.border, textAlign: 'center' as React.CSSProperties }}>
        <p style={{ margin: '0 0 8px 0', color: theme.textMuted, fontSize: '11px', lineHeight: 1.5 }}>⚠️ <strong>Disclaimer:</strong> Aureus is an AI-powered financial assistant for educational and informational purposes only. This is not financial, tax, or legal advice.</p>
        <p style={{ margin: 0, color: theme.textMuted, fontSize: '10px' }}>© {new Date().getFullYear()} Aureus • Not affiliated with any financial institution</p>
      </footer>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
