import { ObjectId } from "mongodb";

export type ProductVariant = {
  id: string;
  size?: string;
  color?: string;
  sku: string;
  stock: number;
  priceModifier?: number;
};

export type Product = {
  _id?: ObjectId;
  storeId: ObjectId; // Refers to Store
  name: string;
  description: string;
  
  price: number;
  compareAtPrice?: number;
  
  stock: number; // Base stock if no variants, or total across variants
  
  images: string[]; // Array of image URLs
  
  category: string;
  tags?: string[];
  
  variants?: ProductVariant[];
  
  status: "active" | "draft" | "archived";
  
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
