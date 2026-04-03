'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-nimbus-500 text-white hover:bg-nimbus-600 shadow-lg shadow-nimbus-500/25 border border-nimbus-600',
  secondary:
    'bg-surface-overlay text-text-primary hover:bg-surface-border border border-surface-border',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-overlay border border-transparent',
  danger:
    'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/25 border border-red-700',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2',
}

const Spinner = ({ size }: { size: ButtonSize }) => (
  <svg
    className={`animate-spin ${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
)

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <motion.button
        ref={ref}
        whileTap={isDisabled ? {} : { scale: 0.97 }}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center font-semibold transition-colors duration-150 cursor-pointer',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {loading && <Spinner size={size} />}
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
