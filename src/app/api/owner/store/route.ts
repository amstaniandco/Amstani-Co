import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { ObjectId } from "mongodb";
import clientPromise from "../../../../lib/db";
import { User } from "../../../../models/user";
import { Store } from "../../../../models/store";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.id as string;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DBNAME || "amstanico");
    
    const user = await db.collection<User>("users").findOne({ _id: new ObjectId(userId) });
    if (!user || user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let store = await db.collection<Store>("stores").findOne({ ownerId: new ObjectId(userId) });

    return NextResponse.json({ user: { name: user.name, email: user.email }, store }, { status: 200 });
  } catch (error) {
    console.error("GET /api/owner/store error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { storeName, storeDescription, ownerName, ownerEmail, ownerPhone, languages, logoUrl, bannerUrl } = body;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DBNAME || "amstani");

    const user = await db.collection<User>("users").findOne({ _id: new ObjectId(userId) });
    if (!user || user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update User details
    const userUpdate: any = {};
    if (ownerName) userUpdate.name = ownerName;
    if (ownerEmail) userUpdate.email = ownerEmail;
    if (ownerPhone) userUpdate.phone = ownerPhone;
    
    if (Object.keys(userUpdate).length > 0) {
      userUpdate.updatedAt = new Date();
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: userUpdate }
      );
    }

    // Update or Create Store details
    const store = await db.collection<Store>("stores").findOne({ ownerId: new ObjectId(userId) });
    
    const storeUpdate: any = {
      updatedAt: new Date()
    };
    if (storeName) storeUpdate.name = storeName;
    if (storeDescription) storeUpdate.description = storeDescription;
    if (logoUrl) storeUpdate.logoUrl = logoUrl;
    if (bannerUrl) storeUpdate.bannerUrl = bannerUrl;
    
    // Merge nested settings
    if (languages) {
      storeUpdate["settings.languages"] = languages;
    }

    if (store) {
      await db.collection("stores").updateOne(
        { _id: store._id },
        { $set: storeUpdate }
      );
    } else {
      // Create new store if it doesn't exist
      const newStore: Store = {
        ownerId: new ObjectId(userId),
        name: storeName || "My New Store",
        description: storeDescription || "",
        status: "pending",
        logoUrl,
        bannerUrl,
        settings: { languages: languages || [] },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await db.collection("stores").insertOne(newStore as any);
      
      // Link the new store back to the user
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { storeId: result.insertedId } }
      );
    }

    return NextResponse.json({ message: "Store updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/owner/store error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
