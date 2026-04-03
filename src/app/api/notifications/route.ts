import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError } from "@/lib/errors";
import { getUserNotificationEvents } from "@/services/notification-v2.service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;

    const page = searchParams.has("page")
      ? parseInt(searchParams.get("page")!, 10)
      : 1;
    const limit = searchParams.has("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 20;

    const result = await getUserNotificationEvents(userId, page, limit);

    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
