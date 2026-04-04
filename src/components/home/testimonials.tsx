'use client'

import { motion } from 'framer-motion'

const TESTIMONIALS = [
  {
    text: 'Pulled a Charizard VMAX from a pack I bought here. Pack was factory sealed and shipping was fast. Buying from Card Nimbus again.',
    name: 'Marcus T.',
    role: 'Collector',
    rating: 5,
  },
  {
    text: 'The marketplace escrow gave me peace of mind buying a $500 slab from a stranger. Smooth transaction from start to finish.',
    name: 'Sarah K.',
    role: 'PSA collector',
    rating: 5,
  },
  {
    text: 'Sold a box of pulls and got a fair offer within a day. Money hit my account the same week the cards arrived. Legit operation.',
    name: 'Devin R.',
    role: 'Seller',
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="bg-surface-raised">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="text-center mb-12">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-nimbus-500">
            What collectors say
          </p>
          <h2 className="text-3xl font-black tracking-tight text-text-primary sm:text-4xl">
            Trusted by thousands
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-surface-border bg-white p-6"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <svg key={idx} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-text-primary leading-relaxed">{t.text}</p>
              <div className="mt-5 pt-5 border-t border-surface-border">
                <p className="text-sm font-bold text-text-primary">{t.name}</p>
                <p className="text-xs text-text-secondary">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
