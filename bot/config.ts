function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const BOT_CONFIG = {
  token: required("DISCORD_BOT_TOKEN"),
  guildId: required("DISCORD_GUILD_ID"),
  channels: {
    submissions: required("DISCORD_CHANNEL_SUBMISSIONS"),
    approvals: required("DISCORD_CHANNEL_APPROVALS"),
    alerts: required("DISCORD_CHANNEL_ALERTS"),
  },
  roles: {
    moderator: required("DISCORD_ROLE_MODERATOR"),
    trustedOps: required("DISCORD_ROLE_TRUSTED_OPS"),
  },
  offerMarginPercent: parseInt(optional("DISCORD_OFFER_MARGIN_PERCENT", "70"), 10),
} as const;
