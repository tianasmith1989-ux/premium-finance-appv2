// app/api/send-accountability/route.ts
// Sends a weekly snapshot email to an accountability partner.
// Uses Resend (https://resend.com) — free tier: 3,000 emails/month.
// Set RESEND_API_KEY in your Vercel environment variables.

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const {
      partnerName, partnerEmail, userName,
      savingRate, surplus, topGoal, topWin, nextAction, frequency
    } = await request.json()

    if (!partnerEmail || !partnerName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const freqLabel = frequency === 'fortnightly' ? 'fortnightly' : 'weekly'
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="background:#111111;margin:0;padding:24px;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#1a1810;border-radius:16px;border:1px solid #2e2618;overflow:hidden;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a1810,#111111);padding:24px 28px;border-bottom:1px solid rgba(212,175,55,0.2);">
      <div style="color:#D4AF37;font-size:22px;font-weight:900;letter-spacing:2px;margin-bottom:4px;">AUREUS</div>
      <div style="color:#9a8a6a;font-size:11px;letter-spacing:1px;">${freqLabel.toUpperCase()} SNAPSHOT</div>
    </div>
    <!-- Body -->
    <div style="padding:24px 28px;">
      <p style="color:#F5F5F5;font-size:15px;line-height:1.6;margin:0 0 20px;">
        Hey ${partnerName}, ${userName} shared their Aureus ${freqLabel} snapshot with you.
      </p>
      <!-- Stats grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
        <div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);border-radius:10px;padding:14px;">
          <div style="color:#9a8a6a;font-size:10px;letter-spacing:1px;margin-bottom:4px;">SAVING RATE</div>
          <div style="color:#D4AF37;font-size:22px;font-weight:800;">${savingRate}%</div>
        </div>
        <div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);border-radius:10px;padding:14px;">
          <div style="color:#9a8a6a;font-size:10px;letter-spacing:1px;margin-bottom:4px;">MONTHLY SURPLUS</div>
          <div style="color:#D4AF37;font-size:22px;font-weight:800;">$${surplus.toLocaleString()}</div>
        </div>
      </div>
      ${topGoal ? `
      <div style="background:rgba(255,255,255,0.03);border:1px solid #2e2618;border-radius:10px;padding:14px;margin-bottom:12px;">
        <div style="color:#9a8a6a;font-size:10px;letter-spacing:1px;margin-bottom:8px;">TOP GOAL</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="color:#F5F5F5;font-size:14px;">${topGoal.name}</span>
          <span style="color:#D4AF37;font-size:13px;font-weight:700;">${topGoal.pct}%</span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,0.1);border-radius:3px;">
          <div style="width:${topGoal.pct}%;height:100%;background:linear-gradient(90deg,#D4AF37,#BC6A1F);border-radius:3px;"></div>
        </div>
      </div>` : ''}
      ${topWin ? `<div style="padding:12px 14px;background:rgba(180,212,55,0.06);border:1px solid rgba(180,212,55,0.2);border-radius:10px;margin-bottom:12px;color:#9a8a6a;font-size:13px;">🏆 <strong style="color:#F5F5F5;">Latest win:</strong> ${topWin}</div>` : ''}
      ${nextAction ? `<div style="padding:12px 14px;background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.2);border-radius:10px;margin-bottom:20px;color:#9a8a6a;font-size:13px;">⚡ <strong style="color:#D4AF37;">Next move:</strong> ${nextAction}</div>` : ''}
      <p style="color:#6b5e3e;font-size:12px;margin:0;line-height:1.6;">
        This snapshot was shared by ${userName} from their Aureus financial coach. 
        Aureus helps Australians pay off debt faster and build real wealth.
      </p>
    </div>
    <div style="padding:16px 28px;border-top:1px solid rgba(212,175,55,0.1);text-align:center;">
      <div style="color:#6b5e3e;font-size:11px;letter-spacing:1px;">WEALTH THROUGH DISCIPLINE · AUREUS</div>
    </div>
  </div>
</body>
</html>`

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      // No email key — return success with a note (dev mode)
      console.log('RESEND_API_KEY not set — email would send to:', partnerEmail)
      return NextResponse.json({ ok: true, note: 'dev mode — set RESEND_API_KEY to send real emails' })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: 'Aureus <noreply@yourdomain.com>', // ← replace with your verified Resend domain
        to: [partnerEmail],
        subject: `${userName}'s Aureus ${freqLabel} snapshot 🏛️`,
        html,
      })
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: (err as any)?.message || 'Email failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
