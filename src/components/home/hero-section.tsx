'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Red accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in srgb, #ff0000 10%, transparent), transparent)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Left: Headline + CTAs */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-nimbus-50 border border-nimbus-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-nimbus-700"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nimbus-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-nimbus-500" />
              </span>
              Fresh drops weekly
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-5xl font-black leading-[1.05] tracking-tight text-text-primary sm:text-6xl lg:text-7xl"
            >
              Your home for{' '}
              <span className="text-nimbus-500">Pokemon</span>
              <br />
              cards, rips, and pulls.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary"
            >
              Packs, booster boxes, slabs, and singles from the hottest sets.
              Authenticated, fair-priced, and shipped with care.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/shop"
                className="rounded-xl bg-nimbus-500 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-nimbus-500/30 transition-all hover:bg-nimbus-600 hover:shadow-xl hover:shadow-nimbus-500/40"
              >
                Shop the Drops →
              </Link>
              <Link
                href="/marketplace"
                className="rounded-xl border-2 border-surface-border bg-white px-7 py-3.5 text-base font-bold text-text-primary transition-all hover:border-nimbus-500 hover:text-nimbus-600"
              >
                Browse Marketplace
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center gap-6 text-sm text-text-secondary"
            >
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-nimbus-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">100% Authentic</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-nimbus-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
                <span className="font-medium">Fast Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-nimbus-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Secure Checkout</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Stacked card showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative mx-auto aspect-[4/5] max-w-md">
              {/* Decorative cards */}
              <motion.div
                animate={{ rotate: [-8, -6, -8] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-0 top-8 h-72 w-52 rounded-2xl bg-gradient-to-br from-nimbus-400 to-nimbus-600 shadow-2xl shadow-nimbus-500/30"
              >
                <div className="absolute inset-3 rounded-xl border-2 border-white/20">
                  <div className="flex h-full flex-col items-center justify-center text-white">
                    <span className="text-6xl">⚡</span>
                    <span className="mt-2 font-black text-xl">HOLO</span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                animate={{ rotate: [8, 10, 8] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute right-0 top-16 h-72 w-52 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl shadow-orange-500/30"
              >
                <div className="absolute inset-3 rounded-xl border-2 border-white/20">
                  <div className="flex h-full flex-col items-center justify-center text-white">
                    <span className="text-6xl">🔥</span>
                    <span className="mt-2 font-black text-xl">RARE</span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-1/2 top-0 h-80 w-56 -translate-x-1/2 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-nimbus-500 shadow-2xl shadow-nimbus-500/40"
              >
                <div className="absolute inset-3 rounded-xl border-2 border-white/30">
                  <div className="flex h-full flex-col items-center justify-center text-white">
                    <span className="text-7xl">✨</span>
                    <span className="mt-3 font-black text-2xl tracking-wide">CHASE</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
