import { describe, expect, it } from "vitest";
import { todayIso } from "@/lib/dates";
import { playthroughChangeForStatus } from "./lib";

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
