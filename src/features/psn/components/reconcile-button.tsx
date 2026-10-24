"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { reconcileNow } from "../actions";

export function ReconcileButton({ pending: pendingCount }: { pending: number }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (pendingCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-card bg-surface-raised p-3 text-sm">
      <span>{pendingCount} títulos aguardando vínculo automático.</span>
      <Button
        variant="secondary"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await reconcileNow();
            setMessage(
              result.ok ? `${result.data.linked} vinculados, ${result.data.needsReview} para revisar.` : result.error,
            );
          })
        }
      >
        {pending ? "Vinculando…" : "Vincular próximos"}
      </Button>
      {message && <span className="text-muted">{message}</span>}
    </div>
  );
}
