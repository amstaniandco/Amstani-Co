import { NextResponse } from "next/server";
import { Db, ObjectId, WithId } from "mongodb";
import bcrypt from "bcryptjs";
import clientPromise, { DB_NAME } from "../../../lib/db";
import { getUserFromToken } from "../../../lib/auth";
import { User } from "../../../models/user";
import { Store } from "../../../models/store";

type StoreApplication = WithId<{
  applicant?: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  };
  status: string;
}>;

type StoreWithCardMedia = Store & {
  cardMediaUrl?: string;
};

function parseMessage(message: string | undefined) {
  if (!message) return { address: "", state: "" };
  const stateMatch = message.match(/State:\s*([^|]+)/i);
  const addressMatch = message.match(/Address:\s*(.*)$/i);
  return {
    state: stateMatch?.[1]?.trim() || "",
    address: addressMatch?.[1]?.trim() || "",
  };
}

async function findApprovedApplication(db: Db, user: User): Promise<StoreApplication | null> {
  return db.collection<StoreApplication>("store_applications").findOne({
    status: "approved_by_admin",
    "applicant.email": user.email,
  });
}

export async function GET() {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const user = await db.collection<User>("users").findOne(
      { _id: new ObjectId(tokenUser.id) },
      { projection: { password: 0 } }
    );

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.role === "admin") {
      return NextResponse.json({ eligible: false, reason: "Admins cannot submit store signup requests" }, { status: 403 });
    }

    const application = await findApprovedApplication(db, user);
    if (!application) {
      return NextResponse.json({
        eligible: false,
        reason: "Your store application has not been approved by admin yet",
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone ?? "",
          state: user.state ?? "",
        },
      });
    }

    const existingRequest = await db.collection("store_signup_requests").findOne({
      applicationId: application._id,
      userId: new ObjectId(tokenUser.id),
    });
    const store = await db.collection<StoreWithCardMedia>("stores").findOne({ ownerId: new ObjectId(tokenUser.id) });
    const parsed = parseMessage(application?.applicant?.message);

    return NextResponse.json({
      eligible: true,
      applicationId: application._id.toString(),
      status: existingRequest?.status ?? null,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone ?? application?.applicant?.phone ?? "",
        state: user.state ?? parsed.state ?? "",
        address: existingRequest?.userData?.address ?? parsed.address ?? "",
      },
      store: {
        name: store?.name ?? existingRequest?.storeData?.storeName ?? "",
        description: store?.description ?? existingRequest?.storeData?.storeDescription ?? "",
        logoUrl: store?.logoUrl ?? existingRequest?.storeData?.logoUrl ?? "",
        bannerUrl: store?.bannerUrl ?? existingRequest?.storeData?.bannerUrl ?? "",
        cardMediaUrl: store?.cardMediaUrl ?? existingRequest?.storeData?.cardMediaUrl ?? "",
      },
    });
  } catch (error) {
    console.error("GET /api/store-signup error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    if ((password || confirmPassword) && password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }
    if (password && password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const user = await db.collection<User>("users").findOne({ _id: new ObjectId(tokenUser.id) });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.role !== "user") {
      return NextResponse.json({ error: "Only regular users can submit store signup requests" }, { status: 403 });
    }
    if (email.trim().toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "Use the email that was approved by admin" }, { status: 403 });
    }

    const application = await findApprovedApplication(db, user);
    if (!application) {
      return NextResponse.json({ error: "Your store application has not been approved by admin yet" }, { status: 403 });
    }

    const now = new Date();
    const userUpdate: Record<string, unknown> = {
      name: fullName.trim(),
      email: user.email,
      phone: phoneNumber.trim(),
      state: state.trim(),
      updatedAt: now,
    };
    if (password) userUpdate.password = await bcrypt.hash(password, 10);

    await db.collection("users").updateOne(
      { _id: new ObjectId(tokenUser.id) },
      { $set: userUpdate }
    );

    const ownerId = new ObjectId(tokenUser.id);
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
      { applicationId: application._id, userId: ownerId },
      {
        $set: {
          applicationId: application._id,
          userId: ownerId,
          storeId,
          status: "pending",
          userData: {
            name: fullName.trim(),
            email: user.email,
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
