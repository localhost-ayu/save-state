"use server";

import { redirect } from "next/navigation";
import { fail, type ActionResult } from "@/lib/action-result";
import { requireUser } from "@/lib/auth";
import { MEDIA_BUCKET } from "@/lib/media";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function removeUserMedia(admin: ReturnType<typeof createAdminClient>, userId: string) {
  const storage = admin.storage.from(MEDIA_BUCKET);
  const { data: folders, error } = await storage.list(userId, { limit: 1000 });
  if (error) throw error;

  const paths: string[] = [];
  for (const folder of folders) {
    if (folder.id) {
      paths.push(`${userId}/${folder.name}`);
      continue;
    }
    const { data: files, error: listError } = await storage.list(`${userId}/${folder.name}`, { limit: 1000 });
    if (listError) throw listError;
    paths.push(...files.map((file) => `${userId}/${folder.name}/${file.name}`));
  }

  for (let index = 0; index < paths.length; index += 100) {
    const { error: removeError } = await storage.remove(paths.slice(index, index + 100));
    if (removeError) throw removeError;
  }
}

/** Deletes the signed-in user's files and auth user; every table cascades from the profile. */
export async function deleteAccount(confirmation: string): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();
  if (!profile || confirmation.trim().toLowerCase() !== profile.username.toLowerCase()) {
    return fail("Digite seu nome de usuário exatamente como aparece para confirmar.");
  }

  const admin = createAdminClient();
  try {
    await removeUserMedia(admin, user.id);
  } catch {
    return fail("Não foi possível apagar suas imagens. Tente de novo em instantes.");
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return fail("Não foi possível excluir a conta. Tente de novo em instantes.");

  await supabase.auth.signOut();
  redirect("/");
}
