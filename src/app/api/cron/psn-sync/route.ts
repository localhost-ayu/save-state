import { NextResponse, type NextRequest } from "next/server";
import { syncPsnAccount } from "@/features/psn/sync";
import { serverEnv } from "@/lib/env.server";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${serverEnv().CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: accounts, error } = await admin
    .from("external_accounts")
    .select("id, user_id, last_synced_at")
    .eq("provider", "psn");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results = await Promise.allSettled(accounts.map((account) => syncPsnAccount(admin, account)));

  return NextResponse.json({
    synced: results.filter((r) => r.status === "fulfilled").length,
    failed: results.filter((r) => r.status === "rejected").length,
  });
}
