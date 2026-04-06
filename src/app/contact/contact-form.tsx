'use client'

import { useState } from 'react'

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const form = e.currentTarget
    const data = new FormData(form)

    const name = data.get('name') as string
    const email = data.get('email') as string
    const subject = data.get('subject') as string
    const message = data.get('message') as string

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `[Contact Form] ${subject}`,
          sourcePageUrl: '/contact',
          sourceType: 'contact_form',
          visitorId: `contact-${email}`,
          metadata: { name, email, message },
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || 'Something went wrong. Please try again.')
      }

      setStatus('success')
      form.reset()
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-sm font-semibold text-green-800 mb-1">Message sent!</p>
        <p className="text-sm text-green-700">
          We have received your message and will get back to you within one business day.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm font-medium text-nimbus-600 hover:text-nimbus-700 transition-colors"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-text-primary mb-1.5">
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            placeholder="Your name"
            className="w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-nimbus-500 focus:outline-none focus:ring-1 focus:ring-nimbus-500 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-text-primary mb-1.5">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-nimbus-500 focus:outline-none focus:ring-1 focus:ring-nimbus-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium text-text-primary mb-1.5">
          Subject
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          placeholder="What is this about?"
          className="w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-nimbus-500 focus:outline-none focus:ring-1 focus:ring-nimbus-500 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-text-primary mb-1.5">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="Tell us how we can help..."
          className="w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-nimbus-500 focus:outline-none focus:ring-1 focus:ring-nimbus-500 transition-colors resize-none"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex items-center justify-center rounded-xl bg-nimbus-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-nimbus-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
