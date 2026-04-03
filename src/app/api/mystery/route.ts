import { errorResponse } from "@/lib/errors";
import { getActiveCollections } from "@/services/mystery.service";

export async function GET() {
  try {
    const collections = await getActiveCollections();
    return Response.json(collections);
  } catch (error) {
    return errorResponse(error);
  }
}
