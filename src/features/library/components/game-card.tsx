import Image from "next/image";
import Link from "next/link";
import type { LibraryEntry } from "../queries";
import { PlatinumTrophy } from "./platinum-trophy";
import { StatusBadge } from "./status-badge";

export function GameCard({ entry }: { entry: LibraryEntry }) {
  const { game } = entry;

  return (
    <Link
      href={`/games/${entry.id}`}
      className="group flex flex-col gap-2 rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-card bg-surface-raised">
        {game.cover_url ? (
          <Image
            src={game.cover_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 200px, (min-width: 640px) 25vw, 45vw"
            className="object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-3 text-center text-sm text-muted">{game.title}</div>
        )}
        {entry.is_platinum && (
          <span className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-platinum">
            <PlatinumTrophy className="size-4" />
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-2 text-sm font-medium">{game.title}</h3>
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={entry.status} />
          {entry.platform && <span className="text-xs text-muted">{entry.platform}</span>}
        </div>
      </div>
    </Link>
  );
}
