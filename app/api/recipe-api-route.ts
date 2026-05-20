// app/api/recipe/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { meal, serves, budget, dislikes, dietaryNeeds } = await request.json()

    const systemPrompt = `You are a practical Australian home cooking assistant. You write clear, realistic recipes using ingredients available at Woolworths, Coles and Aldi. You give exact quantities, real Australian measurements, and practical cooking times. You respond ONLY with the recipe — no preamble, no sign-off.`

    const prompt = [
      `Write a complete recipe for: ${meal}`,
      `Serves: ${serves || 4} people`,
      dislikes ? `Exclude: ${dislikes}` : '',
      dietaryNeeds ? `Dietary needs: ${dietaryNeeds}` : '',
      budget ? `Budget-conscious — use affordable AU supermarket ingredients` : '',
      ``,
      `Use EXACTLY this format:`,
      ``,
      `# ${meal}`,
      `**Serves:** ${serves || 4} | **Prep:** X min | **Cook:** X min | **Total:** X min`,
      `**Estimated cost:** ~$X.XX for ${serves || 4} serves (~$X.XX per serve)`,
      ``,
      `## Ingredients`,
      `- X g / X cup / X tbsp [ingredient] (brand suggestion if relevant, e.g. "Coles home-brand")`,
      `[List every ingredient with exact quantities scaled for ${serves || 4} serves]`,
      ``,
      `## Method`,
      `1. [Clear step — include temperatures in °C and times in minutes]`,
      `2. [Next step]`,
      `[etc — as many steps as needed, each actionable and specific]`,
      ``,
      `## Tips`,
      `- [1-2 practical tips: storage, substitutions, or batch cooking advice]`,
      ``,
      `## Nutrition (per serve, approx)`,
      `Protein: Xg | Carbs: Xg | Fat: Xg | Calories: X`,
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
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }]
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
    console.error('Recipe API error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to generate recipe' }, { status: 500 })
  }
}
