export type UserRole = "admin" | "owner" | "user";

export type User = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  state?: string;
  createdAt?: string;
  updatedAt?: string;
};
