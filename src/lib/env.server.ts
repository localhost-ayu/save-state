import "server-only";
import { z } from "zod";

const serverSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(1),
  CRON_SECRET: z.string().min(16),
  IGDB_CLIENT_ID: z.string().optional(),
  IGDB_CLIENT_SECRET: z.string().optional(),
});

type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | undefined;

export function serverEnv(): ServerEnv {
  cached ??= serverSchema.parse(process.env);
  return cached;
}

export function igdbCredentials() {
  const { IGDB_CLIENT_ID, IGDB_CLIENT_SECRET } = serverEnv();
  if (!IGDB_CLIENT_ID || !IGDB_CLIENT_SECRET) {
    throw new Error("IGDB não configurado: defina IGDB_CLIENT_ID e IGDB_CLIENT_SECRET");
  }
  return { clientId: IGDB_CLIENT_ID, clientSecret: IGDB_CLIENT_SECRET };
}
