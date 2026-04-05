'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-gradient-to-b from-nimbus-500 to-nimbus-600 text-white',
    'hover:from-nimbus-400 hover:to-nimbus-500 hover:shadow-nimbus-500/40',
    'shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_4px_12px_-2px_rgba(255,0,0,0.35)]',
    'ring-1 ring-inset ring-white/10',
    'focus-visible:ring-2 focus-visible:ring-nimbus-400 focus-visible:ring-offset-2',
  ].join(' '),
  secondary: [
    'bg-white text-text-primary',
    'border border-surface-border',
    'hover:border-text-secondary hover:shadow-sm',
    'shadow-[0_1px_0_0_rgba(0,0,0,0.04)]',
    'focus-visible:ring-2 focus-visible:ring-nimbus-400 focus-visible:ring-offset-2',
  ].join(' '),
  ghost: [
    'bg-transparent text-text-secondary',
    'hover:text-text-primary hover:bg-surface-overlay',
    'focus-visible:ring-2 focus-visible:ring-nimbus-400 focus-visible:ring-offset-2',
  ].join(' '),
  danger: [
    'bg-gradient-to-b from-red-500 to-red-600 text-white',
    'hover:from-red-400 hover:to-red-500 hover:shadow-red-500/40',
    'shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_4px_12px_-2px_rgba(220,38,38,0.35)]',
    'ring-1 ring-inset ring-white/10',
    'focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2',
  ].join(' '),
  success: [
    'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white',
    'hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-500/40',
    'shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_4px_12px_-2px_rgba(16,185,129,0.35)]',
    'ring-1 ring-inset ring-white/10',
    'focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2',
  ].join(' '),
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3.5 text-[13px] rounded-lg gap-1.5',
  md: 'h-10 px-5 text-sm rounded-xl gap-2',
  lg: 'h-12 px-7 text-base rounded-xl gap-2',
}

const Spinner = ({ size }: { size: ButtonSize }) => (
  <svg
    className={`animate-spin ${size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`}
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
        whileTap={isDisabled ? {} : { scale: 0.97, y: 1 }}
        whileHover={isDisabled ? {} : { y: -1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center font-semibold tracking-[-0.01em]',
          'transition-all duration-150 cursor-pointer outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none',
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
