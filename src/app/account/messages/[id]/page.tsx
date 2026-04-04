'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Message {
  id: string
  content: string
  senderId: string
  isRead: boolean
  createdAt: string
  sender: {
    id: string
    name: string | null
    avatar: string | null
  }
}

interface ConversationMeta {
  id: string
  listingId: string | null
  listing: { id: string; title: string; images: string[]; price: number } | null
  buyer: { id: string; name: string | null; avatar: string | null }
  seller: { id: string; name: string | null; avatar: string | null }
  buyerId: string
  sellerId: string
}

export default function ChatThreadPage() {
  const params = useParams<{ id: string }>()
  const conversationId = params.id
  const { data: session, status } = useSession()
  const router = useRouter()

  const [messages, setMessages] = useState<Message[]>([])
  const [meta, setMeta] = useState<ConversationMeta | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const userId = (session?.user as { id?: string })?.id

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const markRead = useCallback(async () => {
    try {
      await fetch(`/api/conversations/${conversationId}/read`, { method: 'POST' })
    } catch {
      // best-effort
    }
  }, [conversationId])

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages?limit=100`)
      if (res.status === 401) {
        router.push('/login')
        return
      }
      if (!res.ok) return
      const data = await res.json()
      setMessages(data.messages ?? [])
    } catch {
      // network error — silently ignore during polling
    }
  }, [conversationId, router])

  const fetchMeta = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`)
      if (!res.ok) return
      const data = await res.json()
      setMeta(data)
    } catch {
      // ignore
    }
  }, [conversationId])

  // Initial load
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status !== 'authenticated') return

    setLoading(true)
    Promise.all([fetchMessages(), fetchMeta()]).then(() => {
      setLoading(false)
      markRead()
    })
  }, [status, router, fetchMessages, fetchMeta, markRead])

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Poll every 5s
  useEffect(() => {
    if (status !== 'authenticated') return

    pollingRef.current = setInterval(() => {
      fetchMessages().then(() => markRead())
    }, 5_000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [status, fetchMessages, markRead])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setSending(true)
    setInput('')
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      if (res.ok) {
        await fetchMessages()
        markRead()
      } else {
        setInput(text)
      }
    } catch {
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  const otherParty = meta
    ? userId === meta.buyerId
      ? meta.seller
      : meta.buyer
    : null

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-nimbus-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <main className="flex flex-col h-screen bg-surface">
      {/* Header */}
      <div className="shrink-0 border-b border-surface-border bg-surface-raised px-4 py-3 flex items-center gap-3">
        <Link
          href="/account/messages"
          className="text-text-muted hover:text-text-primary mr-1"
          aria-label="Back to messages"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        {otherParty && (
          <>
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface-overlay border border-surface-border">
              {otherParty.avatar ? (
                <Image
                  src={otherParty.avatar}
                  alt={otherParty.name ?? 'User'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-nimbus-600">
                  {(otherParty.name ?? '?').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {otherParty.name ?? 'Unknown User'}
              </p>
              {meta?.listing && (
                <p className="text-xs text-nimbus-600 truncate">
                  Re:{' '}
                  <Link href={`/marketplace/${meta.listing.id}`} className="hover:underline">
                    {meta.listing.title}
                  </Link>
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-text-muted py-8">
            No messages yet. Say hello!
          </p>
        )}

        {messages.map((msg) => {
          const isOwn = msg.senderId === userId

          return (
            <div
              key={msg.id}
              className={['flex items-end gap-2', isOwn ? 'flex-row-reverse' : 'flex-row'].join(' ')}
            >
              {/* Avatar — only for other party */}
              {!isOwn && (
                <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-surface-overlay border border-surface-border">
                  {msg.sender.avatar ? (
                    <Image
                      src={msg.sender.avatar}
                      alt={msg.sender.name ?? 'User'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-nimbus-600">
                      {(msg.sender.name ?? '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              )}

              {/* Bubble */}
              <div
                className={[
                  'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
                  isOwn
                    ? 'bg-nimbus-500 text-white rounded-br-sm'
                    : 'bg-surface-overlay text-text-primary border border-surface-border rounded-bl-sm',
                ].join(' ')}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={['mt-1 text-[10px]', isOwn ? 'text-nimbus-200' : 'text-text-muted'].join(' ')}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="shrink-0 border-t border-surface-border bg-surface-raised px-4 py-3 flex items-end gap-3"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend(e as unknown as React.FormEvent)
            }
          }}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-surface-border bg-surface-overlay px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-nimbus-500 focus:border-nimbus-500"
          style={{ maxHeight: '120px' }}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-nimbus-500 text-white shadow-lg shadow-nimbus-500/25 transition-colors hover:bg-nimbus-600 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          {sending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          )}
        </button>
      </form>
    </main>
  )
}
