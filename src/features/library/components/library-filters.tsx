import type { Route } from "next";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { GAME_STATUSES, STATUS_LABELS } from "../constants";
import { CheckIcon } from "./status-icon";

export type LibraryFilter = (typeof GAME_STATUSES)[number] | "platinum";

function href(filter: LibraryFilter | undefined, search: string | undefined): Route {
  const params = new URLSearchParams();
  if (filter) params.set("status", filter);
  if (search) params.set("q", search);
  const query = params.toString();
  return (query ? `/library?${query}` : "/library") as Route;
}

export function LibraryFilters({
  filter,
  search,
  counts,
}: {
  filter?: LibraryFilter;
  search?: string;
  counts: Record<LibraryFilter | "all", number>;
}) {
  const chips: Array<{ value: LibraryFilter | undefined; label: string; count: number }> = [
    { value: undefined, label: "Todos", count: counts.all },
    ...GAME_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value], count: counts[value] })),
    { value: "platinum", label: "Platinado", count: counts.platinum },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <nav aria-label="Filtrar por status" className="flex flex-1 flex-wrap gap-2">
        {chips.map((chip) => {
          const active = chip.value === filter;
          return (
            <Link
              key={chip.label}
              href={href(chip.value, search)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-1.5 rounded-pill px-3.5 text-sm",
                active
                  ? "bg-accent-fill font-semibold text-accent-fill-contrast"
                  : "border border-border-strong bg-surface-solid text-text hover:bg-surface-raised",
              )}
            >
              {active && <CheckIcon />}
              {chip.label}
              <span className="font-label text-xs opacity-80">{chip.count}</span>
            </Link>
          );
        })}
      </nav>
      <form action="/library" className="w-full sm:w-56">
        {filter && <input type="hidden" name="status" value={filter} />}
        <label className="sr-only" htmlFor="library-title-filter">
          Filtrar por título
        </label>
        <input
          id="library-title-filter"
          name="q"
          defaultValue={search}
          placeholder="Filtrar por título…"
          className="h-11 w-full rounded-control border border-border-strong bg-surface-solid px-3 text-sm text-text placeholder:text-muted"
        />
      </form>
    </div>
  );
}
