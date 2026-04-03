import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
} from "discord.js";
import type { Client } from "discord.js";
import { db } from "../db.js";
import { buildSubmissionEmbed } from "../utils/embeds.js";
import { BOT_CONFIG } from "../config.js";

/**
 * Posts a submission embed to the submissions channel, creates a thread,
 * and persists the discordMessageId / discordThreadId to the DB.
 */
export async function postSubmissionEmbed(client: Client, submissionId: string): Promise<void> {
  const submission = await db.cardSubmission.findUnique({
    where: { id: submissionId },
    include: { user: true, card: true },
  });

  if (!submission) throw new Error(`Submission ${submissionId} not found`);

  const channel = await client.channels.fetch(BOT_CONFIG.channels.submissions);
  if (!channel || !(channel instanceof TextChannel)) {
    throw new Error(`Submissions channel ${BOT_CONFIG.channels.submissions} is not a text channel`);
  }

  const embed = buildSubmissionEmbed(submission);

  // Action buttons
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`claim:${submissionId}`)
      .setLabel("Claim")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`approve_nm:${submissionId}`)
      .setLabel("Approve NM")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`approve_lp:${submissionId}`)
      .setLabel("Approve LP")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`approve_mp:${submissionId}`)
      .setLabel("Approve MP")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`approve_hp:${submissionId}`)
      .setLabel("Approve HP")
      .setStyle(ButtonStyle.Danger),
  );

  const escalateRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`escalate:${submissionId}`)
      .setLabel("Escalate")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`custom_offer:${submissionId}`)
      .setLabel("Custom Offer")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`reject:${submissionId}`)
      .setLabel("Reject")
      .setStyle(ButtonStyle.Danger),
  );

  const message = await channel.send({
    embeds: [embed],
    components: [row, escalateRow],
  });

  const thread = await message.startThread({
    name: `Submission #${submissionId.slice(-8).toUpperCase()}`,
    autoArchiveDuration: 10080, // 7 days
  });

  await db.cardSubmission.update({
    where: { id: submissionId },
    data: {
      discordMessageId: message.id,
      discordThreadId: thread.id,
    },
  });
}
