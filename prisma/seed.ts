import { PrismaClient, Role, BadgeCategory, BadgeMode, BadgeVisibility } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  // ── Admin user ──────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("AdminPass123!", 12);

  const admin = await db.user.upsert({
    where: { email: "admin@cardnimbus.com" },
    update: {},
    create: {
      email: "admin@cardnimbus.com",
      name: "Card Nimbus Admin",
      passwordHash,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log(`Admin user: ${admin.email}`);

  // ── Sample cards ────────────────────────────────────────────────────────────
  const charizard = await db.card.upsert({
    where: { tcgPlayerProductId: "223616" },
    update: {},
    create: {
      tcgPlayerProductId: "223616",
      name: "Charizard VMAX",
      setName: "Shining Fates",
      cardNumber: "SV107",
      rarity: "Shiny Rare Holo",
      normalizedName: "charizard vmax shining fates sv107",
      tcgPriceNM: 420.0,
      tcgPriceLP: 360.0,
      tcgPriceMP: 280.0,
      tcgPriceHP: 200.0,
      tcgPriceMarket: 415.0,
      tcgPriceUpdatedAt: new Date(),
    },
  });

  const pikachu = await db.card.upsert({
    where: { tcgPlayerProductId: "188118" },
    update: {},
    create: {
      tcgPlayerProductId: "188118",
      name: "Pikachu VMAX",
      setName: "Vivid Voltage",
      cardNumber: "044",
      rarity: "Rare Holo VMAX",
      normalizedName: "pikachu vmax vivid voltage 044",
      tcgPriceNM: 45.0,
      tcgPriceLP: 38.0,
      tcgPriceMP: 28.0,
      tcgPriceHP: 18.0,
      tcgPriceMarket: 43.0,
      tcgPriceUpdatedAt: new Date(),
    },
  });

  const umbreon = await db.card.upsert({
    where: { tcgPlayerProductId: "233044" },
    update: {},
    create: {
      tcgPlayerProductId: "233044",
      name: "Umbreon VMAX",
      setName: "Evolving Skies",
      cardNumber: "215",
      rarity: "Secret Rare",
      normalizedName: "umbreon vmax evolving skies 215",
      tcgPriceNM: 280.0,
      tcgPriceLP: 240.0,
      tcgPriceMP: 180.0,
      tcgPriceHP: 120.0,
      tcgPriceMarket: 270.0,
      tcgPriceUpdatedAt: new Date(),
    },
  });

  console.log(
    `Cards: ${charizard.name}, ${pikachu.name}, ${umbreon.name}`
  );

  // ── Sample products ─────────────────────────────────────────────────────────
  const products = await Promise.all([
    // 1. SV Booster Pack
    db.product.upsert({
      where: { slug: "sv-booster-pack" },
      update: {},
      create: {
        name: "Scarlet & Violet Booster Pack",
        slug: "sv-booster-pack",
        category: "PACK",
        description:
          "One booster pack from the Scarlet & Violet base set. Contains 10 cards.",
        images: [],
        price: 4.99,
        stock: 100,
        isActive: true,
      },
    }),

    // 2. Obsidian Flames Booster Box
    db.product.upsert({
      where: { slug: "obsidian-flames-booster-box" },
      update: {},
      create: {
        name: "Obsidian Flames Booster Box",
        slug: "obsidian-flames-booster-box",
        category: "BOOSTER_BOX",
        description:
          "Sealed booster box containing 36 Obsidian Flames booster packs.",
        images: [],
        price: 129.99,
        compareAtPrice: 143.64,
        stock: 25,
        isActive: true,
      },
    }),

    // 3. Charizard VMAX PSA 10 Slab
    db.product.upsert({
      where: { slug: "charizard-vmax-sf-sv107-psa-10" },
      update: {},
      create: {
        cardId: charizard.id,
        name: "Charizard VMAX (Shining Fates SV107) — PSA 10",
        slug: "charizard-vmax-sf-sv107-psa-10",
        category: "SLAB",
        description:
          "PSA Gem Mint 10 graded Charizard VMAX from Shining Fates (SV107).",
        images: [],
        price: 450.0,
        stock: 1,
        condition: "NM",
        isActive: true,
      },
    }),

    // 4. Pikachu VMAX NM Single
    db.product.upsert({
      where: { slug: "pikachu-vmax-vv-044-nm" },
      update: {},
      create: {
        cardId: pikachu.id,
        name: "Pikachu VMAX (Vivid Voltage 044) — Near Mint",
        slug: "pikachu-vmax-vv-044-nm",
        category: "SINGLE",
        description: "Near Mint ungraded Pikachu VMAX from Vivid Voltage.",
        images: [],
        price: 42.0,
        stock: 3,
        condition: "NM",
        isActive: true,
      },
    }),

    // 5. Umbreon VMAX Alt Art LP
    db.product.upsert({
      where: { slug: "umbreon-vmax-es-215-lp" },
      update: {},
      create: {
        cardId: umbreon.id,
        name: "Umbreon VMAX Alt Art (Evolving Skies 215) — Light Play",
        slug: "umbreon-vmax-es-215-lp",
        category: "SINGLE",
        description:
          "Light Play Umbreon VMAX alternate art from Evolving Skies.",
        images: [],
        price: 265.0,
        stock: 1,
        condition: "LP",
        isActive: true,
      },
    }),

    // 6. Paldea Evolved ETB
    db.product.upsert({
      where: { slug: "paldea-evolved-elite-trainer-box" },
      update: {},
      create: {
        name: "Paldea Evolved Elite Trainer Box",
        slug: "paldea-evolved-elite-trainer-box",
        category: "BOOSTER_BOX",
        description:
          "Paldea Evolved Elite Trainer Box with 9 booster packs and accessories.",
        images: [],
        price: 44.99,
        stock: 15,
        isActive: true,
      },
    }),
  ]);

  console.log(`Products seeded: ${products.map((p) => p.name).join(", ")}`);

  // ── Commission tiers ─────────────────────────────────────────────────────────
  const tiers = await Promise.all([
    db.commissionTier.upsert({
      where: { name: "STANDARD" },
      update: {},
      create: { name: "STANDARD", minSales: 0, rate: 0.10 },
    }),
    db.commissionTier.upsert({
      where: { name: "SILVER" },
      update: {},
      create: { name: "SILVER", minSales: 50, rate: 0.08 },
    }),
    db.commissionTier.upsert({
      where: { name: "GOLD" },
      update: {},
      create: { name: "GOLD", minSales: 200, rate: 0.06 },
    }),
  ]);

  console.log(`Commission tiers: ${tiers.map((t) => `${t.name} (${t.rate * 100}%)`).join(", ")}`);

  // ── Default badges ───────────────────────────────────────────────────────────
  const badgeDefinitions = [
    // Trust (priority 10-19)
    {
      slug: "verified-seller",
      name: "Verified Seller",
      description: "Identity has been verified by Card Nimbus staff.",
      category: BadgeCategory.TRUST,
      badgeMode: BadgeMode.PERMANENT,
      displayPriority: 10,
      visibility: BadgeVisibility.PUBLIC,
      isAutoAwarded: false,
      criteria: { type: "manual", description: "Manually awarded after ID verification" },
    },
    {
      slug: "trusted-seller",
      name: "Trusted Seller",
      description: "Consistently high ratings with no disputes over 25+ sales.",
      category: BadgeCategory.TRUST,
      badgeMode: BadgeMode.DYNAMIC,
      displayPriority: 11,
      visibility: BadgeVisibility.PUBLIC,
      isAutoAwarded: true,
      criteria: { minSales: 25, minRating: 4.8, maxDisputeRate: 0 },
    },
    {
      slug: "pro-seller",
      name: "Pro Seller",
      description: "High-volume seller with excellent track record.",
      category: BadgeCategory.TRUST,
      badgeMode: BadgeMode.DYNAMIC,
      displayPriority: 12,
      visibility: BadgeVisibility.PUBLIC,
      isAutoAwarded: true,
      criteria: { minSales: 100, minRating: 4.7, maxDisputeRate: 0.01 },
    },
    {
      slug: "id-verified",
      name: "ID Verified",
      description: "Government-issued ID has been verified.",
      category: BadgeCategory.TRUST,
      badgeMode: BadgeMode.PERMANENT,
      displayPriority: 13,
      visibility: BadgeVisibility.PUBLIC,
      isAutoAwarded: false,
      criteria: { type: "manual", description: "Manually awarded after government ID check" },
    },

    // Performance (priority 20-29)
    {
      slug: "fast-shipper",
      name: "Fast Shipper",
      description: "Ships orders within 24 hours at least 90% of the time.",
      category: BadgeCategory.PERFORMANCE,
      badgeMode: BadgeMode.DYNAMIC,
      displayPriority: 20,
      visibility: BadgeVisibility.PUBLIC,
      isAutoAwarded: true,
      criteria: { shipWithin24hRate: 0.9, minSamples: 10 },
    },
    {
      slug: "top-rated",
      name: "Top Rated",
      description: "Maintains a 5-star rating across 10+ reviews.",
      category: BadgeCategory.PERFORMANCE,
      badgeMode: BadgeMode.DYNAMIC,
      displayPriority: 21,
      visibility: BadgeVisibility.PUBLIC,
      isAutoAwarded: true,
      criteria: { minRating: 5.0, minReviews: 10 },
    },
    {
      slug: "quick-responder",
      name: "Quick Responder",
      description: "Responds to messages within 2 hours on average.",
      category: BadgeCategory.PERFORMANCE,
      badgeMode: BadgeMode.DYNAMIC,
      displayPriority: 22,
      visibility: BadgeVisibility.PUBLIC,
      isAutoAwarded: true,
      criteria: { avgResponseTimeHours: 2, minSamples: 5 },
    },
    {
      slug: "reliable-buyer",
      name: "Reliable Buyer",
      description: "Completed 10+ purchases with no cancelled orders.",
      category: BadgeCategory.PERFORMANCE,
      badgeMode: BadgeMode.DYNAMIC,
      displayPriority: 23,
      visibility: BadgeVisibility.PUBLIC,
      isAutoAwarded: true,
      criteria: { minPurchases: 10, maxCancellationRate: 0 },
    },

    // Milestone (priority 30-49)
    {
      slug: "first-sale",
      name: "First Sale",
      description: "Completed their first sale on Card Nimbus.",
      category: BadgeCategory.MILESTONE,
      badgeMode: BadgeMode.PERMANENT,
      displayPriority: 30,
      visibility: BadgeVisibility.PUBLIC,
      isAutoAwarded: true,
      criteria: { event: "sale_completed", count: 1 },
    },
    {
      slug: "first-purchase",
      name: "First Purchase",
      description: "Completed their first purchase on Card Nimbus.",
      category: BadgeCategory.MILESTONE,
      badgeMode: BadgeMode.PERMANENT,
      displayPriority: 31,
      visibility: BadgeVisibility.PUBLIC,
      isAutoAwarded: true,
      criteria: { event: "purchase_completed", count: 1 },
    },
    {
      slug: "10-sales",
      name: "10 Sales",
      description: "Reached 10 completed sales.",
      category: BadgeCategory.MILESTONE,
      badgeMode: BadgeMode.PERMANENT,
      displayPriority: 32,
      visibility: BadgeVisibility.PUBLIC,
      isAutoAwarded: true,
      groupKey: "sales_milestone",
      criteria: { event: "sale_completed", count: 10 },
    },
    {
      slug: "50-sales",
      name: "50 Sales",
      description: "Reached 50 completed sales.",
      category: BadgeCategory.MILESTONE,
      badgeMode: BadgeMode.PERMANENT,
      displayPriority: 33,
      visibility: BadgeVisibility.PUBLIC,
      isAutoAwarded: true,
      groupKey: "sales_milestone",
      criteria: { event: "sale_completed", count: 50 },
    },
    {
      slug: "100-sales",
      name: "100 Sales",
      description: "Reached 100 completed sales.",
      category: BadgeCategory.MILESTONE,
      badgeMode: BadgeMode.PERMANENT,
      displayPriority: 34,
      visibility: BadgeVisibility.PUBLIC,
      isAutoAwarded: true,
      groupKey: "sales_milestone",
      criteria: { event: "sale_completed", count: 100 },
    },
    {
      slug: "500-sales",
      name: "500 Sales",
      description: "Reached 500 completed sales.",
      category: BadgeCategory.MILESTONE,
      badgeMode: BadgeMode.PERMANENT,
      displayPriority: 35,
      visibility: BadgeVisibility.PUBLIC,
      isAutoAwarded: true,
      groupKey: "sales_milestone",
      criteria: { event: "sale_completed", count: 500 },
    },
    {
      slug: "raffle-winner",
      name: "Raffle Winner",
      description: "Won a Card Nimbus raffle.",
      category: BadgeCategory.MILESTONE,
      badgeMode: BadgeMode.PERMANENT,
      displayPriority: 40,
      visibility: BadgeVisibility.PUBLIC,
      isAutoAwarded: true,
      criteria: { event: "raffle_won", count: 1 },
    },
    {
      slug: "lucky-pull",
      name: "Lucky Pull",
      description: "Pulled a rare item from a Mystery Collection.",
      category: BadgeCategory.MILESTONE,
      badgeMode: BadgeMode.PERMANENT,
      displayPriority: 41,
      visibility: BadgeVisibility.PUBLIC,
      isAutoAwarded: true,
      criteria: { event: "mystery_rare_pull", tier: "LEGENDARY" },
    },
    {
      slug: "early-adopter",
      name: "Early Adopter",
      description: "Joined Card Nimbus during the early access period.",
      category: BadgeCategory.MILESTONE,
      badgeMode: BadgeMode.PERMANENT,
      displayPriority: 42,
      visibility: BadgeVisibility.PUBLIC,
      isAutoAwarded: false,
      criteria: { type: "manual", description: "Awarded to users who joined before public launch" },
    },

    // Time-Bound (priority 50-59)
    {
      slug: "top-seller-of-the-month",
      name: "Top Seller of the Month",
      description: "Ranked #1 seller by volume for the calendar month.",
      category: BadgeCategory.MILESTONE,
      badgeMode: BadgeMode.TIME_BOUND,
      displayPriority: 50,
      visibility: BadgeVisibility.PUBLIC,
      isAutoAwarded: true,
      criteria: { event: "monthly_leaderboard_rank", rank: 1, period: "calendar_month" },
    },

    // Community (priority 60-69)
    {
      slug: "community-helper",
      name: "Community Helper",
      description: "Recognised for outstanding contributions to the Card Nimbus community.",
      category: BadgeCategory.COMMUNITY,
      badgeMode: BadgeMode.PERMANENT,
      displayPriority: 60,
      visibility: BadgeVisibility.PUBLIC,
      isAutoAwarded: false,
      criteria: { type: "manual", description: "Manually awarded by admin for community contribution" },
    },

    // Internal (priority 90-99, INTERNAL visibility)
    {
      slug: "under-review",
      name: "Under Review",
      description: "Account is currently under review by the trust & safety team.",
      category: BadgeCategory.TRUST,
      badgeMode: BadgeMode.DYNAMIC,
      displayPriority: 90,
      visibility: BadgeVisibility.INTERNAL,
      isAutoAwarded: false,
      criteria: { type: "manual", description: "Set by trust & safety team" },
    },
    {
      slug: "dispute-risk",
      name: "Dispute Risk",
      description: "User has an elevated dispute rate.",
      category: BadgeCategory.TRUST,
      badgeMode: BadgeMode.DYNAMIC,
      displayPriority: 91,
      visibility: BadgeVisibility.INTERNAL,
      isAutoAwarded: true,
      criteria: { minDisputeRate: 0.05, minSamples: 5 },
    },
    {
      slug: "suspicious-velocity",
      name: "Suspicious Velocity",
      description: "Unusual transaction velocity detected.",
      category: BadgeCategory.TRUST,
      badgeMode: BadgeMode.DYNAMIC,
      displayPriority: 92,
      visibility: BadgeVisibility.INTERNAL,
      isAutoAwarded: true,
      criteria: { type: "velocity_check", transactionsPerHour: 10 },
    },
    {
      slug: "farm-suspect",
      name: "Farm Suspect",
      description: "Account shows patterns consistent with raffle or bonus farming.",
      category: BadgeCategory.TRUST,
      badgeMode: BadgeMode.DYNAMIC,
      displayPriority: 93,
      visibility: BadgeVisibility.INTERNAL,
      isAutoAwarded: true,
      criteria: { type: "farm_detection", signals: ["multi_account", "ip_reuse", "payment_reuse"] },
    },
  ];

  const badges = await Promise.all(
    badgeDefinitions.map((b) =>
      db.badge.upsert({
        where: { slug: b.slug },
        update: {},
        create: b,
      })
    )
  );

  console.log(`Badges seeded: ${badges.length} badges`);
  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
