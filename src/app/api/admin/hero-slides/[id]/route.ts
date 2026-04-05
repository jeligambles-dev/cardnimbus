import { auth } from "@/lib/auth";
import { getSlideById, updateSlide, deleteSlide } from "@/services/hero-slide.service";
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
    const slide = await getSlideById(id);
    if (!slide) throw new NotFoundError("Hero slide");
    return Response.json(slide);
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
      const existing = await getSlideById(id);
      if (existing && existing.imageUrl !== body.imageUrl) {
        await deleteUploadedImage(existing.imageUrl);
      }
    }

    const slide = await updateSlide(id, body);

    await logAudit({
      actorType: "ADMIN",
      actorId: session.user.id,
      action: "hero_slide_update",
      targetType: "hero_slide",
      targetId: id,
      details: body,
    });

    return Response.json(slide);
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

    // Delete associated image before deleting slide
    const existing = await getSlideById(id);
    if (existing) {
      await deleteUploadedImage(existing.imageUrl);
    }

    await deleteSlide(id);

    await logAudit({
      actorType: "ADMIN",
      actorId: session.user.id,
      action: "hero_slide_delete",
      targetType: "hero_slide",
      targetId: id,
    });

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
