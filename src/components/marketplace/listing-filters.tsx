'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'SINGLE', label: 'Singles' },
  { value: 'PACK', label: 'Packs' },
  { value: 'BOOSTER_BOX', label: 'Boxes' },
  { value: 'SLAB', label: 'Slabs' },
]

const CONDITIONS = [
  { value: '', label: 'Any' },
  { value: 'NM', label: 'NM' },
  { value: 'LP', label: 'LP' },
  { value: 'MP', label: 'MP' },
  { value: 'HP', label: 'HP' },
]

const GRADING_COMPANIES = [
  { value: '', label: 'Any' },
  { value: 'PSA', label: 'PSA' },
  { value: 'BGS', label: 'BGS' },
  { value: 'CGC', label: 'CGC' },
  { value: 'ACE', label: 'ACE' },
  { value: 'TAG', label: 'TAG' },
]

const GRADES = (() => {
  const items: { value: string; label: string }[] = [{ value: '', label: 'Any' }]
  for (let g = 10; g >= 1; g -= 0.5) {
    items.push({ value: g.toFixed(1), label: g.toFixed(1) + '+' })
  }
  return items
})()

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'deal_score', label: 'Best Deal' },
]

// ─── Pill ─────────────────────────────────────────────────────────────────────

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all duration-150 active:scale-95 ${
        active
          ? 'bg-nimbus-500 text-white shadow-md shadow-nimbus-500/25'
          : 'bg-white text-text-secondary border border-surface-border hover:border-nimbus-300 hover:text-text-primary'
      }`}
    >
      {children}
    </button>
  )
}

// ─── Dropdown Pill ────────────────────────────────────────────────────────────

function DropdownPill({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)
  const isActive = !!value

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all duration-150 active:scale-95 ${
          isActive
            ? 'bg-nimbus-500 text-white shadow-md shadow-nimbus-500/25'
            : 'bg-white text-text-secondary border border-surface-border hover:border-nimbus-300 hover:text-text-primary'
        }`}
      >
        {label}{selected && value ? `: ${selected.label}` : ''}
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1.5 w-44 rounded-xl border border-surface-border bg-white p-1 shadow-xl">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  value === opt.value
                    ? 'bg-nimbus-50 font-bold text-nimbus-600'
                    : 'text-text-primary hover:bg-surface-overlay'
                }`}
              >
                {opt.label}
                {value === opt.value && (
                  <svg className="h-4 w-4 text-nimbus-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Filters ──────────────────────────────────────────────────────────────────

interface ListingFiltersProps {
  category?: string
  condition?: string
  sortBy?: string
  minPrice?: string
  maxPrice?: string
  minGrade?: string
  gradingCompany?: string
}

export function ListingFilters({
  category = '',
  condition = '',
  sortBy = 'newest',
  minPrice = '',
  maxPrice = '',
  minGrade = '',
  gradingCompany = '',
}: ListingFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [priceOpen, setPriceOpen] = useState(false)
  const [localMin, setLocalMin] = useState(minPrice)
  const [localMax, setLocalMax] = useState(maxPrice)

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  function updateCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set('category', value)
    else params.delete('category')
    // Clear inapplicable filters
    if (value === 'SLAB') {
      params.delete('condition')
    } else {
      params.delete('minGrade')
      params.delete('gradingCompany')
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  function applyPrice() {
    const params = new URLSearchParams(searchParams.toString())
    if (localMin) params.set('minPrice', localMin)
    else params.delete('minPrice')
    if (localMax) params.set('maxPrice', localMax)
    else params.delete('maxPrice')
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
    setPriceOpen(false)
  }

  const isSlab = category === 'SLAB'
  const hasPrice = !!minPrice || !!maxPrice
  const activeCount = [
    !!category,
    isSlab ? !!gradingCompany : !!condition,
    isSlab ? !!minGrade : false,
    hasPrice,
    sortBy !== 'newest',
  ].filter(Boolean).length

  return (
    <div className="space-y-3">
      {/* Category pills — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <Pill
            key={cat.value}
            active={category === cat.value}
            onClick={() => updateCategory(cat.value)}
          >
            {cat.label}
          </Pill>
        ))}
      </div>

      {/* Second row: attribute filters + sort + price */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Condition (non-slab) or grading (slab) */}
        {isSlab ? (
          <>
            <DropdownPill
              label="Company"
              value={gradingCompany}
              options={GRADING_COMPANIES}
              onChange={(v) => updateParam('gradingCompany', v)}
            />
            <DropdownPill
              label="Grade"
              value={minGrade}
              options={GRADES}
              onChange={(v) => updateParam('minGrade', v)}
            />
          </>
        ) : (
          <div className="flex gap-1.5">
            {CONDITIONS.map((c) => (
              <Pill
                key={c.value}
                active={condition === c.value}
                onClick={() => updateParam('condition', c.value)}
              >
                {c.label}
              </Pill>
            ))}
          </div>
        )}

        {/* Sort */}
        <DropdownPill
          label="Sort"
          value={sortBy === 'newest' ? '' : sortBy}
          options={SORTS.map((s) => ({
            value: s.value === 'newest' ? '' : s.value,
            label: s.label,
          }))}
          onChange={(v) => updateParam('sortBy', v || 'newest')}
        />

        {/* Price */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setPriceOpen(!priceOpen)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all duration-150 active:scale-95 ${
              hasPrice
                ? 'bg-nimbus-500 text-white shadow-md shadow-nimbus-500/25'
                : 'bg-white text-text-secondary border border-surface-border hover:border-nimbus-300 hover:text-text-primary'
            }`}
          >
            {hasPrice
              ? `$${minPrice || '0'} – $${maxPrice || '∞'}`
              : 'Price'}
            <svg
              className={`h-3.5 w-3.5 transition-transform ${priceOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {priceOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setPriceOpen(false)} />
              <div className="absolute left-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-surface-border bg-white p-3 shadow-xl">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Price range</p>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localMin}
                    onChange={(e) => setLocalMin(e.target.value)}
                    className="w-full rounded-lg border border-surface-border bg-surface-overlay px-3 py-2 text-sm focus:border-nimbus-500 focus:ring-2 focus:ring-nimbus-500/20 outline-none"
                    min={0}
                  />
                  <span className="text-text-muted shrink-0">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localMax}
                    onChange={(e) => setLocalMax(e.target.value)}
                    className="w-full rounded-lg border border-surface-border bg-surface-overlay px-3 py-2 text-sm focus:border-nimbus-500 focus:ring-2 focus:ring-nimbus-500/20 outline-none"
                    min={0}
                  />
                </div>
                <button
                  type="button"
                  onClick={applyPrice}
                  className="w-full rounded-lg bg-nimbus-500 px-3 py-2 text-xs font-bold text-white hover:bg-nimbus-600 transition-colors"
                >
                  Apply
                </button>
              </div>
            </>
          )}
        </div>

        {/* Active filter count */}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => router.push(`${pathname}?view=all`)}
            className="ml-1 text-xs font-bold text-nimbus-600 hover:text-nimbus-700 transition-colors"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>
    </div>
  )
}
