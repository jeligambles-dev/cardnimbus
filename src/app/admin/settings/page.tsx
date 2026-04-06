'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'

interface SettingsMap {
  [key: string]: string
}

function Toggle({
  enabled,
  onChange,
  loading,
}: {
  enabled: boolean
  onChange: (v: boolean) => void
  loading: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      disabled={loading}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
        enabled ? 'bg-emerald-500' : 'bg-surface-border'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg transform transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        setSettings(data.settings ?? {})
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function updateSetting(key: string, value: string) {
    setSaving(key)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      if (res.ok) {
        setSettings((prev) => ({ ...prev, [key]: value }))
      }
    } finally {
      setSaving(null)
    }
  }

  const stripeEnabled = settings['payments.stripe.enabled'] === 'true'
  const paypalEnabled = settings['payments.paypal.enabled'] === 'true'

  if (loading) {
    return (
      <main className="min-h-screen bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="h-8 w-48 bg-surface-overlay rounded animate-pulse mb-8" />
          <div className="h-64 bg-surface-overlay rounded-xl animate-pulse" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-sm text-text-muted mt-1">Configure your store</p>
        </div>

        {/* Payment Gateways */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold text-text-primary mb-1">Payment Gateways</h2>
          <p className="text-sm text-text-muted mb-6">
            Enable or disable payment methods available at checkout.
            API keys are configured via environment variables.
          </p>

          <div className="space-y-4">
            {/* Stripe */}
            <div className="flex items-center justify-between gap-4 rounded-xl border border-surface-border bg-surface-raised p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#635BFF]/10 text-2xl">
                  💳
                </div>
                <div>
                  <p className="font-semibold text-text-primary">Stripe</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Credit/debit cards · {stripeEnabled ? (
                      <span className="text-emerald-600 font-semibold">Active</span>
                    ) : (
                      <span className="text-text-muted">Disabled</span>
                    )}
                  </p>
                  <p className="text-[10px] text-text-muted mt-1">
                    Env: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY
                  </p>
                </div>
              </div>
              <Toggle
                enabled={stripeEnabled}
                onChange={(v) => updateSetting('payments.stripe.enabled', v ? 'true' : 'false')}
                loading={saving === 'payments.stripe.enabled'}
              />
            </div>

            {/* PayPal */}
            <div className="flex items-center justify-between gap-4 rounded-xl border border-surface-border bg-surface-raised p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0070BA]/10 text-2xl">
                  🅿️
                </div>
                <div>
                  <p className="font-semibold text-text-primary">PayPal</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    PayPal account · {paypalEnabled ? (
                      <span className="text-emerald-600 font-semibold">Active</span>
                    ) : (
                      <span className="text-text-muted">Disabled</span>
                    )}
                  </p>
                  <p className="text-[10px] text-text-muted mt-1">
                    Env: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET
                  </p>
                </div>
              </div>
              <Toggle
                enabled={paypalEnabled}
                onChange={(v) => updateSetting('payments.paypal.enabled', v ? 'true' : 'false')}
                loading={saving === 'payments.paypal.enabled'}
              />
            </div>
          </div>

          {!stripeEnabled && !paypalEnabled && (
            <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              ⚠️ No payment methods are enabled. Customers will not be able to check out.
            </div>
          )}
        </Card>

        {/* Environment info */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-text-primary mb-1">Environment</h2>
          <p className="text-sm text-text-muted mb-4">
            API keys and secrets are managed via environment variables for security.
            Update them in your hosting provider (e.g. Railway).
          </p>
          <div className="rounded-lg bg-surface-overlay p-4 text-xs font-mono text-text-muted space-y-1">
            <p>STRIPE_SECRET_KEY=sk_***</p>
            <p>STRIPE_PUBLISHABLE_KEY=pk_***</p>
            <p>STRIPE_WEBHOOK_SECRET=whsec_***</p>
            <p className="mt-2">PAYPAL_CLIENT_ID=***</p>
            <p>PAYPAL_CLIENT_SECRET=***</p>
            <p>PAYPAL_MODE=sandbox | live</p>
          </div>
        </Card>
      </div>
    </main>
  )
}
