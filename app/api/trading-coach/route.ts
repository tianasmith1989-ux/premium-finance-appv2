import { NextRequest, NextResponse } from 'next/server'

// Prop Firm Rules Database
const PROP_FIRM_RULES = `
=== PROP FIRM RULES DATABASE ===

**FTMO:**
- Challenge: 10% profit target, 10% max drawdown, 5% daily drawdown, min 4 trading days, max 30 days
- Verification: 5% profit target, 10% max drawdown, 5% daily drawdown, min 4 trading days, max 60 days
- Funded: 80% profit split, same drawdown rules
- Rules: No trading 2 mins before/after high-impact news, no holding over weekend (unless swing account), stop loss required
- Tips: Focus on consistency over speed. Many fail by rushing. 0.5% daily = 10% in 20 days.

**MyFundedFX:**
- Evaluation: 8% profit target, 8% max drawdown, 5% daily drawdown, min 5 trading days, no time limit
- Funded: 80% profit split, scaling plan available
- Rules: No news restrictions, can hold over weekend, more relaxed than FTMO
- Tips: Good for swing traders. Lower targets = easier pass. Use the no-time-limit wisely.

**The5ers:**
- Evaluation: 6% profit target, 4% max drawdown (trailing), no daily limit, no time limit
- Funded: 50-100% profit split (scales up), can scale to $4M
- Rules: Very tight drawdown (4%). Designed for conservative traders.
- Tips: Only for experienced traders with tight risk management. One bad trade can blow it.

**Funded Next:**
- Challenge: 10% profit target, 10% max drawdown, 5% daily drawdown, no time limit
- Verification: 5% profit target, same drawdown rules
- Funded: 90% profit split (one of the highest!)
- Rules: 15% consistency rule (no single trade can be >15% of total profit)
- Tips: Great profit split. Consistency rule prevents lucky big trades from passing.

**General Prop Firm Success Tips:**
1. Risk 0.5-1% per trade maximum (0.5% is safer for challenges)
2. Don't trade every day - quality over quantity
3. Focus on A+ setups only - this isn't your money yet
4. If down 2% in a day, STOP. Come back tomorrow.
5. Many traders pass in 2-3 weeks, not 2-3 days. Be patient.
6. The challenge tests psychology more than skill. Stay calm.
`

const TRADING_PSYCHOLOGY = `
=== TRADING PSYCHOLOGY FRAMEWORK ===

**Common Psychological Traps:**
1. Revenge Trading - Taking impulsive trades after losses to "make it back"
2. FOMO - Entering trades late because you "missed the move"
3. Overtrading - Taking too many trades, often from boredom
4. Moving Stop Loss - Hoping a losing trade will come back
5. Cutting Winners Short - Taking profit too early from fear
6. Overleveraging - Risking too much on "sure things"

**Tilt Warning Signs:**
- More than 3 trades in an hour
- Trading after hitting daily loss limit
- Increasing position size after losses
- Trading outside your normal hours
- Breaking your own rules
- Feeling angry, frustrated, or desperate

**Recovery Protocol:**
1. Step away from screens immediately
2. Physical break: walk, exercise, fresh air
3. Journal what happened and why
4. Don't trade again that day
5. Next day: start with half position size
6. Build back confidence with small wins

**Mental Game Tips:**
- Treat trading like a job, not gambling
- Your job is to follow the process, not make money
- Losses are tuition, not failure
- Every trade is just one of the next 1000 trades
- The market will be there tomorrow
`

const COMPOUNDING_WISDOM = `
=== PERSONAL ACCOUNT COMPOUNDING ===

**The Power of Consistency:**
- 0.5% daily = 10% monthly = 214% yearly (compounded)
- 1% daily = 22% monthly = 1,145% yearly (compounded)
- Small consistent gains beat occasional big wins

**Compounding Strategy for Personal Accounts:**
1. Start Small, Scale Slow - Don't increase size until consistently profitable
2. Reinvest 80-100% of profits for first 6-12 months
3. Withdraw only ABOVE your goal (e.g., if target is $500/mo, withdraw anything over)
4. Never withdraw from initial capital
5. Monthly contributions accelerate growth massively

**Example Compounding Journey:**
Starting: $5,000 | Adding: $200/month | Daily Return: 0.5%
- Month 3: $6,846
- Month 6: $9,542
- Month 12: $18,389
- Month 24: $66,742

**Mindset Shift:**
- Prop accounts = income (trade aggressively within rules)
- Personal accounts = wealth building (trade conservatively, compound)
- Treat personal account like a business investment, not a lottery ticket
`

export async function POST(request: NextRequest) {
  try {
    const { 
      mode, // 'onboarding', 'question', 'trade_review', 'pre_session', 'post_session'
      question,
      onboardingStep,
      userResponse,
      conversationHistory,
      tradingData,
      accounts,
      memory
    } = await request.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' })

    // Build trading context
    const buildTradingContext = () => {
      if (!tradingData) return 'No trading data yet.'
      
      let context = '=== CURRENT TRADING DATA ===\n'
      
      // Today's trades
      const todayStr = new Date().toISOString().split('T')[0]
      const todaysTrades = tradingData.trades?.filter((t: any) => t.date === todayStr) || []
      const todaysPnL = todaysTrades.reduce((sum: number, t: any) => sum + parseFloat(t.profitLoss || '0'), 0)
      const todaysWins = todaysTrades.filter((t: any) => parseFloat(t.profitLoss || '0') > 0).length
      const todaysLosses = todaysTrades.filter((t: any) => parseFloat(t.profitLoss || '0') < 0).length
      
      context += `TODAY'S STATS:\n`
      context += `- Trades taken: ${todaysTrades.length}\n`
      context += `- Wins: ${todaysWins}, Losses: ${todaysLosses}\n`
      context += `- Today's P&L: $${todaysPnL.toFixed(2)}\n`
      context += `- Tilt risk: ${tradingData.tiltScore || 0}%\n\n`
      
      // Overall stats
      const allTrades = tradingData.trades || []
      const totalPnL = allTrades.reduce((sum: number, t: any) => sum + parseFloat(t.profitLoss || '0'), 0)
      const winRate = allTrades.length > 0 
        ? (allTrades.filter((t: any) => parseFloat(t.profitLoss || '0') > 0).length / allTrades.length * 100)
        : 0
      
      context += `OVERALL STATS:\n`
      context += `- Total trades: ${allTrades.length}\n`
      context += `- Win rate: ${winRate.toFixed(1)}%\n`
      context += `- Total P&L: $${totalPnL.toFixed(2)}\n\n`
      
      // Accounts
      if (accounts && accounts.length > 0) {
        context += `TRADING ACCOUNTS:\n`
        accounts.forEach((acc: any) => {
          const pnl = parseFloat(acc.currentBalance || '0') - parseFloat(acc.startingBalance || '0')
          const pnlPct = parseFloat(acc.startingBalance || '0') > 0 
            ? (pnl / parseFloat(acc.startingBalance || '0') * 100)
            : 0
          context += `- ${acc.name} (${acc.propFirm || 'Personal'}): $${parseFloat(acc.currentBalance || '0').toLocaleString()} (${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%)\n`
          if (acc.type !== 'personal') {
            context += `  Max DD: ${acc.maxDrawdown}%, Daily DD: ${acc.dailyDrawdown}%, Target: ${acc.profitTarget}%\n`
            const ddRemaining = parseFloat(acc.maxDrawdown || '0') - Math.abs(Math.min(0, pnlPct))
            context += `  Drawdown remaining: ${ddRemaining.toFixed(2)}%\n`
          }
        })
        context += '\n'
      }
      
      // Trading rules
      if (tradingData.rules && tradingData.rules.length > 0) {
        const enabledRules = tradingData.rules.filter((r: any) => r.enabled)
        context += `ACTIVE TRADING RULES:\n`
        enabledRules.forEach((rule: any) => {
          context += `- ${rule.rule}\n`
        })
      }
      
      return context
    }

    let systemPrompt = ''
    let userPrompt = ''

    // ==================== ONBOARDING MODE ====================
    if (mode === 'onboarding') {
      systemPrompt = `You are Aureus, an AI trading coach. You're onboarding a new trader.

Your personality:
- Direct and no-nonsense, like a trading mentor
- Supportive but honest - you don't sugarcoat
- Focus on psychology and discipline, not just strategy
- You know prop firm rules deeply and help traders stay compliant
- You believe in consistent compounding for personal accounts

${PROP_FIRM_RULES}

${TRADING_PSYCHOLOGY}

Current onboarding step: ${onboardingStep}
User's name: ${memory?.name || 'trader'}

ONBOARDING FLOW:
1. greeting - Welcome them, ask their name
2. experience - Ask their trading experience level
3. style - Ask their trading style (scalper, day trader, swing trader)
4. instruments - Ask what they trade (forex, futures, stocks, crypto)
5. goals - Ask about prop firm goals vs personal account goals
6. psychology - Ask about their biggest trading weakness
7. rules - Help them set up trading rules
8. complete - Summary and let's start!

Respond ONLY in this JSON format:
{
  "message": "Your conversational response",
  "extractedData": { any relevant data from their response },
  "nextStep": "next_step_name or null if done",
  "isComplete": true/false
}`

      const onboardingPrompts: {[key: string]: string} = {
        greeting: `Welcome the trader! Ask for their name. Be excited but professional. Mention you'll help them with prop firms, psychology, and building their personal account through compounding.`,
        experience: `User's name: ${userResponse}. Store it. Now ask about their trading experience. Are they: Beginner (0-1 years), Intermediate (1-3 years), or Advanced (3+ years)?`,
        style: `They said: "${userResponse}". Now ask their trading style - are they a Scalper (seconds-minutes), Day Trader (minutes-hours), or Swing Trader (days-weeks)?`,
        instruments: `They said: "${userResponse}". Ask what markets they trade: Forex pairs? Futures (ES, NQ)? Stocks? Crypto? They can trade multiple.`,
        goals: `They said: "${userResponse}". Now the important one - ask about their goals:
1. Are they going for prop firm funding? Which firm interests them?
2. Do they have a personal account they're building?
3. What's their monthly income target from trading?`,
        psychology: `They said: "${userResponse}". Now the real talk - ask about their biggest trading weakness. Common ones: revenge trading, overtrading, moving stops, FOMO, cutting winners short. Be supportive, everyone has weaknesses.`,
        rules: `They said: "${userResponse}". Acknowledge their weakness and suggest 3-4 specific trading rules that would help them. Ask if they want to add these as their personal trading rules. Example: if they struggle with overtrading, suggest "Max 3 trades per day".`,
        complete: `They said: "${userResponse}". Wrap up the onboarding! Summarize what you learned about them. Mention you'll help them:
- Stay within prop firm rules
- Build their personal account through compounding
- Catch tilt before it costs them
- Review their trades and psychology

Set isComplete: true`
      }

      userPrompt = onboardingPrompts[onboardingStep] || onboardingPrompts.greeting
    }
    // ==================== PRE-SESSION MODE ====================
    else if (mode === 'pre_session') {
      systemPrompt = `You are Aureus, preparing a trader for their trading session.

${PROP_FIRM_RULES}
${TRADING_PSYCHOLOGY}

${buildTradingContext()}

Today is ${today}. Give them a brief, focused pre-session checklist:
1. Check their account status (any drawdown concerns?)
2. Remind them of their rules
3. Check the day of week (Fridays can be tricky, Mondays have gaps)
4. Give one specific focus area based on their recent performance or psychology
5. Remind them of their risk per trade

Keep it SHORT and actionable. End with a motivating message.

Respond in JSON: {"message": "your message"}`

      userPrompt = `Prepare me for today's trading session.`
    }
    // ==================== POST-SESSION MODE ====================
    else if (mode === 'post_session') {
      systemPrompt = `You are Aureus, reviewing a trader's session.

${buildTradingContext()}

Today is ${today}. Give them a post-session review:
1. Summarize their day (trades, P&L)
2. Did they follow their rules?
3. Psychology check - any signs of tilt?
4. One thing they did well
5. One thing to improve tomorrow

Be honest but supportive. If they had a bad day, focus on what they can learn, not dwelling on losses.

Respond in JSON: {"message": "your message"}`

      userPrompt = `Review my trading session today.`
    }
    // ==================== TRADE REVIEW MODE ====================
    else if (mode === 'trade_review') {
      systemPrompt = `You are Aureus, reviewing a specific trade.

${TRADING_PSYCHOLOGY}
${buildTradingContext()}

The user is sharing a trade for review. Analyze:
1. Was the risk appropriate for their account?
2. Did it follow their setup rules?
3. What was their emotional state?
4. Grade the trade: A (perfect execution), B (minor issues), C (shouldn't have taken)
5. One lesson from this trade

Be constructive. Even losing trades can be A-grade if executed properly.

Respond in JSON: {"message": "your review", "tradeGrade": "A/B/C", "keyLesson": "one sentence"}`

      userPrompt = question || 'Review my trade'
    }
    // ==================== QUESTION MODE ====================
    else {
      systemPrompt = `You are Aureus, an AI trading coach with deep knowledge of:
- Prop firm rules (FTMO, MyFundedFX, The5ers, Funded Next, etc.)
- Trading psychology and tilt management
- Personal account compounding strategies
- Risk management

${PROP_FIRM_RULES}

${TRADING_PSYCHOLOGY}

${COMPOUNDING_WISDOM}

${buildTradingContext()}

Today is ${today}.

User's memory/profile:
${JSON.stringify(memory || {}, null, 2)}

CONVERSATION HISTORY:
${conversationHistory || 'No previous messages'}

RESPOND ONLY WITH RAW JSON:
{"message": "your helpful response", "actions": []}

Be direct, practical, and specific. If they're asking about prop firms, give specific rule reminders. If they're emotional, address the psychology first. Always think about protecting their capital.`

      userPrompt = `USER'S MESSAGE: "${question || 'Hello!'}"

Remember: If user says "yes/sure/okay", they're responding to your last offer.
Respond with JSON only.`
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
        max_tokens: 1024,
        messages: [
          { role: 'user', content: systemPrompt + '\n\n' + userPrompt }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', errorText)
      return NextResponse.json({ error: 'API call failed', details: errorText }, { status: 500 })
    }

    const data = await response.json()
    const aiResponse = data.content?.[0]?.text || ''

    // Parse JSON response
    try {
      // Clean the response - remove markdown if present
      let cleanResponse = aiResponse.trim()
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '')
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '')
      }
      
      const parsed = JSON.parse(cleanResponse)
      return NextResponse.json(parsed)
    } catch (parseError) {
      // If JSON parsing fails, return raw response
      console.log('JSON parse failed, returning raw:', aiResponse)
      return NextResponse.json({ 
        message: aiResponse,
        raw: aiResponse
      })
    }

  } catch (error) {
    console.error('Trading coach error:', error)
    return NextResponse.json({ 
      error: 'Failed to process request',
      message: "I'm having trouble right now. Let's try again!"
    }, { status: 500 })
  }
}
