import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { GameCover } from "@/features/library/components/game-cover";
import { PlatinumTrophy } from "@/features/library/components/platinum-trophy";
import { finishedOn, groupFinishedByYear } from "@/features/library/finished";
import { getLibrary } from "@/features/library/queries";
import { formatHours, totalHours } from "@/features/playthroughs/lib";
import { formatPartialDate } from "@/features/timeline/lib";

export const metadata: Metadata = { title: "Finalizados" };

async function Gallery() {
  const entries = await getLibrary({ status: "completed" });
  const years = groupFinishedByYear(entries);

  if (years.length === 0) {
    return (
      <div className="rounded-card scrim px-4 py-10 text-center text-page">
        Nenhum jogo finalizado ainda. Quando você zerar um, ele aparece aqui.
      </div>
    );
  }

  return years.map(({ year, entries: group, hours }) => (
    <section key={year} aria-labelledby={`year-${year}`} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 self-start rounded-control scrim px-3 py-1.5">
        <h2 id={`year-${year}`} className="font-display text-2xl font-bold text-page">
          {year}
        </h2>
        <span className="font-label text-xs tracking-[0.08em] text-page-muted uppercase">
          {group.length} {group.length === 1 ? "jogo" : "jogos"}
          {hours > 0 && ` · ${formatHours(hours)}`}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
        {group.map((entry) => {
          const hoursPlayed = totalHours(entry.playthroughs);
          const facts = [
            entry.rating != null && `${String(entry.rating).replace(".", ",")}/10`,
            hoursPlayed > 0 && formatHours(hoursPlayed),
          ].filter(Boolean);
          return (
            <li key={entry.id}>
              <Link
                href={`/games/${entry.id}`}
                className="flex h-full flex-col gap-2 rounded-card surface p-2 text-text transition hover:border-border-strong"
              >
                <div className="relative">
                  <GameCover
                    title={entry.game.title}
                    coverUrl={entry.game.cover_url}
                    customCoverPath={entry.custom_cover_path}
                    platform={entry.platform}
                    sizes="(min-width: 1024px) 190px, (min-width: 640px) 23vw, 45vw"
                    className="w-full rounded-[calc(var(--card-radius)*0.6)]"
                  />
                  {entry.is_platinum && (
                    <span
                      className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-platinum"
                      aria-label="Platinado"
                    >
                      <PlatinumTrophy className="size-3.5" />
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 px-1 pb-1">
                  <h3 className="truncate font-display text-[15px] leading-tight font-semibold">{entry.game.title}</h3>
                  <span className="font-label text-[11px] text-muted">{formatPartialDate(finishedOn(entry))}</span>
                  {facts.length > 0 && <span className="text-[13px] font-semibold">{facts.join(" · ")}</span>}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  ));
}

export default function FinishedPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-bold">Finalizados</h1>
        <Link href="/library" className="rounded-control scrim px-3 py-1.5 text-sm text-page-muted hover:text-page">
          ← Biblioteca
        </Link>
      </div>
      <Suspense fallback={<p className="self-start rounded-control scrim px-3 py-2 text-page">Carregando…</p>}>
        <Gallery />
      </Suspense>
    </div>
  );
}
