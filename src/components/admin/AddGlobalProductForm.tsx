"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";

type Variant = {
  id: string;
  size: string;
  color: string;
  stock: string;
  skuVariant: string;
  priceOverride: string;
};

type SizeChartItem = {
  id: string;
  size: string;
  waist: string;
  height: string;
  length: string;
  width: string;
  unit: string;
};

type ProductFormState = {
  name: string;
  material: string;
  description: string;
  brand: string;
  sku: string;
  category: string;
  price: string;
  compareAtPrice: string;
  costPrice: string;
  totalStock: string;
  stockStatus: string;
  isFeatured: boolean;
  isPublished: boolean;
  imageUrls: string[];
  variants: Variant[];
  sizeChart: SizeChartItem[];
  weight: string;
  shippingClass: string;
  dimensionL: string;
  dimensionW: string;
  dimensionH: string;
  seoTitle: string;
  seoDescription: string;
};

type ProductResponse = {
  _id: string;
  name?: string;
  description?: string;
  fullDescription?: string;
  brand?: { name?: string };
  sku?: string;
  category?: string;
  price?: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  totalStock?: number;
  stock?: number;
  stockStatus?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  imageUrls?: string[];
  variants?: Array<{ id?: string; size?: string; color?: string; stock?: number; stockQuantity?: number; skuVariant?: string; priceOverride?: number | null }>;
  sizeChart?: Array<{ id?: string; size?: string; measurements?: Record<string, string>; unit?: string }>;
  shipping?: { weight?: number | null; shippingClass?: string | null; dimensionL?: number | null; dimensionW?: number | null; dimensionH?: number | null } | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

interface AddGlobalProductFormProps {
  onBack: () => void;
  productId?: string | null;
  onSaved?: () => void;
}

const emptyVariant = (): Variant => ({
  id: crypto.randomUUID(),
  size: "",
  color: "",
  stock: "",
  skuVariant: "",
  priceOverride: "",
});

const emptySizeChartItem = (): SizeChartItem => ({
  id: crypto.randomUUID(),
  size: "",
  waist: "",
  height: "",
  length: "",
  width: "",
  unit: "cm",
});

const initialForm: ProductFormState = {
  name: "",
  material: "",
  description: "",
  brand: "",
  sku: "",
  category: "",
  price: "",
  compareAtPrice: "",
  costPrice: "",
  totalStock: "",
  stockStatus: "IN_STOCK",
  isFeatured: false,
  isPublished: true,
  imageUrls: [],
  variants: [emptyVariant()],
  sizeChart: [emptySizeChartItem()],
  weight: "",
  shippingClass: "",
  dimensionL: "",
  dimensionW: "",
  dimensionH: "",
  seoTitle: "",
  seoDescription: "",
};

function numberOrNull(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formFromProduct(product: ProductResponse): ProductFormState {
  return {
    ...initialForm,
    name: product.name || "",
    description: product.fullDescription || product.description || "",
    brand: product.brand?.name || "",
    sku: product.sku || "",
    category: product.category || "",
    price: product.price == null ? "" : String(product.price),
    compareAtPrice: product.compareAtPrice == null ? "" : String(product.compareAtPrice),
    costPrice: product.costPrice == null ? "" : String(product.costPrice),
    totalStock: product.totalStock == null && product.stock == null ? "" : String(product.totalStock ?? product.stock),
    stockStatus: product.stockStatus || "IN_STOCK",
    isFeatured: product.isFeatured ?? false,
    isPublished: product.isPublished ?? true,
    imageUrls: product.imageUrls || [],
    variants:
      product.variants?.length
        ? product.variants.map((variant) => ({
            id: variant.id || crypto.randomUUID(),
            size: variant.size || "",
            color: variant.color || "",
            stock: variant.stock == null && variant.stockQuantity == null ? "" : String(variant.stock ?? variant.stockQuantity),
            skuVariant: variant.skuVariant || "",
            priceOverride: variant.priceOverride == null ? "" : String(variant.priceOverride),
          }))
        : [emptyVariant()],
    sizeChart:
      product.sizeChart?.length
        ? product.sizeChart.map((item) => ({
            id: item.id || crypto.randomUUID(),
            size: item.size || "",
            waist: item.measurements?.waist || "",
            height: item.measurements?.height || "",
            length: item.measurements?.length || "",
            width: item.measurements?.width || "",
            unit: item.unit || "cm",
          }))
        : [emptySizeChartItem()],
    weight: product.shipping?.weight == null ? "" : String(product.shipping.weight),
    shippingClass: product.shipping?.shippingClass || "",
    dimensionL: product.shipping?.dimensionL == null ? "" : String(product.shipping.dimensionL),
    dimensionW: product.shipping?.dimensionW == null ? "" : String(product.shipping.dimensionW),
    dimensionH: product.shipping?.dimensionH == null ? "" : String(product.shipping.dimensionH),
    seoTitle: product.seoTitle || "",
    seoDescription: product.seoDescription || "",
  };
}

export default function AddGlobalProductForm({ onBack, productId, onSaved }: AddGlobalProductFormProps) {
  const [form, setForm] = useState<ProductFormState>(initialForm);
  const [loading, setLoading] = useState(Boolean(productId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) {
      setForm(initialForm);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const res = await fetch(`/api/admin/global-catalog/products/${productId}`);
        const data = await res.json();
        if (!mounted) return;
        if (!res.ok) {
          setError(data.error || "Failed to load product");
          return;
        }
        setForm(formFromProduct(data.product as ProductResponse));
      } catch {
        if (mounted) setError("Failed to load product");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [productId]);

  const updateField = <K extends keyof ProductFormState>(field: K, value: ProductFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setError("");
    for (const file of files) {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: uploadData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Image upload failed");
        return;
      }
      setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, data.url].slice(0, 8) }));
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name,
      sku: form.sku,
      description: form.description,
      fullDescription: form.description,
      brand: form.brand ? { name: form.brand } : undefined,
      category: form.category,
      price: Number(form.price),
      compareAtPrice: numberOrNull(form.compareAtPrice),
      costPrice: numberOrNull(form.costPrice),
      totalStock: Number(form.totalStock || 0),
      stockStatus: form.stockStatus,
      isFeatured: form.isFeatured,
      isPublished: form.isPublished,
      status: form.isPublished ? "active" : "draft",
      imageUrls: form.imageUrls,
      images: form.imageUrls.map((imageUrl, index) => ({
        imageUrl,
        alt: form.name,
        isMain: index === 0,
        sortOrder: index,
      })),
      variants: form.variants
        .filter((variant) => variant.size || variant.color || variant.skuVariant || variant.stock)
        .map((variant) => ({
          id: variant.id,
          size: variant.size,
          color: variant.color,
          stock: Number(variant.stock || 0),
          skuVariant: variant.skuVariant,
          priceOverride: numberOrNull(variant.priceOverride),
          isCustomSize: false,
        })),
      sizeChart: form.sizeChart
        .filter((item) => item.size || item.waist || item.height || item.length || item.width)
        .map((item) => ({
          id: item.id,
          size: item.size || "Default",
          measurements: {
            waist: item.waist,
            height: item.height,
            length: item.length,
            width: item.width,
          },
          unit: item.unit,
        })),
      shipping: {
        weight: numberOrNull(form.weight),
        shippingClass: form.shippingClass || null,
        dimensionL: numberOrNull(form.dimensionL),
        dimensionW: numberOrNull(form.dimensionW),
        dimensionH: numberOrNull(form.dimensionH),
      },
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
      tags: form.material ? [form.material] : [],
    };

    try {
      const res = await fetch(`/api/admin/global-catalog/products${productId ? `/${productId}` : ""}`, {
        method: productId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save product");
        return;
      }
      onSaved?.();
      onBack();
    } catch {
      setError("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-2xl bg-white p-8 text-sm text-slate-600">Loading product...</div>;
  }

  return (
    <form onSubmit={submit} className="min-h-screen bg-gray-50 px-4 py-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-900"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:border-slate-300 hover:bg-slate-100">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </span>
        Back
      </button>

      <div className="mx-auto rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-gray-900">
          {productId ? "Edit Global Product" : "Add Global Product"}
        </h1>
        {error && <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <Section title="Basic Information">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block text-sm text-gray-600">Upload Images</label>
                <div className="flex flex-wrap gap-2">
                  {form.imageUrls.map((src) => (
                    <div key={src} className="group relative h-14 w-14 overflow-hidden rounded-lg border border-gray-200">
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => updateField("imageUrls", form.imageUrls.filter((item) => item !== src))}
                        className="absolute inset-0 hidden items-center justify-center bg-black/40 text-white group-hover:flex"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {form.imageUrls.length < 8 && (
                    <label className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-teal-400">
                      <Upload className="h-5 w-5 text-gray-400" />
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>
              <TextInput label="Title" value={form.name} onChange={(value) => updateField("name", value)} required />
              <TextInput label="Material" value={form.material} onChange={(value) => updateField("material", value)} />
            </div>
            <TextArea label="Description" value={form.description} onChange={(value) => updateField("description", value)} required />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextInput label="Brand" value={form.brand} onChange={(value) => updateField("brand", value)} />
            <TextInput label="SKU" value={form.sku} onChange={(value) => updateField("sku", value)} required />
            <TextInput label="Categories" value={form.category} onChange={(value) => updateField("category", value)} />
          </div>
        </Section>

        <Section title="Pricing & Inventory">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextInput label="Price (Rs)" type="number" value={form.price} onChange={(value) => updateField("price", value)} required />
            <TextInput label="Compare at Price (Rs)" type="number" value={form.compareAtPrice} onChange={(value) => updateField("compareAtPrice", value)} />
            <TextInput label="Cost Price (Rs)" type="number" value={form.costPrice} onChange={(value) => updateField("costPrice", value)} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput label="Total Stock" type="number" value={form.totalStock} onChange={(value) => updateField("totalStock", value)} />
            <SelectInput
              label="Stock Status"
              value={form.stockStatus}
              onChange={(value) => updateField("stockStatus", value)}
              options={[
                ["IN_STOCK", "In Stock"],
                ["LOW_STOCK", "Low Stock"],
                ["OUT_OF_STOCK", "Out of Stock"],
              ]}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <Checkbox label="Featured Product" checked={form.isFeatured} onChange={(value) => updateField("isFeatured", value)} />
            <Checkbox label="Publish Product" checked={form.isPublished} onChange={(value) => updateField("isPublished", value)} />
          </div>
        </Section>

        <Section title="Product Variants">
          <div className="mb-4 flex justify-end">
            <IconButton label="Add" onClick={() => updateField("variants", [...form.variants, emptyVariant()])} />
          </div>
          <div className="space-y-3">
            {form.variants.map((variant) => (
              <div key={variant.id} className="grid grid-cols-2 gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]">
                <TextInput label="Size" value={variant.size} onChange={(value) => setForm((prev) => ({ ...prev, variants: prev.variants.map((item) => item.id === variant.id ? { ...item, size: value } : item) }))} />
                <TextInput label="Color" value={variant.color} onChange={(value) => setForm((prev) => ({ ...prev, variants: prev.variants.map((item) => item.id === variant.id ? { ...item, color: value } : item) }))} />
                <TextInput label="Stock" type="number" value={variant.stock} onChange={(value) => setForm((prev) => ({ ...prev, variants: prev.variants.map((item) => item.id === variant.id ? { ...item, stock: value } : item) }))} />
                <TextInput label="SKU Variant" value={variant.skuVariant} onChange={(value) => setForm((prev) => ({ ...prev, variants: prev.variants.map((item) => item.id === variant.id ? { ...item, skuVariant: value } : item) }))} />
                <TextInput label="Price Override" type="number" value={variant.priceOverride} onChange={(value) => setForm((prev) => ({ ...prev, variants: prev.variants.map((item) => item.id === variant.id ? { ...item, priceOverride: value } : item) }))} />
                <RemoveButton onClick={() => updateField("variants", form.variants.filter((item) => item.id !== variant.id))} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Size Chart">
          <div className="mb-4 flex justify-end">
            <IconButton label="Add" onClick={() => updateField("sizeChart", [...form.sizeChart, emptySizeChartItem()])} />
          </div>
          <div className="space-y-3">
            {form.sizeChart.map((item) => (
              <div key={item.id} className="grid grid-cols-2 gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto]">
                {(["size", "waist", "height", "length", "width"] as const).map((field) => (
                  <TextInput
                    key={field}
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={item[field]}
                    onChange={(value) => setForm((prev) => ({ ...prev, sizeChart: prev.sizeChart.map((row) => row.id === item.id ? { ...row, [field]: value } : row) }))}
                  />
                ))}
                <SelectInput
                  label="Unit"
                  value={item.unit}
                  onChange={(value) => setForm((prev) => ({ ...prev, sizeChart: prev.sizeChart.map((row) => row.id === item.id ? { ...row, unit: value } : row) }))}
                  options={[["cm", "cm"], ["in", "inch"], ["mm", "mm"]]}
                />
                <RemoveButton onClick={() => updateField("sizeChart", form.sizeChart.filter((row) => row.id !== item.id))} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Shipping Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput label="Weight (Kg)" type="number" value={form.weight} onChange={(value) => updateField("weight", value)} />
            <TextInput label="Shipping Class" value={form.shippingClass} onChange={(value) => updateField("shippingClass", value)} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextInput label="Length" type="number" value={form.dimensionL} onChange={(value) => updateField("dimensionL", value)} />
            <TextInput label="Width" type="number" value={form.dimensionW} onChange={(value) => updateField("dimensionW", value)} />
            <TextInput label="Height" type="number" value={form.dimensionH} onChange={(value) => updateField("dimensionH", value)} />
          </div>
          <div className="mt-4 space-y-4">
            <TextInput label="SEO Title" value={form.seoTitle} onChange={(value) => updateField("seoTitle", value)} />
            <TextInput label="SEO Description" value={form.seoDescription} onChange={(value) => updateField("seoDescription", value)} />
          </div>
        </Section>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-teal-500 py-3 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-teal-600 active:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : productId ? "Save Product" : "Add Product"}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold tracking-wide text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 border-t border-gray-200 pt-8">
      <h2 className="mb-5 text-sm font-bold text-gray-800 underline underline-offset-2">{title}</h2>
      {children}
    </section>
  );
}

function TextInput({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-gray-600">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 transition placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-400"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-gray-600">{label}</span>
      <textarea
        value={value}
        required={required}
        rows={8}
        onChange={(event) => onChange(event.target.value)}
        className="h-full min-h-[180px] w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 transition placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-400"
      />
    </label>
  );
}

function SelectInput({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-gray-600">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400">
        {options.map(([optionValue, labelText]) => (
          <option key={optionValue} value={optionValue}>{labelText}</option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-teal-500 focus:ring-teal-400" />
      <span className="text-sm text-gray-600">{label}</span>
    </label>
  );
}

function IconButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-600">
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mt-6 inline-flex h-10 items-center justify-center rounded-lg text-red-400 transition-colors hover:text-red-600">
      <Trash2 className="h-5 w-5" />
    </button>
  );
}
