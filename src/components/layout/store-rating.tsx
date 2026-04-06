"use client";

import { useEffect, useState } from "react";

interface StoreStats {
  avg: number;
  count: number;
}

export function StoreRating() {
  const [stats, setStats] = useState<StoreStats | null>(null);

  useEffect(() => {
    fetch("/api/store/rating")
      .then((r) => r.json())
      .then((data) => {
        if (data.avg != null) setStats(data);
      })
      .catch(() => {});
  }, []);

  if (!stats || stats.count === 0) return null;

  const fullStars = Math.round(stats.avg);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={`h-3 w-3 ${i < fullStars ? "text-amber-400" : "text-white/30"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.953c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.953a1 1 0 00-.364-1.118L2.062 9.38c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.287-3.953z" />
          </svg>
        ))}
      </div>
      <span className="text-[10px] font-bold text-white/70">
        {stats.avg.toFixed(1)} ({stats.count.toLocaleString()})
      </span>
    </div>
  );
}
