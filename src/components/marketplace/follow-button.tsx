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
      className={`rounded-xl px-5 py-2 text-sm font-bold transition-all disabled:opacity-60 ${
        following
          ? "border-2 border-surface-border bg-white text-text-primary hover:border-red-400 hover:text-red-600"
          : "bg-nimbus-500 text-white shadow-lg shadow-nimbus-500/25 hover:bg-nimbus-600"
      }`}
    >
      {following ? "Following" : "Follow"}
      {count > 0 && <span className="ml-1 opacity-80">· {count}</span>}
    </button>
  );
}
