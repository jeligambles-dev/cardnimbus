'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from '@/components/ui/toast'
import { Spinner } from '@/components/ui/spinner'

// Notification types and their display config
const NOTIFICATION_TYPES = [
  {
    type: 'ORDER_CONFIRMED',
    label: 'Order Confirmed',
    description: 'When your order is placed and payment is received.',
  },
  {
    type: 'PRICE_DROP',
    label: 'Price Drop Alerts',
    description: 'When a wishlisted item drops in price.',
  },
  {
    type: 'SUBMISSION_STATUS',
    label: 'Submission Updates',
    description: 'Updates on your card submission status and offers.',
  },
  {
    type: 'BADGE_EARNED',
    label: 'Badge Earned',
    description: 'When you earn a new badge or achievement.',
  },
  {
    type: 'SECURITY_ALERT',
    label: 'Security Alerts',
    description: 'Login attempts, password changes, and security events.',
    alwaysOn: true,
  },
]

const CHANNELS = [
  { key: 'IN_APP', label: 'In-App' },
  { key: 'EMAIL', label: 'Email' },
]

type PrefMap = Record<string, Record<string, boolean>>

function buildDefaultPrefs(): PrefMap {
  const map: PrefMap = {}
  for (const { type } of NOTIFICATION_TYPES) {
    map[type] = { IN_APP: true, EMAIL: true }
  }
  return map
}

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<PrefMap>(buildDefaultPrefs())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/notifications/preferences')
      .then((r) => r.json())
      .then((data: { eventType: string; channel: string; enabled: boolean }[]) => {
        if (!Array.isArray(data)) return
        const map: PrefMap = buildDefaultPrefs()
        for (const pref of data) {
          if (!map[pref.eventType]) map[pref.eventType] = {}
          map[pref.eventType][pref.channel] = pref.enabled
        }
        setPrefs(map)
      })
      .catch(() => {/* use defaults */})
      .finally(() => setLoading(false))
  }, [])

  const togglePref = async (eventType: string, channel: string, newValue: boolean) => {
    const key = `${eventType}:${channel}`
    setSaving(key)
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, channel, enabled: newValue }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to save preference')
      }
      setPrefs((prev) => ({
        ...prev,
        [eventType]: { ...prev[eventType], [channel]: newValue },
      }))
      toast('Preference saved', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save', 'error')
    } finally {
      setSaving(null)
    }
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/account" className="hover:text-text-primary transition-colors">Account</Link>
          <span>/</span>
          <span className="text-text-primary">Notification Settings</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Notification Settings</h1>
          <p className="mt-1 text-text-secondary">
            Choose how and where you receive notifications.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface-raised">
            {/* Channel header */}
            <div className="grid border-b border-surface-border bg-surface-overlay px-5 py-3" style={{ gridTemplateColumns: '1fr repeat(2, 80px)' }}>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Notification</span>
              {CHANNELS.map((ch) => (
                <span key={ch.key} className="text-center text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {ch.label}
                </span>
              ))}
            </div>

            <ul className="divide-y divide-surface-border">
              {NOTIFICATION_TYPES.map(({ type, label, description, alwaysOn }) => (
                <li key={type} className="grid items-center gap-4 px-5 py-4" style={{ gridTemplateColumns: '1fr repeat(2, 80px)' }}>
                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-text-primary">{label}</p>
                      {alwaysOn && (
                        <span className="rounded-full border border-amber-700/50 bg-amber-950/40 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                          Always On
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-text-muted">{description}</p>
                  </div>

                  {/* Toggles per channel */}
                  {CHANNELS.map((ch) => {
                    const isEnabled = prefs[type]?.[ch.key] ?? true
                    const isSaving = saving === `${type}:${ch.key}`
                    const disabled = alwaysOn || isSaving

                    return (
                      <div key={ch.key} className="flex items-center justify-center">
                        {isSaving ? (
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-nimbus-500 border-t-transparent" />
                        ) : (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isEnabled}
                            disabled={disabled}
                            onClick={() => !disabled && void togglePref(type, ch.key, !isEnabled)}
                            className={[
                              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none',
                              isEnabled
                                ? disabled
                                  ? 'border-amber-600/50 bg-amber-600/30 cursor-not-allowed'
                                  : 'border-nimbus-600 bg-nimbus-500'
                                : 'border-surface-border bg-surface-overlay',
                              disabled && !isEnabled ? 'cursor-not-allowed opacity-50' : '',
                            ].join(' ')}
                          >
                            <span
                              className={[
                                'pointer-events-none inline-block h-3.5 w-3.5 translate-y-[-0.5px] rounded-full shadow-sm ring-0 transition-transform duration-200',
                                isEnabled ? 'translate-x-3.5 bg-white' : 'translate-x-0 bg-text-muted',
                              ].join(' ')}
                            />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 text-xs text-text-muted">
          Security alert notifications cannot be disabled for account safety.
        </p>
      </div>
    </main>
  )
}
