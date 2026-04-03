import { errorResponse } from "@/lib/errors";
import { getActiveRaffles } from "@/services/raffle.service";

export async function GET() {
  try {
    const raffles = await getActiveRaffles();
    return Response.json(raffles);
  } catch (error) {
    return errorResponse(error);
  }
}
