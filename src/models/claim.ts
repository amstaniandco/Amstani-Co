export type ClaimMessage = {
  senderId: string;
  senderName: string;
  senderRole: "user" | "owner" | "admin";
  content: string;
  timestamp: Date | string;
};

export type ClaimItem = {
  productId: string;
  name: string;
  image?: string | null;
  price: number;
  quantity: number;
  variant?: string;
};

export type Claim = {
  _id?: string;
  claimNumber: string;

  orderId: string;
  customerId: string;
  customerName: string;
  storeId: string;
  storeName: string;

  reason: string;
  description: string;
  items: ClaimItem[];

  // awaiting_reorder = wrong item, customer must re-select the correct product
  status: "open" | "owner_responded" | "resolved" | "admin_escalated" | "awaiting_reorder";
  // exchange = wrong-item claim where the customer chose a different size/color of
  // the same product and we shipped a free replacement (no re-charge).
  resolutionType?:
    | "replacement"
    | "reorder"
    | "reorder_completed"
    | "exchange"
    | "pending_refund"
    | "other"
    | null;

  messages: ClaimMessage[];

  ownerLastActionAt?: Date | string | null;
  adminIntervened?: boolean;
  adminNote?: string;

  createdAt?: Date | string;
  updatedAt?: Date | string;
};
