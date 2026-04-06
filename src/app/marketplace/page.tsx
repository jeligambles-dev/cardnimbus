import { Suspense } from 'react'
import { ProductCategory, CardCondition } from '@prisma/client'
import { getListings } from '@/services/listing.service'
import { getTrendingListings } from '@/services/trending.service'
import { ListingCard } from '@/components/marketplace/listing-card'
import { ListingFilters } from '@/components/marketplace/listing-filters'
import { TrendingSpotlight } from '@/components/marketplace/trending-spotlight'
import { CategoryShowcase } from '@/components/marketplace/category-showcase'

interface MarketplacePageProps {
  searchParams: Promise<{
    category?: string
    condition?: string
    sortBy?: string
    minPrice?: string
    maxPrice?: string
    page?: string
    view?: string
    minGrade?: string
    gradingCompany?: string
    q?: string
  }>
}

const VALID_CATEGORIES = Object.values(ProductCategory) as string[]
const VALID_CONDITIONS = Object.values(CardCondition) as string[]
const VALID_SORTS = ['newest', 'price_asc', 'price_desc', 'deal_score'] as const

export const metadata = {
  title: 'Marketplace — Card Nimbus',
  description: 'Buy Pokemon cards directly from verified sellers. Filter by category, condition, and price.',
}

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const params = await searchParams

  const rawCategory = params.category ?? ''
  const rawCondition = params.condition ?? ''
  const rawSort = params.sortBy ?? 'newest'
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined
  const view = params.view ?? ''
  const searchQuery = (params.q ?? '').trim()
  const rawMinGrade = params.minGrade ?? ''
  const rawGradingCompany = params.gradingCompany ?? ''
  const ALLOWED_GRADING_COMPANIES = ['PSA', 'BGS', 'ACE', 'CGC', 'TAG']
  const minGrade = rawMinGrade ? parseFloat(rawMinGrade) : undefined
  const gradingCompany = ALLOWED_GRADING_COMPANIES.includes(rawGradingCompany)
    ? rawGradingCompany
    : undefined

  // Show listings only if any filter, view=all, search query, or a non-default sort is set
  const hasFiltering =
    !!rawCategory ||
    !!rawCondition ||
    !!minPrice ||
    !!maxPrice ||
    !!minGrade ||
    !!gradingCompany ||
    !!searchQuery ||
    view === 'all' ||
    rawSort !== 'newest' ||
    page > 1

  const category = VALID_CATEGORIES.includes(rawCategory)
    ? (rawCategory as ProductCategory)
    : undefined

  const condition = VALID_CONDITIONS.includes(rawCondition)
    ? (rawCondition as CardCondition)
    : undefined

  // Only apply slab-specific filters when viewing slabs (or no category selected)
  const applySlabFilters = !category || category === 'SLAB'
  const [{ items, total, totalPages }, trending] = await Promise.all([
    getListings(
      {
        category,
        condition: category === 'SLAB' ? undefined : condition,
        minPrice,
        maxPrice,
        minGrade: applySlabFilters ? minGrade : undefined,
        gradingCompany: applySlabFilters ? gradingCompany : undefined,
        search: searchQuery || undefined,
      },
      page,
      20
    ),
    getTrendingListings(3),
  ])

  // Client-side sort workaround for deal_score (service returns createdAt desc by default)
  let sorted = [...items]
  if (rawSort === 'price_asc') {
    sorted.sort((a, b) => a.price - b.price)
  } else if (rawSort === 'price_desc') {
    sorted.sort((a, b) => b.price - a.price)
  } else if (rawSort === 'deal_score') {
    sorted.sort((a, b) => (b.dealScore ?? 0) - (a.dealScore ?? 0))
  }

  return (
    <main className="min-h-screen bg-surface">
      {/* Homepage: Trending + Categories, no listings grid */}
      {!hasFiltering && (
        <>
          <TrendingSpotlight listings={trending as never} />
          <CategoryShowcase />
        </>
      )}

      {hasFiltering && (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            {searchQuery
              ? <>Results for <span className="text-nimbus-600">&ldquo;{searchQuery}&rdquo;</span></>
              : 'Marketplace'}
          </h1>
          <p className="mt-1 text-text-secondary text-sm">
            {total === 0
              ? 'No listings found'
              : `${total} listing${total === 1 ? '' : 's'} available`}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Suspense fallback={null}>
            <ListingFilters
              category={rawCategory}
              condition={rawCondition}
              sortBy={rawSort}
              minPrice={params.minPrice ?? ''}
              maxPrice={params.maxPrice ?? ''}
              minGrade={rawMinGrade}
              gradingCompany={rawGradingCompany}
            />
          </Suspense>
        </div>

        {/* Grid */}
        {sorted.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-text-muted text-lg">No listings match your filters.</p>
            <p className="text-text-muted text-sm mt-2">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {sorted.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center items-center gap-3">
            {page > 1 && (
              <a
                href={`/marketplace?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
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
                href={`/marketplace?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
                className="px-4 py-2 text-sm rounded-xl bg-surface-overlay border border-surface-border text-text-primary hover:bg-surface-border transition-colors"
              >
                Next
              </a>
            )}
          </div>
        )}
      </div>
      )}
    </main>
  )
}
