import { ObjectId } from "mongodb";

export type CartItem = {
  productId: ObjectId;
  quantity: number;
  selectedVariants?: Record<string, string>; // e.g. { size: "M", color: "Red" }
};

export type Cart = {
  _id?: ObjectId;
  userId: ObjectId; // Refers to User
  items: CartItem[];
  updatedAt: Date | string;
};
