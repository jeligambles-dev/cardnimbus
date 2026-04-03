import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Shipping Information — Card Nimbus',
  description: 'Learn about Card Nimbus shipping methods, delivery times, packaging, and tracking.',
}

const shippingMethods = [
  {
    name: 'Standard Shipping',
    time: '5–7 business days',
    description: 'Reliable ground shipping for all domestic orders. Free on orders over $75.',
    price: 'From $4.99',
  },
  {
    name: 'Express Shipping',
    time: '2–3 business days',
    description: 'Faster delivery for time-sensitive orders or valuable cards.',
    price: 'From $12.99',
  },
  {
    name: 'International Shipping',
    time: '7–21 business days',
    description: 'Available to most countries. Customs and import duties may apply.',
    price: 'Calculated at checkout',
  },
]

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <Link href="/help" className="hover:text-text-secondary transition-colors">Help Center</Link>
          <span>/</span>
          <span className="text-text-secondary">Shipping</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Shipping Information
          </h1>
          <p className="mt-3 text-text-secondary text-base leading-relaxed">
            Every order is packed with care to ensure your cards arrive safely and in perfect condition.
          </p>
        </div>

        {/* Shipping Methods */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Shipping Methods</h2>
          <div className="space-y-3">
            {shippingMethods.map((method) => (
              <div key={method.name} className="p-5 rounded-2xl bg-surface-raised border border-surface-border">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="font-semibold text-text-primary">{method.name}</p>
                    <p className="text-sm text-nimbus-400 mt-0.5">{method.time}</p>
                  </div>
                  <span className="text-sm font-medium text-text-secondary whitespace-nowrap">{method.price}</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{method.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Packaging */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-text-primary mb-4">How We Pack Your Cards</h2>
          <div className="p-5 rounded-2xl bg-surface-raised border border-surface-border space-y-3 text-sm text-text-secondary leading-relaxed">
            <p>
              We take packaging seriously. Every card is sleeved and placed in a rigid toploader to prevent bending or surface damage during transit.
            </p>
            <p>
              Singles and small orders are shipped in padded bubble mailers. Larger orders — booster boxes, multi-card lots, and slabs — are packed in sturdy cardboard boxes with additional padding.
            </p>
            <p>
              Graded slabs receive extra bubble wrap and are secured inside the box to prevent shifting.
            </p>
          </div>
        </section>

        {/* Tracking */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Order Tracking</h2>
          <div className="p-5 rounded-2xl bg-surface-raised border border-surface-border text-sm text-text-secondary leading-relaxed">
            <p>
              Tracking is included with all orders. You'll receive a confirmation email with your tracking number as soon as your order ships. You can monitor delivery progress directly through the carrier's website or your Card Nimbus account dashboard.
            </p>
          </div>
        </section>

        {/* Important Notes */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Important Notes</h2>
          <ul className="space-y-2 text-sm text-text-secondary">
            {[
              'Orders are typically processed within 1–2 business days.',
              'Shipping times are estimates and may vary during peak periods or due to carrier delays.',
              'For international orders, the buyer is responsible for any applicable customs duties or import taxes.',
              'We are not responsible for packages lost or stolen after confirmed delivery.',
              'If your package arrives damaged, please contact us within 48 hours with photos.',
            ].map((note, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="text-nimbus-500 mt-0.5 shrink-0">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Help link */}
        <div className="pt-6 border-t border-surface-border text-sm text-text-muted">
          Questions? <Link href="/help" className="text-nimbus-400 hover:text-nimbus-300 transition-colors">Return to Help Center</Link> or email us at{' '}
          <a href="mailto:support@cardnimbus.com" className="text-nimbus-400 hover:text-nimbus-300 transition-colors">support@cardnimbus.com</a>.
        </div>

      </div>
    </div>
  )
}
