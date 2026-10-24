import { z } from "zod";

export const journalEntrySchema = z.object({
  libraryEntryId: z.uuid(),
  entryDate: z.iso.date(),
  title: z.string().trim().max(200).optional(),
  body: z.string().trim().min(1, "Escreva alguma coisa").max(20_000),
  isPrivate: z.boolean().default(false),
});

export const reviewSchema = z.object({
  libraryEntryId: z.uuid(),
  body: z.string().trim().max(50_000),
  isPrivate: z.boolean().default(false),
});

export type JournalEntryInput = z.input<typeof journalEntrySchema>;
export type ReviewInput = z.input<typeof reviewSchema>;
