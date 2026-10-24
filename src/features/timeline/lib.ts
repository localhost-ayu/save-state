import type { DatePrecision } from "@/types/database";

export type PartialDate = { date: string | null; precision: DatePrecision };

export type TimelineSpan = {
  start: PartialDate;
  end: PartialDate;
};

export type YearSegment = {
  startDay: number;
  endDay: number;
  ongoing: boolean;
  fuzzyStart: boolean;
  fuzzyEnd: boolean;
};

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function lowerBound({ date, precision }: PartialDate) {
  if (!date) return null;
  const d = parseDate(date);
  if (precision === "year") return new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  if (precision === "month") return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  return d;
}

function upperBound({ date, precision }: PartialDate) {
  if (!date) return null;
  const d = parseDate(date);
  if (precision === "year") return new Date(Date.UTC(d.getUTCFullYear(), 11, 31));
  if (precision === "month") return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
  return d;
}

export function daysInYear(year: number) {
  return (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000;
}

function dayOfYear(date: Date) {
  return Math.floor((date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 1)) / 86_400_000);
}

export function segmentForYear(span: TimelineSpan, year: number, today = new Date()): YearSegment | null {
  const start = lowerBound(span.start) ?? upperBound(span.end);
  if (!start) return null;

  const ongoing = !span.end.date;
  const end = upperBound(span.end) ?? today;

  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year, 11, 31));
  if (end < yearStart || start > yearEnd) return null;

  const clampedStart = start < yearStart ? yearStart : start;
  const clampedEnd = end > yearEnd ? yearEnd : end;

  return {
    startDay: dayOfYear(clampedStart),
    endDay: dayOfYear(clampedEnd),
    ongoing,
    fuzzyStart: !span.start.date || span.start.precision !== "day",
    fuzzyEnd: !ongoing && span.end.precision !== "day",
  };
}

export function formatPartialDate({ date, precision }: PartialDate) {
  if (!date) return "—";
  const [year, month, day] = date.split("-").map(Number);
  if (precision === "year") return String(year);
  if (precision === "month") return `${MONTHS[month - 1]} ${year}`;
  return `${day} ${MONTHS[month - 1]} ${year}`;
}
