"use client";

import { useState, useEffect } from "react";

interface FollowButtonProps {
  sellerProfileId: string;
  initialCount?: number;
  initialFollowing?: boolean;
}

export function FollowButton({
  sellerProfileId,
  initialCount = 0,
  initialFollowing = false,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch current state
    fetch(`/api/sellers/${sellerProfileId}/follow`)
      .then((r) => r.json())
      .then((data) => {
        setFollowing(!!data.following);
        setCount(data.count ?? 0);
      })
      .catch(() => {});
  }, [sellerProfileId]);

  const toggle = async () => {
    setLoading(true);
    const method = following ? "DELETE" : "POST";
    try {
      const res = await fetch(`/api/sellers/${sellerProfileId}/follow`, { method });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (res.ok) {
        const newFollowing = !following;
        setFollowing(newFollowing);
        setCount((c) => c + (newFollowing ? 1 : -1));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <button className="rounded-xl border-2 border-surface-border bg-white px-5 py-2 text-sm font-bold text-text-primary">
        Follow
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`h-10 px-5 rounded-xl text-sm font-bold transition-all duration-150 disabled:opacity-60 ${
        following
          ? "border border-surface-border bg-white text-text-primary hover:border-red-400 hover:text-red-600 hover:-translate-y-px active:translate-y-0"
          : "text-white bg-gradient-to-b from-nimbus-500 to-nimbus-600 shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_4px_12px_-2px_rgba(255,0,0,0.35)] ring-1 ring-inset ring-white/10 hover:from-nimbus-400 hover:to-nimbus-500 hover:-translate-y-px active:translate-y-0"
      }`}
    >
      {following ? "✅ Following" : "👤 Follow"}
      {count > 0 && <span className="ml-1 opacity-80">· {count}</span>}
    </button>
  );
}
