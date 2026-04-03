import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full bg-surface-raised border rounded-xl px-3 py-2 text-sm text-text-primary placeholder-text-muted',
            'transition-colors duration-150 outline-none',
            'focus:border-nimbus-500 focus:ring-2 focus:ring-nimbus-500/20',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-surface-border',
            className,
          ].join(' ')}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
