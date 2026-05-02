import { ObjectId } from "mongodb";

export type FinanceLedger = {
  _id?: ObjectId;
  
  storeId: ObjectId; // Refers to Store
  orderId?: ObjectId;// Optional: Refers to Order if transaction is tied to a sale/refund
  
  type: "sale" | "payout" | "refund" | "platform_fee";
  
  amount: number; // Positive for incoming (sales), negative for outgoing/fees (payouts, platform fees)
  currency: string; // e.g. "USD"
  
  status: "pending" | "cleared" | "failed";
  
  description?: string;
  
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
