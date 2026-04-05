import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { processAndSaveImage, deleteUploadedImage } from "@/lib/upload";
import { errorResponse, UnauthorizedError, ValidationError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new ValidationError("Please upload a valid image file");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await processAndSaveImage(buffer, file.name);

    // Delete old avatar if it was an uploaded file (not external URL)
    const existingUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    });
    if (existingUser?.avatar) {
      await deleteUploadedImage(existingUser.avatar);
    }

    // Use the thumbnail as the avatar
    await db.user.update({
      where: { id: session.user.id },
      data: { avatar: result.thumbnailUrl },
    });

    return Response.json({ avatarUrl: result.thumbnailUrl });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const existingUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    });

    if (existingUser?.avatar) {
      await deleteUploadedImage(existingUser.avatar);
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { avatar: null },
    });

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
