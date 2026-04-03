import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getProductBySlug } from '@/services/product.service'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import { ProductImageGallery } from '@/components/shop/product-image-gallery'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return { title: 'Product Not Found — Card Nimbus' }
  }

  return {
    title: `${product.name} — Card Nimbus`,
    description: product.description ?? `Buy ${product.name} on Card Nimbus.`,
    openGraph: {
      title: product.name,
      description: product.description ?? `Buy ${product.name} on Card Nimbus.`,
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product || !product.isActive) {
    notFound()
  }

  const discountPct =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
        )
      : null

  const soldOut = product.stock === 0
  const lowStock = product.stock > 0 && product.stock <= 3

  const card = product.card as {
    tcgPriceNM?: number | null
    tcgPriceLP?: number | null
    tcgPriceMP?: number | null
    tcgPriceHP?: number | null
    tcgPriceMarket?: number | null
  } | null

  const hasTcgPrices =
    card &&
    (card.tcgPriceNM || card.tcgPriceLP || card.tcgPriceMP || card.tcgPriceHP || card.tcgPriceMarket)

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Image Gallery */}
          <ProductImageGallery images={product.images} name={product.name} />

          {/* Right: Details */}
          <div className="flex flex-col gap-5">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="default" size="md">
                {(product.category as string).replace(/_/g, ' ')}
              </Badge>
              {product.condition && (
                <Badge variant="success" size="md">
                  {product.condition as string}
                </Badge>
              )}
              {discountPct && (
                <Badge variant="nimbus" size="md">
                  -{discountPct}% OFF
                </Badge>
              )}
              {soldOut && (
                <Badge variant="danger" size="md">
                  Sold Out
                </Badge>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-nimbus-400">
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-lg text-text-muted line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Stock */}
            {lowStock && (
              <p className="text-sm text-amber-400 font-medium">
                Only {product.stock} left in stock — order soon
              </p>
            )}
            {!soldOut && !lowStock && (
              <p className="text-sm text-emerald-400 font-medium">
                In stock ({product.stock} available)
              </p>
            )}

            {/* Add to Cart */}
            <AddToCartButton product={product} className="w-full sm:w-auto" />

            {/* TCGPlayer Price Comparison */}
            {hasTcgPrices && (
              <div className="border border-surface-border rounded-2xl overflow-hidden">
                <div className="bg-surface-overlay px-4 py-3 border-b border-surface-border">
                  <p className="text-sm font-semibold text-text-primary">
                    TCGPlayer Price Reference
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-surface-border">
                  {[
                    { label: 'NM', value: card?.tcgPriceNM },
                    { label: 'LP', value: card?.tcgPriceLP },
                    { label: 'MP', value: card?.tcgPriceMP },
                    { label: 'HP', value: card?.tcgPriceHP },
                  ].map(({ label, value }) => (
                    <div key={label} className="px-4 py-3 flex flex-col gap-1">
                      <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
                        {label}
                      </span>
                      <span className="text-sm font-semibold text-text-primary">
                        {value ? formatCurrency(value) : '—'}
                      </span>
                    </div>
                  ))}
                </div>
                {card?.tcgPriceMarket && (
                  <div className="px-4 py-3 bg-surface-overlay border-t border-surface-border flex items-center justify-between">
                    <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
                      Market Price
                    </span>
                    <span className="text-sm font-semibold text-nimbus-400">
                      {formatCurrency(card.tcgPriceMarket)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="border-t border-surface-border pt-5">
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                  Description
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
