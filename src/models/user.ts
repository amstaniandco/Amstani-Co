export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "owner" | "admin";
  state?: string;
  createdAt?: string;
  updatedAt?: string;
};
