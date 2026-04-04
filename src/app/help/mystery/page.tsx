import Link from 'next/link'

const FAQS = [
  {
    q: 'Can I get the same item twice?',
    a: 'Every item in the pool has a finite quantity. Once an item\'s quantity reaches zero it can no longer be pulled — so while you could pull the same tier twice, the exact same copy of an item cannot be pulled more than the quantity allocated.',
  },
  {
    q: 'What is the no-downgrade guarantee?',
    a: 'The guaranteed minimum value of a collection version never decreases. When a new version is created the guaranteed minimum value must match or exceed the previous version\'s value.',
  },
  {
    q: 'What is the value guarantee?',
    a: 'Every item in the pool has a locked value set at the time the version is created. That value is guaranteed regardless of market fluctuations after purchase — you will always receive an item worth at least that locked value.',
  },
  {
    q: 'Can I see what items are in the pool before purchasing?',
    a: 'Pull rates by tier are publicly displayed on each collection page. The specific items within each tier are revealed only after pulling, to preserve the mystery experience.',
  },
  {
    q: 'How do I receive my item?',
    a: 'After a successful pull, your item is added to your account\'s pull history. Physical cards are shipped to your registered address within 3 business days.',
  },
  {
    q: 'What happens when a collection sells out?',
    a: 'When stock reaches zero the collection is marked as Sold Out and no further pulls are available. Watch out for Low Stock warnings — once those appear, be quick.',
  },
]

export default function MysteryHelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/" className="hover:text-nimbus-600">Home</Link>
        <span>/</span>
        <Link href="/help/faq" className="hover:text-nimbus-600">Help</Link>
        <span>/</span>
        <span className="text-text-secondary">Mystery</span>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-text-primary">How Mystery Packs Work</h1>
        <p className="mt-3 text-text-secondary">
          Mystery Packs let you pull a random card from a curated pool at a fixed price — with a
          guaranteed minimum value on every single pull. No surprises when it comes to value.
        </p>
      </div>

      {/* How it works */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-semibold text-text-primary">How It Works</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              step: '01',
              title: 'Pick a Collection',
              body: 'Browse available Mystery collections. Each has a tier label (e.g. Gold, Platinum), a price, and published pull rates showing the probability for each tier.',
            },
            {
              step: '02',
              title: 'Purchase a Pull',
              body: 'Pay the fixed collection price. Your pull is processed instantly — the system rolls a tier and then a specific item within that tier using a cryptographically-secure RNG.',
            },
            {
              step: '03',
              title: 'Reveal Your Item',
              body: 'Your pulled item is revealed immediately on-screen and saved to your pull history. Physical items are dispatched within 3 business days.',
            },
            {
              step: '04',
              title: 'Value Guaranteed',
              body: 'Every pulled item has a locked value that was set when the collection version was created. That locked value is always at or above the guaranteed minimum for the collection.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-surface-border bg-surface-raised p-5"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-nimbus-500/10 text-nimbus-600">
                <span className="font-mono text-sm font-bold">{item.step}</span>
              </div>
              <h3 className="mb-2 font-semibold text-text-primary">{item.title}</h3>
              <p className="text-sm text-text-secondary">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pull Rates Explained */}
      <section className="mb-12 rounded-xl border border-surface-border bg-surface-raised p-6">
        <h2 className="mb-4 text-xl font-semibold text-text-primary">Pull Rates Explained</h2>
        <p className="mb-4 text-sm text-text-secondary">
          Each collection version has tiers (e.g. Common, Rare, Ultra Rare). The pull rates page for
          each collection shows the exact probability of pulling each tier. These rates always sum to
          100%.
        </p>

        <div className="mb-4 overflow-hidden rounded-lg border border-surface-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-overlay">
                <th className="px-4 py-2.5 text-left font-medium text-text-secondary">Tier</th>
                <th className="px-4 py-2.5 text-left font-medium text-text-secondary">Probability</th>
                <th className="px-4 py-2.5 text-left font-medium text-text-secondary">Example Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {[
                { tier: 'Ultra Rare', prob: '5%', items: 'PSA 10 slabs, vintage holos' },
                { tier: 'Rare', prob: '20%', items: 'Modern holos, first editions' },
                { tier: 'Uncommon', prob: '35%', items: 'Reverse holos, promo cards' },
                { tier: 'Common', prob: '40%', items: 'NM singles, bulk rares' },
              ].map((row) => (
                <tr key={row.tier} className="hover:bg-surface-overlay/50">
                  <td className="px-4 py-2.5 font-medium text-text-primary">{row.tier}</td>
                  <td className="px-4 py-2.5 text-nimbus-600">{row.prob}</td>
                  <td className="px-4 py-2.5 text-text-secondary">{row.items}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-muted">
          This is an example. Actual rates vary per collection and are displayed on each
          collection&rsquo;s page before purchase.
        </p>
      </section>

      {/* Guarantees */}
      <section className="mb-12 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-800/30 bg-emerald-950/20 p-5">
          <h3 className="mb-2 font-semibold text-emerald-400">No-Downgrade Guarantee</h3>
          <p className="text-sm text-text-secondary">
            When a collection is updated to a new version, the guaranteed minimum value can only stay
            the same or increase — it will never go down. You can always expect at least as much
            value as the version you purchased was advertised at.
          </p>
        </div>
        <div className="rounded-xl border border-nimbus-300/30 bg-nimbus-50/20 p-5">
          <h3 className="mb-2 font-semibold text-nimbus-600">Value Guarantee</h3>
          <p className="text-sm text-text-secondary">
            Every item in the pool has a <strong className="text-text-primary">locked value</strong>{' '}
            set at version creation time. That value is guaranteed regardless of what happens to
            market prices after you pull. The locked value is always at or above the collection&rsquo;s
            guaranteed minimum.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="mb-6 text-xl font-semibold text-text-primary">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-xl border border-surface-border bg-surface-raised p-5">
              <h3 className="mb-2 font-semibold text-text-primary">{faq.q}</h3>
              <p className="text-sm text-text-secondary">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="mt-12 flex flex-col items-center gap-3 rounded-xl border border-surface-border bg-surface-raised p-8 text-center">
        <p className="font-semibold text-text-primary">Ready to pull?</p>
        <Link
          href="/mystery"
          className="rounded-xl bg-nimbus-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nimbus-500/25 transition-colors hover:bg-nimbus-600"
        >
          Browse Mystery Packs
        </Link>
        <Link href="/help/contact" className="text-sm text-text-muted hover:text-nimbus-600">
          Still have questions? Contact us
        </Link>
      </div>
    </div>
  )
}
