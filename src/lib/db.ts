import { ObjectId, Document } from "mongodb";
import getMongoClientPromise from "./mongoClient";
import { User } from "../types";
import { hashPassword } from "./auth/authUtils";

const DB_NAME = process.env.MONGODB_DBNAME ?? "amstani";

interface UserDocument extends Document {
  _id: ObjectId;
  email: string;
  name: string;
  password: string;
  role: "admin" | "owner" | "user";
  state?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getUsers(): Promise<User[]> {
  const client = await getMongoClientPromise();
  const users = await client
    .db(DB_NAME)
    .collection<UserDocument>("users")
    .find()
    .toArray();
  return users.map(doc => ({
    _id: doc._id.toString(),
    id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    role: doc.role,
    state: doc.state,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));
}

export async function getUsersByRole(role: "admin" | "owner" | "user"): Promise<User[]> {
  const client = await getMongoClientPromise();
  const users = await client
    .db(DB_NAME)
    .collection<UserDocument>("users")
    .find({ role })
    .toArray();
  return users.map(doc => ({
    _id: doc._id.toString(),
    id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    role: doc.role,
    state: doc.state,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));
}

export async function getUserById(id: string): Promise<User | null> {
  const client = await getMongoClientPromise();
  try {
    const user = await client
      .db(DB_NAME)
      .collection<UserDocument>("users")
      .findOne({ _id: new ObjectId(id) });
    if (!user) return null;
    return {
      _id: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      state: user.state,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch {
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const client = await getMongoClientPromise();
    const user = await client
      .db(DB_NAME)
      .collection<UserDocument>("users")
      .findOne({ email: email.toLowerCase() });
    if (!user) return null;
    return {
      _id: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role,
      state: user.state,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
}

export async function createUser(
  email: string,
  name: string,
  password: string,
  role: "admin" | "owner" | "user" = "user",
  state?: string
): Promise<User> {
  try {
    const client = await getMongoClientPromise();
    const now = new Date();
    const nowISO = now.toISOString();
    const hashedPassword = await hashPassword(password);

    const result = await client.db(DB_NAME).collection("users").insertOne({
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      role,
      state: state || null,
      createdAt: nowISO,
      updatedAt: nowISO,
    });

    return {
      _id: result.insertedId.toString(),
      id: result.insertedId.toString(),
      email,
      name,
      role,
      state,
      createdAt: nowISO,
      updatedAt: nowISO,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function updateUserRole(
  userId: string,
  newRole: "admin" | "owner" | "user"
): Promise<User | null> {
  const client = await getMongoClientPromise();
  try {
    const result = await client
      .db(DB_NAME)
      .collection<UserDocument>("users")
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        {
          $set: {
            role: newRole,
            updatedAt: new Date().toISOString(),
          },
        },
        { returnDocument: "after" }
      );
    if (!result.value) return null;
    const user = result.value;
    return {
      _id: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch {
    return null;
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  const client = await getMongoClientPromise();
  try {
    const result = await client
      .db(DB_NAME)
      .collection<UserDocument>("users")
      .deleteOne({ _id: new ObjectId(userId) });
    return result.deletedCount > 0;
  } catch {
    return false;
  }
}

export async function updateUser(id: string, update: Partial<Omit<User, "id">>) {
  const client = await getMongoClientPromise();
  await client
    .db(DB_NAME)
    .collection("users")
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...update, updatedAt: new Date() } });
  return getUserById(id);
}
