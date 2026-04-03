'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignupPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; general?: string }>({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const next: typeof errors = {}
    if (!name.trim()) next.name = 'Name is required'
    if (!email.trim()) next.email = 'Email is required'
    if (password.length < 12) next.password = 'Password must be at least 12 characters'
    return next
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrors({ general: data.error ?? 'Something went wrong. Please try again.' })
        return
      }

      router.push('/login?registered=true')
    } catch {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-surface-raised border border-surface-border rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-1">Create Account</h1>
            <p className="text-sm text-nimbus-400 font-medium">
              Get 5% off your first purchase
            </p>
          </div>

          {/* General error */}
          {errors.general && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              type="text"
              placeholder="Ash Ketchum"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              required
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="At least 12 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
              autoComplete="new-password"
              minLength={12}
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Create Account
            </Button>
          </form>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-nimbus-400 hover:text-nimbus-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
