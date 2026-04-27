"use client";

import { useState } from "react";
import { Edit2, Trash2, Search } from "lucide-react";

interface Brand {
  id: string;
  name: string;
}

export default function BrandsTab() {
  const [brands, setBrands] = useState<Brand[]>([
    { id: "1", name: "Name of the brand" },
    { id: "2", name: "Name of the brand" },
    { id: "3", name: "Name of the brand" },
    { id: "4", name: "Name of the brand" },
    { id: "5", name: "Name of the brand" },
    { id: "6", name: "Name of the brand" },
  ]);

  const [brandName, setBrandName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddBrand = () => {
    if (brandName.trim()) {
      setBrands([...brands, { id: Date.now().toString(), name: brandName }]);
      setBrandName("");
    }
  };

  const handleDeleteBrand = (id: string) => {
    setBrands(brands.filter((brand) => brand.id !== id));
  };

  const handleEditBrand = (id: string) => {
    // Edit functionality can be implemented later
    console.log("Edit brand:", id);
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rounded-xl md:rounded-[26px] bg-white px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-4 sm:py-4 md:px-5 md:py-5">
      {/* Add Brand Section */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Add Brand</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Brand name
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Placeholder"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6FAFB3]"
            />
          </div>

          <button
            onClick={handleAddBrand}
            className="w-full rounded-2xl bg-[#6FAFB3] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5da0a5]"
          >
            Add Brand
          </button>
        </div>
      </div>

      {/* All Brands Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">All Brands</h2>
          <Search size={20} className="text-slate-500" />
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search brands..."
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6FAFB3]"
          />
        </div>

        {/* Brands List */}
        <div className="space-y-2">
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brand) => (
              <div
                key={brand.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
              >
                <span className="text-sm text-slate-700">{brand.name}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEditBrand(brand.id)}
                    className="text-slate-400 transition hover:text-slate-600"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteBrand(brand.id)}
                    className="text-slate-400 transition hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              No brands found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
