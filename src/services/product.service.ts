import { ProductCategory, CardCondition } from "@prisma/client";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { NotFoundError, ValidationError } from "@/lib/errors";

export interface CreateProductInput {
  cardId?: string;
  name: string;
  category: ProductCategory;
  description?: string;
  images?: string[];
  price: number;
  compareAtPrice?: number;
  stock?: number;
  condition?: CardCondition;
  isActive?: boolean;
}

export interface GetProductsInput {
  page?: number;
  limit?: number;
  category?: ProductCategory;
  condition?: CardCondition;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price_asc" | "price_desc" | "name" | "newest";
}

export interface UpdateProductInput {
  cardId?: string | null;
  name?: string;
  category?: ProductCategory;
  description?: string | null;
  images?: string[];
  price?: number;
  compareAtPrice?: number | null;
  stock?: number;
  condition?: CardCondition | null;
  isActive?: boolean;
}

export async function createProduct(input: CreateProductInput) {
  let slug = slugify(input.name);

  const existing = await db.product.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  return db.product.create({
    data: {
      ...input,
      slug,
      images: input.images ?? [],
      stock: input.stock ?? 0,
    },
  });
}

export async function getProducts({
  page = 1,
  limit = 20,
  category,
  condition,
  minPrice,
  maxPrice,
  sortBy = "newest",
}: GetProductsInput) {
  const where = {
    isActive: true,
    ...(category ? { category } : {}),
    ...(condition ? { condition } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
  };

  const orderBy = (() => {
    switch (sortBy) {
      case "price_asc":
        return { price: "asc" as const };
      case "price_desc":
        return { price: "desc" as const };
      case "name":
        return { name: "asc" as const };
      case "newest":
      default:
        return { createdAt: "desc" as const };
    }
  })();

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { card: true },
    }),
    db.product.count({ where }),
  ]);

  return { products, total, page, limit };
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: { card: true, variants: true },
  });
}

export async function getProductById(id: string) {
  return db.product.findUnique({
    where: { id },
    include: { card: true, variants: true },
  });
}

export async function updateProduct(id: string, data: UpdateProductInput) {
  return db.product.update({
    where: { id },
    data,
  });
}

export async function decrementStock(productId: string, quantity: number) {
  const product = await db.product.findUnique({ where: { id: productId } });

  if (!product) {
    throw new NotFoundError("Product");
  }

  if (product.stock < quantity) {
    throw new ValidationError(
      `Insufficient stock. Requested: ${quantity}, available: ${product.stock}`
    );
  }

  return db.product.update({
    where: { id: productId },
    data: { stock: { decrement: quantity } },
  });
}
