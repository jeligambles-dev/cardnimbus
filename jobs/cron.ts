import {
  priceSyncQueue,
  searchSyncQueue,
  wishlistAlertQueue,
  submissionReminderQueue,
} from "./queues";

async function scheduleCronJobs() {
  // Daily price sync at 3 AM UTC
  await priceSyncQueue.add(
    "daily-price-sync",
    {},
    {
      repeat: { pattern: "0 3 * * *" },
      jobId: "daily-price-sync",
    }
  );

  // Weekly full reindex on Sunday at 4 AM UTC
  await searchSyncQueue.add(
    "weekly-full-reindex",
    { action: "full_reindex" },
    {
      repeat: { pattern: "0 4 * * 0" },
      jobId: "weekly-full-reindex",
    }
  );

  // Hourly wishlist alert check
  await wishlistAlertQueue.add(
    "hourly-wishlist-alerts",
    {},
    {
      repeat: { pattern: "0 * * * *" },
      jobId: "hourly-wishlist-alerts",
    }
  );

  // Every 15 minutes submission reminder check
  await submissionReminderQueue.add(
    "submission-reminders",
    {},
    {
      repeat: { pattern: "*/15 * * * *" },
      jobId: "submission-reminders",
    }
  );

  console.log("Cron jobs scheduled:");
  console.log("  - daily-price-sync:        0 3 * * *    (every day at 03:00 UTC)");
  console.log("  - weekly-full-reindex:     0 4 * * 0    (every Sunday at 04:00 UTC)");
  console.log("  - hourly-wishlist-alerts:  0 * * * *    (every hour)");
  console.log("  - submission-reminders:    */15 * * * * (every 15 minutes)");
}

scheduleCronJobs().catch((err) => {
  console.error("Failed to schedule cron jobs:", err);
  process.exit(1);
});
