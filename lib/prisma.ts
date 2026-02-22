import { PrismaClient } from "@prisma/client";

// Vercel Supabase integration typically injects POSTGRES_PRISMA_URL.
// Our app expects DATABASE_URL. If Captain hasn't created DATABASE_URL yet,
// fall back automatically so the app works without manual copying of sensitive vars.
if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
