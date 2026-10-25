import "server-only";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { GameStatus } from "@/types/database";

const ENTRY_FIELDS = `
  id, status, platform, ownership, rating, is_platinum, is_favorite, priority,
  expectation, custom_cover_path, cover_crop, board_position, updated_at,
  game:games!inner(id, title, cover_url, release_date, platforms),
  playthroughs(started_on, started_precision, finished_on, hours)
`;

export type LibraryFilters = { status?: GameStatus; search?: string };

export async function getLibrary(filters: LibraryFilters = {}) {
  const user = await requireUser();
  const supabase = await createClient();

  let query = supabase
    .from("library_entries")
    .select(ENTRY_FIELDS)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.search) query = query.ilike("game.title", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export type LibraryEntry = Awaited<ReturnType<typeof getLibrary>>[number];

export async function getEntryDetail(id: string) {
  const user = await requireUser();
  if (!z.uuid().safeParse(id).success) return null;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("library_entries")
    .select(
      `id, status, platform, ownership, rating, is_platinum, is_favorite, expectation, priority,
       custom_cover_path, created_at,
       game:games!inner(id, source, title, summary, cover_url, release_date, platforms, genres, franchise),
       review:reviews(body, is_private, updated_at),
       playthroughs(id, started_on, started_precision, finished_on, finished_precision, outcome, notes, hours),
       journal_entries(id, entry_date, title, body, is_private, created_at),
       screenshots(id, storage_path, caption, journal_entry_id, is_private, width, height, created_at)`,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .order("started_on", { referencedTable: "playthroughs", ascending: false, nullsFirst: false })
    .order("entry_date", { referencedTable: "journal_entries", ascending: false })
    .order("created_at", { referencedTable: "screenshots", ascending: true })
    .maybeSingle();
  if (error) throw error;
  return data;
}

export type EntryDetail = NonNullable<Awaited<ReturnType<typeof getEntryDetail>>>;
