"use client";

import { FormEvent, useEffect, useState } from "react";
import { Edit2, Search, Trash2 } from "lucide-react";

type Category = {
  _id: string;
  name: string;
  slug?: string;
  productCount?: number;
  source?: string;
  sizeVariables?: Array<{ name: string; label: string; isDefault?: boolean }>;
};

export default function CategoryTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.set("q", searchTerm.trim());
        const res = await fetch(`/api/admin/global-catalog/categories?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load categories");
          return;
        }
        setCategories((data.categories || []) as Category[]);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [searchTerm]);

  const saveCategory = async (event: FormEvent) => {
    event.preventDefault();
    if (!categoryName.trim()) return;

    const url = editingId ? `/api/admin/global-catalog/categories/${editingId}` : "/api/admin/global-catalog/categories";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save category");
        return;
      }

      const saved = data.category as Category;
      setCategories((prev) => editingId ? prev.map((category) => category._id === editingId ? saved : category) : [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryName("");
      setEditingId(null);
      setError("");
    } catch {
      setError("Failed to save category");
    }
  };

  const editCategory = (category: Category) => {
    setEditingId(category._id);
    setCategoryName(category.name);
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm("Delete this local category?")) return;

    try {
      const res = await fetch(`/api/admin/global-catalog/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to delete category");
        return;
      }
      setCategories((prev) => prev.filter((category) => category._id !== id));
    } catch {
      setError("Failed to delete category");
    }
  };

  return (
    <div className="rounded-xl bg-white px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] md:rounded-[26px] sm:px-4 sm:py-4 md:px-5 md:py-5">
      <form onSubmit={saveCategory} className="mb-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">{editingId ? "Edit Category" : "Add Category"}</h2>
        {error && <div className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="space-y-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Category</span>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Category name"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6FAFB3]"
            />
          </label>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 rounded-2xl bg-[#6FAFB3] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5da0a5]">
              {editingId ? "Save Category" : "Add Category"}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setCategoryName(""); }} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">All Categories</h2>
          <Search size={20} className="text-slate-500" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search categories..."
          className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6FAFB3]"
        />

        <div className="space-y-2">
          {loading && <div className="py-8 text-center text-slate-500">Loading categories...</div>}
          {!loading && categories.length === 0 && <div className="py-8 text-center text-slate-500">No categories found</div>}
          {categories.map((category) => (
            <div key={category._id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 transition hover:bg-slate-50">
              <div>
                <span className="text-sm font-medium text-slate-700">{category.name}</span>
                <p className="text-xs text-slate-400">
                  {category.productCount ?? 0} products · {(category.sizeVariables || []).length} size variables · {category.source || "local"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => editCategory(category)} className="text-slate-400 transition hover:text-slate-600" aria-label="Edit category">
                  <Edit2 size={18} />
                </button>
                <button type="button" onClick={() => deleteCategory(category._id)} className="text-slate-400 transition hover:text-red-600" aria-label="Delete category">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
