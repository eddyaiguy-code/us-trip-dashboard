import { z } from "zod";
import { ENTRY_TYPES, FAMILIES } from "@/lib/types/trip";

export const entrySchema = z
  .object({
    family: z.enum(FAMILIES),
    type: z.enum(ENTRY_TYPES),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    location: z.string().min(1).max(120),
    notes: z.string().min(1).max(2000),
    screenshot: z.string().url().optional()
  })
  .refine((value) => new Date(value.startDate).getTime() <= new Date(value.endDate).getTime(), {
    message: "startDate must be before endDate"
  });
