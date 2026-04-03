import {
  priceSyncQueue,
  searchSyncQueue,
  wishlistAlertQueue,
  submissionReminderQueue,
  raffleLifecycleQueue,
  mysteryStockQueue,
  badgeEvaluationQueue,
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

  // Every minute: raffle lifecycle (activate scheduled, freeze full, draw/cancel expired)
  await raffleLifecycleQueue.add(
    "raffle-lifecycle",
    { action: "lifecycle" },
    {
      repeat: { pattern: "* * * * *" },
      jobId: "raffle-lifecycle",
    }
  );

  // Every 5 minutes: expire stale ticket reservations
  await raffleLifecycleQueue.add(
    "expire-reservations",
    { action: "expire_reservations" },
    {
      repeat: { pattern: "*/5 * * * *" },
      jobId: "expire-reservations",
    }
  );

  // Hourly: mystery stock alerts
  await mysteryStockQueue.add(
    "mystery-stock-alerts",
    {},
    {
      repeat: { pattern: "0 * * * *" },
      jobId: "mystery-stock-alerts",
    }
  );

  // Hourly: dynamic badge evaluation (fast-shipper, top-rated, quick-responder, etc.)
  await badgeEvaluationQueue.add(
    "hourly-badge-evaluation",
    { type: "evaluate_dynamic" },
    {
      repeat: { pattern: "0 * * * *" },
      jobId: "hourly-badge-evaluation",
    }
  );

  // Monthly on the 1st at midnight UTC: leaderboard snapshot + Top Seller of Month award
  await badgeEvaluationQueue.add(
    "monthly-leaderboard-snapshot",
    { type: "evaluate_dynamic" },
    {
      repeat: { pattern: "0 0 1 * *" },
      jobId: "monthly-leaderboard-snapshot",
    }
  );

  console.log("Cron jobs scheduled:");
  console.log("  - daily-price-sync:          0 3 * * *    (every day at 03:00 UTC)");
  console.log("  - weekly-full-reindex:       0 4 * * 0    (every Sunday at 04:00 UTC)");
  console.log("  - hourly-wishlist-alerts:    0 * * * *    (every hour)");
  console.log("  - submission-reminders:      */15 * * * * (every 15 minutes)");
  console.log("  - raffle-lifecycle:          * * * * *    (every minute)");
  console.log("  - expire-reservations:       */5 * * * *  (every 5 minutes)");
  console.log("  - mystery-stock-alerts:      0 * * * *    (every hour)");
  console.log("  - hourly-badge-evaluation:   0 * * * *    (every hour)");
  console.log("  - monthly-leaderboard:       0 0 1 * *    (1st of each month at 00:00 UTC)");
}

scheduleCronJobs().catch((err) => {
  console.error("Failed to schedule cron jobs:", err);
  process.exit(1);
});
