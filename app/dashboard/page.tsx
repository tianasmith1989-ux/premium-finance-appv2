'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

// ... (all your existing interfaces remain the same)

// Add interface for trading calculator
interface TradingCalculator {
  startingCapital: string;
  monthlyContribution: string;
  annualReturn: string;
  years: string;
  riskPerTrade: string;
  winRate: string;
  riskReward: string;
}

export default function Dashboard() {
  // ... (all your existing state and hooks remain the same)
  
  // Add trading calculator state
  const [tradingCalculator, setTradingCalculator] = useState<TradingCalculator>({
    startingCapital: '10000',
    monthlyContribution: '500',
    annualReturn: '20',
    years: '10',
    riskPerTrade: '2',
    winRate: '55',
    riskReward: '1.5'
  })
  
  const [tradingResults, setTradingResults] = useState<{
    futureValue: number;
    totalContributed: number;
    profit: number;
    yearlyProgress: Array<{year: number, value: number, contributed: number, profit: number}>;
    tradeStats: {
      tradesPerYear: number;
      expectedWinRate: number;
      avgWin: number;
      avgLoss: number;
      expectancy: number;
    };
  } | null>(null)
  
  const [calculatingTrading, setCalculatingTrading] = useState(false)

  // ... (all your existing code remains the same until the calculateGoal function)

  // Add this new function for trading compounding calculator
  const calculateTradingCompounding = () => {
    setCalculatingTrading(true)
    
    // Parse inputs
    const start = parseFloat(tradingCalculator.startingCapital || '0')
    const monthly = parseFloat(tradingCalculator.monthlyContribution || '0')
    const annualReturn = parseFloat(tradingCalculator.annualReturn || '0') / 100
    const years = parseFloat(tradingCalculator.years || '0')
    const riskPerTrade = parseFloat(tradingCalculator.riskPerTrade || '0') / 100
    const winRate = parseFloat(tradingCalculator.winRate || '0') / 100
    const riskReward = parseFloat(tradingCalculator.riskReward || '0')
    
    if (start <= 0 || years <= 0) {
      setTradingResults(null)
      setCalculatingTrading(false)
      alert('Please enter starting capital and number of years')
      return
    }
    
    // Calculate compound growth with monthly contributions
    let futureValue = start
    let totalContributed = start
    const monthlyRate = Math.pow(1 + annualReturn, 1/12) - 1
    
    const yearlyProgress = []
    
    for (let year = 1; year <= years; year++) {
      let yearStart = futureValue
      for (let month = 1; month <= 12; month++) {
        // Add monthly contribution
        futureValue += monthly
        totalContributed += monthly
        
        // Apply monthly return
        futureValue *= (1 + monthlyRate)
      }
      
      yearlyProgress.push({
        year,
        value: futureValue,
        contributed: totalContributed,
        profit: futureValue - totalContributed
      })
    }
    
    // Calculate trading statistics
    const tradesPerMonth = 20 // Assume 20 trading days per month, 1 trade per day
    const tradesPerYear = tradesPerMonth * 12
    
    // Calculate expectancy
    const avgWin = riskPerTrade * riskReward
    const avgLoss = riskPerTrade
    const expectancy = (winRate * avgWin) - ((1 - winRate) * avgLoss)
    
    setTradingResults({
      futureValue,
      totalContributed,
      profit: futureValue - totalContributed,
      yearlyProgress,
      tradeStats: {
        tradesPerYear,
        expectedWinRate: winRate * 100,
        avgWin: avgWin * 100,
        avgLoss: avgLoss * 100,
        expectancy: expectancy * 100
      }
    })
    
    setCalculatingTrading(false)
  }

  // Initialize trading calculator on component mount
  useEffect(() => {
    if (isClient) {
      calculateTradingCompounding()
    }
  }, [isClient])

  // ... (rest of your existing functions remain the same)

  // In your JSX, add the trading calculator to the Trading tab
  // Replace the existing Trading tab content with:

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      {/* ... (all your existing JSX remains the same until the Trading tab) */}
      
      {activeTab === 'trading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* TRADING COMPOUNDING CALCULATOR SECTION */}
          <div style={cardStyle}>
            <h2 style={{ margin: '0 0 20px 0', color: theme.warning, fontSize: '22px' }}>📈 Trading Compounding Calculator</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>💰 Capital & Time</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Starting Capital ($)</label>
                    <input 
                      type="number" 
                      value={tradingCalculator.startingCapital}
                      onChange={(e) => setTradingCalculator({...tradingCalculator, startingCapital: e.target.value})}
                      style={{ ...inputStyle, width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Monthly Contribution ($)</label>
                    <input 
                      type="number" 
                      value={tradingCalculator.monthlyContribution}
                      onChange={(e) => setTradingCalculator({...tradingCalculator, monthlyContribution: e.target.value})}
                      style={{ ...inputStyle, width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Target Annual Return (%)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={tradingCalculator.annualReturn}
                      onChange={(e) => setTradingCalculator({...tradingCalculator, annualReturn: e.target.value})}
                      style={{ ...inputStyle, width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Timeframe (Years)</label>
                    <input 
                      type="number" 
                      value={tradingCalculator.years}
                      onChange={(e) => setTradingCalculator({...tradingCalculator, years: e.target.value})}
                      style={{ ...inputStyle, width: '100%' }}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '18px' }}>⚡ Trading Parameters</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Risk Per Trade (%)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={tradingCalculator.riskPerTrade}
                      onChange={(e) => setTradingCalculator({...tradingCalculator, riskPerTrade: e.target.value})}
                      style={{ ...inputStyle, width: '100%' }}
                    />
                    <div style={{ fontSize: '10px', color: theme.textMuted, marginTop: '4px' }}>Recommended: 1-2% per trade</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Win Rate (%)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={tradingCalculator.winRate}
                      onChange={(e) => setTradingCalculator({...tradingCalculator, winRate: e.target.value})}
                      style={{ ...inputStyle, width: '100%' }}
                    />
                    <div style={{ fontSize: '10px', color: theme.textMuted, marginTop: '4px' }}>Your actual win rate from trades: {winRate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: theme.textMuted, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Risk:Reward Ratio</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={tradingCalculator.riskReward}
                      onChange={(e) => setTradingCalculator({...tradingCalculator, riskReward: e.target.value})}
                      style={{ ...inputStyle, width: '100%' }}
                    />
                    <div style={{ fontSize: '10px', color: theme.textMuted, marginTop: '4px' }}>e.g., 1.5 means risking 1% to make 1.5%</div>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={calculateTradingCompounding} 
              disabled={calculatingTrading}
              style={{ ...btnWarning, padding: '12px 24px', fontSize: '16px', width: '100%', marginBottom: '20px' }}
            >
              {calculatingTrading ? 'Calculating...' : 'Calculate Compounding Growth'}
            </button>
            
            {tradingResults && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ padding: '20px', background: darkMode ? '#1e3a32' : '#f0fdf4', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Future Value</div>
                    <div style={{ color: theme.success, fontSize: '24px', fontWeight: 'bold' }}>${tradingResults.futureValue.toFixed(2)}</div>
                    <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>After {tradingCalculator.years} years</div>
                  </div>
                  <div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Total Contributed</div>
                    <div style={{ color: theme.text, fontSize: '20px', fontWeight: 'bold' }}>${tradingResults.totalContributed.toFixed(2)}</div>
                    <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>Capital + Contributions</div>
                  </div>
                  <div style={{ padding: '20px', background: darkMode ? '#3a2e1e' : '#fffbeb', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Total Profit</div>
                    <div style={{ color: theme.warning, fontSize: '24px', fontWeight: 'bold' }}>${tradingResults.profit.toFixed(2)}</div>
                    <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>
                      {((tradingResults.profit / tradingResults.totalContributed) * 100).toFixed(1)}% ROI
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '16px' }}>📊 Yearly Progress</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid ' + theme.border }}>
                          <th style={{ textAlign: 'left', padding: '8px', color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>Year</th>
                          <th style={{ textAlign: 'left', padding: '8px', color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>Portfolio Value</th>
                          <th style={{ textAlign: 'left', padding: '8px', color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>Total Contributed</th>
                          <th style={{ textAlign: 'left', padding: '8px', color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>Profit</th>
                          <th style={{ textAlign: 'left', padding: '8px', color: theme.textMuted, fontSize: '11px', fontWeight: 600 }}>Yearly Return</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tradingResults.yearlyProgress.map((yearData, index) => {
                          const prevValue = index === 0 ? 
                            parseFloat(tradingCalculator.startingCapital || '0') + parseFloat(tradingCalculator.monthlyContribution || '0') * 12 : 
                            tradingResults.yearlyProgress[index - 1].value
                          const yearlyReturn = ((yearData.value - (prevValue + parseFloat(tradingCalculator.monthlyContribution || '0') * 12)) / prevValue) * 100
                          
                          return (
                            <tr key={yearData.year} style={{ borderBottom: '1px solid ' + theme.border }}>
                              <td style={{ padding: '8px', color: theme.text, fontSize: '12px', fontWeight: 600 }}>Year {yearData.year}</td>
                              <td style={{ padding: '8px', color: theme.success, fontSize: '12px', fontWeight: 600 }}>${yearData.value.toFixed(2)}</td>
                              <td style={{ padding: '8px', color: theme.text, fontSize: '12px' }}>${yearData.contributed.toFixed(2)}</td>
                              <td style={{ padding: '8px', color: theme.warning, fontSize: '12px', fontWeight: 600 }}>${yearData.profit.toFixed(2)}</td>
                              <td style={{ padding: '8px', color: yearlyReturn >= 0 ? theme.success : theme.danger, fontSize: '12px', fontWeight: 600 }}>
                                {yearlyReturn.toFixed(1)}%
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div style={{ padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px' }}>
                  <h3 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '16px' }}>🎯 Trading Statistics</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <div>
                      <div style={{ color: theme.textMuted, fontSize: '11px' }}>Expected Win Rate</div>
                      <div style={{ color: tradingResults.tradeStats.expectedWinRate >= 50 ? theme.success : theme.danger, fontSize: '16px', fontWeight: 'bold' }}>
                        {tradingResults.tradeStats.expectedWinRate.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ color: theme.textMuted, fontSize: '11px' }}>Average Win</div>
                      <div style={{ color: theme.success, fontSize: '16px', fontWeight: 'bold' }}>
                        {tradingResults.tradeStats.avgWin.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ color: theme.textMuted, fontSize: '11px' }}>Average Loss</div>
                      <div style={{ color: theme.danger, fontSize: '16px', fontWeight: 'bold' }}>
                        {tradingResults.tradeStats.avgLoss.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ color: theme.textMuted, fontSize: '11px' }}>Trade Expectancy</div>
                      <div style={{ color: tradingResults.tradeStats.expectancy >= 0 ? theme.success : theme.danger, fontSize: '16px', fontWeight: 'bold' }}>
                        {tradingResults.tradeStats.expectancy.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', padding: '8px', background: darkMode ? '#334155' : '#fff', borderRadius: '8px', fontSize: '11px', color: theme.textMuted }}>
                    Based on {tradingResults.tradeStats.tradesPerYear} trades/year • Risk: {tradingCalculator.riskPerTrade}% • R:R {tradingCalculator.riskReward}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* EXISTING TRADING STATS */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.warning, fontSize: '20px' }}>📊 Trading Stats</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Total P&L</div>
                  <div style={{ color: totalPL >= 0 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 'bold' }}>${totalPL.toFixed(2)}</div>
                </div>
                <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Win Rate</div>
                  <div style={{ color: winRate >= 50 ? theme.success : theme.danger, fontSize: '24px', fontWeight: 'bold' }}>{winRate.toFixed(1)}%</div>
                </div>
                <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Total Trades</div>
                  <div style={{ color: theme.text, fontSize: '24px', fontWeight: 'bold' }}>{trades.length}</div>
                </div>
                <div style={{ padding: '20px', background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Avg Win</div>
                  <div style={{ color: theme.success, fontSize: '24px', fontWeight: 'bold' }}>
                    ${trades.filter(t => parseFloat(t.profitLoss || '0') > 0).length > 0 ? 
                      (trades.filter(t => parseFloat(t.profitLoss || '0') > 0).reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0) / trades.filter(t => parseFloat(t.profitLoss || '0') > 0).length).toFixed(2) : 
                      '0.00'
                    }
                  </div>
                </div>
              </div>
            </div>
            
            {/* EXISTING ADD TRADE FORM */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>📝 Add Trade</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input type="date" placeholder="Date" value={newTrade.date} onChange={(e) => setNewTrade({ ...newTrade, date: e.target.value })} style={inputStyle} />
                  <input type="text" placeholder="Instrument" value={newTrade.instrument} onChange={(e) => setNewTrade({ ...newTrade, instrument: e.target.value })} style={inputStyle} />
                  <select value={newTrade.direction} onChange={(e) => setNewTrade({ ...newTrade, direction: e.target.value })} style={inputStyle}>
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                  <input type="number" placeholder="Entry Price" value={newTrade.entryPrice} onChange={(e) => setNewTrade({ ...newTrade, entryPrice: e.target.value })} style={inputStyle} />
                  <input type="number" placeholder="Exit Price" value={newTrade.exitPrice} onChange={(e) => setNewTrade({ ...newTrade, exitPrice: e.target.value })} style={inputStyle} />
                  <input type="number" placeholder="P&L" value={newTrade.profitLoss} onChange={(e) => setNewTrade({ ...newTrade, profitLoss: e.target.value })} style={inputStyle} />
                </div>
                <input type="text" placeholder="Notes" value={newTrade.notes} onChange={(e) => setNewTrade({ ...newTrade, notes: e.target.value })} style={inputStyle} />
                <button onClick={addTrade} style={btnWarning}>Add Trade</button>
              </div>
            </div>
          </div>
          
          {/* EXISTING TRADE HISTORY */}
          <div style={cardStyle}>
            <h2 style={{ margin: '0 0 20px 0', color: theme.text, fontSize: '20px' }}>📋 Trade History</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid ' + theme.border }}>
                    <th style={{ textAlign: 'left', padding: '12px', color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>Instrument</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>Direction</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>Entry</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>Exit</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>P&L</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: theme.textMuted, fontSize: '12px', fontWeight: 600 }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: theme.textMuted }}>No trades recorded yet</td></tr>
                  ) : (
                    trades.map(trade => (
                      <tr key={trade.id} style={{ borderBottom: '1px solid ' + theme.border }}>
                        <td style={{ padding: '12px', color: theme.text, fontSize: '13px' }}>{trade.date}</td>
                        <td style={{ padding: '12px', color: theme.text, fontSize: '13px', fontWeight: 600 }}>{trade.instrument}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            fontSize: '11px', 
                            fontWeight: 600, 
                            background: trade.direction === 'long' ? theme.success + '20' : theme.danger + '20', 
                            color: trade.direction === 'long' ? theme.success : theme.danger 
                          }}>
                            {trade.direction === 'long' ? 'LONG' : 'SHORT'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: theme.text, fontSize: '13px' }}>${trade.entryPrice}</td>
                        <td style={{ padding: '12px', color: theme.text, fontSize: '13px' }}>${trade.exitPrice}</td>
                        <td style={{ 
                          padding: '12px', 
                          fontSize: '13px', 
                          fontWeight: 600, 
                          color: parseFloat(trade.profitLoss || '0') >= 0 ? theme.success : theme.danger 
                        }}>
                          ${parseFloat(trade.profitLoss || '0').toFixed(2)}
                        </td>
                        <td style={{ padding: '12px', color: theme.textMuted, fontSize: '13px' }}>{trade.notes}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* ... (rest of your tabs remain the same) */}
    </div>
  )
}
