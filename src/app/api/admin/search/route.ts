import { NextRequest, NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

export type SearchResult = {
  id: string;
  type: "store" | "user" | "product" | "brand" | "category" | "order" | "claim";
  title: string;
  subtitle?: string;
  href: string;
};

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const PER_TYPE = 6;

export async function GET(req: NextRequest) {
  const user = await getUserFromToken();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [], grouped: {} });

  const rx = { $regex: escapeRegex(q), $options: "i" };
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const [stores, users, products, brands, categories, orders, claims] = await Promise.all([
    db.collection("stores")
      .find({ name: rx }, { projection: { name: 1, status: 1 } })
      .limit(PER_TYPE).toArray(),
    db.collection("users")
      .find({ $or: [{ name: rx }, { email: rx }] }, { projection: { name: 1, email: 1, role: 1 } })
      .limit(PER_TYPE).toArray(),
    db.collection("products")
      .find({ $or: [{ name: rx }, { sku: rx }, { "brand.name": rx }, { brand: rx }, { category: rx }] },
        { projection: { name: 1, sku: 1, brand: 1 } })
      .limit(PER_TYPE).toArray(),
    db.collection("brands")
      .find({ name: rx }, { projection: { name: 1, productCount: 1 } })
      .limit(PER_TYPE).toArray(),
    db.collection("categories")
      .find({ name: rx }, { projection: { name: 1, productCount: 1 } })
      .limit(PER_TYPE).toArray(),
    db.collection("orders")
      .find({ $or: [{ orderNumber: rx }, { customerName: rx }, { customerEmail: rx }] },
        { projection: { orderNumber: 1, customerName: 1, total: 1, status: 1 } })
      .limit(PER_TYPE).toArray(),
    db.collection("claims")
      .find({ $or: [{ claimNumber: rx }, { customerName: rx }, { storeName: rx }] },
        { projection: { claimNumber: 1, customerName: 1, storeName: 1, status: 1 } })
      .limit(PER_TYPE).toArray(),
  ]);

  const results: SearchResult[] = [
    ...stores.map((s): SearchResult => ({
      id: s._id.toString(),
      type: "store",
      title: s.name ?? "Untitled store",
      subtitle: s.status ? `Status: ${s.status}` : undefined,
      href: `/admin/stores?highlight=${s._id.toString()}`,
    })),
    ...users.map((u): SearchResult => ({
      id: u._id.toString(),
      type: "user",
      title: u.name ?? "Unnamed user",
      subtitle: [u.email, u.role].filter(Boolean).join(" · "),
      href: `/admin/users?highlight=${u._id.toString()}`,
    })),
    ...products.map((p): SearchResult => {
      const brandName = typeof p.brand === "string" ? p.brand : p.brand?.name;
      return {
        id: p._id.toString(),
        type: "product",
        title: p.name ?? "Unnamed product",
        subtitle: [brandName, p.sku && `SKU ${p.sku}`].filter(Boolean).join(" · ") || undefined,
        href: `/admin/global-catalog/products/${p._id.toString()}`,
      };
    }),
    ...brands.map((b): SearchResult => ({
      id: b._id.toString(),
      type: "brand",
      title: b.name ?? "Unnamed brand",
      subtitle: typeof b.productCount === "number" ? `${b.productCount} products` : undefined,
      href: "/admin/global-catalog?tab=brands",
    })),
    ...categories.map((c): SearchResult => ({
      id: c._id.toString(),
      type: "category",
      title: c.name ?? "Unnamed category",
      subtitle: typeof c.productCount === "number" ? `${c.productCount} products` : undefined,
      href: "/admin/global-catalog?tab=category",
    })),
    ...orders.map((o): SearchResult => ({
      id: o._id.toString(),
      type: "order",
      title: o.orderNumber ?? "Order",
      subtitle: [o.customerName, o.status].filter(Boolean).join(" · "),
      href: "/admin/finance-stock",
    })),
    ...claims.map((c): SearchResult => ({
      id: c._id.toString(),
      type: "claim",
      title: c.claimNumber ?? "Claim",
      subtitle: [c.storeName, c.customerName, c.status].filter(Boolean).join(" · "),
      href: `/admin/claims?highlight=${c._id.toString()}`,
    })),
  ];

  const grouped: Record<string, SearchResult[]> = {};
  for (const r of results) (grouped[r.type] ??= []).push(r);

  return NextResponse.json({ results, grouped, total: results.length });
}
