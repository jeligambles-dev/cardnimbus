import { EmbedBuilder } from "discord.js";
import type { CardSubmission, User, Card } from "@prisma/client";

type SubmissionWithRelations = CardSubmission & {
  user: User;
  card: Card | null;
};

const ORANGE = 0xf97316;

function formatPrice(price: number | null | undefined): string {
  if (price == null) return "N/A";
  return `$${price.toFixed(2)}`;
}

function accountAgeDays(createdAt: Date): number {
  return Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
}

function formatAge(createdAt: Date): string {
  const now = Date.now();
  const diffMs = now - createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function buildSubmissionEmbed(submission: SubmissionWithRelations): EmbedBuilder {
  const { user, card } = submission;
  const ageDays = accountAgeDays(user.createdAt);
  const isNewAccount = ageDays < 30;

  const riskBadges: string[] = [];
  if (isNewAccount) riskBadges.push("🆕 New Account");

  const embed = new EmbedBuilder()
    .setColor(ORANGE)
    .setTitle(`New Card Submission #${submission.id.slice(-8).toUpperCase()}`)
    .setTimestamp(submission.createdAt);

  // Customer info
  const customerLines = [
    `**Name:** ${user.name ?? "Unknown"}`,
    `**Email:** ${user.email}`,
    `**Account Age:** ${ageDays} day${ageDays !== 1 ? "s" : ""}`,
  ];
  if (riskBadges.length > 0) {
    customerLines.push(`**Risk:** ${riskBadges.join(" | ")}`);
  }
  embed.addFields({ name: "Customer", value: customerLines.join("\n"), inline: false });

  // Card details
  const cardLines: string[] = [];
  if (card) {
    cardLines.push(`**Name:** ${card.name}`);
    cardLines.push(`**Set:** ${card.setName}`);
    cardLines.push(`**Number:** ${card.cardNumber}`);
    if (card.rarity) cardLines.push(`**Rarity:** ${card.rarity}`);
  } else if (submission.description) {
    cardLines.push(`**Description:** ${submission.description}`);
  } else {
    cardLines.push("_No card linked_");
  }
  cardLines.push(`**Condition Estimate:** ${submission.estimatedCondition}`);
  embed.addFields({ name: "Card Details", value: cardLines.join("\n"), inline: false });

  // Market prices table
  const priceLines = [
    `\`NM\` ${formatPrice(submission.tcgPriceNM ?? card?.tcgPriceNM)}`,
    `\`LP\` ${formatPrice(submission.tcgPriceLP ?? card?.tcgPriceLP)}`,
    `\`MP\` ${formatPrice(submission.tcgPriceMP ?? card?.tcgPriceMP)}`,
    `\`HP\` ${formatPrice(submission.tcgPriceHP ?? card?.tcgPriceHP)}`,
  ];
  embed.addFields({ name: "Market Prices (TCGPlayer)", value: priceLines.join("\n"), inline: true });

  // SLA timestamps
  const slaLines = [
    `**Submitted:** <t:${Math.floor(submission.createdAt.getTime() / 1000)}:F>`,
    `**Age:** ${formatAge(submission.createdAt)}`,
  ];
  embed.addFields({ name: "SLA", value: slaLines.join("\n"), inline: true });

  if (submission.images.length > 0) {
    embed.setImage(submission.images[0]);
  }

  return embed;
}
