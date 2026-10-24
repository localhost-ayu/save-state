import "server-only";
import type { IgdbGame } from "@/lib/integrations/igdb/client";
import { createAdminClient } from "@/lib/supabase/admin";

export async function upsertIgdbGame(game: IgdbGame): Promise<string> {
  const { data, error } = await createAdminClient()
    .from("games")
    .upsert(
      {
        source: "igdb",
        igdb_id: game.igdbId,
        title: game.title,
        slug: game.slug,
        summary: game.summary,
        cover_url: game.coverUrl,
        release_date: game.releaseDate,
        platforms: game.platforms,
        genres: game.genres,
        franchise: game.franchise,
      },
      { onConflict: "igdb_id" },
    )
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}
