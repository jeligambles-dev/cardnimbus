"use client";

import { useEffect, useState } from "react";
import { ListingCard } from "@/components/marketplace/listing-card";
import { trackRecentlyViewed, getRecentlyViewed } from "@/lib/recently-viewed";

interface Listing {
  id: string;
  title: string;
  price: number;
  condition: string | null;
  category: string;
  images: string[];
  dealScore: number | null;
  dealScoreBand: string | null;
  seller: {
    rating: number | null;
    user: { name: string | null; avatar: string | null };
  };
}

interface ListingSuggestionsProps {
  listingId: string;
  sellerName: string;
}

function Section({
  title,
  subtitle,
  listings,
}: {
  title: string;
  subtitle?: string;
  listings: Listing[];
}) {
  if (listings.length === 0) return null;
  return (
    <section className="mt-12">
      <div className="mb-5">
        <h2 className="text-xl font-black tracking-tight text-text-primary">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
        )}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {listings.map((listing, i) => (
          <ListingCard key={listing.id} listing={listing} index={i} />
        ))}
      </div>
    </section>
  );
}

export function ListingSuggestions({
  listingId,
  sellerName,
}: ListingSuggestionsProps) {
  const [fromSeller, setFromSeller] = useState<Listing[]>([]);
  const [similar, setSimilar] = useState<Listing[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Listing[]>([]);

  // Track this view + load recently viewed
  useEffect(() => {
    const previousIds = getRecentlyViewed(listingId);
    trackRecentlyViewed(listingId);

    if (previousIds.length > 0) {
      fetch(`/api/listings/by-ids?ids=${previousIds.join(",")}`)
        .then((r) => r.json())
        .then((data) => setRecentlyViewed(data.listings ?? []))
        .catch(() => {});
    }
  }, [listingId]);

  // Load related listings
  useEffect(() => {
    fetch(`/api/listings/${listingId}/related`)
      .then((r) => r.json())
      .then((data) => {
        setFromSeller(data.fromSeller ?? []);
        setSimilar(data.similar ?? []);
      })
      .catch(() => {});
  }, [listingId]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
      <Section
        title="You may also like"
        subtitle="Similar items from other sellers"
        listings={similar}
      />
      <Section
        title={`More from ${sellerName}`}
        listings={fromSeller}
      />
      <Section
        title="Recently viewed"
        subtitle="Pick up where you left off"
        listings={recentlyViewed}
      />
    </div>
  );
}
