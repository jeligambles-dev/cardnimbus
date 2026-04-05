"use client";

import { useState } from "react";

interface DetailRow {
  label: string;
  value: string | null | undefined;
}

interface ProductDetailsProps {
  rows: DetailRow[];
  description: string | null | undefined;
}

export function ProductDetails({ rows, description }: ProductDetailsProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleRows = rows.filter((r) => r.value);

  if (visibleRows.length === 0 && !description) return null;

  const hasLongDescription = (description?.length ?? 0) > 280;
  const displayDescription =
    hasLongDescription && !expanded
      ? description!.slice(0, 280) + "…"
      : description;

  return (
    <section className="rounded-2xl border-2 border-nimbus-500 bg-white p-6 shadow-[0_4px_0_0_rgba(255,0,0,0.12)]">
      <h2 className="text-lg font-black text-text-primary mb-5">Product Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
        {/* Left: metadata */}
        {visibleRows.length > 0 && (
          <dl className="space-y-3">
            {visibleRows.map((row) => (
              <div key={row.label} className="grid grid-cols-[120px_1fr] gap-4">
                <dt className="text-sm text-text-muted">{row.label}</dt>
                <dd className="text-sm font-semibold text-text-primary">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* Right: description */}
        {description && (
          <div className={visibleRows.length === 0 ? "md:col-span-2" : ""}>
            <p className="text-sm font-bold text-text-primary mb-2">Product Description</p>
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
              {displayDescription}
            </p>
            {hasLongDescription && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-nimbus-600 hover:text-nimbus-700 transition-colors"
              >
                {expanded ? "Read Less" : "Read More"}
                <svg
                  className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
