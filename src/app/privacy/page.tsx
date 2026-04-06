import type { Metadata } from 'next'
import { BackHeader } from '@/components/ui/back-header'

export const metadata: Metadata = {
  title: 'Privacy Policy — Card Nimbus',
  description:
    'Learn how Card Nimbus collects, uses, and protects your personal information.',
}

const lastUpdated = 'April 6, 2026'

interface SectionContent {
  subtitle?: string
  text: string
}

interface Section {
  title: string
  content: SectionContent[]
}

const sections: Section[] = [
  {
    title: '1. Information We Collect',
    content: [
      {
        subtitle: '1.1 Information You Provide',
        text: 'When you create an account, make a purchase, or contact support, we collect information such as your name, email address, shipping address, phone number, and payment details. Sellers additionally provide payout information and identification for verification purposes.',
      },
      {
        subtitle: '1.2 Information Collected Automatically',
        text: 'When you use Card Nimbus, we automatically collect device information (browser type, operating system, device identifiers), IP address, pages visited, referring URLs, and interaction data such as clicks, searches, and time spent on pages.',
      },
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: [
      {
        text: 'We use your information to: process transactions and fulfill orders; verify seller identities and prevent fraud; send order confirmations, shipping updates, and account notifications; personalize your experience and show relevant recommendations; improve our platform through aggregated analytics; comply with legal obligations and enforce our Terms of Service.',
      },
    ],
  },
  {
    title: '3. Cookies and Tracking',
    content: [
      {
        text: 'Card Nimbus uses cookies and similar technologies to maintain your session, remember preferences, and understand how you use our platform. Essential cookies are required for core functionality such as authentication and cart management. Analytics cookies help us measure and improve performance. You can manage non-essential cookies through your browser settings. For more details, see the Cookie Policy section of our Terms of Service.',
      },
    ],
  },
  {
    title: '4. Third-Party Services',
    content: [
      {
        subtitle: '4.1 Payment Processing',
        text: 'We use Stripe and PayPal to process payments. When you make a purchase, your payment information is sent directly to these processors and is subject to their respective privacy policies. Card Nimbus does not store your full credit card number on our servers.',
      },
      {
        subtitle: '4.2 Email Communications',
        text: 'We use Resend to deliver transactional and marketing emails. Your email address and name are shared with Resend solely for the purpose of delivering these communications.',
      },
      {
        subtitle: '4.3 Analytics and Infrastructure',
        text: 'We may use analytics services to understand usage patterns. Data shared with these providers is aggregated and anonymized where possible. Our hosting and infrastructure providers process data on our behalf under strict confidentiality agreements.',
      },
    ],
  },
  {
    title: '5. Data Retention',
    content: [
      {
        text: 'We retain your personal data for as long as your account is active and as needed to provide our services. After account deletion, we may retain certain data for up to 90 days for backup and fraud prevention purposes, and longer where required by law (such as transaction records for tax compliance). Anonymized analytics data may be retained indefinitely.',
      },
    ],
  },
  {
    title: '6. Your Rights',
    content: [
      {
        text: 'Depending on your jurisdiction, you may have the right to: access the personal data we hold about you; request correction of inaccurate data; request deletion of your data; object to or restrict certain processing; receive your data in a portable format; withdraw consent for optional processing such as marketing emails. To exercise any of these rights, contact us at privacy@cardnimbus.com. We will respond within 30 days.',
      },
    ],
  },
  {
    title: '7. Data Security',
    content: [
      {
        text: 'We implement industry-standard security measures including encryption in transit (TLS), secure password hashing, and regular security audits. While we take reasonable steps to protect your data, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.',
      },
    ],
  },
  {
    title: '8. Children\'s Privacy',
    content: [
      {
        text: 'Card Nimbus is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us with personal data, please contact us and we will promptly delete it.',
      },
    ],
  },
  {
    title: '9. Changes to This Policy',
    content: [
      {
        text: 'We may update this Privacy Policy from time to time. Material changes will be communicated via email to registered users and through a notice on our website. Continued use of Card Nimbus after changes take effect constitutes acceptance of the revised policy.',
      },
    ],
  },
  {
    title: '10. Contact for Privacy Concerns',
    content: [
      {
        text: 'If you have questions, concerns, or requests regarding your privacy or this policy, contact us at:',
      },
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <BackHeader title="Privacy Policy" crumbs={[{ label: 'Home', href: '/' }]} />

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-text-muted text-sm">Last updated: {lastUpdated}</p>
        </div>

        {/* Table of Contents */}
        <nav className="mb-10 p-5 rounded-2xl bg-surface-raised border border-surface-border">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">Contents</p>
          <ol className="space-y-1.5 text-sm">
            {sections.map((section) => (
              <li key={section.title}>
                <a
                  href={`#section-${section.title.split('.')[0]?.trim()}`}
                  className="text-nimbus-600 hover:text-nimbus-700 transition-colors"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section, sectionIndex) => (
            <section
              key={section.title}
              id={`section-${section.title.split('.')[0]?.trim()}`}
            >
              {sectionIndex > 0 && <hr className="border-surface-border mb-10" />}
              <h2 className="text-xl font-bold text-text-primary mb-5">{section.title}</h2>
              <div className="space-y-5 text-sm text-text-secondary leading-relaxed">
                {section.content.map((item, i) => (
                  <div key={i}>
                    {item.subtitle && (
                      <h3 className="text-text-primary font-semibold mb-1.5">{item.subtitle}</h3>
                    )}
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>

              {/* Contact details for the last section */}
              {sectionIndex === sections.length - 1 && (
                <div className="mt-4 p-4 rounded-xl bg-surface-raised border border-surface-border text-sm text-text-secondary leading-relaxed">
                  <p className="font-medium text-text-primary mb-1">Card Nimbus Privacy Team</p>
                  <p>
                    Email:{' '}
                    <a
                      href="mailto:privacy@cardnimbus.com"
                      className="text-nimbus-600 hover:text-nimbus-700 transition-colors"
                    >
                      privacy@cardnimbus.com
                    </a>
                  </p>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
