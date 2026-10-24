"use server";

import { revalidatePath } from "next/cache";
import { fail, ok, validationError, type ActionResult } from "@/lib/action-result";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { journalEntrySchema, reviewSchema, type JournalEntryInput, type ReviewInput } from "./schemas";

export async function addJournalEntry(input: JournalEntryInput): Promise<ActionResult> {
  await requireUser();
  const parsed = journalEntrySchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const { libraryEntryId, entryDate, title, body, isPrivate } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("journal_entries").insert({
    library_entry_id: libraryEntryId,
    entry_date: entryDate,
    title: title || null,
    body,
    is_private: isPrivate,
  });
  if (error) return fail(error.message);

  revalidatePath(`/games/${libraryEntryId}`);
  return ok();
}

export async function deleteJournalEntry(id: string, libraryEntryId: string): Promise<ActionResult> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("journal_entries").delete().eq("id", id);
  if (error) return fail(error.message);

  revalidatePath(`/games/${libraryEntryId}`);
  return ok();
}

export async function saveReview(input: ReviewInput): Promise<ActionResult> {
  await requireUser();
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const { libraryEntryId, body, isPrivate } = parsed.data;
  const supabase = await createClient();

  const { error } = body
    ? await supabase
        .from("reviews")
        .upsert({ library_entry_id: libraryEntryId, body, is_private: isPrivate }, { onConflict: "library_entry_id" })
    : await supabase.from("reviews").delete().eq("library_entry_id", libraryEntryId);
  if (error) return fail(error.message);

  revalidatePath(`/games/${libraryEntryId}`);
  return ok();
}
