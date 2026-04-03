'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
  }),
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-surface">
      {/* Subtle gradient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in srgb, #f97316 8%, transparent), transparent)',
        }}
      />
      {/* Large blurred circle accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full opacity-10 blur-3xl"
        style={{ background: '#f97316' }}
      />

      <div className="relative mx-auto max-w-5xl px-6 py-28 text-center sm:py-36">
        {/* Animated pill badge */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-nimbus-500/30 bg-nimbus-500/10 px-4 py-1.5 text-sm font-medium text-nimbus-300"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nimbus-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-nimbus-500" />
          </span>
          New drops every week
        </motion.div>

        {/* Giant heading */}
        <motion.h1
          custom={0.1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-5xl font-bold leading-[1.08] tracking-tight text-text-primary sm:text-7xl lg:text-8xl"
        >
          Catch &apos;em all on
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #fb923c 0%, #a3e635 100%)',
            }}
          >
            Card Nimbus
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          custom={0.22}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto mt-6 max-w-xl text-lg text-text-secondary sm:text-xl"
        >
          The boldest Pokemon card marketplace in the hobby. Packs, boxes, slabs,
          and singles — all in one place.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={0.34}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link href="/shop">
            <Button size="lg" variant="primary" className="min-w-[140px] text-base font-bold shadow-xl shadow-nimbus-500/30">
              Shop Now
            </Button>
          </Link>
          <Link href="/shop?coupon=WELCOME5">
            <Button size="lg" variant="secondary" className="min-w-[140px] text-base">
              Get 5% Off
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
