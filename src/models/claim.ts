import { ObjectId } from "mongodb";

export type ClaimMessage = {
  senderId: ObjectId; // Refers to User (Customer, Owner, or Admin)
  content: string;
  timestamp: Date | string;
};

export type Claim = {
  _id?: ObjectId;
  
  orderId: ObjectId;   // Refers to Order
  customerId: ObjectId;// Refers to User (Customer)
  storeId: ObjectId;   // Refers to Store
  
  reason: string;
  description: string;
  
  status: "open" | "resolved" | "admin_escalated";
  
  messages?: ClaimMessage[]; // Embedded messages for the claim resolution
  
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
