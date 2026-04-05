import { readFile, stat } from "fs/promises";
import path from "path";

const UPLOADS_ROOT = process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads");

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;

    // Security: only allow 'full' or 'thumbs' subdirectories, filename only
    if (
      pathSegments.length !== 2 ||
      !["full", "thumbs"].includes(pathSegments[0]) ||
      pathSegments[1].includes("..") ||
      pathSegments[1].includes("/")
    ) {
      return new Response("Not found", { status: 404 });
    }

    const filePath = path.join(UPLOADS_ROOT, pathSegments[0], pathSegments[1]);
    const ext = path.extname(pathSegments[1]).toLowerCase();
    const mime = MIME_TYPES[ext];

    if (!mime) {
      return new Response("Unsupported file type", { status: 400 });
    }

    const fileStat = await stat(filePath).catch(() => null);
    if (!fileStat || !fileStat.isFile()) {
      return new Response("Not found", { status: 404 });
    }

    const data = await readFile(filePath);

    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": mime,
        "Content-Length": fileStat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Error serving file", { status: 500 });
  }
}
