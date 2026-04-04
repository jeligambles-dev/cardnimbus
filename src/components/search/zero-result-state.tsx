'use client'

import { useState } from 'react'
import Link from 'next/link'

const RELATED_CATEGORIES = [
  { label: 'Singles', href: '/shop?category=SINGLE' },
  { label: 'Booster Packs', href: '/shop?category=BOOSTER_PACK' },
  { label: 'Booster Boxes', href: '/shop?category=BOOSTER_BOX' },
  { label: 'Slabs', href: '/shop?category=SLAB' },
  { label: 'Bundles', href: '/shop?category=BUNDLE' },
]

interface ZeroResultStateProps {
  query: string
}

export function ZeroResultState({ query }: ZeroResultStateProps) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSaveSearch = async () => {
    if (saved || saving) return
    setSaving(true)
    try {
      const res = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      if (res.ok || res.status === 201) {
        setSaved(true)
      }
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-surface-overlay border border-surface-border flex items-center justify-center">
        <svg
          className="w-8 h-8 text-text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {/* Message */}
      <div>
        <p className="text-text-primary font-semibold text-xl">No results found</p>
        <p className="text-text-secondary text-sm mt-2 max-w-sm">
          We couldn&apos;t find anything matching{' '}
          <span className="text-text-primary font-medium">&ldquo;{query}&rdquo;</span>.
        </p>
        <p className="text-text-muted text-sm mt-1">
          Try different keywords, check your spelling, or browse a category below.
        </p>
      </div>

      {/* Related categories */}
      <div>
        <p className="text-text-secondary text-xs uppercase tracking-widest font-semibold mb-3">
          Browse by Category
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {RELATED_CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-surface-border bg-surface-overlay hover:bg-surface-raised hover:border-nimbus-600 text-text-secondary hover:text-text-primary text-sm transition-colors"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Action row */}
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-nimbus-500 hover:bg-nimbus-400 text-white font-semibold text-sm transition-colors"
        >
          Browse All Products
        </Link>
        <Link
          href={`/sell-your-cards?card=${encodeURIComponent(query)}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-overlay hover:bg-surface-raised border border-surface-border text-text-secondary hover:text-text-primary font-medium text-sm transition-colors"
        >
          Sell this card instead
        </Link>
      </div>

      {/* Save search */}
      <button
        onClick={handleSaveSearch}
        disabled={saving || saved}
        className="inline-flex items-center gap-1.5 text-sm text-nimbus-600 hover:text-nimbus-700 disabled:opacity-60 transition-colors"
      >
        {saved ? (
          <>
            <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-emerald-400">Search saved</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {saving ? 'Saving...' : 'Save this search'}
          </>
        )}
      </button>
    </div>
  )
}
