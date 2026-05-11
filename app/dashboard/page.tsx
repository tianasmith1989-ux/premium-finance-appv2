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
  const [missionStep, setMissionStep] = useState<0 | 1 | 2 | 3 | 4>(0)
  const [missionComplete, setMissionComplete] = useState(false)
  const [missionP2Step, setMissionP2Step] = useState<'analyse' | 'propose' | 'confirm' | 'plan'>('analyse')
  const [missionP2Loading, setMissionP2Loading] = useState(false)
  const [missionP2Proposals, setMissionP2Proposals] = useState<any[]>([])
  const [missionP2Confirmed, setMissionP2Confirmed] = useState<boolean[]>([])
  const [missionNavLocked, setMissionNavLocked] = useState(true)
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

  // ==================== COACH TRIGGER ENGINE ====================
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

  // Goal Setup Modal (triggered from roadmap weekly plan)
  const [showGoalSetup, setShowGoalSetup] = useState(false)
  const [goalSetupMilestone, setGoalSetupMilestone] = useState<any>(null)
  const [goalSetupStepId, setGoalSetupStepId] = useState<number | null>(null)
  const [goalSetupForm, setGoalSetupForm] = useState({
    name: '', target: '', saved: '0', paymentAmount: '',
    savingsFrequency: 'weekly', startDate: new Date().toISOString().split('T')[0],
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
    // ==================== SMART DATE HELPERS (FIXED) ====================
  
  // Get the next date for a specific day-of-week (0-6, Sunday=0 to Saturday=6)
  const getNextDateForDayOfWeek = (dayOfWeek: number): string => {
    const from = new Date()
    from.setHours(0, 0, 0, 0)
    
    let diff = dayOfWeek - from.getDay()
    if (diff <= 0) diff += 7
    
    const target = new Date(from)
    target.setDate(from.getDate() + diff)
    
    return target.toISOString().split('T')[0]
  }

  // For fortnightly: get the next payment date based on anchor day of month
  const getFortnightlyDateFromAnchor = (anchorDayOfMonth: number): string => {
    const from = new Date()
    from.setHours(0, 0, 0, 0)
    
    let target = new Date(from.getFullYear(), from.getMonth(), anchorDayOfMonth)
    
    if (target < from) {
      target = new Date(from.getFullYear(), from.getMonth() + 1, anchorDayOfMonth)
    }
    
    // Handle invalid dates (e.g., 31st in Feb)
    if (target.getMonth() !== (from.getMonth() + (target < from ? 1 : 0)) % 12) {
      target = new Date(from.getFullYear(), from.getMonth() + 1, 1)
    }
    
    return target.toISOString().split('T')[0]
  }

  // For monthly/quarterly/yearly: get next date for a specific day of month
  const getNextDateForDayOfMonth = (dayOfMonth: number, frequency: string): string => {
    const from = new Date()
    from.setHours(0, 0, 0, 0)
    
    let target = new Date(from.getFullYear(), from.getMonth(), dayOfMonth)
    
    if (target < from) {
      if (frequency === 'monthly') {
        target = new Date(from.getFullYear(), from.getMonth() + 1, dayOfMonth)
      } else if (frequency === 'quarterly') {
        target = new Date(from.getFullYear(), from.getMonth() + 3, dayOfMonth)
      } else if (frequency === 'yearly') {
        target = new Date(from.getFullYear() + 1, from.getMonth(), dayOfMonth)
      } else {
        target = new Date(from.getFullYear(), from.getMonth() + 1, dayOfMonth)
      }
    }
    
    // Handle invalid dates
    if (target.getMonth() !== (from.getMonth() + (target < from ? (frequency === 'monthly' ? 1 : frequency === 'quarterly' ? 3 : frequency === 'yearly' ? 12 : 1) : 0)) % 12) {
      target = new Date(from.getFullYear(), from.getMonth() + 1, 1)
    }
    
    return target.toISOString().split('T')[0]
  }

  const getDayOfWeekFromDate = (dateStr: string): number => {
    if (!dateStr) return new Date().getDay()
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return new Date().getDay()
      return d.getDay()
    } catch { return new Date().getDay() }
  }

  const getDayOfMonthFromDate = (dateStr: string): number => {
    if (!dateStr) return 1
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return 1
      return d.getDate()
    } catch { return 1 }
  }

  const DOW_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const DOW_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const ordinal = (n: number) => {
    if (n === 1 || n === 21 || n === 31) return `${n}st`
    if (n === 2 || n === 22) return `${n}nd`
    if (n === 3 || n === 23) return `${n}rd`
    return `${n}th`
  }

  const SmartDatePicker = ({
    frequency, value, onChange, label
  }: {
    frequency: string
    value: string
    onChange: (v: string) => void
    label?: string
  }) => {
    // --- ONCE: plain date input ---
    if (frequency === 'once') {
      return (
        <div>
          {label && <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>{label}</label>}
          <input 
            type="date" 
            value={value || ''} 
            onChange={e => onChange(e.target.value)}
            style={{ ...inputStyle, width: '100%' }} 
          />
        </div>
      )
    }

    // --- WEEKLY: day-of-week buttons ---
    if (frequency === 'weekly') {
      const selectedDow = value ? getDayOfWeekFromDate(value) : new Date().getDay()

      return (
        <div>
          {label && <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '6px' }}>{label}</label>}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' as const }}>
            {DOW_SHORT.map((d, i) => {
              const isSelected = selectedDow === i
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    const newDate = getNextDateForDayOfWeek(i)
                    onChange(newDate)
                  }}
                  style={{
                    padding: '8px 11px',
                    background: isSelected ? theme.accent : theme.bg,
                    color: isSelected ? 'white' : theme.textMuted,
                    border: '2px solid ' + (isSelected ? theme.accent : theme.border),
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : 400,
                    transition: 'all 0.15s'
                  }}>
                  {d}
                </button>
              )
            })}
          </div>
          <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '6px' }}>
            {value && selectedDow !== undefined
              ? `Every ${DOW_FULL[selectedDow]} · next: ${new Date(value).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
              : `Pick a day above`}
          </div>
        </div>
      )
    }

    // --- FORTNIGHTLY: day-of-month picker ---
    if (frequency === 'fortnightly') {
      const selectedDom = value ? getDayOfMonthFromDate(value) : 1

      return (
        <div>
          {label && <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '6px' }}>{label}</label>}
          <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '8px', background: theme.purple + '15', padding: '6px 10px', borderRadius: '6px' }}>
            💡 Pick the day of the month you get paid. Example: pick "1" → paid on 1st and 15th
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' as const, alignItems: 'center' }}>
            {[1, 2, 5, 7, 10, 14, 15, 20, 21, 25, 28].map(d => {
              const isSelected = selectedDom === d
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    const newDate = getFortnightlyDateFromAnchor(d)
                    onChange(newDate)
                  }}
                  style={{
                    padding: '8px 10px',
                    background: isSelected ? theme.purple : theme.bg,
                    color: isSelected ? 'white' : theme.textMuted,
                    border: '2px solid ' + (isSelected ? theme.purple : theme.border),
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : 400,
                    transition: 'all 0.15s'
                  }}>
                  {d}
                </button>
              )
            })}
            <span style={{ color: theme.textMuted, fontSize: '11px', margin: '0 2px' }}>or</span>
            <input
              type="number" min="1" max="31"
              value={selectedDom}
              onChange={e => {
                const d = parseInt(e.target.value)
                if (d >= 1 && d <= 31) {
                  const newDate = getFortnightlyDateFromAnchor(d)
                  onChange(newDate)
                }
              }}
              style={{ ...inputStyle, width: '65px', padding: '7px 8px', fontSize: '13px' }}
            />
          </div>
          <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '6px' }}>
            {value && selectedDom
              ? `Every second ${ordinal(selectedDom)} · next: ${new Date(value).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
              : `Pick a day above`}
          </div>
        </div>
      )
    }

    // --- MONTHLY / QUARTERLY / YEARLY: day-of-month buttons ---
    if (frequency === 'monthly' || frequency === 'quarterly' || frequency === 'yearly') {
      const selectedDom = value ? getDayOfMonthFromDate(value) : 1
      const freqLabel = frequency === 'monthly' ? 'Every month' : frequency === 'quarterly' ? 'Every 3 months' : 'Every year'

      return (
        <div>
          {label && <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '6px' }}>{label}</label>}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' as const, alignItems: 'center' }}>
            {[1, 2, 5, 7, 10, 14, 15, 20, 21, 25, 28].map(d => {
              const isSelected = selectedDom === d
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    const newDate = getNextDateForDayOfMonth(d, frequency)
                    onChange(newDate)
                  }}
                  style={{
                    padding: '8px 10px',
                    background: isSelected ? theme.warning : theme.bg,
                    color: isSelected ? 'white' : theme.textMuted,
                    border: '2px solid ' + (isSelected ? theme.warning : theme.border),
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : 400,
                    transition: 'all 0.15s'
                  }}>
                  {d}
                </button>
              )
            })}
            <span style={{ color: theme.textMuted, fontSize: '11px', margin: '0 2px' }}>or</span>
            <input
              type="number" min="1" max="31"
              value={selectedDom}
              onChange={e => {
                const d = parseInt(e.target.value)
                if (d >= 1 && d <= 31) {
                  const newDate = getNextDateForDayOfMonth(d, frequency)
                  onChange(newDate)
                }
              }}
              style={{ ...inputStyle, width: '65px', padding: '7px 8px', fontSize: '13px' }}
            />
          </div>
          <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '6px' }}>
            {value && selectedDom
              ? `${freqLabel} on the ${ordinal(selectedDom)} · next: ${new Date(value).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`
              : `Pick a day of the month`}
          </div>
        </div>
      )
    }

    return null
  }
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
      if (data.missionPhase) setMissionPhase(data.missionPhase)
      if (data.missionStep !== undefined) setMissionStep(data.missionStep)
      if (data.missionComplete) setMissionComplete(data.missionComplete)
      if (data.missionNavLocked !== undefined) setMissionNavLocked(data.missionNavLocked)
      if (data.missionP2Proposals) setMissionP2Proposals(data.missionP2Proposals)
      if (data.missionP2Confirmed) setMissionP2Confirmed(data.missionP2Confirmed)
      if (data.missionP2Step) setMissionP2Step(data.missionP2Step)
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
      if (!data.onboardingComplete) setShowOnboarding(true)
      if (data.budgetOnboarding) setBudgetOnboarding(data.budgetOnboarding)
      if (data.chatMessages) setChatMessages(data.chatMessages)
      if (data.userCountry) setUserCountry(data.userCountry)
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
      wins, streak, lastCheckIn, whyStatement, mortgageAccel, documents, milestoneCheckIns,
      checkInSchedule, lastDailyCheckIn, dailyCheckInLog,
      coachNextAction, dismissedTriggers, lastAppOpen,
      missionPhase, missionStep, missionComplete, missionNavLocked,
      missionP2Proposals, missionP2Confirmed, missionP2Step,
      moneyPersonality, identityStatements, deepWhyAnswers, deepWhyComplete,
      fearAuditAnswers, fearAuditComplete, onboardingComplete, proactiveInsights,
      insightsGeneratedAt, oneDecision, oneDecisionDate, latteItems, moneyDateLog,
      annualReviews, superData, netWorthHistory, personalityAnswers
    }
    localStorage.setItem('aureus_data', JSON.stringify(data))
  }, [incomeStreams, expenses, debts, goals, assets, liabilities, budgetMemory, paidOccurrences, roadmapMilestones, budgetOnboarding, chatMessages, userCountry, wins, streak, lastCheckIn, whyStatement, mortgageAccel, documents, milestoneCheckIns, checkInSchedule, lastDailyCheckIn, dailyCheckInLog, coachNextAction, dismissedTriggers, lastAppOpen, missionPhase, missionStep, missionComplete, missionNavLocked, missionP2Proposals, missionP2Confirmed, missionP2Step, moneyPersonality, identityStatements, deepWhyAnswers, deepWhyComplete, fearAuditAnswers, fearAuditComplete, onboardingComplete, proactiveInsights, insightsGeneratedAt, oneDecision, oneDecisionDate, latteItems, moneyDateLog, annualReviews, superData, netWorthHistory, personalityAnswers])

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

  // ==================== MORTGAGE ACCELERATOR CALCULATION ====================
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

    let repayment = parseFloat(mortgageAccel.currentRepayment || '0')
    const derivedRepayment = remainingYears > 0 ? calcStandardRepayment(balance, annualRate, remainingYears, freq) : 0

    if (repayment <= 0 && derivedRepayment > 0) repayment = derivedRepayment
    if (repayment <= 0) return null

    const periodRate = annualRate / freq
    const effectiveBalance = Math.max(balance - offset, 0)

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

  // ==================== AUTO WIN DETECTION ====================
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

    if (item?.itemType === 'goal' && item?.paymentAmount) {
      const paymentAmount = parseFloat(item.paymentAmount || '0')
      if (paymentAmount <= 0) return

      const matchId = item.goalId || item.id
      setGoals(prev => prev.map(g => {
        if (g.id !== matchId) return g
        const currentSaved = parseFloat(g.saved || '0')
        const newSaved = wasAlreadyPaid
          ? Math.max(0, currentSaved - paymentAmount)
          : currentSaved + paymentAmount
        return { ...g, saved: newSaved.toFixed(2) }
      }))

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

  const [homeCalcState, setHomeCalcState] = useState('QLD')
  const [homeCalcFirstHome, setHomeCalcFirstHome] = useState(true)
  const [homeCalcNewBuild, setHomeCalcNewBuild] = useState(false)
  const [homeBuyingPrice, setHomeBuyingPrice] = useState('')

  // ==================== WEEKLY PLAN GENERATOR ====================
  const generateWeeklyPlan = async (milestoneId: number) => {
    const milestone = roadmapMilestones.find(m => m.id === milestoneId)
    if (!milestone) return
    const isDebtMilestone = /debt|credit card|bnpl|loan|pay off|kill bad/i.test(milestone.name) || /debt|credit card|bnpl|loan/i.test(milestone.notes || '')
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
- Day 5 MUST always be: ${isDebtMilestone ? '"Add this debt to the Debts section in Aureus with the balance, interest rate, and minimum payment so it tracks your payoff progress automatically."' : '"Add this goal to your Aureus savings goals with your target amount and a weekly payment amount, then enable it on the calendar for visual tracking and reminders."'}
- Start directly with "Day 1:"${getPersonalityCoachingContext()}`,
          financialData: { income: incomeStreams, expenses, debts, goals, assets, liabilities },
          memory: budgetMemory,
          countryConfig: currentCountryConfig
        })
      })
      const data = await response.json()
      const rawText: string = data.message || data.advice || data.raw || ''
      const lines = rawText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0)

      const stripMd = (s: string) => s
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/^#+\s*/, '')
        .trim()

      const dayLines = lines.filter((l: string) => /^(day\s*\d+|step\s*\d+|\d+[).\-:])/i.test(l))
      const sourceLines = dayLines.length >= 5 ? dayLines : lines.filter((l: string) => {
        const stripped = stripMd(l).toLowerCase()
        return !stripped.startsWith("here's") && !stripped.startsWith("here is") &&
               !stripped.startsWith("below") && !stripped.startsWith("sure") &&
               !stripped.startsWith("great") && !stripped.startsWith("absolutely") &&
               !stripped.startsWith("of course") && l.length > 20
      })

      const parsed = sourceLines.slice(0, 7).map((l: string, i: number) => ({
        id: Date.now() + i,
        text: stripMd(l.replace(/^(day\s*\d+[:.\-]?\s*|step\s*\d+[:.\-]?\s*|\d+[).\-]\s*)/i, '').trim()),
        done: false
      })).filter((s: any) => s.text.length > 10)
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
        body: JSON.stringify(buildApiBody(message))
      })
      const data = await response.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.message || data.advice || data.raw || "I'm here to help!" }])
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
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]

    if (lastAppOpen !== today) {
      setLastAppOpen(today)
    }

    const daysSinceCheckIn = lastCheckIn
      ? Math.floor((Date.now() - new Date(lastCheckIn).getTime()) / 86400000)
      : 999
    const daysSinceDailyCheckIn = lastDailyCheckIn
      ? Math.floor((Date.now() - new Date(lastDailyCheckIn).getTime()) / 86400000)
      : 999

    const triggers = [
      { id: 'no_income', condition: incomeStreams.length === 0 && onboardingComplete, urgency: 'high' as const, icon: '💰', message: "You haven't added your income yet. I can't coach you without knowing your numbers.", action: "Add my income now →", tab: 'dashboard' },
      { id: 'no_expenses', condition: incomeStreams.length > 0 && expenses.length === 0, urgency: 'high' as const, icon: '💸', message: `Good — I can see you earn $${monthlyIncome.toFixed(0)}/mo. Now add your bills and expenses so I can find your real surplus.`, action: "Add my expenses →", tab: 'dashboard' },
      { id: 'no_mortgage', condition: incomeStreams.length > 0 && expenses.length > 0 && !mortgageAccel.balance, urgency: 'high' as const, icon: '🏠', message: "Your budget is set up. Next: enter your mortgage details so I can calculate your mortgage-free date and show you exactly how much you can save.", action: "Enter mortgage details →", tab: 'mortgage' },
      { id: 'no_personality', condition: !moneyPersonality && onboardingComplete && incomeStreams.length > 0, urgency: 'medium' as const, icon: '🧠', message: "I'm giving you generic advice right now. Take the 8-question money personality quiz and I'll coach you the way YOU specifically need to be coached.", action: "Take the quiz →", tab: 'insights' },
      { id: 'baby_step_1_done', condition: emergencyFund >= 2000 && !dismissedTriggers.includes('baby_step_1_done') && currentBabyStep.step >= 2, urgency: 'high' as const, icon: '🛡️', message: `Your $2,000 emergency fund is in place — Baby Step 1 is DONE. 🎉 You're now on Baby Step 2: kill bad debt. List every credit card, personal loan, and BNPL balance in the Debts section.`, action: "Start Baby Step 2 →", tab: 'dashboard' },
      { id: 'bad_debt_done', condition: debts.filter(d => parseFloat(d.interestRate || '0') > 5 && !d.name?.toLowerCase().includes('mortgage')).length === 0 && debts.length > 0 && currentBabyStep.step >= 3, urgency: 'high' as const, icon: '💳', message: "All bad debt cleared! That's Baby Step 2 done. Now build your full 3-6 month emergency fund — that's the buffer that makes everything else possible.", action: "Set up emergency fund goal →", tab: 'path' },
      { id: 'emergency_fund_done', condition: emergencyMonths >= 3 && currentBabyStep.step >= 4 && !dismissedTriggers.includes('emergency_fund_done'), urgency: 'high' as const, icon: '🏦', message: `${emergencyMonths.toFixed(1)} months of expenses saved — Baby Step 3 is DONE. Now it's time to invest 15% of your income. Let's look at super salary sacrifice and ETFs.`, action: "Start investing →", tab: 'path' },
      { id: 'mortgage_no_extra', condition: !!mortgageAccel.balance && !mortgageAccel.extraRepayment && monthlySurplus > 200, urgency: 'high' as const, icon: '🚀', message: `You have $${monthlySurplus.toFixed(0)} surplus per month and your mortgage is entered but you haven't set any extra repayments. Even $${Math.floor(monthlySurplus * 0.3).toFixed(0)} extra per month could save you years.`, action: "See the impact →", tab: 'mortgage' },
      { id: 'mortgage_rate_check', condition: !!mortgageAccel.balance && parseFloat(mortgageAccel.rate || '0') > 6.5, urgency: 'medium' as const, icon: '📉', message: `Your mortgage rate is ${mortgageAccel.rate}% — that's above the current market average. A rate review or refinance could save you thousands. This is worth a 15-minute call to your broker.`, action: "Learn about refinancing →", tab: 'learn' },
      { id: 'surplus_not_allocated', condition: monthlySurplus > 300 && goals.length === 0 && debts.length === 0, urgency: 'high' as const, icon: '⚡', message: `You have $${monthlySurplus.toFixed(0)}/month in surplus with no goals or debts set up. That money is going nowhere. Let's put it to work — add a goal or set an extra mortgage repayment.`, action: "Allocate my surplus →", tab: 'path' },
      { id: 'low_savings_rate', condition: monthlyIncome > 0 && savingsRate < 10 && monthlyIncome > 3000, urgency: 'medium' as const, icon: '📊', message: `Your savings rate is ${savingsRate.toFixed(1)}% — the financial independence benchmark is 20%+. Let's find where the gap is and build a plan to close it.`, action: "Review my budget →", tab: 'dashboard' },
      { id: 'check_in_overdue', condition: daysSinceCheckIn >= 8 && moneyDateLog.length > 0, urgency: 'medium' as const, icon: '🔥', message: `It's been ${daysSinceCheckIn} days since your last Money Date. Your streak is at risk. A 10-minute check-in keeps momentum going — even a quick one counts.`, action: "Do Money Date now →", tab: 'review' },
      { id: 'daily_checkin_nudge', condition: daysSinceDailyCheckIn >= 3 && dailyCheckInLog.length > 0, urgency: 'low' as const, icon: '✅', message: `You haven't done a daily check-in in ${daysSinceDailyCheckIn} days. 3 questions, 60 seconds — it's the habit that keeps you financially aware.`, action: "Quick check-in →", tab: 'review' },
      { id: 'no_roadmap', condition: roadmapMilestones.length === 0 && onboardingComplete && incomeStreams.length > 0, urgency: 'medium' as const, icon: '🗺️', message: "Your roadmap is empty. Add your top 3 financial milestones — paying off debt, building your emergency fund, your mortgage-free date — and I'll build a weekly plan for each.", action: "Build my roadmap →", tab: 'path' },
      { id: 'goal_nearly_complete', condition: goals.some(g => { const pct = (parseFloat(g.saved || '0') / parseFloat(g.target || '1')) * 100; return pct >= 80 && pct < 100; }), urgency: 'medium' as const, icon: '🎯', message: `One of your goals is over 80% complete! You're in the home stretch — consider increasing your payment frequency to finish it off.`, action: "View my goals →", tab: 'dashboard' },
      { id: 'first_surplus', condition: monthlySurplus > 0 && incomeStreams.length > 0 && expenses.length > 0 && wins.length < 3, urgency: 'low' as const, icon: '🟢', message: `Your numbers are in and you have a $${monthlySurplus.toFixed(0)}/month surplus. This is your starting point — every dollar of that surplus directed intentionally changes your financial future.`, action: "See what to do with it →", tab: 'insights' }
    ]

    const priorityOrder = ['high', 'medium', 'low']
    for (const priority of priorityOrder) {
      const match = triggers.find(t => t.urgency === priority && t.condition && !dismissedTriggers.includes(t.id))
      if (match) {
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
    setCoachNextAction(null)
  }, [incomeStreams, expenses, debts, goals, assets, monthlySurplus, monthlyIncome, savingsRate, emergencyFund, emergencyMonths, mortgageAccel, moneyPersonality, roadmapMilestones, wins, streak, lastCheckIn, lastDailyCheckIn, moneyDateLog, dailyCheckInLog, onboardingComplete, currentBabyStep, dismissedTriggers])
  
  const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']

  const isMoneyDateDue = () => {
    const now = new Date()
    const todayName = dayNames[now.getDay()]
    if (todayName !== checkInSchedule.moneyDateDay) return false
    const today = now.toISOString().split('T')[0]
    if (moneyDateLog.length > 0 && new Date(moneyDateLog[0].date).toISOString().split('T')[0] === today) return false
    const [h, m] = checkInSchedule.moneyDateTime.split(':').map(Number)
    return now.getHours() >= h || (now.getHours() === h && now.getMinutes() >= m)
  }

  const isDailyCheckInDue = () => {
    if (!checkInSchedule.dailyEnabled) return false
    const today = new Date().toISOString().split('T')[0]
    if (lastDailyCheckIn === today) return false
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
    setDailyCheckInLog(prev => [entry, ...prev.slice(0, 29)])
    setLastDailyCheckIn(today)
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
    return milestoneCheckIns.filter(ci => {
      const linkedGoal = goals.find(g => g.name === ci.milestoneName)
      const freq = linkedGoal?.savingsFrequency || 'weekly'
      if (freq === 'weekly') return true
      if (freq === 'fortnightly') {
        if (moneyDateLog.length === 0) return true
        const daysSinceLast = (now.getTime() - new Date(moneyDateLog[0].date).getTime()) / 86400000
        return daysSinceLast >= 10
      }
      if (freq === 'monthly') {
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
    } else {
      setMissionStep((toStep ?? missionStep + 1) as any)
    }
  }

  const generateRoadmapProposals = async () => {
    setMissionP2Loading(true)
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
- Emergency fund: $${emergencyFund.toFixed(0)} (${emergencyMonths.toFixed(1)} months)
- Total debt: $${totalDebtBalance.toFixed(0)}
- Mortgage: ${mortgageAccel.balance ? `$${mortgageAccel.balance} at ${mortgageAccel.rate}%` : 'not entered'}
- Baby Step: ${currentBabyStep.step} — ${currentBabyStep.title}
- Money personality: ${moneyPersonality ? personalityProfiles[moneyPersonality]?.label : 'not assessed'}

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
        setMissionP2Step('propose')
      } else {
        throw new Error('No JSON in response')
      }
    } catch {
      const fallback = [
        { name: emergencyFund < 2000 ? 'Build $2,000 Emergency Fund' : emergencyMonths < 3 ? `Build ${Math.round(monthlyExpenses * 3)} Emergency Fund` : 'Starter Safety Net', icon: '🛡️', target: emergencyFund < 2000 ? 2000 : Math.round(monthlyExpenses * 3), notes: 'Your financial airbag — prevents going into debt when life throws surprises.', priority: 1 },
        { name: totalDebtBalance > 0 ? `Pay Off $${totalDebtBalance.toFixed(0)} Bad Debt` : mortgageAccel.balance ? `Accelerate Mortgage Payoff` : 'Build 3-Month Emergency Fund', icon: totalDebtBalance > 0 ? '💳' : '🚀', target: totalDebtBalance > 0 ? Math.round(totalDebtBalance) : 0, notes: totalDebtBalance > 0 ? `Every dollar of bad debt is costing you in interest.` : `Extra repayments early in your mortgage save 3-4× that amount in interest.`, priority: 2 },
        { name: mortgageAccel.balance ? `Be Mortgage-Free by ${new Date().getFullYear() + 8}` : 'Reach Financial Independence', icon: '🏠', target: 0, notes: 'The ultimate finish line. When your mortgage is gone, every dollar you were paying the bank goes back into your life.', priority: 3 }
      ]
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
    const newMilestones = toAdd.map((p, i) => ({
      id: now + i, name: p.name, icon: p.icon, targetAmount: p.target?.toString() || '0', currentAmount: 0, targetDate: '', notes: p.notes, category: 'savings', completed: false, createdAt: new Date().toISOString(), weeklyPlan: null
    }))
    setRoadmapMilestones(prev => [...prev, ...newMilestones])
    if (newMilestones.length > 0) {
      try {
        const first = newMilestones[0]
        const isDebtMilestone = /debt|credit card|bnpl|loan|pay off|kill bad/i.test(first.name)
        const response = await fetch('/api/budget-coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'question',
            question: `You are Aureus. Create a 7-day action plan for this goal: "${first.name}"${first.targetAmount !== '0' ? ` (target: $${first.targetAmount})` : ''}. Context: ${first.notes}
Rules:
- Output ONLY the 7 steps, nothing else.
- Format each line as: Day 1: [action]
- Day 5 MUST always be: "${isDebtMilestone ? 'Add this debt to the Debts section in Aureus with the balance, interest rate, and minimum payment so it tracks your payoff progress automatically.' : 'Add this goal to your Aureus savings goals with your target amount and a weekly payment amount, then enable it on the calendar for visual tracking and reminders.'}"
- Start directly with "Day 1:"${getPersonalityCoachingContext()}`,
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
        const parsed = sourceLines.slice(0, 7).map((l: string, i: number) => ({
          id: now + 100 + i,
          text: stripMd(l.replace(/^(day\s*\d+[:.\-]?\s*|step\s*\d+[:.\-]?\s*|\d+[).\-]\s*)/i, '').trim()),
          done: false
        })).filter((s: any) => s.text.length > 10)
        if (parsed.length > 0) {
          setRoadmapMilestones(prev => prev.map(m => m.id === first.id ? { ...m, weeklyPlan: parsed, planGeneratedAt: new Date().toISOString() } : m))
        }
      } catch { }
    }
    setMissionP2Loading(false)
    setTimeout(() => { advanceMission(null, 3); setActiveTab('path') }, 2500)
  }

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
    const taxSaving = annualExtra * 0.15
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

  // ==================== LITERACY TOPICS ====================
  const literacyTopics = [
    { id: 'mortgage-interest', icon: '🏠', title: 'How Mortgage Interest Actually Works', tagline: 'Why your early repayments matter most', content: `In your first year of a 30-year $600k mortgage at 6%, roughly 90% of each repayment goes to interest — not your actual debt.`, keyNumbers: ['90% of early repayments = interest', 'Avg Aussie pays $580k interest', 'Every $1 extra saves ~$3'], mistake: 'Most people wait too long', cta: 'How much interest am I paying?' },
    { id: 'offset-accounts', icon: '💡', title: 'Offset Accounts: The Secret Weapon', tagline: 'Your savings account that fights your mortgage', content: `An offset account is a transaction account linked to your mortgage. Every dollar in it reduces the balance your interest is calculated on.`, keyNumbers: ['$50k offset saves $3,000/year', 'Always accessible', 'Tax-free return'], mistake: 'Keeping savings separate', cta: 'Calculate my offset savings' },
    { id: 'fortnightly-hack', icon: '📅', title: 'Fortnightly Payments: The Simple Hack', tagline: 'Make 13 months of payments in 12 months', content: `If you pay monthly: 12 payments per year. If you pay fortnightly: 26 payments per year = 13 months of payments.`, keyNumbers: ['26 fortnightly = 13 monthly', '~4 years saved', '~$115k saved'], mistake: 'Halving payments incorrectly', cta: 'How much does this save me?' },
    { id: 'emergency-fund', icon: '🛡️', title: 'Emergency Fund Strategy', tagline: 'Your financial airbag', content: `An emergency fund is 3-6 months of living expenses kept in cash. Not invested. Just ready.`, keyNumbers: ['3 months = stable job', '6 months = variable income', 'Keep at 5%+ interest'], mistake: 'Using offset without backup', cta: 'Calculate my target' }
  ]

  const mortgageResult = calculateMortgagePayoff()

  // ==================== MODE SELECTOR ====================
  if (showModeSelector) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' as const }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(245,158,11,0.4)', border: '4px solid #fcd34d', margin: '0 auto 24px' }}>
            <span style={{ color: '#78350f', fontWeight: 800, fontSize: '40px' }}>A</span>
          </div>
          <h1 style={{ fontSize: '38px', fontWeight: 800, color: '#f1f5f9', margin: '0 0 12px 0' }}>Meet Aureus</h1>
          <p style={{ fontSize: '18px', color: '#94a3b8', margin: '0 0 8px 0', lineHeight: 1.5 }}>Your AI financial coach. I'll help you pay your mortgage off years early, eliminate debt, and build real wealth.</p>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 36px 0' }}>I won't just give you tools — I'll tell you exactly what to do, in the right order, one step at a time.</p>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', marginBottom: '28px', textAlign: 'left' as const, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', marginBottom: '16px' }}>WHAT HAPPENS NEXT</div>
            {[{ step: '1', icon: '🧠', text: 'I learn how you think about money (5 min quiz)' }, { step: '2', icon: '💰', text: 'You enter your income, bills, and mortgage' }, { step: '3', icon: '🗺️', text: 'I build your personalised financial roadmap' }, { step: '4', icon: '📋', text: 'I generate your first week-by-week action plan' }].map(item => (
              <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e3a5f', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{item.icon}</div>
                <div style={{ color: '#e2e8f0', fontSize: '14px' }}>{item.text}</div>
              </div>
            ))}
          </div>
          <button onClick={() => { setAppMode('budget'); setShowModeSelector(false); setMissionPhase(1); setMissionStep(1); setMissionNavLocked(true); setActiveTab('chat') }} style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '16px', color: 'white', fontSize: '18px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(16,185,129,0.3)', marginBottom: '12px' }}>Let's get started →</button>
          <button onClick={() => { setAppMode('budget'); setShowModeSelector(false); setMissionComplete(true); setMissionNavLocked(false); setOnboardingComplete(true); setActiveTab('quickview') }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px', padding: '8px' }}>I've used Aureus before — skip setup</button>
          <button onClick={() => setDarkMode(!darkMode)} style={{ marginTop: '16px', padding: '8px 20px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
        </div>
      </div>
    )
  }

  // ==================== MAIN APP RETURN ====================
  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>

      {/* MISSION OVERLAY — Phase 1 (setup) */}
      {!missionComplete && missionPhase === 1 && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: darkMode ? '#0f172a' : '#f8fafc', zIndex: 3000, display: 'flex', flexDirection: 'column' as const, overflow: 'auto' }}>
          <div style={{ padding: '16px 24px', background: darkMode ? '#1e293b' : 'white', borderBottom: '1px solid ' + theme.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#78350f', fontSize: '16px' }}>A</div>
              <div><div style={{ color: theme.text, fontWeight: 700, fontSize: '15px' }}>Aureus Setup</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>Step {missionStep} of 4</div></div>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>{[1,2,3,4].map(s => (<div key={s} style={{ width: s === missionStep ? '24px' : '8px', height: '8px', borderRadius: '4px', background: s < missionStep ? theme.success : s === missionStep ? theme.accent : theme.border, transition: 'all 0.3s' }} />))}</div>
          </div>

          {missionStep === 1 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '32px 20px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🧠</div>
              <h2 style={{ color: theme.text, fontSize: '26px', margin: '0 0 8px 0', textAlign: 'center' as const }}>First — let me understand you.</h2>
              <p style={{ color: theme.textMuted, fontSize: '15px', textAlign: 'center' as const, lineHeight: 1.7, margin: '0 0 32px 0' }}>I coach everyone differently. Before I give you a single piece of advice, I need to know how you think about money — your personality, your fears, and what you're really working toward.</p>
              {!moneyPersonality ? (
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px', marginBottom: '28px' }}>
                    {personalityQuiz.map((question, qi) => (
                      <div key={qi} style={{ padding: '18px', background: theme.cardBg, borderRadius: '14px', border: '1px solid ' + theme.border }}>
                        <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}>{qi + 1}. {question.q}</div>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px' }}>
                          {question.options.map((opt, oi) => (
                            <button key={oi} onClick={() => setPersonalityAnswers(prev => ({ ...prev, [qi]: opt.type }))} style={{ padding: '10px 14px', background: personalityAnswers[qi] === opt.type ? theme.accent + '30' : theme.bg, border: '2px solid ' + (personalityAnswers[qi] === opt.type ? theme.accent : theme.border), borderRadius: '8px', cursor: 'pointer', color: theme.text, fontSize: '13px', textAlign: 'left' as const }}>{personalityAnswers[qi] === opt.type ? '● ' : '○ '}{opt.label}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { const result = calculatePersonality(); setMoneyPersonality(result) }} disabled={Object.keys(personalityAnswers).length < 8} style={{ width: '100%', padding: '16px', background: Object.keys(personalityAnswers).length < 8 ? theme.border : theme.accent, color: 'white', border: 'none', borderRadius: '12px', cursor: Object.keys(personalityAnswers).length < 8 ? 'default' : 'pointer', fontSize: '16px', fontWeight: 700, opacity: Object.keys(personalityAnswers).length < 8 ? 0.6 : 1 }}>{Object.keys(personalityAnswers).length < 8 ? `Answer ${8 - Object.keys(personalityAnswers).length} more` : 'See my result →'}</button>
                </div>
              ) : (
                <div style={{ width: '100%' }}>
                  <div style={{ padding: '20px', background: personalityProfiles[moneyPersonality].color + '20', borderRadius: '16px', border: '2px solid ' + personalityProfiles[moneyPersonality].color + '40', marginBottom: '24px', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>{personalityProfiles[moneyPersonality].emoji}</div>
                    <div style={{ color: personalityProfiles[moneyPersonality].color, fontWeight: 800, fontSize: '20px', marginBottom: '8px' }}>{personalityProfiles[moneyPersonality].label}</div>
                    <p style={{ color: theme.textMuted, fontSize: '13px', margin: 0, lineHeight: 1.6 }}>{personalityProfiles[moneyPersonality].aureusFocus}</p>
                  </div>
                  <div style={{ marginBottom: '24px' }}><div style={{ color: theme.text, fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>❤️ Now — tell me why.</div><p style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '14px' }}>What are you actually working toward? This is what I'll remind you of when motivation dips.</p><textarea value={whyStatement} onChange={e => setWhyStatement(e.target.value)} placeholder="e.g. I want to be mortgage-free before my kids start high school so I can work less and be more present..." style={{ ...inputStyle, width: '100%', minHeight: '90px', resize: 'vertical' as const }} /></div>
                  <div style={{ marginBottom: '24px' }}><div style={{ color: theme.text, fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>⚡ Who are you becoming?</div><p style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '12px' }}>Write one identity statement. Not what you want to have — who you are becoming.</p><input value={identityStatements[0] || ''} onChange={e => setIdentityStatements([e.target.value])} placeholder="I am someone who..." style={{ ...inputStyle, width: '100%' }} /></div>
                  <button onClick={() => advanceMission(2)} style={{ width: '100%', padding: '16px', background: theme.success, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>Perfect. Now let's set up your numbers →</button>
                </div>
              )}
            </div>
          )}

          {missionStep === 2 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '32px 20px', maxWidth: '560px', margin: '0 auto', width: '100%' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>💰</div>
              <h2 style={{ color: theme.text, fontSize: '26px', margin: '0 0 8px 0', textAlign: 'center' as const }}>How much do you earn?</h2>
              <p style={{ color: theme.textMuted, fontSize: '15px', textAlign: 'center' as const, lineHeight: 1.7, margin: '0 0 28px 0' }}>I can't show you your surplus, your mortgage-free date, or your financial health score until I know your income. This is step one.</p>
              {incomeStreams.length > 0 && (<div style={{ width: '100%', marginBottom: '16px' }}>{incomeStreams.map(inc => (<div key={inc.id} style={{ padding: '12px 16px', background: theme.success + '15', borderRadius: '10px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid ' + theme.success + '30' }}><div><div style={{ color: theme.text, fontWeight: 600 }}>{inc.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>${inc.amount} {inc.frequency}</div></div><button onClick={() => setIncomeStreams(prev => prev.filter(i => i.id !== inc.id))} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '16px' }}>×</button></div>))}</div>)}
              <div style={{ width: '100%', padding: '20px', background: theme.cardBg, borderRadius: '14px', border: '1px solid ' + theme.border, marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                  <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Income source</label><input placeholder="e.g. Salary" value={newIncome.name} onChange={e => setNewIncome({...newIncome, name: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Amount ($)</label><input type="number" placeholder="e.g. 2800" value={newIncome.amount} onChange={e => setNewIncome({...newIncome, amount: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
                    <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Frequency</label><select value={newIncome.frequency} onChange={e => { const newFreq = e.target.value; let newStartDate = newIncome.startDate; if (newFreq === 'weekly') { newStartDate = getNextDateForDayOfWeek(new Date().getDay()) } else if (newFreq === 'fortnightly') { newStartDate = getFortnightlyDateFromAnchor(1) } else if (newFreq === 'monthly' || newFreq === 'quarterly' || newFreq === 'yearly') { newStartDate = getNextDateForDayOfMonth(1, newFreq) } setNewIncome({...newIncome, frequency: newFreq, startDate: newStartDate}) }} style={{...inputStyle, width: '100%'}}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></div>
                  </div>
                  <SmartDatePicker frequency={newIncome.frequency} value={newIncome.startDate} onChange={v => setNewIncome({...newIncome, startDate: v})} label="Pay day" />
                  <button onClick={addIncome} style={{...btnSuccess, alignSelf: 'flex-start' as const, padding: '8px 16px'}}>+ Add income</button>
                </div>
              </div>
              {incomeStreams.length > 0 && (<div style={{ width: '100%' }}><div style={{ padding: '14px 16px', background: theme.success + '15', borderRadius: '10px', marginBottom: '16px', border: '1px solid ' + theme.success + '30' }}><div style={{ color: theme.success, fontWeight: 700 }}>Monthly income: ${monthlyIncome.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>Looking good.</div></div><button onClick={() => advanceMission(3)} style={{ width: '100%', padding: '16px', background: theme.accent, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>Next: my bills →</button></div>)}
            </div>
          )}

          {missionStep === 3 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '32px 20px', maxWidth: '560px', margin: '0 auto', width: '100%' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>💸</div>
              <h2 style={{ color: theme.text, fontSize: '26px', margin: '0 0 8px 0', textAlign: 'center' as const }}>What are your regular bills?</h2>
              <p style={{ color: theme.textMuted, fontSize: '15px', textAlign: 'center' as const, lineHeight: 1.7, margin: '0 0 8px 0' }}>Add your main recurring expenses. Rough numbers are fine.</p>
              <p style={{ color: theme.textMuted, fontSize: '13px', textAlign: 'center' as const, margin: '0 0 24px 0' }}>Income: <strong style={{ color: theme.success }}>${monthlyIncome.toFixed(0)}/mo</strong></p>
              <div style={{ width: '100%', marginBottom: '16px' }}><div style={{ color: theme.textMuted, fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>QUICK ADD</div><div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>{presetBills.map(p => (<button key={p.name} onClick={() => { const amt = prompt(`${p.name} — amount:`, (p as any).amount || ''); if (amt) setExpenses(prev => [...prev, { id: Date.now(), name: p.name, amount: amt, frequency: p.frequency, category: p.category, dueDate: new Date().toISOString().split('T')[0] }]) }} style={{ padding: '5px 12px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '20px', cursor: 'pointer', fontSize: '12px', color: theme.textMuted }}>+ {p.name}</button>))}</div></div>
              {expenses.filter(e => !e.targetDebtId && !e.targetGoalId).length > 0 && (<div style={{ width: '100%', marginBottom: '16px' }}>{expenses.filter(e => !e.targetDebtId && !e.targetGoalId).map(exp => (<div key={exp.id} style={{ padding: '10px 14px', background: theme.danger + '10', borderRadius: '8px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid ' + theme.border }}><div><div style={{ color: theme.text, fontSize: '14px' }}>{exp.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>${exp.amount} {exp.frequency}</div></div><button onClick={() => setExpenses(prev => prev.filter(e => e.id !== exp.id))} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '16px' }}>×</button></div>))}<div style={{ padding: '10px 14px', background: theme.cardBg, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}><span style={{ color: theme.textMuted, fontSize: '13px' }}>Total expenses</span><span style={{ color: theme.danger, fontWeight: 700 }}>${monthlyExpenses.toFixed(0)}/mo</span></div>{monthlySurplus > 0 && (<div style={{ padding: '10px 14px', background: theme.success + '15', borderRadius: '8px', marginTop: '6px', border: '1px solid ' + theme.success + '30', display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.success, fontWeight: 600, fontSize: '13px' }}>Your surplus</span><span style={{ color: theme.success, fontWeight: 700 }}>${monthlySurplus.toFixed(0)}/mo</span></div>)}</div>)}
              <div style={{ width: '100%', padding: '16px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border, marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}><input placeholder="Bill name" value={newExpense.name} onChange={e => setNewExpense({...newExpense, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '100px'}} /><input type="number" placeholder="$" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} style={{...inputStyle, width: '80px'}} /><select value={newExpense.frequency} onChange={e => { const newFreq = e.target.value; let newDueDate = newExpense.dueDate; if (newFreq === 'weekly') { newDueDate = getNextDateForDayOfWeek(new Date().getDay()) } else if (newFreq === 'fortnightly') { newDueDate = getFortnightlyDateFromAnchor(1) } else if (newFreq === 'monthly' || newFreq === 'quarterly' || newFreq === 'yearly') { newDueDate = getNextDateForDayOfMonth(1, newFreq) } setNewExpense({...newExpense, frequency: newFreq, dueDate: newDueDate}) }} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select><button onClick={() => { if (newExpense.name && newExpense.amount) { setExpenses(prev => [...prev, { ...newExpense, id: Date.now(), dueDate: newExpense.dueDate }]); setNewExpense({ name: '', amount: '', frequency: 'monthly', category: 'other', dueDate: new Date().toISOString().split('T')[0] }) } }} style={btnDanger}>+</button></div>
                <SmartDatePicker frequency={newExpense.frequency} value={newExpense.dueDate} onChange={v => setNewExpense({...newExpense, dueDate: v})} label="Due day" />
              </div>
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}><button onClick={() => advanceMission(3)} style={{ padding: '14px 20px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', color: theme.textMuted, cursor: 'pointer', fontSize: '14px' }}>Skip</button><button onClick={() => advanceMission(4)} style={{ flex: 1, padding: '16px', background: expenses.length > 0 ? theme.accent : theme.border, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>{expenses.length > 0 ? 'Next: my mortgage →' : 'Continue →'}</button></div>
            </div>
          )}

          {missionStep === 4 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '32px 20px', maxWidth: '560px', margin: '0 auto', width: '100%' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🏠</div>
              <h2 style={{ color: theme.text, fontSize: '26px', margin: '0 0 8px 0', textAlign: 'center' as const }}>Tell me about your mortgage.</h2>
              <p style={{ color: theme.textMuted, fontSize: '15px', textAlign: 'center' as const, lineHeight: 1.7, margin: '0 0 8px 0' }}>I'll calculate your exact mortgage-free date and show you how to cut years off it.</p>
              {monthlySurplus > 0 && (<div style={{ padding: '10px 16px', background: theme.success + '15', borderRadius: '8px', marginBottom: '20px', border: '1px solid ' + theme.success + '30', textAlign: 'center' as const }}>You have <strong>${monthlySurplus.toFixed(0)}/month</strong> surplus that could go onto your mortgage.</div>)}
              <div style={{ width: '100%', padding: '20px', background: theme.cardBg, borderRadius: '14px', border: '1px solid ' + theme.border, marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '14px' }}>
                  <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Repayment frequency</label><select value={mortgageAccel.repaymentFrequency} onChange={e => setMortgageAccel({...mortgageAccel, repaymentFrequency: e.target.value})} style={{...inputStyle, width: '100%'}}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select></div>
                  <div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Remaining balance ($)</label><input type="number" placeholder="e.g. 420000" value={mortgageAccel.balance} onChange={e => setMortgageAccel({...mortgageAccel, balance: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}><div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Interest rate (%)</label><input type="number" step="0.01" placeholder="e.g. 6.14" value={mortgageAccel.rate} onChange={e => setMortgageAccel({...mortgageAccel, rate: e.target.value})} style={{...inputStyle, width: '100%'}} /></div><div><label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Years remaining</label><input type="number" placeholder="e.g. 25" value={mortgageAccel.remainingYears} onChange={e => setMortgageAccel({...mortgageAccel, remainingYears: e.target.value})} style={{...inputStyle, width: '100%'}} /></div></div>
                </div>
              </div>
              {mortgageAccel.balance && mortgageAccel.rate && mortgageAccel.remainingYears && (() => { const res = calculateMortgagePayoff(); if (!res) return null; return (<div style={{ width: '100%', marginBottom: '20px' }}><div style={{ padding: '20px', background: 'linear-gradient(135deg, #0f2027, #203a43)', borderRadius: '14px', textAlign: 'center' as const, border: '1px solid #334155' }}><div style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '2px', marginBottom: '8px' }}>🏠 YOUR MORTGAGE-FREE DATE</div><div style={{ color: '#ef4444', fontSize: '40px', fontWeight: 800, marginBottom: '4px' }}>{res.standard.freeYear}</div><div style={{ color: '#64748b', fontSize: '12px' }}>at current pace · ${Math.round(res.standard.interest / 1000)}k interest</div></div></div>) })()}
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}><button onClick={() => advanceMission(null, 2)} style={{ padding: '14px 20px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', color: theme.textMuted, cursor: 'pointer', fontSize: '14px' }}>Skip</button><button onClick={() => advanceMission(null, 2)} style={{ flex: 1, padding: '16px', background: mortgageAccel.balance ? theme.success : theme.accent, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>{mortgageAccel.balance ? "Build my roadmap →" : "Build my roadmap →"}</button></div>
            </div>
          )}
        </div>
      )}

      {/* MISSION PHASE 2 */}
      {!missionComplete && missionPhase === 2 && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: darkMode ? '#0f172a' : '#f8fafc', zIndex: 3000, display: 'flex', flexDirection: 'column' as const, overflow: 'auto' }}>
          <div style={{ padding: '16px 24px', background: darkMode ? '#1e293b' : 'white', borderBottom: '1px solid ' + theme.border, display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky' as const, top: 0, zIndex: 1 }}><div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#78350f', fontSize: '16px' }}>A</div><div><div style={{ color: theme.text, fontWeight: 700, fontSize: '15px' }}>Building your roadmap</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>Almost there</div></div></div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '32px 20px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            {missionP2Step === 'analyse' && (<div style={{ textAlign: 'center' as const, width: '100%' }}>{missionP2Loading ? (<div style={{ padding: '60px 20px' }}><div style={{ fontSize: '64px', marginBottom: '24px', animation: 'pulse 1.5s infinite' }}>🧠</div><h2 style={{ color: theme.text, fontSize: '24px', margin: '0 0 12px 0' }}>Analysing your situation...</h2><div style={{ marginTop: '32px', display: 'flex', gap: '6px', justifyContent: 'center' }}>{[0,1,2].map(i => (<div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.accent, animation: `pulse 1s infinite ${i * 0.3}s` }} />))}</div></div>) : (<><div style={{ fontSize: '56px', marginBottom: '20px' }}>🔍</div><h2 style={{ color: theme.text, fontSize: '24px', margin: '0 0 12px 0' }}>Let me analyse your situation.</h2><div style={{ padding: '20px', background: theme.cardBg, borderRadius: '14px', marginBottom: '24px', textAlign: 'left' as const, border: '1px solid ' + theme.border }}><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>{[{ label: 'Monthly income', value: `$${monthlyIncome.toFixed(0)}`, color: theme.success }, { label: 'Monthly expenses', value: `$${monthlyExpenses.toFixed(0)}`, color: theme.danger }, { label: 'Monthly surplus', value: `$${monthlySurplus.toFixed(0)}`, color: monthlySurplus > 0 ? theme.success : theme.danger }, { label: 'Baby Step', value: `Step ${currentBabyStep.step}`, color: theme.accent }].map(item => (<div key={item.label} style={{ padding: '12px', background: theme.bg, borderRadius: '8px' }}><div style={{ color: theme.textMuted, fontSize: '11px' }}>{item.label}</div><div style={{ color: item.color, fontWeight: 700, fontSize: '18px' }}>{item.value}</div></div>))}</div></div><button onClick={generateRoadmapProposals} style={{ width: '100%', padding: '16px', background: theme.accent, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>Build my roadmap →</button></>)}</div>)}
            {missionP2Step === 'propose' && missionP2Proposals.length > 0 && (<div style={{ width: '100%' }}><div style={{ textAlign: 'center' as const, marginBottom: '24px' }}><div style={{ fontSize: '48px', marginBottom: '12px' }}>🗺️</div><h2 style={{ color: theme.text, fontSize: '24px', margin: '0 0 8px 0' }}>Here's your roadmap.</h2></div>{missionP2Proposals.map((p, i) => (<div key={i} style={{ padding: '18px', background: missionP2Confirmed[i] ? theme.accent + '15' : theme.cardBg, borderRadius: '14px', marginBottom: '12px', border: '2px solid ' + (missionP2Confirmed[i] ? theme.accent + '60' : theme.border) }}><div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}><input type="checkbox" checked={missionP2Confirmed[i] || false} onChange={e => setMissionP2Confirmed(prev => { const n = [...prev]; n[i] = e.target.checked; return n })} style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: theme.accent, flexShrink: 0 }} /><div style={{ flex: 1 }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><span style={{ fontSize: '22px' }}>{p.icon}</span><span style={{ color: theme.text, fontWeight: 700, fontSize: '16px' }}>{p.name}</span>{p.target > 0 && <span style={{ color: theme.accent, fontSize: '13px' }}>${p.target.toLocaleString()}</span>}</div><div style={{ color: theme.textMuted, fontSize: '13px', lineHeight: 1.5 }}>{p.notes}</div></div></div></div>))}<button onClick={confirmMissionRoadmap} disabled={!missionP2Confirmed.some(Boolean)} style={{ width: '100%', padding: '16px', background: missionP2Confirmed.some(Boolean) ? theme.success : theme.border, color: 'white', border: 'none', borderRadius: '12px', cursor: missionP2Confirmed.some(Boolean) ? 'pointer' : 'default', fontSize: '16px', fontWeight: 700, marginTop: '8px' }}>{missionP2Loading ? 'Generating...' : `Add & generate plan →`}</button></div>)}
            {missionP2Step === 'plan' && (<div style={{ textAlign: 'center' as const, padding: '40px 0' }}>{missionP2Loading ? (<><div style={{ fontSize: '64px', marginBottom: '20px', animation: 'pulse 1.5s infinite' }}>📋</div><h2 style={{ color: theme.text, fontSize: '24px', margin: '0 0 12px 0' }}>Generating your action plan...</h2></>) : (<><div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div><h2 style={{ color: theme.success, fontSize: '26px', margin: '0 0 12px 0' }}>You're set up!</h2><p style={{ color: theme.textMuted, fontSize: '13px' }}>Taking you to your roadmap...</p></>)}</div>)}
          </div>
        </div>
      )}

      {celebrationWin && (<div style={{ position: 'fixed' as const, top: '20px', right: '20px', zIndex: 9999, padding: '16px 20px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(16,185,129,0.4)', color: 'white', maxWidth: '320px', animation: 'slideIn 0.3s ease' }}><div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>🏆 New Win!</div><div style={{ fontSize: '13px', opacity: 0.9 }}>{celebrationWin}</div></div>)}

      {/* HEADER */}
      <header style={{ padding: '12px 24px', background: theme.cardBg, borderBottom: '1px solid ' + theme.border, position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fcd34d' }}><span style={{ color: '#78350f', fontWeight: 800, fontSize: '18px' }}>A</span></div>
            <span style={{ color: theme.text, fontWeight: 700, fontSize: '20px' }}>Aureus</span>
            {streak > 0 && <span style={{ padding: '3px 10px', background: '#f59e0b20', color: '#f59e0b', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>🔥 {streak}-week streak</span>}
            {coachNextAction && activeTab !== 'quickview' && (<button onClick={() => setActiveTab('quickview')} style={{ padding: '3px 10px', background: coachNextAction.urgency === 'high' ? theme.warning + '20' : theme.accent + '20', color: coachNextAction.urgency === 'high' ? theme.warning : theme.accent, border: '1px solid ' + (coachNextAction.urgency === 'high' ? theme.warning + '50' : theme.accent + '40'), borderRadius: '20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>{coachNextAction.icon} {coachNextAction.urgency === 'high' ? 'Action needed' : 'Recommend'}</button>)}
            {isMoneyDateDue() && (<button onClick={() => { setShowMoneyDate(true); setMoneyDateStep(0); setMoneyDateAnswers({}) }} style={{ padding: '3px 10px', background: theme.success + '20', color: theme.success, border: '1px solid ' + theme.success + '50', borderRadius: '20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', animation: 'pulse 2s infinite' }}>💰 Money Date due</button>)}
            {isDailyCheckInDue() && (<button onClick={() => { setShowDailyCheckIn(true); setDailyCheckInStep(0); setDailyCheckInAnswers({}) }} style={{ padding: '3px 10px', background: theme.accent + '20', color: theme.accent, border: '1px solid ' + theme.accent + '50', borderRadius: '20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>✅ Daily check-in</button>)}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '7px 12px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text }}>{darkMode ? '☀️' : '🌙'}</button>
            <select value={userCountry} onChange={e => setUserCountry(e.target.value as any)} style={{ padding: '6px 10px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text, fontSize: '14px' }}><option value="AU">🇦🇺 AU</option><option value="US">🇺🇸 US</option><option value="UK">🇬🇧 UK</option><option value="NZ">🇳🇿 NZ</option><option value="CA">🇨🇦 CA</option></select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' as const, paddingBottom: '2px' }}>
          {[{ id: 'chat', label: '💬 Aureus' }, { id: 'quickview', label: '⚡ Quick' }, { id: 'dashboard', label: '🎛️ Budget' }, { id: 'mortgage', label: '🚀 Mortgage' }, { id: 'insights', label: '🧠 Insights' }, { id: 'path', label: '🛤️ Path' }, { id: 'grow', label: '📈 Grow' }, { id: 'review', label: '🔄 Review' }, { id: 'overview', label: '📊 Metrics' }, { id: 'learn', label: '🎓 Learn' }, { id: 'wins', label: `🏆 Wins${wins.length > 0 ? ` (${wins.length})` : ''}` }].map(tab => (<button key={tab.id} onClick={() => { if (missionNavLocked) return; setActiveTab(tab.id as any) }} style={{ padding: '7px 14px', background: activeTab === tab.id ? theme.accent : 'transparent', color: activeTab === tab.id ? 'white' : missionNavLocked ? theme.textMuted + '60' : theme.text, border: '1px solid ' + (activeTab === tab.id ? theme.accent : theme.border), borderRadius: '8px', cursor: missionNavLocked ? 'default' : 'pointer', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap' as const, flexShrink: 0, opacity: missionNavLocked ? 0.4 : 1 }}>{tab.label}</button>))}
          {missionNavLocked && (<div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: theme.accent + '20', borderRadius: '8px', border: '1px solid ' + theme.accent + '40', flexShrink: 0 }}><span style={{ fontSize: '12px' }}>🔒</span><span style={{ color: theme.accent, fontSize: '11px', fontWeight: 600 }}>Complete setup to unlock</span><button onClick={() => { setMissionComplete(true); setMissionNavLocked(false); setOnboardingComplete(true) }} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '11px', textDecoration: 'underline', padding: 0 }}>skip</button></div>)}
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* ==================== QUICKVIEW TAB ==================== */}
        {activeTab === 'quickview' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>
            {/* Why Statement Banner */}
            {whyStatement ? (
              <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #f59e0b15, #10b98115)', borderRadius: '12px', border: '2px solid #f59e0b40', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '4px' }}>Why I'm Doing This</div><div style={{ color: theme.text, fontSize: '15px', fontStyle: 'italic' }}>"{whyStatement}"</div></div>
                <button onClick={() => { setEditingWhy(true); setWhyDraft(whyStatement) }} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.textMuted, cursor: 'pointer', fontSize: '12px' }}>Edit</button>
              </div>
            ) : (
              <button onClick={() => { setEditingWhy(true); setWhyDraft('') }} style={{ padding: '16px 20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', border: '2px dashed ' + theme.border, cursor: 'pointer', textAlign: 'left' as const }}><div style={{ color: theme.textMuted, fontSize: '13px' }}>💬 <strong>Set your why</strong> — What are you working toward?</div></button>
            )}

            {/* Coach Card */}
            {coachNextAction && (
              <div style={{ padding: '18px 20px', background: coachNextAction.urgency === 'high' ? `linear-gradient(135deg, ${theme.warning}25, ${theme.orange}10)` : coachNextAction.urgency === 'medium' ? `linear-gradient(135deg, ${theme.accent}20, ${theme.purple}10)` : `linear-gradient(135deg, ${theme.success}15, ${theme.teal}10)`, borderRadius: '14px', border: '2px solid ' + (coachNextAction.urgency === 'high' ? theme.warning + '80' : coachNextAction.urgency === 'medium' ? theme.accent + '60' : theme.success + '50') }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#78350f', flexShrink: 0 }}>A</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ color: coachNextAction.urgency === 'high' ? theme.warning : coachNextAction.urgency === 'medium' ? theme.accent : theme.success, fontSize: '11px', fontWeight: 700, letterSpacing: '1px' }}>{coachNextAction.urgency === 'high' ? '⚡ NEXT ACTION' : coachNextAction.urgency === 'medium' ? '🎯 AUREUS RECOMMENDS' : "💡 WHEN YOU'RE READY"}</div>
                      <button onClick={() => { setDismissedTriggers(prev => [...prev, coachNextAction.triggeredBy]); setCoachNextAction(null) }} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 0 0 8px' }}>×</button>
                    </div>
                    <p style={{ color: theme.text, fontSize: '14px', lineHeight: 1.65, margin: '0 0 12px 0' }}>{coachNextAction.message}</p>
                    <button onClick={() => setActiveTab(coachNextAction.tab as any)} style={{ padding: '9px 18px', background: coachNextAction.urgency === 'high' ? theme.warning : coachNextAction.urgency === 'medium' ? theme.accent : theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>{coachNextAction.action}</button>
                  </div>
                </div>
              </div>
            )}

            {/* Daily Check-in Card */}
            <div style={{ padding: '16px 20px', background: isDailyCheckInDue() ? `linear-gradient(135deg, ${theme.accent}20, ${theme.accent}05)` : theme.cardBg, borderRadius: '14px', border: '1px solid ' + (isDailyCheckInDue() ? theme.accent + '60' : theme.border) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ color: theme.text, fontWeight: 700, fontSize: '14px' }}>✅ Daily Check-in</div><div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '2px' }}>{lastDailyCheckIn === new Date().toISOString().split('T')[0] ? '✓ Done today' : isDailyCheckInDue() ? 'Ready for you now' : `Last: ${lastDailyCheckIn ? new Date(lastDailyCheckIn).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' }) : 'never'}`}</div></div>
                <button onClick={() => { setShowDailyCheckIn(true); setDailyCheckInStep(0); setDailyCheckInAnswers({}) }} disabled={lastDailyCheckIn === new Date().toISOString().split('T')[0]} style={{ padding: '8px 16px', background: lastDailyCheckIn === new Date().toISOString().split('T')[0] ? theme.border : theme.accent, color: lastDailyCheckIn === new Date().toISOString().split('T')[0] ? theme.textMuted : 'white', border: 'none', borderRadius: '8px', cursor: lastDailyCheckIn === new Date().toISOString().split('T')[0] ? 'default' : 'pointer', fontSize: '13px', fontWeight: 600 }}>{lastDailyCheckIn === new Date().toISOString().split('T')[0] ? '✓ Done' : 'Start →'}</button>
              </div>
              {dailyCheckInLog.length > 0 && (<div style={{ marginTop: '10px', display: 'flex', gap: '4px' }}>{Array.from({ length: 7 }).map((_, i) => { const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]; const done = dailyCheckInLog.some(e => new Date(e.date).toISOString().split('T')[0] === d); return <div key={i} title={d} style={{ width: '12px', height: '12px', borderRadius: '3px', background: done ? theme.accent : theme.border }} /> })}<span style={{ color: theme.textMuted, fontSize: '11px', marginLeft: '6px' }}>last 7 days</span></div>)}
            </div>

            {/* Money Date Banner */}
            {isMoneyDateDue() && (<div style={{ padding: '16px 20px', background: `linear-gradient(135deg, ${theme.success}20, ${theme.success}05)`, borderRadius: '14px', border: '2px solid ' + theme.success + '60', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ color: theme.success, fontWeight: 700, fontSize: '14px' }}>💰 Money Date is due!</div><div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '2px' }}>Your scheduled {checkInSchedule.moneyDateDay} check-in</div></div><button onClick={() => { setShowMoneyDate(true); setMoneyDateStep(0); setMoneyDateAnswers({}) }} style={{ padding: '10px 18px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>Start →</button></div>)}

            {/* Quote */}
            <div style={{ background: theme.cardBg, borderRadius: '12px', padding: '16px 20px', borderLeft: '4px solid ' + theme.purple }}><p style={{ color: theme.text, fontSize: '14px', fontStyle: 'italic', margin: 0 }}>"{currentQuote.quote}"</p><p style={{ color: theme.textMuted, fontSize: '12px', margin: '8px 0 0 0', textAlign: 'right' as const }}>— {currentQuote.author}</p></div>

            {/* Quick Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {[{ label: 'Income', value: `$${monthlyIncome.toFixed(0)}`, color: theme.success }, { label: 'Bills', value: `$${totalOutgoing.toFixed(0)}`, color: theme.danger }, { label: 'Surplus', value: `$${monthlySurplus.toFixed(0)}`, color: monthlySurplus >= 0 ? theme.success : theme.danger }, { label: 'Net Worth', value: `$${netWorth.toLocaleString()}`, color: netWorth >= 0 ? theme.success : theme.danger }].map(m => (<div key={m.label} style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '4px' }}>{m.label}</div><div style={{ color: m.color, fontSize: '28px', fontWeight: 700 }}>{m.value}</div></div>))}
            </div>

            {/* Mortgage Free Date Hero */}
            {mortgageAccel.balance && mortgageResult ? (<div style={{ padding: '24px', background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', borderRadius: '16px', border: '2px solid #3b82f6' }}><div style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '3px', marginBottom: '12px', textAlign: 'center' as const }}>🏠 MORTGAGE PAYOFF</div><div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' as const, marginBottom: '16px' }}><div><div style={{ color: '#ef4444', fontSize: '11px', marginBottom: '4px' }}>Current</div><div style={{ color: '#f1f5f9', fontSize: '36px', fontWeight: 800 }}>{mortgageResult.standard.freeYear}</div><div style={{ color: '#64748b', fontSize: '11px' }}>{mortgageResult.standard.years.toFixed(1)} yrs</div></div>{parseFloat(mortgageAccel.extraRepayment || '0') > 0 && (<div><div style={{ color: '#10b981', fontSize: '11px', marginBottom: '4px' }}>With extra</div><div style={{ color: '#10b981', fontSize: '36px', fontWeight: 800 }}>{mortgageResult.withExtra.freeYear}</div><div style={{ color: '#10b981', fontSize: '11px' }}>{mortgageResult.withExtra.yearsSaved.toFixed(1)} yrs saved</div></div>)}</div><button onClick={() => setActiveTab('mortgage')} style={{ width: '100%', marginTop: '8px', padding: '10px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Open Accelerator →</button></div>) : (<button onClick={() => setActiveTab('mortgage')} style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #1e3a5f, #0f172a)', borderRadius: '12px', border: '2px dashed #3b82f6', cursor: 'pointer', width: '100%', textAlign: 'left' as const }}><div style={{ color: '#f1f5f9', fontWeight: 600 }}>🏠 See your mortgage-free date</div><div style={{ color: '#64748b', fontSize: '13px' }}>Enter your mortgage details →</div></button>)}

            {/* Quick Nav */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>{[{ tab: 'insights', icon: '🧠', label: 'Insights' }, { tab: 'mortgage', icon: '🚀', label: 'Mortgage' }, { tab: 'grow', icon: '📈', label: 'Grow' }, { tab: 'review', icon: '🔄', label: 'Review' }].map(n => (<button key={n.tab} onClick={() => setActiveTab(n.tab as any)} style={{ padding: '14px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as const }}><div style={{ fontSize: '22px', marginBottom: '6px' }}>{n.icon}</div><div style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>{n.label}</div></button>))}</div>
          </div>
        )}

        {/* ==================== CHAT TAB ==================== */}
        {activeTab === 'chat' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: `linear-gradient(135deg, ${theme.success}15, ${theme.purple}15)`, border: '2px solid ' + theme.success, borderRadius: '20px', padding: '24px', minHeight: '70vh', display: 'flex', flexDirection: 'column' as const }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid ' + theme.border }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fcd34d' }}><span style={{ color: '#78350f', fontWeight: 800, fontSize: '28px' }}>A</span></div>
                <div><div style={{ color: theme.text, fontWeight: 700, fontSize: '22px' }}>Aureus</div><div style={{ color: theme.textMuted, fontSize: '13px' }}>Your financial coach · {currentBabyStep.title}</div></div>
              </div>
              <div style={{ padding: '8px 12px', background: theme.warning + '15', borderRadius: '8px', marginBottom: '12px', border: '1px solid ' + theme.warning + '30' }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '11px' }}>⚠️ AI assistant, not financial advisor. Verify with professionals.</p></div>
              <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto' as const, marginBottom: '16px', padding: '8px' }}>
                {chatMessages.length === 0 && (<div style={{ padding: '20px 10px' }}>{!moneyPersonality ? (<div style={{ marginBottom: '24px', padding: '24px', background: 'linear-gradient(135deg, #8b5cf615, #3b82f615)', borderRadius: '16px', border: '2px solid ' + theme.purple + '50', textAlign: 'center' as const }}><div style={{ fontSize: '44px', marginBottom: '12px' }}>🧠</div><div style={{ color: theme.text, fontWeight: 700, fontSize: '17px', marginBottom: '8px' }}>First, let me get to know you.</div><button onClick={() => { setShowOnboarding(true); setOnboardingStep(0) }} style={{ ...btnPurple, padding: '14px 32px', fontSize: '15px', width: '100%' }}>Start personality quiz →</button></div>) : (<div style={{ marginBottom: '20px', padding: '16px', background: personalityProfiles[moneyPersonality]?.color + '15', borderRadius: '12px', border: '1px solid ' + personalityProfiles[moneyPersonality]?.color + '40', display: 'flex', alignItems: 'center', gap: '14px' }}><span style={{ fontSize: '32px' }}>{personalityProfiles[moneyPersonality]?.emoji}</span><div><div style={{ color: personalityProfiles[moneyPersonality]?.color, fontWeight: 700, fontSize: '14px' }}>{personalityProfiles[moneyPersonality]?.label}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>Coaching tailored to you.</div></div></div>)}<div style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '12px', textAlign: 'center' as const }}>Or jump in:</div><div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px', justifyContent: 'center' }}>{['How do I pay my mortgage off faster?', 'Should I use an offset account?', 'Am I on track financially?'].map(q => (<button key={q} onClick={() => { setChatInput(q); setTimeout(() => handleChatMessage(), 50) }} style={{ padding: '8px 14px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '20px', color: theme.text, cursor: 'pointer', fontSize: '13px' }}>{q}</button>))}</div></div>)}
                {chatMessages.map((msg, idx) => (<div key={idx} style={{ marginBottom: '16px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}><div style={{ maxWidth: '85%', padding: '14px 18px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.role === 'user' ? theme.accent : theme.cardBg, color: msg.role === 'user' ? 'white' : theme.text, fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-wrap' as const }}>{msg.content}</div></div>))}
                {isLoading && <div style={{ padding: '16px', color: theme.textMuted }}>Aureus is thinking...</div>}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}><input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChatMessage()} placeholder="Ask Aureus anything..." style={{ ...inputStyle, flex: 1, padding: '14px 18px', fontSize: '15px' }} disabled={isLoading} /><button onClick={handleChatMessage} disabled={isLoading || !chatInput.trim()} style={{ ...btnSuccess, padding: '14px 24px', opacity: isLoading || !chatInput.trim() ? 0.5 : 1 }}>Send</button></div>
            </div>
          </div>
        )}

        {/* ==================== DASHBOARD TAB (Budget) ==================== */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              {[{ label: 'Income /mo', value: `$${monthlyIncome.toFixed(0)}`, color: theme.success }, { label: 'Expenses /mo', value: `$${monthlyExpenses.toFixed(0)}`, color: theme.danger }, { label: 'Debt Payments', value: `$${monthlyDebtPayments.toFixed(0)}`, color: theme.warning }, { label: 'Goal Savings', value: `$${monthlyGoalSavings.toFixed(0)}`, color: theme.purple }, { label: 'Net /mo', value: `$${monthlySurplus.toFixed(0)}`, color: monthlySurplus >= 0 ? theme.success : theme.danger }].map(m => (<div key={m.label} style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>{m.label}</div><div style={{ color: m.color, fontSize: '24px', fontWeight: 700 }}>{m.value}</div></div>))}
            </div>

            {/* Income Section */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><h3 style={{ margin: 0, color: theme.success, fontSize: '18px' }}>💰 Income</h3><div><button onClick={() => payslipInputRef.current?.click()} style={{ padding: '4px 10px', background: theme.purple, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>📄 Payslip</button><span style={{ marginLeft: '8px', color: theme.success, fontWeight: 700 }}>${monthlyIncome.toFixed(0)}/mo</span></div></div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px', marginBottom: '12px', padding: '12px', background: theme.bg, borderRadius: '10px', border: '1px solid ' + theme.border }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}><input placeholder="Source" value={newIncome.name} onChange={e => setNewIncome({...newIncome, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '100px'}} /><input placeholder="$" type="number" value={newIncome.amount} onChange={e => setNewIncome({...newIncome, amount: e.target.value})} style={{...inputStyle, width: '90px'}} /><select value={newIncome.frequency} onChange={e => { const newFreq = e.target.value; let newStartDate = newIncome.startDate; if (newFreq === 'weekly') { newStartDate = getNextDateForDayOfWeek(new Date().getDay()) } else if (newFreq === 'fortnightly') { newStartDate = getFortnightlyDateFromAnchor(1) } else if (newFreq === 'monthly' || newFreq === 'quarterly' || newFreq === 'yearly') { newStartDate = getNextDateForDayOfMonth(1, newFreq) } setNewIncome({...newIncome, frequency: newFreq, startDate: newStartDate}) }} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select><select value={newIncome.type} onChange={e => setNewIncome({...newIncome, type: e.target.value})} style={inputStyle}><option value="active">Active</option><option value="passive">Passive</option></select></div>
                <SmartDatePicker frequency={newIncome.frequency} value={newIncome.startDate} onChange={v => setNewIncome({...newIncome, startDate: v})} label="Pay day" />
                <button onClick={addIncome} style={{...btnSuccess, alignSelf: 'flex-start' as const, padding: '8px 16px'}}>+ Add income</button>
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto' as const }}>{incomeStreams.map(inc => (<div key={inc.id} style={{ padding: '10px 12px', marginBottom: '6px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ color: theme.text, fontWeight: 600 }}>{inc.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{inc.frequency} · {inc.type}</div></div><div><span style={{ color: theme.success, fontWeight: 700 }}>${inc.amount}</span><button onClick={() => deleteIncome(inc.id)} style={{ marginLeft: '8px', padding: '3px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>×</button></div></div>))}</div>
            </div>

            {/* Expenses Section */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><h3 style={{ margin: 0, color: theme.danger, fontSize: '18px' }}>💸 Bills</h3><div><button onClick={() => setShowPresets(!showPresets)} style={{ padding: '4px 10px', background: theme.purple, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>+ Presets</button><span style={{ marginLeft: '8px', color: theme.danger, fontWeight: 700 }}>${monthlyExpenses.toFixed(0)}/mo</span></div></div>
              {showPresets && (<div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '12px', padding: '10px', background: theme.bg, borderRadius: '8px' }}>{presetBills.map(p => <button key={p.name} onClick={() => { const amt = prompt(`Amount for ${p.name}:`, (p as any).amount || ''); if (amt) setExpenses([...expenses, { id: Date.now(), name: p.name, amount: amt, frequency: p.frequency, category: p.category, dueDate: new Date().toISOString().split('T')[0] }]) }} style={{ padding: '4px 10px', background: theme.purple + '20', color: theme.purple, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{p.name}</button>)}</div>)}
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px', marginBottom: '12px', padding: '12px', background: theme.bg, borderRadius: '10px', border: '1px solid ' + theme.border }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}><input placeholder="Bill name" value={newExpense.name} onChange={e => setNewExpense({...newExpense, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '100px'}} /><input placeholder="$" type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} style={{...inputStyle, width: '80px'}} /><select value={newExpense.frequency} onChange={e => { const newFreq = e.target.value; let newDueDate = newExpense.dueDate; if (newFreq === 'weekly') { newDueDate = getNextDateForDayOfWeek(new Date().getDay()) } else if (newFreq === 'fortnightly') { newDueDate = getFortnightlyDateFromAnchor(1) } else if (newFreq === 'monthly' || newFreq === 'quarterly' || newFreq === 'yearly') { newDueDate = getNextDateForDayOfMonth(1, newFreq) } setNewExpense({...newExpense, frequency: newFreq, dueDate: newDueDate}) }} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select><button onClick={addExpense} style={btnDanger}>+</button></div>
                <SmartDatePicker frequency={newExpense.frequency} value={newExpense.dueDate} onChange={v => setNewExpense({...newExpense, dueDate: v})} label="Due day" />
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto' as const }}>{expenses.filter(e => !e.targetDebtId && !e.targetGoalId).map(exp => (<div key={exp.id} style={{ padding: '10px 12px', marginBottom: '6px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ color: theme.text, fontWeight: 600 }}>{exp.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{exp.frequency}</div></div><div><span style={{ color: theme.danger, fontWeight: 700 }}>${exp.amount}</span><button onClick={() => deleteExpense(exp.id)} style={{ marginLeft: '8px', padding: '3px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>×</button></div></div>))}</div>
            </div>

            {/* Calendar */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))} style={{ ...btnPrimary, padding: '8px 16px' }}>←</button><h3 style={{ margin: 0, color: theme.text }}>{calendarMonth.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}</h3><button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))} style={{ ...btnPrimary, padding: '8px 16px' }}>→</button></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} style={{ textAlign: 'center' as const, fontWeight: 600, color: theme.textMuted, padding: '8px', fontSize: '12px' }}>{d}</div>)}{Array(getDaysInMonth().firstDay).fill(null).map((_, i) => <div key={'e'+i} />)}{Array(getDaysInMonth().daysInMonth).fill(null).map((_, i) => { const day = i + 1; const items = getCalendarItemsForDay(day); const isToday = day === new Date().getDate() && calendarMonth.getMonth() === new Date().getMonth() && calendarMonth.getFullYear() === new Date().getFullYear(); return (<div key={day} onClick={() => items.length > 0 && setExpandedDay({ day, items })} style={{ minHeight: '70px', padding: '4px', background: isToday ? theme.accent + '20' : darkMode ? '#1e293b' : '#f8fafc', borderRadius: '8px', border: isToday ? '2px solid ' + theme.accent : '1px solid ' + theme.border, cursor: items.length > 0 ? 'pointer' : 'default' }}><div style={{ fontWeight: 600, color: theme.text, marginBottom: '2px', fontSize: '12px' }}>{day}</div>{items.slice(0, 2).map(item => <div key={item.itemId} style={{ fontSize: '9px', padding: '1px 4px', marginBottom: '2px', background: item.itemType === 'income' ? '#d1fae5' : item.itemType === 'goal' ? '#ede9fe' : item.itemType === 'expense' ? '#dbeafe' : '#fee2e2', color: '#1e293b', borderRadius: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, opacity: item.isPaid ? 0.5 : 1 }}>{item.name}</div>)}{items.length > 2 && <div style={{ fontSize: '9px', color: theme.accent }}>+{items.length - 2}</div>}</div>)})}</div>
            </div>

            {/* Debts & Goals Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={cardStyle} data-section="debts"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><h3 style={{ margin: 0, color: theme.warning, fontSize: '18px' }}>💳 Debts</h3><span style={{ color: theme.warning, fontWeight: 700 }}>${totalDebtBalance.toFixed(0)}</span></div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px', marginBottom: '12px', padding: '12px', background: theme.bg, borderRadius: '10px', border: '1px solid ' + theme.border }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}><input placeholder="Debt name" value={newDebt.name} onChange={e => setNewDebt({...newDebt, name: e.target.value})} style={{...inputStyle, flex: 1}} /><input placeholder="Balance" type="number" value={newDebt.balance} onChange={e => setNewDebt({...newDebt, balance: e.target.value})} style={{...inputStyle, width: '100px'}} /><input placeholder="Rate %" type="number" value={newDebt.interestRate} onChange={e => setNewDebt({...newDebt,
                                                                                                                                                                                                                                                                                                                                                                     <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}><input placeholder="Debt name" value={newDebt.name} onChange={e => setNewDebt({...newDebt, name: e.target.value})} style={{...inputStyle, flex: 1}} /><input placeholder="Balance" type="number" value={newDebt.balance} onChange={e => setNewDebt({...newDebt, balance: e.target.value})} style={{...inputStyle, width: '100px'}} /><input placeholder="Rate %" type="number" value={newDebt.interestRate} onChange={e => setNewDebt({...newDebt, interestRate: e.target.value})} style={{...inputStyle, width: '70px'}} /><input placeholder="Payment" type="number" value={newDebt.minPayment} onChange={e => setNewDebt({...newDebt, minPayment: e.target.value})} style={{...inputStyle, width: '80px'}} /><select value={newDebt.frequency} onChange={e => { const newFreq = e.target.value; let newPaymentDate = newDebt.paymentDate; if (newFreq === 'weekly') { newPaymentDate = getNextDateForDayOfWeek(1) } else if (newFreq === 'fortnightly') { newPaymentDate = getFortnightlyDateFromAnchor(1) } else if (newFreq === 'monthly') { newPaymentDate = getNextDateForDayOfMonth(1, newFreq) } setNewDebt({...newDebt, frequency: newFreq, paymentDate: newPaymentDate}) }} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select></div>
                  <SmartDatePicker frequency={newDebt.frequency || 'monthly'} value={newDebt.paymentDate} onChange={v => setNewDebt({...newDebt, paymentDate: v})} label="Payment due" />
                  <button onClick={addDebt} style={{...btnWarning, alignSelf: 'flex-start' as const, padding: '8px 16px'}}>+ Add debt</button>
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto' as const }}>{debts.map(debt => (<div key={debt.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#3a2e1e' : '#fefce8', borderRadius: '10px', border: '1px solid ' + theme.border }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><div><div style={{ color: theme.text, fontWeight: 600 }}>{debt.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{debt.interestRate}% · ${debt.minPayment}/{debt.frequency || 'monthly'}</div></div><div><span style={{ color: theme.warning, fontWeight: 700 }}>${parseFloat(debt.balance).toFixed(0)}</span><button onClick={() => deleteDebt(debt.id)} style={{ marginLeft: '8px', padding: '2px 6px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>×</button></div></div></div>))}</div>
              </div>

              <div style={cardStyle}><h3 style={{ margin: '0 0 16px 0', color: theme.purple, fontSize: '18px' }}>🎯 Goals</h3>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' as const }}><input placeholder="Goal name" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} style={{...inputStyle, flex: 1}} /><input placeholder="Target $" type="number" value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: e.target.value})} style={{...inputStyle, width: '100px'}} /><input placeholder="Saved $" type="number" value={newGoal.saved} onChange={e => setNewGoal({...newGoal, saved: e.target.value})} style={{...inputStyle, width: '80px'}} /><button onClick={addGoal} style={btnPurple}>+</button></div>
                <div style={{ maxHeight: '250px', overflowY: 'auto' as const }}>{goals.map(goal => { const pct = (parseFloat(goal.saved || '0') / parseFloat(goal.target || '1')) * 100; return (<div key={goal.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#2e1e3a' : '#faf5ff', borderRadius: '10px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><div><div style={{ color: theme.text, fontWeight: 600 }}>{goal.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>${parseFloat(goal.saved || '0').toFixed(0)} / ${parseFloat(goal.target || '0').toFixed(0)}</div></div><div><span style={{ color: theme.purple, fontWeight: 700 }}>{pct.toFixed(0)}%</span><button onClick={() => deleteGoal(goal.id)} style={{ marginLeft: '8px', padding: '2px 6px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>×</button></div></div><div style={{ height: '6px', background: theme.border, borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: theme.purple }} /></div></div>)})}</div>
              </div>
            </div>

            {/* Assets */}
            <div style={cardStyle}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><h3 style={{ margin: 0, color: theme.success, fontSize: '18px' }}>📦 Assets</h3><div><span style={{ color: theme.success, fontWeight: 700 }}>${totalAssets.toLocaleString()}</span> <span style={{ color: theme.textMuted, fontSize: '12px' }}>Net Worth: <span style={{ color: netWorth >= 0 ? theme.success : theme.danger }}>${netWorth.toLocaleString()}</span></span></div></div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}><input placeholder="Asset name" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} style={{...inputStyle, flex: 1}} /><input placeholder="Value" type="number" value={newAsset.value} onChange={e => setNewAsset({...newAsset, value: e.target.value})} style={{...inputStyle, width: '100px'}} /><select value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} style={inputStyle}><option value="savings">💰 Savings</option><option value="super">🏦 Super</option><option value="investment">📊 Investment</option><option value="property">🏠 Property</option><option value="vehicle">🚗 Vehicle</option></select><button onClick={addAsset} style={btnSuccess}>+</button></div>
              {assets.map(a => (<div key={a.id} style={{ padding: '10px 12px', marginBottom: '6px', background: theme.bg, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><span style={{ color: theme.text }}>{a.name}</span><span style={{ color: theme.textMuted, fontSize: '11px', marginLeft: '8px' }}>{a.type}</span></div><div><span style={{ color: theme.success, fontWeight: 700 }}>${parseFloat(a.value).toLocaleString()}</span><button onClick={() => deleteAsset(a.id)} style={{ marginLeft: '8px', padding: '2px 6px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>×</button></div></div>))}
            </div>
          </div>
        )}

        {/* ==================== MORTGAGE TAB ==================== */}
        {activeTab === 'mortgage' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            <div style={{ padding: '12px 16px', background: theme.warning + '15', borderRadius: '10px', border: '1px solid ' + theme.warning + '40' }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '12px' }}>⚠️ Education only. Consult a licensed mortgage broker.</p></div>
            <div style={{ padding: '32px', background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', borderRadius: '20px', border: '2px solid #3b82f6', textAlign: 'center' as const }}>
              <div style={{ color: '#94a3b8', fontSize: '12px', letterSpacing: '3px', marginBottom: '8px' }}>🏠 MORTGAGE FREE TARGET</div>
              {mortgageResult ? (<div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' as const }}><div><div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Current</div><div style={{ color: '#ef4444', fontSize: '40px', fontWeight: 800 }}>{mortgageResult.standard.freeYear}</div><div style={{ color: '#94a3b8', fontSize: '12px' }}>{mortgageResult.standard.years.toFixed(1)} yrs</div></div>{parseFloat(mortgageAccel.extraRepayment || '0') > 0 && (<div><div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>With extra</div><div style={{ color: '#10b981', fontSize: '40px', fontWeight: 800 }}>{mortgageResult.withExtra.freeYear}</div><div style={{ color: '#10b981', fontSize: '13px' }}>{mortgageResult.withExtra.yearsSaved.toFixed(1)} yrs saved</div></div>)}</div>) : (<div><div style={{ color: '#f1f5f9', fontSize: '20px', marginBottom: '8px' }}>Enter your mortgage details below</div></div>)}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>{[{ id: 'calculator', label: '🧮 Calculator' }, { id: 'offset', label: '💡 Offset' }, { id: 'strategy', label: '📋 Strategy' }].map(t => (<button key={t.id} onClick={() => setMortgageTab(t.id as any)} style={{ padding: '10px 18px', background: mortgageTab === t.id ? theme.accent : theme.cardBg, color: mortgageTab === t.id ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{t.label}</button>))}</div>

            {mortgageTab === 'calculator' && (<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={cardStyle}><h3 style={{ margin: '0 0 20px 0', color: theme.text }}>Your Mortgage</h3><div style={{ display: 'flex', flexDirection: 'column' as const, gap: '14px' }}><div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Frequency</label><select value={mortgageAccel.repaymentFrequency} onChange={e => setMortgageAccel({...mortgageAccel, repaymentFrequency: e.target.value})} style={{...inputStyle, width: '100%'}}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select></div><div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Balance ($)</label><input type="number" value={mortgageAccel.balance} onChange={e => setMortgageAccel({...mortgageAccel, balance: e.target.value})} style={{...inputStyle, width: '100%'}} /></div><div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Rate (%)</label><input type="number" step="0.01" value={mortgageAccel.rate} onChange={e => setMortgageAccel({...mortgageAccel, rate: e.target.value})} style={{...inputStyle, width: '100%'}} /></div><div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Years left</label><input type="number" value={mortgageAccel.remainingYears} onChange={e => setMortgageAccel({...mortgageAccel, remainingYears: e.target.value})} style={{...inputStyle, width: '100%'}} /></div><div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Actual repayment</label><input type="number" value={mortgageAccel.currentRepayment} onChange={e => setMortgageAccel({...mortgageAccel, currentRepayment: e.target.value})} style={{...inputStyle, width: '100%'}} /></div><div style={{ borderTop: '1px solid ' + theme.border, paddingTop: '16px' }}><div style={{ color: theme.success, fontWeight: 600, marginBottom: '10px' }}>💪 Extra Repayment</div><input type="number" value={mortgageAccel.extraRepayment} onChange={e => setMortgageAccel({...mortgageAccel, extraRepayment: e.target.value})} placeholder="e.g. 200" style={{...inputStyle, width: '100%'}} /></div></div></div>
              <div><div style={cardStyle}><h4 style={{ color: theme.danger }}>Current</h4><div>Years: {mortgageResult?.standard.years.toFixed(1)}</div><div>Interest: ${Math.round(mortgageResult?.standard.interest || 0).toLocaleString()}</div><div>Free: {mortgageResult?.standard.freeYear}</div></div>{parseFloat(mortgageAccel.extraRepayment || '0') > 0 && (<div style={{ ...cardStyle, border: '2px solid ' + theme.success, marginTop: '16px' }}><h4 style={{ color: theme.success }}>With Extra</h4><div>Years: {mortgageResult?.withExtra.years.toFixed(1)}</div><div>Saved: ${Math.round(mortgageResult?.withExtra.interestSaved || 0).toLocaleString()}</div><div>Free: {mortgageResult?.withExtra.freeYear}</div></div>)}</div>
            </div>)}
          </div>
        )}

        {/* ==================== INSIGHTS TAB ==================== */}
        {activeTab === 'insights' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            {moneyPersonality && personalityProfiles[moneyPersonality] ? (<div style={{ padding: '24px', background: `linear-gradient(135deg, ${personalityProfiles[moneyPersonality].color}20, ${personalityProfiles[moneyPersonality].color}05)`, borderRadius: '20px', border: `2px solid ${personalityProfiles[moneyPersonality].color}40` }}><div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}><div style={{ fontSize: '56px' }}>{personalityProfiles[moneyPersonality].emoji}</div><div><div style={{ color: theme.textMuted, fontSize: '11px', letterSpacing: '2px' }}>YOUR MONEY PERSONALITY</div><h2 style={{ margin: 0, color: theme.text, fontSize: '24px' }}>{personalityProfiles[moneyPersonality].label}</h2></div></div><div style={{ marginTop: '16px', padding: '14px', background: theme.cardBg, borderRadius: '12px', borderLeft: '4px solid ' + personalityProfiles[moneyPersonality].color }}><div style={{ color: personalityProfiles[moneyPersonality].color, fontWeight: 700 }}>🎯 AUREUS FOCUS</div><div style={{ color: theme.text, fontSize: '13px' }}>{personalityProfiles[moneyPersonality].aureusFocus}</div></div></div>) : (<div style={{ padding: '24px', background: theme.cardBg, borderRadius: '20px', border: '2px dashed ' + theme.border, textAlign: 'center' as const }}><div style={{ fontSize: '48px' }}>🧠</div><h3 style={{ color: theme.text }}>Discover your Money Personality</h3><button onClick={() => { setShowOnboarding(true); setOnboardingStep(1) }} style={{ ...btnPrimary, padding: '12px 24px' }}>Take the Quiz →</button></div>)}
            
            <div style={cardStyle}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><h3 style={{ margin: 0, color: theme.text }}>🧠 Aureus Notices</h3><button onClick={generateProactiveInsights} disabled={loadingInsights} style={{ ...btnPrimary, padding: '8px 16px' }}>{loadingInsights ? '...' : 'Refresh'}</button></div>{proactiveInsights.map((insight, i) => (<div key={i} style={{ padding: '14px 16px', background: theme.bg, borderRadius: '10px', marginBottom: '8px', border: '1px solid ' + theme.border }}>{insight}</div>))}</div>
            
            <div style={cardStyle}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><h3 style={{ margin: 0, color: theme.warning }}>🎯 Your ONE Decision</h3><button onClick={generateOneDecision} disabled={loadingOneDecision} style={{ ...btnWarning, padding: '8px 16px' }}>{loadingOneDecision ? '...' : oneDecision ? 'New' : 'Generate'}</button></div>{oneDecision && (<div style={{ padding: '20px', background: `linear-gradient(135deg, ${theme.warning}15, ${theme.orange}10)`, borderRadius: '12px', border: '2px solid ' + theme.warning + '40' }}>{oneDecision}</div>)}</div>
            
            <div style={cardStyle}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><h3 style={{ margin: 0, color: theme.text }}>☕ Latte Factor</h3></div>${totalLatteMonthly.toFixed(0)}/mo = ${Math.round(totalLatteImpact / 1000)}k over {latteYears} years</div>
          </div>
        )}

        {/* ==================== PATH TAB ==================== */}
        {activeTab === 'path' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            <div style={cardStyle}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}><h2 style={{ margin: 0, color: theme.text }}>🗺️ My Roadmap</h2><button onClick={() => setShowAddMilestone(true)} style={{ ...btnPurple }}>+ Add Milestone</button></div>{roadmapMilestones.map(m => (<div key={m.id} style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', marginBottom: '12px', border: '1px solid ' + theme.border }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '24px' }}>{m.icon || '🎯'}</span><div style={{ flex: 1 }}><div style={{ fontWeight: 600, color: theme.text }}>{m.name}</div><div style={{ fontSize: '12px', color: theme.textMuted }}>{m.notes}</div></div><button onClick={() => generateWeeklyPlan(m.id)} style={{ ...btnSuccess, padding: '6px 12px', fontSize: '12px' }}>Generate Plan</button></div></div>))}</div>
            <div style={cardStyle}><h2 style={{ margin: '0 0 20px 0', color: theme.text }}>👶 Australian Baby Steps</h2>{australianBabySteps.map(item => (<div key={item.step} style={{ padding: '12px', marginBottom: '8px', background: item.step === currentBabyStep.step ? theme.warning + '20' : theme.bg, borderRadius: '8px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '24px' }}>{item.icon}</span><div><div style={{ fontWeight: 600 }}>{item.title}</div><div style={{ fontSize: '12px', color: theme.textMuted }}>{item.desc}</div></div></div></div>))}</div>
          </div>
        )}

        {/* ==================== REVIEW, GROW, OVERVIEW, LEARN, WINS TABS ==================== */}
        {activeTab === 'review' && (<div style={cardStyle}><h3>💰 Money Date</h3><button onClick={() => { setShowMoneyDate(true); setMoneyDateStep(0); setMoneyDateAnswers({}) }} style={btnSuccess}>Start Money Date →</button><div style={{ marginTop: '16px' }}>Streak: {streak} weeks</div></div>)}
        {activeTab === 'grow' && (<div style={cardStyle}><h3>📈 Wealth Trajectory</h3><div>Net Worth: ${netWorth.toLocaleString()}</div><div>Passive Income: ${passiveIncome.toFixed(0)}/mo</div><div>FIRE Number: ${fiPath.fireNumber.toLocaleString()}</div></div>)}
        {activeTab === 'overview' && (<div style={cardStyle}><h3>📊 Financial Health Score</h3><div style={{ fontSize: '48px', fontWeight: 'bold', color: financialHealthScore >= 70 ? theme.success : financialHealthScore >= 40 ? theme.warning : theme.danger }}>{financialHealthScore}</div></div>)}
        {activeTab === 'learn' && (<div style={cardStyle}><h3>🎓 Financial Literacy</h3>{literacyTopics.map(topic => (<div key={topic.id} style={{ padding: '12px', marginBottom: '8px', borderBottom: '1px solid ' + theme.border }}><div style={{ fontWeight: 600 }}>{topic.icon} {topic.title}</div><div style={{ fontSize: '12px', color: theme.textMuted }}>{topic.tagline}</div></div>))}</div>)}
        {activeTab === 'wins' && (<div style={cardStyle}><h3>🏆 Your Wins</h3><div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}><input value={newWinText} onChange={e => setNewWinText(e.target.value)} placeholder="Record a win..." style={{...inputStyle, flex: 1}} /><button onClick={() => { if (newWinText.trim()) { setWins(prev => [...prev, { id: Date.now(), title: newWinText.trim(), desc: 'Added manually', icon: '⭐', auto: false, date: new Date().toISOString() }]); setNewWinText('') } }} style={btnSuccess}>+</button></div>{wins.slice().reverse().slice(0, 10).map(win => (<div key={win.id} style={{ padding: '10px', marginBottom: '8px', background: win.auto ? theme.success + '15' : theme.warning + '15', borderRadius: '8px' }}><div style={{ fontWeight: 600 }}>{win.icon} {win.title}</div><div style={{ fontSize: '12px' }}>{win.desc}</div></div>))}</div>)}

      </main>

      <footer style={{ padding: '16px 24px', background: theme.cardBg, borderTop: '1px solid ' + theme.border, textAlign: 'center' as const }}>
        <p style={{ margin: '0 0 4px 0', color: theme.textMuted, fontSize: '11px' }}>⚠️ Aureus is an AI assistant for general education only — not financial, tax, or legal advice.</p>
        <p style={{ margin: 0, color: theme.textMuted, fontSize: '10px' }}>© {new Date().getFullYear()} Aureus · General information only</p>
      </footer>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } } @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } } * { box-sizing: border-box; } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }`}</style>
    </div>
  )
}                                                                                                                                                                              
