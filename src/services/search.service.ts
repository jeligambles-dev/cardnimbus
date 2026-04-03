import { meili, INDEXES } from "@/lib/meilisearch";
import { db } from "@/lib/db";
import { ProductCategory, CardCondition } from "@prisma/client";

export interface SearchResult {
  type: "product" | "card";
  id: string;
  title: string;
  subtitle: string;
  image: string | null;
  price: number | null;
  condition: string | null;
  url: string;
}

export interface SearchOptions {
  category?: ProductCategory;
  condition?: CardCondition;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  limit: number;
  offset: number;
}

function buildProductFilter(options: SearchOptions): string[] {
  const filters: string[] = ["isActive = true"];

  if (options.category) {
    filters.push(`category = "${options.category}"`);
  }
  if (options.condition) {
    filters.push(`condition = "${options.condition}"`);
  }
  if (options.minPrice !== undefined) {
    filters.push(`price >= ${options.minPrice}`);
  }
  if (options.maxPrice !== undefined) {
    filters.push(`price <= ${options.maxPrice}`);
  }

  return filters;
}

export async function search(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResponse> {
  const limit = options.limit ?? 20;
  const offset = options.offset ?? 0;

  const perIndex = Math.ceil(limit / 2);

  const productFilter = buildProductFilter(options);

  const [productResults, cardResults] = await Promise.all([
    meili.index(INDEXES.products).search(query, {
      filter: productFilter,
      limit: perIndex,
      offset,
      attributesToRetrieve: [
        "id",
        "name",
        "description",
        "images",
        "price",
        "condition",
        "category",
        "slug",
        "cardName",
        "setName",
      ],
    }),
    // Only search cards when no product-specific filters are active
    !options.category && !options.minPrice && !options.maxPrice
      ? meili.index(INDEXES.cards).search(query, {
          limit: perIndex,
          offset,
          attributesToRetrieve: [
            "id",
            "name",
            "setName",
            "imageUrl",
            "tcgPriceMarket",
            "rarity",
          ],
        })
      : Promise.resolve({ hits: [], estimatedTotalHits: 0 }),
  ]);

  const productItems: SearchResult[] = productResults.hits.map((hit) => ({
    type: "product" as const,
    id: String(hit.id),
    title: String(hit.name),
    subtitle: hit.cardName
      ? `${String(hit.cardName)} — ${String(hit.setName ?? "")}`
      : String(hit.description ?? ""),
    image: Array.isArray(hit.images) && hit.images.length > 0
      ? String(hit.images[0])
      : null,
    price: typeof hit.price === "number" ? hit.price : null,
    condition: hit.condition ? String(hit.condition) : null,
    url: `/shop/${String(hit.slug)}`,
  }));

  const cardItems: SearchResult[] = cardResults.hits.map((hit) => ({
    type: "card" as const,
    id: String(hit.id),
    title: String(hit.name),
    subtitle: String(hit.setName ?? ""),
    image: hit.imageUrl ? String(hit.imageUrl) : null,
    price: typeof hit.tcgPriceMarket === "number" ? hit.tcgPriceMarket : null,
    condition: null,
    url: `/cards/${String(hit.id)}`,
  }));

  const results = [...productItems, ...cardItems].slice(0, limit);
  const total =
    (productResults.estimatedTotalHits ?? 0) +
    (cardResults.estimatedTotalHits ?? 0);

  return { results, total, limit, offset };
}

export async function syncProductToIndex(productId: string): Promise<void> {
  const product = await db.product.findUnique({
    where: { id: productId },
    include: { card: true },
  });

  if (!product) return;

  const doc = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? null,
    category: product.category,
    condition: product.condition ?? null,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    images: product.images,
    isActive: product.isActive,
    stock: product.stock,
    cardId: product.cardId ?? null,
    cardName: product.card?.name ?? null,
    setName: product.card?.setName ?? null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };

  await meili.index(INDEXES.products).addDocuments([doc]);
}

export async function syncCardToIndex(cardId: string): Promise<void> {
  const card = await db.card.findUnique({
    where: { id: cardId },
  });

  if (!card) return;

  const doc = {
    id: card.id,
    name: card.name,
    setName: card.setName,
    cardNumber: card.cardNumber,
    rarity: card.rarity ?? null,
    language: card.language,
    printing: card.printing ?? null,
    imageUrl: card.imageUrl ?? null,
    normalizedName: card.normalizedName,
    tcgPriceNM: card.tcgPriceNM ?? null,
    tcgPriceLP: card.tcgPriceLP ?? null,
    tcgPriceMP: card.tcgPriceMP ?? null,
    tcgPriceHP: card.tcgPriceHP ?? null,
    tcgPriceMarket: card.tcgPriceMarket ?? null,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  };

  await meili.index(INDEXES.cards).addDocuments([doc]);
}

export async function fullReindex(): Promise<void> {
  const [products, cards] = await Promise.all([
    db.product.findMany({ include: { card: true } }),
    db.card.findMany(),
  ]);

  const productDocs = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? null,
    category: product.category,
    condition: product.condition ?? null,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    images: product.images,
    isActive: product.isActive,
    stock: product.stock,
    cardId: product.cardId ?? null,
    cardName: product.card?.name ?? null,
    setName: product.card?.setName ?? null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }));

  const cardDocs = cards.map((card) => ({
    id: card.id,
    name: card.name,
    setName: card.setName,
    cardNumber: card.cardNumber,
    rarity: card.rarity ?? null,
    language: card.language,
    printing: card.printing ?? null,
    imageUrl: card.imageUrl ?? null,
    normalizedName: card.normalizedName,
    tcgPriceNM: card.tcgPriceNM ?? null,
    tcgPriceLP: card.tcgPriceLP ?? null,
    tcgPriceMP: card.tcgPriceMP ?? null,
    tcgPriceHP: card.tcgPriceHP ?? null,
    tcgPriceMarket: card.tcgPriceMarket ?? null,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  }));

  await Promise.all([
    productDocs.length > 0
      ? meili.index(INDEXES.products).addDocuments(productDocs)
      : Promise.resolve(),
    cardDocs.length > 0
      ? meili.index(INDEXES.cards).addDocuments(cardDocs)
      : Promise.resolve(),
  ]);
}

export async function removeProductFromIndex(productId: string): Promise<void> {
  await meili.index(INDEXES.products).deleteDocument(productId);
}
