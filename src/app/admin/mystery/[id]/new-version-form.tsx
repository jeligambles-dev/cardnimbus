'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface PullRate {
  tierName: string
  chance: string
}

interface PoolItem {
  productId: string
  cardId: string
  tierName: string
  weight: string
  quantity: string
  lockedValue: string
}

interface NewVersionFormProps {
  collectionId: string
}

const DEFAULT_POOL_ITEM = (): PoolItem => ({
  productId: '',
  cardId: '',
  tierName: '',
  weight: '1',
  quantity: '10',
  lockedValue: '',
})

export function NewVersionForm({ collectionId }: NewVersionFormProps) {
  const router = useRouter()
  const [pullRates, setPullRates] = useState<PullRate[]>([
    { tierName: '', chance: '' },
  ])
  const [poolItems, setPoolItems] = useState<PoolItem[]>([DEFAULT_POOL_ITEM()])
  const [guaranteedMinValue, setGuaranteedMinValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function addPullRate() {
    setPullRates((prev) => [...prev, { tierName: '', chance: '' }])
  }

  function removePullRate(index: number) {
    setPullRates((prev) => prev.filter((_, i) => i !== index))
  }

  function updatePullRate(index: number, field: keyof PullRate, value: string) {
    setPullRates((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  function addPoolItem() {
    setPoolItems((prev) => [...prev, DEFAULT_POOL_ITEM()])
  }

  function removePoolItem(index: number) {
    setPoolItems((prev) => prev.filter((_, i) => i !== index))
  }

  function updatePoolItem(index: number, field: keyof PoolItem, value: string) {
    setPoolItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch(`/api/admin/mystery/${collectionId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pullRates: pullRates.map((r) => ({
            tierName: r.tierName,
            chance: parseFloat(r.chance),
          })),
          guaranteedMinValue: parseFloat(guaranteedMinValue),
          poolItems: poolItems.map((item) => ({
            productId: item.productId || undefined,
            cardId: item.cardId || undefined,
            tierName: item.tierName,
            weight: parseFloat(item.weight),
            quantity: parseInt(item.quantity, 10),
            lockedValue: parseFloat(item.lockedValue),
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to create version')
      }

      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Guaranteed Min Value */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Guaranteed Min Value ($) <span className="text-red-400">*</span>
        </label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={guaranteedMinValue}
          onChange={(e) => setGuaranteedMinValue(e.target.value)}
          placeholder="20.00"
          required
          className="max-w-xs"
        />
      </div>

      {/* Pull Rates */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-text-secondary">
            Pull Rates (must sum to 1.0)
          </label>
          <button
            type="button"
            onClick={addPullRate}
            className="text-sm text-nimbus-600 hover:text-nimbus-700"
          >
            + Add tier
          </button>
        </div>
        <div className="space-y-2">
          {pullRates.map((rate, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={rate.tierName}
                onChange={(e) => updatePullRate(i, 'tierName', e.target.value)}
                placeholder="Tier name (e.g. Rare)"
                required
                className="flex-1"
              />
              <Input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={rate.chance}
                onChange={(e) => updatePullRate(i, 'chance', e.target.value)}
                placeholder="0.70"
                required
                className="w-28"
              />
              {pullRates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePullRate(i)}
                  className="rounded-lg border border-red-800 bg-red-950 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pool Items */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-text-secondary">Pool Items</label>
          <button
            type="button"
            onClick={addPoolItem}
            className="text-sm text-nimbus-600 hover:text-nimbus-700"
          >
            + Add item
          </button>
        </div>
        <div className="space-y-3">
          {poolItems.map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-surface-border bg-surface-overlay p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">Item {i + 1}</span>
                {poolItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePoolItem(i)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Tier Name</label>
                  <Input
                    value={item.tierName}
                    onChange={(e) => updatePoolItem(i, 'tierName', e.target.value)}
                    placeholder="Rare"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Weight</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.weight}
                    onChange={(e) => updatePoolItem(i, 'weight', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updatePoolItem(i, 'quantity', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Locked Value ($)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.lockedValue}
                    onChange={(e) => updatePoolItem(i, 'lockedValue', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Product ID</label>
                  <Input
                    value={item.productId}
                    onChange={(e) => updatePoolItem(i, 'productId', e.target.value)}
                    placeholder="optional"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Card ID</label>
                  <Input
                    value={item.cardId}
                    onChange={(e) => updatePoolItem(i, 'cardId', e.target.value)}
                    placeholder="optional"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-800 bg-emerald-950 px-4 py-3 text-sm text-emerald-400">
          Version created successfully.
        </div>
      )}

      <Button type="submit" loading={loading}>
        Create Version
      </Button>
    </form>
  )
}
