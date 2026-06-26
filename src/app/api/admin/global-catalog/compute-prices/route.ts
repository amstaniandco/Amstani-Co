import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";

// Single document in catalog_settings tracks the currently applied bulk
// adjustment so the admin UI can show "+10% applied" instead of a blank field.
const ADJUSTMENT_SETTINGS_ID = "global_price_adjustment";

// Returns the currently applied bulk price adjustment (or none).
export async function GET() {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const doc = await db
      .collection("catalog_settings")
      .findOne({ _id: ADJUSTMENT_SETTINGS_ID as unknown as never });

    return NextResponse.json({
      type: (doc?.type as "increase" | "decrease" | null) ?? null,
      percent: typeof doc?.percent === "number" ? doc.percent : 0,
      updatedAt: doc?.updatedAt ?? null,
    });
  } catch (error) {
    console.error("GET /api/admin/global-catalog/compute-prices error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Bulk-adjust every product's adminAdjustedPrice by a percentage.
// - increase: adminAdjustedPrice = price * (1 + percent/100)
// - decrease: adminAdjustedPrice = price * (1 - percent/100)
// - reset:    remove adminAdjustedPrice (falls back to original price everywhere)
// The original `price` (wholesale) is always preserved.
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

    // Only adjust published/active products — skip drafts, archived, and suspended brands/products.
    const products = await db
      .collection("products")
      .find({
        price: { $exists: true, $gt: 0 },
        isPublished: { $ne: false },
        status: { $nin: ["archived", "draft"] },
        brandSuspended: { $ne: true },
        isSuspended: { $ne: true },
      })
      .project({ _id: 1, price: 1, variants: 1 })
      .toArray();

    if (!products.length) {
      return NextResponse.json({ ok: true, updatedProducts: 0 });
    }

    const factor = type === "increase" ? 1 + percent / 100 : 1 - percent / 100;
    const round2 = (n: number) => Math.round(n * 100) / 100;

    type Variant = Record<string, unknown> & { priceOverride?: number | null; basePriceOverride?: number | null };

    // Re-scale any per-variant custom prices (priceOverride) by the same factor.
    // The untouched original is kept in basePriceOverride so reset can restore it.
    function adjustVariants(variants: Variant[] | undefined): Variant[] {
      if (!Array.isArray(variants)) return [];
      return variants.map((v) => {
        if (v.priceOverride == null && v.basePriceOverride == null) return v;
        const original = v.basePriceOverride ?? v.priceOverride ?? 0;
        // strip basePriceOverride; rebuild explicitly
        const rest: Variant = { ...v };
        delete rest.basePriceOverride;
        if (type === "reset") {
          return { ...rest, priceOverride: round2(Number(original)) };
        }
        return { ...rest, basePriceOverride: round2(Number(original)), priceOverride: round2(Number(original) * factor) };
      });
    }

    const bulkOps = products.map((p) => {
      const variants = adjustVariants(p.variants as Variant[] | undefined);
      const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;

      if (type === "reset") {
        return {
          updateOne: {
            filter: { _id: p._id },
            update: {
              $unset: { adminAdjustedPrice: "" },
              ...(hasVariants ? { $set: { variants } } : {}),
            },
          },
        };
      }
      const basePrice = Number(p.price) || 0;
      const adminAdjustedPrice = round2(basePrice * factor);
      return {
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { adminAdjustedPrice, ...(hasVariants ? { variants } : {}) } },
        },
      };
    });

    const result = await db.collection("products").bulkWrite(bulkOps, { ordered: false });

    // Clear non-customized store_products.sellingPrice so the new base price flows through.
    // (sellingPrice within ±1 cent of originalPrice = auto-set at listing, not manually changed.)
    const storePriceOps = products.map((p) => ({
      updateMany: {
        filter: {
          productId: p._id.toString(),
          $expr: { $lt: [{ $abs: { $subtract: ["$sellingPrice", "$originalPrice"] } }, 0.02] },
        },
        update: { $set: { sellingPrice: null } },
      },
    }));
    if (storePriceOps.length) {
      await db.collection("store_products").bulkWrite(storePriceOps, { ordered: false });
    }

    // Persist the current adjustment so the admin UI can display it. Each apply
    // is computed from the original price (not cumulative), so the last applied
    // value IS the current state. Reset clears it.
    if (type === "reset") {
      await db
        .collection("catalog_settings")
        .deleteOne({ _id: ADJUSTMENT_SETTINGS_ID as unknown as never });
    } else {
      await db.collection("catalog_settings").updateOne(
        { _id: ADJUSTMENT_SETTINGS_ID as unknown as never },
        { $set: { type, percent, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
    }

    return NextResponse.json({
      ok: true,
      updatedProducts: type === "reset" ? result.modifiedCount : products.length,
    });
  } catch (error) {
    console.error("POST /api/admin/global-catalog/compute-prices error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
