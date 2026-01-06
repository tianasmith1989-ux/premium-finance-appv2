'use client'

import { useUser } from '@clerk/nextjs'
import { useState } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  // Main navigation
  const [mainTab, setMainTab] = useState("finance") // finance or trading
  const [financeTab, setFinanceTab] = useState("goals")
  const [tradingTab, setTradingTab] = useState("trading-goals")
  
  // Finance Data
  const [goals, setGoals] = useState<any[]>([])
  const [newGoal, setNewGoal] = useState({
    name: '', target: '', saved: '', deadline: ''
  })
  
  const [transactions, setTransactions] = useState<any[]>([])
  const [newTransaction, setNewTransaction] = useState({
    name: '', amount: '', type: 'expense', date: new Date().toISOString().split('T')[0], recurring: false
  })
  
  // Trading Data
  const [tradingGoals, setTradingGoals] = useState<any[]>([])
  const [newTradingGoal, setNewTradingGoal] = useState({
    name: '', target: '', current: '', deadline: '', type: 'profit' // profit, winrate, consistency
  })
  
  const [trades, setTrades] = useState<any[]>([])
  const [newTrade, setNewTrade] = useState({
    date: new Date().toISOString().split('T')[0],
    instrument: '',
    direction: 'long',
    entryPrice: '',
    exitPrice: '',
    size: '',
    profitLoss: '',
    fees: '',
    notes: '',
    strategy: '',
    setup: '',
    timeframe: '1H',
    emotionalState: 'neutral',
    manualPL: true
  })
  
  const [tradingCosts, setTradingCosts] = useState({
    monthlyBrokerFees: 0,
    subscriptions: [] as any[],
    challenges: [] as any[],
    dataSoftware: [] as any[]
  })
  
  const [newCost, setNewCost] = useState({
    name: '', cost: '', frequency: 'monthly', type: 'subscription'
  })
  
  // Finance Calculations
  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
  const monthlySurplus = totalIncome - totalExpenses
  const totalGoalsTarget = goals.reduce((sum, g) => sum + parseFloat(g.target || 0), 0)
  const totalGoalsSaved = goals.reduce((sum, g) => sum + parseFloat(g.saved || 0), 0)
  const totalGoalsRemaining = totalGoalsTarget - totalGoalsSaved
  
  // Trading Calculations
  const totalPL = trades.reduce((sum, t) => sum + parseFloat(t.profitLoss || 0), 0)
  const winners = trades.filter(t => parseFloat(t.profitLoss || 0) > 0)
  const losers = trades.filter(t => parseFloat(t.profitLoss || 0) < 0)
  const winRate = trades.length > 0 ? (winners.length / trades.length) * 100 : 0
  const avgWin = winners.length > 0 ? winners.reduce((sum, t) => sum + parseFloat(t.profitLoss), 0) / winners.length : 0
  const avgLoss = losers.length > 0 ? Math.abs(losers.reduce((sum, t) => sum + parseFloat(t.profitLoss), 0) / losers.length) : 0
  const profitFactor = avgLoss > 0 ? (avgWin * winners.length) / (avgLoss * losers.length) : 0
  
  const monthlyCosts = tradingCosts.monthlyBrokerFees + 
    [...tradingCosts.subscriptions, ...tradingCosts.challenges, ...tradingCosts.dataSoftware]
    .reduce((sum, item) => {
      const multiplier = item.frequency === 'yearly' ? 1/12 : item.frequency === 'weekly' ? 52/12 : 1
      return sum + (parseFloat(item.cost || 0) * multiplier)
    }, 0)
  
  const netPL = totalPL - monthlyCosts
  
  // Functions
  const addGoal = () => {
    if (!newGoal.name || !newGoal.target) return
    setGoals([...goals, { ...newGoal, id: Date.now() }])
    setNewGoal({ name: '', target: '', saved: '', deadline: '' })
  }
  
  const addTradingGoal = () => {
    if (!newTradingGoal.name || !newTradingGoal.target) return
    setTradingGoals([...tradingGoals, { ...newTradingGoal, id: Date.now() }])
    setNewTradingGoal({ name: '', target: '', current: '', deadline: '', type: 'profit' })
  }
  
  const addTransaction = () => {
    if (!newTransaction.name || !newTransaction.amount) return
    setTransactions([...transactions, { ...newTransaction, id: Date.now() }])
    setNewTransaction({ name: '', amount: '', type: 'expense', date: new Date().toISOString().split('T')[0], recurring: false })
  }
  
  const addTrade = () => {
    if (!newTrade.instrument) return
    setTrades([...trades, { ...newTrade, id: Date.now() }].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    setNewTrade({
      date: new Date().toISOString().split('T')[0],
      instrument: '', direction: 'long', entryPrice: '', exitPrice: '', size: '',
      profitLoss: '', fees: '', notes: '', strategy: '', setup: '', timeframe: '1H',
      emotionalState: 'neutral', manualPL: true
    })
  }
  
  const addCost = () => {
    if (!newCost.name || !newCost.cost) return
    const list = newCost.type === 'subscription' ? 'subscriptions' : newCost.type === 'challenge' ? 'challenges' : 'dataSoftware'
    setTradingCosts({
      ...tradingCosts,
      [list]: [...tradingCosts[list], { ...newCost, id: Date.now() }]
    })
    setNewCost({ name: '', cost: '', frequency: 'monthly', type: 'subscription' })
  }
  
  // Calendar helpers
  const getDaysInMonth = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth, month, year }
  }
  
  const getTransactionsForDay = (day: number) => {
    const { month, year } = getDaysInMonth()
    return transactions.filter(t => {
      const tDate = new Date(t.date)
      return tDate.getDate() === day && tDate.getMonth() === month && tDate.getFullYear() === year
    })
  }
  
  const getTradesForDay = (day: number) => {
    const { month, year } = getDaysInMonth()
    return trades.filter(t => {
      const tDate = new Date(t.date)
      return tDate.getDate() === day && tDate.getMonth() === month && tDate.getFullYear() === year
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eef2ff, #fce7f3)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(to right, #4f46e5, #7c3aed)', color: 'white', padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            ✨ Premium Finance Pro
          </h1>
          <p style={{ opacity: '0.9', margin: '0 0 24px 0' }}>
            Welcome, {user?.firstName || 'User'}! {mainTab === 'finance' ? "Let's achieve your financial goals." : "Let's master your trading!"}
          </p>
          
          {/* Main Tabs */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <button 
              onClick={() => setMainTab("finance")}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                background: mainTab === "finance" ? "white" : "rgba(255,255,255,0.2)",
                color: mainTab === "finance" ? "#4f46e5" : "white"
              }}
            >
              💰 Personal Finance
            </button>
            <button 
              onClick={() => setMainTab("trading")}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                background: mainTab === "trading" ? "white" : "rgba(255,255,255,0.2)",
                color: mainTab === "trading" ? "#4f46e5" : "white"
              }}
            >
              📈 Trading
            </button>
          </div>
          
          {/* Sub Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {mainTab === 'finance' ? (
              <>
                {[
                  { id: "goals", label: "🎯 My Goals" },
                  { id: "position", label: "📊 Current Position" },
                  { id: "path", label: "🗺️ Path to Goals" },
                  { id: "transactions", label: "💰 Transactions" }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setFinanceTab(tab.id)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500',
                      background: financeTab === tab.id ? "white" : "rgba(255,255,255,0.1)",
                      color: financeTab === tab.id ? "#4f46e5" : "white"
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </>
            ) : (
              <>
                {[
                  { id: "trading-goals", label: "🎯 Trading Goals" },
                  { id: "performance", label: "📊 Current Performance" },
                  { id: "trading-path", label: "🗺️ Path to Profitability" },
                  { id: "journal", label: "📈 Trade Journal" },
                  { id: "costs", label: "💸 Trading Costs" }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setTradingTab(tab.id)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500',
                      background: tradingTab === tab.id ? "white" : "rgba(255,255,255,0.1)",
                      color: tradingTab === tab.id ? "#4f46e5" : "white"
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        
        {/* FINANCE SECTION */}
        {mainTab === 'finance' && (
          <>
            {/* Finance Goals */}
            {financeTab === 'goals' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>🎯 Your Financial Goals</h2>
                <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '18px' }}>
                  Set your goals and watch your progress! The path to financial freedom starts here.
                </p>
                
                <div style={{ marginBottom: '32px', padding: '24px', background: '#f0f9ff', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>➕ Add New Goal</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <input type="text" placeholder="Goal name" value={newGoal.name} onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="number" placeholder="Target" value={newGoal.target} onChange={(e) => setNewGoal({...newGoal, target: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="number" placeholder="Saved" value={newGoal.saved} onChange={(e) => setNewGoal({...newGoal, saved: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <button onClick={addGoal} style={{ padding: '12px 24px', background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Add Goal</button>
                  </div>
                </div>
                
                {goals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎯</div>
                    <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>No goals yet!</h3>
                    <p style={{ color: '#64748b' }}>Add your first financial goal above.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {goals.map(goal => {
                      const target = parseFloat(goal.target || 0)
                      const saved = parseFloat(goal.saved || 0)
                      const progress = target > 0 ? (saved / target) * 100 : 0
                      return (
                        <div key={goal.id} style={{ padding: '24px', background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div>
                              <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{goal.name}</h3>
                              <p style={{ color: '#64748b' }}>${saved.toLocaleString()} of ${target.toLocaleString()}</p>
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>{progress.toFixed(0)}%</div>
                          </div>
                          <div style={{ width: '100%', height: '24px', background: '#e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: 'linear-gradient(to right, #3b82f6, #2563eb)' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
            
            {/* Current Position - Keep existing code */}
            {financeTab === 'position' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '32px' }}>📊 Current Financial Position</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                  <div style={{ padding: '24px', background: '#f0fdf4', borderRadius: '12px', border: '2px solid #10b981' }}>
                    <h3 style={{ fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>💰 Monthly Income</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>${totalIncome.toFixed(2)}</p>
                  </div>
                  <div style={{ padding: '24px', background: '#fef2f2', borderRadius: '12px', border: '2px solid #ef4444' }}>
                    <h3 style={{ fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>💸 Monthly Expenses</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>${totalExpenses.toFixed(2)}</p>
                  </div>
                  <div style={{ padding: '24px', background: '#f0f9ff', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                    <h3 style={{ fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>📈 Monthly Surplus</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: monthlySurplus >= 0 ? '#10b981' : '#ef4444' }}>${monthlySurplus.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Path to Goals - Keep existing */}
            {financeTab === 'path' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>🗺️ Path to Financial Goals</h2>
                {goals.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '32px' }}>Set goals first!</p>
                ) : (
                  <div style={{ padding: '32px', background: '#f0fdf4', borderRadius: '12px' }}>
                    <p style={{ fontSize: '18px' }}>
                      With ${monthlySurplus.toFixed(2)}/month surplus, you'll reach your goals in approximately <strong>{Math.ceil(totalGoalsRemaining / monthlySurplus)} months</strong>
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Transactions */}
            {financeTab === 'transactions' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>💰 Transactions</h2>
                <div style={{ marginBottom: '32px', padding: '24px', background: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <input type="text" placeholder="Name" value={newTransaction.name} onChange={(e) => setNewTransaction({...newTransaction, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="number" placeholder="Amount" value={newTransaction.amount} onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <select value={newTransaction.type} onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                    <input type="date" value={newTransaction.date} onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <button onClick={addTransaction} style={{ padding: '12px 24px', background: 'linear-gradient(to right, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Add</button>
                  </div>
                </div>
                {transactions.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '32px' }}>No transactions yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {transactions.map(t => (
                      <div key={t.id} style={{ padding: '16px', background: t.type === 'income' ? '#f0fdf4' : '#fef2f2', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
                        <div><div style={{ fontWeight: '600' }}>{t.name}</div><div style={{ fontSize: '14px', color: '#64748b' }}>{new Date(t.date).toLocaleDateString()}</div></div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: t.type === 'income' ? '#10b981' : '#ef4444' }}>{t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
        
        {/* TRADING SECTION */}
        {mainTab === 'trading' && (
          <>
            {/* Trading Goals */}
            {tradingTab === 'trading-goals' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>🎯 Trading Goals</h2>
                <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '18px' }}>
                  Set your trading targets and track your journey to consistent profitability.
                </p>
                
                <div style={{ marginBottom: '32px', padding: '24px', background: '#fef3c7', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>➕ Add Trading Goal</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <input type="text" placeholder="Goal name (e.g., Monthly Profit)" value={newTradingGoal.name} onChange={(e) => setNewTradingGoal({...newTradingGoal, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="number" placeholder="Target" value={newTradingGoal.target} onChange={(e) => setNewTradingGoal({...newTradingGoal, target: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="number" placeholder="Current" value={newTradingGoal.current} onChange={(e) => setNewTradingGoal({...newTradingGoal, current: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <select value={newTradingGoal.type} onChange={(e) => setNewTradingGoal({...newTradingGoal, type: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <option value="profit">Profit Target ($)</option>
                      <option value="winrate">Win Rate (%)</option>
                      <option value="consistency">Consistency Goal</option>
                    </select>
                    <input type="date" value={newTradingGoal.deadline} onChange={(e) => setNewTradingGoal({...newTradingGoal, deadline: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <button onClick={addTradingGoal} style={{ padding: '12px 24px', background: 'linear-gradient(to right, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Add Goal</button>
                  </div>
                </div>
                
                {tradingGoals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎯</div>
                    <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>No trading goals yet!</h3>
                    <p style={{ color: '#64748b' }}>Set your first trading goal above.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {tradingGoals.map(goal => {
                      const target = parseFloat(goal.target || 0)
                      const current = parseFloat(goal.current || 0)
                      const progress = target > 0 ? (current / target) * 100 : 0
                      return (
                        <div key={goal.id} style={{ padding: '24px', background: 'linear-gradient(to right, #fef3c7, #fde68a)', borderRadius: '12px', border: '2px solid #f59e0b' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div>
                              <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{goal.name}</h3>
                              <p style={{ color: '#92400e' }}>{current.toFixed(goal.type === 'winrate' ? 1 : 2)}{goal.type === 'winrate' ? '%' : ''} of {target.toFixed(goal.type === 'winrate' ? 1 : 2)}{goal.type === 'winrate' ? '%' : ''}</p>
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{progress.toFixed(0)}%</div>
                          </div>
                          <div style={{ width: '100%', height: '24px', background: '#e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: 'linear-gradient(to right, #f59e0b, #d97706)' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
            
            {/* Current Performance */}
            {tradingTab === 'performance' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '32px' }}>📊 Current Trading Performance</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                  <div style={{ padding: '24px', background: totalPL >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: '12px', border: `2px solid ${totalPL >= 0 ? '#10b981' : '#ef4444'}` }}>
                    <h3 style={{ fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>Total P&L</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: totalPL >= 0 ? '#10b981' : '#ef4444' }}>${totalPL.toFixed(2)}</p>
                  </div>
                  <div style={{ padding: '24px', background: '#f0f9ff', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                    <h3 style={{ fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>Win Rate</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>{winRate.toFixed(1)}%</p>
                  </div>
                  <div style={{ padding: '24px', background: '#fef3c7', borderRadius: '12px', border: '2px solid #f59e0b' }}>
                    <h3 style={{ fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>Profit Factor</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{profitFactor.toFixed(2)}</p>
                  </div>
                  <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '2px solid #64748b' }}>
                    <h3 style={{ fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>Total Trades</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{trades.length}</p>
                  </div>
                </div>
                
                {/* Calendar P&L */}
                <div>
                  <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>📅 Monthly P&L Calendar</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: '#64748b' }}>{day}</div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                    {(() => {
                      const { firstDay, daysInMonth } = getDaysInMonth()
                      const cells = []
                      for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} />)
                      for (let day = 1; day <= daysInMonth; day++) {
                        const dayTrades = getTradesForDay(day)
                        const dayPL = dayTrades.reduce((s, t) => s + parseFloat(t.profitLoss || 0), 0)
                        const isToday = day === new Date().getDate()
                        cells.push(
                          <div key={day} style={{
                            padding: '12px 8px',
                            border: isToday ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                            borderRadius: '8px',
                            background: dayPL > 0 ? '#f0fdf4' : dayPL < 0 ? '#fef2f2' : 'white',
                            minHeight: '80px'
                          }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{day}</div>
                            {dayPL !== 0 && (
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: dayPL > 0 ? '#10b981' : '#ef4444' }}>
                                {dayPL > 0 ? '+' : ''}${dayPL.toFixed(2)}
                              </div>
                            )}
                          </div>
                        )
                      }
                      return cells
                    })()}
                  </div>
                </div>
              </div>
            )}
            
            {/* Path to Profitability */}
            {tradingTab === 'trading-path' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>🗺️ Path to Consistent Profitability</h2>
                <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '18px' }}>
                  Based on your current performance, here's your roadmap to success.
                </p>
                
                {trades.length < 10 ? (
                  <div style={{ padding: '32px', background: '#fef3c7', borderRadius: '12px', border: '2px solid #f59e0b' }}>
                    <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>📊 Need More Data</h3>
                    <p style={{ fontSize: '18px' }}>Log at least 10 trades to get personalized insights and recommendations.</p>
                    <p style={{ marginTop: '12px', color: '#92400e' }}>Current: {trades.length} trades • Need: {10 - trades.length} more</p>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '32px', padding: '32px', background: 'linear-gradient(to right, #fef3c7, #fde68a)', borderRadius: '12px', border: '2px solid #f59e0b' }}>
                      <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>📈 Current Stats</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div><div style={{ fontSize: '14px', color: '#92400e' }}>Win Rate</div><div style={{ fontSize: '28px', fontWeight: 'bold' }}>{winRate.toFixed(1)}%</div></div>
                        <div><div style={{ fontSize: '14px', color: '#92400e' }}>Avg Win</div><div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>${avgWin.toFixed(2)}</div></div>
                        <div><div style={{ fontSize: '14px', color: '#92400e' }}>Avg Loss</div><div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>${avgLoss.toFixed(2)}</div></div>
                        <div><div style={{ fontSize: '14px', color: '#92400e' }}>Net P&L</div><div style={{ fontSize: '28px', fontWeight: 'bold', color: netPL >= 0 ? '#10b981' : '#ef4444' }}>${netPL.toFixed(2)}</div></div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '32px', background: '#f0fdf4', borderRadius: '12px', border: '2px solid #10b981' }}>
                      <h3 style={{ fontSize: '24px', marginBottom: '24px' }}>✅ Recommendations</h3>
                      <ol style={{ marginLeft: '20px', lineHeight: '2', fontSize: '16px' }}>
                        {winRate < 50 && <li style={{ color: '#ef4444' }}>⚠️ Win rate below 50% - Focus on trade selection and entry timing</li>}
                        {profitFactor < 1.5 && <li style={{ color: '#f59e0b' }}>⚠️ Improve profit factor - Let winners run longer or cut losses sooner</li>}
                        {avgLoss > avgWin && <li style={{ color: '#ef4444' }}>⚠️ Average loss exceeds average win - Tighten risk management</li>}
                        {netPL < 0 && <li style={{ color: '#ef4444', fontWeight: 'bold' }}>🚨 Net negative after costs - Review strategy and reduce trading frequency</li>}
                        {netPL >= 0 && winRate >= 50 && profitFactor >= 1.5 && <li style={{ color: '#10b981', fontWeight: 'bold' }}>🎉 Great work! You're on the path to consistent profitability!</li>}
                        <li>Track at least 50-100 trades before making major strategy changes</li>
                        <li>Review losing trades to identify patterns</li>
                        <li>Consider reducing position size if drawdowns are high</li>
                      </ol>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Trade Journal */}
            {tradingTab === 'journal' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>📈 Trade Journal</h2>
                
                <div style={{ marginBottom: '32px', padding: '24px', background: '#f8fafc', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Log New Trade</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <input type="date" value={newTrade.date} onChange={(e) => setNewTrade({...newTrade, date: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="text" placeholder="Instrument (e.g. EUR/USD)" value={newTrade.instrument} onChange={(e) => setNewTrade({...newTrade, instrument: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <select value={newTrade.direction} onChange={(e) => setNewTrade({...newTrade, direction: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <option value="long">Long</option>
                      <option value="short">Short</option>
                    </select>
                    <input type="number" step="0.01" placeholder="P&L" value={newTrade.profitLoss} onChange={(e) => setNewTrade({...newTrade, profitLoss: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <input type="text" placeholder="Strategy" value={newTrade.strategy} onChange={(e) => setNewTrade({...newTrade, strategy: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="text" placeholder="Setup" value={newTrade.setup} onChange={(e) => setNewTrade({...newTrade, setup: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <select value={newTrade.timeframe} onChange={(e) => setNewTrade({...newTrade, timeframe: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <option value="1M">1 Minute</option>
                      <option value="5M">5 Minutes</option>
                      <option value="15M">15 Minutes</option>
                      <option value="1H">1 Hour</option>
                      <option value="4H">4 Hours</option>
                      <option value="D">Daily</option>
                    </select>
                    <select value={newTrade.emotionalState} onChange={(e) => setNewTrade({...newTrade, emotionalState: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <option value="confident">Confident</option>
                      <option value="neutral">Neutral</option>
                      <option value="uncertain">Uncertain</option>
                      <option value="anxious">Anxious</option>
                      <option value="euphoric">Euphoric</option>
                    </select>
                  </div>
                  <textarea placeholder="Notes" value={newTrade.notes} onChange={(e) => setNewTrade({...newTrade, notes: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', minHeight: '80px' }} />
                  <button onClick={addTrade} style={{ padding: '12px 24px', background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>Log Trade</button>
                </div>
                
                {trades.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '32px' }}>No trades logged yet. Add your first trade above!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {trades.map(t => (
                      <div key={t.id} style={{ padding: '20px', background: parseFloat(t.profitLoss) >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: '12px', border: `2px solid ${parseFloat(t.profitLoss) >= 0 ? '#10b981' : '#ef4444'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{t.instrument} • {t.direction.toUpperCase()}</div>
                            <div style={{ fontSize: '14px', color: '#64748b' }}>{new Date(t.date).toLocaleDateString()} • {t.timeframe} • {t.strategy || 'No strategy'}</div>
                          </div>
                          <div style={{ fontSize: '28px', fontWeight: 'bold', color: parseFloat(t.profitLoss) >= 0 ? '#10b981' : '#ef4444' }}>
                            {parseFloat(t.profitLoss) >= 0 ? '+' : ''}${parseFloat(t.profitLoss).toFixed(2)}
                          </div>
                        </div>
                        {t.notes && <div style={{ fontSize: '14px', color: '#64748b', fontStyle: 'italic' }}>"{t.notes}"</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Trading Costs */}
            {tradingTab === 'costs' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>💸 Trading Costs</h2>
                
                <div style={{ marginBottom: '32px', padding: '32px', background: '#fef2f2', borderRadius: '12px', border: '2px solid #ef4444' }}>
                  <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Total Monthly Costs</h3>
                  <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#ef4444' }}>${monthlyCosts.toFixed(2)}</p>
                  <p style={{ color: '#64748b', marginTop: '8px' }}>Net P&L After Costs: <span style={{ fontWeight: 'bold', color: netPL >= 0 ? '#10b981' : '#ef4444' }}>${netPL.toFixed(2)}</span></p>
                </div>
                
                <div style={{ marginBottom: '32px', padding: '24px', background: '#f8fafc', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Add Cost</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <input type="text" placeholder="Name" value={newCost.name} onChange={(e) => setNewCost({...newCost, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="number" placeholder="Cost" value={newCost.cost} onChange={(e) => setNewCost({...newCost, cost: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <select value={newCost.type} onChange={(e) => setNewCost({...newCost, type: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <option value="subscription">Subscription</option>
                      <option value="challenge">Challenge Fee</option>
                      <option value="software">Data/Software</option>
                    </select>
                    <select value={newCost.frequency} onChange={(e) => setNewCost({...newCost, frequency: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                    <button onClick={addCost} style={{ padding: '12px 24px', background: 'linear-gradient(to right, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Add Cost</button>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  {[
                    { title: 'Subscriptions', list: tradingCosts.subscriptions },
                    { title: 'Challenge Fees', list: tradingCosts.challenges },
                    { title: 'Data/Software', list: tradingCosts.dataSoftware }
                  ].map(section => (
                    <div key={section.title} style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                      <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 'bold' }}>{section.title}</h3>
                      {section.list.length === 0 ? (
                        <p style={{ color: '#64748b', fontSize: '14px' }}>No {section.title.toLowerCase()} yet</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {section.list.map((item: any) => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'white', borderRadius: '8px' }}>
                              <span>{item.name}</span>
                              <span style={{ fontWeight: 'bold' }}>${parseFloat(item.cost).toFixed(2)}/{item.frequency}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
