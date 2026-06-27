import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getStore(db: ReturnType<typeof import("mongodb").MongoClient.prototype.db>, ownerId: string) {
  return db.collection("stores").findOne({ ownerId: new ObjectId(ownerId) }, { projection: { _id: 1, name: 1 } });
}

function mapTrack(doc: Record<string, unknown>) {
  return {
    _id: String(doc._id),
    name: doc.name as string,
    url: doc.url as string,
    isApplied: doc.isApplied as boolean,
    createdAt: doc.createdAt,
  };
}

// GET — list all tracks for this owner's store
export async function GET() {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const store = await getStore(db, tokenUser.id);
    if (!store) return NextResponse.json({ tracks: [] });

    const docs = await db
      .collection("storeTracks")
      .find({ storeId: store._id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ tracks: docs.map(mapTrack) });
  } catch (error) {
    console.error("GET /api/owner/music error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST — upload a new MP3 track
export async function POST(req: NextRequest) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const allowed = ["audio/mpeg", "audio/mp3", "audio/x-mpeg", "audio/x-mp3"];
    if (!allowed.includes(file.type) && !file.name.toLowerCase().endsWith(".mp3")) {
      return NextResponse.json({ error: "Only MP3 files are allowed" }, { status: 400 });
    }
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 15 MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploaded = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "amstani/music", resource_type: "auto" },
          (error, result) => {
            if (error || !result) reject(error ?? new Error("Upload failed"));
            else resolve(result as { secure_url: string; public_id: string });
          }
        )
        .end(buffer);
    });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const store = await getStore(db, tokenUser.id);
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    const now = new Date();
    const doc = {
      storeId: store._id,
      name: file.name,
      url: uploaded.secure_url,
      cloudinaryId: uploaded.public_id,
      isApplied: false,
      createdAt: now,
    };
    const result = await db.collection("storeTracks").insertOne(doc);

    return NextResponse.json({ track: mapTrack({ _id: result.insertedId, ...doc }) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/owner/music error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Recompute the store's applied playlist from the currently-applied tracks.
// Tracks play one after another in upload order (oldest first), so the
// customer-side order stays stable as tracks are toggled on and off.
async function syncStorePlaylist(
  db: ReturnType<typeof import("mongodb").MongoClient.prototype.db>,
  storeId: ObjectId
) {
  const applied = await db
    .collection("storeTracks")
    .find({ storeId, isApplied: true })
    .sort({ createdAt: 1 })
    .toArray();
  const musicUrls = applied.map((t) => t.url as string);

  if (musicUrls.length === 0) {
    await db.collection("stores").updateOne(
      { _id: storeId },
      { $set: { "settings.musicUrls": [], updatedAt: new Date() }, $unset: { "settings.musicUrl": "" } }
    );
  } else {
    await db.collection("stores").updateOne(
      { _id: storeId },
      { $set: { "settings.musicUrls": musicUrls, "settings.musicUrl": musicUrls[0], updatedAt: new Date() } }
    );
  }
}

// PATCH — toggle whether a track is applied. Multiple tracks can be applied
// at once; they play one after another in the store.
export async function PATCH(req: NextRequest) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await req.json();
    if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const store = await getStore(db, tokenUser.id);
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    const track = await db.collection("storeTracks").findOne({ _id: new ObjectId(id), storeId: store._id });
    if (!track) return NextResponse.json({ error: "Track not found" }, { status: 404 });

    // Toggle this track's applied state
    await db.collection("storeTracks").updateOne(
      { _id: new ObjectId(id) },
      { $set: { isApplied: !track.isApplied } }
    );

    await syncStorePlaylist(db, store._id);

    const updated = await db.collection("storeTracks").find({ storeId: store._id }).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ tracks: updated.map(mapTrack) });
  } catch (error) {
    console.error("PATCH /api/owner/music error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE — remove a track
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

    const track = await db.collection("storeTracks").findOne({ _id: new ObjectId(id), storeId: store._id });
    if (!track) return NextResponse.json({ error: "Track not found" }, { status: 404 });

    // Delete from Cloudinary
    if (track.cloudinaryId) {
      await cloudinary.uploader.destroy(track.cloudinaryId, { resource_type: "video" }).catch(() => {});
    }

    await db.collection("storeTracks").deleteOne({ _id: new ObjectId(id) });

    // If this track was part of the playlist, recompute it
    if (track.isApplied) {
      await syncStorePlaylist(db, store._id);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/owner/music error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
