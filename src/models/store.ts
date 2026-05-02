import { ObjectId } from "mongodb";

export type StoreTimings = {
  open: string;  // e.g. "09:00"
  close: string; // e.g. "18:00"
  isClosed: boolean;
};

export type StoreSettings = {
  musicUrl?: string; // For the owner music feature
  themeColor?: string;
};

export type Store = {
  _id?: ObjectId;
  ownerId: ObjectId; // Refers to User
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  
  timings?: {
    monday: StoreTimings;
    tuesday: StoreTimings;
    wednesday: StoreTimings;
    thursday: StoreTimings;
    friday: StoreTimings;
    saturday: StoreTimings;
    sunday: StoreTimings;
  };
  
  settings?: StoreSettings;
  
  status: "pending" | "active" | "suspended";
  
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
