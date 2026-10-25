import type { GameStatus } from "@/types/database";
import { STATUS_LABELS } from "../constants";

const STATUS_COLORS: Record<GameStatus, string> = {
  backlog: "var(--text-muted)",
  playing: "var(--accent)",
  paused: "#FFB86B",
  shelved: "#9FB4FF",
  dropped: "#F49AA8",
  completed: "#7DE3B0",
};

export function StatusBadge({ status }: { status: GameStatus }) {
  return (
    <span
      data-status={status}
      className="inline-flex items-center gap-1.5 rounded-control border border-border px-2 py-0.5 font-label text-[11px] tracking-[0.06em] text-text uppercase"
    >
      <span aria-hidden="true" className="size-1.5 rounded-pill" style={{ background: STATUS_COLORS[status] }} />
      {STATUS_LABELS[status]}
    </span>
  );
}
