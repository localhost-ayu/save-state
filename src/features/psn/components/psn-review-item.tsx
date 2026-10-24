"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchIgdb } from "@/features/library/actions";
import type { IgdbGame } from "@/lib/integrations/igdb/client";
import { addPsnTitleAsManual, ignorePsnTitle, linkPsnTitle } from "../actions";
import type { PsnReviewTitle } from "../queries";

export function PsnReviewItem({ title }: { title: PsnReviewTitle }) {
  const [term, setTerm] = useState(title.name.replace(/[™®©]/g, ""));
  const [results, setResults] = useState<IgdbGame[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await action();
      setError(result.ok ? null : (result.error ?? "Erro"));
    });
  }

  function search(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await searchIgdb(term);
      if (result.ok) setResults(result.data);
      setError(result.ok ? null : result.error);
    });
  }

  return (
    <li className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <div className="relative size-12 shrink-0 overflow-hidden rounded bg-surface-raised">
          {title.icon_url && <Image src={title.icon_url} alt="" fill sizes="48px" className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{title.name}</p>
          <p className="text-xs text-muted">
            {title.platforms.join(", ")} · {title.progress}% dos troféus
          </p>
        </div>
      </div>

      <form onSubmit={search} className="flex gap-2">
        <Input value={term} onChange={(event) => setTerm(event.target.value)} aria-label="Buscar no IGDB" />
        <Button type="submit" variant="secondary" disabled={pending}>
          Buscar
        </Button>
      </form>

      {results && results.length === 0 && <p className="text-sm text-muted">Nada encontrado.</p>}
      {results && results.length > 0 && (
        <ul className="flex max-h-64 flex-col divide-y divide-border overflow-y-auto">
          {results.map((game) => (
            <li key={game.igdbId} className="flex items-center gap-3 py-2">
              <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded bg-surface-raised">
                {game.coverUrl && <Image src={game.coverUrl} alt="" fill sizes="36px" className="object-cover" />}
              </div>
              <p className="min-w-0 flex-1 truncate text-sm">
                {game.title} <span className="text-muted">{game.releaseDate?.slice(0, 4)}</span>
              </p>
              <Button
                variant="secondary"
                disabled={pending}
                onClick={() => run(() => linkPsnTitle({ psnTitleId: title.id, igdbId: game.igdbId }))}
              >
                É este
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" disabled={pending} onClick={() => run(() => addPsnTitleAsManual(title.id))}>
          Adicionar com dados da PSN
        </Button>
        <Button variant="ghost" disabled={pending} onClick={() => run(() => ignorePsnTitle(title.id))}>
          Ignorar
        </Button>
        {error && (
          <span role="alert" className="text-sm text-red-500">
            {error}
          </span>
        )}
      </div>
    </li>
  );
}
