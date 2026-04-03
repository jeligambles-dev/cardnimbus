import { ProductCard } from './product-card'

interface ProductGridProps {
  products: {
    id: string
    name: string
    slug: string
    category: string
    condition?: string | null
    images: string[]
    price: number
    compareAtPrice?: number | null
    stock: number
  }[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
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
          <p className="text-text-primary font-semibold text-lg">No products found</p>
          <p className="text-text-muted text-sm mt-1">
            Try adjusting your filters or check back later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  )
}
