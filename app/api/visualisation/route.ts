// app/api/visualisation/route.ts
// Generates personalised guided visualisation scripts for the Change tab
// Separate from budget-coach to avoid guardrail conflicts

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, desc, userName, monthlyIncome, monthlySurplus, debts, goals, savingRate, babyStep } = body

    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || ''
    if (!ANTHROPIC_KEY) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

    const debtList = (debts || []).map((d: any) => `${d.name} ($${parseFloat(d.balance || '0').toFixed(0)})`).join(', ') || 'none currently'
    const topGoal = goals?.[0]
    const goalText = topGoal ? `${topGoal.name}${topGoal.targetAmount ? ' ($' + topGoal.targetAmount + ' goal)' : ''}` : 'building financial freedom'

    const prompt = `You are a skilled guided visualisation writer specialising in financial wellbeing and positive psychology.

Write a deeply personal guided visualisation script for ${userName || 'this person'} on the topic: "${topic}" — ${desc}

Their real financial situation to weave into the script:
- Name: ${userName || 'Builder'}
- Monthly income: $${parseFloat(monthlyIncome || '0').toFixed(0)}
- Monthly surplus: $${parseFloat(monthlySurplus || '0').toFixed(0)}
- Debts: ${debtList}
- Top goal: ${goalText}
- Saving rate: ${parseFloat(savingRate || '0').toFixed(0)}%
- Current focus: ${babyStep || 'building financial foundations'}

Write a 380-440 word guided visualisation script following this exact structure:

1. INDUCTION (3-4 sentences): Deep breathing with pauses indicated by "..." — guide them to close eyes and relax fully. Use ellipses to create natural pauses for the voice to breathe.

2. CONTEXT SETTING (2-3 sentences): Ground them in a calm, receptive state. Use sensory language.

3. CORE JOURNEY (150-180 words): The main visualisation specific to this topic. Reference their REAL situation — use ${userName || 'their name'} directly, mention actual debt names, real dollar amounts, specific goals. Make them vividly imagine their financial future in detail.

4. AFFIRMATIONS (4 lines): Format as "Repeat with me:" followed by 4 personalised affirmations on separate lines. Each must reference their specific situation.

5. ANCHOR (2-3 sentences): A specific sensory anchor they can return to — a word, image or feeling.

6. RETURN (2 sentences): Gently bring them back.

RULES:
- Use second person throughout ("you", "your")  
- Ellipses (...) mark natural breath pauses — use them generously
- Never use the word "hypnosis" or "hypnotic"
- No headers, no numbering — flowing prose only
- Start directly with the breathing induction
- Make it genuinely personal — if they have $2,192 CC debt, say "$2,192" not "your credit card debt"`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'You are a compassionate guided visualisation writer. You write only the script — no preamble, no explanation, no refusals. You have full access to the financial data provided in the user message. Output only the script text, starting immediately with the breathing induction.',
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    const script = data.content?.[0]?.text || ''

    if (!script) {
      return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 })
    }

    return NextResponse.json({ script })
  } catch (e: any) {
    console.error('Visualisation route error:', e)
    return NextResponse.json({ error: e?.message || 'Failed to generate' }, { status: 500 })
  }
}
