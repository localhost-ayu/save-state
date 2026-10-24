"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { DatePrecision } from "@/types/database";

export type PartialDateValue = { date: string | null; precision: DatePrecision };

const PRECISION_LABELS: Record<DatePrecision, string> = { day: "Dia", month: "Mês", year: "Ano" };

function fromRaw(raw: string, precision: DatePrecision): string | null {
  if (!raw) return null;
  if (precision === "year") return /^\d{4}$/.test(raw) ? `${raw}-01-01` : null;
  if (precision === "month") return /^\d{4}-\d{2}$/.test(raw) ? `${raw}-01` : null;
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

export function PartialDateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PartialDateValue;
  onChange: (value: PartialDateValue) => void;
}) {
  const [raw, setRaw] = useState("");

  function changePrecision(precision: DatePrecision) {
    setRaw("");
    onChange({ date: null, precision });
  }

  function changeRaw(next: string) {
    setRaw(next);
    onChange({ date: fromRaw(next, value.precision), precision: value.precision });
  }

  return (
    <fieldset className="flex flex-col gap-1.5 text-sm">
      <legend className="mb-1.5">{label}</legend>
      <div className="flex gap-2">
        <select
          aria-label={`Precisão: ${label}`}
          value={value.precision}
          onChange={(event) => changePrecision(event.target.value as DatePrecision)}
          className="h-10 rounded-lg border border-border bg-surface px-2 text-sm"
        >
          {(Object.keys(PRECISION_LABELS) as DatePrecision[]).map((precision) => (
            <option key={precision} value={precision}>
              {PRECISION_LABELS[precision]}
            </option>
          ))}
        </select>
        <Input
          aria-label={label}
          type={value.precision === "day" ? "date" : value.precision === "month" ? "month" : "text"}
          inputMode={value.precision === "year" ? "numeric" : undefined}
          maxLength={value.precision === "year" ? 4 : undefined}
          placeholder={value.precision === "year" ? "2014" : undefined}
          value={raw}
          onChange={(event) => changeRaw(event.target.value)}
        />
      </div>
    </fieldset>
  );
}
