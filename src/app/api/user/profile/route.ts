import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { Address, User } from "../../../../models/user";

const editableFields = ["name", "email", "phone", "state", "avatarUrl"] as const;

function getUserObjectId(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

function normalizeAddress(address: Partial<Address>): Address | null {
  const recipientName = cleanString(address.recipientName);
  const street = cleanString(address.street);
  const city = cleanString(address.city);
  const state = cleanString(address.state);
  const zip = cleanString(address.zip);
  const country = cleanString(address.country) || "USA";
  const type = address.type === "billing" ? "billing" : "shipping";

  if (!recipientName || !street || !city || !state || !zip) return null;

  return {
    id: cleanString(address.id) || crypto.randomUUID(),
    type,
    recipientName,
    street,
    city,
    state,
    zip,
    country,
    isDefault: Boolean(address.isDefault),
  };
}

export async function GET() {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = getUserObjectId(tokenUser.id);
    if (!userId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const user = await db.collection<User>("users").findOne(
      { _id: userId },
      { projection: { password: 0 } }
    );
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = getUserObjectId(tokenUser.id);
    if (!userId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const body = (await req.json()) as Partial<User> & { addresses?: unknown };

    const updateData: Partial<User> = { updatedAt: new Date() };
    for (const field of editableFields) {
      if (body[field] !== undefined) {
        const value = cleanString(body[field]);
        if (field === "name" && !value) {
          return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }
        if (field === "email") {
          if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
          }
          updateData.email = value.toLowerCase();
        } else if (value !== undefined) {
          updateData[field] = value as never;
        }
      }
    }

    if (body.addresses !== undefined) {
      if (!Array.isArray(body.addresses)) {
        return NextResponse.json({ error: "Addresses must be an array" }, { status: 400 });
      }

      const addresses = body.addresses.map((address) => normalizeAddress(address as Partial<Address>));
      if (addresses.some((address) => address === null)) {
        return NextResponse.json({ error: "Each address must include recipient, street, city, state, and ZIP" }, { status: 400 });
      }

      const defaultIndex = addresses.findIndex((address) => address?.isDefault);
      updateData.addresses = addresses.map((address, index) => ({
        ...address!,
        isDefault: defaultIndex >= 0 ? index === defaultIndex : index === 0,
      }));
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    if (updateData.email) {
      const duplicate = await db.collection<User>("users").findOne({ email: updateData.email, _id: { $ne: userId } });
      if (duplicate) return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
    }

    const result = await db.collection("users").updateOne(
      { _id: userId },
      { $set: updateData }
    );

    if (!result.matchedCount) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/user/profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = getUserObjectId(tokenUser.id);
    if (!userId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const result = await db.collection("users").updateOne(
      { _id: userId },
      {
        $set: {
          name: "Deleted Account",
          email: `deleted-${userId.toString()}@amstani.local`,
          phone: "",
          avatarUrl: "",
          addresses: [],
          paymentMethods: [],
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
        $unset: { password: "" },
      }
    );

    if (!result.matchedCount) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await Promise.all([
      db.collection("carts").deleteMany({ $or: [{ userId: tokenUser.id }, { userId }] }),
      db.collection("wishlists").deleteMany({ $or: [{ userId: tokenUser.id }, { userId }] }),
      db.collection("notifications").deleteMany({ $or: [{ userId: tokenUser.id }, { userId }] }),
    ]);

    const response = NextResponse.json({ message: "Account deleted" }, { status: 200 });
    response.cookies.set({
      name: "token",
      value: "",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("DELETE /api/user/profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
