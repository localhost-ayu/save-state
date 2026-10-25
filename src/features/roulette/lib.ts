import type { GameStatus } from "@/types/database";

export const PRIORITY_WEIGHTS = [1, 2, 4] as const;

export const DEFAULT_ROULETTE_STATUSES: GameStatus[] = ["backlog", "paused"];

type Candidate = { status: GameStatus; platform: string | null; priority: number };

export type RouletteFilters = { statuses: GameStatus[]; platform: string | null };

export function filterCandidates<T extends Candidate>(entries: T[], { statuses, platform }: RouletteFilters) {
  return entries.filter(
    (entry) => statuses.includes(entry.status) && (platform === null || entry.platform === platform),
  );
}

export function weightOf(priority: number) {
  return PRIORITY_WEIGHTS[Math.min(2, Math.max(0, priority))];
}

export function pickWeighted<T extends { priority: number }>(items: T[], random: () => number = Math.random): T | null {
  if (items.length === 0) return null;
  const total = items.reduce((sum, item) => sum + weightOf(item.priority), 0);
  let threshold = random() * total;
  for (const item of items) {
    threshold -= weightOf(item.priority);
    if (threshold < 0) return item;
  }
  return items.at(-1)!;
}

export function chanceOf(item: { priority: number }, items: { priority: number }[]) {
  const total = items.reduce((sum, other) => sum + weightOf(other.priority), 0);
  return total === 0 ? 0 : weightOf(item.priority) / total;
}
