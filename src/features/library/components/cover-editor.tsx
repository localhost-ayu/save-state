"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ImageCropDialog } from "@/features/media/components/image-crop-dialog";
import { removeMedia, uploadMedia } from "@/features/media/image";
import { setCustomCover } from "../actions";
import { GameCover } from "./game-cover";

type Props = { entryId: string; title: string; coverUrl: string | null; customCoverPath: string | null };

export function CoverEditor({ entryId, title, coverUrl, customCoverPath }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function save({ blob }: { blob: Blob }) {
    const path = await uploadMedia(blob, "covers");
    const result = await setCustomCover({ id: entryId, path });
    if (!result.ok) {
      await removeMedia(path);
      throw new Error(result.error);
    }
    if (customCoverPath) await removeMedia(customCoverPath);
  }

  function restore() {
    startTransition(async () => {
      const result = await setCustomCover({ id: entryId, path: null });
      if (!result.ok) return setError(result.error);
      if (customCoverPath) await removeMedia(customCoverPath);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <GameCover
        title={title}
        coverUrl={coverUrl}
        customCoverPath={customCoverPath}
        sizes="256px"
        priority
        className="w-full max-w-64 rounded-card"
      />
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Trocar capa
        </Button>
        {customCoverPath && (
          <Button variant="ghost" onClick={restore} disabled={pending}>
            Usar capa original
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-text">
          {error}
        </p>
      )}
      <ImageCropDialog
        open={open}
        title="Capa personalizada"
        aspect={3 / 4}
        maxWidth={600}
        onClose={() => setOpen(false)}
        onCropped={save}
      />
    </div>
  );
}
