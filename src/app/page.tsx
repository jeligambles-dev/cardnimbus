import Link from 'next/link'
import { HeroSection } from '@/components/home/hero-section'
import { CategoryGrid } from '@/components/home/category-grid'
import { FeaturedProducts } from '@/components/home/featured-products'

function SellYourCardsCTA() {
  return (
    <section className="bg-nimbus-950 border-y border-nimbus-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col items-center text-center gap-6 sm:gap-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-nimbus-700 bg-nimbus-900/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-nimbus-400">
            Got cards to sell?
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight max-w-2xl">
            Turn your collection into{' '}
            <span className="text-nimbus-400">cash</span> — fast.
          </h2>
          <p className="text-text-secondary text-base sm:text-lg max-w-xl leading-relaxed">
            Submit photos of your cards, receive a fair market offer, and get paid quickly.
            We handle the grading, pricing, and listing — you just ship them in.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/sell-your-cards"
              className="rounded-xl bg-nimbus-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-nimbus-500/30 transition-colors hover:bg-nimbus-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nimbus-500"
            >
              Start Selling
            </Link>
            <Link
              href="/help/grading"
              className="rounded-xl border border-nimbus-700 px-8 py-3 text-sm font-semibold text-text-secondary transition-colors hover:border-nimbus-500 hover:text-text-primary"
            >
              How it works
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <FeaturedProducts />
      <SellYourCardsCTA />
    </>
  )
}
