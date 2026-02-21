'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect, useRef } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  // ==================== APP MODE & NAVIGATION ====================
  const [appMode, setAppMode] = useState<'budget' | 'trading' | null>(null)
  const [showModeSelector, setShowModeSelector] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'path' | 'trading'>('dashboard')
  const [darkMode, setDarkMode] = useState(true)
  
  // ==================== TOUR STATE ====================
  const [showTour, setShowTour] = useState(false)
  const [tourStep, setTourStep] = useState(0)
  const [tourCompleted, setTourCompleted] = useState(false)
  
  // ==================== UPLOAD STATE ====================
  const [showPayslipUpload, setShowPayslipUpload] = useState(false)
  const [payslipProcessing, setPayslipProcessing] = useState(false)
  const [extractedPayslip, setExtractedPayslip] = useState<any>(null)
  const payslipInputRef = useRef<HTMLInputElement>(null)
  
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
        { title: 'Research accounts', description: 'Compare rates at Up (5%), ING (5.5%), Ubank (5.1%), BOQ (5%)', action: 'I\'ll research savings accounts' },
        { title: 'Open account', description: 'Most can be opened online in 10 minutes with just your ID', action: 'I\'ve opened my account' },
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
        { title: 'Research cards', description: 'Compare: ING Orange (cashback), Bankwest Breeze (rewards), HSBC (points)', action: 'I\'ve researched options' },
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
      status: 'locked', 
      progress: 0,
      currentStep: 0,
      monthlyIncome: 0, 
      unlockRequirement: 'Complete $2k emergency fund',
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
      status: 'locked', 
      progress: 0,
      currentStep: 0,
      monthlyIncome: 0, 
      unlockRequirement: 'Complete $2k emergency fund',
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
      status: 'locked', 
      progress: 0,
      currentStep: 0,
      monthlyIncome: 0, 
      unlockRequirement: '$500/mo passive income',
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
      status: 'locked', 
      progress: 0,
      currentStep: 0,
      monthlyIncome: 0, 
      unlockRequirement: '$50k deposit saved',
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
  
  // Selected quest for detail view
  const [showQuestDetail, setShowQuestDetail] = useState(false)
  const [selectedBabyStep, setSelectedBabyStep] = useState<number | null>(null)
  
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
  
  // Alerts & Reminders
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [alertDaysBefore, setAlertDaysBefore] = useState(2)
  
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
    instrument: '', 
    direction: 'long', 
    entryPrice: '', 
    exitPrice: '', 
    profitLoss: '', 
    riskAmount: '',
    accountId: 0,
    setupGrade: 'A', // A, B, C setup quality
    emotionBefore: 'neutral', // confident, neutral, anxious, fomo, revenge
    emotionAfter: 'neutral',
    followedPlan: true,
    notes: '',
    screenshot: ''
  })
  const [tradingCalendarMonth, setTradingCalendarMonth] = useState(new Date())
  
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
    isActive: true
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
    startingCapital: '10000',
    monthlyContribution: '500',
    returnRate: '1',
    returnPeriod: 'daily',
    years: '0',
    months: '3',
    days: '0',
    includeDays: ['M', 'T', 'W', 'T2', 'F'],
    reinvestRate: '100'
  })
  
  // ==================== AI AGENT STATE ====================
  const [budgetMemory, setBudgetMemory] = useState<any>({
    name: '',
    onboardingComplete: false,
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
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
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
    }
  }, [])

  useEffect(() => {
    const data = {
      incomeStreams, expenses, debts, goals, assets, liabilities, trades,
      budgetMemory, tradingMemory,
      paidOccurrences: Array.from(paidOccurrences)
    }
    localStorage.setItem('aureus_data', JSON.stringify(data))
  }, [incomeStreams, expenses, debts, goals, assets, liabilities, trades, budgetMemory, tradingMemory, paidOccurrences])

  // Scroll chat to bottom - use scrollTop instead of scrollIntoView to avoid page jump
  const chatContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
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
    setTrades([...trades, { ...newTrade, id: Date.now() }].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    setNewTrade({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' })
  }
  const deleteTrade = (id: number) => setTrades(trades.filter(t => t.id !== id))

  const addPresetBill = (preset: any) => {
    const amount = prompt(`Enter amount for ${preset.name}:`, preset.amount || '')
    if (!amount) return
    setExpenses([...expenses, { id: Date.now(), name: preset.name, amount, frequency: preset.frequency, category: preset.category, dueDate: new Date().toISOString().split('T')[0] }])
  }

  const addGoalToCalendar = (goal: any) => {
    if (!goal.paymentAmount) { alert('Set a payment amount first'); return }
    setGoals(goals.map(g => g.id === goal.id ? { ...g, startDate: g.startDate || new Date().toISOString().split('T')[0] } : g))
    alert(`${goal.name} added to calendar!`)
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

    goals.filter(g => g.paymentAmount && g.startDate).forEach(goal => {
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

  // ==================== AI AGENT FUNCTIONS ====================
  const fetchProactiveInsight = async (mode: 'budget' | 'trading') => {
    setIsLoading(true)
    try {
      const endpoint = mode === 'budget' ? '/api/budget-coach' : '/api/trading-coach'
      const body = mode === 'budget'
        ? { mode: 'proactive', financialData: { income: incomeStreams, expenses, debts, goals, assets, liabilities }, memory: budgetMemory }
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
      
      const apiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: 'onboarding', 
          onboardingStep: currentStep, 
          userResponse: response,
          conversationHistory: recentHistory,
          memory,
          financialData: { income: incomeStreams, expenses, debts, goals, assets, liabilities }
        })
      })
      
      const data = await apiResponse.json()
      
      // Execute any actions returned by the AI FIRST
      let addedSummary = ''
      if (data.actions && Array.isArray(data.actions) && data.actions.length > 0) {
        executeAIActions(data.actions)
        
        // Build summary of what was added
        const incomeAdded = data.actions.filter((a: any) => a.type === 'addIncome')
        const expenseAdded = data.actions.filter((a: any) => a.type === 'addExpense')
        const debtAdded = data.actions.filter((a: any) => a.type === 'addDebt')
        const goalAdded = data.actions.filter((a: any) => a.type === 'addGoal')
        
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
        if (mode === 'budget') setBudgetOnboarding(prev => ({ ...prev, step: data.nextStep }))
        else setTradingOnboarding(prev => ({ ...prev, step: data.nextStep }))
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
              instrument: data.instrument,
              direction: data.direction || 'long',
              entryPrice: data.entryPrice || '',
              exitPrice: data.exitPrice || '',
              profitLoss: data.profitLoss.toString().replace(/[$,]/g, ''),
              notes: data.notes || ''
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

        // ===== MEMORY ACTIONS =====
        case 'setMemory':
          setBudgetMemory((prev: any) => {
            const updated = { ...prev }
            if (data.name) updated.name = data.name
            if (data.payDay) updated.payDay = data.payDay
            if (data.lifeEvents) updated.lifeEvents = data.lifeEvents
            if (data.currentStep) updated.currentStep = data.currentStep
            if (data.preferences) updated.preferences = { ...prev.preferences, ...data.preferences }
            if (data.patterns) updated.patterns = [...(prev.patterns || []), ...data.patterns]
            if (data.notes) updated.notes = [...(prev.notes || []), ...data.notes]
            return updated
          })
          break
      }
    })
  }

  const handleChatMessage = async () => {
    if (!chatInput.trim() || isLoading) return
    const message = chatInput.trim()
    
    if ((appMode === 'budget' && budgetOnboarding.isActive) || (appMode === 'trading' && tradingOnboarding.isActive)) {
      await handleOnboardingResponse(message, appMode!)
      return
    }
    
    setChatMessages(prev => [...prev, { role: 'user', content: message }])
    setChatInput('')
    setIsLoading(true)
    
    try {
      const endpoint = appMode === 'budget' ? '/api/budget-coach' : '/api/trading-coach'
      
      // Build conversation history for context
      const recentHistory = [...chatMessages.slice(-10), { role: 'user', content: message }]
        .map(m => `${m.role === 'user' ? 'User' : 'Aureus'}: ${m.content}`)
        .join('\n')
      
      const body = appMode === 'budget'
        ? { mode: 'question', question: message, conversationHistory: recentHistory, financialData: { income: incomeStreams, expenses, debts, goals, assets, liabilities }, memory: budgetMemory }
        : { mode: 'question', question: message, conversationHistory: recentHistory, tradingData: { trades }, memory: tradingMemory }
      
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
      setChatMessages([{ role: 'assistant', content: "Hey! 👋 I'm Aureus, your financial companion. I'm here to help you take control of your money - whether that's crushing debt, building savings, or escaping the rat race.\n\nLet's get to know each other. What should I call you?" }])
    } else {
      setTradingOnboarding({ isActive: true, step: 'greeting' })
      setChatMessages([{ role: 'assistant', content: "Hey trader! 📈 I'm Aureus, your trading mentor. I'll help you stay disciplined, track your performance, and crush those prop firm challenges.\n\nWhat's your name, and how long have you been trading?" }])
    }
  }

  const handleModeSelect = (mode: 'budget' | 'trading') => {
    setAppMode(mode)
    setShowModeSelector(false)
    setActiveTab(mode === 'budget' ? 'dashboard' : 'trading')
    setChatMessages([])
    setProactiveInsight(null)
    
    const memory = mode === 'budget' ? budgetMemory : tradingMemory
    if (!memory.onboardingComplete) {
      startOnboarding(mode)
    } else {
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
    const monthly = parseFloat(tradingCalculator.monthlyContribution) || 0
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
    
    for (let d = 0; d < totalTradingDays; d++) {
      const profit = balance * rate
      balance += profit * reinvest
      if (d > 0 && d % 20 === 0) {
        balance += monthly
        totalContributed += monthly
      }
    }
    
    return { futureValue: balance, totalContributed, profit: balance - totalContributed, totalCalendarDays, totalTradingDays }
  }

  const forexPropResults = calculateForexProp()
  const futuresPropResults = calculateFuturesProp()
  const tradingResults = calculateTradingCompound()

  // Tour content
  const tourSteps = [
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

  // ==================== RENDER: TOUR ====================
  if (showTour && appMode === 'budget') {
    const currentTourStep = tourSteps[tourStep]
    return (
      <div style={{ minHeight: '100vh', background: darkMode ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '600px', width: '100%', background: theme.cardBg, borderRadius: '24px', padding: '48px', textAlign: 'center' as const, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
            {tourSteps.map((_, i) => (
              <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i === tourStep ? theme.accent : theme.border, transition: 'all 0.3s' }} />
            ))}
          </div>
          
          {/* Icon */}
          <div style={{ fontSize: '72px', marginBottom: '24px' }}>{currentTourStep.icon}</div>
          
          {/* Title */}
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: theme.text, margin: '0 0 16px 0' }}>{currentTourStep.title}</h1>
          
          {/* Content */}
          <p style={{ fontSize: '16px', color: theme.textMuted, lineHeight: 1.7, margin: '0 0 32px 0' }}>{currentTourStep.content}</p>
          
          {/* Visual highlight based on step */}
          {tourStep === 1 && (
            <div style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ color: 'white', fontSize: '14px', opacity: 0.9 }}>Your FIRE Number</div>
              <div style={{ color: 'white', fontSize: '36px', fontWeight: 700 }}>$750,000</div>
              <div style={{ color: 'white', fontSize: '12px', opacity: 0.8 }}>Based on $2,500/month expenses × 12 × 25</div>
            </div>
          )}
          
          {tourStep === 2 && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' as const, marginBottom: '24px' }}>
              {['1. $1K Fund', '2. Kill Debt', '3. Full Fund', '4. Invest 15%', '5. Education', '6. Pay Home', '7. Wealth'].map((step, i) => (
                <span key={i} style={{ padding: '8px 12px', background: i === 0 ? theme.success : theme.border, color: i === 0 ? 'white' : theme.textMuted, borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}>{step}</span>
              ))}
            </div>
          )}
          
          {tourStep === 3 && (
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
          
          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {tourStep > 0 && (
              <button onClick={() => setTourStep(tourStep - 1)} style={{ padding: '14px 28px', background: 'transparent', border: '2px solid ' + theme.border, borderRadius: '12px', color: theme.textMuted, cursor: 'pointer', fontWeight: 600 }}>
                ← Back
              </button>
            )}
            
            {tourStep < tourSteps.length - 1 ? (
              <button onClick={() => setTourStep(tourStep + 1)} style={{ padding: '14px 28px', background: theme.accent, border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                Next →
              </button>
            ) : (
              <button onClick={() => { setShowTour(false); setTourCompleted(true); setBudgetOnboarding({ isActive: true, step: 'greeting' }); setChatMessages([{ role: 'assistant', content: "Hey! 👋 I'm Aureus, your financial companion. I'm here to help you take control of your money - whether that's crushing debt, building savings, or escaping the rat race.\n\nLet's get to know each other. What should I call you?" }]) }} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '16px' }}>
                Let's Go! 🚀
              </button>
            )}
          </div>
          
          {/* Skip link */}
          <button onClick={() => { setShowTour(false); setTourCompleted(true); setBudgetOnboarding({ isActive: true, step: 'greeting' }); setChatMessages([{ role: 'assistant', content: "Hey! 👋 I'm Aureus, your financial companion. I'm here to help you take control of your money - whether that's crushing debt, building savings, or escaping the rat race.\n\nLet's get to know each other. What should I call you?" }]) }} style={{ marginTop: '24px', background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '14px' }}>
            Skip tour
          </button>
        </div>
      </div>
    )
  }

  // ==================== RENDER: MODE SELECTOR ====================
  if (showModeSelector) {
    return (
      <div style={{ minHeight: '100vh', background: darkMode ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' as const, marginBottom: '48px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✨</div>
          <h1 style={{ fontSize: '42px', fontWeight: 800, color: theme.text, margin: '0 0 12px 0' }}>Welcome to Aureus</h1>
          <p style={{ fontSize: '18px', color: theme.textMuted, margin: 0 }}>Your AI-powered financial companion</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '700px', width: '100%' }}>
          <button onClick={() => { 
            setAppMode('budget')
            setShowModeSelector(false)
            // Show tour for new users, skip for returning users
            if (!budgetMemory.onboardingComplete && !tourCompleted) {
              setShowTour(true)
            } else if (!budgetMemory.onboardingComplete) {
              setBudgetOnboarding({ isActive: true, step: 'greeting' })
              setChatMessages([{ role: 'assistant', content: "Hey! 👋 I'm Aureus, your financial companion. I'm here to help you take control of your money - whether that's crushing debt, building savings, or escaping the rat race.\n\nLet's get to know each other. What should I call you?" }])
            }
          }} style={{ padding: '32px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '24px', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
            <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>Budget Mode</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0 0 16px 0', fontSize: '14px' }}>{budgetMemory.onboardingComplete ? `Welcome back${budgetMemory.name ? ', ' + budgetMemory.name : ''}!` : 'Get set up in 5 minutes'}</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
              {['Baby Steps', 'FIRE Path', 'Calendar', 'Goals'].map(tag => <span key={tag} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '11px', color: 'white' }}>{tag}</span>)}
            </div>
          </button>
          
          <button onClick={() => handleModeSelect('trading')} style={{ padding: '32px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '24px', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📈</div>
            <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>Trading Mode</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0 0 16px 0', fontSize: '14px' }}>{tradingMemory.onboardingComplete ? `Welcome back${tradingMemory.name ? ', ' + tradingMemory.name : ''}!` : 'Get set up in 5 minutes'}</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
              {['Prop Firms', 'Journal', 'Calculator'].map(tag => <span key={tag} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '11px', color: 'white' }}>{tag}</span>)}
            </div>
          </button>
        </div>
        
        {totalPL !== 0 && <div style={{ marginTop: '24px', padding: '16px 24px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border }}><p style={{ color: theme.textMuted, margin: 0, fontSize: '14px' }}>💡 Trading P&L (${totalPL.toFixed(0)}) flows into Budget Mode</p></div>}
        
        <button onClick={() => setDarkMode(!darkMode)} style={{ marginTop: '32px', padding: '12px 24px', background: 'transparent', border: '2px solid ' + theme.border, borderRadius: '12px', color: theme.textMuted, cursor: 'pointer' }}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
      </div>
    )
  }

  // Continued in render return...

  // ==================== RENDER: MAIN APP ====================
  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      {/* Modals */}
      {expandedDay && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setExpandedDay(null)}>
          <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' as const }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>{calendarMonth.toLocaleDateString('en-US', { month: 'long' })} {expandedDay.day}</h3>
            {expandedDay.items.length === 0 ? <p style={{ color: theme.textMuted }}>No items scheduled</p> : expandedDay.items.map(item => (
              <div key={item.itemId} style={{ padding: '12px', marginBottom: '8px', background: item.itemType === 'income' ? '#d1fae5' : item.itemType === 'expense' ? '#dbeafe' : item.itemType === 'debt' ? '#fee2e2' : '#ede9fe', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: item.isPaid ? 0.6 : 1 }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setShowModeSelector(true)} style={{ padding: '8px 16px', background: appMode === 'budget' ? theme.success : theme.warning, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
            {appMode === 'budget' ? '💰 Budget' : '📈 Trading'} ▼
          </button>
          <span style={{ color: theme.text, fontWeight: 700, fontSize: '20px' }}>Aureus</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {appMode === 'budget' && ['dashboard', 'overview', 'path'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} style={{ padding: '8px 16px', background: activeTab === tab ? theme.accent : 'transparent', color: activeTab === tab ? 'white' : theme.text, border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, textTransform: 'capitalize' as const }}>{tab}</button>
          ))}
          <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text }}>{darkMode ? '☀️' : '🌙'}</button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* MOTIVATIONAL QUOTE */}
        {appMode === 'budget' && !budgetOnboarding.isActive && (
          <div style={{ background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', borderLeft: `4px solid ${theme.purple}` }}>
            <p style={{ color: theme.text, fontSize: '14px', fontStyle: 'italic', margin: 0 }}>"{currentQuote.quote}"</p>
            <p style={{ color: theme.textMuted, fontSize: '12px', margin: '8px 0 0 0', textAlign: 'right' as const }}>— {currentQuote.author}</p>
          </div>
        )}

        {/* UPCOMING PAYMENT ALERTS */}
        {appMode === 'budget' && alertsEnabled && !budgetOnboarding.isActive && (() => {
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

        {/* AI AGENT CARD */}
        <div style={{ background: `linear-gradient(135deg, ${appMode === 'budget' ? theme.success : theme.warning}15, ${theme.purple}15)`, border: `2px solid ${appMode === 'budget' ? theme.success : theme.warning}`, borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
          {proactiveInsight && !budgetOnboarding.isActive && !tradingOnboarding.isActive && (
            <div style={{ marginBottom: chatMessages.length > 0 ? '16px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: appMode === 'budget' ? theme.success : theme.warning, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{appMode === 'budget' ? '💰' : '📈'}</div>
                <div>
                  <div style={{ color: theme.text, fontWeight: 700, fontSize: '18px' }}>{proactiveInsight.greeting || `Hey${budgetMemory.name ? ' ' + budgetMemory.name : ''}!`}</div>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>Aureus • {appMode === 'budget' ? (currentBabyStep.title) : `${winRate.toFixed(0)}% win rate`}</div>
                </div>
              </div>
              <p style={{ color: theme.text, fontSize: '15px', lineHeight: 1.6, margin: '0 0 8px 0' }}>{proactiveInsight.insight || proactiveInsight.message || "Ready to help you today!"}</p>
              {proactiveInsight.suggestion && <p style={{ color: theme.purple, fontSize: '14px', margin: 0 }}>💡 {proactiveInsight.suggestion}</p>}
            </div>
          )}
          
          {chatMessages.length > 0 && (
            <div ref={chatContainerRef} style={{ maxHeight: '250px', overflowY: 'auto' as const, marginBottom: '16px', padding: '16px', background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', borderRadius: '12px' }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: '12px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '80%', padding: '12px 16px', borderRadius: '16px', background: msg.role === 'user' ? theme.accent : theme.cardBg, color: msg.role === 'user' ? 'white' : theme.text, fontSize: '14px', lineHeight: 1.5, whiteSpace: 'pre-wrap' as const }}>{msg.content}</div>
                </div>
              ))}
              {isLoading && <div style={{ display: 'flex', gap: '4px', padding: '12px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite' }} /><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.2s' }} /><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.textMuted, animation: 'pulse 1s infinite 0.4s' }} /></div>}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChatMessage()} placeholder={budgetOnboarding.isActive || tradingOnboarding.isActive ? "Type your response..." : "Ask Aureus anything..."} style={{ ...inputStyle, flex: 1 }} disabled={isLoading} />
            <button onClick={handleChatMessage} disabled={isLoading || !chatInput.trim()} style={{ ...btnPrimary, background: appMode === 'budget' ? theme.success : theme.warning, opacity: isLoading || !chatInput.trim() ? 0.5 : 1 }}>{isLoading ? '...' : 'Send'}</button>
          </div>
        </div>

        {/* BUDGET DASHBOARD TAB */}
        {appMode === 'budget' && activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            {/* This Month Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Income This Month</div><div style={{ color: theme.success, fontSize: '28px', fontWeight: 700 }}>${currentMonthTotals.incomeTotal.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Expenses</div><div style={{ color: theme.danger, fontSize: '28px', fontWeight: 700 }}>${currentMonthTotals.expenseTotal.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Debt Payments</div><div style={{ color: theme.warning, fontSize: '28px', fontWeight: 700 }}>${currentMonthTotals.debtTotal.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Goal Savings</div><div style={{ color: theme.purple, fontSize: '28px', fontWeight: 700 }}>${currentMonthTotals.goalTotal.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Net This Month</div><div style={{ color: currentMonthTotals.total >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 700 }}>${currentMonthTotals.total.toFixed(0)}</div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Income */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: theme.success, fontSize: '18px' }}>💰 Income</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="file" ref={payslipInputRef} accept="image/*,.pdf" onChange={handlePayslipUpload} style={{ display: 'none' }} />
                    <button onClick={() => payslipInputRef.current?.click()} style={{ padding: '4px 12px', background: theme.purple, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} disabled={payslipProcessing}>
                      {payslipProcessing ? '⏳' : '📄'} Payslip
                    </button>
                    <span style={{ color: theme.success, fontWeight: 700 }}>${monthlyIncome.toFixed(0)}/mo</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                  <input placeholder="Source" value={newIncome.name} onChange={e => setNewIncome({...newIncome, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '120px'}} />
                  <input placeholder="Amount" type="number" value={newIncome.amount} onChange={e => setNewIncome({...newIncome, amount: e.target.value})} style={{...inputStyle, width: '100px'}} />
                  <select value={newIncome.frequency} onChange={e => setNewIncome({...newIncome, frequency: e.target.value})} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
                  <select value={newIncome.type} onChange={e => setNewIncome({...newIncome, type: e.target.value})} style={inputStyle}><option value="active">Active</option><option value="passive">Passive</option></select>
                  <input type="date" value={newIncome.startDate} onChange={e => setNewIncome({...newIncome, startDate: e.target.value})} style={{...inputStyle, width: '130px'}} />
                  <button onClick={addIncome} style={btnSuccess}>+</button>
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' as const }}>
                  {incomeStreams.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No income yet</p> : incomeStreams.map(inc => (
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
                        <div><div style={{ color: theme.text, fontWeight: 600 }}>{inc.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{inc.frequency} • {inc.type} • {inc.startDate}</div></div>
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

              {/* Expenses */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: theme.danger, fontSize: '18px' }}>💸 Expenses</h3>
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
                        <div key={item.itemId} style={{ fontSize: '10px', padding: '2px 4px', marginBottom: '2px', background: item.itemType === 'income' ? '#d1fae5' : item.itemType === 'expense' ? '#dbeafe' : item.itemType === 'debt' ? '#fee2e2' : '#ede9fe', color: '#1e293b', borderRadius: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, opacity: item.isPaid ? 0.5 : 1 }}>{item.name}</div>
                      ))}
                      {items.length > 2 && <div style={{ fontSize: '10px', color: theme.accent, fontWeight: 600 }}>+{items.length - 2}</div>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Debts & Goals */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Debts with Payoff Calculator */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: theme.warning, fontSize: '18px' }}>💳 Debts</h3>
                  <span style={{ color: theme.warning, fontWeight: 700 }}>${totalDebtBalance.toFixed(0)}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                  <input placeholder="Debt name" value={newDebt.name} onChange={e => setNewDebt({...newDebt, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '100px'}} />
                  <input placeholder="Balance" type="number" value={newDebt.balance} onChange={e => setNewDebt({...newDebt, balance: e.target.value})} style={{...inputStyle, width: '90px'}} />
                  <input placeholder="APR %" type="number" value={newDebt.interestRate} onChange={e => setNewDebt({...newDebt, interestRate: e.target.value})} style={{...inputStyle, width: '70px'}} />
                  <input placeholder="Min payment" type="number" value={newDebt.minPayment} onChange={e => setNewDebt({...newDebt, minPayment: e.target.value})} style={{...inputStyle, width: '90px'}} />
                  <button onClick={addDebt} style={btnWarning}>+</button>
                </div>
                <div style={{ maxHeight: '350px', overflowY: 'auto' as const }}>
                  {debts.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No debts - debt free! 🎉</p> : debts.map(debt => {
                    const payoff = calculateSingleDebtPayoff(debt)
                    const progress = debt.originalBalance ? ((parseFloat(debt.originalBalance) - parseFloat(debt.balance)) / parseFloat(debt.originalBalance)) * 100 : 0
                    const extraPaymentData = debtExtraPayment[debt.id] || { amount: '', frequency: 'monthly' }
                    
                    return (
                      <div key={debt.id} style={{ padding: '16px', marginBottom: '12px', background: darkMode ? '#3a2e1e' : '#fefce8', borderRadius: '12px', border: '1px solid ' + theme.border }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div>
                            <div style={{ color: theme.text, fontWeight: 600, fontSize: '16px' }}>{debt.name}</div>
                            <div style={{ color: theme.textMuted, fontSize: '12px' }}>
                              {debt.interestRate}% APR • ${debt.minPayment}/{debt.frequency || 'mo'}
                              {payoff.extraPayments > 0 && <span style={{ color: theme.success }}> + ${payoff.extraPayments.toFixed(0)} extra</span>}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' as const }}>
                            <div style={{ color: theme.warning, fontWeight: 700, fontSize: '18px' }}>${parseFloat(debt.balance).toFixed(0)}</div>
                            <button onClick={() => deleteDebt(debt.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', marginTop: '4px' }}>Delete</button>
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
                <h3 style={{ margin: '0 0 16px 0', color: theme.purple, fontSize: '18px' }}>🎯 Goals</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                  <input placeholder="Goal name" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '100px'}} />
                  <input placeholder="Target $" type="number" value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: e.target.value})} style={{...inputStyle, width: '90px'}} />
                  <input placeholder="Already saved" type="number" value={newGoal.saved} onChange={e => setNewGoal({...newGoal, saved: e.target.value})} style={{...inputStyle, width: '90px'}} />
                  <input type="date" placeholder="Deadline" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} style={{...inputStyle, width: '130px'}} title="Deadline" />
                  <select value={newGoal.savingsFrequency} onChange={e => setNewGoal({...newGoal, savingsFrequency: e.target.value})} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                  <button onClick={addGoal} style={btnPurple}>+</button>
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto' as const }}>
                  {goals.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const }}>No goals yet</p> : goals.map(goal => {
                    const progress = (parseFloat(goal.saved || '0') / parseFloat(goal.target || '1')) * 100
                    const remaining = parseFloat(goal.target || '0') - parseFloat(goal.saved || '0')
                    // Calculate payment needed
                    const deadline = goal.deadline ? new Date(goal.deadline) : null
                    const now = new Date()
                    const monthsLeft = deadline ? Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30))) : 0
                    const weeksLeft = deadline ? Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7))) : 0
                    const fortnightsLeft = deadline ? Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 14))) : 0
                    let paymentNeeded = 0
                    if (deadline && remaining > 0) {
                      if (goal.savingsFrequency === 'weekly') paymentNeeded = remaining / weeksLeft
                      else if (goal.savingsFrequency === 'fortnightly') paymentNeeded = remaining / fortnightsLeft
                      else paymentNeeded = remaining / monthsLeft
                    }
                    
                    return editingItem?.type === 'goal' && editingItem.id === goal.id ? (
                      <div key={goal.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#2e1e3a' : '#faf5ff', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, marginBottom: '8px' }}>
                          <input value={editingItem.data.name} onChange={e => updateEditField('name', e.target.value)} placeholder="Name" style={{...inputStyle, flex: 1, minWidth: '100px'}} />
                          <input type="number" value={editingItem.data.target} onChange={e => updateEditField('target', e.target.value)} placeholder="Target" style={{...inputStyle, width: '80px'}} />
                          <input type="number" value={editingItem.data.saved} onChange={e => updateEditField('saved', e.target.value)} placeholder="Saved" style={{...inputStyle, width: '80px'}} />
                          <input type="date" value={editingItem.data.deadline} onChange={e => updateEditField('deadline', e.target.value)} style={{...inputStyle, width: '130px'}} />
                          <select value={editingItem.data.savingsFrequency} onChange={e => updateEditField('savingsFrequency', e.target.value)} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
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
                            {paymentNeeded > 0 && (
                              <div style={{ color: theme.purple, fontSize: '12px', fontWeight: 600 }}>
                                Save ${paymentNeeded.toFixed(0)}/{goal.savingsFrequency} to reach goal
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: theme.purple, fontWeight: 700 }}>{progress.toFixed(0)}%</span>
                            <button onClick={() => startEdit('goal', goal)} style={{ padding: '4px 8px', background: theme.accent, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                            <button onClick={() => addGoalToCalendar(goal)} style={{ padding: '4px 8px', background: theme.purple, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>📅</button>
                            <button onClick={() => deleteGoal(goal.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>×</button>
                          </div>
                        </div>
                        <div style={{ height: '8px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: theme.purple, borderRadius: '4px' }} /></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {appMode === 'budget' && activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Monthly Income</div><div style={{ color: theme.success, fontSize: '24px', fontWeight: 700 }}>${monthlyIncome.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>Active: ${activeIncome.toFixed(0)} | Passive: ${passiveIncome.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Monthly Outgoing</div><div style={{ color: theme.danger, fontSize: '24px', fontWeight: 700 }}>${totalOutgoing.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Monthly Surplus</div><div style={{ color: monthlySurplus >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>${monthlySurplus.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>{savingsRate.toFixed(0)}% savings rate</div></div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Net Worth</div><div style={{ color: netWorth >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 700 }}>${netWorth.toFixed(0)}</div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><h3 style={{ margin: 0, color: theme.success }}>📈 Assets</h3><span style={{ color: theme.success, fontWeight: 700 }}>${totalAssets.toFixed(0)}</span></div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input placeholder="Asset name" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} style={{...inputStyle, flex: 1}} />
                  <input placeholder="Value" type="number" value={newAsset.value} onChange={e => setNewAsset({...newAsset, value: e.target.value})} style={{...inputStyle, width: '100px'}} />
                  <select value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} style={inputStyle}><option value="savings">Savings</option><option value="investment">Investment</option><option value="property">Property</option><option value="other">Other</option></select>
                  <button onClick={addAsset} style={btnSuccess}>+</button>
                </div>
                {assets.map(a => (
                  <div key={a.id} style={{ padding: '12px', marginBottom: '8px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ color: theme.text, fontWeight: 600 }}>{a.name}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{a.type}</div></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: theme.success, fontWeight: 700 }}>${parseFloat(a.value).toFixed(0)}</span><button onClick={() => deleteAsset(a.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>×</button></div>
                  </div>
                ))}
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

        {/* PATH TAB */}
        {appMode === 'budget' && activeTab === 'path' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            
            {/* RAT RACE ESCAPE TRACKER */}
            <div style={{ padding: '32px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', border: '1px solid #334155' }}>
              <div style={{ textAlign: 'center' as const, marginBottom: '24px' }}>
                <div style={{ color: '#64748b', fontSize: '12px', letterSpacing: '2px', marginBottom: '8px' }}>RAT RACE ESCAPE TRACKER</div>
                <div style={{ fontSize: '64px', fontWeight: 'bold', color: monthlyExpenses > 0 ? (((passiveIncome + totalPassiveQuestIncome) / monthlyExpenses) >= 1 ? theme.success : '#f59e0b') : theme.textMuted }}>
                  {monthlyExpenses > 0 ? (((passiveIncome + totalPassiveQuestIncome) / monthlyExpenses) * 100).toFixed(1) : '0.0'}%
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{((passiveIncome + totalPassiveQuestIncome) / Math.max(monthlyExpenses, 1)) >= 1 ? '🎉' : '🐀'}</span>
                  <span style={{ color: ((passiveIncome + totalPassiveQuestIncome) / Math.max(monthlyExpenses, 1)) >= 1 ? theme.success : '#ef4444', fontSize: '16px' }}>
                    {((passiveIncome + totalPassiveQuestIncome) / Math.max(monthlyExpenses, 1)) >= 1 ? 'FINANCIALLY FREE!' : 'Still in the Rat Race'}
                  </span>
                </div>
              </div>
              
              {/* Progress Bar with Milestones */}
              <div style={{ position: 'relative' as const, marginBottom: '32px' }}>
                <div style={{ height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: Math.min(((passiveIncome + totalPassiveQuestIncome) / Math.max(monthlyExpenses, 1)) * 100, 100) + '%', 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #8b5cf6, #10b981)',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                {/* Milestones */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', position: 'relative' as const }}>
                  {[
                    { pct: 0, icon: '🌱', label: 'Start' },
                    { pct: 25, icon: '🌿', label: 'Seed Planted' },
                    { pct: 50, icon: '🌳', label: 'Growing' },
                    { pct: 75, icon: '⚡', label: 'Almost There' },
                    { pct: 100, icon: '💎', label: 'FREE!' }
                  ].map((m, i) => {
                    const reached = ((passiveIncome + totalPassiveQuestIncome) / Math.max(monthlyExpenses, 1)) * 100 >= m.pct
                    return (
                      <div key={i} style={{ textAlign: 'center' as const, flex: 1 }}>
                        <div style={{ fontSize: '20px', opacity: reached ? 1 : 0.4 }}>{m.icon}</div>
                        <div style={{ fontSize: '10px', color: reached ? theme.text : '#64748b', marginTop: '4px' }}>{m.label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '20px', background: '#334155', borderRadius: '12px', textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '8px' }}>Passive Income</div>
                  <div style={{ color: theme.success, fontSize: '28px', fontWeight: 'bold' }}>${(passiveIncome + totalPassiveQuestIncome).toFixed(0)}</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>/month</div>
                </div>
                <div style={{ padding: '20px', background: '#334155', borderRadius: '12px', textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '8px' }}>Total Outgoing</div>
                  <div style={{ color: theme.danger, fontSize: '28px', fontWeight: 'bold' }}>${monthlyExpenses.toFixed(0)}</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>/month</div>
                </div>
                <div style={{ padding: '20px', background: '#334155', borderRadius: '12px', textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '8px' }}>Money Works 24/7</div>
                  <div style={{ color: theme.purple, fontSize: '28px', fontWeight: 'bold' }}>${((passiveIncome + totalPassiveQuestIncome) / 720).toFixed(2)}</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>/hour while you sleep</div>
                </div>
                <div style={{ padding: '20px', background: '#334155', borderRadius: '12px', textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '8px' }}>Gap to Freedom</div>
                  <div style={{ color: (passiveIncome + totalPassiveQuestIncome) >= monthlyExpenses ? theme.success : theme.warning, fontSize: '28px', fontWeight: 'bold' }}>
                    ${Math.max(0, monthlyExpenses - passiveIncome - totalPassiveQuestIncome).toFixed(0)}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>{(passiveIncome + totalPassiveQuestIncome) >= monthlyExpenses ? 'COVERED! 🎉' : 'still needed'}</div>
                </div>
              </div>
              
              {/* Next Milestone */}
              {(() => {
                const coverage = ((passiveIncome + totalPassiveQuestIncome) / Math.max(monthlyExpenses, 1)) * 100
                const nextMilestone = coverage < 25 ? { pct: 25, icon: '🌱', name: 'Seed Planted' } 
                  : coverage < 50 ? { pct: 50, icon: '🌳', name: 'Growing' }
                  : coverage < 75 ? { pct: 75, icon: '⚡', name: 'Almost There' }
                  : coverage < 100 ? { pct: 100, icon: '💎', name: 'Financial Freedom' }
                  : null
                if (!nextMilestone) return null
                const needed = (nextMilestone.pct / 100) * monthlyExpenses - (passiveIncome + totalPassiveQuestIncome)
                return (
                  <div style={{ padding: '16px', background: 'linear-gradient(90deg, #8b5cf620, #10b98120)', borderRadius: '12px', textAlign: 'center' as const }}>
                    <span style={{ color: '#64748b' }}>Next: </span>
                    <span style={{ fontSize: '16px' }}>{nextMilestone.icon}</span>
                    <span style={{ color: theme.purple, fontWeight: 600 }}> {nextMilestone.name}</span>
                    <span style={{ color: '#64748b' }}> — need ${needed.toFixed(0)} more passive income</span>
                  </div>
                )
              })()}
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
                {/* Employee */}
                <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ fontSize: '28px' }}>👔</div>
                    <div style={{ textAlign: 'right' as const }}>
                      <div style={{ color: theme.text, fontSize: '24px', fontWeight: 700 }}>${incomeStreams.filter(i => i.type === 'active').reduce((sum, i) => sum + convertToMonthly(parseFloat(i.amount || '0'), i.frequency), 0).toFixed(0)}</div>
                      <div style={{ color: theme.textMuted, fontSize: '12px' }}>{monthlyIncome > 0 ? ((incomeStreams.filter(i => i.type === 'active').reduce((sum, i) => sum + convertToMonthly(parseFloat(i.amount || '0'), i.frequency), 0) / monthlyIncome) * 100).toFixed(0) : 0}%</div>
                    </div>
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: '24px', fontWeight: 300, marginBottom: '4px' }}>E</div>
                  <div style={{ color: theme.text, fontWeight: 600 }}>Employee</div>
                  <div style={{ color: theme.textMuted, fontSize: '13px' }}>You work for money</div>
                </div>
                
                {/* Business Owner */}
                <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ fontSize: '28px' }}>🏢</div>
                    <div style={{ textAlign: 'right' as const }}>
                      <div style={{ color: theme.text, fontSize: '24px', fontWeight: 700 }}>$0</div>
                      <div style={{ color: theme.textMuted, fontSize: '12px' }}>0%</div>
                    </div>
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: '24px', fontWeight: 300, marginBottom: '4px' }}>B</div>
                  <div style={{ color: theme.text, fontWeight: 600 }}>Business Owner</div>
                  <div style={{ color: theme.textMuted, fontSize: '13px' }}>Systems work for you</div>
                </div>
                
                {/* Self-Employed */}
                <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ fontSize: '28px' }}>🔧</div>
                    <div style={{ textAlign: 'right' as const }}>
                      <div style={{ color: theme.text, fontSize: '24px', fontWeight: 700 }}>$0</div>
                      <div style={{ color: theme.textMuted, fontSize: '12px' }}>0%</div>
                    </div>
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: '24px', fontWeight: 300, marginBottom: '4px' }}>S</div>
                  <div style={{ color: theme.text, fontWeight: 600 }}>Self-Employed</div>
                  <div style={{ color: theme.textMuted, fontSize: '13px' }}>You own a job</div>
                </div>
                
                {/* Investor */}
                <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ fontSize: '28px' }}>📈</div>
                    <div style={{ textAlign: 'right' as const }}>
                      <div style={{ color: theme.text, fontSize: '24px', fontWeight: 700 }}>${(passiveIncome + totalPassiveQuestIncome).toFixed(0)}</div>
                      <div style={{ color: theme.textMuted, fontSize: '12px' }}>{monthlyIncome > 0 ? (((passiveIncome + totalPassiveQuestIncome) / monthlyIncome) * 100).toFixed(0) : 0}%</div>
                    </div>
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: '24px', fontWeight: 300, marginBottom: '4px' }}>I</div>
                  <div style={{ color: theme.text, fontWeight: 600 }}>Investor</div>
                  <div style={{ color: theme.textMuted, fontSize: '13px' }}>Money works for you</div>
                </div>
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

            {/* Passive Income Quest Board - Professional Design */}
            <div style={{ padding: '24px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '16px', border: '1px solid ' + theme.border }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '24px' }}>💰</span>
                    <h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>Passive Income Quest Board</h2>
                  </div>
                  <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>10 paths to $5K/month — unlock by adding income streams</p>
                </div>
                <div style={{ padding: '8px 16px', background: theme.warning + '20', borderRadius: '8px', border: '1px solid ' + theme.warning }}>
                  <span style={{ color: theme.warning, fontWeight: 700, fontSize: '18px' }}>{passiveQuests.filter(q => q.status !== 'locked').length}/{passiveQuests.length}</span>
                  <div style={{ color: theme.warning, fontSize: '11px' }}>UNLOCKED</div>
                </div>
              </div>
              
              {/* All Quests in Professional 2-column Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {passiveQuests.map(quest => {
                  const isLocked = quest.status === 'locked'
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
                      <div style={{ display: 'flex', gap: '8px', margin: '12px 0', marginLeft: '56px' }}>
                        <span style={{ padding: '3px 8px', background: theme.success + '20', color: theme.success, borderRadius: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          💰 {quest.potentialIncome}
                        </span>
                        <span style={{ padding: '3px 8px', background: darkMode ? '#334155' : '#e2e8f0', color: theme.textMuted, borderRadius: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ⏱ {quest.timeToSetup}
                        </span>
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
                          <span style={{ color: theme.warning, fontSize: '12px' }}>🔐 {quest.unlockRequirement}</span>
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
                          
                          {quest.status === 'not_started' && (
                            <button onClick={() => {
                              setPassiveQuests(passiveQuests.map(q => q.id === quest.id ? { ...q, status: 'in_progress', currentStep: 0, progress: 0 } : q))
                            }} style={{ marginTop: '16px', padding: '10px 20px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, width: '100%' }}>
                              🚀 Start This Quest
                            </button>
                          )}
                          
                          {quest.status === 'in_progress' && (
                            <button onClick={() => {
                              const newStep = (quest.currentStep || 0) + 1
                              const newProgress = (newStep / (quest.steps?.length || 4)) * 100
                              setPassiveQuests(passiveQuests.map(q => q.id === quest.id ? { ...q, currentStep: newStep, progress: newProgress, status: newProgress >= 100 ? 'completed' : 'in_progress' } : q))
                            }} style={{ marginTop: '16px', padding: '10px 20px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, width: '100%' }}>
                              ✓ Complete Current Step
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
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
                  return (
                    <div key={item.step} onClick={() => setSelectedBabyStep(item.step)} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', background: done ? (darkMode ? '#1e3a32' : '#f0fdf4') : isCurrent ? (darkMode ? '#2e2a1e' : '#fefce8') : (darkMode ? '#334155' : '#f8fafc'), borderRadius: '12px', border: done ? '2px solid ' + theme.success : isCurrent ? '2px solid ' + theme.warning : '1px solid ' + theme.border, cursor: 'pointer', transition: 'transform 0.2s' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: done ? theme.success : isCurrent ? theme.warning : theme.purple, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>{done ? '✓' : item.icon}</div>
                      <div style={{ flex: 1 }}>
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
                        <div style={{ color: theme.accent, fontSize: '12px' }}>Click for details →</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* TRADING TAB */}
        {appMode === 'trading' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            
            {/* TILT DETECTOR & DAILY STATUS */}
            {(() => {
              const tilt = detectTilt()
              return (
                <div style={{ 
                  padding: '20px', 
                  background: tilt.tiltScore > 50 ? 'linear-gradient(135deg, #ef444430, #f59e0b30)' : 'linear-gradient(135deg, #10b98130, #3b82f630)', 
                  borderRadius: '16px', 
                  border: '2px solid ' + (tilt.tiltScore > 50 ? theme.danger : theme.success) 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '32px' }}>{tilt.tiltScore > 70 ? '🚨' : tilt.tiltScore > 40 ? '⚠️' : '✅'}</div>
                      <div>
                        <div style={{ color: theme.text, fontWeight: 700, fontSize: '18px' }}>
                          {tilt.tiltScore > 70 ? 'HIGH TILT RISK - STEP AWAY!' : tilt.tiltScore > 40 ? 'Caution - Monitor Yourself' : 'Clear to Trade'}
                        </div>
                        <div style={{ color: theme.textMuted, fontSize: '13px' }}>
                          {tilt.todaysTrades} trades today • {tilt.todaysLosses} losses
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' as const }}>
                      <div style={{ color: theme.textMuted, fontSize: '11px' }}>TILT SCORE</div>
                      <div style={{ 
                        color: tilt.tiltScore > 70 ? theme.danger : tilt.tiltScore > 40 ? theme.warning : theme.success, 
                        fontSize: '28px', 
                        fontWeight: 700 
                      }}>{tilt.tiltScore}%</div>
                    </div>
                  </div>
                  
                  {tilt.warnings.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px' }}>
                      {tilt.warnings.map((warning, i) => (
                        <div key={i} style={{ padding: '8px 12px', background: theme.warning + '20', borderRadius: '6px', color: theme.warning, fontSize: '13px' }}>
                          {warning}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}
            
            {/* MAIN STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Total P&L</div>
                <div style={{ color: totalPL >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 700 }}>${totalPL.toFixed(0)}</div>
              </div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Win Rate</div>
                <div style={{ color: winRate >= 50 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 700 }}>{winRate.toFixed(1)}%</div>
              </div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Avg Win</div>
                <div style={{ color: theme.success, fontSize: '28px', fontWeight: 700 }}>${avgWin.toFixed(0)}</div>
              </div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Avg Loss</div>
                <div style={{ color: theme.danger, fontSize: '28px', fontWeight: 700 }}>${avgLoss.toFixed(0)}</div>
              </div>
              <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const }}>
                <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Profit Factor</div>
                <div style={{ color: avgLoss > 0 ? (avgWin / avgLoss >= 1 ? theme.success : theme.danger) : theme.textMuted, fontSize: '28px', fontWeight: 700 }}>
                  {avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : '-'}
                </div>
              </div>
            </div>

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
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Account Name</label>
                      <input value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} placeholder="My FTMO 100k" style={{...inputStyle, width: '100%'}} />
                    </div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Type</label>
                      <select value={newAccount.type} onChange={e => setNewAccount({...newAccount, type: e.target.value})} style={{...inputStyle, width: '100%'}}>
                        <option value="personal">Personal</option>
                        <option value="prop_challenge">Prop Challenge</option>
                        <option value="prop_funded">Prop Funded</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Prop Firm</label>
                      <select value={newAccount.propFirm} onChange={e => {
                        const firm = propFirmProfiles[e.target.value]
                        setNewAccount({
                          ...newAccount, 
                          propFirm: e.target.value,
                          maxDrawdown: firm?.phases?.challenge?.maxDrawdown?.toString() || '',
                          dailyDrawdown: firm?.phases?.challenge?.dailyDrawdown?.toString() || '',
                          profitTarget: firm?.phases?.challenge?.profitTarget?.toString() || ''
                        })
                      }} style={{...inputStyle, width: '100%'}}>
                        <option value="">Select...</option>
                        {Object.keys(propFirmProfiles).map(firm => (
                          <option key={firm} value={firm}>{firm}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>Starting Balance</label>
                      <input type="number" value={newAccount.startingBalance} onChange={e => setNewAccount({...newAccount, startingBalance: e.target.value, currentBalance: e.target.value})} placeholder="100000" style={{...inputStyle, width: '100%'}} />
                    </div>
                  </div>
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
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => {
                      if (newAccount.name && newAccount.startingBalance) {
                        setTradingAccounts([...tradingAccounts, { ...newAccount, id: Date.now(), currentBalance: newAccount.startingBalance }])
                        setNewAccount({ name: '', type: 'personal', propFirm: '', phase: '', startingBalance: '', currentBalance: '', maxDrawdown: '', dailyDrawdown: '', profitTarget: '', riskPerTrade: '1', isActive: true })
                        setShowAddAccount(false)
                      }
                    }} style={btnSuccess}>Add Account</button>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
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
                    
                    return (
                      <div key={account.id} style={{ 
                        padding: '20px', 
                        background: darkMode ? '#1e293b' : '#f8fafc', 
                        borderRadius: '12px',
                        border: '2px solid ' + (account.type === 'personal' ? theme.purple : account.type === 'prop_funded' ? theme.success : theme.warning)
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '20px' }}>{account.type === 'personal' ? '👤' : account.type === 'prop_funded' ? '🏆' : '🎯'}</span>
                              <span style={{ fontWeight: 600, color: theme.text }}>{account.name}</span>
                            </div>
                            <div style={{ fontSize: '12px', color: theme.textMuted }}>
                              {account.propFirm || 'Personal Account'} {account.type === 'prop_challenge' ? '• Challenge' : account.type === 'prop_funded' ? '• Funded' : ''}
                            </div>
                          </div>
                          <div style={{ 
                            padding: '4px 10px', 
                            background: pnl >= 0 ? theme.success + '20' : theme.danger + '20', 
                            color: pnl >= 0 ? theme.success : theme.danger,
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}>
                            {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                          </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                          <div>
                            <div style={{ color: theme.textMuted, fontSize: '11px' }}>Balance</div>
                            <div style={{ color: theme.text, fontSize: '20px', fontWeight: 700 }}>${currBal.toLocaleString()}</div>
                          </div>
                          <div>
                            <div style={{ color: theme.textMuted, fontSize: '11px' }}>P&L</div>
                            <div style={{ color: pnl >= 0 ? theme.success : theme.danger, fontSize: '20px', fontWeight: 700 }}>${pnl.toFixed(0)}</div>
                          </div>
                        </div>
                        
                        {account.type !== 'personal' && (
                          <>
                            {/* Progress to Target */}
                            {profitTarget > 0 && (
                              <div style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                                  <span style={{ color: theme.textMuted }}>Target: {profitTarget}%</span>
                                  <span style={{ color: theme.success }}>{progressToTarget.toFixed(1)}%</span>
                                </div>
                                <div style={{ height: '6px', background: theme.border, borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{ width: progressToTarget + '%', height: '100%', background: theme.success }} />
                                </div>
                              </div>
                            )}
                            
                            {/* Drawdown Warning */}
                            <div style={{ 
                              padding: '8px 12px', 
                              background: drawdownRemaining < maxDD * 0.3 ? theme.danger + '20' : theme.warning + '20', 
                              borderRadius: '6px',
                              display: 'flex',
                              justifyContent: 'space-between'
                            }}>
                              <span style={{ color: theme.textMuted, fontSize: '12px' }}>Drawdown Remaining</span>
                              <span style={{ color: drawdownRemaining < maxDD * 0.3 ? theme.danger : theme.warning, fontWeight: 600, fontSize: '12px' }}>
                                {drawdownRemaining.toFixed(2)}% (${(startBal * drawdownRemaining / 100).toFixed(0)})
                              </span>
                            </div>
                          </>
                        )}
                        
                        {account.type === 'personal' && (
                          <div style={{ 
                            padding: '8px 12px', 
                            background: theme.purple + '20', 
                            borderRadius: '6px',
                            textAlign: 'center' as const
                          }}>
                            <span style={{ color: theme.purple, fontSize: '12px' }}>💡 Compound your profits for faster growth!</span>
                          </div>
                        )}
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
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Starting Capital</label><input type="number" value={tradingCalculator.startingCapital} onChange={e => setTradingCalculator({...tradingCalculator, startingCapital: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Monthly Add</label><input type="number" value={tradingCalculator.monthlyContribution} onChange={e => setTradingCalculator({...tradingCalculator, monthlyContribution: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Daily Return %</label><input type="number" step="0.1" value={tradingCalculator.returnRate} onChange={e => setTradingCalculator({...tradingCalculator, returnRate: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Months</label><input type="number" value={tradingCalculator.months} onChange={e => setTradingCalculator({...tradingCalculator, months: e.target.value})} style={{...inputStyle, width: '100%'}} /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '12px' }}>Trading Days/Mo</label><input type="number" value="20" style={{...inputStyle, width: '100%'}} disabled /></div>
              </div>
              
              {(() => {
                const result = calculateCompounding(
                  parseFloat(tradingCalculator.startingCapital) || 0,
                  parseFloat(tradingCalculator.monthlyContribution) || 0,
                  parseFloat(tradingCalculator.returnRate) || 0,
                  20, // trading days per month
                  parseInt(tradingCalculator.months) || 0
                )
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Future Balance</div>
                      <div style={{ color: theme.success, fontSize: '32px', fontWeight: 700 }}>${result.finalBalance.toLocaleString()}</div>
                    </div>
                    <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Total Deposited</div>
                      <div style={{ color: theme.purple, fontSize: '32px', fontWeight: 700 }}>${((parseFloat(tradingCalculator.startingCapital) || 0) + ((parseFloat(tradingCalculator.monthlyContribution) || 0) * (parseInt(tradingCalculator.months) || 0))).toLocaleString()}</div>
                    </div>
                    <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Pure Profit</div>
                      <div style={{ color: theme.warning, fontSize: '32px', fontWeight: 700 }}>${result.totalGain.toLocaleString()}</div>
                    </div>
                  </div>
                )
              })()}
              
              <div style={{ marginTop: '16px', padding: '12px', background: theme.success + '20', borderRadius: '8px' }}>
                <p style={{ color: theme.success, margin: 0, fontSize: '13px' }}>
                  💡 <strong>Aureus says:</strong> Even 0.5% daily compounded over 12 months turns $10,000 into over $30,000. Consistency beats big wins!
                </p>
              </div>
            </div>

            {/* TRADE JOURNAL */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '20px' }}>📓 Trade Journal</h2>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' as const }}>
                <input type="date" value={newTrade.date} onChange={e => setNewTrade({...newTrade, date: e.target.value})} style={inputStyle} />
                <input placeholder="Instrument" value={newTrade.instrument} onChange={e => setNewTrade({...newTrade, instrument: e.target.value})} style={{...inputStyle, width: '120px'}} />
                <select value={newTrade.direction} onChange={e => setNewTrade({...newTrade, direction: e.target.value})} style={inputStyle}><option value="long">Long</option><option value="short">Short</option></select>
                <input placeholder="Entry" type="number" value={newTrade.entryPrice} onChange={e => setNewTrade({...newTrade, entryPrice: e.target.value})} style={{...inputStyle, width: '90px'}} />
                <input placeholder="Exit" type="number" value={newTrade.exitPrice} onChange={e => setNewTrade({...newTrade, exitPrice: e.target.value})} style={{...inputStyle, width: '90px'}} />
                <input placeholder="P&L" type="number" value={newTrade.profitLoss} onChange={e => setNewTrade({...newTrade, profitLoss: e.target.value})} style={{...inputStyle, width: '90px'}} />
                <input placeholder="Notes" value={newTrade.notes} onChange={e => setNewTrade({...newTrade, notes: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '150px'}} />
                <button onClick={addTrade} style={btnPrimary}>+ Add</button>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' as const }}>
                {trades.length === 0 ? <p style={{ color: theme.textMuted, textAlign: 'center' as const, padding: '40px' }}>No trades yet. Start journaling!</p> : trades.map(trade => (
                  <div key={trade.id} style={{ padding: '12px', marginBottom: '8px', background: parseFloat(trade.profitLoss || '0') >= 0 ? (darkMode ? '#1e3a32' : '#f0fdf4') : (darkMode ? '#3a1e1e' : '#fef2f2'), borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <span style={{ color: theme.textMuted, fontSize: '13px' }}>{trade.date}</span>
                      <span style={{ color: theme.text, fontWeight: 600 }}>{trade.instrument}</span>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: trade.direction === 'long' ? theme.success + '20' : theme.danger + '20', color: trade.direction === 'long' ? theme.success : theme.danger }}>{trade.direction.toUpperCase()}</span>
                      {trade.notes && <span style={{ color: theme.textMuted, fontSize: '12px' }}>"{trade.notes}"</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: parseFloat(trade.profitLoss || '0') >= 0 ? theme.success : theme.danger, fontSize: '18px', fontWeight: 700 }}>{parseFloat(trade.profitLoss || '0') >= 0 ? '+' : ''}${parseFloat(trade.profitLoss || '0').toFixed(2)}</span>
                      <button onClick={() => deleteTrade(trade.id)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
