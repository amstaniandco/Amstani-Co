import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { User } from "../../../../models/user";
import { Store } from "../../../../models/store";

export async function GET() {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const user = await db.collection<User>("users").findOne(
      { _id: new ObjectId(tokenUser.id) },
      { projection: { password: 0 } }
    );
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const store = await db.collection<Store>("stores").findOne({ ownerId: new ObjectId(tokenUser.id) });

    let followerCount = 0;
    let productCount = 0;
    if (store) {
      [followerCount, productCount] = await Promise.all([
        db.collection("storeFollowers").countDocuments({ storeId: store._id }),
        db.collection("products").countDocuments({ storeId: store._id }),
      ]);
    }

    return NextResponse.json(
      {
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone ?? "",
          state: user.state ?? "",
          avatarUrl: user.avatarUrl ?? "",
        },
        store,
        followerCount,
        productCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/owner/store error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { storeName, storeDescription, ownerName, ownerEmail, ownerPhone, languages, logoUrl, bannerUrl } = body;

    if (!storeName?.trim()) {
      return NextResponse.json({ error: "Store name is required" }, { status: 400 });
    }
    if (!ownerName?.trim()) {
      return NextResponse.json({ error: "Owner name is required" }, { status: 400 });
    }
    if (!ownerEmail?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!languages || languages.length === 0) {
      return NextResponse.json({ error: "At least one language is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const user = await db.collection<User>("users").findOne({ _id: new ObjectId(tokenUser.id) });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Update user details
    const userUpdate: Record<string, unknown> = { updatedAt: new Date() };
    if (ownerName) userUpdate.name = ownerName;
    if (ownerEmail) userUpdate.email = ownerEmail;
    if (ownerPhone !== undefined) userUpdate.phone = ownerPhone;

    await db.collection("users").updateOne(
      { _id: new ObjectId(tokenUser.id) },
      { $set: userUpdate }
    );

    // Build store update fields
    const storeFields: Record<string, unknown> = { updatedAt: new Date() };
    if (storeName) storeFields.name = storeName;
    if (storeDescription !== undefined) storeFields.description = storeDescription;
    if (logoUrl !== undefined) storeFields.logoUrl = logoUrl;
    if (bannerUrl !== undefined) storeFields.bannerUrl = bannerUrl;
    if (languages) storeFields["settings.languages"] = languages;

    const existingStore = await db.collection<Store>("stores").findOne({ ownerId: new ObjectId(tokenUser.id) });

    if (existingStore) {
      await db.collection("stores").updateOne(
        { _id: existingStore._id },
        { $set: storeFields }
      );
    } else {
      const newStore: Store = {
        ownerId: new ObjectId(tokenUser.id),
        name: storeName,
        description: storeDescription || "",
        status: "pending",
        logoUrl: logoUrl || undefined,
        bannerUrl: bannerUrl || undefined,
        settings: { languages: languages || [] },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await db.collection("stores").insertOne(newStore as any);

      // Link the new store to the user
      await db.collection("users").updateOne(
        { _id: new ObjectId(tokenUser.id) },
        { $set: { storeId: result.insertedId } }
      );
    }

    return NextResponse.json({ message: "Store saved successfully" }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/owner/store error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (body.logoUrl !== undefined) update.logoUrl = body.logoUrl;
    if (body.bannerUrl !== undefined) update.bannerUrl = body.bannerUrl;
    if (body.isLive !== undefined) update.isLive = Boolean(body.isLive);
    if (body.automatedTemplates !== undefined) update.automatedTemplates = body.automatedTemplates;

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    await db.collection("stores").updateOne(
      { ownerId: new ObjectId(tokenUser.id) },
      { $set: update },
      { upsert: false }
    );

    return NextResponse.json({ message: "Updated" }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/owner/store error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
