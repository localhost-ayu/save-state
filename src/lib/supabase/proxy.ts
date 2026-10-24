import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";
import { AUTH_COOKIE_NAME, serverSupabaseUrl } from "./config";

const PROTECTED_PREFIXES = ["/library", "/board", "/timeline", "/games", "/settings"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(serverSupabaseUrl(), publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookieOptions: { name: AUTH_COOKIE_NAME },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!data?.claims && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
