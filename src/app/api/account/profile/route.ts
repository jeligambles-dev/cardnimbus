import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { errorResponse, UnauthorizedError, ValidationError } from "@/lib/errors";
import { countryByCode } from "@/lib/countries";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, avatar: true, country: true },
    });

    return Response.json(user ?? {});
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const body = await request.json();
    const data: { country?: string | null; name?: string } = {};

    if ("country" in body) {
      const country = body.country;
      if (country !== null && country !== "" && !countryByCode(String(country))) {
        throw new ValidationError("Invalid country code");
      }
      data.country = country || null;
    }

    if ("name" in body && typeof body.name === "string") {
      const trimmed = body.name.trim();
      if (trimmed.length > 100) throw new ValidationError("Name too long");
      data.name = trimmed;
    }

    const updated = await db.user.update({
      where: { id: session.user.id },
      data,
      select: { name: true, email: true, avatar: true, country: true },
    });

    return Response.json(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
