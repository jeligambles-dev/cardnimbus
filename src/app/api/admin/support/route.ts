import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError } from "@/lib/errors";
import { getOpenQueue } from "@/services/support.service";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  if ((session.user as any).role !== "ADMIN") throw new UnauthorizedError("Forbidden");
  return session;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    const result = await getOpenQueue(page, limit);
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
