"use client";

import { useEffect, useState } from "react";

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
}

function buildPath(points: Point[], width: number, height: number, padX: number, padY: number) {
  if (points.length === 0) return { linePath: "", areaPath: "", dots: [] as { x: number; y: number; price: number; date: string }[] };
  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const coords = points.map((p, i) => {
    const x = padX + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
    const y = padY + innerH - ((p.price - min) / range) * innerH;
    return { x, y, price: p.price, date: p.date };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - padY} L ${coords[0].x} ${height - padY} Z`;

  return { linePath, areaPath, dots: coords };
}

export function PriceTrend({ listingId, currentPrice }: PriceTrendProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/listings/${listingId}/price-history`)
      .then((r) => r.json())
      .then((data) => {
        setPoints(data.points ?? []);
        setSummary(data.summary);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [listingId]);

  if (loading) {
    return (
      <div className="rounded-2xl border-2 border-nimbus-500 bg-white p-6 shadow-[0_4px_0_0_rgba(255,0,0,0.12)]">
        <div className="h-5 w-40 bg-surface-overlay rounded animate-pulse" />
        <div className="mt-4 h-32 bg-surface-overlay rounded animate-pulse" />
      </div>
    );
  }

  if (points.length === 0) {
    return null;
  }

  const width = 600;
  const height = 180;
  const padX = 12;
  const padY = 16;
  const { linePath, areaPath, dots } = buildPath(points, width, height, padX, padY);

  const hoverPoint = hover !== null ? dots[hover] : null;

  const vsAvg = summary && summary.avg > 0
    ? Math.round(((currentPrice - summary.avg) / summary.avg) * 100)
    : 0;

  return (
    <div className="rounded-2xl border-2 border-nimbus-500 bg-white p-6 shadow-[0_4px_0_0_rgba(255,0,0,0.12)]">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-lg font-black text-text-primary">Price History</h2>
          <p className="text-xs text-text-muted">
            {summary?.count} past sale{summary?.count !== 1 ? "s" : ""} of this card
          </p>
        </div>
        {summary && (
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              {vsAvg >= 0 ? "Above average" : "Below average"}
            </p>
            <p
              className={`text-lg font-black ${
                vsAvg < 0 ? "text-emerald-600" : vsAvg > 0 ? "text-red-600" : "text-text-primary"
              }`}
            >
              {vsAvg > 0 ? "+" : ""}{vsAvg}%
            </p>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff0000" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid line at current price */}
          <line
            x1={padX}
            x2={width - padX}
            y1={height / 2}
            y2={height / 2}
            stroke="#e5e7eb"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          {/* Fill area */}
          <path d={areaPath} fill="url(#priceGradient)" />
          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#ff0000"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Dots */}
          {dots.map((d, i) => (
            <g key={i}>
              <circle
                cx={d.x}
                cy={d.y}
                r={hover === i ? 6 : 4}
                fill="white"
                stroke="#ff0000"
                strokeWidth="2"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {hoverPoint && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg bg-slate-900 text-white px-3 py-1.5 text-xs font-bold shadow-lg -translate-x-1/2 -translate-y-full mb-2"
            style={{
              left: `${(hoverPoint.x / width) * 100}%`,
              top: `${(hoverPoint.y / height) * 100}%`,
            }}
          >
            ${hoverPoint.price.toFixed(2)}
            <div className="text-[10px] font-normal text-white/70">
              {new Date(hoverPoint.date).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {summary && (
        <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-surface-border">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Min</p>
            <p className="text-sm font-black text-text-primary">${summary.min.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Avg</p>
            <p className="text-sm font-black text-nimbus-600">${summary.avg.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Max</p>
            <p className="text-sm font-black text-text-primary">${summary.max.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
