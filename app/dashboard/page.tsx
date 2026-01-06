
'use client'

import { useUser } from '@clerk/nextjs'
import { useState } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  // Navigation
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // Data
  const [transactions, setTransactions] = useState<any[]>([])
  const [budgets] = useState({
    "Housing": 2000,
    "Transportation": 500,
    "Food": 600,
    "Entertainment": 300
  })
  
  // New transaction
  const [newTransaction, setNewTransaction] = useState({
    name: "", amount: "", type: "expense"
  })
  
  // Calculations
  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const netWorth = totalIncome - totalExpenses
  
  const addTransaction = () => {
    if (!newTransaction.name || !newTransaction.amount) return
    setTransactions([...transactions, {
      ...newTransaction,
      id: Date.now(),
      amount: parseFloat(newTransaction.amount)
    }])
    setNewTransaction({ name: "", amount: "", type: "expense" })
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
            Welcome, {user?.firstName || 'User'}!
          </p>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: "dashboard", label: "📊 Dashboard" },
              { id: "transactions", label: "💰 Transactions" },
              { id: "budgets", label: "💵 Budgets" }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
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

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
              Net Worth: <span style={{ color: netWorth >= 0 ? '#10b981' : '#ef4444' }}>
                ${netWorth.toFixed(2)}
              </span>
            </h2>
            <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '32px', textAlign: 'center' }}>
              Income: ${totalIncome.toFixed(2)} • Expenses: ${totalExpenses.toFixed(2)}
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '24px', background: '#f0fdf4', borderRadius: '12px', border: '2px solid #10b981' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>💰 Total Income</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                  ${totalIncome.toFixed(2)}
                </p>
              </div>
              
              <div style={{ padding: '24px', background: '#fef2f2', borderRadius: '12px', border: '2px solid #ef4444' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>💸 Total Expenses</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>
                  ${totalExpenses.toFixed(2)}
                </p>
              </div>
              
              <div style={{ padding: '24px', background: '#f0f9ff', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>📊 Transactions</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
                  {transactions.length}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>💰 Transactions</h2>
            
            {/* Add Form */}
            <div style={{ marginBottom: '32px', padding: '24px', background: '#f8fafc', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Add Transaction</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <input
                  type="text"
                  placeholder="Name"
                  value={newTransaction.name}
                  onChange={(e) => setNewTransaction({...newTransaction, name: e.target.value})}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px' }}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px' }}
                />
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px' }}
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
                    fontWeight: '600',
                    fontSize: '16px'
                  }}
                >
                  Add
                </button>
              </div>
            </div>
            
            {/* List */}
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
                      <div style={{ fontSize: '18px', fontWeight: '600' }}>{t.name}</div>
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
        
        {/* Budgets Tab */}
        {activeTab === 'budgets' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>💵 Budgets</h2>
            
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
