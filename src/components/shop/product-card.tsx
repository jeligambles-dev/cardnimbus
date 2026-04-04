'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    category: string
    condition?: string | null
    images: string[]
    price: number
    compareAtPrice?: number | null
    stock: number
  }
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const discountPct =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
        )
      : null

  const lowStock = product.stock > 0 && product.stock <= 3
  const soldOut = product.stock === 0
  const mainImage = product.images[0] ?? null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Link href={`/shop/${product.slug}`} className="group block">
        <div
          className={[
            'relative bg-surface-raised border rounded-2xl overflow-hidden',
            'transition-all duration-300',
            'border-surface-border',
            'group-hover:border-nimbus-600/60 group-hover:shadow-xl group-hover:shadow-nimbus-500/10',
            'group-hover:-translate-y-1',
          ].join(' ')}
        >
          {/* Image */}
          <div className="relative aspect-[3/4] bg-surface-overlay overflow-hidden">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-nimbus-500/40 select-none tracking-tight">
                  CN
                </span>
              </div>
            )}

            {/* Sold Out overlay */}
            {soldOut && (
              <div className="absolute inset-0 bg-surface/70 flex items-center justify-center">
                <span className="text-sm font-bold text-text-secondary uppercase tracking-widest">
                  Sold Out
                </span>
              </div>
            )}

            {/* Discount badge */}
            {discountPct && (
              <div className="absolute top-2 left-2">
                <Badge variant="nimbus" size="sm">
                  -{discountPct}%
                </Badge>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="p-3 flex flex-col gap-2">
            {/* Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="default" size="sm">
                {product.category.replace(/_/g, ' ')}
              </Badge>
              {product.condition && (
                <Badge variant="success" size="sm">
                  {product.condition}
                </Badge>
              )}
            </div>

            {/* Name */}
            <p className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
              {product.name}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-nimbus-600 font-bold text-base">
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs text-text-muted line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Low stock warning */}
            {lowStock && (
              <p className="text-xs text-amber-400 font-medium">
                Only {product.stock} left
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
