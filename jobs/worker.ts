import { Worker } from "bullmq";
import { connection } from "./queues";
import { handleSendEmail } from "./handlers/send-email";
import { handleSyncSearchIndex } from "./handlers/sync-search-index";
import { handleSyncPrices } from "./handlers/sync-prices";

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

const workers = [emailWorker, searchWorker, priceWorker];

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

console.log("Workers started: email (concurrency=5), search-sync (concurrency=3), price-sync (concurrency=1)");
