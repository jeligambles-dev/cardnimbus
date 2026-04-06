'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

function notificationIcon(type: string): string {
  const icons: Record<string, string> = {
    ORDER_CONFIRMED: '✅',
    ORDER_SHIPPED: '🚚',
    ORDER_DELIVERED: '📦',
    SECURITY_ALERT: '🔒',
    SYSTEM: '🔔',
  }
  return icons[type] ?? '🔔'
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/notifications?page=1')
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications ?? [])
          setUnreadCount(data.unreadCount ?? 0)
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function markAllRead() {
    setMarkingAll(true)
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      // ignore
    } finally {
      setMarkingAll(false)
    }
  }

  async function markOneRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
    setUnreadCount((c) => Math.max(0, c - 1))
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' }).catch(() => {})
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <Link href="/account" className="hover:text-text-primary transition-colors">
                Account
              </Link>
              <span className="text-surface-border">/</span>
            </div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <Badge variant="nimbus">{unreadCount} unread</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              loading={markingAll}
            >
              Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-nimbus-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-text-secondary text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-5xl mb-4">🔔</div>
            <p className="text-text-primary font-semibold text-lg mb-2">No notifications</p>
            <p className="text-text-secondary text-sm">
              You&apos;re all caught up! We&apos;ll notify you when something important happens.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const cardContent = (
                <Card
                  className={[
                    'p-4 transition-colors',
                    !notification.isRead ? 'border-nimbus-300 bg-nimbus-50/30' : '',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0 mt-0.5">
                      {notificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={[
                            'font-semibold text-sm',
                            notification.isRead ? 'text-text-secondary' : 'text-text-primary',
                          ].join(' ')}
                        >
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                void markOneRead(notification.id)
                              }}
                              className="text-xs text-nimbus-600 hover:text-nimbus-700 transition-colors"
                            >
                              Mark read
                            </button>
                          )}
                          <span className="text-xs text-text-muted">
                            {new Date(notification.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="text-text-secondary text-sm mt-0.5">{notification.message}</p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-nimbus-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </Card>
              )

              if (notification.link) {
                return (
                  <Link
                    key={notification.id}
                    href={notification.link}
                    onClick={() => {
                      if (!notification.isRead) void markOneRead(notification.id)
                    }}
                  >
                    {cardContent}
                  </Link>
                )
              }

              return <div key={notification.id}>{cardContent}</div>
            })}
          </div>
        )}
      </div>
    </main>
  )
}
