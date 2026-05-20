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

    const systemPrompt = `You are a practical Australian meal planning assistant. You create realistic, budget-conscious 7-day meal plans for Australian families using current Woolworths, Coles, and Aldi prices. You ALWAYS include real dollar amounts — never placeholders. You respond ONLY with the meal plan — no preamble, no sign-off, no financial advice.`

    // Build the example day based on selected meals only
    const exampleDay = [
      hasBreakfast ? `🌅 Breakfast: Rolled oats with banana and honey (${n} serves) ~$3.20` : '',
      hasLunch    ? `☀️ Lunch: Vegemite and cheese sandwiches (${n} serves) ~$4.50` : '',
      hasDinner   ? `🌙 Dinner: Spaghetti bolognese (${n} serves) ~$14.00 _(batch: double batch — leftover pasta Tue lunch)_` : '',
    ].filter(Boolean).join('\n')

    const exampleDay2 = [
      hasBreakfast ? `🌅 Breakfast: Weetbix with milk (${n} serves) ~$2.80` : '',
      hasLunch    ? `☀️ Lunch: Leftover bolognese on toast (${n} serves) ~$1.50` : '',
      hasDinner   ? `🌙 Dinner: Baked chicken drumsticks with roast potatoes (${n} serves) ~$16.00` : '',
    ].filter(Boolean).join('\n')

    const userPrompt = [
      `Create a 7-day meal plan (${mealLabel} only) for ${n} people with a weekly grocery budget of $${budget} AUD.`,
      dislikes ? `Do NOT include: ${dislikes}.` : '',
      dietaryNeeds ? `Dietary requirements: ${dietaryNeeds}.` : '',
      ``,
      `MEALS TO INCLUDE: Only generate ${mealLabel}. Do NOT add any other meal types.`,
      hasDinner ? `PORTIONS: All dinners must serve ${n} people. Batch cook where possible — dinner leftovers become next-day lunches.` : `PORTIONS: All meals must serve ${n} people.`,
      useDetailedPricing ? `PRICING: Use real 2024-25 AU prices. Examples: chicken thighs 1kg $8, beef mince 500g $7, eggs 12pk $5.50, milk 2L $3.20, bread loaf $3.50, pasta 500g $1.80, rice 1kg $3, frozen veg 1kg $4.50, rolled oats 1kg $3.50, bananas 1kg $3.50, cheese 500g block $9. Scale quantities for ${n} people.` : '',
      catalogText ? `\nThis week's catalog specials to prioritise:\n${String(catalogText).slice(0, 600)}` : '',
      ``,
      `Use this EXACT format — real dollar amounts only, no placeholders:`,
      ``,
      `**Estimated weekly cost: $[real number] | Savings vs eating out: ~$[real number]**`,
      ``,
      `## Monday`,
      exampleDay,
      ``,
      `## Tuesday`,
      exampleDay2,
      ``,
      `[Continue for Wednesday, Thursday, Friday, Saturday, Sunday in the SAME format with real prices]`,
      ``,
      `## Shopping List`,
      `- Chicken drumsticks 1.5kg — 2 packs ~$17.00`,
      `- Beef mince 500g — 2 packs ~$14.00`,
      `- Eggs — 2 dozen ~$11.00`,
      `[List every ingredient needed with real AU prices]`,
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
        max_tokens: 2500,
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
