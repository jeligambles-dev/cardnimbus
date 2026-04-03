import sharp from "sharp";
import { randomBytes } from "crypto";
import { writeFile } from "fs/promises";
import path from "path";
import { ValidationError } from "@/lib/errors";

export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AllowedMimeType = (typeof ALLOWED_TYPES)[number];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface UploadResult {
  filename: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  size: number;
}

// Magic byte signatures for supported image types
const MAGIC_BYTES: Array<{ mime: AllowedMimeType; check: (buf: Buffer) => boolean }> = [
  {
    mime: "image/jpeg",
    check: (buf) => buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
  {
    mime: "image/png",
    check: (buf) =>
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a,
  },
  {
    mime: "image/webp",
    // RIFF....WEBP
    check: (buf) =>
      buf[0] === 0x52 &&
      buf[1] === 0x49 &&
      buf[2] === 0x46 &&
      buf[3] === 0x46 &&
      buf[8] === 0x57 &&
      buf[9] === 0x45 &&
      buf[10] === 0x42 &&
      buf[11] === 0x50,
  },
];

function detectMimeType(buffer: Buffer): AllowedMimeType | null {
  for (const { mime, check } of MAGIC_BYTES) {
    if (buffer.length >= 12 && check(buffer)) {
      return mime;
    }
  }
  return null;
}

function generateFilename(ext: string): string {
  return `${randomBytes(16).toString("hex")}${ext}`;
}

function mimeToExt(mime: AllowedMimeType): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
  }
}

export async function processAndSaveImage(
  buffer: Buffer,
  _originalName: string
): Promise<UploadResult> {
  if (buffer.length > MAX_FILE_SIZE) {
    throw new ValidationError(
      `File exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }

  const mime = detectMimeType(buffer);
  if (!mime) {
    throw new ValidationError(
      "Invalid file type. Only JPEG, PNG, and WebP images are allowed."
    );
  }

  const ext = mimeToExt(mime);
  const filename = generateFilename(ext);

  const uploadsBase = path.join(process.cwd(), "public", "uploads");
  const fullDir = path.join(uploadsBase, "full");
  const thumbDir = path.join(uploadsBase, "thumbs");

  // Process full-size image: strip EXIF, resize to max 1600x1600 (fit inside, no enlargement), quality 85
  const fullImage = sharp(buffer).rotate(); // auto-rotate from EXIF before stripping
  const fullBuffer = await fullImage
    .withExifMerge({}) // strip EXIF metadata
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  // Get dimensions of processed image
  const { width, height } = await sharp(fullBuffer).metadata();

  // Process thumbnail: 400x400 cover crop, quality 75
  const thumbBuffer = await sharp(buffer)
    .rotate()
    .withExifMerge({})
    .resize({
      width: 400,
      height: 400,
      fit: "cover",
    })
    .jpeg({ quality: 75, mozjpeg: true })
    .toBuffer();

  // Use .jpg extension for saved files since we always output JPEG
  const savedFilename = filename.replace(ext, ".jpg");

  const fullPath = path.join(fullDir, savedFilename);
  const thumbPath = path.join(thumbDir, savedFilename);

  await Promise.all([
    writeFile(fullPath, fullBuffer),
    writeFile(thumbPath, thumbBuffer),
  ]);

  return {
    filename: savedFilename,
    url: `/uploads/full/${savedFilename}`,
    thumbnailUrl: `/uploads/thumbs/${savedFilename}`,
    width: width ?? 0,
    height: height ?? 0,
    size: fullBuffer.length,
  };
}

export async function processMultipleImages(
  files: Array<{ buffer: Buffer; originalName: string }>
): Promise<UploadResult[]> {
  return Promise.all(
    files.map(({ buffer, originalName }) =>
      processAndSaveImage(buffer, originalName)
    )
  );
}
