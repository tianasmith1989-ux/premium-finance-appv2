// app/legal/LegalPage.tsx
// Shared wrapper for all legal pages — import this in each page

import Link from 'next/link'

const LINKS = [
  { href: '/legal/terms',        label: 'Terms & Conditions' },
  { href: '/legal/privacy',      label: 'Privacy Policy' },
  { href: '/legal/subscription', label: 'Subscription Terms' },
  { href: '/legal/refunds',      label: 'Refund Policy' },
  { href: '/legal/ai-disclaimer',label: 'AI Disclaimer' },
]

export function LegalPage({
  title,
  subtitle,
  effective,
  updated,
  children,
}: {
  title: string
  subtitle?: string
  effective: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --gold: #D4AF37;
          --gold-dim: #9a7e28;
          --gold-faint: rgba(212,175,55,0.08);
          --bg: #0d0d0d;
          --surface: #141414;
          --surface2: #1a1a1a;
          --border: rgba(212,175,55,0.12);
          --text: #f0ece0;
          --muted: #7a7060;
          --danger: #c0392b;
          --radius: 12px;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: 16px;
          line-height: 1.75;
          -webkit-font-smoothing: antialiased;
        }

        .legal-wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ── Top bar ── */
        .legal-topbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(13,13,13,0.96);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          padding: 14px 32px;
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .legal-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .legal-logo img {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }

        .legal-logo-text {
          font-family: 'Cinzel', 'Georgia', serif;
          font-size: 15px;
          font-weight: 700;
          color: var(--gold);
          letter-spacing: 1px;
        }

        .legal-nav {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          flex: 1;
          scrollbar-width: none;
        }
        .legal-nav::-webkit-scrollbar { display: none; }

        .legal-nav a {
          padding: 6px 12px;
          border-radius: 6px;
          text-decoration: none;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: var(--muted);
          white-space: nowrap;
          transition: color 0.15s, background 0.15s;
          border: 1px solid transparent;
        }

        .legal-nav a:hover {
          color: var(--text);
          background: var(--surface2);
        }

        .legal-nav a.active {
          color: var(--gold);
          background: var(--gold-faint);
          border-color: var(--border);
        }

        /* ── Hero ── */
        .legal-hero {
          padding: 64px 32px 40px;
          max-width: 820px;
          margin: 0 auto;
          width: 100%;
        }

        .legal-eyebrow {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2.5px;
          color: var(--gold);
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .legal-title {
          font-family: 'Cinzel', 'Georgia', serif;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 700;
          color: var(--text);
          line-height: 1.2;
          margin-bottom: 10px;
        }

        .legal-subtitle {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 14px;
          color: var(--muted);
          margin-bottom: 24px;
        }

        .legal-dates {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .legal-date-pill {
          display: inline-flex;
          gap: 6px;
          align-items: center;
          padding: 5px 12px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 20px;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 11px;
          color: var(--muted);
        }

        .legal-date-pill strong {
          color: var(--text);
          font-weight: 600;
        }

        /* ── Summary box ── */
        .legal-summary {
          max-width: 820px;
          margin: 0 auto 40px;
          padding: 0 32px;
          width: 100%;
        }

        .legal-summary-inner {
          padding: 20px 24px;
          background: var(--gold-faint);
          border: 1px solid rgba(212,175,55,0.2);
          border-left: 3px solid var(--gold);
          border-radius: var(--radius);
        }

        .legal-summary-label {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          color: var(--gold);
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .legal-summary-inner p {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 13px;
          color: #b0a890;
          line-height: 1.65;
        }

        /* ── Main content ── */
        .legal-body {
          max-width: 820px;
          margin: 0 auto;
          padding: 0 32px 80px;
          width: 100%;
        }

        .legal-body h2 {
          font-family: 'Cinzel', 'Georgia', serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          margin: 48px 0 16px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border);
          letter-spacing: 0.3px;
        }

        .legal-body h2:first-child {
          margin-top: 0;
        }

        .legal-body p {
          margin-bottom: 14px;
          color: #c8c0a8;
          font-size: 15px;
        }

        .legal-body ul, .legal-body ol {
          margin: 0 0 14px 20px;
          color: #c8c0a8;
          font-size: 15px;
        }

        .legal-body li {
          margin-bottom: 6px;
          line-height: 1.7;
        }

        .legal-body strong {
          color: var(--text);
          font-weight: 600;
        }

        .legal-body a {
          color: var(--gold);
          text-decoration: none;
          border-bottom: 1px solid rgba(212,175,55,0.3);
        }

        .legal-body a:hover {
          border-bottom-color: var(--gold);
        }

        .legal-body .clause-num {
          color: var(--gold-dim);
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 13px;
          font-weight: 600;
          margin-right: 6px;
        }

        .legal-body .warning-box {
          padding: 14px 18px;
          background: rgba(192,57,43,0.08);
          border: 1px solid rgba(192,57,43,0.25);
          border-radius: 8px;
          margin: 16px 0;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 13px;
          color: #e0a090;
          line-height: 1.6;
        }

        .legal-body .info-box {
          padding: 14px 18px;
          background: var(--gold-faint);
          border: 1px solid var(--border);
          border-radius: 8px;
          margin: 16px 0;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 13px;
          color: #b0a890;
          line-height: 1.6;
        }

        /* ── Contact block ── */
        .legal-contact {
          margin-top: 48px;
          padding: 24px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-family: 'Helvetica Neue', Arial, sans-serif;
        }

        .legal-contact-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--gold);
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .legal-contact-row {
          display: flex;
          gap: 8px;
          align-items: baseline;
          margin-bottom: 6px;
          font-size: 13px;
        }

        .legal-contact-label {
          color: var(--muted);
          min-width: 80px;
          flex-shrink: 0;
        }

        .legal-contact-value {
          color: var(--text);
        }

        .legal-contact-value a {
          color: var(--gold);
          text-decoration: none;
        }

        /* ── Footer ── */
        .legal-footer {
          margin-top: auto;
          padding: 24px 32px;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 11px;
          color: var(--muted);
        }

        .legal-footer a {
          color: var(--muted);
          text-decoration: none;
        }

        .legal-footer a:hover {
          color: var(--gold);
        }

        @media (max-width: 600px) {
          .legal-topbar { padding: 12px 16px; gap: 12px; }
          .legal-hero, .legal-summary, .legal-body { padding-left: 16px; padding-right: 16px; }
          .legal-hero { padding-top: 40px; }
          .legal-footer { padding: 16px; }
          .legal-logo-text { display: none; }
        }
      `}</style>

      <div className="legal-wrap">
        {/* Top bar */}
        <header className="legal-topbar">
          <Link href="/" className="legal-logo">
            <img src="/logo.svg" alt="Aureus Plutus" />
            <span className="legal-logo-text">AUREUS</span>
          </Link>
          <nav className="legal-nav">
            {LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={typeof window !== 'undefined' && window.location.pathname === l.href ? 'active' : ''}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </header>

        {/* Hero */}
        <div className="legal-hero">
          <div className="legal-eyebrow">Aureus Plutus · Legal</div>
          <h1 className="legal-title">{title}</h1>
          {subtitle && <p className="legal-subtitle">{subtitle}</p>}
          <div className="legal-dates">
            <span className="legal-date-pill">Effective <strong>{effective}</strong></span>
            <span className="legal-date-pill">Last updated <strong>{updated}</strong></span>
          </div>
        </div>

        {/* Body */}
        {children}

        {/* Footer */}
        <footer className="legal-footer">
          <span>© {new Date().getFullYear()} Aureus Plutus ABN 32 306 872 259 · Sole Trader · Queensland, Australia</span>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {LINKS.map(l => <Link key={l.href} href={l.href}>{l.label}</Link>)}
          </div>
        </footer>
      </div>
    </>
  )
}
