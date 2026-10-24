import type { Metadata } from "next";
import { Suspense } from "react";
import { PsnReviewItem } from "@/features/psn/components/psn-review-item";
import { ReconcileButton } from "@/features/psn/components/reconcile-button";
import { getPsnReviewQueue } from "@/features/psn/queries";

export const metadata: Metadata = { title: "Revisar PSN" };

async function ReviewQueue() {
  const { titles, pending } = await getPsnReviewQueue();

  return (
    <>
      <ReconcileButton pending={pending} />
      {titles.length === 0 ? (
        <p className="py-12 text-center text-muted">Nada para revisar.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {titles.map((title) => (
            <PsnReviewItem key={title.id} title={title} />
          ))}
        </ul>
      )}
    </>
  );
}

export default function PsnReviewPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold">Revisar importação PSN</h1>
        <p className="text-sm text-muted">
          Títulos que não tiveram correspondência exata no IGDB. Jogos importados entram na biblioteca como Backlog.
        </p>
      </div>
      <Suspense fallback={<p className="text-muted">Carregando…</p>}>
        <ReviewQueue />
      </Suspense>
    </div>
  );
}
