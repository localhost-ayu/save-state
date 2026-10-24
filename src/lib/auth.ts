import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = { id: string; email: string | null };

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return null;
  return { id: data.claims.sub, email: data.claims.email ?? null };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
