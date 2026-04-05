'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signIn } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/stores/cart-store'
import { SearchBar } from '@/components/search/search-bar'

const NAV_LINKS = [
  { label: 'Shop', href: '/shop' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Raffles', href: '/raffles' },
  { label: 'Mystery', href: '/mystery' },
  { label: 'Packs', href: '/shop?category=PACK' },
  { label: 'Boxes', href: '/shop?category=BOX' },
  { label: 'Slabs', href: '/shop?category=SLAB' },
  { label: 'Singles', href: '/shop?category=SINGLE' },
  { label: 'Deals', href: '/deals' },
  { label: 'Sell Cards', href: '/sell-your-cards' },
]

function CartIcon() {
  const itemCount = useCartStore((state) => state.itemCount())
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const count = mounted ? itemCount : 0

  return (
    <Link
      href="/cart"
      aria-label={`Cart (${count} items)`}
      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-surface-border bg-surface-overlay text-text-secondary transition-colors hover:border-nimbus-500/50 hover:text-text-primary"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-nimbus-500 text-[10px] font-bold text-white"
          >
            {count > 99 ? '99+' : count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}

function AuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="h-9 w-20 animate-pulse rounded-xl bg-surface-overlay" />
    )
  }

  if (session?.user) {
    return (
      <Link
        href="/account"
        className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-overlay px-3 py-1.5 text-sm font-medium text-text-primary transition-colors hover:border-nimbus-500/50 hover:text-nimbus-500"
      >
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={session.user.name ?? 'Account'}
            className="h-5 w-5 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-nimbus-500 text-[10px] font-bold text-white">
            {(session.user.name ?? session.user.email ?? 'U').charAt(0).toUpperCase()}
          </span>
        )}
        <span className="hidden max-w-[80px] truncate sm:block">
          {session.user.name?.split(' ')[0] ?? 'Account'}
        </span>
      </Link>
    )
  }

  return (
    <button
      onClick={() => signIn()}
      className="rounded-xl bg-nimbus-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-nimbus-500/25 transition-colors hover:bg-nimbus-600"
    >
      Sign In
    </button>
  )
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-surface/95 backdrop-blur-md">
      {/* Nav row: logo + links + actions */}
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2 sm:px-6 lg:px-8">
        {/* Prominent logo */}
        <Link
          href="/"
          className="group relative flex shrink-0 items-center transition-transform duration-200 hover:scale-105"
        >
          {/* Red glow behind logo */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 blur-xl opacity-40 transition-opacity duration-300 group-hover:opacity-70"
            style={{
              background:
                'radial-gradient(ellipse 80% 80% at 50% 50%, #ff0000, transparent)',
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            src="/logo.png"
            alt="Card Nimbus"
            className="h-24 w-auto object-contain drop-shadow-md sm:h-32 lg:h-40"
          />
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-overlay hover:text-text-primary"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          <CartIcon />
          <AuthButton />
        </div>
      </nav>

      {/* Search row — full width below nav */}
      <div className="border-t border-surface-border bg-surface-raised/50 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <SearchBar />
        </div>
      </div>
    </header>
  )
}
