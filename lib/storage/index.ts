import type { UploadStorage } from "@/lib/storage/types";
import { LocalUploadStorage } from "@/lib/storage/local-storage";
import { VercelBlobStorage } from "@/lib/storage/vercel-blob-storage";
import { SupabaseUploadStorage } from "@/lib/storage/supabase-storage";

let storage: UploadStorage | null = null;

export function getUploadStorage(): UploadStorage {
  if (storage) return storage;

  const adapter = process.env.STORAGE_ADAPTER ?? "local";

  switch (adapter) {
    case "vercel-blob":
      storage = new VercelBlobStorage();
      return storage;
    case "supabase":
      storage = new SupabaseUploadStorage();
      return storage;
    case "local":
    default:
      storage = new LocalUploadStorage();
      return storage;
  }
}
