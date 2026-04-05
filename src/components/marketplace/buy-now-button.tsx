"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface BuyNowButtonProps {
  listingId: string;
  size?: "sm" | "md";
}

export function BuyNowButton({ listingId, size = "sm" }: BuyNowButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/marketplace/buy-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      if (res.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(`/marketplace/${listingId}`)}`);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Unable to start purchase");
        setLoading(false);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        router.push(`/marketplace/${listingId}`);
      }
    } catch {
      setLoading(false);
    }
  };

  const sizeClass = size === "sm" ? "h-8 text-xs" : "h-11 text-sm";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full ${sizeClass} rounded-xl font-bold text-white bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_4px_12px_-2px_rgba(16,185,129,0.35)] ring-1 ring-inset ring-white/10 hover:from-emerald-400 hover:to-emerald-500 hover:-translate-y-px active:translate-y-0 transition-all duration-150 disabled:opacity-60 disabled:translate-y-0`}
    >
      {loading ? "Loading..." : "Buy Now"}
    </button>
  );
}
