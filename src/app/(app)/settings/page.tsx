import type { Metadata } from "next";
import { Suspense } from "react";
import { ConnectPsnForm } from "@/features/psn/components/connect-psn-form";
import { getPsnConnection } from "@/features/psn/queries";

export const metadata: Metadata = { title: "Ajustes" };

const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" });

async function PsnSection() {
  const { account, lastRun } = await getPsnConnection();

  return (
    <div className="flex flex-col gap-4">
      {account && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted">Conta</dt>
          <dd>{account.display_name}</dd>
          <dt className="text-muted">Última sincronização</dt>
          <dd>{account.last_synced_at ? dateFormat.format(new Date(account.last_synced_at)) : "—"}</dd>
          {lastRun?.status === "failed" && (
            <>
              <dt className="text-muted">Erro</dt>
              <dd className="text-red-500">{lastRun.error}</dd>
            </>
          )}
        </dl>
      )}
      <ConnectPsnForm connected={Boolean(account)} />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold">Ajustes</h1>
      <section className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
        <h2 className="font-medium">PlayStation Network</h2>
        <Suspense fallback={<p className="text-sm text-muted">Carregando…</p>}>
          <PsnSection />
        </Suspense>
      </section>
    </div>
  );
}
