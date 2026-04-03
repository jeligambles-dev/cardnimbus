import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  ButtonInteraction,
  ModalSubmitInteraction,
  ChatInputCommandInteraction,
  Interaction,
} from "discord.js";
import { BOT_CONFIG } from "./config.js";
import { handleButtonInteraction } from "./handlers/button-interactions.js";
import { handleModalInteraction } from "./handlers/modal-interactions.js";
import { submissionsCommand, handleSubmissionsCommand } from "./commands/submissions.js";
import { statsCommand, handleStatsCommand } from "./commands/stats.js";
import { searchCommand, handleSearchCommand } from "./commands/search.js";
import { db } from "./db.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const commands = [
  submissionsCommand.toJSON(),
  statsCommand.toJSON(),
  searchCommand.toJSON(),
];

async function registerCommands(): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(BOT_CONFIG.token);
  console.log("Registering slash commands with guild...");
  await rest.put(
    Routes.applicationGuildCommands(client.user!.id, BOT_CONFIG.guildId),
    { body: commands }
  );
  console.log("Slash commands registered.");
}

client.once("ready", async () => {
  console.log(`Bot ready as ${client.user?.tag}`);
  try {
    await registerCommands();
  } catch (err) {
    console.error("Failed to register commands:", err);
  }
});

client.on("interactionCreate", async (interaction: Interaction) => {
  try {
    if (interaction.isButton()) {
      await handleButtonInteraction(interaction as ButtonInteraction);
    } else if (interaction.isModalSubmit()) {
      await handleModalInteraction(interaction as ModalSubmitInteraction);
    } else if (interaction.isChatInputCommand()) {
      const cmd = (interaction as ChatInputCommandInteraction).commandName;
      if (cmd === "submissions") {
        await handleSubmissionsCommand(interaction as ChatInputCommandInteraction);
      } else if (cmd === "stats") {
        await handleStatsCommand(interaction as ChatInputCommandInteraction);
      } else if (cmd === "search") {
        await handleSearchCommand(interaction as ChatInputCommandInteraction);
      }
    }
  } catch (err) {
    console.error("Error handling interaction:", err);
    // Attempt to reply with error if possible
    if ("reply" in interaction && typeof (interaction as ButtonInteraction).reply === "function") {
      const i = interaction as ButtonInteraction;
      if (!i.replied && !i.deferred) {
        await i
          .reply({ content: "An internal error occurred.", ephemeral: true })
          .catch(() => {});
      }
    }
  }
});

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}. Shutting down...`);
  client.destroy();
  await db.$disconnect();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

client.login(BOT_CONFIG.token).catch((err) => {
  console.error("Failed to login:", err);
  process.exit(1);
});
