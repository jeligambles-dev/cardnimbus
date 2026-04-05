"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LeaveReviewFormProps {
  orderId: string;
  revieweeId: string;
  revieweeName: string;
  reviewType: "BUYER_TO_SELLER" | "SELLER_TO_BUYER";
}

export function LeaveReviewForm({
  orderId,
  revieweeId,
  revieweeName,
  reviewType,
}: LeaveReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revieweeId,
          rating,
          comment: comment.trim() || undefined,
          type: reviewType,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to submit review");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-surface-border bg-white p-6"
    >
      <h3 className="text-lg font-bold text-text-primary mb-1">
        Review {revieweeName}
      </h3>
      <p className="text-sm text-text-secondary mb-4">
        Share your experience to help other buyers.
      </p>

      {/* Star picker */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-primary mb-2">
          Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <svg
                className={`h-8 w-8 transition-colors ${
                  i <= (hover || rating) ? "text-amber-400" : "text-surface-border"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.953c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.953a1 1 0 00-.364-1.118L2.062 9.38c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.287-3.953z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-primary mb-2">
          Comment (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share details about the transaction..."
          rows={4}
          className="w-full rounded-xl border border-surface-border bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-nimbus-500 focus:outline-none focus:ring-2 focus:ring-nimbus-500/20 resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="rounded-xl bg-nimbus-500 px-6 py-3 text-sm font-bold text-white hover:bg-nimbus-600 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
