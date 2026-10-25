import Link from "next/link";
import { Suspense } from "react";
import { BottomNav, DesktopNav, MobileSectionTitle } from "@/components/app-nav";
import { ThemeBackdrop, ThemeStyle } from "@/features/appearance/components/theme-style";
import { getMyTheme } from "@/features/appearance/queries";
import { ProfileMenu } from "@/features/profile/components/profile-menu";
import { getMyProfileSummary } from "@/features/profile/queries";

async function UserTheme() {
  const theme = await getMyTheme();
  return (
    <>
      <ThemeStyle theme={theme} />
      <ThemeBackdrop theme={theme} />
    </>
  );
}

async function UserMenu() {
  const profile = await getMyProfileSummary();
  if (!profile) return null;
  return (
    <ProfileMenu username={profile.username} displayName={profile.display_name} avatarPath={profile.avatar_path} />
  );
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" className="size-7">
      <path d="M5 3h14l4 4v18H5z" fill="var(--accent)" />
      <path d="M9 3v6h8V3" fill="none" stroke="var(--accent-contrast)" strokeWidth="2" />
      <rect x="9" y="15" width="10" height="6" rx="1" fill="var(--accent-contrast)" />
    </svg>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={null}>
        <UserTheme />
      </Suspense>
      <header className="sticky top-0 z-20 border-x-0 border-t-0 surface text-text">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:h-16 sm:gap-6">
          <Link href="/library" aria-label="Save State, ir para a biblioteca" className="flex items-center gap-2.5">
            <SaveIcon />
            <span className="hidden font-display text-lg font-bold sm:inline">Save State</span>
          </Link>
          <MobileSectionTitle />
          <DesktopNav />
          <Suspense fallback={<span aria-hidden="true" className="size-11 rounded-pill bg-surface-raised" />}>
            <UserMenu />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">{children}</main>
      <BottomNav />
    </div>
  );
}
