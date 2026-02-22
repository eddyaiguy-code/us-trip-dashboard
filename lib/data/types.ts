import type { NewTripEntryInput, TripEntry } from "@/lib/types/trip";

export interface EntryRepository {
  list(filters: { family?: string; type?: string }): Promise<TripEntry[]>;
  create(input: NewTripEntryInput): Promise<TripEntry>;
  remove(id: string): Promise<void>;
}
