import "server-only";
import { cache } from "react";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_THEME, parseTheme } from "./theme";

export const getMyTheme = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return DEFAULT_THEME;

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("theme").eq("id", user.id).maybeSingle();
  return parseTheme(data?.theme);
});
