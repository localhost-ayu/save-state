import { describe, expect, it } from "vitest";
import { parseIsoDuration } from "./duration";

describe("parseIsoDuration", () => {
  it.each([
    ["PT228H56M33S", 228 * 3600 + 56 * 60 + 33],
    ["PT45M", 45 * 60],
    ["PT12.5S", 12],
    ["P1DT2H", 26 * 3600],
    ["PT0S", 0],
  ])("parses %s", (input, expected) => {
    expect(parseIsoDuration(input)).toBe(expected);
  });

  it.each(["", "P", "PT", "228H", "invalid"])("rejects %j", (input) => {
    expect(parseIsoDuration(input)).toBeNull();
  });
});
