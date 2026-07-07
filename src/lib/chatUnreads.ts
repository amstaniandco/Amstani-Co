import { Db, ObjectId } from "mongodb";

export type ChatUnreads = {
  admin: number;
  group: number;
  /** chatId -> unread count for each 1:1 customer thread */
  customers: Record<string, number>;
  total: number;
};

const EMPTY: ChatUnreads = { admin: 0, group: 0, customers: {}, total: 0 };

/**
 * Unread message counts for a store owner, across all their chat threads:
 *  - admin  : messages from Super Admin (store_messages) after the owner last read
 *  - group  : customers' messages in the group chat after the owner last read
 *  - customers : per-thread unread 1:1 messages (tracked via the existing isRead flag)
 *
 * "Last read" for the admin and group threads is stored in the `chat_reads`
 * collection keyed by `${threadType}:${storeId}` for the owner's user id.
 */
export async function computeChatUnreads(db: Db, ownerId: string): Promise<ChatUnreads> {
  const store = await db.collection("stores").findOne(
    { ownerId: new ObjectId(ownerId) },
    { projection: { _id: 1 } }
  );
  if (!store) return EMPTY;

  const storeObjId = store._id as ObjectId;
  const storeIdStr = storeObjId.toString();
  const ownerObjId = new ObjectId(ownerId);

  const reads = await db
    .collection("chat_reads")
    .find({ userId: ownerObjId, threadKey: { $in: [`admin:${storeIdStr}`, `group:${storeIdStr}`] } })
    .toArray();
  const readMap = new Map(reads.map((r) => [r.threadKey as string, r.lastReadAt as Date]));
  const adminLastRead = readMap.get(`admin:${storeIdStr}`);
  const groupLastRead = readMap.get(`group:${storeIdStr}`);

  const adminFilter: Record<string, unknown> = { storeId: storeIdStr, sender: "admin" };
  if (adminLastRead) adminFilter.createdAt = { $gt: adminLastRead };

  const groupFilter: Record<string, unknown> = {
    storeId: storeObjId,
    senderRole: "customer",
    deleted: { $ne: true },
  };
  if (groupLastRead) groupFilter.createdAt = { $gt: groupLastRead };

  const [admin, group, customerRows] = await Promise.all([
    db.collection("store_messages").countDocuments(adminFilter),
    db.collection("store_group_messages").countDocuments(groupFilter),
    db
      .collection("customer_messages")
      .aggregate([
        { $match: { storeId: storeObjId, senderRole: "customer", isRead: false } },
        { $group: { _id: "$chatId", count: { $sum: 1 } } },
      ])
      .toArray(),
  ]);

  const customers: Record<string, number> = {};
  let customerTotal = 0;
  for (const row of customerRows) {
    const count = row.count as number;
    customers[(row._id as ObjectId).toString()] = count;
    customerTotal += count;
  }

  return { admin, group, customers, total: admin + group + customerTotal };
}
