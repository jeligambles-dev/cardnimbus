declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

export type {
  User, Product, Order, OrderItem, Payment, Shipment, Card, Coupon, Notification, AuditLog, Address,
} from "@prisma/client";

export type { Role, ProductCategory, CardCondition, OrderStatus, PaymentProvider, PaymentStatus } from "@prisma/client";
