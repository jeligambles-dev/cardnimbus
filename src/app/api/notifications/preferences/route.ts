import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  errorResponse,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import { getPreferences, setPreference } from "@/services/notification-v2.service";
import { DeliveryChannel } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const preferences = await getPreferences(session.user.id);

    return Response.json({ preferences });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const userId = session.user.id;
    const body = await request.json();
    const { eventType, channel, enabled } = body as {
      eventType?: string;
      channel?: string;
      enabled?: boolean;
    };

    if (!eventType || !channel) {
      throw new ValidationError("eventType and channel are required");
    }

    if (typeof enabled !== "boolean") {
      throw new ValidationError("enabled must be a boolean");
    }

    if (!(channel in DeliveryChannel)) {
      throw new ValidationError(`Invalid channel: ${channel}`);
    }

    const preference = await setPreference(
      userId,
      eventType,
      channel as DeliveryChannel,
      enabled
    );

    return Response.json({ preference });
  } catch (error) {
    return errorResponse(error);
  }
}
