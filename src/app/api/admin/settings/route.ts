import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError, ValidationError } from "@/lib/errors";
import { getAllSettings, setSetting } from "@/services/settings.service";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  if ((session.user as { role?: string }).role !== "ADMIN")
    throw new UnauthorizedError("Forbidden");
  return session;
}

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getAllSettings();
    return Response.json({ settings });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();

    if (!body || typeof body !== "object") {
      throw new ValidationError("Invalid body");
    }

    const { key, value } = body;
    if (typeof key !== "string" || typeof value !== "string") {
      throw new ValidationError("key and value must be strings");
    }

    // Whitelist of editable keys
    const ALLOWED = [
      "payments.stripe.enabled",
      "payments.paypal.enabled",
      "payments.paypal.mode",
    ];
    if (!ALLOWED.includes(key)) {
      throw new ValidationError(`Setting "${key}" is not configurable`);
    }

    await setSetting(key, value);
    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
