import { type NextRequest } from "next/server";
import { errorResponse } from "@/lib/errors";
import { getRaffleHistory } from "@/services/raffle.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10))
    );

    const result = await getRaffleHistory(page, limit);
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
