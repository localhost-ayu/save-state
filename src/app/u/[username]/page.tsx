import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ThemeBackdrop, ThemeStyle } from "@/features/appearance/components/theme-style";
import { ProfileSections } from "@/features/profile/components/profile-sections";
import { getPublicProfile, type PublicProfile } from "@/features/profile/queries";
import { mediaUrl } from "@/lib/media";

export async function generateMetadata({ params }: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

function ProfileCard({ data }: { data: PublicProfile }) {
  const { profile } = data;
  const name = profile.display_name ?? profile.username;

  return (
    <div className="overflow-hidden rounded-card surface text-text">
      <div className="aspect-[3/1] bg-accent">
        {profile.banner_path && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(profile.banner_path)} alt="" className="size-full object-cover" />
        )}
      </div>
      <div className="flex flex-col gap-3 px-6 pb-6">
        <div className="-mt-12 size-24 overflow-hidden rounded-pill border-4 border-[var(--surface-solid)] bg-surface-raised">
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
          <h1 className="font-display text-3xl leading-tight font-extrabold">{name}</h1>
          <span className="font-label text-xs text-muted">@{profile.username}</span>
        </div>
        {profile.tagline && (
          <p className="self-start rounded-control bg-accent px-3 py-1 text-sm font-medium text-accent-contrast">
            {profile.tagline}
          </p>
        )}
        {profile.bio && <p className="text-sm whitespace-pre-line text-muted">{profile.bio}</p>}
        {profile.links.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {profile.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  rel="noopener noreferrer me"
                  target="_blank"
                  className="inline-flex rounded-pill bg-surface-raised px-3.5 py-2 text-sm hover:text-accent"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
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
      {data.isOwner && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card surface px-4 py-3 text-sm text-text">
          <span>
            {data.profile.is_public
              ? "Este é o seu perfil público."
              : "Seu perfil está privado: só você vê esta página."}
          </span>
          <Link href="/settings/profile" className="font-medium text-accent hover:underline">
            Editar perfil
          </Link>
        </div>
      )}
      <div className="grid items-start gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6">
          <ProfileCard data={data} />
        </aside>
        <div className="flex min-w-0 flex-col gap-6">
          <ProfileSections data={data} />
        </div>
      </div>
    </>
  );
}

export default function PublicProfilePage(props: PageProps<"/u/[username]">) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
      <Suspense fallback={<p className="text-page/70">Carregando…</p>}>
        <Profile {...props} />
      </Suspense>
    </main>
  );
}
