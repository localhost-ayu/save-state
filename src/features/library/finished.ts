import { totalHours } from "@/features/playthroughs/lib";
import type { DatePrecision } from "@/types/database";

type FinishedPlaythrough = {
  started_on: string | null;
  finished_on: string | null;
  finished_precision: DatePrecision;
  hours: number | null;
};

export type FinishedEntry = {
  id: string;
  status_changed_at: string;
  playthroughs: FinishedPlaythrough[];
};

/** Latest dated finish, falling back to when the status changed to completed. */
export function finishedOn<T extends FinishedEntry>(entry: T): { date: string; precision: DatePrecision } {
  const latest = entry.playthroughs
    .filter((playthrough) => playthrough.finished_on)
    .sort((a, b) => (b.finished_on ?? "").localeCompare(a.finished_on ?? ""))[0];
  if (latest?.finished_on) return { date: latest.finished_on, precision: latest.finished_precision };
  return { date: entry.status_changed_at.slice(0, 10), precision: "day" };
}

export type FinishedYear<T> = { year: string; entries: T[]; hours: number };

export function groupFinishedByYear<T extends FinishedEntry>(entries: T[]): FinishedYear<T>[] {
  const sorted = [...entries].sort((a, b) => finishedOn(b).date.localeCompare(finishedOn(a).date));
  const years = new Map<string, T[]>();
  for (const entry of sorted) {
    const year = finishedOn(entry).date.slice(0, 4);
    years.set(year, [...(years.get(year) ?? []), entry]);
  }
  return [...years].map(([year, group]) => ({
    year,
    entries: group,
    hours: group.reduce((sum, entry) => sum + totalHours(entry.playthroughs), 0),
  }));
}
