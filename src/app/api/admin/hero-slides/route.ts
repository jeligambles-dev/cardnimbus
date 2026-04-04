import { auth } from "@/lib/auth";
import { getAllSlides, createSlide } from "@/services/hero-slide.service";
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
    const slides = await getAllSlides();
    return Response.json({ slides });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await request.json();

    if (!body.title || !body.imageUrl || !body.buttonLabel || !body.buttonLink) {
      throw new ValidationError("title, imageUrl, buttonLabel, and buttonLink are required");
    }

    const slide = await createSlide(body);

    await logAudit({
      actorType: "ADMIN",
      actorId: session.user.id,
      action: "hero_slide_create",
      targetType: "hero_slide",
      targetId: slide.id,
      details: body,
    });

    return Response.json(slide, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
