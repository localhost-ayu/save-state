import type { GameStatus } from "@/types/database";

export type PlaythroughChange = { type: "open" } | { type: "close"; outcome: "completed" | "dropped" } | null;

export function playthroughChangeForStatus(
  previous: GameStatus,
  next: GameStatus,
  hasOpenPlaythrough: boolean,
): PlaythroughChange {
  if (previous === next) return null;
  if (next === "playing" && !hasOpenPlaythrough) return { type: "open" };
  if ((next === "completed" || next === "dropped") && hasOpenPlaythrough) return { type: "close", outcome: next };
  return null;
}

type HoursSpan = { started_on: string | null; finished_on: string | null; hours: number | null };

export function playthroughYear(playthrough: HoursSpan) {
  return (playthrough.finished_on ?? playthrough.started_on)?.slice(0, 4) ?? null;
}

export function totalHours(playthroughs: HoursSpan[]) {
  return playthroughs.reduce((sum, playthrough) => sum + (playthrough.hours ?? 0), 0);
}

export function hoursInYear(playthroughs: HoursSpan[], year: string) {
  return totalHours(playthroughs.filter((playthrough) => playthroughYear(playthrough) === year));
}

const hoursFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export function formatHours(hours: number) {
  return `${hoursFormat.format(hours)} h`;
}
