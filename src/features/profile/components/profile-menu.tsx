"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/features/auth/actions";
import { mediaUrl } from "@/lib/media";

type Props = { username: string; displayName: string | null; avatarPath: string | null };

const itemClass =
  "flex w-full items-center rounded-control px-3 py-2.5 text-left text-sm text-text hover:bg-surface-raised focus-visible:bg-surface-raised focus-visible:outline-none";

export function ProfileMenu({ username, displayName, avatarPath }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const name = displayName ?? username;

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Menu de ${name}`}
        onClick={() => setOpen((value) => !value)}
        className="flex size-11 items-center justify-center overflow-hidden rounded-pill border-2 border-border bg-surface-raised font-display font-bold text-text hover:border-accent focus-visible:outline-2 focus-visible:outline-accent"
      >
        {avatarPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(avatarPath)} alt="" className="size-full object-cover" />
        ) : (
          name.slice(0, 1).toUpperCase()
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Conta"
          className="absolute top-full right-0 z-30 mt-2 flex w-60 flex-col gap-0.5 rounded-card border border-border bg-surface-solid p-1.5 text-text shadow-xl"
        >
          <div className="flex flex-col px-3 py-2">
            <span className="truncate font-medium">{name}</span>
            <span className="truncate font-label text-xs text-muted">@{username}</span>
          </div>
          <Link role="menuitem" href={`/u/${username}`} className={itemClass} onClick={() => setOpen(false)}>
            Ver meu perfil
          </Link>
          <Link role="menuitem" href="/settings/profile" className={itemClass} onClick={() => setOpen(false)}>
            Editar perfil
          </Link>
          <Link role="menuitem" href="/settings/appearance" className={itemClass} onClick={() => setOpen(false)}>
            Aparência
          </Link>
          <form action={signOut} className="border-t border-border pt-1">
            <button role="menuitem" type="submit" className={itemClass}>
              Sair
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
