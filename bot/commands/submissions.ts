import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { db } from "../db.js";
import { SubmissionStatus } from "@prisma/client";

export const submissionsCommand = new SlashCommandBuilder()
  .setName("submissions")
  .setDescription("Manage card submissions")
  .addSubcommand((sub) =>
    sub.setName("pending").setDescription("List unclaimed submissions")
  )
  .addSubcommand((sub) =>
    sub.setName("mine").setDescription("List submissions assigned to you")
  );

export async function handleSubmissionsCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const sub = interaction.options.getSubcommand();

  if (sub === "pending") {
    const submissions = await db.cardSubmission.findMany({
      where: { status: SubmissionStatus.SUBMITTED, assignedAdminId: null },
      include: { card: true, user: true },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    if (submissions.length === 0) {
      await interaction.reply({ content: "No pending unclaimed submissions.", ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0xf97316)
      .setTitle("Pending Unclaimed Submissions")
      .setDescription(
        submissions
          .map((s, i) => {
            const label = s.card?.name ?? s.description ?? "Unknown card";
            const age = Math.floor((Date.now() - s.createdAt.getTime()) / 60_000);
            return `**${i + 1}.** \`${s.id.slice(-8).toUpperCase()}\` — ${label} — ${s.estimatedCondition} — ${age}m ago`;
          })
          .join("\n")
      )
      .setFooter({ text: `${submissions.length} submission(s)` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  } else if (sub === "mine") {
    const submissions = await db.cardSubmission.findMany({
      where: {
        assignedAdminId: interaction.user.id,
        status: {
          in: [SubmissionStatus.UNDER_REVIEW, SubmissionStatus.OFFER_SENT],
        },
      },
      include: { card: true, user: true },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    if (submissions.length === 0) {
      await interaction.reply({ content: "You have no active submissions assigned.", ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0xf97316)
      .setTitle("My Assigned Submissions")
      .setDescription(
        submissions
          .map((s, i) => {
            const label = s.card?.name ?? s.description ?? "Unknown card";
            return `**${i + 1}.** \`${s.id.slice(-8).toUpperCase()}\` — ${label} — ${s.estimatedCondition} — **${s.status}**`;
          })
          .join("\n")
      )
      .setFooter({ text: `${submissions.length} submission(s)` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
