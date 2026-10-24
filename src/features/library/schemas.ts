import { z } from "zod";
import { GAME_STATUSES, OWNERSHIP_TYPES } from "./constants";

const rating = z
  .number()
  .min(0)
  .max(10)
  .refine((value) => Number.isInteger(value * 2), "Use passos de 0,5");

export const addIgdbGameSchema = z.object({
  igdbId: z.coerce.number().int().positive(),
  status: z.enum(GAME_STATUSES).default("backlog"),
});

export const createManualGameSchema = z.object({
  title: z.string().trim().min(1).max(300),
  platform: z.string().trim().max(60).optional(),
  releaseDate: z.iso.date().optional(),
  status: z.enum(GAME_STATUSES).default("backlog"),
  ownership: z.array(z.enum(OWNERSHIP_TYPES)).default([]),
});

export const updateEntrySchema = z.object({
  id: z.uuid(),
  status: z.enum(GAME_STATUSES).optional(),
  platform: z.string().trim().max(60).nullable().optional(),
  ownership: z.array(z.enum(OWNERSHIP_TYPES)).optional(),
  rating: rating.nullable().optional(),
  isPlatinum: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  playtimeMinutes: z.number().int().min(0).nullable().optional(),
});

export type AddIgdbGameInput = z.input<typeof addIgdbGameSchema>;
export type CreateManualGameInput = z.input<typeof createManualGameSchema>;
export type UpdateEntryInput = z.input<typeof updateEntrySchema>;
