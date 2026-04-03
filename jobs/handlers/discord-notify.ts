import { Job } from "bullmq";
import { db } from "@/lib/db";

export interface DiscordNotifyJobData {
  submissionId: string;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  image?: { url: string };
  thumbnail?: { url: string };
  footer?: { text: string };
  timestamp?: string;
}

async function postToDiscord(embeds: DiscordEmbed[]): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[discord-notify] DISCORD_WEBHOOK_URL is not set — skipping");
    return;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Discord webhook returned ${response.status}: ${text}`
    );
  }
}

export async function handleDiscordNotify(
  job: Job<DiscordNotifyJobData>
): Promise<void> {
  const { submissionId } = job.data;

  const submission = await db.cardSubmission.findUnique({
    where: { id: submissionId },
    include: {
      user: true,
      card: true,
    },
  });

  if (!submission) {
    throw new Error(`Submission not found: ${submissionId}`);
  }

  const card = submission.card;
  const user = submission.user;

  // Build price fields
  const priceFields: Array<{ name: string; value: string; inline: boolean }> = [];
  if (submission.tcgPriceNM != null) {
    priceFields.push({ name: "TCG NM", value: `$${submission.tcgPriceNM.toFixed(2)}`, inline: true });
  }
  if (submission.tcgPriceLP != null) {
    priceFields.push({ name: "TCG LP", value: `$${submission.tcgPriceLP.toFixed(2)}`, inline: true });
  }
  if (submission.tcgPriceMP != null) {
    priceFields.push({ name: "TCG MP", value: `$${submission.tcgPriceMP.toFixed(2)}`, inline: true });
  }
  if (submission.tcgPriceHP != null) {
    priceFields.push({ name: "TCG HP", value: `$${submission.tcgPriceHP.toFixed(2)}`, inline: true });
  }
  if (submission.offeredPrice != null) {
    priceFields.push({ name: "Offered Price", value: `$${submission.offeredPrice.toFixed(2)}`, inline: true });
  }
  if (submission.finalAcceptedPrice != null) {
    priceFields.push({ name: "Final Price", value: `$${submission.finalAcceptedPrice.toFixed(2)}`, inline: true });
  }

  const embed: DiscordEmbed = {
    title: card ? `New Submission: ${card.name}` : "New Card Submission",
    description: submission.description ?? undefined,
    color: 0x6366f1, // nimbus purple
    fields: [
      { name: "Submission ID", value: submissionId, inline: false },
      {
        name: "Customer",
        value: `${user.name ?? "Unknown"} (${user.email ?? "no email"})`,
        inline: false,
      },
      {
        name: "Status",
        value: submission.status,
        inline: true,
      },
      {
        name: "Condition",
        value: submission.estimatedCondition,
        inline: true,
      },
      ...priceFields,
    ],
    timestamp: submission.createdAt.toISOString(),
    footer: { text: "Card Nimbus — Submission Alert" },
  };

  // Attach first image if present
  if (submission.images.length > 0) {
    embed.image = { url: submission.images[0] };
  }

  // Attach card thumbnail if available
  if (card?.imageUrl) {
    embed.thumbnail = { url: card.imageUrl };
  }

  await postToDiscord([embed]);

  console.log(
    `[discord-notify] Posted submission ${submissionId} to Discord`
  );
}
