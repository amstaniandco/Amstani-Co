import { NextResponse } from "next/server";
import { requireAdminResponse } from "../../../../../lib/admin-catalog-taxonomy";
import { runSupabaseSync } from "../../../../../lib/supabase-sync";

export async function POST() {
  try {
    const authError = await requireAdminResponse();
    if (authError) return authError;

    const result = await runSupabaseSync();
    return NextResponse.json({ ok: true, log: result.log });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("POST /api/admin/global-catalog/sync error:", message);
    return NextResponse.json(
      { error: "Sync failed", detail: message },
      { status: 500 }
    );
  }
}
