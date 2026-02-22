import type { EntryRepository } from "@/lib/data/types";
import { PrismaEntryRepository } from "@/lib/data/prisma-entry-repo";

let repo: EntryRepository | null = null;

export function getEntryRepository(): EntryRepository {
  if (repo) return repo;

  const adapter = process.env.DATA_ADAPTER ?? "prisma";

  switch (adapter) {
    case "prisma":
    default:
      repo = new PrismaEntryRepository();
      return repo;
  }
}
