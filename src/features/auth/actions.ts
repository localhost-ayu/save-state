"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { status: "idle" | "sent" | "error"; message?: string };

const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  next: z.string().startsWith("/").default("/library"),
});

export async function signInWithEmail(_: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  const supabase = await createClient();
  const callback = new URL("/auth/callback", publicEnv.NEXT_PUBLIC_SITE_URL);
  callback.searchParams.set("next", parsed.data.next);

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: callback.toString() },
  });
  if (error) return { status: "error", message: error.message };

  return { status: "sent", message: "Enviamos um link de acesso para o seu e-mail." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
