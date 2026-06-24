import { ObjectId } from "mongodb";

export type LiveSession = {
  _id?: ObjectId;
  storeId: ObjectId;
  date: string;          // "22/03/2026"
  startedAt: Date;
  endedAt: Date;
  durationMinutes: number;
  warning: boolean;      // true if this session was shorter than 6 hours
  createdAt?: Date;
};
