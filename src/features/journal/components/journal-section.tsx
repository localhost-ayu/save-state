"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EntryDetail } from "@/features/library/queries";
import { formatPartialDate } from "@/features/timeline/lib";
import { addJournalEntry, deleteJournalEntry } from "../actions";

export function JournalSection({
  entryId,
  entries,
  today,
}: {
  entryId: string;
  entries: EntryDetail["journal_entries"];
  today: string;
}) {
  const [entryDate, setEntryDate] = useState(today);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await addJournalEntry({ libraryEntryId: entryId, entryDate, title, body, isPrivate });
      if (!result.ok) return setError(result.error);
      setError(null);
      setTitle("");
      setBody("");
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-medium">Diário</h2>

      <form onSubmit={submit} className="flex flex-col gap-2 rounded-card border border-border bg-surface p-3">
        <div className="flex gap-2">
          <Input
            type="date"
            value={entryDate}
            onChange={(event) => setEntryDate(event.target.value)}
            aria-label="Data"
            className="w-auto"
          />
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título (opcional)" />
        </div>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          placeholder="Onde parei, o que senti, o que aconteceu…"
          className="w-full rounded-lg border border-border bg-surface p-3 text-sm focus-visible:outline-2 focus-visible:outline-accent"
        />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPrivate} onChange={(event) => setIsPrivate(event.target.checked)} />
            Privado
          </label>
          <Button type="submit" disabled={pending || !body.trim()}>
            Registrar
          </Button>
          {error && (
            <span role="alert" className="text-sm text-red-500">
              {error}
            </span>
          )}
        </div>
      </form>

      {entries.length > 0 && (
        <ol className="flex flex-col gap-4 border-l border-border pl-4">
          {entries.map((entry) => (
            <li key={entry.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs text-muted">
                <time dateTime={entry.entry_date}>
                  {formatPartialDate({ date: entry.entry_date, precision: "day" })}
                </time>
                {entry.is_private && <span>· privado</span>}
                <button
                  type="button"
                  className="ml-auto hover:text-text"
                  aria-label="Excluir registro"
                  disabled={pending}
                  onClick={() =>
                    confirm("Excluir este registro?") &&
                    startTransition(async () => void (await deleteJournalEntry(entry.id, entryId)))
                  }
                >
                  ✕
                </button>
              </div>
              {entry.title && <h3 className="font-medium">{entry.title}</h3>}
              <p className="text-sm whitespace-pre-line">{entry.body}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
