import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import clientPromise, { DB_NAME } from "../../../lib/db";
import { findUserByEmail } from "../../../lib/users";
import { User } from "../../../models/user";

// This route's GET handler depends on live DB state (user roles, application
// status) and must never serve a cached response for a given email.
export const dynamic = "force-dynamic";

const ALREADY_EXISTS_MESSAGE = "An account with this email already exists";
const STORE_ALREADY_EXISTS_MESSAGE = "A store is already registered with this email";

// Public — no login required. Validates whether the email can create a new
// account without requiring a previously approved store application.
export async function GET(req: Request) {
  try {
    const email = new URL(req.url).searchParams.get("email") || "";
    if (!email.trim()) {
      return NextResponse.json({ eligible: false, error: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await findUserByEmail(db, normalizedEmail);
    if (existingUser && existingUser.role !== "user") {
      return NextResponse.json({ eligible: false, error: ALREADY_EXISTS_MESSAGE });
    }
    if (existingUser?._id) {
      const existingStore = await db.collection("stores").findOne({ ownerId: existingUser._id });
      if (existingStore) {
        return NextResponse.json({ eligible: false, error: STORE_ALREADY_EXISTS_MESSAGE });
      }
    }

    return NextResponse.json({ eligible: true });
  } catch (error) {
    console.error("GET /api/store-signup error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Public — no login required. Anyone with a valid email can submit a store
// signup request, which remains subject to admin approval.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phoneNumber,
      address,
      state,
      password,
      confirmPassword,
      storeName,
      storeDescription,
      logoUrl,
      bannerUrl,
      cardMediaUrl,
    } = body;

    if (!fullName?.trim() || !email?.trim() || !phoneNumber?.trim() || !state?.trim()) {
      return NextResponse.json({ error: "Name, email, phone, and state are required" }, { status: 400 });
    }
    if (!storeName?.trim()) {
      return NextResponse.json({ error: "Store name is required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (!password || !confirmPassword) {
      return NextResponse.json({ error: "Password and confirm password are required" }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const normalizedEmail = email.trim().toLowerCase();

    const usersCollection = db.collection<User>("users");
    const existingUser = await findUserByEmail(db, normalizedEmail);
    if (existingUser && existingUser.role !== "user") {
      return NextResponse.json({ error: ALREADY_EXISTS_MESSAGE }, { status: 409 });
    }
    if (existingUser?._id) {
      const existingStore = await db.collection("stores").findOne({ ownerId: existingUser._id });
      if (existingStore) {
        return NextResponse.json({ error: STORE_ALREADY_EXISTS_MESSAGE }, { status: 409 });
      }
    }

    const now = new Date();
    const hashedPassword = await bcrypt.hash(password, 10);

    let ownerId: ObjectId;
    if (existingUser?._id) {
      ownerId = existingUser._id;
      await db.collection("users").updateOne(
        { _id: ownerId },
        {
          $set: {
            name: fullName.trim(),
            phone: phoneNumber.trim(),
            state: state.trim(),
            password: hashedPassword,
            updatedAt: now,
          },
        }
      );
    } else {
      const inserted = await usersCollection.insertOne({
        name: fullName.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phoneNumber.trim(),
        state: state.trim(),
        role: "user",
        createdAt: now,
        updatedAt: now,
      } as User);
      ownerId = inserted.insertedId;
    }

    const storeFields: Record<string, unknown> = {
      ownerId,
      name: storeName.trim(),
      description: storeDescription?.trim() ?? "",
      status: "pending",
      updatedAt: now,
    };
    if (logoUrl !== undefined) storeFields.logoUrl = logoUrl;
    if (bannerUrl !== undefined) storeFields.bannerUrl = bannerUrl;
    if (cardMediaUrl !== undefined) storeFields.cardMediaUrl = cardMediaUrl;

    const storeResult = await db.collection("stores").findOneAndUpdate(
      { ownerId },
      {
        $set: storeFields,
        $setOnInsert: { createdAt: now },
      },
      { upsert: true, returnDocument: "after" }
    );

    const storeId = storeResult?._id;
    if (storeId) {
      await db.collection("users").updateOne(
        { _id: ownerId },
        { $set: { storeId, updatedAt: now } }
      );
    }

    await db.collection("store_signup_requests").updateOne(
      { userId: ownerId },
      {
        $set: {
          userId: ownerId,
          storeId,
          status: "pending",
          userData: {
            name: fullName.trim(),
            email: normalizedEmail,
            phone: phoneNumber.trim(),
            address: address?.trim() ?? "",
            state: state.trim(),
          },
          storeData: {
            storeName: storeName.trim(),
            storeDescription: storeDescription?.trim() ?? "",
            logoUrl: logoUrl ?? "",
            bannerUrl: bannerUrl ?? "",
            cardMediaUrl: cardMediaUrl ?? "",
          },
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    return NextResponse.json({ message: "Signup request submitted for verification" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/store-signup error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
