// app/legal/terms/page.tsx
import { LegalPage } from '../LegalPage'

export const metadata = {
  title: 'Terms & Conditions — Aureus Plutus',
  description: 'Website and App Terms and Conditions for Aureus Plutus.',
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Website & App Terms and Conditions"
      subtitle="The agreement between you and Aureus Plutus for using our website and app."
      effective="4 June 2026"
      updated="4 June 2026"
    >
      <div className="legal-summary">
        <div className="legal-summary-inner">
          <div className="legal-summary-label">Plain English Summary — not the contract</div>
          <p>Aureus is a budgeting and money‑management tool that uses AI to give you general information and insights about <em>your own</em> money. <strong>We are not your financial adviser, accountant or lawyer, and nothing in the app is personal financial product advice.</strong> You must be 18+, the information we give you may not always be accurate, and you connect your bank data at your own choice through a secure data provider. You have rights under the Australian Consumer Law that we can't take away. Paid plans are covered by our separate Subscription Terms and Refund Policy.</p>
        </div>
      </div>

      <div className="legal-body">

        <h2>1. About these terms</h2>
        <p><span className="clause-num">1.1</span> These Terms and Conditions (<strong>Terms</strong>) govern your access to and use of the Aureus Plutus website at aureusplutus.app (<strong>Website</strong>) and the Aureus Plutus mobile and web application (<strong>App</strong>), together with all related content, features and services (collectively, the <strong>Service</strong>).</p>
        <p><span className="clause-num">1.2</span> The Service is operated by <strong>Aureus Plutus</strong> (ABN 32 306 872 259), a sole trader with a registered business name operating in Queensland, Australia (<strong>Aureus</strong>, <strong>we</strong>, <strong>us</strong>, <strong>our</strong>). You can contact us at <a href="mailto:support@aureusplutus.app">support@aureusplutus.app</a>.</p>
        <p><span className="clause-num">1.3</span> By creating an account, accessing the Website, or downloading, installing or using the App, you agree to be bound by these Terms. <strong>If you do not agree, you must not use the Service.</strong></p>
        <p><span className="clause-num">1.4</span> The following documents form part of these Terms and are incorporated by reference. If there is any inconsistency, the order of precedence is: (a) the Subscription Terms (for billing matters); (b) these Terms; (c) the other documents below.</p>
        <ul>
          <li><strong><a href="/legal/privacy">Privacy Policy</a></strong> — how we handle your personal information</li>
          <li><strong><a href="/legal/subscription">Subscription Terms</a></strong> — plans, fees, billing and cancellation</li>
          <li><strong><a href="/legal/refunds">Refund Policy</a></strong> — refunds and your Australian Consumer Law rights</li>
          <li><strong><a href="/legal/ai-disclaimer">AI Disclaimer</a></strong> — how our AI features work and their limits</li>
        </ul>

        <h2>2. Eligibility and your account</h2>
        <p><span className="clause-num">2.1</span> You must be at least <strong>18 years old</strong> and have the legal capacity to enter into a binding contract. The Service is not intended for, and must not be used by, anyone under 18.</p>
        <p><span className="clause-num">2.2</span> The Service is intended for use by individuals in <strong>Australia</strong>. We make no representation that the Service is appropriate or available for use outside Australia.</p>
        <p><span className="clause-num">2.3</span> You must provide accurate, current and complete information when registering and keep it up to date. You are responsible for all activity that occurs under your account and for keeping your login credentials and any device secure.</p>
        <p><span className="clause-num">2.4</span> You must notify us immediately at <a href="mailto:support@aureusplutus.app">support@aureusplutus.app</a> if you suspect any unauthorised access to your account.</p>

        <h2>3. Licence to use the Service</h2>
        <p><span className="clause-num">3.1</span> Subject to your compliance with these Terms, we grant you a personal, limited, non‑exclusive, non‑transferable, revocable licence to access and use the Service for your own personal, non‑commercial money‑management purposes.</p>
        <p><span className="clause-num">3.2</span> This licence does not transfer any ownership rights. All intellectual property rights in the Service remain with us or our licensors (see clause 8).</p>

        <h2>4. What Aureus is — and what it is not</h2>
        <div className="warning-box">⚠️ <strong>Aureus does not provide financial product advice.</strong> Nothing in the Service is personal advice, accounting, taxation, credit or legal advice, or an offer to deal in any financial product.</div>
        <p><span className="clause-num">4.1</span> Aureus is a <strong>budgeting and personal financial management tool</strong>. It helps you view, categorise, track and understand information about your own finances, and uses artificial intelligence to generate general insights, summaries, projections and suggestions.</p>
        <p><span className="clause-num">4.2</span> Any insight, figure, projection, categorisation or suggestion produced by the Service is <strong>general information only</strong>. It does not take into account your objectives, financial situation or needs. Before acting on anything you see in the Service, you should consider its appropriateness to your circumstances and seek advice from a licensed financial adviser, accountant or other qualified professional.</p>
        <p><span className="clause-num">4.3</span> We are <strong>not</strong> the holder of an Australian Financial Services Licence or an Australian Credit Licence, and we do not carry on a financial services business through the Service.</p>
        <p><span className="clause-num">4.4</span> Your use of AI features is also governed by our <strong><a href="/legal/ai-disclaimer">AI Disclaimer</a></strong>.</p>

        <h2>5. Connecting your financial data</h2>
        <p><span className="clause-num">5.1</span> The Service may allow you to connect your bank, card and other financial accounts so that transaction and balance data can be imported through one or more <strong>third‑party data providers</strong> (<strong>Data Provider</strong>).</p>
        <p><span className="clause-num">5.2</span> When you connect an account, you authorise us and the relevant Data Provider to access, collect and import data from your connected accounts for the purposes of operating the Service. You may be asked to agree to the Data Provider's own terms, which are separate from these Terms.</p>
        <p><span className="clause-num">5.3</span> We rely on the Data Provider and your financial institutions for the data we receive. We do not control, and are not responsible for, the accuracy, completeness or timeliness of data sourced from third parties.</p>
        <p><span className="clause-num">5.4</span> You should never need to give Aureus the actual login passwords for your financial accounts. You can disconnect an account at any time through the App.</p>

        <h2>6. Acceptable use</h2>
        <p><span className="clause-num">6.1</span> You must not, and must not attempt to:</p>
        <ul>
          <li>use the Service for any unlawful, fraudulent or harmful purpose, or in breach of any law</li>
          <li>access financial data that is not your own or that you are not authorised to access</li>
          <li>copy, modify, reverse engineer, decompile, scrape, or create derivative works from the Service, except to the extent this restriction is prohibited by law</li>
          <li>introduce any malware, or interfere with, disrupt, or place an unreasonable load on the Service or its infrastructure</li>
          <li>circumvent or attempt to circumvent any security, access control, rate limit or usage restriction</li>
          <li>use the Service to develop a competing product or to train a competing machine‑learning model</li>
          <li>resell, sublicense, or commercially exploit the Service or any data obtained through it</li>
        </ul>

        <h2>7. Your content and feedback</h2>
        <p><span className="clause-num">7.1</span> You may input, upload or generate content in the Service (for example, notes, budgets, goals, tags or categories) (<strong>Your Content</strong>). As between you and us, you retain ownership of Your Content.</p>
        <p><span className="clause-num">7.2</span> You grant us a worldwide, royalty‑free, non‑exclusive licence to host, store, reproduce, process and display Your Content only to the extent necessary to operate, maintain, secure and improve the Service and to provide it to you.</p>
        <p><span className="clause-num">7.3</span> If you give us feedback, ideas or suggestions, you agree we may use them without restriction or obligation to you.</p>

        <h2>8. Intellectual property</h2>
        <p><span className="clause-num">8.1</span> The Service, including its software, design, text, graphics, logos, the "Aureus Plutus" name and brand, and all underlying technology and models, is owned by or licensed to us and is protected by intellectual property laws.</p>
        <p><span className="clause-num">8.2</span> Except as expressly permitted by these Terms or by law, you must not use, reproduce or exploit our intellectual property without our prior written consent.</p>

        <h2>9. Third‑party services and links</h2>
        <p><span className="clause-num">9.1</span> The Service may link to or integrate with third‑party websites, products or services (including Data Providers, payment processors, and app stores). We do not control and are not responsible for third‑party services, and your use of them is governed by their own terms and privacy policies.</p>

        <h2>10. Availability, changes and beta features</h2>
        <p><span className="clause-num">10.1</span> We aim to keep the Service available but do not guarantee uninterrupted or error‑free operation. We may perform maintenance, and the Service may be unavailable from time to time.</p>
        <p><span className="clause-num">10.2</span> We may add, change, suspend or remove features. Where a change is material and adverse to you, we will give reasonable prior notice.</p>
        <p><span className="clause-num">10.3</span> Some features may be offered as trials, previews or "beta" features. These are provided on an "as is" basis and may be changed or withdrawn at any time.</p>

        <h2>11. Suspension and termination</h2>
        <p><span className="clause-num">11.1</span> You may stop using the Service and close your account at any time. Cancellation of paid plans is governed by the <strong><a href="/legal/subscription">Subscription Terms</a></strong> and <strong><a href="/legal/refunds">Refund Policy</a></strong>.</p>
        <p><span className="clause-num">11.2</span> We may suspend or terminate your access if: (a) you materially breach these Terms; (b) we reasonably suspect fraud, unlawful conduct or a security risk; or (c) we are required to do so by law. Where practicable and lawful, we will give you notice and an opportunity to remedy a breach that is capable of remedy.</p>
        <p><span className="clause-num">11.3</span> On termination, your licence ends and you must stop using the Service. Clauses 4, 7.3, 8, 12, 13, 14 and 16 survive termination.</p>

        <h2>12. Australian Consumer Law guarantees</h2>
        <p><span className="clause-num">12.1</span> Our Service comes with guarantees that cannot be excluded under the <strong>Australian Consumer Law</strong> (ACL), Schedule 2 to the <em>Competition and Consumer Act 2010</em> (Cth). Nothing in these Terms excludes, restricts or modifies any guarantee, right or remedy you have under the ACL or any other law that cannot lawfully be excluded.</p>

        <h2>13. Disclaimers and limitation of liability</h2>
        <p><span className="clause-num">13.1</span> Subject to clause 12, the Service and all outputs are provided on an "as is" and "as available" basis. We exclude all representations, warranties and guarantees to the maximum extent permitted by law, including as to accuracy, reliability, completeness or fitness for a particular purpose.</p>
        <p><span className="clause-num">13.2</span> Subject to clause 12, and to the maximum extent permitted by law, we are not liable for any loss or damage arising out of or in connection with: (a) your use of, or reliance on, the Service or any AI output; (b) any financial decision you make; (c) the accuracy or availability of data provided by third parties; or (d) any unauthorised access to your account that is not caused by our breach.</p>
        <p><span className="clause-num">13.3</span> Subject to clause 12, our total aggregate liability for all claims is limited to the greater of: (a) the total fees you paid to us in the <strong>12 months</strong> before the event; or (b) <strong>AUD $100</strong>.</p>

        <h2>14. Indemnity</h2>
        <p><span className="clause-num">14.1</span> To the extent permitted by law, you agree to indemnify us against reasonable loss arising from your breach of these Terms or your unlawful or fraudulent use of the Service. This indemnity is reduced to the extent our acts or omissions contributed to the loss.</p>

        <h2>15. Changes to these terms</h2>
        <p><span className="clause-num">15.1</span> We may update these Terms from time to time. If a change is material and adverse to you, we will give you at least <strong>30 days' notice</strong> (by email or in‑app) before it takes effect.</p>
        <p><span className="clause-num">15.2</span> Continued use after the change takes effect means you accept the updated Terms.</p>

        <h2>16. General</h2>
        <p><span className="clause-num">16.1</span> <strong>Governing law.</strong> These Terms are governed by the laws of <strong>Queensland, Australia</strong>, and you and we submit to the non‑exclusive jurisdiction of the courts of that State and the Commonwealth.</p>
        <p><span className="clause-num">16.2</span> <strong>Disputes.</strong> Before starting court proceedings, you agree to first contact us at <a href="mailto:legal@aureusplutus.app">legal@aureusplutus.app</a> so we can try to resolve the matter.</p>
        <p><span className="clause-num">16.3</span> <strong>Severability.</strong> If any provision is found to be unenforceable, it is severed to the minimum extent necessary and the rest of the Terms continue.</p>
        <p><span className="clause-num">16.4</span> <strong>No waiver.</strong> A failure to enforce a right is not a waiver of it.</p>
        <p><span className="clause-num">16.5</span> <strong>Entire agreement.</strong> These Terms (with the documents incorporated in clause 1.4) are the entire agreement between you and us about the Service.</p>

        <div className="legal-contact">
          <div className="legal-contact-title">Contact</div>
          <div className="legal-contact-row"><span className="legal-contact-label">Business</span><span className="legal-contact-value">Aureus Plutus ABN 32 306 872 259 (Sole Trader)</span></div>
          <div className="legal-contact-row"><span className="legal-contact-label">Address</span><span className="legal-contact-value">Queensland, Australia</span></div>
          <div className="legal-contact-row"><span className="legal-contact-label">Support</span><span className="legal-contact-value"><a href="mailto:support@aureusplutus.app">support@aureusplutus.app</a></span></div>
          <div className="legal-contact-row"><span className="legal-contact-label">Legal</span><span className="legal-contact-value"><a href="mailto:legal@aureusplutus.app">legal@aureusplutus.app</a></span></div>
        </div>

      </div>
    </LegalPage>
  )
}
