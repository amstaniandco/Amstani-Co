import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { requireAdminResponse } from "../../../../../lib/admin-catalog-taxonomy";

function deriveStatus(stockStatus: string | undefined, totalStock: number): "In Stock" | "Low Stock" | "Out of Stock" {
  const s = (stockStatus ?? "").toUpperCase();
  if (s === "OUT_OF_STOCK" || totalStock === 0) return "Out of Stock";
  if (s === "LOW_STOCK" || totalStock <= 10) return "Low Stock";
  return "In Stock";
}

export async function GET(req: Request) {
  try {
    const authError = await requireAdminResponse();
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const limit = Math.min(Number(searchParams.get("limit") ?? 100), 500);
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const skip = (page - 1) * limit;

    const query = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { sku: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } },
            { "brand.name": { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const client = await clientPromise;
    const collection = client.db(DB_NAME).collection("products");

    const [raw, total] = await Promise.all([
      collection
        .find(query, {
          projection: { sku: 1, name: 1, category: 1, totalStock: 1, stock: 1, stockStatus: 1, "brand.name": 1 },
        })
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    const rows = raw.map((p) => {
      const totalStock = p.totalStock ?? p.stock ?? 0;
      return {
        sku: p.sku ?? "—",
        product: p.name ?? "—",
        category: p.category ?? "—",
        brand: p.brand?.name ?? "—",
        stock: totalStock,
        status: deriveStatus(p.stockStatus, totalStock),
      };
    });

    return NextResponse.json({ rows, total, page, limit }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/finance-stock/inventory error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
