import crypto from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { UploadStorage } from "@/lib/storage/types";

export class SupabaseUploadStorage implements UploadStorage {
  private readonly client: SupabaseClient;
  private readonly bucket: string;
  private ensuredBucket = false;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for Supabase storage adapter");
    }

    this.client = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    this.bucket = process.env.SUPABASE_STORAGE_BUCKET || "trip-screenshots";
  }

  async save(file: File): Promise<string> {
    await this.ensureBucketExists();

    const extension = this.getExtension(file);
    const key = `${new Date().toISOString().slice(0, 10)}/${Date.now()}-${crypto.randomUUID()}${extension}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadError } = await this.client.storage
      .from(this.bucket)
      .upload(key, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Supabase upload failed: ${uploadError.message}`);
    }

    const { data } = this.client.storage.from(this.bucket).getPublicUrl(key);
    return data.publicUrl;
  }

  private async ensureBucketExists() {
    if (this.ensuredBucket) return;

    const { data: buckets, error: listError } = await this.client.storage.listBuckets();
    if (listError) throw new Error(`Failed to list Supabase buckets: ${listError.message}`);

    const exists = buckets?.some((bucket) => bucket.name === this.bucket);
    if (!exists) {
      const { error: createError } = await this.client.storage.createBucket(this.bucket, {
        public: true
      });
      if (createError) throw new Error(`Failed to create Supabase bucket '${this.bucket}': ${createError.message}`);
    }

    this.ensuredBucket = true;
  }

  private getExtension(file: File) {
    const nameExt = file.name.includes(".") ? `.${file.name.split(".").pop()}` : "";
    if (nameExt) return nameExt;

    if (file.type === "image/png") return ".png";
    if (file.type === "image/jpeg") return ".jpg";
    if (file.type === "image/webp") return ".webp";

    return "";
  }
}
