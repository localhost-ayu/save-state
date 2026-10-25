import { describe, expect, it } from "vitest";
import { cardStats, type CardEntry } from "./card-stats";

const base: CardEntry = {
  status: "backlog",
  status_changed_at: "2026-10-20T10:00:00Z",
  ownership: [],
  rating: null,
  expectation: null,
  priority: 1,
  playthroughs: [],
};

describe("cardStats", () => {
  it("shows expectation, priority and ownership for backlog, skipping empty ones", () => {
    expect(cardStats({ ...base, expectation: 8, priority: 2 })).toEqual([
      { label: "Expect.", value: "8/10" },
      { label: "Prioridade", value: "Alta" },
    ]);
  });

  it("shows start, hours and expectation while playing", () => {
    const stats = cardStats({
      ...base,
      status: "playing",
      expectation: 10,
      playthroughs: [
        {
          started_on: "2026-10-24",
          started_precision: "day",
          finished_on: null,
          finished_precision: "day",
          hours: 12.5,
        },
      ],
    });
    expect(stats.map((s) => s.label)).toEqual(["Início", "Horas", "Expect."]);
    expect(stats[1].value).toBe("12,5 h");
  });

  it("shows rating, hours and end when completed", () => {
    const stats = cardStats({
      ...base,
      status: "completed",
      rating: 9.5,
      playthroughs: [
        {
          started_on: "2026-01-01",
          started_precision: "day",
          finished_on: "2026-03-10",
          finished_precision: "day",
          hours: 40,
        },
      ],
    });
    expect(stats).toEqual([
      { label: "Nota", value: "9,5/10" },
      { label: "Horas", value: "40 h" },
      { label: "Fim", value: "10 mar 2026" },
    ]);
  });

  it("never shows more than three facts", () => {
    expect(cardStats({ ...base, expectation: 5, priority: 0, ownership: ["physical"] })).toHaveLength(3);
  });
});
