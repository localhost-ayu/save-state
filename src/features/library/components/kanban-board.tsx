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
import { useOptimistic, useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import type { GameStatus } from "@/types/database";
import { updateEntry } from "../actions";
import { GAME_STATUSES, STATUS_LABELS } from "../constants";
import type { LibraryEntry } from "../queries";
import { PlatinumTrophy } from "./platinum-trophy";

function Card({ entry }: { entry: LibraryEntry }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: entry.id });

  return (
    <li
      ref={setNodeRef}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      className={cn(
        "flex touch-none items-center gap-2 rounded-lg bg-surface p-3 text-sm shadow-sm",
        isDragging && "relative z-10 opacity-80 shadow-lg",
      )}
      {...attributes}
      {...listeners}
    >
      <Link href={`/games/${entry.id}`} className="min-w-0 flex-1 truncate hover:underline">
        {entry.game.title}
      </Link>
      {entry.is_platinum && <PlatinumTrophy className="size-3.5 shrink-0 text-platinum" />}
    </li>
  );
}

function Column({ status, entries }: { status: GameStatus; entries: LibraryEntry[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section className="flex w-64 shrink-0 snap-start flex-col gap-2">
      <h2 className="flex items-center justify-between text-sm font-medium">
        {STATUS_LABELS[status]}
        <span className="text-muted">{entries.length}</span>
      </h2>
      <ul
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 rounded-card bg-surface-raised p-2 transition",
          isOver && "ring-2 ring-accent",
        )}
      >
        {entries.map((entry) => (
          <Card key={entry.id} entry={entry} />
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
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

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
      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
      <div className="flex snap-x gap-4 overflow-x-auto pb-4">
        {GAME_STATUSES.map((status) => (
          <Column key={status} status={status} entries={optimisticEntries.filter((entry) => entry.status === status)} />
        ))}
      </div>
    </DndContext>
  );
}
