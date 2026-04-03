import type { GuildMember } from "discord.js";

/**
 * Returns true if the member has the given role ID.
 */
export function hasRole(member: GuildMember, roleId: string): boolean {
  return member.roles.cache.has(roleId);
}
