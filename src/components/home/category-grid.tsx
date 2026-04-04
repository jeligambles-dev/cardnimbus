'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const CATEGORIES = [
  {
    emoji: '🎴',
    label: 'Packs',
    tagline: 'Rip and reveal',
    href: '/shop?category=PACK',
    gradient: 'from-red-500 to-red-600',
  },
  {
    emoji: '📦',
    label: 'Booster Boxes',
    tagline: '36 packs of potential',
    href: '/shop?category=BOOSTER_BOX',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    emoji: '🏆',
    label: 'Slabs',
    tagline: 'Graded perfection',
    href: '/shop?category=SLAB',
    gradient: 'from-yellow-400 to-amber-500',
  },
  {
    emoji: '⚡',
    label: 'Singles',
    tagline: 'The exact card you need',
    href: '/shop?category=SINGLE',
    gradient: 'from-blue-500 to-cyan-500',
  },
]

export function CategoryGrid() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-nimbus-500">
            Shop by category
          </p>
          <h2 className="text-3xl font-black tracking-tight text-text-primary sm:text-4xl">
            Find what you're chasing
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                href={cat.href}
                className="group relative block overflow-hidden rounded-2xl border-2 border-surface-border bg-white transition-all duration-300 hover:border-nimbus-400 hover:shadow-2xl hover:-translate-y-1.5"
              >
                {/* Colored top section */}
                <div className={`relative aspect-square bg-gradient-to-br ${cat.gradient} flex items-center justify-center overflow-hidden`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_60%)]" />
                  <span className="relative text-7xl lg:text-8xl drop-shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                    {cat.emoji}
                  </span>
                </div>
                {/* White label section */}
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black tracking-tight text-text-primary">
                        {cat.label}
                      </h3>
                      <p className="mt-0.5 text-sm text-text-secondary">
                        {cat.tagline}
                      </p>
                    </div>
                    <span className="text-nimbus-500 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
