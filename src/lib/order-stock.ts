import { ObjectId, type Db } from "mongodb";
import { reduceWholesaleStock } from "./wholesale-stock";

type OrderLine = {
  productId?: string;
  productSku?: string;
  sku?: string;
  quantity?: number;
  isCatalogProduct?: boolean;
  selectedVariants?: { size?: string; color?: string };
};

type StockOrder = {
  _id?: ObjectId;
  storeId?: string;
  items?: OrderLine[];
  stockSyncedAt?: Date;
};

export async function finalizeOrderStock(db: Db, orders: StockOrder[]) {
  const normalOperations: Array<{
    updateOne: {
      filter: Record<string, unknown>;
      update: { $inc: { quantity: number } };
    };
  }> = [];
  const catalogLines: Array<{
    sku?: string;
    variantSku?: string;
    size?: string;
    color?: string;
    quantity: number;
  }> = [];
  const syncedIds: ObjectId[] = [];

  for (const order of orders) {
    if (!order._id || order.stockSyncedAt) continue;
    for (const item of order.items ?? []) {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      if (item.isCatalogProduct) {
        catalogLines.push({
          sku: item.productSku ?? item.sku,
          variantSku: item.sku,
          size: item.selectedVariants?.size,
          color: item.selectedVariants?.color,
          quantity,
        });
      } else if (item.productId && order.storeId) {
        const storeId = ObjectId.isValid(order.storeId) ? [order.storeId, new ObjectId(order.storeId)] : [order.storeId];
        const productId = ObjectId.isValid(item.productId) ? [item.productId, new ObjectId(item.productId)] : [item.productId];
        normalOperations.push({
          updateOne: {
            filter: {
              storeId: { $in: storeId },
              productId: { $in: productId },
              quantity: { $gte: quantity },
            },
            update: { $inc: { quantity: -quantity } },
          },
        });
      }
    }
    syncedIds.push(order._id);
  }

  if (normalOperations.length) {
    const result = await db.collection("store_products").bulkWrite(normalOperations, { ordered: true });
    if (result.modifiedCount !== normalOperations.length) {
      throw new Error("One or more store product stock records could not be reduced.");
    }
  }
  if (catalogLines.length) await reduceWholesaleStock(catalogLines);
  if (syncedIds.length) {
    await db.collection("orders").updateMany(
      { _id: { $in: syncedIds } },
      { $set: { stockSyncedAt: new Date(), updatedAt: new Date() } },
    );
  }
}
