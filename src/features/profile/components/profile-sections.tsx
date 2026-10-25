import type { ReactNode } from "react";
import { GameCover } from "@/features/library/components/game-cover";
import { PlatinumTrophy } from "@/features/library/components/platinum-trophy";
import { formatHours } from "@/features/playthroughs/lib";
import { formatPartialDate } from "@/features/timeline/lib";
import { mediaUrl } from "@/lib/media";
import type { PublicProfile, PublicProfileEntry } from "../queries";
import type { ProfileSectionId } from "../sections";

const MONTHS = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

function Block({ index, title, children }: { index: number; title: string; children: ReactNode }) {
  const id = `section-${index}`;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3.5 rounded-card surface p-5 text-text">
      <h2 id={id} className="flex items-center gap-2 font-label text-xs font-bold tracking-[0.12em] uppercase">
        <span className="text-muted">{String(index).padStart(2, "0")}</span>
        {title}
      </h2>
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
      platform={entry.platform}
      sizes={sizes}
      className={className}
    />
  );
}

function relativeDay(date: string, today: string) {
  const days = Math.round((Date.parse(today) - Date.parse(date)) / 86_400_000);
  if (days <= 0) return "HOJE";
  if (days === 1) return "ONTEM";
  if (days < 30) return `${days} DIAS ATRÁS`;
  return formatPartialDate({ date, precision: "day" }).toUpperCase();
}

type SectionProps = { data: PublicProfile; index: number; today: string };

function NowPlaying({ data, index, today }: SectionProps) {
  const entry = data.nowPlaying;
  if (!entry) return null;
  const meta = [
    entry.platform,
    `desde ${formatPartialDate({ date: entry.status_changed_at.slice(0, 10), precision: "day" })}`,
    entry.currentHours > 0 && `${formatHours(entry.currentHours)} nesta jornada`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section
      aria-labelledby="now-playing"
      className="flex flex-col gap-5 rounded-card surface p-5 text-text sm:flex-row"
    >
      <Cover
        entry={entry}
        sizes="120px"
        className="w-28 self-start rounded-[calc(var(--card-radius)*0.6)] sm:w-[7.5rem]"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h2
          id="now-playing"
          className="flex items-center gap-2 font-label text-xs font-bold tracking-[0.12em] text-accent-text uppercase"
        >
          <span className="text-muted">{String(index).padStart(2, "0")}</span>
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-3">
            <path d="M7 5v14l12-7z" />
          </svg>
          Jogando agora
        </h2>
        <p className="font-display text-2xl leading-tight font-bold sm:text-[1.75rem]">{entry.game.title}</p>
        <p className="font-label text-[13px] text-muted">{meta}</p>
        {entry.lastNote && (
          <blockquote className="mt-2 rounded-control bg-surface-raised px-3.5 py-3 text-[15px] leading-relaxed">
            <p className="line-clamp-3">“{entry.lastNote.body}”</p>
            <footer className="mt-1.5 font-label text-[11px] text-muted">
              DIÁRIO · {relativeDay(entry.lastNote.entry_date, today)}
            </footer>
          </blockquote>
        )}
      </div>
    </section>
  );
}

function YearStats({ data, index }: SectionProps) {
  const hint = "registre numa jornada";
  const tiles = [
    { label: `Horas em ${data.year}`, value: data.stats.hoursYear ? formatHours(data.stats.hoursYear) : null },
    { label: "Horas no total", value: data.stats.hoursTotal ? formatHours(data.stats.hoursTotal) : null },
    { label: `Finalizados em ${data.year}`, value: String(data.stats.finished) },
    { label: "Platinas", value: String(data.stats.platinums) },
    { label: "Jogando", value: String(data.stats.playing) },
    { label: "No backlog", value: String(data.stats.backlog) },
  ];
  return (
    <Block index={index} title={`Números de ${data.year}`}>
      <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="flex flex-col-reverse gap-0.5 rounded-[calc(var(--card-radius)*0.6)] bg-surface-raised p-3.5"
          >
            <dt className="text-[13px] text-muted">
              {tile.label}
              {!tile.value && data.isOwner && ` · ${hint}`}
            </dt>
            <dd className={`font-display text-[1.75rem] font-bold ${tile.value ? "" : "text-muted"}`}>
              {tile.value ?? "—"}
            </dd>
          </div>
        ))}
      </dl>
    </Block>
  );
}

function Favorites({ data, index }: SectionProps) {
  if (data.favorites.length === 0) return null;
  return (
    <Block index={index} title="Favoritos de sempre">
      <ol className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {data.favorites.map((entry, position) => (
          <li key={entry.id} className="flex min-w-0 flex-col gap-1.5">
            <div className="relative">
              <Cover entry={entry} sizes="180px" className="w-full rounded-[calc(var(--card-radius)*0.6)]" />
              <span className="absolute top-1.5 left-1.5 rounded-[4px] bg-black/60 px-1.5 py-0.5 font-label text-[10px] text-white">
                #{position + 1}
              </span>
            </div>
            <span className="truncate text-[13px] font-semibold">{entry.game.title}</span>
          </li>
        ))}
      </ol>
    </Block>
  );
}

function FinishedYear({ data, index }: SectionProps) {
  if (data.finishedYear.length === 0) return null;
  return (
    <Block index={index} title={`Finalizados em ${data.year}`}>
      <ul className="flex flex-col">
        {data.finishedYear.map((entry) => {
          const month = entry.finishedOn ? MONTHS[Number(entry.finishedOn.slice(5, 7)) - 1] : null;
          const details = [
            month,
            entry.hours > 0 && formatHours(entry.hours).toUpperCase(),
            entry.is_platinum && "PLATINADO",
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <li key={entry.id} className="flex min-h-13 items-center gap-3 py-1.5">
              <Cover entry={entry} sizes="30px" className="w-[30px] rounded-[4px]" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-1.5 truncate text-[15px] font-semibold">
                  {entry.game.title}
                  {entry.is_platinum && <PlatinumTrophy className="size-3.5 shrink-0 text-platinum" />}
                </span>
                {details && <span className="font-label text-[11px] text-muted">{details}</span>}
              </div>
              {entry.rating !== null && (
                <span className="font-label text-sm font-bold">{String(entry.rating).replace(".", ",")}/10</span>
              )}
            </li>
          );
        })}
      </ul>
    </Block>
  );
}

function Reviews({ data, index }: SectionProps) {
  const [latest, ...others] = data.reviews;
  if (!latest) return null;
  return (
    <Block index={index} title="Reviews recentes">
      <article className="flex flex-col gap-2">
        <h3 className="font-display text-lg font-bold">{latest.entry.game.title}</h3>
        <p className="line-clamp-5 text-[15px] leading-relaxed whitespace-pre-line">{latest.body}</p>
        <time className="font-label text-[11px] text-muted" dateTime={latest.updated_at}>
          {formatPartialDate({ date: latest.updated_at.slice(0, 10), precision: "day" }).toUpperCase()}
        </time>
      </article>
      {others.length > 0 && (
        <ul className="flex flex-col gap-2 border-t border-border pt-3">
          {others.map((review) => (
            <li key={review.entry.id} className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">{review.entry.game.title}</span>
              <span className="line-clamp-2 text-sm text-muted">{review.body}</span>
            </li>
          ))}
        </ul>
      )}
    </Block>
  );
}

function Gallery({ data, index }: SectionProps) {
  if (data.gallery.length === 0) return null;
  return (
    <Block index={index} title="Galeria">
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

const RENDERERS: Record<ProfileSectionId, (props: SectionProps) => ReactNode> = {
  now_playing: NowPlaying,
  favorites: Favorites,
  year_stats: YearStats,
  finished_year: FinishedYear,
  reviews: Reviews,
  gallery: Gallery,
};

const HAS_CONTENT: Record<ProfileSectionId, (data: PublicProfile) => boolean> = {
  now_playing: (data) => Boolean(data.nowPlaying),
  favorites: (data) => data.favorites.length > 0,
  year_stats: () => true,
  finished_year: (data) => data.finishedYear.length > 0,
  reviews: (data) => data.reviews.length > 0,
  gallery: (data) => data.gallery.length > 0,
};

export function ProfileSections({ data, today }: { data: PublicProfile; today: string }) {
  return data.profile.sections
    .filter((section) => section.visible && HAS_CONTENT[section.id](data))
    .map((section, position) => {
      const Section = RENDERERS[section.id];
      return <Section key={section.id} data={data} index={position + 1} today={today} />;
    });
}
