import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";
import { fetchBlockedUsers } from "../../../../../lib/blockedUsers";

type Params = { params: Promise<{ storeId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const user = await getUserFromToken();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (user.role !== "user" && user.role !== "owner") return new Response("Forbidden", { status: 403 });
  if (!ObjectId.isValid(storeId)) return new Response("Invalid storeId", { status: 400 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const storeObjectId = new ObjectId(storeId);

  const store = await db.collection("stores").findOne({ _id: storeObjectId });
  if (!store) return new Response("Store not found", { status: 404 });
  if (user.role === "owner" && (store.ownerId as ObjectId)?.toString() !== user.id) {
    return new Response("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();
  const afterParam = req.nextUrl.searchParams.get("after") ?? "";
  const mapMessage = (message: Record<string, unknown>) => ({
    _id: (message._id as ObjectId).toString(),
    sender: message.senderRole,
    senderName: message.senderName,
    senderId: (message.senderId as ObjectId)?.toString(),
    senderAvatarUrl: (message.senderAvatarUrl as string | undefined) ?? undefined,
    reactions: (message.reactions as Record<string, string[]> | undefined) ?? {},
    text: message.content,
    createdAt: message.createdAt,
    deleted: (message.deleted as boolean) ?? false,
    edited: (message.edited as boolean) ?? false,
    replyTo: message.replyTo ?? undefined,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      let lastId = afterParam && ObjectId.isValid(afterParam) ? new ObjectId(afterParam) : new ObjectId();
      let lastUpdateCheck = new Date();
      let lastBlockedKey = "";
      const sleep = (ms: number) =>
        new Promise<void>((resolve) => {
          const t = setTimeout(resolve, ms);
          req.signal.addEventListener("abort", () => { clearTimeout(t); resolve(); }, { once: true });
        });

      while (!req.signal.aborted) {
        try {
          // Push the current block list whenever it changes so viewers can hide
          // blocked users' messages (and block the blocked user's send button) live.
          const storeDoc = await db.collection("stores").findOne(
            { _id: storeObjectId },
            { projection: { blockedUserIds: 1 } }
          );
          const blockedObjectIds = (storeDoc?.blockedUserIds as ObjectId[]) ?? [];
          const blockedUserIds = blockedObjectIds.map((id) => id.toString());
          const blockedKey = blockedUserIds.slice().sort().join(",");
          if (blockedKey !== lastBlockedKey) {
            lastBlockedKey = blockedKey;
            const blockedUsers = user.role === "owner" ? await fetchBlockedUsers(db, blockedObjectIds) : [];
            send({ type: "blocked", blockedUserIds, blockedUsers });
          }

          const messages = await db
            .collection("store_group_messages")
            .find({ storeId: storeObjectId, _id: { $gt: lastId } })
            .sort({ _id: 1 })
            .toArray();

          for (const message of messages) {
            const id = message._id as ObjectId;
            send({ type: "message", message: mapMessage(message) });
            lastId = id;
          }

          const nowCheck = new Date();
          const updatedMessages = await db
            .collection("store_group_messages")
            .find({ storeId: storeObjectId, updatedAt: { $gt: lastUpdateCheck } })
            .sort({ updatedAt: 1 })
            .toArray();
          lastUpdateCheck = nowCheck;

          for (const message of updatedMessages) {
            send({ type: "update", message: mapMessage(message) });
          }
        } catch {}

        await sleep(1200);
      }

      try { controller.close(); } catch {}
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
