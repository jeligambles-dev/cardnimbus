import { Queue } from "bullmq";
import IORedis from "ioredis";

export const connection = new IORedis(
  process.env.REDIS_URL ?? "redis://localhost:6379",
  { maxRetriesPerRequest: null }
);

export const emailQueue = new Queue("email", { connection });
export const searchSyncQueue = new Queue("search-sync", { connection });
export const priceSyncQueue = new Queue("price-sync", { connection });
export const discordQueue = new Queue("discord-notify", { connection });
export const wishlistAlertQueue = new Queue("wishlist-alerts", { connection });
export const submissionReminderQueue = new Queue("submission-reminders", { connection });
