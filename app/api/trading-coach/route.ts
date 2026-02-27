import { NextRequest, NextResponse } from 'next/server'

// Comprehensive Prop Firm Rules Database
const PROP_FIRM_RULES = `
=== COMPREHENSIVE PROP FIRM RULES DATABASE ===

**FTMO (Most Popular)**
Account Sizes: $10K, $25K, $50K, $100K, $200K
- CHALLENGE PHASE:
  • Profit Target: 10%
  • Max Drawdown: 10% (from initial balance)
  • Daily Drawdown: 5% (resets daily at midnight CE(S)T)
  • Min Trading Days: 4 days
  • Max Time: 30 calendar days
- VERIFICATION PHASE:
  • Profit Target: 5%
  • Same drawdown rules
  • Min Trading Days: 4 days
  • Max Time: 60 calendar days
- FUNDED ACCOUNT:
  • Profit Split: 80% (up to 90% with scaling)
  • Same drawdown rules apply forever
  • First payout after 14 days, then bi-weekly
- STRICT RULES:
  ❌ No trading during high-impact news (2 min before/after)
  ❌ No holding positions over weekend (unless Swing account)
  ❌ No copy trading between FTMO accounts
  ❌ No martingale or grid strategies
  ✅ Stop loss recommended but not required
  ✅ Can use EAs/bots
- SCALING PLAN: +25% account size every 4 months if profitable
- RESET: Can buy a reset to start over if you fail

**MyFundedFX (Beginner Friendly)**
Account Sizes: $5K, $10K, $25K, $50K, $100K, $200K
- EVALUATION PHASE (1-Step or 2-Step options):
  • 1-Step: 10% target, 6% max DD, 4% daily DD
  • 2-Step Challenge: 8% target, 8% max DD, 5% daily DD
  • 2-Step Verification: 5% target
  • Min Trading Days: 5 days
  • Max Time: No time limit!
- FUNDED ACCOUNT:
  • Profit Split: 80%
  • First payout after 5 trading days
- RELAXED RULES:
  ✅ No news trading restrictions
  ✅ Can hold over weekends
  ✅ Can hold overnight
  ✅ EA/Bots allowed
  ❌ No copy trading
- Best for: Swing traders, patient traders who need no time pressure

**The5ers (Instant Funding Option)**
Account Sizes: $6K, $20K, $60K, $100K (Bootcamp); Up to $4M (Scaling)
- BOOTCAMP (Evaluation):
  • Profit Target: 6% (or 8% or 10% depending on program)
  • Max Drawdown: 4% TRAILING (this is tight!)
  • No daily drawdown limit
  • No time limit
- HYPER GROWTH (Instant Funding):
  • Start with real money immediately
  • Lower leverage (1:10)
  • 6% drawdown trailing
- FUNDED:
  • Profit Split: 50% initially, scales to 100%
  • Can scale up to $4 million!
- STRICT RULES:
  ❌ Very tight 4% trailing drawdown - one bad day can fail you
  ✅ No time limits
  ✅ Weekend holding allowed
  ⚠️ Designed for CONSERVATIVE traders only
- Best for: Experienced traders with excellent risk management

**Funded Next (High Profit Split)**
Account Sizes: $6K, $15K, $25K, $50K, $100K, $200K
- CHALLENGE PHASE:
  • Profit Target: 10%
  • Max Drawdown: 10%
  • Daily Drawdown: 5%
  • Min Trading Days: 5 days
  • No time limit
- VERIFICATION PHASE:
  • Profit Target: 5%
  • Same drawdown rules
- FUNDED:
  • Profit Split: 90% (one of the highest!)
  • Payout on demand after 5 trading days
- KEY RULE - CONSISTENCY:
  ⚠️ 15% Consistency Rule: No single trade can be more than 15% of your total profits
  This prevents "one lucky trade" passes
- Best for: Consistent traders, not home-run hitters

**E8 Funding**
Account Sizes: $25K, $50K, $100K, $250K
- EVALUATION:
  • Profit Target: 8%
  • Max Drawdown: 8%
  • Daily Drawdown: 5%
  • Min Trading Days: 5 days
  • No time limit
- FUNDED:
  • Profit Split: 80%
  • First payout after 8 days
- RULES:
  ✅ No news restrictions
  ✅ Weekend holding allowed
  ❌ No copy trading
- Best for: Those who want simple, straightforward rules

**Apex Trader Funding (Futures Only)**
Account Sizes: $25K, $50K, $75K, $100K, $150K, $250K, $300K
- EVALUATION:
  • Profit Target: $1,500 - $20,000 (varies by account)
  • Trailing Drawdown (moves up with profits)
  • Min Trading Days: 7 days
  • Must trade during regular market hours at least once
- FUNDED:
  • Profit Split: 90% first $25K, then 100%!
  • Payout twice per month
- RULES:
  ❌ Cannot hold through major news
  ❌ Must flatten by 4:59 PM ET
  ✅ Can scale up to 20 accounts
- Best for: Futures traders, especially NQ and ES scalpers

**Take Profit Trader (Futures Only)**
Account Sizes: $25K, $50K, $75K, $100K, $150K
- PRO ACCOUNT (Evaluation):
  • Profit Target: $1,500 - $6,000 (varies by account)
  • Max Drawdown: End-of-Day Trailing (locks in profits at day end)
  • $25K: $1,500 target, $1,500 EOD trailing DD
  • $50K: $3,000 target, $2,500 EOD trailing DD
  • $75K: $4,000 target, $2,500 EOD trailing DD
  • $100K: $5,000 target, $3,000 EOD trailing DD
  • $150K: $6,000 target, $4,500 EOD trailing DD
  • Min Trading Days: None!
  • No time limit
- FUNDED (PRO+ Account):
  • Profit Split: 80% (increases with consistency)
  • Virtual drawdown - trade the full contract size
  • Payout threshold: $1,000 minimum
  • Weekly payouts available
- KEY RULES:
  ✅ EOD trailing (more forgiving than intraday trailing)
  ✅ No minimum trading days in evaluation
  ✅ No consistency rules
  ❌ Must flatten positions by 4:00 PM ET
  ❌ Cannot hold through major economic events
  ⚠️ Scaling rules apply (max contracts based on profits)
- SCALING (Max Contracts):
  • Until $1,500 profit: Start with X contracts (varies by account)
  • Unlock more contracts as you hit profit milestones
- Best for: Futures traders who want EOD drawdown (not intraday) and no minimum days

**TopStep (Futures Only)**
Account Sizes: $50K, $100K, $150K
- TRADING COMBINE (Evaluation):
  • Profit Target: $3,000 - $9,000
  • Max Drawdown: $2,000 - $4,500
  • Daily Drawdown: $1,000 - $2,200
  • Min Trading Days: None!
- FUNDED:
  • Profit Split: 90% (100% on first $10K)
  • Weekly payouts
- RULES:
  ⚠️ "Consistency Rule" - can't make all profit in one day
  ❌ Must close by 3:10 PM CT
- Best for: Day traders who trade futures indices

**True Forex Funds**
Account Sizes: $10K, $25K, $50K, $100K, $200K
- ONE-PHASE CHALLENGE:
  • Profit Target: 10%
  • Max Drawdown: 8%
  • Daily Drawdown: 5%
  • No time limit
- FUNDED:
  • Profit Split: 80%
- RULES:
  ✅ No news restrictions
  ✅ Weekend holding OK
  ✅ Copy trading allowed (with restrictions)
- Best for: Traders who want simple one-phase evaluation

=== GENERAL PROP FIRM SUCCESS STRATEGIES ===

**Risk Management (CRITICAL):**
1. Risk 0.5% per trade during challenge (1% max)
2. This means 10 losing trades in a row only = 5% loss
3. Never risk more than 1% daily drawdown buffer
4. Example: $100K account, 5% daily = $5,000 max daily loss
   With 0.5% risk = 10 trades before daily limit

**Position Sizing Formula:**
Risk Amount = Account Balance × Risk Percentage
Position Size = Risk Amount ÷ (Entry - Stop Loss)

**Challenge Passing Strategy:**
1. Days 1-3: Don't trade. Observe the market.
2. Week 1: Trade small (0.25-0.5% risk), get feel for conditions
3. Week 2-3: Normal trading (0.5-1% risk)
4. If you hit 5-7%: Reduce risk to 0.25% and cruise to target
5. Never try to hit target in one day

**Psychology for Challenges:**
- You have UNLIMITED attempts (just costs money to reset)
- The goal is consistency, not speed
- A 0.5% daily gain = 10% in 20 trading days
- Stop trading the day if down 1-2%
- The market will be there tomorrow

**What Causes Most Failures:**
1. Over-trading (taking B and C setups)
2. Revenge trading after losses
3. Moving stop losses
4. Trading during news
5. Trying to pass too fast
6. Not knowing the specific rules of YOUR firm
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
      
      // Accounts with FULL details
      const accountsList = tradingData.accounts || accounts || []
      if (accountsList && accountsList.length > 0) {
        context += `=== USER'S TRADING ACCOUNTS ===\n`
        accountsList.forEach((acc: any, idx: number) => {
          const startBal = parseFloat(acc.startingBalance || '0')
          const currBal = parseFloat(acc.currentBalance || '0')
          const pnl = currBal - startBal
          const pnlPct = startBal > 0 ? (pnl / startBal * 100) : 0
          
          // Get account-specific trades
          const accTrades = allTrades.filter((t: any) => t.accountId === acc.id)
          const accTodayTrades = accTrades.filter((t: any) => t.date === todayStr)
          const accTodayPnL = accTodayTrades.reduce((sum: number, t: any) => sum + parseFloat(t.profitLoss || '0'), 0)
          const accTodayPnLPct = startBal > 0 ? (accTodayPnL / startBal * 100) : 0
          
          context += `\n📊 ACCOUNT ${idx + 1}: ${acc.name} (ID: ${acc.id})\n`
          context += `   Type: ${acc.type === 'prop_challenge' ? 'Prop Challenge' : acc.type === 'prop_funded' ? 'Funded' : 'Personal'}\n`
          context += `   Prop Firm: ${acc.propFirm || 'N/A'}\n`
          context += `   Balance: $${currBal.toLocaleString()} (Started: $${startBal.toLocaleString()})\n`
          context += `   Total P&L: ${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}% ($${pnl.toFixed(0)})\n`
          context += `   Today's P&L: ${accTodayPnLPct >= 0 ? '+' : ''}${accTodayPnLPct.toFixed(2)}% ($${accTodayPnL.toFixed(0)})\n`
          context += `   Trades: ${accTrades.length} total, ${accTodayTrades.length} today\n`
          
          if (acc.type !== 'personal') {
            const maxDD = parseFloat(acc.maxDrawdown || '0')
            const dailyDD = parseFloat(acc.dailyDrawdown || '0')
            const target = parseFloat(acc.profitTarget || '0')
            const ddUsed = pnlPct < 0 ? Math.abs(pnlPct) : 0
            const ddRemaining = maxDD - ddUsed
            const dailyDDUsed = accTodayPnLPct < 0 ? Math.abs(accTodayPnLPct) : 0
            const dailyDDRemaining = dailyDD - dailyDDUsed
            const progressToTarget = target > 0 ? (pnlPct / target * 100) : 0
            
            context += `   --- ACCOUNT RULES ---\n`
            context += `   Max Drawdown: ${maxDD}% (Used: ${ddUsed.toFixed(2)}%, Remaining: ${ddRemaining.toFixed(2)}%)\n`
            context += `   Daily Drawdown: ${dailyDD}% (Used today: ${dailyDDUsed.toFixed(2)}%, Remaining: ${dailyDDRemaining.toFixed(2)}%)\n`
            context += `   Profit Target: ${target}% (Progress: ${progressToTarget.toFixed(1)}%)\n`
            
            if (acc.minTradingDays) context += `   Min Trading Days: ${acc.minTradingDays}\n`
            if (acc.maxTradingDays) context += `   Max Days to Pass: ${acc.maxTradingDays}\n`
            if (acc.consistencyRule) context += `   Consistency Rule: ${acc.consistencyRule}\n`
            if (acc.newsRestriction) context += `   ⚠️ NEWS TRADING RESTRICTED\n`
            if (!acc.weekendHolding) context += `   ⚠️ NO WEEKEND HOLDING\n`
            if (acc.profitSplit) context += `   Profit Split: ${acc.profitSplit}%\n`
            
            // Custom rules
            if (acc.customRules && acc.customRules.length > 0) {
              context += `   --- CUSTOM RULES (USER DEFINED) ---\n`
              acc.customRules.forEach((rule: string) => {
                context += `   • ${rule}\n`
              })
            }
            
            // Warnings
            if (ddRemaining < maxDD * 0.3) {
              context += `   🚨 WARNING: Approaching max drawdown! Only ${ddRemaining.toFixed(2)}% remaining!\n`
            }
            if (dailyDDRemaining < dailyDD * 0.3) {
              context += `   🚨 WARNING: Approaching daily drawdown limit!\n`
            }
            if (progressToTarget >= 80) {
              context += `   ✅ ALMOST THERE: ${progressToTarget.toFixed(1)}% to profit target!\n`
            }
          }
        })
        context += '\n'
      }
      
      // Trading rules
      if (tradingRules && tradingRules.length > 0) {
        const enabledRules = tradingRules.filter((r: any) => r.enabled)
        context += `USER'S TRADING RULES:\n`
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
- IMPORTANT: Always ask which account to log it to if they have accounts!
- Include accountId to link trade to the correct account
- Action: {"type": "addTrade", "data": {"instrument": "EURUSD", "direction": "long", "entryPrice": "1.0850", "exitPrice": "1.0890", "profitLoss": "200", "accountId": 123456789, "notes": "Clean breakout setup"}}
- The trade P&L will automatically update the account balance
- After logging, remind them of their account status (drawdown remaining, etc.)

**ACCOUNT STATUS CHECK:**
When user asks about their account or you log a trade:
- Review their drawdown status from the context
- If approaching limits, give a clear warning
- Remind them of any custom rules they've set
- Example: "Trade logged! Your FTMO account is now at +3.2%. You have 6.8% max drawdown remaining. Remember your rule: no trading after 3 losses in a day."

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
