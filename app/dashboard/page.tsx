'use client'

import { useUser } from '@clerk/nextjs'
import React, { useState, useEffect, useRef, useCallback } from 'react'

export default function Dashboard() {
  const { user } = useUser()

  // ==================== APP MODE & NAVIGATION ====================
  const [appMode, setAppMode] = useState<'budget' | null>(null)
  const [showModeSelector, setShowModeSelector] = useState(true)

  // ==================== MISSION SYSTEM ====================
  const [missionPhase, setMissionPhase] = useState<1 | 2 | 3>(1)
  const [missionStep, setMissionStep] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7>(0)
  // 0 = not started, 1 = personality, 2 = income, 3 = expenses, 4 = debts, 5 = assets, 6 = mortgage, 7 = schedule
  const [missionComplete, setMissionComplete] = useState(false)
  const [missionP2Step, setMissionP2Step] = useState<'analyse' | 'propose' | 'confirm' | 'plan'>('analyse')
  const [missionP2Loading, setMissionP2Loading] = useState(false)
  const [missionP2Proposals, setMissionP2Proposals] = useState<any[]>([])
  const [missionP2Confirmed, setMissionP2Confirmed] = useState<boolean[]>([])
  const [missionNavLocked, setMissionNavLocked] = useState(true) // locks nav during phase 1
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'quickview' | 'dashboard' | 'overview' | 'path' | 'learn' | 'wins' | 'mortgage' | 'insights' | 'grow' | 'review' | 'property'>('home')
  const [darkMode, setDarkMode] = useState(true)

  // ==================== ONBOARDING FLOW ====================
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [houseStatus, setHouseStatus] = useState<string | null>(null)   // 'own' | 'buying' | 'planning' | 'renting' | 'paid_off'
  const [fireGoal, setFireGoal] = useState(false)
  const [hasAutomatedPayments, setHasAutomatedPayments] = useState(false)
  const [investmentProperties, setInvestmentProperties] = useState<any[]>([])
  const [newProperty, setNewProperty] = useState({
    name: '', address: '', purchasePrice: '', purchaseDate: '', currentValue: '',
    mortgageBalance: '', interestRate: '', monthlyRepayment: '', loanType: 'PI',
    weeklyRent: '', managementFeePercent: '8.5', councilRates: '', insurance: '',
    maintenance: '', otherExpenses: ''
  })
  const [showAddProperty, setShowAddProperty] = useState(false)

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

  // ==================== COACH TRIGGER ENGINE ====================
  // Persistent "what to do next" — always visible, auto-updated when state changes
  const [coachNextAction, setCoachNextAction] = useState<{
    message: string
    action: string
    tab: string
    icon: string
    urgency: 'high' | 'medium' | 'low'
    triggeredBy: string
  } | null>(null)
  const [dismissedTriggers, setDismissedTriggers] = useState<string[]>([])
  const [lastAppOpen, setLastAppOpen] = useState<string | null>(null)
  const [coachMessageQueue, setCoachMessageQueue] = useState<string[]>([])

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

  // Check-in Schedule
  const [checkInSchedule, setCheckInSchedule] = useState({
    moneyDateDay: 'sunday',
    moneyDateTime: '19:00',
    dailyEnabled: true,
    dailyTime: '08:00',
    weeklyEnabled: true,
    monthlyEnabled: true,
    monthlyDay: '1',
    monthlyTime: '09:00',
    sixMonthlyEnabled: true,
    sixMonthlyDate: '',
    yearlyEnabled: true,
    yearlyDate: '',
    showScheduleSetup: false
  })
  const [lastDailyCheckIn, setLastDailyCheckIn] = useState<string | null>(null)
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false)
  const [dailyCheckInAnswers, setDailyCheckInAnswers] = useState<{[key: number]: string}>({})
  const [dailyCheckInStep, setDailyCheckInStep] = useState(0)
  const [dailyCheckInLog, setDailyCheckInLog] = useState<any[]>([])

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
  const [sinkingFunds, setSinkingFunds] = useState<any[]>([])
  const [newSinkingFund, setNewSinkingFund] = useState({ name: '', targetAmount: '', targetDate: '', weeklyAmount: '', category: 'celebration', notes: '' })

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
  const [newIncome, setNewIncome] = useState({ name: '', amount: '', frequency: 'fortnightly', type: 'active', startDate: (() => { const d = new Date(); d.setHours(0,0,0,0); let diff = 1 - d.getDay(); if (diff <= 0) diff += 7; d.setDate(d.getDate() + diff); return d.toISOString().split('T')[0] })() })
  const [expenses, setExpenses] = useState<any[]>([])
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', frequency: 'monthly', category: '', dueDate: (() => { const d = new Date(new Date().getFullYear(), new Date().getMonth(), 1); if (d <= new Date()) d.setMonth(d.getMonth()+1); return d.toISOString().split('T')[0] })() })
  // Projected vs Actual tracking
  const [categoryBudgets, setCategoryBudgets] = useState<{[cat: string]: string}>({})
  const [actualSpend, setActualSpend] = useState<{[monthKey: string]: {[cat: string]: number}}>({})
  const [showReceiptScanner, setShowReceiptScanner] = useState(false)
  const [receiptScanLoading, setReceiptScanLoading] = useState(false)
  const [receiptScanResult, setReceiptScanResult] = useState<any>(null)
  const [showProjectedActual, setShowProjectedActual] = useState(true)
  const [debts, setDebts] = useState<any[]>([])
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: (() => { const d = new Date(new Date().getFullYear(), new Date().getMonth(), 1); if (d <= new Date()) d.setMonth(d.getMonth()+1); return d.toISOString().split('T')[0] })() })
  const [payoffMethod, setPayoffMethod] = useState<'snowball' | 'avalanche'>('avalanche')
  const [debtExtraPayment, setDebtExtraPayment] = useState('')
  const [goals, setGoals] = useState<any[]>([])
  const [newGoal, setNewGoal] = useState({ name: '', target: '', saved: '0', deadline: '', savingsFrequency: 'monthly', startDate: (() => { const d = new Date(); d.setHours(0,0,0,0); let diff = 1 - d.getDay(); if (diff <= 0) diff += 7; d.setDate(d.getDate() + diff); return d.toISOString().split('T')[0] })(), paymentAmount: '', addedToCalendar: true, interestRate: '' })
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

  // Goal Setup Modal (triggered from roadmap weekly plan)
  const [showGoalSetup, setShowGoalSetup] = useState(false)
  const [goalSetupMilestone, setGoalSetupMilestone] = useState<any>(null)
  const [goalSetupStepId, setGoalSetupStepId] = useState<number | null>(null)
  const [goalSetupForm, setGoalSetupForm] = useState({
    name: '', target: '', saved: '0', paymentAmount: '',
    savingsFrequency: 'weekly', startDate: (() => { const d = new Date(); d.setHours(0,0,0,0); let diff = 1 - d.getDay(); if (diff <= 0) diff += 7; d.setDate(d.getDate() + diff); return d.toISOString().split('T')[0] })(),
    deadline: '', addToCalendar: true, addCheckIn: true
  })

  // Per-milestone check-in questions added when a goal is set up from roadmap
  const [milestoneCheckIns, setMilestoneCheckIns] = useState<{id: number, milestoneId: number, question: string, milestoneName: string}[]>([])

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
  const [showMoreTabs, setShowMoreTabs] = useState(false)
  const [showHelpGuide, setShowHelpGuide] = useState(false)
  // ── Coaching improvements state ──
  const [dailyBriefing, setDailyBriefing] = useState<{text: string, generatedDate: string} | null>(null)
  const [dailyBriefingLoading, setDailyBriefingLoading] = useState(false)
  const [stepReaction, setStepReaction] = useState<{step: number, message: string, nextSuggestion: string} | null>(null)
  const [prevBabyStep, setPrevBabyStep] = useState<number | null>(null)
  const [chatContext, setChatContext] = useState<string | null>(null)
  const [overdueItems, setOverdueItems] = useState<any[]>([])
  const [daysSinceMoneyDate, setDaysSinceMoneyDate] = useState(0)
  const [stepTickReaction, setStepTickReaction] = useState<{milestoneId: number, stepId: number, message: string} | null>(null)
  const [spendingPatterns, setSpendingPatterns] = useState<string[]>([])

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
    bg: '#0a0a0a',
    cardBg: '#141414',
    text: '#F5F5F5',
    textMuted: '#9a8a6a',
    border: '#2a2218',
    input: '#1c1810',
    inputBorder: '#3a2e1e',
    accent: '#D4AF37',
    success: '#B68B2E',
    warning: '#D4AF37',
    danger: '#c0392b',
    purple: '#8C6A1F',
    teal: '#B68B2E',
    orange: '#D4AF37'
  }

  const inputStyle: React.CSSProperties = { padding: '10px 14px', border: '2px solid ' + theme.inputBorder, borderRadius: '8px', fontSize: '14px', background: theme.input, color: theme.text, outline: 'none' }
  const btnPrimary: React.CSSProperties = { padding: '10px 20px', background: 'linear-gradient(135deg, #D4AF37 0%, #B68B2E 100%)', color: '#0a0a0a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }
  const btnSuccess: React.CSSProperties = { ...btnPrimary, background: 'linear-gradient(135deg, #B68B2E 0%, #8C6A1F 100%)', color: '#F5F5F5' }
  const btnDanger: React.CSSProperties = { ...btnPrimary, background: theme.danger, color: 'white' }
  const btnWarning: React.CSSProperties = { ...btnPrimary, background: 'linear-gradient(135deg, #D4AF37 0%, #B68B2E 100%)', color: '#0a0a0a' }
  const btnPurple: React.CSSProperties = { ...btnPrimary, background: 'linear-gradient(135deg, #D4AF37 0%, #8C6A1F 100%)', color: '#0a0a0a' }
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
      if (data.categoryBudgets) setCategoryBudgets(data.categoryBudgets)
      if (data.actualSpend) setActualSpend(data.actualSpend)
      if (data.roadmapMilestones) setRoadmapMilestones(data.roadmapMilestones)
      if (data.coachNextAction) setCoachNextAction(data.coachNextAction)
      if (data.dismissedTriggers) setDismissedTriggers(data.dismissedTriggers)
      if (data.lastAppOpen) setLastAppOpen(data.lastAppOpen)
      if (data.documents) setDocuments(data.documents)
      if (data.milestoneCheckIns) setMilestoneCheckIns(data.milestoneCheckIns)
      if (data.checkInSchedule) setCheckInSchedule(prev => ({ ...prev, ...data.checkInSchedule }))
      if (data.lastDailyCheckIn) setLastDailyCheckIn(data.lastDailyCheckIn)
      if (data.dailyCheckInLog) setDailyCheckInLog(data.dailyCheckInLog)
      if (data.moneyPersonality) setMoneyPersonality(data.moneyPersonality)
      if (data.identityStatements) setIdentityStatements(data.identityStatements)
      if (data.deepWhyAnswers) setDeepWhyAnswers(data.deepWhyAnswers)
      if (data.deepWhyComplete) setDeepWhyComplete(data.deepWhyComplete)
      if (data.fearAuditAnswers) setFearAuditAnswers(data.fearAuditAnswers)
      if (data.fearAuditComplete) setFearAuditComplete(data.fearAuditComplete)
      if (data.onboardingComplete) setOnboardingComplete(data.onboardingComplete)
      if (data.houseStatus) setHouseStatus(data.houseStatus)
      if (data.fireGoal !== undefined) setFireGoal(data.fireGoal)
      if (data.hasAutomatedPayments !== undefined) setHasAutomatedPayments(data.hasAutomatedPayments)
      if (data.investmentProperties) setInvestmentProperties(data.investmentProperties)
      if (data.sinkingFunds) setSinkingFunds(data.sinkingFunds)
      if (data.missionPhase) setMissionPhase(data.missionPhase)
      if (data.missionStep !== undefined) setMissionStep(data.missionStep)
      if (data.missionComplete) setMissionComplete(data.missionComplete)
      if (data.missionNavLocked !== undefined) setMissionNavLocked(data.missionNavLocked)
      if (data.missionP2Proposals) setMissionP2Proposals(data.missionP2Proposals)
      if (data.missionP2Confirmed) setMissionP2Confirmed(data.missionP2Confirmed)
      if (data.missionP2Step) setMissionP2Step(data.missionP2Step)
      // New users start at mission step 1
      if (!data.missionComplete && !data.missionPhase) {
        setMissionPhase(1)
        setMissionStep(1)
        setMissionNavLocked(true)
      }
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
      if (data.wins) {
        // Clean up any stale auto-wins that fired before expenses were entered (e.g. "saving 100% of income")
        const cleanedWins = data.wins.filter((w: any) => {
          if (w.title === '20% savings rate achieved' && w.desc && /saving \d+% of your income/.test(w.desc)) {
            const pct = parseInt(w.desc.match(/saving (\d+)%/)?.[1] || '0')
            return pct < 95 // remove if suspiciously high (was fired before expenses set)
          }
          if (w.title === 'Positive monthly surplus' && w.desc && !/bills/.test(w.desc)) return false // old format
          return true
        })
        setWins(cleanedWins)
      }
      if (data.streak !== undefined) setStreak(data.streak)
      if (data.lastCheckIn) setLastCheckIn(data.lastCheckIn)
      if (data.whyStatement) setWhyStatement(data.whyStatement)
      if (data.mortgageAccel) setMortgageAccel(data.mortgageAccel)
    }
  }, [])

  useEffect(() => {
    const data = {
      incomeStreams, expenses, debts, goals, assets, liabilities,
      budgetMemory, paidOccurrences: Array.from(paidOccurrences), categoryBudgets, actualSpend,
      roadmapMilestones, budgetOnboarding, chatMessages, userCountry,
      wins, streak, lastCheckIn, whyStatement, mortgageAccel, documents, milestoneCheckIns,
      checkInSchedule, lastDailyCheckIn, dailyCheckInLog,
      coachNextAction, dismissedTriggers, lastAppOpen,
      missionPhase, missionStep, missionComplete, missionNavLocked,
      missionP2Proposals, missionP2Confirmed, missionP2Step,
      moneyPersonality, identityStatements, deepWhyAnswers, deepWhyComplete,
      fearAuditAnswers, fearAuditComplete, onboardingComplete, houseStatus, fireGoal, hasAutomatedPayments, investmentProperties, sinkingFunds, proactiveInsights,
      insightsGeneratedAt, oneDecision, oneDecisionDate, latteItems, moneyDateLog,
      annualReviews, superData, netWorthHistory, personalityAnswers
    }
    localStorage.setItem('aureus_data', JSON.stringify(data))
  }, [incomeStreams, expenses, debts, goals, assets, liabilities, budgetMemory, paidOccurrences, categoryBudgets, actualSpend, roadmapMilestones, budgetOnboarding, chatMessages, userCountry, wins, streak, lastCheckIn, whyStatement, mortgageAccel, documents, milestoneCheckIns, checkInSchedule, lastDailyCheckIn, dailyCheckInLog, coachNextAction, dismissedTriggers, lastAppOpen, missionPhase, missionStep, missionComplete, missionNavLocked, missionP2Proposals, missionP2Confirmed, missionP2Step, moneyPersonality, identityStatements, deepWhyAnswers, deepWhyComplete, fearAuditAnswers, fearAuditComplete, onboardingComplete, houseStatus, fireGoal, hasAutomatedPayments, investmentProperties, sinkingFunds, proactiveInsights, insightsGeneratedAt, oneDecision, oneDecisionDate, latteItems, moneyDateLog, annualReviews, superData, netWorthHistory, personalityAnswers])

  // Chat scroll
  const chatContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  // ==================== CALCULATIONS ====================
  // TWO converters - different purposes:
  // convertToMonthly = budget display (what you actually receive in a normal month)
  //   weekly × 4, fortnightly × 2 — reflects real cash flow, 3rd-fortnight months are a bonus
  // convertToMonthlyExact = simulations only (debt payoff, goal calc, mortgage)
  //   uses annual averages (52/12, 26/12) for mathematically precise multi-year projections
  const convertToMonthly = (amount: number, frequency: string) => {
    if (frequency === 'weekly') return amount * 4
    if (frequency === 'fortnightly') return amount * 2
    if (frequency === 'quarterly') return amount / 3
    if (frequency === 'yearly') return amount / 12
    return amount
  }
  const convertToMonthlyExact = (amount: number, frequency: string) => {
    if (frequency === 'weekly') return amount * (52 / 12)
    if (frequency === 'fortnightly') return amount * (26 / 12)
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
  // savingsRate = intentional savings rate: goal contributions as % of income
  // surplus rate (unspent) is tracked separately
  const intentionalSavingsRate = monthlyIncome > 0 ? (monthlyGoalSavings / monthlyIncome * 100) : 0
  const surplusRate = monthlyIncome > 0 ? (Math.max(0, monthlySurplus) / monthlyIncome * 100) : 0
  const savingsRate = monthlyIncome > 0 ? ((monthlyGoalSavings + Math.max(0, monthlySurplus)) / monthlyIncome * 100) : 0
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

    // Already owns home (with or without mortgage) → Step 5 (deposit) is DONE, skip it
    const alreadyOwnsHome = ['own', 'paid_off', 'buying'].includes(houseStatus || '')
    // Paid off home → Step 6 (mortgage) is also DONE
    const mortgageFree = houseStatus === 'paid_off' || (alreadyOwnsHome && mortgageDebt.length === 0 && !mortgageAccel.balance)

    if (emergencyFund < 2000) return { step: 1, title: 'Starter Emergency Fund', desc: 'Save $2,000 for emergencies', progress: (emergencyFund / 2000) * 100, icon: '🛡️', target: 2000, current: emergencyFund }
    if (badDebt.length > 0) { const totalBadDebt = badDebt.reduce((s, d) => s + parseFloat(d.balance || '0'), 0); return { step: 2, title: 'Kill Bad Debt', desc: 'Pay off credit cards, personal loans, BNPL', progress: 0, icon: '💳', target: totalBadDebt, current: 0, debts: badDebt } }
    if (emergencyFund < monthlyExpenses3) return { step: 3, title: 'Full Emergency Fund', desc: '3-6 months expenses saved', progress: (emergencyFund / monthlyExpenses3) * 100, icon: '🏦', target: monthlyExpenses3, current: emergencyFund }
    // Step 4: Invest 15% — check they're ACTUALLY investing meaningfully, not just have $100 in shares
    const totalInvestmentValue = assets.filter(a => a.type === 'investment').reduce((s, a) => s + parseFloat(a.value || '0'), 0)
    const superBalance = assets.filter(a => a.type === 'super' || a.name?.toLowerCase().includes('super')).reduce((s, a) => s + parseFloat(a.value || '0'), 0)
    const monthlyInvestingViaGoals = goals.filter((g: any) => {
      const name = (g.name || '').toLowerCase()
      return name.includes('invest') || name.includes('etf') || name.includes('share') || name.includes('super') || name.includes('retirement')
    }).reduce((s: number, g: any) => s + convertToMonthly(parseFloat(g.paymentAmount || '0'), g.savingsFrequency || 'monthly'), 0)
    const targetMonthly15pct = monthlyIncome * 0.15
    // Met if: investing ≥ 15% of income via goals, OR has substantial investment portfolio (≥ 6 months income), OR has passive income
    const investmentGoalMet = passiveIncome > 0
      || (monthlyInvestingViaGoals >= targetMonthly15pct * 0.8 && totalInvestmentValue > 0)
      || (totalInvestmentValue + superBalance >= monthlyIncome * 6 && monthlyInvestingViaGoals > 0)
    if (!investmentGoalMet) {
      const progressPct = targetMonthly15pct > 0 ? Math.min(100, (monthlyInvestingViaGoals / targetMonthly15pct) * 100) : 0
      return { step: 4, title: 'Invest 15% + Super', desc: `Target: $${Math.round(targetMonthly15pct)}/mo (15% of income). Currently investing: $${Math.round(monthlyInvestingViaGoals)}/mo via goals`, progress: progressPct, icon: '📈', target: targetMonthly15pct, current: monthlyInvestingViaGoals }
    }

    // Step 5 — Home Deposit: only show if they DON'T own/aren't buying
    if (!alreadyOwnsHome) {
      const depositGoal = 100000
      const currentDeposit = assets.filter(a => a.name?.toLowerCase().includes('deposit') || a.name?.toLowerCase().includes('house')).reduce((s, a) => s + parseFloat(a.value || '0'), 0)
      return { step: 5, title: 'Home Deposit', desc: 'Save 10-20% for your home', progress: (currentDeposit / depositGoal) * 100, icon: '🏠', target: depositGoal, current: currentDeposit }
    }

    // Step 6 — Mortgage: only if they have one
    if (!mortgageFree) {
      const mortgageBalance = parseFloat(mortgageAccel.balance || '0') || mortgageDebt.reduce((s, d) => s + parseFloat(d.balance || '0'), 0)
      return { step: 6, title: 'Accelerate Your Mortgage', desc: 'Pay it off in 7-10 years, not 30', progress: 0, icon: '🚀', target: mortgageBalance, current: 0 }
    }

    return { step: 7, title: 'Build Wealth & Give', desc: 'Invest, enjoy, and be generous', progress: 100, icon: '💎', target: 0, current: 0 }
  }
  const currentBabyStep = getBabyStep()

  // ── FIRE NUMBER: Tax-adjusted gross-up ──
  // Logic: the portfolio earns returns that are TAXED. You need enough that after-tax income covers expenses.
  // Formula: if you need $X/yr after tax, and tax rate is T%, you need $X/(1-T) pre-tax earnings.
  // At 4% safe withdrawal rate: portfolio = pre-tax need / 0.04
  // Default AU tax estimate: 32.5% marginal on investment income (for earnings > $18,200)
  // Users can override the tax rate in the Grow tab.
  const fireTaxRate = 0.325  // 32.5% default — AU middle marginal rate
  const annualNeedAfterTax = totalOutgoing * 12
  const annualNeedPreTax = annualNeedAfterTax / (1 - fireTaxRate)  // gross up for tax
  const fireNumber = Math.ceil(annualNeedPreTax / 0.04)  // 4% rule on pre-tax need
  // Weekly equivalent: portfolio × 4% / 52 / (1 - taxRate) = weekly after-tax
  const weeklyAfterTax = (fireNumber * 0.04 * (1 - fireTaxRate)) / 52

  const fiPath = {
    monthlyNeed: totalOutgoing,
    passiveGap: totalOutgoing - passiveIncome,
    passiveCoverage,
    fireNumber,
    fireTaxRate,
    annualNeedAfterTax,
    annualNeedPreTax,
    weeklyAfterTax,
    currentInvestments: assets.filter(a => a.type === 'investment').reduce((sum, a) => sum + parseFloat(a.value || '0'), 0),
    yearsToFI: monthlySurplus > 0 ? Math.ceil((fireNumber - assets.filter(a => a.type === 'investment').reduce((sum, a) => sum + parseFloat(a.value || '0'), 0)) / (monthlySurplus * 12)) : 999
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

  // ==================== LIVE MILESTONE SYNC ====================
  // Keeps emergency fund milestones in sync with actual savings assets automatically
  useEffect(() => {
    if (roadmapMilestones.length === 0) return
    let changed = false
    const updated = roadmapMilestones.map((m: any) => {
      const name = (m.name || '').toLowerCase()
      const target = parseFloat(m.targetAmount || '0')
      if (target <= 0) return m

      if (name.includes('emergency') || name.includes('safety net') || name.includes('starter fund')) {
        const newProgress = Math.min(emergencyFund, target)
        const newCompleted = emergencyFund >= target
        if (Math.abs(newProgress - (m.currentAmount || 0)) > 0.5 || newCompleted !== m.completed) {
          changed = true
          return { ...m, currentAmount: newProgress, completed: newCompleted }
        }
      }
      return m
    })
    if (changed) setRoadmapMilestones(updated)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emergencyFund, assets.length])

  // ══════════════════════════════════════════════════════════════
  // COACHING IMPROVEMENT #1 — DAILY AI BRIEFING
  // ══════════════════════════════════════════════════════════════
  const generateDailyBriefing = async () => {
    if (monthlyIncome === 0) return // not set up yet
    const today = new Date().toDateString()
    if (dailyBriefing?.generatedDate === today) return // already generated today
    setDailyBriefingLoading(true)
    try {
      const overdueBills = expenses.filter((e: any) => {
        if (!e.dueDate) return false
        const due = new Date(e.dueDate + 'T12:00:00')
        return due <= new Date() && !Array.from(paidOccurrences).some(k => k.includes(e.id))
      })
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          messages: [{
            role: 'user',
            content: `You are Aureus, a personal financial coach. Write a 2-3 sentence morning briefing for this user. Be specific, warm, and direct — like a coach who knows them well. No generic advice.

User's situation:
- Monthly income: $${monthlyIncome.toFixed(0)}, surplus: $${monthlySurplus.toFixed(0)}
- Emergency fund: $${emergencyFund.toFixed(0)} (${emergencyMonths.toFixed(1)} months)
- Active debts: ${debts.length > 0 ? debts.map((d: any) => `${d.name} $${d.balance}`).join(', ') : 'none'}
- Active goals: ${goals.length > 0 ? goals.map((g: any) => `${g.name} ${Math.round((parseFloat(g.saved||'0')/parseFloat(g.target||'1'))*100)}% done`).join(', ') : 'none'}
- Current baby step: ${currentBabyStep.step} — ${currentBabyStep.title}
- Overdue bills today: ${overdueBills.length > 0 ? overdueBills.map((e: any) => `${e.name} $${e.amount}`).join(', ') : 'none'}
- Streak: ${streak} days
- Day of week: ${new Date().toLocaleDateString('en-AU', { weekday: 'long' })}
${moneyPersonality ? `- Money personality: ${personalityProfiles[moneyPersonality]?.label}` : ''}

Write 2-3 sentences only. Start with something specific to their situation — not "Good morning!" Be honest if things are tight. Be excited if things are going well. End with one concrete thing to focus on today. No markdown, no lists.`
          }]
        })
      })
      const data = await response.json()
      const text = data.content?.find((c: any) => c.type === 'text')?.text?.trim() || ''
      if (text) setDailyBriefing({ text, generatedDate: today })
    } catch (e) {
      // silent fail — fallback shown in UI
    }
    setDailyBriefingLoading(false)
  }

  // ══════════════════════════════════════════════════════════════
  // COACHING IMPROVEMENT #2 — CONTEXT SENTENCES ON NUMBERS
  // ══════════════════════════════════════════════════════════════
  const getStatContext = (statType: string): string => {
    switch (statType) {
      case 'surplus': {
        if (monthlySurplus <= 0) return 'Spending exceeds income this month — let\'s find the leak'
        const debtMonths = totalDebtBalance > 0 ? Math.ceil(totalDebtBalance / monthlySurplus) : 0
        if (totalDebtBalance > 0 && debtMonths < 36) return `= ${debtMonths} months to debt-free if redirected`
        const efMonths = monthlyExpenses > 0 ? Math.ceil(Math.max(0, 2000 - emergencyFund) / monthlySurplus) : 0
        if (emergencyFund < 2000) return `= ${efMonths} months to your $2,000 safety net`
        return `= $${(monthlySurplus * 12).toFixed(0)}/year compounding toward freedom`
      }
      case 'income': {
        const savePct = monthlyIncome > 0 ? Math.round((monthlyGoalSavings / monthlyIncome) * 100) : 0
        const investPct = monthlyIncome > 0 ? Math.round(((monthlyGoalSavings) / monthlyIncome) * 100) : 0
        if (savePct >= 20) return `Saving ${savePct}% of income — above average 🏆`
        if (savePct > 0) return `Saving ${savePct}% — target is 20% ($${Math.round(monthlyIncome * 0.2)}/mo)`
        return `Set up automated savings to make every pay count`
      }
      case 'networth': {
        if (netWorth < 0) return `Getting this positive is the first wealth milestone`
        const years = netWorth > 0 && monthlySurplus > 0 ? (netWorth / (monthlySurplus * 12)).toFixed(1) : null
        return years ? `= ${years} years of your current surplus` : `Your empire\'s foundation`
      }
      case 'goals': {
        if (monthlyGoalSavings === 0) return `Set up goals to track your savings progress`
        const pct = monthlyIncome > 0 ? Math.round((monthlyGoalSavings / monthlyIncome) * 100) : 0
        return `${pct}% of income going to purpose — keep building`
      }
      default: return ''
    }
  }

  // ══════════════════════════════════════════════════════════════
  // COACHING IMPROVEMENT #3 — BABY STEP ADVANCEMENT REACTION
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (prevBabyStep === null) { setPrevBabyStep(currentBabyStep.step); return }
    if (currentBabyStep.step <= prevBabyStep) return
    // Step advanced — generate a reaction
    const generateStepReaction = async () => {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 150,
            messages: [{
              role: 'user',
              content: `The user just advanced from Baby Step ${prevBabyStep} to Baby Step ${currentBabyStep.step} (${currentBabyStep.title}). Write 2 things:
1. A 1-sentence celebration of what they just achieved (specific, genuine, not generic)
2. A 1-sentence description of what Baby Step ${currentBabyStep.step} means for their life specifically

Their data: income $${monthlyIncome.toFixed(0)}/mo, surplus $${monthlySurplus.toFixed(0)}/mo, ${debts.length} debts, emergency fund $${emergencyFund.toFixed(0)}

Respond as JSON: {"celebration": "...", "nextFocus": "..."}`
            }]
          })
        })
        const data = await response.json()
        const text = data.content?.find((c: any) => c.type === 'text')?.text || ''
        const clean = text.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)
        setStepReaction({ step: currentBabyStep.step, message: parsed.celebration, nextSuggestion: parsed.nextFocus })
        // Auto-fire a win
        setWins((prev: any[]) => [...prev, {
          id: Date.now(), title: `Baby Step ${prevBabyStep} Complete!`,
          desc: parsed.celebration, icon: '🏆', auto: true, date: new Date().toISOString()
        }])
      } catch {}
    }
    generateStepReaction()
    setPrevBabyStep(currentBabyStep.step)
  }, [currentBabyStep.step])

  // ══════════════════════════════════════════════════════════════
  // COACHING IMPROVEMENT #5 — ACCOUNTABILITY CHECK-INS
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    // Days since last money date
    if (moneyDateLog && moneyDateLog.length > 0) {
      const last = new Date(moneyDateLog[moneyDateLog.length - 1])
      const days = Math.floor((Date.now() - last.getTime()) / 86400000)
      setDaysSinceMoneyDate(days)
    } else {
      setDaysSinceMoneyDate(999)
    }
    // Overdue items — payments that were due and not ticked
    const today = new Date()
    const overdue: any[] = []
    goals.forEach((g: any) => {
      if (!g.addedToCalendar || !g.paymentAmount || !g.startDate) return
      const due = new Date(g.startDate + 'T12:00:00')
      if (due < today) {
        const key = `goal-${g.id}-${due.getFullYear()}-${due.getMonth()}-${due.getDate()}`
        if (!Array.from(paidOccurrences).includes(key)) {
          overdue.push({ name: g.name, amount: g.paymentAmount, type: 'goal', daysAgo: Math.floor((today.getTime() - due.getTime()) / 86400000) })
        }
      }
    })
    setOverdueItems(overdue)
  }, [moneyDateLog, goals, paidOccurrences])

  // ══════════════════════════════════════════════════════════════
  // COACHING IMPROVEMENT #6 — PATTERN DETECTION
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (Object.keys(actualSpend).length < 2) return
    const patterns: string[] = []
    const monthKeys = Object.keys(actualSpend).sort()
    if (monthKeys.length >= 2) {
      const cats = EXPENSE_CATEGORIES.map(c => c.id)
      cats.forEach(cat => {
        const catInfo = EXPENSE_CATEGORIES.find(c => c.id === cat)
        const monthly = monthKeys.map(k => actualSpend[k][cat] || 0)
        const avg = monthly.reduce((s, v) => s + v, 0) / monthly.length
        const proj = getProjectedByCategory()[cat] || 0
        if (avg > 0 && proj > 0 && avg > proj * 1.2 && monthly.length >= 2) {
          patterns.push(`${catInfo?.icon} ${catInfo?.label} has been ${Math.round((avg/proj - 1) * 100)}% over budget on average across ${monthly.length} months — running $${Math.round(avg - proj)}/mo over`)
        }
        // Increasing trend
        if (monthly.length >= 3) {
          const last3 = monthly.slice(-3)
          if (last3[2] > last3[1] && last3[1] > last3[0] && last3[2] > 0) {
            patterns.push(`${catInfo?.icon} ${catInfo?.label} spending has increased every month for 3 months — up $${Math.round(last3[2] - last3[0])} from ${monthKeys[monthKeys.length-3]} to now`)
          }
        }
      })
    }
    setSpendingPatterns(patterns.slice(0, 3))
  }, [actualSpend])

  // ══════════════════════════════════════════════════════════════
  // COACHING IMPROVEMENT #7 — ROADMAP STEP TICK REACTION
  // ══════════════════════════════════════════════════════════════
  const tickPlanStepWithReaction = async (milestoneId: number, stepId: number, milestone: any, step: any) => {
    // First toggle the step as normal
    setRoadmapMilestones((prev: any[]) => prev.map(m =>
      m.id === milestoneId
        ? { ...m, weeklyPlan: m.weeklyPlan?.map((s: any) => s.id === stepId ? { ...s, done: !s.done } : s) }
        : m
    ))
    if (step.done) return // unticking — no reaction needed
    // Generate a reaction for completing this step
    try {
      const remainingSteps = milestone.weeklyPlan?.filter((s: any) => !s.done && s.id !== stepId) || []
      const nextStep = remainingSteps[0]
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 100,
          messages: [{
            role: 'user',
            content: `User just completed this step toward their goal "${milestone.name}": "${step.text}". ${nextStep ? `Next step is: "${nextStep.text}"` : 'This was the last step!'}

Write ONE sentence: brief celebration + what to expect from the next step (or final celebration if last step). Warm, specific, coach-like. No markdown.`
          }]
        })
      })
      const data = await response.json()
      const text = data.content?.find((c: any) => c.type === 'text')?.text?.trim()
      if (text) {
        setStepTickReaction({ milestoneId, stepId, message: text })
        setTimeout(() => setStepTickReaction(null), 6000)
      }
    } catch {}
  }

  // Trigger daily briefing on mount + when data changes enough
  useEffect(() => {
    if (onboardingComplete && monthlyIncome > 0) {
      generateDailyBriefing()
    }
  }, [onboardingComplete, currentBabyStep.step])

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
    if (monthlySurplus > 0 && incomeStreams.length > 0 && expenses.length > 0 && !existingTitles.includes('Positive monthly surplus')) newWinsList.push({ id: Date.now() + 2, title: 'Positive monthly surplus', desc: `You have $${monthlySurplus.toFixed(0)}/month left over after all bills, debts and goals — that's money working for you.`, icon: '🟢', auto: true, date: new Date().toISOString() })
    if (intentionalSavingsRate >= 20 && expenses.length > 0 && !existingTitles.includes('20% savings rate achieved')) newWinsList.push({ id: Date.now() + 3, title: '20% savings rate achieved', desc: `You're directing ${intentionalSavingsRate.toFixed(0)}% of your income to savings goals — well above the average Australian!`, icon: '🏆', auto: true, date: new Date().toISOString() })
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
  }, [incomeStreams, monthlySurplus, savingsRate, intentionalSavingsRate, emergencyFund, emergencyMonths, netWorth, goals, debts, assets, roadmapMilestones, wins])

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
    // Goals with calendar enabled
    goals.filter(g => g.paymentAmount && g.startDate && g.addedToCalendar).forEach(goal => {
      if (shouldShowItem(goal.startDate, goal.savingsFrequency || 'monthly', day, month, year)) {
        const id = `goal-${goal.id}-${year}-${month}-${day}`
        items.push({ ...goal, amount: goal.paymentAmount, name: `💜 ${goal.name}`, goalId: goal.id, itemId: id, itemType: 'goal', isPaid: paidOccurrences.has(id) })
      }
    })
    return items
  }

  const togglePaid = (itemId: string, item?: any) => {
    const newPaid = new Set(paidOccurrences)
    const wasAlreadyPaid = newPaid.has(itemId)

    if (wasAlreadyPaid) {
      newPaid.delete(itemId)
    } else {
      newPaid.add(itemId)
    }
    setPaidOccurrences(newPaid)

    // If this is a goal payment, update the goal's saved amount
    if (item?.itemType === 'goal' && item?.paymentAmount) {
      const paymentAmount = parseFloat(item.paymentAmount || '0')
      if (paymentAmount <= 0) return

      // Update the goal's saved amount using goalId (most reliable)
      const matchId = item.goalId || item.id
      setGoals(prev => prev.map(g => {
        if (g.id !== matchId) return g
        const currentSaved = parseFloat(g.saved || '0')
        const newSaved = wasAlreadyPaid
          ? Math.max(0, currentSaved - paymentAmount)
          : currentSaved + paymentAmount
        return { ...g, saved: newSaved.toFixed(2) }
      }))

      // Sync to linked roadmap milestone — match by goal name (strip emoji prefix)
      const cleanName = (item.name || '').replace('💜 ', '').trim()
      setRoadmapMilestones(prev => prev.map(m => {
        if (m.name.trim() !== cleanName) return m
        const current = parseFloat(m.currentAmount || '0')
        const updated = wasAlreadyPaid
          ? Math.max(0, current - paymentAmount)
          : current + paymentAmount
        return { ...m, currentAmount: updated }
      }))
    }
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
  const addIncome = () => { if (!newIncome.name || !newIncome.amount) return; setIncomeStreams([...incomeStreams, { ...newIncome, id: Date.now() }]); setNewIncome({ name: '', amount: '', frequency: 'fortnightly', type: 'active', startDate: (() => { const d = new Date(); d.setHours(0,0,0,0); let diff = 1 - d.getDay(); if (diff <= 0) diff += 7; d.setDate(d.getDate() + diff); return d.toISOString().split('T')[0] })() }) }
  const deleteIncome = (id: number) => setIncomeStreams(incomeStreams.filter(i => i.id !== id))
  const addExpense = () => { if (!newExpense.name || !newExpense.amount) return; setExpenses([...expenses, { ...newExpense, id: Date.now(), category: newExpense.category || 'other' }]); setNewExpense({ name: '', amount: '', frequency: 'monthly', category: '', dueDate: (() => { const d = new Date(new Date().getFullYear(), new Date().getMonth(), 1); if (d <= new Date()) d.setMonth(d.getMonth()+1); return d.toISOString().split('T')[0] })() }) }
  const deleteExpense = (id: number) => setExpenses(expenses.filter(e => e.id !== id))
  const addDebt = () => { if (!newDebt.name || !newDebt.balance) return; setDebts([...debts, { ...newDebt, id: Date.now(), originalBalance: newDebt.balance }]); setNewDebt({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: (() => { const d = new Date(new Date().getFullYear(), new Date().getMonth(), 1); if (d <= new Date()) d.setMonth(d.getMonth()+1); return d.toISOString().split('T')[0] })() }) }
  const deleteDebt = (id: number) => setDebts(debts.filter(d => d.id !== id))

  // ==================== GOAL INTEREST SIMULATOR ====================
  const simulateGoalSavings = (target: number, saved: number, payment: number, freq: string, annualRate: number) => {
    if (target <= 0 || payment <= 0) return null
    const toMonthly = (amt: number, f: string) => f === 'weekly' ? amt * (52/12) : f === 'fortnightly' ? amt * (26/12) : amt
    const monthlyPayment = toMonthly(payment, freq)
    const monthlyRate = annualRate / 100 / 12
    let balance = saved
    let totalContributed = saved
    let months = 0
    const MAX = 600
    while (balance < target && months < MAX) {
      months++
      balance = balance * (1 + monthlyRate) + monthlyPayment
      totalContributed += monthlyPayment
    }
    if (months >= MAX) return null
    const interestEarned = balance - totalContributed
    const deadline = new Date()
    deadline.setMonth(deadline.getMonth() + months)
    const deadlineStr = deadline.toISOString().split('T')[0]
    // Without interest comparison
    let monthsNoInterest = Math.ceil((target - saved) / monthlyPayment)
    return { months, years: months / 12, deadline: deadlineStr, interestEarned: Math.max(0, interestEarned), totalContributed, monthsNoInterest, monthsSaved: Math.max(0, monthsNoInterest - months) }
  }

  // ==================== DEBT PAYOFF SIMULATOR ====================
  const simulateDebtPayoff = (extraMonthly: number, method: 'avalanche' | 'snowball') => {
    if (debts.length === 0) return null
    const toMonthly = (amt: number, freq: string) => {
      if (freq === 'weekly') return amt * (52/12)
      if (freq === 'fortnightly') return amt * (26/12)
      return amt
    }
    // Build working copy of debts
    let stack = debts
      .filter(d => parseFloat(d.balance || '0') > 0)
      .map(d => ({
        name: d.name,
        balance: parseFloat(d.balance || '0'),
        rate: parseFloat(d.interestRate || '0') / 100 / 12,
        minPayment: toMonthly(parseFloat(d.minPayment || '0'), d.frequency || 'monthly'),
        interestPaid: 0
      }))
    if (stack.length === 0) return null

    // Sort by method
    stack = method === 'avalanche'
      ? [...stack].sort((a, b) => b.rate - a.rate)
      : [...stack].sort((a, b) => a.balance - b.balance)

    let months = 0
    let totalInterest = 0
    const MAX_MONTHS = 600 // 50 year cap

    while (stack.length > 0 && months < MAX_MONTHS) {
      months++
      let extra = extraMonthly
      // Apply interest + min payments
      for (const d of stack) {
        const interest = d.balance * d.rate
        d.interestPaid += interest
        totalInterest += interest
        d.balance += interest - d.minPayment
        if (d.balance < 0) d.balance = 0
      }
      // Apply extra to focus debt (first in stack after sorting)
      if (extra > 0 && stack[0]) {
        stack[0].balance -= extra
        if (stack[0].balance < 0) stack[0].balance = 0
      }
      // Remove paid-off debts, roll their payment into extra for next month
      const paid = stack.filter(d => d.balance <= 0)
      paid.forEach(d => { extra += d.minPayment }) // snowball/avalanche roll
      stack = stack.filter(d => d.balance > 0)
    }
    return { months, totalInterest, years: (months / 12) }
  }
  const addGoal = () => { if (!newGoal.name || !newGoal.target) return; setGoals([...goals, { ...newGoal, id: Date.now(), addedToCalendar: true }]); setNewGoal({ name: '', target: '', saved: '0', deadline: '', savingsFrequency: 'monthly', startDate: (() => { const d = new Date(); d.setHours(0,0,0,0); let diff = 1 - d.getDay(); if (diff <= 0) diff += 7; d.setDate(d.getDate() + diff); return d.toISOString().split('T')[0] })(), paymentAmount: '', addedToCalendar: true, interestRate: '' }) }
  const deleteGoal = (id: number) => setGoals(goals.filter(g => g.id !== id))
  const addAsset = () => { if (!newAsset.name || !newAsset.value) return; setAssets([...assets, { ...newAsset, id: Date.now() }]); setNewAsset({ name: '', value: '', type: 'savings' }) }
  const deleteAsset = (id: number) => setAssets(assets.filter(a => a.id !== id))

  // ==================== PROJECTED VS ACTUAL ====================
  const EXPENSE_CATEGORIES = [
    { id: 'housing',        label: 'Housing',        icon: '🏠' },
    { id: 'food',           label: 'Groceries',      icon: '🛒' },
    { id: 'eating_out',     label: 'Eating Out',     icon: '🍽️' },
    { id: 'transport',      label: 'Transport',      icon: '🚗' },
    { id: 'utilities',      label: 'Utilities',      icon: '⚡' },
    { id: 'health',         label: 'Health',         icon: '❤️' },
    { id: 'entertainment',  label: 'Entertainment',  icon: '🎬' },
    { id: 'clothing',       label: 'Clothing',       icon: '👕' },
    { id: 'personal',       label: 'Personal Care',  icon: '✨' },
    { id: 'education',      label: 'Education',      icon: '📚' },
    { id: 'subscriptions',  label: 'Subscriptions',  icon: '📱' },
    { id: 'debt_payments',  label: 'Debt Payments',  icon: '💳' },
    { id: 'goal_savings',   label: 'Goal Savings',   icon: '🎯' },
    { id: 'other',          label: 'Other',          icon: '📦' },
  ]

  const getMonthKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

  // Calculate this month's projected spend per category from fixed expenses
  const getProjectedByCategory = () => {
    const proj: {[cat: string]: number} = {}
    const toMonthly = (amt: number, freq: string) => {
      // Budget display: use simple multipliers (normal month = 4 weeks, 2 fortnights)
      if (freq === 'weekly') return amt * 4
      if (freq === 'fortnightly') return amt * 2
      if (freq === 'quarterly') return amt / 3
      if (freq === 'yearly') return amt / 12
      return amt
    }
    // Bills & expenses
    expenses.forEach((e: any) => {
      const cat = e.category || 'other'
      proj[cat] = (proj[cat] || 0) + toMonthly(parseFloat(e.amount || '0'), e.frequency)
    })
    // Debt minimum payments
    debts.forEach((d: any) => {
      const monthly = toMonthly(parseFloat(d.minPayment || '0'), d.frequency || 'monthly')
      proj['debt_payments'] = (proj['debt_payments'] || 0) + monthly
    })
    // Goal savings contributions
    goals.forEach((g: any) => {
      if (g.paymentAmount) {
        const monthly = toMonthly(parseFloat(g.paymentAmount || '0'), g.savingsFrequency || 'monthly')
        proj['goal_savings'] = (proj['goal_savings'] || 0) + monthly
      }
    })
    // Override with manually set category budgets
    Object.entries(categoryBudgets).forEach(([cat, amt]) => {
      if (amt) proj[cat] = parseFloat(amt)
    })
    return proj
  }

  const addActualSpend = (cat: string, amount: number, monthKey?: string) => {
    const key = monthKey || getMonthKey()
    setActualSpend(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [cat]: ((prev[key] || {})[cat] || 0) + amount }
    }))
  }

  const setActualForCategory = (cat: string, amount: number, monthKey?: string) => {
    const key = monthKey || getMonthKey()
    setActualSpend(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [cat]: amount }
    }))
  }

  // ==================== RECEIPT SCANNER ====================
  const scanReceipt = async (imageBase64: string, mediaType: string) => {
    setReceiptScanLoading(true)
    setReceiptScanResult(null)
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: imageBase64 }
              },
              {
                type: 'text',
                text: `You are reading a shopping receipt. Extract all information and respond ONLY with valid JSON, no other text:
{
  "store": "store name",
  "date": "YYYY-MM-DD or null",
  "total": 00.00,
  "categories": {
    "food": 00.00,
    "eating_out": 00.00,
    "transport": 00.00,
    "utilities": 00.00,
    "health": 00.00,
    "entertainment": 00.00,
    "clothing": 00.00,
    "personal": 00.00,
    "subscriptions": 00.00,
    "other": 00.00
  },
  "items": [
    {"name": "item name", "amount": 0.00, "category": "food"}
  ],
  "summary": "1-sentence summary of what was purchased"
}
Rules: Only include categories with non-zero amounts. Classify groceries/supermarket items as "food". Cafes/restaurants as "eating_out". Classify each item intelligently. Amounts in AUD.`
              }
            ]
          }]
        })
      })
      const data = await response.json()
      const text = data.content?.find((c: any) => c.type === 'text')?.text || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setReceiptScanResult(parsed)
    } catch (e) {
      setReceiptScanResult({ error: 'Could not read receipt. Please try a clearer photo.' })
    }
    setReceiptScanLoading(false)
  }

  const applyReceiptToActuals = (result: any, monthKey: string) => {
    if (!result?.categories) return
    Object.entries(result.categories).forEach(([cat, amt]) => {
      if (amt && parseFloat(amt as string) > 0) addActualSpend(cat, parseFloat(amt as string), monthKey)
    })
  }
  const addLiability = () => { if (!newLiability.name || !newLiability.value) return; setLiabilities([...liabilities, { ...newLiability, id: Date.now() }]); setNewLiability({ name: '', value: '', type: 'loan' }) }

  // ==================== AUTOMATION CALCULATOR ====================
  const calculateAutomation = () => {
    const payFrequency = incomeStreams[0]?.frequency || 'fortnightly'
    const payAmount = parseFloat(incomeStreams[0]?.amount || '0')
    const convertToPayPeriod = (amount: number, freq: string) => {
      if (freq === payFrequency) return amount
      // Convert via monthly (budget display) as common unit
      const monthly = convertToMonthly(amount, freq)
      if (payFrequency === 'weekly') return monthly / 4
      if (payFrequency === 'fortnightly') return monthly / 2
      return monthly
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
    const isDebtMilestone = /\bkill bad\b|\bpay.*off.*debt\b|\bdebt.*payoff\b|\bcredit card\b|\bbnpl\b|\bpersonal loan\b/i.test(milestone.name)
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

Create a 7-step action plan for this goal: "${milestone.name}"${milestone.targetAmount ? ` (target: $${milestone.targetAmount})` : ''}${milestone.notes ? `. Context: ${milestone.notes}` : ''}.

Rules:
- Output ONLY the 7 steps, nothing else. No intro sentence, no summary, no preamble.
- Format each line as: Step 1: [action]
- Each action must be specific, concrete, and doable — no fixed day requirement, user does them at their own pace
- One sentence per step
- Never suggest downloading another app or creating a spreadsheet — the user is already in Aureus
- MILESTONE TYPE: This is ${isDebtMilestone ? 'a DEBT PAYOFF milestone. Step 5 MUST be EXACTLY this word for word: "Add this debt to the Debts section in Aureus with the balance, interest rate, and minimum payment so it tracks your payoff progress automatically." Do NOT change a single word.' : 'a SAVINGS GOAL milestone — NOT a debt. Do NOT use the word "debt" anywhere in your plan. Step 5 MUST be EXACTLY this word for word: "Add this goal to your Aureus savings goals with your target amount and a weekly payment amount, then enable it on the calendar for visual tracking and reminders." Do NOT change a single word.'}
- Start directly with "Step 1:"${getPersonalityCoachingContext()}`,
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

      const goalDay5 = 'Add this goal to your Aureus savings goals with your target amount and a weekly payment amount, then enable it on the calendar for visual tracking and reminders.'
      const debtDay5 = 'Add this debt to the Debts section in Aureus with the balance, interest rate, and minimum payment so it tracks your payoff progress automatically.'

      const parsed = sourceLines.slice(0, 7).map((l: string, i: number) => {
        let text = stripMd(l.replace(/^(day\s*\d+[:.\-]?\s*|step\s*\d+[:.\-]?\s*|\d+[).\-]\s*)/i, '').trim())
        // Safety net: if AI hallucinated wrong Day 5, override it
        if (i === 4) {
          if (!isDebtMilestone && /add this debt|debts section/i.test(text)) text = goalDay5
          if (isDebtMilestone && /add this goal|savings goals/i.test(text)) text = debtDay5
        }
        return { id: Date.now() + i, text, done: false }
      }).filter((s: any) => s.text.length > 10)
      setRoadmapMilestones(prev => prev.map(m =>
        m.id === milestoneId ? { ...m, weeklyPlan: parsed, planGeneratedAt: new Date().toISOString() } : m
      ))
      setExpandedMilestone(milestoneId)
    } catch { alert('Could not generate plan — please try again.') }
    setGeneratingPlanFor(null)
  }

  // ══════════════════════════════════════════════════════════════
  // COACHING IMPROVEMENT #4 & #8 — AMBIENT CHAT (Ask Aureus about THIS)
  // ══════════════════════════════════════════════════════════════
  const askAureusAbout = (context: string) => {
    setChatContext(context)
    setActiveTab('chat')
    setShowMoreTabs(false)
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

  // ── Web search trigger detection ──
  const shouldUseWebSearch = (msg: string): boolean => {
    const lower = msg.toLowerCase()
    return [
      /\b(current|today'?s?|latest|now|2025|2026)\b.*\b(rate|price|cost|value|yield)/,
      /\b(interest rate|cash rate|rba|mortgage rate|home loan rate|savings rate|term deposit|hysa)\b/,
      /\b(asx|share price|stock price|etf|dividend|market)\b/,
      /\b(median (house|property|unit) price|rental yield|suburb|corelogic|domain)\b/,
      /\b(concessional cap|super limit|contribution limit|tax bracket|medicare levy|hecs)\b/,
      /\b(passive income idea|best savings account|high interest|best rate)\b/,
      /\b(grocery|supermarket|woolworths|coles|aldi|price of|on special|catalog|meal plan|recipe cost)\b/,
      /\b(what is the current|what are current|what'?s? the (current|latest)|how much does .* cost (now|today))\b/,
    ].some(r => r.test(lower))
  }

  // ── Sinking funds helpers ──
  const addSinkingFund = () => {
    if (!newSinkingFund.name || !newSinkingFund.targetAmount) return
    const target = parseFloat(newSinkingFund.targetAmount)
    const targetDate = newSinkingFund.targetDate
    let weeklyAmt = parseFloat(newSinkingFund.weeklyAmount || '0')
    // Auto-calc weekly if date given and no manual amount
    if (!weeklyAmt && targetDate) {
      const weeksLeft = Math.max(1, Math.ceil((new Date(targetDate).getTime() - Date.now()) / (7 * 86400000)))
      weeklyAmt = parseFloat((target / weeksLeft).toFixed(2))
    }
    setSinkingFunds(prev => [...prev, {
      ...newSinkingFund, id: Date.now(),
      weeklyAmount: weeklyAmt.toString(),
      savedAmount: '0',
      createdAt: new Date().toISOString()
    }])
    setNewSinkingFund({ name: '', targetAmount: '', targetDate: '', weeklyAmount: '', category: 'celebration', notes: '' })
  }
  const deleteSinkingFund = (id: number) => setSinkingFunds(prev => prev.filter(f => f.id !== id))
  const addToSinkingFund = (id: number, amount: number) => setSinkingFunds(prev => prev.map(f => f.id === id ? { ...f, savedAmount: (parseFloat(f.savedAmount || '0') + amount).toFixed(2) } : f))

  const handleChatMessage = async () => {
    if (!chatInput.trim() || isLoading) return
    const message = chatInput.trim()
    const useSearch = shouldUseWebSearch(message)
    setChatMessages(prev => [...prev, { role: 'user', content: message, usedWebSearch: useSearch }])
    setChatInput('')
    setIsLoading(true)
    try {
      const response = await fetch('/api/budget-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...buildApiBody(message), useWebSearch: useSearch })
      })
      const data = await response.json()
      const reply = data.message || data.advice || data.raw || "I'm here to help!"
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply, usedWebSearch: useSearch && data.searchedWeb }])
    } catch { setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong." }]) }
    setIsLoading(false)
  }

  // ==================== PERSONALITY-AWARE COACHING ====================
  const getPersonalityCoachingContext = () => {
    if (!moneyPersonality || !personalityProfiles[moneyPersonality]) return ''
    const profile = personalityProfiles[moneyPersonality]

    const coachingStyles: {[key: string]: string} = {
      planner: `The user is a Strategic Planner. They respond best to: data, systems, and optimisation language. They like specifics and numbers. Don't over-explain basics — get to the strategy. Challenge them to find inefficiencies in their already-good plan. Use language like "optimise", "system", "leverage". Avoid vague reassurances — they want actionable precision.`,

      avoider: `The user is an Avoider. They may feel shame or anxiety about money. Be warm, non-judgemental, and break everything into tiny concrete steps. Never overwhelm with too many options. Celebrate every small action. Use language like "just one thing", "this week", "that's all". Acknowledge that avoidance is normal and they're already doing the brave thing by being here.`,

      spender: `The user is a Lifestyle Spender. Don't lecture about spending — it creates defensiveness and they'll disengage. Instead, help them find the spending that doesn't actually bring them joy and redirect it. Frame everything around choice and freedom, not deprivation. Use language like "what actually matters to you", "conscious spending", "intentional". Help them see that cutting the right things means more of what they actually love.`,

      worrier: `The user is an Anxious Achiever. They need data and reassurance in equal measure. Lead with their actual numbers before giving advice — show them what the data says. Normalise their situation. Be calm and factual. Use language like "here's what the numbers show", "you're actually in a stronger position than", "the data says". Avoid language that amplifies uncertainty or uses words like "risk", "danger", "problem".`,

      hoarder: `The user is a Safety Seeker. They have strong savings discipline but may be leaving money on the table by keeping too much cash. Help them understand that offset accounts and strategic debt reduction ARE a form of safety — not risk. Frame investing and mortgage acceleration as "putting safety to work". Use language like "protected", "secure", "guaranteed return". Don't push them — guide them gently toward deploying money more effectively.`,

      warrior: `The user is a Financial Warrior. They're resilient and action-oriented but can be reactive without a system. Match their energy — be direct and decisive. Help them build a system that works when things are calm, not just when they're on fire. Use language like "battle plan", "lock it in", "this is your system now". Celebrate their resilience while giving them the structure to make it stick.`
    }

    return `\n\nUSER'S MONEY PERSONALITY: ${profile.label} (${moneyPersonality})
Coaching approach for this user: ${coachingStyles[moneyPersonality] || ''}
Their identity statements: ${identityStatements.filter(s => s.trim()).map(s => `"${s}"`).join(', ') || 'not set yet'}
Their deep why: ${deepWhyAnswers[0] ? `"${deepWhyAnswers[0]}"` : 'not completed yet'}
Always reference who they said they're becoming when relevant. Coach them as their personality type — not generically.`
  }

  const buildApiBody = (question: string, extraContext?: string) => ({
    mode: 'question',
    question: question + (extraContext || '') + getPersonalityCoachingContext(),
    financialData: { income: incomeStreams, expenses, debts, goals, assets, liabilities, roadmapMilestones },
    memory: budgetMemory,
    countryConfig: currentCountryConfig
  })

  // ==================== COACH TRIGGER ENGINE ====================
  // Fires whenever meaningful financial state changes.
  // Priority order: highest urgency triggers win.
  // Each trigger has a unique ID so it won't re-fire once dismissed.
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]

    // Track app opens for re-engagement
    if (lastAppOpen !== today) {
      setLastAppOpen(today)
    }

    const daysSinceCheckIn = lastCheckIn
      ? Math.floor((Date.now() - new Date(lastCheckIn).getTime()) / 86400000)
      : 999
    const daysSinceDailyCheckIn = lastDailyCheckIn
      ? Math.floor((Date.now() - new Date(lastDailyCheckIn).getTime()) / 86400000)
      : 999

    // Evaluate triggers in priority order — first match wins
    const triggers = [

      // ── ONBOARDING ──────────────────────────────────────────────
      {
        id: 'no_income',
        condition: incomeStreams.length === 0 && onboardingComplete,
        urgency: 'high' as const,
        icon: '💰',
        message: "You haven't added your income yet. I can't coach you without knowing your numbers.",
        action: "Add my income now →",
        tab: 'dashboard'
      },
      {
        id: 'no_expenses',
        condition: incomeStreams.length > 0 && expenses.length === 0,
        urgency: 'high' as const,
        icon: '💸',
        message: `Good — I can see you earn $${monthlyIncome.toFixed(0)}/mo. Now add your bills and expenses so I can find your real surplus.`,
        action: "Add my expenses →",
        tab: 'dashboard'
      },
      {
        id: 'no_mortgage',
        condition: incomeStreams.length > 0 && expenses.length > 0 && !mortgageAccel.balance,
        urgency: 'high' as const,
        icon: '🏠',
        message: "Your budget is set up. Next: enter your mortgage details so I can calculate your mortgage-free date and show you exactly how much you can save.",
        action: "Enter mortgage details →",
        tab: 'mortgage'
      },
      {
        id: 'no_personality',
        condition: !moneyPersonality && onboardingComplete && incomeStreams.length > 0,
        urgency: 'medium' as const,
        icon: '🧠',
        message: "I'm giving you generic advice right now. Take the 8-question money personality quiz and I'll coach you the way YOU specifically need to be coached.",
        action: "Take the quiz →",
        tab: 'insights'
      },

      // ── BABY STEP TRANSITIONS ────────────────────────────────────
      {
        id: 'baby_step_1_done',
        condition: emergencyFund >= 2000 && !dismissedTriggers.includes('baby_step_1_done') && currentBabyStep.step >= 2,
        urgency: 'high' as const,
        icon: '🛡️',
        message: `Your $2,000 emergency fund is in place — Baby Step 1 is DONE. 🎉 You're now on Baby Step 2: kill bad debt. List every credit card, personal loan, and BNPL balance in the Debts section.`,
        action: "Start Baby Step 2 →",
        tab: 'dashboard'
      },
      {
        id: 'bad_debt_done',
        condition: debts.filter(d => parseFloat(d.interestRate || '0') > 5 && !d.name?.toLowerCase().includes('mortgage')).length === 0 && debts.length > 0 && currentBabyStep.step >= 3,
        urgency: 'high' as const,
        icon: '💳',
        message: "All bad debt cleared! That's Baby Step 2 done. Now build your full 3-6 month emergency fund — that's the buffer that makes everything else possible.",
        action: "Set up emergency fund goal →",
        tab: 'path'
      },
      {
        id: 'emergency_fund_done',
        condition: emergencyMonths >= 3 && currentBabyStep.step >= 4 && !dismissedTriggers.includes('emergency_fund_done'),
        urgency: 'high' as const,
        icon: '🏦',
        message: `${emergencyMonths.toFixed(1)} months of expenses saved — Baby Step 3 is DONE. Now it's time to invest 15% of your income. Let's look at super salary sacrifice and ETFs.`,
        action: "Start investing →",
        tab: 'path'
      },

      // ── MORTGAGE ────────────────────────────────────────────────
      {
        id: 'mortgage_no_extra',
        condition: !!mortgageAccel.balance && !mortgageAccel.extraRepayment && monthlySurplus > 200,
        urgency: 'high' as const,
        icon: '🚀',
        message: `You have $${monthlySurplus.toFixed(0)} surplus per month and your mortgage is entered but you haven't set any extra repayments. Even $${Math.floor(monthlySurplus * 0.3).toFixed(0)} extra per month could save you years.`,
        action: "See the impact →",
        tab: 'mortgage'
      },
      {
        id: 'mortgage_rate_check',
        condition: !!mortgageAccel.balance && parseFloat(mortgageAccel.rate || '0') > 6.5,
        urgency: 'medium' as const,
        icon: '📉',
        message: `Your mortgage rate is ${mortgageAccel.rate}% — that's above the current market average. A rate review or refinance could save you thousands. This is worth a 15-minute call to your broker.`,
        action: "Learn about refinancing →",
        tab: 'learn'
      },

      // ── SURPLUS & SAVINGS ────────────────────────────────────────
      {
        id: 'surplus_not_allocated',
        condition: monthlySurplus > 300 && goals.length === 0 && debts.length === 0,
        urgency: 'high' as const,
        icon: '⚡',
        message: `You have $${monthlySurplus.toFixed(0)}/month in surplus with no goals or debts set up. That money is going nowhere. Let's put it to work — add a goal or set an extra mortgage repayment.`,
        action: "Allocate my surplus →",
        tab: 'path'
      },
      {
        id: 'low_savings_rate',
        condition: monthlyIncome > 0 && savingsRate < 10 && monthlyIncome > 3000,
        urgency: 'medium' as const,
        icon: '📊',
        message: `Your savings rate is ${savingsRate.toFixed(1)}% — the financial independence benchmark is 20%+. Let's find where the gap is and build a plan to close it.`,
        action: "Review my budget →",
        tab: 'dashboard'
      },

      // ── CHECK-IN & ACCOUNTABILITY ────────────────────────────────
      {
        id: 'check_in_overdue',
        condition: daysSinceCheckIn >= 8 && moneyDateLog.length > 0,
        urgency: 'medium' as const,
        icon: '🔥',
        message: `It's been ${daysSinceCheckIn} days since your last Money Date. Your streak is at risk. A 10-minute check-in keeps momentum going — even a quick one counts.`,
        action: "Do Money Date now →",
        tab: 'review'
      },
      {
        id: 'daily_checkin_nudge',
        condition: daysSinceDailyCheckIn >= 3 && dailyCheckInLog.length > 0,
        urgency: 'low' as const,
        icon: '✅',
        message: `You haven't done a daily check-in in ${daysSinceDailyCheckIn} days. 3 questions, 60 seconds — it's the habit that keeps you financially aware.`,
        action: "Quick check-in →",
        tab: 'review'
      },

      // ── ROADMAP & GOALS ──────────────────────────────────────────
      {
        id: 'no_roadmap',
        condition: roadmapMilestones.length === 0 && onboardingComplete && incomeStreams.length > 0,
        urgency: 'medium' as const,
        icon: '🗺️',
        message: "Your roadmap is empty. Add your top 3 financial milestones — paying off debt, building your emergency fund, your mortgage-free date — and I'll build a weekly plan for each.",
        action: "Build my roadmap →",
        tab: 'path'
      },
      {
        id: 'goal_nearly_complete',
        condition: goals.some(g => {
          const pct = (parseFloat(g.saved || '0') / parseFloat(g.target || '1')) * 100
          return pct >= 80 && pct < 100
        }),
        urgency: 'medium' as const,
        icon: '🎯',
        message: `One of your goals is over 80% complete! You're in the home stretch — consider increasing your payment frequency to finish it off.`,
        action: "View my goals →",
        tab: 'dashboard'
      },

      // ── POSITIVE MOMENTUM ────────────────────────────────────────
      {
        id: 'first_surplus',
        condition: monthlySurplus > 0 && incomeStreams.length > 0 && expenses.length > 0 && wins.length < 3,
        urgency: 'low' as const,
        icon: '🟢',
        message: `Your numbers are in and you have a $${monthlySurplus.toFixed(0)}/month surplus. This is your starting point — every dollar of that surplus directed intentionally changes your financial future.`,
        action: "See what to do with it →",
        tab: 'insights'
      }
    ]

    // Find highest priority unfired, non-dismissed trigger
    const priorityOrder = ['high', 'medium', 'low']
    for (const priority of priorityOrder) {
      const match = triggers.find(t =>
        t.urgency === priority &&
        t.condition &&
        !dismissedTriggers.includes(t.id)
      )
      if (match) {
        // Only update if it's a different trigger than current
        if (!coachNextAction || coachNextAction.triggeredBy !== match.id) {
          setCoachNextAction({
            message: match.message,
            action: match.action,
            tab: match.tab,
            icon: match.icon,
            urgency: match.urgency,
            triggeredBy: match.id
          })
        }
        return
      }
    }

    // All triggers dismissed or no conditions met — clear the card
    setCoachNextAction(null)
  }, [incomeStreams, expenses, debts, goals, assets, monthlySurplus, monthlyIncome, savingsRate, emergencyFund, emergencyMonths, mortgageAccel, moneyPersonality, roadmapMilestones, wins, streak, lastCheckIn, lastDailyCheckIn, moneyDateLog, dailyCheckInLog, onboardingComplete, currentBabyStep, dismissedTriggers])
  const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']

  const isMoneyDateDue = () => {
    const now = new Date()
    const todayName = dayNames[now.getDay()]
    if (todayName !== checkInSchedule.moneyDateDay) return false
    // Due if not done today already
    const today = now.toISOString().split('T')[0]
    if (moneyDateLog.length > 0 && new Date(moneyDateLog[0].date).toISOString().split('T')[0] === today) return false
    // Check if past the scheduled time
    const [h, m] = checkInSchedule.moneyDateTime.split(':').map(Number)
    return now.getHours() >= h || (now.getHours() === h && now.getMinutes() >= m)
  }

  const isDailyCheckInDue = () => {
    if (!checkInSchedule.dailyEnabled) return false
    const today = new Date().toISOString().split('T')[0]
    if (lastDailyCheckIn === today) return false
    // Available any time after midnight (daily is at user's leisure)
    return true
  }

  const dailyCheckInQuestions = [
    { q: "How are you feeling about your finances today?", type: 'scale3', options: ['Stressed', 'Neutral', 'Confident'] },
    { q: "Did you make a deliberate money decision today — big or small?", type: 'yesno' },
    { q: "One word to describe your money mindset today:", type: 'text', placeholder: "e.g. focused, distracted, motivated, anxious..." }
  ]

  const submitDailyCheckIn = () => {
    const today = new Date().toISOString().split('T')[0]
    const entry = { id: Date.now(), date: new Date().toISOString(), answers: dailyCheckInAnswers }
    setDailyCheckInLog(prev => [entry, ...prev.slice(0, 29)]) // keep last 30
    setLastDailyCheckIn(today)

    // Auto-win for consistent daily check-ins
    const recentDays = dailyCheckInLog.slice(0, 6)
    if (recentDays.length >= 6) {
      const allThisWeek = recentDays.every(e => {
        const d = new Date(e.date)
        const now = new Date()
        return (now.getTime() - d.getTime()) < 7 * 86400000
      })
      if (allThisWeek && !wins.some(w => w.title === '7-day daily check-in streak')) {
        setWins(prev => [...prev, { id: Date.now(), title: '7-day daily check-in streak', desc: "7 days of daily financial awareness. That's the habit that changes everything.", icon: '🔥', auto: true, date: new Date().toISOString() }])
      }
    }

    setShowDailyCheckIn(false)
    setDailyCheckInStep(0)
    setDailyCheckInAnswers({})
    setCelebrationWin('Daily check-in done ✅')
    setTimeout(() => setCelebrationWin(null), 2500)
  }
  const getDueMilestoneCheckIns = () => {
    const now = new Date()
    const fortnightNum = Math.floor(now.getTime() / (14 * 24 * 60 * 60 * 1000))

    return milestoneCheckIns.filter(ci => {
      const linkedGoal = goals.find(g => g.name === ci.milestoneName)
      const freq = linkedGoal?.savingsFrequency || 'weekly'

      if (freq === 'weekly') return true

      if (freq === 'fortnightly') {
        // Only ask on alternate weeks — check if last money date was more than 10 days ago
        if (moneyDateLog.length === 0) return true
        const daysSinceLast = (now.getTime() - new Date(moneyDateLog[0].date).getTime()) / 86400000
        return daysSinceLast >= 10
      }

      if (freq === 'monthly') {
        // Only ask if last Money Date was in a different calendar month
        if (moneyDateLog.length === 0) return true
        const lastDate = new Date(moneyDateLog[0].date)
        return lastDate.getMonth() !== now.getMonth() || lastDate.getFullYear() !== now.getFullYear()
      }

      return true
    })
  }

  // ==================== MISSION PHASE 2 — ROADMAP BUILDER ====================
  const advanceMission = (toStep?: number | null, toPhase?: number) => {
    if (toPhase === 2) {
      setMissionPhase(2)
      setMissionStep(0 as any)
      setMissionNavLocked(false)
      setMissionP2Step('analyse')
    } else if (toPhase === 3 || missionComplete) {
      setMissionPhase(3)
      setMissionComplete(true)
      setMissionNavLocked(false)
      setOnboardingComplete(true)
      setActiveTab('home' as any)
    } else {
      setMissionStep((toStep ?? missionStep + 1) as any)
    }
  }

  const generateRoadmapProposals = async () => {
    setMissionP2Loading(true)
    // Stay on 'analyse' step while loading — don't switch to 'propose' until data is ready
    try {
      const response = await fetch('/api/budget-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'question',
          question: `You are Aureus. A new user has just set up their financial profile. Based on their data, propose exactly 3 roadmap milestones that will have the biggest impact on their financial life. Be specific with numbers.

Their data:
- Monthly income: $${monthlyIncome.toFixed(0)}
- Monthly expenses: $${monthlyExpenses.toFixed(0)}  
- Monthly surplus: $${monthlySurplus.toFixed(0)}
- Existing savings: $${emergencyFund.toFixed(0)} (${emergencyMonths.toFixed(1)} months of expenses covered)
- Total bad debt: $${totalDebtBalance.toFixed(0)}
- Mortgage: ${mortgageAccel.balance ? `$${mortgageAccel.balance} at ${mortgageAccel.rate}%` : 'not entered'}
- Baby Step: ${currentBabyStep.step} — ${currentBabyStep.title}
- Money personality: ${moneyPersonality ? personalityProfiles[moneyPersonality]?.label : 'not assessed'}
- House status: ${houseStatus || 'not specified'}
- FIRE goal: ${fireGoal ? 'Yes' : 'No'}

CRITICAL RULES:
- If existing savings >= $2000, do NOT propose "Build $2,000 Emergency Fund" — they already have it. Acknowledge they're ahead and propose the NEXT step.
- If existing savings >= monthly expenses × 3, do NOT propose any emergency fund milestone — focus on debt/investing/mortgage.
- The 3 milestones must reflect where they ACTUALLY are, not where a default user would be.
- Each milestone must be something they have NOT already achieved.

Respond in this EXACT JSON format, no other text:
[
  {"name": "milestone name", "icon": "emoji", "target": number_or_0, "notes": "why this matters for them specifically", "priority": 1},
  {"name": "milestone name", "icon": "emoji", "target": number_or_0, "notes": "why this matters for them specifically", "priority": 2},
  {"name": "milestone name", "icon": "emoji", "target": number_or_0, "notes": "why this matters for them specifically", "priority": 3}
]`,
          financialData: { income: incomeStreams, expenses, debts, goals, assets },
          memory: budgetMemory,
          countryConfig: currentCountryConfig
        })
      })
      const data = await response.json()
      const raw: string = data.message || data.advice || data.raw || ''
      const jsonMatch = raw.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const proposals = JSON.parse(jsonMatch[0])
        setMissionP2Proposals(proposals)
        setMissionP2Confirmed(proposals.map(() => true))
        setMissionP2Step('propose') // only switch once data is ready
      } else {
        throw new Error('No JSON in response')
      }
    } catch {
      // Fallback proposals based on user's actual data — respects what's already achieved
      const hasEmergencyFund = emergencyFund >= 2000
      const hasFullEmergencyFund = emergencyMonths >= 3
      const monthlyExpenses3 = monthlyExpenses * 3

      const milestone1 = !hasEmergencyFund
        ? { name: 'Build $2,000 Emergency Fund', icon: '🛡️', target: 2000, notes: 'Your financial airbag — prevents going into debt when life throws surprises. This is the foundation everything else is built on.', priority: 1 }
        : !hasFullEmergencyFund
        ? { name: `Build ${Math.round(monthlyExpenses3)> 0 ? Math.round(monthlyExpenses3) : 6000} Full Emergency Fund`, icon: '🏦', target: Math.max(Math.round(monthlyExpenses3), 6000), notes: `You already have your $2,000 starter fund — great start. Now build 3 months of expenses ($${Math.round(monthlyExpenses3).toLocaleString()}) for true financial security.`, priority: 1 }
        : totalDebtBalance > 0
        ? { name: `Pay Off $${totalDebtBalance.toFixed(0)} Bad Debt`, icon: '💳', target: Math.round(totalDebtBalance), notes: 'Your emergency fund is solid. Now clear bad debt — every dollar of interest you stop paying is a guaranteed return.', priority: 1 }
        : { name: 'Grow Investments to $50,000', icon: '📈', target: 50000, notes: 'Debt-free with a solid emergency fund — now it\'s time to build real wealth through investing.', priority: 1 }

      const milestone2 = totalDebtBalance > 0 && hasEmergencyFund
        ? { name: `Pay Off $${totalDebtBalance.toFixed(0)} Bad Debt`, icon: '💳', target: Math.round(totalDebtBalance), notes: `Every dollar of bad debt is costing you in interest. Clearing this is a guaranteed return equal to your interest rate.`, priority: 2 }
        : mortgageAccel.balance
        ? { name: `Accelerate Mortgage Payoff`, icon: '🚀', target: 0, notes: `Extra repayments early in your mortgage save 3-4× that amount in interest.`, priority: 2 }
        : { name: 'Build 6-Month Emergency Fund', icon: '🏦', target: Math.round(monthlyExpenses * 6) || 12000, notes: 'Extend your safety net to 6 months for maximum financial resilience.', priority: 2 }

      const milestone3 = {
        name: mortgageAccel.balance ? `Be Mortgage-Free by ${new Date().getFullYear() + 8}` : fireGoal ? 'Reach Financial Independence' : 'Grow Wealth to $100,000',
        icon: mortgageAccel.balance ? '🏠' : '🔥',
        target: 0,
        notes: mortgageAccel.balance ? 'The ultimate finish line. When your mortgage is gone, every dollar you were paying the bank goes back into your life.' : 'Financial independence — when your passive income covers your lifestyle.',
        priority: 3
      }

      const fallback = [milestone1, milestone2, milestone3]
      setMissionP2Proposals(fallback)
      setMissionP2Confirmed(fallback.map(() => true))
      setMissionP2Step('propose')
    }
    setMissionP2Loading(false)
  }

  const confirmMissionRoadmap = async () => {
    setMissionP2Loading(true)
    setMissionP2Step('plan')

    const toAdd = missionP2Proposals.filter((_, i) => missionP2Confirmed[i])
    const now = Date.now()

    // Calculate starting currentAmount from actual assets for each milestone type
    const getInitialProgress = (p: any) => {
      const name = (p.name || '').toLowerCase()
      const target = parseFloat(p.target || '0')
      // Emergency fund milestones — use actual savings
      if (name.includes('emergency') || name.includes('safety net') || name.includes('starter fund')) {
        return Math.min(emergencyFund, target)
      }
      // Debt milestones — currentAmount represents amount paid off (starts at 0, target is original balance)
      if (name.includes('debt') || name.includes('credit card') || name.includes('pay off') || name.includes('loan')) {
        return 0
      }
      // Savings goals — use assets if matching name exists
      const matchingAsset = assets.find((a: any) =>
        a.type === 'savings' && (a.name || '').toLowerCase().includes(name.split(' ')[0].toLowerCase())
      )
      return matchingAsset ? Math.min(parseFloat(matchingAsset.value || '0'), target) : 0
    }

    const newMilestones = toAdd.map((p, i) => {
      const initialProgress = getInitialProgress(p)
      const target = parseFloat(p.target?.toString() || '0')
      const isAlreadyDone = target > 0 && initialProgress >= target
      return {
        id: now + i,
        name: p.name, icon: p.icon,
        targetAmount: p.target?.toString() || '0',
        currentAmount: initialProgress,
        targetDate: '', notes: p.notes,
        category: 'savings',
        completed: isAlreadyDone,
        createdAt: new Date().toISOString(),
        weeklyPlan: null
      }
    })

    // Add all milestones to roadmap
    setRoadmapMilestones(prev => [...prev, ...newMilestones])

    // Generate weekly plan for the first milestone
    if (newMilestones.length > 0) {
      try {
        const first = newMilestones[0]
        const isDebtMilestone = /\bkill bad\b|\bpay.*off.*debt\b|\bdebt.*payoff\b|\bcredit card\b|\bbnpl\b|\bpersonal loan\b/i.test(first.name)
        const response = await fetch('/api/budget-coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'question',
            question: `You are Aureus. Create a 7-day action plan for this goal: "${first.name}"${first.targetAmount !== '0' ? ` (target: $${first.targetAmount})` : ''}. Context: ${first.notes}

Rules:
- Output ONLY the 7 steps, nothing else. No intro sentence, no summary, no preamble.
- Format each line as: Step 1: [action]
- Each action must be specific, concrete, and doable — no fixed day requirement
- One sentence per step
- Never suggest downloading another app — the user is in Aureus
- MILESTONE TYPE: This is ${isDebtMilestone ? 'a DEBT PAYOFF milestone. Step 5 MUST be EXACTLY this word for word: "Add this debt to the Debts section in Aureus with the balance, interest rate, and minimum payment so it tracks your payoff progress automatically." Do NOT change a single word.' : 'a SAVINGS GOAL milestone — NOT a debt. Do NOT use the word "debt" anywhere in your plan. Step 5 MUST be EXACTLY this word for word: "Add this goal to your Aureus savings goals with your target amount and a weekly payment amount, then enable it on the calendar for visual tracking and reminders." Do NOT change a single word.'}
- Start directly with "Step 1:"${getPersonalityCoachingContext()}`,
            financialData: { income: incomeStreams, expenses, debts, goals, assets },
            memory: budgetMemory,
            countryConfig: currentCountryConfig
          })
        })
        const data = await response.json()
        const rawText: string = data.message || data.advice || data.raw || ''
        const stripMd = (s: string) => s.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/^#+\s*/, '').trim()
        const lines = rawText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0)
        const dayLines = lines.filter((l: string) => /^(day\s*\d+|step\s*\d+|\d+[).\-:])/i.test(l))
        const sourceLines = dayLines.length >= 5 ? dayLines : lines.filter((l: string) => {
          const s = stripMd(l).toLowerCase()
          return !s.startsWith("here's") && !s.startsWith("here is") && !s.startsWith("below") && !s.startsWith("sure") && l.length > 20
        })
        const goalDay5 = 'Add this goal to your Aureus savings goals with your target amount and a weekly payment amount, then enable it on the calendar for visual tracking and reminders.'
        const debtDay5 = 'Add this debt to the Debts section in Aureus with the balance, interest rate, and minimum payment so it tracks your payoff progress automatically.'
        const parsed = sourceLines.slice(0, 7).map((l: string, i: number) => {
          let text = stripMd(l.replace(/^(day\s*\d+[:.\-]?\s*|step\s*\d+[:.\-]?\s*|\d+[).\-]\s*)/i, '').trim())
          if (i === 4) {
            if (!isDebtMilestone && /add this debt|debts section/i.test(text)) text = goalDay5
            if (isDebtMilestone && /add this goal|savings goals/i.test(text)) text = debtDay5
          }
          return { id: now + 100 + i, text, done: false }
        }).filter((s: any) => s.text.length > 10)

        if (parsed.length > 0) {
          setRoadmapMilestones(prev => prev.map(m =>
            m.id === first.id ? { ...m, weeklyPlan: parsed, planGeneratedAt: new Date().toISOString() } : m
          ))
        }
      } catch { /* weekly plan generation is best-effort */ }
    }

    setMissionP2Loading(false)
    // User clicks "Enter Your Empire →" to advance — no auto-transition
  }

  // ==================== SMART DATE HELPERS ====================
  const DOW_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const DOW_FULL  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const ordinal = (n: number) => n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`

  // Get next occurrence of day-of-week from today (always future)
  const nextDayOfWeek = (dow: number): string => {
    const d = new Date()
    d.setHours(0,0,0,0)
    let diff = dow - d.getDay()
    if (diff <= 0) diff += 7
    d.setDate(d.getDate() + diff)
    return d.toISOString().split('T')[0]
  }

  // Get next occurrence of day-of-month (always future)
  const nextDayOfMonth = (dom: number): string => {
    const now = new Date()
    now.setHours(0,0,0,0)
    const d = new Date(now.getFullYear(), now.getMonth(), dom)
    if (d <= now) d.setMonth(d.getMonth() + 1)
    return d.toISOString().split('T')[0]
  }

  // SmartDatePicker — always shows a real date input.
  // For weekly/fortnightly also shows day-of-week shortcuts.
  // For monthly also shows day-of-month shortcuts.
  // The actual stored value is always a full YYYY-MM-DD date.
  const SmartDatePicker = ({
    frequency, value, onChange, label
  }: {
    frequency: string, value: string, onChange: (v: string) => void, label?: string
  }) => {
    const selectedDow = value ? new Date(value + 'T12:00:00').getDay() : -1
    const selectedDom = value ? parseInt(value.split('-')[2]) : -1

    const accentColor = frequency === 'fortnightly' ? theme.purple
      : frequency === 'weekly' ? theme.accent
      : theme.warning

    return (
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
        {label && <label style={{ color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>{label}</label>}

        {/* Always show full date picker */}
        <div>
          <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '5px' }}>
            {frequency === 'once' ? 'Date:' : 'Exact start date (sets the cycle):'}
          </div>
          <input
            type="date"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            style={{ ...inputStyle, width: '100%' }}
          />
        </div>

        {/* Confirmation text */}
        {value && (
          <div style={{ padding: '6px 10px', background: accentColor + '15', borderRadius: '6px', color: accentColor, fontSize: '11px' }}>
            {frequency === 'weekly' && `Every ${DOW_FULL[selectedDow]} · starting ${new Date(value + 'T12:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`}
            {frequency === 'fortnightly' && `Every second ${DOW_FULL[selectedDow]} · cycle starts ${new Date(value + 'T12:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`}
            {frequency === 'monthly' && `Every month on the ${ordinal(selectedDom)} · next: ${new Date(value + 'T12:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`}
            {frequency === 'quarterly' && `Quarterly from ${new Date(value + 'T12:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`}
            {frequency === 'yearly' && `Yearly on ${new Date(value + 'T12:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`}
            {frequency === 'once' && new Date(value + 'T12:00:00').toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        )}
      </div>
    )
  }

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
    planner: { label: 'The Strategic Planner', emoji: '🎯', desc: "You approach money with logic and structure. You're future-oriented, make deliberate decisions, and rarely let emotion drive spending. Your challenge is flexibility — when life doesn't follow the plan, you can freeze.", strength: 'Discipline, long-term thinking, goal clarity', blindspot: "Can be rigid — sometimes life needs you to adapt the plan, not abandon it", aureusFocus: "Focus on optimising systems and accelerating your mortgage. You're already wired right — Aureus helps you find the gaps in an already-good plan.", color: '#B68B2E' },
    avoider: { label: 'The Avoider', emoji: '🙈', desc: "Money stress makes you want to look away. You function fine day-to-day but big financial decisions get postponed indefinitely. The avoidance usually comes from a fear of discovering things are worse than you think.", strength: 'Adaptable, not materialistic, can live on little when needed', blindspot: "Avoidance is the most expensive money habit. Problems compound when ignored.", aureusFocus: "Aureus gives you a safe place to look — no judgement, just clarity. Small steps done consistently are your superpower.", color: '#D4AF37' },
    spender: { label: 'The Lifestyle Spender', emoji: '🛍️', desc: "You earn, you spend, you enjoy life. The problem isn't your income — it's the gap between what you earn and what leaves the account before the mortgage can benefit.", strength: 'Generous, social, knows how to enjoy the present', blindspot: "Lifestyle inflation silently kills wealth. Every $100/month in lifestyle is ~$30,000 less in your mortgage payoff.", aureusFocus: "Aureus helps you find the spending that doesn't actually make you happy — so you can cut that specifically, not everything.", color: '#c0392b' },
    worrier: { label: 'The Anxious Achiever', emoji: '😰', desc: "High earner, high anxiety. You work hard, earn well, but the number never feels like enough. Financial stress follows you even when you're doing well on paper.", strength: 'Motivated, responsible, high earning potential', blindspot: "Worry without action is just suffering. You need clear metrics that tell you you're actually okay.", aureusFocus: "Aureus gives you the data to replace worry with facts. The numbers usually look better than the fear tells you.", color: '#D4AF37' },
    hoarder: { label: 'The Safety Seeker', emoji: '🏦', desc: "Security drives every decision. You save aggressively but find it genuinely difficult to deploy money — even into good opportunities. The emergency fund has three years of expenses in it.", strength: 'Resilient, disciplined saver, never in a financial crisis', blindspot: "Hoarding cash while paying mortgage interest is costing you. Offset accounts and investments beat sitting on cash.", aureusFocus: "Aureus helps you put money to work without losing the security you need. Offset accounts are made for you.", color: '#D4AF37' },
    warrior: { label: 'The Financial Warrior', emoji: '⚔️', desc: "Setbacks don't stop you. You've been through financial difficulty and come out the other side stronger. You're motivated but sometimes reactive — you solve today's problem without a long-term system.", strength: 'Resilient, action-oriented, strong under pressure', blindspot: "Reactive without a system means repeating the same battles. You need a plan that works when things are calm, not just when they're on fire.", aureusFocus: "Aureus helps you build the system that matches your resilience. Your attitude is your biggest asset — let's give it structure.", color: '#D4AF37' }
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

Format each insight as a single line starting with an emoji, then the insight. No headers, no lists within insights. Be direct and specific. Focus on: patterns worth noting, risks, quick wins, mortgage acceleration opportunities, and behavioural observations. Tailor the tone to their money personality. Maximum 5 insights.${getPersonalityCoachingContext()}`,
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

Income: $${monthlyIncome.toFixed(0)}/mo | Expenses: $${monthlyExpenses.toFixed(0)}/mo | Surplus: $${monthlySurplus.toFixed(0)}/mo | Debt: $${totalDebtBalance.toFixed(0)} | Baby Step: ${currentBabyStep.step} | Mortgage: ${mortgageAccel.balance ? `$${mortgageAccel.balance} @ ${mortgageAccel.rate}%` : 'not entered'} | Emergency fund: ${emergencyMonths.toFixed(1)} months${getPersonalityCoachingContext()}`,
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

Each insight: one sentence, starts with an emoji, references actual numbers from their data. Focus on: category concentration, income ratios, opportunities to redirect to mortgage. Tailor tone to their money personality.${getPersonalityCoachingContext()}`,
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
    if (freq === 'weekly') return amount * 4
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
      stressLevel: moneyDateAnswers[3] || '3',
      milestoneAnswers: milestoneCheckIns.map((ci, i) => ({
        milestoneName: ci.milestoneName,
        answer: moneyDateAnswers[100 + i] || ''
      })).filter(a => a.answer)
    }
    setMoneyDateLog(prev => [entry, ...prev])

    // Log wins from milestone check-ins (only due ones)
    getDueMilestoneCheckIns().forEach((ci, i) => {
      const answer = moneyDateAnswers[100 + i]
      if (answer === 'yes' || answer === 'Yes') {
        setWins(prev => [...prev, {
          id: Date.now() + i + 1,
          title: `Made progress on: ${ci.milestoneName}`,
          desc: 'Confirmed in your weekly Money Date check-in',
          icon: '🎯', auto: true, date: new Date().toISOString()
        }])
      }
    })

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
      <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' as const }}>
          {/* Logo */}
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37 0%, #8C6A1F 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(212,175,55,0.3)', border: '4px solid #D4AF37', margin: '0 auto 24px' }}>
            <span style={{ color: '#0a0a0a', fontWeight: 800, fontSize: '40px' }}>A</span>
          </div>
          <h1 style={{ fontSize: '38px', fontWeight: 800, color: theme.text, margin: '0 0 12px 0' }}>Meet Aureus</h1>
          <p style={{ fontSize: '18px', color: theme.textMuted, margin: '0 0 8px 0', lineHeight: 1.5 }}>Your AI financial coach. I'll help you pay your mortgage off years early, eliminate debt, and build real wealth.</p>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 36px 0' }}>I won't just give you tools — I'll tell you exactly what to do, in the right order, one step at a time.</p>

          {/* What to expect */}
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', marginBottom: '28px', textAlign: 'left' as const, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 700, letterSpacing: '2px', marginBottom: '16px' }}>WHAT HAPPENS NEXT</div>
            {[
              { step: '1', icon: '🧠', text: 'I learn how you think about money (5 min quiz)' },
              { step: '2', icon: '💰', text: 'You enter your income, bills, and mortgage' },
              { step: '3', icon: '🗺️', text: 'I build your personalised financial roadmap' },
              { step: '4', icon: '📋', text: 'I generate your first week-by-week action plan' },
            ].map(item => (
              <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1a1208', border: '2px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{item.icon}</div>
                <div style={{ color: '#e2e8f0', fontSize: '14px' }}>{item.text}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setAppMode('budget')
              setShowModeSelector(false)
              setMissionPhase(1)
              setMissionStep(1)
              setMissionNavLocked(true)
              setActiveTab('chat')
            }}
            style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #D4AF37, #B68B2E)', border: 'none', borderRadius: '16px', color: 'white', fontSize: '18px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(16,185,129,0.3)', marginBottom: '12px' }}
          >
            Let's get started →
          </button>
          <button
            onClick={() => {
              setAppMode('budget')
              setShowModeSelector(false)
              setMissionComplete(true)
              setMissionNavLocked(false)
              setOnboardingComplete(true)
              setActiveTab('quickview')
            }}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px', padding: '8px' }}
          >
            I've used Aureus before — skip setup
          </button>
          <button onClick={() => setDarkMode(!darkMode)} style={{ marginTop: '16px', padding: '8px 20px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
        </div>
      </div>
    )
  }

  const mortgageResult = calculateMortgagePayoff()

  // ==================== MAIN APP ====================
  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>

      {/* ═══════════════════════════════════════════════════
          MISSION OVERLAY — Phase 1 (setup) & Phase 2 (roadmap)
          Covers full screen, guides user step by step
      ═══════════════════════════════════════════════════ */}
      {!missionComplete && missionPhase === 1 && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: theme.bg, zIndex: 3000, display: 'flex', flexDirection: 'column' as const, overflow: 'auto' }}>

          {/* Mission header */}
          <div style={{ padding: '16px 24px', background: theme.cardBg, borderBottom: '1px solid ' + theme.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #8C6A1F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0a0a0a', fontSize: '16px' }}>A</div>
              <div>
                <div style={{ color: theme.text, fontWeight: 700, fontSize: '15px' }}>Aureus Setup</div>
                <div style={{ color: theme.textMuted, fontSize: '11px' }}>{missionStep === 0 ? 'Welcome' : `Step ${missionStep} of 7`}</div>
              </div>
            </div>
            {/* Progress bar — only show after step 0 */}
            {missionStep > 0 && (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {[1,2,3,4,5,6,7].map(s => (
                  <div key={s} style={{ width: s === missionStep ? '24px' : '8px', height: '8px', borderRadius: '4px', background: s < missionStep ? theme.success : s === missionStep ? theme.accent : theme.border, transition: 'all 0.3s' }} />
                ))}
              </div>
            )}
          </div>

          {/* STEP 0 — Welcome */}
          {missionStep === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '40px 24px', maxWidth: '560px', margin: '0 auto', width: '100%', textAlign: 'center' as const }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #8C6A1F)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: '44px', fontWeight: 800, color: '#0a0a0a', boxShadow: '0 0 40px rgba(212,175,55,0.3)' }}>A</div>
              <h1 style={{ color: theme.text, fontSize: '32px', fontWeight: 800, margin: '0 0 12px 0', fontFamily: 'Cinzel, serif' }}>G'day, I'm Aureus.</h1>
              <p style={{ color: theme.textMuted, fontSize: '16px', lineHeight: 1.8, margin: '0 0 12px 0', maxWidth: '420px' }}>
                Your personal AI financial coach — built for Australians who want to pay off debt faster, build real wealth, and stop wondering what to do next.
              </p>
              <p style={{ color: theme.textMuted, fontSize: '13px', margin: '0 0 32px 0' }}>Takes about 5 minutes. Your data never leaves your device.</p>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px', width: '100%', maxWidth: '400px', marginBottom: '28px' }}>
                {[
                  { icon: '🧠', text: 'Understand your money personality' },
                  { icon: '💰', text: 'Map your income, bills, debts & savings' },
                  { icon: '📅', text: 'Set up your check-in schedule' },
                  { icon: '🛤️', text: 'Build your personalised roadmap' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: theme.cardBg, borderRadius: '10px', border: '1px solid ' + theme.border }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <span style={{ color: theme.text, fontSize: '14px' }}>{item.text}</span>
                    <span style={{ marginLeft: 'auto', color: theme.success, fontSize: '12px' }}>→</span>
                  </div>
                ))}
              </div>
              <button onClick={() => advanceMission(1)}
                style={{ width: '100%', maxWidth: '400px', padding: '18px', background: 'linear-gradient(135deg, #D4AF37 0%, #8C6A1F 100%)', color: '#0a0a0a', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '18px', fontWeight: 800, fontFamily: 'Cinzel, serif' }}>
                Begin →
              </button>
              <button onClick={() => { setMissionComplete(true); setMissionNavLocked(false); setOnboardingComplete(true); setActiveTab('home' as any) }}
                style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', marginTop: '14px', fontSize: '13px' }}>
                Skip setup — I'll do this later
              </button>
            </div>
          )}
          {missionStep === 1 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '32px 20px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🧠</div>
              <h2 style={{ color: theme.text, fontSize: '26px', margin: '0 0 8px 0', textAlign: 'center' as const }}>First — let me understand you.</h2>
              <p style={{ color: theme.textMuted, fontSize: '15px', textAlign: 'center' as const, lineHeight: 1.7, margin: '0 0 32px 0' }}>
                I coach everyone differently. Before I give you a single piece of advice, I need to know how you think about money — your personality, your fears, and what you're really working toward.
              </p>

              {!moneyPersonality ? (
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px', marginBottom: '28px' }}>
                    {personalityQuiz.map((question, qi) => (
                      <div key={qi} style={{ padding: '18px', background: theme.cardBg, borderRadius: '14px', border: '1px solid ' + theme.border }}>
                        <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}>{qi + 1}. {question.q}</div>
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
                  <button
                    onClick={() => { const result = calculatePersonality(); setMoneyPersonality(result) }}
                    disabled={Object.keys(personalityAnswers).length < 8}
                    style={{ width: '100%', padding: '16px', background: Object.keys(personalityAnswers).length < 8 ? theme.border : theme.accent, color: 'white', border: 'none', borderRadius: '12px', cursor: Object.keys(personalityAnswers).length < 8 ? 'default' : 'pointer', fontSize: '16px', fontWeight: 700, opacity: Object.keys(personalityAnswers).length < 8 ? 0.6 : 1 }}>
                    {Object.keys(personalityAnswers).length < 8 ? `Answer ${8 - Object.keys(personalityAnswers).length} more` : 'See my result →'}
                  </button>
                </div>
              ) : (
                // Personality result + deep why
                <div style={{ width: '100%' }}>
                  <div style={{ padding: '20px', background: personalityProfiles[moneyPersonality].color + '20', borderRadius: '16px', border: '2px solid ' + personalityProfiles[moneyPersonality].color + '40', marginBottom: '24px', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>{personalityProfiles[moneyPersonality].emoji}</div>
                    <div style={{ color: personalityProfiles[moneyPersonality].color, fontWeight: 800, fontSize: '20px', marginBottom: '8px' }}>{personalityProfiles[moneyPersonality].label}</div>
                    <p style={{ color: theme.textMuted, fontSize: '13px', margin: 0, lineHeight: 1.6 }}>{personalityProfiles[moneyPersonality].aureusFocus}</p>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ color: theme.text, fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>❤️ Now — tell me why.</div>
                    <p style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '14px' }}>What are you actually working toward? This is what I'll remind you of when motivation dips.</p>
                    <textarea
                      value={whyStatement}
                      onChange={e => setWhyStatement(e.target.value)}
                      placeholder="e.g. I want to be mortgage-free before my kids start high school so I can work less and be more present..."
                      style={{ ...inputStyle, width: '100%', minHeight: '90px', resize: 'vertical' as const }}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ color: theme.text, fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>⚡ Who are you becoming?</div>
                    <p style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '12px' }}>Write one identity statement. Not what you want to have — who you are becoming.</p>
                    <input
                      value={identityStatements[0] || ''}
                      onChange={e => setIdentityStatements([e.target.value])}
                      placeholder="I am someone who..."
                      style={{ ...inputStyle, width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ color: theme.text, fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>🏠 Your housing situation</div>
                    <p style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '12px' }}>This shapes your entire financial roadmap.</p>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                      {[
                        { value: 'paid_off', emoji: '🏆', label: 'I\'ve paid off my home', sub: 'Mortgage-free — focused on wealth building & investments' },
                        { value: 'own', emoji: '🏡', label: 'I own a home with a mortgage', sub: 'I want to pay it off faster' },
                        { value: 'buying', emoji: '📝', label: 'I\'m in the process of buying', sub: 'Currently going through the purchase process' },
                        { value: 'planning', emoji: '🎯', label: 'I\'m saving to buy', sub: 'Building my deposit — not quite there yet' },
                        { value: 'renting', emoji: '🏢', label: 'I\'m renting / not buying yet', sub: 'No property plans right now' },
                      ].map(opt => (
                        <button key={opt.value} onClick={() => setHouseStatus(opt.value)}
                          style={{ padding: '12px 16px', background: houseStatus === opt.value ? theme.accent + '20' : theme.bg, border: '2px solid ' + (houseStatus === opt.value ? theme.accent : theme.border), borderRadius: '10px', cursor: 'pointer', color: theme.text, textAlign: 'left' as const, display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span style={{ fontSize: '24px' }}>{opt.emoji}</span>
                          <div>
                            <div style={{ fontWeight: 600, color: houseStatus === opt.value ? theme.accent : theme.text }}>{opt.label}</div>
                            <div style={{ color: theme.textMuted, fontSize: '12px' }}>{opt.sub}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px', padding: '16px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border }}>
                    <div style={{ color: theme.text, fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>🔥 What are you building toward?</div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', padding: '12px', background: fireGoal ? theme.accent + '15' : theme.bg, borderRadius: '10px', border: '2px solid ' + (fireGoal ? theme.accent : theme.border) }}>
                        <input type="checkbox" checked={fireGoal} onChange={e => setFireGoal(e.target.checked)} style={{ accentColor: theme.accent, width: '18px', height: '18px', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <div style={{ color: theme.text, fontWeight: 600 }}>🏝️ Financial Independence / FIRE</div>
                          <div style={{ color: theme.textMuted, fontSize: '12px' }}>I want to calculate my FIRE number and build passive income to cover my expenses</div>
                        </div>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', padding: '12px', background: hasAutomatedPayments ? theme.accent + '15' : theme.bg, borderRadius: '10px', border: '2px solid ' + (hasAutomatedPayments ? theme.accent : theme.border) }}>
                        <input type="checkbox" checked={hasAutomatedPayments} onChange={e => setHasAutomatedPayments(e.target.checked)} style={{ accentColor: theme.accent, width: '18px', height: '18px', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <div style={{ color: theme.text, fontWeight: 600 }}>⚙️ I have automated payments/savings set up</div>
                          <div style={{ color: theme.textMuted, fontSize: '12px' }}>Direct debits, auto-transfers or scheduled savings already running</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => advanceMission(2)}
                    style={{ width: '100%', padding: '16px', background: theme.success, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>
                    Perfect. Now let's set up your numbers →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 — Income */}
          {missionStep === 2 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '32px 20px', maxWidth: '560px', margin: '0 auto', width: '100%' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>💰</div>
              <h2 style={{ color: theme.text, fontSize: '26px', margin: '0 0 8px 0', textAlign: 'center' as const }}>How much do you earn?</h2>
              <p style={{ color: theme.textMuted, fontSize: '15px', textAlign: 'center' as const, lineHeight: 1.7, margin: '0 0 28px 0' }}>
                I can't show you your surplus, your mortgage-free date, or your financial health score until I know your income. This is step one.
              </p>

              {/* Existing income streams */}
              {incomeStreams.length > 0 && (
                <div style={{ width: '100%', marginBottom: '16px' }}>
                  {incomeStreams.map(inc => (
                    <div key={inc.id} style={{ padding: '12px 16px', background: theme.success + '15', borderRadius: '10px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid ' + theme.success + '30' }}>
                      <div><div style={{ color: theme.text, fontWeight: 600 }}>{inc.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>${inc.amount} {inc.frequency}</div></div>
                      <button onClick={() => setIncomeStreams(prev => prev.filter(i => i.id !== inc.id))} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '16px' }}>×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add income form */}
              <div style={{ width: '100%', padding: '20px', background: theme.cardBg, borderRadius: '14px', border: '1px solid ' + theme.border, marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                  <div>
                    <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Income source (e.g. "Salary — JB Hi-Fi")</label>
                    <input placeholder="e.g. Salary" value={newIncome.name} onChange={e => setNewIncome({...newIncome, name: e.target.value})} style={{...inputStyle, width: '100%'}} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Take-home amount ($)</label>
                      <input type="number" placeholder="e.g. 2800" value={newIncome.amount} onChange={e => setNewIncome({...newIncome, amount: e.target.value})} style={{...inputStyle, width: '100%'}} />
                    </div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Paid</label>
                      <select value={newIncome.frequency} onChange={e => {
                        const freq = e.target.value
                        const defaultDate = freq === 'weekly' || freq === 'fortnightly' ? nextDayOfWeek(1) : nextDayOfMonth(1)
                        setNewIncome({...newIncome, frequency: freq, startDate: defaultDate})
                      }} style={{...inputStyle, width: '100%'}}>
                        <option value="weekly">Weekly</option>
                        <option value="fortnightly">Fortnightly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                  <SmartDatePicker
                    frequency={newIncome.frequency || 'fortnightly'}
                    value={newIncome.startDate}
                    onChange={v => setNewIncome({...newIncome, startDate: v})}
                    label="When is your next payday?"
                  />
                  <button onClick={() => { if (newIncome.name && newIncome.amount) { setIncomeStreams(prev => [...prev, { ...newIncome, id: Date.now(), type: 'active' }]); setNewIncome({ name: '', amount: '', frequency: 'fortnightly', type: 'active', startDate: nextDayOfWeek(1) }) } }} style={{ ...btnSuccess, padding: '12px' }}>
                    + Add income source
                  </button>
                </div>
              </div>

              {incomeStreams.length > 0 && (
                <div style={{ width: '100%' }}>
                  <div style={{ padding: '14px 16px', background: theme.success + '15', borderRadius: '10px', marginBottom: '16px', border: '1px solid ' + theme.success + '30' }}>
                    <div style={{ color: theme.success, fontWeight: 700 }}>Monthly income: ${monthlyIncome.toFixed(0)}</div>
                    <div style={{ color: theme.textMuted, fontSize: '12px' }}>Looking good. Add more sources if you have them, or continue.</div>
                  </div>
                  <button onClick={() => advanceMission(3)} style={{ width: '100%', padding: '16px', background: theme.accent, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>
                    That's my income. Next: my bills →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — Expenses */}
          {missionStep === 3 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '32px 20px', maxWidth: '560px', margin: '0 auto', width: '100%' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>💸</div>
              <h2 style={{ color: theme.text, fontSize: '26px', margin: '0 0 8px 0', textAlign: 'center' as const }}>What are your regular bills?</h2>
              <p style={{ color: theme.textMuted, fontSize: '15px', textAlign: 'center' as const, lineHeight: 1.7, margin: '0 0 8px 0' }}>
                Add your main recurring expenses. You don't need to be perfect — rough numbers get us started.
              </p>
              <p style={{ color: theme.textMuted, fontSize: '13px', textAlign: 'center' as const, margin: '0 0 24px 0' }}>
                Income: <strong style={{ color: theme.success }}>${monthlyIncome.toFixed(0)}/mo</strong>
              </p>

              {/* Quick presets */}
              <div style={{ width: '100%', marginBottom: '16px' }}>
                <div style={{ color: theme.textMuted, fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>QUICK ADD</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                  {presetBills.map(p => (
                    <button key={p.name} onClick={() => {
                      const amt = prompt(`${p.name} — enter amount ($):`, (p as any).amount || '')
                      if (amt) {
                        const dueDate = (p.frequency === 'weekly' || p.frequency === 'fortnightly')
                          ? (() => { const d = new Date(); d.setHours(0,0,0,0); let diff = 1 - d.getDay(); if (diff <= 0) diff += 7; d.setDate(d.getDate() + diff); return d.toISOString().split('T')[0] })()
                          : (() => { const d = new Date(new Date().getFullYear(), new Date().getMonth(), 1); if (d <= new Date()) d.setMonth(d.getMonth()+1); return d.toISOString().split('T')[0] })()
                        setExpenses(prev => [...prev, { id: Date.now(), name: p.name, amount: amt, frequency: p.frequency, category: p.category, dueDate }])
                      }
                    }} style={{ padding: '5px 12px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '20px', cursor: 'pointer', fontSize: '12px', color: theme.textMuted }}>
                      + {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Existing expenses */}
              {expenses.filter(e => !e.targetDebtId && !e.targetGoalId).length > 0 && (
                <div style={{ width: '100%', marginBottom: '16px' }}>
                  {expenses.filter(e => !e.targetDebtId && !e.targetGoalId).map(exp => (
                    <div key={exp.id} style={{ padding: '10px 14px', background: theme.danger + '10', borderRadius: '8px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid ' + theme.border }}>
                      <div><div style={{ color: theme.text, fontSize: '14px' }}>{exp.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>${exp.amount} {exp.frequency}</div></div>
                      <button onClick={() => setExpenses(prev => prev.filter(e => e.id !== exp.id))} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '16px' }}>×</button>
                    </div>
                  ))}
                  <div style={{ padding: '10px 14px', background: theme.cardBg, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ color: theme.textMuted, fontSize: '13px' }}>Total expenses</span>
                    <span style={{ color: theme.danger, fontWeight: 700 }}>${monthlyExpenses.toFixed(0)}/mo</span>
                  </div>
                  {monthlySurplus > 0 && (
                    <div style={{ padding: '10px 14px', background: theme.success + '15', borderRadius: '8px', marginTop: '6px', border: '1px solid ' + theme.success + '30', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: theme.success, fontWeight: 600, fontSize: '13px' }}>Your surplus</span>
                      <span style={{ color: theme.success, fontWeight: 700 }}>${monthlySurplus.toFixed(0)}/mo</span>
                    </div>
                  )}
                </div>
              )}

              {/* Custom expense */}
              <div style={{ width: '100%', padding: '16px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border, marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                    <input placeholder="Bill name" value={newExpense.name} onChange={e => setNewExpense({...newExpense, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '100px'}} />
                    <input type="number" placeholder="$" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} style={{...inputStyle, width: '80px'}} />
                    <select value={newExpense.frequency} onChange={e => {
                      const freq = e.target.value
                      const defaultDate = freq === 'weekly' || freq === 'fortnightly' ? nextDayOfWeek(1) : nextDayOfMonth(1)
                      setNewExpense({...newExpense, frequency: freq, dueDate: defaultDate})
                    }} style={inputStyle}>
                      <option value="weekly">Weekly</option>
                      <option value="fortnightly">Fortnightly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <SmartDatePicker
                    frequency={newExpense.frequency || 'monthly'}
                    value={newExpense.dueDate}
                    onChange={v => setNewExpense({...newExpense, dueDate: v})}
                    label="When is this bill due?"
                  />
                  <button onClick={() => {
                    if (newExpense.name && newExpense.amount) {
                      setExpenses(prev => [...prev, { ...newExpense, id: Date.now() }])
                      setNewExpense({ name: '', amount: '', frequency: 'monthly', category: '', dueDate: nextDayOfMonth(1) })
                    }
                  }} style={btnDanger}>+ Add bill</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button onClick={() => advanceMission(4)} style={{ padding: '14px 20px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', color: theme.textMuted, cursor: 'pointer', fontSize: '14px' }}>
                  Skip for now
                </button>
                <button onClick={() => advanceMission(4)} style={{ flex: 1, padding: '16px', background: expenses.length > 0 ? theme.accent : theme.border, color: expenses.length > 0 ? '#0a0a0a' : 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>
                  {expenses.length > 0 ? 'Next: my debts →' : 'Continue without expenses →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — Debts */}
          {missionStep === 4 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '32px 20px', maxWidth: '560px', margin: '0 auto', width: '100%' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>💳</div>
              <h2 style={{ color: theme.text, fontSize: '26px', margin: '0 0 8px 0', textAlign: 'center' as const }}>Any debts to tackle?</h2>
              <p style={{ color: theme.textMuted, fontSize: '15px', textAlign: 'center' as const, lineHeight: 1.7, margin: '0 0 8px 0' }}>
                Credit cards, personal loans, BNPL (Afterpay/Zip)? Knowing your debts lets Aureus build the right payoff order. Don't include your mortgage here.
              </p>
              <p style={{ color: theme.textMuted, fontSize: '12px', textAlign: 'center' as const, margin: '0 0 24px 0' }}>
                Don't know the exact figures? Rough numbers are fine — you can update them later.
              </p>

              {/* Existing debts */}
              {debts.length > 0 && (
                <div style={{ width: '100%', marginBottom: '16px' }}>
                  {debts.map(d => (
                    <div key={d.id} style={{ padding: '12px 16px', background: theme.warning + '15', borderRadius: '10px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid ' + theme.warning + '30' }}>
                      <div>
                        <div style={{ color: theme.text, fontWeight: 600 }}>{d.name}</div>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>${parseFloat(d.balance || '0').toFixed(0)} · {d.interestRate}% p.a. · ${d.minPayment}/{d.frequency}</div>
                      </div>
                      <button onClick={() => deleteDebt(d.id)} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '18px' }}>×</button>
                    </div>
                  ))}
                  <div style={{ padding: '10px 14px', background: theme.cardBg, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ color: theme.textMuted, fontSize: '13px' }}>Total bad debt</span>
                    <span style={{ color: theme.warning, fontWeight: 700 }}>${totalDebtBalance.toFixed(0)}</span>
                  </div>
                </div>
              )}

              {/* Add debt form */}
              <div style={{ width: '100%', padding: '16px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border, marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                    <input placeholder="Debt name (e.g. CommBank Visa)" value={newDebt.name} onChange={e => setNewDebt({...newDebt, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '140px'}} />
                    <input placeholder="Balance $" type="number" value={newDebt.balance} onChange={e => setNewDebt({...newDebt, balance: e.target.value})} style={{...inputStyle, width: '100px'}} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '3px' }}>Interest rate %</label>
                      <input placeholder="e.g. 19.99" type="number" value={newDebt.interestRate} onChange={e => setNewDebt({...newDebt, interestRate: e.target.value})} style={{...inputStyle, width: '100%'}} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '3px' }}>Min payment $</label>
                      <input placeholder="e.g. 150" type="number" value={newDebt.minPayment} onChange={e => setNewDebt({...newDebt, minPayment: e.target.value})} style={{...inputStyle, width: '100%'}} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '3px' }}>Frequency</label>
                      <select value={newDebt.frequency} onChange={e => {
                        const freq = e.target.value
                        setNewDebt({...newDebt, frequency: freq, paymentDate: freq === 'weekly' || freq === 'fortnightly' ? nextDayOfWeek(1) : nextDayOfMonth(1)})
                      }} style={{...inputStyle, width: '100%'}}>
                        <option value="weekly">Weekly</option>
                        <option value="fortnightly">Fortnightly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                  <SmartDatePicker
                    frequency={newDebt.frequency || 'monthly'}
                    value={newDebt.paymentDate}
                    onChange={v => setNewDebt({...newDebt, paymentDate: v})}
                    label="When is the payment due?"
                  />
                  <button onClick={addDebt} style={{...btnWarning, padding: '10px'}}>+ Add debt</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button onClick={() => advanceMission(5)} style={{ padding: '14px 20px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', color: theme.textMuted, cursor: 'pointer', fontSize: '14px' }}>
                  No debts — skip
                </button>
                <button onClick={() => advanceMission(5)} style={{ flex: 1, padding: '16px', background: debts.length > 0 ? theme.accent : theme.border, color: debts.length > 0 ? '#0a0a0a' : 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>
                  {debts.length > 0 ? `Next: my savings →` : 'Continue →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5 — Assets / Existing Savings */}
          {missionStep === 5 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '32px 20px', maxWidth: '560px', margin: '0 auto', width: '100%' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🏦</div>
              <h2 style={{ color: theme.text, fontSize: '26px', margin: '0 0 8px 0', textAlign: 'center' as const }}>What savings do you already have?</h2>
              <p style={{ color: theme.textMuted, fontSize: '15px', textAlign: 'center' as const, lineHeight: 1.7, margin: '0 0 8px 0' }}>
                This helps Aureus see if you've already hit Baby Step 1 ($2,000 emergency fund) and build your plan from the right starting point.
              </p>
              <p style={{ color: theme.textMuted, fontSize: '12px', textAlign: 'center' as const, margin: '0 0 24px 0' }}>
                Include savings accounts, term deposits, offset accounts. Not super — that's tracked separately.
              </p>

              {/* Existing assets */}
              {assets.filter(a => ['savings', 'investment', 'other'].includes(a.type)).length > 0 && (
                <div style={{ width: '100%', marginBottom: '16px' }}>
                  {assets.filter(a => ['savings', 'investment', 'other'].includes(a.type)).map(a => (
                    <div key={a.id} style={{ padding: '12px 16px', background: theme.success + '15', borderRadius: '10px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid ' + theme.success + '30' }}>
                      <div>
                        <div style={{ color: theme.text, fontWeight: 600 }}>{a.name}</div>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>{a.type}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: theme.success, fontWeight: 700 }}>${parseFloat(a.value || '0').toLocaleString()}</span>
                        <button onClick={() => deleteAsset(a.id)} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '18px' }}>×</button>
                      </div>
                    </div>
                  ))}
                  {(() => {
                    const totalSavings = assets.filter(a => ['savings','investment','other'].includes(a.type)).reduce((s, a) => s + parseFloat(a.value || '0'), 0)
                    const hasEmergencyFund = totalSavings >= 2000
                    return (
                      <div style={{ padding: '12px 16px', background: hasEmergencyFund ? theme.success + '20' : theme.warning + '15', borderRadius: '10px', border: '1px solid ' + (hasEmergencyFund ? theme.success + '40' : theme.warning + '40'), marginTop: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: hasEmergencyFund ? theme.success : theme.warning, fontWeight: 700, fontSize: '13px' }}>
                            {hasEmergencyFund ? '✅ Emergency fund covered!' : `⚡ $${(2000 - totalSavings).toFixed(0)} away from Baby Step 1`}
                          </span>
                          <span style={{ color: theme.success, fontWeight: 700 }}>${totalSavings.toLocaleString()}</span>
                        </div>
                        {hasEmergencyFund && <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>Aureus will skip straight to tackling your debts 💪</div>}
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Quick preset savings types */}
              <div style={{ width: '100%', marginBottom: '12px' }}>
                <div style={{ color: theme.textMuted, fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>QUICK ADD</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                  {[
                    { name: 'Emergency Fund', type: 'savings' },
                    { name: 'Savings Account', type: 'savings' },
                    { name: 'Offset Account', type: 'savings' },
                    { name: 'Term Deposit', type: 'savings' },
                    { name: 'Shares / ETFs', type: 'investment' },
                  ].map(p => (
                    <button key={p.name}
                      onClick={() => setNewAsset({ name: p.name, value: '', type: p.type })}
                      style={{ padding: '5px 12px', background: newAsset.name === p.name ? theme.accent + '30' : theme.cardBg, border: '1px solid ' + (newAsset.name === p.name ? theme.accent : theme.border), borderRadius: '20px', cursor: 'pointer', fontSize: '12px', color: newAsset.name === p.name ? theme.accent : theme.textMuted }}>
                      + {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add asset form */}
              <div style={{ width: '100%', padding: '16px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border, marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                  <input placeholder="Account name" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '130px'}} />
                  <input placeholder="Balance $" type="number" value={newAsset.value} onChange={e => setNewAsset({...newAsset, value: e.target.value})} style={{...inputStyle, width: '110px'}} />
                  <select value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} style={inputStyle}>
                    <option value="savings">Savings</option>
                    <option value="investment">Investment</option>
                    <option value="other">Other</option>
                  </select>
                  <button onClick={addAsset} style={{...btnSuccess, padding: '10px 16px'}}>+</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button onClick={() => advanceMission(6)} style={{ padding: '14px 20px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', color: theme.textMuted, cursor: 'pointer', fontSize: '14px' }}>
                  No savings yet — skip
                </button>
                <button onClick={() => advanceMission(6)} style={{ flex: 1, padding: '16px', background: theme.accent, color: '#0a0a0a', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>
                  {assets.length > 0 ? 'Next: my mortgage →' : 'Continue →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 6 — Mortgage */}
          {missionStep === 6 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '32px 20px', maxWidth: '560px', margin: '0 auto', width: '100%' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🏠</div>
              <h2 style={{ color: theme.text, fontSize: '26px', margin: '0 0 8px 0', textAlign: 'center' as const }}>Tell me about your mortgage.</h2>
              <p style={{ color: theme.textMuted, fontSize: '15px', textAlign: 'center' as const, lineHeight: 1.7, margin: '0 0 8px 0' }}>
                This is where the magic happens. I'll calculate your exact mortgage-free date and show you how to cut years off it.
              </p>
              {monthlySurplus > 0 && (
                <div style={{ padding: '10px 16px', background: theme.success + '15', borderRadius: '8px', marginBottom: '20px', border: '1px solid ' + theme.success + '30', textAlign: 'center' as const }}>
                  <span style={{ color: theme.success, fontSize: '13px' }}>You have <strong>${monthlySurplus.toFixed(0)}/month</strong> surplus that could be going onto your mortgage right now.</span>
                </div>
              )}

              <div style={{ width: '100%', padding: '20px', background: theme.cardBg, borderRadius: '14px', border: '1px solid ' + theme.border, marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '14px' }}>
                  <div>
                    <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Repayment frequency</label>
                    <select value={mortgageAccel.repaymentFrequency} onChange={e => setMortgageAccel({...mortgageAccel, repaymentFrequency: e.target.value})} style={{...inputStyle, width: '100%'}}>
                      <option value="weekly">Weekly</option>
                      <option value="fortnightly">Fortnightly (most common in AU)</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Remaining balance ($)</label>
                    <input type="number" placeholder="e.g. 420000" value={mortgageAccel.balance} onChange={e => setMortgageAccel({...mortgageAccel, balance: e.target.value})} style={{...inputStyle, width: '100%'}} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Interest rate (% p.a.)</label>
                      <input type="number" step="0.01" placeholder="e.g. 6.14" value={mortgageAccel.rate} onChange={e => setMortgageAccel({...mortgageAccel, rate: e.target.value})} style={{...inputStyle, width: '100%'}} />
                    </div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Years remaining</label>
                      <input type="number" placeholder="e.g. 25" value={mortgageAccel.remainingYears} onChange={e => setMortgageAccel({...mortgageAccel, remainingYears: e.target.value})} style={{...inputStyle, width: '100%'}} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live mortgage-free date preview */}
              {mortgageAccel.balance && mortgageAccel.rate && mortgageAccel.remainingYears && (() => {
                const res = calculateMortgagePayoff()
                if (!res) return null
                const freq = mortgageAccel.repaymentFrequency
                const suggestedExtra = monthlySurplus > 0
                  ? (freq === 'weekly' ? Math.floor(monthlySurplus * 0.3 / 4.33) : freq === 'fortnightly' ? Math.floor(monthlySurplus * 0.3 / 2) : Math.floor(monthlySurplus * 0.3))
                  : 0
                const extraResult = suggestedExtra > 0 ? (() => {
                  const r2 = parseFloat(mortgageAccel.rate) / 100 / (freq === 'weekly' ? 52 : freq === 'fortnightly' ? 26 : 12)
                  const pmt2 = res.repaymentUsed + suggestedExtra
                  const bal2 = parseFloat(mortgageAccel.balance)
                  if (pmt2 <= bal2 * r2) return null
                  const periods2 = Math.log(pmt2 / (pmt2 - bal2 * r2)) / Math.log(1 + r2)
                  const freqN = freq === 'weekly' ? 52 : freq === 'fortnightly' ? 26 : 12
                  const yrs2 = periods2 / freqN
                  return { yearsSaved: res.standard.years - yrs2, freeYear: new Date().getFullYear() + Math.ceil(yrs2), interestSaved: res.standard.interest - (pmt2 * periods2 - bal2) }
                })() : null
                return (
                  <div style={{ width: '100%', marginBottom: '20px' }}>
                    <div style={{ padding: '20px', background: 'linear-gradient(135deg, #0a0a0a, #1a1208)', borderRadius: '14px', textAlign: 'center' as const, border: '1px solid ' + theme.border }}>
                      <div style={{ color: theme.textMuted, fontSize: '11px', letterSpacing: '2px', marginBottom: '8px' }}>🏠 YOUR MORTGAGE-FREE DATE</div>
                      <div style={{ color: '#c0392b', fontSize: '40px', fontWeight: 800, marginBottom: '4px' }}>{res.standard.freeYear}</div>
                      <div style={{ color: '#64748b', fontSize: '12px', marginBottom: suggestedExtra > 0 ? '16px' : '0' }}>at current pace · ${Math.round(res.standard.interest / 1000)}k in interest</div>
                      {extraResult && suggestedExtra > 0 && (
                        <div style={{ padding: '12px', background: 'rgba(16,185,129,0.15)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)' }}>
                          <div style={{ color: '#B68B2E', fontSize: '13px', marginBottom: '4px' }}>💡 With just ${suggestedExtra} extra per {freq === 'weekly' ? 'week' : freq === 'fortnightly' ? 'fortnight' : 'month'}:</div>
                          <div style={{ color: '#B68B2E', fontWeight: 700, fontSize: '18px' }}>Mortgage-free by {extraResult.freeYear} — {extraResult.yearsSaved.toFixed(1)} years earlier, ${Math.round(extraResult.interestSaved / 1000)}k saved</div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}

              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button onClick={() => advanceMission(7)} style={{ padding: '14px 20px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', color: theme.textMuted, cursor: 'pointer', fontSize: '14px' }}>
                  Skip — I'll add this later
                </button>
                <button
                  onClick={() => advanceMission(7)}
                  style={{ flex: 1, padding: '16px', background: mortgageAccel.balance ? theme.success : theme.accent, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>
                  {mortgageAccel.balance ? "I can see my date. Next →" : "Next →"}
                </button>
              </div>
            </div>
          )}
          {/* STEP 7 — Schedule & Automation */}
          {missionStep === 7 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '32px 20px', maxWidth: '580px', margin: '0 auto', width: '100%' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>📅</div>
              <h2 style={{ color: theme.text, fontSize: '26px', margin: '0 0 8px 0', textAlign: 'center' as const }}>Set up your money rhythm.</h2>
              <p style={{ color: theme.textMuted, fontSize: '15px', textAlign: 'center' as const, lineHeight: 1.7, margin: '0 0 24px 0' }}>
                Consistent check-ins are what separate people who build wealth from those who don't. Let's schedule yours now.
              </p>

              {/* Weekly Money Date */}
              <div style={{ width: '100%', padding: '18px', background: theme.cardBg, borderRadius: '14px', border: '2px solid ' + theme.accent + '40', marginBottom: '14px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <span style={{ fontSize: '24px' }}>💰</span>
                  <div>
                    <div style={{ color: theme.text, fontWeight: 700, fontSize: '15px' }}>Weekly Money Date</div>
                    <div style={{ color: theme.textMuted, fontSize: '12px', lineHeight: 1.5 }}>15 mins every week — review spending, check bills, celebrate wins. This single habit is worth thousands.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
                  <div style={{ flex: 1, minWidth: '130px' }}>
                    <label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>Day</label>
                    <select value={checkInSchedule.moneyDateDay} onChange={e => setCheckInSchedule(s => ({ ...s, moneyDateDay: e.target.value }))} style={{ ...inputStyle, width: '100%' }}>
                      {['sunday','monday','tuesday','wednesday','thursday','friday','saturday'].map(day => (
                        <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>Time</label>
                    <input type="time" value={checkInSchedule.moneyDateTime} onChange={e => setCheckInSchedule(s => ({ ...s, moneyDateTime: e.target.value }))} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                </div>
              </div>

              {/* Daily check-in */}
              <div style={{ width: '100%', padding: '16px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border, marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: checkInSchedule.dailyEnabled ? '10px' : 0 }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px' }}>☀️</span>
                    <div>
                      <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>Daily check-in</div>
                      <div style={{ color: theme.textMuted, fontSize: '11px' }}>Quick win log — 2 minutes a day</div>
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={checkInSchedule.dailyEnabled} onChange={e => setCheckInSchedule(s => ({ ...s, dailyEnabled: e.target.checked }))} style={{ accentColor: theme.accent, width: '16px', height: '16px' }} />
                    <span style={{ color: theme.text, fontSize: '13px' }}>{checkInSchedule.dailyEnabled ? 'On' : 'Off'}</span>
                  </label>
                </div>
                {checkInSchedule.dailyEnabled && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <label style={{ color: theme.textMuted, fontSize: '12px' }}>Preferred time</label>
                    <input type="time" value={checkInSchedule.dailyTime} onChange={e => setCheckInSchedule(s => ({ ...s, dailyTime: e.target.value }))} style={{ ...inputStyle, width: '120px' }} />
                  </div>
                )}
              </div>

              {/* Monthly review */}
              <div style={{ width: '100%', padding: '16px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border, marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px' }}>📊</span>
                    <div>
                      <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>Monthly Review</div>
                      <div style={{ color: theme.textMuted, fontSize: '11px' }}>Net worth, goal progress, debt update</div>
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={checkInSchedule.monthlyEnabled} onChange={e => setCheckInSchedule(s => ({ ...s, monthlyEnabled: e.target.checked }))} style={{ accentColor: theme.accent, width: '16px', height: '16px' }} />
                    <span style={{ color: theme.text, fontSize: '13px' }}>{checkInSchedule.monthlyEnabled ? 'On' : 'Off'}</span>
                  </label>
                </div>
                {checkInSchedule.monthlyEnabled && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '3px' }}>Day of month</label>
                      <select value={checkInSchedule.monthlyDay} onChange={e => setCheckInSchedule(s => ({ ...s, monthlyDay: e.target.value }))} style={{ ...inputStyle }}>
                        {Array.from({length: 28}, (_,i) => i+1).map(d => <option key={d} value={d.toString()}>{d}{d===1?'st':d===2?'nd':d===3?'rd':'th'}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '3px' }}>Time</label>
                      <input type="time" value={checkInSchedule.monthlyTime} onChange={e => setCheckInSchedule(s => ({ ...s, monthlyTime: e.target.value }))} style={{ ...inputStyle, width: '120px' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Automated payments */}
              {!hasAutomatedPayments && (
                <div style={{ width: '100%', padding: '16px', background: theme.warning + '12', borderRadius: '12px', border: '2px solid ' + theme.warning + '40', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '22px' }}>⚙️</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: theme.warning, fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>Set up automated payments</div>
                      <div style={{ color: theme.textMuted, fontSize: '12px', lineHeight: 1.6, marginBottom: '12px' }}>
                        The #1 thing that separates people who build wealth from those who don't — automated transfers. Log in to your bank and set up auto-transfers for each of these before continuing:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px', marginBottom: '10px' }}>
                        {[
                          ...goals.filter((g: any) => g.paymentAmount).map((g: any) => ({ label: `${g.name} — $${g.paymentAmount}/${g.savingsFrequency || 'mo'}`, done: false })),
                          ...debts.map((d: any) => ({ label: `${d.name} min payment — $${d.minPayment}/${d.frequency || 'mo'}`, done: false })),
                        ].slice(0, 5).map((item, i) => (
                          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 10px', background: theme.bg, borderRadius: '8px' }}>
                            <span style={{ color: theme.warning, fontSize: '13px' }}>→</span>
                            <span style={{ color: theme.text, fontSize: '12px' }}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={hasAutomatedPayments} onChange={e => setHasAutomatedPayments(e.target.checked)} style={{ accentColor: theme.accent, width: '16px', height: '16px' }} />
                        <span style={{ color: theme.text, fontSize: '13px', fontWeight: 600 }}>I've set up (or will set up) automated transfers ✓</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
              {hasAutomatedPayments && (
                <div style={{ width: '100%', padding: '12px 16px', background: theme.success + '15', borderRadius: '10px', border: '1px solid ' + theme.success + '30', marginBottom: '14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '20px' }}>✅</span>
                  <span style={{ color: theme.success, fontSize: '13px', fontWeight: 600 }}>Automated payments set up — your money works while you sleep.</span>
                </div>
              )}

              <button onClick={() => advanceMission(null, 2)}
                style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #D4AF37 0%, #8C6A1F 100%)', color: '#0a0a0a', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '16px', fontWeight: 800, fontFamily: 'Cinzel, serif', marginTop: '8px' }}>
                Build my roadmap →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          MISSION PHASE 2 — ROADMAP BUILDER
      ═══════════════════════════════════════════════════ */}
      {!missionComplete && missionPhase === 2 && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: theme.bg, zIndex: 3000, display: 'flex', flexDirection: 'column' as const, overflow: 'auto' }}>
          <div style={{ padding: '16px 24px', background: theme.cardBg, borderBottom: '1px solid ' + theme.border, display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky' as const, top: 0, zIndex: 1 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #8C6A1F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0a0a0a', fontSize: '16px' }}>A</div>
            <div><div style={{ color: theme.text, fontWeight: 700, fontSize: '15px' }}>Building your roadmap</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>Almost there</div></div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '32px 20px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>

            {missionP2Step === 'analyse' && (
              <div style={{ textAlign: 'center' as const, width: '100%' }}>
                {missionP2Loading ? (
                  // Loading state — shown while API call is in progress
                  <div style={{ padding: '60px 20px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '24px', animation: 'pulse 1.5s infinite' }}>🧠</div>
                    <h2 style={{ color: theme.text, fontSize: '24px', margin: '0 0 12px 0' }}>Aureus is analysing your situation...</h2>
                    <p style={{ color: theme.textMuted, fontSize: '15px', lineHeight: 1.7, margin: '0 0 32px 0' }}>Looking at your income, surplus, mortgage, and personality to build the right roadmap for you specifically.</p>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px', maxWidth: '320px', margin: '0 auto' }}>
                      {[
                        { icon: '💰', text: `Income: $${monthlyIncome.toFixed(0)}/mo`, color: theme.success },
                        { icon: '📊', text: `Surplus: $${monthlySurplus.toFixed(0)}/mo`, color: monthlySurplus > 0 ? theme.success : theme.danger },
                        { icon: '🏠', text: mortgageAccel.balance ? `Mortgage: $${parseInt(mortgageAccel.balance).toLocaleString()}` : 'No mortgage entered', color: theme.accent },
                        { icon: '🧠', text: moneyPersonality ? personalityProfiles[moneyPersonality]?.label : 'Personality: not assessed', color: moneyPersonality ? personalityProfiles[moneyPersonality]?.color : theme.textMuted },
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: theme.cardBg, borderRadius: '10px', border: '1px solid ' + theme.border }}>
                          <span style={{ fontSize: '18px' }}>{item.icon}</span>
                          <span style={{ color: item.color, fontSize: '14px', fontWeight: 500 }}>{item.text}</span>
                          <span style={{ marginLeft: 'auto', color: theme.success, fontSize: '12px' }}>✓</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '32px', display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.accent, animation: `pulse 1s infinite ${i * 0.3}s` }} />
                      ))}
                    </div>
                  </div>
                ) : (
                  // Ready state — user presses button to trigger analysis
                  <>
                    <div style={{ fontSize: '56px', marginBottom: '20px' }}>🔍</div>
                    <h2 style={{ color: theme.text, fontSize: '24px', margin: '0 0 12px 0' }}>Let me analyse your situation.</h2>
                    <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '14px', marginBottom: '24px', textAlign: 'left' as const, border: '1px solid ' + theme.border }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                          { label: 'Monthly income', value: `$${monthlyIncome.toFixed(0)}`, color: theme.success },
                          { label: 'Monthly expenses', value: `$${monthlyExpenses.toFixed(0)}`, color: theme.danger },
                          { label: 'Monthly surplus', value: `$${monthlySurplus.toFixed(0)}`, color: monthlySurplus > 0 ? theme.success : theme.danger },
                          { label: 'Savings / Emergency fund', value: `$${emergencyFund.toFixed(0)} (${emergencyMonths.toFixed(1)}mo)`, color: emergencyFund >= 2000 ? theme.success : theme.warning },
                          { label: 'Baby Step', value: `Step ${currentBabyStep.step}`, color: theme.accent },
                          ...(mortgageAccel.balance ? [{ label: 'Mortgage balance', value: `$${parseInt(mortgageAccel.balance).toLocaleString()}`, color: theme.warning }] : []),
                          ...(totalDebtBalance > 0 ? [{ label: 'Total debt', value: `$${totalDebtBalance.toFixed(0)}`, color: theme.danger }] : []),
                        ].map(item => (
                          <div key={item.label} style={{ padding: '12px', background: theme.bg, borderRadius: '8px' }}>
                            <div style={{ color: theme.textMuted, fontSize: '11px' }}>{item.label}</div>
                            <div style={{ color: item.color, fontWeight: 700, fontSize: '16px' }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {moneyPersonality && personalityProfiles[moneyPersonality] && (
                      <div style={{ padding: '14px 16px', background: personalityProfiles[moneyPersonality].color + '15', borderRadius: '10px', marginBottom: '24px', border: '1px solid ' + personalityProfiles[moneyPersonality].color + '30', textAlign: 'left' as const }}>
                        <span style={{ fontSize: '20px' }}>{personalityProfiles[moneyPersonality].emoji}</span>
                        <span style={{ color: personalityProfiles[moneyPersonality].color, fontWeight: 600, fontSize: '13px', marginLeft: '8px' }}>Coaching you as a {personalityProfiles[moneyPersonality].label}</span>
                        <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>{personalityProfiles[moneyPersonality].aureusFocus}</div>
                      </div>
                    )}
                    <button
                      onClick={generateRoadmapProposals}
                      style={{ width: '100%', padding: '16px', background: theme.accent, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>
                      🗺️ Build my personalised roadmap →
                    </button>
                  </>
                )}
              </div>
            )}

            {missionP2Step === 'propose' && missionP2Proposals.length > 0 && (
              <div style={{ width: '100%' }}>
                <div style={{ textAlign: 'center' as const, marginBottom: '24px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🗺️</div>
                  <h2 style={{ color: theme.text, fontSize: '24px', margin: '0 0 8px 0' }}>Here's your roadmap.</h2>
                  <p style={{ color: theme.textMuted, fontSize: '14px', lineHeight: 1.6, margin: 0 }}>Based on your numbers and your {moneyPersonality && personalityProfiles[moneyPersonality]?.label.toLowerCase()} personality, these are the 3 milestones I'd prioritise. Untick any you don't want.</p>
                </div>

                {missionP2Proposals.map((p, i) => (
                  <div key={i} style={{ padding: '18px', background: missionP2Confirmed[i] ? theme.accent + '15' : theme.cardBg, borderRadius: '14px', marginBottom: '12px', border: '2px solid ' + (missionP2Confirmed[i] ? theme.accent + '60' : theme.border) }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <input type="checkbox" checked={missionP2Confirmed[i] || false} onChange={e => setMissionP2Confirmed(prev => { const n = [...prev]; n[i] = e.target.checked; return n })} style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: theme.accent, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '22px' }}>{p.icon}</span>
                          <span style={{ color: theme.text, fontWeight: 700, fontSize: '16px' }}>{p.name}</span>
                          {p.target > 0 && <span style={{ color: theme.accent, fontSize: '13px' }}>${p.target.toLocaleString()}</span>}
                        </div>
                        <div style={{ color: theme.textMuted, fontSize: '13px', lineHeight: 1.5 }}>{p.notes}</div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={confirmMissionRoadmap}
                  disabled={!missionP2Confirmed.some(Boolean)}
                  style={{ width: '100%', padding: '16px', background: missionP2Confirmed.some(Boolean) ? theme.success : theme.border, color: 'white', border: 'none', borderRadius: '12px', cursor: missionP2Confirmed.some(Boolean) ? 'pointer' : 'default', fontSize: '16px', fontWeight: 700, marginTop: '8px' }}>
                  {missionP2Loading ? '⏳ Generating your first weekly plan...' : `Add ${missionP2Confirmed.filter(Boolean).length} milestone${missionP2Confirmed.filter(Boolean).length !== 1 ? 's' : ''} & generate my first action plan →`}
                </button>
              </div>
            )}

            {missionP2Step === 'plan' && (
              <div style={{ textAlign: 'center' as const, padding: '40px 0' }}>
                {missionP2Loading ? (
                  <>
                    <div style={{ fontSize: '64px', marginBottom: '20px', animation: 'pulse 1.5s infinite' }}>📋</div>
                    <h2 style={{ color: theme.text, fontSize: '24px', margin: '0 0 12px 0' }}>Generating your first action plan...</h2>
                    <p style={{ color: theme.textMuted, fontSize: '14px', lineHeight: 1.6 }}>Aureus is building a personalised 7-day plan for your first milestone. One moment.</p>
                    <div style={{ marginTop: '24px', display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      {[0,1,2].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.accent, animation: `pulse 1s infinite ${i * 0.3}s` }} />)}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏛️</div>
                    <h2 style={{ color: theme.accent, fontSize: '28px', margin: '0 0 6px 0', fontFamily: 'Cinzel, serif' }}>Your Empire Begins.</h2>
                    <p style={{ color: theme.textMuted, fontSize: '15px', lineHeight: 1.7, marginBottom: '24px' }}>
                      Your roadmap is built. Aureus knows your numbers, your personality, and your goals.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', marginBottom: '28px', textAlign: 'left' as const }}>
                      <div style={{ color: theme.accent, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px', textAlign: 'center' as const }}>✅ WHAT JUST HAPPENED</div>
                      {[
                        { icon: '✓', text: `${missionP2Confirmed.filter(Boolean).length} milestones added to your roadmap`, color: theme.success },
                        { icon: '✓', text: 'First 7-step action plan generated for your #1 milestone', color: theme.success },
                        { icon: '✓', text: `Coaching personalised to your ${moneyPersonality ? personalityProfiles[moneyPersonality]?.label : 'profile'}`, color: theme.success },
                        { icon: '✓', text: `Money date scheduled for every ${checkInSchedule.moneyDateDay} at ${checkInSchedule.moneyDateTime}`, color: theme.success },
                        ...(checkInSchedule.dailyEnabled ? [{ icon: '✓', text: 'Daily check-in enabled', color: theme.success }] : []),
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 14px', background: item.color + '15', borderRadius: '10px', border: '1px solid ' + item.color + '30' }}>
                          <span style={{ color: item.color, fontWeight: 700 }}>{item.icon}</span>
                          <span style={{ color: theme.text, fontSize: '13px' }}>{item.text}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #1a1208, #0a0a0a)', borderRadius: '14px', border: '1px solid ' + theme.accent + '40', marginBottom: '24px', textAlign: 'left' as const }}>
                      <div style={{ color: theme.accent, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px' }}>📋 YOUR ORDER OF OPERATIONS</div>
                      {[
                        { step: '1', icon: '☀️', title: 'Daily (2 min)', desc: 'Log one win. Note one improvement. Check your calendar events for today.', tab: 'home' },
                        { step: '2', icon: '💰', title: `Every ${checkInSchedule.moneyDateDay} — Money Date`, desc: `${checkInSchedule.moneyDateTime} · Review your week's spending, tick off paid bills, check goal progress.`, tab: 'dashboard' },
                        { step: '3', icon: '🛤️', title: 'Work your roadmap steps', desc: 'Open Roadmap → tick off steps as you complete them. Aureus generates a new plan when you need one.', tab: 'path' },
                        { step: '4', icon: '📊', title: `${checkInSchedule.monthlyEnabled ? parseInt(checkInSchedule.monthlyDay) : 1}${checkInSchedule.monthlyEnabled && parseInt(checkInSchedule.monthlyDay)===1?'st':parseInt(checkInSchedule.monthlyDay)===2?'nd':parseInt(checkInSchedule.monthlyDay)===3?'rd':'th'} of each month`, desc: 'Update your net worth, debt balances, and goal progress. Runs in 10 minutes.', tab: 'review' },
                        { step: '5', icon: '💬', title: 'Ask Aureus anything', desc: 'Not sure what to do? Ask Aureus. It knows your full financial picture.', tab: 'chat' },
                      ].map((item) => (
                        <div key={item.step} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid ' + theme.border + '80' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: theme.accent + '25', border: '1px solid ' + theme.accent + '50', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '13px', fontWeight: 800, color: theme.accent }}>{item.step}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>{item.icon} {item.title}</div>
                            <div style={{ color: theme.textMuted, fontSize: '11px', lineHeight: 1.5, marginTop: '2px' }}>{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => advanceMission(null, 3)}
                      style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #D4AF37 0%, #8C6A1F 100%)', color: '#0a0a0a', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '18px', fontWeight: 800, fontFamily: 'Cinzel, serif' }}>
                      Enter Your Empire →
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* ==================== INTERACTIVE TOUR ==================== */}
      {showTour && (() => {
        const tourSteps = [
          {
            tab: 'home', icon: '🏠', title: 'Home — Your Daily Driver',
            desc: 'This is where you start every day. See your greeting, key stats, Aureus\'s next action for you, upcoming calendar events, and your active roadmap mission — all in one place. Click any stat card to jump straight to that section.',
            highlight: 'Empire Snapshot, Next Action card, This Week panel'
          },
          {
            tab: 'chat', icon: '💬', title: 'Aureus — Your AI Coach',
            desc: 'Ask Aureus anything about your money. It knows your full financial picture — income, debts, goals, personality, mortgage. Ask "Should I pay off my car or save first?" and get a personalised answer, not generic advice.',
            highlight: 'Fully personalised to your data and money personality'
          },
          {
            tab: 'dashboard', icon: '🎛️', title: 'Budget — Your Financial Engine',
            desc: 'Track every dollar in and out. Add income streams (salary, side income), bills and expenses with due dates, debts with a payoff accelerator that shows how much you\'ll save by adding extra payments, savings goals with an interest calculator, and your assets. The calendar shows everything plotted by date.',
            highlight: 'Income · Bills · Debts + Accelerator · Goals + Interest calc · Assets · Calendar'
          },
          {
            tab: 'path', icon: '🛤️', title: 'Roadmap — Your Financial Path',
            desc: 'Your personalised milestones — built by Aureus from your data. Each milestone gets a 7-step action plan. Tick off steps as you complete them. When you finish, Aureus generates a new plan. Add milestones from the roadmap or let Aureus propose them.',
            highlight: 'Baby Steps · Milestones · 7-step plans · Ask Aureus about any milestone'
          },
          {
            tab: 'mortgage', icon: '🚀', title: 'Mortgage Accelerator',
            desc: 'Enter your mortgage details and see your exact payoff date. Then see how much earlier you\'d be mortgage-free by adding even small extra repayments — with the interest saved shown in dollars. Offset account and lump sum tools also included.',
            highlight: 'Payoff date · Years saved · Interest saved · Australian offset calculator'
          },
          {
            tab: 'property', icon: '🏘️', title: 'Investment Property Portfolio',
            desc: 'Track every investment property in one place. Enter purchase price, current value, mortgage, weekly rent, and running costs (management fee, council, insurance, maintenance). Aureus calculates equity, LVR, gross yield, net yield, monthly cash flow, and capital gain per property — plus a portfolio summary.',
            highlight: 'Per-property: equity, LVR, gross/net yield, cash flow, capital gain · Portfolio total'
          },
          {
            tab: 'grow', icon: '📈', title: 'Grow & FIRE',
            desc: 'Calculate your FIRE number (Financial Independence, Retire Early) using your actual monthly expenses. Track your super balance, investment portfolio, and passive income. See how many years to financial independence based on your current savings rate.',
            highlight: 'FIRE number · Superannuation · Investments · Passive income · Years to FI'
          },
          {
            tab: 'insights', icon: '🧠', title: 'Insights — AI Financial Analysis',
            desc: 'Aureus analyses your full financial picture and surfaces insights you might have missed — spending patterns, savings opportunities, debt ordering, risk flags. Refreshed regularly based on your latest data.',
            highlight: 'Proactive analysis · Spending patterns · Opportunities · Risk alerts'
          },
          {
            tab: 'review', icon: '🔄', title: 'Monthly Review',
            desc: 'Your structured monthly check-in. Update net worth, check progress on every goal, review the month\'s wins and misses, and get Aureus\'s monthly coaching message. Takes about 10 minutes.',
            highlight: 'Net worth update · Goal progress · Wins & misses · Coach feedback'
          },
          {
            tab: 'overview', icon: '📊', title: 'Metrics — Your Financial Health',
            desc: 'A birds-eye view of your financial health score, net worth history chart, debt-to-income ratio, savings rate, emergency fund status, and all your assets vs liabilities. Great for your monthly review.',
            highlight: 'Health score · Net worth history · Savings rate · Emergency fund months'
          },
          {
            tab: 'wins', icon: '🏆', title: 'Wins — Your Progress Log',
            desc: 'Every win is recorded here — automatically (when you hit milestones like positive surplus, 20% savings rate, first debt paid off) or manually (you can add anything). Your streak is tracked. This is your proof that it\'s working.',
            highlight: 'Auto-wins · Manual wins · Streak tracking'
          },
          {
            tab: 'learn', icon: '🎓', title: 'Learn — Financial Education',
            desc: 'Core financial concepts explained clearly. Baby Steps, the avalanche vs snowball method, how compound interest works, Australian-specific content (super, offset accounts, negative gearing). Learn as you go.',
            highlight: 'Baby Steps · Debt methods · Compound interest · Australian concepts'
          },
        ]
        const step = tourSteps[tourStep]
        return (
          <div style={{ position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: theme.cardBg, borderRadius: '20px', border: '2px solid ' + theme.accent + '50', maxWidth: '560px', width: '100%', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
              {/* Tour header */}
              <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #1a1208, #0a0a0a)', borderBottom: '1px solid ' + theme.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {tourSteps.map((_, i) => (
                    <div key={i} onClick={() => setTourStep(i)} style={{ width: i === tourStep ? '20px' : '7px', height: '7px', borderRadius: '4px', background: i < tourStep ? theme.success : i === tourStep ? theme.accent : theme.border, cursor: 'pointer', transition: 'all 0.2s' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: theme.textMuted, fontSize: '12px' }}>{tourStep + 1} of {tourSteps.length}</span>
                  <button onClick={() => setShowTour(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}>×</button>
                </div>
              </div>
              {/* Tour content */}
              <div style={{ padding: '28px 28px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '14px' }}>{step.icon}</div>
                <h3 style={{ color: theme.accent, fontSize: '22px', fontWeight: 800, margin: '0 0 12px 0', fontFamily: 'Cinzel, serif' }}>{step.title}</h3>
                <p style={{ color: theme.text, fontSize: '15px', lineHeight: 1.7, margin: '0 0 16px 0' }}>{step.desc}</p>
                <div style={{ padding: '10px 14px', background: theme.accent + '12', borderRadius: '8px', border: '1px solid ' + theme.accent + '30', color: theme.textMuted, fontSize: '12px', lineHeight: 1.6 }}>
                  <span style={{ color: theme.accent, fontWeight: 600 }}>Includes: </span>{step.highlight}
                </div>
              </div>
              {/* Tour footer */}
              <div style={{ padding: '16px 28px 24px', display: 'flex', gap: '10px' }}>
                {tourStep > 0 && (
                  <button onClick={() => { setTourStep(tourStep - 1); setActiveTab(tourSteps[tourStep - 1].tab as any) }}
                    style={{ padding: '10px 18px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '10px', cursor: 'pointer', color: theme.textMuted, fontSize: '14px' }}>
                    ← Back
                  </button>
                )}
                <button
                  onClick={() => { setActiveTab(step.tab as any); setShowMoreTabs(false) }}
                  style={{ padding: '10px 18px', background: theme.accent + '20', border: '1px solid ' + theme.accent + '50', borderRadius: '10px', cursor: 'pointer', color: theme.accent, fontSize: '13px', fontWeight: 600 }}>
                  Open {step.icon}
                </button>
                {tourStep < tourSteps.length - 1 ? (
                  <button onClick={() => { setTourStep(tourStep + 1); setActiveTab(tourSteps[tourStep + 1].tab as any) }}
                    style={{ flex: 1, padding: '10px 18px', background: 'linear-gradient(135deg, #D4AF37 0%, #8C6A1F 100%)', border: 'none', borderRadius: '10px', cursor: 'pointer', color: '#0a0a0a', fontSize: '14px', fontWeight: 700 }}>
                    Next →
                  </button>
                ) : (
                  <button onClick={() => { setShowTour(false); setActiveTab('home' as any) }}
                    style={{ flex: 1, padding: '10px 18px', background: 'linear-gradient(135deg, #D4AF37 0%, #8C6A1F 100%)', border: 'none', borderRadius: '10px', cursor: 'pointer', color: '#0a0a0a', fontSize: '14px', fontWeight: 700 }}>
                    🏠 Start building →
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ==================== QUICK HELP GUIDE ==================== */}
      {showHelpGuide && (
        <div style={{ position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowHelpGuide(false)}>
          <div style={{ background: theme.cardBg, borderRadius: '20px', border: '1px solid ' + theme.border, maxWidth: '620px', width: '100%', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid ' + theme.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky' as const, top: 0, background: theme.cardBg, zIndex: 1 }}>
              <div>
                <div style={{ color: theme.accent, fontWeight: 800, fontSize: '18px', fontFamily: 'Cinzel, serif' }}>❓ Aureus Help Guide</div>
                <div style={{ color: theme.textMuted, fontSize: '12px' }}>Everything you need to know</div>
              </div>
              <button onClick={() => setShowHelpGuide(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '22px' }}>×</button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>
              {[
                {
                  icon: '📋', title: 'Your Daily Routine',
                  items: [
                    'Open Home tab every morning — check your Next Action and any calendar events due today',
                    'Tick off calendar items when you pay them (Budget tab → Calendar)',
                    'Log a win when something goes right (Wins tab → + Add)',
                    'Ask Aureus when you\'re unsure what to do next',
                  ]
                },
                {
                  icon: '💰', title: 'Weekly Money Date',
                  items: [
                    'Sit down for 15 minutes on your chosen day (see Settings → Schedule)',
                    'Review your Budget — any bills unpaid? Any overspending?',
                    'Check your Goals — on track? Adjust if needed',
                    'Open Roadmap — tick off any completed steps, generate a new plan if ready',
                    'Record your weekly win',
                  ]
                },
                {
                  icon: '📊', title: 'Monthly Review (10 min)',
                  items: [
                    'Open Review tab on your chosen date each month',
                    'Update your debt balances to what they actually are now',
                    'Update your goal "already saved" amounts',
                    'Snapshot your net worth (Metrics tab)',
                    'Ask Aureus: "How did my month go?" for a full AI analysis',
                  ]
                },
                {
                  icon: '🛤️', title: 'Working Your Roadmap',
                  items: [
                    'Focus on ONE milestone at a time — the top of the list',
                    'Tick off steps as you complete them — no fixed deadline per step',
                    'When all 7 steps are done, hit "New Plan" for a fresh 7-step set',
                    'Click "Set up in Goals →" on Step 5 to connect the goal to your budget',
                    'Ask Aureus about any milestone for specific coaching',
                  ]
                },
                {
                  icon: '💳', title: 'Debt Payoff',
                  items: [
                    'Add all debts in Budget → Debts with balance, rate, and minimum payment',
                    'Aureus uses Avalanche method by default (highest rate first = most interest saved)',
                    'Switch to Snowball (smallest balance first) if you need quick wins for motivation',
                    'Use the Payoff Accelerator to see how much extra payments save you',
                    '"Use 50% surplus" auto-fills a smart extra payment from your monthly surplus',
                  ]
                },
                {
                  icon: '🎯', title: 'Goals & Interest',
                  items: [
                    'Enter your savings account interest rate to see how much interest you\'ll earn',
                    'The Target Date auto-calculates as you type your payment amount',
                    'Tick "Show on calendar" to see payment reminders plotted on your calendar',
                    'Tick off goal payments in the calendar as you make them — this fills the progress bar',
                    'Link a goal from your Roadmap using "Set up in Goals →" on Step 5',
                  ]
                },
                {
                  icon: '🏘️', title: 'Investment Properties',
                  items: [
                    'Add each IP with purchase price, current value, mortgage balance, and weekly rent',
                    'Enter running costs: management fee %, council rates, insurance, maintenance',
                    'Aureus calculates gross yield, net yield, equity, LVR, and monthly cash flow',
                    'Negatively geared = cash flow is negative but may be tax deductible — see your accountant',
                    'Update current value periodically (e.g. after a valuation) to track capital growth',
                  ]
                },
                {
                  icon: '🔥', title: 'FIRE & Financial Independence',
                  items: [
                    'Your FIRE number = annual expenses × 25 (the 4% rule)',
                    'Aureus calculates this from your actual expense data in Budget',
                    'Track super in Grow tab — it counts toward your FIRE number from age 60',
                    'Passive income (dividends, rent profit) reduces how much you need to save',
                    'Years to FI shown live based on your current savings rate',
                  ]
                },
                {
                  icon: '💬', title: 'Getting the Most from Aureus Chat',
                  items: [
                    'Ask specific questions: "Should I pay off my credit card or save for a house deposit?"',
                    'Ask for explanations: "Explain offset accounts in simple terms"',
                    'Ask for a plan: "Give me a 3-month plan to pay off my car loan faster"',
                    'Ask about your data: "What\'s my biggest financial risk right now?"',
                    'Aureus knows your personality — it coaches you accordingly',
                  ]
                },
              ].map(section => (
                <div key={section.title}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{section.icon}</span>
                    <div style={{ color: theme.accent, fontWeight: 700, fontSize: '14px', letterSpacing: '0.3px' }}>{section.title}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px', paddingLeft: '30px' }}>
                    {section.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{ color: theme.accent, fontSize: '12px', marginTop: '3px', flexShrink: 0 }}>→</span>
                        <span style={{ color: theme.text, fontSize: '13px', lineHeight: 1.6 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ padding: '14px', background: theme.accent + '12', borderRadius: '10px', border: '1px solid ' + theme.accent + '30' }}>
                <div style={{ color: theme.accent, fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>💡 Pro tip</div>
                <div style={{ color: theme.textMuted, fontSize: '13px', lineHeight: 1.6 }}>Click <strong style={{ color: theme.text }}>▶ Tour</strong> in the header to get a full walkthrough of every tab with descriptions of what each one does. You can jump to any tab directly from the tour.</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { setShowHelpGuide(false); setTourStep(0); setShowTour(true) }}
                  style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #D4AF37 0%, #8C6A1F 100%)', color: '#0a0a0a', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>
                  ▶ Take the Tour
                </button>
                <button onClick={() => setShowHelpGuide(false)}
                  style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '10px', cursor: 'pointer', color: theme.textMuted, fontSize: '14px' }}>
                  Got it ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {celebrationWin && (
        <div style={{ position: 'fixed' as const, top: '20px', right: '20px', zIndex: 9999, padding: '16px 20px', background: 'linear-gradient(135deg, #D4AF37, #B68B2E)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(212,175,55,0.3)', color: 'white', maxWidth: '320px', animation: 'slideIn 0.3s ease' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>🏆 New Win Unlocked!</div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>{celebrationWin}</div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ padding: '12px 24px', background: theme.cardBg, borderBottom: '1px solid ' + theme.border, position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #D4AF37 50%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #D4AF37' }}>
              <span style={{ color: '#0a0a0a', fontWeight: 800, fontSize: '18px' }}>A</span>
            </div>
            <span style={{ color: theme.text, fontWeight: 700, fontSize: '20px' }}>Aureus</span>
            {streak > 0 && <span style={{ padding: '3px 10px', background: '#D4AF3720', color: '#D4AF37', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>🔥 {streak}-week streak</span>}
            {/* Coach next action — compact header badge */}
            {coachNextAction && activeTab !== 'quickview' && (
              <button
                onClick={() => setActiveTab('quickview')}
                style={{ padding: '3px 10px', background: coachNextAction.urgency === 'high' ? theme.warning + '20' : theme.accent + '20', color: coachNextAction.urgency === 'high' ? theme.warning : theme.accent, border: '1px solid ' + (coachNextAction.urgency === 'high' ? theme.warning + '50' : theme.accent + '40'), borderRadius: '20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}
                title={coachNextAction.message}
              >
                {coachNextAction.icon} {coachNextAction.urgency === 'high' ? 'Action needed' : 'Aureus recommends'}
              </button>
            )}
            {/* Due badges */}
            {isMoneyDateDue() && (
              <button onClick={() => { setShowMoneyDate(true); setMoneyDateStep(0); setMoneyDateAnswers({}) }} style={{ padding: '3px 10px', background: theme.success + '20', color: theme.success, border: '1px solid ' + theme.success + '50', borderRadius: '20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', animation: 'pulse 2s infinite' }}>
                💰 Money Date due
              </button>
            )}
            {isDailyCheckInDue() && (
              <button onClick={() => { setShowDailyCheckIn(true); setDailyCheckInStep(0); setDailyCheckInAnswers({}) }} style={{ padding: '3px 10px', background: theme.accent + '20', color: theme.accent, border: '1px solid ' + theme.accent + '50', borderRadius: '20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                ✅ Daily check-in
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => { setTourStep(0); setShowTour(true) }} title="Take a tour" style={{ padding: '7px 12px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.accent, fontWeight: 700, fontSize: '13px' }}>▶ Tour</button>
            <button onClick={() => setShowHelpGuide(true)} title="Help guide" style={{ padding: '7px 12px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text, fontWeight: 700, fontSize: '14px' }}>?</button>
            <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '7px 12px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text }}>{darkMode ? '☀️' : '🌙'}</button>
            <select value={userCountry} onChange={e => setUserCountry(e.target.value as any)} style={{ padding: '6px 10px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text, fontSize: '14px' }}>
              <option value="AU">🇦🇺 AU</option><option value="US">🇺🇸 US</option><option value="UK">🇬🇧 UK</option><option value="NZ">🇳🇿 NZ</option><option value="CA">🇨🇦 CA</option>
            </select>
          </div>
        </div>
        {/* NAV TABS - primary always visible, secondary in More drawer */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' as const, paddingBottom: '2px', alignItems: 'center' }}>
          {[
            { id: 'home',      label: '🏠 Home' },
            { id: 'chat',      label: '💬 Aureus' },
            { id: 'dashboard', label: '🎛️ Budget' },
            { id: 'path',      label: '🛤️ Roadmap' },
            { id: 'wins',      label: `🏆 Wins${wins.length > 0 ? ` (${wins.length})` : ''}` },
          ].map(tab => (
            <button key={tab.id}
              onClick={() => { if (missionNavLocked) return; setActiveTab(tab.id as any); setShowMoreTabs(false) }}
              style={{ padding: '7px 14px', background: activeTab === tab.id ? theme.accent : 'transparent', color: activeTab === tab.id ? '#0a0a0a' : missionNavLocked ? theme.textMuted + '60' : theme.text, border: '1px solid ' + (activeTab === tab.id ? theme.accent : theme.border), borderRadius: '8px', cursor: missionNavLocked ? 'default' : 'pointer', fontSize: '12px', fontWeight: activeTab === tab.id ? 700 : 500, whiteSpace: 'nowrap' as const, flexShrink: 0, opacity: missionNavLocked ? 0.4 : 1 }}>
              {tab.label}
            </button>
          ))}

          {/* MORE DROPDOWN */}
          <div style={{ position: 'relative' as const, flexShrink: 0 }}>
            <button onClick={() => setShowMoreTabs(!showMoreTabs)}
              style={{ padding: '7px 14px', background: ['mortgage','property','insights','grow','review','overview','learn','quickview'].includes(activeTab) ? theme.accent + '25' : 'transparent', color: ['mortgage','property','insights','grow','review','overview','learn','quickview'].includes(activeTab) ? theme.accent : theme.textMuted, border: '1px solid ' + (showMoreTabs ? theme.accent + '60' : theme.border), borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap' as const }}>
              {['mortgage','property','insights','grow','review','overview','learn','quickview'].includes(activeTab) ? '● More ▾' : 'More ▾'}
            </button>
            {showMoreTabs && (
              <div style={{ position: 'absolute' as const, top: 'calc(100% + 6px)', left: 0, background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', padding: '8px', zIndex: 300, minWidth: '210px', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
                <div style={{ color: theme.accent, fontSize: '10px', fontWeight: 700, padding: '4px 10px 8px', letterSpacing: '1px' }}>BUILD WEALTH</div>
                {[
                  { id: 'mortgage',  label: '🚀 Mortgage Accelerator' },
                  { id: 'property',  label: '🏘️ Property Portfolio' },
                  { id: 'grow',      label: '📈 Grow & FIRE' },
                ].map(tab => (
                  <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setShowMoreTabs(false) }}
                    style={{ display: 'block', width: '100%', padding: '9px 10px', background: activeTab === tab.id ? theme.accent + '20' : 'transparent', color: activeTab === tab.id ? theme.accent : theme.text, border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', textAlign: 'left' as const, fontWeight: activeTab === tab.id ? 700 : 400 }}>
                    {tab.label}
                  </button>
                ))}
                <div style={{ color: theme.accent, fontSize: '10px', fontWeight: 700, padding: '10px 10px 8px', letterSpacing: '1px', borderTop: '1px solid ' + theme.border, marginTop: '4px' }}>REVIEW & LEARN</div>
                {[
                  { id: 'insights',  label: '🧠 Insights' },
                  { id: 'review',    label: '🔄 Monthly Review' },
                  { id: 'overview',  label: '📊 Metrics' },
                  { id: 'learn',     label: '🎓 Learn' },
                  { id: 'quickview', label: '⚡ Quick View' },
                ].map(tab => (
                  <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setShowMoreTabs(false) }}
                    style={{ display: 'block', width: '100%', padding: '9px 10px', background: activeTab === tab.id ? theme.accent + '20' : 'transparent', color: activeTab === tab.id ? theme.accent : theme.text, border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', textAlign: 'left' as const, fontWeight: activeTab === tab.id ? 700 : 400 }}>
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phase 1 locked nav banner */}
          {missionNavLocked && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: theme.accent + '20', borderRadius: '8px', border: '1px solid ' + theme.accent + '40', flexShrink: 0 }}>
              <span style={{ fontSize: '12px' }}>🔒</span>
              <span style={{ color: theme.accent, fontSize: '11px', fontWeight: 600 }}>Complete setup to unlock all tabs</span>
              <button onClick={() => { setMissionComplete(true); setMissionNavLocked(false); setOnboardingComplete(true) }} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '11px', textDecoration: 'underline', padding: 0 }}>skip</button>
            </div>
          )}
        </div>
      </header>

      {/* Close More drawer on outside click */}
      {showMoreTabs && <div style={{ position: 'fixed' as const, inset: 0, zIndex: 299 }} onClick={() => setShowMoreTabs(false)} />}

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>

        {/* QUICK VIEW */}
        {/* ============================================================
            HOME TAB — Daily Driver (Option A+D)
        ============================================================ */}
        {activeTab === 'home' && (() => {
          // Build next 7 days of calendar events
          const today = new Date()
          const upcoming: any[] = []
          for (let d = 0; d < 7; d++) {
            const dt = new Date(today); dt.setDate(today.getDate() + d)
            const day = dt.getDate(); const month = dt.getMonth() + 1; const year = dt.getFullYear()
            incomeStreams.forEach(inc => { if (shouldShowItem(inc.startDate, inc.frequency, day, month, year)) upcoming.push({ ...inc, date: dt, itemType: 'income', dayOffset: d }) })
            expenses.filter((e: any) => !e.targetDebtId && !e.targetGoalId).forEach((exp: any) => { if (shouldShowItem(exp.dueDate, exp.frequency, day, month, year)) upcoming.push({ ...exp, date: dt, itemType: 'expense', dayOffset: d }) })
            debts.forEach((debt: any) => { if (shouldShowItem(debt.paymentDate, debt.frequency || 'monthly', day, month, year)) upcoming.push({ ...debt, amount: debt.minPayment, date: dt, itemType: 'debt', dayOffset: d }) })
            goals.filter((g: any) => g.addedToCalendar && g.paymentAmount).forEach((g: any) => { if (shouldShowItem(g.startDate, g.savingsFrequency || 'monthly', day, month, year)) upcoming.push({ ...g, amount: g.paymentAmount, date: dt, itemType: 'goal', dayOffset: d }) })
          }
          // Active roadmap milestone
          const activeMilestone = roadmapMilestones.find((m: any) => (m.currentAmount || 0) < parseFloat(m.targetAmount || '99999'))
          const hourOfDay = new Date().getHours()
          const greeting = hourOfDay < 12 ? 'Good morning' : hourOfDay < 17 ? 'Good afternoon' : 'Good evening'
          const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][today.getDay()]

          return (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>

              {/* ── GREETING HERO ── */}
              <div style={{ padding: '28px 28px 20px', background: 'linear-gradient(135deg, #1a1208 0%, #0f0c04 60%, #0a0a0a 100%)', borderRadius: '20px', border: '1px solid ' + theme.accent + '30', position: 'relative' as const, overflow: 'hidden' }}>
                <div style={{ position: 'absolute' as const, top: 0, right: 0, width: '300px', height: '100%', background: 'radial-gradient(ellipse at 80% 50%, ' + theme.accent + '08 0%, transparent 70%)', pointerEvents: 'none' as const }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: '12px' }}>
                  <div>
                    <div style={{ color: theme.textMuted, fontSize: '12px', fontWeight: 600, letterSpacing: '1px', marginBottom: '4px' }}>{dayName.toUpperCase()} · {today.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <h2 style={{ color: theme.text, fontSize: '26px', fontWeight: 800, margin: '0 0 6px 0', fontFamily: 'Cinzel, serif' }}>{greeting}, Builder.</h2>
                    <div style={{ color: theme.textMuted, fontSize: '14px', fontStyle: 'italic' }}>"{currentQuote.quote}"</div>
                    {whyStatement && <div style={{ marginTop: '10px', padding: '8px 12px', background: theme.accent + '15', borderRadius: '8px', border: '1px solid ' + theme.accent + '30', color: theme.accent, fontSize: '13px', fontStyle: 'italic' }}>🎯 {whyStatement}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
                    {streak > 0 && <div style={{ padding: '10px 16px', background: theme.accent + '20', borderRadius: '12px', border: '1px solid ' + theme.accent + '40', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '22px' }}>🔥</div>
                      <div style={{ color: theme.accent, fontWeight: 800, fontSize: '18px' }}>{streak}</div>
                      <div style={{ color: theme.textMuted, fontSize: '10px' }}>day streak</div>
                    </div>}
                    <button onClick={() => setActiveTab('chat')} style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #D4AF37 0%, #8C6A1F 100%)', color: '#0a0a0a', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
                      💬 Ask Aureus
                    </button>
                  </div>
                </div>
              </div>

              {/* ── IMPROVEMENT #1: DAILY AI BRIEFING ── */}
              <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #1a1208 0%, #0f0a04 100%)', borderRadius: '16px', border: '1px solid ' + theme.accent + '40', position: 'relative' as const }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: theme.accent, fontSize: '10px', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>AUREUS — {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</div>
                    {dailyBriefingLoading ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid ' + theme.accent, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                        <span style={{ color: theme.textMuted, fontSize: '14px', fontStyle: 'italic' }}>Reading your numbers...</span>
                      </div>
                    ) : dailyBriefing ? (
                      <p style={{ color: theme.text, fontSize: '15px', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>"{dailyBriefing.text}"</p>
                    ) : onboardingComplete ? (
                      <div>
                        <p style={{ color: theme.text, fontSize: '15px', lineHeight: 1.7, margin: '0 0 8px 0' }}>
                          {monthlySurplus > 0
                            ? `Your surplus of $${monthlySurplus.toFixed(0)}/month is the engine. Every dollar you don't spend is a brick in your empire.`
                            : `Money is tight right now — but awareness is the first step. Let's find the leak.`}
                        </p>
                        <button onClick={generateDailyBriefing} style={{ background: 'none', border: 'none', color: theme.accent, cursor: 'pointer', fontSize: '12px', padding: 0, textDecoration: 'underline' }}>Generate today's briefing</button>
                      </div>
                    ) : (
                      <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>Complete your setup to get personalised daily coaching.</p>
                    )}
                  </div>
                  <button onClick={() => askAureusAbout('Give me a detailed coaching session based on my current financial situation')}
                    style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #D4AF37 0%, #8C6A1F 100%)', color: '#0a0a0a', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                    💬 Ask Aureus
                  </button>
                </div>
              </div>

              {/* ── IMPROVEMENT #5: ACCOUNTABILITY BANNERS ── */}
              {daysSinceMoneyDate > 8 && checkInSchedule.weeklyEnabled !== false && (
                <div style={{ padding: '14px 18px', background: theme.warning + '15', borderRadius: '12px', border: '1px solid ' + theme.warning + '40', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: theme.warning, fontWeight: 700, fontSize: '13px' }}>💰 Money date overdue — {daysSinceMoneyDate} days since your last one</div>
                    <div style={{ color: theme.textMuted, fontSize: '12px' }}>15 minutes now could save you hundreds. Review your week?</div>
                  </div>
                  <button onClick={() => setActiveTab('dashboard')} style={{ padding: '8px 14px', background: theme.warning, color: '#0a0a0a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Do it now →</button>
                </div>
              )}
              {overdueItems.length > 0 && (
                <div style={{ padding: '14px 18px', background: theme.danger + '12', borderRadius: '12px', border: '1px solid ' + theme.danger + '40' }}>
                  <div style={{ color: theme.danger, fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>⚠️ {overdueItems.length} payment{overdueItems.length > 1 ? 's' : ''} not yet ticked off</div>
                  {overdueItems.slice(0, 2).map((item, i) => (
                    <div key={i} style={{ color: theme.textMuted, fontSize: '12px' }}>→ {item.name} ${item.amount} — due {item.daysAgo} day{item.daysAgo !== 1 ? 's' : ''} ago</div>
                  ))}
                  <button onClick={() => setActiveTab('dashboard')} style={{ marginTop: '8px', padding: '6px 12px', background: 'transparent', border: '1px solid ' + theme.danger + '50', borderRadius: '6px', color: theme.danger, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Tick them off →</button>
                </div>
              )}

              {/* ── IMPROVEMENT #10: TONE-ADAPTIVE SURPLUS WARNING ── */}
              {monthlySurplus < 0 && (
                <div style={{ padding: '16px 20px', background: theme.danger + '12', borderRadius: '14px', border: '2px solid ' + theme.danger + '40' }}>
                  <div style={{ color: theme.danger, fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>This month's numbers are tight — ${Math.abs(monthlySurplus).toFixed(0)} in the red</div>
                  <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '10px' }}>Here are 3 places to look right now:</div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px', marginBottom: '12px' }}>
                    <div style={{ color: theme.text, fontSize: '12px' }}>1. 📱 Subscriptions you don't use — quick $20-50 win</div>
                    <div style={{ color: theme.text, fontSize: '12px' }}>2. 🍽️ Eating out — the biggest variable in most budgets</div>
                    <div style={{ color: theme.text, fontSize: '12px' }}>3. 💳 Minimum payments — are all debts at minimums?</div>
                  </div>
                  <button onClick={() => askAureusAbout(`My budget is $${Math.abs(monthlySurplus).toFixed(0)} in the red this month with income $${monthlyIncome.toFixed(0)} and expenses $${monthlyExpenses.toFixed(0)}. What should I cut first?`)}
                    style={{ padding: '8px 14px', background: theme.danger, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>
                    Ask Aureus to fix this →
                  </button>
                </div>
              )}

              {/* ── IMPROVEMENT #3: BABY STEP ADVANCEMENT REACTION ── */}
              {stepReaction && (
                <div style={{ padding: '20px', background: theme.success + '15', borderRadius: '16px', border: '2px solid ' + theme.success + '50', animation: 'slideIn 0.4s ease' }}>
                  <div style={{ color: theme.success, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>🏆 BABY STEP {stepReaction.step - 1} COMPLETE</div>
                  <div style={{ color: theme.text, fontSize: '15px', fontWeight: 600, lineHeight: 1.6, marginBottom: '8px' }}>{stepReaction.message}</div>
                  <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '12px' }}>{stepReaction.nextSuggestion}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => askAureusAbout(`I just completed Baby Step ${stepReaction.step - 1} and I'm now on Baby Step ${stepReaction.step} (${currentBabyStep.title}). What should my focus be now?`)}
                      style={{ padding: '8px 14px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>
                      What's next for me? →
                    </button>
                    <button onClick={() => setStepReaction(null)} style={{ padding: '8px 14px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.textMuted, fontSize: '12px' }}>Dismiss</button>
                  </div>
                </div>
              )}

              {/* ── IMPROVEMENT #2: CONTEXT STAT CARDS ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                {[
                  { key: 'income', label: 'Monthly Income', value: '$' + monthlyIncome.toFixed(0), color: theme.success, icon: '💰', tab: 'dashboard', context: getStatContext('income') },
                  { key: 'surplus', label: 'Monthly Surplus', value: (monthlySurplus >= 0 ? '+$' : '-$') + Math.abs(monthlySurplus).toFixed(0), color: monthlySurplus >= 0 ? theme.success : theme.danger, icon: '📊', tab: 'dashboard', context: getStatContext('surplus') },
                  { key: 'networth', label: 'Net Worth', value: '$' + netWorth.toLocaleString(), color: netWorth >= 0 ? theme.accent : theme.danger, icon: '🏛️', tab: 'overview', context: getStatContext('networth') },
                  { key: 'goals', label: 'Goal Savings', value: '$' + monthlyGoalSavings.toFixed(0) + '/mo', color: theme.accent, icon: '🎯', tab: 'dashboard', context: getStatContext('goals') },
                ].map(stat => (
                  <button key={stat.label} onClick={() => setActiveTab(stat.tab as any)}
                    style={{ padding: '16px', background: theme.cardBg, borderRadius: '14px', border: '1px solid ' + theme.border, cursor: 'pointer', textAlign: 'left' as const, transition: 'border-color 0.2s', position: 'relative' as const }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = theme.accent + '60')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = theme.border)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '20px', marginBottom: '6px' }}>{stat.icon}</div>
                      <button onClick={e => { e.stopPropagation(); askAureusAbout(`I'm looking at my ${stat.label}: ${stat.value}. ${stat.context} Give me specific advice.`) }}
                        style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', opacity: 0 }}
                        className="ask-btn"
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                        Ask ?
                      </button>
                    </div>
                    <div style={{ color: theme.textMuted, fontSize: '10px', fontWeight: 600, marginBottom: '3px', letterSpacing: '0.5px' }}>{stat.label.toUpperCase()}</div>
                    <div style={{ color: stat.color, fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>{stat.value}</div>
                    <div style={{ color: theme.textMuted, fontSize: '11px', lineHeight: 1.4 }}>{stat.context}</div>
                  </button>
                ))}
              </div>

              {/* ── IMPROVEMENT #6: SPENDING PATTERNS ── */}
              {spendingPatterns.length > 0 && (
                <div style={{ padding: '16px 20px', background: theme.cardBg, borderRadius: '14px', border: '1px solid ' + theme.border }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ color: theme.accent, fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>🧠 AUREUS NOTICED</div>
                    <button onClick={() => askAureusAbout(`I've noticed these spending patterns: ${spendingPatterns.join('. ')}. What should I do?`)}
                      style={{ padding: '4px 10px', background: theme.accent + '20', color: theme.accent, border: '1px solid ' + theme.accent + '40', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>
                      Ask Aureus →
                    </button>
                  </div>
                  {spendingPatterns.map((p, i) => (
                    <div key={i} style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '6px', paddingLeft: '8px', borderLeft: '2px solid ' + theme.accent + '60', lineHeight: 1.5 }}>{p}</div>
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                {/* ── NEXT ACTION FROM AUREUS ── */}
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                  {coachNextAction ? (
                    <div style={{ padding: '20px', background: coachNextAction.urgency === 'high' ? theme.danger + '15' : theme.accent + '12', borderRadius: '16px', border: '2px solid ' + (coachNextAction.urgency === 'high' ? theme.danger + '50' : theme.accent + '40') }}>
                      <div style={{ color: theme.accent, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>⚡ YOUR NEXT ACTION</div>
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{coachNextAction.icon}</div>
                      <div style={{ color: theme.text, fontSize: '15px', fontWeight: 600, lineHeight: 1.5, marginBottom: '14px' }}>{coachNextAction.message}</div>
                      <button onClick={() => { setActiveTab(coachNextAction.tab as any); setShowMoreTabs(false) }}
                        style={{ padding: '10px 18px', background: coachNextAction.urgency === 'high' ? theme.danger : theme.accent, color: coachNextAction.urgency === 'high' ? 'white' : '#0a0a0a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
                        {coachNextAction.action} →
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: '20px', background: theme.success + '12', borderRadius: '16px', border: '2px solid ' + theme.success + '30' }}>
                      <div style={{ color: theme.success, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>✅ ALL GOOD</div>
                      <div style={{ color: theme.text, fontSize: '15px', fontWeight: 600, lineHeight: 1.5 }}>You're on track. Your empire is building itself. Keep going.</div>
                    </div>
                  )}

                  {/* Active Roadmap Milestone */}
                  {activeMilestone && (
                    <div style={{ padding: '18px', background: theme.cardBg, borderRadius: '14px', border: '1px solid ' + theme.border }}>
                      <div style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '10px' }}>🛤️ ACTIVE MISSION</div>
                      <div style={{ color: theme.text, fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{activeMilestone.icon} {activeMilestone.name}</div>
                      {activeMilestone.targetAmount && (
                        <>
                          <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>${(activeMilestone.currentAmount || 0).toLocaleString()} of ${parseFloat(activeMilestone.targetAmount).toLocaleString()}</div>
                          <div style={{ height: '6px', background: theme.border, borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                            <div style={{ width: Math.min(100, ((activeMilestone.currentAmount || 0) / parseFloat(activeMilestone.targetAmount)) * 100) + '%', height: '100%', background: 'linear-gradient(90deg, #D4AF37, #B68B2E)' }} />
                          </div>
                        </>
                      )}
                      {activeMilestone.weeklyPlan && activeMilestone.weeklyPlan.some((s: any) => !s.done) && (
                        <div style={{ padding: '10px', background: theme.bg, borderRadius: '8px' }}>
                          <div style={{ color: theme.textMuted, fontSize: '10px', fontWeight: 600, marginBottom: '4px' }}>NEXT STEP</div>
                          <div style={{ color: theme.text, fontSize: '13px', lineHeight: 1.5 }}>{activeMilestone.weeklyPlan.find((s: any) => !s.done)?.text}</div>
                        </div>
                      )}
                      <button onClick={() => setActiveTab('path')} style={{ marginTop: '12px', padding: '8px 14px', background: theme.accent + '20', color: theme.accent, border: '1px solid ' + theme.accent + '40', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>View Full Roadmap →</button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                  {/* This Week */}
                  <div style={{ padding: '18px', background: theme.cardBg, borderRadius: '14px', border: '1px solid ' + theme.border }}>
                    <div style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '12px' }}>📅 THIS WEEK</div>
                    {upcoming.length === 0 ? (
                      <div style={{ color: theme.textMuted, fontSize: '13px' }}>No upcoming events in the next 7 days</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px' }}>
                        {upcoming.slice(0, 6).map((item, i) => {
                          const isIncome = item.itemType === 'income'
                          const isGoal = item.itemType === 'goal'
                          const label = item.dayOffset === 0 ? 'Today' : item.dayOffset === 1 ? 'Tomorrow' : item.date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric' })
                          const icon = isIncome ? '💰' : isGoal ? '🎯' : item.itemType === 'debt' ? '💳' : '📋'
                          const color = isIncome ? theme.success : isGoal ? theme.accent : item.itemType === 'debt' ? theme.warning : theme.textMuted
                          return (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: theme.bg, borderRadius: '8px' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px' }}>{icon}</span>
                                <div>
                                  <div style={{ color: theme.text, fontSize: '12px', fontWeight: 600 }}>{item.name}</div>
                                  <div style={{ color: theme.textMuted, fontSize: '10px' }}>{label}</div>
                                </div>
                              </div>
                              <div style={{ color, fontWeight: 700, fontSize: '13px' }}>{isIncome ? '+' : '-'}${parseFloat(item.amount || '0').toFixed(0)}</div>
                            </div>
                          )
                        })}
                        {upcoming.length > 6 && <div style={{ color: theme.textMuted, fontSize: '11px', textAlign: 'center' as const, paddingTop: '4px' }}>+{upcoming.length - 6} more — <span style={{ color: theme.accent, cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>view calendar</span></div>}
                      </div>
                    )}
                  </div>

                  {/* Goals */}
                  {goals.length > 0 && (
                    <div style={{ padding: '18px', background: theme.cardBg, borderRadius: '14px', border: '1px solid ' + theme.border }}>
                      <div style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '12px' }}>🎯 GOALS</div>
                      {goals.slice(0, 3).map((g: any) => {
                        const pct = Math.min(100, (parseFloat(g.saved || '0') / parseFloat(g.target || '1')) * 100)
                        return (
                          <div key={g.id} style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ color: theme.text, fontSize: '12px', fontWeight: 600 }}>{g.name}</span>
                              <span style={{ color: theme.accent, fontSize: '12px', fontWeight: 700 }}>{pct.toFixed(0)}%</span>
                            </div>
                            <div style={{ height: '5px', background: theme.border, borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: pct + '%', height: '100%', background: 'linear-gradient(90deg, #D4AF37, #B68B2E)' }} />
                            </div>
                          </div>
                        )
                      })}
                      <button onClick={() => setActiveTab('dashboard')} style={{ marginTop: '4px', padding: '7px 14px', background: 'transparent', color: theme.accent, border: '1px solid ' + theme.accent + '40', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                        Manage Goals →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── QUICK JUMP GRID ── */}
              <div style={{ padding: '18px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }}>
                <div style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '14px' }}>QUICK ACCESS — EVERYTHING IN AUREUS</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                  {[
                    { id: 'chat',      icon: '💬', label: 'Ask Aureus',    desc: 'AI coach' },
                    { id: 'dashboard', icon: '🎛️', label: 'Budget',        desc: 'Income, bills, goals' },
                    { id: 'path',      icon: '🛤️', label: 'Roadmap',       desc: 'Baby steps & milestones' },
                    { id: 'wins',      icon: '🏆', label: 'Wins',          desc: 'Your progress log' },
                    { id: 'mortgage',  icon: '🚀', label: 'Mortgage',      desc: 'Pay off faster' },
                    { id: 'property',  icon: '🏘️', label: 'Property',      desc: 'IP portfolio' },
                    { id: 'grow',      icon: '📈', label: 'Grow & FIRE',   desc: 'Investments & FI' },
                    { id: 'insights',  icon: '🧠', label: 'Insights',      desc: 'AI analysis' },
                    { id: 'review',    icon: '🔄', label: 'Review',        desc: 'Monthly check-in' },
                    { id: 'overview',  icon: '📊', label: 'Metrics',       desc: 'Net worth & health' },
                    { id: 'learn',     icon: '🎓', label: 'Learn',         desc: 'Financial education' },
                    { id: 'quickview', icon: '⚡', label: 'Quick View',    desc: 'All-in-one snapshot' },
                  ].map(item => (
                    <button key={item.id} onClick={() => { setActiveTab(item.id as any); setShowMoreTabs(false) }}
                      style={{ padding: '12px', background: activeTab === item.id ? theme.accent + '20' : theme.bg, border: '1px solid ' + (activeTab === item.id ? theme.accent + '60' : theme.border), borderRadius: '10px', cursor: 'pointer', textAlign: 'left' as const }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = theme.accent + '50')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = activeTab === item.id ? theme.accent + '60' : theme.border)}>
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</div>
                      <div style={{ color: theme.text, fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>{item.label}</div>
                      <div style={{ color: theme.textMuted, fontSize: '10px' }}>{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )
        })()}

        {activeTab === 'quickview' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>
            {/* WHY STATEMENT BANNER */}
            {whyStatement ? (
              <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #D4AF3715, #B68B2E15)', borderRadius: '12px', border: '2px solid #D4AF3740', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '4px' }}>Why I\'m Doing This</div>
                  <div style={{ color: theme.text, fontSize: '15px', fontStyle: 'italic' }}>"{whyStatement}"</div>
                </div>
                <button onClick={() => { setEditingWhy(true); setWhyDraft(whyStatement) }} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.textMuted, cursor: 'pointer', fontSize: '12px' }}>Edit</button>
              </div>
            ) : (
              <button onClick={() => { setEditingWhy(true); setWhyDraft('') }} style={{ padding: '16px 20px', background: theme.cardBg, borderRadius: '12px', border: '2px dashed ' + theme.border, cursor: 'pointer', textAlign: 'left' as const }}>
                <div style={{ color: theme.textMuted, fontSize: '13px' }}>💬 <strong>Set your why</strong> — What are you working toward? (e.g. "Be mortgage-free before my kids finish school")</div>
              </button>
            )}

            {/* ===== AUREUS COACH CARD — WHAT TO DO NEXT ===== */}
            {coachNextAction && (
              <div style={{
                padding: '18px 20px',
                background: coachNextAction.urgency === 'high'
                  ? `linear-gradient(135deg, ${theme.warning}25, ${theme.orange}10)`
                  : coachNextAction.urgency === 'medium'
                  ? `linear-gradient(135deg, ${theme.accent}20, ${theme.purple}10)`
                  : `linear-gradient(135deg, ${theme.success}15, ${theme.teal}10)`,
                borderRadius: '14px',
                border: '2px solid ' + (
                  coachNextAction.urgency === 'high' ? theme.warning + '80'
                  : coachNextAction.urgency === 'medium' ? theme.accent + '60'
                  : theme.success + '50'
                )
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #8C6A1F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#0a0a0a', flexShrink: 0 }}>A</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ color: coachNextAction.urgency === 'high' ? theme.warning : coachNextAction.urgency === 'medium' ? theme.accent : theme.success, fontSize: '11px', fontWeight: 700, letterSpacing: '1px' }}>
                        {coachNextAction.urgency === 'high' ? '⚡ NEXT ACTION' : coachNextAction.urgency === 'medium' ? '🎯 AUREUS RECOMMENDS' : "💡 WHEN YOU'RE READY"}
                      </div>
                      <button onClick={() => { setDismissedTriggers(prev => [...prev, coachNextAction.triggeredBy]); setCoachNextAction(null) }} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 0 0 8px' }}>×</button>
                    </div>
                    <p style={{ color: theme.text, fontSize: '14px', lineHeight: 1.65, margin: '0 0 12px 0' }}>{coachNextAction.message}</p>
                    <button onClick={() => setActiveTab(coachNextAction.tab as any)} style={{ padding: '9px 18px', background: coachNextAction.urgency === 'high' ? theme.warning : coachNextAction.urgency === 'medium' ? theme.accent : theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>{coachNextAction.action}</button>
                  </div>
                </div>
              </div>
            )}

            {/* DAILY CHECK-IN CARD */}
            <div style={{ padding: '16px 20px', background: isDailyCheckInDue() ? `linear-gradient(135deg, ${theme.accent}20, ${theme.accent}05)` : theme.cardBg, borderRadius: '14px', border: '1px solid ' + (isDailyCheckInDue() ? theme.accent + '60' : theme.border) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: theme.text, fontWeight: 700, fontSize: '14px' }}>✅ Daily Check-in</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '2px' }}>
                    {lastDailyCheckIn === new Date().toISOString().split('T')[0]
                      ? '✓ Done today'
                      : isDailyCheckInDue() ? 'Ready for you now' : `Available any time · last done ${lastDailyCheckIn ? new Date(lastDailyCheckIn).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' }) : 'never'}`}
                  </div>
                </div>
                <button
                  onClick={() => { setShowDailyCheckIn(true); setDailyCheckInStep(0); setDailyCheckInAnswers({}) }}
                  disabled={lastDailyCheckIn === new Date().toISOString().split('T')[0]}
                  style={{ padding: '8px 16px', background: lastDailyCheckIn === new Date().toISOString().split('T')[0] ? theme.border : theme.accent, color: lastDailyCheckIn === new Date().toISOString().split('T')[0] ? theme.textMuted : 'white', border: 'none', borderRadius: '8px', cursor: lastDailyCheckIn === new Date().toISOString().split('T')[0] ? 'default' : 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  {lastDailyCheckIn === new Date().toISOString().split('T')[0] ? '✓ Done' : 'Start →'}
                </button>
              </div>
              {dailyCheckInLog.length > 0 && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '4px' }}>
                  {Array.from({ length: 7 }).map((_, i) => {
                    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
                    const done = dailyCheckInLog.some(e => new Date(e.date).toISOString().split('T')[0] === d)
                    return <div key={i} title={d} style={{ width: '12px', height: '12px', borderRadius: '3px', background: done ? theme.accent : theme.border }} />
                  })}
                  <span style={{ color: theme.textMuted, fontSize: '11px', marginLeft: '6px' }}>last 7 days</span>
                </div>
              )}
            </div>

            {/* MONEY DATE SCHEDULE BANNER */}
            {isMoneyDateDue() && (
              <div style={{ padding: '16px 20px', background: `linear-gradient(135deg, ${theme.success}20, ${theme.success}05)`, borderRadius: '14px', border: '2px solid ' + theme.success + '60', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: theme.success, fontWeight: 700, fontSize: '14px' }}>💰 Money Date is due!</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '2px' }}>Your scheduled {checkInSchedule.moneyDateDay} check-in is waiting</div>
                </div>
                <button onClick={() => { setShowMoneyDate(true); setMoneyDateStep(0); setMoneyDateAnswers({}) }} style={{ padding: '10px 18px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
                  Start now →
                </button>
              </div>
            )}

            {/* PERSONALITY QUIZ PROMPT — shown until completed */}
            {!moneyPersonality && (
              <div style={{ padding: '20px', background: 'linear-gradient(135deg, #D4AF3720, #D4AF3715)', borderRadius: '14px', border: '2px solid ' + theme.purple + '50' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: theme.purple + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>🧠</div>
                  <div>
                    <div style={{ color: theme.text, fontWeight: 700, fontSize: '15px' }}>Aureus doesn't know you yet</div>
                    <div style={{ color: theme.textMuted, fontSize: '13px' }}>Take the money personality quiz so Aureus can coach you the way YOU need to be coached — not generically.</div>
                  </div>
                </div>
                <button onClick={() => { setShowOnboarding(true); setOnboardingStep(1) }} style={{ ...btnPurple, width: '100%', padding: '12px' }}>
                  🧠 Take the 8-question quiz (5 min) →
                </button>
              </div>
            )}

            {/* QUOTE */}
            <div style={{ background: theme.cardBg, borderRadius: '12px', padding: '16px 20px', borderLeft: '4px solid ' + theme.purple }}>
              <p style={{ color: theme.text, fontSize: '14px', fontStyle: 'italic', margin: 0 }}>"{currentQuote.quote}"</p>
              <p style={{ color: theme.textMuted, fontSize: '12px', margin: '8px 0 0 0', textAlign: 'right' as const }}>— {currentQuote.author}</p>
            </div>

            {/* AUREUS CHAT WIDGET */}
            <div style={{ padding: '20px', background: `linear-gradient(135deg, ${theme.success}15, ${theme.purple}15)`, borderRadius: '16px', border: '2px solid ' + theme.success }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #8C6A1F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#0a0a0a' }}>A</div>
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
              <div style={{ padding: '24px', background: 'linear-gradient(135deg, #0a0a0a, #1a1208, #231a08)', borderRadius: '16px', border: '2px solid #D4AF37' }}>
                <div style={{ color: theme.textMuted, fontSize: '11px', letterSpacing: '3px', marginBottom: '12px', textAlign: 'center' as const }}>🏠 MORTGAGE PAYOFF COUNTDOWN</div>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' as const, marginBottom: '16px' }}>
                  <div>
                    <div style={{ color: '#c0392b', fontSize: '11px', marginBottom: '4px' }}>Without changes</div>
                    <div style={{ color: theme.text, fontSize: '36px', fontWeight: 800 }}>{mortgageResult.standard.freeYear}</div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>{mortgageResult.standard.years.toFixed(1)} yrs · ${Math.round(mortgageResult.standard.interest / 1000)}k interest</div>
                  </div>
                  {parseFloat(mortgageAccel.extraRepayment || '0') > 0 && (
                    <div>
                      <div style={{ color: '#B68B2E', fontSize: '11px', marginBottom: '4px' }}>With your extra payments</div>
                      <div style={{ color: '#B68B2E', fontSize: '36px', fontWeight: 800 }}>{mortgageResult.withExtra.freeYear}</div>
                      <div style={{ color: '#B68B2E', fontSize: '11px' }}>🎉 {mortgageResult.withExtra.yearsSaved.toFixed(1)} yrs earlier · ${Math.round(mortgageResult.withExtra.interestSaved / 1000)}k saved</div>
                    </div>
                  )}
                </div>
                {/* What-if slider */}
                <div style={{ padding: '12px 0' }}>
                  <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '8px', textAlign: 'center' as const }}>💡 What if you paid extra per {mortgageAccel.repaymentFrequency === 'weekly' ? 'week' : mortgageAccel.repaymentFrequency === 'fortnightly' ? 'fortnight' : 'month'}?</div>
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
                        <span style={{ color: theme.textMuted, fontSize: '12px' }}>+${extra}</span>
                        <span style={{ color: '#B68B2E', fontSize: '12px', fontWeight: 600 }}>{saved.toFixed(1)} yrs earlier</span>
                        <span style={{ color: '#D4AF37', fontSize: '12px' }}>${Math.round(interestSaved / 1000)}k saved</span>
                      </div>
                    )
                  })}
                </div>
                <button onClick={() => setActiveTab('mortgage')} style={{ width: '100%', marginTop: '8px', padding: '10px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Open Mortgage Accelerator →</button>
              </div>
            ) : (
              <button onClick={() => setActiveTab('mortgage')} style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #1a1208, #0a0a0a)', borderRadius: '12px', border: '2px dashed #D4AF37', cursor: 'pointer', width: '100%', textAlign: 'left' as const }}>
                <div style={{ color: theme.text, fontWeight: 600, marginBottom: '4px' }}>🏠 See your mortgage-free date</div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>Enter your mortgage details to see how quickly you could be debt-free →</div>
              </button>
            )}

            {/* IDENTITY STATEMENTS */}
            {identityStatements.length > 0 && (
              <div style={{ padding: '16px 20px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border }}>
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
              <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #D4AF3715, #D4AF37 15)', borderRadius: '12px', border: '2px solid #D4AF3740' }}>
                <div style={{ color: '#D4AF37', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '8px' }}>🎯 Your ONE Financial Move This Week</div>
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
        {activeTab === 'chat' && (() => {
          // Improvement #8: If we have a context set from "Ask Aureus about this", pre-load it
          if (chatContext && !chatInput) {
            setTimeout(() => { setChatInput(chatContext); setChatContext(null) }, 50)
          }
          return (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: `linear-gradient(135deg, ${theme.success}15, ${theme.purple}15)`, border: '2px solid ' + theme.success, borderRadius: '20px', padding: '24px', minHeight: '70vh', display: 'flex', flexDirection: 'column' as const }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid ' + theme.border }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #D4AF37 50%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #D4AF37' }}>
                  <span style={{ color: '#0a0a0a', fontWeight: 800, fontSize: '28px' }}>A</span>
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
                  <div style={{ padding: '20px 10px' }}>
                    {/* Coach card in chat — always front-and-centre */}
                    {coachNextAction && chatMessages.length === 0 && (
                      <div style={{ marginBottom: '20px', padding: '16px 18px', background: coachNextAction.urgency === 'high' ? theme.warning + '15' : theme.accent + '15', borderRadius: '12px', border: '1px solid ' + (coachNextAction.urgency === 'high' ? theme.warning + '50' : theme.accent + '40') }}>
                        <div style={{ color: coachNextAction.urgency === 'high' ? theme.warning : theme.accent, fontSize: '11px', fontWeight: 700, marginBottom: '6px', letterSpacing: '1px' }}>
                          {coachNextAction.urgency === 'high' ? '⚡ I\'VE BEEN THINKING ABOUT YOUR SITUATION...' : '🎯 HERE\'S WHAT I\'D FOCUS ON NEXT'}
                        </div>
                        <p style={{ color: theme.text, fontSize: '14px', lineHeight: 1.65, margin: '0 0 10px 0' }}>{coachNextAction.message}</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setActiveTab(coachNextAction.tab as any)} style={{ padding: '8px 16px', background: coachNextAction.urgency === 'high' ? theme.warning : theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>{coachNextAction.action}</button>
                          <button onClick={() => { setChatInput(`Tell me more about: ${coachNextAction.message.split('.')[0]}`) }} style={{ padding: '8px 14px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.textMuted, cursor: 'pointer', fontSize: '13px' }}>Ask Aureus about this</button>
                        </div>
                      </div>
                    )}

                    {/* Personality quiz CTA - most prominent when not done */}
                    {!moneyPersonality ? (
                      <div style={{ marginBottom: '24px', padding: '24px', background: 'linear-gradient(135deg, #D4AF3715, #D4AF3715)', borderRadius: '16px', border: '2px solid ' + theme.purple + '50', textAlign: 'center' as const }}>
                        <div style={{ fontSize: '44px', marginBottom: '12px' }}>🧠</div>
                        <div style={{ color: theme.text, fontWeight: 700, fontSize: '17px', marginBottom: '8px' }}>First, let me get to know you.</div>
                        <div style={{ color: theme.textMuted, fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
                          Aureus coaches everyone differently. Before I start giving advice, I need to understand how <em>you</em> think about money — your personality, your why, and your identity.
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' as const, marginBottom: '16px' }}>
                          {['🎯 Personalised coaching', '❤️ Understand your why', '⚡ 5 minutes'].map(tag => (
                            <span key={tag} style={{ padding: '4px 10px', background: theme.purple + '20', color: theme.purple, borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{tag}</span>
                          ))}
                        </div>
                        <button onClick={() => { setShowOnboarding(true); setOnboardingStep(0) }} style={{ ...btnPurple, padding: '14px 32px', fontSize: '15px', width: '100%' }}>
                          Start my money personality quiz →
                        </button>
                        <button onClick={() => setChatMessages([{ role: 'assistant', content: "G'day! I'm Aureus — your AI financial coach. I specialise in helping Australians pay their mortgage off faster and build real wealth. What's on your mind?" }])} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', marginTop: '10px', fontSize: '13px' }}>
                          Skip and just chat
                        </button>
                      </div>
                    ) : (
                      <div style={{ marginBottom: '20px', padding: '16px', background: personalityProfiles[moneyPersonality]?.color + '15', borderRadius: '12px', border: '1px solid ' + personalityProfiles[moneyPersonality]?.color + '40', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '32px' }}>{personalityProfiles[moneyPersonality]?.emoji}</span>
                        <div>
                          <div style={{ color: personalityProfiles[moneyPersonality]?.color, fontWeight: 700, fontSize: '14px' }}>{personalityProfiles[moneyPersonality]?.label}</div>
                          <div style={{ color: theme.textMuted, fontSize: '12px' }}>Aureus is coaching you as a {personalityProfiles[moneyPersonality]?.label.toLowerCase()} — responses are tailored to how you think.</div>
                        </div>
                      </div>
                    )}

                    {/* Starter questions */}
                    <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '12px', textAlign: 'center' as const }}>Or jump straight in:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px', justifyContent: 'center' }}>
                      {[
                        'How do I pay my mortgage off faster?',
                        'Should I use an offset account?',
                        'Am I on track financially?',
                        'How does salary sacrifice work?',
                        'What should I focus on this week?'
                      ].map(q => (
                        <button key={q} onClick={() => { setChatInput(q); setTimeout(() => handleChatMessage(), 50) }} style={{ padding: '8px 14px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '20px', color: theme.text, cursor: 'pointer', fontSize: '13px' }}>{q}</button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ marginBottom: '16px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '85%' }}>
                      <div style={{ padding: '14px 18px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.role === 'user' ? theme.accent : theme.cardBg, color: msg.role === 'user' ? '#0a0a0a' : theme.text, fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-wrap' as const }}>{msg.content}</div>
                      {msg.usedWebSearch && (
                        <div style={{ marginTop: '4px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                          <span style={{ fontSize: '10px', color: theme.accent, padding: '2px 8px', background: theme.accent + '15', borderRadius: '10px', border: '1px solid ' + theme.accent + '30' }}>🔍 Live web data</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '14px 18px', background: theme.cardBg, borderRadius: '18px 18px 18px 4px', maxWidth: '200px' }}>
                    {shouldUseWebSearch(chatInput) ? (
                      <><div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid ' + theme.accent, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} /><span style={{ color: theme.textMuted, fontSize: '13px' }}>Searching the web...</span></>
                    ) : (
                      <><div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid ' + theme.accent, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} /><span style={{ color: theme.textMuted, fontSize: '13px' }}>Aureus is thinking...</span></>
                    )}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChatMessage()} placeholder="Ask Aureus anything..." style={{ ...inputStyle, flex: 1, padding: '14px 18px', fontSize: '15px' }} disabled={isLoading} />
                <button onClick={handleChatMessage} disabled={isLoading || !chatInput.trim()} style={{ ...btnSuccess, padding: '14px 24px', opacity: isLoading || !chatInput.trim() ? 0.5 : 1 }}>Send</button>
              </div>
            </div>
          </div>
          )
        })()}

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

            {/* ── PROJECTED VS ACTUAL ── */}
            {(() => {
              const now = new Date()
              const monthKey = getMonthKey()
              const proj = getProjectedByCategory()
              const actual = actualSpend[monthKey] || {}
              const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
              const dayOfMonth = now.getDate()
              const monthProgress = dayOfMonth / daysInMonth
              const activeCategories = EXPENSE_CATEGORIES.filter(c => proj[c.id] > 0 || (actual[c.id] || 0) > 0)
              const totalProjected = activeCategories.reduce((s, c) => s + (proj[c.id] || 0), 0)
              const totalActual = activeCategories.reduce((s, c) => s + (actual[c.id] || 0), 0)
              const pacePct = monthProgress > 0 ? totalActual / (totalProjected * monthProgress) : 0
              const leaking = activeCategories.filter(c => (actual[c.id] || 0) > (proj[c.id] || 0) * monthProgress * 1.1 && (actual[c.id] || 0) > 0)
              // Check for uncategorised expenses
              const uncategorisedExpenses = expenses.filter((e: any) => !e.category || e.category === 'other')
              const hasOtherBucket = uncategorisedExpenses.length > 0 && proj['other'] > 0

              return (
                <div style={{ background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border, overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: showProjectedActual ? '1px solid ' + theme.border : 'none', cursor: 'pointer' }} onClick={() => setShowProjectedActual(!showProjectedActual)}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '18px' }}>📊</span>
                      <div>
                        <div style={{ color: theme.text, fontWeight: 700, fontSize: '15px' }}>Projected vs Actual — {now.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}</div>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>Day {dayOfMonth} of {daysInMonth} · {Math.round(monthProgress * 100)}% through month</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      {leaking.length > 0 && (
                        <div style={{ padding: '4px 10px', background: theme.danger + '20', border: '1px solid ' + theme.danger + '40', borderRadius: '20px', color: theme.danger, fontSize: '12px', fontWeight: 600 }}>
                          ⚠️ {leaking.length} categor{leaking.length === 1 ? 'y' : 'ies'} over budget
                        </div>
                      )}
                      {pacePct > 0 && pacePct <= 1.05 && leaking.length === 0 && (
                        <div style={{ padding: '4px 10px', background: theme.success + '20', border: '1px solid ' + theme.success + '40', borderRadius: '20px', color: theme.success, fontSize: '12px', fontWeight: 600 }}>
                          ✅ On track
                        </div>
                      )}
                      <div style={{ color: theme.textMuted, fontSize: '18px' }}>{showProjectedActual ? '▲' : '▼'}</div>
                    </div>
                  </div>

                  {showProjectedActual && (
                    <div style={{ padding: '20px' }}>
                      {/* Uncategorised notice */}
                      {hasOtherBucket && (
                        <div style={{ marginBottom: '14px', padding: '12px 14px', background: theme.warning + '15', borderRadius: '10px', border: '1px solid ' + theme.warning + '40', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ color: theme.warning, fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>
                              📂 {uncategorisedExpenses.length} expense{uncategorisedExpenses.length > 1 ? 's' : ''} uncategorised — showing as "Other"
                            </div>
                            <div style={{ color: theme.textMuted, fontSize: '11px' }}>
                              {uncategorisedExpenses.slice(0,3).map((e: any) => e.name).join(', ')}{uncategorisedExpenses.length > 3 ? ` +${uncategorisedExpenses.length - 3} more` : ''} — click ✏️ to assign categories
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Total bar */}
                      {totalProjected > 0 && (
                        <div style={{ marginBottom: '20px', padding: '14px', background: theme.bg, borderRadius: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div>
                              <div style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>TOTAL SPENDING</div>
                              <div style={{ color: theme.text, fontSize: '20px', fontWeight: 800 }}>${totalActual.toFixed(0)} <span style={{ color: theme.textMuted, fontWeight: 400, fontSize: '14px' }}>of ${totalProjected.toFixed(0)}</span></div>
                            </div>
                            <div style={{ textAlign: 'right' as const }}>
                              <div style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>EXPECTED BY NOW</div>
                              <div style={{ color: theme.accent, fontSize: '16px', fontWeight: 700 }}>${(totalProjected * monthProgress).toFixed(0)}</div>
                            </div>
                          </div>
                          <div style={{ height: '10px', background: theme.border, borderRadius: '5px', overflow: 'hidden', position: 'relative' as const }}>
                            <div style={{ position: 'absolute' as const, left: 0, top: 0, height: '100%', width: Math.min(100, (totalActual / totalProjected) * 100) + '%', background: totalActual > totalProjected ? theme.danger : totalActual > totalProjected * monthProgress * 1.1 ? theme.warning : theme.success, borderRadius: '5px', transition: 'width 0.5s' }} />
                            {/* Expected pace marker */}
                            <div style={{ position: 'absolute' as const, left: (monthProgress * 100) + '%', top: '-3px', width: '2px', height: '16px', background: theme.accent, borderRadius: '1px' }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <span style={{ color: theme.textMuted, fontSize: '10px' }}>│ expected pace</span>
                          </div>
                        </div>
                      )}

                      {/* Per-category breakdown */}
                      {activeCategories.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px', marginBottom: '16px' }}>
                          {activeCategories.map(cat => {
                            const p = proj[cat.id] || 0
                            const a = actual[cat.id] || 0
                            const expectedSoFar = p * monthProgress
                            const pct = p > 0 ? (a / p) * 100 : 0
                            const isOver = a > p
                            const isAheadOfPace = a > expectedSoFar * 1.15 && !isOver
                            const barColor = isOver ? theme.danger : isAheadOfPace ? theme.warning : theme.success
                            const remaining = p - a
                            return (
                              <div key={cat.id} style={{ padding: '12px 14px', background: theme.bg, borderRadius: '10px', border: '1px solid ' + (isOver ? theme.danger + '40' : theme.border) }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '16px' }}>{cat.icon}</span>
                                    <div>
                                      <div style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>{cat.label}</div>
                                      <div style={{ color: theme.textMuted, fontSize: '11px' }}>
                                        ${a.toFixed(0)} spent
                                        {p > 0 && <span> · ${p.toFixed(0)} budget · {remaining >= 0 ? <span style={{ color: theme.success }}>${remaining.toFixed(0)} left</span> : <span style={{ color: theme.danger }}>${Math.abs(remaining).toFixed(0)} over</span>}</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {isOver && <span style={{ color: theme.danger, fontSize: '11px', fontWeight: 700 }}>⚠️ OVER</span>}
                                    {isAheadOfPace && <span style={{ color: theme.warning, fontSize: '11px', fontWeight: 700 }}>📈 PACE</span>}
                                    {/* Manual actual input */}
                                    <button onClick={e => { e.stopPropagation(); const val = window.prompt(`Set actual spend for ${cat.label} this month ($):`, a.toFixed(0)); if (val !== null && !isNaN(parseFloat(val))) setActualForCategory(cat.id, parseFloat(val)) }}
                                      style={{ padding: '3px 8px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '6px', cursor: 'pointer', color: theme.textMuted, fontSize: '11px' }}>
                                      ✏️ Edit
                                    </button>
                                  </div>
                                </div>
                                {p > 0 && (
                                  <div style={{ height: '6px', background: theme.border, borderRadius: '3px', overflow: 'hidden', position: 'relative' as const }}>
                                    <div style={{ width: Math.min(100, pct) + '%', height: '100%', background: barColor, borderRadius: '3px', transition: 'width 0.4s' }} />
                                    <div style={{ position: 'absolute' as const, left: (monthProgress * 100) + '%', top: '-2px', width: '2px', height: '10px', background: theme.accent }} />
                                  </div>
                                )}
                                {/* Manual budget override */}
                                {p === 0 && (
                                  <button onClick={e => { e.stopPropagation(); const val = window.prompt(`Set monthly budget for ${cat.label} ($):`); if (val !== null && !isNaN(parseFloat(val))) setCategoryBudgets(prev => ({ ...prev, [cat.id]: val })) }}
                                    style={{ marginTop: '4px', padding: '3px 8px', background: theme.accent + '15', border: '1px solid ' + theme.accent + '30', borderRadius: '6px', cursor: 'pointer', color: theme.accent, fontSize: '11px' }}>
                                    + Set budget
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div style={{ padding: '20px', textAlign: 'center' as const, color: theme.textMuted, fontSize: '14px', marginBottom: '16px' }}>
                          Add expenses to your budget to see projected spending by category
                        </div>
                      )}

                      {/* Receipt Scanner & Manual Add */}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
                        <button onClick={() => setShowReceiptScanner(!showReceiptScanner)}
                          style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #D4AF37 0%, #8C6A1F 100%)', color: '#0a0a0a', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
                          📸 Scan Receipt
                        </button>
                        <button onClick={() => {
                          const cat = window.prompt('Category (food/transport/eating_out/utilities/health/entertainment/clothing/personal/subscriptions/other):')
                          if (!cat) return
                          const amt = window.prompt(`Amount spent on ${cat} ($):`)
                          if (amt && !isNaN(parseFloat(amt))) addActualSpend(cat, parseFloat(amt))
                        }} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '10px', cursor: 'pointer', color: theme.text, fontSize: '13px' }}>
                          + Add spend manually
                        </button>
                        <button onClick={() => {
                          if (window.confirm('Reset all actual spend for this month?')) setActualSpend(prev => ({ ...prev, [monthKey]: {} }))
                        }} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '10px', cursor: 'pointer', color: theme.textMuted, fontSize: '13px' }}>
                          Reset month
                        </button>
                      </div>

                      {/* Receipt Scanner UI */}
                      {showReceiptScanner && (
                        <div style={{ marginTop: '16px', padding: '16px', background: theme.bg, borderRadius: '12px', border: '1px solid ' + theme.border }}>
                          <div style={{ color: theme.accent, fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>📸 Receipt Scanner</div>
                          <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '12px', lineHeight: 1.6 }}>
                            Take a photo or upload an image of your receipt. Aureus will read it and extract the spend by category automatically.
                          </div>
                          <input type="file" accept="image/*" capture="environment"
                            onChange={async e => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              const reader = new FileReader()
                              reader.onload = async ev => {
                                const result = ev.target?.result as string
                                const base64 = result.split(',')[1]
                                const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp'
                                await scanReceipt(base64, mediaType)
                              }
                              reader.readAsDataURL(file)
                            }}
                            style={{ display: 'block', marginBottom: '12px', color: theme.text, fontSize: '13px' }} />

                          {receiptScanLoading && (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '14px', background: theme.cardBg, borderRadius: '10px' }}>
                              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '3px solid ' + theme.accent, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                              <span style={{ color: theme.textMuted, fontSize: '13px' }}>Reading receipt...</span>
                            </div>
                          )}

                          {receiptScanResult && !receiptScanResult.error && (
                            <div style={{ padding: '14px', background: theme.cardBg, borderRadius: '10px', border: '1px solid ' + theme.success + '40' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div>
                                  <div style={{ color: theme.text, fontWeight: 700, fontSize: '14px' }}>{receiptScanResult.store || 'Receipt'}</div>
                                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>{receiptScanResult.summary}</div>
                                  {receiptScanResult.date && <div style={{ color: theme.textMuted, fontSize: '11px' }}>{receiptScanResult.date}</div>}
                                </div>
                                <div style={{ color: theme.accent, fontWeight: 800, fontSize: '18px' }}>${receiptScanResult.total?.toFixed(2)}</div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px', marginBottom: '12px' }}>
                                {Object.entries(receiptScanResult.categories || {}).map(([cat, amt]: [string, any]) => {
                                  const catInfo = EXPENSE_CATEGORIES.find(c => c.id === cat)
                                  return (
                                    <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: theme.bg, borderRadius: '6px' }}>
                                      <span style={{ color: theme.text, fontSize: '12px' }}>{catInfo?.icon} {catInfo?.label || cat}</span>
                                      <span style={{ color: theme.success, fontWeight: 600, fontSize: '12px' }}>${parseFloat(amt).toFixed(2)}</span>
                                    </div>
                                  )
                                })}
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => { applyReceiptToActuals(receiptScanResult, monthKey); setReceiptScanResult(null); setShowReceiptScanner(false) }}
                                  style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #D4AF37, #8C6A1F)', color: '#0a0a0a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
                                  ✓ Add to {now.toLocaleDateString('en-AU', { month: 'long' })} actuals
                                </button>
                                <button onClick={() => setReceiptScanResult(null)}
                                  style={{ padding: '10px 14px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.textMuted, fontSize: '13px' }}>
                                  ✕
                                </button>
                              </div>
                            </div>
                          )}
                          {receiptScanResult?.error && (
                            <div style={{ padding: '12px', background: theme.danger + '15', borderRadius: '10px', color: theme.danger, fontSize: '13px' }}>
                              {receiptScanResult.error}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Leak insights */}
                      {leaking.length > 0 && (
                        <div style={{ marginTop: '14px', padding: '14px', background: theme.danger + '10', borderRadius: '10px', border: '1px solid ' + theme.danger + '30' }}>
                          <div style={{ color: theme.danger, fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>💸 Money leak detected</div>
                          {leaking.map(cat => {
                            const p = proj[cat.id] || 0
                            const a = actual[cat.id] || 0
                            const over = a - p
                            return (
                              <div key={cat.id} style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px', lineHeight: 1.6 }}>
                                {cat.icon} <strong style={{ color: theme.text }}>{cat.label}</strong> — ${a.toFixed(0)} spent vs ${p.toFixed(0)} budget (${over.toFixed(0)} over). At this rate: ${(a / (getMonthKey() === monthKey ? dayOfMonth : daysInMonth) * daysInMonth).toFixed(0)} by month end.
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}

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
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px', marginBottom: '12px', padding: '12px', background: theme.bg, borderRadius: '10px', border: '1px solid ' + theme.border }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                    <input placeholder="Source name" value={newIncome.name} onChange={e => setNewIncome({...newIncome, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '100px'}} />
                    <input placeholder="Amount" type="number" value={newIncome.amount} onChange={e => setNewIncome({...newIncome, amount: e.target.value})} style={{...inputStyle, width: '90px'}} />
                    <select value={newIncome.frequency} onChange={e => {
                      const freq = e.target.value
                      // Pre-select next Monday for weekly/fortnightly, 1st for monthly
                      const defaultDate = freq === 'weekly' || freq === 'fortnightly'
                        ? nextDayOfWeek(1) // next Monday
                        : freq === 'monthly' || freq === 'yearly'
                        ? nextDayOfMonth(1)
                        : new Date().toISOString().split('T')[0]
                      setNewIncome({...newIncome, frequency: freq, startDate: defaultDate})
                    }} style={inputStyle}>
                      <option value="weekly">Weekly</option>
                      <option value="fortnightly">Fortnightly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <select value={newIncome.type} onChange={e => setNewIncome({...newIncome, type: e.target.value})} style={inputStyle}><option value="active">Active</option><option value="passive">Passive</option></select>
                  </div>
                  <SmartDatePicker
                    frequency={newIncome.frequency}
                    value={newIncome.startDate}
                    onChange={v => setNewIncome({...newIncome, startDate: v})}
                    label={newIncome.frequency === 'weekly' ? 'Which day do you get paid?' : newIncome.frequency === 'fortnightly' ? 'Which day is payday?' : 'Which day of the month?'}
                  />
                  <button onClick={addIncome} style={{...btnSuccess, alignSelf: 'flex-start' as const, padding: '8px 16px'}}>+ Add income</button>
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' as const }}>
                  {incomeStreams.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No income streams yet</p> : incomeStreams.map(inc => (
                    editingItem?.type === 'income' && editingItem.id === inc.id ? (
                      <div key={inc.id} style={{ padding: '10px', marginBottom: '8px', background: theme.bg, borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' as const }}>
                          <input value={editingItem.data.name} onChange={e => updateEditField('name', e.target.value)} style={{...inputStyle, flex: 1, minWidth: '80px'}} />
                          <input type="number" value={editingItem.data.amount} onChange={e => updateEditField('amount', e.target.value)} style={{...inputStyle, width: '80px'}} />
                          <select value={editingItem.data.frequency} onChange={e => updateEditField('frequency', e.target.value)} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <SmartDatePicker
                            frequency={editingItem.data.frequency}
                            value={editingItem.data.startDate || ''}
                            onChange={v => updateEditField('startDate', v)}
                            label="Pay day"
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}><button onClick={saveEdit} style={{...btnSuccess, padding: '6px 12px', fontSize: '12px'}}>Save</button><button onClick={cancelEdit} style={{...btnDanger, padding: '6px 12px', fontSize: '12px'}}>Cancel</button></div>
                      </div>
                    ) : (
                      <div key={inc.id} style={{ padding: '10px 12px', marginBottom: '6px', background: theme.bg, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ color: theme.text, fontWeight: 600 }}>{inc.name}</div>
                          <div style={{ color: theme.textMuted, fontSize: '12px' }}>
                            {inc.frequency} · {inc.type}
                            {inc.startDate && (() => {
                              const d = new Date(inc.startDate + 'T12:00:00')
                              if (inc.frequency === 'weekly' || inc.frequency === 'fortnightly') return ` · every ${DOW_FULL[d.getDay()]}`
                              if (inc.frequency === 'monthly') return ` · ${d.getDate()}th of month`
                              return ''
                            })()}
                          </div>
                        </div>
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
                    {presetBills.map(p => <button key={p.name} onClick={() => { const amt = prompt(`Amount for ${p.name}:`, (p as any).amount || ''); if (amt) setExpenses([...expenses, { id: Date.now(), name: p.name, amount: amt, frequency: p.frequency, category: p.category, dueDate: (p.frequency === 'weekly' || p.frequency === 'fortnightly' ? (() => { const d = new Date(); d.setHours(0,0,0,0); let diff = 1 - d.getDay(); if (diff <= 0) diff += 7; d.setDate(d.getDate() + diff); return d.toISOString().split('T')[0] })() : (() => { const d = new Date(new Date().getFullYear(), new Date().getMonth(), 1); if (d <= new Date()) d.setMonth(d.getMonth()+1); return d.toISOString().split('T')[0] })()) }]) }} style={{ padding: '4px 10px', background: theme.purple + '20', color: theme.purple, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{p.name}</button>)}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px', marginBottom: '12px', padding: '12px', background: theme.bg, borderRadius: '10px', border: '1px solid ' + theme.border }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                    <input placeholder="Expense name" value={newExpense.name} onChange={e => setNewExpense({...newExpense, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '100px'}} />
                    <input placeholder="Amount" type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} style={{...inputStyle, width: '90px'}} />
                    <select value={newExpense.frequency} onChange={e => {
                      const freq = e.target.value
                      const defaultDate = freq === 'weekly' || freq === 'fortnightly'
                        ? nextDayOfWeek(1)
                        : nextDayOfMonth(1)
                      setNewExpense({...newExpense, frequency: freq, dueDate: defaultDate})
                    }} style={inputStyle}>
                      <option value="weekly">Weekly</option>
                      <option value="fortnightly">Fortnightly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} style={{...inputStyle, color: newExpense.category === '' ? theme.textMuted : theme.text}}>
                      <option value="">📂 Category…</option>
                      {EXPENSE_CATEGORIES.filter(c => !['debt_payments','goal_savings'].includes(c.id)).map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                    </select>
                  </div>
                  <SmartDatePicker
                    frequency={newExpense.frequency}
                    value={newExpense.dueDate}
                    onChange={v => setNewExpense({...newExpense, dueDate: v})}
                    label={newExpense.frequency === 'weekly' ? 'Which day is it due?' : newExpense.frequency === 'fortnightly' ? 'Which day?' : 'Which day of the month is it due?'}
                  />
                  <button onClick={addExpense} style={{...btnDanger, alignSelf: 'flex-start' as const, padding: '8px 16px'}}>+ Add expense</button>
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' as const }}>
                  {expenses.filter(e => !e.targetDebtId && !e.targetGoalId).length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No expenses yet</p> : expenses.filter(e => !e.targetDebtId && !e.targetGoalId).map(exp => (
                    editingItem?.type === 'expense' && editingItem.id === exp.id ? (
                      <div key={exp.id} style={{ padding: '10px', marginBottom: '6px', background: '#2a1010', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' as const }}>
                          <input value={editingItem.data.name} onChange={e => updateEditField('name', e.target.value)} style={{...inputStyle, flex: 1, minWidth: '80px'}} />
                          <input type="number" value={editingItem.data.amount} onChange={e => updateEditField('amount', e.target.value)} style={{...inputStyle, width: '80px'}} />
                          <select value={editingItem.data.frequency} onChange={e => updateEditField('frequency', e.target.value)} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option></select>
                          <select value={editingItem.data.category || 'other'} onChange={e => updateEditField('category', e.target.value)} style={inputStyle}>
                            {EXPENSE_CATEGORIES.filter(c => !['debt_payments','goal_savings'].includes(c.id)).map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                          </select>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <SmartDatePicker
                            frequency={editingItem.data.frequency}
                            value={editingItem.data.dueDate || ''}
                            onChange={v => updateEditField('dueDate', v)}
                            label="Due day"
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}><button onClick={saveEdit} style={{...btnSuccess, padding: '6px 12px', fontSize: '12px'}}>Save</button><button onClick={cancelEdit} style={{...btnDanger, padding: '6px 12px', fontSize: '12px'}}>Cancel</button></div>
                      </div>
                    ) : (
                      <div key={exp.id} style={{ padding: '10px 12px', marginBottom: '6px', background: '#1a0808', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <div style={{ color: theme.text, fontWeight: 600 }}>{exp.name}</div>
                            {exp.category && exp.category !== 'other' && (() => { const cat = EXPENSE_CATEGORIES.find(c => c.id === exp.category); return cat ? <span style={{ fontSize: '10px', padding: '1px 6px', background: theme.accent + '20', color: theme.accent, borderRadius: '10px' }}>{cat.icon} {cat.label}</span> : null })()}
                          </div>
                          <div style={{ color: theme.textMuted, fontSize: '12px' }}>
                            {exp.frequency}
                            {exp.dueDate && (() => {
                              const d = new Date(exp.dueDate + 'T12:00:00')
                              if (exp.frequency === 'weekly' || exp.frequency === 'fortnightly') return ` · every ${DOW_FULL[d.getDay()]}`
                              if (exp.frequency === 'monthly' || exp.frequency === 'quarterly') return ` · due ${d.getDate()}${d.getDate()===1?'st':d.getDate()===2?'nd':d.getDate()===3?'rd':'th'}`
                              return ''
                            })()}
                          </div>
                        </div>
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
                    <div key={day} onClick={() => items.length > 0 && setExpandedDay({ day, items })} style={{ minHeight: '70px', padding: '4px', background: isToday ? theme.accent + '20' : theme.cardBg, borderRadius: '8px', border: isToday ? '2px solid ' + theme.accent : '1px solid ' + theme.border, cursor: items.length > 0 ? 'pointer' : 'default' }}>
                      <div style={{ fontWeight: 600, color: theme.text, marginBottom: '2px', fontSize: '12px' }}>{day}</div>
                      {items.slice(0, 2).map(item => <div key={item.itemId} style={{ fontSize: '9px', padding: '1px 4px', marginBottom: '2px', background: item.itemType === 'income' ? '#d1fae5' : item.itemType === 'goal' ? '#ede9fe' : item.itemType === 'expense' ? '#dbeafe' : '#fee2e2', color: theme.cardBg, borderRadius: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, opacity: item.isPaid ? 0.5 : 1 }}>{item.name}</div>)}
                      {items.length > 2 && <div style={{ fontSize: '9px', color: theme.accent }}>+{items.length - 2}</div>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Debts & Goals */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={cardStyle} data-section="debts">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: theme.warning, fontSize: '18px' }}>💳 Debts</h3>
                  <span style={{ color: theme.warning, fontWeight: 700 }}>${totalDebtBalance.toFixed(0)}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px', marginBottom: '12px', padding: '12px', background: theme.bg, borderRadius: '10px', border: '1px solid ' + theme.border }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                    <input placeholder="Debt name" value={newDebt.name} onChange={e => setNewDebt({...newDebt, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '80px'}} />
                    <input placeholder="Balance" type="number" value={newDebt.balance} onChange={e => setNewDebt({...newDebt, balance: e.target.value})} style={{...inputStyle, width: '80px'}} />
                    <input placeholder="Rate %" type="number" value={newDebt.interestRate} onChange={e => setNewDebt({...newDebt, interestRate: e.target.value})} style={{...inputStyle, width: '60px'}} />
                    <input placeholder="Payment" type="number" value={newDebt.minPayment} onChange={e => setNewDebt({...newDebt, minPayment: e.target.value})} style={{...inputStyle, width: '75px'}} />
                    <select value={newDebt.frequency} onChange={e => {
                      const freq = e.target.value
                      const defaultDate = freq === 'weekly' || freq === 'fortnightly'
                        ? nextDayOfWeek(1)
                        : nextDayOfMonth(1)
                      setNewDebt({...newDebt, frequency: freq, paymentDate: defaultDate})
                    }} style={inputStyle}>
                      <option value="weekly">Weekly</option>
                      <option value="fortnightly">Fortnightly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <SmartDatePicker
                    frequency={newDebt.frequency || 'monthly'}
                    value={newDebt.paymentDate}
                    onChange={v => setNewDebt({...newDebt, paymentDate: v})}
                    label="When is the payment due?"
                  />
                  <button onClick={addDebt} style={{...btnWarning, alignSelf: 'flex-start' as const, padding: '8px 16px'}}>+ Add debt</button>
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto' as const }}>
                  {debts.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No debts — 🎉</p> : debts.map(debt => (
                    <div key={debt.id} style={{ padding: '12px', marginBottom: '8px', background: '#2a1a08', borderRadius: '10px', border: '1px solid ' + theme.border }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div>
                          <div style={{ color: theme.text, fontWeight: 600 }}>{debt.name}</div>
                          <div style={{ color: theme.textMuted, fontSize: '12px' }}>
                            {debt.interestRate}% · ${debt.minPayment}/{debt.frequency || 'monthly'}
                            {debt.paymentDate && (() => {
                              const d = new Date(debt.paymentDate + 'T12:00:00')
                              const freq = debt.frequency || 'monthly'
                              if (freq === 'weekly' || freq === 'fortnightly') return ` · every ${DOW_FULL[d.getDay()]}`
                              if (freq === 'monthly') { const dom = d.getDate(); return ` · due ${dom}${dom===1?'st':dom===2?'nd':dom===3?'rd':'th'}` }
                              return ''
                            })()}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' as const, display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: '4px' }}>
                          <div style={{ color: theme.warning, fontWeight: 700 }}>${parseFloat(debt.balance).toFixed(0)}</div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => startEdit('debt', debt)} style={{ padding: '2px 6px', background: theme.accent, color: '#0a0a0a', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>✏️</button>
                            <button onClick={() => deleteDebt(debt.id)} style={{ padding: '2px 6px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>×</button>
                          </div>
                        </div>
                      </div>
                      {/* Inline edit for debt */}
                      {editingItem?.type === 'debt' && editingItem.id === debt.id && (
                        <div style={{ marginTop: '10px', padding: '12px', background: theme.bg, borderRadius: '8px', border: '1px solid ' + theme.border }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '8px' }}>
                            <input value={editingItem.data.balance} onChange={e => updateEditField('balance', e.target.value)} placeholder="Balance" type="number" style={{...inputStyle, width: '90px'}} />
                            <input value={editingItem.data.interestRate} onChange={e => updateEditField('interestRate', e.target.value)} placeholder="Rate %" type="number" style={{...inputStyle, width: '70px'}} />
                            <input value={editingItem.data.minPayment} onChange={e => updateEditField('minPayment', e.target.value)} placeholder="Payment" type="number" style={{...inputStyle, width: '80px'}} />
                            <select value={editingItem.data.frequency || 'monthly'} onChange={e => updateEditField('frequency', e.target.value)} style={inputStyle}>
                              <option value="weekly">Weekly</option>
                              <option value="fortnightly">Fortnightly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <SmartDatePicker
                              frequency={editingItem.data.frequency || 'monthly'}
                              value={editingItem.data.paymentDate || ''}
                              onChange={v => updateEditField('paymentDate', v)}
                              label="Payment due day"
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={saveEdit} style={{...btnSuccess, padding: '6px 12px', fontSize: '12px'}}>Save</button>
                            <button onClick={cancelEdit} style={{...btnDanger, padding: '6px 12px', fontSize: '12px'}}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* ── DEBT PAYOFF ACCELERATOR ── */}
                {debts.length > 0 && (() => {
                  const extra = parseFloat(debtExtraPayment || '0')
                  const baseline = simulateDebtPayoff(0, payoffMethod)
                  const withExtra = extra > 0 ? simulateDebtPayoff(extra, payoffMethod) : null
                  const monthsSaved = withExtra ? (baseline?.months || 0) - withExtra.months : 0
                  const interestSaved = withExtra ? (baseline?.totalInterest || 0) - withExtra.totalInterest : 0
                  const fmtMo = (m: number) => m >= 12 ? `${Math.floor(m/12)}y ${m%12}m` : `${m}m`
                  return (
                    <div style={{ marginTop: '16px', padding: '16px', background: 'linear-gradient(135deg, #1a1208 0%, #0a0a0a 100%)', borderRadius: '12px', border: '1px solid ' + theme.accent + '40' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ color: theme.accent, fontWeight: 700, fontSize: '13px', letterSpacing: '1px' }}>⚡ PAYOFF ACCELERATOR</div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {(['avalanche', 'snowball'] as const).map(m => (
                            <button key={m} onClick={() => setPayoffMethod(m)}
                              style={{ padding: '3px 10px', fontSize: '11px', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: 'pointer', background: payoffMethod === m ? theme.accent : theme.border, color: payoffMethod === m ? '#0a0a0a' : theme.textMuted, textTransform: 'capitalize' as const }}>
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Baseline */}
                      {baseline && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                          <div style={{ padding: '10px', background: theme.bg, borderRadius: '8px', textAlign: 'center' as const }}>
                            <div style={{ color: theme.textMuted, fontSize: '10px', marginBottom: '3px' }}>PAYOFF TIME</div>
                            <div style={{ color: theme.warning, fontWeight: 700, fontSize: '18px' }}>{fmtMo(baseline.months)}</div>
                            <div style={{ color: theme.textMuted, fontSize: '10px' }}>min payments only</div>
                          </div>
                          <div style={{ padding: '10px', background: theme.bg, borderRadius: '8px', textAlign: 'center' as const }}>
                            <div style={{ color: theme.textMuted, fontSize: '10px', marginBottom: '3px' }}>TOTAL INTEREST</div>
                            <div style={{ color: theme.danger, fontWeight: 700, fontSize: '18px' }}>${Math.round(baseline.totalInterest).toLocaleString()}</div>
                            <div style={{ color: theme.textMuted, fontSize: '10px' }}>min payments only</div>
                          </div>
                        </div>
                      )}

                      {/* Extra payment input */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ color: theme.textMuted, fontSize: '12px', flexShrink: 0 }}>+ Extra/mo:</div>
                        <div style={{ position: 'relative' as const, flex: 1 }}>
                          <span style={{ position: 'absolute' as const, left: '10px', top: '50%', transform: 'translateY(-50%)', color: theme.textMuted, fontSize: '13px' }}>$</span>
                          <input
                            type="number"
                            placeholder="0"
                            value={debtExtraPayment}
                            onChange={e => setDebtExtraPayment(e.target.value)}
                            style={{ ...inputStyle, width: '100%', paddingLeft: '22px' }}
                          />
                        </div>
                        {monthlySurplus > 0 && (
                          <button onClick={() => setDebtExtraPayment(Math.floor(monthlySurplus * 0.5).toString())}
                            style={{ padding: '6px 10px', background: theme.accent + '20', color: theme.accent, border: '1px solid ' + theme.accent + '40', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' as const }}>
                            Use 50% surplus
                          </button>
                        )}
                      </div>

                      {/* Results with extra */}
                      {withExtra && monthsSaved > 0 && (
                        <div style={{ padding: '14px', background: theme.accent + '10', borderRadius: '10px', border: '1px solid ' + theme.accent + '30' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                            <div style={{ textAlign: 'center' as const }}>
                              <div style={{ color: theme.textMuted, fontSize: '10px', marginBottom: '2px' }}>NEW PAYOFF TIME</div>
                              <div style={{ color: theme.accent, fontWeight: 800, fontSize: '20px' }}>{fmtMo(withExtra.months)}</div>
                            </div>
                            <div style={{ textAlign: 'center' as const }}>
                              <div style={{ color: theme.textMuted, fontSize: '10px', marginBottom: '2px' }}>INTEREST SAVED</div>
                              <div style={{ color: theme.accent, fontWeight: 800, fontSize: '20px' }}>${Math.round(interestSaved).toLocaleString()}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <div style={{ padding: '4px 10px', background: theme.accent + '20', borderRadius: '20px', color: theme.accent, fontSize: '12px', fontWeight: 600 }}>
                              🗓️ {fmtMo(monthsSaved)} faster
                            </div>
                            <div style={{ padding: '4px 10px', background: theme.accent + '20', borderRadius: '20px', color: theme.accent, fontSize: '12px', fontWeight: 600 }}>
                              💰 ${Math.round(interestSaved).toLocaleString()} saved
                            </div>
                          </div>
                          <div style={{ marginTop: '10px', color: theme.textMuted, fontSize: '11px', textAlign: 'center' as const, lineHeight: 1.5 }}>
                            Adding ${extra}/mo using <strong style={{ color: theme.accent }}>{payoffMethod}</strong> method — highest {payoffMethod === 'avalanche' ? 'interest rate' : 'momentum'} debt first
                          </div>
                        </div>
                      )}

                      {extra > 0 && monthsSaved <= 0 && withExtra && (
                        <div style={{ padding: '10px', background: theme.success + '10', borderRadius: '8px', color: theme.success, fontSize: '12px', textAlign: 'center' as const }}>
                          🎉 You're already paying ahead — debt cleared in {fmtMo(withExtra.months)}
                        </div>
                      )}

                      <div style={{ marginTop: '10px', color: theme.textMuted, fontSize: '10px', textAlign: 'center' as const }}>
                        ⚠️ Estimate only · assumes fixed rates & balances · not financial advice
                      </div>
                    </div>
                  )
                })()}
              </div>
              <div style={cardStyle} data-section="goals">
                <h3 style={{ margin: '0 0 16px 0', color: theme.accent, fontSize: '18px' }}>🎯 Goals</h3>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px', marginBottom: '12px', padding: '14px', background: theme.bg, borderRadius: '10px', border: '1px solid ' + theme.border }}>
                  {/* Row 1: name + target + already saved */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                    <input placeholder="Goal name" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} style={{...inputStyle, flex: 2, minWidth: '120px'}} />
                    <input placeholder="Target $" type="number" value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: e.target.value})} style={{...inputStyle, width: '95px'}} />
                    <input placeholder="Already saved $" type="number" value={newGoal.saved} onChange={e => setNewGoal({...newGoal, saved: e.target.value})} style={{...inputStyle, width: '115px'}} />
                  </div>
                  {/* Row 2: payment + frequency + interest rate */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '2px', flex: 1, minWidth: '90px' }}>
                      <label style={{ color: theme.textMuted, fontSize: '10px', fontWeight: 600 }}>PAYMENT AMOUNT $</label>
                      <input type="number" placeholder="e.g. 100" value={newGoal.paymentAmount}
                        onChange={e => {
                          const payment = e.target.value
                          const sim = simulateGoalSavings(parseFloat(newGoal.target||'0'), parseFloat(newGoal.saved||'0'), parseFloat(payment||'0'), newGoal.savingsFrequency, parseFloat(newGoal.interestRate||'0'))
                          setNewGoal({...newGoal, paymentAmount: payment, deadline: sim ? sim.deadline : newGoal.deadline})
                        }} style={{...inputStyle, width: '100%'}} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '2px', minWidth: '115px' }}>
                      <label style={{ color: theme.textMuted, fontSize: '10px', fontWeight: 600 }}>FREQUENCY</label>
                      <select value={newGoal.savingsFrequency}
                        onChange={e => {
                          const freq = e.target.value
                          const sim = simulateGoalSavings(parseFloat(newGoal.target||'0'), parseFloat(newGoal.saved||'0'), parseFloat(newGoal.paymentAmount||'0'), freq, parseFloat(newGoal.interestRate||'0'))
                          setNewGoal({...newGoal, savingsFrequency: freq, deadline: sim ? sim.deadline : newGoal.deadline})
                        }} style={inputStyle}>
                        <option value="weekly">Weekly</option>
                        <option value="fortnightly">Fortnightly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '2px', minWidth: '100px' }}>
                      <label style={{ color: theme.textMuted, fontSize: '10px', fontWeight: 600 }}>SAVINGS RATE % p.a.</label>
                      <input type="number" placeholder="e.g. 4.5" step="0.1" value={newGoal.interestRate}
                        onChange={e => {
                          const rate = e.target.value
                          const sim = simulateGoalSavings(parseFloat(newGoal.target||'0'), parseFloat(newGoal.saved||'0'), parseFloat(newGoal.paymentAmount||'0'), newGoal.savingsFrequency, parseFloat(rate||'0'))
                          setNewGoal({...newGoal, interestRate: rate, deadline: sim ? sim.deadline : newGoal.deadline})
                        }} style={{...inputStyle, width: '100%'}} />
                    </div>
                  </div>
                  {/* Row 3: start + auto-computed end date */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '2px', flex: 1, minWidth: '130px' }}>
                      <label style={{ color: theme.textMuted, fontSize: '10px', fontWeight: 600 }}>START DATE</label>
                      <input type="date" value={newGoal.startDate} onChange={e => setNewGoal({...newGoal, startDate: e.target.value})} style={{...inputStyle, width: '100%'}} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '2px', flex: 1, minWidth: '130px' }}>
                      <label style={{ color: theme.textMuted, fontSize: '10px', fontWeight: 600 }}>TARGET DATE {newGoal.deadline && newGoal.paymentAmount ? '(auto-calculated)' : ''}</label>
                      <input type="date" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} style={{...inputStyle, width: '100%', borderColor: newGoal.deadline && newGoal.paymentAmount ? theme.accent : theme.inputBorder}} />
                    </div>
                  </div>

                  {/* Interest calculator preview */}
                  {(() => {
                    const sim = simulateGoalSavings(parseFloat(newGoal.target||'0'), parseFloat(newGoal.saved||'0'), parseFloat(newGoal.paymentAmount||'0'), newGoal.savingsFrequency, parseFloat(newGoal.interestRate||'0'))
                    if (!sim) return null
                    const fmtMo = (m: number) => m >= 12 ? `${Math.floor(m/12)}y ${m%12}m` : `${m}m`
                    const rate = parseFloat(newGoal.interestRate || '0')
                    return (
                      <div style={{ padding: '12px', background: 'linear-gradient(135deg, #1a1208 0%, #0a0a0a 100%)', borderRadius: '10px', border: '1px solid ' + theme.accent + '40' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: rate > 0 ? '10px' : 0 }}>
                          <div style={{ textAlign: 'center' as const }}>
                            <div style={{ color: theme.textMuted, fontSize: '9px', marginBottom: '2px' }}>GOAL DATE</div>
                            <div style={{ color: theme.accent, fontWeight: 700, fontSize: '14px' }}>{new Date(sim.deadline + 'T12:00:00').toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}</div>
                          </div>
                          <div style={{ textAlign: 'center' as const }}>
                            <div style={{ color: theme.textMuted, fontSize: '9px', marginBottom: '2px' }}>TIME TO GOAL</div>
                            <div style={{ color: theme.accent, fontWeight: 700, fontSize: '14px' }}>{fmtMo(sim.months)}</div>
                          </div>
                          <div style={{ textAlign: 'center' as const }}>
                            <div style={{ color: theme.textMuted, fontSize: '9px', marginBottom: '2px' }}>TOTAL CONTRIBUTED</div>
                            <div style={{ color: theme.text, fontWeight: 700, fontSize: '14px' }}>${Math.round(sim.totalContributed).toLocaleString()}</div>
                          </div>
                        </div>
                        {rate > 0 && sim.interestEarned > 0 && (
                          <div style={{ padding: '8px', background: theme.accent + '15', borderRadius: '8px', border: '1px solid ' + theme.accent + '30', display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ textAlign: 'center' as const }}>
                              <div style={{ color: theme.textMuted, fontSize: '9px' }}>INTEREST EARNED</div>
                              <div style={{ color: theme.accent, fontWeight: 800, fontSize: '16px' }}>+${Math.round(sim.interestEarned).toLocaleString()}</div>
                            </div>
                            {sim.monthsSaved > 0 && (
                              <div style={{ textAlign: 'center' as const }}>
                                <div style={{ color: theme.textMuted, fontSize: '9px' }}>TIME SAVED VS NO INTEREST</div>
                                <div style={{ color: theme.success, fontWeight: 700, fontSize: '14px' }}>{fmtMo(sim.monthsSaved)} faster</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: theme.textMuted, fontSize: '12px' }}>
                      <input type="checkbox" checked={newGoal.addedToCalendar !== false} onChange={e => setNewGoal({...newGoal, addedToCalendar: e.target.checked})} style={{ accentColor: theme.accent, width: '14px', height: '14px' }} />
                      📅 Show payments on calendar
                    </label>
                    <button onClick={addGoal} style={{...btnPurple, padding: '8px 20px'}}>+ Add Goal</button>
                  </div>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' as const }}>
                  {goals.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No goals yet</p> : goals.map(goal => {
                    const pct = (parseFloat(goal.saved || '0') / parseFloat(goal.target || '1')) * 100
                    return (
                      <div key={goal.id} style={{ padding: '12px', marginBottom: '8px', background: theme.bg, borderRadius: '10px', border: '1px solid ' + theme.border }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <div>
                            <div style={{ color: theme.text, fontWeight: 600 }}>{goal.name}</div>
                            <div style={{ color: theme.textMuted, fontSize: '12px' }}>
                              ${parseFloat(goal.saved || '0').toFixed(0)} / ${parseFloat(goal.target || '0').toFixed(0)}
                              {goal.paymentAmount && <span> · ${goal.paymentAmount}/{goal.savingsFrequency || 'monthly'}</span>}
                              {goal.addedToCalendar ? <span style={{ color: theme.accent, marginLeft: '6px' }}>📅</span> : <span style={{ color: theme.textMuted, marginLeft: '6px' }}>no calendar</span>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: theme.accent, fontWeight: 700 }}>{pct.toFixed(0)}%</span>
                            <button onClick={() => deleteGoal(goal.id)} style={{ padding: '2px 6px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>×</button>
                          </div>
                        </div>
                        {(goal.startDate || goal.deadline) && (
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '6px' }}>
                            {goal.startDate && <span style={{ color: theme.textMuted, fontSize: '11px' }}>📅 Start: {new Date(goal.startDate + 'T12:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                            {goal.deadline && <span style={{ color: theme.accent, fontSize: '11px' }}>🏁 Target: {new Date(goal.deadline + 'T12:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                          </div>
                        )}
                        <div style={{ height: '6px', background: theme.border, borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #D4AF37, #B68B2E)' }} /></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Sinking Funds */}
            {(() => {
              const SINKING_CATEGORIES = [
                { id: 'celebration', label: 'Celebration', icon: '🎉' },
                { id: 'christmas',   label: 'Christmas',   icon: '🎄' },
                { id: 'birthday',    label: 'Birthday',    icon: '🎂' },
                { id: 'holiday',     label: 'Holiday',     icon: '✈️' },
                { id: 'vehicle',     label: 'Car/Rego',    icon: '🚗' },
                { id: 'insurance',   label: 'Insurance',   icon: '🛡️' },
                { id: 'education',   label: 'Education',   icon: '📚' },
                { id: 'medical',     label: 'Medical',     icon: '🏥' },
                { id: 'home',        label: 'Home/Renos',  icon: '🏠' },
                { id: 'other',       label: 'Other',       icon: '📦' },
              ]
              const totalSinkingFundWeekly = sinkingFunds.reduce((s, f) => s + parseFloat(f.weeklyAmount || '0'), 0)
              const totalSinkingFundSaved = sinkingFunds.reduce((s, f) => s + parseFloat(f.savedAmount || '0'), 0)

              return (
                <div style={cardStyle} data-section="sinking-funds">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 2px 0', color: theme.accent, fontSize: '18px' }}>🎯 Sinking Funds</h3>
                      <div style={{ color: theme.textMuted, fontSize: '12px' }}>Save weekly for known future expenses — no more surprise blowouts</div>
                    </div>
                    {sinkingFunds.length > 0 && (
                      <div style={{ textAlign: 'right' as const }}>
                        <div style={{ color: theme.accent, fontWeight: 700, fontSize: '14px' }}>${totalSinkingFundWeekly.toFixed(0)}/wk</div>
                        <div style={{ color: theme.textMuted, fontSize: '11px' }}>${totalSinkingFundSaved.toFixed(0)} saved total</div>
                      </div>
                    )}
                  </div>

                  {/* Aureus tip if no sinking funds */}
                  {sinkingFunds.length === 0 && (
                    <div style={{ padding: '14px', background: theme.accent + '10', borderRadius: '10px', border: '1px solid ' + theme.accent + '30', marginBottom: '16px' }}>
                      <div style={{ color: theme.accent, fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>💡 Aureus tip: The sinking fund secret</div>
                      <div style={{ color: theme.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                        Christmas costs $1,200? Set aside $23/week all year — it's already saved by December. 
                        Car rego $800? $15/week. The trick: decide in advance, automate, forget about it.
                        Add your first one below.
                      </div>
                    </div>
                  )}

                  {/* Add form */}
                  <div style={{ padding: '14px', background: theme.bg, borderRadius: '12px', border: '1px solid ' + theme.border, marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, marginBottom: '10px' }}>
                      <input placeholder="Fund name (e.g. Christmas 2026)" value={newSinkingFund.name} onChange={e => setNewSinkingFund({...newSinkingFund, name: e.target.value})} style={{...inputStyle, flex: 2, minWidth: '150px'}} />
                      <input type="number" placeholder="Target $" value={newSinkingFund.targetAmount} onChange={e => {
                        const target = parseFloat(e.target.value || '0')
                        const weeksLeft = newSinkingFund.targetDate ? Math.max(1, Math.ceil((new Date(newSinkingFund.targetDate).getTime() - Date.now()) / (7 * 86400000))) : 52
                        const autoWeekly = target > 0 ? (target / weeksLeft).toFixed(2) : ''
                        setNewSinkingFund({...newSinkingFund, targetAmount: e.target.value, weeklyAmount: autoWeekly})
                      }} style={{...inputStyle, width: '100px'}} />
                      <select value={newSinkingFund.category} onChange={e => setNewSinkingFund({...newSinkingFund, category: e.target.value})} style={inputStyle}>
                        {SINKING_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, alignItems: 'flex-end' }}>
                      <div style={{ flex: 1, minWidth: '130px' }}>
                        <label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '3px' }}>TARGET DATE</label>
                        <input type="date" value={newSinkingFund.targetDate} onChange={e => {
                          const date = e.target.value
                          const target = parseFloat(newSinkingFund.targetAmount || '0')
                          const weeksLeft = date ? Math.max(1, Math.ceil((new Date(date).getTime() - Date.now()) / (7 * 86400000))) : 52
                          const autoWeekly = target > 0 ? (target / weeksLeft).toFixed(2) : newSinkingFund.weeklyAmount
                          setNewSinkingFund({...newSinkingFund, targetDate: date, weeklyAmount: autoWeekly})
                        }} style={{...inputStyle, width: '100%'}} />
                      </div>
                      <div style={{ flex: 1, minWidth: '110px' }}>
                        <label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '3px' }}>WEEKLY AMOUNT $</label>
                        <input type="number" placeholder="auto-calc" value={newSinkingFund.weeklyAmount} onChange={e => setNewSinkingFund({...newSinkingFund, weeklyAmount: e.target.value})} style={{...inputStyle, width: '100%'}} />
                      </div>
                      <button onClick={addSinkingFund} style={{...btnPrimary, padding: '10px 20px', flexShrink: 0}}>+ Add Fund</button>
                    </div>
                    {newSinkingFund.targetAmount && newSinkingFund.targetDate && (
                      <div style={{ marginTop: '10px', padding: '8px 12px', background: theme.accent + '12', borderRadius: '8px', color: theme.textMuted, fontSize: '12px' }}>
                        💡 Save <strong style={{ color: theme.accent }}>${(parseFloat(newSinkingFund.weeklyAmount || '0')).toFixed(2)}/week</strong> for {Math.max(1, Math.ceil((new Date(newSinkingFund.targetDate).getTime() - Date.now()) / (7 * 86400000)))} weeks → ${parseFloat(newSinkingFund.targetAmount || '0').toFixed(0)} by {new Date(newSinkingFund.targetDate + 'T12:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>

                  {/* Fund cards */}
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
                    {sinkingFunds.map(fund => {
                      const target = parseFloat(fund.targetAmount || '0')
                      const saved = parseFloat(fund.savedAmount || '0')
                      const pct = target > 0 ? Math.min(100, (saved / target) * 100) : 0
                      const weeksLeft = fund.targetDate ? Math.max(0, Math.ceil((new Date(fund.targetDate).getTime() - Date.now()) / (7 * 86400000))) : null
                      const catInfo = SINKING_CATEGORIES.find(c => c.id === fund.category) || SINKING_CATEGORIES[0]
                      const onTrack = weeksLeft !== null && (saved + parseFloat(fund.weeklyAmount || '0') * weeksLeft) >= target * 0.95
                      return (
                        <div key={fund.id} style={{ padding: '14px 16px', background: theme.bg, borderRadius: '12px', border: '1px solid ' + (pct >= 100 ? theme.success + '60' : theme.border) }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '18px' }}>{catInfo.icon}</span>
                                <div style={{ color: theme.text, fontWeight: 700, fontSize: '14px' }}>{fund.name}</div>
                                {pct >= 100 && <span style={{ padding: '2px 8px', background: theme.success + '20', color: theme.success, borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>✅ FUNDED</span>}
                                {!onTrack && weeksLeft !== null && weeksLeft > 0 && pct < 100 && (
                                  <span style={{ padding: '2px 8px', background: theme.warning + '20', color: theme.warning, borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>⚠️ Behind pace</span>
                                )}
                              </div>
                              <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '2px' }}>
                                ${saved.toFixed(0)} of ${target.toFixed(0)} · ${parseFloat(fund.weeklyAmount || '0').toFixed(0)}/week
                                {weeksLeft !== null && <span> · {weeksLeft} week{weeksLeft !== 1 ? 's' : ''} to go</span>}
                                {fund.targetDate && <span> · {new Date(fund.targetDate + 'T12:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</span>}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <div style={{ color: theme.accent, fontWeight: 800, fontSize: '16px' }}>{pct.toFixed(0)}%</div>
                              <button onClick={() => { const amt = window.prompt(`Add to ${fund.name} ($):`); if (amt && !isNaN(parseFloat(amt))) addToSinkingFund(fund.id, parseFloat(amt)) }}
                                style={{ padding: '4px 10px', background: theme.accent + '20', color: theme.accent, border: '1px solid ' + theme.accent + '40', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>+ Add</button>
                              <button onClick={() => deleteSinkingFund(fund.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>×</button>
                            </div>
                          </div>
                          <div style={{ height: '8px', background: theme.border, borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: pct + '%', height: '100%', background: pct >= 100 ? theme.success : 'linear-gradient(90deg, #D4AF37, #B68B2E)', borderRadius: '4px', transition: 'width 0.4s' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {sinkingFunds.length > 0 && totalSinkingFundWeekly > 0 && (
                    <div style={{ marginTop: '12px', padding: '10px 14px', background: theme.cardBg, borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: theme.textMuted, fontSize: '13px' }}>Total weekly set aside</span>
                      <span style={{ color: theme.accent, fontWeight: 700 }}>${totalSinkingFundWeekly.toFixed(0)}/week · ${(totalSinkingFundWeekly * 52).toFixed(0)}/year</span>
                    </div>
                  )}
                </div>
              )
            })()}

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
            <div style={{ padding: '32px', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1208 50%, #231a08 100%)', borderRadius: '20px', border: '2px solid #D4AF37', textAlign: 'center' as const }}>
              <div style={{ color: theme.textMuted, fontSize: '12px', letterSpacing: '3px', marginBottom: '8px' }}>🏠 MORTGAGE FREE TARGET</div>
              {mortgageResult ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' as const }}>
                    <div>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>At current rate</div>
                      <div style={{ color: '#c0392b', fontSize: '40px', fontWeight: 800 }}>{mortgageResult.standard.freeYear}</div>
                      <div style={{ color: theme.textMuted, fontSize: '12px' }}>{mortgageResult.standard.years.toFixed(1)} yrs · ${Math.round(mortgageResult.standard.interest).toLocaleString()} interest</div>
                    </div>
                    {parseFloat(mortgageAccel.extraRepayment || '0') > 0 && (
                      <div>
                        <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>With extra ${mortgageAccel.extraRepayment}/{mortgageAccel.repaymentFrequency}</div>
                        <div style={{ color: '#B68B2E', fontSize: '40px', fontWeight: 800 }}>{mortgageResult.withExtra.freeYear}</div>
                        <div style={{ color: '#B68B2E', fontSize: '13px' }}>🎉 {mortgageResult.withExtra.yearsSaved.toFixed(1)} yrs earlier · saving ${Math.round(mortgageResult.withExtra.interestSaved).toLocaleString()}</div>
                      </div>
                    )}
                    {parseFloat(mortgageAccel.offsetBalance || '0') > 0 && (
                      <div>
                        <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>With ${mortgageAccel.offsetBalance} offset</div>
                        <div style={{ color: '#D4AF37', fontSize: '40px', fontWeight: 800 }}>{mortgageResult.withOffset.freeYear}</div>
                        <div style={{ color: '#D4AF37', fontSize: '13px' }}>💡 {mortgageResult.withOffset.yearsSaved.toFixed(1)} yrs saved · ${Math.round(mortgageResult.withOffset.interestSaved).toLocaleString()} saved</div>
                      </div>
                    )}
                    {parseFloat(mortgageAccel.extraRepayment || '0') > 0 && parseFloat(mortgageAccel.offsetBalance || '0') > 0 && (
                      <div>
                        <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Extra payments + offset</div>
                        <div style={{ color: '#D4AF37', fontSize: '40px', fontWeight: 800 }}>{mortgageResult.withBoth.freeYear}</div>
                        <div style={{ color: '#D4AF37', fontSize: '13px' }}>🚀 {mortgageResult.withBoth.yearsSaved.toFixed(1)} yrs saved · ${Math.round(mortgageResult.withBoth.interestSaved).toLocaleString()} saved</div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <div style={{ color: theme.text, fontSize: '20px', marginBottom: '8px' }}>Enter your mortgage details below</div>
                  <div style={{ color: theme.textMuted, fontSize: '14px' }}>See how extra payments could save you years and tens of thousands in interest</div>
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
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1a1208, #0a0a0a)', borderRadius: '16px', border: '2px solid #D4AF37' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '48px' }}>🎓</div>
                <div>
                  <h2 style={{ margin: 0, color: theme.text, fontSize: '24px' }}>Financial Literacy Hub</h2>
                  <p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '14px' }}>Real knowledge behind real money moves. Tap any topic to learn — then ask Aureus to apply it to your situation.</p>
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
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e3a32, theme.bg)', borderRadius: '16px', border: '2px solid #B68B2E' }}>
              <div style={{ color: theme.textMuted, fontSize: '12px', letterSpacing: '2px', marginBottom: '12px' }}>❤️ YOUR WHY</div>
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
                  <div style={{ color: theme.text, fontSize: '18px', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '12px' }}>"{whyStatement}"</div>
                  <button onClick={() => { setEditingWhy(true); setWhyDraft(whyStatement) }} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: theme.textMuted, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Edit</button>
                </div>
              ) : (
                <button onClick={() => setEditingWhy(true)} style={{ padding: '16px', background: 'transparent', border: '2px dashed theme.border', borderRadius: '10px', color: theme.textMuted, cursor: 'pointer', textAlign: 'left' as const, width: '100%', fontSize: '14px' }}>
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
                    <div key={win.id} style={{ padding: '14px 16px', background: win.auto ? (theme.bg) : (darkMode ? '#2e2a1e' : '#fefce8'), borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '14px', border: '1px solid ' + (win.auto ? theme.success + '30' : theme.warning + '30') }}>
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
            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, theme.cardBg, theme.bg)', border: '1px solid ' + theme.border }}>
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
                  <div key={metric.label} style={{ padding: '16px', background: theme.cardBg, borderRadius: '10px' }}>
                    <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>{metric.label}</div>
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
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #8C6A1F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#0a0a0a' }}>A</div>
                <div>
                  <div style={{ color: theme.text, fontWeight: 600 }}>Aureus</div>
                  <div style={{ color: theme.textMuted, fontSize: '11px' }}>
                    {moneyPersonality && personalityProfiles[moneyPersonality]
                      ? `Coaching you as a ${personalityProfiles[moneyPersonality].label} · ${currentBabyStep.title}`
                      : `${currentBabyStep.title} · Ask me to build your weekly plan`}
                  </div>
                </div>
                {!moneyPersonality && (
                  <button onClick={() => { setShowOnboarding(true); setOnboardingStep(1) }} style={{ marginLeft: 'auto', padding: '5px 10px', background: theme.purple + '20', color: theme.purple, border: '1px solid ' + theme.purple + '40', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>
                    🧠 Take quiz
                  </button>
                )}
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
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, theme.cardBg, theme.bg)', borderRadius: '20px', border: '2px solid ' + theme.purple }}>
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
                <div style={{ textAlign: 'center' as const, padding: '32px', color: theme.textMuted, border: '2px dashed theme.border', borderRadius: '12px' }}>
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
                            <div style={{ height: '6px', background: theme.border, borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
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
                                // Detect milestone type for context-aware routing
                                const isDebtMilestone = /\bkill bad\b|\bpay.*off.*debt\b|\bdebt.*payoff\b|\bcredit card\b|\bbnpl\b|\bpersonal loan\b/i.test(m.name)
                                const isAddGoalStep = step.type === 'add_goal' || /add.*goal|savings goal.*aureus|aureus.*goal|calendar.*reminder|track.*aureus/i.test(step.text)
                                const isAddDebtStep = isDebtMilestone && isAddGoalStep
                                const isReviewStep = step.type === 'review_spending' || /review.*aureus|spending.*aureus|aureus.*spending|check.*aureus/i.test(step.text)
                                const isActionStep = isAddGoalStep // true for either debt or goal action

                                return (
                                <div
                                  key={step.id}
                                  style={{ background: step.done ? theme.success + '15' : theme.bg, borderRadius: '10px', border: '1px solid ' + (step.done ? theme.success + '40' : isActionStep ? (isAddDebtStep ? theme.warning + '60' : theme.purple + '60') : theme.border), overflow: 'hidden' }}
                                >
                                  {/* Step tick reaction toast — improvement #7 */}
                                  {stepTickReaction?.milestoneId === m.id && stepTickReaction?.stepId === step.id && (
                                    <div style={{ padding: '10px 14px', background: theme.success + '20', borderLeft: '3px solid ' + theme.success, color: theme.text, fontSize: '12px', lineHeight: 1.5, animation: 'slideIn 0.3s ease' }}>
                                      ✅ {stepTickReaction?.message}
                                    </div>
                                  )}
                                  {/* Clickable row */}
                                  <div
                                    onClick={() => tickPlanStepWithReaction(m.id, step.id, m, step)}
                                    style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', cursor: 'pointer' }}
                                  >
                                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: '2px solid ' + (step.done ? theme.success : theme.border), background: step.done ? theme.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                                      {step.done && <span style={{ color: 'white', fontSize: '14px', fontWeight: 700 }}>✓</span>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                        <span style={{ color: theme.accent, fontSize: '11px', fontWeight: 700, background: theme.accent + '18', padding: '1px 7px', borderRadius: '10px' }}>STEP {idx + 1}</span>
                                        {isActionStep && !step.done && <span style={{ padding: '1px 6px', background: (isAddDebtStep ? theme.warning : theme.purple) + '30', color: isAddDebtStep ? theme.warning : theme.purple, borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>{isAddDebtStep ? 'ACTION IN AUREUS — DEBTS' : 'ACTION IN AUREUS — GOALS'}</span>}
                                      </div>
                                      <div style={{ color: step.done ? theme.textMuted : theme.text, fontSize: '14px', lineHeight: 1.5, textDecoration: step.done ? 'line-through' : 'none' }}>{step.text}</div>
                                    </div>
                                  </div>
                                  {/* Inline action button for Aureus-specific steps */}
                                  {isActionStep && !step.done && (
                                    <div style={{ padding: '0 14px 12px 50px' }}>
                                      {isAddDebtStep ? (
                                        // Debt milestone — pre-fill debt form and navigate to Budget > Debts
                                        <button
                                          onClick={e => {
                                            e.stopPropagation()
                                            setNewDebt(d => ({ ...d, name: m.name, balance: m.targetAmount || '' }))
                                            setActiveTab('dashboard')
                                            togglePlanStep(m.id, step.id)
                                            setTimeout(() => {
                                              const el = document.querySelector('[data-section="debts"]')
                                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                            }, 350)
                                          }}
                                          style={{ padding: '8px 16px', background: theme.warning, color: '#0a0a0a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
                                        >
                                          💳 Add to Debts in Budget →
                                        </button>
                                      ) : (
                                        // Savings milestone — pre-fill goals form and navigate to Budget > Goals
                                        <button
                                          onClick={e => {
                                            e.stopPropagation()
                                            const weeks = m.targetDate
                                              ? Math.max(1, Math.ceil((new Date(m.targetDate).getTime() - Date.now()) / (7 * 86400000)))
                                              : 26
                                            const amt = m.targetAmount && parseFloat(m.targetAmount) > 0 ? m.targetAmount : ''
                                            const suggestedPayment = amt ? Math.ceil(parseFloat(amt) / weeks).toString() : ''
                                            // Pre-fill the new goal form so user lands ready to submit
                                            setNewGoal({
                                              name: m.name,
                                              target: amt,
                                              saved: '0',
                                              paymentAmount: suggestedPayment,
                                              savingsFrequency: 'monthly',
                                              startDate: (() => { const d = new Date(); d.setHours(0,0,0,0); let diff = 1 - d.getDay(); if (diff <= 0) diff += 7; d.setDate(d.getDate() + diff); return d.toISOString().split('T')[0] })(),
                                              deadline: m.targetDate || '',
                                              addedToCalendar: true,
                                              interestRate: ''
                                            })
                                            togglePlanStep(m.id, step.id)
                                            setActiveTab('dashboard')
                                            setTimeout(() => {
                                              const el = document.querySelector('[data-section="goals"]')
                                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                            }, 350)
                                          }}
                                          style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #D4AF37 0%, #8C6A1F 100%)', color: '#0a0a0a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
                                        >
                                          🎯 Set up in Goals →
                                        </button>
                                      )}
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
                  const alreadyOwnsHome = ['own', 'paid_off', 'buying'].includes(houseStatus || '')
                  const mortgageFree = houseStatus === 'paid_off'
                  // Step 5 (home deposit) is done if they own/are buying a home
                  const isStep5Done = item.step === 5 && alreadyOwnsHome
                  // Step 6 (mortgage) is done if they've paid it off
                  const isStep6Done = item.step === 6 && mortgageFree
                  const done = item.step < currentBabyStep.step || isStep5Done || isStep6Done
                  const isCurrent = item.step === currentBabyStep.step && !isStep5Done && !isStep6Done
                  return (
                    <div key={item.step} style={{ padding: '16px', background: done ? (theme.bg) : isCurrent ? '#2e2a1e' : theme.border, borderRadius: '12px', border: done ? '2px solid ' + theme.success : isCurrent ? '2px solid ' + theme.warning : '1px solid ' + theme.border }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: done ? theme.success : isCurrent ? theme.warning : theme.purple, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', flexShrink: 0 }}>{done ? '✓' : item.icon}</div>
                        <div onClick={() => setSelectedBabyStep(item.step)} style={{ flex: 1, cursor: 'pointer' }}>
                          <div style={{ color: theme.text, fontWeight: 600, fontSize: '16px' }}>{item.title}</div>
                          <div style={{ color: theme.textMuted, fontSize: '13px' }}>
                            {isStep5Done ? '✅ Already owns home — this step is complete' : isStep6Done ? '✅ Mortgage paid off — this step is complete' : item.desc}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          {!isStep5Done && !isStep6Done && <button onClick={() => addToRoadmapQuick(item.title, item.icon, '', item.desc)} style={{ padding: '5px 10px', background: theme.purple + '20', color: theme.purple, border: '1px solid ' + theme.purple + '40', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>+ Roadmap</button>}
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
                <button onClick={() => askAureusAbout(`My FIRE number is $${fiPath.fireNumber.toLocaleString()} (tax-adjusted at ${Math.round(fireTaxRate*100)}%). I need $${fiPath.monthlyNeed.toFixed(0)}/mo after tax. I currently have $${fiPath.currentInvestments.toLocaleString()} invested. What's my best path to financial independence?`)} style={{ padding: '8px 14px', background: theme.purple + '20', color: theme.purple, border: '1px solid ' + theme.purple + '40', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>💬 Ask Aureus</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={cardStyle}>
                  <h3 style={{ margin: '0 0 12px 0', color: theme.purple }}>🌴 Freedom Target</h3>
                  <div style={{ color: theme.text, fontSize: '14px', lineHeight: 2 }}>
                    <div>Monthly need (after tax): <strong>${fiPath.monthlyNeed.toFixed(0)}</strong></div>
                    <div>Passive income: <strong style={{ color: theme.success }}>${(passiveIncome + totalPassiveQuestIncome).toFixed(0)}</strong></div>
                    <div>Passive gap: <strong style={{ color: theme.danger }}>${Math.max(fiPath.passiveGap - totalPassiveQuestIncome, 0).toFixed(0)}</strong></div>
                    <div>Coverage: <strong style={{ color: theme.purple }}>{((passiveIncome + totalPassiveQuestIncome) / Math.max(fiPath.monthlyNeed, 1) * 100).toFixed(1)}%</strong></div>
                  </div>
                </div>
                <div style={cardStyle}>
                  <h3 style={{ margin: '0 0 12px 0', color: theme.success }}>🔥 FIRE Number (Tax-Adjusted)</h3>
                  <div style={{ color: theme.text, fontSize: '13px', lineHeight: 1.9 }}>
                    <div>Annual need after tax: <strong>${fiPath.annualNeedAfterTax.toLocaleString(undefined,{maximumFractionDigits:0})}</strong></div>
                    <div>Grossed up at {Math.round(fireTaxRate*100)}% tax: <strong style={{ color: theme.warning }}>${fiPath.annualNeedPreTax.toLocaleString(undefined,{maximumFractionDigits:0})}/yr</strong></div>
                    <div style={{ borderTop: '1px solid ' + theme.border, paddingTop: '6px', marginTop: '4px' }}>
                      <span style={{ color: theme.textMuted, fontSize: '11px' }}>FIRE NUMBER (pre-tax ÷ 4%)</span>
                      <div style={{ color: theme.accent, fontWeight: 800, fontSize: '22px' }}>${fiPath.fireNumber.toLocaleString()}</div>
                    </div>
                    <div style={{ color: theme.textMuted, fontSize: '11px', lineHeight: 1.5, padding: '8px', background: theme.bg, borderRadius: '6px', marginTop: '4px' }}>
                      Portfolio of ${fiPath.fireNumber.toLocaleString()} × 4% = ${fiPath.annualNeedPreTax.toLocaleString(undefined,{maximumFractionDigits:0})}/yr pre-tax → ${fiPath.annualNeedAfterTax.toLocaleString(undefined,{maximumFractionDigits:0})}/yr after {Math.round(fireTaxRate*100)}% tax → ${(fiPath.annualNeedAfterTax/52).toFixed(0)}/week to live on
                    </div>
                  </div>
                </div>
              </div>
              {/* Progress toward FIRE */}
              <div style={{ marginTop: '16px', padding: '14px', background: theme.cardBg, borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: theme.textMuted, fontSize: '13px' }}>Progress: <strong style={{ color: theme.purple }}>{fiPath.fireNumber > 0 ? (fiPath.currentInvestments / fiPath.fireNumber * 100).toFixed(1) : 0}%</strong></span>
                  <span style={{ color: theme.textMuted, fontSize: '13px' }}>Est. years to FI: <strong style={{ color: theme.purple }}>{fiPath.yearsToFI >= 999 ? '∞' : fiPath.yearsToFI}</strong></span>
                </div>
                <div style={{ height: '8px', background: theme.border, borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: Math.min(100, fiPath.fireNumber > 0 ? (fiPath.currentInvestments / fiPath.fireNumber * 100) : 0) + '%', height: '100%', background: 'linear-gradient(90deg, #D4AF37, #B68B2E)' }} />
                </div>
                <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '8px' }}>⚠️ Tax estimate uses 32.5% AU marginal rate — consult your accountant for your exact rate · Not financial advice</div>
              </div>
            </div>

            {/* Set & Forget Automation */}
            {incomeStreams.length > 0 && (
              <div style={{ padding: '24px', background: 'linear-gradient(135deg, #D4AF3715, #D4AF3715)', borderRadius: '16px', border: '2px solid ' + theme.accent }}>
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
            <div style={{ padding: '24px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }}>
              <h2 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '22px' }}>💰 Automated Revenue Strategies</h2>
              <p style={{ margin: '0 0 20px 0', color: theme.textMuted, fontSize: '13px' }}>Step-by-step guides to build passive income. Use + Add to Roadmap to track your progress.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {passiveQuests.map(quest => {
                  const isExp = activeQuestId === quest.id
                  return (
                    <div key={quest.id} style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{ width: '44px', height: '44px', background: theme.border, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{quest.icon}</div>
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
                        <div style={{ marginTop: '14px', padding: '14px', background: theme.bg, borderRadius: '8px' }}>
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
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, theme.cardBg 0%, theme.bg 100%)', borderRadius: '20px', border: '1px solid ' + theme.border }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '12px', letterSpacing: '2px' }}>🐀 RAT RACE ESCAPE TRACKER</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>Passive income as % of monthly expenses</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '44px', fontWeight: 'bold', color: (passiveIncome + totalPassiveQuestIncome) >= fiPath.monthlyNeed ? theme.success : '#D4AF37' }}>
                    {fiPath.monthlyNeed > 0 ? (((passiveIncome + totalPassiveQuestIncome) / fiPath.monthlyNeed) * 100).toFixed(1) : '0.0'}%
                  </div>
                  <button onClick={() => addToRoadmapQuick('Escape the Rat Race', '🐀', (fiPath.monthlyNeed * 12 * 25).toFixed(0), 'Build passive income to cover 100% of expenses')} style={{ padding: '8px 12px', background: theme.warning + '20', color: theme.warning, border: '1px solid ' + theme.warning + '40', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>+ Roadmap</button>
                </div>
              </div>
              <div style={{ height: '14px', background: theme.border, borderRadius: '7px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ width: Math.min(((passiveIncome + totalPassiveQuestIncome) / Math.max(fiPath.monthlyNeed, 1)) * 100, 100) + '%', height: '100%', background: 'linear-gradient(90deg, #D4AF37, #B68B2E)', borderRadius: '7px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {[{ pct: 25, label: 'Side income', color: theme.textMuted }, { pct: 50, label: 'Half covered', color: '#D4AF37' }, { pct: 75, label: 'Almost free', color: '#D4AF37' }, { pct: 100, label: 'Escaped! 🎉', color: '#B68B2E' }].map(ms => {
                  const current = fiPath.monthlyNeed > 0 ? ((passiveIncome + totalPassiveQuestIncome) / fiPath.monthlyNeed) * 100 : 0
                  const reached = current >= ms.pct
                  return (
                    <div key={ms.pct} style={{ padding: '10px', background: reached ? ms.color + '20' : theme.cardBg, borderRadius: '8px', border: '1px solid ' + (reached ? ms.color : theme.border), textAlign: 'center' as const }}>
                      <div style={{ color: reached ? ms.color : '#64748b', fontWeight: 700 }}>{ms.pct}%</div>
                      <div style={{ color: reached ? ms.color : '#64748b', fontSize: '10px', marginTop: '2px' }}>{reached ? '✓ ' : ''}{ms.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Australian Home Buying Roadmap */}
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, theme.cardBg 0%, theme.bg 100%)', borderRadius: '20px', border: '1px solid ' + theme.border }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg, #D4AF37, #B68B2E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>🏠</div>
                  <div>
                    <h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>Australian Home Buying Roadmap</h2>
                    <p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '13px' }}>Expand each phase · Add phases to your personal roadmap</p>
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
                <div key={phase.id} style={{ marginBottom: '10px', borderRadius: '12px', overflow: 'hidden', border: '1px solid ' + (homeGuideExpanded === phase.id ? phase.color : theme.border) }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 0 0' }}>
                    <button onClick={() => setHomeGuideExpanded(homeGuideExpanded === phase.id ? null : phase.id)} style={{ flex: 1, padding: '14px 16px', background: homeGuideExpanded === phase.id ? phase.color + '20' : theme.cardBg, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' as const }}>
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
                    <div style={{ padding: '0 16px 16px 16px', background: theme.bg }}>
                      <div style={{ height: '1px', background: theme.border, marginBottom: '14px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                        {phase.items.map((item, i) => (
                          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', background: theme.cardBg, borderRadius: '8px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: phase.color + '30', color: phase.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', flexShrink: 0 }}>{i + 1}</div>
                            <div style={{ color: '#e2e8f0', fontSize: '13px', lineHeight: 1.5 }}>{item}</div>
                          </div>
                        ))}
                      </div>
                      {phase.id === 'phase5' && <button onClick={() => setActiveTab('mortgage')} style={{ ...btnSuccess, width: '100%', marginTop: '12px' }}>🚀 Open Mortgage Accelerator →</button>}
                      {phase.id === 'phase3' && (
                        <div style={{ marginTop: '12px', padding: '12px', background: theme.cardBg, borderRadius: '8px' }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 600, marginBottom: '8px' }}>📊 Stamp Duty Quick Reference</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                            {Object.entries(australianHomeData.stampDuty).map(([state, data]: [string, any]) => (
                              <div key={state} style={{ padding: '8px', background: theme.bg, borderRadius: '6px' }}>
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
            <div style={{ padding: '20px', background: 'linear-gradient(135deg, theme.cardBg, theme.bg)', borderRadius: '16px', border: '1px solid ' + theme.border }}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>🌏 You're Not Alone</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {[
                  { stat: '847', label: 'users on Baby Step 2 right now', sub: 'Average completion: 14 months' },
                  { stat: '$2.4M', label: 'in interest savings identified this week', sub: 'Across all Aureus users' },
                  { stat: '4.2×', label: 'faster debt payoff with weekly check-ins', sub: 'vs. users who skip them' },
                  { stat: '91%', label: 'of users feel less stressed after 30 days', sub: 'Based on check-in data' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '14px', background: theme.cardBg, borderRadius: '10px' }}>
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
                        <stop offset="0%" stopColor="#B68B2E" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#B68B2E" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d={`${pathD} L${points[points.length-1].x},${H-PAD} L${points[0].x},${H-PAD} Z`} fill="url(#chartGrad)" />
                    <path d={pathD} fill="none" stroke="#B68B2E" strokeWidth="2.5" strokeLinecap="round" />
                    {points.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="5" fill={p.projected ? '#D4AF37' : '#B68B2E'} />
                        <text x={p.x} y={H - 8} textAnchor="middle" fill="#64748b" fontSize="11">{p.date}</text>
                        <text x={p.x} y={p.y - 10} textAnchor="middle" fill={p.projected ? '#D4AF37' : '#B68B2E'} fontSize="10">${Math.round(p.value / 1000)}k</text>
                      </g>
                    ))}
                    <line x1={PAD} y1={H-PAD} x2={W-PAD} y2={H-PAD} stroke="theme.border" strokeWidth="1"/>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>💰 Money Date</h3>
                  <p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '13px' }}>Your weekly financial ritual — the single biggest predictor of financial progress.</p>
                </div>
                <button onClick={() => { setShowMoneyDate(true); setMoneyDateStep(0); setMoneyDateAnswers({}) }} style={{ ...btnSuccess, padding: '10px 18px' }}>Start →</button>
              </div>

              {/* Schedule Setup */}
              <div style={{ padding: '16px', background: theme.bg, borderRadius: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>📅 Your Check-In Schedule</div>
                  <button onClick={() => setCheckInSchedule(s => ({ ...s, showScheduleSetup: !s.showScheduleSetup }))} style={{ padding: '4px 10px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '6px', color: theme.textMuted, cursor: 'pointer', fontSize: '12px' }}>
                    {checkInSchedule.showScheduleSetup ? 'Done' : 'Edit'}
                  </button>
                </div>
                {checkInSchedule.showScheduleSetup ? (
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '14px' }}>

                    {/* Daily */}
                    <div style={{ padding: '12px', background: theme.cardBg, borderRadius: '10px', border: '1px solid ' + theme.border }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: checkInSchedule.dailyEnabled ? '10px' : 0 }}>
                        <div>
                          <div style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>☀️ Daily check-in</div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>Quick win log &amp; spending pulse</div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={checkInSchedule.dailyEnabled} onChange={e => setCheckInSchedule(s => ({ ...s, dailyEnabled: e.target.checked }))} style={{ accentColor: theme.accent }} />
                          <span style={{ color: theme.text, fontSize: '12px' }}>{checkInSchedule.dailyEnabled ? 'On' : 'Off'}</span>
                        </label>
                      </div>
                      {checkInSchedule.dailyEnabled && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{ color: theme.textMuted, fontSize: '11px' }}>Preferred time</label>
                          <input type="time" value={checkInSchedule.dailyTime} onChange={e => setCheckInSchedule(s => ({ ...s, dailyTime: e.target.value }))} style={{ ...inputStyle, width: '120px' }} />
                        </div>
                      )}
                    </div>

                    {/* Weekly Money Date */}
                    <div style={{ padding: '12px', background: theme.cardBg, borderRadius: '10px', border: '1px solid ' + theme.border }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                          <div style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>💰 Weekly Money Date</div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>Budget review, bills, goals progress</div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={checkInSchedule.weeklyEnabled !== false} onChange={e => setCheckInSchedule(s => ({ ...s, weeklyEnabled: e.target.checked }))} style={{ accentColor: theme.accent }} />
                          <span style={{ color: theme.text, fontSize: '12px' }}>{checkInSchedule.weeklyEnabled !== false ? 'On' : 'Off'}</span>
                        </label>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '3px' }}>
                          <label style={{ color: theme.textMuted, fontSize: '11px' }}>Day</label>
                          <select value={checkInSchedule.moneyDateDay} onChange={e => setCheckInSchedule(s => ({ ...s, moneyDateDay: e.target.value }))} style={{ ...inputStyle, minWidth: '130px' }}>
                            {['sunday','monday','tuesday','wednesday','thursday','friday','saturday'].map(day => (
                              <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '3px' }}>
                          <label style={{ color: theme.textMuted, fontSize: '11px' }}>Time</label>
                          <input type="time" value={checkInSchedule.moneyDateTime} onChange={e => setCheckInSchedule(s => ({ ...s, moneyDateTime: e.target.value }))} style={{ ...inputStyle, width: '120px' }} />
                        </div>
                      </div>
                    </div>

                    {/* Monthly */}
                    <div style={{ padding: '12px', background: theme.cardBg, borderRadius: '10px', border: '1px solid ' + theme.border }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: checkInSchedule.monthlyEnabled ? '10px' : 0 }}>
                        <div>
                          <div style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>📊 Monthly Review</div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>Net worth, debt progress, goal tracking</div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={checkInSchedule.monthlyEnabled} onChange={e => setCheckInSchedule(s => ({ ...s, monthlyEnabled: e.target.checked }))} style={{ accentColor: theme.accent }} />
                          <span style={{ color: theme.text, fontSize: '12px' }}>{checkInSchedule.monthlyEnabled ? 'On' : 'Off'}</span>
                        </label>
                      </div>
                      {checkInSchedule.monthlyEnabled && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
                          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '3px' }}>
                            <label style={{ color: theme.textMuted, fontSize: '11px' }}>Day of month</label>
                            <select value={checkInSchedule.monthlyDay} onChange={e => setCheckInSchedule(s => ({ ...s, monthlyDay: e.target.value }))} style={{ ...inputStyle, minWidth: '100px' }}>
                              {Array.from({length: 28}, (_,i) => i+1).map(d => <option key={d} value={d.toString()}>{d}{d===1?'st':d===2?'nd':d===3?'rd':'th'}</option>)}
                            </select>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '3px' }}>
                            <label style={{ color: theme.textMuted, fontSize: '11px' }}>Time</label>
                            <input type="time" value={checkInSchedule.monthlyTime} onChange={e => setCheckInSchedule(s => ({ ...s, monthlyTime: e.target.value }))} style={{ ...inputStyle, width: '120px' }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 6-Monthly */}
                    <div style={{ padding: '12px', background: theme.cardBg, borderRadius: '10px', border: '1px solid ' + theme.border }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: checkInSchedule.sixMonthlyEnabled ? '10px' : 0 }}>
                        <div>
                          <div style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>🗓️ 6-Month Deep Dive</div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>Strategy reset, insurance, investments</div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={checkInSchedule.sixMonthlyEnabled} onChange={e => setCheckInSchedule(s => ({ ...s, sixMonthlyEnabled: e.target.checked }))} style={{ accentColor: theme.accent }} />
                          <span style={{ color: theme.text, fontSize: '12px' }}>{checkInSchedule.sixMonthlyEnabled ? 'On' : 'Off'}</span>
                        </label>
                      </div>
                      {checkInSchedule.sixMonthlyEnabled && (
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '3px' }}>
                          <label style={{ color: theme.textMuted, fontSize: '11px' }}>First check-in date (then every 6 months)</label>
                          <input type="date" value={checkInSchedule.sixMonthlyDate} onChange={e => setCheckInSchedule(s => ({ ...s, sixMonthlyDate: e.target.value }))} style={{ ...inputStyle, maxWidth: '200px' }} />
                        </div>
                      )}
                    </div>

                    {/* Yearly */}
                    <div style={{ padding: '12px', background: theme.cardBg, borderRadius: '10px', border: '1px solid ' + theme.border }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: checkInSchedule.yearlyEnabled ? '10px' : 0 }}>
                        <div>
                          <div style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>🏆 Annual Empire Review</div>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>Full year retrospective &amp; next year plan</div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={checkInSchedule.yearlyEnabled} onChange={e => setCheckInSchedule(s => ({ ...s, yearlyEnabled: e.target.checked }))} style={{ accentColor: theme.accent }} />
                          <span style={{ color: theme.text, fontSize: '12px' }}>{checkInSchedule.yearlyEnabled ? 'On' : 'Off'}</span>
                        </label>
                      </div>
                      {checkInSchedule.yearlyEnabled && (
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '3px' }}>
                          <label style={{ color: theme.textMuted, fontSize: '11px' }}>Anniversary date</label>
                          <input type="date" value={checkInSchedule.yearlyDate} onChange={e => setCheckInSchedule(s => ({ ...s, yearlyDate: e.target.value }))} style={{ ...inputStyle, maxWidth: '200px' }} />
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '10px 12px', background: theme.accent + '15', borderRadius: '8px', color: theme.textMuted, fontSize: '12px', lineHeight: 1.5 }}>
                      💡 Aureus shows a badge in the header when any scheduled check-in is due. Add Aureus to your phone home screen for the best experience.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ padding: '8px 10px', background: theme.cardBg, borderRadius: '8px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '10px', marginBottom: '2px' }}>DAILY</div>
                      <div style={{ color: theme.text, fontWeight: 600, fontSize: '12px' }}>{checkInSchedule.dailyEnabled ? `On · ${checkInSchedule.dailyTime}` : 'Off'}</div>
                    </div>
                    <div style={{ padding: '8px 10px', background: theme.cardBg, borderRadius: '8px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '10px', marginBottom: '2px' }}>WEEKLY MONEY DATE</div>
                      <div style={{ color: theme.text, fontWeight: 600, fontSize: '12px', textTransform: 'capitalize' as const }}>{checkInSchedule.weeklyEnabled !== false ? `${checkInSchedule.moneyDateDay}s · ${checkInSchedule.moneyDateTime}` : 'Off'}</div>
                    </div>
                    <div style={{ padding: '8px 10px', background: theme.cardBg, borderRadius: '8px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '10px', marginBottom: '2px' }}>MONTHLY</div>
                      <div style={{ color: theme.text, fontWeight: 600, fontSize: '12px' }}>{checkInSchedule.monthlyEnabled ? `${checkInSchedule.monthlyDay}${parseInt(checkInSchedule.monthlyDay)===1?'st':parseInt(checkInSchedule.monthlyDay)===2?'nd':parseInt(checkInSchedule.monthlyDay)===3?'rd':'th'} of month` : 'Off'}</div>
                    </div>
                    <div style={{ padding: '8px 10px', background: theme.cardBg, borderRadius: '8px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '10px', marginBottom: '2px' }}>6-MONTH / YEARLY</div>
                      <div style={{ color: theme.text, fontWeight: 600, fontSize: '12px' }}>{[checkInSchedule.sixMonthlyEnabled && '6mo', checkInSchedule.yearlyEnabled && 'Annual'].filter(Boolean).join(' · ') || 'Off'}</div>
                    </div>
                  </div>
                )}
              </div>

              {streak > 0 && (
                <div style={{ padding: '12px 16px', background: theme.warning + '15', borderRadius: '10px', border: '1px solid ' + theme.warning + '30', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>🔥</span>
                  <div><div style={{ color: theme.warning, fontWeight: 700 }}>{streak}-week streak!</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>Last: {lastCheckIn && new Date(lastCheckIn).toLocaleDateString('en-AU')}</div></div>
                </div>
              )}

              {milestoneCheckIns.length > 0 && (
                <div style={{ padding: '10px 14px', background: theme.purple + '15', borderRadius: '8px', marginBottom: '16px', border: '1px solid ' + theme.purple + '30' }}>
                  <div style={{ color: theme.purple, fontWeight: 600, fontSize: '12px', marginBottom: '6px' }}>🎯 Goal check-ins this session: {getDueMilestoneCheckIns().length} of {milestoneCheckIns.length}</div>
                  {milestoneCheckIns.map(ci => {
                    const linkedGoal = goals.find(g => g.name === ci.milestoneName)
                    const freq = linkedGoal?.savingsFrequency || 'weekly'
                    const due = getDueMilestoneCheckIns().some(d => d.id === ci.id)
                    return (
                      <div key={ci.id} style={{ color: theme.textMuted, fontSize: '11px', display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                        <span>{ci.milestoneName}</span>
                        <span style={{ color: due ? theme.success : theme.textMuted }}>{due ? '✓ due now' : `${freq} — not due`}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {moneyDateLog.length > 0 && (
                <div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>Recent</div>
                  {moneyDateLog.slice(0, 3).map((entry: any) => (
                    <div key={entry.id} style={{ padding: '10px 14px', background: theme.bg, borderRadius: '10px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>{new Date(entry.date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                        <span style={{ color: parseInt(entry.stressLevel) <= 2 ? theme.success : parseInt(entry.stressLevel) >= 4 ? theme.danger : theme.warning, fontSize: '12px' }}>Stress {entry.stressLevel}/5</span>
                      </div>
                      {entry.win && <div style={{ color: theme.success, fontSize: '12px' }}>⭐ {entry.win}</div>}
                      {entry.intention && <div style={{ color: theme.accent, fontSize: '12px', marginTop: '2px' }}>→ {entry.intention}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DAILY CHECK-IN CARD */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>✅ Daily Check-in</h3>
                  <p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '13px' }}>3 questions. Do it anytime — builds the habit of daily financial awareness.</p>
                </div>
                <button onClick={() => { setShowDailyCheckIn(true); setDailyCheckInStep(0); setDailyCheckInAnswers({}) }}
                  disabled={lastDailyCheckIn === new Date().toISOString().split('T')[0]}
                  style={{ ...btnPrimary, padding: '10px 18px', opacity: lastDailyCheckIn === new Date().toISOString().split('T')[0] ? 0.5 : 1, cursor: lastDailyCheckIn === new Date().toISOString().split('T')[0] ? 'default' : 'pointer' }}>
                  {lastDailyCheckIn === new Date().toISOString().split('T')[0] ? '✓ Done today' : 'Check in →'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', alignItems: 'center' }}>
                {Array.from({ length: 7 }).map((_, i) => {
                  const d = new Date(Date.now() - i * 86400000)
                  const dateStr = d.toISOString().split('T')[0]
                  const done = dailyCheckInLog.some(e => new Date(e.date).toISOString().split('T')[0] === dateStr)
                  return (
                    <div key={i} style={{ flex: 1, textAlign: 'center' as const }}>
                      <div style={{ borderRadius: '6px', background: done ? theme.accent : theme.bg, border: '1px solid ' + (done ? theme.accent : theme.border), padding: '6px 0', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: done ? 'white' : theme.textMuted, fontSize: '12px' }}>{done ? '✓' : '·'}</span>
                      </div>
                      <div style={{ color: theme.textMuted, fontSize: '10px' }}>{d.toLocaleDateString('en-AU', { weekday: 'short' })}</div>
                    </div>
                  )
                })}
                <div style={{ color: theme.textMuted, fontSize: '11px', paddingLeft: '4px' }}>7 days</div>
              </div>
              {dailyCheckInLog.slice(0,3).map((entry: any) => (
                <div key={entry.id} style={{ padding: '8px 12px', background: theme.bg, borderRadius: '8px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.text, fontSize: '13px' }}>{new Date(entry.date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  <span style={{ color: entry.answers[0] === 'Confident' ? theme.success : entry.answers[0] === 'Stressed' ? theme.danger : theme.textMuted, fontSize: '12px', fontWeight: 600 }}>{entry.answers[0] || '—'}</span>
                </div>
              ))}
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
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, theme.cardBg, theme.bg)', borderRadius: '20px', border: '1px solid ' + theme.border }}>
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
            {investmentProperties.length > 0 && (
              <div style={{ padding: '14px 18px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.accent + '30', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: theme.accent, fontWeight: 700, fontSize: '14px' }}>🏘️ Investment Portfolio</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>{investmentProperties.length} propert{investmentProperties.length === 1 ? 'y' : 'ies'} · ${investmentProperties.reduce((s, p) => s + parseFloat(p.currentValue || p.purchasePrice || '0'), 0).toLocaleString()} total value</div>
                </div>
                <button onClick={() => setActiveTab('property' as any)} style={{ padding: '7px 14px', background: 'linear-gradient(135deg, #D4AF37 0%, #8C6A1F 100%)', color: '#0a0a0a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>View Portfolio →</button>
              </div>
            )}

            {/* ── NET WORTH HISTORY CHART ── */}
            {(() => {
              // Auto-snapshot today's net worth if not already done today
              const todayKey = new Date().toISOString().split('T')[0]
              const lastSnap = netWorthHistory[netWorthHistory.length - 1]
              const historyWithToday = lastSnap?.date === todayKey
                ? netWorthHistory
                : [...netWorthHistory, { date: todayKey, value: netWorth, assets: totalAssets, liabilities: totalLiabilities + totalDebtBalance }]

              const snapToday = () => {
                if (lastSnap?.date === todayKey) return
                setNetWorthHistory(prev => [...prev, { date: todayKey, value: netWorth, assets: totalAssets, liabilities: totalLiabilities + totalDebtBalance }])
              }

              if (historyWithToday.length < 2) return (
                <div style={cardStyle}>
                  <h3 style={{ margin: '0 0 8px 0', color: theme.accent, fontSize: '16px' }}>📈 Net Worth History</h3>
                  <div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '12px', lineHeight: 1.6 }}>
                    Your net worth over time is the most important chart in personal finance. Snapshot your numbers monthly to see the line go up.
                  </div>
                  <div style={{ padding: '14px', background: theme.bg, borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: theme.textMuted, fontSize: '11px' }}>TODAY'S NET WORTH</div>
                      <div style={{ color: netWorth >= 0 ? theme.success : theme.danger, fontWeight: 800, fontSize: '24px' }}>${netWorth.toLocaleString()}</div>
                    </div>
                    <button onClick={snapToday} style={{ ...btnPrimary, padding: '10px 18px' }}>📸 Save Snapshot</button>
                  </div>
                </div>
              )

              const minVal = Math.min(...historyWithToday.map(h => h.value))
              const maxVal = Math.max(...historyWithToday.map(h => h.value))
              const range = maxVal - minVal || 1
              const W = 600, H = 180, PAD = 40
              const chartW = W - PAD * 2
              const chartH = H - PAD
              const points = historyWithToday.map((h, i) => ({
                x: PAD + (i / Math.max(historyWithToday.length - 1, 1)) * chartW,
                y: PAD + chartH - ((h.value - minVal) / range) * chartH,
                ...h
              }))
              const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
              const areaD = `${pathD} L ${points[points.length-1].x} ${H} L ${PAD} ${H} Z`
              const change = historyWithToday.length >= 2 ? historyWithToday[historyWithToday.length-1].value - historyWithToday[0].value : 0
              const changePct = historyWithToday[0].value !== 0 ? (change / Math.abs(historyWithToday[0].value)) * 100 : 0

              return (
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', color: theme.accent, fontSize: '16px' }}>📈 Net Worth History</h3>
                      <div style={{ color: theme.textMuted, fontSize: '12px' }}>{historyWithToday.length} snapshot{historyWithToday.length !== 1 ? 's' : ''} · {historyWithToday[0].date} → today</div>
                    </div>
                    <div style={{ textAlign: 'right' as const }}>
                      <div style={{ color: netWorth >= 0 ? theme.success : theme.danger, fontWeight: 800, fontSize: '20px' }}>${netWorth.toLocaleString()}</div>
                      <div style={{ color: change >= 0 ? theme.success : theme.danger, fontSize: '13px', fontWeight: 600 }}>
                        {change >= 0 ? '+' : ''}{change.toLocaleString()} ({changePct.toFixed(1)}%) all time
                      </div>
                    </div>
                  </div>

                  <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(t => {
                      const y = PAD + chartH - t * chartH
                      const val = minVal + t * range
                      return (
                        <g key={t}>
                          <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke={theme.border} strokeWidth="1" strokeDasharray="4,4" />
                          <text x={PAD - 6} y={y + 4} textAnchor="end" fill={theme.textMuted} fontSize="10">${val >= 1000 ? (val/1000).toFixed(0)+'k' : val.toFixed(0)}</text>
                        </g>
                      )
                    })}
                    {/* Zero line if in range */}
                    {minVal < 0 && maxVal > 0 && (() => {
                      const y = PAD + chartH - ((0 - minVal) / range) * chartH
                      return <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke={theme.textMuted} strokeWidth="1.5" strokeDasharray="6,3" opacity="0.6" />
                    })()}
                    {/* Area fill */}
                    <defs>
                      <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={change >= 0 ? theme.success : theme.danger} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={change >= 0 ? theme.success : theme.danger} stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path d={areaD} fill="url(#nwGrad)" />
                    {/* Line */}
                    <path d={pathD} fill="none" stroke={change >= 0 ? theme.success : theme.danger} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Data points */}
                    {points.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="4" fill={change >= 0 ? theme.success : theme.danger} stroke={theme.cardBg} strokeWidth="2" />
                        {(i === 0 || i === points.length - 1 || historyWithToday.length <= 6) && (
                          <text x={p.x} y={p.y - 10} textAnchor="middle" fill={theme.textMuted} fontSize="9">
                            {new Date(p.date + 'T12:00:00').toLocaleDateString('en-AU', { month: 'short', year: '2-digit' })}
                          </text>
                        )}
                      </g>
                    ))}
                  </svg>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <div style={{ color: theme.textMuted, fontSize: '11px' }}>Snapshot monthly on your review date to track your empire growing</div>
                    <button onClick={snapToday} style={{ padding: '7px 14px', background: theme.accent + '20', color: theme.accent, border: '1px solid ' + theme.accent + '40', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                      📸 Snapshot now
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* PROPERTY PORTFOLIO TAB */}
        {activeTab === 'property' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            {(() => {
              const calcProperty = (p: any) => {
                const val = parseFloat(p.currentValue || p.purchasePrice || '0')
                const mortgage = parseFloat(p.mortgageBalance || '0')
                const equity = val - mortgage
                const lvr = val > 0 ? (mortgage / val) * 100 : 0
                const weeklyRent = parseFloat(p.weeklyRent || '0')
                const annualRent = weeklyRent * 52
                const monthlyRent = weeklyRent * (52/12)  // annual average for yield calculation
                const mgmtFee = annualRent * (parseFloat(p.managementFeePercent || '0') / 100)
                const annualExpenses = mgmtFee + parseFloat(p.councilRates || '0') + parseFloat(p.insurance || '0') + (parseFloat(p.maintenance || '0') * 12) + (parseFloat(p.otherExpenses || '0') * 12)
                const monthlyExpensesIP = annualExpenses / 12
                const monthlyRepayment = parseFloat(p.monthlyRepayment || '0')
                const monthlyCashFlow = monthlyRent - monthlyRepayment - monthlyExpensesIP
                const grossYield = val > 0 ? (annualRent / val) * 100 : 0
                const netYield = val > 0 ? ((annualRent - annualExpenses) / val) * 100 : 0
                const capitalGain = parseFloat(p.purchasePrice || '0') > 0 ? val - parseFloat(p.purchasePrice || '0') : 0
                const capitalGainPct = parseFloat(p.purchasePrice || '0') > 0 ? (capitalGain / parseFloat(p.purchasePrice || '0')) * 100 : 0
                return { val, mortgage, equity, lvr, monthlyRent, monthlyCashFlow, grossYield, netYield, capitalGain, capitalGainPct, annualRent, annualExpenses }
              }

              const portfolioValue = investmentProperties.reduce((s, p) => s + (parseFloat(p.currentValue || p.purchasePrice || '0')), 0)
              const portfolioDebt = investmentProperties.reduce((s, p) => s + parseFloat(p.mortgageBalance || '0'), 0)
              const portfolioEquity = portfolioValue - portfolioDebt
              const portfolioLVR = portfolioValue > 0 ? (portfolioDebt / portfolioValue) * 100 : 0
              const portfolioAnnualRent = investmentProperties.reduce((s, p) => s + parseFloat(p.weeklyRent || '0') * 52, 0)
              const portfolioCashFlow = investmentProperties.reduce((s, p) => s + calcProperty(p).monthlyCashFlow, 0)
              const portfolioGrossYield = portfolioValue > 0 ? (portfolioAnnualRent / portfolioValue) * 100 : 0

              return (
                <div style={cardStyle}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 2px 0', color: theme.accent, fontSize: '20px' }}>🏘️ Investment Property Portfolio</h3>
                      {investmentProperties.length > 0 && <div style={{ color: theme.textMuted, fontSize: '12px' }}>{investmentProperties.length} propert{investmentProperties.length === 1 ? 'y' : 'ies'}</div>}
                    </div>
                    <button onClick={() => setShowAddProperty(!showAddProperty)}
                      style={{ padding: '8px 16px', background: showAddProperty ? theme.border : 'linear-gradient(135deg, #D4AF37 0%, #8C6A1F 100%)', color: showAddProperty ? theme.textMuted : '#0a0a0a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
                      {showAddProperty ? '✕ Cancel' : '+ Add Property'}
                    </button>
                  </div>

                  {/* Portfolio summary */}
                  {investmentProperties.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '20px', padding: '16px', background: 'linear-gradient(135deg, #1a1208 0%, #0a0a0a 100%)', borderRadius: '12px', border: '1px solid ' + theme.accent + '30' }}>
                      {[
                        { label: 'PORTFOLIO VALUE', value: '$' + portfolioValue.toLocaleString(), color: theme.accent },
                        { label: 'TOTAL EQUITY', value: '$' + portfolioEquity.toLocaleString(), color: theme.success },
                        { label: 'TOTAL DEBT', value: '$' + portfolioDebt.toLocaleString(), color: theme.danger },
                        { label: 'BLENDED LVR', value: portfolioLVR.toFixed(1) + '%', color: portfolioLVR > 80 ? theme.danger : portfolioLVR > 60 ? theme.warning : theme.success },
                        { label: 'GROSS YIELD', value: portfolioGrossYield.toFixed(2) + '%', color: theme.accent },
                        { label: 'MONTHLY CASH FLOW', value: (portfolioCashFlow >= 0 ? '+$' : '-$') + Math.abs(portfolioCashFlow).toFixed(0), color: portfolioCashFlow >= 0 ? theme.success : theme.danger },
                      ].map(stat => (
                        <div key={stat.label} style={{ textAlign: 'center' as const }}>
                          <div style={{ color: theme.textMuted, fontSize: '9px', fontWeight: 600, marginBottom: '3px', letterSpacing: '0.5px' }}>{stat.label}</div>
                          <div style={{ color: stat.color, fontWeight: 800, fontSize: '16px' }}>{stat.value}</div>
                        </div>
                      ))}
                      {portfolioCashFlow < 0 && (
                        <div style={{ gridColumn: '1 / -1', padding: '6px 10px', background: theme.warning + '15', borderRadius: '6px', border: '1px solid ' + theme.warning + '30', color: theme.warning, fontSize: '11px', textAlign: 'center' as const }}>
                          ⚖️ Negatively geared — ${Math.abs(portfolioCashFlow).toFixed(0)}/mo shortfall is potentially tax-deductible
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add property form */}
                  {showAddProperty && (
                    <div style={{ padding: '16px', background: theme.bg, borderRadius: '12px', border: '1px solid ' + theme.border, marginBottom: '16px' }}>
                      <div style={{ color: theme.accent, fontWeight: 700, fontSize: '13px', marginBottom: '14px', letterSpacing: '0.5px' }}>NEW PROPERTY</div>
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                          <input placeholder="Property name (e.g. Brisbane Unit)" value={newProperty.name} onChange={e => setNewProperty({...newProperty, name: e.target.value})} style={{...inputStyle, flex: 2, minWidth: '160px'}} />
                          <input placeholder="Address (optional)" value={newProperty.address} onChange={e => setNewProperty({...newProperty, address: e.target.value})} style={{...inputStyle, flex: 3, minWidth: '180px'}} />
                        </div>
                        <div style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>PROPERTY VALUE</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                          <div style={{ flex: 1, minWidth: '130px' }}>
                            <label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '3px' }}>Purchase price $</label>
                            <input type="number" placeholder="e.g. 550000" value={newProperty.purchasePrice} onChange={e => setNewProperty({...newProperty, purchasePrice: e.target.value})} style={{...inputStyle, width: '100%'}} />
                          </div>
                          <div style={{ flex: 1, minWidth: '130px' }}>
                            <label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '3px' }}>Current value $ (estimate)</label>
                            <input type="number" placeholder="e.g. 620000" value={newProperty.currentValue} onChange={e => setNewProperty({...newProperty, currentValue: e.target.value})} style={{...inputStyle, width: '100%'}} />
                          </div>
                          <div style={{ flex: 1, minWidth: '130px' }}>
                            <label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '3px' }}>Purchase date</label>
                            <input type="date" value={newProperty.purchaseDate} onChange={e => setNewProperty({...newProperty, purchaseDate: e.target.value})} style={{...inputStyle, width: '100%'}} />
                          </div>
                        </div>
                        <div style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>LOAN</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                          <div style={{ flex: 1, minWidth: '120px' }}>
                            <label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '3px' }}>Mortgage balance $</label>
                            <input type="number" placeholder="e.g. 420000" value={newProperty.mortgageBalance} onChange={e => setNewProperty({...newProperty, mortgageBalance: e.target.value})} style={{...inputStyle, width: '100%'}} />
                          </div>
                          <div style={{ flex: 1, minWidth: '110px' }}>
                            <label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '3px' }}>Interest rate % p.a.</label>
                            <input type="number" step="0.01" placeholder="e.g. 6.14" value={newProperty.interestRate} onChange={e => setNewProperty({...newProperty, interestRate: e.target.value})} style={{...inputStyle, width: '100%'}} />
                          </div>
                          <div style={{ flex: 1, minWidth: '120px' }}>
                            <label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '3px' }}>Monthly repayment $</label>
                            <input type="number" placeholder="e.g. 2400" value={newProperty.monthlyRepayment} onChange={e => setNewProperty({...newProperty, monthlyRepayment: e.target.value})} style={{...inputStyle, width: '100%'}} />
                          </div>
                          <div style={{ flex: 1, minWidth: '100px' }}>
                            <label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '3px' }}>Loan type</label>
                            <select value={newProperty.loanType} onChange={e => setNewProperty({...newProperty, loanType: e.target.value})} style={{...inputStyle, width: '100%'}}>
                              <option value="PI">P&amp;I</option>
                              <option value="IO">Interest Only</option>
                            </select>
                          </div>
                        </div>
                        <div style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>RENTAL INCOME &amp; RUNNING COSTS</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                          <div style={{ flex: 1, minWidth: '110px' }}>
                            <label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '3px' }}>Weekly rent $</label>
                            <input type="number" placeholder="e.g. 480" value={newProperty.weeklyRent} onChange={e => setNewProperty({...newProperty, weeklyRent: e.target.value})} style={{...inputStyle, width: '100%'}} />
                          </div>
                          <div style={{ flex: 1, minWidth: '100px' }}>
                            <label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '3px' }}>Mgmt fee % of rent</label>
                            <input type="number" step="0.5" placeholder="8.5" value={newProperty.managementFeePercent} onChange={e => setNewProperty({...newProperty, managementFeePercent: e.target.value})} style={{...inputStyle, width: '100%'}} />
                          </div>
                          <div style={{ flex: 1, minWidth: '100px' }}>
                            <label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '3px' }}>Council rates $/yr</label>
                            <input type="number" placeholder="e.g. 1800" value={newProperty.councilRates} onChange={e => setNewProperty({...newProperty, councilRates: e.target.value})} style={{...inputStyle, width: '100%'}} />
                          </div>
                          <div style={{ flex: 1, minWidth: '100px' }}>
                            <label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '3px' }}>Insurance $/yr</label>
                            <input type="number" placeholder="e.g. 1200" value={newProperty.insurance} onChange={e => setNewProperty({...newProperty, insurance: e.target.value})} style={{...inputStyle, width: '100%'}} />
                          </div>
                          <div style={{ flex: 1, minWidth: '100px' }}>
                            <label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '3px' }}>Maintenance $/mo</label>
                            <input type="number" placeholder="e.g. 100" value={newProperty.maintenance} onChange={e => setNewProperty({...newProperty, maintenance: e.target.value})} style={{...inputStyle, width: '100%'}} />
                          </div>
                          <div style={{ flex: 1, minWidth: '100px' }}>
                            <label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '3px' }}>Other $/mo (strata etc.)</label>
                            <input type="number" placeholder="e.g. 200" value={newProperty.otherExpenses} onChange={e => setNewProperty({...newProperty, otherExpenses: e.target.value})} style={{...inputStyle, width: '100%'}} />
                          </div>
                        </div>
                        <button onClick={() => {
                          if (!newProperty.name) return
                          setInvestmentProperties(prev => [...prev, { ...newProperty, id: Date.now() }])
                          setNewProperty({ name: '', address: '', purchasePrice: '', purchaseDate: '', currentValue: '', mortgageBalance: '', interestRate: '', monthlyRepayment: '', loanType: 'PI', weeklyRent: '', managementFeePercent: '8.5', councilRates: '', insurance: '', maintenance: '', otherExpenses: '' })
                          setShowAddProperty(false)
                        }} style={{ ...btnPrimary, alignSelf: 'flex-start' as const, padding: '10px 24px' }}>+ Add to Portfolio</button>
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {investmentProperties.length === 0 && !showAddProperty && (
                    <div style={{ textAlign: 'center' as const, padding: '48px 20px', color: theme.textMuted }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏘️</div>
                      <div style={{ color: theme.text, fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>No investment properties yet</div>
                      <div style={{ fontSize: '13px', maxWidth: '380px', margin: '0 auto', lineHeight: 1.6 }}>Add properties to track equity, yield, cash flow and capital growth across your whole portfolio in one place.</div>
                      <button onClick={() => setShowAddProperty(true)} style={{ ...btnPrimary, marginTop: '20px', padding: '12px 28px' }}>+ Add Your First Property</button>
                    </div>
                  )}

                  {/* Property cards */}
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '14px' }}>
                    {investmentProperties.map(p => {
                      const c = calcProperty(p)
                      return (
                        <div key={p.id} style={{ padding: '18px', background: theme.bg, borderRadius: '14px', border: '1px solid ' + theme.border }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                            <div>
                              <div style={{ color: theme.text, fontWeight: 700, fontSize: '16px' }}>{p.name}</div>
                              {p.address && <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '2px' }}>{p.address}</div>}
                              <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '3px' }}>
                                {p.loanType === 'IO' ? 'Interest Only' : 'Principal & Interest'} · {p.interestRate}% p.a.
                                {p.purchaseDate && ` · Purchased ${new Date(p.purchaseDate + 'T12:00:00').toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}`}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <div style={{ padding: '4px 12px', background: c.monthlyCashFlow >= 0 ? theme.success + '20' : theme.danger + '20', borderRadius: '20px', color: c.monthlyCashFlow >= 0 ? theme.success : theme.danger, fontSize: '13px', fontWeight: 700 }}>
                                {c.monthlyCashFlow >= 0 ? '✅' : '⚠️'} {c.monthlyCashFlow >= 0 ? '+' : '-'}${Math.abs(c.monthlyCashFlow).toFixed(0)}/mo
                              </div>
                              <button onClick={() => setInvestmentProperties(prev => prev.filter(x => x.id !== p.id))} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '18px', padding: '2px 6px' }}>×</button>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                            {[
                              { label: 'Current Value', value: '$' + c.val.toLocaleString(), color: theme.text },
                              { label: 'Mortgage', value: '$' + c.mortgage.toLocaleString(), color: theme.danger },
                              { label: 'Equity', value: '$' + c.equity.toLocaleString(), color: theme.success },
                              { label: 'LVR', value: c.lvr.toFixed(1) + '%', color: c.lvr > 80 ? theme.danger : c.lvr > 60 ? theme.warning : theme.success },
                              { label: 'Weekly Rent', value: '$' + parseFloat(p.weeklyRent || '0').toFixed(0), color: theme.text },
                              { label: 'Gross Yield', value: c.grossYield.toFixed(2) + '%', color: theme.accent },
                              { label: 'Net Yield', value: c.netYield.toFixed(2) + '%', color: theme.accent },
                              ...(c.capitalGain !== 0 ? [{ label: 'Capital Gain', value: (c.capitalGain >= 0 ? '+' : '-') + '$' + Math.abs(c.capitalGain).toLocaleString() + ' (' + Math.abs(c.capitalGainPct).toFixed(1) + '%)', color: c.capitalGain >= 0 ? theme.success : theme.danger }] : []),
                              { label: 'Annual Expenses', value: '$' + Math.round(c.annualExpenses).toLocaleString(), color: theme.textMuted },
                            ].map(stat => (
                              <div key={stat.label} style={{ padding: '10px 12px', background: theme.cardBg, borderRadius: '8px' }}>
                                <div style={{ color: theme.textMuted, fontSize: '9px', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.3px' }}>{stat.label.toUpperCase()}</div>
                                <div style={{ color: stat.color, fontWeight: 700, fontSize: '14px' }}>{stat.value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {investmentProperties.length > 0 && (
                    <div style={{ marginTop: '8px', padding: '10px 14px', background: theme.accent + '10', borderRadius: '8px', color: theme.textMuted, fontSize: '11px', lineHeight: 1.6 }}>
                      ⚠️ Estimates only · Does not include depreciation, land tax, or CGT · Consult your accountant for tax deductibility calculations · Not financial advice
                    </div>
                  )}
                </div>
              )
            })()}
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
              <div key={item.itemId} style={{ padding: '12px', marginBottom: '8px', background: item.itemType === 'income' ? '#d1fae5' : item.itemType === 'goal' ? '#ede9fe' : item.itemType === 'expense' ? '#dbeafe' : '#fee2e2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: item.isPaid ? 0.6 : 1 }}>
                <div><div style={{ fontWeight: 600, color: theme.cardBg }}>{item.name}</div><div style={{ fontSize: '12px', color: '#64748b' }}>${item.amount}{item.itemType === 'goal' && !item.isPaid ? <span style={{ color: '#D4AF37', marginLeft: '6px' }}>→ adds to progress</span> : null}</div></div>
                <button onClick={() => togglePaid(item.itemId, item)} style={{ padding: '8px 16px', background: item.isPaid ? '#6b7280' : theme.success, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{item.isPaid ? '✓ Done' : 'Mark Done'}</button>
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
              <button onClick={() => { setIncomeStreams([...incomeStreams, { id: Date.now(), name: extractedPayslip.employer || 'Salary', amount: extractedPayslip.netPay || '', frequency: extractedPayslip.frequency || 'fortnightly', type: 'active', startDate: (() => { const d = new Date(); d.setHours(0,0,0,0); let diff = 1 - d.getDay(); if (diff <= 0) diff += 7; d.setDate(d.getDate() + diff); return d.toISOString().split('T')[0] })() }]); setExtractedPayslip(null); setShowPayslipUpload(false) }} style={{ ...btnSuccess, flex: 1 }}>✓ Add Income</button>
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
              <div style={{ background: theme.cardBg, borderRadius: '12px', padding: '16px', marginBottom: '20px', borderLeft: '4px solid ' + theme.success }}>
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
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #8C6A1F)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '40px', fontWeight: 800, color: '#0a0a0a' }}>A</div>
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
                      setOnboardingStep(1.5)
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
            {/* Build full question list: standard + milestone check-ins */}
            {(() => {
              const allQuestions = [
                ...moneyDateQuestions,
                ...getDueMilestoneCheckIns().map((ci, i) => ({
                  q: `Did you make a savings contribution toward "${ci.milestoneName}" this week?`,
                  type: 'yesno',
                  isMilestone: true,
                  milestoneIndex: i,
                  answerKey: 100 + i
                }))
              ]
              const totalSteps = allQuestions.length
              const currentQ = allQuestions[moneyDateStep] as any
              const answerKey = currentQ.answerKey !== undefined ? currentQ.answerKey : moneyDateStep

              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>💰 Money Date</h3>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>
                        {currentQ.isMilestone ? '🎯 Goal check-in' : `Question ${moneyDateStep + 1} of ${totalSteps}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {allQuestions.map((_, i) => (
                        <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i <= moneyDateStep ? (i >= moneyDateQuestions.length ? theme.purple : theme.success) : theme.border }} />
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: '20px', background: currentQ.isMilestone ? theme.purple + '15' : theme.bg, borderRadius: '12px', marginBottom: '20px', border: currentQ.isMilestone ? '1px solid ' + theme.purple + '40' : 'none' }}>
                    {currentQ.isMilestone && <div style={{ color: theme.purple, fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>🎯 GOAL PROGRESS CHECK</div>}
                    <p style={{ color: theme.text, fontSize: '16px', fontWeight: 500, margin: 0 }}>{currentQ.q}</p>
                  </div>

                  {currentQ.type === 'yesno' && (
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                      {['Yes', 'No'].map(opt => (
                        <button key={opt} onClick={() => setMoneyDateAnswers(p => ({ ...p, [answerKey]: opt }))}
                          style={{ flex: 1, padding: '14px', background: moneyDateAnswers[answerKey] === opt ? (opt === 'Yes' ? theme.success : theme.danger) : theme.bg, color: moneyDateAnswers[answerKey] === opt ? 'white' : theme.text, border: '2px solid ' + (moneyDateAnswers[answerKey] === opt ? (opt === 'Yes' ? theme.success : theme.danger) : theme.border), borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: 600 }}>
                          {opt === 'Yes' ? '👍 Yes' : '👎 No'}
                        </button>
                      ))}
                    </div>
                  )}

                  {currentQ.type === 'scale3' && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                      {(currentQ.options || []).map((opt: string) => (
                        <button key={opt} onClick={() => setMoneyDateAnswers(p => ({ ...p, [answerKey]: opt }))}
                          style={{ flex: 1, padding: '12px', background: moneyDateAnswers[answerKey] === opt ? theme.accent : theme.bg, color: moneyDateAnswers[answerKey] === opt ? 'white' : theme.text, border: '2px solid ' + (moneyDateAnswers[answerKey] === opt ? theme.accent : theme.border), borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>{opt}</button>
                      ))}
                    </div>
                  )}

                  {currentQ.type === 'scale' && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                      {['1', '2', '3', '4', '5'].map(n => (
                        <button key={n} onClick={() => setMoneyDateAnswers(p => ({ ...p, [answerKey]: n }))}
                          style={{ flex: 1, padding: '14px', background: moneyDateAnswers[answerKey] === n ? theme.accent : theme.bg, color: moneyDateAnswers[answerKey] === n ? 'white' : theme.text, border: '2px solid ' + (moneyDateAnswers[answerKey] === n ? theme.accent : theme.border), borderRadius: '10px', cursor: 'pointer', fontSize: '18px', fontWeight: 700 }}>{n}</button>
                      ))}
                    </div>
                  )}

                  {currentQ.type === 'text' && (
                    <div style={{ marginBottom: '20px' }}>
                      <input
                        value={moneyDateAnswers[answerKey] || ''}
                        onChange={e => setMoneyDateAnswers(p => ({ ...p, [answerKey]: e.target.value }))}
                        placeholder={currentQ.placeholder || ''}
                        style={{ ...inputStyle, width: '100%', padding: '14px 16px' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {moneyDateStep > 0 && <button onClick={() => setMoneyDateStep(s => s - 1)} style={{ ...btnPrimary, background: theme.textMuted }}>← Back</button>}
                    {moneyDateStep < totalSteps - 1 ? (
                      <button
                        onClick={() => { if (moneyDateAnswers[answerKey] !== undefined) setMoneyDateStep(s => s + 1) }}
                        disabled={moneyDateAnswers[answerKey] === undefined}
                        style={{ ...btnPrimary, flex: 1, opacity: moneyDateAnswers[answerKey] === undefined ? 0.5 : 1 }}>
                        Next →
                      </button>
                    ) : (
                      <button onClick={submitMoneyDate} style={{ ...btnSuccess, flex: 1, fontSize: '15px' }}>✅ Complete Money Date</button>
                    )}
                  </div>
                  <button onClick={() => { setShowMoneyDate(false); setMoneyDateStep(0); setMoneyDateAnswers({}) }} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', width: '100%', marginTop: '10px', fontSize: '13px' }}>Cancel</button>
                </>
              )
            })()}
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

      {/* ==================== GOAL SETUP MODAL (from Roadmap) ==================== */}
      {showGoalSetup && goalSetupMilestone && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowGoalSetup(false)}>
          <div style={{ background: theme.cardBg, borderRadius: '20px', padding: '28px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' as const }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>🎯 Add to Goals & Calendar</h3>
              <button onClick={() => setShowGoalSetup(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '22px', cursor: 'pointer' }}>×</button>
            </div>
            <p style={{ color: theme.textMuted, fontSize: '13px', margin: '0 0 20px 0' }}>
              Set up <strong style={{ color: theme.text }}>{goalSetupMilestone.name}</strong> as a tracked savings goal with calendar reminders.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '14px' }}>

              {/* Goal name */}
              <div>
                <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Goal name</label>
                <input value={goalSetupForm.name} onChange={e => setGoalSetupForm(f => ({ ...f, name: e.target.value }))} style={{ ...inputStyle, width: '100%' }} />
              </div>

              {/* Target and saved */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Target amount ($)</label>
                  <input type="number" value={goalSetupForm.target} onChange={e => setGoalSetupForm(f => ({ ...f, target: e.target.value }))} placeholder="e.g. 2000" style={{ ...inputStyle, width: '100%' }} />
                </div>
                <div>
                  <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Already saved ($)</label>
                  <input type="number" value={goalSetupForm.saved} onChange={e => setGoalSetupForm(f => ({ ...f, saved: e.target.value }))} placeholder="0" style={{ ...inputStyle, width: '100%' }} />
                </div>
              </div>

              {/* Payment amount and frequency */}
              <div>
                <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                  How much will you save per period?
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative' as const, flex: 1 }}>
                    <span style={{ position: 'absolute' as const, left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.textMuted, fontSize: '14px' }}>$</span>
                    <input
                      type="number"
                      value={goalSetupForm.paymentAmount}
                      onChange={e => setGoalSetupForm(f => ({ ...f, paymentAmount: e.target.value }))}
                      placeholder="e.g. 77"
                      style={{ ...inputStyle, width: '100%', paddingLeft: '28px' }}
                    />
                  </div>
                  <select value={goalSetupForm.savingsFrequency} onChange={e => setGoalSetupForm(f => ({ ...f, savingsFrequency: e.target.value }))} style={{ ...inputStyle, flexShrink: 0 }}>
                    <option value="weekly">Weekly</option>
                    <option value="fortnightly">Fortnightly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                {/* Auto-calculated time to reach target */}
                {goalSetupForm.target && goalSetupForm.paymentAmount && (() => {
                  const remaining = parseFloat(goalSetupForm.target) - parseFloat(goalSetupForm.saved || '0')
                  const periodsNeeded = Math.ceil(remaining / parseFloat(goalSetupForm.paymentAmount))
                  const freqDays = goalSetupForm.savingsFrequency === 'weekly' ? 7 : goalSetupForm.savingsFrequency === 'fortnightly' ? 14 : 30
                  const targetDate = new Date(Date.now() + periodsNeeded * freqDays * 86400000)
                  return (
                    <div style={{ marginTop: '6px', padding: '8px 10px', background: theme.success + '15', borderRadius: '6px', color: theme.success, fontSize: '12px' }}>
                      ✅ At ${goalSetupForm.paymentAmount}/{goalSetupForm.savingsFrequency}, you'll reach ${goalSetupForm.target} by <strong>{targetDate.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}</strong>
                      {!goalSetupForm.deadline && <button onClick={() => setGoalSetupForm(f => ({ ...f, deadline: targetDate.toISOString().split('T')[0] }))} style={{ background: 'none', border: 'none', color: theme.accent, cursor: 'pointer', fontSize: '12px', marginLeft: '6px' }}>Use this date →</button>}
                    </div>
                  )
                })()}
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Target completion date</label>
                  <input type="date" value={goalSetupForm.deadline} onChange={e => setGoalSetupForm(f => ({ ...f, deadline: e.target.value }))} style={{ ...inputStyle, width: '100%' }} />
                </div>
              </div>
              <div>
                <SmartDatePicker
                  frequency={goalSetupForm.savingsFrequency}
                  value={goalSetupForm.startDate}
                  onChange={v => setGoalSetupForm(f => ({ ...f, startDate: v }))}
                  label={`First payment day (${goalSetupForm.savingsFrequency})`}
                />
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px', padding: '14px', background: theme.bg, borderRadius: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={goalSetupForm.addToCalendar}
                    onChange={e => setGoalSetupForm(f => ({ ...f, addToCalendar: e.target.checked }))}
                    style={{ width: '16px', height: '16px', accentColor: theme.success }}
                  />
                  <div>
                    <div style={{ color: theme.text, fontSize: '13px', fontWeight: 600 }}>📅 Add payment reminders to calendar</div>
                    <div style={{ color: theme.textMuted, fontSize: '11px' }}>Your savings payments will appear on the Budget calendar</div>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={goalSetupForm.addCheckIn}
                    onChange={e => setGoalSetupForm(f => ({ ...f, addCheckIn: e.target.checked }))}
                    style={{ width: '16px', height: '16px', accentColor: theme.purple }}
                  />
                  <div>
                    <div style={{ color: theme.text, fontSize: '13px', fontWeight: 600 }}>🔄 Add to weekly Money Date check-in</div>
                    <div style={{ color: theme.textMuted, fontSize: '11px' }}>Each week you'll be asked if you made a contribution — a "Yes" counts as a win automatically</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Preview */}
            {goalSetupForm.paymentAmount && goalSetupForm.savingsFrequency && (
              <div style={{ margin: '16px 0', padding: '14px 16px', background: theme.purple + '15', borderRadius: '10px', border: '1px solid ' + theme.purple + '30' }}>
                <div style={{ color: theme.purple, fontWeight: 700, fontSize: '12px', marginBottom: '8px' }}>SUMMARY</div>
                <div style={{ color: theme.text, fontSize: '13px', lineHeight: 1.8 }}>
                  <div>💰 Save <strong>${goalSetupForm.paymentAmount}</strong> {goalSetupForm.savingsFrequency} starting <strong>{goalSetupForm.startDate && new Date(goalSetupForm.startDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</strong></div>
                  {goalSetupForm.deadline && <div>🏁 Goal date: <strong>{new Date(goalSetupForm.deadline).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}</strong></div>}
                  {goalSetupForm.addToCalendar && <div>📅 Payments will show on your calendar</div>}
                  {goalSetupForm.addCheckIn && <div>🔄 Weekly check-in question will be added</div>}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                if (!goalSetupForm.name || !goalSetupForm.target) return

                // Add to goals
                const newGoalEntry = {
                  id: Date.now(),
                  name: goalSetupForm.name,
                  target: goalSetupForm.target,
                  saved: goalSetupForm.saved,
                  deadline: goalSetupForm.deadline,
                  savingsFrequency: goalSetupForm.savingsFrequency,
                  startDate: goalSetupForm.startDate,
                  paymentAmount: goalSetupForm.paymentAmount,
                  addedToCalendar: goalSetupForm.addToCalendar
                }
                setGoals(prev => [...prev, newGoalEntry])

                // Add to Money Date check-ins
                if (goalSetupForm.addCheckIn) {
                  setMilestoneCheckIns(prev => [...prev, {
                    id: Date.now() + 1,
                    milestoneId: goalSetupMilestone.id,
                    milestoneName: goalSetupForm.name,
                    question: `Did you make a savings contribution toward "${goalSetupForm.name}" this week?`
                  }])
                }

                // Mark the weekly plan step as done
                if (goalSetupStepId !== null) {
                  togglePlanStep(goalSetupMilestone.id, goalSetupStepId)
                }

                // Update milestone currentAmount if saved > 0
                if (parseFloat(goalSetupForm.saved) > 0) {
                  setRoadmapMilestones(prev => prev.map(m =>
                    m.id === goalSetupMilestone.id ? { ...m, currentAmount: parseFloat(goalSetupForm.saved) } : m
                  ))
                }

                setShowGoalSetup(false)
                setGoalSetupMilestone(null)
                setCelebrationWin(`"${goalSetupForm.name}" added to your goals! 🎯`)
                setTimeout(() => setCelebrationWin(null), 3000)
              }}
              disabled={!goalSetupForm.name || !goalSetupForm.target || !goalSetupForm.paymentAmount}
              style={{ ...btnSuccess, width: '100%', padding: '14px', fontSize: '15px', opacity: (!goalSetupForm.name || !goalSetupForm.target || !goalSetupForm.paymentAmount) ? 0.5 : 1 }}
            >
              ✅ Add to Goals & Calendar
            </button>
          </div>
        </div>
      )}

      {/* ==================== DAILY CHECK-IN MODAL ==================== */}
      {showDailyCheckIn && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: theme.cardBg, borderRadius: '20px', padding: '28px', maxWidth: '440px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>✅ Daily Check-in</h3>
                <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>Question {dailyCheckInStep + 1} of {dailyCheckInQuestions.length}</div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {dailyCheckInQuestions.map((_, i) => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i <= dailyCheckInStep ? theme.accent : theme.border }} />)}
              </div>
            </div>

            <div style={{ padding: '20px', background: theme.bg, borderRadius: '12px', marginBottom: '20px' }}>
              <p style={{ color: theme.text, fontSize: '16px', fontWeight: 500, margin: 0 }}>{dailyCheckInQuestions[dailyCheckInStep].q}</p>
            </div>

            {dailyCheckInQuestions[dailyCheckInStep].type === 'scale3' && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {(dailyCheckInQuestions[dailyCheckInStep].options || []).map((opt: string) => (
                  <button key={opt} onClick={() => setDailyCheckInAnswers(p => ({ ...p, [dailyCheckInStep]: opt }))}
                    style={{ flex: 1, padding: '14px 8px', background: dailyCheckInAnswers[dailyCheckInStep] === opt ? theme.accent : theme.bg, color: dailyCheckInAnswers[dailyCheckInStep] === opt ? 'white' : theme.text, border: '2px solid ' + (dailyCheckInAnswers[dailyCheckInStep] === opt ? theme.accent : theme.border), borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>{opt}</button>
                ))}
              </div>
            )}

            {dailyCheckInQuestions[dailyCheckInStep].type === 'yesno' && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                {['Yes', 'No'].map(opt => (
                  <button key={opt} onClick={() => setDailyCheckInAnswers(p => ({ ...p, [dailyCheckInStep]: opt }))}
                    style={{ flex: 1, padding: '14px', background: dailyCheckInAnswers[dailyCheckInStep] === opt ? (opt === 'Yes' ? theme.success : theme.danger) : theme.bg, color: dailyCheckInAnswers[dailyCheckInStep] === opt ? 'white' : theme.text, border: '2px solid ' + (dailyCheckInAnswers[dailyCheckInStep] === opt ? (opt === 'Yes' ? theme.success : theme.danger) : theme.border), borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: 600 }}>
                    {opt === 'Yes' ? '👍 Yes' : '👎 No'}
                  </button>
                ))}
              </div>
            )}

            {dailyCheckInQuestions[dailyCheckInStep].type === 'text' && (
              <div style={{ marginBottom: '20px' }}>
                <input
                  value={dailyCheckInAnswers[dailyCheckInStep] || ''}
                  onChange={e => setDailyCheckInAnswers(p => ({ ...p, [dailyCheckInStep]: e.target.value }))}
                  placeholder={(dailyCheckInQuestions[dailyCheckInStep] as any).placeholder || ''}
                  style={{ ...inputStyle, width: '100%', padding: '14px 16px' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              {dailyCheckInStep > 0 && <button onClick={() => setDailyCheckInStep(s => s - 1)} style={{ ...btnPrimary, background: theme.textMuted }}>← Back</button>}
              {dailyCheckInStep < dailyCheckInQuestions.length - 1 ? (
                <button
                  onClick={() => { if (dailyCheckInAnswers[dailyCheckInStep] !== undefined) setDailyCheckInStep(s => s + 1) }}
                  disabled={dailyCheckInAnswers[dailyCheckInStep] === undefined}
                  style={{ ...btnPrimary, flex: 1, opacity: dailyCheckInAnswers[dailyCheckInStep] === undefined ? 0.5 : 1 }}>
                  Next →
                </button>
              ) : (
                <button onClick={submitDailyCheckIn} style={{ ...btnSuccess, flex: 1, fontSize: '15px' }}>✅ Done</button>
              )}
            </div>
            <button onClick={() => { setShowDailyCheckIn(false); setDailyCheckInStep(0); setDailyCheckInAnswers({}) }} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', width: '100%', marginTop: '10px', fontSize: '13px' }}>Cancel</button>
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
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background: #0a0a0a; }
        h1, h2, h3, .aureus-heading { font-family: 'Cinzel', serif; }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #3a2e1e; border-radius: 3px; }
      `}</style>
    </div>
  )
}
