"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { saveReview } from "../actions";

type Review = { body: string; is_private: boolean } | null;

export function ReviewEditor({ entryId, review }: { entryId: string; review: Review }) {
  const [body, setBody] = useState(review?.body ?? "");
  const [isPrivate, setIsPrivate] = useState(review?.is_private ?? false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = body !== (review?.body ?? "") || isPrivate !== (review?.is_private ?? false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveReview({ libraryEntryId: entryId, body, isPrivate });
      setMessage(result.ok ? "Review salva." : result.error);
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <h2 className="font-medium">Review</h2>
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={8}
        placeholder="O que você achou do jogo?"
        className="w-full rounded-control border border-border-strong bg-surface-solid p-3 text-sm leading-relaxed text-text"
      />
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isPrivate} onChange={(event) => setIsPrivate(event.target.checked)} />
          Privada
        </label>
        <Button type="submit" disabled={pending || !dirty}>
          Salvar review
        </Button>
        {message && (
          <span role="status" className="text-sm text-muted">
            {message}
          </span>
        )}
      </div>
    </form>
  );
}
