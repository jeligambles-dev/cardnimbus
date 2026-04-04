'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const CATEGORIES = [
  {
    emoji: '🎴',
    label: 'Packs',
    tagline: 'Rip and reveal',
    href: '/shop?category=PACK',
    accent: '#fb923c',
  },
  {
    emoji: '📦',
    label: 'Booster Boxes',
    tagline: '36 packs of potential',
    href: '/shop?category=BOOSTER_BOX',
    accent: '#a3e635',
  },
  {
    emoji: '🏆',
    label: 'Slabs',
    tagline: 'Graded perfection',
    href: '/shop?category=SLAB',
    accent: '#facc15',
  },
  {
    emoji: '⚡',
    label: 'Singles',
    tagline: 'The exact card you need',
    href: '/shop?category=SINGLE',
    accent: '#38bdf8',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
}

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={containerVariants}
        className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
      >
        {CATEGORIES.map((cat) => (
          <motion.div key={cat.label} variants={cardVariants}>
            <Link
              href={cat.href}
              className="group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border border-surface-border bg-surface-raised p-6 transition-colors duration-200 hover:border-surface-overlay"
              style={
                {
                  '--cat-accent': cat.accent,
                } as React.CSSProperties
              }
            >
              {/* Hover glow */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl"
                style={{
                  background: `radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in srgb, ${cat.accent} 12%, transparent), transparent)`,
                }}
              />

              <span className="relative text-4xl leading-none">{cat.emoji}</span>

              <div className="relative">
                <p className="text-base font-bold text-text-primary">{cat.label}</p>
                <p className="mt-0.5 text-sm text-text-secondary">{cat.tagline}</p>
              </div>

              {/* Arrow */}
              <span
                className="relative mt-auto text-text-muted transition-all duration-200 group-hover:translate-x-1"
                style={{ color: cat.accent }}
                aria-hidden
              >
                →
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
