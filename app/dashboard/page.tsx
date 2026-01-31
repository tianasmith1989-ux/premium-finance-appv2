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
  // Phase 1 rules
  phase1DailyDD: string;
  phase1MaxDD: string;
  phase1Target: string;
  phase1MinDays: string;
  phase1MaxDays: string;
  // Phase 2 rules
  phase2DailyDD: string;
  phase2MaxDD: string;
  phase2Target: string;
  phase2MinDays: string;
  phase2MaxDays: string;
  // Funded rules
  fundedDailyDD: string;
  fundedMaxDD: string;
  // Current progress
  currentBalance: string;
  tradingDays: string;
  startDate: string;
  // Trading plan
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
  // Evaluation rules
  evalTrailingDD: string;
  evalProfitTarget: string;
  evalMinDays: string;
  evalDrawdownType: 'trailing' | 'eod';
  // PA (Performance) rules
  paTrailingDD: string;
  paProfitTarget: string;
  paMinDays: string;
  paDrawdownType: 'trailing' | 'eod';
  // Funded rules
  fundedTrailingDD: string;
  fundedDrawdownType: 'trailing' | 'eod';
  // Current progress
  currentBalance: string;
  highWaterMark: string;
  tradingDays: string;
  startDate: string;
  contractLimit: string;
  // Trading plan
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

const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDate(date1) === formatDate(date2);
};

const validateDate = (dateStr: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr).getTime());
};

export default function Dashboard() {
  const { user } = useUser()
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'path' | 'trading'>('dashboard')
  const [darkMode, setDarkMode] = useState(true)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [tradingCalendarMonth, setTradingCalendarMonth] = useState(new Date())
  
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
  const cardStyle = useMemo(() => ({
    background: theme.cardBg,
    borderRadius: '16px',
    padding: '24px',
    border: `1px solid ${theme.border}`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  }), [theme])

  const btnPrimary = useMemo(() => ({
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

  const btnSuccess = useMemo(() => ({
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

  // Forex/CFD Prop Calculator state
  const [forexProp, setForexProp] = useState<ForexAccount>({
    id: 1,
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
    startDate: formatDate(new Date()),
    // Trading plan
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
    // Evaluation rules
    evalTrailingDD: '2500',
    evalProfitTarget: '3000',
    evalMinDays: '7',
    evalDrawdownType: 'trailing',
    // PA (Performance) rules
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
    startDate: formatDate(new Date()),
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
  const [futuresAccounts, setFuturesAccounts] = useState<FuturesAccount[]>([{...futuresProp, id: 1}])
  const [selectedFuturesAccount, setSelectedFuturesAccount] = useState(1)
  const [futuresCalendarMonth, setFuturesCalendarMonth] = useState(new Date())
  const [futuresDailyEntries, setFuturesDailyEntries] = useState<DailyEntry[]>([])

  // Initial calculations
  useEffect(() => {
    calculateForexProp()
    calculateFuturesProp()
  }, [])

  // Recalculate when dependencies change
  useEffect(() => {
    calculateForexProp()
  }, [forexProp, selectedForexAccount, forexAccounts, forexDailyEntries])

  useEffect(() => {
    calculateFuturesProp()
  }, [futuresProp, selectedFuturesAccount, futuresAccounts, futuresDailyEntries])

  // Forex/CFD Prop Calculator
  const calculateForexProp = () => {
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
    }
    
    profitTarget = accountSize * (target / 100)
    progress = currentBalance - accountSize
    
    // Calculate high water mark from daily entries
    const highWaterMark = forexDailyEntries.length > 0 
      ? Math.max(...forexDailyEntries.map(e => e.balance))
      : currentBalance
    
    // Calculate current drawdown
    const currentDrawdown = ((highWaterMark - currentBalance) / highWaterMark) * 100
    
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
      progressPercent: ((progress / profitTarget) * 100).toFixed(2),
      minDays,
      maxDays,
      daysSinceStart,
      daysRemaining: maxDays - daysSinceStart,
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
  }

  // Futures Prop Calculator
  const calculateFuturesProp = () => {
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
  }

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
      tradingDays: (prev.tradingDays === entryDate ? prev.tradingDays : (parseInt(prev.tradingDays) + 1).toString())
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
      tradingDays: (prev.tradingDays === entryDate ? prev.tradingDays : (parseInt(prev.tradingDays) + 1).toString())
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
        const { phase, minDays, maxDays } = forexPropResults
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
        if (entry.balance >= forexPropResults.profitTarget + forexPropResults.accountSize) {
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
        const { phase, minDays } = futuresPropResults
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

  // Render Forex Calendar Item
  const renderForexCalendarItem = useCallback((item: CalendarItem) => {
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

  // Render Futures Calendar Item
  const renderFuturesCalendarItem = useCallback((item: CalendarItem) => {
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
  const forexCalendarDays = useMemo(() => {
    const daysInMonth = new Date(forexCalendarMonth.getFullYear(), forexCalendarMonth.getMonth() + 1, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => i + 1)
  }, [forexCalendarMonth])

  const futuresCalendarDays = useMemo(() => {
    const daysInMonth = new Date(futuresCalendarMonth.getFullYear(), futuresCalendarMonth.getMonth() + 1, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => i + 1)
  }, [futuresCalendarMonth])

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

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      <Header />
      
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {activeTab === 'trading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Forex/CFD Prop Calculator */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: theme.accent, fontSize: '22px' }}>💱 Forex/CFD Prop Firm Calculator</h2>
                <button onClick={exportForexData} style={{ ...btnPrimary, fontSize: '13px' }}>📥 Export Data</button>
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
                {/* Add more input fields as needed */}
              </div>
              
              <button onClick={calculateForexProp} style={{ ...btnPrimary, padding: '12px 24px', fontSize: '16px', width: '100%', marginBottom: '20px' }}>Calculate Forex Prop</button>
              
              {forexPropResults && (
                <div>
                  {/* Results Display */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '16px', background: darkMode ? '#2d3748' : '#f1f5f9', borderRadius: '8px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Current Balance</div>
                      <div style={{ color: theme.text, fontSize: '20px', fontWeight: 'bold' }}>${forexPropResults.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div style={{ padding: '16px', background: darkMode ? '#2d3748' : '#f1f5f9', borderRadius: '8px' }}>
                      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Progress to Target</div>
                      <div style={{ color: forexPropResults.progressPercent >= 100 ? theme.success : theme.accent, fontSize: '20px', fontWeight: 'bold' }}>
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
                  </div>
                  
                  {/* Forex Trading Calendar */}
                  <div style={{ marginTop: '32px', padding: '24px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ margin: 0, color: theme.text, fontSize: '20px', marginBottom: '4px' }}>📅 Forex Trading Calendar</h3>
                        <div style={{ color: theme.textMuted, fontSize: '14px' }}>
                          {forexCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => setForexCalendarMonth(new Date(forexCalendarMonth.getFullYear(), forexCalendarMonth.getMonth() - 1, 1))} 
                          style={btnPrimary}
                        >
                          ← Prev
                        </button>
                        <button 
                          onClick={() => setForexCalendarMonth(new Date())} 
                          style={btnPrimary}
                        >
                          Today
                        </button>
                        <button 
                          onClick={() => addForexDailyEntry()} 
                          style={{ ...btnSuccess, padding: '8px 16px', fontSize: '13px' }}
                        >
                          + Add Daily Entry
                        </button>
                        <button 
                          onClick={() => setForexCalendarMonth(new Date(forexCalendarMonth.getFullYear(), forexCalendarMonth.getMonth() + 1, 1))} 
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
                      
                      {Array.from({ length: new Date(forexCalendarMonth.getFullYear(), forexCalendarMonth.getMonth(), 1).getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} style={{ minHeight: '120px', background: theme.bg, borderRadius: '8px' }} />
                      ))}
                      
                      {forexCalendarDays.map(day => {
                        const date = new Date(forexCalendarMonth.getFullYear(), forexCalendarMonth.getMonth(), day)
                        const dayOfWeek = date.getDay()
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                        const isToday = isSameDay(date, new Date())
                        const calendarItems = getForexCalendarItemsForDay(day, forexCalendarMonth)
                        const hasEntry = calendarItems.length > 0
                        const dateStr = formatDate(date)
                        const isPast = date < new Date() && !isSameDay(date, new Date())
                        const isFuture = date > new Date()
                        
                        return (
                          <div key={day} style={{ 
                            minHeight: '120px', 
                            padding: '8px', 
                            background: isToday ? theme.todayBg : 
                                     isWeekend ? theme.weekendBg : theme.cardBg,
                            borderRadius: '8px', 
                            border: isToday ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
                            opacity: isWeekend || isFuture ? 0.7 : 1,
                            cursor: !hasEntry && !isWeekend && !isFuture ? 'pointer' : 'default'
                          }}
                          onClick={() => !hasEntry && !isWeekend && !isFuture && addForexDailyEntry(dateStr)}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ 
                                fontWeight: isToday ? 700 : 600, 
                                color: isToday ? theme.accent : theme.text, 
                                fontSize: '14px' 
                              }}>
                                {day}
                              </span>
                              {hasEntry && (
                                <span style={{ 
                                  background: theme.accent, 
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
                                {renderForexCalendarItem(item)}
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
                      })}
                    </div>
                    
                    {/* Daily Summary */}
                    <div style={{ padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '16px' }}>📊 Daily Summary</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>Trading Days</div>
                          <div style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold' }}>{forexProp.tradingDays}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>Days Remaining</div>
                          <div style={{ 
                            color: forexPropResults.daysRemaining > 10 ? theme.success : theme.warning, 
                            fontSize: '18px', 
                            fontWeight: 'bold' 
                          }}>
                            {forexPropResults.daysRemaining}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>Avg Daily P&L</div>
                          <div style={{ 
                            color: forexDailyEntries.length > 0 ? 
                              (forexDailyEntries.reduce((sum, e) => sum + e.profitLoss, 0) / forexDailyEntries.length >= 0 ? theme.success : theme.danger) : 
                              theme.text, 
                            fontSize: '18px', 
                            fontWeight: 'bold' 
                          }}>
                            ${forexDailyEntries.length > 0 ? (forexDailyEntries.reduce((sum, e) => sum + e.profitLoss, 0) / forexDailyEntries.length).toFixed(2) : '0.00'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>Total Trades</div>
                          <div style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold' }}>
                            {forexDailyEntries.reduce((sum, e) => sum + e.trades, 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recent Entries Table */}
                    {forexDailyEntries.length > 0 && (
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
                              {forexDailyEntries.slice(-5).reverse().map((entry, idx) => (
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
                </div>
              )}
            </div>

            {/* Futures Prop Calculator */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: theme.success, fontSize: '22px' }}>📊 Futures Prop Firm Calculator</h2>
                <button onClick={exportFuturesData} style={{ ...btnSuccess, fontSize: '13px' }}>📥 Export Data</button>
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
                {/* Add more input fields as needed */}
              </div>
              
              <button onClick={calculateFuturesProp} style={{ ...btnSuccess, padding: '12px 24px', fontSize: '16px', width: '100%', marginBottom: '20px' }}>Calculate Futures Prop</button>
              
              {futuresPropResults && (
                <div>
                  {/* Results Display */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
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
                  </div>
                  
                  {/* Futures Trading Calendar */}
                  <div style={{ marginTop: '32px', padding: '24px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ margin: 0, color: theme.text, fontSize: '20px', marginBottom: '4px' }}>📅 Futures Trading Calendar</h3>
                        <div style={{ color: theme.textMuted, fontSize: '14px' }}>
                          {futuresCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => setFuturesCalendarMonth(new Date(futuresCalendarMonth.getFullYear(), futuresCalendarMonth.getMonth() - 1, 1))} 
                          style={btnPrimary}
                        >
                          ← Prev
                        </button>
                        <button 
                          onClick={() => setFuturesCalendarMonth(new Date())} 
                          style={btnPrimary}
                        >
                          Today
                        </button>
                        <button 
                          onClick={() => addFuturesDailyEntry()} 
                          style={{ ...btnSuccess, padding: '8px 16px', fontSize: '13px' }}
                        >
                          + Add Daily Entry
                        </button>
                        <button 
                          onClick={() => setFuturesCalendarMonth(new Date(futuresCalendarMonth.getFullYear(), futuresCalendarMonth.getMonth() + 1, 1))} 
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
                      
                      {Array.from({ length: new Date(futuresCalendarMonth.getFullYear(), futuresCalendarMonth.getMonth(), 1).getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} style={{ minHeight: '120px', background: theme.bg, borderRadius: '8px' }} />
                      ))}
                      
                      {futuresCalendarDays.map(day => {
                        const date = new Date(futuresCalendarMonth.getFullYear(), futuresCalendarMonth.getMonth(), day)
                        const dayOfWeek = date.getDay()
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                        const isToday = isSameDay(date, new Date())
                        const calendarItems = getFuturesCalendarItemsForDay(day, futuresCalendarMonth)
                        const hasEntry = calendarItems.length > 0
                        const dateStr = formatDate(date)
                        const isPast = date < new Date() && !isSameDay(date, new Date())
                        const isFuture = date > new Date()
                        
                        return (
                          <div key={day} style={{ 
                            minHeight: '120px', 
                            padding: '8px', 
                            background: isToday ? theme.todayBg : 
                                     isWeekend ? theme.weekendBg : theme.cardBg,
                            borderRadius: '8px', 
                            border: isToday ? `2px solid ${theme.success}` : `1px solid ${theme.border}`,
                            opacity: isWeekend || isFuture ? 0.7 : 1,
                            cursor: !hasEntry && !isWeekend && !isFuture ? 'pointer' : 'default'
                          }}
                          onClick={() => !hasEntry && !isWeekend && !isFuture && addFuturesDailyEntry(dateStr)}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ 
                                fontWeight: isToday ? 700 : 600, 
                                color: isToday ? theme.success : theme.text, 
                                fontSize: '14px' 
                              }}>
                                {day}
                              </span>
                              {hasEntry && (
                                <span style={{ 
                                  background: theme.success, 
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
                                {renderFuturesCalendarItem(item)}
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
                      })}
                    </div>
                    
                    {/* Daily Summary */}
                    <div style={{ padding: '16px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '16px' }}>📊 Daily Summary</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>Trading Days</div>
                          <div style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold' }}>{futuresProp.tradingDays}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>Min Days Remaining</div>
                          <div style={{ 
                            color: Math.max(0, futuresPropResults.minDays - parseInt(futuresProp.tradingDays)) > 0 ? theme.warning : theme.success, 
                            fontSize: '18px', 
                            fontWeight: 'bold' 
                          }}>
                            {Math.max(0, futuresPropResults.minDays - parseInt(futuresProp.tradingDays))}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>Avg Daily P&L</div>
                          <div style={{ 
                            color: futuresDailyEntries.length > 0 ? 
                              (futuresDailyEntries.reduce((sum, e) => sum + e.profitLoss, 0) / futuresDailyEntries.length >= 0 ? theme.success : theme.danger) : 
                              theme.text, 
                            fontSize: '18px', 
                            fontWeight: 'bold' 
                          }}>
                            ${futuresDailyEntries.length > 0 ? (futuresDailyEntries.reduce((sum, e) => sum + e.profitLoss, 0) / futuresDailyEntries.length).toFixed(2) : '0.00'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: theme.textMuted, fontSize: '11px' }}>Total Trades</div>
                          <div style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold' }}>
                            {futuresDailyEntries.reduce((sum, e) => sum + e.trades, 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recent Entries Table */}
                    {futuresDailyEntries.length > 0 && (
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
                              {futuresDailyEntries.slice(-5).reverse().map((entry, idx) => (
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
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
