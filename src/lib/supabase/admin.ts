import "server-only";
import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env.server";
import type { Database } from "@/types/database";
import { serverSupabaseUrl } from "./config";

export function createAdminClient() {
  return createClient<Database>(serverSupabaseUrl(), serverEnv().SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
