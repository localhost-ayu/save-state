import type { GameStatus, OwnershipType } from "@/types/database";

export const GAME_STATUSES = [
  "backlog",
  "playing",
  "paused",
  "shelved",
  "dropped",
  "completed",
] as const satisfies readonly GameStatus[];

export const STATUS_LABELS: Record<GameStatus, string> = {
  backlog: "Backlog",
  playing: "Iniciado",
  paused: "Pausado",
  shelved: "Congelado",
  dropped: "Abandonado",
  completed: "Finalizado",
};

export const OWNERSHIP_TYPES = [
  "physical",
  "digital",
  "borrowed",
  "alternative",
  "subscription",
] as const satisfies readonly OwnershipType[];

export const OWNERSHIP_LABELS: Record<OwnershipType, string> = {
  physical: "Mídia física",
  digital: "Digital",
  borrowed: "Emprestado",
  alternative: "Métodos alternativos",
  subscription: "Assinatura",
};
