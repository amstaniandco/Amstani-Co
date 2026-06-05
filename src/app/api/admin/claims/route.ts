import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const claims = await db
    .collection("claims")
    .find({})
    .sort({ status: 1, createdAt: -1 })
    .toArray();

  const total = claims.filter((c) => c.status !== "resolved").length;
  const escalated = claims.filter((c) => c.status === "admin_escalated").length;

  const resolved = claims.filter(
    (c) => c.status === "resolved" && c.createdAt && c.updatedAt
  );
  let avgResolutionHours = 0;
  if (resolved.length) {
    const totalMs = resolved.reduce((sum, c) => {
      return sum + (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime());
    }, 0);
    avgResolutionHours = Math.round(totalMs / resolved.length / (1000 * 60 * 60));
  }

  return NextResponse.json({ claims, stats: { total, escalated, avgResolutionHours } });
}
