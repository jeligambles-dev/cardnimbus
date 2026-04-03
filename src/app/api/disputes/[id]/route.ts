import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { getDisputeById } from "@/services/dispute.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();
    const userId = (session.user as any).id as string;
    const role = (session.user as any).role as string;

    const { id } = await params;
    const dispute = await getDisputeById(id);

    // Only the filer or an admin can view a dispute
    if (dispute.filedBy !== userId && role !== "ADMIN") {
      throw new ForbiddenError();
    }

    return Response.json(dispute);
  } catch (error) {
    return errorResponse(error);
  }
}
