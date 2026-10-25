"use server";

import { revalidatePath } from "next/cache";
import { fail, ok, validationError, type ActionResult } from "@/lib/action-result";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  playthroughHoursSchema,
  playthroughSchema,
  type PlaythroughHoursInput,
  type PlaythroughInput,
} from "./schemas";

function revalidate(entryId: string) {
  revalidatePath(`/games/${entryId}`);
  revalidatePath("/timeline");
  revalidatePath("/board");
}

export async function addPlaythrough(input: PlaythroughInput): Promise<ActionResult> {
  await requireUser();
  const parsed = playthroughSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const { libraryEntryId, startedOn, startedPrecision, finishedOn, finishedPrecision, outcome, notes, hours } =
    parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("playthroughs").insert({
    library_entry_id: libraryEntryId,
    started_on: startedOn,
    started_precision: startedPrecision,
    finished_on: finishedOn,
    finished_precision: finishedPrecision,
    outcome,
    notes,
    hours,
  });
  if (error) return fail(error.message);

  revalidate(libraryEntryId);
  return ok();
}

export async function deletePlaythrough(id: string, libraryEntryId: string): Promise<ActionResult> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("playthroughs").delete().eq("id", id);
  if (error) return fail(error.message);

  revalidate(libraryEntryId);
  return ok();
}

export async function updatePlaythroughHours(input: PlaythroughHoursInput): Promise<ActionResult> {
  await requireUser();
  const parsed = playthroughHoursSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("playthroughs").update({ hours: parsed.data.hours }).eq("id", parsed.data.id);
  if (error) return fail(error.message);

  revalidate(parsed.data.libraryEntryId);
  return ok();
}
