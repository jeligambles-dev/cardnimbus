import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

interface TrendingListing {
  id: string;
  title: string;
  price: number;
  images: string[];
  condition: string | null;
  seller: {
    user: { name: string | null };
  };
  _count: { likes: number };
  viewCount: number;
}

interface TrendingSpotlightProps {
  listings: TrendingListing[];
}

const RANK_STYLES = [
  {
    badge: "bg-gradient-to-br from-yellow-400 to-amber-500",
    ring: "ring-yellow-400/40",
    shadow: "shadow-yellow-500/20",
  },
  {
    badge: "bg-gradient-to-br from-slate-300 to-slate-400",
    ring: "ring-slate-300/40",
    shadow: "shadow-slate-400/20",
  },
  {
    badge: "bg-gradient-to-br from-orange-400 to-orange-600",
    ring: "ring-orange-400/40",
    shadow: "shadow-orange-500/20",
  },
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
        </div>

        {/* Top 3 grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {listings.slice(0, 3).map((listing, i) => {
            const style = RANK_STYLES[i];
            return (
              <Link
                key={listing.id}
                href={`/marketplace/${listing.id}`}
                className="group relative block overflow-hidden rounded-2xl border-2 border-nimbus-500 bg-white shadow-[0_4px_0_0_rgba(255,0,0,0.15)] transition-all duration-200 hover:border-nimbus-600 hover:shadow-[0_12px_28px_-4px_rgba(255,0,0,0.4)] hover:-translate-y-1"
              >
                {/* Rank badge */}
                <div
                  className={`absolute top-3 left-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl ${style.badge} text-white font-black text-lg shadow-lg ring-2 ring-white ${style.ring}`}
                >
                  {i + 1}
                </div>

                {/* Red Image section */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-nimbus-500 via-nimbus-500 to-nimbus-600 overflow-hidden border-b-2 border-nimbus-600">
                  {listing.images[0] ? (
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-black text-white/60 drop-shadow-md">CN</span>
                    </div>
                  )}
                  {/* Stats overlay */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {listing.viewCount}
                    </span>
                    {listing._count.likes > 0 && (
                      <>
                        <span className="text-white/40">·</span>
                        <span className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                          </svg>
                          {listing._count.likes}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Info — white section */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-text-primary line-clamp-2 mb-3 min-h-[2.5rem]">
                    {listing.title}
                  </h3>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        by {listing.seller.user.name ?? "Seller"}
                      </p>
                      {listing.condition && (
                        <p className="text-xs text-text-secondary font-semibold">{listing.condition}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Price</span>
                      <span className="font-black text-xl text-nimbus-600 leading-none">
                        {formatCurrency(listing.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
