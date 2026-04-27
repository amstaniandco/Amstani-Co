"use client";

import { useState } from "react";
import { Edit2, Trash2, Search } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

export default function CategoryTab() {
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "Name of the Category" },
    { id: "2", name: "Name of the Category" },
    { id: "3", name: "Name of the Category" },
    { id: "4", name: "Name of the Category" },
    { id: "5", name: "Name of the Category" },
    { id: "6", name: "Name of the Category" },
  ]);

  const [categoryName, setCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddCategory = () => {
    if (categoryName.trim()) {
      setCategories([
        ...categories,
        { id: Date.now().toString(), name: categoryName },
      ]);
      setCategoryName("");
    }
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id));
  };

  const handleEditCategory = (id: string) => {
    // Edit functionality can be implemented later
    console.log("Edit category:", id);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rounded-xl md:rounded-[26px] bg-white px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-4 sm:py-4 md:px-5 md:py-5">
      {/* Add Category Section */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Add Category</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Placeholder"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6FAFB3]"
            />
          </div>

          <button
            onClick={handleAddCategory}
            className="w-full rounded-2xl bg-[#6FAFB3] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5da0a5]"
          >
            Add Category
          </button>
        </div>
      </div>

      {/* All Categories Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">All Categories</h2>
          <Search size={20} className="text-slate-500" />
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6FAFB3]"
          />
        </div>

        {/* Categories List */}
        <div className="space-y-2">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
              >
                <span className="text-sm text-slate-700">{category.name}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEditCategory(category.id)}
                    className="text-slate-400 transition hover:text-slate-600"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-slate-400 transition hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              No categories found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
