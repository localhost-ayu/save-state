"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { IgdbGame } from "@/lib/integrations/igdb/client";
import { addIgdbGame, createManualGame, searchIgdb } from "../actions";

function SearchIcon() {
  return (
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
  );
}

export function AddGame({ tone = "page", onAdded }: { tone?: "page" | "surface"; onAdded?: () => void }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<IgdbGame[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function search(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await searchIgdb(term);
      if (result.ok) setResults(result.data);
      setMessage(result.ok ? (result.data.length ? null : "Nada encontrado no IGDB.") : result.error);
    });
  }

  function add(igdbId: number) {
    startTransition(async () => {
      const result = await addIgdbGame({ igdbId });
      setMessage(result.ok ? "Adicionado ao backlog." : result.error);
      if (result.ok) onAdded?.();
    });
  }

  function addManual() {
    if (!term.trim()) return setMessage("Digite o nome do jogo na busca para cadastrar manualmente.");
    startTransition(async () => {
      const result = await createManualGame({ title: term });
      setMessage(result.ok ? "Adicionado manualmente ao backlog." : result.error);
      if (result.ok) onAdded?.();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <form role="search" onSubmit={search} className="flex flex-wrap gap-2.5">
        <label className="flex h-12 min-w-56 flex-1 items-center gap-2.5 rounded-control border border-border-strong bg-surface-solid px-3.5 text-muted">
          <span className="sr-only">Buscar jogo na IGDB</span>
          <SearchIcon />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Buscar na IGDB, ex.: Hades II"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-text outline-none placeholder:text-muted"
          />
        </label>
        <Button type="submit" disabled={pending || term.trim().length < 2} className="h-12 px-6 text-[15px]">
          Buscar
        </Button>
        <Button variant="secondary" onClick={addManual} disabled={pending} className="h-12 text-[15px]">
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
          Cadastrar manualmente
        </Button>
      </form>

      {message && (
        <p role="status" className={tone === "page" ? "text-sm text-page" : "text-sm text-muted"}>
          {message}
        </p>
      )}

      {results.length > 0 && (
        <ul className="flex max-h-80 flex-col divide-y divide-border overflow-y-auto rounded-card surface px-3 text-text">
          {results.map((game) => (
            <li key={game.igdbId} className="flex items-center gap-3 py-2">
              <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-[calc(var(--card-radius)*0.4)] bg-surface-raised">
                {game.coverUrl && <Image src={game.coverUrl} alt="" fill sizes="40px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{game.title}</p>
                <p className="truncate font-label text-xs text-muted">
                  {[game.releaseDate?.slice(0, 4), game.platforms.join(", ")].filter(Boolean).join(" · ")}
                </p>
              </div>
              <Button variant="secondary" onClick={() => add(game.igdbId)} disabled={pending}>
                Adicionar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
