import { Worker } from "bullmq";
import { connection } from "./queues";
import { handleSendEmail } from "./handlers/send-email";
import { handleSyncSearchIndex } from "./handlers/sync-search-index";
import { handleSyncPrices } from "./handlers/sync-prices";
import { handleDiscordNotify } from "./handlers/discord-notify";
import { handleWishlistAlerts } from "./handlers/wishlist-alerts";
import { handleSubmissionReminders } from "./handlers/submission-reminders";
import { handleRaffleLifecycle } from "./handlers/raffle-lifecycle";
import { handleMysteryStockAlerts } from "./handlers/mystery-stock-alerts";

// Email worker — higher concurrency since sends are I/O-bound
const emailWorker = new Worker("email", handleSendEmail, {
  connection,
  concurrency: 5,
});

// Search sync worker
const searchWorker = new Worker("search-sync", handleSyncSearchIndex, {
  connection,
  concurrency: 3,
});

// Price sync worker — kept serial to avoid rate-limiting upstream APIs
const priceWorker = new Worker("price-sync", handleSyncPrices, {
  connection,
  concurrency: 1,
});

// Discord notification worker — serial to respect rate limits
const discordWorker = new Worker("discord-notify", handleDiscordNotify, {
  connection,
  concurrency: 1,
});

// Wishlist alert worker
const wishlistAlertWorker = new Worker(
  "wishlist-alerts",
  handleWishlistAlerts,
  { connection, concurrency: 1 }
);

// Submission reminder worker
const submissionReminderWorker = new Worker(
  "submission-reminders",
  handleSubmissionReminders,
  { connection, concurrency: 1 }
);

// Raffle lifecycle worker — serial to avoid race conditions
const raffleLifecycleWorker = new Worker(
  "raffle-lifecycle",
  handleRaffleLifecycle,
  { connection, concurrency: 1 }
);

// Mystery stock alert worker
const mysteryStockWorker = new Worker(
  "mystery-stock",
  handleMysteryStockAlerts,
  { connection, concurrency: 1 }
);

const workers = [
  emailWorker,
  searchWorker,
  priceWorker,
  discordWorker,
  wishlistAlertWorker,
  submissionReminderWorker,
  raffleLifecycleWorker,
  mysteryStockWorker,
];

// Logging

for (const worker of workers) {
  worker.on("completed", (job) => {
    console.log(`[${worker.name}] job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[${worker.name}] job ${job?.id} failed: ${err.message}`);
  });
}

// Graceful shutdown

async function shutdown() {
  console.log("SIGTERM received — closing workers...");
  await Promise.all(workers.map((w) => w.close()));
  console.log("All workers closed. Exiting.");
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

console.log(
  "Workers started: email (concurrency=5), search-sync (concurrency=3), " +
    "price-sync (concurrency=1), discord-notify (concurrency=1), " +
    "wishlist-alerts (concurrency=1), submission-reminders (concurrency=1), " +
    "raffle-lifecycle (concurrency=1), mystery-stock (concurrency=1)"
);
