import "server-only";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function getPsnConnection() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: account }, { data: lastRun }] = await Promise.all([
    supabase
      .from("external_accounts")
      .select("display_name, avatar_url, last_synced_at")
      .eq("user_id", user.id)
      .eq("provider", "psn")
      .maybeSingle(),
    supabase
      .from("sync_runs")
      .select("status, started_at, error, stats")
      .eq("user_id", user.id)
      .eq("provider", "psn")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return { account, lastRun };
}

export async function getPsnReviewQueue() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: titles, error }, { count: pending }] = await Promise.all([
    supabase
      .from("psn_titles")
      .select("id, name, icon_url, platforms, progress, earned_platinum, play_duration_seconds")
      .eq("user_id", user.id)
      .eq("link_status", "needs_review")
      .order("last_played_at", { ascending: false, nullsFirst: false }),
    supabase
      .from("psn_titles")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("link_status", "pending"),
  ]);
  if (error) throw error;

  return { titles, pending: pending ?? 0 };
}

export type PsnReviewTitle = Awaited<ReturnType<typeof getPsnReviewQueue>>["titles"][number];

export async function getPsnTitlesForEntry(entryId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("psn_titles")
    .select(
      `id, name, platforms, progress, play_duration_seconds, last_played_at,
       defined_bronze, defined_silver, defined_gold, defined_platinum,
       earned_bronze, earned_silver, earned_gold, earned_platinum`,
    )
    .eq("library_entry_id", entryId);
  if (error) throw error;
  return data;
}
