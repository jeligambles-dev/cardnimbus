import { getActiveCollections } from "@/services/mystery.service";
import { CollectionCard } from "@/components/mystery/collection-card";

export const metadata = {
  title: "Mystery Collections — Card Nimbus",
  description:
    "Open mystery packs and pull rare Pokémon cards. Guaranteed minimum value on every pull.",
};

interface PullRate {
  tierName: string;
  chance: number;
}

export default async function MysteryPage() {
  const collections = await getActiveCollections();

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-gray-900 to-gray-950 py-16 px-4 text-center">
        {/* Radial glow behind title */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-96 w-96 rounded-full bg-purple-900/20 blur-3xl" />
        </div>

        <div className="relative">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-purple-400">
            Limited Supply · Guaranteed Value
          </p>
          <h1 className="text-5xl font-black tracking-tight text-white md:text-6xl">
            Mystery Collections
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-lg text-gray-400">
            Every pack contains a hand-picked card worth at least its guaranteed
            minimum. Roll your tier, reveal your pull.
          </p>
        </div>
      </div>

      {/* Collections grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {collections.length === 0 ? (
          <div className="text-center py-24 text-gray-600">
            <p className="text-4xl mb-4">📦</p>
            <p className="text-xl font-semibold">No active collections right now.</p>
            <p className="mt-2 text-sm">Check back soon — new packs drop regularly.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-8">
              {collections.length} collection{collections.length !== 1 ? "s" : ""} available
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {collections.map((c) => (
                <CollectionCard
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  tier={c.tier}
                  price={c.price}
                  guaranteedMinValue={c.currentVersion?.guaranteedMinValue}
                  stockRemaining={c.currentVersion?.stockRemaining}
                  pullRates={
                    c.currentVersion?.pullRates
                      ? (c.currentVersion.pullRates as unknown as PullRate[])
                      : undefined
                  }
                  status={c.currentVersion?.status}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* How it works */}
      <div className="border-t border-white/5 bg-gray-900/40 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 text-white">
            How Mystery Collections Work
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Choose a Pack",
                desc: "Pick a tier — Bronze, Silver, Gold, or Platinum. Each has different pull rates and guaranteed values.",
              },
              {
                step: "2",
                title: "Pull Your Card",
                desc: "A cryptographically fair roll determines your tier and item. Every pull is weighted and verifiable.",
              },
              {
                step: "3",
                title: "Reveal & Keep",
                desc: "Watch the animated reveal, then find your new card in your collection. Guaranteed minimum value on every pull.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="rounded-xl border border-white/5 bg-gray-900 p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-900/40 text-purple-400 font-black text-xl border border-purple-700/40">
                  {step}
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
