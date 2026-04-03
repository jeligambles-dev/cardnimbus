interface CardProps {
  hover?: boolean
  children: React.ReactNode
  className?: string
}

export function Card({ hover = false, children, className = '' }: CardProps) {
  return (
    <div
      className={[
        'rounded-xl border border-surface-border bg-surface-raised',
        hover
          ? 'transition-all duration-200 hover:border-nimbus-500/50 hover:shadow-lg hover:shadow-nimbus-500/10 hover:-translate-y-1 cursor-pointer'
          : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
