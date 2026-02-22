import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "trip_dash_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function requireSecret() {
  const secret = process.env.COOKIE_SECRET;
  if (!secret) throw new Error("Missing COOKIE_SECRET env var");
  return secret;
}

function sign(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function buildToken() {
  const payload = `${Date.now()}`;
  const signature = sign(payload, requireSecret());
  return `${payload}.${signature}`;
}

function isValidToken(token?: string) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  return sign(payload, requireSecret()) === signature;
}

export async function isAuthenticated() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return isValidToken(token);
}

export async function createSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, buildToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
    path: "/"
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
