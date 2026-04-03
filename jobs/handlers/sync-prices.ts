import { Job } from "bullmq";
import { db } from "@/lib/db";

export interface PriceSyncJobData {
  // No specific input needed; the job queries all cards with TCGPlayer IDs
}

// Real implementation will:
// 1. Fetch all cards with tcgPlayerProductId from the database
// 2. Batch the IDs into groups of ~250 (TCGPlayer API limit)
// 3. Call TCGPlayer's /v2/pricing/product/{ids} endpoint for each batch
// 4. Parse the response for NM, LP, MP, HP, and market prices
// 5. Upsert updated prices onto each Card row (tcgPriceNM, tcgPriceLP, etc.)
// 6. Insert a CardPriceHistory row for each card to preserve the time series
// 7. Update tcgPriceUpdatedAt on each card

export async function handleSyncPrices(
  job: Job<PriceSyncJobData>
): Promise<void> {
  const cards = await db.card.findMany({
    where: { tcgPlayerProductId: { not: null } },
    select: { id: true, tcgPlayerProductId: true },
  });

  for (const card of cards) {
    console.log(`Price sync placeholder for card ${card.id}`);
  }

  console.log(
    `Price sync placeholder complete — ${cards.length} card(s) would be updated`
  );
}
