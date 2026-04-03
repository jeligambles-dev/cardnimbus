import { Job } from "bullmq";
import { db } from "@/lib/db";
import { MysteryCollectionStatus } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MysteryStockJobData {}

export async function handleMysteryStockAlerts(
  _job: Job<MysteryStockJobData>
): Promise<void> {
  // Find all active collection versions
  const versions = await db.mysteryCollectionVersion.findMany({
    where: {
      status: {
        in: [
          MysteryCollectionStatus.ACTIVE,
          MysteryCollectionStatus.LOW_STOCK,
        ],
      },
    },
    select: {
      id: true,
      collectionId: true,
      stockRemaining: true,
      status: true,
    },
  });

  let lowStockCount = 0;
  let soldOutCount = 0;

  for (const version of versions) {
    if (version.stockRemaining <= 0) {
      // Mark version as SOLD_OUT and deactivate collection
      if (version.status !== MysteryCollectionStatus.SOLD_OUT) {
        await db.$transaction([
          db.mysteryCollectionVersion.update({
            where: { id: version.id },
            data: { status: MysteryCollectionStatus.SOLD_OUT },
          }),
          db.mysteryCollection.update({
            where: { id: version.collectionId },
            data: { isActive: false },
          }),
        ]);
        soldOutCount++;
      }
    } else if (version.stockRemaining <= 10) {
      // Mark version as LOW_STOCK
      if (version.status !== MysteryCollectionStatus.LOW_STOCK) {
        await db.mysteryCollectionVersion.update({
          where: { id: version.id },
          data: { status: MysteryCollectionStatus.LOW_STOCK },
        });
        lowStockCount++;
      }
    }
  }

  console.log(
    `[mystery-stock-alerts] Checked ${versions.length} version(s): low_stock=${lowStockCount}, sold_out=${soldOutCount}`
  );
}
