import { type NextRequest } from "next/server";
import { errorResponse } from "@/lib/errors";
import { getDeals } from "@/services/deal-score.service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.has("page")
      ? parseInt(searchParams.get("page")!, 10)
      : 1;
    const limit = searchParams.has("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 20;

    const result = await getDeals(page, limit);
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
