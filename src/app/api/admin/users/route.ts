import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { User } from "../../../../models/user";

export async function GET(req: Request) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() ?? "";
    const roleFilter = searchParams.get("role") ?? "all";

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const col = db.collection<User>("users");

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (roleFilter !== "all") {
      query.role = roleFilter;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [users, totalCount, userCount, ownerCount, adminCount, newThisMonth] =
      await Promise.all([
        col
          .find(query, { projection: { password: 0 } })
          .sort({ createdAt: -1 })
          .toArray(),
        col.countDocuments({}),
        col.countDocuments({ role: "user" }),
        col.countDocuments({ role: "owner" }),
        col.countDocuments({ role: "admin" }),
        col.countDocuments({ createdAt: { $gte: startOfMonth } }),
      ]);

    const serialized = users.map((u) => ({
      id: u._id!.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      state: u.state ?? "",
      phone: u.phone ?? "",
      avatarUrl: u.avatarUrl ?? "",
      createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : (u.createdAt ?? null),
    }));

    return NextResponse.json(
      {
        users: serialized,
        stats: { total: totalCount, users: userCount, owners: ownerCount, admins: adminCount, newThisMonth },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { userId, newRole } = await req.json();
    if (!userId || !newRole) return NextResponse.json({ error: "userId and newRole are required" }, { status: 400 });
    if (!["user", "owner", "admin"].includes(newRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (userId === tokenUser.id) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { role: newRole, updatedAt: new Date() } },
      { returnDocument: "after", projection: { password: 0 } }
    );

    if (!result) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user: { id: userId, role: newRole } }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
    if (userId === tokenUser.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const result = await db.collection("users").deleteOne({ _id: new ObjectId(userId) });
    if (result.deletedCount === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ message: "User deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
