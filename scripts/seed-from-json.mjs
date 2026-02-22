import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const fileArg = process.argv[2];
if (!fileArg) {
  console.error("Usage: node scripts/seed-from-json.mjs <path-to-json>");
  process.exit(1);
}

const skipIfExists = process.env.SEED_SKIP_IF_EXISTS !== "0";

const filePath = path.resolve(process.cwd(), fileArg);
const raw = fs.readFileSync(filePath, "utf8");
const payload = JSON.parse(raw);
const entries = payload.entries || [];

if (skipIfExists) {
  const count = await prisma.tripEntry.count();
  if (count > 0) {
    console.log(`Seed skipped (database already has ${count} TripEntry rows).`);
    await prisma.$disconnect();
    process.exit(0);
  }
}

function stableId(e) {
  // Deterministic id so seeding can be rerun without duplication.
  const key = [e.family, e.type, e.startDate, e.endDate || e.startDate, e.location || "", e.notes || ""].join("|");
  return crypto.createHash("sha1").update(key).digest("hex").slice(0, 24);
}

let upserted = 0;
for (const e of entries) {
  const startDate = e.startDate ? new Date(e.startDate) : null;
  const endDate = e.endDate ? new Date(e.endDate) : startDate;

  if (!e.family || !e.type || !startDate) continue;

  const id = e.id || stableId(e);

  await prisma.tripEntry.upsert({
    where: { id },
    update: {
      family: e.family,
      type: e.type,
      startDate,
      endDate,
      location: e.location || "",
      notes: e.notes || "",
      screenshot: e.screenshotUrl || null,
    },
    create: {
      id,
      family: e.family,
      type: e.type,
      startDate,
      endDate,
      location: e.location || "",
      notes: e.notes || "",
      screenshot: e.screenshotUrl || null,
    },
  });
  upserted++;
}

console.log(`Seed complete. Upserted ${upserted} entries.`);
await prisma.$disconnect();
