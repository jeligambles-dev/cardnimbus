"use client";

interface PullRate {
  tierName: string;
  chance: number;
  minValue?: number;
  maxValue?: number;
}

interface PullRatesDisplayProps {
  pullRates: PullRate[];
  guaranteedMinValue?: number;
}

const TIER_COLORS: Record<string, { bar: string; text: string; bg: string }> = {
  Bronze: { bar: "bg-amber-600", text: "text-amber-400", bg: "bg-amber-900/20" },
  Silver: { bar: "bg-slate-400", text: "text-slate-300", bg: "bg-slate-800/30" },
  Gold: { bar: "bg-yellow-400", text: "text-yellow-300", bg: "bg-yellow-900/20" },
  Platinum: { bar: "bg-cyan-400", text: "text-cyan-300", bg: "bg-cyan-900/20" },
  Common: { bar: "bg-gray-500", text: "text-gray-400", bg: "bg-gray-800/30" },
  Rare: { bar: "bg-blue-500", text: "text-blue-300", bg: "bg-blue-900/20" },
  "Ultra Rare": { bar: "bg-purple-500", text: "text-purple-300", bg: "bg-purple-900/20" },
  Secret: { bar: "bg-pink-500", text: "text-pink-300", bg: "bg-pink-900/20" },
};

const DEFAULT_COLORS = {
  bar: "bg-indigo-500",
  text: "text-indigo-300",
  bg: "bg-indigo-900/20",
};

function getColors(tierName: string) {
  return TIER_COLORS[tierName] ?? DEFAULT_COLORS;
}

export function PullRatesDisplay({
  pullRates,
  guaranteedMinValue,
}: PullRatesDisplayProps) {
  const sorted = [...pullRates].sort((a, b) => b.chance - a.chance);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
        Pull Rate Breakdown
      </h3>

      {sorted.map((rate) => {
        const colors = getColors(rate.tierName);
        const pct = (rate.chance * 100).toFixed(2);

        return (
          <div
            key={rate.tierName}
            className={`rounded-xl p-3 ${colors.bg} border border-white/5`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-semibold text-sm ${colors.text}`}>
                {rate.tierName}
              </span>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                {rate.minValue !== undefined && rate.maxValue !== undefined && (
                  <span>
                    ${rate.minValue.toFixed(0)}–${rate.maxValue.toFixed(0)}
                  </span>
                )}
                <span className={`font-bold font-mono ${colors.text}`}>
                  {pct}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${colors.bar} rounded-full transition-all duration-700`}
                style={{ width: `${Math.min(parseFloat(pct), 100)}%` }}
              />
            </div>
          </div>
        );
      })}

      {guaranteedMinValue !== undefined && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-700/40 bg-green-900/10 px-4 py-3">
          <svg
            className="h-4 w-4 text-green-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-green-400">
            Every pull guaranteed ≥{" "}
            <span className="font-bold">${guaranteedMinValue.toFixed(2)}</span>{" "}
            in value
          </p>
        </div>
      )}
    </div>
  );
}
