import path from "path";
import { promises as fs } from "fs";
import crypto from "crypto";
import type { UploadStorage } from "@/lib/storage/types";

export class LocalUploadStorage implements UploadStorage {
  async save(file: File): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(file.name) || ".bin";
    const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    const relPath = `/uploads/${filename}`;
    const dest = path.join(process.cwd(), "public", relPath);

    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, buffer);

    return relPath;
  }
}
