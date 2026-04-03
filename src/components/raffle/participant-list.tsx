"use client";

interface Participant {
  userId: string;
  name: string | null;
  ticketCount: number;
}

interface ParticipantListProps {
  participants: Participant[];
  className?: string;
}

export function ParticipantList({
  participants,
  className = "",
}: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-text-muted">
        No participants yet. Be the first!
      </p>
    );
  }

  const sorted = [...participants].sort(
    (a, b) => b.ticketCount - a.ticketCount
  );

  return (
    <div
      className={`max-h-80 overflow-y-auto rounded-xl border border-surface-border ${className}`}
    >
      <ul className="divide-y divide-surface-border">
        {sorted.map((p, i) => (
          <li
            key={p.userId || `anon-${i}`}
            className="flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-surface-overlay/40"
          >
            <span className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-nimbus-500/20 text-xs font-bold text-nimbus-400">
                {(p.name ?? "?")[0]?.toUpperCase()}
              </span>
              <span className="text-text-primary">
                {p.name ?? "Anonymous"}
              </span>
            </span>
            <span className="rounded-full bg-surface-overlay px-2.5 py-0.5 text-xs font-medium text-text-secondary">
              {p.ticketCount} {p.ticketCount === 1 ? "ticket" : "tickets"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
