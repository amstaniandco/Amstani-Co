import { ObjectId } from "mongodb";

export type StoreTimings = {
  open: string;  // e.g. "09:00"
  close: string; // e.g. "18:00"
  isClosed: boolean;
};

export type StoreSettings = {
  musicUrl?: string; // First applied track — kept for backward compatibility
  musicUrls?: string[]; // Ordered playlist of applied tracks (play one after another)
  themeColor?: string;
  languages?: string[]; // E.g. ["English", "Spanish"]
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
  
  shortId?: string;

  status: "pending" | "active" | "suspended" | "inactive";
  isLive?: boolean;
  liveLink?: string | null;
  liveSessionStartedAt?: Date | string | null;

  dailyTimings?: {
    from: string; // "09:00"
    to: string;   // "15:00"
  };

  warnings?: number;
  warningsResetAt?: Date | string | null;
  liveComplianceLastCheckedWeek?: string | null; // Monday date key for the last evaluated week
  liveComplianceEscalatedAt?: Date | string | null;

  createdAt?: Date | string;
  updatedAt?: Date | string;
};
