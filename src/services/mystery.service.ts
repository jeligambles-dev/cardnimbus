import { db } from "@/lib/db";
import { MysteryCollectionStatus } from "@prisma/client";
import { ValidationError, NotFoundError } from "@/lib/errors";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PullRate {
  tierName: string;
  chance: number;
}

interface PoolItemInput {
  productId?: string;
  cardId?: string;
  tierName: string;
  weight: number;
  quantity: number;
  lockedValue: number;
}

interface CreateCollectionInput {
  name: string;
  tier: string;
  price: number;
}

interface CreateVersionInput {
  pullRates: PullRate[];
  guaranteedMinValue: number;
  poolItems: PoolItemInput[];
}

export interface PullResult {
  pullId: string;
  tier: string;
  itemName: string;
  itemImage: string | null;
  itemValue: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Cryptographically-secure float in [0, 1) */
function secureRandom(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / (0xffffffff + 1);
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function createCollection(
  adminId: string,
  input: CreateCollectionInput
) {
  const { name, tier, price } = input;

  if (!name?.trim()) throw new ValidationError("Name is required");
  if (!tier?.trim()) throw new ValidationError("Tier is required");
  if (typeof price !== "number" || price < 0)
    throw new ValidationError("Valid price is required");

  return db.mysteryCollection.create({
    data: { name: name.trim(), tier: tier.trim(), price },
  });
}

export async function createVersion(
  collectionId: string,
  adminId: string,
  input: CreateVersionInput
) {
  const { pullRates, guaranteedMinValue, poolItems } = input;

  // Validate collection exists
  const collection = await db.mysteryCollection.findUnique({
    where: { id: collectionId },
  });
  if (!collection) throw new NotFoundError("MysteryCollection");

  // Validate pull rates sum
  const rateSum = pullRates.reduce((s, r) => s + r.chance, 0);
  if (Math.abs(rateSum - 1.0) > 0.0001) {
    throw new ValidationError(
      `Pull rates must sum to 1.0 (current sum: ${rateSum.toFixed(4)})`
    );
  }

  // Validate every pool item has lockedValue >= guaranteedMinValue
  for (const item of poolItems) {
    if (item.lockedValue < guaranteedMinValue) {
      throw new ValidationError(
        `Pool item lockedValue (${item.lockedValue}) is less than guaranteedMinValue (${guaranteedMinValue})`
      );
    }
  }

  // Determine next version number
  const lastVersion = await db.mysteryCollectionVersion.findFirst({
    where: { collectionId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const nextVersion = (lastVersion?.version ?? 0) + 1;

  // Total stock = sum of all item quantities
  const totalStock = poolItems.reduce((s, i) => s + i.quantity, 0);

  return db.$transaction(async (tx) => {
    const version = await tx.mysteryCollectionVersion.create({
      data: {
        collectionId,
        version: nextVersion,
        pullRates: pullRates as unknown as import("@prisma/client").Prisma.InputJsonValue,
        guaranteedMinValue,
        stockRemaining: totalStock,
        status: "DRAFT",
      },
    });

    await tx.mysteryPoolItem.createMany({
      data: poolItems.map((item) => ({
        versionId: version.id,
        productId: item.productId ?? null,
        cardId: item.cardId ?? null,
        tierName: item.tierName,
        weight: item.weight,
        quantity: item.quantity,
        lockedValue: item.lockedValue,
      })),
    });

    return tx.mysteryCollectionVersion.findUniqueOrThrow({
      where: { id: version.id },
      include: { poolItems: true },
    });
  });
}

export async function activateVersion(versionId: string, adminId: string) {
  const version = await db.mysteryCollectionVersion.findUnique({
    where: { id: versionId },
    include: { poolItems: true },
  });
  if (!version) throw new NotFoundError("MysteryCollectionVersion");
  if (version.poolItems.length === 0) {
    throw new ValidationError("Version has no pool items");
  }
  if (version.stockRemaining <= 0) {
    throw new ValidationError("Version has no stock remaining");
  }

  return db.$transaction(async (tx) => {
    await tx.mysteryCollectionVersion.update({
      where: { id: versionId },
      data: {
        status: "ACTIVE",
        effectiveFrom: new Date(),
        activatedBy: adminId,
      },
    });

    return tx.mysteryCollection.update({
      where: { id: version.collectionId },
      data: {
        currentVersionId: versionId,
        isActive: true,
      },
    });
  });
}

export async function getActiveCollections() {
  const collections = await db.mysteryCollection.findMany({
    where: { isActive: true },
    include: {
      versions: {
        where: { status: "ACTIVE" },
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          version: true,
          pullRates: true,
          guaranteedMinValue: true,
          stockRemaining: true,
          status: true,
          effectiveFrom: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return collections.map((c) => ({
    ...c,
    currentVersion: c.versions[0] ?? null,
    versions: undefined,
  }));
}

export async function getCollectionById(id: string) {
  const collection = await db.mysteryCollection.findUnique({
    where: { id },
    include: {
      versions: {
        where: { status: "ACTIVE" },
        take: 1,
        orderBy: { createdAt: "desc" },
        include: {
          poolItems: {
            orderBy: { tierName: "asc" },
          },
        },
      },
    },
  });

  if (!collection) throw new NotFoundError("MysteryCollection");

  const activeVersion = collection.versions[0] ?? null;

  // Group pool items by tier
  const itemsByTier: Record<string, typeof activeVersion.poolItems> = {};
  if (activeVersion) {
    for (const item of activeVersion.poolItems) {
      if (!itemsByTier[item.tierName]) itemsByTier[item.tierName] = [];
      itemsByTier[item.tierName].push(item);
    }
  }

  return {
    ...collection,
    currentVersion: activeVersion
      ? { ...activeVersion, itemsByTier }
      : null,
    versions: undefined,
  };
}

export async function purchaseAndPull(
  collectionId: string,
  userId: string,
  paymentId: string
): Promise<PullResult> {
  return db.$transaction(async (tx) => {
    // 1. Get collection + active version
    const collection = await tx.mysteryCollection.findUnique({
      where: { id: collectionId },
    });
    if (!collection) throw new NotFoundError("MysteryCollection");
    if (!collection.isActive || !collection.currentVersionId) {
      throw new ValidationError("Collection is not currently active");
    }

    const version = await tx.mysteryCollectionVersion.findUnique({
      where: { id: collection.currentVersionId },
      include: { poolItems: true },
    });
    if (!version) throw new NotFoundError("MysteryCollectionVersion");
    if (version.stockRemaining <= 0) {
      throw new ValidationError("Collection is sold out");
    }

    // 2. Roll tier using crypto.getRandomValues cumulative probability
    const pullRates = version.pullRates as unknown as PullRate[];
    const tierRoll = secureRandom();
    let cumulative = 0;
    let selectedTier: string | null = null;
    for (const rate of pullRates) {
      cumulative += rate.chance;
      if (tierRoll < cumulative) {
        selectedTier = rate.tierName;
        break;
      }
    }
    // Fallback to last tier in case of floating point edge case
    if (!selectedTier && pullRates.length > 0) {
      selectedTier = pullRates[pullRates.length - 1].tierName;
    }
    if (!selectedTier) throw new ValidationError("No tiers configured");

    // 3. Roll item within selected tier (weighted random), with re-roll on depleted items
    let poolItem: (typeof version.poolItems)[number] | null = null;

    const tierItems = version.poolItems.filter(
      (i) => i.tierName === selectedTier && i.quantity > 0
    );
    if (tierItems.length === 0) {
      throw new ValidationError(
        `All items in tier "${selectedTier}" are depleted — collection sales stopped`
      );
    }

    const totalWeight = tierItems.reduce((s, i) => s + i.weight, 0);
    const itemRoll = secureRandom() * totalWeight;
    let weightCumulative = 0;
    for (const item of tierItems) {
      weightCumulative += item.weight;
      if (itemRoll < weightCumulative) {
        poolItem = item;
        break;
      }
    }
    if (!poolItem) poolItem = tierItems[tierItems.length - 1];

    // 4. Resolve item name + image from product or card
    let itemName = "Mystery Item";
    let itemImage: string | null = null;

    if (poolItem.productId) {
      const product = await tx.product.findUnique({
        where: { id: poolItem.productId },
        select: { name: true, images: true },
      });
      if (product) {
        itemName = product.name;
        itemImage = product.images[0] ?? null;
      }
    } else if (poolItem.cardId) {
      const card = await tx.card.findUnique({
        where: { id: poolItem.cardId },
        select: { name: true, imageUrl: true },
      });
      if (card) {
        itemName = card.name;
        itemImage = card.imageUrl ?? null;
      }
    }

    // 5. Decrement pool item quantity + version stockRemaining
    await tx.mysteryPoolItem.update({
      where: { id: poolItem.id },
      data: { quantity: { decrement: 1 } },
    });

    const newStock = version.stockRemaining - 1;
    let newCollectionStatus: MysteryCollectionStatus =
      collection.isActive ? "ACTIVE" : "DRAFT";
    let newIsActive = true;

    if (newStock <= 0) {
      newCollectionStatus = "SOLD_OUT";
      newIsActive = false;
    } else if (newStock <= 10) {
      newCollectionStatus = "LOW_STOCK";
    }

    await tx.mysteryCollectionVersion.update({
      where: { id: version.id },
      data: { stockRemaining: newStock },
    });

    // 6. Create MysteryPurchase (CONFIRMED)
    const purchase = await tx.mysteryPurchase.create({
      data: {
        userId,
        collectionId,
        versionId: version.id,
        amount: collection.price,
        pricePaid: collection.price,
        paymentId,
        status: "CONFIRMED",
      },
    });

    // 7. Create MysteryPull
    const pull = await tx.mysteryPull.create({
      data: {
        purchaseId: purchase.id,
        collectionId,
        versionId: version.id,
        userId,
        tierRolled: selectedTier,
        poolItemId: poolItem.id,
        revealedItemName: itemName,
        revealedItemImage: itemImage,
        revealedItemValue: poolItem.lockedValue,
      },
    });

    // 8. Update collection status if needed
    if (newCollectionStatus !== "ACTIVE" as MysteryCollectionStatus) {
      await tx.mysteryCollection.update({
        where: { id: collectionId },
        data: {
          isActive: newIsActive,
        },
      });
    }

    return {
      pullId: pull.id,
      tier: selectedTier,
      itemName,
      itemImage,
      itemValue: poolItem.lockedValue,
    };
  });
}

export async function getUserPulls(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [pulls, total] = await Promise.all([
    db.mysteryPull.findMany({
      where: { userId },
      orderBy: { pulledAt: "desc" },
      skip,
      take: limit,
      include: {
        version: {
          select: {
            collection: {
              select: { name: true, tier: true },
            },
          },
        },
      },
    }),
    db.mysteryPull.count({ where: { userId } }),
  ]);

  return { pulls, total, page, limit };
}

export async function getRecentPulls(limit: number = 20) {
  const pulls = await db.mysteryPull.findMany({
    orderBy: { pulledAt: "desc" },
    take: limit,
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      version: {
        select: {
          collection: { select: { name: true, tier: true } },
        },
      },
    },
  });

  return pulls;
}
