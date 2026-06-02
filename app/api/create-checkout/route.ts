// app/api/create-checkout/route.ts
// $1 for 7 days → $14.99/month or $99/year

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { plan, userToken, promoCode, email } = await request.json()

    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aureusplutus.app'
    const monthlyPriceId = process.env.STRIPE_MONTHLY_PRICE_ID
    const annualPriceId = process.env.STRIPE_ANNUAL_PRICE_ID

    if (!monthlyPriceId || !annualPriceId) {
      return NextResponse.json({ error: 'Stripe price IDs not configured' }, { status: 500 })
    }

    const priceId = plan === 'annual' ? annualPriceId : monthlyPriceId

    // Build params as URL-encoded string for Stripe API
    const params: Record<string, any> = {
      mode: 'subscription',
      'payment_method_types[0]': 'card',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      success_url: `${appUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard?checkout=cancelled`,
      client_reference_id: userToken,
      'metadata[userToken]': userToken,
      'metadata[source]': 'aureus_app',
      'subscription_data[metadata][userToken]': userToken,
    }

    if (email) params['customer_email'] = email
    if (promoCode) {
      params['discounts[0][promotion_code]'] = promoCode
    } else {
      params['allow_promotion_codes'] = 'true'
    }

    // Add $1 for the trial period on monthly plan
    if (plan === 'monthly') {
      params['subscription_data[trial_period_days]'] = '7'
    }

    const formBody = Object.entries(params)
      .filter(([, v]) => v !== '' && v !== null && v !== undefined)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody
    })

    const session = await stripeRes.json()
    if (!stripeRes.ok) {
      console.error('Stripe error:', session)
      return NextResponse.json({ error: session.error?.message || 'Stripe error' }, { status: 400 })
    }

    return NextResponse.json({ url: session.url, sessionId: session.id })

  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
