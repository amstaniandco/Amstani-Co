import { ObjectId } from "mongodb";

export type ProductImage = {
  id?: string;
  imageUrl: string;
  alt?: string | null;
  isMain?: boolean;
  sortOrder?: number;
  createdAt?: Date | string;
};

export type ProductVariant = {
  id: string;
  size?: string;
  color?: string;
  sku: string;
  stock: number;
  priceModifier?: number;
  priceOverride?: number | null;
  stockQuantity?: number;
  skuVariant?: string;
  isCustomSize?: boolean;
};

export type ProductCategory = {
  categoryId?: string;
  isPrimary?: boolean;
  category: {
    id?: string;
    name: string;
    slug?: string;
  };
};

export type ProductSizeChart = {
  id?: string;
  size: string;
  measurements: Record<string, string>;
  unit: string;
};

export type ProductShipping = {
  productId?: string;
  weight?: number | null;
  dimensionL?: number | null;
  dimensionW?: number | null;
  dimensionH?: number | null;
  shippingClass?: string | null;
};

export type Product = {
  _id?: ObjectId;
  storeId?: ObjectId; // Refers to Store when listed by a local store

  // Source identifiers from the Supabase/Postgres catalog.
  sourceProductId?: string;
  source?: "supabase-postgres" | string;

  name: string;
  sku?: string;
  slug?: string;
  description: string;
  shortDescription?: string | null;
  fullDescription?: string;
  
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  
  stock: number; // Base stock if no variants, or total across variants
  stockStatus?: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK" | string;
  totalStock?: number;
  
  imageUrls?: string[]; // Simple URL array for local UI compatibility
  images: Array<string | ProductImage>; // Complete source image objects or simple URLs
  
  category: string;
  categories?: ProductCategory[];
  brand?: {
    id?: string;
    name: string;
    slug?: string;
  };
  tags?: string[];
  
  variants?: ProductVariant[];
  sizeChart?: ProductSizeChart[];
  shipping?: ProductShipping | null;
  
  status: "active" | "draft" | "archived";
  isFeatured?: boolean;
  isPublished?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  mainImage?: string | null;
  
  createdAt?: Date | string;
  updatedAt?: Date | string;
  copiedAt?: Date | string;
};
