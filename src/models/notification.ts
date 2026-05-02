import { ObjectId } from "mongodb";

export type Notification = {
  _id?: ObjectId;
  
  userId: ObjectId; // Refers to User (Admin, Owner, or Customer)
  
  title: string;
  message: string;
  
  type: "order_update" | "system_alert" | "claim_update" | "message";
  
  isRead: boolean;
  
  // Optional reference to a specific document (like an Order ID or Claim ID)
  referenceId?: ObjectId; 
  
  createdAt?: Date | string;
};
