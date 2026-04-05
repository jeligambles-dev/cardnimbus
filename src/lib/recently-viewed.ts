const STORAGE_KEY = "cn_recently_viewed";
const MAX_ITEMS = 8;

export function trackRecentlyViewed(listingId: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const ids: string[] = existing ? JSON.parse(existing) : [];
    const filtered = ids.filter((id) => id !== listingId);
    filtered.unshift(listingId);
    const trimmed = filtered.slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

export function getRecentlyViewed(excludeId?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const ids: string[] = existing ? JSON.parse(existing) : [];
    return excludeId ? ids.filter((id) => id !== excludeId) : ids;
  } catch {
    return [];
  }
}
