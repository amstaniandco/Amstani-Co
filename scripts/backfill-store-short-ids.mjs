import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env.local") });

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generate() {
  let id = "";
  for (let i = 0; i < 5; i++) id += CHARS[Math.floor(Math.random() * CHARS.length)];
  return id;
}

async function uniqueId(db) {
  for (let i = 0; i < 20; i++) {
    const id = generate();
    const exists = await db.collection("stores").findOne({ shortId: id });
    if (!exists) return id;
  }
  throw new Error("Could not generate unique shortId");
}

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DBNAME || "amstani");

const stores = await db.collection("stores").find({ shortId: { $exists: false } }).toArray();
console.log(`Found ${stores.length} stores without shortId`);

for (const store of stores) {
  const shortId = await uniqueId(db);
  await db.collection("stores").updateOne({ _id: store._id }, { $set: { shortId } });
  console.log(`  ${store.name || store._id} → #${shortId}`);
}

console.log("Done.");
await client.close();
