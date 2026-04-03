import { PrismaClient, Role } from "@prisma/client";
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
  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
