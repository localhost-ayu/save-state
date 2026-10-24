import type { Metadata } from "next";
import { Suspense } from "react";
import { KanbanBoard } from "@/features/library/components/kanban-board";
import { getLibrary } from "@/features/library/queries";

export const metadata: Metadata = { title: "Kanban" };

async function Board() {
  return <KanbanBoard entries={await getLibrary()} />;
}

export default function BoardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold">Kanban</h1>
      <Suspense fallback={<p className="text-muted">Carregando…</p>}>
        <Board />
      </Suspense>
    </div>
  );
}
