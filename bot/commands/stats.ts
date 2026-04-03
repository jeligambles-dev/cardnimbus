import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { db } from "../db.js";
import { SubmissionStatus } from "@prisma/client";

export const statsCommand = new SlashCommandBuilder()
  .setName("stats")
  .setDescription("View submission statistics")
  .addSubcommand((sub) =>
    sub.setName("today").setDescription("Stats for today")
  );

export async function handleStatsCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const sub = interaction.options.getSubcommand();

  if (sub === "today") {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [received, processed, offersSent, offersAccepted] = await Promise.all([
      db.cardSubmission.count({
        where: { createdAt: { gte: startOfDay } },
      }),
      db.cardSubmission.count({
        where: {
          updatedAt: { gte: startOfDay },
          status: {
            in: [
              SubmissionStatus.OFFER_SENT,
              SubmissionStatus.ACCEPTED,
              SubmissionStatus.REJECTED,
              SubmissionStatus.COMPLETED,
            ],
          },
        },
      }),
      db.cardSubmission.count({
        where: {
          updatedAt: { gte: startOfDay },
          status: {
            in: [SubmissionStatus.OFFER_SENT, SubmissionStatus.ACCEPTED],
          },
        },
      }),
      db.cardSubmission.count({
        where: {
          updatedAt: { gte: startOfDay },
          status: SubmissionStatus.ACCEPTED,
        },
      }),
    ]);

    const embed = new EmbedBuilder()
      .setColor(0xf97316)
      .setTitle("Today's Submission Stats")
      .addFields(
        { name: "Received", value: String(received), inline: true },
        { name: "Processed", value: String(processed), inline: true },
        { name: "Offers Sent", value: String(offersSent), inline: true },
        { name: "Offers Accepted", value: String(offersAccepted), inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
