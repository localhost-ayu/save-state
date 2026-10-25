import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ThemeBackdrop, ThemeStyle } from "@/features/appearance/components/theme-style";
import { CopyLinkButton } from "@/features/profile/components/copy-link-button";
import { ProfileSections } from "@/features/profile/components/profile-sections";
import { getPublicProfile, type PublicProfile } from "@/features/profile/queries";
import { todayIso } from "@/lib/dates";
import { mediaUrl } from "@/lib/media";

const MONTHS = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

export async function generateMetadata({ params }: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function ProfileCard({ data }: { data: PublicProfile }) {
  const { profile, totals } = data;
  const name = profile.display_name ?? profile.username;
  const since = `${MONTHS[Number(profile.created_at.slice(5, 7)) - 1]} ${profile.created_at.slice(0, 4)}`;

  return (
    <div className="overflow-hidden rounded-card surface text-text">
      <div className="relative aspect-[12/5] bg-accent">
        {profile.banner_path && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(profile.banner_path)} alt="" className="size-full object-cover" />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent"
        />
      </div>
      <div className="flex flex-col gap-3.5 px-6 pb-6">
        <div className="relative -mt-12 size-24 overflow-hidden rounded-full bg-surface-raised ring-4 ring-surface-solid">
          {profile.avatar_path ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(profile.avatar_path)} alt={`Foto de ${name}`} className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center font-display text-4xl font-bold">
              {name.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[2.5rem] leading-none font-bold tracking-tight">{name}</h1>
          <span className="font-label text-[13px] text-muted">@{profile.username}</span>
        </div>
        {profile.tagline && (
          <p className="self-start rounded-pill bg-accent-fill px-3 py-1.5 text-sm font-semibold text-accent-fill-contrast">
            {profile.tagline}
          </p>
        )}
        {profile.bio && <p className="text-[15px] leading-relaxed whitespace-pre-line">{profile.bio}</p>}
        <dl className="grid grid-cols-3 gap-2 border-y border-border py-3">
          {[
            ["Jogos", totals.games],
            ["Finalizados", totals.finished],
            ["Platinas", totals.platinums],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col-reverse">
              <dt className="font-label text-[10px] tracking-[0.1em] text-muted uppercase">{label}</dt>
              <dd className="font-display text-[1.375rem] font-bold">{value}</dd>
            </div>
          ))}
        </dl>
        {profile.links.length > 0 && (
          <ul className="flex flex-col gap-2">
            {profile.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  rel="noopener noreferrer me"
                  target="_blank"
                  className="flex min-h-11 items-center gap-2.5 rounded-control border border-border-strong bg-surface-solid px-3.5 text-[15px] hover:bg-surface-raised"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="size-4"
                  >
                    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
                  </svg>
                  {link.label}
                  <span className="ml-auto font-label text-xs text-muted">{host(link.url)}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="font-label text-[11px] tracking-[0.08em] text-muted">NO SAVE STATE DESDE {since}</p>
      </div>
    </div>
  );
}

function OwnerBar({ isPublic }: { isPublic: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-1 self-center rounded-pill surface py-1 pr-1 pl-4 text-sm text-text">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-4 text-muted"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span className="px-2">
        {isPublic ? "Você está vendo seu perfil público" : "Seu perfil está privado: só você vê esta página"}
      </span>
      <Link
        href="/settings/profile"
        className="flex min-h-11 items-center rounded-pill bg-accent-fill px-4 font-semibold text-accent-fill-contrast"
      >
        Editar perfil
      </Link>
      {isPublic && <CopyLinkButton />}
    </div>
  );
}

async function Profile({ params }: PageProps<"/u/[username]">) {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) notFound();

  return (
    <>
      <ThemeStyle theme={data.profile.theme} />
      <ThemeBackdrop theme={data.profile.theme} />
      {data.isOwner && <OwnerBar isPublic={data.profile.is_public} />}
      <div className="grid items-start gap-6 lg:grid-cols-[22.5rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6">
          <ProfileCard data={data} />
        </aside>
        <div className="flex min-w-0 flex-col gap-5">
          <ProfileSections data={data} today={todayIso()} />
        </div>
      </div>
    </>
  );
}

export default function PublicProfilePage(props: PageProps<"/u/[username]">) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
      <Suspense fallback={<p className="self-start rounded-control scrim px-3 py-2 text-page">Carregando…</p>}>
        <Profile {...props} />
      </Suspense>
    </main>
  );
}
