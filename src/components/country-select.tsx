"use client";

import { COUNTRIES } from "@/lib/countries";

interface CountrySelectProps {
  value: string;
  onChange: (code: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export function CountrySelect({
  value,
  onChange,
  label,
  required,
  placeholder = "Select a country",
}: CountrySelectProps) {
  const sorted = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));
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
        className="w-full bg-surface-raised border border-surface-border rounded-xl px-3 py-2 text-sm text-text-primary focus:border-nimbus-500 focus:ring-2 focus:ring-nimbus-500/20 outline-none"
      >
        <option value="">{placeholder}</option>
        {sorted.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
