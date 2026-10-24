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
