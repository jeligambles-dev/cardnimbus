import Link from "next/link";
import { getActiveTiles } from "@/services/category-tile.service";

const GRADIENTS: Record<string, string> = {
  PACK: "from-red-500 to-rose-600",
  BOOSTER_BOX: "from-amber-500 to-orange-600",
  SLAB: "from-yellow-400 to-amber-500",
  SINGLE: "from-blue-500 to-cyan-500",
};

function toMarketplaceHref(storeHref: string): string {
  // Convert store hrefs like /shop?category=PACK into marketplace versions
  try {
    const url = new URL(storeHref, "https://x");
    const category = url.searchParams.get("category");
    if (category) {
      return `/marketplace?view=all&category=${category}`;
    }
  } catch {
    // fall through
  }
  return "/marketplace?view=all";
}

function gradientFor(href: string): string {
  if (href.includes("PACK")) return GRADIENTS.PACK;
  if (href.includes("BOOSTER")) return GRADIENTS.BOOSTER_BOX;
  if (href.includes("SLAB")) return GRADIENTS.SLAB;
  if (href.includes("SINGLE")) return GRADIENTS.SINGLE;
  return "from-nimbus-500 to-nimbus-600";
}

export async function CategoryShowcase() {
  const tiles = await getActiveTiles();

  if (tiles.length === 0) return null;

  return (
    <section className="bg-white border-b border-surface-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header row */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-nimbus-600 mb-1">
              Shop by category
            </p>
            <h2 className="text-2xl font-black tracking-tight text-text-primary sm:text-3xl">
              Products
            </h2>
          </div>
          <Link
            href="/marketplace?view=all"
            className="group inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border-2 border-nimbus-500 bg-white px-4 text-sm font-bold text-nimbus-600 shadow-[0_2px_0_0_rgba(255,0,0,0.15)] transition-all duration-150 hover:bg-nimbus-500 hover:text-white hover:-translate-y-px active:translate-y-0"
          >
            View Products
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Category tiles — use store's admin-managed images */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {tiles.map((tile) => {
            const href = toMarketplaceHref(tile.href);
            const gradient = gradientFor(tile.href);
            return (
              <Link
                key={tile.id}
                href={href}
                className="group relative block overflow-hidden rounded-2xl border-2 border-nimbus-500 bg-white shadow-[0_4px_0_0_rgba(255,0,0,0.15)] transition-all duration-200 hover:border-nimbus-600 hover:shadow-[0_8px_20px_-4px_rgba(255,0,0,0.35)] hover:-translate-y-1"
              >
                <div className={`relative aspect-square bg-gradient-to-br ${gradient} overflow-hidden`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tile.imageUrl}
                    alt={tile.label}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="text-lg font-black tracking-tight text-white drop-shadow-lg">
                      {tile.label}
                    </h3>
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
