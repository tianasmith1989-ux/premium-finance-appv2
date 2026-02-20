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
      conversationHistory,
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
      
      // Calculate totals for the AI - use simple intuitive conversions
      let totalIncomeFortnightly = 0
      let totalExpensesFortnightly = 0
      let totalDebtPaymentsFortnightly = 0
      let totalGoalSavingsFortnightly = 0
      
      // Simple conversions that match how people actually think about money
      const convertToFortnightly = (amount: number, frequency: string) => {
        if (frequency === 'weekly') return amount * 2          // 2 weeks
        if (frequency === 'fortnightly') return amount         // already fortnightly
        if (frequency === 'monthly') return amount / 2         // half a month
        if (frequency === 'quarterly') return amount / 6       // ~6 fortnights in a quarter
        if (frequency === 'yearly') return amount / 26         // 26 fortnights in a year
        return amount
      }
      
      if (financialData.income?.length > 0) {
        context += '\nINCOME:\n'
        financialData.income.forEach((inc: any) => {
          const amount = parseFloat(inc.amount || '0')
          totalIncomeFortnightly += convertToFortnightly(amount, inc.frequency)
          context += `  - "${inc.name}" $${inc.amount}/${inc.frequency} on ${inc.startDate}\n`
        })
      }
      
      if (financialData.expenses?.length > 0) {
        context += '\nEXPENSES:\n'
        financialData.expenses.forEach((exp: any) => {
          const amount = parseFloat(exp.amount || '0')
          totalExpensesFortnightly += convertToFortnightly(amount, exp.frequency)
          context += `  - "${exp.name}" $${exp.amount}/${exp.frequency} due ${exp.dueDate}\n`
        })
      }
      
      if (financialData.debts?.length > 0) {
        context += '\nDEBTS (payments come out of budget!):\n'
        financialData.debts.forEach((debt: any) => {
          const payment = parseFloat(debt.minPayment || '0')
          totalDebtPaymentsFortnightly += convertToFortnightly(payment, debt.frequency || 'monthly')
          context += `  - "${debt.name}" owes $${debt.balance} @ ${debt.interestRate}% → PAYMENT: $${debt.minPayment}/${debt.frequency || 'monthly'}\n`
        })
      }
      
      if (financialData.goals?.length > 0) {
        context += '\nGOALS (savings come out of budget!):\n'
        financialData.goals.forEach((goal: any) => {
          const payment = parseFloat(goal.paymentAmount || '0')
          totalGoalSavingsFortnightly += convertToFortnightly(payment, goal.savingsFrequency || 'monthly')
          context += `  - "${goal.name}" $${goal.saved}/$${goal.target} → SAVING: $${goal.paymentAmount}/${goal.savingsFrequency}\n`
        })
      }
      
      // Add calculated summary
      const netFortnightly = totalIncomeFortnightly - totalExpensesFortnightly - totalDebtPaymentsFortnightly - totalGoalSavingsFortnightly
      
      context += '\n=== FORTNIGHTLY BUDGET SUMMARY ===\n'
      context += `Income: $${totalIncomeFortnightly.toFixed(0)}/fortnight\n`
      context += `Expenses: $${totalExpensesFortnightly.toFixed(0)}/fortnight\n`
      context += `Debt Payments: $${totalDebtPaymentsFortnightly.toFixed(0)}/fortnight\n`
      context += `Goal Savings: $${totalGoalSavingsFortnightly.toFixed(0)}/fortnight\n`
      context += `NET AVAILABLE: $${netFortnightly.toFixed(0)}/fortnight\n`
      context += '\n⚠️ IMPORTANT: When giving budget summaries, ALWAYS include debt payments AND goal savings as outgoings!\n'
      
      return context
    }

    let systemPrompt = ''
    let userPrompt = ''

    if (mode === 'onboarding') {
      systemPrompt = `You are Aureus, a friendly Australian financial coach helping "${memory?.name || 'a new user'}" set up their budget.

TODAY: ${today}
CURRENT STEP: ${onboardingStep}

=== ALREADY IN SYSTEM ===
${buildFinancialContext()}

=== RECENT CONVERSATION ===
${conversationHistory || 'No previous messages'}

=== CRITICAL: ACTIONS ARRAY ===

When you say you're adding something, you MUST include it in the actions array!
If you say "Adding credit card" but actions: [] is empty, IT WON'T BE ADDED!

WRONG: "I'll add these now" with actions: []
RIGHT: "Added!" with actions: [{...}, {...}, {...}]

=== STEP: ${onboardingStep} ===

${onboardingStep === 'greeting' ? `
Get their name.
Action: {"type": "setMemory", "data": {"name": "TheirName"}}
` : ''}

${onboardingStep === 'income' ? `
Collect: source, amount, date (day of month), frequency
DON'T add until you have ALL 4 pieces of info!

When ready:
{"type": "addIncome", "data": {"name": "Centrelink", "amount": "411", "frequency": "fortnightly", "type": "active", "startDate": "${currentYear}-${currentMonth}-27"}}
` : ''}

${onboardingStep === 'expenses' ? `
Collect: name, amount, date (day of month), frequency
Can add MULTIPLE expenses at once if user gives several!

IMPORTANT - WHAT GOES WHERE:
- EXPENSES: Rent, groceries, phone, utilities, subscriptions, child support, transport
- NOT EXPENSES: Credit card payments, loan payments → These go in DEBTS section

If user says "credit card $120/month" → Tell them: "I'll track that in the debts section - we'll get to that next! Any other regular bills?"

When ready (regular expenses only):
{"type": "addExpense", "data": {"name": "Rent", "amount": "200", "frequency": "weekly", "category": "housing", "dueDate": "${currentYear}-${currentMonth}-27"}}
{"type": "addExpense", "data": {"name": "Child Support", "amount": "60", "frequency": "fortnightly", "category": "other", "dueDate": "${currentYear}-${currentMonth}-27"}}

Categories: housing, utilities, food, transport, subscriptions, health, entertainment, other
` : ''}

${onboardingStep === 'debts' ? `
Collect: name, total BALANCE owed, APR %, minimum payment, payment date

IMPORTANT: The minimum payment is tracked HERE - don't also add it as an expense!
When user says "I pay $120/month on my credit card" and the balance is $3000:
- Add as DEBT with minPayment: "120"
- This payment will show in the budget automatically

If they mentioned a credit card payment during expenses step, use that amount as minPayment.

When ready:
{"type": "addDebt", "data": {"name": "Credit Card", "balance": "3000", "interestRate": "20", "minPayment": "120", "paymentDate": "${currentYear}-${currentMonth}-27"}}
` : ''}

${onboardingStep === 'goals' ? `
Collect: goal name, target amount, how much they can save, frequency, START DATE

CRITICAL FOR GOALS:
- If user says "$50 a fortnight" → use paymentAmount: "50" EXACTLY
- Ask when to START saving (usually their payday)
- startDate = when payments begin (e.g., "27th" = their payday)

Example:
User: "save $1000, I can put $50 a fortnight towards it"
You: "Great goal! When would you like to start - your next payday on the 27th?"
actions: [] (need start date!)

User: "yes the 27th"
You: "Perfect! $50 fortnightly starting the 27th. You'll reach $1000 in about 10 months!"
actions: [{"type": "addGoal", "data": {"name": "Emergency Fund", "target": "1000", "saved": "0", "deadline": "${currentYear}-12-27", "savingsFrequency": "fortnightly", "paymentAmount": "50", "startDate": "${currentYear}-${currentMonth}-27"}}]

DON'T recalculate their payment amount - use what they said!
` : ''}

=== DATE FORMAT ===
"27th" → "${currentYear}-${currentMonth}-27"
"1st" → "${currentYear}-${currentMonth}-01"
"15th of march" → "${currentYear}-03-15"

=== STEP PROGRESSION ===
greeting → income → expenses → debts → goals → complete
"no" / "done" / "thats it" = move to next step, actions: []

=== RESPONSE FORMAT ===
Raw JSON only (no markdown):
{"message": "Your response", "nextStep": "${onboardingStep}", "actions": [...], "isComplete": false}

REMEMBER: If you tell the user you're adding items, PUT THEM IN ACTIONS!`

      userPrompt = `Step: ${onboardingStep}
User said: "${userResponse}"

BEFORE RESPONDING:
1. Did user give enough info to add items? (name + amount + date + frequency)
2. If YES → Include the items in actions array!
3. If NO → Ask for missing info, actions: []
4. Is user done with this step? → Move to next, actions: []

Respond with JSON only.`

    } else if (mode === 'proactive') {
      systemPrompt = `You are Aureus, giving a quick daily insight. Today is ${today}.

${buildFinancialContext()}

User's name: ${memory?.name || 'there'}

=== CRITICAL: USE THE CORRECT NET FIGURE ===
The "FORTNIGHTLY BUDGET SUMMARY" above shows the CORRECT "NET AVAILABLE" amount.
This NET already accounts for: Income - Expenses - Debt Payments - Goal Savings

DO NOT calculate "income minus expenses" yourself - that ignores debt payments and goal savings!
ALWAYS use the NET AVAILABLE figure from the summary above.

=== YOUR TASK ===
Give a brief, encouraging insight. Mention:
- Upcoming bills/income
- Their NET available (from the summary above!)
- Progress toward goals or debt freedom

Keep it to 2-3 sentences. Be encouraging but accurate.

Response format:
{
  "greeting": "Hey ${memory?.name || 'there'}!",
  "insight": "Your specific insight using the NET AVAILABLE figure",
  "suggestion": "One actionable tip (optional)",
  "mood": "positive|neutral|warning"
}`

      userPrompt = 'Generate proactive insight. Remember to use the NET AVAILABLE figure from the budget summary, not income minus expenses!'

    } else {
      // Question/Chat mode - handles questions AND edits
      systemPrompt = `You are Aureus, a helpful financial coach. Today is ${today}.

${FINANCIAL_FRAMEWORKS}

${buildFinancialContext()}

User's name: ${memory?.name || 'friend'}

=== CRITICAL: BUDGET MATH ===
The "FORTNIGHTLY BUDGET SUMMARY" above shows pre-calculated totals.
ALWAYS use the "NET AVAILABLE" figure when discussing how much money is left.

NET AVAILABLE = Income - Expenses - Debt Payments - Goal Savings

DO NOT say "income minus expenses = available" - that's WRONG because it ignores debt payments and goal savings!

=== WHAT YOU CAN DO ===

**ANSWER QUESTIONS:**
- Use their actual numbers from the data above
- Use the NET AVAILABLE for "how much is left" questions
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
