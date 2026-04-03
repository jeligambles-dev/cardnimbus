import { db } from "@/lib/db";

interface CartItemInput {
  productId: string;
  quantity: number;
}

interface ValidatedCartItem {
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  quantity: number;
  stock: number;
}

interface CartValidationResult {
  valid: boolean;
  items: ValidatedCartItem[];
  total: number;
  errors: string[];
}

export async function validateCart(items: CartItemInput[]): Promise<CartValidationResult> {
  const errors: string[] = [];
  const validatedItems: ValidatedCartItem[] = [];

  const productIds = items.map((i) => i.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productMap.get(item.productId);

    if (!product) {
      errors.push(`Product not found: ${item.productId}`);
      continue;
    }

    if (!product.isActive) {
      errors.push(`Product is unavailable: ${product.name}`);
      continue;
    }

    if (product.stock < item.quantity) {
      errors.push(`Insufficient stock for ${product.name} (available: ${product.stock})`);
      continue;
    }

    validatedItems.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] ?? null,
      price: product.price,
      quantity: item.quantity,
      stock: product.stock,
    });
  }

  const total = validatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    valid: errors.length === 0,
    items: validatedItems,
    total: Math.round(total * 100) / 100,
    errors,
  };
}
