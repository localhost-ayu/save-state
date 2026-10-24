import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({ title, updatedAt, children }: { title: string; updatedAt: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <Link href="/" className="text-sm text-muted hover:text-text">
        ← Início
      </Link>
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        <p className="text-sm text-muted">Última atualização: {updatedAt}</p>
      </header>
      <div className="flex flex-col gap-6 text-sm leading-relaxed [&_a]:underline [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-2 [&_ul]:mt-2 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1">
        {children}
      </div>
    </main>
  );
}
