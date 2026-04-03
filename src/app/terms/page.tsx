import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — Card Nimbus',
  description: 'Card Nimbus terms of service, privacy policy, and cookie policy.',
}

const lastUpdated = 'April 3, 2026'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-2 text-text-muted text-sm">Last updated: {lastUpdated}</p>
        </div>

        {/* Table of Contents */}
        <nav className="mb-10 p-5 rounded-2xl bg-surface-raised border border-surface-border">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">Contents</p>
          <ol className="space-y-1.5 text-sm">
            {['Terms of Service', 'Privacy Policy', 'Cookie Policy'].map((item, i) => (
              <li key={i}>
                <a href={`#section-${i + 1}`} className="text-nimbus-400 hover:text-nimbus-300 transition-colors">
                  {i + 1}. {item}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Section 1: Terms of Service */}
        <section id="section-1" className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-5">1. Terms of Service</h2>
          <div className="space-y-5 text-sm text-text-secondary leading-relaxed">

            <div>
              <h3 className="text-text-primary font-semibold mb-1.5">1.1 Acceptance of Terms</h3>
              <p>
                By accessing or using Card Nimbus ("we," "our," or "the Service"), you agree to be bound by these Terms. If you do not agree, please do not use the Service.
              </p>
            </div>

            <div>
              <h3 className="text-text-primary font-semibold mb-1.5">1.2 Eligibility</h3>
              <p>
                You must be at least 13 years of age to use Card Nimbus. If you are under 18, you confirm that you have parental or guardian consent. By creating an account, you represent that all information you provide is accurate and complete.
              </p>
            </div>

            <div>
              <h3 className="text-text-primary font-semibold mb-1.5">1.3 Account Responsibility</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. Card Nimbus is not liable for losses arising from unauthorized access caused by your failure to safeguard your credentials.
              </p>
            </div>

            <div>
              <h3 className="text-text-primary font-semibold mb-1.5">1.4 Prohibited Conduct</h3>
              <p>You agree not to: use the Service for fraudulent transactions; attempt to circumvent security measures; scrape or harvest user data without permission; list counterfeit, stolen, or misrepresented items; harass or abuse other users or staff.</p>
            </div>

            <div>
              <h3 className="text-text-primary font-semibold mb-1.5">1.5 Purchases and Payments</h3>
              <p>
                All prices are listed in USD. By completing a purchase, you authorize Card Nimbus to charge the provided payment method. All sales are final except as described in our{' '}
                <Link href="/help/returns" className="text-nimbus-400 hover:text-nimbus-300 transition-colors">Return Policy</Link>.
              </p>
            </div>

            <div>
              <h3 className="text-text-primary font-semibold mb-1.5">1.6 Limitation of Liability</h3>
              <p>
                Card Nimbus is provided "as is." To the maximum extent permitted by law, we disclaim all warranties, express or implied. We are not liable for indirect, incidental, or consequential damages arising from your use of the Service.
              </p>
            </div>

            <div>
              <h3 className="text-text-primary font-semibold mb-1.5">1.7 Changes to Terms</h3>
              <p>
                We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the revised Terms. We will notify registered users of material changes via email.
              </p>
            </div>

          </div>
        </section>

        <hr className="border-surface-border mb-10" />

        {/* Section 2: Privacy Policy */}
        <section id="section-2" className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-5">2. Privacy Policy</h2>
          <div className="space-y-5 text-sm text-text-secondary leading-relaxed">

            <div>
              <h3 className="text-text-primary font-semibold mb-1.5">2.1 Information We Collect</h3>
              <p>
                We collect information you provide directly (name, email, shipping address, payment info) and information generated by your use of the Service (browsing history, purchase history, device info, IP address).
              </p>
            </div>

            <div>
              <h3 className="text-text-primary font-semibold mb-1.5">2.2 How We Use Your Information</h3>
              <p>
                We use your information to: process orders and payments; send transactional emails and order updates; improve the Service through analytics; send promotional communications (with your consent); comply with legal obligations.
              </p>
            </div>

            <div>
              <h3 className="text-text-primary font-semibold mb-1.5">2.3 Information Sharing</h3>
              <p>
                We do not sell your personal data. We share information only with: payment processors (Stripe) to complete transactions; shipping carriers to fulfill orders; service providers under confidentiality agreements; law enforcement when legally required.
              </p>
            </div>

            <div>
              <h3 className="text-text-primary font-semibold mb-1.5">2.4 Data Retention</h3>
              <p>
                We retain your data for as long as your account is active or as required by law. You may request deletion of your account and associated data by contacting us at{' '}
                <a href="mailto:privacy@cardnimbus.com" className="text-nimbus-400 hover:text-nimbus-300 transition-colors">privacy@cardnimbus.com</a>.
              </p>
            </div>

            <div>
              <h3 className="text-text-primary font-semibold mb-1.5">2.5 Your Rights</h3>
              <p>
                Depending on your jurisdiction, you may have rights to access, correct, delete, or port your personal data. To exercise these rights, contact us at the email above. We will respond within 30 days.
              </p>
            </div>

          </div>
        </section>

        <hr className="border-surface-border mb-10" />

        {/* Section 3: Cookie Policy */}
        <section id="section-3" className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-5">3. Cookie Policy</h2>
          <div className="space-y-5 text-sm text-text-secondary leading-relaxed">

            <div>
              <h3 className="text-text-primary font-semibold mb-1.5">3.1 What Are Cookies</h3>
              <p>
                Cookies are small text files stored on your device when you visit a website. They help us recognize your browser, remember preferences, and understand how you use the Service.
              </p>
            </div>

            <div>
              <h3 className="text-text-primary font-semibold mb-1.5">3.2 Types of Cookies We Use</h3>
              <div className="space-y-3">
                {[
                  { name: 'Essential Cookies', desc: 'Required for core functionality — authentication, shopping cart, session management. These cannot be disabled without breaking the Service.' },
                  { name: 'Analytics Cookies', desc: 'Help us understand how users navigate the site (pages visited, time on page, etc.) using anonymized data. Used to improve the shopping experience.' },
                  { name: 'Preference Cookies', desc: 'Remember your settings such as currency, display preferences, and recently viewed items.' },
                ].map((c) => (
                  <div key={c.name} className="p-4 rounded-xl bg-surface-raised border border-surface-border">
                    <p className="font-medium text-text-primary mb-1">{c.name}</p>
                    <p>{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-text-primary font-semibold mb-1.5">3.3 Managing Cookies</h3>
              <p>
                You can disable non-essential cookies through your browser settings. Note that disabling cookies may affect some functionality. Most browsers allow you to delete, block, or receive warnings before cookies are stored.
              </p>
            </div>

          </div>
        </section>

        {/* Contact */}
        <div className="pt-6 border-t border-surface-border text-sm text-text-muted">
          Questions about these policies? Contact us at{' '}
          <a href="mailto:legal@cardnimbus.com" className="text-nimbus-400 hover:text-nimbus-300 transition-colors">legal@cardnimbus.com</a>.
        </div>

      </div>
    </div>
  )
}
