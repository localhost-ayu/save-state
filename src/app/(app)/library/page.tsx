import type { Metadata } from "next";
import { Suspense } from "react";
import { AddGame } from "@/features/library/components/add-game";
import { GameCard } from "@/features/library/components/game-card";
import { LibraryFilters, type LibraryFilter } from "@/features/library/components/library-filters";
import { GAME_STATUSES } from "@/features/library/constants";
import { getLibrary } from "@/features/library/queries";

export const metadata: Metadata = { title: "Biblioteca" };

function parseFilter(value: unknown): LibraryFilter | undefined {
  if (value === "platinum") return "platinum";
  return GAME_STATUSES.find((status) => status === value);
}

async function Library({ searchParams }: PageProps<"/library">) {
  const params = await searchParams;
  const filter = parseFilter(params.status);
  const search = typeof params.q === "string" && params.q.trim() ? params.q.trim() : undefined;
  const all = await getLibrary();

  const counts = {
    all: all.length,
    platinum: all.filter((entry) => entry.is_platinum).length,
    ...Object.fromEntries(GAME_STATUSES.map((status) => [status, all.filter((e) => e.status === status).length])),
  } as Record<LibraryFilter | "all", number>;

  const term = search?.toLocaleLowerCase("pt-BR");
  const entries = all.filter(
    (entry) =>
      (!filter || (filter === "platinum" ? entry.is_platinum : entry.status === filter)) &&
      (!term || entry.game.title.toLocaleLowerCase("pt-BR").includes(term)),
  );

  return (
    <>
      <div className="flex items-baseline gap-3">
        <h1 className="font-display text-3xl font-bold">Biblioteca</h1>
        <span className="rounded-[6px] scrim px-2 py-0.5 font-label text-xs text-page-muted">
          {all.length} {all.length === 1 ? "JOGO" : "JOGOS"}
        </span>
      </div>
      <div className="flex flex-col gap-3.5 rounded-card scrim p-3.5">
        <AddGame />
        <LibraryFilters filter={filter} search={search} counts={counts} />
      </div>
      {entries.length === 0 ? (
        <div className="rounded-card scrim px-4 py-10 text-center text-page">
          {all.length === 0
            ? "Sua biblioteca está vazia. Busque um jogo na IGDB ou cadastre manualmente."
            : "Nenhum jogo com esses filtros."}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
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
    <div className="flex flex-col gap-5">
      <Suspense fallback={<p className="self-start rounded-control scrim px-3 py-2 text-page">Carregando…</p>}>
        <Library {...props} />
      </Suspense>
    </div>
  );
}
