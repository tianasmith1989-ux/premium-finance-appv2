// app/api/cron-notify/route.ts
// Called automatically by Vercel Cron — do not call manually in production.
// Sends weekly snapshots, overdue bill alerts, and money date reminders.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const RESEND_KEY = process.env.RESEND_API_KEY!
const FROM = 'Aureus <onboarding@resend.dev>'
const today = new Date()
const todayStr = today.toISOString().split('T')[0]
const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][today.getDay()]
const hour = today.getHours()

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_KEY}` },
    body: JSON.stringify({ from: FROM, to: [to], subject, html })
  })
  return res.ok
}

function weeklySnapshotHtml(u: any): string {
  return `<!DOCTYPE html>
<html>
<body style="background:#111111;margin:0;padding:24px;font-family:Inter,Arial,sans-serif;">
<div style="max-width:480px;margin:0 auto;background:#1a1810;border-radius:16px;border:1px solid #2e2618;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#1a1810,#111111);padding:24px 28px;border-bottom:1px solid rgba(212,175,55,0.2);">
    <div style="color:#D4AF37;font-size:22px;font-weight:900;letter-spacing:2px;">AUREUS</div>
    <div style="color:#9a8a6a;font-size:11px;letter-spacing:1px;margin-top:4px;">WEEKLY SNAPSHOT · ${today.toLocaleDateString('en-AU', { day:'numeric', month:'long', year:'numeric' }).toUpperCase()}</div>
  </div>
  <div style="padding:24px 28px;">
    <p style="color:#F5F5F5;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Hey ${u.user_name || 'Builder'}, here's your weekly Aureus snapshot.
    </p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
      <div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);border-radius:10px;padding:14px;">
        <div style="color:#9a8a6a;font-size:10px;letter-spacing:1px;margin-bottom:4px;">SAVING RATE</div>
        <div style="color:#D4AF37;font-size:22px;font-weight:800;">${u.saving_rate || 0}%</div>
      </div>
      <div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);border-radius:10px;padding:14px;">
        <div style="color:#9a8a6a;font-size:10px;letter-spacing:1px;margin-bottom:4px;">MONTHLY SURPLUS</div>
        <div style="color:#D4AF37;font-size:22px;font-weight:800;">$${(u.monthly_surplus || 0).toLocaleString()}</div>
      </div>
    </div>
    ${u.top_goal_name ? `
    <div style="background:rgba(255,255,255,0.03);border:1px solid #2e2618;border-radius:10px;padding:14px;margin-bottom:12px;">
      <div style="color:#9a8a6a;font-size:10px;letter-spacing:1px;margin-bottom:8px;">TOP GOAL</div>
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="color:#F5F5F5;font-size:14px;">${u.top_goal_name}</span>
        <span style="color:#D4AF37;font-weight:700;">${u.top_goal_pct}%</span>
      </div>
      <div style="height:6px;background:rgba(255,255,255,0.1);border-radius:3px;">
        <div style="width:${Math.min(100, u.top_goal_pct || 0)}%;height:100%;background:linear-gradient(90deg,#D4AF37,#BC6A1F);border-radius:3px;"></div>
      </div>
    </div>` : ''}
    ${u.top_win ? `<div style="padding:12px 14px;background:rgba(180,212,55,0.06);border:1px solid rgba(180,212,55,0.2);border-radius:10px;margin-bottom:12px;color:#9a8a6a;font-size:13px;">🏆 <strong style="color:#F5F5F5;">Latest win:</strong> ${u.top_win}</div>` : ''}
    ${u.next_action ? `<div style="padding:12px 14px;background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.2);border-radius:10px;margin-bottom:16px;color:#9a8a6a;font-size:13px;">⚡ <strong style="color:#D4AF37;">This week:</strong> ${u.next_action}</div>` : ''}
    ${u.streak >= 3 ? `<div style="padding:10px 14px;background:rgba(212,175,55,0.05);border-radius:8px;color:#9a8a6a;font-size:12px;margin-bottom:16px;">🔥 ${u.streak}-day streak — keep it going.</div>` : ''}
    <p style="color:#6b5e3e;font-size:11px;margin:0;line-height:1.6;">
      You're receiving this because you enabled weekly snapshots in Aureus.<br>
      Open Aureus → Insights → Notifications to unsubscribe.
    </p>
  </div>
  <div style="padding:16px 28px;border-top:1px solid rgba(212,175,55,0.1);text-align:center;">
    <div style="color:#6b5e3e;font-size:11px;letter-spacing:1px;">WEALTH THROUGH DISCIPLINE · AUREUS</div>
  </div>
</div>
</body>
</html>`
}

function overdueHtml(u: any, bills: any[]): string {
  const billList = bills.map(b => `
    <div style="display:flex;justify-content:space-between;padding:10px 14px;background:rgba(192,57,43,0.08);border:1px solid rgba(192,57,43,0.25);border-radius:8px;margin-bottom:8px;">
      <span style="color:#F5F5F5;font-size:14px;">${b.name}</span>
      <span style="color:#e74c3c;font-weight:700;">$${parseFloat(b.amount).toFixed(0)} overdue</span>
    </div>`).join('')
  return `<!DOCTYPE html>
<html>
<body style="background:#111111;margin:0;padding:24px;font-family:Inter,Arial,sans-serif;">
<div style="max-width:480px;margin:0 auto;background:#1a1810;border-radius:16px;border:1px solid #2e2618;overflow:hidden;">
  <div style="padding:24px 28px;border-bottom:1px solid rgba(212,175,55,0.2);">
    <div style="color:#D4AF37;font-size:20px;font-weight:900;letter-spacing:2px;">AUREUS</div>
    <div style="color:#e74c3c;font-size:13px;font-weight:700;margin-top:6px;">⚠️ Payment reminder</div>
  </div>
  <div style="padding:24px 28px;">
    <p style="color:#F5F5F5;font-size:15px;margin:0 0 16px;">Hey ${u.user_name || 'Builder'}, you have ${bills.length} overdue payment${bills.length > 1 ? 's' : ''} in Aureus:</p>
    ${billList}
    <p style="color:#9a8a6a;font-size:13px;margin:16px 0 0;line-height:1.6;">Open Aureus and tick these off once paid to keep your budget accurate.</p>
  </div>
  <div style="padding:16px 28px;border-top:1px solid rgba(212,175,55,0.1);text-align:center;">
    <div style="color:#6b5e3e;font-size:11px;letter-spacing:1px;">WEALTH THROUGH DISCIPLINE · AUREUS</div>
  </div>
</div>
</body>
</html>`
}

function moneyDateHtml(u: any): string {
  return `<!DOCTYPE html>
<html>
<body style="background:#111111;margin:0;padding:24px;font-family:Inter,Arial,sans-serif;">
<div style="max-width:480px;margin:0 auto;background:#1a1810;border-radius:16px;border:1px solid rgba(212,175,55,0.3);overflow:hidden;">
  <div style="padding:24px 28px;border-bottom:1px solid rgba(212,175,55,0.2);">
    <div style="color:#D4AF37;font-size:20px;font-weight:900;letter-spacing:2px;">AUREUS</div>
  </div>
  <div style="padding:24px 28px;text-align:center;">
    <div style="font-size:48px;margin-bottom:16px;">📅</div>
    <h2 style="color:#D4AF37;font-family:serif;margin:0 0 12px;">Money Date Tonight</h2>
    <p style="color:#F5F5F5;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Hey ${u.user_name || 'Builder'}, your ${u.money_date_day} money date is tonight at ${u.money_date_time}.
    </p>
    <div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);border-radius:12px;padding:16px;margin-bottom:20px;">
      <div style="color:#9a8a6a;font-size:12px;margin-bottom:8px;">YOUR AGENDA</div>
      <div style="color:#F5F5F5;font-size:13px;line-height:2;text-align:left;">
        ✅ Review this week's actual spending<br>
        💰 Check surplus vs projection<br>
        🎯 Update goal progress<br>
        ⚡ Set one financial move for next week
      </div>
    </div>
    <p style="color:#6b5e3e;font-size:11px;margin:0;">Open Aureus to do your check-in.</p>
  </div>
  <div style="padding:16px 28px;border-top:1px solid rgba(212,175,55,0.1);text-align:center;">
    <div style="color:#6b5e3e;font-size:11px;letter-spacing:1px;">WEALTH THROUGH DISCIPLINE · AUREUS</div>
  </div>
</div>
</body>
</html>`
}

export async function GET(request: NextRequest) {
  // Security: Vercel signs cron requests — verify in production
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!RESEND_KEY) return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 })

  const results = { sent: 0, skipped: 0, errors: 0 }

  try {
    const { data: users, error } = await supabase
      .from('notification_prefs')
      .select('*')

    if (error) throw new Error(error.message)
    if (!users?.length) return NextResponse.json({ ...results, message: 'No subscribers' })

    for (const u of users) {
      try {
        // ── Weekly snapshot (every Sunday or their chosen day) ──
        if (u.notify_weekly_snapshot && u.last_weekly_sent !== todayStr) {
          const isWeeklyDay = u.frequency === 'weekly' ? dayName === 'Sunday' : dayName === 'Sunday' && getWeekNumber() % 2 === 0
          if (isWeeklyDay && hour >= 8 && hour < 10) {
            const sent = await sendEmail(
              u.email,
              `Your Aureus weekly snapshot 🏛️`,
              weeklySnapshotHtml(u)
            )
            if (sent) {
              await supabase.from('notification_prefs').update({ last_weekly_sent: todayStr }).eq('user_token', u.user_token)
              results.sent++
            } else results.errors++
          } else results.skipped++
        }

        // ── Overdue bill alerts (daily at 8am) ──
        if (u.notify_overdue_bills && u.last_overdue_sent !== todayStr && hour >= 8 && hour < 9) {
          const bills = u.upcoming_bills || []
          const overdue = bills.filter((b: any) => b.dayOffset < 0)
          if (overdue.length > 0) {
            const sent = await sendEmail(
              u.email,
              `⚠️ You have ${overdue.length} overdue payment${overdue.length > 1 ? 's' : ''} in Aureus`,
              overdueHtml(u, overdue)
            )
            if (sent) {
              await supabase.from('notification_prefs').update({ last_overdue_sent: todayStr }).eq('user_token', u.user_token)
              results.sent++
            } else results.errors++
          }
        }

        // ── Money date reminder (2 hours before their scheduled time) ──
        if (u.notify_money_date && dayName === u.money_date_day) {
          const [schedHour] = (u.money_date_time || '18:00').split(':').map(Number)
          if (hour === schedHour - 2) {
            const sent = await sendEmail(
              u.email,
              `📅 Money date tonight, ${u.user_name || 'Builder'}`,
              moneyDateHtml(u)
            )
            if (sent) results.sent++
            else results.errors++
          }
        }

      } catch (userErr: any) {
        console.error(`Error processing user ${u.user_token}:`, userErr?.message)
        results.errors++
      }
    }

    return NextResponse.json({ ok: true, ...results, usersProcessed: users.length })
  } catch (e: any) {
    console.error('Cron error:', e)
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}

function getWeekNumber(): number {
  const d = new Date()
  d.setHours(0,0,0,0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
