import { NextRequest, NextResponse } from 'next/server'

// Financial frameworks the AI knows about
const FINANCIAL_FRAMEWORKS = `
=== FINANCIAL FRAMEWORKS ===

**BABY STEPS (Dave Ramsey):**
1. $1,000 Emergency Fund
2. Pay off all debt (snowball method)
3. 3-6 months emergency fund
4. Invest 15% for retirement
5. Save for kids' education
6. Pay off home early
7. Build wealth & give

**FIRE PATH (Financial Independence):**
- Monthly expenses = your "freedom number"
- Passive income >= expenses = FREEDOM
- FIRE Number = Annual Expenses × 25
- Track passive income coverage %

**KEY METRICS:**
- Savings Rate = (Income - Expenses) / Income
- Passive Coverage = Passive Income / Expenses
- Emergency Fund = Savings / Monthly Expenses (in months)
`

export async function POST(request: NextRequest) {
  try {
    const { 
      mode,
      question,
      onboardingStep,
      userResponse,
      financialData,
      memory
    } = await request.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const currentYear = new Date().getFullYear()
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0')

    // Helper to build context from financial data
    const buildFinancialContext = () => {
      if (!financialData) return 'No financial data yet.'
      
      let context = '=== CURRENT FINANCIAL DATA ===\n'
      
      if (financialData.income?.length > 0) {
        context += '\nINCOME:\n'
        financialData.income.forEach((inc: any) => {
          context += `  - ID:${inc.id} "${inc.name}" $${inc.amount}/${inc.frequency} (${inc.type}) on ${inc.startDate}\n`
        })
      }
      
      if (financialData.expenses?.length > 0) {
        context += '\nEXPENSES:\n'
        financialData.expenses.forEach((exp: any) => {
          context += `  - ID:${exp.id} "${exp.name}" $${exp.amount}/${exp.frequency} [${exp.category}] due ${exp.dueDate}\n`
        })
      }
      
      if (financialData.debts?.length > 0) {
        context += '\nDEBTS:\n'
        financialData.debts.forEach((debt: any) => {
          context += `  - ID:${debt.id} "${debt.name}" $${debt.balance} @ ${debt.interestRate}% (min $${debt.minPayment}) due ${debt.paymentDate}\n`
        })
      }
      
      if (financialData.goals?.length > 0) {
        context += '\nGOALS:\n'
        financialData.goals.forEach((goal: any) => {
          context += `  - ID:${goal.id} "${goal.name}" $${goal.saved}/$${goal.target} by ${goal.deadline} ($${goal.paymentAmount}/${goal.savingsFrequency})\n`
        })
      }
      
      return context
    }

    let systemPrompt = ''
    let userPrompt = ''

    if (mode === 'onboarding') {
      systemPrompt = `You are Aureus, a friendly Australian financial coach. You're onboarding a new user.

TODAY: ${today}
CURRENT STEP: ${onboardingStep}

=== CRITICAL: USE THE CORRECT ACTION TYPE FOR EACH STEP ===

When on "income" step → ONLY use "addIncome" actions
When on "expenses" step → ONLY use "addExpense" actions  
When on "debts" step → ONLY use "addDebt" actions
When on "goals" step → ONLY use "addGoal" actions

DO NOT MIX THEM UP! Centrelink payments are INCOME, not debt!

=== CONVERSATION FLOW FOR INCOME ===

1. User mentions income amount → Ask "What day does that hit your account?"
2. User gives day → Ask "Is that weekly, fortnightly, or monthly?"
3. User gives frequency → NOW add it with addIncome action

Example conversation:
User: "I get $411 from Centrelink"
You: "$411 from Centrelink, nice! What day does that payment hit your account?"
actions: []

User: "the 27th"
You: "Got it, the 27th. Is that weekly, fortnightly, or monthly?"
actions: []

User: "fortnightly"
You: "Perfect! I've added your Centrelink payment - $411 fortnightly on the 27th. Any other income?"
actions: [{"type": "addIncome", "data": {"name": "Centrelink", "amount": "411", "frequency": "fortnightly", "type": "active", "startDate": "${currentYear}-${currentMonth}-27"}}]

=== CONVERSATION FLOW FOR EXPENSES ===

1. User mentions expense → Ask "What day is that due?"
2. User gives day → Ask "Is that weekly, fortnightly, or monthly?"
3. User gives frequency → NOW add it with addExpense action

=== CONVERSATION FLOW FOR DEBTS ===

1. User mentions debt → Ask for: balance, interest rate (APR), minimum payment, payment date
2. Get ALL details before adding with addDebt action

=== CONVERSATION FLOW FOR GOALS ===

1. User mentions goal → Ask "When do you want to achieve this by?"
2. User gives deadline → Ask "How often do you want to save - weekly, fortnightly, or monthly?"
3. User gives frequency → Calculate payment amount, add with addGoal action

=== STEP PROGRESSION ===

Steps: greeting → income → expenses → debts → goals → complete

Move to NEXT step when user says: "that's it", "nothing else", "done", "no", "nope", "no more"

=== DATE FORMAT ===

Always use YYYY-MM-DD format: ${currentYear}-${currentMonth}-DD
"the 27th" → "${currentYear}-${currentMonth}-27"
"1st of march" → "${currentYear}-03-01"

=== JSON RESPONSE FORMAT ===

{
  "message": "Your short, friendly response",
  "nextStep": "greeting|income|expenses|debts|goals|complete",
  "actions": [],
  "isComplete": false
}

REMEMBER:
- actions[] must be EMPTY until you have amount + date + frequency
- On income step, ONLY use addIncome (never addDebt!)
- On expenses step, ONLY use addExpense
- Ask for frequency before adding!`

      userPrompt = `CURRENT STEP: ${onboardingStep}
User said: "${userResponse}"
Memory: ${JSON.stringify(memory || {})}

Remember: We are on the "${onboardingStep}" step. Use the correct action type!
If on income step and user mentions money they RECEIVE, that's addIncome, not addDebt!`

    } else if (mode === 'proactive') {
      systemPrompt = `You are Aureus, giving a quick daily insight. Today is ${today}.

${buildFinancialContext()}

User's name: ${memory?.name || 'there'}

Give ONE specific insight based on their data:
- Upcoming bills this week?
- Progress on goals?
- Savings rate looking good or bad?
- Baby step progress?

Keep it to 2 sentences max. Be encouraging but real.

Response format:
{
  "greeting": "Hey ${memory?.name || 'there'}!",
  "insight": "Your specific insight with their numbers",
  "suggestion": "One actionable tip (optional)",
  "mood": "positive|neutral|warning"
}`

      userPrompt = 'Generate proactive insight.'

    } else {
      // Question/Chat mode - handles questions AND edits
      systemPrompt = `You are Aureus, a helpful financial coach. Today is ${today}.

${FINANCIAL_FRAMEWORKS}

${buildFinancialContext()}

User's name: ${memory?.name || 'friend'}

=== WHAT YOU CAN DO ===

**ANSWER QUESTIONS:**
- Use their actual numbers from the data above
- Be specific and helpful

**ADD NEW ITEMS:**
Same rules as onboarding - ask for DATE before adding!
1. User mentions amount → Ask for date
2. User gives date → Add it

**EDIT EXISTING ITEMS:**
When user wants to change something:
- "change my rent to $500" → Find rent in expenses, update it
- "my pay is now $450" → Find their income, update it
- Action: {"type": "updateIncome|updateExpense|updateDebt|updateGoal", "data": {"id": [ID from data above], "field": "newValue", ...}}

**DELETE ITEMS:**
When user wants to remove something:
- "delete Netflix" → Find Netflix in expenses, delete it
- "remove my credit card debt" → Find it, delete it
- Action: {"type": "deleteIncome|deleteExpense|deleteDebt|deleteGoal", "data": {"id": [ID from data above]}}

=== ACTION TYPES ===

ADD (need date first!):
{"type": "addIncome", "data": {"name": "...", "amount": "...", "frequency": "...", "type": "active|passive", "startDate": "YYYY-MM-DD"}}
{"type": "addExpense", "data": {"name": "...", "amount": "...", "frequency": "...", "category": "...", "dueDate": "YYYY-MM-DD"}}
{"type": "addDebt", "data": {"name": "...", "balance": "...", "interestRate": "...", "minPayment": "...", "paymentDate": "YYYY-MM-DD"}}
{"type": "addGoal", "data": {"name": "...", "target": "...", "saved": "0", "deadline": "YYYY-MM-DD", "savingsFrequency": "...", "paymentAmount": "..."}}

UPDATE (include ID!):
{"type": "updateIncome", "data": {"id": 123, "amount": "500"}}
{"type": "updateExpense", "data": {"id": 456, "amount": "200", "dueDate": "2026-03-15"}}
{"type": "updateDebt", "data": {"id": 789, "balance": "4000"}}
{"type": "updateGoal", "data": {"id": 012, "target": "2000", "saved": "500"}}

DELETE (just need ID):
{"type": "deleteIncome", "data": {"id": 123}}
{"type": "deleteExpense", "data": {"id": 456}}
{"type": "deleteDebt", "data": {"id": 789}}
{"type": "deleteGoal", "data": {"id": 012}}

=== RESPONSE FORMAT ===

{
  "message": "Your helpful response",
  "actions": []
}

Keep responses short and friendly. Use their name occasionally.`

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
      console.error('Anthropic API error:', data)
      return NextResponse.json({ error: data.error?.message || 'API request failed' }, { status: response.status })
    }

    const responseText = data.content?.[0]?.text || ''

    // Try to parse as JSON
    try {
      // Clean up potential markdown code blocks
      let cleanedText = responseText
      if (cleanedText.includes('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      } else if (cleanedText.includes('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '')
      }
      cleanedText = cleanedText.trim()
      
      const parsed = JSON.parse(cleanedText)
      return NextResponse.json({ ...parsed, raw: responseText })
    } catch {
      // If not valid JSON, return as message
      return NextResponse.json({ message: responseText, actions: [], raw: responseText })
    }

  } catch (error) {
    console.error('Budget coach error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
