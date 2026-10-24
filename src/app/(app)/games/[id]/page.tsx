import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JournalSection } from "@/features/journal/components/journal-section";
import { ReviewEditor } from "@/features/journal/components/review-editor";
import { EntryEditor } from "@/features/library/components/entry-editor";
import { getEntryDetail } from "@/features/library/queries";
import { PlaythroughSection } from "@/features/playthroughs/components/playthrough-section";
import { todayIso } from "@/lib/dates";

async function GameDetail({ params }: PageProps<"/games/[id]">) {
  const { id } = await params;
  const entry = await getEntryDetail(id);
  if (!entry) notFound();

  const { game } = entry;

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      <aside className="flex flex-col gap-4">
        <div className="relative aspect-[3/4] w-full max-w-64 overflow-hidden rounded-card bg-surface-raised">
          {game.cover_url ? (
            <Image src={game.cover_url} alt="" fill sizes="256px" className="object-cover" priority />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center text-muted">{game.title}</div>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-col gap-8">
        <header className="flex flex-col gap-1">
          <Link href="/library" className="text-sm text-muted hover:text-text">
            ← Biblioteca
          </Link>
          <h1 className="font-display text-3xl font-semibold">{game.title}</h1>
          <p className="text-sm text-muted">
            {[game.release_date?.slice(0, 4), game.franchise, game.genres.slice(0, 3).join(", ")]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {game.summary && <p className="mt-2 line-clamp-4 max-w-prose text-sm text-muted">{game.summary}</p>}
        </header>

        <EntryEditor entry={entry} />
        <PlaythroughSection entryId={entry.id} playthroughs={entry.playthroughs} />
        <ReviewEditor entryId={entry.id} review={entry.review} />
        <JournalSection entryId={entry.id} entries={entry.journal_entries} today={todayIso()} />
      </div>
    </div>
  );
}

export default function GamePage(props: PageProps<"/games/[id]">) {
  return (
    <Suspense fallback={<p className="text-muted">Carregando…</p>}>
      <GameDetail {...props} />
    </Suspense>
  );
}
