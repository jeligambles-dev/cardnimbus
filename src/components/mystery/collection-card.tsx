"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface CollectionCardProps {
  id: string;
  name: string;
  tier: string;
  price: number;
  guaranteedMinValue?: number;
  stockRemaining?: number;
  pullRates?: Array<{ tierName: string; chance: number }>;
  status?: string;
}

const TIER_CONFIG: Record<
  string,
  { border: string; glow: string; badge: string; label: string }
> = {
  Bronze: {
    border: "border-amber-700",
    glow: "shadow-amber-700/40",
    badge: "bg-amber-900/60 text-amber-300 border border-amber-700/50",
    label: "text-amber-400",
  },
  Silver: {
    border: "border-slate-400",
    glow: "shadow-slate-400/40",
    badge: "bg-slate-800/60 text-slate-300 border border-slate-500/50",
    label: "text-slate-300",
  },
  Gold: {
    border: "border-yellow-400",
    glow: "shadow-yellow-400/40",
    badge: "bg-yellow-900/60 text-yellow-300 border border-yellow-500/50",
    label: "text-yellow-300",
  },
  Platinum: {
    border: "border-cyan-300",
    glow: "shadow-cyan-300/50",
    badge: "bg-cyan-900/60 text-cyan-200 border border-cyan-400/50",
    label: "text-cyan-200",
  },
};

const DEFAULT_CONFIG = {
  border: "border-purple-500",
  glow: "shadow-purple-500/40",
  badge: "bg-purple-900/60 text-purple-300 border border-purple-500/50",
  label: "text-purple-300",
};

function getTierConfig(tier: string) {
  return TIER_CONFIG[tier] ?? DEFAULT_CONFIG;
}

export function CollectionCard({
  id,
  name,
  tier,
  price,
  guaranteedMinValue,
  stockRemaining,
  pullRates,
  status,
}: CollectionCardProps) {
  const config = getTierConfig(tier);
  const isSoldOut = status === "SOLD_OUT" || stockRemaining === 0;
  const isLowStock = status === "LOW_STOCK" || (stockRemaining !== undefined && stockRemaining > 0 && stockRemaining <= 10);

  return (
    <Link
      href={`/mystery/${id}`}
      className={`group relative block rounded-2xl border-2 ${config.border} bg-gray-900 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:${config.glow} ${isSoldOut ? "opacity-60 pointer-events-none" : ""}`}
    >
      {/* Glowing top bar */}
      <div
        className={`h-1 w-full bg-gradient-to-r ${
          tier === "Bronze"
            ? "from-amber-800 via-amber-500 to-amber-800"
            : tier === "Silver"
            ? "from-slate-600 via-slate-300 to-slate-600"
            : tier === "Gold"
            ? "from-yellow-700 via-yellow-400 to-yellow-700"
            : tier === "Platinum"
            ? "from-cyan-800 via-cyan-300 to-cyan-800"
            : "from-purple-700 via-purple-400 to-purple-700"
        }`}
      />

      <div className="p-6">
        {/* Tier badge + status */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${config.badge}`}
          >
            {tier}
          </span>
          {isSoldOut && (
            <span className="px-2 py-1 rounded text-xs font-semibold bg-red-900/60 text-red-400 border border-red-700/50">
              SOLD OUT
            </span>
          )}
          {isLowStock && !isSoldOut && (
            <span className="px-2 py-1 rounded text-xs font-semibold bg-orange-900/60 text-orange-400 border border-orange-700/50 animate-pulse">
              LOW STOCK
            </span>
          )}
        </div>

        {/* Collection name */}
        <h2 className={`text-xl font-extrabold mb-1 ${config.label}`}>
          {name}
        </h2>

        {/* Price */}
        <p className="text-3xl font-black text-white mt-2 mb-4">
          {formatCurrency(price)}
        </p>

        {/* Guaranteed min value */}
        {guaranteedMinValue !== undefined && (
          <p className="text-sm text-gray-400 mb-4">
            Guaranteed min value:{" "}
            <span className="text-green-400 font-semibold">
              {formatCurrency(guaranteedMinValue)}
            </span>
          </p>
        )}

        {/* Quick pull rate preview */}
        {pullRates && pullRates.length > 0 && (
          <div className="space-y-1 mb-4">
            {pullRates.slice(0, 3).map((rate) => (
              <div
                key={rate.tierName}
                className="flex items-center justify-between text-xs text-gray-500"
              >
                <span>{rate.tierName}</span>
                <span className="font-mono">{(rate.chance * 100).toFixed(1)}%</span>
              </div>
            ))}
            {pullRates.length > 3 && (
              <p className="text-xs text-gray-600">
                +{pullRates.length - 3} more tiers
              </p>
            )}
          </div>
        )}

        {/* Stock indicator */}
        {stockRemaining !== undefined && stockRemaining > 0 && (
          <p className="text-xs text-gray-500">
            {stockRemaining} packs remaining
          </p>
        )}

        {/* CTA */}
        {!isSoldOut && (
          <div
            className={`mt-5 w-full py-3 rounded-xl text-center font-bold text-sm uppercase tracking-widest transition-all duration-200 ${
              tier === "Bronze"
                ? "bg-amber-700 hover:bg-amber-600 text-white"
                : tier === "Silver"
                ? "bg-slate-600 hover:bg-slate-500 text-white"
                : tier === "Gold"
                ? "bg-yellow-600 hover:bg-yellow-500 text-black"
                : tier === "Platinum"
                ? "bg-cyan-700 hover:bg-cyan-600 text-white"
                : "bg-purple-700 hover:bg-purple-600 text-white"
            }`}
          >
            Open Pack
          </div>
        )}
      </div>
    </Link>
  );
}
