"use client";

import { useState, useEffect } from "react";

interface LikeButtonProps {
  listingId: string;
  size?: "sm" | "md";
}

export function LikeButton({ listingId, size = "md" }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch(`/api/listings/${listingId}/like`)
      .then((r) => r.json())
      .then((data) => {
        setLiked(!!data.liked);
        setCount(data.count ?? 0);
      })
      .catch(() => {});
  }, [listingId]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    const newLiked = !liked;
    setLiked(newLiked);
    setCount((c) => c + (newLiked ? 1 : -1));

    try {
      const res = await fetch(`/api/listings/${listingId}/like`, {
        method: newLiked ? "POST" : "DELETE",
      });
      if (res.status === 401) {
        setLiked(!newLiked);
        setCount((c) => c + (newLiked ? -1 : 1));
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        setLiked(!newLiked);
        setCount((c) => c + (newLiked ? -1 : 1));
      }
    } finally {
      setLoading(false);
    }
  };

  const dimensions = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      onClick={toggle}
      aria-label={liked ? "Unlike" : "Like"}
      className={`${dimensions} flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all hover:scale-110 ${
        liked ? "text-nimbus-500" : "text-text-secondary hover:text-nimbus-500"
      }`}
    >
      <svg
        className={iconSize}
        fill={mounted && liked ? "currentColor" : "none"}
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
    </button>
  );
}
