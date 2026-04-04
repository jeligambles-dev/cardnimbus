'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const FEATURED_SETS = [
  {
    name: 'Paldea Evolved',
    slug: 'paldea-evolved',
    description: 'The Scarlet & Violet era evolves',
    accent: 'from-purple-500 to-pink-500',
    emoji: '🌸',
  },
  {
    name: 'Obsidian Flames',
    slug: 'obsidian-flames',
    description: 'Charizard ex takes center stage',
    accent: 'from-orange-500 to-red-600',
    emoji: '🔥',
  },
  {
    name: 'Paradox Rift',
    slug: 'paradox-rift',
    description: 'Ancient meets future',
    accent: 'from-blue-500 to-cyan-400',
    emoji: '⚡',
  },
  {
    name: 'Shining Fates',
    slug: 'shining-fates',
    description: 'Chase rare shiny Pokemon',
    accent: 'from-yellow-400 to-amber-500',
    emoji: '✨',
  },
]

export function FeaturedSets() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-nimbus-500">
              Shop by Set
            </p>
            <h2 className="text-3xl font-black tracking-tight text-text-primary sm:text-4xl">
              Hottest Sets Right Now
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-text-secondary transition-colors hover:text-nimbus-600"
          >
            Shop all sets
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-5">
          {FEATURED_SETS.map((set, i) => (
            <motion.div
              key={set.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                href={`/shop?search=${encodeURIComponent(set.name)}`}
                className="group block overflow-hidden rounded-2xl border-2 border-surface-border bg-white transition-all hover:border-nimbus-400 hover:shadow-xl hover:-translate-y-1"
              >
                <div className={`relative aspect-[4/5] bg-gradient-to-br ${set.accent} p-5`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.3),transparent_50%)]" />
                  <div className="relative flex h-full flex-col justify-between text-white">
                    <div className="text-5xl">{set.emoji}</div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight leading-tight">
                        {set.name}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-white/90">
                        {set.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm font-bold text-text-primary">
                    Shop now
                  </span>
                  <span className="text-nimbus-500 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
