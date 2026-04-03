import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { ProductCategory, CardCondition } from '@prisma/client'
import { getProducts } from '@/services/product.service'
import { ProductGrid } from '@/components/shop/product-grid'
import { ProductFilters } from '@/components/shop/product-filters'
import { ShopPagination } from '@/components/shop/shop-pagination'

interface ShopPageProps {
  searchParams: Promise<{
    category?: string
    condition?: string
    sortBy?: string
    page?: string
  }>
}

const VALID_CATEGORIES = Object.values(ProductCategory) as string[]
const VALID_CONDITIONS = Object.values(CardCondition) as string[]
const VALID_SORTS = ['newest', 'price_asc', 'price_desc', 'name'] as const

export const metadata = {
  title: 'Shop — Card Nimbus',
  description: 'Browse Pokemon cards, packs, booster boxes, and slabs at Card Nimbus.',
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams

  const rawCategory = params.category ?? ''
  const rawCondition = params.condition ?? ''
  const rawSort = params.sortBy ?? 'newest'
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  const category = VALID_CATEGORIES.includes(rawCategory)
    ? (rawCategory as ProductCategory)
    : undefined

  const condition = VALID_CONDITIONS.includes(rawCondition)
    ? (rawCondition as CardCondition)
    : undefined

  const sortBy = (VALID_SORTS as readonly string[]).includes(rawSort)
    ? (rawSort as typeof VALID_SORTS[number])
    : 'newest'

  const { products, total, limit } = await getProducts({
    page,
    limit: 20,
    category,
    condition,
    sortBy,
  })

  const totalPages = Math.ceil(total / limit)

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Shop
          </h1>
          <p className="mt-1 text-text-secondary text-sm">
            {total === 0
              ? 'No products found'
              : `${total} product${total === 1 ? '' : 's'} available`}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Suspense fallback={null}>
            <ProductFilters
              category={rawCategory}
              condition={rawCondition}
              sortBy={rawSort}
            />
          </Suspense>
        </div>

        {/* Grid */}
        <ProductGrid products={products} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <ShopPagination page={page} totalPages={totalPages} />
          </div>
        )}
      </div>
    </main>
  )
}
