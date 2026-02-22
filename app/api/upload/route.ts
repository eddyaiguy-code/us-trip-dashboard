import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth/session";
import { getUploadStorage } from "@/lib/storage";

const MAX_BYTES = 6 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large (max 6MB)" }, { status: 400 });
  }

  try {
    const url = await getUploadStorage().save(file);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
