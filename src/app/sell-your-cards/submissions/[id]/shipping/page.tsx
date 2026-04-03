import Link from 'next/link'

export const metadata = {
  title: 'Shipping Instructions — Card Nimbus',
}

const CHECKLIST = [
  'Card(s) in a toploader or card saver',
  'Toploader wrapped in a penny sleeve first',
  'Wrapped in bubble wrap or padded with tissue paper',
  'Placed in a rigid bubble mailer or small box',
  'Return address written clearly on the outside',
  'Print and include order/submission confirmation email',
]

interface Props {
  params: Promise<{ id: string }>
}

export default async function ShippingInstructionsPage({ params }: Props) {
  const { id } = await params

  return (
    <main className="min-h-screen bg-surface">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/sell-your-cards/submissions" className="hover:text-text-primary transition-colors">
            My Submissions
          </Link>
          <span>/</span>
          <Link href={`/sell-your-cards/submissions/${id}`} className="hover:text-text-primary transition-colors">
            Submission
          </Link>
          <span>/</span>
          <span className="text-text-primary">Shipping</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Shipping Instructions</h1>
          <p className="mt-1 text-text-secondary">
            Pack your cards carefully and ship them to us. We&apos;ll confirm receipt and process your payment promptly.
          </p>
        </div>

        {/* Step-by-step packing guide */}
        <section className="mb-8 rounded-2xl border border-surface-border bg-surface-raised p-6">
          <h2 className="mb-4 text-lg font-bold text-text-primary">Packing Guide</h2>
          <ol className="space-y-4">
            {[
              {
                title: 'Sleeve the Card',
                desc: 'Place the card in a penny sleeve first to protect the surface from the rigid toploader.',
              },
              {
                title: 'Insert into a Toploader',
                desc: 'Slide the sleeved card into a standard 35pt toploader (or card saver for thicker cards). Tape the top closed.',
              },
              {
                title: 'Wrap for Cushioning',
                desc: 'Wrap the toploader in a small sheet of bubble wrap or fold it in tissue paper. This prevents the card from sliding and absorbs impact.',
              },
              {
                title: 'Use a Rigid Mailer',
                desc: 'Place the wrapped card into a rigid bubble mailer. For multiple cards, use a small cardboard box. Do not use standard envelopes — they bend.',
              },
              {
                title: 'Seal & Label',
                desc: 'Seal the mailer securely. Write your return address on the outside. Include your submission confirmation inside the package.',
              },
            ].map(({ title, desc }, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-nimbus-500/10 text-xs font-bold text-nimbus-400 border border-nimbus-500/30">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-text-primary">{title}</p>
                  <p className="mt-0.5 text-sm text-text-secondary">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Checklist */}
        <section className="mb-8 rounded-2xl border border-surface-border bg-surface-raised p-6">
          <h2 className="mb-4 text-lg font-bold text-text-primary">Before You Seal the Package</h2>
          <ul className="space-y-2">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-nimbus-500/10 text-nimbus-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <span className="text-sm text-text-secondary">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Mailing Address */}
        <section className="mb-8 rounded-2xl border border-nimbus-500/30 bg-nimbus-500/5 p-6">
          <h2 className="mb-1 text-lg font-bold text-text-primary">Mail To</h2>
          <p className="mb-4 text-sm text-text-secondary">Please ship all cards to our processing center:</p>
          <address className="not-italic space-y-0.5 font-mono text-sm text-text-primary">
            <p className="font-semibold">Card Nimbus — Buying Dept.</p>
            <p>123 Collector Lane</p>
            <p>Suite 200</p>
            <p>Seattle, WA 98101</p>
            <p>United States</p>
          </address>
        </section>

        {/* Timeline expectation */}
        <section className="rounded-2xl border border-surface-border bg-surface-raised p-6">
          <h2 className="mb-3 text-lg font-bold text-text-primary">What Happens Next?</h2>
          <ol className="space-y-3">
            {[
              { step: 'Ship', desc: 'Drop your package at any USPS, UPS, or FedEx location.' },
              { step: 'We Receive', desc: 'We\'ll email you once your cards arrive (typically 3–7 business days).' },
              { step: 'Verification', desc: 'Our team verifies condition against your submission photos (1–2 business days).' },
              { step: 'Payment', desc: 'Payment is sent within 1 business day of verification.' },
            ].map(({ step, desc }, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-overlay text-xs font-bold text-text-secondary border border-surface-border">
                  {i + 1}
                </span>
                <div>
                  <span className="font-semibold text-text-primary">{step}: </span>
                  <span className="text-sm text-text-secondary">{desc}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-8">
          <Link
            href={`/sell-your-cards/submissions/${id}`}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            ← Back to Submission
          </Link>
        </div>
      </div>
    </main>
  )
}
