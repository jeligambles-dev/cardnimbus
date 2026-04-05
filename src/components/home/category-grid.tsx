import Link from "next/link";
import { getActiveTiles } from "@/services/category-tile.service";

export async function CategoryGrid() {
  const tiles = await getActiveTiles();

  if (tiles.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black tracking-tight text-text-primary sm:text-4xl">
            Explore
          </h2>
          <p className="mt-2 text-sm text-text-secondary sm:text-base">
            See what you&apos;re buying
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {tiles.map((tile) => (
            <Link
              key={tile.id}
              href={tile.href}
              className="group relative block overflow-hidden rounded-2xl border-2 border-surface-border bg-white transition-all duration-300 hover:border-nimbus-400 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative aspect-square overflow-hidden bg-surface-raised">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.imageUrl}
                  alt={tile.label}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-base font-bold tracking-tight text-text-primary sm:text-lg">
                  {tile.label}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
