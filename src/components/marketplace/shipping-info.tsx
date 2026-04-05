"use client";

import { useState } from "react";
import { CONTINENTS, countryByCode, groupByContinent, countriesByContinent, type Continent } from "@/lib/countries";

interface ShippingInfoProps {
  shipsToCountries: string[];
  sellerCountry?: string | null;
}

export function ShippingInfo({ shipsToCountries, sellerCountry }: ShippingInfoProps) {
  const [expanded, setExpanded] = useState(false);

  if (shipsToCountries.length === 0) {
    return (
      <div className="rounded-2xl border border-surface-border bg-white p-5">
        <h3 className="text-sm font-bold text-text-primary mb-1">Shipping</h3>
        <p className="text-sm text-text-muted">Seller has not specified shipping destinations.</p>
      </div>
    );
  }

  const grouped = groupByContinent(shipsToCountries);
  const sellerCountryObj = sellerCountry ? countryByCode(sellerCountry) : undefined;

  // Per-continent coverage summary
  const summary: { continent: Continent; covered: number; total: number }[] = CONTINENTS.map(
    (cont) => ({
      continent: cont,
      covered: grouped.get(cont)?.length ?? 0,
      total: countriesByContinent(cont).length,
    })
  ).filter((s) => s.covered > 0);

  return (
    <section className="rounded-2xl border-2 border-nimbus-500 bg-white p-6 shadow-[0_4px_0_0_rgba(255,0,0,0.12)]">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nimbus-50 text-nimbus-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-black text-text-primary">Shipping</h2>
          {sellerCountryObj && (
            <p className="text-sm text-text-muted">
              Ships from <span className="font-semibold text-text-primary">{sellerCountryObj.name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Continent summary */}
      <div className="flex flex-wrap gap-2 mb-4">
        {summary.map((s) => (
          <span
            key={s.continent}
            className="inline-flex items-center gap-1.5 rounded-full bg-surface-overlay border border-surface-border px-3 py-1 text-xs font-bold text-text-primary"
          >
            {s.continent}
            <span className="text-[10px] font-normal text-text-muted">
              {s.covered}/{s.total}
            </span>
          </span>
        ))}
      </div>

      {/* Expand */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1 text-sm font-bold text-nimbus-600 hover:text-nimbus-700 transition-colors"
      >
        {expanded ? "Hide" : "Show"} {shipsToCountries.length} destination{shipsToCountries.length !== 1 ? "s" : ""}
        <svg
          className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-surface-border pt-4">
          {CONTINENTS.map((cont) => {
            const countries = grouped.get(cont);
            if (!countries || countries.length === 0) return null;
            return (
              <div key={cont}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  {cont}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {countries.map((c) => (
                    <span
                      key={c.code}
                      className="rounded-md bg-nimbus-50 border border-nimbus-200 px-2 py-1 text-xs font-semibold text-nimbus-700"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
