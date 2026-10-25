"use server";

import { revalidatePath } from "next/cache";
import { fail, ok, validationError, type ActionResult } from "@/lib/action-result";
import { requireUser } from "@/lib/auth";
import { MEDIA_BUCKET, isOwnMediaPath } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";
import { parseTheme, themeSchema, type Theme } from "./theme";

export async function saveTheme(input: Theme): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = themeSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const imagePath = parsed.data.background.imagePath;
  if (imagePath && !isOwnMediaPath(user.id, imagePath, "backgrounds")) return fail("Arquivo inválido");

  const supabase = await createClient();
  const { data: current } = await supabase.from("profiles").select("username, theme").eq("id", user.id).single();

  const { error } = await supabase.from("profiles").update({ theme: parsed.data }).eq("id", user.id);
  if (error) return fail(error.message);

  const previousImage = parseTheme(current?.theme).background.imagePath;
  if (previousImage && previousImage !== imagePath) await supabase.storage.from(MEDIA_BUCKET).remove([previousImage]);

  revalidatePath("/", "layout");
  return ok();
}
