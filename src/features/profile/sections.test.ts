import { describe, expect, it } from "vitest";
import { SECTION_IDS, moveSection, normalizeSections } from "./sections";

describe("normalizeSections", () => {
  it("returns every section visible by default", () => {
    expect(normalizeSections([])).toEqual(SECTION_IDS.map((id) => ({ id, visible: true })));
  });

  it("keeps saved order and visibility, appending new sections", () => {
    const result = normalizeSections([
      { id: "gallery", visible: true },
      { id: "favorites", visible: false },
    ]);
    expect(result.slice(0, 2)).toEqual([
      { id: "gallery", visible: true },
      { id: "favorites", visible: false },
    ]);
    expect(result).toHaveLength(SECTION_IDS.length);
  });

  it("drops unknown and duplicate entries", () => {
    const result = normalizeSections([
      { id: "favorites", visible: false },
      { id: "favorites", visible: true },
      { id: "nope", visible: true },
      "garbage",
    ]);
    expect(result.filter((s) => s.id === "favorites")).toEqual([{ id: "favorites", visible: false }]);
    expect(result).toHaveLength(SECTION_IDS.length);
  });

  it("handles non-array values", () => {
    expect(normalizeSections(null)).toHaveLength(SECTION_IDS.length);
  });
});

describe("moveSection", () => {
  const sections = normalizeSections([]);

  it("swaps with the neighbour", () => {
    expect(
      moveSection(sections, 1, -1)
        .slice(0, 2)
        .map((s) => s.id),
    ).toEqual(["favorites", "now_playing"]);
  });

  it("ignores moves past the edges", () => {
    expect(moveSection(sections, 0, -1)).toBe(sections);
    expect(moveSection(sections, sections.length - 1, 1)).toBe(sections);
  });
});
