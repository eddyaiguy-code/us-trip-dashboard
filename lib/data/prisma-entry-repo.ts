import { EntryType, Family, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { NewTripEntryInput, TripEntry } from "@/lib/types/trip";
import type { EntryRepository } from "@/lib/data/types";

function toDto(row: {
  id: string;
  family: string;
  type: string;
  startDate: Date;
  endDate: Date;
  location: string;
  notes: string;
  screenshot: string | null;
  createdAt: Date;
}): TripEntry {
  return {
    id: row.id,
    family: row.family as TripEntry["family"],
    type: row.type as TripEntry["type"],
    startDate: row.startDate.toISOString(),
    endDate: row.endDate.toISOString(),
    location: row.location,
    notes: row.notes,
    screenshot: row.screenshot,
    createdAt: row.createdAt.toISOString()
  };
}

export class PrismaEntryRepository implements EntryRepository {
  async list(filters: { family?: string; type?: string }) {
    const where: Prisma.TripEntryWhereInput = {
      ...(filters.family ? { family: filters.family as Family } : {}),
      ...(filters.type ? { type: filters.type as EntryType } : {})
    };

    const rows = await prisma.tripEntry.findMany({
      where,
      orderBy: [{ startDate: "asc" }, { createdAt: "asc" }]
    });

    return rows.map(toDto);
  }

  async create(input: NewTripEntryInput) {
    const row = await prisma.tripEntry.create({
      data: {
        family: input.family,
        type: input.type,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        location: input.location,
        notes: input.notes,
        screenshot: input.screenshot
      }
    });

    return toDto(row);
  }

  async remove(id: string) {
    await prisma.tripEntry.delete({ where: { id } });
  }
}
