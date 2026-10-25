import type { Metadata } from "next";
import { Suspense } from "react";
import { GAME_STATUSES } from "@/features/library/constants";
import { AddGame } from "@/features/library/components/add-game";
import { GameCard } from "@/features/library/components/game-card";
import { LibraryFilters } from "@/features/library/components/library-filters";
import { getLibrary } from "@/features/library/queries";
import type { GameStatus } from "@/types/database";

export const metadata: Metadata = { title: "Biblioteca" };

function parseStatus(value: unknown): GameStatus | undefined {
  return GAME_STATUSES.find((status) => status === value);
}

async function Library({ searchParams }: PageProps<"/library">) {
  const params = await searchParams;
  const status = parseStatus(params.status);
  const search = typeof params.q === "string" && params.q.trim() ? params.q.trim() : undefined;
  const entries = await getLibrary({ status, search });

  return (
    <>
      <LibraryFilters status={status} search={search} />
      {entries.length === 0 ? (
        <p className="py-12 text-center text-muted">
          {status || search ? "Nenhum jogo com esses filtros." : "Sua biblioteca está vazia. Busque um jogo acima."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry, index) => (
            <GameCard key={entry.id} entry={entry} slot={index + 1} />
          ))}
        </div>
      )}
    </>
  );
}

export default function LibraryPage(props: PageProps<"/library">) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">Memory Card</h1>
        <span className="font-label text-xs tracking-[0.08em] text-page/70 uppercase">Biblioteca</span>
      </div>
      <AddGame />
      <Suspense fallback={<p className="text-muted">Carregando…</p>}>
        <Library {...props} />
      </Suspense>
    </div>
  );
}
