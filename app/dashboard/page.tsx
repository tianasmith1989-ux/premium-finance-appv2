'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  // Main navigation
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // Financial data
  const [transactions, setTransactions] = useState([])
  const [savings, setSavings] = useState([])
  const [budgets, setBudgets] = useState({
    "Housing": 2000,
    "Transportation": 500,
    "Food": 600,
    "Entertainment": 300,
    "Shopping": 400,
    "Healthcare": 200,
    "Other": 500
  })
  
  // Trading data
  const [tradingEnabled, setTradingEnabled] = useState(false)
  const [trades, setTrades] = useState([])
  const [tradingView, setTradingView] = useState('dashboard')
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  
  // Trading costs
  const [tradingCosts, setTradingCosts] = useState({
    monthlyBrokerFees: 0,
    subscriptions: [],
    challenges: [],
    dataSoftware: [],
    notes: ''
  })
  
  // New trade form
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
    screenshots: [],
    manualPL: false,
    actualPL: ''
  })
  
  const [newTransaction, setNewTransaction] = useState({
    name: "", amount: "", type: "expense", category: "Other", frequency: "monthly"
  })
  
  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + (t.amount || 0), 0)
    
  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + (t.amount || 0), 0)
    
  const remainingCash = totalIncome - totalExpenses
  const totalSavings = savings.reduce((sum, s) => sum + (s.balance || 0), 0)
  const netWorth = totalSavings
  
  // Trading calculations
  const monthStats = {
    totalTrades: trades.length,
    totalPL: trades.reduce((sum, t) => sum + (t.profitLoss || 0), 0),
    winners: trades.filter(t => t.profitLoss > 0).length,
    losers: trades.filter(t => t.profitLoss < 0).length,
    winRate: trades.length > 0 ? (trades.filter(t => t.profitLoss > 0).length / trades.length) * 100 : 0
  }
  
  const calculateMonthlyCosts = () => {
    const allCosts = [...tradingCosts.subscriptions, ...tradingCosts.challenges, ...tradingCosts.dataSoftware]
    const total = allCosts.reduce((sum, item) => {
      const multiplier = item.frequency === 'yearly' ? 1/12 : item.frequency === 'weekly' ? 52/12 : 1
      return sum + (item.cost * multiplier)
    }, 0)
    return total + (tradingCosts.monthlyBrokerFees || 0)
  }
  
  // Add transaction
  const addTransaction = () => {
    if (!newTransaction.name || !newTransaction.amount) return
    setTransactions([...transactions, {
      ...newTransaction,
      id: Date.now(),
      amount: parseFloat(newTransaction.amount)
    }])
    setNewTransaction({ name: "", amount: "", type: "expense", category: "Other", frequency: "monthly" })
  }
  
  // Add trade
  const addTrade = () => {
    if (!newTrade.instrument) return
    const finalPL = newTrade.manualPL ? parseFloat(newTrade.actualPL) || 0 : parseFloat(newTrade.profitLoss) || 0
    setTrades([...trades, {
      ...newTrade,
      id: Date.now(),
      profitLoss: finalPL,
      timestamp: new Date(newTrade.date).getTime()
    }].sort((a, b) => b.timestamp - a.timestamp))
    setNewTrade({
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
      screenshots: [],
      manualPL: false,
      actualPL: ''
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eef2ff, #fce7f3)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(to right, #4f46e5, #7c3aed)', color: 'white', padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                ✨ Premium Finance Pro
              </h1>
              <p style={{ opacity: '0.9', margin: 0 }}>
                Welcome, {user?.firstName || 'User'}!
              </p>
            </div>
            {!tradingEnabled && (
              <button
                onClick={() => setTradingEnabled(true)}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(to right, #0ea5e9, #0284c7)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                📈 Enable Trading
              </button>
            )}
          </div>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: "dashboard", label: "📊 Dashboard" },
              { id: "transactions", label: "💰 Transactions" },
              tradingEnabled && { id: "trading", label: "📈 Trading" },
              { id: "budgets", label: "💵 Budgets" }
            ].filter(Boolean).map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  background: activeTab === tab.id ? "white" : "rgba(255,255,255,0.1)",
                  color: activeTab === tab.id ? "#4f46e5" : "white"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
              Net Worth: <span style={{ color: netWorth >= 0 ? '#10b981' : '#ef4444' }}>
                ${netWorth.toLocaleString()}
              </span>
            </h2>
            <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '32px', textAlign: 'center' }}>
              Income: ${totalIncome.toFixed(2)}/mo • Expenses: ${totalExpenses.toFixed(2)}/mo • Remaining: ${remainingCash.toFixed(2)}/mo
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '32px' }}>
              <div style={{ padding: '24px', background: '#f0f9ff', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>💰 Total Savings</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
                  ${totalSavings.toLocaleString()}
                </p>
              </div>
              
              <div style={{ padding: '24px', background: '#f0fdf4', borderRadius: '12px', border: '2px solid #10b981' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>📊 Monthly Income</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                  ${totalIncome.toFixed(2)}
                </p>
              </div>
              
              {tradingEnabled && (
                <div style={{ padding: '24px', background: '#fef3c7', borderRadius: '12px', border: '2px solid #f59e0b' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>📈 Trading P&L</h3>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: monthStats.totalPL >= 0 ? '#10b981' : '#ef4444' }}>
                    ${monthStats.totalPL.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>💰 Transactions</h2>
            
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Add Transaction</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <input
                  type="text"
                  placeholder="Name"
                  value={newTransaction.name}
                  onChange={(e) => setNewTransaction({...newTransaction, name: e.target.value})}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <button
                  onClick={addTransaction}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Add Transaction
                </button>
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Recent Transactions</h3>
              {transactions.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '32px' }}>
                  No transactions yet. Add your first one above!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {transactions.map(t => (
                    <div
                      key={t.id}
                      style={{
                        padding: '16px',
                        background: t.type === 'income' ? '#f0fdf4' : '#fef2f2',
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: '600' }}>{t.name}</div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>{t.category}</div>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: t.type === 'income' ? '#10b981' : '#ef4444' }}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Trading Tab */}
        {activeTab === 'trading' && tradingEnabled && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>📈 Trading Journal</h2>
            
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Log Trade</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <input
                  type="text"
                  placeholder="Instrument (e.g. EUR/USD)"
                  value={newTrade.instrument}
                  onChange={(e) => setNewTrade({...newTrade, instrument: e.target.value})}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <select
                  value={newTrade.direction}
                  onChange={(e) => setNewTrade({...newTrade, direction: e.target.value})}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                >
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="P&L"
                  value={newTrade.actualPL}
                  onChange={(e) => setNewTrade({...newTrade, actualPL: e.target.value, manualPL: true})}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <button
                  onClick={addTrade}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(to right, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Add Trade
                </button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div style={{ padding: '20px', background: '#f0f9ff', borderRadius: '12px' }}>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Total P&L</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: monthStats.totalPL >= 0 ? '#10b981' : '#ef4444' }}>
                  ${monthStats.totalPL.toFixed(2)}
                </div>
              </div>
              <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '12px' }}>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Win Rate</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
                  {monthStats.winRate.toFixed(1)}%
                </div>
              </div>
              <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '12px' }}>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Total Trades</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {monthStats.totalTrades}
                </div>
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Recent Trades</h3>
              {trades.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '32px' }}>
                  No trades yet. Log your first trade above!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {trades.slice(0, 10).map(t => (
                    <div
                      key={t.id}
                      style={{
                        padding: '16px',
                        background: t.profitLoss >= 0 ? '#f0fdf4' : '#fef2f2',
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: '600' }}>
                          {t.instrument} • {t.direction.toUpperCase()}
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>{t.date}</div>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: t.profitLoss >= 0 ? '#10b981' : '#ef4444' }}>
                        {t.profitLoss >= 0 ? '+' : ''}${t.profitLoss.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Budgets Tab */}
        {activeTab === 'budgets' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>💵 Budgets</h2>
            <p style={{ color: '#64748b', marginBottom: '32px' }}>
              Set monthly spending limits for each category to track your spending.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {Object.entries(budgets).map(([category, amount]) => (
                <div
                  key={category}
                  style={{
                    padding: '20px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0'
                  }}
                >
                  <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{category}</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4f46e5' }}>
                    ${amount.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>per month</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
