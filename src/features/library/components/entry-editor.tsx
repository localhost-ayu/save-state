"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GameStatus, OwnershipType } from "@/types/database";
import { removeEntry, updateEntry } from "../actions";
import { GAME_STATUSES, OWNERSHIP_LABELS, OWNERSHIP_TYPES, STATUS_LABELS } from "../constants";
import type { EntryDetail } from "../queries";
import { PlatinumTrophy } from "./platinum-trophy";

export function EntryEditor({ entry }: { entry: EntryDetail }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [platform, setPlatform] = useState(entry.platform ?? "");
  const [rating, setRating] = useState(entry.rating?.toString() ?? "");

  function save(patch: Omit<Parameters<typeof updateEntry>[0], "id">) {
    startTransition(async () => {
      const result = await updateEntry({ id: entry.id, ...patch });
      setError(result.ok ? null : result.error);
    });
  }

  function toggleOwnership(type: OwnershipType) {
    const next = entry.ownership.includes(type)
      ? entry.ownership.filter((value) => value !== type)
      : [...entry.ownership, type];
    save({ ownership: next });
  }

  function remove() {
    if (!confirm("Remover este jogo da biblioteca? Jornadas, review e diário também serão apagados.")) return;
    startTransition(async () => {
      const result = await removeEntry(entry.id);
      if (result.ok) router.push("/library");
      else setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2" disabled={pending}>
        <legend className="mb-2 text-sm font-medium">Status</legend>
        <div className="flex flex-wrap gap-2">
          {GAME_STATUSES.map((status: GameStatus) => (
            <button
              key={status}
              type="button"
              aria-pressed={entry.status === status}
              onClick={() => save({ status })}
              className="rounded-full border border-border px-3 py-1 text-sm aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accent-contrast"
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2" disabled={pending}>
        <legend className="mb-2 text-sm font-medium">Como eu tenho</legend>
        <div className="flex flex-wrap gap-2">
          {OWNERSHIP_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={entry.ownership.includes(type)}
              onClick={() => toggleOwnership(type)}
              className="rounded-full border border-border px-3 py-1 text-sm aria-pressed:border-accent aria-pressed:text-accent"
            >
              {OWNERSHIP_LABELS[type]}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          Plataforma
          <Input
            value={platform}
            onChange={(event) => setPlatform(event.target.value)}
            onBlur={() => platform !== (entry.platform ?? "") && save({ platform: platform || null })}
            placeholder="PS5, NDS, PC…"
            list="platform-suggestions"
          />
          <datalist id="platform-suggestions">
            {["PS5", "PS4", "PS3", "PS Vita", "PSP", "NDS", "3DS", "Switch", "PC", "Xbox Series", "GBA"].map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Nota (0–10)
          <Input
            type="number"
            min={0}
            max={10}
            step={0.5}
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            onBlur={() => {
              const value = rating === "" ? null : Number(rating);
              if (value !== entry.rating) save({ rating: value });
            }}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={entry.is_platinum ? "primary" : "secondary"}
          aria-pressed={entry.is_platinum}
          disabled={pending}
          onClick={() => save({ isPlatinum: !entry.is_platinum })}
        >
          <PlatinumTrophy className="size-4" /> {entry.is_platinum ? "Platinado" : "Marcar platina"}
        </Button>
        <Button
          variant={entry.is_favorite ? "primary" : "secondary"}
          aria-pressed={entry.is_favorite}
          disabled={pending}
          onClick={() => save({ isFavorite: !entry.is_favorite })}
        >
          {entry.is_favorite ? "★ Favorito" : "☆ Favoritar"}
        </Button>
        <Button variant="ghost" disabled={pending} onClick={remove} className="ml-auto">
          Remover da biblioteca
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
