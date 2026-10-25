"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EntryDetail } from "@/features/library/queries";
import { removeMedia, resizeImage, uploadMedia } from "@/features/media/image";
import { formatPartialDate } from "@/features/timeline/lib";
import { mediaUrl } from "@/lib/media";
import { addScreenshot, deleteScreenshot, updateScreenshot } from "../actions";

type Screenshot = EntryDetail["screenshots"][number];
type JournalOption = { id: string; label: string };

const MAX_SIDE = 1920;

function JournalSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: JournalOption[];
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      Registro do diário
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-control border border-border-strong bg-surface-solid px-2 text-text"
      >
        <option value="">Nenhum</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Lightbox({
  shot,
  journalOptions,
  onClose,
}: {
  shot: Screenshot;
  journalOptions: JournalOption[];
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [caption, setCaption] = useState(shot.caption ?? "");
  const [journalId, setJournalId] = useState(shot.journal_entry_id ?? "");
  const [isPrivate, setIsPrivate] = useState(shot.is_private);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => dialogRef.current?.showModal(), []);

  function save() {
    startTransition(async () => {
      const result = await updateScreenshot({ id: shot.id, caption, journalEntryId: journalId || null, isPrivate });
      if (result.ok) onClose();
      else setError(result.error);
    });
  }

  function remove() {
    if (!confirm("Excluir esta screenshot?")) return;
    startTransition(async () => {
      const result = await deleteScreenshot(shot.id);
      if (result.ok) onClose();
      else setError(result.error);
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-label="Screenshot"
      className="m-auto w-[min(64rem,calc(100vw-2rem))] rounded-card surface p-0 text-text backdrop:bg-black/80"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mediaUrl(shot.storage_path)}
        alt={shot.caption ?? ""}
        className="max-h-[70vh] w-full bg-black object-contain"
      />
      <div className="flex flex-col gap-3 p-4">
        <label className="flex flex-col gap-1.5 text-sm">
          Legenda
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            rows={2}
            className="rounded-control border border-border-strong bg-surface-solid p-2 text-text"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <JournalSelect value={journalId} onChange={setJournalId} options={journalOptions} />
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input type="checkbox" checked={isPrivate} onChange={(event) => setIsPrivate(event.target.checked)} />
            Privada
          </label>
        </div>
        {error && (
          <p role="alert" className="text-sm font-medium text-text">
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-between gap-2">
          <Button variant="ghost" onClick={remove} disabled={pending}>
            Excluir
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={pending}>
              Fechar
            </Button>
            <Button onClick={save} disabled={pending}>
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export function ScreenshotSection({
  entryId,
  screenshots,
  journalEntries,
}: {
  entryId: string;
  screenshots: Screenshot[];
  journalEntries: EntryDetail["journal_entries"];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [journalId, setJournalId] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [selected, setSelected] = useState<Screenshot | null>(null);
  const [pending, startTransition] = useTransition();

  const journalOptions = journalEntries.map((entry) => ({
    id: entry.id,
    label: `${formatPartialDate({ date: entry.entry_date, precision: "day" })}${entry.title ? ` · ${entry.title}` : ""}`,
  }));

  function upload(event: React.FormEvent) {
    event.preventDefault();
    const files = Array.from(fileRef.current?.files ?? []);
    if (files.length === 0) return;

    startTransition(async () => {
      for (const [index, file] of files.entries()) {
        setStatus(`Enviando ${index + 1} de ${files.length}…`);
        try {
          const { blob, width, height } = await resizeImage(file, MAX_SIDE);
          const path = await uploadMedia(blob, "screenshots");
          const result = await addScreenshot({
            libraryEntryId: entryId,
            path,
            caption: caption || null,
            journalEntryId: journalId || null,
            isPrivate,
            width,
            height,
          });
          if (!result.ok) {
            await removeMedia(path);
            return setStatus(result.error);
          }
        } catch (cause) {
          return setStatus(cause instanceof Error ? cause.message : "Falha no envio");
        }
      }
      setStatus(files.length === 1 ? "Screenshot adicionada." : `${files.length} screenshots adicionadas.`);
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-lg font-semibold">Screenshots</h2>

      {screenshots.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {screenshots.map((shot) => (
            <li key={shot.id}>
              <button
                type="button"
                onClick={() => setSelected(shot)}
                className="group flex w-full flex-col gap-1.5 text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaUrl(shot.storage_path)}
                  alt={shot.caption ?? "Screenshot"}
                  loading="lazy"
                  className="aspect-video w-full rounded-control bg-surface-raised object-cover transition group-hover:opacity-90"
                />
                {shot.caption && <span className="line-clamp-2 text-xs text-muted">{shot.caption}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={upload} className="flex flex-col gap-3 rounded-control border border-dashed border-border p-3">
        <label className="flex flex-col gap-1.5 text-sm">
          Imagens
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            className="text-sm file:mr-3 file:rounded-control file:border-0 file:bg-surface-raised file:px-3 file:py-2 file:text-text"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Legenda
          <Input
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="O que está acontecendo aqui?"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <JournalSelect value={journalId} onChange={setJournalId} options={journalOptions} />
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input type="checkbox" checked={isPrivate} onChange={(event) => setIsPrivate(event.target.checked)} />
            Privadas
          </label>
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            Enviar
          </Button>
          {status && (
            <span role="status" className="text-sm text-muted">
              {status}
            </span>
          )}
        </div>
      </form>

      {selected && (
        <Lightbox key={selected.id} shot={selected} journalOptions={journalOptions} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
