import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

export async function GET(req: Request) {
  const user = await getUserFromToken();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const sinceClaims = searchParams.get("since_claims");
  const sinceStores = searchParams.get("since_stores");
  const sinceChats = searchParams.get("since_chats");

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const claimsFilter: Record<string, unknown> = { status: { $ne: "resolved" } };
  if (sinceClaims) claimsFilter.updatedAt = { $gte: new Date(sinceClaims) };

  const appFilter: Record<string, unknown> = { status: "forwarded_to_admin" };
  if (sinceStores) appFilter.createdAt = { $gte: new Date(sinceStores) };

  const signupFilter: Record<string, unknown> = { reviewedAt: { $exists: false } };
  if (sinceStores) signupFilter.createdAt = { $gte: new Date(sinceStores) };

  const chatsFilter: Record<string, unknown> = { sender: "owner" };
  if (sinceChats) chatsFilter.createdAt = { $gte: new Date(sinceChats) };

  const [claims, pendingApplications, pendingSignupRequests, chatMessages] = await Promise.all([
    db.collection("claims").countDocuments(claimsFilter),
    db.collection("store_applications").countDocuments(appFilter),
    db.collection("store_signup_requests").countDocuments(signupFilter),
    db.collection("store_messages").countDocuments(chatsFilter),
  ]);

  return NextResponse.json({
    claims,
    stores: pendingApplications + pendingSignupRequests,
    chats: chatMessages,
  });
}
