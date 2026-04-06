'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 7) {
      setError('Password must be at least 7 characters')
      return
    }
    if (!/\d/.test(password)) {
      setError('Password must include a number')
      return
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      setError('Password must include a special character')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }
      setDone(true)
      setTimeout(() => router.push('/login?reset=success'), 2000)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-surface-border bg-surface-raised p-8 shadow-2xl text-center">
          <h1 className="text-xl font-bold text-text-primary mb-2">Invalid link</h1>
          <p className="text-sm text-text-muted mb-4">
            This password reset link is missing a token.
          </p>
          <Link href="/login" className="text-nimbus-600 hover:text-nimbus-700 font-medium">
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-surface-border bg-surface-raised p-8 shadow-2xl text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Password reset!</h1>
          <p className="text-sm text-text-muted">Redirecting to login…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-surface-border bg-surface-raised p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-1">Set new password</h1>
          <p className="text-sm text-text-muted">Enter a new password for your account.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New password"
            type="password"
            placeholder="At least 12 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={12}
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="Re-enter password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
            Reset Password
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          <Link href="/login" className="text-nimbus-600 hover:text-nimbus-700 font-medium">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
