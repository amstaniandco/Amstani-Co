import { ObjectId } from "mongodb";

export type Chat = {
  _id?: ObjectId;
  
  storeId: ObjectId;    // Refers to Store
  customerId: ObjectId; // Refers to User
  
  lastMessage?: string;
  
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type Message = {
  _id?: ObjectId;
  
  chatId: ObjectId;   // Refers to Chat
  senderId: ObjectId; // Refers to User (Owner or Customer)
  
  content: string;
  isRead: boolean;
  
  createdAt?: Date | string;
};
