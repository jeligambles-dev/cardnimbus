import { type NextRequest } from "next/server";
import { getProductBySlug } from "@/services/product.service";
import { errorResponse, NotFoundError } from "@/lib/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      throw new NotFoundError("Product");
    }

    return Response.json(product);
  } catch (error) {
    return errorResponse(error);
  }
}
