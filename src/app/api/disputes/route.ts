import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError, ValidationError } from "@/lib/errors";
import { fileDispute, getUserDisputes } from "@/services/dispute.service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();
    const userId = (session.user as any).id as string;

    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.has("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.has("limit") ? parseInt(searchParams.get("limit")!, 10) : 20;

    const result = await getUserDisputes(userId, page, limit);
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();
    const userId = (session.user as any).id as string;

    const body = await request.json();
    const { orderId, reason, evidence } = body;

    if (!orderId) throw new ValidationError("orderId is required");
    if (!reason) throw new ValidationError("reason is required");

    const dispute = await fileDispute(
      orderId,
      userId,
      reason,
      Array.isArray(evidence) ? evidence : []
    );

    return Response.json(dispute, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
