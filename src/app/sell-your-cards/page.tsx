import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Sell Your Cards — Card Nimbus',
  description: 'Get cash for your trading cards. Submit your cards to Card Nimbus for a quick, fair offer.',
}

const STEPS = [
  {
    step: '01',
    title: 'Submit Your Cards',
    description:
      'Tell us about the cards you want to sell. Search our database or describe unlisted cards. Upload clear photos from multiple angles.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'We Review',
    description:
      'Our team evaluates condition, authenticity, and current market value. You\'ll receive a fair offer based on live TCGPlayer data within 24–48 hours.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Get Paid',
    description:
      'Accept the offer, ship your cards using our prepaid label, and receive payment within 2 business days of receiving your cards.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
]

const REASONS = [
  { label: 'Fair Market Prices', desc: 'Offers based on real-time TCGPlayer data — no low-ball guesses.' },
  { label: 'Fast Turnaround', desc: 'Offers within 24–48 hours. Payment sent within 2 business days of receiving.' },
  { label: 'Free Shipping', desc: 'We provide a prepaid shipping label once you accept an offer.' },
  { label: 'Secure & Insured', desc: 'All shipments are insured. Your cards are protected end-to-end.' },
]

export default function SellYourCardsPage() {
  return (
    <main className="min-h-screen bg-surface">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-surface-border bg-surface-raised">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-nimbus-500/10 via-transparent to-transparent" />
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-nimbus-500/30 bg-nimbus-500/10 px-4 py-1.5 text-sm font-medium text-nimbus-600">
              <span className="h-1.5 w-1.5 rounded-full bg-nimbus-500" />
              Buying Cards — Fast &amp; Fair
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              Turn Your Cards{' '}
              <span className="text-nimbus-500">Into Cash</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-text-secondary">
              Card Nimbus buys singles, sealed product, and slabs at competitive prices. Submit in minutes — no haggling, no hassle.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Link href="/sell-your-cards/submit">
                <Button size="lg">Start Submission</Button>
              </Link>
              <Link href="/sell-your-cards/submissions">
                <Button variant="secondary" size="lg">View My Submissions</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">How It Works</h2>
          <p className="mt-2 text-text-secondary">Three simple steps from submission to payment.</p>
        </div>
        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Connector line */}
          <div className="absolute left-0 top-10 hidden h-0.5 w-full bg-gradient-to-r from-transparent via-surface-border to-transparent md:block" />
          {STEPS.map(({ step, title, description, icon }) => (
            <div key={step} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-nimbus-500/30 bg-nimbus-500/10 text-nimbus-600 shadow-lg shadow-nimbus-500/10">
                {icon}
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-nimbus-500 text-[10px] font-bold text-white shadow">
                  {step}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-text-primary">{title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why sell with us */}
      <section className="border-t border-surface-border bg-surface-raised">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Why Sell With Card Nimbus?</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map(({ label, desc }) => (
              <div key={label} className="rounded-xl border border-surface-border bg-surface p-5">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-nimbus-500/10">
                  <span className="h-2 w-2 rounded-full bg-nimbus-500" />
                </div>
                <h4 className="mb-1.5 font-semibold text-text-primary">{label}</h4>
                <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-nimbus-500/30 bg-nimbus-500/5 p-10 text-center">
          <h2 className="text-2xl font-bold text-text-primary">Ready to Sell?</h2>
          <p className="text-text-secondary">
            It takes less than 5 minutes to submit your first card.
          </p>
          <Link href="/sell-your-cards/submit">
            <Button size="lg">Start Your Submission</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
