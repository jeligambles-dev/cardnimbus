'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/stores/cart-store'
import { SearchBar } from '@/components/search/search-bar'
import { NotificationBell } from './notification-bell'
import { StoreRating } from './store-rating'

const NAV_LINKS = [
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Raffles', href: '/raffles' },
  { label: 'Mystery', href: '/mystery' },
  { label: 'Packs', href: '/shop?category=PACK' },
  { label: 'Boxes', href: '/shop?category=BOX' },
  { label: 'Slabs', href: '/shop?category=SLAB' },
  { label: 'Singles', href: '/shop?category=SINGLE' },
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
      className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white transition-colors hover:bg-black/80"
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
      <div className="group relative">
        <Link
          href="/account"
          aria-label="Account"
          className="flex h-9 items-center gap-2 rounded-xl bg-black px-2 sm:px-3 text-sm font-bold text-white transition-colors hover:bg-black/80"
        >
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name ?? 'Account'}
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-nimbus-500 text-[10px] font-bold text-white">
              {(session.user.name ?? session.user.email ?? 'U').charAt(0).toUpperCase()}
            </span>
          )}
          <span className="hidden max-w-[80px] truncate sm:block">
            {session.user.name?.split(' ')[0] ?? 'Account'}
          </span>
        </Link>

        {/* Hover dropdown */}
        <div className="invisible absolute right-0 top-full z-[60] w-48 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
          <div className="rounded-xl border border-surface-border bg-white p-1.5 shadow-xl">
            <div className="px-3 py-2 border-b border-surface-border mb-1">
              <p className="text-sm font-semibold text-text-primary truncate">
                {session.user.name ?? 'Account'}
              </p>
              <p className="text-xs text-text-muted truncate">
                {session.user.email}
              </p>
            </div>
            <Link
              href="/account"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-overlay"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Account
            </Link>
            <Link
              href="/account/orders"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-overlay"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Orders
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn()}
      className="h-9 px-5 rounded-xl text-sm font-semibold text-white bg-black shadow-[0_4px_12px_-2px_rgba(0,0,0,0.4)] hover:bg-black/80 hover:-translate-y-px active:translate-y-0 transition-all duration-150"
    >
      Sign In
    </button>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-surface/95 backdrop-blur-md">
      {/* Nav row: logo + links + actions — RED */}
      <nav className={`relative border-b-2 border-nimbus-700 bg-gradient-to-b from-nimbus-500 via-nimbus-500 to-nimbus-600 mx-auto flex max-w-none items-center gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8 ${isHome ? 'py-2' : 'py-1'}`}>
        {/* Prominent logo */}
        <Link
          href="/"
          className="group relative flex shrink-0 items-center transition-transform duration-200 hover:scale-105"
        >
          {/* White glow behind logo */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 blur-xl opacity-30 transition-opacity duration-300 group-hover:opacity-50"
            style={{
              background:
                'radial-gradient(ellipse 80% 80% at 50% 50%, #ffffff, transparent)',
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            src="/logo.png"
            alt="Card Nimbus"
            className={`w-auto object-contain drop-shadow-md transition-all duration-200 ${isHome ? 'h-32 sm:h-40 lg:h-48' : 'h-11 sm:h-20 lg:h-24'}`}
          />
          <div className="hidden sm:block ml-1 mt-auto mb-1">
            <StoreRating />
          </div>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ label, href }) => {
            if (label === 'Sell Cards') {
              return (
                <li key={label}>
                  <Link
                    href={href}
                    className="ml-2 inline-flex h-9 items-center rounded-xl bg-white px-4 text-sm font-bold text-nimbus-600 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.25)] hover:-translate-y-px active:translate-y-0 transition-all duration-150"
                  >
                    {label}
                  </Link>
                </li>
              )
            }
            if (label === 'Marketplace') {
              return (
                <li key={label}>
                  <Link
                    href={href}
                    className="inline-flex h-9 items-center rounded-xl px-4 text-sm font-semibold text-white bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_4px_12px_-2px_rgba(16,185,129,0.35)] ring-1 ring-inset ring-white/10 hover:from-emerald-400 hover:to-emerald-500 hover:-translate-y-px active:translate-y-0 transition-all duration-150"
                  >
                    {label}
                  </Link>
                </li>
              )
            }
            return (
              <li key={label}>
                <Link
                  href={href}
                  className="rounded-lg px-3 py-1.5 text-sm font-bold text-white/85 transition-colors hover:bg-white/15 hover:text-white"
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <CartIcon />
          <NotificationBell />
          <AuthButton />
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white transition-colors hover:bg-black/80"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-gradient-to-b from-nimbus-600 to-nimbus-700 border-b-2 border-nimbus-800">
          <ul className="flex flex-col gap-0.5 px-3 py-3">
            {NAV_LINKS.map(({ label, href }) => {
              if (label === 'Marketplace') {
                return (
                  <li key={label}>
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg bg-gradient-to-b from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-bold text-white hover:from-emerald-400 hover:to-emerald-500"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {label}
                    </Link>
                  </li>
                )
              }
              if (label === 'Sell Cards') {
                return (
                  <li key={label}>
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg bg-white px-4 py-3 text-sm font-bold text-nimbus-600 hover:bg-white/90"
                    >
                      {label}
                    </Link>
                  </li>
                )
              }
              return (
                <li key={label}>
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-4 py-3 text-sm font-bold text-white hover:bg-white/15"
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Search row — black layer */}
      <div className={`bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8 ${isHome ? 'py-3' : 'py-2'}`}>
        <div className="mx-auto max-w-3xl">
          <SearchBar />
        </div>
      </div>
    </header>
  )
}
