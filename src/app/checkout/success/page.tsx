'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface SuccessPageProps {
  searchParams: Promise<{ order?: string }>
}

// Particle data for confetti burst
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  angle: (i / 24) * 360,
  distance: 60 + Math.random() * 80,
  color: ['#818cf8', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#60a5fa'][i % 6],
  size: 6 + Math.random() * 6,
  duration: 0.8 + Math.random() * 0.6,
}))

function ConfettiBurst() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {PARTICLES.map((p) => {
        const rad = (p.angle * Math.PI) / 180
        const x = Math.cos(rad) * p.distance
        const y = Math.sin(rad) * p.distance
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{ width: p.size, height: p.size, backgroundColor: p.color }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x, y, opacity: 0, scale: 0.3 }}
            transition={{ duration: p.duration, ease: 'easeOut', delay: 0.3 }}
          />
        )
      })}
    </div>
  )
}

export default function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const [orderNumber, setOrderNumber] = useState<string | undefined>()
  const [orderData, setOrderData] = useState<{
    items: Array<{ id: string; titleSnapshot: string; quantity: number; priceAtPurchase: number; imageSnapshot: string | null }>
    total: number
  } | null>(null)
  const [burst, setBurst] = useState(false)

  useEffect(() => {
    searchParams.then(({ order }) => {
      setOrderNumber(order)
      if (order) {
        setBurst(true)
        // Fetch order summary
        fetch(`/api/orders/${order}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data) {
              const items = data.items ?? []
              const total = items.reduce(
                (sum: number, i: { priceAtPurchase: number; quantity: number }) =>
                  sum + i.priceAtPurchase * i.quantity,
                0
              )
              setOrderData({ items, total })
            }
          })
          .catch(() => {})
      } else {
        setBurst(true)
      }
    })
  }, [searchParams])

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 text-center py-20">

        {/* Icon with confetti */}
        <div className="relative flex items-center justify-center mb-6">
          <motion.div
            className="relative w-24 h-24 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <svg
              className="w-12 h-12 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <AnimatePresence>{burst && <ConfettiBurst />}</AnimatePresence>
          </motion.div>
        </div>

        {/* Heading with nimbus glow */}
        <motion.h1
          className="text-4xl font-bold text-text-primary mb-2 [text-shadow:0_0_24px_rgba(129,140,248,0.45)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          Order Confirmed!
        </motion.h1>
        <motion.p
          className="text-text-secondary mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          Thank you for your purchase. We&apos;ll send you a confirmation email shortly.
        </motion.p>

        {/* Order number */}
        {orderNumber && (
          <motion.div
            className="bg-surface-raised border border-surface-border rounded-xl px-6 py-4 mb-6 inline-block"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-text-secondary text-sm">Order Number</p>
            <p className="text-nimbus-400 font-bold text-xl font-mono tracking-wider mt-0.5">
              {orderNumber}
            </p>
          </motion.div>
        )}

        {/* Order summary */}
        {orderData && orderData.items.length > 0 && (
          <motion.div
            className="w-full bg-surface-raised border border-surface-border rounded-2xl px-4 py-4 mb-8 text-left"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-text-secondary text-xs uppercase tracking-widest font-semibold mb-3">
              Order Summary
            </p>
            <ul className="space-y-2">
              {orderData.items.slice(0, 5).map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  {item.imageSnapshot ? (
                    <img
                      src={item.imageSnapshot}
                      alt={item.titleSnapshot}
                      className="w-10 h-10 rounded-lg object-cover bg-surface-overlay flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-surface-overlay flex-shrink-0" />
                  )}
                  <span className="flex-1 text-sm text-text-primary truncate">
                    {item.titleSnapshot}
                    {item.quantity > 1 && (
                      <span className="text-text-muted ml-1">×{item.quantity}</span>
                    )}
                  </span>
                  <span className="text-sm font-medium text-text-primary flex-shrink-0">
                    ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
              {orderData.items.length > 5 && (
                <li className="text-xs text-text-muted text-center pt-1">
                  +{orderData.items.length - 5} more item(s)
                </li>
              )}
            </ul>
            <div className="border-t border-surface-border mt-3 pt-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-text-secondary">Total</span>
              <span className="text-base font-bold text-nimbus-400">
                ${orderData.total.toFixed(2)}
              </span>
            </div>
          </motion.div>
        )}

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Link href={orderNumber ? `/account/orders/${orderNumber}` : '/account/orders'}>
            <Button variant="secondary">View Order</Button>
          </Link>
          <Link href="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
