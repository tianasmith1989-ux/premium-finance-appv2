// app/api/send-welcome-email/route.ts
// Sends a welcome email to new users on signup
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
  <div style="background:#1a1810;border:1px solid rgba(212,175,55,0.4);border-radius:16px;padding:28px;margin-bottom:14px;text-align:center;">
    <div style="color:#D4AF37;font-size:28px;font-weight:900;letter-spacing:3px;margin-bottom:4px;">AUREUS</div>
    <div style="color:#9a8a6a;font-size:12px;letter-spacing:2px;">WEALTH THROUGH DISCIPLINE</div>
    <div style="margin:20px 0;height:1px;background:rgba(212,175,55,0.2);"></div>
    <h1 style="color:#F5F5F5;font-size:24px;font-weight:800;margin:0 0 8px;">Welcome, ${name}. 🏛️</h1>
    <p style="color:#9a8a6a;font-size:15px;margin:0;line-height:1.6;">Aureus is coaching you now. Here's what happens next.</p>
  </div>

  <!-- What just happened -->
  <div style="background:#1a1810;border:1px solid #2e2618;border-radius:14px;padding:22px;margin-bottom:14px;">
    <div style="color:#D4AF37;font-size:12px;font-weight:700;letter-spacing:1.5px;margin-bottom:14px;">WHAT JUST HAPPENED</div>
    <p style="color:#F5F5F5;font-size:14px;line-height:1.75;margin:0 0 12px;">
      You answered 5 quick questions and Aureus has your snapshot — your income, housing, debt situation, safety net, and the one money thing you most want sorted.
    </p>
    <p style="color:#9a8a6a;font-size:14px;line-height:1.75;margin:0;">
      Based on those answers, Aureus has placed you on your Wealth Step and identified your highest-impact next move. That's in the app waiting for you.
    </p>
  </div>

  <!-- Tomorrow's email -->
  <div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);border-radius:14px;padding:22px;margin-bottom:14px;">
    <div style="color:#D4AF37;font-size:12px;font-weight:700;letter-spacing:1.5px;margin-bottom:14px;">⏰ TOMORROW AT 8AM</div>
    <p style="color:#F5F5F5;font-size:14px;line-height:1.75;margin:0 0 12px;">
      Your first daily brief arrives in your inbox at 8am AEST. It will show:
    </p>
    ${[
      ['📅', 'Bills due this week', 'so nothing catches you off guard'],
      ['💰', 'Your weekly money snapshot', 'income, outgoings, and what\'s yours to spend'],
      ['🏁', 'Your progress countdowns', 'how long until your goal is reached, debt is cleared, mortgage is gone'],
      ['⚡', 'One thing to do today', 'the highest-leverage action for your specific situation'],
    ].map(([icon, title, desc]) => `
    <div style="display:flex;gap:12px;margin-bottom:10px;align-items:flex-start;">
      <span style="font-size:18px;flex-shrink:0;">${icon}</span>
      <div>
        <span style="color:#F5F5F5;font-size:13px;font-weight:700;">${title}</span>
        <span style="color:#9a8a6a;font-size:13px;"> — ${desc}</span>
      </div>
    </div>`).join('')}
    <p style="color:#6b5e3e;font-size:12px;margin:10px 0 0;">You're subscribed automatically. Unsubscribe anytime from the Insights tab.</p>
  </div>

  <!-- One thing to do now -->
  <div style="background:#1a1810;border:1px solid #2e2618;border-radius:14px;padding:22px;margin-bottom:14px;">
    <div style="color:#D4AF37;font-size:12px;font-weight:700;letter-spacing:1.5px;margin-bottom:14px;">ONE THING TO DO RIGHT NOW</div>
    <p style="color:#F5F5F5;font-size:14px;line-height:1.75;margin:0 0 14px;">
      Go to the <strong style="color:#D4AF37;">Aureus tab</strong> and ask: <em style="color:#d4cdb8;">"What should I focus on?"</em>
    </p>
    <p style="color:#9a8a6a;font-size:13px;line-height:1.6;margin:0;">
      Aureus knows your numbers. It will give you a specific, personalised answer — not a generic tip. That's the whole point.
    </p>
  </div>

  <!-- What's in the app -->
  <div style="background:#1a1810;border:1px solid #2e2618;border-radius:14px;padding:22px;margin-bottom:14px;">
    <div style="color:#D4AF37;font-size:12px;font-weight:700;letter-spacing:1.5px;margin-bottom:14px;">EVERYTHING IN AUREUS</div>
    ${[
      ['🏠', 'Home', 'Your daily dashboard — streak, next action, bills due'],
      ['💬', 'Aureus', 'Your AI coach — ask anything, knows your real numbers'],
      ['⚡', 'Change', 'Mindset work — Cost of Inaction, Values, Guided Visualisation'],
      ['🏛️', 'Treasury', 'Income, expenses, debts, goals, budget vs actual'],
      ['🛤️', 'Roadmap', 'Wealth Steps progress, milestones, action plans'],
      ['📈', 'Grow', 'FIRE number, net worth, super, wealth trajectory'],
      ['🏆', 'Wins', 'Every financial victory — logged and celebrated'],
      ['🧠', 'Insights', 'AI spending analysis, health score, email settings'],
    ].map(([icon, tab, desc]) => `
    <div style="display:flex;gap:12px;padding:7px 0;border-bottom:1px solid #1e1a10;align-items:center;">
      <span style="font-size:16px;flex-shrink:0;">${icon}</span>
      <span style="color:#D4AF37;font-size:13px;font-weight:600;min-width:80px;flex-shrink:0;">${tab}</span>
      <span style="color:#9a8a6a;font-size:12px;">${desc}</span>
    </div>`).join('')}
  </div>

  <!-- Get help -->
  <div style="background:rgba(212,175,55,0.04);border:1px solid rgba(212,175,55,0.15);border-radius:14px;padding:22px;margin-bottom:14px;">
    <div style="color:#D4AF37;font-size:12px;font-weight:700;letter-spacing:1.5px;margin-bottom:14px;">NEED HELP?</div>
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div style="display:flex;gap:12px;align-items:flex-start;">
        <span style="font-size:18px;">💬</span>
        <div>
          <div style="color:#F5F5F5;font-size:13px;font-weight:600;">In-app support</div>
          <div style="color:#9a8a6a;font-size:12px;">Tap the <strong style="color:#D4AF37;">?</strong> button in the top right corner of the app.</div>
        </div>
      </div>
      <div style="display:flex;gap:12px;align-items:flex-start;">
        <span style="font-size:18px;">✉️</span>
        <div>
          <div style="color:#F5F5F5;font-size:13px;font-weight:600;">Email</div>
          <div style="color:#9a8a6a;font-size:12px;">Reply to this email or write to <a href="mailto:support@aureusplutus.app" style="color:#D4AF37;">support@aureusplutus.app</a></div>
        </div>
      </div>
      <div style="display:flex;gap:12px;align-items:flex-start;">
        <span style="font-size:18px;">📅</span>
        <div>
          <div style="color:#F5F5F5;font-size:13px;font-weight:600;">Book a call</div>
          <div style="color:#9a8a6a;font-size:12px;">30 minutes of personal setup help — <a href="https://calendly.com/tiana-aureusplutus/30min" style="color:#D4AF37;">book here</a> or tap ? in the app.</div>
        </div>
      </div>
      <div style="display:flex;gap:12px;align-items:flex-start;">
        <span style="font-size:18px;">▶️</span>
        <div>
          <div style="color:#F5F5F5;font-size:13px;font-weight:600;">App tour</div>
          <div style="color:#9a8a6a;font-size:12px;">Tap the Tour button in the top right of the app for a walkthrough of every feature.</div>
        </div>
      </div>
    </div>
  </div>

  <!-- CTA -->
  <div style="text-align:center;padding:8px 0 16px;">
    <a href="https://aureusplutus.app/dashboard" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#D4AF37,#BC6A1F);color:#111111;font-weight:800;font-size:15px;border-radius:12px;text-decoration:none;letter-spacing:0.5px;">Open Aureus →</a>
  </div>

  <!-- Footer -->
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

    const welcomeHtml = buildWelcomeEmail(userName, email)
    results.welcomeSent = await sendEmail(
      email,
      `Welcome to Aureus, ${userName || 'Builder'} — your first brief lands tomorrow 🏛️`,
      welcomeHtml,
      RESEND_KEY
    )

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
