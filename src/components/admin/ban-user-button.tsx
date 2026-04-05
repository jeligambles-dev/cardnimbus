"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface BanUserButtonProps {
  userId: string;
  userEmail: string;
  isBanned: boolean;
  isAdmin: boolean;
  isSelf: boolean;
}

export function BanUserButton({ userId, userEmail, isBanned, isAdmin, isSelf }: BanUserButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);

  if (isSelf || isAdmin) {
    return (
      <span className="text-xs text-text-muted italic">—</span>
    );
  }

  const handleBan = async () => {
    const reason = prompt(`Ban ${userEmail}? Enter a reason (optional):`);
    if (reason === null) return; // cancelled

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || null }),
      });
      if (res.ok) {
        startTransition(() => router.refresh());
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Failed: ${data.error ?? "Unknown error"}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnban = async () => {
    if (!confirm(`Unban ${userEmail}?`)) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "DELETE",
      });
      if (res.ok) {
        startTransition(() => router.refresh());
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Failed: ${data.error ?? "Unknown error"}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const loading = submitting || pending;

  if (isBanned) {
    return (
      <button
        type="button"
        onClick={handleUnban}
        disabled={loading}
        className="text-xs font-bold px-2.5 py-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-60"
      >
        {loading ? "…" : "Unban"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleBan}
      disabled={loading}
      className="text-xs font-bold px-2.5 py-1 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
    >
      {loading ? "…" : "Ban"}
    </button>
  );
}
