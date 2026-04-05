"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SaveListingButtonProps {
  listingId: string;
}

export function SaveListingButton({ listingId }: SaveListingButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch(`/api/listings/${listingId}/like`)
      .then((r) => r.json())
      .then((data) => {
        setSaved(!!data.liked);
        setCount(data.count ?? 0);
      })
      .catch(() => {});
  }, [listingId]);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);

    const newSaved = !saved;
    setSaved(newSaved);
    setCount((c) => c + (newSaved ? 1 : -1));

    try {
      const res = await fetch(`/api/listings/${listingId}/like`, {
        method: newSaved ? "POST" : "DELETE",
      });
      if (res.status === 401) {
        setSaved(!newSaved);
        setCount((c) => c + (newSaved ? -1 : 1));
        router.push(
          `/login?callbackUrl=${encodeURIComponent(`/marketplace/${listingId}`)}`
        );
        return;
      }
      if (!res.ok) {
        setSaved(!newSaved);
        setCount((c) => c + (newSaved ? -1 : 1));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <button
        disabled
        className="w-full h-11 rounded-xl border-2 border-surface-border bg-white text-sm font-bold text-text-secondary"
      >
        Save to Likes
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-full h-11 rounded-xl text-sm font-bold transition-all duration-150 disabled:opacity-60 inline-flex items-center justify-center gap-2 ${
        saved
          ? "border-2 border-nimbus-500 bg-nimbus-50 text-nimbus-600 hover:bg-nimbus-100 hover:-translate-y-px active:translate-y-0"
          : "border-2 border-surface-border bg-white text-text-primary hover:border-nimbus-400 hover:text-nimbus-600 hover:-translate-y-px active:translate-y-0"
      }`}
    >
      <svg
        className="h-5 w-5"
        fill={saved ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {saved ? "Saved" : "Save to Likes"}
      {count > 0 && (
        <span className="text-xs font-semibold opacity-70">· {count}</span>
      )}
    </button>
  );
}
