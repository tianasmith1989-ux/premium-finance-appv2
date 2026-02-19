import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { 
      mode,           // 'onboarding' | 'proactive' | 'question' | 'legacy'
      question,       // user's question (for question mode)
      onboardingStep, // current step in onboarding
      userResponse,   // user's response during onboarding
      financialData,  // all financial data (income, expenses, debts, goals, assets, liabilities)
      memory,         // persistent memory (life events, preferences, patterns)
      financialContext // legacy support for old API calls
    } = await request.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Legacy support - if old format, use simple response
    if (financialContext && question && !mode) {
      const legacyPrompt = `${financialContext}

You are Aureus, a professional yet friendly financial advisor. Based on the user's actual financial data above, provide specific, actionable advice. Use their real numbers in your response. Be encouraging but honest. Keep responses concise and practical.

User's question: ${question}`

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
          messages: [{ role: 'user', content: legacyPrompt }]
        })
      })

      const data = await response.json()
      const advice = data.content?.[0]?.text || 'I apologize, but I could not generate advice.'
      return NextResponse.json({ advice })
    }

    let systemPrompt = ''
    let userPrompt = ''

    // Financial frameworks the AI knows about
    const FINANCIAL_FRAMEWORKS = `
=== FINANCIAL FRAMEWORKS YOU USE ===

**BABY STEPS (Dave Ramsey inspired):**
1. $1,000 Emergency Fund - starter emergency fund
2. Pay off all debt (except mortgage) - debt snowball method
3. 3-6 months expenses in savings - full emergency fund
4. Invest 15% of income for retirement
5. Save for children's education
6. Pay off home early
7. Build wealth and give generously

**RAT RACE ESCAPE / FIRE PATH:**
- Calculate monthly expenses (the "nut" to crack)
- Build passive income streams to cover expenses
- FIRE Number = Annual Expenses × 25
- Track passive income coverage percentage
- Goal: Passive Income >= Monthly Expenses = FREEDOM

**DEBT PAYOFF METHODS:**
- Avalanche: Highest interest first (mathematically optimal)
- Snowball: Smallest balance first (psychologically motivating)

**KEY METRICS TO TRACK:**
- Monthly Surplus = Income - Expenses - Debt Payments
- Savings Rate = (Income - Expenses) / Income × 100
- Debt-to-Income Ratio
- Passive Income Coverage = Passive Income / Monthly Expenses × 100
- Emergency Fund Months = Savings / Monthly Expenses
`

    // Build context from financial data
    const buildFinancialContext = () => {
      if (!financialData) return 'No financial data provided yet.'
      
      const { income, expenses, debts, goals, assets, liabilities } = financialData
      
      let context = '=== CURRENT FINANCIAL SNAPSHOT ===\n'
      
      // Income
      if (income?.length > 0) {
        let totalIncome = 0
        let passiveIncome = 0
        income.forEach((i: any) => {
          const amt = parseFloat(i.amount || '0')
          let monthly = amt
          if (i.frequency === 'weekly') monthly = amt * 4.33
          if (i.frequency === 'fortnightly') monthly = amt * 2.17
          if (i.frequency === 'yearly') monthly = amt / 12
          totalIncome += monthly
          if (i.type === 'passive') passiveIncome += monthly
        })
        context += `\nINCOME: $${totalIncome.toFixed(0)}/month (Passive: $${passiveIncome.toFixed(0)})\n`
        income.forEach((i: any) => {
          context += `  - ${i.name}: $${i.amount}/${i.frequency} (${i.type})\n`
        })
      }
      
      // Expenses
      if (expenses?.length > 0) {
        const totalExpenses = expenses.reduce((sum: number, e: any) => {
          const amt = parseFloat(e.amount || '0')
          if (e.frequency === 'weekly') return sum + amt * 4.33
          if (e.frequency === 'fortnightly') return sum + amt * 2.17
          if (e.frequency === 'yearly') return sum + amt / 12
          return sum + amt
        }, 0)
        context += `\nEXPENSES: $${totalExpenses.toFixed(0)}/month\n`
        expenses.slice(0, 10).forEach((e: any) => {
          context += `  - ${e.name}: $${e.amount}/${e.frequency}${e.category ? ` [${e.category}]` : ''}\n`
        })
        if (expenses.length > 10) context += `  ... and ${expenses.length - 10} more\n`
      }
      
      // Debts
      if (debts?.length > 0) {
        const totalDebt = debts.reduce((sum: number, d: any) => sum + parseFloat(d.balance || '0'), 0)
        const monthlyDebtPayments = debts.reduce((sum: number, d: any) => sum + parseFloat(d.minPayment || '0'), 0)
        context += `\nDEBTS: $${totalDebt.toFixed(0)} total, $${monthlyDebtPayments.toFixed(0)}/month in payments\n`
        debts.forEach((d: any) => {
          context += `  - ${d.name}: $${d.balance} @ ${d.interestRate}% (min: $${d.minPayment}/mo)\n`
        })
      }
      
      // Goals
      if (goals?.length > 0) {
        context += `\nGOALS:\n`
        goals.forEach((g: any) => {
          const progress = (parseFloat(g.saved || '0') / parseFloat(g.target || '1') * 100).toFixed(0)
          const remaining = parseFloat(g.target || '0') - parseFloat(g.saved || '0')
          context += `  - ${g.name}: $${g.saved}/$${g.target} (${progress}%) - $${remaining.toFixed(0)} to go\n`
          if (g.deadline) context += `    Deadline: ${g.deadline}\n`
        })
      }
      
      // Assets & Liabilities (if provided)
      if (assets?.length > 0) {
        const totalAssets = assets.reduce((sum: number, a: any) => sum + parseFloat(a.value || '0'), 0)
        context += `\nASSETS: $${totalAssets.toFixed(0)} total\n`
        assets.forEach((a: any) => {
          context += `  - ${a.name}: $${a.value} (${a.type})\n`
        })
      }
      
      if (liabilities?.length > 0) {
        const totalLiabilities = liabilities.reduce((sum: number, l: any) => sum + parseFloat(l.value || '0'), 0)
        context += `\nLIABILITIES: $${totalLiabilities.toFixed(0)} total\n`
      }
      
      // Calculate key metrics
      const totalIncome = income?.reduce((sum: number, i: any) => {
        const amt = parseFloat(i.amount || '0')
        if (i.frequency === 'weekly') return sum + amt * 4.33
        if (i.frequency === 'fortnightly') return sum + amt * 2.17
        return sum + amt
      }, 0) || 0
      
      const totalExpenses = expenses?.reduce((sum: number, e: any) => {
        const amt = parseFloat(e.amount || '0')
        if (e.frequency === 'weekly') return sum + amt * 4.33
        if (e.frequency === 'fortnightly') return sum + amt * 2.17
        return sum + amt
      }, 0) || 0
      
      const totalDebtPayments = debts?.reduce((sum: number, d: any) => sum + parseFloat(d.minPayment || '0'), 0) || 0
      const surplus = totalIncome - totalExpenses - totalDebtPayments
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0
      
      const passiveIncome = income?.filter((i: any) => i.type === 'passive').reduce((sum: number, i: any) => {
        const amt = parseFloat(i.amount || '0')
        if (i.frequency === 'weekly') return sum + amt * 4.33
        if (i.frequency === 'fortnightly') return sum + amt * 2.17
        return sum + amt
      }, 0) || 0
      
      const passiveCoverage = totalExpenses > 0 ? (passiveIncome / totalExpenses * 100) : 0
      const fireNumber = (totalExpenses * 12) * 25
      
      context += `\n=== KEY METRICS ===\n`
      context += `Monthly Surplus: $${surplus.toFixed(0)}\n`
      context += `Savings Rate: ${savingsRate.toFixed(1)}%\n`
      context += `Passive Income Coverage: ${passiveCoverage.toFixed(1)}%\n`
      context += `FIRE Number: $${fireNumber.toFixed(0)}\n`
      
      return context
    }

    // Build memory context
    const buildMemoryContext = () => {
      if (!memory) return ''
      
      let context = '\n=== WHAT I REMEMBER ABOUT YOU ===\n'
      
      if (memory.name) context += `Name: ${memory.name}\n`
      
      if (memory.lifeEvents?.length > 0) {
        context += '\nIMPORTANT DATES:\n'
        memory.lifeEvents.forEach((event: any) => {
          context += `  - ${event.name}: ${event.date}${event.budget ? ` (budget: $${event.budget})` : ''}\n`
        })
      }
      
      if (memory.patterns?.length > 0) {
        context += '\nPATTERNS I\'VE NOTICED:\n'
        memory.patterns.forEach((p: string) => context += `  - ${p}\n`)
      }
      
      if (memory.preferences) {
        context += '\nYOUR PREFERENCES:\n'
        if (memory.preferences.communicationStyle) context += `  - Communication: ${memory.preferences.communicationStyle}\n`
        if (memory.preferences.checkInFrequency) context += `  - Check-ins: ${memory.preferences.checkInFrequency}\n`
        if (memory.preferences.motivators) context += `  - Motivated by: ${memory.preferences.motivators.join(', ')}\n`
      }
      
      if (memory.notes?.length > 0) {
        context += '\nNOTES:\n'
        memory.notes.slice(-5).forEach((n: string) => context += `  - ${n}\n`)
      }
      
      return context
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    // Financial frameworks the AI knows about
    const FINANCIAL_FRAMEWORKS = `
=== FINANCIAL FRAMEWORKS YOU USE ===

**BABY STEPS (Dave Ramsey inspired):**
1. $1,000 Emergency Fund - starter emergency fund
2. Pay off all debt (except mortgage) - debt snowball method
3. 3-6 months expenses in savings - full emergency fund
4. Invest 15% of income for retirement
5. Save for children's education
6. Pay off home early
7. Build wealth and give generously

**RAT RACE ESCAPE / FIRE PATH:**
- Calculate monthly expenses (the "nut" to crack)
- Build passive income streams to cover expenses
- FIRE Number = Annual Expenses × 25
- Track passive income coverage percentage
- Goal: Passive Income >= Monthly Expenses = FREEDOM

**DEBT PAYOFF METHODS:**
- Avalanche: Highest interest first (mathematically optimal)
- Snowball: Smallest balance first (psychologically motivating)

**KEY METRICS TO TRACK:**
- Monthly Surplus = Income - Expenses - Debt Payments
- Savings Rate = (Income - Expenses) / Income × 100
- Debt-to-Income Ratio
- Passive Income Coverage = Passive Income / Monthly Expenses × 100
- Emergency Fund Months = Savings / Monthly Expenses
`

    if (mode === 'onboarding') {
      systemPrompt = `You are Aureus, a warm, friendly, and genuinely helpful financial companion. You're having a conversation to get to know a new user and set up their financial profile.

${FINANCIAL_FRAMEWORKS}

Your personality:
- Warm and encouraging, like a supportive friend who's great with money
- You use casual language, occasional emojis, but stay professional
- You celebrate small wins and don't judge financial struggles
- You're genuinely curious about their life, not just their money
- You keep responses SHORT - 2-3 sentences max, then ask ONE question
- You know about Baby Steps, FIRE, and help users find their path

Current onboarding step: ${onboardingStep}

The onboarding flow:
1. greeting - Get their name, make them feel welcome
2. income - Ask about how they make money (job, side hustles, passive income?)
3. expenses - Ask about their main bills and spending
4. debts - Gently ask if they have any debts to tackle
5. goals - What are they saving for? Dreams?
6. life_events - Birthdays, anniversaries, holidays they budget for
7. financial_path - Are they following Baby Steps? Pursuing FIRE? Just want stability?
8. preferences - How do they want you to communicate? Direct or gentle?
9. complete - Summarize and get them excited to start

Based on their response, either:
- Acknowledge what they said and ask a follow-up, OR
- Move to the next step if you have enough info

Always respond with JSON in this format:
{
  "message": "Your conversational response",
  "nextStep": "the next onboarding step (or same step if need more info)",
  "extractedData": { any data to save from their response },
  "isComplete": false
}`

      userPrompt = `User's response: "${userResponse || 'Just started'}"\n\nCurrent data collected so far: ${JSON.stringify(memory || {})}`

    } else if (mode === 'proactive') {
      systemPrompt = `You are Aureus, a proactive financial companion. Today is ${today}.

${FINANCIAL_FRAMEWORKS}

${buildFinancialContext()}
${buildMemoryContext()}

Your job is to analyze the user's financial situation and give them the most important, timely insight RIGHT NOW.

Consider:
1. Where are they on the Baby Steps? What's their next milestone?
2. How close are they to escaping the rat race (passive income vs expenses)?
3. Any upcoming life events in the next 30 days?
4. Any warning signs (overspending, upcoming bills, low surplus)?
5. Any wins to celebrate?

Rules:
- Lead with what matters TODAY
- Reference their actual numbers
- Mention their progress on their chosen path (Baby Steps, FIRE, etc.)
- If there's an upcoming life event, mention it
- Keep it to 2-3 sentences MAX
- Be warm but direct
- End with a helpful suggestion or offer to help

Respond with JSON:
{
  "greeting": "A short personalized greeting",
  "insight": "Your main proactive insight",
  "suggestion": "An optional actionable suggestion",
  "alerts": ["any urgent items as short strings"],
  "currentStep": "Their current Baby Step or FIRE progress",
  "mood": "positive" | "neutral" | "warning"
}`

      userPrompt = `Generate a proactive insight for this user right now.`

    } else {
      // Question mode (default)
      systemPrompt = `You are Aureus, a knowledgeable and supportive financial companion. Today is ${today}.

${FINANCIAL_FRAMEWORKS}

${buildFinancialContext()}
${buildMemoryContext()}

Rules:
- Use their actual numbers in your response
- Reference the Baby Steps or FIRE path when relevant
- Be specific and actionable
- Keep responses concise (3-5 sentences)
- If they ask to add/change something, confirm what you understood
- Be encouraging but honest about challenges
- If they seem stuck, suggest their next Baby Step or action`

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

    // Try to parse as JSON for structured responses
    try {
      const parsed = JSON.parse(responseText)
      return NextResponse.json({ ...parsed, raw: responseText })
    } catch {
      // Return as plain text if not JSON
      return NextResponse.json({ message: responseText, raw: responseText })
    }

  } catch (error) {
    console.error('Budget coach error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
