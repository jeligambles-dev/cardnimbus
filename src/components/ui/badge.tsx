type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'nimbus'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    'bg-surface-overlay text-text-secondary border-surface-border',
  success:
    'bg-emerald-950 text-emerald-400 border-emerald-800',
  warning:
    'bg-amber-950 text-amber-400 border-amber-800',
  danger:
    'bg-red-950 text-red-400 border-red-800',
  nimbus:
    'bg-nimbus-950 text-nimbus-400 border-nimbus-800',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
}

export function Badge({
  variant = 'default',
  size = 'sm',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
