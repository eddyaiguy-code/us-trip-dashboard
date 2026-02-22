import { NextResponse } from "next/server";
import { validatePasscode } from "@/lib/auth/validators";
import { createSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const passcode = body.passcode;

  if (typeof passcode !== "string" || !validatePasscode(passcode)) {
    return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
