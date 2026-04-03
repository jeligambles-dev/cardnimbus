import { type NextRequest } from "next/server";
import { errorResponse } from "@/lib/errors";
import { getRaffleParticipants } from "@/services/raffle.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const participants = await getRaffleParticipants(id);
    return Response.json(participants);
  } catch (error) {
    return errorResponse(error);
  }
}
