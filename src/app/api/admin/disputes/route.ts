import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError } from "@/lib/errors";
import { getAdminDisputes } from "@/services/dispute.service";
import { DisputeStatus } from "@prisma/client";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  if ((session.user as any).role !== "ADMIN") throw new UnauthorizedError("Forbidden");
  return session;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.has("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.has("limit") ? parseInt(searchParams.get("limit")!, 10) : 20;

    const statusParam = searchParams.get("status");
    const status =
      statusParam && statusParam in DisputeStatus
        ? (statusParam as DisputeStatus)
        : undefined;

    const result = await getAdminDisputes({ status }, page, limit);
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
