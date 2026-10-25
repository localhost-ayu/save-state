"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATUS_LABELS } from "@/features/library/constants";
import type { EntryDetail } from "@/features/library/queries";
import { formatPartialDate } from "@/features/timeline/lib";
import { addPlaythrough, deletePlaythrough, updatePlaythroughHours } from "../actions";
import { formatHours, totalHours } from "../lib";
import { PartialDateInput, type PartialDateValue } from "./partial-date-input";

type Playthrough = EntryDetail["playthroughs"][number];

function parseHours(raw: string): number | null | undefined {
  const value = raw.trim().replace(",", ".");
  if (value === "") return null;
  const hours = Number(value);
  return Number.isFinite(hours) && hours >= 0 ? Math.round(hours * 10) / 10 : undefined;
}

function hoursToText(hours: number | null) {
  return hours === null ? "" : String(hours).replace(".", ",");
}

function HoursField({ entryId, playthrough }: { entryId: string; playthrough: Playthrough }) {
  const [value, setValue] = useState(hoursToText(playthrough.hours));
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    const hours = parseHours(value);
    if (hours === undefined) return setError(true);
    setError(false);
    if (hours === playthrough.hours) return;
    startTransition(async () => {
      const result = await updatePlaythroughHours({ id: playthrough.id, libraryEntryId: entryId, hours });
      setError(!result.ok);
    });
  }

  return (
    <label className="flex items-center gap-1.5 text-xs text-muted">
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={save}
        inputMode="decimal"
        placeholder="0"
        aria-label="Horas jogadas nesta jornada"
        aria-invalid={error}
        disabled={pending}
        className="h-9 w-20 text-right aria-invalid:border-red-400"
      />
      h
    </label>
  );
}

export function PlaythroughSection({ entryId, playthroughs }: { entryId: string; playthroughs: Playthrough[] }) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [start, setStart] = useState<PartialDateValue>({ date: null, precision: "day" });
  const [end, setEnd] = useState<PartialDateValue>({ date: null, precision: "day" });
  const [outcome, setOutcome] = useState<"" | "completed" | "dropped">("");
  const [hours, setHours] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const total = totalHours(playthroughs);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsedHours = parseHours(hours);
    if (parsedHours === undefined) return setError("Informe as horas como número, ex.: 12,5");

    startTransition(async () => {
      const result = await addPlaythrough({
        libraryEntryId: entryId,
        startedOn: start.date,
        startedPrecision: start.precision,
        finishedOn: end.date,
        finishedPrecision: end.precision,
        outcome: outcome || null,
        hours: parsedHours,
      });
      if (!result.ok) return setError(result.error);
      setError(null);
      setOpen(false);
      setStart({ date: null, precision: "day" });
      setEnd({ date: null, precision: "day" });
      setOutcome("");
      setHours("");
      setFormKey((key) => key + 1);
    });
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">Jornadas</h2>
        <div className="flex items-center gap-3">
          {total > 0 && (
            <span className="font-label text-xs tracking-[0.06em] text-muted uppercase">
              Total {formatHours(total)}
            </span>
          )}
          <Button variant="ghost" onClick={() => setOpen((value) => !value)}>
            {open ? "Cancelar" : "+ Adicionar"}
          </Button>
        </div>
      </div>

      {open && (
        <form key={formKey} onSubmit={submit} className="flex flex-col gap-3 rounded-card bg-surface-raised p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <PartialDateInput label="Início" value={start} onChange={setStart} />
            <PartialDateInput label="Fim" value={end} onChange={setEnd} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm">
              Resultado
              <select
                value={outcome}
                onChange={(event) => setOutcome(event.target.value as typeof outcome)}
                className="h-10 rounded-control border border-border bg-surface-solid px-2 text-text"
              >
                <option value="">Em andamento / sem resultado</option>
                <option value="completed">Finalizado</option>
                <option value="dropped">Abandonado</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Horas jogadas
              <Input
                value={hours}
                onChange={(event) => setHours(event.target.value)}
                inputMode="decimal"
                placeholder="Ex.: 12,5"
              />
            </label>
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}
          <Button type="submit" disabled={pending || (!start.date && !end.date)} className="self-start">
            Salvar jornada
          </Button>
        </form>
      )}

      {playthroughs.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma jornada registrada.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {playthroughs.map((playthrough) => (
            <li key={playthrough.id} className="flex flex-wrap items-center gap-3 py-2 text-sm">
              <span className="min-w-40 flex-1">
                {formatPartialDate({ date: playthrough.started_on, precision: playthrough.started_precision })}
                {" → "}
                {playthrough.finished_on
                  ? formatPartialDate({ date: playthrough.finished_on, precision: playthrough.finished_precision })
                  : "em andamento"}
              </span>
              {playthrough.outcome && <span className="text-muted">{STATUS_LABELS[playthrough.outcome]}</span>}
              <HoursField entryId={entryId} playthrough={playthrough} />
              <Button
                variant="ghost"
                aria-label="Excluir jornada"
                disabled={pending}
                onClick={() => startTransition(async () => void (await deletePlaythrough(playthrough.id, entryId)))}
              >
                ✕
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
