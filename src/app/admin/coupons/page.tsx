'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface Coupon {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  usageLimit: number | null
  usageCount: number
  isActive: boolean
  endsAt: string | null
}

const TYPE_OPTIONS = [
  { value: 'PERCENTAGE', label: 'Percentage (%)' },
  { value: 'FIXED', label: 'Fixed Amount ($)' },
]

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: '',
    usageLimit: '',
  })

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/coupons')
      if (!res.ok) throw new Error('Failed to load coupons')
      const data = await res.json()
      setCoupons(data.coupons ?? [])
    } catch {
      setError('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)

    try {
      const body = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: parseFloat(form.value),
        usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : null,
      }

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to create coupon')
      }

      setForm({ code: '', type: 'PERCENTAGE', value: '', usageLimit: '' })
      await fetchCoupons()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Coupons</h1>
        <p className="mt-1 text-sm text-text-secondary">Manage discount codes</p>
      </div>

      {/* Create form */}
      <Card className="p-5">
        <h2 className="mb-4 text-base font-semibold text-text-primary">Create Coupon</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Code"
              required
              value={form.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              placeholder="SUMMER25"
            />
            <Select
              label="Type"
              options={TYPE_OPTIONS}
              value={form.type}
              onChange={(e) => handleChange('type', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={form.type === 'PERCENTAGE' ? 'Value (%)' : 'Value ($)'}
              type="number"
              step="0.01"
              min="0"
              required
              value={form.value}
              onChange={(e) => handleChange('value', e.target.value)}
              placeholder={form.type === 'PERCENTAGE' ? '10' : '5.00'}
            />
            <Input
              label="Usage Limit (blank = unlimited)"
              type="number"
              min="1"
              value={form.usageLimit}
              onChange={(e) => handleChange('usageLimit', e.target.value)}
              placeholder="e.g. 100"
            />
          </div>

          {formError && (
            <p className="rounded-lg border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-400">
              {formError}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" loading={submitting}>
              Create Coupon
            </Button>
          </div>
        </form>
      </Card>

      {/* Coupon list */}
      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-overlay">
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Code</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Type</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Value</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Usage</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Expires</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-red-400">
                  {error}
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  No coupons yet.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="transition-colors hover:bg-surface-overlay/50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-nimbus-400">
                    {coupon.code}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{coupon.type}</td>
                  <td className="px-4 py-3 text-text-primary">
                    {coupon.type === 'PERCENTAGE'
                      ? `${coupon.value}%`
                      : `$${coupon.value.toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {coupon.usageCount}
                    {coupon.usageLimit !== null && ` / ${coupon.usageLimit}`}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={coupon.isActive ? 'success' : 'default'}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {coupon.endsAt
                      ? new Date(coupon.endsAt).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
