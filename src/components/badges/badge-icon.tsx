'use client'

import { useState } from 'react'
import type { BadgeCategory } from '@prisma/client'

interface BadgeIconProps {
  name: string
  icon?: string | null
  category: BadgeCategory
  size?: 'small' | 'medium'
}

const categoryColors: Record<BadgeCategory, string> = {
  TRUST: 'bg-emerald-950 border-emerald-700 text-emerald-400',
  PERFORMANCE: 'bg-nimbus-950 border-nimbus-700 text-nimbus-400',
  MILESTONE: 'bg-amber-950 border-amber-700 text-amber-400',
  COMMUNITY: 'bg-purple-950 border-purple-700 text-purple-400',
}

const categoryFallback: Record<BadgeCategory, string> = {
  TRUST: '✓',
  PERFORMANCE: '⚡',
  MILESTONE: '🏆',
  COMMUNITY: '🤝',
}

export function BadgeIcon({ name, icon, category, size = 'small' }: BadgeIconProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false)

  const sizeClasses = size === 'small'
    ? 'w-5 h-5 text-xs'
    : 'w-8 h-8 text-base'

  const display = icon ?? categoryFallback[category]

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
    >
      <span
        className={[
          'inline-flex items-center justify-center rounded-full border font-medium cursor-default select-none',
          categoryColors[category],
          sizeClasses,
        ].join(' ')}
        aria-label={name}
      >
        {display}
      </span>

      {tooltipVisible && (
        <div
          className={[
            'absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1.5',
            'whitespace-nowrap rounded-lg border border-surface-border',
            'bg-surface-raised px-2.5 py-1 text-xs text-text-primary shadow-lg',
            'pointer-events-none',
          ].join(' ')}
          role="tooltip"
        >
          {name}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface-border" />
        </div>
      )}
    </div>
  )
}
