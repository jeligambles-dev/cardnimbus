import { type NextRequest } from "next/server";
import { errorResponse } from "@/lib/errors";
import { getCollectionById } from "@/services/mystery.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collection = await getCollectionById(id);
    return Response.json(collection);
  } catch (error) {
    return errorResponse(error);
  }
}
