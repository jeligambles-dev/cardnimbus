import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError } from "@/lib/errors";
import { createSellerProfile } from "@/services/seller.service";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();
    const userId = (session.user as any).id as string;

    const body = await request.json().catch(() => ({}));
    const bio: string | undefined =
      typeof body.bio === "string" ? body.bio : undefined;

    const profile = await createSellerProfile(userId, bio);
    return Response.json(profile, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
