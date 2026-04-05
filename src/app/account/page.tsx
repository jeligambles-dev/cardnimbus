import Link from 'next/link'
import Image from 'next/image'
import { requireAuth } from '@/lib/auth-guard'
import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'My Account — Card Nimbus',
}

export default async function AccountPage() {
  const session = await requireAuth()
  const user = session.user
  const isSeller = (user as { role?: string }).role === 'SELLER' || (user as { role?: string }).role === 'ADMIN'

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-text-primary mb-8 tracking-tight">My Account</h1>

        {/* Profile */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-surface-overlay border border-surface-border flex-shrink-0">
              {user.image ? (
                <Image src={user.image} alt={user.name ?? 'Avatar'} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-nimbus-600">
                  {(user.name ?? user.email).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">{user.name ?? 'Anonymous'}</p>
              <p className="text-text-secondary text-sm">{user.email}</p>
              {(user as { role?: string }).role && (
                <span className="mt-1 inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-nimbus-50 text-nimbus-600 border border-nimbus-300">
                  {(user as { role?: string }).role}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/account/orders">
            <Card hover className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-nimbus-500/15 border border-nimbus-300 flex items-center justify-center text-2xl">
                  📦
                </div>
                <div>
                  <p className="font-bold text-text-primary">Orders</p>
                  <p className="text-text-secondary text-sm">Track and manage your orders</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/account/notifications">
            <Card hover className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-nimbus-500/15 border border-nimbus-300 flex items-center justify-center text-2xl">
                  🔔
                </div>
                <div>
                  <p className="font-bold text-text-primary">Notifications</p>
                  <p className="text-text-secondary text-sm">Stay up to date on activity</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/shop">
            <Card hover className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-nimbus-500/15 border border-nimbus-300 flex items-center justify-center text-2xl">
                  🃏
                </div>
                <div>
                  <p className="font-bold text-text-primary">Shop</p>
                  <p className="text-text-secondary text-sm">Browse Pokemon cards</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/cart">
            <Card hover className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-nimbus-500/15 border border-nimbus-300 flex items-center justify-center text-2xl">
                  🛒
                </div>
                <div>
                  <p className="font-bold text-text-primary">Cart</p>
                  <p className="text-text-secondary text-sm">View and edit your cart</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/account/wishlist">
            <Card hover className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-nimbus-500/15 border border-nimbus-300 flex items-center justify-center text-2xl">
                  ❤️
                </div>
                <div>
                  <p className="font-bold text-text-primary">Wishlist</p>
                  <p className="text-text-secondary text-sm">Track cards and get price drop alerts</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/account/likes">
            <Card hover className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-nimbus-500/15 border border-nimbus-300 flex items-center justify-center text-2xl">
                  💖
                </div>
                <div>
                  <p className="font-bold text-text-primary">Liked Items</p>
                  <p className="text-text-secondary text-sm">Listings you&apos;ve saved from the marketplace</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/account/following">
            <Card hover className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-nimbus-500/15 border border-nimbus-300 flex items-center justify-center text-2xl">
                  👥
                </div>
                <div>
                  <p className="font-bold text-text-primary">Following</p>
                  <p className="text-text-secondary text-sm">Sellers you follow and their new listings</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/account/submissions">
            <Card hover className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-nimbus-500/15 border border-nimbus-300 flex items-center justify-center text-2xl">
                  📬
                </div>
                <div>
                  <p className="font-bold text-text-primary">My Submissions</p>
                  <p className="text-text-secondary text-sm">Check offers on cards you&apos;ve sent in</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/account/notification-settings">
            <Card hover className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-nimbus-500/15 border border-nimbus-300 flex items-center justify-center text-2xl">
                  ⚙️
                </div>
                <div>
                  <p className="font-bold text-text-primary">Notification Settings</p>
                  <p className="text-text-secondary text-sm">Choose how and when you hear from us</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/account/messages">
            <Card hover className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-nimbus-500/15 border border-nimbus-300 flex items-center justify-center text-2xl">
                  💬
                </div>
                <div>
                  <p className="font-bold text-text-primary">Messages</p>
                  <p className="text-text-secondary text-sm">Chat with buyers and sellers</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/account/disputes">
            <Card hover className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-nimbus-500/15 border border-nimbus-300 flex items-center justify-center text-2xl">
                  ⚖️
                </div>
                <div>
                  <p className="font-bold text-text-primary">Disputes</p>
                  <p className="text-text-secondary text-sm">Manage order disputes</p>
                </div>
              </div>
            </Card>
          </Link>

          {isSeller && (
            <Link href="/account/seller">
              <Card hover className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-nimbus-500/15 border border-nimbus-300 flex items-center justify-center text-2xl">
                    🏪
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">Seller Dashboard</p>
                    <p className="text-text-secondary text-sm">Manage your listings and earnings</p>
                  </div>
                </div>
              </Card>
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
