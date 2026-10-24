import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL;
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/library";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(destination, siteUrl));
  }

  return NextResponse.redirect(new URL("/login?error=auth", siteUrl));
}
