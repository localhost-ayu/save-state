"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import Link from "next/link";
import { useOptimistic, useState, useSyncExternalStore, useTransition } from "react";
import { formatHours, totalHours } from "@/features/playthroughs/lib";
import { formatPartialDate } from "@/features/timeline/lib";
import { cn } from "@/lib/cn";
import type { GameStatus } from "@/types/database";
import { updateEntry } from "../actions";
import { GAME_STATUSES, STATUS_LABELS } from "../constants";
import type { LibraryEntry } from "../queries";
import { GameCover } from "./game-cover";
import { PlatinumTrophy } from "./platinum-trophy";

type Density = "full" | "compact";

const DENSITY_KEY = "save-state:kanban-density";
const DENSITY_EVENT = "save-state:kanban-density";

function readDensity(): Density {
  try {
    return localStorage.getItem(DENSITY_KEY) === "compact" ? "compact" : "full";
  } catch {
    return "full";
  }
}

function subscribeDensity(onChange: () => void) {
  window.addEventListener(DENSITY_EVENT, onChange);
  return () => window.removeEventListener(DENSITY_EVENT, onChange);
}

function latestPlaythrough(entry: LibraryEntry) {
  return [...entry.playthroughs].sort((a, b) => (b.started_on ?? "").localeCompare(a.started_on ?? ""))[0];
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="font-label text-[10px] tracking-[0.08em] text-muted uppercase">{label}</dt>
      <dd className="text-xs">{value}</dd>
    </div>
  );
}

function Card({ entry, density }: { entry: LibraryEntry; density: Density }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: entry.id });
  const playthrough = latestPlaythrough(entry);
  const hours = totalHours(entry.playthroughs);
  const releaseYear = entry.game.release_date?.slice(0, 4);
  const compact = density === "compact";

  return (
    <li
      ref={setNodeRef}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      className={cn(
        "flex touch-none gap-3 rounded-control border border-border bg-surface-solid p-2.5 text-text shadow-sm",
        isDragging && "relative z-10 opacity-80 shadow-lg",
      )}
      {...attributes}
      {...listeners}
    >
      <GameCover
        title={entry.game.title}
        coverUrl={entry.game.cover_url}
        customCoverPath={entry.custom_cover_path}
        sizes={compact ? "32px" : "64px"}
        className={cn("rounded-[calc(var(--card-radius)*0.4)]", compact ? "w-8" : "w-16")}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start gap-1.5">
          <Link
            href={`/games/${entry.id}`}
            className={cn(
              "min-w-0 flex-1 leading-tight font-medium hover:underline",
              compact ? "truncate text-sm" : "line-clamp-2 text-sm",
            )}
          >
            {entry.game.title}
          </Link>
          {entry.is_platinum && <PlatinumTrophy className="mt-0.5 size-3.5 shrink-0 text-platinum" />}
        </div>
        {!compact && (
          <>
            <span className="text-xs text-muted">{[entry.platform, releaseYear].filter(Boolean).join(" · ")}</span>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {playthrough?.started_on && (
                <Meta
                  label="Início"
                  value={formatPartialDate({ date: playthrough.started_on, precision: playthrough.started_precision })}
                />
              )}
              {hours > 0 && <Meta label="Tempo" value={formatHours(hours)} />}
              {entry.expectation !== null && <Meta label="Expectativa" value={`${entry.expectation}/10`} />}
              {entry.rating !== null && <Meta label="Nota" value={`${entry.rating}/10`} />}
            </dl>
          </>
        )}
      </div>
    </li>
  );
}

function Column({ status, entries, density }: { status: GameStatus; entries: LibraryEntry[]; density: Density }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section className={cn("flex shrink-0 snap-start flex-col gap-2", density === "compact" ? "w-60" : "w-72")}>
      <h2 className="flex items-center justify-between font-label text-xs tracking-[0.08em] uppercase">
        {STATUS_LABELS[status]}
        <span className="opacity-70">{entries.length}</span>
      </h2>
      <ul
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 rounded-card surface p-2 transition",
          isOver && "ring-2 ring-accent",
        )}
      >
        {entries.map((entry) => (
          <Card key={entry.id} entry={entry} density={density} />
        ))}
      </ul>
    </section>
  );
}

export function KanbanBoard({ entries }: { entries: LibraryEntry[] }) {
  const [optimisticEntries, moveEntry] = useOptimistic(
    entries,
    (state, { id, status }: { id: string; status: GameStatus }) =>
      state.map((entry) => (entry.id === id ? { ...entry, status } : entry)),
  );
  const density = useSyncExternalStore(subscribeDensity, readDensity, () => "full" as const);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function changeDensity(next: Density) {
    try {
      localStorage.setItem(DENSITY_KEY, next);
    } catch {}
    window.dispatchEvent(new Event(DENSITY_EVENT));
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  function onDragEnd({ active, over }: DragEndEvent) {
    const status = over?.id as GameStatus | undefined;
    const entry = optimisticEntries.find((item) => item.id === active.id);
    if (!status || !entry || entry.status === status) return;

    startTransition(async () => {
      moveEntry({ id: entry.id, status });
      const result = await updateEntry({ id: entry.id, status });
      setError(result.ok ? null : result.error);
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div
        role="group"
        aria-label="Densidade dos cards"
        className="flex self-start rounded-control surface p-1 text-text"
      >
        {(["full", "compact"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={density === value}
            onClick={() => changeDensity(value)}
            className="rounded-control px-3 py-1.5 text-sm text-muted aria-pressed:bg-surface-raised aria-pressed:text-text"
          >
            {value === "full" ? "Completo" : "Compacto"}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <div className="flex snap-x gap-4 overflow-x-auto pb-4">
        {GAME_STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            density={density}
            entries={optimisticEntries.filter((entry) => entry.status === status)}
          />
        ))}
      </div>
    </DndContext>
  );
}
