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
    <Suspense fallback={<p className="text-page/70">Carregando…</p>}>
      <ProfileLoader />
    </Suspense>
  );
}
