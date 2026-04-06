"use client";

import { CONTINENTS, countriesByContinent } from "@/lib/countries";

interface CountrySelectGroupedProps {
  value: string;
  onChange: (code: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

export function CountrySelectGrouped({
  value,
  onChange,
  label,
  error,
  required,
}: CountrySelectGroupedProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full bg-surface-raised border rounded-xl px-3 py-2 text-sm text-text-primary transition-colors duration-150 outline-none cursor-pointer focus:border-nimbus-500 focus:ring-2 focus:ring-nimbus-500/20 ${
          error ? "border-red-500" : "border-surface-border"
        }`}
      >
        <option value="">Select a country</option>
        {CONTINENTS.map((continent) => {
          const countries = countriesByContinent(continent);
          if (countries.length === 0) return null;
          return (
            <optgroup key={continent} label={`── ${continent} ──`}>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
