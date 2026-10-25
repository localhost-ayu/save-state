"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/features/auth/actions";
import { mediaUrl } from "@/lib/media";

type Props = { username: string; displayName: string | null; avatarPath: string | null };

const itemClass =
  "flex min-h-13 w-full items-center rounded-control px-3 text-left text-[15px] text-text hover:bg-surface-raised focus-visible:bg-surface-raised sm:min-h-11 sm:text-sm";

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
        className="flex size-11 items-center justify-center overflow-hidden rounded-pill border-2 border-border bg-surface-raised font-display font-bold text-text hover:border-accent"
      >
        {avatarPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(avatarPath)} alt="" className="size-full object-cover" />
        ) : (
          name.slice(0, 1).toUpperCase()
        )}
      </button>

      {open && <div aria-hidden="true" className="fixed inset-0 z-30 bg-black/50 sm:hidden" />}
      {open && (
        <div
          role="menu"
          aria-label="Conta"
          className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-0.5 rounded-t-card border border-border bg-surface-solid p-3 pb-[max(1rem,env(safe-area-inset-bottom))] text-text shadow-2xl sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:bottom-auto sm:mt-2 sm:w-64 sm:rounded-card sm:p-1.5"
        >
          <span aria-hidden="true" className="mx-auto mb-2 h-1 w-10 rounded-full bg-border-strong sm:hidden" />
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
