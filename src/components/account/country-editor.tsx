"use client";

import { useState } from "react";
import { CountrySelect } from "@/components/country-select";
import { countryByCode } from "@/lib/countries";
import { toast } from "@/components/ui/toast";

interface CountryEditorProps {
  initialCountry: string | null;
}

export function CountryEditor({ initialCountry }: CountryEditorProps) {
  const [country, setCountry] = useState(initialCountry ?? "");
  const [editing, setEditing] = useState(!initialCountry);
  const [saving, setSaving] = useState(false);

  const save = async (code: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: code }),
      });
      if (!res.ok) throw new Error();
      setCountry(code);
      setEditing(false);
      toast("Country saved.", "success");
    } catch {
      toast("Failed to save country.", "error");
    } finally {
      setSaving(false);
    }
  };

  const countryObj = country ? countryByCode(country) : undefined;

  if (editing) {
    return (
      <div className="space-y-3">
        <CountrySelect
          label="Country"
          value={country}
          onChange={(code) => code && save(code)}
          required
        />
        {saving && <p className="text-xs text-text-muted">Saving…</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
          Country
        </p>
        <p className="text-sm font-semibold text-text-primary">
          {countryObj?.name ?? "Not set"}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-xs font-bold text-nimbus-600 hover:text-nimbus-700 transition-colors"
      >
        {country ? "Change" : "Set"}
      </button>
    </div>
  );
}
