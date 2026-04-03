'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/components/ui/toast'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
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

const CONDITIONS: { value: Condition; label: string; description: string }[] = [
  { value: 'NM', label: 'Near Mint (NM)', description: 'No visible wear. Fresh from a pack.' },
  { value: 'LP', label: 'Lightly Played (LP)', description: 'Minor edge wear or very light scratches.' },
  { value: 'MP', label: 'Moderately Played (MP)', description: 'Noticeable wear, creases, or whitening on edges.' },
  { value: 'HP', label: 'Heavily Played (HP)', description: 'Significant damage — bends, creases, scuffs.' },
]

// ---------------------------------------------------------------------------
// Step components
// ---------------------------------------------------------------------------

// Step 1 — Search Card
function StepSearchCard({
  onSelect,
  selected,
}: {
  onSelect: (card: CardResult | null) => void
  selected: CardResult | null
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CardResult[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim()) { setResults([]); return }
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
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-text-primary">Search for Your Card</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Search our database to link accurate pricing data, or skip to continue with an unlisted card.
        </p>
      </div>

      <Input
        placeholder="e.g. Charizard Base Set, Black Lotus..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {loading && (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-nimbus-500 border-t-transparent" />
          Searching...
        </div>
      )}

      {results.length > 0 && !selected && (
        <ul className="divide-y divide-surface-border overflow-hidden rounded-xl border border-surface-border">
          {results.map((card) => (
            <li key={card.id}>
              <button
                type="button"
                onClick={() => { onSelect(card); setResults([]) }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-overlay"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-text-primary">{card.name}</p>
                  <p className="truncate text-xs text-text-muted">
                    {card.setName}{card.number ? ` · #${card.number}` : ''}
                  </p>
                </div>
                {card.tcgPriceNM != null && (
                  <span className="shrink-0 text-sm font-semibold text-nimbus-400">
                    {formatCurrency(card.tcgPriceNM)}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="flex items-center gap-3 rounded-xl border border-nimbus-500/40 bg-nimbus-500/5 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-nimbus-500/20 text-nimbus-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-text-primary">{selected.name}</p>
            <p className="text-xs text-text-muted">{selected.setName}</p>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            Change
          </button>
        </div>
      )}

      {!selected && (
        <p className="text-xs text-text-muted">
          Can&apos;t find your card?{' '}
          <button
            type="button"
            className="text-nimbus-400 hover:underline"
            onClick={() => onSelect({ id: '', name: 'Unlisted Card', setName: 'Not in database' })}
          >
            Skip and continue with an unlisted card
          </button>
        </p>
      )}
    </div>
  )
}

// Step 2 — Upload Photos
function StepUploadPhotos({
  images,
  onImagesChange,
}: {
  images: string[]
  onImagesChange: (imgs: string[]) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files)
    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of fileArr) {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-text-primary">Upload Photos</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Minimum 2 photos required. Include front, back, and any notable features or damage.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (e.dataTransfer.files.length) void uploadFiles(e.dataTransfer.files)
        }}
        className={[
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors cursor-pointer',
          dragOver
            ? 'border-nimbus-500 bg-nimbus-500/5'
            : 'border-surface-border hover:border-nimbus-500/50 hover:bg-surface-overlay',
        ].join(' ')}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-nimbus-500 border-t-transparent" />
        ) : (
          <>
            <svg className="mb-3 h-10 w-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm font-medium text-text-secondary">
              Drop photos here or <span className="text-nimbus-400">browse</span>
            </p>
            <p className="mt-1 text-xs text-text-muted">PNG, JPG, WEBP up to 10 MB each</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*"
          onChange={(e) => { if (e.target.files) void uploadFiles(e.target.files) }}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((url, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-surface-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onImagesChange(images.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < 2 && images.length > 0 && (
        <p className="text-xs text-amber-400">Please add at least {2 - images.length} more photo{2 - images.length > 1 ? 's' : ''}.</p>
      )}
    </div>
  )
}

// Step 3 — Select Condition
function StepSelectCondition({
  condition,
  onConditionChange,
  card,
}: {
  condition: Condition | null
  onConditionChange: (c: Condition) => void
  card: CardResult | null
}) {
  const priceMap: Record<Condition, number | null | undefined> = {
    NM: card?.tcgPriceNM,
    LP: card?.tcgPriceLP,
    MP: card?.tcgPriceMP,
    HP: card?.tcgPriceHP,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-text-primary">Select Condition</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Be honest — our team verifies condition when cards arrive. Accurate grading speeds up the process.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CONDITIONS.map(({ value, label, description }) => {
          const price = priceMap[value]
          const isSelected = condition === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => onConditionChange(value)}
              className={[
                'flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all',
                isSelected
                  ? 'border-nimbus-500 bg-nimbus-500/5 ring-1 ring-nimbus-500/30'
                  : 'border-surface-border hover:border-nimbus-500/40 hover:bg-surface-overlay',
              ].join(' ')}
            >
              <div className="flex w-full items-center justify-between">
                <span className={`font-semibold ${isSelected ? 'text-nimbus-400' : 'text-text-primary'}`}>{label}</span>
                {isSelected && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-nimbus-500">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="text-xs text-text-secondary">{description}</p>
              {price != null && (
                <p className="mt-1 text-xs font-medium text-nimbus-400">
                  Market: {formatCurrency(price)}
                </p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Step 4 — Review & Submit
function StepReview({
  card,
  images,
  condition,
  description,
  onDescriptionChange,
  onSubmit,
  submitting,
}: {
  card: CardResult | null
  images: string[]
  condition: Condition | null
  description: string
  onDescriptionChange: (v: string) => void
  onSubmit: () => void
  submitting: boolean
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-text-primary">Review &amp; Submit</h2>
        <p className="mt-1 text-sm text-text-secondary">Check everything looks correct before submitting.</p>
      </div>

      <div className="divide-y divide-surface-border overflow-hidden rounded-xl border border-surface-border">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-text-secondary">Card</span>
          <span className="text-sm font-medium text-text-primary">{card?.name ?? 'Not selected'}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-text-secondary">Set</span>
          <span className="text-sm font-medium text-text-primary">{card?.setName ?? '—'}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-text-secondary">Condition</span>
          <span className="text-sm font-medium text-text-primary">{condition ?? 'Not selected'}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-text-secondary">Photos</span>
          <span className="text-sm font-medium text-text-primary">{images.length} uploaded</span>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt={`Photo ${i + 1}`} className="aspect-square w-full rounded-lg border border-surface-border object-cover" />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-secondary">Additional Notes (optional)</label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          placeholder="Any extra details about the card, known defects, etc."
          className="w-full resize-none rounded-xl border border-surface-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-nimbus-500 focus:ring-2 focus:ring-nimbus-500/20"
        />
      </div>

      <Button onClick={onSubmit} loading={submitting} size="lg" className="w-full justify-center">
        Submit for Review
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------
const STEP_LABELS = ['Search Card', 'Upload Photos', 'Condition', 'Review']

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const done = i < step
          const current = i === step
          return (
            <div key={label} className="flex flex-1 flex-col items-center">
              <div
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                  done
                    ? 'border-nimbus-500 bg-nimbus-500 text-white'
                    : current
                    ? 'border-nimbus-500 bg-nimbus-500/10 text-nimbus-400'
                    : 'border-surface-border bg-surface-overlay text-text-muted',
                ].join(' ')}
              >
                {done ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={[
                  'mt-1.5 hidden text-[11px] font-medium sm:block',
                  current ? 'text-nimbus-400' : done ? 'text-text-secondary' : 'text-text-muted',
                ].join(' ')}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
      {/* connector lines */}
      <div className="relative mx-4 mt-3.5 hidden h-0.5 bg-surface-border sm:block">
        <div
          className="absolute inset-y-0 left-0 bg-nimbus-500 transition-all duration-300"
          style={{ width: `${(step / (STEP_LABELS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SubmitCardPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [card, setCard] = useState<CardResult | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [condition, setCondition] = useState<Condition | null>(null)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canProceed = () => {
    if (step === 0) return true // card is optional
    if (step === 1) return images.length >= 2
    if (step === 2) return condition !== null
    return true
  }

  const handleSubmit = async () => {
    if (!condition) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: card?.id || undefined,
          images,
          estimatedCondition: condition,
          description: description || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Submission failed')
      }
      const data = await res.json()
      toast('Submission received! We\'ll review it within 24–48 hours.', 'success')
      router.push(`/sell-your-cards/submissions/${data.submission?.id ?? ''}`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Submission failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Sell Your Card</h1>
          <p className="mt-1 text-sm text-text-secondary">Step {step + 1} of {STEP_LABELS.length}</p>
        </div>

        <ProgressBar step={step} />

        <div className="rounded-2xl border border-surface-border bg-surface-raised p-6 shadow-lg">
          {step === 0 && <StepSearchCard selected={card} onSelect={setCard} />}
          {step === 1 && <StepUploadPhotos images={images} onImagesChange={setImages} />}
          {step === 2 && (
            <StepSelectCondition condition={condition} onConditionChange={setCondition} card={card} />
          )}
          {step === 3 && (
            <StepReview
              card={card}
              images={images}
              condition={condition}
              description={description}
              onDescriptionChange={setDescription}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )}

          {step < 3 && (
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                Back
              </Button>
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
              >
                {step === 2 ? 'Review' : 'Continue'}
              </Button>
            </div>
          )}
          {step === 3 && (
            <div className="mt-4">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
