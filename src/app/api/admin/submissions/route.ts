import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError } from "@/lib/errors";
import { getAdminSubmissions } from "@/services/submission.service";
import { SubmissionStatus } from "@prisma/client";

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
    const statusParam = searchParams.get("status");

    const status =
      statusParam && statusParam in SubmissionStatus
        ? (statusParam as SubmissionStatus)
        : undefined;

    const result = await getAdminSubmissions({ status }, page);
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
