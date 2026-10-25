import { describe, expect, it } from "vitest";
import { todayIso } from "@/lib/dates";
import { formatHours, hoursInYear, playthroughChangeForStatus, playthroughYear, totalHours } from "./lib";

describe("playthroughChangeForStatus", () => {
  it("opens a playthrough when starting a game", () => {
    expect(playthroughChangeForStatus("backlog", "playing", false)).toEqual({ type: "open" });
  });

  it("does not open a second playthrough", () => {
    expect(playthroughChangeForStatus("paused", "playing", true)).toBeNull();
  });

  it("closes the open playthrough when finishing or dropping", () => {
    expect(playthroughChangeForStatus("playing", "completed", true)).toEqual({ type: "close", outcome: "completed" });
    expect(playthroughChangeForStatus("shelved", "dropped", true)).toEqual({ type: "close", outcome: "dropped" });
  });

  it("does nothing for other transitions", () => {
    expect(playthroughChangeForStatus("backlog", "completed", false)).toBeNull();
    expect(playthroughChangeForStatus("playing", "paused", true)).toBeNull();
    expect(playthroughChangeForStatus("playing", "playing", false)).toBeNull();
  });
});

describe("todayIso", () => {
  it("uses the app time zone", () => {
    expect(todayIso(new Date("2026-10-25T01:30:00Z"))).toBe("2026-10-24");
  });
});

describe("hours", () => {
  const playthroughs = [
    { started_on: "2025-11-01", finished_on: "2026-01-10", hours: 10 },
    { started_on: "2026-03-01", finished_on: null, hours: 10 },
    { started_on: null, finished_on: "2024-05-01", hours: 4.5 },
    { started_on: null, finished_on: null, hours: 2 },
    { started_on: "2026-06-01", finished_on: "2026-06-20", hours: null },
  ];

  it("adds every playthrough for the all-time total", () => {
    expect(totalHours(playthroughs)).toBe(26.5);
  });

  it("counts a playthrough in the year it finished, or started when ongoing", () => {
    expect(playthroughYear(playthroughs[0])).toBe("2026");
    expect(playthroughYear(playthroughs[1])).toBe("2026");
    expect(playthroughYear(playthroughs[3])).toBeNull();
    expect(hoursInYear(playthroughs, "2026")).toBe(20);
    expect(hoursInYear(playthroughs, "2024")).toBe(4.5);
  });

  it("formats hours in pt-BR", () => {
    expect(formatHours(12.5)).toBe("12,5 h");
    expect(formatHours(20)).toBe("20 h");
  });
});
