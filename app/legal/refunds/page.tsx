// app/legal/refunds/page.tsx
import { LegalPage } from '../LegalPage'

export const metadata = {
  title: 'Refund Policy — Aureus Plutus',
  description: 'Refund Policy for Aureus Plutus subscriptions.',
}

export default function RefundsPage() {
  return (
    <LegalPage
      title="Refund Policy"
      subtitle="Your rights and our approach to refunds."
      effective="4 June 2026"
      updated="4 June 2026"
    >
      <div className="legal-summary">
        <div className="legal-summary-inner">
          <div className="legal-summary-label">Plain English Summary — not the policy</div>
          <p>You have rights under the Australian Consumer Law that we can't take away, and this policy never reduces them. If something is genuinely wrong with Aureus, you may be entitled to a refund. Because subscriptions are digital and billed in advance, we generally don't refund change‑of‑mind cancellations for a period you've already started — but we'll always honour your legal rights, and we try to be fair beyond them.</p>
        </div>
      </div>

      <div className="legal-body">

        <p>This Refund Policy explains how refunds work for paid subscriptions to the Aureus Service, provided by <strong>Aureus Plutus</strong> (ABN 32 306 872 259), a sole trader with a registered business name in Queensland, Australia. It forms part of, and should be read with, the <strong><a href="/legal/subscription">Subscription Terms</a></strong> and <strong><a href="/legal/terms">Website & App Terms and Conditions</a></strong>.</p>

        <h2>1. Your rights under the Australian Consumer Law</h2>
        <p><span className="clause-num">1.1</span> Our Service comes with <strong>guarantees that cannot be excluded</strong> under the Australian Consumer Law (ACL). Among other things, the services we supply must be:</p>
        <ul>
          <li>provided with <strong>due care and skill</strong></li>
          <li><strong>reasonably fit</strong> for any purpose you told us about (or that we represented they were fit for)</li>
          <li>supplied within a <strong>reasonable time</strong> where no time is agreed</li>
        </ul>
        <p><span className="clause-num">1.2</span> <strong>If we fail to meet a consumer guarantee, you have rights to a remedy</strong> — which may include having the problem fixed, a refund, or compensation — depending on whether the failure is major or minor:</p>
        <ul>
          <li><strong>Major failure</strong> (for example, the Service has a problem that would have stopped you subscribing had you known about it, or it is substantially unfit for purpose and can't be easily fixed within a reasonable time): you can cancel and choose a <strong>refund</strong>, or keep the subscription and seek compensation for the drop in value.</li>
          <li><strong>Minor failure</strong> that can be fixed: we may choose to fix the problem within a reasonable time at no cost to you. If we don't, you can have it fixed elsewhere and recover reasonable costs, or cancel for a refund.</li>
        </ul>
        <p><span className="clause-num">1.3</span> <strong>What "reasonable time" means for Aureus.</strong> We aim to resolve issues within the following timeframes, which we consider reasonable for a subscription service at this price point:</p>
        <ul>
          <li><strong>Critical issues</strong> (app completely inaccessible, inability to log in, data loss): <strong>48 hours</strong></li>
          <li><strong>Major feature failures</strong> (core features not working, such as budgets not saving or AI coach not responding): <strong>3–5 business days</strong></li>
          <li><strong>Minor issues</strong> (cosmetic bugs, minor feature misbehaviour): <strong>7–14 business days</strong></li>
        </ul>
        <p>If your issue is not resolved within the applicable timeframe, please contact us at <a href="mailto:support@aureusplutus.app">support@aureusplutus.app</a> and we will discuss your options, which may include a refund. These timeframes do not limit your rights under the ACL where a failure cannot be fixed within a reasonable time regardless of the above.</p>
        <div className="info-box"><strong>Nothing in this policy excludes, restricts or modifies your ACL rights.</strong> If anything in this policy is inconsistent with the ACL, the ACL prevails.</div>

        <h2>2. Change‑of‑mind cancellations</h2>
        <p><span className="clause-num">2.1</span> Aureus is a digital subscription billed in advance. If you simply change your mind, you can cancel at any time (see the <strong><a href="/legal/subscription">Subscription Terms</a></strong>), and you will keep access until the end of the period you have already paid for.</p>
        <p><span className="clause-num">2.2</span> For change‑of‑mind cancellations, we <strong>generally do not provide refunds</strong> for the remainder of a billing period that has already begun. This does <strong>not</strong> affect your rights under clause 1 where there is a problem with the Service.</p>
        <p><span className="clause-num">2.3</span> Beyond your legal rights, we may — at our discretion — offer a refund or credit as a goodwill gesture (for example, if you cancel very shortly after an unintended renewal). Contact us at <a href="mailto:support@aureusplutus.app">support@aureusplutus.app</a> and we aim to be reasonable.</p>

        <h2>3. Annual plans, trials and renewals</h2>
        <p><span className="clause-num">3.1</span> <strong>Free trials.</strong> If you cancel during a free trial, you are not charged. If a trial converts to a paid plan because you did not cancel in time, clause 2 applies, but we will consider goodwill refunds for renewals charged very recently — please contact us promptly.</p>
        <p><span className="clause-num">3.2</span> <strong>Unintended renewals.</strong> If you were charged on an automatic renewal you did not intend, contact us within <strong>14 days</strong> of the charge. We will consider a refund or credit in good faith.</p>
        <p><span className="clause-num">3.3</span> <strong>Annual plans.</strong> If you cancel an annual plan partway through, you keep access until the end of the paid year and, except where the ACL requires otherwise or we agree, we do not refund the unused portion.</p>

        <h2>4. When we may not provide a refund</h2>
        <p>Outside your ACL rights, we are generally not required to provide a refund where:</p>
        <ul>
          <li>you simply changed your mind after the billing period started (subject to clause 2.3)</li>
          <li>you didn't like a feature, or didn't use the Service</li>
          <li>a problem was caused by your own equipment, internet connection, or a third party (such as your bank or a Data Provider) outside our control</li>
          <li>you breached the <strong><a href="/legal/terms">Website & App Terms and Conditions</a></strong></li>
        </ul>
        <p>This clause never limits your rights under clause 1.</p>

        <h2>5. App‑store purchases</h2>
        <p><span className="clause-num">5.1</span> If you subscribed through the Apple App Store or Google Play, refunds may need to be requested through that store under its refund process. We will help where we can, and your ACL rights still apply regardless of where you purchased.</p>

        <h2>6. How to request a refund</h2>
        <p><span className="clause-num">6.1</span> Contact us at <a href="mailto:support@aureusplutus.app">support@aureusplutus.app</a> with your account email, the charge date and amount, and a description of the issue. Where you are claiming a consumer‑guarantee failure, please tell us what went wrong so we can investigate.</p>
        <p><span className="clause-num">6.2</span> We will acknowledge your request within <strong>1–2 business days</strong> and aim to resolve it within <strong>5–10 business days</strong>. If a refund is due, we process it to your original payment method within a reasonable time after we approve it (typically 5–10 business days depending on your bank or payment provider).</p>
        <p><span className="clause-num">6.3</span> If you disagree with our decision, you may also seek assistance from the <strong>ACCC</strong> (<a href="https://www.accc.gov.au" target="_blank" rel="noopener noreferrer">www.accc.gov.au</a>) or your state or territory consumer protection agency.</p>

        <h2>7. Changes to this policy</h2>
        <p>We may update this Refund Policy from time to time. Changes are not retrospective and never reduce your rights under the ACL. The current version will always be available in the App and on the Website.</p>

        <div className="legal-contact">
          <div className="legal-contact-title">Refund Requests</div>
          <div className="legal-contact-row"><span className="legal-contact-label">Business</span><span className="legal-contact-value">Aureus Plutus ABN 32 306 872 259 (Sole Trader)</span></div>
          <div className="legal-contact-row"><span className="legal-contact-label">Address</span><span className="legal-contact-value">Queensland, Australia</span></div>
          <div className="legal-contact-row"><span className="legal-contact-label">Email</span><span className="legal-contact-value"><a href="mailto:support@aureusplutus.app">support@aureusplutus.app</a></span></div>
          <div className="legal-contact-row"><span className="legal-contact-label">ACCC</span><span className="legal-contact-value"><a href="https://www.accc.gov.au" target="_blank" rel="noopener noreferrer">www.accc.gov.au</a></span></div>
        </div>

      </div>
    </LegalPage>
  )
}
