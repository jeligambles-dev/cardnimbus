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

  console.log("Seeding slab grading…");

  const GRADING_COMPANIES = ["PSA", "BGS", "CGC", "ACE", "TAG"];
  // Grades weighted toward higher values (what most sellers list)
  const GRADE_POOL = [10, 10, 10, 9.5, 9.5, 9, 9, 8.5, 8, 7.5, 7, 6];

  const slabs = await db.listing.findMany({
    where: {
      category: "SLAB",
      OR: [{ grade: null }, { gradingCompany: null }],
    },
    select: { id: true },
  });

  let slabCount = 0;
  for (let i = 0; i < slabs.length; i++) {
    const company = GRADING_COMPANIES[i % GRADING_COMPANIES.length];
    const grade = GRADE_POOL[i % GRADE_POOL.length];
    await db.listing.update({
      where: { id: slabs[i].id },
      data: { grade, gradingCompany: company },
    });
    slabCount++;
  }
  console.log(`  → updated ${slabCount} slab listings`);

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
