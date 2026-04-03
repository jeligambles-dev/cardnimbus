import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { db } from "../db.js";

export const searchCommand = new SlashCommandBuilder()
  .setName("search")
  .setDescription("Search for a card and view market prices")
  .addStringOption((opt) =>
    opt
      .setName("card_name")
      .setDescription("Card name to search for")
      .setRequired(true)
  );

export async function handleSearchCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const query = interaction.options.getString("card_name", true).trim();

  if (!query) {
    await interaction.reply({ content: "Please provide a card name.", ephemeral: true });
    return;
  }

  const cards = await db.card.findMany({
    where: {
      normalizedName: {
        contains: query.toLowerCase(),
      },
    },
    orderBy: { name: "asc" },
    take: 5,
  });

  if (cards.length === 0) {
    await interaction.reply({
      content: `No cards found matching **${query}**.`,
      ephemeral: true,
    });
    return;
  }

  const formatPrice = (p: number | null) => (p != null ? `$${p.toFixed(2)}` : "N/A");

  const embed = new EmbedBuilder()
    .setColor(0xf97316)
    .setTitle(`Card Search: "${query}"`)
    .setDescription(`Found ${cards.length} result(s)`)
    .setTimestamp();

  for (const card of cards) {
    embed.addFields({
      name: `${card.name} — ${card.setName} #${card.cardNumber}`,
      value: [
        `\`NM\` ${formatPrice(card.tcgPriceNM)}  \`LP\` ${formatPrice(card.tcgPriceLP)}  \`MP\` ${formatPrice(card.tcgPriceMP)}  \`HP\` ${formatPrice(card.tcgPriceHP)}`,
        card.tcgPriceMarket ? `Market: ${formatPrice(card.tcgPriceMarket)}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      inline: false,
    });
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
