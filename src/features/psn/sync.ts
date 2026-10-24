import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchTitleSnapshots,
  refreshTokens,
  type PsnTitleSnapshot,
  type PsnTokens,
} from "@/lib/integrations/psn/client";
import type { Database, TablesInsert } from "@/types/database";
import { reconcilePendingTitles } from "./reconcile";

type AdminClient = SupabaseClient<Database>;

const ACCESS_TOKEN_MARGIN_MS = 5 * 60_000;
const UPSERT_CHUNK = 200;

export class PsnReauthRequiredError extends Error {
  constructor() {
    super("PSN refresh token expired; a new NPSSO is required");
  }
}

export async function saveTokens(admin: AdminClient, externalAccountId: string, tokens: PsnTokens) {
  const { error } = await admin.from("external_account_tokens").upsert({
    external_account_id: externalAccountId,
    access_token: tokens.accessToken,
    access_token_expires_at: tokens.accessTokenExpiresAt.toISOString(),
    refresh_token: tokens.refreshToken,
    refresh_token_expires_at: tokens.refreshTokenExpiresAt.toISOString(),
  });
  if (error) throw error;
}

async function getValidAccessToken(admin: AdminClient, externalAccountId: string) {
  const { data, error } = await admin
    .from("external_account_tokens")
    .select("*")
    .eq("external_account_id", externalAccountId)
    .single();
  if (error) throw error;

  if (new Date(data.access_token_expires_at).getTime() - ACCESS_TOKEN_MARGIN_MS > Date.now()) {
    return data.access_token;
  }
  if (new Date(data.refresh_token_expires_at).getTime() <= Date.now()) {
    throw new PsnReauthRequiredError();
  }

  const tokens = await refreshTokens(data.refresh_token);
  await saveTokens(admin, externalAccountId, tokens);
  return tokens.accessToken;
}

function toRow(userId: string, snapshot: PsnTitleSnapshot, syncedAt: string): TablesInsert<"psn_titles"> {
  return {
    user_id: userId,
    np_communication_id: snapshot.npCommunicationId,
    np_service_name: snapshot.npServiceName,
    title_ids: snapshot.titleIds,
    name: snapshot.name,
    icon_url: snapshot.iconUrl,
    platforms: snapshot.platforms,
    progress: snapshot.progress,
    defined_bronze: snapshot.defined.bronze,
    defined_silver: snapshot.defined.silver,
    defined_gold: snapshot.defined.gold,
    defined_platinum: snapshot.defined.platinum,
    earned_bronze: snapshot.earned.bronze,
    earned_silver: snapshot.earned.silver,
    earned_gold: snapshot.earned.gold,
    earned_platinum: snapshot.earned.platinum,
    last_trophy_at: snapshot.lastTrophyAt,
    ...(snapshot.playDurationSeconds !== null && { play_duration_seconds: snapshot.playDurationSeconds }),
    ...(snapshot.firstPlayedAt && { first_played_at: snapshot.firstPlayedAt }),
    ...(snapshot.lastPlayedAt && { last_played_at: snapshot.lastPlayedAt }),
    synced_at: syncedAt,
  };
}

async function markPlatinums(admin: AdminClient, userId: string) {
  const { data, error } = await admin
    .from("psn_titles")
    .select("library_entry_id")
    .eq("user_id", userId)
    .eq("earned_platinum", 1)
    .not("library_entry_id", "is", null);
  if (error) throw error;

  const entryIds = data.map((row) => row.library_entry_id).filter((id) => id !== null);
  if (entryIds.length === 0) return;

  const { error: updateError } = await admin
    .from("library_entries")
    .update({ is_platinum: true })
    .in("id", entryIds)
    .eq("is_platinum", false);
  if (updateError) throw updateError;
}

export async function syncPsnAccount(
  admin: AdminClient,
  account: { id: string; user_id: string; last_synced_at: string | null },
) {
  const { data: run, error: runError } = await admin
    .from("sync_runs")
    .insert({ user_id: account.user_id, provider: "psn" })
    .select("id")
    .single();
  if (runError) throw runError;

  const startedAt = new Date().toISOString();

  try {
    const accessToken = await getValidAccessToken(admin, account.id);
    const snapshots = await fetchTitleSnapshots(
      { accessToken },
      { updatedSince: account.last_synced_at ? new Date(account.last_synced_at) : undefined },
    );

    const rows = snapshots.map((snapshot) => toRow(account.user_id, snapshot, startedAt));
    for (let i = 0; i < rows.length; i += UPSERT_CHUNK) {
      const { error } = await admin
        .from("psn_titles")
        .upsert(rows.slice(i, i + UPSERT_CHUNK), { onConflict: "user_id,np_communication_id" });
      if (error) throw error;
    }

    await markPlatinums(admin, account.user_id);
    await admin.from("external_accounts").update({ last_synced_at: startedAt }).eq("id", account.id);

    let reconciliation: Awaited<ReturnType<typeof reconcilePendingTitles>> | null = null;
    let reconcileError: string | null = null;
    try {
      reconciliation = await reconcilePendingTitles(admin, account.user_id);
    } catch (error) {
      reconcileError = error instanceof Error ? error.message : String(error);
    }

    const stats = { titles: rows.length, ...reconciliation };
    await admin
      .from("sync_runs")
      .update({
        status: reconcileError ? "partial" : "success",
        finished_at: new Date().toISOString(),
        stats,
        error: reconcileError,
      })
      .eq("id", run.id);

    return stats;
  } catch (error) {
    await admin
      .from("sync_runs")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      })
      .eq("id", run.id);
    throw error;
  }
}
