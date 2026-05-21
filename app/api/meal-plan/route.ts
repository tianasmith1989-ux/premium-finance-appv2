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
    const hasDessert = selectedMeals.includes('dessert')
    const mealLabel = selectedMeals.map((m: string) => m.charAt(0).toUpperCase() + m.slice(1)).join(' + ')

    const systemPrompt = `You are a practical Australian meal planning assistant. You create realistic, budget-conscious 7-day meal plans using current Woolworths, Coles, and Aldi prices. You ALWAYS use real dollar amounts — never placeholders. You respond ONLY with the meal plan content — no preamble, no sign-off.`

    const exampleDay = [
      hasBreakfast ? `🌅 Breakfast: Rolled oats with banana and honey (${n} serves) ~$3.20` : '',
      hasLunch     ? `☀️ Lunch: Vegemite and cheese sandwiches (${n} serves) ~$4.50` : '',
      hasDinner    ? `🌙 Dinner: Spaghetti bolognese (${n} serves) ~$14.00 _(batch: double batch — leftover pasta Tue lunch)_` : '',
      hasDessert   ? `🍮 Dessert: Banana with honey yoghurt (${n} serves) ~$3.00` : '',
    ].filter(Boolean).join('\n')

    const exampleDay2 = [
      hasBreakfast ? `🌅 Breakfast: Weetbix with milk (${n} serves) ~$2.80` : '',
      hasLunch     ? `☀️ Lunch: Leftover bolognese on toast (${n} serves) ~$1.50` : '',
      hasDinner    ? `🌙 Dinner: Baked chicken drumsticks with roast potatoes (${n} serves) ~$16.00` : '',
      hasDessert   ? `🍮 Dessert: Tinned fruit with ice cream (${n} serves) ~$4.50` : '',
    ].filter(Boolean).join('\n')

    const userPrompt = [
      `Create a 7-day meal plan (${mealLabel}) for ${n} people with a weekly grocery budget of $${budget} AUD.`,
      dislikes ? `Do NOT include: ${dislikes}.` : '',
      dietaryNeeds ? `Dietary requirements: ${dietaryNeeds}.` : '',
      `MEALS TO INCLUDE: Only generate ${mealLabel}. Do not add extra meal types.`,
      hasDinner ? `Batch cook dinners for ${n} — leftovers become next-day lunches where possible.` : '',
      hasDessert ? `Desserts should be simple, budget-friendly, and use affordable AU ingredients (tinned fruit, yoghurt, custard, jelly, simple biscuit slices, stewed fruit). Keep dessert cost under $1.50 per serve.` : '',
      useDetailedPricing ? `Use real 2024-25 AU prices: chicken thighs 1kg $8, beef mince 500g $7, eggs 12pk $5.50, milk 2L $3.20, bread loaf $3.50, pasta 500g $1.80, rice 1kg $3, frozen veg 1kg $4.50, rolled oats 1kg $3.50, bananas 1kg $3.50, cheese 500g block $9, ice cream 2L $5.50, yoghurt 1kg $5, tinned fruit 825g $2.50, custard 1L $3.50. Scale for ${n} people.` : '',
      catalogText ? `\nThis week's catalog specials:\n${String(catalogText).slice(0, 600)}` : '',
      ``,
      `IMPORTANT — TWO COST TOTALS:`,
      `1. MEAL COST: Cost of ingredients actually consumed this week (portions used).`,
      `2. SHOP TOTAL: What you'll spend at checkout — full pack prices. Will be higher because pantry staples last weeks.`,
      ``,
      `Use EXACTLY this format — real dollar amounts only:`,
      ``,
      `**Meal cost (ingredients used): $[real number] | Checkout total (whole packs): ~$[real number] | Savings vs eating out: ~$[real number]**`,
      `💡 The checkout total is higher because pantry staples like rice, honey and spices last 2–4 weeks — your real weekly food cost is closer to the meal cost figure.`,
      ``,
      `## Monday`,
      exampleDay,
      ``,
      `## Tuesday`,
      exampleDay2,
      ``,
      `[Continue for Wednesday, Thursday, Friday, Saturday, Sunday in the same format with real prices]`,
      ``,
      `## Shopping List`,
      `- Beef mince 500g — 2 packs ~$14.00 _(used in full this week)_`,
      `- Rolled oats 1kg — 1 bag ~$3.50 _(lasts ~3 weeks)_`,
      `[List every ingredient needed with real AU prices. Add _(lasts X weeks)_ for pantry staples not fully used.]`,
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
        max_tokens: 3000,
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
