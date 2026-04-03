import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError } from "@/lib/errors";
import { getSellerProfile, updateSellerProfile } from "@/services/seller.service";

async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  return session.user as { id: string; role: string };
}

export async function GET() {
  try {
    const user = await requireSession();
    const profile = await getSellerProfile(user.id);
    return Response.json(profile);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireSession();
    const body = await request.json().catch(() => ({}));

    const data: { bio?: string; paypalEmail?: string } = {};
    if (typeof body.bio === "string") data.bio = body.bio;
    if (typeof body.paypalEmail === "string") data.paypalEmail = body.paypalEmail;

    const profile = await updateSellerProfile(user.id, data);
    return Response.json(profile);
  } catch (error) {
    return errorResponse(error);
  }
}
