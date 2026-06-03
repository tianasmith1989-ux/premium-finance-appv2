// app/api/cron-notify/route.ts
// Runs daily at 8am AEST (10pm UTC) via Vercel Cron
// Sends personalised morning financial brief to all subscribers

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const FROM = 'Aureus <noreply@aureusplutus.app>'

// Re-evaluated per cold start (fine for date values)
const _today = new Date()
const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][_today.getDay()]
const dateFormatted = _today.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

async function sendEmail(to: string, subject: string, html: string, resendKey: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
    body: JSON.stringify({ from: FROM, to: [to], subject, html })
  })
  return res.ok
}

function buildDailyBriefHtml(u: any): string {
  const bills: any[] = u.upcoming_bills || []
  const name = u.user_name || 'Builder'

  // Categorise bills for this week (next 7 days)
  const thisWeekBills = bills.filter((b: any) => b.dayOffset >= 0 && b.dayOffset <= 7)
  const overdueBills = bills.filter((b: any) => b.dayOffset < 0)
  const nextWeekBills = bills.filter((b: any) => b.dayOffset > 7 && b.dayOffset <= 14)

  // Total due this week
  const thisWeekTotal = thisWeekBills.reduce((s: number, b: any) => s + parseFloat(b.amount || '0'), 0)
  const overdueTotal = overdueBills.reduce((s: number, b: any) => s + parseFloat(b.amount || '0'), 0)

  // Savings & fun money from surplus
  const surplus = u.monthly_surplus || 0
  const weeklySurplus = Math.round(surplus / 4.3)
  const savingRate = u.saving_rate || 0

  // Contextual greeting based on day
  const dayGreeting: Record<string, string> = {
    Monday: `New week, new moves. Here's what's ahead, ${name}.`,
    Tuesday: `Tuesday — the real start of the week. Stay on track.`,
    Wednesday: `Midweek check. You're halfway there, ${name}.`,
    Thursday: `Almost there. One more push before the weekend.`,
    Friday: `Friday brief. Review the week before the weekend spending starts.`,
    Saturday: `Weekend — great time to check in on the week's numbers.`,
    Sunday: `Sunday reset. Plan the week ahead, ${name}.`,
  }
  const greeting = dayGreeting[dayName] || `Good morning, ${name}.`

  // Urgency colour for overdue
  const hasOverdue = overdueBills.length > 0
  const hasThisWeek = thisWeekBills.length > 0

  // Build bill rows
  const buildBillRow = (b: any, highlight: string) => {
    const dueText = b.dayOffset === 0 ? 'DUE TODAY' : b.dayOffset < 0 ? `${Math.abs(b.dayOffset)} DAYS OVERDUE` : `Due in ${b.dayOffset} day${b.dayOffset !== 1 ? 's' : ''}`
    const isAutomatic = b.automatic
    return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #2e2618;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="color:#F5F5F5;font-size:14px;font-weight:600;">${b.name}</div>
            <div style="color:${highlight};font-size:11px;font-weight:700;margin-top:2px;">${dueText}</div>
            ${isAutomatic 
              ? `<div style="color:#6b8f6b;font-size:10px;margin-top:2px;">✅ Auto-payment set up</div>`
              : `<div style="color:#bc6a1f;font-size:10px;margin-top:2px;">⚠️ Check payment is arranged</div>`
            }
          </div>
          <div style="color:#D4AF37;font-size:16px;font-weight:800;text-align:right;">$${parseFloat(b.amount || '0').toFixed(0)}</div>
        </div>
      </td>
    </tr>`
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="background:#111111;margin:0;padding:16px;font-family:Inter,Arial,sans-serif;">
<div style="max-width:520px;margin:0 auto;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1a1810 0%,#111111 100%);border:1px solid rgba(212,175,55,0.3);border-radius:16px;padding:24px 28px;margin-bottom:12px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <div style="color:#D4AF37;font-size:20px;font-weight:900;letter-spacing:2px;">AUREUS</div>
        <div style="color:#9a8a6a;font-size:11px;letter-spacing:1px;margin-top:2px;">DAILY BRIEF · ${dateFormatted.toUpperCase()}</div>
      </div>
      <div style="color:#9a8a6a;font-size:11px;text-align:right;">${dayName.toUpperCase()}</div>
    </div>
    <p style="color:#F5F5F5;font-size:16px;margin:16px 0 0;line-height:1.5;">${greeting}</p>
  </div>

  <!-- Overdue alert (only if overdue bills exist) -->
  ${hasOverdue ? `
  <div style="background:rgba(192,57,43,0.12);border:1px solid rgba(192,57,43,0.4);border-radius:12px;padding:16px 20px;margin-bottom:12px;">
    <div style="color:#e74c3c;font-weight:800;font-size:13px;margin-bottom:10px;">🔴 ${overdueBills.length} OVERDUE PAYMENT${overdueBills.length > 1 ? 'S' : ''} — $${overdueTotal.toFixed(0)} total</div>
    <table style="width:100%;border-collapse:collapse;">
      ${overdueBills.map((b: any) => buildBillRow(b, '#e74c3c')).join('')}
    </table>
    <p style="color:#9a8a6a;font-size:12px;margin:10px 0 0;">Open Aureus and tick these off once paid to keep your budget accurate.</p>
  </div>` : ''}

  <!-- This week's bills -->
  <div style="background:#1a1810;border:1px solid #2e2618;border-radius:12px;padding:20px 24px;margin-bottom:12px;">
    <div style="color:#9a8a6a;font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:14px;">📅 THIS WEEK'S PAYMENTS</div>
    ${hasThisWeek ? `
    <table style="width:100%;border-collapse:collapse;">
      ${thisWeekBills.map((b: any) => buildBillRow(b, b.dayOffset === 0 ? '#D4AF37' : '#9a8a6a')).join('')}
    </table>
    <div style="margin-top:14px;padding:12px 16px;background:rgba(212,175,55,0.08);border-radius:8px;display:flex;justify-content:space-between;align-items:center;">
      <span style="color:#9a8a6a;font-size:13px;">Total due this week</span>
      <span style="color:#D4AF37;font-size:18px;font-weight:800;">$${thisWeekTotal.toFixed(0)}</span>
    </div>` : `
    <p style="color:#6b5e3e;font-size:13px;margin:0;">✅ No payments due this week. Clear run ahead.</p>`}
  </div>

  <!-- Weekly money summary -->
  <div style="background:#1a1810;border:1px solid #2e2618;border-radius:12px;padding:20px 24px;margin-bottom:12px;">
    <div style="color:#9a8a6a;font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:14px;">💰 THIS WEEK'S MONEY BREAKDOWN</div>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #2e2618;">
          <span style="color:#9a8a6a;font-size:13px;">Living expenses (bills, groceries, transport)</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #2e2618;text-align:right;">
          <span style="color:#F5F5F5;font-size:14px;font-weight:700;">~$${(thisWeekTotal + Math.round(weeklySurplus * 0.6)).toFixed(0)}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #2e2618;">
          <span style="color:#9a8a6a;font-size:13px;">Savings & goals this week</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #2e2618;text-align:right;">
          <span style="color:#D4AF37;font-size:14px;font-weight:700;">$${Math.round(weeklySurplus * 0.7)}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #2e2618;">
          <span style="color:#9a8a6a;font-size:13px;">Fun money (discretionary)</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #2e2618;text-align:right;">
          <span style="color:#6b8f6b;font-size:14px;font-weight:700;">$${Math.round(weeklySurplus * 0.3)}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;">
          <span style="color:#F5F5F5;font-size:13px;font-weight:700;">Monthly saving rate</span>
        </td>
        <td style="padding:10px 0 0;text-align:right;">
          <span style="color:#D4AF37;font-size:16px;font-weight:800;">${savingRate}%</span>
        </td>
      </tr>
    </table>
  </div>

  <!-- Next week preview -->
  ${nextWeekBills.length > 0 ? `
  <div style="background:#1a1810;border:1px solid #2e2618;border-radius:12px;padding:16px 20px;margin-bottom:12px;">
    <div style="color:#9a8a6a;font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:10px;">👀 COMING NEXT WEEK</div>
    ${nextWeekBills.map((b: any) => `
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1e1a10;">
      <span style="color:#6b5e3e;font-size:13px;">${b.name} — in ${b.dayOffset} days</span>
      <span style="color:#6b5e3e;font-size:13px;">$${parseFloat(b.amount||'0').toFixed(0)}</span>
    </div>`).join('')}
  </div>` : ''}

  <!-- Goal progress -->
  ${u.top_goal_name ? `
  <div style="background:#1a1810;border:1px solid #2e2618;border-radius:12px;padding:16px 20px;margin-bottom:12px;">
    <div style="color:#9a8a6a;font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:10px;">🎯 YOUR TOP GOAL</div>
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
      <span style="color:#F5F5F5;font-size:14px;">${u.top_goal_name}</span>
      <span style="color:#D4AF37;font-weight:700;">${u.top_goal_pct}%</span>
    </div>
    <div style="height:8px;background:rgba(255,255,255,0.08);border-radius:4px;">
      <div style="width:${Math.min(100, u.top_goal_pct || 0)}%;height:100%;background:linear-gradient(90deg,#D4AF37,#BC6A1F);border-radius:4px;"></div>
    </div>
  </div>` : ''}

  <!-- Coach action -->
  ${u.next_action ? `
  <div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.2);border-radius:12px;padding:16px 20px;margin-bottom:12px;">
    <div style="color:#9a8a6a;font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:6px;">⚡ YOUR ONE THING TODAY</div>
    <div style="color:#F5F5F5;font-size:14px;line-height:1.6;">${u.next_action}</div>
  </div>` : ''}

  <!-- Streak -->
  ${u.streak >= 3 ? `
  <div style="background:rgba(212,175,55,0.04);border:1px solid #2e2618;border-radius:12px;padding:14px 20px;margin-bottom:12px;text-align:center;">
    <span style="color:#D4AF37;font-size:22px;">🔥</span>
    <span style="color:#9a8a6a;font-size:13px;margin-left:8px;">${u.streak}-day streak — discipline creates freedom.</span>
  </div>` : ''}

  <!-- Weekly challenge / engagement hook -->
  <div style="background:#1a1810;border:1px solid rgba(212,175,55,0.15);border-radius:12px;padding:16px 20px;margin-bottom:12px;">
    <div style="color:#9a8a6a;font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:8px;">💡 AUREUS INSIGHT</div>
    <div style="color:#F5F5F5;font-size:13px;line-height:1.6;">
      ${dayName === 'Monday' ? "People who review their finances on Monday spend 12% less across the week. You are already ahead." :
        dayName === 'Wednesday' ? "The average Australian spends $3,000/year on impulse purchases. Knowing your numbers prevents it." :
        dayName === 'Friday' ? "Weekend spending accounts for 35% of most discretionary spending. Go in with a number in mind." :
        dayName === 'Sunday' ? "A 10-minute Sunday money review is worth 2 hours of stress on a Wednesday. This is that 10 minutes." :
        "Every dollar you track is a dollar you control. Every dollar you ignore controls you."}
    </div>
  </div>

  <!-- CTA -->
  <div style="text-align:center;padding:8px 0 16px;">
    <a href="https://aureusplutus.app" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#D4AF37,#BC6A1F);color:#111111;font-weight:800;font-size:14px;border-radius:10px;text-decoration:none;letter-spacing:0.5px;">Open Aureus →</a>
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:8px 0 16px;">
    <div style="color:#3a2e1e;font-size:11px;letter-spacing:1px;">WEALTH THROUGH DISCIPLINE · AUREUS</div>
    <div style="color:#3a2e1e;font-size:10px;margin-top:4px;">Open Aureus to update your numbers · Reply to unsubscribe</div>
  </div>

</div>
</body>
</html>`
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) return NextResponse.json({ error: 'RESEND_API_KEY not set', env_keys: Object.keys(process.env).filter(k => k.includes('RESEND') || k.includes('SUPABASE') || k.includes('CRON')) }, { status: 200 })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  if (!supabaseUrl || !supabaseKey) return NextResponse.json({ error: 'Supabase env vars not set', supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey }, { status: 200 })

  const supabase = createClient(supabaseUrl, supabaseKey)

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][today.getDay()]
  const dateFormatted = today.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const results = { sent: 0, skipped: 0, errors: 0, users: 0 }

  try {
    const { data: users, error } = await supabase
      .from('notification_prefs')
      .select('*')

    if (error) throw new Error(error.message)
    if (!users?.length) return NextResponse.json({ ...results, message: 'No subscribers yet' })

    results.users = users.length

    for (const u of users) {
      try {
        // Skip if already sent today
        if (u.last_weekly_sent === todayStr) { results.skipped++; continue }

        const overdue = (u.upcoming_bills || []).filter((b: any) => b.dayOffset < 0)
        const thisWeek = (u.upcoming_bills || []).filter((b: any) => b.dayOffset >= 0 && b.dayOffset <= 7)
        const thisWeekTotal = thisWeek.reduce((s: number, b: any) => s + parseFloat(b.amount || '0'), 0)

        // Varied subject lines that feel personal and create curiosity
        const subject = (() => {
          const name = u.user_name || 'Builder'
          if (overdue.length > 0) return `⚠️ ${name}, you have an overdue payment`
          const todayBill = thisWeek.find((b: any) => b.dayOffset === 0)
          if (todayBill) return `📅 ${todayBill.name} is due today — $${parseFloat(todayBill.amount||'0').toFixed(0)}`
          if (dayName === 'Monday') return `🏛️ New week, ${name}. Here's your money brief`
          if (dayName === 'Friday') return `🎯 Week review, ${name} — how did you track?`
          if (dayName === 'Sunday') return `📊 ${name}'s weekly Aureus snapshot`
          if (u.saving_rate >= 20) return `🔥 ${name}, you're saving ${u.saving_rate}% — keep it going`
          if (u.streak >= 7) return `⚡ ${u.streak}-day streak, ${name}. Don't break it`
          if (thisWeekTotal > 0) return `💰 $${thisWeekTotal.toFixed(0)} due this week — ${name}'s brief`
          return `🏛️ Your Aureus brief, ${name} — ${dayName}`
        })()

        const html = buildDailyBriefHtml(u)
        const sent = await sendEmail(u.email, subject, html, RESEND_KEY)

        if (sent) {
          await supabase
            .from('notification_prefs')
            .update({ last_weekly_sent: todayStr })
            .eq('user_token', u.user_token)
          results.sent++
        } else {
          results.errors++
        }
      } catch (userErr: any) {
        console.error(`Error processing ${u.user_token}:`, userErr?.message)
        results.errors++
      }
    }

    // ── Monthly meal plan email (1st of each month) ──
    if (new Date().getDate() === 1) {
      const mealPlanUsers = users.filter((u: any) => u.notify_monthly_meal_plan && u.email)
      for (const u of mealPlanUsers) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://aureusplutus.app'}/api/send-meal-plan-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: u.email,
              userName: u.user_name,
              people: u.household_size || 4,
              weeklyBudget: u.meal_budget || 150,
              dislikes: u.meal_dislikes || '',
              dietaryNeeds: u.meal_dietary || ''
            })
          })
          results.sent++
        } catch (e) {
          results.errors++
        }
      }
    }

    return NextResponse.json({ ok: true, ...results })
  } catch (e: any) {
    console.error('Cron error:', e)
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
