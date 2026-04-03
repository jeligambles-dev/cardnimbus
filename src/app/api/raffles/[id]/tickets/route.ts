import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  errorResponse,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import {
  reserveTickets,
  confirmReservation,
} from "@/services/raffle.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();
    const userId = (session.user as { id: string }).id;

    const { id: raffleId } = await params;
    const body = await request.json().catch(() => ({}));

    const quantity = typeof body.quantity === "number" ? body.quantity : 1;
    if (quantity < 1) throw new ValidationError("quantity must be at least 1");

    // paymentId is optional — if provided we confirm immediately (pre-paid flow)
    const paymentId: string | undefined =
      typeof body.paymentId === "string" ? body.paymentId : undefined;

    const reservation = await reserveTickets(raffleId, userId, quantity);

    if (paymentId) {
      const purchase = await confirmReservation(reservation.id, paymentId);
      return Response.json(
        { reservation, purchase, confirmed: true },
        { status: 201 }
      );
    }

    return Response.json({ reservation, confirmed: false }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
