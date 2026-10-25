"use server";

import { revalidatePath } from "next/cache";
import { fail, ok, validationError, type ActionResult } from "@/lib/action-result";
import { requireUser } from "@/lib/auth";
import { MEDIA_BUCKET, isOwnMediaPath } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";
import {
  addScreenshotSchema,
  updateScreenshotSchema,
  type AddScreenshotInput,
  type UpdateScreenshotInput,
} from "./schemas";

export async function addScreenshot(input: AddScreenshotInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = addScreenshotSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  if (!isOwnMediaPath(user.id, parsed.data.path, "screenshots")) return fail("Arquivo inválido");

  const { libraryEntryId, path, caption, journalEntryId, isPrivate, width, height } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("screenshots").insert({
    library_entry_id: libraryEntryId,
    storage_path: path,
    caption: caption || null,
    journal_entry_id: journalEntryId,
    is_private: isPrivate,
    width,
    height,
  });
  if (error) return fail(error.message);

  revalidatePath(`/games/${libraryEntryId}`);
  return ok();
}

export async function updateScreenshot(input: UpdateScreenshotInput): Promise<ActionResult> {
  await requireUser();
  const parsed = updateScreenshotSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("screenshots")
    .update({
      caption: parsed.data.caption || null,
      journal_entry_id: parsed.data.journalEntryId,
      is_private: parsed.data.isPrivate,
    })
    .eq("id", parsed.data.id)
    .select("library_entry_id")
    .single();
  if (error) return fail(error.message);

  revalidatePath(`/games/${data.library_entry_id}`);
  return ok();
}

export async function deleteScreenshot(id: string): Promise<ActionResult> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("screenshots")
    .delete()
    .eq("id", id)
    .select("library_entry_id, storage_path")
    .single();
  if (error) return fail(error.message);

  await supabase.storage.from(MEDIA_BUCKET).remove([data.storage_path]);
  revalidatePath(`/games/${data.library_entry_id}`);
  return ok();
}
