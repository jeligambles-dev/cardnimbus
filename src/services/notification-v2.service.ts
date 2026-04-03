import { db } from "@/lib/db";
import { DeliveryChannel, NotificationType, Prisma } from "@prisma/client";
import { ValidationError } from "@/lib/errors";
import {
  getUserNotifications,
  markNotificationRead,
  markAllRead,
  getUnreadCount,
  createNotification,
} from "@/services/notification.service";

// Re-export for convenience
export { markNotificationRead, markAllRead, getUnreadCount };

// Default channels per event type
const DEFAULT_CHANNELS: Record<string, DeliveryChannel[]> = {
  ORDER_CONFIRMED: [DeliveryChannel.IN_APP, DeliveryChannel.EMAIL],
  PRICE_DROP: [DeliveryChannel.IN_APP, DeliveryChannel.EMAIL],
  SUBMISSION_STATUS: [DeliveryChannel.IN_APP, DeliveryChannel.EMAIL],
  SECURITY_ALERT: [DeliveryChannel.IN_APP, DeliveryChannel.EMAIL],
  BADGE_EARNED: [DeliveryChannel.IN_APP],
};

const SECURITY_ALERT_TYPE = "SECURITY_ALERT";

// Event types that cannot be disabled
const ALWAYS_ON_TYPES = new Set([SECURITY_ALERT_TYPE]);

export async function createNotificationEvent(
  userId: string,
  type: string,
  payload: Prisma.InputJsonValue & Record<string, unknown>
) {
  // Resolve channels: security alerts always use all default channels
  let channels: DeliveryChannel[];

  if (type === SECURITY_ALERT_TYPE) {
    channels = DEFAULT_CHANNELS[SECURITY_ALERT_TYPE] ?? [DeliveryChannel.IN_APP, DeliveryChannel.EMAIL];
  } else {
    // Load user preferences for this event type
    const prefs = await db.notificationPreference.findMany({
      where: { userId, eventType: type },
    });

    if (prefs.length > 0) {
      channels = prefs
        .filter((p) => p.enabled)
        .map((p) => p.channel);
    } else {
      // Fall back to defaults
      channels = DEFAULT_CHANNELS[type] ?? [DeliveryChannel.IN_APP];
    }
  }

  // Create the event and deliveries in a transaction
  const event = await db.notificationEvent.create({
    data: {
      userId,
      type,
      payload,
      deliveries: {
        create: channels.map((channel) => ({ channel })),
      },
    },
    include: { deliveries: true },
  });

  // Create legacy Notification record for backward compatibility
  // Map event type to NotificationType enum — fall back to SYSTEM
  const legacyType: NotificationType =
    type in NotificationType
      ? (type as NotificationType)
      : NotificationType.SYSTEM;

  const title = typeof payload.title === "string" ? payload.title : type;
  const message =
    typeof payload.message === "string" ? payload.message : JSON.stringify(payload);
  const link = typeof payload.link === "string" ? payload.link : undefined;

  await createNotification(userId, legacyType, title, message, link);

  return event;
}

export async function getUserNotificationEvents(
  userId: string,
  page: number,
  limit: number
) {
  // Delegate to legacy notifications for backward compatibility
  return getUserNotifications(userId, page, limit);
}

export async function getPreferences(userId: string) {
  return db.notificationPreference.findMany({
    where: { userId },
    orderBy: [{ eventType: "asc" }, { channel: "asc" }],
  });
}

export async function setPreference(
  userId: string,
  eventType: string,
  channel: DeliveryChannel,
  enabled: boolean
) {
  if (ALWAYS_ON_TYPES.has(eventType) && !enabled) {
    throw new ValidationError(`${eventType} notifications cannot be disabled`);
  }

  return db.notificationPreference.upsert({
    where: { userId_eventType_channel: { userId, eventType, channel } },
    create: { userId, eventType, channel, enabled },
    update: { enabled },
  });
}
