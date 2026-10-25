"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { IgdbGame } from "@/lib/integrations/igdb/client";
import { addIgdbGame, createManualGame, searchIgdb } from "../actions";

export function AddGame() {
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
      setMessage(result.ok ? "Adicionado à biblioteca." : result.error);
    });
  }

  function addManual() {
    startTransition(async () => {
      const result = await createManualGame({ title: term });
      setMessage(result.ok ? "Adicionado manualmente." : result.error);
    });
  }

  return (
    <section className="flex flex-col gap-3 rounded-card surface p-4 text-text">
      <form onSubmit={search} className="flex gap-2">
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Buscar jogo para adicionar…"
          aria-label="Buscar jogo"
        />
        <Button type="submit" disabled={pending || term.trim().length < 2}>
          Buscar
        </Button>
      </form>

      {results.length > 0 && (
        <ul className="flex max-h-80 flex-col divide-y divide-border overflow-y-auto">
          {results.map((game) => (
            <li key={game.igdbId} className="flex items-center gap-3 py-2">
              <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-surface-raised">
                {game.coverUrl && <Image src={game.coverUrl} alt="" fill sizes="40px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{game.title}</p>
                <p className="truncate text-xs text-muted">
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

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <span role="status">{message}</span>
        <Button variant="ghost" onClick={addManual} disabled={pending || term.trim().length === 0}>
          Não achou? Cadastrar manualmente
        </Button>
      </div>
    </section>
  );
}
