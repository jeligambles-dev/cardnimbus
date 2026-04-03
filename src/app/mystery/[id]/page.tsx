import { notFound } from "next/navigation";
import { getCollectionById, getRecentPulls } from "@/services/mystery.service";
import { PullRatesDisplay } from "@/components/mystery/pull-rates-display";
import { RecentPullsFeed } from "@/components/mystery/recent-pulls-feed";
import { MysteryPurchaseButton } from "@/components/mystery/purchase-button";
import { formatCurrency } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface PullRate {
  tierName: string;
  chance: number;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  try {
    const collection = await getCollectionById(id);
    return {
      title: `${collection.name} — Mystery Collections — Card Nimbus`,
      description: `Open a ${collection.tier} mystery pack from Card Nimbus. Guaranteed minimum value on every pull.`,
    };
  } catch {
    return { title: "Mystery Collection — Card Nimbus" };
  }
}

export default async function MysteryCollectionPage({ params }: PageProps) {
  const { id } = await params;

  let collection: Awaited<ReturnType<typeof getCollectionById>>;
  try {
    collection = await getCollectionById(id);
  } catch {
    notFound();
  }

  const recentPulls = await getRecentPulls(15);

  const version = collection.currentVersion;
  const pullRates = version
    ? (version.pullRates as unknown as PullRate[])
    : [];

  // Build pull rates with value ranges from pool items
  const enrichedRates = pullRates.map((rate) => {
    const tierItems = version?.itemsByTier?.[rate.tierName] ?? [];
    const values = tierItems.map((i) => i.lockedValue);
    return {
      ...rate,
      minValue: values.length > 0 ? Math.min(...values) : undefined,
      maxValue: values.length > 0 ? Math.max(...values) : undefined,
    };
  });

  const isSoldOut = !collection.isActive || collection.currentVersion?.stockRemaining === 0;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-gray-900 to-gray-950 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-gray-500">
            <a href="/mystery" className="hover:text-gray-300 transition-colors">
              Mystery Collections
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-300">{collection.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-purple-900/40 text-purple-300 border border-purple-700/40 mb-3">
                {collection.tier} Tier
              </span>
              <h1 className="text-4xl font-black text-white">{collection.name}</h1>
              <p className="mt-2 text-2xl font-black text-white">
                {formatCurrency(collection.price)}
                <span className="text-sm font-normal text-gray-500 ml-2">per pack</span>
              </p>

              {version && (
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-green-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      Guaranteed min:{" "}
                      <strong>{formatCurrency(version.guaranteedMinValue)}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span>
                      {version.stockRemaining} packs remaining
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Purchase button (client component) */}
            <div className="shrink-0">
              <MysteryPurchaseButton
                collectionId={collection.id}
                price={collection.price}
                tier={collection.tier}
                disabled={isSoldOut || !version}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 py-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Left: pull rates + pool items */}
        <div className="space-y-10">
          {enrichedRates.length > 0 && (
            <section>
              <PullRatesDisplay
                pullRates={enrichedRates}
                guaranteedMinValue={version?.guaranteedMinValue}
              />
            </section>
          )}

          {/* Pool items by tier */}
          {version && Object.keys(version.itemsByTier).length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                Pool Contents
              </h3>
              <div className="space-y-4">
                {Object.entries(version.itemsByTier).map(([tierName, items]) => (
                  <div key={tierName} className="rounded-xl border border-white/5 bg-gray-900 overflow-hidden">
                    <div className="px-4 py-2 border-b border-white/5 bg-gray-800/40 text-xs font-bold uppercase tracking-widest text-gray-400">
                      {tierName} ({items.length} items)
                    </div>
                    <div className="divide-y divide-white/5">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between px-4 py-3 text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-gray-300 truncate">
                              {item.productId ?? item.cardId ?? item.id}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 shrink-0 text-xs text-gray-500 ml-3">
                            <span>{item.quantity} left</span>
                            <span className="text-green-400 font-semibold">
                              {formatCurrency(item.lockedValue)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right: recent pulls */}
        <aside>
          <RecentPullsFeed
            pulls={recentPulls.map((p) => ({
              ...p,
              pulledAt: p.pulledAt.toISOString(),
              version: p.version
                ? {
                    collection: p.version.collection,
                  }
                : null,
            }))}
          />
        </aside>
      </div>
    </main>
  );
}
