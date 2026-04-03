'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductImageGalleryProps {
  images: string[]
  name: string
}

export function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  const [selected, setSelected] = useState(0)
  const hasImages = images.length > 0

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square bg-surface-overlay border border-surface-border rounded-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          {hasImages ? (
            <motion.div
              key={selected}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Image
                src={images[selected]}
                alt={`${name} — image ${selected + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
                priority
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold text-nimbus-500/30 select-none tracking-tight">
                CN
              </span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={[
                'relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-150',
                i === selected
                  ? 'border-nimbus-500 shadow-md shadow-nimbus-500/25'
                  : 'border-surface-border hover:border-nimbus-600/50',
              ].join(' ')}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${name} thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
