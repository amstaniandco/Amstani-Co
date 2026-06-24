import { Db } from "mongodb";
import { User } from "../models/user";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Looks up a user by email, case-insensitively. Emails have historically been
 * stored with whatever casing the user typed (not normalized), so a plain
 * equality match misses accounts like "Mohsin@gmail.com" when later code
 * normalizes the same address to lowercase.
 */
export async function findUserByEmail(db: Db, email: string): Promise<User | null> {
  const trimmed = email.trim();
  if (!trimmed) return null;

  return db.collection<User>("users").findOne({
    email: { $regex: `^${escapeRegex(trimmed)}$`, $options: "i" },
  });
}
