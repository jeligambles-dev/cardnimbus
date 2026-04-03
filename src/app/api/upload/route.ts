import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError, ValidationError } from "@/lib/errors";
import { processAndSaveImage, type UploadResult } from "@/lib/upload";

const MAX_FILES = 6;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const formData = await request.formData();
    const fileEntries = formData.getAll("files");

    if (fileEntries.length === 0) {
      throw new ValidationError("No files provided.");
    }

    if (fileEntries.length > MAX_FILES) {
      throw new ValidationError(`Maximum ${MAX_FILES} files allowed per upload.`);
    }

    const uploads: UploadResult[] = [];

    for (const entry of fileEntries) {
      if (!(entry instanceof File)) {
        throw new ValidationError("Each entry in 'files' must be a file.");
      }

      const arrayBuffer = await entry.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await processAndSaveImage(buffer, entry.name);
      uploads.push(result);
    }

    return Response.json({ uploads });
  } catch (error) {
    return errorResponse(error);
  }
}
