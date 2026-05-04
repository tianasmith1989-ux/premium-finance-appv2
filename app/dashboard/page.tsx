'use client'

import { useUser } from '@clerk/nextjs'
import React, { useState, useEffect, useRef, useCallback } from 'react'

export default function Dashboard() {
  const { user } = useUser()

  // ==================== APP MODE & NAVIGATION ====================
  const [appMode, setAppMode] = useState<'budget' | null>(null)
  const [showModeSelector, setShowModeSelector] = useState(true)
  const [activeTab, setActiveTab] = useState<'chat' | 'quickview' | 'dashboard' | 'overview' | 'path' | 'learn' | 'wins' | 'mortgage' | 'insights' | 'grow' | 'review'>('chat')
  const [darkMode, setDarkMode] = useState(true)

  // ==================== ONBOARDING FLOW ====================
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [onboardingComplete, setOnboardingComplete] = useState(false)

  // Money Personality Quiz
  const [moneyPersonality, setMoneyPersonality] = useState<string | null>(null)
  const [personalityAnswers, setPersonalityAnswers] = useState<{[key: number]: string}>({})

  // Identity Statements
  const [identityStatements, setIdentityStatements] = useState<string[]>([])
  const [showIdentityEditor, setShowIdentityEditor] = useState(false)
  const [identityDraft, setIdentityDraft] = useState('')

  // Deep Why
  const [deepWhyAnswers, setDeepWhyAnswers] = useState<{[key: number]: string}>({})
  const [deepWhyComplete, setDeepWhyComplete] = useState(false)

  // Fear Audit
  const [fearAuditAnswers, setFearAuditAnswers] = useState<{[key: number]: string}>({})
  const [fearAuditComplete, setFearAuditComplete] = useState(false)
  const [showFearAudit, setShowFearAudit] = useState(false)
  const [fearAuditStep, setFearAuditStep] = useState(0)

  // ==================== PROACTIVE INSIGHTS ====================
  const [proactiveInsights, setProactiveInsights] = useState<any[]>([])
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [insightsGeneratedAt, setInsightsGeneratedAt] = useState<string | null>(null)
  const [oneDecision, setOneDecision] = useState<string | null>(null)
  const [oneDecisionDate, setOneDecisionDate] = useState<string | null>(null)
  const [loadingOneDecision, setLoadingOneDecision] = useState(false)

  // ==================== LATTE FACTOR ====================
  const [latteItems, setLatteItems] = useState<any[]>([
    { id: 1, name: 'Daily coffee', amount: '6', frequency: 'daily', emoji: '☕' },
    { id: 2, name: 'Lunch out', amount: '15', frequency: 'daily', emoji: '🥗' },
  ])
  const [newLatteItem, setNewLatteItem] = useState({ name: '', amount: '', frequency: 'daily', emoji: '💸' })
  const [latteReturnRate, setLatteReturnRate] = useState('8')
  const [latteYears, setLatteYears] = useState('20')

  // ==================== MONEY DATE ====================
  const [moneyDateLog, setMoneyDateLog] = useState<any[]>([])
  const [showMoneyDate, setShowMoneyDate] = useState(false)
  const [moneyDateStep, setMoneyDateStep] = useState(0)
  const [moneyDateAnswers, setMoneyDateAnswers] = useState<{[key: number]: string}>({})

  // ==================== ANNUAL REVIEW ====================
  const [annualReviews, setAnnualReviews] = useState<any[]>([])
  const [showAnnualReview, setShowAnnualReview] = useState(false)
  const [annualReviewStep, setAnnualReviewStep] = useState(0)
  const [annualReviewAnswers, setAnnualReviewAnswers] = useState<{[key: number]: string}>({})

  // ==================== SUPER OPTIMIZER ====================
  const [superData, setSuperData] = useState({
    currentBalance: '', currentAge: '', retirementAge: '67',
    employerRate: '11.5', salary: '', extraContribution: '',
    fundFeeRate: '0.8'
  })

  // ==================== NET WORTH HISTORY ====================
  const [netWorthHistory, setNetWorthHistory] = useState<any[]>([])

  // ==================== SPENDING INSIGHTS ====================
  const [spendingInsights, setSpendingInsights] = useState<any[]>([])
  const [loadingSpendingInsights, setLoadingSpendingInsights] = useState(false)

  // ==================== TOUR STATE ====================
  const [showTour, setShowTour] = useState(false)
  const [tourStep, setTourStep] = useState(0)
  const [budgetTourCompleted, setBudgetTourCompleted] = useState(false)

  // ==================== UPLOAD STATE ====================
  const [showPayslipUpload, setShowPayslipUpload] = useState(false)
  const [payslipProcessing, setPayslipProcessing] = useState(false)
  const [extractedPayslip, setExtractedPayslip] = useState<any>(null)
  const payslipInputRef = useRef<HTMLInputElement>(null)

  // ==================== PASSIVE QUEST STATE ====================
  const [activeQuestId, setActiveQuestId] = useState<number | null>(null)
  const [passiveQuests, setPassiveQuests] = useState<any[]>([
    { id: 1, name: 'High-Interest Savings', category: 'beginner', icon: '🏦', description: 'Earn $5-20/mo passive interest on your savings', potentialIncome: '$5-20/mo', difficulty: 'Easy', timeToSetup: '15 mins', status: 'not_started', progress: 0, currentStep: 0, monthlyIncome: 0, steps: [{ title: 'Research accounts', description: 'Compare rates at Up (5%), ING (5.5%), Ubank (5.1%), BOQ (5%)', action: "I'll research savings accounts" }, { title: 'Open account', description: 'Most can be opened online in 10 minutes with just your ID', action: "I've opened my account" }, { title: 'Set up auto-transfer', description: 'Transfer your emergency fund or set up regular deposits', action: 'Money is transferred' }, { title: 'Track your interest', description: 'Watch passive income grow! $10k at 5% = $42/mo', action: 'Complete quest' }], aureusAdvice: 'This is the easiest passive income - your money works while you sleep! With $2,000 at 5%, you\'ll earn about $8/month doing nothing.' },
    { id: 2, name: 'Cashback & Rewards', category: 'beginner', icon: '💳', description: 'Earn cashback on spending you already do', potentialIncome: '$10-50/mo', difficulty: 'Easy', timeToSetup: '20 mins', status: 'not_started', progress: 0, currentStep: 0, monthlyIncome: 0, steps: [{ title: 'Research cards', description: 'Compare: ING Orange (cashback), Bankwest Breeze (rewards), HSBC (points)', action: "I've researched options" }, { title: 'Apply for card', description: 'Choose no annual fee cards to start. Approval takes 1-5 days', action: 'Card approved' }, { title: 'Set as default', description: 'Use for all regular spending - groceries, bills, fuel', action: 'Using the card' }, { title: 'Redeem rewards', description: 'Cash out monthly or let points accumulate for bigger rewards', action: 'Complete quest' }], aureusAdvice: 'The trick is using it for spending you\'d do anyway - NOT spending more to get rewards. That defeats the purpose!' },
    { id: 4, name: 'Dividend ETFs', category: 'intermediate', icon: '📈', description: 'Earn quarterly dividends from Aussie shares', potentialIncome: '$50-200/quarter', difficulty: 'Medium', timeToSetup: '1 hour', status: 'not_started', progress: 0, currentStep: 0, monthlyIncome: 0, steps: [{ title: 'Open brokerage', description: 'Stake ($3/trade), CMC (free under $1k), Pearler (for auto-invest)', action: 'Brokerage opened' }, { title: 'Research ETFs', description: 'VAS (Aussie shares 4%), VHY (high yield 5%), A200 (low fee)', action: 'Picked my ETF' }, { title: 'Make first investment', description: 'Start with $500+. More = more dividends. Consider DRP (reinvest)', action: 'First purchase done' }, { title: 'Set up regular buys', description: 'Automate monthly purchases. Time in market beats timing market', action: 'Complete quest' }], aureusAdvice: 'ETFs are diversified - you own tiny pieces of hundreds of companies. VAS gives you the top 300 Aussie companies in one purchase!' },
    { id: 6, name: 'Side Hustle', category: 'intermediate', icon: '💪', description: 'Turn your skills into extra income', potentialIncome: '$100-1000+/mo', difficulty: 'Medium', timeToSetup: '2-4 hours', status: 'not_started', progress: 0, currentStep: 0, monthlyIncome: 0, steps: [{ title: 'Identify skills', description: 'What can you do? Cleaning, handyman, tutoring, design, writing, driving?', action: 'Found my skill' }, { title: 'Create profile', description: 'Airtasker, Fiverr, Uber, DoorDash, Tutoring platforms', action: 'Profile created' }, { title: 'Complete first job', description: 'Start cheap to get reviews, then raise prices', action: 'First job done' }, { title: 'Scale up', description: 'Get regular clients, increase rates, optimize your time', action: 'Complete quest' }], aureusAdvice: 'Side hustles aren\'t passive at first, but some can become semi-passive with systems and repeat clients!' },
  ])

  // ==================== BUDGET STATE ====================
  const [incomeStreams, setIncomeStreams] = useState<any[]>([])
  const [newIncome, setNewIncome] = useState({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0] })
  const [expenses, setExpenses] = useState<any[]>([])
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', frequency: 'monthly', category: 'other', dueDate: new Date().toISOString().split('T')[0] })
  const [debts, setDebts] = useState<any[]>([])
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: new Date().toISOString().split('T')[0] })
  const [payoffMethod, setPayoffMethod] = useState<'snowball' | 'avalanche'>('avalanche')
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

  // Edit State
  const [editingItem, setEditingItem] = useState<{type: string, id: number, data: any} | null>(null)

  // Home Buying Guide State
  const [homeGuideExpanded, setHomeGuideExpanded] = useState<string | null>(null)

  // Roadmap
  const [roadmapMilestones, setRoadmapMilestones] = useState<any[]>([])
  const [showAddMilestone, setShowAddMilestone] = useState(false)
  const [newMilestone, setNewMilestone] = useState({ name: '', targetAmount: '', targetDate: '', category: 'savings', icon: '🎯', notes: '' })
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null)
  const [generatingPlanFor, setGeneratingPlanFor] = useState<number | null>(null)
  const [quickAddMilestone, setQuickAddMilestone] = useState<{name: string, icon: string, targetAmount: string, notes: string} | null>(null)

  // Documents
  const [documents, setDocuments] = useState<any[]>([])
  const [showDocUpload, setShowDocUpload] = useState(false)
  const docInputRef = useRef<HTMLInputElement>(null)

  // Country
  const [userCountry, setUserCountry] = useState<'AU' | 'US' | 'UK' | 'NZ' | 'CA'>('AU')

  // AI State
  const [budgetMemory, setBudgetMemory] = useState<any>({ name: '', onboardingComplete: false, financialPath: '', bigGoals: {}, lifeEvents: [], patterns: [], preferences: { communicationStyle: 'direct', checkInFrequency: 'when-needed', motivators: [] }, currentStep: 'Baby Step 1', notes: [] })
  const [budgetOnboarding, setBudgetOnboarding] = useState({ isActive: false, step: 'greeting' })
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBabyStep, setSelectedBabyStep] = useState<number | null>(null)

  // Presets
  const [showPresets, setShowPresets] = useState(false)

  // Misc
  const moneyQuotes = [
    { quote: "The goal isn't more money. The goal is living life on your terms.", author: "Chris Brogan" },
    { quote: "Do not save what is left after spending; spend what is left after saving.", author: "Warren Buffett" },
    { quote: "A budget is telling your money where to go instead of wondering where it went.", author: "Dave Ramsey" },
    { quote: "Compound interest is the eighth wonder of the world.", author: "Albert Einstein" },
    { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  ]
  const [currentQuote] = useState(() => moneyQuotes[Math.floor(Math.random() * moneyQuotes.length)])

  // ==================== NEW: WINS & ACCOUNTABILITY STATE ====================
  const [wins, setWins] = useState<any[]>([])
  const [newWinText, setNewWinText] = useState('')
  const [streak, setStreak] = useState(0)
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null)
  const [showWeeklyCheckIn, setShowWeeklyCheckIn] = useState(false)
  const [checkInStep, setCheckInStep] = useState(0)
  const [checkInAnswers, setCheckInAnswers] = useState<{[key: number]: string}>({})
  const [whyStatement, setWhyStatement] = useState('')
  const [editingWhy, setEditingWhy] = useState(false)
  const [whyDraft, setWhyDraft] = useState('')
  const [celebrationWin, setCelebrationWin] = useState<string | null>(null)
  const [prevNetWorth, setPrevNetWorth] = useState<number | null>(null)

  // ==================== NEW: FINANCIAL LITERACY STATE ====================
  const [learnExpanded, setLearnExpanded] = useState<string | null>(null)

  // ==================== NEW: MORTGAGE ACCELERATOR STATE ====================
  const [mortgageAccel, setMortgageAccel] = useState({
    balance: '',
    rate: '',
    remainingYears: '',
    currentRepayment: '',
    repaymentFrequency: 'fortnightly',
    extraRepayment: '',
    offsetBalance: ''
  })
  const [mortgageTab, setMortgageTab] = useState<'calculator' | 'offset' | 'strategy'>('calculator')

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
    purple: '#8b5cf6',
    teal: '#14b8a6',
    orange: '#f97316'
  }

  const inputStyle: React.CSSProperties = { padding: '10px 14px', border: '2px solid ' + theme.inputBorder, borderRadius: '8px', fontSize: '14px', background: theme.input, color: theme.text, outline: 'none' }
  const btnPrimary: React.CSSProperties = { padding: '10px 20px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }
  const btnSuccess: React.CSSProperties = { ...btnPrimary, background: theme.success }
  const btnDanger: React.CSSProperties = { ...btnPrimary, background: theme.danger }
  const btnWarning: React.CSSProperties = { ...btnPrimary, background: theme.warning }
  const btnPurple: React.CSSProperties = { ...btnPrimary, background: theme.purple }
  const cardStyle: React.CSSProperties = { padding: '24px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }

  const countryConfig: {[key: string]: any} = {
    AU: { name: 'Australia', flag: '🇦🇺', currency: 'AUD', currencySymbol: '$', retirement: 'Superannuation (Super)', benefits: 'Centrelink', payFrequency: 'fortnightly', terminology: { retirement: 'Super', benefits: 'Centrelink' } },
    US: { name: 'United States', flag: '🇺🇸', currency: 'USD', currencySymbol: '$', retirement: '401(k), IRA', benefits: 'Social Security', payFrequency: 'biweekly', terminology: { retirement: '401k/IRA', benefits: 'Social Security' } },
    UK: { name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', currencySymbol: '£', retirement: 'Pension, SIPP, ISA', benefits: 'Universal Credit', payFrequency: 'monthly', terminology: { retirement: 'Pension', benefits: 'Universal Credit' } },
    NZ: { name: 'New Zealand', flag: '🇳🇿', currency: 'NZD', currencySymbol: '$', retirement: 'KiwiSaver', benefits: 'Work and Income NZ', payFrequency: 'fortnightly', terminology: { retirement: 'KiwiSaver', benefits: 'WINZ' } },
    CA: { name: 'Canada', flag: '🇨🇦', currency: 'CAD', currencySymbol: '$', retirement: 'RRSP, TFSA', benefits: 'EI, CPP', payFrequency: 'biweekly', terminology: { retirement: 'RRSP/TFSA', benefits: 'EI' } }
  }
  const currentCountryConfig = countryConfig[userCountry]

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

  // ==================== LOCAL STORAGE ====================
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
      if (data.budgetMemory) setBudgetMemory(data.budgetMemory)
      if (data.paidOccurrences) setPaidOccurrences(new Set(data.paidOccurrences))
      if (data.roadmapMilestones) setRoadmapMilestones(data.roadmapMilestones)
      if (data.documents) setDocuments(data.documents)
      if (data.moneyPersonality) setMoneyPersonality(data.moneyPersonality)
      if (data.identityStatements) setIdentityStatements(data.identityStatements)
      if (data.deepWhyAnswers) setDeepWhyAnswers(data.deepWhyAnswers)
      if (data.deepWhyComplete) setDeepWhyComplete(data.deepWhyComplete)
      if (data.fearAuditAnswers) setFearAuditAnswers(data.fearAuditAnswers)
      if (data.fearAuditComplete) setFearAuditComplete(data.fearAuditComplete)
      if (data.onboardingComplete) setOnboardingComplete(data.onboardingComplete)
      if (data.proactiveInsights) setProactiveInsights(data.proactiveInsights)
      if (data.insightsGeneratedAt) setInsightsGeneratedAt(data.insightsGeneratedAt)
      if (data.oneDecision) setOneDecision(data.oneDecision)
      if (data.oneDecisionDate) setOneDecisionDate(data.oneDecisionDate)
      if (data.latteItems) setLatteItems(data.latteItems)
      if (data.moneyDateLog) setMoneyDateLog(data.moneyDateLog)
      if (data.annualReviews) setAnnualReviews(data.annualReviews)
      if (data.superData) setSuperData(data.superData)
      if (data.netWorthHistory) setNetWorthHistory(data.netWorthHistory)
      if (data.personalityAnswers) setPersonalityAnswers(data.personalityAnswers)
      // Show onboarding for new users
      if (!data.onboardingComplete) setShowOnboarding(true)
      if (data.budgetOnboarding) setBudgetOnboarding(data.budgetOnboarding)
      if (data.chatMessages) setChatMessages(data.chatMessages)
      if (data.userCountry) setUserCountry(data.userCountry)
      // New fields
      if (data.wins) setWins(data.wins)
      if (data.streak !== undefined) setStreak(data.streak)
      if (data.lastCheckIn) setLastCheckIn(data.lastCheckIn)
      if (data.whyStatement) setWhyStatement(data.whyStatement)
      if (data.mortgageAccel) setMortgageAccel(data.mortgageAccel)
    }
  }, [])

  useEffect(() => {
    const data = {
      incomeStreams, expenses, debts, goals, assets, liabilities,
      budgetMemory, paidOccurrences: Array.from(paidOccurrences),
      roadmapMilestones, budgetOnboarding, chatMessages, userCountry,
      wins, streak, lastCheckIn, whyStatement, mortgageAccel, documents,
      moneyPersonality, identityStatements, deepWhyAnswers, deepWhyComplete,
      fearAuditAnswers, fearAuditComplete, onboardingComplete, proactiveInsights,
      insightsGeneratedAt, oneDecision, oneDecisionDate, latteItems, moneyDateLog,
      annualReviews, superData, netWorthHistory, personalityAnswers
    }
    localStorage.setItem('aureus_data', JSON.stringify(data))
  }, [incomeStreams, expenses, debts, goals, assets, liabilities, budgetMemory, paidOccurrences, roadmapMilestones, budgetOnboarding, chatMessages, userCountry, wins, streak, lastCheckIn, whyStatement, mortgageAccel, documents, moneyPersonality, identityStatements, deepWhyAnswers, deepWhyComplete, fearAuditAnswers, fearAuditComplete, onboardingComplete, proactiveInsights, insightsGeneratedAt, oneDecision, oneDecisionDate, latteItems, moneyDateLog, annualReviews, superData, netWorthHistory, personalityAnswers])

  // Chat scroll
  const chatContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  // ==================== CALCULATIONS ====================
  const convertToMonthly = (amount: number, frequency: string) => {
    if (frequency === 'weekly') return amount * 4
    if (frequency === 'fortnightly') return amount * 2
    if (frequency === 'quarterly') return amount / 3
    if (frequency === 'yearly') return amount / 12
    return amount
  }

  const monthlyIncome = incomeStreams.reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || '0'), inc.frequency), 0)
  const passiveIncome = incomeStreams.filter(i => i.type === 'passive').reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || '0'), inc.frequency), 0)
  const monthlyExpenses = expenses.filter(e => !e.targetDebtId && !e.targetGoalId && !e.isDebtPayment).reduce((sum, exp) => sum + convertToMonthly(parseFloat(exp.amount || '0'), exp.frequency), 0)
  const monthlyDebtPayments = debts.reduce((sum, debt) => sum + convertToMonthly(parseFloat(debt.minPayment || '0'), debt.frequency || 'monthly'), 0)
  const monthlyGoalSavings = goals.reduce((sum, goal) => sum + convertToMonthly(parseFloat(goal.paymentAmount || '0'), goal.savingsFrequency || 'monthly'), 0)
  const totalDebtBalance = debts.reduce((sum, d) => sum + parseFloat(d.balance || '0'), 0)
  const totalOutgoing = monthlyExpenses + monthlyDebtPayments + monthlyGoalSavings
  const monthlySurplus = monthlyIncome - totalOutgoing
  const totalAssets = assets.reduce((sum, a) => sum + parseFloat(a.value || '0'), 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + parseFloat(l.value || '0'), 0)
  const netWorth = totalAssets - totalLiabilities - totalDebtBalance
  const savingsRate = monthlyIncome > 0 ? (monthlySurplus / monthlyIncome * 100) : 0
  const passiveCoverage = monthlyExpenses > 0 ? (passiveIncome / monthlyExpenses * 100) : 0
  const emergencyFund = assets.filter(a => a.type === 'savings').reduce((s, a) => s + parseFloat(a.value || '0'), 0)
  const emergencyMonths = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0
  const totalPassiveQuestIncome = passiveQuests.filter(q => q.status === 'completed').reduce((sum, q) => sum + q.monthlyIncome, 0)

  const capitalEfficiencyRatio = monthlyIncome > 0 ? ((monthlyGoalSavings + passiveIncome) / monthlyIncome) * 100 : 0
  const riskManagementFactor = Math.min(emergencyMonths / 6, 1)
  const liquidAssets = assets.filter(a => a.type === 'savings' || a.type === 'investment').reduce((s, a) => s + parseFloat(a.value || '0'), 0)
  const illiquidAssets = assets.filter(a => a.type === 'property' || a.type === 'vehicle').reduce((s, a) => s + parseFloat(a.value || '0'), 0)
  const liquidityFactor = (liquidAssets + illiquidAssets) > 0 ? liquidAssets / (liquidAssets + illiquidAssets) : 0
  const assetTypes = [...new Set(assets.map(a => a.type))]
  const allocationDiversityScore = Math.min(((incomeStreams.length * 15) + (assetTypes.length * 20)), 100)
  const debtToIncomeRatio = monthlyIncome > 0 ? monthlyDebtPayments / monthlyIncome : 0
  const financialHealthScore = Math.round(
    (capitalEfficiencyRatio * 0.25) + (riskManagementFactor * 100 * 0.25) +
    (liquidityFactor * 100 * 0.2) + (allocationDiversityScore * 0.15) +
    ((100 - debtToIncomeRatio * 100) * 0.15)
  )

  // Baby Steps
  const australianBabySteps = [
    { step: 1, title: 'Starter Emergency Fund', desc: 'Save $2,000 for emergencies', target: 2000, icon: '🛡️', aureusAdvice: "This $2,000 is your financial airbag - it stops you going into debt when life throws curveballs.", tips: ["Open a separate savings account", "Set up automatic transfers on payday", "Use a high-interest account", "Don't touch it except for TRUE emergencies"] },
    { step: 2, title: 'Kill Bad Debt', desc: 'Pay off credit cards, personal loans, BNPL', icon: '💳', aureusAdvice: "Credit cards at 20%+ interest will DESTROY your wealth. Every $1,000 in CC debt costs you $200/year in interest.", tips: ["List all debts: CC, personal loans, Afterpay, Zip", "DON'T include: HECS/HELP, mortgage", "Avalanche: Pay highest interest first", "Snowball: Pay smallest balance first"] },
    { step: 3, title: 'Full Emergency Fund', desc: '3-6 months expenses saved', icon: '🏦', aureusAdvice: "Now we're building real security. 3-6 months of expenses means you could lose your job and be FINE.", tips: ["Calculate your monthly expenses", "Multiply by 3 (secure job) or 6 (unstable income)", "This money should be BORING - high-interest savings"] },
    { step: 4, title: 'Invest 15% + Super', desc: 'Salary sacrifice + investments', icon: '📈', aureusAdvice: "Your employer already puts 11.5% into super - that's forced savings! Now add salary sacrifice for tax benefits.", tips: ["Check your super fund - fees matter!", "Consider salary sacrifice: $100/fortnight saves ~$30 in tax", "Outside super: ETFs like VAS, VDHG through Stake/CMC"] },
    { step: 5, title: 'Home Deposit', desc: 'Save 10-20% for your home', icon: '🏠', aureusAdvice: "Aussie dream! But it's a marathon, not a sprint. Let me break down the REAL costs.", tips: ["5% deposit possible with First Home Guarantee", "10% deposit = pay LMI (~$8-15k)", "20% deposit = no LMI, better rates"] },
    { step: 6, title: 'Accelerate Your Mortgage', desc: 'Pay it off in 7-10 years, not 30', icon: '🚀', aureusAdvice: "This is where the magic happens. Extra repayments in the early years save you TEN TIMES that amount in interest.", tips: ["Use the Mortgage Accelerator tab to see your exact savings", "Even $200/fortnight extra can cut 8 years off a 30-year loan", "Offset account = money beside the loan, not locked inside it", "Switch to fortnightly payments — it adds one extra month per year"] },
    { step: 7, title: 'Build Wealth & Give', desc: 'Invest, enjoy, and be generous', icon: '💎', aureusAdvice: "You've made it! No bad debt, emergency fund solid, home sorted, investing humming.", tips: ["Max out super contributions", "Build passive income streams", "Give to causes you care about"] }
  ]

  const getBabyStep = () => {
    const badDebt = debts.filter(d => parseFloat(d.interestRate || '0') > 5)
    const mortgageDebt = debts.filter(d => d.name?.toLowerCase().includes('mortgage'))
    const monthlyExpenses3 = monthlyExpenses * 3
    if (emergencyFund < 2000) return { step: 1, title: 'Starter Emergency Fund', desc: 'Save $2,000 for emergencies', progress: (emergencyFund / 2000) * 100, icon: '🛡️', target: 2000, current: emergencyFund }
    if (badDebt.length > 0) { const totalBadDebt = badDebt.reduce((s, d) => s + parseFloat(d.balance || '0'), 0); return { step: 2, title: 'Kill Bad Debt', desc: 'Pay off credit cards, personal loans, BNPL', progress: 0, icon: '💳', target: totalBadDebt, current: 0, debts: badDebt } }
    if (emergencyFund < monthlyExpenses3) return { step: 3, title: 'Full Emergency Fund', desc: '3-6 months expenses saved', progress: (emergencyFund / monthlyExpenses3) * 100, icon: '🏦', target: monthlyExpenses3, current: emergencyFund }
    const investmentGoalMet = passiveIncome > 0 || assets.filter(a => a.type === 'investment').length > 0
    if (!investmentGoalMet) return { step: 4, title: 'Invest 15% + Super', desc: 'Salary sacrifice + investments', progress: 50, icon: '📈', target: monthlyIncome * 0.15, current: 0 }
    if (mortgageDebt.length === 0 && !assets.some(a => a.type === 'property')) { const depositGoal = 100000; const currentDeposit = assets.filter(a => a.name?.toLowerCase().includes('deposit') || a.name?.toLowerCase().includes('house')).reduce((s, a) => s + parseFloat(a.value || '0'), 0); return { step: 5, title: 'Home Deposit', desc: 'Save 10-20% for your home', progress: (currentDeposit / depositGoal) * 100, icon: '🏠', target: depositGoal, current: currentDeposit } }
    if (mortgageDebt.length > 0) { const mortgageBalance = mortgageDebt.reduce((s, d) => s + parseFloat(d.balance || '0'), 0); return { step: 6, title: 'Accelerate Your Mortgage', desc: 'Pay it off in 7-10 years, not 30', progress: 0, icon: '🚀', target: mortgageBalance, current: 0 } }
    return { step: 7, title: 'Build Wealth & Give', desc: 'Invest, enjoy, and be generous', progress: 100, icon: '💎', target: 0, current: 0 }
  }
  const currentBabyStep = getBabyStep()

  const fiPath = {
    monthlyNeed: totalOutgoing,
    passiveGap: totalOutgoing - passiveIncome,
    passiveCoverage,
    fireNumber: (totalOutgoing * 12) * 25,
    currentInvestments: assets.filter(a => a.type === 'investment').reduce((sum, a) => sum + parseFloat(a.value || '0'), 0),
    yearsToFI: monthlySurplus > 0 ? Math.ceil(((totalOutgoing * 12) * 25) / (monthlySurplus * 12)) : 999
  }

  // ==================== NEW: MORTGAGE ACCELERATOR CALCULATION ====================

  // Helper: calculate the standard repayment for a given balance, rate, term, freq
  const calcStandardRepayment = (bal: number, annualRate: number, years: number, freq: number): number => {
    if (bal <= 0 || annualRate <= 0 || years <= 0) return 0
    const r = annualRate / freq
    const n = years * freq
    if (r === 0) return bal / n
    return (bal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  }

  const calculateMortgagePayoff = () => {
    const balance = parseFloat(mortgageAccel.balance || '0')
    const annualRate = parseFloat(mortgageAccel.rate || '0') / 100
    const remainingYears = parseFloat(mortgageAccel.remainingYears || '0')
    const extra = parseFloat(mortgageAccel.extraRepayment || '0')
    const offset = parseFloat(mortgageAccel.offsetBalance || '0')
    const freq = mortgageAccel.repaymentFrequency === 'weekly' ? 52 : mortgageAccel.repaymentFrequency === 'fortnightly' ? 26 : 12
    const freqLabel = mortgageAccel.repaymentFrequency === 'weekly' ? 'week' : mortgageAccel.repaymentFrequency === 'fortnightly' ? 'fortnight' : 'month'

    if (balance <= 0 || annualRate <= 0) return null

    // Derive repayment: use entered value if provided, else calculate from term
    let repayment = parseFloat(mortgageAccel.currentRepayment || '0')
    const derivedRepayment = remainingYears > 0 ? calcStandardRepayment(balance, annualRate, remainingYears, freq) : 0

    // If no manual repayment entered but we have a term, use derived
    if (repayment <= 0 && derivedRepayment > 0) repayment = derivedRepayment
    if (repayment <= 0) return null

    const periodRate = annualRate / freq
    const effectiveBalance = Math.max(balance - offset, 0)

    // Sanity check: flag if repayment seems implausibly high
    // (more than 3x the minimum for a 30yr loan = probably entered monthly as fortnightly)
    const minFortnightly30yr = calcStandardRepayment(balance, annualRate, 30, freq)
    const repaymentSeemsHigh = repayment > minFortnightly30yr * 2.5

    const calcPeriods = (bal: number, pmt: number, r: number): number => {
      if (pmt <= bal * r) return Infinity
      return Math.log(pmt / (pmt - bal * r)) / Math.log(1 + r)
    }

    const periodsStandard = calcPeriods(balance, repayment, periodRate)
    const periodsOffset = calcPeriods(effectiveBalance, repayment, periodRate)
    const periodsExtra = calcPeriods(balance, repayment + extra, periodRate)
    const periodsBoth = calcPeriods(effectiveBalance, repayment + extra, periodRate)

    const interestStandard = repayment * periodsStandard - balance
    const interestOffset = repayment * periodsOffset - effectiveBalance
    const interestExtra = (repayment + extra) * periodsExtra - balance
    const interestBoth = (repayment + extra) * periodsBoth - effectiveBalance

    const yearsStandard = periodsStandard / freq
    const yearsOffset = periodsOffset / freq
    const yearsExtra = periodsExtra / freq
    const yearsBoth = periodsBoth / freq

    const nowYear = new Date().getFullYear()

    return {
      repaymentUsed: repayment,
      derivedRepayment,
      freqLabel,
      freq,
      repaymentSeemsHigh,
      minRepayment30yr: minFortnightly30yr,
      standard: { years: yearsStandard, interest: interestStandard, freeYear: nowYear + Math.ceil(yearsStandard) },
      withOffset: { years: yearsOffset, interest: interestOffset, freeYear: nowYear + Math.ceil(yearsOffset), yearsSaved: yearsStandard - yearsOffset, interestSaved: interestStandard - interestOffset },
      withExtra: { years: yearsExtra, interest: interestExtra, freeYear: nowYear + Math.ceil(yearsExtra), yearsSaved: yearsStandard - yearsExtra, interestSaved: interestStandard - interestExtra },
      withBoth: { years: yearsBoth, interest: interestBoth, freeYear: nowYear + Math.ceil(yearsBoth), yearsSaved: yearsStandard - yearsBoth, interestSaved: interestStandard - interestBoth }
    }
  }

  // ==================== NEW: AUTO WIN DETECTION ====================
  const detectAutoWins = useCallback(() => {
    const newWinsList: any[] = []
    const existingTitles = wins.map(w => w.title)

    if (incomeStreams.length >= 1 && !existingTitles.includes('First income added')) newWinsList.push({ id: Date.now() + 1, title: 'First income added', desc: 'You set up your financial picture — that\'s step one!', icon: '💰', auto: true, date: new Date().toISOString() })
    if (monthlySurplus > 0 && incomeStreams.length > 0 && !existingTitles.includes('Positive monthly surplus')) newWinsList.push({ id: Date.now() + 2, title: 'Positive monthly surplus', desc: `You have $${monthlySurplus.toFixed(0)}/month left over — that's money working for you.`, icon: '🟢', auto: true, date: new Date().toISOString() })
    if (savingsRate >= 20 && !existingTitles.includes('20% savings rate achieved')) newWinsList.push({ id: Date.now() + 3, title: '20% savings rate achieved', desc: `You're saving ${savingsRate.toFixed(0)}% of your income — well above the average Australian!`, icon: '🏆', auto: true, date: new Date().toISOString() })
    if (emergencyFund >= 2000 && !existingTitles.includes('Starter emergency fund complete')) newWinsList.push({ id: Date.now() + 4, title: 'Starter emergency fund complete', desc: 'Your $2,000 financial airbag is in place. You\'re protected.', icon: '🛡️', auto: true, date: new Date().toISOString() })
    if (emergencyMonths >= 3 && !existingTitles.includes('3-month emergency fund reached')) newWinsList.push({ id: Date.now() + 5, title: '3-month emergency fund reached', desc: `${emergencyMonths.toFixed(1)} months of expenses saved — that's real security.`, icon: '🏦', auto: true, date: new Date().toISOString() })
    if (netWorth > 0 && !existingTitles.includes('Positive net worth')) newWinsList.push({ id: Date.now() + 6, title: 'Positive net worth', desc: `You own more than you owe. Net worth: $${netWorth.toLocaleString()}`, icon: '📈', auto: true, date: new Date().toISOString() })
    if (goals.some(g => parseFloat(g.saved || '0') >= parseFloat(g.target || '1')) && !existingTitles.includes('First goal completed')) newWinsList.push({ id: Date.now() + 7, title: 'First goal completed', desc: 'You set a target and hit it. That\'s what financial discipline looks like.', icon: '🎯', auto: true, date: new Date().toISOString() })
    if (debts.length === 0 && wins.some(w => w.title === 'First income added') && !existingTitles.includes('Debt free!')) newWinsList.push({ id: Date.now() + 8, title: 'Debt free!', desc: 'No debts on record. You\'re building on solid ground.', icon: '🎉', auto: true, date: new Date().toISOString() })
    if (assets.some(a => a.type === 'investment') && !existingTitles.includes('First investment added')) newWinsList.push({ id: Date.now() + 9, title: 'First investment added', desc: 'You\'ve started building your investment portfolio. Compounding begins now.', icon: '🌱', auto: true, date: new Date().toISOString() })
    if (roadmapMilestones.length >= 1 && !existingTitles.includes('Roadmap created')) newWinsList.push({ id: Date.now() + 10, title: 'Roadmap created', desc: 'You\'ve mapped your financial future — clarity is power.', icon: '🗺️', auto: true, date: new Date().toISOString() })

    if (newWinsList.length > 0) {
      setWins(prev => [...prev, ...newWinsList])
      setCelebrationWin(newWinsList[0].title)
      setTimeout(() => setCelebrationWin(null), 4000)
    }
  }, [incomeStreams, monthlySurplus, savingsRate, emergencyFund, emergencyMonths, netWorth, goals, debts, assets, roadmapMilestones, wins])

  useEffect(() => {
    if (incomeStreams.length > 0) detectAutoWins()
  }, [incomeStreams, debts, assets, goals, netWorth])

  // ==================== CHECK-IN LOGIC ====================
  const checkInQuestions = [
    { q: "Did you stick to your budget this week?", type: 'yesno' },
    { q: "Did you make any unplanned purchases over $100?", type: 'yesno' },
    { q: "Did you make any extra debt or mortgage payments?", type: 'yesno' },
    { q: "How stressed did you feel about money this week? (1 = none, 5 = very)", type: 'scale' },
    { q: "What's one financial win from this week, no matter how small?", type: 'text' }
  ]

  const submitCheckIn = () => {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const newStreak = lastCheckIn === yesterday || lastCheckIn === today ? streak + 1 : 1
    setStreak(newStreak)
    setLastCheckIn(today)
    if (checkInAnswers[4]) {
      const manualWin = { id: Date.now(), title: checkInAnswers[4], desc: 'From your weekly check-in', icon: '⭐', auto: false, date: new Date().toISOString() }
      setWins(prev => [...prev, manualWin])
    }
    setShowWeeklyCheckIn(false)
    setCheckInStep(0)
    setCheckInAnswers({})
    setCelebrationWin(`Week ${newStreak} check-in complete! 🔥 ${newStreak > 1 ? `${newStreak}-week streak!` : 'Streak started!'}`)
    setTimeout(() => setCelebrationWin(null), 4000)
  }

  // ==================== CALENDAR FUNCTIONS ====================
  const getDaysInMonth = () => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    return { firstDay: new Date(year, month, 1).getDay(), daysInMonth: new Date(year, month + 1, 0).getDate(), month, year }
  }

  const shouldShowItem = (startDate: string, frequency: string, day: number, month: number, year: number) => {
    if (!startDate) return frequency === 'monthly' && day === 1
    const parts = startDate.split('-')
    if (parts.length !== 3) return false
    const start = { year: parseInt(parts[0]), month: parseInt(parts[1]) - 1, day: parseInt(parts[2]) }
    const startTime = new Date(start.year, start.month, start.day).getTime()
    const checkTime = new Date(year, month, day).getTime()
    if (startTime > checkTime) return false
    if (frequency === 'once') return start.day === day && start.month === month && start.year === year
    if (frequency === 'monthly') return start.day === day
    if (frequency === 'weekly') { const d = Math.floor((checkTime - startTime) / 86400000); return d >= 0 && d % 7 === 0 }
    if (frequency === 'fortnightly') { const d = Math.floor((checkTime - startTime) / 86400000); return d >= 0 && d % 14 === 0 }
    if (frequency === 'quarterly') return start.day === day && (month - start.month + 12) % 3 === 0
    if (frequency === 'yearly') return start.day === day && start.month === month
    return false
  }

  const getCalendarItemsForDay = (day: number) => {
    const { month, year } = getDaysInMonth()
    const items: any[] = []
    incomeStreams.forEach(inc => { if (shouldShowItem(inc.startDate, inc.frequency, day, month, year)) { const id = `inc-${inc.id}-${year}-${month}-${day}`; items.push({ ...inc, itemId: id, itemType: 'income', isPaid: paidOccurrences.has(id) }) } })
    expenses.filter(e => !e.targetDebtId && !e.targetGoalId).forEach(exp => { if (shouldShowItem(exp.dueDate, exp.frequency, day, month, year)) { const id = `exp-${exp.id}-${year}-${month}-${day}`; items.push({ ...exp, itemId: id, itemType: 'expense', isPaid: paidOccurrences.has(id) }) } })
    debts.forEach(debt => { if (shouldShowItem(debt.paymentDate, debt.frequency || 'monthly', day, month, year)) { const id = `debt-${debt.id}-${year}-${month}-${day}`; items.push({ ...debt, amount: debt.minPayment, itemId: id, itemType: 'debt', isPaid: paidOccurrences.has(id) }) } })
    return items
  }

  const togglePaid = (itemId: string) => {
    const newPaid = new Set(paidOccurrences)
    if (newPaid.has(itemId)) newPaid.delete(itemId)
    else newPaid.add(itemId)
    setPaidOccurrences(newPaid)
  }

  // ==================== EDIT FUNCTIONS ====================
  const startEdit = (type: string, item: any) => setEditingItem({ type, id: item.id, data: { ...item } })
  const cancelEdit = () => setEditingItem(null)
  const saveEdit = () => {
    if (!editingItem) return
    const { type, id, data } = editingItem
    switch (type) {
      case 'income': setIncomeStreams(prev => prev.map(item => item.id === id ? { ...item, ...data } : item)); break
      case 'expense': setExpenses(prev => prev.map(item => item.id === id ? { ...item, ...data } : item)); break
      case 'debt': setDebts(prev => prev.map(item => item.id === id ? { ...item, ...data } : item)); break
      case 'goal': setGoals(prev => prev.map(item => item.id === id ? { ...item, ...data } : item)); break
    }
    setEditingItem(null)
  }
  const updateEditField = (field: string, value: string) => { if (!editingItem) return; setEditingItem({ ...editingItem, data: { ...editingItem.data, [field]: value } }) }

  // ==================== CRUD ====================
  const addIncome = () => { if (!newIncome.name || !newIncome.amount) return; setIncomeStreams([...incomeStreams, { ...newIncome, id: Date.now() }]); setNewIncome({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0] }) }
  const deleteIncome = (id: number) => setIncomeStreams(incomeStreams.filter(i => i.id !== id))
  const addExpense = () => { if (!newExpense.name || !newExpense.amount) return; setExpenses([...expenses, { ...newExpense, id: Date.now() }]); setNewExpense({ name: '', amount: '', frequency: 'monthly', category: 'other', dueDate: new Date().toISOString().split('T')[0] }) }
  const deleteExpense = (id: number) => setExpenses(expenses.filter(e => e.id !== id))
  const addDebt = () => { if (!newDebt.name || !newDebt.balance) return; setDebts([...debts, { ...newDebt, id: Date.now(), originalBalance: newDebt.balance }]); setNewDebt({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: new Date().toISOString().split('T')[0] }) }
  const deleteDebt = (id: number) => setDebts(debts.filter(d => d.id !== id))
  const addGoal = () => { if (!newGoal.name || !newGoal.target) return; setGoals([...goals, { ...newGoal, id: Date.now() }]); setNewGoal({ name: '', target: '', saved: '0', deadline: '', savingsFrequency: 'monthly', startDate: new Date().toISOString().split('T')[0], paymentAmount: '' }) }
  const deleteGoal = (id: number) => setGoals(goals.filter(g => g.id !== id))
  const addAsset = () => { if (!newAsset.name || !newAsset.value) return; setAssets([...assets, { ...newAsset, id: Date.now() }]); setNewAsset({ name: '', value: '', type: 'savings' }) }
  const deleteAsset = (id: number) => setAssets(assets.filter(a => a.id !== id))
  const addLiability = () => { if (!newLiability.name || !newLiability.value) return; setLiabilities([...liabilities, { ...newLiability, id: Date.now() }]); setNewLiability({ name: '', value: '', type: 'loan' }) }

  // ==================== AUTOMATION CALCULATOR ====================
  const calculateAutomation = () => {
    const payFrequency = incomeStreams[0]?.frequency || 'fortnightly'
    const payAmount = parseFloat(incomeStreams[0]?.amount || '0')
    const convertToPayPeriod = (amount: number, freq: string) => {
      if (freq === payFrequency) return amount
      if (payFrequency === 'fortnightly') { if (freq === 'weekly') return amount * 2; if (freq === 'monthly') return amount / 2 }
      if (payFrequency === 'weekly') { if (freq === 'fortnightly') return amount / 2; if (freq === 'monthly') return amount / 4 }
      if (payFrequency === 'monthly') { if (freq === 'weekly') return amount * 4; if (freq === 'fortnightly') return amount * 2 }
      return amount
    }
    const billsTotal = expenses.filter(e => !e.targetDebtId && !e.targetGoalId).reduce((sum, exp) => sum + convertToPayPeriod(parseFloat(exp.amount || '0'), exp.frequency), 0)
    const debtTotal = debts.reduce((sum, debt) => sum + convertToPayPeriod(parseFloat(debt.minPayment || '0'), debt.frequency || 'monthly'), 0)
    const billsBucket = billsTotal + debtTotal
    const savingsBucket = goals.reduce((sum, goal) => sum + convertToPayPeriod(parseFloat(goal.paymentAmount || '0'), goal.savingsFrequency || 'monthly'), 0)
    const spendingBucket = payAmount - billsBucket - savingsBucket
    return { payFrequency, payAmount, bills: { total: billsBucket, breakdown: expenses.filter(e => !e.targetDebtId && !e.targetGoalId).map(e => ({ name: e.name, amount: convertToPayPeriod(parseFloat(e.amount || '0'), e.frequency) })) }, savings: { total: savingsBucket, breakdown: goals.map(g => ({ name: g.name, amount: convertToPayPeriod(parseFloat(g.paymentAmount || '0'), g.savingsFrequency || 'monthly') })) }, spending: spendingBucket }
  }

  // ==================== AUSTRALIAN HOME DATA ====================
  const australianHomeData = {
    stampDuty: {
      NSW: { firstHome: 'Exempt up to $800k (concession to $1M)', investor: '~4-5.5% of purchase price' },
      VIC: { firstHome: 'Exempt up to $600k (concession to $750k)', investor: '~5.5% of purchase price' },
      QLD: { firstHome: 'Concession up to $550k, exempt for new builds', investor: '~3.5-5.75%' },
      WA:  { firstHome: 'Exempt up to $430k', investor: '~4-5.15%' },
      SA:  { firstHome: 'Exempt up to $650k (new) or no exemption (existing)', investor: '~4-5.5%' }
    },
    firstHomeBuyerGrants: {
      federal: '$15,000 First Home Owner Grant (new builds only)',
      NSW: '$10,000 FHOG (new builds up to $600k)',
      VIC: '$10,000 FHOG (new builds up to $750k)',
      QLD: '$30,000 FHOG (new builds)',
      WA:  '$10,000 FHOG (new builds up to $750k)',
      SA:  '$15,000 FHOG (new builds)'
    },
    schemes: [
      { name: 'First Home Guarantee', description: 'Buy with 5% deposit, no LMI. 35,000 places/year.' },
      { name: 'Regional First Home Guarantee', description: 'Same but for regional areas. 10,000 places/year.' },
      { name: 'Family Home Guarantee', description: 'Single parents can buy with 2% deposit.' },
      { name: 'Help to Buy', description: 'Govt co-owns up to 40% of your home — reduces deposit & repayments.' },
      { name: 'First Home Super Saver', description: 'Withdraw up to $50k from super for deposit (voluntary contributions only).' }
    ],
    lmi: {
      description: "Lender's Mortgage Insurance — protects the BANK if you default. You pay it.",
      cost: '1-4% of loan amount if deposit is under 20%',
      avoid: 'Save 20% deposit, use guarantor, or use First Home Guarantee'
    }
  }

  // Separate state for home buying calculator (added here so it's defined before render)
  const [homeCalcState, setHomeCalcState] = useState('QLD')
  const [homeCalcFirstHome, setHomeCalcFirstHome] = useState(true)
  const [homeCalcNewBuild, setHomeCalcNewBuild] = useState(false)
  const [homeBuyingPrice, setHomeBuyingPrice] = useState('')

  // ==================== WEEKLY PLAN GENERATOR ====================
  const generateWeeklyPlan = async (milestoneId: number) => {
    const milestone = roadmapMilestones.find(m => m.id === milestoneId)
    if (!milestone) return
    setGeneratingPlanFor(milestoneId)
    try {
      const response = await fetch('/api/budget-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'question',
          question: `You are Aureus, an AI financial coach built into a budgeting app called Aureus. The user is already using Aureus to track their budget, income, expenses, debts, and goals — so NEVER suggest they download a budgeting app, spreadsheet, or any other tracking tool. They already have one.

Important financial context for Australian users:
- The $2,000 Starter Emergency Fund (Baby Step 1) is a buffer for UNEXPECTED emergencies like car breakdowns, medical bills, vet bills, or appliance failures — it is NOT meant to cover a month of living expenses. Do not describe it that way.
- Baby Step 3 (3-6 months of expenses) is the full emergency fund — different goal.

Create a 7-day action plan for this goal: "${milestone.name}"${milestone.targetAmount ? ` (target: $${milestone.targetAmount})` : ''}${milestone.notes ? `. Context: ${milestone.notes}` : ''}.

Rules:
- Output ONLY the 7 steps, nothing else. No intro sentence, no summary, no preamble.
- Format each line as: Day 1: [action]
- Each action must be specific, concrete, and doable in under 30 minutes
- One sentence per step
- Never suggest downloading another app or creating a spreadsheet — the user is already in Aureus
- Day 5 MUST always be: "Add this goal to your Aureus savings goals with your target amount and a weekly payment amount, then enable it on the calendar for visual tracking and reminders."
- Start directly with "Day 1:"`,
          financialData: { income: incomeStreams, expenses, debts, goals, assets, liabilities },
          memory: budgetMemory,
          countryConfig: currentCountryConfig
        })
      })
      const data = await response.json()
      const rawText: string = data.message || data.advice || data.raw || ''
      const lines = rawText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0)

      // Strip markdown bold/italic from a string
      const stripMd = (s: string) => s
        .replace(/\*\*([^*]+)\*\*/g, '$1')  // **bold**
        .replace(/\*([^*]+)\*/g, '$1')       // *italic*
        .replace(/^#+\s*/, '')               // headings
        .trim()

      // Filter to only lines that start with Day N / Step N / number - skip intro prose
      const dayLines = lines.filter((l: string) => /^(day\s*\d+|step\s*\d+|\d+[).\-:])/i.test(l))
      const sourceLines = dayLines.length >= 5 ? dayLines : lines.filter((l: string) => {
        // also skip obvious intro/outro lines
        const stripped = stripMd(l).toLowerCase()
        return !stripped.startsWith("here's") && !stripped.startsWith("here is") &&
               !stripped.startsWith("below") && !stripped.startsWith("sure") &&
               !stripped.startsWith("great") && !stripped.startsWith("absolutely") &&
               !stripped.startsWith("of course") && l.length > 20
      })

      const parsed = sourceLines.slice(0, 7).map((l: string, i: number) => ({
        id: Date.now() + i,
        // Strip the "Day N:" / "1." / "Step N:" prefix AND any markdown from the text
        text: stripMd(l.replace(/^(day\s*\d+[:.\-]?\s*|step\s*\d+[:.\-]?\s*|\d+[).\-]\s*)/i, '').trim()),
        done: false
      })).filter((s: any) => s.text.length > 10) // skip any empty/too-short results
      setRoadmapMilestones(prev => prev.map(m =>
        m.id === milestoneId ? { ...m, weeklyPlan: parsed, planGeneratedAt: new Date().toISOString() } : m
      ))
      setExpandedMilestone(milestoneId)
    } catch { alert('Could not generate plan — please try again.') }
    setGeneratingPlanFor(null)
  }

  const togglePlanStep = (milestoneId: number, stepId: number) => {
    setRoadmapMilestones(prev => prev.map(m =>
      m.id === milestoneId
        ? { ...m, weeklyPlan: m.weeklyPlan?.map((s: any) => s.id === stepId ? { ...s, done: !s.done } : s) }
        : m
    ))
  }

  const addToRoadmapQuick = (name: string, icon: string, targetAmount: string, notes: string) => {
    if (roadmapMilestones.some(m => m.name.toLowerCase() === name.toLowerCase())) {
      alert(`"${name}" is already on your roadmap!`)
      return
    }
    setRoadmapMilestones(prev => [...prev, {
      id: Date.now(), name, icon, targetAmount, currentAmount: 0,
      targetDate: '', notes, category: 'savings', completed: false,
      createdAt: new Date().toISOString(), weeklyPlan: null
    }])
    setCelebrationWin(`"${name}" added to your roadmap! 🗺️`)
    setTimeout(() => setCelebrationWin(null), 3000)
  }

  const handleChatMessage = async () => {
    if (!chatInput.trim() || isLoading) return
    const message = chatInput.trim()
    setChatMessages(prev => [...prev, { role: 'user', content: message }])
    setChatInput('')
    setIsLoading(true)
    try {
      const response = await fetch('/api/budget-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'question', question: message, financialData: { income: incomeStreams, expenses, debts, goals, assets, liabilities, roadmapMilestones }, memory: budgetMemory, countryConfig: currentCountryConfig })
      })
      const data = await response.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.message || data.advice || data.raw || "I'm here to help!" }])
    } catch { setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong." }]) }
    setIsLoading(false)
  }

  // ==================== FINANCIAL LITERACY CONTENT ====================
  const literacyTopics = [
    {
      id: 'mortgage-interest',
      icon: '🏠',
      title: 'How Mortgage Interest Actually Works',
      tagline: 'Why your early repayments matter most',
      content: `In your first year of a 30-year $600k mortgage at 6%, roughly 90% of each repayment goes to interest — not your actual debt. This is called amortisation.\n\nYear 1 example ($600k, 6%, monthly repayments of ~$3,597):\n• Interest paid: ~$35,700\n• Principal paid: ~$7,450\n\nThis flips over time — but by then you've already paid most of the interest. That's why extra repayments in the first 5 years save you dramatically more than the same payments made in year 20.`,
      keyNumbers: ['90% of early repayments = interest, not principal', 'Avg Aussie pays $580k interest on a $600k loan', 'Every $1 extra in year 1 saves ~$3 in year 30'],
      mistake: 'Most people wait until they\'re "comfortable" before making extra payments. The earlier you start, the more you save — even $50/fortnight makes a real difference.',
      cta: 'How much interest am I paying?'
    },
    {
      id: 'offset-accounts',
      icon: '💡',
      title: 'Offset Accounts: The Secret Weapon',
      tagline: 'Your savings account that fights your mortgage',
      content: `An offset account is a transaction account linked to your mortgage. Every dollar sitting in it reduces the balance your interest is calculated on — without locking that money away.\n\nExample:\n• Mortgage: $500,000\n• Offset balance: $50,000\n• You only pay interest on: $450,000\n\nAt 6%, that $50k in offset saves you $3,000/year in interest — completely passively. No extra repayments needed.\n\nBest banks with free offset (AU): ANZ, Commonwealth Bank, Westpac, NAB, Macquarie.`,
      keyNumbers: ['$50k in offset at 6% saves $3,000/year', 'Unlike redraw, offset money is always accessible', '100% offset accounts beat high-interest savings accounts'],
      mistake: 'Keeping your savings in a separate account instead of offset. Even if your mortgage rate is 6% and your savings account pays 5.5%, offset wins because there\'s no tax on offset savings.',
      cta: 'Calculate my offset savings'
    },
    {
      id: 'redraw-vs-offset',
      icon: '🔄',
      title: 'Redraw vs Offset: Which is Better?',
      tagline: 'Two tools with an important difference',
      content: `Both reduce your interest — but the key difference is accessibility.\n\nRedraw facility:\n• Extra payments go INTO the loan\n• Lower effective balance = less interest\n• To access the money, you apply to redraw\n• Banks can reduce or remove redraw access\n\nOffset account:\n• Money sits BESIDE the loan in a transaction account\n• Just as effective at reducing interest\n• Access it anytime, like a normal account\n• Better for emergency fund storage\n\nFor homeowners who might need the money: Offset wins. For investors (where extra repayments may have tax implications): consult your accountant.`,
      keyNumbers: ['Both save the same interest mathematically', 'Offset = full liquidity, Redraw = less liquid', 'Banks have been known to freeze redraw during hardship'],
      mistake: 'Treating redraw as an emergency fund. If the bank freezes access during financial hardship (which has happened), you could be stuck.',
      cta: 'Which should I use?'
    },
    {
      id: 'lmi-lvr',
      icon: '📊',
      title: 'LMI & LVR Explained Simply',
      tagline: 'The numbers that decide your loan',
      content: `LVR (Loan to Value Ratio) is the percentage of the property value you\'re borrowing.\n\nLVR = Loan ÷ Property Value × 100\n\nExample: $480k loan on a $600k property = 80% LVR\n\nLMI (Lender\'s Mortgage Insurance) kicks in when your LVR exceeds 80% (i.e., deposit under 20%). It protects the BANK — you pay for it.\n\nCost of LMI:\n• 85% LVR (15% deposit): ~$8,000–12,000\n• 90% LVR (10% deposit): ~$15,000–20,000\n• 95% LVR (5% deposit): ~$20,000–30,000\n\nHow to avoid LMI:\n1. Save 20% deposit\n2. Use a guarantor\n3. First Home Guarantee (5% deposit, no LMI — limited places)`,
      keyNumbers: ['LMI costs 1–4% of the loan amount', '80% LVR = the magic number to avoid LMI', 'LMI is a one-off cost, often added to your loan'],
      mistake: 'Adding LMI to your loan instead of paying it upfront. If you add $15k LMI to a 6% mortgage, it costs you ~$28k by the time you pay it off.',
      cta: 'Calculate my LMI cost'
    },
    {
      id: 'extra-vs-invest',
      icon: '⚖️',
      title: 'Extra Mortgage Repayments vs Investing',
      tagline: 'The question every homeowner asks',
      content: `This is the great Australian financial debate. Here\'s an honest look:\n\nCase for extra repayments:\n• Guaranteed return equal to your mortgage rate (~6%)\n• Risk-free — markets can drop, mortgage savings can\'t\n• Psychological peace of mortgage freedom\n• After paying off, you redirect all payments to investments\n\nCase for investing:\n• ASX historical average: ~7–10% p.a. (but NOT guaranteed)\n• Super has tax advantages (15% tax vs your marginal rate)\n• Time in market beats timing the market\n\nThe maths says: if investments return more than your mortgage rate after tax, invest. But the guaranteed, risk-free nature of mortgage savings is underrated.\n\nThe Infinity Group approach: kill the mortgage aggressively first, then redirect those payments to wealth building. It works because the discipline and momentum carry over.`,
      keyNumbers: ['Mortgage rate 6% = guaranteed 6% return on extra payments', 'Super salary sacrifice saves 15–32% in tax depending on your bracket', '$500/month extra = 8+ years cut from a 30-year mortgage'],
      mistake: 'Investing in low-return assets while paying 20%+ interest on a credit card. Always kill high-interest debt before investing.',
      cta: 'Help me decide for my situation'
    },
    {
      id: 'super-basics',
      icon: '🦺',
      title: 'Super: Your Forced Savings System',
      tagline: 'Make the most of Australia\'s retirement safety net',
      content: `Superannuation is compulsory retirement savings. Your employer contributes 11.5% of your salary (rising to 12% from July 2025).\n\nConcessional (pre-tax) contributions:\n• Cap: $30,000/year (including employer SG)\n• Taxed at just 15% going in (vs your marginal rate up to 47%)\n• Salary sacrifice: ask HR to direct extra pre-tax pay into super\n\nExample of salary sacrifice:\nEarning $80k, top tax rate 34.5% (inc Medicare)\n• Salary sacrifice $5,000/year to super\n• Tax saving: ~$975/year vs paying income tax\n• Super gets ~$4,250 instead of you getting ~$3,275 after tax\n\nFinding lost super: myGov → ATO → Super → search for lost accounts. Australians have $17.5 billion in lost super.`,
      keyNumbers: ['11.5% employer SG rate in 2024–25', '$30,000 concessional contribution cap', '$17.5 billion sitting in lost/unclaimed super'],
      mistake: 'Ignoring your super until 50. Someone who puts $5k/year extra from age 30 vs age 45 ends up with roughly double the balance at retirement due to compounding.',
      cta: 'Optimise my super strategy'
    },
    {
      id: 'fortnightly-hack',
      icon: '📅',
      title: 'Fortnightly Payments: The Simple Hack',
      tagline: 'Make 13 months of payments in 12 months',
      content: `This is one of the simplest and most powerful mortgage hacks.\n\nIf you pay monthly: 12 payments per year\nIf you pay fortnightly: 26 payments per year = 13 months of payments\n\nThe result? You make one full extra monthly payment per year — without it feeling like extra.\n\nOn a $600,000 mortgage at 6% over 30 years:\n• Monthly payments: pays off in 30 years, ~$680k in interest\n• Fortnightly payments: pays off in ~26 years, ~$565k in interest\n\nYears saved: ~4 years\nInterest saved: ~$115,000\n\nHow to do it: Call your bank or update your loan settings online. It takes 5 minutes.`,
      keyNumbers: ['26 fortnightly payments = 13 monthly payments in a year', '~4 years saved on a typical 30-year loan', '~$115,000 saved in interest on a $600k loan at 6%'],
      mistake: 'Halving your monthly payment and paying it fortnightly — if the bank doesn\'t process it correctly, you don\'t get the benefit. Confirm with your lender that it\'s set up as "26 fortnightly payments" not "24 semi-monthly payments".',
      cta: 'How much does this save me?'
    },
    {
      id: 'emergency-fund',
      icon: '🛡️',
      title: 'Emergency Fund Strategy',
      tagline: 'Your financial airbag — don\'t leave home without it',
      content: `An emergency fund is 3–6 months of living expenses kept in cash. Not invested. Not tied up. Just ready.\n\nWhy 3–6 months of EXPENSES, not income:\n• You only need to cover your bills during an emergency, not save\n• Expenses are usually 60–80% of income for most people\n\nWhere to keep it (Australia):\n• ING Savings Maximiser: ~5.5% (with conditions)\n• Ubank: ~5.1%\n• Macquarie Savings: ~5.25%\n• Do NOT invest it — you need instant access, not growth\n\nWhen to use it:\n✅ Job loss, medical emergency, car breakdown, urgent repairs\n❌ Holiday sale, "investment opportunity", planned expenses\n\nThe discipline rule: treat your emergency fund like a fire extinguisher. You don\'t use it because things are inconvenient — only when things are actually on fire.`,
      keyNumbers: ['3 months expenses = stable employment, no dependants', '6 months = self-employed, variable income, or dependants', 'Keep it in a high-interest savings account at 5%+'],
      mistake: 'Using your offset account as your emergency fund. That works fine — BUT make sure you also have a card or line of credit as backup if the bank ever restricts offset access during a dispute.',
      cta: 'Calculate my emergency fund target'
    }
  ]

  // ==================== MONEY PERSONALITY QUIZ ====================
  const personalityQuiz = [
    { q: "When a big bill arrives unexpectedly, your first reaction is:", options: [{ label: "Panic — I close the letter and deal with it later", type: "avoider" }, { label: "Frustration — but I sort it out that day", type: "warrior" }, { label: "I check my emergency fund and handle it calmly", type: "planner" }, { label: "I put it on the card and worry about it next month", type: "spender" }] },
    { q: "How do you feel when you check your bank account?", options: [{ label: "Anxious — I avoid checking too often", type: "avoider" }, { label: "Like a hawk — I check it constantly", type: "worrier" }, { label: "Fine — I know roughly what's there", type: "planner" }, { label: "Guilty — I usually know I've overspent", type: "spender" }] },
    { q: "You get an unexpected $1,000. What do you do?", options: [{ label: "Straight onto the mortgage / debt", type: "planner" }, { label: "Save most, treat myself a little", type: "warrior" }, { label: "It's already mentally spent on things I've been wanting", type: "spender" }, { label: "Put it in savings but feel nervous touching it", type: "hoarder" }] },
    { q: "Money conversations with your partner/family are:", options: [{ label: "Non-existent — we avoid the topic", type: "avoider" }, { label: "Tense — it always becomes an argument", type: "worrier" }, { label: "Structured — we have regular check-ins", type: "planner" }, { label: "Spontaneous and usually triggered by a problem", type: "spender" }] },
    { q: "Your relationship with your future financial self is:", options: [{ label: "Distant — retirement feels too far away to think about", type: "avoider" }, { label: "Anxious — I worry I won't have enough", type: "worrier" }, { label: "Optimistic — I'm building toward a clear vision", type: "planner" }, { label: "Complicated — I know what I should do but don't do it", type: "spender" }] },
    { q: "When you've made a financial mistake, you typically:", options: [{ label: "Beat yourself up for weeks about it", type: "worrier" }, { label: "Analyse what went wrong and adjust the plan", type: "planner" }, { label: "Pretend it didn't happen and move on", type: "avoider" }, { label: "Justify it and do something similar again", type: "spender" }] },
    { q: "What does money represent to you at a deep level?", options: [{ label: "Safety — without it I feel exposed", type: "hoarder" }, { label: "Freedom — it's about options and choices", type: "planner" }, { label: "Status — it signals success to the world", type: "spender" }, { label: "Stress — it's more burden than blessing", type: "worrier" }] },
    { q: "If your income doubled tomorrow, you would:", options: [{ label: "Upgrade your lifestyle significantly", type: "spender" }, { label: "Feel relief but still be anxious about the future", type: "worrier" }, { label: "Redirect the extra strategically — mortgage, invest, give", type: "planner" }, { label: "Not really change anything — saving more feels safest", type: "hoarder" }] }
  ]

  const personalityProfiles: {[key: string]: {label: string, emoji: string, desc: string, strength: string, blindspot: string, aureusFocus: string, color: string}} = {
    planner: { label: 'The Strategic Planner', emoji: '🎯', desc: "You approach money with logic and structure. You're future-oriented, make deliberate decisions, and rarely let emotion drive spending. Your challenge is flexibility — when life doesn't follow the plan, you can freeze.", strength: 'Discipline, long-term thinking, goal clarity', blindspot: "Can be rigid — sometimes life needs you to adapt the plan, not abandon it", aureusFocus: "Focus on optimising systems and accelerating your mortgage. You're already wired right — Aureus helps you find the gaps in an already-good plan.", color: '#10b981' },
    avoider: { label: 'The Avoider', emoji: '🙈', desc: "Money stress makes you want to look away. You function fine day-to-day but big financial decisions get postponed indefinitely. The avoidance usually comes from a fear of discovering things are worse than you think.", strength: 'Adaptable, not materialistic, can live on little when needed', blindspot: "Avoidance is the most expensive money habit. Problems compound when ignored.", aureusFocus: "Aureus gives you a safe place to look — no judgement, just clarity. Small steps done consistently are your superpower.", color: '#f59e0b' },
    spender: { label: 'The Lifestyle Spender', emoji: '🛍️', desc: "You earn, you spend, you enjoy life. The problem isn't your income — it's the gap between what you earn and what leaves the account before the mortgage can benefit.", strength: 'Generous, social, knows how to enjoy the present', blindspot: "Lifestyle inflation silently kills wealth. Every $100/month in lifestyle is ~$30,000 less in your mortgage payoff.", aureusFocus: "Aureus helps you find the spending that doesn't actually make you happy — so you can cut that specifically, not everything.", color: '#ef4444' },
    worrier: { label: 'The Anxious Achiever', emoji: '😰', desc: "High earner, high anxiety. You work hard, earn well, but the number never feels like enough. Financial stress follows you even when you're doing well on paper.", strength: 'Motivated, responsible, high earning potential', blindspot: "Worry without action is just suffering. You need clear metrics that tell you you're actually okay.", aureusFocus: "Aureus gives you the data to replace worry with facts. The numbers usually look better than the fear tells you.", color: '#8b5cf6' },
    hoarder: { label: 'The Safety Seeker', emoji: '🏦', desc: "Security drives every decision. You save aggressively but find it genuinely difficult to deploy money — even into good opportunities. The emergency fund has three years of expenses in it.", strength: 'Resilient, disciplined saver, never in a financial crisis', blindspot: "Hoarding cash while paying mortgage interest is costing you. Offset accounts and investments beat sitting on cash.", aureusFocus: "Aureus helps you put money to work without losing the security you need. Offset accounts are made for you.", color: '#3b82f6' },
    warrior: { label: 'The Financial Warrior', emoji: '⚔️', desc: "Setbacks don't stop you. You've been through financial difficulty and come out the other side stronger. You're motivated but sometimes reactive — you solve today's problem without a long-term system.", strength: 'Resilient, action-oriented, strong under pressure', blindspot: "Reactive without a system means repeating the same battles. You need a plan that works when things are calm, not just when they're on fire.", aureusFocus: "Aureus helps you build the system that matches your resilience. Your attitude is your biggest asset — let's give it structure.", color: '#f97316' }
  }

  const calculatePersonality = () => {
    const counts: {[key: string]: number} = {}
    Object.values(personalityAnswers).forEach(type => { counts[type] = (counts[type] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'planner'
  }

  // ==================== DEEP WHY QUESTIONS ====================
  const deepWhyQuestions = [
    "What does being mortgage-free actually look like for your day-to-day life? Be specific.",
    "Who else in your life benefits when you win financially? How does it affect them?",
    "What has money stress cost you that you can't get back — time, health, relationships?",
    "What would you do differently if money was completely sorted and you had total financial freedom?",
    "What are you most afraid of financially — the thing you don't say out loud?"
  ]

  // ==================== FEAR AUDIT ====================
  const fearAuditQuestions = [
    { q: "What is your earliest memory of money?", placeholder: "e.g. My parents arguing about bills, or never having enough for school excursions..." },
    { q: "What did you learn about money growing up — spoken or unspoken rules?", placeholder: "e.g. Money doesn't grow on trees. Rich people are greedy. We don't talk about money..." },
    { q: "What do you believe about yourself and money that you'd be embarrassed to say out loud?", placeholder: "e.g. I'm bad with money. I'll never get ahead. I don't deserve financial success..." },
    { q: "When you imagine having significant wealth, what uncomfortable feelings come up?", placeholder: "e.g. Fear of losing it, guilt about others who have less, fear of changing or being judged..." },
    { q: "What would it mean — about you — if you became debt-free and financially secure?", placeholder: "e.g. It would mean I'm capable. It would mean I proved people wrong. It would mean I can protect my family..." }
  ]

  // ==================== PROACTIVE INSIGHTS ENGINE ====================
  const generateProactiveInsights = async () => {
    if (loadingInsights) return
    setLoadingInsights(true)
    try {
      const response = await fetch('/api/budget-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'question',
          question: `You are Aureus, an AI financial coach. Analyse this user's financial data and generate 4-5 proactive insights — things you notice that they may not have spotted. Be specific with numbers. Sound like a sharp personal trainer who's reviewed their stats, not a generic chatbot.

Financial snapshot:
- Monthly income: $${monthlyIncome.toFixed(0)}
- Monthly expenses: $${monthlyExpenses.toFixed(0)}
- Monthly surplus: $${monthlySurplus.toFixed(0)}
- Savings rate: ${savingsRate.toFixed(1)}%
- Emergency fund: $${emergencyFund.toFixed(0)} (${emergencyMonths.toFixed(1)} months)
- Total debt: $${totalDebtBalance.toFixed(0)}
- Net worth: $${netWorth.toFixed(0)}
- Baby step: ${currentBabyStep.step} - ${currentBabyStep.title}
- Passive income: $${passiveIncome.toFixed(0)}/mo
- Mortgage data: ${mortgageAccel.balance ? `$${mortgageAccel.balance} at ${mortgageAccel.rate}%` : 'not entered'}
- Money personality: ${moneyPersonality || 'not assessed'}

Format each insight as a single line starting with an emoji, then the insight. No headers, no lists within insights. Be direct and specific. Focus on: patterns worth noting, risks, quick wins, mortgage acceleration opportunities, and behavioural observations. Maximum 5 insights.`,
          financialData: { income: incomeStreams, expenses, debts, goals, assets },
          memory: budgetMemory,
          countryConfig: currentCountryConfig
        })
      })
      const data = await response.json()
      const raw: string = data.message || data.advice || data.raw || ''
      const lines = raw.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 20)
      setProactiveInsights(lines.slice(0, 5))
      setInsightsGeneratedAt(new Date().toISOString())
    } catch { /* silent */ }
    setLoadingInsights(false)
  }

  const generateOneDecision = async () => {
    if (loadingOneDecision) return
    setLoadingOneDecision(true)
    try {
      const response = await fetch('/api/budget-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'question',
          question: `You are Aureus. Based on this user's financial situation, identify THE SINGLE highest-leverage financial action they could take this week. Not a list — one specific action with a specific number or step. Format: start with the action verb, be specific, include the estimated impact in brackets at the end. Maximum 2 sentences.

Income: $${monthlyIncome.toFixed(0)}/mo | Expenses: $${monthlyExpenses.toFixed(0)}/mo | Surplus: $${monthlySurplus.toFixed(0)}/mo | Debt: $${totalDebtBalance.toFixed(0)} | Baby Step: ${currentBabyStep.step} | Mortgage: ${mortgageAccel.balance ? `$${mortgageAccel.balance} @ ${mortgageAccel.rate}%` : 'not entered'} | Emergency fund: ${emergencyMonths.toFixed(1)} months`,
          financialData: { income: incomeStreams, expenses, debts, goals, assets },
          memory: budgetMemory,
          countryConfig: currentCountryConfig
        })
      })
      const data = await response.json()
      const raw: string = data.message || data.advice || data.raw || ''
      setOneDecision(raw.trim().replace(/\*\*/g, ''))
      setOneDecisionDate(new Date().toISOString().split('T')[0])
    } catch { /* silent */ }
    setLoadingOneDecision(false)
  }

  const generateSpendingInsights = async () => {
    if (loadingSpendingInsights || expenses.length < 3) return
    setLoadingSpendingInsights(true)
    try {
      const response = await fetch('/api/budget-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'question',
          question: `Analyse these expenses and generate 3 specific spending pattern insights. Be concrete with numbers. Sound like a sharp analyst, not a generic advisor.

Expenses: ${expenses.map(e => `${e.name}: $${e.amount}/${e.frequency}`).join(', ')}
Monthly income: $${monthlyIncome.toFixed(0)}
Monthly total expenses: $${monthlyExpenses.toFixed(0)}
Savings rate: ${savingsRate.toFixed(1)}%

Each insight: one sentence, starts with an emoji, references actual numbers from their data. Focus on: category concentration, income ratios, opportunities to redirect to mortgage.`,
          financialData: { income: incomeStreams, expenses },
          memory: budgetMemory,
          countryConfig: currentCountryConfig
        })
      })
      const data = await response.json()
      const raw: string = data.message || data.advice || data.raw || ''
      const lines = raw.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 15)
      setSpendingInsights(lines.slice(0, 4))
    } catch { /* silent */ }
    setLoadingSpendingInsights(false)
  }

  // ==================== LATTE FACTOR CALCULATOR ====================
  const latteFreqToMonthly = (freq: string, amount: number) => {
    if (freq === 'daily') return amount * 30
    if (freq === 'weekly') return amount * 4.33
    if (freq === 'monthly') return amount
    return amount
  }

  const calcLatteImpact = (monthlyAmount: number, years: number, returnRate: number) => {
    const monthlyRate = returnRate / 100 / 12
    const months = years * 12
    if (monthlyRate === 0) return monthlyAmount * months
    return monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
  }

  const totalLatteMonthly = latteItems.reduce((sum, item) => sum + latteFreqToMonthly(item.frequency, parseFloat(item.amount || '0')), 0)
  const totalLatteImpact = calcLatteImpact(totalLatteMonthly, parseFloat(latteYears || '20'), parseFloat(latteReturnRate || '8'))

  // ==================== SUPER OPTIMIZER ====================
  const calcSuperProjection = () => {
    const balance = parseFloat(superData.currentBalance || '0')
    const age = parseFloat(superData.currentAge || '0')
    const retAge = parseFloat(superData.retirementAge || '67')
    const salary = parseFloat(superData.salary || '0')
    const employerRate = parseFloat(superData.employerRate || '11.5') / 100
    const extraContrib = parseFloat(superData.extraContribution || '0')
    const feeRate = parseFloat(superData.fundFeeRate || '0.8') / 100
    const years = retAge - age
    const growthRate = 0.075 - feeRate
    const annualEmployer = salary * employerRate
    const annualExtra = extraContrib * 26
    const annualTotal = annualEmployer + annualExtra
    const monthlyTotal = annualTotal / 12
    const monthlyRate = growthRate / 12
    const months = years * 12
    let projected = balance
    for (let i = 0; i < months; i++) {
      projected = projected * (1 + monthlyRate) + monthlyTotal / 12
    }
    const projectedNoExtra = (() => {
      let p = balance
      const mRate = growthRate / 12
      for (let i = 0; i < months; i++) p = p * (1 + mRate) + (annualEmployer / 12)
      return p
    })()
    const taxSaving = annualExtra * 0.15 // rough concessional tax saving vs marginal
    return { projected, projectedNoExtra, extraImpact: projected - projectedNoExtra, annualExtra, taxSaving, years }
  }

  // ==================== MONEY DATE ====================
  const moneyDateQuestions = [
    { q: "How did your spending feel this week — in control, tight, or loose?", type: 'scale3', options: ['Too tight', 'In control', 'Too loose'] },
    { q: "Did any unplanned expenses come up? What were they?", type: 'text', placeholder: 'e.g. Car service $280, birthday dinner $90' },
    { q: "Did you make any progress on your mortgage or debt this week?", type: 'yesno' },
    { q: "On a scale of 1-5, how stressed did you feel about money this week?", type: 'scale', options: ['1', '2', '3', '4', '5'] },
    { q: "What is ONE financial win from this week, no matter how small?", type: 'text', placeholder: "e.g. Packed lunch 3 days, checked my balance, said no to impulse buy" },
    { q: "What's ONE financial intention for next week?", type: 'text', placeholder: "e.g. Call bank about rate review, set up extra repayment, review subscriptions" }
  ]

  const submitMoneyDate = () => {
    const entry = {
      id: Date.now(), date: new Date().toISOString(),
      answers: moneyDateAnswers,
      win: moneyDateAnswers[4] || '',
      intention: moneyDateAnswers[5] || '',
      stressLevel: moneyDateAnswers[3] || '3'
    }
    setMoneyDateLog(prev => [entry, ...prev])
    if (moneyDateAnswers[4]) {
      setWins(prev => [...prev, { id: Date.now(), title: moneyDateAnswers[4], desc: 'From your Money Date', icon: '💰', auto: false, date: new Date().toISOString() }])
    }
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const newStreak = lastCheckIn === yesterday || lastCheckIn === today ? streak + 1 : 1
    setStreak(newStreak)
    setLastCheckIn(today)
    setShowMoneyDate(false)
    setMoneyDateStep(0)
    setMoneyDateAnswers({})
    setCelebrationWin(`Money Date complete! 💰 ${newStreak > 1 ? `${newStreak}-week streak!` : 'Streak started!'}`)
    setTimeout(() => setCelebrationWin(null), 3500)
  }

  // ==================== ANNUAL REVIEW ====================
  const annualReviewQuestions = [
    { q: "What was your biggest financial WIN this year?", placeholder: "The achievement you're most proud of..." },
    { q: "What was your biggest financial MISTAKE this year, and what did it teach you?", placeholder: "Be honest — this is private and it's how you grow..." },
    { q: "Which of your financial goals did you hit? Which did you miss?", placeholder: "Goals achieved vs goals that slipped..." },
    { q: "How did your life change this year in ways that affect your financial plan?", placeholder: "Job change, relationship, family, health, property..." },
    { q: "What does your financial life look like in 12 months if everything goes right?", placeholder: "Paint the picture specifically..." },
    { q: "What are your 3 financial intentions for the next year?", placeholder: "Not goals — intentions. How you want to show up with money..." }
  ]

  const submitAnnualReview = () => {
    const review = {
      id: Date.now(), year: new Date().getFullYear(),
      date: new Date().toISOString(), answers: annualReviewAnswers,
      netWorthSnapshot: netWorth, incomeSnapshot: monthlyIncome
    }
    setAnnualReviews(prev => [review, ...prev])
    setNetWorthHistory(prev => [...prev, { date: new Date().toISOString().split('T')[0], value: netWorth }])
    setShowAnnualReview(false)
    setAnnualReviewStep(0)
    setAnnualReviewAnswers({})
    setCelebrationWin('Annual Money Review complete! 🎊')
    setTimeout(() => setCelebrationWin(null), 3500)
  }

  // ==================== NET WORTH CHART DATA ====================
  const netWorthChartData = (() => {
    const history = [...netWorthHistory]
    if (history.length === 0 || history[history.length - 1]?.date !== new Date().toISOString().split('T')[0]) {
      history.push({ date: new Date().toISOString().split('T')[0], value: netWorth })
    }
    if (history.length < 2) {
      // Generate projected data
      const projected = []
      for (let i = 0; i <= 5; i++) {
        const projectedNW = netWorth + (monthlySurplus * 12 * i)
        projected.push({ date: `${new Date().getFullYear() + i}`, value: projectedNW, projected: true })
      }
      return projected
    }
    return history.map(h => ({ ...h, projected: false }))
  })()

  // ==================== ONBOARDING STEPS ====================
  const onboardingSteps = [
    { id: 'welcome', title: 'Welcome to Aureus', type: 'welcome' },
    { id: 'personality', title: 'Your Money Personality', type: 'personality' },
    { id: 'deepwhy', title: 'Your Deep Why', type: 'deepwhy' },
    { id: 'identity', title: 'Your Money Identity', type: 'identity' },
    { id: 'setup', title: 'Quick Setup', type: 'setup' }
  ]
  if (showModeSelector) {
    return (
      <div style={{ minHeight: '100vh', background: darkMode ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' as const, marginBottom: '48px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)', border: '4px solid #fcd34d', margin: '0 auto 24px auto' }}>
            <span style={{ color: '#78350f', fontWeight: 800, fontSize: '40px' }}>A</span>
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: 800, color: darkMode ? '#f1f5f9' : '#1e293b', margin: '0 0 12px 0' }}>Welcome to Aureus</h1>
          <p style={{ fontSize: '18px', color: darkMode ? '#94a3b8' : '#64748b', margin: 0 }}>Your AI financial coach — helping Aussie families get debt-free faster</p>
        </div>
        <button onClick={() => { setAppMode('budget'); setShowModeSelector(false); setActiveTab('quickview') }} style={{ padding: '32px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '24px', border: 'none', cursor: 'pointer', textAlign: 'left' as const, maxWidth: '420px', width: '100%', boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
          <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>Budget & Wealth Mode</h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0 0 16px 0', fontSize: '14px', lineHeight: 1.6 }}>Budget coaching, mortgage acceleration, debt elimination, FIRE planning, and financial literacy — all in one place.</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
            {['Baby Steps', 'Mortgage Accelerator', 'FIRE Path', 'Wins & Streaks', 'Learn Hub'].map(tag => <span key={tag} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '11px', color: 'white' }}>{tag}</span>)}
          </div>
        </button>
        <button onClick={() => setDarkMode(!darkMode)} style={{ marginTop: '32px', padding: '12px 24px', background: 'transparent', border: '2px solid ' + (darkMode ? '#334155' : '#e2e8f0'), borderRadius: '12px', color: darkMode ? '#94a3b8' : '#64748b', cursor: 'pointer' }}>{darkMode ? '☀️ Light mode' : '🌙 Dark mode'}</button>
      </div>
    )
  }

  const mortgageResult = calculateMortgagePayoff()

  // ==================== MAIN APP ====================
  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>

      {/* WIN CELEBRATION TOAST */}
      {celebrationWin && (
        <div style={{ position: 'fixed' as const, top: '20px', right: '20px', zIndex: 9999, padding: '16px 20px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(16,185,129,0.4)', color: 'white', maxWidth: '320px', animation: 'slideIn 0.3s ease' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>🏆 New Win Unlocked!</div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>{celebrationWin}</div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ padding: '12px 24px', background: theme.cardBg, borderBottom: '1px solid ' + theme.border, position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fcd34d' }}>
              <span style={{ color: '#78350f', fontWeight: 800, fontSize: '18px' }}>A</span>
            </div>
            <span style={{ color: theme.text, fontWeight: 700, fontSize: '20px' }}>Aureus</span>
            {streak > 0 && <span style={{ padding: '3px 10px', background: '#f59e0b20', color: '#f59e0b', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>🔥 {streak}-week streak</span>}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '7px 12px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text }}>{darkMode ? '☀️' : '🌙'}</button>
            <select value={userCountry} onChange={e => setUserCountry(e.target.value as any)} style={{ padding: '6px 10px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text, fontSize: '14px' }}>
              <option value="AU">🇦🇺 AU</option><option value="US">🇺🇸 US</option><option value="UK">🇬🇧 UK</option><option value="NZ">🇳🇿 NZ</option><option value="CA">🇨🇦 CA</option>
            </select>
          </div>
        </div>
        {/* NAV TABS - scrollable */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' as const, paddingBottom: '2px' }}>
          {[
            { id: 'chat', label: '💬 Aureus' },
            { id: 'quickview', label: '⚡ Quick' },
            { id: 'dashboard', label: '🎛️ Budget' },
            { id: 'mortgage', label: '🚀 Mortgage' },
            { id: 'insights', label: '🧠 Insights' },
            { id: 'path', label: '🛤️ Path' },
            { id: 'grow', label: '📈 Grow' },
            { id: 'review', label: '🔄 Review' },
            { id: 'overview', label: '📊 Metrics' },
            { id: 'learn', label: '🎓 Learn' },
            { id: 'wins', label: `🏆 Wins${wins.length > 0 ? ` (${wins.length})` : ''}` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{ padding: '7px 14px', background: activeTab === tab.id ? theme.accent : 'transparent', color: activeTab === tab.id ? 'white' : theme.text, border: '1px solid ' + (activeTab === tab.id ? theme.accent : theme.border), borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap' as const, flexShrink: 0 }}>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>

        {/* QUICK VIEW */}
        {activeTab === 'quickview' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>
            {/* WHY STATEMENT BANNER */}
            {whyStatement ? (
              <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #f59e0b15, #10b98115)', borderRadius: '12px', border: '2px solid #f59e0b40', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '4px' }}>Why I\'m Doing This</div>
                  <div style={{ color: theme.text, fontSize: '15px', fontStyle: 'italic' }}>"{whyStatement}"</div>
                </div>
                <button onClick={() => { setEditingWhy(true); setWhyDraft(whyStatement) }} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.textMuted, cursor: 'pointer', fontSize: '12px' }}>Edit</button>
              </div>
            ) : (
              <button onClick={() => { setEditingWhy(true); setWhyDraft('') }} style={{ padding: '16px 20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', border: '2px dashed ' + theme.border, cursor: 'pointer', textAlign: 'left' as const }}>
                <div style={{ color: theme.textMuted, fontSize: '13px' }}>💬 <strong>Set your why</strong> — What are you working toward? (e.g. "Be mortgage-free before my kids finish school")</div>
              </button>
            )}

            {/* QUOTE */}
            <div style={{ background: theme.cardBg, borderRadius: '12px', padding: '16px 20px', borderLeft: '4px solid ' + theme.purple }}>
              <p style={{ color: theme.text, fontSize: '14px', fontStyle: 'italic', margin: 0 }}>"{currentQuote.quote}"</p>
              <p style={{ color: theme.textMuted, fontSize: '12px', margin: '8px 0 0 0', textAlign: 'right' as const }}>— {currentQuote.author}</p>
            </div>

            {/* AUREUS CHAT WIDGET */}
            <div style={{ padding: '20px', background: `linear-gradient(135deg, ${theme.success}15, ${theme.purple}15)`, borderRadius: '16px', border: '2px solid ' + theme.success }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#78350f' }}>A</div>
                <div><div style={{ color: theme.text, fontWeight: 600 }}>Aureus</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>{currentBabyStep.title}</div></div>
              </div>
              {chatMessages.length > 0 && (
                <div ref={chatContainerRef} style={{ maxHeight: '200px', overflowY: 'auto' as const, marginBottom: '12px', padding: '8px', background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                  {chatMessages.slice(-6).map((msg, idx) => (
                    <div key={idx} style={{ marginBottom: '10px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: msg.role === 'user' ? theme.accent : theme.cardBg, color: msg.role === 'user' ? 'white' : theme.text, fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-wrap' as const }}>{msg.content}</div>
                    </div>
                  ))}
                  {isLoading && <div style={{ padding: '8px', color: theme.textMuted, fontSize: '13px' }}>Aureus is thinking...</div>}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChatMessage()} placeholder="Ask Aureus anything..." style={{ ...inputStyle, flex: 1 }} disabled={isLoading} />
                <button onClick={handleChatMessage} disabled={isLoading || !chatInput.trim()} style={{ ...btnSuccess, opacity: isLoading || !chatInput.trim() ? 0.5 : 1 }}>{isLoading ? '...' : 'Send'}</button>
              </div>
            </div>

            {/* METRIC GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {[
                { label: 'Monthly Income', value: `$${monthlyIncome.toFixed(0)}`, color: theme.success },
                { label: 'Monthly Bills', value: `$${totalOutgoing.toFixed(0)}`, color: theme.danger },
                { label: 'Monthly Surplus', value: `$${monthlySurplus.toFixed(0)}`, color: monthlySurplus >= 0 ? theme.success : theme.danger },
                { label: 'Net Worth', value: `$${netWorth.toLocaleString()}`, color: netWorth >= 0 ? theme.success : theme.danger },
              ].map(m => (
                <div key={m.label} style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                  <div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '4px' }}>{m.label}</div>
                  <div style={{ color: m.color, fontSize: '28px', fontWeight: 700 }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* MORTGAGE FREE DATE HERO */}
            {mortgageAccel.balance && mortgageResult ? (
              <div style={{ padding: '24px', background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', borderRadius: '16px', border: '2px solid #3b82f6' }}>
                <div style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '3px', marginBottom: '12px', textAlign: 'center' as const }}>🏠 MORTGAGE PAYOFF COUNTDOWN</div>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' as const, marginBottom: '16px' }}>
                  <div>
                    <div style={{ color: '#ef4444', fontSize: '11px', marginBottom: '4px' }}>Without changes</div>
                    <div style={{ color: '#f1f5f9', fontSize: '36px', fontWeight: 800 }}>{mortgageResult.standard.freeYear}</div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>{mortgageResult.standard.years.toFixed(1)} yrs · ${Math.round(mortgageResult.standard.interest / 1000)}k interest</div>
                  </div>
                  {parseFloat(mortgageAccel.extraRepayment || '0') > 0 && (
                    <div>
                      <div style={{ color: '#10b981', fontSize: '11px', marginBottom: '4px' }}>With your extra payments</div>
                      <div style={{ color: '#10b981', fontSize: '36px', fontWeight: 800 }}>{mortgageResult.withExtra.freeYear}</div>
                      <div style={{ color: '#10b981', fontSize: '11px' }}>🎉 {mortgageResult.withExtra.yearsSaved.toFixed(1)} yrs earlier · ${Math.round(mortgageResult.withExtra.interestSaved / 1000)}k saved</div>
                    </div>
                  )}
                </div>
                {/* What-if slider */}
                <div style={{ padding: '12px 0' }}>
                  <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '8px', textAlign: 'center' as const }}>💡 What if you paid extra per {mortgageAccel.repaymentFrequency === 'weekly' ? 'week' : mortgageAccel.repaymentFrequency === 'fortnightly' ? 'fortnight' : 'month'}?</div>
                  {[100, 200, 500, 1000].map(extra => {
                    const freq = mortgageAccel.repaymentFrequency === 'weekly' ? 52 : mortgageAccel.repaymentFrequency === 'fortnightly' ? 26 : 12
                    const r = parseFloat(mortgageAccel.rate || '0') / 100 / freq
                    const repayment = mortgageResult.repaymentUsed + extra
                    const bal = parseFloat(mortgageAccel.balance || '0')
                    if (repayment <= bal * r) return null
                    const periods = Math.log(repayment / (repayment - bal * r)) / Math.log(1 + r)
                    const yrs = periods / freq
                    const saved = mortgageResult.standard.years - yrs
                    const interestSaved = mortgageResult.standard.interest - (repayment * periods - bal)
                    return (
                      <div key={extra} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '4px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>+${extra}</span>
                        <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 600 }}>{saved.toFixed(1)} yrs earlier</span>
                        <span style={{ color: '#f59e0b', fontSize: '12px' }}>${Math.round(interestSaved / 1000)}k saved</span>
                      </div>
                    )
                  })}
                </div>
                <button onClick={() => setActiveTab('mortgage')} style={{ width: '100%', marginTop: '8px', padding: '10px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Open Mortgage Accelerator →</button>
              </div>
            ) : (
              <button onClick={() => setActiveTab('mortgage')} style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #1e3a5f, #0f172a)', borderRadius: '12px', border: '2px dashed #3b82f6', cursor: 'pointer', width: '100%', textAlign: 'left' as const }}>
                <div style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '4px' }}>🏠 See your mortgage-free date</div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>Enter your mortgage details to see how quickly you could be debt-free →</div>
              </button>
            )}

            {/* IDENTITY STATEMENTS */}
            {identityStatements.length > 0 && (
              <div style={{ padding: '16px 20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', border: '1px solid ' + theme.border }}>
                <div style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '10px' }}>⚡ Who I Am Becoming</div>
                {identityStatements.map((stmt, i) => (
                  <div key={i} style={{ color: theme.text, fontSize: '14px', fontStyle: 'italic', padding: '6px 0', borderBottom: i < identityStatements.length - 1 ? '1px solid ' + theme.border : 'none' }}>
                    "{stmt}"
                  </div>
                ))}
              </div>
            )}

            {/* THE ONE DECISION */}
            {oneDecision && (
              <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #f59e0b15, #f97316 15)', borderRadius: '12px', border: '2px solid #f59e0b40' }}>
                <div style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '8px' }}>🎯 Your ONE Financial Move This Week</div>
                <div style={{ color: theme.text, fontSize: '14px', lineHeight: 1.6 }}>{oneDecision}</div>
                <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '6px' }}>{oneDecisionDate && `Generated ${new Date(oneDecisionDate).toLocaleDateString('en-AU')}`}</div>
              </div>
            )}

            {/* MONEY PERSONALITY BADGE */}
            {moneyPersonality && personalityProfiles[moneyPersonality] && (
              <div style={{ padding: '14px 18px', background: personalityProfiles[moneyPersonality].color + '15', borderRadius: '12px', border: '1px solid ' + personalityProfiles[moneyPersonality].color + '40', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>{personalityProfiles[moneyPersonality].emoji}</span>
                <div>
                  <div style={{ color: personalityProfiles[moneyPersonality].color, fontWeight: 700, fontSize: '14px' }}>{personalityProfiles[moneyPersonality].label}</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>Your money personality · <button onClick={() => setActiveTab('insights')} style={{ background: 'none', border: 'none', color: theme.accent, cursor: 'pointer', fontSize: '12px', padding: 0 }}>See insights →</button></div>
                </div>
              </div>
            )}

            {/* QUICK NAV */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {[
                { tab: 'insights', icon: '🧠', label: 'Insights' },
                { tab: 'mortgage', icon: '🚀', label: 'Mortgage' },
                { tab: 'grow', icon: '📈', label: 'Grow' },
                { tab: 'review', icon: '🔄', label: 'Review' },
              ].map(n => (
                <button key={n.tab} onClick={() => setActiveTab(n.tab as any)} style={{ padding: '14px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as const }}>
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>{n.icon}</div>
                  <div style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>{n.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: `linear-gradient(135deg, ${theme.success}15, ${theme.purple}15)`, border: '2px solid ' + theme.success, borderRadius: '20px', padding: '24px', minHeight: '70vh', display: 'flex', flexDirection: 'column' as const }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid ' + theme.border }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fcd34d' }}>
                  <span style={{ color: '#78350f', fontWeight: 800, fontSize: '28px' }}>A</span>
                </div>
                <div>
                  <div style={{ color: theme.text, fontWeight: 700, fontSize: '22px' }}>Aureus</div>
                  <div style={{ color: theme.textMuted, fontSize: '13px' }}>Your financial coach · {currentBabyStep.title}</div>
                </div>
              </div>
              <div style={{ padding: '8px 12px', background: theme.warning + '15', borderRadius: '8px', marginBottom: '12px', border: '1px solid ' + theme.warning + '30' }}>
                <p style={{ margin: 0, color: theme.textMuted, fontSize: '11px' }}>⚠️ Aureus is an AI assistant, not a licensed financial advisor. Always verify and consult qualified professionals for major decisions.</p>
              </div>
              <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto' as const, marginBottom: '16px', padding: '8px' }}>
                {chatMessages.length === 0 && (
                  <div style={{ textAlign: 'center' as const, padding: '40px 20px', color: theme.textMuted }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
                    <div style={{ fontSize: '16px', marginBottom: '8px', color: theme.text }}>G'day! I'm Aureus.</div>
                    <div style={{ fontSize: '14px', lineHeight: 1.6 }}>Ask me anything — about your budget, mortgage strategy, Baby Steps, how offset accounts work, or anything else on your mind.</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
                      {['How do I pay my mortgage off faster?', 'Should I use an offset account?', 'Explain fortnightly payments', 'Am I on track financially?'].map(q => (
                        <button key={q} onClick={() => { setChatInput(q); handleChatMessage() }} style={{ padding: '8px 14px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '20px', color: theme.text, cursor: 'pointer', fontSize: '13px' }}>{q}</button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ marginBottom: '16px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '85%', padding: '14px 18px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.role === 'user' ? theme.accent : theme.cardBg, color: msg.role === 'user' ? 'white' : theme.text, fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-wrap' as const }}>{msg.content}</div>
                  </div>
                ))}
                {isLoading && <div style={{ padding: '16px', color: theme.textMuted }}>Aureus is thinking...</div>}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChatMessage()} placeholder="Ask Aureus anything..." style={{ ...inputStyle, flex: 1, padding: '14px 18px', fontSize: '15px' }} disabled={isLoading} />
                <button onClick={handleChatMessage} disabled={isLoading || !chatInput.trim()} style={{ ...btnSuccess, padding: '14px 24px', opacity: isLoading || !chatInput.trim() ? 0.5 : 1 }}>Send</button>
              </div>
            </div>
          </div>
        )}

        {/* BUDGET DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              {[
                { label: 'Income /mo', value: `$${monthlyIncome.toFixed(0)}`, color: theme.success },
                { label: 'Expenses /mo', value: `$${monthlyExpenses.toFixed(0)}`, color: theme.danger },
                { label: 'Debt Payments', value: `$${monthlyDebtPayments.toFixed(0)}`, color: theme.warning },
                { label: 'Goal Savings', value: `$${monthlyGoalSavings.toFixed(0)}`, color: theme.purple },
                { label: 'Net /mo', value: `$${monthlySurplus.toFixed(0)}`, color: monthlySurplus >= 0 ? theme.success : theme.danger },
              ].map(m => (
                <div key={m.label} style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>{m.label}</div>
                  <div style={{ color: m.color, fontSize: '24px', fontWeight: 700 }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Income & Expenses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Income */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: theme.success, fontSize: '18px' }}>💰 Income</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="file" ref={payslipInputRef} accept="image/*,.pdf" onChange={async e => {
                      const file = e.target.files?.[0]; if (!file) return; setPayslipProcessing(true)
                      try {
                        const base64 = await new Promise<string>(res => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(file) })
                        const response = await fetch('/api/extract-payslip', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: base64, filename: file.name }) })
                        if (response.ok) { const data = await response.json(); setExtractedPayslip(data); setShowPayslipUpload(true) }
                      } catch { alert('Could not process payslip.') }
                      setPayslipProcessing(false)
                    }} style={{ display: 'none' }} />
                    <button onClick={() => payslipInputRef.current?.click()} style={{ padding: '4px 10px', background: theme.purple, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} disabled={payslipProcessing}>📄 Payslip</button>
                    <span style={{ color: theme.success, fontWeight: 700 }}>${monthlyIncome.toFixed(0)}/mo</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                  <input placeholder="Source name" value={newIncome.name} onChange={e => setNewIncome({...newIncome, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '100px'}} />
                  <input placeholder="Amount" type="number" value={newIncome.amount} onChange={e => setNewIncome({...newIncome, amount: e.target.value})} style={{...inputStyle, width: '90px'}} />
                  <select value={newIncome.frequency} onChange={e => setNewIncome({...newIncome, frequency: e.target.value})} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
                  <select value={newIncome.type} onChange={e => setNewIncome({...newIncome, type: e.target.value})} style={inputStyle}><option value="active">Active</option><option value="passive">Passive</option></select>
                  <button onClick={addIncome} style={btnSuccess}>+</button>
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' as const }}>
                  {incomeStreams.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No income streams yet</p> : incomeStreams.map(inc => (
                    editingItem?.type === 'income' && editingItem.id === inc.id ? (
                      <div key={inc.id} style={{ padding: '10px', marginBottom: '8px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' as const }}>
                          <input value={editingItem.data.name} onChange={e => updateEditField('name', e.target.value)} style={{...inputStyle, flex: 1, minWidth: '80px'}} />
                          <input type="number" value={editingItem.data.amount} onChange={e => updateEditField('amount', e.target.value)} style={{...inputStyle, width: '80px'}} />
                          <select value={editingItem.data.frequency} onChange={e => updateEditField('frequency', e.target.value)} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}><button onClick={saveEdit} style={{...btnSuccess, padding: '6px 12px', fontSize: '12px'}}>Save</button><button onClick={cancelEdit} style={{...btnDanger, padding: '6px 12px', fontSize: '12px'}}>Cancel</button></div>
                      </div>
                    ) : (
                      <div key={inc.id} style={{ padding: '10px 12px', marginBottom: '6px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div><div style={{ color: theme.text, fontWeight: 600 }}>{inc.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{inc.frequency} · {inc.type}</div></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: theme.success, fontWeight: 700 }}>${inc.amount}</span><button onClick={() => startEdit('income', inc)} style={{ padding: '3px 8px', background: theme.accent, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✏️</button><button onClick={() => deleteIncome(inc.id)} style={{ padding: '3px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>×</button></div>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Expenses */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: theme.danger, fontSize: '18px' }}>💸 Bills & Spending</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setShowPresets(!showPresets)} style={{ padding: '4px 10px', background: theme.purple, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>+ Presets</button>
                    <span style={{ color: theme.danger, fontWeight: 700 }}>${monthlyExpenses.toFixed(0)}/mo</span>
                  </div>
                </div>
                {showPresets && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '12px', padding: '10px', background: theme.bg, borderRadius: '8px' }}>
                    {presetBills.map(p => <button key={p.name} onClick={() => { const amt = prompt(`Amount for ${p.name}:`, (p as any).amount || ''); if (amt) setExpenses([...expenses, { id: Date.now(), name: p.name, amount: amt, frequency: p.frequency, category: p.category, dueDate: new Date().toISOString().split('T')[0] }]) }} style={{ padding: '4px 10px', background: theme.purple + '20', color: theme.purple, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{p.name}</button>)}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                  <input placeholder="Expense name" value={newExpense.name} onChange={e => setNewExpense({...newExpense, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '100px'}} />
                  <input placeholder="Amount" type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} style={{...inputStyle, width: '90px'}} />
                  <select value={newExpense.frequency} onChange={e => setNewExpense({...newExpense, frequency: e.target.value})} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select>
                  <button onClick={addExpense} style={btnDanger}>+</button>
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' as const }}>
                  {expenses.filter(e => !e.targetDebtId && !e.targetGoalId).length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No expenses yet</p> : expenses.filter(e => !e.targetDebtId && !e.targetGoalId).map(exp => (
                    editingItem?.type === 'expense' && editingItem.id === exp.id ? (
                      <div key={exp.id} style={{ padding: '10px', marginBottom: '6px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' as const }}><input value={editingItem.data.name} onChange={e => updateEditField('name', e.target.value)} style={{...inputStyle, flex: 1, minWidth: '80px'}} /><input type="number" value={editingItem.data.amount} onChange={e => updateEditField('amount', e.target.value)} style={{...inputStyle, width: '80px'}} /></div>
                        <div style={{ display: 'flex', gap: '8px' }}><button onClick={saveEdit} style={{...btnSuccess, padding: '6px 12px', fontSize: '12px'}}>Save</button><button onClick={cancelEdit} style={{...btnDanger, padding: '6px 12px', fontSize: '12px'}}>Cancel</button></div>
                      </div>
                    ) : (
                      <div key={exp.id} style={{ padding: '10px 12px', marginBottom: '6px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div><div style={{ color: theme.text, fontWeight: 600 }}>{exp.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{exp.frequency}</div></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: theme.danger, fontWeight: 700 }}>${exp.amount}</span><button onClick={() => startEdit('expense', exp)} style={{ padding: '3px 8px', background: theme.accent, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✏️</button><button onClick={() => deleteExpense(exp.id)} style={{ padding: '3px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>×</button></div>
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
                <h3 style={{ margin: 0, color: theme.text }}>{calendarMonth.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))} style={{ ...btnPrimary, padding: '8px 16px' }}>→</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} style={{ textAlign: 'center' as const, fontWeight: 600, color: theme.textMuted, padding: '8px', fontSize: '12px' }}>{d}</div>)}
                {Array(getDaysInMonth().firstDay).fill(null).map((_, i) => <div key={'e'+i} />)}
                {Array(getDaysInMonth().daysInMonth).fill(null).map((_, i) => {
                  const day = i + 1
                  const items = getCalendarItemsForDay(day)
                  const isToday = day === new Date().getDate() && calendarMonth.getMonth() === new Date().getMonth() && calendarMonth.getFullYear() === new Date().getFullYear()
                  return (
                    <div key={day} onClick={() => items.length > 0 && setExpandedDay({ day, items })} style={{ minHeight: '70px', padding: '4px', background: isToday ? theme.accent + '20' : darkMode ? '#1e293b' : '#f8fafc', borderRadius: '8px', border: isToday ? '2px solid ' + theme.accent : '1px solid ' + theme.border, cursor: items.length > 0 ? 'pointer' : 'default' }}>
                      <div style={{ fontWeight: 600, color: theme.text, marginBottom: '2px', fontSize: '12px' }}>{day}</div>
                      {items.slice(0, 2).map(item => <div key={item.itemId} style={{ fontSize: '9px', padding: '1px 4px', marginBottom: '2px', background: item.itemType === 'income' ? '#d1fae5' : item.itemType === 'expense' ? '#dbeafe' : '#fee2e2', color: '#1e293b', borderRadius: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, opacity: item.isPaid ? 0.5 : 1 }}>{item.name}</div>)}
                      {items.length > 2 && <div style={{ fontSize: '9px', color: theme.accent }}>+{items.length - 2}</div>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Debts & Goals */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: theme.warning, fontSize: '18px' }}>💳 Debts</h3>
                  <span style={{ color: theme.warning, fontWeight: 700 }}>${totalDebtBalance.toFixed(0)}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                  <input placeholder="Debt name" value={newDebt.name} onChange={e => setNewDebt({...newDebt, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '80px'}} />
                  <input placeholder="Balance" type="number" value={newDebt.balance} onChange={e => setNewDebt({...newDebt, balance: e.target.value})} style={{...inputStyle, width: '80px'}} />
                  <input placeholder="Rate %" type="number" value={newDebt.interestRate} onChange={e => setNewDebt({...newDebt, interestRate: e.target.value})} style={{...inputStyle, width: '60px'}} />
                  <input placeholder="Payment" type="number" value={newDebt.minPayment} onChange={e => setNewDebt({...newDebt, minPayment: e.target.value})} style={{...inputStyle, width: '75px'}} />
                  <button onClick={addDebt} style={btnWarning}>+</button>
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto' as const }}>
                  {debts.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No debts — 🎉</p> : debts.map(debt => (
                    <div key={debt.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#3a2e1e' : '#fefce8', borderRadius: '10px', border: '1px solid ' + theme.border }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div><div style={{ color: theme.text, fontWeight: 600 }}>{debt.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{debt.interestRate}% · ${debt.minPayment}/{debt.frequency || 'monthly'}</div></div>
                        <div style={{ textAlign: 'right' as const }}><div style={{ color: theme.warning, fontWeight: 700 }}>${parseFloat(debt.balance).toFixed(0)}</div><button onClick={() => deleteDebt(debt.id)} style={{ padding: '2px 6px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', marginTop: '4px' }}>×</button></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={cardStyle} data-section="goals">
                <h3 style={{ margin: '0 0 16px 0', color: theme.purple, fontSize: '18px' }}>🎯 Goals</h3>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                  <input placeholder="Goal name" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '80px'}} />
                  <input placeholder="Target $" type="number" value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: e.target.value})} style={{...inputStyle, width: '80px'}} />
                  <input placeholder="Saved $" type="number" value={newGoal.saved} onChange={e => setNewGoal({...newGoal, saved: e.target.value})} style={{...inputStyle, width: '70px'}} />
                  <button onClick={addGoal} style={btnPurple}>+</button>
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto' as const }}>
                  {goals.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No goals yet</p> : goals.map(goal => {
                    const pct = (parseFloat(goal.saved || '0') / parseFloat(goal.target || '1')) * 100
                    return (
                      <div key={goal.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#2e1e3a' : '#faf5ff', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div><div style={{ color: theme.text, fontWeight: 600 }}>{goal.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>${parseFloat(goal.saved || '0').toFixed(0)} / ${parseFloat(goal.target || '0').toFixed(0)}</div></div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: theme.purple, fontWeight: 700 }}>{pct.toFixed(0)}%</span><button onClick={() => deleteGoal(goal.id)} style={{ padding: '2px 6px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>×</button></div>
                        </div>
                        <div style={{ height: '6px', background: theme.border, borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: theme.purple }} /></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Assets */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: theme.success, fontSize: '18px' }}>📦 Assets</h3>
                <div><span style={{ color: theme.success, fontWeight: 700 }}>${totalAssets.toLocaleString()}</span> <span style={{ color: theme.textMuted, fontSize: '12px' }}>Net Worth: <span style={{ color: netWorth >= 0 ? theme.success : theme.danger }}>${netWorth.toLocaleString()}</span></span></div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input placeholder="Asset name" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} style={{...inputStyle, flex: 1}} />
                <input placeholder="Value" type="number" value={newAsset.value} onChange={e => setNewAsset({...newAsset, value: e.target.value})} style={{...inputStyle, width: '100px'}} />
                <select value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} style={inputStyle}><option value="savings">💰 Savings</option><option value="super">🏦 Super</option><option value="investment">📊 Investment</option><option value="property">🏠 Property</option><option value="vehicle">🚗 Vehicle</option></select>
                <button onClick={addAsset} style={btnSuccess}>+</button>
              </div>
              {assets.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No assets added yet</p> : assets.map(a => (
                <div key={a.id} style={{ padding: '10px 12px', marginBottom: '6px', background: theme.bg, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><span style={{ color: theme.text }}>{a.name}</span><span style={{ color: theme.textMuted, fontSize: '11px', marginLeft: '8px' }}>{a.type}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: theme.success, fontWeight: 700 }}>${parseFloat(a.value).toLocaleString()}</span><button onClick={() => deleteAsset(a.id)} style={{ padding: '2px 6px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>×</button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== MORTGAGE ACCELERATOR TAB ==================== */}
        {activeTab === 'mortgage' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            <div style={{ padding: '12px 16px', background: theme.warning + '15', borderRadius: '10px', border: '1px solid ' + theme.warning + '40' }}>
              <p style={{ margin: 0, color: theme.textMuted, fontSize: '12px' }}>⚠️ This is a general education tool only. Not financial advice. Consult a licensed mortgage broker or financial advisor before making loan decisions.</p>
            </div>

            {/* HERO: Mortgage Free Date */}
            <div style={{ padding: '32px', background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', borderRadius: '20px', border: '2px solid #3b82f6', textAlign: 'center' as const }}>
              <div style={{ color: '#94a3b8', fontSize: '12px', letterSpacing: '3px', marginBottom: '8px' }}>🏠 MORTGAGE FREE TARGET</div>
              {mortgageResult ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' as const }}>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>At current rate</div>
                      <div style={{ color: '#ef4444', fontSize: '40px', fontWeight: 800 }}>{mortgageResult.standard.freeYear}</div>
                      <div style={{ color: '#94a3b8', fontSize: '12px' }}>{mortgageResult.standard.years.toFixed(1)} yrs · ${Math.round(mortgageResult.standard.interest).toLocaleString()} interest</div>
                    </div>
                    {parseFloat(mortgageAccel.extraRepayment || '0') > 0 && (
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>With extra ${mortgageAccel.extraRepayment}/{mortgageAccel.repaymentFrequency}</div>
                        <div style={{ color: '#10b981', fontSize: '40px', fontWeight: 800 }}>{mortgageResult.withExtra.freeYear}</div>
                        <div style={{ color: '#10b981', fontSize: '13px' }}>🎉 {mortgageResult.withExtra.yearsSaved.toFixed(1)} yrs earlier · saving ${Math.round(mortgageResult.withExtra.interestSaved).toLocaleString()}</div>
                      </div>
                    )}
                    {parseFloat(mortgageAccel.offsetBalance || '0') > 0 && (
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>With ${mortgageAccel.offsetBalance} offset</div>
                        <div style={{ color: '#f59e0b', fontSize: '40px', fontWeight: 800 }}>{mortgageResult.withOffset.freeYear}</div>
                        <div style={{ color: '#f59e0b', fontSize: '13px' }}>💡 {mortgageResult.withOffset.yearsSaved.toFixed(1)} yrs saved · ${Math.round(mortgageResult.withOffset.interestSaved).toLocaleString()} saved</div>
                      </div>
                    )}
                    {parseFloat(mortgageAccel.extraRepayment || '0') > 0 && parseFloat(mortgageAccel.offsetBalance || '0') > 0 && (
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Extra payments + offset</div>
                        <div style={{ color: '#8b5cf6', fontSize: '40px', fontWeight: 800 }}>{mortgageResult.withBoth.freeYear}</div>
                        <div style={{ color: '#8b5cf6', fontSize: '13px' }}>🚀 {mortgageResult.withBoth.yearsSaved.toFixed(1)} yrs saved · ${Math.round(mortgageResult.withBoth.interestSaved).toLocaleString()} saved</div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <div style={{ color: '#f1f5f9', fontSize: '20px', marginBottom: '8px' }}>Enter your mortgage details below</div>
                  <div style={{ color: '#94a3b8', fontSize: '14px' }}>See how extra payments could save you years and tens of thousands in interest</div>
                </div>
              )}
            </div>

            {/* SUB TABS */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {[{ id: 'calculator', label: '🧮 Calculator' }, { id: 'offset', label: '💡 Offset Simulator' }, { id: 'strategy', label: '📋 Strategy Guide' }].map(t => (
                <button key={t.id} onClick={() => setMortgageTab(t.id as any)} style={{ padding: '10px 18px', background: mortgageTab === t.id ? theme.accent : theme.cardBg, color: mortgageTab === t.id ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{t.label}</button>
              ))}
            </div>

            {/* CALCULATOR */}
            {mortgageTab === 'calculator' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={cardStyle}>
                  <h3 style={{ margin: '0 0 20px 0', color: theme.text }}>Your Mortgage</h3>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '14px' }}>

                    {/* Frequency first — drives all labels below */}
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Repayment Frequency</label>
                      <select value={mortgageAccel.repaymentFrequency} onChange={e => setMortgageAccel({...mortgageAccel, repaymentFrequency: e.target.value})} style={{...inputStyle, width: '100%'}}>
                        <option value="weekly">Weekly</option>
                        <option value="fortnightly">Fortnightly (recommended)</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Remaining Balance ($)</label><input type="number" value={mortgageAccel.balance} onChange={e => setMortgageAccel({...mortgageAccel, balance: e.target.value})} placeholder="e.g. 430000" style={{...inputStyle, width: '100%'}} /></div>
                    <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Interest Rate (% p.a.)</label><input type="number" step="0.01" value={mortgageAccel.rate} onChange={e => setMortgageAccel({...mortgageAccel, rate: e.target.value})} placeholder="e.g. 5.69" style={{...inputStyle, width: '100%'}} /></div>

                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Years Remaining on Loan</label>
                      <input type="number" value={mortgageAccel.remainingYears} onChange={e => setMortgageAccel({...mortgageAccel, remainingYears: e.target.value})} placeholder="e.g. 25" style={{...inputStyle, width: '100%'}} />
                      {/* Auto-derive and show standard repayment */}
                      {mortgageAccel.balance && mortgageAccel.rate && mortgageAccel.remainingYears && (() => {
                        const freq = mortgageAccel.repaymentFrequency === 'fortnightly' ? 26 : 12
                        const std = calcStandardRepayment(parseFloat(mortgageAccel.balance), parseFloat(mortgageAccel.rate)/100, parseFloat(mortgageAccel.remainingYears), freq)
                        if (std > 0) return (
                          <div style={{ marginTop: '6px', padding: '8px 10px', background: theme.accent + '15', borderRadius: '6px', color: theme.accent, fontSize: '12px' }}>
                            📌 Standard repayment: <strong>${std.toFixed(0)} per {mortgageAccel.repaymentFrequency === 'fortnightly' ? 'fortnight' : 'month'}</strong> — use this below if unsure
                          </div>
                        )
                        return null
                      })()}
                    </div>

                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                        Your Actual Repayment ($ per {mortgageAccel.repaymentFrequency === 'weekly' ? 'week' : mortgageAccel.repaymentFrequency === 'fortnightly' ? 'fortnight' : 'month'})
                      </label>
                      <input type="number" value={mortgageAccel.currentRepayment} onChange={e => setMortgageAccel({...mortgageAccel, currentRepayment: e.target.value})} placeholder={mortgageAccel.balance && mortgageAccel.rate && mortgageAccel.remainingYears ? `e.g. ${calcStandardRepayment(parseFloat(mortgageAccel.balance||'0'), parseFloat(mortgageAccel.rate||'0')/100, parseFloat(mortgageAccel.remainingYears||'0'), mortgageAccel.repaymentFrequency === 'fortnightly' ? 26 : 12).toFixed(0)}` : 'e.g. 1385'} style={{...inputStyle, width: '100%'}} />
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>
                        ⚠️ This must be your {mortgageAccel.repaymentFrequency} amount — not a different frequency. Leave blank to use the calculated standard repayment above.
                      </div>
                    </div>

                    {/* Sanity warning */}
                    {mortgageResult?.repaymentSeemsHigh && (
                      <div style={{ padding: '10px 12px', background: theme.danger + '15', borderRadius: '8px', border: '1px solid ' + theme.danger + '40' }}>
                        <div style={{ color: theme.danger, fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}>⚠️ Repayment looks unusually high</div>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>
                          Did you enter your <strong>monthly</strong> repayment but leave frequency set to <strong>fortnightly</strong>? The standard fortnightly payment for this loan would be ~${mortgageResult.minRepayment30yr.toFixed(0)}.
                        </div>
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid ' + theme.border, paddingTop: '16px' }}>
                      <div style={{ color: theme.success, fontWeight: 600, marginBottom: '10px' }}>💪 Acceleration (optional)</div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                        Extra Repayment ($ per {mortgageAccel.repaymentFrequency === 'weekly' ? 'week' : mortgageAccel.repaymentFrequency === 'fortnightly' ? 'fortnight' : 'month'})
                      </label>
                      <input type="number" value={mortgageAccel.extraRepayment} onChange={e => setMortgageAccel({...mortgageAccel, extraRepayment: e.target.value})} placeholder="e.g. 200" style={{...inputStyle, width: '100%'}} />
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '6px' }}>Try $100, $200, $500 — see the years and interest you save</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
                  {mortgageResult ? (
                    <>
                      <div style={cardStyle}>
                        <h4 style={{ margin: '0 0 16px 0', color: theme.danger }}>📊 Current Trajectory</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div style={{ padding: '12px', background: theme.bg, borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px' }}>Years remaining</div><div style={{ color: theme.danger, fontSize: '22px', fontWeight: 700 }}>{mortgageResult.standard.years.toFixed(1)}</div></div>
                          <div style={{ padding: '12px', background: theme.bg, borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px' }}>Total interest</div><div style={{ color: theme.danger, fontSize: '22px', fontWeight: 700 }}>${Math.round(mortgageResult.standard.interest).toLocaleString()}</div></div>
                          <div style={{ padding: '12px', background: theme.bg, borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px' }}>Mortgage-free year</div><div style={{ color: theme.text, fontSize: '22px', fontWeight: 700 }}>{mortgageResult.standard.freeYear}</div></div>
                          <div style={{ padding: '12px', background: theme.bg, borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px' }}>Total repaid</div><div style={{ color: theme.text, fontSize: '22px', fontWeight: 700 }}>${Math.round(parseFloat(mortgageAccel.balance || '0') + mortgageResult.standard.interest).toLocaleString()}</div></div>
                        </div>
                      </div>

                      {parseFloat(mortgageAccel.extraRepayment || '0') > 0 && (
                        <div style={{ ...cardStyle, border: '2px solid ' + theme.success }}>
                          <h4 style={{ margin: '0 0 16px 0', color: theme.success }}>🚀 With ${mortgageAccel.extraRepayment} Extra Per {mortgageAccel.repaymentFrequency === 'weekly' ? 'Week' : mortgageAccel.repaymentFrequency === 'fortnightly' ? 'Fortnight' : 'Month'}</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ padding: '12px', background: theme.success + '15', borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px' }}>Years remaining</div><div style={{ color: theme.success, fontSize: '22px', fontWeight: 700 }}>{mortgageResult.withExtra.years.toFixed(1)}</div></div>
                            <div style={{ padding: '12px', background: theme.success + '15', borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px' }}>Interest saved</div><div style={{ color: theme.success, fontSize: '22px', fontWeight: 700 }}>${Math.round(mortgageResult.withExtra.interestSaved).toLocaleString()}</div></div>
                            <div style={{ padding: '12px', background: theme.success + '15', borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px' }}>Mortgage-free year</div><div style={{ color: theme.success, fontSize: '22px', fontWeight: 700 }}>{mortgageResult.withExtra.freeYear}</div></div>
                            <div style={{ padding: '12px', background: theme.success + '15', borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px' }}>Years earlier</div><div style={{ color: theme.success, fontSize: '22px', fontWeight: 700 }}>{mortgageResult.withExtra.yearsSaved.toFixed(1)}</div></div>
                          </div>
                        </div>
                      )}
                      <button onClick={() => { setChatInput(`I have a $${mortgageAccel.balance} mortgage at ${mortgageAccel.rate}%, paying $${mortgageAccel.currentRepayment} ${mortgageAccel.repaymentFrequency}. How do I pay it off faster?`); setActiveTab('chat') }} style={{ ...btnSuccess, padding: '14px', width: '100%', fontSize: '15px' }}>💬 Ask Aureus for a personalised strategy</button>
                    </>
                  ) : (
                    <div style={{ ...cardStyle, textAlign: 'center' as const, padding: '40px' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏠</div>
                      <div style={{ color: theme.text, fontWeight: 600, marginBottom: '8px' }}>Enter your mortgage details</div>
                      <div style={{ color: theme.textMuted, fontSize: '14px' }}>See exactly how much time and money you can save with smarter repayments</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* OFFSET SIMULATOR */}
            {mortgageTab === 'offset' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={cardStyle}>
                  <h3 style={{ margin: '0 0 8px 0', color: theme.text }}>💡 Offset Account Simulator</h3>
                  <p style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '20px' }}>Every dollar in your offset account reduces the interest charged on your mortgage — without locking money away.</p>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '14px' }}>
                    <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Repayment Frequency</label><select value={mortgageAccel.repaymentFrequency} onChange={e => setMortgageAccel({...mortgageAccel, repaymentFrequency: e.target.value})} style={{...inputStyle, width: '100%'}}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select></div>
                    <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Mortgage Balance ($)</label><input type="number" value={mortgageAccel.balance} onChange={e => setMortgageAccel({...mortgageAccel, balance: e.target.value})} placeholder="e.g. 500000" style={{...inputStyle, width: '100%'}} /></div>
                    <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Interest Rate (% p.a.)</label><input type="number" step="0.01" value={mortgageAccel.rate} onChange={e => setMortgageAccel({...mortgageAccel, rate: e.target.value})} placeholder="e.g. 5.69" style={{...inputStyle, width: '100%'}} /></div>
                    <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Years Remaining</label><input type="number" value={mortgageAccel.remainingYears} onChange={e => setMortgageAccel({...mortgageAccel, remainingYears: e.target.value})} placeholder="e.g. 25" style={{...inputStyle, width: '100%'}} /></div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                        Your Repayment ($ per {mortgageAccel.repaymentFrequency === 'weekly' ? 'week' : mortgageAccel.repaymentFrequency === 'fortnightly' ? 'fortnight' : 'month'}) — optional
                      </label>
                      <input type="number" value={mortgageAccel.currentRepayment} onChange={e => setMortgageAccel({...mortgageAccel, currentRepayment: e.target.value})} placeholder="Leave blank to auto-calculate from term" style={{...inputStyle, width: '100%'}} />
                    </div>
                    <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Offset Balance ($) — how much you'd keep in offset</label><input type="number" value={mortgageAccel.offsetBalance} onChange={e => setMortgageAccel({...mortgageAccel, offsetBalance: e.target.value})} placeholder="e.g. 30000" style={{...inputStyle, width: '100%'}} /></div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
                  {mortgageResult && parseFloat(mortgageAccel.offsetBalance || '0') > 0 ? (
                    <>
                      <div style={{ ...cardStyle, border: '2px solid ' + theme.warning }}>
                        <h4 style={{ margin: '0 0 16px 0', color: theme.warning }}>💡 Offset Impact</h4>
                        <div style={{ padding: '16px', background: theme.warning + '15', borderRadius: '10px', marginBottom: '16px' }}>
                          <div style={{ color: theme.text, fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                            ${mortgageAccel.offsetBalance} in offset saves you...
                          </div>
                          <div style={{ color: theme.warning, fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
                            ${Math.round(mortgageResult.withOffset.interestSaved).toLocaleString()}
                          </div>
                          <div style={{ color: theme.textMuted, fontSize: '13px' }}>in total interest</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div style={{ padding: '10px', background: theme.bg, borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px' }}>Years saved</div><div style={{ color: theme.warning, fontSize: '20px', fontWeight: 700 }}>{mortgageResult.withOffset.yearsSaved.toFixed(1)}</div></div>
                          <div style={{ padding: '10px', background: theme.bg, borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px' }}>Free in year</div><div style={{ color: theme.warning, fontSize: '20px', fontWeight: 700 }}>{mortgageResult.withOffset.freeYear}</div></div>
                          <div style={{ padding: '10px', background: theme.bg, borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px' }}>Annual saving</div><div style={{ color: theme.warning, fontSize: '20px', fontWeight: 700 }}>${Math.round(parseFloat(mortgageAccel.offsetBalance || '0') * parseFloat(mortgageAccel.rate || '0') / 100).toLocaleString()}</div></div>
                          <div style={{ padding: '10px', background: theme.bg, borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px' }}>Effective rate on offset</div><div style={{ color: theme.warning, fontSize: '20px', fontWeight: 700 }}>{mortgageAccel.rate}%</div></div>
                        </div>
                      </div>
                      <div style={{ padding: '16px', background: theme.success + '15', borderRadius: '10px', border: '1px solid ' + theme.success + '40' }}>
                        <div style={{ color: theme.success, fontWeight: 600, marginBottom: '8px' }}>🏦 Offset vs Savings Account</div>
                        <div style={{ color: theme.text, fontSize: '13px', lineHeight: 1.6 }}>
                          Offset at {mortgageAccel.rate}% (your mortgage rate) vs a savings account at 5.5%:<br/>
                          <strong>Offset wins</strong> because there's no tax on offset savings — your 'return' is the full mortgage rate, with no tax deducted.
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ ...cardStyle, textAlign: 'center' as const, padding: '40px' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>💡</div>
                      <div style={{ color: theme.text, fontWeight: 600, marginBottom: '8px' }}>Enter your offset balance</div>
                      <div style={{ color: theme.textMuted, fontSize: '14px', lineHeight: 1.6 }}>See how keeping money in an offset account reduces your mortgage interest and cuts years from your loan</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STRATEGY GUIDE */}
            {mortgageTab === 'strategy' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {[
                  { icon: '📅', title: 'Switch to Fortnightly Payments', desc: 'The simplest hack — 26 fortnightly payments = 13 monthly payments per year. You make one extra month of payments without noticing.', saving: '~4 years & $80k+ on a $600k loan', action: 'Call your bank today and switch', difficulty: 'Easy', time: '15 mins' },
                  { icon: '💡', title: 'Open an Offset Account', desc: 'Keep your savings and income in an offset account instead of a regular savings account. Every dollar reduces the interest on your mortgage.', saving: 'Varies — $30k offset at 6% saves $1,800/yr', action: 'Ask your bank if they have an offset account on your loan', difficulty: 'Easy', time: '30 mins' },
                  { icon: '💪', title: 'Make Regular Extra Repayments', desc: 'Even $100–$200 extra per fortnight in the early years can cut 5–8 years off your loan. Start small, increase as your income grows.', saving: '$200/fn extra on a $500k loan: ~$90k saved', action: 'Set up an automatic extra repayment via bank transfer', difficulty: 'Easy', time: '20 mins' },
                  { icon: '🔁', title: 'Refinance If Your Rate Is High', desc: 'If you haven\'t reviewed your rate in 2+ years, you might be on a loyalty tax. Refinancing to a lower rate can save thousands annually.', saving: '0.5% lower rate on $500k = $2,500/yr saved', action: 'Get a free mortgage health check from a broker', difficulty: 'Medium', time: '1-2 hrs' },
                  { icon: '📈', title: 'Direct Windfalls to Your Mortgage', desc: 'Tax returns, bonuses, inheritance — put these directly onto your mortgage. A single $5,000 lump sum can save 2–3x that in interest.', saving: '$5k lump sum at year 5 saves ~$12k in interest', action: 'Create a rule: 50% of any windfall goes to mortgage', difficulty: 'Easy', time: 'Ongoing habit' },
                  { icon: '🏦', title: 'Salary Sacrifice Into Your Mortgage', desc: 'Some employers offer mortgage salary sacrifice arrangements. Combine with your offset to maximise tax efficiency. Ask your HR/payroll team.', saving: 'Varies by income and employer', action: 'Check if your employer offers salary sacrifice for mortgage', difficulty: 'Medium', time: '1-2 hrs' },
                ].map(strat => (
                  <div key={strat.title} style={{ padding: '20px', background: theme.cardBg, borderRadius: '14px', border: '1px solid ' + theme.border }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ fontSize: '28px' }}>{strat.icon}</div>
                      <div><div style={{ color: theme.text, fontWeight: 700, fontSize: '16px' }}>{strat.title}</div><div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}><span style={{ padding: '2px 8px', background: theme.success + '20', color: theme.success, borderRadius: '4px', fontSize: '11px' }}>{strat.difficulty}</span><span style={{ padding: '2px 8px', background: theme.accent + '20', color: theme.accent, borderRadius: '4px', fontSize: '11px' }}>⏱ {strat.time}</span></div></div>
                    </div>
                    <p style={{ color: theme.textMuted, fontSize: '13px', lineHeight: 1.6, margin: '0 0 12px 0' }}>{strat.desc}</p>
                    <div style={{ padding: '10px 12px', background: theme.success + '15', borderRadius: '8px', marginBottom: '12px' }}>
                      <div style={{ color: theme.success, fontSize: '12px', fontWeight: 600 }}>💰 Estimated saving</div>
                      <div style={{ color: theme.text, fontSize: '13px' }}>{strat.saving}</div>
                    </div>
                    <div style={{ padding: '10px 12px', background: theme.accent + '15', borderRadius: '8px' }}>
                      <div style={{ color: theme.accent, fontSize: '12px', fontWeight: 600 }}>✅ Next action</div>
                      <div style={{ color: theme.text, fontSize: '13px' }}>{strat.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== FINANCIAL LITERACY HUB ==================== */}
        {activeTab === 'learn' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e3a5f, #0f172a)', borderRadius: '16px', border: '2px solid #3b82f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '48px' }}>🎓</div>
                <div>
                  <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: '24px' }}>Financial Literacy Hub</h2>
                  <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>Real knowledge behind real money moves. Tap any topic to learn — then ask Aureus to apply it to your situation.</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
              {literacyTopics.map(topic => (
                <div key={topic.id} style={{ background: theme.cardBg, borderRadius: '14px', border: '1px solid ' + (learnExpanded === topic.id ? theme.accent : theme.border), overflow: 'hidden' }}>
                  <button onClick={() => setLearnExpanded(learnExpanded === topic.id ? null : topic.id)} style={{ width: '100%', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' as const }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: theme.accent + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>{topic.icon}</div>
                      <div>
                        <div style={{ color: theme.text, fontWeight: 700, fontSize: '16px' }}>{topic.title}</div>
                        <div style={{ color: theme.textMuted, fontSize: '13px', marginTop: '2px' }}>{topic.tagline}</div>
                      </div>
                    </div>
                    <div style={{ color: theme.accent, fontSize: '20px', flexShrink: 0, marginLeft: '16px' }}>{learnExpanded === topic.id ? '▼' : '▶'}</div>
                  </button>

                  {learnExpanded === topic.id && (
                    <div style={{ padding: '0 20px 20px 20px' }}>
                      <div style={{ height: '1px', background: theme.border, marginBottom: '20px' }} />
                      <p style={{ color: theme.text, fontSize: '14px', lineHeight: 1.8, whiteSpace: 'pre-line' as const, margin: '0 0 20px 0' }}>{topic.content}</p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ padding: '16px', background: theme.accent + '15', borderRadius: '10px' }}>
                          <div style={{ color: theme.accent, fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>📊 Key Numbers</div>
                          {topic.keyNumbers.map((kn, i) => (
                            <div key={i} style={{ color: theme.text, fontSize: '13px', marginBottom: '6px', paddingLeft: '8px', borderLeft: '2px solid ' + theme.accent }}>• {kn}</div>
                          ))}
                        </div>
                        <div style={{ padding: '16px', background: theme.danger + '15', borderRadius: '10px' }}>
                          <div style={{ color: theme.danger, fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>⚠️ Common Mistake</div>
                          <div style={{ color: theme.text, fontSize: '13px', lineHeight: 1.6 }}>{topic.mistake}</div>
                        </div>
                      </div>

                      <button onClick={() => { setChatInput(topic.cta); setActiveTab('chat') }} style={{ ...btnPrimary, width: '100%', padding: '12px', fontSize: '14px' }}>
                        💬 {topic.cta} →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== WINS & ACCOUNTABILITY TAB ==================== */}
        {activeTab === 'wins' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>

            {/* WHY STATEMENT */}
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e3a32, #0f172a)', borderRadius: '16px', border: '2px solid #10b981' }}>
              <div style={{ color: '#94a3b8', fontSize: '12px', letterSpacing: '2px', marginBottom: '12px' }}>❤️ YOUR WHY</div>
              {editingWhy ? (
                <div>
                  <textarea value={whyDraft} onChange={e => setWhyDraft(e.target.value)} placeholder="e.g. 'I want to be mortgage-free before my kids start high school so I can work less and be more present.'" style={{ ...inputStyle, width: '100%', minHeight: '80px', resize: 'vertical' as const, marginBottom: '12px' }} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => { setWhyStatement(whyDraft); setEditingWhy(false) }} style={btnSuccess}>Save My Why</button>
                    <button onClick={() => setEditingWhy(false)} style={{ ...btnPrimary, background: theme.textMuted }}>Cancel</button>
                  </div>
                </div>
              ) : whyStatement ? (
                <div>
                  <div style={{ color: '#f1f5f9', fontSize: '18px', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '12px' }}>"{whyStatement}"</div>
                  <button onClick={() => { setEditingWhy(true); setWhyDraft(whyStatement) }} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Edit</button>
                </div>
              ) : (
                <button onClick={() => setEditingWhy(true)} style={{ padding: '16px', background: 'transparent', border: '2px dashed #334155', borderRadius: '10px', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' as const, width: '100%', fontSize: '14px' }}>
                  + Set your why — the emotional anchor that keeps you on track when things get tough
                </button>
              )}
            </div>

            {/* STREAK & CHECK-IN */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ ...cardStyle, textAlign: 'center' as const }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔥</div>
                <div style={{ color: theme.text, fontSize: '36px', fontWeight: 800, marginBottom: '4px' }}>{streak}</div>
                <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '4px' }}>Week{streak !== 1 ? 's' : ''} straight</div>
                <div style={{ color: theme.textMuted, fontSize: '12px' }}>{lastCheckIn ? `Last check-in: ${new Date(lastCheckIn).toLocaleDateString('en-AU')}` : 'No check-ins yet'}</div>
              </div>
              <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', textAlign: 'center' as const }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
                <div style={{ color: theme.text, fontWeight: 600, marginBottom: '4px' }}>Weekly Check-In</div>
                <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '16px' }}>5 quick questions, keep your streak</div>
                <button onClick={() => { setShowWeeklyCheckIn(true); setCheckInStep(0); setCheckInAnswers({}) }} style={{ ...btnSuccess, width: '100%' }}>
                  {lastCheckIn === new Date().toISOString().split('T')[0] ? '✓ Done today' : 'Do This Week\'s Check-In'}
                </button>
              </div>
            </div>

            {/* AUTO-DETECTED & MANUAL WINS */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>🏆 Your Wins</h3>
                <span style={{ color: theme.textMuted, fontSize: '13px' }}>{wins.length} total</span>
              </div>

              {/* Add manual win */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input value={newWinText} onChange={e => setNewWinText(e.target.value)} onKeyPress={e => { if (e.key === 'Enter' && newWinText.trim()) { setWins(prev => [...prev, { id: Date.now(), title: newWinText.trim(), desc: 'Added manually', icon: '⭐', auto: false, date: new Date().toISOString() }]); setNewWinText('') } }} placeholder="Record a win — any size counts..." style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => { if (newWinText.trim()) { setWins(prev => [...prev, { id: Date.now(), title: newWinText.trim(), desc: 'Added manually', icon: '⭐', auto: false, date: new Date().toISOString() }]); setNewWinText('') } }} style={btnSuccess}>+ Add</button>
              </div>

              {wins.length === 0 ? (
                <div style={{ textAlign: 'center' as const, padding: '40px', color: theme.textMuted }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
                  <div style={{ fontSize: '16px', marginBottom: '8px', color: theme.text }}>No wins recorded yet</div>
                  <div style={{ fontSize: '14px' }}>Add income, set a goal, or do your first check-in to unlock automatic wins!</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
                  {[...wins].reverse().map(win => (
                    <div key={win.id} style={{ padding: '14px 16px', background: win.auto ? (darkMode ? '#1e3a32' : '#f0fdf4') : (darkMode ? '#2e2a1e' : '#fefce8'), borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '14px', border: '1px solid ' + (win.auto ? theme.success + '30' : theme.warning + '30') }}>
                      <div style={{ fontSize: '24px', flexShrink: 0 }}>{win.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: theme.text, fontWeight: 600, marginBottom: '2px' }}>{win.title}</div>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>{win.desc}</div>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>{new Date(win.date).toLocaleDateString('en-AU')}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {win.auto && <span style={{ padding: '2px 8px', background: theme.success + '20', color: theme.success, borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>AUTO</span>}
                        <button onClick={() => setWins(wins.filter(w => w.id !== win.id))} style={{ padding: '2px 6px', background: theme.danger + '20', color: theme.danger, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ACCOUNTABILITY SCORECARD */}
            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>📊 Accountability Scorecard</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Financial Health', value: `${financialHealthScore}/100`, color: financialHealthScore >= 70 ? theme.success : financialHealthScore >= 40 ? theme.warning : theme.danger, desc: 'Overall score' },
                  { label: 'Savings Rate', value: `${savingsRate.toFixed(0)}%`, color: savingsRate >= 20 ? theme.success : savingsRate >= 10 ? theme.warning : theme.danger, desc: 'Of monthly income' },
                  { label: 'Emergency Fund', value: `${emergencyMonths.toFixed(1)} mo`, color: emergencyMonths >= 3 ? theme.success : emergencyMonths >= 1 ? theme.warning : theme.danger, desc: 'Of expenses covered' },
                  { label: 'Passive Income', value: `${passiveCoverage.toFixed(0)}%`, color: passiveCoverage >= 50 ? theme.success : passiveCoverage >= 20 ? theme.warning : theme.danger, desc: 'Of expenses covered' },
                  { label: 'Monthly Surplus', value: `$${monthlySurplus.toFixed(0)}`, color: monthlySurplus > 0 ? theme.success : theme.danger, desc: 'After all bills' },
                  { label: 'Check-In Streak', value: `${streak} wk${streak !== 1 ? 's' : ''}`, color: streak >= 4 ? theme.success : streak >= 1 ? theme.warning : theme.textMuted, desc: 'Consistency score' },
                ].map(metric => (
                  <div key={metric.label} style={{ padding: '16px', background: '#1e293b', borderRadius: '10px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>{metric.label}</div>
                    <div style={{ color: metric.color, fontSize: '22px', fontWeight: 700, marginBottom: '2px' }}>{metric.value}</div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>{metric.desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => { setChatInput('Give me a full assessment of my financial situation and what I should focus on next.'); setActiveTab('chat') }} style={{ ...btnPrimary, width: '100%', marginTop: '16px', padding: '14px' }}>💬 Get Aureus\'s Full Assessment</button>
            </div>
          </div>
        )}

        {/* PATH TAB */}
        {activeTab === 'path' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            <div style={{ padding: '12px 16px', background: theme.warning + '15', borderRadius: '12px', border: '1px solid ' + theme.warning + '40' }}>
              <p style={{ margin: 0, color: theme.textMuted, fontSize: '12px' }}>⚠️ General information only. Not financial advice. Consult licensed professionals before major decisions.</p>
            </div>

            {/* Aureus Chat Widget */}
            <div data-aureus-chat="true" style={{ padding: '20px', background: `linear-gradient(135deg, ${theme.success}15, ${theme.purple}15)`, borderRadius: '16px', border: '2px solid ' + theme.success }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#78350f' }}>A</div>
                <div><div style={{ color: theme.text, fontWeight: 600 }}>Aureus</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>{currentBabyStep.title} · Ask me to build your weekly plan</div></div>
              </div>
              {chatMessages.length > 0 && (
                <div ref={chatContainerRef} style={{ maxHeight: '200px', overflowY: 'auto' as const, marginBottom: '12px', padding: '8px', background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                  {chatMessages.slice(-6).map((msg, idx) => (
                    <div key={idx} style={{ marginBottom: '10px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: msg.role === 'user' ? theme.accent : theme.cardBg, color: msg.role === 'user' ? 'white' : theme.text, fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-wrap' as const }}>{msg.content}</div>
                    </div>
                  ))}
                  {isLoading && <div style={{ padding: '8px', color: theme.textMuted, fontSize: '13px' }}>Aureus is thinking...</div>}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChatMessage()} placeholder="Ask Aureus about your path, or ask for a weekly plan..." style={{ ...inputStyle, flex: 1 }} disabled={isLoading} />
                <button onClick={handleChatMessage} disabled={isLoading || !chatInput.trim()} style={{ ...btnSuccess, opacity: isLoading || !chatInput.trim() ? 0.5 : 1 }}>{isLoading ? '...' : 'Send'}</button>
              </div>
            </div>

            {/* ===== ROADMAP — MOVED TO TOP ===== */}
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '20px', border: '2px solid ' + theme.purple }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>🗺️ My Roadmap</h2>
                  <p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '13px' }}>Add milestones from any section below — then get a weekly action plan from Aureus</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setShowDocUpload(true)} style={{ padding: '8px 14px', background: theme.accent + '20', color: theme.accent, border: '1px solid ' + theme.accent + '40', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>📎 Documents</button>
                  <button onClick={() => setShowAddMilestone(true)} style={{ ...btnPurple, padding: '10px 18px' }}>+ Add Milestone</button>
                </div>
              </div>

              {/* Documents section (compact, shown inline) */}
              {documents.length > 0 && (
                <div style={{ marginBottom: '16px', padding: '12px 16px', background: theme.cardBg, borderRadius: '10px' }}>
                  <div style={{ color: theme.textMuted, fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>📎 Uploaded Documents ({documents.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
                    {documents.map((doc: any) => (
                      <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: theme.bg, borderRadius: '20px', border: '1px solid ' + theme.border }}>
                        <span style={{ fontSize: '14px' }}>{doc.type?.includes('pdf') ? '📄' : doc.type?.includes('image') ? '🖼️' : '📁'}</span>
                        <span style={{ color: theme.text, fontSize: '12px' }}>{doc.name}</span>
                        <button onClick={() => setDocuments(docs => docs.filter((d: any) => d.id !== doc.id))} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '14px', padding: '0 2px', lineHeight: 1 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {roadmapMilestones.length === 0 ? (
                <div style={{ textAlign: 'center' as const, padding: '32px', color: theme.textMuted, border: '2px dashed #334155', borderRadius: '12px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎯</div>
                  <div style={{ color: theme.text, fontWeight: 600, marginBottom: '8px' }}>Your roadmap is empty</div>
                  <div style={{ fontSize: '13px', lineHeight: 1.7, marginBottom: '16px' }}>Add milestones using the <strong style={{ color: theme.purple }}>+ Add to Roadmap</strong> buttons throughout this page, or click below to add your first one.</div>
                  <button onClick={() => setShowAddMilestone(true)} style={{ ...btnPurple }}>Add First Milestone</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                  {roadmapMilestones.map(m => {
                    const pct = parseFloat(m.targetAmount) > 0 ? (m.currentAmount / parseFloat(m.targetAmount)) * 100 : 0
                    const isOpen = expandedMilestone === m.id
                    const planSteps: any[] = m.weeklyPlan || []
                    const donePct = planSteps.length > 0 ? Math.round((planSteps.filter((s: any) => s.done).length / planSteps.length) * 100) : 0
                    return (
                      <div key={m.id} style={{ background: theme.cardBg, borderRadius: '14px', border: '1px solid ' + (isOpen ? theme.purple : theme.border), overflow: 'hidden' }}>
                        {/* Milestone header */}
                        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '20px' }}>{m.icon || '🎯'}</span>
                                <span style={{ color: theme.text, fontWeight: 700, fontSize: '16px' }}>{m.name}</span>
                                {m.targetDate && <span style={{ color: theme.textMuted, fontSize: '11px' }}>📅 {new Date(m.targetDate).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}</span>}
                              </div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {planSteps.length > 0 && (
                                  <span style={{ padding: '3px 8px', background: donePct === 100 ? theme.success + '30' : theme.accent + '20', color: donePct === 100 ? theme.success : theme.accent, borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                                    {donePct === 100 ? '✓ Week done!' : `${donePct}% done`}
                                  </span>
                                )}
                                <button onClick={() => setRoadmapMilestones(roadmapMilestones.filter(x => x.id !== m.id))} style={{ padding: '3px 8px', background: theme.danger + '20', color: theme.danger, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
                              </div>
                            </div>
                            {/* Progress bar */}
                            <div style={{ height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                              <div style={{ width: Math.min(pct, 100) + '%', height: '100%', background: `linear-gradient(90deg, ${theme.purple}, ${theme.success})` }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: theme.textMuted, fontSize: '11px' }}>
                                {parseFloat(m.targetAmount) > 0 ? `$${m.currentAmount.toLocaleString()} / $${parseFloat(m.targetAmount).toLocaleString()}` : m.notes || ''}
                              </span>
                              {m.notes && parseFloat(m.targetAmount) > 0 && <span style={{ color: theme.textMuted, fontSize: '11px' }}>{m.notes}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Weekly plan actions */}
                        <div style={{ padding: '0 20px 16px 20px', display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                          <button
                            onClick={() => generateWeeklyPlan(m.id)}
                            disabled={generatingPlanFor === m.id}
                            style={{ padding: '8px 14px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, opacity: generatingPlanFor === m.id ? 0.6 : 1 }}
                          >
                            {generatingPlanFor === m.id ? '⏳ Generating...' : planSteps.length > 0 ? '🔄 New Weekly Plan' : '📋 Generate Weekly Plan'}
                          </button>
                          {planSteps.length > 0 && (
                            <button onClick={() => setExpandedMilestone(isOpen ? null : m.id)} style={{ padding: '8px 14px', background: isOpen ? theme.purple : theme.purple + '20', color: isOpen ? 'white' : theme.purple, border: '1px solid ' + theme.purple + '40', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                              {isOpen ? '▲ Hide plan' : `▼ View plan (${planSteps.filter((s: any) => s.done).length}/${planSteps.length} done)`}
                            </button>
                          )}
                          <button onClick={() => { setChatInput(`Give me advice on how to achieve: "${m.name}"${m.targetAmount ? ` (target $${m.targetAmount})` : ''}`); setActiveTab('chat') }} style={{ padding: '8px 14px', background: theme.accent + '20', color: theme.accent, border: '1px solid ' + theme.accent + '40', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                            💬 Ask Aureus
                          </button>
                        </div>

                        {/* Expanded weekly plan checklist */}
                        {isOpen && planSteps.length > 0 && (
                          <div style={{ padding: '0 20px 20px 20px' }}>
                            <div style={{ height: '1px', background: theme.border, marginBottom: '14px' }} />
                            <div style={{ color: theme.textMuted, fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>
                              📅 WEEKLY ACTION PLAN
                              {m.planGeneratedAt && <span style={{ fontWeight: 400, marginLeft: '8px' }}>Generated {new Date(m.planGeneratedAt).toLocaleDateString('en-AU')}</span>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                              {planSteps.map((step: any, idx: number) => {
                                // Detect if this step is an Aureus-specific action
                                const isAddGoalStep = step.type === 'add_goal' || /add.*goal|savings goal.*aureus|aureus.*goal|calendar.*reminder|track.*aureus/i.test(step.text)
                                const isReviewStep = step.type === 'review_spending' || /review.*aureus|spending.*aureus|aureus.*spending|check.*aureus/i.test(step.text)

                                return (
                                <div
                                  key={step.id}
                                  style={{ background: step.done ? theme.success + '15' : theme.bg, borderRadius: '10px', border: '1px solid ' + (step.done ? theme.success + '40' : isAddGoalStep ? theme.purple + '60' : theme.border), overflow: 'hidden' }}
                                >
                                  {/* Clickable row */}
                                  <div
                                    onClick={() => togglePlanStep(m.id, step.id)}
                                    style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', cursor: 'pointer' }}
                                  >
                                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: '2px solid ' + (step.done ? theme.success : theme.border), background: step.done ? theme.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                                      {step.done && <span style={{ color: 'white', fontSize: '14px', fontWeight: 700 }}>✓</span>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600 }}>DAY {idx + 1}</span>
                                        {isAddGoalStep && !step.done && <span style={{ padding: '1px 6px', background: theme.purple + '30', color: theme.purple, borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>ACTION IN AUREUS</span>}
                                      </div>
                                      <div style={{ color: step.done ? theme.textMuted : theme.text, fontSize: '14px', lineHeight: 1.5, textDecoration: step.done ? 'line-through' : 'none' }}>{step.text}</div>
                                    </div>
                                  </div>
                                  {/* Inline action button for Aureus-specific steps */}
                                  {isAddGoalStep && !step.done && (
                                    <div style={{ padding: '0 14px 12px 50px', display: 'flex', gap: '8px' }}>
                                      <button
                                        onClick={e => {
                                          e.stopPropagation()
                                          // Pre-fill the goal form with milestone data
                                          setNewGoal({
                                            name: m.name,
                                            target: m.targetAmount || '',
                                            saved: m.currentAmount?.toString() || '0',
                                            deadline: m.targetDate || '',
                                            savingsFrequency: 'weekly',
                                            startDate: new Date().toISOString().split('T')[0],
                                            paymentAmount: m.targetAmount && m.targetDate
                                              ? Math.ceil(parseFloat(m.targetAmount) / Math.max(1, Math.ceil((new Date(m.targetDate).getTime() - Date.now()) / (7 * 86400000)))).toString()
                                              : ''
                                          })
                                          setActiveTab('dashboard')
                                          // Mark step done
                                          togglePlanStep(m.id, step.id)
                                          // Small delay then scroll to goals section
                                          setTimeout(() => {
                                            const el = document.querySelector('[data-section="goals"]')
                                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                          }, 300)
                                        }}
                                        style={{ padding: '7px 14px', background: theme.purple, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
                                      >
                                        🎯 Add to Goals & Calendar →
                                      </button>
                                    </div>
                                  )}
                                </div>
                                )
                              })}
                            </div>
                            {donePct === 100 && (
                              <div style={{ marginTop: '12px', padding: '12px 16px', background: theme.success + '20', borderRadius: '10px', textAlign: 'center' as const, color: theme.success, fontWeight: 600 }}>
                                🎉 Week complete! Tap "New Weekly Plan" to generate next week's steps.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Baby Steps */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>👶 Australian Baby Steps</h2>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
                {australianBabySteps.map(item => {
                  const isCurrent = item.step === currentBabyStep.step
                  const done = item.step < currentBabyStep.step
                  return (
                    <div key={item.step} style={{ padding: '16px', background: done ? (darkMode ? '#1e3a32' : '#f0fdf4') : isCurrent ? (darkMode ? '#2e2a1e' : '#fefce8') : (darkMode ? '#334155' : '#f8fafc'), borderRadius: '12px', border: done ? '2px solid ' + theme.success : isCurrent ? '2px solid ' + theme.warning : '1px solid ' + theme.border }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: done ? theme.success : isCurrent ? theme.warning : theme.purple, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', flexShrink: 0 }}>{done ? '✓' : item.icon}</div>
                        <div onClick={() => setSelectedBabyStep(item.step)} style={{ flex: 1, cursor: 'pointer' }}>
                          <div style={{ color: theme.text, fontWeight: 600, fontSize: '16px' }}>{item.title}</div>
                          <div style={{ color: theme.textMuted, fontSize: '13px' }}>{item.desc}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <button onClick={() => addToRoadmapQuick(item.title, item.icon, '', item.desc)} style={{ padding: '5px 10px', background: theme.purple + '20', color: theme.purple, border: '1px solid ' + theme.purple + '40', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>+ Roadmap</button>
                          <div style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: done ? theme.success : isCurrent ? theme.warning : theme.border, color: done || isCurrent ? 'white' : theme.textMuted }}>{done ? '✓ Done' : isCurrent ? '→ Now' : 'Later'}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* FIRE */}
            <div style={{ padding: '24px', background: `linear-gradient(135deg, ${theme.purple}15, ${theme.success}15)`, borderRadius: '16px', border: '2px solid ' + theme.purple }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>🔥 Escape the Rat Race — FIRE Path</h2>
                <button onClick={() => addToRoadmapQuick('Reach Financial Independence', '🔥', fiPath.fireNumber.toFixed(0), `FIRE number based on ${monthlyIncome > 0 ? `$${monthlyIncome.toFixed(0)}/mo income` : 'current expenses'}`)} style={{ padding: '8px 14px', background: theme.purple + '20', color: theme.purple, border: '1px solid ' + theme.purple + '40', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>+ Add to Roadmap</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={cardStyle}>
                  <h3 style={{ margin: '0 0 12px 0', color: theme.purple }}>🌴 Freedom Target</h3>
                  <div style={{ color: theme.text, fontSize: '14px', lineHeight: 2 }}>
                    <div>Monthly need: <strong>${fiPath.monthlyNeed.toFixed(0)}</strong></div>
                    <div>Passive income: <strong style={{ color: theme.success }}>${(passiveIncome + totalPassiveQuestIncome).toFixed(0)}</strong></div>
                    <div>Passive gap: <strong style={{ color: theme.danger }}>${Math.max(fiPath.passiveGap - totalPassiveQuestIncome, 0).toFixed(0)}</strong></div>
                    <div>Coverage: <strong style={{ color: theme.purple }}>{((passiveIncome + totalPassiveQuestIncome) / Math.max(fiPath.monthlyNeed, 1) * 100).toFixed(1)}%</strong></div>
                  </div>
                </div>
                <div style={cardStyle}>
                  <h3 style={{ margin: '0 0 12px 0', color: theme.success }}>🔥 FIRE Number</h3>
                  <div style={{ color: theme.text, fontSize: '14px', lineHeight: 2 }}>
                    <div>25× annual expenses: <strong>${fiPath.fireNumber.toLocaleString()}</strong></div>
                    <div>Investments + Super: <strong style={{ color: theme.success }}>${fiPath.currentInvestments.toLocaleString()}</strong></div>
                    <div>Progress: <strong style={{ color: theme.purple }}>{fiPath.fireNumber > 0 ? (fiPath.currentInvestments / fiPath.fireNumber * 100).toFixed(1) : 0}%</strong></div>
                    <div>Est. years to FI: <strong style={{ color: theme.purple }}>{fiPath.yearsToFI >= 999 ? '∞' : fiPath.yearsToFI}</strong></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Set & Forget Automation */}
            {incomeStreams.length > 0 && (
              <div style={{ padding: '24px', background: 'linear-gradient(135deg, #3b82f615, #8b5cf615)', borderRadius: '16px', border: '2px solid ' + theme.accent }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>🤖 Set & Forget Automation</h2>
                  <button onClick={() => addToRoadmapQuick('Set Up 3-Account Automation', '🤖', '', 'Automate bills, savings, and spending split every payday')} style={{ padding: '8px 14px', background: theme.accent + '20', color: theme.accent, border: '1px solid ' + theme.accent + '40', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>+ Add to Roadmap</button>
                </div>
                <p style={{ margin: '0 0 20px 0', color: theme.textMuted, fontSize: '13px' }}>Split each pay into three accounts automatically. Bills pay themselves, savings grow on autopilot.</p>
                {(() => {
                  const auto = calculateAutomation()
                  return (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}>
                          <div style={{ fontSize: '28px', marginBottom: '6px' }}>💳</div>
                          <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Bills Account</div>
                          <div style={{ color: theme.warning, fontSize: '26px', fontWeight: 'bold' }}>${auto.bills.total.toFixed(0)}</div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>per {auto.payFrequency}</div>
                          <div style={{ marginTop: '8px' }}>{auto.bills.breakdown.slice(0, 3).map((b: any, i: number) => <div key={i} style={{ fontSize: '11px', color: theme.textMuted, display: 'flex', justifyContent: 'space-between' }}><span>{b.name}</span><span>${b.amount.toFixed(0)}</span></div>)}{auto.bills.breakdown.length > 3 && <div style={{ fontSize: '11px', color: theme.accent }}>+{auto.bills.breakdown.length - 3} more</div>}</div>
                        </div>
                        <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}>
                          <div style={{ fontSize: '28px', marginBottom: '6px' }}>🎯</div>
                          <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Savings Account</div>
                          <div style={{ color: theme.purple, fontSize: '26px', fontWeight: 'bold' }}>${auto.savings.total.toFixed(0)}</div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>per {auto.payFrequency}</div>
                          <div style={{ marginTop: '8px' }}>{auto.savings.breakdown.slice(0, 3).map((s: any, i: number) => <div key={i} style={{ fontSize: '11px', color: theme.textMuted, display: 'flex', justifyContent: 'space-between' }}><span>{s.name}</span><span>${s.amount.toFixed(0)}</span></div>)}</div>
                        </div>
                        <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}>
                          <div style={{ fontSize: '28px', marginBottom: '6px' }}>💵</div>
                          <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Spending Money</div>
                          <div style={{ color: auto.spending >= 0 ? theme.success : theme.danger, fontSize: '26px', fontWeight: 'bold' }}>${auto.spending.toFixed(0)}</div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>per {auto.payFrequency}</div>
                          <div style={{ marginTop: '8px', fontSize: '12px', color: auto.spending >= 0 ? theme.success : theme.danger }}>{auto.spending >= 0 ? '✓ Guilt-free spending' : '⚠️ Over budget'}</div>
                        </div>
                      </div>
                      <div style={{ padding: '12px 16px', background: theme.cardBg, borderRadius: '10px', color: theme.text, fontSize: '13px', lineHeight: 1.6 }}>
                        💡 On payday, auto-transfer <strong style={{ color: theme.warning }}>${auto.bills.total.toFixed(0)}</strong> to bills and <strong style={{ color: theme.purple }}>${auto.savings.total.toFixed(0)}</strong> to savings. Spend <strong style={{ color: theme.success }}>${auto.spending.toFixed(0)}</strong> freely — it's already budgeted.
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Passive Income Quests */}
            <div style={{ padding: '24px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '16px', border: '1px solid ' + theme.border }}>
              <h2 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '22px' }}>💰 Automated Revenue Strategies</h2>
              <p style={{ margin: '0 0 20px 0', color: theme.textMuted, fontSize: '13px' }}>Step-by-step guides to build passive income. Use + Add to Roadmap to track your progress.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {passiveQuests.map(quest => {
                  const isExp = activeQuestId === quest.id
                  return (
                    <div key={quest.id} style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{ width: '44px', height: '44px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{quest.icon}</div>
                          <div><div style={{ fontWeight: 600, color: theme.text, fontSize: '15px' }}>{quest.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{quest.description}</div></div>
                        </div>
                        <span style={{ padding: '3px 8px', background: theme.success + '20', color: theme.success, borderRadius: '4px', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>{quest.potentialIncome}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ padding: '2px 8px', background: theme.bg, color: theme.textMuted, borderRadius: '4px', fontSize: '11px' }}>⏱ {quest.timeToSetup}</span>
                        <span style={{ padding: '2px 8px', background: theme.bg, color: theme.textMuted, borderRadius: '4px', fontSize: '11px' }}>{'★'.repeat(quest.difficulty === 'Easy' ? 1 : quest.difficulty === 'Medium' ? 2 : 3)} {quest.difficulty}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                        <button onClick={() => setActiveQuestId(isExp ? null : quest.id)} style={{ background: 'none', border: 'none', color: theme.accent, fontSize: '13px', cursor: 'pointer', padding: 0 }}>▼ {isExp ? 'Hide' : 'Expand'} guide</button>
                        <button onClick={() => addToRoadmapQuick(`Start: ${quest.name}`, quest.icon, '', `${quest.description} — potential ${quest.potentialIncome}`)} style={{ padding: '4px 10px', background: theme.purple + '20', color: theme.purple, border: '1px solid ' + theme.purple + '40', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>+ Roadmap</button>
                      </div>
                      {isExp && (
                        <div style={{ marginTop: '14px', padding: '14px', background: darkMode ? '#0f172a' : '#f1f5f9', borderRadius: '8px' }}>
                          <div style={{ background: theme.success + '15', padding: '10px', borderRadius: '8px', marginBottom: '12px', borderLeft: '3px solid ' + theme.success }}>
                            <p style={{ margin: 0, color: theme.text, fontSize: '13px', lineHeight: 1.6 }}>💡 {quest.aureusAdvice}</p>
                          </div>
                          {quest.steps?.map((step: any, idx: number) => (
                            <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', padding: '10px', background: theme.cardBg, borderRadius: '8px' }}>
                              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: theme.accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>{idx + 1}</div>
                              <div><div style={{ color: theme.text, fontSize: '13px', fontWeight: 500 }}>{step.title}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{step.description}</div></div>
                            </div>
                          ))}
                          <button onClick={() => { setChatInput(`Tell me more about getting started with ${quest.name}`); setActiveTab('chat') }} style={{ ...btnPrimary, width: '100%', marginTop: '8px', fontSize: '13px', padding: '10px' }}>💬 Ask Aureus</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Rat Race Escape Tracker */}
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '12px', letterSpacing: '2px' }}>🐀 RAT RACE ESCAPE TRACKER</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Passive income as % of monthly expenses</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '44px', fontWeight: 'bold', color: (passiveIncome + totalPassiveQuestIncome) >= fiPath.monthlyNeed ? theme.success : '#f59e0b' }}>
                    {fiPath.monthlyNeed > 0 ? (((passiveIncome + totalPassiveQuestIncome) / fiPath.monthlyNeed) * 100).toFixed(1) : '0.0'}%
                  </div>
                  <button onClick={() => addToRoadmapQuick('Escape the Rat Race', '🐀', (fiPath.monthlyNeed * 12 * 25).toFixed(0), 'Build passive income to cover 100% of expenses')} style={{ padding: '8px 12px', background: theme.warning + '20', color: theme.warning, border: '1px solid ' + theme.warning + '40', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>+ Roadmap</button>
                </div>
              </div>
              <div style={{ height: '14px', background: '#334155', borderRadius: '7px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ width: Math.min(((passiveIncome + totalPassiveQuestIncome) / Math.max(fiPath.monthlyNeed, 1)) * 100, 100) + '%', height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #10b981)', borderRadius: '7px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {[{ pct: 25, label: 'Side income', color: '#94a3b8' }, { pct: 50, label: 'Half covered', color: '#f59e0b' }, { pct: 75, label: 'Almost free', color: '#8b5cf6' }, { pct: 100, label: 'Escaped! 🎉', color: '#10b981' }].map(ms => {
                  const current = fiPath.monthlyNeed > 0 ? ((passiveIncome + totalPassiveQuestIncome) / fiPath.monthlyNeed) * 100 : 0
                  const reached = current >= ms.pct
                  return (
                    <div key={ms.pct} style={{ padding: '10px', background: reached ? ms.color + '20' : '#1e293b', borderRadius: '8px', border: '1px solid ' + (reached ? ms.color : '#334155'), textAlign: 'center' as const }}>
                      <div style={{ color: reached ? ms.color : '#64748b', fontWeight: 700 }}>{ms.pct}%</div>
                      <div style={{ color: reached ? ms.color : '#64748b', fontSize: '10px', marginTop: '2px' }}>{reached ? '✓ ' : ''}{ms.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Australian Home Buying Roadmap */}
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>🏠</div>
                  <div>
                    <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: '22px' }}>Australian Home Buying Roadmap</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Expand each phase · Add phases to your personal roadmap</p>
                  </div>
                </div>
                <button onClick={() => addToRoadmapQuick('Buy My First Home', '🏠', '120000', 'Deposit + costs for property purchase')} style={{ padding: '8px 14px', background: theme.warning + '20', color: theme.warning, border: '1px solid ' + theme.warning + '40', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>+ Add to Roadmap</button>
              </div>

              {[
                { id: 'phase1', num: '1', icon: '💰', title: 'Get Financially Ready', color: theme.warning, items: ['Complete Baby Steps 1–3 first (emergency fund + kill bad debt)', 'Save your deposit: 5% minimum, 20% avoids LMI', 'Check your credit score free via Credit Savvy or Finder', 'Stop applying for new credit 6+ months before applying', 'Consistent income for 12+ months strengthens your application', 'Reduce existing debt and BNPL balances to boost borrowing power'] },
                { id: 'phase2', num: '2', icon: '🧾', title: 'Understand the True Costs', color: theme.purple, items: ['Stamp duty: 0% (first home QLD new builds) to 5.5% (investors)', 'LMI: $8k–$30k if deposit under 20% — often added to your loan', 'Conveyancer / solicitor: ~$1,500–$2,500', 'Building & pest inspection: ~$500–$800', 'Lender fees (application, valuation): ~$500–$1,500', "Moving costs + immediate repairs: budget $3k–$10k", "Budget 3–5% of purchase price in extra costs on top of deposit"] },
                { id: 'phase3', num: '3', icon: '🏛️', title: 'Government Schemes & Grants', color: theme.accent, items: ['First Home Guarantee: 5% deposit, no LMI — 35,000 places/yr', 'Regional First Home Guarantee: same for regional areas', 'Family Home Guarantee: single parents — 2% deposit', 'QLD FHOG: $30,000 grant for new builds', 'NSW FHOG: $10,000 for new builds under $600k', 'First Home Super Saver Scheme: up to $50k from super for deposit', 'Check your state revenue office for current stamp duty concessions'] },
                { id: 'phase4', num: '4', icon: '🏦', title: 'Get Pre-Approved', color: theme.success, items: ['Pre-approval shows sellers you\'re serious — valid ~90 days', 'Use a mortgage broker: access 40+ lenders, free to you (paid by bank)', 'Bring: 3 months payslips, 3 months bank statements, tax returns, ID', 'Understand variable (flexible) vs fixed rate (certainty)', 'Ask about offset accounts — critical for accelerating payoff', 'Compare comparison rates, not just advertised rates', 'Get pre-approval BEFORE falling in love with a property'] },
                { id: 'phase5', num: '5', icon: '🎯', title: 'Buy Smart & Pay It Off Fast', color: theme.danger, items: ['Research suburbs: price trends, yield, infrastructure, school catchments', 'Buy slightly below your max borrowing capacity — buffer for rate rises', 'Switch to fortnightly repayments immediately — saves 3–4 years', 'Open an offset account and park all savings there from day one', 'Direct tax returns, bonuses, and windfalls straight to mortgage', 'Review your rate every 2 years — don\'t pay the loyalty tax', 'Use the Mortgage Accelerator tab to see exactly what extra payments save you'] },
              ].map(phase => (
                <div key={phase.id} style={{ marginBottom: '10px', borderRadius: '12px', overflow: 'hidden', border: '1px solid ' + (homeGuideExpanded === phase.id ? phase.color : '#334155') }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 0 0' }}>
                    <button onClick={() => setHomeGuideExpanded(homeGuideExpanded === phase.id ? null : phase.id)} style={{ flex: 1, padding: '14px 16px', background: homeGuideExpanded === phase.id ? phase.color + '20' : '#1e293b', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' as const }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: phase.color + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{phase.icon}</div>
                      <div>
                        <div style={{ color: phase.color, fontWeight: 700, fontSize: '14px' }}>Phase {phase.num}: {phase.title}</div>
                        <div style={{ color: '#64748b', fontSize: '11px' }}>{phase.items.length} key steps</div>
                      </div>
                      <span style={{ color: phase.color, fontSize: '16px', marginLeft: '8px' }}>{homeGuideExpanded === phase.id ? '▼' : '▶'}</span>
                    </button>
                    <button onClick={() => addToRoadmapQuick(`Home Buying Phase ${phase.num}: ${phase.title}`, phase.icon, '', phase.items[0])} style={{ padding: '6px 10px', background: phase.color + '20', color: phase.color, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>+ Roadmap</button>
                  </div>
                  {homeGuideExpanded === phase.id && (
                    <div style={{ padding: '0 16px 16px 16px', background: '#0f172a' }}>
                      <div style={{ height: '1px', background: '#334155', marginBottom: '14px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                        {phase.items.map((item, i) => (
                          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', background: '#1e293b', borderRadius: '8px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: phase.color + '30', color: phase.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', flexShrink: 0 }}>{i + 1}</div>
                            <div style={{ color: '#e2e8f0', fontSize: '13px', lineHeight: 1.5 }}>{item}</div>
                          </div>
                        ))}
                      </div>
                      {phase.id === 'phase5' && <button onClick={() => setActiveTab('mortgage')} style={{ ...btnSuccess, width: '100%', marginTop: '12px' }}>🚀 Open Mortgage Accelerator →</button>}
                      {phase.id === 'phase3' && (
                        <div style={{ marginTop: '12px', padding: '12px', background: '#1e293b', borderRadius: '8px' }}>
                          <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, marginBottom: '8px' }}>📊 Stamp Duty Quick Reference</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                            {Object.entries(australianHomeData.stampDuty).map(([state, data]: [string, any]) => (
                              <div key={state} style={{ padding: '8px', background: '#0f172a', borderRadius: '6px' }}>
                                <div style={{ color: theme.accent, fontWeight: 700, fontSize: '12px', marginBottom: '2px' }}>{state}</div>
                                <div style={{ color: '#64748b', fontSize: '11px' }}>{data.firstHome}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== INSIGHTS TAB ==================== */}
        {activeTab === 'insights' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>

            {/* MONEY PERSONALITY */}
            {moneyPersonality && personalityProfiles[moneyPersonality] ? (
              <div style={{ padding: '24px', background: `linear-gradient(135deg, ${personalityProfiles[moneyPersonality].color}20, ${personalityProfiles[moneyPersonality].color}05)`, borderRadius: '20px', border: `2px solid ${personalityProfiles[moneyPersonality].color}40` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '56px', flexShrink: 0 }}>{personalityProfiles[moneyPersonality].emoji}</div>
                  <div>
                    <div style={{ color: theme.textMuted, fontSize: '11px', letterSpacing: '2px', marginBottom: '4px' }}>YOUR MONEY PERSONALITY</div>
                    <h2 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '24px' }}>{personalityProfiles[moneyPersonality].label}</h2>
                    <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px', lineHeight: 1.6 }}>{personalityProfiles[moneyPersonality].desc}</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ padding: '14px', background: theme.cardBg, borderRadius: '12px' }}>
                    <div style={{ color: theme.success, fontWeight: 700, fontSize: '12px', marginBottom: '6px' }}>💪 YOUR STRENGTH</div>
                    <div style={{ color: theme.text, fontSize: '13px' }}>{personalityProfiles[moneyPersonality].strength}</div>
                  </div>
                  <div style={{ padding: '14px', background: theme.cardBg, borderRadius: '12px' }}>
                    <div style={{ color: theme.warning, fontWeight: 700, fontSize: '12px', marginBottom: '6px' }}>⚠️ WATCH OUT FOR</div>
                    <div style={{ color: theme.text, fontSize: '13px' }}>{personalityProfiles[moneyPersonality].blindspot}</div>
                  </div>
                </div>
                <div style={{ padding: '14px', background: theme.cardBg, borderRadius: '12px', borderLeft: '4px solid ' + personalityProfiles[moneyPersonality].color }}>
                  <div style={{ color: personalityProfiles[moneyPersonality].color, fontWeight: 700, fontSize: '12px', marginBottom: '6px' }}>🎯 AUREUS FOCUS FOR YOU</div>
                  <div style={{ color: theme.text, fontSize: '13px', lineHeight: 1.5 }}>{personalityProfiles[moneyPersonality].aureusFocus}</div>
                </div>
                <button onClick={() => { setShowOnboarding(true); setOnboardingStep(1) }} style={{ marginTop: '14px', padding: '10px 18px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.textMuted, cursor: 'pointer', fontSize: '13px' }}>Retake personality quiz</button>
              </div>
            ) : (
              <div style={{ padding: '24px', background: theme.cardBg, borderRadius: '20px', border: '2px dashed ' + theme.border, textAlign: 'center' as const }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🧠</div>
                <h3 style={{ color: theme.text, margin: '0 0 8px 0' }}>Discover your Money Personality</h3>
                <p style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '16px' }}>8 questions. Understand how you're wired with money and how Aureus can coach you better.</p>
                <button onClick={() => { setShowOnboarding(true); setOnboardingStep(1) }} style={{ ...btnPrimary, padding: '12px 24px' }}>Take the Quiz →</button>
              </div>
            )}

            {/* PROACTIVE INSIGHTS */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>🧠 Aureus Notices...</h3>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>
                    {insightsGeneratedAt ? `Last updated ${new Date(insightsGeneratedAt).toLocaleDateString('en-AU')}` : 'AI-powered observations about your finances'}
                  </div>
                </div>
                <button onClick={generateProactiveInsights} disabled={loadingInsights} style={{ ...btnPrimary, padding: '8px 16px', opacity: loadingInsights ? 0.6 : 1 }}>
                  {loadingInsights ? '⏳ Analysing...' : '🔄 Refresh'}
                </button>
              </div>
              {proactiveInsights.length === 0 ? (
                <div style={{ textAlign: 'center' as const, padding: '32px', color: theme.textMuted }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>👀</div>
                  <div style={{ color: theme.text, fontWeight: 600, marginBottom: '8px' }}>Let Aureus analyse your finances</div>
                  <div style={{ fontSize: '13px', marginBottom: '16px' }}>Add your income and expenses first, then tap Refresh to get personalised insights.</div>
                  <button onClick={generateProactiveInsights} disabled={loadingInsights || incomeStreams.length === 0} style={{ ...btnPrimary, opacity: incomeStreams.length === 0 ? 0.5 : 1 }}>
                    {incomeStreams.length === 0 ? 'Add income first' : 'Generate Insights'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
                  {proactiveInsights.map((insight, i) => (
                    <div key={i} style={{ padding: '14px 16px', background: theme.bg, borderRadius: '10px', border: '1px solid ' + theme.border }}>
                      <div style={{ color: theme.text, fontSize: '14px', lineHeight: 1.6 }}>{insight}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* THE ONE DECISION */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, color: theme.warning, fontSize: '20px' }}>🎯 Your ONE Decision This Week</h3>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>The single highest-leverage action right now</div>
                </div>
                <button onClick={generateOneDecision} disabled={loadingOneDecision} style={{ ...btnWarning, padding: '8px 16px', opacity: loadingOneDecision ? 0.6 : 1 }}>
                  {loadingOneDecision ? '⏳...' : oneDecision ? '🔄 New' : '⚡ Generate'}
                </button>
              </div>
              {oneDecision ? (
                <div>
                  <div style={{ padding: '20px', background: `linear-gradient(135deg, ${theme.warning}15, ${theme.orange}10)`, borderRadius: '12px', border: '2px solid ' + theme.warning + '40', marginBottom: '12px' }}>
                    <div style={{ color: theme.text, fontSize: '16px', lineHeight: 1.7, fontWeight: 500 }}>{oneDecision}</div>
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: '11px' }}>Generated {oneDecisionDate && new Date(oneDecisionDate).toLocaleDateString('en-AU')} · Tap "New" for a fresh one</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' as const, padding: '24px', color: theme.textMuted }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>⚡</div>
                  <div style={{ fontSize: '14px' }}>Aureus will identify the single most impactful financial move you can make this week — based on your specific numbers.</div>
                </div>
              )}
            </div>

            {/* SPENDING PATTERN INSIGHTS */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>📊 Spending Patterns</h3>
                <button onClick={generateSpendingInsights} disabled={loadingSpendingInsights || expenses.length < 3} style={{ ...btnPrimary, padding: '8px 16px', opacity: (loadingSpendingInsights || expenses.length < 3) ? 0.5 : 1 }}>
                  {loadingSpendingInsights ? '⏳ Analysing...' : '🔍 Analyse'}
                </button>
              </div>
              {spendingInsights.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                  {spendingInsights.map((insight, i) => (
                    <div key={i} style={{ padding: '12px 14px', background: theme.bg, borderRadius: '8px', color: theme.text, fontSize: '14px', lineHeight: 1.5 }}>{insight}</div>
                  ))}
                </div>
              ) : (
                <div style={{ color: theme.textMuted, fontSize: '14px', textAlign: 'center' as const, padding: '20px' }}>
                  {expenses.length < 3 ? 'Add at least 3 expenses in Budget to unlock spending pattern analysis.' : 'Tap Analyse to get AI-powered insights about your spending patterns.'}
                </div>
              )}
            </div>

            {/* LATTE FACTOR CALCULATOR */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 6px 0', color: theme.text, fontSize: '20px' }}>☕ The Real Cost of Your Habits</h3>
              <p style={{ margin: '0 0 20px 0', color: theme.textMuted, fontSize: '13px' }}>What does that daily spend really cost over {latteYears} years? <em>This isn't about guilt — it's about conscious choice.</em></p>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' as const }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Investment return rate %</label>
                  <input type="number" value={latteReturnRate} onChange={e => setLatteReturnRate(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Time horizon (years)</label>
                  <input type="number" value={latteYears} onChange={e => setLatteYears(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
                </div>
              </div>
              {latteItems.map(item => {
                const monthly = latteFreqToMonthly(item.frequency, parseFloat(item.amount || '0'))
                const impact = calcLatteImpact(monthly, parseFloat(latteYears || '20'), parseFloat(latteReturnRate || '8'))
                return (
                  <div key={item.id} style={{ padding: '14px 16px', background: theme.bg, borderRadius: '10px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '22px' }}>{item.emoji}</span>
                      <div>
                        <div style={{ color: theme.text, fontWeight: 600 }}>{item.name}</div>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>${item.amount} {item.frequency} = ${monthly.toFixed(0)}/mo</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' as const }}>
                      <div style={{ color: theme.danger, fontWeight: 700, fontSize: '18px' }}>${Math.round(impact / 1000)}k</div>
                      <div style={{ color: theme.textMuted, fontSize: '11px' }}>over {latteYears} yrs</div>
                    </div>
                    <button onClick={() => setLatteItems(prev => prev.filter(i => i.id !== item.id))} style={{ padding: '2px 8px', background: theme.danger + '20', color: theme.danger, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginLeft: '8px' }}>×</button>
                  </div>
                )
              })}
              <div style={{ padding: '16px', background: `linear-gradient(135deg, ${theme.danger}15, ${theme.warning}10)`, borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>Total monthly spend</div>
                  <div style={{ color: theme.text, fontWeight: 700, fontSize: '18px' }}>${totalLatteMonthly.toFixed(0)}/mo</div>
                </div>
                <div style={{ textAlign: 'right' as const }}>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>Invested over {latteYears} years</div>
                  <div style={{ color: theme.danger, fontWeight: 700, fontSize: '22px' }}>${Math.round(totalLatteImpact / 1000)}k</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input placeholder="Habit name" value={newLatteItem.name} onChange={e => setNewLatteItem({...newLatteItem, name: e.target.value})} style={{...inputStyle, flex: 2}} />
                <input type="number" placeholder="$" value={newLatteItem.amount} onChange={e => setNewLatteItem({...newLatteItem, amount: e.target.value})} style={{...inputStyle, width: '70px'}} />
                <select value={newLatteItem.frequency} onChange={e => setNewLatteItem({...newLatteItem, frequency: e.target.value})} style={inputStyle}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <button onClick={() => { if (newLatteItem.name && newLatteItem.amount) { setLatteItems(prev => [...prev, { ...newLatteItem, id: Date.now(), emoji: '💸' }]); setNewLatteItem({ name: '', amount: '', frequency: 'daily', emoji: '💸' }) } }} style={btnDanger}>+</button>
              </div>
              <div style={{ padding: '12px 14px', background: theme.success + '15', borderRadius: '8px', color: theme.text, fontSize: '13px', lineHeight: 1.6 }}>
                💡 This isn't about cutting everything you enjoy. It's about choosing which habits are actually worth ${Math.round(totalLatteImpact / 1000)}k to you. Some will be. Some won't.
              </div>
            </div>

            {/* COMMUNITY STATS */}
            <div style={{ padding: '20px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '16px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#f1f5f9', fontSize: '18px' }}>🌏 You're Not Alone</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {[
                  { stat: '847', label: 'users on Baby Step 2 right now', sub: 'Average completion: 14 months' },
                  { stat: '$2.4M', label: 'in interest savings identified this week', sub: 'Across all Aureus users' },
                  { stat: '4.2×', label: 'faster debt payoff with weekly check-ins', sub: 'vs. users who skip them' },
                  { stat: '91%', label: 'of users feel less stressed after 30 days', sub: 'Based on check-in data' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '14px', background: '#1e293b', borderRadius: '10px' }}>
                    <div style={{ color: theme.success, fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>{item.stat}</div>
                    <div style={{ color: '#e2e8f0', fontSize: '13px', marginBottom: '2px' }}>{item.label}</div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== GROW TAB ==================== */}
        {activeTab === 'grow' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>

            {/* WEALTH SNAPSHOT */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>📈 Wealth Trajectory</h3>
                  <div style={{ color: theme.textMuted, fontSize: '13px', marginTop: '4px' }}>Your net worth — past and projected</div>
                </div>
                <div style={{ textAlign: 'right' as const }}>
                  <div style={{ color: netWorth >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 800 }}>${netWorth.toLocaleString()}</div>
                  <div style={{ color: theme.textMuted, fontSize: '11px' }}>Current net worth</div>
                </div>
              </div>
              {/* SVG Chart */}
              {(() => {
                const data = netWorthChartData
                if (data.length < 2) return (
                  <div style={{ padding: '40px', textAlign: 'center' as const, color: theme.textMuted }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                    <div>Your wealth trajectory will appear here as you track progress over time. Do your first Annual Review to start the chart.</div>
                  </div>
                )
                const values = data.map(d => d.value)
                const min = Math.min(...values)
                const max = Math.max(...values)
                const range = max - min || 1
                const W = 600, H = 200, PAD = 40
                const points = data.map((d, i) => {
                  const x = PAD + (i / (data.length - 1)) * (W - PAD * 2)
                  const y = H - PAD - ((d.value - min) / range) * (H - PAD * 2)
                  return { x, y, ...d }
                })
                const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
                return (
                  <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d={`${pathD} L${points[points.length-1].x},${H-PAD} L${points[0].x},${H-PAD} Z`} fill="url(#chartGrad)" />
                    <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                    {points.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="5" fill={p.projected ? '#f59e0b' : '#10b981'} />
                        <text x={p.x} y={H - 8} textAnchor="middle" fill="#64748b" fontSize="11">{p.date}</text>
                        <text x={p.x} y={p.y - 10} textAnchor="middle" fill={p.projected ? '#f59e0b' : '#10b981'} fontSize="10">${Math.round(p.value / 1000)}k</text>
                      </g>
                    ))}
                    <line x1={PAD} y1={H-PAD} x2={W-PAD} y2={H-PAD} stroke="#334155" strokeWidth="1"/>
                  </svg>
                )
              })()}
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', justifyContent: 'center' as const }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: theme.success }} /><span style={{ color: theme.textMuted, fontSize: '12px' }}>Actual</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: theme.warning }} /><span style={{ color: theme.textMuted, fontSize: '12px' }}>Projected</span></div>
              </div>
            </div>

            {/* SUPER OPTIMIZER */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 6px 0', color: theme.text, fontSize: '20px' }}>🦺 Superannuation Optimizer</h3>
              <p style={{ margin: '0 0 20px 0', color: theme.textMuted, fontSize: '13px' }}>See the real impact of salary sacrifice and how fees are affecting your retirement.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                {[
                  { label: 'Current super balance ($)', key: 'currentBalance', placeholder: 'e.g. 45000' },
                  { label: 'Current age', key: 'currentAge', placeholder: 'e.g. 32' },
                  { label: 'Retirement age', key: 'retirementAge', placeholder: '67' },
                  { label: 'Annual salary ($)', key: 'salary', placeholder: 'e.g. 85000' },
                  { label: 'Employer SG rate (%)', key: 'employerRate', placeholder: '11.5' },
                  { label: 'Extra salary sacrifice ($/fortnight)', key: 'extraContribution', placeholder: 'e.g. 100' },
                  { label: 'Super fund fee rate (% p.a.)', key: 'fundFeeRate', placeholder: 'e.g. 0.8' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>{field.label}</label>
                    <input type="number" step="0.1" value={(superData as any)[field.key]} onChange={e => setSuperData(prev => ({ ...prev, [field.key]: e.target.value }))} placeholder={field.placeholder} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                ))}
              </div>
              {superData.currentBalance && superData.currentAge && superData.salary && (() => {
                const proj = calcSuperProjection()
                return (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
                      <div style={{ padding: '16px', background: theme.bg, borderRadius: '12px', textAlign: 'center' as const }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Employer only</div>
                        <div style={{ color: theme.text, fontSize: '22px', fontWeight: 700 }}>${Math.round(proj.projectedNoExtra / 1000)}k</div>
                        <div style={{ color: theme.textMuted, fontSize: '11px' }}>at retirement</div>
                      </div>
                      <div style={{ padding: '16px', background: theme.success + '15', borderRadius: '12px', textAlign: 'center' as const, border: '2px solid ' + theme.success + '40' }}>
                        <div style={{ color: theme.success, fontSize: '11px', marginBottom: '4px' }}>With salary sacrifice</div>
                        <div style={{ color: theme.success, fontSize: '22px', fontWeight: 700 }}>${Math.round(proj.projected / 1000)}k</div>
                        <div style={{ color: theme.success, fontSize: '11px' }}>+${Math.round(proj.extraImpact / 1000)}k more</div>
                      </div>
                      <div style={{ padding: '16px', background: theme.warning + '15', borderRadius: '12px', textAlign: 'center' as const }}>
                        <div style={{ color: theme.warning, fontSize: '11px', marginBottom: '4px' }}>Annual tax saving</div>
                        <div style={{ color: theme.warning, fontSize: '22px', fontWeight: 700 }}>${Math.round(proj.taxSaving).toLocaleString()}</div>
                        <div style={{ color: theme.warning, fontSize: '11px' }}>from salary sacrifice</div>
                      </div>
                    </div>
                    <div style={{ padding: '14px', background: theme.cardBg, borderRadius: '10px', color: theme.text, fontSize: '13px', lineHeight: 1.6 }}>
                      💡 At {superData.fundFeeRate}% in fees, you're paying ~${Math.round(parseFloat(superData.currentBalance || '0') * parseFloat(superData.fundFeeRate || '0') / 100).toLocaleString()}/year in management fees. Compare your fund at <strong>superratings.com.au</strong> — a 0.5% fee difference on $200k is $1,000/year.
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* OFFSET OPTIMIZER */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 6px 0', color: theme.text, fontSize: '20px' }}>💡 Offset vs Savings: The Real Answer</h3>
              <p style={{ margin: '0 0 16px 0', color: theme.textMuted, fontSize: '13px' }}>Should you keep savings in an offset account or a high-interest savings account? Here's the actual maths for your situation.</p>
              {mortgageAccel.rate ? (() => {
                const mortgageRate = parseFloat(mortgageAccel.rate || '0')
                const savingsRate = 5.25 // typical HISA rate
                const taxRate = 0.325 // typical marginal rate
                const afterTaxSavings = savingsRate * (1 - taxRate)
                const offsetWins = mortgageRate > afterTaxSavings
                return (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div style={{ padding: '16px', background: offsetWins ? theme.success + '15' : theme.bg, borderRadius: '12px', border: offsetWins ? '2px solid ' + theme.success + '40' : '1px solid ' + theme.border }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '6px' }}>OFFSET ACCOUNT</div>
                        <div style={{ color: offsetWins ? theme.success : theme.text, fontSize: '24px', fontWeight: 800 }}>{mortgageRate.toFixed(2)}%</div>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>effective return (tax-free)</div>
                        {offsetWins && <div style={{ color: theme.success, fontSize: '12px', fontWeight: 600, marginTop: '6px' }}>✓ WINNER for your situation</div>}
                      </div>
                      <div style={{ padding: '16px', background: !offsetWins ? theme.success + '15' : theme.bg, borderRadius: '12px', border: !offsetWins ? '2px solid ' + theme.success + '40' : '1px solid ' + theme.border }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '6px' }}>HIGH-INTEREST SAVINGS</div>
                        <div style={{ color: !offsetWins ? theme.success : theme.text, fontSize: '24px', fontWeight: 800 }}>{afterTaxSavings.toFixed(2)}%</div>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>after tax (32.5% marginal)</div>
                        {!offsetWins && <div style={{ color: theme.success, fontSize: '12px', fontWeight: 600, marginTop: '6px' }}>✓ WINNER for your situation</div>}
                      </div>
                    </div>
                    <div style={{ padding: '14px 16px', background: (offsetWins ? theme.success : theme.accent) + '15', borderRadius: '10px', color: theme.text, fontSize: '13px', lineHeight: 1.7 }}>
                      <strong>Verdict:</strong> {offsetWins
                        ? `Your mortgage rate (${mortgageRate}%) beats the after-tax savings rate (${afterTaxSavings.toFixed(2)}%). Every dollar in your offset account earns the equivalent of ${mortgageRate}% risk-free and tax-free. Put your savings in the offset.`
                        : `Your after-tax savings rate (${afterTaxSavings.toFixed(2)}%) beats your mortgage rate (${mortgageRate}%). A high-interest savings account is slightly better for now — but watch if rates change.`}
                    </div>
                  </div>
                )
              })() : (
                <div style={{ color: theme.textMuted, textAlign: 'center' as const, padding: '20px' }}>Enter your mortgage rate in the Mortgage Accelerator tab first.</div>
              )}
            </div>
          </div>
        )}

        {/* ==================== REVIEW TAB ==================== */}
        {activeTab === 'review' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>

            {/* MONEY DATE */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>💰 Money Date</h3>
                  <p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '13px' }}>A 10-minute weekly ritual. Consistent money dates are the single biggest predictor of financial progress.</p>
                </div>
                <button onClick={() => setShowMoneyDate(true)} style={{ ...btnSuccess, padding: '10px 18px' }}>
                  Start Money Date →
                </button>
              </div>
              {streak > 0 && (
                <div style={{ padding: '12px 16px', background: theme.warning + '15', borderRadius: '10px', border: '1px solid ' + theme.warning + '30', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>🔥</span>
                  <div><div style={{ color: theme.warning, fontWeight: 700 }}>{streak}-week streak!</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>Last check-in: {lastCheckIn && new Date(lastCheckIn).toLocaleDateString('en-AU')}</div></div>
                </div>
              )}
              {moneyDateLog.length > 0 && (
                <div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', fontWeight: 600, marginBottom: '12px' }}>Recent Money Dates</div>
                  {moneyDateLog.slice(0, 3).map((entry: any) => (
                    <div key={entry.id} style={{ padding: '12px 14px', background: theme.bg, borderRadius: '10px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>{new Date(entry.date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                        <span style={{ color: parseInt(entry.stressLevel) <= 2 ? theme.success : parseInt(entry.stressLevel) >= 4 ? theme.danger : theme.warning, fontSize: '12px' }}>Stress: {entry.stressLevel}/5</span>
                      </div>
                      {entry.win && <div style={{ color: theme.success, fontSize: '12px' }}>⭐ {entry.win}</div>}
                      {entry.intention && <div style={{ color: theme.accent, fontSize: '12px', marginTop: '4px' }}>→ {entry.intention}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ANNUAL MONEY REVIEW */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>📆 Annual Money Review</h3>
                  <p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '13px' }}>Your yearly performance review — what you built, what you learned, where you're going.</p>
                </div>
                <button onClick={() => setShowAnnualReview(true)} style={{ ...btnPurple, padding: '10px 18px' }}>
                  {annualReviews.length > 0 ? `Review #${annualReviews.length + 1}` : 'Start First Review →'}
                </button>
              </div>
              {annualReviews.length > 0 ? (
                annualReviews.slice(0, 2).map((review: any) => (
                  <div key={review.id} style={{ padding: '16px', background: theme.bg, borderRadius: '12px', marginBottom: '10px', border: '1px solid ' + theme.border }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ color: theme.text, fontWeight: 700 }}>📆 {review.year} Review</span>
                      <span style={{ color: review.netWorthSnapshot >= 0 ? theme.success : theme.danger, fontWeight: 600 }}>Net worth: ${review.netWorthSnapshot?.toLocaleString()}</span>
                    </div>
                    {review.answers[0] && <div style={{ color: theme.success, fontSize: '13px', marginBottom: '6px' }}>🏆 Win: {review.answers[0]}</div>}
                    {review.answers[5] && <div style={{ color: theme.accent, fontSize: '13px' }}>🎯 Intentions: {review.answers[5]}</div>}
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px', textAlign: 'center' as const, color: theme.textMuted }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>📆</div>
                  <div style={{ fontSize: '14px', lineHeight: 1.6 }}>Your first Annual Review captures where you are today — wins, mistakes, lessons, and intentions for the year ahead. It takes 10 minutes and is one of the most powerful financial habits you can build.</div>
                </div>
              )}
            </div>

            {/* FEAR AUDIT */}
            <div style={{ padding: '24px', background: darkMode ? '#1a1020' : '#faf5ff', borderRadius: '20px', border: '2px solid ' + theme.purple + '40' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>🧠 Money Fear Audit</h3>
                  <p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '13px' }}>Money shame is the #1 reason people avoid their finances. This exercise surfaces the beliefs holding you back. It's private, it's powerful, and it's the work most people never do.</p>
                </div>
                {!fearAuditComplete && <button onClick={() => setShowFearAudit(true)} style={{ ...btnPurple, padding: '10px 18px' }}>Start Audit →</button>}
              </div>
              {fearAuditComplete ? (
                <div>
                  <div style={{ padding: '14px 16px', background: theme.success + '15', borderRadius: '10px', marginBottom: '14px', border: '1px solid ' + theme.success + '30' }}>
                    <div style={{ color: theme.success, fontWeight: 600, marginBottom: '4px' }}>✅ Fear Audit Complete</div>
                    <div style={{ color: theme.textMuted, fontSize: '13px' }}>You've done the work most people avoid. Awareness of your money beliefs is the first step to rewriting them.</div>
                  </div>
                  {fearAuditAnswers[2] && (
                    <div style={{ padding: '14px', background: theme.bg, borderRadius: '10px', marginBottom: '8px' }}>
                      <div style={{ color: theme.purple, fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>WHAT YOU BELIEVED ABOUT YOURSELF</div>
                      <div style={{ color: theme.text, fontSize: '14px', fontStyle: 'italic' }}>"{fearAuditAnswers[2]}"</div>
                    </div>
                  )}
                  {fearAuditAnswers[4] && (
                    <div style={{ padding: '14px', background: theme.success + '10', borderRadius: '10px' }}>
                      <div style={{ color: theme.success, fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>WHAT IT MEANS WHEN YOU SUCCEED</div>
                      <div style={{ color: theme.text, fontSize: '14px', fontStyle: 'italic' }}>"{fearAuditAnswers[4]}"</div>
                    </div>
                  )}
                  <button onClick={() => setShowFearAudit(true)} style={{ marginTop: '12px', padding: '8px 16px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.textMuted, cursor: 'pointer', fontSize: '13px' }}>Revisit Fear Audit</button>
                </div>
              ) : (
                <div style={{ color: theme.textMuted, fontSize: '13px', lineHeight: 1.7 }}>
                  Research by Brené Brown and financial therapists consistently shows that the emotional roots of money behaviour run deeper than logic. Most financial advice ignores this entirely. Aureus doesn't.
                </div>
              )}
            </div>

            {/* DEEP WHY DISPLAY */}
            {deepWhyComplete && Object.keys(deepWhyAnswers).length > 0 && (
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '20px' }}>❤️ Your Deep Why</h3>
                {deepWhyQuestions.map((q, i) => deepWhyAnswers[i] && (
                  <div key={i} style={{ padding: '12px 14px', background: theme.bg, borderRadius: '10px', marginBottom: '8px' }}>
                    <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>{q}</div>
                    <div style={{ color: theme.text, fontSize: '14px', fontStyle: 'italic' }}>"{deepWhyAnswers[i]}"</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '20px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#64748b', fontSize: '12px', letterSpacing: '2px' }}>FINANCIAL HEALTH SCORE</div>
                <div style={{ fontSize: '48px', fontWeight: 700, color: financialHealthScore >= 70 ? theme.success : financialHealthScore >= 40 ? theme.warning : theme.danger }}>{financialHealthScore}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {[
                { label: 'Monthly Income', value: `$${monthlyIncome.toFixed(0)}`, color: theme.success },
                { label: 'Total Bills', value: `$${totalOutgoing.toFixed(0)}`, color: theme.danger },
                { label: 'Net Monthly', value: `$${monthlySurplus.toFixed(0)}`, color: monthlySurplus >= 0 ? theme.success : theme.danger },
                { label: 'Net Worth', value: `$${netWorth.toFixed(0)}`, color: netWorth >= 0 ? theme.success : theme.danger },
              ].map(m => (
                <div key={m.label} style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>{m.label}</div>
                  <div style={{ color: m.color, fontSize: '24px', fontWeight: 700 }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={cardStyle}><h3 style={{ margin: '0 0 16px 0', color: theme.success }}>📈 Assets (${totalAssets.toLocaleString()})</h3>{assets.map(a => <div key={a.id} style={{ padding: '10px', marginBottom: '6px', background: theme.bg, borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text }}>{a.name}</span><span style={{ color: theme.success, fontWeight: 700 }}>${parseFloat(a.value).toLocaleString()}</span></div>)}{assets.length === 0 && <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No assets added</p>}</div>
              <div style={cardStyle}><h3 style={{ margin: '0 0 16px 0', color: theme.danger }}>📉 Liabilities (${(totalLiabilities + totalDebtBalance).toFixed(0)})</h3>{debts.map(d => <div key={d.id} style={{ padding: '10px', marginBottom: '6px', background: theme.bg, borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text }}>💳 {d.name}</span><span style={{ color: theme.danger, fontWeight: 700 }}>${parseFloat(d.balance).toFixed(0)}</span></div>)}{debts.length === 0 && <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No debts</p>}</div>
            </div>
          </div>
        )}

      </main>

      {/* ==================== MODALS ==================== */}

      {/* WHY EDIT - shown from quickview */}
      {editingWhy && activeTab !== 'wins' && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setEditingWhy(false)}>
          <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px 0', color: theme.text }}>❤️ Set Your Why</h3>
            <p style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '16px' }}>What are you really working toward? This statement is shown on your dashboard to keep you anchored when motivation dips.</p>
            <textarea value={whyDraft} onChange={e => setWhyDraft(e.target.value)} placeholder="e.g. 'I want to be mortgage-free before my kids finish primary school so I can work less and be more present.'" style={{ ...inputStyle, width: '100%', minHeight: '100px', resize: 'vertical' as const, marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setWhyStatement(whyDraft); setEditingWhy(false) }} style={{ ...btnSuccess, flex: 1 }}>Save</button>
              <button onClick={() => setEditingWhy(false)} style={{ ...btnPrimary, background: theme.textMuted }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* WEEKLY CHECK-IN MODAL */}
      {showWeeklyCheckIn && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: theme.cardBg, borderRadius: '20px', padding: '28px', maxWidth: '500px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>📋 Weekly Check-In</h3>
                <div style={{ color: theme.textMuted, fontSize: '13px', marginTop: '4px' }}>Question {checkInStep + 1} of {checkInQuestions.length}</div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {checkInQuestions.map((_, i) => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i <= checkInStep ? theme.success : theme.border }} />)}
              </div>
            </div>

            <div style={{ padding: '20px', background: theme.bg, borderRadius: '12px', marginBottom: '20px' }}>
              <p style={{ color: theme.text, fontSize: '16px', fontWeight: 500, margin: 0 }}>{checkInQuestions[checkInStep].q}</p>
            </div>

            {checkInQuestions[checkInStep].type === 'yesno' && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <button onClick={() => setCheckInAnswers({...checkInAnswers, [checkInStep]: 'yes'})} style={{ flex: 1, padding: '14px', background: checkInAnswers[checkInStep] === 'yes' ? theme.success : theme.bg, color: checkInAnswers[checkInStep] === 'yes' ? 'white' : theme.text, border: '2px solid ' + (checkInAnswers[checkInStep] === 'yes' ? theme.success : theme.border), borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: 600 }}>👍 Yes</button>
                <button onClick={() => setCheckInAnswers({...checkInAnswers, [checkInStep]: 'no'})} style={{ flex: 1, padding: '14px', background: checkInAnswers[checkInStep] === 'no' ? theme.danger : theme.bg, color: checkInAnswers[checkInStep] === 'no' ? 'white' : theme.text, border: '2px solid ' + (checkInAnswers[checkInStep] === 'no' ? theme.danger : theme.border), borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: 600 }}>👎 No</button>
              </div>
            )}

            {checkInQuestions[checkInStep].type === 'scale' && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setCheckInAnswers({...checkInAnswers, [checkInStep]: n.toString()})} style={{ flex: 1, padding: '14px', background: checkInAnswers[checkInStep] === n.toString() ? theme.accent : theme.bg, color: checkInAnswers[checkInStep] === n.toString() ? 'white' : theme.text, border: '2px solid ' + (checkInAnswers[checkInStep] === n.toString() ? theme.accent : theme.border), borderRadius: '10px', cursor: 'pointer', fontSize: '18px', fontWeight: 700 }}>{n}</button>
                ))}
              </div>
            )}

            {checkInQuestions[checkInStep].type === 'text' && (
              <div style={{ marginBottom: '20px' }}>
                <input value={checkInAnswers[checkInStep] || ''} onChange={e => setCheckInAnswers({...checkInAnswers, [checkInStep]: e.target.value})} placeholder="e.g. Made an extra $100 mortgage payment" style={{ ...inputStyle, width: '100%', padding: '14px 16px' }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              {checkInStep > 0 && <button onClick={() => setCheckInStep(s => s - 1)} style={{ ...btnPrimary, background: theme.textMuted }}>← Back</button>}
              {checkInStep < checkInQuestions.length - 1 ? (
                <button onClick={() => setCheckInAnswers(a => { if (!a[checkInStep]) return a; setCheckInStep(s => s + 1); return a })} disabled={!checkInAnswers[checkInStep]} style={{ ...btnPrimary, flex: 1, opacity: !checkInAnswers[checkInStep] ? 0.5 : 1 }}>Next →</button>
              ) : (
                <button onClick={submitCheckIn} style={{ ...btnSuccess, flex: 1, fontSize: '16px' }}>✅ Submit Check-In</button>
              )}
            </div>
            <button onClick={() => setShowWeeklyCheckIn(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', width: '100%', marginTop: '12px', fontSize: '13px' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* EXPANDED DAY MODAL */}
      {expandedDay && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setExpandedDay(null)}>
          <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' as const }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>{calendarMonth.toLocaleDateString('en-AU', { month: 'long' })} {expandedDay.day}</h3>
            {expandedDay.items.map(item => (
              <div key={item.itemId} style={{ padding: '12px', marginBottom: '8px', background: item.itemType === 'income' ? '#d1fae5' : item.itemType === 'expense' ? '#dbeafe' : '#fee2e2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: item.isPaid ? 0.6 : 1 }}>
                <div><div style={{ fontWeight: 600, color: '#1e293b' }}>{item.name}</div><div style={{ fontSize: '12px', color: '#64748b' }}>${item.amount}</div></div>
                <button onClick={() => togglePaid(item.itemId)} style={{ padding: '8px 16px', background: item.isPaid ? '#6b7280' : theme.success, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{item.isPaid ? '✓ Done' : 'Mark Done'}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAYSLIP MODAL */}
      {showPayslipUpload && extractedPayslip && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowPayslipUpload(false)}>
          <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', color: theme.text }}>📄 Payslip Detected!</h3>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px', marginBottom: '20px' }}>
              <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Employer</label><input value={extractedPayslip.employer || ''} onChange={e => setExtractedPayslip({...extractedPayslip, employer: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Net Pay</label><input type="number" value={extractedPayslip.netPay || ''} onChange={e => setExtractedPayslip({...extractedPayslip, netPay: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Frequency</label><select value={extractedPayslip.frequency || 'fortnightly'} onChange={e => setExtractedPayslip({...extractedPayslip, frequency: e.target.value})} style={{...inputStyle, width: '100%'}}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setIncomeStreams([...incomeStreams, { id: Date.now(), name: extractedPayslip.employer || 'Salary', amount: extractedPayslip.netPay || '', frequency: extractedPayslip.frequency || 'fortnightly', type: 'active', startDate: new Date().toISOString().split('T')[0] }]); setExtractedPayslip(null); setShowPayslipUpload(false) }} style={{ ...btnSuccess, flex: 1 }}>✓ Add Income</button>
              <button onClick={() => { setShowPayslipUpload(false); setExtractedPayslip(null) }} style={{ ...btnPrimary, background: theme.textMuted }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* BABY STEP DETAIL MODAL */}
      {selectedBabyStep !== null && (() => {
        const step = australianBabySteps.find(s => s.step === selectedBabyStep)
        if (!step) return null
        const isCurrent = step.step === currentBabyStep.step
        const done = step.step < currentBabyStep.step
        return (
          <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelectedBabyStep(null)}>
            <div style={{ background: theme.cardBg, borderRadius: '20px', padding: '28px', maxWidth: '600px', width: '100%', maxHeight: '85vh', overflowY: 'auto' as const }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: done ? theme.success : isCurrent ? theme.warning : theme.purple, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>{done ? '✓' : step.icon}</div>
                  <div><div style={{ color: theme.textMuted, fontSize: '12px' }}>Step {step.step} of 7</div><h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>{step.title}</h3></div>
                </div>
                <button onClick={() => setSelectedBabyStep(null)} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '24px', cursor: 'pointer' }}>×</button>
              </div>
              <div style={{ background: darkMode ? '#1e293b' : '#f0fdf4', borderRadius: '12px', padding: '16px', marginBottom: '20px', borderLeft: '4px solid ' + theme.success }}>
                <p style={{ margin: 0, color: theme.text, fontSize: '14px', lineHeight: 1.7 }}>💡 <strong>Aureus says:</strong> {step.aureusAdvice}</p>
              </div>
              <h4 style={{ color: theme.text, margin: '0 0 12px 0' }}>✅ Key tips:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: theme.text, lineHeight: 2 }}>{step.tips?.map((tip: string, i: number) => <li key={i}>{tip}</li>)}</ul>
              {step.step === 6 && (
                <button onClick={() => { setSelectedBabyStep(null); setActiveTab('mortgage') }} style={{ ...btnSuccess, width: '100%', marginTop: '16px', padding: '14px', fontSize: '15px' }}>🚀 Open Mortgage Accelerator</button>
              )}
              <button onClick={() => { setSelectedBabyStep(null); setChatInput(`Tell me more about Step ${step.step}: ${step.title}`); setActiveTab('chat') }} style={{ ...btnPrimary, width: '100%', marginTop: '12px', padding: '14px', fontSize: '15px' }}>💬 Ask Aureus About This Step</button>
            </div>
          </div>
        )
      })()}

      {/* ADD MILESTONE MODAL */}
      {showAddMilestone && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowAddMilestone(false)}>
          <div style={{ background: theme.cardBg, borderRadius: '20px', padding: '28px', maxWidth: '520px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 6px 0', color: theme.text, fontSize: '20px' }}>✨ Add Roadmap Milestone</h3>
            <p style={{ margin: '0 0 20px 0', color: theme.textMuted, fontSize: '13px' }}>Once added, tap "Generate Weekly Plan" to get Aureus to build a step-by-step action plan.</p>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '14px' }}>
              {/* Icon picker */}
              <div>
                <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '6px' }}>Choose an icon</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                  {['🎯','🏠','💳','🚗','🎓','💰','📈','🏦','🔥','🚀','🛡️','💎','🌴','🐀','🤖','💡'].map(emoji => (
                    <button key={emoji} onClick={() => setNewMilestone({...newMilestone, icon: emoji})} style={{ width: '38px', height: '38px', fontSize: '20px', background: newMilestone.icon === emoji ? theme.purple + '40' : theme.bg, border: '2px solid ' + (newMilestone.icon === emoji ? theme.purple : theme.border), borderRadius: '8px', cursor: 'pointer' }}>{emoji}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Milestone name *</label>
                <input placeholder="e.g. Pay off credit card, Save house deposit" value={newMilestone.name} onChange={e => setNewMilestone({...newMilestone, name: e.target.value})} style={{...inputStyle, width: '100%'}} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Target amount ($) — optional</label>
                  <input type="number" placeholder="e.g. 10000" value={newMilestone.targetAmount} onChange={e => setNewMilestone({...newMilestone, targetAmount: e.target.value})} style={{...inputStyle, width: '100%'}} />
                </div>
                <div>
                  <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Target date — optional</label>
                  <input type="date" value={newMilestone.targetDate} onChange={e => setNewMilestone({...newMilestone, targetDate: e.target.value})} style={{...inputStyle, width: '100%'}} />
                </div>
              </div>
              <div>
                <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Notes (helps Aureus build a better plan)</label>
                <textarea placeholder="e.g. Balance is $4,200 at 19.9% interest, paying $200/month" value={newMilestone.notes} onChange={e => setNewMilestone({...newMilestone, notes: e.target.value})} style={{...inputStyle, width: '100%', minHeight: '70px', resize: 'vertical' as const}} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => {
                  if (!newMilestone.name) return
                  setRoadmapMilestones([...roadmapMilestones, { ...newMilestone, id: Date.now(), currentAmount: 0, completed: false, createdAt: new Date().toISOString(), weeklyPlan: null }])
                  setNewMilestone({ name: '', targetAmount: '', targetDate: '', category: 'savings', icon: '🎯', notes: '' })
                  setShowAddMilestone(false)
                }} style={{ ...btnSuccess, flex: 1, padding: '14px' }}>✅ Add to Roadmap</button>
                <button onClick={() => setShowAddMilestone(false)} style={{ ...btnPrimary, background: theme.textMuted, padding: '14px' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ONBOARDING MODAL ==================== */}
      {showOnboarding && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '32px', maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto' as const }}>

            {/* Step 0: Welcome */}
            {onboardingStep === 0 && (
              <div style={{ textAlign: 'center' as const }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '40px', fontWeight: 800, color: '#78350f' }}>A</div>
                <h2 style={{ color: theme.text, fontSize: '28px', margin: '0 0 12px 0' }}>G'day! I'm Aureus.</h2>
                <p style={{ color: theme.textMuted, fontSize: '16px', lineHeight: 1.7, marginBottom: '24px' }}>Your AI financial coach — built to help you pay your mortgage off faster, eliminate debt, and build real wealth. Let me learn about how you think about money so I can coach you properly.</p>
                <p style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '28px' }}>Takes about 5 minutes. Everything is stored only on your device.</p>
                <button onClick={() => setOnboardingStep(1)} style={{ ...btnSuccess, width: '100%', padding: '16px', fontSize: '16px' }}>Let's go →</button>
                <button onClick={() => { setShowOnboarding(false); setOnboardingComplete(true) }} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', marginTop: '12px', fontSize: '13px' }}>Skip for now</button>
              </div>
            )}

            {/* Step 1: Money Personality Quiz */}
            {onboardingStep === 1 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>🧠 Your Money Personality</h3>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>Step 1 of 4</div>
                </div>
                <p style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '20px' }}>8 questions. No right or wrong answers — just honest ones. This helps Aureus coach you the way YOU need to be coached.</p>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>
                  {personalityQuiz.map((question, qi) => (
                    <div key={qi}>
                      <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px', marginBottom: '10px' }}>{qi + 1}. {question.q}</div>
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px' }}>
                        {question.options.map((opt, oi) => (
                          <button key={oi} onClick={() => setPersonalityAnswers(prev => ({ ...prev, [qi]: opt.type }))}
                            style={{ padding: '10px 14px', background: personalityAnswers[qi] === opt.type ? theme.accent + '30' : theme.bg, border: '2px solid ' + (personalityAnswers[qi] === opt.type ? theme.accent : theme.border), borderRadius: '8px', cursor: 'pointer', color: theme.text, fontSize: '13px', textAlign: 'left' as const }}>
                            {personalityAnswers[qi] === opt.type ? '● ' : '○ '}{opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                  <button onClick={() => setOnboardingStep(0)} style={{ ...btnPrimary, background: theme.textMuted }}>← Back</button>
                  <button
                    onClick={() => {
                      const result = calculatePersonality()
                      setMoneyPersonality(result)
                      setOnboardingStep(2)
                    }}
                    disabled={Object.keys(personalityAnswers).length < 8}
                    style={{ ...btnSuccess, flex: 1, opacity: Object.keys(personalityAnswers).length < 8 ? 0.5 : 1 }}>
                    {Object.keys(personalityAnswers).length < 8 ? `Answer all ${8 - Object.keys(personalityAnswers).length} remaining` : 'See my result →'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 1b: Personality Result */}
            {onboardingStep === 1.5 && moneyPersonality && personalityProfiles[moneyPersonality] && (
              <div style={{ textAlign: 'center' as const }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>{personalityProfiles[moneyPersonality].emoji}</div>
                <h2 style={{ color: personalityProfiles[moneyPersonality].color, fontSize: '26px', margin: '0 0 12px 0' }}>{personalityProfiles[moneyPersonality].label}</h2>
                <p style={{ color: theme.textMuted, fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>{personalityProfiles[moneyPersonality].desc}</p>
                <div style={{ padding: '16px', background: personalityProfiles[moneyPersonality].color + '15', borderRadius: '12px', marginBottom: '20px', textAlign: 'left' as const }}>
                  <div style={{ color: personalityProfiles[moneyPersonality].color, fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>🎯 HOW AUREUS WILL COACH YOU</div>
                  <div style={{ color: theme.text, fontSize: '13px', lineHeight: 1.6 }}>{personalityProfiles[moneyPersonality].aureusFocus}</div>
                </div>
                <button onClick={() => setOnboardingStep(2)} style={{ ...btnSuccess, width: '100%', padding: '14px', fontSize: '15px' }}>This resonates. Continue →</button>
              </div>
            )}

            {/* Step 2: Deep Why */}
            {onboardingStep === 2 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>❤️ Your Deep Why</h3>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>Step 2 of 4</div>
                </div>
                <p style={{ color: theme.textMuted, fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>The research is clear: people who connect their financial goals to deep personal meaning are 3× more likely to follow through. Take 2 minutes to answer these honestly.</p>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
                  {deepWhyQuestions.map((q, i) => (
                    <div key={i}>
                      <label style={{ color: theme.text, fontWeight: 500, fontSize: '14px', display: 'block', marginBottom: '6px' }}>{i + 1}. {q}</label>
                      <textarea
                        value={deepWhyAnswers[i] || ''}
                        onChange={e => setDeepWhyAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                        placeholder="Be honest — this is private..."
                        style={{ ...inputStyle, width: '100%', minHeight: '65px', resize: 'vertical' as const }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={() => setOnboardingStep(1)} style={{ ...btnPrimary, background: theme.textMuted }}>← Back</button>
                  <button onClick={() => { setDeepWhyComplete(true); setOnboardingStep(3) }} style={{ ...btnSuccess, flex: 1 }}>Continue →</button>
                </div>
              </div>
            )}

            {/* Step 3: Identity Statements */}
            {onboardingStep === 3 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>⚡ Who You're Becoming</h3>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>Step 3 of 4</div>
                </div>
                <p style={{ color: theme.textMuted, fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>Identity-based change is the most powerful driver of behaviour. Write 3 statements about who you are becoming financially — not what you want to have, but who you are.</p>
                <div style={{ padding: '12px 14px', background: theme.accent + '15', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: theme.text }}>
                  <strong>Examples:</strong> "I am someone who makes every dollar deliberate." · "I am someone who protects my family's future." · "I am someone who will be mortgage-free in 8 years."
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px', marginBottom: '16px' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: theme.accent, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                      <input
                        value={identityStatements[i] || ''}
                        onChange={e => {
                          const updated = [...identityStatements]
                          updated[i] = e.target.value
                          setIdentityStatements(updated)
                        }}
                        placeholder={`I am someone who...`}
                        style={{ ...inputStyle, flex: 1 }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setOnboardingStep(2)} style={{ ...btnPrimary, background: theme.textMuted }}>← Back</button>
                  <button onClick={() => setOnboardingStep(4)} style={{ ...btnSuccess, flex: 1 }}>Continue →</button>
                </div>
              </div>
            )}

            {/* Step 4: Quick Setup */}
            {onboardingStep === 4 && (
              <div style={{ textAlign: 'center' as const }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎯</div>
                <h2 style={{ color: theme.text, fontSize: '24px', margin: '0 0 12px 0' }}>You're set up!</h2>
                {moneyPersonality && personalityProfiles[moneyPersonality] && (
                  <div style={{ padding: '14px 16px', background: personalityProfiles[moneyPersonality].color + '15', borderRadius: '12px', marginBottom: '16px', textAlign: 'left' as const }}>
                    <div style={{ color: personalityProfiles[moneyPersonality].color, fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>{personalityProfiles[moneyPersonality].emoji} {personalityProfiles[moneyPersonality].label}</div>
                    <div style={{ color: theme.textMuted, fontSize: '12px' }}>{personalityProfiles[moneyPersonality].aureusFocus}</div>
                  </div>
                )}
                {identityStatements.filter(s => s.trim()).length > 0 && (
                  <div style={{ textAlign: 'left' as const, marginBottom: '16px' }}>
                    <div style={{ color: theme.textMuted, fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>YOUR IDENTITY STATEMENTS</div>
                    {identityStatements.filter(s => s.trim()).map((stmt, i) => (
                      <div key={i} style={{ padding: '8px 12px', background: theme.bg, borderRadius: '8px', marginBottom: '6px', color: theme.text, fontSize: '13px', fontStyle: 'italic' }}>"{stmt}"</div>
                    ))}
                  </div>
                )}
                <p style={{ color: theme.textMuted, fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>Now let's set up your budget. Head to the <strong>Budget tab</strong> to add your income and expenses — then your mortgage-free date will appear on your dashboard.</p>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
                  <button onClick={() => { setShowOnboarding(false); setOnboardingComplete(true); setActiveTab('dashboard') }} style={{ ...btnSuccess, padding: '14px', fontSize: '15px' }}>Set up my budget →</button>
                  <button onClick={() => { setShowOnboarding(false); setOnboardingComplete(true); setActiveTab('mortgage') }} style={{ ...btnPrimary, padding: '14px', fontSize: '15px' }}>Enter my mortgage details →</button>
                  <button onClick={() => { setShowOnboarding(false); setOnboardingComplete(true) }} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '13px' }}>Explore on my own</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== MONEY DATE MODAL ==================== */}
      {showMoneyDate && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: theme.cardBg, borderRadius: '20px', padding: '28px', maxWidth: '500px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>💰 Money Date</h3>
                <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>Question {moneyDateStep + 1} of {moneyDateQuestions.length}</div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {moneyDateQuestions.map((_, i) => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i <= moneyDateStep ? theme.success : theme.border }} />)}
              </div>
            </div>

            <div style={{ padding: '20px', background: theme.bg, borderRadius: '12px', marginBottom: '20px' }}>
              <p style={{ color: theme.text, fontSize: '16px', fontWeight: 500, margin: 0 }}>{moneyDateQuestions[moneyDateStep].q}</p>
            </div>

            {moneyDateQuestions[moneyDateStep].type === 'yesno' && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                {['Yes', 'No'].map(opt => (
                  <button key={opt} onClick={() => setMoneyDateAnswers(p => ({ ...p, [moneyDateStep]: opt }))}
                    style={{ flex: 1, padding: '14px', background: moneyDateAnswers[moneyDateStep] === opt ? theme.success : theme.bg, color: moneyDateAnswers[moneyDateStep] === opt ? 'white' : theme.text, border: '2px solid ' + (moneyDateAnswers[moneyDateStep] === opt ? theme.success : theme.border), borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: 600 }}>{opt === 'Yes' ? '👍 Yes' : '👎 No'}</button>
                ))}
              </div>
            )}

            {moneyDateQuestions[moneyDateStep].type === 'scale3' && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {(moneyDateQuestions[moneyDateStep].options || []).map((opt: string) => (
                  <button key={opt} onClick={() => setMoneyDateAnswers(p => ({ ...p, [moneyDateStep]: opt }))}
                    style={{ flex: 1, padding: '12px', background: moneyDateAnswers[moneyDateStep] === opt ? theme.accent : theme.bg, color: moneyDateAnswers[moneyDateStep] === opt ? 'white' : theme.text, border: '2px solid ' + (moneyDateAnswers[moneyDateStep] === opt ? theme.accent : theme.border), borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>{opt}</button>
                ))}
              </div>
            )}

            {moneyDateQuestions[moneyDateStep].type === 'scale' && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {['1', '2', '3', '4', '5'].map(n => (
                  <button key={n} onClick={() => setMoneyDateAnswers(p => ({ ...p, [moneyDateStep]: n }))}
                    style={{ flex: 1, padding: '14px', background: moneyDateAnswers[moneyDateStep] === n ? theme.accent : theme.bg, color: moneyDateAnswers[moneyDateStep] === n ? 'white' : theme.text, border: '2px solid ' + (moneyDateAnswers[moneyDateStep] === n ? theme.accent : theme.border), borderRadius: '10px', cursor: 'pointer', fontSize: '18px', fontWeight: 700 }}>{n}</button>
                ))}
              </div>
            )}

            {moneyDateQuestions[moneyDateStep].type === 'text' && (
              <div style={{ marginBottom: '20px' }}>
                <input
                  value={moneyDateAnswers[moneyDateStep] || ''}
                  onChange={e => setMoneyDateAnswers(p => ({ ...p, [moneyDateStep]: e.target.value }))}
                  placeholder={(moneyDateQuestions[moneyDateStep] as any).placeholder || ''}
                  style={{ ...inputStyle, width: '100%', padding: '14px 16px' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              {moneyDateStep > 0 && <button onClick={() => setMoneyDateStep(s => s - 1)} style={{ ...btnPrimary, background: theme.textMuted }}>← Back</button>}
              {moneyDateStep < moneyDateQuestions.length - 1 ? (
                <button onClick={() => { if (moneyDateAnswers[moneyDateStep] !== undefined) setMoneyDateStep(s => s + 1) }} disabled={moneyDateAnswers[moneyDateStep] === undefined} style={{ ...btnPrimary, flex: 1, opacity: moneyDateAnswers[moneyDateStep] === undefined ? 0.5 : 1 }}>Next →</button>
              ) : (
                <button onClick={submitMoneyDate} style={{ ...btnSuccess, flex: 1, fontSize: '15px' }}>✅ Complete Money Date</button>
              )}
            </div>
            <button onClick={() => { setShowMoneyDate(false); setMoneyDateStep(0); setMoneyDateAnswers({}) }} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', width: '100%', marginTop: '10px', fontSize: '13px' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ==================== ANNUAL REVIEW MODAL ==================== */}
      {showAnnualReview && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: theme.cardBg, borderRadius: '20px', padding: '28px', maxWidth: '540px', width: '100%', maxHeight: '85vh', overflowY: 'auto' as const }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>📆 {new Date().getFullYear()} Annual Money Review</h3>
              <div style={{ color: theme.textMuted, fontSize: '12px' }}>{annualReviewStep + 1} / {annualReviewQuestions.length}</div>
            </div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
              {annualReviewQuestions.map((_, i) => <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= annualReviewStep ? theme.purple : theme.border }} />)}
            </div>

            <div style={{ padding: '18px', background: theme.bg, borderRadius: '12px', marginBottom: '16px' }}>
              <p style={{ color: theme.text, fontSize: '15px', fontWeight: 600, margin: 0 }}>{annualReviewQuestions[annualReviewStep].q}</p>
            </div>
            <textarea
              value={annualReviewAnswers[annualReviewStep] || ''}
              onChange={e => setAnnualReviewAnswers(p => ({ ...p, [annualReviewStep]: e.target.value }))}
              placeholder={annualReviewQuestions[annualReviewStep].placeholder}
              style={{ ...inputStyle, width: '100%', minHeight: '100px', resize: 'vertical' as const, marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              {annualReviewStep > 0 && <button onClick={() => setAnnualReviewStep(s => s - 1)} style={{ ...btnPrimary, background: theme.textMuted }}>← Back</button>}
              {annualReviewStep < annualReviewQuestions.length - 1 ? (
                <button onClick={() => setAnnualReviewStep(s => s + 1)} style={{ ...btnPurple, flex: 1 }}>Next →</button>
              ) : (
                <button onClick={submitAnnualReview} style={{ ...btnSuccess, flex: 1, fontSize: '15px' }}>✅ Complete Review</button>
              )}
            </div>
            <button onClick={() => { setShowAnnualReview(false); setAnnualReviewStep(0) }} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', width: '100%', marginTop: '10px', fontSize: '13px' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ==================== FEAR AUDIT MODAL ==================== */}
      {showFearAudit && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: theme.cardBg, borderRadius: '20px', padding: '28px', maxWidth: '520px', width: '100%', maxHeight: '85vh', overflowY: 'auto' as const }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, color: theme.purple, fontSize: '20px' }}>🧠 Money Fear Audit</h3>
              <div style={{ color: theme.textMuted, fontSize: '12px' }}>{fearAuditStep + 1} / {fearAuditQuestions.length}</div>
            </div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
              {fearAuditQuestions.map((_, i) => <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= fearAuditStep ? theme.purple : theme.border }} />)}
            </div>
            <div style={{ padding: '10px 12px', background: theme.purple + '10', borderRadius: '8px', marginBottom: '16px' }}>
              <p style={{ margin: 0, color: theme.textMuted, fontSize: '12px', lineHeight: 1.5 }}>🔒 Your answers are stored only on this device. Be honest — this exercise only works if you are.</p>
            </div>

            <div style={{ padding: '18px', background: theme.bg, borderRadius: '12px', marginBottom: '14px' }}>
              <p style={{ color: theme.text, fontSize: '15px', fontWeight: 600, margin: 0 }}>{fearAuditQuestions[fearAuditStep].q}</p>
            </div>
            <textarea
              value={fearAuditAnswers[fearAuditStep] || ''}
              onChange={e => setFearAuditAnswers(p => ({ ...p, [fearAuditStep]: e.target.value }))}
              placeholder={fearAuditQuestions[fearAuditStep].placeholder}
              style={{ ...inputStyle, width: '100%', minHeight: '90px', resize: 'vertical' as const, marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              {fearAuditStep > 0 && <button onClick={() => setFearAuditStep(s => s - 1)} style={{ ...btnPrimary, background: theme.textMuted }}>← Back</button>}
              {fearAuditStep < fearAuditQuestions.length - 1 ? (
                <button onClick={() => setFearAuditStep(s => s + 1)} style={{ ...btnPurple, flex: 1 }}>Next →</button>
              ) : (
                <button onClick={() => {
                  setFearAuditComplete(true)
                  setShowFearAudit(false)
                  setFearAuditStep(0)
                  setCelebrationWin('Fear Audit complete. That took courage. 💜')
                  setTimeout(() => setCelebrationWin(null), 4000)
                }} style={{ ...btnPurple, flex: 1, fontSize: '15px' }}>✅ Complete Audit</button>
              )}
            </div>
            <button onClick={() => { setShowFearAudit(false); setFearAuditStep(0) }} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', width: '100%', marginTop: '10px', fontSize: '13px' }}>Save & exit</button>
          </div>
        </div>
      )}

      {/* DOCUMENT UPLOAD MODAL */}
      {showDocUpload && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowDocUpload(false)}>
          <div style={{ background: theme.cardBg, borderRadius: '20px', padding: '28px', maxWidth: '560px', width: '100%', maxHeight: '85vh', overflowY: 'auto' as const }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>📎 Documents</h3>
              <button onClick={() => setShowDocUpload(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '22px', cursor: 'pointer' }}>×</button>
            </div>
            <p style={{ color: theme.textMuted, fontSize: '13px', margin: '0 0 20px 0', lineHeight: 1.6 }}>
              Upload payslips, bank statements, loan documents, insurance policies — anything you want to keep handy alongside your financial plan. Documents are stored locally in your browser.
            </p>

            {/* Upload area */}
            <input
              ref={docInputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.csv,.txt"
              style={{ display: 'none' }}
              onChange={e => {
                const files = Array.from(e.target.files || [])
                files.forEach(file => {
                  const reader = new FileReader()
                  reader.onload = () => {
                    setDocuments(prev => [...prev, {
                      id: Date.now() + Math.random(),
                      name: file.name,
                      type: file.type,
                      size: file.size,
                      uploadedAt: new Date().toISOString(),
                      data: reader.result
                    }])
                  }
                  reader.readAsDataURL(file)
                })
                if (e.target) e.target.value = ''
              }}
            />

            <button
              onClick={() => docInputRef.current?.click()}
              style={{ width: '100%', padding: '24px', background: 'transparent', border: '2px dashed ' + theme.border, borderRadius: '12px', cursor: 'pointer', marginBottom: '20px', color: theme.textMuted, fontSize: '14px', lineHeight: 2 }}
            >
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>📁</div>
              <div style={{ color: theme.text, fontWeight: 600 }}>Click to upload documents</div>
              <div style={{ fontSize: '12px' }}>PDF, images, Word, Excel, CSV — any file type</div>
            </button>

            {/* Categories */}
            {documents.length > 0 && (
              <div>
                <div style={{ color: theme.textMuted, fontSize: '12px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>Uploaded ({documents.length})</div>
                {/* Group by suggested category */}
                {[
                  { label: '💰 Income & Tax', filter: (d: any) => /payslip|payroll|salary|tax|ato|group.cert|income/i.test(d.name) },
                  { label: '🏠 Property & Mortgage', filter: (d: any) => /mortgage|loan|property|contract|convey|title/i.test(d.name) },
                  { label: '🏦 Bank & Statements', filter: (d: any) => /bank|statement|account|transaction/i.test(d.name) },
                  { label: '🛡️ Insurance', filter: (d: any) => /insurance|policy|cover/i.test(d.name) },
                  { label: '📁 Other', filter: (d: any) => !/payslip|payroll|salary|tax|ato|group.cert|income|mortgage|loan|property|contract|convey|title|bank|statement|account|transaction|insurance|policy|cover/i.test(d.name) },
                ].map(cat => {
                  const catDocs = documents.filter(cat.filter)
                  if (catDocs.length === 0) return null
                  return (
                    <div key={cat.label} style={{ marginBottom: '16px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>{cat.label}</div>
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                        {catDocs.map((doc: any) => (
                          <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: theme.bg, borderRadius: '10px', border: '1px solid ' + theme.border }}>
                            <div style={{ fontSize: '24px', flexShrink: 0 }}>
                              {doc.type?.includes('pdf') ? '📄' : doc.type?.includes('image') ? '🖼️' : doc.type?.includes('sheet') || doc.name?.endsWith('.csv') || doc.name?.endsWith('.xlsx') ? '📊' : '📝'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ color: theme.text, fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{doc.name}</div>
                              <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '2px' }}>
                                {(doc.size / 1024).toFixed(0)} KB · {new Date(doc.uploadedAt).toLocaleDateString('en-AU')}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                              <a
                                href={doc.data}
                                download={doc.name}
                                style={{ padding: '5px 10px', background: theme.accent + '20', color: theme.accent, borderRadius: '6px', fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}
                              >↓</a>
                              <button onClick={() => setChatInput(`I've uploaded a document called "${doc.name}". Can you tell me what I should do with it or what it means for my financial situation?`)} style={{ padding: '5px 10px', background: theme.success + '20', color: theme.success, border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Ask Aureus</button>
                              <button onClick={() => setDocuments(prev => prev.filter((d: any) => d.id !== doc.id))} style={{ padding: '5px 8px', background: theme.danger + '20', color: theme.danger, border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>×</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {documents.length === 0 && (
              <div style={{ textAlign: 'center' as const, padding: '20px', color: theme.textMuted, fontSize: '13px' }}>
                No documents uploaded yet. Keep payslips, loan docs, and statements here alongside your financial plan.
              </div>
            )}

            <div style={{ marginTop: '16px', padding: '12px 14px', background: theme.warning + '10', borderRadius: '8px', border: '1px solid ' + theme.warning + '30' }}>
              <div style={{ color: theme.textMuted, fontSize: '11px', lineHeight: 1.5 }}>🔒 Documents are stored in your browser's local storage only — they never leave your device and are not uploaded to any server.</div>
            </div>
          </div>
        </div>
      )}

      <footer style={{ padding: '16px 24px', background: theme.cardBg, borderTop: '1px solid ' + theme.border, textAlign: 'center' as const }}>
        <p style={{ margin: '0 0 4px 0', color: theme.textMuted, fontSize: '11px' }}>⚠️ Aureus is an AI assistant for general education only — not financial, tax, or legal advice. Always verify information and consult licensed professionals before making financial decisions.</p>
        <p style={{ margin: 0, color: theme.textMuted, fontSize: '10px' }}>© {new Date().getFullYear()} Aureus · Not affiliated with any financial institution · General information only</p>
      </footer>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>
    </div>
  )
}
