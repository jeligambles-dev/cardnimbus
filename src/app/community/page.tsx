import {
  getTopSellers,
  getTopRated,
  getBestPulls,
  getRaffleWinners,
} from '@/services/leaderboard.service'
import { formatCurrency } from '@/lib/utils'

export const metadata = {
  title: 'Community Leaderboards — Card Nimbus',
  description: 'Top sellers, best-rated traders, mystery pull kings, and raffle winners.',
}

const MEDALS = ['🥇', '🥈', '🥉']

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span className="text-xl leading-none w-8 text-center shrink-0">
        {MEDALS[rank - 1]}
      </span>
    )
  }
  return (
    <span className="w-8 text-center text-sm font-bold text-text-muted shrink-0">
      #{rank}
    </span>
  )
}

function Avatar({ name, avatar, size = 'md' }: { name: string | null; avatar: string | null; size?: 'sm' | 'md' }) {
  const initials = (name ?? '?').slice(0, 2).toUpperCase()
  const dim = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name ?? 'User'}
        className={`${dim} rounded-full object-cover ring-1 ring-surface-border shrink-0`}
      />
    )
  }
  return (
    <div
      className={`${dim} rounded-full bg-nimbus-100 text-nimbus-700 font-bold flex items-center justify-center ring-1 ring-nimbus-400 shrink-0`}
    >
      {initials}
    </div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-extrabold text-text-primary tracking-tight">{title}</h2>
      <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-surface-border last:border-0">
      {children}
    </div>
  )
}

export default async function CommunityPage() {
  const [topSellers, topRated, bestPulls, raffleWinners] = await Promise.all([
    getTopSellers(10),
    getTopRated(10),
    getBestPulls(10),
    getRaffleWinners(10),
  ])

  return (
    <main className="min-h-screen bg-surface">
      {/* Hero */}
      <div className="border-b border-surface-border bg-gradient-to-b from-nimbus-950/60 to-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-nimbus-600 mb-3">
            Community
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-text-primary tracking-tight mb-3">
            Leaderboards
          </h1>
          <p className="text-base text-text-secondary max-w-lg mx-auto">
            The best traders, biggest pulls, and luckiest winners on Card Nimbus.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Top Sellers */}
          <section className="bg-surface-card border border-surface-border rounded-2xl p-6">
            <SectionHeader
              title="Top Sellers"
              subtitle="Ranked by total completed sales"
            />
            {topSellers.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">No sellers yet.</p>
            ) : (
              <div>
                {topSellers.map((s) => (
                  <Row key={s.sellerId}>
                    <RankBadge rank={s.rank} />
                    <Avatar name={s.name} avatar={s.avatar} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {s.name ?? 'Anonymous'}
                      </p>
                      {s.rating !== null && (
                        <p className="text-xs text-text-muted">
                          {s.rating.toFixed(1)} ★ · {s.ratingCount} reviews
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-nimbus-600">
                        {s.totalSales.toLocaleString()}
                      </p>
                      <p className="text-xs text-text-muted">sales</p>
                    </div>
                  </Row>
                ))}
              </div>
            )}
          </section>

          {/* Top Rated */}
          <section className="bg-surface-card border border-surface-border rounded-2xl p-6">
            <SectionHeader
              title="Top Rated"
              subtitle="Minimum 10 reviews required"
            />
            {topRated.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">No qualified sellers yet.</p>
            ) : (
              <div>
                {topRated.map((s) => (
                  <Row key={s.sellerId}>
                    <RankBadge rank={s.rank} />
                    <Avatar name={s.name} avatar={s.avatar} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {s.name ?? 'Anonymous'}
                      </p>
                      <p className="text-xs text-text-muted">
                        {s.totalSales} sales
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-amber-400">
                        {s.rating.toFixed(2)} ★
                      </p>
                      <p className="text-xs text-text-muted">{s.ratingCount} reviews</p>
                    </div>
                  </Row>
                ))}
              </div>
            )}
          </section>

          {/* Best Pulls */}
          <section className="bg-surface-card border border-surface-border rounded-2xl p-6">
            <SectionHeader
              title="Best Mystery Pulls"
              subtitle="Highest-value mystery collection reveals ever"
            />
            {bestPulls.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">No pulls yet.</p>
            ) : (
              <div>
                {bestPulls.map((p) => (
                  <Row key={p.pullId}>
                    <RankBadge rank={p.rank} />
                    <Avatar name={p.name} avatar={p.avatar} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {p.name ?? 'Anonymous'}
                      </p>
                      <p className="text-xs text-text-muted truncate">{p.revealedItemName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-emerald-400">
                        {formatCurrency(p.revealedItemValue)}
                      </p>
                      <p className="text-xs text-text-muted">
                        {new Date(p.pulledAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Row>
                ))}
              </div>
            )}
          </section>

          {/* Raffle Winners */}
          <section className="bg-surface-card border border-surface-border rounded-2xl p-6">
            <SectionHeader
              title="Raffle Winners"
              subtitle="Recent raffle prize recipients"
            />
            {raffleWinners.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">No completed raffles yet.</p>
            ) : (
              <div>
                {raffleWinners.map((w) => (
                  <Row key={w.raffleId}>
                    <RankBadge rank={w.rank} />
                    <Avatar name={w.winnerName} avatar={w.winnerAvatar} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {w.winnerName ?? 'Anonymous'}
                      </p>
                      <p className="text-xs text-text-muted truncate">{w.title}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-nimbus-600">
                        {formatCurrency(w.prizeValue)}
                      </p>
                      {w.drawnAt && (
                        <p className="text-xs text-text-muted">
                          {new Date(w.drawnAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </Row>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </main>
  )
}
