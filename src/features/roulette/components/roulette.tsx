"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateEntry } from "@/features/library/actions";
import { GameCover } from "@/features/library/components/game-cover";
import { StatusBadge } from "@/features/library/components/status-badge";
import { GAME_STATUSES, PRIORITY_LABELS, STATUS_LABELS } from "@/features/library/constants";
import type { LibraryEntry } from "@/features/library/queries";
import { cn } from "@/lib/cn";
import type { GameStatus } from "@/types/database";
import { DEFAULT_ROULETTE_STATUSES, chanceOf, filterCandidates, pickWeighted } from "../lib";

const SPIN_STEPS = 18;

export function Roulette({ entries }: { entries: LibraryEntry[] }) {
  const [statuses, setStatuses] = useState<GameStatus[]>(DEFAULT_ROULETTE_STATUSES);
  const [platform, setPlatform] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<LibraryEntry | null>(null);
  const [result, setResult] = useState<LibraryEntry | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const platforms = useMemo(
    () => [...new Set(entries.map((entry) => entry.platform).filter((p): p is string => Boolean(p)))].sort(),
    [entries],
  );
  const candidates = filterCandidates(entries, { statuses, platform });

  function toggleStatus(status: GameStatus) {
    setStatuses((current) =>
      current.includes(status) ? current.filter((value) => value !== status) : [...current, status],
    );
    setResult(null);
  }

  function spin() {
    const winner = pickWeighted(candidates);
    if (!winner) return;
    setResult(null);
    setMessage(null);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || candidates.length === 1) {
      setHighlight(winner);
      setResult(winner);
      return;
    }

    setSpinning(true);
    let step = 0;
    const tick = () => {
      step += 1;
      const done = step >= SPIN_STEPS;
      setHighlight(done ? winner : candidates[Math.floor(Math.random() * candidates.length)]);
      if (done) {
        setSpinning(false);
        setResult(winner);
        return;
      }
      timer.current = setTimeout(tick, 50 + step * step * 1.2);
    };
    tick();
  }

  function start(entry: LibraryEntry) {
    startTransition(async () => {
      const response = await updateEntry({ id: entry.id, status: "playing" });
      setMessage(response.ok ? "Boa aventura! O jogo foi marcado como Iniciado." : response.error);
    });
  }

  const shown = result ?? highlight;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="flex flex-col gap-5 rounded-card surface p-5 text-text">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-label text-xs tracking-[0.08em] text-muted uppercase">Sortear entre</legend>
          <div className="flex flex-wrap gap-2">
            {GAME_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                aria-pressed={statuses.includes(status)}
                onClick={() => toggleStatus(status)}
                disabled={spinning}
                className="rounded-pill border border-border px-3 py-1.5 text-sm aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accent-contrast"
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="flex max-w-xs flex-col gap-1.5 text-sm">
          Plataforma
          <select
            value={platform ?? ""}
            onChange={(event) => setPlatform(event.target.value || null)}
            disabled={spinning}
            className="h-10 rounded-control border border-border bg-surface-solid px-2 text-text"
          >
            <option value="">Todas</option>
            {platforms.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap items-center gap-4">
          <Button
            onClick={spin}
            disabled={spinning || candidates.length === 0}
            className="h-12 px-8 font-label tracking-wider"
          >
            {spinning ? "GIRANDO…" : "SORTEAR"}
          </Button>
          <span className="text-sm text-muted">
            {candidates.length === 0
              ? "Nenhum jogo com esses filtros."
              : `${candidates.length} ${candidates.length === 1 ? "jogo concorrendo" : "jogos concorrendo"}`}
          </span>
        </div>

        {candidates.length > 0 && (
          <ul className="flex flex-col divide-y divide-border text-sm" aria-label="Chances">
            {candidates.map((entry) => (
              <li
                key={entry.id}
                className={cn("flex items-center gap-3 py-2", highlight?.id === entry.id && "text-accent")}
              >
                <span className="min-w-0 flex-1 truncate">{entry.game.title}</span>
                <span className="text-xs text-muted">{PRIORITY_LABELS[entry.priority]}</span>
                <span className="w-12 text-right font-label text-xs">
                  {Math.round(chanceOf(entry, candidates) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        aria-live="polite"
        className={cn(
          "flex flex-col items-center gap-4 rounded-card surface p-6 text-center text-text",
          result && "border-accent",
        )}
      >
        {shown ? (
          <>
            <GameCover
              title={shown.game.title}
              coverUrl={shown.game.cover_url}
              customCoverPath={shown.custom_cover_path}
              sizes="224px"
              className={cn("w-56 rounded-card transition", spinning && "scale-95 opacity-80")}
            />
            <div className="flex flex-col items-center gap-2">
              <span className="font-label text-xs tracking-[0.08em] text-accent uppercase">
                {result ? "Sua próxima aventura" : "…"}
              </span>
              <h2 className="font-display text-2xl font-bold">{shown.game.title}</h2>
              {result && <StatusBadge status={result.status} />}
            </div>
            {result && (
              <div className="flex flex-wrap justify-center gap-2">
                {result.status !== "playing" && (
                  <Button onClick={() => start(result)} disabled={pending}>
                    Começar agora
                  </Button>
                )}
                <Link
                  href={`/games/${result.id}`}
                  className="inline-flex h-10 items-center rounded-control bg-surface-raised px-4 text-sm font-medium"
                >
                  Abrir jogo
                </Link>
              </div>
            )}
            {message && <p className="text-sm text-muted">{message}</p>}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16">
            <span className="font-display text-xl font-bold">Qual a próxima aventura?</span>
            <span className="text-sm text-muted">Escolha os status e gire.</span>
          </div>
        )}
      </section>
    </div>
  );
}
