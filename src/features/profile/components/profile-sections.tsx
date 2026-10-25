import type { ReactNode } from "react";
import { GameCover } from "@/features/library/components/game-cover";
import { PlatinumTrophy } from "@/features/library/components/platinum-trophy";
import { formatHours } from "@/features/playthroughs/lib";
import { formatPartialDate } from "@/features/timeline/lib";
import { mediaUrl } from "@/lib/media";
import type { PublicProfile, PublicProfileEntry } from "../queries";
import type { ProfileSectionId } from "../sections";

function Block({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-card surface p-5 text-text">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Cover({ entry, sizes, className }: { entry: PublicProfileEntry; sizes: string; className?: string }) {
  return (
    <GameCover
      title={entry.game.title}
      coverUrl={entry.game.cover_url}
      customCoverPath={entry.custom_cover_path}
      sizes={sizes}
      className={className}
    />
  );
}

function NowPlaying({ data }: { data: PublicProfile }) {
  const entry = data.nowPlaying;
  if (!entry) return null;
  return (
    <section className="flex items-center gap-5 rounded-card border-accent surface p-5 text-text">
      <Cover entry={entry} sizes="112px" className="w-28 rounded-control" />
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="font-label text-xs tracking-[0.08em] text-accent uppercase">● Jogando agora</span>
        <h2 className="font-display text-2xl leading-tight font-bold">{entry.game.title}</h2>
        <span className="text-sm text-muted">
          {[
            entry.platform,
            `desde ${formatPartialDate({ date: entry.status_changed_at.slice(0, 10), precision: "day" })}`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>
    </section>
  );
}

function Favorites({ data }: { data: PublicProfile }) {
  if (data.favorites.length === 0) return null;
  return (
    <Block title="Favoritos">
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {data.favorites.map((entry) => (
          <li key={entry.id} className="flex flex-col gap-2">
            <Cover entry={entry} sizes="180px" className="rounded-card" />
            <span className="text-sm font-medium">{entry.game.title}</span>
          </li>
        ))}
      </ul>
    </Block>
  );
}

function YearStats({ data }: { data: PublicProfile }) {
  const tiles = [
    { label: `Horas em ${data.year}`, value: formatHours(data.stats.hoursYear) },
    { label: "Horas no total", value: formatHours(data.stats.hoursTotal) },
    { label: `Finalizados em ${data.year}`, value: data.stats.finished },
    { label: "Platinas", value: data.stats.platinums },
    { label: "Jogando", value: data.stats.playing },
    { label: "No backlog", value: data.stats.backlog },
  ];
  return (
    <Block title="Números">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="flex flex-col gap-1 rounded-control bg-surface-raised p-4">
            <dd className="font-display text-3xl font-bold">{tile.value}</dd>
            <dt className="text-xs text-muted">{tile.label}</dt>
          </div>
        ))}
      </dl>
    </Block>
  );
}

function FinishedYear({ data }: { data: PublicProfile }) {
  if (data.finishedYear.length === 0) return null;
  return (
    <Block title={`Finalizados em ${data.year}`}>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {data.finishedYear.map((entry) => (
          <li key={entry.id} className="relative" title={entry.game.title}>
            <Cover entry={entry} sizes="120px" className="rounded-control" />
            {entry.is_platinum && (
              <span className="absolute top-1.5 right-1.5 rounded-pill bg-black/60 p-1 text-platinum">
                <PlatinumTrophy className="size-3.5" />
              </span>
            )}
            <span className="sr-only">{entry.game.title}</span>
          </li>
        ))}
      </ul>
    </Block>
  );
}

function Reviews({ data }: { data: PublicProfile }) {
  if (data.reviews.length === 0) return null;
  return (
    <Block title="Reviews recentes">
      <ul className="flex flex-col gap-3">
        {data.reviews.map((review) => (
          <li key={review.entry.id} className="flex flex-col gap-1.5 rounded-control bg-surface-raised p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-medium">{review.entry.game.title}</h3>
              <time className="text-xs text-muted" dateTime={review.updated_at}>
                {formatPartialDate({ date: review.updated_at.slice(0, 10), precision: "day" })}
              </time>
            </div>
            <p className="line-clamp-4 text-sm whitespace-pre-line text-muted">{review.body}</p>
          </li>
        ))}
      </ul>
    </Block>
  );
}

function Gallery({ data }: { data: PublicProfile }) {
  if (data.gallery.length === 0) return null;
  return (
    <Block title="Galeria">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data.gallery.map((shot) => (
          <li key={shot.id} className="flex flex-col gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mediaUrl(shot.storage_path)}
              alt={shot.caption ?? `Screenshot de ${shot.entry.game.title}`}
              loading="lazy"
              className="aspect-video w-full rounded-control object-cover"
            />
            <span className="line-clamp-1 text-xs text-muted">{shot.caption ?? shot.entry.game.title}</span>
          </li>
        ))}
      </ul>
    </Block>
  );
}

const RENDERERS: Record<ProfileSectionId, (props: { data: PublicProfile }) => ReactNode> = {
  now_playing: NowPlaying,
  favorites: Favorites,
  year_stats: YearStats,
  finished_year: FinishedYear,
  reviews: Reviews,
  gallery: Gallery,
};

export function ProfileSections({ data }: { data: PublicProfile }) {
  return data.profile.sections
    .filter((section) => section.visible)
    .map((section) => {
      const Section = RENDERERS[section.id];
      return <Section key={section.id} data={data} />;
    });
}
