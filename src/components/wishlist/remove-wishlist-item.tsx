'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/toast'

interface RemoveWishlistItemProps {
  wishlistId: string
}

export function RemoveWishlistItem({ wishlistId }: RemoveWishlistItemProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleRemove = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/wishlist/${wishlistId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove item')
      toast('Removed from wishlist', 'info')
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to remove', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={loading}
      className="rounded-lg border border-red-800/40 bg-red-950/30 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-950/60 disabled:opacity-50"
    >
      {loading ? 'Removing...' : 'Remove'}
    </button>
  )
}
