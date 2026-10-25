import "server-only";
import { cache } from "react";
import { parseTheme } from "@/features/appearance/theme";
import { hoursInYear, totalHours } from "@/features/playthroughs/lib";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { todayIso } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import type { ProfileLink } from "./schemas";
import { normalizeSections } from "./sections";

const PROFILE_FIELDS =
  "id, username, display_name, tagline, bio, links, avatar_path, banner_path, theme, sections, featured_entry_id, is_public";

function parseLinks(value: unknown): ProfileLink[] {
  return Array.isArray(value)
    ? value.filter(
        (link): link is ProfileLink => typeof link === "object" && link !== null && "label" in link && "url" in link,
      )
    : [];
}

export async function getMyProfileSettings() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: profile, error }, { data: entries }] = await Promise.all([
    supabase.from("profiles").select(PROFILE_FIELDS).eq("id", user.id).single(),
    supabase
      .from("library_entries")
      .select("id, status, game:games!inner(title)")
      .eq("user_id", user.id)
      .order("status_changed_at", { ascending: false }),
  ]);
  if (error) throw error;

  return {
    profile: {
      ...profile,
      links: parseLinks(profile.links),
      sections: normalizeSections(profile.sections),
      theme: parseTheme(profile.theme),
    },
    entries: entries ?? [],
  };
}

export type MyProfileSettings = Awaited<ReturnType<typeof getMyProfileSettings>>;

export async function getPublicProfile(username: string) {
  const viewer = await getCurrentUser();
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;
  if (!profile) return null;

  const isOwner = viewer?.id === profile.id;
  if (!profile.is_public && !isOwner) return null;

  const year = todayIso().slice(0, 4);

  const [entries, playthroughs, reviews, screenshots] = await Promise.all([
    supabase
      .from("library_entries")
      .select(
        "id, status, platform, is_platinum, is_favorite, custom_cover_path, status_changed_at, game:games!inner(title, cover_url)",
      )
      .eq("user_id", profile.id)
      .order("status_changed_at", { ascending: false }),
    supabase
      .from("playthroughs")
      .select("library_entry_id, started_on, finished_on, outcome, hours")
      .eq("user_id", profile.id)
      .order("finished_on", { ascending: false, nullsFirst: false }),
    supabase
      .from("reviews")
      .select("body, updated_at, entry:library_entries!inner(id, game:games!inner(title))")
      .eq("user_id", profile.id)
      .eq("is_private", false)
      .order("updated_at", { ascending: false })
      .limit(3),
    supabase
      .from("screenshots")
      .select("id, storage_path, caption, entry:library_entries!inner(game:games!inner(title))")
      .eq("user_id", profile.id)
      .eq("is_private", false)
      .order("created_at", { ascending: false })
      .limit(9),
  ]);
  for (const result of [entries, playthroughs, reviews, screenshots]) if (result.error) throw result.error;

  const library = entries.data ?? [];
  const byId = new Map(library.map((entry) => [entry.id, entry]));
  const allPlaythroughs = playthroughs.data ?? [];
  const finishedIds = [
    ...new Set(
      allPlaythroughs
        .filter((p) => p.outcome === "completed" && p.finished_on?.startsWith(year))
        .map((p) => p.library_entry_id),
    ),
  ];
  const featured = profile.featured_entry_id ? byId.get(profile.featured_entry_id) : undefined;

  return {
    isOwner,
    year,
    profile: {
      ...profile,
      links: parseLinks(profile.links),
      sections: normalizeSections(profile.sections),
      theme: parseTheme(profile.theme),
    },
    nowPlaying: featured ?? library.find((entry) => entry.status === "playing") ?? null,
    favorites: library.filter((entry) => entry.is_favorite).slice(0, 8),
    finishedYear: finishedIds.flatMap((id) => byId.get(id) ?? []),
    stats: {
      finished: finishedIds.length,
      platinums: library.filter((entry) => entry.is_platinum).length,
      playing: library.filter((entry) => entry.status === "playing").length,
      backlog: library.filter((entry) => entry.status === "backlog").length,
      hoursYear: hoursInYear(allPlaythroughs, year),
      hoursTotal: totalHours(allPlaythroughs),
    },
    reviews: reviews.data ?? [],
    gallery: screenshots.data ?? [],
  };
}

export type PublicProfile = NonNullable<Awaited<ReturnType<typeof getPublicProfile>>>;
export type PublicProfileEntry = PublicProfile["favorites"][number];

export const getMyProfileSummary = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_path")
    .eq("id", user.id)
    .maybeSingle();
  return data;
});
