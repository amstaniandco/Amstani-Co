"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminNavbar from "../../../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../../../components/admin/AdminSidebar";

type ProductDetail = {
  _id: string;
  name: string;
  sku?: string;
  category?: string;
  price?: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  totalStock?: number;
  stock?: number;
  stockStatus?: string;
  status?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  description?: string;
  fullDescription?: string;
  imageUrls?: string[];
  brand?: { name?: string; slug?: string };
  categories?: Array<{ category?: { name?: string; slug?: string }; isPrimary?: boolean }>;
  variants?: Array<{ id?: string; size?: string; color?: string; stock?: number; stockQuantity?: number; skuVariant?: string; priceOverride?: number | null }>;
  sizeChart?: Array<{ id?: string; size?: string; measurements?: Record<string, string>; unit?: string }>;
  shipping?: { weight?: number | null; shippingClass?: string | null; dimensionL?: number | null; dimensionW?: number | null; dimensionH?: number | null } | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  source?: string;
  sourceProductId?: string;
};

export default function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [productId, setProductId] = useState("");
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      const resolved = await params;
      if (!mounted) return;
      setProductId(resolved.id);

      try {
        const res = await fetch(`/api/admin/global-catalog/products/${resolved.id}`);
        const data = await res.json();
        if (!mounted) return;

        if (!res.ok) {
          setError(data.error || "Failed to load product");
          return;
        }
        setProduct(data.product as ProductDetail);
      } catch {
        if (mounted) setError("Failed to load product");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [params]);

  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,#eef3f7_0%,#e8f1f5_42%,#f6fafb_100%)] px-2 py-2 text-slate-900 sm:px-4 sm:py-4 md:px-6 md:py-6">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 gap-3 md:gap-4 lg:grid-cols-[280px_1fr]">
        <AdminSidebar activePath="/admin/global-catalog" />

        <main className="rounded-xl border border-[#d8e0e6] bg-[#f7fafc] p-2 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:rounded-[28px] sm:p-3 md:p-4">
          <AdminNavbar />

          <section className="mt-3 rounded-xl bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] md:rounded-[26px] md:px-6 md:py-6">
            <Link href="/admin/global-catalog" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Back to Global Catalog
            </Link>

            {loading && <div className="text-sm text-slate-600">Loading product...</div>}
            {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            {product && (
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                  <div>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      {product.imageUrls?.[0] ? (
                        <img src={product.imageUrls[0]} alt={product.name} className="aspect-square w-full object-cover" />
                      ) : (
                        <div className="flex aspect-square items-center justify-center text-sm text-slate-500">No image</div>
                      )}
                    </div>
                    {!!product.imageUrls?.length && (
                      <div className="mt-3 grid grid-cols-5 gap-2">
                        {product.imageUrls.slice(0, 10).map((imageUrl) => (
                          <img key={imageUrl} src={imageUrl} alt="" className="aspect-square rounded-lg border border-slate-200 object-cover" />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-950">{product.name}</h1>
                        <p className="mt-1 text-sm text-slate-500">{product.sku || "-"} · {product.brand?.name || "No brand"}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {product.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <Metric label="Price" value={`$${(product.price ?? 0).toFixed(2)}`} />
                      <Metric label="Compare At" value={product.compareAtPrice == null ? "-" : `$${product.compareAtPrice.toFixed(2)}`} />
                      <Metric label="Stock" value={String(product.totalStock ?? product.stock ?? 0)} />
                      <Metric label="Category" value={product.category || "-"} />
                    </div>

                    <div className="mt-6">
                      <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">Description</h2>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{product.fullDescription || product.description || "-"}</p>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <InfoBlock title="Catalog">
                        <p>Source: {product.source || "admin"}</p>
                        <p>Source ID: {product.sourceProductId || productId}</p>
                        <p>Stock Status: {product.stockStatus || "-"}</p>
                        <p>Featured: {product.isFeatured ? "Yes" : "No"}</p>
                      </InfoBlock>
                      <InfoBlock title="Shipping">
                        <p>Weight: {product.shipping?.weight ?? "-"}</p>
                        <p>Class: {product.shipping?.shippingClass || "-"}</p>
                        <p>Dimensions: {[product.shipping?.dimensionL, product.shipping?.dimensionW, product.shipping?.dimensionH].map((v) => v ?? "-").join(" x ")}</p>
                      </InfoBlock>
                    </div>
                  </div>
                </div>

                <DetailTable
                  title="Variants"
                  headers={["Size", "Color", "Stock", "SKU Variant", "Price Override"]}
                  rows={(product.variants || []).map((variant) => [
                    variant.size || "-",
                    variant.color || "-",
                    String(variant.stock ?? variant.stockQuantity ?? 0),
                    variant.skuVariant || "-",
                    variant.priceOverride == null ? "-" : `$${variant.priceOverride.toFixed(2)}`,
                  ])}
                />

                <DetailTable
                  title="Size Chart"
                  headers={["Size", "Measurements", "Unit"]}
                  rows={(product.sizeChart || []).map((item) => [
                    item.size || "-",
                    Object.entries(item.measurements || {}).map(([key, value]) => `${key}: ${value}`).join(", ") || "-",
                    item.unit || "-",
                  ])}
                />

                <InfoBlock title="SEO">
                  <p>Title: {product.seoTitle || "-"}</p>
                  <p>Description: {product.seoDescription || "-"}</p>
                </InfoBlock>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
      <h2 className="mb-2 text-sm font-bold uppercase tracking-[0.12em] text-slate-500">{title}</h2>
      {children}
    </div>
  );
}

function DetailTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
            <tr>{headers.map((header) => <th key={header} className="px-4 py-3">{header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length ? rows.map((row, index) => (
              <tr key={`${title}-${index}`}>{row.map((cell, cellIndex) => <td key={`${title}-${index}-${cellIndex}`} className="px-4 py-3 text-slate-700">{cell}</td>)}</tr>
            )) : (
              <tr><td className="px-4 py-3 text-slate-500" colSpan={headers.length}>No {title.toLowerCase()} found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
