type SpinnerSize = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-2',
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={[
        'rounded-full border-surface-border border-t-nimbus-500 animate-spin',
        sizeClasses[size],
        className,
      ].join(' ')}
      role="status"
      aria-label="Loading"
    />
  )
}
