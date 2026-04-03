import { getActiveRaffles } from "@/services/raffle.service";
import { RaffleCard } from "@/components/raffle/raffle-card";

export const metadata = {
  title: "Raffles — Card Nimbus",
  description: "Enter our provably fair raffles and win rare Pokémon cards.",
};

export default async function RafflesPage() {
  const raffles = await getActiveRaffles();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          Active Raffles
        </h1>
        <p className="mt-2 text-text-secondary">
          Provably fair draws — every ticket has a real chance.
        </p>
      </div>

      {raffles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-surface-border bg-surface-raised py-20">
          <p className="text-xl font-semibold text-text-primary">
            No active raffles right now
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Check back soon — new prizes drop regularly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {raffles.map((raffle) => (
            <RaffleCard
              key={raffle.id}
              id={raffle.id}
              title={raffle.title}
              prizeImages={raffle.prizeImages}
              prizeValue={raffle.prizeValue}
              ticketPrice={raffle.ticketPrice}
              totalSlots={raffle.totalSlots}
              filledSlots={raffle.filledSlots}
              endsAt={raffle.endsAt}
              status={raffle.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}
