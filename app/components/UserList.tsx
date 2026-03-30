"use client";

import { User } from "../types";

type Props = {
  users: User[];
};

export default function UserList({ users }: Props) {
  if (!users.length) return <p>No users found.</p>;

  return (
    <ul className="space-y-2">
      {users.map((user) => (
        <li key={user.id} className="rounded border p-3">
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm text-zinc-600">{user.email}</p>
        </li>
      ))}
    </ul>
  );
}
