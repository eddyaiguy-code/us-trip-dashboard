import { put } from "@vercel/blob";
import crypto from "crypto";
import type { UploadStorage } from "@/lib/storage/types";

export class VercelBlobStorage implements UploadStorage {
  async save(file: File): Promise<string> {
    const key = `trip-screenshots/${Date.now()}-${crypto.randomUUID()}-${file.name}`;
    const uploaded = await put(key, file, {
      access: "public"
    });
    return uploaded.url;
  }
}
