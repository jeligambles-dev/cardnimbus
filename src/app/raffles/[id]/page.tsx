import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getRaffleById, getRaffleOdds } from "@/services/raffle.service";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/raffle/progress-bar";
import { CountdownTimer } from "@/components/raffle/countdown-timer";
import { BuyTicketButton } from "@/components/raffle/buy-ticket-button";
import { RaffleParticipantsSection } from "@/components/raffle/raffle-participants-section";
import { DrawAnimation } from "@/components/raffle/draw-animation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  try {
    const raffle = await getRaffleById(id);
    return { title: `${raffle.title} — Card Nimbus Raffles` };
  } catch {
    return { title: "Raffle — Card Nimbus" };
  }
}

export default async function RaffleDetailPage({ params }: PageProps) {
  const { id } = await params;

  let raffle;
  try {
    raffle = await getRaffleById(id);
  } catch {
    notFound();
  }

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const odds = await getRaffleOdds(id, userId);

  const isCompleted = raffle.status === "COMPLETED";
  const isActive = raffle.status === "ACTIVE";
  const canBuy = isActive;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
        {/* Left: images + draw result */}
        <div className="lg:col-span-3 space-y-6">
          {/* Prize gallery */}
          {raffle.prizeImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {raffle.prizeImages.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={`${raffle.title} prize ${i + 1}`}
                  className={`rounded-xl object-cover ${
                    i === 0
                      ? "col-span-2 aspect-video"
                      : "aspect-square"
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-surface-border bg-surface-raised text-text-muted">
              No prize images
            </div>
          )}

          {/* Post-draw section */}
          {isCompleted && raffle.winner && (
            <div className="space-y-6">
              <DrawAnimation
                winnerName={raffle.winner.name ?? "Winner"}
                ticketNumber={raffle.winningTicketNumber ?? 0}
              />

              {/* Verification */}
              <div className="rounded-xl border border-surface-border bg-surface-raised p-5 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
                  How this was verified
                </h3>
                <p className="text-sm text-text-secondary">
                  Card Nimbus uses provably fair random draws. A cryptographically
                  secure random seed (32 bytes) was generated server-side. The
                  winning ticket number is derived as{" "}
                  <code className="rounded bg-surface-overlay px-1 font-mono text-xs text-nimbus-400">
                    seed % totalTickets
                  </code>
                  .
                </p>
                <div className="space-y-1.5 text-xs text-text-muted">
                  <p>
                    <span className="font-medium text-text-secondary">
                      Random seed:
                    </span>{" "}
                    <span className="break-all font-mono">
                      {raffle.randomSeed ?? "—"}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-text-secondary">
                      Winning ticket:
                    </span>{" "}
                    #{raffle.winningTicketNumber}
                  </p>
                  <p>
                    <span className="font-medium text-text-secondary">
                      Drawn at:
                    </span>{" "}
                    {raffle.drawnAt
                      ? new Date(raffle.drawnAt).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: details + actions */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-extrabold text-text-primary leading-tight">
                {raffle.title}
              </h1>
              <Badge
                variant={
                  isCompleted
                    ? "default"
                    : isActive
                    ? "success"
                    : "nimbus"
                }
              >
                {raffle.status}
              </Badge>
            </div>
            {raffle.description && (
              <p className="mt-2 text-sm text-text-secondary">
                {raffle.description}
              </p>
            )}
          </div>

          {/* Prize value */}
          <div className="rounded-xl border border-surface-border bg-surface-raised p-4 space-y-1">
            <p className="text-xs text-text-muted uppercase tracking-wide">
              Prize value
            </p>
            <p className="text-2xl font-bold text-nimbus-400">
              {formatCurrency(raffle.prizeValue)}
            </p>
          </div>

          {/* Progress */}
          <ProgressBar
            filled={raffle.filledSlots}
            total={raffle.totalSlots}
          />

          {/* Countdown */}
          {!isCompleted && (
            <div className="flex items-center gap-2 text-sm">
              <svg
                className="h-4 w-4 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-text-secondary">Ends in:</span>
              <CountdownTimer endsAt={raffle.endsAt} className="font-bold" />
            </div>
          )}

          {/* Odds */}
          <div className="rounded-xl border border-surface-border bg-surface-raised p-4 space-y-2 text-sm">
            <p className="font-medium text-text-primary">Odds</p>
            <p className="text-text-secondary">
              Per ticket:{" "}
              <span className="text-nimbus-400 font-mono">
                {odds.totalTickets > 0
                  ? `1 in ${odds.totalTickets.toLocaleString()}`
                  : "—"}
              </span>
            </p>
            {"personalOdds" in odds && (
              <p className="text-text-secondary">
                Your odds:{" "}
                <span className="text-nimbus-400 font-mono">
                  {odds.personalOdds
                    ? `${(odds.personalOdds * 100).toFixed(2)}%`
                    : "0%"}
                </span>
              </p>
            )}
          </div>

          {/* Buy */}
          {canBuy && (
            <BuyTicketButton
              raffleId={raffle.id}
              ticketPrice={raffle.ticketPrice}
              maxTicketsPerUser={raffle.maxTicketsPerUser}
            />
          )}

          {/* Participants */}
          <RaffleParticipantsSection raffleId={raffle.id} />
        </div>
      </div>
    </div>
  );
}
