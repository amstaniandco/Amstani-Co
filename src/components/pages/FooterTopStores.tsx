import Link from "next/link";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../lib/db";

type TopStore = { id: string; name: string; state: string };

async function getTopStores(): Promise<TopStore[]> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const ranking = await db
      .collection("orders")
      .aggregate<{ _id: string }>([
        { $match: { paymentStatus: "Paid" } },
        { $group: { _id: { $toString: "$storeId" }, revenue: { $sum: "$total" } } },
        { $sort: { revenue: -1 } },
        { $limit: 4 },
      ])
      .toArray();

    if (!ranking.length) return [];

    const ids = ranking.map((r) => r._id);
    const oids = ids.flatMap((id) => {
      try { return [new ObjectId(id)]; } catch { return []; }
    });

    const stores = await db
      .collection("stores")
      .aggregate<{ _id: ObjectId; name: string; state: string }>([
        { $match: { _id: { $in: oids }, status: "active" } },
        {
          $lookup: {
            from: "users",
            localField: "ownerId",
            foreignField: "_id",
            as: "owner",
          },
        },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        { $project: { _id: 1, name: 1, state: "$owner.state" } },
      ])
      .toArray();

    return ids
      .map((id) => stores.find((s) => s._id.toString() === id))
      .filter((s): s is NonNullable<typeof s> => !!s && !!s.name)
      .map((s) => ({ id: s._id.toString(), name: s.name, state: s.state ?? "" }));
  } catch {
    return [];
  }
}

export default async function FooterTopStores() {
  const stores = await getTopStores();
  if (!stores.length) return null;

  return (
    <div>
      <h3 className="text-white font-semibold text-lg mb-5">Shop States</h3>
      <ul className="space-y-3 text-gray-400 text-sm">
        {stores.map((store) => (
          <li key={store.id}>
            <Link
              href={`/store?storeId=${store.id}`}
              className="hover:text-teal-400 transition"
            >
              {store.name}{store.state ? `, ${store.state}` : ""}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
