import type { Route } from "next";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { GameStatus } from "@/types/database";
import { GAME_STATUSES, STATUS_LABELS } from "../constants";

function href(status: GameStatus | undefined, search: string | undefined): Route {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("q", search);
  const query = params.toString();
  return (query ? `/library?${query}` : "/library") as Route;
}

export function LibraryFilters({ status, search }: { status?: GameStatus; search?: string }) {
  const chips: Array<{ value: GameStatus | undefined; label: string }> = [
    { value: undefined, label: "Todos" },
    ...GAME_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <form action="/library" className="flex gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          name="q"
          defaultValue={search}
          placeholder="Filtrar por título…"
          aria-label="Filtrar por título"
          className="h-10 w-full max-w-sm rounded-control border border-border bg-surface-solid px-3 text-sm text-text"
        />
      </form>
      <nav aria-label="Filtrar por status" className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <Link
            key={chip.label}
            href={href(chip.value, search)}
            aria-current={chip.value === status ? "page" : undefined}
            className={cn(
              "rounded-pill border border-border px-3 py-1 text-sm",
              chip.value === status ? "border-accent bg-accent text-accent-contrast" : "text-muted hover:text-text",
            )}
          >
            {chip.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
