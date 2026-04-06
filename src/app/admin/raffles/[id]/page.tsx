'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'nimbus'

interface Raffle {
  id: string
  title: string
  description: string | null
  prizeImages: string[]
  prizeValue: number
  ticketPrice: number
  totalSlots: number
  filledSlots: number
  maxTicketsPerUser: number
  minFillThreshold: number
  status: string
  drawMethod: string | null
  winnerId: string | null
  winningTicketNumber: number | null
  drawnAt: string | null
  randomSeed: string | null
  drawReference: string | null
  legalRegionRestriction: string | null
  publishedTermsVersion: string | null
  visibilityMode: string
  cancelReason: string | null
  startsAt: string
  endsAt: string
  createdAt: string
  updatedAt: string
  winner: { id: string; name: string | null } | null
  _count: { tickets: number; purchases: number }
}

interface EditForm {
  title: string
  description: string
  ticketPrice: string
  startsAt: string
  endsAt: string
}

function statusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'SCHEDULED':
      return 'nimbus'
    case 'FROZEN':
    case 'DRAWING':
      return 'warning'
    case 'COMPLETED':
    case 'PRIZE_SHIPPED':
      return 'default'
    case 'CANCELLED':
      return 'danger'
    case 'DRAFT':
    default:
      return 'default'
  }
}

function toLocalDatetimeValue(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AdminRaffleDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<EditForm>({
    title: '',
    description: '',
    ticketPrice: '',
    startsAt: '',
    endsAt: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/raffles`)
        if (!res.ok) throw new Error('Failed to fetch raffles')
        const raffles: Raffle[] = await res.json()
        const found = raffles.find((r) => r.id === id)
        if (!found) throw new Error('Raffle not found')
        setRaffle(found)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id])

  function startEditing() {
    if (!raffle) return
    setForm({
      title: raffle.title,
      description: raffle.description ?? '',
      ticketPrice: raffle.ticketPrice.toString(),
      startsAt: toLocalDatetimeValue(raffle.startsAt),
      endsAt: toLocalDatetimeValue(raffle.endsAt),
    })
    setEditing(true)
    setSaveError(null)
  }

  function cancelEditing() {
    setEditing(false)
    setSaveError(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!raffle) return
    setSaving(true)
    setSaveError(null)

    try {
      const res = await fetch(`/api/admin/raffles/${raffle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          title: form.title,
          description: form.description || undefined,
          ticketPrice: parseFloat(form.ticketPrice),
          startsAt: new Date(form.startsAt).toISOString(),
          endsAt: new Date(form.endsAt).toISOString(),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(
          (data as Record<string, string>).error ?? 'Failed to save'
        )
      }

      // Reload data
      const listRes = await fetch(`/api/admin/raffles`)
      if (listRes.ok) {
        const raffles: Raffle[] = await listRes.json()
        const updated = raffles.find((r) => r.id === raffle.id)
        if (updated) setRaffle(updated)
      }
      setEditing(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-nimbus-500 border-t-transparent" />
      </div>
    )
  }

  if (error || !raffle) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/raffles"
          className="text-sm text-text-muted hover:text-nimbus-600"
        >
          &larr; Back to Raffles
        </Link>
        <Card className="p-8 text-center">
          <p className="text-red-400">{error ?? 'Raffle not found'}</p>
        </Card>
      </div>
    )
  }

  const canEdit = raffle.status === 'DRAFT' || raffle.status === 'SCHEDULED'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/raffles"
              className="text-sm text-text-muted hover:text-nimbus-600"
            >
              &larr; Back
            </Link>
            <h1 className="text-2xl font-bold text-text-primary">{raffle.title}</h1>
            <Badge variant={statusVariant(raffle.status)}>{raffle.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            Created {new Date(raffle.createdAt).toLocaleDateString()}
          </p>
        </div>
        {canEdit && !editing && (
          <Button size="sm" onClick={startEditing}>
            Edit Raffle
          </Button>
        )}
      </div>

      {/* Edit Form */}
      {editing && (
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Edit Raffle</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Title
              </label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                className="w-full rounded-xl border border-surface-border bg-surface-overlay px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-nimbus-500 focus:outline-none focus:ring-1 focus:ring-nimbus-500/30"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  Ticket Price ($)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.ticketPrice}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, ticketPrice: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  Start Date
                </label>
                <Input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, startsAt: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  End Date
                </label>
                <Input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, endsAt: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            {saveError && (
              <div className="rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-400">
                {saveError}
              </div>
            )}
            <div className="flex gap-3">
              <Button type="submit" loading={saving}>
                Save Changes
              </Button>
              <Button type="button" variant="secondary" onClick={cancelEditing}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Basic Info */}
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Prize Value</dt>
              <dd className="font-medium text-text-primary">
                {formatCurrency(raffle.prizeValue)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Ticket Price</dt>
              <dd className="font-medium text-text-primary">
                {formatCurrency(raffle.ticketPrice)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Slots</dt>
              <dd className="font-medium text-text-primary">
                {raffle.filledSlots} / {raffle.totalSlots}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Max Tickets Per User</dt>
              <dd className="font-medium text-text-primary">
                {raffle.maxTicketsPerUser}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Min Fill Threshold</dt>
              <dd className="font-medium text-text-primary">
                {(raffle.minFillThreshold * 100).toFixed(0)}%
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Visibility</dt>
              <dd className="font-medium text-text-primary">
                {raffle.visibilityMode.replace(/_/g, ' ')}
              </dd>
            </div>
            {raffle.publishedTermsVersion && (
              <div className="flex justify-between">
                <dt className="text-text-secondary">Terms Version</dt>
                <dd className="font-medium text-text-primary">
                  {raffle.publishedTermsVersion}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        {/* Right: Dates & Participation */}
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Dates & Participation
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Starts</dt>
              <dd className="font-medium text-text-primary">
                {new Date(raffle.startsAt).toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Ends</dt>
              <dd className="font-medium text-text-primary">
                {new Date(raffle.endsAt).toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Total Tickets Sold</dt>
              <dd className="font-medium text-text-primary">
                {raffle._count.tickets}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Total Purchases</dt>
              <dd className="font-medium text-text-primary">
                {raffle._count.purchases}
              </dd>
            </div>
            {raffle.winner && (
              <div className="flex justify-between">
                <dt className="text-text-secondary">Winner</dt>
                <dd className="font-medium text-emerald-400">
                  {raffle.winner.name ?? raffle.winner.id}
                </dd>
              </div>
            )}
            {raffle.winningTicketNumber != null && (
              <div className="flex justify-between">
                <dt className="text-text-secondary">Winning Ticket #</dt>
                <dd className="font-medium text-text-primary">
                  {raffle.winningTicketNumber}
                </dd>
              </div>
            )}
            {raffle.drawnAt && (
              <div className="flex justify-between">
                <dt className="text-text-secondary">Drawn At</dt>
                <dd className="font-medium text-text-primary">
                  {new Date(raffle.drawnAt).toLocaleString()}
                </dd>
              </div>
            )}
            {raffle.cancelReason && (
              <div className="flex justify-between">
                <dt className="text-text-secondary">Cancel Reason</dt>
                <dd className="font-medium text-red-400">{raffle.cancelReason}</dd>
              </div>
            )}
          </dl>
        </Card>
      </div>

      {/* Description */}
      {raffle.description && (
        <Card className="p-5">
          <h2 className="mb-2 text-lg font-semibold text-text-primary">Description</h2>
          <p className="whitespace-pre-wrap text-sm text-text-secondary">
            {raffle.description}
          </p>
        </Card>
      )}

      {/* Prize Images */}
      {raffle.prizeImages.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 text-lg font-semibold text-text-primary">Prize Images</h2>
          <div className="flex flex-wrap gap-3">
            {raffle.prizeImages.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-lg border border-surface-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Prize ${i + 1}`}
                  className="h-32 w-32 object-cover"
                />
              </a>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
