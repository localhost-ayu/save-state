"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { deleteAccount } from "../actions";

export function DeleteAccount({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const matches = confirmation.trim().toLowerCase() === username.toLowerCase();

  function close() {
    setOpen(false);
    setConfirmation("");
    setError(null);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!matches) return;
    startTransition(async () => {
      const result = await deleteAccount(confirmation);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <section aria-labelledby="delete-account" className="flex flex-col gap-3 rounded-card surface p-5 text-text">
      <h2 id="delete-account" className="font-label text-xs font-bold tracking-[0.1em] text-muted uppercase">
        Excluir conta
      </h2>
      <p className="text-sm text-muted">
        Apaga para sempre sua biblioteca, jornadas, reviews, diário, screenshots, capas, avatar e perfil público. Não dá
        para desfazer.
      </p>
      <Button variant="secondary" onClick={() => setOpen(true)} className="self-start">
        Excluir minha conta
      </Button>

      <Dialog open={open} title="Excluir conta" onClose={close}>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <p className="text-sm">
            Tudo o que você registrou no Save State será apagado agora, incluindo as imagens enviadas. Seu perfil
            público deixa de existir e o endereço /u/{username} fica livre.
          </p>
          <label className="flex flex-col gap-1.5 text-sm">
            Para confirmar, digite <strong className="font-label">{username}</strong>
            <Input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
            />
          </label>
          {error && (
            <p role="alert" className="text-sm">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={close} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!matches || pending}>
              {pending ? "Excluindo…" : "Excluir para sempre"}
            </Button>
          </div>
        </form>
      </Dialog>
    </section>
  );
}
