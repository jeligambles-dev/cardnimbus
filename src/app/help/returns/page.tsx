import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Returns & Refunds — Card Nimbus',
  description: 'Card Nimbus return policy: 30-day returns on unopened products, as-described guarantee on singles and graded cards.',
}

const steps = [
  {
    step: '1',
    title: 'Contact Support',
    description: 'Email support@cardnimbus.com with your order number and reason for return.',
  },
  {
    step: '2',
    title: 'Receive Return Label',
    description: "We'll send a prepaid return shipping label within 1 business day.",
  },
  {
    step: '3',
    title: 'Ship It Back',
    description: 'Pack the item securely and drop it off at any carrier location.',
  },
  {
    step: '4',
    title: 'Refund Processed',
    description: 'Once received and inspected, your refund is issued within 5–7 business days.',
  },
]

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <Link href="/help" className="hover:text-text-secondary transition-colors">Help Center</Link>
          <span>/</span>
          <span className="text-text-secondary">Returns & Refunds</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Returns & Refunds
          </h1>
          <p className="mt-3 text-text-secondary text-base leading-relaxed">
            We want you to shop with confidence. If something isn't right, we'll make it right.
          </p>
        </div>

        {/* Policy Overview */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Return Policy</h2>
          <div className="space-y-4">

            <div className="p-5 rounded-2xl bg-surface-raised border border-surface-border">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-nimbus-400 font-bold text-sm uppercase tracking-wide">Sealed Products</span>
                <span className="text-xs text-volt-400 bg-volt-400/10 px-2 py-0.5 rounded-full font-medium">30-Day Returns</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Unopened booster boxes, packs, and sealed products may be returned within 30 days of delivery for a full refund, provided the packaging is undamaged and the seal is intact.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-raised border border-surface-border">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-nimbus-400 font-bold text-sm uppercase tracking-wide">Singles & Raw Cards</span>
                <span className="text-xs text-nimbus-400 bg-nimbus-400/10 px-2 py-0.5 rounded-full font-medium">As-Described Guarantee</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                If a raw card or single is not as described — wrong card, condition significantly worse than listed, or damage not disclosed — you may return it for a full refund within 14 days.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-raised border border-surface-border">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-nimbus-400 font-bold text-sm uppercase tracking-wide">Graded Cards (Slabs)</span>
                <span className="text-xs text-nimbus-400 bg-nimbus-400/10 px-2 py-0.5 rounded-full font-medium">As-Described Guarantee</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Graded slabs are guaranteed to match the listed grade and certification. If the slab arrives cracked, tampered with, or not as described, contact us within 14 days for a full refund.
              </p>
            </div>

          </div>
        </section>

        {/* How to Return */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-text-primary mb-4">How to Start a Return</h2>
          <div className="space-y-3">
            {steps.map((s) => (
              <div key={s.step} className="flex gap-4 p-4 rounded-2xl bg-surface-raised border border-surface-border">
                <div className="w-8 h-8 rounded-full bg-nimbus-500/20 border border-nimbus-500/30 flex items-center justify-center shrink-0">
                  <span className="text-nimbus-400 font-bold text-sm">{s.step}</span>
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-sm">{s.title}</p>
                  <p className="text-sm text-text-secondary mt-0.5 leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Refund Timeline */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Refund Timeline</h2>
          <div className="p-5 rounded-2xl bg-surface-raised border border-surface-border text-sm text-text-secondary leading-relaxed space-y-2">
            <p>Refunds are processed to your original payment method within <strong className="text-text-primary">5–7 business days</strong> after we receive and inspect your return.</p>
            <p>Credit card refunds may take an additional 3–5 business days to appear on your statement depending on your bank.</p>
          </div>
        </section>

        {/* Non-Returnable */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Non-Returnable Items</h2>
          <ul className="space-y-2 text-sm text-text-secondary">
            {[
              'Opened packs, booster boxes, or any product with a broken seal.',
              'Digital codes or in-game items.',
              'Items damaged after delivery due to buyer handling.',
              'Clearance or final sale items (marked at checkout).',
            ].map((item, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="text-text-muted mt-0.5 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Help link */}
        <div className="pt-6 border-t border-surface-border text-sm text-text-muted">
          Need to start a return? Email{' '}
          <a href="mailto:support@cardnimbus.com" className="text-nimbus-400 hover:text-nimbus-300 transition-colors">support@cardnimbus.com</a>{' '}
          or visit our <Link href="/help" className="text-nimbus-400 hover:text-nimbus-300 transition-colors">Help Center</Link>.
        </div>

      </div>
    </div>
  )
}
