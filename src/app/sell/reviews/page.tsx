import Link from 'next/link'
import { requireAuth } from '@/lib/auth-guard'
import { BackHeader } from '@/components/ui/back-header'
import { getOrCreateSellerProfile } from '@/services/seller.service'
import { getReviewsForUser } from '@/services/review.service'
import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Reviews — Card Nimbus',
}

interface ReviewsPageProps {
  searchParams: Promise<{ page?: string }>
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-amber-400' : 'text-surface-border'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.953c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.953a1 1 0 00-.364-1.118L2.062 9.38c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.287-3.953z" />
        </svg>
      ))}
    </span>
  )
}

export default async function SellerReviewsPage({ searchParams }: ReviewsPageProps) {
  const session = await requireAuth()
  const userId = (session.user as { id: string }).id

  let profile
  try {
    profile = await getOrCreateSellerProfile(userId)
  } catch {
    notFound()
  }

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  // Reviews received as a seller
  const { reviews, total, totalPages } = await getReviewsForUser(userId, page, 20)

  // Orders awaiting seller-to-buyer review
  const pendingReviewOrders = await db.order.findMany({
    where: {
      items: { some: { sellerId: profile.id } },
      status: 'DELIVERED',
      reviews: {
        none: { type: 'SELLER_TO_BUYER' },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
    include: {
      buyer: { select: { id: true, name: true, avatar: true } },
    },
  })

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BackHeader title="Reviews" crumbs={[{ label: "Marketplace Account", href: "/marketplace/account" }]} />
        {/* Header */}
        <div className="mb-8">
          <h1 className="hidden text-2xl font-bold text-text-primary">Reviews</h1>
          <p className="text-sm text-text-muted mt-1">
            Reviews you&apos;ve received and orders awaiting your review.
          </p>
        </div>

        {/* Pending Reviews to Leave */}
        {pendingReviewOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Leave a Review
              <span className="ml-2 text-xs bg-nimbus-100 text-nimbus-600 border border-nimbus-400 rounded-full px-2 py-0.5">
                {pendingReviewOrders.length}
              </span>
            </h2>
            <div className="space-y-3">
              {pendingReviewOrders.map((order) => {
                const buyer = order.buyer as { id: string; name: string | null }
                return (
                  <Card key={order.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          Buyer: {buyer.name ?? 'Anonymous'}
                        </p>
                      </div>
                      <Link
                        href={`/account/orders/${order.id}?review=1`}
                        className="px-3 py-1.5 rounded-lg bg-nimbus-500 text-white text-xs font-semibold hover:bg-nimbus-600 transition-colors"
                      >
                        Leave Review
                      </Link>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Reviews Received */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Reviews Received
            </h2>
            {profile.rating !== null && (
              <div className="flex items-center gap-2">
                <StarDisplay rating={Math.round(profile.rating)} />
                <span className="text-sm text-text-secondary">
                  {profile.rating.toFixed(1)} ({profile.ratingCount})
                </span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-text-muted">No reviews yet.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const reviewer = review.reviewer as { id: string; name: string | null; avatar: string | null }
                return (
                  <Card key={review.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-overlay border border-surface-border flex items-center justify-center text-sm font-bold text-nimbus-600 flex-shrink-0">
                          {(reviewer.name ?? 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {reviewer.name ?? 'Anonymous Buyer'}
                          </p>
                          <p className="text-xs text-text-muted">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              dateStyle: 'medium',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StarDisplay rating={review.rating} />
                        <Badge
                          variant={review.moderationStatus === 'APPROVED' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {review.moderationStatus === 'PENDING' ? 'Under Review' : review.moderationStatus}
                        </Badge>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </Card>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-3">
              {page > 1 && (
                <a
                  href={`/sell/reviews?page=${page - 1}`}
                  className="px-4 py-2 text-sm rounded-xl bg-surface-overlay border border-surface-border text-text-primary hover:bg-surface-border transition-colors"
                >
                  Previous
                </a>
              )}
              <span className="text-sm text-text-secondary">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={`/sell/reviews?page=${page + 1}`}
                  className="px-4 py-2 text-sm rounded-xl bg-surface-overlay border border-surface-border text-text-primary hover:bg-surface-border transition-colors"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
