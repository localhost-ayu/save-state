import { describe, expect, it } from "vitest";
import { formatPartialDate, segmentForYear } from "./lib";

const day = (date: string) => ({ date, precision: "day" as const });
const none = { date: null, precision: "day" as const };

describe("segmentForYear", () => {
  it("returns the span inside the year", () => {
    expect(segmentForYear({ start: day("2026-01-10"), end: day("2026-02-01") }, 2026)).toEqual({
      startDay: 9,
      endDay: 31,
      ongoing: false,
      fuzzyStart: false,
      fuzzyEnd: false,
    });
  });

  it("clamps spans crossing year boundaries", () => {
    const segment = segmentForYear({ start: day("2025-12-20"), end: day("2026-01-05") }, 2026);
    expect(segment?.startDay).toBe(0);
    expect(segment?.endDay).toBe(4);
  });

  it("extends ongoing spans until today", () => {
    const segment = segmentForYear({ start: day("2026-10-01"), end: none }, 2026, new Date("2026-10-24"));
    expect(segment).toMatchObject({ endDay: 296, ongoing: true });
  });

  it("expands imprecise dates to their full range", () => {
    const segment = segmentForYear(
      { start: { date: "2014-01-01", precision: "year" }, end: { date: "2014-03-01", precision: "month" } },
      2014,
    );
    expect(segment).toMatchObject({ startDay: 0, endDay: 89, fuzzyStart: true, fuzzyEnd: true });
  });

  it("ignores spans outside the year", () => {
    expect(segmentForYear({ start: day("2024-01-01"), end: day("2024-02-01") }, 2026)).toBeNull();
  });

  it("ignores spans without dates", () => {
    expect(segmentForYear({ start: none, end: none }, 2026)).toBeNull();
  });
});

describe("formatPartialDate", () => {
  it("formats by precision", () => {
    expect(formatPartialDate(day("2026-03-07"))).toBe("7 mar 2026");
    expect(formatPartialDate({ date: "2026-03-01", precision: "month" })).toBe("mar 2026");
    expect(formatPartialDate({ date: "2014-01-01", precision: "year" })).toBe("2014");
    expect(formatPartialDate(none)).toBe("—");
  });
});
