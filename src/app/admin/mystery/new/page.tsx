'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function NewMysteryCollectionPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [tier, setTier] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/mystery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          tier,
          price: parseFloat(price),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to create collection')
      }

      const created = await res.json()
      router.push(`/admin/mystery/${created.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">New Mystery Collection</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Create a collection, then add versions with pool items.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Collection Name <span className="text-red-400">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Legendary Pack"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Tier Label <span className="text-red-400">*</span>
          </label>
          <Input
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            placeholder="e.g. Gold"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Price ($) <span className="text-red-400">*</span>
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="29.99"
            required
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading}>
            Create Collection
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/admin/mystery')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
