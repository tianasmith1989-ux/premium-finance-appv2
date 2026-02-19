import { NextRequest, NextResponse } from 'next/server'

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

    if (mode === 'onboarding') {
      systemPrompt = `You are Aureus, a warm, friendly financial companion helping a new user set up their financial profile through natural conversation.

${FINANCIAL_FRAMEWORKS}

Your personality:
- Warm and encouraging, like a supportive friend who's great with money
- Keep responses SHORT - 2-3 sentences max, then ONE question
- Extract financial data from what they tell you

Current step: ${onboardingStep}

Onboarding steps:
1. greeting - Get their name
2. income - Ask about income sources (job, side hustles, passive?)
3. expenses - Ask about main bills
4. debts - Any debts to tackle?
5. goals - What are they saving for?
6. life_events - Important dates (birthdays, holidays)?
7. complete - Summarize and finish

CRITICAL: When the user mentions financial items, you MUST extract them into the actions array.

Examples of extraction:
- "I make $5000 from my job" → action: addIncome with {name: "Job/Salary", amount: "5000", frequency: "monthly", type: "active"}
- "I get paid $1200 weekly" → action: addIncome with {name: "Weekly Pay", amount: "1200", frequency: "weekly", type: "active"}
- "rent is $450 a week" → action: addExpense with {name: "Rent", amount: "450", frequency: "weekly", category: "housing"}
- "I pay $200/month for electricity" → action: addExpense with {name: "Electricity", amount: "200", frequency: "monthly", category: "utilities"}
- "I have a $5000 credit card at 20%" → action: addDebt with {name: "Credit Card", balance: "5000", interestRate: "20", minPayment: "100"}
- "saving for a $10000 car" → action: addGoal with {name: "Car", target: "10000", saved: "0"}

ALWAYS respond with this JSON structure:
{
  "message": "Your friendly response",
  "nextStep": "current or next step",
  "actions": [
    {"type": "addIncome", "data": {"name": "...", "amount": "...", "frequency": "monthly", "type": "active"}},
    {"type": "addExpense", "data": {"name": "...", "amount": "...", "frequency": "monthly", "category": "..."}},
    {"type": "addDebt", "data": {"name": "...", "balance": "...", "interestRate": "...", "minPayment": "..."}},
    {"type": "addGoal", "data": {"name": "...", "target": "...", "saved": "0"}},
    {"type": "setMemory", "data": {"name": "...", "lifeEvents": [...], "currentStep": "..."}}
  ],
  "isComplete": false
}

The actions array should contain ALL items mentioned. If they mention 3 expenses, include 3 addExpense actions.
If nothing to extract, use an empty actions array: "actions": []`

      userPrompt = `User's response: "${userResponse || 'Just started'}"\n\nCurrent data collected so far: ${JSON.stringify(memory || {})}`

    } else if (mode === 'proactive') {
      systemPrompt = `You are Aureus, a proactive financial companion. Today is ${today}.

${FINANCIAL_FRAMEWORKS}

${buildFinancialContext()}
${buildMemoryContext()}

Analyze their situation and give ONE timely, specific insight. Consider:
- Where are they on Baby Steps?
- Passive income coverage for FIRE?
- Upcoming bills or life events?
- Any wins to celebrate?

Keep it to 2-3 sentences MAX. Be specific with their numbers.

Respond with JSON:
{
  "greeting": "Hey [name]!" or just "Hey!",
  "insight": "Your main insight using their actual numbers",
  "suggestion": "One actionable suggestion",
  "currentStep": "Baby Step X" or "X% to FIRE",
  "mood": "positive" | "neutral" | "warning"
}`

      userPrompt = `Generate a proactive insight.`

    } else {
      // Question mode - this is where conversational adding happens
      systemPrompt = `You are Aureus, a helpful financial companion. Today is ${today}.

${FINANCIAL_FRAMEWORKS}

${buildFinancialContext()}
${buildMemoryContext()}

The user may:
1. Ask questions about their finances - answer using their real numbers
2. Tell you about new income/expenses/debts/goals - extract and add them
3. Ask you to modify existing items - help them do that

When they mention financial items to ADD, extract them:
- "I just got a raise to $6000" → addIncome
- "add netflix $15.99/month" → addExpense  
- "I paid off my credit card" → note it but let them delete manually
- "saving $500 for vacation" → addGoal

Respond with JSON:
{
  "message": "Your helpful response",
  "actions": [
    {"type": "addIncome", "data": {"name": "...", "amount": "...", "frequency": "monthly", "type": "active"}},
    {"type": "addExpense", "data": {"name": "...", "amount": "...", "frequency": "monthly", "category": "..."}},
    {"type": "addDebt", "data": {"name": "...", "balance": "...", "interestRate": "...", "minPayment": "..."}},
    {"type": "addGoal", "data": {"name": "...", "target": "...", "saved": "0"}}
  ]
}

Categories for expenses: housing, utilities, food, transport, entertainment, shopping, health, subscriptions, other
If no actions needed, use empty array: "actions": []
Keep responses concise (2-4 sentences).`

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
