import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { PlatinumTrophy } from "@/features/library/components/platinum-trophy";
import { daysInYear, formatPartialDate } from "@/features/timeline/lib";
import { getTimeline } from "@/features/timeline/queries";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Linha do tempo" };

async function Timeline({ searchParams }: PageProps<"/timeline">) {
  const { year: yearParam } = await searchParams;
  await connection();
  const currentYear = new Date().getFullYear();
  const parsed = Number(yearParam);
  const year = Number.isInteger(parsed) && parsed > 1970 && parsed <= currentYear ? parsed : currentYear;
  const items = await getTimeline(year);
  const total = daysInYear(year);

  return (
    <div className="flex flex-col gap-4 rounded-card surface p-5 text-text">
      <div className="flex items-center gap-3">
        <Link href={`/timeline?year=${year - 1}`} className="text-muted hover:text-text" aria-label="Ano anterior">
          ←
        </Link>
        <h2 className="font-display text-xl font-semibold">{year}</h2>
        {year < currentYear && (
          <Link href={`/timeline?year=${year + 1}`} className="text-muted hover:text-text" aria-label="Próximo ano">
            →
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <p className="py-12 text-center text-muted">Nenhum jogo com datas registradas em {year}.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="grid grid-cols-[minmax(0,10rem)_1fr] items-center gap-3">
              <span className="flex items-center gap-1 truncate text-sm">
                {item.entry.game.title}
                {item.entry.is_platinum && <PlatinumTrophy className="size-3.5 shrink-0 text-platinum" />}
              </span>
              <div className="relative h-6 rounded bg-surface-raised">
                <div
                  title={`${formatPartialDate({ date: item.started_on, precision: item.started_precision })} – ${formatPartialDate({ date: item.finished_on, precision: item.finished_precision })}`}
                  className={cn(
                    "absolute inset-y-0 rounded bg-accent",
                    item.segment.ongoing && "opacity-70",
                    (item.segment.fuzzyStart || item.segment.fuzzyEnd) && "opacity-50",
                  )}
                  style={{
                    left: `${(item.segment.startDay / total) * 100}%`,
                    width: `${Math.max(((item.segment.endDay - item.segment.startDay + 1) / total) * 100, 0.8)}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function TimelinePage(props: PageProps<"/timeline">) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold">Linha do tempo</h1>
      <Suspense fallback={<p className="text-muted">Carregando…</p>}>
        <Timeline {...props} />
      </Suspense>
    </div>
  );
}
