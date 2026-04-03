"use client";

import { useState } from "react";
import { RevealAnimation, type RevealResult } from "./reveal-animation";
import { formatCurrency } from "@/lib/utils";

interface MysteryPurchaseButtonProps {
  collectionId: string;
  price: number;
  tier: string;
  disabled?: boolean;
}

const TIER_BTN: Record<string, string> = {
  Bronze: "bg-amber-700 hover:bg-amber-600 text-white border-amber-600",
  Silver: "bg-slate-600 hover:bg-slate-500 text-white border-slate-500",
  Gold: "bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-400",
  Platinum: "bg-cyan-700 hover:bg-cyan-600 text-white border-cyan-500",
};
const DEFAULT_BTN = "bg-purple-700 hover:bg-purple-600 text-white border-purple-500";

export function MysteryPurchaseButton({
  collectionId,
  price,
  tier,
  disabled = false,
}: MysteryPurchaseButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pullResult, setPullResult] = useState<RevealResult | null>(null);

  const btnClass = TIER_BTN[tier] ?? DEFAULT_BTN;

  async function handlePurchase() {
    setError(null);
    setLoading(true);

    try {
      // In a real flow, you'd collect payment first and pass the paymentId.
      // For now we use a placeholder payment ID.
      const paymentId = `pay_demo_${Date.now()}`;

      const res = await fetch(`/api/mystery/${collectionId}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Purchase failed");
      }

      const result: RevealResult = await res.json();
      setPullResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={handlePurchase}
          disabled={disabled || loading}
          className={`relative px-8 py-4 rounded-xl font-black text-lg uppercase tracking-wider border transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${btnClass}`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Opening…
            </span>
          ) : disabled ? (
            "Sold Out"
          ) : (
            `Open Pack — ${formatCurrency(price)}`
          )}
        </button>

        {error && (
          <p className="text-sm text-red-400 max-w-xs text-right">{error}</p>
        )}
      </div>

      <RevealAnimation
        result={pullResult}
        onClose={() => setPullResult(null)}
      />
    </>
  );
}
