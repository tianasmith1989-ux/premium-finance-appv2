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
  
  // ==================== PASSIVE QUEST STATE ====================
  const [activeQuestId, setActiveQuestId] = useState<number | null>(null)
  const [passiveQuests, setPassiveQuests] = useState<any[]>([
    { 
      id: 1, 
      name: 'High-Interest Savings', 
      category: 'beginner', 
      icon: '🏦',
      description: 'Earn $5-20/mo passive interest on your savings',
      potentialIncome: '$5-20/mo',
      difficulty: 'Easy',
      timeToSetup: '15 mins',
      status: 'not_started', 
      progress: 0, 
      currentStep: 0,
      monthlyIncome: 0, 
      steps: [
        { title: 'Research accounts', description: 'Compare rates at Up (5%), ING (5.5%), Ubank (5.1%), BOQ (5%)', action: "I'll research savings accounts" },
        { title: 'Open account', description: 'Most can be opened online in 10 minutes with just your ID', action: "I've opened my account" },
        { title: 'Set up auto-transfer', description: 'Transfer your emergency fund or set up regular deposits', action: 'Money is transferred' },
        { title: 'Track your interest', description: 'Watch passive income grow! $10k at 5% = $42/mo', action: 'Complete quest' }
      ],
      aureusAdvice: 'This is the easiest passive income - your money works while you sleep! With $2,000 at 5%, you\'ll earn about $8/month doing nothing.'
    },
    { 
      id: 2, 
      name: 'Cashback & Rewards', 
      category: 'beginner',
      icon: '💳',
      description: 'Earn cashback on spending you already do',
      potentialIncome: '$10-50/mo',
      difficulty: 'Easy',
      timeToSetup: '20 mins',
      status: 'not_started', 
      progress: 0,
      currentStep: 0,
      monthlyIncome: 0, 
      steps: [
        { title: 'Research cards', description: 'Compare: ING Orange (cashback), Bankwest Breeze (rewards), HSBC (points)', action: "I've researched options" },
        { title: 'Apply for card', description: 'Choose no annual fee cards to start. Approval takes 1-5 days', action: 'Card approved' },
        { title: 'Set as default', description: 'Use for all regular spending - groceries, bills, fuel', action: 'Using the card' },
        { title: 'Redeem rewards', description: 'Cash out monthly or let points accumulate for bigger rewards', action: 'Complete quest' }
      ],
      aureusAdvice: 'The trick is using it for spending you\'d do anyway - NOT spending more to get rewards. That defeats the purpose!'
    },
    { 
      id: 3, 
      name: 'Bank Bonus Hunting', 
      category: 'beginner',
      icon: '🎁',
      description: 'Collect sign-up bonuses from banks',
      potentialIncome: '$200-500/year',
      difficulty: 'Easy',
      timeToSetup: '30 mins',
      status: 'not_started', 
      progress: 0,
      currentStep: 0,
      monthlyIncome: 0, 
      steps: [
        { title: 'Find current offers', description: 'Check OzBargain, Whirlpool forums for latest bank bonuses', action: 'Found some offers' },
        { title: 'Meet requirements', description: 'Usually: deposit $X or make Y transactions in 3 months', action: 'Requirements met' },
        { title: 'Collect bonus', description: 'Wait for bonus to credit (usually within 30 days of meeting criteria)', action: 'Got the bonus' },
        { title: 'Rinse & repeat', description: 'Move to next bank after 6-12 months. Keep credit checks spaced out', action: 'Complete quest' }
      ],
      aureusAdvice: 'This is "churning" - totally legal! Just read the fine print and don\'t close accounts too quickly or you may have to repay the bonus.'
    },
    { 
      id: 4, 
      name: 'Dividend ETFs', 
      category: 'intermediate',
      icon: '📈',
      description: 'Earn quarterly dividends from Aussie shares',
      potentialIncome: '$50-200/quarter',
      difficulty: 'Medium',
      timeToSetup: '1 hour',
      status: 'not_started', 
      progress: 0,
      currentStep: 0,
      monthlyIncome: 0, 
      steps: [
        { title: 'Open brokerage', description: 'Stake ($3/trade), CMC (free under $1k), Pearler (for auto-invest)', action: 'Brokerage opened' },
        { title: 'Research ETFs', description: 'VAS (Aussie shares 4%), VHY (high yield 5%), A200 (low fee)', action: 'Picked my ETF' },
        { title: 'Make first investment', description: 'Start with $500+. More = more dividends. Consider DRP (reinvest)', action: 'First purchase done' },
        { title: 'Set up regular buys', description: 'Automate monthly purchases. Time in market beats timing market', action: 'Complete quest' }
      ],
      aureusAdvice: 'ETFs are diversified - you own tiny pieces of hundreds of companies. VAS gives you the top 300 Aussie companies in one purchase!'
    },
    { 
      id: 5, 
      name: 'Micro-Investing', 
      category: 'intermediate',
      icon: '🌱',
      description: 'Round-ups that grow your wealth painlessly',
      potentialIncome: '$20-100/year growth',
      difficulty: 'Easy',
      timeToSetup: '15 mins',
      status: 'not_started', 
      progress: 0,
      currentStep: 0,
      monthlyIncome: 0, 
      steps: [
        { title: 'Choose platform', description: 'Raiz (round-ups + rewards), Spaceship (no fees under $5k)', action: 'Signed up' },
        { title: 'Connect bank', description: 'Link your spending account for automatic round-ups', action: 'Bank connected' },
        { title: 'Enable round-ups', description: 'Every purchase rounds up to nearest $1 and invests the difference', action: 'Round-ups active' },
        { title: 'Add weekly boost', description: 'Even $5-10/week accelerates growth massively', action: 'Complete quest' }
      ],
      aureusAdvice: 'Round-ups are sneaky good - you barely notice the money leaving but it compounds over years. Start young!'
    },
    { 
      id: 6, 
      name: 'Side Hustle', 
      category: 'intermediate',
      icon: '💪',
      description: 'Turn your skills into extra income',
      potentialIncome: '$100-1000+/mo',
      difficulty: 'Medium',
      timeToSetup: '2-4 hours',
      status: 'not_started', 
      progress: 0,
      currentStep: 0,
      monthlyIncome: 0, 
      steps: [
        { title: 'Identify skills', description: 'What can you do? Cleaning, handyman, tutoring, design, writing, driving?', action: 'Found my skill' },
        { title: 'Create profile', description: 'Airtasker, Fiverr, Uber, DoorDash, Tutoring platforms', action: 'Profile created' },
        { title: 'Complete first job', description: 'Start cheap to get reviews, then raise prices', action: 'First job done' },
        { title: 'Scale up', description: 'Get regular clients, increase rates, optimize your time', action: 'Complete quest' }
      ],
      aureusAdvice: 'Side hustles aren\'t passive at first, but some can become semi-passive with systems and repeat clients!'
    },
    { 
      id: 7, 
      name: 'Content Creation', 
      category: 'advanced',
      icon: '🎬',
      description: 'Build audience for passive ad/affiliate income',
      potentialIncome: '$0-10,000+/mo',
      difficulty: 'Hard',
      timeToSetup: '6-24 months',
      status: 'not_started', 
      progress: 0,
      currentStep: 0,
      monthlyIncome: 0, 
      steps: [
        { title: 'Choose niche', description: 'Finance, tech reviews, cooking, fitness - pick something you love', action: 'Niche chosen' },
        { title: 'Create consistently', description: '2-3 pieces per week minimum. YouTube, TikTok, blog, podcast', action: 'Creating content' },
        { title: 'Monetize', description: 'YouTube Partner (1k subs), affiliate links, sponsorships', action: 'Earning money' },
        { title: 'Automate & scale', description: 'Hire editors, batch create, let old content earn forever', action: 'Complete quest' }
      ],
      aureusAdvice: 'This is the ultimate passive income - videos you made years ago can still earn money. But it takes serious time investment upfront.'
    },
    { 
      id: 8, 
      name: 'Investment Property', 
      category: 'advanced',
      icon: '🏠',
      description: 'Rental income from property',
      potentialIncome: '$500-2000+/mo',
      difficulty: 'Expert',
      timeToSetup: '6-12 months',
      status: 'not_started', 
      progress: 0,
      currentStep: 0,
      monthlyIncome: 0, 
      steps: [
        { title: 'Save deposit', description: 'Need 10-20% deposit + stamp duty + costs (see Baby Step 5)', action: 'Deposit saved' },
        { title: 'Get pre-approval', description: 'Know your borrowing power before house hunting', action: 'Pre-approved' },
        { title: 'Find property', description: 'High yield areas, look for positive cashflow or neutral gearing', action: 'Property purchased' },
        { title: 'Rent it out', description: 'Property manager (8-10% of rent) or self-manage', action: 'Complete quest' }
      ],
      aureusAdvice: 'Property is powerful because of leverage - banks let you borrow 80-90%! But research hard - bad properties can cost you.'
    }
  ])
  
  // ==================== AUSTRALIAN HOME OWNERSHIP DATA ====================
  const australianHomeData = {
    stampDuty: {
      NSW: { firstHome: 'Exempt up to $800k (concession to $1M)', investor: '~4-5.5% of purchase price' },
      VIC: { firstHome: 'Exempt up to $600k (concession to $750k)', investor: '~5.5% of purchase price' },
      QLD: { firstHome: 'Concession up to $550k, exempt for new builds', investor: '~3.5-5.75%' },
      WA: { firstHome: 'Exempt up to $430k', investor: '~4-5.15%' },
      SA: { firstHome: 'Exempt up to $650k (new) or no exemption (existing)', investor: '~4-5.5%' }
    },
    firstHomeBuyerGrants: {
      federal: '$15,000 First Home Owner Grant (new builds only)',
      NSW: '$10,000 FHOG (new builds up to $600k)',
      VIC: '$10,000 FHOG (new builds up to $750k)',
      QLD: '$30,000 FHOG (new builds)',
      WA: '$10,000 FHOG (new builds up to $750k)',
      SA: '$15,000 FHOG (new builds)'
    },
    schemes: [
      { name: 'First Home Guarantee', description: 'Buy with 5% deposit, no LMI. 35,000 places/year.' },
      { name: 'Regional First Home Guarantee', description: 'Same but for regional areas. 10,000 places/year.' },
      { name: 'Family Home Guarantee', description: 'Single parents can buy with 2% deposit.' },
      { name: 'Help to Buy', description: 'Coming 2024 - govt co-owns up to 40% of your home.' },
      { name: 'First Home Super Saver', description: 'Withdraw up to $50k from super for deposit (voluntary contributions only).' }
    ],
    lmi: {
      description: "Lender's Mortgage Insurance - protects the BANK if you default. You pay it.",
      cost: '1-4% of loan amount if deposit is under 20%',
      avoid: 'Save 20% deposit, use guarantor, or use First Home Guarantee'
    },
    depositExample: {
      price: 600000,
      deposit5: 30000,
      deposit10: 60000,
      deposit20: 120000,
      stampDutyFirstHome: 0,
      stampDutyInvestor: 22000,
      lmiCost5: 15000,
      lmiCost10: 8000,
      lmiCost20: 0
    }
  }
  
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
    aiChatsLimit: 5, // Free tier limit
    expiresAt: null,
    customerId: null
  })
  
  const [showPricingModal, setShowPricingModal] = useState(false)
  
  // ==================== BUDGET ENHANCEMENTS ====================
  // Wealth Position History (tracks over time)
  const [wealthHistory, setWealthHistory] = useState<{date: string, amount: number}[]>([])
  
  // Bill reminders
  const [billReminders, setBillReminders] = useState<{id: number, name: string, amount: string, dueDate: string, autoPay: boolean, paid: boolean}[]>([])
  
  // Subscription audit
  const [subscriptionAudit, setSubscriptionAudit] = useState<{id: number, name: string, cost: string, frequency: string, lastUsed: string, category: string}[]>([])
  
  // Financial milestones/achievements
  const [financialMilestones, setFinancialMilestones] = useState<{id: number, title: string, date: string, amount?: number, type: string}[]>([])
  
  // Budget analytics view
  const [budgetAnalyticsTab, setBudgetAnalyticsTab] = useState<'spending' | 'wealth' | 'bills' | 'subscriptions' | 'milestones'>('spending')
  const [showBudgetAnalytics, setShowBudgetAnalytics] = useState(false)
  
  // Calculate spending by category
  const calculateSpendingAnalytics = () => {
    const categoryTotals: {[key: string]: number} = {}
    const monthlyExpenseTotal = expenses.reduce((sum, e) => {
      const amount = parseFloat(e.amount || '0')
      const monthly = e.frequency === 'weekly' ? amount * 4.33 : e.frequency === 'fortnightly' ? amount * 2.17 : e.frequency === 'yearly' ? amount / 12 : amount
      const cat = e.category || 'other'
      categoryTotals[cat] = (categoryTotals[cat] || 0) + monthly
      return sum + monthly
    }, 0)
    
    // Calculate month-over-month change (simulated for now)
    const lastMonthTotal = monthlyExpenseTotal * 0.95 // Placeholder
    const change = monthlyExpenseTotal - lastMonthTotal
    const changePercent = lastMonthTotal > 0 ? (change / lastMonthTotal) * 100 : 0
    
    return {
      total: monthlyExpenseTotal,
      byCategory: categoryTotals,
      change,
      changePercent,
      topCategory: Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || ['none', 0]
    }
  }
  
  // Calculate wealth position
  const calculateWealthPosition = () => {
    const totalAssets = assets.reduce((sum, a) => sum + parseFloat(a.value || '0'), 0)
    const totalLiabilitiesAmount = liabilities.reduce((sum, l) => sum + parseFloat(l.value || '0'), 0)
    const totalDebtAmount = debts.reduce((sum, d) => sum + parseFloat(d.balance || '0'), 0)
    const tradingBalance = tradingAccounts.reduce((sum, acc) => sum + parseFloat(acc.currentBalance || acc.startingBalance || '0'), 0)
    const tradingPnL = trades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)
    const totalPayoutsValue = payouts.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0)
    
    return {
      assets: totalAssets,
      tradingAssets: tradingBalance,
      tradingPnL,
      payouts: totalPayoutsValue,
      liabilities: totalLiabilitiesAmount + totalDebtAmount,
      netWorth: totalAssets + tradingBalance - totalLiabilitiesAmount - totalDebtAmount
    }
  }
  
  // Track wealth history (run on mount and when assets change)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const wealth = calculateWealthPosition()
    
    setWealthHistory(prev => {
      // Only add if we don't have today's entry
      if (prev.length === 0 || prev[prev.length - 1].date !== today) {
        return [...prev.slice(-365), { date: today, amount: wealth.netWorth }] // Keep 1 year
      }
      // Update today's entry
      return [...prev.slice(0, -1), { date: today, amount: wealth.netWorth }]
    })
  }, [assets, liabilities, debts, tradingAccounts])
  
  // Generate weekly report for trading
  const generateWeeklyReport = () => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 7)
    
    const weekTrades = trades.filter(t => new Date(t.date) >= weekStart)
    const weekPnL = weekTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)
    const weekWins = weekTrades.filter(t => parseFloat(t.profitLoss || '0') > 0)
    const weekLosses = weekTrades.filter(t => parseFloat(t.profitLoss || '0') < 0)
    const weekWinRate = weekTrades.length > 0 ? (weekWins.length / weekTrades.length) * 100 : 0
    
    // Best/worst setups
    const setupStats: {[key: string]: {pnl: number, trades: number}} = {}
    weekTrades.forEach(t => {
      const setup = t.setupType || 'Untagged'
      if (!setupStats[setup]) setupStats[setup] = { pnl: 0, trades: 0 }
      setupStats[setup].pnl += parseFloat(t.profitLoss || '0')
      setupStats[setup].trades++
    })
    const sortedSetups = Object.entries(setupStats).sort((a, b) => b[1].pnl - a[1].pnl)
    
    // Best/worst days
    const dayStats: {[key: string]: number} = {}
    weekTrades.forEach(t => {
      const day = new Date(t.date).toLocaleDateString('en-US', { weekday: 'long' })
      dayStats[day] = (dayStats[day] || 0) + parseFloat(t.profitLoss || '0')
    })
    const bestDay = Object.entries(dayStats).sort((a, b) => b[1] - a[1])[0]
    const worstDay = Object.entries(dayStats).sort((a, b) => a[1] - b[1])[0]
    
    // Rules followed
    const rulesFollowed = weekTrades.filter(t => t.followedPlan).length
    const rulesRate = weekTrades.length > 0 ? (rulesFollowed / weekTrades.length) * 100 : 0
    
    return {
      totalTrades: weekTrades.length,
      pnl: weekPnL,
      winRate: weekWinRate,
      wins: weekWins.length,
      losses: weekLosses.length,
      bestSetup: sortedSetups[0] || null,
      worstSetup: sortedSetups[sortedSetups.length - 1] || null,
      bestDay,
      worstDay,
      rulesFollowed: rulesRate,
      avgTradeSize: weekTrades.length > 0 ? weekPnL / weekTrades.length : 0
    }
  }
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general'>('general')
  const [feedbackSent, setFeedbackSent] = useState(false)
  
  // REPLACE WITH YOUR EMAIL
  const FEEDBACK_EMAIL = 'your-email@example.com'
  
  const sendFeedback = () => {
    if (!feedbackText.trim()) return
    
    const subject = encodeURIComponent(`[Aureus ${feedbackType}] Feedback from ${budgetMemory.name || tradingMemory.name || 'User'}`)
    const body = encodeURIComponent(`
Feedback Type: ${feedbackType}
User: ${budgetMemory.name || tradingMemory.name || 'Anonymous'}
Mode: ${appMode}
Plan: ${userSubscription.plan}

Message:
${feedbackText}

---
Sent from Aureus App
    `.trim())
    
    window.open(`mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`, '_blank')
    setFeedbackSent(true)
    setTimeout(() => {
      setShowFeedbackModal(false)
      setFeedbackText('')
      setFeedbackSent(false)
    }, 2000)
  }
  
  // Lemon Squeezy checkout URLs - REPLACE WITH YOUR ACTUAL URLS
  const LEMONSQUEEZY_URLS = {
    pro_monthly: 'https://aureus.lemonsqueezy.com/checkout/buy/YOUR_PRO_MONTHLY_PRODUCT_ID',
    pro_annual: 'https://aureus.lemonsqueezy.com/checkout/buy/YOUR_PRO_ANNUAL_PRODUCT_ID',
    // Customer portal for managing subscription
    customer_portal: 'https://aureus.lemonsqueezy.com/billing'
  }
  
  // Check if user can use AI (within limits or subscribed)
  const canUseAI = () => {
    if (userSubscription.plan === 'pro' || userSubscription.plan === 'annual') {
      return { allowed: true, remaining: Infinity }
    }
    const remaining = userSubscription.aiChatsLimit - userSubscription.aiChatsUsed
    return { allowed: remaining > 0, remaining }
  }
  
  // Track AI usage
  const trackAIUsage = () => {
    if (userSubscription.plan === 'free') {
      setUserSubscription(prev => ({
        ...prev,
        aiChatsUsed: prev.aiChatsUsed + 1
      }))
    }
  }
  
  // Reset monthly usage on new month
  useEffect(() => {
    const lastReset = localStorage.getItem('aureus_usage_reset')
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`
    
    if (lastReset !== currentMonth) {
      setUserSubscription(prev => ({ ...prev, aiChatsUsed: 0 }))
      localStorage.setItem('aureus_usage_reset', currentMonth)
    }
  }, [])
  
  // Selected quest for detail view
  const [showQuestDetail, setShowQuestDetail] = useState(false)
  const [selectedBabyStep, setSelectedBabyStep] = useState<number | null>(null)
  const [homeBuyingPrice, setHomeBuyingPrice] = useState('')
  const [selectedQuestForWalkthrough, setSelectedQuestForWalkthrough] = useState<number | null>(null)
  
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
  const [goalCalendarPicker, setGoalCalendarPicker] = useState<{goalId: number, startDate: string} | null>(null)
  
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
  
  // Home Buying Guide State
  const [homeGuideExpanded, setHomeGuideExpanded] = useState<string | null>(null)
  const [homeCalcState, setHomeCalcState] = useState('QLD')
  const [homeCalcFirstHome, setHomeCalcFirstHome] = useState(true)
  const [homeCalcNewBuild, setHomeCalcNewBuild] = useState(false)
  const [homeDocuments, setHomeDocuments] = useState<{name: string, type: string, uploadedAt: string}[]>([])
  const homeDocInputRef = useRef<HTMLInputElement>(null)
  
  // My Roadmap - Visual Path to Goals
  const [roadmapMilestones, setRoadmapMilestones] = useState<any[]>([])
  const [showAddMilestone, setShowAddMilestone] = useState(false)
  const [newMilestone, setNewMilestone] = useState({ 
    name: '', 
    targetAmount: '', 
    targetDate: '', 
    category: 'savings', // savings, debt, income, lifestyle
    icon: '🎯',
    notes: ''
  })
  const [editingMilestone, setEditingMilestone] = useState<number | null>(null)
  
  // Alerts & Reminders
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [alertDaysBefore, setAlertDaysBefore] = useState(2)
  
  // Country/Region Settings - affects terminology, retirement systems, government schemes
  const [userCountry, setUserCountry] = useState<'AU' | 'US' | 'UK' | 'NZ' | 'CA'>('AU')
  
  const countryConfig: {[key: string]: {
    name: string,
    flag: string,
    currency: string,
    currencySymbol: string,
    retirement: string,
    benefits: string,
    payFrequency: string,
    homeSchemes: string[],
    taxSystem: string,
    terminology: {[key: string]: string}
  }} = {
    AU: {
      name: 'Australia',
      flag: '🇦🇺',
      currency: 'AUD',
      currencySymbol: '$',
      retirement: 'Superannuation (Super)',
      benefits: 'Centrelink',
      payFrequency: 'fortnightly',
      homeSchemes: ['First Home Guarantee', 'Help to Buy', 'First Home Super Saver', 'Family Home Guarantee'],
      taxSystem: 'ATO - Tax brackets, Medicare levy',
      terminology: { retirement: 'Super', benefits: 'Centrelink', payPeriod: 'fortnight', realEstate: 'property' }
    },
    US: {
      name: 'United States',
      flag: '🇺🇸',
      currency: 'USD',
      currencySymbol: '$',
      retirement: '401(k), IRA, Roth IRA',
      benefits: 'Social Security, Medicare, Medicaid',
      payFrequency: 'biweekly',
      homeSchemes: ['FHA Loans', 'VA Loans', 'USDA Loans', 'First-Time Homebuyer Programs'],
      taxSystem: 'IRS - Federal + State taxes, FICA',
      terminology: { retirement: '401k/IRA', benefits: 'Social Security', payPeriod: 'paycheck', realEstate: 'real estate' }
    },
    UK: {
      name: 'United Kingdom',
      flag: '🇬🇧',
      currency: 'GBP',
      currencySymbol: '£',
      retirement: 'Workplace Pension, SIPP, ISA',
      benefits: 'Universal Credit, State Pension',
      payFrequency: 'monthly',
      homeSchemes: ['Help to Buy ISA', 'Lifetime ISA', 'Shared Ownership', 'First Homes Scheme'],
      taxSystem: 'HMRC - Income tax, National Insurance',
      terminology: { retirement: 'Pension', benefits: 'Universal Credit', payPeriod: 'month', realEstate: 'property' }
    },
    NZ: {
      name: 'New Zealand',
      flag: '🇳🇿',
      currency: 'NZD',
      currencySymbol: '$',
      retirement: 'KiwiSaver',
      benefits: 'Work and Income NZ',
      payFrequency: 'fortnightly',
      homeSchemes: ['First Home Grant', 'KiwiSaver First Home Withdrawal', 'Kāinga Ora'],
      taxSystem: 'IRD - PAYE, ACC levy',
      terminology: { retirement: 'KiwiSaver', benefits: 'WINZ', payPeriod: 'fortnight', realEstate: 'property' }
    },
    CA: {
      name: 'Canada',
      flag: '🇨🇦',
      currency: 'CAD',
      currencySymbol: '$',
      retirement: 'RRSP, TFSA, CPP',
      benefits: 'EI, CPP, OAS',
      payFrequency: 'biweekly',
      homeSchemes: ['First-Time Home Buyer Incentive', 'Home Buyers Plan (RRSP)', 'First Home Savings Account'],
      taxSystem: 'CRA - Federal + Provincial taxes',
      terminology: { retirement: 'RRSP/TFSA', benefits: 'EI', payPeriod: 'paycheque', realEstate: 'real estate' }
    }
  }
  
  const currentCountryConfig = countryConfig[userCountry]
  
  // Motivational Quotes from Money Masters
  const moneyQuotes = [
    { quote: "The goal isn't more money. The goal is living life on your terms.", author: "Chris Brogan" },
    { quote: "It's not about having a lot of money. It's about having a lot of options.", author: "Chris Rock" },
    { quote: "Do not save what is left after spending; spend what is left after saving.", author: "Warren Buffett" },
    { quote: "The habit of saving is itself an education.", author: "T.T. Munger" },
    { quote: "A budget is telling your money where to go instead of wondering where it went.", author: "Dave Ramsey" },
    { quote: "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make.", author: "Dave Ramsey" },
    { quote: "The stock market is a device for transferring money from the impatient to the patient.", author: "Warren Buffett" },
    { quote: "Beware of little expenses; a small leak will sink a great ship.", author: "Benjamin Franklin" },
    { quote: "Rich people stay rich by living like they're broke. Broke people stay broke by living like they're rich.", author: "Unknown" },
    { quote: "The quickest way to double your money is to fold it in half and put it in your back pocket.", author: "Will Rogers" },
    { quote: "Money is a terrible master but an excellent servant.", author: "P.T. Barnum" },
    { quote: "Compound interest is the eighth wonder of the world.", author: "Albert Einstein" },
    { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { quote: "Don't work for money; make money work for you.", author: "Robert Kiyosaki" },
    { quote: "Every dollar you spend is a vote for the kind of world you want to live in.", author: "Anna Lappé" },
    { quote: "You must gain control over your money or the lack of it will forever control you.", author: "Dave Ramsey" },
    { quote: "The more you learn, the more you earn.", author: "Warren Buffett" },
    { quote: "Wealth is the ability to fully experience life.", author: "Henry David Thoreau" },
    { quote: "It is not the man who has too little, but the man who craves more, that is poor.", author: "Seneca" },
    { quote: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" }
  ]
  
  const [currentQuote] = useState(() => moneyQuotes[Math.floor(Math.random() * moneyQuotes.length)])
  
  // Presets & CSV
  const [showPresets, setShowPresets] = useState(false)
  const [showCsvImport, setShowCsvImport] = useState(false)
  const [csvTransactions, setCsvTransactions] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // ==================== TRADING STATE ====================
  const [trades, setTrades] = useState<any[]>([])
  const [newTrade, setNewTrade] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    time: new Date().toTimeString().slice(0,5), // HH:MM
    instrument: '', 
    direction: 'long', 
    entryPrice: '', 
    exitPrice: '', 
    profitLoss: '', 
    riskAmount: '',
    rMultiple: '', // R-Multiple (profit / risk)
    accountId: 0,
    setupType: '', // User's tagged setup type
    setupGrade: 'A', // A, B, C setup quality
    emotionBefore: 'neutral', // confident, neutral, anxious, fomo, revenge
    emotionAfter: 'neutral',
    followedPlan: true,
    notes: '',
    screenshot: '',
    tags: [] as string[], // Custom tags
    session: 'london', // asian, london, newyork
    holdingTime: '', // Duration of trade
    mistakes: [] as string[] // What went wrong
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
  const [customChecklistItems, setCustomChecklistItems] = useState<string[]>([])
  const [dailyMentalState, setDailyMentalState] = useState<'great' | 'good' | 'okay' | 'tired' | 'stressed' | null>(null)
  const [dailyGoal, setDailyGoal] = useState('')
  const [sessionStarted, setSessionStarted] = useState(false)
  
  // Reset checklist each day
  const todayStr = new Date().toISOString().split('T')[0]
  const [lastChecklistReset, setLastChecklistReset] = useState(todayStr)
  
  // ==================== POST-SESSION REVIEW ====================
  const [showPostSessionModal, setShowPostSessionModal] = useState(false)
  const [postSessionReview, setPostSessionReview] = useState({
    date: todayStr,
    overallRating: 0, // 1-5 stars
    followedPlan: true,
    emotionalControl: 'good', // great, good, struggled
    lessonsLearned: '',
    tomorrowFocus: ''
  })
  const [dailyReviews, setDailyReviews] = useState<any[]>([])
  
  // ==================== TRADING ROADMAP ====================
  const [tradingRoadmapGoal, setTradingRoadmapGoal] = useState({
    title: '',
    targetDate: '',
    type: 'prop_funded' // prop_funded, consistent_profit, skill_mastery, income_target
  })
  const [tradingRoadmapPhases, setTradingRoadmapPhases] = useState<any[]>([])
  const [showCreateRoadmapModal, setShowCreateRoadmapModal] = useState(false)
  const [roadmapProgress, setRoadmapProgress] = useState<{[milestoneId: string]: number}>({})
  
  // ==================== TRADE TEMPLATES ====================
  const [tradeTemplates, setTradeTemplates] = useState<any[]>([
    { id: 1, name: 'My Trend Pullback', instrument: 'EURUSD', setupType: 'Trend Pullback', direction: 'long', riskAmount: '100' },
  ])
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  
  // ==================== TRADE SETUPS/TAGS ====================
  const [tradeSetups, setTradeSetups] = useState<string[]>([
    'Trend Pullback',
    'Breakout',
    'Support/Resistance',
    'Fibonacci',
    'Moving Average',
    'Range Trade',
    'News Trade',
    'Reversal'
  ])
  const [tradeTags, setTradeTags] = useState<string[]>([
    'A+ Setup',
    'Revenge Trade',
    'FOMO Entry',
    'Early Exit',
    'Moved Stop',
    'Perfect Execution',
    'Oversize',
    'News Impact'
  ])
  const [tradeMistakes, setTradeMistakes] = useState<string[]>([
    'Entered too early',
    'Entered too late',
    'Cut winner short',
    'Let loser run',
    'Moved stop loss',
    'No stop loss',
    'Oversized position',
    'Revenge trade',
    'FOMO entry',
    'Traded during news',
    'Broke trading rules',
    'Poor risk/reward'
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
  const [importMapping, setImportMapping] = useState<{[key: string]: string}>({})
  const tradeFileInputRef = useRef<HTMLInputElement>(null)
  
  // Generate AI daily insight based on trading data
  const generateDailyInsight = () => {
    const analytics = calculateTradingAnalytics('all', '30d')
    const todaysTrades = trades.filter(t => t.date === todayStr)
    const weekTrades = trades.filter(t => {
      const tradeDate = new Date(t.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return tradeDate >= weekAgo
    })
    
    const insights: string[] = []
    
    // Best setup insight
    const setupStats = Object.entries(analytics.bySetup).sort((a, b) => (b[1].wins / b[1].trades) - (a[1].wins / a[1].trades))
    if (setupStats.length > 0 && setupStats[0][1].trades >= 3) {
      const bestSetup = setupStats[0]
      insights.push(`Your best setup is **${bestSetup[0]}** with ${((bestSetup[1].wins / bestSetup[1].trades) * 100).toFixed(0)}% win rate.`)
    }
    
    // Best day insight
    const dayStats = Object.entries(analytics.byDay).filter(([_, d]) => d.trades > 0).sort((a, b) => b[1].pnl - a[1].pnl)
    if (dayStats.length > 0 && dayStats[0][1].trades >= 2) {
      insights.push(`You perform best on **${dayStats[0][0]}s** (+$${dayStats[0][1].pnl.toFixed(0)}).`)
    }
    
    // Worst emotion insight
    const emotionStats = Object.entries(analytics.byEmotion).filter(([_, d]) => d.trades > 0 && d.pnl < 0).sort((a, b) => a[1].pnl - b[1].pnl)
    if (emotionStats.length > 0 && emotionStats[0][1].trades >= 2) {
      const worstEmotion = emotionStats[0][0]
      insights.push(`**${worstEmotion.charAt(0).toUpperCase() + worstEmotion.slice(1)}** trades cost you $${Math.abs(emotionStats[0][1].pnl).toFixed(0)}. Stay patient.`)
    }
    
    // Streak insight
    if (analytics.streaks.currentStreak > 0) {
      insights.push(`You're on a **${analytics.streaks.currentStreak} win streak** 🔥 Keep it going!`)
    } else if (analytics.streaks.currentStreak < -2) {
      insights.push(`You've had ${Math.abs(analytics.streaks.currentStreak)} losses in a row. Consider taking a break.`)
    }
    
    // Week performance
    const weekPnL = weekTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)
    const weekWins = weekTrades.filter(t => parseFloat(t.profitLoss || '0') > 0).length
    if (weekTrades.length > 0) {
      insights.push(`This week: ${weekPnL >= 0 ? '+' : ''}$${weekPnL.toFixed(0)} | ${weekWins}W/${weekTrades.length - weekWins}L`)
    }
    
    return insights.length > 0 ? insights : ['Log some trades to get personalized insights!']
  }
  
  // Calculate comprehensive trading analytics
  const calculateTradingAnalytics = (accountFilter: number | 'all' = 'all', dateRange: string = '30d') => {
    let filteredTrades = [...trades]
    
    // Filter by account
    if (accountFilter !== 'all') {
      filteredTrades = filteredTrades.filter(t => t.accountId === accountFilter)
    }
    
    // Filter by date range
    const now = new Date()
    const daysMap: {[key: string]: number} = { '7d': 7, '30d': 30, '90d': 90, 'all': 9999 }
    const days = daysMap[dateRange] || 30
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    filteredTrades = filteredTrades.filter(t => new Date(t.date) >= cutoff)
    
    if (filteredTrades.length === 0) {
      // Return empty but properly structured data
      const emptyByDay: {[key: string]: { trades: number, wins: number, pnl: number }} = {}
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      dayNames.forEach(d => emptyByDay[d] = { trades: 0, wins: 0, pnl: 0 })
      
      const emptyByHour: {[key: string]: { trades: number, wins: number, pnl: number }} = {}
      for (let i = 0; i < 24; i++) emptyByHour[i.toString().padStart(2, '0')] = { trades: 0, wins: 0, pnl: 0 }
      
      const emptyBySession: {[key: string]: { trades: number, wins: number, pnl: number }} = {
        asian: { trades: 0, wins: 0, pnl: 0 },
        london: { trades: 0, wins: 0, pnl: 0 },
        newyork: { trades: 0, wins: 0, pnl: 0 },
        overlap: { trades: 0, wins: 0, pnl: 0 }
      }
      
      return {
        totalTrades: 0, winners: 0, losers: 0, breakeven: 0,
        winRate: 0, totalPnL: 0, avgWin: 0, avgLoss: 0,
        largestWin: 0, largestLoss: 0, profitFactor: 0,
        avgRMultiple: 0, expectancy: 0, avgHoldingTime: 0,
        bySetup: {}, 
        byDay: emptyByDay, 
        byHour: emptyByHour, 
        bySession: emptyBySession,
        byInstrument: {}, 
        byEmotion: {}, 
        streaks: { currentStreak: 0, longestWinStreak: 0, longestLoseStreak: 0 },
        calendarData: {}
      }
    }
    
    // Basic stats
    const winners = filteredTrades.filter(t => parseFloat(t.profitLoss || '0') > 0)
    const losers = filteredTrades.filter(t => parseFloat(t.profitLoss || '0') < 0)
    const breakeven = filteredTrades.filter(t => parseFloat(t.profitLoss || '0') === 0)
    
    const totalPnL = filteredTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)
    const totalWins = winners.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)
    const totalLosses = Math.abs(losers.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0))
    
    const avgWin = winners.length > 0 ? totalWins / winners.length : 0
    const avgLoss = losers.length > 0 ? totalLosses / losers.length : 0
    const largestWin = winners.length > 0 ? Math.max(...winners.map(t => parseFloat(t.profitLoss || '0'))) : 0
    const largestLoss = losers.length > 0 ? Math.min(...losers.map(t => parseFloat(t.profitLoss || '0'))) : 0
    
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0
    
    // R-Multiple stats
    const tradesWithR = filteredTrades.filter(t => t.rMultiple && !isNaN(parseFloat(t.rMultiple)))
    const avgRMultiple = tradesWithR.length > 0 
      ? tradesWithR.reduce((sum, t) => sum + parseFloat(t.rMultiple), 0) / tradesWithR.length 
      : 0
    
    // Expectancy = (Win% × AvgWin) - (Loss% × AvgLoss)
    const winRate = filteredTrades.length > 0 ? (winners.length / filteredTrades.length) * 100 : 0
    const lossRate = filteredTrades.length > 0 ? (losers.length / filteredTrades.length) * 100 : 0
    const expectancy = ((winRate / 100) * avgWin) - ((lossRate / 100) * avgLoss)
    
    // Performance by Setup
    const bySetup: {[key: string]: { trades: number, wins: number, pnl: number, avgR: number }} = {}
    filteredTrades.forEach(t => {
      const setup = t.setupType || 'Untagged'
      if (!bySetup[setup]) bySetup[setup] = { trades: 0, wins: 0, pnl: 0, avgR: 0 }
      bySetup[setup].trades++
      if (parseFloat(t.profitLoss || '0') > 0) bySetup[setup].wins++
      bySetup[setup].pnl += parseFloat(t.profitLoss || '0')
      if (t.rMultiple) bySetup[setup].avgR += parseFloat(t.rMultiple)
    })
    Object.keys(bySetup).forEach(k => {
      if (bySetup[k].trades > 0) bySetup[k].avgR /= bySetup[k].trades
    })
    
    // Performance by Day of Week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const byDay: {[key: string]: { trades: number, wins: number, pnl: number }} = {}
    dayNames.forEach(d => byDay[d] = { trades: 0, wins: 0, pnl: 0 })
    filteredTrades.forEach(t => {
      const day = dayNames[new Date(t.date).getDay()]
      byDay[day].trades++
      if (parseFloat(t.profitLoss || '0') > 0) byDay[day].wins++
      byDay[day].pnl += parseFloat(t.profitLoss || '0')
    })
    
    // Performance by Hour
    const byHour: {[key: string]: { trades: number, wins: number, pnl: number }} = {}
    for (let i = 0; i < 24; i++) byHour[i.toString().padStart(2, '0')] = { trades: 0, wins: 0, pnl: 0 }
    filteredTrades.forEach(t => {
      if (t.time) {
        const hour = t.time.split(':')[0]
        if (byHour[hour]) {
          byHour[hour].trades++
          if (parseFloat(t.profitLoss || '0') > 0) byHour[hour].wins++
          byHour[hour].pnl += parseFloat(t.profitLoss || '0')
        }
      }
    })
    
    // Performance by Session
    const bySession: {[key: string]: { trades: number, wins: number, pnl: number }} = {
      asian: { trades: 0, wins: 0, pnl: 0 },
      london: { trades: 0, wins: 0, pnl: 0 },
      newyork: { trades: 0, wins: 0, pnl: 0 },
      overlap: { trades: 0, wins: 0, pnl: 0 }
    }
    filteredTrades.forEach(t => {
      const session = t.session || 'london'
      if (bySession[session]) {
        bySession[session].trades++
        if (parseFloat(t.profitLoss || '0') > 0) bySession[session].wins++
        bySession[session].pnl += parseFloat(t.profitLoss || '0')
      }
    })
    
    // Performance by Instrument
    const byInstrument: {[key: string]: { trades: number, wins: number, pnl: number }} = {}
    filteredTrades.forEach(t => {
      const inst = t.instrument || 'Unknown'
      if (!byInstrument[inst]) byInstrument[inst] = { trades: 0, wins: 0, pnl: 0 }
      byInstrument[inst].trades++
      if (parseFloat(t.profitLoss || '0') > 0) byInstrument[inst].wins++
      byInstrument[inst].pnl += parseFloat(t.profitLoss || '0')
    })
    
    // Performance by Pre-trade Emotion
    const byEmotion: {[key: string]: { trades: number, wins: number, pnl: number }} = {}
    filteredTrades.forEach(t => {
      const emotion = t.emotionBefore || 'neutral'
      if (!byEmotion[emotion]) byEmotion[emotion] = { trades: 0, wins: 0, pnl: 0 }
      byEmotion[emotion].trades++
      if (parseFloat(t.profitLoss || '0') > 0) byEmotion[emotion].wins++
      byEmotion[emotion].pnl += parseFloat(t.profitLoss || '0')
    })
    
    // Win/Loss streaks
    let currentStreak = 0
    let longestWinStreak = 0
    let longestLoseStreak = 0
    let tempWinStreak = 0
    let tempLoseStreak = 0
    const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    sortedTrades.forEach(t => {
      const pnl = parseFloat(t.profitLoss || '0')
      if (pnl > 0) {
        tempWinStreak++
        tempLoseStreak = 0
        longestWinStreak = Math.max(longestWinStreak, tempWinStreak)
      } else if (pnl < 0) {
        tempLoseStreak++
        tempWinStreak = 0
        longestLoseStreak = Math.max(longestLoseStreak, tempLoseStreak)
      }
    })
    
    // Current streak
    if (sortedTrades.length > 0) {
      const lastTrade = sortedTrades[sortedTrades.length - 1]
      const lastPnL = parseFloat(lastTrade.profitLoss || '0')
      if (lastPnL > 0) currentStreak = tempWinStreak
      else if (lastPnL < 0) currentStreak = -tempLoseStreak
    }
    
    // Calendar data (P&L by day)
    const calendarData: {[date: string]: { pnl: number, trades: number, wins: number }} = {}
    filteredTrades.forEach(t => {
      const date = t.date
      if (!calendarData[date]) calendarData[date] = { pnl: 0, trades: 0, wins: 0 }
      calendarData[date].pnl += parseFloat(t.profitLoss || '0')
      calendarData[date].trades++
      if (parseFloat(t.profitLoss || '0') > 0) calendarData[date].wins++
    })
    
    return {
      totalTrades: filteredTrades.length,
      winners: winners.length,
      losers: losers.length,
      breakeven: breakeven.length,
      winRate,
      totalPnL,
      avgWin,
      avgLoss,
      largestWin,
      largestLoss,
      profitFactor,
      avgRMultiple,
      expectancy,
      avgHoldingTime: 0, // Would need to calculate from holdingTime
      bySetup,
      byDay,
      byHour,
      bySession,
      byInstrument,
      byEmotion,
      streaks: { currentStreak, longestWinStreak, longestLoseStreak },
      calendarData
    }
  }
  
  // Parse CSV for trade import
  const parseTradeCSV = (csvText: string, platform: string) => {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) return []
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
    const trades: any[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const row: {[key: string]: string} = {}
      headers.forEach((h, idx) => row[h] = values[idx] || '')
      
      // Map based on platform
      let trade: any = {
        id: Date.now() + i,
        date: new Date().toISOString().split('T')[0],
        time: '',
        instrument: '',
        direction: 'long',
        entryPrice: '',
        exitPrice: '',
        profitLoss: '',
        riskAmount: '',
        rMultiple: '',
        accountId: selectedAccountId || 0,
        setupType: '',
        notes: 'Imported from ' + platform,
        selected: true
      }
      
      if (platform === 'metatrader') {
        // MetaTrader export format
        trade.date = row['time'] || row['open time'] || row['date'] || ''
        trade.instrument = row['symbol'] || row['item'] || ''
        trade.direction = (row['type'] || '').toLowerCase().includes('sell') ? 'short' : 'long'
        trade.entryPrice = row['price'] || row['open price'] || ''
        trade.exitPrice = row['close price'] || row['s/l'] || ''
        trade.profitLoss = row['profit'] || row['pnl'] || ''
      } else if (platform === 'tradingview') {
        // TradingView export format
        trade.date = row['date'] || row['time'] || ''
        trade.instrument = row['symbol'] || row['ticker'] || ''
        trade.direction = (row['side'] || row['type'] || '').toLowerCase().includes('sell') ? 'short' : 'long'
        trade.profitLoss = row['profit'] || row['pnl'] || row['return'] || ''
      } else {
        // Generic - try to auto-detect
        trade.date = row['date'] || row['time'] || row['datetime'] || row['open time'] || ''
        trade.instrument = row['symbol'] || row['instrument'] || row['ticker'] || row['pair'] || row['asset'] || ''
        trade.direction = (row['direction'] || row['side'] || row['type'] || '').toLowerCase().includes('sell') || 
                         (row['direction'] || row['side'] || row['type'] || '').toLowerCase().includes('short') ? 'short' : 'long'
        trade.entryPrice = row['entry'] || row['entry price'] || row['open'] || row['open price'] || row['price'] || ''
        trade.exitPrice = row['exit'] || row['exit price'] || row['close'] || row['close price'] || ''
        trade.profitLoss = row['pnl'] || row['profit'] || row['profit/loss'] || row['return'] || row['result'] || ''
        trade.riskAmount = row['risk'] || row['risk amount'] || ''
      }
      
      // Parse date if needed
      if (trade.date && !trade.date.includes('-')) {
        try {
          const parsed = new Date(trade.date)
          if (!isNaN(parsed.getTime())) {
            trade.date = parsed.toISOString().split('T')[0]
            trade.time = parsed.toTimeString().slice(0, 5)
          }
        } catch (e) {}
      }
      
      if (trade.instrument || trade.profitLoss) {
        trades.push(trade)
      }
    }
    
    return trades
  }
  
  const handleTradeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const parsed = parseTradeCSV(text, importPlatform)
      setImportedTrades(parsed)
    }
    reader.readAsText(file)
  }
  
  const confirmTradeImport = () => {
    const selected = importedTrades.filter(t => t.selected)
    const newTrades = selected.map(t => ({
      ...t,
      id: Date.now() + Math.random(),
      selected: undefined
    }))
    setTrades(prev => [...prev, ...newTrades])
    setImportedTrades([])
    setShowTradeImport(false)
    
    // Update account balances if applicable
    if (selectedAccountId) {
      const totalPnL = newTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)
      setTradingAccounts(prev => prev.map(acc => 
        acc.id === selectedAccountId 
          ? { ...acc, currentBalance: (parseFloat(acc.currentBalance || acc.startingBalance) + totalPnL).toString() }
          : acc
      ))
    }
  }
  
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
  
  // Calculate total payouts
  const totalPayouts = payouts.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0)
  const thisMonthPayouts = payouts
    .filter(p => p.date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0)
  
  const addPayout = () => {
    if (!newPayout.amount) return
    
    const payout = {
      ...newPayout,
      id: Date.now(),
      amount: parseFloat(newPayout.amount)
    }
    
    setPayouts(prev => [...prev, payout])
    
    // Optionally add as income to budget
    if (newPayout.addToIncome) {
      const incomeName = newPayout.propFirm 
        ? `${newPayout.propFirm} Payout` 
        : newPayout.accountName 
          ? `${newPayout.accountName} Payout`
          : 'Trading Payout'
      
      setIncomeStreams(prev => [...prev, {
        id: Date.now(),
        name: incomeName,
        amount: newPayout.amount,
        frequency: 'once', // One-time income
        type: 'trading',
        startDate: newPayout.date,
        notes: newPayout.notes
      }])
    }
    
    // Reset form
    setNewPayout({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      accountId: 0,
      accountName: '',
      propFirm: '',
      notes: '',
      addToIncome: true
    })
    setShowPayoutModal(false)
  }
  
  const deletePayout = (id: number) => {
    setPayouts(prev => prev.filter(p => p.id !== id))
  }
  
  // ==================== WEEKLY REPORT ====================
  const [weeklyReports, setWeeklyReports] = useState<any[]>([])
  const [showWeeklyReport, setShowWeeklyReport] = useState(false)
  
  // Generate weekly stats
  const getWeeklyStats = () => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0)
    
    const weekTrades = trades.filter(t => new Date(t.date) >= weekStart)
    const weekWins = weekTrades.filter(t => parseFloat(t.profitLoss || '0') > 0)
    const weekLosses = weekTrades.filter(t => parseFloat(t.profitLoss || '0') < 0)
    const weekPnL = weekTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)
    const weekWinRate = weekTrades.length > 0 ? (weekWins.length / weekTrades.length) * 100 : 0
    
    // Find best and worst setup this week
    const setupStats: {[key: string]: { pnl: number, trades: number }} = {}
    weekTrades.forEach(t => {
      const setup = t.setupType || 'Untagged'
      if (!setupStats[setup]) setupStats[setup] = { pnl: 0, trades: 0 }
      setupStats[setup].pnl += parseFloat(t.profitLoss || '0')
      setupStats[setup].trades++
    })
    
    const sortedSetups = Object.entries(setupStats).sort((a, b) => b[1].pnl - a[1].pnl)
    const bestSetup = sortedSetups[0]
    const worstSetup = sortedSetups[sortedSetups.length - 1]
    
    return {
      trades: weekTrades.length,
      wins: weekWins.length,
      losses: weekLosses.length,
      pnl: weekPnL,
      winRate: weekWinRate,
      bestSetup: bestSetup ? { name: bestSetup[0], ...bestSetup[1] } : null,
      worstSetup: worstSetup && sortedSetups.length > 1 ? { name: worstSetup[0], ...worstSetup[1] } : null
    }
  }
  
  // ==================== PROP FIRM PROFILES ====================
  const propFirmProfiles: {[key: string]: any} = {
    'FTMO': {
      name: 'FTMO',
      phases: {
        challenge: { profitTarget: 10, maxDrawdown: 10, dailyDrawdown: 5, minDays: 4, maxDays: 30 },
        verification: { profitTarget: 5, maxDrawdown: 10, dailyDrawdown: 5, minDays: 4, maxDays: 60 },
        funded: { maxDrawdown: 10, dailyDrawdown: 5, profitSplit: 80 }
      },
      rules: [
        'No trading during high-impact news (2 min before/after)',
        'No holding trades over weekend',
        'Must trade minimum 4 days',
        'Stop loss required on all trades'
      ],
      accountSizes: [10000, 25000, 50000, 100000, 200000]
    },
    'MyFundedFX': {
      name: 'MyFundedFX',
      phases: {
        evaluation: { profitTarget: 8, maxDrawdown: 8, dailyDrawdown: 5, minDays: 5, maxDays: null },
        funded: { maxDrawdown: 8, dailyDrawdown: 5, profitSplit: 80 }
      },
      rules: [
        'No news trading restrictions',
        'Can hold over weekend',
        'Must trade minimum 5 days',
        'Scaling plan available'
      ],
      accountSizes: [5000, 10000, 25000, 50000, 100000, 200000]
    },
    'The5ers': {
      name: 'The5ers',
      phases: {
        evaluation: { profitTarget: 6, maxDrawdown: 4, dailyDrawdown: null, minDays: null, maxDays: null },
        funded: { maxDrawdown: 4, profitSplit: 50 }
      },
      rules: [
        'Low drawdown requirement (4%)',
        'No time limit',
        'Can scale up to $4M',
        'Lower profit split (50-100%)'
      ],
      accountSizes: [6000, 20000, 60000, 100000]
    },
    'Funded Next': {
      name: 'Funded Next',
      phases: {
        challenge: { profitTarget: 10, maxDrawdown: 10, dailyDrawdown: 5, minDays: null, maxDays: null },
        verification: { profitTarget: 5, maxDrawdown: 10, dailyDrawdown: 5, minDays: null, maxDays: null },
        funded: { maxDrawdown: 10, dailyDrawdown: 5, profitSplit: 90 }
      },
      rules: [
        '90% profit split',
        'No time limits',
        'News trading allowed',
        '15% consistency rule'
      ],
      accountSizes: [6000, 15000, 25000, 50000, 100000, 200000]
    },
    'Personal': {
      name: 'Personal Account',
      phases: {
        active: { profitTarget: null, maxDrawdown: null, dailyDrawdown: null, minDays: null, maxDays: null }
      },
      rules: [
        'Your money, your rules!',
        'Focus on consistent compounding',
        'Risk 1-2% per trade recommended',
        'Withdraw or compound profits monthly'
      ],
      accountSizes: []
    },
    'Take Profit Trader': {
      name: 'Take Profit Trader',
      phases: {
        evaluation: { profitTarget: 6, maxDrawdown: 6, dailyDrawdown: null, minDays: 0, maxDays: null },
        funded: { maxDrawdown: 6, dailyDrawdown: null, profitSplit: 80 }
      },
      rules: [
        'EOD Trailing Drawdown (locks at end of day)',
        'No minimum trading days',
        'Must flatten by 4:00 PM ET',
        'No holding through major economic events',
        'Scaling rules for max contracts',
        '80% profit split'
      ],
      accountSizes: [25000, 50000, 75000, 100000, 150000]
    },
    'Apex Trader': {
      name: 'Apex Trader Funding',
      phases: {
        evaluation: { profitTarget: 6, maxDrawdown: 5, dailyDrawdown: null, minDays: 7, maxDays: null },
        funded: { maxDrawdown: 5, dailyDrawdown: null, profitSplit: 90 }
      },
      rules: [
        'Trailing drawdown',
        'Min 7 trading days',
        'Must flatten by 4:59 PM ET',
        'No holding through major news',
        '90% profit split (100% after $25K)'
      ],
      accountSizes: [25000, 50000, 75000, 100000, 150000, 250000, 300000]
    },
    'TopStep': {
      name: 'TopStep',
      phases: {
        combine: { profitTarget: 6, maxDrawdown: 4, dailyDrawdown: 2, minDays: 0, maxDays: null },
        funded: { maxDrawdown: 4, dailyDrawdown: 2, profitSplit: 90 }
      },
      rules: [
        'Trading Combine evaluation',
        'Consistency rule applies',
        'Must close by 3:10 PM CT',
        '90% profit split (100% on first $10K)'
      ],
      accountSizes: [50000, 100000, 150000]
    },
    'Custom': {
      name: 'Custom Prop Firm',
      phases: {
        challenge: { profitTarget: 10, maxDrawdown: 10, dailyDrawdown: 5, minDays: 0, maxDays: null },
        verification: { profitTarget: 5, maxDrawdown: 10, dailyDrawdown: 5, minDays: 0, maxDays: null },
        funded: { maxDrawdown: 10, dailyDrawdown: 5, profitSplit: 80 }
      },
      rules: [
        'Add your custom rules below'
      ],
      accountSizes: [5000, 10000, 25000, 50000, 100000, 200000]
    }
  }
  
  // ==================== TRADING ACCOUNTS ====================
  const [tradingAccounts, setTradingAccounts] = useState<any[]>([
    // Example structure - user will add their own
  ])
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'personal', // personal, prop_challenge, prop_funded
    propFirm: '',
    phase: '',
    startingBalance: '',
    currentBalance: '',
    maxDrawdown: '',
    dailyDrawdown: '',
    profitTarget: '',
    riskPerTrade: '1',
    isActive: true,
    // Custom rules for the account
    customRules: [] as string[],
    // Additional prop firm settings
    minTradingDays: '',
    maxTradingDays: '',
    consistencyRule: '', // e.g., "No single trade can be >15% of total profit"
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
  const [showRuleEditor, setShowRuleEditor] = useState(false)
  const [newCustomRule, setNewCustomRule] = useState({ rule: '', category: 'risk' })
  
  // ==================== TRADING ROADMAP ====================
  const [tradingRoadmap, setTradingRoadmap] = useState<any[]>([])
  const [showAddTradingMilestone, setShowAddTradingMilestone] = useState(false)
  const [newTradingMilestone, setNewTradingMilestone] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    category: 'prop', // prop, personal, skill, income
    icon: '🎯',
    notes: '',
    currentAmount: 0
  })
  
  // ==================== CHART ANALYSIS STATE ====================
  const [chartAnalysisMode, setChartAnalysisMode] = useState<'single' | 'multi'>('single')
  const [multiTimeframeCharts, setMultiTimeframeCharts] = useState<{
    small?: string, // e.g., 1m, 5m, 15m
    mid?: string,   // e.g., 1h, 4h
    high?: string   // e.g., daily, weekly
  }>({})
  
  // ==================== TRADE IDEA SETTINGS ====================
  const [tradeIdeaSettings, setTradeIdeaSettings] = useState({
    minRR: '3', // Minimum risk:reward ratio
    maxRiskPercent: '1',
    preferredInstruments: [] as string[],
    tradingStyle: 'day' // scalp, day, swing
  })
  
  // ==================== PSYCHOLOGY TRACKING ====================
  const [dailyMood, setDailyMood] = useState<{[date: string]: { mood: string, notes: string, tiltRisk: number }}>({})
  const [todaysMood, setTodaysMood] = useState({ mood: 'neutral', notes: '', tiltRisk: 0 })
  
  // Tilt detection based on trading patterns
  const detectTilt = () => {
    const today = new Date().toISOString().split('T')[0]
    const todaysTrades = trades.filter(t => t.date === today)
    const recentLosses = todaysTrades.filter(t => parseFloat(t.profitLoss || '0') < 0)
    
    let tiltScore = 0
    let warnings: string[] = []
    
    // Check for revenge trading (multiple trades after a loss)
    if (recentLosses.length >= 2) {
      tiltScore += 30
      warnings.push('Multiple losses today - consider stepping away')
    }
    
    // Check for overtrading
    if (todaysTrades.length > 5) {
      tiltScore += 25
      warnings.push('High trade count - are you overtrading?')
    }
    
    // Check for increasing position sizes after losses
    const positionSizes = todaysTrades.map(t => Math.abs(parseFloat(t.riskAmount || t.profitLoss || '0')))
    if (positionSizes.length >= 2) {
      const increasing = positionSizes.slice(1).every((size, i) => size > positionSizes[i])
      if (increasing && recentLosses.length > 0) {
        tiltScore += 35
        warnings.push('⚠️ Position sizes increasing after losses - TILT WARNING')
      }
    }
    
    // Check for broken rules
    const brokenRules = tradingRules.filter(r => r.enabled && !checkRuleCompliance(r, todaysTrades))
    if (brokenRules.length > 0) {
      tiltScore += brokenRules.length * 10
      warnings.push(`${brokenRules.length} trading rules broken today`)
    }
    
    return { tiltScore: Math.min(tiltScore, 100), warnings, todaysTrades: todaysTrades.length, todaysLosses: recentLosses.length }
  }
  
  const checkRuleCompliance = (rule: any, todaysTrades: any[]) => {
    if (rule.rule.includes('Max') && rule.rule.includes('trades')) {
      const maxTrades = parseInt(rule.rule.match(/\d+/)?.[0] || '3')
      return todaysTrades.length <= maxTrades
    }
    if (rule.rule.includes('Stop loss')) {
      return todaysTrades.every(t => t.notes?.toLowerCase().includes('sl') || t.riskAmount)
    }
    return true // Can't verify other rules automatically
  }
  
  // ==================== COMPOUNDING CALCULATOR ====================
  const calculateCompounding = (starting: number, monthlyAdd: number, dailyReturn: number, tradingDays: number, months: number) => {
    let balance = starting
    const history: {month: number, balance: number}[] = [{ month: 0, balance: starting }]
    
    for (let m = 1; m <= months; m++) {
      // Add monthly contribution at start of month
      balance += monthlyAdd
      
      // Apply daily returns for trading days
      for (let d = 0; d < tradingDays; d++) {
        balance *= (1 + dailyReturn / 100)
      }
      
      history.push({ month: m, balance: Math.round(balance) })
    }
    
    return { finalBalance: Math.round(balance), history, totalGain: Math.round(balance - starting - (monthlyAdd * months)) }
  }
  
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
    currency: '$',
    startingCapital: '100',
    returnRate: '100',
    returnPeriod: 'daily', // daily, weekly, monthly
    years: '0',
    months: '6',
    days: '0',
    includeWeekends: false,
    includeDays: ['M', 'T', 'W', 'T', 'F'], // Days to include
    reinvestRate: '100', // % of profits to reinvest
    additionalContributions: 'none', // none, deposits, withdrawals
    depositAmount: '0',
    depositFrequency: 'monthly',
    withdrawAmount: '0',
    withdrawFrequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0]
  })
  const [compoundBreakdown, setCompoundBreakdown] = useState<any[]>([])
  const [compoundView, setCompoundView] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily')
  
  // ==================== AI AGENT STATE ====================
  const [budgetMemory, setBudgetMemory] = useState<any>({
    name: '',
    onboardingComplete: false,
    financialPath: '', // babysteps, fire, home, automated, optimise
    bigGoals: {}, // { home: '', fire: '', debtFree: '', wealthTarget: '', passiveTarget: '' }
    lifeEvents: [],
    patterns: [],
    preferences: { communicationStyle: 'direct', checkInFrequency: 'when-needed', motivators: [] },
    currentStep: 'Baby Step 1',
    notes: []
  })
  
  const [tradingMemory, setTradingMemory] = useState<any>({
    name: '',
    onboardingComplete: false,
    tradingStyle: '', // scalper, day_trader, swing_trader
    experience: '', // beginner, intermediate, advanced
    instruments: [], // forex, futures, stocks, crypto
    tradingRules: [],
    patterns: [],
    psychology: { 
      strengths: [], 
      weaknesses: [], 
      triggers: [],
      biggestMistake: '',
      whatWorksForYou: ''
    },
    preferences: { 
      tradingStyle: '', 
      favoriteInstruments: [], 
      riskPerTrade: 1,
      maxTradesPerDay: 3,
      tradingHours: { start: '09:00', end: '16:00' }
    },
    propFirmGoals: { 
      targetFirm: '', 
      accountSizeGoal: 0,
      currentPhase: '',
      fundedBy: '' // target date
    },
    personalAccountGoals: {
      targetBalance: 0,
      monthlyTarget: 0,
      compoundingStrategy: '' // full_compound, withdraw_50, withdraw_profits
    }
  })
  
  const [budgetOnboarding, setBudgetOnboarding] = useState({ isActive: false, step: 'greeting' })
  const [tradingOnboarding, setTradingOnboarding] = useState({ isActive: false, step: 'greeting' })
  
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string, image?: string}>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [proactiveInsight, setProactiveInsight] = useState<any>(null)

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
      if (data.roadmapMilestones) setRoadmapMilestones(data.roadmapMilestones)
      if (data.tradingRoadmap) setTradingRoadmap(data.tradingRoadmap)
      if (data.tradingRules) setTradingRules(data.tradingRules)
      if (data.tradingAccounts) setTradingAccounts(data.tradingAccounts)
      if (data.tradeIdeaSettings) setTradeIdeaSettings(data.tradeIdeaSettings)
      if (data.budgetOnboarding) setBudgetOnboarding(data.budgetOnboarding)
      if (data.tradingOnboarding) setTradingOnboarding(data.tradingOnboarding)
      if (data.chatMessages) setChatMessages(data.chatMessages)
      if (data.userCountry) setUserCountry(data.userCountry)
      if (data.userSubscription) setUserSubscription(data.userSubscription)
      if (data.tradeSetups) setTradeSetups(data.tradeSetups)
      if (data.tradeTags) setTradeTags(data.tradeTags)
      if (data.tradeMistakes) setTradeMistakes(data.tradeMistakes)
      if (data.payouts) setPayouts(data.payouts)
      if (data.preSessionChecklist) setPreSessionChecklist(data.preSessionChecklist)
      if (data.customChecklistItems) setCustomChecklistItems(data.customChecklistItems)
      if (data.dailyReviews) setDailyReviews(data.dailyReviews)
      if (data.tradingRoadmapGoal) setTradingRoadmapGoal(data.tradingRoadmapGoal)
      if (data.tradingRoadmapPhases) setTradingRoadmapPhases(data.tradingRoadmapPhases)
      if (data.roadmapProgress) setRoadmapProgress(data.roadmapProgress)
      if (data.tradeTemplates) setTradeTemplates(data.tradeTemplates)
      // Budget enhancements
      if (data.wealthHistory) setWealthHistory(data.wealthHistory)
      if (data.billReminders) setBillReminders(data.billReminders)
      if (data.subscriptionAudit) setSubscriptionAudit(data.subscriptionAudit)
      if (data.financialMilestones) setFinancialMilestones(data.financialMilestones)
    }
  }, [])

  useEffect(() => {
    const data = {
      incomeStreams, expenses, debts, goals, assets, liabilities, trades,
      budgetMemory, tradingMemory,
      paidOccurrences: Array.from(paidOccurrences),
      roadmapMilestones, tradingRoadmap, tradingRules, tradingAccounts, tradeIdeaSettings,
      budgetOnboarding, tradingOnboarding, chatMessages, userCountry, userSubscription,
      tradeSetups, tradeTags, tradeMistakes, payouts,
      preSessionChecklist, customChecklistItems, dailyReviews,
      tradingRoadmapGoal, tradingRoadmapPhases, roadmapProgress, tradeTemplates,
      // Budget enhancements
      wealthHistory, billReminders, subscriptionAudit, financialMilestones
    }
    localStorage.setItem('aureus_data', JSON.stringify(data))
  }, [incomeStreams, expenses, debts, goals, assets, liabilities, trades, budgetMemory, tradingMemory, paidOccurrences, roadmapMilestones, tradingRoadmap, tradingRules, tradingAccounts, tradeIdeaSettings, budgetOnboarding, tradingOnboarding, chatMessages, userCountry, userSubscription, tradeSetups, tradeTags, tradeMistakes, payouts, preSessionChecklist, customChecklistItems, dailyReviews, tradingRoadmapGoal, tradingRoadmapPhases, roadmapProgress, tradeTemplates, wealthHistory, billReminders, subscriptionAudit, financialMilestones])

  // Scroll chat to bottom - use scrollTop instead of scrollIntoView to avoid page jump
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const aureusChatRef = useRef<HTMLDivElement>(null)
  const prevMessageCount = useRef(0)
  
  // Scroll chat to bottom when messages change AND scroll Aureus into view
  useEffect(() => {
    // Scroll chat container to bottom
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
    
    // Only scroll into view when NEW messages arrive (not on initial render)
    if (chatMessages.length > prevMessageCount.current && chatMessages.length > 0) {
      // Find the Aureus chat card on the current page and scroll to it
      setTimeout(() => {
        const aureusCard = document.querySelector('[data-aureus-chat]')
        if (aureusCard) {
          aureusCard.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
    prevMessageCount.current = chatMessages.length
  }, [chatMessages])

  // ==================== CALCULATIONS ====================
  // Simple intuitive conversions that match how people think about money
  const convertToMonthly = (amount: number, frequency: string) => {
    if (frequency === 'weekly') return amount * 4       // 4 weeks per month
    if (frequency === 'fortnightly') return amount * 2  // 2 fortnights per month
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
  
  // Expenses that are NOT linked to a debt (to avoid double-counting debt payments)
  const monthlyExpenses = expenses.filter(e => !e.targetDebtId && !e.targetGoalId && !e.isDebtPayment).reduce((sum, exp) => sum + convertToMonthly(parseFloat(exp.amount || '0'), exp.frequency), 0)
  
  // Debt payments (from the debts themselves)
  const monthlyDebtPayments = debts.reduce((sum, debt) => sum + convertToMonthly(parseFloat(debt.minPayment || '0'), debt.frequency || 'monthly'), 0)
  
  // Goal savings contributions
  const monthlyGoalSavings = goals.reduce((sum, goal) => sum + convertToMonthly(parseFloat(goal.paymentAmount || '0'), goal.savingsFrequency || 'monthly'), 0)
  
  const totalDebtBalance = debts.reduce((sum, d) => sum + parseFloat(d.balance || '0'), 0)
  const totalOutgoing = monthlyExpenses + monthlyDebtPayments + monthlyGoalSavings
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
    // Exclude debt-linked expenses to avoid double counting
    const expenseTotal = expenses.filter(e => !e.targetDebtId && !e.targetGoalId && !e.isDebtPayment).reduce((sum, exp) => sum + parseFloat(exp.amount || '0') * getOccurrencesInMonth(exp.dueDate, exp.frequency, month, year), 0)
    const debtTotal = debts.reduce((sum, debt) => sum + parseFloat(debt.minPayment || '0') * getOccurrencesInMonth(debt.paymentDate, debt.frequency || 'monthly', month, year), 0)
    const goalTotal = goals.reduce((sum, goal) => sum + parseFloat(goal.paymentAmount || '0') * getOccurrencesInMonth(goal.startDate, goal.savingsFrequency || 'monthly', month, year), 0)
    return { incomeTotal, expenseTotal, debtTotal, goalTotal, total: incomeTotal - expenseTotal - debtTotal - goalTotal }
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

  // ==================== ADVANCED FINANCIAL METRICS ====================
  // These metrics help users understand their financial progress scientifically
  
  // 1️⃣ Capital Efficiency Ratio (CER) - How much of income is being deployed productively
  const productiveCapital = (monthlyGoalSavings + passiveIncome) // Money working for you
  const capitalEfficiencyRatio = monthlyIncome > 0 ? (productiveCapital / monthlyIncome) * 100 : 0
  
  // 2️⃣ Risk Management Factor - Measures financial safety buffers
  const emergencyFund = assets.filter(a => a.type === 'savings').reduce((s, a) => s + parseFloat(a.value || '0'), 0)
  const emergencyMonths = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0
  const riskManagementFactor = Math.min(emergencyMonths / 6, 1) // 1.0 = 6+ months saved
  
  // 3️⃣ Liquidity Factor - How accessible are your assets
  const liquidAssets = assets.filter(a => a.type === 'savings' || a.type === 'investment').reduce((s, a) => s + parseFloat(a.value || '0'), 0)
  const illiquidAssets = assets.filter(a => a.type === 'property' || a.type === 'vehicle').reduce((s, a) => s + parseFloat(a.value || '0'), 0)
  const liquidityFactor = (liquidAssets + illiquidAssets) > 0 ? liquidAssets / (liquidAssets + illiquidAssets) : 0
  
  // 4️⃣ Allocation Optimality - Based on diversification (simplified)
  const assetTypes = [...new Set(assets.map(a => a.type))]
  const allocationOptimality = Math.min(assetTypes.length / 4, 1) // Target 4+ asset types
  
  // 5️⃣ Adjusted Capital Efficiency (ACE) - Sophisticated deployment metric
  const adjustedCapitalEfficiency = capitalEfficiencyRatio * riskManagementFactor * liquidityFactor * (allocationOptimality || 0.25)
  
  // 6️⃣ Drawdown-Adjusted Efficiency (DAE) - Risk-adjusted based on debt load
  const debtToIncomeRatio = monthlyIncome > 0 ? monthlyDebtPayments / monthlyIncome : 0
  const drawdownAdjustedEfficiency = capitalEfficiencyRatio * (1 - Math.min(debtToIncomeRatio, 0.5) * 2)
  
  // 7️⃣ Compounding Velocity (CV) - Would need historical data, using proxy
  // Using savings rate as proxy for potential compounding velocity
  const compoundingVelocity = savingsRate > 0 ? savingsRate * (1 + (passiveIncome / Math.max(monthlyIncome, 1))) : 0
  
  // 8️⃣ Allocation Diversity Score (ADS) - 0-100 score
  const incomeStreamCount = incomeStreams.length
  const assetTypeCount = assetTypes.length
  const allocationDiversityScore = Math.min(((incomeStreamCount * 15) + (assetTypeCount * 20)), 100)
  
  // 9️⃣ Forecast Accuracy Index (FAI) - Would need historical projections vs actuals
  // Placeholder based on whether user is hitting savings targets
  const forecastAccuracyIndex = goals.length > 0 
    ? goals.reduce((sum, g) => {
        const progress = parseFloat(g.saved || '0') / parseFloat(g.target || '1')
        return sum + Math.min(progress * 100, 100)
      }, 0) / goals.length
    : 50 // Default if no goals

  // Overall Financial Health Score (0-100)
  const financialHealthScore = Math.round(
    (capitalEfficiencyRatio * 0.2) +
    (riskManagementFactor * 100 * 0.2) +
    (liquidityFactor * 100 * 0.15) +
    (allocationDiversityScore * 0.15) +
    ((100 - debtToIncomeRatio * 100) * 0.15) +
    (Math.min(passiveCoverage, 100) * 0.15)
  )

  // ==================== DYNAMIC QUEST UNLOCK LOGIC ====================
  // All quests are unlocked from the start - let users explore freely
  const getQuestUnlockStatus = (questId: number): { isUnlocked: boolean, reason?: string } => {
    // All quests unlocked - no artificial gates
    return { isUnlocked: true }
  }

  // Australian Baby Steps with detailed content
  const australianBabySteps = [
    { 
      step: 1, 
      title: 'Starter Emergency Fund', 
      desc: 'Save $2,000 for emergencies', 
      target: 2000, 
      icon: '🛡️',
      aureusAdvice: "This $2,000 is your financial airbag - it stops you going into debt when life throws curveballs. Car breaks down? Unexpected bill? You've got this covered.",
      tips: [
        "Open a separate savings account (don't mix with spending!)",
        "Set up automatic transfers on payday - even $50/fortnight helps",
        "Use a high-interest account (Up, ING, Ubank) to earn while you save",
        "Don't touch it except for TRUE emergencies (Netflix isn't an emergency!)"
      ],
      actionButton: "Let's set up my emergency fund goal"
    },
    { 
      step: 2, 
      title: 'Kill Bad Debt', 
      desc: 'Pay off credit cards, personal loans, BNPL', 
      icon: '💳',
      aureusAdvice: "Credit cards at 20%+ interest will DESTROY your wealth. Every $1,000 in CC debt costs you $200/year in interest. HECS/HELP is fine - it's low interest and income-contingent. Focus on the bad stuff.",
      tips: [
        "List all debts: CC, personal loans, Afterpay, Zip, car loans",
        "DON'T include: HECS/HELP, mortgage (those are 'okay' debts)",
        "Avalanche method: Pay highest interest first (mathematically best)",
        "Snowball method: Pay smallest balance first (psychologically motivating)",
        "Cut up credit cards or freeze them in ice (literally!)"
      ],
      actionButton: "Show me my debt payoff plan"
    },
    { 
      step: 3, 
      title: 'Full Emergency Fund', 
      desc: '3-6 months expenses saved', 
      icon: '🏦',
      aureusAdvice: "Now we're building real security. 3-6 months of expenses means you could lose your job and be FINE. That's freedom. That's sleeping well at night.",
      tips: [
        "Calculate your monthly expenses (rent, food, bills, minimum debt payments)",
        "Multiply by 3 (secure job) or 6 (unstable income/single income household)",
        "This money should be BORING - high-interest savings, not invested",
        "Takes most people 12-24 months - that's okay, you're building a fortress"
      ],
      actionButton: "Calculate my target emergency fund"
    },
    { 
      step: 4, 
      title: 'Invest 15% + Super', 
      desc: 'Salary sacrifice + investments', 
      icon: '📈',
      aureusAdvice: "Your employer already puts 11.5% into super - that's forced savings! Now add salary sacrifice for tax benefits, and invest outside super too. Time + compound interest = millionaire.",
      tips: [
        "Check your super fund - fees matter! Compare on sortedsuper.com.au",
        "Consider salary sacrifice: $100/fortnight saves ~$30 in tax",
        "Outside super: ETFs like VAS, VDHG, or A200 through Stake/CMC/Pearler",
        "Dollar cost average - same amount every month, don't try to time the market",
        "15% of gross income is the target (including super)"
      ],
      actionButton: "Help me start investing"
    },
    { 
      step: 5, 
      title: 'Home Deposit', 
      desc: 'Save 10-20% for your home', 
      icon: '🏠',
      aureusAdvice: "Aussie dream! But it's a marathon, not a sprint. Let me break down the REAL costs so you're not surprised.",
      tips: [
        "5% deposit possible with First Home Guarantee (no LMI, limited spots)",
        "10% deposit = pay LMI (~$8-15k) but get in sooner",
        "20% deposit = no LMI, better rates, but takes longer to save",
        "Don't forget: Stamp duty, legal fees, inspections (~$20-30k extra)",
        "First Home Super Saver: Pull up to $50k from super for deposit"
      ],
      showHomeCalculator: true,
      actionButton: "Show me home buying costs"
    },
    { 
      step: 6, 
      title: 'Pay Off Home Early', 
      desc: 'Extra mortgage payments', 
      icon: '🔑',
      aureusAdvice: "Every extra dollar on your mortgage saves you 3-4x in interest over the loan life. A 30-year loan can become 15 years with consistent extra payments!",
      tips: [
        "Even $100/month extra can cut years off your mortgage",
        "Use an offset account - your savings reduce your interest daily",
        "Make fortnightly payments instead of monthly (26 half-payments = 13 months)",
        "When you get a raise, put half toward the mortgage",
        "Check for redraw fees before making extra payments"
      ],
      actionButton: "Calculate my early payoff"
    },
    { 
      step: 7, 
      title: 'Build Wealth & Give', 
      desc: 'Invest, enjoy, and be generous', 
      icon: '💎',
      aureusAdvice: "You've made it! No bad debt, emergency fund solid, home sorted, investing humming. Now it's about growing wealth AND enjoying life. Give generously - it feels amazing.",
      tips: [
        "Max out super contributions ($27,500/year concessional)",
        "Build passive income streams (dividends, rental income)",
        "Consider family trust structures for tax efficiency",
        "Give to causes you care about - money is a tool, not the goal",
        "Teach your kids about money - break the cycle"
      ],
      actionButton: "Plan my wealth building"
    }
  ]
  
  const getBabyStep = () => {
    const emergencyFund = assets.filter(a => a.type === 'savings').reduce((s, a) => s + parseFloat(a.value || '0'), 0)
    const badDebt = debts.filter(d => parseFloat(d.interestRate || '0') > 5) // Credit cards, personal loans
    const allDebt = debts.filter(d => d.name?.toLowerCase() !== 'mortgage' && d.name?.toLowerCase() !== 'hecs' && d.name?.toLowerCase() !== 'help')
    const mortgageDebt = debts.filter(d => d.name?.toLowerCase().includes('mortgage'))
    const monthlyExpenses3 = monthlyExpenses * 3
    const monthlyExpenses6 = monthlyExpenses * 6
    
    // Step 1: $2,000 starter emergency fund (higher for AU cost of living)
    if (emergencyFund < 2000) {
      return { step: 1, title: 'Starter Emergency Fund', desc: 'Save $2,000 for emergencies', progress: (emergencyFund / 2000) * 100, icon: '🛡️', target: 2000, current: emergencyFund }
    }
    
    // Step 2: Pay off bad debt (credit cards, personal loans, BNPL - NOT HECS/HELP)
    if (badDebt.length > 0) {
      const totalBadDebt = badDebt.reduce((s, d) => s + parseFloat(d.balance || '0'), 0)
      const paidOff = 0 // Would need to track original balances
      return { step: 2, title: 'Kill Bad Debt', desc: 'Pay off credit cards, personal loans, BNPL', progress: 0, icon: '💳', target: totalBadDebt, current: 0, debts: badDebt }
    }
    
    // Step 3: Full emergency fund (3-6 months expenses)
    if (emergencyFund < monthlyExpenses3) {
      return { step: 3, title: 'Full Emergency Fund', desc: '3-6 months expenses saved', progress: (emergencyFund / monthlyExpenses3) * 100, icon: '🏦', target: monthlyExpenses3, current: emergencyFund }
    }
    
    // Step 4: Invest 15% (Super + extra)
    const investmentGoalMet = passiveIncome > 0 || assets.filter(a => a.type === 'investment').length > 0
    if (!investmentGoalMet) {
      return { step: 4, title: 'Invest 15% + Super', desc: 'Salary sacrifice + investments', progress: 50, icon: '📈', target: monthlyIncome * 0.15, current: 0 }
    }
    
    // Step 5: Home deposit (if no mortgage)
    if (mortgageDebt.length === 0 && !assets.some(a => a.type === 'property')) {
      const depositGoal = 100000 // Example target
      const currentDeposit = assets.filter(a => a.name?.toLowerCase().includes('deposit') || a.name?.toLowerCase().includes('house')).reduce((s, a) => s + parseFloat(a.value || '0'), 0)
      return { step: 5, title: 'Home Deposit', desc: 'Save 10-20% for your home', progress: (currentDeposit / depositGoal) * 100, icon: '🏠', target: depositGoal, current: currentDeposit }
    }
    
    // Step 6: Pay off home early
    if (mortgageDebt.length > 0) {
      const mortgageBalance = mortgageDebt.reduce((s, d) => s + parseFloat(d.balance || '0'), 0)
      return { step: 6, title: 'Pay Off Home Early', desc: 'Extra mortgage payments', progress: 0, icon: '🔑', target: mortgageBalance, current: 0 }
    }
    
    // Step 7: Build wealth
    return { step: 7, title: 'Build Wealth & Give', desc: 'Invest, enjoy, and be generous', progress: 100, icon: '💎', target: 0, current: 0 }
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
  
  // Helper function to add items to roadmap
  const addToRoadmap = (name: string, category: string, targetAmount: string | number, icon: string, notes?: string, currentAmount?: number, linkedGoalId?: number) => {
    // Check if already exists
    if (roadmapMilestones.some(m => m.name.toLowerCase() === name.toLowerCase())) {
      alert(`"${name}" is already in your roadmap!`)
      return
    }
    
    const newMilestoneItem = {
      id: Date.now(),
      name,
      category,
      icon,
      targetAmount: typeof targetAmount === 'number' ? targetAmount.toString() : targetAmount,
      currentAmount: currentAmount || 0,
      targetDate: '',
      notes: notes || '',
      completed: false,
      createdAt: new Date().toISOString(),
      linkedGoalId: linkedGoalId || null, // Link to goal if exists
      calendarAlerts: false, // OFF by default - user can enable and configure
      alertFrequency: 'weekly', // weekly, fortnightly, monthly
      alertDay: 1 // 0=Sunday, 1=Monday, etc. OR day of month for monthly
    }
    
    setRoadmapMilestones(prev => [...prev, newMilestoneItem])
    
    // Show confirmation
    alert(`✅ Added "${name}" to your roadmap! You can configure calendar reminders in the Roadmap section.`)
  }
  
  // Sync Goals ↔ Roadmap - when a goal updates, update linked roadmap milestone
  useEffect(() => {
    // Update roadmap milestones that are linked to goals
    setRoadmapMilestones(prev => prev.map(milestone => {
      if (milestone.linkedGoalId) {
        const linkedGoal = goals.find(g => g.id === milestone.linkedGoalId)
        if (linkedGoal) {
          return {
            ...milestone,
            currentAmount: parseFloat(linkedGoal.saved || '0'),
            targetAmount: linkedGoal.target,
            completed: parseFloat(linkedGoal.saved || '0') >= parseFloat(linkedGoal.target || '0')
          }
        }
      }
      return milestone
    }))
  }, [goals])
  
  // Helper to add goal AND roadmap milestone together (linked)
  const addLinkedGoalAndMilestone = (goalData: any, milestoneCategory: string, icon: string) => {
    const goalId = Date.now()
    const goal = { ...goalData, id: goalId }
    setGoals(prev => [...prev, goal])
    
    // Add linked roadmap milestone
    const milestone = {
      id: goalId + 1,
      name: goalData.name,
      category: milestoneCategory,
      icon,
      targetAmount: goalData.target,
      currentAmount: parseFloat(goalData.saved || '0'),
      targetDate: goalData.deadline || '',
      notes: `Linked to goal: ${goalData.name}`,
      completed: false,
      createdAt: new Date().toISOString(),
      linkedGoalId: goalId,
      calendarAlerts: false, // OFF by default
      alertFrequency: goalData.savingsFrequency || 'weekly',
      alertDay: 1
    }
    setRoadmapMilestones(prev => [...prev, milestone])
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

  // ==================== PAYSLIP UPLOAD ====================
  const handlePayslipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setPayslipProcessing(true)
    
    try {
      // Convert to base64 for API
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
      
      // Send to AI for extraction
      const response = await fetch('/api/extract-payslip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, filename: file.name })
      })
      
      if (response.ok) {
        const data = await response.json()
        setExtractedPayslip(data)
        setShowPayslipUpload(true)
      } else {
        alert('Could not process payslip. Please try again or enter manually.')
      }
    } catch (error) {
      console.error('Payslip upload error:', error)
      alert('Could not process payslip. Please try again or enter manually.')
    }
    
    setPayslipProcessing(false)
  }
  
  const confirmPayslipIncome = () => {
    if (extractedPayslip) {
      setIncomeStreams([...incomeStreams, {
        id: Date.now(),
        name: extractedPayslip.employer || 'Salary',
        amount: extractedPayslip.netPay || extractedPayslip.amount || '',
        frequency: extractedPayslip.frequency || 'fortnightly',
        type: 'active',
        startDate: extractedPayslip.payDate || new Date().toISOString().split('T')[0]
      }])
      setExtractedPayslip(null)
      setShowPayslipUpload(false)
    }
  }

  // ==================== AUTOMATION CALCULATOR ====================
  const calculateAutomation = () => {
    // Calculate how much should go to each "bucket" per pay period
    const payFrequency = incomeStreams[0]?.frequency || 'fortnightly'
    const payAmount = parseFloat(incomeStreams[0]?.amount || '0')
    
    // Convert all expenses to match pay frequency
    const convertToPayPeriod = (amount: number, freq: string) => {
      if (freq === payFrequency) return amount
      if (payFrequency === 'fortnightly') {
        if (freq === 'weekly') return amount * 2
        if (freq === 'monthly') return amount / 2
      }
      if (payFrequency === 'weekly') {
        if (freq === 'fortnightly') return amount / 2
        if (freq === 'monthly') return amount / 4
      }
      if (payFrequency === 'monthly') {
        if (freq === 'weekly') return amount * 4
        if (freq === 'fortnightly') return amount * 2
      }
      return amount
    }
    
    // Bills bucket: all expenses + debt payments
    const billsTotal = expenses.filter(e => !e.targetDebtId && !e.targetGoalId).reduce((sum, exp) => 
      sum + convertToPayPeriod(parseFloat(exp.amount || '0'), exp.frequency), 0)
    const debtTotal = debts.reduce((sum, debt) => 
      sum + convertToPayPeriod(parseFloat(debt.minPayment || '0'), debt.frequency || 'monthly'), 0)
    const billsBucket = billsTotal + debtTotal
    
    // Savings bucket: all goal contributions
    const savingsBucket = goals.reduce((sum, goal) => 
      sum + convertToPayPeriod(parseFloat(goal.paymentAmount || '0'), goal.savingsFrequency || 'monthly'), 0)
    
    // Spending: what's left
    const spendingBucket = payAmount - billsBucket - savingsBucket
    
    return {
      payFrequency,
      payAmount,
      bills: {
        total: billsBucket,
        breakdown: [
          ...expenses.filter(e => !e.targetDebtId && !e.targetGoalId).map(e => ({ 
            name: e.name, 
            amount: convertToPayPeriod(parseFloat(e.amount || '0'), e.frequency),
            original: `$${e.amount}/${e.frequency}`
          })),
          ...debts.map(d => ({ 
            name: `${d.name} payment`, 
            amount: convertToPayPeriod(parseFloat(d.minPayment || '0'), d.frequency || 'monthly'),
            original: `$${d.minPayment}/${d.frequency || 'monthly'}`
          }))
        ]
      },
      savings: {
        total: savingsBucket,
        breakdown: goals.map(g => ({ 
          name: g.name, 
          amount: convertToPayPeriod(parseFloat(g.paymentAmount || '0'), g.savingsFrequency || 'monthly'),
          original: `$${g.paymentAmount}/${g.savingsFrequency}`
        }))
      },
      spending: spendingBucket
    }
  }

  // ==================== QUEST FUNCTIONS ====================
  const startQuest = (questId: number) => {
    setPassiveQuests(passiveQuests.map(q => 
      q.id === questId ? { ...q, status: 'in_progress', progress: 10 } : q
    ))
  }
  
  const updateQuestProgress = (questId: number, stepIndex: number) => {
    setPassiveQuests(passiveQuests.map(q => {
      if (q.id === questId) {
        const newProgress = Math.min(100, ((stepIndex + 1) / q.steps.length) * 100)
        return { 
          ...q, 
          progress: newProgress,
          status: newProgress >= 100 ? 'completed' : 'in_progress'
        }
      }
      return q
    }))
  }
  
  const completeQuest = (questId: number, monthlyIncome: number) => {
    setPassiveQuests(passiveQuests.map(q => 
      q.id === questId ? { ...q, status: 'completed', progress: 100, monthlyIncome } : q
    ))
  }
  
  const totalPassiveQuestIncome = passiveQuests.filter(q => q.status === 'completed').reduce((sum, q) => sum + q.monthlyIncome, 0)

  const addTrade = () => {
    if (!newTrade.instrument) return
    
    const tradeWithId = { ...newTrade, id: Date.now() }
    setTrades(prev => [...prev, tradeWithId].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    
    // Update account balance if trade is linked to an account
    if (newTrade.accountId && newTrade.accountId > 0) {
      const pnl = parseFloat(newTrade.profitLoss) || 0
      setTradingAccounts(prev => prev.map(acc => {
        if (acc.id === newTrade.accountId) {
          const newBalance = parseFloat(acc.currentBalance || '0') + pnl
          return { ...acc, currentBalance: newBalance.toString() }
        }
        return acc
      }))
    }
    
    setNewTrade({ 
      date: new Date().toISOString().split('T')[0], 
      time: new Date().toTimeString().slice(0,5),
      instrument: '', 
      direction: 'long', 
      entryPrice: '', 
      exitPrice: '', 
      profitLoss: '', 
      riskAmount: '',
      rMultiple: '',
      accountId: newTrade.accountId, // Keep same account selected
      setupType: '',
      setupGrade: 'A',
      emotionBefore: 'neutral',
      emotionAfter: 'neutral',
      followedPlan: true,
      notes: '',
      screenshot: '',
      tags: [],
      session: 'london',
      holdingTime: '',
      mistakes: []
    })
  }
  
  const deleteTrade = (id: number) => {
    const trade = trades.find(t => t.id === id)
    
    // Reverse the P&L from account if linked
    if (trade && trade.accountId && trade.accountId > 0) {
      const pnl = parseFloat(trade.profitLoss) || 0
      setTradingAccounts(prev => prev.map(acc => {
        if (acc.id === trade.accountId) {
          const newBalance = parseFloat(acc.currentBalance || '0') - pnl
          return { ...acc, currentBalance: newBalance.toString() }
        }
        return acc
      }))
    }
    
    setTrades(trades.filter(t => t.id !== id))
  }

  const addPresetBill = (preset: any) => {
    const amount = prompt(`Enter amount for ${preset.name}:`, preset.amount || '')
    if (!amount) return
    setExpenses([...expenses, { id: Date.now(), name: preset.name, amount, frequency: preset.frequency, category: preset.category, dueDate: new Date().toISOString().split('T')[0] }])
  }

  const addGoalToCalendar = (goal: any) => {
    const payment = parseFloat(goal.paymentAmount || '0')
    if (payment <= 0) { 
      alert('Set a savings amount first (how much you want to save each period)'); 
      return 
    }
    
    // Check if already added to calendar
    if (goal.addedToCalendar) {
      alert('This goal is already on your calendar!')
      return
    }
    
    // Open the date picker for this goal - default to today
    const today = new Date().toISOString().split('T')[0]
    setGoalCalendarPicker({
      goalId: goal.id,
      startDate: today
    })
  }
  
  const confirmGoalToCalendar = () => {
    if (!goalCalendarPicker) return
    
    const goalId = goalCalendarPicker.goalId
    const selectedDate = goalCalendarPicker.startDate
    
    const goal = goals.find(g => g.id === goalId)
    if (!goal) {
      alert('Goal not found!')
      return
    }
    
    // Update the goal with the SELECTED date AND mark as added to calendar
    setGoals(prevGoals => {
      return prevGoals.map(g => {
        if (g.id === goalId) {
          console.log(`Updating goal ${g.name}: startDate from ${g.startDate} to ${selectedDate}`)
          return { 
            ...g, 
            startDate: selectedDate,  // Use the date from the picker
            addedToCalendar: true 
          }
        }
        return g
      })
    })
    
    const alertMsg = `✅ ${goal.name} added to calendar!\n\nFirst payment: ${selectedDate}\nFrequency: ${goal.savingsFrequency}\nAmount: $${goal.paymentAmount}`
    alert(alertMsg)
    
    setGoalCalendarPicker(null)
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
    
    // Parse date string "YYYY-MM-DD" without timezone issues
    const parseDateParts = (dateStr: string) => {
      if (!dateStr) return null
      const parts = dateStr.split('-')
      if (parts.length !== 3) return null
      return { year: parseInt(parts[0]), month: parseInt(parts[1]) - 1, day: parseInt(parts[2]) }
    }
    
    const shouldShowItem = (startDate: string, frequency: string) => {
      if (!startDate) return frequency === 'monthly' && day === 1
      
      const start = parseDateParts(startDate)
      if (!start) return false
      
      // Check if start date is in the future relative to this calendar day
      const startTime = new Date(start.year, start.month, start.day).getTime()
      const checkTime = new Date(year, month, day).getTime()
      if (startTime > checkTime) return false
      
      if (frequency === 'once') {
        return start.day === day && start.month === month && start.year === year
      }
      if (frequency === 'monthly') {
        return start.day === day
      }
      if (frequency === 'weekly') {
        const daysDiff = Math.floor((checkTime - startTime) / 86400000)
        return daysDiff >= 0 && daysDiff % 7 === 0
      }
      if (frequency === 'fortnightly') {
        const daysDiff = Math.floor((checkTime - startTime) / 86400000)
        return daysDiff >= 0 && daysDiff % 14 === 0
      }
      if (frequency === 'quarterly') {
        return start.day === day && (month - start.month + 12) % 3 === 0
      }
      if (frequency === 'yearly') {
        return start.day === day && start.month === month
      }
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

    goals.filter(g => g.paymentAmount && g.startDate && g.addedToCalendar).forEach(goal => {
      if (shouldShowItem(goal.startDate, goal.savingsFrequency)) {
        const id = `goal-${goal.id}-${year}-${month}-${day}`
        items.push({ ...goal, amount: goal.paymentAmount, itemId: id, itemType: 'goal', isPaid: paidOccurrences.has(id) })
      }
    })
    
    // Roadmap milestone deadlines and check-ins
    roadmapMilestones.filter(m => !m.completed && m.calendarAlerts === true).forEach(milestone => {
      // Show on target date if set (deadline)
      if (milestone.targetDate) {
        const target = parseDateParts(milestone.targetDate)
        if (target && target.day === day && target.month === month && target.year === year) {
          const id = `milestone-deadline-${milestone.id}`
          items.push({ 
            ...milestone, 
            name: `🎯 ${milestone.name} DEADLINE`,
            amount: milestone.targetAmount,
            itemId: id, 
            itemType: 'milestone-deadline',
            isPaid: milestone.completed
          })
        }
      }
      
      // Show recurring check-in based on frequency and day settings
      const checkDate = new Date(year, month, day)
      const alertDay = milestone.alertDay ?? 1 // Default to Monday (1) or 1st of month
      const alertFrequency = milestone.alertFrequency || 'weekly'
      
      let shouldShow = false
      
      if (alertFrequency === 'weekly') {
        // alertDay is day of week (0=Sun, 1=Mon, 2=Tue, etc.)
        shouldShow = checkDate.getDay() === alertDay
      } else if (alertFrequency === 'fortnightly') {
        // Every 2 weeks on the specified day
        const dayOfWeek = checkDate.getDay()
        const weekOfYear = Math.floor((checkDate.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
        shouldShow = dayOfWeek === alertDay && weekOfYear % 2 === 0
      } else if (alertFrequency === 'monthly') {
        // alertDay is day of month (1-31)
        shouldShow = day === alertDay
      }
      
      if (shouldShow) {
        const progress = parseFloat(milestone.targetAmount || '0') > 0 
          ? (milestone.currentAmount / parseFloat(milestone.targetAmount || '1') * 100).toFixed(0)
          : 0
        // Only show if not complete and has a target
        if (parseFloat(milestone.targetAmount || '0') > 0 && milestone.currentAmount < parseFloat(milestone.targetAmount || '0')) {
          const id = `milestone-checkin-${milestone.id}-${year}-${month}-${day}`
          items.push({
            ...milestone,
            name: `📍 ${milestone.name} (${progress}%)`,
            amount: parseFloat(milestone.targetAmount || '0') - milestone.currentAmount,
            itemId: id,
            itemType: 'milestone-checkin',
            isPaid: paidOccurrences.has(id)
          })
        }
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
        ? { mode: 'proactive', financialData: { income: incomeStreams, expenses, debts, goals, assets, liabilities }, memory: budgetMemory, countryConfig: currentCountryConfig }
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
    const newUserMessage = { role: 'user' as const, content: response }
    setChatMessages(prev => [...prev, newUserMessage])
    setChatInput('')
    
    try {
      const endpoint = mode === 'budget' ? '/api/budget-coach' : '/api/trading-coach'
      const currentStep = mode === 'budget' ? budgetOnboarding.step : tradingOnboarding.step
      const memory = mode === 'budget' ? budgetMemory : tradingMemory
      
      // Include recent conversation history so AI has context
      const recentHistory = [...chatMessages.slice(-10), newUserMessage]
        .map(m => `${m.role === 'user' ? 'User' : 'Aureus'}: ${m.content}`)
        .join('\n')
      
      // Build appropriate body based on mode
      const bodyData = mode === 'budget' 
        ? { 
            mode: 'onboarding', 
            onboardingStep: currentStep, 
            userResponse: response,
            conversationHistory: recentHistory,
            memory,
            financialData: { income: incomeStreams, expenses, debts, goals, assets, liabilities },
            countryConfig: currentCountryConfig
          }
        : {
            mode: 'onboarding',
            onboardingStep: currentStep,
            userResponse: response,
            conversationHistory: recentHistory,
            memory,
            tradingData: { trades, accounts: tradingAccounts },
            tradeIdeaSettings,
            tradingRules
          }
      
      const apiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      })
      
      const data = await apiResponse.json()
      
      // Execute any actions returned by the AI FIRST
      let addedSummary = ''
      if (data.actions && Array.isArray(data.actions) && data.actions.length > 0) {
        executeAIActions(data.actions)
        
        // Build summary of what was added (budget mode)
        const incomeAdded = data.actions.filter((a: any) => a.type === 'addIncome')
        const expenseAdded = data.actions.filter((a: any) => a.type === 'addExpense')
        const debtAdded = data.actions.filter((a: any) => a.type === 'addDebt')
        const goalAdded = data.actions.filter((a: any) => a.type === 'addGoal')
        
        // Trading mode actions
        const accountAdded = data.actions.filter((a: any) => a.type === 'addAccount')
        const ruleAdded = data.actions.filter((a: any) => a.type === 'addTradingRule')
        const tradeAdded = data.actions.filter((a: any) => a.type === 'addTrade')
        const milestoneAdded = data.actions.filter((a: any) => a.type === 'addTradingMilestone')
        
        const parts = []
        if (incomeAdded.length > 0) {
          const names = incomeAdded.map((a: any) => a.data?.name || 'Income').join(', ')
          parts.push(`💰 Income: ${names}`)
        }
        if (expenseAdded.length > 0) {
          const names = expenseAdded.map((a: any) => a.data?.name || 'Expense').join(', ')
          parts.push(`💸 Expense: ${names}`)
        }
        if (debtAdded.length > 0) {
          const names = debtAdded.map((a: any) => a.data?.name || 'Debt').join(', ')
          parts.push(`💳 Debt: ${names}`)
        }
        if (goalAdded.length > 0) {
          const names = goalAdded.map((a: any) => a.data?.name || 'Goal').join(', ')
          parts.push(`🎯 Goal: ${names}`)
        }
        // Trading actions
        if (accountAdded.length > 0) {
          const names = accountAdded.map((a: any) => a.data?.name || 'Account').join(', ')
          parts.push(`📊 Account: ${names}`)
        }
        if (ruleAdded.length > 0) {
          const names = ruleAdded.map((a: any) => a.data?.rule || 'Rule').join(', ')
          parts.push(`📋 Rule: ${names}`)
        }
        if (tradeAdded.length > 0) {
          const names = tradeAdded.map((a: any) => a.data?.instrument || 'Trade').join(', ')
          parts.push(`📈 Trade: ${names}`)
        }
        if (milestoneAdded.length > 0) {
          const names = milestoneAdded.map((a: any) => a.data?.name || 'Milestone').join(', ')
          parts.push(`🎯 Milestone: ${names}`)
        }
        
        if (parts.length > 0) {
          addedSummary = `\n\n✅ Added: ${parts.join(' | ')}`
        }
      }
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: (data.message || data.raw || "I'm processing that - what would you like to do next?") + addedSummary }])
      
      // Debug: log if we got an unexpected response
      if (!data.message && !data.raw) {
        console.log('Unexpected API response:', data)
      }
      
      // Legacy support for extractedData
      if (data.extractedData) {
        if (mode === 'budget') setBudgetMemory((prev: any) => ({ ...prev, ...data.extractedData }))
        else setTradingMemory((prev: any) => ({ ...prev, ...data.extractedData }))
      }
      
      if (data.isComplete) {
        if (mode === 'budget') {
          setBudgetOnboarding({ isActive: false, step: 'complete' })
          setBudgetMemory((prev: any) => ({ ...prev, onboardingComplete: true }))
          
          // After a brief pause, suggest automation setup
          setTimeout(() => {
            const auto = calculateAutomation()
            if (auto.payAmount > 0) {
              setChatMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `🎉 **Your budget is all set up!**\n\n` +
                  `Now here's where the magic happens - let's make your money **manage itself**.\n\n` +
                  `**🤖 Set & Forget Automation**\n` +
                  `I can show you how to set up automatic transfers so every payday:\n` +
                  `• 💳 $${auto.bills.total.toFixed(0)} goes to Bills (auto-pays your expenses)\n` +
                  `• 🎯 $${auto.savings.total.toFixed(0)} goes to Savings (builds your goals)\n` +
                  `• 💵 $${auto.spending.toFixed(0)} stays for spending\n\n` +
                  `Would you like me to walk you through setting this up? It takes about 10 minutes and then you'll never have to think about bills again!\n\n` +
                  `Also, would you like me to send you **payment reminders** before bills are due?`
              }])
            }
          }, 1500)
        } else {
          setTradingOnboarding({ isActive: false, step: 'complete' })
          setTradingMemory((prev: any) => ({ ...prev, onboardingComplete: true }))
        }
        setTimeout(() => fetchProactiveInsight(mode), 500)
      } else if (data.nextStep) {
        if (mode === 'budget') {
          setBudgetOnboarding(prev => ({ ...prev, step: data.nextStep }))
          // When moving to 'choice' or 'income' step, switch to dashboard/command centre AFTER a delay
          // This ensures user sees the message first
          if (data.nextStep === 'choice' || data.nextStep === 'income') {
            setTimeout(() => {
              setActiveTab('dashboard')
            }, 1500) // Wait 1.5 seconds so user sees the message
          }
          // When moving to 'path' step, switch to path tab to show options
          if (data.nextStep === 'path') {
            setTimeout(() => {
              setActiveTab('path')
            }, 1500)
          }
        }
        else {
          setTradingOnboarding(prev => ({ ...prev, step: data.nextStep }))
          if (data.nextStep === 'choice') {
            setTimeout(() => {
              setActiveTab('trading')
            }, 1500)
          }
        }
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
              time: data.time || new Date().toTimeString().slice(0,5),
              instrument: data.instrument,
              direction: data.direction || 'long',
              entryPrice: data.entryPrice || '',
              exitPrice: data.exitPrice || '',
              profitLoss: data.profitLoss.toString().replace(/[$,]/g, ''),
              riskAmount: data.riskAmount || '',
              rMultiple: data.rMultiple || '',
              accountId: data.accountId || 0,
              setupType: data.setupType || '',
              setupGrade: data.setupGrade || 'A',
              emotionBefore: data.emotionBefore || 'neutral',
              emotionAfter: data.emotionAfter || 'neutral',
              followedPlan: data.followedPlan !== false,
              notes: data.notes || '',
              screenshot: data.screenshot || '',
              tags: data.tags || [],
              session: data.session || 'london',
              holdingTime: data.holdingTime || '',
              mistakes: data.mistakes || []
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

        // ===== BUDGET ROADMAP ACTIONS =====
        case 'addRoadmapMilestone':
          if (data.name) {
            // Check if already exists
            const exists = roadmapMilestones.some(m => m.name.toLowerCase() === data.name.toLowerCase())
            if (!exists) {
              setRoadmapMilestones(prev => [...prev, {
                id: Date.now(),
                name: data.name,
                targetAmount: data.targetAmount?.toString().replace(/[$,]/g, '') || '0',
                currentAmount: data.currentAmount || 0,
                targetDate: data.targetDate || '',
                category: data.category || 'savings',
                icon: data.icon || '🎯',
                notes: data.notes || '',
                completed: false,
                createdAt: new Date().toISOString()
              }])
            }
          }
          break
          
        case 'updateRoadmapMilestone':
          if (data.id) {
            setRoadmapMilestones(prev => prev.map(item => {
              if (item.id === data.id || Math.floor(item.id) === Math.floor(data.id)) {
                return {
                  ...item,
                  ...(data.name && { name: data.name }),
                  ...(data.targetAmount !== undefined && { targetAmount: data.targetAmount.toString().replace(/[$,]/g, '') }),
                  ...(data.currentAmount !== undefined && { currentAmount: parseFloat(data.currentAmount.toString().replace(/[$,]/g, '')) }),
                  ...(data.targetDate && { targetDate: data.targetDate }),
                  ...(data.category && { category: data.category }),
                  ...(data.notes !== undefined && { notes: data.notes }),
                  ...(data.completed !== undefined && { completed: data.completed })
                }
              }
              return item
            }))
          }
          break
          
        case 'deleteRoadmapMilestone':
          if (data.id) {
            setRoadmapMilestones(prev => prev.filter(item => item.id !== data.id && Math.floor(item.id) !== Math.floor(data.id)))
          }
          break
          
        // ===== ASSET ACTIONS =====
        case 'addAsset':
          if (data.name && data.value) {
            setAssets(prev => [...prev, {
              id: Date.now(),
              name: data.name,
              value: data.value?.toString().replace(/[$,]/g, ''),
              type: data.type || 'savings'
            }])
          }
          break
          
        case 'updateAsset':
          if (data.id) {
            setAssets(prev => prev.map(item => {
              if (item.id === data.id || Math.floor(item.id) === Math.floor(data.id)) {
                return {
                  ...item,
                  ...(data.name && { name: data.name }),
                  ...(data.value && { value: data.value.toString().replace(/[$,]/g, '') }),
                  ...(data.type && { type: data.type })
                }
              }
              return item
            }))
          }
          break
          
        case 'deleteAsset':
          if (data.id) {
            setAssets(prev => prev.filter(item => item.id !== data.id && Math.floor(item.id) !== Math.floor(data.id)))
          }
          break

        // ===== MEMORY ACTIONS =====
        case 'setMemory':
          // Check if this is for trading or budget
          if (appMode === 'trading') {
            setTradingMemory((prev: any) => {
              const updated = { ...prev }
              if (data.name) updated.name = data.name
              if (data.experience) updated.experience = data.experience
              if (data.tradingStyle) updated.tradingStyle = data.tradingStyle
              if (data.instruments) updated.instruments = data.instruments
              if (data.propFirmGoals) updated.propFirmGoals = { ...(prev.propFirmGoals || {}), ...data.propFirmGoals }
              if (data.personalAccountGoals) updated.personalAccountGoals = { ...(prev.personalAccountGoals || {}), ...data.personalAccountGoals }
              if (data.psychology) updated.psychology = { ...(prev.psychology || {}), ...data.psychology }
              if (data.preferences) updated.preferences = { ...(prev.preferences || {}), ...data.preferences }
              return updated
            })
          } else {
            setBudgetMemory((prev: any) => {
              const updated = { ...prev }
              if (data.name) updated.name = data.name
              if (data.payDay) updated.payDay = data.payDay
              if (data.lifeEvents) updated.lifeEvents = data.lifeEvents
              if (data.currentStep) updated.currentStep = data.currentStep
              if (data.financialPath) updated.financialPath = data.financialPath
              if (data.targetGoal) updated.targetGoal = data.targetGoal
              if (data.bigGoals) updated.bigGoals = { ...(prev.bigGoals || {}), ...data.bigGoals }
              if (data.preferences) updated.preferences = { ...prev.preferences, ...data.preferences }
              if (data.patterns) updated.patterns = [...(prev.patterns || []), ...data.patterns]
              if (data.notes) updated.notes = [...(prev.notes || []), ...data.notes]
              return updated
            })
          }
          break
        
        // ===== TRADING ACTIONS =====
        case 'addAccount':
          if (data.name && data.startingBalance) {
            setTradingAccounts(prev => [...prev, {
              id: Date.now(),
              name: data.name,
              type: data.type || 'personal',
              propFirm: data.propFirm || '',
              phase: data.phase || '',
              startingBalance: data.startingBalance?.toString().replace(/[$,]/g, ''),
              currentBalance: data.currentBalance || data.startingBalance?.toString().replace(/[$,]/g, ''),
              maxDrawdown: data.maxDrawdown || '',
              dailyDrawdown: data.dailyDrawdown || '',
              profitTarget: data.profitTarget || '',
              riskPerTrade: data.riskPerTrade || '1',
              isActive: true
            }])
          }
          break
          
        case 'addTradingRule':
          if (data.rule) {
            setTradingRules(prev => [...prev, {
              id: Date.now(),
              rule: data.rule,
              category: data.category || 'risk',
              enabled: data.enabled !== false
            }])
          }
          break
          
        case 'toggleRule':
          if (data.id) {
            setTradingRules(prev => prev.map(r => r.id === data.id ? { ...r, enabled: !r.enabled } : r))
          }
          break
          
        case 'addTrade':
          if (data.instrument) {
            const newTradeData = {
              id: Date.now(),
              date: data.date || new Date().toISOString().split('T')[0],
              time: data.time || new Date().toTimeString().slice(0,5),
              instrument: data.instrument,
              direction: data.direction || 'long',
              entryPrice: data.entryPrice || '',
              exitPrice: data.exitPrice || '',
              profitLoss: data.profitLoss?.toString().replace(/[$,]/g, '') || '0',
              riskAmount: data.riskAmount || '',
              rMultiple: data.rMultiple || '',
              accountId: data.accountId || 0,
              setupType: data.setupType || data.setup || '',
              setupGrade: data.setupGrade || 'A',
              emotionBefore: data.emotionBefore || data.emotion || 'neutral',
              emotionAfter: data.emotionAfter || 'neutral',
              followedPlan: data.followedPlan !== false,
              notes: data.notes || '',
              screenshot: data.screenshot || '',
              tags: data.tags || [],
              session: data.session || 'london',
              holdingTime: data.holdingTime || '',
              mistakes: data.mistakes || []
            }
            setTrades(prev => [...prev, newTradeData])
            
            // Update account balance if linked
            if (data.accountId && data.accountId > 0) {
              const pnl = parseFloat(data.profitLoss?.toString().replace(/[$,]/g, '') || '0')
              setTradingAccounts(prev => prev.map(acc => {
                if (acc.id === data.accountId) {
                  const newBalance = parseFloat(acc.currentBalance || '0') + pnl
                  return { ...acc, currentBalance: newBalance.toString() }
                }
                return acc
              }))
            }
          }
          break
          
        case 'addTradingMilestone':
          if (data.name) {
            setTradingRoadmap(prev => [...prev, {
              id: Date.now(),
              name: data.name,
              targetAmount: data.targetAmount || '0',
              currentAmount: data.currentAmount || 0,
              targetDate: data.targetDate || '',
              category: data.category || 'prop',
              icon: data.icon || '🎯',
              notes: data.notes || '',
              completed: false,
              createdAt: new Date().toISOString()
            }])
          }
          break
          
        case 'addPayout':
          if (data.amount) {
            const payoutData = {
              id: Date.now(),
              date: data.date || new Date().toISOString().split('T')[0],
              amount: parseFloat(data.amount.toString().replace(/[$,]/g, '')),
              accountId: data.accountId || 0,
              accountName: data.accountName || '',
              propFirm: data.propFirm || '',
              notes: data.notes || '',
              addToIncome: data.addToIncome !== false
            }
            setPayouts(prev => [...prev, payoutData])
            
            // Also add to income if requested
            if (payoutData.addToIncome) {
              const incomeName = payoutData.propFirm 
                ? `${payoutData.propFirm} Payout` 
                : payoutData.accountName 
                  ? `${payoutData.accountName} Payout`
                  : 'Trading Payout'
              
              setIncomeStreams(prev => [...prev, {
                id: Date.now() + 1,
                name: incomeName,
                amount: payoutData.amount.toString(),
                frequency: 'once',
                type: 'trading',
                startDate: payoutData.date,
                notes: payoutData.notes
              }])
            }
          }
          break
          
        case 'showAnalytics':
          // Switch to trading tab and analytics subtab
          setActiveTab('trading')
          setTradingSubTab('analytics')
          if (data.tab) {
            setAnalyticsTab(data.tab)
          }
          if (data.dateRange) {
            setAnalyticsDateRange(data.dateRange)
          }
          break
          
        case 'showCompoundCalculator':
          // Switch to trading tab and open compound calculator
          setActiveTab('trading')
          setTradingSubTab('accounts')
          // Set calculator values if provided
          if (data.startingBalance || data.monthlyAdd || data.dailyReturn) {
            // Store compound calc settings - these will be picked up by the calculator UI
            setCompoundCalcSettings({
              startingBalance: data.startingBalance || '10000',
              monthlyAdd: data.monthlyAdd || '0',
              dailyReturn: data.dailyReturn || '0.5',
              tradingDays: data.tradingDays || '20',
              months: data.months || '12'
            })
          }
          break
          
        case 'createTradingRoadmap':
          if (data.goal && data.phases) {
            setTradingRoadmapGoal({
              title: data.goal.title || 'My Trading Goal',
              targetDate: data.goal.targetDate || '',
              type: data.goal.type || 'prop_funded'
            })
            setTradingRoadmapPhases(data.phases.map((phase: any, idx: number) => ({
              id: Date.now() + idx,
              name: phase.name,
              duration: phase.duration,
              milestones: phase.milestones.map((m: any, mIdx: number) => ({
                id: Date.now() + idx * 100 + mIdx,
                task: m.task,
                completed: m.completed || false
              }))
            })))
            // Switch to roadmap view
            setActiveTab('trading')
            setTradingSubTab('accounts')
          }
          break
          
        case 'updateRoadmapMilestone':
          if (data.phaseIndex !== undefined && data.milestoneIndex !== undefined) {
            setTradingRoadmapPhases(prev => prev.map((phase, pIdx) => {
              if (pIdx === data.phaseIndex) {
                return {
                  ...phase,
                  milestones: phase.milestones.map((m: any, mIdx: number) => {
                    if (mIdx === data.milestoneIndex) {
                      return { ...m, completed: data.completed !== false }
                    }
                    return m
                  })
                }
              }
              return phase
            }))
          }
          break
          
        case 'generateWeeklyReport':
          // Generate and show weekly report
          const report = generateWeeklyReport()
          // The report data is used by Aureus in its response
          setActiveTab('trading')
          setTradingSubTab('analytics')
          setAnalyticsTab('overview')
          break
          
        case 'openQuickTrade':
          setQuickTradeType(data.type || null)
          setShowQuickTradeModal(true)
          break
          
        case 'showBudgetAnalytics':
          setShowBudgetAnalytics(true)
          if (data.tab) setBudgetAnalyticsTab(data.tab)
          break
          
        case 'addFinancialMilestone':
          if (data.title) {
            setFinancialMilestones(prev => [...prev, {
              id: Date.now(),
              title: data.title,
              date: data.date || new Date().toISOString().split('T')[0],
              amount: data.amount,
              type: data.type || 'general'
            }])
          }
          break
          
        case 'addBillReminder':
          if (data.name && data.amount) {
            setBillReminders(prev => [...prev, {
              id: Date.now(),
              name: data.name,
              amount: data.amount.toString(),
              dueDate: data.dueDate || '',
              autoPay: data.autoPay || false,
              paid: false
            }])
          }
          break
          
        case 'addSubscription':
          if (data.name && data.cost) {
            setSubscriptionAudit(prev => [...prev, {
              id: Date.now(),
              name: data.name,
              cost: data.cost.toString(),
              frequency: data.frequency || 'monthly',
              lastUsed: data.lastUsed || new Date().toISOString().split('T')[0],
              category: data.category || 'entertainment'
            }])
          }
          break
      }
    })
  }
  
  // Compound calculator settings (can be set by Aureus)
  const [compoundCalcSettings, setCompoundCalcSettings] = useState({
    startingBalance: '10000',
    monthlyAdd: '0',
    dailyReturn: '0.5',
    tradingDays: '20',
    months: '12'
  })

  // Handle chart image upload for trading analysis
  const handleChartUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Convert to base64 for display and sending to API
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })
    
    setPendingChartImage(base64)
    setChatInput(prev => prev || "Analyze this chart for me")
  }

  // Quick message sender for "Ask Aureus" buttons - bypasses state timing issues
  const sendQuickMessage = async (message: string) => {
    if (!message.trim() || isLoading) return
    
    setChatMessages(prev => [...prev, { role: 'user', content: message }])
    setChatInput('')
    setIsLoading(true)
    
    try {
      const endpoint = appMode === 'budget' ? '/api/budget-coach' : '/api/trading-coach'
      const recentHistory = [...chatMessages.slice(-10), { role: 'user', content: message }]
        .map(m => `${m.role === 'user' ? 'User' : 'Aureus'}: ${m.content}`)
        .join('\n')
      
      const body = appMode === 'budget'
        ? { mode: 'question', question: message, conversationHistory: recentHistory, financialData: { income: incomeStreams, expenses, debts, goals, assets, liabilities, roadmapMilestones }, memory: budgetMemory, countryConfig: currentCountryConfig }
        : { mode: 'question', question: message, conversationHistory: recentHistory, tradingData: { trades, accounts: tradingAccounts, roadmap: tradingRoadmap }, memory: tradingMemory, tradeIdeaSettings, tradingRules }
      
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await response.json()
      
      if (data.actions && Array.isArray(data.actions)) {
        executeAIActions(data.actions)
      }
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.message || data.advice || data.raw || "I'm here to help!" }])
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble with that. Let's try again!" }])
    }
    setIsLoading(false)
  }

  const handleChatMessage = async () => {
    if ((!chatInput.trim() && !pendingChartImage) || isLoading) return
    const message = chatInput.trim()
    
    // Check AI usage limits (skip for onboarding)
    const aiStatus = canUseAI()
    if (!aiStatus.allowed && !budgetOnboarding.isActive && !tradingOnboarding.isActive) {
      setShowUpgradePrompt(true)
      return
    }
    
    if ((appMode === 'budget' && budgetOnboarding.isActive) || (appMode === 'trading' && tradingOnboarding.isActive)) {
      await handleOnboardingResponse(message, appMode!)
      setPendingChartImage(null)
      return
    }
    
    // Track AI usage for free tier
    trackAIUsage()
    
    // Show user message (with image indicator if present)
    const userMessageContent = pendingChartImage 
      ? `${message}\n[📊 Chart image attached]`
      : message
    setChatMessages(prev => [...prev, { role: 'user', content: userMessageContent, image: pendingChartImage || undefined }])
    setChatInput('')
    setIsLoading(true)
    
    try {
      const endpoint = appMode === 'budget' ? '/api/budget-coach' : '/api/trading-coach'
      
      // Build conversation history for context
      const recentHistory = [...chatMessages.slice(-10), { role: 'user', content: message }]
        .map(m => `${m.role === 'user' ? 'User' : 'Aureus'}: ${m.content}`)
        .join('\n')
      
      const body = appMode === 'budget'
        ? { mode: 'question', question: message, conversationHistory: recentHistory, financialData: { income: incomeStreams, expenses, debts, goals, assets, liabilities, roadmapMilestones }, memory: budgetMemory, countryConfig: currentCountryConfig }
        : { 
            mode: 'question', 
            question: message, 
            conversationHistory: recentHistory, 
            tradingData: { trades, accounts: tradingAccounts, roadmap: tradingRoadmap }, 
            memory: tradingMemory,
            chartImage: pendingChartImage || undefined, // Send image to trading coach
            tradeIdeaSettings, // User's R:R and risk preferences
            tradingRules // User's custom rules
          }
      
      // Clear pending image
      setPendingChartImage(null)
      
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
      setChatMessages([{ role: 'assistant', content: "Hey! 👋 I'm Aureus, your financial operations coach. I'll help you optimize your cash flow, eliminate liabilities, and build automated revenue streams.\n\nLet's get to know each other. What should I call you?" }])
    } else {
      setTradingOnboarding({ isActive: true, step: 'greeting' })
      setChatMessages([{ role: 'assistant', content: "Hey! 📈 I'm Aureus, your trading operations coach.\n\nI'll help you optimize capital deployment, maintain psychological discipline, and systematically scale your accounts.\n\nWhat's your name?" }])
    }
  }

  const handleModeSelect = (mode: 'budget' | 'trading') => {
    setAppMode(mode)
    setShowModeSelector(false)
    setProactiveInsight(null)
    setTourStep(0) // Reset tour step
    
    const memory = mode === 'budget' ? budgetMemory : tradingMemory
    const tourDone = mode === 'budget' ? budgetTourCompleted : tradingTourCompleted
    const currentOnboarding = mode === 'budget' ? budgetOnboarding : tradingOnboarding
    
    // If onboarding is currently active (in progress), keep the chat and continue
    if (currentOnboarding.isActive && currentOnboarding.step !== 'complete') {
      // Don't clear chat - let them continue where they left off
      setActiveTab('dashboard')
      return
    }
    
    if (!memory.onboardingComplete && !tourDone) {
      // Show tour for new users of THIS mode
      setChatMessages([])
      setShowTour(true)
    } else if (!memory.onboardingComplete) {
      // Tour completed but onboarding not done - check if we were mid-onboarding
      if (currentOnboarding.step && currentOnboarding.step !== 'greeting' && currentOnboarding.step !== 'complete') {
        // Resume onboarding where they left off
        setActiveTab('dashboard')
        if (mode === 'budget') {
          setBudgetOnboarding({ ...currentOnboarding, isActive: true })
        } else {
          setTradingOnboarding({ ...currentOnboarding, isActive: true })
        }
      } else {
        // Start fresh onboarding
        setActiveTab('dashboard')
        setChatMessages([])
        startOnboarding(mode)
      }
    } else {
      // Returning user - go to quickview, keep existing chat
      setActiveTab('quickview')
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
    const rate = parseFloat(tradingCalculator.returnRate) / 100 || 0
    const reinvest = parseFloat(tradingCalculator.reinvestRate) / 100 || 1
    const years = parseInt(tradingCalculator.years) || 0
    const months = parseInt(tradingCalculator.months) || 0
    const days = parseInt(tradingCalculator.days) || 0
    
    // Calculate total calendar days
    const totalCalendarDays = years * 365 + months * 30 + days
    
    // Calculate trading days based on selected days
    const tradingDaysPerWeek = tradingCalculator.includeDays.length
    const totalTradingDays = Math.floor(totalCalendarDays * (tradingDaysPerWeek / 7))
    
    // Generate breakdown
    const breakdown: any[] = []
    let balance = capital
    let totalEarnings = 0
    let totalContributed = capital
    
    // Get start date
    const startDate = new Date(tradingCalculator.startDate || Date.now())
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayMap: {[key: string]: number} = { 'S': 0, 'M': 1, 'T': 2, 'W': 3, 'T2': 4, 'F': 5, 'S2': 6 }
    const activeDays = tradingCalculator.includeDays.map(d => {
      if (d === 'T') return 2
      if (d === 'T2') return 4
      if (d === 'S') return 6
      return dayMap[d] || 1
    })
    
    let currentDate = new Date(startDate)
    let tradingDayCount = 0
    
    for (let d = 0; d < totalCalendarDays && tradingDayCount < totalTradingDays; d++) {
      const dayOfWeek = currentDate.getDay()
      const isActiveTradingDay = activeDays.includes(dayOfWeek === 0 ? 7 : dayOfWeek) || 
        (tradingCalculator.includeDays.includes('M') && dayOfWeek === 1) ||
        (tradingCalculator.includeDays.includes('T') && dayOfWeek === 2) ||
        (tradingCalculator.includeDays.includes('W') && dayOfWeek === 3) ||
        (tradingCalculator.includeDays.includes('T2') && dayOfWeek === 4) ||
        (tradingCalculator.includeDays.includes('F') && dayOfWeek === 5) ||
        (tradingCalculator.includeDays.includes('S') && dayOfWeek === 6) ||
        (tradingCalculator.includeDays.includes('S2') && dayOfWeek === 0)
      
      if (!isActiveTradingDay) {
        // Add excluded day to breakdown
        breakdown.push({
          date: new Date(currentDate),
          dayName: dayNames[dayOfWeek],
          excluded: true,
          earnings: 0,
          totalEarnings: totalEarnings,
          balance: balance
        })
      } else {
        // Calculate daily return
        const dailyEarnings = balance * rate * reinvest
        balance += dailyEarnings
        totalEarnings += dailyEarnings
        tradingDayCount++
        
        breakdown.push({
          date: new Date(currentDate),
          dayName: dayNames[dayOfWeek],
          excluded: false,
          earnings: dailyEarnings,
          totalEarnings: totalEarnings,
          balance: balance
        })
      }
      
      // Add deposits/withdrawals
      if (tradingCalculator.additionalContributions === 'deposits') {
        const depositAmt = parseFloat(tradingCalculator.depositAmount) || 0
        if (tradingCalculator.depositFrequency === 'daily' && !breakdown[breakdown.length-1]?.excluded) {
          balance += depositAmt
          totalContributed += depositAmt
        } else if (tradingCalculator.depositFrequency === 'weekly' && d % 7 === 0 && d > 0) {
          balance += depositAmt
          totalContributed += depositAmt
        } else if (tradingCalculator.depositFrequency === 'monthly' && d % 30 === 0 && d > 0) {
          balance += depositAmt
          totalContributed += depositAmt
        }
      } else if (tradingCalculator.additionalContributions === 'withdrawals') {
        const withdrawAmt = parseFloat(tradingCalculator.withdrawAmount) || 0
        if (tradingCalculator.withdrawFrequency === 'monthly' && d % 30 === 0 && d > 0) {
          balance = Math.max(0, balance - withdrawAmt)
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // Calculate end date
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + totalCalendarDays)
    
    return { 
      futureValue: balance, 
      totalContributed, 
      profit: balance - totalContributed, 
      totalCalendarDays, 
      totalTradingDays: tradingDayCount,
      breakdown,
      endDate,
      excludedDays: tradingCalculator.includeWeekends ? [] : ['Sat', 'Sun']
    }
  }

  const forexPropResults = calculateForexProp()
  const futuresPropResults = calculateFuturesProp()
  const tradingResults = calculateTradingCompound()

  // Budget Tour content
  const budgetTourSteps = [
    {
      title: "Welcome to Aureus! 🌟",
      content: "I'm your AI financial companion, here to help you achieve financial freedom - where your passive income covers all your expenses so you can live life on YOUR terms.",
      icon: "✨"
    },
    {
      title: "The FIRE Number 🔥",
      content: "FIRE = Financial Independence, Retire Early. Your FIRE number is 25x your annual expenses. When your Super + investments reach this amount, you can live off the returns forever!",
      icon: "🔥",
      highlight: "path"
    },
    {
      title: "Australian Baby Steps 👶",
      content: "We follow localised Baby Steps: 1) $2K emergency fund, 2) Kill bad debt (not HECS!), 3) 3-6 months savings, 4) Invest 15% + Super, 5) Home deposit, 6) Pay off mortgage, 7) Build wealth!",
      icon: "👶",
      highlight: "path"
    },
    {
      title: "Escape the Rat Race 🐀",
      content: "The goal: Passive Income > Monthly Expenses = FREEDOM! I'll suggest passive income 'quests' - from high-interest savings to dividend ETFs - and help you automate your money.",
      icon: "🚀",
      highlight: "path"
    },
    {
      title: "Set & Forget Automation 🤖",
      content: "Once we know your budget, I'll help you set up automatic transfers so your bills pay themselves and savings grow without thinking about it. No more manual transfers!",
      icon: "🤖"
    },
    {
      title: "Let's Get Started! 💪",
      content: "I'll ask about your income, expenses, debts, and goals. You can upload a payslip to speed things up! Just tell me what you know - I'll ask for anything I need.",
      icon: "💬"
    }
  ]

  // Trading Tour content
  const tradingTourSteps = [
    {
      title: "Welcome, Trader! 📈",
      content: "I'm Aureus, your AI trading mentor. I'll help you stay disciplined, track your psychology, manage prop firm challenges, and compound your personal account.",
      icon: "✨"
    },
    {
      title: "Prop Firm Mastery 🏆",
      content: "I know the rules for FTMO, MyFundedFX, The5ers, Funded Next, and more. I'll track your progress, warn you about drawdown limits, and keep you compliant.",
      icon: "🏆"
    },
    {
      title: "Psychology & Tilt Detection 🧠",
      content: "Trading is 80% psychology. I monitor for revenge trading, overtrading, and emotional decisions. When you're tilting, I'll tell you to step away before you blow an account.",
      icon: "🧠"
    },
    {
      title: "Personal Account Compounding 💎",
      content: "For your personal capital, consistency beats big wins. 0.5% daily = 214% yearly. I'll show you the power of compounding and help you stay patient.",
      icon: "💎"
    },
    {
      title: "Trading Rules & Discipline 📋",
      content: "Set your own trading rules and I'll track compliance. Max trades per day, risk per trade, no trading during news - whatever keeps you profitable.",
      icon: "📋"
    },
    {
      title: "Let's Build Your Edge! 🚀",
      content: "I'll learn your trading style, experience level, and psychological weaknesses. Then I'll be your accountability partner every trading day.",
      icon: "💬"
    }
  ]

  const tourSteps = appMode === 'budget' ? budgetTourSteps : tradingTourSteps

  // ==================== RENDER: TOUR ====================
  if (showTour) {
    const currentTourStep = tourSteps[tourStep]
    const isBudgetMode = appMode === 'budget'
    return (
      <div style={{ minHeight: '100vh', background: darkMode ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '600px', width: '100%', background: theme.cardBg, borderRadius: '24px', padding: '48px', textAlign: 'center' as const, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
            {tourSteps.map((_, i) => (
              <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i === tourStep ? (isBudgetMode ? theme.accent : theme.warning) : theme.border, transition: 'all 0.3s' }} />
            ))}
          </div>
          
          {/* Icon */}
          <div style={{ fontSize: '72px', marginBottom: '24px' }}>{currentTourStep.icon}</div>
          
          {/* Title */}
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: theme.text, margin: '0 0 16px 0' }}>{currentTourStep.title}</h1>
          
          {/* Content */}
          <p style={{ fontSize: '16px', color: theme.textMuted, lineHeight: 1.7, margin: '0 0 32px 0' }}>{currentTourStep.content}</p>
          
          {/* Visual highlights for BUDGET mode */}
          {isBudgetMode && tourStep === 1 && (
            <div style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ color: 'white', fontSize: '14px', opacity: 0.9 }}>Your FIRE Number</div>
              <div style={{ color: 'white', fontSize: '36px', fontWeight: 700 }}>$750,000</div>
              <div style={{ color: 'white', fontSize: '12px', opacity: 0.8 }}>Based on $2,500/month expenses × 12 × 25</div>
            </div>
          )}
          
          {isBudgetMode && tourStep === 2 && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' as const, marginBottom: '24px' }}>
              {['1. $2K Fund', '2. Kill Debt', '3. Full Fund', '4. Invest 15%', '5. Home', '6. Pay Home', '7. Wealth'].map((step, i) => (
                <span key={i} style={{ padding: '8px 12px', background: i === 0 ? theme.success : theme.border, color: i === 0 ? 'white' : theme.textMuted, borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}>{step}</span>
              ))}
            </div>
          )}
          
          {isBudgetMode && tourStep === 3 && (
            <div style={{ background: theme.bg, borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: theme.textMuted }}>Monthly Expenses</span>
                <span style={{ color: theme.danger, fontWeight: 600 }}>$2,500</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: theme.textMuted }}>Passive Income</span>
                <span style={{ color: theme.success, fontWeight: 600 }}>$500</span>
              </div>
              <div style={{ height: '8px', background: theme.border, borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '20%', height: '100%', background: theme.success }} />
              </div>
              <div style={{ color: theme.purple, fontSize: '14px', marginTop: '8px', fontWeight: 600 }}>20% to Freedom! 🎯</div>
            </div>
          )}
          
          {/* Visual highlights for TRADING mode */}
          {!isBudgetMode && tourStep === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: theme.warning + '20', borderRadius: '12px', padding: '16px', border: '1px solid ' + theme.warning }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
                <div style={{ color: theme.warning, fontWeight: 600 }}>FTMO</div>
                <div style={{ color: theme.textMuted, fontSize: '12px' }}>10% target, 5% daily DD</div>
              </div>
              <div style={{ background: theme.purple + '20', borderRadius: '12px', padding: '16px', border: '1px solid ' + theme.purple }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>💎</div>
                <div style={{ color: theme.purple, fontWeight: 600 }}>Funded Next</div>
                <div style={{ color: theme.textMuted, fontSize: '12px' }}>90% profit split</div>
              </div>
            </div>
          )}
          
          {!isBudgetMode && tourStep === 2 && (
            <div style={{ background: theme.danger + '20', borderRadius: '16px', padding: '20px', marginBottom: '24px', border: '1px solid ' + theme.danger }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: theme.text, fontWeight: 600 }}>🚨 Tilt Score</span>
                <span style={{ color: theme.danger, fontSize: '28px', fontWeight: 700 }}>75%</span>
              </div>
              <div style={{ color: theme.danger, fontSize: '13px', marginTop: '8px' }}>⚠️ 4 trades after a loss - STEP AWAY!</div>
            </div>
          )}
          
          {!isBudgetMode && tourStep === 3 && (
            <div style={{ background: theme.success + '20', borderRadius: '16px', padding: '20px', marginBottom: '24px', border: '1px solid ' + theme.success }}>
              <div style={{ color: theme.textMuted, fontSize: '12px' }}>$5,000 → 12 months → 0.5% daily</div>
              <div style={{ color: theme.success, fontSize: '32px', fontWeight: 700, margin: '8px 0' }}>$18,389</div>
              <div style={{ color: theme.success, fontSize: '14px' }}>+268% growth through compounding 📈</div>
            </div>
          )}
          
          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {tourStep > 0 && (
              <button onClick={() => setTourStep(tourStep - 1)} style={{ padding: '14px 28px', background: 'transparent', border: '2px solid ' + theme.border, borderRadius: '12px', color: theme.textMuted, cursor: 'pointer', fontWeight: 600 }}>
                ← Back
              </button>
            )}
            
            {tourStep < tourSteps.length - 1 ? (
              <button onClick={() => setTourStep(tourStep + 1)} style={{ padding: '14px 28px', background: isBudgetMode ? theme.accent : theme.warning, border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                Next →
              </button>
            ) : (
              <button onClick={() => { 
                setShowTour(false); 
                setActiveTab('chat'); // Go to dedicated chat page
                if (isBudgetMode) {
                  setBudgetTourCompleted(true);
                  setBudgetOnboarding({ isActive: true, step: 'greeting' }); 
                  setChatMessages([{ role: 'assistant', content: "Hey! 👋 I'm Aureus, your financial operations coach.\n\nI'll help you optimize cash flow, eliminate liabilities, and build automated revenue streams that work while you sleep.\n\nLet's get started. What should I call you?" }])
                } else {
                  setTradingTourCompleted(true);
                  setTradingOnboarding({ isActive: true, step: 'greeting' }); 
                  setChatMessages([{ role: 'assistant', content: "Hey! 📈 I'm Aureus, your trading operations coach.\n\nI'll help you optimize capital deployment, maintain psychological discipline, and systematically scale your accounts.\n\nWhat's your name?" }])
                }
              }} style={{ padding: '14px 32px', background: isBudgetMode ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '16px' }}>
                Let's Go! 🚀
              </button>
            )}
          </div>
          
          {/* Skip link */}
          <button onClick={() => { 
            setShowTour(false); 
            setActiveTab('chat'); // Go to dedicated chat page
            if (isBudgetMode) {
              setBudgetTourCompleted(true);
              setBudgetOnboarding({ isActive: true, step: 'greeting' }); 
              setChatMessages([{ role: 'assistant', content: "Hey! 👋 I'm Aureus, your financial operations coach.\n\nI'll help you optimize cash flow, eliminate liabilities, and build automated revenue streams that work while you sleep.\n\nLet's get started. What should I call you?" }])
            } else {
              setTradingTourCompleted(true);
              setTradingOnboarding({ isActive: true, step: 'greeting' }); 
              setChatMessages([{ role: 'assistant', content: "Hey! 📈 I'm Aureus, your trading operations coach.\n\nI'll help you optimize capital deployment, maintain psychological discipline, and systematically scale your accounts.\n\nWhat's your name?" }])
            }
          }} style={{ marginTop: '24px', background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '14px' }}>
            Skip tour
          </button>
        </div>
      </div>
    );
  }

  // ==================== RENDER: MODE SELECTOR ====================
  if (showModeSelector) {
    return (
      <div style={{ minHeight: '100vh', background: darkMode ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' as const, marginBottom: '48px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)',
            border: '4px solid #fcd34d',
            margin: '0 auto 24px auto'
          }}>
            <span style={{ color: '#78350f', fontWeight: 800, fontSize: '40px' }}>A</span>
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: 800, color: theme.text, margin: '0 0 12px 0' }}>Welcome to Aureus</h1>
          <p style={{ fontSize: '18px', color: theme.textMuted, margin: 0 }}>Optimize the tool we call money</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '700px', width: '100%' }}>
          <button onClick={() => handleModeSelect('budget')} style={{ padding: '32px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '24px', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
            <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>Budget Mode</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0 0 16px 0', fontSize: '14px' }}>{budgetMemory.onboardingComplete ? `Welcome back${budgetMemory.name ? ', ' + budgetMemory.name : ''}!` : 'Optimize your financial operations'}</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
              {['Baby Steps', 'FIRE Path', 'Automation', 'Growth'].map(tag => <span key={tag} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '11px', color: 'white' }}>{tag}</span>)}
            </div>
          </button>
          
          <button onClick={() => handleModeSelect('trading')} style={{ padding: '32px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '24px', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📈</div>
            <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>Trading Mode</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0 0 16px 0', fontSize: '14px' }}>{tradingMemory.onboardingComplete ? `Welcome back${tradingMemory.name ? ', ' + tradingMemory.name : ''}!` : 'Master your trading operations'}</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
              {['Prop Firms', 'Psychology', 'Compounding'].map(tag => <span key={tag} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '11px', color: 'white' }}>{tag}</span>)}
            </div>
          </button>
        </div>
        
        {totalPL !== 0 && <div style={{ marginTop: '24px', padding: '16px 24px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border }}><p style={{ color: theme.textMuted, margin: 0, fontSize: '14px' }}>💡 Trading P&L (${totalPL.toFixed(0)}) flows into Budget Mode</p></div>}
        
        <button onClick={() => setDarkMode(!darkMode)} style={{ marginTop: '32px', padding: '12px 24px', background: 'transparent', border: '2px solid ' + theme.border, borderRadius: '12px', color: theme.textMuted, cursor: 'pointer' }}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
      </div>
    );
  }

  // ==================== RENDER: MAIN APP ====================
  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      {/* PRICING MODAL */}
      {showPricingModal && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowPricingModal(false)}>
          <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '32px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto' as const }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center' as const, marginBottom: '32px' }}>
              <h2 style={{ color: theme.text, fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0' }}>Upgrade to Aureus Pro</h2>
              <p style={{ color: theme.textMuted, margin: 0 }}>Unlock unlimited AI coaching and take control of your finances</p>
            </div>       
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
              {/* FREE TIER */}
              <div style={{ padding: '24px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '16px', border: '2px solid ' + theme.border }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ color: theme.textMuted, fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>Free</div>
                  <div style={{ color: theme.text, fontSize: '36px', fontWeight: 800 }}>$0<span style={{ fontSize: '16px', fontWeight: 400 }}>/month</span></div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
                  {['5 AI chats per month', 'Basic budgeting tools', 'Income & expense tracking', 'Debt tracking', 'Goal setting'].map(feature => (
                    <li key={feature} style={{ color: theme.text, fontSize: '14px', padding: '8px 0', borderBottom: '1px solid ' + theme.border, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: theme.success }}>✓</span> {feature}
                    </li>
                  ))}
                  {['Unlimited AI coaching', 'Financial roadmap', 'Trading mode', 'Calendar alerts'].map(feature => (
                    <li key={feature} style={{ color: theme.textMuted, fontSize: '14px', padding: '8px 0', borderBottom: '1px solid ' + theme.border, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: theme.textMuted }}>✗</span> {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  disabled={userSubscription.plan === 'free'}
                  style={{ width: '100%', padding: '14px', background: userSubscription.plan === 'free' ? theme.textMuted : theme.cardBg, color: userSubscription.plan === 'free' ? 'white' : theme.text, border: userSubscription.plan === 'free' ? 'none' : '2px solid ' + theme.border, borderRadius: '12px', cursor: userSubscription.plan === 'free' ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '14px' }}
                >
                  {userSubscription.plan === 'free' ? '✓ Current Plan' : 'Downgrade'}
                </button>
              </div>
              
              {/* PRO MONTHLY - RECOMMENDED */}
              <div style={{ padding: '24px', background: 'linear-gradient(135deg, ' + theme.success + '20, ' + theme.accent + '20)', borderRadius: '16px', border: '3px solid ' + theme.success, position: 'relative' as const }}>
                <div style={{ position: 'absolute' as const, top: '-12px', left: '50%', transform: 'translateX(-50%)', background: theme.success, color: 'white', padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>MOST POPULAR</div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ color: theme.success, fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>Pro Monthly</div>
                  <div style={{ color: theme.text, fontSize: '36px', fontWeight: 800 }}>$20<span style={{ fontSize: '16px', fontWeight: 400 }}>/month</span></div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
                  {['Unlimited AI coaching', 'All budgeting features', 'Financial roadmap builder', 'Baby Steps & FIRE path', 'Trading mode', 'Calendar alerts', 'Goal automation', 'Priority support'].map(feature => (
                    <li key={feature} style={{ color: theme.text, fontSize: '14px', padding: '8px 0', borderBottom: '1px solid ' + theme.border + '50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: theme.success }}>✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => window.open(LEMONSQUEEZY_URLS.pro_monthly, '_blank')}
                  disabled={userSubscription.plan === 'pro'}
                  style={{ width: '100%', padding: '14px', background: userSubscription.plan === 'pro' ? theme.textMuted : theme.success, color: 'white', border: 'none', borderRadius: '12px', cursor: userSubscription.plan === 'pro' ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '15px' }}
                >
                  {userSubscription.plan === 'pro' ? '✓ Current Plan' : 'Get Pro Monthly'}
                </button>
              </div>
              
              {/* PRO ANNUAL - BEST VALUE */}
              <div style={{ padding: '24px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '16px', border: '2px solid ' + theme.purple, position: 'relative' as const }}>
                <div style={{ position: 'absolute' as const, top: '-12px', left: '50%', transform: 'translateX(-50%)', background: theme.purple, color: 'white', padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>SAVE 30%</div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ color: theme.purple, fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>Pro Annual</div>
                  <div style={{ color: theme.text, fontSize: '36px', fontWeight: 800 }}>$14<span style={{ fontSize: '16px', fontWeight: 400 }}>/month</span></div>
                  <div style={{ color: theme.success, fontSize: '13px', fontWeight: 600 }}>$168/year (save $72)</div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
                  {['Everything in Pro Monthly', '2 months FREE', 'Locked-in pricing', 'Annual savings'].map(feature => (
                    <li key={feature} style={{ color: theme.text, fontSize: '14px', padding: '8px 0', borderBottom: '1px solid ' + theme.border, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: theme.purple }}>✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => window.open(LEMONSQUEEZY_URLS.pro_annual, '_blank')}
                  disabled={userSubscription.plan === 'annual'}
                  style={{ width: '100%', padding: '14px', background: userSubscription.plan === 'annual' ? theme.textMuted : theme.purple, color: 'white', border: 'none', borderRadius: '12px', cursor: userSubscription.plan === 'annual' ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '15px' }}
                >
                  {userSubscription.plan === 'annual' ? '✓ Current Plan' : 'Get Pro Annual'}
                </button>
              </div>
            </div>
            
            {/* Comparison Table */}
            <div style={{ background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <h4 style={{ color: theme.text, margin: '0 0 16px 0', fontSize: '16px' }}>Why Aureus Pro?</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div style={{ textAlign: 'center' as const }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤖</div>
                  <div style={{ color: theme.text, fontWeight: 600, marginBottom: '4px' }}>Unlimited AI Coaching</div>
                  <div style={{ color: theme.textMuted, fontSize: '13px' }}>Get personalized advice anytime, no limits</div>
                </div>
                <div style={{ textAlign: 'center' as const }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗺️</div>
                  <div style={{ color: theme.text, fontWeight: 600, marginBottom: '4px' }}>Financial Roadmap</div>
                  <div style={{ color: theme.textMuted, fontSize: '13px' }}>Step-by-step path to financial freedom</div>
                </div>
                <div style={{ textAlign: 'center' as const }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
                  <div style={{ color: theme.text, fontWeight: 600, marginBottom: '4px' }}>Save $500+/month</div>
                  <div style={{ color: theme.textMuted, fontSize: '13px' }}>Users report major savings with AI guidance</div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: theme.textMuted, fontSize: '13px', margin: 0 }}>
                Cancel anytime • Secure payment via Lemon Squeezy • 30-day money-back guarantee
              </p>
              <button onClick={() => setShowPricingModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.textMuted, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* UPGRADE PROMPT (shown when free tier limit reached) */}
      {showUpgradePrompt && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowUpgradePrompt(false)}>
          <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '32px', maxWidth: '500px', width: '100%', textAlign: 'center' as const }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
              <span style={{ fontSize: '40px' }}>🔒</span>
            </div>
            <h2 style={{ color: theme.text, fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>You've reached your free limit!</h2>
            <p style={{ color: theme.textMuted, margin: '0 0 24px 0' }}>
              You've used all 5 AI chats for this month. Upgrade to Pro for unlimited coaching.
            </p>
            
            <div style={{ background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '12px' }}>
                <div><div style={{ color: theme.textMuted, fontSize: '12px' }}>Monthly</div><div style={{ color: theme.text, fontWeight: 700, fontSize: '24px' }}>$20</div></div>
                <div style={{ borderLeft: '1px solid ' + theme.border, paddingLeft: '24px' }}><div style={{ color: theme.purple, fontSize: '12px' }}>Annual (save 30%)</div><div style={{ color: theme.text, fontWeight: 700, fontSize: '24px' }}>$14<span style={{ fontSize: '14px' }}>/mo</span></div></div>
              </div>
              <div style={{ color: theme.success, fontSize: '14px', fontWeight: 600 }}>✓ Unlimited AI coaching • ✓ All features</div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setShowUpgradePrompt(false); setShowPricingModal(true); }} style={{ flex: 1, padding: '14px', background: theme.success, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '15px' }}>
                See Pricing
              </button>
              <button onClick={() => setShowUpgradePrompt(false)} style={{ padding: '14px 24px', background: 'transparent', border: '2px solid ' + theme.border, borderRadius: '12px', color: theme.textMuted, cursor: 'pointer', fontWeight: 600 }}>
                Maybe Later
              </button>
            </div>
            
            <p style={{ color: theme.textMuted, fontSize: '12px', marginTop: '16px' }}>Your chats reset on the 1st of each month</p>
          </div>
        </div>
      )}
      
      {/* FEEDBACK MODAL */}
      {showFeedbackModal && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowFeedbackModal(false)}>
          <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '32px', maxWidth: '500px', width: '100%' }} onClick={e => e.stopPropagation()}>
            {feedbackSent ? (
              <div style={{ textAlign: 'center' as const, padding: '40px 0' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
                <h3 style={{ color: theme.text, margin: '0 0 8px 0' }}>Thank you!</h3>
                <p style={{ color: theme.textMuted, margin: 0 }}>Your feedback has been sent.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ color: theme.text, fontSize: '22px', fontWeight: 700, margin: 0 }}>💬 Send Feedback</h2>
                  <button onClick={() => setShowFeedbackModal(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '24px', cursor: 'pointer' }}>×</button>
                </div>
                
                <p style={{ color: theme.textMuted, marginBottom: '20px', fontSize: '14px' }}>
                  Found a bug? Have an idea? I'd love to hear from you!
                </p>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>What's this about?</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { value: 'bug', label: '🐛 Bug', color: theme.danger },
                      { value: 'feature', label: '💡 Feature', color: theme.purple },
                      { value: 'general', label: '💬 General', color: theme.accent }
                    ].map(type => (
                      <button
                        key={type.value}
                        onClick={() => setFeedbackType(type.value as any)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: feedbackType === type.value ? type.color + '20' : theme.cardBg,
                          color: feedbackType === type.value ? type.color : theme.textMuted,
                          border: `2px solid ${feedbackType === type.value ? type.color : theme.border}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '13px'
                        }}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>Your message</label>
                  <textarea
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                    placeholder={
                      feedbackType === 'bug' ? "What happened? What did you expect to happen?" :
                      feedbackType === 'feature' ? "What feature would help you?" :
                      "What's on your mind?"
                    }
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      padding: '12px',
                      background: darkMode ? '#1e293b' : '#f8fafc',
                      border: '1px solid ' + theme.border,
                      borderRadius: '8px',
                      color: theme.text,
                      fontSize: '14px',
                      resize: 'vertical' as const,
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={sendFeedback}
                    disabled={!feedbackText.trim()}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: feedbackText.trim() ? theme.success : theme.textMuted,
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: feedbackText.trim() ? 'pointer' : 'not-allowed',
                      fontWeight: 700,
                      fontSize: '15px'
                    }}
                  >
                    📧 Send Feedback
                  </button>
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    style={{
                      padding: '14px 24px',
                      background: 'transparent',
                      border: '2px solid ' + theme.border,
                      borderRadius: '12px',
                      color: theme.textMuted,
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Cancel
                  </button>
                </div>
                
                <p style={{ color: theme.textMuted, fontSize: '12px', marginTop: '16px', textAlign: 'center' as const }}>
                  This will open your email app with the feedback ready to send.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* TRADE IMPORT MODAL */}
      {showTradeImport && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowTradeImport(false)}>
          <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '32px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto' as const }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: theme.text, fontSize: '22px', fontWeight: 700, margin: 0 }}>📥 Import Trades</h2>
              <button onClick={() => setShowTradeImport(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            
            {importedTrades.length === 0 ? (
              <>
                <p style={{ color: theme.textMuted, marginBottom: '20px', fontSize: '14px' }}>
                  Import trades from your broker or trading platform. Export your trades as CSV and upload below.
                </p>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>Platform</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                    {[
                      { value: 'metatrader', label: '📊 MetaTrader 4/5' },
                      { value: 'tradingview', label: '📈 TradingView' },
                      { value: 'generic', label: '📁 Generic CSV' }
                    ].map(platform => (
                      <button
                        key={platform.value}
                        onClick={() => setImportPlatform(platform.value as any)}
                        style={{
                          padding: '10px 16px',
                          background: importPlatform === platform.value ? theme.accent + '20' : theme.cardBg,
                          color: importPlatform === platform.value ? theme.accent : theme.text,
                          border: `2px solid ${importPlatform === platform.value ? theme.accent : theme.border}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '13px'
                        }}
                      >
                        {platform.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {selectedAccountId === null && tradingAccounts.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>Import to Account</label>
                    <select
                      value={selectedAccountId || ''}
                      onChange={e => setSelectedAccountId(parseInt(e.target.value))}
                      style={{ ...inputStyle, width: '100%' }}
                    >
                      <option value="">Select an account...</option>
                      {tradingAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div style={{ 
                  border: `2px dashed ${theme.border}`, 
                  borderRadius: '12px', 
                  padding: '40px', 
                  textAlign: 'center' as const,
                  marginBottom: '20px'
                }}>
                  <input 
                    type="file" 
                    ref={tradeFileInputRef} 
                    accept=".csv" 
                    onChange={handleTradeFileUpload} 
                    style={{ display: 'none' }} 
                  />
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
                  <button
                    onClick={() => tradeFileInputRef.current?.click()}
                    style={{
                      padding: '12px 24px',
                      background: theme.accent,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '14px'
                    }}
                  >
                    Choose CSV File
                  </button>
                  <p style={{ color: theme.textMuted, fontSize: '12px', marginTop: '12px' }}>
                    Supported: .csv files from {importPlatform === 'metatrader' ? 'MetaTrader History export' : importPlatform === 'tradingview' ? 'TradingView export' : 'any platform'}
                  </p>
                </div>
                
                <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '8px' }}>
                  <h4 style={{ color: theme.text, margin: '0 0 8px 0', fontSize: '13px' }}>💡 How to export from {importPlatform === 'metatrader' ? 'MetaTrader' : importPlatform === 'tradingview' ? 'TradingView' : 'your platform'}:</h4>
                  {importPlatform === 'metatrader' && (
                    <ol style={{ color: theme.textMuted, fontSize: '12px', margin: 0, paddingLeft: '20px' }}>
                      <li>Open Account History tab</li>
                      <li>Right-click → Select period (e.g., Last Month)</li>
                      <li>Right-click → Save as Report</li>
                      <li>Choose CSV format</li>
                    </ol>
                  )}
                  {importPlatform === 'tradingview' && (
                    <ol style={{ color: theme.textMuted, fontSize: '12px', margin: 0, paddingLeft: '20px' }}>
                      <li>Go to your Portfolio or Trading Panel</li>
                      <li>Click Export button</li>
                      <li>Select CSV format</li>
                    </ol>
                  )}
                  {importPlatform === 'generic' && (
                    <p style={{ color: theme.textMuted, fontSize: '12px', margin: 0 }}>
                      CSV should include columns like: date, symbol/instrument, direction/side, entry price, exit price, profit/pnl
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <p style={{ color: theme.textMuted, marginBottom: '16px', fontSize: '14px' }}>
                  Found {importedTrades.length} trades. Select which ones to import:
                </p>
                
                <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => setImportedTrades(importedTrades.map(t => ({ ...t, selected: true })))} style={{ padding: '8px 16px', background: theme.success, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Select All</button>
                  <button onClick={() => setImportedTrades(importedTrades.map(t => ({ ...t, selected: false })))} style={{ padding: '8px 16px', background: theme.textMuted, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Deselect All</button>
                </div>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto' as const, marginBottom: '20px' }}>
                  {importedTrades.map((trade, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setImportedTrades(importedTrades.map((t, i) => i === idx ? { ...t, selected: !t.selected } : t))}
                      style={{ 
                        padding: '12px', 
                        marginBottom: '8px', 
                        background: trade.selected 
                          ? (parseFloat(trade.profitLoss || '0') >= 0 ? theme.success + '20' : theme.danger + '20')
                          : (darkMode ? '#1e293b' : '#f8fafc'),
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: trade.selected ? `2px solid ${parseFloat(trade.profitLoss || '0') >= 0 ? theme.success : theme.danger}` : '2px solid transparent'
                      }}
                    >
                      <div>
                        <div style={{ color: theme.text, fontWeight: 600 }}>{trade.instrument || 'Unknown'}</div>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>
                          {trade.date} • {trade.direction} • Entry: {trade.entryPrice || '-'} → Exit: {trade.exitPrice || '-'}
                        </div>
                      </div>
                      <div style={{ 
                        color: parseFloat(trade.profitLoss || '0') >= 0 ? theme.success : theme.danger,
                        fontWeight: 700,
                        fontSize: '16px'
                      }}>
                        {parseFloat(trade.profitLoss || '0') >= 0 ? '+' : ''}${parseFloat(trade.profitLoss || '0').toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={confirmTradeImport}
                    disabled={importedTrades.filter(t => t.selected).length === 0}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: importedTrades.filter(t => t.selected).length > 0 ? theme.success : theme.textMuted,
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: importedTrades.filter(t => t.selected).length > 0 ? 'pointer' : 'not-allowed',
                      fontWeight: 700,
                      fontSize: '15px'
                    }}
                  >
                    ✓ Import {importedTrades.filter(t => t.selected).length} Trades
                  </button>
                  <button
                    onClick={() => { setImportedTrades([]); setShowTradeImport(false) }}
                    style={{
                      padding: '14px 24px',
                      background: 'transparent',
                      border: '2px solid ' + theme.border,
                      borderRadius: '12px',
                      color: theme.textMuted,
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* SETUP MANAGER MODAL */}
      {showSetupManager && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowSetupManager(false)}>
          <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '32px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto' as const }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: theme.text, fontSize: '22px', fontWeight: 700, margin: 0 }}>🎯 Manage Setups & Tags</h2>
              <button onClick={() => setShowSetupManager(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            
            {/* Trade Setups */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: theme.text, fontSize: '16px', margin: '0 0 12px 0' }}>📊 Trade Setups (Strategies)</h3>
              <p style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '12px' }}>
                Tag your trades with the setup/strategy you used. Track which setups work best for you.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px', marginBottom: '12px' }}>
                {tradeSetups.map((setup, idx) => (
                  <div key={idx} style={{ 
                    padding: '6px 12px', 
                    background: theme.accent + '20', 
                    color: theme.accent, 
                    borderRadius: '16px', 
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {setup}
                    <button 
                      onClick={() => setTradeSetups(tradeSetups.filter((_, i) => i !== idx))}
                      style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '14px', padding: 0 }}
                    >×</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  value={newSetupName} 
                  onChange={e => setNewSetupName(e.target.value)}
                  placeholder="Add new setup..."
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button 
                  onClick={() => { 
                    if (newSetupName.trim() && !tradeSetups.includes(newSetupName.trim())) {
                      setTradeSetups([...tradeSetups, newSetupName.trim()])
                      setNewSetupName('')
                    }
                  }}
                  style={{ padding: '8px 16px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  + Add
                </button>
              </div>
            </div>
            
            {/* Trade Tags */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: theme.text, fontSize: '16px', margin: '0 0 12px 0' }}>🏷️ Trade Tags</h3>
              <p style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '12px' }}>
                Add tags to trades for additional context (e.g., "Perfect Entry", "FOMO Trade").
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
                {tradeTags.map((tag, idx) => (
                  <div key={idx} style={{ 
                    padding: '6px 12px', 
                    background: theme.purple + '20', 
                    color: theme.purple, 
                    borderRadius: '16px', 
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {tag}
                    <button 
                      onClick={() => setTradeTags(tradeTags.filter((_, i) => i !== idx))}
                      style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '14px', padding: 0 }}
                    >×</button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Mistake Tags */}
            <div>
              <h3 style={{ color: theme.text, fontSize: '16px', margin: '0 0 12px 0' }}>❌ Mistake Tags</h3>
              <p style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '12px' }}>
                Track common mistakes to learn what costs you money.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
                {tradeMistakes.map((mistake, idx) => (
                  <div key={idx} style={{ 
                    padding: '6px 12px', 
                    background: theme.danger + '20', 
                    color: theme.danger, 
                    borderRadius: '16px', 
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {mistake}
                    <button 
                      onClick={() => setTradeMistakes(tradeMistakes.filter((_, i) => i !== idx))}
                      style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '14px', padding: 0 }}
                    >×</button>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => setShowSetupManager(false)}
              style={{
                width: '100%',
                marginTop: '24px',
                padding: '14px',
                background: theme.accent,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '15px'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
      
      {/* PAYOUT MODAL */}
      {showPayoutModal && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowPayoutModal(false)}>
          <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '32px', maxWidth: '500px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: theme.text, fontSize: '22px', fontWeight: 700, margin: 0 }}>💰 Log Payout</h2>
              <button onClick={() => setShowPayoutModal(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            
            <p style={{ color: theme.textMuted, marginBottom: '20px', fontSize: '14px' }}>
              Record a withdrawal or payout from your trading accounts. This helps track your trading income.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
              {/* Amount */}
              <div>
                <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Amount *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: theme.success, fontSize: '20px', fontWeight: 700 }}>$</span>
                  <input
                    type="number"
                    value={newPayout.amount}
                    onChange={e => setNewPayout({ ...newPayout, amount: e.target.value })}
                    placeholder="0.00"
                    style={{ ...inputStyle, flex: 1, fontSize: '24px', fontWeight: 700, padding: '12px' }}
                  />
                </div>
              </div>
              
              {/* Date */}
              <div>
                <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Date</label>
                <input
                  type="date"
                  value={newPayout.date}
                  onChange={e => setNewPayout({ ...newPayout, date: e.target.value })}
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
              
              {/* Account Selection */}
              {tradingAccounts.length > 0 && (
                <div>
                  <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>From Account</label>
                  <select
                    value={newPayout.accountId}
                    onChange={e => {
                      const acc = tradingAccounts.find(a => a.id === parseInt(e.target.value))
                      setNewPayout({ 
                        ...newPayout, 
                        accountId: parseInt(e.target.value),
                        accountName: acc?.name || '',
                        propFirm: acc?.propFirm || ''
                      })
                    }}
                    style={{ ...inputStyle, width: '100%' }}
                  >
                    <option value={0}>Select account...</option>
                    {tradingAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} {acc.propFirm ? `(${acc.propFirm})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Prop Firm (if no accounts) */}
              {tradingAccounts.length === 0 && (
                <div>
                  <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Prop Firm / Source</label>
                  <input
                    type="text"
                    value={newPayout.propFirm}
                    onChange={e => setNewPayout({ ...newPayout, propFirm: e.target.value })}
                    placeholder="e.g., FTMO, Personal Account"
                    style={{ ...inputStyle, width: '100%' }}
                  />
                </div>
              )}
              
              {/* Notes */}
              <div>
                <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Notes (optional)</label>
                <input
                  type="text"
                  value={newPayout.notes}
                  onChange={e => setNewPayout({ ...newPayout, notes: e.target.value })}
                  placeholder="e.g., First payout, Monthly withdrawal"
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
              
              {/* Add to Income Toggle */}
              <div 
                onClick={() => setNewPayout({ ...newPayout, addToIncome: !newPayout.addToIncome })}
                style={{ 
                  padding: '12px 16px', 
                  background: newPayout.addToIncome ? theme.success + '20' : (darkMode ? '#1e293b' : '#f8fafc'),
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: newPayout.addToIncome ? `2px solid ${theme.success}` : '2px solid transparent'
                }}
              >
                <div>
                  <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>Add to Budget Income</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>Include this payout in your budget calculations</div>
                </div>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '6px', 
                  background: newPayout.addToIncome ? theme.success : theme.border,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700
                }}>
                  {newPayout.addToIncome ? '✓' : ''}
                </div>
              </div>
            </div>
            
            {/* Payout History Summary */}
            {payouts.length > 0 && (
              <div style={{ marginTop: '20px', padding: '12px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: theme.textMuted, fontSize: '12px' }}>Total Payouts:</span>
                  <span style={{ color: theme.success, fontWeight: 700 }}>${totalPayouts.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.textMuted, fontSize: '12px' }}>This Month:</span>
                  <span style={{ color: theme.success, fontWeight: 700 }}>${thisMonthPayouts.toLocaleString()}</span>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={addPayout}
                disabled={!newPayout.amount}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: newPayout.amount ? theme.success : theme.textMuted,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: newPayout.amount ? 'pointer' : 'not-allowed',
                  fontWeight: 700,
                  fontSize: '15px'
                }}
              >
                💰 Log Payout
              </button>
              <button
                onClick={() => setShowPayoutModal(false)}
                style={{
                  padding: '14px 24px',
                  background: 'transparent',
                  border: '2px solid ' + theme.border,
                  borderRadius: '12px',
                  color: theme.textMuted,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* QUICK TRADE MODAL */}
      {showQuickTradeModal && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowQuickTradeModal(false)}>
          <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '32px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' as const }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: theme.text, fontSize: '22px', fontWeight: 700, margin: 0 }}>
                {quickTradeType === 'win' ? '🟢 Log Win' : quickTradeType === 'loss' ? '🔴 Log Loss' : '📓 Log Trade'}
              </h2>
              <button onClick={() => setShowQuickTradeModal(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            
            {/* Quick Win/Loss Buttons */}
            {!quickTradeType && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button 
                  onClick={() => setQuickTradeType('win')}
                  style={{ flex: 1, padding: '20px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '12px', cursor: 'pointer' }}
                >
                  <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🟢</span>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>WIN</span>
                </button>
                <button 
                  onClick={() => setQuickTradeType('loss')}
                  style={{ flex: 1, padding: '20px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', borderRadius: '12px', cursor: 'pointer' }}
                >
                  <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🔴</span>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>LOSS</span>
                </button>
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* P&L Amount */}
              <div>
                <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>P&L Amount *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: quickTradeType === 'loss' ? theme.danger : theme.success, fontSize: '20px', fontWeight: 700 }}>
                    {quickTradeType === 'loss' ? '-$' : '+$'}
                  </span>
                  <input
                    type="number"
                    value={newTrade.profitLoss.replace('-', '')}
                    onChange={e => setNewTrade({ ...newTrade, profitLoss: quickTradeType === 'loss' ? `-${e.target.value}` : e.target.value })}
                    placeholder="0.00"
                    style={{ ...inputStyle, flex: 1, fontSize: '20px', fontWeight: 700, padding: '12px' }}
                  />
                </div>
              </div>
              
              {/* Risk Amount (for R calculation) */}
              <div>
                <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Risk Amount (1R)</label>
                <input
                  type="number"
                  value={newTrade.riskAmount}
                  onChange={e => {
                    const risk = parseFloat(e.target.value) || 0
                    const pnl = Math.abs(parseFloat(newTrade.profitLoss) || 0)
                    const rMultiple = risk > 0 ? (pnl / risk).toFixed(2) : ''
                    setNewTrade({ ...newTrade, riskAmount: e.target.value, rMultiple: quickTradeType === 'loss' ? `-${rMultiple}` : rMultiple })
                  }}
                  placeholder="75"
                  style={{ ...inputStyle, width: '100%', padding: '12px' }}
                />
                {newTrade.riskAmount && newTrade.profitLoss && (
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>
                    = {newTrade.rMultiple}R
                  </div>
                )}
              </div>
              
              {/* Instrument */}
              <div>
                <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Instrument</label>
                <input
                  type="text"
                  value={newTrade.instrument}
                  onChange={e => setNewTrade({ ...newTrade, instrument: e.target.value.toUpperCase() })}
                  placeholder="EURUSD, NQ, BTC"
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
              
              {/* Direction */}
              <div>
                <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Direction</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setNewTrade({ ...newTrade, direction: 'long' })}
                    style={{
                      flex: 1, padding: '10px',
                      background: newTrade.direction === 'long' ? theme.success + '30' : theme.cardBg,
                      border: `2px solid ${newTrade.direction === 'long' ? theme.success : theme.border}`,
                      borderRadius: '8px', cursor: 'pointer',
                      color: newTrade.direction === 'long' ? theme.success : theme.text,
                      fontWeight: 600
                    }}
                  >
                    📈 Long
                  </button>
                  <button
                    onClick={() => setNewTrade({ ...newTrade, direction: 'short' })}
                    style={{
                      flex: 1, padding: '10px',
                      background: newTrade.direction === 'short' ? theme.danger + '30' : theme.cardBg,
                      border: `2px solid ${newTrade.direction === 'short' ? theme.danger : theme.border}`,
                      borderRadius: '8px', cursor: 'pointer',
                      color: newTrade.direction === 'short' ? theme.danger : theme.text,
                      fontWeight: 600
                    }}
                  >
                    📉 Short
                  </button>
                </div>
              </div>
              
              {/* Setup Type */}
              <div>
                <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Setup</label>
                <select
                  value={newTrade.setupType}
                  onChange={e => setNewTrade({ ...newTrade, setupType: e.target.value })}
                  style={{ ...inputStyle, width: '100%' }}
                >
                  <option value="">Select setup...</option>
                  {tradeSetups.map(setup => (
                    <option key={setup} value={setup}>{setup}</option>
                  ))}
                </select>
              </div>
              
              {/* Grade */}
              <div>
                <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Grade</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['A+', 'A', 'B', 'C'].map(grade => (
                    <button
                      key={grade}
                      onClick={() => setNewTrade({ ...newTrade, setupGrade: grade })}
                      style={{
                        flex: 1, padding: '10px',
                        background: newTrade.setupGrade === grade ? theme.warning + '30' : theme.cardBg,
                        border: `2px solid ${newTrade.setupGrade === grade ? theme.warning : theme.border}`,
                        borderRadius: '8px', cursor: 'pointer',
                        color: newTrade.setupGrade === grade ? theme.warning : theme.text,
                        fontWeight: 600, fontSize: '14px'
                      }}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Pre-trade Emotion */}
            <div style={{ marginTop: '20px' }}>
              <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>How did you feel BEFORE the trade?</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                {[
                  { key: 'confident', emoji: '😎', label: 'Confident' },
                  { key: 'neutral', emoji: '😐', label: 'Neutral' },
                  { key: 'anxious', emoji: '😰', label: 'Anxious' },
                  { key: 'fomo', emoji: '😱', label: 'FOMO' },
                  { key: 'revenge', emoji: '😤', label: 'Revenge' }
                ].map(emotion => (
                  <button
                    key={emotion.key}
                    onClick={() => setNewTrade({ ...newTrade, emotionBefore: emotion.key })}
                    style={{
                      padding: '8px 14px',
                      background: newTrade.emotionBefore === emotion.key ? theme.purple + '30' : theme.cardBg,
                      border: `2px solid ${newTrade.emotionBefore === emotion.key ? theme.purple : theme.border}`,
                      borderRadius: '8px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{emotion.emoji}</span>
                    <span style={{ color: theme.text, fontSize: '13px' }}>{emotion.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Mistakes (for losses) */}
            {quickTradeType === 'loss' && (
              <div style={{ marginTop: '20px' }}>
                <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>What went wrong? (optional)</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                  {tradeMistakes.slice(0, 6).map(mistake => (
                    <button
                      key={mistake}
                      onClick={() => {
                        const mistakes = newTrade.mistakes || []
                        if (mistakes.includes(mistake)) {
                          setNewTrade({ ...newTrade, mistakes: mistakes.filter(m => m !== mistake) })
                        } else {
                          setNewTrade({ ...newTrade, mistakes: [...mistakes, mistake] })
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        background: (newTrade.mistakes || []).includes(mistake) ? theme.danger + '30' : theme.cardBg,
                        border: `2px solid ${(newTrade.mistakes || []).includes(mistake) ? theme.danger : theme.border}`,
                        borderRadius: '6px', cursor: 'pointer',
                        color: (newTrade.mistakes || []).includes(mistake) ? theme.danger : theme.text,
                        fontSize: '12px'
                      }}
                    >
                      {mistake}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Notes */}
            <div style={{ marginTop: '20px' }}>
              <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Notes (optional)</label>
              <input
                type="text"
                value={newTrade.notes}
                onChange={e => setNewTrade({ ...newTrade, notes: e.target.value })}
                placeholder="What did you learn? What was the setup?"
                style={{ ...inputStyle, width: '100%' }}
              />
            </div>
            
            {/* Account Selection */}
            {tradingAccounts.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Account</label>
                <select
                  value={newTrade.accountId}
                  onChange={e => setNewTrade({ ...newTrade, accountId: parseInt(e.target.value) })}
                  style={{ ...inputStyle, width: '100%' }}
                >
                  <option value={0}>No account</option>
                  {tradingAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Save Button */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  addTrade()
                  setShowQuickTradeModal(false)
                  setQuickTradeType(null)
                }}
                disabled={!newTrade.profitLoss}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: newTrade.profitLoss ? (quickTradeType === 'loss' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)') : theme.textMuted,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: newTrade.profitLoss ? 'pointer' : 'not-allowed',
                  fontWeight: 700,
                  fontSize: '16px'
                }}
              >
                💾 Save Trade
              </button>
              <button
                onClick={() => { setShowQuickTradeModal(false); setQuickTradeType(null) }}
                style={{
                  padding: '16px 24px',
                  background: 'transparent',
                  border: '2px solid ' + theme.border,
                  borderRadius: '12px',
                  color: theme.textMuted,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* QUICK TRADE MODAL */}
      {showQuickTradeModal && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => { setShowQuickTradeModal(false); setQuickTradeType(null) }}>
          <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '32px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' as const }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: theme.text, fontSize: '22px', fontWeight: 700, margin: 0 }}>📝 Log Trade</h2>
              <button onClick={() => { setShowQuickTradeModal(false); setQuickTradeType(null) }} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            
            {/* Quick Win/Loss Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button
                onClick={() => setQuickTradeType('win')}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: quickTradeType === 'win' ? theme.success : theme.success + '20',
                  color: quickTradeType === 'win' ? 'white' : theme.success,
                  border: `2px solid ${theme.success}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '16px'
                }}
              >
                ✅ WIN
              </button>
              <button
                onClick={() => setQuickTradeType('loss')}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: quickTradeType === 'loss' ? theme.danger : theme.danger + '20',
                  color: quickTradeType === 'loss' ? 'white' : theme.danger,
                  border: `2px solid ${theme.danger}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '16px'
                }}
              >
                ❌ LOSS
              </button>
            </div>
            
            {/* Trade Form */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
              {/* P&L Amount */}
              <div>
                <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                  {quickTradeType === 'loss' ? 'Loss Amount' : 'Profit Amount'} *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: quickTradeType === 'loss' ? theme.danger : theme.success, fontSize: '20px', fontWeight: 700 }}>
                    {quickTradeType === 'loss' ? '-$' : '+$'}
                  </span>
                  <input
                    type="number"
                    value={newTrade.profitLoss.replace('-', '')}
                    onChange={e => setNewTrade({ 
                      ...newTrade, 
                      profitLoss: quickTradeType === 'loss' ? `-${e.target.value}` : e.target.value 
                    })}
                    placeholder="0.00"
                    style={{ ...inputStyle, flex: 1, fontSize: '24px', fontWeight: 700, padding: '12px' }}
                  />
                </div>
              </div>
              
              {/* Risk Amount (for R calculation) */}
              <div>
                <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                  Risk (1R) - for R-multiple calc
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: theme.text, fontSize: '16px' }}>$</span>
                  <input
                    type="number"
                    value={newTrade.riskAmount}
                    onChange={e => {
                      const risk = parseFloat(e.target.value) || 0
                      const pnl = Math.abs(parseFloat(newTrade.profitLoss) || 0)
                      const rMultiple = risk > 0 ? (pnl / risk).toFixed(2) : ''
                      setNewTrade({ 
                        ...newTrade, 
                        riskAmount: e.target.value,
                        rMultiple: quickTradeType === 'loss' ? `-${rMultiple}` : rMultiple
                      })
                    }}
                    placeholder="75"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  {newTrade.riskAmount && newTrade.profitLoss && (
                    <span style={{ 
                      padding: '8px 12px', 
                      background: quickTradeType === 'loss' ? theme.danger + '20' : theme.success + '20',
                      color: quickTradeType === 'loss' ? theme.danger : theme.success,
                      borderRadius: '8px',
                      fontWeight: 700
                    }}>
                      {newTrade.rMultiple}R
                    </span>
                  )}
                </div>
              </div>
              
              {/* Instrument & Direction */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Instrument</label>
                  <input
                    value={newTrade.instrument}
                    onChange={e => setNewTrade({ ...newTrade, instrument: e.target.value })}
                    placeholder="EURUSD"
                    style={{ ...inputStyle, width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Direction</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setNewTrade({ ...newTrade, direction: 'long' })}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: newTrade.direction === 'long' ? theme.success + '30' : theme.cardBg,
                        border: `2px solid ${newTrade.direction === 'long' ? theme.success : theme.border}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: theme.text,
                        fontWeight: 600
                      }}
                    >
                      📈 Long
                    </button>
                    <button
                      onClick={() => setNewTrade({ ...newTrade, direction: 'short' })}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: newTrade.direction === 'short' ? theme.danger + '30' : theme.cardBg,
                        border: `2px solid ${newTrade.direction === 'short' ? theme.danger : theme.border}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: theme.text,
                        fontWeight: 600
                      }}
                    >
                      📉 Short
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Setup Type */}
              <div>
                <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Setup/Strategy</label>
                <select
                  value={newTrade.setupType}
                  onChange={e => setNewTrade({ ...newTrade, setupType: e.target.value })}
                  style={{ ...inputStyle, width: '100%' }}
                >
                  <option value="">Select setup...</option>
                  {tradeSetups.map(setup => (
                    <option key={setup} value={setup}>{setup}</option>
                  ))}
                </select>
              </div>
              
              {/* Pre-Trade Emotion */}
              <div>
                <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>How did you feel BEFORE this trade?</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                  {[
                    { key: 'confident', emoji: '😎', label: 'Confident' },
                    { key: 'neutral', emoji: '😐', label: 'Neutral' },
                    { key: 'anxious', emoji: '😰', label: 'Anxious' },
                    { key: 'fomo', emoji: '🤑', label: 'FOMO' },
                    { key: 'revenge', emoji: '😤', label: 'Revenge' }
                  ].map(emotion => (
                    <button
                      key={emotion.key}
                      onClick={() => setNewTrade({ ...newTrade, emotionBefore: emotion.key })}
                      style={{
                        padding: '8px 12px',
                        background: newTrade.emotionBefore === emotion.key ? theme.warning + '30' : theme.cardBg,
                        border: `2px solid ${newTrade.emotionBefore === emotion.key ? theme.warning : theme.border}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{emotion.emoji}</span>
                      <span style={{ color: theme.text, fontSize: '12px' }}>{emotion.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Mistakes (for losses) */}
              {quickTradeType === 'loss' && (
                <div>
                  <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>What went wrong?</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                    {tradeMistakes.slice(0, 6).map(mistake => (
                      <button
                        key={mistake}
                        onClick={() => {
                          const mistakes = newTrade.mistakes || []
                          if (mistakes.includes(mistake)) {
                            setNewTrade({ ...newTrade, mistakes: mistakes.filter(m => m !== mistake) })
                          } else {
                            setNewTrade({ ...newTrade, mistakes: [...mistakes, mistake] })
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          background: (newTrade.mistakes || []).includes(mistake) ? theme.danger + '30' : theme.cardBg,
                          border: `2px solid ${(newTrade.mistakes || []).includes(mistake) ? theme.danger : theme.border}`,
                          borderRadius: '20px',
                          cursor: 'pointer',
                          color: theme.text,
                          fontSize: '12px'
                        }}
                      >
                        {mistake}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Account Selection */}
              {tradingAccounts.length > 0 && (
                <div>
                  <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Account</label>
                  <select
                    value={newTrade.accountId}
                    onChange={e => setNewTrade({ ...newTrade, accountId: parseInt(e.target.value) })}
                    style={{ ...inputStyle, width: '100%' }}
                  >
                    <option value={0}>No account linked</option>
                    {tradingAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Notes */}
              <div>
                <label style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Notes (optional)</label>
                <input
                  value={newTrade.notes}
                  onChange={e => setNewTrade({ ...newTrade, notes: e.target.value })}
                  placeholder="What did you learn?"
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
            </div>
            
            {/* Save Button */}
            <button
              onClick={() => {
                if (!newTrade.profitLoss) return
                addTrade()
                setShowQuickTradeModal(false)
                setQuickTradeType(null)
              }}
              disabled={!newTrade.profitLoss}
              style={{
                width: '100%',
                marginTop: '24px',
                padding: '16px',
                background: newTrade.profitLoss ? (quickTradeType === 'loss' ? theme.danger : theme.success) : theme.textMuted,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: newTrade.profitLoss ? 'pointer' : 'not-allowed',
                fontWeight: 700,
                fontSize: '16px'
              }}
            >
              💾 Save Trade
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {expandedDay && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setExpandedDay(null)}>
          <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' as const }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>{calendarMonth.toLocaleDateString('en-US', { month: 'long' })} {expandedDay.day}</h3>
            {expandedDay.items.length === 0 ? <p style={{ color: theme.textMuted }}>No items scheduled</p> : expandedDay.items.map(item => (
              <div key={item.itemId} style={{ padding: '12px', marginBottom: '8px', background: item.itemType === 'income' ? '#d1fae5' : item.itemType === 'expense' ? '#dbeafe' : item.itemType === 'debt' ? '#fee2e2' : item.itemType === 'milestone-deadline' ? '#fef3c7' : item.itemType === 'milestone-checkin' ? '#e0e7ff' : '#ede9fe', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: item.isPaid ? 0.6 : 1 }}>
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

      {/* Payslip Confirmation Modal */}
      {showPayslipUpload && extractedPayslip && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowPayslipUpload(false)}>
          <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>📄 Payslip Detected!</h3>
            <p style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '20px' }}>Please confirm or edit the extracted details:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Employer</label>
                <input 
                  value={extractedPayslip.employer || ''} 
                  onChange={e => setExtractedPayslip({...extractedPayslip, employer: e.target.value})}
                  style={{ ...inputStyle, width: '100%' }} 
                  placeholder="Company name"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Net Pay</label>
                  <input 
                    type="number"
                    value={extractedPayslip.netPay || ''} 
                    onChange={e => setExtractedPayslip({...extractedPayslip, netPay: e.target.value})}
                    style={{ ...inputStyle, width: '100%' }} 
                    placeholder="Amount"
                  />
                </div>
                <div>
                  <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Frequency</label>
                  <select 
                    value={extractedPayslip.frequency || 'fortnightly'} 
                    onChange={e => setExtractedPayslip({...extractedPayslip, frequency: e.target.value})}
                    style={{ ...inputStyle, width: '100%' }}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="fortnightly">Fortnightly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Pay Date</label>
                <input 
                  type="date"
                  value={extractedPayslip.payDate || new Date().toISOString().split('T')[0]} 
                  onChange={e => setExtractedPayslip({...extractedPayslip, payDate: e.target.value})}
                  style={{ ...inputStyle, width: '100%' }} 
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={confirmPayslipIncome} style={{ ...btnSuccess, flex: 1 }}>✓ Add Income</button>
              <button onClick={() => { setShowPayslipUpload(false); setExtractedPayslip(null) }} style={{ ...btnPrimary, background: theme.textMuted }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ padding: '12px 24px', background: theme.cardBg, borderBottom: '1px solid ' + theme.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Gold Coin Logo */}
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
            border: '2px solid #fcd34d'
          }}>
            <span style={{ color: '#78350f', fontWeight: 800, fontSize: '18px' }}>A</span>
          </div>
          <span style={{ color: theme.text, fontWeight: 700, fontSize: '20px' }}>Aureus</span>
          <button onClick={() => setShowModeSelector(true)} style={{ padding: '6px 12px', background: appMode === 'budget' ? theme.success + '20' : theme.warning + '20', color: appMode === 'budget' ? theme.success : theme.warning, border: '1px solid ' + (appMode === 'budget' ? theme.success : theme.warning), borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
            {appMode === 'budget' ? '💰 Budget' : '📈 Trading'} ▼
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '6px' }}>
          {appMode === 'budget' && (
            <>
              <button onClick={() => setActiveTab('chat')} style={{ padding: '8px 14px', background: activeTab === 'chat' ? theme.accent : 'transparent', color: activeTab === 'chat' ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>💬 Aureus</button>
              <button onClick={() => setActiveTab('quickview')} style={{ padding: '8px 14px', background: activeTab === 'quickview' ? theme.accent : 'transparent', color: activeTab === 'quickview' ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>⚡ Quick</button>
              <button onClick={() => setActiveTab('dashboard')} style={{ padding: '8px 14px', background: activeTab === 'dashboard' ? theme.accent : 'transparent', color: activeTab === 'dashboard' ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>🎛️ Centre</button>
              <button onClick={() => setActiveTab('path')} style={{ padding: '8px 14px', background: activeTab === 'path' ? theme.accent : 'transparent', color: activeTab === 'path' ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>🛤️ Path</button>
              <button onClick={() => setActiveTab('overview')} style={{ padding: '8px 14px', background: activeTab === 'overview' ? theme.accent : 'transparent', color: activeTab === 'overview' ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>📊 Metrics</button>
            </>
          )}
          {appMode === 'trading' && (
            <>
              <button onClick={() => { setActiveTab('trading'); setTradingSubTab('today'); }} style={{ padding: '8px 14px', background: activeTab === 'trading' && tradingSubTab === 'today' ? theme.warning : 'transparent', color: activeTab === 'trading' && tradingSubTab === 'today' ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>🏠 Today</button>
              <button onClick={() => { setActiveTab('trading'); setTradingSubTab('journal'); }} style={{ padding: '8px 14px', background: activeTab === 'trading' && tradingSubTab === 'journal' ? theme.warning : 'transparent', color: activeTab === 'trading' && tradingSubTab === 'journal' ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>📓 Journal</button>
              <button onClick={() => { setActiveTab('trading'); setTradingSubTab('analytics'); }} style={{ padding: '8px 14px', background: activeTab === 'trading' && tradingSubTab === 'analytics' ? theme.warning : 'transparent', color: activeTab === 'trading' && tradingSubTab === 'analytics' ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>📊 Analytics</button>
              <button onClick={() => { setActiveTab('trading'); setTradingSubTab('accounts'); }} style={{ padding: '8px 14px', background: activeTab === 'trading' && tradingSubTab === 'accounts' ? theme.warning : 'transparent', color: activeTab === 'trading' && tradingSubTab === 'accounts' ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>💼 Accounts</button>
            </>
          )}
          <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text }}>{darkMode ? '☀️' : '🌙'}</button>
          
          {/* Country/Region Selector */}
          <select 
            value={userCountry} 
            onChange={e => setUserCountry(e.target.value as any)}
            style={{ 
              padding: '6px 10px', 
              background: theme.cardBg, 
              border: '1px solid ' + theme.border, 
              borderRadius: '8px', 
              cursor: 'pointer', 
              color: theme.text,
              fontSize: '14px'
            }}
            title="Select your country for localized advice"
          >
            <option value="AU">🇦🇺 AU</option>
            <option value="US">🇺🇸 US</option>
            <option value="UK">🇬🇧 UK</option>
            <option value="NZ">🇳🇿 NZ</option>
            <option value="CA">🇨🇦 CA</option>
          </select>
          
          {/* Subscription Status / Upgrade Button */}
          {userSubscription.plan === 'free' ? (
            <button 
              onClick={() => setShowPricingModal(true)}
              style={{ 
                padding: '6px 14px', 
                background: 'linear-gradient(135deg, #10b981, #059669)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ⚡ Upgrade
              <span style={{ 
                background: 'rgba(255,255,255,0.2)', 
                padding: '2px 6px', 
                borderRadius: '4px', 
                fontSize: '11px' 
              }}>
                {userSubscription.aiChatsUsed}/{userSubscription.aiChatsLimit}
              </span>
            </button>
          ) : (
            <button 
              onClick={() => window.open(LEMONSQUEEZY_URLS.customer_portal, '_blank')}
              style={{ 
                padding: '6px 14px', 
                background: theme.success + '20', 
                color: theme.success, 
                border: '1px solid ' + theme.success, 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              ✓ Pro {userSubscription.plan === 'annual' ? '(Annual)' : ''}
            </button>
          )}
          
          {/* Feedback Button */}
          <button 
            onClick={() => setShowFeedbackModal(true)}
            style={{ 
              padding: '6px 12px', 
              background: 'transparent', 
              border: '1px solid ' + theme.border, 
              borderRadius: '8px', 
              cursor: 'pointer', 
              color: theme.textMuted,
              fontSize: '13px'
            }}
            title="Send feedback"
          >
            💬
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* MOTIVATIONAL QUOTE - Only show on quickview */}
        {activeTab === 'quickview' && !budgetOnboarding.isActive && !tradingOnboarding.isActive && (
          <div style={{ background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', borderLeft: `4px solid ${theme.purple}` }}>
            <p style={{ color: theme.text, fontSize: '14px', fontStyle: 'italic', margin: 0 }}>"{currentQuote.quote}"</p>
            <p style={{ color: theme.textMuted, fontSize: '12px', margin: '8px 0 0 0', textAlign: 'right' as const }}>— {currentQuote.author}</p>
          </div>
        )}

        {/* UPCOMING PAYMENT ALERTS - Only show on quickview */}
        {activeTab === 'quickview' && alertsEnabled && !budgetOnboarding.isActive && (() => {
          const today = new Date()
          const upcomingDays = alertDaysBefore
          const upcoming: any[] = []
          
          // Check expenses
          expenses.filter(e => !e.targetDebtId && !e.targetGoalId).forEach(exp => {
            if (!exp.dueDate) return
            const [year, month, day] = exp.dueDate.split('-').map(Number)
            const dueDate = new Date(today.getFullYear(), today.getMonth(), day)
            const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            if (daysUntil >= 0 && daysUntil <= upcomingDays) {
              upcoming.push({ name: exp.name, amount: exp.amount, daysUntil, type: 'expense' })
            }
          })
          
          // Check debts
          debts.forEach(debt => {
            if (!debt.paymentDate) return
            const [year, month, day] = debt.paymentDate.split('-').map(Number)
            const dueDate = new Date(today.getFullYear(), today.getMonth(), day)
            const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            if (daysUntil >= 0 && daysUntil <= upcomingDays) {
              upcoming.push({ name: debt.name, amount: debt.minPayment, daysUntil, type: 'debt' })
            }
          })
          
          if (upcoming.length === 0) return null
          
          return (
            <div style={{ background: theme.warning + '20', border: '1px solid ' + theme.warning, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, color: theme.warning, fontSize: '14px' }}>🔔 Upcoming Payments</h4>
                <button onClick={() => setAlertsEnabled(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '12px' }}>Dismiss</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
                {upcoming.map((item, i) => (
                  <span key={i} style={{ padding: '6px 12px', background: theme.cardBg, borderRadius: '6px', fontSize: '13px', color: theme.text }}>
                    {item.type === 'debt' ? '💳' : '📋'} {item.name}: ${item.amount} 
                    <span style={{ color: item.daysUntil === 0 ? theme.danger : theme.warning, marginLeft: '8px' }}>
                      {item.daysUntil === 0 ? 'TODAY!' : item.daysUntil === 1 ? 'Tomorrow' : `in ${item.daysUntil} days`}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )
        })()}

        {/* CHAT TAB - Dedicated Aureus Conversation */}
        {activeTab === 'chat' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: `linear-gradient(135deg, ${appMode === 'budget' ? theme.success : theme.warning}15, ${theme.purple}15)`, border: `2px solid ${appMode === 'budget' ? theme.success : theme.warning}`, borderRadius: '20px', padding: '24px', minHeight: '70vh', display: 'flex', flexDirection: 'column' as const }}>
              {/* Aureus Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid ' + theme.border }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  border: '3px solid #fcd34d'
                }}>
                  <span style={{ color: '#78350f', fontWeight: 800, fontSize: '28px' }}>A</span>
                </div>
                <div>
                  <div style={{ color: theme.text, fontWeight: 700, fontSize: '22px' }}>Aureus</div>
                  <div style={{ color: theme.textMuted, fontSize: '13px' }}>
                    {budgetOnboarding.isActive || tradingOnboarding.isActive 
                      ? '🟢 Getting to know you...' 
                      : appMode === 'budget' 
                        ? `Your financial operations coach • ${currentBabyStep.title}`
                        : `Your trading coach • ${winRate.toFixed(0)}% win rate`
                    }
                  </div>
                </div>
              </div>
              
              {/* AI Disclaimer */}
              <div style={{ padding: '8px 12px', background: theme.warning + '15', borderRadius: '8px', marginBottom: '12px', border: '1px solid ' + theme.warning + '30' }}>
                <p style={{ margin: 0, color: theme.textMuted, fontSize: '11px', lineHeight: 1.4 }}>
                  ⚠️ <strong>Important:</strong> Aureus is an AI assistant, not a licensed financial advisor. Always verify information and consult qualified professionals for major financial decisions. AI can make mistakes.
                </p>
              </div>

              {/* Chat Messages */}
              <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto' as const, marginBottom: '16px', padding: '8px' }}>
                {proactiveInsight && !budgetOnboarding.isActive && !tradingOnboarding.isActive && chatMessages.length === 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ padding: '16px 20px', borderRadius: '16px', background: theme.cardBg, color: theme.text, fontSize: '15px', lineHeight: 1.6 }}>
                      <p style={{ margin: '0 0 8px 0' }}>{proactiveInsight.greeting || `Hey${budgetMemory.name ? ' ' + budgetMemory.name : ''}!`}</p>
                      <p style={{ margin: '0 0 8px 0' }}>{proactiveInsight.insight || proactiveInsight.message || "Ready to help you optimize your finances today!"}</p>
                      {proactiveInsight.suggestion && <p style={{ color: theme.purple, margin: 0 }}>💡 {proactiveInsight.suggestion}</p>}
                    </div>
                  </div>
                )}
                
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ marginBottom: '16px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      maxWidth: '85%', 
                      padding: '14px 18px', 
                      borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', 
                      background: msg.role === 'user' ? (appMode === 'budget' ? theme.accent : theme.warning) : theme.cardBg, 
                      color: msg.role === 'user' ? 'white' : theme.text, 
                      fontSize: '15px', 
                      lineHeight: 1.6, 
                      whiteSpace: 'pre-wrap' as const 
                    }}>
                      {msg.content}
                      {msg.image && (
                        <div style={{ marginTop: '10px' }}>
                          <img src={msg.image} alt="Uploaded chart" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid ' + theme.border }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div style={{ display: 'flex', gap: '6px', padding: '16px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.2s' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.4s' }} />
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  onKeyPress={e => e.key === 'Enter' && handleChatMessage()} 
                  placeholder={budgetOnboarding.isActive || tradingOnboarding.isActive ? "Type your response..." : "Ask Aureus anything..."} 
                  style={{ ...inputStyle, flex: 1, padding: '14px 18px', fontSize: '15px' }} 
                  disabled={isLoading} 
                />
                <button 
                  onClick={handleChatMessage} 
                  disabled={isLoading || !chatInput.trim()} 
                  style={{ 
                    padding: '14px 24px', 
                    background: appMode === 'budget' ? theme.success : theme.warning, 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    cursor: 'pointer', 
                    fontWeight: 600,
                    opacity: isLoading || !chatInput.trim() ? 0.5 : 1 
                  }}
                >
                  {isLoading ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QUICK VIEW TAB - Mobile-friendly metrics dashboard */}
        {activeTab === 'quickview' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>
            
            {/* Aureus Chat Card - Always visible */}
            <div data-aureus-chat="true" style={{ padding: '20px', background: `linear-gradient(135deg, ${appMode === 'budget' ? theme.success : theme.warning}15, ${theme.purple}15)`, borderRadius: '16px', border: '2px solid ' + (appMode === 'budget' ? theme.success : theme.warning) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: chatMessages.length > 0 ? '16px' : '12px' }}>
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#78350f'
                }}>A</div>
                <div>
                  <div style={{ color: theme.text, fontWeight: 600 }}>Aureus</div>
                  <div style={{ color: theme.textMuted, fontSize: '11px' }}>
                    {appMode === 'budget' ? currentBabyStep.title : `${winRate.toFixed(0)}% win rate`}
                  </div>
                </div>
              </div>
              
              {/* Proactive insight when no messages */}
              {proactiveInsight && chatMessages.length === 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ color: theme.text, fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{proactiveInsight.insight || proactiveInsight.message}</p>
                  {proactiveInsight.suggestion && (
                    <p style={{ color: theme.purple, fontSize: '13px', margin: '8px 0 0 0' }}>💡 {proactiveInsight.suggestion}</p>
                  )}
                </div>
              )}
              
              {/* Chat Messages */}
              {chatMessages.length > 0 && (
                <div ref={chatContainerRef} style={{ maxHeight: '200px', overflowY: 'auto' as const, marginBottom: '12px', padding: '8px', background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} style={{ marginBottom: '10px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{ 
                        maxWidth: '85%', 
                        padding: '10px 14px', 
                        borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', 
                        background: msg.role === 'user' ? (appMode === 'budget' ? theme.accent : theme.warning) : theme.cardBg, 
                        color: msg.role === 'user' ? 'white' : theme.text, 
                        fontSize: '13px', 
                        lineHeight: 1.5, 
                        whiteSpace: 'pre-wrap' as const 
                      }}>
                        {msg.content}
                        {msg.image && (
                          <div style={{ marginTop: '10px' }}>
                            <img src={msg.image} alt="Uploaded chart" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid ' + theme.border }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div style={{ display: 'flex', gap: '4px', padding: '10px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite' }} />
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.2s' }} />
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.4s' }} />
                    </div>
                  )}
                </div>
              )}
              
              {/* Chat Input */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  onKeyPress={e => e.key === 'Enter' && handleChatMessage()} 
                  placeholder="Ask Aureus anything..." 
                  style={{ ...inputStyle, flex: 1, padding: '10px 14px', fontSize: '13px' }} 
                  disabled={isLoading} 
                />
                <button 
                  onClick={handleChatMessage} 
                  disabled={isLoading || !chatInput.trim()} 
                  style={{ 
                    padding: '10px 16px', 
                    background: appMode === 'budget' ? theme.success : theme.warning, 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontWeight: 600,
                    fontSize: '13px',
                    opacity: isLoading || !chatInput.trim() ? 0.5 : 1 
                  }}
                >
                  {isLoading ? '...' : 'Send'}
                </button>
              </div>
            </div>

            {appMode === 'budget' && (
              <>
                {/* Key Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                    <div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '8px' }}>Monthly Revenue</div>
                    <div style={{ color: theme.success, fontSize: '28px', fontWeight: 700 }}>${monthlyIncome.toFixed(0)}</div>
                  </div>
                  <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                    <div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '8px' }}>Operating Costs</div>
                    <div style={{ color: theme.danger, fontSize: '28px', fontWeight: 700 }}>${totalOutgoing.toFixed(0)}</div>
                  </div>
                  <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                    <div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '8px' }}>Net Profit</div>
                    <div style={{ color: monthlySurplus >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 700 }}>${monthlySurplus.toFixed(0)}</div>
                    <div style={{ color: theme.textMuted, fontSize: '11px' }}>{savingsRate.toFixed(0)}% margin</div>
                  </div>
                  <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                    <div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '8px' }}>Wealth Position</div>
                    <div style={{ color: netWorth >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 700 }}>${netWorth.toLocaleString()}</div>
                  </div>
                </div>

                {/* Operations Score */}
                <div style={{ padding: '20px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '16px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>Operations Score</div>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>Overall efficiency</div>
                    </div>
                    <div style={{ fontSize: '40px', fontWeight: 700, color: financialHealthScore >= 70 ? theme.success : financialHealthScore >= 40 ? theme.warning : theme.danger }}>
                      {financialHealthScore}
                    </div>
                  </div>
                </div>

                {/* Freedom Progress */}
                <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ color: theme.text, fontWeight: 600 }}>🐀 Rat Race Escape</div>
                    <div style={{ color: theme.warning, fontWeight: 700, fontSize: '20px' }}>
                      {monthlyExpenses > 0 ? (((passiveIncome + totalPassiveQuestIncome) / monthlyExpenses) * 100).toFixed(0) : 0}%
                    </div>
                  </div>
                  <div style={{ height: '8px', background: theme.border, borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: Math.min(((passiveIncome + totalPassiveQuestIncome) / Math.max(monthlyExpenses, 1)) * 100, 100) + '%', height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #10b981)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: theme.textMuted, fontSize: '12px' }}>
                    <span>Automated: ${(passiveIncome + totalPassiveQuestIncome).toFixed(0)}/mo</span>
                    <span>Need: ${monthlyExpenses.toFixed(0)}/mo</span>
                  </div>
                </div>

                {/* Current Baby Step */}
                <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: theme.warning, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{currentBabyStep.icon}</div>
                    <div>
                      <div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const }}>Current Step</div>
                      <div style={{ color: theme.text, fontWeight: 600 }}>Step {currentBabyStep.step}: {currentBabyStep.title}</div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <button onClick={() => setActiveTab('dashboard')} style={{ padding: '16px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎛️</div>
                    <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>Command Centre</div>
                  </button>
                  <button onClick={() => setActiveTab('path')} style={{ padding: '16px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🛤️</div>
                    <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>Path & Quests</div>
                  </button>
                  <button onClick={() => setShowPayoutModal(true)} style={{ padding: '16px', background: 'linear-gradient(135deg, ' + theme.success + '20, ' + theme.warning + '20)', border: '2px solid ' + theme.success, borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
                    <div style={{ color: theme.success, fontWeight: 600, fontSize: '14px' }}>Log Payout</div>
                  </button>
                </div>
                
                {/* Recent Payouts */}
                {payouts.length > 0 && (
                  <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>💸 Trading Payouts</div>
                      <div style={{ color: theme.success, fontWeight: 700 }}>${totalPayouts.toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', maxHeight: '120px', overflowY: 'auto' as const }}>
                      {payouts.slice(-3).reverse().map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: darkMode ? '#1e3a2f' : '#ecfdf5', borderRadius: '8px' }}>
                          <div>
                            <div style={{ color: theme.text, fontSize: '13px', fontWeight: 600 }}>${p.amount.toLocaleString()}</div>
                            <div style={{ color: theme.textMuted, fontSize: '11px' }}>{p.propFirm || p.accountName || 'Trading'} • {new Date(p.date).toLocaleDateString()}</div>
                          </div>
                          <button onClick={() => deletePayout(p.id)} style={{ padding: '4px 8px', background: theme.danger + '20', color: theme.danger, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>×</button>
                        </div>
                      ))}
                    </div>
                    {payouts.length > 3 && (
                      <div style={{ color: theme.textMuted, fontSize: '11px', textAlign: 'center' as const, marginTop: '8px' }}>
                        +{payouts.length - 3} more payouts
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {appMode === 'trading' && (
              <>
                {/* Trading Key Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                    <div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '8px' }}>Total P&L</div>
                    <div style={{ color: totalPL >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 700 }}>${totalPL.toFixed(0)}</div>
                  </div>
                  <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                    <div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '8px' }}>Win Rate</div>
                    <div style={{ color: winRate >= 50 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 700 }}>{winRate.toFixed(0)}%</div>
                  </div>
                  <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                    <div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '8px' }}>Total Trades</div>
                    <div style={{ color: theme.text, fontSize: '28px', fontWeight: 700 }}>{trades.length}</div>
                  </div>
                  <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                    <div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '8px' }}>Profit Factor</div>
                    <div style={{ color: (avgWin * winningTrades.length) / Math.max(avgLoss * losingTrades.length, 1) >= 1 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 700 }}>
                      {losingTrades.length > 0 ? ((avgWin * winningTrades.length) / (avgLoss * losingTrades.length)).toFixed(2) : '∞'}
                    </div>
                  </div>
                </div>

                {/* Tilt Status */}
                {(() => {
                  const tilt = detectTilt()
                  return (
                    <div style={{ padding: '20px', background: tilt.tiltScore > 50 ? theme.danger + '20' : theme.success + '20', borderRadius: '16px', border: '1px solid ' + (tilt.tiltScore > 50 ? theme.danger : theme.success) }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ fontSize: '28px' }}>{tilt.tiltScore > 70 ? '🚨' : tilt.tiltScore > 40 ? '⚠️' : '✅'}</div>
                          <div>
                            <div style={{ color: theme.text, fontWeight: 600 }}>
                              {tilt.tiltScore > 70 ? 'HIGH TILT - STOP!' : tilt.tiltScore > 40 ? 'Caution' : 'Clear to Trade'}
                            </div>
                            <div style={{ color: theme.textMuted, fontSize: '12px' }}>{tilt.todaysTrades} trades today • {tilt.todaysLosses} losses</div>
                          </div>
                        </div>
                        <div style={{ color: tilt.tiltScore > 50 ? theme.danger : theme.success, fontSize: '28px', fontWeight: 700 }}>{tilt.tiltScore}%</div>
                      </div>
                    </div>
                  )
                })()}

                {/* Quick Action */}
                <button onClick={() => setActiveTab('trading')} style={{ padding: '16px', background: theme.warning, border: 'none', borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as const }}>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>📈 Open Trading Dashboard</div>
                </button>
              </>
            )}
          </div>
        )}

        {/* BUDGET DASHBOARD TAB */}
        {appMode === 'budget' && activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            
            {/* Aureus Onboarding Chat - Shows when onboarding is active */}
            {budgetOnboarding.isActive && (
              <div data-aureus-chat="true" style={{ padding: '20px', background: `linear-gradient(135deg, ${theme.success}15, ${theme.purple}15)`, border: `2px solid ${theme.success}`, borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#78350f'
                  }}>A</div>
                  <div>
                    <div style={{ color: theme.text, fontWeight: 700 }}>Aureus</div>
                    <div style={{ color: theme.textMuted, fontSize: '12px' }}>Setting up your operations...</div>
                  </div>
                </div>
                
                <div ref={chatContainerRef} style={{ maxHeight: '400px', overflowY: 'auto' as const, marginBottom: '16px' }}>
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} style={{ marginBottom: '12px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{ 
                        maxWidth: '85%', 
                        padding: '12px 16px', 
                        borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', 
                        background: msg.role === 'user' ? theme.accent : theme.cardBg, 
                        color: msg.role === 'user' ? 'white' : theme.text, 
                        fontSize: '14px', 
                        lineHeight: 1.5, 
                        whiteSpace: 'pre-wrap' as const 
                      }}>
                        {msg.content}
                        {msg.image && (
                          <div style={{ marginTop: '10px' }}>
                            <img src={msg.image} alt="Uploaded chart" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid ' + theme.border }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div style={{ display: 'flex', gap: '4px', padding: '12px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite' }} />
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.2s' }} />
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.4s' }} />
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input 
                    type="text" 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)} 
                    onKeyPress={e => e.key === 'Enter' && handleChatMessage()} 
                    placeholder="Type your response..." 
                    style={{ ...inputStyle, flex: 1 }} 
                    disabled={isLoading} 
                  />
                  <button 
                    onClick={handleChatMessage} 
                    disabled={isLoading || !chatInput.trim()} 
                    style={{ ...btnSuccess, opacity: isLoading || !chatInput.trim() ? 0.5 : 1 }}
                  >
                    {isLoading ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Aureus Chat - Shows when NOT onboarding (at TOP of page) */}
            {!budgetOnboarding.isActive && (
              <div data-aureus-chat="true" style={{ padding: '20px', background: `linear-gradient(135deg, ${theme.success}15, ${theme.purple}15)`, borderRadius: '16px', border: '2px solid ' + theme.success }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: chatMessages.length > 0 ? '16px' : '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#78350f' }}>A</div>
                  <div><div style={{ color: theme.text, fontWeight: 600 }}>Aureus</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>{currentBabyStep.title}</div></div>
                </div>
                {proactiveInsight && chatMessages.length === 0 && <div style={{ marginBottom: '12px' }}><p style={{ color: theme.text, fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{proactiveInsight.insight || proactiveInsight.message}</p>{proactiveInsight.suggestion && <p style={{ color: theme.purple, fontSize: '13px', margin: '8px 0 0 0' }}>💡 {proactiveInsight.suggestion}</p>}</div>}
                {chatMessages.length > 0 && (
                  <div ref={chatContainerRef} style={{ maxHeight: '400px', overflowY: 'auto' as const, marginBottom: '12px', padding: '12px', background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} style={{ marginBottom: '10px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: msg.role === 'user' ? theme.accent : theme.cardBg, color: msg.role === 'user' ? 'white' : theme.text, fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' as const }}>
                          {msg.content}
                          {msg.image && (
                            <div style={{ marginTop: '10px' }}>
                              <img src={msg.image} alt="Uploaded chart" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid ' + theme.border }} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div style={{ display: 'flex', gap: '4px', padding: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite' }} />
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.2s' }} />
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.4s' }} />
                      </div>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}><input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChatMessage()} placeholder="Ask Aureus anything..." style={{ ...inputStyle, flex: 1, padding: '10px 14px', fontSize: '13px' }} disabled={isLoading} /><button onClick={handleChatMessage} disabled={isLoading || !chatInput.trim()} style={{ padding: '10px 16px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', opacity: isLoading || !chatInput.trim() ? 0.5 : 1 }}>{isLoading ? '...' : 'Send'}</button></div>
              </div>
            )}
            
            {/* Monthly Summary - uses standard monthly calculations */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Income /month</div><div style={{ color: theme.success, fontSize: '28px', fontWeight: 700 }}>${monthlyIncome.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Expenses /month</div><div style={{ color: theme.danger, fontSize: '28px', fontWeight: 700 }}>${monthlyExpenses.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Debt Payments</div><div style={{ color: theme.warning, fontSize: '28px', fontWeight: 700 }}>${monthlyDebtPayments.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Goal Savings</div><div style={{ color: theme.purple, fontSize: '28px', fontWeight: 700 }}>${monthlyGoalSavings.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Net /month</div><div style={{ color: monthlySurplus >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 700 }}>${monthlySurplus.toFixed(0)}</div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Revenue Streams */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: theme.success, fontSize: '18px' }}>💰 Revenue Streams</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="file" ref={payslipInputRef} accept="image/*,.pdf" onChange={handlePayslipUpload} style={{ display: 'none' }} />
                    <button onClick={() => payslipInputRef.current?.click()} style={{ padding: '4px 12px', background: theme.purple, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} disabled={payslipProcessing}>
                      {payslipProcessing ? '⏳' : '📄'} Payslip
                    </button>
                    <span style={{ color: theme.success, fontWeight: 700 }}>${monthlyIncome.toFixed(0)}/mo</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                  <input placeholder="Revenue source" value={newIncome.name} onChange={e => setNewIncome({...newIncome, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '120px'}} />
                  <input placeholder="Amount" type="number" value={newIncome.amount} onChange={e => setNewIncome({...newIncome, amount: e.target.value})} style={{...inputStyle, width: '100px'}} />
                  <select value={newIncome.frequency} onChange={e => setNewIncome({...newIncome, frequency: e.target.value})} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
                  <select value={newIncome.type} onChange={e => setNewIncome({...newIncome, type: e.target.value})} style={inputStyle}><option value="active">Active</option><option value="passive">Automated</option></select>
                  <input type="date" value={newIncome.startDate} onChange={e => setNewIncome({...newIncome, startDate: e.target.value})} style={{...inputStyle, width: '130px'}} />
                  <button onClick={addIncome} style={btnSuccess}>+</button>
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' as const }}>
                  {incomeStreams.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No revenue streams yet</p> : incomeStreams.map(inc => (
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
                        <div><div style={{ color: theme.text, fontWeight: 600 }}>{inc.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{inc.frequency} • {inc.type === 'passive' ? 'automated' : inc.type} • {inc.startDate}</div></div>
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

              {/* Operating Costs */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: theme.danger, fontSize: '18px' }}>💸 Operating Costs</h3>
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
                        <div key={item.itemId} style={{ fontSize: '10px', padding: '2px 4px', marginBottom: '2px', background: item.itemType === 'income' ? '#d1fae5' : item.itemType === 'expense' ? '#dbeafe' : item.itemType === 'debt' ? '#fee2e2' : item.itemType === 'milestone-deadline' ? '#fef3c7' : item.itemType === 'milestone-checkin' ? '#e0e7ff' : '#ede9fe', color: '#1e293b', borderRadius: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, opacity: item.isPaid ? 0.5 : 1 }}>{item.name}</div>
                      ))}
                      {items.length > 2 && <div style={{ fontSize: '10px', color: theme.accent, fontWeight: 600 }}>+{items.length - 2}</div>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ==================== BUDGET ANALYTICS DASHBOARD ==================== */}
            <div style={{ padding: '24px', background: `linear-gradient(135deg, ${theme.accent}15, ${theme.purple}15)`, borderRadius: '16px', border: '2px solid ' + theme.accent }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '28px' }}>📊</span>
                  <div>
                    <h2 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>Financial Analytics</h2>
                    <p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '12px' }}>Track your spending, wealth, and progress</p>
                  </div>
                </div>
              </div>
              
              {/* Analytics Tabs */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' as const }}>
                {[
                  { key: 'spending', icon: '💸', label: 'Spending' },
                  { key: 'wealth', icon: '💰', label: 'Wealth Position' },
                  { key: 'bills', icon: '📅', label: 'Upcoming Bills' },
                  { key: 'subscriptions', icon: '🔄', label: 'Subscriptions' },
                  { key: 'milestones', icon: '🏆', label: 'Milestones' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setBudgetAnalyticsTab(tab.key as any)}
                    style={{
                      padding: '10px 16px',
                      background: budgetAnalyticsTab === tab.key ? theme.accent : theme.cardBg,
                      color: budgetAnalyticsTab === tab.key ? 'white' : theme.text,
                      border: '1px solid ' + (budgetAnalyticsTab === tab.key ? theme.accent : theme.border),
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {/* SPENDING TAB */}
              {budgetAnalyticsTab === 'spending' && (() => {
                const analytics = calculateSpendingAnalytics()
                const categoryColors: {[key: string]: string} = {
                  housing: '#3b82f6', transport: '#8b5cf6', food: '#10b981', utilities: '#f59e0b',
                  insurance: '#ef4444', entertainment: '#ec4899', health: '#06b6d4', education: '#6366f1',
                  personal: '#f97316', debt: '#dc2626', savings: '#22c55e', other: '#64748b'
                }
                const categoryEmojis: {[key: string]: string} = {
                  housing: '🏠', transport: '🚗', food: '🍔', utilities: '💡', insurance: '🛡️',
                  entertainment: '🎬', health: '💊', education: '📚', personal: '👤', debt: '💳', savings: '💰', other: '📦'
                }
                
                return (
                  <div>
                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                      <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}>
                        <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Monthly Spending</div>
                        <div style={{ color: theme.danger, fontSize: '28px', fontWeight: 700 }}>${analytics.total.toFixed(0)}</div>
                      </div>
                      <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}>
                        <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Top Category</div>
                        <div style={{ color: theme.text, fontSize: '20px', fontWeight: 700 }}>
                          {categoryEmojis[analytics.topCategory[0] as string] || '📦'} {(analytics.topCategory[0] as string).charAt(0).toUpperCase() + (analytics.topCategory[0] as string).slice(1)}
                        </div>
                        <div style={{ color: theme.danger, fontSize: '14px' }}>${(analytics.topCategory[1] as number).toFixed(0)}/mo</div>
                      </div>
                      <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}>
                        <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>vs Last Month</div>
                        <div style={{ color: analytics.changePercent > 0 ? theme.danger : theme.success, fontSize: '28px', fontWeight: 700 }}>
                          {analytics.changePercent > 0 ? '+' : ''}{analytics.changePercent.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Category Breakdown */}
                    <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '15px' }}>Spending by Category</h4>
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                        {Object.entries(analytics.byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => {
                          const percentage = analytics.total > 0 ? (amount / analytics.total) * 100 : 0
                          return (
                            <div key={cat}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ color: theme.text, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>{categoryEmojis[cat] || '📦'}</span>
                                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </span>
                                <span style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>${amount.toFixed(0)} <span style={{ color: theme.textMuted, fontWeight: 400 }}>({percentage.toFixed(0)}%)</span></span>
                              </div>
                              <div style={{ height: '8px', background: theme.border, borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: percentage + '%', height: '100%', background: categoryColors[cat] || '#64748b', borderRadius: '4px' }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })()}
              
              {/* WEALTH POSITION TAB */}
              {budgetAnalyticsTab === 'wealth' && (() => {
                const wealth = calculateWealthPosition()
                
                return (
                  <div>
                    {/* Main Wealth Card */}
                    <div style={{ padding: '24px', background: `linear-gradient(135deg, ${theme.success}20, ${theme.accent}20)`, borderRadius: '16px', marginBottom: '20px', textAlign: 'center' as const }}>
                      <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>Total Wealth Position</div>
                      <div style={{ color: wealth.netWorth >= 0 ? theme.success : theme.danger, fontSize: '42px', fontWeight: 700 }}>
                        ${wealth.netWorth.toLocaleString()}
                      </div>
                      <div style={{ color: theme.textMuted, fontSize: '13px', marginTop: '8px' }}>
                        Assets: ${(wealth.assets + wealth.tradingAssets).toLocaleString()} • Liabilities: ${wealth.liabilities.toLocaleString()}
                      </div>
                    </div>
                    
                    {/* Breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px' }}>
                        <h4 style={{ margin: '0 0 16px 0', color: theme.success, fontSize: '15px' }}>💰 Assets</h4>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: theme.textMuted, fontSize: '13px' }}>Savings & Investments</span>
                            <span style={{ color: theme.text, fontWeight: 600 }}>${wealth.assets.toLocaleString()}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: theme.textMuted, fontSize: '13px' }}>Trading Accounts</span>
                            <span style={{ color: theme.text, fontWeight: 600 }}>${wealth.tradingAssets.toLocaleString()}</span>
                          </div>
                          {wealth.payouts > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: theme.textMuted, fontSize: '13px' }}>Total Payouts</span>
                              <span style={{ color: theme.success, fontWeight: 600 }}>${wealth.payouts.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px' }}>
                        <h4 style={{ margin: '0 0 16px 0', color: theme.danger, fontSize: '15px' }}>💳 Liabilities</h4>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: theme.textMuted, fontSize: '13px' }}>Total Debt</span>
                            <span style={{ color: theme.danger, fontWeight: 600 }}>${wealth.liabilities.toLocaleString()}</span>
                          </div>
                          {debts.map(d => (
                            <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '12px' }}>
                              <span style={{ color: theme.textMuted, fontSize: '12px' }}>{d.name}</span>
                              <span style={{ color: theme.textMuted, fontSize: '12px' }}>${parseFloat(d.balance || '0').toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Trading P&L Summary */}
                    {trades.length > 0 && (
                      <div style={{ padding: '16px', background: theme.warning + '20', borderRadius: '12px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ color: theme.text, fontWeight: 600 }}>📈 Trading Performance</div>
                          <div style={{ color: theme.textMuted, fontSize: '12px' }}>{trades.length} trades logged</div>
                        </div>
                        <div style={{ textAlign: 'right' as const }}>
                          <div style={{ color: wealth.tradingPnL >= 0 ? theme.success : theme.danger, fontWeight: 700, fontSize: '18px' }}>
                            {wealth.tradingPnL >= 0 ? '+' : ''}${wealth.tradingPnL.toLocaleString()}
                          </div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>Total P&L</div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
              
              {/* UPCOMING BILLS TAB */}
              {budgetAnalyticsTab === 'bills' && (
                <div>
                  <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '15px' }}>📅 Bills Due This Week</h4>
                    {(() => {
                      const today = new Date()
                      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                      const upcomingExpenses = expenses.filter(e => {
                        if (!e.dueDate) return false
                        const dueDate = new Date(e.dueDate)
                        return dueDate >= today && dueDate <= nextWeek
                      }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                      
                      if (upcomingExpenses.length === 0) {
                        return <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No bills due in the next 7 days 🎉</p>
                      }
                      
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                          {upcomingExpenses.map(exp => {
                            const dueDate = new Date(exp.dueDate)
                            const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                            return (
                              <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: daysUntil <= 2 ? theme.danger + '20' : theme.cardBg, borderRadius: '8px', border: '1px solid ' + (daysUntil <= 2 ? theme.danger : theme.border) }}>
                                <div>
                                  <div style={{ color: theme.text, fontWeight: 600 }}>{exp.name}</div>
                                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>
                                    Due {dueDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    {daysUntil === 0 ? ' (TODAY!)' : daysUntil === 1 ? ' (Tomorrow)' : ` (${daysUntil} days)`}
                                  </div>
                                </div>
                                <div style={{ color: theme.danger, fontWeight: 700, fontSize: '18px' }}>${exp.amount}</div>
                              </div>
                            )
                          })}
                          <div style={{ padding: '12px', background: theme.warning + '20', borderRadius: '8px', textAlign: 'center' as const }}>
                            <span style={{ color: theme.text, fontWeight: 600 }}>Total due this week: </span>
                            <span style={{ color: theme.danger, fontWeight: 700 }}>${upcomingExpenses.reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0).toFixed(0)}</span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              )}
              
              {/* SUBSCRIPTIONS TAB */}
              {budgetAnalyticsTab === 'subscriptions' && (
                <div>
                  <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ margin: 0, color: theme.text, fontSize: '15px' }}>🔄 Your Subscriptions</h4>
                      <div style={{ color: theme.danger, fontWeight: 700 }}>
                        ${expenses.filter(e => e.frequency === 'monthly' && (e.category === 'entertainment' || e.category === 'other')).reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0).toFixed(0)}/mo
                      </div>
                    </div>
                    
                    {(() => {
                      const subscriptions = expenses.filter(e => e.frequency === 'monthly')
                      if (subscriptions.length === 0) {
                        return <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No monthly subscriptions tracked</p>
                      }
                      
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                          {subscriptions.map(sub => (
                            <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '8px' }}>
                              <span style={{ color: theme.text }}>{sub.name}</span>
                              <span style={{ color: theme.danger, fontWeight: 600 }}>${sub.amount}/mo</span>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                    
                    {/* Aureus suggestion */}
                    <div style={{ marginTop: '16px', padding: '12px', background: theme.warning + '20', borderRadius: '8px', borderLeft: '4px solid ' + theme.warning }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#78350f' }}>A</div>
                        <span style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>Aureus Tip</span>
                      </div>
                      <p style={{ color: theme.text, fontSize: '13px', margin: 0 }}>
                        Review your subscriptions monthly. Ask yourself: "Did I use this in the last 30 days?" If not, consider cancelling.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* MILESTONES TAB */}
              {budgetAnalyticsTab === 'milestones' && (
                <div>
                  <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '15px' }}>🏆 Financial Milestones</h4>
                    
                    {financialMilestones.length === 0 ? (
                      <div style={{ textAlign: 'center' as const, padding: '20px' }}>
                        <p style={{ color: theme.textMuted, marginBottom: '12px' }}>No milestones yet! Here are some to aim for:</p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, justifyContent: 'center' }}>
                          {[
                            { title: 'First $1,000 saved', type: 'savings_goal' },
                            { title: 'Emergency fund complete', type: 'savings_goal' },
                            { title: 'Debt-free', type: 'debt_payoff' },
                            { title: 'First trading payout', type: 'first_payout' }
                          ].map(m => (
                            <button
                              key={m.title}
                              onClick={() => setFinancialMilestones(prev => [...prev, { id: Date.now(), title: m.title, date: new Date().toISOString().split('T')[0], type: m.type }])}
                              style={{ padding: '8px 16px', background: theme.success + '20', color: theme.success, border: '1px solid ' + theme.success, borderRadius: '20px', cursor: 'pointer', fontSize: '12px' }}
                            >
                              + {m.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                        {financialMilestones.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(milestone => (
                          <div key={milestone.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: theme.success + '20', borderRadius: '8px', border: '1px solid ' + theme.success }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '24px' }}>🏆</span>
                              <div>
                                <div style={{ color: theme.text, fontWeight: 600 }}>{milestone.title}</div>
                                <div style={{ color: theme.textMuted, fontSize: '12px' }}>{new Date(milestone.date).toLocaleDateString()}</div>
                              </div>
                            </div>
                            {milestone.amount && <div style={{ color: theme.success, fontWeight: 700 }}>${milestone.amount.toLocaleString()}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Debts & Goals */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Debts with Payoff Calculator */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: theme.warning, fontSize: '18px' }}>💳 Liabilities</h3>
                  <span style={{ color: theme.warning, fontWeight: 700 }}>${totalDebtBalance.toFixed(0)}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                  <input placeholder="Debt name" value={newDebt.name} onChange={e => setNewDebt({...newDebt, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '80px'}} />
                  <input placeholder="Balance" type="number" value={newDebt.balance} onChange={e => setNewDebt({...newDebt, balance: e.target.value})} style={{...inputStyle, width: '80px'}} />
                  <input placeholder="APR %" type="number" value={newDebt.interestRate} onChange={e => setNewDebt({...newDebt, interestRate: e.target.value})} style={{...inputStyle, width: '60px'}} />
                  <input placeholder="Payment" type="number" value={newDebt.minPayment} onChange={e => setNewDebt({...newDebt, minPayment: e.target.value})} style={{...inputStyle, width: '75px'}} />
                  <select value={newDebt.frequency} onChange={e => setNewDebt({...newDebt, frequency: e.target.value})} style={{...inputStyle, width: '95px'}}>
                    <option value="weekly">Weekly</option>
                    <option value="fortnightly">Fortnightly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <input type="date" value={newDebt.paymentDate} onChange={e => setNewDebt({...newDebt, paymentDate: e.target.value})} style={{...inputStyle, width: '130px'}} title="Next payment date" />
                  <button onClick={addDebt} style={btnWarning}>+</button>
                </div>
                <div style={{ maxHeight: '350px', overflowY: 'auto' as const }}>
                  {debts.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No debts - debt free! 🎉</p> : debts.map(debt => {
                    const payoff = calculateSingleDebtPayoff(debt)
                    const progress = debt.originalBalance ? ((parseFloat(debt.originalBalance) - parseFloat(debt.balance)) / parseFloat(debt.originalBalance)) * 100 : 0
                    const extraPaymentData = debtExtraPayment[debt.id] || { amount: '', frequency: 'monthly' }
                    
                    // Edit mode
                    if (editingItem?.type === 'debt' && editingItem.id === debt.id) {
                      return (
                        <div key={debt.id} style={{ padding: '16px', marginBottom: '12px', background: darkMode ? '#3a2e1e' : '#fefce8', borderRadius: '12px', border: '2px solid ' + theme.warning }}>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, marginBottom: '12px' }}>
                            <input value={editingItem.data.name} onChange={e => updateEditField('name', e.target.value)} placeholder="Name" style={{...inputStyle, flex: 1, minWidth: '100px'}} />
                            <input type="number" value={editingItem.data.balance} onChange={e => updateEditField('balance', e.target.value)} placeholder="Balance" style={{...inputStyle, width: '90px'}} />
                            <input type="number" value={editingItem.data.interestRate} onChange={e => updateEditField('interestRate', e.target.value)} placeholder="APR%" style={{...inputStyle, width: '70px'}} />
                            <input type="number" value={editingItem.data.minPayment} onChange={e => updateEditField('minPayment', e.target.value)} placeholder="Payment" style={{...inputStyle, width: '80px'}} />
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, marginBottom: '12px' }}>
                            <select value={editingItem.data.frequency || 'monthly'} onChange={e => updateEditField('frequency', e.target.value)} style={inputStyle}>
                              <option value="weekly">Weekly</option>
                              <option value="fortnightly">Fortnightly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                            <input type="date" value={editingItem.data.paymentDate || ''} onChange={e => updateEditField('paymentDate', e.target.value)} style={{...inputStyle, width: '130px'}} title="Payment date" />
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={saveEdit} style={{...btnSuccess, padding: '8px 16px', fontSize: '12px'}}>Save</button>
                            <button onClick={cancelEdit} style={{...btnDanger, padding: '8px 16px', fontSize: '12px'}}>Cancel</button>
                          </div>
                        </div>
                      )
                    }
                    
                    return (
                      <div key={debt.id} style={{ padding: '16px', marginBottom: '12px', background: darkMode ? '#3a2e1e' : '#fefce8', borderRadius: '12px', border: '1px solid ' + theme.border }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div>
                            <div style={{ color: theme.text, fontWeight: 600, fontSize: '16px' }}>{debt.name}</div>
                            <div style={{ color: theme.textMuted, fontSize: '12px' }}>
                              {debt.interestRate}% APR • ${debt.minPayment}/{debt.frequency || 'monthly'}
                              {debt.paymentDate && ` • Due ${debt.paymentDate}`}
                              {payoff.extraPayments > 0 && <span style={{ color: theme.success }}> + ${payoff.extraPayments.toFixed(0)} extra</span>}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' as const }}>
                            <div style={{ color: theme.warning, fontWeight: 700, fontSize: '18px' }}>${parseFloat(debt.balance).toFixed(0)}</div>
                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                              <button onClick={() => startEdit('debt', debt)} style={{ padding: '4px 8px', background: theme.accent, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✏️</button>
                              <button onClick={() => deleteDebt(debt.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>×</button>
                            </div>
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
                <h3 style={{ margin: '0 0 16px 0', color: theme.purple, fontSize: '18px' }}>🎯 Capital Targets</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                  <input placeholder="Goal name" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '90px'}} />
                  <input placeholder="Target $" type="number" value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: e.target.value})} style={{...inputStyle, width: '80px'}} />
                  <input placeholder="Saved $" type="number" value={newGoal.saved} onChange={e => setNewGoal({...newGoal, saved: e.target.value})} style={{...inputStyle, width: '80px'}} />
                  <input placeholder="Save $" type="number" value={newGoal.paymentAmount} onChange={e => setNewGoal({...newGoal, paymentAmount: e.target.value})} style={{...inputStyle, width: '70px'}} title="Amount to save each period" />
                  <select value={newGoal.savingsFrequency} onChange={e => setNewGoal({...newGoal, savingsFrequency: e.target.value})} style={{...inputStyle, width: '100px'}}>
                    <option value="weekly">Weekly</option>
                    <option value="fortnightly">Fortnightly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <input type="date" placeholder="Deadline (optional)" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} style={{...inputStyle, width: '130px'}} title="Deadline (optional)" />
                  <button onClick={addGoal} style={btnPurple}>+</button>
                </div>
                
                {/* Time to Goal Preview */}
                {newGoal.target && newGoal.paymentAmount && parseFloat(newGoal.paymentAmount) > 0 && (
                  <div style={{ padding: '12px', marginBottom: '12px', background: theme.purple + '15', borderRadius: '8px', border: '1px solid ' + theme.purple }}>
                    {(() => {
                      const remaining = parseFloat(newGoal.target) - parseFloat(newGoal.saved || '0')
                      const payment = parseFloat(newGoal.paymentAmount)
                      const periods = Math.ceil(remaining / payment)
                      let timeStr = ''
                      let reachDate = new Date()
                      
                      if (newGoal.savingsFrequency === 'weekly') {
                        const weeks = periods
                        const months = Math.floor(weeks / 4.33)
                        const years = Math.floor(months / 12)
                        timeStr = years > 0 ? `${years}y ${months % 12}m` : months > 0 ? `${months} months` : `${weeks} weeks`
                        reachDate.setDate(reachDate.getDate() + (weeks * 7))
                      } else if (newGoal.savingsFrequency === 'fortnightly') {
                        const fortnights = periods
                        const months = Math.floor(fortnights / 2.17)
                        const years = Math.floor(months / 12)
                        timeStr = years > 0 ? `${years}y ${months % 12}m` : months > 0 ? `${months} months` : `${fortnights} fortnights`
                        reachDate.setDate(reachDate.getDate() + (fortnights * 14))
                      } else {
                        const months = periods
                        const years = Math.floor(months / 12)
                        timeStr = years > 0 ? `${years}y ${months % 12}m` : `${months} months`
                        reachDate.setMonth(reachDate.getMonth() + months)
                      }
                      
                      return (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '8px' }}>
                          <div>
                            <span style={{ color: theme.textMuted, fontSize: '12px' }}>At ${payment}/{newGoal.savingsFrequency}: </span>
                            <span style={{ color: theme.purple, fontWeight: 700 }}>{timeStr}</span>
                            <span style={{ color: theme.textMuted, fontSize: '12px' }}> to goal</span>
                          </div>
                          <div style={{ color: theme.text, fontSize: '12px' }}>
                            Est. {reachDate.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
                
                <div style={{ maxHeight: '250px', overflowY: 'auto' as const }}>
                  {goals.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No goals yet</p> : goals.map(goal => {
                    const progress = (parseFloat(goal.saved || '0') / parseFloat(goal.target || '1')) * 100
                    const remaining = parseFloat(goal.target || '0') - parseFloat(goal.saved || '0')
                    
                    // Calculate time to goal based on payment amount
                    let timeToGoal = ''
                    let paymentNeeded = 0
                    const payment = parseFloat(goal.paymentAmount || '0')
                    
                    if (payment > 0 && remaining > 0) {
                      const periods = Math.ceil(remaining / payment)
                      if (goal.savingsFrequency === 'weekly') {
                        const months = Math.floor(periods / 4.33)
                        timeToGoal = months > 12 ? `${Math.floor(months/12)}y ${months%12}m` : months > 0 ? `${months} months` : `${periods} weeks`
                      } else if (goal.savingsFrequency === 'fortnightly') {
                        const months = Math.floor(periods / 2.17)
                        timeToGoal = months > 12 ? `${Math.floor(months/12)}y ${months%12}m` : months > 0 ? `${months} months` : `${periods} fortnights`
                      } else {
                        timeToGoal = periods > 12 ? `${Math.floor(periods/12)}y ${periods%12}m` : `${periods} months`
                      }
                    }
                    
                    // Calculate payment needed for deadline (if set and no payment amount)
                    const deadline = goal.deadline ? new Date(goal.deadline) : null
                    if (deadline && remaining > 0 && !payment) {
                      const now = new Date()
                      const msLeft = deadline.getTime() - now.getTime()
                      if (goal.savingsFrequency === 'weekly') {
                        const weeks = Math.max(1, Math.ceil(msLeft / (7 * 24 * 60 * 60 * 1000)))
                        paymentNeeded = remaining / weeks
                      } else if (goal.savingsFrequency === 'fortnightly') {
                        const fortnights = Math.max(1, Math.ceil(msLeft / (14 * 24 * 60 * 60 * 1000)))
                        paymentNeeded = remaining / fortnights
                      } else {
                        const months = Math.max(1, Math.ceil(msLeft / (30 * 24 * 60 * 60 * 1000)))
                        paymentNeeded = remaining / months
                      }
                    }
                    
                    return editingItem?.type === 'goal' && editingItem.id === goal.id ? (
                      <div key={goal.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#2e1e3a' : '#faf5ff', borderRadius: '8px', border: '2px solid ' + theme.purple }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, marginBottom: '8px' }}>
                          <input value={editingItem.data.name} onChange={e => updateEditField('name', e.target.value)} placeholder="Name" style={{...inputStyle, flex: 1, minWidth: '100px'}} />
                          <input type="number" value={editingItem.data.target} onChange={e => updateEditField('target', e.target.value)} placeholder="Target" style={{...inputStyle, width: '80px'}} />
                          <input type="number" value={editingItem.data.saved} onChange={e => updateEditField('saved', e.target.value)} placeholder="Saved" style={{...inputStyle, width: '80px'}} />
                          <input type="number" value={editingItem.data.paymentAmount || ''} onChange={e => updateEditField('paymentAmount', e.target.value)} placeholder="Save $" style={{...inputStyle, width: '70px'}} />
                          <select value={editingItem.data.savingsFrequency} onChange={e => updateEditField('savingsFrequency', e.target.value)} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                          <input type="date" value={editingItem.data.deadline} onChange={e => updateEditField('deadline', e.target.value)} style={{...inputStyle, width: '130px'}} />
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
                            {payment > 0 && timeToGoal && (
                              <div style={{ color: theme.success, fontSize: '12px', fontWeight: 600 }}>
                                ${payment.toFixed(0)}/{goal.savingsFrequency} → {timeToGoal} to goal
                              </div>
                            )}
                            {paymentNeeded > 0 && (
                              <div style={{ color: theme.purple, fontSize: '12px', fontWeight: 600 }}>
                                Save ${paymentNeeded.toFixed(0)}/{goal.savingsFrequency} to reach goal
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: theme.purple, fontWeight: 700 }}>{progress.toFixed(0)}%</span>
                            <button onClick={() => startEdit('goal', goal)} style={{ padding: '4px 8px', background: theme.accent, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} title="Edit">✏️</button>
                            <button onClick={() => addGoalToCalendar(goal)} style={{ padding: '4px 8px', background: theme.purple, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} title="Add to Calendar">📅</button>
                            {/* Link to Roadmap button - only show if not already linked */}
                            {!roadmapMilestones.some(m => m.linkedGoalId === goal.id) && (
                              <button 
                                onClick={() => addToRoadmap(goal.name, 'savings', goal.target, '🎯', `Saving ${goal.paymentAmount}/${goal.savingsFrequency}`, parseFloat(goal.saved || '0'), goal.id)} 
                                style={{ padding: '4px 8px', background: theme.success + '20', color: theme.success, border: '1px solid ' + theme.success, borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }} 
                                title="Link to Roadmap"
                              >🗺️</button>
                            )}
                            {roadmapMilestones.some(m => m.linkedGoalId === goal.id) && (
                              <span style={{ padding: '2px 6px', background: theme.success + '20', color: theme.success, borderRadius: '4px', fontSize: '9px' }} title="Linked to Roadmap">🔗</span>
                            )}
                            <button onClick={() => deleteGoal(goal.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} title="Delete">×</button>
                          </div>
                        </div>
                        
                        {/* Date picker for adding to calendar */}
                        {goalCalendarPicker?.goalId === goal.id && goalCalendarPicker && (
                          <div style={{ marginTop: '12px', padding: '12px', background: theme.cardBg, borderRadius: '8px', border: '1px solid ' + theme.purple }}>
                            <div style={{ color: theme.text, fontSize: '13px', marginBottom: '8px', fontWeight: 600 }}>📅 When do you want to start saving?</div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <input 
                                type="date" 
                                value={goalCalendarPicker.startDate} 
                                onChange={e => setGoalCalendarPicker({...goalCalendarPicker, startDate: e.target.value})}
                                style={{...inputStyle, width: '150px'}}
                              />
                              <button onClick={confirmGoalToCalendar} style={{ padding: '8px 16px', background: theme.success, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>✓ Add to Calendar</button>
                              <button onClick={() => setGoalCalendarPicker(null)} style={{ padding: '8px 12px', background: theme.danger, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                            </div>
                            <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '8px' }}>
                              Will add ${payment.toFixed(0)}/{goal.savingsFrequency} recurring payment
                            </div>
                          </div>
                        )}
                        
                        <div style={{ height: '8px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: goalCalendarPicker?.goalId === goal.id ? '12px' : '0' }}><div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: theme.purple, borderRadius: '4px' }} /></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            
            {/* ASSETS & NET WORTH - Added to Command Centre */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: theme.success, fontSize: '18px' }}>💰 Assets</h3>
                <div style={{ textAlign: 'right' as const }}>
                  <div style={{ color: theme.success, fontWeight: 700, fontSize: '18px' }}>${totalAssets.toLocaleString()}</div>
                  <div style={{ color: theme.textMuted, fontSize: '11px' }}>Wealth Position: <span style={{ color: netWorth >= 0 ? theme.success : theme.danger }}>${netWorth.toLocaleString()}</span></div>
                </div>
              </div>
              
              {/* Quick add presets - country-aware */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                {[
                  { name: 'Savings Account', type: 'savings' },
                  { name: currentCountryConfig?.terminology?.retirement || 'Super/401K', type: 'super' },
                  { name: 'Emergency Fund', type: 'savings' },
                  { name: 'ETF Portfolio', type: 'investment' }
                ].map(preset => (
                  <button key={preset.name} onClick={() => setNewAsset({...newAsset, name: preset.name, type: preset.type})} style={{ padding: '4px 10px', background: theme.cardBg, color: theme.textMuted, border: '1px solid ' + theme.border, borderRadius: '12px', cursor: 'pointer', fontSize: '11px' }}>+ {preset.name}</button>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input placeholder="Asset name" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} style={{...inputStyle, flex: 1}} />
                <input placeholder="Value" type="number" value={newAsset.value} onChange={e => setNewAsset({...newAsset, value: e.target.value})} style={{...inputStyle, width: '100px'}} />
                <select value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} style={inputStyle}>
                  <option value="savings">💰 Savings</option>
                  <option value="super">🏦 {currentCountryConfig?.terminology?.retirement || 'Super'}</option>
                  <option value="investment">📊 Investment</option>
                  <option value="property">🏠 Property</option>
                  <option value="vehicle">🚗 Vehicle</option>
                  <option value="crypto">₿ Crypto</option>
                </select>
                <button onClick={addAsset} style={btnSuccess}>+</button>
              </div>
              
              {/* Compact asset list */}
              {assets.length === 0 ? (
                <div style={{ textAlign: 'center' as const, padding: '16px', color: theme.textMuted, fontSize: '13px' }}>
                  No assets yet. Add your savings, {currentCountryConfig?.terminology?.retirement || 'super'}, and investments!
                </div>
              ) : (
                <div style={{ maxHeight: '200px', overflowY: 'auto' as const }}>
                  {assets.map(a => (
                    <div key={a.id} style={{ padding: '10px 12px', marginBottom: '6px', background: darkMode ? '#1e2a3b' : '#f8fafc', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ color: theme.text, fontSize: '14px' }}>{a.name}</span>
                        <span style={{ color: theme.textMuted, fontSize: '11px', marginLeft: '8px' }}>{a.type}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: a.type === 'savings' ? theme.success : a.type === 'super' ? theme.accent : a.type === 'investment' ? theme.purple : theme.warning, fontWeight: 700 }}>${parseFloat(a.value).toLocaleString()}</span>
                        <button onClick={() => deleteAsset(a.id)} style={{ padding: '2px 6px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Summary row */}
              {assets.length > 0 && (
                <div style={{ marginTop: '12px', padding: '10px', background: theme.success + '10', borderRadius: '8px', display: 'flex', justifyContent: 'space-around', fontSize: '12px' }}>
                  <div><span style={{ color: theme.textMuted }}>Liquid:</span> <span style={{ color: theme.success, fontWeight: 600 }}>${assets.filter(a => a.type === 'savings' || a.type === 'investment').reduce((s, a) => s + parseFloat(a.value || '0'), 0).toLocaleString()}</span></div>
                  <div><span style={{ color: theme.textMuted }}>{currentCountryConfig?.terminology?.retirement || 'Super'}:</span> <span style={{ color: theme.accent, fontWeight: 600 }}>${assets.filter(a => a.type === 'super').reduce((s, a) => s + parseFloat(a.value || '0'), 0).toLocaleString()}</span></div>
                  <div><span style={{ color: theme.textMuted }}>Other:</span> <span style={{ color: theme.warning, fontWeight: 600 }}>${assets.filter(a => a.type === 'property' || a.type === 'vehicle' || a.type === 'crypto').reduce((s, a) => s + parseFloat(a.value || '0'), 0).toLocaleString()}</span></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* OVERVIEW TAB - Financial Freedom Dashboard */}
        {appMode === 'budget' && activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            
            {/* Aureus Chat - At TOP */}
            <div data-aureus-chat="true" style={{ padding: '20px', background: `linear-gradient(135deg, ${theme.success}15, ${theme.purple}15)`, borderRadius: '16px', border: '2px solid ' + theme.success }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: chatMessages.length > 0 ? '16px' : '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#78350f' }}>A</div>
                <div><div style={{ color: theme.text, fontWeight: 600 }}>Aureus</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>Operations Score: {financialHealthScore}</div></div>
              </div>
              {proactiveInsight && chatMessages.length === 0 && <div style={{ marginBottom: '12px' }}><p style={{ color: theme.text, fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{proactiveInsight.insight || proactiveInsight.message}</p>{proactiveInsight.suggestion && <p style={{ color: theme.purple, fontSize: '13px', margin: '8px 0 0 0' }}>💡 {proactiveInsight.suggestion}</p>}</div>}
              {chatMessages.length > 0 && (
                <div ref={chatContainerRef} style={{ maxHeight: '400px', overflowY: 'auto' as const, marginBottom: '12px', padding: '12px', background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} style={{ marginBottom: '10px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: msg.role === 'user' ? theme.accent : theme.cardBg, color: msg.role === 'user' ? 'white' : theme.text, fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-wrap' as const }}>
                        {msg.content}
                        {msg.image && (
                          <div style={{ marginTop: '10px' }}>
                            <img src={msg.image} alt="Uploaded chart" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid ' + theme.border }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div style={{ display: 'flex', gap: '4px', padding: '10px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite' }} />
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.2s' }} />
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.4s' }} />
                    </div>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}><input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChatMessage()} placeholder="Ask Aureus anything..." style={{ ...inputStyle, flex: 1, padding: '10px 14px', fontSize: '13px' }} disabled={isLoading} /><button onClick={handleChatMessage} disabled={isLoading || !chatInput.trim()} style={{ padding: '10px 16px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', opacity: isLoading || !chatInput.trim() ? 0.5 : 1 }}>{isLoading ? '...' : 'Send'}</button></div>
            </div>
            
            {/* FINANCIAL OPERATIONS SCORE */}
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '12px', letterSpacing: '2px', marginBottom: '4px' }}>FINANCIAL OPERATIONS SCORE</div>
                  <div style={{ color: theme.text, fontSize: '14px' }}>How efficiently your money machine is running</div>
                </div>
                <div style={{ textAlign: 'right' as const }}>
                  <div style={{ 
                    fontSize: '48px', 
                    fontWeight: 'bold', 
                    color: financialHealthScore >= 70 ? theme.success : financialHealthScore >= 40 ? theme.warning : theme.danger 
                  }}>
                    {financialHealthScore}
                  </div>
                  <div style={{ color: financialHealthScore >= 70 ? theme.success : financialHealthScore >= 40 ? theme.warning : theme.danger, fontSize: '14px' }}>
                    {financialHealthScore >= 80 ? '🌟 Excellent' : financialHealthScore >= 60 ? '✅ Good' : financialHealthScore >= 40 ? '⚠️ Fair' : '🔴 Needs Work'}
                  </div>
                </div>
              </div>
            </div>

            {/* CASH FLOW QUADRANT */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>💡 Cash Flow Quadrant</h2>
                  <p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '13px' }}>Move income from left → right to build freedom</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ textAlign: 'right' as const }}>
                    <div style={{ fontSize: '11px', color: theme.danger }}>📊 You work</div>
                    <div style={{ color: theme.danger, fontWeight: 700 }}>${activeIncome.toFixed(0)}</div>
                  </div>
                  <div style={{ textAlign: 'right' as const }}>
                    <div style={{ fontSize: '11px', color: theme.success }}>📈 Money works</div>
                    <div style={{ color: theme.success, fontWeight: 700 }}>${(passiveIncome + totalPassiveQuestIncome).toFixed(0)}</div>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontSize: '28px' }}>👔</div>
                    <div style={{ textAlign: 'right' as const }}>
                      <div style={{ color: theme.text, fontSize: '24px', fontWeight: 700 }}>${activeIncome.toFixed(0)}</div>
                      <div style={{ color: theme.textMuted, fontSize: '12px' }}>{monthlyIncome > 0 ? ((activeIncome / monthlyIncome) * 100).toFixed(0) : 0}%</div>
                    </div>
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: '24px', fontWeight: 300 }}>E</div>
                  <div style={{ color: theme.text, fontWeight: 600 }}>Employee</div>
                  <div style={{ color: theme.textMuted, fontSize: '13px' }}>You work for money</div>
                </div>
                
                <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontSize: '28px' }}>🏢</div>
                    <div style={{ textAlign: 'right' as const }}>
                      <div style={{ color: theme.text, fontSize: '24px', fontWeight: 700 }}>$0</div>
                      <div style={{ color: theme.textMuted, fontSize: '12px' }}>0%</div>
                    </div>
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: '24px', fontWeight: 300 }}>B</div>
                  <div style={{ color: theme.text, fontWeight: 600 }}>Business Owner</div>
                  <div style={{ color: theme.textMuted, fontSize: '13px' }}>Systems work for you</div>
                </div>
                
                <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontSize: '28px' }}>🔧</div>
                    <div style={{ textAlign: 'right' as const }}>
                      <div style={{ color: theme.text, fontSize: '24px', fontWeight: 700 }}>$0</div>
                      <div style={{ color: theme.textMuted, fontSize: '12px' }}>0%</div>
                    </div>
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: '24px', fontWeight: 300 }}>S</div>
                  <div style={{ color: theme.text, fontWeight: 600 }}>Self-Employed</div>
                  <div style={{ color: theme.textMuted, fontSize: '13px' }}>You own a job</div>
                </div>
                
                <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontSize: '28px' }}>📈</div>
                    <div style={{ textAlign: 'right' as const }}>
                      <div style={{ color: theme.text, fontSize: '24px', fontWeight: 700 }}>${(passiveIncome + totalPassiveQuestIncome).toFixed(0)}</div>
                      <div style={{ color: theme.textMuted, fontSize: '12px' }}>{monthlyIncome > 0 ? (((passiveIncome + totalPassiveQuestIncome) / monthlyIncome) * 100).toFixed(0) : 0}%</div>
                    </div>
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: '24px', fontWeight: 300 }}>I</div>
                  <div style={{ color: theme.text, fontWeight: 600 }}>Investor</div>
                  <div style={{ color: theme.textMuted, fontSize: '13px' }}>Money works for you</div>
                </div>
              </div>
            </div>

            {/* ADVANCED METRICS DASHBOARD - Under Financial Operations Score */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '22px' }}>📊 Performance Metrics</h2>
              <p style={{ margin: '0 0 20px 0', color: theme.textMuted, fontSize: '13px' }}>KPIs that drive your Financial Operations Score</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {/* Capital Efficiency Ratio */}
                <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', border: '1px solid ' + theme.border }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>CER</div>
                    <div style={{ color: capitalEfficiencyRatio >= 30 ? theme.success : capitalEfficiencyRatio >= 15 ? theme.warning : theme.danger, fontSize: '28px', fontWeight: 700 }}>
                      {capitalEfficiencyRatio.toFixed(1)}%
                    </div>
                  </div>
                  <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>Capital Efficiency Ratio</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>Productive capital ÷ Income</div>
                  <div style={{ height: '4px', background: theme.border, borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                    <div style={{ width: Math.min(capitalEfficiencyRatio, 100) + '%', height: '100%', background: theme.accent }} />
                  </div>
                </div>

                {/* Risk Management Factor */}
                <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', border: '1px solid ' + theme.border }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>RMF</div>
                    <div style={{ color: riskManagementFactor >= 0.8 ? theme.success : riskManagementFactor >= 0.4 ? theme.warning : theme.danger, fontSize: '28px', fontWeight: 700 }}>
                      {(riskManagementFactor * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>Risk Management Factor</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>{emergencyMonths.toFixed(1)} months emergency fund</div>
                  <div style={{ height: '4px', background: theme.border, borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                    <div style={{ width: (riskManagementFactor * 100) + '%', height: '100%', background: theme.purple }} />
                  </div>
                </div>

                {/* Liquidity Factor */}
                <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', border: '1px solid ' + theme.border }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>LF</div>
                    <div style={{ color: liquidityFactor >= 0.5 ? theme.success : liquidityFactor >= 0.25 ? theme.warning : theme.danger, fontSize: '28px', fontWeight: 700 }}>
                      {(liquidityFactor * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>Liquidity Factor</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>Liquid vs illiquid assets</div>
                  <div style={{ height: '4px', background: theme.border, borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                    <div style={{ width: (liquidityFactor * 100) + '%', height: '100%', background: theme.success }} />
                  </div>
                </div>

                {/* Adjusted Capital Efficiency */}
                <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', border: '1px solid ' + theme.border }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>ACE</div>
                    <div style={{ color: adjustedCapitalEfficiency >= 10 ? theme.success : adjustedCapitalEfficiency >= 5 ? theme.warning : theme.danger, fontSize: '28px', fontWeight: 700 }}>
                      {adjustedCapitalEfficiency.toFixed(1)}
                    </div>
                  </div>
                  <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>Adjusted Capital Efficiency</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>CER × Risk × Liquidity × Allocation</div>
                  <div style={{ height: '4px', background: theme.border, borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                    <div style={{ width: Math.min(adjustedCapitalEfficiency * 2, 100) + '%', height: '100%', background: theme.warning }} />
                  </div>
                </div>

                {/* Compounding Velocity */}
                <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', border: '1px solid ' + theme.border }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>CV</div>
                    <div style={{ color: compoundingVelocity >= 25 ? theme.success : compoundingVelocity >= 10 ? theme.warning : theme.danger, fontSize: '28px', fontWeight: 700 }}>
                      {compoundingVelocity.toFixed(1)}%
                    </div>
                  </div>
                  <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>Compounding Velocity</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>Growth acceleration potential</div>
                  <div style={{ height: '4px', background: theme.border, borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                    <div style={{ width: Math.min(compoundingVelocity, 100) + '%', height: '100%', background: theme.accent }} />
                  </div>
                </div>

                {/* Allocation Diversity Score */}
                <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', border: '1px solid ' + theme.border }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>ADS</div>
                    <div style={{ color: allocationDiversityScore >= 60 ? theme.success : allocationDiversityScore >= 30 ? theme.warning : theme.danger, fontSize: '28px', fontWeight: 700 }}>
                      {allocationDiversityScore}
                    </div>
                  </div>
                  <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>Allocation Diversity Score</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>{incomeStreamCount} income streams, {assetTypeCount} asset types</div>
                  <div style={{ height: '4px', background: theme.border, borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                    <div style={{ width: allocationDiversityScore + '%', height: '100%', background: theme.purple }} />
                  </div>
                </div>
              </div>

              {/* Forecast Accuracy */}
              <div style={{ marginTop: '16px', padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', border: '1px solid ' + theme.border }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>📎 Forecast Accuracy Index (FAI)</div>
                    <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>How well you're tracking toward your goals</div>
                  </div>
                  <div style={{ color: forecastAccuracyIndex >= 70 ? theme.success : forecastAccuracyIndex >= 40 ? theme.warning : theme.danger, fontSize: '32px', fontWeight: 700 }}>
                    {forecastAccuracyIndex.toFixed(0)}%
                  </div>
                </div>
                <div style={{ height: '8px', background: theme.border, borderRadius: '4px', marginTop: '16px', overflow: 'hidden' }}>
                  <div style={{ width: forecastAccuracyIndex + '%', height: '100%', background: 'linear-gradient(90deg, ' + theme.warning + ', ' + theme.success + ')' }} />
                </div>
              </div>
            </div>

            {/* NET WORTH & ASSETS/LIABILITIES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Monthly Revenue</div><div style={{ color: theme.success, fontSize: '24px', fontWeight: 700 }}>${monthlyIncome.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Operating Costs</div><div style={{ color: theme.danger, fontSize: '24px', fontWeight: 700 }}>${totalOutgoing.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Net Profit</div><div style={{ color: monthlySurplus >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>${monthlySurplus.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>{savingsRate.toFixed(0)}% profit margin</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Wealth Position</div><div style={{ color: netWorth >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>${netWorth.toFixed(0)}</div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><h3 style={{ margin: 0, color: theme.success }}>📈 Assets</h3><span style={{ color: theme.success, fontWeight: 700 }}>${totalAssets.toLocaleString()}</span></div>
                
                {/* Quick add buttons for common accounts */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                  {['Savings Account', 'Super/401K', 'ETF Portfolio', 'Emergency Fund', 'Term Deposit'].map(preset => (
                    <button key={preset} onClick={() => setNewAsset({...newAsset, name: preset, type: preset.includes('Super') ? 'super' : preset.includes('ETF') || preset.includes('Portfolio') ? 'investment' : 'savings'})} style={{ padding: '4px 10px', background: theme.cardBg, color: theme.textMuted, border: '1px solid ' + theme.border, borderRadius: '12px', cursor: 'pointer', fontSize: '11px' }}>+ {preset}</button>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input placeholder="Asset name" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} style={{...inputStyle, flex: 1}} />
                  <input placeholder="Value" type="number" value={newAsset.value} onChange={e => setNewAsset({...newAsset, value: e.target.value})} style={{...inputStyle, width: '100px'}} />
                  <select value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} style={inputStyle}>
                    <option value="savings">💰 Savings</option>
                    <option value="super">🏦 Super/401K</option>
                    <option value="investment">📊 Investment</option>
                    <option value="property">🏠 Property</option>
                    <option value="vehicle">🚗 Vehicle</option>
                    <option value="crypto">₿ Crypto</option>
                    <option value="other">📦 Other</option>
                  </select>
                  <button onClick={addAsset} style={btnSuccess}>+</button>
                </div>
                
                {/* Group assets by type */}
                {assets.length === 0 ? (
                  <div style={{ textAlign: 'center' as const, padding: '20px', color: theme.textMuted }}>
                    <p style={{ margin: 0, fontSize: '13px' }}>No assets added yet. Add your savings, super, and investments!</p>
                  </div>
                ) : (
                  <>
                    {/* Liquid Assets (Savings + Emergency) */}
                    {assets.filter(a => a.type === 'savings').length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase' as const }}>💰 Savings ({assets.filter(a => a.type === 'savings').length})</div>
                        {assets.filter(a => a.type === 'savings').map(a => (
                          <div key={a.id} style={{ padding: '10px 12px', marginBottom: '4px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: theme.text, fontSize: '14px' }}>{a.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: theme.success, fontWeight: 700 }}>${parseFloat(a.value).toLocaleString()}</span><button onClick={() => deleteAsset(a.id)} style={{ padding: '2px 6px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>×</button></div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Super/Retirement */}
                    {assets.filter(a => a.type === 'super').length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase' as const }}>🏦 Super/Retirement</div>
                        {assets.filter(a => a.type === 'super').map(a => (
                          <div key={a.id} style={{ padding: '10px 12px', marginBottom: '4px', background: darkMode ? '#1e2a3b' : '#f0f4ff', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: theme.text, fontSize: '14px' }}>{a.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: theme.accent, fontWeight: 700 }}>${parseFloat(a.value).toLocaleString()}</span><button onClick={() => deleteAsset(a.id)} style={{ padding: '2px 6px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>×</button></div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Investments */}
                    {assets.filter(a => a.type === 'investment' || a.type === 'crypto').length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase' as const }}>📊 Investments</div>
                        {assets.filter(a => a.type === 'investment' || a.type === 'crypto').map(a => (
                          <div key={a.id} style={{ padding: '10px 12px', marginBottom: '4px', background: darkMode ? '#2a1e3b' : '#f5f0ff', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div><span style={{ color: theme.text, fontSize: '14px' }}>{a.name}</span><span style={{ color: theme.textMuted, fontSize: '11px', marginLeft: '8px' }}>{a.type}</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: theme.purple, fontWeight: 700 }}>${parseFloat(a.value).toLocaleString()}</span><button onClick={() => deleteAsset(a.id)} style={{ padding: '2px 6px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>×</button></div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Property & Other */}
                    {assets.filter(a => a.type === 'property' || a.type === 'vehicle' || a.type === 'other').length > 0 && (
                      <div>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase' as const }}>🏠 Property & Other</div>
                        {assets.filter(a => a.type === 'property' || a.type === 'vehicle' || a.type === 'other').map(a => (
                          <div key={a.id} style={{ padding: '10px 12px', marginBottom: '4px', background: darkMode ? '#3a3a1e' : '#fffef0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div><span style={{ color: theme.text, fontSize: '14px' }}>{a.name}</span><span style={{ color: theme.textMuted, fontSize: '11px', marginLeft: '8px' }}>{a.type}</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: theme.warning, fontWeight: 700 }}>${parseFloat(a.value).toLocaleString()}</span><button onClick={() => deleteAsset(a.id)} style={{ padding: '2px 6px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>×</button></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                
                {/* Summary by category */}
                {assets.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '12px', background: theme.success + '15', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: theme.text }}>
                      <span>💰 Liquid:</span>
                      <span style={{ fontWeight: 600 }}>${assets.filter(a => a.type === 'savings' || a.type === 'investment').reduce((s, a) => s + parseFloat(a.value || '0'), 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: theme.text, marginTop: '4px' }}>
                      <span>🏦 Super:</span>
                      <span style={{ fontWeight: 600 }}>${assets.filter(a => a.type === 'super').reduce((s, a) => s + parseFloat(a.value || '0'), 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: theme.text, marginTop: '4px' }}>
                      <span>🏠 Illiquid:</span>
                      <span style={{ fontWeight: 600 }}>${assets.filter(a => a.type === 'property' || a.type === 'vehicle' || a.type === 'other').reduce((s, a) => s + parseFloat(a.value || '0'), 0).toLocaleString()}</span>
                    </div>
                  </div>
                )}
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

        {/* PATH TAB - Baby Steps & Quest Board */}
        {appMode === 'budget' && activeTab === 'path' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            
            {/* Financial Disclaimer Banner */}
            <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #f59e0b15, #ef444415)', borderRadius: '12px', border: '1px solid #f59e0b40' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <div>
                  <div style={{ color: theme.text, fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Important Disclaimer</div>
                  <p style={{ margin: 0, color: theme.textMuted, fontSize: '12px', lineHeight: 1.5 }}>
                    This app provides general financial information and AI-powered suggestions for educational purposes only. It is <strong>not financial advice</strong>. 
                    Aureus is an AI assistant that can make mistakes — always verify calculations and recommendations. 
                    Consult a licensed financial advisor, accountant, or relevant professional before making significant financial decisions. 
                    Past performance and projections do not guarantee future results.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Aureus Chat - At TOP */}
            <div data-aureus-chat="true" style={{ padding: '20px', background: `linear-gradient(135deg, ${theme.success}15, ${theme.purple}15)`, borderRadius: '16px', border: '2px solid ' + theme.success }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: chatMessages.length > 0 ? '16px' : '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#78350f' }}>A</div>
                <div><div style={{ color: theme.text, fontWeight: 600 }}>Aureus</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>{currentBabyStep.title}</div></div>
              </div>
              {proactiveInsight && chatMessages.length === 0 && <div style={{ marginBottom: '12px' }}><p style={{ color: theme.text, fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{proactiveInsight.insight || proactiveInsight.message}</p>{proactiveInsight.suggestion && <p style={{ color: theme.purple, fontSize: '13px', margin: '8px 0 0 0' }}>💡 {proactiveInsight.suggestion}</p>}</div>}
              {chatMessages.length > 0 && (
                <div ref={chatContainerRef} style={{ maxHeight: '200px', overflowY: 'auto' as const, marginBottom: '12px', padding: '8px', background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} style={{ marginBottom: '10px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: msg.role === 'user' ? theme.accent : theme.cardBg, color: msg.role === 'user' ? 'white' : theme.text, fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-wrap' as const }}>
                        {msg.content}
                        {msg.image && (
                          <div style={{ marginTop: '10px' }}>
                            <img src={msg.image} alt="Uploaded chart" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid ' + theme.border }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div style={{ display: 'flex', gap: '4px', padding: '10px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite' }} />
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.2s' }} />
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.4s' }} />
                    </div>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}><input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChatMessage()} placeholder="Ask Aureus anything..." style={{ ...inputStyle, flex: 1, padding: '10px 14px', fontSize: '13px' }} disabled={isLoading} /><button onClick={handleChatMessage} disabled={isLoading || !chatInput.trim()} style={{ padding: '10px 16px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', opacity: isLoading || !chatInput.trim() ? 0.5 : 1 }}>{isLoading ? '...' : 'Send'}</button></div>
            </div>
            
            {/* Selected Financial Path */}
            {budgetMemory.financialPath && (
              <div style={{ padding: '20px', background: `linear-gradient(135deg, ${
                budgetMemory.financialPath === 'babysteps' ? '#10b98120' :
                budgetMemory.financialPath === 'fire' ? '#f5920b20' :
                budgetMemory.financialPath === 'home' ? '#3b82f620' :
                budgetMemory.financialPath === 'automated' ? '#8b5cf620' :
                '#6366f120'
              }, transparent)`, borderRadius: '16px', border: '2px solid ' + (
                budgetMemory.financialPath === 'babysteps' ? theme.success :
                budgetMemory.financialPath === 'fire' ? theme.warning :
                budgetMemory.financialPath === 'home' ? theme.accent :
                budgetMemory.financialPath === 'automated' ? theme.purple :
                '#6366f1'
              ) }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                      {budgetMemory.financialPath === 'babysteps' ? '👶' :
                       budgetMemory.financialPath === 'fire' ? '🔥' :
                       budgetMemory.financialPath === 'home' ? '🏠' :
                       budgetMemory.financialPath === 'automated' ? '💰' : '📊'}
                    </div>
                    <div style={{ color: theme.text, fontWeight: 700, fontSize: '20px' }}>
                      {budgetMemory.financialPath === 'babysteps' ? 'Baby Steps Path' :
                       budgetMemory.financialPath === 'fire' ? 'FIRE Path' :
                       budgetMemory.financialPath === 'home' ? 'Home Ownership Path' :
                       budgetMemory.financialPath === 'automated' ? 'Automated Income Path' : 'Optimise Operations Path'}
                    </div>
                    <div style={{ color: theme.textMuted, fontSize: '13px', marginTop: '4px' }}>
                      {budgetMemory.financialPath === 'babysteps' ? `Currently on Step ${currentBabyStep.step}: ${currentBabyStep.title}` :
                       budgetMemory.financialPath === 'fire' ? `FIRE Number: $${(monthlyExpenses * 12 * 25).toLocaleString()} • ${monthlyExpenses > 0 ? (((passiveIncome + totalPassiveQuestIncome) / monthlyExpenses) * 100).toFixed(0) : 0}% freedom` :
                       budgetMemory.financialPath === 'home' ? 'Building towards your home deposit' :
                       budgetMemory.financialPath === 'automated' ? `${passiveIncome > 0 ? ((passiveIncome / (activeIncome || 1)) * 100).toFixed(0) : 0}% passive income ratio` : 
                       `CER: ${monthlyExpenses > 0 && monthlyIncome > 0 ? ((monthlyExpenses / monthlyIncome) * 100).toFixed(0) : 0}%`}
                    </div>
                  </div>
                  <button 
                    onClick={() => sendQuickMessage("I'd like to change my financial path")}
                    style={{ padding: '8px 16px', background: theme.cardBg, color: theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Change Path
                  </button>
                </div>
              </div>
            )}
            
            {/* Big Goals Display */}
            {budgetMemory.bigGoals && Object.keys(budgetMemory.bigGoals).length > 0 && (
              <div style={{ padding: '20px', background: 'linear-gradient(135deg, #8b5cf615, #f59e0b15)', borderRadius: '16px', border: '2px solid ' + theme.purple }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>🎯</div>
                    <h3 style={{ margin: 0, color: theme.text, fontSize: '18px' }}>Your Big Dreams</h3>
                    <p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '12px' }}>The goals that drive your daily financial decisions</p>
                  </div>
                  <button 
                    onClick={() => sendQuickMessage("I want to update my big goals")}
                    style={{ padding: '8px 16px', background: theme.cardBg, color: theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Update Goals
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {budgetMemory.bigGoals.home && (
                    <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>🏠</span>
                          <span style={{ color: theme.accent, fontWeight: 600 }}>Home Ownership</span>
                        </div>
                        {!roadmapMilestones.some(m => m.name.toLowerCase().includes('home')) && (
                          <button onClick={() => {
                            const match = budgetMemory.bigGoals.home.match(/\$?([\d,]+)/)
                            addToRoadmap('Home Deposit', 'savings', match ? match[1].replace(/,/g, '') : '100000', '🏠', budgetMemory.bigGoals.home)
                          }} style={{ padding: '4px 8px', background: theme.purple + '20', color: theme.purple, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '10px' }}>+ Roadmap</button>
                        )}
                      </div>
                      <div style={{ color: theme.text, fontSize: '14px' }}>{budgetMemory.bigGoals.home}</div>
                    </div>
                  )}
                  {budgetMemory.bigGoals.fire && (
                    <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>🔥</span>
                          <span style={{ color: theme.warning, fontWeight: 600 }}>Financial Independence</span>
                        </div>
                        {!roadmapMilestones.some(m => m.name.toLowerCase().includes('fire') || m.name.toLowerCase().includes('retire')) && (
                          <button onClick={() => {
                            const fireNumber = monthlyExpenses * 12 * 25
                            addToRoadmap('FIRE Number', 'savings', fireNumber.toString(), '🔥', budgetMemory.bigGoals.fire)
                          }} style={{ padding: '4px 8px', background: theme.purple + '20', color: theme.purple, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '10px' }}>+ Roadmap</button>
                        )}
                      </div>
                      <div style={{ color: theme.text, fontSize: '14px' }}>{budgetMemory.bigGoals.fire}</div>
                    </div>
                  )}
                  {budgetMemory.bigGoals.debtFree && (
                    <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>💳</span>
                          <span style={{ color: theme.success, fontWeight: 600 }}>Debt Freedom</span>
                        </div>
                        {!roadmapMilestones.some(m => m.name.toLowerCase().includes('debt')) && totalDebtBalance > 0 && (
                          <button onClick={() => addToRoadmap('Become Debt Free', 'debt', totalDebtBalance.toString(), '💳', budgetMemory.bigGoals.debtFree)} style={{ padding: '4px 8px', background: theme.purple + '20', color: theme.purple, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '10px' }}>+ Roadmap</button>
                        )}
                      </div>
                      <div style={{ color: theme.text, fontSize: '14px' }}>{budgetMemory.bigGoals.debtFree}</div>
                    </div>
                  )}
                  {budgetMemory.bigGoals.wealthTarget && (
                    <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>💰</span>
                          <span style={{ color: theme.purple, fontWeight: 600 }}>Wealth Target</span>
                        </div>
                        {!roadmapMilestones.some(m => m.name.toLowerCase().includes('wealth') || m.name.toLowerCase().includes('net worth')) && (
                          <button onClick={() => {
                            const match = budgetMemory.bigGoals.wealthTarget.match(/\$?([\d,]+)/)
                            addToRoadmap('Wealth Target', 'savings', match ? match[1].replace(/,/g, '') : '1000000', '💰', budgetMemory.bigGoals.wealthTarget)
                          }} style={{ padding: '4px 8px', background: theme.purple + '20', color: theme.purple, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '10px' }}>+ Roadmap</button>
                        )}
                      </div>
                      <div style={{ color: theme.text, fontSize: '14px' }}>{budgetMemory.bigGoals.wealthTarget}</div>
                    </div>
                  )}
                  {budgetMemory.bigGoals.passiveTarget && (
                    <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>🌴</span>
                          <span style={{ color: theme.success, fontWeight: 600 }}>Passive Income</span>
                        </div>
                        {!roadmapMilestones.some(m => m.name.toLowerCase().includes('passive')) && (
                          <button onClick={() => {
                            const match = budgetMemory.bigGoals.passiveTarget.match(/\$?([\d,]+)/)
                            addToRoadmap('Passive Income Goal', 'income', match ? match[1].replace(/,/g, '') : '3000', '🌴', budgetMemory.bigGoals.passiveTarget, passiveIncome + totalPassiveQuestIncome)
                          }} style={{ padding: '4px 8px', background: theme.purple + '20', color: theme.purple, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '10px' }}>+ Roadmap</button>
                        )}
                      </div>
                      <div style={{ color: theme.text, fontSize: '14px' }}>{budgetMemory.bigGoals.passiveTarget}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* ==================== MY ROADMAP - Visual Path to Goals ==================== */}
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '16px', border: '2px solid ' + theme.purple }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>🗺️</span>
                    <div>
                      <h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>My Roadmap</h2>
                      <p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '13px' }}>Your personalized journey to financial freedom</p>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {roadmapMilestones.length > 0 && (
                    <button
                      onClick={() => {
                        // Build roadmap summary for Aureus
                        const milestoneSummary = roadmapMilestones.map(m => 
                          `- ${m.name}: Target $${parseFloat(m.targetAmount).toLocaleString()}, Current $${m.currentAmount?.toLocaleString() || 0}${m.targetDate ? `, Deadline: ${m.targetDate}` : ''}`
                        ).join('\n')
                        
                        setActiveTab('dashboard')
                        setChatMessages([{
                          role: 'user',
                          content: `Please analyze my roadmap and create a detailed action plan with timeline:\n\n**My Milestones:**\n${milestoneSummary}\n\n**My Financial Data:**\n- Monthly Income: $${monthlyIncome.toFixed(0)}\n- Monthly Expenses: $${monthlyExpenses.toFixed(0)}\n- Net Cash Flow: $${(monthlyIncome - monthlyExpenses - monthlyDebtPayments).toFixed(0)}\n- Current Savings: $${emergencyFund.toFixed(0)}\n- Total Debt: $${totalDebtBalance.toFixed(0)}\n\nPlease give me:\n1. A prioritized order to tackle these goals\n2. Realistic timeline for each milestone\n3. Specific weekly/monthly actions\n4. Any conflicts or concerns with my goals`
                        }])
                        sendQuickMessage(`Please analyze my roadmap and create a detailed action plan with timeline:\n\n**My Milestones:**\n${milestoneSummary}\n\n**My Financial Data:**\n- Monthly Income: $${monthlyIncome.toFixed(0)}\n- Monthly Expenses: $${monthlyExpenses.toFixed(0)}\n- Net Cash Flow: $${(monthlyIncome - monthlyExpenses - monthlyDebtPayments).toFixed(0)}\n- Current Savings: $${emergencyFund.toFixed(0)}\n- Total Debt: $${totalDebtBalance.toFixed(0)}\n\nPlease give me:\n1. A prioritized order to tackle these goals\n2. Realistic timeline for each milestone\n3. Specific weekly/monthly actions\n4. Any conflicts or concerns with my goals`)
                      }}
                      style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      🤖 Aureus: Build My Plan
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddMilestone(true)}
                    style={{ padding: '10px 20px', background: theme.purple, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    + Add Milestone
                  </button>
                </div>
              </div>
              
              {/* Add Milestone Form */}
              {showAddMilestone && (
                <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', marginBottom: '20px', border: '1px solid ' + theme.border }}>
                  <h4 style={{ margin: '0 0 16px 0', color: theme.text }}>✨ Add New Milestone</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Milestone Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Pay off credit card, Save $10K emergency fund"
                        value={newMilestone.name}
                        onChange={e => setNewMilestone({...newMilestone, name: e.target.value})}
                        style={{ width: '100%', padding: '10px', background: darkMode ? '#1e293b' : '#f1f5f9', border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.text }}
                      />
                    </div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Category</label>
                      <select
                        value={newMilestone.category}
                        onChange={e => setNewMilestone({...newMilestone, category: e.target.value, icon: e.target.value === 'savings' ? '💰' : e.target.value === 'debt' ? '💳' : e.target.value === 'income' ? '📈' : '🌴'})}
                        style={{ width: '100%', padding: '10px', background: darkMode ? '#1e293b' : '#f1f5f9', border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.text }}
                      >
                        <option value="savings">💰 Savings Goal</option>
                        <option value="debt">💳 Debt Payoff</option>
                        <option value="income">📈 Income Goal</option>
                        <option value="lifestyle">🌴 Lifestyle Goal</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Target Amount ($)</label>
                      <input
                        type="number"
                        placeholder="e.g., 10000"
                        value={newMilestone.targetAmount}
                        onChange={e => setNewMilestone({...newMilestone, targetAmount: e.target.value})}
                        style={{ width: '100%', padding: '10px', background: darkMode ? '#1e293b' : '#f1f5f9', border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.text }}
                      />
                    </div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Target Date</label>
                      <input
                        type="date"
                        value={newMilestone.targetDate}
                        onChange={e => setNewMilestone({...newMilestone, targetDate: e.target.value})}
                        style={{ width: '100%', padding: '10px', background: darkMode ? '#1e293b' : '#f1f5f9', border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.text }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Notes (optional)</label>
                    <textarea
                      placeholder="Why is this milestone important to you? What will you do when you achieve it?"
                      value={newMilestone.notes}
                      onChange={e => setNewMilestone({...newMilestone, notes: e.target.value})}
                      style={{ width: '100%', padding: '10px', background: darkMode ? '#1e293b' : '#f1f5f9', border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.text, minHeight: '60px', resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => {
                        if (newMilestone.name && newMilestone.targetAmount) {
                          setRoadmapMilestones([...roadmapMilestones, {
                            ...newMilestone,
                            id: Date.now(),
                            currentAmount: 0,
                            completed: false,
                            createdAt: new Date().toISOString()
                          }])
                          setNewMilestone({ name: '', targetAmount: '', targetDate: '', category: 'savings', icon: '🎯', notes: '' })
                          setShowAddMilestone(false)
                        }
                      }}
                      style={{ padding: '10px 24px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Add Milestone
                    </button>
                    <button
                      onClick={() => setShowAddMilestone(false)}
                      style={{ padding: '10px 24px', background: 'transparent', color: theme.textMuted, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {/* Visual Timeline */}
              {roadmapMilestones.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: theme.cardBg, borderRadius: '12px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                  <h3 style={{ color: theme.text, margin: '0 0 8px 0' }}>No milestones yet</h3>
                  <p style={{ color: theme.textMuted, margin: '0 0 16px 0' }}>Add your first milestone to start mapping your financial journey!</p>
                  <p style={{ color: theme.textMuted, fontSize: '13px', margin: 0 }}>
                    Examples: "$2K emergency fund by March", "Pay off credit card by June", "$50K house deposit by 2027"
                  </p>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  {/* Timeline line */}
                  <div style={{ position: 'absolute', left: '24px', top: '24px', bottom: '24px', width: '4px', background: 'linear-gradient(180deg, ' + theme.purple + ', ' + theme.success + ')', borderRadius: '2px' }} />
                  
                  {/* Milestones */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {roadmapMilestones
                      .sort((a, b) => new Date(a.targetDate || '2099-12-31').getTime() - new Date(b.targetDate || '2099-12-31').getTime())
                      .map((milestone, idx) => {
                        const progress = milestone.targetAmount > 0 ? (milestone.currentAmount / parseFloat(milestone.targetAmount)) * 100 : 0
                        const isCompleted = progress >= 100 || milestone.completed
                        const daysUntil = milestone.targetDate ? Math.ceil((new Date(milestone.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
                        
                        return (
                          <div key={milestone.id} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                            {/* Timeline dot */}
                            <div style={{ 
                              width: '48px', height: '48px', borderRadius: '50%', 
                              background: isCompleted ? theme.success : theme.cardBg, 
                              border: '4px solid ' + (isCompleted ? theme.success : theme.purple),
                              display: 'flex', alignItems: 'center', justifyContent: 'center', 
                              fontSize: '24px', flexShrink: 0, zIndex: 1
                            }}>
                              {isCompleted ? '✓' : milestone.icon}
                            </div>
                            
                            {/* Milestone card */}
                            <div style={{ 
                              flex: 1, padding: '20px', background: theme.cardBg, borderRadius: '12px', 
                              border: '1px solid ' + (isCompleted ? theme.success : theme.border),
                              opacity: isCompleted ? 0.8 : 1
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div>
                                  <h4 style={{ margin: '0 0 4px 0', color: theme.text, fontSize: '16px', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                                    {milestone.name}
                                    {milestone.linkedGoalId && <span style={{ marginLeft: '8px', padding: '2px 6px', background: theme.success + '20', color: theme.success, borderRadius: '4px', fontSize: '9px' }} title="Linked to Goal">🔗 Goal</span>}
                                  </h4>
                                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' as const }}>
                                    <span style={{ color: theme.purple, fontSize: '13px', fontWeight: 600 }}>
                                      ${parseFloat(milestone.targetAmount).toLocaleString()}
                                    </span>
                                    {milestone.targetDate && (
                                      <span style={{ 
                                        color: daysUntil !== null && daysUntil < 30 ? theme.warning : theme.textMuted, 
                                        fontSize: '12px' 
                                      }}>
                                        📅 {new Date(milestone.targetDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        {daysUntil !== null && daysUntil > 0 && ` (${daysUntil} days)`}
                                      </span>
                                    )}
                                    {/* Calendar alerts toggle */}
                                    <button
                                      onClick={() => {
                                        const updated = roadmapMilestones.map(m => 
                                          m.id === milestone.id ? { ...m, calendarAlerts: !m.calendarAlerts } : m
                                        )
                                        setRoadmapMilestones(updated)
                                      }}
                                      style={{ 
                                        padding: '2px 8px', 
                                        background: milestone.calendarAlerts === true ? theme.accent + '20' : theme.cardBg, 
                                        color: milestone.calendarAlerts === true ? theme.accent : theme.textMuted, 
                                        border: '1px solid ' + (milestone.calendarAlerts === true ? theme.accent : theme.border), 
                                        borderRadius: '12px', 
                                        cursor: 'pointer', 
                                        fontSize: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                      title={milestone.calendarAlerts === true ? 'Calendar alerts ON - click to disable' : 'Calendar alerts OFF - click to enable'}
                                    >
                                      {milestone.calendarAlerts === true ? '🔔' : '🔕'} Calendar
                                    </button>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {!isCompleted && (
                                    <button
                                      onClick={() => {
                                        const updated = roadmapMilestones.map(m => 
                                          m.id === milestone.id ? { ...m, completed: true, currentAmount: parseFloat(m.targetAmount) } : m
                                        )
                                        setRoadmapMilestones(updated)
                                      }}
                                      style={{ padding: '6px 12px', background: theme.success + '20', color: theme.success, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                      ✓ Complete
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setRoadmapMilestones(roadmapMilestones.filter(m => m.id !== milestone.id))}
                                    style={{ padding: '6px 12px', background: theme.danger + '20', color: theme.danger, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                              
                              {/* Calendar Alert Settings - only show when enabled */}
                              {milestone.calendarAlerts === true && !isCompleted && (
                                <div style={{ padding: '12px', marginBottom: '12px', background: theme.accent + '10', borderRadius: '8px', border: '1px solid ' + theme.accent + '30' }}>
                                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' as const }}>
                                    <span style={{ color: theme.text, fontSize: '12px', fontWeight: 600 }}>🔔 Remind me:</span>
                                    <select
                                      value={milestone.alertFrequency || 'weekly'}
                                      onChange={e => {
                                        const updated = roadmapMilestones.map(m => 
                                          m.id === milestone.id ? { ...m, alertFrequency: e.target.value, alertDay: e.target.value === 'monthly' ? 1 : (m.alertDay || 1) } : m
                                        )
                                        setRoadmapMilestones(updated)
                                      }}
                                      style={{ padding: '6px 10px', background: darkMode ? '#1e293b' : '#f1f5f9', border: '1px solid ' + theme.border, borderRadius: '6px', color: theme.text, fontSize: '12px' }}
                                    >
                                      <option value="weekly">Weekly</option>
                                      <option value="fortnightly">Fortnightly</option>
                                      <option value="monthly">Monthly</option>
                                    </select>
                                    
                                    <span style={{ color: theme.textMuted, fontSize: '12px' }}>on</span>
                                    
                                    {(milestone.alertFrequency || 'weekly') !== 'monthly' ? (
                                      <select
                                        value={milestone.alertDay ?? 1}
                                        onChange={e => {
                                          const updated = roadmapMilestones.map(m => 
                                            m.id === milestone.id ? { ...m, alertDay: parseInt(e.target.value) } : m
                                          )
                                          setRoadmapMilestones(updated)
                                        }}
                                        style={{ padding: '6px 10px', background: darkMode ? '#1e293b' : '#f1f5f9', border: '1px solid ' + theme.border, borderRadius: '6px', color: theme.text, fontSize: '12px' }}
                                      >
                                        <option value={0}>Sunday</option>
                                        <option value={1}>Monday</option>
                                        <option value={2}>Tuesday</option>
                                        <option value={3}>Wednesday</option>
                                        <option value={4}>Thursday</option>
                                        <option value={5}>Friday</option>
                                        <option value={6}>Saturday</option>
                                      </select>
                                    ) : (
                                      <select
                                        value={milestone.alertDay ?? 1}
                                        onChange={e => {
                                          const updated = roadmapMilestones.map(m => 
                                            m.id === milestone.id ? { ...m, alertDay: parseInt(e.target.value) } : m
                                          )
                                          setRoadmapMilestones(updated)
                                        }}
                                        style={{ padding: '6px 10px', background: darkMode ? '#1e293b' : '#f1f5f9', border: '1px solid ' + theme.border, borderRadius: '6px', color: theme.text, fontSize: '12px' }}
                                      >
                                        {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                                          <option key={d} value={d}>{d}{d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th'}</option>
                                        ))}
                                      </select>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Progress bar */}
                              {!isCompleted && (
                                <div style={{ marginBottom: '12px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ color: theme.textMuted, fontSize: '12px' }}>Progress</span>
                                    <span style={{ color: theme.text, fontSize: '12px', fontWeight: 600 }}>{Math.min(progress, 100).toFixed(0)}%</span>
                                  </div>
                                  <div style={{ height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: Math.min(progress, 100) + '%', height: '100%', background: 'linear-gradient(90deg, ' + theme.purple + ', ' + theme.success + ')', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                                  </div>
                                </div>
                              )}
                              
                              {/* Update progress */}
                              {!isCompleted && (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <span style={{ color: theme.textMuted, fontSize: '12px' }}>Current:</span>
                                  <input
                                    type="number"
                                    value={milestone.currentAmount}
                                    onChange={e => {
                                      const updated = roadmapMilestones.map(m => 
                                        m.id === milestone.id ? { ...m, currentAmount: parseFloat(e.target.value) || 0 } : m
                                      )
                                      setRoadmapMilestones(updated)
                                    }}
                                    style={{ width: '100px', padding: '6px 10px', background: darkMode ? '#1e293b' : '#f1f5f9', border: '1px solid ' + theme.border, borderRadius: '6px', color: theme.text, fontSize: '13px' }}
                                  />
                                  <span style={{ color: theme.textMuted, fontSize: '12px' }}>/ ${parseFloat(milestone.targetAmount).toLocaleString()}</span>
                                </div>
                              )}
                              
                              {milestone.notes && (
                                <p style={{ color: theme.textMuted, fontSize: '12px', margin: '12px 0 0 0', fontStyle: 'italic' }}>"{milestone.notes}"</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
              
              {/* Quick Add Suggestions */}
              {roadmapMilestones.length < 3 && (
                <div style={{ marginTop: '20px', padding: '16px', background: theme.purple + '15', borderRadius: '12px' }}>
                  <p style={{ color: theme.text, fontSize: '13px', margin: '0 0 12px 0' }}>💡 <strong>Suggested milestones based on your data:</strong></p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {emergencyFund < 2000 && !roadmapMilestones.some(m => m.name.toLowerCase().includes('emergency')) && (
                      <button
                        onClick={() => {
                          setRoadmapMilestones([...roadmapMilestones, {
                            id: Date.now(),
                            name: '$2K Emergency Fund',
                            category: 'savings',
                            icon: '🛡️',
                            targetAmount: '2000',
                            currentAmount: emergencyFund,
                            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            notes: 'Baby Step 1 - Financial safety net',
                            completed: false,
                            createdAt: new Date().toISOString()
                          }])
                        }}
                        style={{ padding: '8px 16px', background: theme.cardBg, color: theme.text, border: '1px solid ' + theme.border, borderRadius: '20px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        + 🛡️ $2K Emergency Fund
                      </button>
                    )}
                    {totalDebtBalance > 0 && !roadmapMilestones.some(m => m.name.toLowerCase().includes('debt')) && (
                      <button
                        onClick={() => {
                          setRoadmapMilestones([...roadmapMilestones, {
                            id: Date.now(),
                            name: 'Become Debt Free',
                            category: 'debt',
                            icon: '💳',
                            targetAmount: totalDebtBalance.toString(),
                            currentAmount: 0,
                            targetDate: '',
                            notes: 'Freedom from debt payments',
                            completed: false,
                            createdAt: new Date().toISOString()
                          }])
                        }}
                        style={{ padding: '8px 16px', background: theme.cardBg, color: theme.text, border: '1px solid ' + theme.border, borderRadius: '20px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        + 💳 Pay Off ${totalDebtBalance.toLocaleString()} Debt
                      </button>
                    )}
                    {!roadmapMilestones.some(m => m.name.toLowerCase().includes('passive') || m.name.toLowerCase().includes('income')) && (
                      <button
                        onClick={() => {
                          setRoadmapMilestones([...roadmapMilestones, {
                            id: Date.now(),
                            name: '$500/mo Passive Income',
                            category: 'income',
                            icon: '📈',
                            targetAmount: '500',
                            currentAmount: passiveIncome + totalPassiveQuestIncome,
                            targetDate: '',
                            notes: 'Monthly passive income target',
                            completed: false,
                            createdAt: new Date().toISOString()
                          }])
                        }}
                        style={{ padding: '8px 16px', background: theme.cardBg, color: theme.text, border: '1px solid ' + theme.border, borderRadius: '20px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        + 📈 $500/mo Passive Income
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Current Progress Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Current Baby Step</div>
                <div style={{ color: theme.accent, fontSize: '32px', fontWeight: 700 }}>{currentBabyStep.step}</div>
                <div style={{ color: theme.text, fontSize: '13px' }}>{currentBabyStep.title}</div>
              </div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Passive Income</div>
                <div style={{ color: theme.success, fontSize: '28px', fontWeight: 700 }}>${(passiveIncome + totalPassiveQuestIncome).toFixed(0)}</div>
                <div style={{ color: theme.textMuted, fontSize: '11px' }}>/month</div>
              </div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Quest Progress</div>
                <div style={{ color: theme.purple, fontSize: '28px', fontWeight: 700 }}>{passiveQuests.filter(q => q.status === 'completed').length}/{passiveQuests.length}</div>
                <div style={{ color: theme.textMuted, fontSize: '11px' }}>completed</div>
              </div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Freedom Progress</div>
                <div style={{ color: theme.warning, fontSize: '28px', fontWeight: 700 }}>{monthlyExpenses > 0 ? (((passiveIncome + totalPassiveQuestIncome) / monthlyExpenses) * 100).toFixed(0) : 0}%</div>
                <div style={{ color: theme.textMuted, fontSize: '11px' }}>passive coverage</div>
              </div>
            </div>

            {/* Money Automation System */}
            {incomeStreams.length > 0 && (
              <div style={{ padding: '24px', background: 'linear-gradient(135deg, #3b82f615, #8b5cf615)', borderRadius: '16px', border: '2px solid ' + theme.accent }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>🤖 Set & Forget Automation</h2>
                  <button onClick={() => setShowAutomation(!showAutomation)} style={{ padding: '8px 16px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    {showAutomation ? 'Hide Details' : 'Setup Guide'}
                  </button>
                </div>
                
                {(() => {
                  const auto = calculateAutomation()
                  return (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: showAutomation ? '20px' : 0 }}>
                        <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}>
                          <div style={{ fontSize: '32px', marginBottom: '8px' }}>💳</div>
                          <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '4px' }}>Bills Account</div>
                          <div style={{ color: theme.warning, fontSize: '24px', fontWeight: 'bold' }}>${auto.bills.total.toFixed(0)}</div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>per {auto.payFrequency}</div>
                        </div>
                        <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}>
                          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎯</div>
                          <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '4px' }}>Savings Account</div>
                          <div style={{ color: theme.purple, fontSize: '24px', fontWeight: 'bold' }}>${auto.savings.total.toFixed(0)}</div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>per {auto.payFrequency}</div>
                        </div>
                        <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}>
                          <div style={{ fontSize: '32px', marginBottom: '8px' }}>💵</div>
                          <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '4px' }}>Spending Money</div>
                          <div style={{ color: theme.success, fontSize: '24px', fontWeight: 'bold' }}>${auto.spending.toFixed(0)}</div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>per {auto.payFrequency}</div>
                        </div>
                      </div>
                      
                      {showAutomation && (
                        <div style={{ background: theme.cardBg, borderRadius: '12px', padding: '20px' }}>
                          <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '16px' }}>📋 Setup Instructions</h3>
                          
                          <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ color: theme.warning, margin: '0 0 8px 0', fontSize: '14px' }}>Step 1: Create Sub-Accounts</h4>
                            <p style={{ color: theme.textMuted, fontSize: '13px', margin: '0 0 8px 0' }}>
                              Open these accounts at your bank (most AU banks support this):
                            </p>
                            <ul style={{ color: theme.text, fontSize: '13px', margin: 0, paddingLeft: '20px' }}>
                              <li><strong>Bills Account</strong> - For all fixed expenses</li>
                              <li><strong>Savings Account</strong> - For goals (consider Up, ING, or Ubank for better rates)</li>
                              <li><strong>Spending Account</strong> - Your everyday account</li>
                            </ul>
                          </div>
                          
                          <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ color: theme.purple, margin: '0 0 8px 0', fontSize: '14px' }}>Step 2: Set Up Auto-Transfers</h4>
                            <p style={{ color: theme.textMuted, fontSize: '13px', margin: '0 0 8px 0' }}>
                              When your ${auto.payAmount} {auto.payFrequency} pay hits, automatically split it:
                            </p>
                            <div style={{ background: darkMode ? '#1e293b' : '#f1f5f9', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ color: theme.textMuted }}>→ Bills Account:</span>
                                <span style={{ color: theme.warning, fontWeight: 600 }}>${auto.bills.total.toFixed(0)}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ color: theme.textMuted }}>→ Savings Account:</span>
                                <span style={{ color: theme.purple, fontWeight: 600 }}>${auto.savings.total.toFixed(0)}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid ' + theme.border, paddingTop: '4px', marginTop: '4px' }}>
                                <span style={{ color: theme.textMuted }}>= Spending (stays in main):</span>
                                <span style={{ color: theme.success, fontWeight: 600 }}>${auto.spending.toFixed(0)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 style={{ color: theme.success, margin: '0 0 8px 0', fontSize: '14px' }}>Step 3: Set Up Direct Debits</h4>
                            <p style={{ color: theme.textMuted, fontSize: '13px', margin: '0 0 8px 0' }}>
                              From your Bills Account, set these to auto-pay:
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
                              {auto.bills.breakdown.map((item, i) => (
                                <span key={i} style={{ padding: '6px 12px', background: darkMode ? '#1e293b' : '#f1f5f9', borderRadius: '6px', fontSize: '12px', color: theme.text }}>
                                  {item.name}: ${item.amount.toFixed(0)}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div style={{ marginTop: '16px', padding: '12px', background: theme.success + '20', borderRadius: '8px' }}>
                            <p style={{ color: theme.success, margin: 0, fontSize: '13px', fontWeight: 500 }}>
                              💡 Once set up, your bills and savings happen automatically every payday. No more manual transfers!
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            )}

            {/* FIRE Progress */}
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, ' + theme.purple + '15, ' + theme.success + '15)', borderRadius: '16px', border: '2px solid ' + theme.purple }}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>🔥 Escape the Rat Race</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ ...cardStyle, padding: '20px' }}>
                  <h3 style={{ margin: '0 0 12px 0', color: theme.purple, fontSize: '18px' }}>🌴 Freedom Target</h3>
                  <div style={{ color: theme.text, fontSize: '14px', lineHeight: 2 }}>
                    <div>Monthly need: <strong>${fiPath.monthlyNeed.toFixed(0)}</strong></div>
                    <div>Passive income: <strong style={{ color: theme.success }}>${(passiveIncome + totalPassiveQuestIncome).toFixed(0)}</strong></div>
                    <div>Gap to fill: <strong style={{ color: theme.danger }}>${Math.max(0, fiPath.passiveGap - totalPassiveQuestIncome).toFixed(0)}</strong></div>
                    <div>Coverage: <strong style={{ color: theme.purple }}>{((passiveIncome + totalPassiveQuestIncome) / fiPath.monthlyNeed * 100).toFixed(1)}%</strong></div>
                  </div>
                  <div style={{ marginTop: '16px', height: '12px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: Math.min(((passiveIncome + totalPassiveQuestIncome) / fiPath.monthlyNeed * 100), 100) + '%', height: '100%', background: 'linear-gradient(90deg, ' + theme.purple + ', ' + theme.success + ')', borderRadius: '6px' }} />
                  </div>
                </div>
                <div style={{ ...cardStyle, padding: '20px' }}>
                  <h3 style={{ margin: '0 0 12px 0', color: theme.success, fontSize: '18px' }}>🔥 FIRE Number</h3>
                  <div style={{ color: theme.text, fontSize: '14px', lineHeight: 2 }}>
                    <div>Target: <strong>${fiPath.fireNumber.toLocaleString()}</strong></div>
                    <div>Investments + Super: <strong style={{ color: theme.success }}>${fiPath.currentInvestments.toLocaleString()}</strong></div>
                    <div>Years to FI: <strong style={{ color: theme.purple }}>{fiPath.yearsToFI >= 999 ? '∞' : fiPath.yearsToFI}</strong></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Australian Baby Steps - Enhanced Interactive */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '22px' }}>👶 Australian Baby Steps</h2>
              <p style={{ color: theme.textMuted, fontSize: '13px', margin: '0 0 20px 0' }}>Click any step for detailed guidance from Aureus!</p>
              
              {/* Baby Step Detail Modal */}
              {selectedBabyStep !== null && (() => {
                const step = australianBabySteps.find(s => s.step === selectedBabyStep)
                if (!step) return null
                const isCurrent = step.step === currentBabyStep.step
                const done = step.step < currentBabyStep.step
                return (
                  <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelectedBabyStep(null)}>
                    <div style={{ background: theme.cardBg, borderRadius: '20px', padding: '28px', maxWidth: '650px', width: '100%', maxHeight: '85vh', overflowY: 'auto' as const }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: done ? theme.success : isCurrent ? theme.warning : theme.purple, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>{done ? '✓' : step.icon}</div>
                          <div>
                            <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Step {step.step} of 7</div>
                            <h3 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>{step.title}</h3>
                          </div>
                        </div>
                        <button onClick={() => setSelectedBabyStep(null)} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '24px', cursor: 'pointer' }}>×</button>
                      </div>
                      
                      {done && (
                        <div style={{ background: theme.success + '20', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'center' as const }}>
                          <span style={{ fontSize: '24px' }}>🎉</span>
                          <span style={{ color: theme.success, fontWeight: 700, marginLeft: '8px' }}>You've completed this step!</span>
                        </div>
                      )}
                      
                      {isCurrent && currentBabyStep.target && currentBabyStep.target > 0 && (
                        <div style={{ background: theme.warning + '20', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: theme.warning, fontWeight: 600 }}>Your Progress</span>
                            <span style={{ color: theme.text, fontWeight: 700 }}>${currentBabyStep.current?.toFixed(0) || 0} / ${currentBabyStep.target?.toFixed(0)}</span>
                          </div>
                          <div style={{ height: '10px', background: theme.border, borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ width: Math.min(currentBabyStep.progress || 0, 100) + '%', height: '100%', background: theme.warning }} />
                          </div>
                          <div style={{ textAlign: 'right' as const, marginTop: '4px', fontSize: '12px', color: theme.textMuted }}>{(currentBabyStep.progress || 0).toFixed(1)}% complete</div>
                        </div>
                      )}
                      
                      <div style={{ background: darkMode ? '#1e293b' : '#f0fdf4', borderRadius: '12px', padding: '16px', marginBottom: '20px', borderLeft: '4px solid ' + theme.success }}>
                        <p style={{ margin: 0, color: theme.text, fontSize: '14px', lineHeight: 1.7 }}>💡 <strong>Aureus says:</strong> {step.aureusAdvice}</p>
                      </div>
                      
                      <h4 style={{ color: theme.text, margin: '0 0 12px 0' }}>✅ Tips for this step:</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: theme.text, lineHeight: 2 }}>
                        {step.tips?.map((tip: string, idx: number) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{tip}</li>
                        ))}
                      </ul>
                      
                      {/* Home Ownership Calculator for Step 5 */}
                      {step.step === 5 && (
                        <div style={{ marginTop: '24px', padding: '20px', background: darkMode ? '#1e293b' : '#fef3c7', borderRadius: '12px', border: '2px solid ' + theme.warning }}>
                          <h4 style={{ color: theme.warning, margin: '0 0 16px 0' }}>🏠 Australian Home Buying Calculator</h4>
                          
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontWeight: 600, color: theme.text, marginBottom: '8px' }}>Example: $600,000 Home</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '13px' }}>
                              <div style={{ padding: '12px', background: theme.cardBg, borderRadius: '8px' }}>
                                <div style={{ color: theme.textMuted, marginBottom: '4px' }}>5% Deposit</div>
                                <div style={{ color: theme.text, fontWeight: 700 }}>$30,000</div>
                                <div style={{ color: theme.danger, fontSize: '11px' }}>+ ~$15k LMI</div>
                              </div>
                              <div style={{ padding: '12px', background: theme.cardBg, borderRadius: '8px' }}>
                                <div style={{ color: theme.textMuted, marginBottom: '4px' }}>10% Deposit</div>
                                <div style={{ color: theme.text, fontWeight: 700 }}>$60,000</div>
                                <div style={{ color: theme.warning, fontSize: '11px' }}>+ ~$8k LMI</div>
                              </div>
                              <div style={{ padding: '12px', background: theme.cardBg, borderRadius: '8px' }}>
                                <div style={{ color: theme.textMuted, marginBottom: '4px' }}>20% Deposit</div>
                                <div style={{ color: theme.text, fontWeight: 700 }}>$120,000</div>
                                <div style={{ color: theme.success, fontSize: '11px' }}>No LMI! ✓</div>
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontWeight: 600, color: theme.text, marginBottom: '8px' }}>🎁 First Home Buyer Grants</div>
                            <div style={{ fontSize: '13px', color: theme.text, lineHeight: 1.8 }}>
                              {Object.entries(australianHomeData.firstHomeBuyerGrants).map(([state, grant]) => (
                                <div key={state} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ fontWeight: 500 }}>{state.toUpperCase()}:</span>
                                  <span>{grant}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <div style={{ fontWeight: 600, color: theme.text, marginBottom: '8px' }}>🏛️ Government Schemes</div>
                            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                              {australianHomeData.schemes.map((scheme, idx) => (
                                <div key={idx} style={{ padding: '10px', background: theme.cardBg, borderRadius: '8px', fontSize: '13px' }}>
                                  <span style={{ fontWeight: 600, color: theme.accent }}>{scheme.name}:</span>
                                  <span style={{ color: theme.textMuted, marginLeft: '8px' }}>{scheme.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <button onClick={() => {
                        setSelectedBabyStep(null)
                        // Send message to Aureus about this step
                        setChatInput(`Tell me more about ${step.title}`)
                      }} style={{ width: '100%', marginTop: '20px', padding: '14px', background: theme.accent, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: 600 }}>
                        💬 Ask Aureus About This Step
                      </button>
                    </div>
                  </div>
                )
              })()}
              
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                {australianBabySteps.map((item) => {
                  const isCurrent = item.step === currentBabyStep.step
                  const done = item.step < currentBabyStep.step
                  const alreadyInRoadmap = roadmapMilestones.some(m => m.name.toLowerCase().includes(item.title.toLowerCase().split(' ').slice(0, 2).join(' ')))
                  return (
                    <div key={item.step} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', background: done ? (darkMode ? '#1e3a32' : '#f0fdf4') : isCurrent ? (darkMode ? '#2e2a1e' : '#fefce8') : (darkMode ? '#334155' : '#f8fafc'), borderRadius: '12px', border: done ? '2px solid ' + theme.success : isCurrent ? '2px solid ' + theme.warning : '1px solid ' + theme.border, cursor: 'pointer', transition: 'transform 0.2s' }}>
                      <div onClick={() => setSelectedBabyStep(item.step)} style={{ width: '44px', height: '44px', borderRadius: '50%', background: done ? theme.success : isCurrent ? theme.warning : theme.purple, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>{done ? '✓' : item.icon}</div>
                      <div onClick={() => setSelectedBabyStep(item.step)} style={{ flex: 1 }}>
                        <div style={{ color: theme.text, fontWeight: 600, fontSize: '16px' }}>{item.title}</div>
                        <div style={{ color: theme.textMuted, fontSize: '13px' }}>{item.desc}</div>
                        {isCurrent && currentBabyStep.target && currentBabyStep.target > 0 && (
                          <div style={{ marginTop: '8px' }}>
                            <div style={{ height: '6px', background: theme.border, borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: Math.min(currentBabyStep.progress || 0, 100) + '%', height: '100%', background: theme.warning }} />
                            </div>
                            <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px' }}>${currentBabyStep.current?.toFixed(0) || 0} / ${currentBabyStep.target?.toFixed(0) || 0}</div>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: '4px' }}>
                        <div style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: done ? theme.success : isCurrent ? theme.warning : theme.border, color: done || isCurrent ? 'white' : theme.textMuted }}>{done ? '✓ Complete' : isCurrent ? '→ Current' : 'Pending'}</div>
                        {!done && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              addToRoadmap(
                                `Baby Step ${item.step}: ${item.title}`,
                                'savings',
                                item.target?.toString() || '0',
                                item.icon,
                                item.desc,
                                isCurrent ? (currentBabyStep.current || 0) : 0
                              )
                            }}
                            disabled={alreadyInRoadmap}
                            style={{ 
                              padding: '4px 10px', 
                              background: alreadyInRoadmap ? theme.border : theme.purple + '20', 
                              color: alreadyInRoadmap ? theme.textMuted : theme.purple, 
                              border: 'none', 
                              borderRadius: '12px', 
                              cursor: alreadyInRoadmap ? 'default' : 'pointer', 
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {alreadyInRoadmap ? '✓ In Roadmap' : '+ Add to Roadmap'}
                          </button>
                        )}
                        <div onClick={() => setSelectedBabyStep(item.step)} style={{ color: theme.accent, fontSize: '12px', cursor: 'pointer' }}>Click for details →</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* AUSTRALIAN HOME BUYING ROADMAP */}
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🏠</div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>Australian Home Buying Roadmap</h2>
                  <p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '13px' }}>Click each phase to expand • Aureus can help with each step</p>
                </div>
                <input type="file" ref={homeDocInputRef} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setHomeDocuments(prev => [...prev, { name: file.name, type: file.type, uploadedAt: new Date().toISOString() }])
                  }
                }} style={{ display: 'none' }} />
                <button onClick={() => homeDocInputRef.current?.click()} style={{ padding: '8px 16px', background: theme.cardBg, color: theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                  📎 Upload Document
                </button>
              </div>
              
              {/* Uploaded Documents */}
              {homeDocuments.length > 0 && (
                <div style={{ marginBottom: '16px', padding: '12px', background: theme.cardBg, borderRadius: '8px' }}>
                  <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '8px' }}>YOUR DOCUMENTS ({homeDocuments.length})</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                    {homeDocuments.map((doc, idx) => (
                      <div key={idx} style={{ padding: '6px 12px', background: '#334155', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px' }}>{doc.type.includes('pdf') ? '📄' : doc.type.includes('image') ? '🖼️' : '📝'}</span>
                        <span style={{ color: theme.text, fontSize: '12px' }}>{doc.name}</span>
                        <button onClick={() => setHomeDocuments(prev => prev.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '12px' }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Phase 1: Get Financially Ready */}
              <div style={{ marginBottom: '12px', borderRadius: '12px', overflow: 'hidden', border: '1px solid ' + theme.border }}>
                <button onClick={() => setHomeGuideExpanded(homeGuideExpanded === 'phase1' ? null : 'phase1')} style={{ width: '100%', padding: '16px 20px', background: homeGuideExpanded === 'phase1' ? 'linear-gradient(135deg, #f59e0b20, transparent)' : theme.cardBg, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>💰</span>
                    <div style={{ textAlign: 'left' as const }}>
                      <div style={{ color: theme.warning, fontWeight: 700 }}>Phase 1: Get Financially Ready</div>
                      <div style={{ color: theme.textMuted, fontSize: '12px' }}>Credit score, deposit, FHSS, reduce debts</div>
                    </div>
                  </div>
                  <span style={{ color: theme.textMuted, fontSize: '20px' }}>{homeGuideExpanded === 'phase1' ? '▼' : '▶'}</span>
                </button>
                {homeGuideExpanded === 'phase1' && (
                  <div style={{ padding: '20px', background: darkMode ? '#1a1a2e' : '#f8fafc' }}>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {[
                        { title: 'Check your credit score', desc: 'Get free report from Equifax, Experian, or Illion. 700+ is good.', action: 'Help me understand my credit score' },
                        { title: 'Save your deposit', desc: '20% avoids LMI. On $600K home = $120K deposit needed.', action: 'Create a deposit savings goal' },
                        { title: 'FHSS Scheme', desc: 'Salary sacrifice up to $15K/yr into super, withdraw for first home.', action: 'Explain how FHSS works' },
                        { title: 'Reduce existing debts', desc: 'Pay off credit cards, BNPL, personal loans. Close unused cards.', action: 'Help me prioritize my debts' },
                        { title: 'Build genuine savings', desc: '3+ months of consistent saving shows banks financial discipline.', action: 'Set up automatic savings' },
                      ].map((item, idx) => (
                        <div key={idx} style={{ padding: '14px 16px', background: theme.cardBg, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>{item.title}</div>
                            <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>{item.desc}</div>
                          </div>
                          <button onClick={() => { sendQuickMessage(item.action) }} style={{ padding: '6px 12px', background: theme.warning + '20', color: theme.warning, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' as const }}>🤖 Ask Aureus</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Phase 2: Understand the Costs */}
              <div style={{ marginBottom: '12px', borderRadius: '12px', overflow: 'hidden', border: '1px solid ' + theme.border }}>
                <button onClick={() => setHomeGuideExpanded(homeGuideExpanded === 'phase2' ? null : 'phase2')} style={{ width: '100%', padding: '16px 20px', background: homeGuideExpanded === 'phase2' ? 'linear-gradient(135deg, #8b5cf620, transparent)' : theme.cardBg, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🧾</span>
                    <div style={{ textAlign: 'left' as const }}>
                      <div style={{ color: theme.purple, fontWeight: 700 }}>Phase 2: Understand the Costs</div>
                      <div style={{ color: theme.textMuted, fontSize: '12px' }}>Stamp duty, LMI, legal fees, inspections</div>
                    </div>
                  </div>
                  <span style={{ color: theme.textMuted, fontSize: '20px' }}>{homeGuideExpanded === 'phase2' ? '▼' : '▶'}</span>
                </button>
                {homeGuideExpanded === 'phase2' && (
                  <div style={{ padding: '20px', background: darkMode ? '#1a1a2e' : '#f8fafc' }}>
                    {/* COMPREHENSIVE COST CALCULATOR */}
                    <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', marginBottom: '16px' }}>
                      <div style={{ color: theme.text, fontWeight: 700, marginBottom: '12px' }}>🧮 Complete Cost Calculator</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>Property Price</label>
                          <input type="number" placeholder="600000" value={homeBuyingPrice} onChange={e => setHomeBuyingPrice(e.target.value)} style={{ ...inputStyle, width: '100%', padding: '10px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>State</label>
                          <select value={homeCalcState} onChange={e => setHomeCalcState(e.target.value)} style={{ ...inputStyle, width: '100%', padding: '10px' }}>
                            <option value="QLD">Queensland</option>
                            <option value="NSW">New South Wales</option>
                            <option value="VIC">Victoria</option>
                            <option value="WA">Western Australia</option>
                            <option value="SA">South Australia</option>
                            <option value="TAS">Tasmania</option>
                            <option value="NT">Northern Territory</option>
                            <option value="ACT">ACT</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input type="checkbox" checked={homeCalcFirstHome} onChange={e => setHomeCalcFirstHome(e.target.checked)} />
                          <label style={{ color: theme.text, fontSize: '12px' }}>First home buyer</label>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input type="checkbox" checked={homeCalcNewBuild} onChange={e => setHomeCalcNewBuild(e.target.checked)} />
                          <label style={{ color: theme.text, fontSize: '12px' }}>New build</label>
                        </div>
                      </div>
                      
                      {homeBuyingPrice && parseFloat(homeBuyingPrice) > 0 && (() => {
                        const price = parseFloat(homeBuyingPrice)
                        
                        // Stamp duty calculation by state (simplified)
                        let stampDuty = 0
                        if (homeCalcFirstHome) {
                          // First home buyer exemptions
                          if (homeCalcState === 'QLD' && price <= 500000) stampDuty = 0
                          else if (homeCalcState === 'QLD' && price <= 550000) stampDuty = (price - 500000) * 0.035
                          else if (homeCalcState === 'NSW' && price <= 800000) stampDuty = 0
                          else if (homeCalcState === 'VIC' && price <= 600000) stampDuty = 0
                          else stampDuty = price * 0.04 // Default rate
                        } else {
                          stampDuty = price * 0.045 // Non-first-home rate
                        }
                        
                        // FHOG (only for new builds)
                        let fhog = 0
                        if (homeCalcFirstHome && homeCalcNewBuild) {
                          if (homeCalcState === 'QLD' && price <= 750000) fhog = 30000
                          else if (homeCalcState === 'NSW' && price <= 600000) fhog = 10000
                          else if (homeCalcState === 'VIC' && price <= 750000) fhog = 10000
                          else fhog = 10000 // Other states
                        }
                        
                        // All costs breakdown
                        const deposit5 = price * 0.05
                        const deposit10 = price * 0.10
                        const deposit20 = price * 0.20
                        const lmi5 = price * 0.028
                        const lmi10 = price * 0.015
                        const conveyancing = 2500
                        const buildingInspection = 500
                        const pestInspection = 350
                        const loanApplication = 600
                        const titleSearch = 200
                        const settlementFee = 400
                        const councilRatesAdjust = 500
                        const insurance = 1500
                        const movingCosts = 1500
                        const connectionFees = 500 // Power, gas, internet
                        
                        const fixedCosts = conveyancing + buildingInspection + pestInspection + loanApplication + titleSearch + settlementFee + councilRatesAdjust + insurance + movingCosts + connectionFees
                        
                        const total5 = deposit5 + lmi5 + stampDuty + fixedCosts - fhog
                        const total10 = deposit10 + lmi10 + stampDuty + fixedCosts - fhog
                        const total20 = deposit20 + stampDuty + fixedCosts - fhog
                        
                        return (
                          <>
                            {/* Deposit Options */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                              <div style={{ padding: '16px', background: '#334155', borderRadius: '12px', textAlign: 'center' as const }}>
                                <div style={{ color: theme.danger, fontSize: '11px', fontWeight: 600 }}>5% DEPOSIT</div>
                                <div style={{ color: theme.text, fontSize: '24px', fontWeight: 700 }}>${deposit5.toLocaleString()}</div>
                                <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>+ ${lmi5.toLocaleString()} LMI</div>
                                <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '8px', borderTop: '1px solid #475569', paddingTop: '8px' }}>Total needed: <strong>${Math.max(0, total5).toLocaleString()}</strong></div>
                              </div>
                              <div style={{ padding: '16px', background: '#334155', borderRadius: '12px', textAlign: 'center' as const }}>
                                <div style={{ color: theme.warning, fontSize: '11px', fontWeight: 600 }}>10% DEPOSIT</div>
                                <div style={{ color: theme.text, fontSize: '24px', fontWeight: 700 }}>${deposit10.toLocaleString()}</div>
                                <div style={{ color: theme.warning, fontSize: '12px', marginTop: '4px' }}>+ ${lmi10.toLocaleString()} LMI</div>
                                <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '8px', borderTop: '1px solid #475569', paddingTop: '8px' }}>Total needed: <strong>${Math.max(0, total10).toLocaleString()}</strong></div>
                              </div>
                              <div style={{ padding: '16px', background: '#334155', borderRadius: '12px', textAlign: 'center' as const, border: '2px solid ' + theme.success }}>
                                <div style={{ color: theme.success, fontSize: '11px', fontWeight: 600 }}>20% DEPOSIT ✓</div>
                                <div style={{ color: theme.text, fontSize: '24px', fontWeight: 700 }}>${deposit20.toLocaleString()}</div>
                                <div style={{ color: theme.success, fontSize: '12px', marginTop: '4px' }}>No LMI!</div>
                                <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '8px', borderTop: '1px solid #475569', paddingTop: '8px' }}>Total needed: <strong>${Math.max(0, total20).toLocaleString()}</strong></div>
                              </div>
                            </div>
                            
                            {/* Full Cost Breakdown */}
                            <div style={{ padding: '16px', background: '#1e293b', borderRadius: '8px' }}>
                              <div style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 600, marginBottom: '12px' }}>FULL COST BREAKDOWN</div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.textMuted }}>Stamp Duty:</span><span style={{ color: stampDuty === 0 ? theme.success : theme.text }}>{stampDuty === 0 ? 'EXEMPT ✓' : '$' + stampDuty.toLocaleString()}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.textMuted }}>Conveyancing:</span><span style={{ color: theme.text }}>${conveyancing.toLocaleString()}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.textMuted }}>Building Inspection:</span><span style={{ color: theme.text }}>${buildingInspection.toLocaleString()}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.textMuted }}>Pest Inspection:</span><span style={{ color: theme.text }}>${pestInspection.toLocaleString()}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.textMuted }}>Loan Application:</span><span style={{ color: theme.text }}>${loanApplication.toLocaleString()}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.textMuted }}>Title Search:</span><span style={{ color: theme.text }}>${titleSearch.toLocaleString()}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.textMuted }}>Settlement Fee:</span><span style={{ color: theme.text }}>${settlementFee.toLocaleString()}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.textMuted }}>Council Rates Adj:</span><span style={{ color: theme.text }}>${councilRatesAdjust.toLocaleString()}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.textMuted }}>Home Insurance:</span><span style={{ color: theme.text }}>${insurance.toLocaleString()}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.textMuted }}>Moving Costs:</span><span style={{ color: theme.text }}>${movingCosts.toLocaleString()}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.textMuted }}>Utilities Connection:</span><span style={{ color: theme.text }}>${connectionFees.toLocaleString()}</span></div>
                                {fhog > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.success }}>FHOG Grant:</span><span style={{ color: theme.success }}>-${fhog.toLocaleString()} ✓</span></div>}
                              </div>
                              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: theme.text, fontWeight: 600 }}>Additional costs (excl. deposit):</span>
                                <span style={{ color: theme.warning, fontWeight: 700 }}>${(stampDuty + fixedCosts - fhog).toLocaleString()}</span>
                              </div>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Phase 3: Government Schemes */}
              <div style={{ marginBottom: '12px', borderRadius: '12px', overflow: 'hidden', border: '1px solid ' + theme.border }}>
                <button onClick={() => setHomeGuideExpanded(homeGuideExpanded === 'phase3' ? null : 'phase3')} style={{ width: '100%', padding: '16px 20px', background: homeGuideExpanded === 'phase3' ? 'linear-gradient(135deg, #3b82f620, transparent)' : theme.cardBg, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🏛️</span>
                    <div style={{ textAlign: 'left' as const }}>
                      <div style={{ color: theme.accent, fontWeight: 700 }}>Phase 3: Government Schemes</div>
                      <div style={{ color: theme.textMuted, fontSize: '12px' }}>FHOG, First Home Guarantee, Help to Buy</div>
                    </div>
                  </div>
                  <span style={{ color: theme.textMuted, fontSize: '20px' }}>{homeGuideExpanded === 'phase3' ? '▼' : '▶'}</span>
                </button>
                {homeGuideExpanded === 'phase3' && (
                  <div style={{ padding: '20px', background: darkMode ? '#1a1a2e' : '#f8fafc' }}>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {[
                        { title: 'First Home Owner Grant (FHOG)', desc: 'QLD: $30K new homes <$750K. NSW: $10K <$600K. VIC: $10K <$750K. New builds only.', action: 'Am I eligible for FHOG?' },
                        { title: 'First Home Guarantee (FHG)', desc: 'Buy with 5% deposit, no LMI. Income cap: $125K single, $200K couple. 35,000 places/yr.', action: 'Explain First Home Guarantee' },
                        { title: 'Regional First Home Buyer Guarantee', desc: '10,000 places/yr for regional areas. Same 5% deposit, no LMI benefits.', action: 'What counts as regional?' },
                        { title: 'Family Home Guarantee', desc: 'Single parents can buy with just 2% deposit, no LMI. 5,000 places/yr.', action: 'Tell me about Family Home Guarantee' },
                        { title: 'Help to Buy (coming)', desc: 'Gov co-owns up to 40% new/30% existing. Only need 2% deposit. 10,000 places/yr.', action: 'When does Help to Buy start?' },
                      ].map((item, idx) => (
                        <div key={idx} style={{ padding: '14px 16px', background: theme.cardBg, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>{item.title}</div>
                            <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>{item.desc}</div>
                          </div>
                          <button onClick={() => { sendQuickMessage(item.action) }} style={{ padding: '6px 12px', background: theme.accent + '20', color: theme.accent, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' as const }}>🤖 Ask Aureus</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Phase 4: Get Pre-Approved */}
              <div style={{ marginBottom: '12px', borderRadius: '12px', overflow: 'hidden', border: '1px solid ' + theme.border }}>
                <button onClick={() => setHomeGuideExpanded(homeGuideExpanded === 'phase4' ? null : 'phase4')} style={{ width: '100%', padding: '16px 20px', background: homeGuideExpanded === 'phase4' ? 'linear-gradient(135deg, #10b98120, transparent)' : theme.cardBg, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🏦</span>
                    <div style={{ textAlign: 'left' as const }}>
                      <div style={{ color: theme.success, fontWeight: 700 }}>Phase 4: Get Pre-Approved</div>
                      <div style={{ color: theme.textMuted, fontSize: '12px' }}>Documents, broker, borrowing power</div>
                    </div>
                  </div>
                  <span style={{ color: theme.textMuted, fontSize: '20px' }}>{homeGuideExpanded === 'phase4' ? '▼' : '▶'}</span>
                </button>
                {homeGuideExpanded === 'phase4' && (
                  <div style={{ padding: '20px', background: darkMode ? '#1a1a2e' : '#f8fafc' }}>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {[
                        { title: 'Gather your documents', desc: '2 payslips, 3mo bank statements, tax returns (self-emp), ID, all debts.', action: 'What documents do I need for a home loan?' },
                        { title: 'Use a mortgage broker', desc: 'Free for you. They compare 30+ lenders and handle paperwork.', action: 'Should I use a broker or go direct?' },
                        { title: 'Get pre-approval', desc: 'Shows sellers you are serious. Valid 3-6 months. Not locked to that lender.', action: 'How do I get pre-approval?' },
                        { title: 'Understand borrowing power', desc: 'Rule: 5-6x gross income. $100K = ~$500-600K. But budget for YOUR comfort.', action: 'Calculate my borrowing power' },
                      ].map((item, idx) => (
                        <div key={idx} style={{ padding: '14px 16px', background: theme.cardBg, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>{item.title}</div>
                            <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>{item.desc}</div>
                          </div>
                          <button onClick={() => { sendQuickMessage(item.action) }} style={{ padding: '6px 12px', background: theme.success + '20', color: theme.success, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' as const }}>🤖 Ask Aureus</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Phase 5: Buy Smart */}
              <div style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden', border: '1px solid ' + theme.border }}>
                <button onClick={() => setHomeGuideExpanded(homeGuideExpanded === 'phase5' ? null : 'phase5')} style={{ width: '100%', padding: '16px 20px', background: homeGuideExpanded === 'phase5' ? 'linear-gradient(135deg, #ef444420, transparent)' : theme.cardBg, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🎯</span>
                    <div style={{ textAlign: 'left' as const }}>
                      <div style={{ color: theme.danger, fontWeight: 700 }}>Phase 5: Buy Smart</div>
                      <div style={{ color: theme.textMuted, fontSize: '12px' }}>Research, inspect, negotiate, settle</div>
                    </div>
                  </div>
                  <span style={{ color: theme.textMuted, fontSize: '20px' }}>{homeGuideExpanded === 'phase5' ? '▼' : '▶'}</span>
                </button>
                {homeGuideExpanded === 'phase5' && (
                  <div style={{ padding: '20px', background: darkMode ? '#1a1a2e' : '#f8fafc' }}>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {[
                        { title: 'Research areas', desc: 'Flood maps, development plans, schools, transport, crime stats.', action: 'What should I research about an area?' },
                        { title: 'Attend inspections', desc: 'Check water pressure, power points, storage, light, noise at different times.', action: 'What to look for at open homes?' },
                        { title: 'Get building & pest inspection', desc: 'BEFORE offer/auction. $400-800 can save $50K+ in problems.', action: 'Is building inspection worth it?' },
                        { title: 'Negotiate or bid smart', desc: 'Private: offer below asking. Auction: set max and STICK TO IT.', action: 'Tips for negotiating house price' },
                        { title: 'Settlement day', desc: '30-90 days after contract. Final inspection. Then you get the keys!', action: 'What happens at settlement?' },
                      ].map((item, idx) => (
                        <div key={idx} style={{ padding: '14px 16px', background: theme.cardBg, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>{item.title}</div>
                            <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>{item.desc}</div>
                          </div>
                          <button onClick={() => { sendQuickMessage(item.action) }} style={{ padding: '6px 12px', background: theme.danger + '20', color: theme.danger, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' as const }}>🤖 Ask Aureus</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Ready to Start CTA */}
              <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', borderRadius: '12px', textAlign: 'center' as const }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
                <h4 style={{ color: theme.text, margin: '0 0 8px 0' }}>Ready to start?</h4>
                <p style={{ color: theme.textMuted, fontSize: '13px', margin: '0 0 16px 0' }}>Create a home deposit goal and add it to your calendar</p>
                <button 
                  onClick={() => {
                    const targetDeposit = homeBuyingPrice ? parseFloat(homeBuyingPrice) * 0.2 : 120000
                    setNewGoal({ 
                      name: 'Home Deposit', 
                      target: targetDeposit.toString(), 
                      saved: '0', 
                      deadline: '', 
                      savingsFrequency: 'monthly', 
                      startDate: new Date().toISOString().split('T')[0], 
                      paymentAmount: '' 
                    })
                    setActiveTab('dashboard')
                  }}
                  style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
                >
                  🏠 Create Home Deposit Goal
                </button>
              </div>
            </div>

            {/* RAT RACE ESCAPE TRACKER - Connected to Automated Revenue */}
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '12px', letterSpacing: '2px', marginBottom: '4px' }}>RAT RACE ESCAPE TRACKER</div>
                  <div style={{ color: theme.textMuted, fontSize: '13px' }}>Automated revenue ÷ Operating costs = Freedom %</div>
                </div>
                <div style={{ textAlign: 'right' as const }}>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: monthlyExpenses > 0 ? (((passiveIncome + totalPassiveQuestIncome) / monthlyExpenses) >= 1 ? theme.success : '#f59e0b') : theme.textMuted }}>
                    {monthlyExpenses > 0 ? (((passiveIncome + totalPassiveQuestIncome) / monthlyExpenses) * 100).toFixed(1) : '0.0'}%
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{((passiveIncome + totalPassiveQuestIncome) / Math.max(monthlyExpenses, 1)) >= 1 ? '🎉' : '🐀'}</span>
                    <span style={{ color: ((passiveIncome + totalPassiveQuestIncome) / Math.max(monthlyExpenses, 1)) >= 1 ? theme.success : theme.textMuted, fontSize: '14px' }}>
                      {((passiveIncome + totalPassiveQuestIncome) / Math.max(monthlyExpenses, 1)) >= 1 ? 'FINANCIALLY FREE!' : 'Building freedom...'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ height: '12px', background: '#334155', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: Math.min(((passiveIncome + totalPassiveQuestIncome) / Math.max(monthlyExpenses, 1)) * 100, 100) + '%', 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #8b5cf6, #10b981)',
                    borderRadius: '6px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  {[0, 25, 50, 75, 100].map(pct => (
                    <div key={pct} style={{ color: ((passiveIncome + totalPassiveQuestIncome) / Math.max(monthlyExpenses, 1)) * 100 >= pct ? theme.text : '#64748b', fontSize: '11px' }}>{pct}%</div>
                  ))}
                </div>
              </div>
              
              {/* Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ padding: '12px', background: '#334155', borderRadius: '8px', textAlign: 'center' as const }}>
                  <div style={{ color: theme.success, fontSize: '20px', fontWeight: 700 }}>${(passiveIncome + totalPassiveQuestIncome).toFixed(0)}</div>
                  <div style={{ color: '#64748b', fontSize: '11px' }}>Automated Revenue/mo</div>
                </div>
                <div style={{ padding: '12px', background: '#334155', borderRadius: '8px', textAlign: 'center' as const }}>
                  <div style={{ color: theme.danger, fontSize: '20px', fontWeight: 700 }}>${monthlyExpenses.toFixed(0)}</div>
                  <div style={{ color: '#64748b', fontSize: '11px' }}>Operating Costs/mo</div>
                </div>
                <div style={{ padding: '12px', background: '#334155', borderRadius: '8px', textAlign: 'center' as const }}>
                  <div style={{ color: theme.warning, fontSize: '20px', fontWeight: 700 }}>${Math.max(0, monthlyExpenses - passiveIncome - totalPassiveQuestIncome).toFixed(0)}</div>
                  <div style={{ color: '#64748b', fontSize: '11px' }}>Gap to Freedom</div>
                </div>
              </div>
              
              <div style={{ marginTop: '16px', padding: '12px', background: theme.purple + '20', borderRadius: '8px', borderLeft: '4px solid ' + theme.purple }}>
                <p style={{ color: theme.text, fontSize: '13px', margin: 0 }}>
                  💡 <strong>Build automated revenue below</strong> — each strategy you complete brings you closer to escaping the rat race.
                </p>
              </div>
            </div>

            {/* Automated Revenue Strategies - Professional Design */}
            <div style={{ padding: '24px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '16px', border: '1px solid ' + theme.border }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '24px' }}>💰</span>
                    <h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>Automated Revenue Strategies</h2>
                  </div>
                  <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>10 strategies to build $5K/month in automated revenue</p>
                </div>
                <div style={{ padding: '8px 16px', background: theme.warning + '20', borderRadius: '8px', border: '1px solid ' + theme.warning }}>
                  <span style={{ color: theme.warning, fontWeight: 700, fontSize: '18px' }}>{passiveQuests.filter(q => getQuestUnlockStatus(q.id).isUnlocked || q.status === 'in_progress' || q.status === 'completed').length}/{passiveQuests.length}</span>
                  <div style={{ color: theme.warning, fontSize: '11px' }}>UNLOCKED</div>
                </div>
              </div>
              
              {/* All Quests in Professional 2-column Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {passiveQuests.map(quest => {
                  // Use dynamic unlock status based on actual user data
                  const unlockStatus = getQuestUnlockStatus(quest.id)
                  const isLocked = !unlockStatus.isUnlocked && quest.status !== 'in_progress' && quest.status !== 'completed'
                  const isExpanded = activeQuestId === quest.id
                  const difficultyStars = quest.difficulty === 'Easy' ? 1 : quest.difficulty === 'Medium' ? 2 : quest.difficulty === 'Hard' ? 3 : 4
                  
                  return (
                    <div key={quest.id} style={{ 
                      padding: '20px', 
                      background: darkMode ? '#1e293b' : '#f8fafc', 
                      borderRadius: '12px', 
                      border: '1px solid ' + theme.border,
                      opacity: isLocked ? 0.7 : 1
                    }}>
                      {/* Header Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{ width: '44px', height: '44px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                            {isLocked ? '🔒' : quest.icon}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: theme.text, fontSize: '15px' }}>{quest.name}</div>
                            <div style={{ color: theme.textMuted, fontSize: '13px' }}>{quest.description}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: '4px' }}>
                          {isLocked ? (
                            <span style={{ padding: '4px 10px', background: '#f59e0b30', color: '#f59e0b', borderRadius: '4px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              🔒 LOCKED
                            </span>
                          ) : quest.status === 'completed' ? (
                            <span style={{ padding: '4px 10px', background: theme.success + '30', color: theme.success, borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                              ✓ COMPLETE
                            </span>
                          ) : quest.status === 'in_progress' ? (
                            <span style={{ padding: '4px 10px', background: theme.accent + '30', color: theme.accent, borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                              IN PROGRESS
                            </span>
                          ) : null}
                          {/* Star Rating */}
                          <div style={{ color: '#f59e0b', fontSize: '12px' }}>
                            {'★'.repeat(difficultyStars)}{'☆'.repeat(4 - difficultyStars)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Tags Row */}
                      <div style={{ display: 'flex', gap: '8px', margin: '12px 0', marginLeft: '56px', flexWrap: 'wrap' as const }}>
                        <span style={{ padding: '3px 8px', background: theme.success + '20', color: theme.success, borderRadius: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          💰 {quest.potentialIncome}
                        </span>
                        <span style={{ padding: '3px 8px', background: darkMode ? '#334155' : '#e2e8f0', color: theme.textMuted, borderRadius: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ⏱ {quest.timeToSetup}
                        </span>
                        {!isLocked && quest.status !== 'completed' && (
                          <button
                            onClick={() => {
                              // Parse potential income to get a target (use middle estimate)
                              let targetAmount = '0'
                              const income = quest.potentialIncome || ''
                              const match = income.match(/\$?([\d,]+)/)
                              if (match) targetAmount = match[1].replace(',', '')
                              
                              addToRoadmap(
                                `Quest: ${quest.name}`,
                                'income',
                                targetAmount,
                                quest.icon,
                                quest.description,
                                quest.monthlyIncome || 0
                              )
                            }}
                            disabled={roadmapMilestones.some(m => m.name.toLowerCase().includes(quest.name.toLowerCase()))}
                            style={{ 
                              padding: '3px 8px', 
                              background: roadmapMilestones.some(m => m.name.toLowerCase().includes(quest.name.toLowerCase())) ? theme.border : theme.purple + '20', 
                              color: roadmapMilestones.some(m => m.name.toLowerCase().includes(quest.name.toLowerCase())) ? theme.textMuted : theme.purple, 
                              borderRadius: '4px', 
                              fontSize: '11px', 
                              border: 'none',
                              cursor: roadmapMilestones.some(m => m.name.toLowerCase().includes(quest.name.toLowerCase())) ? 'default' : 'pointer',
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px' 
                            }}
                          >
                            {roadmapMilestones.some(m => m.name.toLowerCase().includes(quest.name.toLowerCase())) ? '✓ In Roadmap' : '+ Roadmap'}
                          </button>
                        )}
                      </div>
                      
                      {/* Progress bar for in-progress quests */}
                      {quest.status === 'in_progress' && (
                        <div style={{ marginLeft: '56px', marginBottom: '12px' }}>
                          <div style={{ height: '6px', background: theme.border, borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: quest.progress + '%', height: '100%', background: theme.accent }} />
                          </div>
                          <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px' }}>Step {(quest.currentStep || 0) + 1} of {quest.steps?.length || 4}</div>
                        </div>
                      )}
                      
                      {/* Expand Guide Button */}
                      <button 
                        onClick={() => isLocked ? null : setActiveQuestId(isExpanded ? null : quest.id)}
                        disabled={isLocked}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: isLocked ? theme.textMuted : theme.accent, 
                          fontSize: '13px', 
                          cursor: isLocked ? 'not-allowed' : 'pointer',
                          padding: 0,
                          marginLeft: '56px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {isLocked ? (
                          <span style={{ color: theme.warning, fontSize: '12px' }}>🔐 {unlockStatus.reason || quest.unlockRequirement}</span>
                        ) : (
                          <>▼ {isExpanded ? 'Hide' : 'Expand'} guide</>
                        )}
                      </button>
                      
                      {/* Expanded Content */}
                      {isExpanded && !isLocked && (
                        <div style={{ marginTop: '16px', marginLeft: '56px', padding: '16px', background: darkMode ? '#0f172a' : '#f1f5f9', borderRadius: '8px' }}>
                          <div style={{ background: theme.success + '15', padding: '12px', borderRadius: '8px', marginBottom: '16px', borderLeft: '3px solid ' + theme.success }}>
                            <p style={{ margin: 0, color: theme.text, fontSize: '13px', lineHeight: 1.6 }}>💡 {quest.aureusAdvice}</p>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                            {quest.steps?.map((step: any, idx: number) => (
                              <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <div style={{ 
                                  width: '24px', height: '24px', borderRadius: '50%', 
                                  background: idx < (quest.currentStep || 0) ? theme.success : idx === (quest.currentStep || 0) ? theme.warning : theme.border, 
                                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                  fontSize: '12px', fontWeight: 'bold', flexShrink: 0 
                                }}>
                                  {idx < (quest.currentStep || 0) ? '✓' : idx + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 500, color: theme.text, fontSize: '13px' }}>{step.title}</div>
                                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>{step.description}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            {quest.status === 'not_started' && (
                              <>
                                <button onClick={() => {
                                  setPassiveQuests(passiveQuests.map(q => q.id === quest.id ? { ...q, status: 'in_progress', currentStep: 0, progress: 0 } : q))
                                }} style={{ flex: 1, padding: '10px 20px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                  🚀 Start Quest
                                </button>
                                <button onClick={() => {
                                  setActiveTab('dashboard')
                                  setSelectedQuestForWalkthrough(quest.id)
                                  setChatMessages([{ 
                                    role: 'assistant', 
                                    content: `Great choice! Let's build your ${quest.title} strategy together. 💪\n\n**${quest.aureusAdvice}**\n\nI'll walk you through each step personally. Here's our plan:\n\n${quest.steps?.map((s: any, i: number) => `${i + 1}. **${s.title}** - ${s.description}`).join('\n')}\n\nReady to start with Step 1: **${quest.steps?.[0]?.title}**?\n\nTell me about your current situation and I'll give you specific guidance for YOUR finances.`
                                  }])
                                }} style={{ flex: 1, padding: '10px 20px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                  🤖 Build with Aureus
                                </button>
                              </>
                            )}
                          </div>
                          
                          {quest.status === 'in_progress' && (
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                              <button onClick={() => {
                                const newStep = (quest.currentStep || 0) + 1
                                const newProgress = (newStep / (quest.steps?.length || 4)) * 100
                                setPassiveQuests(passiveQuests.map(q => q.id === quest.id ? { ...q, currentStep: newStep, progress: newProgress, status: newProgress >= 100 ? 'completed' : 'in_progress' } : q))
                              }} style={{ flex: 1, padding: '10px 20px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                ✓ Complete Step {(quest.currentStep || 0) + 1}
                              </button>
                              <button onClick={() => {
                                const currentStep = quest.steps?.[quest.currentStep || 0]
                                setActiveTab('dashboard')
                                setSelectedQuestForWalkthrough(quest.id)
                                setChatMessages([{ 
                                  role: 'assistant', 
                                  content: `Welcome back! Let's continue your ${quest.title} journey. 🎯\n\nYou're on **Step ${(quest.currentStep || 0) + 1}: ${currentStep?.title}**\n\n${currentStep?.description}\n\nHow's it going? Tell me what you've done so far and any challenges you're facing.`
                                }])
                              }} style={{ flex: 1, padding: '10px 20px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                💬 Get Aureus Help
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

          </div>
        </div>
        )}

        {/* TRADING TAB */}
        {appMode === 'trading' && activeTab === 'trading' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>
            
            {/* TRADING SUB-TABS */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
              {[
                { key: 'today', label: '🏠 Today', desc: 'Daily hub' },
                { key: 'journal', label: '📓 Journal', desc: 'Log trades' },
                { key: 'analytics', label: '📊 Analytics', desc: 'Performance' },
                { key: 'accounts', label: '💼 Accounts', desc: 'Multi-account' }
              ].map(tab => (
                <button 
                  key={tab.key}
                  onClick={() => setTradingSubTab(tab.key as any)}
                  style={{ 
                    padding: '12px 20px', 
                    background: tradingSubTab === tab.key ? theme.warning : theme.cardBg, 
                    color: tradingSubTab === tab.key ? 'white' : theme.text, 
                    border: '2px solid ' + (tradingSubTab === tab.key ? theme.warning : theme.border), 
                    borderRadius: '12px', 
                    cursor: 'pointer', 
                    fontSize: '14px', 
                    fontWeight: 600,
                    flex: '1 1 auto',
                    minWidth: '120px'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* ==================== TODAY TAB ==================== */}
            {tradingSubTab === 'today' && (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>
                
                {/* Good Morning Header */}
                <div style={{ padding: '24px', background: `linear-gradient(135deg, ${theme.warning}20, ${theme.purple}20)`, borderRadius: '16px', border: '2px solid ' + theme.warning }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h2 style={{ margin: '0 0 4px 0', color: theme.text, fontSize: '24px' }}>
                        {new Date().getHours() < 12 ? '☀️ Good morning!' : new Date().getHours() < 17 ? '🌤️ Good afternoon!' : '🌙 Good evening!'}
                      </h2>
                      <div style={{ color: theme.textMuted, fontSize: '14px' }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowQuickTradeModal(true)}
                      style={{ 
                        padding: '14px 24px', 
                        background: 'linear-gradient(135deg, #10b981, #059669)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        cursor: 'pointer', 
                        fontWeight: 700,
                        fontSize: '15px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      + Log Trade
                    </button>
                  </div>
                  
                  {/* AI Daily Insight */}
                  <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', borderLeft: '4px solid ' + theme.warning }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#78350f' }}>A</div>
                      <span style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>Aureus Daily Insight</span>
                    </div>
                    <div style={{ color: theme.text, fontSize: '14px', lineHeight: 1.6 }}>
                      {generateDailyInsight().map((insight, i) => (
                        <p key={i} style={{ margin: i === 0 ? 0 : '8px 0 0 0' }} dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Quick Stats Row */}
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
                        <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>TODAY</div>
                          <div style={{ color: todayPnL >= 0 ? theme.success : theme.danger, fontSize: '22px', fontWeight: 700 }}>
                            {todayPnL >= 0 ? '+' : ''}${todayPnL.toFixed(0)}
                          </div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>{todayTrades.length} trades</div>
                        </div>
                        <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>THIS WEEK</div>
                          <div style={{ color: weekPnL >= 0 ? theme.success : theme.danger, fontSize: '22px', fontWeight: 700 }}>
                            {weekPnL >= 0 ? '+' : ''}${weekPnL.toFixed(0)}
                          </div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>{weekWins}W / {weekTrades.length - weekWins}L</div>
                        </div>
                        <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>WIN RATE</div>
                          <div style={{ color: winRate >= 50 ? theme.success : theme.danger, fontSize: '22px', fontWeight: 700 }}>
                            {winRate.toFixed(0)}%
                          </div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>30 day</div>
                        </div>
                        <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>STREAK</div>
                          <div style={{ color: analytics.streaks.currentStreak >= 0 ? theme.success : theme.danger, fontSize: '22px', fontWeight: 700 }}>
                            {analytics.streaks.currentStreak > 0 ? '+' : ''}{analytics.streaks.currentStreak}
                          </div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>{analytics.streaks.currentStreak > 0 ? '🔥 wins' : analytics.streaks.currentStreak < 0 ? 'losses' : 'neutral'}</div>
                        </div>
                      </>
                    )
                  })()}
                </div>
                
                {/* Tilt Detector */}
                {(() => {
                  const tilt = detectTilt()
                  return (
                    <div style={{ 
                      padding: '16px 20px', 
                      background: tilt.tiltScore > 50 ? theme.danger + '20' : theme.success + '20', 
                      borderRadius: '12px', 
                      border: '2px solid ' + (tilt.tiltScore > 50 ? theme.danger : theme.success),
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '28px' }}>{tilt.tiltScore > 70 ? '🚨' : tilt.tiltScore > 40 ? '⚠️' : '✅'}</div>
                        <div>
                          <div style={{ color: theme.text, fontWeight: 600 }}>
                            {tilt.tiltScore > 70 ? 'HIGH TILT - Step Away!' : tilt.tiltScore > 40 ? 'Caution' : 'Clear to Trade'}
                          </div>
                          <div style={{ color: theme.textMuted, fontSize: '12px' }}>{tilt.todaysTrades} trades today • {tilt.todaysLosses} losses</div>
                        </div>
                      </div>
                      <div style={{ color: tilt.tiltScore > 50 ? theme.danger : theme.success, fontSize: '24px', fontWeight: 700 }}>{tilt.tiltScore}%</div>
                    </div>
                  )
                })()}
                
                {/* Pre-Session Checklist */}
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, color: theme.text, fontSize: '16px' }}>📋 Pre-Session Checklist</h3>
                    <div style={{ color: theme.textMuted, fontSize: '12px' }}>
                      {preSessionChecklist.filter(i => i.completed).length}/{preSessionChecklist.length} complete
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                    {preSessionChecklist.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => setPreSessionChecklist(preSessionChecklist.map(i => i.id === item.id ? { ...i, completed: !i.completed } : i))}
                        style={{ 
                          padding: '12px 16px', 
                          background: item.completed ? theme.success + '20' : (darkMode ? '#1e293b' : '#f8fafc'),
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          border: item.completed ? `2px solid ${theme.success}40` : '2px solid transparent'
                        }}
                      >
                        <div style={{ 
                          width: '24px', height: '24px', borderRadius: '6px', 
                          background: item.completed ? theme.success : theme.border,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: '14px'
                        }}>
                          {item.completed ? '✓' : ''}
                        </div>
                        <span style={{ color: theme.text, fontSize: '14px', textDecoration: item.completed ? 'line-through' : 'none', opacity: item.completed ? 0.7 : 1 }}>
                          {item.task}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Mental State Check */}
                  <div style={{ marginTop: '16px', padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ color: theme.text, fontWeight: 600, fontSize: '13px', marginBottom: '12px' }}>How are you feeling?</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                      {[
                        { key: 'great', emoji: '😎', label: 'Great' },
                        { key: 'good', emoji: '🙂', label: 'Good' },
                        { key: 'okay', emoji: '😐', label: 'Okay' },
                        { key: 'tired', emoji: '😴', label: 'Tired' },
                        { key: 'stressed', emoji: '😰', label: 'Stressed' }
                      ].map(mood => (
                        <button
                          key={mood.key}
                          onClick={() => setDailyMentalState(mood.key as any)}
                          style={{
                            padding: '8px 16px',
                            background: dailyMentalState === mood.key ? theme.warning + '30' : theme.cardBg,
                            border: `2px solid ${dailyMentalState === mood.key ? theme.warning : theme.border}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span style={{ fontSize: '18px' }}>{mood.emoji}</span>
                          <span style={{ color: theme.text, fontSize: '13px' }}>{mood.label}</span>
                        </button>
                      ))}
                    </div>
                    {(dailyMentalState === 'tired' || dailyMentalState === 'stressed') && (
                      <div style={{ marginTop: '12px', padding: '10px', background: theme.warning + '20', borderRadius: '6px', color: theme.warning, fontSize: '13px' }}>
                        ⚠️ Consider reducing position size or skipping today. Tired/stressed traders make mistakes.
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Weekly Report Card */}
                <div style={{ padding: '20px', background: `linear-gradient(135deg, ${theme.purple}20, ${theme.accent}20)`, borderRadius: '16px', border: '2px solid ' + theme.purple }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>📈</span>
                      <div>
                        <div style={{ color: theme.text, fontWeight: 600 }}>Weekly Report</div>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>Last 7 days performance</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const report = generateWeeklyReport()
                        sendQuickMessage(`Give me my weekly trading report with insights and recommendations.\n\nMy stats this week:\n- Trades: ${report.totalTrades}\n- P&L: $${report.pnl.toFixed(0)}\n- Win Rate: ${report.winRate.toFixed(0)}%\n- Wins: ${report.wins} | Losses: ${report.losses}\n- Rules Followed: ${report.rulesFollowed.toFixed(0)}%\n${report.bestSetup ? `- Best Setup: ${report.bestSetup[0]} ($${report.bestSetup[1].pnl.toFixed(0)})` : ''}\n${report.bestDay ? `- Best Day: ${report.bestDay[0]} ($${report.bestDay[1].toFixed(0)})` : ''}\n\nWhat should I focus on next week?`)
                      }}
                      style={{ padding: '10px 20px', background: theme.purple, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                    >
                      🤖 Get AI Report
                    </button>
                  </div>
                  
                  {(() => {
                    const report = generateWeeklyReport()
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        <div style={{ padding: '12px', background: theme.cardBg, borderRadius: '8px', textAlign: 'center' as const }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>P&L</div>
                          <div style={{ color: report.pnl >= 0 ? theme.success : theme.danger, fontSize: '18px', fontWeight: 700 }}>
                            {report.pnl >= 0 ? '+' : ''}${report.pnl.toFixed(0)}
                          </div>
                        </div>
                        <div style={{ padding: '12px', background: theme.cardBg, borderRadius: '8px', textAlign: 'center' as const }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>Win Rate</div>
                          <div style={{ color: report.winRate >= 50 ? theme.success : theme.warning, fontSize: '18px', fontWeight: 700 }}>
                            {report.winRate.toFixed(0)}%
                          </div>
                        </div>
                        <div style={{ padding: '12px', background: theme.cardBg, borderRadius: '8px', textAlign: 'center' as const }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>Trades</div>
                          <div style={{ color: theme.text, fontSize: '18px', fontWeight: 700 }}>
                            {report.wins}W / {report.losses}L
                          </div>
                        </div>
                        <div style={{ padding: '12px', background: theme.cardBg, borderRadius: '8px', textAlign: 'center' as const }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>Rules Followed</div>
                          <div style={{ color: report.rulesFollowed >= 80 ? theme.success : report.rulesFollowed >= 50 ? theme.warning : theme.danger, fontSize: '18px', fontWeight: 700 }}>
                            {report.rulesFollowed.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
                
                {/* Aureus Chat */}
                <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: '#78350f' }}>A</div>
                    <div style={{ color: theme.text, fontWeight: 600 }}>Ask Aureus</div>
                  </div>
                  
                  {pendingChartImage && (
                    <div style={{ marginBottom: '12px', padding: '8px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={pendingChartImage} alt="Chart" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      <span style={{ color: theme.text, fontSize: '12px', flex: 1 }}>📊 Chart attached</span>
                      <button onClick={() => setPendingChartImage(null)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>×</button>
                    </div>
                  )}
                  
                  {chatMessages.length > 0 && (
                    <div ref={chatContainerRef} style={{ maxHeight: '200px', overflowY: 'auto' as const, marginBottom: '12px', padding: '8px', background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} style={{ marginBottom: '10px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                          <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: msg.role === 'user' ? theme.warning : (darkMode ? '#1e293b' : '#f8fafc'), color: msg.role === 'user' ? 'white' : theme.text, fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-wrap' as const }}>
                            {msg.content}
                            {msg.image && (
                              <div style={{ marginTop: '10px' }}>
                                <img src={msg.image} alt="Uploaded chart" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid ' + theme.border }} />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {isLoading && <div style={{ display: 'flex', gap: '4px', padding: '10px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite' }} /><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.2s' }} /><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.4s' }} /></div>}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="file" ref={chartInputRef} accept="image/*" onChange={handleChartUpload} style={{ display: 'none' }} />
                    <button onClick={() => chartInputRef.current?.click()} style={{ padding: '10px 12px', background: darkMode ? '#1e293b' : '#f8fafc', color: theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }} title="Upload chart">📷</button>
                    <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChatMessage()} placeholder={pendingChartImage ? "What should I analyze?" : "Ask about your trading, analyze a chart..."} style={{ ...inputStyle, flex: 1, padding: '10px 14px', fontSize: '13px' }} disabled={isLoading} />
                    <button onClick={handleChatMessage} disabled={isLoading || (!chatInput.trim() && !pendingChartImage)} style={{ padding: '10px 16px', background: theme.warning, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', opacity: isLoading || (!chatInput.trim() && !pendingChartImage) ? 0.5 : 1 }}>{isLoading ? '...' : 'Send'}</button>
                  </div>
                </div>
                
                {/* Today's Trades */}
                {(() => {
                  const todayTrades = trades.filter(t => t.date === todayStr).sort((a, b) => (b.time || '').localeCompare(a.time || ''))
                  if (todayTrades.length === 0) return null
                  return (
                    <div style={cardStyle}>
                      <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '16px' }}>📈 Today's Trades</h3>
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                        {todayTrades.map(trade => (
                          <div key={trade.id} style={{ 
                            padding: '12px 16px', 
                            background: parseFloat(trade.profitLoss) >= 0 ? theme.success + '15' : theme.danger + '15',
                            borderRadius: '8px',
                            borderLeft: `4px solid ${parseFloat(trade.profitLoss) >= 0 ? theme.success : theme.danger}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: parseFloat(trade.profitLoss) >= 0 ? theme.success : theme.danger, fontWeight: 700 }}>
                                  {parseFloat(trade.profitLoss) >= 0 ? '🟢' : '🔴'} {trade.instrument}
                                </span>
                                <span style={{ color: theme.textMuted, fontSize: '12px' }}>{trade.time}</span>
                              </div>
                              <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>
                                {trade.setupType || 'No setup'} • {trade.direction} • Grade: {trade.setupGrade}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' as const }}>
                              <div style={{ color: parseFloat(trade.profitLoss) >= 0 ? theme.success : theme.danger, fontWeight: 700, fontSize: '18px' }}>
                                {parseFloat(trade.profitLoss) >= 0 ? '+' : ''}${parseFloat(trade.profitLoss).toFixed(0)}
                              </div>
                              {trade.rMultiple && <div style={{ color: theme.textMuted, fontSize: '11px' }}>{trade.rMultiple}R</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
                
                {/* Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <button onClick={() => setTradingSubTab('journal')} style={{ padding: '16px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📓</div>
                    <div style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>Journal</div>
                  </button>
                  <button onClick={() => setTradingSubTab('analytics')} style={{ padding: '16px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                    <div style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>Analytics</div>
                  </button>
                  <button onClick={() => setShowTradeImport(true)} style={{ padding: '16px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📥</div>
                    <div style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>Import</div>
                  </button>
                  <button onClick={() => setShowPayoutModal(true)} style={{ padding: '16px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
                    <div style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>Payout</div>
                  </button>
                </div>
              </div>
            )}
            
            {/* ==================== JOURNAL TAB ==================== */}
            {tradingSubTab === 'journal' && (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>
                
                {/* Quick Log Button */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => { setQuickTradeType('win'); setShowQuickTradeModal(true) }}
                    style={{ 
                      flex: 1, padding: '20px', 
                      background: 'linear-gradient(135deg, #10b981, #059669)', 
                      border: 'none', borderRadius: '12px', 
                      cursor: 'pointer', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '28px' }}>🟢</span>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>Log Win</span>
                  </button>
                  <button 
                    onClick={() => { setQuickTradeType('loss'); setShowQuickTradeModal(true) }}
                    style={{ 
                      flex: 1, padding: '20px', 
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                      border: 'none', borderRadius: '12px', 
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '28px' }}>🔴</span>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>Log Loss</span>
                  </button>
                </div>
                
                {/* Trade List with Filters */}
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, color: theme.text }}>📓 Trade Journal</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        value={analyticsDateRange} 
                        onChange={e => setAnalyticsDateRange(e.target.value as any)}
                        style={{ ...inputStyle, padding: '6px 12px', fontSize: '12px' }}
                      >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="all">All time</option>
                      </select>
                      <button onClick={() => setShowTradeImport(true)} style={{ padding: '6px 12px', background: theme.accent, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>📥 Import</button>
                    </div>
                  </div>
                  
                  {trades.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📓</div>
                      <h3 style={{ color: theme.text, margin: '0 0 8px 0' }}>No Trades Yet</h3>
                      <p style={{ color: theme.textMuted, margin: '0 0 20px 0' }}>Start logging your trades to track your performance.</p>
                      <button onClick={() => setShowQuickTradeModal(true)} style={{ padding: '12px 24px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Log Your First Trade</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', maxHeight: '500px', overflowY: 'auto' as const }}>
                      {trades
                        .filter(t => {
                          const tradeDate = new Date(t.date)
                          const now = new Date()
                          const daysMap: {[key: string]: number} = { '7d': 7, '30d': 30, '90d': 90, 'all': 9999 }
                          const days = daysMap[analyticsDateRange] || 30
                          const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
                          return tradeDate >= cutoff
                        })
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || (b.time || '').localeCompare(a.time || ''))
                        .map(trade => (
                          <div key={trade.id} style={{ 
                            padding: '16px', 
                            background: darkMode ? '#1e293b' : '#f8fafc',
                            borderRadius: '12px',
                            borderLeft: `4px solid ${parseFloat(trade.profitLoss) >= 0 ? theme.success : theme.danger}`
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <span style={{ color: parseFloat(trade.profitLoss) >= 0 ? theme.success : theme.danger, fontWeight: 700, fontSize: '16px' }}>
                                    {parseFloat(trade.profitLoss) >= 0 ? '🟢' : '🔴'} {trade.instrument || 'Unknown'}
                                  </span>
                                  <span style={{ color: theme.textMuted, fontSize: '12px' }}>{trade.direction}</span>
                                  {trade.setupType && <span style={{ padding: '2px 8px', background: theme.accent + '20', color: theme.accent, borderRadius: '4px', fontSize: '11px' }}>{trade.setupType}</span>}
                                </div>
                                <div style={{ color: theme.textMuted, fontSize: '12px' }}>
                                  {trade.date} {trade.time && `• ${trade.time}`} • Grade: {trade.setupGrade}
                                  {trade.emotionBefore && trade.emotionBefore !== 'neutral' && ` • Felt: ${trade.emotionBefore}`}
                                </div>
                                {trade.notes && <div style={{ color: theme.text, fontSize: '13px', marginTop: '8px', fontStyle: 'italic' }}>"{trade.notes}"</div>}
                              </div>
                              <div style={{ textAlign: 'right' as const }}>
                                <div style={{ color: parseFloat(trade.profitLoss) >= 0 ? theme.success : theme.danger, fontWeight: 700, fontSize: '20px' }}>
                                  {parseFloat(trade.profitLoss) >= 0 ? '+' : ''}${parseFloat(trade.profitLoss).toFixed(2)}
                                </div>
                                {trade.rMultiple && <div style={{ color: theme.textMuted, fontSize: '12px' }}>{trade.rMultiple}R</div>}
                                <button onClick={() => deleteTrade(trade.id)} style={{ marginTop: '8px', padding: '4px 8px', background: theme.danger + '20', color: theme.danger, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* ==================== ANALYTICS TAB ==================== */}
            {tradingSubTab === 'analytics' && (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>
                
                {/* Analytics Sub-Tabs */}
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' as const, gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                      {[
                        { key: 'overview', label: '📊 Overview' },
                        { key: 'calendar', label: '📅 Calendar' },
                        { key: 'setups', label: '🎯 Setups' },
                        { key: 'time', label: '⏰ Time' },
                        { key: 'psychology', label: '🧠 Psychology' }
                      ].map(tab => (
                        <button 
                          key={tab.key}
                          onClick={() => setAnalyticsTab(tab.key as any)}
                          style={{ 
                            padding: '8px 16px', 
                            background: analyticsTab === tab.key ? theme.warning : (darkMode ? '#1e293b' : '#f8fafc'), 
                            color: analyticsTab === tab.key ? 'white' : theme.text, 
                            border: '1px solid ' + (analyticsTab === tab.key ? theme.warning : theme.border), 
                            borderRadius: '8px', 
                            cursor: 'pointer', 
                            fontSize: '13px', 
                            fontWeight: 600 
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select 
                        value={analyticsDateRange} 
                        onChange={e => setAnalyticsDateRange(e.target.value as any)}
                        style={{ ...inputStyle, padding: '6px 12px', fontSize: '12px' }}
                      >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="all">All time</option>
                      </select>
                      {tradingAccounts.length > 0 && (
                        <select 
                          value={selectedAnalyticsAccount === 'all' ? 'all' : selectedAnalyticsAccount} 
                          onChange={e => setSelectedAnalyticsAccount(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                          style={{ ...inputStyle, padding: '6px 12px', fontSize: '12px' }}
                        >
                          <option value="all">All Accounts</option>
                          {tradingAccounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              
              {/* OVERVIEW TAB */}
              {analyticsTab === 'overview' && (() => {
                const analytics = calculateTradingAnalytics(selectedAnalyticsAccount, analyticsDateRange)
                return (
                  <div>
                    {/* Main Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Total P&L</div>
                        <div style={{ color: analytics.totalPnL >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>${analytics.totalPnL.toFixed(0)}</div>
                      </div>
                      <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Win Rate</div>
                        <div style={{ color: analytics.winRate >= 50 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>{analytics.winRate.toFixed(1)}%</div>
                      </div>
                      <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Profit Factor</div>
                        <div style={{ color: analytics.profitFactor >= 1 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>{analytics.profitFactor === Infinity ? '∞' : analytics.profitFactor.toFixed(2)}</div>
                      </div>
                      <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Expectancy</div>
                        <div style={{ color: analytics.expectancy >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>${analytics.expectancy.toFixed(0)}</div>
                      </div>
                      <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Avg R-Multiple</div>
                        <div style={{ color: analytics.avgRMultiple >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>{analytics.avgRMultiple.toFixed(2)}R</div>
                      </div>
                      <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Streak</div>
                        <div style={{ color: analytics.streaks.currentStreak >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>
                          {analytics.streaks.currentStreak > 0 ? '+' : ''}{analytics.streaks.currentStreak}
                        </div>
                      </div>
                    </div>
                    
                    {/* Secondary Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ padding: '12px', background: theme.success + '20', borderRadius: '8px' }}>
                        <div style={{ color: theme.success, fontSize: '12px' }}>Winners</div>
                        <div style={{ color: theme.text, fontSize: '20px', fontWeight: 700 }}>{analytics.winners} <span style={{ fontSize: '12px', color: theme.textMuted }}>trades</span></div>
                        <div style={{ color: theme.success, fontSize: '13px' }}>Avg: ${analytics.avgWin.toFixed(0)} • Best: ${analytics.largestWin.toFixed(0)}</div>
                      </div>
                      <div style={{ padding: '12px', background: theme.danger + '20', borderRadius: '8px' }}>
                        <div style={{ color: theme.danger, fontSize: '12px' }}>Losers</div>
                        <div style={{ color: theme.text, fontSize: '20px', fontWeight: 700 }}>{analytics.losers} <span style={{ fontSize: '12px', color: theme.textMuted }}>trades</span></div>
                        <div style={{ color: theme.danger, fontSize: '13px' }}>Avg: ${analytics.avgLoss.toFixed(0)} • Worst: ${analytics.largestLoss.toFixed(0)}</div>
                      </div>
                      <div style={{ padding: '12px', background: theme.purple + '20', borderRadius: '8px' }}>
                        <div style={{ color: theme.purple, fontSize: '12px' }}>Total Trades</div>
                        <div style={{ color: theme.text, fontSize: '20px', fontWeight: 700 }}>{analytics.totalTrades}</div>
                        <div style={{ color: theme.textMuted, fontSize: '13px' }}>BE: {analytics.breakeven}</div>
                      </div>
                      <div style={{ padding: '12px', background: theme.warning + '20', borderRadius: '8px' }}>
                        <div style={{ color: theme.warning, fontSize: '12px' }}>Best Streak</div>
                        <div style={{ color: theme.text, fontSize: '20px', fontWeight: 700 }}>+{analytics.streaks.longestWinStreak}</div>
                        <div style={{ color: theme.textMuted, fontSize: '13px' }}>Worst: -{analytics.streaks.longestLoseStreak}</div>
                      </div>
                    </div>
                    
                    {/* Top Instruments */}
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ color: theme.text, margin: '0 0 12px 0', fontSize: '14px' }}>📈 Performance by Instrument</h4>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                        {Object.entries(analytics.byInstrument)
                          .sort((a, b) => b[1].pnl - a[1].pnl)
                          .slice(0, 8)
                          .map(([inst, data]) => (
                            <div key={inst} style={{ 
                              padding: '8px 12px', 
                              background: darkMode ? '#1e293b' : '#f8fafc', 
                              borderRadius: '8px',
                              borderLeft: `3px solid ${data.pnl >= 0 ? theme.success : theme.danger}`
                            }}>
                              <div style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>{inst}</div>
                              <div style={{ color: data.pnl >= 0 ? theme.success : theme.danger, fontSize: '12px' }}>
                                ${data.pnl.toFixed(0)} • {data.trades} trades • {((data.wins / data.trades) * 100).toFixed(0)}% WR
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )
              })()}
              
              {/* CALENDAR TAB */}
              {analyticsTab === 'calendar' && (() => {
                const analytics = calculateTradingAnalytics(selectedAnalyticsAccount, 'all')
                const year = tradingCalendarMonth.getFullYear()
                const month = tradingCalendarMonth.getMonth()
                const firstDay = new Date(year, month, 1).getDay()
                const daysInMonth = new Date(year, month + 1, 0).getDate()
                const days = []
                
                // Empty cells before first day
                for (let i = 0; i < firstDay; i++) {
                  days.push(<div key={`empty-${i}`} style={{ padding: '8px' }} />)
                }
                
                // Day cells
                for (let d = 1; d <= daysInMonth; d++) {
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                  const dayData = analytics.calendarData[dateStr]
                  const pnl = dayData?.pnl || 0
                  const tradeCount = dayData?.trades || 0
                  const isToday = new Date().toISOString().split('T')[0] === dateStr
                  
                  days.push(
                    <div 
                      key={d}
                      style={{ 
                        padding: '8px', 
                        background: tradeCount > 0 
                          ? (pnl >= 0 ? theme.success + '30' : theme.danger + '30')
                          : (darkMode ? '#1e293b' : '#f8fafc'),
                        borderRadius: '8px',
                        textAlign: 'center' as const,
                        border: isToday ? `2px solid ${theme.warning}` : 'none',
                        minHeight: '60px'
                      }}
                    >
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '2px' }}>{d}</div>
                      {tradeCount > 0 ? (
                        <>
                          <div style={{ color: pnl >= 0 ? theme.success : theme.danger, fontWeight: 700, fontSize: '14px' }}>
                            {pnl >= 0 ? '+' : ''}${pnl.toFixed(0)}
                          </div>
                          <div style={{ color: theme.textMuted, fontSize: '10px' }}>{tradeCount} trade{tradeCount > 1 ? 's' : ''}</div>
                        </>
                      ) : (
                        <div style={{ color: theme.textMuted, fontSize: '10px', marginTop: '8px' }}>-</div>
                      )}
                    </div>
                  )
                }
                
                // Monthly totals
                const monthTrades = Object.entries(analytics.calendarData)
                  .filter(([date]) => date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
                const monthPnL = monthTrades.reduce((sum, [_, data]) => sum + data.pnl, 0)
                const monthTradeCount = monthTrades.reduce((sum, [_, data]) => sum + data.trades, 0)
                const greenDays = monthTrades.filter(([_, d]) => d.pnl > 0).length
                const redDays = monthTrades.filter(([_, d]) => d.pnl < 0).length
                
                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <button onClick={() => setTradingCalendarMonth(new Date(year, month - 1))} style={{ padding: '8px 16px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text }}>←</button>
                      <div style={{ textAlign: 'center' as const }}>
                        <div style={{ color: theme.text, fontWeight: 700, fontSize: '18px' }}>
                          {tradingCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                        <div style={{ color: monthPnL >= 0 ? theme.success : theme.danger, fontSize: '14px' }}>
                          {monthPnL >= 0 ? '+' : ''}${monthPnL.toFixed(0)} • {monthTradeCount} trades • {greenDays}🟢 {redDays}🔴
                        </div>
                      </div>
                      <button onClick={() => setTradingCalendarMonth(new Date(year, month + 1))} style={{ padding: '8px 16px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text }}>→</button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} style={{ textAlign: 'center' as const, color: theme.textMuted, fontSize: '11px', padding: '4px' }}>{day}</div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                      {days}
                    </div>
                  </div>
                )
              })()}
              
              {/* SETUPS TAB */}
              {analyticsTab === 'setups' && (() => {
                const analytics = calculateTradingAnalytics(selectedAnalyticsAccount, analyticsDateRange)
                const setupStats = Object.entries(analytics.bySetup)
                  .sort((a, b) => b[1].pnl - a[1].pnl)
                
                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ color: theme.text, margin: 0, fontSize: '14px' }}>🎯 Performance by Setup/Strategy</h4>
                      <button onClick={() => setShowSetupManager(true)} style={{ padding: '6px 12px', background: theme.accent, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                        ⚙️ Manage Setups
                      </button>
                    </div>
                    
                    {setupStats.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center' as const, color: theme.textMuted }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏷️</div>
                        <div>No setups tagged yet. Tag your trades with setups to see performance breakdowns.</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                        {setupStats.map(([setup, data]) => (
                          <div key={setup} style={{ 
                            padding: '16px', 
                            background: darkMode ? '#1e293b' : '#f8fafc', 
                            borderRadius: '12px',
                            display: 'grid',
                            gridTemplateColumns: '200px repeat(5, 1fr)',
                            alignItems: 'center',
                            gap: '16px'
                          }}>
                            <div>
                              <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>{setup}</div>
                              <div style={{ color: theme.textMuted, fontSize: '12px' }}>{data.trades} trades</div>
                            </div>
                            <div style={{ textAlign: 'center' as const }}>
                              <div style={{ color: theme.textMuted, fontSize: '10px' }}>P&L</div>
                              <div style={{ color: data.pnl >= 0 ? theme.success : theme.danger, fontWeight: 700 }}>${data.pnl.toFixed(0)}</div>
                            </div>
                            <div style={{ textAlign: 'center' as const }}>
                              <div style={{ color: theme.textMuted, fontSize: '10px' }}>Win Rate</div>
                              <div style={{ color: (data.wins / data.trades) >= 0.5 ? theme.success : theme.danger, fontWeight: 700 }}>{((data.wins / data.trades) * 100).toFixed(0)}%</div>
                            </div>
                            <div style={{ textAlign: 'center' as const }}>
                              <div style={{ color: theme.textMuted, fontSize: '10px' }}>Avg R</div>
                              <div style={{ color: data.avgR >= 0 ? theme.success : theme.danger, fontWeight: 700 }}>{data.avgR.toFixed(2)}R</div>
                            </div>
                            <div style={{ textAlign: 'center' as const }}>
                              <div style={{ color: theme.textMuted, fontSize: '10px' }}>Wins</div>
                              <div style={{ color: theme.success, fontWeight: 700 }}>{data.wins}</div>
                            </div>
                            <div>
                              {/* Visual bar */}
                              <div style={{ height: '8px', background: theme.border, borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ 
                                  height: '100%', 
                                  width: `${(data.wins / data.trades) * 100}%`, 
                                  background: (data.wins / data.trades) >= 0.5 ? theme.success : theme.danger,
                                  borderRadius: '4px'
                                }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}
              
              {/* TIME TAB */}
              {analyticsTab === 'time' && (() => {
                const analytics = calculateTradingAnalytics(selectedAnalyticsAccount, analyticsDateRange)
                
                if (analytics.totalTrades === 0) {
                  return (
                    <div style={{ padding: '60px 20px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏰</div>
                      <h3 style={{ color: theme.text, margin: '0 0 8px 0' }}>No Trade Data Yet</h3>
                      <p style={{ color: theme.textMuted, margin: 0 }}>
                        Log some trades to see your performance by day, hour, and session.
                      </p>
                    </div>
                  )
                }
                
                return (
                  <div>
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ color: theme.text, margin: '0 0 12px 0', fontSize: '14px' }}>📆 Performance by Day of Week</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                          const data = analytics.byDay[day] || { trades: 0, wins: 0, pnl: 0 }
                          return (
                            <div key={day} style={{ 
                              padding: '12px', 
                              background: data.trades > 0 
                                ? (data.pnl >= 0 ? theme.success + '20' : theme.danger + '20')
                                : (darkMode ? '#1e293b' : '#f8fafc'),
                              borderRadius: '8px',
                              textAlign: 'center' as const
                            }}>
                              <div style={{ color: theme.textMuted, fontSize: '11px' }}>{day.slice(0, 3)}</div>
                              <div style={{ color: data.pnl >= 0 ? theme.success : theme.danger, fontWeight: 700, fontSize: '16px' }}>
                                {data.trades > 0 ? `$${data.pnl.toFixed(0)}` : '-'}
                              </div>
                              <div style={{ color: theme.textMuted, fontSize: '10px' }}>
                                {data.trades > 0 ? `${data.trades} trades` : 'No trades'}
                              </div>
                              {data.trades > 0 && (
                                <div style={{ color: (data.wins / data.trades) >= 0.5 ? theme.success : theme.danger, fontSize: '10px' }}>
                                  {((data.wins / data.trades) * 100).toFixed(0)}% WR
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ color: theme.text, margin: '0 0 12px 0', fontSize: '14px' }}>⏰ Performance by Hour (24h)</h4>
                      <div style={{ display: 'flex', gap: '2px', height: '100px', alignItems: 'flex-end' }}>
                        {Object.entries(analytics.byHour).map(([hour, data]) => {
                          const allPnLs = Object.values(analytics.byHour).map(d => Math.abs(d.pnl))
                          const maxPnl = allPnLs.length > 0 ? Math.max(...allPnLs, 1) : 1
                          const height = data.trades > 0 ? (Math.abs(data.pnl) / maxPnl) * 80 + 20 : 5
                          return (
                            <div 
                              key={hour}
                              style={{ 
                                flex: 1, 
                                height: `${height}%`,
                                background: data.trades > 0 
                                  ? (data.pnl >= 0 ? theme.success : theme.danger)
                                  : theme.border,
                                borderRadius: '2px 2px 0 0',
                                position: 'relative' as const
                              }}
                              title={`${hour}:00 - $${data.pnl.toFixed(0)} (${data.trades} trades)`}
                            />
                          )
                        })}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span style={{ color: theme.textMuted, fontSize: '10px' }}>00:00</span>
                        <span style={{ color: theme.textMuted, fontSize: '10px' }}>06:00</span>
                        <span style={{ color: theme.textMuted, fontSize: '10px' }}>12:00</span>
                        <span style={{ color: theme.textMuted, fontSize: '10px' }}>18:00</span>
                        <span style={{ color: theme.textMuted, fontSize: '10px' }}>23:00</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 style={{ color: theme.text, margin: '0 0 12px 0', fontSize: '14px' }}>🌍 Performance by Session</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        {[
                          { key: 'asian', label: 'Asian', time: '00:00-08:00', emoji: '🌏' },
                          { key: 'london', label: 'London', time: '08:00-16:00', emoji: '🇬🇧' },
                          { key: 'newyork', label: 'New York', time: '13:00-21:00', emoji: '🇺🇸' },
                          { key: 'overlap', label: 'Overlap', time: '13:00-16:00', emoji: '🔥' }
                        ].map(session => {
                          const data = analytics.bySession[session.key] || { trades: 0, wins: 0, pnl: 0 }
                          return (
                            <div key={session.key} style={{ 
                              padding: '16px', 
                              background: data.trades > 0 
                                ? (data.pnl >= 0 ? theme.success + '20' : theme.danger + '20')
                                : (darkMode ? '#1e293b' : '#f8fafc'),
                              borderRadius: '12px',
                              textAlign: 'center' as const
                            }}>
                              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{session.emoji}</div>
                              <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>{session.label}</div>
                              <div style={{ color: theme.textMuted, fontSize: '10px', marginBottom: '8px' }}>{session.time}</div>
                              <div style={{ color: data.pnl >= 0 ? theme.success : theme.danger, fontWeight: 700, fontSize: '18px' }}>
                                {data.trades > 0 ? `$${data.pnl.toFixed(0)}` : '-'}
                              </div>
                              <div style={{ color: theme.textMuted, fontSize: '11px' }}>
                                {data.trades} trades{data.trades > 0 ? ` • ${((data.wins / data.trades) * 100).toFixed(0)}% WR` : ''}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })()}
              
              {/* PSYCHOLOGY TAB */}
              {analyticsTab === 'psychology' && (() => {
                const analytics = calculateTradingAnalytics(selectedAnalyticsAccount, analyticsDateRange)
                
                return (
                  <div>
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ color: theme.text, margin: '0 0 12px 0', fontSize: '14px' }}>🧠 Performance by Pre-Trade Emotion</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                        {[
                          { key: 'confident', label: 'Confident', emoji: '😎' },
                          { key: 'neutral', label: 'Neutral', emoji: '😐' },
                          { key: 'anxious', label: 'Anxious', emoji: '😰' },
                          { key: 'fomo', label: 'FOMO', emoji: '😱' },
                          { key: 'revenge', label: 'Revenge', emoji: '😤' }
                        ].map(emotion => {
                          const data = analytics.byEmotion[emotion.key] || { trades: 0, wins: 0, pnl: 0 }
                          return (
                            <div key={emotion.key} style={{ 
                              padding: '16px', 
                              background: data.trades > 0 
                                ? (data.pnl >= 0 ? theme.success + '15' : theme.danger + '15')
                                : (darkMode ? '#1e293b' : '#f8fafc'),
                              borderRadius: '12px',
                              textAlign: 'center' as const,
                              border: data.trades > 0 && data.pnl < 0 ? `2px solid ${theme.danger}40` : 'none'
                            }}>
                              <div style={{ fontSize: '28px', marginBottom: '4px' }}>{emotion.emoji}</div>
                              <div style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>{emotion.label}</div>
                              <div style={{ color: data.pnl >= 0 ? theme.success : theme.danger, fontWeight: 700, fontSize: '18px', margin: '4px 0' }}>
                                {data.trades > 0 ? `$${data.pnl.toFixed(0)}` : '-'}
                              </div>
                              <div style={{ color: theme.textMuted, fontSize: '11px' }}>
                                {data.trades} trades
                              </div>
                              {data.trades > 0 && (
                                <div style={{ color: (data.wins / data.trades) >= 0.5 ? theme.success : theme.danger, fontSize: '11px' }}>
                                  {((data.wins / data.trades) * 100).toFixed(0)}% WR
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    
                    {/* Insights */}
                    <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px' }}>
                      <h4 style={{ color: theme.text, margin: '0 0 16px 0', fontSize: '14px' }}>💡 Psychology Insights</h4>
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                        {(() => {
                          const insights = []
                          const fomoData = analytics.byEmotion['fomo'] || { trades: 0, pnl: 0 }
                          const revengeData = analytics.byEmotion['revenge'] || { trades: 0, pnl: 0 }
                          const confidentData = analytics.byEmotion['confident'] || { trades: 0, pnl: 0, wins: 0 }
                          
                          if (fomoData.trades > 0 && fomoData.pnl < 0) {
                            insights.push({ type: 'warning', text: `FOMO trades cost you $${Math.abs(fomoData.pnl).toFixed(0)}. Consider waiting for your setups.` })
                          }
                          if (revengeData.trades > 0 && revengeData.pnl < 0) {
                            insights.push({ type: 'danger', text: `Revenge trading lost you $${Math.abs(revengeData.pnl).toFixed(0)}. Step away after losses.` })
                          }
                          if (confidentData.trades > 3 && (confidentData.wins / confidentData.trades) > 0.6) {
                            insights.push({ type: 'success', text: `You perform well when confident (${((confidentData.wins / confidentData.trades) * 100).toFixed(0)}% WR). Trust your analysis!` })
                          }
                          if (analytics.streaks.longestLoseStreak >= 3) {
                            insights.push({ type: 'warning', text: `Your longest losing streak was ${analytics.streaks.longestLoseStreak}. Consider a break after 2 consecutive losses.` })
                          }
                          
                          if (insights.length === 0) {
                            insights.push({ type: 'info', text: 'Track more trades with emotions to get personalized insights.' })
                          }
                          
                          return insights.map((insight, i) => (
                            <div key={i} style={{ 
                              padding: '12px 16px', 
                              background: insight.type === 'danger' ? theme.danger + '20' : 
                                         insight.type === 'warning' ? theme.warning + '20' : 
                                         insight.type === 'success' ? theme.success + '20' : theme.accent + '20',
                              borderRadius: '8px',
                              color: theme.text,
                              fontSize: '13px'
                            }}>
                              {insight.type === 'danger' && '🚨 '}
                              {insight.type === 'warning' && '⚠️ '}
                              {insight.type === 'success' && '✅ '}
                              {insight.type === 'info' && '💡 '}
                              {insight.text}
                            </div>
                          ))
                        })()}
                      </div>
                    </div>
                  </div>
                )
              })()}
              </div>
            )}
            
            {/* ==================== ACCOUNTS TAB ==================== */}
            {tradingSubTab === 'accounts' && (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>
                
                {/* Accounts Summary */}
                {tradingAccounts.length > 0 && (
                  <div style={{ padding: '20px', background: `linear-gradient(135deg, ${theme.accent}20, ${theme.purple}20)`, borderRadius: '16px', border: '2px solid ' + theme.accent }}>
                    <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>💼 Portfolio Overview</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                      <div style={{ textAlign: 'center' as const }}>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>Total Balance</div>
                        <div style={{ color: theme.text, fontSize: '28px', fontWeight: 700 }}>
                          ${tradingAccounts.reduce((sum, acc) => sum + parseFloat(acc.currentBalance || acc.startingBalance || '0'), 0).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' as const }}>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>Total P&L</div>
                        <div style={{ 
                          color: tradingAccounts.reduce((sum, acc) => sum + (parseFloat(acc.currentBalance || '0') - parseFloat(acc.startingBalance || '0')), 0) >= 0 ? theme.success : theme.danger, 
                          fontSize: '28px', 
                          fontWeight: 700 
                        }}>
                          {tradingAccounts.reduce((sum, acc) => sum + (parseFloat(acc.currentBalance || '0') - parseFloat(acc.startingBalance || '0')), 0) >= 0 ? '+' : ''}
                          ${tradingAccounts.reduce((sum, acc) => sum + (parseFloat(acc.currentBalance || '0') - parseFloat(acc.startingBalance || '0')), 0).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' as const }}>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>Active Accounts</div>
                        <div style={{ color: theme.text, fontSize: '28px', fontWeight: 700 }}>
                          {tradingAccounts.filter(a => a.isActive).length}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

            {/* TRADING ACCOUNTS */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>💼 Trading Accounts</h2>
                <button onClick={() => setShowAddAccount(!showAddAccount)} style={{ padding: '8px 16px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  + Add Account
                </button>
              </div>
              
              {/* Add Account Form */}
              {showAddAccount && (
                <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Account Name *</label>
                      <input value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} placeholder="My FTMO 100k" style={{...inputStyle, width: '100%'}} />
                    </div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Type</label>
                      <select value={newAccount.type} onChange={e => setNewAccount({...newAccount, type: e.target.value})} style={{...inputStyle, width: '100%'}}>
                        <option value="personal">💼 Personal Account</option>
                        <option value="prop_challenge">🎯 Prop Challenge</option>
                        <option value="prop_funded">🏆 Prop Funded</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Prop Firm (or Custom)</label>
                      <select value={newAccount.propFirm} onChange={e => {
                        const firmName = e.target.value
                        if (firmName === 'Custom') {
                          setNewAccount({
                            ...newAccount, 
                            propFirm: 'Custom',
                            maxDrawdown: '',
                            dailyDrawdown: '',
                            profitTarget: ''
                          })
                        } else {
                          const firm = propFirmProfiles[firmName]
                          const phase = newAccount.type === 'prop_funded' ? 'funded' : 'challenge'
                          setNewAccount({
                            ...newAccount, 
                            propFirm: firmName,
                            maxDrawdown: firm?.phases?.[phase]?.maxDrawdown?.toString() || firm?.phases?.challenge?.maxDrawdown?.toString() || '',
                            dailyDrawdown: firm?.phases?.[phase]?.dailyDrawdown?.toString() || firm?.phases?.challenge?.dailyDrawdown?.toString() || '',
                            profitTarget: firm?.phases?.[phase]?.profitTarget?.toString() || firm?.phases?.challenge?.profitTarget?.toString() || ''
                          })
                        }
                      }} style={{...inputStyle, width: '100%'}}>
                        <option value="">Select or Custom...</option>
                        {Object.keys(propFirmProfiles).map(firm => (
                          <option key={firm} value={firm}>{firm}</option>
                        ))}
                        <option value="Custom">✏️ Custom (enter rules below)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Starting Balance *</label>
                      <input type="number" value={newAccount.startingBalance} onChange={e => setNewAccount({...newAccount, startingBalance: e.target.value, currentBalance: e.target.value})} placeholder="100000" style={{...inputStyle, width: '100%'}} />
                    </div>
                  </div>
                  
                  {/* Custom firm name input */}
                  {newAccount.propFirm === 'Custom' && (
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Custom Prop Firm Name</label>
                      <input 
                        value={newAccount.phase || ''} 
                        onChange={e => setNewAccount({...newAccount, phase: e.target.value})} 
                        placeholder="Enter prop firm name (e.g., Topstep, Apex, etc.)" 
                        style={{...inputStyle, width: '100%'}} 
                      />
                    </div>
                  )}
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Max Drawdown %</label>
                      <input type="number" value={newAccount.maxDrawdown} onChange={e => setNewAccount({...newAccount, maxDrawdown: e.target.value})} placeholder="10" style={{...inputStyle, width: '100%'}} />
                    </div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Daily Drawdown %</label>
                      <input type="number" value={newAccount.dailyDrawdown} onChange={e => setNewAccount({...newAccount, dailyDrawdown: e.target.value})} placeholder="5" style={{...inputStyle, width: '100%'}} />
                    </div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Profit Target %</label>
                      <input type="number" value={newAccount.profitTarget} onChange={e => setNewAccount({...newAccount, profitTarget: e.target.value})} placeholder="10" style={{...inputStyle, width: '100%'}} />
                    </div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Risk Per Trade %</label>
                      <input type="number" value={newAccount.riskPerTrade} onChange={e => setNewAccount({...newAccount, riskPerTrade: e.target.value})} placeholder="1" style={{...inputStyle, width: '100%'}} />
                    </div>
                  </div>
                  
                  {/* Additional Prop Firm Settings */}
                  {newAccount.type !== 'personal' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Min Trading Days</label>
                          <input type="number" value={newAccount.minTradingDays} onChange={e => setNewAccount({...newAccount, minTradingDays: e.target.value})} placeholder="4" style={{...inputStyle, width: '100%'}} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Max Days (0=none)</label>
                          <input type="number" value={newAccount.maxTradingDays} onChange={e => setNewAccount({...newAccount, maxTradingDays: e.target.value})} placeholder="30" style={{...inputStyle, width: '100%'}} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Profit Split %</label>
                          <input type="number" value={newAccount.profitSplit} onChange={e => setNewAccount({...newAccount, profitSplit: e.target.value})} placeholder="80" style={{...inputStyle, width: '100%'}} />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Consistency Rule</label>
                          <input value={newAccount.consistencyRule} onChange={e => setNewAccount({...newAccount, consistencyRule: e.target.value})} placeholder="e.g., 15%" style={{...inputStyle, width: '100%'}} />
                        </div>
                      </div>
                      
                      {/* Toggle Rules */}
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' as const }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.text, fontSize: '13px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={newAccount.newsRestriction} onChange={e => setNewAccount({...newAccount, newsRestriction: e.target.checked})} />
                          📰 News trading restricted
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.text, fontSize: '13px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={newAccount.weekendHolding} onChange={e => setNewAccount({...newAccount, weekendHolding: e.target.checked})} />
                          📅 Weekend holding allowed
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.text, fontSize: '13px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={newAccount.scalingPlan} onChange={e => setNewAccount({...newAccount, scalingPlan: e.target.checked})} />
                          📈 Scaling plan available
                        </label>
                      </div>
                      
                      {/* Custom Rules */}
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '8px' }}>Custom Rules (one per line - Aureus will enforce these!)</label>
                        <textarea
                          value={newAccount.customRules.join('\n')}
                          onChange={e => setNewAccount({...newAccount, customRules: e.target.value.split('\n').filter(r => r.trim())})}
                          placeholder="Stop loss required on every trade&#10;No martingale strategies&#10;Must close all positions by Friday close&#10;etc."
                          style={{...inputStyle, width: '100%', minHeight: '80px', resize: 'vertical' as const}}
                        />
                      </div>
                    </>
                  )}
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => {
                      if (newAccount.name && newAccount.startingBalance) {
                        const accountToAdd = {
                          ...newAccount,
                          id: Date.now(),
                          currentBalance: newAccount.startingBalance,
                          propFirm: newAccount.propFirm === 'Custom' ? (newAccount.phase || 'Custom') : newAccount.propFirm
                        }
                        setTradingAccounts([...tradingAccounts, accountToAdd])
                        setNewAccount({ name: '', type: 'personal', propFirm: '', phase: '', startingBalance: '', currentBalance: '', maxDrawdown: '', dailyDrawdown: '', profitTarget: '', riskPerTrade: '1', isActive: true, customRules: [], minTradingDays: '', maxTradingDays: '', consistencyRule: '', newsRestriction: false, weekendHolding: true, scalingPlan: false, profitSplit: '' })
                        setShowAddAccount(false)
                      }
                    }} style={{...btnSuccess, opacity: (!newAccount.name || !newAccount.startingBalance) ? 0.5 : 1}} disabled={!newAccount.name || !newAccount.startingBalance}>Add Account</button>
                    <button onClick={() => setShowAddAccount(false)} style={{ ...btnPrimary, background: theme.textMuted }}>Cancel</button>
                  </div>
                </div>
              )}
              
              {/* Account Cards */}
              {tradingAccounts.length === 0 ? (
                <div style={{ textAlign: 'center' as const, padding: '40px', color: theme.textMuted }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>💼</div>
                  <p>No accounts yet. Add your first trading account to get started!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                  {tradingAccounts.map(account => {
                    const startBal = parseFloat(account.startingBalance || '0')
                    const currBal = parseFloat(account.currentBalance || '0')
                    const pnl = currBal - startBal
                    const pnlPercent = startBal > 0 ? (pnl / startBal) * 100 : 0
                    const maxDD = parseFloat(account.maxDrawdown || '0')
                    const dailyDD = parseFloat(account.dailyDrawdown || '0')
                    const profitTarget = parseFloat(account.profitTarget || '0')
                    const progressToTarget = profitTarget > 0 ? Math.min((pnlPercent / profitTarget) * 100, 100) : 0
                    const drawdownUsed = pnl < 0 ? Math.abs(pnlPercent) : 0
                    const drawdownRemaining = maxDD - drawdownUsed
                    
                    // Get account-specific trades
                    const accountTrades = trades.filter(t => t.accountId === account.id)
                    const accountWins = accountTrades.filter(t => parseFloat(t.profitLoss || '0') > 0).length
                    const accountWinRate = accountTrades.length > 0 ? (accountWins / accountTrades.length) * 100 : 0
                    
                    // Today's P&L for daily drawdown check
                    const today = new Date().toISOString().split('T')[0]
                    const todaysTrades = accountTrades.filter(t => t.date === today)
                    const todaysPnl = todaysTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)
                    const todaysPnlPercent = startBal > 0 ? (todaysPnl / startBal) * 100 : 0
                    const dailyDDRemaining = dailyDD > 0 ? dailyDD - Math.abs(Math.min(0, todaysPnlPercent)) : null
                    
                    // Warning states
                    const isNearMaxDD = drawdownRemaining < maxDD * 0.3 && maxDD > 0
                    const isNearDailyDD = dailyDDRemaining !== null && dailyDDRemaining < dailyDD * 0.3
                    const isNearTarget = progressToTarget >= 80 && progressToTarget < 100
                    const hitTarget = progressToTarget >= 100
                    
                    return (
                      <div key={account.id} style={{ 
                        padding: '20px', 
                        background: darkMode ? '#1e293b' : '#f8fafc', 
                        borderRadius: '12px',
                        border: '2px solid ' + (
                          hitTarget ? theme.success :
                          isNearMaxDD || isNearDailyDD ? theme.danger :
                          account.type === 'personal' ? theme.purple : 
                          account.type === 'prop_funded' ? theme.success : theme.warning
                        )
                      }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '20px' }}>{hitTarget ? '🏆' : account.type === 'personal' ? '👤' : account.type === 'prop_funded' ? '💰' : '🎯'}</span>
                              <span style={{ fontWeight: 700, color: theme.text, fontSize: '16px' }}>{account.name}</span>
                            </div>
                            <div style={{ fontSize: '12px', color: theme.textMuted }}>
                              {account.propFirm || 'Personal Account'} {account.type === 'prop_challenge' ? '• Challenge' : account.type === 'prop_funded' ? '• Funded' : ''}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: '4px' }}>
                            <div style={{ 
                              padding: '4px 10px', 
                              background: pnl >= 0 ? theme.success + '20' : theme.danger + '20', 
                              color: pnl >= 0 ? theme.success : theme.danger,
                              borderRadius: '4px',
                              fontSize: '14px',
                              fontWeight: 700
                            }}>
                              {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                            </div>
                            <button onClick={() => {
                              if (confirm('Delete this account? This cannot be undone.')) {
                                setTradingAccounts(prev => prev.filter(a => a.id !== account.id))
                              }
                            }} style={{ padding: '2px 6px', background: 'transparent', color: theme.textMuted, border: 'none', cursor: 'pointer', fontSize: '11px' }}>🗑️ Delete</button>
                          </div>
                        </div>
                        
                        {/* Balance & P&L */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                          <div style={{ background: theme.cardBg, padding: '12px', borderRadius: '8px', textAlign: 'center' as const }}>
                            <div style={{ color: theme.textMuted, fontSize: '10px', marginBottom: '2px' }}>Balance</div>
                            <div style={{ color: theme.text, fontSize: '18px', fontWeight: 700 }}>${currBal.toLocaleString()}</div>
                          </div>
                          <div style={{ background: theme.cardBg, padding: '12px', borderRadius: '8px', textAlign: 'center' as const }}>
                            <div style={{ color: theme.textMuted, fontSize: '10px', marginBottom: '2px' }}>Total P&L</div>
                            <div style={{ color: pnl >= 0 ? theme.success : theme.danger, fontSize: '18px', fontWeight: 700 }}>${pnl.toFixed(0)}</div>
                          </div>
                          <div style={{ background: theme.cardBg, padding: '12px', borderRadius: '8px', textAlign: 'center' as const }}>
                            <div style={{ color: theme.textMuted, fontSize: '10px', marginBottom: '2px' }}>Win Rate</div>
                            <div style={{ color: accountWinRate >= 50 ? theme.success : theme.warning, fontSize: '18px', fontWeight: 700 }}>{accountWinRate.toFixed(0)}%</div>
                            <div style={{ color: theme.textMuted, fontSize: '10px' }}>{accountTrades.length} trades</div>
                          </div>
                        </div>
                        
                        {account.type !== 'personal' && (
                          <>
                            {/* Progress to Target */}
                            {profitTarget > 0 && (
                              <div style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                                  <span style={{ color: theme.textMuted }}>🎯 Target: {profitTarget}%</span>
                                  <span style={{ color: hitTarget ? theme.success : theme.warning, fontWeight: 600 }}>
                                    {hitTarget ? '✅ TARGET HIT!' : `${pnlPercent.toFixed(2)}% / ${profitTarget}%`}
                                  </span>
                                </div>
                                <div style={{ height: '8px', background: theme.border, borderRadius: '4px', overflow: 'hidden' }}>
                                  <div style={{ width: Math.min(progressToTarget, 100) + '%', height: '100%', background: hitTarget ? theme.success : 'linear-gradient(90deg, ' + theme.warning + ', ' + theme.success + ')' }} />
                                </div>
                              </div>
                            )}
                            
                            {/* Drawdown Status */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              {/* Max Drawdown */}
                              <div style={{ 
                                padding: '10px', 
                                background: isNearMaxDD ? theme.danger + '20' : theme.cardBg, 
                                borderRadius: '8px',
                                border: isNearMaxDD ? '1px solid ' + theme.danger : 'none'
                              }}>
                                <div style={{ color: theme.textMuted, fontSize: '10px', marginBottom: '2px' }}>Max DD Remaining</div>
                                <div style={{ color: isNearMaxDD ? theme.danger : theme.text, fontWeight: 700, fontSize: '14px' }}>
                                  {drawdownRemaining.toFixed(2)}%
                                </div>
                                <div style={{ color: theme.textMuted, fontSize: '10px' }}>${(startBal * drawdownRemaining / 100).toFixed(0)} buffer</div>
                              </div>
                              
                              {/* Daily Drawdown */}
                              {dailyDD > 0 && (
                                <div style={{ 
                                  padding: '10px', 
                                  background: isNearDailyDD ? theme.danger + '20' : theme.cardBg, 
                                  borderRadius: '8px',
                                  border: isNearDailyDD ? '1px solid ' + theme.danger : 'none'
                                }}>
                                  <div style={{ color: theme.textMuted, fontSize: '10px', marginBottom: '2px' }}>Daily DD Remaining</div>
                                  <div style={{ color: isNearDailyDD ? theme.danger : theme.text, fontWeight: 700, fontSize: '14px' }}>
                                    {dailyDDRemaining?.toFixed(2)}%
                                  </div>
                                  <div style={{ color: todaysPnl >= 0 ? theme.success : theme.danger, fontSize: '10px' }}>Today: {todaysPnl >= 0 ? '+' : ''}${todaysPnl.toFixed(0)}</div>
                                </div>
                              )}
                            </div>
                            
                            {/* Warnings */}
                            {(isNearMaxDD || isNearDailyDD) && (
                              <div style={{ marginTop: '12px', padding: '10px', background: theme.danger + '20', borderRadius: '8px', borderLeft: '4px solid ' + theme.danger }}>
                                <span style={{ color: theme.danger, fontSize: '12px', fontWeight: 600 }}>
                                  ⚠️ {isNearDailyDD ? 'Approaching daily drawdown limit! Consider stopping for today.' : 'Low drawdown buffer! Trade very carefully.'}
                                </span>
                              </div>
                            )}
                            
                            {isNearTarget && !hitTarget && (
                              <div style={{ marginTop: '12px', padding: '10px', background: theme.success + '20', borderRadius: '8px', borderLeft: '4px solid ' + theme.success }}>
                                <span style={{ color: theme.success, fontSize: '12px', fontWeight: 600 }}>
                                  🎯 Almost there! {(profitTarget - pnlPercent).toFixed(2)}% to target. Stay disciplined!
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        
                        {account.type === 'personal' && (
                          <div style={{ 
                            padding: '10px', 
                            background: theme.purple + '20', 
                            borderRadius: '8px',
                            textAlign: 'center' as const
                          }}>
                            <span style={{ color: theme.purple, fontSize: '12px' }}>💡 Focus on consistent growth. Use the compound calculator above!</span>
                          </div>
                        )}
                        
                        {/* Quick Update Balance */}
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ color: theme.textMuted, fontSize: '11px' }}>Update balance:</span>
                          <input 
                            type="number" 
                            placeholder={currBal.toString()}
                            onBlur={(e) => {
                              if (e.target.value) {
                                setTradingAccounts(prev => prev.map(a => 
                                  a.id === account.id ? { ...a, currentBalance: e.target.value } : a
                                ))
                                e.target.value = ''
                              }
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                                setTradingAccounts(prev => prev.map(a => 
                                  a.id === account.id ? { ...a, currentBalance: (e.target as HTMLInputElement).value } : a
                                ));
                                (e.target as HTMLInputElement).value = ''
                              }
                            }}
                            style={{...inputStyle, width: '100px', padding: '4px 8px', fontSize: '12px'}} 
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* TRADING RULES COMPLIANCE */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>📋 My Trading Rules</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: theme.success, fontSize: '14px', fontWeight: 600 }}>
                    {tradingRules.filter(r => r.enabled).length} active rules
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {tradingRules.map(rule => (
                  <div key={rule.id} style={{ 
                    padding: '12px 16px', 
                    background: darkMode ? '#1e293b' : '#f8fafc', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    opacity: rule.enabled ? 1 : 0.5
                  }}>
                    <input 
                      type="checkbox" 
                      checked={rule.enabled} 
                      onChange={() => setTradingRules(tradingRules.map(r => r.id === rule.id ? {...r, enabled: !r.enabled} : r))}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: theme.text, fontSize: '14px' }}>{rule.rule}</div>
                      <div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const }}>{rule.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PROP FIRM CALCULATOR */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 16px 0', color: theme.accent, fontSize: '20px' }}>💱 Prop Firm Calculator</h2>
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

            {/* PERSONAL ACCOUNT COMPOUNDING */}
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #8b5cf615, #10b98115)', borderRadius: '16px', border: '2px solid ' + theme.purple }}>
              <h2 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '20px' }}>📈 Personal Account Compounding</h2>
              <p style={{ color: theme.textMuted, fontSize: '13px', margin: '0 0 20px 0' }}>See the power of consistent, compounded returns</p>
              
              {/* Currency Selection */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Currency:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['$', '€', '£', '₹', '¥'].map(curr => (
                    <button key={curr} onClick={() => setTradingCalculator({...tradingCalculator, currency: curr})} style={{ padding: '8px 16px', background: tradingCalculator.currency === curr ? theme.warning : theme.cardBg, color: tradingCalculator.currency === curr ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>{curr}</button>
                  ))}
                </div>
              </div>
              
              {/* Main Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Principal amount:</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: theme.cardBg, borderRadius: '8px', border: '1px solid ' + theme.border }}>
                    <span style={{ padding: '10px 12px', color: theme.textMuted, borderRight: '1px solid ' + theme.border }}>{tradingCalculator.currency}</span>
                    <input type="number" value={tradingCalculator.startingCapital} onChange={e => setTradingCalculator({...tradingCalculator, startingCapital: e.target.value})} style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', color: theme.text, fontSize: '16px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Interest rate:</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: theme.cardBg, borderRadius: '8px', border: '1px solid ' + theme.border, flex: 1 }}>
                      <input type="number" value={tradingCalculator.returnRate} onChange={e => setTradingCalculator({...tradingCalculator, returnRate: e.target.value})} style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', color: theme.text, fontSize: '16px' }} />
                      <span style={{ padding: '10px 12px', color: theme.textMuted }}>%</span>
                    </div>
                    <select value={tradingCalculator.returnPeriod} onChange={e => setTradingCalculator({...tradingCalculator, returnPeriod: e.target.value})} style={{ padding: '10px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.text }}>
                      <option value="daily">daily</option>
                      <option value="weekly">weekly</option>
                      <option value="monthly">monthly</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Time Period */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Years:</label>
                  <input type="number" value={tradingCalculator.years} onChange={e => setTradingCalculator({...tradingCalculator, years: e.target.value})} style={{...inputStyle, width: '100%'}} />
                </div>
                <div>
                  <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Months:</label>
                  <input type="number" value={tradingCalculator.months} onChange={e => setTradingCalculator({...tradingCalculator, months: e.target.value})} style={{...inputStyle, width: '100%'}} />
                </div>
                <div>
                  <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Days:</label>
                  <input type="number" value={tradingCalculator.days} onChange={e => setTradingCalculator({...tradingCalculator, days: e.target.value})} style={{...inputStyle, width: '100%'}} />
                </div>
              </div>
              
              {/* Include Days */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: theme.textMuted, fontSize: '12px' }}>Include all days of week?</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => setTradingCalculator({...tradingCalculator, includeWeekends: true, includeDays: ['M', 'T', 'W', 'T2', 'F', 'S', 'S2']})} style={{ padding: '6px 16px', background: tradingCalculator.includeWeekends ? theme.cardBg : theme.warning, color: tradingCalculator.includeWeekends ? theme.text : 'white', border: '1px solid ' + theme.border, borderRadius: '4px 0 0 4px', cursor: 'pointer' }}>Yes</button>
                    <button onClick={() => setTradingCalculator({...tradingCalculator, includeWeekends: false, includeDays: ['M', 'T', 'W', 'T2', 'F']})} style={{ padding: '6px 16px', background: !tradingCalculator.includeWeekends ? theme.warning : theme.cardBg, color: !tradingCalculator.includeWeekends ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '0 4px 4px 0', cursor: 'pointer' }}>No</button>
                  </div>
                </div>
                
                {!tradingCalculator.includeWeekends && (
                  <div>
                    <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Days to include:</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[{d: 'M', l: 'M'}, {d: 'T', l: 'T'}, {d: 'W', l: 'W'}, {d: 'T2', l: 'T'}, {d: 'F', l: 'F'}, {d: 'S', l: 'S'}, {d: 'S2', l: 'S'}].map(({d, l}) => (
                        <button key={d} onClick={() => {
                          const newDays = tradingCalculator.includeDays.includes(d) 
                            ? tradingCalculator.includeDays.filter(x => x !== d)
                            : [...tradingCalculator.includeDays, d]
                          setTradingCalculator({...tradingCalculator, includeDays: newDays})
                        }} style={{ width: '36px', height: '36px', background: tradingCalculator.includeDays.includes(d) ? theme.warning : theme.cardBg, color: tradingCalculator.includeDays.includes(d) ? 'white' : theme.textMuted, border: '1px solid ' + theme.border, borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>{l}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Reinvest Rate */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Daily reinvest rate:</label>
                  <select value={tradingCalculator.reinvestRate} onChange={e => setTradingCalculator({...tradingCalculator, reinvestRate: e.target.value})} style={{...inputStyle, width: '100%'}}>
                    <option value="100">100%</option>
                    <option value="75">75%</option>
                    <option value="50">50%</option>
                    <option value="25">25%</option>
                    <option value="0">0% (withdraw all)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Start date? <span style={{ color: theme.accent, cursor: 'pointer' }} onClick={() => setTradingCalculator({...tradingCalculator, startDate: new Date().toISOString().split('T')[0]})}>today</span></label>
                  <input type="date" value={tradingCalculator.startDate} onChange={e => setTradingCalculator({...tradingCalculator, startDate: e.target.value})} style={{...inputStyle, width: '100%'}} />
                </div>
              </div>
              
              {/* Additional Contributions */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Additional contributions: <span style={{ color: theme.textMuted }}>(optional)</span></label>
                <div style={{ display: 'flex', gap: '4px', marginBottom: tradingCalculator.additionalContributions !== 'none' ? '12px' : 0 }}>
                  {['none', 'deposits', 'withdrawals'].map(opt => (
                    <button key={opt} onClick={() => setTradingCalculator({...tradingCalculator, additionalContributions: opt})} style={{ padding: '8px 20px', background: tradingCalculator.additionalContributions === opt ? theme.warning : theme.cardBg, color: tradingCalculator.additionalContributions === opt ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '4px', cursor: 'pointer', textTransform: 'capitalize' }}>{opt === 'none' ? 'None' : opt.charAt(0).toUpperCase() + opt.slice(1)}</button>
                  ))}
                </div>
                {tradingCalculator.additionalContributions === 'deposits' && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input type="number" placeholder="Amount" value={tradingCalculator.depositAmount} onChange={e => setTradingCalculator({...tradingCalculator, depositAmount: e.target.value})} style={{...inputStyle, flex: 1}} />
                    <select value={tradingCalculator.depositFrequency} onChange={e => setTradingCalculator({...tradingCalculator, depositFrequency: e.target.value})} style={inputStyle}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}
                {tradingCalculator.additionalContributions === 'withdrawals' && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input type="number" placeholder="Amount" value={tradingCalculator.withdrawAmount} onChange={e => setTradingCalculator({...tradingCalculator, withdrawAmount: e.target.value})} style={{...inputStyle, flex: 1}} />
                    <select value={tradingCalculator.withdrawFrequency} onChange={e => setTradingCalculator({...tradingCalculator, withdrawFrequency: e.target.value})} style={inputStyle}>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}
              </div>
              
              {/* Calculate Button */}
              <button onClick={() => {}} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '16px', marginBottom: '24px' }}>
                📊 Calculate
              </button>
              
              {/* Results */}
              {(() => {
                const result = tradingResults
                return (
                  <>
                    {/* Summary Stats */}
                    <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', marginBottom: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <div style={{ color: theme.textMuted, fontSize: '12px' }}>Total days / Business days</div>
                          <div style={{ color: theme.text, fontSize: '28px', fontWeight: 700 }}>{result.totalCalendarDays} / {result.totalTradingDays}</div>
                        </div>
                        <div>
                          <div style={{ color: theme.textMuted, fontSize: '12px' }}>Days excluded</div>
                          <div style={{ color: theme.warning, fontSize: '20px', fontWeight: 600 }}>{tradingCalculator.includeWeekends ? 'None' : 'Sat. Sun.'}</div>
                        </div>
                        <div>
                          <div style={{ color: theme.textMuted, fontSize: '12px' }}>Daily interest rate</div>
                          <div style={{ color: theme.warning, fontSize: '20px', fontWeight: 600 }}>{tradingCalculator.returnRate}%</div>
                        </div>
                        <div>
                          <div style={{ color: theme.textMuted, fontSize: '12px' }}>End date</div>
                          <div style={{ color: theme.success, fontSize: '20px', fontWeight: 600 }}>{result.endDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid ' + theme.border }}>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>Initial balance on {new Date(tradingCalculator.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                        <div style={{ color: theme.success, fontSize: '32px', fontWeight: 700 }}>{tradingCalculator.currency}{parseFloat(tradingCalculator.startingCapital).toLocaleString()}</div>
                      </div>
                    </div>
                    
                    {/* Final Results */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                      <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}>
                        <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Future Balance</div>
                        <div style={{ color: theme.success, fontSize: '28px', fontWeight: 700 }}>{tradingCalculator.currency}{result.futureValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                      </div>
                      <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}>
                        <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Total Contributed</div>
                        <div style={{ color: theme.purple, fontSize: '28px', fontWeight: 700 }}>{tradingCalculator.currency}{result.totalContributed.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                      </div>
                      <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}>
                        <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Pure Profit</div>
                        <div style={{ color: theme.warning, fontSize: '28px', fontWeight: 700 }}>{tradingCalculator.currency}{result.profit.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                      </div>
                    </div>
                    
                    {/* Earnings Breakdown */}
                    {result.breakdown && result.breakdown.length > 0 && (
                      <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h3 style={{ margin: 0, color: theme.text, fontSize: '16px' }}>Earnings breakdown</h3>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {['daily', 'weekly', 'monthly', 'yearly'].map(view => (
                              <button key={view} onClick={() => setCompoundView(view as any)} style={{ padding: '6px 12px', background: compoundView === view ? theme.warning : theme.border, color: compoundView === view ? 'white' : theme.text, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', textTransform: 'capitalize' }}>{view}</button>
                            ))}
                          </div>
                        </div>
                        
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ background: theme.border }}>
                                <th style={{ padding: '8px 12px', textAlign: 'left', color: theme.text, fontSize: '12px' }}>Date / Day</th>
                                <th style={{ padding: '8px 12px', textAlign: 'right', color: theme.text, fontSize: '12px' }}>Earnings</th>
                                <th style={{ padding: '8px 12px', textAlign: 'right', color: theme.warning, fontSize: '12px' }}>Total Earnings</th>
                                <th style={{ padding: '8px 12px', textAlign: 'right', color: theme.success, fontSize: '12px' }}>Balance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.breakdown.slice(0, compoundView === 'daily' ? 50 : compoundView === 'weekly' ? 20 : 12).map((row: any, idx: number) => (
                                <tr key={idx} style={{ borderBottom: '1px solid ' + theme.border, opacity: row.excluded ? 0.5 : 1 }}>
                                  <td style={{ padding: '8px 12px', color: row.excluded ? theme.textMuted : theme.text, fontSize: '13px' }}>
                                    {row.excluded ? 'Day excluded' : `${row.date?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}`}
                                  </td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right', color: row.excluded ? theme.textMuted : theme.text, fontSize: '13px' }}>{row.excluded ? '-' : `${tradingCalculator.currency}${row.earnings.toLocaleString(undefined, {maximumFractionDigits: 2})}`}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right', color: theme.warning, fontSize: '13px' }}>{tradingCalculator.currency}{row.totalEarnings.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right', color: theme.success, fontSize: '13px' }}>{tradingCalculator.currency}{row.balance.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}
              
              <div style={{ marginTop: '16px', padding: '12px', background: theme.warning + '20', borderRadius: '8px', border: '1px solid ' + theme.warning + '40' }}>
                <p style={{ color: theme.text, margin: 0, fontSize: '12px' }}>
                  ⚠️ <strong>Note:</strong> This calculator is for illustrative purposes only and does not constitute financial advice. We do not offer investment opportunities, promise returns, or endorse any financial products.
                </p>
              </div>
            </div>

            {/* ==================== TRADING ROADMAP ==================== */}
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '16px', border: '2px solid ' + theme.warning }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>🗺️</span>
                    <div>
                      <h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>Trading Roadmap</h2>
                      <p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '13px' }}>Your journey to trading success</p>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Ask Aureus to Build a Plan */}
                  <button
                    onClick={() => {
                      setChatMessages([{
                        role: 'user',
                        content: `I want to create a trading roadmap. Here's my situation:\n\n**Experience:** ${tradingMemory.experience || 'Not specified'}\n**Style:** ${tradingMemory.tradingStyle || 'Not specified'}\n**Accounts:** ${tradingAccounts.length > 0 ? tradingAccounts.map(a => `${a.name} (${a.propFirm || 'Personal'})`).join(', ') : 'None yet'}\n**Win Rate:** ${winRate.toFixed(0)}%\n**Total Trades:** ${trades.length}\n\nPlease create a personalized phased roadmap with specific milestones and timelines to help me become a consistently profitable trader and/or get funded.`
                      }])
                      sendQuickMessage(`I want to create a trading roadmap. Here's my situation:\n\n**Experience:** ${tradingMemory.experience || 'Not specified'}\n**Style:** ${tradingMemory.tradingStyle || 'Not specified'}\n**Accounts:** ${tradingAccounts.length > 0 ? tradingAccounts.map(a => `${a.name} (${a.propFirm || 'Personal'})`).join(', ') : 'None yet'}\n**Win Rate:** ${winRate.toFixed(0)}%\n**Total Trades:** ${trades.length}\n\nPlease create a personalized phased roadmap with specific milestones and timelines to help me become a consistently profitable trader and/or get funded.`)
                      setTradingSubTab('today')
                    }}
                    style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    🤖 Create AI Roadmap
                  </button>
                  {tradingRoadmap.length > 0 && (
                    <button
                      onClick={() => {
                        const milestoneSummary = tradingRoadmap.map(m => 
                          `- ${m.name}: Target $${parseFloat(m.targetAmount || '0').toLocaleString()}, Current $${m.currentAmount?.toLocaleString() || 0}${m.targetDate ? `, Deadline: ${m.targetDate}` : ''}`
                        ).join('\n')
                        
                        const accountSummary = tradingAccounts.map(acc => {
                          const pnl = parseFloat(acc.currentBalance || '0') - parseFloat(acc.startingBalance || '0')
                          const pnlPct = parseFloat(acc.startingBalance || '0') > 0 ? (pnl / parseFloat(acc.startingBalance || '0') * 100) : 0
                          return `- ${acc.name} (${acc.propFirm || 'Personal'}): $${parseFloat(acc.currentBalance || '0').toLocaleString()} (${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%)`
                        }).join('\n')
                        
                        setChatMessages([{
                          role: 'user',
                          content: `Please analyze my trading roadmap and create a plan:\n\n**My Milestones:**\n${milestoneSummary}\n\n**My Accounts:**\n${accountSummary}\n\n**My Stats:**\n- Win Rate: ${winRate.toFixed(0)}%\n- Total Trades: ${trades.length}\n\nGive me:\n1. Priority order for my goals\n2. Specific daily/weekly actions\n3. Risk management reminders\n4. Timeline estimates`
                        }])
                        sendQuickMessage(`Please analyze my trading roadmap and create a plan:\n\n**My Milestones:**\n${milestoneSummary}\n\n**My Accounts:**\n${accountSummary}\n\n**My Stats:**\n- Win Rate: ${winRate.toFixed(0)}%\n- Total Trades: ${trades.length}\n\nGive me:\n1. Priority order for my goals\n2. Specific daily/weekly actions\n3. Risk management reminders\n4. Timeline estimates`)
                      }}
                      style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      🤖 Analyze My Progress
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddTradingMilestone(true)}
                    style={{ padding: '10px 20px', background: theme.warning, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    + Add Milestone
                  </button>
                </div>
              </div>
              
              {/* AI-Generated Phased Roadmap */}
              {tradingRoadmapPhases.length > 0 && (
                <div style={{ marginBottom: '24px', padding: '20px', background: 'linear-gradient(135deg, #8b5cf620, #6d28d920)', borderRadius: '12px', border: '2px solid #8b5cf6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <div style={{ color: theme.text, fontWeight: 700, fontSize: '18px' }}>🎯 {tradingRoadmapGoal.title || 'My Trading Journey'}</div>
                      {tradingRoadmapGoal.targetDate && (
                        <div style={{ color: theme.textMuted, fontSize: '13px' }}>Target: {new Date(tradingRoadmapGoal.targetDate).toLocaleDateString()}</div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Clear this roadmap?')) {
                          setTradingRoadmapPhases([])
                          setTradingRoadmapGoal({ title: '', targetDate: '', type: 'prop_funded' })
                        }
                      }}
                      style={{ padding: '6px 12px', background: theme.danger + '20', color: theme.danger, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Clear Roadmap
                    </button>
                  </div>
                  
                  {/* Phases */}
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
                    {tradingRoadmapPhases.map((phase, phaseIdx) => {
                      const completedMilestones = phase.milestones?.filter((m: any) => m.completed).length || 0
                      const totalMilestones = phase.milestones?.length || 0
                      const phaseProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0
                      const isCurrentPhase = phaseIdx === 0 || tradingRoadmapPhases[phaseIdx - 1]?.milestones?.every((m: any) => m.completed)
                      
                      return (
                        <div 
                          key={phase.id || phaseIdx}
                          style={{ 
                            padding: '16px', 
                            background: phaseProgress === 100 ? theme.success + '20' : isCurrentPhase ? theme.cardBg : theme.cardBg + '60',
                            borderRadius: '12px',
                            border: `2px solid ${phaseProgress === 100 ? theme.success : isCurrentPhase ? theme.warning : theme.border}`,
                            opacity: isCurrentPhase || phaseProgress === 100 ? 1 : 0.6
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: phaseProgress === 100 ? theme.success : isCurrentPhase ? theme.warning : theme.border,
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: '14px'
                              }}>
                                {phaseProgress === 100 ? '✓' : phaseIdx + 1}
                              </div>
                              <div>
                                <div style={{ color: theme.text, fontWeight: 600, fontSize: '15px' }}>{phase.name}</div>
                                <div style={{ color: theme.textMuted, fontSize: '12px' }}>{phase.duration}</div>
                              </div>
                            </div>
                            <div style={{ 
                              padding: '4px 10px', 
                              background: phaseProgress === 100 ? theme.success + '30' : theme.warning + '30',
                              color: phaseProgress === 100 ? theme.success : theme.warning,
                              borderRadius: '12px', fontSize: '12px', fontWeight: 600
                            }}>
                              {completedMilestones}/{totalMilestones} complete
                            </div>
                          </div>
                          
                          {/* Progress bar */}
                          <div style={{ height: '6px', background: theme.border, borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                            <div style={{ width: phaseProgress + '%', height: '100%', background: phaseProgress === 100 ? theme.success : `linear-gradient(90deg, ${theme.warning}, ${theme.success})`, transition: 'width 0.3s' }} />
                          </div>
                          
                          {/* Milestones */}
                          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                            {phase.milestones?.map((milestone: any, mIdx: number) => (
                              <div
                                key={milestone.id || mIdx}
                                onClick={() => {
                                  if (isCurrentPhase || phaseProgress === 100) {
                                    setTradingRoadmapPhases(prev => prev.map((p, pIdx) => {
                                      if (pIdx === phaseIdx) {
                                        return {
                                          ...p,
                                          milestones: p.milestones.map((m: any, idx: number) => 
                                            idx === mIdx ? { ...m, completed: !m.completed } : m
                                          )
                                        }
                                      }
                                      return p
                                    }))
                                  }
                                }}
                                style={{
                                  padding: '10px 14px',
                                  background: milestone.completed ? theme.success + '20' : (darkMode ? '#1e293b' : '#f8fafc'),
                                  borderRadius: '8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  cursor: isCurrentPhase || phaseProgress === 100 ? 'pointer' : 'default',
                                  border: milestone.completed ? `1px solid ${theme.success}40` : '1px solid transparent'
                                }}
                              >
                                <div style={{
                                  width: '20px', height: '20px', borderRadius: '4px',
                                  background: milestone.completed ? theme.success : theme.border,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: 'white', fontSize: '12px', fontWeight: 700, flexShrink: 0
                                }}>
                                  {milestone.completed ? '✓' : ''}
                                </div>
                                <span style={{ 
                                  color: theme.text, 
                                  fontSize: '13px',
                                  textDecoration: milestone.completed ? 'line-through' : 'none',
                                  opacity: milestone.completed ? 0.7 : 1
                                }}>
                                  {milestone.task}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* Add Milestone Form */}
              {showAddTradingMilestone && (
                <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', marginBottom: '20px', border: '1px solid ' + theme.border }}>
                  <h4 style={{ margin: '0 0 16px 0', color: theme.text }}>✨ Add Trading Milestone</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Milestone Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Pass FTMO Challenge, Hit 100 trades, $10K profit"
                        value={newTradingMilestone.name}
                        onChange={e => setNewTradingMilestone({...newTradingMilestone, name: e.target.value})}
                        style={{ width: '100%', padding: '10px', background: darkMode ? '#1e293b' : '#f1f5f9', border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.text }}
                      />
                    </div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Target Amount ($)</label>
                      <input
                        type="number"
                        placeholder="e.g., 10000"
                        value={newTradingMilestone.targetAmount}
                        onChange={e => setNewTradingMilestone({...newTradingMilestone, targetAmount: e.target.value})}
                        style={{ width: '100%', padding: '10px', background: darkMode ? '#1e293b' : '#f1f5f9', border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.text }}
                      />
                    </div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Target Date (optional)</label>
                      <input
                        type="date"
                        value={newTradingMilestone.targetDate}
                        onChange={e => setNewTradingMilestone({...newTradingMilestone, targetDate: e.target.value})}
                        style={{ width: '100%', padding: '10px', background: darkMode ? '#1e293b' : '#f1f5f9', border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.text }}
                      />
                    </div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Category</label>
                      <select
                        value={newTradingMilestone.category}
                        onChange={e => setNewTradingMilestone({...newTradingMilestone, category: e.target.value})}
                        style={{ width: '100%', padding: '10px', background: darkMode ? '#1e293b' : '#f1f5f9', border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.text }}
                      >
                        <option value="prop">🎯 Prop Firm</option>
                        <option value="personal">💰 Personal Account</option>
                        <option value="skill">📚 Skill Development</option>
                        <option value="income">💵 Income Goal</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Notes (optional)</label>
                    <textarea
                      placeholder="Any additional notes about this milestone..."
                      value={newTradingMilestone.notes}
                      onChange={e => setNewTradingMilestone({...newTradingMilestone, notes: e.target.value})}
                      style={{ width: '100%', padding: '10px', background: darkMode ? '#1e293b' : '#f1f5f9', border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.text, minHeight: '60px', resize: 'vertical' as const }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        if (newTradingMilestone.name) {
                          setTradingRoadmap(prev => [...prev, {
                            id: Date.now(),
                            ...newTradingMilestone,
                            currentAmount: 0,
                            completed: false,
                            createdAt: new Date().toISOString()
                          }])
                          setNewTradingMilestone({ name: '', targetAmount: '', targetDate: '', category: 'prop', icon: '🎯', notes: '', currentAmount: 0 })
                          setShowAddTradingMilestone(false)
                        }
                      }}
                      style={{ padding: '10px 20px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Add Milestone
                    </button>
                    <button
                      onClick={() => setShowAddTradingMilestone(false)}
                      style={{ padding: '10px 20px', background: theme.cardBg, color: theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {/* Milestones Display */}
              {tradingRoadmap.length === 0 ? (
                <div style={{ textAlign: 'center' as const, padding: '40px', color: theme.textMuted }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
                  <p style={{ marginBottom: '8px' }}>No trading milestones yet</p>
                  <p style={{ fontSize: '13px' }}>Add milestones to track your journey: prop challenges, income goals, skill development, etc.</p>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  {/* Timeline Line */}
                  <div style={{ position: 'absolute', left: '20px', top: '20px', bottom: '20px', width: '4px', background: `linear-gradient(180deg, ${theme.warning}, ${theme.success})`, borderRadius: '2px' }} />
                  
                  {/* Milestones */}
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
                    {tradingRoadmap.sort((a, b) => {
                      if (a.completed && !b.completed) return 1
                      if (!a.completed && b.completed) return -1
                      if (a.targetDate && b.targetDate) return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
                      return 0
                    }).map((milestone, idx) => {
                      const progress = milestone.targetAmount && parseFloat(milestone.targetAmount) > 0 
                        ? Math.min((milestone.currentAmount || 0) / parseFloat(milestone.targetAmount) * 100, 100)
                        : 0
                      const daysUntil = milestone.targetDate 
                        ? Math.ceil((new Date(milestone.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                        : null
                      const categoryIcons: {[key: string]: string} = { prop: '🎯', personal: '💰', skill: '📚', income: '💵' }
                      
                      return (
                        <div key={milestone.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingLeft: '8px' }}>
                          {/* Timeline Dot */}
                          <div style={{ 
                            width: '28px', height: '28px', borderRadius: '50%', 
                            background: milestone.completed ? theme.success : progress > 0 ? theme.warning : theme.cardBg,
                            border: '3px solid ' + (milestone.completed ? theme.success : theme.warning),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', zIndex: 1, flexShrink: 0
                          }}>
                            {milestone.completed ? '✓' : categoryIcons[milestone.category] || '🎯'}
                          </div>
                          
                          {/* Milestone Card */}
                          <div style={{ 
                            flex: 1, padding: '16px', 
                            background: milestone.completed ? theme.success + '20' : theme.cardBg, 
                            borderRadius: '12px', 
                            border: '1px solid ' + (milestone.completed ? theme.success : theme.border),
                            opacity: milestone.completed ? 0.8 : 1
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div>
                                <div style={{ fontWeight: 600, color: theme.text, fontSize: '15px' }}>{milestone.name}</div>
                                {milestone.notes && <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>{milestone.notes}</div>}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {daysUntil !== null && !milestone.completed && (
                                  <span style={{ 
                                    padding: '4px 8px', 
                                    background: daysUntil < 7 ? theme.danger + '20' : daysUntil < 30 ? theme.warning + '20' : theme.success + '20',
                                    color: daysUntil < 7 ? theme.danger : daysUntil < 30 ? theme.warning : theme.success,
                                    borderRadius: '4px', fontSize: '11px', fontWeight: 600
                                  }}>
                                    {daysUntil > 0 ? `${daysUntil} days` : daysUntil === 0 ? 'Today!' : 'Overdue'}
                                  </span>
                                )}
                                <button 
                                  onClick={() => setTradingRoadmap(prev => prev.filter(m => m.id !== milestone.id))}
                                  style={{ padding: '4px 8px', background: 'transparent', color: theme.textMuted, border: 'none', cursor: 'pointer', fontSize: '12px' }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                            
                            {/* Progress */}
                            {milestone.targetAmount && parseFloat(milestone.targetAmount) > 0 && (
                              <div style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: theme.textMuted, marginBottom: '4px' }}>
                                  <span>${(milestone.currentAmount || 0).toLocaleString()}</span>
                                  <span>${parseFloat(milestone.targetAmount).toLocaleString()}</span>
                                </div>
                                <div style={{ height: '8px', background: theme.border, borderRadius: '4px', overflow: 'hidden' }}>
                                  <div style={{ width: progress + '%', height: '100%', background: milestone.completed ? theme.success : `linear-gradient(90deg, ${theme.warning}, ${theme.success})`, borderRadius: '4px', transition: 'width 0.3s' }} />
                                </div>
                                <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px' }}>{progress.toFixed(1)}% complete</div>
                              </div>
                            )}
                            
                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                              {!milestone.completed && (
                                <>
                                  <input
                                    type="number"
                                    placeholder="Update amount"
                                    style={{ padding: '6px 10px', background: darkMode ? '#1e293b' : '#f1f5f9', border: '1px solid ' + theme.border, borderRadius: '6px', color: theme.text, fontSize: '12px', width: '120px' }}
                                    onKeyPress={e => {
                                      if (e.key === 'Enter') {
                                        const input = e.target as HTMLInputElement
                                        const newAmount = parseFloat(input.value)
                                        if (!isNaN(newAmount)) {
                                          setTradingRoadmap(prev => prev.map(m => m.id === milestone.id ? { ...m, currentAmount: newAmount } : m))
                                          input.value = ''
                                        }
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => setTradingRoadmap(prev => prev.map(m => m.id === milestone.id ? { ...m, completed: true } : m))}
                                    style={{ padding: '6px 12px', background: theme.success + '20', color: theme.success, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                                  >
                                    ✓ Complete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* Smart Suggestions */}
              {tradingRoadmap.length === 0 && tradingAccounts.length > 0 && (
                <div style={{ marginTop: '20px', padding: '16px', background: theme.warning + '15', borderRadius: '12px', border: '1px solid ' + theme.warning + '30' }}>
                  <div style={{ color: theme.text, fontWeight: 600, marginBottom: '12px' }}>💡 Suggested Milestones</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
                    {tradingAccounts.filter(a => a.type !== 'personal').map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => {
                          setTradingRoadmap(prev => [...prev, {
                            id: Date.now(),
                            name: `Pass ${acc.propFirm || acc.name} Challenge`,
                            targetAmount: (parseFloat(acc.startingBalance || '0') * parseFloat(acc.profitTarget || '10') / 100).toString(),
                            category: 'prop',
                            icon: '🎯',
                            notes: `Profit target: ${acc.profitTarget}%`,
                            currentAmount: Math.max(0, parseFloat(acc.currentBalance || '0') - parseFloat(acc.startingBalance || '0')),
                            targetDate: '',
                            completed: false,
                            createdAt: new Date().toISOString()
                          }])
                        }}
                        style={{ padding: '8px 16px', background: theme.cardBg, color: theme.text, border: '1px solid ' + theme.border, borderRadius: '20px', cursor: 'pointer', fontSize: '13px' }}
                      >
                        + Pass {acc.propFirm || acc.name}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setTradingRoadmap(prev => [...prev, {
                          id: Date.now(),
                          name: 'Complete 100 Trades',
                          targetAmount: '100',
                          category: 'skill',
                          icon: '📚',
                          notes: 'Build consistency through volume',
                          currentAmount: trades.length,
                          targetDate: '',
                          completed: false,
                          createdAt: new Date().toISOString()
                        }])
                      }}
                      style={{ padding: '8px 16px', background: theme.cardBg, color: theme.text, border: '1px solid ' + theme.border, borderRadius: '20px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      + 100 Trades Milestone
                    </button>
                    <button
                      onClick={() => {
                        setTradingRoadmap(prev => [...prev, {
                          id: Date.now(),
                          name: '$10,000 Total Profit',
                          targetAmount: '10000',
                          category: 'income',
                          icon: '💵',
                          notes: 'Cumulative trading profits',
                          currentAmount: trades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0),
                          targetDate: '',
                          completed: false,
                          createdAt: new Date().toISOString()
                        }])
                      }}
                      style={{ padding: '8px 16px', background: theme.cardBg, color: theme.text, border: '1px solid ' + theme.border, borderRadius: '20px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      + $10K Profit Goal
                    </button>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        )}
      </main>
      
      {/* Footer Disclaimer */}
      <footer style={{ padding: '16px 24px', background: theme.cardBg, borderTop: '1px solid ' + theme.border, textAlign: 'center' as const }}>
        <p style={{ margin: '0 0 8px 0', color: theme.textMuted, fontSize: '11px', lineHeight: 1.5 }}>
          ⚠️ <strong>Disclaimer:</strong> Aureus is an AI-powered financial assistant for educational and informational purposes only. 
          This is not financial, tax, or legal advice. AI can make mistakes — always verify information. 
          Consult qualified professionals before making financial decisions.
        </p>
        <p style={{ margin: 0, color: theme.textMuted, fontSize: '10px' }}>
          © {new Date().getFullYear()} Aureus • Not affiliated with any financial institution • Past performance ≠ future results
        </p>
      </footer>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
