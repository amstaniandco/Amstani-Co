import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

async function getStore(db: any, ownerId: string) {
  return db.collection("stores").findOne(
    { ownerId: new ObjectId(ownerId) },
    { projection: { _id: 1, name: 1 } }
  );
}

function mapAnnouncement(doc: any) {
  return {
    _id: String(doc._id),
    title: doc.title,
    body: doc.body,
    audience: doc.audience ?? "followers",
    status: doc.status,
    createdAt: doc.createdAt,
  };
}

export async function GET() {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const store = await getStore(db, tokenUser.id);
    if (!store) return NextResponse.json({ announcements: [] });

    const docs = await db
      .collection("storeAnnouncements")
      .find({ storeId: store._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ announcements: docs.map(mapAnnouncement) });
  } catch (error) {
    console.error("GET /api/owner/announcements error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { title, body } = await req.json();
    if (!String(title ?? "").trim() || !String(body ?? "").trim()) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const store = await getStore(db, tokenUser.id);
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    const now = new Date();
    const doc = {
      storeId: store._id,
      title: String(title).trim(),
      body: String(body).trim(),
      audience: "followers",
      status: "Live",
      createdAt: now,
      updatedAt: now,
    };
    const result = await db.collection("storeAnnouncements").insertOne(doc);

    // Notify all followers of this store
    const followers = await db
      .collection("storeFollowers")
      .find({ storeId: store._id })
      .project({ userId: 1 })
      .toArray();
    if (followers.length > 0) {
      await db.collection("notifications").insertMany(
        followers.map((f) => ({
          userId: f.userId,
          title: doc.title,
          message: doc.body,
          type: "announcement",
          referenceId: store._id,
          storeName: store.name,
          isRead: false,
          createdAt: now,
        }))
      );
    }

    return NextResponse.json({ announcement: mapAnnouncement({ _id: result.insertedId, ...doc }) });
  } catch (error) {
    console.error("POST /api/owner/announcements error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id, status } = await req.json();
    if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    if (!["Live", "Draft"].includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const store = await getStore(db, tokenUser.id);
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    await db.collection("storeAnnouncements").updateOne(
      { _id: new ObjectId(id), storeId: store._id },
      { $set: { status, updatedAt: new Date() } }
    );

    const updated = await db.collection("storeAnnouncements").findOne({ _id: new ObjectId(id) });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ announcement: mapAnnouncement(updated) });
  } catch (error) {
    console.error("PATCH /api/owner/announcements error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const store = await getStore(db, tokenUser.id);
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    await db.collection("storeAnnouncements").deleteOne({ _id: new ObjectId(id), storeId: store._id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/owner/announcements error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
