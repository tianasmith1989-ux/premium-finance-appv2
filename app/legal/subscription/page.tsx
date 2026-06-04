// ══════════════════════════════════════════════════════════
// app/legal/subscription/page.tsx
// ══════════════════════════════════════════════════════════
import { LegalPage } from '../LegalPage'

export const metadata = {
  title: 'Subscription Terms — Aureus Plutus',
  description: 'Plans, fees, billing and cancellation for Aureus Plutus subscriptions.',
}

export default function SubscriptionPage() {
  return (
    <LegalPage
      title="Subscription Terms"
      subtitle="Plans, fees, billing and cancellation."
      effective="4 June 2026"
      updated="4 June 2026"
    >
      <div className="legal-summary">
        <div className="legal-summary-inner">
          <div className="legal-summary-label">Plain English Summary — not the contract</div>
          <p>We'll always tell you the price, billing frequency, and that paid plans renew automatically until you cancel. You can cancel any time before your next renewal and keep access until the period ends. Free trials convert to paid unless you cancel before the trial ends — we'll remind you. If we change the price, we'll give you notice first and you can cancel. Your rights under the Australian Consumer Law still apply.</p>
        </div>
      </div>

      <div className="legal-body">

        <p>These Subscription Terms form part of, and should be read with, the <strong><a href="/legal/terms">Website & App Terms and Conditions</a></strong>, the <strong><a href="/legal/refunds">Refund Policy</a></strong> and the <strong><a href="/legal/privacy">Privacy Policy</a></strong>. They apply to paid subscriptions to the Aureus Service offered by <strong>Aureus Plutus</strong> (ABN 32 306 872 259), a sole trader with a registered business name in Queensland, Australia.</p>

        <h2>1. Plans and what you get</h2>
        <p><span className="clause-num">1.1</span> We offer one or more subscription plans (each a <strong>Plan</strong>). The features, limits and price of each Plan are shown at the point of purchase in the App or on the Website and may change over time as set out in clause 6.</p>
        <p><span className="clause-num">1.2</span> A <strong>Free</strong> tier (if offered) is provided at no charge and may have reduced features. We may modify or withdraw a free tier on reasonable notice.</p>

        <h2>2. Prices, taxes and currency</h2>
        <p><span className="clause-num">2.1</span> All prices are in <strong>Australian dollars (AUD)</strong> and, unless stated otherwise, are inclusive of GST.</p>
        <p><span className="clause-num">2.2</span> The price shown at purchase is the price you pay for that billing period. We will always disclose the total price, the billing frequency, and whether the Plan renews automatically, before you commit.</p>

        <h2>3. Billing and automatic renewal</h2>
        <p><span className="clause-num">3.1</span> <strong>Billing cycle.</strong> Subscriptions are billed in advance on a recurring basis — monthly or annually — depending on the Plan you choose.</p>
        <div className="warning-box">⚠️ <strong>Automatic renewal — please read.</strong> Unless you cancel before the end of the current billing period, your subscription will renew automatically for a further period of the same length, and we will charge your nominated payment method at the then‑current price.</div>
        <p><span className="clause-num">3.2</span> <strong>Payment method.</strong> You authorise us and our payment processor to charge your nominated payment method for all fees as they fall due. You must keep your payment details current. If a payment fails, we may retry and may suspend paid features until payment succeeds; we will let you know.</p>
        <p><span className="clause-num">3.3</span> <strong>App‑store purchases.</strong> If you subscribe through the Apple App Store or Google Play, billing, renewal and cancellation are handled by that store under its rules, and you may need to manage or cancel your subscription through the store.</p>
        <p><span className="clause-num">3.4</span> <strong>Reminders.</strong> Where required by law or as a matter of good practice, we will send reminders before a free trial converts and before certain renewals.</p>

        <h2>4. Free trials</h2>
        <p><span className="clause-num">4.1</span> We may offer a free trial of a paid Plan. Unless you cancel <strong>before the trial ends</strong>, your subscription will automatically convert to a paid subscription and you will be charged at the then‑current price.</p>
        <p><span className="clause-num">4.2</span> We will tell you the length of the trial, when it ends, and the price that will apply, before you start it. You can cancel at any time during the trial in the App.</p>
        <p><span className="clause-num">4.3</span> Free trials may be limited to new customers and to one per person; we may withdraw or change trial offers.</p>

        <h2>5. Cancellation</h2>
        <p><span className="clause-num">5.1</span> <strong>You can cancel at any time</strong> through your account settings in the App, or — for app‑store subscriptions — through the relevant app store. Cancellation takes effect at the end of the current billing period.</p>
        <p><span className="clause-num">5.2</span> When you cancel, you keep access to paid features until the end of the period you have already paid for. We do not provide pro‑rata refunds for partial periods unless required by the <strong><a href="/legal/refunds">Refund Policy</a></strong> or the Australian Consumer Law.</p>
        <p><span className="clause-num">5.3</span> After your paid access ends, you may move to a free tier (if available) or your account may become inactive. We handle your data after cancellation in accordance with the <strong><a href="/legal/privacy">Privacy Policy</a></strong>.</p>

        <h2>6. Price and Plan changes</h2>
        <p><span className="clause-num">6.1</span> We may change Plan prices, features or limits. If we increase the price of your Plan or make a change that is material and adverse to you, we will give you at least <strong>30 days' notice</strong> (by email or in‑app) before it takes effect.</p>
        <p><span className="clause-num">6.2</span> If you do not accept the change, you can cancel before it takes effect and you will not be charged the new price. If you do not cancel, the change applies from your next billing period.</p>
        <p><span className="clause-num">6.3</span> We will not change the price for a billing period you have already paid for.</p>

        <h2>7. Promotions and discounts</h2>
        <p><span className="clause-num">7.1</span> We may offer promotional pricing or discounts on stated terms. Unless we say otherwise, promotions are time‑limited, are not transferable or redeemable for cash, and revert to standard pricing at renewal.</p>

        <h2>8. Your Australian Consumer Law rights</h2>
        <p><span className="clause-num">8.1</span> Our Service comes with guarantees that <strong>cannot be excluded</strong> under the Australian Consumer Law. Nothing in these Subscription Terms excludes, restricts or modifies those rights. If there is a problem with the Service, you may be entitled to a remedy under the ACL — see our <strong><a href="/legal/refunds">Refund Policy</a></strong>.</p>

        <h2>9. Suspension, downgrade and termination</h2>
        <p><span className="clause-num">9.1</span> We may suspend, downgrade or terminate your subscription in accordance with the <strong><a href="/legal/terms">Website & App Terms and Conditions</a></strong>. Where we end a paid subscription other than for your breach, we will refund any prepaid fees for the unused period.</p>

        <h2>10. Changes to these Subscription Terms</h2>
        <p><span className="clause-num">10.1</span> We may update these Subscription Terms. If a change is material and adverse to you, we will give at least <strong>30 days' notice</strong> before it takes effect, and you may cancel before then if you do not agree.</p>

        <div className="legal-contact">
          <div className="legal-contact-title">Billing Contact</div>
          <div className="legal-contact-row"><span className="legal-contact-label">Business</span><span className="legal-contact-value">Aureus Plutus ABN 32 306 872 259 (Sole Trader)</span></div>
          <div className="legal-contact-row"><span className="legal-contact-label">Address</span><span className="legal-contact-value">Queensland, Australia</span></div>
          <div className="legal-contact-row"><span className="legal-contact-label">Billing</span><span className="legal-contact-value"><a href="mailto:support@aureusplutus.app">support@aureusplutus.app</a></span></div>
        </div>

      </div>
    </LegalPage>
  )
}
