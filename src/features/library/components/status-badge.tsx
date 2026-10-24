import type { GameStatus } from "@/types/database";
import { STATUS_LABELS } from "../constants";

export function StatusBadge({ status }: { status: GameStatus }) {
  return (
    <span
      data-status={status}
      className="inline-flex items-center rounded-full bg-surface-raised px-2 py-0.5 text-xs font-medium text-muted"
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
