import { NextRequest, NextResponse } from 'next/server'

// Types for better type safety
interface LifeEvent {
  name: string
  date: string
  budget?: number
  addedDate: string
}

interface Preferences {
  communicationStyle?: string
  checkInFrequency?: string
  motivators?: string[]
}

interface MemoryUpdate {
  lifeEvents?: LifeEvent[]
  patterns?: string[]
  notes?: string[]
  preferences?: Preferences
  extractedData?: any
  name?: string
  lastUpdated?: string
}

interface AureusResponse {
  message: string
  memoryUpdates?: MemoryUpdate
  alerts?: string[]
  insight?: string
  suggestion?: string
  greeting?: string
  currentStep?: string
  mood?: 'positive' | 'neutral' | 'warning'
  nextStep?: string
  isComplete?: boolean
  extractedData?: any
}

interface UserMemory {
  name?: string
  lifeEvents?: LifeEvent[]
  patterns?: string[]
  preferences?: Preferences
  notes?: string[]
  lastUpdated?: string
  [key: string]: any
}

interface IncomeItem {
  name: string
  amount: string | number
  frequency: string
  type: string
}

interface ExpenseItem {
  name: string
  amount: string | number
  frequency: string
  category?: string
}

interface DebtItem {
  name: string
  balance: string | number
  interestRate: string | number
  minPayment: string | number
}

interface GoalItem {
  name: string
  saved: string | number
  target: string | number
  deadline?: string
}

interface AssetItem {
  name: string
  value: string | number
  type: string
}

interface LiabilityItem {
  name: string
  value: string | number
}

interface FinancialData {
  income?: IncomeItem[]
  expenses?: ExpenseItem[]
  debts?: DebtItem[]
  goals?: GoalItem[]
  assets?: AssetItem[]
  liabilities?: LiabilityItem[]
  savings?: string | number
}

interface LastExchange {
  userMessage: string
  aiResponse: any
}

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

**MEMORY MANAGEMENT RULES:**
- When users share personal information (birthdays, anniversaries, goals, preferences), ALWAYS include it in memoryUpdates
- When users mention spending patterns or habits, note them in patterns
- When users share important context about their life, add to notes
- Always preserve exact numbers and dates users mention
- If unsure about exact details, ask for clarification before storing
`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      mode = 'question',           // 'onboarding' | 'proactive' | 'question'
      question,                    // user's question (for question mode)
      onboardingStep,              // current step in onboarding
      userResponse,                // user's response during onboarding
      financialData = {},          // all financial data
      memory = {},                 // persistent memory
      lastExchange,                // previous exchange for context
      userId                       // user identifier for memory updates
    } = body

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Fix: Use correct TypeScript types for date options
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long' as const, 
      year: 'numeric' as const, 
      month: 'long' as const, 
      day: 'numeric' as const 
    })

    // Helper to normalize to monthly
    const toMonthly = (amount: number, frequency: string): number => {
      if (frequency === 'weekly') return amount * 4.33
      if (frequency === 'fortnightly') return amount * 2.17
      if (frequency === 'yearly') return amount / 12
      return amount // monthly default
    }

    // Build financial context from user data
    const buildFinancialContext = () => {
      const data = financialData as FinancialData
      
      if (!data || Object.keys(data).length === 0) {
        return 'No financial data provided yet.'
      }
      
      const income = data.income || []
      const expenses = data.expenses || []
      const debts = data.debts || []
      const goals = data.goals || []
      const assets = data.assets || []
      const liabilities = data.liabilities || []
      
      let context = '=== CURRENT FINANCIAL SNAPSHOT ===\n'

      // Income
      if (income.length > 0) {
        let totalIncome = 0
        let passiveIncome = 0
        income.forEach((i: IncomeItem) => {
          const amt = typeof i.amount === 'string' ? parseFloat(i.amount) : i.amount
          const monthly = toMonthly(amt, i.frequency)
          totalIncome += monthly
          if (i.type === 'passive') passiveIncome += monthly
        })
        context += `\nINCOME: $${totalIncome.toFixed(0)}/month (Passive: $${passiveIncome.toFixed(0)})\n`
        income.slice(0, 5).forEach((i: IncomeItem) => {
          context += `  - ${i.name}: $${i.amount}/${i.frequency} (${i.type})\n`
        })
        if (income.length > 5) context += `  ... and ${income.length - 5} more income sources\n`
      }

      // Expenses
      if (expenses.length > 0) {
        const totalExpenses = expenses.reduce((sum: number, e: ExpenseItem) => {
          const amt = typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount
          return sum + toMonthly(amt, e.frequency)
        }, 0)
        context += `\nEXPENSES: $${totalExpenses.toFixed(0)}/month\n`
        expenses.slice(0, 8).forEach((e: ExpenseItem) => {
          context += `  - ${e.name}: $${e.amount}/${e.frequency}${e.category ? ` [${e.category}]` : ''}\n`
        })
        if (expenses.length > 8) context += `  ... and ${expenses.length - 8} more expenses\n`
      }

      // Debts
      if (debts.length > 0) {
        const totalDebt = debts.reduce((sum: number, d: DebtItem) => {
          const balance = typeof d.balance === 'string' ? parseFloat(d.balance) : d.balance
          return sum + balance
        }, 0)
        const monthlyDebtPayments = debts.reduce((sum: number, d: DebtItem) => {
          const minPayment = typeof d.minPayment === 'string' ? parseFloat(d.minPayment) : d.minPayment
          return sum + minPayment
        }, 0)
        context += `\nDEBTS: $${totalDebt.toFixed(0)} total, $${monthlyDebtPayments.toFixed(0)}/month in payments\n`
        debts.forEach((d: DebtItem) => {
          context += `  - ${d.name}: $${d.balance} @ ${d.interestRate}% (min: $${d.minPayment}/mo)\n`
        })
      }

      // Goals
      if (goals.length > 0) {
        context += `\nGOALS:\n`
        goals.forEach((g: GoalItem) => {
          const saved = typeof g.saved === 'string' ? parseFloat(g.saved) : g.saved
          const target = typeof g.target === 'string' ? parseFloat(g.target) : g.target
          const progress = target > 0 ? (saved / target * 100).toFixed(0) : '0'
          const remaining = target - saved
          context += `  - ${g.name}: $${saved.toFixed(0)}/$${target.toFixed(0)} (${progress}%) - $${remaining.toFixed(0)} to go\n`
          if (g.deadline) context += `    Deadline: ${g.deadline}\n`
        })
      }

      // Assets & Liabilities
      if (assets.length > 0) {
        const totalAssets = assets.reduce((sum: number, a: AssetItem) => {
          const value = typeof a.value === 'string' ? parseFloat(a.value) : a.value
          return sum + value
        }, 0)
        context += `\nASSETS: $${totalAssets.toFixed(0)} total\n`
        assets.slice(0, 5).forEach((a: AssetItem) => {
          context += `  - ${a.name}: $${a.value} (${a.type})\n`
        })
      }

      if (liabilities.length > 0) {
        const totalLiabilities = liabilities.reduce((sum: number, l: LiabilityItem) => {
          const value = typeof l.value === 'string' ? parseFloat(l.value) : l.value
          return sum + value
        }, 0)
        context += `\nLIABILITIES: $${totalLiabilities.toFixed(0)} total\n`
      }

      // Key metrics
      const totalIncome = income.reduce((sum: number, i: IncomeItem) => {
        const amt = typeof i.amount === 'string' ? parseFloat(i.amount) : i.amount
        return sum + toMonthly(amt, i.frequency)
      }, 0)

      const totalExpenses = expenses.reduce((sum: number, e: ExpenseItem) => {
        const amt = typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount
        return sum + toMonthly(amt, e.frequency)
      }, 0)

      const totalDebtPayments = debts.reduce((sum: number, d: DebtItem) => {
        const minPayment = typeof d.minPayment === 'string' ? parseFloat(d.minPayment) : d.minPayment
        return sum + minPayment
      }, 0)
      
      const surplus = totalIncome - totalExpenses - totalDebtPayments
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0

      const passiveIncome = income
        .filter((i: IncomeItem) => i.type === 'passive')
        .reduce((sum: number, i: IncomeItem) => {
          const amt = typeof i.amount === 'string' ? parseFloat(i.amount) : i.amount
          return sum + toMonthly(amt, i.frequency)
        }, 0)

      const passiveCoverage = totalExpenses > 0 ? (passiveIncome / totalExpenses * 100) : 0
      const fireNumber = (totalExpenses * 12) * 25
      
      let emergencyFundMonths = 0
      if (data.savings) {
        const savings = typeof data.savings === 'string' ? parseFloat(data.savings) : data.savings
        emergencyFundMonths = totalExpenses > 0 ? savings / totalExpenses : 0
      }

      context += `\n=== KEY METRICS ===\n`
      context += `Monthly Surplus: $${surplus.toFixed(0)}\n`
      context += `Savings Rate: ${savingsRate.toFixed(1)}%\n`
      context += `Passive Income Coverage: ${passiveCoverage.toFixed(1)}%\n`
      context += `Emergency Fund: ${emergencyFundMonths.toFixed(1)} months\n`
      context += `FIRE Number: $${fireNumber.toFixed(0)}\n`

      return context
    }

    const buildMemoryContext = () => {
      const mem = memory as UserMemory
      
      if (!mem || Object.keys(mem).length === 0) {
        return '\n=== WHAT I REMEMBER ABOUT YOU ===\nNo memories stored yet. Ask questions to learn about them!\n'
      }
      
      let context = '\n=== WHAT I REMEMBER ABOUT YOU ===\n'
      context += `Last updated: ${mem.lastUpdated || 'Unknown'}\n`

      if (mem.name) context += `\nName: ${mem.name}\n`

      // Fix: Properly handle potentially undefined lifeEvents
      const lifeEvents = mem.lifeEvents || []
      if (lifeEvents.length > 0) {
        context += '\n📅 IMPORTANT DATES:\n'
        // Sort by date, show upcoming first
        const sorted = [...lifeEvents].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        sorted.forEach((event: LifeEvent) => {
          const eventDate = new Date(event.date)
          const todayDate = new Date()
          const daysUntil = Math.ceil((eventDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))
          const upcoming = daysUntil > 0 && daysUntil < 30 ? ' 🔜' : ''
          context += `  - ${event.name}: ${event.date}${event.budget ? ` ($${event.budget})` : ''}${upcoming}\n`
        })
      }

      // Fix: Properly handle potentially undefined patterns
      const patterns = mem.patterns || []
      if (patterns.length > 0) {
        context += '\n📊 PATTERNS I\'VE NOTICED:\n'
        patterns.slice(-5).forEach((p: string) => context += `  - ${p}\n`)
      }

      if (mem.preferences) {
        context += '\n⚙️ YOUR PREFERENCES:\n'
        if (mem.preferences.communicationStyle) {
          context += `  - Communication: ${mem.preferences.communicationStyle}\n`
        }
        if (mem.preferences.checkInFrequency) {
          context += `  - Check-ins: ${mem.preferences.checkInFrequency}\n`
        }
        if (mem.preferences.motivators?.length) {
          context += `  - Motivated by: ${mem.preferences.motivators.join(', ')}\n`
        }
      }

      // Fix: Properly handle potentially undefined notes
      const notes = mem.notes || []
      if (notes.length > 0) {
        context += '\n📝 RECENT NOTES:\n'
        notes.slice(-3).forEach((n: string) => context += `  - ${n}\n`)
      }

      context += '\n⚠️ IMPORTANT: If the user shares NEW personal information (dates, events, preferences, patterns), ALWAYS include it in memoryUpdates.\n'
      
      return context
    }

    // Build conversation context from last exchange
    const buildConversationContext = () => {
      if (!lastExchange) return ''
      const exchange = lastExchange as LastExchange
      return `
=== PREVIOUS EXCHANGE ===
User said: "${exchange.userMessage}"
You responded with: ${JSON.stringify(exchange.aiResponse)}
`
    }

    // Create system prompt based on mode
    let systemPrompt = `You are Aureus, a warm, friendly, and genuinely helpful financial companion. Today is ${today}.

${FINANCIAL_FRAMEWORKS}

${buildFinancialContext()}
${buildMemoryContext()}
${buildConversationContext()}

`

    // Add mode-specific instructions
    if (mode === 'onboarding') {
      systemPrompt += `
You're currently onboarding a new user at step: ${onboardingStep}

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

Your personality during onboarding:
- Warm and encouraging, like a supportive friend
- Use casual language, occasional emojis
- Celebrate small wins, don't judge
- Keep responses SHORT - 2-3 sentences max, then ask ONE question

Respond with JSON in this format:
{
  "message": "Your conversational response",
  "nextStep": "the next onboarding step (or same step if need more info)",
  "extractedData": { any data to save from their response },
  "isComplete": false,
  "memoryUpdates": { 
    "name": "if you learned their name",
    "preferences": { any preferences they mentioned },
    "notes": ["any important context to remember"]
  }
}`
    } 
    else if (mode === 'proactive') {
      systemPrompt += `
You're being proactive - analyze their situation and give the most important insight RIGHT NOW.

Consider:
1. Where are they on the Baby Steps? Next milestone?
2. How close to escaping the rat race (passive income vs expenses)?
3. Any upcoming life events in the next 30 days?
4. Any warning signs (overspending, upcoming bills, low surplus)?
5. Any wins to celebrate?

Rules:
- Lead with what matters TODAY
- Reference their actual numbers
- Keep it to 2-3 sentences MAX
- Be warm but direct

Respond with JSON:
{
  "greeting": "A short personalized greeting",
  "insight": "Your main proactive insight", 
  "suggestion": "An optional actionable suggestion",
  "alerts": ["any urgent items as short strings"],
  "currentStep": "Their current Baby Step or FIRE progress",
  "mood": "positive" | "neutral" | "warning",
  "memoryUpdates": { any new patterns or observations }
}`
    } 
    else {
      // Question mode
      systemPrompt += `
You're answering a question from the user. Use their actual numbers, reference Baby Steps or FIRE when relevant.

Rules:
- Use their actual numbers in responses
- Be specific and actionable
- Keep responses concise (3-5 sentences)
- Confirm any changes they want to make
- Be encouraging but honest

Question: ${question || 'Hello!'}

Respond with JSON:
{
  "message": "Your helpful response",
  "memoryUpdates": { 
    "patterns": ["any new spending patterns noticed"],
    "notes": ["any important context from this conversation"],
    "preferences": { any communication preferences they mention }
  },
  "alerts": ["any important alerts based on this question"]
}`
    }

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.7,
        messages: [{ 
          role: 'user', 
          content: mode === 'onboarding' 
            ? `User response: "${userResponse || 'Just started onboarding'}"\n\nCurrent data: ${JSON.stringify(memory || {})}`
            : mode === 'proactive'
            ? 'Generate a proactive insight for me right now.'
            : question || 'Hello!'
        }],
        system: systemPrompt
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('Anthropic API error:', data)
      return NextResponse.json(
        { error: data.error?.message || 'Request failed' }, 
        { status: response.status }
      )
    }

    const responseText = data.content?.[0]?.text || ''
    
    // Parse response with fallback
    let parsedResponse: AureusResponse
    try {
      parsedResponse = JSON.parse(responseText)
    } catch (e) {
      // If JSON parsing fails, wrap the text in a standard format
      parsedResponse = {
        message: responseText,
        memoryUpdates: {}
      }
    }

    // If there are memory updates, save them to the database
    if (parsedResponse.memoryUpdates && Object.keys(parsedResponse.memoryUpdates).length > 0 && userId) {
      try {
        // Don't await this - fire and forget to not block response
        saveMemoryUpdates(userId, parsedResponse.memoryUpdates).catch(console.error)
      } catch (error) {
        console.error('Failed to save memory updates:', error)
        // Continue even if memory save fails - don't break the user experience
      }
    }

    return NextResponse.json({
      ...parsedResponse,
      timestamp: new Date().toISOString(),
      _raw: process.env.NODE_ENV === 'development' ? responseText : undefined // Only in dev
    })

  } catch (error) {
    console.error('Budget coach error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'I apologize, but I encountered an error. Please try again.',
        memoryUpdates: {}
      }, 
      { status: 500 }
    )
  }
}

// Helper function to save memory updates to your database
async function saveMemoryUpdates(userId: string, updates: MemoryUpdate): Promise<void> {
  // This is where you'd implement your database logic
  // Example with Prisma:
  /*
  await prisma.userMemory.upsert({
    where: { userId },
    update: {
      lifeEvents: { push: updates.lifeEvents },
      patterns: { push: updates.patterns },
      notes: { push: updates.notes },
      preferences: updates.preferences ? { ...updates.preferences } : undefined,
      lastUpdated: new Date().toISOString()
    },
    create: {
      userId,
      lifeEvents: updates.lifeEvents || [],
      patterns: updates.patterns || [],
      notes: updates.notes || [],
      preferences: updates.preferences || {},
      lastUpdated: new Date().toISOString()
    }
  })
  */
  
  // For now, just log
  console.log(`Saving memory updates for user ${userId}:`, updates)
  
  // You could also call your own API endpoint
  const appUrl = process.env.APP_URL || 'http://localhost:3000'
  try {
    await fetch(`${appUrl}/api/update-memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, updates })
    })
  } catch (error) {
    console.error('Error calling memory update endpoint:', error)
  }
}
