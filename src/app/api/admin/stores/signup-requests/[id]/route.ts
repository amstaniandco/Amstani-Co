import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../../lib/db";
import { getUserFromToken } from "../../../../../../lib/auth";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid signup request id" }, { status: 400 });
    }

    const body = await req.json();
    const action = body?.action as "approve" | "deny";
    if (action !== "approve" && action !== "deny") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const requestId = new ObjectId(id);
    const request = await db.collection("store_signup_requests").findOne({ _id: requestId });
    if (!request) return NextResponse.json({ error: "Signup request not found" }, { status: 404 });

    const now = new Date();
    const status = action === "approve" ? "approved" : "denied";

    await db.collection("store_signup_requests").updateOne(
      { _id: requestId },
      {
        $set: {
          status,
          reviewedByAdminId: new ObjectId(tokenUser.id),
          reviewedAt: now,
          updatedAt: now,
        },
      }
    );

    if (action === "approve") {
      await db.collection("users").updateOne(
        { _id: request.userId },
        { $set: { role: "owner", storeId: request.storeId, updatedAt: now } }
      );

      if (request.storeId) {
        await db.collection("stores").updateOne(
          { _id: request.storeId },
          { $set: { status: "active", ownerId: request.userId, updatedAt: now } }
        );
      }
    }

    return NextResponse.json({ message: `Signup request ${status}` }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/stores/signup-requests/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
