"use client";

import { useState } from "react";
import { ListingCard } from "@/components/marketplace/listing-card";
import Image from "next/image";

interface Listing {
  id: string;
  title: string;
  price: number;
  images: string[];
  condition: string | null;
  category: string;
  moderationStatus: string;
  saleStatus: string;
  dealScore: number | null;
  dealScoreBand: string | null;
  seller?: {
    user: { name: string | null; avatar: string | null };
    rating: number | null;
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string | Date;
  reviewer: { id: string; name: string | null; avatar: string | null };
}

interface SellerTabsProps {
  activeListings: Listing[];
  soldListings: Listing[];
  reviews: Review[];
  rating: number | null;
  ratingCount: number;
  ratingBreakdown: Record<number, number>;
}

export function SellerTabs({
  activeListings,
  soldListings,
  reviews,
  rating,
  ratingCount,
  ratingBreakdown,
}: SellerTabsProps) {
  const [tab, setTab] = useState<"active" | "sold" | "reviews">("active");

  const tabClass = (name: string) =>
    `px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 ${
      tab === name
        ? "text-nimbus-600 border-nimbus-500"
        : "text-text-secondary border-transparent hover:text-text-primary"
    }`;

  return (
    <div>
      <div className="border-b border-surface-border mb-6 flex gap-1">
        <button className={tabClass("active")} onClick={() => setTab("active")}>
          Active ({activeListings.length})
        </button>
        <button className={tabClass("sold")} onClick={() => setTab("sold")}>
          Sold ({soldListings.length})
        </button>
        <button className={tabClass("reviews")} onClick={() => setTab("reviews")}>
          Reviews ({ratingCount})
        </button>
      </div>

      {tab === "active" &&
        (activeListings.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-surface-border bg-surface-raised">
            <p className="text-text-muted">No active listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {activeListings.map((listing, i) => (
              // @ts-expect-error — listing type aligned with ListingCard
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        ))}

      {tab === "sold" &&
        (soldListings.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-surface-border bg-surface-raised">
            <p className="text-text-muted">No sold items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {soldListings.map((listing, i) => (
              // @ts-expect-error — listing type aligned with ListingCard
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        ))}

      {tab === "reviews" && (
        <div>
          {/* Rating summary */}
          {ratingCount > 0 && rating !== null && (
            <div className="grid md:grid-cols-2 gap-8 mb-8 p-6 rounded-2xl border border-surface-border bg-surface-raised">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="text-5xl font-black text-text-primary">
                  {rating.toFixed(1)}
                </div>
                <div className="flex gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      className={`h-6 w-6 ${
                        i <= Math.round(rating) ? "text-amber-400" : "text-surface-border"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.953c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.953a1 1 0 00-.364-1.118L2.062 9.38c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.287-3.953z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-text-secondary mt-2">
                  {ratingCount} review{ratingCount !== 1 ? "s" : ""}
                </p>
              </div>
              {/* Breakdown bars */}
              <div className="flex flex-col gap-2 justify-center">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingBreakdown[stars] ?? 0;
                  const percent = ratingCount > 0 ? (count / ratingCount) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3 text-sm">
                      <span className="w-6 text-text-secondary">{stars}★</span>
                      <div className="flex-1 h-2 rounded-full bg-surface-overlay overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-text-muted">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-surface-border bg-surface-raised">
              <p className="text-text-muted">No reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl border border-surface-border bg-white p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-surface-overlay shrink-0">
                      {review.reviewer.avatar ? (
                        <Image
                          src={review.reviewer.avatar}
                          alt={review.reviewer.name ?? ""}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-bold text-text-secondary">
                          {(review.reviewer.name ?? "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-text-primary">
                          {review.reviewer.name ?? "Anonymous"}
                        </p>
                        <p className="text-xs text-text-muted">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-0.5 mt-1 mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${
                              i <= review.rating ? "text-amber-400" : "text-surface-border"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.953c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.953a1 1 0 00-.364-1.118L2.062 9.38c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.287-3.953z" />
                          </svg>
                        ))}
                      </div>
                      {review.comment && (
                        <p className="text-sm text-text-secondary leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
