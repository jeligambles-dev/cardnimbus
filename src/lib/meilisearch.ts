import { Meilisearch } from "meilisearch";

export const meili = new Meilisearch({
  host: process.env.MEILISEARCH_HOST ?? "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY,
});

export const INDEXES = {
  products: "products",
  cards: "cards",
  listings: "listings",
} as const;

export async function setupIndexes(): Promise<void> {
  // --- Products index ---
  await meili.createIndex(INDEXES.products, { primaryKey: "id" });
  const productsIndex = meili.index(INDEXES.products);

  await productsIndex.updateSearchableAttributes([
    "name",
    "description",
    "cardName",
    "setName",
  ]);

  await productsIndex.updateFilterableAttributes([
    "isActive",
    "category",
    "condition",
    "price",
    "cardId",
  ]);

  await productsIndex.updateSortableAttributes(["price", "createdAt", "name"]);

  await productsIndex.updateRankingRules([
    "words",
    "typo",
    "proximity",
    "attribute",
    "sort",
    "exactness",
  ]);

  // --- Cards index ---
  await meili.createIndex(INDEXES.cards, { primaryKey: "id" });
  const cardsIndex = meili.index(INDEXES.cards);

  await cardsIndex.updateSearchableAttributes([
    "name",
    "setName",
    "rarity",
    "cardNumber",
    "printing",
  ]);

  await cardsIndex.updateFilterableAttributes([
    "setName",
    "rarity",
    "language",
    "printing",
  ]);

  await cardsIndex.updateSortableAttributes([
    "tcgPriceMarket",
    "tcgPriceNM",
    "createdAt",
    "name",
  ]);

  await cardsIndex.updateRankingRules([
    "words",
    "typo",
    "proximity",
    "attribute",
    "sort",
    "exactness",
  ]);

  // --- Listings index ---
  await meili.createIndex(INDEXES.listings, { primaryKey: "id" });
  const listingsIndex = meili.index(INDEXES.listings);

  await listingsIndex.updateSearchableAttributes([
    "title",
    "description",
    "setName",
    "cardNumber",
    "sellerName",
  ]);

  await listingsIndex.updateFilterableAttributes([
    "category",
    "condition",
    "saleStatus",
    "moderationStatus",
    "price",
    "dealScoreBand",
  ]);

  await listingsIndex.updateSortableAttributes(["price", "createdAt", "dealScore"]);

  await listingsIndex.updateRankingRules([
    "words",
    "typo",
    "proximity",
    "attribute",
    "sort",
    "exactness",
  ]);
}
