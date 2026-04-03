import { db } from "./db";
import { ActorType } from "@prisma/client";

interface AuditEntry {
  actorType: ActorType;
  actorId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ip?: string;
}

export async function logAudit(entry: AuditEntry) {
  await db.auditLog.create({ data: entry });
}
