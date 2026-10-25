import Link from "next/link";
import { Suspense } from "react";
import { ThemeBackdrop, ThemeStyle } from "@/features/appearance/components/theme-style";
import { getMyTheme } from "@/features/appearance/queries";
import { ProfileMenu } from "@/features/profile/components/profile-menu";
import { getMyProfileSummary } from "@/features/profile/queries";

const NAV = [
  { href: "/library", label: "Biblioteca" },
  { href: "/board", label: "Kanban" },
  { href: "/timeline", label: "Linha do tempo" },
  { href: "/roulette", label: "Roleta" },
] as const;

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
    <span
      aria-hidden="true"
      className="flex h-7 w-6 items-end justify-center rounded-[4px] border-2 border-accent pb-1"
    >
      <span className="h-1.5 w-3 rounded-[1px] bg-accent" />
    </span>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={null}>
        <UserTheme />
      </Suspense>
      <header className="sticky top-0 z-20 border-x-0 border-t-0 surface text-text">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4">
          <Link href="/library" className="flex items-center gap-2.5 font-display text-lg font-bold tracking-wide">
            <SaveIcon />
            <span className="hidden sm:inline">Save State</span>
          </Link>
          <nav aria-label="Principal" className="flex flex-1 gap-1 overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-control px-3 py-2 text-sm whitespace-nowrap text-muted hover:bg-surface-raised hover:text-text"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Suspense fallback={<span aria-hidden="true" className="size-11 rounded-pill bg-surface-raised" />}>
            <UserMenu />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
