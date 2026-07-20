import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import type { StatePricingRule } from "../../../../lib/pricing-config";

const CONFIG_ID = "pricing_config";

export type TaxRateEntry = { name: string; rate: number };
export type ShippingBracket = { minKg: number; maxKg: number | null; ratePerKg: number };
export type { StatePricingRule };
export type PricingConfig = {
  taxRates: Record<string, TaxRateEntry>; // key = 2-letter state code
  markupPercent: number; // default markup limit, used when a store's state has no specific rule
  discountCap: number; // default discount cap, used when a store's state has no specific rule
  stateRules: Record<string, StatePricingRule>; // key = state name (see lib/us-states), per-state overrides
  // Wholesale-to-retail formula fields
  profitPercent: number;
  tariffPercent: number;
  generalShippingPerKg: number;
  shippingBrackets: ShippingBracket[];
};

export const DEFAULT_CONFIG: PricingConfig = {
  taxRates: {
    AL: { name: "Alabama", rate: 4.0 },
    AK: { name: "Alaska", rate: 0 },
    AZ: { name: "Arizona", rate: 5.6 },
    AR: { name: "Arkansas", rate: 6.5 },
    CA: { name: "California", rate: 8.25 },
    CO: { name: "Colorado", rate: 2.9 },
    CT: { name: "Connecticut", rate: 6.35 },
    DE: { name: "Delaware", rate: 0 },
    FL: { name: "Florida", rate: 6.0 },
    GA: { name: "Georgia", rate: 4.0 },
    HI: { name: "Hawaii", rate: 4.0 },
    ID: { name: "Idaho", rate: 6.0 },
    IL: { name: "Illinois", rate: 6.25 },
    IN: { name: "Indiana", rate: 7.0 },
    IA: { name: "Iowa", rate: 6.0 },
    KS: { name: "Kansas", rate: 6.5 },
    KY: { name: "Kentucky", rate: 6.0 },
    LA: { name: "Louisiana", rate: 4.45 },
    ME: { name: "Maine", rate: 5.5 },
    MD: { name: "Maryland", rate: 6.0 },
    MA: { name: "Massachusetts", rate: 6.25 },
    MI: { name: "Michigan", rate: 6.0 },
    MN: { name: "Minnesota", rate: 6.875 },
    MS: { name: "Mississippi", rate: 7.0 },
    MO: { name: "Missouri", rate: 4.225 },
    MT: { name: "Montana", rate: 0 },
    NE: { name: "Nebraska", rate: 5.5 },
    NV: { name: "Nevada", rate: 6.85 },
    NH: { name: "New Hampshire", rate: 0 },
    NJ: { name: "New Jersey", rate: 6.625 },
    NM: { name: "New Mexico", rate: 5.0 },
    NY: { name: "New York", rate: 8.875 },
    NC: { name: "North Carolina", rate: 4.75 },
    ND: { name: "North Dakota", rate: 5.0 },
    OH: { name: "Ohio", rate: 5.75 },
    OK: { name: "Oklahoma", rate: 4.5 },
    OR: { name: "Oregon", rate: 0 },
    PA: { name: "Pennsylvania", rate: 6.0 },
    RI: { name: "Rhode Island", rate: 7.0 },
    SC: { name: "South Carolina", rate: 6.0 },
    SD: { name: "South Dakota", rate: 4.5 },
    TN: { name: "Tennessee", rate: 7.0 },
    TX: { name: "Texas", rate: 6.25 },
    UT: { name: "Utah", rate: 6.1 },
    VT: { name: "Vermont", rate: 6.0 },
    VA: { name: "Virginia", rate: 5.3 },
    WA: { name: "Washington", rate: 6.5 },
    WV: { name: "West Virginia", rate: 6.0 },
    WI: { name: "Wisconsin", rate: 5.0 },
    WY: { name: "Wyoming", rate: 4.0 },
    DC: { name: "Washington D.C.", rate: 6.0 },
  },
  markupPercent: 20,
  discountCap: 20,
  stateRules: {},
  profitPercent: 0,
  tariffPercent: 0,
  generalShippingPerKg: 0,
  shippingBrackets: [],
};

export async function GET() {
  try {
    const client = await clientPromise;
    const doc = await client
      .db(DB_NAME)
      .collection("pricing_config")
      .findOne({ _id: CONFIG_ID as unknown as import("mongodb").ObjectId });

    if (!doc) return NextResponse.json(DEFAULT_CONFIG);

    // Merge saved rates over the full default set so every state always appears,
    // with any admin-saved overrides taking precedence.
    const config: PricingConfig = {
      taxRates: { ...DEFAULT_CONFIG.taxRates, ...(doc.taxRates ?? {}) },
      markupPercent: doc.markupPercent ?? DEFAULT_CONFIG.markupPercent,
      discountCap: doc.discountCap ?? DEFAULT_CONFIG.discountCap,
      stateRules: (doc.stateRules as Record<string, StatePricingRule>) ?? DEFAULT_CONFIG.stateRules,
      profitPercent: doc.profitPercent ?? DEFAULT_CONFIG.profitPercent,
      tariffPercent: doc.tariffPercent ?? DEFAULT_CONFIG.tariffPercent,
      generalShippingPerKg: doc.generalShippingPerKg ?? DEFAULT_CONFIG.generalShippingPerKg,
      shippingBrackets: (doc.shippingBrackets as ShippingBracket[]) ?? DEFAULT_CONFIG.shippingBrackets,
    };
    return NextResponse.json(config);
  } catch (error) {
    console.error("GET /api/admin/pricing-rules error:", error);
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body: Partial<PricingConfig> = await req.json();

    const update: Partial<PricingConfig & { updatedAt: Date }> = { updatedAt: new Date() };
    if (body.taxRates) update.taxRates = body.taxRates;
    if (typeof body.markupPercent === "number") update.markupPercent = Math.max(0, body.markupPercent);
    if (typeof body.discountCap === "number") update.discountCap = Math.max(0, Math.min(100, body.discountCap));
    if (body.stateRules && typeof body.stateRules === "object") {
      const sanitized: Record<string, StatePricingRule> = {};
      for (const [state, rule] of Object.entries(body.stateRules as Record<string, Partial<StatePricingRule>>)) {
        if (typeof rule?.markupPercent === "number" && typeof rule?.discountCap === "number") {
          sanitized[state] = {
            markupPercent: Math.max(0, rule.markupPercent),
            discountCap: Math.max(0, Math.min(100, rule.discountCap)),
          };
        }
      }
      update.stateRules = sanitized;
    }
    if (typeof body.profitPercent === "number") update.profitPercent = Math.max(0, body.profitPercent);
    if (typeof body.tariffPercent === "number") update.tariffPercent = Math.max(0, body.tariffPercent);
    if (typeof body.generalShippingPerKg === "number") update.generalShippingPerKg = Math.max(0, body.generalShippingPerKg);
    if (Array.isArray(body.shippingBrackets)) update.shippingBrackets = body.shippingBrackets;

    const client = await clientPromise;
    await client
      .db(DB_NAME)
      .collection("pricing_config")
      .updateOne(
        { _id: CONFIG_ID as unknown as import("mongodb").ObjectId },
        { $set: update },
        { upsert: true }
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/admin/pricing-rules error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
