import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "./db";

type NotificationType = "order_update" | "system_alert" | "claim_update" | "message";

export async function createNotification({
  userId,
  title,
  message,
  type = "claim_update",
  referenceId,
}: {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  referenceId?: string;
}) {
  if (!userId || !ObjectId.isValid(userId)) return;
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    await db.collection("notifications").insertOne({
      userId: new ObjectId(userId),
      title,
      message,
      type,
      isRead: false,
      ...(referenceId && ObjectId.isValid(referenceId)
        ? { referenceId: new ObjectId(referenceId) }
        : {}),
      createdAt: new Date(),
    });
  } catch {
    // Notification failures must never block the primary operation
  }
}
