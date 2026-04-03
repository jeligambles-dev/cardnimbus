'use client'

import { useState } from 'react'
import { toast } from '@/components/ui/toast'

interface WishlistButtonProps {
  productId: string
  initialInWishlist?: boolean
  className?: string
}

export function WishlistButton({
  productId,
  initialInWishlist = false,
  className = '',
}: WishlistButtonProps) {
  const [inWishlist, setInWishlist] = useState(initialInWishlist)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    try {
      if (inWishlist) {
        const res = await fetch(`/api/wishlist?productId=${productId}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to remove from wishlist')
        setInWishlist(false)
        toast('Removed from wishlist', 'info')
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
        if (!res.ok) throw new Error('Failed to add to wishlist')
        setInWishlist(true)
        toast('Added to wishlist', 'success')
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Action failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      className={[
        'flex items-center justify-center rounded-xl border transition-colors',
        inWishlist
          ? 'border-red-700/50 bg-red-950/40 text-red-400 hover:bg-red-950/70'
          : 'border-surface-border bg-surface-overlay text-text-muted hover:border-red-700/40 hover:text-red-400',
        loading ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ].join(' ')}
    >
      <svg
        className="h-5 w-5"
        fill={inWishlist ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={inWishlist ? 0 : 1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  )
}
