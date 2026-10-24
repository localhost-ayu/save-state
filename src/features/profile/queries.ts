import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getPublicProfile(username: string) {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, accent_color, is_public")
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;
  if (!profile?.is_public) return null;

  const { data: entries, error: entriesError } = await supabase
    .from("library_entries")
    .select("id, status, is_platinum, is_favorite, game:games!inner(title, cover_url)")
    .eq("user_id", profile.id)
    .in("status", ["playing", "completed"])
    .order("status_changed_at", { ascending: false })
    .limit(48);
  if (entriesError) throw entriesError;

  return {
    profile,
    playing: entries.filter((entry) => entry.status === "playing"),
    completed: entries.filter((entry) => entry.status === "completed"),
  };
}
