"use client";

import { useState } from "react";

interface ResetPasswordButtonProps {
  userId: string;
  userEmail: string;
}

export function ResetPasswordButton({ userId, userEmail }: ResetPasswordButtonProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleClick = async () => {
    if (sending || sent) return;
    if (!confirm(`Send password reset email to ${userEmail}?`)) return;

    setSending(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
      });
      if (res.ok) {
        setSent(true);
        setTimeout(() => setSent(false), 5000);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Failed: ${data.error ?? "Unknown error"}`);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Network error");
    } finally {
      setSending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={sending || sent}
      className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
        sent
          ? "bg-emerald-100 text-emerald-700 cursor-default"
          : "text-nimbus-600 hover:bg-nimbus-50"
      } disabled:opacity-60`}
    >
      {sent ? "✓ Sent" : sending ? "Sending…" : "Send reset"}
    </button>
  );
}
