import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";
import { getRaffleById, getRaffleOdds } from "@/services/raffle.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;

    const [raffle, odds] = await Promise.all([
      getRaffleById(id),
      getRaffleOdds(id, userId),
    ]);

    return Response.json({ ...raffle, odds });
  } catch (error) {
    return errorResponse(error);
  }
}
