import { Job } from "bullmq";
import { db } from "@/lib/db";
import { createNotificationEvent } from "@/services/notification-v2.service";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WishlistAlertJobData {}

export async function handleWishlistAlerts(
  _job: Job<WishlistAlertJobData>
): Promise<void> {
  // Fetch all wishlist items with alertOnDrop enabled that have a recorded price
  const items = await db.wishlist.findMany({
    where: {
      alertOnDrop: true,
      priceAtAdd: { not: null },
    },
    include: {
      product: { include: { card: true } },
      card: true,
    },
  });

  let alertsSent = 0;

  for (const item of items) {
    if (item.priceAtAdd == null) continue;

    // Determine current price
    let currentPrice: number | null = null;
    let itemName = "Unknown item";
    let itemLink = "/shop";

    if (item.product) {
      currentPrice = item.product.price;
      itemName = item.product.name ?? itemName;
      itemLink = `/shop/${item.productId}`;
    } else if (item.card) {
      currentPrice =
        item.card.tcgPriceMarket ?? item.card.tcgPriceNM ?? null;
      itemName = item.card.name;
      itemLink = `/search?q=${encodeURIComponent(item.card.name)}`;
    }

    if (currentPrice == null) continue;

    const dropPercent =
      ((item.priceAtAdd - currentPrice) / item.priceAtAdd) * 100;

    if (dropPercent < 10) continue;

    const dropDisplay = dropPercent.toFixed(1);
    const fromDisplay = `$${item.priceAtAdd.toFixed(2)}`;
    const toDisplay = `$${currentPrice.toFixed(2)}`;

    await createNotificationEvent(item.userId, "PRICE_DROP", {
      title: `Price drop on ${itemName}`,
      message: `${itemName} dropped ${dropDisplay}% — from ${fromDisplay} to ${toDisplay}.`,
      link: itemLink,
      itemName,
      previousPrice: item.priceAtAdd,
      currentPrice,
      dropPercent,
    });

    alertsSent++;
  }

  console.log(
    `[wishlist-alerts] Checked ${items.length} item(s), sent ${alertsSent} alert(s)`
  );
}
