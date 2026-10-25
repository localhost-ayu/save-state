import Link from "next/link";
import type { LibraryEntry } from "../queries";
import { GameCover } from "./game-cover";
import { PlatinumTrophy } from "./platinum-trophy";
import { StatusBadge } from "./status-badge";

export function GameCard({ entry, slot }: { entry: LibraryEntry; slot: number }) {
  const { game } = entry;

  return (
    <Link
      href={`/games/${entry.id}`}
      className="group flex gap-4 rounded-card surface p-3.5 text-text transition hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <GameCover
        title={game.title}
        coverUrl={game.cover_url}
        customCoverPath={entry.custom_cover_path}
        sizes="80px"
        className="w-[4.5rem] rounded-control"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="font-label text-[11px] tracking-[0.08em] text-muted uppercase">
          Slot {String(slot).padStart(2, "0")}
          {entry.platform && ` · ${entry.platform}`}
        </span>
        <h3 className="line-clamp-2 leading-tight font-medium">{game.title}</h3>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <StatusBadge status={entry.status} />
          {entry.is_platinum && (
            <span className="inline-flex items-center gap-1 text-xs text-platinum">
              <PlatinumTrophy className="size-3.5" /> Platinado
            </span>
          )}
          {entry.is_favorite && (
            <span className="text-xs text-accent" aria-label="Favorito">
              ★
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
