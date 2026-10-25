import type { GameStatus } from "@/types/database";

const PATHS: Record<GameStatus, string> = {
  backlog: "M4 7h16M4 12h16M4 17h10",
  playing: "M7 5v14l12-7z",
  paused: "M8 5v14M16 5v14",
  shelved: "M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9",
  dropped: "M6 6l12 12M18 6 6 18",
  completed: "m5 12 5 5 9-10",
};

export function StatusIcon({ status, className = "size-3.5" }: { status: GameStatus; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={PATHS[status]} />
    </svg>
  );
}

export function CheckIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m5 12 5 5 9-10" />
    </svg>
  );
}
