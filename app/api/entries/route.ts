import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth/session";
import { getEntryRepository } from "@/lib/data";
import { entrySchema } from "@/lib/validators";

export async function GET(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const family = searchParams.get("family") ?? undefined;
  const type = searchParams.get("type") ?? undefined;

  const entries = await getEntryRepository().list({ family, type });
  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = entrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }

  const created = await getEntryRepository().create(parsed.data);
  return NextResponse.json({ entry: created }, { status: 201 });
}

export async function DELETE(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await getEntryRepository().remove(id);
  return NextResponse.json({ ok: true });
}
