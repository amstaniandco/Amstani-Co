import Link from "next/link";

const CATEGORY_IMAGES: Record<string, string> = {
  tops: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop",
  bottoms: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&h=200&fit=crop",
  pants: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&h=200&fit=crop",
  jeans: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop",
  shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop",
  sneakers: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop",
  accessories: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=200&h=200&fit=crop",
  dresses: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=200&h=200&fit=crop",
  outerwear: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=200&h=200&fit=crop",
  jackets: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=200&h=200&fit=crop",
  bags: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop",
  others: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=200&fit=crop";

function getCategoryImage(name: string, imageUrl?: string): string {
  if (imageUrl) return imageUrl;
  const key = name.toLowerCase().trim();
  return CATEGORY_IMAGES[key] ?? FALLBACK_IMAGE;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  productCount?: number;
}

export default function CategoriesSection({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <section className="home-section mb-5">
      <h2 className="home-heading mb-3 text-[24px] font-extrabold leading-none text-[#0f172a] dark:text-slate-100 sm:text-[28px]">
        Browse by categories
      </h2>

      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => {
          const img = getCategoryImage(cat.name, cat.imageUrl);
          return (
            <Link
              key={cat._id}
              href={`/our-products?category=${encodeURIComponent(cat.slug || cat.name)}`}
              className="group relative min-w-[110px] flex-1 max-w-[180px] cursor-pointer overflow-hidden rounded-2xl sm:min-w-[130px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={cat.name}
                className="h-[130px] w-full object-cover brightness-75 group-hover:brightness-90 group-hover:scale-105 transition-all duration-300 sm:h-[155px]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <span className="absolute bottom-2.5 left-0 right-0 px-2 text-center text-[11px] font-bold text-white drop-shadow sm:text-xs">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
