import type { Db } from "mongodb";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const LENGTH = 5;

function generate(): string {
  let id = "";
  for (let i = 0; i < LENGTH; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return id;
}

export async function uniqueStoreShortId(db: Db): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const id = generate();
    const exists = await db.collection("stores").findOne({ shortId: id }, { projection: { _id: 1 } });
    if (!exists) return id;
  }
  throw new Error("Failed to generate unique shortId after 10 attempts");
}
