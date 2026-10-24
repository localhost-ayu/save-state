"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { upsertIgdbGame } from "@/features/library/catalog";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireUser } from "@/lib/auth";
import { getGameById } from "@/lib/integrations/igdb/client";
import { authenticateWithNpsso, getOwnProfile } from "@/lib/integrations/psn/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { linkTitleToGame, reconcilePendingTitles } from "./reconcile";
import { saveTokens, syncPsnAccount } from "./sync";

const npssoSchema = z.string().trim().length(64, "O NPSSO tem 64 caracteres");

function revalidatePsnViews() {
  revalidatePath("/settings");
  revalidatePath("/library");
  revalidatePath("/library/psn");
}

export async function connectPsn(npsso: string): Promise<ActionResult<{ onlineId: string; titles: number }>> {
  const user = await requireUser();
  const parsed = npssoSchema.safeParse(npsso);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  let tokens;
  try {
    tokens = await authenticateWithNpsso(parsed.data);
  } catch {
    return fail("Não foi possível autenticar na PSN. Gere um novo NPSSO e tente de novo.");
  }

  const profile = await getOwnProfile({ accessToken: tokens.accessToken });
  const admin = createAdminClient();

  const { data: account, error } = await admin
    .from("external_accounts")
    .upsert(
      {
        user_id: user.id,
        provider: "psn",
        external_user_id: profile.accountId,
        display_name: profile.onlineId,
        avatar_url: profile.avatarUrl,
      },
      { onConflict: "user_id,provider" },
    )
    .select("id, user_id, last_synced_at")
    .single();
  if (error) return fail(error.message);

  await saveTokens(admin, account.id, tokens);

  try {
    const stats = await syncPsnAccount(admin, account);
    revalidatePsnViews();
    return ok({ onlineId: profile.onlineId, titles: stats.titles });
  } catch (syncError) {
    return fail(`Conta conectada, mas a importação falhou: ${(syncError as Error).message}`);
  }
}

async function getOwnPsnTitle(psnTitleId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("psn_titles")
    .select("id, user_id, name, icon_url, platforms, earned_platinum")
    .eq("id", psnTitleId)
    .eq("user_id", user.id)
    .maybeSingle();
  return data;
}

const linkSchema = z.object({ psnTitleId: z.uuid(), igdbId: z.number().int().positive() });

export async function linkPsnTitle(input: z.input<typeof linkSchema>): Promise<ActionResult> {
  const parsed = linkSchema.safeParse(input);
  if (!parsed.success) return fail("Dados inválidos");

  const title = await getOwnPsnTitle(parsed.data.psnTitleId);
  if (!title) return fail("Título não encontrado");

  const game = await getGameById(parsed.data.igdbId);
  if (!game) return fail("Jogo não encontrado no IGDB");

  await linkTitleToGame(createAdminClient(), title, await upsertIgdbGame(game));
  revalidatePsnViews();
  return ok();
}

export async function addPsnTitleAsManual(psnTitleId: string): Promise<ActionResult> {
  const title = await getOwnPsnTitle(psnTitleId);
  if (!title) return fail("Título não encontrado");

  const admin = createAdminClient();
  const { data: game, error } = await admin
    .from("games")
    .insert({
      source: "manual",
      title: title.name.replace(/[™®©]/g, "").trim(),
      cover_url: title.icon_url,
      platforms: title.platforms,
      created_by: title.user_id,
    })
    .select("id")
    .single();
  if (error) return fail(error.message);

  await linkTitleToGame(admin, title, game.id);
  revalidatePsnViews();
  return ok();
}

export async function ignorePsnTitle(psnTitleId: string): Promise<ActionResult> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("psn_titles").update({ link_status: "ignored" }).eq("id", psnTitleId);
  if (error) return fail(error.message);

  revalidatePsnViews();
  return ok();
}

export async function reconcileNow(): Promise<ActionResult<{ linked: number; needsReview: number }>> {
  const user = await requireUser();
  try {
    const result = await reconcilePendingTitles(createAdminClient(), user.id);
    revalidatePsnViews();
    return ok(result);
  } catch (error) {
    return fail((error as Error).message);
  }
}
