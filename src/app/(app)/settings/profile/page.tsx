import type { Metadata } from "next";
import { Suspense } from "react";
import { DeleteAccount } from "@/features/account/components/delete-account";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { getMyProfileSettings } from "@/features/profile/queries";

export const metadata: Metadata = { title: "Perfil" };

async function ProfileLoader() {
  const settings = await getMyProfileSettings();
  return (
    <div className="flex flex-col gap-6">
      <ProfileForm {...settings} />
      <DeleteAccount username={settings.profile.username} />
    </div>
  );
}

export default function ProfileSettingsPage() {
  return (
    <Suspense fallback={<p className="self-start rounded-control scrim px-3 py-2 text-page">Carregando…</p>}>
      <ProfileLoader />
    </Suspense>
  );
}
