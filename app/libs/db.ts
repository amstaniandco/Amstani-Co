// This is a stubbed database layer for full-stack app structure.
// Replace with real DB driver / ORM (Prisma, Mongoose, etc.) in production.

import { User } from "../types";

const users: User[] = [
  { id: "1", name: "Alice", email: "alice@example.com" },
  { id: "2", name: "Bob", email: "bob@example.com" },
];

export async function getUsers(): Promise<User[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(users), 120);
  });
}

export async function createUser(user: Omit<User, "id">): Promise<User> {
  const newUser = { id: String(Date.now()), ...user };
  users.push(newUser);
  return new Promise((resolve) => {
    setTimeout(() => resolve(newUser), 120);
  });
}
