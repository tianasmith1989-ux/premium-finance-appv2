// ============================================================
// ADD THIS FILE TO: app/api/meal-plan/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { people, budget, dietaryNeeds, dislikes, useDetailedPricing, catalogText } = body

    const systemPrompt = `You are a practical Australian meal planning assistant. You create realistic, budget-conscious 7-day meal plans for Australian families. You know current Woolworths, Coles, and Aldi prices. You respond ONLY with structured meal plan content — no financial advice, no preamble, no sign-off.`

    const userPrompt = [
      `Create a 7-day meal plan.`,
      `Household: ${people} people | Weekly grocery budget: $${budget} AUD`,
      dislikes ? `Avoid: ${dislikes}` : '',
      dietaryNeeds ? `Dietary needs: ${dietaryNeeds}` : '',
      useDetailedPricing ? `Use realistic 2024-25 AU supermarket prices (Woolworths/Coles/Aldi home-brand where possible).` : '',
      catalogText ? `\nThis week's catalog specials:\n${String(catalogText).slice(0, 600)}` : '',
      ``,
      `Format your response EXACTLY like this — no extra text before or after:`,
      ``,
      `**Estimated weekly cost: $X | Savings vs eating out: ~$Y**`,
      ``,
      `## Monday`,
      `🌅 Breakfast: [meal] ~$X`,
      `☀️ Lunch: [meal] ~$X`,
      `🌙 Dinner: [meal] ~$X _(batch: leftovers note)_`,
      ``,
      `[Repeat for Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]`,
      ``,
      `## Shopping List`,
      `- [item] — [qty] ~$X`,
      ``,
      `## Budget Tips`,
      `- [tip]`,
    ].filter(Boolean).join('\n')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return NextResponse.json({ error: (err as any)?.error?.message || `API error ${response.status}` }, { status: 500 })
    }

    const data = await response.json()
    const text: string = (data.content || [])
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text)
      .join('')

    return NextResponse.json({ text })
  } catch (error: any) {
    console.error('Meal plan API error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to generate meal plan' }, { status: 500 })
  }
}
