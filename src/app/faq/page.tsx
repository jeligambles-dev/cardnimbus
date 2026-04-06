import type { Metadata } from 'next'
import Link from 'next/link'
import { BackHeader } from '@/components/ui/back-header'
import { FAQAccordion } from './faq-accordion'

export const metadata: Metadata = {
  title: 'FAQ — Card Nimbus',
  description:
    'Frequently asked questions about buying, selling, and trading Pokemon cards on Card Nimbus.',
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <BackHeader title="FAQ" crumbs={[{ label: 'Home', href: '/' }]} />

        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-2 text-text-muted text-sm">
            Everything you need to know about using Card Nimbus.
          </p>
        </div>

        <FAQAccordion />

        <div className="mt-10 pt-6 border-t border-surface-border text-sm text-text-muted">
          Still have questions?{' '}
          <Link
            href="/contact"
            className="text-nimbus-600 hover:text-nimbus-700 transition-colors"
          >
            Contact our support team
          </Link>
          .
        </div>
      </div>
    </div>
  )
}
