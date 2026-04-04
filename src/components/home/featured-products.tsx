import Link from 'next/link'
import { getProducts } from '@/services/product.service'
import { ProductGrid } from '@/components/shop/product-grid'

export async function FeaturedProducts() {
  const { products } = await getProducts({ limit: 8, sortBy: 'newest' })

  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      {/* Section header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-nimbus-500 mb-1">
            Fresh Inventory
          </p>
          <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Latest Drops
          </h2>
        </div>
        <Link
          href="/shop"
          className="text-sm font-medium text-text-secondary transition-colors hover:text-nimbus-600"
        >
          View all →
        </Link>
      </div>

      <ProductGrid products={products} />
    </section>
  )
}
