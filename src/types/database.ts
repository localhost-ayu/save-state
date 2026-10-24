import type { Enums } from "./database.generated";

export type { Database, Json, Tables, TablesInsert, TablesUpdate } from "./database.generated";

export type GameStatus = Enums<"game_status">;
export type OwnershipType = Enums<"ownership_type">;
export type DatePrecision = Enums<"date_precision">;
export type GameSource = Enums<"game_source">;
export type ExternalProvider = Enums<"external_provider">;
export type SyncStatus = Enums<"sync_status">;

export type CoverCrop = { x: number; y: number; width: number; height: number };
