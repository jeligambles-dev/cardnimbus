import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Help Center — Card Nimbus',
  description: 'Get help with your Card Nimbus orders, shipping, returns, and more.',
}

const helpTopics = [
  {
    href: '/help/shipping',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
        <rect x="9" y="11" width="14" height="10" rx="2" />
        <circle cx="12" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
      </svg>
    ),
    title: 'Shipping Information',
    description: 'Delivery times, shipping methods, tracking, and international orders.',
  },
  {
    href: '/help/returns',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    ),
    title: 'Returns & Refunds',
    description: '30-day return policy, refund processing, and how to start a return.',
  },
]

const faqs = [
  {
    q: 'How are cards protected during shipping?',
    a: 'All cards are shipped in penny sleeves and rigid toploaders, then secured in a bubble mailer or box for full protection.',
  },
  {
    q: 'Are your graded cards authentic?',
    a: 'Yes. All graded slabs are authenticated and verified before listing. We only carry PSA, BGS, and CGC-graded cards.',
  },
  {
    q: 'Can I cancel my order?',
    a: 'Orders can be cancelled within 1 hour of placement. After that, please wait for delivery and initiate a return if needed.',
  },
  {
    q: 'Do you offer price matching?',
    a: 'We strive to offer competitive, fair market pricing. While we don\'t formally price-match, our listings are regularly reviewed against market rates.',
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Help Center
          </h1>
          <p className="mt-3 text-text-secondary text-base sm:text-lg">
            Find answers to common questions or get in touch with our team.
          </p>
        </div>

        {/* Topic Cards */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">
            Browse Topics
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {helpTopics.map((topic) => (
              <Link
                key={topic.href}
                href={topic.href}
                className="group flex gap-4 p-5 rounded-2xl bg-surface-raised border border-surface-border hover:border-nimbus-500/50 hover:bg-surface-overlay transition-all duration-200"
              >
                <div className="shrink-0 w-11 h-11 rounded-xl bg-surface-overlay border border-surface-border flex items-center justify-center text-nimbus-400 group-hover:text-nimbus-300 transition-colors">
                  {topic.icon}
                </div>
                <div>
                  <p className="font-semibold text-text-primary group-hover:text-nimbus-300 transition-colors">
                    {topic.title}
                  </p>
                  <p className="text-sm text-text-secondary mt-0.5 leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-5 rounded-2xl bg-surface-raised border border-surface-border">
                <p className="font-semibold text-text-primary mb-1.5">{faq.q}</p>
                <p className="text-text-secondary text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="p-6 rounded-2xl bg-surface-overlay border border-surface-border">
          <h2 className="text-lg font-semibold text-text-primary mb-1">Still need help?</h2>
          <p className="text-text-secondary text-sm mb-4">
            Our support team typically responds within 1 business day.
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-text-secondary">
              <svg className="w-4 h-4 text-nimbus-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <a href="mailto:support@cardnimbus.com" className="hover:text-nimbus-400 transition-colors">
                support@cardnimbus.com
              </a>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <svg className="w-4 h-4 text-nimbus-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Monday – Friday, 9 AM – 6 PM EST</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
