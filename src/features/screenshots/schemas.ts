import { z } from "zod";

const caption = z.string().trim().max(2000).nullable();

export const addScreenshotSchema = z.object({
  libraryEntryId: z.uuid(),
  path: z.string().max(300),
  caption,
  journalEntryId: z.uuid().nullable(),
  isPrivate: z.boolean(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const updateScreenshotSchema = z.object({
  id: z.uuid(),
  caption,
  journalEntryId: z.uuid().nullable(),
  isPrivate: z.boolean(),
});

export type AddScreenshotInput = z.input<typeof addScreenshotSchema>;
export type UpdateScreenshotInput = z.input<typeof updateScreenshotSchema>;
