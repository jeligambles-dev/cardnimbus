'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface FormState {
  title: string
  description: string
  prizeImages: string[]
  prizeValue: string
  ticketPrice: string
  totalSlots: string
  maxTicketsPerUser: string
  minFillThreshold: string
  startsAt: string
  endsAt: string
  visibilityMode: string
  publishedTermsVersion: string
}

const INITIAL: FormState = {
  title: '',
  description: '',
  prizeImages: [''],
  prizeValue: '',
  ticketPrice: '',
  totalSlots: '',
  maxTicketsPerUser: '1',
  minFillThreshold: '0.5',
  startsAt: '',
  endsAt: '',
  visibilityMode: 'PUBLIC_NAMES',
  publishedTermsVersion: '',
}

export default function NewRafflePage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setPrizeImage(index: number, value: string) {
    const updated = [...form.prizeImages]
    updated[index] = value
    setField('prizeImages', updated)
  }

  function addPrizeImage() {
    setField('prizeImages', [...form.prizeImages, ''])
  }

  function removePrizeImage(index: number) {
    setField(
      'prizeImages',
      form.prizeImages.filter((_, i) => i !== index)
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/raffles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          prizeImages: form.prizeImages.filter(Boolean),
          prizeValue: parseFloat(form.prizeValue),
          ticketPrice: parseFloat(form.ticketPrice),
          totalSlots: parseInt(form.totalSlots, 10),
          maxTicketsPerUser: parseInt(form.maxTicketsPerUser, 10),
          minFillThreshold: parseFloat(form.minFillThreshold),
          startsAt: new Date(form.startsAt).toISOString(),
          endsAt: new Date(form.endsAt).toISOString(),
          visibilityMode: form.visibilityMode,
          publishedTermsVersion: form.publishedTermsVersion || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to create raffle')
      }

      router.push('/admin/raffles')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">New Raffle</h1>
        <p className="mt-1 text-sm text-text-secondary">Create a new raffle event</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Title <span className="text-red-400">*</span>
          </label>
          <Input
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="e.g. Charizard PSA 10 Raffle"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            rows={3}
            placeholder="Describe the raffle prize and rules..."
            className="w-full rounded-xl border border-surface-border bg-surface-overlay px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-nimbus-500 focus:outline-none focus:ring-1 focus:ring-nimbus-500/30"
          />
        </div>

        {/* Prize Images */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Prize Images (URL)
          </label>
          <div className="space-y-2">
            {form.prizeImages.map((url, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => setPrizeImage(i, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                {form.prizeImages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePrizeImage(i)}
                    className="rounded-lg border border-red-800 bg-red-950 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addPrizeImage}
              className="text-sm text-nimbus-600 hover:text-nimbus-700"
            >
              + Add image
            </button>
          </div>
        </div>

        {/* Prize Value & Ticket Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Prize Value ($) <span className="text-red-400">*</span>
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.prizeValue}
              onChange={(e) => setField('prizeValue', e.target.value)}
              placeholder="500.00"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Ticket Price ($) <span className="text-red-400">*</span>
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.ticketPrice}
              onChange={(e) => setField('ticketPrice', e.target.value)}
              placeholder="10.00"
              required
            />
          </div>
        </div>

        {/* Total Slots, Max Per User, Min Fill */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Total Slots <span className="text-red-400">*</span>
            </label>
            <Input
              type="number"
              min="1"
              value={form.totalSlots}
              onChange={(e) => setField('totalSlots', e.target.value)}
              placeholder="100"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Max Per User
            </label>
            <Input
              type="number"
              min="1"
              value={form.maxTicketsPerUser}
              onChange={(e) => setField('maxTicketsPerUser', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Min Fill Threshold
            </label>
            <Input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={form.minFillThreshold}
              onChange={(e) => setField('minFillThreshold', e.target.value)}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Start Date <span className="text-red-400">*</span>
            </label>
            <Input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setField('startsAt', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              End Date <span className="text-red-400">*</span>
            </label>
            <Input
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => setField('endsAt', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Visibility Mode */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Visibility Mode
          </label>
          <select
            value={form.visibilityMode}
            onChange={(e) => setField('visibilityMode', e.target.value)}
            className="w-full rounded-xl border border-surface-border bg-surface-overlay px-3 py-2 text-sm text-text-primary focus:border-nimbus-500 focus:outline-none focus:ring-1 focus:ring-nimbus-500/30"
          >
            <option value="PUBLIC_NAMES">Public Names</option>
            <option value="PARTIAL">Partial (first 2 chars)</option>
            <option value="ANONYMOUS">Anonymous</option>
          </select>
        </div>

        {/* Terms Version */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Terms Version
          </label>
          <Input
            value={form.publishedTermsVersion}
            onChange={(e) => setField('publishedTermsVersion', e.target.value)}
            placeholder="v1.0"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading}>
            Create Raffle
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/admin/raffles')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
