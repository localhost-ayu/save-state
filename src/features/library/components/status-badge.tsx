import type { GameStatus } from "@/types/database";
import { STATUS_LABELS } from "../constants";
import { StatusIcon } from "./status-icon";

export function StatusBadge({ status }: { status: GameStatus }) {
  return (
    <span
      data-status={status}
      className="inline-flex items-center gap-1.5 font-label text-[11px] tracking-[0.06em] text-text uppercase"
    >
      <StatusIcon status={status} className="size-3" />
      {STATUS_LABELS[status]}
    </span>
  );
}
