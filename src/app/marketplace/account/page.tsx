import Link from 'next/link'
import { requireAuth } from '@/lib/auth-guard'
import { Card } from '@/components/ui/card'
import { AvatarUpload } from '@/components/account/avatar-upload'
import { CountryEditor } from '@/components/account/country-editor'
import { BackHeader } from '@/components/ui/back-header'
import { db } from '@/lib/db'

export const metadata = {
  title: 'Marketplace Account — Card Nimbus',
}

export default async function MarketplaceAccountPage() {
  const session = await requireAuth()
  const user = session.user
  const role = (user as { role?: string }).role
  const isSeller = role === 'SELLER' || role === 'ADMIN'
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { avatar: true, name: true, email: true, country: true },
  })

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BackHeader title="Marketplace Account" crumbs={[{ label: "Marketplace", href: "/marketplace" }]} />
        <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight hidden md:block">
          Marketplace Account
        </h1>
        <p className="text-text-secondary text-sm mb-8">
          P2P purchases, bookmarks, followed sellers, and seller tools.
        </p>

        {/* Profile */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between gap-5 flex-wrap">
            <AvatarUpload
              currentAvatar={dbUser?.avatar ?? user.image ?? null}
              userName={dbUser?.name ?? user.name ?? ''}
              userEmail={dbUser?.email ?? user.email}
            />
            <div className="text-right">
              <p className="text-xl font-bold text-text-primary">{dbUser?.name ?? user.name ?? 'Anonymous'}</p>
              <p className="text-text-secondary text-sm">{dbUser?.email ?? user.email}</p>
              {isSeller && (
                <span className="mt-1 inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
                  SELLER
                </span>
              )}
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-surface-border">
            <CountryEditor initialCountry={dbUser?.country ?? null} />
          </div>
        </Card>

        {/* Buying section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-3">Buying</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/account/orders">
              <Card hover className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-300 flex items-center justify-center text-2xl">
                    🧾
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">My Purchases</p>
                    <p className="text-text-secondary text-sm">Marketplace orders you&apos;ve placed</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/account/offers">
              <Card hover className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-300 flex items-center justify-center text-2xl">
                    🤝
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">My Offers</p>
                    <p className="text-text-secondary text-sm">Track offers you&apos;ve made</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/account/likes">
              <Card hover className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-300 flex items-center justify-center text-2xl">
                    🔖
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">Bookmarked Listings</p>
                    <p className="text-text-secondary text-sm">Listings you&apos;ve saved</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/account/following">
              <Card hover className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-300 flex items-center justify-center text-2xl">
                    👥
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">Following</p>
                    <p className="text-text-secondary text-sm">Sellers you track</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/account/messages">
              <Card hover className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-300 flex items-center justify-center text-2xl">
                    💬
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">Messages</p>
                    <p className="text-text-secondary text-sm">Chat with sellers</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/account/disputes">
              <Card hover className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-300 flex items-center justify-center text-2xl">
                    ⚖️
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">Disputes</p>
                    <p className="text-text-secondary text-sm">Manage order issues</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Selling section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-3">Selling</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/sell">
              <Card hover className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-300 flex items-center justify-center text-2xl">
                    ➕
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">List an Item</p>
                    <p className="text-text-secondary text-sm">Create a new listing</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/sell/offers">
              <Card hover className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-300 flex items-center justify-center text-2xl">
                    📩
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">Incoming Offers</p>
                    <p className="text-text-secondary text-sm">Offers from buyers on your listings</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/sell/listings">
              <Card hover className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-300 flex items-center justify-center text-2xl">
                    📋
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">My Listings</p>
                    <p className="text-text-secondary text-sm">Active and sold listings</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/sell/orders">
              <Card hover className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-300 flex items-center justify-center text-2xl">
                    💰
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">Sales & Payouts</p>
                    <p className="text-text-secondary text-sm">What you&apos;ve sold and earned</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/sell/reviews">
              <Card hover className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-300 flex items-center justify-center text-2xl">
                    ⭐
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">Reviews Received</p>
                    <p className="text-text-secondary text-sm">Buyer feedback on your sales</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Link back to shop account */}
        <Link href="/account">
          <Card hover className="p-5 bg-gradient-to-r from-nimbus-50 to-white border-2 border-nimbus-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-nimbus-500 flex items-center justify-center text-xl">
                  🃏
                </div>
                <div>
                  <p className="font-bold text-text-primary">Shop Account</p>
                  <p className="text-text-secondary text-sm">Store orders, wishlist, submissions</p>
                </div>
              </div>
              <span className="text-nimbus-600 font-bold">→</span>
            </div>
          </Card>
        </Link>
      </div>
    </main>
  )
}
