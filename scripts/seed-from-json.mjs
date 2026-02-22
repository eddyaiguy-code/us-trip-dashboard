import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const fileArg = process.argv[2];
if (!fileArg) {
  console.error("Usage: node scripts/seed-from-json.mjs <path-to-json>");
  process.exit(1);
}

const filePath = path.resolve(process.cwd(), fileArg);
const raw = fs.readFileSync(filePath, "utf8");
const payload = JSON.parse(raw);
const entries = payload.entries || [];

let created = 0;
for (const e of entries) {
  const startDate = e.startDate ? new Date(e.startDate) : null;
  const endDate = e.endDate ? new Date(e.endDate) : null;

  if (!e.family || !e.type || !startDate) continue;

  await prisma.tripEntry.create({
    data: {
      family: e.family,
      type: e.type,
      startDate,
      endDate,
      location: e.location || "",
      notes: e.notes || "",
      screenshotUrl: e.screenshotUrl || null,
    },
  });
  created++;
}

console.log(`Seed complete. Created ${created} entries.`);
await prisma.$disconnect();
