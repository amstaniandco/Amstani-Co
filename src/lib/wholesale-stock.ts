import { Pool, type PoolClient } from "pg";

type StockLine = {
  sku?: string;
  variantSku?: string;
  size?: string;
  color?: string;
  quantity: number;
};

let pool: Pool | null = null;

function getPool() {
  const connectionString = process.env.SUPABASE_DATABASE_URL;
  if (!connectionString) throw new Error("SUPABASE_DATABASE_URL is not configured");
  pool ??= new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
  });
  return pool;
}

async function findProduct(client: PoolClient, sku: string) {
  const result = await client.query(
    `SELECT id, "totalStock" FROM product WHERE sku = $1 FOR UPDATE`,
    [sku],
  );
  return result.rows[0] as { id: string; totalStock: number } | undefined;
}

export async function getWholesaleStock(line: Omit<StockLine, "quantity">) {
  if (!line.sku) return null;
  const client = await getPool().connect();
  try {
    const product = await client.query(
      `SELECT id, "totalStock" FROM product WHERE sku = $1`,
      [line.sku],
    );
    const row = product.rows[0] as { id: string; totalStock: number } | undefined;
    if (!row) return null;
    return row.totalStock;
  } finally {
    client.release();
  }
}

export async function reduceWholesaleStock(lines: StockLine[]) {
  if (!lines.length) return;
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    for (const line of lines) {
      if (!line.sku) throw new Error("Catalog order item is missing its wholesale SKU");
      const quantity = Math.max(1, Number(line.quantity) || 1);
      const product = await findProduct(client, line.sku);
      if (!product) throw new Error(`Wholesale product not found for SKU ${line.sku}`);

      const result = await client.query(
        `UPDATE product
         SET "totalStock" = "totalStock" - $1,
             "stockStatus" = CASE
               WHEN "totalStock" - $1 <= 0 THEN 'OUT_OF_STOCK'::"StockStatus"
               WHEN "totalStock" - $1 < 10 THEN 'LOW_STOCK'::"StockStatus"
               ELSE 'IN_STOCK'::"StockStatus"
             END
         WHERE id = $2 AND "totalStock" >= $1
         RETURNING "totalStock"`,
        [quantity, product.id],
      );
      if (!result.rowCount) throw new Error(`Insufficient wholesale stock for SKU ${line.sku}`);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
