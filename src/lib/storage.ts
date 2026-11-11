import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".svg", ".webp", ".gif"]);

/**
 * Single storage module for saving uploaded images under public/uploads/.
 * Can be swapped to Vercel Blob in production cloud deployments.
 */
export async function saveUploadedFile(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("Empty file");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File size exceeds 10MB limit");
  }

  const ext = path.extname(file.name || ".png").toLowerCase() || ".png";
  const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ".png";
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${safeExt}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const fullPath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(fullPath, buffer);

  return `/uploads/${filename}`;
}
