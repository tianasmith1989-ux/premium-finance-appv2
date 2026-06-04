// app/legal/privacy/page.tsx
import { LegalPage } from '../LegalPage'

export const metadata = {
  title: 'Privacy Policy — Aureus Plutus',
  description: 'How Aureus Plutus collects, holds, uses and discloses your personal information.',
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="How we collect, hold, use and disclose your personal information."
      effective="4 June 2026"
      updated="4 June 2026"
    >
      <div className="legal-summary">
        <div className="legal-summary-inner">
          <div className="legal-summary-label">Plain English Summary — not the policy</div>
          <p>Aureus is a budgeting app, so we handle sensitive things — your financial data. We collect it mainly so the app works for you. We connect to your accounts through a secure data provider, not by storing your bank passwords. We use AI to generate insights about <em>your</em> money; that AI does not make decisions with legal effect about you. <strong>We don't sell your personal information.</strong> You can access, correct, or ask us to delete your data, and you can complain to us and to the OAIC. We store and protect your data carefully and tell you if something goes wrong.</p>
        </div>
      </div>

      <div className="legal-body">

        <p>This Privacy Policy explains how <strong>Aureus Plutus</strong> (ABN 32 306 872 259), a sole trader with a registered business name in Queensland, Australia (<strong>Aureus</strong>, <strong>we</strong>, <strong>us</strong>, <strong>our</strong>) collects, holds, uses and discloses your personal information. We are bound by the <em>Privacy Act 1988</em> (Cth) and the Australian Privacy Principles (APPs). Where you share data through the Consumer Data Right (CDR), additional protections under Part IVD of the <em>Competition and Consumer Act 2010</em> (Cth) and the CDR Rules also apply.</p>

        <h2>1. The kinds of personal information we collect</h2>
        <p>Depending on how you use Aureus, we may collect:</p>
        <ul>
          <li><strong>Identity and contact information</strong> — your name, email address, phone number, date of birth (to confirm you are 18+), and account login details.</li>
          <li><strong>Financial information</strong> — information about your connected accounts, including account names and numbers (or tokenised references), balances, transaction history, payees, merchants, categories, budgets, goals and other money‑management data you create or import. Financial information can reveal sensitive details about your life; we treat it with care and only collect what we need.</li>
          <li><strong>Usage and device information</strong> — how you interact with the Service, device and browser type, operating system, app version, IP address, identifiers, and diagnostic and crash data.</li>
          <li><strong>Communications</strong> — records of your contact with our support team, and your marketing preferences.</li>
        </ul>
        <p><strong>Sensitive information.</strong> We do not seek to collect sensitive information (as defined in the Privacy Act) and ask that you do not enter it into free‑text fields.</p>

        <h2>2. How we collect personal information</h2>
        <p><span className="clause-num">2.1</span> <strong>Directly from you</strong> — when you create an account, set up budgets and goals, contact support, or otherwise use the Service.</p>
        <p><span className="clause-num">2.2</span> <strong>From your connected accounts, through a Data Provider</strong> — to power the app's core features, you can connect your bank, card or other financial accounts through one or more third‑party data providers (<strong>Data Provider</strong>). You authorise the import of data from your connected accounts when you set up a connection, and you can disconnect at any time in the App.</p>
        <p><span className="clause-num">2.3</span> <strong>Why we use secure data‑sharing rather than your passwords.</strong> We are designed so that you should not need to give us the login passwords for your financial accounts. Secure, consent‑based channels such as the CDR are safer than methods that rely on sharing banking credentials.</p>
        <p><span className="clause-num">2.4</span> <strong>Automatically</strong> — through cookies and similar technologies when you use our Website or App (see clause 9).</p>
        <p><span className="clause-num">2.5</span> <strong>From third parties</strong> — such as analytics, payment and infrastructure providers, where you have interacted with them in connection with the Service.</p>

        <h2>3. Why we collect, hold, use and disclose your information</h2>
        <p>We use your personal information to:</p>
        <ul>
          <li>create and administer your account and verify your eligibility</li>
          <li>provide the core Service — importing, categorising, analysing and displaying information about your finances, and generating budgets, insights, projections and suggestions</li>
          <li>operate AI features that produce general information and insights about your own money (see clause 5)</li>
          <li>process payments and manage subscriptions</li>
          <li>provide customer support and respond to your requests</li>
          <li>maintain the security, integrity and performance of the Service, including fraud prevention and detection</li>
          <li>improve and develop the Service, and conduct analytics (using de‑identified or aggregated data wherever practicable)</li>
          <li>send you service communications, and — where you have not opted out — relevant marketing (see clause 8)</li>
          <li>comply with our legal obligations and protect our legal rights</li>
        </ul>

        <h2>4. Who we disclose your information to</h2>
        <p>We may disclose your personal information to:</p>
        <ul>
          <li><strong>Service providers</strong> who help us operate the Service — including cloud hosting, Data Providers, payment processors, analytics, customer‑support, communications and security providers — who are only permitted to use your information to provide services to us</li>
          <li><strong>AI/model providers</strong> that process inputs to generate outputs within the Service, under contractual confidentiality and security obligations (see clause 5)</li>
          <li><strong>Professional advisers</strong>, such as lawyers, accountants and auditors</li>
          <li><strong>A buyer or successor</strong> in the event of a sale, merger or restructure of our business (subject to confidentiality and your rights under this policy)</li>
          <li><strong>Government, regulators or law enforcement</strong> where required or authorised by law</li>
        </ul>
        <div className="info-box"><strong>We do not sell your personal information</strong>, and we do not disclose it for third‑party advertising in exchange for payment.</div>

        <h2>5. Artificial intelligence and automated processing</h2>
        <p><span className="clause-num">5.1</span> <strong>How we use AI.</strong> Aureus uses artificial intelligence and automated processing to categorise transactions, detect patterns, and generate insights, summaries, projections and general suggestions about your own finances. These features are described further in our <strong><a href="/legal/ai-disclaimer">AI Disclaimer</a></strong>.</p>
        <p><span className="clause-num">5.2</span> <strong>No automated decisions with legal or similarly significant effect.</strong> Our AI features are designed to provide general information and insights to help you manage your own money. They are <strong>not</strong> used to make, or to substantially and directly support, decisions about you that grant or refuse a benefit, affect your rights under a contract, or affect your access to a significant service or support.</p>
        <p><span className="clause-num">5.3</span> <strong>Automated decision‑making transparency (from 10 December 2026).</strong> New transparency obligations take effect under the Privacy Act on 10 December 2026 (new APP 1.7). We monitor our use of automated processing against these requirements and will update this Policy as required.</p>
        <p><span className="clause-num">5.4</span> <strong>Training and improvement.</strong> Where we use data to improve or develop our models and Service, we use de‑identified or aggregated data wherever practicable. We will not use your identifiable financial information to train models in a way that is incompatible with this Policy. Contact <a href="mailto:privacy@aureusplutus.app">privacy@aureusplutus.app</a> for more information.</p>

        <h2>6. Sending information overseas</h2>
        <p><span className="clause-num">6.1</span> Some of our service providers (for example, cloud hosting or AI processing) may store or process personal information outside Australia. Where this happens, we take reasonable steps to ensure the recipient handles your information consistently with the APPs, including through contractual protections.</p>
        <p><span className="clause-num">6.2</span> If you would like the current list of countries where data may be processed, contact us at <a href="mailto:privacy@aureusplutus.app">privacy@aureusplutus.app</a>.</p>

        <h2>7. How we keep your information secure</h2>
        <p><span className="clause-num">7.1</span> We take reasonable steps to protect your personal information from misuse, interference, loss, and unauthorised access, modification or disclosure. These steps include encryption in transit and at rest, access controls, network security, monitoring, and staff confidentiality obligations.</p>
        <p><span className="clause-num">7.2</span> No method of transmission or storage is completely secure. While we work hard to protect your information, we cannot guarantee absolute security.</p>
        <p><span className="clause-num">7.3</span> <strong>Retention.</strong> We keep your personal information only for as long as we need it for the purposes in this Policy or as required by law. When it is no longer needed, we take reasonable steps to destroy or de‑identify it.</p>
        <p><span className="clause-num">7.4</span> <strong>Data breaches.</strong> If a data breach occurs that is likely to result in serious harm, we will notify affected individuals and the OAIC in accordance with the Notifiable Data Breaches scheme.</p>

        <h2>8. Marketing and your choices</h2>
        <p><span className="clause-num">8.1</span> We may send you marketing communications about features and offers where you have consented or where the law otherwise allows. Every marketing message includes an easy way to opt out, and you can change your preferences at any time in your account settings or by contacting us.</p>
        <p><span className="clause-num">8.2</span> Opting out of marketing does not stop essential service communications (for example, security alerts, billing notices and changes to terms).</p>

        <h2>9. Cookies and analytics</h2>
        <p><span className="clause-num">9.1</span> We use cookies and similar technologies to keep you signed in, remember preferences, measure performance, and improve the Service. You can control cookies through your browser or device settings; disabling some cookies may affect functionality.</p>

        <h2>10. Accessing and correcting your information</h2>
        <p><span className="clause-num">10.1</span> You can access and correct much of your information directly in the App. You can also request access to, or correction of, the personal information we hold about you by contacting <a href="mailto:privacy@aureusplutus.app">privacy@aureusplutus.app</a>.</p>
        <p><span className="clause-num">10.2</span> We will respond within a reasonable time. There is normally no charge to access your information. If we refuse access or correction, we will tell you why and how to complain.</p>
        <p><span className="clause-num">10.3</span> You can ask us to delete your account and personal information; we will do so unless we are required or permitted by law to keep it.</p>

        <h2>11. Children</h2>
        <p>The Service is for users aged <strong>18 and over</strong>. We do not knowingly collect personal information from anyone under 18. If you believe a child has provided us with personal information, contact us and we will take reasonable steps to delete it.</p>

        <h2>12. Complaints</h2>
        <p><span className="clause-num">12.1</span> If you have a privacy concern, please contact our Privacy Officer at <a href="mailto:privacy@aureusplutus.app">privacy@aureusplutus.app</a>. We will acknowledge your complaint and aim to respond within <strong>30 days</strong>.</p>
        <p><span className="clause-num">12.2</span> If you are not satisfied with our response, you can complain to the <strong>Office of the Australian Information Commissioner (OAIC)</strong> — <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">www.oaic.gov.au</a>, phone 1300 363 992.</p>

        <h2>13. Changes to this policy</h2>
        <p>We may update this Policy from time to time. We will post the updated version with a new "Last updated" date and, where changes are material, notify you by email or in‑app.</p>

        <div className="legal-contact">
          <div className="legal-contact-title">Privacy Officer Contact</div>
          <div className="legal-contact-row"><span className="legal-contact-label">Business</span><span className="legal-contact-value">Aureus Plutus ABN 32 306 872 259 (Sole Trader)</span></div>
          <div className="legal-contact-row"><span className="legal-contact-label">Address</span><span className="legal-contact-value">Queensland, Australia</span></div>
          <div className="legal-contact-row"><span className="legal-contact-label">Privacy</span><span className="legal-contact-value"><a href="mailto:privacy@aureusplutus.app">privacy@aureusplutus.app</a></span></div>
          <div className="legal-contact-row"><span className="legal-contact-label">OAIC</span><span className="legal-contact-value"><a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">www.oaic.gov.au</a> · 1300 363 992</span></div>
        </div>

      </div>
    </LegalPage>
  )
}
