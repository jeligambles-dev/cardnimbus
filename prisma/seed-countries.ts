import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Default country assignments so existing users show up in the Users admin view.
// We distribute users across several countries so the admin dashboard shows
// variety. Users already set up with a country are left alone.

const COUNTRY_POOL = [
  "US", "US", "US", "US", // weight US a bit heavier
  "GB", "GB",
  "CA", "CA",
  "DE", "FR", "IT", "ES", "NL", "AU", "JP",
  "IE", "SE", "NO", "DK", "PL",
];

// Preset ship-to continents for existing listings
const NORTH_AMERICA = ["US", "CA", "MX"];
const EUROPE = [
  "GB", "IE", "DE", "FR", "ES", "IT", "PT", "NL", "BE", "CH",
  "AT", "DK", "SE", "NO", "FI", "PL", "CZ", "HU", "GR",
];
const EU_AND_NA = [...NORTH_AMERICA, ...EUROPE];
const GLOBAL_BIG = [
  ...EU_AND_NA,
  "AU", "NZ", "JP", "KR", "SG", "HK", "TW",
  "BR", "AR", "CL", "MX",
];

const SHIP_TO_POOL: string[][] = [
  NORTH_AMERICA,
  ["US", "CA"],
  EUROPE,
  EU_AND_NA,
  GLOBAL_BIG,
  ["US"],
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

async function main() {
  console.log("Seeding user countries…");

  const users = await db.user.findMany({
    where: { country: null },
    select: { id: true },
  });

  let userCount = 0;
  for (let i = 0; i < users.length; i++) {
    const country = pick(COUNTRY_POOL, i);
    await db.user.update({
      where: { id: users[i].id },
      data: { country },
    });
    userCount++;
  }
  console.log(`  → updated ${userCount} users`);

  console.log("Seeding listing ship-to countries…");

  const listings = await db.listing.findMany({
    where: { shipsToCountries: { isEmpty: true } },
    select: { id: true },
  });

  let listingCount = 0;
  for (let i = 0; i < listings.length; i++) {
    const countries = pick(SHIP_TO_POOL, i);
    await db.listing.update({
      where: { id: listings[i].id },
      data: { shipsToCountries: countries },
    });
    listingCount++;
  }
  console.log(`  → updated ${listingCount} listings`);

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
