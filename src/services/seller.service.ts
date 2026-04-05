import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { NotFoundError, ValidationError } from "@/lib/errors";

const STANDARD_TIER_NAME = "STANDARD";

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createSellerProfile(userId: string, bio?: string) {
  const existing = await db.sellerProfile.findUnique({ where: { userId } });
  if (existing) {
    throw new ValidationError("Seller profile already exists");
  }

  // Ensure STANDARD tier exists
  let tier = await db.commissionTier.findUnique({
    where: { name: STANDARD_TIER_NAME },
  });
  if (!tier) {
    tier = await db.commissionTier.create({
      data: { name: STANDARD_TIER_NAME, minSales: 0, rate: 0.1 },
    });
  }

  const [profile] = await db.$transaction([
    db.sellerProfile.create({
      data: {
        userId,
        bio,
        tierId: tier.id,
        tierAssignedAt: new Date(),
      },
      include: { tier: true, user: { select: { id: true, name: true, email: true } } },
    }),
    db.user.update({
      where: { id: userId },
      data: { role: Role.SELLER },
    }),
  ]);

  return profile;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getSellerProfile(userId: string) {
  const profile = await db.sellerProfile.findUnique({
    where: { userId },
    include: { tier: true },
  });
  if (!profile) throw new NotFoundError("Seller profile");
  return profile;
}

export async function getOrCreateSellerProfile(userId: string) {
  const existing = await db.sellerProfile.findUnique({
    where: { userId },
    include: { tier: true },
  });
  if (existing) return existing;

  return createSellerProfile(userId);
}

export async function getPublicSellerProfile(sellerProfileId: string) {
  const profile = await db.sellerProfile.findUnique({
    where: { id: sellerProfileId },
    include: {
      user: { select: { name: true, avatar: true, createdAt: true } },
      tier: true,
      _count: {
        select: {
          listings: { where: { saleStatus: "ACTIVE" } },
        },
      },
    },
  });
  if (!profile) throw new NotFoundError("Seller profile");
  return profile;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateSellerProfile(
  userId: string,
  data: { bio?: string; paypalEmail?: string }
) {
  const existing = await db.sellerProfile.findUnique({ where: { userId } });
  if (!existing) throw new NotFoundError("Seller profile");

  return db.sellerProfile.update({
    where: { userId },
    data: {
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.paypalEmail !== undefined && { paypalEmail: data.paypalEmail }),
    },
    include: { tier: true },
  });
}

// ─── Tier evaluation ─────────────────────────────────────────────────────────

export async function evaluateAndUpdateTier(sellerProfileId: string) {
  const profile = await db.sellerProfile.findUnique({
    where: { id: sellerProfileId },
    include: { tier: true },
  });
  if (!profile) throw new NotFoundError("Seller profile");

  // Fetch all tiers ordered by minSales descending to find the best eligible tier
  const tiers = await db.commissionTier.findMany({
    orderBy: { minSales: "desc" },
  });

  // Find the highest tier the seller qualifies for
  const newTier = tiers.find((t) => profile.totalSales >= t.minSales);
  if (!newTier) return profile;

  // Only auto-upgrade (never downgrade via this path)
  const currentMinSales = profile.tier?.minSales ?? 0;
  if (newTier.minSales <= currentMinSales) return profile;

  return db.sellerProfile.update({
    where: { id: sellerProfileId },
    data: {
      tierId: newTier.id,
      tierAssignedAt: new Date(),
    },
    include: { tier: true },
  });
}
