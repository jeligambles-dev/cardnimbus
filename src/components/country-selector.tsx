"use client";

import { useMemo, useState } from "react";
import { CONTINENTS, countriesByContinent, type Continent } from "@/lib/countries";

interface CountrySelectorProps {
  selected: string[];
  onChange: (codes: string[]) => void;
}

export function CountrySelector({ selected, onChange }: CountrySelectorProps) {
  const [activeContinent, setActiveContinent] = useState<Continent>(CONTINENTS[0]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggle = (code: string) => {
    const next = new Set(selectedSet);
    if (next.has(code)) {
      next.delete(code);
    } else {
      next.add(code);
    }
    onChange(Array.from(next));
  };

  const selectContinent = (continent: Continent) => {
    const codes = countriesByContinent(continent).map((c) => c.code);
    const next = new Set(selectedSet);
    codes.forEach((c) => next.add(c));
    onChange(Array.from(next));
  };

  const deselectContinent = (continent: Continent) => {
    const codes = new Set(countriesByContinent(continent).map((c) => c.code));
    const next = Array.from(selectedSet).filter((c) => !codes.has(c));
    onChange(next);
  };

  const selectAll = () => {
    const all = CONTINENTS.flatMap((c) => countriesByContinent(c).map((x) => x.code));
    onChange(all);
  };

  const clearAll = () => onChange([]);

  const continentCountries = countriesByContinent(activeContinent);
  const continentSelectedCount = continentCountries.filter((c) =>
    selectedSet.has(c.code)
  ).length;
  const allSelected = continentSelectedCount === continentCountries.length;

  // Selected count per continent (for tab badges)
  const countsByContinent = useMemo(() => {
    const m = new Map<Continent, number>();
    for (const cont of CONTINENTS) {
      m.set(
        cont,
        countriesByContinent(cont).filter((c) => selectedSet.has(c.code)).length
      );
    }
    return m;
  }, [selectedSet]);

  return (
    <div className="rounded-xl border border-surface-border bg-white overflow-hidden">
      {/* Global actions */}
      <div className="flex items-center justify-between gap-2 border-b border-surface-border bg-surface-overlay px-4 py-2.5">
        <span className="text-xs font-semibold text-text-muted">
          {selected.length} {selected.length === 1 ? "country" : "countries"} selected
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs font-bold text-nimbus-600 hover:text-nimbus-700 transition-colors"
          >
            Select all
          </button>
          <span className="text-text-border">|</span>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-bold text-text-muted hover:text-text-primary transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Continent tabs */}
      <div className="flex flex-wrap gap-1 border-b border-surface-border px-3 py-2">
        {CONTINENTS.map((cont) => {
          const count = countsByContinent.get(cont) ?? 0;
          return (
            <button
              key={cont}
              type="button"
              onClick={() => setActiveContinent(cont)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                activeContinent === cont
                  ? "bg-nimbus-500 text-white"
                  : "text-text-secondary hover:bg-surface-overlay"
              }`}
            >
              {cont}
              {count > 0 && (
                <span
                  className={`ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                    activeContinent === cont ? "bg-white text-nimbus-600" : "bg-nimbus-500 text-white"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Continent actions */}
      <div className="flex items-center justify-between border-b border-surface-border px-4 py-2">
        <span className="text-xs font-semibold text-text-muted">
          {continentSelectedCount} of {continentCountries.length} in {activeContinent}
        </span>
        {allSelected ? (
          <button
            type="button"
            onClick={() => deselectContinent(activeContinent)}
            className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
          >
            Deselect all
          </button>
        ) : (
          <button
            type="button"
            onClick={() => selectContinent(activeContinent)}
            className="text-xs font-bold text-nimbus-600 hover:text-nimbus-700 transition-colors"
          >
            Select all {activeContinent}
          </button>
        )}
      </div>

      {/* Country grid */}
      <div className="max-h-64 overflow-y-auto p-3">
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {continentCountries.map((country) => {
            const checked = selectedSet.has(country.code);
            return (
              <label
                key={country.code}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  checked ? "bg-nimbus-50" : "hover:bg-surface-overlay"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(country.code)}
                  className="h-4 w-4 rounded border-surface-border text-nimbus-500 focus:ring-2 focus:ring-nimbus-500/20"
                />
                <span className={checked ? "font-semibold text-text-primary" : "text-text-secondary"}>
                  {country.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
