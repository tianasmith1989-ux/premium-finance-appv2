// app/api/create-portal-session/route.ts
// Creates a Stripe Customer Portal session for subscription management & cancellation

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userToken, email } = await request.json()

    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aureusplutus.app'

    // Find the customer by userToken stored in subscription metadata
    let customerId: string | null = null

    // Search by metadata userToken
    const subsRes = await fetch(
      `https://api.stripe.com/v1/subscriptions?limit=10`,
      { headers: { 'Authorization': `Bearer ${stripeKey}` } }
    )
    const subsData = await subsRes.json()

    // Find subscription matching this user token
    const matchingSub = subsData.data?.find((s: any) =>
      s.metadata?.userToken === userToken ||
      s.client_reference_id === userToken
    )

    if (matchingSub) {
      customerId = matchingSub.customer
    }

    // If not found by token, try by email
    if (!customerId && email) {
      const custRes = await fetch(
        `https://api.stripe.com/v1/customers?email=${encodeURIComponent(email)}&limit=1`,
        { headers: { 'Authorization': `Bearer ${stripeKey}` } }
      )
      const custData = await custRes.json()
      if (custData.data?.length) customerId = custData.data[0].id
    }

    if (!customerId) {
      return NextResponse.json({ error: 'No subscription found for this account.' }, { status: 404 })
    }

    // Create Stripe Customer Portal session
    const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `customer=${customerId}&return_url=${encodeURIComponent(appUrl + '/dashboard')}`
    })

    const portal = await portalRes.json()

    if (!portalRes.ok) {
      console.error('Portal error:', portal)
      return NextResponse.json({ error: portal.error?.message || 'Could not open billing portal' }, { status: 400 })
    }

    return NextResponse.json({ url: portal.url })

  } catch (error: any) {
    console.error('Portal session error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to create portal session' }, { status: 500 })
  }
}
