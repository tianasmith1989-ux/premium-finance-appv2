'use client'

import { useUser } from '@clerk/nextjs'
import React, { useState, useEffect, useRef } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  // ==================== APP MODE & NAVIGATION ====================
  const [appMode, setAppMode] = useState<'budget' | null>(null)
  const [showModeSelector, setShowModeSelector] = useState(true)
  const [activeTab, setActiveTab] = useState<'chat' | 'quickview' | 'dashboard' | 'overview' | 'path' | 'academy'>('chat')
  const [darkMode, setDarkMode] = useState(true)
  
  // ==================== TOUR STATE ====================
  const [showTour, setShowTour] = useState(false)
  const [tourStep, setTourStep] = useState(0)
  const [budgetTourCompleted, setBudgetTourCompleted] = useState(false)
  
  // ==================== UPLOAD STATE ====================
  const [showPayslipUpload, setShowPayslipUpload] = useState(false)
  const [payslipProcessing, setPayslipProcessing] = useState(false)
  const [extractedPayslip, setExtractedPayslip] = useState<any>(null)
  const payslipInputRef = useRef<HTMLInputElement>(null)
  
  // ==================== AUTOMATION STATE ====================
  const [showAutomation, setShowAutomation] = useState(false)
  
  // ==================== ACADEMY STATE ====================
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [showModuleContent, setShowModuleContent] = useState(false)
  
  const learningModules = [
    {
      id: 1,
      title: "Psychology of Money",
      icon: "🧠",
      description: "Understanding why we make bad money decisions and how to fix them",
      color: "#8b5cf6",
      lessons: [
        { id: 1, title: "The Offset Account Trap", content: "Money sitting in an offset account is 'available to spend' in our minds. This is why most people with offset accounts still take 25-30 years to pay off their mortgage. The psychology is simple: if you can see it, you'll spend it.", keyInsight: "Money in offset = temptation. Money in redraw = commitment. Park your savings in the redraw facility and only withdraw what you've budgeted.", action: "Check if your loan has a redraw facility" },
        { id: 2, title: "Every Dollar Has a Purpose", content: "The most successful wealth builders don't have more money - they have more intentionality. Before every payday, sit down and assign every single dollar a job. Bills, savings, investments, debt payoff, spending money - everything gets a purpose.", keyInsight: "A dollar without a job will find one - usually in the wrong place. Give every dollar a purpose before it hits your account.", action: "Try assigning every dollar from your next pay" },
        { id: 3, title: "The Reward System Trap", content: "We're wired to seek dopamine hits. Spending money gives us that hit. But debt payoff and saving don't give the same immediate reward. This is why we need to create artificial rewards for good financial behavior.", keyInsight: "Create small celebrations for financial wins. Paid off $1,000? Treat yourself to a $20 dinner. The brain will rewire to seek financial wins.", action: "Plan a reward for your next financial milestone" }
      ]
    },
    {
      id: 2,
      title: "Redraw vs Offset Strategy",
      icon: "🔄",
      description: "How to use loan structure to pay off your home in 7-10 years",
      color: "#10b981",
      lessons: [
        { id: 4, title: "Interest: The Silent Wealth Killer", content: "On a $500,000 mortgage at 6% over 30 years, you'll pay $579,000 in interest - more than the house itself! But by restructuring how you manage money, you can slash this dramatically without earning an extra dollar.", keyInsight: "Interest is calculated DAILY on your balance. Every day your balance is lower means less interest charged tomorrow.", action: "Calculate how much interest you'll pay over your current loan term" },
        { id: 5, title: "The Redraw Advantage", content: "Instead of keeping money in an offset account where you can see (and spend) it, park all surplus money directly into your mortgage via redraw. Then, redraw ONLY what you need for budgeted expenses. The remaining money keeps working to reduce your principal.", keyInsight: "A $500K loan with $50K consistently in redraw saves $165,000 in interest and pays off 11 years faster.", action: "Ask your lender about redraw vs offset features" },
        { id: 6, title: "Structure Over Rate", content: "Here's a truth most brokers won't tell you: A well-structured loan at 6.5% will save you more money than a poorly structured one at 5.5%. The structure (redraw access, extra payment flexibility, fee structure) matters more than the rate.", keyInsight: "DON'T chase the cheapest rate. DO optimize your loan structure for maximum flexibility and extra payments.", action: "Review your current loan structure" }
      ]
    },
    {
      id: 3,
      title: "Debt Elimination Blueprint",
      icon: "💳",
      description: "Strategies to become completely debt-free faster than you thought possible",
      color: "#f59e0b",
      lessons: [
        { id: 7, title: "The Snowball vs Avalanche Debate", content: "Snowball (smallest debt first) gives psychological wins. Avalanche (highest interest first) saves the most money mathematically. But here's what research shows: Snowball works better for most people because psychology beats math in personal finance.", keyInsight: "Choose the method that you'll STICK WITH. Consistency beats optimization every time.", action: "List all your debts from smallest to largest" },
        { id: 8, title: "Debt Consolidation: When It Works", content: "Consolidation can simplify payments and lower interest rates. But WARNING: If you don't fix the underlying spending habits, you'll end up with consolidated debt AND new credit card debt. Fix behavior first, then consolidate.", keyInsight: "Consolidation is a tool, not a solution. Without behavior change, it makes things worse.", action: "Track your spending for 30 days before considering consolidation" }
      ]
    },
    {
      id: 4,
      title: "Wealth Building Fundamentals",
      icon: "📈",
      description: "Beyond debt freedom - building lasting wealth through multiple income streams",
      color: "#3b82f6",
      lessons: [
        { id: 9, title: "The Three Wealth Buckets", content: "Wealth builders have three things: 1) A cash buffer (emergency fund), 2) Growth assets (property, shares, ETFs), and 3) Income-producing assets (rental property, dividend stocks, business). Start with bucket 1, then build 2 and 3 simultaneously.", keyInsight: "Don't put all your wealth-building eggs in one basket. Diversify across all three buckets.", action: "Identify which bucket you need to focus on right now" },
        { id: 10, title: "Equity Is Your Secret Weapon", content: "Your home equity isn't just a number on paper. It's collateral for building more wealth. Once you have significant equity, you can use it to invest in property or other assets - but ONLY when you understand the risks and have a solid plan.", keyInsight: "Equity = opportunity. But leverage = risk. Never borrow more than you can comfortably service.", action: "Calculate your current home equity" }
      ]
    }
  ]
  
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
  
  // Edit State
  const [editingItem, setEditingItem] = useState<{type: string, id: number, data: any} | null>(null)
  
  // Home Buying Guide State
  const [homeGuideExpanded, setHomeGuideExpanded] = useState<string | null>(null)
  const [homeCalcState, setHomeCalcState] = useState('QLD')
  const [homeCalcFirstHome, setHomeCalcFirstHome] = useState(true)
  const [homeCalcNewBuild, setHomeCalcNewBuild] = useState(false)
  const [homeDocuments, setHomeDocuments] = useState<{name: string, type: string, uploadedAt: string}[]>([])
  const homeDocInputRef = useRef<HTMLInputElement>(null)
  const [homeBuyingPrice, setHomeBuyingPrice] = useState('')
  
  // Roadmap
  const [roadmapMilestones, setRoadmapMilestones] = useState<any[]>([])
  const [showAddMilestone, setShowAddMilestone] = useState(false)
  const [newMilestone, setNewMilestone] = useState({ 
    name: '', targetAmount: '', targetDate: '', category: 'savings', icon: '🎯', notes: ''
  })
  
  // Alerts
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [alertDaysBefore, setAlertDaysBefore] = useState(2)
  
  // Country
  const [userCountry, setUserCountry] = useState<'AU' | 'US' | 'UK' | 'NZ' | 'CA'>('AU')
  
  const countryConfig: {[key: string]: any} = {
    AU: { name: 'Australia', flag: '🇦🇺', currency: 'AUD', currencySymbol: '$', retirement: 'Superannuation (Super)', benefits: 'Centrelink', payFrequency: 'fortnightly', terminology: { retirement: 'Super', benefits: 'Centrelink' } },
    US: { name: 'United States', flag: '🇺🇸', currency: 'USD', currencySymbol: '$', retirement: '401(k), IRA', benefits: 'Social Security', payFrequency: 'biweekly', terminology: { retirement: '401k/IRA', benefits: 'Social Security' } },
    UK: { name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', currencySymbol: '£', retirement: 'Pension, SIPP, ISA', benefits: 'Universal Credit', payFrequency: 'monthly', terminology: { retirement: 'Pension', benefits: 'Universal Credit' } },
    NZ: { name: 'New Zealand', flag: '🇳🇿', currency: 'NZD', currencySymbol: '$', retirement: 'KiwiSaver', benefits: 'Work and Income NZ', payFrequency: 'fortnightly', terminology: { retirement: 'KiwiSaver', benefits: 'WINZ' } },
    CA: { name: 'Canada', flag: '🇨🇦', currency: 'CAD', currencySymbol: '$', retirement: 'RRSP, TFSA', benefits: 'EI, CPP', payFrequency: 'biweekly', terminology: { retirement: 'RRSP/TFSA', benefits: 'EI' } }
  }
  
  const currentCountryConfig = countryConfig[userCountry]
  
  // Motivational Quotes
  const moneyQuotes = [
    { quote: "Stop buying your kids stuff you never had and start teaching them things you never learnt.", author: "Infinity Group Philosophy" },
    { quote: "The goal isn't more money. The goal is living life on your terms.", author: "Chris Brogan" },
    { quote: "Do not save what is left after spending; spend what is left after saving.", author: "Warren Buffett" },
    { quote: "A budget is telling your money where to go instead of wondering where it went.", author: "Dave Ramsey" },
    { quote: "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make.", author: "Dave Ramsey" },
    { quote: "Compound interest is the eighth wonder of the world.", author: "Albert Einstein" },
    { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { quote: "Don't work for money; make money work for you.", author: "Robert Kiyosaki" },
    { quote: "You must gain control over your money or the lack of it will forever control you.", author: "Dave Ramsey" },
    { quote: "Wealth is the ability to fully experience life.", author: "Henry David Thoreau" },
    { quote: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
    { quote: "By changing the way they manage their finances, people pay down debts in years rather than decades.", author: "Infinity Group" }
  ]
  const [currentQuote] = useState(() => moneyQuotes[Math.floor(Math.random() * moneyQuotes.length)])
  
  // Presets & CSV
  const [showPresets, setShowPresets] = useState(false)
  const [showCsvImport, setShowCsvImport] = useState(false)
  const [csvTransactions, setCsvTransactions] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // AI State
  const [budgetMemory, setBudgetMemory] = useState<any>({
    name: '', onboardingComplete: false, financialPath: '',
    bigGoals: {}, lifeEvents: [], patterns: [],
    preferences: { communicationStyle: 'direct', checkInFrequency: 'when-needed', motivators: [] },
    currentStep: 'Baby Step 1', notes: []
  })
  const [budgetOnboarding, setBudgetOnboarding] = useState({ isActive: false, step: 'greeting' })
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string, image?: string}>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [proactiveInsight, setProactiveInsight] = useState<any>(null)
  const [selectedBabyStep, setSelectedBabyStep] = useState<number | null>(null)

  // THEME
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

  const inputStyle: React.CSSProperties = { padding: '10px 14px', border: '2px solid ' + theme.inputBorder, borderRadius: '8px', fontSize: '14px', background: theme.input, color: theme.text }
  const btnPrimary: React.CSSProperties = { padding: '10px 20px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }
  const btnSuccess: React.CSSProperties = { ...btnPrimary, background: theme.success }
  const btnDanger: React.CSSProperties = { ...btnPrimary, background: theme.danger }
  const btnWarning: React.CSSProperties = { ...btnPrimary, background: theme.warning }
  const btnPurple: React.CSSProperties = { ...btnPrimary, background: theme.purple }
  const cardStyle: React.CSSProperties = { padding: '24px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }

  // Preset Bills
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

  // LOCAL STORAGE
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
      if (data.budgetOnboarding) setBudgetOnboarding(data.budgetOnboarding)
      if (data.chatMessages) setChatMessages(data.chatMessages)
      if (data.userCountry) setUserCountry(data.userCountry)
      if (data.completedLessons) setCompletedLessons(new Set(data.completedLessons))
    }
  }, [])

  useEffect(() => {
    const data = {
      incomeStreams, expenses, debts, goals, assets, liabilities,
      budgetMemory, paidOccurrences: Array.from(paidOccurrences),
      roadmapMilestones, budgetOnboarding, chatMessages, userCountry,
      completedLessons: Array.from(completedLessons)
    }
    localStorage.setItem('aureus_data', JSON.stringify(data))
  }, [incomeStreams, expenses, debts, goals, assets, liabilities, budgetMemory, paidOccurrences, roadmapMilestones, budgetOnboarding, chatMessages, userCountry, completedLessons])

  // Chat scroll
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const prevMessageCount = useRef(0)
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
    if (chatMessages.length > prevMessageCount.current && chatMessages.length > 0) {
      setTimeout(() => {
        const aureusCard = document.querySelector('[data-aureus-chat]')
        if (aureusCard) aureusCard.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
    prevMessageCount.current = chatMessages.length
  }, [chatMessages])

  // ==================== CALCULATIONS ====================
  const convertToMonthly = (amount: number, frequency: string) => {
    if (frequency === 'weekly') return amount * 4.33
    if (frequency === 'fortnightly') return amount * 2.17
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

  // Financial Health Score
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

  // Infinity-Style Calculations
  const projectedYearsToDebtFreedom = (() => {
    const extraPayments = monthlySurplus > 0 ? monthlySurplus : 0
    const totalAnnualPayments = (monthlyDebtPayments * 12) + (extraPayments * 12)
    return totalAnnualPayments > 0 ? Math.ceil(totalDebtBalance / totalAnnualPayments) : 30
  })()
  
  const interestSavedByEarlyPayoff = (() => {
    const avgInterestRate = debts.length > 0 ? debts.reduce((sum, d) => sum + parseFloat(d.interestRate || '0'), 0) / debts.length : 0
    const standardTermYears = 30
    const yearsOff = Math.max(0, standardTermYears - projectedYearsToDebtFreedom)
    return Math.round((totalDebtBalance * (avgInterestRate / 100) * yearsOff))
  })()

  // Baby Steps
  const australianBabySteps = [
    { step: 1, title: 'Starter Emergency Fund', desc: 'Save $2,000 for emergencies', target: 2000, icon: '🛡️', aureusAdvice: "This $2,000 is your financial airbag - it stops you going into debt when life throws curveballs.", tips: ["Open a separate savings account", "Set up automatic transfers on payday", "Use a high-interest account", "Don't touch it except for TRUE emergencies"], actionButton: "Let's set up my emergency fund goal" },
    { step: 2, title: 'Kill Bad Debt', desc: 'Pay off credit cards, personal loans, BNPL', icon: '💳', aureusAdvice: "Credit cards at 20%+ interest will DESTROY your wealth. Every $1,000 in CC debt costs you $200/year in interest.", tips: ["List all debts: CC, personal loans, Afterpay, Zip", "DON'T include: HECS/HELP, mortgage", "Avalanche: Pay highest interest first", "Snowball: Pay smallest balance first"], actionButton: "Show me my debt payoff plan" },
    { step: 3, title: 'Full Emergency Fund', desc: '3-6 months expenses saved', icon: '🏦', aureusAdvice: "Now we're building real security. 3-6 months of expenses means you could lose your job and be FINE.", tips: ["Calculate your monthly expenses", "Multiply by 3 (secure job) or 6 (unstable income)", "This money should be BORING - high-interest savings"], actionButton: "Calculate my target emergency fund" },
    { step: 4, title: 'Invest 15% + Super', desc: 'Salary sacrifice + investments', icon: '📈', aureusAdvice: "Your employer already puts 11.5% into super - that's forced savings! Now add salary sacrifice for tax benefits.", tips: ["Check your super fund - fees matter!", "Consider salary sacrifice: $100/fortnight saves ~$30 in tax", "Outside super: ETFs like VAS, VDHG through Stake/CMC"], actionButton: "Help me start investing" },
    { step: 5, title: 'Home Deposit', desc: 'Save 10-20% for your home', icon: '🏠', aureusAdvice: "Aussie dream! But it's a marathon, not a sprint. Let me break down the REAL costs.", tips: ["5% deposit possible with First Home Guarantee", "10% deposit = pay LMI (~$8-15k)", "20% deposit = no LMI, better rates"], showHomeCalculator: true, actionButton: "Show me home buying costs" },
    { step: 6, title: 'Pay Off Home Early', desc: 'Extra mortgage payments', icon: '🔑', aureusAdvice: "Every extra dollar on your mortgage saves you 3-4x in interest over the loan life.", tips: ["Even $100/month extra can cut years off", "Use an offset account", "Make fortnightly payments instead of monthly"], actionButton: "Calculate my early payoff" },
    { step: 7, title: 'Build Wealth & Give', desc: 'Invest, enjoy, and be generous', icon: '💎', aureusAdvice: "You've made it! No bad debt, emergency fund solid, home sorted, investing humming.", tips: ["Max out super contributions", "Build passive income streams", "Give to causes you care about"], actionButton: "Plan my wealth building" }
  ]

  const getBabyStep = () => {
    const badDebt = debts.filter(d => parseFloat(d.interestRate || '0') > 5)
    const mortgageDebt = debts.filter(d => d.name?.toLowerCase().includes('mortgage'))
    const monthlyExpenses3 = monthlyExpenses * 3
    
    if (emergencyFund < 2000) {
      return { step: 1, title: 'Starter Emergency Fund', desc: 'Save $2,000 for emergencies', progress: (emergencyFund / 2000) * 100, icon: '🛡️', target: 2000, current: emergencyFund }
    }
    if (badDebt.length > 0) {
      const totalBadDebt = badDebt.reduce((s, d) => s + parseFloat(d.balance || '0'), 0)
      return { step: 2, title: 'Kill Bad Debt', desc: 'Pay off credit cards, personal loans, BNPL', progress: 0, icon: '💳', target: totalBadDebt, current: 0, debts: badDebt }
    }
    if (emergencyFund < monthlyExpenses3) {
      return { step: 3, title: 'Full Emergency Fund', desc: '3-6 months expenses saved', progress: (emergencyFund / monthlyExpenses3) * 100, icon: '🏦', target: monthlyExpenses3, current: emergencyFund }
    }
    const investmentGoalMet = passiveIncome > 0 || assets.filter(a => a.type === 'investment').length > 0
    if (!investmentGoalMet) {
      return { step: 4, title: 'Invest 15% + Super', desc: 'Salary sacrifice + investments', progress: 50, icon: '📈', target: monthlyIncome * 0.15, current: 0 }
    }
    if (mortgageDebt.length === 0 && !assets.some(a => a.type === 'property')) {
      const depositGoal = 100000
      const currentDeposit = assets.filter(a => a.name?.toLowerCase().includes('deposit') || a.name?.toLowerCase().includes('house')).reduce((s, a) => s + parseFloat(a.value || '0'), 0)
      return { step: 5, title: 'Home Deposit', desc: 'Save 10-20% for your home', progress: (currentDeposit / depositGoal) * 100, icon: '🏠', target: depositGoal, current: currentDeposit }
    }
    if (mortgageDebt.length > 0) {
      const mortgageBalance = mortgageDebt.reduce((s, d) => s + parseFloat(d.balance || '0'), 0)
      return { step: 6, title: 'Pay Off Home Early', desc: 'Extra mortgage payments', progress: 0, icon: '🔑', target: mortgageBalance, current: 0 }
    }
    return { step: 7, title: 'Build Wealth & Give', desc: 'Invest, enjoy, and be generous', progress: 100, icon: '💎', target: 0, current: 0 }
  }
  const currentBabyStep = getBabyStep()

  // FIRE calculations
  const fiPath = {
    monthlyNeed: totalOutgoing,
    passiveGap: totalOutgoing - passiveIncome,
    passiveCoverage: passiveCoverage,
    fireNumber: (totalOutgoing * 12) * 25,
    currentInvestments: assets.filter(a => a.type === 'investment').reduce((sum, a) => sum + parseFloat(a.value || '0'), 0),
    yearsToFI: monthlySurplus > 0 ? Math.ceil(((totalOutgoing * 12) * 25) / (monthlySurplus * 12)) : 999
  }

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

  // ==================== ROADMAP FUNCTIONS ====================
  const addToRoadmap = (name: string, category: string, targetAmount: string | number, icon: string, notes?: string, currentAmount?: number, linkedGoalId?: number) => {
    if (roadmapMilestones.some(m => m.name.toLowerCase() === name.toLowerCase())) {
      alert(`"${name}" is already in your roadmap!`)
      return
    }
    const newMilestoneItem = {
      id: Date.now(), name, category, icon,
      targetAmount: typeof targetAmount === 'number' ? targetAmount.toString() : targetAmount,
      currentAmount: currentAmount || 0, targetDate: '', notes: notes || '',
      completed: false, createdAt: new Date().toISOString(), linkedGoalId: linkedGoalId || null
    }
    setRoadmapMilestones(prev => [...prev, newMilestoneItem])
    alert(`✅ Added "${name}" to your roadmap!`)
  }

  // ==================== ACADEMY FUNCTIONS ====================
  const completeLesson = (moduleId: number, lessonId: number) => {
    const lessonKey = `${moduleId}-${lessonId}`
    const newCompleted = new Set(completedLessons)
    newCompleted.add(lessonKey)
    setCompletedLessons(newCompleted)
  }

  const isLessonCompleted = (moduleId: number, lessonId: number) => {
    return completedLessons.has(`${moduleId}-${lessonId}`)
  }

  const getModuleProgress = (moduleId: number) => {
    const module = learningModules.find(m => m.id === moduleId)
    if (!module) return 0
    const totalLessons = module.lessons.length
    const completed = module.lessons.filter(l => isLessonCompleted(moduleId, l.id)).length
    return Math.round((completed / totalLessons) * 100)
  }

  // ==================== QUEST FUNCTIONS ====================
  const startQuest = (questId: number) => {
    setPassiveQuests(passiveQuests.map(q => q.id === questId ? { ...q, status: 'in_progress', progress: 10 } : q))
  }
  const completeQuest = (questId: number, monthlyIncome: number) => {
    setPassiveQuests(passiveQuests.map(q => q.id === questId ? { ...q, status: 'completed', progress: 100, monthlyIncome } : q))
  }

  // ==================== DEBT PAYOFF CALCULATOR ====================
  const calculateSingleDebtPayoff = (debt: any) => {
    const balance = parseFloat(debt.balance || '0')
    const interestRate = parseFloat(debt.interestRate || '0') / 100 / 12
    const minPayment = convertToMonthly(parseFloat(debt.minPayment || '0'), debt.frequency || 'monthly')
    const extraPayments = expenses.filter(e => e.targetDebtId === debt.id).reduce((sum, e) => sum + convertToMonthly(parseFloat(e.amount || '0'), e.frequency), 0)
    const totalPayment = minPayment + extraPayments
    
    if (balance <= 0) return { months: 0, totalInterest: 0, payoffDate: 'Paid off!' }
    if (totalPayment <= 0) return { months: 999, totalInterest: 0, payoffDate: 'No payment set' }
    
    const monthlyInterest = balance * interestRate
    if (totalPayment <= monthlyInterest) return { months: 999, totalInterest: 0, payoffDate: 'Payment too low!' }
    
    let remaining = balance, months = 0, totalInterest = 0
    while (remaining > 0 && months < 600) {
      const interest = remaining * interestRate
      totalInterest += interest
      remaining = remaining + interest - totalPayment
      months++
    }
    const payoffDate = new Date()
    payoffDate.setMonth(payoffDate.getMonth() + months)
    return { months, totalInterest, payoffDate: months < 600 ? payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Never', extraPayments, totalPayment }
  }

  // ==================== AUTOMATION CALCULATOR ====================
  const calculateAutomation = () => {
    const payFrequency = incomeStreams[0]?.frequency || 'fortnightly'
    const payAmount = parseFloat(incomeStreams[0]?.amount || '0')
    const convertToPayPeriod = (amount: number, freq: string) => {
      if (freq === payFrequency) return amount
      if (payFrequency === 'fortnightly') { if (freq === 'weekly') return amount * 2; if (freq === 'monthly') return amount / 2.17 }
      if (payFrequency === 'weekly') { if (freq === 'fortnightly') return amount / 2; if (freq === 'monthly') return amount / 4.33 }
      if (payFrequency === 'monthly') { if (freq === 'weekly') return amount * 4.33; if (freq === 'fortnightly') return amount * 2.17 }
      return amount
    }
    const billsTotal = expenses.filter(e => !e.targetDebtId && !e.targetGoalId).reduce((sum, exp) => sum + convertToPayPeriod(parseFloat(exp.amount || '0'), exp.frequency), 0)
    const debtTotal = debts.reduce((sum, debt) => sum + convertToPayPeriod(parseFloat(debt.minPayment || '0'), debt.frequency || 'monthly'), 0)
    const billsBucket = billsTotal + debtTotal
    const savingsBucket = goals.reduce((sum, goal) => sum + convertToPayPeriod(parseFloat(goal.paymentAmount || '0'), goal.savingsFrequency || 'monthly'), 0)
    const spendingBucket = payAmount - billsBucket - savingsBucket
    return { payFrequency, payAmount, bills: { total: billsBucket, breakdown: expenses.filter(e => !e.targetDebtId && !e.targetGoalId).map(e => ({ name: e.name, amount: convertToPayPeriod(parseFloat(e.amount || '0'), e.frequency) })) }, savings: { total: savingsBucket, breakdown: goals.map(g => ({ name: g.name, amount: convertToPayPeriod(parseFloat(g.paymentAmount || '0'), g.savingsFrequency || 'monthly') })) }, spending: spendingBucket }
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
      const startTime = new Date(start.year, start.month, start.day).getTime()
      const checkTime = new Date(year, month, day).getTime()
      if (startTime > checkTime) return false
      if (frequency === 'once') return start.day === day && start.month === month && start.year === year
      if (frequency === 'monthly') return start.day === day
      if (frequency === 'weekly') { const daysDiff = Math.floor((checkTime - startTime) / 86400000); return daysDiff >= 0 && daysDiff % 7 === 0 }
      if (frequency === 'fortnightly') { const daysDiff = Math.floor((checkTime - startTime) / 86400000); return daysDiff >= 0 && daysDiff % 14 === 0 }
      if (frequency === 'quarterly') return start.day === day && (month - start.month + 12) % 3 === 0
      if (frequency === 'yearly') return start.day === day && start.month === month
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
  const updateEditField = (field: string, value: string) => {
    if (!editingItem) return
    setEditingItem({ ...editingItem, data: { ...editingItem.data, [field]: value } })
  }

  // ==================== AI CHAT FUNCTIONS ====================
  const sendQuickMessage = async (message: string) => {
    if (!message.trim() || isLoading) return
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
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble with that. Let's try again!" }])
    }
    setIsLoading(false)
  }

  const handleChatMessage = async () => {
    if (!chatInput.trim() || isLoading) return
    const message = chatInput.trim()
    if (budgetOnboarding.isActive) {
      await handleOnboardingResponse(message)
      return
    }
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
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong." }])
    }
    setIsLoading(false)
  }

  const handleOnboardingResponse = async (response: string) => {
    setIsLoading(true)
    setChatMessages(prev => [...prev, { role: 'user', content: response }])
    setChatInput('')
    try {
      const apiResponse = await fetch('/api/budget-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'onboarding', onboardingStep: budgetOnboarding.step, userResponse: response, memory: budgetMemory, financialData: { income: incomeStreams, expenses, debts, goals, assets, liabilities }, countryConfig: currentCountryConfig })
      })
      const data = await apiResponse.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.message || data.raw || "I'm processing that..." }])
      if (data.isComplete) {
        setBudgetOnboarding({ isActive: false, step: 'complete' })
        setBudgetMemory((prev: any) => ({ ...prev, onboardingComplete: true }))
      } else if (data.nextStep) {
        setBudgetOnboarding(prev => ({ ...prev, step: data.nextStep }))
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble with that. Let's try again!" }])
    }
    setIsLoading(false)
  }

  // ==================== RENDER: MODE SELECTOR ====================
  if (showModeSelector) {
    return (
      <div style={{ minHeight: '100vh', background: darkMode ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' as const, marginBottom: '48px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)', border: '4px solid #fcd34d', margin: '0 auto 24px auto' }}>
            <span style={{ color: '#78350f', fontWeight: 800, fontSize: '40px' }}>A</span>
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: 800, color: theme.text, margin: '0 0 12px 0' }}>Welcome to Aureus</h1>
          <p style={{ fontSize: '18px', color: theme.textMuted, margin: 0 }}>Your AI financial operations coach</p>
        </div>
        <button onClick={() => { setAppMode('budget'); setShowModeSelector(false); setActiveTab('quickview'); }} style={{ padding: '32px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '24px', border: 'none', cursor: 'pointer', textAlign: 'left' as const, maxWidth: '400px', width: '100%' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
          <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>Budget Mode</h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0 0 16px 0', fontSize: '14px' }}>Optimize your cash flow, eliminate debt, and build automated revenue streams</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
            {['Baby Steps', 'FIRE Path', 'Academy', 'Home Buying'].map(tag => <span key={tag} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '11px', color: 'white' }}>{tag}</span>)}
          </div>
        </button>
        <button onClick={() => setDarkMode(!darkMode)} style={{ marginTop: '32px', padding: '12px 24px', background: 'transparent', border: '2px solid ' + theme.border, borderRadius: '12px', color: theme.textMuted, cursor: 'pointer' }}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
      </div>
    )
  }

  // ==================== RENDER: MAIN APP ====================
  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      <header style={{ padding: '12px 24px', background: theme.cardBg, borderBottom: '1px solid ' + theme.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)', border: '2px solid #fcd34d' }}>
            <span style={{ color: '#78350f', fontWeight: 800, fontSize: '18px' }}>A</span>
          </div>
          <span style={{ color: theme.text, fontWeight: 700, fontSize: '20px' }}>Aureus</span>
          <span style={{ padding: '4px 10px', background: theme.success + '20', color: theme.success, borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>💰 Budget</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => setActiveTab('chat')} style={{ padding: '8px 14px', background: activeTab === 'chat' ? theme.accent : 'transparent', color: activeTab === 'chat' ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>💬 Aureus</button>
          <button onClick={() => setActiveTab('quickview')} style={{ padding: '8px 14px', background: activeTab === 'quickview' ? theme.accent : 'transparent', color: activeTab === 'quickview' ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>⚡ Quick</button>
          <button onClick={() => setActiveTab('dashboard')} style={{ padding: '8px 14px', background: activeTab === 'dashboard' ? theme.accent : 'transparent', color: activeTab === 'dashboard' ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>🎛️ Centre</button>
          <button onClick={() => setActiveTab('academy')} style={{ padding: '8px 14px', background: activeTab === 'academy' ? theme.warning : 'transparent', color: activeTab === 'academy' ? 'white' : theme.warning, border: '1px solid ' + theme.warning, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>🎓 Learn</button>
          <button onClick={() => setActiveTab('path')} style={{ padding: '8px 14px', background: activeTab === 'path' ? theme.accent : 'transparent', color: activeTab === 'path' ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>🛤️ Path</button>
          <button onClick={() => setActiveTab('overview')} style={{ padding: '8px 14px', background: activeTab === 'overview' ? theme.accent : 'transparent', color: activeTab === 'overview' ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>📊 Metrics</button>
          <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text }}>{darkMode ? '☀️' : '🌙'}</button>
          <select value={userCountry} onChange={e => setUserCountry(e.target.value as any)} style={{ padding: '6px 10px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text, fontSize: '14px' }}>
            <option value="AU">🇦🇺 AU</option><option value="US">🇺🇸 US</option><option value="UK">🇬🇧 UK</option><option value="NZ">🇳🇿 NZ</option><option value="CA">🇨🇦 CA</option>
          </select>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* MOTIVATIONAL QUOTE */}
        {activeTab === 'quickview' && !budgetOnboarding.isActive && (
          <div style={{ background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', borderLeft: '4px solid ' + theme.purple }}>
            <p style={{ color: theme.text, fontSize: '14px', fontStyle: 'italic', margin: 0 }}>"{currentQuote.quote}"</p>
            <p style={{ color: theme.textMuted, fontSize: '12px', margin: '8px 0 0 0', textAlign: 'right' as const }}>— {currentQuote.author}</p>
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: `linear-gradient(135deg, ${theme.success}15, ${theme.purple}15)`, border: '2px solid ' + theme.success, borderRadius: '20px', padding: '24px', minHeight: '70vh', display: 'flex', flexDirection: 'column' as const }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid ' + theme.border }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)', border: '3px solid #fcd34d' }}>
                  <span style={{ color: '#78350f', fontWeight: 800, fontSize: '28px' }}>A</span>
                </div>
                <div>
                  <div style={{ color: theme.text, fontWeight: 700, fontSize: '22px' }}>Aureus</div>
                  <div style={{ color: theme.textMuted, fontSize: '13px' }}>
                    {budgetOnboarding.isActive ? '🟢 Getting to know you...' : `Your financial operations coach • ${currentBabyStep.title}`}
                  </div>
                </div>
              </div>
              <div style={{ padding: '8px 12px', background: theme.warning + '15', borderRadius: '8px', marginBottom: '12px', border: '1px solid ' + theme.warning + '30' }}>
                <p style={{ margin: 0, color: theme.textMuted, fontSize: '11px', lineHeight: 1.4 }}>
                  ⚠️ <strong>Important:</strong> Aureus is an AI assistant, not a licensed financial advisor. Always verify information and consult qualified professionals for major financial decisions.
                </p>
              </div>
              <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto' as const, marginBottom: '16px', padding: '8px' }}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ marginBottom: '16px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '85%', padding: '14px 18px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.role === 'user' ? theme.accent : theme.cardBg, color: msg.role === 'user' ? 'white' : theme.text, fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-wrap' as const }}>
                      {msg.content}
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
              <div style={{ display: 'flex', gap: '12px' }}>
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChatMessage()} placeholder={budgetOnboarding.isActive ? "Type your response..." : "Ask Aureus anything..."} style={{ ...inputStyle, flex: 1, padding: '14px 18px', fontSize: '15px' }} disabled={isLoading} />
                <button onClick={handleChatMessage} disabled={isLoading || !chatInput.trim()} style={{ padding: '14px 24px', background: theme.success, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, opacity: isLoading || !chatInput.trim() ? 0.5 : 1 }}>{isLoading ? '...' : 'Send'}</button>
              </div>
            </div>
          </div>
        )}

        {/* QUICK VIEW TAB */}
        {activeTab === 'quickview' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>
            <div data-aureus-chat="true" style={{ padding: '20px', background: `linear-gradient(135deg, ${theme.success}15, ${theme.purple}15)`, borderRadius: '16px', border: '2px solid ' + theme.success }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: chatMessages.length > 0 ? '16px' : '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#78350f' }}>A</div>
                <div><div style={{ color: theme.text, fontWeight: 600 }}>Aureus</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>{currentBabyStep.title}</div></div>
              </div>
              {chatMessages.length > 0 && (
                <div ref={chatContainerRef} style={{ maxHeight: '200px', overflowY: 'auto' as const, marginBottom: '12px', padding: '8px', background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} style={{ marginBottom: '10px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: msg.role === 'user' ? theme.accent : theme.cardBg, color: msg.role === 'user' ? 'white' : theme.text, fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-wrap' as const }}>{msg.content}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChatMessage()} placeholder="Ask Aureus anything..." style={{ ...inputStyle, flex: 1, padding: '10px 14px', fontSize: '13px' }} disabled={isLoading} />
                <button onClick={handleChatMessage} disabled={isLoading || !chatInput.trim()} style={{ padding: '10px 16px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', opacity: isLoading || !chatInput.trim() ? 0.5 : 1 }}>{isLoading ? '...' : 'Send'}</button>
              </div>
            </div>

            {/* FINANCIAL FREEDOM SCOREBOARD */}
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '16px' }}>
              <h3 style={{ color: theme.text, margin: '0 0 20px 0', fontSize: '18px' }}>🏆 Your Financial Freedom Scoreboard</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ textAlign: 'center', padding: '16px', background: theme.cardBg, borderRadius: '12px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
                  <div style={{ color: theme.success, fontSize: '28px', fontWeight: 700 }}>{projectedYearsToDebtFreedom}</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>Years to Debt Freedom</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', background: theme.cardBg, borderRadius: '12px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
                  <div style={{ color: theme.warning, fontSize: '28px', fontWeight: 700 }}>${interestSavedByEarlyPayoff.toLocaleString()}</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>Interest Saved by Early Payoff</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', background: theme.cardBg, borderRadius: '12px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎯</div>
                  <div style={{ color: theme.purple, fontSize: '28px', fontWeight: 700 }}>{((passiveIncome + totalPassiveQuestIncome) / Math.max(monthlyExpenses, 1) * 100).toFixed(0)}%</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>Financial Independence</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', background: theme.cardBg, borderRadius: '12px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                  <div style={{ color: theme.accent, fontSize: '28px', fontWeight: 700 }}>{savingsRate.toFixed(0)}%</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>Savings Rate (Target: 20%+)</div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const }}>Monthly Revenue</div><div style={{ color: theme.success, fontSize: '28px', fontWeight: 700 }}>${monthlyIncome.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const }}>Operating Costs</div><div style={{ color: theme.danger, fontSize: '28px', fontWeight: 700 }}>${totalOutgoing.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const }}>Net Profit</div><div style={{ color: monthlySurplus >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 700 }}>${monthlySurplus.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const }}>Wealth Position</div><div style={{ color: netWorth >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 700 }}>${netWorth.toLocaleString()}</div></div>
            </div>

            <div style={{ padding: '20px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '16px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' as const }}>Operations Score</div></div>
                <div style={{ fontSize: '40px', fontWeight: 700, color: financialHealthScore >= 70 ? theme.success : financialHealthScore >= 40 ? theme.warning : theme.danger }}>{financialHealthScore}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <button onClick={() => setActiveTab('dashboard')} style={{ padding: '16px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as const }}><div style={{ fontSize: '24px', marginBottom: '8px' }}>🎛️</div><div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>Command Centre</div></button>
              <button onClick={() => setActiveTab('academy')} style={{ padding: '16px', background: theme.cardBg, border: '1px solid ' + theme.warning, borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as const }}><div style={{ fontSize: '24px', marginBottom: '8px' }}>🎓</div><div style={{ color: theme.warning, fontWeight: 600, fontSize: '14px' }}>Aureus Academy</div></button>
              <button onClick={() => setActiveTab('path')} style={{ padding: '16px', background: theme.cardBg, border: '1px solid ' + theme.border, borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as const }}><div style={{ fontSize: '24px', marginBottom: '8px' }}>🛤️</div><div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>Path & Quests</div></button>
            </div>
          </div>
        )}

        {/* ACADEMY TAB - Aureus Academy */}
        {activeTab === 'academy' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #f59e0b15, #ef444415)', borderRadius: '12px', border: '1px solid #f59e0b40' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <div><div style={{ color: theme.text, fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Educational Content Only</div><p style={{ margin: 0, color: theme.textMuted, fontSize: '12px', lineHeight: 1.5 }}>This is general financial education, not personal financial advice. Consult qualified professionals before making major financial decisions.</p></div>
              </div>
            </div>

            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '20px', border: '2px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🎓</div>
                <div>
                  <h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>Aureus Academy</h2>
                  <p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '13px' }}>Master your financial psychology and strategy before making big money moves</p>
                </div>
              </div>

              <div style={{ padding: '16px', background: '#f59e0b15', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
                <p style={{ margin: 0, color: theme.text, fontSize: '14px', lineHeight: 1.6 }}>
                  💡 <strong>Our Philosophy:</strong> "Stop buying your kids stuff you never had, and start teaching them things you never learnt." 
                  Education comes first. Products come second. Master the psychology, then the strategy.
                </p>
              </div>

              {/* Module Grid */}
              {!showModuleContent && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {learningModules.map(module => {
                    const progress = getModuleProgress(module.id)
                    return (
                      <div key={module.id} onClick={() => { setActiveModuleId(module.id); setShowModuleContent(true) }} style={{ 
                        padding: '20px', 
                        background: darkMode ? '#1e293b' : '#f8fafc', 
                        borderRadius: '12px', 
                        cursor: 'pointer',
                        border: `1px solid ${theme.border}`,
                        transition: 'transform 0.2s'
                      }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>{module.icon}</div>
                        <div style={{ color: module.color, fontWeight: 700, marginBottom: '8px', fontSize: '14px' }}>{module.title}</div>
                        <div style={{ color: theme.textMuted, fontSize: '12px', lineHeight: 1.5, marginBottom: '12px' }}>{module.description}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: theme.textMuted, fontSize: '11px' }}>{module.lessons.length} lessons</span>
                          {progress > 0 && <span style={{ color: theme.success, fontSize: '11px', fontWeight: 600 }}>{progress}% complete</span>}
                        </div>
                        <div style={{ height: '4px', background: theme.border, borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                          <div style={{ width: progress + '%', height: '100%', background: module.color }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Module Content */}
              {showModuleContent && activeModuleId && (() => {
                const module = learningModules.find(m => m.id === activeModuleId)
                if (!module) return null
                return (
                  <div>
                    <button onClick={() => { setShowModuleContent(false); setActiveLessonId(null) }} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.text, cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      ← Back to All Modules
                    </button>
                    
                    <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <span style={{ fontSize: '32px' }}>{module.icon}</span>
                        <div>
                          <h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>{module.title}</h3>
                          <p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '13px' }}>{module.description}</p>
                        </div>
                      </div>

                      {!activeLessonId && (
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                          {module.lessons.map(lesson => {
                            const completed = isLessonCompleted(module.id, lesson.id)
                            return (
                              <div key={lesson.id} onClick={() => setActiveLessonId(lesson.id)} style={{ 
                                padding: '16px', 
                                background: completed ? theme.success + '10' : (darkMode ? '#1e293b' : '#f8fafc'),
                                borderRadius: '8px', 
                                cursor: 'pointer',
                                border: `1px solid ${completed ? theme.success + '40' : theme.border}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: completed ? theme.success : theme.border, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                                    {completed ? '✓' : lesson.id}
                                  </div>
                                  <span style={{ color: theme.text, fontSize: '14px' }}>{lesson.title}</span>
                                </div>
                                {completed && <span style={{ color: theme.success, fontSize: '11px' }}>Complete</span>}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Lesson Content */}
                      {activeLessonId && (() => {
                        const lesson = module.lessons.find(l => l.id === activeLessonId)
                        if (!lesson) return null
                        const completed = isLessonCompleted(module.id, lesson.id)
                        return (
                          <div>
                            <button onClick={() => setActiveLessonId(null)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '6px', color: theme.text, cursor: 'pointer', marginBottom: '16px', fontSize: '12px' }}>
                              ← Back to lessons
                            </button>
                            <div style={{ padding: '24px', background: darkMode ? '#0f172a' : '#f1f5f9', borderRadius: '12px' }}>
                              <h4 style={{ color: theme.text, margin: '0 0 16px 0', fontSize: '18px' }}>{lesson.title}</h4>
                              <p style={{ color: theme.text, fontSize: '14px', lineHeight: 1.8, marginBottom: '20px' }}>{lesson.content}</p>
                              
                              <div style={{ padding: '16px', background: theme.warning + '15', borderRadius: '8px', borderLeft: '4px solid ' + theme.warning, marginBottom: '20px' }}>
                                <p style={{ margin: '0 0 4px 0', color: theme.warning, fontSize: '12px', fontWeight: 600 }}>💡 KEY INSIGHT</p>
                                <p style={{ margin: 0, color: theme.text, fontSize: '14px', lineHeight: 1.6 }}>{lesson.keyInsight}</p>
                              </div>

                              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const }}>
                                <button 
                                  onClick={() => { completeLesson(module.id, lesson.id); sendQuickMessage(`I just learned about "${lesson.title}" in Aureus Academy. ${lesson.keyInsight} Can you help me apply this to my personal finances?`) }} 
                                  style={{ padding: '10px 20px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
                                >
                                  {completed ? '✅ Lesson Complete' : '✅ Mark Complete & Ask Aureus'}
                                </button>
                                <button 
                                  onClick={() => sendQuickMessage(`I'm learning about "${lesson.title}" in Aureus Academy. ${lesson.content} Can you explain this in more detail and how it applies to my situation?`)} 
                                  style={{ padding: '10px 20px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
                                >
                                  💬 Discuss with Aureus
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Coaching Quick Actions */}
            <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px' }}>
              <h3 style={{ color: theme.text, margin: '0 0 16px 0', fontSize: '16px' }}>🤖 Quick Coaching Sessions</h3>
              <p style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '16px' }}>Click any topic to start a coaching conversation with Aureus:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: '🏦 Pay Off Mortgage in 10 Years', action: "I want to pay off my mortgage in 10 years, not 30. Show me exactly how to structure my finances to make this happen." },
                  { label: '💡 Every Dollar Has a Purpose', action: "Help me assign every dollar a purpose before my next payday. Walk me through the process." },
                  { label: '🔄 Redraw vs Offset Strategy', action: "Explain why redraw is better than offset for paying off debt faster, and how I should structure my accounts." },
                  { label: '🧠 Psychology of Money', action: "I keep spending money that's sitting in my account. Help me understand why and how to fix this." },
                  { label: '📐 Structure Over Rate', action: "Teach me why loan structure matters more than getting the cheapest interest rate." },
                  { label: '💰 Build Wealth While Paying Debt', action: "How can I build wealth through investments while still paying off my mortgage and other debts?" }
                ].map(item => (
                  <button 
                    key={item.label}
                    onClick={() => sendQuickMessage(item.action)}
                    style={{ 
                      padding: '14px', 
                      background: darkMode ? '#1e293b' : '#f8fafc', 
                      border: '1px solid ' + theme.border, 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      textAlign: 'left' as const,
                      color: theme.text,
                      fontSize: '13px',
                      fontWeight: 500
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BUDGET DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            {/* Aureus Chat */}
            <div data-aureus-chat="true" style={{ padding: '20px', background: `linear-gradient(135deg, ${theme.success}15, ${theme.purple}15)`, borderRadius: '16px', border: '2px solid ' + theme.success }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: chatMessages.length > 0 ? '16px' : '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#78350f' }}>A</div>
                <div><div style={{ color: theme.text, fontWeight: 600 }}>Aureus</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>{currentBabyStep.title}</div></div>
              </div>
              {chatMessages.length > 0 && (
                <div ref={chatContainerRef} style={{ maxHeight: '400px', overflowY: 'auto' as const, marginBottom: '12px', padding: '12px', background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} style={{ marginBottom: '10px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: msg.role === 'user' ? theme.accent : theme.cardBg, color: msg.role === 'user' ? 'white' : theme.text, fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' as const }}>{msg.content}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}><input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChatMessage()} placeholder="Ask Aureus anything..." style={{ ...inputStyle, flex: 1, padding: '10px 14px', fontSize: '13px' }} disabled={isLoading} /><button onClick={handleChatMessage} disabled={isLoading || !chatInput.trim()} style={{ padding: '10px 16px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', opacity: isLoading || !chatInput.trim() ? 0.5 : 1 }}>{isLoading ? '...' : 'Send'}</button></div>
            </div>

            {/* Monthly Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Income /mo</div><div style={{ color: theme.success, fontSize: '28px', fontWeight: 700 }}>${monthlyIncome.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Expenses /mo</div><div style={{ color: theme.danger, fontSize: '28px', fontWeight: 700 }}>${monthlyExpenses.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Debt Payments</div><div style={{ color: theme.warning, fontSize: '28px', fontWeight: 700 }}>${monthlyDebtPayments.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Goal Savings</div><div style={{ color: theme.purple, fontSize: '28px', fontWeight: 700 }}>${monthlyGoalSavings.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Net /mo</div><div style={{ color: monthlySurplus >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 700 }}>${monthlySurplus.toFixed(0)}</div></div>
            </div>

            {/* Income & Expenses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: theme.success, fontSize: '18px' }}>💰 Revenue Streams</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="file" ref={payslipInputRef} accept="image/*,.pdf" onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setPayslipProcessing(true)
                      try {
                        const base64 = await new Promise<string>((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result as string); reader.readAsDataURL(file) })
                        const response = await fetch('/api/extract-payslip', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: base64, filename: file.name }) })
                        if (response.ok) { const data = await response.json(); setExtractedPayslip(data); setShowPayslipUpload(true) }
                        else alert('Could not process payslip.')
                      } catch (error) { alert('Could not process payslip.') }
                      setPayslipProcessing(false)
                    }} style={{ display: 'none' }} />
                    <button onClick={() => payslipInputRef.current?.click()} style={{ padding: '4px 12px', background: theme.purple, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} disabled={payslipProcessing}>{payslipProcessing ? '⏳' : '📄'} Payslip</button>
                    <span style={{ color: theme.success, fontWeight: 700 }}>${monthlyIncome.toFixed(0)}/mo</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                  <input placeholder="Revenue source" value={newIncome.name} onChange={e => setNewIncome({...newIncome, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '120px'}} />
                  <input placeholder="Amount" type="number" value={newIncome.amount} onChange={e => setNewIncome({...newIncome, amount: e.target.value})} style={{...inputStyle, width: '100px'}} />
                  <select value={newIncome.frequency} onChange={e => setNewIncome({...newIncome, frequency: e.target.value})} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
                  <select value={newIncome.type} onChange={e => setNewIncome({...newIncome, type: e.target.value})} style={inputStyle}><option value="active">Active</option><option value="passive">Automated</option></select>
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
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}><button onClick={saveEdit} style={{...btnSuccess, padding: '6px 12px', fontSize: '12px'}}>Save</button><button onClick={cancelEdit} style={{...btnDanger, padding: '6px 12px', fontSize: '12px'}}>Cancel</button></div>
                      </div>
                    ) : (
                      <div key={inc.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div><div style={{ color: theme.text, fontWeight: 600 }}>{inc.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{inc.frequency} • {inc.type === 'passive' ? 'automated' : inc.type}</div></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: theme.success, fontWeight: 700 }}>${inc.amount}</span><button onClick={() => startEdit('income', inc)} style={{ padding: '4px 8px', background: theme.accent, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✏️</button><button onClick={() => deleteIncome(inc.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>×</button></div>
                      </div>
                    )
                  ))}
                </div>
              </div>

              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: theme.danger, fontSize: '18px' }}>💸 Operating Costs</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setShowPresets(!showPresets)} style={{ padding: '4px 12px', background: theme.purple, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>+ Presets</button>
                    <span style={{ color: theme.danger, fontWeight: 700 }}>${monthlyExpenses.toFixed(0)}/mo</span>
                  </div>
                </div>
                {showPresets && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '12px', padding: '12px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '8px' }}>
                    {presetBills.map(p => <button key={p.name} onClick={() => { const amount = prompt(`Enter amount for ${p.name}:`, p.amount || ''); if (amount) setExpenses([...expenses, { id: Date.now(), name: p.name, amount, frequency: p.frequency, category: p.category, dueDate: new Date().toISOString().split('T')[0] }]) }} style={{ padding: '4px 10px', background: theme.purple + '30', color: theme.purple, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{p.name}</button>)}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                  <input placeholder="Expense" value={newExpense.name} onChange={e => setNewExpense({...newExpense, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '120px'}} />
                  <input placeholder="Amount" type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} style={{...inputStyle, width: '100px'}} />
                  <select value={newExpense.frequency} onChange={e => setNewExpense({...newExpense, frequency: e.target.value})} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select>
                  <button onClick={addExpense} style={btnDanger}>+</button>
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' as const }}>
                  {expenses.filter(e => !e.targetDebtId && !e.targetGoalId).length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No expenses yet</p> : expenses.filter(e => !e.targetDebtId && !e.targetGoalId).map(exp => (
                    editingItem?.type === 'expense' && editingItem.id === exp.id ? (
                      <div key={exp.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, marginBottom: '8px' }}><input value={editingItem.data.name} onChange={e => updateEditField('name', e.target.value)} style={{...inputStyle, flex: 1, minWidth: '100px'}} /><input type="number" value={editingItem.data.amount} onChange={e => updateEditField('amount', e.target.value)} style={{...inputStyle, width: '80px'}} /><select value={editingItem.data.frequency} onChange={e => updateEditField('frequency', e.target.value)} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option></select></div>
                        <div style={{ display: 'flex', gap: '8px' }}><button onClick={saveEdit} style={{...btnSuccess, padding: '6px 12px', fontSize: '12px'}}>Save</button><button onClick={cancelEdit} style={{...btnDanger, padding: '6px 12px', fontSize: '12px'}}>Cancel</button></div>
                      </div>
                    ) : (
                      <div key={exp.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div><div style={{ color: theme.text, fontWeight: 600 }}>{exp.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{exp.frequency}</div></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: theme.danger, fontWeight: 700 }}>${exp.amount}</span><button onClick={() => startEdit('expense', exp)} style={{ padding: '4px 8px', background: theme.accent, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✏️</button><button onClick={() => deleteExpense(exp.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>×</button></div>
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
                        <div key={item.itemId} style={{ fontSize: '10px', padding: '2px 4px', marginBottom: '2px', background: item.itemType === 'income' ? '#d1fae5' : item.itemType === 'expense' ? '#dbeafe' : '#fee2e2', color: '#1e293b', borderRadius: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, opacity: item.isPaid ? 0.5 : 1 }}>{item.name}</div>
                      ))}
                      {items.length > 2 && <div style={{ fontSize: '10px', color: theme.accent, fontWeight: 600 }}>+{items.length - 2}</div>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Debts & Goals */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
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
                  <button onClick={addDebt} style={btnWarning}>+</button>
                </div>
                <div style={{ maxHeight: '350px', overflowY: 'auto' as const }}>
                  {debts.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No debts - debt free! 🎉</p> : debts.map(debt => {
                    const payoff = calculateSingleDebtPayoff(debt)
                    return (
                      <div key={debt.id} style={{ padding: '16px', marginBottom: '12px', background: darkMode ? '#3a2e1e' : '#fefce8', borderRadius: '12px', border: '1px solid ' + theme.border }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div><div style={{ color: theme.text, fontWeight: 600, fontSize: '16px' }}>{debt.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{debt.interestRate}% APR • ${debt.minPayment}/{debt.frequency || 'monthly'}</div></div>
                          <div style={{ textAlign: 'right' as const }}><div style={{ color: theme.warning, fontWeight: 700, fontSize: '18px' }}>${parseFloat(debt.balance).toFixed(0)}</div><button onClick={() => deleteDebt(debt.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', marginTop: '4px' }}>×</button></div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                          <div><span style={{ color: theme.textMuted }}>Payoff: </span><span style={{ color: theme.text, fontWeight: 600 }}>{payoff.payoffDate}</span></div>
                          <div><span style={{ color: theme.textMuted }}>Months: </span><span style={{ color: theme.text, fontWeight: 600 }}>{payoff.months < 600 ? payoff.months : '∞'}</span></div>
                          <div><span style={{ color: theme.textMuted }}>Interest: </span><span style={{ color: theme.danger, fontWeight: 600 }}>${payoff.totalInterest.toFixed(0)}</span></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', color: theme.purple, fontSize: '18px' }}>🎯 Capital Targets</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                  <input placeholder="Goal name" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '90px'}} />
                  <input placeholder="Target $" type="number" value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: e.target.value})} style={{...inputStyle, width: '80px'}} />
                  <input placeholder="Saved $" type="number" value={newGoal.saved} onChange={e => setNewGoal({...newGoal, saved: e.target.value})} style={{...inputStyle, width: '80px'}} />
                  <input placeholder="Save $" type="number" value={newGoal.paymentAmount} onChange={e => setNewGoal({...newGoal, paymentAmount: e.target.value})} style={{...inputStyle, width: '70px'}} />
                  <select value={newGoal.savingsFrequency} onChange={e => setNewGoal({...newGoal, savingsFrequency: e.target.value})} style={{...inputStyle, width: '100px'}}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                  <button onClick={addGoal} style={btnPurple}>+</button>
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto' as const }}>
                  {goals.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No goals yet</p> : goals.map(goal => {
                    const progress = (parseFloat(goal.saved || '0') / parseFloat(goal.target || '1')) * 100
                    return (
                      <div key={goal.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#2e1e3a' : '#faf5ff', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div><div style={{ color: theme.text, fontWeight: 600 }}>{goal.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>${parseFloat(goal.saved || '0').toFixed(0)} / ${parseFloat(goal.target || '0').toFixed(0)}</div></div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: theme.purple, fontWeight: 700 }}>{progress.toFixed(0)}%</span><button onClick={() => deleteGoal(goal.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>×</button></div>
                        </div>
                        <div style={{ height: '8px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: theme.purple, borderRadius: '4px' }} /></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Assets */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: theme.success, fontSize: '18px' }}>💰 Assets</h3>
                <div style={{ textAlign: 'right' as const }}><div style={{ color: theme.success, fontWeight: 700, fontSize: '18px' }}>${totalAssets.toLocaleString()}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>Wealth Position: <span style={{ color: netWorth >= 0 ? theme.success : theme.danger }}>${netWorth.toLocaleString()}</span></div></div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input placeholder="Asset name" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} style={{...inputStyle, flex: 1}} />
                <input placeholder="Value" type="number" value={newAsset.value} onChange={e => setNewAsset({...newAsset, value: e.target.value})} style={{...inputStyle, width: '100px'}} />
                <select value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} style={inputStyle}><option value="savings">💰 Savings</option><option value="super">🏦 Super</option><option value="investment">📊 Investment</option><option value="property">🏠 Property</option><option value="vehicle">🚗 Vehicle</option></select>
                <button onClick={addAsset} style={btnSuccess}>+</button>
              </div>
              {assets.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No assets yet</p> : assets.map(a => (
                <div key={a.id} style={{ padding: '10px 12px', marginBottom: '6px', background: darkMode ? '#1e2a3b' : '#f8fafc', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><span style={{ color: theme.text, fontSize: '14px' }}>{a.name}</span><span style={{ color: theme.textMuted, fontSize: '11px', marginLeft: '8px' }}>{a.type}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: theme.success, fontWeight: 700 }}>${parseFloat(a.value).toLocaleString()}</span><button onClick={() => deleteAsset(a.id)} style={{ padding: '2px 6px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>×</button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            <div data-aureus-chat="true" style={{ padding: '20px', background: `linear-gradient(135deg, ${theme.success}15, ${theme.purple}15)`, borderRadius: '16px', border: '2px solid ' + theme.success }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}><div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#78350f' }}>A</div><div><div style={{ color: theme.text, fontWeight: 600 }}>Aureus</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>Operations Score: {financialHealthScore}</div></div></div>
              <div style={{ display: 'flex', gap: '8px' }}><input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChatMessage()} placeholder="Ask Aureus anything..." style={{ ...inputStyle, flex: 1, padding: '10px 14px', fontSize: '13px' }} disabled={isLoading} /><button onClick={handleChatMessage} disabled={isLoading || !chatInput.trim()} style={{ padding: '10px 16px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', opacity: isLoading || !chatInput.trim() ? 0.5 : 1 }}>{isLoading ? '...' : 'Send'}</button></div>
            </div>

            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ color: '#64748b', fontSize: '12px', letterSpacing: '2px' }}>FINANCIAL OPERATIONS SCORE</div></div>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: financialHealthScore >= 70 ? theme.success : financialHealthScore >= 40 ? theme.warning : theme.danger }}>{financialHealthScore}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Monthly Revenue</div><div style={{ color: theme.success, fontSize: '24px', fontWeight: 700 }}>${monthlyIncome.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Operating Costs</div><div style={{ color: theme.danger, fontSize: '24px', fontWeight: 700 }}>${totalOutgoing.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Net Profit</div><div style={{ color: monthlySurplus >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>${monthlySurplus.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Wealth Position</div><div style={{ color: netWorth >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>${netWorth.toFixed(0)}</div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={cardStyle}><h3 style={{ margin: '0 0 16px 0', color: theme.success }}>📈 Assets (${totalAssets.toLocaleString()})</h3>
                {assets.map(a => <div key={a.id} style={{ padding: '10px', marginBottom: '8px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text }}>{a.name} ({a.type})</span><span style={{ color: theme.success, fontWeight: 700 }}>${parseFloat(a.value).toLocaleString()}</span></div>)}
              </div>
              <div style={cardStyle}><h3 style={{ margin: '0 0 16px 0', color: theme.danger }}>📉 Liabilities (${(totalLiabilities + totalDebtBalance).toFixed(0)})</h3>
                {debts.map(d => <div key={'d' + d.id} style={{ padding: '10px', marginBottom: '8px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text }}>💳 {d.name}</span><span style={{ color: theme.danger, fontWeight: 700 }}>${parseFloat(d.balance).toFixed(0)}</span></div>)}
                {liabilities.map(l => <div key={l.id} style={{ padding: '10px', marginBottom: '8px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text }}>{l.name}</span><span style={{ color: theme.danger, fontWeight: 700 }}>${parseFloat(l.value).toFixed(0)}</span></div>)}
              </div>
            </div>

            {/* Redraw vs Offset Education */}
            <div style={{ padding: '20px', background: '#10b98115', borderRadius: '12px', border: '2px solid #10b981' }}>
              <h4 style={{ color: '#10b981', margin: '0 0 12px 0' }}>🏦 Redraw vs Offset: The Infinity Strategy</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '8px' }}>
                  <div style={{ color: theme.danger, fontWeight: 700, marginBottom: '8px' }}>❌ Offset Account Trap</div>
                  <ul style={{ color: theme.textMuted, fontSize: '13px', margin: 0, paddingLeft: '20px' }}>
                    <li>Money sitting in offset = "available to spend"</li>
                    <li>Easy access = temptation to dip in</li>
                    <li>Most people spend what they can see</li>
                    <li>30-year mortgage becomes reality</li>
                  </ul>
                </div>
                <div style={{ padding: '16px', background: theme.cardBg, borderRadius: '8px' }}>
                  <div style={{ color: theme.success, fontWeight: 700, marginBottom: '8px' }}>✅ Redraw Strategy</div>
                  <ul style={{ color: theme.textMuted, fontSize: '13px', margin: 0, paddingLeft: '20px' }}>
                    <li>Pay ALL income into the mortgage</li>
                    <li>Redraw ONLY budgeted expenses</li>
                    <li>Remaining money stays paying down principal</li>
                    <li>Interest calculated daily on lower balance</li>
                    <li><strong>Result: 7-10 year mortgage payoff</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PATH TAB */}
        {activeTab === 'path' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #f59e0b15, #ef444415)', borderRadius: '12px', border: '1px solid #f59e0b40' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <div><div style={{ color: theme.text, fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Important Disclaimer</div><p style={{ margin: 0, color: theme.textMuted, fontSize: '12px', lineHeight: 1.5 }}>This app provides general financial information and AI-powered suggestions for educational purposes only. It is <strong>not financial advice</strong>. Consult a licensed financial advisor before making significant financial decisions.</p></div>
              </div>
            </div>

            <div data-aureus-chat="true" style={{ padding: '20px', background: `linear-gradient(135deg, ${theme.success}15, ${theme.purple}15)`, borderRadius: '16px', border: '2px solid ' + theme.success }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}><div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#78350f' }}>A</div><div><div style={{ color: theme.text, fontWeight: 600 }}>Aureus</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>{currentBabyStep.title}</div></div></div>
              <div style={{ display: 'flex', gap: '8px' }}><input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChatMessage()} placeholder="Ask Aureus anything..." style={{ ...inputStyle, flex: 1, padding: '10px 14px', fontSize: '13px' }} disabled={isLoading} /><button onClick={handleChatMessage} disabled={isLoading || !chatInput.trim()} style={{ padding: '10px 16px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', opacity: isLoading || !chatInput.trim() ? 0.5 : 1 }}>{isLoading ? '...' : 'Send'}</button></div>
            </div>

            {/* Baby Steps */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>👶 Australian Baby Steps</h2>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                {australianBabySteps.map((item) => {
                  const isCurrent = item.step === currentBabyStep.step
                  const done = item.step < currentBabyStep.step
                  return (
                    <div key={item.step} onClick={() => setSelectedBabyStep(item.step)} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', background: done ? (darkMode ? '#1e3a32' : '#f0fdf4') : isCurrent ? (darkMode ? '#2e2a1e' : '#fefce8') : (darkMode ? '#334155' : '#f8fafc'), borderRadius: '12px', border: done ? '2px solid ' + theme.success : isCurrent ? '2px solid ' + theme.warning : '1px solid ' + theme.border, cursor: 'pointer' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: done ? theme.success : isCurrent ? theme.warning : theme.purple, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>{done ? '✓' : item.icon}</div>
                      <div style={{ flex: 1 }}><div style={{ color: theme.text, fontWeight: 600, fontSize: '16px' }}>{item.title}</div><div style={{ color: theme.textMuted, fontSize: '13px' }}>{item.desc}</div></div>
                      <div style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: done ? theme.success : isCurrent ? theme.warning : theme.border, color: done || isCurrent ? 'white' : theme.textMuted }}>{done ? '✓ Complete' : isCurrent ? '→ Current' : 'Pending'}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* FIRE Progress */}
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, ' + theme.purple + '15, ' + theme.success + '15)', borderRadius: '16px', border: '2px solid ' + theme.purple }}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>🔥 Escape the Rat Race</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ ...cardStyle, padding: '20px' }}><h3 style={{ margin: '0 0 12px 0', color: theme.purple, fontSize: '18px' }}>🌴 Freedom Target</h3><div style={{ color: theme.text, fontSize: '14px', lineHeight: 2 }}><div>Monthly need: <strong>${fiPath.monthlyNeed.toFixed(0)}</strong></div><div>Passive income: <strong style={{ color: theme.success }}>${(passiveIncome + totalPassiveQuestIncome).toFixed(0)}</strong></div><div>Coverage: <strong style={{ color: theme.purple }}>{((passiveIncome + totalPassiveQuestIncome) / fiPath.monthlyNeed * 100).toFixed(1)}%</strong></div></div></div>
                <div style={{ ...cardStyle, padding: '20px' }}><h3 style={{ margin: '0 0 12px 0', color: theme.success, fontSize: '18px' }}>🔥 FIRE Number</h3><div style={{ color: theme.text, fontSize: '14px', lineHeight: 2 }}><div>Target: <strong>${fiPath.fireNumber.toLocaleString()}</strong></div><div>Investments + Super: <strong style={{ color: theme.success }}>${fiPath.currentInvestments.toLocaleString()}</strong></div><div>Years to FI: <strong style={{ color: theme.purple }}>{fiPath.yearsToFI >= 999 ? '∞' : fiPath.yearsToFI}</strong></div></div></div>
              </div>
            </div>

            {/* Automation */}
            {incomeStreams.length > 0 && (
              <div style={{ padding: '24px', background: 'linear-gradient(135deg, #3b82f615, #8b5cf615)', borderRadius: '16px', border: '2px solid ' + theme.accent }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}><h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>🤖 Set & Forget Automation</h2></div>
                {(() => {
                  const auto = calculateAutomation()
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                      <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}><div style={{ fontSize: '32px' }}>💳</div><div style={{ color: theme.textMuted, fontSize: '13px' }}>Bills Account</div><div style={{ color: theme.warning, fontSize: '24px', fontWeight: 'bold' }}>${auto.bills.total.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>per {auto.payFrequency}</div></div>
                      <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}><div style={{ fontSize: '32px' }}>🎯</div><div style={{ color: theme.textMuted, fontSize: '13px' }}>Savings Account</div><div style={{ color: theme.purple, fontSize: '24px', fontWeight: 'bold' }}>${auto.savings.total.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>per {auto.payFrequency}</div></div>
                      <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}><div style={{ fontSize: '32px' }}>💵</div><div style={{ color: theme.textMuted, fontSize: '13px' }}>Spending Money</div><div style={{ color: theme.success, fontSize: '24px', fontWeight: 'bold' }}>${auto.spending.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>per {auto.payFrequency}</div></div>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Passive Quests */}
            <div style={{ padding: '24px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '16px', border: '1px solid ' + theme.border }}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>💰 Automated Revenue Strategies</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {passiveQuests.map(quest => {
                  const isExpanded = activeQuestId === quest.id
                  return (
                    <div key={quest.id} style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', border: '1px solid ' + theme.border }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{ width: '44px', height: '44px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{quest.icon}</div>
                          <div><div style={{ fontWeight: 600, color: theme.text, fontSize: '15px' }}>{quest.name}</div><div style={{ color: theme.textMuted, fontSize: '13px' }}>{quest.description}</div></div>
                        </div>
                        <div><span style={{ padding: '4px 10px', background: quest.status === 'completed' ? theme.success + '30' : theme.cardBg, color: quest.status === 'completed' ? theme.success : theme.textMuted, borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{quest.status === 'completed' ? '✓ COMPLETE' : quest.potentialIncome}</span></div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', margin: '12px 0', marginLeft: '56px', flexWrap: 'wrap' as const }}>
                        <span style={{ padding: '3px 8px', background: darkMode ? '#334155' : '#e2e8f0', color: theme.textMuted, borderRadius: '4px', fontSize: '11px' }}>⏱ {quest.timeToSetup}</span>
                        <span style={{ padding: '3px 8px', background: darkMode ? '#334155' : '#e2e8f0', color: theme.textMuted, borderRadius: '4px', fontSize: '11px' }}>{'★'.repeat(quest.difficulty === 'Easy' ? 1 : quest.difficulty === 'Medium' ? 2 : quest.difficulty === 'Hard' ? 3 : 4)} {quest.difficulty}</span>
                      </div>
                      <button onClick={() => setActiveQuestId(isExpanded ? null : quest.id)} style={{ background: 'none', border: 'none', color: theme.accent, fontSize: '13px', cursor: 'pointer', marginLeft: '56px' }}>▼ {isExpanded ? 'Hide' : 'Expand'} guide</button>
                      {isExpanded && (
                        <div style={{ marginTop: '16px', marginLeft: '56px', padding: '16px', background: darkMode ? '#0f172a' : '#f1f5f9', borderRadius: '8px' }}>
                          <div style={{ background: theme.success + '15', padding: '12px', borderRadius: '8px', marginBottom: '16px', borderLeft: '3px solid ' + theme.success }}><p style={{ margin: 0, color: theme.text, fontSize: '13px', lineHeight: 1.6 }}>💡 {quest.aureusAdvice}</p></div>
                          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                            {quest.steps?.map((step: any, idx: number) => (
                              <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: theme.border, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>{idx + 1}</div>
                                <div style={{ flex: 1 }}><div style={{ fontWeight: 500, color: theme.text, fontSize: '13px' }}>{step.title}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{step.description}</div></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Home Buying Roadmap */}
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🏠</div>
                <div style={{ flex: 1 }}><h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>Australian Home Buying Roadmap</h2><p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '13px' }}>Click each phase to expand</p></div>
              </div>
              {['phase1', 'phase2', 'phase3', 'phase4', 'phase5'].map(phase => (
                <div key={phase} style={{ marginBottom: '12px', borderRadius: '12px', overflow: 'hidden', border: '1px solid ' + theme.border }}>
                  <button onClick={() => setHomeGuideExpanded(homeGuideExpanded === phase ? null : phase)} style={{ width: '100%', padding: '16px 20px', background: homeGuideExpanded === phase ? (darkMode ? '#1a1a2e' : '#f8fafc') : theme.cardBg, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{phase === 'phase1' ? '💰' : phase === 'phase2' ? '🧾' : phase === 'phase3' ? '🏛️' : phase === 'phase4' ? '🏦' : '🎯'}</span>
                      <div style={{ textAlign: 'left' as const }}><div style={{ color: phase === 'phase1' ? theme.warning : phase === 'phase2' ? theme.purple : phase === 'phase3' ? theme.accent : phase === 'phase4' ? theme.success : theme.danger, fontWeight: 700 }}>
                        Phase {phase === 'phase1' ? '1' : phase === 'phase2' ? '2' : phase === 'phase3' ? '3' : phase === 'phase4' ? '4' : '5'}: {phase === 'phase1' ? 'Get Financially Ready' : phase === 'phase2' ? 'Understand the Costs' : phase === 'phase3' ? 'Government Schemes' : phase === 'phase4' ? 'Get Pre-Approved' : 'Buy Smart'}
                      </div></div>
                    </div>
                    <span style={{ color: theme.textMuted, fontSize: '20px' }}>{homeGuideExpanded === phase ? '▼' : '▶'}</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Roadmap */}
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '16px', border: '2px solid ' + theme.purple }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>🗺️ My Roadmap</h2>
                <button onClick={() => setShowAddMilestone(true)} style={{ padding: '10px 20px', background: theme.purple, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Add Milestone</button>
              </div>
              {roadmapMilestones.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}><div style={{ fontSize: '48px' }}>🎯</div><h3 style={{ color: theme.text }}>No milestones yet</h3><p style={{ color: theme.textMuted }}>Add your first milestone to start mapping your journey!</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
                  {roadmapMilestones.map(milestone => {
                    const progress = milestone.targetAmount > 0 ? (milestone.currentAmount / parseFloat(milestone.targetAmount)) * 100 : 0
                    return (
                      <div key={milestone.id} style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div><h4 style={{ margin: '0 0 4px 0', color: theme.text }}>{milestone.name}</h4><span style={{ color: theme.purple, fontSize: '13px' }}>${parseFloat(milestone.targetAmount).toLocaleString()}</span></div>
                          <button onClick={() => setRoadmapMilestones(roadmapMilestones.filter(m => m.id !== milestone.id))} style={{ padding: '4px 8px', background: theme.danger + '20', color: theme.danger, border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                        </div>
                        <div style={{ height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}><div style={{ width: Math.min(progress, 100) + '%', height: '100%', background: 'linear-gradient(90deg, ' + theme.purple + ', ' + theme.success + ')' }} /></div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* EXPANDED DAY MODAL */}
        {expandedDay && (
          <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setExpandedDay(null)}>
            <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' as const }} onClick={e => e.stopPropagation()}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>{calendarMonth.toLocaleDateString('en-US', { month: 'long' })} {expandedDay.day}</h3>
              {expandedDay.items.map(item => (
                <div key={item.itemId} style={{ padding: '12px', marginBottom: '8px', background: item.itemType === 'income' ? '#d1fae5' : item.itemType === 'expense' ? '#dbeafe' : '#fee2e2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: item.isPaid ? 0.6 : 1 }}>
                  <div><div style={{ fontWeight: 600, color: '#1e293b' }}>{item.name}</div><div style={{ fontSize: '12px', color: '#64748b' }}>${item.amount}</div></div>
                  <button onClick={() => togglePaid(item.itemId)} style={{ padding: '8px 16px', background: item.isPaid ? '#6b7280' : theme.success, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{item.isPaid ? '✓ Paid' : 'Pay'}</button>
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
              <div style={{ background: theme.cardBg, borderRadius: '20px', padding: '28px', maxWidth: '650px', width: '100%', maxHeight: '85vh', overflowY: 'auto' as const }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: done ? theme.success : isCurrent ? theme.warning : theme.purple, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>{done ? '✓' : step.icon}</div>
                    <div><div style={{ color: theme.textMuted, fontSize: '12px' }}>Step {step.step} of 7</div><h3 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>{step.title}</h3></div>
                  </div>
                  <button onClick={() => setSelectedBabyStep(null)} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '24px', cursor: 'pointer' }}>×</button>
                </div>
                <div style={{ background: darkMode ? '#1e293b' : '#f0fdf4', borderRadius: '12px', padding: '16px', marginBottom: '20px', borderLeft: '4px solid ' + theme.success }}><p style={{ margin: 0, color: theme.text, fontSize: '14px', lineHeight: 1.7 }}>💡 <strong>Aureus says:</strong> {step.aureusAdvice}</p></div>
                <h4 style={{ color: theme.text, margin: '0 0 12px 0' }}>✅ Tips for this step:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: theme.text, lineHeight: 2 }}>{step.tips?.map((tip: string, idx: number) => <li key={idx}>{tip}</li>)}</ul>
                <button onClick={() => { setSelectedBabyStep(null); setChatInput(`Tell me more about ${step.title}`) }} style={{ width: '100%', marginTop: '20px', padding: '14px', background: theme.accent, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: 600 }}>💬 Ask Aureus About This Step</button>
              </div>
            </div>
          )
        })()}

        {/* ADD MILESTONE MODAL */}
        {showAddMilestone && (
          <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowAddMilestone(false)}>
            <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '100%' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ margin: '0 0 20px 0', color: theme.text }}>✨ Add New Milestone</h3>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                <input placeholder="Milestone Name" value={newMilestone.name} onChange={e => setNewMilestone({...newMilestone, name: e.target.value})} style={{...inputStyle, width: '100%'}} />
                <input type="number" placeholder="Target Amount ($)" value={newMilestone.targetAmount} onChange={e => setNewMilestone({...newMilestone, targetAmount: e.target.value})} style={{...inputStyle, width: '100%'}} />
                <input type="date" value={newMilestone.targetDate} onChange={e => setNewMilestone({...newMilestone, targetDate: e.target.value})} style={{...inputStyle, width: '100%'}} />
                <button onClick={() => { if (newMilestone.name && newMilestone.targetAmount) { setRoadmapMilestones([...roadmapMilestones, { ...newMilestone, id: Date.now(), currentAmount: 0, completed: false, createdAt: new Date().toISOString() }]); setNewMilestone({ name: '', targetAmount: '', targetDate: '', category: 'savings', icon: '🎯', notes: '' }); setShowAddMilestone(false) } }} style={btnSuccess}>Add Milestone</button>
                <button onClick={() => setShowAddMilestone(false)} style={{ ...btnPrimary, background: theme.textMuted }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={{ padding: '16px 24px', background: theme.cardBg, borderTop: '1px solid ' + theme.border, textAlign: 'center' as const }}>
        <p style={{ margin: '0 0 8px 0', color: theme.textMuted, fontSize: '11px', lineHeight: 1.5 }}>
          ⚠️ <strong>Disclaimer:</strong> Aureus is an AI-powered financial assistant for educational and informational purposes only. 
          This is not financial, tax, or legal advice. AI can make mistakes — always verify information. 
          Consult qualified professionals before making financial decisions.
        </p>
        <p style={{ margin: 0, color: theme.textMuted, fontSize: '10px' }}>
          © {new Date().getFullYear()} Aureus • Not affiliated with any financial institution • Education first, products second
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
