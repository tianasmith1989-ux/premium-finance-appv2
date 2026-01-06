'use client'

import { useUser } from '@clerk/nextjs'
import { useState } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  
  const [activeTab, setActiveTab] = useState("goals")
  
  // Goals
  const [goals, setGoals] = useState([])
  const [newGoal, setNewGoal] = useState({
    name: '', target: '', saved: '', deadline: ''
  })
  
  // Transactions
  const [transactions, setTransactions] = useState<any[]>([])
  const [newTransaction, setNewTransaction] = useState({
    name: '', amount: '', type: 'expense', date: new Date().toISOString().split('T')[0], recurring: false
  })
  
  // Calculations
  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
  const monthlySurplus = totalIncome - totalExpenses
  const totalGoalsTarget = goals.reduce((sum, g) => sum + parseFloat(g.target || 0), 0)
  const totalGoalsSaved = goals.reduce((sum, g) => sum + parseFloat(g.saved || 0), 0)
  const totalGoalsRemaining = totalGoalsTarget - totalGoalsSaved
  
  const addGoal = () => {
    if (!newGoal.name || !newGoal.target) return
    setGoals([...goals, { ...newGoal, id: Date.now() }])
    setNewGoal({ name: '', target: '', saved: '', deadline: '' })
  }
  
  const addTransaction = () => {
    if (!newTransaction.name || !newTransaction.amount) return
    setTransactions([...transactions, { ...newTransaction, id: Date.now() }])
    setNewTransaction({ name: '', amount: '', type: 'expense', date: new Date().toISOString().split('T')[0], recurring: false })
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eef2ff, #fce7f3)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(to right, #4f46e5, #7c3aed)', color: 'white', padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            ✨ Premium Finance Pro
          </h1>
          <p style={{ opacity: '0.9', margin: '0 0 24px 0' }}>
            Welcome, {user?.firstName || 'User'}! Let's achieve your financial goals.
          </p>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: "goals", label: "🎯 My Goals" },
              { id: "position", label: "📊 Current Position" },
              { id: "path", label: "🗺️ Path to Goals" },
              { id: "transactions", label: "💰 Transactions" }
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

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        
        {/* GOALS TAB */}
        {activeTab === 'goals' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>🎯 Your Financial Goals</h2>
            <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '18px' }}>
              Set your goals and watch your progress! The path to financial freedom starts here.
            </p>
            
            {/* Add Goal Form */}
            <div style={{ marginBottom: '32px', padding: '24px', background: '#f0f9ff', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>➕ Add New Goal</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <input
                  type="text"
                  placeholder="Goal name (e.g., Emergency Fund)"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px' }}
                />
                <input
                  type="number"
                  placeholder="Target amount"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px' }}
                />
                <input
                  type="number"
                  placeholder="Currently saved"
                  value={newGoal.saved}
                  onChange={(e) => setNewGoal({...newGoal, saved: e.target.value})}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px' }}
                />
                <input
                  type="date"
                  placeholder="Deadline"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px' }}
                />
                <button
                  onClick={addGoal}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(to right, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '16px'
                  }}
                >
                  Add Goal
                </button>
              </div>
            </div>
            
            {/* Goals List */}
            {goals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎯</div>
                <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>No goals yet!</h3>
                <p style={{ color: '#64748b' }}>Add your first financial goal above to get started.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {goals.map(goal => {
                  const target = parseFloat(goal.target || 0)
                  const saved = parseFloat(goal.saved || 0)
                  const remaining = target - saved
                  const progress = target > 0 ? (saved / target) * 100 : 0
                  const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
                  
                  return (
                    <div key={goal.id} style={{
                      padding: '24px',
                      background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)',
                      borderRadius: '12px',
                      border: '2px solid #3b82f6'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{goal.name}</h3>
                          <p style={{ color: '#64748b', fontSize: '16px' }}>
                            ${saved.toLocaleString()} of ${target.toLocaleString()} saved
                            {daysLeft !== null && (
                              <span style={{ marginLeft: '12px', color: daysLeft < 30 ? '#ef4444' : '#10b981' }}>
                                • {daysLeft} days left
                              </span>
                            )}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
                            {progress.toFixed(0)}%
                          </div>
                          <div style={{ fontSize: '14px', color: '#64748b' }}>
                            ${remaining.toLocaleString()} to go
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div style={{
                        width: '100%',
                        height: '24px',
                        background: '#e2e8f0',
                        borderRadius: '12px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${Math.min(progress, 100)}%`,
                          height: '100%',
                          background: progress >= 100 ? 'linear-gradient(to right, #10b981, #059669)' : 'linear-gradient(to right, #3b82f6, #2563eb)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
        
        {/* CURRENT POSITION TAB */}
        {activeTab === 'position' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '32px' }}>📊 Your Current Financial Position</h2>
            
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '40px' }}>
              <div style={{ padding: '24px', background: '#f0fdf4', borderRadius: '12px', border: '2px solid #10b981' }}>
                <h3 style={{ fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>💰 Monthly Income</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                  ${totalIncome.toFixed(2)}
                </p>
              </div>
              
              <div style={{ padding: '24px', background: '#fef2f2', borderRadius: '12px', border: '2px solid #ef4444' }}>
                <h3 style={{ fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>💸 Monthly Expenses</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>
                  ${totalExpenses.toFixed(2)}
                </p>
              </div>
              
              <div style={{ padding: '24px', background: '#f0f9ff', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                <h3 style={{ fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>📈 Monthly Surplus</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: monthlySurplus >= 0 ? '#10b981' : '#ef4444' }}>
                  ${monthlySurplus.toFixed(2)}
                </p>
              </div>
            </div>
            
            {/* Calendar */}
            <div>
              <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>📅 This Month's Cash Flow</h3>
              <p style={{ color: '#64748b', marginBottom: '24px' }}>
                Track your incoming and outgoing payments throughout the month
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '8px',
                marginBottom: '8px'
              }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} style={{
                    padding: '8px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#64748b',
                    fontSize: '14px'
                  }}>
                    {day}
                  </div>
                ))}
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '8px'
              }}>
                {(() => {
                  const { firstDay, daysInMonth } = getDaysInMonth()
                  const cells = []
                  
                  for (let i = 0; i < firstDay; i++) {
                    cells.push(<div key={`empty-${i}`} />)
                  }
                  
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dayTransactions = getTransactionsForDay(day)
                    const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0)
                    const dayExpenses = dayTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0)
                    const isToday = day === new Date().getDate()
                    
                    cells.push(
                      <div key={day} style={{
                        padding: '12px 8px',
                        border: isToday ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        background: isToday ? '#f0f9ff' : dayTransactions.length > 0 ? '#f8fafc' : 'white',
                        minHeight: '80px'
                      }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '16px' }}>
                          {day}
                        </div>
                        {dayIncome > 0 && (
                          <div style={{ fontSize: '12px', color: '#10b981', marginBottom: '2px' }}>
                            +${dayIncome.toFixed(0)}
                          </div>
                        )}
                        {dayExpenses > 0 && (
                          <div style={{ fontSize: '12px', color: '#ef4444' }}>
                            -${dayExpenses.toFixed(0)}
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
        
        {/* PATH TO GOALS TAB */}
        {activeTab === 'path' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>🗺️ Your Path to Financial Goals</h2>
            <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '18px' }}>
              Based on your current position, here's how to reach your goals
            </p>
            
            {goals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🗺️</div>
                <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Set goals first!</h3>
                <p style={{ color: '#64748b' }}>Go to the "My Goals" tab to add your financial goals.</p>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div style={{ marginBottom: '40px', padding: '32px', background: 'linear-gradient(to right, #fef3c7, #fde68a)', borderRadius: '12px', border: '2px solid #f59e0b' }}>
                  <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>📊 Analysis</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '4px' }}>Total Goals</div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold' }}>${totalGoalsTarget.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '4px' }}>Already Saved</div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>${totalGoalsSaved.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '4px' }}>Still Need</div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>${totalGoalsRemaining.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '4px' }}>Monthly Surplus</div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: monthlySurplus > 0 ? '#10b981' : '#ef4444' }}>
                        ${monthlySurplus.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Plan */}
                <div style={{ padding: '32px', background: '#f0fdf4', borderRadius: '12px', border: '2px solid #10b981' }}>
                  <h3 style={{ fontSize: '24px', marginBottom: '24px' }}>✅ Your Action Plan</h3>
                  
                  {monthlySurplus <= 0 ? (
                    <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '2px solid #ef4444' }}>
                      <h4 style={{ fontSize: '20px', color: '#ef4444', marginBottom: '12px' }}>⚠️ Action Required</h4>
                      <p style={{ marginBottom: '16px' }}>You're currently spending more than you earn. To reach your goals:</p>
                      <ol style={{ marginLeft: '20px', lineHeight: '2' }}>
                        <li>Reduce expenses by at least ${Math.abs(monthlySurplus).toFixed(2)}/month</li>
                        <li>Find ways to increase income</li>
                        <li>Review the Transactions tab to identify areas to cut</li>
                      </ol>
                    </div>
                  ) : totalGoalsRemaining > 0 ? (
                    <>
                      <div style={{ marginBottom: '24px' }}>
                        <p style={{ fontSize: '18px', marginBottom: '12px' }}>
                          With your current monthly surplus of <strong>${monthlySurplus.toFixed(2)}</strong>, 
                          it will take approximately <strong>{Math.ceil(totalGoalsRemaining / monthlySurplus)} months</strong> to reach all your goals.
                        </p>
                      </div>
                      
                      <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
                        <h4 style={{ fontSize: '20px', marginBottom: '16px' }}>💡 Recommendations:</h4>
                        <ol style={{ marginLeft: '20px', lineHeight: '2' }}>
                          <li>Save ${monthlySurplus.toFixed(2)} per month automatically</li>
                          <li>Set up automatic transfers on payday</li>
                          <li>Review progress monthly</li>
                          <li>Adjust goals if needed based on life changes</li>
                          {goals.some(g => {
                            const deadline = g.deadline ? new Date(g.deadline) : null
                            const remaining = parseFloat(g.target) - parseFloat(g.saved || 0)
                            const monthsLeft = deadline ? Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)) : 999
                            const neededPerMonth = monthsLeft > 0 ? remaining / monthsLeft : 0
                            return neededPerMonth > monthlySurplus
                          }) && (
                            <li style={{ color: '#ef4444', fontWeight: 'bold' }}>
                              ⚠️ Some goals may need deadline adjustments or increased savings rate
                            </li>
                          )}
                        </ol>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '2px solid #10b981' }}>
                      <h4 style={{ fontSize: '20px', color: '#10b981', marginBottom: '12px' }}>🎉 Congratulations!</h4>
                      <p>You've already achieved your goals! Time to set new ones or enjoy your success.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        
        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>💰 Transactions</h2>
            
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
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px' }}
                />
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
            
            {transactions.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '32px' }}>
                No transactions yet. Add your first one above!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                  <div
                    key={t.id}
                    style={{
                      padding: '16px',
                      background: t.type === 'income' ? '#f0fdf4' : '#fef2f2',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: '600' }}>{t.name}</div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>{new Date(t.date).toLocaleDateString()}</div>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: t.type === 'income' ? '#10b981' : '#ef4444' }}>
                      {t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
