import type { Db } from "mongodb";
import { MONTHLY_IMPLEMENTATION_FEE_CENTS, STRIPE_CURRENCY } from "./stripe";

export const MONTHLY_IMPLEMENTATION_FEE_DESCRIPTION = "Monthly implementation and maintenance fee";

type StoreBillingFee = {
  storeId: string;
  period: string;
  type: "monthly_implementation_fee";
  amountCents: number;
  collectedCents: number;
  currency: string;
  status: "pending" | "partial" | "paid";
  description: string;
  deductions?: {
    orderId: string;
    paymentIntentId: string;
    amountCents: number;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date | null;
};

function billingPeriod(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function applyMonthlyImplementationFee(
  db: Db,
  params: {
    storeId: string;
    orderId: string;
    paymentIntentId: string;
    transferAmountCents: number;
    now?: Date;
  }
) {
  const now = params.now ?? new Date();
  const period = billingPeriod(now);
  const feeFilter = {
    storeId: params.storeId,
    period,
    type: "monthly_implementation_fee",
  } as const;

  await db.collection<StoreBillingFee>("store_billing_fees").updateOne(
    feeFilter,
    {
      $setOnInsert: {
        ...feeFilter,
        amountCents: MONTHLY_IMPLEMENTATION_FEE_CENTS,
        collectedCents: 0,
        currency: STRIPE_CURRENCY,
        status: "pending",
        description: MONTHLY_IMPLEMENTATION_FEE_DESCRIPTION,
        createdAt: now,
      },
      $set: { updatedAt: now },
    },
    { upsert: true }
  );

  const fee = await db.collection<StoreBillingFee>("store_billing_fees").findOne(feeFilter);
  const alreadyCollected = Number(fee?.collectedCents || 0);
  const remaining = Math.max(0, MONTHLY_IMPLEMENTATION_FEE_CENTS - alreadyCollected);
  const deductedCents = Math.min(Math.max(0, params.transferAmountCents), remaining);
  const netTransferCents = Math.max(0, params.transferAmountCents - deductedCents);

  if (deductedCents > 0) {
    const collectedCents = alreadyCollected + deductedCents;
    await db.collection<StoreBillingFee>("store_billing_fees").updateOne(
      feeFilter,
      {
        $set: {
          collectedCents,
          status: collectedCents >= MONTHLY_IMPLEMENTATION_FEE_CENTS ? "paid" : "partial",
          paidAt: collectedCents >= MONTHLY_IMPLEMENTATION_FEE_CENTS ? now : null,
          updatedAt: now,
        },
        $push: {
          deductions: {
            orderId: params.orderId,
            paymentIntentId: params.paymentIntentId,
            amountCents: deductedCents,
            createdAt: now,
          },
        },
      }
    );

    await db.collection("finance_ledger").insertOne({
      storeId: params.storeId,
      orderId: params.orderId,
      type: "platform_fee",
      amount: -(deductedCents / 100),
      amountCents: -deductedCents,
      currency: STRIPE_CURRENCY.toUpperCase(),
      status: "cleared",
      description: `${MONTHLY_IMPLEMENTATION_FEE_DESCRIPTION} (${period})`,
      paymentIntentId: params.paymentIntentId,
      createdAt: now,
      updatedAt: now,
    });
  }

  return {
    period,
    grossTransferCents: params.transferAmountCents,
    deductedCents,
    netTransferCents,
    remainingFeeCents: Math.max(0, remaining - deductedCents),
  };
}

export async function getMonthlyImplementationFeeStatus(db: Db, storeId: string, now = new Date()) {
  const period = billingPeriod(now);
  const fee = await db.collection<StoreBillingFee>("store_billing_fees").findOne({
    storeId,
    period,
    type: "monthly_implementation_fee",
  });
  const collectedCents = Number(fee?.collectedCents || 0);

  return {
    period,
    amountCents: MONTHLY_IMPLEMENTATION_FEE_CENTS,
    collectedCents,
    remainingCents: Math.max(0, MONTHLY_IMPLEMENTATION_FEE_CENTS - collectedCents),
    status: fee?.status || "pending",
  };
}
