import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { 
      mode,           // 'onboarding' | 'proactive' | 'question'
      question,       // user's question (for question mode)
      onboardingStep, // current step in onboarding
      userResponse,   // user's response during onboarding
      tradingData,    // all trading data (trades, prop challenges, journal)
      memory          // persistent memory (rules, patterns, preferences)
    } = await request.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    let systemPrompt = ''
    let userPrompt = ''

    // Build context from trading data
    const buildTradingContext = () => {
      if (!tradingData) return 'No trading data provided yet.'
      
      const { trades, propChallenges, journal } = tradingData
      
      let context = '=== CURRENT TRADING SNAPSHOT ===\n'
      
      if (trades?.length > 0) {
        const totalPL = trades.reduce((sum: number, t: any) => sum + parseFloat(t.profitLoss || '0'), 0)
        const winners = trades.filter((t: any) => parseFloat(t.profitLoss || '0') > 0)
        const winRate = (winners.length / trades.length * 100).toFixed(1)
        const avgWin = winners.length > 0 
          ? winners.reduce((sum: number, t: any) => sum + parseFloat(t.profitLoss || '0'), 0) / winners.length 
          : 0
        const losers = trades.filter((t: any) => parseFloat(t.profitLoss || '0') < 0)
        const avgLoss = losers.length > 0 
          ? Math.abs(losers.reduce((sum: number, t: any) => sum + parseFloat(t.profitLoss || '0'), 0) / losers.length)
          : 0
        
        context += `\nOVERALL PERFORMANCE:\n`
        context += `  Total P&L: $${totalPL.toFixed(2)}\n`
        context += `  Total Trades: ${trades.length}\n`
        context += `  Win Rate: ${winRate}%\n`
        context += `  Avg Win: $${avgWin.toFixed(2)}\n`
        context += `  Avg Loss: $${avgLoss.toFixed(2)}\n`
        context += `  Risk/Reward: ${avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : 'N/A'}\n`
        
        // Recent trades
        context += `\nRECENT TRADES (last 5):\n`
        trades.slice(-5).reverse().forEach((t: any) => {
          const pl = parseFloat(t.profitLoss || '0')
          context += `  - ${t.date}: ${t.instrument} ${t.direction} → ${pl >= 0 ? '+' : ''}$${pl.toFixed(2)}\n`
        })
        
        // Performance by instrument
        const byInstrument: any = {}
        trades.forEach((t: any) => {
          if (!byInstrument[t.instrument]) {
            byInstrument[t.instrument] = { trades: 0, pl: 0, wins: 0 }
          }
          byInstrument[t.instrument].trades++
          byInstrument[t.instrument].pl += parseFloat(t.profitLoss || '0')
          if (parseFloat(t.profitLoss || '0') > 0) byInstrument[t.instrument].wins++
        })
        
        context += `\nPERFORMANCE BY INSTRUMENT:\n`
        Object.entries(byInstrument).forEach(([inst, data]: [string, any]) => {
          context += `  - ${inst}: ${data.trades} trades, $${data.pl.toFixed(2)}, ${(data.wins/data.trades*100).toFixed(0)}% win rate\n`
        })
        
        // Performance by day of week
        const byDay: any = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [] }
        trades.forEach((t: any) => {
          const day = new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' })
          if (byDay[day]) byDay[day].push(parseFloat(t.profitLoss || '0'))
        })
        
        context += `\nPERFORMANCE BY DAY:\n`
        Object.entries(byDay).forEach(([day, pls]: [string, any]) => {
          if (pls.length > 0) {
            const total = pls.reduce((a: number, b: number) => a + b, 0)
            const winPct = (pls.filter((p: number) => p > 0).length / pls.length * 100).toFixed(0)
            context += `  - ${day}: ${pls.length} trades, $${total.toFixed(2)}, ${winPct}% wins\n`
          }
        })
      }
      
      if (propChallenges?.length > 0) {
        context += `\nACTIVE PROP CHALLENGES:\n`
        propChallenges.forEach((c: any) => {
          const progress = ((c.currentBalance - c.startingBalance) / c.profitTarget * 100).toFixed(1)
          const daysLeft = c.daysRemaining || 'Unknown'
          context += `  - ${c.firm} ${c.phase}: $${c.currentBalance}/$${c.startingBalance + c.profitTarget} (${progress}% to target)\n`
          context += `    Days left: ${daysLeft}, Max DD: ${c.maxDrawdown}%\n`
        })
      }
      
      return context
    }

    // Build memory context
    const buildMemoryContext = () => {
      if (!memory) return ''
      
      let context = '\n=== WHAT I KNOW ABOUT YOUR TRADING ===\n'
      
      if (memory.tradingRules?.length > 0) {
        context += '\nYOUR TRADING RULES:\n'
        memory.tradingRules.forEach((rule: string) => context += `  - ${rule}\n`)
      }
      
      if (memory.patterns?.length > 0) {
        context += '\nPATTERNS I\'VE NOTICED:\n'
        memory.patterns.forEach((p: string) => context += `  - ${p}\n`)
      }
      
      if (memory.psychology) {
        context += '\nPSYCHOLOGICAL NOTES:\n'
        if (memory.psychology.strengths) context += `  Strengths: ${memory.psychology.strengths.join(', ')}\n`
        if (memory.psychology.weaknesses) context += `  Work on: ${memory.psychology.weaknesses.join(', ')}\n`
        if (memory.psychology.triggers) context += `  Triggers: ${memory.psychology.triggers.join(', ')}\n`
      }
      
      if (memory.preferences) {
        context += '\nPREFERENCES:\n'
        if (memory.preferences.tradingStyle) context += `  Style: ${memory.preferences.tradingStyle}\n`
        if (memory.preferences.favoriteInstruments) context += `  Favorite pairs: ${memory.preferences.favoriteInstruments.join(', ')}\n`
        if (memory.preferences.tradingHours) context += `  Trading hours: ${memory.preferences.tradingHours}\n`
        if (memory.preferences.riskPerTrade) context += `  Risk per trade: ${memory.preferences.riskPerTrade}%\n`
      }
      
      if (memory.propFirmGoals) {
        context += '\nPROP FIRM GOALS:\n'
        context += `  Target firm: ${memory.propFirmGoals.targetFirm || 'Not set'}\n`
        context += `  Account size goal: $${memory.propFirmGoals.accountSizeGoal || 'Not set'}\n`
      }
      
      return context
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' })

    if (mode === 'onboarding') {
      systemPrompt = `You are Aureus Trading, a sharp, experienced trading mentor. You're onboarding a new trader and getting to know their style and goals.

Your personality:
- Confident but not arrogant
- You've seen it all - wins, losses, blown accounts
- You're direct and don't sugarcoat, but you're supportive
- You focus on risk management and psychology as much as entries
- Keep responses SHORT - 2-3 sentences, then ONE question

Current onboarding step: ${onboardingStep}

The onboarding flow:
1. greeting - Get their name, ask about their trading experience
2. style - What do they trade? (forex, futures, stocks) Timeframe? (scalp, day, swing)
3. prop_firms - Are they trading prop? Which firms? Account sizes?
4. rules - What are their personal trading rules?
5. psychology - What's their biggest struggle? (overtrading, revenge trading, fear, etc)
6. goals - What's their trading goal? (income, prop firm funded, etc)
7. schedule - When do they trade? Any days they avoid?
8. complete - Summarize and set expectations

Respond with JSON:
{
  "message": "Your conversational response",
  "nextStep": "the next onboarding step",
  "extractedData": { any data to save },
  "isComplete": false
}`

      userPrompt = `User's response: "${userResponse || 'Just started'}"\n\nCurrent data collected: ${JSON.stringify(memory || {})}`

    } else if (mode === 'proactive') {
      systemPrompt = `You are Aureus Trading, a proactive trading mentor. Today is ${today} (${dayOfWeek}).

${buildTradingContext()}
${buildMemoryContext()}

Your job is to give the trader the most relevant insight RIGHT NOW based on:
1. Their recent performance and patterns
2. The day of the week (and their historical performance on this day)
3. Any active prop challenges and their progress
4. Their psychological patterns and rules

Rules:
- Be specific with numbers from their data
- If they have a bad day historically, warn them
- If they're on a streak (good or bad), address it
- Reference their rules if relevant
- Keep it to 2-3 sentences MAX
- Be direct but supportive

Respond with JSON:
{
  "greeting": "Short greeting acknowledging the day",
  "insight": "Your main proactive insight based on their data",
  "reminder": "A rule or pattern reminder if relevant",
  "propUpdate": "Prop challenge status if active",
  "mood": "confident" | "cautious" | "warning"
}`

      userPrompt = `Generate a proactive trading insight for right now.`

    } else {
      // Question mode
      systemPrompt = `You are Aureus Trading, a knowledgeable trading mentor. Today is ${today}.

${buildTradingContext()}
${buildMemoryContext()}

Rules:
- Use their actual trading numbers
- Reference their rules and patterns when relevant
- Be direct and actionable
- If they're asking about a trade, consider their risk management
- Keep responses focused (3-5 sentences)
- Don't be preachy - they know the basics`

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
        messages: [{
          role: 'user',
          content: userPrompt
        }],
        system: systemPrompt
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Anthropic API error:', data)
      return NextResponse.json({ 
        error: data.error?.message || 'Request failed' 
      }, { status: response.status })
    }

    const responseText = data.content?.[0]?.text || ''

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(responseText)
      return NextResponse.json({ ...parsed, raw: responseText })
    } catch {
      return NextResponse.json({ message: responseText, raw: responseText })
    }

  } catch (error) {
    console.error('Trading coach error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
