import { NextRequest } from "next/server";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";
import { ObjectId } from "mongodb";

type Params = { params: Promise<{ storeId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const user = await getUserFromToken();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (user.role !== "admin" && user.role !== "owner") {
    return new Response("Forbidden", { status: 403 });
  }

  const afterParam = req.nextUrl.searchParams.get("after") ?? "";
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      const client = await clientPromise;
      const db = client.db(DB_NAME);

      const otherRole = user.role === "admin" ? "owner" : "admin";

      // Start polling from the message after `afterParam`, or from now if empty
      let lastId: ObjectId = afterParam ? new ObjectId(afterParam) : new ObjectId();
      let lastUpdateCheck = new Date();
      let lastTyping = false;

      const sleep = (ms: number) =>
        new Promise<void>((resolve) => {
          const t = setTimeout(resolve, ms);
          req.signal.addEventListener("abort", () => { clearTimeout(t); resolve(); }, { once: true });
        });

      while (!req.signal.aborted) {
        try {
          // New messages since lastId
          const newMessages = await db
            .collection("store_messages")
            .find({ storeId, _id: { $gt: lastId } })
            .sort({ _id: 1 })
            .toArray();

          for (const msg of newMessages) {
            const id = (msg._id as ObjectId);
            send({
              type: "message",
              message: {
                _id: id.toString(),
                sender: msg.sender as string,
                senderName: msg.senderName as string,
                text: msg.text as string,
                createdAt: msg.createdAt,
                deleted: (msg.deleted as boolean) ?? false,
                edited: (msg.edited as boolean) ?? false,
                replyTo: msg.replyTo ?? undefined,
              },
            });
            lastId = id;
          }

          // Edited / deleted messages since last check
          const nowCheck = new Date();
          const updatedMessages = await db
            .collection("store_messages")
            .find({ storeId, updatedAt: { $gt: lastUpdateCheck } })
            .sort({ updatedAt: 1 })
            .toArray();
          lastUpdateCheck = nowCheck;

          for (const msg of updatedMessages) {
            send({
              type: "update",
              message: {
                _id: (msg._id as ObjectId).toString(),
                sender: msg.sender as string,
                senderName: msg.senderName as string,
                text: msg.text as string,
                createdAt: msg.createdAt,
                deleted: (msg.deleted as boolean) ?? false,
                edited: (msg.edited as boolean) ?? false,
                replyTo: msg.replyTo ?? undefined,
              },
            });
          }

          // Typing status from the other party
          const typingDoc = await db.collection("typing_events").findOne({
            storeId,
            typingBy: otherRole,
            updatedAt: { $gt: new Date(Date.now() - 4000) },
          });
          const isTyping = !!typingDoc;
          if (isTyping !== lastTyping) {
            lastTyping = isTyping;
            send({ type: "typing", isTyping });
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
