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

  const sizeClass = size === "sm" ? "py-1.5 text-xs" : "py-2.5 text-sm";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full rounded-lg bg-emerald-500 ${sizeClass} font-bold text-white shadow-md shadow-emerald-500/25 transition-colors hover:bg-emerald-600 disabled:opacity-60`}
    >
      {loading ? "Loading..." : "Buy Now"}
    </button>
  );
}
