'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { SafeImage } from '@/components/safe-image'
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
  const mainImage = product.images[0] ?? '/card-default.jpg'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Link href={`/shop/${product.slug}`} className="group block">
        <div
          className={[
            'relative bg-white rounded-2xl overflow-hidden',
            'border-[3px] border-nimbus-500',
            'shadow-[0_4px_0_0_rgba(255,0,0,0.15)]',
            'transition-all duration-200',
            'group-hover:shadow-[0_8px_20px_-4px_rgba(255,0,0,0.35)]',
            'group-hover:-translate-y-1',
            'group-hover:border-nimbus-600',
            'p-2.5 flex flex-col gap-2',
          ].join(' ')}
        >
          {/* HEADER — Name + Price */}
          <div className="flex items-start justify-between gap-2 px-1 pt-0.5">
            <h3 className="text-[13px] font-black text-text-primary leading-tight line-clamp-2 flex-1 min-h-[2rem]">
              {product.name}
            </h3>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-nimbus-600 font-black text-lg leading-none">
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-[10px] text-text-muted line-through font-semibold mt-0.5">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>
          </div>

          {/* IMAGE FRAME — Pokemon card 5:7 aspect ratio */}
          <div className="relative aspect-[5/7] bg-gradient-to-br from-nimbus-500 via-nimbus-500 to-nimbus-600 overflow-hidden rounded-lg border-[3px] border-nimbus-600 shadow-inner">
            <SafeImage
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />

            {/* Discount badge */}
            {discountPct && (
              <div className="absolute top-1.5 left-1.5 z-10">
                <span className="rounded-md bg-gradient-to-b from-amber-400 to-amber-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm ring-1 ring-inset ring-white/20">
                  -{discountPct}%
                </span>
              </div>
            )}

            {/* Sold Out overlay */}
            {soldOut && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-sm font-black text-white uppercase tracking-widest">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* INFO STRIP */}
          <div className="flex items-center justify-between gap-2 px-1 py-1 border-y border-nimbus-200">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="rounded bg-nimbus-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-nimbus-700 shrink-0">
                {product.category.replace(/_/g, ' ')}
              </span>
              {product.condition && (
                <span className="rounded bg-surface-overlay px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-text-secondary shrink-0">
                  {product.condition}
                </span>
              )}
            </div>
            {lowStock && (
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                {product.stock} left
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
