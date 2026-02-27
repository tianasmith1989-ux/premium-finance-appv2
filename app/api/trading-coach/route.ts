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
      memory,
      chartImage, // Base64 image for chart analysis
      tradeIdeaSettings, // User's preferred R:R, risk settings
      tradingRules // User's custom trading rules
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
User's name: ${memory?.name || 'not set yet'}
User's experience: ${memory?.experience || 'not set yet'}
User's style: ${memory?.tradingStyle || 'not set yet'}
User's instruments: ${memory?.instruments?.join(', ') || 'not set yet'}
User's goals: ${JSON.stringify(memory?.propFirmGoals) || 'not set yet'}

=== ONBOARDING STEP INSTRUCTIONS ===

${onboardingStep === 'greeting' ? `
GREETING STEP - Get their name.

If this looks like a name (1-3 words, no question marks):
- Store it with: {"type": "setMemory", "data": {"name": "THE_NAME"}}
- Say: "Nice to meet you, [Name]! How long have you been trading? Beginner (0-1 year), Intermediate (1-3 years), or Advanced (3+ years)?"
- Set nextStep: "experience"

If they said "hi", "hello", "hey" etc:
- Ask: "Hey! 📈 I'm Aureus, your trading operations coach. I'll help you optimize capital deployment, maintain psychological discipline, and systematically scale your accounts. What's your name?"
- Keep nextStep: "greeting"
` : ''}

${onboardingStep === 'experience' ? `
EXPERIENCE STEP - They told you their experience level.

Extract their experience (beginner/intermediate/advanced or years).
Store: {"type": "setMemory", "data": {"experience": "their_level"}}

Then ask about trading style:
"Got it! What's your trading style?
- Scalper (seconds to minutes)
- Day Trader (minutes to hours, always flat by close)
- Swing Trader (hold for days or weeks)"

Set nextStep: "style"
` : ''}

${onboardingStep === 'style' ? `
STYLE STEP - They told you their trading style.

Extract style and store: {"type": "setMemory", "data": {"tradingStyle": "scalper|day_trader|swing_trader"}}

Then ask about instruments:
"What markets do you trade?
- Forex
- Futures (ES, NQ, etc)
- Stocks
- Crypto
(Can be multiple)"

Set nextStep: "instruments"
` : ''}

${onboardingStep === 'instruments' ? `
INSTRUMENTS STEP - They told you what they trade.

Extract instruments and store: {"type": "setMemory", "data": {"instruments": ["forex", "futures", etc]}}

Then ask about goals:
"Now let's talk goals. I need to know what you're actually trying to achieve:

1. Are you trying to pass a prop firm challenge? If so, which firm?
2. Are you growing a personal account?
3. What's your realistic target for monthly returns (be honest - 1-5% is very good)?

Tell me your situation!"

Set nextStep: "goals"
` : ''}

${onboardingStep === 'goals' ? `
GOALS STEP - They told you their goals.

Extract their goals:
- If prop firm mentioned: {"type": "setMemory", "data": {"propFirmGoals": {"targetFirm": "FTMO", "pursuing": true}}}
- If personal account: {"type": "setMemory", "data": {"personalAccountGoals": {"pursuing": true, "monthlyTarget": X}}}

Then ask about psychology:
"Real talk - what's your biggest trading weakness? The thing that gets you in trouble?
- Revenge trading after losses
- FOMO - jumping in late
- Overtrading when bored
- Moving stop losses
- Cutting winners short
- Over-leveraging

Be honest, we all have one. Knowing yours is the first step to fixing it."

Set nextStep: "psychology"
` : ''}

${onboardingStep === 'psychology' ? `
PSYCHOLOGY STEP - They told you their weakness.

Acknowledge their weakness genuinely. Store it: {"type": "setMemory", "data": {"psychology": {"weakness": "their_weakness"}}}

Then suggest 2-3 specific rules to help with THAT weakness. Example for revenge trading:
"Revenge trading - that's a common one. Here are some rules that help:
1. After any losing trade, wait 15 minutes before the next trade
2. Max 3 trades per day - period
3. If down 1% in a day, stop trading

Want me to add these to your trading rules? You can customize them anytime."

Set nextStep: "rules"
` : ''}

${onboardingStep === 'rules' ? `
RULES STEP - Confirm their rules.

If they agreed to rules, add them:
{"type": "addTradingRule", "data": {"rule": "Wait 15 mins after a loss", "category": "psychology", "enabled": true}}

Then wrap up:
"Perfect! Here's what I've learned about you:
- Experience: [X]
- Style: [X]  
- Markets: [X]
- Goals: [X]
- Weakness to watch: [X]

I'll help you:
✅ Track your trades and psychology
✅ Stay within prop firm rules (if applicable)
✅ Compound your personal account
✅ Catch yourself before you tilt

Check the 🗺️ Roadmap section to set trading milestones. Let's make some money, [Name]! 💪"

Set isComplete: true
` : ''}

=== RESPONSE FORMAT ===
Respond with RAW JSON only:
{
  "message": "Your conversational response",
  "nextStep": "next_step_name",
  "actions": [{"type": "setMemory", "data": {...}}, ...],
  "isComplete": false
}

Remember:
- Use actions to store data
- Don't skip steps
- Be conversational but professional
- Show you understand trading`

      userPrompt = `Current step: ${onboardingStep}
User said: "${userResponse}"

Respond with JSON only. Extract relevant data and move to the correct next step.`
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

User's trade idea settings:
- Minimum R:R ratio: ${tradeIdeaSettings?.minRR || '3'}:1
- Max risk per trade: ${tradeIdeaSettings?.maxRiskPercent || '1'}%
- Trading style: ${tradeIdeaSettings?.tradingStyle || 'day trading'}

CONVERSATION HISTORY:
${conversationHistory || 'No previous messages'}

=== WHAT YOU CAN DO ===

**ADD TRADING ACCOUNT:**
When user wants to add a prop firm account or personal account:
- Ask for: name, type (prop_challenge/prop_funded/personal), prop firm, starting balance, drawdown limits
- Action: {"type": "addAccount", "data": {"name": "FTMO 100K", "type": "prop_challenge", "propFirm": "FTMO", "startingBalance": "100000", "maxDrawdown": "10", "dailyDrawdown": "5", "profitTarget": "10"}}

**ADD TRADING RULE:**
When user wants to add a custom rule:
- Action: {"type": "addTradingRule", "data": {"rule": "No trading on Fridays", "category": "timing", "enabled": true}}

**TOGGLE TRADING RULE:**
When user wants to enable/disable a rule:
- Action: {"type": "toggleRule", "data": {"id": 123}}

**ADD TO ROADMAP:**
When user wants to add a trading milestone:
- Action: {"type": "addTradingMilestone", "data": {"name": "Pass FTMO Challenge", "targetAmount": "10000", "category": "prop", "icon": "🎯"}}

**LOG TRADE:**
When user tells you about a completed trade:
- Action: {"type": "addTrade", "data": {"instrument": "EURUSD", "direction": "long", "entryPrice": "1.0850", "exitPrice": "1.0890", "profitLoss": "200", "notes": "Clean breakout setup"}}

**CHART ANALYSIS:**
When analyzing charts, if user has set minimum R:R of ${tradeIdeaSettings?.minRR || '3'}:1:
- Only suggest trade ideas that meet or exceed this R:R
- Always include specific entry, stop loss, and take profit levels
- Calculate the R:R and show it

**MULTI-TIMEFRAME ANALYSIS:**
For better analysis, suggest uploading:
1. Higher timeframe (Daily/4H) - Overall trend and key levels
2. Mid timeframe (1H) - Structure and zones
3. Lower timeframe (15m/5m) - Entry precision

=== IMPORTANT DISCLAIMER ===
When giving trade ideas or analysis:
- Remind users this is educational, not financial advice
- They should do their own analysis
- Past setups don't guarantee future results

=== RESPONSE FORMAT ===
RESPOND ONLY WITH RAW JSON:
{"message": "your helpful response", "actions": []}

Be direct, practical, and specific. If they're asking about prop firms, give specific rule reminders. If they're emotional, address the psychology first. Always think about protecting their capital.`

      userPrompt = `USER'S MESSAGE: "${question || 'Hello!'}"

Remember: 
- If user says "yes/sure/okay", they're responding to your last offer
- Match trade ideas to their R:R requirements (min ${tradeIdeaSettings?.minRR || '3'}:1)
- Use actions to add accounts, rules, trades, or milestones when asked
Respond with JSON only.`
    }

    // Build message content - support text and optional image
    let messageContent: any = systemPrompt + '\n\n' + userPrompt
    
    // If there's a chart image, format for vision API
    if (chartImage && chartImage.startsWith('data:image')) {
      const base64Data = chartImage.split(',')[1]
      const mediaType = chartImage.split(';')[0].split(':')[1]
      
      messageContent = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: base64Data
          }
        },
        {
          type: 'text',
          text: systemPrompt + '\n\n' + userPrompt + '\n\n[USER HAS ATTACHED A CHART IMAGE - Analyze it for: price action, key levels, potential setups, entry/exit points, and whether it aligns with their trading style]'
        }
      ]
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
        max_tokens: 1500, // Increased for chart analysis
        messages: [
          { role: 'user', content: messageContent }
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
