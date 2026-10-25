"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithEmail, type LoginState } from "../actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signInWithEmail, { status: "idle" });

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next ?? ""} />
      <label className="flex flex-col gap-1.5 text-sm">
        E-mail
        <Input name="email" type="email" autoComplete="email" required placeholder="voce@exemplo.com" />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Enviando…" : "Receber link de acesso"}
      </Button>
      {state.message && (
        <p role="status" className={state.status === "error" ? "text-sm font-medium text-text" : "text-sm text-muted"}>
          {state.message}
        </p>
      )}
    </form>
  );
}
