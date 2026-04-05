"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Sale {
  id: string;
  title: string;
  image: string | null;
  condition: string | null;
  price: number;
  soldAt: string;
  review: {
    rating: number;
    comment: string | null;
    createdAt: string;
    reviewer: { name: string | null; avatar: string | null };
  } | null;
}

interface SellerRecentSalesProps {
  sellerProfileId: string;
}

function formatRelative(date: string): string {
  const d = new Date(date);
  const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return d.toLocaleDateString();
}

export function SellerRecentSales({ sellerProfileId }: SellerRecentSalesProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sellers/${sellerProfileId}/recent-sales`)
      .then((r) => r.json())
      .then((data) => {
        setSales(data.sales ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sellerProfileId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface-raised p-6">
        <div className="h-4 w-32 bg-surface-overlay rounded animate-pulse" />
      </div>
    );
  }

  if (sales.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-raised p-6">
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
        Recent Sales
      </h2>
      <div className="space-y-4">
        {sales.map((sale) => (
          <div key={sale.id} className="rounded-xl border border-surface-border bg-white p-4">
            {/* Item */}
            <div className="flex items-start gap-3">
              <div className="h-14 w-14 rounded-md overflow-hidden bg-surface-overlay shrink-0">
                {sale.image ? (
                  <Image
                    src={sale.image}
                    alt={sale.title}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-nimbus-500/40 font-bold text-xs">
                    CN
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary line-clamp-2">
                  {sale.title}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                  {sale.condition && <span>{sale.condition}</span>}
                  {sale.condition && <span>·</span>}
                  <span>Sold {formatRelative(sale.soldAt)}</span>
                  <span>·</span>
                  <span className="font-semibold text-emerald-600">
                    ${sale.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Review */}
            {sale.review && (
              <div className="mt-3 pt-3 border-t border-surface-border">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i <= sale.review!.rating
                            ? "text-amber-400"
                            : "text-surface-border"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.953c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.953a1 1 0 00-.364-1.118L2.062 9.38c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.287-3.953z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs font-medium text-text-primary">
                    {sale.review.reviewer.name ?? "Buyer"}
                  </span>
                  <span className="text-xs text-text-muted">
                    · {formatRelative(sale.review.createdAt)}
                  </span>
                </div>
                {sale.review.comment && (
                  <p className="text-xs text-text-secondary leading-relaxed">
                    &ldquo;{sale.review.comment}&rdquo;
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
