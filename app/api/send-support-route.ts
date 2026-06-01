// app/api/send-support/route.ts
// Handles support contact form submissions.
// Sends notification to Aureus team + confirmation to user.

import { NextRequest, NextResponse } from 'next/server'

const FROM = 'Aureus Support <noreply@aureusplutus.app>'
const TEAM_EMAIL = process.env.SUPPORT_EMAIL || 'hello@aureusplutus.app'

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, appVersion, userName } = await request.json()

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 })

    const timestamp = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' })

    // ── Email 1: Notify team ──
    const teamHtml = `<!DOCTYPE html>
<html>
<body style="background:#f5f5f5;margin:0;padding:20px;font-family:Arial,sans-serif;">
<div style="max-width:540px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">
  <div style="background:#111111;padding:20px 24px;border-bottom:3px solid #D4AF37;">
    <div style="color:#D4AF37;font-size:18px;font-weight:900;letter-spacing:2px;">AUREUS</div>
    <div style="color:#9a8a6a;font-size:12px;margin-top:4px;">NEW SUPPORT REQUEST</div>
  </div>
  <div style="padding:24px;">
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px;width:100px;">From</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#111;font-size:13px;font-weight:600;">${name} &lt;${email}&gt;</td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px;">App user</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#111;font-size:13px;">${userName || 'Not set'}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px;">Received</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#111;font-size:13px;">${timestamp} (AEST)</td>
      </tr>
    </table>
    <div style="margin-top:20px;">
      <div style="color:#666;font-size:12px;font-weight:700;text-transform:uppercase;margin-bottom:8px;">Message</div>
      <div style="background:#f9f9f9;border-left:3px solid #D4AF37;padding:14px 16px;border-radius:0 8px 8px 0;color:#333;font-size:14px;line-height:1.7;">
        ${message.replace(/\n/g, '<br>')}
      </div>
    </div>
    <div style="margin-top:20px;">
      <a href="mailto:${email}?subject=Re: Your Aureus Support Request" 
         style="display:inline-block;padding:12px 24px;background:#D4AF37;color:#111111;font-weight:800;font-size:14px;border-radius:8px;text-decoration:none;">
        Reply to ${name} →
      </a>
    </div>
  </div>
</div>
</body>
</html>`

    // ── Email 2: Confirmation to user ──
    const userHtml = `<!DOCTYPE html>
<html>
<body style="background:#111111;margin:0;padding:24px;font-family:Inter,Arial,sans-serif;">
<div style="max-width:480px;margin:0 auto;background:#1a1810;border-radius:16px;border:1px solid #2e2618;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#1a1810,#111111);padding:24px 28px;border-bottom:1px solid rgba(212,175,55,0.2);">
    <div style="color:#D4AF37;font-size:20px;font-weight:900;letter-spacing:2px;">AUREUS</div>
    <div style="color:#9a8a6a;font-size:11px;letter-spacing:1px;margin-top:4px;">SUPPORT CONFIRMATION</div>
  </div>
  <div style="padding:24px 28px;">
    <p style="color:#F5F5F5;font-size:16px;font-weight:700;margin:0 0 8px;">We've got your message, ${name}.</p>
    <p style="color:#9a8a6a;font-size:14px;line-height:1.7;margin:0 0 20px;">
      Thanks for reaching out. We typically respond within 24 hours — usually much sooner.
    </p>
    <div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);border-radius:10px;padding:16px 18px;margin-bottom:20px;">
      <div style="color:#9a8a6a;font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:8px;">YOUR MESSAGE</div>
      <div style="color:#F5F5F5;font-size:13px;line-height:1.7;">${message.replace(/\n/g, '<br>')}</div>
    </div>
    <p style="color:#6b5e3e;font-size:12px;margin:0;line-height:1.6;">
      While you wait, try the AI Support chat in the app — tap the <strong style="color:#D4AF37;">?</strong> button — it can answer most questions instantly.
    </p>
  </div>
  <div style="padding:16px 28px;border-top:1px solid rgba(212,175,55,0.1);text-align:center;">
    <div style="color:#6b5e3e;font-size:11px;letter-spacing:1px;">WEALTH THROUGH DISCIPLINE · AUREUS</div>
  </div>
</div>
</body>
</html>`

    // Send both emails
    const [teamRes, userRes] = await Promise.all([
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: FROM,
          to: [TEAM_EMAIL],
          reply_to: email,
          subject: `🆘 Aureus Support — ${name}`,
          html: teamHtml
        })
      }),
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: FROM,
          to: [email],
          subject: `We got your message, ${name} — Aureus Support`,
          html: userHtml
        })
      })
    ])

    if (!teamRes.ok) {
      const err = await teamRes.json().catch(() => ({}))
      return NextResponse.json({ error: (err as any)?.message || 'Failed to send' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Support email error:', error)
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
