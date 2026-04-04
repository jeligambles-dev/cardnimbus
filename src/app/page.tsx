import Link from 'next/link'
import { HeroSection } from '@/components/home/hero-section'
import { TrustBar } from '@/components/home/trust-bar'
import { ActivityFeed } from '@/components/home/activity-feed'
import { CategoryGrid } from '@/components/home/category-grid'
import { FeaturedSets } from '@/components/home/featured-sets'
import { FeaturedProducts } from '@/components/home/featured-products'
import { StatsBar } from '@/components/home/stats-bar'
import { Testimonials } from '@/components/home/testimonials'

function SellYourCardsCTA() {
  return (
    <section className="bg-white border-y border-surface-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="rounded-3xl bg-gradient-to-br from-nimbus-500 via-nimbus-600 to-red-700 p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                💰 Instant Offers
              </div>
              <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Got cards to sell?
                <br />
                <span className="text-white/90">We pay fast.</span>
              </h2>
              <p className="mt-4 text-lg text-white/90 max-w-lg leading-relaxed">
                Upload photos of your cards, get a fair market offer within 24 hours,
                and get paid after we verify. No guesswork, no waiting.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <Link
                href="/sell-your-cards"
                className="rounded-xl bg-white px-8 py-4 text-base font-bold text-nimbus-600 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-0.5 text-center"
              >
                Start Selling →
              </Link>
              <Link
                href="/help/sell-your-cards"
                className="rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-8 py-4 text-base font-bold text-white transition-colors hover:bg-white/20 text-center"
              >
                How it works
              </Link>
            </div>
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
      <TrustBar />
      <ActivityFeed />
      <CategoryGrid />
      <FeaturedSets />
      <FeaturedProducts />
      <StatsBar />
      <Testimonials />
      <SellYourCardsCTA />
    </>
  )
}
