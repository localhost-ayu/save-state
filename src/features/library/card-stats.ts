import { formatHours, totalHours } from "@/features/playthroughs/lib";
import { formatPartialDate } from "@/features/timeline/lib";
import type { DatePrecision, GameStatus, OwnershipType } from "@/types/database";
import { OWNERSHIP_LABELS, PRIORITY_LABELS } from "./constants";

type Playthrough = {
  started_on: string | null;
  started_precision: DatePrecision;
  finished_on: string | null;
  finished_precision: DatePrecision;
  hours: number | null;
};

export type CardEntry = {
  status: GameStatus;
  status_changed_at: string;
  ownership: OwnershipType[];
  rating: number | null;
  expectation: number | null;
  priority: number;
  playthroughs: Playthrough[];
};

export type CardStat = { label: string; value: string };

const MAX_STATS = 3;

function latest<T>(items: T[], key: (item: T) => string | null) {
  return [...items].filter((item) => key(item)).sort((a, b) => key(b)!.localeCompare(key(a)!))[0];
}

/** Up to three facts that matter for the column the card is in, skipping the ones without data. */
export function cardStats(entry: CardEntry): CardStat[] {
  const hours = totalHours(entry.playthroughs);
  const started = latest(entry.playthroughs, (p) => p.started_on);
  const finished = latest(entry.playthroughs, (p) => p.finished_on);
  const statusSince = formatPartialDate({ date: entry.status_changed_at.slice(0, 10), precision: "day" });

  const facts: Record<string, CardStat | null> = {
    expectation: entry.expectation !== null ? { label: "Expect.", value: `${entry.expectation}/10` } : null,
    priority: entry.priority !== 1 ? { label: "Prioridade", value: PRIORITY_LABELS[entry.priority] } : null,
    ownership: entry.ownership.length
      ? { label: "Posse", value: entry.ownership.map((type) => OWNERSHIP_LABELS[type]).join(", ") }
      : null,
    start: started
      ? {
          label: "Início",
          value: formatPartialDate({ date: started.started_on, precision: started.started_precision }),
        }
      : null,
    hours: hours > 0 ? { label: "Horas", value: formatHours(hours) } : null,
    pausedSince: { label: "Parado desde", value: statusSince },
    droppedOn: { label: "Abandonado em", value: statusSince },
    rating: entry.rating !== null ? { label: "Nota", value: `${String(entry.rating).replace(".", ",")}/10` } : null,
    end: finished
      ? {
          label: "Fim",
          value: formatPartialDate({ date: finished.finished_on, precision: finished.finished_precision }),
        }
      : null,
  };

  const order: Record<GameStatus, string[]> = {
    backlog: ["expectation", "priority", "ownership"],
    playing: ["start", "hours", "expectation"],
    paused: ["pausedSince", "hours", "start"],
    shelved: ["pausedSince", "hours", "start"],
    dropped: ["droppedOn", "hours", "start"],
    completed: ["rating", "hours", "end"],
  };

  return order[entry.status].flatMap((key) => facts[key] ?? []).slice(0, MAX_STATS);
}
