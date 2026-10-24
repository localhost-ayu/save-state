"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { connectPsn } from "../actions";

export function ConnectPsnForm({ connected }: { connected: boolean }) {
  const [npsso, setNpsso] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await connectPsn(npsso);
      setMessage(result.ok ? `Conectado como ${result.data.onlineId}. Biblioteca importada.` : result.error);
      if (result.ok) setNpsso("");
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-sm">
        NPSSO
        <Input
          value={npsso}
          onChange={(event) => setNpsso(event.target.value)}
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="64 caracteres"
        />
      </label>
      <p className="text-xs text-muted">
        Com a sessão da PlayStation aberta no navegador, acesse{" "}
        <a className="underline" href="https://ca.account.sony.com/api/v1/ssocookie" target="_blank" rel="noreferrer">
          ca.account.sony.com/api/v1/ssocookie
        </a>{" "}
        e copie o valor de <code>npsso</code>. Ele é trocado por tokens e não fica salvo.
      </p>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending || npsso.trim().length === 0}>
          {pending ? "Importando…" : connected ? "Reconectar" : "Conectar PSN"}
        </Button>
        <span role="status" className="text-sm text-muted">
          {message}
        </span>
      </div>
    </form>
  );
}
