// app/api/test-email/route.ts
// TEMPORARY diagnostic route — delete after testing
// Visit: yourapp.vercel.app/api/test-email to see what's wrong

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {}
  }

  // Check 1: Is RESEND_API_KEY set?
  const resendKey = process.env.RESEND_API_KEY
  results.checks.resend_key_set = !!resendKey
  results.checks.resend_key_prefix = resendKey ? resendKey.slice(0, 8) + '...' : 'NOT SET'

  if (!resendKey) {
    return NextResponse.json({
      ...results,
      error: 'RESEND_API_KEY is not set in Vercel environment variables',
      fix: 'Go to Vercel → Settings → Environment Variables → add RESEND_API_KEY'
    })
  }

  // Check 2: Can we reach Resend API?
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`
      },
      body: JSON.stringify({
        from: 'Aureus <onboarding@resend.dev>',
        to: ['tianasmith1989@gmail.com'],
        subject: '✅ Aureus email test — it works!',
        html: `
          <div style="background:#111;padding:32px;font-family:sans-serif;border-radius:12px;max-width:480px;margin:0 auto">
            <div style="color:#D4AF37;font-size:24px;font-weight:900;margin-bottom:8px;">AUREUS</div>
            <h2 style="color:#F5F5F5;margin:0 0 12px">Your email is working! 🏛️</h2>
            <p style="color:#9a8a6a;line-height:1.6">
              This is your Resend test from Aureus. If you're seeing this, 
              your accountability partner emails are set up correctly.
            </p>
            <div style="margin-top:20px;padding:16px;background:#1a1810;border:1px solid #2e2618;border-radius:8px;color:#D4AF37;font-size:13px;">
              Tested at: ${new Date().toLocaleString('en-AU')}
            </div>
          </div>
        `
      })
    })

    const data = await res.json()
    results.checks.resend_status = res.status
    results.checks.resend_response = data

    if (res.ok) {
      results.success = true
      results.message = 'Email sent! Check tianasmith1989@gmail.com inbox (also check spam)'
    } else {
      results.success = false
      results.error = data?.message || data?.name || 'Resend returned an error'
      results.fix = getFixSuggestion(res.status, data)
    }
  } catch (e: any) {
    results.checks.resend_error = e?.message
    results.success = false
    results.error = 'Could not reach Resend API: ' + e?.message
  }

  return NextResponse.json(results, { status: 200 })
}

function getFixSuggestion(status: number, data: any): string {
  if (status === 401) return 'API key is invalid or expired — go to resend.com → API Keys and create a new one'
  if (status === 403) return 'API key does not have send permissions — create a new key with Full Access'
  if (status === 422) {
    if (data?.message?.includes('from')) return 'The "from" address is invalid — use onboarding@resend.dev for testing'
    if (data?.message?.includes('to')) return 'The "to" address is invalid'
    return 'Validation error: ' + JSON.stringify(data)
  }
  if (status === 429) return 'Rate limit hit — wait a minute and try again'
  return 'Unexpected error — check Resend dashboard → Logs for details'
}
