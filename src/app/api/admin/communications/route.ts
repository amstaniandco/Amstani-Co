import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

const validAudiences = ["customers", "owners", "all"] as const;
const validTypes = ["banner", "announcement"] as const;

type CommunicationDoc = {
  _id?: ObjectId;
  title?: string;
  subtitle?: string;
  audience?: string;
  communicationType?: string;
  imageUrl?: string;
  mediaType?: string;
  status?: string;
  createdAt?: Date;
};

function mapCommunication(doc: CommunicationDoc) {
  return {
    _id: doc._id?.toString(),
    title: doc.title,
    subtitle: doc.subtitle,
    audience: doc.audience,
    communicationType: doc.communicationType,
    imageUrl: doc.imageUrl,
    mediaType: doc.mediaType ?? "image",
    status: doc.status,
    createdAt: doc.createdAt,
  };
}

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const communications = await db
    .collection("communications")
    .find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  return NextResponse.json({ communications: communications.map(mapCommunication) });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const title = String(body.title ?? "").trim();
  const subtitle = String(body.subtitle ?? "").trim();
  const audience = String(body.audience ?? "all");
  const communicationType = String(body.communicationType ?? "announcement");
  const imageUrl = String(body.imageUrl ?? "").trim();
  const mediaType = body.mediaType === "video" ? "video" : "image";

  if (!title || !subtitle) {
    return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
  }
  if (!validAudiences.includes(audience as (typeof validAudiences)[number])) {
    return NextResponse.json({ error: "Invalid audience" }, { status: 400 });
  }
  if (!validTypes.includes(communicationType as (typeof validTypes)[number])) {
    return NextResponse.json({ error: "Invalid communication type" }, { status: 400 });
  }
  if (communicationType === "banner" && !imageUrl) {
    return NextResponse.json({ error: "Banner image is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const now = new Date();
  const communication = {
    title,
    subtitle,
    audience,
    communicationType,
    imageUrl: imageUrl || undefined,
    mediaType,
    status: "Live",
    createdBy: new ObjectId(user.id),
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("communications").insertOne(communication);

  if (communicationType === "announcement") {
    const roles = audience === "all" ? ["user", "owner"] : audience === "customers" ? ["user"] : ["owner"];
    const recipients = await db
      .collection("users")
      .find({ role: { $in: roles } }, { projection: { _id: 1 } })
      .toArray();

    if (recipients.length > 0) {
      await db.collection("notifications").insertMany(
        recipients.map((recipient) => ({
          userId: recipient._id,
          title,
          message: subtitle,
          type: "system_alert",
          isRead: false,
          referenceId: result.insertedId,
          createdAt: now,
        }))
      );
    }
  }

  return NextResponse.json({
    communication: mapCommunication({ _id: result.insertedId, ...communication }),
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { id } = body;
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid communication id" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (body.status !== undefined) {
    if (!["Live", "Draft"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updates.status = body.status;
  }

  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    updates.title = title;
  }

  if (body.subtitle !== undefined) {
    const subtitle = String(body.subtitle).trim();
    if (!subtitle) return NextResponse.json({ error: "Message is required" }, { status: 400 });
    updates.subtitle = subtitle;
  }

  if (body.audience !== undefined) {
    if (!validAudiences.includes(body.audience as (typeof validAudiences)[number])) {
      return NextResponse.json({ error: "Invalid audience" }, { status: 400 });
    }
    updates.audience = body.audience;
  }

  if (body.imageUrl !== undefined) {
    updates.imageUrl = String(body.imageUrl).trim() || undefined;
  }

  if (body.mediaType !== undefined) {
    updates.mediaType = body.mediaType === "video" ? "video" : "image";
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  await db.collection("communications").updateOne(
    { _id: new ObjectId(id as string) },
    { $set: updates }
  );

  const updated = await db.collection("communications").findOne({ _id: new ObjectId(id as string) });
  if (!updated) return NextResponse.json({ error: "Communication not found" }, { status: 404 });

  return NextResponse.json({ communication: mapCommunication(updated) });
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid communication id" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  await db.collection("communications").deleteOne({ _id: new ObjectId(id) });

  return NextResponse.json({ ok: true });
}
