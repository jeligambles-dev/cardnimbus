import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { getSubmissionById } from "@/services/submission.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { id } = await params;
    const submission = await getSubmissionById(id);

    const isAdmin = (session.user as any).role === "ADMIN";
    if (submission.userId !== session.user.id && !isAdmin) {
      throw new ForbiddenError("You do not have access to this submission");
    }

    return Response.json(submission);
  } catch (error) {
    return errorResponse(error);
  }
}
