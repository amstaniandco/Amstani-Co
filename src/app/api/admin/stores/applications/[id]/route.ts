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
      return NextResponse.json({ error: "Invalid application id" }, { status: 400 });
    }

    const body = await req.json();
    const action = body?.action as "approve" | "deny";
    if (action !== "approve" && action !== "deny") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const status = action === "approve" ? "approved_by_admin" : "denied_by_admin";

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const update: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
      reviewedByAdminId: new ObjectId(tokenUser.id),
      reviewedAt: new Date(),
    };

    if (action === "approve") {
      update.ownerSignupLink = "http://localhost:3000/store-signup";
    }

    const result = await db.collection("store_applications").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    if (!result.matchedCount) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ message: `Application ${action}d successfully` }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/stores/applications/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
