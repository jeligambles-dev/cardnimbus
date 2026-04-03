"use client";

import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

interface PullFeedItem {
  id: string;
  userId: string;
  tierRolled: string;
  revealedItemName: string;
  revealedItemImage: string | null;
  revealedItemValue: number;
  pulledAt: string;
  user?: { name: string | null; avatar: string | null };
  version?: {
    collection?: { name: string; tier: string } | null;
  } | null;
}

interface RecentPullsFeedProps {
  pulls: PullFeedItem[];
}

const TIER_ACCENT: Record<string, string> = {
  Bronze: "text-amber-400",
  Silver: "text-slate-300",
  Gold: "text-yellow-300",
  Platinum: "text-cyan-300",
  Common: "text-gray-400",
  Rare: "text-blue-400",
  "Ultra Rare": "text-purple-400",
  Secret: "text-pink-400",
};

function getAccent(tier: string) {
  return TIER_ACCENT[tier] ?? "text-indigo-400";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function RecentPullsFeed({ pulls }: RecentPullsFeedProps) {
  if (pulls.length === 0) {
    return (
      <div className="rounded-xl border border-white/5 bg-gray-900 p-6 text-center text-gray-600 text-sm">
        No recent pulls yet. Be the first!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
        Recent Pulls
      </h3>

      <div className="divide-y divide-white/5 rounded-xl border border-white/5 bg-gray-900 overflow-hidden">
        {pulls.map((pull) => {
          const userName = pull.user?.name ?? "Anonymous";
          const collectionName = pull.version?.collection?.name ?? "Mystery Pack";
          const accent = getAccent(pull.tierRolled);

          return (
            <div
              key={pull.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
            >
              {/* Item image */}
              <div className="shrink-0 h-10 w-10 rounded-lg overflow-hidden bg-gray-800 border border-white/10 flex items-center justify-center">
                {pull.revealedItemImage ? (
                  <Image
                    src={pull.revealedItemImage}
                    alt={pull.revealedItemName}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <svg
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                    />
                  </svg>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 truncate">
                  <span className="font-semibold text-white">{userName}</span>{" "}
                  just pulled{" "}
                  <span className={`font-bold ${accent}`}>
                    {pull.revealedItemName}
                  </span>{" "}
                  from{" "}
                  <span className="text-gray-400">{collectionName}</span>
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-2 mt-0.5">
                  <span className={`${accent} font-mono`}>
                    {pull.tierRolled}
                  </span>
                  <span>·</span>
                  <span className="text-green-500">
                    {formatCurrency(pull.revealedItemValue)}
                  </span>
                  <span>·</span>
                  <span>{timeAgo(pull.pulledAt)}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
