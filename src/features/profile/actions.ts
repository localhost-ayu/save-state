"use server";

import { revalidatePath } from "next/cache";
import { fail, ok, validationError, type ActionResult } from "@/lib/action-result";
import { requireUser } from "@/lib/auth";
import { MEDIA_BUCKET, isOwnMediaPath } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, type ProfileInput } from "./schemas";

export async function saveProfile(input: ProfileInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const { username, displayName, tagline, bio, links, isPublic, featuredEntryId, sections } = parsed.data;
  const supabase = await createClient();

  if (featuredEntryId) {
    const { data: entry } = await supabase
      .from("library_entries")
      .select("id")
      .eq("id", featuredEntryId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!entry) return fail("Jogo em destaque inválido");
  }

  const { data: previous } = await supabase.from("profiles").select("username").eq("id", user.id).single();

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      display_name: displayName,
      tagline,
      bio,
      links,
      is_public: isPublic,
      featured_entry_id: featuredEntryId,
      sections,
    })
    .eq("id", user.id);
  if (error) return fail(error.code === "23505" ? "Esse nome de usuário já está em uso" : error.message);

  revalidatePath("/settings/profile");
  revalidatePath(`/u/${username}`);
  if (previous && previous.username !== username) revalidatePath(`/u/${previous.username}`);
  return ok();
}

const IMAGE_FOLDERS = { avatar: "avatars", banner: "banners" } as const;

export async function setProfileImage(kind: keyof typeof IMAGE_FOLDERS, path: string | null): Promise<ActionResult> {
  const user = await requireUser();
  if (!(kind in IMAGE_FOLDERS)) return fail("Tipo inválido");
  if (path && !isOwnMediaPath(user.id, path, IMAGE_FOLDERS[kind])) return fail("Arquivo inválido");

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("profiles")
    .select("username, avatar_path, banner_path")
    .eq("id", user.id)
    .single();

  const { error } = await supabase
    .from("profiles")
    .update(kind === "avatar" ? { avatar_path: path } : { banner_path: path })
    .eq("id", user.id);
  if (error) return fail(error.message);

  const previousPath = kind === "avatar" ? current?.avatar_path : current?.banner_path;
  if (previousPath && previousPath !== path) await supabase.storage.from(MEDIA_BUCKET).remove([previousPath]);

  revalidatePath("/settings/profile");
  if (current?.username) revalidatePath(`/u/${current.username}`);
  return ok();
}
