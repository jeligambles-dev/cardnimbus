'use client'

import type { BadgeCategory } from '@prisma/client'
import { BadgeIcon } from './badge-icon'

interface BadgeData {
  id: string
  name: string
  slug: string
  description: string
  icon?: string | null
  category: BadgeCategory
}

interface UserBadgeEntry {
  id: string
  awardedAt: Date | string
  badge: BadgeData
}

interface BadgeGridProps {
  userBadges: UserBadgeEntry[]
}

const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  TRUST: 'Trust & Verification',
  PERFORMANCE: 'Performance',
  MILESTONE: 'Milestones',
  COMMUNITY: 'Community',
}

const CATEGORY_ORDER: BadgeCategory[] = ['TRUST', 'PERFORMANCE', 'MILESTONE', 'COMMUNITY']

export function BadgeGrid({ userBadges }: BadgeGridProps) {
  if (userBadges.length === 0) {
    return (
      <div className="rounded-xl border border-surface-border bg-surface-raised p-6 text-center">
        <p className="text-sm text-text-muted">No badges earned yet.</p>
      </div>
    )
  }

  // Group by category
  const grouped = userBadges.reduce<Partial<Record<BadgeCategory, UserBadgeEntry[]>>>(
    (acc, ub) => {
      const cat = ub.badge.category
      if (!acc[cat]) acc[cat] = []
      acc[cat]!.push(ub)
      return acc
    },
    {}
  )

  return (
    <div className="space-y-6">
      {CATEGORY_ORDER.map((cat) => {
        const items = grouped[cat]
        if (!items || items.length === 0) return null
        return (
          <div key={cat}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
              {CATEGORY_LABELS[cat]}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map((ub) => (
                <div
                  key={ub.id}
                  className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface-raised p-3"
                >
                  <BadgeIcon
                    name={ub.badge.name}
                    icon={ub.badge.icon}
                    category={ub.badge.category}
                    size="medium"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary leading-tight">
                      {ub.badge.name}
                    </p>
                    <p className="text-xs text-text-muted line-clamp-2 mt-0.5">
                      {ub.badge.description}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {new Date(ub.awardedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
