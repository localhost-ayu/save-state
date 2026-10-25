import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { JournalSection } from "@/features/journal/components/journal-section";
import { ReviewEditor } from "@/features/journal/components/review-editor";
import { CoverEditor } from "@/features/library/components/cover-editor";
import { EntryEditor } from "@/features/library/components/entry-editor";
import { getEntryDetail } from "@/features/library/queries";
import { PlaythroughSection } from "@/features/playthroughs/components/playthrough-section";
import { ScreenshotSection } from "@/features/screenshots/components/screenshot-section";
import { todayIso } from "@/lib/dates";

export const metadata: Metadata = { title: "Jogo" };

function Panel({ children }: { children: ReactNode }) {
  return <div className="rounded-card surface p-5 text-text">{children}</div>;
}

async function GameDetail({ params }: PageProps<"/games/[id]">) {
  const { id } = await params;
  const entry = await getEntryDetail(id);
  if (!entry) notFound();

  const { game } = entry;

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-4">
        <CoverEditor
          entryId={entry.id}
          title={game.title}
          coverUrl={game.cover_url}
          customCoverPath={entry.custom_cover_path}
        />
      </aside>

      <div className="flex min-w-0 flex-col gap-5">
        <Panel>
          <header className="flex flex-col gap-1">
            <Link href="/library" className="font-label text-xs tracking-[0.08em] text-muted uppercase hover:text-text">
              ← Memory Card
            </Link>
            <h1 className="font-display text-3xl font-bold">{game.title}</h1>
            <p className="text-sm text-muted">
              {[game.release_date?.slice(0, 4), game.franchise, game.genres.slice(0, 3).join(", ")]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {game.summary && <p className="mt-2 line-clamp-4 max-w-prose text-sm text-muted">{game.summary}</p>}
          </header>
        </Panel>
        <Panel>
          <EntryEditor entry={entry} />
        </Panel>
        <Panel>
          <PlaythroughSection entryId={entry.id} playthroughs={entry.playthroughs} />
        </Panel>
        <Panel>
          <ReviewEditor entryId={entry.id} review={entry.review} />
        </Panel>
        <Panel>
          <ScreenshotSection
            entryId={entry.id}
            screenshots={entry.screenshots}
            journalEntries={entry.journal_entries}
          />
        </Panel>
        <Panel>
          <JournalSection
            entryId={entry.id}
            entries={entry.journal_entries}
            screenshots={entry.screenshots}
            today={todayIso()}
          />
        </Panel>
      </div>
    </div>
  );
}

export default function GamePage(props: PageProps<"/games/[id]">) {
  return (
    <Suspense fallback={<p className="self-start rounded-control scrim px-3 py-2 text-page">Carregando…</p>}>
      <GameDetail {...props} />
    </Suspense>
  );
}
