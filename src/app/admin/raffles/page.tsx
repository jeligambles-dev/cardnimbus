import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-guard'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { RaffleStatus } from '@prisma/client'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'nimbus'

function statusVariant(status: RaffleStatus): BadgeVariant {
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

export default async function AdminRafflesPage() {
  await requireAdmin()

  const raffles = await db.raffle.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      winner: { select: { name: true, email: true } },
      _count: { select: { tickets: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Raffles</h1>
          <p className="mt-1 text-sm text-text-secondary">{raffles.length} raffle(s) total</p>
        </div>
        <Link
          href="/admin/raffles/new"
          className="inline-flex items-center gap-2 rounded-xl bg-nimbus-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-nimbus-500/25 transition-colors hover:bg-nimbus-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Raffle
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-overlay">
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Title</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Slots</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Ticket Price</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Prize Value</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Starts</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Ends</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {raffles.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-text-muted">
                  No raffles yet.
                </td>
              </tr>
            ) : (
              raffles.map((raffle) => (
                <tr key={raffle.id} className="transition-colors hover:bg-surface-overlay/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary">{raffle.title}</p>
                    {raffle.winner && (
                      <p className="text-xs text-emerald-400">
                        Winner: {raffle.winner.name ?? raffle.winner.email}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(raffle.status)}>{raffle.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    <span className="font-medium text-text-primary">{raffle.filledSlots}</span>
                    <span className="text-text-muted">/{raffle.totalSlots}</span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {formatCurrency(raffle.ticketPrice)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {formatCurrency(raffle.prizeValue)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {new Date(raffle.startsAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {new Date(raffle.endsAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <RaffleActions raffle={raffle} />
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

function RaffleActions({
  raffle,
}: {
  raffle: { id: string; status: RaffleStatus }
}) {
  const { id, status } = raffle

  return (
    <div className="flex items-center gap-1.5">
      {status === 'DRAFT' && (
        <ActionForm raffleId={id} action="schedule" label="Schedule" />
      )}
      {status === 'SCHEDULED' && (
        <ActionForm raffleId={id} action="activate" label="Activate" />
      )}
      {status === 'FROZEN' && (
        <ActionForm raffleId={id} action="draw" label="Draw" variant="nimbus" />
      )}
      {(status === 'DRAFT' ||
        status === 'SCHEDULED' ||
        status === 'ACTIVE' ||
        status === 'FROZEN') && (
        <ActionForm raffleId={id} action="cancel" label="Cancel" variant="danger" />
      )}
    </div>
  )
}

function ActionForm({
  raffleId,
  action,
  label,
  variant = 'default',
}: {
  raffleId: string
  action: string
  label: string
  variant?: 'default' | 'nimbus' | 'danger'
}) {
  const colorMap: Record<string, string> = {
    default:
      'bg-surface-overlay text-text-secondary border border-surface-border hover:text-text-primary hover:bg-surface-border',
    nimbus:
      'bg-nimbus-500/10 text-nimbus-400 border border-nimbus-500/20 hover:bg-nimbus-500/20',
    danger:
      'bg-red-950 text-red-400 border border-red-800 hover:bg-red-900',
  }

  return (
    <form action={`/api/admin/raffles/${raffleId}/${action}`} method="POST">
      <button
        type="submit"
        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${colorMap[variant] ?? colorMap.default}`}
      >
        {label}
      </button>
    </form>
  )
}
