// ============================================================
// ADD THIS FILE TO: app/api/meal-plan/route.ts
// This is a dedicated route for meal plan generation with no
// financial-coach system prompt — so Claude actually generates meals.
// ============================================================

import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { people, budget, dietaryNeeds, dislikes, useDetailedPricing, catalogText } = body

    const systemPrompt = `You are a practical Australian meal planning assistant. 
You create realistic, budget-conscious 7-day meal plans for Australian families.
You know current Woolworths, Coles, and Aldi prices well.
You respond ONLY with structured meal plan content — no financial advice, no preamble, no sign-offs.
Keep meal names short and practical. Prioritise batch cooking, cheap proteins (eggs, legumes, chicken thighs), and seasonal AU vegetables.`

    const userPrompt = [
      `Create a 7-day meal plan.`,
      `Household: ${people} people`,
      `Weekly grocery budget: $${budget} AUD`,
      dislikes ? `Avoid: ${dislikes}` : '',
      dietaryNeeds ? `Dietary needs: ${dietaryNeeds}` : '',
      useDetailedPricing ? `Use realistic 2024-25 AU supermarket prices (Woolworths/Coles/Aldi home-brand).` : '',
      catalogText ? `\nThis week's catalog specials:\n${catalogText.slice(0, 600)}` : '',
      '',
      `Format your response EXACTLY as follows:`,
      '',
      `**Estimated weekly cost: $X | Savings vs eating out: ~$Y**`,
      '',
      `## Monday`,
      `🌅 Breakfast: [meal] ~$X`,
      `☀️ Lunch: [meal] ~$X`,
      `🌙 Dinner: [meal] ~$X _(batch: note about leftovers)_`,
      '',
      `[Repeat for Tuesday through Sunday]`,
      '',
      `## Shopping List`,
      `- [item] — [qty] ~$X`,
      `[10-15 items covering the full week]`,
      '',
      `## Budget Tips`,
      `- [3-4 practical tips for this specific household]`,
    ].filter(s => s !== undefined && s !== null && s !== false).join('\n')

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })

    const text = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)
      .join('')

    return NextResponse.json({ text })
  } catch (error: any) {
    console.error('Meal plan API error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate meal plan' },
      { status: 500 }
    )
  }
}
