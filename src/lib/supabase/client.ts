import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";
import { AUTH_COOKIE_NAME } from "./config";

export function createClient() {
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { cookieOptions: { name: AUTH_COOKIE_NAME } },
  );
}
