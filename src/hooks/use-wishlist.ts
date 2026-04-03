"use client";

import { useState } from "react";
import { toast } from "@/components/ui/toast";

interface UseWishlistReturn {
  loading: boolean;
  addToWishlist: (productId?: string, cardId?: string) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
}

export function useWishlist(): UseWishlistReturn {
  const [loading, setLoading] = useState(false);

  const addToWishlist = async (productId?: string, cardId?: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, cardId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast(data.error ?? "Failed to add to wishlist", "error");
        return;
      }

      toast("Added to wishlist", "success");
    } catch {
      toast("Failed to add to wishlist", "error");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wishlist?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast(data.error ?? "Failed to remove from wishlist", "error");
        return;
      }

      toast("Removed from wishlist", "success");
    } catch {
      toast("Failed to remove from wishlist", "error");
    } finally {
      setLoading(false);
    }
  };

  return { loading, addToWishlist, removeFromWishlist };
}
