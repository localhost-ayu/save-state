"use client";

import { useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { cropImage } from "../image";

type Props = {
  open: boolean;
  title: string;
  aspect: number;
  maxWidth: number;
  cropShape?: "rect" | "round";
  onClose: () => void;
  onCropped: (result: { blob: Blob; width: number; height: number }) => Promise<void>;
};

export function ImageCropDialog({ open, title, aspect, maxWidth, cropShape = "rect", onClose, onCropped }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => () => void (source && URL.revokeObjectURL(source)), [source]);

  function pick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSource(URL.createObjectURL(file));
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setError(null);
  }

  async function save() {
    if (!source || !area) return;
    setSaving(true);
    try {
      await onCropped(await cropImage(source, area, maxWidth));
      setSource(null);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erro ao salvar a imagem");
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="crop-title"
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-card surface p-0 text-text backdrop:bg-black/70"
    >
      <div className="flex flex-col gap-4 p-5">
        <h2 id="crop-title" className="font-display text-lg font-semibold">
          {title}
        </h2>

        <label className="flex flex-col gap-1.5 text-sm">
          Imagem
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            onChange={pick}
            className="text-sm file:mr-3 file:rounded-control file:border-0 file:bg-surface-raised file:px-3 file:py-2 file:text-text"
          />
        </label>

        {source && (
          <>
            <div className="relative h-80 overflow-hidden rounded-control bg-black">
              <Cropper
                image={source}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                cropShape={cropShape}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setArea(pixels)}
              />
            </div>
            <label className="flex items-center gap-3 text-sm">
              Zoom
              <input
                type="range"
                min={1}
                max={4}
                step={0.01}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="flex-1 accent-[var(--accent)]"
              />
            </label>
          </>
        )}

        {error && (
          <p role="alert" className="text-sm font-medium text-text">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={!source || !area || saving}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
