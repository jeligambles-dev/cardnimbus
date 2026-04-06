"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { SearchBar } from "@/components/search/search-bar";
import { NotificationBell } from "./notification-bell";
import { StoreRating } from "./store-rating";

const MARKETPLACE_LINKS = [
  { label: "Home", href: "/marketplace" },
  { label: "Browse", href: "/marketplace?view=all" },
  { label: "Newest", href: "/marketplace?view=all&sortBy=newest" },
  { label: "Packs", href: "/marketplace?category=PACK" },
  { label: "Boxes", href: "/marketplace?category=BOOSTER_BOX" },
  { label: "Slabs", href: "/marketplace?category=SLAB" },
  { label: "Singles", href: "/marketplace?category=SINGLE" },
];

function MarketplaceAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-20 animate-pulse rounded-xl bg-surface-overlay" />;
  }

  if (session?.user) {
    return (
      <div className="group relative">
        <Link
          href="/marketplace/account"
          aria-label="Account"
          className="flex h-9 items-center gap-2 rounded-xl bg-black px-2 sm:px-3 text-sm font-medium text-white hover:bg-black/80"
        >
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt="" className="h-6 w-6 rounded-full object-cover" />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-nimbus-500 text-[10px] font-bold text-white">
              {(session.user.name ?? session.user.email ?? "U").charAt(0).toUpperCase()}
            </span>
          )}
          <span className="hidden max-w-[80px] truncate sm:block">
            {session.user.name?.split(" ")[0] ?? "Account"}
          </span>
        </Link>
        <div className="invisible absolute right-0 top-full z-[60] w-64 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
          <div className="rounded-xl border border-surface-border bg-white p-1.5 shadow-xl">
            {/* Buyer section */}
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Marketplace
            </div>
            <Link href="/account/likes" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-overlay">
              <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
              Liked Listings
            </Link>
            <Link href="/account/following" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-overlay">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Followed Sellers
            </Link>
            <Link href="/account/messages" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-overlay">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Messages
            </Link>
            <Link href="/account/offers" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-overlay">
              <span className="text-base">🤝</span>
              My Offers
            </Link>
            <Link href="/account/orders?type=MARKETPLACE" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-overlay">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              My Purchases
            </Link>

            {/* Seller section */}
            <div className="my-1 border-t border-surface-border" />
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Selling
            </div>
            <Link href="/sell" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-overlay">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              List an Item
            </Link>
            <Link href="/sell/offers" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-overlay">
              <span className="text-base">📩</span>
              Incoming Offers
            </Link>
            <Link href="/sell/listings" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-overlay">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              My Listings
            </Link>
            <Link href="/sell/orders" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-overlay">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Sales & Payouts
            </Link>

            {/* Sign out */}
            <div className="my-1 border-t border-surface-border" />
            <button
              onClick={() => signOut({ callbackUrl: "/marketplace" })}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="h-9 px-5 rounded-xl text-sm font-semibold text-white bg-black shadow-[0_4px_12px_-2px_rgba(0,0,0,0.4)] hover:bg-black/80 hover:-translate-y-px active:translate-y-0 transition-all duration-150"
    >
      Sign In
    </button>
  );
}

export function MarketplaceNav() {
  const pathname = usePathname();
  // Only the store homepage ("/") gets the big nav — marketplace always uses compact
  const isHome = false;
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/marketplace") return pathname === "/marketplace";
    return pathname.startsWith(href.split("?")[0]);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.04),0_2px_16px_-8px_rgba(0,0,0,0.08)]">
      {/* Top row: logo + site link + auth */}
      <div className="relative border-b-2 border-nimbus-700 bg-gradient-to-b from-nimbus-500 via-nimbus-500 to-nimbus-600">
        {/* Subtle decorative glow — clipped to not overflow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden"
        >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -left-20 h-48 w-48 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, #ffffff, transparent)" }}
        />
        </div>
        <nav className={`relative mx-auto flex max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8 ${isHome ? 'py-2' : 'py-1'}`}>
          <Link
            href="/marketplace"
            className="group relative flex shrink-0 items-center transition-transform hover:scale-[1.02]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 blur-xl opacity-30 group-hover:opacity-50 transition-opacity"
              style={{
                background:
                  "radial-gradient(ellipse 80% 80% at 50% 50%, #ff0000, transparent)",
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              src="/logo.png"
              alt="Card Nimbus"
              className={`w-auto object-contain drop-shadow-md transition-all duration-200 ${isHome ? 'h-32 sm:h-40 lg:h-48' : 'h-11 sm:h-20 lg:h-24'}`}
            />
            {isHome ? (
              <div className="ml-3 flex flex-col items-start">
                <span className="rounded-md bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-nimbus-600 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.25)]">
                  Marketplace
                </span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/70">
                  P2P · Buy · Sell
                </span>
              </div>
            ) : (
              <span className="ml-2 hidden sm:inline-block rounded-md bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] text-nimbus-600 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.25)]">
                Marketplace
              </span>
            )}
          </Link>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
            <Link
              href="/"
              aria-label="Back to store"
              className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl bg-black px-3.5 text-xs font-semibold text-white transition-all duration-150 hover:bg-black/80 hover:-translate-y-px"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to store
            </Link>
            <Link
              href="/sell"
              aria-label="Sell"
              className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-sm font-bold text-white bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_4px_12px_-2px_rgba(0,0,0,0.25)] ring-1 ring-inset ring-white/10 hover:from-emerald-400 hover:to-emerald-500 hover:-translate-y-px active:translate-y-0 transition-all duration-150"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Sell
            </Link>
            <NotificationBell />
            <MarketplaceAuth />
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
      </div>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-gradient-to-b from-nimbus-600 to-nimbus-700 border-b-2 border-nimbus-800">
          <ul className="flex flex-col gap-0.5 px-3 py-3">
            {MARKETPLACE_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-4 py-3 text-sm font-bold ${
                    isActive(href)
                      ? "bg-white text-nimbus-600"
                      : "text-white hover:bg-white/15"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="mt-1 pt-1 border-t border-white/20">
              <Link
                href="/sell"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-b from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-bold text-white hover:from-emerald-400 hover:to-emerald-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Sell on Marketplace
              </Link>
            </li>
            <li>
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/20"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to store
              </Link>
            </li>
          </ul>
        </div>
      )}

      {/* Category tabs row — on red, hidden on mobile (links are in drawer) */}
      <nav className="hidden md:block relative bg-gradient-to-b from-nimbus-500 to-nimbus-600 border-b-2 border-nimbus-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ul className="flex flex-wrap items-center gap-0.5 py-2 sm:flex-nowrap sm:overflow-x-auto sm:scrollbar-hide">
            {MARKETPLACE_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-150 sm:px-4 sm:py-2 sm:text-sm ${
                    isActive(href)
                      ? "bg-white text-nimbus-600 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.25)]"
                      : "text-white/85 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Search row — black layer */}
      <div className={`bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8 ${isHome ? 'py-3' : 'py-2'}`}>
        <div className="mx-auto max-w-3xl">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
