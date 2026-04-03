"use client";

import { useEffect, useState } from "react";
import { ParticipantList } from "./participant-list";

interface Participant {
  userId: string;
  name: string | null;
  ticketCount: number;
}

interface RaffleParticipantsSectionProps {
  raffleId: string;
}

export function RaffleParticipantsSection({
  raffleId,
}: RaffleParticipantsSectionProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/raffles/${raffleId}/participants`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setParticipants(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [raffleId]);

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-text-secondary uppercase tracking-wide">
        Participants
      </h3>
      {loading ? (
        <div className="py-4 text-center text-sm text-text-muted">
          Loading…
        </div>
      ) : (
        <ParticipantList participants={participants} />
      )}
    </div>
  );
}
