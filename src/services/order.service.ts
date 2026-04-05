import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { generateOrderNumber } from "@/lib/utils";
import { ValidationError, NotFoundError } from "@/lib/errors";

interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface CreateOrderInput {
  buyerId: string;
  items: OrderItemInput[];
  shippingAddressId?: string;
  billingAddressId?: string;
  shippingCost?: number;
  discountAmount?: number;
}

export async function createOrder(input: CreateOrderInput) {
  const {
    buyerId,
    items,
    shippingAddressId,
    billingAddressId,
    shippingCost = 0,
    discountAmount = 0,
  } = input;

  if (!items || items.length === 0) {
    throw new ValidationError("Order must contain at least one item");
  }

  return db.$transaction(async (tx) => {
    const productIds = items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missing = productIds.filter((id) => !foundIds.has(id));
      throw new ValidationError(`Products not found or inactive: ${missing.join(", ")}`);
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.productId)!;
      if (product.stock < item.quantity) {
        throw new ValidationError(
          `Insufficient stock for "${product.name}" (available: ${product.stock}, requested: ${item.quantity})`
        );
      }
    }

    // Decrement stock
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const subtotal = items.reduce((sum, item) => {
      const product = productMap.get(item.productId)!;
      return sum + product.price * item.quantity;
    }, 0);

    const totalAmount = Math.max(0, subtotal + shippingCost - discountAmount);

    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        buyerId,
        status: OrderStatus.PENDING,
        totalAmount: Math.round(totalAmount * 100) / 100,
        shippingCost: Math.round(shippingCost * 100) / 100,
        discountAmount: Math.round(discountAmount * 100) / 100,
        shippingAddressId,
        billingAddressId,
        items: {
          create: items.map((item) => {
            const product = productMap.get(item.productId)!;
            return {
              productId: product.id,
              quantity: item.quantity,
              priceAtPurchase: product.price,
              titleSnapshot: product.name,
              imageSnapshot: product.images[0] ?? null,
              conditionSnapshot: product.condition,
              skuSnapshot: product.id,
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });

    return order;
  });
}

export async function getOrderById(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payments: true,
      shipments: true,
      shippingAddress: true,
      billingAddress: true,
      buyer: {
        select: { id: true, name: true, email: true },
      },
      reviews: true,
    },
  });

  if (!order) {
    throw new NotFoundError("Order");
  }

  return order;
}

export async function getUserOrders(userId: string, page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where: { buyerId: userId },
      include: {
        items: true,
        shipments: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.order.count({ where: { buyerId: userId } }),
  ]);

  return {
    orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new NotFoundError("Order");
  }

  return db.order.update({
    where: { id: orderId },
    data: { status },
  });
}
