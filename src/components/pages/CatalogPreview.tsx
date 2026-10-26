"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type PreviewProduct = {
  id: string;
  name: string;
  image: string | null;
  brand?: string | null;
};

function isFootwear(product: PreviewProduct & { category?: string | null; brand?: string | null }) {
  const text = [product.name, product.category, product.brand]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return /\b(shoe|shoes|sneaker|sneakers|boot|boots|sandal|sandals|slipper|slippers|loafer|loafers|heels?|footwear)\b/.test(text);
}

export default function CatalogPreview() {
  const [products, setProducts] = useState<PreviewProduct[]>([]);

  useEffect(() => {
    fetch("/api/catalog")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) =>
        setProducts(
          (data.products ?? [])
            .filter((product: PreviewProduct & { category?: string | null; brand?: string | null }) =>
              product.image && !isFootwear(product),
            )
            .slice(0, 2),
        ),
      )
      .catch(() => setProducts([]));
  }, []);

  if (!products.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="group relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-white/20 bg-[#16454b] shadow-[0_20px_45px_rgba(2,20,23,0.24)]"
        >
          <Image
            src={product.image!}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 45vw, 240px"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071f23]/75 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
            <p className="text-[9px] uppercase tracking-[0.18em] text-[#9bd8d2]">
              {product.brand ?? "Premium collection"}
            </p>
            <p className="mt-1 line-clamp-1 text-xs font-semibold">{product.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
