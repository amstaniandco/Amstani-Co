import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

export type AdminNotification = {
  id: string;
  type: "application" | "signup" | "listing" | "claim" | "chat";
  title: string;
  message: string;
  href: string;
  createdAt: string;
};

export async function GET() {
  const user = await getUserFromToken();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const [applications, signups, listings, claims, ownerMessages] = await Promise.all([
    // Store applications forwarded to admin, awaiting review
    db.collection("store_applications")
      .find({ status: "forwarded_to_admin" })
      .sort({ forwardedToAdminAt: -1, createdAt: -1 })
      .limit(15).toArray(),
    // New store signup requests, not yet reviewed
    db.collection("store_signup_requests")
      .find({ reviewedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .limit(15).toArray(),
    // Product listing requests awaiting approval
    db.collection("listing_requests")
      .find({ status: { $in: ["pending", "Pending", "requested"] } })
      .sort({ createdAt: -1 })
      .limit(15).toArray(),
    // Open (unresolved) customer claims
    db.collection("claims")
      .find({ status: { $ne: "resolved" } })
      .sort({ updatedAt: -1 })
      .limit(15).toArray(),
    // Unread owner→admin chat messages
    db.collection("store_messages")
      .find({ sender: "owner" })
      .sort({ createdAt: -1 })
      .limit(10).toArray(),
  ]);

  const notifications: AdminNotification[] = [];

  for (const a of applications) {
    notifications.push({
      id: a._id.toString(),
      type: "application",
      title: "New store application",
      message: `${a.storeName || a.applicant?.name || "A store"} is awaiting your review.`,
      href: "/admin/stores/applications",
      createdAt: new Date(a.forwardedToAdminAt || a.createdAt || Date.now()).toISOString(),
    });
  }

  for (const s of signups) {
    notifications.push({
      id: s._id.toString(),
      type: "signup",
      title: "New store signup request",
      message: `${s.storeData?.storeName || s.userData?.name || "A new seller"} requested to join.`,
      href: "/admin/stores/signup-requests",
      createdAt: new Date(s.createdAt || Date.now()).toISOString(),
    });
  }

  for (const l of listings) {
    notifications.push({
      id: l._id.toString(),
      type: "listing",
      title: "Product listing request",
      message: `A store requested to list ${l.noOfProducts ?? "new"} product${l.noOfProducts === 1 ? "" : "s"}.`,
      href: "/admin/stores",
      createdAt: new Date(l.createdAt || Date.now()).toISOString(),
    });
  }

  for (const c of claims) {
    notifications.push({
      id: c._id.toString(),
      type: "claim",
      title: `Open claim ${c.claimNumber || ""}`.trim(),
      message: `${c.storeName || "A store"} · ${c.reason || "Customer claim"} — needs attention.`,
      href: "/admin/claims",
      createdAt: new Date(c.updatedAt || c.createdAt || Date.now()).toISOString(),
    });
  }

  for (const m of ownerMessages) {
    notifications.push({
      id: m._id.toString(),
      type: "chat",
      title: "New message from a store owner",
      message: (m.text || m.message || "Sent you a message").toString().slice(0, 80),
      href: "/admin/stores",
      createdAt: new Date(m.createdAt || Date.now()).toISOString(),
    });
  }

  notifications.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return NextResponse.json({ notifications, total: notifications.length });
}
