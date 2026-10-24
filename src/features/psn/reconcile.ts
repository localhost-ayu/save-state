import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { upsertIgdbGame } from "@/features/library/catalog";
import { searchGames } from "@/lib/integrations/igdb/client";
import type { Database } from "@/types/database";
import { pickExactMatch, primaryPlatform } from "./matching";

type AdminClient = SupabaseClient<Database>;

type PsnTitleRef = { id: string; user_id: string; platforms: string[]; earned_platinum: number };

const IGDB_REQUEST_INTERVAL_MS = 260;
const DEFAULT_BATCH = 40;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function linkTitleToGame(admin: AdminClient, title: PsnTitleRef, gameId: string) {
  const isPlatinum = title.earned_platinum === 1;

  const { data: existing, error: findError } = await admin
    .from("library_entries")
    .select("id, is_platinum")
    .eq("user_id", title.user_id)
    .eq("game_id", gameId)
    .maybeSingle();
  if (findError) throw findError;

  let entryId = existing?.id;

  if (!existing) {
    const { data, error } = await admin
      .from("library_entries")
      .insert({
        user_id: title.user_id,
        game_id: gameId,
        status: "backlog",
        platform: primaryPlatform(title.platforms),
        is_platinum: isPlatinum,
      })
      .select("id")
      .single();
    if (error) throw error;
    entryId = data.id;
  } else if (isPlatinum && !existing.is_platinum) {
    const { error } = await admin.from("library_entries").update({ is_platinum: true }).eq("id", existing.id);
    if (error) throw error;
  }

  const { error } = await admin
    .from("psn_titles")
    .update({ library_entry_id: entryId, link_status: "linked" })
    .eq("id", title.id);
  if (error) throw error;

  return entryId!;
}

export async function reconcilePendingTitles(admin: AdminClient, userId: string, limit = DEFAULT_BATCH) {
  const { data: titles, error } = await admin
    .from("psn_titles")
    .select("id, user_id, name, platforms, earned_platinum")
    .eq("user_id", userId)
    .eq("link_status", "pending")
    .order("last_played_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;

  let linked = 0;
  let needsReview = 0;

  for (const [index, title] of titles.entries()) {
    if (index > 0) await wait(IGDB_REQUEST_INTERVAL_MS);

    const match = pickExactMatch(title.name, await searchGames(title.name, 10));
    if (match) {
      await linkTitleToGame(admin, title, await upsertIgdbGame(match));
      linked++;
    } else {
      await admin.from("psn_titles").update({ link_status: "needs_review" }).eq("id", title.id);
      needsReview++;
    }
  }

  return { linked, needsReview, processed: titles.length };
}
