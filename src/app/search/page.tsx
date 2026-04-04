import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { search } from '@/services/search.service'
import { ProductGrid } from '@/components/shop/product-grid'
import { ProductFilters } from '@/components/shop/product-filters'
import { ZeroResultState } from '@/components/search/zero-result-state'
import { ProductCategory, CardCondition } from '@prisma/client'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    condition?: string
  }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  const query = q?.trim() ?? ''
  return {
    title: query ? `"${query}" — Search — Card Nimbus` : 'Search — Card Nimbus',
    description: query
      ? `Search results for "${query}" on Card Nimbus.`
      : 'Search for Pokemon cards, packs, booster boxes, and slabs on Card Nimbus.',
  }
}

const VALID_CATEGORIES = Object.values(ProductCategory) as string[]
const VALID_CONDITIONS = Object.values(CardCondition) as string[]

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams

  const query = params.q?.trim() ?? ''
  const rawCategory = params.category ?? ''
  const rawCondition = params.condition ?? ''

  const category = VALID_CATEGORIES.includes(rawCategory)
    ? (rawCategory as ProductCategory)
    : undefined

  const condition = VALID_CONDITIONS.includes(rawCondition)
    ? (rawCondition as CardCondition)
    : undefined

  const { results, total } = query
    ? await search(query, { category, condition, limit: 40 })
    : { results: [], total: 0 }

  // Map SearchResult to the shape ProductGrid expects
  const products = results.map((r) => ({
    id: r.id,
    name: r.title,
    // Build slug from url: /shop/some-slug → some-slug, /cards/id → use id
    slug: r.url.startsWith('/shop/') ? r.url.replace('/shop/', '') : r.url.replace('/cards/', ''),
    category: 'SINGLE' as const,
    condition: r.condition ?? undefined,
    images: r.image ? [r.image] : [],
    price: r.price ?? 0,
    compareAtPrice: null,
    stock: 1,
  }))

  const hasQuery = query.length > 0

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          {hasQuery ? (
            <>
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">
                Results for{' '}
                <span className="text-nimbus-600">&ldquo;{query}&rdquo;</span>
              </h1>
              <p className="mt-1 text-text-secondary text-sm">
                {total === 0
                  ? 'No results found'
                  : `${total} result${total === 1 ? '' : 's'}`}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">Search</h1>
              <p className="mt-1 text-text-secondary text-sm">
                Enter a search term to find cards, packs, booster boxes, and more.
              </p>
            </>
          )}
        </div>

        {/* Filters — only shown when there's a query */}
        {hasQuery && (
          <div className="mb-6">
            <Suspense fallback={null}>
              <ProductFilters
                category={rawCategory}
                condition={rawCondition}
              />
            </Suspense>
          </div>
        )}

        {/* Results or zero-state */}
        {hasQuery && total === 0 ? (
          <ZeroResultState query={query} />
        ) : hasQuery ? (
          <ProductGrid products={products} />
        ) : (
          /* No query state */
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-overlay border border-surface-border flex items-center justify-center">
              <svg
                className="w-8 h-8 text-text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <div>
              <p className="text-text-primary font-semibold text-lg">Start searching</p>
              <p className="text-text-secondary text-sm mt-1">
                Use the search bar above to find cards, packs, and more.
              </p>
            </div>
            <Link
              href="/shop"
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-overlay hover:bg-surface-border border border-surface-border text-text-secondary hover:text-text-primary font-medium text-sm transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
