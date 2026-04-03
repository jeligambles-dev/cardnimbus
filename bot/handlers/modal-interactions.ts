import { ModalSubmitInteraction } from "discord.js";
import { db } from "../db.js";
import { buildSubmissionEmbed } from "../utils/embeds.js";
import { hasRole } from "../utils/permissions.js";
import { BOT_CONFIG } from "../config.js";
import { sendOffer, rejectSubmission } from "../../src/services/submission.service.js";
import { CardCondition, SubmissionStatus } from "@prisma/client";

function isModerator(interaction: ModalSubmitInteraction): boolean {
  const member = interaction.member;
  if (!member || !("roles" in member)) return false;
  return (
    hasRole(member as import("discord.js").GuildMember, BOT_CONFIG.roles.moderator) ||
    hasRole(member as import("discord.js").GuildMember, BOT_CONFIG.roles.trustedOps)
  );
}

async function refreshEmbed(interaction: ModalSubmitInteraction, submissionId: string): Promise<void> {
  if (!interaction.message) return;
  const submission = await db.cardSubmission.findUnique({
    where: { id: submissionId },
    include: { user: true, card: true },
  });
  if (!submission) return;
  const embed = buildSubmissionEmbed(submission);
  await interaction.message.edit({ embeds: [embed] });
}

export async function handleModalInteraction(interaction: ModalSubmitInteraction): Promise<void> {
  const [modalType, submissionId] = interaction.customId.split(":");
  if (!submissionId) return;

  switch (modalType) {
    case "modal_custom_offer": {
      if (!isModerator(interaction)) {
        await interaction.reply({ content: "You do not have permission to send offers.", ephemeral: true });
        return;
      }

      const rawPrice = interaction.fields.getTextInputValue("offer_price").trim();
      const notes = interaction.fields.getTextInputValue("offer_notes").trim() || undefined;

      const price = parseFloat(rawPrice);
      if (isNaN(price) || price <= 0) {
        await interaction.reply({ content: "Invalid price. Please enter a positive number (e.g. 25.00).", ephemeral: true });
        return;
      }

      const submission = await db.cardSubmission.findUnique({ where: { id: submissionId } });
      if (!submission) {
        await interaction.reply({ content: "Submission not found.", ephemeral: true });
        return;
      }

      // Idempotency: check status
      if (
        submission.status !== SubmissionStatus.SUBMITTED &&
        submission.status !== SubmissionStatus.UNDER_REVIEW
      ) {
        await interaction.reply({
          content: `Submission is already in status **${submission.status}** — cannot send offer.`,
          ephemeral: true,
        });
        return;
      }

      try {
        // Auto-claim if still SUBMITTED
        if (submission.status === SubmissionStatus.SUBMITTED) {
          await db.cardSubmission.update({
            where: { id: submissionId },
            data: {
              assignedAdminId: interaction.user.id,
              status: SubmissionStatus.UNDER_REVIEW,
            },
          });
        }

        await sendOffer(
          submissionId,
          interaction.user.id,
          price,
          submission.estimatedCondition as CardCondition,
          notes,
        );

        await refreshEmbed(interaction, submissionId);
        await interaction.reply({
          content: `Custom offer of **$${price.toFixed(2)}** sent.${notes ? ` Notes: ${notes}` : ""}`,
          ephemeral: true,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await interaction.reply({ content: `Error: ${msg}`, ephemeral: true });
      }
      break;
    }

    case "modal_reject": {
      if (!isModerator(interaction)) {
        await interaction.reply({ content: "You do not have permission to reject submissions.", ephemeral: true });
        return;
      }

      const reason = interaction.fields.getTextInputValue("reject_reason").trim();
      if (!reason) {
        await interaction.reply({ content: "Rejection reason is required.", ephemeral: true });
        return;
      }

      const submission = await db.cardSubmission.findUnique({ where: { id: submissionId } });
      if (!submission) {
        await interaction.reply({ content: "Submission not found.", ephemeral: true });
        return;
      }

      // Idempotency
      if (submission.status === SubmissionStatus.REJECTED) {
        await interaction.reply({ content: "Submission is already rejected.", ephemeral: true });
        return;
      }

      try {
        await rejectSubmission(submissionId, interaction.user.id, reason);
        await refreshEmbed(interaction, submissionId);
        await interaction.reply({
          content: `Submission #${submissionId.slice(-8).toUpperCase()} rejected.`,
          ephemeral: false,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await interaction.reply({ content: `Error: ${msg}`, ephemeral: true });
      }
      break;
    }

    default:
      break;
  }
}
