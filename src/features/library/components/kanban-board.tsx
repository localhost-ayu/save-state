"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition, type ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { useLocalPreference } from "@/lib/use-local-preference";
import type { GameStatus } from "@/types/database";
import { updateEntry } from "../actions";
import { cardStats } from "../card-stats";
import { GAME_STATUSES, STATUS_LABELS } from "../constants";
import type { LibraryEntry } from "../queries";
import { AddGame } from "./add-game";
import { GameCover } from "./game-cover";
import { PlatinumTrophy } from "./platinum-trophy";
import { StatusIcon } from "./status-icon";

type Density = "full" | "compact";

const DENSITY_KEY = "save-state:kanban-density";
const COLLAPSED_KEY = "save-state:kanban-collapsed";
const DEFAULT_COLLAPSED = JSON.stringify(["shelved", "dropped"]);

const EMPTY_HINTS: Record<GameStatus, string> = {
  backlog: "Nada no backlog. Use o + para adicionar um jogo.",
  playing: "Nada em andamento. Arraste um card para cá ou gire a roleta.",
  paused: "Nada pausado.",
  shelved: "Nada congelado.",
  dropped: "Nada abandonado.",
  completed: "Nada finalizado ainda.",
};

function parseCollapsed(value: string): GameStatus[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? GAME_STATUSES.filter((status) => parsed.includes(status)) : [];
  } catch {
    return [];
  }
}

function normalize(text: string) {
  return text.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase("pt-BR");
}

function ControllerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M7.5 7h9a5 5 0 0 1 4.9 6l-.9 4.2a2.4 2.4 0 0 1-4.1 1.1L14.2 16H9.8l-2.2 2.3a2.4 2.4 0 0 1-4.1-1.1L2.6 13A5 5 0 0 1 7.5 7z" />
      <path d="M8 10.5v3M6.5 12h3M15.5 11h.01M17.5 13h.01" />
    </svg>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-9 shrink-0 items-center justify-center rounded-control text-muted hover:bg-surface-raised hover:text-text"
    >
      {children}
    </button>
  );
}

const CARD_CLASS =
  "flex touch-none flex-col gap-2.5 rounded-[calc(var(--card-radius)*0.7)] border border-border bg-surface-solid p-2.5 text-text";

function Card({ entry, density }: { entry: LibraryEntry; density: Density }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: entry.id });

  return (
    <li ref={setNodeRef} className={cn(CARD_CLASS, isDragging && "opacity-40")} {...attributes} {...listeners}>
      <CardContent entry={entry} density={density} />
    </li>
  );
}

function CardContent({ entry, density }: { entry: LibraryEntry; density: Density }) {
  const compact = density === "compact";
  const stats = cardStats(entry);
  const meta = [entry.platform, entry.game.release_date?.slice(0, 4)].filter(Boolean).join(" · ");

  return (
    <>
      <div className={cn("flex gap-3", compact && "items-center")}>
        <GameCover
          title={entry.game.title}
          coverUrl={entry.game.cover_url}
          customCoverPath={entry.custom_cover_path}
          platform={entry.platform}
          sizes={compact ? "30px" : "60px"}
          className={cn("rounded-[calc(var(--card-radius)*0.4)]", compact ? "w-[30px]" : "w-[60px]")}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start gap-1.5">
            <Link
              href={`/games/${entry.id}`}
              className={cn(
                "min-w-0 flex-1 font-display text-[15px] leading-tight font-semibold hover:underline",
                compact ? "truncate" : "line-clamp-2",
              )}
            >
              {entry.game.title}
            </Link>
            {entry.is_platinum && (
              <PlatinumTrophy className="mt-0.5 size-3.5 shrink-0 text-platinum" aria-label="Platinado" />
            )}
          </div>
          {meta && <span className="font-label text-xs text-muted">{meta}</span>}
          {compact && stats[0] && (
            <span className="font-label text-xs">
              {stats[0].value} <span className="text-muted">{stats[0].label.toLowerCase()}</span>
            </span>
          )}
        </div>
      </div>
      {!compact && stats.length > 0 && (
        <dl className="grid grid-cols-3 gap-2 border-t border-border pt-2">
          {stats.map((stat) => (
            <div key={stat.label} className="flex min-w-0 flex-col gap-0.5">
              <dt className="font-label text-[10px] leading-tight tracking-[0.08em] text-muted uppercase">
                {stat.label}
              </dt>
              <dd className="text-[13px] leading-snug font-semibold break-words">{stat.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </>
  );
}

function CollapsedColumn({ status, count, onExpand }: { status: GameStatus; count: number; onExpand: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section ref={setNodeRef} aria-label={STATUS_LABELS[status]} className="hidden shrink-0 sm:block">
      <button
        type="button"
        onClick={onExpand}
        aria-expanded={false}
        aria-label={`Expandir ${STATUS_LABELS[status]}, ${count} ${count === 1 ? "jogo" : "jogos"}`}
        title={`Expandir ${STATUS_LABELS[status]}`}
        className={cn(
          "flex min-h-52 w-14 flex-col items-center gap-3 rounded-pill surface py-4 text-text transition hover:border-border-strong",
          isOver && "ring-2 ring-accent",
        )}
      >
        <StatusIcon status={status} />
        <span className="rounded-[6px] bg-surface-raised px-1.5 py-0.5 font-label text-[11px] text-muted">{count}</span>
        <span className="rotate-180 font-label text-xs font-bold tracking-[0.1em] uppercase [writing-mode:vertical-rl]">
          {STATUS_LABELS[status]}
        </span>
      </button>
    </section>
  );
}

function Column({
  status,
  entries,
  density,
  selected,
  searching,
  onCollapse,
  onAdd,
}: {
  status: GameStatus;
  entries: LibraryEntry[];
  density: Density;
  selected: boolean;
  searching: boolean;
  onCollapse: () => void;
  onAdd?: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      aria-label={STATUS_LABELS[status]}
      className={cn(
        "w-full flex-col gap-2 rounded-card surface p-2.5 text-text transition sm:flex sm:max-h-[max(24rem,calc(100dvh-17rem))] sm:min-w-60 sm:flex-1 sm:basis-0",
        selected ? "flex" : "hidden",
        isOver && "ring-2 ring-accent",
      )}
    >
      <div className="flex h-9 items-center gap-1 pl-1.5">
        <h2 className="flex min-w-0 flex-1 items-center gap-2 font-label text-xs font-bold tracking-[0.1em] uppercase">
          <StatusIcon status={status} />
          <span className="truncate">{STATUS_LABELS[status]}</span>
          <span className="rounded-[6px] bg-surface-raised px-1.5 py-0.5 text-[11px] font-normal text-muted">
            {entries.length}
          </span>
        </h2>
        {onAdd && (
          <IconButton label="Adicionar jogo ao backlog" onClick={onAdd}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
              className="size-4"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </IconButton>
        )}
        <span className="hidden sm:inline-flex">
          <IconButton label={`Minimizar ${STATUS_LABELS[status]}`} onClick={onCollapse}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="size-4"
            >
              <path d="M9 5v14M15 9l-3 3 3 3" />
            </svg>
          </IconButton>
        </span>
      </div>
      {entries.length === 0 ? (
        <p className="rounded-[calc(var(--card-radius)*0.7)] border border-dashed border-border-strong px-3 py-6 text-center text-sm text-muted">
          {searching ? "Nada encontrado aqui." : EMPTY_HINTS[status]}
        </p>
      ) : (
        <ul className="flex [scrollbar-width:thin] flex-col gap-2 sm:-mr-1.5 sm:min-h-0 sm:overflow-y-auto sm:overscroll-contain sm:pr-1.5">
          {entries.map((entry) => (
            <Card key={entry.id} entry={entry} density={density} />
          ))}
        </ul>
      )}
    </section>
  );
}

export function KanbanBoard({ entries }: { entries: LibraryEntry[] }) {
  const router = useRouter();
  const [optimisticEntries, moveEntry] = useOptimistic(
    entries,
    (state, { id, status }: { id: string; status: GameStatus }) =>
      state.map((entry) => (entry.id === id ? { ...entry, status } : entry)),
  );
  const [densityValue, setDensity] = useLocalPreference(DENSITY_KEY, "full");
  const [collapsedValue, setCollapsed] = useLocalPreference(COLLAPSED_KEY, DEFAULT_COLLAPSED);
  const density: Density = densityValue === "compact" ? "compact" : "full";
  const collapsed = parseCollapsed(collapsedValue);
  const [mobileColumn, setMobileColumn] = useState<GameStatus>("playing");
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const term = normalize(search.trim());
  const visible = term
    ? optimisticEntries.filter((entry) => normalize(entry.game.title).includes(term))
    : optimisticEntries;
  const byStatus = (status: GameStatus) => visible.filter((entry) => entry.status === status);

  function toggleColumn(status: GameStatus, collapse: boolean) {
    const next = collapse ? [...collapsed, status] : collapsed.filter((item) => item !== status);
    setCollapsed(JSON.stringify(next));
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const titleOf = (id: string | number) => optimisticEntries.find((entry) => entry.id === id)?.game.title ?? "Jogo";
  const announcements: Announcements = {
    onDragStart: ({ active }) => `${titleOf(active.id)} selecionado.`,
    onDragOver: ({ active, over }) =>
      over ? `${titleOf(active.id)} sobre ${STATUS_LABELS[over.id as GameStatus]}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over ? `${titleOf(active.id)} movido para ${STATUS_LABELS[over.id as GameStatus]}.` : "Movimento cancelado.",
    onDragCancel: () => "Movimento cancelado.",
  };

  const activeEntry = activeId ? optimisticEntries.find((entry) => entry.id === activeId) : undefined;

  function onDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id));
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
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
    <DndContext
      id="kanban"
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
      accessibility={{ announcements }}
    >
      <div className="flex flex-wrap items-center gap-2.5 rounded-card scrim p-2.5">
        <label className="flex h-11 min-w-48 flex-1 items-center gap-2.5 rounded-control border border-border-strong bg-surface-solid px-3 text-muted">
          <span className="sr-only">Buscar no kanban</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
            className="size-[18px] shrink-0"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar no kanban…"
            className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-muted"
          />
          {term && (
            <span className="font-label text-xs whitespace-nowrap">
              {visible.length} {visible.length === 1 ? "jogo" : "jogos"}
            </span>
          )}
        </label>
        <div role="group" aria-label="Densidade dos cards" className="flex rounded-control bg-surface-solid p-1">
          {(["full", "compact"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={density === value}
              onClick={() => setDensity(value)}
              className="min-h-9 rounded-control px-3.5 text-sm text-muted aria-pressed:bg-surface-raised aria-pressed:font-semibold aria-pressed:text-text"
            >
              {value === "full" ? "Completo" : "Compacto"}
            </button>
          ))}
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Colunas"
        className="flex gap-0.5 overflow-x-auto rounded-card scrim p-1 sm:hidden"
      >
        {GAME_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={mobileColumn === status}
            onClick={() => setMobileColumn(status)}
            className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-control px-3 text-sm text-page aria-selected:bg-accent-fill aria-selected:font-semibold aria-selected:text-accent-fill-contrast"
          >
            <StatusIcon status={status} />
            {STATUS_LABELS[status]}
            <span className="font-label text-[11px] opacity-80">{byStatus(status).length}</span>
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="rounded-control scrim px-3 py-2 text-sm text-page">
          {error}
        </p>
      )}

      <div className="flex items-start gap-3 overflow-x-auto pb-4">
        {GAME_STATUSES.map((status) =>
          collapsed.includes(status) && mobileColumn !== status ? (
            <CollapsedColumn
              key={status}
              status={status}
              count={byStatus(status).length}
              onExpand={() => toggleColumn(status, false)}
            />
          ) : (
            <Column
              key={status}
              status={status}
              density={density}
              selected={mobileColumn === status}
              searching={Boolean(term)}
              entries={byStatus(status)}
              onCollapse={() => toggleColumn(status, true)}
              onAdd={status === "backlog" ? () => setAdding(true) : undefined}
            />
          ),
        )}
      </div>

      <DragOverlay>
        {activeEntry && (
          <div className={cn(CARD_CLASS, "cursor-grabbing shadow-2xl ring-2 ring-accent")}>
            <CardContent entry={activeEntry} density={density} />
          </div>
        )}
      </DragOverlay>

      <button
        type="button"
        onClick={() => setAdding(true)}
        aria-label="Adicionar jogo"
        title="Adicionar jogo"
        className="fixed right-4 bottom-[6.5rem] z-30 flex size-14 items-center justify-center rounded-pill bg-accent-fill text-accent-fill-contrast shadow-xl transition hover:scale-105 sm:right-8 sm:bottom-8"
      >
        <ControllerIcon className="size-7" />
      </button>

      <Dialog open={adding} title="Adicionar jogo ao backlog" onClose={() => setAdding(false)}>
        <AddGame tone="surface" onAdded={() => router.refresh()} />
      </Dialog>
    </DndContext>
  );
}
