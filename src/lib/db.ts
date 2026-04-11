import { ObjectId } from "mongodb";
import getMongoClientPromise from "./mongoClient";
import { User } from "../types";

const DB_NAME = process.env.MONGODB_DBNAME ?? "amstani";

export async function getUsers(): Promise<User[]> {
  const client = await getMongoClientPromise();
  const users = await client
    .db(DB_NAME)
    .collection<User>("users")
    .find()
    .toArray();
  return users;
}

export async function getUsersByRole(role: "admin" | "store" | "user") {
  const client = await getMongoClientPromise();
  return client
    .db(DB_NAME)
    .collection<User>("users")
    .find({ role })
    .toArray();
}

export async function getUserById(id: string): Promise<User | null> {
  const client = await getMongoClientPromise();
  return client
    .db(DB_NAME)
    .collection<User>("users")
    .findOne({ _id: new ObjectId(id) });
}

export async function createUser(user: Omit<User, "id">): Promise<User> {
  const client = await getMongoClientPromise();
  const now = new Date();
  const nowISO = now.toISOString();
  const result = await client.db(DB_NAME).collection("users").insertOne({
    ...user,
    role: user.role || "user",
    createdAt: nowISO,
    updatedAt: nowISO,
  });

  return {
    id: result.insertedId.toString(),
    ...user,
    createdAt: nowISO,
    updatedAt: nowISO,
  } as User;
}

export async function updateUser(id: string, update: Partial<Omit<User, "id">>) {
  const client = await getMongoClientPromise();
  await client
    .db(DB_NAME)
    .collection("users")
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...update, updatedAt: new Date() } });
  return getUserById(id);
}
