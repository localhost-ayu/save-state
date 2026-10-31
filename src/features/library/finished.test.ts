import { describe, expect, it } from "vitest";
import { finishedOn, groupFinishedByYear, type FinishedEntry } from "./finished";

function entry(id: string, statusChangedAt: string, finishes: [string | null, number | null][] = []): FinishedEntry {
  return {
    id,
    status_changed_at: statusChangedAt,
    playthroughs: finishes.map(([finished_on, hours]) => ({
      started_on: null,
      finished_on,
      finished_precision: "day",
      hours,
    })),
  };
}

describe("finishedOn", () => {
  it("uses the latest dated playthrough", () => {
    expect(
      finishedOn(
        entry("a", "2026-10-01T00:00:00Z", [
          ["2019-05-02", 40],
          ["2024-03-10", 20],
        ]),
      ),
    ).toEqual({
      date: "2024-03-10",
      precision: "day",
    });
  });

  it("falls back to the status change date", () => {
    expect(finishedOn(entry("a", "2026-10-01T12:00:00Z", [[null, 5]])).date).toBe("2026-10-01");
  });
});

describe("groupFinishedByYear", () => {
  it("groups by finish year, newest first, with total hours", () => {
    const groups = groupFinishedByYear([
      entry("old", "2026-01-01T00:00:00Z", [["2019-05-02", 40]]),
      entry("new", "2026-01-01T00:00:00Z", [["2026-02-01", 12.5]]),
      entry("newer", "2026-01-01T00:00:00Z", [["2026-09-01", null]]),
    ]);
    expect(groups.map((group) => [group.year, group.entries.map((e) => e.id), group.hours])).toEqual([
      ["2026", ["newer", "new"], 12.5],
      ["2019", ["old"], 40],
    ]);
  });
});
