// app/api/send-meal-plan-email/route.ts
// Called by the cron job on the 1st of each month for opted-in users.
// Generates a personalised 7-day budget meal plan and emails it.

import { NextRequest, NextResponse } from 'next/server'

const FROM = 'Aureus <noreply@aureusplutus.app>'

export async function POST(request: NextRequest) {
  try {
    const { email, userName, people, weeklyBudget, dislikes, dietaryNeeds } = await request.json()

    const resendKey = process.env.RESEND_API_KEY
    const anthropicKey = process.env.ANTHROPIC_API_KEY

    if (!resendKey || !anthropicKey) {
      return NextResponse.json({ error: 'Missing API keys' }, { status: 500 })
    }

    const n = parseInt(people) || 4
    const budget = weeklyBudget || 150
    const month = new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })

    // Generate meal plan via Anthropic
    const prompt = [
      `Create a 7-day budget meal plan for an Australian family.`,
      `Household: ${n} people | Weekly grocery budget: $${budget} AUD`,
      dislikes ? `Do NOT include: ${dislikes}` : '',
      dietaryNeeds ? `Dietary needs: ${dietaryNeeds}` : '',
      `Use realistic 2024-25 AU prices (Woolworths/Coles/Aldi home-brand).`,
      `Prioritise batch cooking, cheap proteins (eggs, chicken thighs, legumes), seasonal vegetables.`,
      ``,
      `Format EXACTLY as follows:`,
      ``,
      `**Estimated weekly cost: $X | Checkout total: ~$X | Savings vs eating out: ~$X**`,
      `💡 Checkout total is higher because pantry staples last 2-4 weeks.`,
      ``,
      `## Monday`,
      `🌅 Breakfast: [meal] ~$X`,
      `☀️ Lunch: [meal] ~$X`,
      `🌙 Dinner: [meal] ~$X _(batch: note)_`,
      ``,
      `[Repeat for Tuesday–Sunday]`,
      ``,
      `## Shopping List`,
      `- [item] — [qty] ~$X _(lasts X weeks)_ for pantry items`,
      ``,
      `## 3 Budget Tips for ${month}`,
      `- [tip specific to this household]`,
    ].filter(Boolean).join('\n')

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        system: 'You are a practical Australian meal planning assistant. You create realistic, budget-conscious meal plans using current Woolworths, Coles, and Aldi prices. Respond ONLY with the meal plan — no preamble, no sign-off.',
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!aiRes.ok) {
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
    }

    const aiData = await aiRes.json()
    const mealPlanText: string = (aiData.content || [])
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text)
      .join('')

    if (!mealPlanText) {
      return NextResponse.json({ error: 'No meal plan generated' }, { status: 500 })
    }

    // Convert meal plan text to HTML
    const mealPlanHtml = mealPlanText.split('\n').map(line => {
      if (line.startsWith('## ')) return `<h3 style="color:#D4AF37;font-size:15px;font-weight:800;margin:20px 0 8px;border-bottom:1px solid rgba(212,175,55,0.2);padding-bottom:4px;">${line.slice(3)}</h3>`
      if (line.startsWith('**') && line.endsWith('**')) return `<p style="color:#F5F5F5;font-size:13px;font-weight:700;margin:0 0 4px;">${line.replace(/\*\*/g, '')}</p>`
      if (line.startsWith('💡')) return `<div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);border-radius:8px;padding:10px 14px;margin:8px 0;color:#9a8a6a;font-size:12px;">${line}</div>`
      if (line.match(/^[🌅☀️🌙]/)) {
        const clean = line.replace(/~\$([\d.]+)/g, '<span style="color:#9a8a6a;font-size:11px"> ~$$1</span>')
          .replace(/_(.*?)_/g, '<em style="color:#6b8f6b;font-size:11px"> · $1</em>')
        return `<div style="color:#F5F5F5;font-size:13px;padding:4px 0;">${clean}</div>`
      }
      if (line.startsWith('- ')) {
        const clean = line.slice(2).replace(/~\$([\d.]+)/g, '<span style="color:#D4AF37"> ~$$1</span>')
          .replace(/\(lasts (.*?)\)/g, '<span style="color:#6b8f6b;font-size:11px"> ♻️ lasts $1</span>')
        return `<div style="color:#9a8a6a;font-size:12px;padding:3px 0 3px 12px;border-left:2px solid #2e2618;">${clean}</div>`
      }
      if (line.trim() === '') return '<div style="height:4px;"></div>'
      return `<div style="color:#9a8a6a;font-size:12px;">${line}</div>`
    }).join('')

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#111111;margin:0;padding:16px;font-family:Inter,Arial,sans-serif;">
<div style="max-width:540px;margin:0 auto;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1a1810,#111111);border:1px solid rgba(212,175,55,0.3);border-radius:16px;padding:24px 28px;margin-bottom:12px;">
    <div style="color:#D4AF37;font-size:20px;font-weight:900;letter-spacing:2px;">AUREUS</div>
    <div style="color:#9a8a6a;font-size:11px;letter-spacing:1px;margin-top:2px;">MONTHLY MEAL PLAN · ${month.toUpperCase()}</div>
    <p style="color:#F5F5F5;font-size:15px;margin:14px 0 0;line-height:1.5;">
      Hey ${userName || 'Builder'}, here's your personalised ${month} meal plan for ${n} people on a $${budget}/week budget.
    </p>
  </div>

  <!-- Meal plan content -->
  <div style="background:#1a1810;border:1px solid #2e2618;border-radius:12px;padding:20px 24px;margin-bottom:12px;">
    ${mealPlanHtml}
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:16px;">
    <div style="color:#3a2e1e;font-size:11px;letter-spacing:1px;">WEALTH THROUGH DISCIPLINE · AUREUS</div>
    <div style="color:#3a2e1e;font-size:10px;margin-top:4px;">Monthly meal plan · Open Aureus to update your preferences</div>
  </div>

</div>
</body>
</html>`

    // Send via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: `🍽️ Your Aureus meal plan for ${month} — $${budget}/week for ${n} people`,
        html
      })
    })

    if (!emailRes.ok) {
      const err = await emailRes.json().catch(() => ({}))
      return NextResponse.json({ error: (err as any)?.message || 'Email send failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Meal plan email error:', error)
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
