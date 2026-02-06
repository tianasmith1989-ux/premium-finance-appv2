'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  // App Mode Selection
  const [appMode, setAppMode] = useState<'budget' | 'trading' | null>(null)
  const [showModeSelector, setShowModeSelector] = useState(true)
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'path' | 'trading'>('dashboard')
  const [darkMode, setDarkMode] = useState(true)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [tradingCalendarMonth, setTradingCalendarMonth] = useState(new Date())
  
  // Financial State
  const [incomeStreams, setIncomeStreams] = useState<any[]>([])
  const [newIncome, setNewIncome] = useState({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0] })
  
  const [expenses, setExpenses] = useState<any[]>([])
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', frequency: 'monthly', dueDate: new Date().toISOString().split('T')[0] })
  
  const [debts, setDebts] = useState<any[]>([])
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', interestRate: '', minPayment: '', frequency: 'monthly', paymentDate: new Date().toISOString().split('T')[0] })
  const [payoffMethod, setPayoffMethod] = useState<'snowball' | 'avalanche'>('avalanche')
  
  const [goals, setGoals] = useState<any[]>([])
  const [newGoal, setNewGoal] = useState({ name: '', target: '', saved: '0', deadline: '', savingsFrequency: 'monthly', startDate: new Date().toISOString().split('T')[0], paymentAmount: '' })
  const [extraGoalPayment, setExtraGoalPayment] = useState('')
  const [selectedGoalForExtra, setSelectedGoalForExtra] = useState<number | null>(null)
  
  const [assets, setAssets] = useState<any[]>([])
  const [newAsset, setNewAsset] = useState({ name: '', value: '', type: 'savings' })
  const [liabilities, setLiabilities] = useState<any[]>([])
  const [newLiability, setNewLiability] = useState({ name: '', value: '', type: 'loan' })
  
  const [paidOccurrences, setPaidOccurrences] = useState<Set<string>>(new Set())
  
  // AI Coach State
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [chatInput, setChatInput] = useState('')
  const [isAskingCoach, setIsAskingCoach] = useState(false)
  
  // Trading State
  const [trades, setTrades] = useState<any[]>([])
  const [newTrade, setNewTrade] = useState({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' })

  const [expandedDay, setExpandedDay] = useState<{day: number, items: any[]} | null>(null)
  const [debtExtraPayment, setDebtExtraPayment] = useState<{[key: number]: {amount: string, frequency: string}}>({})
  const [showExtraInput, setShowExtraInput] = useState<number | null>(null)

  // Specialized Calculator States
  const [forexProp, setForexProp] = useState({
    phase: 'phase1', accountSize: '100000', phase1DailyDD: '5', phase1MaxDD: '10', phase1Target: '10',
    phase1MinDays: '4', phase1MaxDays: '30', phase2DailyDD: '5', phase2MaxDD: '10', phase2Target: '5',
    phase2MinDays: '4', phase2MaxDays: '60', fundedDailyDD: '5', fundedMaxDD: '10', currentBalance: '100000',
    tradingDays: '0', riskPerTrade: '1', tradesPerDay: '2', winRate: '55', avgRR: '1.5', profitSplit: '80'
  })
  
  const [futuresProp, setFuturesProp] = useState({
    phase: 'evaluation', accountSize: '50000', evalTrailingDD: '2500', evalProfitTarget: '3000',
    evalMinDays: '7', evalDrawdownType: 'trailing', paTrailingDD: '2500', paProfitTarget: '3000',
    paMinDays: '7', paDrawdownType: 'eod', fundedTrailingDD: '2500', fundedDrawdownType: 'eod',
    currentBalance: '50000', highWaterMark: '50000', tradingDays: '0', contractLimit: '10',
    riskPerTrade: '200', tradesPerDay: '3', winRate: '50', avgWin: '300', avgLoss: '200', profitSplit: '90'
  })

  const [tradingCalculator, setTradingCalculator] = useState({ 
    startingCapital: '10000', monthlyContribution: '500', returnRate: '1', returnPeriod: 'daily',
    years: '0', months: '0', days: '0', includeDays: ['M', 'T', 'W', 'T2', 'F'], reinvestRate: '100',
    riskPerTrade: '2', winRate: '55', riskReward: '1.5'
  })

  // Theme Definition
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

  // --- Utility Logic ---
  const convertToMonthly = (amount: number, frequency: string) => {
    if (frequency === 'weekly') return amount * (52 / 12)
    if (frequency === 'fortnightly') return amount * (26 / 12)
    if (frequency === 'yearly') return amount / 12
    return amount
  }

  // --- Financial Calculations ---
  const monthlyIncome = incomeStreams.reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || '0'), inc.frequency), 0)
  const passiveIncome = incomeStreams.filter(inc => inc.type === 'passive').reduce((sum, inc) => sum + convertToMonthly(parseFloat(inc.amount || '0'), inc.frequency), 0)
  const monthlyExpenses = expenses.filter(e => !e.targetDebtId && !e.targetGoalId).reduce((sum, exp) => sum + convertToMonthly(parseFloat(exp.amount || '0'), exp.frequency), 0)
  const monthlyDebtPayments = debts.reduce((sum, debt) => sum + convertToMonthly(parseFloat(debt.minPayment || '0'), debt.frequency), 0)
  const totalOutgoing = monthlyExpenses + monthlyDebtPayments
  const monthlySurplus = monthlyIncome - totalOutgoing
  const totalAssets = assets.reduce((sum, a) => sum + parseFloat(a.value || '0'), 0)
  const totalDebtBalance = debts.reduce((sum, d) => sum + parseFloat(d.balance || '0'), 0)
  const netWorth = totalAssets - totalDebtBalance - liabilities.reduce((sum, l) => sum + parseFloat(l.value || '0'), 0)

  // --- Path (FIRE) Logic ---
  const fireNumber = monthlyExpenses * 12 * 25
  const passiveCoverage = monthlyExpenses > 0 ? (passiveIncome / monthlyExpenses) * 100 : 0
  const yearsToFI = monthlySurplus > 0 ? (fireNumber - totalAssets) / (monthlySurplus * 12) : Infinity

  // --- Functions ---
  const addIncome = () => { if (!newIncome.name || !newIncome.amount) return; setIncomeStreams([...incomeStreams, { ...newIncome, id: Date.now() }]); setNewIncome({ name: '', amount: '', frequency: 'monthly', type: 'active', startDate: new Date().toISOString().split('T')[0] }) }
  const addExpense = () => { if (!newExpense.name || !newExpense.amount) return; setExpenses([...expenses, { ...newExpense, id: Date.now() }]); setNewExpense({ name: '', amount: '', frequency: 'monthly', dueDate: new Date().toISOString().split('T')[0] }) }
  const addTrade = () => { if (!newTrade.instrument) return; setTrades([{ ...newTrade, id: Date.now() }, ...trades]); setNewTrade({ date: new Date().toISOString().split('T')[0], instrument: '', direction: 'long', entryPrice: '', exitPrice: '', profitLoss: '', notes: '' }) }

  // --- AI Coach Placeholder ---
  const askBudgetCoach = async () => {
    if (!chatInput) return;
    setIsAskingCoach(true);
    const updatedMessages = [...chatMessages, { role: 'user' as const, content: chatInput }];
    setChatMessages(updatedMessages);
    setChatInput('');
    // Logic for AI response goes here
    setIsAskingCoach(false);
  }

  // Styles
  const inputStyle: React.CSSProperties = { padding: '10px 14px', border: '2px solid ' + theme.inputBorder, borderRadius: '8px', fontSize: '14px', background: theme.input, color: theme.text }
  const btnPrimary: React.CSSProperties = { padding: '10px 20px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }
  const cardStyle: React.CSSProperties = { padding: '24px', background: theme.cardBg, borderRadius: '16px', border: '1px solid ' + theme.border }

  if (showModeSelector) {
    return (
      <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: theme.text, fontSize: '32px', marginBottom: '40px' }}>Premium Finance Dashboard</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '800px', width: '100%', padding: '20px' }}>
          <button onClick={() => { setAppMode('budget'); setShowModeSelector(false); setActiveTab('dashboard') }} style={{ ...cardStyle, cursor: 'pointer', textAlign: 'left', border: '2px solid ' + theme.success }}>
            <h2 style={{ color: theme.success }}>💰 Budget Mode</h2>
            <p style={{ color: theme.textMuted }}>Income, Expenses, Debt Payoff, and FI Path.</p>
          </button>
          <button onClick={() => { setAppMode('trading'); setShowModeSelector(false); setActiveTab('trading') }} style={{ ...cardStyle, cursor: 'pointer', textAlign: 'left', border: '2px solid ' + theme.warning }}>
            <h2 style={{ color: theme.warning }}>📈 Trading Mode</h2>
            <p style={{ color: theme.textMuted }}>Prop Firm Calculators, Compounding, and Journal.</p>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button onClick={() => setShowModeSelector(true)} style={{...btnPrimary, background: theme.cardBg, color: theme.text, border: '1px solid ' + theme.border}}>← Switch Mode</button>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Premium Finance</h1>
        </div>
        <nav style={{ display: 'flex', gap: '10px', background: theme.cardBg, padding: '5px', borderRadius: '12px', border: '1px solid ' + theme.border }}>
          {['dashboard', 'overview', 'path', 'trading'].map(t => (
            <button key={t} onClick={() => setActiveTab(t as any)} style={{ ...btnPrimary, background: activeTab === t ? theme.accent : 'transparent', color: activeTab === t ? 'white' : theme.text }}>
              {t.toUpperCase()}
            </button>
          ))}
          <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 10px' }}>{darkMode ? '☀️' : '🌙'}</button>
        </nav>
      </header>

      <main>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={cardStyle}><p style={{color: theme.textMuted}}>Monthly Income</p><h3>${monthlyIncome.toFixed(2)}</h3></div>
              <div style={cardStyle}><p style={{color: theme.textMuted}}>Total Expenses</p><h3>${totalOutgoing.toFixed(2)}</h3></div>
              <div style={cardStyle}><p style={{color: theme.textMuted}}>Monthly Surplus</p><h3 style={{color: monthlySurplus >= 0 ? theme.success : theme.danger}}>${monthlySurplus.toFixed(2)}</h3></div>
              <div style={cardStyle}><p style={{color: theme.textMuted}}>Net Worth</p><h3>${netWorth.toFixed(2)}</h3></div>
            </div>
            {/* Income and Expense Forms here */}
            <div style={cardStyle}>
              <h3>Add Income</h3>
              <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}><input style={inputStyle} placeholder="Name" value={newIncome.name} onChange={e => setNewIncome({...newIncome, name: e.target.value})} /><input style={inputStyle} type="number" placeholder="Amount" value={newIncome.amount} onChange={e => setNewIncome({...newIncome, amount: e.target.value})} /><button style={btnPrimary} onClick={addIncome}>Add</button></div>
            </div>
            <div style={cardStyle}>
              <h3>Add Expense</h3>
              <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}><input style={inputStyle} placeholder="Name" value={newExpense.name} onChange={e => setNewExpense({...newExpense, name: e.target.value})} /><input style={inputStyle} type="number" placeholder="Amount" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} /><button style={{...btnPrimary, background: theme.danger}} onClick={addExpense}>Add</button></div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={cardStyle}>
                <h2 style={{ color: theme.success }}>📈 Assets (${totalAssets.toFixed(2)})</h2>
                <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                  <input style={inputStyle} placeholder="Asset Name" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} />
                  <input style={inputStyle} type="number" placeholder="Value" value={newAsset.value} onChange={e => setNewAsset({...newAsset, value: e.target.value})} />
                  <button style={btnPrimary} onClick={() => { if(newAsset.name && newAsset.value) setAssets([...assets, {...newAsset, id: Date.now()}]); setNewAsset({name: '', value: '', type: 'savings'}) }}>Add</button>
                </div>
              </div>
              <div style={cardStyle}>
                <h2 style={{ color: theme.danger }}>📉 Liabilities (${(totalDebtBalance).toFixed(2)})</h2>
                <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                  <input style={inputStyle} placeholder="Liability Name" value={newLiability.name} onChange={e => setNewLiability({...newLiability, name: e.target.value})} />
                  <input style={inputStyle} type="number" placeholder="Balance" value={newLiability.value} onChange={e => setNewLiability({...newLiability, value: e.target.value})} />
                  <button style={{...btnPrimary, background: theme.danger}} onClick={() => { if(newLiability.name && newLiability.value) setLiabilities([...liabilities, {...newLiability, id: Date.now()}]); setNewLiability({name: '', value: '', type: 'loan'}) }}>Add</button>
                </div>
              </div>
            </div>
            <div style={cardStyle}>
              <h3>🤖 AI Budget Coach</h3>
              <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '10px', background: theme.bg, borderRadius: '8px', margin: '10px 0' }}>
                {chatMessages.map((m, i) => <div key={i} style={{marginBottom: '5px'}}><strong>{m.role}:</strong> {m.content}</div>)}
              </div>
              <div style={{display: 'flex', gap: '10px'}}><input style={{...inputStyle, flex: 1}} placeholder="Ask for advice..." value={chatInput} onChange={e => setChatInput(e.target.value)} /><button style={btnPrimary} onClick={askBudgetCoach}>Ask</button></div>
            </div>
          </div>
        )}

        {activeTab === 'path' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{...cardStyle, textAlign: 'center', background: 'linear-gradient(135deg, ' + theme.accent + ', ' + theme.purple + ')', color: 'white'}}>
              <p style={{opacity: 0.9}}>Your FIRE Number (25x annual expenses)</p>
              <h2 style={{fontSize: '48px'}}>${fireNumber.toLocaleString()}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={cardStyle}><p>Passive Income</p><h3>${passiveIncome.toFixed(2)}/mo</h3></div>
              <div style={cardStyle}><p>Expense Coverage</p><h3>{passiveCoverage.toFixed(1)}%</h3></div>
              <div style={cardStyle}><p>Years to Freedom</p><h3>{yearsToFI === Infinity ? '∞' : Math.ceil(yearsToFI)} years</h3></div>
            </div>
          </div>
        )}

        {activeTab === 'trading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={cardStyle}>
              <h2>Forex/CFD Prop Calculator</h2>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px'}}>
                <div><label>Account Size</label><input style={{...inputStyle, width: '100%'}} value={forexProp.accountSize} onChange={e => setForexProp({...forexProp, accountSize: e.target.value})} /></div>
                <div><label>Risk Per Trade %</label><input style={{...inputStyle, width: '100%'}} value={forexProp.riskPerTrade} onChange={e => setForexProp({...forexProp, riskPerTrade: e.target.value})} /></div>
                <div><label>Daily DD Limit %</label><input style={{...inputStyle, width: '100%'}} value={forexProp.phase1DailyDD} onChange={e => setForexProp({...forexProp, phase1DailyDD: e.target.value})} /></div>
              </div>
            </div>
            <div style={cardStyle}>
              <h2>Trading Journal</h2>
              <div style={{ display: 'flex', gap: '10px', margin: '15px 0' }}>
                <input style={inputStyle} placeholder="Pair" value={newTrade.instrument} onChange={e => setNewTrade({...newTrade, instrument: e.target.value})} />
                <input style={inputStyle} type="number" placeholder="P&L" value={newTrade.profitLoss} onChange={e => setNewTrade({...newTrade, profitLoss: e.target.value})} />
                <button style={btnPrimary} onClick={addTrade}>Log Trade</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{borderBottom: '2px solid ' + theme.border, textAlign: 'left'}}><th style={{padding: '10px'}}>Date</th><th>Pair</th><th>P&L</th></tr></thead>
                <tbody>
                  {trades.map(t => <tr key={t.id} style={{borderBottom: '1px solid ' + theme.border}}><td style={{padding: '10px'}}>{t.date}</td><td>{t.instrument}</td><td style={{color: parseFloat(t.profitLoss) >= 0 ? theme.success : theme.danger}}>${parseFloat(t.profitLoss).toFixed(2)}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
