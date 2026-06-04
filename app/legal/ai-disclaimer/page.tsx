// app/legal/ai-disclaimer/page.tsx
import { LegalPage } from '../LegalPage'

export const metadata = {
  title: 'AI Disclaimer — Aureus Plutus',
  description: 'How Aureus Plutus AI features work and their limitations.',
}

export default function AIDisclaimerPage() {
  return (
    <LegalPage
      title="AI Disclaimer"
      subtitle="How our AI features work and their limits."
      effective="4 June 2026"
      updated="4 June 2026"
    >
      <div className="legal-summary">
        <div className="legal-summary-inner">
          <div className="legal-summary-label">Plain English Summary — not the disclaimer</div>
          <p>Aureus uses AI to help you understand your own money. It's a tool, not an adviser. The AI can be wrong, incomplete or out of date, and it doesn't know your full situation. <strong>Nothing it produces is financial, tax, legal or accounting advice</strong>, and you shouldn't make decisions based only on what it says. Always check important numbers yourself and get professional advice before acting.</p>
        </div>
      </div>

      <div className="legal-body">

        <p>This AI Disclaimer explains how Aureus Plutus's artificial intelligence (<strong>AI</strong>) features work and their limits. It forms part of, and should be read with, the <strong><a href="/legal/terms">Website & App Terms and Conditions</a></strong> and the <strong><a href="/legal/privacy">Privacy Policy</a></strong>. It applies to the Service provided by <strong>Aureus Plutus</strong> (ABN 32 306 872 259), a sole trader with a registered business name in Queensland, Australia.</p>

        <h2>1. What our AI does</h2>
        <p><span className="clause-num">1.1</span> Aureus uses AI and automated processing to help you manage your own finances — for example, to categorise transactions, detect spending patterns, summarise your accounts, forecast cash flow, and generate general insights, suggestions and answers to your questions about your own money.</p>
        <p><span className="clause-num">1.2</span> These features are <strong>information and productivity tools</strong>. They are designed to save you time and help you understand your finances, not to replace professional judgement.</p>

        <h2>2. Not financial, tax, legal or accounting advice</h2>
        <div className="warning-box">⚠️ <strong>Aureus does not provide financial product advice.</strong> Nothing produced by our AI is personal advice, a product recommendation, or taxation, accounting, credit or legal advice.</div>
        <p><span className="clause-num">2.1</span> AI outputs are <strong>general information only</strong> and do not take into account your objectives, financial situation or needs. Before acting on anything the AI produces, consider whether it is appropriate for you and seek advice from a licensed financial adviser, registered tax agent, accountant or lawyer as appropriate.</p>
        <p><span className="clause-num">2.2</span> We are <strong>not</strong> the holder of an Australian Financial Services Licence or an Australian Credit Licence.</p>

        <h2>3. AI has limits — outputs may be wrong</h2>
        <p><span className="clause-num">3.1</span> AI systems generate outputs based on patterns in data and can be <strong>inaccurate, incomplete, outdated, biased, or misleading</strong>. They can "hallucinate" — that is, produce confident‑sounding information that is wrong.</p>
        <p><span className="clause-num">3.2</span> Our insights depend on data imported from your financial institutions and Data Providers. If that data is incomplete, delayed or incorrect, the AI's outputs will be affected. We do not control or guarantee the accuracy of third‑party data.</p>
        <p><span className="clause-num">3.3</span> Forecasts, projections and budgets are <strong>estimates</strong>, not predictions or guarantees of future results. Your actual financial position may differ.</p>
        <p><span className="clause-num">3.4</span> You should independently verify any figure or output that matters before relying on it — especially before making a financial decision or a payment.</p>

        <h2>4. Your responsibility</h2>
        <p><span className="clause-num">4.1</span> You are responsible for the decisions you make. The AI is there to assist your own judgement, not to make decisions for you.</p>
        <p><span className="clause-num">4.2</span> Do not use the AI features for anything they are not designed for, and do not treat AI output as a substitute for professional advice, official statements from your financial institution, or your own records.</p>

        <h2>5. How the AI uses your information</h2>
        <p><span className="clause-num">5.1</span> To generate outputs, your inputs and relevant account data are processed by AI systems, which may include third‑party AI providers acting under confidentiality and security obligations. How we collect, use, disclose and protect this information is set out in our <strong><a href="/legal/privacy">Privacy Policy</a></strong>.</p>
        <p><span className="clause-num">5.2</span> <strong>No decisions with legal or similarly significant effect.</strong> Our AI features are not used to make, or to substantially and directly support, automated decisions that affect your legal rights or significantly affect your interests (such as decisions about credit, lending or eligibility). If this ever changes, we will update our Privacy Policy accordingly and tell you before relying on such a feature.</p>

        <h2>6. Liability</h2>
        <p><span className="clause-num">6.1</span> To the maximum extent permitted by law, and subject to the guarantees that cannot be excluded under the Australian Consumer Law, we are not liable for any loss or damage arising from your use of, or reliance on, AI outputs. The limitations and consumer‑law provisions in the <strong><a href="/legal/terms">Website & App Terms and Conditions</a></strong> apply to AI features.</p>

        <h2>7. Changes</h2>
        <p>We may update this AI Disclaimer as our features and the law evolve. The current version will always be available in the App and on the Website.</p>

        <div className="legal-contact">
          <div className="legal-contact-title">Questions about AI features</div>
          <div className="legal-contact-row"><span className="legal-contact-label">Business</span><span className="legal-contact-value">Aureus Plutus ABN 32 306 872 259 (Sole Trader)</span></div>
          <div className="legal-contact-row"><span className="legal-contact-label">Address</span><span className="legal-contact-value">Queensland, Australia</span></div>
          <div className="legal-contact-row"><span className="legal-contact-label">Privacy</span><span className="legal-contact-value"><a href="mailto:privacy@aureusplutus.app">privacy@aureusplutus.app</a></span></div>
          <div className="legal-contact-row"><span className="legal-contact-label">Support</span><span className="legal-contact-value"><a href="mailto:support@aureusplutus.app">support@aureusplutus.app</a></span></div>
        </div>

      </div>
    </LegalPage>
  )
}
