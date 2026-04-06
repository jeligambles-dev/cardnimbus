import type { Metadata } from 'next'
import Link from 'next/link'
import { BackHeader } from '@/components/ui/back-header'
import { ContactForm } from './contact-form'

export const metadata: Metadata = {
  title: 'Contact Us — Card Nimbus',
  description:
    'Get in touch with the Card Nimbus support team. We are here to help with orders, account issues, and general inquiries.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <BackHeader title="Contact Us" crumbs={[{ label: 'Home', href: '/' }]} />

        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Contact Us
          </h1>
          <p className="mt-2 text-text-muted text-sm">
            Have a question or need help? Reach out and we will get back to you as soon as possible.
          </p>
        </div>

        {/* Contact info cards */}
        <div className="grid gap-4 sm:grid-cols-2 mb-10">
          {[
            {
              label: 'Email',
              value: 'support@cardnimbus.com',
              href: 'mailto:support@cardnimbus.com',
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              ),
            },
            {
              label: 'Live Chat',
              value: 'Available via support widget',
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              ),
            },
            {
              label: 'Business Hours',
              value: 'Mon — Fri, 9 AM — 6 PM EST',
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              label: 'Response Time',
              value: 'Within 24 hours on business days',
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              ),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-2xl border border-surface-border bg-surface-raised p-4"
            >
              <div className="mt-0.5 text-nimbus-600">{item.icon}</div>
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-1">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-sm font-medium text-nimbus-600 hover:text-nimbus-700 transition-colors"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-text-primary">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <hr className="border-surface-border mb-10" />

        {/* Contact form */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-2">Send Us a Message</h2>
          <p className="text-sm text-text-muted mb-6">
            Fill out the form below and we will get back to you within one business day.
          </p>
          <ContactForm />
        </section>

        <div className="mt-10 pt-6 border-t border-surface-border text-sm text-text-muted">
          Looking for answers?{' '}
          <Link
            href="/faq"
            className="text-nimbus-600 hover:text-nimbus-700 transition-colors"
          >
            Check our FAQ
          </Link>
          .
        </div>
      </div>
    </div>
  )
}
