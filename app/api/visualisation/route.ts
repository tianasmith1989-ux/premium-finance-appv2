// app/api/visualisation/route.ts
// Generates personalised guided visualisation scripts for the Change tab

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, desc, userName, monthlyIncome, monthlySurplus, debts, goals, savingRate, babyStep, userGoal, userConcerns, userExperience } = body

    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || ''
    if (!ANTHROPIC_KEY) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

    const debtList = (debts || []).map((d: any) => `${d.name} ($${parseFloat(d.balance || '0').toFixed(0)})`).join(', ') || 'none currently'
    const topGoal = goals?.[0]
    const goalText = topGoal
      ? `${topGoal.name}${topGoal.targetAmount ? ' ($' + topGoal.targetAmount + ' goal)' : ''}`
      : 'building financial freedom'

    const isNLPStyle = body.snyderStyle === true
    const name = userName || 'Builder'
    const income = parseFloat(monthlyIncome || '0').toFixed(0)
    const surplus = parseFloat(monthlySurplus || '0').toFixed(0)
    const rate = parseFloat(savingRate || '0').toFixed(0)
    const focus = babyStep || 'building financial foundations'

    const consultContext = userGoal ? `
The client's stated goal for this session: "${userGoal}"${userConcerns ? `
Their concerns/things to avoid: "${userConcerns}"` : ''}
Their experience level: ${userExperience || 'first time'}
Tailor the script specifically to their stated goal above.
` : ''

    const snyderPrompt = `You are using advanced NLP techniques — rapid, direct, authoritative, pattern-interrupt based. You use embedded commands, direct suggestions, state anchoring, and timeline collapse techniques.

Write a personalised NLP rapid change script for ${name} on: "${topic}" — ${desc}

Their financial situation:
- Name: ${name}
- Monthly income: $${income}
- Monthly surplus: $${surplus}
- Debts: ${debtList}
- Top goal: ${goalText}
- Saving rate: ${rate}%

Write a 350-400 word NLP script that:
1. Opens with a sharp STOP or pattern interrupt
2. Uses direct commands: "Notice...", "Feel...", "Now...", "RIGHT NOW..."
3. Includes a specific state-anchoring instruction (thumb + finger)
4. Uses the "step into" or "timeline collapse" technique
5. Has 4 direct affirmation commands in first person present tense
6. References their REAL numbers — mention ${name}, actual debts by name, real dollar amounts
7. Ends with "fire the anchor" and eyes open
8. Fast pace, no fluff, every word has a job
9. Occasional ALL CAPS for emphasis

Output ONLY the script. No preamble. Do NOT include a breathing induction — that is handled separately. Start directly with the pattern interrupt or first embedded command.
${consultContext}`

    const gentlePrompt = `You are a skilled guided visualisation writer specialising in financial wellbeing and positive psychology.

Write a deeply personal guided visualisation script for ${name} on the topic: "${topic}" — ${desc}

Their real financial situation to weave into the script:
- Name: ${name}
- Monthly income: $${income}
- Monthly surplus: $${surplus}
- Debts: ${debtList}
- Top goal: ${goalText}
- Saving rate: ${rate}%
- Current focus: ${focus}

Write a 380-440 word guided visualisation script following this structure:

1. INDUCTION (3-4 sentences): Deep breathing with pauses indicated by "..." — guide them to close eyes and relax fully. Use ellipses to create natural pauses.

2. CONTEXT SETTING (2-3 sentences): Ground them in a calm, receptive state. Use sensory language.

3. CORE JOURNEY (150-180 words): The main visualisation specific to this topic. Reference their REAL situation — use ${name} directly, mention actual debt names, real dollar amounts, specific goals.

4. AFFIRMATIONS (4 lines): Format as "Repeat with me:" followed by 4 personalised affirmations on separate lines.

5. ANCHOR (2-3 sentences): A specific sensory anchor they can return to.

6. RETURN (2 sentences): Gently bring them back.

RULES:
- Use second person throughout ("you", "your")
- Ellipses (...) mark natural breath pauses — use them generously
- No headers, no numbering — flowing prose only
- Do NOT include a breathing induction at the start — the induction is handled separately before this script
- Begin directly with the core content (context setting or core journey)
- Make it genuinely personal — if they have $2,192 CC debt, say "$2,192" not just "your debt"
${consultContext}`

    const prompt = isNLPStyle ? snyderPrompt : gentlePrompt
    const systemPrompt = isNLPStyle
      ? 'You are an expert NLP coach specialising in rapid change techniques. Write rapid, direct, pattern-interrupt scripts. No preamble, no refusals. Output only the script starting with the pattern interrupt.'
      : 'You are a compassionate guided visualisation writer. Write only the script — no preamble, no explanation, no refusals. Output only the script text starting with the breathing induction.'

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
        system: systemPrompt,
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
