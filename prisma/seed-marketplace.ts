import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const SELLERS = [
  {
    email: "topshelf@cardnimbus.com",
    name: "TopShelf Cards",
    bio: "Premium graded slabs and chase cards. Ships same-day, tracked, and sleeved. 100% authenticated.",
    totalSales: 342,
    rating: 4.9,
    ratingCount: 128,
    tierName: "GOLD",
    isVerified: true,
    location: "Los Angeles, CA",
  },
  {
    email: "rippinpacks@cardnimbus.com",
    name: "Rippin Packs",
    bio: "Live breakers turned retailers. Fresh product straight from distro — no reshipping.",
    totalSales: 187,
    rating: 4.8,
    ratingCount: 74,
    tierName: "SILVER",
    isVerified: true,
    location: "Austin, TX",
  },
  {
    email: "collectorcove@cardnimbus.com",
    name: "Collector's Cove",
    bio: "Vintage and modern singles. Specialized in Japanese print runs.",
    totalSales: 56,
    rating: 4.7,
    ratingCount: 22,
    tierName: "STANDARD",
    isVerified: false,
    location: "Portland, OR",
  },
  {
    email: "psa10hunter@cardnimbus.com",
    name: "PSA 10 Hunter",
    bio: "Only the cleanest gem mint slabs. I hunt so you don't have to.",
    totalSales: 214,
    rating: 5.0,
    ratingCount: 89,
    tierName: "GOLD",
    isVerified: true,
    location: "Brooklyn, NY",
  },
];

const LISTING_TEMPLATES = [
  { title: "Charizard VMAX Alt Art — Shining Fates SV107", price: 445, condition: "NM", category: "SLAB", image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=900&h=1200&fit=crop" },
  { title: "Umbreon VMAX Alt Art — Evolving Skies 215", price: 312, condition: "LP", category: "SINGLE", image: "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=900&h=1200&fit=crop" },
  { title: "Pikachu VMAX Rainbow Rare — Vivid Voltage 188", price: 148, condition: "NM", category: "SINGLE", image: "https://images.unsplash.com/photo-1609604266590-ccfaa49b1d4f?w=900&h=1200&fit=crop" },
  { title: "Obsidian Flames Booster Box — Factory Sealed", price: 129, condition: null, category: "BOOSTER_BOX", image: "https://images.unsplash.com/photo-1627646811101-07c40bafcfb4?w=900&h=1200&fit=crop" },
  { title: "Paradox Rift Elite Trainer Box", price: 52, condition: null, category: "BOOSTER_BOX", image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=900&h=1200&fit=crop" },
  { title: "Moonbreon VMAX Alt Art PSA 9", price: 485, condition: "NM", category: "SLAB", image: "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=900&h=1200&fit=crop" },
  { title: "Rayquaza VMAX Secret Rare — Evolving Skies 218", price: 168, condition: "NM", category: "SINGLE", image: "https://images.unsplash.com/photo-1609604266590-ccfaa49b1d4f?w=900&h=1200&fit=crop" },
  { title: "Scarlet & Violet Booster Pack — Factory Sealed", price: 5.99, condition: null, category: "PACK", image: "https://images.unsplash.com/photo-1627646811101-07c40bafcfb4?w=900&h=1200&fit=crop" },
  { title: "Mew VMAX Gold — Fusion Strike 269 BGS 9.5", price: 78, condition: "NM", category: "SLAB", image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=900&h=1200&fit=crop" },
  { title: "Giratina VSTAR Alt Art — Lost Origin 186", price: 128, condition: "NM", category: "SINGLE", image: "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=900&h=1200&fit=crop" },
  { title: "Paldea Evolved Booster Bundle — 6 Packs", price: 28, condition: null, category: "PACK", image: "https://images.unsplash.com/photo-1627646811101-07c40bafcfb4?w=900&h=1200&fit=crop" },
  { title: "Gengar VMAX — Fusion Strike 157 PSA 10", price: 215, condition: "NM", category: "SLAB", image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=900&h=1200&fit=crop" },
];

const REVIEW_COMMENTS = [
  "Card arrived exactly as described. Perfect centering, packaging was top notch.",
  "Super fast shipping, great communication. Would buy from again!",
  "Slab was mint, arrived in a team bag inside a bubble mailer. Happy collector.",
  "Gorgeous card, photos did not do it justice. Thank you!",
  "Smooth transaction from start to finish. Trusted seller.",
  "Exactly what I was looking for. Price was fair too.",
];

async function seed() {
  const tiers = await db.commissionTier.findMany();
  const tierMap = new Map(tiers.map((t) => [t.name, t.id]));

  console.log("Seeding marketplace demo data...");

  const passwordHash = await bcrypt.hash("SellerDemo2026!", 12);

  for (const s of SELLERS) {
    // Create or update user
    const user = await db.user.upsert({
      where: { email: s.email },
      update: { name: s.name, role: "SELLER" },
      create: {
        email: s.email,
        name: s.name,
        passwordHash,
        role: "SELLER",
        emailVerified: new Date(),
      },
    });

    // Create or update seller profile
    const profile = await db.sellerProfile.upsert({
      where: { userId: user.id },
      update: {
        bio: s.bio,
        totalSales: s.totalSales,
        rating: s.rating,
        ratingCount: s.ratingCount,
        isVerified: s.isVerified,
        location: s.location,
        tierId: tierMap.get(s.tierName) ?? null,
        responseTime: 45,
      },
      create: {
        userId: user.id,
        bio: s.bio,
        totalSales: s.totalSales,
        rating: s.rating,
        ratingCount: s.ratingCount,
        isVerified: s.isVerified,
        location: s.location,
        tierId: tierMap.get(s.tierName) ?? null,
        responseTime: 45,
      },
    });

    // Clear existing listings for clean reseed
    await db.listing.deleteMany({ where: { sellerId: profile.id } });

    // Create 3-4 listings per seller from templates
    const shuffled = [...LISTING_TEMPLATES].sort(() => Math.random() - 0.5);
    const pickCount = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < pickCount; i++) {
      const t = shuffled[i];
      const discount = 0.8 + Math.random() * 0.3; // 80-110% of price
      const listingPrice = Math.round(t.price * discount * 100) / 100;
      const dealScore =
        listingPrice < t.price ? Math.round(((t.price - listingPrice) / t.price) * 100) : null;
      const dealScoreBand =
        dealScore === null ? null : dealScore >= 30 ? "FIRE" : dealScore >= 20 ? "GREAT" : dealScore >= 10 ? "GOOD" : null;

      await db.listing.create({
        data: {
          sellerId: profile.id,
          title: t.title,
          price: listingPrice,
          condition: (t.condition as "NM" | "LP" | "MP" | "HP" | null) ?? null,
          category: t.category as "PACK" | "BOOSTER_BOX" | "SLAB" | "SINGLE",
          images: [t.image],
          moderationStatus: "APPROVED",
          saleStatus: "ACTIVE",
          dealScore,
          dealScoreBand,
          description: "Listed by " + s.name + ". Ships within 24 hours, tracked and packaged securely.",
        },
      });
    }

    console.log(`  Seeded ${s.name} — ${pickCount} listings`);
  }

  console.log("Marketplace seed complete.");
  await db.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
