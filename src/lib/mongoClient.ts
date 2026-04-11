import { MongoClient } from "mongodb";

declare global {
  // _mongoClientPromise caches a single MongoDB connection promise.
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createMongoClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is required");
  }

  const client = new MongoClient(uri);
  return client.connect();
}

export function getMongoClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    // Avoid reconnecting on each hot reload in development.
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createMongoClientPromise();
    }
    return global._mongoClientPromise;
  }

  return createMongoClientPromise();
}

export default getMongoClientPromise;
