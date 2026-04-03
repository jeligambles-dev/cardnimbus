'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function ActivateVersionButton({ versionId }: { versionId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleActivate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/mystery/versions/${versionId}/activate`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to activate version')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button size="sm" onClick={handleActivate} loading={loading}>
        Activate Version
      </Button>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}
