import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError } from "@/lib/errors";
import { cancelOffer } from "@/services/offer.service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();
    const { id } = await params;

    const offer = await cancelOffer(id, session.user.id);
    return Response.json(offer);
  } catch (error) {
    return errorResponse(error);
  }
}
