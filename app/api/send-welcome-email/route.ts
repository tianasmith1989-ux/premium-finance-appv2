// app/api/send-welcome-email/route.ts
// Sends a welcome email to new users when they create their account
// Also notifies Tiana of the new signup

import { NextRequest, NextResponse } from 'next/server'

const FROM = 'Aureus <noreply@aureusplutus.app>'
const OWNER_EMAIL = 'tiana@aureusplutus.app'

async function sendEmail(to: string, subject: string, html: string, resendKey: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
    body: JSON.stringify({ from: FROM, to: [to], subject, html })
  })
  const data = await res.json()
  if (!res.ok) console.error('Send email error:', data)
  return res.ok
}

function buildWelcomeEmail(userName: string, email: string): string {
  const name = userName || 'Builder'
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="background:#111111;margin:0;padding:16px;font-family:Inter,Arial,sans-serif;">
<div style="max-width:540px;margin:0 auto;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1a1810 0%,#111111 100%);border:1px solid rgba(212,175,55,0.4);border-radius:16px;padding:28px;margin-bottom:16px;text-align:center;">
    <div style="color:#D4AF37;font-size:28px;font-weight:900;letter-spacing:3px;margin-bottom:4px;">AUREUS</div>
    <div style="color:#9a8a6a;font-size:12px;letter-spacing:2px;">WEALTH THROUGH DISCIPLINE</div>
    <div style="margin:20px 0;height:1px;background:rgba(212,175,55,0.2);"></div>
    <h1 style="color:#F5F5F5;font-size:24px;font-weight:800;margin:0 0 8px;">Welcome, ${name}. 🏛️</h1>
    <p style="color:#9a8a6a;font-size:15px;margin:0;line-height:1.6;">Your journey to financial freedom starts here.</p>
  </div>

  <!-- What Aureus does -->
  <div style="background:#1a1810;border:1px solid #2e2618;border-radius:14px;padding:24px;margin-bottom:14px;">
    <div style="color:#D4AF37;font-size:12px;font-weight:700;letter-spacing:1.5px;margin-bottom:14px;">WHAT AUREUS DOES FOR YOU</div>
    ${[
      ['🏛️', 'Tracks your money', 'Income, bills, debts and goals — all in one place. No spreadsheets.'],
      ['💬', 'Coaches you daily', 'Ask Aureus anything about your money. It knows your numbers and gives real, personalised answers.'],
      ['📅', 'Reminds you what\'s due', 'Never get caught off guard by a bill again. Aureus shows what\'s coming up each week.'],
      ['📈', 'Shows you the path forward', 'Baby Steps, FIRE number, mortgage payoff, net worth trajectory — Aureus maps your whole financial future.'],
      ['🏆', 'Celebrates your wins', 'Every debt paid, every goal hit, every milestone — logged and remembered.'],
      ['🌀', 'Guided Visualisation', 'Six mindset sessions in the Change tab — abundance, debt release, confidence, and more. With AI personalisation using your real numbers. No experience needed.'],
      ['📧', 'Briefs you every morning', 'Enable your daily email brief in the Insights tab for a personalised morning snapshot.'],
    ].map(([icon, title, desc]) => `
    <div style="display:flex;gap:14px;margin-bottom:14px;align-items:flex-start;">
      <div style="font-size:22px;flex-shrink:0;margin-top:2px;">${icon}</div>
      <div>
        <div style="color:#F5F5F5;font-size:14px;font-weight:700;margin-bottom:3px;">${title}</div>
        <div style="color:#9a8a6a;font-size:13px;line-height:1.5;">${desc}</div>
      </div>
    </div>`).join('')}
  </div>

  <!-- Getting started steps -->
  <div style="background:#1a1810;border:1px solid #2e2618;border-radius:14px;padding:24px;margin-bottom:14px;">
    <div style="color:#D4AF37;font-size:12px;font-weight:700;letter-spacing:1.5px;margin-bottom:16px;">YOUR FIRST 5 MINUTES IN AUREUS</div>
    ${[
      ['1', 'Tell Aureus your name', 'The welcome screen will ask. This personalises your coaching.'],
      ['2', 'Add your income', 'In the Treasury tab — your pay, frequency, and start date.'],
      ['3', 'Add your bills and debts', 'Even just the big ones. The more detail, the better the coaching.'],
      ['4', 'Set a goal', 'Emergency fund, holiday, paying off a debt — whatever matters most.'],
      ['5', 'Ask Aureus a question', 'Go to the Aureus tab and ask anything. "What should I focus on?" is a great start.'],
      ['6', 'Try a Guided Visualisation', 'Go to the Change tab → Guided Visualisation. Pick a session, do the 2-minute pre-flight, and let the session work on your money mindset.'],
    ].map(([num, title, desc]) => `
    <div style="display:flex;gap:14px;margin-bottom:14px;align-items:flex-start;">
      <div style="background:rgba(212,175,55,0.15);border:1px solid rgba(212,175,55,0.4);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#D4AF37;font-size:13px;font-weight:800;">${num}</div>
      <div>
        <div style="color:#F5F5F5;font-size:14px;font-weight:700;margin-bottom:3px;">${title}</div>
        <div style="color:#9a8a6a;font-size:13px;line-height:1.5;">${desc}</div>
      </div>
    </div>`).join('')}
  </div>

  <!-- Where things live -->
  <div style="background:#1a1810;border:1px solid #2e2618;border-radius:14px;padding:24px;margin-bottom:14px;">
    <div style="color:#D4AF37;font-size:12px;font-weight:700;letter-spacing:1.5px;margin-bottom:14px;">WHERE TO FIND EVERYTHING</div>
    <table style="width:100%;border-collapse:collapse;">
      ${[
        ['🏠 Home', 'Your daily dashboard — streak, next action, quick access to everything'],
        ['💬 Aureus', 'Your AI money coach — ask anything, anytime'],
        ['⚡ Change', 'Mindset work — Dickens Process, Values, Compelling Future, Money Mirror, Guided Visualisation'],
        ['🏛️ Treasury', 'Income, expenses, debts, goals, budget tracker'],
        ['🛤️ Roadmap', 'Baby Steps progress and financial milestones'],
        ['🏆 Wins', 'Your financial victories — logged and celebrated'],
        ['⚡ Quick View', 'Mobile-friendly snapshot — money left, bills due, goals'],
        ['📈 Grow & FIRE', 'Net worth, FIRE number, investments, wealth trajectory'],
        ['🏢 Business', 'For business owners — Hormozi framework, profit engine'],
        ['🧠 Insights', 'AI analysis, spending patterns, daily email setup'],
      ].map(([tab, desc]) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #2e2618;color:#D4AF37;font-size:13px;font-weight:600;white-space:nowrap;padding-right:16px;">${tab}</td>
        <td style="padding:8px 0;border-bottom:1px solid #2e2618;color:#9a8a6a;font-size:13px;">${desc}</td>
      </tr>`).join('')}
    </table>
  </div>

  <!-- Get help -->
  <div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);border-radius:14px;padding:24px;margin-bottom:14px;">
    <div style="color:#D4AF37;font-size:12px;font-weight:700;letter-spacing:1.5px;margin-bottom:14px;">NEED HELP?</div>
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div style="display:flex;gap:12px;align-items:flex-start;">
        <span style="font-size:18px;">💬</span>
        <div>
          <div style="color:#F5F5F5;font-size:13px;font-weight:600;">In-app chat support</div>
          <div style="color:#9a8a6a;font-size:12px;">Tap the <strong style="color:#D4AF37;">?</strong> button in the top right corner of the app for instant help.</div>
        </div>
      </div>
      <div style="display:flex;gap:12px;align-items:flex-start;">
        <span style="font-size:18px;">✉️</span>
        <div>
          <div style="color:#F5F5F5;font-size:13px;font-weight:600;">Email support</div>
          <div style="color:#9a8a6a;font-size:12px;">Reply to this email or contact <a href="mailto:support@aureusplutus.app" style="color:#D4AF37;">support@aureusplutus.app</a></div>
        </div>
      </div>
      <div style="display:flex;gap:12px;align-items:flex-start;">
        <span style="font-size:18px;">📅</span>
        <div>
          <div style="color:#F5F5F5;font-size:13px;font-weight:600;">Book a call</div>
          <div style="color:#9a8a6a;font-size:12px;">Get 30 minutes of personal setup help — tap ? → Book a call in the app, or visit <a href="https://calendly.com/tiana-aureusplutus/30min" style="color:#D4AF37;">calendly.com/tiana-aureusplutus/30min</a></div>
        </div>
      </div>
      <div style="display:flex;gap:12px;align-items:flex-start;">
        <span style="font-size:18px;">📖</span>
        <div>
          <div style="color:#F5F5F5;font-size:13px;font-weight:600;">Take the tour</div>
          <div style="color:#9a8a6a;font-size:12px;">Tap the ▶ Tour button in the top right of the app for a guided walkthrough of every feature.</div>
        </div>
      </div>
    </div>
  </div>

  <!-- CTA -->
  <div style="text-align:center;padding:8px 0 16px;">
    <a href="https://aureusplutus.app/dashboard" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#D4AF37,#BC6A1F);color:#111111;font-weight:800;font-size:15px;border-radius:12px;text-decoration:none;letter-spacing:0.5px;">Open Aureus now →</a>
  </div>

  <!-- Legal footer -->
  <div style="text-align:center;padding:8px 0 20px;">
    <div style="color:#3a2e1e;font-size:11px;letter-spacing:1px;margin-bottom:4px;">AUREUS PLUTUS ABN 32 306 872 259 · QUEENSLAND, AUSTRALIA</div>
    <div style="color:#3a2e1e;font-size:10px;line-height:1.8;">
      <a href="https://aureusplutus.app/legal/terms" style="color:#3a2e1e;">Terms</a> ·
      <a href="https://aureusplutus.app/legal/privacy" style="color:#3a2e1e;">Privacy</a> ·
      <a href="https://aureusplutus.app/legal/ai-disclaimer" style="color:#3a2e1e;">AI Disclaimer</a>
    </div>
    <div style="color:#3a2e1e;font-size:10px;margin-top:6px;">Aureus is an AI assistant for general education only — not financial, tax, or legal advice.</div>
  </div>

</div>
</body>
</html>`
}

function buildOwnerNotificationEmail(userName: string, email: string): string {
  const now = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane', dateStyle: 'full', timeStyle: 'short' })
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0d0d0d;margin:0;padding:16px;font-family:Inter,Arial,sans-serif;">
<div style="max-width:480px;margin:0 auto;">
  <div style="background:#1a1810;border:1px solid rgba(212,175,55,0.4);border-radius:14px;padding:24px;">
    <div style="color:#D4AF37;font-size:18px;font-weight:900;letter-spacing:2px;margin-bottom:4px;">AUREUS</div>
    <div style="color:#9a8a6a;font-size:11px;letter-spacing:1px;margin-bottom:20px;">NEW SIGNUP NOTIFICATION</div>
    <div style="background:#111111;border-radius:10px;padding:16px;margin-bottom:16px;">
      <div style="color:#9a8a6a;font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:10px;">NEW USER DETAILS</div>
      <div style="display:flex;gap:8px;margin-bottom:8px;">
        <span style="color:#9a8a6a;font-size:13px;min-width:60px;">Name</span>
        <span style="color:#F5F5F5;font-size:13px;font-weight:600;">${userName || 'Not provided yet'}</span>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:8px;">
        <span style="color:#9a8a6a;font-size:13px;min-width:60px;">Email</span>
        <span style="color:#D4AF37;font-size:13px;font-weight:600;">${email}</span>
      </div>
      <div style="display:flex;gap:8px;">
        <span style="color:#9a8a6a;font-size:13px;min-width:60px;">Time</span>
        <span style="color:#F5F5F5;font-size:13px;">${now}</span>
      </div>
    </div>
    <div style="color:#9a8a6a;font-size:12px;line-height:1.6;">
      Reply directly to <strong style="color:#D4AF37;">${email}</strong> to reach this user.<br>
      View their account in <a href="https://supabase.com/dashboard" style="color:#D4AF37;">Supabase → user_data</a>.
    </div>
  </div>
</div>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  try {
    const { userName, email } = await request.json()
    console.log('send-welcome-email called:', { userName, email })

    if (!email) {
      console.error('send-welcome-email: missing email')
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    const RESEND_KEY = process.env.RESEND_API_KEY
    if (!RESEND_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 })
    }

    const results = { welcomeSent: false, notificationSent: false }

    // Send welcome email to new user
    const welcomeHtml = buildWelcomeEmail(userName, email)
    results.welcomeSent = await sendEmail(
      email,
      `Welcome to Aureus, ${userName || 'Builder'} 🏛️`,
      welcomeHtml,
      RESEND_KEY
    )

    // Send notification to owner
    const notificationHtml = buildOwnerNotificationEmail(userName, email)
    results.notificationSent = await sendEmail(
      OWNER_EMAIL,
      `🆕 New Aureus signup — ${userName || 'unnamed'} (${email})`,
      notificationHtml,
      RESEND_KEY
    )

    return NextResponse.json({ ok: true, ...results })
  } catch (e: any) {
    console.error('Welcome email error:', e)
    return NextResponse.json({ error: e?.message || 'Failed to send welcome email' }, { status: 500 })
  }
}
