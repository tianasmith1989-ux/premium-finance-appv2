'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useRef, useEffect } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  const [appMode, setAppMode] = useState<'budget' | 'trading' | null>(null)
  const [showModeSelector, setShowModeSelector] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'path' | 'trading' | 'tradingAnalytics' | 'guide'>('dashboard')
  const [darkMode, setDarkMode] = useState(true)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [tradingCalendarMonth, setTradingCalendarMonth] = useState(new Date())
  
  const [incomeStreams, setIncomeStreams] = useState<any[]>([])
  const [newIncome, setNewIncome] = useState({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0], isGross: false })
  const [showIncomePresets, setShowIncomePresets] = useState(false)
  const [tradingPayoutsAsIncome, setTradingPayoutsAsIncome] = useState(false)
  const [payslipData, setPayslipData] = useState<{gross:number,net:number,super_:number,tax:number,leave:{annual:number,sick:number,long_service:number}}|null>(null)
  const incomePresets = [
    { name: 'Salary/Wages', amount: '', frequency: 'fortnightly', type: 'active', category: 'employment' },
    { name: 'Freelance Income', amount: '', frequency: 'monthly', type: 'active', category: 'self-employed' },
    { name: 'Side Hustle', amount: '', frequency: 'weekly', type: 'active', category: 'self-employed' },
    { name: 'Overtime Pay', amount: '', frequency: 'fortnightly', type: 'active', category: 'employment' },
    { name: 'Commission', amount: '', frequency: 'monthly', type: 'active', category: 'employment' },
    { name: 'Centrelink Payment', amount: '', frequency: 'fortnightly', type: 'active', category: 'government' },
    { name: 'Child Support Received', amount: '', frequency: 'monthly', type: 'active', category: 'government' },
    { name: 'Dividend Income', amount: '', frequency: 'quarterly', type: 'passive', category: 'investing' },
    { name: 'ETF Distributions (VAS/VHY)', amount: '', frequency: 'quarterly', type: 'passive', category: 'investing' },
    { name: 'Rental Property Income', amount: '', frequency: 'monthly', type: 'passive', category: 'property' },
    { name: 'REIT Distributions', amount: '', frequency: 'quarterly', type: 'passive', category: 'investing' },
    { name: 'Interest Income (HISA)', amount: '', frequency: 'monthly', type: 'passive', category: 'savings' },
    { name: 'Term Deposit Interest', amount: '', frequency: 'quarterly', type: 'passive', category: 'savings' },
    { name: 'Royalties / IP Income', amount: '', frequency: 'monthly', type: 'passive', category: 'business' },
    { name: 'Digital Product Sales', amount: '', frequency: 'monthly', type: 'passive', category: 'business' },
    { name: 'Affiliate Commissions', amount: '', frequency: 'monthly', type: 'passive', category: 'business' },
    { name: 'YouTube / Content Revenue', amount: '', frequency: 'monthly', type: 'passive', category: 'content' },
    { name: 'P2P Lending Returns', amount: '', frequency: 'monthly', type: 'passive', category: 'investing' },
    { name: 'Crypto Staking Rewards', amount: '', frequency: 'weekly', type: 'passive', category: 'investing' },
    { name: 'Business Distributions', amount: '', frequency: 'monthly', type: 'passive', category: 'business' },
    { name: 'Print-on-Demand Income', amount: '', frequency: 'monthly', type: 'passive', category: 'business' },
    { name: 'Dropshipping Revenue', amount: '', frequency: 'monthly', type: 'passive', category: 'business' },
    { name: 'Vending Machine Income', amount: '', frequency: 'monthly', type: 'passive', category: 'business' },
    { name: 'Trading Payouts', amount: '', frequency: 'monthly', type: 'passive', category: 'trading' },
  ]
  const [pendingPreset, setPendingPreset] = useState<any>(null)
  const [presetForm, setPresetForm] = useState({ amount: '', frequency: 'monthly', isGross: false, startDate: new Date().toISOString().split('T')[0] })
  const addIncomePreset = (preset: any) => {
    setPendingPreset(preset)
    setPresetForm({ amount: '', frequency: preset.frequency, isGross: false, startDate: new Date().toISOString().split('T')[0] })
  }
  const confirmIncomePreset = () => {
    if (!pendingPreset || !presetForm.amount || parseFloat(presetForm.amount) <= 0) return
    let finalAmount = presetForm.amount
    if (presetForm.isGross) {
      const annualGross = convertToMonthly(parseFloat(presetForm.amount), presetForm.frequency) * 12
      const tax = estimateAUTax(annualGross)
      const netRatio = annualGross > 0 ? tax.net / annualGross : 1
      finalAmount = String(Math.round(parseFloat(presetForm.amount) * netRatio * 100) / 100)
    }
    setIncomeStreams(prev => [...prev, { id: Date.now(), name: pendingPreset.name, amount: finalAmount, frequency: presetForm.frequency, type: pendingPreset.type, startDate: presetForm.startDate || new Date().toISOString().split('T')[0] }])
    awardXP(15)
    setPendingPreset(null)
  }
  const [showTaxEstimator, setShowTaxEstimator] = useState(false)
  const estimateAUTax = (gross: number): { tax: number, medicare: number, net: number, effectiveRate: number, super_: number } => {
    let tax = 0
    if (gross <= 18200) tax = 0
    else if (gross <= 45000) tax = (gross - 18200) * 0.16
    else if (gross <= 135000) tax = 4288 + (gross - 45000) * 0.30
    else if (gross <= 190000) tax = 31288 + (gross - 135000) * 0.37
    else tax = 51638 + (gross - 190000) * 0.45
    const medicare = gross * 0.02
    const super_ = gross * 0.115
    const net = gross - tax - medicare
    const effectiveRate = gross > 0 ? ((tax + medicare) / gross) * 100 : 0
    return { tax, medicare, net, effectiveRate, super_ }
  }
  const handlePayslipCsv = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').map(l => l.split(','))
      let gross = 0, net = 0, superAmt = 0, tax = 0, annual = 0, sick = 0, lsl = 0
      lines.forEach(cols => {
        const label = (cols[0] || '').toLowerCase().trim()
        const val = parseFloat((cols[1] || '').replace(/[^0-9.-]/g, '')) || 0
        if (label.includes('gross')) gross = val
        else if (label.includes('net') || label.includes('take home')) net = val
        else if (label.includes('super')) superAmt = val
        else if (label.includes('tax') || label.includes('payg')) tax = val
        else if (label.includes('annual leave') || label.includes('holiday')) annual = val
        else if (label.includes('sick') || label.includes('personal')) sick = val
        else if (label.includes('long service') || label.includes('lsl')) lsl = val
      })
      if (net > 0 || gross > 0) {
        setPayslipData({ gross, net, super_: superAmt, tax, leave: { annual, sick, long_service: lsl } })
        if (net > 0) {
          const exists = incomeStreams.some(i => i.name === 'Salary (from payslip)')
          if (!exists) setIncomeStreams(prev => [...prev, { id: Date.now(), name: 'Salary (from payslip)', amount: String(net), frequency: 'fortnightly', type: 'active' }])
        }
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }
  
  const [expenses, setExpenses] = useState<any[]>([])
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', frequency: 'monthly', category: 'other', dueDate: new Date().toISOString().split('T')[0] })
  
  const [debts, setDebts] = useState<any[]>([])
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: new Date().toISOString().split('T')[0] })
  const [payoffMethod, setPayoffMethod] = useState<'snowball' | 'avalanche'>('avalanche')
  
  const [goals, setGoals] = useState<any[]>([])
  const [newGoal, setNewGoal] = useState({ name: '', target: '', saved: '0', deadline: '', savingsFrequency: 'monthly', startDate: new Date().toISOString().split('T')[0], paymentAmount: '' })
  const [extraGoalPayment, setExtraGoalPayment] = useState('')
  const [selectedGoalForExtra, setSelectedGoalForExtra] = useState<number | null>(null)
  
  const [paidOccurrences, setPaidOccurrences] = useState<Set<string>>(new Set())
  
  const [assets, setAssets] = useState<any[]>([])
  const [newAsset, setNewAsset] = useState({ name: '', value: '', type: 'savings' })
  const [showAssetPresets, setShowAssetPresets] = useState(false)
  const [expandedStep, setExpandedStep] = useState<number|null>(null)
  const [showHomeBuyingGuide, setShowHomeBuyingGuide] = useState(false)
  const createGoalFromStep = (name: string, target: string, frequency: string = 'monthly', suggestedPayment?: string) => {
    const exists = goals.find(g => g.name === name)
    if (exists) { alert(name + ' already exists in your goals!'); return }
    const defaultPay = suggestedPayment || ''
    const paymentAmount = prompt('How much can you save per ' + frequency + ' towards "' + name + '"?\n\nTarget: $' + parseFloat(target).toLocaleString() + (defaultPay ? '\nSuggested: $' + defaultPay + '/' + frequency : ''), defaultPay)
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return
    const goalId = Date.now()
    const startDate = new Date().toISOString().split('T')[0]
    const newGoalItem = { id: goalId, name, target, saved: '0', deadline: '', savingsFrequency: frequency, startDate, paymentAmount }
    setGoals(prev => [...prev, newGoalItem])
    // Create a regular expense (no targetGoalId) so it shows in budget totals
    const expenseId = goalId + 1
    setExpenses(prev => [...prev, { id: expenseId, name: '🎯 ' + name, amount: paymentAmount, frequency, category: 'savings', dueDate: startDate }])
    awardXP(25); triggerConfetti()
    alert(name + ' created!\n\n✅ Goal: $' + parseFloat(target).toLocaleString() + ' target\n✅ Payment: $' + paymentAmount + ' per ' + frequency + '\n✅ Added to calendar automatically\n✅ Added to expenses for budget tracking\n\nMark payments as PAY on the calendar!')
  }
  const [showLiabilityPresets, setShowLiabilityPresets] = useState(false)
  const assetPresets = [
    { name: 'Emergency Fund', type: 'savings' }, { name: 'Savings Account', type: 'savings' },
    { name: 'Term Deposit', type: 'savings' }, { name: 'Offset Account', type: 'savings' },
    { name: 'Share Portfolio', type: 'investment' }, { name: 'ETF Portfolio (VAS/VGS)', type: 'investment' },
    { name: 'Super Balance', type: 'investment' }, { name: 'Managed Fund', type: 'investment' },
    { name: 'Crypto Holdings', type: 'crypto' }, { name: 'Investment Property', type: 'property' },
    { name: 'Home (Owner-Occupied)', type: 'property' }, { name: 'Vehicle (if appreciating)', type: 'other' },
    { name: 'Business Equity', type: 'business' }, { name: 'Gold/Precious Metals', type: 'other' },
    { name: 'Collectibles/Art', type: 'other' }, { name: 'Domain Names / IP', type: 'business' },
  ]
  const liabilityPresets = [
    { name: 'Home Loan / Mortgage', type: 'mortgage' }, { name: 'Investment Property Loan', type: 'mortgage' },
    { name: 'Car Loan', type: 'loan' }, { name: 'Personal Loan', type: 'loan' },
    { name: 'Credit Card', type: 'credit' }, { name: 'Afterpay / BNPL', type: 'credit' },
    { name: 'HECS-HELP Debt', type: 'loan' }, { name: 'Student Loan', type: 'loan' },
    { name: 'Tax Debt (ATO)', type: 'loan' }, { name: 'Family Loan', type: 'loan' },
    { name: 'Business Loan', type: 'loan' }, { name: 'Margin Loan', type: 'loan' },
  ]
  const addAssetPreset = (preset: any) => {
    const amount = prompt('Enter value for ' + preset.name + ':')
    if (amount && parseFloat(amount) > 0) { setAssets(prev => [...prev, { id: Date.now(), name: preset.name, value: amount, type: preset.type }]) }
  }
  const addLiabilityPreset = (preset: any) => {
    const amount = prompt('Enter amount owed for ' + preset.name + ':')
    if (amount && parseFloat(amount) > 0) { setLiabilities(prev => [...prev, { id: Date.now(), name: preset.name, value: amount, type: preset.type }]) }
  }
  const [liabilities, setLiabilities] = useState<any[]>([])
  const [newLiability, setNewLiability] = useState({ name: '', value: '', type: 'loan' })
  
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [chatInput, setChatInput] = useState('')
  const [isAskingCoach, setIsAskingCoach] = useState(false)
  
  const [trades, setTrades] = useState<any[]>([])
  const [newTrade, setNewTrade] = useState({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '', linkedAccount: '' })

  const [expandedDay, setExpandedDay] = useState<{day: number, items: any[]} | null>(null)
  
  const [debtExtraPayment, setDebtExtraPayment] = useState<{[key: number]: {amount: string, frequency: string}}>({})
  const [showExtraInput, setShowExtraInput] = useState<number | null>(null)

  const [showPresets, setShowPresets] = useState(false)
  const [presetFrequencyOverrides, setPresetFrequencyOverrides] = useState<{[key: string]: string}>({})
  const presetBills = [
    { name: 'Rent/Mortgage', amount: '', category: 'housing', frequency: 'monthly' },
    { name: 'Electricity', amount: '', category: 'utilities', frequency: 'monthly' },
    { name: 'Gas', amount: '', category: 'utilities', frequency: 'monthly' },
    { name: 'Water', amount: '', category: 'utilities', frequency: 'quarterly' },
    { name: 'Internet', amount: '', category: 'utilities', frequency: 'monthly' },
    { name: 'Phone', amount: '', category: 'utilities', frequency: 'monthly' },
    { name: 'Car Insurance', amount: '', category: 'transport', frequency: 'monthly' },
    { name: 'Health Insurance', amount: '', category: 'health', frequency: 'monthly' },
    { name: 'Home Insurance', amount: '', category: 'housing', frequency: 'yearly' },
    { name: 'Netflix', amount: '15.99', category: 'subscriptions', frequency: 'monthly' },
    { name: 'Spotify', amount: '11.99', category: 'subscriptions', frequency: 'monthly' },
    { name: 'Disney+', amount: '13.99', category: 'subscriptions', frequency: 'monthly' },
    { name: 'Amazon Prime', amount: '14.99', category: 'subscriptions', frequency: 'monthly' },
    { name: 'YouTube Premium', amount: '13.99', category: 'subscriptions', frequency: 'monthly' },
    { name: 'Gym Membership', amount: '', category: 'health', frequency: 'monthly' },
    { name: 'Groceries', amount: '', category: 'food', frequency: 'weekly' },
    { name: 'Petrol/Fuel', amount: '', category: 'transport', frequency: 'weekly' },
    { name: 'Public Transport', amount: '', category: 'transport', frequency: 'weekly' },
    { name: 'Council Rates', amount: '', category: 'housing', frequency: 'quarterly' },
  ]
  const [customPresets, setCustomPresets] = useState<any[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [csvTransactions, setCsvTransactions] = useState<any[]>([])
  const [showCsvImport, setShowCsvImport] = useState(false)

  const expenseCategories = ['housing', 'utilities', 'food', 'transport', 'entertainment', 'shopping', 'health', 'subscriptions', 'savings', 'income', 'transfer', 'other']
  
  const categoryKeywords: {[key: string]: string[]} = {
    housing: ['rent', 'mortgage', 'strata', 'body corp', 'council', 'rates'],
    utilities: ['electricity', 'electric', 'power', 'gas', 'water', 'internet', 'phone', 'telstra', 'optus', 'vodafone', 'nbn'],
    food: ['woolworths', 'coles', 'aldi', 'iga', 'grocery', 'groceries', 'uber eats', 'doordash', 'menulog', 'mcdonald', 'kfc', 'hungry jack', 'subway', 'restaurant', 'cafe', 'coffee'],
    transport: ['fuel', 'petrol', 'shell', 'bp', 'caltex', 'ampol', '7-eleven', 'uber', 'didi', 'ola', 'taxi', 'parking', 'toll', 'rego', 'registration', 'car insurance'],
    entertainment: ['netflix', 'spotify', 'disney', 'stan', 'binge', 'amazon prime', 'youtube', 'apple music', 'cinema', 'movie', 'ticketek', 'ticketmaster', 'gaming', 'steam', 'playstation', 'xbox'],
    shopping: ['amazon', 'ebay', 'kmart', 'target', 'big w', 'jb hi-fi', 'officeworks', 'bunnings', 'ikea', 'clothing', 'fashion'],
    health: ['pharmacy', 'chemist', 'doctor', 'medical', 'dentist', 'hospital', 'health insurance', 'medibank', 'bupa', 'hcf', 'gym', 'fitness'],
    subscriptions: ['subscription', 'membership', 'monthly fee', 'annual fee'],
    income: ['salary', 'wage', 'pay', 'deposit', 'transfer from', 'refund', 'cashback'],
    transfer: ['transfer', 'tfr', 'internal']
  }

  const autoCategorize = (description: string): string => {
    const lowerDesc = description.toLowerCase()
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => lowerDesc.includes(kw))) return category
    }
    return 'other'
  }

  const [goalCalculator, setGoalCalculator] = useState({ targetAmount: '', currentAmount: '', monthlyContribution: '', interestRate: '', years: '' })
  const [calculatorResult, setCalculatorResult] = useState<any>(null)
  const [calculating, setCalculating] = useState(false)

  const [forexProp, setForexProp] = useState({
    phase: 'phase1', accountSize: '100000',
    phase1DailyDD: '5', phase1MaxDD: '10', phase1Target: '10', phase1MinDays: '4', phase1MaxDays: '30',
    phase2DailyDD: '5', phase2MaxDD: '10', phase2Target: '5', phase2MinDays: '4', phase2MaxDays: '60',
    fundedDailyDD: '5', fundedMaxDD: '10',
    currentBalance: '100000', tradingDays: '0',
    riskPerTrade: '1', tradesPerDay: '2', winRate: '55', avgRR: '1.5', profitSplit: '80'
  })
  const [forexPropResults, setForexPropResults] = useState<any>(null)

  const [futuresProp, setFuturesProp] = useState({
    phase: 'evaluation', accountSize: '50000',
    evalTrailingDD: '2500', evalProfitTarget: '3000', evalMinDays: '7', evalDrawdownType: 'trailing',
    paTrailingDD: '2500', paProfitTarget: '3000', paMinDays: '7', paDrawdownType: 'eod',
    fundedTrailingDD: '2500', fundedDrawdownType: 'eod',
    currentBalance: '50000', highWaterMark: '50000', tradingDays: '0', contractLimit: '10',
    riskPerTrade: '200', tradesPerDay: '3', winRate: '50', avgWin: '300', avgLoss: '200', profitSplit: '90'
  })
  const [futuresPropResults, setFuturesPropResults] = useState<any>(null)

  const [tradingCalculator, setTradingCalculator] = useState({ 
    startingCapital: '10000', monthlyContribution: '500', returnRate: '1', returnPeriod: 'daily',
    years: '0', months: '0', days: '0',
    includeWeekends: 'no',
    includeDays: ['M', 'T', 'W', 'T2', 'F'],
    reinvestRate: '100', riskPerTrade: '2', winRate: '55', riskReward: '1.5'
  })
  const [tradingResults, setTradingResults] = useState<any>(null)
  const [calculatingTrading, setCalculatingTrading] = useState(false)

  // Gamification state
  const [xpPoints, setXpPoints] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [lastLevelShown, setLastLevelShown] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [achievements, setAchievements] = useState<string[]>([])
  const [newAchievement, setNewAchievement] = useState<string | null>(null)


  // Quest Board state
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null)

  // Guide tab state
  const [expandedGuideSection, setExpandedGuideSection] = useState<string | null>(null)
  const [expandedGuideItem, setExpandedGuideItem] = useState<string | null>(null)
  // Interactive Tour state
  const [tourActive, setTourActive] = useState(false)
  const [tourStep, setTourStep] = useState(0)
  const tourSteps = [
    { title: 'Welcome to Aureus! ⚜', body: 'This guided tour will walk you through every feature of your personal finance command centre. Let\'s get you set up for financial success!', tab: null, icon: '👋' },
    { title: 'Choose Your Mode', body: 'Aureus has two modes:\n\n💰 Budget Mode — Track income, expenses, debts, and savings goals\n📈 Trading Mode — Journal trades, manage prop firm accounts, run calculators\n\nYou can switch anytime using the mode button in the header.', tab: null, icon: '🎮' },
    { title: 'Step 1: Add Your Income', body: 'Start by adding your income streams. Click "Presets" to quickly add common income types like salary, freelancing, or dividends.\n\nFor each income you can set:\n• Amount and frequency (weekly/fortnightly/monthly)\n• Before or after tax (we\'ll calculate the net for you!)\n• Start date for calendar tracking\n\nThe Tax Estimator button shows your full ATO tax breakdown.', tab: 'dashboard', icon: '💰' },
    { title: 'Step 2: Add Your Expenses', body: 'Add your regular expenses and bills. Use "Presets" for common bills or "CSV" to import your bank statement.\n\nThe app auto-categorises transactions from CSV imports (e.g. Woolworths → Food, Telstra → Utilities).\n\nEach expense appears on your calendar so you never miss a payment.', tab: 'dashboard', icon: '💸' },
    { title: 'Step 3: Debt Boss Battles', body: 'Add your debts and watch them transform into boss monsters to defeat!\n\nEach debt shows HP (hit points) that decrease as you pay it off. Choose your strategy:\n🏔️ Avalanche — Highest interest first (saves money)\n⛄ Snowball — Smallest balance first (quick wins)\n\nAdd Power-Ups (extra payments) to defeat bosses faster!', tab: 'dashboard', icon: '⚔️' },
    { title: 'Step 4: Savings Quests', body: 'Create savings goals and turn them into quests with progress ranks:\n🚀 Just Started → 🌟 Making Progress → ⚡ Halfway Hero → 🔥 Almost There → 👑 COMPLETE!\n\nClick "Add to Calendar" to schedule automatic savings. When you mark "PAY" on the calendar, your saved amount increases automatically.', tab: 'dashboard', icon: '🎯' },
    { title: 'Step 5: The Calendar', body: 'Your financial command centre! Every income, expense, debt payment, and savings contribution shows here.\n\nClick any day to expand it. Hit "PAY" to:\n✅ Mark income as received\n✅ Mark bills as paid\n✅ Reduce debt balances\n✅ Add to savings goals\n\nColour coding: 💚 Income, 💙 Expenses, ❤️ Debts, 💜 Goals', tab: 'dashboard', icon: '📅' },
    { title: 'Overview: Escape the Rat Race', body: 'The Overview tab shows your big picture:\n\n🐀 Rat Race Tracker — How close passive income is to covering expenses\n📊 Cash Flow Quadrant — Kiyosaki\'s E/S/B/I framework\n🗺️ Passive Income Quest Board — 10 paths to passive income with difficulty ratings\n🧮 Goal Calculator — See how compound interest grows your money', tab: 'overview', icon: '💎' },
    { title: 'Path: Baby Steps to Freedom', body: 'Your step-by-step roadmap to financial independence:\n\n1️⃣ $1K Emergency Fund\n2️⃣ Pay Off All Debt\n3️⃣ 3-6 Month Emergency Fund\n4️⃣ Invest 15%\n5️⃣ Save for Property\n6️⃣ Pay Off Mortgage\n7️⃣ Build Wealth\n8️⃣ Reach Your FIRE Number\n\nEach step has action buttons to create goals and add them to your calendar. Plus a complete Australian Home Buying Guide!', tab: 'path', icon: '🎯' },
    { title: 'Trading Mode', body: 'Switch to Trading Mode for powerful tools:\n\n📝 Trade Journal — Log trades with AI text or screenshot upload\n📊 Analytics — Equity curve, win rate, P/L by session and emotion\n🧠 Psychology — Pre-trade checklist and rule violation tracking\n💼 Prop Firm Dashboard — Track multiple funded accounts\n🧮 Compound Calculator — Project earnings with day selection\n📅 Trading Calendar — See daily P/L at a glance', tab: 'trading', icon: '📈' },
    { title: 'XP & Achievements', body: 'Everything you do earns XP! Add income (+15), track debt (+20), create goals (+25), mark payments (+10).\n\nLevel up from 🐣 Hatchling to 🏆 Money Master!\n\nUnlock achievements like 🎯 First Goal, 💳 Debt Tracked, and 🎉 Debt Destroyed. Confetti included! 🎊', tab: null, icon: '🎮' },
    { title: 'You\'re Ready! 🚀', body: 'That\'s everything! Here\'s the best workflow:\n\n1. Add income and expenses\n2. Set up debts as boss battles\n3. Create savings goals\n4. Check your calendar every payday\n5. Review the Overview weekly\n6. Follow the Baby Steps on the Path tab\n\nYour financial freedom journey starts now. Let\'s go! ⚜', tab: null, icon: '🏆' },
  ]
  const nextTourStep = () => { 
    if (tourStep < tourSteps.length - 1) { 
      const next = tourStep + 1
      setTourStep(next)
      if (tourSteps[next].tab) setActiveTab(tourSteps[next].tab as any)
    } else { setTourActive(false); setTourStep(0); awardXP(50) }
  }
  const prevTourStep = () => { if (tourStep > 0) { const prev = tourStep - 1; setTourStep(prev); if (tourSteps[prev].tab) setActiveTab(tourSteps[prev].tab as any) } }
  // === ENHANCED TRADING STATE ===
  // Collapsible sections
  const [tradingSections, setTradingSections] = useState<{[key:string]:boolean}>({ journal: true, analytics: false, psychology: false, props: false, risk: false, session: false, rank: false })
  const toggleTradingSection = (id: string) => setTradingSections(prev => ({ ...prev, [id]: !prev[id] }))

  // Enhanced trade fields
  const [newTradeExtra, setNewTradeExtra] = useState({ emotion: 'disciplined', setup: '', rMultiple: '', session: 'london', rulesBroken: '', tags: '', confidence: '3', reflection: '' })
  const [monthlyPLGoal, setMonthlyPLGoal] = useState({ target: '', month: new Date().toISOString().slice(0, 7) })
  const [tradePlans, setTradePlans] = useState<any[]>([])
  const [newTradePlan, setNewTradePlan] = useState({ instrument: '', direction: 'long', entry: '', stopLoss: '', takeProfit: '', notes: '', date: new Date().toISOString().split('T')[0] })
  const [dailyCheckIn, setDailyCheckIn] = useState<any[]>([])
  const [coachOpen, setCoachOpen] = useState(false)
  const [prepTab, setPrepTab] = useState<'session'|'mindset'|'risk'|'trades'>('session')
  const [coachMessages, setCoachMessages] = useState<{role:string,content:string}[]>([])
  const [coachInput, setCoachInput] = useState('')
  const [coachLoading, setCoachLoading] = useState(false)
  const [myStrategy, setMyStrategy] = useState('')
  const [showStrategyEditor, setShowStrategyEditor] = useState(false)
  const [strategyBuilder, setStrategyBuilder] = useState<{[k:string]:string}>({ experience: '', markets: '', timeframes: '', style: '', entryRules: '', exitRules: '', riskPerTrade: '', sessionsTime: '', newsApproach: '', maxTrades: '', strengths: '', weaknesses: '', goals: '' })
  const strategyFromBuilder = () => {
    const s = strategyBuilder
    const parts: string[] = []
    if (s.experience) parts.push('Experience: ' + s.experience)
    if (s.markets) parts.push('Markets: ' + s.markets)
    if (s.timeframes) parts.push('Timeframes: ' + s.timeframes)
    if (s.style) parts.push('Style: ' + s.style)
    if (s.entryRules) parts.push('Entry Rules: ' + s.entryRules)
    if (s.exitRules) parts.push('Exit Rules: ' + s.exitRules)
    if (s.riskPerTrade) parts.push('Risk Per Trade: ' + s.riskPerTrade)
    if (s.sessionsTime) parts.push('Trading Sessions: ' + s.sessionsTime)
    if (s.newsApproach) parts.push('News Approach: ' + s.newsApproach)
    if (s.maxTrades) parts.push('Max Trades/Day: ' + s.maxTrades)
    if (s.strengths) parts.push('Strengths: ' + s.strengths)
    if (s.weaknesses) parts.push('Working On: ' + s.weaknesses)
    if (s.goals) parts.push('Goals: ' + s.goals)
    return parts.join('\n')
  }
  const coachChatRef = useRef<HTMLDivElement>(null)

  const buildCoachContext = () => {
    const today = new Date().toISOString().split('T')[0]
    const todayTr = trades.filter((t:any) => t.date === today)
    const todayPL2 = todayTr.reduce((s:number,t:any) => s + parseFloat(t.profitLoss||'0'), 0)
    const totalPL2 = trades.reduce((s:number,t:any) => s + parseFloat(t.profitLoss||'0'), 0)
    const wr = trades.length > 0 ? (trades.filter((t:any) => parseFloat(t.profitLoss||'0') > 0).length / trades.length * 100) : 0
    const recentTrades = trades.slice(0, 10).map((t:any) => t.date+' '+t.instrument+' '+t.direction+' '+(parseFloat(t.profitLoss||'0')>=0?'+':'')+t.profitLoss+' emotion:'+t.emotion+(t.rulesBroken?' RULES_BROKEN:'+t.rulesBroken:'')).join('\n')
    const emotionBreakdown = ['disciplined','confident','fomo','revenge','anxious','fearful'].map(em => { const et = trades.filter((t:any)=>t.emotion===em); const ep = et.reduce((s:number,t:any)=>s+parseFloat(t.profitLoss||'0'),0); return et.length > 0 ? em+': '+et.length+' trades, P/L: $'+ep.toFixed(0) : null }).filter(Boolean).join('; ')
    const checkIn = todayCheckIn ? 'Mood:'+todayCheckIn.mood+'/5 Energy:'+todayCheckIn.energy+'/5 Focus:'+todayCheckIn.focus+'/5' : 'No check-in today'
    const propInfo = propAccounts.map((a:any) => a.firm+' '+a.phase+' Balance:$'+a.currentBalance+' MaxDD:$'+a.maxDrawdown+(a.dailyDrawdown?' DailyDD:$'+a.dailyDrawdown:'')+(a.newsTrading==='no'?' NO_NEWS':'')+(a.weekendHolding==='no'?' NO_WEEKEND':'')).join('; ')
    return 'TRADER CONTEXT:\n'+'Strategy: '+(myStrategy||'Not defined yet')+'\n'+'Today: '+todayTr.length+' trades, P/L: $'+todayPL2.toFixed(0)+'\n'+'All-time: '+trades.length+' trades, P/L: $'+totalPL2.toFixed(0)+', Win Rate: '+wr.toFixed(1)+'%\n'+'Mental State: '+checkIn+'\n'+'Emotion Breakdown: '+emotionBreakdown+'\n'+'Accounts: '+(propInfo||'None')+'\n'+'Recent Trades:\n'+recentTrades+'\n'+'Risk Rules: Max daily loss $'+riskLimits.maxDailyLoss+', Max trades/day '+riskLimits.maxDailyTrades+', Risk/trade '+riskLimits.maxRiskPerTrade+'%'
  }

  const sendCoachMessage = async (text?: string) => {
    const msg = text || coachInput
    if (!msg.trim()) return
    const userMsg = { role: 'user', content: msg }
    setCoachMessages(prev => [...prev, userMsg])
    setCoachInput('')
    setCoachLoading(true)
    try {
      const context = buildCoachContext()
      const systemPrompt = 'You are an expert trading coach inside the Aureus trading app. You have full access to the trader\'s data, strategy, mental state, and trade history. Your role is to:\n1. Help them plan sessions and review trades\n2. Coach them through psychology issues (tilt, revenge trading, FOMO)\n3. Give honest, direct feedback on their trading\n4. Help refine their strategy\n5. Celebrate wins and help process losses healthily\n\nBe concise but warm. Use their actual data in responses. If they\'re showing signs of tilt or revenge trading, call it out firmly but kindly. Never give specific financial advice - help them follow THEIR rules better.\n\nHere is their current data:\n'+context
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          messages: [...coachMessages, userMsg].map(m => ({role: m.role as 'user'|'assistant', content: m.content}))
        })
      })
      const data = await response.json()
      const reply = data.reply || (data.content?.map((c:any) => c.text||'').join('')) || 'Sorry, I couldn\'t process that. Try again.'
      setCoachMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setCoachMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
    }
    setCoachLoading(false)
    setTimeout(() => coachChatRef.current?.scrollTo(0, coachChatRef.current.scrollHeight), 100)
  }
  const [todayCheckIn, setTodayCheckIn] = useState({ mood: 3, energy: 3, focus: 3, notes: '', date: new Date().toISOString().split('T')[0] })
  const [tradeImages, setTradeImages] = useState<{[tradeId:number]:string}>({})
  const handleTradeImageUpload = (tradeId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setTradeImages(prev => ({ ...prev, [tradeId]: dataUrl }))
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }
  const deleteTrade = (id: number) => {
    setTrades(prev => prev.filter(t => t.id !== id))
    setTradeImages(prev => { const next = { ...prev }; delete next[id]; return next })
  }

  // Prop accounts tracker
  const [propAccounts, setPropAccounts] = useState<any[]>([])
  const [personalAccounts, setPersonalAccounts] = useState<any[]>([])
  const [newPersonalAccount, setNewPersonalAccount] = useState({ broker: '', accountSize: '', currentBalance: '', type: 'forex' })
  const [editingPropId, setEditingPropId] = useState<number|null>(null)
  const [showNewAccountForm, setShowNewAccountForm] = useState<'prop'|'personal'|null>(null)
  const [inlineNewAccount, setInlineNewAccount] = useState({ name: '', size: '', type: 'prop' as 'prop'|'personal' })
  const [newPropAccount, setNewPropAccount] = useState({ firm: 'FTMO', type: 'forex', phase: 'phase1', accountSize: '100000', currentBalance: '100000', maxDrawdown: '10000', dailyDrawdown: '5000', profitTarget: '10000', startDate: new Date().toISOString().split('T')[0], status: 'active', cost: '0', monthlyCost: '0', minDays: '0', maxDays: '0', profitSplit: '80', newsTrading: 'yes', weekendHolding: 'no', maxLots: '', eaAllowed: 'no', payoutFreq: 'biweekly' })
  const [propPayouts, setPropPayouts] = useState<any[]>([])
  const [newPayout, setNewPayout] = useState({ accountId: '', amount: '', date: new Date().toISOString().split('T')[0] })

  // Session planner
  const [sessionPlan, setSessionPlan] = useState({ bias: 'neutral', pairs: '', keyLevels: '', newsEvents: '', maxTrades: '3', maxLoss: '', goals: '', notes: '' })
  const [sessionPlans, setSessionPlans] = useState<any[]>([])

  // Pre-trade checklist
  const [checklist, setChecklist] = useState<{id:number,text:string,checked:boolean}[]>([
    { id: 1, text: 'Identified clear trend/structure', checked: false },
    { id: 2, text: 'Entry aligns with higher timeframe', checked: false },
    { id: 3, text: 'Risk:Reward is 1:2 or better', checked: false },
    { id: 4, text: 'Stop loss is at logical level', checked: false },
    { id: 5, text: 'Position size is within risk limits', checked: false },
    { id: 6, text: 'No revenge trading or FOMO', checked: false },
    { id: 7, text: 'Checked economic calendar', checked: false },
    { id: 8, text: 'Trading plan followed', checked: false },
  ])
  const [customChecklistItem, setCustomChecklistItem] = useState('')

  // Risk management
  const [riskLimits, setRiskLimits] = useState<{[key:string]:string}>({ maxDailyLoss: '300', maxWeeklyLoss: '1000', maxDailyTrades: '5', maxRiskPerTrade: '2', maxOpenPositions: '3' })

  // Trading rank
  const getTraderRank = (tradesList: any[]) => {
    const count = tradesList.length
    const wins = tradesList.filter(t => parseFloat(t.profitLoss || '0') > 0).length
    const wr = count > 0 ? (wins / count) * 100 : 0
    const totalProfit = tradesList.reduce((s, t) => s + parseFloat(t.profitLoss || '0'), 0)
    const score = count * 2 + (wr > 50 ? wr * 2 : 0) + (totalProfit > 0 ? Math.log10(totalProfit + 1) * 20 : 0)
    if (score >= 500) return { rank: '🏆 Market Wizard', color: '#fbbf24', tier: 10 }
    if (score >= 400) return { rank: '💎 Elite Trader', color: '#60a5fa', tier: 9 }
    if (score >= 300) return { rank: '🔥 Funded Pro', color: '#f97316', tier: 8 }
    if (score >= 220) return { rank: '⚡ Consistent', color: '#a78bfa', tier: 7 }
    if (score >= 160) return { rank: '🎯 Sharpshooter', color: '#10b981', tier: 6 }
    if (score >= 110) return { rank: '📈 Rising Trader', color: '#3b82f6', tier: 5 }
    if (score >= 70) return { rank: '💪 Getting Edge', color: '#f472b6', tier: 4 }
    if (score >= 40) return { rank: '📊 Learning', color: '#14b8a6', tier: 3 }
    if (score >= 15) return { rank: '🌱 Beginner', color: '#86efac', tier: 2 }
    return { rank: '🐣 Paper Trader', color: '#94a3b8', tier: 1 }
  }

  const getWinStreak = (tradesList: any[]): { currentStreak: number, currentType: string, bestStreak: number, lastThree: string[] } => {
    let current = 0, best = 0, type = 'none' as string
    const sorted = [...tradesList].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    sorted.forEach(t => {
      if (parseFloat(t.profitLoss || '0') > 0) { if (type === 'win') current++; else { current = 1; type = 'win' }; best = Math.max(best, current) }
      else { if (type === 'loss') current++; else { current = 1; type = 'loss' } }
    })
    const lastThree = sorted.slice(-3).map(t => parseFloat(t.profitLoss||'0') > 0 ? 'W' : 'L')
    return { currentStreak: current, currentType: type, bestStreak: best, lastThree }
  }

  const addEnhancedTrade = () => {
    if (!newTrade.instrument) return
    const trade = { ...newTrade, ...newTradeExtra, id: Date.now(), linkedAccount: newTrade.linkedAccount || '' }
    setTrades(prev => [...prev, trade].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    // Auto-update linked account balance
    if (newTrade.linkedAccount) {
      const pl = parseFloat(newTrade.profitLoss || '0')
      const isPersonal = newTrade.linkedAccount.startsWith('personal-')
      if (isPersonal) {
        setPersonalAccounts(prev => prev.map(a => a.id === parseInt(newTrade.linkedAccount.replace('personal-','')) ? { ...a, currentBalance: String(parseFloat(a.currentBalance||'0') + pl) } : a))
      } else {
        setPropAccounts(prev => prev.map(a => a.id === parseInt(newTrade.linkedAccount) ? { ...a, currentBalance: String(parseFloat(a.currentBalance||'0') + pl) } : a))
      }
    }
    setNewTrade({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '', linkedAccount: '' })
    setNewTradeExtra({ emotion: 'disciplined', setup: '', rMultiple: '', session: 'london', rulesBroken: '', tags: '', confidence: '3', reflection: '' })
    awardXP(15)
  }

  const addPropAccount = () => {
    if (!newPropAccount.firm) return
    setPropAccounts(prev => [...prev, { ...newPropAccount, id: Date.now() }])
    setNewPropAccount({ firm: 'FTMO', type: 'forex', phase: 'phase1', accountSize: '100000', currentBalance: '100000', maxDrawdown: '10000', dailyDrawdown: '5000', profitTarget: '10000', startDate: new Date().toISOString().split('T')[0], status: 'active', cost: '0', monthlyCost: '0', minDays: '0', maxDays: '0', profitSplit: '80', newsTrading: 'yes', weekendHolding: 'no', maxLots: '', eaAllowed: 'no', payoutFreq: 'biweekly' })
  }

  const addPropPayout = () => {
    if (!newPayout.amount) return
    setPropPayouts(prev => [...prev, { ...newPayout, id: Date.now() }])
    setNewPayout({ accountId: '', amount: '', date: new Date().toISOString().split('T')[0] })
  }

  const saveSessionPlan = () => {
    setSessionPlans(prev => [...prev, { ...sessionPlan, id: Date.now(), date: new Date().toISOString().split('T')[0] }])
    setSessionPlan({ bias: 'neutral', pairs: '', keyLevels: '', newsEvents: '', maxTrades: '3', maxLoss: '', goals: '', notes: '' })
  }

  // ===== GAMIFICATION SYSTEM =====
  const getLevel = (xp: number) => {
    if (xp >= 5000) return { level: 10, title: '🏆 Financial Legend', color: '#fbbf24', next: 99999 }
    if (xp >= 3500) return { level: 9, title: '💎 Diamond Hands', color: '#60a5fa', next: 5000 }
    if (xp >= 2500) return { level: 8, title: '🔥 On Fire', color: '#f97316', next: 3500 }
    if (xp >= 1800) return { level: 7, title: '⚡ Power Saver', color: '#a78bfa', next: 2500 }
    if (xp >= 1200) return { level: 6, title: '🌟 Rising Star', color: '#34d399', next: 1800 }
    if (xp >= 800) return { level: 5, title: '🎯 Goal Crusher', color: '#f472b6', next: 1200 }
    if (xp >= 500) return { level: 4, title: '💪 Getting Strong', color: '#818cf8', next: 800 }
    if (xp >= 250) return { level: 3, title: '📈 On Track', color: '#2dd4bf', next: 500 }
    if (xp >= 100) return { level: 2, title: '🌱 Seedling', color: '#86efac', next: 250 }
    return { level: 1, title: '🐣 Just Started', color: '#94a3b8', next: 100 }
  }
  const currentLevel = getLevel(xpPoints)
  const prevLevelXP = [0,0,100,250,500,800,1200,1800,2500,3500,5000][currentLevel.level] || 0
  const xpProgress = currentLevel.next < 99999 ? ((xpPoints - prevLevelXP) / (currentLevel.next - prevLevelXP)) * 100 : 100

  const awardXP = (amount: number) => {
    setXpPoints(prev => {
      const newXP = prev + amount
      const oldLevel = getLevel(prev).level
      const newLevel = getLevel(newXP).level
      if (newLevel > oldLevel && newLevel > lastLevelShown) {
        setShowLevelUp(true)
        setLastLevelShown(newLevel)
        setTimeout(() => setShowLevelUp(false), 3000)
      }
      return newXP
    })
  }
  const triggerConfetti = () => { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 2500) }
  const unlockAchievement = (id: string, name: string) => {
    if (!achievements.includes(id)) {
      setAchievements(prev => [...prev, id]); setNewAchievement(name); awardXP(50); triggerConfetti()
      setTimeout(() => setNewAchievement(null), 3500)
    }
  }
  useEffect(() => {
    if (goals.length >= 1) unlockAchievement('first_goal', '🎯 First Goal Set!')
    if (goals.length >= 5) unlockAchievement('five_goals', '🏅 Goal Machine!')
    if (debts.length >= 1) unlockAchievement('debt_tracked', '💳 Debt Awareness')
    if (goals.some(g => parseFloat(g.saved||'0') >= parseFloat(g.target||'1'))) unlockAchievement('goal_complete', '✅ Goal Achieved!')
    if (debts.some(d => parseFloat(d.balance||'0') <= 0)) unlockAchievement('debt_cleared', '🎉 Debt Destroyed!')
    if (paidOccurrences.size >= 5) unlockAchievement('five_payments', '💸 Payment Pro!')
    if (paidOccurrences.size >= 20) unlockAchievement('twenty_payments', '⚡ Payment Master!')
    if (incomeStreams.length >= 3) unlockAchievement('income_diversified', '💰 Income Diversified')
  }, [goals, debts, paidOccurrences, incomeStreams])

  const getGoalRank = (progress: number) => {
    if (progress >= 100) return { emoji: '👑', label: 'COMPLETE', color: '#fbbf24' }
    if (progress >= 75) return { emoji: '🔥', label: 'Almost There!', color: '#f97316' }
    if (progress >= 50) return { emoji: '⚡', label: 'Halfway Hero', color: '#a78bfa' }
    if (progress >= 25) return { emoji: '🌟', label: 'Making Progress', color: '#34d399' }
    return { emoji: '🚀', label: 'Just Started', color: '#60a5fa' }
  }
  const getDebtBoss = (balance: number, originalBalance: number) => {
    const hp = originalBalance > 0 ? (balance / originalBalance) * 100 : 100
    if (hp <= 0) return { emoji: '💀', label: 'DEFEATED', color: '#10b981' }
    if (hp <= 25) return { emoji: '😵', label: 'Nearly Dead', color: '#34d399' }
    if (hp <= 50) return { emoji: '😰', label: 'Weakening', color: '#fbbf24' }
    if (hp <= 75) return { emoji: '😤', label: 'Hurt', color: '#f97316' }
    return { emoji: '👹', label: 'Full HP', color: '#ef4444' }
  }

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

  const getOccurrencesInMonth = (startDate: string, frequency: string, targetMonth: number, targetYear: number): number => {
    const start = new Date(startDate); start.setHours(0, 0, 0, 0)
    const monthStart = new Date(targetYear, targetMonth, 1)
    const monthEnd = new Date(targetYear, targetMonth + 1, 0)
    if (start > monthEnd) return 0
    if (frequency === 'monthly') return 1
    if (frequency === 'yearly') return start.getMonth() === targetMonth ? 1 : 0
    if (frequency === 'quarterly') { const monthsDiff = (targetYear - start.getFullYear()) * 12 + (targetMonth - start.getMonth()); return monthsDiff >= 0 && monthsDiff % 3 === 0 ? 1 : 0 }
    if (frequency === 'once') return start.getMonth() === targetMonth && start.getFullYear() === targetYear ? 1 : 0
    const intervalDays = frequency === 'weekly' ? 7 : 14
    let count = 0; let currentDate = new Date(start)
    while (currentDate < monthStart) currentDate.setDate(currentDate.getDate() + intervalDays)
    while (currentDate <= monthEnd) { count++; currentDate.setDate(currentDate.getDate() + intervalDays) }
    return count
  }

  const calculateMonthlyTotals = (month: number, year: number) => {
    const incomeTotal = incomeStreams.reduce((sum, inc) => sum + (parseFloat(inc.amount || '0') * getOccurrencesInMonth(inc.startDate, inc.frequency, month, year)), 0)
    const payoutsThisMonth = tradingPayoutsAsIncome ? propPayouts.filter((p: any) => { const d = new Date(p.date); return d.getMonth() === month && d.getFullYear() === year }).reduce((s: number, p: any) => s + parseFloat(p.amount || '0'), 0) : 0
    const expenseTotal = expenses.filter(e => !e.targetDebtId && !e.targetGoalId).reduce((sum, exp) => sum + (parseFloat(exp.amount || '0') * getOccurrencesInMonth(exp.dueDate, exp.frequency, month, year)), 0)
    const debtTotal = debts.reduce((sum, debt) => sum + (parseFloat(debt.minPayment || '0') * getOccurrencesInMonth(debt.paymentDate, debt.frequency, month, year)), 0)
    return { incomeTotal: incomeTotal + payoutsThisMonth, expenseTotal, debtTotal, total: incomeTotal + payoutsThisMonth - expenseTotal - debtTotal }
  }
  const currentMonthTotals = calculateMonthlyTotals(calendarMonth.getMonth(), calendarMonth.getFullYear())

  const convertToMonthly = (amount: number, frequency: string) => {
    if (frequency === 'weekly') return amount * (52 / 12)
    if (frequency === 'fortnightly') return amount * (26 / 12)
    if (frequency === 'yearly') return amount / 12
    if (frequency === 'quarterly') return amount / 3
    if (frequency === 'once') return 0
    return amount
  }
  
  const tradingPayoutMonthly = tradingPayoutsAsIncome && propPayouts.length > 0 ? propPayouts.reduce((s: number, p: any) => s + parseFloat(p.amount || '0'), 0) : 0
  const monthlyIncome = incomeStreams.reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || '0'), inc.frequency), 0) + tradingPayoutMonthly
  const activeIncome = incomeStreams.filter(inc => inc.type === 'active').reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || '0'), inc.frequency), 0)
  const passiveIncome = incomeStreams.filter(inc => inc.type === 'passive').reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || '0'), inc.frequency), 0) + tradingPayoutMonthly
  const passiveIncomePercentage = monthlyIncome > 0 ? (passiveIncome / monthlyIncome) * 100 : 0
  const monthlyExpenses = expenses.filter(e => !e.targetDebtId && !e.targetGoalId).reduce((sum, exp) => sum + convertToMonthly(parseFloat(exp.amount || '0'), exp.frequency), 0)
  const monthlyDebtPayments = debts.reduce((sum, debt) => sum + convertToMonthly(parseFloat(debt.minPayment || '0'), debt.frequency), 0)
  const totalDebtBalance = debts.reduce((sum, d) => sum + parseFloat(d.balance || '0'), 0)
  const totalOutgoing = monthlyExpenses + monthlyDebtPayments
  const monthlySurplus = monthlyIncome - totalOutgoing
  const totalAssets = assets.reduce((sum, a) => sum + parseFloat(a.value || '0'), 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + parseFloat(l.value || '0'), 0)
  const totalPL = trades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)
  const winRate = trades.length > 0 ? (trades.filter(t => parseFloat(t.profitLoss || '0') > 0).length / trades.length) * 100 : 0

  const getAlerts = () => {
    const alertsList: any[] = []
    const today = new Date(); today.setHours(0, 0, 0, 0)
    expenses.forEach(exp => {
      if (exp.targetDebtId || exp.targetGoalId) return
      const dueDate = new Date(exp.dueDate); dueDate.setHours(0, 0, 0, 0)
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntilDue < 0) alertsList.push({ severity: 'danger', message: exp.name + ' is ' + Math.abs(daysUntilDue) + ' days overdue', amount: exp.amount })
      else if (daysUntilDue <= 3) alertsList.push({ severity: 'warning', message: exp.name + ' due in ' + daysUntilDue + ' days', amount: exp.amount })
    })
    return alertsList.sort((a, b) => (a.severity === 'danger' ? -1 : 1))
  }
  const alerts = getAlerts()

  const getDaysInMonth = () => {
    const year = calendarMonth.getFullYear(); const month = calendarMonth.getMonth()
    return { firstDay: new Date(year, month, 1).getDay(), daysInMonth: new Date(year, month + 1, 0).getDate(), month, year }
  }
  const prevMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
  const nextMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))
  
  const calculateGoalPayment = (goal: any) => {
    const remaining = parseFloat(goal.target || '0') - parseFloat(goal.saved || '0')
    if (!goal.deadline || remaining <= 0) return 0
    const monthsRemaining = Math.max(1, Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)))
    const monthlyNeeded = remaining / monthsRemaining
    if (goal.savingsFrequency === 'weekly') return monthlyNeeded / (52 / 12)
    if (goal.savingsFrequency === 'fortnightly') return monthlyNeeded / (26 / 12)
    return monthlyNeeded
  }

  const calculateMonthsToGoal = (goal: any) => {
    const remaining = parseFloat(goal.target || '0') - parseFloat(goal.saved || '0')
    if (remaining <= 0) return 0
    const payment = goal.paymentAmount ? parseFloat(goal.paymentAmount) : calculateGoalPayment(goal)
    const monthlyPayment = convertToMonthly(payment, goal.savingsFrequency || 'monthly')
    if (monthlyPayment <= 0) return 999
    return Math.ceil(remaining / monthlyPayment)
  }
  const getCalendarItemsForDay = (day: number) => {
    // Add trading payouts to calendar
    const payoutItems = tradingPayoutsAsIncome ? propPayouts.filter((p: any) => {
      const d = new Date(p.date)
      return d.getDate() === day && d.getMonth() === calendarMonth.getMonth() && d.getFullYear() === calendarMonth.getFullYear()
    }).map((p: any) => ({ id: 'payout-'+p.id, name: '📈 Trading Payout', amount: p.amount, type: 'income', isPaid: true, frequency: 'once' })) : []
    const { month, year } = getDaysInMonth()
    const items: any[] = []
    const allItems = [
      ...incomeStreams.map(inc => ({ id: 'income-' + inc.id, sourceId: inc.id, sourceType: 'income', name: '💰 ' + inc.name, amount: inc.amount, dueDate: inc.startDate, frequency: inc.frequency, type: 'income' })),
      ...expenses.map(exp => ({ 
        id: 'expense-' + exp.id, sourceId: exp.id, 
        sourceType: exp.targetDebtId ? 'extraDebt' : exp.targetGoalId ? 'extraGoal' : 'expense',
        targetDebtId: exp.targetDebtId, targetGoalId: exp.targetGoalId,
        name: '💸 ' + exp.name, amount: exp.amount, dueDate: exp.dueDate, frequency: exp.frequency, type: 'expense' 
      })),
      ...debts.filter(d => d.paymentDate).map(debt => ({ id: 'debt-' + debt.id, sourceId: debt.id, sourceType: 'debt', name: '💳 ' + debt.name, amount: debt.minPayment, dueDate: debt.paymentDate, frequency: debt.frequency, type: 'debt' })),
      ...goals.filter(g => g.startDate).map(goal => {
        const paymentAmt = goal.paymentAmount ? parseFloat(goal.paymentAmount) : (goal.deadline ? calculateGoalPayment(goal) : 0)
        return { id: 'goal-' + goal.id, sourceId: goal.id, sourceType: 'goal', name: '🎯 ' + goal.name, amount: paymentAmt.toFixed(2), dueDate: goal.startDate, frequency: goal.savingsFrequency, type: 'goal' }
      })
    ]
    
    allItems.forEach(item => {
      if (!item.dueDate) return
      const itemDate = new Date(item.dueDate)
      const itemDay = itemDate.getDate(); const itemMonth = itemDate.getMonth(); const itemYear = itemDate.getFullYear()
      const currentDate = new Date(year, month, day)
      const startDate = new Date(item.dueDate); startDate.setHours(0,0,0,0); currentDate.setHours(0,0,0,0)
      
      let shouldShow = false
      if (itemDay === day && itemMonth === month && itemYear === year) { shouldShow = true }
      else if (item.frequency && item.frequency !== 'once' && currentDate >= startDate) {
        if (item.frequency === 'weekly') { const daysDiff = Math.round((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)); shouldShow = daysDiff >= 0 && daysDiff % 7 === 0 }
        else if (item.frequency === 'fortnightly') { const daysDiff = Math.round((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)); shouldShow = daysDiff >= 0 && daysDiff % 14 === 0 }
        else if (item.frequency === 'monthly') { const daysInCurrentMonth = new Date(year, month + 1, 0).getDate(); shouldShow = itemDay > daysInCurrentMonth ? day === daysInCurrentMonth : day === itemDay }
        else if (item.frequency === 'yearly') shouldShow = day === itemDay && month === itemMonth
      }
      
      if (shouldShow) {
        const occurrenceDate = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0')
        const uniqueId = item.id + '-' + occurrenceDate
        items.push({ ...item, id: uniqueId, originalId: item.id, occurrenceDate, isPaid: paidOccurrences.has(uniqueId) })
      }
    })
    return [...items, ...payoutItems]
  }

  const togglePaid = (itemId: string, sourceType: string, sourceId: number, amount: number, targetDebtId?: number, targetGoalId?: number) => {
    const newPaid = new Set(paidOccurrences)
    const paymentAmount = amount || 0
    
    if (paidOccurrences.has(itemId)) {
      newPaid.delete(itemId)
      if (sourceType === 'goal' && sourceId) setGoals(prev => prev.map(g => g.id === sourceId ? { ...g, saved: Math.max(0, parseFloat(g.saved || '0') - paymentAmount).toFixed(2) } : g))
      else if (sourceType === 'debt' && sourceId) setDebts(prev => prev.map(d => d.id === sourceId ? { ...d, balance: (parseFloat(d.balance || '0') + paymentAmount).toFixed(2) } : d))
      else if (sourceType === 'extraDebt' && targetDebtId) setDebts(prev => prev.map(d => d.id === targetDebtId ? { ...d, balance: (parseFloat(d.balance || '0') + paymentAmount).toFixed(2) } : d))
      else if (sourceType === 'extraGoal' && targetGoalId) setGoals(prev => prev.map(g => g.id === targetGoalId ? { ...g, saved: Math.max(0, parseFloat(g.saved || '0') - paymentAmount).toFixed(2) } : g))
    } else {
      newPaid.add(itemId)
      awardXP(10)
      if (sourceType === 'goal' && sourceId) setGoals(prev => prev.map(g => g.id === sourceId ? { ...g, saved: (parseFloat(g.saved || '0') + paymentAmount).toFixed(2) } : g))
      else if (sourceType === 'debt' && sourceId) setDebts(prev => prev.map(d => d.id === sourceId ? { ...d, balance: Math.max(0, parseFloat(d.balance || '0') - paymentAmount).toFixed(2) } : d))
      else if (sourceType === 'extraDebt' && targetDebtId) setDebts(prev => prev.map(d => d.id === targetDebtId ? { ...d, balance: Math.max(0, parseFloat(d.balance || '0') - paymentAmount).toFixed(2) } : d))
      else if (sourceType === 'extraGoal' && targetGoalId) setGoals(prev => prev.map(g => g.id === targetGoalId ? { ...g, saved: (parseFloat(g.saved || '0') + paymentAmount).toFixed(2) } : g))
    }
    setPaidOccurrences(newPaid)
  }

  const addIncome = () => { 
    if (!newIncome.name || !newIncome.amount) return
    let finalAmount = newIncome.amount
    if (newIncome.isGross) {
      const annualGross = convertToMonthly(parseFloat(newIncome.amount), newIncome.frequency) * 12
      const tax = estimateAUTax(annualGross)
      const netRatio = tax.net / annualGross
      finalAmount = String(Math.round(parseFloat(newIncome.amount) * netRatio * 100) / 100)
    }
    setIncomeStreams([...incomeStreams, { ...newIncome, id: Date.now(), amount: finalAmount }])
    setNewIncome({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0], isGross: false })
    awardXP(15)
  }
  const deleteIncome = (id: number) => setIncomeStreams(incomeStreams.filter(i => i.id !== id))
  const addExpense = () => { if (!newExpense.name || !newExpense.amount) return; setExpenses([...expenses, { ...newExpense, id: Date.now() }]); setNewExpense({ name: '', amount: '', frequency: 'monthly', category: 'other', dueDate: new Date().toISOString().split('T')[0] }); awardXP(10) }
  const deleteExpense = (id: number) => setExpenses(expenses.filter(e => e.id !== id))
  const addDebt = () => { if (!newDebt.name || !newDebt.balance) return; setDebts([...debts, { ...newDebt, id: Date.now(), originalBalance: newDebt.balance }]); setNewDebt({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: new Date().toISOString().split('T')[0] }); awardXP(20) }
  const deleteDebt = (id: number) => setDebts(debts.filter(d => d.id !== id))
  const addGoal = () => { if (!newGoal.name || !newGoal.target) return; setGoals([...goals, { ...newGoal, saved: newGoal.saved || '0', paymentAmount: newGoal.paymentAmount || '', id: Date.now() }]); setNewGoal({ name: '', target: '', saved: '0', deadline: '', savingsFrequency: 'monthly', startDate: new Date().toISOString().split('T')[0], paymentAmount: '' }); awardXP(25) }
  const deleteGoal = (id: number) => setGoals(goals.filter(g => g.id !== id))
  const addAsset = () => { if (!newAsset.name || !newAsset.value) return; setAssets([...assets, { ...newAsset, id: Date.now() }]); setNewAsset({ name: '', value: '', type: 'savings' }) }
  const deleteAsset = (id: number) => setAssets(assets.filter(a => a.id !== id))
  const addLiability = () => { if (!newLiability.name || !newLiability.value) return; setLiabilities([...liabilities, { ...newLiability, id: Date.now() }]); setNewLiability({ name: '', value: '', type: 'loan' }) }
  const deleteLiability = (id: number) => setLiabilities(liabilities.filter(l => l.id !== id))
  const addTrade = () => { if (!newTrade.instrument) return; setTrades([...trades, { ...newTrade, id: Date.now() }].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())); setNewTrade({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '', linkedAccount: '' }) }

  const addPresetBill = (preset: any) => {
    const frequency = presetFrequencyOverrides[preset.name] || preset.frequency
    const amount = prompt(`Enter amount for ${preset.name} (${frequency}):`, preset.amount || '')
    if (!amount) return
    const dueDate = prompt('When is this due? (YYYY-MM-DD):', new Date().toISOString().split('T')[0])
    if (!dueDate) return
    setExpenses([...expenses, { id: Date.now(), name: preset.name, amount, frequency, category: preset.category, dueDate }])
    awardXP(10)
  }

  const addCustomPreset = () => {
    const name = prompt('Preset name:'); if (!name) return
    const category = prompt('Category (housing, utilities, food, transport, entertainment, shopping, health, subscriptions, other):', 'other')
    const frequency = prompt('Frequency (weekly, fortnightly, monthly, quarterly, yearly):', 'monthly')
    setCustomPresets([...customPresets, { name, amount: '', category: category || 'other', frequency: frequency || 'monthly' }])
  }
  const deleteCustomPreset = (index: number) => setCustomPresets(customPresets.filter((_, i) => i !== index))

  const addGoalAndPlanToCalendar = (goal: any) => {
    let paymentAmount = goal.paymentAmount ? parseFloat(goal.paymentAmount) : 0
    let startDate = goal.startDate || new Date().toISOString().split('T')[0]
    const frequency = goal.savingsFrequency || 'monthly'
    if (paymentAmount <= 0) {
      const calcPayment = calculateGoalPayment(goal)
      const amountInput = prompt(`How much to save per ${frequency} for "${goal.name}"?`, calcPayment > 0 ? calcPayment.toFixed(2) : '')
      if (!amountInput || parseFloat(amountInput) <= 0) return
      paymentAmount = parseFloat(amountInput)
    }
    const dateInput = prompt('When should payments start? (YYYY-MM-DD):', startDate)
    if (!dateInput) return
    startDate = dateInput
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, paymentAmount: paymentAmount.toFixed(2), startDate, savingsFrequency: frequency } : g))
    awardXP(20); triggerConfetti()
    alert(`${goal.name} is now on your calendar!\n\n$${paymentAmount.toFixed(2)} per ${frequency}\nStarting ${startDate}\n\nMark payments as done on the calendar!`)
  }

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      if (lines.length < 2) { alert('CSV file appears empty'); return }
      const header = lines[0].toLowerCase()
      const hasHeader = header.includes('date') || header.includes('description') || header.includes('amount')
      const dataLines = hasHeader ? lines.slice(1) : lines
      const transactions: any[] = []
      dataLines.forEach((line, idx) => {
        const parts: string[] = []; let current = ''; let inQuotes = false
        for (const char of line) { if (char === '"') inQuotes = !inQuotes; else if (char === ',' && !inQuotes) { parts.push(current.trim()); current = '' } else current += char }
        parts.push(current.trim())
        if (parts.length >= 2) {
          let date = '', description = '', amount = 0
          const datePatterns = [/\d{4}-\d{2}-\d{2}/, /\d{2}\/\d{2}\/\d{4}/, /\d{1,2}\/\d{1,2}\/\d{2,4}/]
          for (let i = 0; i < parts.length; i++) { for (const pattern of datePatterns) { if (pattern.test(parts[i])) { date = parts[i]; break } } if (date) break }
          for (let i = parts.length - 1; i >= 0; i--) { const cleaned = parts[i].replace(/[$,]/g, '').trim(); const num = parseFloat(cleaned); if (!isNaN(num) && num !== 0) { amount = num; break } }
          let longestText = ''
          for (const part of parts) { const cleaned = part.replace(/["']/g, '').trim(); if (cleaned.length > longestText.length && !datePatterns.some(p => p.test(cleaned)) && isNaN(parseFloat(cleaned.replace(/[$,]/g, '')))) longestText = cleaned }
          description = longestText || `Transaction ${idx + 1}`
          if (date || amount !== 0) { transactions.push({ id: Date.now() + idx, date: date || new Date().toISOString().split('T')[0], description, amount: Math.abs(amount), category: autoCategorize(description), isExpense: amount < 0, selected: amount < 0 }) }
        }
      })
      if (transactions.length === 0) { alert('Could not parse any transactions'); return }
      setCsvTransactions(transactions); setShowCsvImport(true)
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const importSelectedTransactions = () => {
    const selExp = csvTransactions.filter(t => t.selected && t.isExpense)
    const selInc = csvTransactions.filter(t => t.selected && !t.isExpense)
    if (selExp.length > 0) setExpenses(prev => [...prev, ...selExp.map(t => ({ id: Date.now() + Math.random(), name: t.description, amount: t.amount.toString(), frequency: 'once', category: t.category, dueDate: t.date }))])
    if (selInc.length > 0) setIncomeStreams(prev => [...prev, ...selInc.map(t => ({ id: Date.now() + Math.random(), name: t.description, amount: t.amount.toString(), frequency: 'once', type: 'active', startDate: t.date }))])
    alert(`Imported ${selExp.length} expenses and ${selInc.length} income items`)
    setShowCsvImport(false); setCsvTransactions([])
  }
  const updateCsvTransaction = (id: number, field: string, value: any) => setCsvTransactions(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))

  const addExtraPaymentToDebt = (debtId: number) => {
    const extra = debtExtraPayment[debtId]
    if (!extra || !extra.amount || parseFloat(extra.amount) <= 0) { alert('Please enter an extra payment amount'); return }
    const debt = debts.find(d => d.id === debtId); if (!debt) return
    const paymentDate = prompt('When should extra payment start? (YYYY-MM-DD):', new Date().toISOString().split('T')[0]); if (!paymentDate) return
    setExpenses([...expenses, { id: Date.now(), name: 'Extra → ' + debt.name, amount: extra.amount, frequency: extra.frequency, dueDate: paymentDate, targetDebtId: debt.id }])
    awardXP(30)
    alert('Power-up added! $' + extra.amount + '/' + extra.frequency + ' → ' + debt.name)
    setDebtExtraPayment(prev => ({ ...prev, [debtId]: { amount: '', frequency: 'monthly' } })); setShowExtraInput(null)
  }

  const addExtraGoalPayment = (goalId: number) => {
    if (!extraGoalPayment || parseFloat(extraGoalPayment) <= 0) { alert('Please enter an extra payment amount'); return }
    const goal = goals.find(g => g.id === goalId); if (!goal) return
    const paymentDate = prompt('When should extra goal payment start? (YYYY-MM-DD):', new Date().toISOString().split('T')[0]); if (!paymentDate) return
    setExpenses([...expenses, { id: Date.now(), name: 'Extra → ' + goal.name, amount: extraGoalPayment, frequency: 'monthly', dueDate: paymentDate, targetGoalId: goalId }])
    awardXP(25)
    alert('Boost added! $' + extraGoalPayment + '/month → ' + goal.name)
    setExtraGoalPayment(''); setSelectedGoalForExtra(null)
  }

  const calculateSingleDebtPayoff = (debt: any, includeExtras: boolean = true) => {
    const balance = parseFloat(debt.balance || '0')
    const interestRate = parseFloat(debt.interestRate || '0')
    const minPayment = convertToMonthly(parseFloat(debt.minPayment || '0'), debt.frequency || 'monthly')
    const debtExtras = includeExtras ? expenses.filter(exp => exp.targetDebtId === debt.id).reduce((sum, exp) => sum + convertToMonthly(parseFloat(exp.amount || '0'), exp.frequency), 0) : 0
    const totalPayment = minPayment + debtExtras
    const monthlyInterest = (balance * interestRate / 100) / 12
    if (totalPayment <= 0 || totalPayment < monthlyInterest * 0.99) return { monthsToPayoff: -1, totalInterestPaid: 0, error: true, extraPayments: debtExtras }
    let remainingBalance = balance, totalInterestPaid = 0, monthsToPayoff = 0
    while (remainingBalance > 0 && monthsToPayoff < 600) { monthsToPayoff++; const interest = (remainingBalance * interestRate / 100) / 12; totalInterestPaid += interest; remainingBalance = Math.max(0, remainingBalance + interest - totalPayment) }
    return { monthsToPayoff, totalInterestPaid, error: false, extraPayments: debtExtras }
  }

  const calculateTotalDebtPayoff = () => {
    let maxMonths = 0, totalInterest = 0, hasError = false
    debts.forEach(debt => { const result = calculateSingleDebtPayoff(debt, true); if (result.error) hasError = true; else { maxMonths = Math.max(maxMonths, result.monthsToPayoff); totalInterest += result.totalInterestPaid } })
    return { maxMonths, totalInterest, hasError }
  }

  const calculateGoal = () => {
    setCalculating(true)
    const target = parseFloat(goalCalculator.targetAmount || '0'); const current = parseFloat(goalCalculator.currentAmount || '0')
    const monthly = parseFloat(goalCalculator.monthlyContribution || '0'); const rate = parseFloat(goalCalculator.interestRate || '0') / 100 / 12
    const years = parseFloat(goalCalculator.years || '0')
    let months = 0, balance = current
    if (years > 0) { months = years * 12; for (let i = 0; i < months; i++) balance = balance * (1 + rate) + monthly }
    else if (monthly > 0) { while (balance < target && months < 600) { balance = balance * (1 + rate) + monthly; months++ } }
    const totalContributed = current + (monthly * months)
    setCalculatorResult({ months, futureValue: balance, totalContributed, interestEarned: balance - totalContributed, totalMonths: months })
    setCalculating(false)
  }
  const calculateForexProp = () => {
    const phase = forexProp.phase; const accountSize = parseFloat(forexProp.accountSize || '0')
    let dailyDD: number, maxDD: number, profitTarget: number, minDays: number, maxDays: number
    if (phase === 'phase1') { dailyDD = parseFloat(forexProp.phase1DailyDD || '0') / 100; maxDD = parseFloat(forexProp.phase1MaxDD || '0') / 100; profitTarget = parseFloat(forexProp.phase1Target || '0') / 100; minDays = parseInt(forexProp.phase1MinDays || '0'); maxDays = parseInt(forexProp.phase1MaxDays || '30') }
    else if (phase === 'phase2') { dailyDD = parseFloat(forexProp.phase2DailyDD || '0') / 100; maxDD = parseFloat(forexProp.phase2MaxDD || '0') / 100; profitTarget = parseFloat(forexProp.phase2Target || '0') / 100; minDays = parseInt(forexProp.phase2MinDays || '0'); maxDays = parseInt(forexProp.phase2MaxDays || '60') }
    else { dailyDD = parseFloat(forexProp.fundedDailyDD || '0') / 100; maxDD = parseFloat(forexProp.fundedMaxDD || '0') / 100; profitTarget = 0; minDays = 0; maxDays = 999 }
    const currentBalance = parseFloat(forexProp.currentBalance || '0'); const tradingDays = parseInt(forexProp.tradingDays || '0')
    const riskPerTrade = parseFloat(forexProp.riskPerTrade || '0') / 100; const tradesPerDay = parseInt(forexProp.tradesPerDay || '0')
    const winRateVal = parseFloat(forexProp.winRate || '0') / 100; const avgRR = parseFloat(forexProp.avgRR || '0'); const profitSplit = parseFloat(forexProp.profitSplit || '0') / 100
    const dailyDrawdownAmount = accountSize * dailyDD; const maxDrawdownAmount = accountSize * maxDD; const profitTargetAmount = accountSize * profitTarget
    const currentProfit = currentBalance - accountSize; const profitRemaining = phase === 'funded' ? 0 : profitTargetAmount - currentProfit
    const daysRemaining = phase === 'funded' ? 999 : maxDays - tradingDays
    const drawdownUsed = Math.max(0, accountSize - currentBalance); const drawdownRemaining = maxDrawdownAmount - drawdownUsed
    const dailyProfitNeeded = (daysRemaining > 0 && phase !== 'funded') ? profitRemaining / daysRemaining : 0
    const dailyProfitPercent = currentBalance > 0 ? (dailyProfitNeeded / currentBalance) * 100 : 0
    const maxLossesToday = dailyDrawdownAmount / (accountSize * riskPerTrade); const maxLossesTotal = drawdownRemaining / (accountSize * riskPerTrade)
    const riskPerTradeAmount = accountSize * riskPerTrade; const expectedWin = riskPerTradeAmount * avgRR
    const expectancy = (winRateVal * expectedWin) - ((1 - winRateVal) * riskPerTradeAmount)
    const dailyExpectedPL = expectancy * tradesPerDay
    const daysToTarget = (dailyExpectedPL > 0 && phase !== 'funded') ? profitRemaining / dailyExpectedPL : 0
    const profitProgress = phase === 'funded' ? 100 : profitTargetAmount > 0 ? (currentProfit / profitTargetAmount) * 100 : 0
    const dayProgress = minDays > 0 ? (tradingDays / minDays) * 100 : 100
    const onTrack = phase === 'funded' || dailyExpectedPL >= dailyProfitNeeded
    const potentialPayout = phase === 'funded' ? currentProfit * profitSplit : profitTargetAmount * profitSplit
    setForexPropResults({ phase, accountSize, dailyDrawdownAmount, maxDrawdownAmount, profitTargetAmount, currentProfit, profitRemaining, daysRemaining, drawdownUsed, drawdownRemaining, dailyProfitNeeded, dailyProfitPercent, maxLossesToday, maxLossesTotal, riskPerTradeAmount, expectancy, dailyExpectedPL, daysToTarget: Math.ceil(daysToTarget), profitProgress, dayProgress, onTrack, potentialPayout, minDaysComplete: tradingDays >= minDays, minDays, maxDays })
  }

  const calculateFuturesProp = () => {
    const phase = futuresProp.phase; const accountSize = parseFloat(futuresProp.accountSize || '0')
    let trailingDD: number, profitTarget: number, minDays: number, drawdownType: string
    if (phase === 'evaluation') { trailingDD = parseFloat(futuresProp.evalTrailingDD || '0'); profitTarget = parseFloat(futuresProp.evalProfitTarget || '0'); minDays = parseInt(futuresProp.evalMinDays || '0'); drawdownType = futuresProp.evalDrawdownType }
    else if (phase === 'pa') { trailingDD = parseFloat(futuresProp.paTrailingDD || '0'); profitTarget = parseFloat(futuresProp.paProfitTarget || '0'); minDays = parseInt(futuresProp.paMinDays || '0'); drawdownType = futuresProp.paDrawdownType }
    else { trailingDD = parseFloat(futuresProp.fundedTrailingDD || '0'); profitTarget = 0; minDays = 0; drawdownType = futuresProp.fundedDrawdownType }
    const currentBalance = parseFloat(futuresProp.currentBalance || '0'); const highWaterMark = parseFloat(futuresProp.highWaterMark || '0')
    const tradingDays = parseInt(futuresProp.tradingDays || '0'); const contractLimit = parseInt(futuresProp.contractLimit || '0')
    const riskPerTrade = parseFloat(futuresProp.riskPerTrade || '0'); const tradesPerDay = parseInt(futuresProp.tradesPerDay || '0')
    const winRateVal = parseFloat(futuresProp.winRate || '0') / 100; const avgWin = parseFloat(futuresProp.avgWin || '0'); const avgLoss = parseFloat(futuresProp.avgLoss || '0'); const profitSplit = parseFloat(futuresProp.profitSplit || '0') / 100
    const currentProfit = currentBalance - accountSize; const profitRemaining = phase === 'funded' ? 0 : profitTarget - currentProfit
    let drawdownThreshold: number, drawdownRemaining: number
    if (drawdownType === 'trailing') {
      const maxBalance = Math.max(highWaterMark, currentBalance); drawdownThreshold = maxBalance - trailingDD
      drawdownThreshold = Math.max(drawdownThreshold, accountSize - trailingDD)
      if (highWaterMark >= accountSize + trailingDD) drawdownThreshold = accountSize
      drawdownRemaining = currentBalance - drawdownThreshold
    } else { drawdownThreshold = accountSize - trailingDD; drawdownRemaining = currentBalance - drawdownThreshold }
    const maxLossesBeforeBlow = Math.floor(drawdownRemaining / riskPerTrade)
    const expectancy = (winRateVal * avgWin) - ((1 - winRateVal) * avgLoss); const dailyExpectedPL = expectancy * tradesPerDay
    const daysToTarget = (dailyExpectedPL > 0 && phase !== 'funded') ? profitRemaining / dailyExpectedPL : 0
    const profitProgress = phase === 'funded' ? 100 : profitTarget > 0 ? (currentProfit / profitTarget) * 100 : 0
    const potentialPayout = phase === 'funded' ? currentProfit * profitSplit : profitTarget * profitSplit
    const lockedAtBreakeven = highWaterMark >= accountSize + trailingDD
    const safetyMargin = riskPerTrade > 0 ? (drawdownRemaining / riskPerTrade).toFixed(1) : '0'
    setFuturesPropResults({ phase, accountSize, trailingDD, profitTarget, currentBalance, currentProfit, profitRemaining, drawdownThreshold, drawdownRemaining, maxLossesBeforeBlow, expectancy, dailyExpectedPL, daysToTarget: Math.ceil(daysToTarget), profitProgress, dayProgress: minDays > 0 ? (tradingDays / minDays) * 100 : 100, potentialPayout, lockedAtBreakeven, safetyMargin, minDaysComplete: tradingDays >= minDays, minDays, contractLimit, drawdownType, riskPerTrade })
  }

  const calculateTradingCompounding = () => {
    setCalculatingTrading(true)
    const startCap = parseFloat(tradingCalculator.startingCapital || '0'); const monthlyAdd = parseFloat(tradingCalculator.monthlyContribution || '0')
    const returnRate = parseFloat(tradingCalculator.returnRate || '0') / 100; const returnPeriod = tradingCalculator.returnPeriod
    const reinvestRate = parseFloat(tradingCalculator.reinvestRate || '100') / 100
    const yrs = parseInt(tradingCalculator.years || '0'); const mos = parseInt(tradingCalculator.months || '0'); const dys = parseInt(tradingCalculator.days || '0')
    const riskPct = parseFloat(tradingCalculator.riskPerTrade || '0'); const winRt = parseFloat(tradingCalculator.winRate || '0') / 100; const rr = parseFloat(tradingCalculator.riskReward || '0')
    const includeDays = tradingCalculator.includeDays
    const totalCalendarDays = (yrs * 365) + (mos * 30) + dys
    const tradingDaysPerWeek = includeDays.length; const tradingDaysRatio = tradingDaysPerWeek / 7
    const totalTradingDays = Math.round(totalCalendarDays * tradingDaysRatio)
    const tradingDaysPerYear = Math.round(365 * tradingDaysRatio)
    let ratePerTradingDay: number
    if (returnPeriod === 'daily') ratePerTradingDay = returnRate
    else if (returnPeriod === 'weekly') ratePerTradingDay = returnRate / tradingDaysPerWeek
    else if (returnPeriod === 'monthly') ratePerTradingDay = returnRate / Math.round(30 * tradingDaysRatio)
    else ratePerTradingDay = returnRate / tradingDaysPerYear
    const effectiveRate = ratePerTradingDay * reinvestRate
    const tradingDaysPerMonth = Math.round(30 * tradingDaysRatio)
    const contributionPerTradingDay = tradingDaysPerMonth > 0 ? monthlyAdd / tradingDaysPerMonth : 0
    let balance = startCap; const yearlyProgress: any[] = []; let currentYear = 0; let daysInCurrentYear = 0
    for (let day = 1; day <= totalTradingDays; day++) {
      balance = balance * (1 + effectiveRate) + contributionPerTradingDay; daysInCurrentYear++
      if (daysInCurrentYear >= tradingDaysPerYear || day === totalTradingDays) {
        currentYear++; const totalMonths = currentYear * 12
        const contributed = startCap + (monthlyAdd * Math.min(totalMonths, yrs * 12 + mos))
        yearlyProgress.push({ year: currentYear, value: balance, contributed, profit: balance - contributed }); daysInCurrentYear = 0
      }
    }
    const totalMonths = yrs * 12 + mos; const totalContributed = startCap + (monthlyAdd * totalMonths)
    const expectancy = (winRt * rr * riskPct) - ((1 - winRt) * riskPct)
    setTradingResults({ futureValue: balance, totalContributed, profit: balance - totalContributed, yearlyProgress, totalCalendarDays, totalTradingDays, tradingDaysPerYear, tradeStats: { expectedWinRate: winRt * 100, avgWin: rr * riskPct, avgLoss: riskPct, expectancy, tradesPerYear: 100 } })
    setCalculatingTrading(false)
  }

  const fiPath = (() => {
    const monthlyNeed = totalOutgoing; const passiveGap = monthlyNeed - passiveIncome
    const passiveCoverage = monthlyNeed > 0 ? (passiveIncome / monthlyNeed) * 100 : 0
    const fireNumber = (monthlyNeed * 12) * 25
    const currentInvestments = assets.filter(a => a.type === 'investment').reduce((sum, a) => sum + parseFloat(a.value || '0'), 0)
    const yearsToFI = monthlySurplus > 0 ? Math.ceil((fireNumber - currentInvestments) / (monthlySurplus * 6 * 12)) : 999
    return { monthlyNeed, passiveGap, passiveCoverage, fireNumber, currentInvestments, yearsToFI }
  })()

  const askBudgetCoach = async () => {
    if (!chatInput.trim()) return
    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]); setChatInput(''); setIsAskingCoach(true)
    try {
      const context = 'Income: $' + monthlyIncome.toFixed(2) + ', Expenses: $' + monthlyExpenses.toFixed(2) + ', Debt: $' + totalDebtBalance.toFixed(2)
      const response = await fetch('/api/budget-coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: chatInput, financialContext: context }) })
      const data = await response.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.advice || 'Sorry, I could not respond.' }])
    } catch(err) { setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]) }
    finally { setIsAskingCoach(false) }
  }

  const renderCalendarItem = (item: any, compact: boolean = false) => (
    <div key={item.id} style={{ fontSize: compact ? '11px' : '13px', padding: compact ? '4px 6px' : '8px 10px', marginBottom: '4px', background: item.isPaid ? (darkMode ? '#334155' : '#d1d5db') : item.type === 'goal' ? '#ede9fe' : item.type === 'debt' ? '#fee2e2' : item.type === 'income' ? '#d1fae5' : (item.sourceType === 'extraDebt' || item.sourceType === 'extraGoal') ? '#f3e8ff' : '#dbeafe', color: item.isPaid ? theme.textMuted : '#1e293b', borderRadius: '6px', opacity: item.isPaid ? 0.7 : 1, border: '1px solid rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, textDecoration: item.isPaid ? 'line-through' : 'none' }}>{item.name}</div>
        <div style={{ fontSize: compact ? '9px' : '11px', color: '#666' }}>${parseFloat(item.amount || '0').toFixed(0)}</div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); togglePaid(item.id, item.sourceType, item.sourceId, parseFloat(item.amount || '0'), item.targetDebtId, item.targetGoalId) }} style={{ padding: compact ? '4px 8px' : '6px 12px', background: item.isPaid ? '#6b7280' : (item.sourceType === 'extraDebt' || item.sourceType === 'extraGoal' || item.sourceType === 'goal') ? '#8b5cf6' : '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: compact ? '10px' : '12px', fontWeight: 700, flexShrink: 0 }}>{item.isPaid ? '✓' : 'PAY'}</button>
    </div>
  )
  if (showModeSelector) {
    return (
      <div style={{ minHeight: '100vh', background: darkMode ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        {xpPoints > 0 && (
          <div style={{ position: 'fixed' as const, top: '20px', right: '20px', padding: '12px 20px', background: theme.cardBg, borderRadius: '12px', border: '2px solid ' + currentLevel.color, zIndex: 50 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><span style={{ fontSize: '16px' }}>{currentLevel.title}</span><span style={{ color: currentLevel.color, fontWeight: 700, fontSize: '14px' }}>Lv.{currentLevel.level}</span></div>
            <div style={{ width: '120px', height: '6px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: Math.min(xpProgress, 100) + '%', height: '100%', background: currentLevel.color, borderRadius: '3px' }} /></div>
            <div style={{ fontSize: '10px', color: theme.textMuted, marginTop: '2px' }}>{xpPoints} XP</div>
          </div>
        )}
        <div style={{ textAlign: 'center' as const, marginBottom: '48px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', boxShadow: '0 4px 20px rgba(251,191,36,0.5), inset 0 2px 4px rgba(255,255,255,0.3)', border: '3px solid #f59e0b', margin: '0 auto 20px' }}>⚜</div>
          <h1 style={{ fontSize: '48px', fontWeight: 900, margin: '0 0 8px 0', letterSpacing: '3px' }}><span style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AUREUS</span></h1>
          <p style={{ fontSize: '16px', color: theme.textMuted, margin: '0 0 24px 0', letterSpacing: '2px', textTransform: 'uppercase' as const }}>Your Wealth. Your Way.</p>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: theme.text, margin: '0 0 8px 0' }}>Welcome{user?.firstName ? `, ${user.firstName}` : ''}! 👋</h2>
          <p style={{ fontSize: '16px', color: theme.textMuted, margin: 0 }}>What are we working on today?</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', maxWidth: '800px', width: '100%' }}>
          <button onClick={() => { setAppMode('budget'); setShowModeSelector(false); setActiveTab('dashboard') }} style={{ padding: '40px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '24px', border: 'none', cursor: 'pointer', textAlign: 'left' as const, boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
            <h2 style={{ color: 'white', fontSize: '28px', fontWeight: 700, margin: '0 0 12px 0' }}>Budget Mode</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', margin: 0, lineHeight: 1.5 }}>Track spending, crush debt, build savings, and feel calm about your money</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>{['Income', 'Expenses', 'Debts', 'Goals', 'Calendar'].map(t => <span key={t} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', color: 'white' }}>{t}</span>)}</div>
          </button>
          <button onClick={() => { setAppMode('trading'); setShowModeSelector(false); setActiveTab('trading') }} style={{ padding: '40px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '24px', border: 'none', cursor: 'pointer', textAlign: 'left' as const, boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
            <h2 style={{ color: 'white', fontSize: '28px', fontWeight: 700, margin: '0 0 12px 0' }}>Trading Mode</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', margin: 0, lineHeight: 1.5 }}>Plan prop challenges, track performance, and execute your trading strategy</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>{['Journal', 'Props', 'Analytics', 'Psychology', 'Risk', 'Compounding'].map(t => <span key={t} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', color: 'white' }}>{t}</span>)}</div>
          </button>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <button onClick={() => { setTourActive(true); setTourStep(0); setShowModeSelector(false); setActiveTab('dashboard') }} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, boxShadow: '0 4px 12px rgba(251,191,36,0.2)' }}>🎬 Take the Tour</button>
          <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '12px 24px', background: 'transparent', border: '2px solid ' + theme.border, borderRadius: '12px', color: theme.textMuted, cursor: 'pointer', fontSize: '14px' }}>{darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      {showConfetti && (<div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' as const, zIndex: 9999 }}>{Array.from({ length: 50 }).map((_, i) => (<div key={i} style={{ position: 'absolute' as const, left: Math.random()*100+'%', top: '-10px', width: Math.random()*10+5+'px', height: Math.random()*10+5+'px', background: ['#f59e0b','#10b981','#8b5cf6','#ef4444','#3b82f6','#f472b6'][Math.floor(Math.random()*6)], borderRadius: Math.random()>0.5?'50%':'2px', animation: `confettiFall ${Math.random()*2+1.5}s ease-in forwards`, animationDelay: Math.random()*0.5+'s' }} />))}<style>{`@keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
@keyframes confettiFall { 0%{transform:translateY(-10px) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }`}</style></div>)}
      {tourActive && (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: darkMode ? 'linear-gradient(135deg, #1e293b, #1e1b4b)' : 'white', borderRadius: '24px', padding: '32px', maxWidth: '560px', width: '100%', boxShadow: '0 25px 80px rgba(0,0,0,0.4)', border: '2px solid ' + theme.accent + '40', position: 'relative' as const }}>
            <div style={{ position: 'absolute' as const, top: '16px', right: '16px' }}>
              <button onClick={() => { setTourActive(false); setTourStep(0) }} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
              {tourSteps.map((_, i) => (<div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= tourStep ? 'linear-gradient(135deg, #fbbf24, #d97706)' : (darkMode ? '#334155' : '#e2e8f0'), transition: 'all 0.3s' }} />))}
            </div>
            <div style={{ textAlign: 'center' as const, marginBottom: '20px' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px', boxShadow: '0 4px 20px rgba(251,191,36,0.3)' }}>{tourSteps[tourStep].icon}</div>
              <h2 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '22px', fontWeight: 800 }}>{tourSteps[tourStep].title}</h2>
              <div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>Step {tourStep + 1} of {tourSteps.length}</div>
            </div>
            <div style={{ color: theme.text, fontSize: '14px', lineHeight: 1.8, whiteSpace: 'pre-line' as const, marginBottom: '28px', padding: '0 8px', maxHeight: '300px', overflowY: 'auto' as const }}>{tourSteps[tourStep].body}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={prevTourStep} disabled={tourStep === 0} style={{ padding: '10px 20px', background: 'transparent', color: tourStep === 0 ? theme.textMuted + '40' : theme.textMuted, border: '1px solid ' + theme.border, borderRadius: '10px', cursor: tourStep === 0 ? 'default' : 'pointer', fontSize: '13px', fontWeight: 600 }}>← Back</button>
              <button onClick={() => { setTourActive(false); setTourStep(0) }} style={{ padding: '8px 16px', background: 'transparent', color: theme.textMuted, border: 'none', cursor: 'pointer', fontSize: '12px' }}>Skip Tour</button>
              <button onClick={nextTourStep} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 12px rgba(251,191,36,0.3)' }}>{tourStep === tourSteps.length - 1 ? '🎉 Finish Tour (+50 XP)' : 'Next →'}</button>
            </div>
          </div>
        </div>
      )}
      {showLevelUp && (<div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998, pointerEvents: 'none' as const }}><div style={{ padding: '32px 48px', background: 'linear-gradient(135deg, '+currentLevel.color+', '+theme.purple+')', borderRadius: '24px', textAlign: 'center' as const, animation: 'levelUp 3s ease forwards', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}><div style={{ fontSize: '64px', marginBottom: '12px' }}>🎉</div><div style={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>LEVEL UP!</div><div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '22px', fontWeight: 600, marginTop: '8px' }}>{currentLevel.title}</div></div><style>{`@keyframes levelUp { 0%{transform:scale(.5);opacity:0} 20%{transform:scale(1.1);opacity:1} 80%{transform:scale(1);opacity:1} 100%{transform:scale(.8);opacity:0} }`}</style></div>)}
      {newAchievement && (<div style={{ position: 'fixed' as const, top: '80px', right: '20px', zIndex: 9997, padding: '16px 24px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', animation: 'slideIn 0.3s ease' }}><div style={{ color: '#1e293b', fontWeight: 700, fontSize: '14px' }}>🏆 Achievement Unlocked!</div><div style={{ color: '#1e293b', fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>{newAchievement}</div><div style={{ color: '#92400e', fontSize: '11px', marginTop: '2px' }}>+50 XP</div><style>{`@keyframes slideIn { 0%{transform:translateX(100px);opacity:0} 100%{transform:translateX(0);opacity:1} }`}</style></div>)}

      {expandedDay && (<div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setExpandedDay(null)}><div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>📅 {calendarMonth.toLocaleDateString('en-US', { month: 'long' })} {expandedDay.day}</h3><button onClick={() => setExpandedDay(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.textMuted }}>×</button></div><div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>{expandedDay.items.length === 0 ? <div style={{ color: theme.textMuted, textAlign: 'center' as const, padding: '20px' }}>No items</div> : expandedDay.items.map(item => renderCalendarItem(item, false))}</div></div></div>)}

      {showCsvImport && (<div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowCsvImport(false)}><div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '800px', width: '95%', maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}><h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>📤 Import Bank Transactions</h3><button onClick={() => setShowCsvImport(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.textMuted }}>×</button></div><div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}><button onClick={() => setCsvTransactions(prev => prev.map(t => ({ ...t, selected: t.isExpense })))} style={{ ...btnPrimary, padding: '8px 16px', fontSize: '12px' }}>Select Expenses</button><button onClick={() => setCsvTransactions(prev => prev.map(t => ({ ...t, selected: true })))} style={{ ...btnPrimary, padding: '8px 16px', fontSize: '12px', background: theme.purple }}>Select All</button><button onClick={() => setCsvTransactions(prev => prev.map(t => ({ ...t, selected: false })))} style={{ ...btnPrimary, padding: '8px 16px', fontSize: '12px', background: theme.textMuted }}>Select None</button></div><div style={{ maxHeight: '400px', overflowY: 'auto' as const, marginBottom: '20px' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ borderBottom: '2px solid ' + theme.border }}>{['✓','Date','Description','Amount','Category','Type'].map(h => <th key={h} style={{ padding: '8px', textAlign: 'left' as const, color: theme.textMuted, fontSize: '12px' }}>{h}</th>)}</tr></thead><tbody>{csvTransactions.map(t => (<tr key={t.id} style={{ borderBottom: '1px solid ' + theme.border, background: t.selected ? (darkMode ? '#1e3a5f' : '#eff6ff') : 'transparent' }}><td style={{ padding: '8px' }}><input type="checkbox" checked={t.selected} onChange={(e) => updateCsvTransaction(t.id, 'selected', e.target.checked)} /></td><td style={{ padding: '8px', color: theme.text, fontSize: '12px' }}>{t.date}</td><td style={{ padding: '8px', color: theme.text, fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{t.description}</td><td style={{ padding: '8px', color: t.isExpense ? theme.danger : theme.success, fontSize: '12px', fontWeight: 600 }}>{t.isExpense ? '-' : '+'}${t.amount.toFixed(2)}</td><td style={{ padding: '8px' }}><select value={t.category} onChange={(e) => updateCsvTransaction(t.id, 'category', e.target.value)} style={{ ...inputStyle, padding: '4px 8px', fontSize: '11px' }}>{expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></td><td style={{ padding: '8px' }}><button onClick={() => updateCsvTransaction(t.id, 'isExpense', !t.isExpense)} style={{ padding: '4px 8px', background: t.isExpense ? theme.danger : theme.success, color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>{t.isExpense ? 'Expense' : 'Income'}</button></td></tr>))}</tbody></table></div><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: theme.textMuted, fontSize: '13px' }}>{csvTransactions.filter(t => t.selected).length} of {csvTransactions.length} selected</span><div style={{ display: 'flex', gap: '8px' }}><button onClick={() => setShowCsvImport(false)} style={{ ...btnPrimary, background: theme.textMuted }}>Cancel</button><button onClick={importSelectedTransactions} style={btnSuccess}>Import Selected</button></div></div></div></div>)}

      <header style={{ padding: '16px 24px', background: theme.cardBg, borderBottom: '1px solid ' + theme.border, position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setShowModeSelector(true)} style={{ padding: '10px 16px', background: appMode === 'budget' ? theme.success : theme.warning, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>{appMode === 'budget' ? '💰' : '📈'} {appMode === 'budget' ? 'Budget' : 'Trading'} ▼</button>
            <h1 style={{ margin: 0, color: theme.text, fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 2px 8px rgba(251,191,36,0.4), inset 0 1px 2px rgba(255,255,255,0.3)', border: '2px solid #f59e0b' }}>⚜</div><span style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '1px' }}>AUREUS</span></h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: darkMode ? '#334155' : '#f1f5f9', borderRadius: '10px', border: '2px solid ' + currentLevel.color }}>
            <span style={{ fontSize: '13px' }}>{currentLevel.title}</span>
            <div style={{ width: '60px', height: '6px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: Math.min(xpProgress, 100) + '%', height: '100%', background: currentLevel.color, borderRadius: '3px' }} /></div>
            <span style={{ color: currentLevel.color, fontSize: '11px', fontWeight: 700 }}>{xpPoints}XP</span>
          </div>
          <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
            {[{ id: 'dashboard', label: '📊 Dashboard', color: theme.accent }, { id: 'overview', label: '💎 Overview', color: theme.purple }, { id: 'path', label: '🎯 Path', color: theme.success }, { id: 'trading', label: '📋 Trade Prep', color: theme.warning }, { id: 'tradingAnalytics', label: '📊 Analytics', color: theme.accent }, { id: 'guide', label: '📖 Guide', color: '#f472b6' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{ padding: '8px 16px', background: activeTab === tab.id ? tab.color : 'transparent', color: activeTab === tab.id ? 'white' : theme.textMuted, border: activeTab === tab.id ? 'none' : '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>{tab.label}</button>
            ))}
          </nav>
          <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '8px 14px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.textMuted, fontSize: '14px' }}>{darkMode ? '☀️' : '🌙'}</button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            {/* This Month Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ padding: '20px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '16px' }}><div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Income This Month</div><div style={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>${currentMonthTotals.incomeTotal.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '16px' }}><div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Expenses This Month</div><div style={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>${currentMonthTotals.expenseTotal.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: '16px' }}><div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Debt Payments</div><div style={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>${currentMonthTotals.debtTotal.toFixed(0)}</div></div>
              <div style={{ padding: '20px', background: currentMonthTotals.total >= 0 ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'linear-gradient(135deg, #ef4444, #b91c1c)', borderRadius: '16px' }}><div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Net This Month</div><div style={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>${currentMonthTotals.total.toFixed(0)}</div></div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {[{ label: 'Avg Monthly In', value: '$' + monthlyIncome.toFixed(0), color: theme.success }, { label: 'Avg Monthly Out', value: '$' + totalOutgoing.toFixed(0), color: theme.danger }, { label: 'Avg Surplus', value: '$' + monthlySurplus.toFixed(0), color: monthlySurplus >= 0 ? theme.success : theme.danger }, { label: 'Total Debt', value: '$' + totalDebtBalance.toFixed(0), color: theme.danger }].map((s, i) => (
                <div key={i} style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', border: '1px solid ' + theme.border, textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>{s.label}</div><div style={{ color: s.color, fontSize: '22px', fontWeight: 700 }}>{s.value}</div></div>
              ))}
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 12px 0', color: theme.warning, fontSize: '16px' }}>⚠️ Alerts</h3>
                {alerts.map((a, i) => (<div key={i} style={{ padding: '10px 14px', background: a.severity === 'danger' ? theme.danger + '15' : theme.warning + '15', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: theme.text, fontSize: '14px' }}>{a.severity === 'danger' ? '🔴' : '🟡'} {a.message}</span><span style={{ color: a.severity === 'danger' ? theme.danger : theme.warning, fontWeight: 700 }}>${a.amount}</span></div>))}
              </div>
            )}

            {/* Income */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: theme.success, fontSize: '18px' }}>💰 Income Streams</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setShowIncomePresets(!showIncomePresets)} style={{ padding: '6px 14px', background: showIncomePresets ? theme.success : 'transparent', color: showIncomePresets ? 'white' : theme.textMuted, border: '1px solid ' + theme.border, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>📋 Presets</button>
                  <input type="file" accept=".csv" id="payslipInput" onChange={handlePayslipCsv} style={{ display: 'none' }} />
                  <button onClick={() => (document.getElementById('payslipInput') as HTMLInputElement)?.click()} style={{ padding: '6px 14px', background: 'transparent', color: theme.textMuted, border: '1px solid ' + theme.border, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }} title="Upload a payslip CSV to auto-extract salary, super, tax, and leave">📄 Payslip</button>
                  <button onClick={() => setTradingPayoutsAsIncome(!tradingPayoutsAsIncome)} style={{ padding: '6px 14px', background: tradingPayoutsAsIncome ? theme.warning : 'transparent', color: tradingPayoutsAsIncome ? 'white' : theme.textMuted, border: '1px solid ' + theme.border, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }} title="Include trading payouts as passive income">📈 {tradingPayoutsAsIncome ? 'Payouts ON' : 'Payouts OFF'}</button>
                </div>
              </div>
              {showIncomePresets && (
                <div style={{ padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', marginBottom: '16px', maxHeight: '400px', overflowY: 'auto' as const }}>
                  {pendingPreset && (
                    <div style={{ padding: '16px', background: darkMode ? '#1e293b' : 'white', borderRadius: '12px', marginBottom: '16px', border: '2px solid ' + theme.accent }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ color: theme.text, fontWeight: 700, fontSize: '15px' }}>{pendingPreset.type === 'passive' ? '🌴' : '🏃'} {pendingPreset.name}</span>
                        <button onClick={() => setPendingPreset(null)} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '18px' }}>✕</button>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, alignItems: 'end' }}>
                        <div style={{ flex: 1, minWidth: '100px' }}>
                          <label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '4px' }}>Amount ($)</label>
                          <input type="number" placeholder="0.00" value={presetForm.amount} onChange={(e) => setPresetForm({ ...presetForm, amount: e.target.value })} style={{ ...inputStyle, width: '100%' }} autoFocus />
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '4px' }}>Tax</label>
                          <button onClick={() => setPresetForm({ ...presetForm, isGross: !presetForm.isGross })} style={{ padding: '8px 12px', background: presetForm.isGross ? theme.warning : theme.success, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' as const }}>{presetForm.isGross ? '💰 Before Tax' : '✅ After Tax'}</button>
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '4px' }}>Frequency</label>
                          <select value={presetForm.frequency} onChange={(e) => setPresetForm({ ...presetForm, frequency: e.target.value })} style={{ ...inputStyle, padding: '8px' }}>
                            <option value="weekly">Weekly</option>
                            <option value="fortnightly">Fortnightly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                            <option value="once">One-time</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '4px' }}>Start Date (optional)</label>
                          <input type="date" value={presetForm.startDate} onChange={(e) => setPresetForm({ ...presetForm, startDate: e.target.value })} style={{ ...inputStyle, padding: '7px 8px' }} />
                        </div>
                        <button onClick={confirmIncomePreset} style={{ padding: '8px 20px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>Add ✓</button>
                      </div>
                      {presetForm.isGross && presetForm.amount && parseFloat(presetForm.amount) > 0 && (() => {
                        const annualGross = convertToMonthly(parseFloat(presetForm.amount), presetForm.frequency) * 12
                        const tax = estimateAUTax(annualGross)
                        const netRatio = annualGross > 0 ? tax.net / annualGross : 1
                        const netAmount = parseFloat(presetForm.amount) * netRatio
                        return (
                          <div style={{ marginTop: '10px', padding: '10px 14px', background: theme.warning + '10', borderRadius: '8px', border: '1px solid ' + theme.warning + '30', fontSize: '12px' }}>
                            <span style={{ color: theme.warning, fontWeight: 700 }}>Tax estimate: </span>
                            <span style={{ color: theme.text }}>${parseFloat(presetForm.amount).toFixed(2)} gross → </span>
                            <span style={{ color: theme.success, fontWeight: 700 }}>${netAmount.toFixed(2)} net</span>
                            <span style={{ color: theme.textMuted }}> per {presetForm.frequency} ({tax.effectiveRate.toFixed(1)}% effective rate)</span>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '8px', fontWeight: 600 }}>🏃 Active Income</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px', marginBottom: '12px' }}>
                    {incomePresets.filter(p => p.type === 'active').map((p, i) => (<button key={i} onClick={() => addIncomePreset(p)} style={{ padding: '6px 12px', background: pendingPreset?.name === p.name ? theme.accent : darkMode ? '#1e293b' : 'white', border: '1px solid ' + (pendingPreset?.name === p.name ? theme.accent : theme.border), borderRadius: '8px', cursor: 'pointer', color: pendingPreset?.name === p.name ? 'white' : theme.text, fontSize: '12px' }} title={'Add ' + p.name + ' as ' + p.frequency + ' income'}>{p.name}</button>))}
                  </div>
                  <div style={{ fontSize: '12px', color: theme.success, marginBottom: '8px', fontWeight: 600 }}>🌴 Passive Income (from Quest Board)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
                    {incomePresets.filter(p => p.type === 'passive').map((p, i) => (<button key={i} onClick={() => addIncomePreset(p)} style={{ padding: '6px 12px', background: pendingPreset?.name === p.name ? theme.success : darkMode ? '#1e3a32' : '#f0fdf4', border: '1px solid ' + (pendingPreset?.name === p.name ? theme.success : theme.success + '30'), borderRadius: '8px', cursor: 'pointer', color: pendingPreset?.name === p.name ? 'white' : theme.success, fontSize: '12px' }} title={'Add ' + p.name + ' — ' + p.frequency}>🌴 {p.name}</button>))}
                  </div>
                </div>
              )}
              {payslipData && (
                <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, '+theme.success+'15, '+theme.accent+'15)', borderRadius: '12px', marginBottom: '16px', border: '1px solid '+theme.success+'30' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}><span style={{ color: theme.text, fontWeight: 700, fontSize: '14px' }}>📄 Payslip Summary</span><button onClick={() => setPayslipData(null)} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '12px' }}>✕</button></div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ textAlign: 'center' as const }}><div style={{ fontSize: '10px', color: theme.textMuted }}>Gross</div><div style={{ color: theme.text, fontWeight: 700 }}>${payslipData.gross.toFixed(0)}</div></div>
                    <div style={{ textAlign: 'center' as const }}><div style={{ fontSize: '10px', color: theme.textMuted }}>Tax</div><div style={{ color: theme.danger, fontWeight: 700 }}>${payslipData.tax.toFixed(0)}</div></div>
                    <div style={{ textAlign: 'center' as const }}><div style={{ fontSize: '10px', color: theme.textMuted }}>Super</div><div style={{ color: theme.purple, fontWeight: 700 }}>${payslipData.super_.toFixed(0)}</div></div>
                    <div style={{ textAlign: 'center' as const }}><div style={{ fontSize: '10px', color: theme.textMuted }}>Net</div><div style={{ color: theme.success, fontWeight: 700 }}>${payslipData.net.toFixed(0)}</div></div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                    <span style={{ color: theme.textMuted }}>Annual Leave: <span style={{ color: theme.success, fontWeight: 600 }}>{payslipData.leave.annual}h</span></span>
                    <span style={{ color: theme.textMuted }}>Sick Leave: <span style={{ color: theme.warning, fontWeight: 600 }}>{payslipData.leave.sick}h</span></span>
                    <span style={{ color: theme.textMuted }}>LSL: <span style={{ color: theme.purple, fontWeight: 600 }}>{payslipData.leave.long_service}h</span></span>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                <button onClick={() => setShowTaxEstimator(!showTaxEstimator)} style={{ padding: '4px 10px', background: showTaxEstimator ? theme.purple : 'transparent', color: showTaxEstimator ? 'white' : theme.textMuted, border: '1px solid ' + theme.border, borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>🧾 Tax Estimator</button>
              </div>
              {showTaxEstimator && (() => {
                const annualGross = monthlyIncome * 12
                const tax = estimateAUTax(annualGross)
                return (
                  <div style={{ padding: '16px', background: darkMode ? '#1e1b4b' : '#faf5ff', borderRadius: '12px', marginBottom: '12px', border: '1px solid ' + theme.purple + '30' }}>
                    <div style={{ color: theme.purple, fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>🧾 Australian Tax Estimate ({new Date().getFullYear()}-{new Date().getFullYear()+1} FY)</div>
                    {annualGross > 0 ? (<>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ padding: '12px', background: darkMode ? '#0f172a' : 'white', borderRadius: '10px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Gross Annual</div><div style={{ color: theme.text, fontSize: '20px', fontWeight: 800 }}>${annualGross.toLocaleString()}</div></div>
                        <div style={{ padding: '12px', background: darkMode ? '#0f172a' : 'white', borderRadius: '10px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Income Tax</div><div style={{ color: theme.danger, fontSize: '20px', fontWeight: 800 }}>-${Math.round(tax.tax).toLocaleString()}</div></div>
                        <div style={{ padding: '12px', background: darkMode ? '#0f172a' : 'white', borderRadius: '10px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Medicare Levy</div><div style={{ color: theme.warning, fontSize: '20px', fontWeight: 800 }}>-${Math.round(tax.medicare).toLocaleString()}</div></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <div style={{ padding: '12px', background: darkMode ? '#0f172a' : 'white', borderRadius: '10px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Take Home (Annual)</div><div style={{ color: theme.success, fontSize: '20px', fontWeight: 800 }}>${Math.round(tax.net).toLocaleString()}</div></div>
                        <div style={{ padding: '12px', background: darkMode ? '#0f172a' : 'white', borderRadius: '10px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Take Home (Monthly)</div><div style={{ color: theme.success, fontSize: '20px', fontWeight: 800 }}>${Math.round(tax.net/12).toLocaleString()}</div></div>
                        <div style={{ padding: '12px', background: darkMode ? '#0f172a' : 'white', borderRadius: '10px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Effective Tax Rate</div><div style={{ color: theme.purple, fontSize: '20px', fontWeight: 800 }}>{tax.effectiveRate.toFixed(1)}%</div></div>
                      </div>
                      <div style={{ marginTop: '12px', padding: '10px 14px', background: theme.accent + '10', borderRadius: '8px', borderLeft: '3px solid ' + theme.accent }}>
                        <div style={{ color: theme.accent, fontSize: '12px', fontWeight: 600 }}>💡 Super (11.5%): ${Math.round(tax.super_).toLocaleString()}/yr from your employer — check this is being paid!</div>
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '10px', color: theme.textMuted }}>Based on 2024-25 ATO tax brackets. Estimate only — does not include HECS, offsets, or deductions.</div>
                    </>) : (<div style={{ color: theme.textMuted, fontSize: '13px', textAlign: 'center' as const, padding: '16px' }}>Add income streams above to see your tax estimate</div>)}
                  </div>
                )
              })()}
              {tradingPayoutsAsIncome && propPayouts.length > 0 && (
                <div style={{ padding: '10px 14px', background: theme.warning+'15', borderRadius: '8px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid '+theme.warning+'30' }}>
                  <span style={{ color: theme.warning, fontSize: '13px', fontWeight: 600 }}>📈 Trading Payouts included as passive income</span>
                  <span style={{ color: theme.success, fontWeight: 700 }}>${propPayouts.reduce((s: number, p: any) => s + parseFloat(p.amount||'0'), 0).toFixed(0)} total</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' as const }}>
                <input type="text" placeholder="Name" title="Name of income source (e.g. 'Salary', 'Dividends', 'Rental Income')" value={newIncome.name} onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 100px' }} />
                <input type="number" placeholder="Amount $" title="Amount per payment in AUD" value={newIncome.amount} onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
                <button onClick={() => setNewIncome({ ...newIncome, isGross: !newIncome.isGross })} style={{ padding: '6px 10px', background: newIncome.isGross ? theme.warning : theme.success, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap' as const }} title={newIncome.isGross ? 'Amount is BEFORE tax — we\'ll calculate net for you' : 'Amount is AFTER tax (take-home pay)'}>{newIncome.isGross ? '💰 Gross' : '✅ Net'}</button>
                <select value={newIncome.frequency} onChange={(e) => setNewIncome({ ...newIncome, frequency: e.target.value })} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                <select value={newIncome.type} onChange={(e) => setNewIncome({ ...newIncome, type: e.target.value })} style={inputStyle}><option value="active">🏃 Active</option><option value="passive">🌴 Passive</option></select>
                <input type="date" value={newIncome.startDate} onChange={(e) => setNewIncome({ ...newIncome, startDate: e.target.value })} style={inputStyle} />
                <button onClick={addIncome} style={btnSuccess}>Add</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                {incomeStreams.map(inc => (<div key={inc.id} style={{ padding: '12px 14px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><span style={{ color: theme.text, fontWeight: 600 }}>{inc.type === 'passive' ? '🌴' : '🏃'} {inc.name}</span><span style={{ color: theme.textMuted, marginLeft: '8px', fontSize: '12px' }}>${inc.amount}/{inc.frequency} → ${convertToMonthly(parseFloat(inc.amount), inc.frequency).toFixed(0)}/mo</span></div><button onClick={() => deleteIncome(inc.id)} style={{ padding: '6px 12px', background: theme.danger, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Delete</button></div>))}
              </div>
            </div>

            {/* Expenses */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: theme.accent, fontSize: '18px' }}>💸 Expenses & Bills</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setShowPresets(!showPresets)} style={{ padding: '6px 14px', background: showPresets ? theme.purple : 'transparent', color: showPresets ? 'white' : theme.textMuted, border: '1px solid ' + theme.border, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>📋 Presets</button>
                  <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCsvUpload} style={{ display: 'none' }} />
                  <button onClick={() => fileInputRef.current?.click()} style={{ padding: '6px 14px', background: 'transparent', color: theme.textMuted, border: '1px solid ' + theme.border, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>📤 CSV</button>
                </div>
              </div>
              {showPresets && (
                <div style={{ padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><span style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>Quick Add Presets</span><button onClick={addCustomPreset} style={{ padding: '4px 10px', background: theme.purple, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>+ Custom</button></div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px', maxHeight: '300px', overflowY: 'auto' as const }}>
                    {[...presetBills, ...customPresets].map((preset, idx) => {
                      const isCustom = idx >= presetBills.length
                      const freq = presetFrequencyOverrides[preset.name] || preset.frequency
                      return (
                        <div key={preset.name + idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button onClick={() => addPresetBill({ ...preset, frequency: freq })} style={{ flex: 1, padding: '8px 12px', background: darkMode ? '#1e293b' : 'white', border: '1px solid ' + theme.border, borderRadius: '6px', cursor: 'pointer', textAlign: 'left' as const, color: theme.text, fontSize: '13px' }}>{preset.name}{preset.amount ? ` ($${preset.amount})` : ''}</button>
                          <select value={freq} onChange={(e) => setPresetFrequencyOverrides(prev => ({ ...prev, [preset.name]: e.target.value }))} style={{ padding: '6px', background: theme.input, color: theme.text, border: '1px solid ' + theme.inputBorder, borderRadius: '4px', fontSize: '11px', width: '55px' }}><option value="weekly">W</option><option value="fortnightly">FN</option><option value="monthly">M</option><option value="quarterly">Q</option><option value="yearly">Y</option></select>
                          {isCustom && <button onClick={() => deleteCustomPreset(idx - presetBills.length)} style={{ padding: '4px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>✕</button>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' as const }}>
                <input type="text" placeholder="Expense name" title="Name of bill or expense (e.g. 'Rent', 'Netflix', 'Groceries')" value={newExpense.name} onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 100px' }} />
                <input type="number" placeholder="Amount $" title="Amount per payment in AUD" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
                <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} style={inputStyle}>{expenseCategories.filter(c => c !== 'income' && c !== 'transfer').map(c => <option key={c} value={c}>{c}</option>)}</select>
                <select value={newExpense.frequency} onChange={(e) => setNewExpense({ ...newExpense, frequency: e.target.value })} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select>
                <input type="date" value={newExpense.dueDate} onChange={(e) => setNewExpense({ ...newExpense, dueDate: e.target.value })} style={inputStyle} />
                <button onClick={addExpense} style={btnPrimary}>Add</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                {expenses.filter(e => !e.targetDebtId && !e.targetGoalId).map(exp => (<div key={exp.id} style={{ padding: '12px 14px', background: darkMode ? '#1e293b' : '#eff6ff', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><span style={{ color: theme.text, fontWeight: 600 }}>{exp.name}</span><span style={{ color: theme.textMuted, marginLeft: '8px', fontSize: '12px' }}>${exp.amount}/{exp.frequency} • {exp.category}</span></div><button onClick={() => deleteExpense(exp.id)} style={{ padding: '6px 12px', background: theme.danger, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Delete</button></div>))}
              </div>
            </div>

            {/* Calendar */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <button onClick={prevMonth} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text }}>← Prev</button>
                <h3 style={{ margin: 0, color: theme.text, fontSize: '18px' }}>{calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={nextMonth} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '8px', cursor: 'pointer', color: theme.text }}>Next →</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} style={{ padding: '8px', textAlign: 'center' as const, color: theme.textMuted, fontWeight: 600, fontSize: '12px' }}>{d}</div>)}
                {(() => {
                  const { firstDay, daysInMonth, month, year } = getDaysInMonth()
                  const today = new Date(); const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year
                  const cells: any[] = []
                  for (let i = 0; i < firstDay; i++) cells.push(<div key={'empty-' + i} />)
                  for (let day = 1; day <= daysInMonth; day++) {
                    const items = getCalendarItemsForDay(day)
                    const unpaidCount = items.filter(i => !i.isPaid).length
                    const isToday = isCurrentMonth && today.getDate() === day
                    cells.push(
                      <div key={day} onClick={() => setExpandedDay({ day, items })} style={{ padding: '6px', minHeight: '80px', background: isToday ? (darkMode ? '#1e3a5f' : '#eff6ff') : (darkMode ? '#1e293b' : '#fafafa'), borderRadius: '8px', cursor: 'pointer', border: isToday ? '2px solid ' + theme.accent : '1px solid ' + theme.border, position: 'relative' as const, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ color: isToday ? theme.accent : theme.text, fontWeight: isToday ? 700 : 500, fontSize: '13px' }}>{day}</span>
                          {unpaidCount > 0 && <span style={{ background: theme.success, color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>{unpaidCount}</span>}
                        </div>
                        {items.slice(0, 2).map(item => renderCalendarItem(item, true))}
                        {items.length > 2 && <div style={{ fontSize: '10px', color: theme.textMuted, textAlign: 'center' as const }}>+{items.length - 2} more</div>}
                      </div>
                    )
                  }
                  return cells
                })()}
              </div>
            </div>
            {/* ===== DEBT BOSS BATTLES ===== */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>⚔️ Debt Boss Battles</h2>
                {debts.length > 0 && (<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: theme.textMuted, fontSize: '12px' }}>Strategy:</span><button onClick={() => setPayoffMethod('avalanche')} style={{ padding: '4px 10px', background: payoffMethod === 'avalanche' ? theme.danger : 'transparent', color: payoffMethod === 'avalanche' ? 'white' : theme.text, border: '1px solid '+theme.border, borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>🏔️ Avalanche</button><button onClick={() => setPayoffMethod('snowball')} style={{ padding: '4px 10px', background: payoffMethod === 'snowball' ? theme.accent : 'transparent', color: payoffMethod === 'snowball' ? 'white' : theme.text, border: '1px solid '+theme.border, borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>⛄ Snowball</button></div>)}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' as const, padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
                <input type="text" placeholder="Boss name" title="Name of debt (e.g. 'Credit Card', 'Car Loan', 'HECS')" value={newDebt.name} onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 100px' }} />
                <input type="number" placeholder="HP $" title="Total balance remaining on this debt" value={newDebt.balance} onChange={(e) => setNewDebt({ ...newDebt, balance: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
                <input type="number" placeholder="%" title="Annual interest rate (e.g. 5.5 for 5.5%)" value={newDebt.interestRate} onChange={(e) => setNewDebt({ ...newDebt, interestRate: e.target.value })} style={{ ...inputStyle, width: '60px' }} />
                <input type="number" placeholder="Min hit" title="Minimum payment amount per period" value={newDebt.minPayment} onChange={(e) => setNewDebt({ ...newDebt, minPayment: e.target.value })} style={{ ...inputStyle, width: '70px' }} />
                <input type="date" value={newDebt.paymentDate} onChange={(e) => setNewDebt({ ...newDebt, paymentDate: e.target.value })} style={inputStyle} />
                <select value={newDebt.frequency} onChange={(e) => setNewDebt({ ...newDebt, frequency: e.target.value })} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                <button onClick={addDebt} style={btnDanger}>⚔️ Add Boss</button>
              </div>
              {debts.map(debt => {
                const originalBal = parseFloat(debt.originalBalance || debt.balance || '0'); const currentBal = parseFloat(debt.balance || '0')
                const boss = getDebtBoss(currentBal, originalBal); const healthPct = originalBal > 0 ? (currentBal / originalBal) * 100 : 100; const damageDone = 100 - healthPct; const isDefeated = currentBal <= 0
                const payoffWith = calculateSingleDebtPayoff(debt, true); const payoffWithout = calculateSingleDebtPayoff(debt, false)
                const debtExtras = expenses.filter(exp => exp.targetDebtId === debt.id); const currentExtra = debtExtraPayment[debt.id] || { amount: '', frequency: 'monthly' }
                return (<div key={debt.id} style={{ padding: '20px', background: isDefeated ? 'linear-gradient(135deg, '+theme.success+'20, '+theme.success+'10)' : (darkMode ? 'linear-gradient(135deg, #3a1e1e, #2d1e1e)' : 'linear-gradient(135deg, #fef2f2, #fff1f2)'), borderRadius: '16px', border: isDefeated ? '2px solid '+theme.success : '2px solid '+boss.color+'40', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ fontSize: '36px', filter: isDefeated ? 'grayscale(1)' : 'none' }}>{boss.emoji}</div><div><div style={{ color: theme.text, fontWeight: 700, fontSize: '18px', textDecoration: isDefeated ? 'line-through' : 'none' }}>{debt.name}</div><div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}><span style={{ padding: '2px 8px', background: boss.color+'30', color: boss.color, borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>{boss.label}</span><span style={{ color: theme.textMuted, fontSize: '12px' }}>{debt.interestRate}% APR • ${debt.minPayment}/{debt.frequency}</span></div></div></div>
                    <div style={{ textAlign: 'right' as const }}><div style={{ color: isDefeated ? theme.success : theme.danger, fontSize: '24px', fontWeight: 800 }}>${currentBal.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>of ${originalBal.toFixed(0)} HP</div></div>
                  </div>
                  <div style={{ marginBottom: '16px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: theme.textMuted, fontSize: '11px' }}>❤️ BOSS HP</span><span style={{ color: theme.success, fontSize: '11px', fontWeight: 600 }}>🗡️ {damageDone.toFixed(1)}% damage</span></div><div style={{ width: '100%', height: '14px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '7px', overflow: 'hidden' }}><div style={{ width: healthPct + '%', height: '100%', background: `linear-gradient(to right, ${boss.color}, ${healthPct > 50 ? '#ef4444' : '#f59e0b'})`, borderRadius: '7px', transition: 'width 0.5s ease' }} /></div></div>
                  <div style={{ display: 'grid', gridTemplateColumns: debtExtras.length > 0 ? '1fr 1fr' : '1fr', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ padding: '10px', background: darkMode ? '#1e293b' : '#fff', borderRadius: '8px', fontSize: '12px' }}><div style={{ color: theme.textMuted, marginBottom: '4px' }}>⏱️ Without power-ups:</div>{payoffWithout.error ? <div style={{ color: theme.danger }}>⚠️ Attack too weak!</div> : <div style={{ color: theme.text }}><span style={{ fontWeight: 600 }}>{Math.floor(payoffWithout.monthsToPayoff / 12)}y {payoffWithout.monthsToPayoff % 12}m</span><span style={{ color: theme.danger, marginLeft: '8px' }}>${payoffWithout.totalInterestPaid.toFixed(0)} shield</span></div>}</div>
                    {debtExtras.length > 0 && <div style={{ padding: '10px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '8px', fontSize: '12px' }}><div style={{ color: theme.success, marginBottom: '4px' }}>⚡ With power-ups:</div>{payoffWith.error ? <div style={{ color: theme.warning }}>Still not enough!</div> : <div style={{ color: theme.text }}><span style={{ fontWeight: 600 }}>{Math.floor(payoffWith.monthsToPayoff / 12)}y {payoffWith.monthsToPayoff % 12}m</span><span style={{ color: theme.success, marginLeft: '8px' }}>${payoffWith.totalInterestPaid.toFixed(0)} shield</span></div>}</div>}
                  </div>
                  {debtExtras.length > 0 && <div style={{ marginBottom: '12px' }}><div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px' }}>⚡ Power-ups:</div>{debtExtras.map(exp => (<div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: theme.purple+'20', borderRadius: '4px', fontSize: '11px', marginBottom: '2px' }}><span style={{ color: theme.purple }}>⚡ ${exp.amount}/{exp.frequency}</span><button onClick={() => deleteExpense(exp.id)} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '10px' }}>✕</button></div>))}</div>}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {showExtraInput === debt.id ? (<><input type="number" placeholder="Power $" value={currentExtra.amount} onChange={(e) => setDebtExtraPayment(prev => ({ ...prev, [debt.id]: { ...currentExtra, amount: e.target.value } }))} style={{ ...inputStyle, width: '70px', padding: '6px 10px', fontSize: '12px' }} /><select value={currentExtra.frequency} onChange={(e) => setDebtExtraPayment(prev => ({ ...prev, [debt.id]: { ...currentExtra, frequency: e.target.value } }))} style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }}><option value="weekly">Weekly</option><option value="fortnightly">FN</option><option value="monthly">Monthly</option></select><button onClick={() => addExtraPaymentToDebt(debt.id)} style={{ ...btnPurple, padding: '6px 10px', fontSize: '11px' }}>⚡ Add</button><button onClick={() => setShowExtraInput(null)} style={{ ...btnDanger, padding: '6px 10px', fontSize: '11px' }}>✕</button></>) : (<><button onClick={() => { setShowExtraInput(debt.id); setDebtExtraPayment(prev => ({ ...prev, [debt.id]: { amount: '', frequency: 'monthly' } })) }} style={{ ...btnPurple, padding: '8px 14px', fontSize: '12px', flex: 1 }}>⚡ Add Power-Up</button><button onClick={() => deleteDebt(debt.id)} style={{ ...btnDanger, padding: '8px 14px', fontSize: '12px' }}>🗑️</button></>)}
                  </div>
                </div>)
              })}
              {debts.length > 0 && (() => { const payoff = calculateTotalDebtPayoff(); return (<div style={{ padding: '16px', background: 'linear-gradient(135deg, '+theme.purple+'20, '+theme.accent+'20)', borderRadius: '12px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '16px' }}><div style={{ textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Total Bosses</div><div style={{ color: theme.text, fontSize: '20px', fontWeight: 700 }}>{debts.length}</div></div><div style={{ textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>All Defeated In</div><div style={{ color: payoff.hasError ? theme.danger : theme.success, fontSize: '20px', fontWeight: 700 }}>{payoff.hasError ? '⚠️' : Math.floor(payoff.maxMonths/12)+'y '+payoff.maxMonths%12+'m'}</div></div><div style={{ textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px' }}>Total Shield</div><div style={{ color: theme.danger, fontSize: '20px', fontWeight: 700 }}>${payoff.totalInterest.toFixed(0)}</div></div></div>) })()}
            </div>

            {/* ===== GOALS QUESTS ===== */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '22px' }}>🎯 Savings Quests</h2>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' as const, padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
                <input type="text" placeholder="Quest name" title="What are you saving for? (e.g. 'Emergency Fund', 'Holiday', 'Car')" value={newGoal.name} onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 100px' }} />
                <input type="number" placeholder="Target $" title="Total amount you want to save" value={newGoal.target} onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
                <input type="number" placeholder="Saved $" title="How much you've already saved towards this goal" value={newGoal.saved} onChange={(e) => setNewGoal({ ...newGoal, saved: e.target.value })} style={{ ...inputStyle, width: '80px' }} />
                <input type="number" placeholder="Per payment $" title="How much you'll add each payment period" value={newGoal.paymentAmount} onChange={(e) => setNewGoal({ ...newGoal, paymentAmount: e.target.value })} style={{ ...inputStyle, width: '100px' }} />
                <select value={newGoal.savingsFrequency} onChange={(e) => setNewGoal({ ...newGoal, savingsFrequency: e.target.value })} style={inputStyle}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option></select>
                <input type="date" placeholder="Deadline" value={newGoal.deadline} onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} style={inputStyle} />
                <input type="date" value={newGoal.startDate} onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })} style={inputStyle} />
                <button onClick={addGoal} style={btnPurple}>🎯 Add Quest</button>
              </div>
              {goals.length === 0 ? <div style={{ color: theme.textMuted, textAlign: 'center' as const, padding: '40px' }}>No quests yet!</div> : goals.map(goal => {
                const progress = (parseFloat(goal.saved || '0') / parseFloat(goal.target || '1')) * 100; const isComplete = progress >= 100
                const payment = goal.paymentAmount ? parseFloat(goal.paymentAmount) : calculateGoalPayment(goal)
                const monthsToGoal = calculateMonthsToGoal(goal); const rank = getGoalRank(progress)
                const isOnCalendar = goal.startDate && (goal.paymentAmount || goal.deadline)
                const goalExtras = expenses.filter(exp => exp.targetGoalId === goal.id)
                return (<div key={goal.id} style={{ padding: '20px', background: isComplete ? 'linear-gradient(135deg, '+theme.success+'20, #fbbf2420)' : (darkMode ? '#334155' : '#faf5ff'), borderRadius: '16px', border: isComplete ? '2px solid #fbbf24' : '2px solid '+rank.color+'40', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ fontSize: '32px' }}>{rank.emoji}</div><div><div style={{ color: theme.text, fontWeight: 700, fontSize: '18px' }}>{goal.name}</div><div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}><span style={{ padding: '2px 8px', background: rank.color+'30', color: rank.color, borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>{rank.label}</span>{isOnCalendar && <span style={{ padding: '2px 8px', background: theme.success+'30', color: theme.success, borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>📅 On Calendar</span>}</div></div></div>
                    <div style={{ textAlign: 'right' as const }}><div style={{ color: isComplete ? '#fbbf24' : theme.text, fontSize: '22px', fontWeight: 800 }}>${parseFloat(goal.saved||'0').toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>of ${parseFloat(goal.target||'0').toFixed(0)}</div></div>
                  </div>
                  <div style={{ marginBottom: '16px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: rank.color, fontSize: '12px', fontWeight: 700 }}>{Math.min(progress, 100).toFixed(1)}%</span>{!isComplete && payment > 0 && <span style={{ color: theme.textMuted, fontSize: '11px' }}>${payment.toFixed(2)}/{goal.savingsFrequency} • {monthsToGoal}mo left</span>}</div><div style={{ width: '100%', height: '14px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '7px', overflow: 'hidden' }}><div style={{ width: Math.min(progress, 100) + '%', height: '100%', background: isComplete ? 'linear-gradient(to right, #fbbf24, #f59e0b)' : `linear-gradient(to right, ${rank.color}, ${rank.color}dd)`, borderRadius: '7px', transition: 'width 0.5s ease' }} /></div>{isComplete && <div style={{ textAlign: 'center' as const, marginTop: '8px', color: '#fbbf24', fontSize: '14px', fontWeight: 700 }}>🎉 QUEST COMPLETE! 🎉</div>}</div>
                  {goalExtras.length > 0 && <div style={{ marginBottom: '12px' }}><div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px' }}>⚡ Boosts:</div>{goalExtras.map(exp => (<div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: theme.purple+'20', borderRadius: '4px', fontSize: '11px', marginBottom: '2px' }}><span style={{ color: theme.purple }}>⚡ ${exp.amount}/{exp.frequency}</span><button onClick={() => deleteExpense(exp.id)} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '10px' }}>✕</button></div>))}</div>}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                    {!isComplete && selectedGoalForExtra === goal.id ? (<><input type="number" placeholder="Extra $" value={extraGoalPayment} onChange={(e) => setExtraGoalPayment(e.target.value)} style={{ ...inputStyle, width: '80px', padding: '6px 10px' }} /><button onClick={() => addExtraGoalPayment(goal.id)} style={{ ...btnPurple, padding: '6px 12px', fontSize: '11px' }}>⚡ Boost</button><button onClick={() => setSelectedGoalForExtra(null)} style={{ ...btnDanger, padding: '6px 10px', fontSize: '11px' }}>✕</button></>) : (<>{!isComplete && <button onClick={() => addGoalAndPlanToCalendar(goal)} style={{ padding: '8px 14px', background: isOnCalendar ? theme.textMuted : 'linear-gradient(135deg, '+theme.success+', #059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>{isOnCalendar ? '✅ On Calendar' : '📅 Add to Calendar'}</button>}{!isComplete && <button onClick={() => setSelectedGoalForExtra(goal.id)} style={{ ...btnPurple, padding: '8px 14px', fontSize: '12px' }}>⚡ Power-Up</button>}<button onClick={() => deleteGoal(goal.id)} style={{ padding: '8px 14px', background: 'transparent', color: theme.textMuted, border: '1px solid '+theme.border, borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button></>)}
                  </div>
                </div>)
              })}
            </div>

            {/* Budget Coach */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>🤖 Budget Coach</h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' as const, marginBottom: '12px', display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                {chatMessages.length === 0 && <div style={{ color: theme.textMuted, textAlign: 'center' as const, padding: '20px' }}>Ask me anything about your finances!</div>}
                {chatMessages.map((msg, i) => (<div key={i} style={{ padding: '12px', background: msg.role === 'user' ? theme.accent + '20' : (darkMode ? '#334155' : '#f0fdf4'), borderRadius: '10px', maxWidth: '85%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' } as any}><div style={{ color: theme.text, fontSize: '14px', whiteSpace: 'pre-wrap' as const }}>{msg.content}</div></div>))}
                {isAskingCoach && <div style={{ color: theme.textMuted, padding: '12px' }}>Thinking...</div>}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}><input type="text" placeholder="Ask about your finances..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && askBudgetCoach()} style={{ ...inputStyle, flex: 1 }} /><button onClick={askBudgetCoach} disabled={isAskingCoach} style={btnPrimary}>Send</button></div>
            </div>
          </div>
        )}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            {/* RAT RACE ESCAPE TRACKER */}
            {(() => {
              const totalMonthlyExpenses = monthlyExpenses + monthlyDebtPayments
              const escapePercent = totalMonthlyExpenses > 0 ? Math.min((passiveIncome / totalMonthlyExpenses) * 100, 100) : 0
              const passiveHourly = passiveIncome / 720
              const isEscaped = escapePercent >= 100
              const milestones = [{ pct: 25, label: '🌱 Seed Planted' }, { pct: 50, label: '🔥 Halfway Free' }, { pct: 75, label: '⚡ Almost There' }, { pct: 100, label: '🏆 ESCAPED' }]
              const currentMilestone = milestones.filter(m => escapePercent >= m.pct).pop()
              const nextMilestone = milestones.find(m => escapePercent < m.pct)
              return (
                <div style={{ padding: '32px', background: isEscaped ? 'linear-gradient(135deg, #fbbf2415, #10b98115)' : (darkMode ? 'linear-gradient(135deg, #1e293b, #0f172a, #1e1b4b)' : 'linear-gradient(135deg, #faf5ff, #f0f9ff, #f0fdf4)'), borderRadius: '24px', border: isEscaped ? '2px solid #fbbf24' : '2px solid ' + theme.border, position: 'relative' as const, overflow: 'hidden' }}>
                  <div style={{ position: 'relative' as const, zIndex: 1 }}>
                    <div style={{ textAlign: 'center' as const, marginBottom: '28px' }}>
                      <div style={{ fontSize: '14px', color: theme.textMuted, letterSpacing: '3px', textTransform: 'uppercase' as const, marginBottom: '8px', fontWeight: 600 }}>RAT RACE ESCAPE TRACKER</div>
                      <div style={{ fontSize: '56px', fontWeight: 900, color: isEscaped ? '#fbbf24' : theme.text, lineHeight: 1 }}>{escapePercent.toFixed(1)}%</div>
                      <div style={{ fontSize: '16px', color: isEscaped ? '#fbbf24' : theme.purple, fontWeight: 700, marginTop: '8px' }}>{isEscaped ? '🏆 YOU HAVE ESCAPED THE RAT RACE! 🏆' : currentMilestone ? currentMilestone.label : '🐀 Still in the Rat Race'}</div>
                    </div>
                    <div style={{ position: 'relative' as const, marginBottom: '32px', padding: '0 4px' }}>
                      <div style={{ position: 'relative' as const, height: '20px', marginBottom: '8px' }}>{milestones.map(m => (<div key={m.pct} style={{ position: 'absolute' as const, left: m.pct + '%', transform: 'translateX(-50%)' }}><span style={{ fontSize: '14px', opacity: escapePercent >= m.pct ? 1 : 0.3 }}>{m.pct === 100 ? '🏁' : m.pct === 75 ? '⚡' : m.pct === 50 ? '🔥' : '🌱'}</span></div>))}</div>
                      <div style={{ width: '100%', height: '28px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '14px', overflow: 'hidden', position: 'relative' as const, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
                        <div style={{ width: escapePercent + '%', height: '100%', background: isEscaped ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : escapePercent > 50 ? 'linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981)' : 'linear-gradient(90deg, #8b5cf6, #3b82f6)', borderRadius: '14px', transition: 'width 1s ease', boxShadow: isEscaped ? '0 0 20px #fbbf2460' : 'none' }} />
                        {[25, 50, 75].map(pct => (<div key={pct} style={{ position: 'absolute' as const, left: pct + '%', top: 0, bottom: 0, width: '2px', background: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }} />))}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                      <div style={{ padding: '16px', background: darkMode ? '#334155' : 'white', borderRadius: '16px', textAlign: 'center' as const, border: '1px solid ' + theme.border }}><div style={{ color: theme.textMuted, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Passive Income</div><div style={{ color: theme.success, fontSize: '26px', fontWeight: 800 }}>${passiveIncome.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>/month</div></div>
                      <div style={{ padding: '16px', background: darkMode ? '#334155' : 'white', borderRadius: '16px', textAlign: 'center' as const, border: '1px solid ' + theme.border }}><div style={{ color: theme.textMuted, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Total Outgoing</div><div style={{ color: theme.danger, fontSize: '26px', fontWeight: 800 }}>${totalMonthlyExpenses.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>/month</div></div>
                      <div style={{ padding: '16px', background: darkMode ? '#334155' : 'white', borderRadius: '16px', textAlign: 'center' as const, border: '1px solid ' + theme.border }}><div style={{ color: theme.textMuted, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Money Works 24/7</div><div style={{ color: theme.purple, fontSize: '26px', fontWeight: 800 }}>${passiveHourly.toFixed(2)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>/hour while you sleep</div></div>
                      <div style={{ padding: '16px', background: darkMode ? '#334155' : 'white', borderRadius: '16px', textAlign: 'center' as const, border: '1px solid ' + theme.border }}><div style={{ color: theme.textMuted, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Gap to Freedom</div><div style={{ color: (totalMonthlyExpenses - passiveIncome) <= 0 ? theme.success : theme.warning, fontSize: '26px', fontWeight: 800 }}>${Math.max(0, totalMonthlyExpenses - passiveIncome).toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>{(totalMonthlyExpenses - passiveIncome) <= 0 ? 'COVERED! 🎉' : 'passive income needed'}</div></div>
                    </div>
                    {nextMilestone && (<div style={{ marginTop: '16px', padding: '12px 20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const, border: '1px dashed ' + theme.border }}><span style={{ color: theme.textMuted, fontSize: '13px' }}>Next: </span><span style={{ color: theme.purple, fontSize: '13px', fontWeight: 700 }}>{nextMilestone.label}</span><span style={{ color: theme.textMuted, fontSize: '13px' }}> — need ${(totalMonthlyExpenses * nextMilestone.pct / 100 - passiveIncome).toFixed(0)} more passive income</span></div>)}
                  </div>
                </div>
              )
            })()}

            {/* CASH FLOW QUADRANT */}
            {(() => {
              const employeeIncome = incomeStreams.filter(i => i.type === 'active' && !i.name.toLowerCase().match(/freelance|contract|consult|side/)).reduce((sum, i) => sum + convertToMonthly(parseFloat(i.amount || '0'), i.frequency), 0)
              const selfEmployedIncome = incomeStreams.filter(i => i.type === 'active' && i.name.toLowerCase().match(/freelance|contract|consult|side/)).reduce((sum, i) => sum + convertToMonthly(parseFloat(i.amount || '0'), i.frequency), 0)
              const businessIncome = incomeStreams.filter(i => i.type === 'passive' && i.name.toLowerCase().match(/business|royalt|license/)).reduce((sum, i) => sum + convertToMonthly(parseFloat(i.amount || '0'), i.frequency), 0)
              const investorIncome = incomeStreams.filter(i => i.type === 'passive' && i.name.toLowerCase().match(/dividend|interest|rental|invest|stock|etf|crypto/)).reduce((sum, i) => sum + convertToMonthly(parseFloat(i.amount || '0'), i.frequency), 0)
              const otherPassive = passiveIncome - businessIncome - investorIncome
              const totalAll = employeeIncome + selfEmployedIncome + businessIncome + investorIncome + otherPassive
              const leftSide = employeeIncome + selfEmployedIncome; const rightSide = businessIncome + investorIncome + otherPassive
              const quadrants = [{ key: 'E', label: 'Employee', desc: 'You work for money', amount: employeeIncome, color: '#ef4444', icon: '👔' }, { key: 'B', label: 'Business Owner', desc: 'Systems work for you', amount: businessIncome + otherPassive, color: '#10b981', icon: '🏢' }, { key: 'S', label: 'Self-Employed', desc: 'You own a job', amount: selfEmployedIncome, color: '#f59e0b', icon: '🔧' }, { key: 'I', label: 'Investor', desc: 'Money works for you', amount: investorIncome, color: '#8b5cf6', icon: '📈' }]
              return (
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}><div><h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>💡 Cash Flow Quadrant</h2><p style={{ margin: '4px 0 0', color: theme.textMuted, fontSize: '13px' }}>Move income from left → right to build freedom</p></div><div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><div style={{ textAlign: 'center' as const }}><div style={{ fontSize: '10px', color: theme.danger }}>⬅️ You work</div><div style={{ color: theme.danger, fontWeight: 800, fontSize: '18px' }}>${leftSide.toFixed(0)}</div></div><div style={{ width: '2px', height: '30px', background: theme.border }} /><div style={{ textAlign: 'center' as const }}><div style={{ fontSize: '10px', color: theme.success }}>Money works ➡️</div><div style={{ color: theme.success, fontWeight: 800, fontSize: '18px' }}>${rightSide.toFixed(0)}</div></div></div></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', background: theme.border, borderRadius: '20px', overflow: 'hidden' }}>
                    {quadrants.map(q => { const pct = totalAll > 0 ? (q.amount / totalAll) * 100 : 0; const isActive = q.amount > 0; return (
                      <div key={q.key} style={{ padding: '24px', background: isActive ? (darkMode ? '#1e293b' : 'white') : (darkMode ? '#151e2d' : '#f8fafc'), position: 'relative' as const, overflow: 'hidden' }}>
                        {isActive && <div style={{ position: 'absolute' as const, top: '-20px', right: '-20px', width: '100px', height: '100px', background: q.color + '15', borderRadius: '50%' }} />}
                        <div style={{ position: 'relative' as const, zIndex: 1 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><div><div style={{ fontSize: '28px', marginBottom: '4px' }}>{q.icon}</div><div style={{ fontSize: '32px', fontWeight: 900, color: isActive ? q.color : theme.textMuted + '40' }}>{q.key}</div></div><div style={{ textAlign: 'right' as const }}><div style={{ color: isActive ? theme.text : theme.textMuted, fontSize: '24px', fontWeight: 800 }}>${q.amount.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{pct.toFixed(0)}%</div></div></div><div style={{ color: isActive ? theme.text : theme.textMuted, fontWeight: 600, fontSize: '15px' }}>{q.label}</div><div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '2px' }}>{q.desc}</div><div style={{ width: '100%', height: '6px', background: darkMode ? '#0f172a' : '#e2e8f0', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}><div style={{ width: pct + '%', height: '100%', background: q.color, borderRadius: '3px' }} /></div></div>
                      </div>
                    )})}
                  </div>
                  <div style={{ marginTop: '16px', padding: '12px 20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const }}>{rightSide > leftSide ? <span style={{ color: theme.success, fontWeight: 700, fontSize: '14px' }}>🎯 Cash Flow Positive — Your money earns more than your time!</span> : rightSide > 0 ? <span style={{ color: theme.warning, fontWeight: 700, fontSize: '14px' }}>📈 Building momentum — {((rightSide / Math.max(totalAll, 1)) * 100).toFixed(0)}% from the right side</span> : <span style={{ color: theme.textMuted, fontWeight: 600, fontSize: '14px' }}>💡 Add passive income streams to light up the right side</span>}</div>
                </div>
              )
            })()}

            {/* PASSIVE INCOME PIPELINE */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '22px' }}>🔄 Passive Income Pipeline</h2>
              <p style={{ margin: '0 0 24px 0', color: theme.textMuted, fontSize: '13px' }}>Money flowing in vs flowing out</p>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'stretch' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ textAlign: 'center' as const, marginBottom: '16px' }}><div style={{ fontSize: '12px', color: theme.success, letterSpacing: '2px', textTransform: 'uppercase' as const, fontWeight: 700 }}>💰 Flowing In</div><div style={{ fontSize: '32px', fontWeight: 900, color: theme.success }}>${passiveIncome.toFixed(0)}<span style={{ fontSize: '14px', fontWeight: 400, color: theme.textMuted }}>/mo</span></div></div>
                  {incomeStreams.filter(i => i.type === 'passive').length === 0 ? <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const, border: '2px dashed ' + theme.border }}><div style={{ fontSize: '24px', marginBottom: '8px' }}>🌱</div><div style={{ color: theme.textMuted, fontSize: '13px' }}>No passive income yet — add on Dashboard</div></div> : incomeStreams.filter(i => i.type === 'passive').map(inc => { const monthly = convertToMonthly(parseFloat(inc.amount || '0'), inc.frequency); const pctOfExp = totalOutgoing > 0 ? (monthly / totalOutgoing) * 100 : 0; return (<div key={inc.id} style={{ padding: '14px 16px', background: darkMode ? 'linear-gradient(135deg, #1e3a32, #1e293b)' : 'linear-gradient(135deg, #f0fdf4, #faf5ff)', borderRadius: '12px', border: '1px solid ' + theme.success + '30', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>🌴 {inc.name}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>Covers {pctOfExp.toFixed(1)}% of expenses</div></div><div style={{ color: theme.success, fontWeight: 800, fontSize: '18px' }}>+${monthly.toFixed(0)}</div></div>) })}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0 8px' }}>
                  <div style={{ width: '3px', flex: 1, background: `linear-gradient(to bottom, ${theme.success}, ${theme.border}, ${theme.danger})`, borderRadius: '2px' }} />
                  <div style={{ padding: '12px', background: darkMode ? '#334155' : '#f1f5f9', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ fontSize: '10px', color: theme.textMuted, marginBottom: '4px' }}>CASH FLOW</div><div style={{ fontSize: '18px', fontWeight: 800, color: (passiveIncome - totalOutgoing) >= 0 ? theme.success : theme.danger }}>{(passiveIncome - totalOutgoing) >= 0 ? '+' : ''}${(passiveIncome - totalOutgoing).toFixed(0)}</div></div>
                  <div style={{ width: '3px', flex: 1, background: `linear-gradient(to bottom, ${theme.border}, ${theme.danger})`, borderRadius: '2px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ textAlign: 'center' as const, marginBottom: '16px' }}><div style={{ fontSize: '12px', color: theme.danger, letterSpacing: '2px', textTransform: 'uppercase' as const, fontWeight: 700 }}>💸 Flowing Out</div><div style={{ fontSize: '32px', fontWeight: 900, color: theme.danger }}>${totalOutgoing.toFixed(0)}<span style={{ fontSize: '14px', fontWeight: 400, color: theme.textMuted }}>/mo</span></div></div>
                  {(() => { const cats: {[k:string]:number} = {}; expenses.filter(e => !e.targetDebtId && !e.targetGoalId).forEach(exp => { const c = exp.category||'other'; cats[c] = (cats[c]||0) + convertToMonthly(parseFloat(exp.amount||'0'), exp.frequency) }); if (monthlyDebtPayments > 0) cats['debt payments'] = monthlyDebtPayments; const cc: {[k:string]:string} = { housing:'#8b5cf6', utilities:'#3b82f6', food:'#f59e0b', transport:'#10b981', entertainment:'#f472b6', shopping:'#ef4444', health:'#14b8a6', subscriptions:'#6366f1', 'debt payments':'#dc2626', savings:'#10b981', other:'#94a3b8' }; return Object.entries(cats).sort((a,b) => b[1]-a[1]).slice(0,6).map(([cat, amt]) => (<div key={cat} style={{ padding: '10px 14px', background: darkMode ? 'linear-gradient(135deg, #2d1e1e, #1e293b)' : '#fef2f2', borderRadius: '10px', border: '1px solid '+(cc[cat]||'#94a3b8')+'30', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cc[cat]||'#94a3b8' }} /><span style={{ color: theme.text, fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' as const }}>{cat}</span></div><span style={{ color: theme.danger, fontWeight: 700, fontSize: '14px' }}>-${amt.toFixed(0)}</span></div>)) })()}
                </div>
              </div>
            </div>

            {/* PASSIVE INCOME QUEST BOARD */}
            {(() => {
              const passiveNames = incomeStreams.filter(i => i.type === 'passive').map(i => i.name.toLowerCase())
              const hasPassive = (kws: string[]) => passiveNames.some(name => kws.some(kw => name.includes(kw)))
              const quests = [
                { id:'dividends',icon:'📊',title:'Dividend Investing',subtitle:'Companies pay YOU',difficulty:1,capital:'$100+',time:'1-3mo',target:'$1M invested @ 6% yield',color:'#10b981',keywords:['dividend','etf','vas','vhy','schd','vanguard','stock'],steps:['Open brokerage account','Buy dividend ETFs (VAS, VHY, SCHD)','Enable dividend reinvestment','Add consistently every week/month','Target 4-6% yield with growth'],tip:'The boring path that actually works. Time in market beats timing the market.' },
                { id:'rental',icon:'🏠',title:'Rental Property',subtitle:'Leverage is the cheat code',difficulty:3,capital:'$30-80K deposit',time:'3-6mo',target:'5-10 properties @ $500-1K each',color:'#8b5cf6',keywords:['rental','rent','property','tenant','real estate'],steps:['Save 10-20% deposit + costs','Research high-yield areas','Get pre-approved for loan','Buy below market value','Use property manager'],tip:"Kiyosaki's favourite. Use the bank's money to buy assets." },
                { id:'reits',icon:'🏢',title:'REITs',subtitle:'Real estate without tenants',difficulty:1,capital:'$50+',time:'Immediate',target:'$850K invested @ 7%',color:'#3b82f6',keywords:['reit','property fund','vanguard property'],steps:['Buy REIT ETFs (VAP in AU, VNQ in US)','Diversify across sectors','Reinvest distributions','Higher yields than growth stocks'],tip:'All property benefits, none of the headaches.' },
                { id:'digital',icon:'💻',title:'Digital Products',subtitle:'Create once, sell forever',difficulty:2,capital:'$0-500',time:'1-6mo',target:'500 sales/mo @ $10 each',color:'#f59e0b',keywords:['digital','ebook','course','template','notion','canva','gumroad'],steps:['Pick what you know - any skill works','Start: Notion templates, Canva designs','Sell on Gumroad, Etsy, or own site','Build email list (the real asset)','Create flagship course once validated'],tip:'Zero inventory, infinite copies. Knowledge = asset.' },
                { id:'content',icon:'🎬',title:'Content / YouTube',subtitle:'Build audience, earn sleeping',difficulty:3,capital:'$0-2K',time:'6-24mo',target:'500K-1M views/mo + affiliates',color:'#ef4444',keywords:['youtube','content','creator','adsense','podcast','blog'],steps:['Pick a niche for 3+ years','Start with phone - gear later','Post 2-4x/week consistently','Monetize: ads, affiliates, sponsors','Old videos keep earning forever'],tip:'Slow start, exponential growth. Your library is the asset.' },
                { id:'affiliate',icon:'🔗',title:'Affiliate Marketing',subtitle:'Recommend products, earn commissions',difficulty:2,capital:'$0-500',time:'3-12mo',target:'High-ticket items or volume',color:'#f472b6',keywords:['affiliate','commission','referral'],steps:['Join programs (Amazon, ShareASale)','Build review site or YouTube','Focus on products you actually use','Write honest detailed reviews','SEO + email list = conversions'],tip:'Bridge between content and commerce. No inventory needed.' },
                { id:'savings',icon:'🏦',title:'High-Yield Savings',subtitle:'Boring but bulletproof',difficulty:0,capital:'$1+',time:'Immediate',target:'$1.2M @ 5% = $5K/mo',color:'#6366f1',keywords:['savings','interest','term deposit','hisa','high yield','bank'],steps:['Open high-yield account (ING, UBank)','Park emergency fund here','Compare rates monthly','Consider term deposits','Foundation, not final destination'],tip:'Risk-free income. Perfect parking spot while building other streams.' },
                { id:'p2p',icon:'🤝',title:'Peer-to-Peer Lending',subtitle:'Be the bank',difficulty:2,capital:'$500+',time:'1-3mo',target:'$600K @ 10% return',color:'#14b8a6',keywords:['p2p','lending','peer','plenti'],steps:['Research platforms (Plenti AU)','Start small to understand risk','Diversify across many loans','Reinvest returns','Keep as 5-15% of portfolio'],tip:'Higher risk, 8-12% returns possible. Diversification is key.' },
                { id:'royalties',icon:'🎵',title:'Royalties & IP',subtitle:'IP that pays forever',difficulty:3,capital:'$0-2K',time:'3-12mo',target:'Multiple successful products',color:'#a78bfa',keywords:['royalt','book','music','license','publish','stock photo'],steps:['Write: Self-publish on Amazon KDP','Design: Stock photos on Shutterstock','Music: Distribute via DistroKid','Software: Build micro-tools','Volume matters - 1 product rarely enough'],tip:'The original passive income. Create in 2024, earn in 2034.' },
                { id:'automation',icon:'🤖',title:'Automated Business',subtitle:'Systems run without you',difficulty:4,capital:'$500-10K',time:'3-12mo',target:'1-2 automated businesses',color:'#dc2626',keywords:['business','dropship','print on demand','saas','automated','ecommerce'],steps:['Print-on-demand via Printful/Redbubble','Dropshipping via Shopify','SaaS: Build simple tool people need','Physical: Vending, car wash, laundromat','Key: Build systems, not jobs'],tip:'Hardest to set up, highest potential. Would it run without you for a month?' },
              ]
              return (
                <div style={cardStyle}>
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div><h2 style={{ margin: 0, color: theme.text, fontSize: '22px' }}>🗺️ Passive Income Quest Board</h2><p style={{ margin: '4px 0 0', color: theme.textMuted, fontSize: '13px' }}>10 paths to $5K/month — unlock by adding income streams</p></div>
                      <div style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', borderRadius: '10px', textAlign: 'center' as const }}><div style={{ color: '#1e293b', fontSize: '20px', fontWeight: 900 }}>{quests.filter(q => hasPassive(q.keywords)).length}/10</div><div style={{ color: '#92400e', fontSize: '10px', fontWeight: 600 }}>UNLOCKED</div></div>
                    </div>
                    <div style={{ marginTop: '16px' }}><div style={{ width: '100%', height: '10px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}><div style={{ width: (quests.filter(q => hasPassive(q.keywords)).length / 10) * 100 + '%', height: '100%', background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', borderRadius: '5px' }} /></div></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {quests.map(quest => {
                      const isUnlocked = hasPassive(quest.keywords)
                      const isExpanded = expandedQuestId === quest.id
                      const matchStreams = incomeStreams.filter(i => i.type === 'passive' && quest.keywords.some(kw => i.name.toLowerCase().includes(kw)))
                      const earned = matchStreams.reduce((s, i) => s + convertToMonthly(parseFloat(i.amount || '0'), i.frequency), 0)
                      return (
                        <div key={quest.id} onClick={() => setExpandedQuestId(isExpanded ? null : quest.id)} style={{ padding: '20px', background: isUnlocked ? (darkMode ? `linear-gradient(135deg, ${quest.color}15, ${quest.color}08)` : `linear-gradient(135deg, ${quest.color}10, white)`) : (darkMode ? '#151e2d' : '#f8fafc'), borderRadius: '16px', border: isUnlocked ? `2px solid ${quest.color}50` : `2px solid ${theme.border}`, cursor: 'pointer', gridColumn: isExpanded ? '1 / -1' : undefined, opacity: isUnlocked ? 1 : 0.7 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ fontSize: '32px', filter: isUnlocked ? 'none' : 'grayscale(0.8)' }}>{quest.icon}</div><div><div style={{ color: theme.text, fontWeight: 700, fontSize: '16px' }}>{quest.title}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{quest.subtitle}</div></div></div>
                            <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: '4px' }}>{isUnlocked ? <span style={{ padding: '3px 10px', background: quest.color + '25', color: quest.color, borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>✅ UNLOCKED</span> : <span style={{ padding: '3px 10px', background: darkMode ? '#334155' : '#e2e8f0', color: theme.textMuted, borderRadius: '6px', fontSize: '11px' }}>🔒 LOCKED</span>}<span style={{ fontSize: '11px', color: theme.textMuted }}>{'⭐'.repeat(quest.difficulty + 1)}</span></div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}><span style={{ padding: '3px 8px', background: darkMode ? '#1e293b' : '#f1f5f9', borderRadius: '4px', fontSize: '10px', color: theme.textMuted }}>💰 {quest.capital}</span><span style={{ padding: '3px 8px', background: darkMode ? '#1e293b' : '#f1f5f9', borderRadius: '4px', fontSize: '10px', color: theme.textMuted }}>⏱️ {quest.time}</span>{isUnlocked && earned > 0 && <span style={{ padding: '3px 8px', background: quest.color + '20', borderRadius: '4px', fontSize: '10px', color: quest.color, fontWeight: 700 }}>🔥 ${earned.toFixed(0)}/mo</span>}</div>
                          {isExpanded && (
                            <div style={{ marginTop: '16px', borderTop: '1px solid ' + theme.border, paddingTop: '16px' }}>
                              <div style={{ padding: '12px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '10px', marginBottom: '16px' }}><div style={{ color: theme.textMuted, fontSize: '11px' }}>🎯 $5K/month target:</div><div style={{ color: quest.color, fontWeight: 700, fontSize: '14px' }}>{quest.target}</div></div>
                              <div style={{ marginBottom: '16px' }}><div style={{ color: theme.text, fontWeight: 700, fontSize: '14px', marginBottom: '10px' }}>🚀 How to Start:</div>{quest.steps.map((step, i) => (<div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}><div style={{ width: '24px', height: '24px', borderRadius: '50%', background: quest.color + '20', color: quest.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>{i+1}</div><div style={{ color: theme.text, fontSize: '13px', lineHeight: 1.5 }}>{step}</div></div>))}</div>
                              <div style={{ padding: '14px', background: quest.color + '10', borderRadius: '10px', borderLeft: '4px solid ' + quest.color }}><div style={{ color: quest.color, fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>💡 Pro Tip</div><div style={{ color: theme.text, fontSize: '13px', lineHeight: 1.5 }}>{quest.tip}</div></div>
                              {!isUnlocked && <div style={{ marginTop: '16px', padding: '12px', background: quest.color + '10', borderRadius: '10px', textAlign: 'center' as const }}><div style={{ color: quest.color, fontWeight: 700, fontSize: '13px' }}>🔓 Add a passive income with: {quest.keywords.slice(0,3).map(k => '"'+k+'"').join(', ')}</div></div>}
                            </div>
                          )}
                          <div style={{ textAlign: 'center' as const, marginTop: '8px' }}><span style={{ color: theme.textMuted, fontSize: '10px' }}>{isExpanded ? '▲ Collapse' : '▼ Expand guide'}</span></div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ marginTop: '20px', padding: '16px', background: 'linear-gradient(135deg, #fbbf2410, #f59e0b10)', borderRadius: '12px', textAlign: 'center' as const, border: '1px dashed #fbbf2440' }}><div style={{ color: theme.text, fontWeight: 700, fontSize: '15px' }}>{quests.filter(q => hasPassive(q.keywords)).length === 0 ? '🌱 Every empire starts with a single dollar working for you' : quests.filter(q => hasPassive(q.keywords)).length < 3 ? '🔥 Great start! Diversify into more streams' : quests.filter(q => hasPassive(q.keywords)).length < 7 ? '⚡ Impressive income machine!' : '🏆 Passive Income Master!'}</div><div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>"Don't work for money. Make money work for you." — Robert Kiyosaki</div></div>
                </div>
              )
            })()}

            {/* ASSET vs LIABILITY SCORECARD */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '22px' }}>⚖️ Asset vs Liability Scorecard</h2>
              <p style={{ margin: '0 0 20px 0', color: theme.textMuted, fontSize: '13px' }}>Assets put money IN your pocket. Liabilities take money OUT.</p>
              {(() => {
                const assetCF = incomeStreams.filter(i => i.type === 'passive').reduce((s, i) => s + convertToMonthly(parseFloat(i.amount || '0'), i.frequency), 0)
                const liabCF = monthlyDebtPayments
                const totalCF = assetCF + liabCF; const assetPct = totalCF > 0 ? (assetCF / totalCF) * 100 : 50
                return (<>
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: theme.success, fontWeight: 700 }}>💪 Assets: +${assetCF.toFixed(0)}/mo</span><span style={{ color: theme.danger, fontWeight: 700 }}>-${liabCF.toFixed(0)}/mo 🏋️</span></div>
                    <div style={{ width: '100%', height: '20px', background: theme.danger + '40', borderRadius: '10px', overflow: 'hidden', position: 'relative' as const }}><div style={{ width: assetPct + '%', height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '10px' }} /><div style={{ position: 'absolute' as const, left: '50%', top: '-4px', bottom: '-4px', width: '3px', background: theme.text, transform: 'translateX(-50%)', borderRadius: '2px' }} /></div>
                    <div style={{ textAlign: 'center' as const, marginTop: '8px' }}><span style={{ padding: '4px 12px', background: assetCF > liabCF ? theme.success + '20' : theme.danger + '20', color: assetCF > liabCF ? theme.success : theme.danger, borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>{assetCF > liabCF ? '✅ Cash Flow Positive!' : '⚠️ Build more assets!'}</span></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><h3 style={{ margin: 0, color: theme.success }}>✅ Real Assets</h3><button onClick={() => setShowAssetPresets(!showAssetPresets)} style={{ padding: '4px 10px', background: showAssetPresets ? theme.success : 'transparent', color: showAssetPresets ? 'white' : theme.textMuted, border: '1px solid '+theme.border, borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>📋 Presets</button></div>
                      {showAssetPresets && <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px', marginBottom: '12px' }}>{assetPresets.map((p,i) => <button key={i} onClick={() => addAssetPreset(p)} style={{ padding: '4px 10px', background: darkMode ? '#1e293b' : 'white', border: '1px solid '+theme.border, borderRadius: '6px', cursor: 'pointer', color: theme.text, fontSize: '11px' }}>{p.name}</button>)}</div>}
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' as const }}><input type="text" placeholder="Asset" value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 80px', padding: '8px 12px', fontSize: '13px' }} /><input type="number" placeholder="$" value={newAsset.value} onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })} style={{ ...inputStyle, width: '80px', padding: '8px 12px', fontSize: '13px' }} /><select value={newAsset.type} onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })} style={{ ...inputStyle, padding: '8px', fontSize: '13px' }}><option value="savings">💵 Savings</option><option value="investment">📈 Investment</option><option value="property">🏠 Property</option><option value="business">🏢 Business</option><option value="crypto">🪙 Crypto</option><option value="other">📦 Other</option></select><button onClick={addAsset} style={{ ...btnSuccess, padding: '8px 14px', fontSize: '12px' }}>+</button></div>
                      {assets.map(a => (<div key={a.id} style={{ padding: '10px 14px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', border: '1px solid ' + theme.success + '20' }}><span style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>{a.name}</span><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span style={{ color: theme.success, fontWeight: 700 }}>${parseFloat(a.value).toFixed(0)}</span><button onClick={() => deleteAsset(a.id)} style={{ padding: '4px 8px', background: theme.danger + '20', color: theme.danger, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕</button></div></div>))}
                      {assets.length > 0 && <div style={{ marginTop: '8px', padding: '8px', background: theme.success + '10', borderRadius: '8px', textAlign: 'center' as const }}><span style={{ color: theme.success, fontWeight: 700 }}>Total: ${totalAssets.toFixed(0)}</span></div>}
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><h3 style={{ margin: 0, color: theme.danger }}>❌ Liabilities</h3><button onClick={() => setShowLiabilityPresets(!showLiabilityPresets)} style={{ padding: '4px 10px', background: showLiabilityPresets ? theme.danger : 'transparent', color: showLiabilityPresets ? 'white' : theme.textMuted, border: '1px solid '+theme.border, borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>📋 Presets</button></div>
                      {showLiabilityPresets && <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px', marginBottom: '12px' }}>{liabilityPresets.map((p,i) => <button key={i} onClick={() => addLiabilityPreset(p)} style={{ padding: '4px 10px', background: darkMode ? '#2d1e1e' : '#fef2f2', border: '1px solid '+theme.danger+'30', borderRadius: '6px', cursor: 'pointer', color: theme.danger, fontSize: '11px' }}>{p.name}</button>)}</div>}
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' as const }}><input type="text" placeholder="Liability" value={newLiability.name} onChange={(e) => setNewLiability({ ...newLiability, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 80px', padding: '8px 12px', fontSize: '13px' }} /><input type="number" placeholder="$" value={newLiability.value} onChange={(e) => setNewLiability({ ...newLiability, value: e.target.value })} style={{ ...inputStyle, width: '80px', padding: '8px 12px', fontSize: '13px' }} /><select value={newLiability.type} onChange={(e) => setNewLiability({ ...newLiability, type: e.target.value })} style={{ ...inputStyle, padding: '8px', fontSize: '13px' }}><option value="loan">🏦 Loan</option><option value="credit">💳 Credit</option><option value="mortgage">🏠 Mortgage</option><option value="other">📋 Other</option></select><button onClick={addLiability} style={{ ...btnDanger, padding: '8px 14px', fontSize: '12px' }}>+</button></div>
                      {debts.map(d => (<div key={'dl-'+d.id} style={{ padding: '10px 14px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', border: '1px solid ' + theme.danger + '20' }}><span style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>💳 {d.name}</span><span style={{ color: theme.danger, fontWeight: 700 }}>${parseFloat(d.balance).toFixed(0)}</span></div>))}
                      {liabilities.map(l => (<div key={l.id} style={{ padding: '10px 14px', background: darkMode ? '#3a1e1e' : '#fef2f2', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', border: '1px solid ' + theme.danger + '20' }}><span style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>{l.name}</span><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span style={{ color: theme.danger, fontWeight: 700 }}>${parseFloat(l.value).toFixed(0)}</span><button onClick={() => deleteLiability(l.id)} style={{ padding: '4px 8px', background: theme.danger + '20', color: theme.danger, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕</button></div></div>))}
                      {(totalLiabilities + totalDebtBalance) > 0 && <div style={{ marginTop: '8px', padding: '8px', background: theme.danger + '10', borderRadius: '8px', textAlign: 'center' as const }}><span style={{ color: theme.danger, fontWeight: 700 }}>Total: ${(totalLiabilities + totalDebtBalance).toFixed(0)}</span></div>}
                    </div>
                  </div>
                </>)
              })()}
            </div>

            {/* GOAL CALCULATOR */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 8px 0', color: theme.purple, fontSize: '18px' }}>🧮 Goal Calculator</h3>
              <p style={{ margin: '0 0 16px 0', color: theme.textMuted, fontSize: '13px' }}>See how your savings will grow with compound interest over time</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div><label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>🎯 Target Amount</label><input type="number" placeholder="e.g. 100000" value={goalCalculator.targetAmount} onChange={(e) => setGoalCalculator({ ...goalCalculator, targetAmount: e.target.value })} style={{ ...inputStyle, width: '100%' }} title="How much do you want to reach? Leave blank to see growth over time." /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>💰 Starting Amount</label><input type="number" placeholder="e.g. 5000" value={goalCalculator.currentAmount} onChange={(e) => setGoalCalculator({ ...goalCalculator, currentAmount: e.target.value })} style={{ ...inputStyle, width: '100%' }} title="How much do you already have saved?" /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>📅 Monthly Saving</label><input type="number" placeholder="e.g. 500" value={goalCalculator.monthlyContribution} onChange={(e) => setGoalCalculator({ ...goalCalculator, monthlyContribution: e.target.value })} style={{ ...inputStyle, width: '100%' }} title="How much will you add each month?" /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>📈 Return Rate %/yr</label><input type="number" placeholder="e.g. 7" value={goalCalculator.interestRate} onChange={(e) => setGoalCalculator({ ...goalCalculator, interestRate: e.target.value })} style={{ ...inputStyle, width: '100%' }} title="Expected annual return (HISA ~5%, ETFs ~7-10%, Super ~8%)" /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>⏰ Years</label><div style={{ display: 'flex', gap: '4px' }}><input type="number" placeholder="10" value={goalCalculator.years} onChange={(e) => setGoalCalculator({ ...goalCalculator, years: e.target.value })} style={{ ...inputStyle, flex: 1 }} title="Time horizon in years" /><button onClick={calculateGoal} disabled={calculating} style={{ ...btnPurple, padding: '8px 14px', whiteSpace: 'nowrap' as const }}>{calculating ? '...' : '🧮 Calc'}</button></div></div>
              </div>
              <div style={{ padding: '10px 14px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: theme.textMuted }}>
                <strong>How to use:</strong> Enter your target, what you have now, monthly savings, expected return rate, and timeframe. The calculator shows how compound interest grows your money. Try: $0 start, $500/mo, 8% return, 30 years = over $700K!
              </div>
              {calculatorResult && (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '20px', background: 'linear-gradient(135deg, '+theme.purple+'15, '+theme.accent+'15)', borderRadius: '16px', border: '1px solid '+theme.purple+'30' }}><div style={{ textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const }}>Time to Target</div><div style={{ color: theme.text, fontSize: '24px', fontWeight: 800 }}>{Math.floor(calculatorResult.totalMonths/12)}y {calculatorResult.totalMonths%12}m</div></div><div style={{ textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const }}>Future Value</div><div style={{ color: theme.success, fontSize: '24px', fontWeight: 800 }}>${calculatorResult.futureValue.toLocaleString()}</div></div><div style={{ textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const }}>You Contribute</div><div style={{ color: theme.text, fontSize: '24px', fontWeight: 800 }}>${calculatorResult.totalContributed.toLocaleString()}</div></div><div style={{ textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase' as const }}>Interest Earned</div><div style={{ color: theme.purple, fontSize: '24px', fontWeight: 800 }}>${calculatorResult.interestEarned.toLocaleString()}</div><div style={{ color: theme.success, fontSize: '11px', marginTop: '2px' }}>FREE money from compounding!</div></div></div>)}
            </div>
          </div>
        )}

        {activeTab === 'path' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            <div style={{ padding: '32px', background: 'linear-gradient(135deg, '+theme.success+'20, '+theme.purple+'20)', borderRadius: '24px', border: '2px solid '+theme.success }}>
              <h2 style={{ margin: '0 0 24px 0', color: theme.text, fontSize: '28px' }}>🎯 Financial Independence Path</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
                <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px' }}><div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>FIRE Number</div><div style={{ color: theme.success, fontSize: '32px', fontWeight: 800 }}>${fiPath.fireNumber.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>25x annual expenses</div></div>
                <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px' }}><div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>Years to FI</div><div style={{ color: theme.purple, fontSize: '32px', fontWeight: 800 }}>{fiPath.yearsToFI > 100 ? '∞' : fiPath.yearsToFI}</div></div>
                <div style={{ padding: '20px', background: theme.cardBg, borderRadius: '16px' }}><div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>Passive Coverage</div><div style={{ color: fiPath.passiveCoverage >= 100 ? theme.success : theme.warning, fontSize: '32px', fontWeight: 800 }}>{fiPath.passiveCoverage.toFixed(0)}%</div><div style={{ width: '100%', height: '8px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}><div style={{ width: Math.min(fiPath.passiveCoverage, 100) + '%', height: '100%', background: fiPath.passiveCoverage >= 100 ? theme.success : theme.warning, borderRadius: '4px' }} /></div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[{l:'Monthly Need',v:'$'+fiPath.monthlyNeed.toFixed(0),c:theme.text},{l:'Passive Income',v:'$'+passiveIncome.toFixed(0),c:theme.success},{l:'Gap',v:'$'+fiPath.passiveGap.toFixed(0),c:theme.danger},{l:'Surplus',v:'$'+monthlySurplus.toFixed(0),c:monthlySurplus>=0?theme.success:theme.danger}].map((s,i) => (<div key={i} style={{ padding: '16px', background: theme.cardBg, borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>{s.l}</div><div style={{ color: s.c, fontSize: '20px', fontWeight: 700 }}>{s.v}</div></div>))}
              </div>
            </div>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '20px' }}>💰 Income Breakdown</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ padding: '20px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>🏃 Active Income</div><div style={{ color: theme.success, fontSize: '28px', fontWeight: 700 }}>${activeIncome.toFixed(0)}/mo</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{(100-passiveIncomePercentage).toFixed(0)}%</div></div>
                <div style={{ padding: '20px', background: darkMode ? '#2d1e3a' : '#faf5ff', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>🌴 Passive Income</div><div style={{ color: theme.purple, fontSize: '28px', fontWeight: 700 }}>${passiveIncome.toFixed(0)}/mo</div><div style={{ color: theme.textMuted, fontSize: '12px' }}>{passiveIncomePercentage.toFixed(0)}%</div></div>
              </div>
            </div>
            {/* BABY STEPS TO FINANCIAL FREEDOM */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '22px' }}>👶 Baby Steps to Financial Freedom</h3>
              <p style={{ margin: '0 0 20px 0', color: theme.textMuted, fontSize: '13px' }}>Inspired by Dave Ramsey, adapted for Australia. Click each step to take action!</p>
              {(() => {
                const emergencyFund = goals.find(g => g.name.toLowerCase().match(/emergency|rainy|starter/))
                const emergencyPct = emergencyFund ? (parseFloat(emergencyFund.saved||'0') / parseFloat(emergencyFund.target||'1')) * 100 : 0
                const allDebtsExMortgage = debts.filter(d => !d.name.toLowerCase().match(/mortgage|home loan/))
                const allDebtsCleared = allDebtsExMortgage.length === 0 || allDebtsExMortgage.every(d => parseFloat(d.balance||'0') <= 0)
                const fullEmergency = goals.find(g => g.name.toLowerCase().match(/full emergency|3.month|6.month/))
                const fullEmPct = fullEmergency ? (parseFloat(fullEmergency.saved||'0') / parseFloat(fullEmergency.target||'1')) * 100 : 0
                const investGoal = goals.find(g => g.name.toLowerCase().match(/invest|etf|shares|super/))
                const investPct = passiveIncomePercentage
                const propertyGoal = goals.find(g => g.name.toLowerCase().match(/house|property|home deposit|deposit/))
                const propertyPct = propertyGoal ? (parseFloat(propertyGoal.saved||'0') / parseFloat(propertyGoal.target||'1')) * 100 : 0
                const mortgage = debts.find(d => d.name.toLowerCase().match(/mortgage|home loan/))
                const mortgagePaid = !mortgage || parseFloat(mortgage.balance||'0') <= 0
                const steps = [
                  { num: 1, title: '$1,000 Starter Emergency Fund', icon: '🏦', done: emergencyPct >= 100, progress: Math.min(emergencyPct, 100),
                    desc: 'Save $1,000 as fast as possible. Sell stuff, pick up extra shifts, cut expenses. This protects you from small emergencies so you don\'t need credit cards.',
                    tip: 'Keep it in a separate high-interest savings account so you\'re not tempted to touch it.',
                    actions: [
                      { label: '🎯 Create $1K Emergency Goal', action: () => createGoalFromStep('Starter Emergency Fund', '1000', 'weekly', '50'), disabled: !!emergencyFund },
                      { label: '📅 View Calendar', action: () => { setActiveTab('dashboard' as any) }, disabled: false },
                    ],
                    linkedGoal: emergencyFund,
                    auTips: ['Open a fee-free HISA (ING, UBank, Up Bank)', 'Use round-up apps like Raiz to save spare change', 'Sell unused items on Facebook Marketplace or Gumtree'] },
                  { num: 2, title: 'Pay Off All Debt (except mortgage)', icon: '⚔️', done: allDebtsCleared,
                    progress: allDebtsExMortgage.length > 0 ? Math.max(0, allDebtsExMortgage.reduce((s: any,d: any) => { const o=parseFloat(d.originalBalance||d.balance||'0'); const c=parseFloat(d.balance||'0'); return s + ((o-c)/o)*100 }, 0) / allDebtsExMortgage.length) : 100,
                    desc: 'Use the ' + payoffMethod + ' method. Attack your debts with everything you\'ve got! Every dollar freed from debt becomes a dollar building wealth.',
                    tip: 'The ' + payoffMethod + ' method is already set up in your Debt Boss Battles section.',
                    actions: [
                      { label: '⚔️ Go to Debt Boss Battles', action: () => { setActiveTab('dashboard' as any); setTimeout(() => window.scrollTo({top: document.querySelector('[class*=debt]')?.getBoundingClientRect().top || 800, behavior: 'smooth'}), 100) }, disabled: false },
                      { label: '🔄 Switch to ' + (payoffMethod === 'avalanche' ? 'Snowball' : 'Avalanche'), action: () => setPayoffMethod(payoffMethod === 'avalanche' ? 'snowball' : 'avalanche'), disabled: false },
                    ],
                    linkedGoal: null,
                    auTips: ['Consolidate credit cards to a 0% balance transfer', 'Call providers to negotiate lower rates', 'HECS-HELP is indexed, not interest — prioritise higher-rate debts first'] },
                  { num: 3, title: '3-6 Months Full Emergency Fund', icon: '🛡️', done: fullEmPct >= 100, progress: Math.min(fullEmPct, 100),
                    desc: totalOutgoing > 0 ? 'Your monthly expenses are $' + totalOutgoing.toFixed(0) + '/mo. You need $' + (totalOutgoing * 3).toFixed(0) + ' (3 months) to $' + (totalOutgoing * 6).toFixed(0) + ' (6 months). This covers you if you lose your job or have a major expense.' : 'Add your expenses in the Dashboard first so we can calculate your 3-6 month target. This fund covers you if you lose your job.',
                    tip: 'This should be boring money — safe, accessible, earning some interest.',
                    actions: [
                      { label: '🎯 3-Month Fund ($' + (totalOutgoing * 3).toFixed(0) + ')', action: () => createGoalFromStep('Full Emergency Fund (3 months)', String(Math.round(totalOutgoing * 3)), 'monthly', String(Math.round(totalOutgoing * 3 / 12))), disabled: !!fullEmergency },
                      { label: '🎯 6-Month Fund ($' + (totalOutgoing * 6).toFixed(0) + ')', action: () => createGoalFromStep('Full Emergency Fund (6 months)', String(Math.round(totalOutgoing * 6)), 'monthly', String(Math.round(totalOutgoing * 6 / 12))), disabled: !!fullEmergency },
                    ],
                    linkedGoal: fullEmergency,
                    auTips: ['ING Savings Maximiser (high rate with conditions)', 'UBank USaver (no conditions, decent rate)', 'Keep in offset account if you have a mortgage later'] },
                  { num: 4, title: 'Invest 15% Into Super + Shares', icon: '📈', done: investPct >= 15, progress: Math.min((investPct / 15) * 100, 100),
                    desc: monthlyIncome > 0 ? 'Your monthly income is $' + monthlyIncome.toFixed(0) + '. 15% = $' + (monthlyIncome * 0.15).toFixed(0) + '/month ($' + (monthlyIncome * 0.15 * 12).toFixed(0) + '/year). Split between super salary sacrifice and index funds (VAS, VGS, VDHG).' : 'Add your income streams in the Dashboard first so we can calculate your 15% target. Then invest in super salary sacrifice + low-cost index funds.',
                    tip: 'Target: $' + (monthlyIncome * 0.15).toFixed(0) + '/month (15% of your income).',
                    actions: [
                      { label: '🎯 Invest 15% ($' + (monthlyIncome * 0.15).toFixed(0) + '/mo)', action: () => createGoalFromStep('Monthly Investment (15%)', String(Math.round(monthlyIncome * 0.15 * 12)), 'monthly', String(Math.round(monthlyIncome * 0.15))), disabled: !!investGoal },
                      { label: '💎 View Passive Income Quest Board', action: () => setActiveTab('overview' as any), disabled: false },
                    ],
                    linkedGoal: investGoal,
                    auTips: ['Vanguard VAS (ASX 300), VGS (International), VDHG (Diversified)', 'Super salary sacrifice up to $30,000/year concessional cap', 'Use SelfWealth, CMC, or Stake for low brokerage', 'Consider FHSS scheme — withdraw $50K from super for first home'] },
                  { num: 5, title: '🏠 Save for Property Deposit', icon: '🏠', done: propertyPct >= 100, progress: Math.min(propertyPct, 100),
                    desc: 'Save for your first home or investment property. In Australia, aim for 20% deposit to avoid LMI, or use government schemes for 5% deposit.',
                    tip: 'Click "Home Buying Guide" below for a complete Australian property roadmap!',
                    actions: [
                      { label: '🎯 Create Home Deposit Goal', action: () => { const price = prompt('What property price are you targeting? (e.g. 600000)'); if (price) { const p = parseFloat(price); const deposit = Math.round(p * 0.2); const extras = 3700; const total = deposit + extras; const monthly = Math.round(total / 24); createGoalFromStep('Home Deposit (20% of $' + p.toLocaleString() + ' + costs)', String(total), 'monthly', String(monthly)) } }, disabled: !!propertyGoal },
                      { label: '🏡 Open Home Buying Guide', action: () => setShowHomeBuyingGuide(!showHomeBuyingGuide), disabled: false },
                    ],
                    linkedGoal: propertyGoal,
                    auTips: ['First Home Owner Grant (FHOG) varies by state', 'First Home Guarantee — buy with 5% deposit, no LMI', 'Stamp duty concessions for first home buyers', 'FHSS Scheme — salary sacrifice up to $50K into super then withdraw for deposit'] },
                  { num: 6, title: 'Pay Off Mortgage Early', icon: '🏡', done: mortgagePaid,
                    progress: mortgage ? Math.max(0, 100 - (parseFloat(mortgage.balance||'0') / parseFloat(mortgage.originalBalance||mortgage.balance||'1')) * 100) : 0,
                    desc: 'Every extra dollar on your mortgage saves years of interest. Use an offset account for liquidity while reducing interest.',
                    tip: 'Even $50/week extra can save tens of thousands in interest and cut years off your loan.',
                    actions: [
                      { label: '⚔️ Add Mortgage as Debt Boss', action: () => { const bal = prompt('Mortgage balance remaining?'); if (bal) { const rate = prompt('Interest rate? (e.g. 6.2)'); const minPay = prompt('Monthly repayment?'); if (rate && minPay) { setDebts(prev => [...prev, { id: Date.now(), name: 'Home Loan', balance: bal, originalBalance: bal, interestRate: rate, minPayment: minPay, frequency: 'monthly', paymentDate: new Date().toISOString().split('T')[0] }]); awardXP(20) } } }, disabled: !!mortgage },
                      { label: '📅 View Calendar', action: () => setActiveTab('dashboard' as any), disabled: false },
                    ],
                    linkedGoal: null,
                    auTips: ['Use 100% offset account to park emergency fund + savings', 'Make fortnightly payments instead of monthly (26 half-payments = 13 months)', 'Refinance every 2-3 years to get competitive rates', 'Consider splitting loan: fixed + variable for flexibility'] },
                  { num: 7, title: 'Build Wealth & Give Generously', icon: '🏆', done: fiPath.passiveCoverage >= 100, progress: Math.min(fiPath.passiveCoverage, 100),
                    desc: 'Passive income covers your expenses. You are financially free! Continue investing, diversify income, help others, and live on your terms.',
                    tip: 'Passive income: $' + passiveIncome.toFixed(0) + '/mo vs Expenses: $' + totalOutgoing.toFixed(0) + '/mo (' + fiPath.passiveCoverage.toFixed(0) + '% covered)',
                    actions: [
                      { label: '🎯 View FIRE Path', action: () => setActiveTab('path' as any), disabled: false },
                      { label: '💎 View Overview Dashboard', action: () => setActiveTab('overview' as any), disabled: false },
                    ],
                    linkedGoal: null,
                    auTips: ['Franking credits on Australian dividends boost returns', 'Consider a family trust for asset protection', 'Transition to retirement (TTR) pension strategy in super', 'Give through tax-deductible DGR charities'] },
                  { num: 8, title: 'FIRE Number: $' + fiPath.fireNumber.toLocaleString(), icon: '🔥',
                    done: assets.reduce((s: number, a: any) => s + parseFloat(a.value || '0'), 0) >= fiPath.fireNumber && fiPath.fireNumber > 0,
                    progress: fiPath.fireNumber > 0 ? Math.min((assets.reduce((s: number, a: any) => s + parseFloat(a.value || '0'), 0) / fiPath.fireNumber) * 100, 100) : 0,
                    desc: fiPath.fireNumber > 0 ? 'Your FIRE number is $' + fiPath.fireNumber.toLocaleString() + ' (25x your annual expenses of $' + (totalOutgoing * 12).toFixed(0) + '). At a 4% safe withdrawal rate, this invested amount provides $' + totalOutgoing.toFixed(0) + '/mo forever — enough to cover all your expenses without working.' : 'Add your expenses to calculate your FIRE number. It\'s 25x your annual expenses — the amount you need invested to live off the returns forever.',
                    tip: fiPath.yearsToFI <= 100 ? 'At your current savings rate, you\'ll reach FIRE in approximately ' + fiPath.yearsToFI + ' years. Every extra $100/month invested can shave years off!' : 'Start by reducing expenses and increasing your savings rate. Even small changes compound over decades.',
                    actions: [
                      { label: '🎯 Create FIRE Number Goal', action: () => { if (fiPath.fireNumber <= 0) { alert('Add your expenses first so we can calculate your FIRE number!'); return } createGoalFromStep('FIRE Number Target', String(Math.round(fiPath.fireNumber)), 'monthly', String(Math.round(monthlySurplus > 0 ? monthlySurplus * 0.5 : 500))) }, disabled: !!goals.find(g => g.name.match(/FIRE|fire/)) },
                      { label: '🧮 Open Goal Calculator', action: () => { setActiveTab('overview' as any) }, disabled: false },
                      { label: '🎯 View FIRE Path', action: () => setActiveTab('path' as any), disabled: false },
                    ],
                    linkedGoal: goals.find(g => g.name.match(/FIRE|fire/)) || null,
                    auTips: [
                      'The 4% Rule: Invest 25x expenses, withdraw 4%/year, money lasts 30+ years (Trinity Study)',
                      'Reduce expenses = double win: need less AND save more. $100/mo less = $30K less FIRE number',
                      'Lean FIRE ($40K/yr) vs Fat FIRE ($100K/yr) — pick your lifestyle level',
                      'Super counts! Your super balance is part of your FIRE number (accessible at preservation age 60)',
                      'Geographic arbitrage: lower cost of living areas = lower FIRE number. Consider regional AU or part-time overseas',
                      'The Barefoot Investor buckets: 60% Daily, 20% Splurge, 10% Smile, 10% Fire Extinguisher',
                      'Sequence of returns risk: keep 2-3 years cash buffer when you first FIRE',
                      'Consider "Coast FIRE": save enough early that compounding alone reaches your goal by 60'
                    ] },
                ]
                const currentStep = steps.findIndex(s => !s.done) + 1 || steps.length
                return (<>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>{steps.map((s,i) => (<div key={i} style={{ flex: 1, height: '8px', borderRadius: '4px', background: s.done ? theme.success : i === currentStep - 1 ? theme.warning : (darkMode ? '#334155' : '#e2e8f0'), cursor: 'pointer' }} onClick={() => setExpandedStep(expandedStep === s.num ? null : s.num)} />))}</div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                    {steps.map((step, i) => {
                      const isCurrent = i === currentStep - 1
                      const isExpanded = expandedStep === step.num || isCurrent
                      return (
                        <div key={step.num} style={{ padding: isExpanded ? '20px' : '14px 16px', background: step.done ? theme.success+'10' : isCurrent ? (darkMode ? '#334155' : '#fffbeb') : (darkMode ? '#1e293b' : '#fafafa'), borderRadius: '14px', border: step.done ? '2px solid '+theme.success+'40' : isCurrent ? '2px solid '+theme.warning : '1px solid '+theme.border, opacity: !step.done && !isCurrent && !isExpanded ? 0.6 : 1, cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => setExpandedStep(expandedStep === step.num ? null : step.num)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: step.done ? theme.success : isCurrent ? theme.warning : (darkMode ? '#334155' : '#e2e8f0'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: step.done ? '20px' : '16px', color: step.done || isCurrent ? 'white' : theme.textMuted, fontWeight: 900, flexShrink: 0 }}>{step.done ? '✓' : step.num}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: step.done ? theme.success : theme.text, fontWeight: 700, fontSize: isExpanded ? '16px' : '14px' }}>{step.icon} {step.title}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {step.done && <span style={{ padding: '2px 10px', background: theme.success+'20', color: theme.success, borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>DONE ✓</span>}
                                  {step.linkedGoal && <span style={{ padding: '2px 10px', background: theme.accent+'20', color: theme.accent, borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>📊 Tracking</span>}
                                  <span style={{ color: theme.textMuted, fontSize: '16px', transition: 'transform 0.3s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                                </div>
                              </div>
                              {(isCurrent || step.done || isExpanded) && step.progress > 0 && step.progress < 100 && (
                                <div style={{ marginTop: '8px' }}><div style={{ width: '100%', height: '8px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: step.progress+'%', height: '100%', background: step.done ? theme.success : theme.warning, borderRadius: '4px' }} /></div><div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '2px' }}>{step.progress.toFixed(0)}% complete</div></div>
                              )}
                            </div>
                          </div>
                          {isExpanded && (
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid '+theme.border }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ color: theme.textMuted, fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>{step.desc}</div>
                              <div style={{ padding: '12px 16px', background: theme.warning+'10', borderRadius: '10px', borderLeft: '4px solid '+theme.warning, marginBottom: '16px' }}><div style={{ color: theme.warning, fontSize: '13px', fontWeight: 700 }}>💡 {step.tip}</div></div>
                              {step.linkedGoal && (
                                <div style={{ padding: '12px 16px', background: theme.accent+'10', borderRadius: '10px', marginBottom: '16px', border: '1px solid '+theme.accent+'30' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div><span style={{ color: theme.accent, fontWeight: 700, fontSize: '13px' }}>📊 Linked Goal: {step.linkedGoal.name}</span><div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '2px' }}>${parseFloat(step.linkedGoal.saved||'0').toFixed(0)} of ${parseFloat(step.linkedGoal.target||'0').toFixed(0)} saved</div></div>
                                    <div style={{ textAlign: 'right' as const }}><div style={{ color: theme.success, fontWeight: 800, fontSize: '18px' }}>{((parseFloat(step.linkedGoal.saved||'0')/parseFloat(step.linkedGoal.target||'1'))*100).toFixed(0)}%</div>{step.linkedGoal.paymentAmount && <div style={{ color: theme.textMuted, fontSize: '11px' }}>${step.linkedGoal.paymentAmount}/{step.linkedGoal.savingsFrequency}</div>}</div>
                                  </div>
                                </div>
                              )}
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, marginBottom: '16px' }}>
                                {step.actions.map((act, ai) => (
                                  <button key={ai} onClick={(e) => { e.stopPropagation(); act.action() }} disabled={act.disabled} style={{ padding: '10px 16px', background: act.disabled ? (darkMode ? '#334155' : '#e2e8f0') : ai === 0 ? theme.success : theme.accent, color: act.disabled ? theme.textMuted : 'white', border: 'none', borderRadius: '10px', cursor: act.disabled ? 'default' : 'pointer', fontSize: '13px', fontWeight: 600, opacity: act.disabled ? 0.5 : 1 }}>{act.label}</button>
                                ))}
                              </div>
                              <div style={{ padding: '12px 16px', background: darkMode ? '#1e293b' : '#f0f9ff', borderRadius: '10px', border: '1px solid '+theme.border }}>
                                <div style={{ color: theme.accent, fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>🇦🇺 Australian Tips</div>
                                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
                                  {step.auTips.map((tip: string, ti: number) => (<div key={ti} style={{ color: theme.textMuted, fontSize: '12px', paddingLeft: '12px', borderLeft: '2px solid '+theme.accent+'30' }}>{tip}</div>))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ marginTop: '16px', padding: '14px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const }}><span style={{ color: theme.text, fontWeight: 700 }}>Currently on Step {currentStep} of 8</span><span style={{ color: theme.textMuted, fontSize: '13px', display: 'block', marginTop: '4px' }}>Click any step to expand it and take action</span></div>
                </>)
              })()}
            </div>

            {/* AUSTRALIAN HOME BUYING GUIDE */}
            <div style={cardStyle}>
              <div onClick={() => setShowHomeBuyingGuide(!showHomeBuyingGuide)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>🏡</div>
                  <div><h3 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>Australian Home Buying Roadmap</h3><p style={{ margin: '4px 0 0', color: theme.textMuted, fontSize: '13px' }}>Complete step-by-step guide to buying property in Australia</p></div>
                </div>
                <div style={{ fontSize: '20px', color: theme.textMuted, transition: 'transform 0.3s', transform: showHomeBuyingGuide ? 'rotate(180deg)' : 'rotate(0)' }}>▼</div>
              </div>
              {showHomeBuyingGuide && (
                <div style={{ marginTop: '24px' }}>
                  {[
                    { phase: 'Phase 1: Get Financially Ready', color: '#10b981', icon: '💰', steps: [
                      { title: 'Check your credit score', detail: 'Get your free credit report from Equifax, Experian, or Illion. Score above 700 is good. Fix any errors before applying for a loan.' },
                      { title: 'Save your deposit', detail: '20% deposit avoids Lenders Mortgage Insurance (LMI). On a $600K home = $120K. Use FHSS scheme to boost savings via super.' },
                      { title: 'First Home Super Saver Scheme (FHSS)', detail: 'Salary sacrifice up to $15K/year (max $50K total) into super, then withdraw for your first home deposit. Saves tax and grows faster.' },
                      { title: 'Reduce existing debts', detail: 'Lenders check your debt-to-income ratio. Pay off credit cards, BNPL, and personal loans. Close unused credit cards — even $0 balance counts against you.' },
                      { title: 'Build genuine savings', detail: 'Lenders want to see 3+ months of consistent saving. Regular deposits into a dedicated savings account shows financial discipline.' },
                    ]},
                    { phase: 'Phase 2: Understand the Costs', color: '#3b82f6', icon: '📊', steps: [
                      { title: 'Stamp duty', detail: 'Varies by state. QLD: $0 on first home under $500K (house) or $550K (land). NSW: $0 under $800K for first home. VIC: $0 under $600K. Use your state\'s calculator.' },
                      { title: 'Lenders Mortgage Insurance (LMI)', detail: 'Charged when deposit is under 20%. Can add $10K-$30K+ to your loan. Avoid with 20% deposit, or use government guarantee schemes.' },
                      { title: 'Legal/conveyancing fees', detail: 'Solicitor or conveyancer: $1,500-$3,000. They handle contracts, title searches, settlement. Essential — never skip this.' },
                      { title: 'Building & pest inspections', detail: '$400-$800. Non-negotiable for houses. Finds structural issues, termites, and defects before you buy. Can save tens of thousands.' },
                      { title: 'Ongoing costs', detail: 'Council rates ($1,500-$3,000/yr), insurance ($1,500-$3,000/yr), body corp/strata if unit ($2,000-$8,000/yr), maintenance (budget 1% of home value/yr).' },
                    ]},
                    { phase: 'Phase 3: Government Schemes', color: '#8b5cf6', icon: '🏛️', steps: [
                      { title: 'First Home Owner Grant (FHOG)', detail: 'QLD: $30,000 for new homes under $750K. NSW: $10,000 new homes under $600K. VIC: $10,000 new homes under $750K. Must be new build or substantially renovated.' },
                      { title: 'First Home Guarantee (FHG)', detail: 'Buy with 5% deposit, government guarantees the rest — NO LMI. 35,000 places/year. Income cap: $125K single, $200K couple. Price caps vary by region.' },
                      { title: 'Regional First Home Buyer Guarantee', detail: '10,000 places/year for regional areas. Same benefits as FHG but for regional property purchases.' },
                      { title: 'Family Home Guarantee', detail: 'For single parents. Buy with just 2% deposit, no LMI. 5,000 places/year.' },
                      { title: 'Help to Buy (coming)', detail: 'Government co-owns up to 40% (new) or 30% (existing). You need just 2% deposit. 10,000 places/year when it launches.' },
                    ]},
                    { phase: 'Phase 4: Get Pre-Approved', color: '#f59e0b', icon: '🏦', steps: [
                      { title: 'Gather your documents', detail: 'Last 2 payslips, 3 months bank statements, tax returns (if self-employed), ID, and details of all debts and expenses.' },
                      { title: 'Use a mortgage broker', detail: 'Free for you (paid by lender). They compare 30+ lenders, know which ones suit your situation, and handle paperwork. Worth it.' },
                      { title: 'Get pre-approval', detail: 'Shows sellers you\'re serious. Usually valid 3-6 months. Gives you a budget to house hunt within. Doesn\'t commit you to that lender.' },
                      { title: 'Understand borrowing power', detail: 'Rule of thumb: 5-6x gross income. $100K income ≈ $500-600K borrowing. But consider if repayments work for YOUR budget, not just what the bank allows.' },
                    ]},
                    { phase: 'Phase 5: Buy Smart', color: '#ef4444', icon: '🎯', steps: [
                      { title: 'Research areas thoroughly', detail: 'Check flood maps, future development plans, school zones, transport, crime stats. Use Domain, REA, SQM Research for price data.' },
                      { title: 'Attend inspections', detail: 'Go to open homes. Take notes. Check water pressure, power points, storage, natural light, noise levels. Visit at different times of day.' },
                      { title: 'Get building & pest inspection', detail: 'BEFORE making an offer or going to auction. $400-$800 can save you from a $50K+ nightmare.' },
                      { title: 'Negotiate or bid smart', detail: 'Private treaty: always offer below asking. Auction: set your max and DO NOT go over. Emotion is expensive at auctions.' },
                      { title: 'Settlement', detail: 'Usually 30-90 days after contract. Your conveyancer handles everything. Final inspection before settlement. Then you get the keys!' },
                    ]},
                  ].map((phase, pi) => (
                    <div key={pi} style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: phase.color+'20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{phase.icon}</div>
                        <h4 style={{ margin: 0, color: phase.color, fontSize: '16px', fontWeight: 700 }}>{phase.phase}</h4>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', paddingLeft: '16px', borderLeft: '3px solid '+phase.color+'30' }}>
                        {phase.steps.map((s, si) => (
                          <div key={si} style={{ padding: '12px 16px', background: darkMode ? '#1e293b' : '#fafafa', borderRadius: '10px', border: '1px solid '+theme.border }}>
                            <div style={{ color: theme.text, fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{s.title}</div>
                            <div style={{ color: theme.textMuted, fontSize: '12px', lineHeight: 1.6 }}>{s.detail}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#fffbeb', borderRadius: '16px', border: '2px solid '+theme.warning+'40', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: theme.warning, fontSize: '18px' }}>🧮 Home Buying Cost Calculator</h4>
                    <p style={{ color: theme.textMuted, fontSize: '12px', margin: '0 0 16px 0' }}>Enter a property price to see all the costs involved</p>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center' }}>
                      <span style={{ color: theme.warning, fontWeight: 700, fontSize: '16px' }}>$</span>
                      <input type="number" placeholder="Property price (e.g. 600000)" id="homePriceCalc" style={{ ...inputStyle, flex: 1, fontSize: '16px', fontWeight: 700, padding: '12px 16px' }} title="Enter your target property price" onChange={(e) => {
                        const price = parseFloat(e.target.value || '0')
                        const el = document.getElementById('homeCostResults')
                        if (el && price > 0) {
                          const deposit20 = price * 0.20
                          const deposit5 = price * 0.05
                          const stampDutyQLD = price <= 500000 ? 0 : price <= 1000000 ? (price - 500000) * 0.0375 : (price - 500000) * 0.045
                          const stampDutyNSW = price <= 800000 ? 0 : price <= 1000000 ? (price - 800000) * 0.04 : (price - 800000) * 0.045 + 8000
                          const stampDutyVIC = price <= 600000 ? 0 : price <= 750000 ? (price - 600000) * 0.05 : (price - 600000) * 0.055
                          const lmi5pct = price * 0.032
                          const lmi10pct = price * 0.018
                          const conveyancing = 2500
                          const inspections = 700
                          const loanCosts = 500
                          const total20 = deposit20 + conveyancing + inspections + loanCosts
                          const total5 = deposit5 + lmi5pct + conveyancing + inspections + loanCosts
                          const monthlyRepay = (price * 0.8 * (0.065/12)) / (1 - Math.pow(1 + 0.065/12, -360))
                          el.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px"><div style="padding:16px;background:'+(darkMode?'#0f172a':'white')+';border-radius:12px;border:2px solid #10b98140"><div style="color:#10b981;font-weight:800;font-size:14px;margin-bottom:12px">💪 With 20% Deposit</div><div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid '+(darkMode?'#334155':'#e2e8f0')+'"><span style="color:'+(darkMode?'#94a3b8':'#64748b')+';font-size:13px">Deposit (20%)</span><span style="color:'+(darkMode?'#f1f5f9':'#1e293b')+';font-weight:700">$'+deposit20.toLocaleString()+'</span></div><div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid '+(darkMode?'#334155':'#e2e8f0')+'"><span style="color:'+(darkMode?'#94a3b8':'#64748b')+';font-size:13px">LMI</span><span style="color:#10b981;font-weight:700">$0 (avoided!)</span></div><div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid '+(darkMode?'#334155':'#e2e8f0')+'"><span style="color:'+(darkMode?'#94a3b8':'#64748b')+';font-size:13px">Conveyancing</span><span style="color:'+(darkMode?'#f1f5f9':'#1e293b')+';font-weight:700">$'+conveyancing.toLocaleString()+'</span></div><div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid '+(darkMode?'#334155':'#e2e8f0')+'"><span style="color:'+(darkMode?'#94a3b8':'#64748b')+';font-size:13px">Inspections</span><span style="color:'+(darkMode?'#f1f5f9':'#1e293b')+';font-weight:700">$'+inspections.toLocaleString()+'</span></div><div style="display:flex;justify-content:space-between;padding:8px 0;margin-top:4px"><span style="color:#10b981;font-weight:800;font-size:15px">TOTAL NEEDED</span><span style="color:#10b981;font-weight:900;font-size:18px">$'+Math.round(total20).toLocaleString()+'</span></div></div><div style="padding:16px;background:'+(darkMode?'#0f172a':'white')+';border-radius:12px;border:2px solid #f59e0b40"><div style="color:#f59e0b;font-weight:800;font-size:14px;margin-bottom:12px">⚡ With 5% Deposit (Gov Scheme)</div><div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid '+(darkMode?'#334155':'#e2e8f0')+'"><span style="color:'+(darkMode?'#94a3b8':'#64748b')+';font-size:13px">Deposit (5%)</span><span style="color:'+(darkMode?'#f1f5f9':'#1e293b')+';font-weight:700">$'+deposit5.toLocaleString()+'</span></div><div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid '+(darkMode?'#334155':'#e2e8f0')+'"><span style="color:'+(darkMode?'#94a3b8':'#64748b')+';font-size:13px">LMI (if no guarantee)</span><span style="color:#ef4444;font-weight:700">~$'+Math.round(lmi5pct).toLocaleString()+'</span></div><div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid '+(darkMode?'#334155':'#e2e8f0')+'"><span style="color:'+(darkMode?'#94a3b8':'#64748b')+';font-size:13px">LMI with FHG</span><span style="color:#10b981;font-weight:700">$0 (waived!)</span></div><div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid '+(darkMode?'#334155':'#e2e8f0')+'"><span style="color:'+(darkMode?'#94a3b8':'#64748b')+';font-size:13px">Other costs</span><span style="color:'+(darkMode?'#f1f5f9':'#1e293b')+';font-weight:700">$'+(conveyancing+inspections+loanCosts).toLocaleString()+'</span></div><div style="display:flex;justify-content:space-between;padding:8px 0;margin-top:4px"><span style="color:#f59e0b;font-weight:800;font-size:15px">TOTAL (with FHG)</span><span style="color:#f59e0b;font-weight:900;font-size:18px">$'+Math.round(deposit5+conveyancing+inspections+loanCosts).toLocaleString()+'</span></div></div></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px"><div style="padding:12px;background:'+(darkMode?'#0f172a':'#fafafa')+';border-radius:10px;text-align:center;border:1px solid '+(darkMode?'#334155':'#e2e8f0')+'"><div style="color:'+(darkMode?'#94a3b8':'#64748b')+';font-size:10px;text-transform:uppercase">Stamp Duty (QLD 1st Home)</div><div style="color:'+(stampDutyQLD===0?'#10b981':(darkMode?'#f1f5f9':'#1e293b'))+';font-size:20px;font-weight:800">'+(stampDutyQLD===0?'$0 ✓':'$'+Math.round(stampDutyQLD).toLocaleString())+'</div></div><div style="padding:12px;background:'+(darkMode?'#0f172a':'#fafafa')+';border-radius:10px;text-align:center;border:1px solid '+(darkMode?'#334155':'#e2e8f0')+'"><div style="color:'+(darkMode?'#94a3b8':'#64748b')+';font-size:10px;text-transform:uppercase">Monthly Repayment (6.5%)</div><div style="color:'+(darkMode?'#f1f5f9':'#1e293b')+';font-size:20px;font-weight:800">$'+Math.round(monthlyRepay).toLocaleString()+'</div></div><div style="padding:12px;background:'+(darkMode?'#0f172a':'#fafafa')+';border-radius:10px;text-align:center;border:1px solid '+(darkMode?'#334155':'#e2e8f0')+'"><div style="color:'+(darkMode?'#94a3b8':'#64748b')+';font-size:10px;text-transform:uppercase">You Save with FHG</div><div style="color:#10b981;font-size:20px;font-weight:800">$'+Math.round(deposit20-deposit5+lmi5pct).toLocaleString()+'</div></div></div>'
                        } else if (el) { el.innerHTML = '' }
                      }} />
                    </div>
                    <div id="homeCostResults"></div>
                  </div>
                  <div style={{ padding: '16px', background: 'linear-gradient(135deg, '+theme.warning+'15, '+theme.success+'15)', borderRadius: '12px', textAlign: 'center' as const, border: '1px solid '+theme.warning+'30' }}>
                    <div style={{ fontSize: '20px', marginBottom: '8px' }}>🎯</div>
                    <div style={{ color: theme.text, fontWeight: 700, fontSize: '14px' }}>Ready to start?</div>
                    <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px', marginBottom: '12px' }}>Create a home deposit goal and add it to your calendar</div>
                    <button onClick={() => { const price = prompt('What property price are you targeting? (e.g. 600000)'); if (price) { const p = parseFloat(price); const deposit = Math.round(p * 0.2); const extras = 3700; const total = deposit + extras; const monthly = Math.round(total / 24); createGoalFromStep('Home Deposit (20% of $' + p.toLocaleString() + ' + costs)', String(total), 'monthly', String(monthly)) } }} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>🏠 Create Home Deposit Goal</button>
                  </div>
                </div>
              )}
            </div>

                                    <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '20px' }}>📊 Spending Breakdown</h3>
              {(() => { const cats:{[k:string]:number}={}; expenses.filter(e=>!e.targetDebtId&&!e.targetGoalId).forEach(exp=>{const c=exp.category||'other';cats[c]=(cats[c]||0)+convertToMonthly(parseFloat(exp.amount||'0'),exp.frequency)}); const sorted=Object.entries(cats).sort((a,b)=>b[1]-a[1]); const total=sorted.reduce((s,[,v])=>s+v,0); const cc:{[k:string]:string}={housing:'#8b5cf6',utilities:'#3b82f6',food:'#f59e0b',transport:'#10b981',entertainment:'#f472b6',shopping:'#ef4444',health:'#14b8a6',subscriptions:'#6366f1',savings:'#10b981',other:'#94a3b8'}; return sorted.map(([cat,amt]) => (<div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}><span style={{ width: '100px', color: theme.text, fontWeight: 600, fontSize: '13px', textTransform: 'capitalize' as const }}>{cat}</span><div style={{ flex: 1, height: '24px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '12px', overflow: 'hidden' }}><div style={{ width: (total>0?(amt/total)*100:0)+'%', height: '100%', background: cc[cat]||'#94a3b8', borderRadius: '12px' }} /></div><span style={{ color: theme.text, fontWeight: 700, fontSize: '13px', width: '70px', textAlign: 'right' as const }}>${amt.toFixed(0)}</span></div>)) })()}
            </div>
          </div>
        )}

        {activeTab === 'trading' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>

            {/* TRADER RANK HERO */}
            
            {/* === AI TRADING COACH === */}
            <div style={{ ...cardStyle, border: '2px solid ' + (coachOpen ? theme.accent+'60' : theme.border), background: coachOpen ? (darkMode ? 'linear-gradient(135deg, #1e293b, #172554)' : 'linear-gradient(135deg, #eff6ff, #f5f3ff)') : theme.cardBg }}>
              <div onClick={() => setCoachOpen(!coachOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🧠</div>
                  <div><h3 style={{ margin: 0, color: theme.text, fontSize: '18px', fontWeight: 700 }}>AI Trading Coach</h3><span style={{ color: theme.textMuted, fontSize: '11px' }}>Strategy • Psychology • Trade Review • Planning</span></div>
                </div>
                <div style={{ fontSize: '20px', color: theme.textMuted, transition: 'transform 0.3s', transform: coachOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</div>
              </div>
              {coachOpen && (
                <div style={{ marginTop: '16px' }}>
                  {/* MY STRATEGY */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: theme.text, fontSize: '13px', fontWeight: 700 }}>📜 My Trading Strategy</span>
                      <button onClick={() => setShowStrategyEditor(!showStrategyEditor)} style={{ padding: '4px 12px', background: showStrategyEditor ? theme.accent : 'transparent', color: showStrategyEditor ? 'white' : theme.accent, border: '1px solid '+theme.accent, borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>{showStrategyEditor ? 'Save' : myStrategy ? 'Edit' : '+ Define Strategy'}</button>
                    </div>
                    {showStrategyEditor ? (
                      <div style={{ background: darkMode ? '#0f172a' : '#f0f9ff', borderRadius: '12px', padding: '16px', border: '1px solid '+theme.accent+'30' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ color: theme.accent, fontSize: '13px', fontWeight: 700 }}>🧩 Strategy Builder — answer what you can, skip what you don{"'"}t know yet</span>
                          <button onClick={() => { setMyStrategy(strategyFromBuilder()); setShowStrategyEditor(false) }} style={{ padding: '6px 14px', background: theme.success, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>✓ Save Strategy</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                          {[
                            { key: 'experience', label: '📊 Trading Experience', placeholder: 'Brand new / 6 months / 2 years etc', icon: '🎓' },
                            { key: 'markets', label: '🌍 Markets & Instruments', placeholder: 'Forex (EURUSD, GBPUSD), Indices (NAS100), Gold...', icon: '📈' },
                            { key: 'timeframes', label: '⏱️ Timeframes', placeholder: '15min entries, 1H/4H for bias, Daily for direction...', icon: '🕐' },
                            { key: 'style', label: '🎯 Trading Style', placeholder: 'Scalping / Day trading / Swing / Break of structure / Supply & demand...', icon: '🏹' },
                            { key: 'entryRules', label: '🟢 Entry Rules — What makes you take a trade?', placeholder: 'Break of structure + retest, order block tap, fair value gap fill...', icon: '✅' },
                            { key: 'exitRules', label: '🔴 Exit Rules — How do you close trades?', placeholder: 'Fixed R:R (1:2), trail stop, close at next structure, time-based...', icon: '🚪' },
                            { key: 'riskPerTrade', label: '💰 Risk Per Trade', placeholder: '1% of account, fixed $50, depends on setup grade...', icon: '⚖️' },
                            { key: 'sessionsTime', label: '🕐 When Do You Trade?', placeholder: 'London open (8-11am), NY session, Asian...', icon: '🌏' },
                            { key: 'newsApproach', label: '📰 How Do You Handle News?', placeholder: 'Avoid trading during news, trade the reaction, close positions before...', icon: '📢' },
                            { key: 'maxTrades', label: '🔢 Max Trades Per Day', placeholder: '3 trades max, stop after 2 losses in a row...', icon: '🛑' },
                            { key: 'strengths', label: '💪 What Are You Good At?', placeholder: 'Patient entries, good at reading structure, disciplined on SL...', icon: '🌟' },
                            { key: 'weaknesses', label: '⚠️ What Are You Working On?', placeholder: 'Revenge trading, overtrading, moving stop loss, FOMO entries...', icon: '🔧' },
                          ].map(field => (
                            <div key={field.key} style={{ display: 'flex', flexDirection: 'column' as const }}>
                              <label style={{ color: theme.text, fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>{field.label}</label>
                              <input type="text" placeholder={field.placeholder} value={(strategyBuilder as any)[field.key] || ''} onChange={(e) => setStrategyBuilder(prev => ({...prev, [field.key]: e.target.value}))} style={{ ...inputStyle, fontSize: '12px', padding: '8px 10px' }} />
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: '10px' }}>
                          <label style={{ color: theme.text, fontSize: '11px', fontWeight: 600, marginBottom: '4px', display: 'block' }}>🎯 Trading Goals — What are you trying to achieve?</label>
                          <input type="text" placeholder="Pass prop firm challenge, consistent $200/day, build to full-time trading income..." value={strategyBuilder.goals || ''} onChange={(e) => setStrategyBuilder(prev => ({...prev, goals: e.target.value}))} style={{ ...inputStyle, width: '100%', fontSize: '12px', padding: '8px 10px' }} />
                        </div>
                        <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                          <button onClick={() => { setMyStrategy(strategyFromBuilder()); setShowStrategyEditor(false) }} style={{ flex: 1, padding: '10px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>✓ Save Strategy</button>
                          <button onClick={() => { setMyStrategy(strategyFromBuilder()); setShowStrategyEditor(false); setTimeout(() => sendCoachMessage('I just filled out my strategy builder. Can you review it, tell me what looks good, identify any gaps, and suggest what I should think about next? Be specific to my experience level.'), 200) }} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>🧠 Save & Ask Coach to Review</button>
                        </div>
                      </div>
                    ) : myStrategy ? (
                      <div style={{ padding: '12px', background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '8px', fontSize: '12px', color: theme.text, whiteSpace: 'pre-line' as const, maxHeight: '100px', overflow: 'hidden', position: 'relative' as const, cursor: 'pointer' }} onClick={() => setShowStrategyEditor(true)}>{myStrategy}<div style={{ position: 'absolute' as const, bottom: 0, left: 0, right: 0, height: '30px', background: darkMode ? 'linear-gradient(transparent, #0f172a)' : 'linear-gradient(transparent, #f8fafc)' }} /></div>
                    ) : (
                      <div onClick={() => setShowStrategyEditor(true)} style={{ padding: '20px', background: darkMode ? '#0f172a' : '#fefce8', borderRadius: '12px', textAlign: 'center' as const, border: '2px dashed '+theme.warning, cursor: 'pointer' }}>
                        <div style={{ fontSize: '24px', marginBottom: '6px' }}>🧩</div>
                        <div style={{ color: theme.warning, fontSize: '14px', fontWeight: 700 }}>Build Your Trading Strategy</div>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>Answer guided questions so the coach knows your style, rules, and goals</div>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '2px' }}>New to trading? No worries — skip what you don{"'"}t know and the coach will help fill the gaps</div>
                      </div>
                    )}
                  </div>
                  {/* QUICK ACTIONS */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '12px' }}>
                    {[{label:'Help me build my strategy',icon:'🧩'},{label:'Am I ready to trade?',icon:'🧘'},{label:'Review my session',icon:'📊'},{label:'Analyse my patterns',icon:'🔍'},{label:'Help me plan tomorrow',icon:'📋'},{label:'I\'m feeling tilted',icon:'😤'},{label:'Celebrate my wins!',icon:'🎉'}].map(q => (
                      <button key={q.label} onClick={() => sendCoachMessage(q.label)} style={{ padding: '6px 12px', background: darkMode ? '#334155' : '#f1f5f9', border: '1px solid '+theme.border, borderRadius: '20px', cursor: 'pointer', fontSize: '11px', color: theme.text, display: 'flex', alignItems: 'center', gap: '4px' }}><span>{q.icon}</span>{q.label}</button>
                    ))}
                  </div>
                  {/* CHAT */}
                  <div ref={coachChatRef} style={{ maxHeight: '400px', overflowY: 'auto' as const, marginBottom: '12px', padding: '12px', background: darkMode ? '#0f172a' : '#fafafa', borderRadius: '12px', border: '1px solid '+theme.border }}>
                    {coachMessages.length === 0 && (<div style={{ textAlign: 'center' as const, padding: '30px', color: theme.textMuted }}><div style={{ fontSize: '32px', marginBottom: '8px' }}>🧠</div><div style={{ fontSize: '14px', fontWeight: 600 }}>Your AI Trading Coach</div><div style={{ fontSize: '12px', marginTop: '4px' }}>Ask me anything about your trades, strategy, or psychology. I have full context of your data.</div></div>)}
                    {coachMessages.map((m, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '8px' }}>
                        <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: m.role === 'user' ? 'linear-gradient(135deg, #fbbf24, #d97706)' : (darkMode ? '#1e293b' : 'white'), color: m.role === 'user' ? 'white' : theme.text, fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-line' as const, border: m.role === 'assistant' ? '1px solid '+theme.border : 'none' }}>{m.content}</div>
                      </div>
                    ))}
                    {coachLoading && (<div style={{ display: 'flex', gap: '6px', padding: '10px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.accent, animation: 'pulse 1s infinite' }} /><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.accent, animation: 'pulse 1s infinite 0.2s' }} /><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.accent, animation: 'pulse 1s infinite 0.4s' }} /></div>)}
                  </div>
                  {/* INPUT */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" value={coachInput} onChange={(e) => setCoachInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendCoachMessage()} placeholder="Ask your trading coach..." style={{ ...inputStyle, flex: 1, fontSize: '13px', padding: '10px 14px' }} />
                    <button onClick={() => sendCoachMessage()} disabled={coachLoading || !coachInput.trim()} style={{ padding: '10px 20px', background: coachLoading ? theme.textMuted : 'linear-gradient(135deg, #fbbf24, #d97706)', color: 'white', border: 'none', borderRadius: '10px', cursor: coachLoading ? 'default' : 'pointer', fontSize: '13px', fontWeight: 700 }}>Send</button>
                  </div>
                </div>
              )}
            </div>

            {/* === COLLAPSIBLE SECTIONS === */}
            {[
              { id: 'presession', icon: '🧭', title: 'Pre-Session Setup', color: '#14b8a6' },
              { id: 'journal', icon: '📓', title: 'Trade Journal', color: theme.warning },
            ].map(sec => (
              <div key={sec.id} style={cardStyle}>
                <div onClick={() => toggleTradingSection(sec.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><div style={{ width: '44px', height: '44px', borderRadius: '12px', background: sec.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{sec.icon}</div><h3 style={{ margin: 0, color: theme.text, fontSize: '18px', fontWeight: 700 }}>{sec.title}</h3></div>
                  <div style={{ fontSize: '20px', color: theme.textMuted, transition: 'transform 0.3s', transform: tradingSections[sec.id] ? 'rotate(180deg)' : 'rotate(0)' }}>▼</div>
                </div>

                {/* JOURNAL */}
                {tradingSections[sec.id] && sec.id === 'presession' && (
                  <div style={{ padding: '16px' }}>
                    {/* SUB-TABS */}
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: darkMode ? '#0f172a' : '#f1f5f9', borderRadius: '10px', padding: '4px' }}>
                      {[{id:'session' as const,label:'📋 Session Plan',color:'#14b8a6'},{id:'mindset' as const,label:'🧠 Mindset',color:'#8b5cf6'},{id:'risk' as const,label:'🛡️ Risk',color:theme.danger},{id:'trades' as const,label:'🎯 Trade Plans',color:'#f59e0b'}].map(t => (
                        <button key={t.id} onClick={() => setPrepTab(t.id)} style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: 'none', background: prepTab === t.id ? t.color : 'transparent', color: prepTab === t.id ? 'white' : theme.textMuted, cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s' }}>{t.label}</button>
                      ))}
                    </div>

                    {/* SESSION PLAN TAB */}
                    {prepTab === 'session' && (
                      <div>
                        <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#fafafa', borderRadius: '12px', marginBottom: '16px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                            <div><label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>Market Bias</label><select value={sessionPlan.bias} onChange={(e) => setSessionPlan({ ...sessionPlan, bias: e.target.value })} style={{ ...inputStyle, width: '100%', fontSize: '12px' }}><option value="bullish">🟢 Bullish</option><option value="bearish">🔴 Bearish</option><option value="neutral">⚪ Neutral / Range</option></select></div>
                            <div><label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>Max Trades Today</label><input type="number" value={sessionPlan.maxTrades} onChange={(e) => setSessionPlan({ ...sessionPlan, maxTrades: e.target.value })} style={{ ...inputStyle, width: '100%', fontSize: '12px' }} /></div>
                            <div><label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>Max Loss Today $</label><input type="number" value={sessionPlan.maxLoss} onChange={(e) => setSessionPlan({ ...sessionPlan, maxLoss: e.target.value })} style={{ ...inputStyle, width: '100%', fontSize: '12px' }} /></div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div><label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>Pairs / Instruments</label><input type="text" placeholder="EURUSD, GBPUSD, NAS100..." value={sessionPlan.pairs} onChange={(e) => setSessionPlan({ ...sessionPlan, pairs: e.target.value })} style={{ ...inputStyle, width: '100%', fontSize: '12px' }} /></div>
                            <div><label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>Key Levels</label><input type="text" placeholder="1.0850 support, 1.0920 resistance..." value={sessionPlan.keyLevels} onChange={(e) => setSessionPlan({ ...sessionPlan, keyLevels: e.target.value })} style={{ ...inputStyle, width: '100%', fontSize: '12px' }} /></div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div><label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>News / Events</label><input type="text" placeholder="CPI at 8:30, FOMC at 14:00..." value={sessionPlan.newsEvents} onChange={(e) => setSessionPlan({ ...sessionPlan, newsEvents: e.target.value })} style={{ ...inputStyle, width: '100%', fontSize: '12px' }} /></div>
                            <div><label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>Session Goals</label><input type="text" placeholder="Follow the plan, no revenge trades..." value={sessionPlan.goals} onChange={(e) => setSessionPlan({ ...sessionPlan, goals: e.target.value })} style={{ ...inputStyle, width: '100%', fontSize: '12px' }} /></div>
                          </div>
                          <div style={{ marginBottom: '12px' }}><label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>Notes / Trade Ideas</label><textarea placeholder="What setups am I looking for today? What to avoid?" value={sessionPlan.notes} onChange={(e) => setSessionPlan({ ...sessionPlan, notes: e.target.value })} style={{ ...inputStyle, width: '100%', fontSize: '12px', minHeight: '50px', resize: 'vertical' as const }} /></div>
                          <button onClick={saveSessionPlan} style={{ ...btnPrimary, width: '100%', background: '#14b8a6', fontSize: '12px' }}>📋 Save Session Plan</button>
                        </div>
                        {sessionPlans.length > 0 && <div>{sessionPlans.slice().reverse().slice(0,3).map(sp => (<div key={sp.id} style={{ padding: '10px', background: darkMode ? '#1e293b' : '#fafafa', borderRadius: '8px', marginBottom: '6px', fontSize: '12px' }}><span style={{ color: theme.text, fontWeight: 600 }}>{sp.date}</span> <span style={{ color: sp.bias==='bullish'?theme.success:sp.bias==='bearish'?theme.danger:theme.textMuted }}>{sp.bias==='bullish'?'🟢':'🔴'} {sp.bias}</span>{sp.pairs && <span style={{ color: theme.textMuted, marginLeft: '8px' }}>{sp.pairs}</span>}</div>))}</div>}
                      </div>
                    )}

                    {/* MINDSET TAB */}
                    {prepTab === 'mindset' && (
                      <div>
                        {/* Mental State Check */}
                        <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#fafafa', borderRadius: '12px', marginBottom: '16px' }}>
                          <h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>🧘 Mental State Check</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '12px' }}>
                            {[{label:'Mood',icon:'😊',key:'mood'},{label:'Energy',icon:'⚡',key:'energy'},{label:'Focus',icon:'🎯',key:'focus'}].map(m => (
                              <div key={m.key}><div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>{m.icon} {m.label}</div><div style={{ display: 'flex', gap: '4px' }}>{[1,2,3,4,5].map(n => (<button key={n} onClick={() => setTodayCheckIn({...todayCheckIn, [m.key]: n})} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: (todayCheckIn as any)[m.key]>=n?(['#ef4444','#f97316','#fbbf24','#84cc16','#10b981'][n-1]):(darkMode?'#334155':'#e2e8f0'), cursor: 'pointer', color: (todayCheckIn as any)[m.key]>=n?'white':theme.textMuted, fontWeight: 700, fontSize: '13px' }}>{n}</button>))}</div></div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <input type="text" placeholder="How are you feeling? Sleep, stress, concerns?" value={todayCheckIn.notes} onChange={(e) => setTodayCheckIn({...todayCheckIn, notes: e.target.value})} style={{ ...inputStyle, flex: 1, fontSize: '12px' }} />
                            <button onClick={() => { setDailyCheckIn(prev => [...prev, {...todayCheckIn, id: Date.now()}]); setTodayCheckIn({mood:3,energy:3,focus:3,notes:'',date:new Date().toISOString().split('T')[0]}); awardXP(10) }} style={{ padding: '8px 16px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>Log</button>
                          </div>
                          {(() => { const total = todayCheckIn.mood + todayCheckIn.energy + todayCheckIn.focus; return total < 9 ? (<div style={{ padding: '10px', background: theme.danger+'15', borderRadius: '8px', border: '1px solid '+theme.danger+'30' }}><span style={{ color: theme.danger, fontWeight: 700, fontSize: '12px' }}>⚠️ LOW ({total}/15) — Reduce size 50% or sit out. Protecting capital IS a winning trade.</span></div>) : total < 12 ? (<div style={{ padding: '10px', background: theme.warning+'15', borderRadius: '8px' }}><span style={{ color: theme.warning, fontWeight: 700, fontSize: '12px' }}>⚠️ MODERATE ({total}/15) — Trade with caution. Follow plan strictly.</span></div>) : (<div style={{ padding: '10px', background: theme.success+'15', borderRadius: '8px' }}><span style={{ color: theme.success, fontWeight: 700, fontSize: '12px' }}>✅ READY ({total}/15) — Execute your plan with confidence.</span></div>) })()}
                        </div>
                        {/* Pre-Trade Checklist */}
                        <div style={{ marginBottom: '16px' }}>
                          <h4 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '14px' }}>📋 Pre-Trade Checklist</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                            {['Identified trend direction','Marked key levels','Clear entry trigger (not hoping)','Stop loss at logical level','Risk within my rules','NOT revenge trading or chasing','Can afford to lose this trade','Checked for news events'].map((rule, i) => (
                              <label key={i} style={{ display: 'flex', gap: '8px', padding: '8px 10px', background: darkMode ? '#1e293b' : '#fafafa', borderRadius: '6px', cursor: 'pointer', alignItems: 'center', fontSize: '11px', color: theme.text }}><input type="checkbox" style={{ accentColor: theme.success }} />{rule}</label>
                            ))}
                          </div>
                        </div>
                        {/* Revenge Trade Detector */}
                        <div style={{ marginBottom: '16px' }}>
                          <h4 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '14px' }}>🔥 Today{"'"}s Status</h4>
                          {(() => { const today = new Date().toISOString().split('T')[0]; const todayTrades = trades.filter((t:any) => t.date === today); const todayPL3 = todayTrades.reduce((s:number,t:any) => s + parseFloat(t.profitLoss||'0'), 0); const consecutiveLosses = todayTrades.slice(-3).filter((t:any) => parseFloat(t.profitLoss||'0') < 0).length; return (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            <div style={{ padding: '10px', background: darkMode?'#1e293b':'#fafafa', borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '9px' }}>Trades</div><div style={{ color: theme.text, fontSize: '18px', fontWeight: 800 }}>{todayTrades.length}</div></div>
                            <div style={{ padding: '10px', background: consecutiveLosses >= 2 ? theme.danger+'20' : darkMode?'#1e293b':'#fafafa', borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '9px' }}>Consec. Losses</div><div style={{ color: consecutiveLosses >= 2 ? theme.danger : theme.text, fontSize: '18px', fontWeight: 800 }}>{consecutiveLosses}</div>{consecutiveLosses >= 2 && <div style={{ color: theme.danger, fontSize: '9px', fontWeight: 700 }}>STOP</div>}</div>
                            <div style={{ padding: '10px', background: darkMode?'#1e293b':'#fafafa', borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '9px' }}>P/L</div><div style={{ color: todayPL3 >= 0 ? theme.success : theme.danger, fontSize: '18px', fontWeight: 800 }}>{todayPL3 >= 0?'+':''}${todayPL3.toFixed(0)}</div></div>
                            <div style={{ padding: '10px', background: darkMode?'#1e293b':'#fafafa', borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '9px' }}>Win Rate</div><div style={{ color: theme.text, fontSize: '18px', fontWeight: 800 }}>{todayTrades.length > 0 ? ((todayTrades.filter((t:any) => parseFloat(t.profitLoss||'0') > 0).length / todayTrades.length) * 100).toFixed(0) : 0}%</div></div>
                          </div>) })()}
                        </div>
                        {/* Emotion patterns */}
                        {trades.length > 0 && (<div>
                          <h4 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '14px' }}>📊 Emotion Patterns</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                            {(() => { const emotionIcons2: {[k:string]:string} = {disciplined:'🎯',confident:'💪',neutral:'😐',anxious:'😰',fomo:'🤯',revenge:'😤',greedy:'🤑',fearful:'😨'}; return ['disciplined','confident','fomo','revenge','anxious','fearful'].map(em => { const et = trades.filter((t:any) => t.emotion === em); const ep = et.reduce((s:number,t:any) => s + parseFloat(t.profitLoss||'0'), 0); return et.length > 0 ? (<div key={em} style={{ padding: '8px', background: darkMode?'#1e293b':'#fafafa', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '12px' }}>{emotionIcons2[em]} <span style={{ textTransform: 'capitalize' as const }}>{em}</span> <span style={{ color: theme.textMuted }}>({et.length})</span></span><span style={{ color: ep >= 0 ? theme.success : theme.danger, fontWeight: 700, fontSize: '12px' }}>{ep >= 0?'+':''}${ep.toFixed(0)}</span></div>) : null }) })()}
                          </div>
                        </div>)}
                        {/* Check-in history */}
                        {dailyCheckIn.length > 0 && (<div style={{ marginTop: '12px' }}><h4 style={{ margin: '0 0 6px 0', color: theme.text, fontSize: '13px' }}>Recent Check-ins</h4>{dailyCheckIn.slice().reverse().slice(0,5).map((ci:any) => { const dp=trades.filter((t:any)=>t.date===ci.date).reduce((s:number,t:any)=>s+parseFloat(t.profitLoss||'0'),0); const dc=trades.filter((t:any)=>t.date===ci.date).length; return(<div key={ci.id} style={{display:'flex',justifyContent:'space-between',padding:'6px 10px',background:darkMode?'#1e293b':'#fafafa',borderRadius:'6px',marginBottom:'3px',fontSize:'11px'}}><span style={{color:theme.textMuted}}>{ci.date} — 😊{ci.mood} ⚡{ci.energy} 🎯{ci.focus}</span>{dc>0?<span style={{color:dp>=0?theme.success:theme.danger,fontWeight:700}}>{dp>=0?'+':''}${dp.toFixed(0)}</span>:<span style={{color:theme.textMuted}}>—</span>}</div>)})}</div>)}
                      </div>
                    )}

                    {/* RISK TAB */}
                    {prepTab === 'risk' && (
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                          {[{l:'Max Daily Loss',k:'maxDailyLoss',c:theme.danger},{l:'Max Weekly Loss',k:'maxWeeklyLoss',c:theme.danger},{l:'Max Daily Trades',k:'maxDailyTrades',c:theme.warning},{l:'Risk Per Trade %',k:'maxRiskPerTrade',c:theme.accent},{l:'Max Positions',k:'maxOpenPositions',c:theme.purple},{l:'Max Monthly Loss',k:'maxMonthlyLoss',c:'#dc2626'}].map((f,i) => (<div key={i} style={{ padding: '12px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '10px', border: '1px solid ' + theme.border }}><label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '4px', textTransform: 'uppercase' as const }}>{f.l}</label><input type="number" value={(riskLimits as any)[f.k] || ''} onChange={(e) => setRiskLimits(prev => ({ ...prev, [f.k]: e.target.value }))} style={{ ...inputStyle, width: '100%', fontSize: '16px', fontWeight: 700, textAlign: 'center' as const, background: 'transparent', border: '2px solid '+f.c+'40', color: f.c }} /></div>))}
                        </div>
                        {(() => {
                          const allAccounts = [...propAccounts.map(a => ({name: a.firm+' ('+a.phase+')', balance: parseFloat(a.currentBalance||'0')})), ...personalAccounts.map(a => ({name: a.broker+' (Personal)', balance: parseFloat(a.currentBalance||'0')}))]
                          const accountBal = allAccounts.length > 0 ? allAccounts[0].balance : parseFloat(forexProp.currentBalance || forexProp.accountSize || '100000')
                          const riskPct = parseFloat(riskLimits.maxRiskPerTrade || '2') / 100
                          const riskAmount = accountBal * riskPct
                          const rrRatios = [1, 1.5, 2, 3, 5]
                          return (<div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                              <div style={{ padding: '16px', background: theme.accent+'15', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Balance</div><div style={{ color: theme.text, fontSize: '22px', fontWeight: 900 }}>${accountBal.toLocaleString()}</div></div>
                              <div style={{ padding: '16px', background: theme.danger+'15', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Risk/Trade ({riskLimits.maxRiskPerTrade}%)</div><div style={{ color: theme.danger, fontSize: '22px', fontWeight: 900 }}>${riskAmount.toFixed(0)}</div></div>
                              <div style={{ padding: '16px', background: theme.success+'15', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Max Daily Exposure</div><div style={{ color: theme.success, fontSize: '22px', fontWeight: 900 }}>${(riskAmount * parseInt(riskLimits.maxDailyTrades || '5')).toFixed(0)}</div></div>
                            </div>
                            <h4 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '14px' }}>📐 R:R & Win Rate Cheatsheet</h4>
                            <div style={{ overflowX: 'auto' as const, marginBottom: '16px' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                <thead><tr style={{ background: darkMode ? '#0f172a' : '#1e293b' }}><th style={{ padding: '8px', color: '#fbbf24', fontWeight: 800, textAlign: 'left' as const }}>R:R</th>{[20,30,40,50,60,70].map(wr => (<th key={wr} style={{ padding: '8px', color: '#fbbf24', fontWeight: 800, textAlign: 'center' as const }}>{wr}%</th>))}</tr></thead>
                                <tbody>{[{rr:'1:1',r:1},{rr:'1:2',r:2},{rr:'1:3',r:3},{rr:'1:4',r:4},{rr:'1:5',r:5}].map(row => (<tr key={row.rr}><td style={{ padding: '6px 8px', color: theme.text, fontWeight: 800, fontSize: '13px', borderBottom: '1px solid '+theme.border }}>{row.rr}</td>{[20,30,40,50,60,70].map(wr => { const ev = (wr/100*row.r)-((100-wr)/100*1); const res = ev>0.05?'PROFIT':ev>-0.05?'EVEN':'LOSS'; const bg = res==='PROFIT'?'#16a34a':res==='EVEN'?(darkMode?'#334155':'#d1d5db'):'#b91c1c'; return (<td key={wr} style={{ padding: '6px', textAlign: 'center' as const, background: bg, color: 'white', fontWeight: 700, fontSize: '10px' }}>{res}<br/><span style={{ fontSize: '8px', opacity: 0.8 }}>{ev>=0?'+':''}{(riskAmount*ev*10).toFixed(0)}/10t</span></td>)})}</tr>))}</tbody>
                              </table>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                              {rrRatios.map(rr => (<div key={rr} style={{ padding: '10px', background: darkMode?'#1e293b':'#fafafa', borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '9px' }}>Risk ${riskAmount.toFixed(0)}</div><div style={{ color: theme.accent, fontSize: '11px', fontWeight: 700 }}>1:{rr}</div><div style={{ color: theme.success, fontSize: '16px', fontWeight: 800 }}>+${(riskAmount * rr).toFixed(0)}</div></div>))}
                            </div>
                          </div>)
                        })()}
                      </div>
                    )}

                    {/* TRADE PLANS TAB */}
                    {prepTab === 'trades' && (
                      <div>
                        <p style={{ color: theme.textMuted, fontSize: '12px', margin: '0 0 12px 0' }}>Plan specific trades before your session. Compare planned vs actual.</p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '12px', alignItems: 'end' }}>
                          <div><label style={{ color: theme.textMuted, fontSize: '9px', display: 'block' }}>Pair</label><input type="text" placeholder="EURUSD" value={newTradePlan.instrument} onChange={(e) => setNewTradePlan({...newTradePlan, instrument: e.target.value})} style={{ ...inputStyle, width: '80px', fontSize: '12px' }} /></div>
                          <div><label style={{ color: theme.textMuted, fontSize: '9px', display: 'block' }}>Dir</label><select value={newTradePlan.direction} onChange={(e) => setNewTradePlan({...newTradePlan, direction: e.target.value})} style={{ ...inputStyle, fontSize: '12px' }}><option value="long">Long</option><option value="short">Short</option></select></div>
                          <div><label style={{ color: theme.textMuted, fontSize: '9px', display: 'block' }}>Entry</label><input type="text" placeholder="1.0850" value={newTradePlan.entry} onChange={(e) => setNewTradePlan({...newTradePlan, entry: e.target.value})} style={{ ...inputStyle, width: '70px', fontSize: '12px' }} /></div>
                          <div><label style={{ color: theme.textMuted, fontSize: '9px', display: 'block' }}>SL</label><input type="text" placeholder="1.0820" value={newTradePlan.stopLoss} onChange={(e) => setNewTradePlan({...newTradePlan, stopLoss: e.target.value})} style={{ ...inputStyle, width: '70px', fontSize: '12px' }} /></div>
                          <div><label style={{ color: theme.textMuted, fontSize: '9px', display: 'block' }}>TP</label><input type="text" placeholder="1.0920" value={newTradePlan.takeProfit} onChange={(e) => setNewTradePlan({...newTradePlan, takeProfit: e.target.value})} style={{ ...inputStyle, width: '70px', fontSize: '12px' }} /></div>
                          <div><label style={{ color: theme.textMuted, fontSize: '9px', display: 'block' }}>Notes</label><input type="text" placeholder="Setup reason" value={newTradePlan.notes} onChange={(e) => setNewTradePlan({...newTradePlan, notes: e.target.value})} style={{ ...inputStyle, width: '100px', fontSize: '12px' }} /></div>
                          <button onClick={() => { if (!newTradePlan.instrument) return; setTradePlans(prev => [...prev, {...newTradePlan, id: Date.now()}]); setNewTradePlan({instrument:'',direction:'long',entry:'',stopLoss:'',takeProfit:'',notes:'',date:new Date().toISOString().split('T')[0]}); awardXP(10) }} style={{ padding: '8px 12px', background: theme.warning, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>📝 Plan</button>
                        </div>
                        {tradePlans.length > 0 && (<div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px' }}>{tradePlans.map(plan => { const actual = trades.find((t: any) => t.instrument && plan.instrument && t.instrument.toLowerCase()===plan.instrument.toLowerCase() && t.date===plan.date); return (<div key={plan.id} style={{ padding: '10px 14px', background: darkMode ? '#1e293b' : '#fafafa', borderRadius: '8px', border: '1px solid '+(actual?theme.success:theme.warning)+'30', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><span style={{ color: theme.text, fontWeight: 700, fontSize: '13px' }}>{plan.instrument}</span><span style={{ color: plan.direction==='long'?theme.success:theme.danger, fontSize: '11px', marginLeft: '6px' }}>{plan.direction.toUpperCase()}</span><span style={{ color: theme.textMuted, fontSize: '10px', marginLeft: '8px' }}>E:{plan.entry} SL:{plan.stopLoss} TP:{plan.takeProfit}</span></div><div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>{actual ? <span style={{ padding: '2px 8px', background: parseFloat(actual.profitLoss||'0')>=0?theme.success+'20':theme.danger+'20', color: parseFloat(actual.profitLoss||'0')>=0?theme.success:theme.danger, borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>Result: {parseFloat(actual.profitLoss||'0')>=0?'+':''}${parseFloat(actual.profitLoss||'0').toFixed(0)}</span> : <span style={{ padding: '2px 8px', background: theme.warning+'20', color: theme.warning, borderRadius: '6px', fontSize: '11px' }}>Pending</span>}<button onClick={() => setTradePlans(prev => prev.filter(p => p.id!==plan.id))} style={{ background:'none', border:'none', color:theme.danger, cursor:'pointer', fontSize:'14px' }}>x</button></div></div>) })}</div>)}
                        {tradePlans.length === 0 && <div style={{ textAlign: 'center' as const, padding: '20px', color: theme.textMuted, fontSize: '12px' }}>No trades planned yet. Plan before you trade!</div>}
                      </div>
                    )}
                  </div>
                )}

                {tradingSections[sec.id] && sec.id === 'journal' && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' as const }}>
                        <input type="date" value={newTrade.date} onChange={(e) => setNewTrade({ ...newTrade, date: e.target.value })} style={{ ...inputStyle, fontSize: '12px' }} />
                        <input type="text" placeholder="Instrument (e.g. EURUSD)" title="What you traded: currency pair, stock, futures contract" value={newTrade.instrument} onChange={(e) => setNewTrade({ ...newTrade, instrument: e.target.value })} style={{ ...inputStyle, flex: '1 1 120px', fontSize: '12px' }} />
                        <select value={newTrade.direction} onChange={(e) => setNewTrade({ ...newTrade, direction: e.target.value })} style={{ ...inputStyle, fontSize: '12px' }}><option value="long">📈 Long</option><option value="short">📉 Short</option></select>
                        <input type="number" placeholder="Entry $" value={newTrade.entryPrice} onChange={(e) => setNewTrade({ ...newTrade, entryPrice: e.target.value })} style={{ ...inputStyle, width: '80px', fontSize: '12px' }} />
                        <input type="number" placeholder="Exit $" value={newTrade.exitPrice} onChange={(e) => setNewTrade({ ...newTrade, exitPrice: e.target.value })} style={{ ...inputStyle, width: '80px', fontSize: '12px' }} />
                        <input type="number" placeholder="P/L $" title="Profit or loss in dollars (negative for loss)" value={newTrade.profitLoss} onChange={(e) => setNewTrade({ ...newTrade, profitLoss: e.target.value })} style={{ ...inputStyle, width: '80px', fontSize: '12px' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' as const }}>
                        <select value={newTradeExtra.emotion} onChange={(e) => setNewTradeExtra({ ...newTradeExtra, emotion: e.target.value })} style={{ ...inputStyle, fontSize: '12px' }}><option value="disciplined">🎯 Disciplined</option><option value="confident">💪 Confident</option><option value="neutral">😐 Neutral</option><option value="anxious">😰 Anxious</option><option value="fomo">🤯 FOMO</option><option value="revenge">😤 Revenge</option><option value="greedy">🤑 Greedy</option><option value="fearful">😨 Fearful</option></select>
                        <select value={newTradeExtra.session} onChange={(e) => setNewTradeExtra({ ...newTradeExtra, session: e.target.value })} style={{ ...inputStyle, fontSize: '12px' }}><option value="asian">🌏 Asian</option><option value="london">🇬🇧 London</option><option value="newyork">🇺🇸 New York</option><option value="overlap">🔄 Overlap</option></select>
                        <input type="text" placeholder="R-Multiple (e.g. 2.5)" title="How many R did you make? 1R = your risk amount. 2.5R = 2.5x your risk" value={newTradeExtra.rMultiple} onChange={(e) => setNewTradeExtra({ ...newTradeExtra, rMultiple: e.target.value })} style={{ ...inputStyle, width: '120px', fontSize: '12px' }} />
                        <input type="text" placeholder="Setup type (e.g. breakout, pullback)" title="Your trade setup: breakout, pullback, range, trend continuation, reversal, etc." value={newTradeExtra.setup} onChange={(e) => setNewTradeExtra({ ...newTradeExtra, setup: e.target.value })} style={{ ...inputStyle, flex: 1, fontSize: '12px' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                        <input type="text" placeholder="Notes / Trade thesis" value={newTrade.notes} onChange={(e) => setNewTrade({ ...newTrade, notes: e.target.value })} style={{ ...inputStyle, flex: 1, fontSize: '12px' }} />
                        <input type="text" placeholder="Rules broken? (leave empty if clean)" title="Did you break any trading rules? Leave empty if you followed your plan" value={newTradeExtra.rulesBroken} onChange={(e) => setNewTradeExtra({ ...newTradeExtra, rulesBroken: e.target.value })} style={{ ...inputStyle, flex: 1, fontSize: '12px', borderColor: newTradeExtra.rulesBroken ? theme.danger : theme.inputBorder }} />
                        <input type="text" placeholder="Tags (breakout, reversal...)" value={newTradeExtra.tags || ''} onChange={(e) => setNewTradeExtra({...newTradeExtra, tags: e.target.value})} style={{ ...inputStyle, flex: 1, fontSize: '12px' }} title="Comma-separated tags for filtering" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ color: theme.textMuted, fontSize: '10px' }}>Conf:</span>{[1,2,3,4,5].map(n => (<button key={n} onClick={() => setNewTradeExtra({...newTradeExtra, confidence: String(n)})} style={{ width: '22px', height: '22px', borderRadius: '50%', border: 'none', background: parseInt(newTradeExtra.confidence||'3') >= n ? '#fbbf24' : (darkMode ? '#334155' : '#e2e8f0'), cursor: 'pointer', fontSize: '9px', color: parseInt(newTradeExtra.confidence||'3') >= n ? 'white' : theme.textMuted }}>★</button>))}</div>
                        <button onClick={addEnhancedTrade} style={{ ...btnWarning, fontSize: '12px' }}>📝 Log Trade</button>
                      </div>
                      {/* ACCOUNT SELECTOR ROW */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center', flexWrap: 'wrap' as const }}>
                        <span style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>📂 Account:</span>
                        <select value={newTrade.linkedAccount} onChange={(e) => { if (e.target.value === 'new-prop' || e.target.value === 'new-personal') { setShowNewAccountForm(e.target.value === 'new-prop' ? 'prop' : 'personal'); setInlineNewAccount({ name: '', size: '', type: e.target.value === 'new-prop' ? 'prop' : 'personal' }) } else { setNewTrade({...newTrade, linkedAccount: e.target.value}); setShowNewAccountForm(null) } }} style={{ ...inputStyle, fontSize: '12px', padding: '6px 10px', minWidth: '160px', background: newTrade.linkedAccount ? (darkMode ? '#1e3a2e' : '#ecfdf5') : undefined, borderColor: newTrade.linkedAccount ? theme.success+'60' : theme.inputBorder }}>
                          <option value="">No Account (unlinked)</option>
                          {propAccounts.length > 0 && <option disabled>── Prop Firms ──</option>}
                          {propAccounts.map((a: any) => <option key={a.id} value={String(a.id)}>🏢 {a.firm} - {a.phase} (${parseFloat(a.currentBalance||'0').toLocaleString()})</option>)}
                          {personalAccounts.length > 0 && <option disabled>── Personal ──</option>}
                          {personalAccounts.map((a: any) => <option key={'p-'+a.id} value={'personal-'+a.id}>🏦 {a.broker} (${parseFloat(a.currentBalance||'0').toLocaleString()})</option>)}
                          <option disabled>────────────</option>
                          <option value="new-prop">➕ New Prop Account...</option>
                          <option value="new-personal">➕ New Personal Account...</option>
                        </select>
                        {newTrade.linkedAccount && <span style={{ color: theme.success, fontSize: '11px', fontWeight: 600 }}>✓ Trade will update this account</span>}
                      </div>
                      {/* INLINE NEW ACCOUNT CREATION */}
                      {showNewAccountForm && (
                        <div style={{ marginTop: '8px', padding: '12px', background: darkMode ? '#1e293b' : '#f0fdf4', borderRadius: '10px', border: '2px solid ' + theme.success + '40' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ color: theme.success, fontSize: '13px', fontWeight: 700 }}>{showNewAccountForm === 'prop' ? '🏢 New Prop Account' : '🏦 New Personal Account'}</span>
                            <button onClick={() => setShowNewAccountForm(null)} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '16px' }}>✕</button>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'end', flexWrap: 'wrap' as const }}>
                            <div><label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '2px' }}>{showNewAccountForm === 'prop' ? 'Firm Name' : 'Broker Name'}</label><input type="text" placeholder={showNewAccountForm === 'prop' ? 'FTMO, MFF...' : 'IC Markets...'} value={inlineNewAccount.name} onChange={(e) => setInlineNewAccount({...inlineNewAccount, name: e.target.value})} style={{ ...inputStyle, width: '120px', fontSize: '12px' }} autoFocus /></div>
                            <div><label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '2px' }}>Account Size</label><input type="number" placeholder="100000" value={inlineNewAccount.size} onChange={(e) => setInlineNewAccount({...inlineNewAccount, size: e.target.value})} style={{ ...inputStyle, width: '100px', fontSize: '12px' }} /></div>
                            {showNewAccountForm === 'prop' && (
                              <div><label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '2px' }}>Phase</label><select id="inlinePhase" style={{ ...inputStyle, fontSize: '12px' }}><option value="phase1">Phase 1</option><option value="phase2">Phase 2</option><option value="funded">Funded</option></select></div>
                            )}
                            <button onClick={() => {
                              if (!inlineNewAccount.name || !inlineNewAccount.size) return
                              if (showNewAccountForm === 'prop') {
                                const phase = (document.getElementById('inlinePhase') as HTMLSelectElement)?.value || 'phase1'
                                const size = parseFloat(inlineNewAccount.size||'0')
                                const newAcc = { firm: inlineNewAccount.name, type: 'forex', phase, accountSize: inlineNewAccount.size, currentBalance: inlineNewAccount.size, maxDrawdown: String(size*0.1), dailyDrawdown: String(size*0.05), profitTarget: String(size*0.1), startDate: new Date().toISOString().split('T')[0], status: 'active', cost: '0', monthlyCost: '0', minDays: '0', maxDays: '0', profitSplit: '80', newsTrading: 'yes', weekendHolding: 'no', maxLots: '', eaAllowed: 'no', payoutFreq: 'biweekly', id: Date.now() }
                                setPropAccounts(prev => [...prev, newAcc])
                                setNewTrade({...newTrade, linkedAccount: String(newAcc.id)})
                              } else {
                                const newAcc = { broker: inlineNewAccount.name, accountSize: inlineNewAccount.size, currentBalance: inlineNewAccount.size, type: 'forex', id: Date.now() }
                                setPersonalAccounts(prev => [...prev, newAcc])
                                setNewTrade({...newTrade, linkedAccount: 'personal-' + newAcc.id})
                              }
                              setShowNewAccountForm(null)
                              setInlineNewAccount({ name: '', size: '', type: 'prop' })
                              awardXP(15)
                            }} style={{ padding: '8px 16px', background: theme.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>✓ Create & Link</button>
                          </div>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                          
                          <label style={{ flex: 1, padding: '12px', border: '2px dashed '+theme.accent+'60', borderRadius: '10px', textAlign: 'center' as const, cursor: 'pointer', background: darkMode ? '#1e1b4b' : '#eff6ff', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>📸🤖</div>
                            <div style={{ color: theme.accent, fontSize: '11px' }}>Upload trade screenshot</div>
                            <div style={{ color: theme.textMuted, fontSize: '10px', marginTop: '2px' }}>AI reads image & fills form</div>
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => { const dataUrl = ev.target?.result as string; const tempId = Date.now(); setTradeImages(prev => ({ ...prev, [tempId]: dataUrl })); const desc = prompt('Image uploaded! Add trade details:\n\nPair, Long/Short, P/L, Session, Emotion'); if (desc) { const parts: any = {}; const d = desc.toLowerCase(); if (d.match(/eur|gbp|usd|jpy|aud|nzd|chf|xau|gold|nas|us30|spx/)) { const m = d.match(/(eur|gbp|aud|nzd|usd|chf|jpy|xau|gold|nas|us30|spx)\s*\/?\s*(usd|jpy|aud|chf|gbp|nzd|eur|100|500)?/i); if (m) parts.instrument = m[0].toUpperCase().replace(/\s/g,'') } if (d.match(/long|buy|bought/)) parts.direction = 'long'; if (d.match(/short|sell|sold/)) parts.direction = 'short'; if (d.match(/london/)) parts.session = 'london'; if (d.match(/new york|ny /)) parts.session = 'newyork'; if (d.match(/asian|tokyo/)) parts.session = 'asian'; if (d.match(/confident/)) parts.emotion = 'confident'; if (d.match(/fomo/)) parts.emotion = 'fomo'; if (d.match(/revenge/)) parts.emotion = 'revenge'; if (d.match(/disciplined/)) parts.emotion = 'disciplined'; const plMatch = d.match(/(\+|-|profit|loss|won|lost)\s*\$?\s*(\d+\.?\d*)/); if (plMatch) parts.profitLoss = (d.match(/loss|lost|-/) ? '-' : '') + plMatch[2]; const trade = { date: new Date().toISOString().split('T')[0], instrument: parts.instrument || 'Screenshot Trade', direction: parts.direction || 'long', entryPrice: '', exitPrice: '', profitLoss: parts.profitLoss || '0', notes: desc + ' [screenshot attached]', emotion: parts.emotion || 'disciplined', setup: 'screenshot', rMultiple: '', session: parts.session || 'london', rulesBroken: '', id: tempId }; setTrades(prev => [...prev, trade].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())); awardXP(15) } else { setTradeImages(prev => { const n = {...prev}; delete n[tempId]; return n }) } }; reader.readAsDataURL(file); e.target.value = '' }} />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' as const }}>
                      {trades.length === 0 ? <div style={{ color: theme.textMuted, textAlign: 'center' as const, padding: '30px' }}>No trades logged yet</div> : trades.map(t => {
                        const pl = parseFloat(t.profitLoss || '0'); const isWin = pl > 0
                        const emotionIcons: {[k:string]:string} = { disciplined:'🎯', confident:'💪', neutral:'😐', anxious:'😰', fomo:'🤯', revenge:'😤', greedy:'🤑', fearful:'😨' }
                        return (
                          <div key={t.id} style={{ borderBottom: '1px solid ' + theme.border }}>
                          <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' as const }}>
                                <span style={{ color: theme.text, fontWeight: 700 }}>{t.instrument}</span>
                                <span style={{ padding: '2px 6px', background: t.direction === 'long' ? theme.success + '20' : theme.danger + '20', color: t.direction === 'long' ? theme.success : theme.danger, borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>{t.direction === 'long' ? '📈 LONG' : '📉 SHORT'}</span>
                                {t.emotion && <span style={{ fontSize: '14px' }}>{emotionIcons[t.emotion] || ''}</span>}
                                {t.session && <span style={{ padding: '2px 6px', background: darkMode ? '#334155' : '#f1f5f9', borderRadius: '4px', fontSize: '10px', color: theme.textMuted }}>{t.session}</span>}
                                {t.setup && <span style={{ padding: '2px 6px', background: theme.purple + '15', borderRadius: '4px', fontSize: '10px', color: theme.purple }}>{t.setup}</span>}
                                {t.rulesBroken && <span style={{ padding: '2px 6px', background: theme.danger + '15', borderRadius: '4px', fontSize: '10px', color: theme.danger }}>⚠️ {t.rulesBroken}</span>}
                              </div>
                              <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>{t.date}{t.entryPrice && t.exitPrice ? ' • '+t.entryPrice+'→'+t.exitPrice : ''}{t.rMultiple ? ' • '+t.rMultiple+'R' : ''}{t.notes ? ' • '+t.notes : ''}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                              <div style={{ textAlign: 'right' as const }}><div style={{ color: isWin ? theme.success : theme.danger, fontWeight: 800, fontSize: '16px' }}>{isWin ? '+' : ''}${pl.toFixed(2)}</div></div>
                              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '2px' }}>
                                <label style={{ padding: '4px 6px', background: tradeImages[t.id] ? theme.success+'20' : (darkMode ? '#334155' : '#f1f5f9'), border: '1px solid '+(tradeImages[t.id] ? theme.success+'40' : theme.border), borderRadius: '4px', cursor: 'pointer', fontSize: '10px', color: tradeImages[t.id] ? theme.success : theme.textMuted, textAlign: 'center' as const }}>{tradeImages[t.id] ? '✅📸' : '📸'}<input type="file" accept="image/*" onChange={(e) => handleTradeImageUpload(t.id, e)} style={{ display: 'none' }} /></label>
                                <select value={t.linkedAccount || ''} onChange={(e) => { const val = e.target.value; setTrades(prev => prev.map(tr => tr.id === t.id ? {...tr, linkedAccount: val} : tr)); if (val) { const pl = parseFloat(t.profitLoss||'0'); const isP = val.startsWith('personal-'); if (isP) { setPersonalAccounts(prev => prev.map(a => a.id===parseInt(val.replace('personal-',''))?{...a,currentBalance:String(parseFloat(a.currentBalance||'0')+pl)}:a)) } else { setPropAccounts(prev => prev.map(a => a.id===parseInt(val)?{...a,currentBalance:String(parseFloat(a.currentBalance||'0')+pl)}:a)) }}}} style={{ padding: '3px 4px', background: t.linkedAccount ? theme.success+'15' : 'transparent', border: '1px solid '+(t.linkedAccount ? theme.success+'40' : theme.border), borderRadius: '4px', fontSize: '9px', color: t.linkedAccount ? theme.success : theme.textMuted, cursor: 'pointer', maxWidth: '80px' }} title="Link to account"><option value="">📂 Link</option>{propAccounts.map((a: any) => <option key={a.id} value={String(a.id)}>🏢 {a.firm}</option>)}{personalAccounts.map((a: any) => <option key={'p-'+a.id} value={'personal-'+a.id}>🏦 {a.broker}</option>)}</select>
                                <button onClick={() => deleteTrade(t.id)} style={{ padding: '4px 6px', background: theme.danger+'15', color: theme.danger, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>🗑️</button>
                              </div>
                            </div>
                          </div>
                          {tradeImages[t.id] && <div style={{ marginTop: '4px', padding: '4px' }}><img src={tradeImages[t.id]} alt="Trade screenshot" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', border: '1px solid '+theme.border }} /></div>}
                        </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ANALYTICS */}
                {tradingSections[sec.id] && sec.id === 'analytics' && (
                  <div style={{ marginTop: '20px' }}>
                    {trades.length === 0 ? <div style={{ color: theme.textMuted, textAlign: 'center' as const, padding: '30px' }}>Log trades to see analytics</div> : (() => {
                      const wins = trades.filter(t => parseFloat(t.profitLoss||'0') > 0)
                      const losses = trades.filter(t => parseFloat(t.profitLoss||'0') <= 0)
                      const avgWin = wins.length > 0 ? wins.reduce((s,t) => s+parseFloat(t.profitLoss||'0'),0)/wins.length : 0
                      const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s,t) => s+parseFloat(t.profitLoss||'0'),0)/losses.length) : 0
                      const expectancy = trades.length > 0 ? ((winRate/100) * avgWin) - ((1-winRate/100) * avgLoss) : 0
                      const profitFactor = losses.length > 0 ? Math.abs(wins.reduce((s,t)=>s+parseFloat(t.profitLoss||'0'),0)) / Math.abs(losses.reduce((s,t)=>s+parseFloat(t.profitLoss||'0'),0)) : wins.length > 0 ? 999 : 0
                      const instruments: {[k:string]:{count:number,pl:number,wins:number}} = {}
                      trades.forEach(t => { const inst = t.instrument || 'Unknown'; if (!instruments[inst]) instruments[inst] = {count:0,pl:0,wins:0}; instruments[inst].count++; instruments[inst].pl += parseFloat(t.profitLoss||'0'); if (parseFloat(t.profitLoss||'0') > 0) instruments[inst].wins++ })
                      const emotions: {[k:string]:{count:number,pl:number,wins:number}} = {}
                      trades.forEach(t => { const em = t.emotion || 'neutral'; if (!emotions[em]) emotions[em] = {count:0,pl:0,wins:0}; emotions[em].count++; emotions[em].pl += parseFloat(t.profitLoss||'0'); if (parseFloat(t.profitLoss||'0') > 0) emotions[em].wins++ })
                      const sessions: {[k:string]:{count:number,pl:number,wins:number}} = {}
                      trades.forEach(t => { const s = t.session || 'unknown'; if (!sessions[s]) sessions[s] = {count:0,pl:0,wins:0}; sessions[s].count++; sessions[s].pl += parseFloat(t.profitLoss||'0'); if (parseFloat(t.profitLoss||'0') > 0) sessions[s].wins++ })
                      const equityCurve = (() => { let bal = 0; return [...trades].sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime()).map(t => { bal += parseFloat(t.profitLoss||'0'); return { date: t.date, balance: bal } }) })()
                      const maxBal = Math.max(...equityCurve.map(e=>e.balance), 1); const minBal = Math.min(...equityCurve.map(e=>e.balance), 0)
                      const range = maxBal - minBal || 1
                      return (<>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                          {[{l:'Win Rate',v:winRate.toFixed(1)+'%',c:winRate>=50?theme.success:theme.danger},{l:'Avg Win',v:'$'+avgWin.toFixed(2),c:theme.success},{l:'Avg Loss',v:'$'+avgLoss.toFixed(2),c:theme.danger},{l:'Expectancy',v:'$'+expectancy.toFixed(2),c:expectancy>=0?theme.success:theme.danger},{l:'Profit Factor',v:profitFactor>=999?'∞':profitFactor.toFixed(2),c:profitFactor>=1.5?theme.success:profitFactor>=1?theme.warning:theme.danger},{l:'Best Trade',v:'$'+Math.max(...trades.map(t=>parseFloat(t.profitLoss||'0')),0).toFixed(0),c:theme.success},{l:'Worst Trade',v:'$'+Math.min(...trades.map(t=>parseFloat(t.profitLoss||'0')),0).toFixed(0),c:theme.danger},{l:'Trades',v:String(trades.length),c:theme.text}].map((s,i) => (<div key={i} style={{ padding: '14px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const, marginBottom: '4px' }}>{s.l}</div><div style={{ color: s.c, fontSize: '20px', fontWeight: 800 }}>{s.v}</div></div>))}
                        </div>
                        {equityCurve.length > 1 && <div style={{ marginBottom: '20px' }}><h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>📈 Equity Curve</h4><div style={{ height: '120px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', padding: '12px', position: 'relative' as const, border: '1px solid ' + theme.border, overflow: 'hidden' }}><svg viewBox={'0 0 ' + Math.max(equityCurve.length * 3, 100) + ' 100'} style={{ width: '100%', height: '100%' }} preserveAspectRatio="none"><defs><linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={totalPL >= 0 ? theme.success : theme.danger} stopOpacity="0.3" /><stop offset="100%" stopColor={totalPL >= 0 ? theme.success : theme.danger} stopOpacity="0.05" /></linearGradient></defs><line x1="0" y1={String(100 - ((0-minBal)/range)*100)} x2={String(equityCurve.length * 3)} y2={String(100 - ((0-minBal)/range)*100)} stroke={darkMode ? '#334155' : '#e2e8f0'} strokeWidth="0.5" strokeDasharray="2 2" /><polygon points={equityCurve.map((e,i) => (i*3)+','+String(100-((e.balance-minBal)/range)*100)).join(' ') + ' ' + ((equityCurve.length-1)*3)+',100 0,100'} fill="url(#eqGrad)" /><polyline points={equityCurve.map((e,i) => (i*3)+','+String(100-((e.balance-minBal)/range)*100)).join(' ')} fill="none" stroke={totalPL >= 0 ? theme.success : theme.danger} strokeWidth="1.5" /></svg></div></div>}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div><h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>🎯 By Instrument</h4>{Object.entries(instruments).sort((a,b) => b[1].pl - a[1].pl).map(([inst,data]) => (<div key={inst} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: darkMode ? '#1e293b' : '#fafafa', borderRadius: '8px', marginBottom: '4px' }}><div><span style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>{inst}</span><span style={{ color: theme.textMuted, fontSize: '11px', marginLeft: '8px' }}>{data.count} trades • {((data.wins/data.count)*100).toFixed(0)}% WR</span></div><span style={{ color: data.pl >= 0 ? theme.success : theme.danger, fontWeight: 700, fontSize: '13px' }}>{data.pl >= 0 ? '+' : ''}${data.pl.toFixed(0)}</span></div>))}</div>
                          <div><h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>🧠 By Emotion</h4>{Object.entries(emotions).sort((a,b) => b[1].pl - a[1].pl).map(([em,data]) => { const emIcons: {[k:string]:string} = {disciplined:'🎯',confident:'💪',neutral:'😐',anxious:'😰',fomo:'🤯',revenge:'😤',greedy:'🤑',fearful:'😨'}; return (<div key={em} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: darkMode ? '#1e293b' : '#fafafa', borderRadius: '8px', marginBottom: '4px' }}><div><span style={{ fontSize: '14px' }}>{emIcons[em]||''}</span><span style={{ color: theme.text, fontWeight: 600, fontSize: '13px', marginLeft: '6px', textTransform: 'capitalize' as const }}>{em}</span><span style={{ color: theme.textMuted, fontSize: '11px', marginLeft: '8px' }}>{data.count} • {((data.wins/data.count)*100).toFixed(0)}% WR</span></div><span style={{ color: data.pl >= 0 ? theme.success : theme.danger, fontWeight: 700, fontSize: '13px' }}>{data.pl >= 0 ? '+' : ''}${data.pl.toFixed(0)}</span></div>) })}</div>
                        </div>
                        <div style={{ marginTop: '16px', marginBottom: '16px' }}><h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>📅 Trading Calendar</h4><div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>{['S','M','T','W','T','F','S'].map((d,i) => <div key={i} style={{ textAlign: 'center' as const, color: theme.textMuted, fontSize: '10px', fontWeight: 700, padding: '4px' }}>{d}</div>)}{(() => { const now = new Date(); const first = new Date(now.getFullYear(), now.getMonth(), 1); const daysInMo = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate(); const cells: any[] = []; for(let i=0;i<first.getDay();i++) cells.push(<div key={'e'+i} />); for(let d=1;d<=daysInMo;d++) { const dateStr = now.getFullYear()+'-'+(String(now.getMonth()+1).padStart(2,'0'))+'-'+(String(d).padStart(2,'0')); const dayTrades = trades.filter(t => t.date === dateStr); const dayPL = dayTrades.reduce((s: number,t: any) => s+parseFloat(t.profitLoss||'0'),0); const isToday = d === now.getDate(); cells.push(<div key={d} style={{ padding: '6px 2px', textAlign: 'center' as const, borderRadius: '6px', background: dayTrades.length === 0 ? 'transparent' : dayPL > 0 ? theme.success+'20' : dayPL < 0 ? theme.danger+'20' : (darkMode?'#334155':'#f1f5f9'), border: isToday ? '2px solid '+theme.accent : '1px solid transparent', minHeight: '36px' }}><div style={{ fontSize: '10px', color: isToday ? theme.accent : theme.textMuted, fontWeight: isToday ? 700 : 400 }}>{d}</div>{dayTrades.length > 0 && <div style={{ fontSize: '10px', color: dayPL > 0 ? theme.success : theme.danger, fontWeight: 700 }}>{dayPL > 0 ? '+' : ''}${dayPL.toFixed(0)}</div>}</div>) } return cells })()}</div></div>
                        <div style={{ marginTop: '16px' }}><h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>📊 P/L by Instrument</h4>
                        {(() => { const inst: {[k:string]:{pl:number,count:number,wins:number}} = {}; trades.forEach((t: any) => { const i = t.instrument || 'Unknown'; if (!inst[i]) inst[i] = {pl:0,count:0,wins:0}; inst[i].pl += parseFloat(t.profitLoss||'0'); inst[i].count++; if (parseFloat(t.profitLoss||'0') > 0) inst[i].wins++ }); return Object.entries(inst).sort((a,b) => b[1].pl - a[1].pl).map(([name,data]) => (<div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: darkMode ? '#1e293b' : '#fafafa', borderRadius: '8px', marginBottom: '4px' }}><div><span style={{ color: theme.text, fontWeight: 600, fontSize: '13px' }}>{name}</span><span style={{ color: theme.textMuted, fontSize: '11px', marginLeft: '8px' }}>{data.count} trades • {data.count > 0 ? ((data.wins/data.count)*100).toFixed(0) : 0}% WR</span></div><span style={{ color: data.pl >= 0 ? theme.success : theme.danger, fontWeight: 700, fontSize: '13px' }}>{data.pl >= 0 ? '+' : ''}${data.pl.toFixed(0)}</span></div>)) })()}</div>
                        <div style={{ marginTop: '16px' }}><h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>📉 Drawdown & Streaks</h4>
                        {(() => { let peak=0,maxDD=0,eq=0,cs=0,cls=0,bw=0,wl=0,lw=0,ll=0; [...trades].sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime()).forEach((t:any)=>{const pl=parseFloat(t.profitLoss||'0');eq+=pl;if(eq>peak)peak=eq;const dd=peak-eq;if(dd>maxDD)maxDD=dd;if(pl>0){cs++;cls=0;if(cs>lw)lw=cs;if(pl>bw)bw=pl}else if(pl<0){cls++;cs=0;if(cls>ll)ll=cls;if(pl<wl)wl=pl}}); return (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}><div style={{ padding: '10px', background: theme.danger+'15', borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.danger, fontSize: '10px', textTransform: 'uppercase' as const }}>Max Drawdown</div><div style={{ color: theme.danger, fontSize: '18px', fontWeight: 800 }}>-${maxDD.toFixed(0)}</div></div><div style={{ padding: '10px', background: theme.success+'15', borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.success, fontSize: '10px', textTransform: 'uppercase' as const }}>Peak Equity</div><div style={{ color: theme.success, fontSize: '18px', fontWeight: 800 }}>${peak.toFixed(0)}</div></div><div style={{ padding: '10px', background: darkMode?'#1e293b':'#fafafa', borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Best/Worst</div><div style={{ fontSize: '13px' }}><span style={{ color: theme.success, fontWeight: 700 }}>+${bw.toFixed(0)}</span> / <span style={{ color: theme.danger, fontWeight: 700 }}>${wl.toFixed(0)}</span></div></div><div style={{ padding: '10px', background: theme.success+'15', borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.success, fontSize: '10px', textTransform: 'uppercase' as const }}>Best Win Streak</div><div style={{ color: theme.success, fontSize: '18px', fontWeight: 800 }}>{lw}</div></div><div style={{ padding: '10px', background: theme.danger+'15', borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.danger, fontSize: '10px', textTransform: 'uppercase' as const }}>Worst Loss Streak</div><div style={{ color: theme.danger, fontSize: '18px', fontWeight: 800 }}>{ll}</div></div><div style={{ padding: '10px', background: darkMode?'#1e293b':'#fafafa', borderRadius: '8px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Current DD</div><div style={{ color: (peak-eq)>0?theme.danger:theme.success, fontSize: '18px', fontWeight: 800 }}>{(peak-eq)>0?'-$'+(peak-eq).toFixed(0):'None'}</div></div></div>) })()}</div>
                        <div style={{ marginTop: '16px' }}><h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>🗓 Day Heatmap</h4>
                        {(() => { const days: {[k:string]:{pl:number,count:number}} = {}; ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => days[d]={pl:0,count:0}); trades.forEach((t: any) => { const d = new Date(t.date); const dn = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]; days[dn].pl += parseFloat(t.profitLoss||'0'); days[dn].count++ }); return (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>{Object.entries(days).map(([day, data]) => (<div key={day} style={{ padding: '10px 4px', textAlign: 'center' as const, borderRadius: '8px', background: data.count===0?(darkMode?'#1e293b':'#f1f5f9'):data.pl>=0?theme.success+'30':theme.danger+'30' }}><div style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 700 }}>{day}</div><div style={{ color: data.count>0?(data.pl>=0?theme.success:theme.danger):theme.textMuted, fontSize: '14px', fontWeight: 800 }}>{data.count>0?(data.pl>=0?'+':'')+('$'+data.pl.toFixed(0)):'-'}</div><div style={{ color: theme.textMuted, fontSize: '10px' }}>{data.count}t</div></div>))}</div>) })()}</div>
                        <div style={{ marginTop: '16px' }}><h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>📅 Weekly P/L</h4>
                        {(() => { const wks:{[k:string]:number}={}; trades.forEach((t:any)=>{const d=new Date(t.date);const ws=new Date(d);ws.setDate(d.getDate()-d.getDay());const k=ws.toISOString().split('T')[0];wks[k]=(wks[k]||0)+parseFloat(t.profitLoss||'0')}); return (<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>{Object.entries(wks).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,8).map(([w,pl])=>(<div key={w} style={{ padding: '10px 14px', background: pl>=0?theme.success+'15':theme.danger+'15', borderRadius: '10px', border: '1px solid '+(pl>=0?theme.success:theme.danger)+'30', minWidth: '90px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px' }}>W/C {new Date(w).toLocaleDateString('en-AU',{day:'numeric',month:'short'})}</div><div style={{ color: pl>=0?theme.success:theme.danger, fontWeight: 800, fontSize: '16px' }}>{pl>=0?'+':''}${pl.toFixed(0)}</div></div>))}</div>) })()}</div>
                        <div style={{ marginTop: '16px' }}><h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>🎯 Monthly P/L Goal</h4>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}><span style={{ color: theme.text, fontSize: '12px' }}>$</span><input type="number" placeholder="Target" value={monthlyPLGoal.target} onChange={(e)=>setMonthlyPLGoal({...monthlyPLGoal,target:e.target.value})} style={{...inputStyle,width:'90px',padding:'6px',fontSize:'12px'}} /><input type="month" value={monthlyPLGoal.month} onChange={(e)=>setMonthlyPLGoal({...monthlyPLGoal,month:e.target.value})} style={{...inputStyle,padding:'6px',fontSize:'12px'}} /></div>
                        {(()=>{const tgt=parseFloat(monthlyPLGoal.target||'0');const mt=trades.filter((t:any)=>t.date&&t.date.startsWith(monthlyPLGoal.month));const mpl=mt.reduce((s:number,t:any)=>s+parseFloat(t.profitLoss||'0'),0);const pct=tgt>0?(mpl/tgt)*100:0;return tgt>0?(<div><div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}><span style={{color:mpl>=0?theme.success:theme.danger,fontWeight:700,fontSize:'18px'}}>{mpl>=0?'+':''}${mpl.toFixed(0)}</span><span style={{color:theme.textMuted,fontSize:'13px'}}>of ${tgt.toFixed(0)} ({pct.toFixed(0)}%)</span></div><div style={{width:'100%',height:'10px',background:darkMode?'#1e293b':'#e2e8f0',borderRadius:'5px',overflow:'hidden'}}><div style={{width:Math.min(Math.max(pct,0),100)+'%',height:'100%',background:pct>=100?theme.success:pct>=50?theme.warning:theme.danger,borderRadius:'5px'}}/></div><div style={{fontSize:'11px',color:theme.textMuted,marginTop:'4px'}}>{mt.length} trades</div></div>):null})()}</div>
                        <div style={{ marginTop: '16px' }}><h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>⚠️ Rule Violation Costs</h4>
                        {(()=>{const v=trades.filter((t:any)=>t.rulesBroken&&t.rulesBroken.trim());const vpl=v.reduce((s:number,t:any)=>s+parseFloat(t.profitLoss||'0'),0);const c=trades.filter((t:any)=>!t.rulesBroken||!t.rulesBroken.trim());const cpl=c.reduce((s:number,t:any)=>s+parseFloat(t.profitLoss||'0'),0);return(<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}><div style={{padding:'10px',background:theme.danger+'15',borderRadius:'8px',textAlign:'center' as const}}><div style={{color:theme.danger,fontSize:'10px',textTransform:'uppercase' as const}}>Rule Breaks</div><div style={{color:theme.danger,fontSize:'18px',fontWeight:800}}>{v.length}</div><div style={{color:theme.danger,fontSize:'12px'}}>{vpl>=0?'+':''}${vpl.toFixed(0)}</div></div><div style={{padding:'10px',background:theme.success+'15',borderRadius:'8px',textAlign:'center' as const}}><div style={{color:theme.success,fontSize:'10px',textTransform:'uppercase' as const}}>Clean Trades</div><div style={{color:theme.success,fontSize:'18px',fontWeight:800}}>{c.length}</div><div style={{color:theme.success,fontSize:'12px'}}>{cpl>=0?'+':''}${cpl.toFixed(0)}</div></div><div style={{padding:'10px',background:darkMode?'#1e293b':'#fafafa',borderRadius:'8px',textAlign:'center' as const}}><div style={{color:theme.textMuted,fontSize:'10px',textTransform:'uppercase' as const}}>Cost of Breaking Rules</div><div style={{color:vpl<0?theme.danger:theme.warning,fontSize:'18px',fontWeight:800}}>${Math.abs(vpl).toFixed(0)}</div></div></div>)})()}</div>
                        <div style={{ marginTop: '16px' }}><h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>🕐 By Session</h4><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>{Object.entries(sessions).map(([s,data]) => { const sIcons: {[k:string]:string} = {asian:'🌏',london:'🇬🇧',newyork:'🇺🇸',overlap:'🔄'}; return (<div key={s} style={{ padding: '14px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const, border: '1px solid ' + theme.border }}><div style={{ fontSize: '20px', marginBottom: '4px' }}>{sIcons[s]||'🕐'}</div><div style={{ color: theme.text, fontWeight: 700, fontSize: '14px', textTransform: 'capitalize' as const }}>{s}</div><div style={{ color: data.pl >= 0 ? theme.success : theme.danger, fontWeight: 800, fontSize: '18px', marginTop: '4px' }}>{data.pl >= 0 ? '+' : ''}${data.pl.toFixed(0)}</div><div style={{ color: theme.textMuted, fontSize: '11px' }}>{data.count} trades • {((data.wins/data.count)*100).toFixed(0)}%</div></div>) })}</div></div>
                      </>)
                    })()}
                  </div>
                )}

                {/* PSYCHOLOGY */}
                

                {/* PROP FIRM DASHBOARD */}
                {tradingSections[sec.id] && sec.id === 'props' && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                      <div style={{ padding: '16px', background: theme.success+'15', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Active Accounts</div><div style={{ color: theme.success, fontSize: '28px', fontWeight: 900 }}>{propAccounts.filter(a => a.status === 'active').length}</div></div>
                      <div style={{ padding: '16px', background: theme.warning+'15', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Total Balance</div><div style={{ color: theme.warning, fontSize: '28px', fontWeight: 900 }}>${propAccounts.reduce((s: number, a: any) => s + parseFloat(a.currentBalance||'0'), 0).toLocaleString()}</div></div>
                      <div style={{ padding: '16px', background: theme.accent+'15', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Total P/L</div><div style={{ color: propAccounts.reduce((s: number, a: any) => s + parseFloat(a.currentBalance||'0') - parseFloat(a.accountSize||'0'), 0) >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 900 }}>${propAccounts.reduce((s: number, a: any) => s + parseFloat(a.currentBalance||'0') - parseFloat(a.accountSize||'0'), 0).toFixed(0)}</div></div>
                      <div style={{ padding: '16px', background: theme.danger+'15', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Total Costs</div><div style={{ color: theme.danger, fontSize: '28px', fontWeight: 900 }}>${propAccounts.reduce((s: number, a: any) => s + parseFloat(a.cost||'0') + parseFloat(a.monthlyCost||'0'), 0).toFixed(0)}</div></div>
                    </div>
                    <div style={{ padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, marginBottom: '8px' }}>
                        <select value={newPropAccount.firm} onChange={(e) => setNewPropAccount({ ...newPropAccount, firm: e.target.value })} style={{ ...inputStyle, fontSize: '12px' }}><option value="FTMO">FTMO</option><option value="MyForexFunds">MyForexFunds</option><option value="TFT">The Funded Trader</option><option value="Apex">Apex Trader</option><option value="TopStep">TopStep</option><option value="E8">E8 Funding</option><option value="5ers">The 5%ers</option><option value="FundedNext">Funded Next</option><option value="Custom">Custom</option></select>
                        <select value={newPropAccount.type} onChange={(e) => setNewPropAccount({ ...newPropAccount, type: e.target.value })} style={{ ...inputStyle, fontSize: '12px' }}><option value="forex">Forex</option><option value="futures">Futures</option></select>
                        <select value={newPropAccount.phase} onChange={(e) => setNewPropAccount({ ...newPropAccount, phase: e.target.value })} style={{ ...inputStyle, fontSize: '12px' }}><option value="phase1">Phase 1</option><option value="phase2">Phase 2</option><option value="funded">Funded</option></select>
                        <input type="number" placeholder="Account $" value={newPropAccount.accountSize} onChange={(e) => setNewPropAccount({ ...newPropAccount, accountSize: e.target.value })} style={{ ...inputStyle, width: '100px', fontSize: '12px' }} />
                        <input type="number" placeholder="Balance $" value={newPropAccount.currentBalance} onChange={(e) => setNewPropAccount({ ...newPropAccount, currentBalance: e.target.value })} style={{ ...inputStyle, width: '100px', fontSize: '12px' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                        <input type="number" placeholder="Challenge Fee $" value={newPropAccount.cost} onChange={(e) => setNewPropAccount({ ...newPropAccount, cost: e.target.value })} style={{ ...inputStyle, width: '100px', fontSize: '12px' }} title="One-time challenge/evaluation fee" />
                        <input type="number" placeholder="Monthly Fee $" value={newPropAccount.monthlyCost} onChange={(e) => setNewPropAccount({ ...newPropAccount, monthlyCost: e.target.value })} style={{ ...inputStyle, width: '100px', fontSize: '12px' }} title="Monthly platform/data fee" />
                        <input type="number" placeholder="Max DD $" value={newPropAccount.maxDrawdown} onChange={(e) => setNewPropAccount({ ...newPropAccount, maxDrawdown: e.target.value })} style={{ ...inputStyle, width: '100px', fontSize: '12px' }} />
                        <input type="number" placeholder="Daily DD $" value={newPropAccount.dailyDrawdown} onChange={(e) => setNewPropAccount({ ...newPropAccount, dailyDrawdown: e.target.value })} style={{ ...inputStyle, width: '90px', fontSize: '12px' }} title="Maximum daily loss allowed" />
                        <input type="number" placeholder="Profit Target $" value={newPropAccount.profitTarget} onChange={(e) => setNewPropAccount({ ...newPropAccount, profitTarget: e.target.value })} style={{ ...inputStyle, width: '120px', fontSize: '12px' }} />
                        <input type="date" value={newPropAccount.startDate} onChange={(e) => setNewPropAccount({ ...newPropAccount, startDate: e.target.value })} style={{ ...inputStyle, fontSize: '12px' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, marginTop: '8px', padding: '12px', background: darkMode ? '#0f172a' : '#f0f9ff', borderRadius: '8px', border: '1px solid ' + theme.accent + '20' }}>
                        <span style={{ color: theme.accent, fontSize: '11px', fontWeight: 700, width: '100%' }}>📋 Account Rules</span>
                        <div><label style={{ color: theme.textMuted, fontSize: '9px', display: 'block' }}>Min Days</label><input type="number" placeholder="0" value={newPropAccount.minDays} onChange={(e) => setNewPropAccount({ ...newPropAccount, minDays: e.target.value })} style={{ ...inputStyle, width: '55px', fontSize: '11px' }} /></div>
                        <div><label style={{ color: theme.textMuted, fontSize: '9px', display: 'block' }}>Max Days</label><input type="number" placeholder="0" value={newPropAccount.maxDays} onChange={(e) => setNewPropAccount({ ...newPropAccount, maxDays: e.target.value })} style={{ ...inputStyle, width: '55px', fontSize: '11px' }} /></div>
                        <div><label style={{ color: theme.textMuted, fontSize: '9px', display: 'block' }}>Profit Split %</label><input type="number" placeholder="80" value={newPropAccount.profitSplit} onChange={(e) => setNewPropAccount({ ...newPropAccount, profitSplit: e.target.value })} style={{ ...inputStyle, width: '55px', fontSize: '11px' }} /></div>
                        <div><label style={{ color: theme.textMuted, fontSize: '9px', display: 'block' }}>Max Lots</label><input type="text" placeholder="Any" value={newPropAccount.maxLots} onChange={(e) => setNewPropAccount({ ...newPropAccount, maxLots: e.target.value })} style={{ ...inputStyle, width: '55px', fontSize: '11px' }} /></div>
                        <div><label style={{ color: theme.textMuted, fontSize: '9px', display: 'block' }}>News Trading</label><select value={newPropAccount.newsTrading} onChange={(e) => setNewPropAccount({ ...newPropAccount, newsTrading: e.target.value })} style={{ ...inputStyle, fontSize: '11px', padding: '4px' }}><option value="yes">✅ Yes</option><option value="no">❌ No</option><option value="restricted">⚠️ Restricted</option></select></div>
                        <div><label style={{ color: theme.textMuted, fontSize: '9px', display: 'block' }}>Weekend Hold</label><select value={newPropAccount.weekendHolding} onChange={(e) => setNewPropAccount({ ...newPropAccount, weekendHolding: e.target.value })} style={{ ...inputStyle, fontSize: '11px', padding: '4px' }}><option value="yes">✅ Yes</option><option value="no">❌ No</option></select></div>
                        <div><label style={{ color: theme.textMuted, fontSize: '9px', display: 'block' }}>EA/Bots</label><select value={newPropAccount.eaAllowed} onChange={(e) => setNewPropAccount({ ...newPropAccount, eaAllowed: e.target.value })} style={{ ...inputStyle, fontSize: '11px', padding: '4px' }}><option value="yes">✅ Yes</option><option value="no">❌ No</option></select></div>
                        <div><label style={{ color: theme.textMuted, fontSize: '9px', display: 'block' }}>Payout Freq</label><select value={newPropAccount.payoutFreq} onChange={(e) => setNewPropAccount({ ...newPropAccount, payoutFreq: e.target.value })} style={{ ...inputStyle, fontSize: '11px', padding: '4px' }}><option value="biweekly">Biweekly</option><option value="monthly">Monthly</option><option value="ondemand">On Demand</option></select></div>
                        <button onClick={addPropAccount} style={{ ...btnSuccess, fontSize: '12px', marginLeft: 'auto' }}>🏢 Add Account</button>
                      </div>
                    </div>
                    {propAccounts.length === 0 ? <div style={{ color: theme.textMuted, textAlign: 'center' as const, padding: '30px' }}>No prop accounts — add one above</div> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>{propAccounts.map(acc => {
                      const profit = parseFloat(acc.currentBalance) - parseFloat(acc.accountSize)
                      const profitPct = parseFloat(acc.profitTarget) > 0 ? (profit / parseFloat(acc.profitTarget)) * 100 : 0
                      const ddUsed = parseFloat(acc.accountSize) - parseFloat(acc.currentBalance)
                      const ddPct = parseFloat(acc.maxDrawdown) > 0 ? (Math.max(0, ddUsed) / parseFloat(acc.maxDrawdown)) * 100 : 0
                      const isHealthy = ddPct < 50 && profitPct >= 0
                      const phaseColors: {[k:string]:string} = { phase1: theme.warning, phase2: theme.accent, funded: theme.success }
                      return (
                        <div key={acc.id} style={{ padding: '20px', background: darkMode ? '#1e293b' : 'white', borderRadius: '16px', border: '2px solid ' + (isHealthy ? theme.success + '40' : theme.danger + '40') }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div><div style={{ color: theme.text, fontWeight: 700, fontSize: '16px' }}>{acc.firm}</div><div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}><span style={{ padding: '2px 8px', background: (phaseColors[acc.phase]||theme.accent)+'20', color: phaseColors[acc.phase]||theme.accent, borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'capitalize' as const }}>{acc.phase}</span><span style={{ padding: '2px 8px', background: darkMode ? '#334155' : '#f1f5f9', borderRadius: '4px', fontSize: '10px', color: theme.textMuted }}>{acc.type}</span><span style={{ padding: '2px 8px', background: darkMode ? '#334155' : '#f1f5f9', borderRadius: '4px', fontSize: '10px', color: theme.textMuted }}>${parseFloat(acc.accountSize).toLocaleString()}</span></div>
                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' as const }}>
                              {acc.dailyDrawdown && <span style={{ padding: '1px 6px', background: theme.danger+'10', borderRadius: '3px', fontSize: '9px', color: theme.danger }}>Daily DD: ${acc.dailyDrawdown}</span>}
                              <span style={{ padding: '1px 6px', background: theme.danger+'10', borderRadius: '3px', fontSize: '9px', color: theme.danger }}>Max DD: ${acc.maxDrawdown}</span>
                              {acc.profitSplit && <span style={{ padding: '1px 6px', background: theme.success+'10', borderRadius: '3px', fontSize: '9px', color: theme.success }}>{acc.profitSplit}% Split</span>}
                              {acc.newsTrading === 'no' && <span style={{ padding: '1px 6px', background: theme.warning+'10', borderRadius: '3px', fontSize: '9px', color: theme.warning }}>❌ News</span>}
                              {acc.newsTrading === 'restricted' && <span style={{ padding: '1px 6px', background: theme.warning+'10', borderRadius: '3px', fontSize: '9px', color: theme.warning }}>⚠️ News</span>}
                              {acc.weekendHolding === 'no' && <span style={{ padding: '1px 6px', background: theme.warning+'10', borderRadius: '3px', fontSize: '9px', color: theme.warning }}>❌ Weekend</span>}
                              {acc.eaAllowed === 'yes' && <span style={{ padding: '1px 6px', background: theme.success+'10', borderRadius: '3px', fontSize: '9px', color: theme.success }}>🤖 EA</span>}
                              {parseInt(acc.minDays||'0') > 0 && <span style={{ padding: '1px 6px', background: darkMode?'#334155':'#f1f5f9', borderRadius: '3px', fontSize: '9px', color: theme.textMuted }}>Min {acc.minDays}d</span>}
                              {parseInt(acc.maxDays||'0') > 0 && <span style={{ padding: '1px 6px', background: darkMode?'#334155':'#f1f5f9', borderRadius: '3px', fontSize: '9px', color: theme.textMuted }}>Max {acc.maxDays}d</span>}
                              {acc.maxLots && <span style={{ padding: '1px 6px', background: darkMode?'#334155':'#f1f5f9', borderRadius: '3px', fontSize: '9px', color: theme.textMuted }}>Max {acc.maxLots} lots</span>}
                              {acc.payoutFreq && <span style={{ padding: '1px 6px', background: theme.accent+'10', borderRadius: '3px', fontSize: '9px', color: theme.accent }}>{acc.payoutFreq}</span>}
                            </div>
                          </div>
                            <div style={{ textAlign: 'right' as const }}><div style={{ color: profit >= 0 ? theme.success : theme.danger, fontSize: '22px', fontWeight: 800 }}>{profit >= 0 ? '+' : ''}${profit.toFixed(0)}</div>{parseFloat(acc.profitTarget||'0') > 0 && (<div style={{ marginBottom: '4px' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: theme.textMuted }}><span>Target: ${acc.profitTarget}</span><span>{Math.min(100, (profit / parseFloat(acc.profitTarget||'1')) * 100).toFixed(0)}%</span></div><div style={{ width: '100px', height: '6px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: Math.min(100, Math.max(0, (profit / parseFloat(acc.profitTarget||'1')) * 100)) + '%', height: '100%', background: profit >= parseFloat(acc.profitTarget||'0') ? theme.success : theme.warning, borderRadius: '3px' }} /></div></div>)}{(parseFloat(acc.cost||'0') > 0 || parseFloat(acc.monthlyCost||'0') > 0) && <div style={{ fontSize: '10px', color: theme.danger }}>Cost: ${parseFloat(acc.cost||'0').toFixed(0)}{parseFloat(acc.monthlyCost||'0') > 0 ? ' + $'+parseFloat(acc.monthlyCost||'0').toFixed(0)+'/mo' : ''}</div>}<div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}><button onClick={() => { setEditingPropId(editingPropId === acc.id ? null : acc.id); }} style={{ padding: '4px 10px', background: theme.accent, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '10px' }}>Edit</button><button onClick={() => setPropAccounts(prev => prev.filter(a => a.id !== acc.id))} style={{ padding: '4px 10px', background: theme.danger, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '10px' }}>Remove</button></div></div>
                          </div>
                          <div style={{ marginBottom: '10px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: theme.textMuted, fontSize: '11px' }}>Profit Target</span><span style={{ color: theme.success, fontSize: '11px', fontWeight: 700 }}>{Math.min(profitPct, 100).toFixed(0)}%</span></div><div style={{ width: '100%', height: '8px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: Math.min(Math.max(profitPct, 0), 100) + '%', height: '100%', background: 'linear-gradient(90deg, '+theme.success+', #34d399)', borderRadius: '4px' }} /></div></div>
                          <div><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: theme.textMuted, fontSize: '11px' }}>Drawdown Used</span><span style={{ color: ddPct > 70 ? theme.danger : ddPct > 40 ? theme.warning : theme.success, fontSize: '11px', fontWeight: 700 }}>{ddPct.toFixed(0)}%</span></div><div style={{ width: '100%', height: '8px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: Math.min(ddPct, 100) + '%', height: '100%', background: ddPct > 70 ? theme.danger : ddPct > 40 ? theme.warning : theme.success, borderRadius: '4px' }} /></div></div>
                        </div>
                      )
                    })}</div>}
                    <div style={{ borderTop: '1px solid ' + theme.border, paddingTop: '20px' }}>
                      <h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>💸 Payout Tracker</h4>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                        <input type="number" placeholder="Payout $" value={newPayout.amount} onChange={(e) => setNewPayout({ ...newPayout, amount: e.target.value })} style={{ ...inputStyle, width: '120px', fontSize: '12px' }} />
                        <input type="date" value={newPayout.date} onChange={(e) => setNewPayout({ ...newPayout, date: e.target.value })} style={{ ...inputStyle, fontSize: '12px' }} />
                        <button onClick={addPropPayout} style={{ ...btnSuccess, fontSize: '12px' }}>💰 Log Payout</button>
                      </div>
                      {propPayouts.length > 0 && <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>{propPayouts.map(p => (<div key={p.id} style={{ padding: '8px 14px', background: theme.success+'15', borderRadius: '8px', border: '1px solid '+theme.success+'30', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: theme.success, fontWeight: 700 }}>+${parseFloat(p.amount).toFixed(0)}</span><span style={{ color: theme.textMuted, fontSize: '11px' }}>{p.date}</span><button onClick={() => setPropPayouts(prev => prev.filter(x => x.id !== p.id))} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '12px', padding: '0 2px' }}>✕</button></div>))}</div>}
                      <div style={{ marginTop: '12px', padding: '12px', background: 'linear-gradient(135deg, '+theme.success+'15, #fbbf2415)', borderRadius: '10px', textAlign: 'center' as const }}><span style={{ color: theme.success, fontWeight: 800, fontSize: '20px' }}>Total Payouts: ${propPayouts.reduce((s,p) => s + parseFloat(p.amount||'0'), 0).toFixed(0)}</span></div>
                    </div>
                  </div>
                )}
                {/* PERSONAL ACCOUNTS */}
                {tradingSections[sec.id] && sec.id === 'props' && (
                  <div style={{ padding: '16px', marginTop: '16px', borderTop: '2px solid ' + theme.border }}>
                    <h4 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '16px' }}>🏦 Personal Broker Accounts</h4>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' as const, alignItems: 'end' }}>
                      <div><label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '2px' }}>Broker</label><input type="text" placeholder="IC Markets" value={newPersonalAccount.broker} onChange={(e) => setNewPersonalAccount({...newPersonalAccount, broker: e.target.value})} style={{ ...inputStyle, width: '110px', fontSize: '12px' }} /></div>
                      <div><label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '2px' }}>Deposit</label><input type="number" placeholder="5000" value={newPersonalAccount.accountSize} onChange={(e) => setNewPersonalAccount({...newPersonalAccount, accountSize: e.target.value, currentBalance: e.target.value})} style={{ ...inputStyle, width: '90px', fontSize: '12px' }} /></div>
                      <div><label style={{ color: theme.textMuted, fontSize: '10px', display: 'block', marginBottom: '2px' }}>Type</label><select value={newPersonalAccount.type} onChange={(e) => setNewPersonalAccount({...newPersonalAccount, type: e.target.value})} style={{ ...inputStyle, fontSize: '12px' }}><option value="forex">Forex</option><option value="crypto">Crypto</option><option value="shares">Shares</option></select></div>
                      <button onClick={() => { if (!newPersonalAccount.broker) return; setPersonalAccounts(prev => [...prev, {...newPersonalAccount, id: Date.now(), currentBalance: newPersonalAccount.accountSize}]); setNewPersonalAccount({broker:'',accountSize:'',currentBalance:'',type:'forex'}); awardXP(10) }} style={{ padding: '8px 14px', background: theme.success, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>Add Account</button>
                    </div>
                    {personalAccounts.length > 0 && (<div style={{ display: 'grid', gap: '12px' }}>{personalAccounts.map(acc => { const deposit = parseFloat(acc.accountSize||'0'); const balance = parseFloat(acc.currentBalance||'0'); const pl = balance - deposit; const pct = deposit > 0 ? (pl/deposit)*100 : 0; const accTrades = trades.filter((t:any) => t.linkedAccount === 'personal-'+acc.id); return (<div key={acc.id} style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', border: '1px solid ' + theme.border }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><span style={{ color: theme.text, fontWeight: 700, fontSize: '16px' }}>{acc.broker}</span><span style={{ color: theme.textMuted, fontSize: '12px', marginLeft: '8px' }}>{acc.type}</span></div><div style={{ textAlign: 'right' as const }}><div style={{ color: pl >= 0 ? theme.success : theme.danger, fontSize: '22px', fontWeight: 800 }}>${balance.toLocaleString()}</div><div style={{ fontSize: '11px', color: pl >= 0 ? theme.success : theme.danger }}>{pl >= 0 ? '+' : ''}${pl.toFixed(0)} ({pct.toFixed(1)}%)</div></div></div><div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '11px', color: theme.textMuted }}><span>Deposited: ${deposit.toLocaleString()}</span><span>{accTrades.length} linked trades</span><div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}><input type="number" placeholder="Update balance" style={{ ...inputStyle, width: '100px', padding: '4px 6px', fontSize: '11px' }} onKeyDown={(e: any) => { if (e.key==='Enter' && e.target.value) { setPersonalAccounts(prev => prev.map(a => a.id===acc.id?{...a,currentBalance:e.target.value}:a)); e.target.value='' }}} /><button onClick={() => setPersonalAccounts(prev => prev.filter(a => a.id!==acc.id))} style={{ padding: '3px 8px', background: theme.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>X</button></div></div></div>) })}{personalAccounts.length > 1 && <div style={{ padding: '12px', background: theme.success+'15', borderRadius: '8px', textAlign: 'center' as const }}><span style={{ color: theme.textMuted, fontSize: '12px' }}>Total Personal: </span><span style={{ color: theme.success, fontWeight: 800, fontSize: '18px' }}>${personalAccounts.reduce((s,a) => s + parseFloat(a.currentBalance||'0'), 0).toLocaleString()}</span></div>}</div>)}
                  </div>
                )}

                {/* RISK MANAGEMENT */}
                

                {/* SESSION PLANNER */}
                
                
                
              </div>
            ))}

            {/* DAILY COMPOUND INTEREST CALCULATOR */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 8px 0', color: theme.success, fontSize: '18px' }}>📈 Daily Compound Interest Calculator</h3>
              <p style={{ margin: '0 0 16px 0', color: theme.textMuted, fontSize: '12px' }}>Calculate compound growth with daily, weekly, or monthly compounding</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div><label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>💰 Principal Amount</label><div style={{ display: 'flex', alignItems: 'center' }}><span style={{ padding: '8px 10px', background: theme.warning, color: 'white', borderRadius: '6px 0 0 6px', fontWeight: 700, fontSize: '13px' }}>$</span><input type="number" value={tradingCalculator.startingCapital} onChange={(e) => setTradingCalculator({...tradingCalculator, startingCapital: e.target.value})} style={{...inputStyle, width: '100%', borderRadius: '0 6px 6px 0'}} title="Starting balance / investment amount" /></div></div>
                <div><label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>📊 Interest Rate</label><div style={{ display: 'flex', alignItems: 'center' }}><input type="number" value={tradingCalculator.returnRate} onChange={(e) => setTradingCalculator({...tradingCalculator, returnRate: e.target.value})} style={{...inputStyle, width: '70px', borderRadius: '6px 0 0 6px'}} title="Interest rate per period" /><span style={{ padding: '8px 10px', background: theme.textMuted, color: 'white', borderRadius: '0', fontWeight: 700, fontSize: '13px' }}>%</span><select value={tradingCalculator.returnPeriod} onChange={(e) => setTradingCalculator({...tradingCalculator, returnPeriod: e.target.value})} style={{...inputStyle, borderRadius: '0 6px 6px 0'}} title="Compounding period"><option value="daily">daily</option><option value="weekly">weekly</option><option value="monthly">monthly</option><option value="yearly">yearly</option></select></div></div>
                <div style={{ gridColumn: 'span 2' }}><label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>⏰ Time Period</label><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}><div><div style={{ fontSize: '10px', color: theme.textMuted, marginBottom: '2px' }}>Years:</div><input type="number" value={tradingCalculator.years} onChange={(e) => setTradingCalculator({...tradingCalculator, years: e.target.value})} style={{...inputStyle, width: '100%'}} title="Number of years" /></div><div><div style={{ fontSize: '10px', color: theme.textMuted, marginBottom: '2px' }}>Months:</div><input type="number" value={tradingCalculator.months} onChange={(e) => setTradingCalculator({...tradingCalculator, months: e.target.value})} style={{...inputStyle, width: '100%'}} title="Additional months" /></div><div><div style={{ fontSize: '10px', color: theme.textMuted, marginBottom: '2px' }}>Days:</div><input type="number" value={tradingCalculator.days} onChange={(e) => setTradingCalculator({...tradingCalculator, days: e.target.value})} style={{...inputStyle, width: '100%'}} title="Additional days" /></div></div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}><label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>📅 Days to Include</label><div style={{ display: 'flex', gap: '4px' }}>{[{key:'M',label:'M'},{key:'T',label:'T'},{key:'W',label:'W'},{key:'T2',label:'T'},{key:'F',label:'F'},{key:'S',label:'S'},{key:'S2',label:'S'}].map(d => { const isActive = tradingCalculator.includeDays.includes(d.key); return <button key={d.key} onClick={() => setTradingCalculator({...tradingCalculator, includeDays: isActive ? tradingCalculator.includeDays.filter(x => x !== d.key) : [...tradingCalculator.includeDays, d.key]})} style={{ flex: 1, padding: '10px 0', background: isActive ? theme.warning : 'transparent', color: isActive ? 'white' : theme.textMuted, border: '1px solid '+(isActive ? theme.warning : theme.border), borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>{d.label}</button> })}</div><div style={{ fontSize: '10px', color: theme.textMuted, marginTop: '4px', textAlign: 'center' as const }}>{tradingCalculator.includeDays.length} days/week selected{tradingCalculator.includeDays.length < 7 ? ' (excludes '+(7-tradingCalculator.includeDays.length)+' days)' : ' (all days)'}</div></div>
                <div><label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>💸 Monthly Add</label><input type="number" value={tradingCalculator.monthlyContribution} onChange={(e) => setTradingCalculator({...tradingCalculator, monthlyContribution: e.target.value})} style={{...inputStyle, width: '100%'}} title="Additional monthly contribution" /></div>
                <div><label style={{ color: theme.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>🔄 Reinvest Rate</label><select value={tradingCalculator.reinvestRate} onChange={(e) => setTradingCalculator({...tradingCalculator, reinvestRate: e.target.value})} style={{...inputStyle, width: '100%'}} title="Percentage of profits to reinvest"><option value="100">100%</option><option value="90">90%</option><option value="80">80%</option><option value="75">75%</option><option value="50">50%</option><option value="25">25%</option></select></div>
              </div>
              <button onClick={calculateTradingCompounding} disabled={calculatingTrading} style={{...btnSuccess,width:'100%',marginBottom:'16px',padding:'12px',fontSize:'15px',fontWeight:700}}>{calculatingTrading ? 'Calculating...' : '🧮 Calculate Compound Growth'}</button>
              {tradingResults && (<>
                <div style={{ padding: '24px', background: darkMode ? 'linear-gradient(135deg, #1e293b, #1e1b4b)' : 'linear-gradient(135deg, #f0f9ff, #faf5ff)', borderRadius: '16px', border: '2px solid ' + theme.border, marginBottom: '16px' }}>
                  <div style={{ textAlign: 'center' as const, marginBottom: '4px', fontSize: '12px', color: theme.textMuted }}>Projection for {tradingCalculator.years || 0}y {tradingCalculator.months || 0}m {tradingCalculator.days || 0}d</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    <div><div style={{ color: theme.textMuted, fontSize: '12px' }}>Investment Value</div><div style={{ color: theme.success, fontSize: '36px', fontWeight: 900 }}>${tradingResults.futureValue >= 1e6 ? (tradingResults.futureValue/1e6).toFixed(2)+'M' : tradingResults.futureValue.toFixed(2)}</div><div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '8px' }}>Total Interest / Earnings</div><div style={{ color: theme.accent, fontSize: '24px', fontWeight: 800 }}>${tradingResults.profit.toFixed(2)}</div><div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '8px' }}>Percentage Profit</div><div style={{ color: theme.warning, fontSize: '24px', fontWeight: 800 }}>{((tradingResults.profit / Math.max(parseFloat(tradingCalculator.startingCapital || '1'), 1)) * 100).toFixed(0)}%</div></div>
                    <div><div style={{ color: theme.textMuted, fontSize: '12px' }}>Total Days / Business Days</div><div style={{ color: theme.text, fontSize: '24px', fontWeight: 800 }}>{tradingResults.totalTradingDays} / {Math.round(tradingResults.totalTradingDays * 5/7)}</div><div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '8px' }}>Daily Interest Rate</div><div style={{ color: theme.purple, fontSize: '24px', fontWeight: 800 }}>{tradingCalculator.returnPeriod === 'daily' ? tradingCalculator.returnRate : (parseFloat(tradingCalculator.returnRate||'0') / (tradingCalculator.returnPeriod === 'weekly' ? 5 : tradingCalculator.returnPeriod === 'monthly' ? 21 : 252)).toFixed(4)}%</div><div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '8px' }}>Initial Balance</div><div style={{ color: theme.success, fontSize: '24px', fontWeight: 800 }}>${parseFloat(tradingCalculator.startingCapital || '0').toFixed(2)}</div></div>
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '14px' }}>📊 Earnings Breakdown</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {(() => {
                      const principal = parseFloat(tradingCalculator.startingCapital || '0')
                      const rate = parseFloat(tradingCalculator.returnRate || '0') / 100
                      const daysPerWeek = tradingCalculator.includeDays.length
                      const dailyRate = tradingCalculator.returnPeriod === 'daily' ? rate : tradingCalculator.returnPeriod === 'weekly' ? rate / daysPerWeek : tradingCalculator.returnPeriod === 'monthly' ? rate / (daysPerWeek * 4.33) : rate / (daysPerWeek * 52)
                      const dailyEarning = principal * dailyRate
                      const weeklyEarning = dailyEarning * daysPerWeek
                      const monthlyEarning = weeklyEarning * 4.33
                      const yearlyEarning = monthlyEarning * 12
                      return [{l:'Daily',v:dailyEarning,c:theme.success},{l:'Weekly',v:weeklyEarning,c:theme.accent},{l:'Monthly',v:monthlyEarning,c:theme.purple},{l:'Yearly',v:yearlyEarning,c:theme.warning}].map((s,i) => (
                        <div key={i} style={{ padding: '16px', background: s.c+'15', borderRadius: '12px', textAlign: 'center' as const, border: '1px solid '+s.c+'30' }}>
                          <div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const, marginBottom: '4px' }}>{s.l}</div>
                          <div style={{ color: s.c, fontSize: '22px', fontWeight: 900 }}>${s.v.toFixed(2)}</div>
                          <div style={{ color: theme.textMuted, fontSize: '10px', marginTop: '2px' }}>on initial ${principal.toFixed(0)}</div>
                        </div>
                      ))
                    })()}
                  </div>
                </div>
                <div style={{ marginTop: '12px', padding: '12px 16px', background: darkMode ? '#334155' : '#fff7ed', borderRadius: '10px', border: '1px solid ' + theme.warning + '30', fontSize: '11px', color: theme.textMuted, lineHeight: 1.5 }}>⚠️ This calculator is for illustrative purposes only and does not constitute financial advice.</div>
              </>)}
            </div>
          </div>
        )}

        {activeTab === 'tradingAnalytics' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            {(() => {
              const traderRank = getTraderRank(trades)
              const streak = getWinStreak(trades)
              const todayTrades = trades.filter(t => t.date === new Date().toISOString().split('T')[0])
              const todayPL = todayTrades.reduce((s, t) => s + parseFloat(t.profitLoss || '0'), 0)
              const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay())
              const weekTrades = trades.filter(t => new Date(t.date) >= weekStart)
              const weekPL = weekTrades.reduce((s, t) => s + parseFloat(t.profitLoss || '0'), 0)
              const dailyMaxLoss = parseFloat(riskLimits.maxDailyLoss || '0')
              const weeklyMaxLoss = parseFloat(riskLimits.maxWeeklyLoss || '0')
              const dailyDanger = dailyMaxLoss > 0 && todayPL < 0 && Math.abs(todayPL) >= dailyMaxLoss * 0.8
              const weeklyDanger = weeklyMaxLoss > 0 && weekPL < 0 && Math.abs(weekPL) >= weeklyMaxLoss * 0.8
              return (
                <div style={{ padding: '28px', background: darkMode ? 'linear-gradient(135deg, #1e293b, #1e1b2e)' : 'linear-gradient(135deg, #fefce8, #fff7ed, #faf5ff)', borderRadius: '24px', border: '2px solid ' + traderRank.color + '50' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: theme.textMuted, letterSpacing: '3px', textTransform: 'uppercase' as const, marginBottom: '6px' }}>TRADER RANK</div>
                      <div style={{ fontSize: '32px', fontWeight: 900, color: traderRank.color }}>{traderRank.rank}</div>
                      <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>{Array.from({length:10}).map((_,i) => <div key={i} style={{ width: '20px', height: '6px', borderRadius: '3px', background: i < traderRank.tier ? traderRank.color : (darkMode ? '#334155' : '#e2e8f0') }} />)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' as const }}>
                      <div style={{ padding: '14px 20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const, border: '1px solid ' + theme.border, minWidth: '100px' }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Today</div><div style={{ color: todayPL >= 0 ? theme.success : theme.danger, fontSize: '22px', fontWeight: 800 }}>{todayPL >= 0 ? '+' : ''}${todayPL.toFixed(0)}</div><div style={{ fontSize: '10px', color: theme.textMuted }}>{todayTrades.length} trades</div>{dailyDanger && <div style={{ fontSize: '10px', color: theme.danger, fontWeight: 700, marginTop: '2px' }}>⚠️ Near daily limit!</div>}</div>
                      <div style={{ padding: '14px 20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const, border: '1px solid ' + theme.border, minWidth: '100px' }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>This Week</div><div style={{ color: weekPL >= 0 ? theme.success : theme.danger, fontSize: '22px', fontWeight: 800 }}>{weekPL >= 0 ? '+' : ''}${weekPL.toFixed(0)}</div><div style={{ fontSize: '10px', color: theme.textMuted }}>{weekTrades.length} trades</div>{weeklyDanger && <div style={{ fontSize: '10px', color: theme.danger, fontWeight: 700, marginTop: '2px' }}>⚠️ Near weekly limit!</div>}</div>
                      <div style={{ padding: '14px 20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const, border: '1px solid ' + theme.border, minWidth: '100px' }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Win Streak</div><div style={{ color: streak.currentType === 'win' ? theme.success : theme.danger, fontSize: '22px', fontWeight: 800 }}>{streak.currentStreak}{streak.currentType === 'win' ? '🔥' : ''}</div><div style={{ fontSize: '10px', color: theme.textMuted }}>Best: {streak.bestStreak}</div></div>
                      <div style={{ padding: '14px 20px', background: theme.cardBg, borderRadius: '16px', textAlign: 'center' as const, border: '1px solid ' + theme.border, minWidth: '100px' }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>All Time</div><div style={{ color: totalPL >= 0 ? theme.success : theme.danger, fontSize: '22px', fontWeight: 800 }}>{totalPL >= 0 ? '+' : ''}${totalPL.toFixed(0)}</div><div style={{ fontSize: '10px', color: theme.textMuted }}>{trades.length} trades • {winRate.toFixed(0)}% WR</div></div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* === ANALYTICS SECTIONS === */}
            {[
              { id: 'analytics', icon: '📊', title: 'Analytics & Performance', color: theme.accent },
              { id: 'props', icon: '🏢', title: 'Prop Firm Dashboard', color: theme.success },
            ].map(sec => (
              <div key={sec.id} style={cardStyle}>
                <div onClick={() => toggleTradingSection(sec.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><div style={{ width: '44px', height: '44px', borderRadius: '12px', background: sec.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{sec.icon}</div><h3 style={{ margin: 0, color: theme.text, fontSize: '18px', fontWeight: 700 }}>{sec.title}</h3></div>
                  <div style={{ fontSize: '20px', color: theme.textMuted, transition: 'transform 0.3s', transform: tradingSections[sec.id] ? 'rotate(180deg)' : 'rotate(0)' }}>&#9660;</div>
                </div>

                {tradingSections[sec.id] && sec.id === 'analytics' && (
                  <div style={{ marginTop: '16px' }}>
                    {trades.length === 0 ? <div style={{ color: theme.textMuted, textAlign: 'center' as const, padding: '30px' }}>Log trades in Trade Prep tab to see analytics</div> : (() => {
                      const wins2 = trades.filter((t:any) => parseFloat(t.profitLoss||'0') > 0)
                      const losses2 = trades.filter((t:any) => parseFloat(t.profitLoss||'0') < 0)
                      const winRate2 = trades.length > 0 ? (wins2.length / trades.length) * 100 : 0
                      const avgWin2 = wins2.length > 0 ? wins2.reduce((s:number,t:any) => s + parseFloat(t.profitLoss||'0'), 0) / wins2.length : 0
                      const avgLoss2 = losses2.length > 0 ? Math.abs(losses2.reduce((s:number,t:any) => s + parseFloat(t.profitLoss||'0'), 0) / losses2.length) : 0
                      const expectancy2 = trades.length > 0 ? (winRate2/100 * avgWin2) - ((100-winRate2)/100 * avgLoss2) : 0
                      const profitFactor2 = losses2.length > 0 && avgLoss2 > 0 ? (wins2.reduce((s:number,t:any)=>s+parseFloat(t.profitLoss||'0'),0)) / Math.abs(losses2.reduce((s:number,t:any)=>s+parseFloat(t.profitLoss||'0'),0)) : 999
                      return (<div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                          {[{l:'Win Rate',v:winRate2.toFixed(1)+'%',c:winRate2>=50?theme.success:theme.danger},{l:'Avg Win',v:'$'+avgWin2.toFixed(2),c:theme.success},{l:'Avg Loss',v:'$'+avgLoss2.toFixed(2),c:theme.danger},{l:'Expectancy',v:'$'+expectancy2.toFixed(2),c:expectancy2>=0?theme.success:theme.danger},{l:'Profit Factor',v:profitFactor2>=999?'\u221E':profitFactor2.toFixed(2),c:profitFactor2>=1.5?theme.success:profitFactor2>=1?theme.warning:theme.danger},{l:'Best Trade',v:'$'+Math.max(...trades.map((t:any)=>parseFloat(t.profitLoss||'0')),0).toFixed(0),c:theme.success},{l:'Worst Trade',v:'$'+Math.min(...trades.map((t:any)=>parseFloat(t.profitLoss||'0')),0).toFixed(0),c:theme.danger},{l:'Trades',v:String(trades.length),c:theme.text}].map((s,i) => (<div key={i} style={{ padding: '14px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const, marginBottom: '4px' }}>{s.l}</div><div style={{ color: s.c, fontSize: '20px', fontWeight: 800 }}>{s.v}</div></div>))}
                        </div>
                        <div style={{ padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
                          <h4 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '14px' }}>Equity Curve</h4>
                          <div style={{ display: 'flex', alignItems: 'end', gap: '2px', height: '120px' }}>
                            {(() => { let running = 0; const points = trades.slice().reverse().map((t:any) => { running += parseFloat(t.profitLoss||'0'); return running }); const max2 = Math.max(...points.map(Math.abs), 1); return points.map((p,i) => (<div key={i} style={{ flex: 1, height: Math.abs(p/max2*100)+'%', minHeight: '2px', background: p >= 0 ? theme.success : theme.danger, borderRadius: '2px 2px 0 0', alignSelf: 'flex-end', opacity: 0.7 + (i/points.length)*0.3 }} title={'$'+p.toFixed(0)} />)) })()}
                          </div>
                        </div>
                      </div>)
                    })()}
                  </div>
                )}

                {tradingSections[sec.id] && sec.id === 'props' && (
                  <div style={{ marginTop: '16px', color: theme.textMuted, textAlign: 'center' as const, padding: '20px' }}>
                    <div style={{ fontSize: '13px' }}>Prop Firm Dashboard data shared from Trade Prep tab</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
                      <div style={{ padding: '16px', background: theme.success+'15', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Active Accounts</div><div style={{ color: theme.success, fontSize: '28px', fontWeight: 900 }}>{propAccounts.filter((a:any) => a.status === 'active').length + personalAccounts.length}</div></div>
                      <div style={{ padding: '16px', background: theme.warning+'15', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Total Balance</div><div style={{ color: theme.warning, fontSize: '28px', fontWeight: 900 }}>${(propAccounts.reduce((s: number, a: any) => s + parseFloat(a.currentBalance||'0'), 0) + personalAccounts.reduce((s:number, a:any) => s + parseFloat(a.currentBalance||'0'), 0)).toLocaleString()}</div></div>
                      <div style={{ padding: '16px', background: theme.accent+'15', borderRadius: '12px', textAlign: 'center' as const }}><div style={{ color: theme.textMuted, fontSize: '10px', textTransform: 'uppercase' as const }}>Total P/L</div><div style={{ color: (propAccounts.reduce((s: number, a: any) => s + parseFloat(a.currentBalance||'0') - parseFloat(a.accountSize||'0'), 0)) >= 0 ? theme.success : theme.danger, fontSize: '28px', fontWeight: 900 }}>${propAccounts.reduce((s: number, a: any) => s + parseFloat(a.currentBalance||'0') - parseFloat(a.accountSize||'0'), 0).toFixed(0)}</div></div>
                    </div>
                    {propAccounts.length > 0 && (<div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>{propAccounts.map((acc:any) => { const profit = parseFloat(acc.currentBalance) - parseFloat(acc.accountSize); return (<div key={acc.id} style={{ padding: '12px', background: darkMode ? '#1e293b' : '#fafafa', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><span style={{ color: theme.text, fontWeight: 700 }}>{acc.firm}</span><span style={{ color: theme.textMuted, fontSize: '11px', marginLeft: '8px' }}>{acc.phase}</span></div><div style={{ color: profit >= 0 ? theme.success : theme.danger, fontWeight: 800 }}>{profit >= 0 ? '+' : ''}${profit.toFixed(0)}</div></div>) })}</div>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'guide' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px' }}>
            <div style={{ padding: '32px', background: darkMode ? 'linear-gradient(135deg, #1e293b, #1e1b4b)' : 'linear-gradient(135deg, #f0f9ff, #faf5ff)', borderRadius: '24px', border: '2px solid ' + theme.border, textAlign: 'center' as const }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📖</div>
              <h1 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '32px', fontWeight: 900 }}>App Guide</h1>
              <p style={{ margin: '0 0 20px 0', color: theme.textMuted, fontSize: '16px' }}>Everything you need to know. Click any section to expand.</p>
              <button onClick={() => { setTourActive(true); setTourStep(0) }} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 700, boxShadow: '0 4px 20px rgba(251,191,36,0.3)' }}>🎬 Start Interactive Tour</button>
            </div>
            {[
              { id:'quickstart',icon:'🚀',title:'Quick Start',color:'#fbbf24',items:[{q:'How do I get started?',a:'Choose Budget Mode or Trading Mode from the mode selector. Budget Mode tracks finances, Trading Mode has prop calculators and journals.'},{q:'What should I set up first?',a:'1. Add income streams (salary, side hustles)\n2. Add expenses (use Presets for quick setup!)\n3. Add debts\n4. Set savings goals\n5. Check your calendar'},{q:'What are the tabs?',a:'📊 Dashboard — Income, expenses, debts, goals, calendar\n💎 Overview — Rat Race tracker, Cash Flow Quadrant, Quest Board\n🎯 Path — FIRE number, income breakdown, spending\n📈 Trading — Journal, prop calculators\n📖 Guide — You are here!'}]},
              { id:'income',icon:'💰',title:'Income Streams',color:'#10b981',items:[{q:'Active vs Passive income?',a:'Active (🏃) = You trade time for money (salary, freelancing)\nPassive (🌴) = Money works without you (dividends, rental, royalties)\n\nThe Overview tab tracks your shift from active to passive.'},{q:'How does naming affect the quadrant?',a:'The Cash Flow Quadrant auto-categorizes by keywords:\n• "dividend", "ETF" → Investor quadrant\n• "rental" → Investor\n• "freelance" → Self-Employed\n• "business" → Business Owner\nName your streams clearly!'}]},
              { id:'expenses',icon:'💸',title:'Expenses & Bills',color:'#ef4444',items:[{q:'What are Presets?',a:'Quick-add common bills. Click 📋 Presets to see the list. Each has a frequency dropdown (W/FN/M/Q/Y) you can change before adding.'},{q:'How does CSV import work?',a:'Click 📤 CSV, select a bank statement. The app auto-detects dates/amounts, categorizes transactions, and lets you review before importing.'},{q:'Expense categories?',a:'🏠 Housing, ⚡ Utilities, 🍔 Food, 🚗 Transport, 🎬 Entertainment, 🛍️ Shopping, ❤️ Health, 📱 Subscriptions, 📦 Other'}]},
              { id:'debts',icon:'⚔️',title:'Debt Boss Battles',color:'#dc2626',items:[{q:'How do boss states work?',a:'👹 Full HP → 😤 Hurt (25%) → 😰 Weakening (50%) → 😵 Nearly Dead (75%) → 💀 DEFEATED (100%)\nThe HP bar shows your progress visually.'},{q:'What are Power-Ups?',a:'Extra payments beyond your minimum. Click ⚡ Add Power-Up, set amount and frequency. Creates calendar entries that reduce debt when marked paid.'},{q:'Avalanche vs Snowball?',a:'🏔️ Avalanche — Target highest interest first. Saves most money.\n⛄ Snowball — Target smallest balance first. Faster wins.\nBoth work! Pick what motivates you.'}]},
              { id:'goals',icon:'🎯',title:'Savings Quests',color:'#8b5cf6',items:[{q:'What does Add to Calendar do?',a:'Creates recurring payments on your calendar. When you mark them "PAY", the amount is added to your saved total automatically.'},{q:'What are goal ranks?',a:'🚀 Just Started (0-25%) → 🌟 Making Progress (25-50%) → ⚡ Halfway Hero (50-75%) → 🔥 Almost There (75-99%) → 👑 COMPLETE!'}]},
              { id:'calendar',icon:'📅',title:'Calendar',color:'#3b82f6',items:[{q:'What does PAY do?',a:'Marks an item as paid. For debts: reduces balance. For goals: increases saved amount. For power-ups: applies to linked debt/goal. Click ✓ to undo.'},{q:'Color coding?',a:'💰 Green = Income\n💸 Blue = Expenses\n💳 Red = Debt payments\n🎯 Purple = Goal savings\n⚡ Light purple = Power-ups'}]},
              { id:'overview',icon:'💎',title:'Overview Tab',color:'#a78bfa',items:[{q:'What is the Rat Race Escape Tracker?',a:'Shows what % of your expenses are covered by passive income. 100% = escaped! Milestones at 25%, 50%, 75%, 100%.'},{q:'Cash Flow Quadrant?',a:'Kiyosaki\'s E/S/B/I framework:\n👔 Employee → 🔧 Self-Employed → 🏢 Business Owner → 📈 Investor\nGoal: Move income from left (you work) to right (money works).'},{q:'What is the 4% rule?',a:'Withdraw 4% of investments per year without running out. $1M = $40K/year = $3,333/month passive income.'}]},
              { id:'xp',icon:'🎮',title:'XP & Gamification',color:'#f472b6',items:[{q:'How do I earn XP?',a:'+10 Marking paid | +10 Add expense | +15 Add income | +20 Add debt | +25 Add goal | +30 Debt power-up | +50 Achievement'},{q:'What are the levels?',a:'🐣 Lv1 (0) → 🌱 Lv2 (100) → 📈 Lv3 (250) → 💪 Lv4 (500) → 🎯 Lv5 (800) → 🌟 Lv6 (1200) → ⚡ Lv7 (1800) → 🔥 Lv8 (2500) → 💎 Lv9 (3500) → 🏆 Lv10 (5000)'},{q:'Achievements?',a:'🎯 First Goal | 🏅 5 Goals | 💳 Debt Tracked | ✅ Goal Complete | 🎉 Debt Destroyed | 💸 5 Payments | ⚡ 20 Payments | 💰 3+ Income Streams'}]},
              { id:'tips',icon:'💡',title:'Tips & Best Practices',color:'#fbbf24',items:[{q:'Best workflow?',a:'1. Set up income & expenses\n2. Add debts with power-ups\n3. Create goals, add to calendar\n4. Every payday: open calendar, mark items paid\n5. Check Overview weekly\n6. Review spending monthly\n7. Check the Quest Board for passive income ideas'},{q:'Is data saved?',a:'Currently data resets on page refresh. Persistent storage is a planned feature. Screenshot your progress regularly!'}]}
            ].map(section => (
              <div key={section.id} style={cardStyle}>
                <div onClick={() => setExpandedGuideSection(expandedGuideSection === section.id ? null : section.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><div style={{ width: '48px', height: '48px', borderRadius: '14px', background: section.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{section.icon}</div><div><h3 style={{ margin: 0, color: theme.text, fontSize: '18px' }}>{section.title}</h3><span style={{ color: theme.textMuted, fontSize: '12px' }}>{section.items.length} topics</span></div></div>
                  <div style={{ fontSize: '20px', color: theme.textMuted, transition: 'transform 0.3s', transform: expandedGuideSection === section.id ? 'rotate(180deg)' : 'rotate(0)' }}>▼</div>
                </div>
                {expandedGuideSection === section.id && (<div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>{section.items.map((item, idx) => (<div key={idx} onClick={(e) => { e.stopPropagation(); setExpandedGuideItem(expandedGuideItem === section.id+'-'+idx ? null : section.id+'-'+idx) }} style={{ padding: '16px', background: expandedGuideItem === section.id+'-'+idx ? (darkMode ? '#334155' : '#f8fafc') : (darkMode ? '#1e293b' : '#fafafa'), borderRadius: '12px', border: '1px solid ' + (expandedGuideItem === section.id+'-'+idx ? section.color + '40' : theme.border), cursor: 'pointer' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '24px', height: '24px', borderRadius: '50%', background: section.color + '20', color: section.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>{idx+1}</div><span style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>{item.q}</span></div><span style={{ color: theme.textMuted, fontSize: '14px' }}>›</span></div>{expandedGuideItem === section.id+'-'+idx && <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid ' + theme.border }}><div style={{ color: theme.text, fontSize: '13px', lineHeight: 1.8, whiteSpace: 'pre-line' as const }}>{item.a}</div></div>}</div>))}</div>)}
              </div>
            ))}
            <div style={{ padding: '24px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '16px', textAlign: 'center' as const, border: '1px solid ' + theme.border }}><div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div><div style={{ color: theme.text, fontWeight: 700, fontSize: '16px' }}>Still have questions?</div><div style={{ color: theme.textMuted, fontSize: '13px' }}>Use the 🤖 Budget Coach on the Dashboard!</div></div>
          </div>
        )}

      </main>
    </div>
  )
}
