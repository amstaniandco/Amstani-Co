import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";
import {
  applyAdjustmentToProducts,
  clearStoredAdjustment,
  getStoredAdjustment,
  resetAdjustment,
  saveStoredAdjustment,
} from "../../../../../lib/price-adjustment";

// Returns the currently applied bulk price adjustment (or none).
export async function GET() {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const adjustment = await getStoredAdjustment(db);

    return NextResponse.json(adjustment);
  } catch (error) {
    console.error("GET /api/admin/global-catalog/compute-prices error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Bulk-adjust every product's adminAdjustedPrice by a percentage.
// - increase: adminAdjustedPrice = price * (1 + percent/100)
// - decrease: adminAdjustedPrice = price * (1 - percent/100)
// - reset:    remove adminAdjustedPrice (falls back to original price everywhere)
// The original `price` (wholesale) is always preserved. The applied percentage
// is persisted so it can be re-applied automatically after each Supabase sync.
export async function POST(req: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const type: "increase" | "decrease" | "reset" = body.type;
    const percent: number = Number(body.percent ?? 0);

    if (type !== "increase" && type !== "decrease" && type !== "reset") {
      return NextResponse.json({ error: "type must be increase, decrease, or reset" }, { status: 400 });
    }
    if (type !== "reset" && (isNaN(percent) || percent < 0)) {
      return NextResponse.json({ error: "percent must be >= 0" }, { status: 400 });
    }
    if (type === "decrease" && percent >= 100) {
      return NextResponse.json({ error: "decrease percent must be less than 100" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    if (type === "reset") {
      const modifiedCount = await resetAdjustment(db);
      await clearStoredAdjustment(db);
      return NextResponse.json({ ok: true, updatedProducts: modifiedCount });
    }

    const updatedProducts = await applyAdjustmentToProducts(db, type, percent);
    await saveStoredAdjustment(db, type, percent);

    return NextResponse.json({ ok: true, updatedProducts });
  } catch (error) {
    console.error("POST /api/admin/global-catalog/compute-prices error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
