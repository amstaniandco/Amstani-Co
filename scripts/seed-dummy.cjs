/* Seed a dummy admin + a dummy store (with its owner) into local MongoDB.
   Matches the exact shapes the app uses (bcrypt passwords, roles, links).
   Idempotent: re-running upserts the same accounts. Safe to delete. */
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017/amstani";
const DB_NAME = process.env.MONGODB_DBNAME || "amstani";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function genShort() {
  let id = "";
  for (let i = 0; i < 5; i++) id += CHARS[Math.floor(Math.random() * CHARS.length)];
  return id;
}
async function uniqueShortId(db) {
  for (let i = 0; i < 20; i++) {
    const id = genShort();
    if (!(await db.collection("stores").findOne({ shortId: id }))) return id;
  }
  throw new Error("Could not generate unique shortId");
}

function fullWeekTimings() {
  const day = { open: "09:00", close: "18:00", isClosed: false };
  return {
    monday: { ...day }, tuesday: { ...day }, wednesday: { ...day },
    thursday: { ...day }, friday: { ...day }, saturday: { ...day },
    sunday: { open: "10:00", close: "16:00", isClosed: false },
  };
}

(async () => {
  const client = await MongoClient.connect(URI, { serverSelectionTimeoutMS: 10000 });
  const db = client.db(DB_NAME);
  const users = db.collection("users");
  const stores = db.collection("stores");
  const now = new Date();

  // ---------- Credentials ----------
  const ADMIN = { name: "Dummy Admin", email: "admin@amstani.test", password: "admin123" };
  const OWNER = { name: "Dummy Owner", email: "owner@amstani.test", password: "owner123" };

  // ---------- 1) Admin ----------
  const adminHash = await bcrypt.hash(ADMIN.password, 10);
  await users.updateOne(
    { email: ADMIN.email },
    {
      $set: {
        name: ADMIN.name,
        email: ADMIN.email,
        password: adminHash,
        role: "admin",
        state: "California",
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );
  const admin = await users.findOne({ email: ADMIN.email });

  // ---------- 2) Owner user ----------
  const ownerHash = await bcrypt.hash(OWNER.password, 10);
  await users.updateOne(
    { email: OWNER.email },
    {
      $set: {
        name: OWNER.name,
        email: OWNER.email,
        password: ownerHash,
        role: "owner",
        state: "California",
        phone: "+1 555 0100",
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );
  const owner = await users.findOne({ email: OWNER.email });
  const ownerId = owner._id;

  // ---------- 3) Store ----------
  const existingStore = await stores.findOne({ ownerId });
  const shortId = existingStore?.shortId || (await uniqueShortId(db));
  await stores.updateOne(
    { ownerId },
    {
      $set: {
        ownerId,
        name: "Dummy Store",
        description: "A dummy store seeded for local development and testing.",
        logoUrl: "",
        bannerUrl: "",
        status: "active",
        isLive: false,
        shortId,
        timings: fullWeekTimings(),
        dailyTimings: { from: "09:00", to: "18:00" },
        settings: { themeColor: "#56aebb", languages: ["English"] },
        warnings: 0,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );
  const store = await stores.findOne({ ownerId });

  // Link owner -> store
  await users.updateOne({ _id: ownerId }, { $set: { storeId: store._id, updatedAt: now } });

  console.log(JSON.stringify({
    admin: { id: admin._id.toString(), email: ADMIN.email, password: ADMIN.password, role: "admin" },
    owner: { id: owner._id.toString(), email: OWNER.email, password: OWNER.password, role: "owner" },
    store: { id: store._id.toString(), name: store.name, shortId: store.shortId, status: store.status },
  }, null, 2));

  await client.close();
})().catch((e) => { console.error("SEED FAILED:", e.message); process.exit(1); });
