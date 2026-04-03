import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface SuccessPageProps {
  searchParams: Promise<{ order?: string }>
}

export const metadata = {
  title: 'Order Confirmed — Card Nimbus',
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { order } = await searchParams

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 text-center py-20">
        <div className="w-20 h-20 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-2">Order Confirmed!</h1>
        <p className="text-text-secondary mb-6">
          Thank you for your purchase. We&apos;ll send you a confirmation email shortly.
        </p>

        {order && (
          <div className="bg-surface-raised border border-surface-border rounded-xl px-6 py-4 mb-8 inline-block">
            <p className="text-text-secondary text-sm">Order Number</p>
            <p className="text-nimbus-400 font-bold text-xl font-mono tracking-wider mt-0.5">
              {order}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/account/orders">
            <Button variant="secondary">View Orders</Button>
          </Link>
          <Link href="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
