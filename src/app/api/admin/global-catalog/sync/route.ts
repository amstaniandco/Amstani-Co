import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { requireAdminResponse } from "../../../../../lib/admin-catalog-taxonomy";

export async function POST() {
  try {
    const authError = await requireAdminResponse();
    if (authError) return authError;

    const scriptPath = path.join(process.cwd(), "scripts", "sync-products-from-supabase-to-mongo.cjs");

    const result = await new Promise<{ stdout: string; stderr: string; code: number }>(
      (resolve) => {
        const child = spawn("node", [scriptPath], {
          env: { ...process.env },
          cwd: process.cwd(),
        });

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (chunk: Buffer) => {
          stdout += chunk.toString();
        });
        child.stderr.on("data", (chunk: Buffer) => {
          stderr += chunk.toString();
        });
        child.on("close", (code) => {
          resolve({ stdout, stderr, code: code ?? 1 });
        });
        child.on("error", (err) => {
          resolve({ stdout, stderr: stderr + err.message, code: 1 });
        });
      }
    );

    if (result.code !== 0) {
      return NextResponse.json(
        { error: "Sync failed", detail: result.stderr || result.stdout },
        { status: 500 }
      );
    }

    // Parse counts from script output
    const lines = result.stdout.trim().split("\n");
    return NextResponse.json({ ok: true, log: lines });
  } catch (error) {
    console.error("POST /api/admin/global-catalog/sync error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
