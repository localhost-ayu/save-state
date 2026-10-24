import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PlatinumTrophy } from "@/features/library/components/platinum-trophy";
import { getPublicProfile } from "@/features/profile/queries";

type Entry = NonNullable<Awaited<ReturnType<typeof getPublicProfile>>>["playing"][number];

function Shelf({ title, entries }: { title: string; entries: Entry[] }) {
  if (entries.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-medium">{title}</h2>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {entries.map((entry) => (
          <li key={entry.id} className="relative aspect-[3/4] overflow-hidden rounded-card bg-surface-raised">
            {entry.game.cover_url ? (
              <Image src={entry.game.cover_url} alt={entry.game.title} fill sizes="160px" className="object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center p-2 text-center text-xs">
                {entry.game.title}
              </span>
            )}
            {entry.is_platinum && (
              <PlatinumTrophy className="absolute top-1.5 right-1.5 size-4 text-platinum drop-shadow" />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

async function Profile({ params }: PageProps<"/u/[username]">) {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) notFound();

  const { profile, playing, completed } = data;

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold">{profile.display_name ?? profile.username}</h1>
        <p className="text-sm text-muted">@{profile.username}</p>
        {profile.bio && <p className="max-w-prose whitespace-pre-line">{profile.bio}</p>}
      </header>
      <Shelf title="Jogando agora" entries={playing} />
      <Shelf title="Finalizados" entries={completed} />
    </>
  );
}

export default function PublicProfilePage(props: PageProps<"/u/[username]">) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10">
      <Suspense fallback={<p className="text-muted">Carregando…</p>}>
        <Profile {...props} />
      </Suspense>
    </main>
  );
}
