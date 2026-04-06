import Link from 'next/link'
import { requireAuth } from '@/lib/auth-guard'
import { BackHeader } from '@/components/ui/back-header'
import { getUserWishlist } from '@/services/wishlist.service'
import { formatCurrency } from '@/lib/utils'
import { RemoveWishlistItem } from '@/components/wishlist/remove-wishlist-item'

export const metadata = {
  title: 'Wishlist — Card Nimbus',
}

function PriceChangeIndicator({ priceAtAdd, currentPrice }: { priceAtAdd: number; currentPrice: number }) {
  if (currentPrice === priceAtAdd) return null
  const dropped = currentPrice < priceAtAdd
  const pct = Math.abs(((currentPrice - priceAtAdd) / priceAtAdd) * 100).toFixed(1)

  return (
    <span
      className={[
        'inline-flex items-center gap-1 text-xs font-medium',
        dropped ? 'text-emerald-400' : 'text-red-400',
      ].join(' ')}
    >
      {dropped ? (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
        </svg>
      ) : (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
        </svg>
      )}
      {pct}%
    </span>
  )
}

export default async function WishlistPage() {
  const session = await requireAuth()
  const { items } = await getUserWishlist(session.user.id, 1, 100)

  return (
    <main className="min-h-screen bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <BackHeader title="Wishlist" crumbs={[{ label: "Account", href: "/account" }]} />
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/account" className="hover:text-text-primary transition-colors">Account</Link>
          <span>/</span>
          <span className="text-text-primary">Wishlist</span>
        </nav>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="hidden text-2xl font-bold text-text-primary">Wishlist</h1>
            <p className="mt-1 text-sm text-text-secondary">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-surface-border bg-surface-raised py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-overlay text-text-muted">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-text-primary">Your wishlist is empty</p>
              <p className="mt-1 text-sm text-text-secondary">Save items to track their prices.</p>
            </div>
            <Link
              href="/shop"
              className="rounded-xl bg-nimbus-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-nimbus-500/25 transition-colors hover:bg-nimbus-600"
            >
              Browse Shop
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const isProduct = !!item.product
              const name = item.product?.name ?? item.card?.name ?? 'Unknown Item'
              const slug = item.product?.slug
              const thumb = item.product?.images?.[0] ?? null
              const currentPrice = item.product?.price ?? item.card?.tcgPriceNM ?? null
              const priceAtAdd = item.priceAtAdd ?? null

              return (
                <li
                  key={item.id}
                  className="flex items-center gap-4 rounded-xl border border-surface-border bg-surface-raised p-4"
                >
                  {/* Thumbnail */}
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-surface-border bg-surface-overlay">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-text-muted">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {slug ? (
                      <Link
                        href={`/shop/${slug}`}
                        className="truncate font-semibold text-text-primary hover:text-nimbus-600 transition-colors"
                      >
                        {name}
                      </Link>
                    ) : (
                      <p className="truncate font-semibold text-text-primary">{name}</p>
                    )}

                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      {currentPrice != null && (
                        <span className="text-sm font-bold text-text-primary">
                          {formatCurrency(currentPrice)}
                        </span>
                      )}
                      {priceAtAdd != null && currentPrice != null && priceAtAdd !== currentPrice && (
                        <>
                          <span className="text-xs text-text-muted line-through">
                            {formatCurrency(priceAtAdd)}
                          </span>
                          <PriceChangeIndicator
                            priceAtAdd={priceAtAdd}
                            currentPrice={currentPrice}
                          />
                        </>
                      )}
                      {priceAtAdd != null && currentPrice != null && priceAtAdd === currentPrice && (
                        <span className="text-xs text-text-muted">No change</span>
                      )}
                    </div>

                    <p className="mt-0.5 text-xs text-text-muted">
                      Added {new Date(item.createdAt).toLocaleDateString()}
                      {isProduct && item.product?.condition ? ` · ${item.product.condition}` : ''}
                    </p>
                  </div>

                  {/* Remove */}
                  <RemoveWishlistItem wishlistId={item.id} />
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}
