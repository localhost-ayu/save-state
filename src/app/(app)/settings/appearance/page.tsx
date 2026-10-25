import type { Metadata } from "next";
import { Suspense } from "react";
import { AppearanceForm } from "@/features/appearance/components/appearance-form";
import { getMyTheme } from "@/features/appearance/queries";

export const metadata: Metadata = { title: "Aparência" };

async function AppearanceLoader() {
  return <AppearanceForm saved={await getMyTheme()} />;
}

export default function AppearancePage() {
  return (
    <Suspense fallback={<p className="text-page/70">Carregando…</p>}>
      <AppearanceLoader />
    </Suspense>
  );
}
