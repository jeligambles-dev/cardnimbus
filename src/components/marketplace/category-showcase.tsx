import Link from "next/link";

const CATEGORIES = [
  {
    name: "Packs",
    href: "/marketplace?category=PACK",
    image: "https://images.unsplash.com/photo-1627646811101-07c40bafcfb4?w=600&h=600&fit=crop",
    gradient: "from-red-500 to-rose-600",
  },
  {
    name: "Booster Boxes",
    href: "/marketplace?category=BOOSTER_BOX",
    image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=600&h=600&fit=crop",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    name: "Slabs",
    href: "/marketplace?category=SLAB",
    image: "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=600&h=600&fit=crop",
    gradient: "from-yellow-400 to-amber-500",
  },
  {
    name: "Singles",
    href: "/marketplace?category=SINGLE",
    image: "https://images.unsplash.com/photo-1609604266590-ccfaa49b1d4f?w=600&h=600&fit=crop",
    gradient: "from-blue-500 to-cyan-500",
  },
];

export function CategoryShowcase() {
  return (
    <section className="bg-white border-b border-surface-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header row */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-1">
              Shop by category
            </p>
            <h2 className="text-2xl font-black tracking-tight text-text-primary sm:text-3xl">
              Products
            </h2>
          </div>
          <Link
            href="/marketplace?view=all"
            className="group inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-surface-border bg-white px-4 text-sm font-bold text-text-primary transition-all duration-150 hover:border-emerald-400 hover:text-emerald-600 hover:-translate-y-px active:translate-y-0"
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

        {/* Category tiles */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative block overflow-hidden rounded-2xl border-2 border-surface-border bg-white transition-all duration-300 hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1"
            >
              <div className={`relative aspect-square bg-gradient-to-br ${cat.gradient} overflow-hidden`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-60 transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-lg font-black tracking-tight text-white drop-shadow-lg">
                    {cat.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
