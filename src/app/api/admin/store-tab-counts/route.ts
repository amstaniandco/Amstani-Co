import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

export async function GET(req: Request) {
  const user = await getUserFromToken();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const sinceApps = searchParams.get("since_applications");
  const sinceSignups = searchParams.get("since_signups");

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const appFilter: Record<string, unknown> = { status: "forwarded_to_admin" };
  if (sinceApps) appFilter.createdAt = { $gte: new Date(sinceApps) };

  const signupFilter: Record<string, unknown> = { reviewedAt: { $exists: false } };
  if (sinceSignups) signupFilter.createdAt = { $gte: new Date(sinceSignups) };

  const [applications, signups] = await Promise.all([
    db.collection("store_applications").countDocuments(appFilter),
    db.collection("store_signup_requests").countDocuments(signupFilter),
  ]);

  return NextResponse.json({ applications, signups });
}
