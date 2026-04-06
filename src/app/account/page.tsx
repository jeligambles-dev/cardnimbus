import Link from 'next/link'
import { requireAuth } from '@/lib/auth-guard'
import { Card } from '@/components/ui/card'
import { AvatarUpload } from '@/components/account/avatar-upload'
import { CountryEditor } from '@/components/account/country-editor'
import { BackHeader } from '@/components/ui/back-header'
import { db } from '@/lib/db'

export const metadata = {
  title: 'My Account — Card Nimbus',
}

export default async function AccountPage() {
  const session = await requireAuth()
  const user = session.user
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { avatar: true, name: true, email: true, country: true },
  })

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BackHeader title="My Account" crumbs={[{ label: "Home", href: "/" }]} />
        <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight hidden md:block">
          My Account
        </h1>
        <p className="text-text-secondary text-sm mb-8">
          Shop orders, wishlist, submissions, and preferences.
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
              {(user as { role?: string }).role && (
                <span className="mt-1 inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-nimbus-50 text-nimbus-600 border border-nimbus-300">
                  {(user as { role?: string }).role}
                </span>
              )}
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-surface-border">
            <CountryEditor initialCountry={dbUser?.country ?? null} />
          </div>
        </Card>

        {/* Shop Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/account/orders">
            <Card hover className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-nimbus-500/15 border border-nimbus-300 flex items-center justify-center text-2xl">
                  📦
                </div>
                <div>
                  <p className="font-bold text-text-primary">Shop Orders</p>
                  <p className="text-text-secondary text-sm">Track and manage your store orders</p>
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
                  <p className="text-text-secondary text-sm">Products you want to track</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/sell-your-cards/submissions">
            <Card hover className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-nimbus-500/15 border border-nimbus-300 flex items-center justify-center text-2xl">
                  📬
                </div>
                <div>
                  <p className="font-bold text-text-primary">Sell Cards to Us</p>
                  <p className="text-text-secondary text-sm">Check offers on cards you&apos;ve sent in</p>
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
        </div>

        {/* Link to marketplace account */}
        <div className="mt-8">
          <Link href="/marketplace/account">
            <Card hover className="p-5 bg-gradient-to-r from-emerald-50 to-white border-2 border-emerald-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-xl">
                    🏪
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">Marketplace Account</p>
                    <p className="text-text-secondary text-sm">Liked listings, followed sellers, messages, disputes</p>
                  </div>
                </div>
                <span className="text-emerald-600 font-bold">→</span>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  )
}
