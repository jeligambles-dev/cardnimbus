import { Job } from "bullmq";
import {
  sendOrderConfirmation,
  sendShippingNotification,
  sendWelcomeEmail,
  sendCouponReminder,
} from "@/lib/email";

export type EmailJobData =
  | {
      type: "order_confirmation";
      to: string;
      orderNumber: string;
      total: number;
      items: Array<{ name: string; quantity: number; price: number }>;
    }
  | {
      type: "shipping_notification";
      to: string;
      orderNumber: string;
      trackingNumber: string;
      carrier: string;
    }
  | {
      type: "welcome";
      to: string;
      name: string;
      couponCode: string;
    }
  | {
      type: "coupon_reminder";
      to: string;
      name: string;
      couponCode: string;
    };

export async function handleSendEmail(job: Job<EmailJobData>): Promise<void> {
  const data = job.data;

  switch (data.type) {
    case "order_confirmation":
      await sendOrderConfirmation(data.to, {
        orderNumber: data.orderNumber,
        total: data.total,
        items: data.items,
      });
      break;

    case "shipping_notification":
      await sendShippingNotification(data.to, {
        orderNumber: data.orderNumber,
        trackingNumber: data.trackingNumber,
        carrier: data.carrier,
      });
      break;

    case "welcome":
      await sendWelcomeEmail(data.to, {
        name: data.name,
        couponCode: data.couponCode,
      });
      break;

    case "coupon_reminder":
      await sendCouponReminder(data.to, {
        name: data.name,
        couponCode: data.couponCode,
      });
      break;

    default: {
      const exhaustive: never = data;
      throw new Error(`Unknown email job type: ${(exhaustive as EmailJobData).type}`);
    }
  }
}
