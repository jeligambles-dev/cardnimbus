'use client'

import { motion } from 'framer-motion'

const STATS = [
  { value: '50K+', label: 'Cards Shipped' },
  { value: '4.9★', label: 'Buyer Rating' },
  { value: '24h', label: 'Avg Ship Time' },
  { value: '12K+', label: 'Happy Collectors' },
]

export function StatsBar() {
  return (
    <section className="bg-nimbus-500 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="text-4xl font-black tracking-tight sm:text-5xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs font-bold uppercase tracking-wider text-white/80 sm:text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
