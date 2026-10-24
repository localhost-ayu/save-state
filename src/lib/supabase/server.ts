import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";
import { AUTH_COOKIE_NAME, serverSupabaseUrl } from "./config";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(serverSupabaseUrl(), publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookieOptions: { name: AUTH_COOKIE_NAME },
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components can't write cookies; the proxy refreshes the session instead.
        }
      },
    },
  });
}
