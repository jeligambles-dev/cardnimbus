'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { CountrySelectGrouped } from '@/components/country-select-grouped'
import { formatCurrency } from '@/lib/utils'

interface ShippingForm {
  fullName: string
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  country: string
}

const EMPTY_FORM: ShippingForm = {
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCartStore()
  const [form, setForm] = useState<ShippingForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<ShippingForm>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe')
  const [availableMethods, setAvailableMethods] = useState({ stripe: true, paypal: false })

  useEffect(() => {
    fetch('/api/checkout/payment-methods')
      .then((r) => r.json())
      .then((data) => {
        setAvailableMethods({ stripe: data.stripe ?? true, paypal: data.paypal ?? false })
        if (!data.stripe && data.paypal) setPaymentMethod('paypal')
      })
      .catch(() => {})
  }, [])

  const subtotal = total()

  function updateField(field: keyof ShippingForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function validate(): boolean {
    const newErrors: Partial<ShippingForm> = {}
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!form.line1.trim()) newErrors.line1 = 'Address line 1 is required'
    if (!form.city.trim()) newErrors.city = 'City is required'
    if (!form.state.trim()) newErrors.state = 'State is required'
    if (!form.postalCode.trim()) newErrors.postalCode = 'Postal code is required'
    if (!form.country.trim()) newErrors.country = 'Country is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handlePlaceOrder() {
    if (!validate()) return
    if (items.length === 0) return

    setLoading(true)
    setApiError('')
    try {
      const endpoint = paymentMethod === 'paypal' ? '/api/checkout/paypal' : '/api/checkout/stripe'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shippingAddress: form,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setApiError(data.error ?? 'Something went wrong')
        return
      }

      clearCart()

      if (data.url) {
        window.location.href = data.url
      } else {
        router.push('/checkout/success')
      }
    } catch {
      setApiError('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-3">Your cart is empty</h1>
          <p className="text-text-secondary mb-8">Add items to your cart before checking out.</p>
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
        <h1 className="text-3xl font-bold text-text-primary mb-8 tracking-tight">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-text-primary mb-5">Shipping Address</h2>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={form.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  error={errors.fullName}
                  placeholder="Jane Smith"
                />
                <Input
                  label="Address Line 1"
                  value={form.line1}
                  onChange={(e) => updateField('line1', e.target.value)}
                  error={errors.line1}
                  placeholder="123 Main St"
                />
                <Input
                  label="Address Line 2 (optional)"
                  value={form.line2}
                  onChange={(e) => updateField('line2', e.target.value)}
                  placeholder="Apt 4B"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    error={errors.city}
                    placeholder="New York"
                  />
                  <Input
                    label="State / Province"
                    value={form.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    error={errors.state}
                    placeholder="NY"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Postal Code"
                    value={form.postalCode}
                    onChange={(e) => updateField('postalCode', e.target.value)}
                    error={errors.postalCode}
                    placeholder="10001"
                  />
                  <CountrySelectGrouped
                    label="Country"
                    value={form.country}
                    onChange={(v) => updateField('country', v)}
                    error={errors.country}
                  />
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-text-primary mb-5">Payment Method</h2>
              <div className="space-y-3">
                {availableMethods.stripe && (
                  <label
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === 'stripe'
                        ? 'border-nimbus-500 bg-nimbus-500/10'
                        : 'border-surface-border hover:border-nimbus-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={() => setPaymentMethod('stripe')}
                      className="h-4 w-4 text-nimbus-500 focus:ring-nimbus-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-text-primary">💳 Credit / Debit Card</p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Powered by Stripe — all major cards accepted
                      </p>
                    </div>
                  </label>
                )}
                {availableMethods.paypal && (
                  <label
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === 'paypal'
                        ? 'border-[#0070BA] bg-[#0070BA]/10'
                        : 'border-surface-border hover:border-[#0070BA]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="h-4 w-4 text-[#0070BA] focus:ring-[#0070BA]"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-text-primary">🅿️ PayPal</p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Pay with your PayPal account
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </Card>

            {apiError && (
              <p className="text-red-400 text-sm text-center">{apiError}</p>
            )}
          </div>

          {/* Right: Order Summary */}
          <div>
            <Card className="p-6 sticky top-6">
              <h2 className="text-lg font-bold text-text-primary mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-text-secondary line-clamp-1 flex-1 mr-2">
                      {item.name}
                      {item.quantity > 1 && (
                        <span className="text-text-muted"> ×{item.quantity}</span>
                      )}
                    </span>
                    <span className="text-text-primary font-medium flex-shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-surface-border pt-4 flex justify-between font-bold text-text-primary">
                <span>Total</span>
                <span className="text-nimbus-600">{formatCurrency(subtotal)}</span>
              </div>
              <Button
                size="lg"
                className="w-full mt-6"
                onClick={handlePlaceOrder}
                loading={loading}
              >
                Place Order
              </Button>
              <Link
                href="/cart"
                className="block mt-3 text-center text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Back to Cart
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
