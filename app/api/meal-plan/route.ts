// app/api/meal-plan/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { people, budget, dietaryNeeds, dislikes, useDetailedPricing, catalogText, meals } = body
    const n = parseInt(people) || 4
    const selectedMeals: string[] = meals && meals.length > 0 ? meals : ['breakfast', 'lunch', 'dinner']
    const hasBreakfast = selectedMeals.includes('breakfast')
    const hasLunch = selectedMeals.includes('lunch')
    const hasDinner = selectedMeals.includes('dinner')
    const mealLabel = selectedMeals.map((m: string) => m.charAt(0).toUpperCase() + m.slice(1)).join(' + ')

    const systemPrompt = `You are a practical Australian meal planning assistant. You create realistic, budget-conscious 7-day meal plans using current Woolworths, Coles, and Aldi prices. You ALWAYS use real dollar amounts. You respond ONLY with the meal plan content — no preamble, no sign-off.`

    const exampleDay = [
      hasBreakfast ? `🌅 Breakfast: Rolled oats with banana and honey (${n} serves) ~$3.20` : '',
      hasLunch     ? `☀️ Lunch: Vegemite and cheese sandwiches (${n} serves) ~$4.50` : '',
      hasDinner    ? `🌙 Dinner: Spaghetti bolognese (${n} serves) ~$14.00 _(batch: double batch — leftover pasta Tue lunch)_` : '',
    ].filter(Boolean).join('\n')

    const exampleDay2 = [
      hasBreakfast ? `🌅 Breakfast: Weetbix with milk (${n} serves) ~$2.80` : '',
      hasLunch     ? `☀️ Lunch: Leftover bolognese on toast (${n} serves) ~$1.50` : '',
      hasDinner    ? `🌙 Dinner: Baked chicken drumsticks with roast potatoes (${n} serves) ~$16.00` : '',
    ].filter(Boolean).join('\n')

    const userPrompt = [
      `Create a 7-day ${mealLabel} meal plan for ${n} people. Weekly grocery budget: $${budget} AUD.`,
      dislikes ? `Do NOT include: ${dislikes}.` : '',
      dietaryNeeds ? `Dietary requirements: ${dietaryNeeds}.` : '',
      hasDinner ? `Batch cook dinners for ${n} — leftovers become next-day lunches where possible.` : '',
      useDetailedPricing ? `Use real 2024-25 AU prices: chicken thighs 1kg $8, beef mince 500g $7, eggs 12pk $5.50, milk 2L $3.20, bread loaf $3.50, pasta 500g $1.80, rice 1kg $3, frozen veg 1kg $4.50, rolled oats 1kg $3.50, bananas 1kg $3.50, cheese 500g block $9. Scale for ${n} people.` : '',
      catalogText ? `\nThis week's catalog specials:\n${String(catalogText).slice(0, 600)}` : '',
      ``,
      `IMPORTANT — TWO COST TOTALS REQUIRED:`,
      `1. MEAL COST: The estimated cost of ingredients actually consumed across all 7 days (portions used, not whole packages).`,
      `2. SHOP TOTAL: What you'll actually spend at the checkout this week — full pack/jar/bag prices, because you can't buy half a jar of peanut butter. This will be HIGHER than the meal cost.`,
      `The shop total may exceed the $${budget} budget because you're buying whole items — but many pantry staples (peanut butter, honey, rice, spices) will last 2-4+ weeks. The WEEKLY MEAL COST should be within budget.`,
      ``,
      `Use EXACTLY this format:`,
      ``,
      `**Meal cost (ingredients used): $[real number] | Checkout total (whole packs): ~$[real number] | Savings vs eating out: ~$[real number]**`,
      `💡 The checkout total is higher because pantry staples like peanut butter, rice and spices last 2–4 weeks — your real weekly food cost is closer to the meal cost figure.`,
      ``,
      `## Monday`,
      exampleDay,
      ``,
      `## Tuesday`,
      exampleDay2,
      ``,
      `[Continue Wednesday through Sunday in the same format with real prices]`,
      ``,
      `## Shopping List`,
      `- Beef mince 500g — 2 packs ~$14.00 _(used in full this week)_`,
      `- Rolled oats 1kg — 1 bag ~$3.50 _(lasts ~3 weeks)_`,
      `- Honey 500g — 1 jar ~$4.50 _(lasts ~4 weeks)_`,
      `[List every item needed. Add a _(lasts X weeks)_ note for pantry staples that won't be used up in a single week. Omit this note for perishables used in full.]`,
      ``,
      `## Budget Tips`,
      `- [3 specific tips for a ${n}-person household on $${budget}/week]`,
    ].filter(s => s !== undefined && s !== null).join('\n')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2800,
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
