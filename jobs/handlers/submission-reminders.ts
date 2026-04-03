import { Job } from "bullmq";
import { db } from "@/lib/db";
import { SubmissionStatus } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SubmissionReminderJobData {}

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footer?: { text: string };
  timestamp?: string;
}

async function postToDiscord(embeds: DiscordEmbed[]): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn(
      "[submission-reminders] DISCORD_WEBHOOK_URL is not set — skipping"
    );
    return;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Discord webhook returned ${response.status}: ${text}`);
  }
}

function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60 * 1000);
}

export async function handleSubmissionReminders(
  _job: Job<SubmissionReminderJobData>
): Promise<void> {
  const embeds: DiscordEmbed[] = [];

  // 1. Unclaimed submissions older than 30 minutes
  const unclaimed = await db.cardSubmission.findMany({
    where: {
      status: SubmissionStatus.SUBMITTED,
      assignedAdminId: null,
      createdAt: { lt: minutesAgo(30) },
    },
    include: { user: true, card: true },
    orderBy: { createdAt: "asc" },
  });

  for (const sub of unclaimed) {
    const ageMin = Math.round(
      (Date.now() - sub.createdAt.getTime()) / 60_000
    );
    embeds.push({
      title: "Unclaimed Submission",
      description: `Submission **${sub.id}** has been waiting for ${ageMin} minutes without being claimed.`,
      color: 0xf59e0b, // amber
      fields: [
        { name: "Customer", value: sub.user.email ?? "unknown", inline: true },
        { name: "Card", value: sub.card?.name ?? "Unknown", inline: true },
        { name: "Condition", value: sub.estimatedCondition, inline: true },
      ],
      timestamp: sub.createdAt.toISOString(),
      footer: { text: "Card Nimbus — Unclaimed Submission" },
    });
  }

  // 2. Claimed but no action taken in 2 hours (still UNDER_REVIEW)
  const staleReview = await db.cardSubmission.findMany({
    where: {
      status: SubmissionStatus.UNDER_REVIEW,
      updatedAt: { lt: minutesAgo(120) },
    },
    include: { user: true, card: true },
    orderBy: { updatedAt: "asc" },
  });

  for (const sub of staleReview) {
    const ageHours = (
      (Date.now() - sub.updatedAt.getTime()) /
      3_600_000
    ).toFixed(1);
    embeds.push({
      title: "Stale Review — No Action Taken",
      description: `Submission **${sub.id}** has been under review for ${ageHours} hours with no progress.`,
      color: 0xef4444, // red
      fields: [
        { name: "Customer", value: sub.user.email ?? "unknown", inline: true },
        { name: "Card", value: sub.card?.name ?? "Unknown", inline: true },
        {
          name: "Assigned Admin",
          value: sub.assignedAdminId ?? "unknown",
          inline: true,
        },
      ],
      timestamp: sub.updatedAt.toISOString(),
      footer: { text: "Card Nimbus — Stale Review" },
    });
  }

  // 3. Offers without a response in 48 hours
  const pendingOffers = await db.cardSubmission.findMany({
    where: {
      status: SubmissionStatus.OFFER_SENT,
      updatedAt: { lt: minutesAgo(48 * 60) },
    },
    include: { user: true, card: true },
    orderBy: { updatedAt: "asc" },
  });

  for (const sub of pendingOffers) {
    const ageDays = (
      (Date.now() - sub.updatedAt.getTime()) /
      86_400_000
    ).toFixed(1);
    embeds.push({
      title: "Offer Awaiting Response",
      description: `Offer on submission **${sub.id}** has been unanswered for ${ageDays} day(s).`,
      color: 0x8b5cf6, // purple
      fields: [
        { name: "Customer", value: sub.user.email ?? "unknown", inline: true },
        { name: "Card", value: sub.card?.name ?? "Unknown", inline: true },
        {
          name: "Offered Price",
          value: sub.offeredPrice != null ? `$${sub.offeredPrice.toFixed(2)}` : "N/A",
          inline: true,
        },
        {
          name: "Offer Expires",
          value: sub.offerExpiresAt?.toUTCString() ?? "N/A",
          inline: false,
        },
      ],
      timestamp: sub.updatedAt.toISOString(),
      footer: { text: "Card Nimbus — Pending Offer" },
    });
  }

  if (embeds.length === 0) {
    console.log("[submission-reminders] No reminders to send.");
    return;
  }

  // Discord allows max 10 embeds per message; chunk if needed
  for (let i = 0; i < embeds.length; i += 10) {
    await postToDiscord(embeds.slice(i, i + 10));
  }

  console.log(
    `[submission-reminders] Sent ${embeds.length} reminder(s) to Discord ` +
      `(${unclaimed.length} unclaimed, ${staleReview.length} stale, ${pendingOffers.length} pending offers)`
  );
}
