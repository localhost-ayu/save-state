import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Entrar" };

async function LoginFormWithRedirect({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  return (
    <>
      {error === "auth" && (
        <p role="alert" className="rounded-lg bg-surface-raised p-3 text-sm">
          O link de acesso é inválido ou já foi usado. Peça um novo abaixo e abra o link mais recente.
        </p>
      )}
      <LoginForm next={typeof next === "string" ? next : undefined} />
    </>
  );
}

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold">Entrar</h1>
        <p className="text-sm text-muted">Sem senha: você recebe um link por e-mail.</p>
      </div>
      <Suspense fallback={<LoginForm />}>
        <LoginFormWithRedirect {...props} />
      </Suspense>
    </main>
  );
}
