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

        {/* Email Templates */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold text-text-primary mb-1">Email Templates</h2>
          <p className="text-sm text-text-muted mb-6">
            Customize offer notification emails. Use {'{{variables}}'} — they&apos;re replaced with actual values.
          </p>
          <div className="space-y-6">
            <EmailTemplate
              title="Offer Received (to seller)"
              vars="{{listingTitle}}, {{amount}}, {{offersUrl}}"
              subjectKey="email.offer_received.subject"
              bodyKey="email.offer_received.body"
              defaultSubject='New offer on {{listingTitle}}'
              defaultBody='You received an offer of {{amount}} on your listing "{{listingTitle}}". Review it and respond to the buyer.'
              settings={settings}
              onSave={updateSetting}
              saving={saving}
            />
            <EmailTemplate
              title="Offer Accepted (to buyer)"
              vars="{{listingTitle}}, {{amount}}, {{offersUrl}}"
              subjectKey="email.offer_accepted.subject"
              bodyKey="email.offer_accepted.body"
              defaultSubject='Your offer on {{listingTitle}} was accepted!'
              defaultBody='Great news! The seller accepted your offer of {{amount}} on "{{listingTitle}}". Complete the purchase to secure the item.'
              settings={settings}
              onSave={updateSetting}
              saving={saving}
            />
            <EmailTemplate
              title="Offer Rejected (to buyer)"
              vars="{{listingTitle}}, {{marketplaceUrl}}"
              subjectKey="email.offer_rejected.subject"
              bodyKey="email.offer_rejected.body"
              defaultSubject='Your offer on {{listingTitle}} was declined'
              defaultBody='Unfortunately, the seller declined your offer on "{{listingTitle}}". Browse the marketplace for more items.'
              settings={settings}
              onSave={updateSetting}
              saving={saving}
            />
            <EmailTemplate
              title="Counter Offer (to buyer)"
              vars="{{listingTitle}}, {{counterAmount}}, {{offersUrl}}"
              subjectKey="email.offer_countered.subject"
              bodyKey="email.offer_countered.body"
              defaultSubject='Counter offer on {{listingTitle}}'
              defaultBody='The seller countered with {{counterAmount}} on "{{listingTitle}}". Review the counter offer and decide.'
              settings={settings}
              onSave={updateSetting}
              saving={saving}
            />
          </div>
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

// ─── Email Template Editor ──────────────────────────────────────────────────

function EmailTemplate({
  title,
  vars,
  subjectKey,
  bodyKey,
  defaultSubject,
  defaultBody,
  settings,
  onSave,
  saving,
}: {
  title: string
  vars: string
  subjectKey: string
  bodyKey: string
  defaultSubject: string
  defaultBody: string
  settings: SettingsMap
  onSave: (key: string, value: string) => Promise<void>
  saving: string | null
}) {
  const [expanded, setExpanded] = useState(false)
  const [subject, setSubject] = useState(settings[subjectKey] ?? '')
  const [body, setBody] = useState(settings[bodyKey] ?? '')

  const hasCustom = !!settings[subjectKey] || !!settings[bodyKey]

  async function save() {
    await onSave(subjectKey, subject || defaultSubject)
    await onSave(bodyKey, body || defaultBody)
  }

  async function reset() {
    await onSave(subjectKey, defaultSubject)
    await onSave(bodyKey, defaultBody)
    setSubject(defaultSubject)
    setBody(defaultBody)
  }

  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-overlay transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary">{title}</span>
          {hasCustom && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Custom
            </span>
          )}
        </div>
        <svg
          className={`h-4 w-4 text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-surface-border p-4 space-y-3">
          <p className="text-xs text-text-muted">
            Variables: <code className="text-nimbus-600">{vars}</code>
          </p>
          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1">Subject</label>
            <input
              value={subject || defaultSubject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm outline-none focus:border-nimbus-500 focus:ring-2 focus:ring-nimbus-500/20"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1">Body</label>
            <textarea
              value={body || defaultBody}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm outline-none resize-none focus:border-nimbus-500 focus:ring-2 focus:ring-nimbus-500/20"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving !== null}
              className="rounded-lg bg-nimbus-500 px-4 py-2 text-xs font-bold text-white hover:bg-nimbus-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Template'}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={saving !== null}
              className="rounded-lg border border-surface-border bg-white px-4 py-2 text-xs font-bold text-text-secondary hover:bg-surface-overlay transition-colors disabled:opacity-50"
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
