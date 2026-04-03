import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Payment Cancelled — Card Nimbus',
}

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 text-center py-20">
        <div className="w-20 h-20 rounded-full bg-red-950 border border-red-800 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-2">Payment Cancelled</h1>
        <p className="text-text-secondary mb-8">
          Your payment was cancelled. Your cart has been saved — you can try again whenever
          you&apos;re ready.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/cart">
            <Button variant="secondary">Return to Cart</Button>
          </Link>
          <Link href="/checkout">
            <Button>Try Again</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
