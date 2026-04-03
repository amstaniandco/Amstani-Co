import { ObjectId } from "mongodb";
import clientPromise from "./mongoClient";
import { User } from "../types";

const DB_NAME = process.env.MONGODB_DBNAME ?? "amstani";

export async function getUsers(): Promise<User[]> {
  const client = await clientPromise;
  const users = await client
    .db(DB_NAME)
    .collection<User>("users")
    .find()
    .toArray();
  return users;
}

export async function getUsersByRole(role: "admin" | "store" | "user") {
  const client = await clientPromise;
  return client
    .db(DB_NAME)
    .collection<User>("users")
    .find({ role })
    .toArray();
}

export async function getUserById(id: string): Promise<User | null> {
  const client = await clientPromise;
  return client
    .db(DB_NAME)
    .collection<User>("users")
    .findOne({ _id: new ObjectId(id) });
}

export async function createUser(user: Omit<User, "id">): Promise<User> {
  const client = await clientPromise;
  const now = new Date();
  const result = await client.db(DB_NAME).collection("users").insertOne({
    ...user,
    role: user.role || "user",
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: result.insertedId.toString(),
    ...user,
    createdAt: now,
    updatedAt: now,
  } as User;
}

export async function updateUser(id: string, update: Partial<Omit<User, "id">>) {
  const client = await clientPromise;
  await client
    .db(DB_NAME)
    .collection("users")
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...update, updatedAt: new Date() } });
  return getUserById(id);
}
