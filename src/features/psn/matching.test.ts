import { describe, expect, it } from "vitest";
import { normalizeTitle, pickExactMatch, primaryPlatform } from "./matching";

describe("normalizeTitle", () => {
  it.each([
    ["Marvel's Spider-Man 2", "marvel s spider man 2"],
    ["God of War™ Ragnarök", "god of war ragnarok"],
    ["Persona 5 Royal (PS4)", "persona 5 royal"],
    ["Final Fantasy VII Remake - PS5", "final fantasy vii remake"],
    ["Hollow Knight Trophies", "hollow knight"],
    ["Stray PS4 & PS5", "stray"],
    ["ASTRO's PLAYROOM", "astro s playroom"],
  ])("%s → %s", (input, expected) => {
    expect(normalizeTitle(input)).toBe(expected);
  });
});

describe("pickExactMatch", () => {
  const candidates = [{ title: "God of War Ragnarök" }, { title: "God of War" }, { title: "God of War III" }];

  it("returns the single normalized match", () => {
    expect(pickExactMatch("God of War™ Ragnarök", candidates)).toEqual({ title: "God of War Ragnarök" });
  });

  it("returns null when nothing matches", () => {
    expect(pickExactMatch("God of War: Chains of Olympus", candidates)).toBeNull();
  });

  it("returns null when the match is ambiguous", () => {
    expect(pickExactMatch("Doom", [{ title: "DOOM" }, { title: "Doom" }])).toBeNull();
  });
});

describe("primaryPlatform", () => {
  it("prefers the newest console", () => {
    expect(primaryPlatform(["PS4", "PS5"])).toBe("PS5");
    expect(primaryPlatform(["PSVITA", "PS3"])).toBe("PS3");
    expect(primaryPlatform([])).toBeNull();
  });
});
