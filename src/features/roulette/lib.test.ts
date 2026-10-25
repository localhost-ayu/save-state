import { describe, expect, it } from "vitest";
import { chanceOf, filterCandidates, pickWeighted } from "./lib";

const entries = [
  { id: "a", status: "backlog" as const, platform: "PS5", priority: 0 },
  { id: "b", status: "backlog" as const, platform: "NDS", priority: 2 },
  { id: "c", status: "paused" as const, platform: "PS5", priority: 1 },
  { id: "d", status: "playing" as const, platform: "PS5", priority: 1 },
];

describe("filterCandidates", () => {
  it("keeps the chosen statuses", () => {
    expect(filterCandidates(entries, { statuses: ["backlog", "paused"], platform: null }).map((e) => e.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("combines several statuses with a platform", () => {
    expect(filterCandidates(entries, { statuses: ["backlog", "playing"], platform: "PS5" }).map((e) => e.id)).toEqual([
      "a",
      "d",
    ]);
  });
});

describe("pickWeighted", () => {
  const pool = entries.slice(0, 3);

  it("returns null for an empty pool", () => {
    expect(pickWeighted([])).toBeNull();
  });

  it("maps the random value onto cumulative weights", () => {
    expect(pickWeighted(pool, () => 0)?.id).toBe("a");
    expect(pickWeighted(pool, () => 0.2)?.id).toBe("b");
    expect(pickWeighted(pool, () => 0.99)?.id).toBe("c");
  });

  it("gives high priority four times the chance of low", () => {
    expect(chanceOf(pool[1], pool) / chanceOf(pool[0], pool)).toBe(4);
  });
});
