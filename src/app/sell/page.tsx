'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { toast } from '@/components/ui/toast'
import { formatCurrency } from '@/lib/utils'
import { CountrySelector } from '@/components/country-selector'
import { CountrySelect } from '@/components/country-select'
import { BackHeader } from '@/components/ui/back-header'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardResult {
  id: string
  name: string
  setName: string
  number?: string | null
  tcgPriceNM?: number | null
  tcgPriceLP?: number | null
  tcgPriceMP?: number | null
  tcgPriceHP?: number | null
}

type Condition = 'NM' | 'LP' | 'MP' | 'HP'
type Category = 'PACK' | 'BOOSTER_BOX' | 'SLAB' | 'SINGLE'

// ─── Options ──────────────────────────────────────────────────────────────────

const conditionOptions = [
  { value: '', label: 'Select condition' },
  { value: 'NM', label: 'Near Mint (NM)' },
  { value: 'LP', label: 'Lightly Played (LP)' },
  { value: 'MP', label: 'Moderately Played (MP)' },
  { value: 'HP', label: 'Heavily Played (HP)' },
]

const GRADING_COMPANIES = ['PSA', 'BGS', 'ACE', 'CGC', 'TAG'] as const
type GradingCompany = typeof GRADING_COMPANIES[number]

const gradingCompanyOptions = [
  { value: '', label: 'Select company' },
  ...GRADING_COMPANIES.map((c) => ({ value: c, label: c })),
]

const gradeOptions = (() => {
  const opts: { value: string; label: string }[] = [
    { value: '', label: 'Select grade' },
  ]
  // 10, 9.5, 9, 8.5, ... 1.5, 1
  for (let g = 10; g >= 1; g -= 0.5) {
    opts.push({ value: g.toFixed(1), label: g.toFixed(1) })
  }
  return opts
})()

const categoryOptions = [
  { value: '', label: 'Select category' },
  { value: 'SINGLE', label: 'Single' },
  { value: 'PACK', label: 'Pack' },
  { value: 'BOOSTER_BOX', label: 'Booster Box' },
  { value: 'SLAB', label: 'Slab' },
]

// ─── Card Search Autocomplete ─────────────────────────────────────────────────

function CardSearchInput({
  selected,
  onSelect,
}: {
  selected: CardResult | null
  onSelect: (card: CardResult | null) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CardResult[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (selected) onSelect(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim()) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}&limit=8`)
        const data = await res.json()
        setResults(data.results ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
  }, [selected, onSelect])

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-nimbus-400 bg-nimbus-50/50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">{selected.name}</p>
          <p className="text-xs text-text-muted">{selected.setName}</p>
        </div>
        <button
          onClick={() => { onSelect(null); setQuery('') }}
          className="text-xs text-text-muted hover:text-red-400 transition-colors"
        >
          Change
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <Input
        placeholder="Search for a card (e.g. Charizard Base Set)..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {loading && (
        <div className="absolute right-3 top-2.5">
          <div className="w-4 h-4 border-2 border-nimbus-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-surface-raised border border-surface-border rounded-xl shadow-2xl z-10 overflow-hidden">
          {results.map((card) => (
            <button
              key={card.id}
              onClick={() => { onSelect(card); setResults([]) }}
              className="w-full text-left px-4 py-3 hover:bg-surface-overlay transition-colors border-b border-surface-border last:border-0"
            >
              <p className="text-sm font-medium text-text-primary">{card.name}</p>
              <p className="text-xs text-text-muted">{card.setName}{card.number ? ` #${card.number}` : ''}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Photo Upload ─────────────────────────────────────────────────────────────

function PhotoUpload({
  images,
  onImagesChange,
}: {
  images: string[]
  onImagesChange: (imgs: string[]) => void
}) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        const form = new FormData()
        form.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: form })
        if (!res.ok) throw new Error('Upload failed')
        const data = await res.json()
        uploaded.push(data.url)
      }
      onImagesChange([...images, ...uploaded])
    } catch {
      toast('Upload failed. Please try again.', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="border-2 border-dashed border-surface-border rounded-xl p-6 text-center cursor-pointer hover:border-nimbus-600 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          if (e.dataTransfer.files.length) void uploadFiles(e.dataTransfer.files)
        }}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-text-muted">
            <div className="w-4 h-4 border-2 border-nimbus-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Uploading...</span>
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            Drop photos here or{' '}
            <span className="text-nimbus-600 font-medium">browse</span>
          </p>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files) void uploadFiles(e.target.files) }}
      />
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((url, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-surface-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => onImagesChange(images.filter((_, j) => j !== i))}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-600 text-white text-xs flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreateListingPage() {
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/sell')
    }
  }, [status, router])

  const [card, setCard] = useState<CardResult | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState<Condition | ''>('')
  const [category, setCategory] = useState<Category | ''>('')
  const [grade, setGrade] = useState<string>('')
  const [gradingCompany, setGradingCompany] = useState<GradingCompany | ''>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [shipsToCountries, setShipsToCountries] = useState<string[]>([])
  const [userCountry, setUserCountry] = useState<string>('')
  const [countryLoaded, setCountryLoaded] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Load the user's current country from profile
  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/account/profile')
      .then((r) => r.json())
      .then((data) => {
        setUserCountry(data.country ?? '')
        setCountryLoaded(true)
      })
      .catch(() => setCountryLoaded(true))
  }, [status])

  // Derive suggested price from card + condition
  const suggestedPrice = (() => {
    if (!card) return null
    if (condition === 'NM') return card.tcgPriceNM ?? null
    if (condition === 'LP') return card.tcgPriceLP ?? null
    if (condition === 'MP') return card.tcgPriceMP ?? null
    if (condition === 'HP') return card.tcgPriceHP ?? null
    return null
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return toast('Please enter a title.', 'error')
    if (!category) return toast('Please select a category.', 'error')
    if (!price || parseFloat(price) <= 0) return toast('Please enter a valid price.', 'error')
    if (!userCountry) return toast('Please set your country in your account first.', 'error')
    if (shipsToCountries.length === 0) return toast('Select at least one country you ship to.', 'error')
    if (category === 'SLAB') {
      if (!gradingCompany) return toast('Please select a grading company.', 'error')
      if (!grade) return toast('Please select a grade.', 'error')
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: card?.id || undefined,
          title: title.trim(),
          description: description.trim() || undefined,
          images,
          price: parseFloat(price),
          condition: category === 'SLAB' ? undefined : condition || undefined,
          category,
          shipsToCountries,
          grade: category === 'SLAB' && grade ? parseFloat(grade) : undefined,
          gradingCompany: category === 'SLAB' ? gradingCompany || undefined : undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to create listing')
      }
      const data = await res.json()
      toast('Listing created! Submit it for review when ready.', 'success')
      router.push(`/sell/listings`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to create listing', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading / unauthenticated state
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <main className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-text-muted text-sm">
          {status === 'loading' ? 'Loading...' : 'Redirecting to sign in...'}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <BackHeader title="Create Listing" href="/marketplace" />
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary hidden md:block">Create Listing</h1>
          <p className="mt-1 text-sm text-text-secondary">
            List a card or item for sale in the marketplace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card Search */}
          <div className="rounded-2xl border border-surface-border bg-surface-raised p-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary mb-1">Link a Card (Optional)</h2>
              <p className="text-xs text-text-muted">
                Linking a card enables automatic deal score and TCGPlayer price data.
              </p>
            </div>
            <CardSearchInput selected={card} onSelect={setCard} />
          </div>

          {/* Core Details */}
          <div className="rounded-2xl border border-surface-border bg-surface-raised p-6 space-y-4">
            <h2 className="text-base font-semibold text-text-primary">Listing Details</h2>

            <Input
              label="Title"
              placeholder="e.g. Charizard Holo Base Set PSA 10"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                options={categoryOptions}
                value={category}
                onChange={(e) => setCategory(e.target.value as Category | '')}
              />
              {category === 'SLAB' ? (
                <Select
                  label="Grading Company"
                  options={gradingCompanyOptions}
                  value={gradingCompany}
                  onChange={(e) => setGradingCompany(e.target.value as GradingCompany | '')}
                />
              ) : (
                <Select
                  label="Condition"
                  options={conditionOptions}
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as Condition | '')}
                />
              )}
            </div>

            {category === 'SLAB' && (
              <Select
                label="Grade"
                options={gradeOptions}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              />
            )}

            <div>
              <Input
                label="Price ($)"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              {suggestedPrice && (
                <p className="mt-1.5 text-xs text-nimbus-600">
                  Suggested price based on TCGPlayer data:{' '}
                  <button
                    type="button"
                    onClick={() => setPrice(String(suggestedPrice))}
                    className="font-semibold underline hover:text-nimbus-700 transition-colors"
                  >
                    {formatCurrency(suggestedPrice)}
                  </button>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the item, its condition details, included accessories, etc."
                rows={4}
                className="w-full bg-surface-raised border border-surface-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-nimbus-500 focus:ring-2 focus:ring-nimbus-500/20 outline-none resize-none"
              />
            </div>
          </div>

          {/* Photos */}
          <div className="rounded-2xl border border-surface-border bg-surface-raised p-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary mb-1">Photos</h2>
              <p className="text-xs text-text-muted">Add photos to attract buyers.</p>
            </div>
            <PhotoUpload images={images} onImagesChange={setImages} />
          </div>

          {/* Shipping */}
          <div className="rounded-2xl border border-surface-border bg-surface-raised p-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary mb-1">Shipping</h2>
              <p className="text-xs text-text-muted">
                Tell buyers where you can ship this item.
              </p>
            </div>

            {/* Seller country */}
            {countryLoaded && !userCountry && (
              <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4">
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-2">
                  Set your country first
                </p>
                <p className="text-sm text-amber-900 mb-3">
                  We need to know where you&apos;re shipping from before you can list items.
                </p>
                <CountrySelect
                  label="Your country"
                  value={userCountry}
                  onChange={async (code) => {
                    try {
                      const res = await fetch('/api/account/profile', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ country: code }),
                      })
                      if (res.ok) {
                        setUserCountry(code)
                        toast('Country saved.', 'success')
                      }
                    } catch {
                      toast('Failed to save country.', 'error')
                    }
                  }}
                  required
                />
              </div>
            )}

            {userCountry && (
              <p className="text-xs text-text-muted">
                Shipping from <span className="font-semibold text-text-primary">{userCountry}</span>.{' '}
                <a href="/account" className="text-nimbus-600 hover:text-nimbus-700 underline">
                  Change
                </a>
              </p>
            )}

            {/* Ships to countries */}
            <div>
              <label className="text-sm font-medium text-text-secondary block mb-2">
                Ships to <span className="text-red-500">*</span>
              </label>
              <CountrySelector
                selected={shipsToCountries}
                onChange={setShipsToCountries}
              />
            </div>
          </div>

          {/* Commission + payout preview */}
          {(() => {
            const priceNum = parseFloat(price)
            if (!priceNum || priceNum <= 0) return null
            const commissionRate = 0.10
            const commission = Math.round(priceNum * commissionRate * 100) / 100
            const payout = Math.round((priceNum - commission) * 100) / 100
            return (
              <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider">Payout Breakdown</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Sale price</span>
                    <span className="font-semibold text-text-primary">{formatCurrency(priceNum)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Marketplace fee (10%)</span>
                    <span className="font-semibold text-red-600">−{formatCurrency(commission)}</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-500/30 flex items-center justify-between">
                    <span className="font-bold text-text-primary">You&apos;ll receive</span>
                    <span className="font-black text-lg text-emerald-700">{formatCurrency(payout)}</span>
                  </div>
                </div>
              </div>
            )
          })()}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={submitting}
            className="w-full"
          >
            Create Listing
          </Button>
        </form>
      </div>
    </main>
  )
}
