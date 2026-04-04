import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Card Nimbus — Pokemon Card Marketplace',
  description: 'Card Nimbus is a trusted Pokemon card marketplace built on fair pricing, card authentication, and a passion for the hobby.',
}

const values = [
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Authentication',
    description: 'Every graded slab is verified for authenticity. Raw cards are inspected and described accurately — no hidden flaws, no surprises.',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: 'Fair Pricing',
    description: 'Our listings are benchmarked against live market data. You pay what a card is worth — not inflated margins or artificial scarcity pricing.',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Community',
    description: 'Card Nimbus was built by collectors, for collectors. We\'re part of the same hobby — we care about the community as much as the cards.',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4" />
        <circle cx="9" cy="21" r="1" />
        <circle cx="18" cy="21" r="1" />
      </svg>
    ),
    title: 'Safe Shipping',
    description: 'Toploaders, bubble mailers, and secure packaging on every order. Your cards arrive exactly as they left — protected and undamaged.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-nimbus-600 uppercase tracking-widest mb-4">
            <span className="w-6 h-px bg-nimbus-500" />
            Our Story
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            About Card Nimbus
          </h1>
          <p className="mt-4 text-text-secondary text-base sm:text-lg leading-relaxed">
            A marketplace built by collectors who got tired of overpaying and under-trusting.
          </p>
        </div>

        {/* Story */}
        <section className="mb-12 space-y-4 text-text-secondary text-sm sm:text-base leading-relaxed">
          <p>
            Card Nimbus started from a simple frustration: the Pokemon card market was full of inflated prices, questionable listings, and sellers who didn't know — or care — about condition accuracy.
          </p>
          <p>
            We built Card Nimbus to be different. As collectors ourselves, we know what it feels like to finally land a card you've been hunting, only to open the package and find it doesn't match the description. That experience drove every decision we made.
          </p>
          <p>
            Today, Card Nimbus is a trusted marketplace for Pokemon singles, packs, booster boxes, and graded slabs. Every listing is reviewed, every grade is verified, and every price is benchmarked against real market data — not wishful thinking.
          </p>
          <p>
            Whether you're chasing a childhood Charizard, building a competitive deck, or investing in the hobby you love, Card Nimbus is the place to do it with confidence.
          </p>
        </section>

        {/* Values */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-text-primary mb-6">What We Stand For</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {values.map((value) => (
              <div key={value.title} className="p-5 rounded-2xl bg-surface-raised border border-surface-border">
                <div className="w-9 h-9 rounded-xl bg-nimbus-500/15 border border-nimbus-500/20 flex items-center justify-center text-nimbus-600 mb-3">
                  {value.icon}
                </div>
                <p className="font-semibold text-text-primary mb-1.5">{value.title}</p>
                <p className="text-sm text-text-secondary leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="p-6 rounded-2xl bg-gradient-to-br from-nimbus-900/30 to-surface-overlay border border-nimbus-300/40 text-center">
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Ready to shop?
          </h2>
          <p className="text-text-secondary text-sm mb-5">
            Browse our full catalog of Pokemon singles, sealed product, and graded slabs.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-nimbus-500 hover:bg-nimbus-400 text-white font-semibold text-sm transition-colors"
            >
              Browse the Shop
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-overlay hover:bg-surface-border border border-surface-border text-text-secondary hover:text-text-primary font-medium text-sm transition-colors"
            >
              Help Center
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
