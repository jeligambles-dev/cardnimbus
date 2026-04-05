import { auth } from "@/lib/auth";
import { getTileById, updateTile, deleteTile } from "@/services/category-tile.service";
import { logAudit } from "@/lib/audit";
import { deleteUploadedImage } from "@/lib/upload";
import { errorResponse, UnauthorizedError, NotFoundError } from "@/lib/errors";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    throw new UnauthorizedError();
  }
  return session;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const tile = await getTileById(id);
    if (!tile) throw new NotFoundError("Category tile");
    return Response.json(tile);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    // If imageUrl is being replaced, delete the old image
    if (body.imageUrl) {
      const existing = await getTileById(id);
      if (existing && existing.imageUrl !== body.imageUrl) {
        await deleteUploadedImage(existing.imageUrl);
      }
    }

    const tile = await updateTile(id, body);
    await logAudit({
      actorType: "ADMIN",
      actorId: session.user.id,
      action: "category_tile_update",
      targetType: "category_tile",
      targetId: id,
      details: body,
    });
    return Response.json(tile);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    // Delete associated image before deleting tile
    const existing = await getTileById(id);
    if (existing) {
      await deleteUploadedImage(existing.imageUrl);
    }

    await deleteTile(id);
    await logAudit({
      actorType: "ADMIN",
      actorId: session.user.id,
      action: "category_tile_delete",
      targetType: "category_tile",
      targetId: id,
    });
    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
