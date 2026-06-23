"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Edit2, ImagePlus, Search, Trash2, X } from "lucide-react";
import { useConfirm } from "../global/ConfirmProvider";

type Category = {
  _id: string;
  name: string;
  slug?: string;
  imageUrl?: string;
  productCount?: number;
  source?: string;
  sizeVariables?: Array<{ name: string; label: string; isDefault?: boolean }>;
};

export default function CategoryTab() {
  const confirm = useConfirm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit modal state (kept separate so editing never touches the top "Add" form)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editUploading, setEditUploading] = useState(false);
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

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

  const uploadImage = async (
    event: ChangeEvent<HTMLInputElement>,
    setUrl: (url: string) => void,
    setBusy: (busy: boolean) => void,
    setErr: (msg: string) => void,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    setErr("");
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: uploadData });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Image upload failed");
        return;
      }
      setUrl(data.url);
    } catch {
      setErr("Image upload failed");
    } finally {
      setBusy(false);
    }
  };

  const addCategory = async (event: FormEvent) => {
    event.preventDefault();
    if (!categoryName.trim()) return;

    try {
      const res = await fetch("/api/admin/global-catalog/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName.trim(), imageUrl: categoryImage.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save category");
        return;
      }

      const saved = data.category as Category;
      setCategories((prev) => [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryName("");
      setCategoryImage("");
      setError("");
    } catch {
      setError("Failed to save category");
    }
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingId || !editName.trim()) return;

    setSaving(true);
    setEditError("");
    try {
      const res = await fetch(`/api/admin/global-catalog/categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), imageUrl: editImage.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "Failed to save category");
        return;
      }

      const saved = data.category as Category;
      setCategories((prev) => prev.map((category) => category._id === editingId ? saved : category));
      closeEdit();
    } catch {
      setEditError("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const editCategory = (category: Category) => {
    setEditingId(category._id);
    setEditName(category.name);
    setEditImage(category.imageUrl || "");
    setEditError("");
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditImage("");
    setEditError("");
  };

  const deleteCategory = async (id: string) => {
    if (!(await confirm("Delete this local category?"))) return;

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
      <form onSubmit={addCategory} className="mb-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Add Category</h2>
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
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">Cover photo</span>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {categoryImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={categoryImage} alt="Category cover" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <ImagePlus size={20} />
                  </div>
                )}
              </div>
              <label className="cursor-pointer rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                {uploading ? "Uploading…" : categoryImage ? "Change photo" : "Upload photo"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e, setCategoryImage, setUploading, setError)} disabled={uploading} />
              </label>
              {categoryImage && (
                <button type="button" onClick={() => setCategoryImage("")} className="text-sm font-semibold text-red-600 transition hover:text-red-700">
                  Remove
                </button>
              )}
            </div>
          </div>
          <button type="submit" className="w-full rounded-2xl bg-[#6FAFB3] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5da0a5]">
            Add Category
          </button>
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
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {category.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={category.imageUrl} alt={category.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <ImagePlus size={16} />
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-700">{category.name}</span>
                  <p className="text-xs text-slate-400">
                    {category.productCount ?? 0} products · {(category.sizeVariables || []).length} size variables · {category.source || "local"}
                  </p>
                </div>
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

      {/* Edit category modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={closeEdit}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Edit Category</h2>
              <button type="button" onClick={closeEdit} className="text-slate-400 transition hover:text-slate-600" aria-label="Close">
                <X size={20} />
              </button>
            </div>
            {editError && <div className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{editError}</div>}
            <form onSubmit={saveEdit} className="space-y-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Category</span>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Category name"
                  autoFocus
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6FAFB3]"
                />
              </label>
              <div>
                <span className="mb-2 block text-sm font-medium text-slate-700">Cover photo</span>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    {editImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={editImage} alt="Category cover" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <ImagePlus size={20} />
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    {editUploading ? "Uploading…" : editImage ? "Change photo" : "Upload photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e, setEditImage, setEditUploading, setEditError)} disabled={editUploading} />
                  </label>
                  {editImage && (
                    <button type="button" onClick={() => setEditImage("")} className="text-sm font-semibold text-red-600 transition hover:text-red-700">
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving} className="flex-1 rounded-2xl bg-[#6FAFB3] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5da0a5] disabled:opacity-60">
                  {saving ? "Saving…" : "Save Category"}
                </button>
                <button type="button" onClick={closeEdit} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
