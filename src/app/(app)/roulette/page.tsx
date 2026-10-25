import type { Metadata } from "next";
import { Suspense } from "react";
import { getLibrary } from "@/features/library/queries";
import { Roulette } from "@/features/roulette/components/roulette";

export const metadata: Metadata = { title: "Roleta" };

async function RouletteLoader() {
  return <Roulette entries={await getLibrary()} />;
}

export default function RoulettePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold">Roleta</h1>
        <p className="text-sm text-page/70">Prioridade alta tem 4× mais chance que baixa. Ajuste em cada jogo.</p>
      </div>
      <Suspense fallback={<p className="text-page/70">Carregando…</p>}>
        <RouletteLoader />
      </Suspense>
    </div>
  );
}
