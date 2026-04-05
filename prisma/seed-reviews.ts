import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const BUYERS = [
  { email: "alex.buyer@cardnimbus.com", name: "Alex M." },
  { email: "jordan.buyer@cardnimbus.com", name: "Jordan K." },
  { email: "sam.buyer@cardnimbus.com", name: "Sam P." },
  { email: "riley.buyer@cardnimbus.com", name: "Riley T." },
  { email: "taylor.buyer@cardnimbus.com", name: "Taylor J." },
  { email: "casey.buyer@cardnimbus.com", name: "Casey B." },
  { email: "morgan.buyer@cardnimbus.com", name: "Morgan L." },
  { email: "drew.buyer@cardnimbus.com", name: "Drew S." },
];

const REVIEW_COMMENTS = [
  "Card arrived exactly as described. Perfect centering, packaging was top notch.",
  "Super fast shipping, great communication. Would buy from again!",
  "Slab was mint, arrived in a team bag inside a bubble mailer. Happy collector.",
  "Gorgeous card, photos did not do it justice. Thank you!",
  "Smooth transaction from start to finish. Trusted seller.",
  "Exactly what I was looking for. Price was fair too.",
  "Shipped same day! Card was sleeved, toploaded, and taped perfectly.",
  "Been buying from this seller for months — always fire deals and honest grading.",
  "Arrived faster than expected. Card is in phenomenal condition.",
  "Legit seller. Will definitely be coming back for more pulls.",
];

const SAMPLE_ITEMS = [
  { title: "Charizard VMAX Alt Art — Shining Fates SV107", price: 445, image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=900&h=1200&fit=crop", condition: "NM" as const },
  { title: "Umbreon VMAX Alt Art — Evolving Skies 215", price: 312, image: "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=900&h=1200&fit=crop", condition: "LP" as const },
  { title: "Moonbreon VMAX Alt Art PSA 9", price: 485, image: "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=900&h=1200&fit=crop", condition: "NM" as const },
  { title: "Pikachu VMAX Rainbow Rare — Vivid Voltage 188", price: 148, image: "https://images.unsplash.com/photo-1609604266590-ccfaa49b1d4f?w=900&h=1200&fit=crop", condition: "NM" as const },
  { title: "Rayquaza VMAX Secret Rare — Evolving Skies 218", price: 168, image: "https://images.unsplash.com/photo-1609604266590-ccfaa49b1d4f?w=900&h=1200&fit=crop", condition: "NM" as const },
  { title: "Giratina VSTAR Alt Art — Lost Origin 186", price: 128, image: "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=900&h=1200&fit=crop", condition: "NM" as const },
  { title: "Mew VMAX Gold — Fusion Strike 269 BGS 9.5", price: 78, image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=900&h=1200&fit=crop", condition: "NM" as const },
  { title: "Gengar VMAX — Fusion Strike 157 PSA 10", price: 215, image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=900&h=1200&fit=crop", condition: "NM" as const },
];

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CN-${date}-${random}`;
}

function randomDaysAgo(min: number, max: number): Date {
  const days = min + Math.floor(Math.random() * (max - min));
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function seed() {
  console.log("Seeding marketplace reviews + recent sales...");

  const passwordHash = await bcrypt.hash("BuyerDemo2026!", 12);

  // Create buyer users
  const buyers = [];
  for (const b of BUYERS) {
    const user = await db.user.upsert({
      where: { email: b.email },
      update: { name: b.name },
      create: {
        email: b.email,
        name: b.name,
        passwordHash,
        role: "BUYER",
        emailVerified: new Date(),
      },
    });
    buyers.push(user);
  }
  console.log(`  Created ${buyers.length} buyer accounts`);

  // Get all seller profiles
  const sellerProfiles = await db.sellerProfile.findMany({
    include: { user: true },
  });

  if (sellerProfiles.length === 0) {
    console.log("  No seller profiles found — run seed-marketplace.ts first");
    await db.$disconnect();
    return;
  }

  let totalOrders = 0;
  let totalReviews = 0;

  // For each seller, create 4-6 delivered orders with reviews
  for (const seller of sellerProfiles) {
    const numOrders = 4 + Math.floor(Math.random() * 3);
    const shuffled = [...SAMPLE_ITEMS].sort(() => Math.random() - 0.5);

    for (let i = 0; i < numOrders; i++) {
      const item = shuffled[i % shuffled.length];
      const buyer = buyers[Math.floor(Math.random() * buyers.length)];
      const soldAt = randomDaysAgo(1, 45);

      // Create delivered order
      const order = await db.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          buyerId: buyer.id,
          type: "MARKETPLACE",
          status: "DELIVERED",
          totalAmount: item.price,
          commission: Math.round(item.price * 0.10 * 100) / 100,
          createdAt: soldAt,
          updatedAt: soldAt,
          items: {
            create: {
              listingId: null,
              sellerId: seller.userId,
              quantity: 1,
              priceAtPurchase: item.price,
              titleSnapshot: item.title,
              imageSnapshot: item.image,
              conditionSnapshot: item.condition,
            },
          },
        },
      });
      totalOrders++;

      // 80% of orders get a review
      if (Math.random() < 0.8) {
        const rating = Math.random() < 0.85 ? 5 : Math.random() < 0.7 ? 4 : 3;
        const reviewDate = new Date(soldAt.getTime() + (1 + Math.floor(Math.random() * 3)) * 24 * 60 * 60 * 1000);
        const comment = REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)];

        await db.review.create({
          data: {
            orderId: order.id,
            reviewerId: buyer.id,
            revieweeId: seller.userId,
            rating,
            comment,
            type: "BUYER_TO_SELLER",
            isVisible: true,
            createdAt: reviewDate,
          },
        });
        totalReviews++;
      }
    }

    // Update seller profile rating + ratingCount based on actual reviews
    const sellerReviews = await db.review.findMany({
      where: { revieweeId: seller.userId, isVisible: true, type: "BUYER_TO_SELLER" },
      select: { rating: true },
    });
    if (sellerReviews.length > 0) {
      const avgRating = sellerReviews.reduce((s, r) => s + r.rating, 0) / sellerReviews.length;
      await db.sellerProfile.update({
        where: { id: seller.id },
        data: {
          rating: Math.round(avgRating * 10) / 10,
          ratingCount: sellerReviews.length,
        },
      });
    }

    console.log(`  ${seller.user.name}: ${numOrders} orders created`);
  }

  console.log(`\nTotal: ${totalOrders} orders, ${totalReviews} reviews across ${sellerProfiles.length} sellers`);
  console.log("Review seed complete.");
  await db.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
