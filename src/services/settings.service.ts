import { db } from "@/lib/db";

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.siteSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const rows = await db.siteSetting.findMany({ where: { key: { in: keys } } });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db.siteSetting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

// Payment helpers
export async function isPaymentMethodEnabled(method: "stripe" | "paypal"): Promise<boolean> {
  const val = await getSetting(`payments.${method}.enabled`);
  return val === "true";
}
