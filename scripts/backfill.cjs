const { MongoClient } = require("mongodb");

const MONGODB_URI = "mongodb://127.0.0.1:27017/amstani";
const MONGODB_DBNAME = "amstani";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function generate() {
  let id = "";
  for (let i = 0; i < 5; i++) id += CHARS[Math.floor(Math.random() * CHARS.length)];
  return id;
}

async function run() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DBNAME);
  const stores = await db.collection("stores").find({ shortId: { $exists: false } }).toArray();
  console.log("Stores without shortId:", stores.length);
  for (const store of stores) {
    let shortId, exists;
    do {
      shortId = generate();
      exists = await db.collection("stores").findOne({ shortId });
    } while (exists);
    await db.collection("stores").updateOne({ _id: store._id }, { $set: { shortId } });
    console.log("  " + (store.name || store._id) + " -> #" + shortId);
  }
  console.log("Done.");
  await client.close();
}

run().catch(console.error);
