import Link from 'next/link'

const FAQS = [
  {
    q: 'When will the winner be announced?',
    a: 'The draw happens automatically once all slots are filled, or when the raffle end date is reached (provided the minimum fill threshold was met). Results are published instantly on the raffle page.',
  },
  {
    q: 'Can I buy more than one ticket?',
    a: 'Each raffle specifies a maximum tickets-per-user limit. You can hold multiple tickets up to that limit to increase your odds.',
  },
  {
    q: 'What happens if the raffle does not fill?',
    a: 'If the minimum fill threshold is not reached by the end date, the raffle is cancelled and all payments are fully refunded.',
  },
  {
    q: 'How do I verify the draw was fair?',
    a: 'After the draw, the random seed used is published on the raffle detail page. Anyone can independently verify the winning ticket number by reproducing the draw using the published seed and the list of ticket numbers.',
  },
  {
    q: 'When will I receive the prize?',
    a: 'Winners are contacted within 24 hours of the draw. Prizes are shipped within 3 business days using tracked couriers.',
  },
  {
    q: 'Are there any region restrictions?',
    a: 'Some raffles may have legal region restrictions due to local gambling or prize-draw laws. These are displayed prominently on the raffle page.',
  },
]

export default function RaffleHelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/" className="hover:text-nimbus-600">Home</Link>
        <span>/</span>
        <Link href="/help/faq" className="hover:text-nimbus-600">Help</Link>
        <span>/</span>
        <span className="text-text-secondary">Raffles</span>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-text-primary">How Raffles Work</h1>
        <p className="mt-3 text-text-secondary">
          Card Nimbus raffles give everyone a fair shot at winning rare and high-value cards at a
          fraction of their market price. Here is everything you need to know.
        </p>
      </div>

      {/* How it works — 3 steps */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-semibold text-text-primary">Three Simple Steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Browse & Buy a Ticket',
              body: 'Choose a raffle you like and purchase one or more tickets. Slots are reserved immediately at checkout — your spot is locked the moment payment is confirmed.',
            },
            {
              step: '02',
              title: 'Wait for the Draw',
              body: 'Once every slot is filled (or the end date arrives and the minimum fill is met), the draw runs automatically. No manual intervention — it is instant.',
            },
            {
              step: '03',
              title: 'Winner Gets the Prize',
              body: 'The winner is notified by email and on their account dashboard. The prize is shipped tracked and insured directly to the winner\'s address.',
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

      {/* Fairness / Provably Fair */}
      <section className="mb-12 rounded-xl border border-nimbus-500/20 bg-nimbus-500/5 p-6">
        <h2 className="mb-4 text-xl font-semibold text-text-primary">Provably Fair Draws</h2>
        <p className="mb-4 text-sm text-text-secondary">
          Every draw is powered by a cryptographically-secure random number generator. No one —
          including Card Nimbus staff — can predict or influence the outcome.
        </p>

        <h3 className="mb-2 text-sm font-semibold text-text-primary">How to verify your draw:</h3>
        <ol className="list-inside list-decimal space-y-2 text-sm text-text-secondary">
          <li>
            After the draw, the <strong className="text-text-primary">random seed</strong> (a 64-character hex string) is
            published on the raffle detail page.
          </li>
          <li>
            Read the first 4 bytes of the seed as a big-endian 32-bit unsigned integer.
          </li>
          <li>
            Compute <code className="rounded bg-surface-overlay px-1 py-0.5 text-nimbus-600">seedValue % totalTickets</code>{' '}
            to get the zero-based winning index.
          </li>
          <li>
            Sort the ticket list by ticket number ascending and look up that index — it matches the
            published winning ticket number.
          </li>
        </ol>

        <div className="mt-4 rounded-lg bg-surface-overlay p-3 font-mono text-xs text-text-muted">
          <span className="text-nimbus-600">// Example verification (Node.js)</span>
          <br />
          {'const seed = "a3f9..."; // from raffle page'}
          <br />
          {'const buf = Buffer.from(seed, "hex");'}
          <br />
          {'const seedVal = buf.readUInt32BE(0);'}
          <br />
          {'const winnerIdx = seedVal % totalTickets;'}
        </div>
      </section>

      {/* Legal */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-text-primary">Legal Information</h2>
        <div className="space-y-3 text-sm text-text-secondary">
          <p>
            Card Nimbus raffles are prize draws in which every participant has an equal chance per
            ticket purchased. They are not gambling under most jurisdictions because the outcome does
            not depend on the skill or chance of a wagered event — every ticket number has an equal
            probability of being selected.
          </p>
          <p>
            Certain raffles may be restricted in specific regions due to local laws. Where
            restrictions apply, they are displayed on the raffle page before purchase. By entering a
            raffle you confirm you are eligible to participate in your jurisdiction.
          </p>
          <p>
            Prizes are non-transferable and non-exchangeable for cash unless required by law. Full
            terms for each raffle are published on the raffle detail page before purchase.
          </p>
          <p>
            Card Nimbus reserves the right to cancel a raffle if the minimum fill threshold is not
            met. In that case, all ticket purchases are fully refunded.
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
        <p className="font-semibold text-text-primary">Ready to enter a raffle?</p>
        <Link
          href="/raffles"
          className="rounded-xl bg-nimbus-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nimbus-500/25 transition-colors hover:bg-nimbus-600"
        >
          Browse Raffles
        </Link>
        <Link href="/help/contact" className="text-sm text-text-muted hover:text-nimbus-600">
          Still have questions? Contact us
        </Link>
      </div>
    </div>
  )
}
