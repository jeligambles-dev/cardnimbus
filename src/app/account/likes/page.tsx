import Link from "next/link";
import Image from "next/image";
import { requireAuth } from "@/lib/auth-guard";
import { BackHeader } from '@/components/ui/back-header';
import { getUserLikedListings } from "@/services/listing-like.service";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Liked Items — Card Nimbus" };

export default async function LikedItemsPage() {
  const session = await requireAuth();
  const { likes, total } = await getUserLikedListings(session.user.id);

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BackHeader title="Liked Items" crumbs={[{ label: "Marketplace Account", href: "/marketplace/account" }]} />
        <h1 className="hidden text-2xl font-bold text-text-primary mb-2">Liked Items</h1>
        <p className="text-sm text-text-secondary mb-8">
          {total} item{total !== 1 ? "s" : ""}
        </p>

        {likes.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-surface-border bg-surface-raised">
            <p className="text-text-muted mb-4">You haven&apos;t liked any items yet.</p>
            <Link
              href="/marketplace"
              className="inline-block rounded-xl bg-nimbus-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-nimbus-600"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {likes.map((like) => {
              const listing = like.listing as {
                id: string;
                title: string;
                images: string[];
                price: number;
                seller: { user: { name: string | null } };
              };
              return (
                <Link
                  key={like.id}
                  href={`/marketplace/${listing.id}`}
                  className="group block rounded-2xl border border-surface-border bg-white overflow-hidden hover:border-nimbus-400 hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[3/4] bg-surface-overlay overflow-hidden">
                    {listing.images[0] ? (
                      <Image
                        src={listing.images[0]}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-nimbus-500/40 font-bold">
                        CN
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-text-primary line-clamp-2">
                      {listing.title}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      by {listing.seller.user.name ?? "Seller"}
                    </p>
                    <p className="text-nimbus-600 font-bold mt-2">
                      {formatCurrency(listing.price)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
