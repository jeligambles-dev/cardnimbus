import { Prisma } from "@prisma/client";
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
  const { details, ...rest } = entry;
  await db.auditLog.create({
    data: {
      ...rest,
      details: details !== undefined ? (details as Prisma.InputJsonValue) : Prisma.DbNull,
    },
  });
}
