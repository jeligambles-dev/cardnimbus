import Link from 'next/link'
import Image from 'next/image'
import { requireAuth } from '@/lib/auth-guard'
import { BackHeader } from '@/components/ui/back-header'
import { getUserConversations } from '@/services/messaging.service'
import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Messages — Card Nimbus',
}

function timeAgo(date: Date): string {
  const now = Date.now()
  const diff = now - new Date(date).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

export default async function MessagesPage() {
  const session = await requireAuth()
  const { conversations } = await getUserConversations(session.user.id, 1, 50)

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BackHeader title="Messages" crumbs={[{ label: "Marketplace Account", href: "/marketplace/account" }]} />
        <h1 className="hidden text-3xl font-bold text-text-primary mb-8 tracking-tight">Messages</h1>

        {conversations.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-text-muted text-sm">No conversations yet.</p>
            <Link
              href="/marketplace"
              className="mt-4 inline-block text-nimbus-600 text-sm hover:underline"
            >
              Browse the marketplace to start a conversation
            </Link>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const other = conv.otherParty
              const last = conv.lastMessage
              const hasUnread = conv.unreadCount > 0

              return (
                <Link key={conv.id} href={`/account/messages/${conv.id}`}>
                  <Card
                    hover
                    className={[
                      'p-4 flex items-start gap-4',
                      hasUnread ? 'border-nimbus-300' : '',
                    ].join(' ')}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0 w-11 h-11 rounded-full overflow-hidden bg-surface-overlay border border-surface-border">
                      {other?.avatar ? (
                        <Image
                          src={other.avatar}
                          alt={other.name ?? 'User'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-nimbus-600">
                          {(other?.name ?? '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={[
                          'text-sm font-semibold truncate',
                          hasUnread ? 'text-text-primary' : 'text-text-secondary',
                        ].join(' ')}>
                          {other?.name ?? 'Unknown User'}
                        </span>
                        <span className="shrink-0 text-xs text-text-muted">
                          {last ? timeAgo(last.createdAt) : ''}
                        </span>
                      </div>

                      {conv.listing && (
                        <p className="text-xs text-nimbus-600 truncate mt-0.5">
                          Re: {conv.listing.title}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className={[
                          'text-sm truncate',
                          hasUnread ? 'text-text-primary font-medium' : 'text-text-muted',
                        ].join(' ')}>
                          {last?.content ?? 'No messages yet'}
                        </p>
                        {hasUnread && (
                          <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-nimbus-500 text-[10px] font-bold text-white">
                            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
