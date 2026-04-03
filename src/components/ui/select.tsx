import { forwardRef } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, id, className = '', ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={[
            'w-full bg-surface-raised border rounded-xl px-3 py-2 text-sm text-text-primary',
            'transition-colors duration-150 outline-none cursor-pointer',
            'focus:border-nimbus-500 focus:ring-2 focus:ring-nimbus-500/20',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-surface-border',
            className,
          ].join(' ')}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
