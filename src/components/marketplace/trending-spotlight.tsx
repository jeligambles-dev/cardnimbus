import Link from "next/link";
import { ListingCard } from "./listing-card";

interface TrendingListing {
  id: string;
  title: string;
  price: number;
  images: string[];
  condition: string | null;
  category: string;
  dealScore: number | null;
  dealScoreBand: string | null;
  grade?: number | null;
  gradingCompany?: string | null;
  seller: {
    rating: number | null;
    user: { name: string | null; avatar: string | null };
  };
  _count: { likes: number };
  viewCount: number;
}

interface TrendingSpotlightProps {
  listings: TrendingListing[];
}

const RANK_COLORS = [
  "bg-gradient-to-br from-yellow-400 to-amber-500 ring-yellow-400/40",
  "bg-gradient-to-br from-slate-300 to-slate-400 ring-slate-300/40",
  "bg-gradient-to-br from-orange-400 to-orange-600 ring-orange-400/40",
];

export function TrendingSpotlight({ listings }: TrendingSpotlightProps) {
  if (listings.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-nimbus-50 via-white to-transparent border-b-4 border-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-nimbus-100 border-2 border-nimbus-300 px-4 py-1.5 mb-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nimbus-500 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-nimbus-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-nimbus-700">
                Trending Now
              </span>
            </div>
            <h2 className="text-4xl font-black tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              Top Picks
            </h2>
            <p className="text-base text-text-secondary mt-2 sm:text-lg">
              The hottest cards moving fastest right now
            </p>
          </div>
          <Link
            href="/marketplace?view=all"
            className="group hidden sm:inline-flex items-center gap-1.5 rounded-xl border-2 border-nimbus-500 bg-white px-4 py-2.5 text-sm font-bold text-nimbus-600 shadow-[0_2px_0_0_rgba(255,0,0,0.15)] transition-all duration-150 hover:bg-nimbus-500 hover:text-white hover:-translate-y-px active:translate-y-0"
          >
            View all
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Cards — same sizing as marketplace listing grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {listings.slice(0, 3).map((listing, i) => (
            <div key={listing.id} className="relative">
              {/* Rank badge */}
              <div
                className={`absolute -top-2 -left-2 z-20 flex h-9 w-9 items-center justify-center rounded-xl ${RANK_COLORS[i]} text-white font-black text-sm shadow-lg ring-2 ring-white`}
              >
                {i + 1}
              </div>
              <ListingCard listing={listing} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
