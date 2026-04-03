'use client'

interface ProgressItem {
  badgeSlug: string
  badgeName: string
  badgeIcon?: string | null
  label: string
  current: number
  target: number
}

interface BadgeProgressProps {
  progress: ProgressItem[]
}

export function BadgeProgress({ progress }: BadgeProgressProps) {
  if (progress.length === 0) return null

  return (
    <div className="space-y-3">
      {progress.map((item) => {
        const pct = Math.min(100, Math.round((item.current / item.target) * 100))
        return (
          <div key={item.badgeSlug} className="rounded-xl border border-surface-border bg-surface-raised p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {item.badgeIcon && (
                  <span className="text-base" aria-hidden>
                    {item.badgeIcon}
                  </span>
                )}
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
              </div>
              <span className="text-xs text-text-muted">{pct}%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-overlay rounded-full overflow-hidden">
              <div
                className="h-full bg-nimbus-500 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
