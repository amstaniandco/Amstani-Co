import { ObjectId } from "mongodb";

export type Wishlist = {
  _id?: ObjectId;
  userId: ObjectId; // Refers to User
  productIds: ObjectId[]; // Array of references to Products
  updatedAt?: Date | string;
};
