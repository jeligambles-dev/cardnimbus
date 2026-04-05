"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { SearchBar } from "@/components/search/search-bar";

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
          href="/account"
          className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-overlay px-3 py-1.5 text-sm font-medium text-text-primary group-hover:border-nimbus-500/50"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-nimbus-500 text-[10px] font-bold text-white">
            {(session.user.name ?? session.user.email ?? "U").charAt(0).toUpperCase()}
          </span>
          <span className="hidden max-w-[80px] truncate sm:block">
            {session.user.name?.split(" ")[0] ?? "Account"}
          </span>
        </Link>
        <div className="invisible absolute right-0 top-full z-50 w-64 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
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
      className="h-9 px-5 rounded-xl text-sm font-semibold text-white bg-gradient-to-b from-nimbus-500 to-nimbus-600 shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_4px_12px_-2px_rgba(255,0,0,0.35)] ring-1 ring-inset ring-white/10 hover:from-nimbus-400 hover:to-nimbus-500 hover:-translate-y-px active:translate-y-0 transition-all duration-150"
    >
      Sign In
    </button>
  );
}

export function MarketplaceNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/marketplace") return pathname === "/marketplace";
    return pathname.startsWith(href.split("?")[0]);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.04),0_2px_16px_-8px_rgba(0,0,0,0.08)]">
      {/* Top row: logo + site link + auth */}
      <div className="relative overflow-hidden border-b border-surface-border bg-gradient-to-r from-white via-emerald-50/40 to-white">
        {/* Subtle decorative glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -left-20 h-48 w-48 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, #10b981, transparent)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 right-20 h-48 w-48 rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle, #ff0000, transparent)" }}
        />
        <nav className="relative mx-auto flex max-w-7xl items-center gap-4 px-4 py-2 sm:px-6 lg:px-8">
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
              className="h-24 w-auto object-contain drop-shadow-md sm:h-32 lg:h-40"
            />
            <div className="ml-3 flex flex-col items-start">
              <span className="rounded-md bg-gradient-to-r from-emerald-500 to-emerald-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-white shadow-[0_2px_8px_-2px_rgba(16,185,129,0.5)] ring-1 ring-inset ring-white/20">
                Marketplace
              </span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">
                P2P · Buy · Sell
              </span>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-2.5">
            <Link
              href="/"
              className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl border border-surface-border bg-white/80 backdrop-blur px-3.5 text-xs font-semibold text-text-secondary transition-all duration-150 hover:border-nimbus-400 hover:bg-white hover:text-nimbus-600 hover:-translate-y-px"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to store
            </Link>
            <Link
              href="/sell"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-sm font-bold text-white bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_4px_12px_-2px_rgba(16,185,129,0.4)] ring-1 ring-inset ring-white/10 hover:from-emerald-400 hover:to-emerald-500 hover:-translate-y-px active:translate-y-0 transition-all duration-150"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Sell
            </Link>
            <MarketplaceAuth />
          </div>
        </nav>
      </div>

      {/* Category tabs row */}
      <nav className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center gap-0.5 overflow-x-auto py-2.5 scrollbar-hide">
          {MARKETPLACE_LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold transition-all duration-150 ${
                  isActive(href)
                    ? "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_2px_8px_-2px_rgba(16,185,129,0.4)] ring-1 ring-inset ring-white/10"
                    : "text-text-secondary hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Search row */}
      <div className="border-t border-surface-border bg-surface-raised/50 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
