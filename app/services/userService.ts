import { getUsers, createUser } from "../libs/db";
import { User } from "../types";

export async function fetchUsers(): Promise<User[]> {
  return getUsers();
}

export async function addUser(user: Omit<User, "id">): Promise<User> {
  return createUser(user);
}
