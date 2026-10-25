import { z } from "zod";

const precision = z.enum(["day", "month", "year"]);

const hours = z.number().min(0).max(99999);

export const playthroughSchema = z
  .object({
    libraryEntryId: z.uuid(),
    startedOn: z.iso.date().nullable(),
    startedPrecision: precision.default("day"),
    finishedOn: z.iso.date().nullable(),
    finishedPrecision: precision.default("day"),
    outcome: z.enum(["completed", "dropped"]).nullable().default(null),
    notes: z.string().trim().max(2000).nullable().default(null),
    hours: hours.nullable().default(null),
  })
  .refine((value) => !value.startedOn || !value.finishedOn || value.finishedOn >= value.startedOn, {
    message: "O fim precisa ser depois do início",
    path: ["finishedOn"],
  });

export const playthroughHoursSchema = z.object({
  id: z.uuid(),
  libraryEntryId: z.uuid(),
  hours: hours.nullable(),
});

export type PlaythroughInput = z.input<typeof playthroughSchema>;
export type PlaythroughHoursInput = z.input<typeof playthroughHoursSchema>;
