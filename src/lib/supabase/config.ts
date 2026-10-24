import { publicEnv } from "@/lib/env";

export const AUTH_COOKIE_NAME = "sb-backlog-auth-token";

export function serverSupabaseUrl() {
  return process.env.SUPABASE_INTERNAL_URL || publicEnv.NEXT_PUBLIC_SUPABASE_URL;
}
