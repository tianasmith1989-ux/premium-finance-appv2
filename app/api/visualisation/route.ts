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

    const isSnyderStyle = body.snyderStyle === true

    const prompt = isSnyderStyle
      ? `You are modelling the NLP coaching style of Dr. David Snyder — rapid, direct, authoritative, pattern-interrupt based. You use embedded commands, direct suggestions, state anchoring, and timeline collapse techniques.

Write a personalised NLP rapid change script for ${userName || 'this person'} on: "${topic}" — ${desc}

Their financial situation:
- Name: ${userName || 'Builder'}  
- Monthly income: $${parseFloat(monthlyIncome || '0').toFixed(0)}
- Monthly surplus: $${parseFloat(monthlySurplus || '0').toFixed(0)}
- Debts: ${debtList}
- Top goal: ${goalText}
- Saving rate: ${parseFloat(savingRate || '0').toFixed(0)}%

Write a 350-400 word NLP script that:
1. Opens with a sharp STOP or pattern interrupt — snyder always grabs attention immediately
2. Uses direct commands: "Notice...", "Feel...", "Now...", "RIGHT NOW..."  
3. Includes a specific state-anchoring instruction (thumb + finger, fist, etc)
4. Uses the "step into" or "timeline collapse" technique specific to finances
5. Has 4 direct affirmation commands in first person present tense
6. References their REAL numbers — mention ${userName || 'their name'}, actual debts by name, real dollar amounts
7. Ends with "fire the anchor" and eyes open
8. Snyder's pace: fast, no fluff, every word has a job
9. Occasional ALL CAPS for emphasis like Snyder uses

Output ONLY the script. No preamble. Start with the pattern interrupt.`
      : `You are a skilled guided visualisation writer specialising in financial wellbeing and positive psychology.

Write a deeply personal guided visualisation script for ${userName || 'this person'} on the topic: "${topic}" — ${desc}`

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
        max_tokens: 1100,
        system: isSnyderStyle ? 'You are an expert NLP coach modelling Dr. David Snyder. You write rapid, direct, pattern-interrupt scripts. No preamble, no refusals, no explanations. Output only the script, starting immediately with the pattern interrupt.' : 'You are a compassionate guided visualisation writer. You write only the script — no preamble, no explanation, no refusals. You have full access to the financial data provided in the user message. Output only the script text, starting immediately with the breathing induction.',
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
