import {
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { db } from "../db.js";
import { buildSubmissionEmbed } from "../utils/embeds.js";
import { hasRole } from "../utils/permissions.js";
import { BOT_CONFIG } from "../config.js";
import {
  claimSubmission,
  sendOffer,
  updateSubmissionStatus,
} from "../../src/services/submission.service.js";
import { CardCondition, SubmissionStatus } from "@prisma/client";

const CONDITION_MAP: Record<string, CardCondition> = {
  nm: CardCondition.NM,
  lp: CardCondition.LP,
  mp: CardCondition.MP,
  hp: CardCondition.HP,
};

function isModerator(interaction: ButtonInteraction): boolean {
  const member = interaction.member;
  if (!member || !("roles" in member)) return false;
  return (
    hasRole(member as import("discord.js").GuildMember, BOT_CONFIG.roles.moderator) ||
    hasRole(member as import("discord.js").GuildMember, BOT_CONFIG.roles.trustedOps)
  );
}

async function refreshEmbed(interaction: ButtonInteraction, submissionId: string): Promise<void> {
  const submission = await db.cardSubmission.findUnique({
    where: { id: submissionId },
    include: { user: true, card: true },
  });
  if (!submission) return;

  const embed = buildSubmissionEmbed(submission);
  await interaction.message.edit({ embeds: [embed] });
}

export async function handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
  const [action, submissionId] = interaction.customId.split(":");
  if (!submissionId) return;

  // Fetch current submission for idempotency check
  const submission = await db.cardSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    await interaction.reply({ content: "Submission not found.", ephemeral: true });
    return;
  }

  switch (action) {
    case "claim": {
      if (!isModerator(interaction)) {
        await interaction.reply({ content: "You do not have permission to claim submissions.", ephemeral: true });
        return;
      }

      // Idempotency: already claimed
      if (submission.status !== SubmissionStatus.SUBMITTED) {
        await interaction.reply({
          content: `Submission is already in status **${submission.status}** — cannot claim.`,
          ephemeral: true,
        });
        return;
      }

      try {
        // Use Discord user ID as stand-in admin identifier
        await claimSubmission(submissionId, interaction.user.id);
        await refreshEmbed(interaction, submissionId);
        await interaction.reply({ content: `You claimed submission #${submissionId.slice(-8).toUpperCase()}.`, ephemeral: true });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await interaction.reply({ content: `Error: ${msg}`, ephemeral: true });
      }
      break;
    }

    case "approve_nm":
    case "approve_lp":
    case "approve_mp":
    case "approve_hp": {
      if (!isModerator(interaction)) {
        await interaction.reply({ content: "You do not have permission to approve submissions.", ephemeral: true });
        return;
      }

      const conditionKey = action.replace("approve_", "");
      const condition = CONDITION_MAP[conditionKey];

      // Determine the price to offer based on condition and margin
      const priceKey = `tcgPrice${conditionKey.toUpperCase()}` as "tcgPriceNM" | "tcgPriceLP" | "tcgPriceMP" | "tcgPriceHP";
      const marketPrice = submission[priceKey];

      if (!marketPrice) {
        await interaction.reply({
          content: `No ${conditionKey.toUpperCase()} market price available. Use Custom Offer instead.`,
          ephemeral: true,
        });
        return;
      }

      const offeredPrice = parseFloat(
        ((marketPrice * BOT_CONFIG.offerMarginPercent) / 100).toFixed(2)
      );

      // Idempotency: already past UNDER_REVIEW
      if (
        submission.status !== SubmissionStatus.SUBMITTED &&
        submission.status !== SubmissionStatus.UNDER_REVIEW
      ) {
        await interaction.reply({
          content: `Submission is already in status **${submission.status}**.`,
          ephemeral: true,
        });
        return;
      }

      try {
        // Claim first if not yet claimed
        if (submission.status === SubmissionStatus.SUBMITTED) {
          await claimSubmission(submissionId, interaction.user.id);
        }
        await sendOffer(submissionId, interaction.user.id, offeredPrice, condition);
        await refreshEmbed(interaction, submissionId);
        await interaction.reply({
          content: `Offer sent: **$${offeredPrice}** for ${conditionKey.toUpperCase()} condition.`,
          ephemeral: true,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await interaction.reply({ content: `Error: ${msg}`, ephemeral: true });
      }
      break;
    }

    case "escalate": {
      if (!isModerator(interaction)) {
        await interaction.reply({ content: "You do not have permission to escalate submissions.", ephemeral: true });
        return;
      }

      try {
        await db.cardSubmission.update({
          where: { id: submissionId },
          data: { adminNotes: `[ESCALATED by <@${interaction.user.id}>]` },
        });
        await refreshEmbed(interaction, submissionId);
        await interaction.reply({
          content: `Submission #${submissionId.slice(-8).toUpperCase()} has been escalated.`,
          ephemeral: false,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await interaction.reply({ content: `Error: ${msg}`, ephemeral: true });
      }
      break;
    }

    case "custom_offer": {
      if (!isModerator(interaction)) {
        await interaction.reply({ content: "You do not have permission to send offers.", ephemeral: true });
        return;
      }

      // Open custom offer modal
      const modal = new ModalBuilder()
        .setCustomId(`modal_custom_offer:${submissionId}`)
        .setTitle("Custom Offer");

      const priceInput = new TextInputBuilder()
        .setCustomId("offer_price")
        .setLabel("Offer Price (USD)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("e.g. 25.00")
        .setRequired(true);

      const notesInput = new TextInputBuilder()
        .setCustomId("offer_notes")
        .setLabel("Notes (optional)")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

      modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(priceInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(notesInput),
      );

      await interaction.showModal(modal);
      break;
    }

    case "reject": {
      if (!isModerator(interaction)) {
        await interaction.reply({ content: "You do not have permission to reject submissions.", ephemeral: true });
        return;
      }

      // Open reject modal
      const modal = new ModalBuilder()
        .setCustomId(`modal_reject:${submissionId}`)
        .setTitle("Reject Submission");

      const reasonInput = new TextInputBuilder()
        .setCustomId("reject_reason")
        .setLabel("Rejection Reason")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Provide a reason for rejection...")
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput),
      );

      await interaction.showModal(modal);
      break;
    }

    default:
      // Unknown action — ignore
      break;
  }
}
