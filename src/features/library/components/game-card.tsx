import Link from "next/link";
import type { LibraryEntry } from "../queries";
import { GameCover } from "./game-cover";
import { PlatinumTrophy } from "./platinum-trophy";
import { StatusBadge } from "./status-badge";

export function GameCard({ entry, slot }: { entry: LibraryEntry; slot: number }) {
  const { game } = entry;
  const meta = [entry.platform, game.release_date?.slice(0, 4)].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/games/${entry.id}`}
      className="group flex flex-col gap-2 rounded-card surface p-2 text-text transition hover:border-border-strong"
    >
      <div className="relative">
        <GameCover
          title={game.title}
          coverUrl={game.cover_url}
          customCoverPath={entry.custom_cover_path}
          platform={entry.platform}
          sizes="(min-width: 1024px) 190px, (min-width: 640px) 30vw, 45vw"
          className="w-full rounded-[calc(var(--card-radius)*0.6)]"
        />
        <span className="absolute top-1.5 left-1.5 rounded-[4px] bg-black/60 px-1.5 py-0.5 font-label text-[10px] tracking-[0.08em] text-white">
          SLOT {String(slot).padStart(2, "0")}
        </span>
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
        <h3 className="truncate font-display text-[15px] leading-tight font-semibold">{game.title}</h3>
        {meta && <span className="font-label text-[11px] text-muted">{meta}</span>}
        <div className="flex items-center gap-2">
          <StatusBadge status={entry.status} />
          {entry.is_favorite && (
            <span className="text-xs text-accent-text" aria-label="Favorito">
              ★
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
