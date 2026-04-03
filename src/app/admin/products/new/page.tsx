'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const CATEGORY_OPTIONS = [
  { value: 'PACK', label: 'Pack' },
  { value: 'BOOSTER_BOX', label: 'Booster Box' },
  { value: 'SLAB', label: 'Slab' },
  { value: 'SINGLE', label: 'Single' },
]

const CONDITION_OPTIONS = [
  { value: '', label: 'N/A' },
  { value: 'NM', label: 'NM — Near Mint' },
  { value: 'LP', label: 'LP — Lightly Played' },
  { value: 'MP', label: 'MP — Moderately Played' },
  { value: 'HP', label: 'HP — Heavily Played' },
]

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    category: 'PACK',
    price: '',
    stock: '',
    description: '',
    condition: '',
    images: '',
  })

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const body = {
        name: form.name.trim(),
        category: form.category,
        price: parseFloat(form.price),
        stock: parseInt(form.stock || '0', 10),
        description: form.description.trim() || undefined,
        condition: form.condition || undefined,
        images: form.images
          .split('\n')
          .map((u) => u.trim())
          .filter(Boolean),
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to create product')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">New Product</h1>
        <p className="mt-1 text-sm text-text-secondary">Create a new product listing</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Charizard ex #6"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              options={CATEGORY_OPTIONS}
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
            />
            <Select
              label="Condition"
              options={CONDITION_OPTIONS}
              value={form.condition}
              onChange={(e) => handleChange('condition', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (USD)"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="0.00"
            />
            <Input
              label="Stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => handleChange('stock', e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Description</label>
            <textarea
              className="w-full rounded-xl border border-surface-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-nimbus-500 focus:ring-2 focus:ring-nimbus-500/20"
              rows={3}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Optional product description..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Image URLs <span className="text-text-muted">(one per line)</span>
            </label>
            <textarea
              className="w-full rounded-xl border border-surface-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-nimbus-500 focus:ring-2 focus:ring-nimbus-500/20"
              rows={3}
              value={form.images}
              onChange={(e) => handleChange('images', e.target.value)}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Product
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
