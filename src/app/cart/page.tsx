'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/stores/cart-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore()
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState(false)
  const [applying, setApplying] = useState(false)

  const subtotal = total()
  const discountAmount = discount
  const orderTotal = Math.max(0, subtotal - discountAmount)

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return
    setApplying(true)
    setCouponError('')
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderTotal: subtotal }),
      })
      const data = await res.json()
      if (data.valid) {
        setDiscount(data.discount)
        setCouponApplied(true)
        setCouponError('')
      } else {
        setCouponError(data.error ?? 'Invalid coupon')
        setDiscount(0)
        setCouponApplied(false)
      }
    } catch {
      setCouponError('Failed to validate coupon')
    } finally {
      setApplying(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-3xl font-bold text-text-primary mb-3">Your cart is empty</h1>
          <p className="text-text-secondary mb-8">
            Add some Pokemon cards to get started.
          </p>
          <Link href="/shop">
            <Button size="lg">Browse Shop</Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-text-primary mb-8 tracking-tight">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.productId} className="p-4">
                <div className="flex gap-4 items-start">
                  {/* Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-raised border border-surface-border">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🃏
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/shop/${item.slug}`}
                      className="font-semibold text-text-primary hover:text-nimbus-400 transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="text-nimbus-400 font-bold mt-1">
                      {formatCurrency(item.price)}
                    </p>
                  </div>

                  {/* Quantity + Remove */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-surface-overlay border border-surface-border text-text-primary hover:border-nimbus-500 transition-colors flex items-center justify-center font-bold"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-text-primary font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-surface-overlay border border-surface-border text-text-primary hover:border-nimbus-500 transition-colors flex items-center justify-center font-bold"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-text-secondary text-sm">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-400 hover:text-red-300 text-xs transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-text-primary mb-4">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    error={couponError || undefined}
                    className="flex-1"
                    disabled={couponApplied}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleApplyCoupon}
                    loading={applying}
                    disabled={couponApplied}
                    className="flex-shrink-0"
                  >
                    {couponApplied ? 'Applied' : 'Apply'}
                  </Button>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm border-t border-surface-border pt-4">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>−{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-primary font-bold text-base border-t border-surface-border pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-nimbus-400">{formatCurrency(orderTotal)}</span>
                </div>
              </div>

              <Link href="/checkout" className="block mt-6">
                <Button size="lg" className="w-full">
                  Proceed to Checkout
                </Button>
              </Link>

              <Link
                href="/shop"
                className="block mt-3 text-center text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Continue Shopping
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
