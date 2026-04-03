"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface BuyTicketButtonProps {
  raffleId: string;
  ticketPrice: number;
  maxTicketsPerUser: number;
}

export function BuyTicketButton({
  raffleId,
  ticketPrice,
  maxTicketsPerUser,
}: BuyTicketButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleBuy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/raffles/${raffleId}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to reserve tickets");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-800 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-400">
        Reservation confirmed! Complete payment to secure your{" "}
        {quantity === 1 ? "ticket" : `${quantity} tickets`}.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {maxTicketsPerUser > 1 && (
        <div className="flex items-center gap-3">
          <label
            htmlFor="quantity"
            className="text-sm text-text-secondary"
          >
            Quantity
          </label>
          <select
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="rounded-lg border border-surface-border bg-surface-overlay px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-nimbus-500"
          >
            {Array.from({ length: maxTicketsPerUser }, (_, i) => i + 1).map(
              (n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              )
            )}
          </select>
          <span className="text-sm text-text-muted">
            = {formatCurrency(ticketPrice * quantity)}
          </span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <Button
        size="lg"
        loading={loading}
        onClick={handleBuy}
        className="w-full"
      >
        Buy {quantity === 1 ? "Ticket" : `${quantity} Tickets`} —{" "}
        {formatCurrency(ticketPrice * quantity)}
      </Button>
    </div>
  );
}
