"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { SearchBar } from "@/components/search/search-bar";

const MARKETPLACE_LINKS = [
  { label: "Browse", href: "/marketplace" },
  { label: "Deals", href: "/marketplace?sort=deals" },
  { label: "Newest", href: "/marketplace?sort=newest" },
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
        <div className="invisible absolute right-0 top-full z-50 w-56 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
          <div className="rounded-xl border border-surface-border bg-white p-1.5 shadow-xl">
            <Link href="/account/likes" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-overlay">
              Liked Items
            </Link>
            <Link href="/account/following" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-overlay">
              Following
            </Link>
            <Link href="/account/orders" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-overlay">
              My Orders
            </Link>
            <Link href="/account/messages" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-overlay">
              Messages
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/marketplace" })}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
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
      className="rounded-xl bg-nimbus-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-nimbus-500/25 hover:bg-nimbus-600"
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
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-surface/95 backdrop-blur-md">
      {/* Top row: logo + site link + auth */}
      <div className="border-b border-surface-border">
        <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2 sm:px-6 lg:px-8">
          <Link
            href="/marketplace"
            className="group relative flex shrink-0 items-center transition-transform hover:scale-105"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 blur-xl opacity-30"
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
              className="h-16 w-auto object-contain"
            />
            <span className="ml-3 rounded-lg bg-nimbus-500 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-white">
              Marketplace
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-surface-border bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:border-nimbus-400 hover:text-nimbus-600"
            >
              ← Back to store
            </Link>
            <Link
              href="/sell"
              className="rounded-xl bg-nimbus-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-nimbus-500/25 hover:bg-nimbus-600"
            >
              Sell on Marketplace
            </Link>
            <MarketplaceAuth />
          </div>
        </nav>
      </div>

      {/* Category tabs row */}
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          {MARKETPLACE_LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  isActive(href)
                    ? "bg-nimbus-500 text-white"
                    : "text-text-secondary hover:bg-surface-overlay hover:text-text-primary"
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
