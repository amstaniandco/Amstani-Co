import { NextResponse } from "next/server";
import { ObjectId, WithId, Document } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

const CONFIG_ID = "pricing_config";

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const [store, config] = await Promise.all([
    db.collection("stores").findOne({ ownerId: new ObjectId(user.id) }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.collection("pricing_config").findOne({ _id: CONFIG_ID as any }),
  ]);

  if (!store) return NextResponse.json({ products: [], storeName: "", markupPercent: 20, discountCap: 20 });

  const markupPercent: number = config?.markupPercent ?? 20;
  const discountCap: number = config?.discountCap ?? 20;

  const products = await db
    .collection("store_products")
    .find({ storeId: store._id.toString() })
    .sort({ listedAt: -1 })
    .toArray();

  // Enrich with brand/category/description from global catalog
  const productIds = products
    .map((p) => { try { return new ObjectId(p.productId as string); } catch { return null; } })
    .filter(Boolean) as ObjectId[];

  const catalogDocs = productIds.length
    ? await db.collection("products")
        .find({ _id: { $in: productIds } })
        .project({ _id: 1, brand: 1, category: 1, description: 1 })
        .toArray()
    : [];

  const catalogMap = new Map(
    (catalogDocs as WithId<Document>[]).map((d) => [d._id.toString(), d])
  );

  const enriched = products.map((p) => {
    const cat = catalogMap.get(p.productId as string);
    return {
      ...p,
      brand: (cat?.brand as { name?: string } | undefined)?.name ?? null,
      category: (cat?.category as string | undefined) ?? null,
      description: (cat?.description as string | undefined) ?? null,
    };
  });

  return NextResponse.json({ products: enriched, storeName: store.name, markupPercent, discountCap });
}
