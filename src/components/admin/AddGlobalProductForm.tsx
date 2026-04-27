"use client";

import { ChangeEvent, useState } from "react";

interface Variant {
  id: number;
  sizeType: string;
  size: string;
  color: string;
  stock: string;
  skuVariant: string;
}

interface SizeCartItem {
  id: number;
  waist: string;
  height: string;
  length: string;
  width: string;
  unit: string;
}

interface AddGlobalProductFormProps {
  onBack: () => void;
}

export default function AddGlobalProductForm({
  onBack,
}: AddGlobalProductFormProps) {
  const [images, setImages] = useState<string[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState(false);
  const [publishProduct, setPublishProduct] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([
    { id: 1, sizeType: "", size: "", color: "", stock: "", skuVariant: "" },
  ]);
  const [sizeCart, setSizeCart] = useState<SizeCartItem[]>([
    { id: 1, waist: "", height: "", length: "", width: "", unit: "" },
  ]);

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: Date.now(),
        sizeType: "",
        size: "",
        color: "",
        stock: "",
        skuVariant: "",
      },
    ]);
  };

  const addSizeCartItem = () => {
    setSizeCart((prev) => [
      ...prev,
      {
        id: Date.now(),
        waist: "",
        height: "",
        length: "",
        width: "",
        unit: "",
      },
    ]);
  };

  const removeSizeCartItem = (id: number) => {
    setSizeCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...urls].slice(0, 8));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-900 mb-4"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:border-slate-300 hover:bg-slate-100">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </span>
        Back
      </button>
      <div className="mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">
          Add Global Product
        </h1>
        <hr className="border-gray-200 mb-8" />

        <section className="mb-8">
          <h2 className="text-sm font-bold text-gray-800 underline underline-offset-2 mb-5">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Upload Images
                </label>
                <div className="flex flex-wrap gap-2">
                  {images.map((src, i) => (
                    <div
                      key={i}
                      className="w-14 h-14 rounded-lg border border-gray-200 overflow-hidden"
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {images.length < 8 && (
                    <label className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-teal-400 transition-colors">
                      <span className="text-gray-400 text-xl leading-none">
                        +
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Placeholder"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  Material
                </label>
                <input
                  type="text"
                  placeholder="Placeholder"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Description
              </label>
              <textarea
                placeholder="Placeholder"
                rows={8}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition resize-none h-full min-h-[180px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Brand
              </label>
              <input
                type="text"
                placeholder="Placeholder"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">SKU</label>
              <input
                type="text"
                placeholder="Placeholder"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Categories
              </label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition bg-white">
                <option value="">Select Category</option>
                <option>Electronics</option>
                <option>Clothing</option>
                <option>Home & Garden</option>
                <option>Sports</option>
              </select>
            </div>
          </div>
        </section>

        <hr className="border-gray-200 mb-8" />

        <section className="mb-8">
          <h2 className="text-sm font-bold text-gray-800 underline underline-offset-2 mb-5">
            Pricing &amp; Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Price (Rs)
              </label>
              <input
                type="number"
                placeholder="Placeholder"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Compare at Price (Rs)
              </label>
              <input
                type="number"
                placeholder="Placeholder"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Cost Price (Rs)
              </label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition bg-white">
                <option value="">Select Category</option>
                <option>Fixed</option>
                <option>Variable</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Total Stock
              </label>
              <input
                type="number"
                placeholder="Placeholder"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Stock Status
              </label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition bg-white">
                <option value="">Select Category</option>
                <option>In Stock</option>
                <option>Out of Stock</option>
                <option>Pre-order</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={featuredProduct}
                onChange={(e) => setFeaturedProduct(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-400"
              />
              <span className="text-sm text-gray-600">Featured Product</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={publishProduct}
                onChange={(e) => setPublishProduct(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-400"
              />
              <span className="text-sm text-gray-600">Publish Product</span>
            </label>
          </div>
        </section>

        <hr className="border-gray-200 mb-8" />

        <section className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-gray-800 underline underline-offset-2">
              Product Variants
            </h2>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                  strokeWidth="2"
                />
                <path
                  strokeLinecap="round"
                  d="M12 8v8M8 12h8"
                  strokeWidth="2"
                />
              </svg>
              Add
            </button>
          </div>

          <div className="space-y-3">
            <div className="hidden sm:grid grid-cols-5 gap-3 text-xs text-gray-500 font-medium px-0.5">
              <span>Size Type</span>
              <span>Size</span>
              <span>Color (Optional)</span>
              <span>Stock</span>
              <span>SKU Variant</span>
            </div>

            {variants.map((v) => (
              <div key={v.id} className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <select
                  value={v.sizeType}
                  onChange={(e) =>
                    setVariants((prev) =>
                      prev.map((x) =>
                        x.id === v.id ? { ...x, sizeType: e.target.value } : x,
                      ),
                    )
                  }
                  className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                >
                  <option value="">Select</option>
                  <option>Alpha</option>
                  <option>Numeric</option>
                  <option>Custom</option>
                </select>
                <select
                  value={v.size}
                  onChange={(e) =>
                    setVariants((prev) =>
                      prev.map((x) =>
                        x.id === v.id ? { ...x, size: e.target.value } : x,
                      ),
                    )
                  }
                  className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                >
                  <option value="">Select</option>
                  <option>XS</option>
                  <option>S</option>
                  <option>M</option>
                  <option>L</option>
                  <option>XL</option>
                  <option>XXL</option>
                </select>
                <input
                  type="text"
                  placeholder="Enter"
                  value={v.color}
                  onChange={(e) =>
                    setVariants((prev) =>
                      prev.map((x) =>
                        x.id === v.id ? { ...x, color: e.target.value } : x,
                      ),
                    )
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <input
                  type="text"
                  placeholder="Enter"
                  value={v.stock}
                  onChange={(e) =>
                    setVariants((prev) =>
                      prev.map((x) =>
                        x.id === v.id ? { ...x, stock: e.target.value } : x,
                      ),
                    )
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <select
                  value={v.skuVariant}
                  onChange={(e) =>
                    setVariants((prev) =>
                      prev.map((x) =>
                        x.id === v.id
                          ? { ...x, skuVariant: e.target.value }
                          : x,
                      ),
                    )
                  }
                  className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                >
                  <option value="">Select</option>
                  <option>SKU-001</option>
                  <option>SKU-002</option>
                </select>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-gray-200 mb-8" />

        <section className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-gray-800 underline underline-offset-2">
              Size Cart
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Manage
              </button>
              <button
                type="button"
                onClick={addSizeCartItem}
                className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                    strokeWidth="2"
                  />
                  <path
                    strokeLinecap="round"
                    d="M12 8v8M8 12h8"
                    strokeWidth="2"
                  />
                </svg>
                Add
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="hidden sm:grid grid-cols-6 gap-3 text-xs text-gray-500 font-medium px-0.5">
              <span>Waist</span>
              <span>Height</span>
              <span>Length</span>
              <span>Width</span>
              <span>Unit</span>
              <span></span>
            </div>

            {sizeCart.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-3 sm:grid-cols-6 gap-3 items-center"
              >
                <input
                  type="text"
                  placeholder="Enter"
                  value={item.waist}
                  onChange={(e) =>
                    setSizeCart((prev) =>
                      prev.map((x) =>
                        x.id === item.id ? { ...x, waist: e.target.value } : x,
                      ),
                    )
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <input
                  type="text"
                  placeholder="Enter"
                  value={item.height}
                  onChange={(e) =>
                    setSizeCart((prev) =>
                      prev.map((x) =>
                        x.id === item.id ? { ...x, height: e.target.value } : x,
                      ),
                    )
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <input
                  type="text"
                  placeholder="Enter"
                  value={item.length}
                  onChange={(e) =>
                    setSizeCart((prev) =>
                      prev.map((x) =>
                        x.id === item.id ? { ...x, length: e.target.value } : x,
                      ),
                    )
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <input
                  type="text"
                  placeholder="Enter"
                  value={item.width}
                  onChange={(e) =>
                    setSizeCart((prev) =>
                      prev.map((x) =>
                        x.id === item.id ? { ...x, width: e.target.value } : x,
                      ),
                    )
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <select
                  value={item.unit}
                  onChange={(e) =>
                    setSizeCart((prev) =>
                      prev.map((x) =>
                        x.id === item.id ? { ...x, unit: e.target.value } : x,
                      ),
                    )
                  }
                  className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                >
                  <option value="">Select</option>
                  <option>cm</option>
                  <option>inch</option>
                  <option>mm</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeSizeCartItem(item.id)}
                  className="text-red-400 hover:text-red-600 transition-colors flex justify-center"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-gray-200 mb-8" />

        <section className="mb-8">
          <h2 className="text-sm font-bold text-gray-800 underline underline-offset-2 mb-5">
            Shipping Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Weight (Kg)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Shipping Class
              </label>
              <input
                type="text"
                placeholder="Enter"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Length
              </label>
              <input
                type="text"
                placeholder="Enter"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Width
              </label>
              <input
                type="text"
                placeholder="Enter"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Height
              </label>
              <input
                type="text"
                placeholder="Enter"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                SEO Title
              </label>
              <input
                type="text"
                placeholder="Enter"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                SEO Description
              </label>
              <input
                type="text"
                placeholder="Enter"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
              />
            </div>
          </div>
        </section>

        <div className="mb-2">
          <select className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white">
            <option value="">Select store ∨</option>
            <option>Store A</option>
            <option>Store B</option>
            <option>Store C</option>
          </select>
          <p className="text-xs text-gray-400 mt-1.5 italic">
            Select stores where you want to list the products directly. Leave
            empty to only list it in global inventory.
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button
            type="button"
            className="w-full bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm tracking-wide"
          >
            Add Product
          </button>
          <button
            type="button"
            className="w-full border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors text-sm tracking-wide"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
