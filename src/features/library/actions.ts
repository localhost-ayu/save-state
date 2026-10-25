"use server";

import { revalidatePath } from "next/cache";
import { playthroughChangeForStatus } from "@/features/playthroughs/lib";
import { fail, ok, validationError, type ActionResult } from "@/lib/action-result";
import { requireUser } from "@/lib/auth";
import { todayIso } from "@/lib/dates";
import { MEDIA_BUCKET, isOwnMediaPath } from "@/lib/media";
import { getGameById, searchGames, type IgdbGame } from "@/lib/integrations/igdb/client";
import { createClient } from "@/lib/supabase/server";
import type { TablesUpdate } from "@/types/database";
import {
  addIgdbGameSchema,
  createManualGameSchema,
  customCoverSchema,
  updateEntrySchema,
  type AddIgdbGameInput,
  type CreateManualGameInput,
  type UpdateEntryInput,
} from "./schemas";
import { upsertIgdbGame } from "./catalog";

export async function searchIgdb(term: string): Promise<ActionResult<IgdbGame[]>> {
  await requireUser();
  if (term.trim().length < 2) return ok([]);
  try {
    return ok(await searchGames(term.trim()));
  } catch {
    return fail("Busca no IGDB indisponível. Confira IGDB_CLIENT_ID e IGDB_CLIENT_SECRET.");
  }
}

export async function addIgdbGame(input: AddIgdbGameInput): Promise<ActionResult<{ entryId: string }>> {
  await requireUser();
  const parsed = addIgdbGameSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const igdbGame = await getGameById(parsed.data.igdbId).catch(() => null);
  if (!igdbGame) return fail("Jogo não encontrado no IGDB");

  const gameId = await upsertIgdbGame(igdbGame);

  const supabase = await createClient();
  const { data: entry, error } = await supabase
    .from("library_entries")
    .insert({ game_id: gameId, status: parsed.data.status })
    .select("id")
    .single();
  if (error) return fail(error.code === "23505" ? "Esse jogo já está na biblioteca" : error.message);

  revalidatePath("/library");
  return ok({ entryId: entry.id });
}

export async function createManualGame(input: CreateManualGameInput): Promise<ActionResult<{ entryId: string }>> {
  const user = await requireUser();
  const parsed = createManualGameSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createClient();
  const { title, platform, releaseDate, status, ownership } = parsed.data;

  const { data: game, error: gameError } = await supabase
    .from("games")
    .insert({
      source: "manual",
      title,
      release_date: releaseDate ?? null,
      platforms: platform ? [platform] : [],
      created_by: user.id,
    })
    .select("id")
    .single();
  if (gameError) return fail(gameError.message);

  const { data: entry, error } = await supabase
    .from("library_entries")
    .insert({ game_id: game.id, status, platform: platform ?? null, ownership })
    .select("id")
    .single();
  if (error) return fail(error.message);

  revalidatePath("/library");
  return ok({ entryId: entry.id });
}

export async function updateEntry(input: UpdateEntryInput): Promise<ActionResult> {
  await requireUser();
  const parsed = updateEntrySchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const { id, isPlatinum, isFavorite, ...rest } = parsed.data;
  const patch: TablesUpdate<"library_entries"> = {
    ...rest,
    ...(isPlatinum !== undefined && { is_platinum: isPlatinum }),
    ...(isFavorite !== undefined && { is_favorite: isFavorite }),
  };

  const supabase = await createClient();

  const { data: current, error: currentError } = await supabase
    .from("library_entries")
    .select("status, playthroughs(id, finished_on, created_at)")
    .eq("id", id)
    .single();
  if (currentError) return fail(currentError.message);

  const { error } = await supabase.from("library_entries").update(patch).eq("id", id);
  if (error) return fail(error.message);

  if (parsed.data.status) {
    const open = current.playthroughs
      .filter((playthrough) => !playthrough.finished_on)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    const change = playthroughChangeForStatus(current.status, parsed.data.status, Boolean(open));

    if (change?.type === "open") {
      await supabase.from("playthroughs").insert({ library_entry_id: id, started_on: todayIso() });
    } else if (change?.type === "close" && open) {
      await supabase
        .from("playthroughs")
        .update({ finished_on: todayIso(), outcome: change.outcome })
        .eq("id", open.id);
    }
  }

  revalidatePath("/library");
  revalidatePath("/board");
  revalidatePath("/timeline");
  revalidatePath(`/games/${id}`);
  return ok();
}

export async function removeEntry(id: string): Promise<ActionResult> {
  await requireUser();
  const supabase = await createClient();

  const { data: entry } = await supabase
    .from("library_entries")
    .select("custom_cover_path, screenshots(storage_path)")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("library_entries").delete().eq("id", id);
  if (error) return fail(error.message);

  const files = [entry?.custom_cover_path, ...(entry?.screenshots ?? []).map((shot) => shot.storage_path)].filter(
    (path): path is string => Boolean(path),
  );
  if (files.length > 0) await supabase.storage.from(MEDIA_BUCKET).remove(files);

  revalidatePath("/library");
  revalidatePath("/board");
  return ok();
}

export async function setCustomCover(input: { id: string; path: string | null }): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = customCoverSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  if (parsed.data.path && !isOwnMediaPath(user.id, parsed.data.path, "covers")) return fail("Arquivo inválido");

  const supabase = await createClient();
  const { error } = await supabase
    .from("library_entries")
    .update({ custom_cover_path: parsed.data.path, cover_crop: null })
    .eq("id", parsed.data.id);
  if (error) return fail(error.message);

  revalidatePath("/library");
  revalidatePath(`/games/${parsed.data.id}`);
  return ok();
}
