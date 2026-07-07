import { Db, ObjectId } from "mongodb";

export type BlockedUser = { id: string; name: string; avatarUrl: string };

/** Resolve blocked user ids into display info (name + avatar) for the owner's block list. */
export async function fetchBlockedUsers(db: Db, ids: ObjectId[]): Promise<BlockedUser[]> {
  if (!ids || ids.length === 0) return [];
  const users = await db
    .collection("users")
    .find({ _id: { $in: ids } }, { projection: { name: 1, avatarUrl: 1 } })
    .toArray();
  const byId = new Map(users.map((u) => [u._id.toString(), u]));
  // Preserve the block order; skip any ids that no longer resolve to a user.
  return ids
    .map((id) => {
      const u = byId.get(id.toString());
      if (!u) return null;
      return { id: id.toString(), name: (u.name as string) ?? "User", avatarUrl: (u.avatarUrl as string) ?? "" };
    })
    .filter((u): u is BlockedUser => u !== null);
}
