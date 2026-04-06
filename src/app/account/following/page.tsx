import Link from "next/link";
import Image from "next/image";
import { requireAuth } from "@/lib/auth-guard";
import { BackHeader } from '@/components/ui/back-header';
import { getUserFollowedSellers } from "@/services/follow.service";

export const metadata = { title: "Following — Card Nimbus" };

export default async function FollowingPage() {
  const session = await requireAuth();
  const { follows, total } = await getUserFollowedSellers(session.user.id);

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BackHeader title="Following" crumbs={[{ label: "Marketplace Account", href: "/marketplace/account" }]} />
        <h1 className="hidden text-2xl font-bold text-text-primary mb-2">Following</h1>
        <p className="text-sm text-text-secondary mb-8">
          {total} seller{total !== 1 ? "s" : ""}
        </p>

        {follows.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-surface-border bg-surface-raised">
            <p className="text-text-muted mb-4">
              You&apos;re not following any sellers yet.
            </p>
            <Link
              href="/marketplace"
              className="inline-block rounded-xl bg-nimbus-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-nimbus-600"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {follows.map((follow) => {
              const sp = follow.sellerProfile as {
                id: string;
                totalSales: number;
                rating: number | null;
                user: { id: string; name: string | null; avatar: string | null };
                _count: { listings: number };
              };
              return (
                <Link
                  key={follow.id}
                  href={`/seller/${sp.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-surface-border bg-white p-4 hover:border-nimbus-400 hover:shadow-md transition-all"
                >
                  <div className="h-14 w-14 rounded-full overflow-hidden bg-surface-overlay shrink-0 border-2 border-nimbus-400">
                    {sp.user.avatar ? (
                      <Image
                        src={sp.user.avatar}
                        alt={sp.user.name ?? ""}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-bold text-nimbus-600 text-xl">
                        {(sp.user.name ?? "S").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text-primary">
                      {sp.user.name ?? "Seller"}
                    </p>
                    <div className="flex gap-3 text-xs text-text-secondary mt-1">
                      <span>{sp.totalSales} sales</span>
                      <span>·</span>
                      <span>{sp._count.listings} active</span>
                      {sp.rating !== null && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <svg className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.953c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.953a1 1 0 00-.364-1.118L2.062 9.38c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.287-3.953z" />
                            </svg>
                            {sp.rating.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-text-muted">→</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
