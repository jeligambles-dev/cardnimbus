"use client";

import { useEffect, useMemo, useState } from "react";

interface Point {
  price: number;
  date: string;
}

interface Summary {
  count: number;
  avg: number;
  min: number;
  max: number;
  latest: number;
}

interface PriceTrendProps {
  listingId: string;
  currentPrice: number;
  retailPrice?: number | null;
}

type RangeKey = "1M" | "3M" | "6M" | "YTD" | "1Y" | "ALL";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "1M", label: "1M" },
  { key: "3M", label: "3M" },
  { key: "6M", label: "6M" },
  { key: "YTD", label: "YTD" },
  { key: "1Y", label: "1Y" },
  { key: "ALL", label: "All" },
];

function rangeStart(key: RangeKey): Date | null {
  const now = new Date();
  switch (key) {
    case "1M": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      return d;
    }
    case "3M": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      return d;
    }
    case "6M": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 6);
      return d;
    }
    case "YTD":
      return new Date(now.getFullYear(), 0, 1);
    case "1Y": {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      return d;
    }
    case "ALL":
    default:
      return null;
  }
}

function formatMoney(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return `$${Math.round(n)}`;
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function stdDev(nums: number[]): number {
  if (nums.length < 2) return 0;
  const mean = nums.reduce((s, n) => s + n, 0) / nums.length;
  const variance = nums.reduce((s, n) => s + (n - mean) ** 2, 0) / nums.length;
  return Math.sqrt(variance);
}

export function PriceTrend({ listingId, currentPrice, retailPrice }: PriceTrendProps) {
  const [allPoints, setAllPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("ALL");
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/listings/${listingId}/price-history`)
      .then((r) => r.json())
      .then((data) => {
        setAllPoints(data.points ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [listingId]);

  const filteredPoints = useMemo(() => {
    const start = rangeStart(range);
    if (!start) return allPoints;
    return allPoints.filter((p) => new Date(p.date) >= start);
  }, [allPoints, range]);

  const rangeSummary: Summary | null = useMemo(() => {
    if (filteredPoints.length === 0) return null;
    const prices = filteredPoints.map((p) => p.price);
    return {
      count: prices.length,
      avg: prices.reduce((s, p) => s + p, 0) / prices.length,
      min: Math.min(...prices),
      max: Math.max(...prices),
      latest: prices[prices.length - 1],
    };
  }, [filteredPoints]);

  const yearSummary: Summary | null = useMemo(() => {
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    const pts = allPoints.filter((p) => new Date(p.date) >= yearAgo);
    if (pts.length === 0) return null;
    const prices = pts.map((p) => p.price);
    return {
      count: prices.length,
      avg: prices.reduce((s, p) => s + p, 0) / prices.length,
      min: Math.min(...prices),
      max: Math.max(...prices),
      latest: prices[prices.length - 1],
    };
  }, [allPoints]);

  const threeMoSummary: Summary | null = useMemo(() => {
    const start = new Date();
    start.setMonth(start.getMonth() - 3);
    const pts = allPoints.filter((p) => new Date(p.date) >= start);
    if (pts.length === 0) return null;
    const prices = pts.map((p) => p.price);
    return {
      count: prices.length,
      avg: prices.reduce((s, p) => s + p, 0) / prices.length,
      min: Math.min(...prices),
      max: Math.max(...prices),
      latest: prices[prices.length - 1],
    };
  }, [allPoints]);

  const volatility = useMemo(() => {
    if (!yearSummary || yearSummary.avg === 0) return 0;
    const prices = allPoints
      .filter((p) => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 1);
        return new Date(p.date) >= d;
      })
      .map((p) => p.price);
    return Math.round((stdDev(prices) / yearSummary.avg) * 100);
  }, [allPoints, yearSummary]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <div className="h-5 w-40 bg-slate-800 rounded animate-pulse" />
        <div className="mt-6 h-48 bg-slate-800 rounded animate-pulse" />
      </div>
    );
  }

  if (allPoints.length === 0) {
    return null;
  }

  // SVG chart dimensions
  const width = 800;
  const height = 220;
  const padL = 48;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const prices = filteredPoints.map((p) => p.price);
  const yMin = prices.length > 0 ? Math.min(...prices) : 0;
  const yMax = prices.length > 0 ? Math.max(...prices) : 1;
  const yRange = yMax - yMin || 1;
  // round y-axis to nice numbers
  const yScale = (p: number) => padT + innerH - ((p - yMin) / yRange) * innerH;
  const xScale = (i: number) =>
    padL +
    (filteredPoints.length <= 1 ? innerW / 2 : (i / (filteredPoints.length - 1)) * innerW);

  const coords = filteredPoints.map((p, i) => ({
    x: xScale(i),
    y: yScale(p.price),
    price: p.price,
    date: p.date,
  }));

  const linePath =
    coords.length > 0
      ? coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ")
      : "";
  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x} ${height - padB} L ${coords[0].x} ${height - padB} Z`
      : "";

  // Y-axis gridlines (4 ticks)
  const yTicks = 4;
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => yMin + (yRange * i) / yTicks);

  // X-axis labels (6 evenly spaced)
  const xTickCount = Math.min(6, filteredPoints.length);
  const xTicks = Array.from({ length: xTickCount }, (_, i) => {
    const idx =
      xTickCount === 1
        ? 0
        : Math.round((i / (xTickCount - 1)) * (filteredPoints.length - 1));
    return { idx, x: xScale(idx), date: filteredPoints[idx]?.date };
  });

  const hoverPoint = hover !== null ? coords[hover] : null;

  const pricePremium =
    retailPrice && retailPrice > 0
      ? Math.round(((currentPrice - retailPrice) / retailPrice) * 100)
      : null;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white">Price History</h2>
          <button
            type="button"
            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            View Sales
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Range tabs */}
        <div className="mt-4 inline-flex items-center rounded-full border border-slate-800 bg-slate-900 p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                range === r.key
                  ? "bg-white text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative px-2 mt-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <defs>
            <linearGradient id="priceAreaDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y gridlines + labels */}
          {yTickVals.map((v, i) => {
            const y = yScale(v);
            return (
              <g key={`y-${i}`}>
                <line
                  x1={padL}
                  x2={width - padR}
                  y1={y}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                <text
                  x={padL - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#64748b"
                  fontFamily="system-ui"
                >
                  {formatMoney(v)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {xTicks.map((t, i) => (
            <text
              key={`x-${i}`}
              x={t.x}
              y={height - 8}
              textAnchor={i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"}
              fontSize="11"
              fill="#64748b"
              fontFamily="system-ui"
            >
              {t.date ? formatDateShort(t.date) : ""}
            </text>
          ))}

          {/* Area fill */}
          {areaPath && <path d={areaPath} fill="url(#priceAreaDark)" />}

          {/* Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#34d399"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover hit areas + line */}
          {hoverPoint && (
            <line
              x1={hoverPoint.x}
              x2={hoverPoint.x}
              y1={padT}
              y2={height - padB}
              stroke="#475569"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          )}
          {coords.map((c, i) => (
            <g key={i}>
              <rect
                x={c.x - 8}
                y={padT}
                width={16}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "crosshair" }}
              />
              {hover === i && (
                <circle cx={c.x} cy={c.y} r={5} fill="#34d399" stroke="#0f172a" strokeWidth="2" />
              )}
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {hoverPoint && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg bg-white text-slate-900 px-3 py-2 text-xs font-bold shadow-xl -translate-x-1/2 -translate-y-full mb-2"
            style={{
              left: `${(hoverPoint.x / width) * 100}%`,
              top: `${(hoverPoint.y / height) * 100}%`,
            }}
          >
            ${hoverPoint.price.toFixed(2)}
            <div className="text-[10px] font-normal text-slate-500">
              {new Date(hoverPoint.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        )}
      </div>

      {/* Historical Data */}
      <div className="p-6 pt-4 border-t border-slate-800 mt-2">
        <h3 className="text-sm font-bold text-white mb-3">Historical Data</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {yearSummary && (
            <StatTile
              value={`$${Math.round(yearSummary.min).toLocaleString()} - $${Math.round(yearSummary.max).toLocaleString()}`}
              label="Price Range"
              sub="Last 12 Months"
            />
          )}
          {threeMoSummary && (
            <StatTile
              value={`$${Math.round(threeMoSummary.min).toLocaleString()} - $${Math.round(threeMoSummary.max).toLocaleString()}`}
              label="Price Range"
              sub="Last 3 Months"
            />
          )}
          <StatTile value={`${volatility}%`} label="Volatility" />
          {threeMoSummary && (
            <StatTile
              value={threeMoSummary.count.toLocaleString()}
              label="Number of Sales"
              sub="Last 3 Months"
            />
          )}
          {pricePremium !== null && (
            <StatTile
              value={`${pricePremium > 0 ? "+" : ""}${pricePremium}%`}
              label="Price Premium"
              sub="vs Retail"
            />
          )}
          {rangeSummary && (
            <StatTile
              value={`$${Math.round(rangeSummary.avg).toLocaleString()}`}
              label="Average Sale Price"
              sub={RANGES.find((r) => r.key === range)?.label ?? ""}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function StatTile({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
      <p className="text-lg font-bold text-white leading-tight">{value}</p>
      <p className="text-xs text-slate-400 mt-1">
        <span className="font-medium text-slate-300">{label}</span>
        {sub && <span className="text-slate-500"> | {sub}</span>}
      </p>
    </div>
  );
}
