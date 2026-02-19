import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { 
      mode,           // 'onboarding' | 'proactive' | 'question'
      question,
      onboardingStep,
      userResponse,
      tradingData,
      memory
    } = await request.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    let systemPrompt = ''
    let userPrompt = ''

    const TRADING_FRAMEWORKS = `
=== TRADING FRAMEWORKS ===

**PROP FIRM CHALLENGES:**
- Phase 1: Usually 8-10% profit target, 5% daily DD, 10% max DD
- Phase 2: Usually 5% profit target, same drawdown rules  
- Funded: Profit splits 70-90%, consistency rules apply

**KEY METRICS:**
- Win Rate: Wins / Total Trades
- Risk/Reward: Average Win / Average Loss
- Profit Factor: Gross Profit / Gross Loss
- Max Drawdown: Largest peak-to-trough decline
- Expectancy: (Win% × Avg Win) - (Loss% × Avg Loss)

**RISK MANAGEMENT:**
- Never risk more than 1-2% per trade
- Position sizing based on stop loss distance
- Daily loss limits (usually 2-3% of account)

**TRADING PSYCHOLOGY:**
- Revenge trading: Taking impulsive trades after losses
- FOMO: Entering without proper setup
- Overtrading: Too many trades, usually after wins
`

    const buildTradingContext = () => {
      if (!tradingData?.trades || tradingData.trades.length === 0) {
        return 'No trades logged yet.'
      }
      
      const trades = tradingData.trades
      const totalPL = trades.reduce((sum: number, t: any) => sum + parseFloat(t.profitLoss || '0'), 0)
      const winners = trades.filter((t: any) => parseFloat(t.profitLoss || '0') > 0)
      const losers = trades.filter((t: any) => parseFloat(t.profitLoss || '0') < 0)
      const winRate = trades.length > 0 ? (winners.length / trades.length * 100) : 0
      const avgWin = winners.length > 0 ? winners.reduce((s: number, t: any) => s + parseFloat(t.profitLoss || '0'), 0) / winners.length : 0
      const avgLoss = losers.length > 0 ? Math.abs(losers.reduce((s: number, t: any) => s + parseFloat(t.profitLoss || '0'), 0) / losers.length) : 0
      
      let context = '=== TRADING PERFORMANCE ===\n'
      context += `Total P&L: $${totalPL.toFixed(2)}\n`
      context += `Total Trades: ${trades.length}\n`
      context += `Win Rate: ${winRate.toFixed(1)}%\n`
      context += `Avg Win: $${avgWin.toFixed(2)}\n`
      context += `Avg Loss: $${avgLoss.toFixed(2)}\n`
      context += `R:R Ratio: ${avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : 'N/A'}\n`
      
      // Recent trades
      context += '\nRecent Trades:\n'
      trades.slice(-5).reverse().forEach((t: any) => {
        const pl = parseFloat(t.profitLoss || '0')
        context += `  ${t.date}: ${t.instrument} ${t.direction} → ${pl >= 0 ? '+' : ''}$${pl.toFixed(2)}\n`
      })
      
      return context
    }

    const buildMemoryContext = () => {
      if (!memory) return ''
      let context = '\n=== TRADER PROFILE ===\n'
      if (memory.name) context += `Name: ${memory.name}\n`
      if (memory.tradingRules?.length > 0) {
        context += 'Trading Rules:\n'
        memory.tradingRules.forEach((r: string) => context += `  - ${r}\n`)
      }
      if (memory.preferences?.tradingStyle) context += `Style: ${memory.preferences.tradingStyle}\n`
      if (memory.preferences?.favoriteInstruments?.length > 0) {
        context += `Favorite pairs: ${memory.preferences.favoriteInstruments.join(', ')}\n`
      }
      return context
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' })

    if (mode === 'onboarding') {
      systemPrompt = `You are Aureus Trading, a sharp trading mentor helping set up a new trader's profile.

${TRADING_FRAMEWORKS}

Keep responses SHORT - 2-3 sentences, then ONE question.

Current step: ${onboardingStep}

Steps:
1. greeting - Get name, trading experience
2. style - What do they trade? (forex, futures, stocks) Scalper, day trader, swing?
3. prop_firms - Trading prop? Which firms?
4. rules - What are their personal trading rules?
5. psychology - Biggest struggle? (overtrading, revenge trading, etc.)
6. goals - Trading income goal? Prop firm target?
7. complete - Summarize and motivate

Extract data when mentioned:
- "I trade EUR/USD and GBP/USD" → setMemory with favoriteInstruments
- "My rule is max 2 trades per day" → setMemory with tradingRules
- "I'm a scalper" → setMemory with tradingStyle

Respond with JSON:
{
  "message": "Your response",
  "nextStep": "current or next step",
  "actions": [
    {"type": "setMemory", "data": {"name": "...", "tradingRules": [...], "preferences": {...}}}
  ],
  "isComplete": false
}`

      userPrompt = `User: "${userResponse || 'Just started'}"\nCollected: ${JSON.stringify(memory || {})}`

    } else if (mode === 'proactive') {
      systemPrompt = `You are Aureus Trading, a proactive mentor. Today is ${today} (${dayOfWeek}).

${TRADING_FRAMEWORKS}

${buildTradingContext()}
${buildMemoryContext()}

Give ONE specific insight based on their data. Consider:
- Recent performance trends
- Day of week patterns
- Win/loss streaks
- Rule adherence

Keep to 2-3 sentences. Be direct.

Respond with JSON:
{
  "greeting": "Hey [name]!",
  "insight": "Your insight with specific numbers",
  "reminder": "A rule reminder if relevant",
  "mood": "confident" | "cautious" | "warning"
}`

      userPrompt = 'Generate proactive insight.'

    } else {
      systemPrompt = `You are Aureus Trading, a helpful trading mentor. Today is ${today}.

${TRADING_FRAMEWORKS}

${buildTradingContext()}
${buildMemoryContext()}

Help with questions or log trades they mention.

If they mention a trade:
- "Made $150 on EUR/USD long today" → addTrade action

Respond with JSON:
{
  "message": "Your response",
  "actions": [
    {"type": "addTrade", "data": {"instrument": "...", "direction": "long/short", "profitLoss": "...", "date": "YYYY-MM-DD", "notes": "..."}}
  ]
}

Keep responses concise. Use their actual numbers.`

      userPrompt = question || 'Hello!'
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: userPrompt }],
        system: systemPrompt
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('API error:', data)
      return NextResponse.json({ error: data.error?.message || 'Failed' }, { status: response.status })
    }

    const text = data.content?.[0]?.text || ''

    try {
      const parsed = JSON.parse(text)
      return NextResponse.json({ ...parsed, raw: text })
    } catch {
      return NextResponse.json({ message: text, raw: text })
    }

  } catch (error) {
    console.error('Trading coach error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
