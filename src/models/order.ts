import { ObjectId } from "mongodb";

export type OrderItem = {
  productId: ObjectId;
  name: string; // Snapshot of name at time of purchase
  price: number; // Snapshot of price at time of purchase
  quantity: number;
  selectedVariants?: Record<string, string>;
};

export type OrderTotals = {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

export type Order = {
  _id?: ObjectId;
  orderNumber: string; // e.g. "AMST-10024"
  
  customerId: ObjectId; // Refers to User
  storeId: ObjectId;    // Refers to Store
  
  items: OrderItem[];
  totals: OrderTotals;
  
  // Snapshots of addresses
  shippingAddress: any; // Type from User.Address
  billingAddress?: any; 
  
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  
  trackingNumber?: string;
  
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
