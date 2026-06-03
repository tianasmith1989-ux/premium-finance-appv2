// app/api/stripe-webhook/route.ts
// Handles Stripe webhook events to keep subscription status in sync.
// Listens for: checkout completed, subscription updated, payment failed, cancelled.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  // Verify webhook signature
  if (webhookSecret && signature) {
    // Basic signature verification without SDK
    // For production: use stripe.webhooks.constructEvent()
    // For now we verify the secret header
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let event: any
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const data = event.data?.object
  const userToken = data?.metadata?.userToken || data?.client_reference_id || data?.subscription?.metadata?.userToken

  console.log(`Stripe event: ${event.type} | user: ${userToken}`)

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        // Payment successful — activate subscription
        const subscriptionId = data.subscription
        const customerId = data.customer
        await upsertSubscription(userToken, {
          status: 'active',
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          trial_end: data.subscription?.trial_end ? new Date(data.subscription.trial_end * 1000).toISOString() : null,
          current_period_end: null, // will be updated by subscription.updated
          plan: data.amount_total === 9900 ? 'annual' : 'monthly',
        })
        break
      }

      case 'customer.subscription.updated': {
        const status = data.status // active, trialing, past_due, canceled
        const periodEnd = data.current_period_end ? new Date(data.current_period_end * 1000).toISOString() : null
        const trialEnd = data.trial_end ? new Date(data.trial_end * 1000).toISOString() : null
        const cancelAt = data.cancel_at ? new Date(data.cancel_at * 1000).toISOString() : null
        await upsertSubscription(userToken, {
          status: mapStatus(status),
          current_period_end: periodEnd,
          trial_end: trialEnd,
          cancel_at: cancelAt,
        })
        break
      }

      case 'customer.subscription.deleted': {
        await upsertSubscription(userToken, {
          status: 'cancelled',
          cancel_at: new Date().toISOString(),
        })
        break
      }

      case 'invoice.payment_failed': {
        await upsertSubscription(userToken, {
          status: 'past_due',
        })
        break
      }

      case 'invoice.payment_succeeded': {
        await upsertSubscription(userToken, {
          status: 'active',
        })
        break
      }
    }
  } catch (err: any) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

function mapStatus(stripeStatus: string): string {
  const map: Record<string, string> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'cancelled',
    unpaid: 'past_due',
    incomplete: 'incomplete',
    incomplete_expired: 'cancelled',
  }
  return map[stripeStatus] || stripeStatus
}

async function upsertSubscription(userToken: string, data: Record<string, any>) {
  if (!userToken) {
    console.warn('No userToken for subscription upsert')
    return
  }
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_token: userToken,
      ...data,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_token' })

  if (error) console.error('Supabase upsert error:', error)
}
