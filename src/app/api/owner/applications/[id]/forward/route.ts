import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../../lib/db";
import { getUserFromToken } from "../../../../../../lib/auth";

export async function PATCH(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid application id" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const application = await db.collection("store_applications").findOne({ _id: new ObjectId(id) });
    if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    if (String(application.ownerId) !== tokenUser.id) {
      return NextResponse.json({ error: "You can only forward your own store applications" }, { status: 403 });
    }

    await db.collection("store_applications").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "forwarded_to_admin",
          forwardedToAdminAt: new Date(),
          forwardedByOwnerId: new ObjectId(tokenUser.id),
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ message: "Application forwarded to admin" }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/owner/applications/[id]/forward error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
