import { auth } from "@/lib/auth";
import { getAllTiles, createTile } from "@/services/category-tile.service";
import { logAudit } from "@/lib/audit";
import { errorResponse, UnauthorizedError, ValidationError } from "@/lib/errors";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    throw new UnauthorizedError();
  }
  return session;
}

export async function GET() {
  try {
    await requireAdmin();
    const tiles = await getAllTiles();
    return Response.json({ tiles });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    if (!body.label || !body.imageUrl || !body.href) {
      throw new ValidationError("label, imageUrl, and href are required");
    }
    const tile = await createTile(body);
    await logAudit({
      actorType: "ADMIN",
      actorId: session.user.id,
      action: "category_tile_create",
      targetType: "category_tile",
      targetId: tile.id,
      details: body,
    });
    return Response.json(tile, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
