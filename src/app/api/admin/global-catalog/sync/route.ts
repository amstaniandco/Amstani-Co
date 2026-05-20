import { NextResponse } from "next/server";
import { requireAdminResponse } from "../../../../../lib/admin-catalog-taxonomy";

export async function POST() {
  try {
    const authError = await requireAdminResponse();
    if (authError) return authError;

    // Dynamic imports prevent Turbopack from statically resolving the child process path
    const { execSync } = await import("child_process");
    const { join } = await import("path");

    const scriptName = ["sync-products-from-supabase-to-mongo", "cjs"].join(".");
    const cwd = process.cwd();
    const scriptPath = join(cwd, "scripts", scriptName);

    try {
      const output = execSync(`node "${scriptPath}"`, {
        encoding: "utf8",
        env: process.env,
        cwd,
      }) as string;
      const lines = output.trim().split("\n").filter(Boolean);
      return NextResponse.json({ ok: true, log: lines });
    } catch (err: unknown) {
      const e = err as { stderr?: string; stdout?: string; message?: string };
      return NextResponse.json(
        { error: "Sync failed", detail: e.stderr || e.stdout || e.message || "Unknown error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("POST /api/admin/global-catalog/sync error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
