import "server-only";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { segmentForYear } from "./lib";

export async function getTimeline(year: number) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("playthroughs")
    .select(
      `id, started_on, started_precision, finished_on, finished_precision, outcome,
       entry:library_entries!inner(id, status, is_platinum, game:games!inner(title, cover_url))`,
    )
    .eq("user_id", user.id)
    .or(`started_on.lte.${year}-12-31,started_on.is.null`)
    .or(`finished_on.gte.${year}-01-01,finished_on.is.null`)
    .order("started_on", { ascending: true, nullsFirst: false });
  if (error) throw error;

  return data.flatMap((playthrough) => {
    const segment = segmentForYear(
      {
        start: { date: playthrough.started_on, precision: playthrough.started_precision },
        end: { date: playthrough.finished_on, precision: playthrough.finished_precision },
      },
      year,
    );
    return segment ? [{ ...playthrough, segment }] : [];
  });
}

export type TimelineItem = Awaited<ReturnType<typeof getTimeline>>[number];
