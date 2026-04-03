import { db } from "@/lib/db";
import { NotificationType } from "@prisma/client";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  return db.notification.create({
    data: { userId, type, title, message, link },
  });
}

export async function getUserNotifications(
  userId: string,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.notification.count({ where: { userId } }),
    db.notification.count({ where: { userId, isRead: false } }),
  ]);

  return { notifications, total, unreadCount };
}

export async function markNotificationRead(id: string, userId: string) {
  return db.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

export async function markAllRead(userId: string) {
  return db.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return db.notification.count({ where: { userId, isRead: false } });
}
