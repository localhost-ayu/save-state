import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { getMyProfileSettings } from "@/features/profile/queries";

export const metadata: Metadata = { title: "Perfil" };

async function ProfileLoader() {
  const settings = await getMyProfileSettings();
  return <ProfileForm {...settings} />;
}

export default function ProfileSettingsPage() {
  return (
    <Suspense fallback={<p className="self-start rounded-control scrim px-3 py-2 text-page">Carregando…</p>}>
      <ProfileLoader />
    </Suspense>
  );
}
