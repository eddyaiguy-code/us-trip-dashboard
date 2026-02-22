export const FAMILIES = ["HO", "LAI", "OOI"] as const;
export type Family = (typeof FAMILIES)[number];

export const ENTRY_TYPES = ["FLIGHT", "HOTEL", "ACTIVITY", "OTHER"] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

export type TripEntry = {
  id: string;
  family: Family;
  type: EntryType;
  startDate: string;
  endDate: string;
  location: string;
  notes: string;
  screenshot?: string | null;
  createdAt: string;
};

export type NewTripEntryInput = {
  family: Family;
  type: EntryType;
  startDate: string;
  endDate: string;
  location: string;
  notes: string;
  screenshot?: string;
};
