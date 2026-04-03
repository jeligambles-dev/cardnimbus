import { type NextRequest } from "next/server";
import { errorResponse, ValidationError } from "@/lib/errors";
import { trackClick } from "@/services/search-analytics.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analyticsId, entityId, entityType } = body as {
      analyticsId?: string;
      entityId?: string;
      entityType?: string;
    };

    if (!analyticsId || !entityId || !entityType) {
      throw new ValidationError(
        "analyticsId, entityId, and entityType are required"
      );
    }

    const record = await trackClick(analyticsId, entityId, entityType);

    return Response.json({ success: true, id: record.id });
  } catch (error) {
    return errorResponse(error);
  }
}
