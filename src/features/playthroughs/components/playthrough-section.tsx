"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS } from "@/features/library/constants";
import type { EntryDetail } from "@/features/library/queries";
import { formatPartialDate } from "@/features/timeline/lib";
import { addPlaythrough, deletePlaythrough } from "../actions";
import { PartialDateInput, type PartialDateValue } from "./partial-date-input";

export function PlaythroughSection({
  entryId,
  playthroughs,
}: {
  entryId: string;
  playthroughs: EntryDetail["playthroughs"];
}) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [start, setStart] = useState<PartialDateValue>({ date: null, precision: "day" });
  const [end, setEnd] = useState<PartialDateValue>({ date: null, precision: "day" });
  const [outcome, setOutcome] = useState<"" | "completed" | "dropped">("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await addPlaythrough({
        libraryEntryId: entryId,
        startedOn: start.date,
        startedPrecision: start.precision,
        finishedOn: end.date,
        finishedPrecision: end.precision,
        outcome: outcome || null,
      });
      if (!result.ok) return setError(result.error);
      setError(null);
      setOpen(false);
      setStart({ date: null, precision: "day" });
      setEnd({ date: null, precision: "day" });
      setOutcome("");
      setFormKey((key) => key + 1);
    });
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Jornadas</h2>
        <Button variant="ghost" onClick={() => setOpen((value) => !value)}>
          {open ? "Cancelar" : "+ Adicionar"}
        </Button>
      </div>

      {open && (
        <form key={formKey} onSubmit={submit} className="flex flex-col gap-3 rounded-card bg-surface-raised p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <PartialDateInput label="Início" value={start} onChange={setStart} />
            <PartialDateInput label="Fim" value={end} onChange={setEnd} />
          </div>
          <label className="flex flex-col gap-1.5 text-sm">
            Resultado
            <select
              value={outcome}
              onChange={(event) => setOutcome(event.target.value as typeof outcome)}
              className="h-10 rounded-lg border border-border bg-surface px-2"
            >
              <option value="">Em andamento / sem resultado</option>
              <option value="completed">Finalizado</option>
              <option value="dropped">Abandonado</option>
            </select>
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-500">
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
            <li key={playthrough.id} className="flex items-center gap-3 py-2 text-sm">
              <span className="flex-1">
                {formatPartialDate({ date: playthrough.started_on, precision: playthrough.started_precision })}
                {" → "}
                {playthrough.finished_on
                  ? formatPartialDate({ date: playthrough.finished_on, precision: playthrough.finished_precision })
                  : "em andamento"}
              </span>
              {playthrough.outcome && <span className="text-muted">{STATUS_LABELS[playthrough.outcome]}</span>}
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
